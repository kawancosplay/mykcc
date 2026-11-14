import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.pending = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) {
            reject(new Error(msg.error.message || JSON.stringify(msg.error)));
          } else {
            resolve(msg.result);
          }
        }
      };
    });
  }

  send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error('Evaluation exception: ' + JSON.stringify(res.exceptionDetails));
    }
    return res.result?.value;
  }

  async screenshot(filePath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(filePath, buffer);
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

const AUDIT_FUNCTION = `
(function() {
  const _c = document.createElement('canvas');
  _c.width = 1;
  _c.height = 1;
  const _ctx = _c.getContext('2d', { willReadFrequently: true });

  function parseColor(str) {
    if (!str || str === 'transparent' || str === 'inherit' || str === 'rgba(0, 0, 0, 0)') return null;
    _ctx.clearRect(0, 0, 1, 1);
    try {
      _ctx.fillStyle = str;
      _ctx.fillRect(0, 0, 1, 1);
      const d = _ctx.getImageData(0, 0, 1, 1).data;
      if (d[3] === 0) return null;
      return { r: d[0], g: d[1], b: d[2], a: d[3] / 255 };
    } catch {
      return null;
    }
  }

  function composite(fg, bg) {
    const a = fg.a + bg.a * (1 - fg.a);
    if (a === 0) return { r: 255, g: 255, b: 255, a: 0 };
    return {
      r: Math.round((fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a),
      g: Math.round((fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a),
      b: Math.round((fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a),
      a: a,
    };
  }

  function getEffectiveBg(el) {
    let cur = el;
    const stack = [];
    while (cur && cur !== document.documentElement) {
      const style = window.getComputedStyle(cur);
      
      // 1. Check known button / accent classes with linear-gradients
      if (cur.classList) {
        if (cur.classList.contains('btn-primary') || cur.classList.contains('bg-purple-600') || cur.classList.contains('bg-violet-600')) {
          stack.unshift({ r: 124, g: 58, b: 237, a: 1.0 }); // #7C3AED
        } else if (cur.classList.contains('btn-secondary') || cur.classList.contains('bg-emerald-600')) {
          stack.unshift({ r: 16, g: 185, b: 129, a: 1.0 }); // emerald
        } else if (cur.classList.contains('btn-danger') || cur.classList.contains('bg-rose-600')) {
          stack.unshift({ r: 225, g: 29, b: 72, a: 1.0 }); // rose
        } else if (cur.classList.contains('glass-segment-thumb')) {
          stack.unshift({ r: 124, g: 58, b: 237, a: 1.0 });
        } else if (cur.classList.contains('glass-segment') && (cur.getAttribute('aria-selected') === 'true' || cur.getAttribute('aria-pressed') === 'true' || cur.getAttribute('aria-current') === 'page' || cur.dataset.active === 'true' || cur.classList.contains('is-active') || cur.querySelector('.glass-segment-thumb'))) {
          stack.unshift({ r: 124, g: 58, b: 237, a: 1.0 });
        }
      }

      // 2. Parse computed backgroundColor
      const bg = parseColor(style.backgroundColor);
      if (bg && bg.a > 0) {
        stack.unshift(bg);
      }

      // 3. Check linear-gradient backgroundImage
      const bgImg = style.backgroundImage;
      if (bgImg && bgImg.includes('gradient')) {
        const colorMatches = bgImg.match(/(?:oklch|oklab|rgba?)\([^)]+\)|#[0-9a-fA-F]{3,8}/g);
        if (colorMatches && colorMatches.length > 0) {
          const parsedGrad = parseColor(colorMatches[0]);
          if (parsedGrad && parsedGrad.a > 0) {
            stack.unshift(parsedGrad);
          }
        }
      }

      cur = cur.parentElement;
    }

    // Canvas background fallback (pastel frosted #F1F5F9)
    let blended = { r: 241, g: 245, b: 249, a: 1.0 };
    for (const c of stack) {
      blended = composite(c, blended);
    }
    return blended;
  }

  function luminance(c) {
    const a = [c.r, c.g, c.b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  function contrast(fg, bg) {
    const l1 = luminance(fg);
    const l2 = luminance(bg);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  const contrastIssues = [];
  const overflowIssues = [];
  const tapTargetIssues = [];

  // 1. Text Contrast Audit
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
  let el;
  while ((el = walker.nextNode())) {
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
    
    // Check if element has direct text content
    let hasDirectText = false;
    for (const child of el.childNodes) {
      if (child.nodeType === Node.TEXT_NODE && child.textContent.trim().length > 0) {
        hasDirectText = true;
        break;
      }
    }

    if (hasDirectText) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const fg = parseColor(style.color);
        if (fg) {
          const bg = getEffectiveBg(el);
          const ratio = contrast(fg, bg);
          const fontSize = parseFloat(style.fontSize);
          const isBold = parseInt(style.fontWeight, 10) >= 700 || style.fontWeight === 'bold';
          const isLarge = fontSize >= 24 || (fontSize >= 18.5 && isBold);
          const minRatio = isLarge ? 3.0 : 4.5;

          // Exclude aria-hidden icons, badges, disabled inputs
          const isAriaHidden = el.getAttribute('aria-hidden') === 'true' || el.closest('[aria-hidden="true"]');
          const isDisabled = el.hasAttribute('disabled') || el.closest('[disabled]');

          if (ratio < minRatio && !isAriaHidden && !isDisabled) {
            const textPreview = el.textContent.trim().slice(0, 40);
            contrastIssues.push({
              tag: el.tagName.toLowerCase(),
              className: (el.className || '').toString().slice(0, 50),
              text: textPreview,
              ratio: Math.round(ratio * 10) / 10,
              required: minRatio,
              fg: style.color,
              bg: 'rgb(' + bg.r + ',' + bg.g + ',' + bg.b + ')',
              fontSize: style.fontSize,
            });
          }
        }
      }
    }

    // 2. Horizontal Overflow Check on 390px (scrollWidth > clientWidth)
    if (!['HTML', 'BODY'].includes(el.tagName)) {
      const isPointerNone = style.pointerEvents === 'none' || el.closest('[style*="pointer-events: none"]');
      const isDecorative = el.classList.contains('ql-sheen') || el.classList.contains('ql-rim') || el.closest('.ql-sheen, .ql-rim');
      const isSrOnly = el.classList.contains('sr-only') || el.closest('.sr-only');
      const isInputControl = ['INPUT', 'TEXTAREA'].includes(el.tagName);
      if (!isPointerNone && !isDecorative && !isSrOnly && !isInputControl) {
        const overflowX = style.overflowX;
        // Check if element overflows its own client bounds
        if (el.scrollWidth > el.clientWidth + 3.5 && overflowX !== 'auto' && overflowX !== 'scroll' && overflowX !== 'hidden') {
          overflowIssues.push({
            tag: el.tagName.toLowerCase(),
            className: (el.className || '').toString().slice(0, 60),
            scrollWidth: el.scrollWidth,
            clientWidth: el.clientWidth,
          });
        }
      }
    }

    // 3. Tap targets (< 40px height for actionable controls)
    if (['button', 'select', 'input'].includes(el.tagName.toLowerCase()) || (el.tagName.toLowerCase() === 'a' && el.hasAttribute('href'))) {
      if (style.display !== 'none' && style.visibility !== 'hidden') {
        const isHiddenInput = el.tagName.toLowerCase() === 'input' && (el.type === 'hidden' || el.classList.contains('sr-only'));
        if (!isHiddenInput) {
          // If input is wrapped in a label, measure label rect
          let targetEl = el;
          if (el.tagName.toLowerCase() === 'input' && (el.type === 'radio' || el.type === 'checkbox')) {
            const parentLabel = el.closest('label');
            if (parentLabel) targetEl = parentLabel;
          }
          const targetRect = targetEl.getBoundingClientRect();
          if (targetRect.height > 0 && targetRect.height < 36 && targetRect.width < 36) {
            tapTargetIssues.push({
              tag: el.tagName.toLowerCase(),
              className: (el.className || '').toString().slice(0, 50),
              text: el.textContent.trim().slice(0, 30),
              height: Math.round(targetRect.height),
              width: Math.round(targetRect.width),
            });
          }
        }
      }
    }
  }

  const docScrollWidth = document.documentElement.scrollWidth;
  const docClientWidth = document.documentElement.clientWidth;

  return {
    docScrollWidth,
    docClientWidth,
    hasGlobalOverflow: docScrollWidth > docClientWidth + 1,
    contrastIssues: contrastIssues.slice(0, 20),
    totalContrastIssues: contrastIssues.length,
    overflowIssues: overflowIssues.slice(0, 10),
    totalOverflowIssues: overflowIssues.length,
    tapTargetIssues: tapTargetIssues.slice(0, 10),
    totalTapTargetIssues: tapTargetIssues.length,
  };
})()
`;

async function main() {
  const screenshotsDir = 'C:\\Users\\Sato\\Downloads\\MyKCC-notes\\mobile-check';
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank',
  ]);

  try {
    console.log('Connecting to Chrome CDP...');
    let version = null;
    for (let i = 0; i < 20; i++) {
      await sleep(500);
      try {
        version = await getJson('http://127.0.0.1:9222/json/version');
        if (version) break;
      } catch {}
    }

    if (!version) throw new Error('Chrome CDP failed on port 9222');
    console.log('Connected to', version.Browser);

    const targets = await getJson('http://127.0.0.1:9222/json');
    let pageTarget = targets.find((t) => t.type === 'page');
    if (!pageTarget) {
      pageTarget = await getJson('http://127.0.0.1:9222/json/new?http://localhost:3000');
    }

    const cdp = new CdpClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();
    console.log('CDP connected to page target');

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('DOM.enable');

    // 1. Set iPhone 390x844 mobile viewport
    console.log('\\n========================================');
    console.log('SETTING VIEWPORT TO IPHONE 390x844 (MOBILE)');
    console.log('========================================');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true,
      hasTouch: true,
    });
    await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true });

    // Navigate to local site
    console.log('Navigating to http://localhost:3000...');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000' });
    await sleep(2500);

    // VIEW A: Registration Form (top, fields, bottom)
    console.log('\\n--- AUDIT 1: Registration Form (Mobile 390x844) ---');
    await cdp.evaluate('window.scrollTo(0, 0)');
    await sleep(500);
    const regTopAudit = await cdp.evaluate(AUDIT_FUNCTION);
    console.log('Registration Top Audit:', JSON.stringify(regTopAudit, null, 2));
    await cdp.screenshot(path.join(screenshotsDir, '01-mobile-registration-top.png'));

    // Scroll to middle of form
    await cdp.evaluate('window.scrollTo(0, 600)');
    await sleep(500);
    const regMidAudit = await cdp.evaluate(AUDIT_FUNCTION);
    console.log('Registration Mid Audit: totalContrastIssues =', regMidAudit.totalContrastIssues, 'overflow =', regMidAudit.totalOverflowIssues);
    await cdp.screenshot(path.join(screenshotsDir, '02-mobile-registration-form-fields.png'));

    // Scroll to bottom of form
    await cdp.evaluate('window.scrollTo(0, document.body.scrollHeight)');
    await sleep(500);
    const regBottomAudit = await cdp.evaluate(AUDIT_FUNCTION);
    console.log('Registration Bottom Audit: totalContrastIssues =', regBottomAudit.totalContrastIssues, 'overflow =', regBottomAudit.totalOverflowIssues);
    await cdp.screenshot(path.join(screenshotsDir, '03-mobile-registration-bottom-submit.png'));

    // VIEW B: KCC ID Lookup Tab
    console.log('\\n--- AUDIT 2: KCC ID Lookup Tab (Mobile 390x844) ---');
    // Open mobile menu or click tab
    await cdp.evaluate(`
      (function() {
        // Find Card tab button in mobile menu or click navbar
        const btns = Array.from(document.querySelectorAll('button'));
        const cardBtn = btns.find(b => b.textContent && (b.textContent.includes('KTA') || b.textContent.includes('Pass') || b.textContent.includes('Card')));
        if (cardBtn) cardBtn.click();
      })()
    `);
    await sleep(1500);
    await cdp.evaluate('window.scrollTo(0, 0)');
    const cardAudit = await cdp.evaluate(AUDIT_FUNCTION);
    console.log('KCC ID Lookup Audit:', JSON.stringify(cardAudit, null, 2));
    await cdp.screenshot(path.join(screenshotsDir, '04-mobile-kcc-lookup.png'));

    // Open sample member card modal if possible
    console.log('\\n--- AUDIT 2b: Member Card Modal ---');
    await cdp.evaluate(`
      (function() {
        const openBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Buka'));
        if (openBtn) openBtn.click();
      })()
    `);
    await sleep(1000);
    await cdp.screenshot(path.join(screenshotsDir, '05-mobile-member-card-modal.png'));
    // Close modal if open
    await cdp.evaluate(`
      (function() {
        const closeBtn = document.querySelector('[aria-label="Tutup"], [aria-label="Close"], .glass-icon-button');
        if (closeBtn) closeBtn.click();
      })()
    `);
    await sleep(500);

    // VIEW C: Photo Gallery Tab
    console.log('\\n--- AUDIT 3: Photo Gallery Tab (Mobile 390x844) ---');
    await cdp.evaluate(`
      (function() {
        const btns = Array.from(document.querySelectorAll('button'));
        const galleryBtn = btns.find(b => b.textContent && (b.textContent.includes('Galeri') || b.textContent.includes('Gallery')));
        if (galleryBtn) galleryBtn.click();
      })()
    `);
    await sleep(1500);
    await cdp.evaluate('window.scrollTo(0, 0)');
    const galleryAudit = await cdp.evaluate(AUDIT_FUNCTION);
    console.log('Photo Gallery Audit:', JSON.stringify(galleryAudit, null, 2));
    await cdp.screenshot(path.join(screenshotsDir, '06-mobile-photo-gallery.png'));

    // VIEW D: Auth Modal (Sign In / Sign Up)
    console.log('\\n--- AUDIT 4: Auth Modal (Mobile 390x844) ---');
    await cdp.evaluate(`
      (function() {
        // Click mobile menu hamburger if closed, then login
        const menuBtn = document.querySelector('button[aria-label="Buka menu"], button[aria-label="Open menu"]');
        if (menuBtn) menuBtn.click();
      })()
    `);
    await sleep(500);
    await cdp.evaluate(`
      (function() {
        const loginBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && (b.textContent.includes('Masuk') || b.textContent.includes('Sign In') || b.textContent.includes('Login')));
        if (loginBtn) loginBtn.click();
      })()
    `);
    await sleep(1000);
    const authAudit = await cdp.evaluate(AUDIT_FUNCTION);
    console.log('Auth Modal Audit: totalContrastIssues =', authAudit.totalContrastIssues, 'overflow =', authAudit.totalOverflowIssues);
    await cdp.screenshot(path.join(screenshotsDir, '08-mobile-auth-modal.png'));

    // Close auth modal
    await cdp.evaluate(`
      (function() {
        const closeBtn = document.querySelector('.glass-sheet [aria-label="Tutup"], .glass-sheet [aria-label="Close"], .glass-sheet .glass-icon-button');
        if (closeBtn) closeBtn.click();
      })()
    `);
    await sleep(500);

    // VIEW E: Site Editor Modal
    console.log('\\n--- AUDIT 5: Site Editor Modal (Mobile 390x844) ---');
    await cdp.evaluate(`
      (function() {
        const editBtn = document.querySelector('[title*="Editor"], [aria-label*="Editor"], button[title*="Tampilan"]');
        if (editBtn) editBtn.click();
      })()
    `);
    await sleep(1000);
    const siteEditorAudit = await cdp.evaluate(AUDIT_FUNCTION);
    console.log('Site Editor Modal Audit: totalContrastIssues =', siteEditorAudit.totalContrastIssues, 'overflow =', siteEditorAudit.totalOverflowIssues);
    await cdp.screenshot(path.join(screenshotsDir, '09-mobile-site-editor-modal.png'));

    // Close site editor modal
    await cdp.evaluate(`
      (function() {
        const closeBtn = document.querySelector('.glass-sheet [aria-label="Tutup"], .glass-sheet [aria-label="Close"], .glass-sheet .glass-icon-button');
        if (closeBtn) closeBtn.click();
      })()
    `);
    await sleep(500);

    // VIEW F: Admin Dashboard Tab
    console.log('\\n--- AUDIT 6: Admin Dashboard (Mobile 390x844) ---');
    await cdp.evaluate('window.location.hash = "#admin"');
    await sleep(1500);
    const adminAudit = await cdp.evaluate(AUDIT_FUNCTION);
    console.log('Admin Dashboard Audit: totalContrastIssues =', adminAudit.totalContrastIssues, 'overflow =', adminAudit.totalOverflowIssues);
    await cdp.screenshot(path.join(screenshotsDir, '10-mobile-admin-dashboard.png'));

    // VIEW G: Desktop 1440x900 Overview
    console.log('\\n--- AUDIT 7: Desktop 1440x900 Overview ---');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
      hasTouch: false,
    });
    await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: false });
    await cdp.evaluate('window.location.hash = ""');
    await sleep(1500);
    const desktopAudit = await cdp.evaluate(AUDIT_FUNCTION);
    console.log('Desktop 1440x900 Audit: totalContrastIssues =', desktopAudit.totalContrastIssues, 'overflow =', desktopAudit.totalOverflowIssues);
    await cdp.screenshot(path.join(screenshotsDir, '11-desktop-1440x900-overview.png'));

    cdp.close();
    chrome.kill();
    console.log('\\nAudit complete! Screenshots saved to:', screenshotsDir);
  } catch (err) {
    chrome.kill();
    console.error('Audit script failed:', err);
    process.exit(1);
  }
}

main();
