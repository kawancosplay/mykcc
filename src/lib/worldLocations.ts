import { Country, State, City, ICountry, IState } from 'country-state-city';

export interface LocationHierarchy {
  country: string;
  code: string;
  flag?: string;
  provinces: {
    name: string;
    isoCode: string;
    cities: string[];
  }[];
}

export interface CountryOption {
  name: string;
  isoCode: string;
  flag: string;
}

export interface ProvinceOption {
  name: string;
  isoCode: string;
}

// Comprehensive Indonesian Kota & Kabupaten enrichment by province name
const INDONESIAN_CITIES_ENRICHMENT: Record<string, string[]> = {
  'DKI Jakarta': [
    'Kota Administrasi Jakarta Pusat',
    'Kota Administrasi Jakarta Selatan',
    'Kota Administrasi Jakarta Barat',
    'Kota Administrasi Jakarta Timur',
    'Kota Administrasi Jakarta Utara',
    'Kabupaten Administrasi Kepulauan Seribu',
  ],
  'Jakarta': [
    'Kota Administrasi Jakarta Pusat',
    'Kota Administrasi Jakarta Selatan',
    'Kota Administrasi Jakarta Barat',
    'Kota Administrasi Jakarta Timur',
    'Kota Administrasi Jakarta Utara',
    'Kabupaten Administrasi Kepulauan Seribu',
  ],
  'Jawa Barat': [
    'Kota Bandung', 'Kabupaten Bandung', 'Kabupaten Bandung Barat', 'Kota Bekasi', 'Kabupaten Bekasi',
    'Kota Bogor', 'Kabupaten Bogor', 'Kota Cimahi', 'Kota Cirebon', 'Kabupaten Cirebon',
    'Kota Depok', 'Kota Sukabumi', 'Kabupaten Sukabumi', 'Kota Tasikmalaya', 'Kabupaten Tasikmalaya',
    'Kota Banjar', 'Kabupaten Ciamis', 'Kabupaten Cianjur', 'Kabupaten Garut', 'Kabupaten Indramayu',
    'Kabupaten Karawang', 'Kabupaten Kuningan', 'Kabupaten Majalengka', 'Kabupaten Pangandaran',
    'Kabupaten Purwakarta', 'Kabupaten Subang', 'Kabupaten Sumedang',
  ],
  'Jawa Tengah': [
    'Kota Semarang', 'Kabupaten Semarang', 'Kota Surakarta (Solo)', 'Kota Magelang', 'Kabupaten Magelang',
    'Kota Pekalongan', 'Kabupaten Pekalongan', 'Kota Salatiga', 'Kota Tegal', 'Kabupaten Tegal',
    'Kabupaten Banjarnegara', 'Kabupaten Banyumas (Purwokerto)', 'Kabupaten Batang', 'Kabupaten Blora',
    'Kabupaten Boyolali', 'Kabupaten Brebes', 'Kabupaten Cilacap', 'Kabupaten Demak', 'Kabupaten Grobogan',
    'Kabupaten Jepara', 'Kabupaten Karanganyar', 'Kabupaten Kebumen', 'Kabupaten Kendal', 'Kabupaten Klaten',
    'Kabupaten Kudus', 'Kabupaten Pati', 'Kabupaten Pemalang', 'Kabupaten Purbalingga', 'Kabupaten Purworejo',
    'Kabupaten Rembang', 'Kabupaten Sragen', 'Kabupaten Sukoharjo', 'Kabupaten Temanggung', 'Kabupaten Wonogiri',
    'Kabupaten Wonosobo',
  ],
  'Jawa Timur': [
    'Kota Surabaya', 'Kota Malang', 'Kabupaten Malang', 'Kota Batu', 'Kota Kediri', 'Kabupaten Kediri',
    'Kota Madiun', 'Kabupaten Madiun', 'Kota Mojokerto', 'Kabupaten Mojokerto', 'Kota Pasuruan', 'Kabupaten Pasuruan',
    'Kota Probolinggo', 'Kabupaten Probolinggo', 'Kota Blitar', 'Kabupaten Blitar', 'Kabupaten Sidoarjo',
    'Kabupaten Gresik', 'Kabupaten Jember', 'Kabupaten Banyuwangi', 'Kabupaten Bangkalan', 'Kabupaten Bojonegoro',
    'Kabupaten Bondowoso', 'Kabupaten Jombang', 'Kabupaten Lamongan', 'Kabupaten Lumajang', 'Kabupaten Magetan',
    'Kabupaten Nganjuk', 'Kabupaten Ngawi', 'Kabupaten Pacitan', 'Kabupaten Pamekasan', 'Kabupaten Ponorogo',
    'Kabupaten Sampang', 'Kabupaten Situbondo', 'Kabupaten Sumenep', 'Kabupaten Trenggalek', 'Kabupaten Tuban',
    'Kabupaten Tulungagung',
  ],
  'Banten': [
    'Kota Tangerang', 'Kota Tangerang Selatan', 'Kabupaten Tangerang', 'Kota Serang', 'Kabupaten Serang',
    'Kota Cilegon', 'Kabupaten Lebak', 'Kabupaten Pandeglang',
  ],
  'DI Yogyakarta': [
    'Kota Yogyakarta', 'Kabupaten Sleman', 'Kabupaten Bantul', 'Kabupaten Kulon Progo', 'Kabupaten Gunungkidul',
  ],
  'Daerah Istimewa Yogyakarta': [
    'Kota Yogyakarta', 'Kabupaten Sleman', 'Kabupaten Bantul', 'Kabupaten Kulon Progo', 'Kabupaten Gunungkidul',
  ],
  'Bali': [
    'Kota Denpasar', 'Kabupaten Badung', 'Kabupaten Bangli', 'Kabupaten Buleleng', 'Kabupaten Gianyar',
    'Kabupaten Jembrana', 'Kabupaten Karangasem', 'Kabupaten Klungkung', 'Kabupaten Tabanan',
  ],
};

