import type { LocaleNamespace } from '../../types';

const admin: LocaleNamespace<'admin'> = {
  dashboardTitle: 'Painel de Admin KawanCosplay',
  dashboardDesc: 'Portal de admin restrito para a lista de membros da comunidade e a sincronização com o Google Sheets.',
  privacyRestrictedNotice: 'Para proteger a privacidade dos membros, a lista de membros é estritamente restrita aos admins da KawanCosplay.',
  exportCsv: 'Exportar CSV',
  totalMembers: 'Total de Membros Inscritos',
  resetFilter: 'Limpar Filtros',

  // Lock screen (not signed in as an admin)
  checkingAccess: 'Verificando acesso de admin...',
  signedInNotAdmin: 'Conectado como {account} — esta conta não é admin do KCC.',
  emailNotVerified: 'E-mail não verificado — use o login com Google.',
  signInWithAdminGoogleEmail: 'Entrar com a Conta Google de Admin ({email})',
  signOutThisAccount: 'Sair',
  whatsappAdminHelp: 'Ajuda de admin pelo WhatsApp: {phone}',

  // Dashboard header, quick stats & tabs
  managementPortalBadge: 'Portal de Gestão KawanCosplay',
  verifiedAccessBadge: 'Acesso Verificado',
  dashboardPrivacyNote: 'A privacidade dos membros é estritamente protegida: somente admins registrados podem ver nomes e contatos.',
  whatsappHotlineShort: 'Linha Direta WA: {phone}',
  signOutAdmin: 'Sair da Conta de Admin',
  statusStat: 'Status: {status}',
  statusVerified: 'Verificado',
  statusActive: 'Ativo',
  statusPending: 'Pendente',
  tabMembers: 'Lista de Membros ({count})',
  tabSync: 'Sincronização Google Sheets & Form',
  tabStats: 'Estatísticas da Comunidade',

  // Member list states
  permissionDeniedTitle: 'Acesso Negado',
  permissionDeniedDesc:
    'O banco de dados negou a esta conta o acesso à lista de membros. Entre com a conta Google de admin ({email}) ou com uma conta listada na coleção admins e recarregue a página. Verifique também se as Firestore Rules mais recentes foram publicadas no banco de dados {database}.',
  signInWithAdminGoogle: 'Entrar com a Conta Google de Admin',
  reloadPage: 'Recarregar Página',
  loadMembersFailedTitle: 'Não Foi Possível Carregar a Lista de Membros',
  loadMembersFailedDesc: 'Não foi possível carregar a lista de membros. Verifique sua conexão e recarregue a página.',
  loadingMembers: 'Carregando dados dos membros...',

  // Member status & delete
  statusUpdateFailed: 'Não foi possível atualizar o status do membro: {error}',
  deleteMemberConfirm: 'Excluir o membro "{name}" (KCC ID: {id}) do banco de dados do Firestore?',
  deleteMemberFailed: 'Não foi possível excluir o membro: {error}',

  // KCC ID & public card repair
  repairTitle: 'Reparo de KCC ID & Cartões Públicos',
  repairDesc:
    'Atribui um KCC ID único aos membros cujo ID está duplicado (a inscrição mais antiga mantém o ID antigo), salva os KCC IDs que ainda não foram armazenados e reconstrói a coleção pública memberCards usada na busca de cartões. Pode ser executado várias vezes com segurança.',
  repairDuplicatesDetected: '{count} membros com KCC ID duplicado detectados — clique em "{action}".',
  allIdsUnique: 'Todos os KCC IDs são únicos.',
  runRepair: 'Executar Reparo',
  repairRunning: 'Reparando...',
  repairRunningProgress: 'Reparando ({done}/{total})...',
  repairConfirm:
    'Executar o reparo de KCC ID e cartões públicos para todos os membros?\n\n- Membros com KCC ID duplicado recebem um novo ID (a inscrição mais antiga mantém o ID antigo).\n- KCC IDs que ainda não foram salvos serão salvos.\n- A coleção pública memberCards é reconstruída.\n\nPode ser executado várias vezes com segurança. Continuar?',
  repairFailed: 'Falha no reparo: {error}',
  repairDone: 'Reparo concluído.',
  repairStatScanned: 'Membros verificados',
  repairStatDuplicateGroups: 'Grupos de IDs duplicados',
  repairStatCardsWritten: 'Cartões gravados',
  repairStatCardsDeleted: 'Cartões excluídos',
  reassignedListTitle: 'KCC IDs alterados / salvos ({count}):',
  repairReasonDuplicate: 'ID duplicado',
  repairReasonMissing: 'ID ainda não salvo',
  repairReasonMainAccount: 'ID da Conta Principal usado por outro membro',
  noIdsChanged: 'Nenhum KCC ID precisou ser alterado.',
  issuesCount: 'Erros ({count}):',

  // Reserved admin / main account IDs
  reservedIdsTitle: 'KCC IDs Reservados para Admins / Conta Principal ({range})',
  reservedIdsDesc:
    'Os IDs nesta faixa são exclusivos da conta principal do KCC e dos admins. Os membros abaixo receberam um deles por causa da função/e-mail que informaram no formulário público (sistema antigo). Clique em "{action}" para dar a eles um KCC ID cronológico único.',
  noReservedHolders: 'Nenhum membro possui um KCC ID exclusivo de admin.',
  reservedHolderMeta: 'Origem: {source} • Função: {role}',
  processing: 'Processando...',
  assignNewId: 'Atribuir Novo ID',
  reassignConfirm: 'Atribuir um novo KCC ID a "{name}" (atualmente {id})?',
  reassignMainAccountWarning:
    'ATENÇÃO: este é o ID da Conta Principal. Não continue se este membro for a conta oficial {email}.',
  resultSuccess: 'Sucesso: {message}',
  resultFailed: 'Falha: {message}',

  // Duplicate registrations
  duplicatesTitle: 'Inscrições Duplicadas (Mesma Pessoa)',
  duplicatesDesc:
    'Membros que preencheram o formulário mais de uma vez (mesmo número de WhatsApp, Discord, e-mail ou rede social). "Mesclar" mantém os dados mais recentes e todos os números de WhatsApp na inscrição mais antiga (o KCC ID dela permanece) e depois exclui a duplicata junto com o cartão dela. Revise antes de mesclar.',
  scanDuplicates: 'Procurar Inscrições Duplicadas',
  mergeConfirm:
    'Mesclar "{duplicate}" ({duplicateId}) em "{keeper}" ({keeperId})?\n\nOs dados e números de WhatsApp mais recentes são copiados para a inscrição mais antiga e, em seguida, a duplicata é excluída permanentemente. Continuar?',
  mergeSuccess: '"{duplicate}" mesclado em "{keeper}" — o KCC ID {id} permanece.',
  bulkMergeIdenticalConfirm:
    'Mesclar {groups} grupos de duplicatas IDÊNTICAS ({records} registros duplicados)?\n\nSomente grupos com o mesmo cosname e o mesmo número de WhatsApp principal, criados com no máximo {seconds} segundos de diferença (cópias exatas / importações duplas).\nOs dados mais recentes e todos os números de WhatsApp vão para a inscrição mais antiga (o KCC ID dela permanece) e, em seguida, as duplicatas são excluídas permanentemente. Continuar?',
  bulkMergeAllConfirm:
    'Mesclar TODOS os {groups} grupos encontrados ({records} registros duplicados)?\n\nIsso inclui grupos identificados apenas pelo mesmo número de WhatsApp, Discord, e-mail, rede social ou nome — confirme que você revisou a lista abaixo.\nOs dados mais recentes e todos os números de WhatsApp vão para a inscrição mais antiga (o KCC ID dela permanece) e, em seguida, as duplicatas são excluídas permanentemente. Isso não pode ser desfeito. Continuar?',
  bulkMergeDone: 'Mesclagem em massa concluída ({mode}).',
  bulkModeIdentical: 'grupos idênticos',
  bulkModeAll: 'todos os resultados da busca',
  bulkStatGroups: 'Grupos processados',
  bulkStatMergedGroups: 'Grupos mesclados',
  bulkStatMergedRecords: 'Duplicatas mescladas',
  bulkStatFailedGroups: 'Grupos com falha',
  bulkMoreErrors: '…e mais {count} (veja o console do navegador).',
  scanSummary:
    '{groups} grupos de duplicatas encontrados ({records} registros duplicados), incluindo {identical} grupos idênticos (mesmo cosname e número de WhatsApp principal, criados com no máximo {seconds} segundos de diferença).',
  mergeAllIdentical: 'Mesclar todos os idênticos ({count})',
  mergeAllScanned: 'Mesclar todos os resultados ({count})',
  bulkMergeProgress: 'Mesclando {done}/{total} grupos…',
  noDuplicatesFound: 'Nenhuma inscrição duplicada detectada.',
  keeperBadge: 'Mantido (KCC ID permanece)',
  merging: 'Mesclando...',
  mergeInto: 'Mesclar em {id}',

  // Search, filters, sorting, export & purge
  searchPlaceholder: 'Buscar...',
  filterAllRoles: 'Todas as Funções ({count})',
  filterAllCities: 'Todos os Locais',
  filterAllAges: 'Todas as Idades',
  filterLegalAge: 'Adulto (18+)',
  filterMinor: 'Menor (<18)',
  filterPreferNotToSay: 'Não informado',
  sortNewest: '🕒 Data: Mais recentes',
  sortNameAsc: '🔤 Nome: A → Z',
  purgeButtonTitle: 'Apagar todos os dados de membros no Firestore',
  purgeButton: 'Apagar Dados de Membros',
  purging: 'Apagando...',
  purgePrompt:
    "AVISO GRAVE: isto vai EXCLUIR permanentemente TODOS OS DADOS DE MEMBROS do banco de dados do Firestore.\n\nDigite '{keyword}' (em maiúsculas) para confirmar a limpeza do banco de dados:",
  purgeCancelled: 'Confirmação cancelada (a palavra-chave não corresponde).',
  purgeSuccess: 'Limpeza concluída: {count} registros de membros foram excluídos do banco de dados.',
  purgeFailed: 'Não foi possível excluir os dados dos membros: {error}',
  exportNoData: 'Não há dados para exportar.',
  showingMembers: 'Mostrando {shown} de {total} membros',

  // CSV export column headers
  csvKccId: 'KCC ID (16 Dígitos)',
  csvCosname: 'Cosname / Apelido',
  csvLegalName: 'Nome Civil',
  csvPrimaryWhatsapp: 'WhatsApp Principal',
  csvBackupWhatsapp: 'WhatsApp Reserva',
  csvDiscord: 'Nome de Usuário do Discord',
  csvEmail: 'E-mail',
  csvAgeCategory: 'Faixa Etária',
  csvAge: 'Idade / Aniversário',
  csvCountry: 'País',
  csvProvince: 'Estado / Província',
  csvCity: 'Cidade',
  csvPrimaryRole: 'Função Principal',
  csvFandom: 'Fandom',
  csvExperience: 'Experiência',
  csvStatus: 'Status',
  csvRegisteredAt: 'Data de Inscrição',

  // Members table
  colMember: 'Membro / Cosname',
  colKccId: 'KCC ID de 16 Dígitos',
  colContact: 'WhatsApp & Contato',
  colDiscord: 'Nome de Usuário do Discord',
  colRole: 'Função & Interesses',
  colAge: 'Idade',
  colLocation: 'Local',
  colStatus: 'Status',
  colRegistered: 'Inscrição',
  colActions: 'Ações',
  sortAz: '▲ A-Z',
  sortZa: '▼ Z-A',
  sortIdAsc: '▲ ID',
  sortAgeYoungest: '▲ Mais novos',
  sortAgeOldest: '▼ Mais velhos',
  sortStatusAsc: '▲ Verif.',
  sortStatusDesc: '▼ Pend',
  sortTimeNewest: '▼ Mais recentes',
  sortTimeOldest: '▲ Mais antigos',
  legalNameValue: 'Nome civil: {name}',
  mainAccountBadge: 'Conta Principal do KCC',
  adminIdBadge: 'Admin do KCC #{number}',
  timestampIdBadge: 'ID por Data/Hora',
  phone2Chip: 'WA 2',
  additionalPhoneChip: 'WA+',
  viewKccIdTitle: 'Ver KCC ID',
  deleteMemberTitle: 'Excluir Membro',
  emptyDatabaseTitle: 'O Banco de Dados de Membros Está Vazio',
  emptyDatabaseDesc:
    'Ainda não há dados de membros no banco de dados. Importe da planilha do Google Form ou aguarde novas inscrições.',
  noResultsTitle: 'Nenhum Resultado',
  noResultsDesc: 'Nenhum dado de membro corresponde à palavra-chave pesquisada ou aos filtros selecionados.',
  openSheetsSync: 'Abrir Sincronização Google Sheets & Form',
};

export default admin;
