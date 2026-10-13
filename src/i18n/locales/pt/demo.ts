import type { LocaleNamespace } from '../../types';

const demo: LocaleNamespace<'demo'> = {
  // Sandbox header
  title: 'Sandbox de Teste do Formulário (Demo)',
  sandboxBadge: 'Modo Sandbox',
  description:
    'Preenchimento automático com 1 clique para testar a geração de KCC ID (UID por Data/Hora, UID de Admin 0001-0100, Conta Principal 0000).',
  randomizeTitle: 'Gerar Persona Aleatória',
  randomize: 'Aleatório',

  // KCC ID allocation rules
  rulesTitle: 'Regras de ID de Usuário da KawanCosplay:',
  ruleMainAccount: 'Conta Principal do KCC',
  ruleAdminRange: 'Faixa de Admins do KCC',
  ruleTimestamp: 'UID de Membro ordenado por data/hora',

  // Preset cards
  previewName: 'Nome:',
  previewWhatsapp: 'WA:',
  previewDiscord: 'DC:',
  fillForm: 'Preencher',
  submitTest: 'Enviar Teste',
  tip: 'Dica: clique em "{action}" para simular o envio na hora e ver o Cartão de Membro com o KCC ID gerado e a liberação do WhatsApp.',
  presetLoaded: 'Predefinição carregada',

  // Presets
  presetCosplayerName: 'Cosplayer Demo (UID por Data/Hora)',
  presetCosplayerBadge: 'UID por Data/Hora',
  presetCosplayerDesc: 'UID de 16 dígitos ordenado pela data/hora do envio (YYYYMMDDHHmmssSeq)',
  presetAdminName: 'Admin do KCC Demo (UID 0001-0100)',
  presetAdminBadge: 'Faixa de UID de Admin',
  presetAdminDesc: 'UID 0000 0000 0000 0001 a 0000 0000 0000 0100 para admins do KCC',
  presetMainAccountName: 'Conta Principal do KCC Demo (UID 0000)',
  presetMainAccountDesc: 'UID 0000 0000 0000 0000 exclusivamente para a conta principal cosplaysehat@gmail.com',
  presetPropMakerName: 'Prop Maker / Artesão Demo',
  presetPropMakerBadge: 'Artesão (Data/Hora)',
  presetPropMakerDesc: 'Artesão de adereços e armaduras com UID baseado em data/hora',
  presetPhotographerName: 'Fotógrafo de Cosplay Demo',
  presetPhotographerBadge: 'Fotógrafo',
  presetPhotographerDesc: 'Fotógrafo e videomaker com UID baseado em data/hora',
  presetOthersName: 'Outros / Função Personalizada Demo',
  presetOthersBadge: 'Função Outros',
  presetOthersDesc: 'Função personalizada "Outros" com especialidade em Maquiagem de Cosplay & Estilista de Perucas',
  presetDuplicateName: 'Teste de KCC ID Único (Correspondência: {name})',
  presetDuplicateBadge: 'Verificação de KCC ID Único',
  presetDuplicateDesc: 'Verifica se um WhatsApp correspondente mantém o KCC ID: {id}',
  presetSecondaryPhoneName: 'Teste de Telefone Secundário (2 Números: {name})',
  presetSecondaryPhoneBadge: 'Verificação de 2 Números WA',
  presetSecondaryPhoneDesc: 'Adiciona um telefone secundário e preserva o KCC ID: {id}',
};

export default demo;
