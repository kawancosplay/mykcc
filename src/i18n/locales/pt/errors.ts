import type { LocaleNamespace } from '../../types';

// User-facing messages produced in src/lib (translated there with translate(), not useI18n()).
const errors: LocaleNamespace<'errors'> = {
  // firebase.ts describeFirestoreError
  firestorePermissionDenied:
    'Acesso negado pelo banco de dados (permissão negada). Nada foi salvo. Verifique se cada campo está dentro do limite de caracteres, ou entre com uma conta autorizada, e tente novamente.',
  signInRequired: 'Faça login primeiro para continuar.',
  databaseUnavailable: 'Não foi possível acessar o banco de dados. Verifique sua conexão com a internet e tente novamente.',
  saveFailed: 'Algo deu errado ao salvar. Tente novamente.',

  // firestoreService.ts
  profilePhotoTooLarge: 'A foto de perfil é muito grande. Escolha outra foto.',
  nameRequired: 'O nome é obrigatório.',
  invalidCardId: 'KCC ID inválido para o cartão de membro: {id}',
  uniqueIdFailed: 'Não foi possível criar um KCC ID único. Tente novamente.',
  mergeAdminOnly: 'Somente admins podem mesclar registros de membros.',
  mergeSameRecord: 'Um registro não pode ser mesclado com ele mesmo.',
  memberRecordMissing: 'Este registro de membro não existe mais (pode ter sido mesclado ou excluído).',
  mergeDifferentAccounts: 'Os dois registros estão vinculados a contas de login diferentes, por isso não podem ser mesclados.',
  repairAdminOnly: 'Somente admins podem executar o reparo.',
  repairIdUpdateFailed: 'Falha ao atualizar o KCC ID ({ids}): {detail}',
  repairCardWriteFailed: 'Falha ao gravar o cartão de membro ({ids}): {detail}',
  repairCardDeleteFailed: 'Falha ao excluir o cartão de membro ({ids}): {detail}',

  // galleryService.ts
  photoSignInRequired: 'Faça login primeiro para enviar uma foto.',
  photoTooLarge: 'A foto é muito grande. Escolha outra foto.',

  // googleAuth.ts
  googleAccessTokenMissing: 'Não foi possível obter um token de acesso do login com Google.',

  // sheetsService.ts ({label} is the API call: metadata / values; {detail} is Google's own message)
  sheetsApiResponseError: 'Erro da Sheets API em {label} ({status}): {detail}',
  sheetsApiRequestFailed: 'Falha na solicitação {label} da Sheets API: {detail}',

  // idGenerator.ts getUserIdBadgeInfo
  badgeMainAccount: 'Conta Principal do KCC (0000)',
  badgeAdmin: 'Admin do KCC #{number}',
  badgeMember: 'Membro (Data/Hora)',
};

export default errors;
