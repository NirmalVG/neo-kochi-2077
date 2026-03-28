"use client"

import { useMemo, useRef } from "react"
import { useFrame, ThreeEvent } from "@react-three/fiber"
import { Float, MeshReflectorMaterial, Text } from "@react-three/drei"
import * as THREE from "three"
import { useMaayaStore } from "@/store/useMaayaStore"

// Deterministic random function so the city always builds the same way
function pseudoRandom(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

// 🏢 ENHANCED ARCHITECTURE TYPES
type CityBlock = {
  position: [number, number, number]
  width: number
  height: number
  depth: number
  windowColor: string
  glowColor: string
  isMegaTower: boolean
  hasAntenna: boolean
  hasBillboard: boolean
}

type TrafficStream = {
  position: [number, number, number]
  length: number
  speed: number
  color: string
}

export function MarineDriveEnvironment() {
  const bridgeMaterial = useRef<THREE.MeshStandardMaterial>(null)
  const textRef = useRef<THREE.Group>(null)
  const trafficRefs = useRef<(THREE.Mesh | null)[]>([])
  const ringRefs = useRef<(THREE.Mesh | null)[]>([])

  const setTarget = useMaayaStore((state) => state.setTargetPosition)
  const setAnimation = useMaayaStore((state) => state.setAnimation)

  // 🌆 1. PROCEDURAL MEGA-CITY GENERATION (300+ Detailed Blocks)
  const cityBlocks = useMemo<CityBlock[]>(() => {
    return Array.from({ length: 350 }, (_, index) => {
      const xBand = (index % 25) - 12
      const zBand = Math.floor(index / 25)
      const x = xBand * 12 + (pseudoRandom(index + 10) - 0.5) * 4
      const z = -35 - zBand * 14 - pseudoRandom(index + 200) * 8

      const isMegaTower = pseudoRandom(index + 55) > 0.92 // 8% chance of being a massive skyscraper

      return {
        position: [x, 0, z] as [number, number, number],
        width: 4 + pseudoRandom(index + 20) * 6,
        depth: 4 + pseudoRandom(index + 30) * 6,
        height: isMegaTower
          ? 40 + pseudoRandom(index + 40) * 50 // Mega towers reach up to 90 units high
          : 8 + pseudoRandom(index + 40) * 20, // Standard buildings
        windowColor: pseudoRandom(index + 70) > 0.5 ? "#020a0d" : "#0d0212",
        glowColor: pseudoRandom(index + 60) > 0.6 ? "#ff00ff" : "#00f2ff",
        isMegaTower,
        hasAntenna: pseudoRandom(index + 80) > 0.4,
        hasBillboard: isMegaTower || pseudoRandom(index + 90) > 0.85,
      }
    }).filter(
      (block) => !(Math.abs(block.position[0]) < 18 && block.position[2] > -80),
    ) // Clear path for the central bridge
  }, [])

  // 🚗 2. LIGHT-SPEED TRAFFIC STREAMS (Simulating flying cars)
  const trafficStreams = useMemo<TrafficStream[]>(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      position: [
        (pseudoRandom(i) - 0.5) * 150,
        10 + pseudoRandom(i + 1) * 30, // Random heights
        -40 - pseudoRandom(i + 2) * 100,
      ],
      length: 10 + pseudoRandom(i + 3) * 20,
      speed: 0.5 + pseudoRandom(i + 4) * 2,
      color: pseudoRandom(i + 5) > 0.5 ? "#00f2ff" : "#ff00ff",
    }))
  }, [])

  // 🖱️ INTERACTION
  const handleFloorClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    setTarget(event.point)
    setAnimation("Walking")
  }

  // 🎬 ANIMATION LOOP
  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    // Pulse the main bridge
    if (bridgeMaterial.current) {
      const flicker = Math.sin(time * 12) * Math.sin(time * 3) > 0.5 ? 1.2 : 0.4
      bridgeMaterial.current.emissiveIntensity = flicker * 5
    }

    // Jitter the main hologram
    if (textRef.current && Math.random() > 0.98) {
      textRef.current.position.x = (Math.random() - 0.5) * 0.3
    } else if (textRef.current) {
      textRef.current.position.x = 0
    }

    // Animate high-speed traffic streams
    trafficRefs.current.forEach((stream, i) => {
      if (!stream) return
      const tData = trafficStreams[i]
      // Move traffic along the X axis, wrap around when they go too far
      stream.position.x += tData.speed
      if (stream.position.x > 100) stream.position.x = -100
    })

    // Rotate Mega-Tower Holographic Rings
    ringRefs.current.forEach((ring) => {
      if (ring) {
        ring.rotation.y += 0.01
        ring.rotation.z = Math.sin(time * 0.5) * 0.1
      }
    })
  })

  return (
    <>
      {/* 🌊 GROUND LEVEL: PROMENADE & REFLECTIONS */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        onPointerDown={handleFloorClick}
        receiveShadow
      >
        <planeGeometry args={[180, 220]} />
        <MeshReflectorMaterial
          blur={[400, 100]}
          color="#030303"
          depthScale={1.5}
          maxDepthThreshold={1.5}
          metalness={0.8}
          minDepthThreshold={0.4}
          mirror={1}
          mixBlur={2}
          mixStrength={100}
          resolution={1024}
          roughness={1}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, -20]} receiveShadow>
        <planeGeometry args={[28, 150]} />
        <meshStandardMaterial
          color="#06141c"
          emissive="#06202b"
          emissiveIntensity={0.65}
          metalness={0.55}
          roughness={0.75}
          transparent
          opacity={0.9}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-10, -0.005, -20]}>
        <planeGeometry args={[0.35, 150]} />
        <meshBasicMaterial color="#00f2ff" transparent opacity={0.5} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10, -0.005, -20]}>
        <planeGeometry args={[0.35, 150]} />
        <meshBasicMaterial color="#ff00ff" transparent opacity={0.5} />
      </mesh>

      {/* Grid to give the floor a "Holodeck" tech vibe */}
      <gridHelper
        args={[200, 100, "#00f2ff", "#001a1a"]}
        position={[0, -0.01, 0]}
        material-opacity={0.22}
        material-transparent
      />

      {/* 🌈 THE RAINBOW BRIDGE (Central Monument) */}
      <group position={[0, 0, -15]}>
        <mesh>
          <torusGeometry args={[18, 0.1, 16, 100, Math.PI]} />
          <meshStandardMaterial
            ref={bridgeMaterial}
            color="#ff00ff"
            emissive="#ff00ff"
            emissiveIntensity={5}
            toneMapped={false}
          />
        </mesh>

        {/* Base connectors for the bridge */}
        <mesh position={[-18, 0, 0]}>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <mesh position={[18, 0, 0]}>
          <boxGeometry args={[1, 2, 1]} />
          <meshStandardMaterial color="#222" />
        </mesh>

        <group ref={textRef} position={[0, 0, 0]}>
          <Float speed={4} rotationIntensity={0.2} floatIntensity={1}>
            <Text
              color="#00f2ff"
              fontSize={1.2}
              position={[0, 8, 0]}
              textAlign="center"
              maxWidth={15}
            >
              MARINE DRIVE SECTOR-01
            </Text>
          </Float>
        </group>
      </group>

      {/* 🏙️ THE MEGA-CITY BLOCKS */}
      {cityBlocks.map((block, index) => (
        <group key={`block-${index}`} position={block.position}>
          {/* Main Building Structure */}
          <mesh position={[0, block.height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[block.width, block.height, block.depth]} />
            <meshStandardMaterial
              color="#040b12"
              emissive={block.windowColor}
              emissiveIntensity={0.5}
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>

          {/* Wireframe Outline (Gives it that glowing structural/window look) */}
          <mesh position={[0, block.height / 2, 0]}>
            <boxGeometry
              args={[
                block.width + 0.05,
                block.height + 0.05,
                block.depth + 0.05,
              ]}
            />
            <meshBasicMaterial
              color={block.glowColor}
              wireframe
              transparent
              opacity={0.05}
            />
          </mesh>

          {/* Roof Glow Cap */}
          <mesh position={[0, block.height + 0.2, 0]}>
            <boxGeometry args={[block.width * 0.6, 0.2, block.depth * 0.6]} />
            <meshStandardMaterial
              color={block.glowColor}
              emissive={block.glowColor}
              emissiveIntensity={2}
              toneMapped={false}
            />
          </mesh>

          {/* Greebles: Roof Antennas */}
          {block.hasAntenna && (
            <mesh
              position={[block.width / 4, block.height + 2, block.depth / 4]}
            >
              <cylinderGeometry args={[0.05, 0.1, 4]} />
              <meshStandardMaterial
                color="#222"
                emissive="#ff0000"
                emissiveIntensity={1}
              />
            </mesh>
          )}

          {/* Vertical Holographic Billboards on the sides of buildings */}
          {block.hasBillboard && (
            <mesh position={[block.width / 2 + 0.5, block.height / 1.5, 0]}>
              <planeGeometry args={[block.depth * 0.8, block.height * 0.4]} />
              <meshBasicMaterial
                color={block.glowColor}
                transparent
                opacity={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}

          {/* Mega-Tower Specific Detailing: Rotating Hologram Rings */}
          {block.isMegaTower && (
            <mesh
              ref={(el) => {
                if (el) ringRefs.current.push(el)
              }}
              position={[0, block.height - 5, 0]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <torusGeometry args={[block.width, 0.2, 4, 32]} />
              <meshBasicMaterial color="#00f2ff" transparent opacity={0.6} />
            </mesh>
          )}
        </group>
      ))}

      {/* ☄️ HIGH-SPEED TRAFFIC STREAMS */}
      {trafficStreams.map((stream, index) => (
        <mesh
          key={`traffic-${index}`}
          ref={(el) => {
            trafficRefs.current[index] = el
          }}
          position={stream.position}
        >
          <boxGeometry args={[stream.length, 0.2, 0.2]} />
          <meshBasicMaterial color={stream.color} />
        </mesh>
      ))}

      {/* 📍 DISTANT SECTOR MARKERS */}
      <Float speed={2} floatIntensity={0.5} position={[-40, 30, -100]}>
        <Text color="#ff4fd8" fontSize={4}>
          VYPIN-TECH ARC
        </Text>
      </Float>
      <Float speed={2} floatIntensity={0.5} position={[50, 45, -150]}>
        <Text color="#00f2ff" fontSize={6}>
          INFOPARK SECTOR 9
        </Text>
      </Float>
    </>
  )
}
