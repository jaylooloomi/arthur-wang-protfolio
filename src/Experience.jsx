import { Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Stars, Loader, ScrollControls, useScroll, Environment } from '@react-three/drei'
import LogoExplosion from './scenes/LogoExplosion'
import ScrollTunnel from './scenes/ScrollTunnel'
import SciFiCore from './scenes/SciFiCore'

// 相機飛行軌道：依滾動進度沿 -Z 穿過隧道，輕微左右擺動增加動感
const CAM_START_Z = 9
const CAM_END_Z = -46

function Rig() {
  const scroll = useScroll()
  useFrame((state) => {
    const o = scroll.offset // 0..1
    const z = THREE.MathUtils.lerp(CAM_START_Z, CAM_END_Z, o)
    state.camera.position.z = z
    state.camera.position.x = Math.sin(o * Math.PI * 3) * 1.6
    state.camera.position.y = Math.cos(o * Math.PI * 2) * 0.8
    state.camera.lookAt(0, 0, z - 8)
  })
  return null
}

/**
 * WebGL 場景根：全螢幕 Canvas + 滾動隧道 + 霓虹 Bloom。
 * Phase 1（Canvas/Bloom）+ Phase 2（粒子爆破）+ Phase 3（滾動隧道）。
 */
export default function Experience() {
  return (
    <>
      <Canvas
        className="!fixed inset-0"
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: true,
        }}
        camera={{ position: [0, 0, CAM_START_Z], fov: 55 }}
      >
        <color attach="background" args={['#04060a']} />
        <fog attach="fog" args={['#04060a', 18, 60]} />

        <ambientLight intensity={0.4} />
        <pointLight position={[6, 6, 8]} intensity={2.2} color="#00ffcc" />
        <pointLight position={[-6, -3, 4]} intensity={1.2} color="#3366ff" />

        <Suspense fallback={null}>
          <Environment preset="night" />
          <Stars radius={80} depth={50} count={2600} factor={3.4} saturation={0} fade speed={0.4} />

          <ScrollControls pages={5} damping={0.25}>
            <Rig />
            <LogoExplosion />
            <ScrollTunnel />
            <SciFiCore position={[0, 0, -54]} />
          </ScrollControls>
        </Suspense>

        <EffectComposer>
          <Bloom
            intensity={0.85}
            luminanceThreshold={0.45}
            luminanceSmoothing={0.7}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>

      <Loader />
    </>
  )
}
