import type { LocaleNamespace } from '../../types';

const admin: Partial<LocaleNamespace<'admin'>> = {
  dashboardTitle: 'Panel de Administración',
  dashboardDesc: 'Área restringida para la gestión segura del padrón de miembros.',
  loginPrompt: 'Ingrese la clave de administrador o inicie sesión con el correo oficial.',
  privacyRestrictedNotice: 'Por respeto a la privacidad de los miembros, el listado general es exclusivo para administradores.',
  exportCsv: 'Exportar CSV',
  totalMembers: 'Total de miembros',
  resetFilter: 'Restablecer filtros',
};

export default admin;
