// A member's social accounts live in the one `socialMedia` string: 'Instagram: @a | TikTok: @b'.
// Platform names are stored as written here (only 'Other' is translated, when shown).
export const SOCIAL_PLATFORMS = ['Instagram', 'TikTok', 'X', 'Facebook', 'YouTube', 'Threads', 'Twitch', 'Other'];

export interface SocialLink {
  platform: string;
  handle: string;
}

const SEPARATOR = ' | ';

// Older free text ('@name', a profile URL) has no known platform in front: it becomes an 'Other' account.
function parseEntry(entry: string): SocialLink {
  const cut = entry.indexOf(': ');
  const platform = entry.slice(0, Math.max(cut, 0));
  return SOCIAL_PLATFORMS.includes(platform)
    ? { platform, handle: entry.slice(cut + 2).trim() }
    : { platform: 'Other', handle: entry.trim() };
}

/** The accounts in a stored value; an empty value gives one empty row to fill in. */
export function parseSocialLinks(value: string): SocialLink[] {
  const rows = value.split(SEPARATOR).filter((entry) => entry.trim()).map(parseEntry);
  return rows.length ? rows : [{ platform: SOCIAL_PLATFORMS[0], handle: '' }];
}

/** The stored value for these rows: rows without a handle are left out, '' if none is filled in. */
export function joinSocialLinks(rows: SocialLink[]): string {
  return rows
    .map((row) => ({ platform: row.platform, handle: row.handle.replace(/\|/g, ' ').trim() }))
    .filter((row) => row.handle)
    .map((row) => `${row.platform}: ${row.handle}`)
    .join(SEPARATOR);
}

/** The first account without its platform: what duplicate detection compares against a sheet's plain '@name'. */
export function firstSocialHandle(value: string): string {
  return parseEntry(value.split(SEPARATOR)[0]).handle;
}
