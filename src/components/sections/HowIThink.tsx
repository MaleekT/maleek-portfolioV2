"use client";

import { principles } from "@/data/principles";

export default function HowIThink() {
  return (
    <section className="relative z-[5] mx-auto max-w-[1340px] px-7 pb-24" style={{ scrollMarginTop: "90px" }}>
      <div className="relative mb-9 flex items-baseline justify-between border-b border-border pb-3.5">
        <h2 data-reveal data-reveal-type="slide-left" className="m-0 font-display font-bold tracking-[-0.02em]" style={{ fontSize: "clamp(28px, 4.5vw, 56px)" }}>How I Think</h2>
        <span data-reveal data-reveal-type="slide-right" className="font-mono text-[12px] tracking-[0.12em] text-text-dim">{"// PRINCIPLES"}</span>
        <span data-reveal data-reveal-type="divider-sweep" className="absolute bottom-[-1px] left-0 h-px w-full bg-accent" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-8">
        {principles.map((line, i) => (
          <div key={line} className="grid items-baseline gap-3 md:grid-cols-[60px_1fr]">
            <span data-reveal data-reveal-delay={String(i * 65)} className="font-mono text-[14px] text-accent">0{i + 1}</span>
            <div className="overflow-hidden">
              <p data-reveal data-reveal-type="masked" data-reveal-delay={String(i * 65 + 45)} className="m-0 max-w-[900px] font-display font-semibold tracking-[-0.01em] text-text-primary" style={{ fontSize: "clamp(22px, 3vw, 40px)", lineHeight: 1.2 }}>{line}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
