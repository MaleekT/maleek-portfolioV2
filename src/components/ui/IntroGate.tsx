"use client";

import { useEffect, useRef, useState } from "react";
import { useScrollLock } from "@/hooks/useScrollLock";

const STATEMENT =
  "The hard part isn't adding things. It's knowing what to leave out. I find the job your site has to do, then design and build everything around it. If it could be anyone's site, it's not done.";

const SESSION_KEY = "vs-gate-seen";
const DIM = "#3d423e";
const LIT = "#c9fa4d";
const READ = "#f2f4ef";

function hasSeen(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Full-screen intro that plays once per browser session before the homepage:
 * the statement reveals word by word (caption style), then "Cut to the work"
 * wipes it away. Reduced-motion users get an instant fade. Rendered on the
 * server too (over the black page) to avoid a flash of the homepage first.
 */
export default function IntroGate() {
  const [show, setShow] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [ctaReady, setCtaReady] = useState(false);
  const [exiting, setExiting] = useState(false);

  const gateRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const wipeRef = useRef<HTMLDivElement>(null);

  useScrollLock(show && !exiting);

  const complete = () => {
    setShow(false);
    window.dispatchEvent(new Event("vs:intro-complete"));
  };

  // Skip immediately if this session already saw it.
  useEffect(() => {
    if (hasSeen()) {
      setShow(false);
      window.dispatchEvent(new Event("vs:intro-complete"));
    }
  }, []);

  // Caption-wave reveal, then arm the CTA.
  useEffect(() => {
    if (!show) return;
    const el = scriptRef.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 700;

    const spans = STATEMENT.trim()
      .split(/\s+/)
      .map((w) => {
        const s = document.createElement("span");
        s.textContent = w;
        s.style.cssText = `color:${DIM};transition:color .18s;`;
        el.appendChild(s);
        el.appendChild(document.createTextNode(" "));
        return s;
      });

    setRevealed(true);
    const timers: number[] = [];

    if (reduce) {
      spans.forEach((s) => (s.style.color = READ));
      timers.push(window.setTimeout(() => setCtaReady(true), 250));
    } else {
      let t = 600;
      spans.forEach((s) => {
        const w = s.textContent ?? "";
        const base = small ? 62 : 84;
        const dur = Math.min(base + w.length * (small ? 7 : 10), small ? 130 : 170);
        timers.push(
          window.setTimeout(() => {
            s.style.color = LIT;
            s.style.fontWeight = "700";
            timers.push(
              window.setTimeout(() => {
                s.style.color = READ;
                s.style.fontWeight = "";
              }, dur + 60),
            );
          }, t),
        );
        t += dur + (/[.,!?]$/.test(w) ? (small ? 180 : 260) : 0);
      });
      timers.push(window.setTimeout(() => setCtaReady(true), t + 800));
    }

    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [show]);

  // Focus the CTA when it appears; magnetic pull on fine pointers.
  useEffect(() => {
    if (!ctaReady) return;
    const cta = ctaRef.current;
    if (!cta) return;
    cta.focus({ preventScroll: true });

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    const RADIUS = 140;
    const MAX_PULL = 22;
    const onMove = (e: MouseEvent) => {
      const r = cta.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy);
      if (d > 0 && d < RADIUS) {
        const f = (1 - d / RADIUS) * MAX_PULL;
        cta.style.transform = `translate(${(dx / d) * f}px,${(dy / d) * f}px) scale(1.04)`;
        cta.style.boxShadow =
          "0 0 0 1px rgba(201,250,77,0.5), 0 0 34px rgba(201,250,77,0.35)";
      } else {
        cta.style.transform = "none";
        cta.style.boxShadow = "none";
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [ctaReady]);

  const enter = () => {
    if (exiting) return;
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    setExiting(true);
    window.scrollTo(0, 0);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gate = gateRef.current;
    const wipe = wipeRef.current;
    const cta = ctaRef.current;
    if (reduce || !gate || !wipe || !cta) {
      window.setTimeout(complete, 400);
      return;
    }

    const r = cta.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    wipe.style.left = `${cx - 20}px`;
    wipe.style.top = `${cy - 20}px`;
    const reach = Math.hypot(
      Math.max(cx, window.innerWidth - cx),
      Math.max(cy, window.innerHeight - cy),
    );
    wipe.style.transition = "transform .7s cubic-bezier(.65,0,.35,1)";
    requestAnimationFrame(() => {
      wipe.style.transform = `scale(${(reach / 20) * 1.1})`;
    });
    window.setTimeout(() => {
      gate.style.background = "transparent";
      wipe.style.transition = "opacity .55s";
      wipe.style.opacity = "0";
      window.setTimeout(complete, 560);
    }, 700);
  };

  if (!show) return null;

  const fadeIn = { opacity: revealed ? 1 : 0, transition: "opacity .8s" };

  return (
    <div
      ref={gateRef}
      data-intro-gate
      role="dialog"
      aria-modal="true"
      aria-label="Introduction"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-primary px-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(100% 60% at 50% 110%, rgba(201,250,77,0.09), transparent 60%)",
        }}
      />

      <div
        className="relative w-full max-w-[680px]"
        style={{ opacity: exiting ? 0 : 1, transition: "opacity .3s" }}
      >
        <div
          className="mb-[26px] font-mono text-[12px] uppercase tracking-[0.2em] text-accent"
          style={fadeIn}
        >
          {"// On the record"}
        </div>

        <p className="sr-only">{STATEMENT}</p>
        <p
          ref={scriptRef}
          aria-hidden="true"
          className="m-0 font-body font-medium"
          style={{
            fontSize: "clamp(20px, 3vw, 30px)",
            lineHeight: 1.45,
            letterSpacing: "-0.01em",
            color: DIM,
            textWrap: "pretty",
          }}
        />

        <div className="mt-[38px] min-h-[56px]">
          <button
            ref={ctaRef}
            type="button"
            onClick={enter}
            className="inline-flex items-center gap-3 rounded-[2px] bg-accent px-[30px] py-[17px] font-display text-[16px] font-bold text-bg-primary"
            style={{
              opacity: ctaReady ? 1 : 0,
              visibility: ctaReady ? "visible" : "hidden",
              transform: ctaReady ? "none" : "translateY(14px)",
              transition:
                "opacity .5s, transform .5s cubic-bezier(.16,1,.3,1), box-shadow .3s",
              willChange: "transform",
            }}
          >
            See for yourself <span aria-hidden="true">&rarr;</span>
          </button>
        </div>

        <div
          aria-hidden="true"
          className="absolute right-0 top-[-70px] font-mono text-[11px] tracking-[0.16em] text-placeholder"
          style={fadeIn}
        >
          REC &#9679; 00:01
        </div>
      </div>

      <div
        ref={wipeRef}
        aria-hidden="true"
        className="pointer-events-none absolute z-[5] h-10 w-10 rounded-full bg-accent"
        style={{ transform: "scale(0)" }}
      />

      <noscript>
        <style>{`[data-intro-gate]{display:none !important}`}</style>
      </noscript>
    </div>
  );
}
