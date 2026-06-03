import { useRef, useMemo, useLayoutEffect, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js'
import * as THREE from 'three'

/**
 * Phase 5 — 隧道盡頭的 Sci-Fi 核心 + 雙螺旋 DNA 粒子流。
 *  - 核心：ChronographWatch 機芯，持續旋轉
 *  - DNA：參數式雙螺旋 x=cos(t) / z=sin(t) / y=t，兩股相位差 π
 *  - 粒子數 6000 (>5000) → 使用 InstancedMesh
 */
const PER_STRAND = 3000
const TOTAL = PER_STRAND * 2
const HELIX_RADIUS = 2.3
const HELIX_HEIGHT = 16
const TURNS = 5

export default function SciFiCore({ position = [0, 0, -54] }) {
  const { scene } = useGLTF('/models/ChronographWatch.glb')

  // 機芯自動置中 + 縮放
  const core = useMemo(() => {
    const obj = cloneSkeleton(scene)
    const box = new THREE.Box3().setFromObject(obj)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    obj.position.sub(center)
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const s = 4.2 / maxDim
    obj.scale.setScalar(s)
    return obj
  }, [scene])

  const meshRef = useRef()
  const helixRef = useRef()
  const watchRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // 一次性以參數式方程鋪設雙螺旋的 instance 矩陣與顏色
  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const cyan = new THREE.Color().setRGB(1.9, 1.15, 0.3) // HDR 琥珀金
    const violet = new THREE.Color().setRGB(0.15, 1.6, 1.5) // HDR 青

    for (let i = 0; i < TOTAL; i++) {
      const strand = i < PER_STRAND ? 0 : 1
      const k = (i % PER_STRAND) / PER_STRAND
      const t = k * Math.PI * 2 * TURNS
      const phase = strand === 0 ? 0 : Math.PI
      dummy.position.set(
        Math.cos(t + phase) * HELIX_RADIUS,
        (k - 0.5) * HELIX_HEIGHT,
        Math.sin(t + phase) * HELIX_RADIUS,
      )
      dummy.scale.setScalar(0.03 + (i % 9) * 0.004)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      mesh.setColorAt(i, strand === 0 ? cyan : violet)
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [dummy])

  // 記憶體：unmount 時 dispose 核心模型資源
  useEffect(
    () => () => {
      core.traverse((c) => {
        if (c.isMesh) {
          c.geometry?.dispose?.()
          const mats = Array.isArray(c.material) ? c.material : [c.material]
          mats.forEach((m) => m?.dispose?.())
        }
      })
    },
    [core],
  )

  useFrame((_, delta) => {
    if (helixRef.current) helixRef.current.rotation.y += delta * 0.45
    if (watchRef.current) {
      watchRef.current.rotation.y += delta * 0.5
      watchRef.current.rotation.x += delta * 0.12
    }
  })

  return (
    <group position={position}>
      <group ref={watchRef}>
        <primitive object={core} />
      </group>

      <group ref={helixRef}>
        <instancedMesh ref={meshRef} args={[undefined, undefined, TOTAL]} frustumCulled={false}>
          <icosahedronGeometry args={[1, 0]} />
          <meshBasicMaterial toneMapped={false} />
        </instancedMesh>
      </group>

      <pointLight intensity={9} distance={24} color="#ffc15c" />
      <pointLight position={[0, 6, 2]} intensity={4} distance={18} color="#5ff0e6" />
    </group>
  )
}
