import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

/**
 * 從一個 glTF 模型抽取所有 mesh 的頂點，轉成置中、縮放後的點雲資料，
 * 並產生每顆粒子的隨機值 (aRandom) 與隨機爆破方向 (aDir)。
 *
 * @returns {{ positions: Float32Array, randoms: Float32Array, dirs: Float32Array, count: number }}
 */
export function useModelPoints(url, { targetSize = 4.5, maxPoints = 18000 } = {}) {
  const { scene } = useGLTF(url)

  return useMemo(() => {
    const raw = []
    scene.updateWorldMatrix(true, true)

    const tmp = new THREE.Vector3()
    scene.traverse((child) => {
      if (child.isMesh && child.geometry?.attributes?.position) {
        const posAttr = child.geometry.attributes.position
        for (let i = 0; i < posAttr.count; i++) {
          tmp.fromBufferAttribute(posAttr, i)
          child.localToWorld(tmp)
          raw.push(tmp.x, tmp.y, tmp.z)
        }
      }
    })

    let arr = new Float32Array(raw)

    // 置中 + 等比縮放至 targetSize
    const box = new THREE.Box3()
    const v = new THREE.Vector3()
    for (let i = 0; i < arr.length; i += 3) {
      v.set(arr[i], arr[i + 1], arr[i + 2])
      box.expandByPoint(v)
    }
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const scale = targetSize / maxDim
    for (let i = 0; i < arr.length; i += 3) {
      arr[i] = (arr[i] - center.x) * scale
      arr[i + 1] = (arr[i + 1] - center.y) * scale
      arr[i + 2] = (arr[i + 2] - center.z) * scale
    }

    // 點數過多時等距降採樣，控制效能
    let count = arr.length / 3
    if (count > maxPoints) {
      const stride = Math.ceil(count / maxPoints)
      const reduced = []
      for (let i = 0; i < count; i += stride) {
        reduced.push(arr[i * 3], arr[i * 3 + 1], arr[i * 3 + 2])
      }
      arr = new Float32Array(reduced)
      count = arr.length / 3
    }

    // 每顆粒子的隨機屬性
    const randoms = new Float32Array(count)
    const dirs = new Float32Array(count * 3)
    const dir = new THREE.Vector3()
    for (let i = 0; i < count; i++) {
      randoms[i] = Math.random()
      dir
        .set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
        .normalize()
      dirs[i * 3] = dir.x
      dirs[i * 3 + 1] = dir.y
      dirs[i * 3 + 2] = dir.z
    }

    return { positions: arr, randoms, dirs, count }
  }, [scene, targetSize, maxPoints])
}
