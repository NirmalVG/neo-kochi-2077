"use client"
import { useState } from "react"

export function useMaayaVoice() {
  const [isPlaying, setIsPlaying] = useState(false)

  const speak = async (text: string) => {
    if (!text.trim()) {
      return
    }

    setIsPlaying(true)
    try {
      const response = await fetch("/api/voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || "Voice synthesis failed")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)

      audio.onended = () => {
        URL.revokeObjectURL(url)
        setIsPlaying(false)
      }
      audio.onerror = () => {
        URL.revokeObjectURL(url)
        setIsPlaying(false)
      }
      await audio.play()
    } catch (error) {
      console.error("Voice Sync Error:", error)
      setIsPlaying(false)
    }
  }

  return { speak, isPlaying }
}
