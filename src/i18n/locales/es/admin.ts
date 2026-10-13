import type { LocaleNamespace } from '../../types';

const admin: LocaleNamespace<'admin'> = {
  dashboardTitle: 'Panel de admin de KawanCosplay',
  dashboardDesc: 'Portal de admin restringido para el padrón de miembros de la comunidad y la sincronización con Google Sheets.',
  privacyRestrictedNotice: 'Para proteger la privacidad de los miembros, el padrón de miembros está estrictamente restringido a los admins de KawanCosplay.',
  exportCsv: 'Exportar CSV',
  totalMembers: 'Total de miembros registrados',
  resetFilter: 'Restablecer filtros',

  // Lock screen (not signed in as an admin)
  checkingAccess: 'Comprobando el acceso de admin...',
  signedInNotAdmin: 'Sesión iniciada como {account}: esta cuenta no es admin de KCC.',
  emailNotVerified: 'Correo no verificado: usa el inicio de sesión con Google.',
  signInWithAdminGoogleEmail: 'Inicia sesión con la cuenta de Google de admin ({email})',
  signOutThisAccount: 'Cerrar sesión',
  whatsappAdminHelp: 'Ayuda de admin por WhatsApp: {phone}',

  // Dashboard header, quick stats & tabs
  managementPortalBadge: 'Portal de gestión de KawanCosplay',
  verifiedAccessBadge: 'Acceso verificado',
  dashboardPrivacyNote: 'La privacidad de los miembros está estrictamente protegida: solo los admins registrados pueden ver nombres y contactos.',
  whatsappHotlineShort: 'Línea directa WA: {phone}',
  signOutAdmin: 'Cerrar sesión de la cuenta de admin',
  statusStat: 'Estado: {status}',
  statusVerified: 'Verificado',
  statusActive: 'Activo',
  statusPending: 'Pendiente',
  tabMembers: 'Lista de miembros ({count})',
  tabSync: 'Sincronización con Google Sheets y Form',
  tabStats: 'Estadísticas de la comunidad',

  // Member list states
  permissionDeniedTitle: 'Acceso denegado',
  permissionDeniedDesc:
    'La base de datos denegó el acceso a la lista de miembros para esta cuenta. Inicia sesión con la cuenta de Google de admin ({email}) o con una cuenta incluida en la colección admins, y vuelve a cargar la página. Asegúrate también de que las Firestore Rules más recientes estén publicadas en la base de datos {database}.',
  signInWithAdminGoogle: 'Iniciar sesión con la cuenta de Google de admin',
  reloadPage: 'Recargar página',
  loadMembersFailedTitle: 'No se pudo cargar la lista de miembros',
  loadMembersFailedDesc: 'No se pudo cargar la lista de miembros. Revisa tu conexión y vuelve a cargar la página.',
  loadingMembers: 'Cargando datos de miembros...',

  // Member status & delete
  statusUpdateFailed: 'No se pudo actualizar el estado del miembro: {error}',
  deleteMemberConfirm: '¿Eliminar al miembro "{name}" (KCC ID: {id}) de la base de datos de Firestore?',
  deleteMemberFailed: 'No se pudo eliminar al miembro: {error}',

  // KCC ID & public card repair
  repairTitle: 'Reparación de KCC ID y carnés públicos',
  repairDesc:
    'Asigna un KCC ID único a los miembros cuyo ID está duplicado (el registro más antiguo conserva el ID anterior), guarda los KCC ID que aún no están almacenados y reconstruye la colección pública memberCards que se usa para buscar carnés. Se puede ejecutar varias veces sin riesgo.',
  repairDuplicatesDetected: 'Se detectaron {count} miembros con un KCC ID duplicado: haz clic en "{action}".',
  allIdsUnique: 'Todos los KCC ID son únicos.',
  runRepair: 'Ejecutar reparación',
  repairRunning: 'Reparando...',
  repairRunningProgress: 'Reparando ({done}/{total})...',
  repairConfirm:
    '¿Ejecutar la reparación de KCC ID y carnés públicos para todos los miembros?\n\n- Los miembros con un KCC ID duplicado reciben un ID nuevo (el registro más antiguo conserva el ID anterior).\n- Se guardarán los KCC ID que aún no están guardados.\n- Se reconstruye la colección pública memberCards.\n\nSe puede ejecutar varias veces sin riesgo. ¿Continuar?',
  repairFailed: 'Error en la reparación: {error}',
  repairDone: 'Reparación completada.',
  repairStatScanned: 'Miembros analizados',
  repairStatDuplicateGroups: 'Grupos de ID duplicados',
  repairStatCardsWritten: 'Carnés escritos',
  repairStatCardsDeleted: 'Carnés eliminados',
  reassignedListTitle: 'KCC ID cambiados / guardados ({count}):',
  repairReasonDuplicate: 'ID duplicado',
  repairReasonMissing: 'ID aún no guardado',
  repairReasonMainAccount: 'ID de la cuenta principal usado por otro miembro',
  noIdsChanged: 'No fue necesario cambiar ningún KCC ID.',
  issuesCount: 'Errores ({count}):',

  // Reserved admin / main account IDs
  reservedIdsTitle: 'KCC ID reservados para admins / cuenta principal ({range})',
  reservedIdsDesc:
    'Los ID de este rango son solo para la cuenta principal de KCC y los admins. Los miembros de abajo recibieron uno por el rol/correo que indicaron en el formulario público (sistema antiguo). Haz clic en "{action}" para darles un KCC ID cronológico único.',
  noReservedHolders: 'Ningún miembro tiene un KCC ID exclusivo de admin.',
  reservedHolderMeta: 'Origen: {source} • Rol: {role}',
  processing: 'Procesando...',
  assignNewId: 'Asignar ID nuevo',
  reassignConfirm: '¿Asignar un KCC ID nuevo a "{name}" (actualmente {id})?',
  reassignMainAccountWarning:
    'ADVERTENCIA: este es el ID de la cuenta principal. No continúes si este miembro es la cuenta oficial {email}.',
  resultSuccess: 'Éxito: {message}',
  resultFailed: 'Error: {message}',

  // Duplicate registrations
  duplicatesTitle: 'Registros duplicados (misma persona)',
  duplicatesDesc:
    'Miembros que completaron el formulario más de una vez (mismo número de WhatsApp, Discord, correo o red social). "Fusionar" conserva los datos más recientes y todos los números de WhatsApp en el registro más antiguo (su KCC ID se mantiene) y luego elimina el duplicado junto con su carné. Revisa antes de fusionar.',
  scanDuplicates: 'Buscar registros duplicados',
  mergeConfirm:
    '¿Fusionar "{duplicate}" ({duplicateId}) con "{keeper}" ({keeperId})?\n\nLos datos más recientes y los números de WhatsApp se copian al registro más antiguo y luego el duplicado se elimina de forma permanente. ¿Continuar?',
  mergeSuccess: '"{duplicate}" se fusionó con "{keeper}": el KCC ID {id} se mantiene.',
  bulkMergeIdenticalConfirm:
    '¿Fusionar {groups} grupos de duplicados IDÉNTICOS ({records} fichas duplicadas)?\n\nSolo grupos con el mismo cosname y el mismo número de WhatsApp principal, creados con {seconds} segundos de diferencia como máximo (copias exactas / importaciones dobles).\nLos datos más recientes y todos los números de WhatsApp pasan al registro más antiguo (su KCC ID se mantiene) y luego los duplicados se eliminan de forma permanente. ¿Continuar?',
  bulkMergeAllConfirm:
    '¿Fusionar TODOS los {groups} grupos analizados ({records} fichas duplicadas)?\n\nEsto incluye grupos que coinciden solo por el mismo número de WhatsApp, Discord, correo, red social o nombre: asegúrate de haber revisado la lista de abajo.\nLos datos más recientes y todos los números de WhatsApp pasan al registro más antiguo (su KCC ID se mantiene) y luego los duplicados se eliminan de forma permanente. Esto no se puede deshacer. ¿Continuar?',
  bulkMergeDone: 'Fusión masiva terminada ({mode}).',
  bulkModeIdentical: 'grupos idénticos',
  bulkModeAll: 'todos los resultados del análisis',
  bulkStatGroups: 'Grupos procesados',
  bulkStatMergedGroups: 'Grupos fusionados',
  bulkStatMergedRecords: 'Duplicados fusionados',
  bulkStatFailedGroups: 'Grupos con error',
  bulkMoreErrors: '…y {count} más (consulta la consola del navegador).',
  scanSummary:
    'Se encontraron {groups} grupos de duplicados ({records} fichas duplicadas), incluidos {identical} grupos idénticos (mismo cosname y mismo número de WhatsApp principal, creados con {seconds} segundos de diferencia como máximo).',
  mergeAllIdentical: 'Fusionar todos los idénticos ({count})',
  mergeAllScanned: 'Fusionar todos los resultados ({count})',
  bulkMergeProgress: 'Fusionando {done}/{total} grupos…',
  noDuplicatesFound: 'No se detectaron registros duplicados.',
  keeperBadge: 'Conservado (mismo KCC ID)',
  merging: 'Fusionando...',
  mergeInto: 'Fusionar con {id}',

  // Search, filters, sorting, export & purge
  searchPlaceholder: 'Buscar...',
  filterAllRoles: 'Todos los roles ({count})',
  filterAllCities: 'Todas las ubicaciones',
  filterAllAges: 'Todas las edades',
  filterLegalAge: 'Adulto (18+)',
  filterMinor: 'Menor (<18)',
  filterPreferNotToSay: 'Sin especificar',
  sortNewest: '🕒 Fecha: más recientes',
  sortNameAsc: '🔤 Nombre: A → Z',
  purgeButtonTitle: 'Purgar todos los datos de miembros en Firestore',
  purgeButton: 'Purgar datos de miembros',
  purging: 'Purgando...',
  purgePrompt:
    'ADVERTENCIA GRAVE: Esto ELIMINARÁ DE FORMA PERMANENTE TODOS LOS DATOS DE MIEMBROS de la base de datos de Firestore.\n\nEscribe "{keyword}" (en mayúsculas) para confirmar el borrado de la base de datos:',
  purgeCancelled: 'Confirmación cancelada (la palabra clave no coincide).',
  purgeSuccess: 'Purga completada: se eliminaron {count} fichas de miembros de la base de datos.',
  purgeFailed: 'No se pudieron eliminar los datos de miembros: {error}',
  exportNoData: 'No hay datos para exportar.',
  showingMembers: 'Mostrando {shown} de {total} miembros',

  // CSV export column headers
  csvKccId: 'KCC ID (16 dígitos)',
  csvCosname: 'Cosname / Alias',
  csvLegalName: 'Nombre legal',
  csvPrimaryWhatsapp: 'WhatsApp principal',
  csvBackupWhatsapp: 'WhatsApp de respaldo',
  csvDiscord: 'Usuario de Discord',
  csvEmail: 'Correo electrónico',
  csvAgeCategory: 'Categoría de edad',
  csvAge: 'Edad / Cumpleaños',
  csvCountry: 'País',
  csvProvince: 'Provincia',
  csvCity: 'Ciudad',
  csvPrimaryRole: 'Rol principal',
  csvFandom: 'Fandom',
  csvExperience: 'Experiencia',
  csvStatus: 'Estado',
  csvRegisteredAt: 'Fecha de registro',

  // Members table
  colMember: 'Miembro / Cosname',
  colKccId: 'KCC ID de 16 dígitos',
  colContact: 'WhatsApp y contacto',
  colDiscord: 'Usuario de Discord',
  colRole: 'Rol e intereses',
  colAge: 'Edad',
  colLocation: 'Ubicación',
  colStatus: 'Estado',
  colRegistered: 'Registro',
  colActions: 'Acciones',
  sortAz: '▲ A-Z',
  sortZa: '▼ Z-A',
  sortIdAsc: '▲ ID',
  sortAgeYoungest: '▲ Más joven',
  sortAgeOldest: '▼ Mayor',
  sortStatusAsc: '▲ Verif.',
  sortStatusDesc: '▼ Pend.',
  sortTimeNewest: '▼ Más reciente',
  sortTimeOldest: '▲ Más antiguo',
  legalNameValue: 'Nombre legal: {name}',
  mainAccountBadge: 'Cuenta principal KCC',
  adminIdBadge: 'Admin KCC #{number}',
  timestampIdBadge: 'ID por marca de tiempo',
  phone2Chip: 'WA 2',
  additionalPhoneChip: 'WA+',
  viewKccIdTitle: 'Ver KCC ID',
  deleteMemberTitle: 'Eliminar miembro',
  emptyDatabaseTitle: 'La base de datos de miembros está vacía',
  emptyDatabaseDesc:
    'Todavía no hay datos de miembros en la base de datos. Importa desde la hoja de cálculo del Google Form o espera nuevos registros.',
  noResultsTitle: 'Sin resultados',
  noResultsDesc: 'Ningún dato de miembro coincide con la palabra de búsqueda o los filtros seleccionados.',
  openSheetsSync: 'Abrir sincronización con Google Sheets y Form',
};

export default admin;
