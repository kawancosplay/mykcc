import type { LocaleNamespace } from '../../types';

const errors: LocaleNamespace<'errors'> = {
  // firebase.ts describeFirestoreError
  firestorePermissionDenied:
    'Zugriff von der Datenbank verweigert (permission denied). Es wurde nichts gespeichert. Achte darauf, dass jedes Feld innerhalb seiner Zeichengrenze bleibt, oder melde dich mit einem berechtigten Konto an, und versuche es dann erneut.',
  signInRequired: 'Bitte melde dich zuerst an, um fortzufahren.',
  databaseUnavailable: 'Die Datenbank ist nicht erreichbar. Prüfe deine Internetverbindung und versuche es erneut.',
  saveFailed: 'Beim Speichern ist etwas schiefgelaufen. Bitte versuche es erneut.',

  // firestoreService.ts
  profilePhotoTooLarge: 'Das Profilfoto ist zu groß. Bitte wähle ein anderes Foto.',
  nameRequired: 'Name ist erforderlich.',
  invalidCardId: 'Ungültige KCC ID für den Mitgliedsausweis: {id}',
  uniqueIdFailed: 'Es konnte keine eindeutige KCC ID erstellt werden. Bitte versuche es erneut.',
  mergeAdminOnly: 'Nur Admins können Mitgliedseinträge zusammenführen.',
  mergeSameRecord: 'Ein Eintrag kann nicht mit sich selbst zusammengeführt werden.',
  memberRecordMissing: 'Dieser Mitgliedseintrag existiert nicht mehr (er wurde evtl. zusammengeführt oder gelöscht).',
  mergeDifferentAccounts:
    'Beide Einträge sind mit unterschiedlichen Anmeldekonten verknüpft und können daher nicht zusammengeführt werden.',
  repairAdminOnly: 'Nur Admins können die Reparatur ausführen.',
  repairIdUpdateFailed: 'Aktualisierung der KCC ID fehlgeschlagen ({ids}): {detail}',
  repairCardWriteFailed: 'Speichern des Mitgliedsausweises fehlgeschlagen ({ids}): {detail}',
  repairCardDeleteFailed: 'Löschen des Mitgliedsausweises fehlgeschlagen ({ids}): {detail}',

  // galleryService.ts
  photoSignInRequired: 'Bitte melde dich zuerst an, um ein Foto hochzuladen.',
  photoTooLarge: 'Das Foto ist zu groß. Bitte wähle ein anderes Foto.',

  // googleAuth.ts
  googleAccessTokenMissing: 'Von der Google-Anmeldung konnte kein Zugriffstoken abgerufen werden.',

  // sheetsService.ts ({label} is the API call: metadata / values; {detail} is Google's own message)
  sheetsApiResponseError: 'Sheets-API-Fehler bei {label} ({status}): {detail}',
  sheetsApiRequestFailed: 'Sheets-API-Anfrage {label} fehlgeschlagen: {detail}',

  // idGenerator.ts getUserIdBadgeInfo
  badgeMainAccount: 'KCC-Hauptkonto (0000)',
  badgeAdmin: 'KCC-Admin #{number}',
  badgeMember: 'Mitglied (Zeitstempel)',
};

export default errors;
