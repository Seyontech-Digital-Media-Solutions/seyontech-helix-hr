import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FRONTEND_URL = Deno.env.get("FRONTEND_URL") ?? "http://localhost:8080";
const FROM_EMAIL = "Helix HR <onboarding@resend.dev>";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { type, to, name, referenceId, status } = await req.json();

    let subject = "";
    let html = "";

    if (type === "confirmation") {
      subject = `✅ Submission Received — ${referenceId}`;
      html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#1a1a1a">Submission Received!</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Thank you for completing your onboarding form. Our HR team will review your details shortly.</p>
          <div style="background:#f4f4f5;border-radius:8px;padding:16px;margin:20px 0">
            <p style="margin:0;font-size:14px;color:#666">Reference ID</p>
            <p style="margin:4px 0 0;font-size:20px;font-weight:bold;font-family:monospace">${referenceId}</p>
          </div>
          <p>Track your application status anytime:</p>
          <a href="${FRONTEND_URL}/status/${referenceId}"
            style="display:inline-block;background:#2563eb;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:500">
            Track your status
          </a>
          <p style="margin-top:24px;color:#666;font-size:13px">— Helix HR Team, Seyontech</p>
        </div>
      `;
    } else if (type === "status-update") {
      const statusColors: Record<string, string> = {
        APPROVED: "#16a34a",
        REJECTED: "#dc2626",
        JOINED: "#2563eb",
        PENDING: "#d97706",
      };
      const statusLabels: Record<string, string> = {
        APPROVED: "Approved ✅",
        REJECTED: "Rejected ❌",
        JOINED: "Joined 🎉",
        PENDING: "Pending ⏳",
      };

      subject = `Update on your application — ${referenceId}`;
      html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#1a1a1a">Application Status Updated</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Your application status has been updated.</p>
          <div style="background:#f4f4f5;border-radius:8px;padding:16px;margin:20px 0">
            <p style="margin:0;font-size:14px;color:#666">Reference ID</p>
            <p style="margin:4px 0 0;font-family:monospace;font-weight:bold">${referenceId}</p>
            <p style="margin:12px 0 0;font-size:14px;color:#666">New Status</p>
            <p style="margin:4px 0 0;font-size:20px;font-weight:bold;color:${statusColors[status] ?? "#1a1a1a"}">
              ${statusLabels[status] ?? status}
            </p>
          </div>
          <a href="${FRONTEND_URL}/status/${referenceId}"
            style="display:inline-block;background:#2563eb;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:500">
            View your status
          </a>
          <p style="margin-top:24px;color:#666;font-size:13px">— Helix HR Team, Seyontech</p>
        </div>
      `;
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});