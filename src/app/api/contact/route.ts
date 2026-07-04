import { NextResponse } from "next/server";

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const RESEND_URL = "https://api.resend.com/emails";

// Free Resend tier sends from this shared address; replies route to the visitor.
const MAIL_FROM = "Portfolio Contact <onboarding@resend.dev>";
const MAIL_TO = "maleektaiwo164@gmail.com";

interface ContactBody {
  name?: string;
  email?: string;
  message?: string;
  token?: string;
  botcheck?: boolean;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: Request) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!secret || !resendKey) {
    return NextResponse.json(
      { success: false, error: "Server is not configured for contact form." },
      { status: 500 },
    );
  }

  let body: ContactBody;
  try {
    body = (await req.json()) as ContactBody;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const message = (body.message ?? "").trim();
  const token = body.token ?? "";

  // Honeypot: a filled botcheck means a bot; pretend success and drop it.
  if (body.botcheck) {
    return NextResponse.json({ success: true });
  }

  if (
    name.length < 2 ||
    name.length > 100 ||
    email.length > 200 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    message.length < 10 ||
    message.length > 5000 ||
    !token
  ) {
    return NextResponse.json(
      { success: false, error: "Invalid form input." },
      { status: 400 },
    );
  }

  try {
    // 1. Verify the Turnstile token with Cloudflare (secret stays server-side).
    const verifyRes = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const verify = (await verifyRes.json()) as { success?: boolean };
    if (!verify.success) {
      return NextResponse.json(
        { success: false, error: "Captcha verification failed." },
        { status: 403 },
      );
    }

    // 2. Send the email via Resend (real server API, no browser challenge).
    const safeName = name.replace(/[\r\n]+/g, " ");
    const sendRes = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: [MAIL_TO],
        reply_to: email,
        subject: `Portfolio contact from ${safeName}`,
        text: `Name: ${safeName}\nEmail: ${email}\n\n${message}`,
        html: `<p><strong>Name:</strong> ${escapeHtml(safeName)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
      }),
    });

    if (!sendRes.ok) {
      const detail = await sendRes.text();
      console.error(`Resend send failed [${sendRes.status}]:`, detail);
      return NextResponse.json(
        { success: false, error: "Delivery failed. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("contact route error:", err);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
