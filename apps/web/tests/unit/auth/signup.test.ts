import { describe, it, expect } from 'vitest';

// Password validation rules per FR-003
const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSpecial: true,
};

function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < PASSWORD_RULES.minLength) {
    errors.push(`At least ${PASSWORD_RULES.minLength} characters`);
  }
  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('One uppercase letter');
  }
  if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('One lowercase letter');
  }
  if (PASSWORD_RULES.requireDigit && !/\d/.test(password)) {
    errors.push('One number');
  }
  if (PASSWORD_RULES.requireSpecial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('One special character');
  }

  return { valid: errors.length === 0, errors };
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const DISPOSABLE_DOMAINS = ['tempmail.com', 'throwaway.email', 'guerrillamail.com', 'mailinator.com'];

function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return DISPOSABLE_DOMAINS.includes(domain);
}

describe('Signup Form Validation', () => {
  describe('Password Strength', () => {
    it('should reject passwords shorter than 8 characters', () => {
      const result = validatePassword('Ab1!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(`At least ${PASSWORD_RULES.minLength} characters`);
    });

    it('should reject passwords without uppercase letter', () => {
      const result = validatePassword('abcdefg1!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('One uppercase letter');
    });

    it('should reject passwords without lowercase letter', () => {
      const result = validatePassword('ABCDEFG1!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('One lowercase letter');
    });

    it('should reject passwords without digit', () => {
      const result = validatePassword('Abcdefgh!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('One number');
    });

    it('should reject passwords without special character', () => {
      const result = validatePassword('Abcdefg1');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('One special character');
    });

    it('should accept valid passwords meeting all requirements', () => {
      const result = validatePassword('Test1234!');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return multiple errors for very weak passwords', () => {
      const result = validatePassword('abc');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('Email Validation', () => {
    it('should accept valid email addresses', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('user+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('notanemail')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
    });
  });

  describe('Disposable Email Detection', () => {
    it('should flag disposable email domains', () => {
      expect(isDisposableEmail('user@tempmail.com')).toBe(true);
      expect(isDisposableEmail('user@mailinator.com')).toBe(true);
    });

    it('should accept legitimate email domains', () => {
      expect(isDisposableEmail('user@gmail.com')).toBe(false);
      expect(isDisposableEmail('user@company.com')).toBe(false);
    });
  });
});
