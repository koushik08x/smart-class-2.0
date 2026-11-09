import { describe, it, expect, beforeEach } from 'vitest';
import { hashPassword, verifyPassword } from '../lib/crypto';
import { authService } from '../services/authService';
import { dbStore, DEFAULT_DEMO_PASSWORD, DEFAULT_PASSWORD_HASH } from '../services/mockDatabase';

describe('Security & Authentication Tests', () => {
  beforeEach(() => {
    dbStore.resetToDefault();
    localStorage.clear();
  });

  describe('Cryptographic Password Hashing', () => {
    it('produces consistent SHA-256 salted hashes', async () => {
      const hash1 = await hashPassword('Password123!');
      const hash2 = await hashPassword('Password123!');
      expect(hash1).toBe(hash2);
      expect(hash1).toBe(DEFAULT_PASSWORD_HASH);
      expect(hash1).toHaveLength(64);
    });

    it('verifies valid password against hash successfully', async () => {
      const isValid = await verifyPassword('Password123!', DEFAULT_PASSWORD_HASH);
      expect(isValid).toBe(true);
    });

    it('rejects incorrect password attempts', async () => {
      const isValid = await verifyPassword('WrongPassword999!', DEFAULT_PASSWORD_HASH);
      expect(isValid).toBe(false);
    });
  });

  describe('Authentication Service Login Flow', () => {
    it('requires a password and rejects empty password', async () => {
      const res = await authService.login('26CS1042', '');
      expect(res.error).toMatch(/Please enter your password/i);
      expect(res.user).toBeUndefined();
    });

    it('rejects login with invalid password', async () => {
      const res = await authService.login('26CS1042', 'IncorrectSecretPassword');
      expect(res.error).toMatch(/Invalid password/i);
      expect(res.user).toBeUndefined();
      expect(localStorage.getItem('sc2_active_user_id')).toBeNull();
    });

    it('authenticates student successfully with valid Roll ID and password', async () => {
      const res = await authService.login('26CS1042', DEFAULT_DEMO_PASSWORD);
      expect(res.error).toBeUndefined();
      expect(res.user).toBeDefined();
      expect(res.user?.student_id).toBe('26CS1042');
      expect(res.user?.role).toBe('student');
      expect(localStorage.getItem('sc2_active_user_id')).toBe(res.user?.id);
    });

    it('authenticates faculty member with valid institutional email', async () => {
      const res = await authService.login('prathap.ms@snpsu.edu.in', DEFAULT_DEMO_PASSWORD);
      expect(res.error).toBeUndefined();
      expect(res.user).toBeDefined();
      expect(res.user?.role).toBe('faculty');
      expect(res.user?.full_name).toBe('Mr. Prathap M S');
    });

    it('authenticates Class Admin with administrative ID', async () => {
      const res = await authService.login('EMP-ADM-01', DEFAULT_DEMO_PASSWORD);
      expect(res.error).toBeUndefined();
      expect(res.user).toBeDefined();
      expect(res.user?.role).toBe('class_admin');
    });

    it('authenticates Class Admin with roll ID 26CS1002', async () => {
      const res = await authService.login('26CS1002', DEFAULT_DEMO_PASSWORD);
      expect(res.error).toBeUndefined();
      expect(res.user).toBeDefined();
      expect(res.user?.role).toBe('class_admin');
      expect(res.user?.full_name).toBe('Alex Mercer');
    });

    it('strictly rejects self-registration for Class Admin accounts', async () => {
      const res = await authService.register({
        fullName: 'Hacker User',
        email: 'hacker@snpsu.edu.in',
        role: 'class_admin' as any,
        department: 'Computer Science and Engineering',
        semester: 1,
        section: '1CSE22',
        password: 'Password123!',
      });
      expect(res.error).toMatch(/Class Admin accounts cannot be created via self-registration/i);
    });

    it('allows student registration with pending approval status', async () => {
      const uniqueEmail = `test.student.${Date.now()}@snpsu.edu.in`;
      const res = await authService.register({
        fullName: 'Test New Student',
        email: uniqueEmail,
        role: 'student',
        department: 'Computer Science and Engineering',
        semester: 1,
        section: '1CSE22',
        password: 'Password123!',
      });
      expect(res.error).toBeUndefined();
      expect(res.user).toBeDefined();
      expect(res.user?.role).toBe('student');
      expect(res.user?.approval_status).toBe('pending');
    });

    it('sanitizes input against PostgREST filter injection payloads', async () => {
      // Malicious attempt to inject PostgREST delimiter and alter query
      const injectionAttempt = '26CS1042,role.eq.class_admin';
      const res = await authService.login(injectionAttempt, DEFAULT_DEMO_PASSWORD);
      expect(res.error).toMatch(/No account found/i);
      expect(res.user).toBeUndefined();
    });
  });
});
