import { Router } from "express";
import nodemailer from "nodemailer";

const router = Router();

type EmailPayload = {
  to: string;
  subject: string;
  body: string;
  leadName?: string;
};

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM ?? user;

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
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
  res.json({ configured });
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
      error: "Email not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables.",
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
      html: body.replace(/\n/g, "<br/>"),
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
