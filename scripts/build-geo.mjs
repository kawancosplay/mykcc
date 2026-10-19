#!/usr/bin/env node
/**
 * build-geo.mjs: builds the static country / first-level subdivision / city lists that the web app
 * serves from public/geo/. Dependency-free Node ESM (Node >= 18.3 for util.parseArgs).
 *
 * Input:  the dr5hn/countries-states-cities-database release asset "json-countries+states+cities.json.gz"
 *         (a JSON array of countries, each with states[], each with cities[]; licensed ODbL 1.0), gzipped
 *         or plain, plus an optional official Indonesia override
 *         (scripts/data/indonesia-regions.json: {asOf, sources, provinces:[{name, code, iso, aliases,
 *         regencies:[{name, type, code}]}]}).
 *
 * Usage:
 *   node scripts/build-geo.mjs --input <world.json.gz|world.json>
 *        [--indonesia scripts/data/indonesia-regions.json | --indonesia none]
 *        [--out public/geo] [--release <tag>] [--release-date <YYYY-MM-DD>]
 *        [--verbose] [--verify-parents]
 *
 *   --indonesia  defaults to scripts/data/indonesia-regions.json, used only if that file exists.
 *   --out        defaults to <repo>/public/geo. Stale <ISO2>.json files in it are removed.
 *   --release / --release-date  name the upstream release in ATTRIBUTION.md. When omitted they are read
 *                from a SOURCE.txt next to the input ("<repo> <tag> published <ISO date> ... url <url>").
 *   --verbose    prints every per-country adjustment (dropped entries, moved cities).
 *   --verify-parents  cross-checks the explicit parent tables below against the upstream coordinates
 *                and prints disagreements (maintenance aid; does not change the output).
 *
 * Output (compact JSON, UTF-8, deterministic for the same input):
 *   countries.json  [{iso2, iso3, name, native, emoji, phonecode, region, subregion}] sorted by name
 *   <ISO2>.json     {iso2, name, native, emoji, subdivisionLabel, states:[{name, code, type, cities[]}]}
 *                   one file per country (also for countries without subdivisions: states = []).
 *                   Indonesia's states also carry aliases[].
 *   ATTRIBUTION.md  ODbL attribution for the upstream release and the Indonesia source.
 *
 * FIRST-LEVEL SUBDIVISION RULES (applied per country, in this order)
 *  1. Non-administrative pseudo-regions are dropped when the country has other entries. These are the
 *     upstream types in NON_ADMIN_TYPES: "geographical unit" (Indonesia's Jawa, Kalimantan, Maluku,
 *     Nusa Tenggara, Papua, Sulawesi, Sumatera), "geographical region" (Cape Verde's Barlavento/Sotavento),
 *     "geographical entity", "military postal region" (US AA/AE/AP) and "chain" (Marshall Islands' Ralik/Ratak).
 *  2. Where upstream mixes administrative levels, COUNTRY_RULES picks ONE level: the one people normally
 *     choose as "state/province" in an address form. That is usually the ISO 3166-2 top level (UK nations,
 *     Czech kraje, Bangladeshi divisions, Moroccan regions...), or the postal level when addresses use it
 *     instead (French departements, Spanish and Italian provinces, Philippine provinces + Metro Manila,
 *     Maltese localities). Rule keys: keepTypes, dropTypes, dropEmptyTypes (drop only entries with no
 *     cities), keepCodes / dropCodes (per-entry exceptions, keepCodes wins), label (subdivisionLabel),
 *     typeLabel (type for every kept entry), parent (dropped entry -> kept entry code), orphans.
 *  3. Cities of a dropped entry move to the kept entry they belong to. The rule's explicit parent table
 *     is used first (e.g. Czech district code prefix = region code, UK council area -> nation,
 *     Bangladeshi district -> division). Without one, the cities go by nearest neighbour on the
 *     upstream coordinates: each city joins the kept entry that owns the closest original city or
 *     centroid ("nearest-city"; "nearest-entry" moves the whole dropped entry by majority vote;
 *     "drop" discards them). Nothing is dropped silently: the summary counts moved and lost cities.
 *  4. Names are trimmed and NFC-normalised. Cities are de-duplicated case-insensitively (a rule's
 *     dropCities removes non-city placeholders, e.g. Ireland's "County Cork"). States and cities are
 *     sorted with a locale-aware collator (Intl, base sensitivity, numeric), ties broken by code point
 *     so the output is stable.
 *  4b. Kept entries that share a name get their type appended ("Moscow (Autonomous City)" /
 *     "Moscow (Administrative Region)", "Minsk (City)" / "Minsk (Oblast)"), or their code if the types
 *     are equal too.
 *  5. type = the upstream type in Title Case (or the rule's typeLabel). subdivisionLabel = the rule's label,
 *     else the label of the most common kept type (TYPE_LABELS, else the type's last word), e.g.
 *     "metropolitan department" -> "Department", "land" -> "State", "oblast" -> "Region".
 *  6. Indonesia: when the override file exists, its official provinces REPLACE the upstream entries:
 *     code = ISO 3166-2 suffix after "ID-", type = "Capital Region" (Jakarta) / "Special Region"
 *     (Yogyakarta) / "Province" (or the override's own type), cities = official regency/city names in
 *     Kemendagri style ("Kabupaten Bandung", "Kota Bandung"; a {name, type} regency gets its type prefixed,
 *     a plain string is used as is), aliases = override aliases + the upstream name when it differs.
 *     Upstream provinces missing from the override, and duplicates, are reported as warnings.
 */

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import zlib from 'node:zlib';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');
const DEFAULT_OUT = path.join(REPO_ROOT, 'public', 'geo');
const DEFAULT_INDONESIA = path.join(SCRIPT_DIR, 'data', 'indonesia-regions.json');
const UPSTREAM_URL = 'https://github.com/dr5hn/countries-states-cities-database';

/** Upstream subdivision types that are not administrative (rule 1). Lower case. */
const NON_ADMIN_TYPES = new Set([
  'geographical unit',
  'geographical region',
  'geographical entity',
  'military postal region',
  'chain',
]);

