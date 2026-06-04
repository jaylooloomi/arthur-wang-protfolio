import ReactDOM from 'react-dom/client'
import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ScrollControls, useScroll } from '@react-three/drei'
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
  Vignette,
} from '@react-three/postprocessing'
import CurlFlowField from './scenes/CurlFlowField'
import GpgpuParticles from './scenes/GpgpuParticles'
import Jellyfish from './scenes/Jellyfish'
import FluidDye from './scenes/FluidDye'
import SciFiCore from './scenes/SciFiCore'
import './index.css'

/**
 * PRECISION ENGINE — 原創沉浸式捲動敘事（框架 + 動畫劇本控制器）。
 * 五幕：點火 → 散開 → 湧現 → 熔流 → 核心，由捲動進度驅動。
 * 串接既有原創特效，外加 RenderManager 式劇本控制、HUD、FX 合成、點火轉場。
 */
const ACTS = [
  { id: '00', name: 'IGNITION', range: [0, 0.1], camZ: 12, el: <CurlFlowField /> },
  { id: '01', name: 'DISPERSION', range: [0.1, 0.34], camZ: 12, el: <GpgpuParticles size={256} /> },
  { id: '02', name: 'EMERGENCE', range: [0.34, 0.58], camZ: 13, el: <Jellyfish /> },
  { id: '03', name: 'FLUX', range: [0.58, 0.82], camZ: 12, el: <FluidDye size={512} /> },
  { id: '04', name: 'CORE', range: [0.82, 1.01], camZ: 14, el: <SciFiCore position={[0, 0, 0]} /> },
]

const actIndexFor = (o) => {
  for (let i = 0; i < ACTS.length; i++) if (o >= ACTS[i].range[0] && o < ACTS[i].range[1]) return i
  return ACTS.length - 1
}

function Stage({ onAct, barRef }) {
  const scroll = useScroll()
  useFrame((state) => {
    const o = scroll.offset
    onAct(actIndexFor(o))
    if (barRef.current) barRef.current.style.transform = `scaleX(${Math.max(0.001, o)})`
    const z = ACTS[actIndexFor(o)].camZ
    state.camera.position.z += (z - state.camera.position.z) * 0.05
    state.camera.position.x = Math.sin(o * Math.PI * 4) * 0.8
    state.camera.position.y = Math.cos(o * Math.PI * 3) * 0.5
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

function HUD({ act, barRef }) {
  const a = ACTS[act]
  return (
    <div
      className="pointer-events-none fixed inset-0 z-10 select-none"
      style={{ fontFamily: "'JetBrains Mono', monospace", color: '#cfe9e2' }}
    >
      {/* 四角刻度框 */}
      {['tl', 'tr', 'bl', 'br'].map((c) => (
        <span
          key={c}
          style={{
            position: 'absolute',
            width: 22,
            height: 22,
            borderColor: '#36e0c0',
            opacity: 0.5,
            ...(c[0] === 't' ? { top: 22 } : { bottom: 22 }),
            ...(c[1] === 'l'
              ? { left: 22, borderLeft: '1px solid', borderTop: c[0] === 't' ? '1px solid' : '', borderBottom: c[0] === 'b' ? '1px solid' : '' }
              : { right: 22, borderRight: '1px solid', borderTop: c[0] === 't' ? '1px solid' : '', borderBottom: c[0] === 'b' ? '1px solid' : '' }),
          }}
        />
      ))}

      {/* 左上品牌 */}
      <div style={{ position: 'absolute', top: 40, left: 56 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: 2, color: '#eafffb' }}>
          PRECISION&nbsp;ENGINE
        </div>
        <div style={{ fontSize: 10, letterSpacing: 4, opacity: 0.6, marginTop: 4 }}>王鼎傑 · ARTHUR WANG</div>
      </div>

      {/* 右上：火花點 + 狀態 */}
      <div style={{ position: 'absolute', top: 40, right: 56, textAlign: 'right', fontSize: 10, letterSpacing: 3, opacity: 0.7 }}>
        <span style={{ color: '#ff7a3c' }}>●</span>&nbsp; SYSTEM&nbsp;LIVE
      </div>

      {/* 左下：幕 */}
      <div style={{ position: 'absolute', bottom: 44, left: 56 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 28, color: '#eafffb', lineHeight: 1 }}>
          <span style={{ color: '#36e0c0' }}>{a.id}</span>&nbsp;{a.name}
        </div>
        <div style={{ width: 240, height: 2, background: 'rgba(54,224,192,0.15)', marginTop: 14, overflow: 'hidden' }}>
          <div ref={barRef} style={{ height: '100%', background: 'linear-gradient(90deg,#36e0c0,#ff7a3c)', transformOrigin: 'left', transform: 'scaleX(0)' }} />
        </div>
      </div>

      {/* 右下 */}
      <div style={{ position: 'absolute', bottom: 44, right: 56, fontSize: 10, letterSpacing: 3, opacity: 0.55 }}>
        WEBGL · R3F · GLSL
      </div>
    </div>
  )
}

function FadeOnAct({ act }) {
  const [on, setOn] = useState(false)
  useEffect(() => {
    setOn(true)
    const t = setTimeout(() => setOn(false), 420)
    return () => clearTimeout(t)
  }, [act])
  return (
    <div
      className="pointer-events-none fixed inset-0 z-20"
      style={{ background: '#050709', opacity: on ? 1 : 0, transition: 'opacity 420ms ease' }}
    />
  )
}

function Engine() {
  const [act, setAct] = useState(0)
  const barRef = useRef()
  return (
    <div style={{ cursor: 'crosshair' }}>
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
        <color attach="background" args={['#050709']} />
        <Suspense fallback={null}>
          <ScrollControls pages={6} damping={0.28}>
            {ACTS[act].el}
            <Stage onAct={(i) => setAct((a) => (a === i ? a : i))} barRef={barRef} />
          </ScrollControls>
        </Suspense>
        <EffectComposer>
          <Bloom intensity={0.85} luminanceThreshold={0.25} luminanceSmoothing={0.7} mipmapBlur />
          <ChromaticAberration offset={[0.0007, 0.0007]} />
          <Vignette eskil={false} offset={0.28} darkness={0.85} />
          <Noise opacity={0.045} premultiply />
        </EffectComposer>
      </Canvas>

      <HUD act={act} barRef={barRef} />
      <FadeOnAct act={act} />
      <div className="grain" />
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<Engine />)
