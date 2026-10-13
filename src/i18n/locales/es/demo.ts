import type { LocaleNamespace } from '../../types';

const demo: LocaleNamespace<'demo'> = {
  // Sandbox header
  title: 'Entorno de pruebas del formulario demo',
  sandboxBadge: 'Modo sandbox',
  description:
    'Autorrelleno con presets en 1 clic para probar la generación del KCC ID (UID por marca de tiempo, UID de admin 0001-0100, cuenta principal 0000).',
  randomizeTitle: 'Generar un perfil aleatorio',
  randomize: 'Aleatorio',

  // KCC ID allocation rules
  rulesTitle: 'Reglas del ID de usuario de KawanCosplay:',
  ruleMainAccount: 'Cuenta principal KCC',
  ruleAdminRange: 'Rango de admins KCC',
  ruleTimestamp: 'UID de miembro ordenado por marca de tiempo',

  // Preset cards
  previewName: 'Nombre:',
  previewWhatsapp: 'WA:',
  previewDiscord: 'DC:',
  fillForm: 'Completar formulario',
  submitTest: 'Enviar prueba',
  tip: 'Consejo: haz clic en "{action}" para simular el envío al instante y ver el carné con el KCC ID generado y el desbloqueo de WhatsApp.',
  presetLoaded: 'Preset cargado',

  // Presets
  presetCosplayerName: 'Cosplayer demo (UID por marca de tiempo)',
  presetCosplayerBadge: 'UID por marca de tiempo',
  presetCosplayerDesc: 'UID de 16 dígitos ordenado por la marca de tiempo del envío (YYYYMMDDHHmmssSeq)',
  presetAdminName: 'Admin KCC demo (UID 0001-0100)',
  presetAdminBadge: 'Rango de UID de admin',
  presetAdminDesc: 'UID 0000 0000 0000 0001 a 0000 0000 0000 0100 para los admins de KCC',
  presetMainAccountName: 'Cuenta principal KCC demo (UID 0000)',
  presetMainAccountDesc: 'UID 0000 0000 0000 0000 reservado estrictamente para la cuenta principal cosplaysehat@gmail.com',
  presetPropMakerName: 'Creador de props / Crafter demo',
  presetPropMakerBadge: 'Crafter (marca de tiempo)',
  presetPropMakerDesc: 'Artesano de props y armaduras con UID basado en marca de tiempo',
  presetPhotographerName: 'Fotógrafo de cosplay demo',
  presetPhotographerBadge: 'Fotógrafo',
  presetPhotographerDesc: 'Fotógrafo y videógrafo con UID basado en marca de tiempo',
  presetOthersName: 'Otros / Rol personalizado demo',
  presetOthersBadge: 'Rol "Otros"',
  presetOthersDesc: 'Rol personalizado "Otros" especializado en maquillaje de cosplay y estilismo de pelucas',
  presetDuplicateName: 'Prueba de KCC ID único (coincidencia: {name})',
  presetDuplicateBadge: 'Verificación de KCC ID único',
  presetDuplicateDesc: 'Verifica que un WhatsApp coincidente conserve el KCC ID: {id}',
  presetSecondaryPhoneName: 'Prueba de teléfono secundario (2 números: {name})',
  presetSecondaryPhoneBadge: 'Verificación de 2 números WA',
  presetSecondaryPhoneDesc: 'Añade un teléfono secundario y conserva el KCC ID: {id}',
};

export default demo;
