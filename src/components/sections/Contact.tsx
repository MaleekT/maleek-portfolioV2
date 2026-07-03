"use client";

import { useEffect, useRef, useState } from "react";

const contactLinks = [
  {
    label: "EMAIL",
    value: "maleektaiwo164@gmail.com",
    href: "mailto:maleektaiwo164@gmail.com",
  },
  {
    label: "WHATSAPP",
    value: "+234 806 119 1638",
    href: "https://wa.me/2348061191638",
  },
  {
    label: "TWITTER / X",
    value: "@_MasterMal",
    href: "https://x.com/_MasterMal",
  },
  {
    label: "GITHUB",
    value: "MaleekT",
    href: "https://github.com/MaleekT",
  },
];

// Turnstile SITE key: public by design (the secret lives server-side in env).
const TURNSTILE_SITE_KEY = "0x4AAAAADutiFBUORLSjLKe";
const TURNSTILE_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileApi {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      theme?: "dark" | "light" | "auto";
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const inputClass =
  "w-full rounded-[3px] border border-border bg-bg-primary p-3 text-[14px] text-text-primary placeholder:text-placeholder focus:border-accent focus:outline-none";

type Status = "idle" | "sending" | "success" | "error";

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorText, setErrorText] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // Load the Turnstile script once and render the widget explicitly.
  useEffect(() => {
    let cancelled = false;

    const renderWidget = () => {
      if (cancelled || !window.turnstile || !widgetRef.current) return;
      if (widgetIdRef.current !== null) return;
      widgetIdRef.current = window.turnstile.render(widgetRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: "dark",
        callback: (t: string) => setToken(t),
        "expired-callback": () => setToken(""),
        "error-callback": () => setToken(""),
      });
    };

    let script: HTMLScriptElement | null = null;
    if (window.turnstile) {
      renderWidget();
    } else {
      script = document.querySelector<HTMLScriptElement>(
        `script[src="${TURNSTILE_SRC}"]`,
      );
      if (!script) {
        script = document.createElement("script");
        script.src = TURNSTILE_SRC;
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", renderWidget);
    }

    return () => {
      cancelled = true;
      script?.removeEventListener("load", renderWidget);
      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  const resetCaptcha = () => {
    setToken("");
    if (widgetIdRef.current !== null && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;
    if (!token) {
      setErrorText("Please complete the captcha first.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    try {
      const botcheck = (
        e.currentTarget.elements.namedItem("botcheck") as HTMLInputElement | null
      )?.checked;
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, token, botcheck }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (data.success) {
        setStatus("success");
        setName("");
        setEmail("");
        setMessage("");
        resetCaptcha();
        window.setTimeout(() => setStatus("idle"), 5000);
      } else {
        setErrorText(
          data.error ||
            "Something went wrong sending your message. Please try again, or email me directly.",
        );
        setStatus("error");
        resetCaptcha();
      }
    } catch {
      setErrorText(
        "Something went wrong sending your message. Please try again, or email me directly.",
      );
      setStatus("error");
      resetCaptcha();
    }
  };

  const buttonLabel =
    status === "sending"
      ? "Sending..."
      : status === "success"
        ? "✓ Sent. Thanks!"
        : "Send Message";

  return (
    <section
      id="contact"
      className="relative z-[5] mx-auto max-w-[1340px] px-7 pb-16"
      style={{ scrollMarginTop: "90px" }}
    >
      <div
        className="grid gap-12 border-t border-border pt-12"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}
      >
        {/* Left: info */}
        <div>
          <div
            data-reveal
            className="mb-4 font-mono text-[12px] uppercase tracking-[0.2em] text-accent"
          >
            // Get in touch
          </div>
          <h2
            data-reveal
            className="m-0 mb-4 font-display font-extrabold tracking-[-0.03em]"
            style={{ fontSize: "clamp(40px, 6.5vw, 86px)", lineHeight: 0.9 }}
          >
            Have a project in mind?
          </h2>
          <p className="max-w-[440px] text-[15px] leading-[1.6] text-text-muted">
            I&apos;m open to freelance projects and full-time roles, whether you
            need a complete website, a fresh redesign, or a technical Webflow
            build.
          </p>
          <div className="mt-6 flex flex-col">
            {contactLinks.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                data-magnet
                className="flex justify-between border-b border-border py-3.5 font-mono text-[13px] transition-colors duration-300 hover:text-accent"
              >
                <span className="text-text-dim">{c.label}</span>
                <span>{c.value}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Right: form */}
        <form
          onSubmit={handleSubmit}
          data-reveal
          className="rounded-[8px] border border-border bg-bg-secondary p-7"
        >
          {/* Honeypot: hidden from humans; bots that tick it get dropped server-side */}
          <input
            type="checkbox"
            name="botcheck"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />

          <label
            htmlFor="contact-name"
            className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-text-dim"
          >
            Name
          </label>
          <input
            id="contact-name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className={`mb-4 ${inputClass}`}
          />
          <label
            htmlFor="contact-email"
            className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-text-dim"
          >
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            required
            maxLength={200}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className={`mb-4 ${inputClass}`}
          />
          <label
            htmlFor="contact-message"
            className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-text-dim"
          >
            Message
          </label>
          <textarea
            id="contact-message"
            rows={4}
            required
            minLength={10}
            maxLength={5000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell me about the project"
            className={`mb-5 resize-y ${inputClass}`}
          />

          {/* Cloudflare Turnstile */}
          <div ref={widgetRef} className="mb-5 min-h-[65px]" />

          <button
            type="submit"
            data-magnet
            disabled={status === "sending"}
            className="w-full rounded-[3px] bg-accent p-4 font-display text-[15px] font-bold text-bg-primary transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70"
          >
            {buttonLabel}
          </button>

          <div aria-live="polite">
            {status === "error" && (
              <p className="mb-0 mt-3 font-mono text-[12px] text-red-400">
                {errorText}
              </p>
            )}
            {status === "success" && (
              <p className="mb-0 mt-3 font-mono text-[12px] text-accent">
                Your message is in my inbox. I&apos;ll get back to you within 24
                hours.
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
