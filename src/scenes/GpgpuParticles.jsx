import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useFBO } from '@react-three/drei'
import * as THREE from 'three'
import { noiseGLSL } from '../shaders/noise'

/**
 * 真 GPGPU 粒子系統（FBO ping-pong）。
 * 粒子位置存於浮點貼圖，每幀在 fragment shader 用 curl noise 推進（連續流動 → 光絲感），
 * 超出範圍或壽命到則重生回原點。渲染時 vertex shader 取樣位置貼圖。
 */
const SIM_VERT = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }
`

const SIM_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uPositions;
uniform sampler2D uOriginal;
uniform float uTime;
uniform float uDelta;
varying vec2 vUv;
${noiseGLSL}
void main(){
  vec4 data = texture2D(uPositions, vUv);
  vec3 pos = data.xyz;
  float life = data.w;
  vec3 vel = curlNoiseRaw(pos * 0.16 + vec3(0.0, 0.0, uTime * 0.03));
  vel += curlNoiseRaw(pos * 0.45 + 7.0) * 0.4;
  pos += vel * uDelta * 0.8;
  life += uDelta;
  if (life > 3.2 || length(pos) > 9.0) {
    pos = texture2D(uOriginal, vUv).xyz;
    life = 0.0;
  }
  gl_FragColor = vec4(pos, life);
}
`

const RENDER_VERT = /* glsl */ `
uniform sampler2D uPositions;
uniform float uSize;
attribute vec2 reference;
varying float vLife;
void main(){
  vec4 data = texture2D(uPositions, reference);
  vLife = data.w;
  vec4 mv = modelViewMatrix * vec4(data.xyz, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (42.0 / max(-mv.z, 0.001));
}
`

const RENDER_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uColorA;
uniform vec3 uColorB;
varying float vLife;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  if (length(c) > 0.5) discard;
  float a = smoothstep(0.5, 0.0, length(c));
  float t = clamp(vLife / 3.2, 0.0, 1.0);
  float fade = smoothstep(0.0, 0.12, t) * smoothstep(1.0, 0.7, t); // 生滅淡入淡出
  vec3 col = mix(uColorA, uColorB, sin(t * 3.14159));
  gl_FragColor = vec4(col * 1.35, a * fade);
}
`

export default function GpgpuParticles({ size = 256 }) {
  const { gl } = useThree()
  const count = size * size

  const simScene = useMemo(() => new THREE.Scene(), [])
  const simCam = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), [])

  const dataTex = useMemo(() => {
    const data = new Float32Array(count * 4)
    const v = new THREE.Vector3()
    for (let i = 0; i < count; i++) {
      v.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
        .normalize()
        .multiplyScalar(Math.pow(Math.random(), 0.5) * 6.0)
      data[i * 4] = v.x
      data[i * 4 + 1] = v.y
      data[i * 4 + 2] = v.z
      data[i * 4 + 3] = Math.random() * 3.2 // 起始壽命錯開
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType)
    tex.needsUpdate = true
    return tex
  }, [size, count])

  const fboOpts = {
    type: THREE.FloatType,
    format: THREE.RGBAFormat,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    depthBuffer: false,
    stencilBuffer: false,
  }
  const fboA = useFBO(size, size, fboOpts)
  const fboB = useFBO(size, size, fboOpts)
  const pp = useRef({ read: fboA, write: fboB, primed: false })

  const simMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uPositions: { value: dataTex },
          uOriginal: { value: dataTex },
          uTime: { value: 0 },
          uDelta: { value: 0 },
        },
        vertexShader: SIM_VERT,
        fragmentShader: SIM_FRAG,
      }),
    [dataTex],
  )

  useEffect(() => {
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), simMat)
    simScene.add(quad)
    return () => {
      simScene.remove(quad)
      quad.geometry.dispose()
    }
  }, [simScene, simMat])

  const renderGeo = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const refs = new Float32Array(count * 2)
    for (let i = 0; i < count; i++) {
      refs[i * 2] = (i % size) / size
      refs[i * 2 + 1] = Math.floor(i / size) / size
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('reference', new THREE.BufferAttribute(refs, 2))
    return g
  }, [count, size])

  const renderMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uPositions: { value: dataTex },
          uSize: { value: 1.0 },
          uColorA: { value: new THREE.Color(0.1, 0.9, 1.7) }, // 青
          uColorB: { value: new THREE.Color(0.8, 0.35, 1.8) }, // 紫
        },
        vertexShader: RENDER_VERT,
        fragmentShader: RENDER_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [dataTex],
  )

  useEffect(
    () => () => {
      renderGeo.dispose()
      renderMat.dispose()
      simMat.dispose()
      dataTex.dispose()
    },
    [renderGeo, renderMat, simMat, dataTex],
  )

  useFrame((_, delta) => {
    const t = pp.current
    const dt = Math.min(delta, 0.033)
    simMat.uniforms.uTime.value += dt
    simMat.uniforms.uDelta.value = dt
    simMat.uniforms.uPositions.value = t.primed ? t.read.texture : dataTex
    gl.setRenderTarget(t.write)
    gl.render(simScene, simCam)
    gl.setRenderTarget(null)
    renderMat.uniforms.uPositions.value = t.write.texture
    pp.current = { read: t.write, write: t.read, primed: true }
  })

  return <points geometry={renderGeo} material={renderMat} frustumCulled={false} />
}
