// Pure phone helpers for PhoneInput (no React / Firebase, so they run in Node tests).

const DEFAULT_CODE = '62'; // Indonesia, the community's home market

/** Digits of a countries.json phonecode ("1-242" -> "1242"; null -> ""). */
export const dialDigits = (phonecode: string | null | undefined): string => (phonecode || '').replace(/\D/g, '');

/** Parses a stored value into a dial code and the local part (digits only). */
export function splitPhone(value: string, dialCodes: string[]): { code: string; local: string } {
  const raw = (value || '').trim();
  const digits = raw.replace(/\D/g, '');
  if (raw.startsWith('+')) {
    let best = '';
    for (const c of dialCodes) if (c.length > best.length && digits.startsWith(c)) best = c;
    return best ? { code: best, local: digits.slice(best.length) } : { code: '', local: digits };
  }
  if (digits.startsWith(DEFAULT_CODE)) return { code: DEFAULT_CODE, local: digits.slice(DEFAULT_CODE.length) };
  return { code: DEFAULT_CODE, local: digits.replace(/^0+/, '') };
}

/** '+<code><local>' without leading zeros in local; '' when local has no digits. */
export function joinPhone(code: string, local: string): string {
  const digits = local.replace(/\D/g, '').replace(/^0+/, '');
  return digits ? `+${code}${digits}` : '';
}
