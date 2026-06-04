import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { curlFlowVertex, curlFlowFragment } from '../shaders/curlFlow'

/**
 * GPU 粒子流場（綠色能量星雲）：數萬顆粒子由 curl noise 驅動有機流動，
 * 中央加亮核、滑鼠互動排開、HDR 顏色觸發 Bloom。通用創意 WebGL 手法之原創實作。
 */
export default function CurlFlowField({ count = 80000, radius = 6.5 }) {
  const pointsRef = useRef()
  const coreRef = useRef()
  const { pointer } = useThree()
  const mouseTarget = useMemo(() => new THREE.Vector3(), [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 0.9 },
      uMouse: { value: new THREE.Vector3(999, 999, 999) },
      uColorA: { value: new THREE.Color(0.03, 0.9, 0.2) }, // 深綠
      uColorB: { value: new THREE.Color(0.45, 1.6, 0.55) }, // 亮綠
    }),
    [],
  )

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    const dir = new THREE.Vector3()
    for (let i = 0; i < count; i++) {
      dir
        .set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
        .normalize()
      // 半徑偏向中心 → 中央密、外圍稀（星雲感）
      const r = Math.pow(Math.random(), 1.7) * radius
      positions[i * 3] = dir.x * r
      positions[i * 3 + 1] = dir.y * r
      positions[i * 3 + 2] = dir.z * r
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
    mouseTarget.set(pointer.x * radius * 1.3, pointer.y * radius * 1.3, 0)
    uniforms.uMouse.value.lerp(mouseTarget, 0.08)
    if (pointsRef.current) pointsRef.current.rotation.y += delta * 0.04
    if (coreRef.current) {
      const s = 0.85 + Math.sin(uniforms.uTime.value * 1.5) * 0.12
      coreRef.current.scale.setScalar(s)
    }
  })

  return (
    <group>
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

      {/* 中央能量核（靠 Bloom 暈成光球） */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.7, 4]} />
        <meshBasicMaterial color={new THREE.Color(0.4, 2.2, 0.9)} toneMapped={false} transparent opacity={0.9} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  )
}
