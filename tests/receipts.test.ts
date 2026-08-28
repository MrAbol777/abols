import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { saveReceipt, RECEIPT_MAX_BYTES } from "@/lib/receipts";

const PUBLIC_PREFIX = "/uploads/receipts/";

function pngBytes(): Uint8Array<ArrayBuffer> {
  return new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
}

describe("saveReceipt", () => {
  it("accepts a real PNG and writes it to disk", async () => {
    const file = new File([pngBytes()], "receipt.png", { type: "image/png" });
    const r = await saveReceipt(file);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.url.startsWith(PUBLIC_PREFIX)).toBe(true);

    const diskPath = path.join(process.cwd(), "public", r.url);
    expect(fs.existsSync(diskPath)).toBe(true);
    fs.unlinkSync(diskPath);
  });

  it("rejects a disguised non-image", async () => {
    const fake = new File([new Uint8Array(16).fill(0x00)], "image.png", { type: "image/png" });
    const r = await saveReceipt(fake);
    expect(r.ok).toBe(false);
  });

  it("rejects a wrong content type", async () => {
    const file = new File([pngBytes()], "malware.exe", { type: "application/x-msdownload" });
    const r = await saveReceipt(file);
    expect(r.ok).toBe(false);
  });

  it("rejects an oversized file", async () => {
    const big = new Uint8Array(RECEIPT_MAX_BYTES + 1);
    big.set(pngBytes());
    const file = new File([big as BlobPart], "big.png", { type: "image/png" });
    const r = await saveReceipt(file);
    expect(r.ok).toBe(false);
  });
});