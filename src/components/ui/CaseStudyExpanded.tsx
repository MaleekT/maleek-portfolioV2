"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Project } from "@/types";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useFocusTrap } from "@/hooks/useFocusTrap";

const ease = [0.16, 1, 0.3, 1] as const;

interface CaseStudyExpandedProps {
  project: Project;
  index: number;
  onClose: () => void;
}

export default function CaseStudyExpanded({
  project,
  index,
  onClose,
}: CaseStudyExpandedProps) {
  const [imgError, setImgError] = useState(false);
  const { caseStudy, liveUrl, title, category } = project;
  const num = String(index + 1).padStart(2, "0");

  // Freeze page scroll and trap keyboard focus (Escape closes) while open.
  useScrollLock(true);
  const dialogRef = useFocusTrap<HTMLDivElement>(true, onClose);

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} case study`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed inset-0 z-[80] bg-bg-primary"
    >
      {/* Pinned close button first in the DOM so it is the initial focus target
          (visible, top-right) and Tab order starts here without a scroll jump. */}
      <motion.button
        type="button"
        onClick={onClose}
        aria-label="Close case study"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.4, duration: 0.3 } }}
        exit={{ opacity: 0 }}
        className="absolute right-5 top-5 z-[6] flex h-12 w-12 items-center justify-center rounded-[3px] border border-border-hover bg-bg-primary/70 text-[19px] text-accent backdrop-blur-md transition-colors duration-300 hover:bg-accent hover:text-bg-primary"
      >
        ✕
      </motion.button>

      {/* Scrollable content. data-lenis-prevent lets native scroll through while Lenis is stopped. */}
      <div data-lenis-prevent className="absolute inset-0 overflow-y-auto overflow-x-hidden">
        <div className="relative z-[2] mx-auto max-w-[1080px] px-6 pb-24 pt-20">
          {/* Meta row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.35, duration: 0.5 } }}
            className="mb-4 flex items-center justify-between font-mono text-[12px] uppercase tracking-[0.16em] text-text-dim"
          >
            <span className="text-accent">Case Study / {num}</span>
            <span>{category}</span>
          </motion.div>

          {/* Hero panel: scales open from inside, like the preview tile growing */}
          <motion.div
            initial={{ scale: 0.55, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.75, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }}
            transition={{ duration: 0.7, ease }}
            className="relative flex items-end overflow-hidden rounded-[8px] border border-border-accent"
            style={{
              height: "clamp(230px, 42vw, 440px)",
              padding: "clamp(18px, 3vw, 32px)",
              transformOrigin: "50% 45%",
              background:
                "repeating-linear-gradient(45deg, #0e1011, #0e1011 9px, #14171a 9px, #14171a 18px)",
              willChange: "transform, opacity",
            }}
          >
            {!imgError && (
              <img
                src={project.fullImageUrl}
                alt={`${title} preview`}
                onError={() => setImgError(true)}
                className="absolute inset-0 h-full w-full object-cover opacity-90"
                style={{
                  /* The hero files are laptop mockups with margins baked in;
                     zoom past them so the device fills the panel width. */
                  transform: "scale(1.6)",
                  transformOrigin: "50% 44%",
                }}
              />
            )}
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(8,9,10,0.85) 0%, rgba(8,9,10,0.25) 45%, rgba(8,9,10,0.1) 100%)",
              }}
            />
            <span
              aria-hidden="true"
              className="absolute right-[18px] top-4 font-mono text-[11px] tracking-[0.12em] text-text-primary/50"
            >
              [ PROJECT PREVIEW ]
            </span>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.5, ease } }}
              className="relative z-[2]"
            >
              <span className="mb-3.5 inline-block rounded-[2px] bg-accent px-2.5 py-1 font-mono text-[11px] tracking-[0.1em] text-bg-primary">
                {category}
              </span>
              <h2
                className="m-0 max-w-[15ch] font-display font-extrabold tracking-[-0.03em] text-text-primary"
                style={{ fontSize: "clamp(34px, 6.4vw, 84px)", lineHeight: 0.9 }}
              >
                {title}
              </h2>
            </motion.div>
          </motion.div>

          {/* Everything below fades up after the hero settles */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.5, duration: 0.55, ease } }}
            exit={{ opacity: 0 }}
          >
            {/* Role / Built with / Live site */}
            <div className="mt-8 grid gap-6 border-b border-border pb-8 md:grid-cols-3">
              <div>
                <div className="mb-3 font-mono text-[12px] uppercase tracking-[0.2em] text-accent">
                  // Role
                </div>
                <p className="m-0 font-body text-[15px] leading-[1.55] text-text-secondary">
                  {caseStudy.role}
                </p>
              </div>
              <div>
                <div className="mb-3 font-mono text-[12px] uppercase tracking-[0.2em] text-accent">
                  // Built with
                </div>
                <div className="flex flex-wrap gap-2">
                  {caseStudy.tools.map((tool) => (
                    <span
                      key={tool}
                      className="rounded-[2px] border border-border px-2.5 py-1.5 font-mono text-[12px] text-text-secondary"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-3 font-mono text-[12px] uppercase tracking-[0.2em] text-accent">
                  // Category
                </div>
                <p className="m-0 font-body text-[15px] leading-[1.55] text-text-secondary">
                  {category}
                </p>
              </div>
            </div>

            {/* The Brief */}
            <div className="mt-10 grid gap-3 md:grid-cols-[200px_1fr]">
              <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-accent">
                // The Brief
              </div>
              <p
                className="m-0 max-w-[740px] font-body font-medium text-text-primary"
                style={{ fontSize: "clamp(18px, 2vw, 24px)", lineHeight: 1.5 }}
              >
                {caseStudy.brief}
              </p>
            </div>

            {/* The Approach */}
            <div className="mt-10 grid gap-3 md:grid-cols-[200px_1fr]">
              <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-accent">
                // The Approach
              </div>
              <p className="m-0 max-w-[740px] font-body text-[16px] leading-[1.7] text-text-secondary">
                {caseStudy.approach}
              </p>
            </div>

            {/* The Results */}
            <div className="mt-10 grid gap-3 md:grid-cols-[200px_1fr]">
              <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-accent">
                // The Results
              </div>
              <div className="max-w-[740px]">
                <p className="m-0 font-body text-[16px] leading-[1.7] text-text-secondary">
                  {caseStudy.results}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {caseStudy.metrics.map((metric) => (
                    <span
                      key={metric}
                      className="rounded-[2px] border border-border-accent bg-accent-subtle px-3.5 py-2 font-mono text-[12px] uppercase tracking-[0.06em] text-accent"
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
              <div className="flex flex-wrap items-center gap-3">
                {liveUrl && (
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-[3px] bg-accent px-5 py-3 font-mono text-[13px] font-bold text-bg-primary underline decoration-bg-primary/40 underline-offset-4 transition-colors duration-300 hover:bg-accent-hover"
                  >
                    Visit live site ↗
                  </a>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 rounded-[3px] border border-border-hover px-5 py-3 font-mono text-[13px] text-text-primary transition-colors duration-300 hover:border-accent hover:text-accent"
                >
                  Close ✕
                </button>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-dim">
                ESC to close
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