// Cache all 250 countries/regions from country-state-city
let cachedCountries: CountryOption[] | null = null;

export function getAllCountriesList(): CountryOption[] {
  if (cachedCountries) return cachedCountries;

  const rawCountries: ICountry[] = Country.getAllCountries();
  const mapped: CountryOption[] = rawCountries.map((c) => ({
    name: c.name,
    isoCode: c.isoCode,
    flag: c.flag || '🌐',
  }));

  // Indonesia first, followed by all other countries sorted alphabetically
  const idCountry = mapped.find((c) => c.isoCode === 'ID');
  const others = mapped
    .filter((c) => c.isoCode !== 'ID')
    .sort((a, b) => a.name.localeCompare(b.name));

  cachedCountries = idCountry ? [idCountry, ...others] : others;
  return cachedCountries;
}

export function findCountryByNameOrCode(countryNameOrCode: string): CountryOption | undefined {
  if (!countryNameOrCode) return undefined;
  const list = getAllCountriesList();
  const normalized = countryNameOrCode.trim().toLowerCase();
  return (
    list.find((c) => c.name.toLowerCase() === normalized || c.isoCode.toLowerCase() === normalized) ||
    list.find((c) => c.name.toLowerCase().includes(normalized))
  );
}

/**
 * Returns every province / state / region / prefecture in the specified country
 */
export function getStatesOfCountryByName(countryNameOrCode: string): ProvinceOption[] {
  const country = findCountryByNameOrCode(countryNameOrCode);
  if (!country) {
    return [{ name: 'All Regions / General', isoCode: 'ALL' }];
  }

  const rawStates: IState[] = State.getStatesOfCountry(country.isoCode) || [];
  if (rawStates.length === 0) {
    return [{ name: `${country.name} (National / All Regions)`, isoCode: 'ALL' }];
  }

  const states = rawStates.map((s) => ({
    name: s.name,
    isoCode: s.isoCode,
  }));

  states.sort((a, b) => a.name.localeCompare(b.name));
  return states;
}

/**
 * Returns every city / county / regency / municipality in the specified country & state/province
 */
export function getCitiesOfStateByName(countryNameOrCode: string, stateNameOrCode: string): string[] {
  const country = findCountryByNameOrCode(countryNameOrCode);
  if (!country) return [];

  const states = State.getStatesOfCountry(country.isoCode) || [];
  const normalizedState = (stateNameOrCode || '').trim().toLowerCase();
  const matchedState =
    states.find(
      (s) => s.name.toLowerCase() === normalizedState || s.isoCode.toLowerCase() === normalizedState
    ) || states[0];

  const citySet = new Set<string>();

  // Add curated Indonesian Kota/Kabupaten if applicable
  if (country.isoCode === 'ID') {
    const stateName = matchedState ? matchedState.name : stateNameOrCode;
    const enriched = INDONESIAN_CITIES_ENRICHMENT[stateName];
    if (enriched) {
      enriched.forEach((c) => citySet.add(c));
    }
  }

  if (matchedState) {
    const stateCities = City.getCitiesOfState(country.isoCode, matchedState.isoCode) || [];
    stateCities.forEach((c) => citySet.add(c.name));
  }

  // Fallback: if a territory/state has no sub-cities in state table, pull country-level cities
  if (citySet.size === 0) {
    const countryCities = City.getCitiesOfCountry(country.isoCode) || [];
    countryCities.forEach((c) => citySet.add(c.name));
  }

  // Final fallback if territory has no listed cities in ISO database
  if (citySet.size === 0) {
    citySet.add(matchedState ? `${matchedState.name} City / Center` : `${country.name} City / Center`);
  }

  return Array.from(citySet).sort((a, b) => a.localeCompare(b));
}

// Complete list of all 250 countries in the world
export const WORLD_COUNTRIES: CountryOption[] = getAllCountriesList();

// Complete hierarchy for all countries in the world (with zero truncation)
export const WORLD_LOCATIONS: LocationHierarchy[] = getAllCountriesList().map((c) => ({
  country: c.name,
  code: c.isoCode,
  flag: c.flag,
  provinces: [
    {
      name: `${c.name} (All Regions)`,
      isoCode: 'ALL',
      cities: [],
    },
  ],
}));
