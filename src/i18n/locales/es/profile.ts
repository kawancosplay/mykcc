import type { LocaleNamespace } from '../../types';

const profile: LocaleNamespace<'profile'> = {
  title: 'Mi perfil de miembro',
  updateProfile: 'Actualiza tu perfil en tiempo real',

  // Hero
  changeAvatar: 'Cambiar foto de perfil',
  verifiedActive: 'Verificado y activo',
  kccIdLabel: 'KCC ID (16 DÍGITOS)',
  copyKccId: 'Copiar KCC ID',
  viewIdCard: 'Ver carné de miembro',

  // Profile form
  infoTitle: 'Información del perfil de miembro',
  infoDesc: 'Puedes cambiar esta información cuando quieras; se guarda en tiempo real en la base de datos de MyKCC.',
  savedRealtime: '¡Guardado en tiempo real!',
  ageCategoryLabel: 'Categoría de edad',
  ageLabel: 'Edad / Cumpleaños (opcional)',
  agePlaceholder: 'p. ej. 21 años o 15 de mayo',
  whatsappLabel: 'Número de WhatsApp activo',
  backupPhoneLabel: 'Segundo número de WhatsApp / de respaldo',
  backupPhonePlaceholder: 'p. ej. 0812... o +62 857...',
  discordPlaceholder: 'p. ej. alyachan_cos o user#0001',
  roleLabel: 'Rol principal en la comunidad',
  customRolePlaceholder: 'Escribe tu otro rol / especialidad...',
  socialMediaPlaceholder: '@usuario (Instagram / X / TikTok)',
  reasonLabel: 'Motivo para unirte y notas del perfil',

  // Short primary role labels for the profile dropdown (the stored primaryRole values are unchanged)
  roleIdolFan: 'Fan de idols / Wota',
  roleOtaku: 'Otaku de anime, manga y videojuegos',
  roleGeneralEnthusiast: 'Aficionado general / Simpatizante',
  rolePropMaker: 'Creador de props / Crafter',
  roleCostumeMaker: 'Confección de trajes / Costura',
  roleEventCrew: 'Equipo y staff de eventos',
};

export default profile;
