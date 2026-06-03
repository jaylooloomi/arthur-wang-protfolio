import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { distortionVertex, distortionFragment } from '../shaders/distortion'

/** 用 canvas 畫出卡片貼圖（深色面板 + 青色邊框 + 標題/副標）。 */
function makeLabelTexture(title, subtitle, index) {
  const w = 1024
  const h = 640
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')

  // 背景：深色半透明面板
  ctx.fillStyle = 'rgba(4, 14, 18, 0.92)'
  ctx.fillRect(0, 0, w, h)

  // 內側青色邊框
  ctx.strokeStyle = 'rgba(0, 255, 220, 0.9)'
  ctx.lineWidth = 6
  ctx.strokeRect(28, 28, w - 56, h - 56)

  // 角標數字
  ctx.fillStyle = 'rgba(0, 255, 220, 0.85)'
  ctx.font = 'bold 64px Inter, sans-serif'
  ctx.fillText(String(index).padStart(2, '0'), 60, 120)

  // 標題
  ctx.fillStyle = '#eafffb'
  ctx.font = 'bold 96px Inter, sans-serif'
  ctx.fillText(title, 60, h / 2 + 20)

  // 副標
  ctx.fillStyle = 'rgba(150, 240, 230, 0.75)'
  ctx.font = '40px Inter, sans-serif'
  ctx.fillText(subtitle, 60, h / 2 + 90)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

/**
 * Phase 3 — 漂浮作品資訊卡：平面套液態扭曲 shader，
 * UV 隨時間 + 滑鼠流動，邊緣青色發光。
 */
export default function DistortionCard({
  title,
  subtitle,
  index = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  size = [4.2, 2.6],
}) {
  const matRef = useRef()

  const texture = useMemo(
    () => makeLabelTexture(title, subtitle, index),
    [title, subtitle, index],
  )

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uTex: { value: texture },
    }),
    [texture],
  )

  useEffect(() => () => texture.dispose(), [texture])

  useFrame((state, delta) => {
    uniforms.uTime.value += delta
    // 平滑跟隨滑鼠（state.pointer 範圍 -1..1）
    uniforms.uMouse.value.lerp(state.pointer, 0.06)
  })

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[size[0], size[1], 48, 32]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={distortionVertex}
        fragmentShader={distortionFragment}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
