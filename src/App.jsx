import { useState, useEffect } from 'react'
import Experience from './Experience'
import Fallback from './components/Fallback'
import Overlay from './components/Overlay'

function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    )
  } catch {
    return false
  }
}

export default function App() {
  // 預設 true，掛載後實測；避免 SSR/首屏閃爍（此專案為純 CSR）
  const [webglOk, setWebglOk] = useState(true)

  useEffect(() => {
    setWebglOk(isWebGLAvailable())
  }, [])

  if (!webglOk) return <Fallback />

  return (
    <>
      <Experience />
      <Overlay />
    </>
  )
}
