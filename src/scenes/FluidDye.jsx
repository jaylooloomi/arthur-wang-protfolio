import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useFBO } from '@react-three/drei'
import * as THREE from 'three'
import { noiseGLSL } from '../shaders/noise'

/**
 * GPU 流體墨染（原創簡化版）：在 FBO 上做半拉格朗日平流（semi-Lagrangian advection），
 * 速度場用 curl noise，並由移動的彩色源頭注入染料 → 墨水/煙霧擴散感。
 * 顯示為一片填滿視野的平面，貼上染料貼圖；Bloom 讓亮處發光。
 */
const SIM_VERT = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }
`

const SIM_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uDye;
uniform float uTime;
uniform float uDelta;
varying vec2 vUv;
${noiseGLSL}
void main(){
  vec2 uv = vUv;
  // 速度場（curl noise）
  vec3 c = curlNoise(vec3(uv * 3.2, uTime * 0.12));
  vec2 vel = c.xy * 0.55;
  // 半拉格朗日：往回追溯取樣 + 衰減
  vec2 src = uv - vel * uDelta;
  vec3 dye = texture2D(uDye, src).rgb * 0.987;

  // 移動彩色源頭注入
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    vec2 e = vec2(0.5 + 0.33 * sin(uTime * 0.5 + fi * 2.1),
                  0.5 + 0.30 * cos(uTime * 0.37 + fi * 1.7));
    float d = distance(uv, e);
    float inj = smoothstep(0.05, 0.0, d);
    vec3 col = 0.5 + 0.5 * cos(uTime * 0.4 + fi * 2.0 + vec3(0.0, 2.1, 4.2));
    dye += col * inj * uDelta * 14.0;
  }
  dye = min(dye, vec3(3.0));
  gl_FragColor = vec4(dye, 1.0);
}
`

const SHOW_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uDye;
varying vec2 vUv;
void main(){
  vec3 dye = texture2D(uDye, vUv).rgb;
  gl_FragColor = vec4(dye * 1.15, 1.0);
}
`
const SHOW_VERT = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`

export default function FluidDye({ size = 512 }) {
  const { gl } = useThree()
  const simScene = useMemo(() => new THREE.Scene(), [])
  const simCam = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), [])

  const opts = {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: false,
    stencilBuffer: false,
  }
  const fboA = useFBO(size, size, opts)
  const fboB = useFBO(size, size, opts)
  const pp = useRef({ read: fboA, write: fboB })
  const warmed = useRef(false)

  const simMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uDye: { value: null }, uTime: { value: 0 }, uDelta: { value: 0 } },
        vertexShader: SIM_VERT,
        fragmentShader: SIM_FRAG,
      }),
    [],
  )

  const showMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uDye: { value: null } },
        vertexShader: SHOW_VERT,
        fragmentShader: SHOW_FRAG,
        depthWrite: false,
      }),
    [],
  )

  useEffect(() => {
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), simMat)
    simScene.add(quad)
    return () => {
      simScene.remove(quad)
      quad.geometry.dispose()
    }
  }, [simScene, simMat])

  useEffect(
    () => () => {
      simMat.dispose()
      showMat.dispose()
    },
    [simMat, showMat],
  )

  const step = (dt) => {
    const t = pp.current
    simMat.uniforms.uTime.value += dt
    simMat.uniforms.uDelta.value = dt
    simMat.uniforms.uDye.value = t.read.texture
    gl.setRenderTarget(t.write)
    gl.render(simScene, simCam)
    gl.setRenderTarget(null)
    showMat.uniforms.uDye.value = t.write.texture
    pp.current = { read: t.write, write: t.read }
  }

  useFrame((_, delta) => {
    if (!warmed.current) {
      for (let i = 0; i < 70; i++) step(0.02) // 預熱：先把染料染開，進場就有畫面
      warmed.current = true
    }
    step(Math.min(delta, 0.033))
  })

  // 填滿視野的顯示平面（相機 z=12, fov=55）
  return (
    <mesh material={showMat} position={[0, 0, 0]}>
      <planeGeometry args={[28, 17]} />
    </mesh>
  )
}
