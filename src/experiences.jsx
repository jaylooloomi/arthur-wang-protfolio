import ReactDOM from 'react-dom/client'
import { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import CurlFlowField from './scenes/CurlFlowField'
import GpgpuParticles from './scenes/GpgpuParticles'
import Jellyfish from './scenes/Jellyfish'
import FluidDye from './scenes/FluidDye'
import './index.css'

/**
 * Creative Experiences — WebGL 特效 montage 輪播。
 * 自動每 6.5 秒切換一個原創特效場景，黑幕淡入淡出銜接，頂部顯示場景名。
 * 入口頁 /experiences.html，獨立於主站。
 */
const SCENES = [
  { name: 'PARTICLE NEBULA', el: <CurlFlowField /> },
  { name: 'GPGPU FLOW', el: <GpgpuParticles size={256} /> },
  { name: 'BIOLUMINESCENCE', el: <Jellyfish /> },
  { name: 'FLUID DYE', el: <FluidDye size={512} /> },
]
const DURATION = 6500

function Experiences() {
  const [idx, setIdx] = useState(0)
  const [fade, setFade] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      setFade(true)
      setTimeout(() => {
        setIdx((i) => (i + 1) % SCENES.length)
        setTimeout(() => setFade(false), 120)
      }, 550)
    }, DURATION)
    return () => clearInterval(id)
  }, [])

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
        camera={{ position: [0, 0, 12], fov: 55 }}
      >
        <color attach="background" args={['#02040a']} />
        <Suspense fallback={null}>{SCENES[idx].el}</Suspense>
        <EffectComposer>
          <Bloom intensity={0.7} luminanceThreshold={0.4} luminanceSmoothing={0.8} mipmapBlur />
        </EffectComposer>
      </Canvas>

      {/* 標題覆層 */}
      <div className="pointer-events-none fixed inset-0 z-10 flex select-none flex-col justify-between p-6 md:p-10">
        <div className="font-display text-xs tracking-[0.4em] text-white/75 md:text-sm">
          CREATIVE DIGITAL EXPERIENCES
        </div>
        <div className="flex items-end justify-between text-[10px] tracking-[0.3em] text-cyan-200/65 md:text-xs">
          <span>
            {String(idx + 1).padStart(2, '0')} / {String(SCENES.length).padStart(2, '0')} ·{' '}
            {SCENES[idx].name}
          </span>
          <span>WEBGL · R3F · GLSL</span>
        </div>
      </div>

      {/* 切換黑幕淡入淡出 */}
      <div
        className="pointer-events-none fixed inset-0 z-20 bg-black transition-opacity duration-500"
        style={{ opacity: fade ? 1 : 0 }}
      />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<Experiences />)
