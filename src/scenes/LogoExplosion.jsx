import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { useModelPoints } from '../hooks/useModelPoints'
import { particleVertex, particleFragment } from '../shaders/particles'

/**
 * Phase 2 — 將 3D 模型載入並渲染成數千顆互動粒子。
 * 進場時播放「組裝 → 爆破 → 沉降漂浮」的時間軸動畫（gsap 控制 uProgress）。
 */
export default function LogoExplosion({ url = '/models/DamagedHelmet.glb' }) {
  const { positions, randoms, dirs, count } = useModelPoints(url, {
    targetSize: 4.5,
    maxPoints: 18000,
  })

  const pointsRef = useRef()

  // 在 useFrame 外預先建立 uniforms，避免每幀 new 物件
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uSize: { value: 1.3 },
      uColor: { value: new THREE.Color(0xffb24d) },
    }),
    [],
  )

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))
    g.setAttribute('aDir', new THREE.BufferAttribute(dirs, 3))
    return g
  }, [positions, randoms, dirs])

  // 進場時間軸：組裝(0) → 爆破(1) → 沉降成輕微漂浮(0.35)
  useEffect(() => {
    uniforms.uProgress.value = 0
    const tl = gsap.timeline()
    tl.to(uniforms.uProgress, {
      value: 1,
      duration: 3.0,
      ease: 'power2.inOut',
      delay: 0.6,
    }).to(uniforms.uProgress, {
      value: 0.35,
      duration: 2.6,
      ease: 'power2.out',
    })
    return () => tl.kill()
  }, [uniforms])

  // 記憶體：unmount 時 dispose geometry
  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((_, delta) => {
    uniforms.uTime.value += delta
    if (pointsRef.current) pointsRef.current.rotation.y += delta * 0.08
  })

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        vertexShader={particleVertex}
        fragmentShader={particleFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
