import ReactDOM from 'react-dom/client'
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import CurlFlowField from './scenes/CurlFlowField'
import GpgpuParticles from './scenes/GpgpuParticles'
import './index.css'

/**
 * 獨立 demo：curl-noise 粒子流場（重現創意 WebGL 招牌手法）。
 * 入口頁 /experiences.html，與主站互不干擾。
 */
function Demo() {
  return (
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
      <color attach="background" args={['#02060a']} />
      <Suspense fallback={null}>
        <GpgpuParticles size={256} />
      </Suspense>
      <EffectComposer>
        <Bloom intensity={0.7} luminanceThreshold={0.4} luminanceSmoothing={0.8} mipmapBlur />
      </EffectComposer>
    </Canvas>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<Demo />)
