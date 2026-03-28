"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { MarineDriveEnvironment } from "./Environment"
import { Rain } from "./Rain"
import { Suspense } from "react"
import { Maaya } from "./Maaya"
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing"
import { Html, OrbitControls, PerspectiveCamera, useProgress } from "@react-three/drei"
import { useMaayaStore } from "@/store/useMaayaStore"
import * as THREE from "three"

// 🎥 THE CAMERA RIG: This component handles the "Follow" logic
function CameraRig() {
  const maayaPos = useMaayaStore((state) => state.maayaPosition)
  const animation = useMaayaStore((state) => state.animation)
  const vec = new THREE.Vector3()

  useFrame((state) => {
    if (!maayaPos) return

    const isMoving = animation === "Walking"
    const isChatting = animation === "Thinking"
    const cameraOffsetY = isMoving ? 3.2 : isChatting ? 2.25 : 2.8
    const cameraOffsetZ = isMoving ? 13.5 : isChatting ? 6.8 : 9.2
    const lookAtY = isMoving ? 0.95 : isChatting ? 1.28 : 0.9
    const easing = isMoving ? 0.045 : isChatting ? 0.085 : 0.07

    // Keep the full model visible at rest, focus tighter during chat,
    // then pull back while she walks.
    state.camera.position.lerp(
      vec.set(maayaPos.x, maayaPos.y + cameraOffsetY, maayaPos.z + cameraOffsetZ),
      easing,
    )

    state.camera.lookAt(maayaPos.x, maayaPos.y + lookAtY, maayaPos.z)
  })

  return null
}

function SceneLoader() {
  const { progress, active } = useProgress()
  const roundedProgress = Math.max(8, Math.round(progress))

  if (!active && roundedProgress >= 100) {
    return null
  }

  return (
    <Html center>
      <div className="pointer-events-none flex min-w-[220px] flex-col items-center rounded-2xl border border-teal-neon/30 bg-black/75 px-5 py-4 text-center shadow-[0_0_40px_rgba(0,242,255,0.14)] backdrop-blur-xl">
        <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-teal-neon/80">
          Booting Maaya
        </div>
        <div className="mt-2 text-xs text-slate-300">
          Syncing neon rain, skyline grids, and avatar shell...
        </div>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-neon via-kasavu-gold to-magenta-neon transition-[width] duration-300"
            style={{ width: `${roundedProgress}%` }}
          />
        </div>
        <div className="mt-3 font-mono text-[11px] text-kasavu-gold">
          {roundedProgress}%
        </div>
      </div>
    </Html>
  )
}

export default function Scene() {
  return (
    <div className="fixed inset-0 z-0 bg-black">
      <Canvas shadows dpr={[1, 2]}>
        {/* Set initial camera position */}
        <PerspectiveCamera makeDefault position={[0, 2.8, 9.2]} fov={42} />

        <color attach="background" args={["#020202"]} />
        <fog attach="fog" args={["#020202", 35, 220]} />

        {/* 💡 LIGHTING: Essential for the 2077 Vibe */}
        <ambientLight intensity={0.45} />
        <hemisphereLight
          args={["#7df9ff", "#061018", 1.1]}
          position={[0, 12, 0]}
        />
        <directionalLight
          position={[-6, 10, 8]}
          intensity={1.6}
          color="#ffffff"
          castShadow
        />
        <pointLight
          position={[0, 3, 5]}
          intensity={16}
          distance={18}
          color="#7df9ff"
        />
        <pointLight
          position={[2, 2, 6]}
          intensity={9}
          distance={14}
          color="#ff4fd8"
        />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={2}
          castShadow
          color="#00f2ff"
        />

        <Suspense fallback={<SceneLoader />}>
          <Maaya />
          <MarineDriveEnvironment />
          <Rain count={1500} />

          {/* Inject the follow-cam logic */}
          <CameraRig />
        </Suspense>

        {/* Cinematic Post-Processing */}
        <EffectComposer enableNormalPass={false}>
          <Bloom
            luminanceThreshold={1}
            mipmapBlur
            intensity={1.5}
            radius={0.4}
          />
          <Vignette darkness={1.2} offset={0.3} />
        </EffectComposer>

        {/* OrbitControls is kept but set to 'makeDefault={false}' 
           so it doesn't fight the CameraRig's auto-follow logic.
        */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={8}
          maxDistance={52}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>
    </div>
  )
}
