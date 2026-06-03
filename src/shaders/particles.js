// Phase 2 — 粒子分散 shader（組裝 logo ↔ 潰散粒子雲）
// 內含 Ashima / Stefan Gustavson 的 3D Simplex noise（公有領域）。
// ShaderMaterial 會自動注入 position / modelViewMatrix / projectionMatrix，
// 自訂 attribute（aRandom, aDir）需自行宣告。

const simplexNoise = /* glsl */ `
vec3 mod289(vec3 x){return x - floor(x * (1.0/289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0/289.0)) * 289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`

export const particleVertex = /* glsl */ `
uniform float uTime;
uniform float uProgress;   // 0 = 組裝, 1 = 完全潰散
uniform float uSize;
attribute float aRandom;
attribute vec3  aDir;
varying float vGlow;

${simplexNoise}

void main() {
  vec3 pos = position;

  // 爆破方向位移：沿隨機方向往外炸開
  vec3 dispersed = pos + aDir * (1.5 + aRandom * 3.5);

  // 潰散後的混沌漂浮（noise 驅動）
  float t = uTime * 0.25;
  vec3 floatOffset = vec3(
    snoise(pos * 1.4 + t),
    snoise(pos * 1.4 + t + 31.4),
    snoise(pos * 1.4 + t + 62.8)
  ) * uProgress * 0.7;

  vec3 finalPos = mix(pos, dispersed, uProgress) + floatOffset;

  vGlow = mix(0.45, 1.0, uProgress * 0.6 + aRandom * 0.4);

  vec4 mv = modelViewMatrix * vec4(finalPos, 1.0);
  gl_Position = projectionMatrix * mv;
  // 透視衰減：常數調小，避免點過大導致加法混合過曝（目標 ~3-6px）
  gl_PointSize = uSize * (0.6 + aRandom) * (26.0 / max(-mv.z, 0.001));
}
`

export const particleFragment = /* glsl */ `
uniform vec3 uColor;
varying float vGlow;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float alpha = smoothstep(0.5, 0.0, d);
  // 輸出 HDR 值以觸發 Bloom（霓虹綠青）；倍率適中避免整屏過曝
  vec3 col = uColor * vGlow * 1.8;
  gl_FragColor = vec4(col, alpha);
}
`
