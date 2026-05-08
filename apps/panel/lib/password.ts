export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export type PasswordStrength = "zayif" | "orta" | "guclu";

const specialCharacterPattern = /[!@#$%^&*(),.?":{}|<>_\-\\[\]/+=;~`']/;

export function validateStrongPassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Şifre en az 8 karakter olmalıdır.");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Şifre en az 1 büyük harf içermelidir.");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Şifre en az 1 küçük harf içermelidir.");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Şifre en az 1 rakam içermelidir.");
  }
  if (!specialCharacterPattern.test(password)) {
    errors.push("Şifre en az 1 özel karakter içermelidir.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return "zayif";
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (specialCharacterPattern.test(password)) score += 1;

  if (score >= 5) {
    return "guclu";
  }
  if (score >= 3) {
    return "orta";
  }
  return "zayif";
}
