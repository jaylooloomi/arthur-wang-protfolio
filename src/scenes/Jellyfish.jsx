import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * 生物發光水母（原創粒子實作）：半球鐘體會脈動，下方多條觸手隨正弦+噪聲擺動。
 * 鐘體頂亮、觸手尾端淡。靠 Bloom 暈成水母光感。
 */
const VERT = /* glsl */ `
uniform float uTime;
uniform float uSize;
attribute float aType;   // 0 = 鐘體, 1 = 觸手
attribute float aSeed;
attribute float aSeg;    // 觸手段位 0(根)~1(尾)
varying float vGlow;

void main(){
  vec3 pos = position;

  if (aType < 0.5) {
    // 鐘體脈動：沿法線(約等於 normalize(pos - 中心))呼吸
    float pulse = 1.0 + sin(uTime * 1.6 + aSeed * 3.0) * 0.10;
    pos.xz *= pulse;
    pos.y *= 1.0 + sin(uTime * 1.6 + aSeed * 3.0) * 0.06;
    vGlow = 0.9;
  } else {
    // 觸手擺動：越靠尾端擺幅越大
    float t = uTime * 1.2 + aSeed * 6.2831;
    float amp = aSeg * 1.4;
    pos.x += sin(t + aSeg * 5.0) * amp * 0.5;
    pos.z += cos(t * 0.9 + aSeg * 4.0) * amp * 0.5;
    pos.y -= sin(t * 0.5) * 0.2 * aSeg;
    vGlow = mix(0.8, 0.12, aSeg); // 尾端漸暗
  }

  // 整體緩慢上下漂浮
  pos.y += sin(uTime * 0.6) * 0.4;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (0.5 + aSeed * 0.8) * (60.0 / max(-mv.z, 0.001));
}
`

const FRAG = /* glsl */ `
precision highp float;
uniform vec3 uColorTop;
uniform vec3 uColorBot;
varying float vGlow;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  if (length(c) > 0.5) discard;
  float a = smoothstep(0.5, 0.0, length(c));
  vec3 col = mix(uColorBot, uColorTop, vGlow) * (0.7 + vGlow * 1.3);
  gl_FragColor = vec4(col, a * (0.25 + vGlow));
}
`

export default function Jellyfish() {
  const ref = useRef()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 1.4 },
      uColorTop: { value: new THREE.Color(0.5, 1.7, 1.9) }, // 亮青
      uColorBot: { value: new THREE.Color(0.5, 0.25, 1.4) }, // 紫
    }),
    [],
  )

  const geometry = useMemo(() => {
    const bellCount = 9000
    const strands = 28
    const segPer = 90
    const tentacleCount = strands * segPer
    const total = bellCount + tentacleCount

    const positions = new Float32Array(total * 3)
    const types = new Float32Array(total)
    const seeds = new Float32Array(total)
    const segs = new Float32Array(total)

    const bellR = 3.0
    let p = 0
    // 鐘體：半球（上半）
    for (let i = 0; i < bellCount; i++) {
      const theta = Math.acos(Math.random()) // 0..PI/2 偏上
      const phi = Math.random() * Math.PI * 2
      const r = bellR * (0.85 + Math.random() * 0.15)
      positions[p * 3] = r * Math.sin(theta) * Math.cos(phi)
      positions[p * 3 + 1] = r * Math.cos(theta) * 0.8 // 壓扁成傘形
      positions[p * 3 + 2] = r * Math.sin(theta) * Math.sin(phi)
      types[p] = 0
      seeds[p] = Math.random()
      segs[p] = 0
      p++
    }
    // 觸手：從鐘體下緣垂下
    for (let s = 0; s < strands; s++) {
      const phi = (s / strands) * Math.PI * 2
      const rimR = bellR * (0.55 + Math.random() * 0.35)
      const baseX = rimR * Math.cos(phi)
      const baseZ = rimR * Math.sin(phi)
      const seed = Math.random()
      for (let k = 0; k < segPer; k++) {
        const seg = k / segPer
        positions[p * 3] = baseX + (Math.random() - 0.5) * 0.1
        positions[p * 3 + 1] = -seg * 7.0 // 往下垂
        positions[p * 3 + 2] = baseZ + (Math.random() - 0.5) * 0.1
        types[p] = 1
        seeds[p] = seed
        segs[p] = seg
        p++
      }
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('aType', new THREE.BufferAttribute(types, 1))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    g.setAttribute('aSeg', new THREE.BufferAttribute(segs, 1))
    return g
  }, [])

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((_, delta) => {
    uniforms.uTime.value += delta
    if (ref.current) ref.current.rotation.y += delta * 0.15
  })

  return (
    <points ref={ref} geometry={geometry} position={[0, 1.5, 0]} frustumCulled={false}>
      <shaderMaterial
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
