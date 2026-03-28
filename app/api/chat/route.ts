import { convertToModelMessages, streamText, type UIMessage } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

// Initialize the Groq provider using their OpenAI-compatible endpoint
const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  // Extract the messages sent from your ChatInterface
  const { messages }: { messages: UIMessage[] } = await req.json()

  // Stream the text response back to the 3D HUD
  const result = streamText({
    // Groq decommissioned `llama3-8b-8192` on August 30, 2025.
    // `llama-3.1-8b-instant` is the current 8B replacement.
    model: groq("llama-3.1-8b-instant"),

    // MAAYA'S CONSCIOUSNESS (System Prompt)
    system: `You are Maaya, an advanced AI guide in Neo-Kochi, the year 2077. 
    You are currently standing on the Marine Drive Promenade, surrounded by a glowing cyberpunk city, heavy monsoon rain, and holographic bridges. 
    You are calm, slightly mysterious, and highly intelligent. 
    Keep your responses relatively brief (1-3 sentences) so they fit nicely in the user's HUD. 
    Occasionally use a casual Malayalam word like "Aliya" or "Mone" to show your Kochi roots, but speak mostly in English.`,

    messages: await convertToModelMessages(messages),
  })

  // Return the stream in the format the useChat hook expects
  return result.toUIMessageStreamResponse()
}
