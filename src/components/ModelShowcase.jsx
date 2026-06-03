import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Float } from '@react-three/drei'
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js'
import * as THREE from 'three'

/**
 * 沿隧道擺放的 3D 模型展示物：自動置中 + 等比縮放到 targetSize，
 * 持續旋轉並用 <Float> 做漂浮。支援帶骨架的模型（SkeletonUtils.clone）。
 */
export default function ModelShowcase({
  url,
  position = [0, 0, 0],
  targetSize = 3,
  spin = 0.3,
}) {
  const { scene } = useGLTF(url)

  const { obj, fit } = useMemo(() => {
    const obj = cloneSkeleton(scene)
    const box = new THREE.Box3().setFromObject(obj)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    obj.position.sub(center) // 置中
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    return { obj, fit: targetSize / maxDim }
  }, [scene, targetSize])

  const ref = useRef()
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * spin
  })

  return (
    <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.7}>
      <group ref={ref} position={position} scale={fit}>
        <primitive object={obj} />
      </group>
    </Float>
  )
}
