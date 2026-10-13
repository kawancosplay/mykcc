import type { LocaleNamespace } from '../../types';

const stats: LocaleNamespace<'stats'> = {
  badge: 'Analítica de la comunidad',
  subtitle: 'Demografía e intereses de KawanCosplay',
  title: 'Estadísticas y demografía de la comunidad',
  description: 'Un resumen de la comunidad de miembros de KawanCosplay por división de habilidades, ciudad de residencia y fandom favorito.',
  allVerifiedActive: '100% verificados y activos',
  webFormLabel: 'Formulario de registro web',
  webFormDesc: 'Registrados a través del nuevo sistema',
  googleFormLabel: 'Sincronización de Google Form',
  googleFormDesc: 'De la sincronización de transición en vivo',
  citiesLabel: 'Ciudades de residencia',
  citiesDesc: 'Ciudades de toda Indonesia',
  rolesTitle: 'Roles en la comunidad',
  rolesDesc: 'La mezcla de cosplayers, crafters, fotógrafos, maquilladores y equipo de staff',
  regionsTitle: 'Distribución regional / por ciudad',
  regionsDesc: 'Ciudades de residencia de los miembros, para planear encuentros regionales y sesiones de fotos',
  fandomsTitle: 'Fandoms principales e intereses por personaje',
  fandomsDesc: 'Los títulos de anime, videojuegos y series más populares para proyectos de cosplay grupal',
  fandomInterest: 'Interés en proyectos de cosplay',
  countWithPercent: '{count} ({percent})',
  memberCountOne: '{count} miembro',
  memberCountOther: '{count} miembros',
  // Labels for the fallback buckets of members without a role / city / fandom
  otherLabel: 'Otros',
  fandomAnimeGames: 'Anime y videojuegos',
};

export default stats;
