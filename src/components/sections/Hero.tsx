"use client";

export default function Hero() {
  return (
    <header className="relative flex min-h-screen flex-col justify-center overflow-hidden pb-16 pt-[110px] md:pt-32">
      <div className="relative mx-auto w-full max-w-[1340px] px-7">
        {/* Ghost MT watermark */}
        <div
          data-parallax="0.5"
          aria-hidden="true"
          className="pointer-events-none absolute right-[4%] top-[8%] select-none font-display font-extrabold leading-[0.8] tracking-[-0.04em]"
          style={{ fontSize: "min(34vw, 460px)", color: "rgba(255,255,255,0.03)" }}
        >
          MT
        </div>

        {/* Eyebrow */}
        <div
          data-reveal
          className="relative z-10 mb-6 flex items-center gap-3.5 font-mono text-[12px] uppercase tracking-[0.2em] text-accent"
        >
          <span className="h-px w-[34px] bg-accent" />
          UI/UX Designer &amp; Webflow Developer · Lagos
        </div>

        {/* H1 (3D tilt target) */}
        <div
          data-tilt
          className="relative z-10"
          style={{ transformStyle: "preserve-3d", willChange: "transform" }}
        >
          {/* "MALEEK" is ~7em wide in Syne, so (100vw - 56px gutters) / 7.2 sizes it
              to span the content column without clipping the K; capped at 180px so it
              also fits the 1340px desktop column. */}
          <h1
            className="m-0 font-display font-extrabold leading-[0.82] tracking-[-0.03em]"
            style={{ fontSize: "min(calc((100vw - 56px) / 7.2), 180px)" }}
          >
            MALEEK
            <br />
            <span style={{ color: "transparent", WebkitTextStroke: "1.5px #c9fa4d" }}>
              TAIWO
            </span>
          </h1>
        </div>

        {/* Lead + CTAs */}
        <div
          className="relative z-10 mt-10 grid items-end gap-8"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}
        >
          <p
            data-reveal
            className="m-0 max-w-[520px] font-body leading-[1.55] text-text-secondary"
            style={{ fontSize: "clamp(16px, 1.5vw, 19px)" }}
          >
            I design and build functional websites that solve real user problems.
            Clean interfaces, a focus on what the user actually needs, and solid
            code to bring it to life on the web.
          </p>
          <div data-reveal className="flex flex-wrap gap-3">
            <a
              href="#work"
              data-magnet
              className="inline-flex items-center gap-2.5 rounded-[2px] bg-accent px-5 py-[15px] text-[14px] font-bold text-bg-primary transition-colors"
            >
              View my work →
            </a>
            <a
              href="#contact"
              data-magnet
              className="inline-flex items-center gap-2.5 rounded-[2px] border border-white/25 px-5 py-[15px] text-[14px] text-text-primary transition-colors hover:border-accent"
            >
              Let&apos;s talk
            </a>
          </div>
        </div>

        {/* Draggable ID card */}
        <figure
          data-drag
          data-rot="-4"
          className="vs-float absolute bottom-[7%] right-[5%] z-20 m-0 hidden rounded-[6px] border border-border bg-bg-elevated p-3 sm:block"
          style={{ width: "min(38vw, 210px)", boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}
        >
          <div className="mb-2 flex justify-between font-mono text-[9px] tracking-[0.12em] text-accent">
            <span>ID · 001</span>
            <span>LAGOS</span>
          </div>
          <img
            src="/images/headshot.jpg"
            alt="Maleek Taiwo"
            draggable={false}
            className="block w-full rounded-[4px]"
            style={{ filter: "grayscale(0.3) contrast(1.05)" }}
          />
          <div className="mt-2 font-mono text-[10px] tracking-[0.1em] text-text-muted">
            DRAG ME ✦ AVAILABLE FOR WORK
          </div>
        </figure>

        {/* Ticker */}
        <div
          data-reveal
          className="relative z-10 mt-12 font-mono text-[11px] uppercase tracking-[0.18em] text-text-dim"
        >
          Scroll ↓ &nbsp;·&nbsp; 06 Projects &nbsp;·&nbsp; 3+ Years
        </div>
      </div>
    </header>
  );
}
