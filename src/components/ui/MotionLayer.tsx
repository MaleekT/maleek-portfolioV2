"use client";

import { useEffect } from "react";

/**
 * Void Signal motion layer. Mounted once. Powers the custom cursor, magnetic
 * buttons, hero tilt, parallax, scroll reveals, draggable ID card, the work-row
 * cursor-follow preview, the live clock, and the scroll-progress bar.
 *
 * All pointer-driven motion is gated behind a fine pointer and respects
 * prefers-reduced-motion. Every listener and animation frame is cleaned up.
 * Smoothing uses lerp easing so nothing feels snappy.
 */
export default function MotionLayer() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    const cleanups: Array<() => void> = [];

    // ---------- Scroll progress bar (always) ----------
    const progress = document.querySelector<HTMLElement>("[data-progress]");
    const onScroll = () => {
      if (!progress) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    cleanups.push(() => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    });

    // ---------- Live Lagos clock (always) ----------
    const clock = document.querySelector<HTMLElement>("[data-clock]");
    if (clock) {
      const pad = (n: number) => String(n).padStart(2, "0");
      const tick = () => {
        const now = new Date();
        const wat = new Date(now.getTime() + (now.getTimezoneOffset() + 60) * 60000);
        clock.textContent = `${pad(wat.getHours())}:${pad(wat.getMinutes())}:${pad(wat.getSeconds())} WAT`;
      };
      tick();
      const id = window.setInterval(tick, 1000);
      cleanups.push(() => window.clearInterval(id));
    }

    // ---------- Scroll reveals (one shared IntersectionObserver) ----------
    const reveals = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    if (reveals.length) {
      const variants: Record<string, { hidden: string; visible: string }> = {
        "fade-up": { hidden: "translateY(20px)", visible: "translateY(0)" },
        "slide-left": { hidden: "translateX(-24px)", visible: "translateX(0)" },
        "slide-right": { hidden: "translateX(24px)", visible: "translateX(0)" },
        "scale-in": { hidden: "scale(.96)", visible: "scale(1)" },
        "id-card": { hidden: "translateY(18px) rotate(-7deg) scale(.96)", visible: "translateY(0) rotate(-4deg) scale(1)" },
        "clip-horizontal": { hidden: "none", visible: "none" },
        masked: { hidden: "translateY(100%)", visible: "translateY(0)" },
        "divider-sweep": { hidden: "scaleX(0)", visible: "scaleX(1)" },
      };

      reveals.forEach((el) => {
        const kind = el.dataset.revealType || "fade-up";
        const variant = variants[kind] || variants["fade-up"];
        el.style.opacity = "0";
        el.style.transform = reduce ? "none" : variant.hidden;
        el.style.clipPath = reduce
          ? "none"
          : kind === "masked"
            ? "inset(0 0 100% 0)"
            : kind === "clip-horizontal"
              ? "inset(0 100% 0 0)"
              : "none";
        el.style.transformOrigin = kind === "divider-sweep" ? "left center" : "center";
        el.style.transition = [
          `opacity ${reduce ? "180ms" : "600ms"} cubic-bezier(.23,1,.32,1)`,
          `transform ${reduce ? "180ms" : "600ms"} cubic-bezier(.23,1,.32,1)`,
          `clip-path ${reduce ? "180ms" : "650ms"} cubic-bezier(.23,1,.32,1)`,
        ].join(", ");
        el.style.transitionDelay = reduce ? "0ms" : `${Number(el.dataset.revealDelay || 0)}ms`;
        el.style.willChange = "opacity, transform, clip-path";
      });

      const reveal = (el: HTMLElement) => {
        const kind = el.dataset.revealType || "fade-up";
        el.style.opacity = "1";
        el.style.transform = reduce ? "none" : (variants[kind]?.visible || "none");
        el.style.clipPath =
          kind === "masked" || kind === "clip-horizontal"
            ? "inset(0 0 0 0)"
            : "none";
        window.setTimeout(() => {
          el.style.willChange = "auto";
          if (el.dataset.ambient) el.dataset.ambientReady = "true";
        }, reduce ? 200 : 750 + Number(el.dataset.revealDelay || 0));
      };

      const observedTargets = new Map<Element, HTMLElement[]>();
      const proxyFor = (el: HTMLElement) =>
        (el.dataset.revealType === "masked" ||
          el.dataset.revealType === "clip-horizontal") &&
        el.parentElement
          ? el.parentElement
          : el;
      reveals.forEach((el) => {
        const proxy = proxyFor(el);
        const targets = observedTargets.get(proxy) || [];
        targets.push(el);
        observedTargets.set(proxy, targets);
      });

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            (observedTargets.get(entry.target) || []).forEach(reveal);
            io.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
      );

      const observeReveals = (items: HTMLElement[]) => {
        const proxies = new Set(items.map(proxyFor));
        proxies.forEach((proxy) => io.observe(proxy));
      };
      const heroReveals = reveals.filter((el) => el.dataset.revealGroup === "hero");
      observeReveals(reveals.filter((el) => el.dataset.revealGroup !== "hero"));

      let heroStarted = false;
      const startHero = () => {
        if (heroStarted) return;
        heroStarted = true;
        observeReveals(heroReveals);
      };
      let gateObserver: MutationObserver | null = null;
      if (document.querySelector("[data-intro-gate]")) {
        window.addEventListener("vs:intro-complete", startHero, { once: true });
        gateObserver = new MutationObserver(() => {
          if (!document.querySelector("[data-intro-gate]")) {
            startHero();
            gateObserver?.disconnect();
          }
        });
        gateObserver.observe(document.body, { childList: true, subtree: true });
        cleanups.push(() => window.removeEventListener("vs:intro-complete", startHero));
      } else {
        startHero();
      }
      cleanups.push(() => {
        gateObserver?.disconnect();
        io.disconnect();
      });
    }
    // ---------- Pointer-driven layer (fine pointers only) ----------
    if (!coarse && !reduce) {
      // Custom cursor: outlined ring (eased) + solid dot (instant).
      const ring = document.createElement("div");
      ring.style.cssText =
        "position:fixed;left:0;top:0;width:30px;height:30px;border:1.5px solid #c9fa4d;border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:99999;transition:width .28s cubic-bezier(.2,.8,.2,1),height .28s cubic-bezier(.2,.8,.2,1),background .28s ease;will-change:left,top;";
      const dot = document.createElement("div");
      dot.style.cssText =
        "position:fixed;left:0;top:0;width:5px;height:5px;background:#c9fa4d;border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:99999;will-change:left,top;";
      document.body.appendChild(ring);
      document.body.appendChild(dot);

      const cursorStyle = document.createElement("style");
      cursorStyle.textContent =
        "html.vs-cursor, html.vs-cursor * { cursor: none !important; }";
      document.head.appendChild(cursorStyle);
      document.documentElement.classList.add("vs-cursor");

      // Grow over interactive elements (delegated, so dynamic case-study content works too).
      const SEL = "a, button, [data-drag], [data-work], input, textarea";
      const grow = () => {
        ring.style.width = "54px";
        ring.style.height = "54px";
        ring.style.background = "rgba(201,250,77,0.14)";
      };
      const shrink = () => {
        ring.style.width = "30px";
        ring.style.height = "30px";
        ring.style.background = "transparent";
      };
      const onOver = (e: Event) => {
        const t = e.target as HTMLElement;
        if (t?.closest?.(SEL)) grow();
      };
      const onOut = (e: Event) => {
        const me = e as MouseEvent;
        const from = me.target as HTMLElement;
        const to = me.relatedTarget as HTMLElement | null;
        if (from?.closest?.(SEL) && !to?.closest?.(SEL)) shrink();
      };
      document.addEventListener("mouseover", onOver);
      document.addEventListener("mouseout", onOut);

      // Magnetic targets.
      const magnets = Array.from(
        document.querySelectorAll<HTMLElement>("[data-magnet]"),
      );
      const magnetRects = new Map<HTMLElement, DOMRect>();
      magnets.forEach((el) => {
        el.style.transition = "transform .3s cubic-bezier(.2,.8,.2,1)";
        el.style.willChange = "transform";
        const enter = () => magnetRects.set(el, el.getBoundingClientRect());
        const leave = () => {
          magnetRects.delete(el);
          el.style.transform = "none";
        };
        el.addEventListener("pointerenter", enter);
        el.addEventListener("pointerleave", leave);
        cleanups.push(() => {
          el.removeEventListener("pointerenter", enter);
          el.removeEventListener("pointerleave", leave);
        });
      });

      const tilt = document.querySelector<HTMLElement>("[data-tilt]");
      const parallaxes = Array.from(
        document.querySelectorAll<HTMLElement>("[data-parallax]"),
      );

      // Work-row cursor-follow preview tile (shows the real project thumbnail).
      const preview = document.createElement("div");
      preview.style.cssText =
        "position:fixed;left:0;top:0;width:230px;height:150px;border-radius:6px;pointer-events:none;z-index:9998;opacity:0;overflow:hidden;border:1px solid rgba(201,250,77,0.5);background:#0e1011;transition:opacity .3s ease;will-change:left,top,opacity;";
      const previewImg = document.createElement("img");
      previewImg.alt = "";
      previewImg.style.cssText =
        "width:100%;height:100%;object-fit:cover;display:block;";
      preview.appendChild(previewImg);
      document.body.appendChild(preview);
      let previewVisible = false;
      const works = Array.from(
        document.querySelectorAll<HTMLElement>("[data-work]"),
      );
      works.forEach((row) => {
        const thumb = row.getAttribute("data-thumb") || "";
        const enter = () => {
          if (thumb) previewImg.src = thumb;
          preview.style.opacity = "1";
          previewVisible = true;
        };
        const leave = () => {
          preview.style.opacity = "0";
          previewVisible = false;
        };
        row.addEventListener("mouseenter", enter);
        row.addEventListener("mouseleave", leave);
        cleanups.push(() => {
          row.removeEventListener("mouseenter", enter);
          row.removeEventListener("mouseleave", leave);
        });
      });

      // Pointer state.
      let tx = 0,
        ty = 0; // raw cursor
      let rx = 0,
        ry = 0; // eased ring
      let mx = 0,
        my = 0; // raw normalized mouse
      let smx = 0,
        smy = 0; // eased normalized mouse (tilt + parallax)
      let ptx = 0,
        pty = 0,
        px = 0,
        py = 0; // preview target + eased

      const onMove = (e: PointerEvent) => {
        tx = e.clientX;
        ty = e.clientY;
        dot.style.left = `${tx}px`;
        dot.style.top = `${ty}px`;
        mx = e.clientX / window.innerWidth - 0.5;
        my = e.clientY / window.innerHeight - 0.5;
        ptx = e.clientX + 26;
        pty = e.clientY + 26;
        magnets.forEach((el) => {
          const r = magnetRects.get(el) || el.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          if (Math.abs(dx) < r.width / 2 + 14 && Math.abs(dy) < r.height / 2 + 14) {
            const cap = 7;
            const ox = Math.max(-cap, Math.min(cap, dx * 0.3));
            const oy = Math.max(-cap, Math.min(cap, dy * 0.4));
            el.style.transform = `translate(${ox}px,${oy}px)`;
          } else {
            el.style.transform = "none";
          }
        });
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      let raf = 0;
      const loop = () => {
        // Ease the ring (lerp 0.18 = smooth trailing).
        rx += (tx - rx) * 0.18;
        ry += (ty - ry) * 0.18;
        ring.style.left = `${rx}px`;
        ring.style.top = `${ry}px`;
        // Heavily ease the mouse value used for tilt + parallax (lerp 0.08 = buttery).
        smx += (mx - smx) * 0.08;
        smy += (my - smy) * 0.08;
        if (tilt) {
          tilt.style.transform = `perspective(1100px) rotateY(${smx * 6}deg) rotateX(${-smy * 4}deg)`;
        }
        parallaxes.forEach((el) => {
          const s = parseFloat(el.getAttribute("data-parallax") || "0.3");
          el.style.transform = `translate(${-smx * 56 * s}px, ${-smy * 38 * s + window.scrollY * s * 0.18}px)`;
        });
        if (previewVisible) {
          px += (ptx - px) * 0.16;
          py += (pty - py) * 0.16;
          preview.style.left = `${px - 115}px`;
          preview.style.top = `${py - 75}px`;
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

      // Draggable cards with inertial decay.
      Array.from(document.querySelectorAll<HTMLElement>("[data-drag]")).forEach(
        (el) => {
          let x = 0,
            y = 0,
            vx = 0,
            vy = 0,
            dragging = false,
            lx = 0,
            ly = 0,
            lt = 0,
            dragRaf = 0;
          const rot = parseFloat(el.getAttribute("data-rot") || "0");
          const apply = () => {
            el.style.transform = `translate(${x}px,${y}px) rotate(${rot + x * 0.02}deg)`;
          };
          el.style.touchAction = "none";
          el.style.cursor = "grab";
          const down = (e: PointerEvent) => {
            dragging = true;
            el.setPointerCapture(e.pointerId);
            el.style.cursor = "grabbing";
            el.style.zIndex = "90";
            el.style.animation = "none";
            el.style.transition = "none";
            el.style.willChange = "transform";
            cancelAnimationFrame(dragRaf);
            lx = e.clientX;
            ly = e.clientY;
            lt = performance.now();
            vx = vy = 0;
            e.preventDefault();
          };
          const move = (e: PointerEvent) => {
            if (!dragging) return;
            const now = performance.now();
            const dx = e.clientX - lx;
            const dy = e.clientY - ly;
            const dt = Math.max(now - lt, 1);
            x += dx;
            y += dy;
            vx = (dx / dt) * 15;
            vy = (dy / dt) * 15;
            lx = e.clientX;
            ly = e.clientY;
            lt = now;
            apply();
          };
          const up = () => {
            if (!dragging) return;
            dragging = false;
            el.style.cursor = "grab";
            const decay = () => {
              vx *= 0.92;
              vy *= 0.92;
              x += vx;
              y += vy;
              apply();
              if (Math.abs(vx) > 0.12 || Math.abs(vy) > 0.12) {
                dragRaf = requestAnimationFrame(decay);
              }
            };
            decay();
          };
          el.addEventListener("pointerdown", down);
          el.addEventListener("pointermove", move);
          el.addEventListener("pointerup", up);
          el.addEventListener("pointercancel", up);
          cleanups.push(() => {
            el.removeEventListener("pointerdown", down);
            el.removeEventListener("pointermove", move);
            el.removeEventListener("pointerup", up);
            el.removeEventListener("pointercancel", up);
            cancelAnimationFrame(dragRaf);
          });
        },
      );

      cleanups.push(() => {
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("mouseover", onOver);
        document.removeEventListener("mouseout", onOut);
        ring.remove();
        dot.remove();
        preview.remove();
        cursorStyle.remove();
        document.documentElement.classList.remove("vs-cursor");
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
