import type { LocaleNamespace } from '../../types';

// User-facing messages produced in src/lib (translated there with translate(), not useI18n()).
const errors: LocaleNamespace<'errors'> = {
  // firebase.ts describeFirestoreError
  firestorePermissionDenied:
    'Acceso denegado por la base de datos (permission denied). No se guardó nada. Asegúrate de que cada campo esté dentro de su límite de caracteres, o inicia sesión con una cuenta autorizada, y vuelve a intentarlo.',
  signInRequired: 'Inicia sesión primero para continuar.',
  databaseUnavailable: 'No se pudo conectar con la base de datos. Revisa tu conexión a internet y vuelve a intentarlo.',
  saveFailed: 'Algo salió mal al guardar. Vuelve a intentarlo.',

  // firestoreService.ts
  profilePhotoTooLarge: 'La foto de perfil es demasiado grande. Elige otra foto.',
  nameRequired: 'El nombre es obligatorio.',
  invalidCardId: 'KCC ID no válido para el carné de miembro: {id}',
  uniqueIdFailed: 'No se pudo crear un KCC ID único. Vuelve a intentarlo.',
  mergeAdminOnly: 'Solo los admins pueden fusionar fichas de miembros.',
  mergeSameRecord: 'Una ficha no se puede fusionar consigo misma.',
  memberRecordMissing: 'Esta ficha de miembro ya no existe (puede que se haya fusionado o eliminado).',
  mergeDifferentAccounts: 'Las dos fichas están vinculadas a cuentas de inicio de sesión distintas, así que no se pueden fusionar.',
  repairAdminOnly: 'Solo los admins pueden ejecutar la reparación.',
  repairIdUpdateFailed: 'Error al actualizar el KCC ID ({ids}): {detail}',
  repairCardWriteFailed: 'Error al escribir el carné de miembro ({ids}): {detail}',
  repairCardDeleteFailed: 'Error al eliminar el carné de miembro ({ids}): {detail}',

  // galleryService.ts
  photoSignInRequired: 'Inicia sesión primero para subir una foto.',
  photoTooLarge: 'La foto es demasiado grande. Elige otra foto.',

  // googleAuth.ts
  googleAccessTokenMissing: 'No se pudo obtener un token de acceso del inicio de sesión con Google.',

  // sheetsService.ts ({label} is the API call: metadata / values; {detail} is Google's own message)
  sheetsApiResponseError: 'Error {label} de la API de Sheets ({status}): {detail}',
  sheetsApiRequestFailed: 'Falló la solicitud {label} a la API de Sheets: {detail}',

  // idGenerator.ts getUserIdBadgeInfo
  badgeMainAccount: 'Cuenta principal KCC (0000)',
  badgeAdmin: 'Admin KCC #{number}',
  badgeMember: 'Miembro (marca de tiempo)',
};

export default errors;
