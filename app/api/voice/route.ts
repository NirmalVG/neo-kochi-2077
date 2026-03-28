import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { text } = await req.json()
  const voiceId = process.env.ELEVENLABS_VOICE_ID
  const apiKey = process.env.ELEVENLABS_API_KEY

  if (!text || typeof text !== "string") {
    return NextResponse.json(
      { error: "Text is required for voice synthesis." },
      { status: 400 },
    )
  }

  if (!voiceId || !apiKey) {
    return NextResponse.json(
      {
        error:
          "ElevenLabs is not configured. Add ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID to continue.",
      },
      { status: 503 },
    )
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    },
  )

  if (!response.ok) {
    const errorText = await response.text()
    return NextResponse.json(
      {
        error: errorText || "Voice provider request failed.",
      },
      { status: response.status },
    )
  }

  const audioBuffer = await response.arrayBuffer()
  return new NextResponse(audioBuffer, {
    headers: { "Content-Type": "audio/mpeg" },
  })
}