/** subdivisionLabel for upstream types whose last word is not a good label (rule 5). */
const TYPE_LABELS = {
  '': 'Region',
  land: 'State',
  oblast: 'Region',
  voivodship: 'Voivodeship',
  popularate: 'District',
  sheadings: 'Sheading',
  'local council': 'Locality',
  'administrative atoll': 'Atoll',
  'island council': 'Island',
  'town council': 'Island',
  'council area': 'Council Area',
  'union territory': 'Union Territory',
  'two-tier county': 'County',
  'districts under republic administration': 'District',
};

/** {PARENT: 'CHILD CHILD ...'} -> (state) => parent code (rule 3 parent tables keyed by upstream iso2). */
function fromGroups(groups) {
  const map = new Map();
  for (const [parent, children] of Object.entries(groups)) {
    for (const child of children.split(/\s+/).filter(Boolean)) map.set(child, parent);
  }
  const fn = (s) => map.get(s.code);
  fn.table = map;
  return fn;
}

/** Parent = first `length` characters of the child code, optionally translated through `mapping`. */
function byCodePrefix(length, mapping) {
  return (s) => {
    const prefix = s.code.slice(0, length);
    return mapping ? mapping[prefix] : prefix;
  };
}

const UK_WALES = new Set(
  'AGY BGE BGW CAY CGN CMN CRF CWY DEN FLN GWN MON MTY NTL NWP PEM POW RCT SWA TOF VGL WRX'.split(' '),
);

/**
 * Per-country overrides (rule 2/3). Countries not listed only get rule 1. Codes are the upstream state
 * iso2 values (the part after "XX-" in ISO 3166-2), types are upstream types in lower case.
 */
