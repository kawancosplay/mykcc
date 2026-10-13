import type { LocaleNamespace } from '../../types';

const auth: LocaleNamespace<'auth'> = {
  loginTitle: 'Inicia sesión en MyKCC',
  signUpTitle: 'Crear una cuenta nueva de MyKCC',
  orContinueWith: 'O continúa con otros proveedores',
  emailLabel: 'Correo electrónico activo',
  passwordLabel: 'Contraseña',

  // AuthModal
  forgotPasswordTitle: 'Recuperar contraseña',
  portalSubtitle: 'Portal oficial de la comunidad MyKCC (ID de usuario de 16 dígitos)',
  loginTab: 'Iniciar sesión',
  signUpTab: 'Registrarse',
  nameLabel: 'Nombre (cosname / alias)',
  namePlaceholder: 'p. ej. Rian_Cos / Alya / Ken',
  nameHint: 'Opcional al crear una cuenta. Puedes añadir tu nombre completo y tu cosname más tarde en el formulario de registro de la comunidad.',
  emailPlaceholder: 'nombre@gmail.com',
  forgotPasswordLink: '¿Olvidaste tu contraseña?',
  passwordPlaceholder: 'Al menos 6 caracteres',
  signUpSubmit: 'Crear cuenta y obtener ID de 16 dígitos',
  sendResetEmail: 'Enviar correo de restablecimiento',
  backToLogin: 'Volver a iniciar sesión',
  continueWithGoogle: 'Continuar con Google',
  emailRequired: 'El correo electrónico es obligatorio.',
  signUpRequirements: 'Se requiere un correo electrónico válido y una contraseña de al menos 6 caracteres.',
  resetEmailSent: 'Te enviamos un correo para restablecer la contraseña.',
  authFailed: 'Algo salió mal al iniciar sesión. Vuelve a intentarlo.',
  googleLoginFailed: 'El inicio de sesión con Google se canceló o tuvo un problema.',
};

export default auth;
