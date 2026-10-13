import type { LocaleNamespace } from '../../types';

// GoogleSheetsSync (admin dashboard: Google Sheets / Google Form import and real-time sync).
// <strong>…</strong> and <em>…</em> markers are rendered as bold / italic text; keep them in translations.
const sheets: LocaleNamespace<'sheets'> = {
  // Header
  bridgeBadge: 'Ponte em Tempo Real Google Sheets & Form',
  bridgeSubtitle: 'Transição do Google Form para o Firebase',
  pageTitle: 'Sincronização do Banco de Dados com Planilha & Google Form',
  pageDesc:
    'Importe a planilha existente dos membros atuais e ative a sincronização em tempo real, para que cada novo membro que preencher o Google Form durante a transição seja adicionado ao Firebase automaticamente.',
  connectSheets: 'Conectar Google Sheets',
  renewAccess: 'Renovar Acesso ao Google Sheets',
  connectionRequiredTitle: 'Conexão com o Google Sheets Necessária',
  connectionRequiredDesc:
    'Para ler a planilha do Google Form diretamente, conceda ao MyKCC acesso de leitura ao Google Sheets para a conta Google de admin conectada. Essa conta precisa ter acesso à planilha de inscrições da KawanCosplay.',
  accessRequestNotice:
    'O acesso é solicitado para a conta conectada. O MyKCC pede apenas acesso de leitura ao Google Sheets, sem acesso ao Google Drive.',
  accessRequestNoticeWithEmail:
    'O acesso é solicitado para a conta conectada ({email}). O MyKCC pede apenas acesso de leitura ao Google Sheets, sem acesso ao Google Drive.',

  // Step 1: spreadsheet
  step1Title: 'Planilha do Google Form',
  step1Desc: 'Cole a URL ou o ID da planilha de respostas do Google Form.',
  spreadsheetInputLabel: 'URL / ID da Planilha do Google',
  spreadsheetInputPlaceholder: 'https://docs.google.com/spreadsheets/d/…/edit ou ID',
  inspectButton: 'Verificar',
  formatHint: 'Formato: https://docs.google.com/spreadsheets/d/<strong>[SPREADSHEET_ID]</strong>/edit',
  inputNotRecognised: 'URL / ID ainda não reconhecido.',
  sheetTabLabel: 'Escolher Aba da Planilha',

  // Step 2: column mapping
  step2Title: 'Mapeamento das Colunas de Respostas',
  step2Desc: '{count} colunas detectadas no seu Google Form',
  autoDetectedBadge: 'Detectado Automaticamente',
  columnFullName: 'Coluna de Nome Completo',
  columnCosname: 'Coluna de Cosname / Apelido',
  columnEmail: 'Coluna de E-mail',
  columnWhatsapp: 'Coluna de WhatsApp / Telefone',
  columnWhatsapp2: 'Coluna de WhatsApp Reserva / Nº WA 2',
  optionalTag: '(Opcional)',
  columnDiscord: 'Coluna de Nome de Usuário do Discord',
  columnCity: 'Coluna de Cidade / Domicílio',
  columnRole: 'Coluna de Função / Interesse (Cosplayer/Artesão/etc.)',
  columnFandom: 'Coluna de Fandom / Personagem Favorito',
  columnTimestamp: 'Coluna de Data/Hora da Resposta',
  optionChooseColumn: '-- Escolher Coluna --',
  optionNone: '-- Nenhuma / Vazio --',
  optionDefaultIndonesia: '-- Padrão (Indonésia) --',
  optionDefaultCosplayer: '-- Padrão (Cosplayer) --',
  optionDefaultAnimeGames: '-- Padrão (Anime & Games) --',
  optionCurrentTime: '-- Hora Atual --',
  previewTitle: 'Prévia dos Dados da Planilha (Nome, WhatsApp & Nome de Usuário do Discord):',
  previewColName: 'Nome / Cosname',
  previewColDiscord: 'Nome de Usuário do Discord',
  previewColCity: 'Cidade',
  previewPhone2: 'Nº 2: {phone}',

  // Import
  importing: 'Importando para o Firestore ({completed}/{total})...',
  importAllButton: 'Importar Todas as Respostas da Planilha (incl. Discord & WA) para o Firebase',
  importResult:
    'Importação concluída: <strong>{added} novos membros</strong>, {updated} atualizados, {unchanged} sem alteração, {skipped} com falha.',
  errorTip: 'Dica: você também pode colar a URL da planilha do Google Form no campo acima e clicar em "Verificar".',
  grantAccessButton: 'Conceder Acesso / Conectar Google',

  // Real-time poller
  pollerTitle: 'Monitor de Transição em Tempo Real',
  pollerActive: 'Ativo (Ao Vivo)',
  pollerInactive: 'Inativo',
  pollerDesc:
    'Enquanto isto estiver ativado, o app verifica a planilha a cada {seconds} segundos. Cada nova resposta do Google Form é adicionada ao Firebase automaticamente e recebe seu KCC ID na hora.',
  pollIntervalLabel: 'Intervalo de Verificação:',
  pollEverySeconds: 'A cada {seconds} segundos',
  pollEverySecondsOptimal: 'A cada {seconds} segundos (Ideal)',
  lastPollLabel: 'Última Verificação:',
  lastPollNever: 'Ainda não executado',
  stopPoller: 'Parar Monitor ao Vivo',
  startAutoSync: 'Iniciar Sincronização Automática',

  // Google Apps Script webhook
  webhookTitle: 'Webhook do Google Apps Script',
  webhookDesc:
    'Quer que as respostas do Google Form cheguem na hora em que o botão <em>Enviar</em> é pressionado, sem esperar o intervalo de verificação? Instale este script na sua planilha de respostas do Google Sheets:',
  scriptCommentInstall: 'Instalar em: planilha de respostas do Google Sheets -> Extensões -> Apps Script',
  scriptCommentTrigger: 'Acionador: onFormSubmit -> Ao enviar o formulário',
  scriptCommentResponseData: 'Ler os dados da resposta do formulário',
  copied: 'Copiado!',
  copyScript: 'Copiar Script',
  installStepsTitle: 'Configuração Rápida (1 Minuto):',
  installStep1: '1. Abra sua planilha de respostas do Google Sheets > menu <strong>Extensões</strong> (Extensions) > <strong>Apps Script</strong>.',
  installStep2: '2. Cole o código acima > Salvar.',
  installStep3:
    '3. No menu à esquerda, clique em <strong>Acionadores</strong> (Triggers) > Adicionar acionador > Selecionar tipo de evento: <em>Ao enviar o formulário</em> (On form submit).',

  // Sync history
  recentSyncTitle: 'Histórico de Sincronizações Recentes',
  logCount: '{count} Registros',
  logsPermissionDenied: 'O acesso aos registros de sincronização foi negado. Entre com a conta Google de admin.',
  logsLoadFailed: 'Não foi possível carregar o histórico de sincronização. Verifique sua conexão e recarregue a página.',
  logsEmpty: 'Nenhuma atividade de sincronização registrada ainda.',
  logImportedRows: '{count} linhas importadas',
  logImportSummary:
    'Importação concluída: {added} novos membros, {updated} atualizados, {unchanged} sem alteração, {skipped} com falha.',
  logAutoSummary: 'Automático: {added} novos, {updated} atualizados.',
  // Label of the stored log source 'Google Sheets Importer' (the poller's logs are labelled with pollerTitle)
  logSourceImporter: 'Importador do Google Sheets',

  // Errors
  adminAccountFallback: 'a conta de admin',
  errorUnauthorized:
    'A permissão do Google Sheets expirou ou não é mais válida. Clique em "Conectar Google Sheets" para renová-la e tente novamente.',
  errorScope:
    'O acesso de leitura ao Google Sheets não foi concedido. Clique em "Conectar Google Sheets" e marque a permissão para ver suas planilhas do Google Sheets.',
  errorNoAccess:
    'A conta Google conectada ({account}) não tem acesso a esta planilha, ou o ID da planilha está errado. Compartilhe a planilha com essa conta de admin (o acesso de Leitor é suficiente) ou confira a URL/ID.',
  errorUnsupportedFile:
    'Este arquivo não é um arquivo nativo do Google Sheets (ex.: um Excel .xlsx enviado). Abra-o, escolha Arquivo > Salvar como Planilhas Google (File > Save as Google Sheets) e use a URL do novo arquivo.',
  errorRateLimit: 'O limite de solicitações da API do Google Sheets foi atingido. Aguarde cerca de um minuto e tente novamente.',
  errorNetwork: 'Não foi possível acessar o Google Sheets. Verifique sua conexão com a internet e tente novamente.',
  errorRejected: 'O Google Sheets rejeitou a solicitação: {detail}',
  errorInvalidInput:
    'URL ou ID de planilha inválido. Cole a URL completa do Google Sheets (https://docs.google.com/spreadsheets/d/…/edit) ou apenas o ID.',
  errorEmptyInput: 'Digite primeiro uma URL ou ID do Google Sheets.',
  errorNotConnected: 'O acesso ao Google Sheets ainda não foi concedido. Clique primeiro em "Conectar Google Sheets".',
  errorEmptySheet: 'Esta planilha está vazia ou ainda não tem respostas.',
  errorReadFailed: 'Não foi possível ler a planilha.',
  errorInspectFirst: 'Conecte o Google Sheets e verifique uma planilha primeiro (Passo 1).',
  errorNoRows: 'Não há linhas de respostas para importar.',
  errorNoValidRows: 'Nenhuma linha válida foi encontrada com este mapeamento de colunas.',
  errorCheckFirst: 'Verifique uma planilha primeiro no Passo 1.',
};

export default sheets;
