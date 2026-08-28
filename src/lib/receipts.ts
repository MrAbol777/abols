import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

/**
 * Card-to-card receipt handling: validation, disk storage, and metadata.
 *
 * Receipts are stored on disk under `public/uploads/receipts/` (served by Next
 * static file handling). Only safe image types are accepted and the filename
 * is a random token so it can't be guessed. In production this would move to
 * object storage (S3/R2) behind an authenticated route.
 */

export const RECEIPT_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "receipts");
const PUBLIC_PREFIX = "/uploads/receipts/";

export type ReceiptValidation =
  | { ok: true; url: string }
  | { ok: false; error: string };

/** Validate a receipt file and write it to disk. Returns the public URL. */
export async function saveReceipt(file: File): Promise<ReceiptValidation> {
  const mime = file.type.toLowerCase();
  const ext = ALLOWED_TYPES[mime];
  if (!ext) {
    return { ok: false, error: "فرمت تصویر مجاز نیست (JPG، PNG یا WebP)." };
  }

  if (file.size > RECEIPT_MAX_BYTES) {
    return { ok: false, error: "حجم تصویر نباید بیشتر از ۵ مگابایت باشد." };
  }

  if (file.size === 0) {
    return { ok: false, error: "فایل انتخاب‌شده خالی است." };
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());

    // Basic magic-byte sniff to reject disguised files.
    const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
    const isPng =
      bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
    const isWebp =
      bytes.slice(0, 4).toString("ascii") === "RIFF" &&
      bytes.slice(8, 12).toString("ascii") === "WEBP";
    if (!isJpeg && !isPng && !isWebp) {
      return { ok: false, error: "فایل انتخاب‌شده یک تصویر معتبر نیست." };
    }

    const token = crypto.randomBytes(16).toString("hex");
    const filename = `${token}${ext}`;
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), bytes);

    return { ok: true, url: `${PUBLIC_PREFIX}${filename}` };
  } catch {
    return { ok: false, error: "خطا در ذخیره‌سازی رسید. دوباره تلاش کنید." };
  }
}
