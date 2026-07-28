import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

/**
 * scrypt from node:crypto rather than argon2/bcrypt: those are native modules,
 * which the esbuild bundle externalises and the deploy would then have to
 * carry. scrypt with these parameters is a sound choice and ships with Node.
 */
const scrypt = promisify(scryptCallback) as (
  password: string | Buffer,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

const PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const SALT_BYTES = 16;
const KEY_BYTES = 64;

export const MIN_PASSWORD_LENGTH = 8;

/** NFKC so a password typed with a different Unicode composition still matches. */
function prepare(password: string): string {
  return password.normalize("NFKC");
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const key = await scrypt(prepare(password), salt, KEY_BYTES, PARAMS);
  return `scrypt$${salt.toString("base64url")}$${key.toString("base64url")}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [scheme, saltPart, keyPart] = stored.split("$");
  if (scheme !== "scrypt" || !saltPart || !keyPart) {
    return false;
  }

  const salt = Buffer.from(saltPart, "base64url");
  const expected = Buffer.from(keyPart, "base64url");
  const actual = await scrypt(
    prepare(password),
    salt,
    expected.length,
    PARAMS,
  );

  // Lengths must match before timingSafeEqual, which throws otherwise.
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
