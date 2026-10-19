/**
 * Admin "Edit details" form inside MemberSupportModal. Edits MEMBER_ADMIN_EDITABLE_FIELDS only (never the
 * KCC ID, login link, source or registration date; the avatar stays the member's own). Inputs carry the
 * rule limits (MEMBER_FIELD_LIMITS), only CHANGED fields are sent to adminUpdateMember, and a success state
 * is shown only after the write resolved.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Save, X } from 'lucide-react';
import type { Member } from '../../types';
import { adminUpdateMember } from '../../lib/firestoreService';
import { MEMBER_FIELD_LIMITS } from '../../lib/memberRules';
import { MAX_ADDITIONAL_PHONES } from '../../lib/idGenerator';
import { describeFirestoreError } from '../../lib/firebase';
import { haptic } from '../../lib/haptic';
import { useI18n } from '../../i18n';
import type { TranslationKey } from '../../i18n';
import { MEMBER_STATUSES, NoticeBanner, STATUS_LABEL_KEYS, Spinner } from './adminUi';
import type { AdminNotice } from './adminUi';

// Stored ageCategory values (same as the member-list filter); only the labels are translated
const AGE_CATEGORY_OPTIONS: ReadonlyArray<{ value: string; label: TranslationKey }> = [
  { value: 'Legal Age / Dewasa (18+)', label: 'admin.filterLegalAge' },
  { value: 'Minor / Di Bawah Umur (<18)', label: 'admin.filterMinor' },
  { value: 'Memilih untuk tidak menyebutkan', label: 'admin.filterPreferNotToSay' },
];

// Plain string fields of the form (additionalPhones is a list, handled separately)
type TextField =
  | 'name'
  | 'fullName'
  | 'email'
  | 'phone'
  | 'phone2'
  | 'discordUsername'
  | 'socialMedia'
  | 'portfolioUrl'
  | 'country'
  | 'province'
  | 'city'
  | 'ageCategory'
  | 'age'
  | 'birthday'
  | 'primaryRole'
  | 'fandom'
  | 'experience'
  | 'reason'
  | 'status';

type FormState = Record<TextField, string> & { additionalPhones: string[] };

const TEXT_FIELDS: readonly TextField[] = [
  'name',
  'fullName',
  'email',
  'phone',
  'phone2',
  'discordUsername',
  'socialMedia',
  'portfolioUrl',
  'country',
  'province',
  'city',
  'ageCategory',
  'age',
  'birthday',
  'primaryRole',
  'fandom',
  'experience',
  'reason',
  'status',
];

const str = (value: unknown): string => (typeof value === 'string' ? value : '');

function initialState(member: Member): FormState {
  return {
    name: str(member.name) || str(member.cosplayName),
    fullName: str(member.fullName),
    email: str(member.email),
    phone: str(member.phone),
    phone2: str(member.phone2),
    discordUsername: str(member.discordUsername),
    socialMedia: str(member.socialMedia),
    portfolioUrl: str(member.portfolioUrl),
    country: str(member.country),
    province: str(member.province),
    city: str(member.city),
    ageCategory: str(member.ageCategory),
    age: str(member.age),
    birthday: str(member.birthday),
    primaryRole: str(member.primaryRole),
    fandom: str(member.fandom),
    experience: str(member.experience),
    reason: str(member.reason),
    status: str(member.status) || 'verified',
    additionalPhones: Array.isArray(member.additionalPhones)
      ? member.additionalPhones.filter((p): p is string => typeof p === 'string' && p.trim() !== '')
      : [],
  };
}

/** Fields whose value differs from the initial state (trimmed comparison; empty extra-phone rows ignored). */
function changedFields(initial: FormState, current: FormState): Partial<Member> {
  const changes: Record<string, unknown> = {};
  for (const field of TEXT_FIELDS) {
    if (current[field].trim() !== initial[field].trim()) changes[field] = current[field].trim();
  }
  const cleanPhones = (list: string[]) => list.map((p) => p.trim()).filter(Boolean);
  const before = cleanPhones(initial.additionalPhones);
  const after = cleanPhones(current.additionalPhones);
  if (JSON.stringify(before) !== JSON.stringify(after)) changes.additionalPhones = after;
  return changes as Partial<Member>;
}

const limitOf = (field: TextField): number | undefined => {
  if (field === 'status') return undefined;
  return (MEMBER_FIELD_LIMITS as Record<string, number>)[field];
};

