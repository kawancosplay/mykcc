import { useRef, useState } from 'react';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import { useI18n } from '../i18n';
import { joinSocialLinks, parseSocialLinks, SOCIAL_PLATFORMS, type SocialLink } from '../lib/socialLinks';

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
  // The last value this component emitted; any other incoming value (reset, preset, profile load) is re-parsed.
  // Nothing is emitted until the user types, so saving a profile never rewrites an untouched older value.
  const lastEmitted = useRef(value);
  if (value !== lastEmitted.current) {
    lastEmitted.current = value;
    setRows(parseSocialLinks(value));
  }

  const update = (next: SocialLink[]) => {
    const out = joinSocialLinks(next);
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
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={index} className="flex flex-wrap sm:flex-nowrap gap-2">
            <div className="glass-input relative min-w-0 flex-1 sm:flex-none sm:w-36 flex items-center justify-between gap-1 px-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[rgba(83,255,192,0.85)]">
              <span aria-hidden="true" className="text-base sm:text-sm truncate">
                {platformLabel(row.platform)}
              </span>
              <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" aria-hidden="true" />
              <select
                aria-label={t('common.socialPlatform')}
                value={row.platform}
                onChange={(e) => updateRow(index, { platform: e.target.value })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-base"
              >
                {SOCIAL_PLATFORMS.map((platform) => (
                  <option key={platform} value={platform}>
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
              maxLength={60}
              required={index === 0 && firstRowRequired}
              aria-invalid={(index === 0 && invalid) || undefined}
              aria-label={t('common.socialHandlePlaceholder')}
              placeholder={t('common.socialHandlePlaceholder')}
              value={row.handle}
              onChange={(e) => updateRow(index, { handle: e.target.value })}
              className="glass-input order-last sm:order-none basis-full sm:basis-0 min-w-0 flex-1 text-base sm:text-sm"
            />
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => update(rows.filter((_, i) => i !== index))}
                title={t('common.socialRemovePlatform')}
                aria-label={t('common.socialRemovePlatform')}
                className="glass-icon-button pressable shrink-0 w-11 h-11 text-slate-300 hover:text-rose-300"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        ))}
      </div>
      {rows.length < MAX_ROWS && (
        <button
          type="button"
          onClick={() =>
            update([
              ...rows,
              { platform: SOCIAL_PLATFORMS.find((p) => !rows.some((row) => row.platform === p)) ?? 'Other', handle: '' },
            ])
          }
          className="glass-button pressable w-full sm:w-auto min-h-11 mt-2 px-4 rounded-xl text-sm text-emerald-300"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>{t('common.socialAddPlatform')}</span>
        </button>
      )}
    </div>
  );
}
