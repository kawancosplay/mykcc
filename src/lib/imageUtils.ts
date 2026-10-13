/**
 * Client-side image compression for uploads. Photos and avatars are stored INLINE as data URLs in
 * Firestore (rules: members.avatarUrl <= 1,000,000 chars, memberCards.avatarUrl <= 400,000,
 * photos.photoUrl <= 1,000,000), and every reader re-downloads them, so they must stay small.
 *
 * - Decodes with createImageBitmap (EXIF orientation applied, off the main thread on Chromium), falling
 *   back to an <img> + object URL (never a FileReader data URL of the original: a 12 MP photo would sit in
 *   memory as a ~33 % larger base64 copy).
 * - Never upscales; large reductions are done in halving steps (no aliasing on small avatars).
 * - Encodes WebP when the browser can (checked on the blob type, because browsers without a WebP encoder
 *   silently return PNG), else JPEG at the same quality.
 * - Size guard: retries with lower quality (down to 0.5) and then a smaller side until the data URL fits
 *   `maxChars`; throws when it still does not fit, so a doc the rules would reject is never sent.
 * - Releases the bitmap and canvases right away (low-memory phones crash on repeated 12 MP decodes).
 */

export interface CompressImageOptions {
  /** Longest side in px after scaling (never upscaled). */
  maxSide: number;
  /** Encoder quality 0..1 (default 0.75). */
  quality?: number;
  /** Preferred output type (default 'image/webp'; JPEG is the fallback). */
  type?: 'image/webp' | 'image/jpeg';
  /** Max data-URL length (chars). Default: no limit. */
  maxChars?: number;
}

/** Gallery photos: long side 1600 px, stays well under the 1,000,000-char rule limit. */
export const PHOTO_COMPRESS: CompressImageOptions = { maxSide: 1600, quality: 0.75, maxChars: 900_000 };
/** Avatars (registration + profile): 256 px, ~10-15 KB; the public card limit is 400,000 chars. */
export const AVATAR_COMPRESS: CompressImageOptions = { maxSide: 256, quality: 0.75, maxChars: 120_000 };

const MIN_QUALITY = 0.5;
const MIN_SIDE = 160;

type Decoded = { source: CanvasImageSource; width: number; height: number; release: () => void };

async function decodeFile(file: Blob): Promise<Decoded> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
    } catch {
      // Older Safari (no options support) or an unsupported format: try the <img> path below.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    return {
      source: img,
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
      release: () => URL.revokeObjectURL(url),
    };
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not read the image.'));
    img.src = src;
  });
}

function releaseCanvas(canvas: HTMLCanvasElement): void {
  canvas.width = 0;
  canvas.height = 0;
}

/** Draws `source` at width x height, halving step by step when shrinking by more than 2x. */
function drawScaled(source: CanvasImageSource, srcW: number, srcH: number, width: number, height: number): HTMLCanvasElement {
  let current: CanvasImageSource = source;
  let curW = srcW;
  let curH = srcH;
  let stepCanvas: HTMLCanvasElement | null = null;

  while (curW / 2 >= width && curH / 2 >= height) {
    const nextW = Math.max(width, Math.round(curW / 2));
    const nextH = Math.max(height, Math.round(curH / 2));
    const next = document.createElement('canvas');
    next.width = nextW;
    next.height = nextH;
    const nctx = next.getContext('2d');
    if (!nctx) break;
    nctx.imageSmoothingEnabled = true;
    nctx.imageSmoothingQuality = 'high';
    nctx.drawImage(current, 0, 0, nextW, nextH);
    if (stepCanvas) releaseCanvas(stepCanvas);
    stepCanvas = next;
    current = next;
    curW = nextW;
    curH = nextH;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    if (stepCanvas) releaseCanvas(stepCanvas);
    throw new Error('Could not get canvas context');
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(current, 0, 0, width, height);
  if (stepCanvas) releaseCanvas(stepCanvas);
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    if (typeof canvas.toBlob !== 'function') {
      resolve(null);
      return;
    }
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Could not encode the image.'));
    reader.readAsDataURL(blob);
  });
}

/** WebP when the encoder exists (checked on the result), else JPEG. */
async function encode(canvas: HTMLCanvasElement, type: 'image/webp' | 'image/jpeg', quality: number): Promise<string> {
  if (type === 'image/webp') {
    const webp = await canvasToBlob(canvas, 'image/webp', quality);
    if (webp && webp.type === 'image/webp') return blobToDataUrl(webp);
  }
  const jpeg = await canvasToBlob(canvas, 'image/jpeg', quality);
  if (jpeg) return blobToDataUrl(jpeg);
  // Very old browsers without toBlob.
  return canvas.toDataURL('image/jpeg', quality);
}

function fitSize(width: number, height: number, maxSide: number): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxSide) return { width, height };
  const scale = maxSide / longest;
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

async function compressWithOptions(input: File | Blob | string, options: CompressImageOptions): Promise<string> {
  const type = options.type ?? 'image/webp';
  let quality = Math.min(1, Math.max(MIN_QUALITY, options.quality ?? 0.75));
  let maxSide = Math.max(1, Math.round(options.maxSide));
  const maxChars = options.maxChars ?? Infinity;

  const decoded =
    typeof input === 'string'
      ? await loadImage(input).then((img) => ({
          source: img as CanvasImageSource,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
          release: () => {},
        }))
      : await decodeFile(input);

  try {
    if (!decoded.width || !decoded.height) throw new Error('Could not read the image.');
    // Up to ~8 attempts: quality steps first (cheap), then a smaller side.
    for (let attempt = 0; attempt < 8; attempt++) {
      const size = fitSize(decoded.width, decoded.height, maxSide);
      const canvas = drawScaled(decoded.source, decoded.width, decoded.height, size.width, size.height);
      let dataUrl: string;
      try {
        dataUrl = await encode(canvas, type, quality);
      } finally {
        releaseCanvas(canvas);
      }
      if (dataUrl.length <= maxChars) return dataUrl;
      if (quality - 0.1 >= MIN_QUALITY - 1e-9) {
        quality = Math.round((quality - 0.1) * 100) / 100;
      } else {
        const nextSide = Math.round(Math.min(maxSide, Math.max(size.width, size.height)) * 0.8);
        if (nextSide < MIN_SIDE) break;
        maxSide = nextSide;
      }
    }
    throw new Error('The image is too large even after compression.');
  } finally {
    decoded.release();
  }
}

/**
 * Compresses an image file (or data URL) to a data URL.
 *   compressImage(file, { maxSide: 1600 })                  // preferred
 *   compressImage(file, PHOTO_COMPRESS) / (file, AVATAR_COMPRESS)
 *   compressImage(file, maxWidth, maxHeight, quality)       // legacy positional form (JPEG/WebP box fit)
 */
export function compressImage(input: File | Blob | string, options: CompressImageOptions): Promise<string>;
export function compressImage(input: File | Blob | string, maxWidth?: number, maxHeight?: number, quality?: number): Promise<string>;
export function compressImage(
  input: File | Blob | string,
  optionsOrMaxWidth: CompressImageOptions | number = 1200,
  maxHeight?: number,
  quality?: number,
): Promise<string> {
  if (typeof optionsOrMaxWidth === 'object') return compressWithOptions(input, optionsOrMaxWidth);
  return compressWithOptions(input, {
    maxSide: Math.min(optionsOrMaxWidth, maxHeight ?? optionsOrMaxWidth),
    quality: quality ?? 0.82,
  });
}
