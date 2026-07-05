import { useEffect } from "react";
import type Lenis from "@studio-freight/lenis";

/**
 * Freeze page scroll while `active` is true: stops the shared Lenis instance
 * (exposed as window.__lenis by SmoothScroll) and locks native body overflow.
 * Restores both on cleanup, so nested/rapid toggles stay balanced.
 */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;

    const lenis = (window as unknown as { __lenis?: Lenis }).__lenis;
    lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
      lenis?.start();
    };
  }, [active]);
}
