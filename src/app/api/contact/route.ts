import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import twilio from "twilio";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, message } = await req.json();

    if (!name || !email || !phone || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    /* -------------------- Send Email via Gmail -------------------- */
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `Contact Form <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER,
        subject: `New contact from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`,
      });
    }

    /* -------------------- Send WhatsApp via Twilio -------------------- */
    if (
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_WHATSAPP_FROM &&
      process.env.TWILIO_WHATSAPP_TO
    ) {
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      await client.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
        to: `whatsapp:${process.env.TWILIO_WHATSAPP_TO}`,
        body: `New enquiry from ${name} (${phone}, ${email}): ${message}`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("/api/contact error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
