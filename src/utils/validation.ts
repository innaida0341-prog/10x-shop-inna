export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/[\s+\-()]/g, '');
  return /^\d{9,15}$/.test(digits);
}

export function isValidPostalCode(code: string): boolean {
  return /^\d{4,10}$/.test(code.trim());
}
