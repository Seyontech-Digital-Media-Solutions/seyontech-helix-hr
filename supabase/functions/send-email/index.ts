import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FRONTEND_URL = Deno.env.get("FRONTEND_URL") ?? "http://localhost:8080";
const FROM_EMAIL = "Helix HR <onboarding@resend.dev>";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logoImageBytes = Uint8Array.from(atob("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"), (c) => c.charCodeAt(0));

// ── PDF Generator ─────────────────────────────────────────────────────────────
async function generateLetterPDF(
  type: "approval" | "joining",
  data: {
    name: string;
    referenceId: string;
    position: string;
    department: string;
    joinDate: string;
    address: string;
    stipend?: string;
  },
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const logoImage = await doc.embedJpg(logoImageBytes);
  const navy     = rgb(0.102, 0.137, 0.494);
  const black    = rgb(0.07, 0.07, 0.07);
  const darkGray = rgb(0.33, 0.33, 0.33);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontReg  = await doc.embedFont(StandardFonts.Helvetica);

  const PAGE_W  = 595;
  const PAGE_H  = 842;
  const L       = 40;
  const FOOTER_H = 90;

  let page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H;

  // ── Page frame (logo + divider + footer) drawn on every page ──────────────
  const drawPageFrame = (p: ReturnType<typeof doc.addPage>) => {
  const { width, height } = p.getSize();

  
  // Top-right blue parallelogram accent
  p.drawRectangle({
  x: 320,
  y: height - 28,
  width: 275,
  height: 28,
  color: navy,
});

for (let i = 0; i < 28; i++) {
  p.drawRectangle({
    x: 320 + i,
    y: height - 28,
    width: 1,
    height: 28 - i,
    color: rgb(1, 1, 1),
  });
}

  // ── Real logo image (replaces text) ──────────────────────────────────────
p.drawImage(logoImage, {
  x: 28,
  y: height - 85,  // ← moved up
  width: 140,
  height: 99,      // ← increased height
});

// Divider line matches logo bottom
/*p.drawLine({
  start: { x: 0, y: height - 90 },
  end: { x: width, y: height - 90 },
  thickness: 0.5,
  color: rgb(0.75, 0.75, 0.75),
});*/

  // Footer divider
  p.drawLine({
    start: { x: L, y: FOOTER_H - 10 }, end: { x: width - L, y: FOOTER_H - 10 },
    thickness: 1, color: black,
  });
 // Phone
p.drawText("Ph:", { x: L, y: FOOTER_H - 35, font: fontBold, size: 9, color: navy });
p.drawText("+91 8610-499770", { x: L + 22, y: FOOTER_H - 35, font: fontReg, size: 9, color: black });
// Website
p.drawText("Web:", { x: 320, y: FOOTER_H - 35, font: fontBold, size: 9, color: navy });
p.drawText("www.seyontech.in", { x: 346, y: FOOTER_H - 35, font: fontReg, size: 9, color: black });
  // Bottom bar
 // p.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: 22, color: navy });
};

  drawPageFrame(page);
  y = PAGE_H - 70;

  const checkPage = (needed = 16) => {
    if (y - needed < FOOTER_H) {
      page = doc.addPage([PAGE_W, PAGE_H]);
      drawPageFrame(page);
      y = PAGE_H - 70;
    }
  };

  const w = (text: string, bold = false, size = 10, color = black, x = L) => {
    checkPage(size + 5);
    page.drawText(text, { x, y, font: bold ? fontBold : fontReg, size, color });
    y -= size + 5;
  };
  const gap = (n = 8) => { y -= n; };

  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
  const joinDateFormatted = data.joinDate
  ? new Date(data.joinDate + "T00:00:00").toLocaleDateString("en-IN", {
      day: "2-digit", month: "long", year: "numeric",
    })
  : "To be confirmed"

  // ════════════════════════════════════════════════════════════════════════════
  // APPROVAL LETTER — original structure + Documents Required section
  // ════════════════════════════════════════════════════════════════════════════
  if (type === "approval") {
    const titleW = fontBold.widthOfTextAtSize("APPROVAL LETTER", 13);
    page.drawText("APPROVAL LETTER", {
      x: (PAGE_W - titleW) / 2, y, font: fontBold, size: 13, color: black,
    });
    y -= 20;

    w(`Date: ${today}`);
    gap(4);
    w("To,");
    w(`Mr./Ms. ${data.name}`, true);
    if (data.address) {
      data.address.split(/[,\n]/).map((l: string) => l.trim()).filter(Boolean).forEach((line: string) => w(line));
    } else {
      w("Chennai, Tamil Nadu");
    }
    gap(8);

    const subjBoldW = fontBold.widthOfTextAtSize("Subject: ", 10);
    checkPage(15);
    page.drawText("Subject: ", { x: L, y, font: fontBold, size: 10, color: black });
    page.drawText("Approval of Pre-Joining Onboarding Application", { x: L + subjBoldW, y, font: fontReg, size: 10, color: black });
    y -= 15;
    gap(6);

    w(`Dear ${data.name},`);
    gap(4);
    w("We are pleased to inform you that your pre-joining onboarding application submitted to");
    w("Seyontech Digital Media Solutions has been formally reviewed and approved by the Human");
    w("Resources Department. On behalf of the entire team, we extend our warmest congratulations.");
    gap(4);
    w("This letter serves as your official confirmation. Please find the details below:");
    gap(6);

    w("Appointment Details:", true);
    gap(2);
    const approvalRows = [
      ["Candidate Name",   data.name],
      ["Reference ID",     data.referenceId],
      ["Designation",      data.position],
      ["Department",       data.department],
      ["Expected Joining", joinDateFormatted],
      ["Work Location",    "Chennai"],
      ["Employment Type",  "Full-Time"],
    ];
    approvalRows.forEach(([label, value]) => {
      checkPage(14);
      page.drawText("-", { x: L, y, font: fontReg, size: 10, color: black });
      page.drawText(`${label} : ${value}`, { x: L + 10, y, font: fontReg, size: 10, color: black });
      y -= 14;
    });
    gap(8);

    // ── Documents Required ──────────────────────────────────────────────────
    w("Documents Required:", true);
    gap(2);
    w("Please bring the following original documents along with one set of photocopies");
    w("on or before your joining date for verification:");
    gap(4);
    const docs = [
      "Aadhaar Card",
      "PAN Card",
      "Updated Resume / CV",
      "Passport Size Photo",
      "Educational Certificates",
      "Experience Certificates from previous employer(s), if applicable",
      "Bank account details for salary processing",
    ];
    docs.forEach((d, i) => {
      checkPage(14);
      page.drawText(`${i + 1}.`, { x: L, y, font: fontReg, size: 9.5, color: black });
      page.drawText(d, { x: L + 14, y, font: fontReg, size: 9.5, color: black });
      y -= 14;
    });
    gap(8);

    w("Terms & Conditions:", true);
    gap(2);
    const approvalConditions = [
      "You are required to report to the HR department on or before the expected joining date.",
      "Original copies of all documents submitted during onboarding must be produced for verification.",
      "This approval is subject to successful background verification and document validation.",
      "Any change in joining date must be communicated to HR in writing at least 5 working days in advance.",
      "All work, documents, source code, designs, and intellectual property created during employment shall remain the sole property of Seyontech.",
    ];
    approvalConditions.forEach((c, i) => {
      checkPage(26);
      page.drawText(`${i + 1}.`, { x: L, y, font: fontReg, size: 9.5, color: black });
      const words = c.split(" ");
      let line = "";
      words.forEach((word) => {
        const test = line ? `${line} ${word}` : word;
        if (test.length > 82) {
          checkPage(13);
          page.drawText(line, { x: L + 14, y, font: fontReg, size: 9.5, color: black });
          y -= 13;
          line = word;
        } else { line = test; }
      });
      if (line) {
        checkPage(13);
        page.drawText(line, { x: L + 14, y, font: fontReg, size: 9.5, color: black });
        y -= 13;
      }
      y -= 3;
    });
    gap(8);

    w("For any queries, please reach us at seyontechdigitalmarketing@gmail.com or +91 86104 99770.");
    gap(4);
    w("We look forward to welcoming you to the Seyontech family.");
    gap(14);

    checkPage(100);
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

    checkPage(80);
    page.drawLine({ start: { x: L, y: y + 4 }, end: { x: PAGE_W - L, y: y + 4 }, thickness: 0.5, color: darkGray });
    y -= 10;
    w("ACCEPTANCE BY CANDIDATE", true, 10);
    gap(4);
    w(`I, ${data.name}, accept the above offer and agree to the terms and conditions mentioned.`);
    gap(12);
    page.drawText("Signature:", { x: L, y, font: fontReg, size: 10, color: black });
    page.drawLine({ start: { x: L + 58, y: y - 2 }, end: { x: L + 220, y: y - 2 }, thickness: 0.8, color: black });
    y -= 22;
    page.drawText("Date:", { x: L, y, font: fontReg, size: 10, color: black });
    page.drawLine({ start: { x: L + 34, y: y - 2 }, end: { x: L + 220, y: y - 2 }, thickness: 0.8, color: black });
  }

  // ════════════════════════════════════════════════════════════════════════════
  // JOINING LETTER — offer letter style
  // ════════════════════════════════════════════════════════════════════════════
  if (type === "joining") {
    const title = "JOINING CONFIRMATION LETTER";
    const titleW = fontBold.widthOfTextAtSize(title, 13);
    page.drawText(title, {
      x: (PAGE_W - titleW) / 2, y, font: fontBold, size: 13, color: black,
    });
    y -= 20;

    w(`Date: ${today}`);
    gap(4);
    w("To,");
    w(`Mr./Ms. ${data.name}`, true);
    if (data.address) {
      data.address.split(/[,\n]/).map((l: string) => l.trim()).filter(Boolean).forEach((line: string) => w(line));
    } else {
      w("Chennai, Tamil Nadu");
    }
    gap(8);

    const subjBoldW = fontBold.widthOfTextAtSize("Subject: ", 10);
    checkPage(15);
    page.drawText("Subject: ", { x: L, y, font: fontBold, size: 10, color: black });
    page.drawText("Joining Confirmation Letter", { x: L + subjBoldW, y, font: fontReg, size: 10, color: black });
    y -= 15;
    gap(6);

    w(`Dear ${data.name},`);
    gap(4);
    w("It is with great pleasure that we officially confirm your joining at Seyontech Digital");
    w("Media Solutions Pvt. Ltd. We warmly welcome you to our growing team and trust that your");
    w("association with us will be mutually rewarding and fulfilling.");
    gap(6);

    // Employment Details
    w("Employment Details:", true);
    gap(2);
    const joiningRows = [
      ["Employee Name",   data.name],
      ["Reference ID",    data.referenceId],
      ["Designation",     data.position],
      ["Department",      data.department],
      ["Reporting To",    "Team Lead"],
      ["Work Location",   "Chennai"],
      ["Date of Joining", joinDateFormatted],
      ["Employment Type", "Full-Time"],
    ];
    joiningRows.forEach(([label, value]) => {
      checkPage(14);
      page.drawText("-", { x: L, y, font: fontReg, size: 10, color: black });
      page.drawText(`${label} : ${value}`, { x: L + 10, y, font: fontReg, size: 10, color: black });
      y -= 14;
    });
    gap(8);

    // Salary Structure
    if (data.stipend) {
      checkPage(20);
      const stipendLabelW = fontBold.widthOfTextAtSize("Salary Structure: ", 10);
      page.drawText("Salary Structure: ", { x: L, y, font: fontBold, size: 10, color: black });
      page.drawText(`Monthly Stipend: ${data.stipend}`, { x: L + stipendLabelW, y, font: fontReg, size: 10, color: black });
      y -= 16;
      gap(6);
    }

    // Work Schedule
    w("Work Schedule:", true);
    w("Your working hours will be from 9:00 AM to 7:00 PM, Monday to Saturday.");
    gap(6);

    // Terms & Conditions
    w("Terms & Conditions:", true);
    gap(2);
    const joiningConditions = [
      "Your employment will be governed by the company's policies, procedures, and code of conduct.",
      "You are required to maintain confidentiality regarding all company information, projects, client data, and internal communications.",
      "During your employment, you shall not engage in any activity that creates a conflict of interest with the company or adversely affects your responsibilities.",
      "Please report to the HR department at 9:30 AM on your joining date with all original documents.",
      "Bring original Aadhaar card, PAN card, educational certificates, and passport-size photographs.",
      "All work, documents, source code, designs, and intellectual property created during employment shall remain the sole property of Seyontech.",
    ];
    joiningConditions.forEach((c, i) => {
      checkPage(26);
      page.drawText(`${i + 1}.`, { x: L, y, font: fontReg, size: 9.5, color: black });
      const words = c.split(" ");
      let line = "";
      words.forEach((word) => {
        const test = line ? `${line} ${word}` : word;
        if (test.length > 82) {
          checkPage(13);
          page.drawText(line, { x: L + 14, y, font: fontReg, size: 9.5, color: black });
          y -= 13;
          line = word;
        } else { line = test; }
      });
      if (line) {
        checkPage(13);
        page.drawText(line, { x: L + 14, y, font: fontReg, size: 9.5, color: black });
        y -= 13;
      }
      y -= 3;
    });
    gap(8);

    w("We are confident your skills and experience will make a significant contribution to Seyontech.");
    w("Your reporting manager and team are looking forward to your arrival.");
    gap(4);
    w("We look forward to welcoming you to the Seyontech family.");
    gap(14);

    checkPage(100);
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

    checkPage(80);
    page.drawLine({ start: { x: L, y: y + 4 }, end: { x: PAGE_W - L, y: y + 4 }, thickness: 0.5, color: darkGray });
    y -= 10;
    w("ACCEPTANCE BY CANDIDATE", true, 10);
    gap(4);
    w(`I, ${data.name}, accept the above offer and agree to the terms and conditions mentioned.`);
    gap(12);
    page.drawText("Signature:", { x: L, y, font: fontReg, size: 10, color: black });
    page.drawLine({ start: { x: L + 58, y: y - 2 }, end: { x: L + 220, y: y - 2 }, thickness: 0.8, color: black });
    y -= 22;
    page.drawText("Date:", { x: L, y, font: fontReg, size: 10, color: black });
    page.drawLine({ start: { x: L + 34, y: y - 2 }, end: { x: L + 220, y: y - 2 }, thickness: 0.8, color: black });
  }

  return await doc.save();
}

// ── Main handler ──────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const { type, to, name, referenceId, status, position, department, joinDate, address, stipend } = await req.json();

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

      const pdfBytes = await generateLetterPDF("approval", { name, referenceId, position: position ?? "", department: department ?? "", joinDate: joinDate ?? "", address: address ?? "", stipend: stipend ?? "" });
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

      const pdfBytes = await generateLetterPDF("joining", { name, referenceId, position: position ?? "", department: department ?? "", joinDate: joinDate ?? "", address: address ?? "", stipend: stipend ?? "" });
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