"use client"

import { ChatInterface } from "@/components/hud/ChatInterface"
import { Sidebar } from "@/components/hud/Sidebar"
import Scene from "@/components/world/Scene"

export default function Home() {
  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-black">
      <Sidebar />
      <Scene />
      <ChatInterface />

      {/* Overlay for that CRT/Monsoon vibe */}
      <div className="pointer-events-none fixed inset-0 z-40 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%]" />
    </main>
  )
}
