import type { LocaleNamespace } from '../../types';

const admin: Partial<LocaleNamespace<'admin'>> = {
  dashboardTitle: 'நிர்வாகி பக்கம்',
  dashboardDesc: 'உறுப்பினர் தரவு பாதுகாப்பு மேலாண்மை.',
  loginPrompt: 'நிர்வாகி கடவுச்சொல் கொண்டு உள்நுழையவும்.',
  privacyRestrictedNotice: 'உறுப்பினர் தனியுரிமைக்காக, உறுப்பினர் பட்டியல் நிர்வாகிக்கு மட்டுமே கிடைக்கும்.',
  exportCsv: 'CSV ஏற்றுமதி',
  totalMembers: 'மொத்த உறுப்பினர்கள்',
  resetFilter: 'மீட்டமைக்க',
};

export default admin;
