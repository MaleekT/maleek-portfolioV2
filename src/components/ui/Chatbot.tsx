"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

const responses: { keywords: string[]; reply: string }[] = [
  {
    keywords: ["hi", "hello", "hey", "sup", "yo"],
    reply:
      "Hey there! I'm Maleek's virtual assistant. Ask me anything about his work, skills, or how to get in touch.",
  },
  {
    keywords: ["who", "about", "maleek", "yourself"],
    reply:
      "Maleek Taiwo is a UI/UX Designer & Webflow Developer based in Lagos, Nigeria. He designs and builds functional websites that solve real user problems, with clean interfaces and solid code.",
  },
  {
    keywords: ["skill", "tools", "tech", "stack", "expertise"],
    reply:
      "Maleek designs in Figma and builds with Webflow on the Client-First framework. He works with HTML/CSS, JavaScript, and integrations like Zapier, Memberstack, and Airtable. He also ships his own products, like Split and Pop, using AI-assisted development.",
  },
  {
    keywords: ["webflow"],
    reply:
      "Webflow is Maleek's primary development platform. He uses the Client-First framework for clean, scalable architecture, with Finsweet attributes, CMS architecture, custom animations, and ecommerce capabilities.",
  },
  {
    keywords: ["project", "work", "portfolio", "built", "made"],
    reply:
      "Maleek's featured work includes God's Time Textile Stores (e-commerce), Split (a DeFi savings app), Pop (a 1v1 betting app), Vantage Point (SaaS), Hayes Valley Interior Design, and Melons Site (fintech). Click any row in the Selected Work section to open the full case study.",
  },
  {
    keywords: ["price", "cost", "rate", "charge", "budget", "pricing"],
    reply:
      "Pricing depends on the scope and complexity of the project. Maleek offers competitive rates and typically works on a per-project basis. Reach out via the contact form or email maleektaiwo164@gmail.com for a custom quote.",
  },
  {
    keywords: ["hire", "available", "freelance", "work together", "open"],
    reply:
      "Yes! Maleek is currently taking on new projects, both freelance and full-time opportunities. Typical turnaround is 2 to 4 weeks depending on scope.",
  },
  {
    keywords: ["contact", "reach", "email", "touch", "connect"],
    reply:
      "You can reach Maleek at maleektaiwo164@gmail.com, on WhatsApp at +234 806 119 1638, or on Twitter/X @_MasterMal. Or just scroll down to the contact section and fill out the form!",
  },
  {
    keywords: ["process", "how", "workflow", "approach"],
    reply:
      "Maleek follows a 4-step process: 1) Discovery & Strategy to understand your goals, 2) UI/UX Design in Figma, 3) Webflow Development using Client-First, and 4) Custom Code & Launch with rigorous QA.",
  },
  {
    keywords: ["location", "where", "based", "lagos", "nigeria", "remote"],
    reply:
      "Maleek is based in Lagos, Nigeria and works with clients globally. He's fully set up for remote collaboration across time zones.",
  },
  {
    keywords: ["timeline", "how long", "turnaround", "deadline", "fast"],
    reply:
      "Typical project turnaround is 2 to 4 weeks depending on scope. Maleek prioritizes quality over speed, but can work within tight deadlines when needed.",
  },
  {
    keywords: ["design", "figma", "ui", "ux"],
    reply:
      "Maleek designs high-fidelity interfaces in Figma with obsessive attention to typography, spacing, and hierarchy. Every layout decision is intentional. No templates, no generic patterns.",
  },
];

const defaultReply =
  "I'm not sure about that one! You can ask me about Maleek's skills, projects, process, availability, or how to get in touch. Or reach out directly at maleektaiwo164@gmail.com.";

const suggestedQuestions = [
  "What does Maleek do?",
  "What tools does he use?",
  "Is he available for hire?",
  "How do I contact him?",
];

function getReply(input: string): string {
  const lower = input.toLowerCase();
  for (const r of responses) {
    if (r.keywords.some((kw) => lower.includes(kw))) {
      return r.reply;
    }
  }
  return defaultReply;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      text: "Hey! I'm Maleek's assistant. Ask me anything about his work, skills, or availability.",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const idRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: ++idRef.current, text: text.trim(), sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const botMsg: Message = {
        id: ++idRef.current,
        text: getReply(text),
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Toggle button */}
      <motion.button
        type="button"
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent shadow-[0_10px_30px_rgba(201,250,77,0.25)] transition-colors duration-300 hover:bg-accent-hover"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.svg
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#08090a"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#08090a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-6 z-50 flex h-[480px] max-h-[calc(100dvh-7rem)] w-[calc(100vw-3rem)] max-w-[360px] flex-col overflow-hidden rounded-[8px] border border-border bg-bg-primary shadow-[0_24px_60px_rgba(0,0,0,0.6)] sm:max-w-[380px]"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-[2px] bg-accent">
                <span className="font-mono text-[11px] font-bold text-bg-primary">MT</span>
              </div>
              <div>
                <p className="font-body text-[14px] font-medium text-text-primary">
                  Maleek&apos;s Assistant
                </p>
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-accent">
                  // Ask me anything
                </p>
              </div>
            </div>

            {/* Messages */}
            <div data-lenis-prevent className="flex-1 overflow-y-auto px-5 py-4">
              <div className="flex flex-col gap-3">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`max-w-[85%] ${
                      msg.sender === "user" ? "self-end" : "self-start"
                    }`}
                  >
                    <div
                      className={`rounded-[3px] px-4 py-3 font-body text-[13px] leading-[1.6] ${
                        msg.sender === "user"
                          ? "bg-accent text-bg-primary"
                          : "border border-border bg-bg-elevated text-text-secondary"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested questions, shown only alongside the intro message */}
              {messages.length === 1 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {suggestedQuestions.map((q) => (
                    <button
                      type="button"
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="rounded-[2px] border border-border px-3 py-1.5 font-mono text-[11px] text-text-muted transition-colors duration-200 hover:border-accent hover:text-accent"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 border-t border-border px-4 py-3"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something..."
                className="flex-1 bg-transparent font-body text-[13px] text-text-primary outline-none placeholder:text-placeholder"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex h-8 w-8 items-center justify-center text-accent transition-opacity duration-200 disabled:opacity-30"
                aria-label="Send message"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
