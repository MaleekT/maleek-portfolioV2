"use client";

import { useState } from "react";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useFocusTrap } from "@/hooks/useFocusTrap";

const navLinks = [
  { label: "Work", href: "#work" },
  { label: "Skills", href: "#skills" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock scroll and trap focus while the full-screen mobile menu is open.
  useScrollLock(menuOpen);
  const menuRef = useFocusTrap<HTMLDivElement>(menuOpen, () =>
    setMenuOpen(false),
  );

  const handleNav = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Scroll progress bar (width driven by the motion layer in Phase 4) */}
      <div
        data-progress
        className="fixed left-0 top-0 z-[60] h-0.5 w-0 bg-accent"
        style={{ boxShadow: "0 0 10px rgba(201,250,77,0.7)" }}
        aria-hidden="true"
      />

      <nav className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b border-border bg-bg-primary/60 px-7 py-4 backdrop-blur-md">
        {/* Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          data-magnet
          className="flex items-center gap-2 font-mono text-[13px] uppercase tracking-[0.18em] text-text-primary"
        >
          <span className="inline-block h-[9px] w-[9px] rounded-[1px] bg-accent" />
          Maleek_Taiwo
        </a>

        {/* Center links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleNav(link.href);
              }}
              data-magnet
              className="font-mono text-[12px] uppercase tracking-[0.12em] text-text-secondary transition-colors duration-300 hover:text-accent"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right: live clock + mobile trigger */}
        <div className="flex items-center gap-4">
          <span
            data-clock
            className="hidden font-mono text-[11px] uppercase tracking-[0.1em] text-text-dim md:inline"
          >
            --:--:-- WAT
          </span>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-[3px] border border-border-accent bg-accent-subtle md:hidden"
          >
            <span className="block h-0.5 w-5 rounded-sm bg-accent" />
            <span className="block h-0.5 w-3 rounded-sm bg-accent" />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="fixed inset-0 z-[70] flex flex-col bg-bg-primary md:hidden"
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 80% at 80% 0%, rgba(201,250,77,0.14), transparent 55%)",
            }}
            aria-hidden="true"
          />
          <div className="relative flex items-center justify-between border-b border-border px-5 py-4">
            <span className="flex items-center gap-2 font-mono text-[13px] uppercase tracking-[0.18em]">
              <span className="inline-block h-[9px] w-[9px] rounded-[1px] bg-accent" />
              Maleek_Taiwo
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="flex h-11 w-11 items-center justify-center rounded-[3px] border border-border-accent bg-accent-subtle text-lg text-accent"
            >
              ✕
            </button>
          </div>
          <nav className="relative flex flex-1 flex-col justify-center gap-1 px-6">
            {navLinks.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(link.href);
                }}
                className="flex items-baseline gap-4 border-b border-border py-3 transition-colors hover:text-accent"
              >
                <span className="font-mono text-[13px] text-accent">0{i + 1}</span>
                <span className="font-display text-[clamp(40px,13vw,68px)] font-extrabold leading-none tracking-[-0.02em]">
                  {link.label}
                </span>
              </a>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
