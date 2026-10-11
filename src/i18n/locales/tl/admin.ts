import type { LocaleNamespace } from '../../types';

const admin: Partial<LocaleNamespace<'admin'>> = {
  dashboardTitle: 'Admin Dashboard',
  dashboardDesc: 'Nakalaang portal para sa pamamahala ng database ng mga miyembro.',
  loginPrompt: 'Ilagay ang Admin Passkey o mag-login gamit ang opisyal na email.',
  privacyRestrictedNotice: 'Para sa privacy ng miyembro, ang talaan ng miyembro ay limitado sa Admin lamang.',
  exportCsv: 'I-export ang CSV',
  totalMembers: 'Kabuuang Miyembro',
  resetFilter: 'I-reset ang Filter',
};

export default admin;
