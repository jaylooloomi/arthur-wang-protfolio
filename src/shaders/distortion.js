// Phase 3 — 卡片液態扭曲 shader
// 頂點：sine 波讓平面起伏（綁定 uTime + 滑鼠強度）
// 片段：UV sine 位移造成液態流動感，加青色發光描邊

export const distortionVertex = /* glsl */ `
uniform float uTime;
uniform vec2  uMouse;
varying vec2  vUv;

void main() {
  vUv = uv;
  vec3 pos = position;
  float amp = 0.06 + length(uMouse) * 0.06;
  pos.z += sin(pos.x * 3.0 + uTime * 1.5) * amp;
  pos.z += sin(pos.y * 4.0 + uTime * 1.1) * amp * 0.8;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

export const distortionFragment = /* glsl */ `
uniform sampler2D uTex;
uniform float uTime;
uniform vec2  uMouse;
varying vec2  vUv;

void main() {
  vec2 uv = vUv;
  // 液態 UV 扭曲（sine 波，綁定時間與滑鼠）
  uv.x += sin(uv.y * 10.0 + uTime * 1.5) * 0.018 * (0.6 + uMouse.x);
  uv.y += sin(uv.x * 12.0 + uTime * 1.2) * 0.018 * (0.6 + uMouse.y);

  vec4 tex = texture2D(uTex, uv);

  // 邊框發光：越靠近邊緣越亮（青色霓虹）
  float bx = smoothstep(0.0, 0.06, uv.x) * smoothstep(1.0, 0.94, uv.x);
  float by = smoothstep(0.0, 0.06, uv.y) * smoothstep(1.0, 0.94, uv.y);
  float inner = bx * by;
  vec3 edgeGlow = vec3(1.5, 0.9, 0.25) * (1.0 - inner);

  vec3 col = tex.rgb + edgeGlow;
  float alpha = max(tex.a, (1.0 - inner) * 0.85);
  gl_FragColor = vec4(col, alpha);
}
`
