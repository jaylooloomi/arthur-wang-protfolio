import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { curlFlowVertex, curlFlowFragment } from '../shaders/curlFlow'

/**
 * GPU 粒子流場：數十萬顆粒子由 curl noise 驅動做有機流動，
 * 滑鼠互動排開、HDR 顏色觸發 Bloom。為通用創意 WebGL 手法之原創實作。
 */
export default function CurlFlowField({ count = 70000, radius = 6.5 }) {
  const pointsRef = useRef()
  const { pointer } = useThree()
  const mouseTarget = useMemo(() => new THREE.Vector3(), [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 0.85 },
      uMouse: { value: new THREE.Vector3(999, 999, 999) },
      uColorA: { value: new THREE.Color(0.04, 0.75, 0.32) }, // 綠
      uColorB: { value: new THREE.Color(0.35, 1.25, 1.15) }, // 青白
    }),
    [],
  )

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    const v = new THREE.Vector3()
    for (let i = 0; i < count; i++) {
      // 在球體內均勻撒點
      v.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
      if (v.lengthSq() > 1) v.normalize().multiplyScalar(Math.random())
      v.multiplyScalar(radius)
      positions[i * 3] = v.x
      positions[i * 3 + 1] = v.y
      positions[i * 3 + 2] = v.z
      seeds[i] = Math.random()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    return g
  }, [count, radius])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((state, delta) => {
    uniforms.uTime.value += delta
    // 滑鼠投影到 z=0 平面，平滑跟隨
    mouseTarget.set(pointer.x * radius * 1.3, pointer.y * radius * 1.3, 0)
    uniforms.uMouse.value.lerp(mouseTarget, 0.08)
    if (pointsRef.current) pointsRef.current.rotation.y += delta * 0.04
  })

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        vertexShader={curlFlowVertex}
        fragmentShader={curlFlowFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
