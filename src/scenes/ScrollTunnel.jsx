import { useMemo } from 'react'
import * as THREE from 'three'
import ModelShowcase from '../components/ModelShowcase'
import DistortionCard from '../components/DistortionCard'

/**
 * Phase 3 — 3D 空間隧道：
 *  - 沿 -Z 軸排列的發光圓環（隧道感）
 *  - 3 個機械模型展示物（CarConcept / RobotExpressive / ToyCar）
 *  - 每個模型旁一張液態扭曲資訊卡
 *  - 隧道內點光源，確保 PBR 模型在相機經過時被照亮
 */
const RINGS = 16
const RING_START = 2
const RING_GAP = 3.4

const SHOWCASES = [
  {
    url: '/models/CarConcept.glb',
    z: -10,
    x: -2.6,
    targetSize: 3.4,
    spin: 0.35,
    title: 'AI 落地服務',
    subtitle: 'AI Implementation',
  },
  {
    url: '/models/RobotExpressive.glb',
    z: -22,
    x: 2.6,
    targetSize: 3.2,
    spin: 0.5,
    title: '智慧製造自動化',
    subtitle: 'Smart Manufacturing',
  },
  {
    url: '/models/ToyCar.glb',
    z: -34,
    x: -2.4,
    targetSize: 3.0,
    spin: 0.6,
    title: '網頁特效 · 自動化',
    subtitle: 'WebGL · Automation',
  },
]

export default function ScrollTunnel() {
  const ringData = useMemo(
    () =>
      Array.from({ length: RINGS }, (_, i) => ({
        z: RING_START - i * RING_GAP,
        rot: (i % 2 === 0 ? 1 : -1) * (i * 0.12),
        hue: i / RINGS,
      })),
    [],
  )

  return (
    <group>
      {/* 隧道發光圓環 */}
      {ringData.map((r, i) => (
        <mesh key={i} position={[0, 0, r.z]} rotation={[0, 0, r.rot]}>
          <torusGeometry args={[5.4, 0.03, 8, 64]} />
          <meshBasicMaterial
            color={new THREE.Color().setHSL(0.5 + r.hue * 0.1, 0.9, 0.6)}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* 模型展示 + 液態扭曲資訊卡 + 局部照明 */}
      {SHOWCASES.map((s, i) => (
        <group key={s.url}>
          <ModelShowcase
            url={s.url}
            position={[s.x, 0, s.z]}
            targetSize={s.targetSize}
            spin={s.spin}
          />
          <DistortionCard
            title={s.title}
            subtitle={s.subtitle}
            index={i + 1}
            position={[-s.x * 0.9, 0.2, s.z + 0.5]}
            rotation={[0, s.x > 0 ? 0.35 : -0.35, 0]}
          />
          <pointLight
            position={[s.x, 1.5, s.z + 3]}
            intensity={6}
            distance={14}
            color="#bfefff"
          />
        </group>
      ))}
    </group>
  )
}
