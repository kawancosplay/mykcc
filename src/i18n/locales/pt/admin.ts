import type { LocaleNamespace } from '../../types';

const admin: Partial<LocaleNamespace<'admin'>> = {
  dashboardTitle: 'Painel do Administrador',
  dashboardDesc: 'Área restrita para gestão do cadastro de membros.',
  loginPrompt: 'Digite a chave de administrador ou faça login com o e-mail oficial.',
  privacyRestrictedNotice: 'Por respeito à privacidade de todos os membros, a listagem geral é restrita aos administradores.',
  exportCsv: 'Exportar CSV',
  totalMembers: 'Total de membros',
  resetFilter: 'Limpar filtros',
};

export default admin;
