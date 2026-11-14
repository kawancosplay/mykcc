import { useRef, useState } from 'react';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import { useI18n } from '../i18n';
import { joinSocialLinks, parseSocialLinks, SOCIAL_PLATFORMS, type SocialLink } from '../lib/socialLinks';
import { MEMBER_FIELD_LIMITS } from '../lib/memberRules';

const MAX_ROWS = 6;

interface SocialLinksInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  invalid?: boolean;
}

/** One row per account: platform dropdown (native select over a label, like PhoneInput) + username or link. */
export default function SocialLinksInput({ value, onChange, required, invalid }: SocialLinksInputProps) {
  const { t } = useI18n();
  const [rows, setRows] = useState(() => parseSocialLinks(value));
  const [tooLong, setTooLong] = useState(false);
  // The last value this component emitted; any other incoming value (reset, preset, profile load) is re-parsed.
  // Nothing is emitted until the user types, so saving a profile never rewrites an untouched older value.
  const lastEmitted = useRef(value);
  if (value !== lastEmitted.current) {
    lastEmitted.current = value;
    setRows(parseSocialLinks(value));
    setTooLong(false);
  }

  const update = (next: SocialLink[]) => {
    const out = joinSocialLinks(next);
    // firestore.rules caps the whole string. Refused instead of cut (a save would silently lose the end of a link);
    // an edit that makes it shorter always goes through.
    const refused = out.length > MEMBER_FIELD_LIMITS.socialMedia && out.length > joinSocialLinks(rows).length;
    setTooLong(refused);
    if (refused) return;
    lastEmitted.current = out;
    setRows(next);
    onChange(out);
  };
  const updateRow = (index: number, change: Partial<SocialLink>) =>
    update(rows.map((row, i) => (i === index ? { ...row, ...change } : row)));

  const platformLabel = (platform: string) => (platform === 'Other' ? t('common.socialPlatformOther') : platform);
  // Whichever row is filled counts: the first row is only required while all of them are empty
  const firstRowRequired = required && !rows.some((row) => row.handle.trim());

  return (
    <div>
      <div className="space-y-4 sm:space-y-2">
        {rows.map((row, index) => (
          <div key={index} className="flex flex-wrap sm:flex-nowrap gap-2">
            <div className="glass-input relative min-w-0 flex-1 sm:flex-none sm:w-36 flex items-center justify-between gap-1 px-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#7C3AED] bg-white border-[1.5px] border-slate-300">
              <span aria-hidden="true" className={`text-base sm:text-sm truncate ${row.platform ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                {row.platform ? platformLabel(row.platform) : t('common.socialPlatform')}
              </span>
              <ChevronDown className="w-4 h-4 shrink-0 text-slate-500" aria-hidden="true" />
              <select
                aria-label={t('common.socialPlatform')}
                value={row.platform}
                required={!!row.handle.trim()}
                onChange={(e) => updateRow(index, { platform: e.target.value })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-base bg-white text-slate-900"
              >
                {!row.platform && <option value="">—</option>}
                {SOCIAL_PLATFORMS.map((platform) => (
                  <option key={platform} value={platform} className="bg-white text-slate-900">
                    {platformLabel(platform)}
                  </option>
                ))}
              </select>
            </div>
            {/* On a phone the handle gets its own line: next to the dropdown and the button it would be too narrow */}
            <input
              type="text"
              dir="auto"
              autoComplete="off"
              required={index === 0 && firstRowRequired}
              aria-invalid={(index === 0 && invalid) || undefined}
              aria-label={t('common.socialHandlePlaceholder')}
              placeholder={t('common.socialHandlePlaceholder')}
              value={row.handle}
              onChange={(e) => updateRow(index, { handle: e.target.value })}
              className="glass-input order-last sm:order-none basis-full sm:basis-0 min-w-0 flex-1 text-base sm:text-sm bg-white border-[1.5px] border-slate-300 text-slate-900"
            />
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => update(rows.filter((_, i) => i !== index))}
                title={t('common.socialRemovePlatform')}
                aria-label={t('common.socialRemovePlatform')}
                className="glass-icon-button pressable shrink-0 w-11 h-11 text-slate-600 hover:text-rose-600 bg-white border border-slate-300"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        ))}
      </div>
      {tooLong && (
        <p role="alert" className="text-xs text-rose-700 font-semibold mt-2">
          {t('common.socialTooLong', { max: MEMBER_FIELD_LIMITS.socialMedia })}
        </p>
      )}
      {rows.length < MAX_ROWS && (
        <button
          type="button"
          onClick={() => update([...rows, { platform: '', handle: '' }])}
          className="glass-button pressable w-full sm:w-auto min-h-11 mt-2 px-4 rounded-xl text-sm text-emerald-800 bg-emerald-50 border border-emerald-300 font-bold hover:bg-emerald-100"
        >
          <Plus className="w-4 h-4 text-emerald-700" aria-hidden="true" />
          <span>{t('common.socialAddPlatform')}</span>
        </button>
      )}
    </div>
  );
}
