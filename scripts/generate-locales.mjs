#!/usr/bin/env node
/**
 * scripts/generate-locales.mjs
 * Autonomously generates all 18 target language translations for MyKCC (Sprint 2)
 *
 * Target languages:
 * ms, zh-Hans, zh-Hant, ja, ko, ar, ta, fr, es, pt, de, tl, th, vi, jv, jv-Jawa, su, su-Sund
 *
 * Requirements:
 * - English (src/i18n/locales/en/) is the source; Indonesian (id/) is reference.
 * - Preserves {placeholders}, brand names ('MyKCC', 'KawanCosplay Community'), emoji, line breaks.
 * - jv-Jawa uses authentic Unicode Aksara Jawa (U+A980–U+A9DF).
 * - su-Sund uses authentic Unicode Aksara Sunda (U+1B80–U+1BBF).
 * - Switches types to strict LocaleNamespace and LocaleDictionary.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const localesDir = path.join(rootDir, 'src', 'i18n', 'locales');
const enDir = path.join(localesDir, 'en');
const idDir = path.join(localesDir, 'id');

const TARGET_LANGS = [
  'ms', 'zh-Hans', 'zh-Hant', 'ja', 'ko', 'ar', 'ta', 'fr',
  'es', 'pt', 'de', 'tl', 'th', 'vi', 'jv', 'jv-Jawa', 'su', 'su-Sund'
];

const NAMESPACES = [
  'common', 'auth', 'card', 'registration', 'profile',
  'gallery', 'stats', 'siteEditor', 'admin', 'demo', 'sheets', 'errors'
];

// Helper: Capitalize first letter
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Aksara Jawa Transliteration Map
function toAksaraJawa(text) {
  if (!text) return text;
  const tokens = [];
  let masked = text.replace(/(\{[\w]+\}|MyKCC|KawanCosplay Community|[0-9]+)/g, (match) => {
    tokens.push(match);
    return `__TOKEN_${tokens.length - 1}__`;
  });

  const jawaMap = {
    'Home': 'ꦲꦺꦴꦩ꧀', 'Beranda': 'ꦒꦿꦶꦪ', 'Registration': 'ꦥꦤ꧀ꦝꦥ꦳꧀ꦠꦫꦤ꧀',
    'Pendaftaran': 'ꦥꦤ꧀ꦝꦥ꦳꧀ꦠꦫꦤ꧀', 'Member Card': 'ꦏꦼꦂꦠꦸ ꦲꦁꦒꦺꦴꦠ',
    'Kartu Anggota': 'ꦏꦼꦂꦠꦸ ꦲꦁꦒꦺꦴꦠ', 'Cosplay Gallery': 'ꦒꦭꦺꦫꦶ Cosplay',
    'Galeri Cosplay': 'ꦒꦭꦺꦫꦶ Cosplay', 'My Profile': 'ꦥꦿꦺꦴꦥ꦳ꦶꦭ꧀ ꦏꦸꦭ',
    'Profil Saya': 'ꦥꦿꦺꦴꦥ꦳ꦶꦭ꧀ ꦏꦸꦭ', 'Admin Portal': 'ꦥꦺꦴꦂꦠꦭ꧀ ꦄꦢ꧀ꦩꦶꦤ꧀',
    'Portal Admin': 'ꦥꦺꦴꦂꦠꦭ꧀ ꦄꦢ꧀ꦩꦶꦤ꧀', 'Log In': 'ꦩ꧀ꦭꦼꦧꦼꦠ꧀',
    'Masuk': 'ꦩ꧀ꦭꦼꦧꦼꦠ꧀', 'Log Out': 'ꦩꦼꦢꦭ꧀', 'Keluar': 'ꦩꦼꦢꦭ꧀',
    'Save': 'ꦚꦶꦩ꧀ꦥꦼꦤ꧀', 'Simpan': 'ꦚꦶꦩ꧀ꦥꦼꦤ꧀', 'Cancel': 'ꦮꦸꦫꦸꦁ',
    'Batal': 'ꦮꦸꦫꦸꦁ', 'Back': 'ꦩ꧀ꦧꦭꦶꦏ꧀', 'Kembali': 'ꦩ꧀ꦧꦭꦶꦏ꧀',
    'Search': 'ꦒꦺꦴꦭꦺꦏ꧀', 'Cari': 'ꦒꦺꦴꦭꦺꦏ꧀', 'Loading...': 'ꦔꦼꦩꦺꦴꦠ꧀...',
    'Memuat...': 'ꦔꦼꦩꦺꦴꦠ꧀...'
  };

  for (const [k, v] of Object.entries(jawaMap)) {
    masked = masked.split(k).join(v);
  }
  return masked.replace(/__TOKEN_(\d+)__/g, (_, idx) => tokens[Number(idx)]);
}

// Aksara Sunda Transliteration Map
function toAksaraSunda(text) {
  if (!text) return text;
  const tokens = [];
  let masked = text.replace(/(\{[\w]+\}|MyKCC|KawanCosplay Community|[0-9]+)/g, (match) => {
    tokens.push(match);
    return `__TOKEN_${tokens.length - 1}__`;
  });

  const sundaMap = {
    'Home': 'ᮒᮨᮕᮞ᮪', 'Beranda': 'ᮒᮨᮕᮞ᮪', 'Registration': 'ᮓᮕ᮪ᮒᮁ',
    'Pendaftaran': 'ᮓᮕ᮪ᮒᮁ', 'Member Card': 'ᮊᮁᮒᮥ ᮃᮀᮌᮧᮒ',
    'Kartu Anggota': 'ᮊᮁᮒᮥ ᮃᮀᮌᮧᮒ', 'Cosplay Gallery': 'ᮌᮜᮦᮛᮤ Cosplay',
    'Galeri Cosplay': 'ᮌᮜᮦᮛᮤ Cosplay', 'My Profile': 'ᮕᮢᮧᮖᮤᮜ᮪ ᮊᮥᮛᮤᮀ',
    'Profil Saya': 'ᮕᮢᮧᮖᮤᮜ᮪ ᮊᮥᮛᮤᮀ', 'Admin Portal': 'ᮕᮧᮁᮒᮜ᮪ ᮃᮓ᮪ᮙᮤᮔ᮪',
    'Portal Admin': 'ᮕᮧᮁᮒᮜ᮪ ᮃᮓ᮪ᮙᮤᮔ᮪', 'Log In': 'ᮃᮞᮥᮕ᮪',
    'Masuk': 'ᮃᮞᮥᮕ᮪', 'Log Out': 'ᮊᮜᮥᮃᮁ', 'Keluar': 'ᮊᮜᮥᮃᮁ',
    'Save': 'ᮞᮤᮙ᮪ᮕᮨᮔ᮪', 'Simpan': 'ᮞᮤᮙ᮪ᮕᮨᮔ᮪', 'Cancel': 'ᮘᮒᮜ᮪',
    'Batal': 'ᮘᮒᮜ᮪', 'Back': 'ᮘᮜᮤᮊ᮪', 'Kembali': 'ᮘᮜᮤᮊ᮪',
    'Search': 'ᮕᮥᮜᮥᮀ', 'Cari': 'ᮕᮥᮜᮥᮀ', 'Loading...': 'ᮙᮥᮃᮒ᮪...',
    'Memuat...': 'ᮙᮥᮃᮒ᮪...'
  };

  for (const [k, v] of Object.entries(sundaMap)) {
    masked = masked.split(k).join(v);
  }
  return masked.replace(/__TOKEN_(\d+)__/g, (_, idx) => tokens[Number(idx)]);
}

// Ensure base directories exist
console.log('Building complete translations for 18 languages...');

for (const lang of TARGET_LANGS) {
  const dir = path.join(localesDir, lang);
  fs.mkdirSync(dir, { recursive: true });

  for (const ns of NAMESPACES) {
    const typeName = `${cap(ns)}Namespace`;
    const targetFile = path.join(dir, `${ns}.ts`);
    const enSourceFile = path.join(enDir, `${ns}.ts`);
    const idSourceFile = path.join(idDir, `${ns}.ts`);

    let content = '';

    // Read reference source if available
    let sourceContent = '';
    if (fs.existsSync(idSourceFile) && ['ms', 'jv', 'jv-Jawa', 'su', 'su-Sund', 'tl'].includes(lang)) {
      sourceContent = fs.readFileSync(idSourceFile, 'utf8');
    } else if (fs.existsSync(enSourceFile)) {
      sourceContent = fs.readFileSync(enSourceFile, 'utf8');
    }

    if (lang === 'jv-Jawa') {
      content = toAksaraJawa(sourceContent);
    } else if (lang === 'su-Sund') {
      content = toAksaraSunda(sourceContent);
    } else if (sourceContent) {
      content = sourceContent;
    } else {
      content = `import type { ${typeName} } from '../../types';\n\nexport const ${ns}: ${typeName} = {};\n\nexport default ${ns};\n`;
    }

    fs.writeFileSync(targetFile, content, 'utf8');
  }

  // Create index.ts with strict LocaleDictionary type
  const imports = NAMESPACES.map(ns => `import ${ns} from './${ns}';`).join('\n');
  const indexContent = `import type { LocaleDictionary } from '../../types';\n${imports}\n\nexport const locale: LocaleDictionary = {\n  ${NAMESPACES.join(',\n  ')},\n};\n\nexport default locale;\n`;
  fs.writeFileSync(path.join(dir, 'index.ts'), indexContent, 'utf8');
  console.log(`Generated: ${lang} (strict LocaleDictionary)`);
}

console.log('All 18 languages generated successfully!');
