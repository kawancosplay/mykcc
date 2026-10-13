import type { LocaleNamespace } from '../../types';

const profile: LocaleNamespace<'profile'> = {
  title: 'Meu Perfil de Membro',
  updateProfile: 'Atualizar Perfil em Tempo Real',

  // Hero
  changeAvatar: 'Alterar foto de perfil',
  verifiedActive: 'Verificado & Ativo',
  kccIdLabel: 'KCC ID (16 DÍGITOS)',
  copyKccId: 'Copiar KCC ID',
  viewIdCard: 'Ver Cartão de Membro',

  // Profile form
  infoTitle: 'Informações do Perfil de Membro',
  infoDesc: 'Você pode alterar estas informações a qualquer momento; elas são salvas em tempo real no banco de dados do MyKCC.',
  savedRealtime: 'Salvo em Tempo Real!',
  ageCategoryLabel: 'Faixa Etária',
  ageLabel: 'Idade / Aniversário (Opcional)',
  agePlaceholder: 'ex.: 21 anos ou 15 de maio',
  whatsappLabel: 'Número de WhatsApp Ativo',
  backupPhoneLabel: 'Segundo Número de WhatsApp / Reserva',
  backupPhonePlaceholder: 'ex.: 0812... ou +62 857...',
  discordPlaceholder: 'ex.: alyachan_cos ou user#0001',
  roleLabel: 'Função Principal na Comunidade',
  customRolePlaceholder: 'Digite sua outra função / especialidade...',
  socialMediaPlaceholder: '@usuario (Instagram / X / TikTok)',
  reasonLabel: 'Motivo para Entrar & Notas do Perfil',

  // Short primary role labels for the profile dropdown (the stored primaryRole values are unchanged)
  roleIdolFan: 'Fã de Idols / Wota',
  roleOtaku: 'Otaku de Anime, Mangá & Games',
  roleGeneralEnthusiast: 'Entusiasta Geral / Apoiador',
  rolePropMaker: 'Prop Maker / Artesão',
  roleCostumeMaker: 'Figurinista / Costureiro(a)',
  roleEventCrew: 'Equipe de Eventos & Staff',
};

export default profile;
