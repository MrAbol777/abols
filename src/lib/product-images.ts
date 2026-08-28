import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

/**
 * Determine the physical directory for storing uploaded product images.
 * If running in production container with persistent /app/data, use /app/data/uploads/products.
 * Otherwise, fall back to public/uploads/products.
 */
export function getProductUploadDir(): string {
  const prodDataDir = "/app/data/uploads/products";
  if (process.env.NODE_ENV === "production" && fs.existsSync("/app/data")) {
    return prodDataDir;
  }
  return path.join(process.cwd(), "public", "uploads", "products");
}

export type ProductImageValidation =
  | { ok: true; url: string }
  | { ok: false; error: string };

/**
 * Validate an uploaded product image, verify magic bytes, and save it to disk.
 * Returns a web-accessible URL: /uploads/products/<token>.<ext>
 */
export async function saveProductImage(file: File): Promise<ProductImageValidation> {
  const mime = file.type.toLowerCase();
  const ext = ALLOWED_TYPES[mime];
  if (!ext) {
    return { ok: false, error: "فرمت تصویر مجاز نیست. لطفاً تصویر با فرمت JPG، PNG یا WebP انتخاب کنید." };
  }

  if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
    return { ok: false, error: "حجم تصویر نباید بیشتر از ۵ مگابایت باشد." };
  }

  if (file.size === 0) {
    return { ok: false, error: "فایل انتخاب‌شده خالی است." };
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());

    // Basic magic-byte sniffing to reject disguised executable files
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

    const uploadDir = getProductUploadDir();
    fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(path.join(uploadDir, filename), bytes);

    // Also mirror to public directory in local dev if different
    const localPublicDir = path.join(process.cwd(), "public", "uploads", "products");
    if (uploadDir !== localPublicDir) {
      try {
        fs.mkdirSync(localPublicDir, { recursive: true });
        fs.writeFileSync(path.join(localPublicDir, filename), bytes);
      } catch {
        // Ignored in container if read-only or not needed
      }
    }

    return { ok: true, url: `/uploads/products/${filename}` };
  } catch (err) {
    console.error("Failed to save product image:", err);
    return { ok: false, error: "خطا در ذخیره‌سازی تصویر در سرور." };
  }
}
