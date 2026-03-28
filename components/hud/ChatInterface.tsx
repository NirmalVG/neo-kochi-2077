"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Bot, Mic, SendHorizontal, Square, Terminal, User, Volume2, Zap } from "lucide-react"
import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { useMaayaStore } from "@/store/useMaayaStore"
import { useMaayaVoice } from "@/store/useMaayaVoice"

function extractSpokenText(parts: Array<{ type: string; text?: string }>) {
  return parts
    .filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join(" ")
    .trim()
}

type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onend: (() => void) | null
  onerror: ((event: { error: string }) => void) | null
  onresult:
    | ((event: {
        results: ArrayLike<ArrayLike<{ transcript: string }>>
      }) => void)
    | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

export function ChatInterface() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const setAnimation = useMaayaStore((state) => state.setAnimation)
  const { isPlaying, speak } = useMaayaVoice()
  const supportsVoiceInput = useSyncExternalStore(
    () => () => undefined,
    () =>
      typeof window !== "undefined" &&
      Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition),
    () => false,
  )

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    onFinish: ({ message }) => {
      const spokenText = extractSpokenText(message.parts)
      if (spokenText) {
        void speak(spokenText)
      }
    },
    onError: (error) => {
      console.error("Neural link failure:", error)
    },
  })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    setAnimation(
      status === "submitted" || status === "streaming" ? "Thinking" : "Idle",
    )
  }, [setAnimation, status])

  useEffect(() => {
    const SpeechRecognitionCtor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition

    if (!SpeechRecognitionCtor) {
      return
    }

    const recognition = new SpeechRecognitionCtor()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-IN"

    recognition.onresult = async (event) => {
      const transcript = Array.from(event.results)
        .flatMap((result) => Array.from(result))
        .map((result) => result.transcript)
        .join(" ")
        .trim()

      if (!transcript) {
        return
      }

      setInput(transcript)
      await sendMessage({ text: transcript })
      setInput("")
    }

    recognition.onerror = (event) => {
      console.error("Voice input error:", event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      recognition.stop()
      recognitionRef.current = null
    }
  }, [sendMessage])

  const isLoading = status === "submitted" || status === "streaming"

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedInput = input.trim()
    if (!trimmedInput || isLoading) {
      return
    }

    setInput("")
    await sendMessage({ text: trimmedInput })
  }

  const handleVoiceToggle = () => {
    if (!recognitionRef.current || isLoading) {
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      return
    }

    setInput("")
    recognitionRef.current.start()
    setIsListening(true)
  }

  return (
    <div className="fixed bottom-3 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 px-3 duration-700 sm:bottom-4 sm:px-4 md:bottom-8 md:px-6">
      <div
        ref={scrollRef}
        className="glass mb-2 max-h-44 space-y-4 overflow-y-auto rounded-t-2xl border-b-2 border-teal-neon/30 p-3 scrollbar-hide sm:max-h-56 md:max-h-80 md:space-y-6 md:p-4"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center space-y-2 py-8 text-teal-neon opacity-30 md:space-y-3 md:py-12">
            <Terminal size={20} className="animate-pulse md:size-6" />
            <div className="font-mono text-[9px] uppercase tracking-[0.24em] md:text-[10px] md:tracking-[0.3em]">
              Uplink Established: Awaiting Input
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-4 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`rounded-lg border p-1.5 transition-all duration-500 md:p-2 ${
                message.role === "user"
                  ? "border-magenta-neon/40 bg-magenta-neon/10 text-magenta-neon shadow-[0_0_10px_rgba(255,0,255,0.2)]"
                  : "border-teal-neon/40 bg-teal-neon/10 text-teal-neon shadow-[0_0_10px_rgba(0,242,255,0.2)]"
              }`}
            >
              {message.role === "user" ? <User size={12} /> : <Bot size={12} />}
            </div>

            <div
              className={`flex max-w-[82%] flex-col md:max-w-[75%] ${message.role === "user" ? "items-end" : "items-start"}`}
            >
              <span className="mb-1 text-[8px] font-mono uppercase tracking-[0.18em] opacity-40 md:text-[9px] md:tracking-widest">
                {message.role === "user" ? "LOCAL_OPERATOR" : "MAAYA_CORE_v4"}
              </span>

              <div
                className={`rounded-xl p-2.5 font-mono text-xs leading-relaxed transition-all md:p-3 md:text-sm ${
                  message.role === "user"
                    ? "border border-magenta-neon/20 bg-magenta-neon/5 text-white shadow-[inset_0_0_20px_rgba(255,0,255,0.05)]"
                    : "border border-teal-neon/20 bg-teal-neon/5 text-teal-50 shadow-[inset_0_0_20px_rgba(0,242,255,0.05)]"
                }`}
              >
                {message.parts.length > 0 ? (
                  message.parts.map((part, index) => {
                    if (part.type === "text") {
                      return <div key={`text-${index}`}>{part.text}</div>
                    }

                    if (part.type === "reasoning") {
                      return (
                        <div
                          key={`reasoning-${index}`}
                          className="my-2 border-l border-white/20 pl-2 text-xs italic opacity-40"
                        >
                          {part.text}
                        </div>
                      )
                    }

                    return null
                  })
                ) : (
                  <div />
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="animate-pulse pl-2 font-mono text-[10px] text-teal-neon/60">
            <div className="flex items-center gap-2">
              <Zap size={10} className="fill-teal-neon" />
              SYNCHRONIZING CONSCIOUSNESS...
            </div>
          </div>
        )}

        {(supportsVoiceInput || isPlaying) && (
          <div className="pl-2 font-mono text-[10px] text-teal-neon/60">
            {isListening ? (
              <div className="flex items-center gap-2 text-magenta-neon">
                <Mic size={10} className="fill-magenta-neon" />
                VOICE CHANNEL OPEN...
              </div>
            ) : isPlaying ? (
              <div className="flex items-center gap-2">
                <Volume2 size={10} className="fill-teal-neon" />
                MAAYA SPEAKING...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Mic size={10} />
                TAP MIC FOR VOICE CHAT
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="group relative">
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-teal-neon/20 to-magenta-neon/20 opacity-0 blur-lg transition duration-1000 group-focus-within:opacity-100" />

        <div className="relative flex items-center overflow-hidden rounded-xl border border-white/10 bg-black/90 shadow-2xl ring-1 ring-white/5 backdrop-blur-3xl">
          <input
            value={input}
            onChange={(event) => setInput(event.currentTarget.value)}
            placeholder="Direct Command to Maaya..."
            className="w-full bg-transparent p-3 pr-12 font-mono text-xs text-teal-50 placeholder:text-white/10 selection:bg-teal-neon/40 focus:outline-none sm:p-4 sm:pr-14 sm:text-sm md:p-5 md:pr-16"
          />
          {supportsVoiceInput && (
            <button
              type="button"
              onClick={handleVoiceToggle}
              disabled={isLoading}
              className={`absolute right-11 rounded-lg p-2 transition-all active:scale-90 disabled:opacity-10 sm:right-14 sm:p-2.5 md:right-16 ${
                isListening
                  ? "bg-magenta-neon/20 text-magenta-neon"
                  : "text-teal-neon hover:bg-teal-neon/20 hover:text-white"
              }`}
            >
              {isListening ? (
                <Square size={16} className="fill-current sm:size-[18px]" />
              ) : (
                <Mic size={16} className="sm:size-[18px]" />
              )}
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 rounded-lg p-2 text-teal-neon transition-all hover:bg-teal-neon/20 hover:text-white active:scale-90 disabled:opacity-10 sm:right-3 sm:p-2.5 md:right-4"
          >
            <SendHorizontal size={18} strokeWidth={1.5} className="sm:size-5 md:size-[22px]" />
          </button>
        </div>
      </form>
    </div>
  )
}
