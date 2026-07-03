import { NextResponse } from "next/server";

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const WEB3FORMS_URL = "https://api.web3forms.com/submit";

interface ContactBody {
  name?: string;
  email?: string;
  message?: string;
  token?: string;
  botcheck?: boolean;
}

export async function POST(req: Request) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!secret || !accessKey) {
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

    // 2. Forward the submission to Web3Forms for email delivery.
    const forwardRes = await fetch(WEB3FORMS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `Portfolio contact from ${name.replace(/[\r\n]+/g, " ")}`,
        name,
        email,
        message,
      }),
    });
    const forwarded = (await forwardRes.json()) as { success?: boolean };
    if (!forwarded.success) {
      return NextResponse.json(
        { success: false, error: "Delivery failed. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
