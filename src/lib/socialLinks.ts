// A member's social accounts live in the one `socialMedia` string: 'Instagram: @a | TikTok: @b'.
// Platform names are stored as written here. An 'Other' account is stored without a prefix, so older free text
// ('@name', a profile URL) stays exactly as it was when a member edits their accounts, and fits the same limit.
export const SOCIAL_PLATFORMS = ['Instagram', 'TikTok', 'X', 'Snapchat', 'Facebook', 'YouTube', 'Threads', 'Twitch', 'Other'];

export interface SocialLink {
  platform: string;
  handle: string;
}

const SEPARATOR = ' | ';

function parseEntry(entry: string): SocialLink {
  const cut = entry.indexOf(': ');
  const platform = entry.slice(0, Math.max(cut, 0));
  return SOCIAL_PLATFORMS.includes(platform)
    ? { platform, handle: entry.slice(cut + 2).trim() }
    : { platform: 'Other', handle: entry.trim() };
}

/** The accounts in a stored value; an empty value gives one empty row with no platform picked (nothing is preselected). */
export function parseSocialLinks(value: unknown): SocialLink[] {
  // Raw / legacy documents may hold non-string values
  const rows = String(value ?? '').split(SEPARATOR).filter((entry) => entry.trim()).map(parseEntry);
  return rows.length ? rows : [{ platform: '', handle: '' }];
}

/** The stored value for these rows: rows without a handle are left out, '' if none is filled in. */
export function joinSocialLinks(rows: SocialLink[]): string {
  return rows
    // Only a '|' that could form the separator goes: 'a|b' and a link containing one stay as typed
    .map((row) => ({ platform: row.platform, handle: row.handle.trim().replace(/(^|\s)\|(?=\s|$)/g, ' ').trim() }))
    .filter((row) => row.handle)
    // No platform picked (the form's native required asks for one) is kept like an 'Other' account, never dropped
    .map((row) => (!row.platform || row.platform === 'Other' ? row.handle : `${row.platform}: ${row.handle}`))
    .join(SEPARATOR);
}

/** The first account without its platform: what duplicate detection compares against a sheet's plain '@name'. */
export function firstSocialHandle(value: string): string {
  return parseEntry(value.split(SEPARATOR)[0]).handle;
}
