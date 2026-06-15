import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FRONTEND_URL = Deno.env.get("FRONTEND_URL") ?? "http://localhost:8080";
const FROM_EMAIL = "Helix HR <onboarding@resend.dev>";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── PDF Generator ─────────────────────────────────────────────────────────────
async function generateLetterPDF(
  type: "approval" | "joining",
  data: { name: string; referenceId: string; position: string; department: string; joinDate: string, address: string },
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const { width, height } = page.getSize();

  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontReg  = await doc.embedFont(StandardFonts.Helvetica);

  const navy     = rgb(0.102, 0.137, 0.494);
  //const white    = rgb(1, 1, 1);
  const black    = rgb(0.07, 0.07, 0.07);
  const darkGray = rgb(0.33, 0.33, 0.33);

  // ── Format join date nicely ───────────────────────────────────────────────
  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
  const joinDateFormatted = data.joinDate
    ? new Date(data.joinDate).toLocaleDateString("en-IN", {
        day: "2-digit", month: "long", year: "numeric",
      })
    : "To be confirmed";

  // ── Top-right blue accent block ───────────────────────────────────────────
  page.drawRectangle({ x: width - 80, y: height - 30, width: 80, height: 30, color: navy });

  // ── Logo: "Seyontech" — drawn as separate text parts with circle ──────────
const logoY = height - 36;
const textSize = 26;
const dotCenterY = logoY + textSize / 2; // vertically centered on cap height

// "Seyntech" with dot as accent above — adjust x values based on your font metrics
page.drawText("Seyntech", { x: 32, y: logoY, font: fontBold, size: textSize, color: navy });

// Dot positioned as a superscript/accent — tweak x to match the logo
// If the dot is AFTER the full wordmark:
const wordWidth = 150; // measure your actual text width
page.drawEllipse({ x: 32 + wordWidth + 8, y: dotCenterY, xScale: 5, yScale: 5, color: navy });

// Subtitle
page.drawText("DIGITAL MEDIA SOLUTIONS", {
  x: 32, y: height - 52, font: fontReg, size: 7, color: navy,
});

  // ── Blue divider line ─────────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: height - 60, width, height: 3, color: navy });

  // ── Centered title ────────────────────────────────────────────────────────
  const title = type === "approval" ? "APPROVAL LETTER" : "JOINING CONFIRMATION LETTER";
  const titleW = fontBold.widthOfTextAtSize(title, 13);
  page.drawText(title, {
    x: (width - titleW) / 2, y: height - 86,
    font: fontBold, size: 13, color: black,
  });

  // ── Body ──────────────────────────────────────────────────────────────────
  let y = height - 110;
  const L = 40;

  const w = (text: string, bold = false, size = 10, color = black, x = L) => {
    page.drawText(text, { x, y, font: bold ? fontBold : fontReg, size, color });
    y -= size + 5;
  };
  const gap = (n = 8) => { y -= n; };

  // Date
  w(`Date: ${today}`);
  gap(4);

  // Address
 w("To,");
w(`Mr./Ms. ${data.name}`, true);
if (data.address) {
  data.address
    .split(/[,\n]/)
    .map((l: string) => l.trim())
    .filter((l: string) => l.length > 0)
    .forEach((line: string) => w(line));
} else {
  w("Chennai, Tamil Nadu");
}
  gap(8);

  // Subject
  const subjectLabel = type === "approval"
    ? "Approval of Pre-Joining Onboarding Application"
    : "Joining Confirmation Letter";
  const subjBoldW = fontBold.widthOfTextAtSize("Subject: ", 10);
  page.drawText("Subject: ", { x: L, y, font: fontBold, size: 10, color: black });
  page.drawText(subjectLabel, { x: L + subjBoldW, y, font: fontReg, size: 10, color: black });
  y -= 15;
  gap(6);

  // Salutation + body
  w(`Dear ${data.name},`);
  gap(4);

  if (type === "approval") {
    w("We are pleased to inform you that your pre-joining onboarding application submitted to");
    w("Seyontech Digital Media Solutions has been formally reviewed and approved by the Human");
    w("Resources Department. On behalf of the entire team, we extend our warmest congratulations.");
  } else {
    w("It is with great pleasure that we officially confirm your joining at Seyontech Digital");
    w("Media Solutions Pvt. Ltd. We warmly welcome you to our growing team and trust that your");
    w("association with us will be mutually rewarding and fulfilling.");
  }
  gap(4);
  w("This letter serves as your official confirmation. Please find the details below:");
  gap(6);

  // ── Details list ──────────────────────────────────────────────────────────
  w(type === "approval" ? "Appointment Details:" : "Employment Details:", true);
  gap(2);

  const rows = type === "approval"
    ? [
        ["Candidate Name",   data.name],
        ["Reference ID",     data.referenceId],
        ["Designation",      data.position],
        ["Department",       data.department],
        ["Expected Joining", joinDateFormatted],
        ["Work Location",    "Chennai"],
        ["Employment Type",  "Full-Time"],
      ]
    : [
        ["Employee Name",   data.name],
        ["Reference ID",    data.referenceId],
        ["Designation",     data.position],
        ["Department",      data.department],
        ["Reporting To",    "Team Lead"],
        ["Work Location",   "Chennai"],
        ["Date of Joining", joinDateFormatted],
        ["Employment Type", "Full-Time"],
      ];

  rows.forEach(([label, value]) => {
    page.drawText("-", { x: L, y, font: fontReg, size: 10, color: black });
    page.drawText(`${label} : ${value}`, { x: L + 10, y, font: fontReg, size: 10, color: black });
    y -= 14;
  });
  gap(8);

  // Work schedule (joining only)
  if (type === "joining") {
    w("Work Schedule:", true);
    w("Your working hours will be from 9:00 AM to 6:00 PM, Monday to Saturday.");
    gap(6);
  }

  // ── Terms & Conditions ────────────────────────────────────────────────────
  w("Terms & Conditions:", true);
  gap(2);

  const conditions = type === "approval"
    ? [
        "You are required to report to the HR department on or before the expected joining date.",
        "Original copies of all documents submitted during onboarding must be produced for verification.",
        "This approval is subject to successful background verification and document validation.",
        "Any change in joining date must be communicated to HR in writing at least 5 working days in advance.",
        "All work, documents, source code, designs, and intellectual property created during employment shall remain the sole property of Seyontech.",
      ]
    : [
        "Your employment will be governed by the company's policies, procedures, and code of conduct.",
        "You are required to maintain confidentiality regarding all company information, projects, client data, and internal communications.",
        "Please report to the HR department at 9:30 AM on your joining date with all original documents.",
        "Bring original Aadhaar card, PAN card, educational certificates, and passport-size photographs.",
        "All work, documents, source code, designs, and intellectual property created during employment shall remain the sole property of Seyontech.",
      ];

  conditions.forEach((c, i) => {
    page.drawText(`${i + 1}.`, { x: L, y, font: fontReg, size: 9.5, color: black });
    // Word wrap at ~82 chars
    const words = c.split(" ");
    let line = "";
    words.forEach((word) => {
      const test = line ? `${line} ${word}` : word;
      if (test.length > 82) {
        page.drawText(line, { x: L + 14, y, font: fontReg, size: 9.5, color: black });
        y -= 13;
        line = word;
      } else {
        line = test;
      }
    });
    if (line) {
      page.drawText(line, { x: L + 14, y, font: fontReg, size: 9.5, color: black });
      y -= 13;
    }
    y -= 3;
  });
  gap(8);

  // Closing lines
  if (type === "approval") {
    w("For any queries, please reach us at seyontechdigitalmarketing@gmail.com or +91 86104 99770.");
  } else {
    w("We are confident your skills and experience will make a significant contribution to Seyontech.");
    w("Your reporting manager and team are looking forward to your arrival.");
  }
  gap(4);
  w("We look forward to welcoming you to the Seyontech family.");
  gap(14);

  // ── Signature ─────────────────────────────────────────────────────────────
  w("Sincerely,");
  gap(26);
  page.drawLine({ start: { x: L, y }, end: { x: L + 140, y }, thickness: 0.8, color: black });
  y -= 12;
  w("Sathish A", true);
  w("CEO");
  w("Seyon Tech");
  w("seyontechdigitalmarketing@gmail.com");
  w("+91 86104 99770");
  gap(14);

  // ── Acceptance section ────────────────────────────────────────────────────
  page.drawLine({
    start: { x: L, y: y + 4 }, end: { x: width - L, y: y + 4 },
    thickness: 0.5, color: darkGray,
  });
  y -= 10;
  w("ACCEPTANCE BY CANDIDATE", true, 10);
  gap(4);
  w(`I, ${data.name}, accept the above offer and agree to the terms and conditions mentioned.`);
  gap(12);

  // Signature blank
  page.drawText("Signature:", { x: L, y, font: fontReg, size: 10, color: black });
  page.drawLine({ start: { x: L + 58, y: y - 2 }, end: { x: L + 220, y: y - 2 }, thickness: 0.8, color: black });
  y -= 22;

  // Date blank
  page.drawText("Date:", { x: L, y, font: fontReg, size: 10, color: black });
  page.drawLine({ start: { x: L + 34, y: y - 2 }, end: { x: L + 220, y: y - 2 }, thickness: 0.8, color: black });

  // ── Footer — fixed at bottom, never overlaps body ─────────────────────────
  const footerY = 90;

  // Footer divider line
  page.drawLine({
    start: { x: L, y: footerY },
    end: { x: width - L, y: footerY },
    thickness: 1, color: black,
  });

  // Phone circle + text
  //page.drawEllipse({ x: 66, y: footerY - 20, xScale: 13, yScale: 13, borderColor: navy, borderWidth: 2 });
  //page.drawText("+91 8610-499770", { x: 84, y: footerY - 25, font: fontBold, size: 11, color: black });

  // Website circle + text
 // page.drawEllipse({ x: 346, y: footerY - 20, xScale: 13, yScale: 13, borderColor: navy, borderWidth: 2 });
 // page.drawText("www.seyontech.in", { x: 364, y: footerY - 25, font: fontBold, size: 11, color: black });

  // ── Bottom blue block ─────────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: 0, width: 595, height: 22, color: navy });

  return await doc.save();
}

