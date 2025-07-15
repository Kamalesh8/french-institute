import { NextRequest, NextResponse } from "next/server";

// This API route fetches high-quality French TTS audio from VoiceRSS (https://www.voicerss.org/)
// You must add VOICERSS_KEY=<your_api_key> to .env.local (keys are free for limited usage).
// If the key is missing the route returns 400.

const VOICERSS_ENDPOINT = "https://api.voicerss.org/";

export const runtime = "edge"; // fast edge-runtime

export async function GET(req: NextRequest) {
  const apiKey = process.env.VOICERSS_KEY;
  if (!apiKey) {
    return new NextResponse("VoiceRSS key missing", { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const text = searchParams.get("text")?.trim();

  if (!text) {
    return new NextResponse("Missing text param", { status: 400 });
  }

  const url = `${VOICERSS_ENDPOINT}?key=${apiKey}&hl=fr-fr&src=${encodeURIComponent(
    text
  )}&c=MP3&f=16khz_16bit_stereo`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      return new NextResponse("TTS provider error", { status: 502 });
    }
    const arrayBuffer = await resp.arrayBuffer();
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable", // cache audio
      },
    });
  } catch (e) {
    return new NextResponse("Failed to fetch TTS", { status: 502 });
  }
}