const COUNTRY_RULES = {
  // Indonesia: 38 provinces + 7 "geographical unit" islands (dropped by rule 1). Replaced by the
  // official override when scripts/data/indonesia-regions.json exists (rule 6).
  ID: { label: 'Province' },

  // France: 13 regions (no cities) vs 95 departements (all cities); addresses use the departement.
  // Overseas regions are single-departement regions; Paris (75C) and Metropole de Lyon (69M) are
  // departement-level. Dropped: regions, Alsace (European collectivity of 67 + 68), Clipperton, and the
  // overseas collectivities/territories (separate countries in this dataset: PF, PM, BL, MF, WF, NC, TF).
  FR: {
    label: 'Department',
    keepTypes: ['metropolitan department', 'overseas region', 'metropolitan collectivity with special status'],
  },

  // Spain: 17 autonomous communities (no cities) vs 50 provinces (all cities); addresses use the province.
  ES: { label: 'Province', keepTypes: ['province', 'autonomous city'] },

  // Italy: 20 regions (no cities, except single-province Aosta Valley) vs provinces/metropolitan cities/
  // free municipal consortia/decentralized regional entities/autonomous provinces (the "sigla" level).
  IT: { label: 'Province', dropTypes: ['region'], dropEmptyTypes: ['autonomous region'] },

  // United Kingdom: the 4 nations are the top level but hold no cities; 217 councils/boroughs/counties
  // hold them. Keep the nations and move every council's cities to its nation (by council type; the
  // 22 Welsh principal areas are listed in UK_WALES).
  GB: {
    label: 'Nation',
    typeLabel: 'Nation',
    keepTypes: [],
    keepCodes: ['ENG', 'SCT', 'WLS', 'NIR'],
    parent: (s) => {
      if (s.type === 'council area') return 'SCT';
      if (s.type === 'district') return 'NIR';
      if (s.type === 'unitary authority' && UK_WALES.has(s.code)) return 'WLS';
      return 'ENG';
    },
  },

  // Philippines: 82 provinces + 18 regions (some holding cities). Addresses use the province, with Metro
  // Manila (NCR) as the province-level entry; the BARMM Special Geographic Area is kept too. Cities
  // that upstream attaches to other regions go to the nearest province.
  PH: { label: 'Province', keepTypes: ['province', 'special geographic area'], keepCodes: ['00'], orphans: 'nearest-city' },

  // Thailand: Pattaya (special administrative city, no cities) lies inside Chon Buri.
  TH: { dropCodes: ['S'], parent: (s) => (s.code === 'S' ? '20' : undefined) },

  // Belgium: provinces + Brussels-Capital; the Flemish/Walloon regions group the provinces.
  BE: { keepTypes: ['province'], keepCodes: ['BRU'], orphans: 'nearest-city' },

  // Ireland: counties; the 4 historic provinces group them. Their city lists also carry county / council
  // names ("County Cork", Irish-language county names, "Fingal"), which are not cities.
  IE: {
    keepTypes: ['county'],
    orphans: 'nearest-city',
    dropCities: [
      /^County /,
      'An Cabhán', 'An Clár', 'An Iarmhí', 'An Longfort', 'An Mhí', 'Ciarraí', 'Dún Laoghaire-Rathdown',
      'Fingal', 'Laois', 'Loch Garman', 'Lú', 'Uíbh Fhailí',
    ],
  },

  // Czech Republic: 13 kraje + Prague; the 76 districts hold the cities, district code prefix = kraj code.
  CZ: { keepTypes: ['region', 'capital city'], parent: byCodePrefix(2) },

  // Sri Lanka: 9 provinces; district code first digit = province code.
  LK: { keepTypes: ['province'], parent: byCodePrefix(1) },

  // Uganda: 4 regions; district/city code first digit 1-4 = Central/Eastern/Northern/Western.
  UG: { keepTypes: ['region'], parent: byCodePrefix(1, { 1: 'C', 2: 'E', 3: 'N', 4: 'W' }) },

  // Bangladesh: 8 divisions over 64 districts.
  BD: {
    keepTypes: ['division'],
    parent: fromGroups({
      A: '02 06 07 25 50 51', // Barishal
      B: '01 04 08 09 10 11 16 29 31 47 56', // Chattogram
      C: '13 15 17 18 26 33 35 36 40 42 53 62 63', // Dhaka
      D: '05 12 22 23 27 30 37 39 43 58', // Khulna
      E: '03 24 44 45 48 49 54 59', // Rajshahi
      F: '14 19 28 32 46 52 55 64', // Rangpur
      G: '20 38 60 61', // Sylhet
      H: '21 34 41 57', // Mymensingh
    }),
  },

  // Burkina Faso: 13 regions over 45 provinces.
  BF: {
    keepTypes: ['region'],
    parent: fromGroups({
      '01': 'BAL BAN KOS MOU NAY SOR',
      '02': 'COM LER',
      '03': 'KAD',
      '04': 'BLG KOP KOT',
      '05': 'BAM NAM SMT',
      '06': 'BLK SNG SIS ZIR',
      '07': 'BAZ NAO ZOU',
      '08': 'GNA GOU KMD KMP TAP',
      '09': 'HOU KEN TUI',
      '10': 'LOR PAS YAT ZON',
      '11': 'GAN KOW OUB',
      '12': 'OUD SEN SOM YAG',
      '13': 'BGR IOB NOU PON',
    }),
  },

  // Guinea: 7 administrative regions + Conakry over 33 prefectures.
  GN: {
    keepTypes: ['administrative region', 'governorate'],
    parent: fromGroups({
      B: 'BF BK FR GA KN',
      F: 'DB DI FA KS',
      K: 'KA KE KO MD SI',
      D: 'CO DU FO KD TE',
      L: 'KB LA LE ML TO',
      M: 'DL MM PI',
      N: 'BE GU LO MC NZ YO',
    }),
  },

  // Fiji: 4 divisions (+ Rotuma dependency) over 14 provinces.
  FJ: {
    keepTypes: ['division', 'dependency'],
    parent: fromGroups({ C: '09 10 12 13 14', E: '04 05 06', N: '02 03 07', W: '01 08 11' }),
  },

  // Malawi: 3 regions over 28 districts.
  MW: {
    keepTypes: ['region'],
    parent: fromGroups({
      N: 'CT KR LK MZ NB RU',
      C: 'DE DO KS LI MC NK NU NI SA',
      S: 'BA BL CK CR MH MG MU MW NE NS PH TH ZO',
    }),
  },

  // Saint Kitts and Nevis: 2 islands (states) over 14 parishes.
  KN: { keepTypes: ['state'], parent: fromGroups({ N: '04 05 07 10 12', K: '01 02 03 06 08 09 11 13 15' }) },

  // Hungary: counties + Budapest; the 23 cities with county rights (and "Zalaegerszeg", mistyped as a
  // county upstream) move into their county.
  HU: {
    dropTypes: ['city with county rights'],
    dropCodes: ['ZE'],
    parent: fromGroups({
      BE: 'BC', HB: 'DE', FE: 'DU SF', HE: 'EG', PE: 'ER', GS: 'GY SN', CS: 'HV SD', SO: 'KV', BK: 'KM',
      BZ: 'MI', ZA: 'NK ZE', SZ: 'NY', BA: 'PS', NO: 'ST', TO: 'SS', JN: 'SK', VA: 'SH', KE: 'TB', VE: 'VM',
    }),
  },

  // Azerbaijan: the Nakhchivan Autonomous Republic's own districts and city fold into it.
  AZ: {
    dropCodes: ['BAB', 'CUL', 'KAN', 'ORD', 'SAD', 'SAH', 'SAR', 'NV'],
    parent: (s) => (['BAB', 'CUL', 'KAN', 'ORD', 'SAD', 'SAH', 'SAR', 'NV'].includes(s.code) ? 'NX' : undefined),
  },

  // Greece: "East Attica" is a regional unit of Attica.
  GR: { dropCodes: ['A2'], parent: (s) => (s.code === 'A2' ? 'I' : undefined) },

  // Estonia: 15 counties over 79 rural/urban municipalities (2017 reform).
  EE: {
    keepTypes: ['county'],
    parent: fromGroups({
      37: '141 198 245 296 305 338 353 424 431 446 651 653 719 726 784 890', // Harju
      39: '205', // Hiiu
      45: '130 251 321 442 511 514 735 803', // Ida-Viru
      50: '247 486 618', // Jogeva
      52: '255 567 834', // Jarva
      56: '184 441 907', // Laane
      60: '191 272 661 663 792 901 903 928', // Laane-Viru
      64: '284 622 708', // Polva
      68: '214 303 430 624 638 712 809', // Parnu
      71: '293 317 503 668', // Rapla
      74: '478 689 714', // Saare
      79: '171 283 291 432 528 586 793 796', // Tartu
      81: '557 824 855', // Valga
      84: '480 615 897 899', // Viljandi
      87: '142 698 732 917 919', // Voru
    }),
  },

  // Lithuania: 10 counties over 60 municipalities (upstream names repeat, e.g. two "Kaunas").
  LT: {
    keepTypes: ['county'],
    parent: fromGroups({
      AL: '02 03 07 24 55',
      KU: '05 10 13 15 16 18 36 38',
      KL: '20 21 22 28 31 46 48',
      MR: '14 17 25 41 56',
      PN: '06 23 32 33 34 40',
      SA: '01 11 19 30 37 43 44',
      TA: '12 29 45 50',
      TE: '26 35 39 51',
      UT: '04 09 27 54 59 60',
      VL: '08 42 47 49 52 53 57 58',
    }),
  },

  // Iceland: 8 regions over 64 municipalities.
  IS: {
    keepTypes: ['region'],
    parent: fromGroups({
      1: 'RKV KOP SEL GAR HAF MOS KJO', // Capital Region
      2: 'RKN GRN SDN SVG', // Southern Peninsula
      3: 'AKN HVA SKO BOG GRU STY EOM SNF DAB', // Western
      4: 'BOL ISA RHH TAL VER SDV ARN KAL STR', // Westfjords
      5: 'HUV HUG SSS SKG SKR', // Northwestern
      6: 'AKU NOR FJL DAV EYF HRG SBT GRY TJO THG LAN', // Northeastern
      7: 'MUL FJD VOP FLR', // Eastern
      8: 'SHF VEM SFA MYR SKF ASA RGE RGY HRU HVE SOL GOG SOG BLA FLA', // Southern
    }),
  },

  // Morocco: 12 regions over 13 prefectures + 62 provinces (Western Sahara entries kept as upstream has them).
  MA: {
    keepTypes: ['region'],
    parent: fromGroups({
      '01': 'TNG MDF TET FAH LAR HOC CHE OUZ',
      '02': 'OUJ NAD DRI JRA BER TAI GUF FIG',
      '03': 'FES MEK HAJ IFR MOU SEF BOM TAO TAZ',
      '04': 'RAB SAL SKH KEN KHE SIK SIL',
      '05': 'BEM AZI FQH KHN KHO',
      '06': 'CAS MOH JDI NOU MED BES BRR SET SIB',
      '07': 'MAR CHI HAO KES ESI REH SAF YUS',
      '08': 'ERR OUA MID TIN ZAG',
      '09': 'AGD INE CHT TAR TIZ TAT',
      '10': 'GUE ASZ TNT SIF',
      '11': 'LAA BOD TAF ESM',
      '12': 'OUD AOU',
    }),
  },

  // Saint Helena, Ascension and Tristan da Cunha: the 3 constituent parts (upstream "geographical entity")
  // are the top level; the 8 districts are on Saint Helena island.
  SH: { keepTypes: ['geographical entity'], parent: () => 'HL' },

  // Upper-level groupings without cities, dropped in favour of the level below:
  DO: { dropTypes: ['region'] }, // 10 development regions over the 31 provinces + Distrito Nacional
  GQ: { dropTypes: ['region'] }, // Insular / Rio Muni over the 8 provinces
  GW: { dropTypes: ['province'] }, // Leste / Norte / Sul over the 8 regions + Bissau
  IQ: { dropTypes: ['region'] }, // Kurdistan Region over Erbil / Duhok / Sulaymaniyah / Halabja
  TN: { dropTypes: ['district'] }, // 5 new regional districts over the 24 governorates
  RS: { dropTypes: ['province'] }, // Vojvodina / Kosovo-Metohija over the districts
  MT: { label: 'Locality', dropTypes: ['region'] }, // 6 regions over the 68 local councils (= localities)

  // Puerto Rico: upstream labels 10 of the 78 municipalities "region".
  PR: { label: 'Municipality', typeLabel: 'Municipality' },

  // Cayman Islands: upstream type is empty.
  KY: { label: 'District', typeLabel: 'District' },
};

