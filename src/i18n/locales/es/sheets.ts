import type { LocaleNamespace } from '../../types';

// GoogleSheetsSync (admin dashboard: Google Sheets / Google Form import and real-time sync).
// <strong>…</strong> and <em>…</em> markers are rendered as bold / italic text; keep them in translations.
const sheets: LocaleNamespace<'sheets'> = {
  // Header
  bridgeBadge: 'Puente en tiempo real con Google Sheets y Form',
  bridgeSubtitle: 'Transición de Google Form a Firebase',
  pageTitle: 'Sincronización de la base de datos con la hoja de cálculo y el Google Form',
  pageDesc:
    'Importa la hoja de cálculo existente con los miembros actuales y activa la sincronización en tiempo real, para que cada nuevo miembro que complete el Google Form durante la transición se añada a Firebase automáticamente.',
  connectSheets: 'Conectar Google Sheets',
  renewAccess: 'Renovar el acceso a Google Sheets',
  connectionRequiredTitle: 'Se requiere conexión con Google Sheets',
  connectionRequiredDesc:
    'Para leer directamente la hoja de cálculo del Google Form, da a MyKCC acceso de lectura a Google Sheets para la cuenta de Google de admin con la que iniciaste sesión. Esa cuenta debe tener acceso a la hoja de cálculo de registro de KawanCosplay.',
  accessRequestNotice:
    'El acceso se solicita para la cuenta con la que iniciaste sesión. MyKCC solo pide acceso de lectura a Google Sheets, sin acceso a Google Drive.',
  accessRequestNoticeWithEmail:
    'El acceso se solicita para la cuenta con la que iniciaste sesión ({email}). MyKCC solo pide acceso de lectura a Google Sheets, sin acceso a Google Drive.',

  // Step 1: spreadsheet
  step1Title: 'Hoja de cálculo del Google Form',
  step1Desc: 'Pega la URL o el ID de la hoja de cálculo de respuestas del Google Form.',
  spreadsheetInputLabel: 'URL / ID de la hoja de cálculo de Google',
  spreadsheetInputPlaceholder: 'https://docs.google.com/spreadsheets/d/…/edit o ID',
  inspectButton: 'Comprobar',
  formatHint: 'Formato: https://docs.google.com/spreadsheets/d/<strong>[SPREADSHEET_ID]</strong>/edit',
  inputNotRecognised: 'Todavía no se reconoce la URL / el ID.',
  sheetTabLabel: 'Elige la pestaña de la hoja',

  // Step 2: column mapping
  step2Title: 'Asignación de columnas de respuestas',
  step2Desc: 'Se detectaron {count} columnas en tu Google Form',
  autoDetectedBadge: 'Autodetectado',
  columnFullName: 'Columna de nombre completo',
  columnCosname: 'Columna de cosname / alias',
  columnEmail: 'Columna de correo electrónico',
  columnWhatsapp: 'Columna de WhatsApp / número de teléfono',
  columnWhatsapp2: 'Columna de WhatsApp de respaldo / n.º de WA 2',
  optionalTag: '(Opcional)',
  columnDiscord: 'Columna de usuario de Discord',
  columnCity: 'Columna de ciudad / domicilio',
  columnRole: 'Columna de rol / interés (cosplayer/crafter/etc.)',
  columnFandom: 'Columna de fandom / personaje favorito',
  columnTimestamp: 'Columna de marca de tiempo de la respuesta',
  optionChooseColumn: '-- Elegir columna --',
  optionNone: '-- Ninguna / Vacía --',
  optionDefaultIndonesia: '-- Predeterminado (Indonesia) --',
  optionDefaultCosplayer: '-- Predeterminado (Cosplayer) --',
  optionDefaultAnimeGames: '-- Predeterminado (Anime y videojuegos) --',
  optionCurrentTime: '-- Hora actual --',
  previewTitle: 'Vista previa de los datos de la hoja (nombre, WhatsApp y usuario de Discord):',
  previewColName: 'Nombre / Cosname',
  previewColDiscord: 'Usuario de Discord',
  previewColCity: 'Ciudad',
  previewPhone2: 'N.º 2: {phone}',

  // Import
  importing: 'Importando a Firestore ({completed}/{total})...',
  importAllButton: 'Importar todas las respuestas de la hoja (incl. Discord y WA) a Firebase',
  importResult:
    'Importación terminada: <strong>{added} miembros nuevos</strong>, {updated} actualizados, {unchanged} sin cambios, {skipped} fallidos.',
  errorTip: 'Consejo: también puedes pegar la URL de la hoja de cálculo del Google Form en el campo de arriba y hacer clic en "Comprobar".',
  grantAccessButton: 'Dar acceso / Conectar Google',

  // Real-time poller
  pollerTitle: 'Sondeo de transición en tiempo real',
  pollerActive: 'Activo (en vivo)',
  pollerInactive: 'Inactivo',
  pollerDesc:
    'Mientras esté activado, la app revisa la hoja de cálculo cada {seconds} segundos. Cada nueva respuesta del Google Form se añade a Firebase automáticamente y recibe su KCC ID al instante.',
  pollIntervalLabel: 'Intervalo de revisión:',
  pollEverySeconds: 'Cada {seconds} segundos',
  pollEverySecondsOptimal: 'Cada {seconds} segundos (óptimo)',
  lastPollLabel: 'Última revisión:',
  lastPollNever: 'Aún no se ha ejecutado',
  stopPoller: 'Detener sondeo en vivo',
  startAutoSync: 'Iniciar sincronización automática en tiempo real',

  // Google Apps Script webhook
  webhookTitle: 'Webhook de Google Apps Script',
  webhookDesc:
    '¿Quieres que las respuestas del Google Form lleguen al instante al hacer clic en el botón <em>Enviar</em>, sin esperar el intervalo de sondeo? Instala este script en tu hoja de cálculo de respuestas:',
  scriptCommentInstall: 'Instalar en: hoja de cálculo de respuestas de Google Sheets -> Extensiones -> Apps Script',
  scriptCommentTrigger: 'Activador: onFormSubmit -> Al enviar el formulario',
  scriptCommentResponseData: 'Leer los datos de la respuesta del formulario',
  copied: '¡Copiado!',
  copyScript: 'Copiar script',
  installStepsTitle: 'Configuración rápida (1 minuto):',
  installStep1: '1. Abre tu hoja de cálculo de respuestas de Google Sheets > menú <strong>Extensiones</strong> > <strong>Apps Script</strong>.',
  installStep2: '2. Pega el código de arriba > Guardar.',
  installStep3:
    '3. En el menú de la izquierda, haz clic en <strong>Activadores</strong> (Triggers) > Añadir activador > Seleccionar tipo de evento: <em>Al enviar el formulario</em> (On form submit).',

  // Sync history
  recentSyncTitle: 'Historial reciente de sincronización',
  logCount: '{count} registros',
  logsPermissionDenied: 'Se denegó el acceso a los registros de sincronización. Inicia sesión con la cuenta de Google de admin.',
  logsLoadFailed: 'No se pudo cargar el historial de sincronización. Revisa tu conexión y vuelve a cargar la página.',
  logsEmpty: 'Todavía no hay actividad de sincronización registrada.',
  logImportedRows: 'Se importaron {count} filas',
  logImportSummary:
    'Importación terminada: {added} miembros nuevos, {updated} actualizados, {unchanged} sin cambios, {skipped} fallidos.',
  logAutoSummary: 'Automático: {added} nuevos, {updated} actualizados.',
  // Label of the stored log source 'Google Sheets Importer' (the poller's logs are labelled with pollerTitle)
  logSourceImporter: 'Importador de Google Sheets',

  // Errors
  adminAccountFallback: 'la cuenta de admin',
  errorUnauthorized:
    'El permiso de Google Sheets caducó o ya no es válido. Haz clic en "Conectar Google Sheets" para renovarlo y vuelve a intentarlo.',
  errorScope:
    'No se concedió el acceso de lectura a Google Sheets. Haz clic en "Conectar Google Sheets" y marca el permiso para ver tus hojas de cálculo de Google Sheets.',
  errorNoAccess:
    'La cuenta de Google con la que iniciaste sesión ({account}) no tiene acceso a esta hoja de cálculo, o el ID de la hoja es incorrecto. Comparte la hoja de cálculo con esa cuenta de admin (basta con el acceso de Lector) o revisa bien la URL/ID.',
  errorUnsupportedFile:
    'Este archivo no es un archivo nativo de Google Sheets (p. ej. un Excel .xlsx subido). Ábrelo, elige Archivo > Guardar como Hojas de cálculo de Google (File > Save as Google Sheets) y usa la URL del archivo nuevo.',
  errorRateLimit: 'Se alcanzó el límite de solicitudes de la API de Google Sheets. Espera aproximadamente un minuto y vuelve a intentarlo.',
  errorNetwork: 'No se pudo conectar con Google Sheets. Revisa tu conexión a internet y vuelve a intentarlo.',
  errorRejected: 'Google Sheets rechazó la solicitud: {detail}',
  errorInvalidInput:
    'URL o ID de hoja de cálculo no válido. Pega la URL completa de Google Sheets (https://docs.google.com/spreadsheets/d/…/edit) o solo su ID.',
  errorEmptyInput: 'Primero escribe una URL o un ID de Google Sheets.',
  errorNotConnected: 'Todavía no se ha concedido el acceso a Google Sheets. Primero haz clic en "Conectar Google Sheets".',
  errorEmptySheet: 'Esta hoja de cálculo está vacía o todavía no tiene respuestas.',
  errorReadFailed: 'No se pudo leer la hoja de cálculo.',
  errorInspectFirst: 'Primero conecta Google Sheets y comprueba una hoja de cálculo (paso 1).',
  errorNoRows: 'No hay filas de respuestas para importar.',
  errorNoValidRows: 'No se encontraron filas válidas con esta asignación de columnas.',
  errorCheckFirst: 'Primero comprueba una hoja de cálculo en el paso 1.',
};

export default sheets;
