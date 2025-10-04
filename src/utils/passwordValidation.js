// Utilities to validate and explain password strength according to product rules
// Rules: 12+ chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special

export const PASSWORD_RULES = {
  minLength: 12,
};

export function checkPasswordCriteria(password = '') {
  const lengthOk = password.length >= PASSWORD_RULES.minLength;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  return { lengthOk, hasUpper, hasLower, hasNumber, hasSpecial };
}

export function isPasswordStrong(password) {
  const c = checkPasswordCriteria(password);
  return c.lengthOk && c.hasUpper && c.hasLower && c.hasNumber && c.hasSpecial;
}

export function getCriteriaMessages() {
  return {
    lengthOk: `Debe tener al menos ${PASSWORD_RULES.minLength} caracteres`,
    hasUpper: 'Debe incluir al menos una letra mayúscula',
    hasLower: 'Debe incluir al menos una letra minúscula',
    hasNumber: 'Debe incluir al menos un número',
    hasSpecial: 'Debe incluir al menos un caracter especial',
  };
}
