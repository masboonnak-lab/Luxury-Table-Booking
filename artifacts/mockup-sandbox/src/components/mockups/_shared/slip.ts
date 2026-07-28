/**
 * Transfer-slip checking.
 *
 * WHAT IS REAL: the duplicate check. We hash the uploaded file with SHA-256
 * and reject a hash that has already been spent, so re-uploading the same
 * image genuinely fails.
 *
 * WHAT IS NOT: authenticity. Deciding whether a slip is forged means reading
 * the bank's transaction reference and confirming it against the bank — a
 * server-side call to a slip-verification API (EasySlip, SlipOK, or the bank's
 * own OpenAPI). No amount of client-side code can do it, because the client is
 * exactly what an attacker controls. `assessSlip` therefore returns a
 * `pendingBankCheck` flag instead of pretending to know.
 */

export interface SlipAssessment {
  hash: string;
  fileName: string;
  sizeBytes: number;
  duplicate: boolean;
  /** Always true in the mockup — a real build resolves this server-side. */
  pendingBankCheck: boolean;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return toHex(digest);
}

export async function assessSlip(
  file: File,
  isUsed: (hash: string) => boolean,
): Promise<SlipAssessment> {
  const hash = await hashFile(file);
  return {
    hash,
    fileName: file.name,
    sizeBytes: file.size,
    duplicate: isUsed(hash),
    pendingBankCheck: true,
  };
}

export const ACCEPTED_SLIP_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const MAX_SLIP_BYTES = 5 * 1024 * 1024;

export function slipFileError(file: File): string | null {
  if (!ACCEPTED_SLIP_TYPES.includes(file.type)) {
    return "รองรับเฉพาะไฟล์ PNG, JPG หรือ WebP";
  }
  if (file.size > MAX_SLIP_BYTES) {
    return "ไฟล์ใหญ่เกิน 5 MB";
  }
  return null;
}
