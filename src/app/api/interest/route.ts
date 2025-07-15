import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(_req: NextRequest) {
  try {
    /* -------------------- Send Email via Gmail -------------------- */
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json(
        { error: "Email credentials not configured" },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const subject = "Excited to Learn French with L'ecole Bibliotheque";
    const body = [
      "Bonjour!",
      "I am interested in learning French with your institute.",
      "Please send me more information about courses and pricing.",
      "Merci!",
    ].join("\n");

    await transporter.sendMail({
      from: `Interest Link <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject,
      text: body,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("/api/interest error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
