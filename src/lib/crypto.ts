/**
 * Cryptographic utility for client and node-compatible password hashing
 * Uses the Web Cryptography API (crypto.subtle)
 */

const DEFAULT_SALT = 'sc2_prod_salt_2026_';

/**
 * Computes a salted SHA-256 hash of a plain text password
 */
export async function hashPassword(password: string, salt: string = DEFAULT_SALT): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Safe fallback for environments where subtle is unavailable (e.g. non-HTTPS iframe)
  let hash = 0;
  const str = salt + password;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `fallback_${Math.abs(hash).toString(16)}`;
}

/**
 * Verifies a plaintext password against an existing hash
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
  salt: string = DEFAULT_SALT
): Promise<boolean> {
  const computed = await hashPassword(password, salt);
  return computed === storedHash;
}