// ------------------------------------------------------------------------------------------------
// Helpers

const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true });
const compareText = (a, b) => collator.compare(a, b) || (a < b ? -1 : a > b ? 1 : 0);
const clean = (value) => String(value ?? '').normalize('NFC').replace(/\s+/g, ' ').trim();
const dedupeKey = (name) => name.toLowerCase();
const SMALL_WORDS = new Set(['of', 'with', 'under', 'and', 'de', 'del']);

function titleCase(type) {
  if (!type) return null;
  return type
    .split(' ')
    .map((word, i) => (i > 0 && SMALL_WORDS.has(word) ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ');
}

function labelForType(type) {
  if (type in TYPE_LABELS) return TYPE_LABELS[type];
  const words = type.split(' ');
  return titleCase(words[words.length - 1]);
}

function toPoint(lat, lon) {
  const la = Number.parseFloat(lat);
  const lo = Number.parseFloat(lon);
  return Number.isFinite(la) && Number.isFinite(lo) ? [la, lo] : null;
}

/** Squared equirectangular distance; good enough to rank neighbours inside one country. */
function distance2(a, b) {
  let dLon = Math.abs(a[1] - b[1]);
  if (dLon > 180) dLon = 360 - dLon;
  const x = dLon * Math.cos(((a[0] + b[0]) / 2) * (Math.PI / 180));
  const y = a[0] - b[0];
  return x * x + y * y;
}

/** Drops points far from the median of their group (upstream coordinate/assignment errors). */
function trustedPoints(points) {
  if (points.length < 4) return points;
  const median = (values) => {
    const s = [...values].sort((a, b) => a - b);
    const m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  };
  const center = [median(points.map((p) => p[0])), median(points.map((p) => p[1]))];
  const distances = points.map((p) => Math.sqrt(distance2(p, center)));
  const limit = Math.max(5 * median(distances), 0.5);
  return points.filter((_, i) => distances[i] <= limit);
}

function sortedUnique(names) {
  const byKey = new Map();
  for (const raw of names) {
    const name = clean(raw);
    if (!name) continue;
    const key = dedupeKey(name);
    if (!byKey.has(key)) byKey.set(key, name);
  }
  return [...byKey.values()].sort(compareText);
}

function fail(message) {
  console.error(`build-geo: ${message}`);
  process.exit(1);
}

// ------------------------------------------------------------------------------------------------
// Per-country build

/**
 * Applies rules 1-5 to one upstream country.
 * Returns {states: [{name, code, type, cities}], label, report}.
 */
function buildCountry(country, rule, options) {
  const report = { dropped: [], moved: [], renamed: [], lost: 0, warnings: [], verify: [] };
  const entries = country.states.map((s) => ({
    code: clean(s.iso2),
    name: clean(s.name),
    type: clean(s.type).toLowerCase(),
    point: toPoint(s.latitude, s.longitude),
    cities: s.cities.map((c) => ({ name: clean(c.name), point: toPoint(c.latitude, c.longitude) })),
  }));

  const hasAdmin = entries.some((e) => !NON_ADMIN_TYPES.has(e.type));
  const dropReason = (e) => {
    if (rule.keepCodes?.includes(e.code)) return null;
    if (rule.dropCodes?.includes(e.code)) return 'rule';
    if (rule.keepTypes) return rule.keepTypes.includes(e.type) ? null : 'level';
    if (rule.dropTypes?.includes(e.type)) return 'level';
    if (rule.dropEmptyTypes?.includes(e.type) && e.cities.length === 0) return 'empty';
    if (hasAdmin && NON_ADMIN_TYPES.has(e.type)) return 'non-admin';
    return null;
  };

  let kept = [];
  const dropped = [];
  for (const e of entries) {
    const reason = dropReason(e);
    if (reason) dropped.push({ ...e, reason });
    else kept.push(e);
  }
  if (kept.length === 0 && entries.length > 0) {
    report.warnings.push('rule dropped every entry; keeping upstream entries unfiltered');
    kept = entries;
    dropped.length = 0;
  }

  const keptByCode = new Map(kept.map((e) => [e.code, { entry: e, cityNames: e.cities.map((c) => c.name) }]));

  // Anchors for nearest-neighbour placement: centroids and original cities of kept entries, minus cities
  // that sit far from the rest of their entry (upstream has e.g. Mindanao places under Cagayan, Luzon).
  let anchors = null;
  const getAnchors = () => {
    if (!anchors) {
      anchors = [];
      for (const e of kept) {
        if (e.point) anchors.push({ point: e.point, code: e.code });
        for (const p of trustedPoints(e.cities.map((c) => c.point).filter(Boolean))) anchors.push({ point: p, code: e.code });
      }
    }
    return anchors;
  };
  const nearest = (point) => {
    if (!point) return null;
    let best = null;
    let bestD = Infinity;
    for (const a of getAnchors()) {
      const d = distance2(point, a.point);
      if (d < bestD) {
        bestD = d;
        best = a.code;
      }
    }
    return best;
  };
  const voteEntry = (e) => {
    const votes = new Map();
    const points = e.cities.map((c) => c.point).filter(Boolean);
    if (points.length === 0 && e.point) points.push(e.point);
    for (const p of points) {
      const code = nearest(p);
      if (code) votes.set(code, (votes.get(code) ?? 0) + 1);
    }
    let best = null;
    for (const [code, n] of votes) if (!best || n > votes.get(best)) best = code;
    return best;
  };

  for (const e of dropped) {
    report.dropped.push(`${e.code} ${e.name} [${e.type || 'no type'}; ${e.reason}]`);
    let parent = rule.parent ? rule.parent(e) : undefined;
    if (parent !== undefined && !keptByCode.has(parent)) {
      report.warnings.push(`parent ${parent} of ${e.code} ${e.name} is not a kept entry; using nearest neighbour`);
      parent = undefined;
    }
    if (rule.parent && parent === undefined && e.cities.length > 0 && e.reason !== 'non-admin') {
      report.warnings.push(`no parent listed for ${e.code} ${e.name}; using nearest neighbour`);
    }
    e.parent = parent;
  }

  if (options.verifyParents) {
    // Siblings sit next to each other: compare each table parent with the parents of the nearest
    // cities of all OTHER entries (kept entries own their cities, dropped ones count for their parent).
    const points = [];
    for (const e of kept) for (const c of e.cities) if (c.point) points.push({ point: c.point, code: e.code, from: e });
    for (const e of dropped) {
      if (e.parent === undefined) continue;
      for (const c of e.cities) if (c.point) points.push({ point: c.point, code: e.parent, from: e });
      if (e.cities.length === 0 && e.point) points.push({ point: e.point, code: e.parent, from: e });
    }
    for (const e of dropped) {
      if (e.parent === undefined) continue;
      const own = e.cities.map((c) => c.point).filter(Boolean);
      if (own.length === 0 && e.point) own.push(e.point);
      const votes = new Map();
      for (const p of own) {
        const ranked = points
          .filter((a) => a.from !== e)
          .map((a) => ({ code: a.code, d: distance2(p, a.point) }))
          .sort((a, b) => a.d - b.d)
          .slice(0, 5);
        for (const { code } of ranked) votes.set(code, (votes.get(code) ?? 0) + 1);
      }
      const total = [...votes.values()].reduce((a, b) => a + b, 0);
      const [guess, n] = [...votes].sort((a, b) => b[1] - a[1])[0] ?? [];
      if (guess && guess !== e.parent && !votes.has(e.parent) && n / total > 0.5) {
        report.verify.push(
          `${e.code} ${e.name} -> table ${e.parent} ${keptByCode.get(e.parent).entry.name}, neighbours suggest ${guess} ${keptByCode.get(guess).entry.name}`,
        );
      }
    }
  }

  const orphans = [];
  for (const e of dropped) {
    const parent = e.parent;
    if (e.cities.length === 0) continue;

    if (parent !== undefined) {
      keptByCode.get(parent).cityNames.push(...e.cities.map((c) => c.name));
      report.moved.push(`${e.code} ${e.name}: ${e.cities.length} -> ${parent} (table)`);
      continue;
    }
    const mode = rule.orphans ?? 'nearest-city';
    if (mode === 'drop') {
      report.lost += e.cities.length;
      report.moved.push(`${e.code} ${e.name}: ${e.cities.length} dropped`);
      continue;
    }
    if (mode === 'nearest-entry') {
      const target = voteEntry(e);
      if (target) {
        keptByCode.get(target).cityNames.push(...e.cities.map((c) => c.name));
        report.moved.push(`${e.code} ${e.name}: ${e.cities.length} -> ${target} (nearest entry)`);
      } else {
        report.lost += e.cities.length;
        report.moved.push(`${e.code} ${e.name}: ${e.cities.length} lost (no coordinates)`);
      }
      continue;
    }
    for (const c of e.cities) orphans.push({ name: c.name, point: c.point, from: e });
  }

  // "nearest-city": grow the kept entries outwards. The orphan closest to any anchor is placed first
  // and becomes an anchor itself, so suburbs follow the already-placed city centre rather than the
  // next county's towns.
  if (orphans.length > 0) {
    const tallies = new Map(); // dropped entry -> Map(code -> names)
    const items = orphans.filter((o) => o.point);
    report.lost += orphans.length - items.length;
    const base = getAnchors();
    if (base.length === 0) {
      report.lost += items.length;
    } else {
      for (const it of items) {
        it.best = Infinity;
        for (const a of base) {
          const d = distance2(it.point, a.point);
          if (d < it.best) {
            it.best = d;
            it.code = a.code;
          }
        }
      }
      const remaining = new Set(items);
      while (remaining.size > 0) {
        let pick = null;
        for (const it of remaining) if (!pick || it.best < pick.best) pick = it;
        remaining.delete(pick);
        keptByCode.get(pick.code).cityNames.push(pick.name);
        const tally = tallies.get(pick.from) ?? new Map();
        tally.set(pick.code, [...(tally.get(pick.code) ?? []), pick.name]);
        tallies.set(pick.from, tally);
        for (const it of remaining) {
          const d = distance2(it.point, pick.point);
          if (d < it.best) {
            it.best = d;
            it.code = pick.code;
          }
        }
      }
    }
    for (const [e, tally] of tallies) {
      const spread = [...tally].map(([code, names]) => `${code}:${names.length}`).join(' ');
      report.moved.push(`${e.code} ${e.name}: ${e.cities.length} -> nearest city (${spread})`);
      if (options.verbose) {
        for (const [code, names] of tally) report.moved.push(`    ${code} <- ${names.sort(compareText).join(', ')}`);
      }
    }
  }

  const isJunkCity = (name) =>
    (rule.dropCities ?? []).some((p) => (p instanceof RegExp ? p.test(name) : dedupeKey(p) === dedupeKey(name)));
  const states = kept
    .map((e) => {
      const names = keptByCode.get(e.code).cityNames;
      const cities = sortedUnique(names.filter((n) => !isJunkCity(n)));
      const junk = sortedUnique(names.filter(isJunkCity));
      if (junk.length) report.moved.push(`${e.code}: removed non-city names ${junk.join(', ')}`);
      return { name: e.name, code: e.code, type: rule.typeLabel ?? titleCase(e.type), cities };
    })
    .sort((a, b) => compareText(a.name, b.name) || compareText(a.code, b.code));

  // Dominant kept type -> subdivisionLabel.
  let label = rule.label ?? null;
  if (!label && kept.length > 0) {
    const counts = new Map();
    for (const e of kept) {
      const c = counts.get(e.type) ?? { n: 0, cities: 0 };
      c.n += 1;
      c.cities += e.cities.length;
      counts.set(e.type, c);
    }
    const [dominant] = [...counts].sort((a, b) => b[1].n - a[1].n || b[1].cities - a[1].cities || compareText(a[0], b[0]))[0];
    label = labelForType(dominant);
  }

  disambiguate(states, report);
  return { states, label, report };
}

/**
 * Rule 4b: entries that share a name (Moscow city / Moscow oblast, Minsk / Minsk region...) get their
 * type appended, "Moscow (Autonomous City)", or their code when the types are equal too.
 */
function disambiguate(states, report) {
  const byName = new Map();
  for (const s of states) {
    const key = dedupeKey(s.name);
    byName.set(key, [...(byName.get(key) ?? []), s]);
  }
  let renamed = false;
  for (const group of byName.values()) {
    if (group.length < 2) continue;
    const typesDistinct = new Set(group.map((s) => s.type)).size === group.length && group.every((s) => s.type);
    const before = group.map((s) => s.name).join(' / ');
    for (const s of group) s.name = `${s.name} (${typesDistinct ? s.type : s.code})`;
    report.renamed.push(`${before} -> ${group.map((s) => s.name).join(' / ')}`);
    renamed = true;
  }
  if (renamed) states.sort((a, b) => compareText(a.name, b.name) || compareText(a.code, b.code));
}

// ------------------------------------------------------------------------------------------------
// Indonesia override (rule 6)

function indonesiaType(province, code) {
  if (province.type) return clean(province.type);
  const name = clean(province.name);
  if (code === 'JK' || /^(DKI|DKJ|Daerah Khusus)\b/i.test(name)) return 'Capital Region';
  if (code === 'YO' || /^(DI|Daerah Istimewa)\b/i.test(name)) return 'Special Region';
  return 'Province';
}

const REGENCY_TYPES = {
  regency: 'Kabupaten',
  city: 'Kota',
  'administrative regency': 'Kabupaten Administrasi',
  'administrative city': 'Kota Administrasi',
};

/**
 * Official style "Kabupaten Bandung" / "Kota Bandung" (as Kemendagri and BPS list them): a {name, type}
 * regency gets its type prefixed unless the name already starts with one, so a Kabupaten and a Kota of
 * the same name stay apart. Plain-string regencies are taken as full display names.
 */
function regencyName({ name, type }) {
  const prefix = REGENCY_TYPES[type.toLowerCase()] ?? type;
  if (!prefix || /^(kabupaten|kab\.|kota)\b/i.test(name)) return name;
  return `${prefix} ${name}`;
}

function buildIndonesia(override, upstreamStates, report) {
  if (!Array.isArray(override?.provinces) || override.provinces.length === 0) {
    fail('Indonesia override has no provinces[]');
  }
  const upstreamByCode = new Map(upstreamStates.map((s) => [s.code, s.name]));
  const seen = new Set();
  const states = override.provinces.map((p, i) => {
    const iso = clean(p.iso);
    const match = /^ID-([A-Z]{2})$/.exec(iso);
    if (!match) fail(`Indonesia override province #${i} (${p.name}) has invalid iso "${p.iso}"`);
    const code = match[1];
    if (seen.has(code)) fail(`Indonesia override lists ${iso} twice`);
    seen.add(code);
    const name = clean(p.name);
    if (!name) fail(`Indonesia override ${iso} has no name`);

    // Regencies are either {name, type} objects or full display names ("Kabupaten Bandung", "Kota Bandung"),
    // which are already unique within a province.
    const regencies = (Array.isArray(p.regencies) ? p.regencies : [])
      .map((r) => (typeof r === 'string' ? { name: clean(r), type: '' } : { name: clean(r.name), type: clean(r.type) }))
      .filter((r) => r.name);
    if (regencies.length === 0) report.warnings.push(`Indonesia override ${iso} ${name} has no regencies`);
    const cities = regencies.map(regencyName);
    const counts = new Map();
    for (const city of cities) counts.set(dedupeKey(city), (counts.get(dedupeKey(city)) ?? 0) + 1);
    for (const [key, n] of counts) {
      if (n > 1) report.warnings.push(`Indonesia override ${iso} ${name} lists "${key}" ${n} times`);
    }

    const aliases = [];
    const aliasKeys = new Set([dedupeKey(name)]);
    const addAlias = (value) => {
      const alias = clean(value);
      if (alias && !aliasKeys.has(dedupeKey(alias))) {
        aliasKeys.add(dedupeKey(alias));
        aliases.push(alias);
      }
    };
    for (const alias of Array.isArray(p.aliases) ? p.aliases : []) addAlias(alias);
    if (upstreamByCode.has(code)) addAlias(upstreamByCode.get(code));
    else report.warnings.push(`Indonesia override ${iso} ${name} has no upstream counterpart`);

    return { name, code, type: indonesiaType(p, code), cities: sortedUnique(cities), aliases };
  });
  for (const [code, name] of upstreamByCode) {
    if (!seen.has(code)) report.warnings.push(`upstream Indonesia entry ${code} ${name} is missing from the override`);
  }
  report.moved.push(`replaced ${upstreamStates.length} upstream entries with ${states.length} official provinces`);
  return states.sort((a, b) => compareText(a.name, b.name) || compareText(a.code, b.code));
}

// ------------------------------------------------------------------------------------------------
// Release info & attribution

function releaseInfo(inputPath, args) {
  const info = { tag: args.release ?? null, date: args['release-date'] ?? null, url: null };
  const sourceTxt = path.join(path.dirname(inputPath), 'SOURCE.txt');
  if (fs.existsSync(sourceTxt)) {
    const text = fs.readFileSync(sourceTxt, 'utf8');
    const tag = /\b(v\d[\w.-]*)/.exec(text)?.[1] ?? null;
    if (tag && (!info.tag || info.tag === tag)) {
      info.tag = tag;
      info.date ??= /published\s+(\d{4}-\d{2}-\d{2})/.exec(text)?.[1] ?? null;
      info.url = /\burl\s+(https?:\/\/\S+)/.exec(text)?.[1] ?? null;
    }
  }
  if (!info.url && info.tag) {
    info.url = `${UPSTREAM_URL}/releases/tag/${info.tag}`;
  }
  return info;
}

function describeSource(source) {
  if (typeof source === 'string') return clean(source);
  if (!source || typeof source !== 'object') return '';
  const title = clean(source.name ?? source.title ?? source.publisher ?? '');
  const extras = ['url', 'reference', 'regulation', 'license', 'note']
    .map((key) => (source[key] ? clean(source[key]) : ''))
    .filter(Boolean);
  return [title, ...extras].filter(Boolean).join(' - ');
}

function attributionMarkdown({ release, inputName, inputSha256, indonesia }) {
  const lines = [
    '# Geographic data attribution',
    '',
    `Contains data from countries-states-cities-database by Darshan Gada, licensed under ODbL 1.0.`,
    '',
    `- Upstream repository: ${UPSTREAM_URL}`,
    `- Release: ${release.tag ?? 'unknown'}${release.date ? ` (published ${release.date})` : ''}`,
    ...(release.url ? [`- Release asset: ${release.url}`] : []),
    `- Input file: ${inputName} (SHA-256 ${inputSha256})`,
    '- License: Open Database License (ODbL) v1.0, https://opendatacommons.org/licenses/odbl/1-0/',
    '',
  ];
  if (indonesia) {
    lines.push('## Indonesia', '');
    lines.push(
      'The Indonesian provinces and regencies/cities replace the upstream entries and come from official sources' +
        (indonesia.asOf ? `, as of ${clean(indonesia.asOf)}` : '') +
        ':',
      '',
    );
    const sources = (Array.isArray(indonesia.sources) ? indonesia.sources : [indonesia.sources])
      .map(describeSource)
      .filter(Boolean);
    lines.push(...(sources.length ? sources.map((s) => `- ${s}`) : ['- (no sources listed in the override file)']), '');
  }
  lines.push(
    '## License of this directory',
    '',
    'The files in public/geo/ (countries.json, the per-country <ISO2>.json files and this file) are a derived',
    'database of the data above, generated by scripts/build-geo.mjs, and are likewise made available under the',
    'Open Database License (ODbL) v1.0. Changes from upstream: only first-level subdivisions are kept (non-',
    'administrative pseudo-regions removed, one administrative level chosen per country, cities of removed',
    'entries moved to the kept entry they belong to), names normalised, cities de-duplicated and sorted,',
    'and Indonesia replaced by the official list where available.',
    '',
  );
  return lines.join('\n');
}

// ------------------------------------------------------------------------------------------------
// Main

function main() {
  let args;
  try {
    ({ values: args } = parseArgs({
      options: {
        input: { type: 'string' },
        indonesia: { type: 'string' },
        out: { type: 'string' },
        release: { type: 'string' },
        'release-date': { type: 'string' },
        verbose: { type: 'boolean', default: false },
        'verify-parents': { type: 'boolean', default: false },
        help: { type: 'boolean', short: 'h', default: false },
      },
      strict: true,
    }));
  } catch (error) {
    fail(error.message);
  }
  if (args.help || !args.input) {
    console.log(
      'Usage: node scripts/build-geo.mjs --input <json-countries+states+cities.json.gz|.json>\n' +
        '         [--indonesia scripts/data/indonesia-regions.json|none] [--out public/geo]\n' +
        '         [--release <tag>] [--release-date <YYYY-MM-DD>] [--verbose] [--verify-parents]',
    );
    process.exit(args.help ? 0 : 1);
  }

  const started = Date.now();
  const inputPath = path.resolve(args.input);
  if (!fs.existsSync(inputPath)) fail(`input not found: ${inputPath}`);
  const rawInput = fs.readFileSync(inputPath);
  const inputSha256 = createHash('sha256').update(rawInput).digest('hex');
  const isGzip = rawInput[0] === 0x1f && rawInput[1] === 0x8b;
  let world;
  try {
    world = JSON.parse((isGzip ? zlib.gunzipSync(rawInput) : rawInput).toString('utf8'));
  } catch (error) {
    fail(`cannot parse ${inputPath}: ${error.message}`);
  }
  if (!Array.isArray(world) || !world.every((c) => c && c.iso2 && Array.isArray(c.states))) {
    fail('input is not the dr5hn countries+states+cities JSON array');
  }

  let indonesiaPath = null;
  if (args.indonesia === undefined) {
    if (fs.existsSync(DEFAULT_INDONESIA)) indonesiaPath = DEFAULT_INDONESIA;
  } else if (args.indonesia !== 'none') {
    indonesiaPath = path.resolve(args.indonesia);
    if (!fs.existsSync(indonesiaPath)) fail(`Indonesia override not found: ${indonesiaPath}`);
  }
  let indonesia = null;
  if (indonesiaPath) {
    try {
      indonesia = JSON.parse(fs.readFileSync(indonesiaPath, 'utf8').replace(/^\uFEFF/, ''));
    } catch (error) {
      fail(`cannot parse ${indonesiaPath}: ${error.message}`);
    }
  }

  const outDir = path.resolve(args.out ?? DEFAULT_OUT);
  fs.mkdirSync(outDir, { recursive: true });
  const options = { verbose: args.verbose, verifyParents: args['verify-parents'] };

  const written = new Map(); // file name -> bytes
  const writeFile = (name, content) => {
    const buffer = Buffer.from(content, 'utf8');
    fs.writeFileSync(path.join(outDir, name), buffer);
    written.set(name, buffer.length);
  };

  const countries = [];
  const reports = [];
  let stateCount = 0;
  let cityCount = 0;
  let movedCountries = 0;
  let lostCities = 0;
  const seenIso2 = new Set();

  for (const country of world) {
    const iso2 = clean(country.iso2).toUpperCase();
    if (!/^[A-Z]{2}$/.test(iso2) || seenIso2.has(iso2)) fail(`bad or duplicate country iso2 "${country.iso2}"`);
    seenIso2.add(iso2);
    const rule = COUNTRY_RULES[iso2] ?? {};
    let { states, label, report } = buildCountry(country, rule, options);
    if (iso2 === 'ID' && indonesia) {
      states = buildIndonesia(indonesia, states, report);
      disambiguate(states, report);
      label = rule.label ?? 'Province';
    }

    const record = {
      iso2,
      iso3: clean(country.iso3) || null,
      name: clean(country.name),
      native: clean(country.native) || null,
      emoji: clean(country.emoji) || null,
      phonecode: clean(country.phonecode) || null,
      region: clean(country.region) || null,
      subregion: clean(country.subregion) || null,
    };
    countries.push(record);
    writeFile(
      `${iso2}.json`,
      JSON.stringify({
        iso2,
        name: record.name,
        native: record.native,
        emoji: record.emoji,
        subdivisionLabel: label,
        states,
      }),
    );

    stateCount += states.length;
    for (const s of states) cityCount += s.cities.length;
    lostCities += report.lost;
    if (Object.values(report).some((v) => Array.isArray(v) && v.length > 0)) {
      reports.push({ iso2, name: record.name, before: country.states.length, after: states.length, report });
      if (report.moved.length) movedCountries += 1;
    }
  }

  countries.sort((a, b) => compareText(a.name, b.name) || compareText(a.iso2, b.iso2));
  writeFile('countries.json', JSON.stringify(countries));

  const release = releaseInfo(inputPath, args);
  writeFile(
    'ATTRIBUTION.md',
    attributionMarkdown({ release, inputName: path.basename(inputPath), inputSha256, indonesia }),
  );

  // Remove per-country files from earlier builds that this build did not produce.
  const stale = fs
    .readdirSync(outDir)
    .filter((name) => /^[A-Z]{2}\.json$/.test(name) && !written.has(name));
  for (const name of stale) fs.rmSync(path.join(outDir, name));

  // ---- Summary
  const totalBytes = [...written.values()].reduce((a, b) => a + b, 0);
  const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`;
  console.log(`build-geo: ${path.basename(inputPath)} (release ${release.tag ?? 'unknown'}${release.date ? `, ${release.date}` : ''})`);
  const shownPath = (p) => (path.relative(process.cwd(), p).startsWith('..') ? p : path.relative(process.cwd(), p));
  console.log(`  Indonesia override: ${indonesiaPath ? `${shownPath(indonesiaPath)} (asOf ${indonesia.asOf ?? '?'})` : 'none (upstream data used)'}`);
  console.log(`  output: ${outDir}`);
  console.log(`  countries: ${countries.length} (${countries.length - world.filter((c) => c.states.length === 0).length} with subdivisions)`);
  console.log(`  states:    ${stateCount} (upstream ${world.reduce((n, c) => n + c.states.length, 0)})`);
  console.log(`  cities:    ${cityCount} (upstream ${world.reduce((n, c) => n + c.states.reduce((m, s) => m + s.cities.length, 0), 0)}, after de-duplication)`);
  console.log(`  files:     ${written.size} written, ${stale.length} stale removed, total ${totalBytes} bytes (${kb(totalBytes)})`);
  console.log('  largest files:');
  for (const [name, bytes] of [...written].sort((a, b) => b[1] - a[1]).slice(0, 5)) {
    console.log(`    ${name.padEnd(16)} ${String(bytes).padStart(9)} bytes (${kb(bytes)})`);
  }
  console.log(`  adjusted countries: ${reports.length} (cities moved in ${movedCountries}, cities lost: ${lostCities})`);
  for (const { iso2, name, before, after, report } of reports) {
    const counts = `${before} -> ${after} entries`;
    if (options.verbose) {
      console.log(`  ${iso2} ${name}: ${counts}`);
      for (const line of report.dropped) console.log(`    - dropped ${line}`);
      for (const line of report.moved) console.log(`    ~ ${line}`);
    } else if (report.dropped.length || report.moved.length) {
      console.log(`    ${iso2} ${name}: ${counts}`);
    }
    for (const line of report.renamed) console.log(`    = ${iso2}: ${line}`);
    for (const line of report.warnings) console.log(`    ! ${iso2}: ${line}`);
    for (const line of report.verify) console.log(`    ? ${iso2}: ${line}`);
  }
  console.log(`  done in ${((Date.now() - started) / 1000).toFixed(1)} s`);
}

main();
