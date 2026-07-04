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

  // TEMP DEBUG: track the step and surface the real error/codes in the response
  // so the true cause is visible on the preview. Revert to friendly messages after.
  let step = "start";
  try {
    // 1. Verify the Turnstile token with Cloudflare (secret stays server-side).
    step = "turnstile-verify";
    const verifyRes = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const verify = (await verifyRes.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };
    if (!verify.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Captcha verification failed. [${(verify["error-codes"] ?? []).join(",")}]`,
        },
        { status: 403 },
      );
    }

    // 2. Forward the submission to Web3Forms for email delivery.
    // A real User-Agent is required: Web3Forms sits behind Cloudflare, which
    // serves an HTML block page to server-side requests that lack one.
    step = "web3forms-forward";
    const forwardRes = await fetch(WEB3FORMS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `Portfolio contact from ${name.replace(/[\r\n]+/g, " ")}`,
        name,
        email,
        message,
      }),
    });
    // Read as text first so a non-JSON (HTML) response does not throw; TEMP
    // DEBUG surfaces the status + snippet if it is still not JSON.
    const forwardText = await forwardRes.text();
    let forwarded: { success?: boolean; message?: string };
    try {
      forwarded = JSON.parse(forwardText) as {
        success?: boolean;
        message?: string;
      };
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: `Delivery non-JSON [${forwardRes.status}]: ${forwardText.slice(0, 120)}`,
        },
        { status: 502 },
      );
    }
    if (!forwarded.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Delivery failed. [${forwarded.message ?? "no message"}]`,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`contact route error at ${step}:`, err);
    return NextResponse.json(
      {
        success: false,
        error: `Something went wrong [${step}]: ${err instanceof Error ? err.message : String(err)}`,
      },
      { status: 500 },
    );
  }
}
