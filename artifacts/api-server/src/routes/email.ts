import { Router } from "express";
import nodemailer from "nodemailer";

const router = Router();

type EmailPayload = {
  to: string;
  subject: string;
  body: string;
  leadName?: string;
};

type SmtpConfig = {
  host: string;
  port?: string | number;
  user: string;
  pass: string;
  from?: string;
};

// In-memory SMTP config (overrides env vars when set via UI)
let runtimeSmtp: SmtpConfig | null = null;

function createTransport() {
  const host = runtimeSmtp?.host ?? process.env.SMTP_HOST;
  const port = Number(runtimeSmtp?.port ?? process.env.SMTP_PORT ?? 587);
  const user = runtimeSmtp?.user ?? process.env.SMTP_USER;
  const pass = runtimeSmtp?.pass ?? process.env.SMTP_PASS;
  const from = runtimeSmtp?.from ?? process.env.SMTP_FROM ?? user;

  if (!host || !user || !pass) return null;

  return {
    transport: nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    }),
    from,
  };
}

router.get("/status", (_req, res) => {
  const configured = !!(
    (runtimeSmtp?.host && runtimeSmtp?.user && runtimeSmtp?.pass) ||
    (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
  );
  res.json({ configured });
});

router.post("/configure", async (req, res) => {
  const { host, port, user, pass, from } = req.body as SmtpConfig;
  if (!host || !user || !pass) {
    res.status(400).json({ error: "host, user, and pass are required" });
    return;
  }
  // Quick connectivity test
  try {
    const transport = nodemailer.createTransport({
      host,
      port: Number(port ?? 587),
      secure: Number(port ?? 587) === 465,
      auth: { user, pass },
    });
    await transport.verify();
    runtimeSmtp = { host, port, user, pass, from };
    res.json({ success: true, message: "SMTP configured and verified" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "SMTP verification failed";
    res.status(400).json({ error: msg });
  }
});

router.post("/send", async (req, res) => {
  const { to, subject, body, leadName } = req.body as EmailPayload;

  if (!to || !subject || !body) {
    res.status(400).json({ error: "Missing required fields: to, subject, body" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    res.status(400).json({ error: "Invalid email address" });
    return;
  }

  const mailerConfig = createTransport();
  if (!mailerConfig) {
    res.status(503).json({
      error: "Email not configured. Click 'Setup Email' in the Outreach step to enter your SMTP credentials.",
      configured: false,
    });
    return;
  }

  try {
    await mailerConfig.transport.sendMail({
      from: mailerConfig.from,
      to,
      subject,
      text: body,
      html: `<div style="font-family:sans-serif;max-width:600px;line-height:1.6">${body.replace(/\n/g, "<br/>")}</div>`,
    });

    res.json({
      success: true,
      message: `Email sent to ${leadName ?? to}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    res.status(500).json({ error: message });
  }
});

export default router;
