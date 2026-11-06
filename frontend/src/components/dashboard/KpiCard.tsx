"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { HoverLift } from "@/components/motion/PageFade";

export function KpiCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  const numberRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (typeof value !== "number" || !numberRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      numberRef.current.textContent = String(value);
      return;
    }
    const state = { n: 0 };
    const tween = gsap.to(state, {
      n: value,
      duration: 0.7,
      ease: "power2.out",
      onUpdate: () => {
        if (numberRef.current) numberRef.current.textContent = String(Math.round(state.n));
      },
    });
    return () => {
      tween.kill();
    };
  }, [value]);

  return (
    <HoverLift>
      <div className="min-h-[116px] rounded-xl border border-line bg-card p-4 shadow-[0_8px_30px_rgba(18,38,58,0.04)]">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <p ref={numberRef} className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-ink">
          {value}
        </p>
        <p className="mt-1 min-h-4 text-xs text-muted">{hint || " "}</p>
      </div>
    </HoverLift>
  );
}