// ── Main handler ──────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const { type, to, name, referenceId, status, position, department, joinDate, address } = await req.json();

    let subject = "";
    let html = "";
    let attachments: { filename: string; content: string }[] = [];

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
        </div>`;

    } else if (type === "approval-letter") {
      subject = `🎉 Offer Approved — Welcome to Seyontech, ${name}!`;
      html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:16px 20px;border-radius:0">
            <h2 style="color:#15803d;margin:0">Congratulations! Your application has been approved</h2>
          </div>
          <p style="margin-top:16px">Dear <strong>${name}</strong>,</p>
          <p>We are delighted to inform you that your onboarding application has been <strong>approved</strong> by our HR team.</p>
          <p>Please find your official <strong>Approval Letter</strong> attached to this email as a PDF.</p>
          <div style="background:#f4f4f5;border-radius:8px;padding:16px;margin:20px 0;font-size:13px">
            <p style="margin:0;color:#666">Reference ID</p>
            <p style="margin:4px 0 12px;font-weight:bold;font-family:monospace">${referenceId}</p>
            <p style="margin:0;color:#666">Position</p>
            <p style="margin:4px 0 12px;font-weight:bold">${position}</p>
            <p style="margin:0;color:#666">Department</p>
            <p style="margin:4px 0 ${joinDate ? "12px" : "0"};font-weight:bold">${department}</p>
            ${joinDate ? `<p style="margin:0;color:#666">Expected join date</p><p style="margin:4px 0 0;font-weight:bold">${joinDate}</p>` : ""}
          </div>
          <a href="${FRONTEND_URL}/status/${referenceId}"
            style="display:inline-block;background:#16a34a;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:500">
            View application status
          </a>
          <p style="margin-top:24px;color:#666;font-size:13px">Warm regards,<br><strong>HR Team, Seyontech</strong></p>
        </div>`;

      const pdfBytes = await generateLetterPDF("approval", { name, referenceId, position: position ?? "", department: department ?? "", joinDate: joinDate ?? "", address: address ?? "" });
      const base64 = btoa(String.fromCharCode(...pdfBytes));
      attachments = [{ filename: `Seyontech_Approval_Letter_${name.replace(/\s+/g, "_")}.pdf`, content: base64 }];

    } else if (type === "joining-letter") {
      subject = `🎊 Welcome Aboard — Joining Confirmation, ${name}!`;
      html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <div style="background:#eff6ff;border-left:4px solid #2563eb;padding:16px 20px;border-radius:0">
            <h2 style="color:#1d4ed8;margin:0">Welcome to the Seyontech family!</h2>
          </div>
          <p style="margin-top:16px">Dear <strong>${name}</strong>,</p>
          <p>We are thrilled to confirm that you have officially <strong>joined Seyontech Digital Media Solutions</strong>.</p>
          <p>Please find your official <strong>Joining Confirmation Letter</strong> attached to this email as a PDF.</p>
          <div style="background:#f4f4f5;border-radius:8px;padding:16px;margin:20px 0;font-size:13px">
            <p style="margin:0;color:#666">Reference ID</p>
            <p style="margin:4px 0 12px;font-weight:bold;font-family:monospace">${referenceId}</p>
            <p style="margin:0;color:#666">Position</p>
            <p style="margin:4px 0 12px;font-weight:bold">${position}</p>
            <p style="margin:0;color:#666">Department</p>
            <p style="margin:4px 0 ${joinDate ? "12px" : "0"};font-weight:bold">${department}</p>
            ${joinDate ? `<p style="margin:0;color:#666">Date of joining</p><p style="margin:4px 0 0;font-weight:bold">${joinDate}</p>` : ""}
          </div>
          <a href="${FRONTEND_URL}/status/${referenceId}"
            style="display:inline-block;background:#2563eb;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:500">
            View onboarding status
          </a>
          <p style="margin-top:24px;color:#666;font-size:13px">Welcome aboard,<br><strong>HR Team, Seyontech</strong></p>
        </div>`;

      const pdfBytes = await generateLetterPDF("joining", { name, referenceId, position: position ?? "", department: department ?? "", joinDate: joinDate ?? "", address: address ?? "" });
      const base64 = btoa(String.fromCharCode(...pdfBytes));
      attachments = [{ filename: `Seyontech_Joining_Letter_${name.replace(/\s+/g, "_")}.pdf`, content: base64 }];

    } else if (type === "status-update") {
      const statusColors: Record<string, string> = {
        APPROVED: "#16a34a", REJECTED: "#dc2626", JOINED: "#2563eb", PENDING: "#d97706",
      };
      const statusLabels: Record<string, string> = {
        APPROVED: "Approved ✅", REJECTED: "Rejected ❌", JOINED: "Joined 🎉", PENDING: "Pending ⏳",
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
        </div>`;
    }

    const body: Record<string, unknown> = { from: FROM_EMAIL, to, subject, html };
    if (attachments.length > 0) body.attachments = attachments;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json", ...CORS },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS },
    });
  }
});