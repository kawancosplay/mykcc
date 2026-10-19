import type { LocaleNamespace } from '../../types';

const auth: LocaleNamespace<'auth'> = {
  loginTitle: "Entrar no MyKCC",
  signUpTitle: "Criar Nova Conta MyKCC",
  orContinueWith: "Ou continue com outros provedores",
  emailLabel: "Endereço de E-mail Ativo",
  passwordLabel: "Senha",
  forgotPasswordTitle: "Esqueci a Senha",
  portalSubtitle: "Portal Oficial da Comunidade MyKCC (KCC ID)",
  loginTab: "Entrar",
  signUpTab: "Cadastrar",
  nameLabel: "Nome (Cosname / Apelido)",
  namePlaceholder: "ex.: Rian_Cos / Alya / Ken",
  nameHint: "Opcional ao criar a conta. Você pode adicionar seu nome completo e cosname depois, no formulário de inscrição da comunidade.",
  emailPlaceholder: "nome@gmail.com",
  forgotPasswordLink: "Esqueceu a senha?",
  passwordPlaceholder: "Pelo menos 6 caracteres",
  signUpSubmit: "Criar Conta e Obter Seu KCC ID",
  sendResetEmail: "Enviar E-mail de Redefinição",
  backToLogin: "Voltar ao Login",
  continueWithGoogle: "Continuar com Google",
  emailRequired: "O e-mail é obrigatório.",
  signUpRequirements: "É necessário um e-mail válido e uma senha de pelo menos 6 caracteres.",
  resetEmailSent: "Um e-mail de redefinição de senha foi enviado.",
  authFailed: "Algo deu errado ao entrar. Tente novamente.",
  googleLoginFailed: "O login com Google foi cancelado ou encontrou um problema.",
  popupBlockedTapAgain: "O navegador bloqueou a janela de login. Toque no botão de novo.",
};

export default auth;