export interface MemberEditFormProps {
  member: Member;
  onCancel: () => void;
  onSaved: (m: Member) => void;
  /** Reports unsaved changes (the sheet disables drag-to-dismiss and confirms before discarding). */
  onDirtyChange?: (dirty: boolean) => void;
  /** Disables the form while another action of the support modal runs. */
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
}

export const MemberEditForm: React.FC<MemberEditFormProps> = ({
  member,
  onCancel,
  onSaved,
  onDirtyChange,
  disabled = false,
  onBusyChange,
}) => {
  const { t } = useI18n();
  // The initial values are taken once per opened member (a live snapshot update must not wipe typing)
  const [initial, setInitial] = useState<FormState>(() => initialState(member));
  const [form, setForm] = useState<FormState>(() => initialState(member));
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<AdminNotice | null>(null);

  useEffect(() => {
    const next = initialState(member);
    setInitial(next);
    setForm(next);
    setNotice(null);
    // Only when a different member is opened
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member.id]);

  const changes = useMemo(() => changedFields(initial, form), [initial, form]);
  const dirty = Object.keys(changes).length > 0;

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  useEffect(() => () => onDirtyChange?.(false), [onDirtyChange]);

  const setField = (field: TextField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (notice) setNotice(null);
  };

  const setExtraPhone = (index: number, value: string) => {
    setForm((prev) => {
      const list = [...prev.additionalPhones];
      list[index] = value;
      return { ...prev, additionalPhones: list };
    });
  };

  const removeExtraPhone = (index: number) => {
    setForm((prev) => ({ ...prev, additionalPhones: prev.additionalPhones.filter((_, i) => i !== index) }));
  };

  const addExtraPhone = () => {
    setForm((prev) =>
      prev.additionalPhones.length >= MAX_ADDITIONAL_PHONES
        ? prev
        : { ...prev, additionalPhones: [...prev.additionalPhones, ''] }
    );
  };

  const handleCancel = () => {
    if (dirty && !window.confirm(t('admin.discardChanges'))) return;
    onCancel();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || disabled) return;
    if (!dirty) {
      setNotice({ kind: 'info', text: t('admin.noChanges') });
      return;
    }
    if (!form.name.trim()) {
      setNotice({ kind: 'error', text: t('errors.nameRequired') });
      return;
    }
    setSaving(true);
    onBusyChange?.(true);
    setNotice(null);
    try {
      const updated = await adminUpdateMember(member, changes);
      haptic('success');
      const next = initialState(updated);
      setInitial(next);
      setForm(next);
      onSaved(updated);
    } catch (error) {
      console.error('Admin member edit failed:', error);
      haptic('error');
      setNotice({ kind: 'error', text: describeFirestoreError(error) });
    } finally {
      setSaving(false);
      onBusyChange?.(false);
    }
  };

  const locked = saving || disabled;
  const inputClass =
    'w-full px-3.5 py-2.5 liquid-glass-input rounded-xl text-base text-white disabled:opacity-60';
  const labelClass = 'block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5';

  const renderInput = (
    field: TextField,
    label: TranslationKey,
    options: { type?: string; required?: boolean; inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']; note?: string } = {}
  ) => {
    const id = `admin-edit-${member.id}-${field}`;
    return (
      <div>
        <label htmlFor={id} className={labelClass}>
          {t(label)}
          {!options.required && <span className="ms-1 font-normal normal-case text-slate-500">{t('common.optional')}</span>}
        </label>
        <input
          id={id}
          type={options.type || 'text'}
          inputMode={options.inputMode}
          value={form[field]}
          onChange={(e) => setField(field, e.target.value)}
          maxLength={limitOf(field)}
          required={options.required}
          disabled={locked}
          autoComplete="off"
          className={inputClass}
        />
        {options.note && <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">{options.note}</p>}
      </div>
    );
  };

  const knownAgeValues = AGE_CATEGORY_OPTIONS.map((o) => o.value);
  const extraAgeValue = form.ageCategory && !knownAgeValues.includes(form.ageCategory) ? form.ageCategory : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <NoticeBanner notice={notice} onDismiss={() => setNotice(null)} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {renderInput('name', 'admin.csvCosname', { required: true })}
        {renderInput('fullName', 'admin.csvLegalName')}
      </div>

      {renderInput('email', 'admin.csvEmail', { type: 'email', inputMode: 'email', note: t('admin.emailChangeNote') })}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {renderInput('phone', 'admin.csvPrimaryWhatsapp', { type: 'tel', inputMode: 'tel' })}
        {renderInput('phone2', 'admin.csvBackupWhatsapp', { type: 'tel', inputMode: 'tel' })}
      </div>

      {/* Extra WhatsApp numbers (additionalPhones, up to 3) */}
      <fieldset className="glass-well rounded-2xl p-3.5 space-y-2.5" disabled={locked}>
        <legend className="sr-only">{t('admin.extraPhonesLabel')}</legend>
        <p className={labelClass}>
          {t('admin.extraPhonesLabel')}
          <span className="ms-1 font-normal normal-case text-slate-500">{t('common.optional')}</span>
        </p>
        {form.additionalPhones.map((phone, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setExtraPhone(index, e.target.value)}
              maxLength={MEMBER_FIELD_LIMITS.phone}
              aria-label={`${t('admin.extraPhonesLabel')} ${index + 1}`}
              autoComplete="off"
              className={`${inputClass} flex-1 min-w-0`}
            />
            <button
              type="button"
              onClick={() => removeExtraPhone(index)}
              className="glass-icon-button pressable"
              aria-label={t('admin.removeExtraPhone')}
              title={t('admin.removeExtraPhone')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {form.additionalPhones.length < MAX_ADDITIONAL_PHONES && (
          <button
            type="button"
            onClick={addExtraPhone}
            className="glass-button pressable w-full sm:w-auto px-3.5 text-xs pointer-coarse:min-h-11"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{t('admin.addExtraPhone')}</span>
          </button>
        )}
      </fieldset>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {renderInput('discordUsername', 'admin.csvDiscord')}
        {renderInput('socialMedia', 'admin.fieldSocialMedia')}
      </div>
      {renderInput('portfolioUrl', 'admin.fieldPortfolio', { type: 'url', inputMode: 'url' })}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {renderInput('country', 'admin.csvCountry')}
        {renderInput('province', 'admin.csvProvince')}
        {renderInput('city', 'admin.csvCity')}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor={`admin-edit-${member.id}-ageCategory`} className={labelClass}>
            {t('admin.csvAgeCategory')}
          </label>
          <select
            id={`admin-edit-${member.id}-ageCategory`}
            value={form.ageCategory}
            onChange={(e) => setField('ageCategory', e.target.value)}
            disabled={locked}
            className={inputClass}
          >
            <option value="" className="bg-slate-900 text-white">
              —
            </option>
            {AGE_CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-slate-900 text-white">
                {t(o.label)}
              </option>
            ))}
            {extraAgeValue && (
              <option value={extraAgeValue} className="bg-slate-900 text-white">
                {extraAgeValue}
              </option>
            )}
          </select>
        </div>
        {renderInput('age', 'admin.csvAge')}
        {renderInput('birthday', 'admin.fieldBirthday')}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {renderInput('primaryRole', 'admin.csvPrimaryRole')}
        {renderInput('fandom', 'admin.csvFandom')}
        {renderInput('experience', 'admin.csvExperience')}
      </div>

      <div>
        <label htmlFor={`admin-edit-${member.id}-reason`} className={labelClass}>
          {t('admin.fieldReason')}
          <span className="ms-1 font-normal normal-case text-slate-500">{t('common.optional')}</span>
        </label>
        <textarea
          id={`admin-edit-${member.id}-reason`}
          value={form.reason}
          onChange={(e) => setField('reason', e.target.value)}
          maxLength={MEMBER_FIELD_LIMITS.reason}
          rows={3}
          disabled={locked}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor={`admin-edit-${member.id}-status`} className={labelClass}>
          {t('admin.colStatus')}
        </label>
        <select
          id={`admin-edit-${member.id}-status`}
          value={form.status}
          onChange={(e) => setField('status', e.target.value)}
          disabled={locked}
          className={inputClass}
        >
          {MEMBER_STATUSES.map((s) => (
            <option key={s} value={s} className="bg-slate-900 text-white">
              {t(STATUS_LABEL_KEYS[s])}
            </option>
          ))}
        </select>
      </div>

      <div
        className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="glass-button pressable px-4 text-sm pointer-coarse:min-h-11"
        >
          {t('admin.cancel')}
        </button>
        <button
          type="submit"
          disabled={locked}
          className="btn-primary pressable px-4 text-sm pointer-coarse:min-h-11"
        >
          {saving ? <Spinner /> : <Save className="w-4 h-4 shrink-0" aria-hidden="true" />}
          <span>{t('admin.saveChanges')}</span>
        </button>
      </div>
    </form>
  );
};
