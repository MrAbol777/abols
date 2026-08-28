"use client";

import { useState } from "react";

/**
 * Brand logo. Attempts to load /logo.png; if it is missing or fails to load,
 * falls back to a premium text wordmark (never a broken-image icon).
 */
export function Logo({
  brandName = "Abol Store",
  className = "",
}: {
  brandName?: string;
  className?: string;
}) {
  const [imageOk, setImageOk] = useState(true);

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {imageOk ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/logo.png"
          alt={brandName}
          width={36}
          height={36}
          className="h-9 w-9 rounded-lg object-contain"
          onError={() => setImageOk(false)}
        />
      ) : null}
      <span className="brand-wordmark text-lg font-extrabold sm:text-xl" aria-hidden={imageOk}>
        Abol StoRe
      </span>
    </span>
  );
}
