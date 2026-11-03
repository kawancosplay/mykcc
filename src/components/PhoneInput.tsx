import { useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useI18n } from '../i18n';
import { getAllCountriesList, useWorldLocations } from '../lib/worldLocations';
import { joinPhone, splitPhone } from '../lib/phoneNumber';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  invalid?: boolean;
  placeholder?: string;
  ariaLabel?: string;
  inputRef?: (el: HTMLInputElement | null) => void;
}

/** Country-code dropdown (native select over a short label) + a digits-only number box. Value: '+62812…' or ''. */
export default function PhoneInput({ value, onChange, required, invalid, placeholder, ariaLabel, inputRef }: PhoneInputProps) {
  const { t, countryName } = useI18n();
  useWorldLocations('');
  const countries = getAllCountriesList();
  const dialCodes = useMemo(() => countries.map((c) => c.dial).filter(Boolean), [countries]);

  const [local, setLocal] = useState(() => splitPhone(value, dialCodes).local);
  const [code, setCode] = useState(() => splitPhone(value, dialCodes).code);
  // The last value this component emitted; any other incoming value (reset, preset, profile load) is re-parsed
  const lastEmitted = useRef(value);
  if (value !== lastEmitted.current) {
    lastEmitted.current = value;
    const next = splitPhone(value, dialCodes);
    setLocal(next.local);
    setCode(next.code);
  } else if (!code && value.startsWith('+')) {
    // Parsed before the country list arrived (only +62 known then): retry now that more codes may be known
    const next = splitPhone(value, dialCodes);
    if (next.code) {
      setLocal(next.local);
      setCode(next.code);
    }
  }

  // Several countries can share a code (+1): keep the one picked, else the first
  const [iso, setIso] = useState('');
  const selected =
    countries.find((c) => c.isoCode === iso && c.dial === code) || countries.find((c) => c.dial === code);

  const emit = (nextCode: string, nextLocal: string) => {
    const out = joinPhone(nextCode, nextLocal);
    lastEmitted.current = out;
    onChange(out);
  };

  const handleInput = (raw: string) => {
    let nextCode = code;
    let text = raw;
    if (raw.trimStart().startsWith('+')) {
      const parsed = splitPhone(raw, dialCodes);
      if (parsed.code) {
        nextCode = parsed.code;
        text = parsed.local;
        setCode(nextCode);
        setIso('');
      }
    }
    const nextLocal = text.replace(/\D/g, '');
    setLocal(nextLocal);
    emit(nextCode, nextLocal);
  };

  return (
    // Phone numbers read left to right in every language (RTL would show "62+" with the code after the number)
    <div dir="ltr" className="flex gap-2">
      <div className="glass-input relative shrink-0 flex items-center gap-1 px-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[rgba(83,255,192,0.85)]">
        <span aria-hidden="true" className="text-base sm:text-sm font-mono whitespace-nowrap">
          {selected?.flag || '🌐'} +{code}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400" aria-hidden="true" />
        <select
          aria-label={t('common.phoneCountryCode')}
          value={selected?.isoCode ?? ''}
          onChange={(e) => {
            const c = countries.find((x) => x.isoCode === e.target.value);
            if (!c) return;
            setIso(c.isoCode);
            setCode(c.dial);
            emit(c.dial, local);
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-base"
        >
          {!selected && <option value="">+{code}</option>}
          {countries.map((c) => (
            <option key={c.isoCode} value={c.isoCode}>
              {c.flag} {countryName(c.isoCode, c.name)} +{c.dial}
            </option>
          ))}
        </select>
      </div>
      <input
        ref={inputRef}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        pattern="[0-9]*"
        maxLength={15}
        required={required}
        aria-invalid={invalid || undefined}
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={local}
        onChange={(e) => handleInput(e.target.value)}
        className="glass-input min-w-0 flex-1 text-base sm:text-sm font-mono"
      />
    </div>
  );
}
