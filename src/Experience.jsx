import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Stars, Loader } from '@react-three/drei'
import LogoExplosion from './scenes/LogoExplosion'

/**
 * WebGL 場景根：全螢幕 Canvas + 霓虹 Bloom 後處理。
 * Phase 1（Canvas/Bloom 骨架）+ Phase 2（Logo 粒子爆破）。
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
        camera={{ position: [0, 0, 9], fov: 50 }}
      >
        <color attach="background" args={['#04060a']} />
        <fog attach="fog" args={['#04060a', 10, 32]} />

        <ambientLight intensity={0.35} />
        <pointLight position={[6, 6, 6]} intensity={2.2} color="#00ffcc" />
        <pointLight position={[-6, -3, 4]} intensity={1.2} color="#3366ff" />

        <Suspense fallback={null}>
          <Stars radius={70} depth={45} count={2200} factor={3.2} saturation={0} fade speed={0.4} />
          <LogoExplosion />
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

      {/* glTF 載入進度條 */}
      <Loader />
    </>
  )
}
