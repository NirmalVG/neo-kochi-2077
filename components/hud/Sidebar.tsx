"use client"

import { Cpu, MapPin } from "lucide-react"

export function Sidebar() {
  return (
    <aside className="glass fixed inset-x-3 top-3 z-50 flex flex-col rounded-2xl border border-kasavu-gold/30 p-3 md:inset-x-auto md:bottom-6 md:left-6 md:top-6 md:w-80 md:rounded-none md:border-b-0 md:border-l-2 md:border-r-0 md:border-t-0 md:p-6">
      <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-teal-neon md:text-[10px] md:tracking-[0.2em]">
        <Cpu size={14} className="animate-pulse" />
        <span>Sync Status: Optimal</span>
      </div>

      <h1 className="mt-3 text-xl font-black italic tracking-tight md:mt-4 md:text-3xl md:tracking-tighter">
        NEO-KOCHI{" "}
        <span className="block text-[10px] font-medium not-italic text-slate-400 md:text-xs">
          MARINE DRIVE SECTOR // 2077
        </span>
      </h1>

      <div className="mt-4 grid gap-3 md:mt-8 md:space-y-4">
        <div className="rounded border border-white/5 bg-white/5 p-3">
          <p className="text-[10px] font-bold uppercase text-kasavu-gold">
            Active Protocol
          </p>
          <p className="mt-1 font-mono text-xs text-white md:text-sm">MAAYA_v1.0.7</p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-300 md:text-sm">
          <MapPin size={16} className="shrink-0 text-magenta-neon" />
          <span className="truncate">9.9816Â° N, 76.2999Â° E</span>
        </div>
      </div>

      <div className="mt-4 border-t border-white/10 pt-4 md:mt-auto md:pt-6">
        <div className="mb-2 flex justify-between text-[10px]">
          <span>ATMOSPHERE</span>
          <span className="text-teal-neon">98% HUMIDITY</span>
        </div>
        <div className="h-0.5 w-full bg-white/10">
          <div className="h-full w-[98%] bg-teal-neon shadow-neon" />
        </div>
      </div>
    </aside>
  )
}
