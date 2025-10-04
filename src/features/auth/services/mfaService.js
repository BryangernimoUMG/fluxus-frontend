import { auth } from '../../../lib/firebase';
import {
  RecaptchaVerifier,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  multiFactor,
  getMultiFactorResolver,
} from 'firebase/auth';

// Singleton RecaptchaVerifier para evitar múltiples inicializaciones
let recaptchaInstance = null;

const RECAPTCHA_CONTAINER_ID = 'recaptcha-mfa-container';

function ensureRecaptcha() {
  if (recaptchaInstance) return recaptchaInstance;
  // El contenedor debe existir en el DOM. index.html incluye un div oculto con este id.
  recaptchaInstance = new RecaptchaVerifier(auth, RECAPTCHA_CONTAINER_ID, {
    size: 'invisible',
  });
  return recaptchaInstance;
}

function resetRecaptcha() {
  if (recaptchaInstance) {
    try {
      recaptchaInstance.clear();
    } catch (_) {
      // ignore
    }
    recaptchaInstance = null;
  }
}

// Utilidad simple para validar formato E.164 (+###########)
export function isE164(phone) {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}

export async function startPhoneEnrollment(phoneNumber) {
  const user = auth.currentUser;
  if (!user) throw new Error('No hay un usuario autenticado.');
  if (!user.emailVerified) throw new Error('Primero debes verificar tu correo.');
  if (!isE164(phoneNumber)) throw new Error('Formato de teléfono inválido. Usa formato E.164 (ej. +502XXXXXXXX).');

  try {
    const session = await multiFactor(user).getSession();
    const verifier = ensureRecaptcha();
    const provider = new PhoneAuthProvider(auth);
    const verificationId = await provider.verifyPhoneNumber({
      phoneNumber,
      session,
    }, verifier);
    return { verificationId };
  } catch (error) {
    // En algunos errores de envío conviene resetear el recaptcha
    if (error?.code === 'auth/invalid-app-credential' || error?.code === 'auth/too-many-requests') {
      resetRecaptcha();
    }
    throw error;
  }
}

export async function confirmPhoneEnrollment(verificationId, code, displayName) {
  const user = auth.currentUser;
  if (!user) throw new Error('No hay un usuario autenticado.');
  try {
    const cred = PhoneAuthProvider.credential(verificationId, code);
    const assertion = PhoneMultiFactorGenerator.assertion(cred);
    await multiFactor(user).enroll(assertion, displayName);
  } catch (error) {
    // reset para permitir reintentos
    resetRecaptcha();
    throw error;
  }
}

export function listEnrolledFactors() {
  const user = auth.currentUser;
  if (!user) throw new Error('No hay un usuario autenticado.');
  const factors = multiFactor(user).enrolledFactors || [];
  return factors.map((f) => ({
    uid: f.uid,
    displayName: f.displayName || '',
    phoneNumber: f.phoneNumber || '',
    enrollmentTime: f.enrollmentTime || '',
  }));
}

export async function unenrollFactor(factorUid) {
  const user = auth.currentUser;
  if (!user) throw new Error('No hay un usuario autenticado.');
  await multiFactor(user).unenroll(factorUid);
}

// Helpers para el flujo de login con MFA
export function createResolverFromError(error) {
  return getMultiFactorResolver(auth, error);
}

export async function sendMfaSignInCode(resolver, hintUid) {
  const hint = resolver.hints.find((h) => h.uid === hintUid) || resolver.hints[0];
  if (!hint) throw new Error('No hay factores disponibles para el inicio de sesión.');
  try {
    const verifier = ensureRecaptcha();
    const provider = new PhoneAuthProvider(auth);
    const verificationId = await provider.verifyPhoneNumber({
      multiFactorHint: hint,
      session: resolver.session,
    }, verifier);
    return { verificationId, hint };
  } catch (error) {
    resetRecaptcha();
    throw error;
  }
}

export async function finalizeMfaSignIn(resolver, verificationId, code) {
  const cred = PhoneAuthProvider.credential(verificationId, code);
  const assertion = PhoneMultiFactorGenerator.assertion(cred);
  return await resolver.resolveSignIn(assertion);
}

export function clearMfaRecaptcha() {
  resetRecaptcha();
}
