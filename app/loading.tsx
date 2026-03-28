export default function Loading() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-black px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,242,255,0.14),_transparent_38%),radial-gradient(circle_at_bottom,_rgba(255,0,255,0.12),_transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.08)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%]" />

      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-teal-neon/25 bg-black/70 p-6 text-center shadow-[0_0_60px_rgba(0,242,255,0.12)] backdrop-blur-xl">
        <div className="font-mono text-[10px] uppercase tracking-[0.38em] text-teal-neon/80">
          Neo Kochi 2077
        </div>
        <h1 className="mt-3 text-2xl font-black italic tracking-tight text-white">
          Initializing Maaya
        </h1>
        <p className="mt-3 text-sm text-slate-300">
          Preparing the Marine Drive simulation, loading city layers, and bringing the voice channel online.
        </p>

        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-teal-neon" />
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-kasavu-gold [animation-delay:180ms]" />
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-magenta-neon [animation-delay:360ms]" />
        </div>

        <div className="mt-5 font-mono text-[10px] uppercase tracking-[0.28em] text-slate-400">
          Kochi monsoon sync in progress
        </div>
      </div>
    </main>
  )
}
