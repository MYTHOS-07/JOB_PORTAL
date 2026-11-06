"use client";

import { useState } from "react";
import { assetUrl } from "@/lib/format";
import { cn } from "@/lib/cn";

export function UserAvatar({
  name,
  src,
  size = "md",
}: {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const [failed, setFailed] = useState(false);
  const url = assetUrl(src);
  const showImage = Boolean(url) && !failed;
  const dim = size === "lg" ? "h-16 w-16 text-lg" : size === "sm" ? "h-8 w-8 text-[11px]" : "h-10 w-10 text-sm";

  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-line font-semibold text-ink",
        dim,
      )}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url ?? ""}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        (name.trim().slice(0, 1) || "?").toUpperCase()
      )}
    </span>
  );
}
