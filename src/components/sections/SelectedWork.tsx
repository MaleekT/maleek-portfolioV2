"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import { projects } from "@/data/projects";
import CaseStudyExpanded from "@/components/ui/CaseStudyExpanded";

export default function SelectedWork() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section id="work" className="relative z-[5] mx-auto max-w-[1340px] px-7 pb-24 pt-10" style={{ scrollMarginTop: "90px" }}>
      <div className="relative mb-8 flex items-baseline justify-between border-b border-border pb-3.5">
        <h2 data-reveal data-reveal-type="slide-left" className="m-0 font-display font-bold tracking-[-0.02em]" style={{ fontSize: "clamp(28px, 4.5vw, 56px)" }}>Selected Work</h2>
        <span data-reveal data-reveal-type="slide-right" className="font-mono text-[12px] tracking-[0.12em] text-accent">[ 06 ]</span>
        <span data-reveal data-reveal-type="divider-sweep" className="absolute bottom-[-1px] left-0 h-px w-full bg-accent" aria-hidden="true" />
      </div>
      <div>
        {projects.map((project, i) => {
          const num = String(i + 1).padStart(2, "0");
          return (
            <div key={project.id} className="border-b border-border">
              <button type="button" data-work data-thumb={project.thumbnailUrl} data-reveal data-reveal-type="masked" data-reveal-delay={String(i * 55)} aria-haspopup="dialog" onClick={() => setOpenIndex(i)} className="group grid w-full grid-cols-[44px_1fr_auto] items-center gap-4 rounded-[3px] px-1.5 py-6 text-left transition-[background-color,padding,transform] duration-300 active:scale-[0.995] hover:bg-accent hover:px-5 sm:grid-cols-[60px_1fr_auto] sm:gap-[18px]">
                <span data-reveal data-reveal-delay={String(i * 55)} className="font-mono text-[14px] text-accent transition-colors group-hover:text-bg-primary">{num}</span>
                <span data-reveal data-reveal-delay={String(i * 55 + 45)} className="font-display font-bold leading-none tracking-[-0.01em] text-text-primary transition-transform duration-300 group-hover:translate-x-2 group-hover:text-bg-primary" style={{ fontSize: "clamp(20px, 3.6vw, 42px)" }}>{project.title}</span>
                <span data-reveal data-reveal-delay={String(i * 55 + 90)} className="flex items-center justify-end gap-3 text-right font-mono text-[11px] tracking-[0.08em] text-text-dim transition-colors group-hover:text-bg-primary/70">
                  <span className="hidden sm:inline">{project.category}</span><span aria-hidden="true" className="font-display text-[22px] text-bg-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">&#8599;</span>
                </span>
              </button>
            </div>
          );
        })}
      </div>
      {mounted && createPortal(<AnimatePresence>{openIndex !== null && <CaseStudyExpanded project={projects[openIndex]} index={openIndex} onClose={() => setOpenIndex(null)} />}</AnimatePresence>, document.body)}
    </section>
  );
}
