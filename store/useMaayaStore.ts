import { create } from "zustand"
import * as THREE from "three"

type AnimationState = "Idle" | "Walking" | "Thinking"

interface MaayaStore {
  animation: AnimationState
  targetPosition: THREE.Vector3 | null
  setAnimation: (animation: AnimationState) => void
  setTargetPosition: (pos: THREE.Vector3 | null) => void
  maayaPosition: THREE.Vector3
  signalStrength: number // 0 to 100
  setMaayaPosition: (pos: THREE.Vector3) => void
}

export const useMaayaStore = create<MaayaStore>((set) => ({
  animation: "Idle",
  targetPosition: null,
  setAnimation: (animation) => set({ animation }),
  setTargetPosition: (pos) => set({ targetPosition: pos }),
  maayaPosition: new THREE.Vector3(0, 0, 0),
  signalStrength: 100,
  setMaayaPosition: (pos) =>
    set(() => {
      const nextPosition = pos.clone()
      // Calculate distance from center (0,0,0)
      // Distance formula: d = sqrt(x^2 + z^2)
      const distance = Math.sqrt(nextPosition.x ** 2 + nextPosition.z ** 2)
      const strength = Math.max(0, 100 - distance * 4) // Signal drops as she walks away
      return { maayaPosition: nextPosition, signalStrength: strength }
    }),
}))
