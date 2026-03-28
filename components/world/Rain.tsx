// components/world/Rain.tsx
"use client"
import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export function Rain({ count = 1500 }) {
  const points = useRef<THREE.Points>(null)

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40 // X
      positions[i * 3 + 1] = Math.random() * 20 // Y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40 // Z
    }
    return positions
  }, [count])

  useFrame((_, delta) => {
    if (points.current) {
      const positionAttribute = points.current.geometry.getAttribute("position")
      for (let i = 0; i < count; i++) {
        let y = positionAttribute.getY(i)
        y -= delta * 20 // Falling speed
        if (y < 0) y = 20
        positionAttribute.setY(i, y)
      }
      positionAttribute.needsUpdate = true
    }
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        {/* THE FIX: Use 'args' for constructor arguments [array, itemSize] */}
        <bufferAttribute attach="attributes-position" args={[particles, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#00f2ff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}
