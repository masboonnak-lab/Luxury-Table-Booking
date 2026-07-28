import { randomInt } from "node:crypto";

/**
 * Crockford base32 minus the characters a guest reads back wrongly over the
 * phone (I, L, O, U). 32^6 ≈ 1.07 billion codes.
 */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const CODE_LENGTH = 6;

/**
 * Random, not derived from the booking. A derived code would collide the
 * moment a guest cancelled and rebooked the same table, and it would leak the
 * booking's contents to anyone who could reproduce the hash.
 */
export function orderCode(prefix: string): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `${prefix}-${code}`;
}

/**
 * Two 32-bit keys for `pg_advisory_xact_lock(int4, int4)` — the lock that makes
 * "check availability then insert" atomic against a simultaneous booking.
 */
export function advisoryKey(input: string): [number, number] {
  let a = 2166136261;
  let b = 2166136261 ^ 0x5f5e_100;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    a = Math.imul(a ^ c, 16777619) >>> 0;
    b = Math.imul(b + c, 2654435761) >>> 0;
  }
  // pg int4 is signed, so fold the unsigned hashes into range.
  return [a | 0, b | 0];
}
