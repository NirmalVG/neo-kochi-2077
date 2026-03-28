"use client"
import { useGLTF, useAnimations } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useEffect, useLayoutEffect, useMemo, useRef } from "react"
import { useMaayaStore } from "@/store/useMaayaStore"
import * as THREE from "three"
import { clone } from "three/addons/utils/SkeletonUtils.js"

const BASE_Y = 0.12

export function Maaya() {
  const group = useRef<THREE.Group>(null)
  const visualRef = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF("/models/maaya.glb")
  const model = useMemo(() => clone(scene), [scene])
  const { actions } = useAnimations(animations, group)
  const moveTarget = useMemo(() => new THREE.Vector3(), [])

  const {
    animation,
    targetPosition,
    setAnimation,
    setTargetPosition,
    setMaayaPosition,
  } = useMaayaStore()

  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const targetHeight = 2
    const scale = size.y > 0 ? targetHeight / size.y : 1

    model.scale.setScalar(scale)
    model.position.set(
      -center.x * scale,
      -box.min.y * scale + 0.22,
      -center.z * scale,
    )

    model.traverse((object: THREE.Object3D) => {
      if (!(object instanceof THREE.Mesh)) return

      object.frustumCulled = false
      object.castShadow = true
      object.receiveShadow = true

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material]

      materials.forEach((material) => {
        if (material instanceof THREE.MeshStandardMaterial) {
          material.color = material.color.clone().multiplyScalar(1.3)
          material.emissive = material.emissive.clone().lerp(new THREE.Color("#7df9ff"), 0.12)
          material.emissiveIntensity = 0.45
          material.envMapIntensity = 1.6
          material.roughness = Math.min(material.roughness, 0.75)
          material.side = THREE.DoubleSide
          material.needsUpdate = true
        } else if (material instanceof THREE.MeshBasicMaterial) {
          material.color = material.color.clone().multiplyScalar(1.4)
          material.side = THREE.DoubleSide
          material.needsUpdate = true
        }
      })
    })
  }, [model])

  // Animation switching logic
  useEffect(() => {
    const action = actions[animation]
    if (action) {
      action.reset().fadeIn(0.3).play()
      return () => {
        action.fadeOut(0.3)
      }
    }
  }, [animation, actions])

  // Movement Logic Loop
  useFrame((state, delta) => {
    if (!group.current) return

    setMaayaPosition(group.current.position)

    if ((animation === "Idle" || animation === "Thinking") && visualRef.current) {
      const time = state.clock.getElapsedTime()
      visualRef.current.position.y = Math.sin(time * 1.8) * 0.025
      visualRef.current.rotation.z = Math.sin(time * 1.2) * 0.016
      visualRef.current.rotation.x = Math.sin(time * 0.9) * 0.01
    } else if (visualRef.current) {
      visualRef.current.position.y = 0
      visualRef.current.rotation.z = 0
      visualRef.current.rotation.x = 0
    }

    if (!targetPosition) return

    moveTarget.set(targetPosition.x, BASE_Y, targetPosition.z)

    // 1. Calculate distance to target
    const distance = group.current.position.distanceTo(moveTarget)

    if (distance > 0.1) {
      // 2. Rotate to face the target on the ground plane
      group.current.lookAt(moveTarget.x, group.current.position.y, moveTarget.z)

      // 3. Move forward
      group.current.position.lerp(moveTarget, delta * 1.5)
    } else {
      // 4. Arrived at destination
      setAnimation("Idle")
      setTargetPosition(null)
    }
  })

  return (
    <group
      ref={group}
      position={[0, BASE_Y, 0]}
      dispose={null}
    >
      <group ref={visualRef}>
        <primitive object={model} />
      </group>
    </group>
  )
}
