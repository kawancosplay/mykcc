import { useId } from 'react';
import { useI18n } from '../i18n';

interface AgeBirthdayFieldsProps {
  age: string;
  birthday: string;
  onAgeChange: (age: string) => void;
  onBirthdayChange: (birthday: string) => void;
  labelClassName: string;
}

/** Optional age (digits only) and birthday (browser calendar, stored as YYYY-MM-DD): two cells for the parent's grid. */
export default function AgeBirthdayFields({ age, birthday, onAgeChange, onBirthdayChange, labelClassName }: AgeBirthdayFieldsProps) {
  const { t } = useI18n();
  const id = useId();

  return (
    <>
      <div>
        <label htmlFor={`${id}-age`} className={labelClassName}>
          {t('registration.ageLabel')}
        </label>
        <input
          id={`${id}-age`}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={3}
          placeholder="21"
          value={age}
          onChange={(e) => onAgeChange(e.target.value.replace(/\D/g, ''))}
          className="glass-input w-full text-base sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor={`${id}-birthday`} className={labelClassName}>
          {t('registration.birthdayLabel')}
        </label>
        <input
          id={`${id}-birthday`}
          type="date"
          min="1900-01-01"
          max={new Date().toISOString().slice(0, 10)}
          value={birthday}
          onChange={(e) => onBirthdayChange(e.target.value)}
          // On a computer only the small icon opens the calendar otherwise
          onClick={(e) => e.currentTarget.showPicker?.()}
          className="glass-input w-full min-h-11 text-base sm:text-sm"
        />
      </div>
    </>
  );
}
