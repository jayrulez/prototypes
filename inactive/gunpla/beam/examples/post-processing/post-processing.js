import {
  createElement,
  ShadePlugin,
  ShaderTypes,
  PropTypes
} from '../../src/index.js'

const vertexShader = `
attribute vec4 pos;

void main() {
  gl_Position = pos;
}
`

// Inline from https://www.shadertoy.com/view/Xs2SWd
const fragmentShader = `
precision highp float;
uniform float k;

#define NEAR 0.0
#define FAR 50.0
#define MAX_STEPS 64

#define PI 3.14159265359
#define EPS 0.001

// Hash by iq
float hash(vec2 p) {
  float h = 1.0 + dot(p, vec2(127.1, 311.7));
  return fract(sin(h) * 43758.5453123);
}

float rbox(vec3 p, vec3 s, float r) {
  return length(max(abs(p) - s + vec3(r), 0.0)) - r;
}

vec2 rot(vec2 k, float t) {
  float ct = cos(t);
  float st = sin(t);
  return vec2(ct * k.x - st * k.y, st * k.x + ct * k.y);
}

void oprep2(inout vec2 p, float q, float s, float k) {
  float r = 1.0 / q;
  float ofs = s;
  float angle = atan(p.x, p.y);
  float a = mod(angle, 2.0 * PI * r) - PI * r;
  p.xy = vec2(sin(a), cos(a)) * length(p.xy) - ofs;
  p.x += ofs;
}

float map(vec3 p) {
  p.y -= 1.0;
  p.xy = rot(p.xy, p.z * 0.15);
  p.z += k;
  p.xy = mod(p.xy, 6.0) - 0.5 * 6.0;
  p.xy = rot(p.xy, -floor(p.z / 0.75) * 0.35);
  p.z = mod(p.z, 0.75) - 0.5 * 0.75;
  oprep2(p.xy, 6.0, 0.45, k);

  return rbox(p, vec3(0.1, 0.025, 0.25), 0.05);
}

vec3 getNormal(vec3 p) {
  float h = 0.0001;

  return normalize(
      vec3(map(p + vec3(h, 0, 0)) - map(p - vec3(h, 0, 0)),
          map(p + vec3(0, h, 0)) - map(p - vec3(0, h, 0)),
          map(p + vec3(0, 0, h)) - map(p - vec3(0, 0, h))));
}

float saw(float x, float d, float s, float shift) {
  float xp = PI * (x * d + k * 0.5 + shift);

  float as = asin(s);
  float train = 0.5 * sign(sin(xp - as) - s) + 0.5;

  float range = (PI - 2.0 * as);
  xp = mod(xp, 2.0 * PI);
  float y = mod(-(xp - 2.0 * as), range) / range;
  y *= train;

  return y;
}

vec3 getShading(vec3 p, vec3 normal, vec3 lightPos) {
  vec3 lightDirection = normalize(lightPos - p);
  float lightIntensity = clamp(dot(normal, lightDirection), 0.0, 1.0);

  vec2 id = floor((p.xy + 3.0) / 6.0);
  float fid = hash(id);
  float ve = hash(id);

  vec3 col = vec3(0.0, 1.0, 0.0);
  col *= 4.0 * saw(p.z, 0.092, 0.77, fid * 2.5);

  vec3 amb = vec3(0.15, 0.2, 0.32);
  vec3 tex = vec3(0.8098039, 0.8607843, 1.0);

  return col * tex * lightIntensity + amb * (1.0 - lightIntensity);
}

void raymarch(vec3 ro, vec3 rd, out int i, out float t) {
  t = 0.0;

  for (int j = 0; j < MAX_STEPS; ++j) {
    vec3 p = ro + rd * t;
    float h = map(p);
    i = j;

    if (h < EPS || t > FAR) {
      break;
    }
    t += h * 0.7;
  }
}

float computeSun(vec3 ro, vec3 rd, float t, float lp) {
  vec3 lpos = vec3(0.0, 0.0, 54.0);
  ro -= lpos;
  float m = dot(rd, -ro);
  float d = length(ro - vec3(0.0, 0.0, 0.7) + m * rd);

  float a = -m;
  float b = t - m;
  float aa = atan(a / d);
  float ba = atan(b / d);
  float to = (ba - aa) / d;

  return to * 0.15 * lp;
}

vec3 computeColor(vec3 ro, vec3 rd) {
  int i;
  float t;
  raymarch(ro, rd, i, t);

  float lp = sin(k - 1.0) + 1.3;
  vec3 color = vec3(0.0, 1.0, 0.0);

  if (i < MAX_STEPS && t >= NEAR && t <= FAR) {
    vec3 p = ro + rd * t;
    vec3 normal = getNormal(p);

    float z = 1.0 - (NEAR + t) / (FAR - NEAR);

    color = getShading(p, normal, vec3(0.0));
    color *= lp;

    float zSqrd = z * z;
    color = mix(vec3(0.0), color, zSqrd * (3.0 - 2.0 * z)); // Fog

    color += computeSun(ro, rd, t, lp);
    return pow(color, vec3(0.8));
  }
  return color * computeSun(ro, rd, t, lp);
}

void main() {
  vec2 resolution = vec2(${window.innerWidth / 3}, ${window.innerHeight / 3});
  vec2 q = gl_FragCoord.xy / resolution.xy;
  vec2 coord = 2.0 * q - 1.0;
  coord.x *= resolution.x / resolution.y;
  coord *= 0.84;

  vec3 dir = vec3(0.0, 0.0, 1.0);
  vec3 up = vec3(0.0, 1.0, 0.0);

  vec3 right = normalize(cross(dir, up));

  vec3 ro = vec3(0.0, 0.0, 8.74);
  vec3 rd = normalize(dir * 2.0 + coord.x * right + coord.y * up);
  vec3 col = computeColor(ro, rd);

  gl_FragColor = vec4(col.grb, 0.5);
}
`

export class PostProcessingPlugin extends ShadePlugin {
  constructor () {
    super()

    const { vec3, float } = ShaderTypes
    this.vertexShader = vertexShader
    this.fragmentShader = fragmentShader
    this.shaderSchema.attributes = { pos: vec3 }
    this.shaderSchema.uniforms = { k: float }

    const { buffer } = PropTypes
    this.propSchema = {
      pos: { type: buffer, n: 3 },
      index: { type: buffer, index: true }
    }
  }

  propsByElement () {
    const pos = [
      -1.0, -1.0, 1.0,
      1.0, -1.0, 1.0,
      1.0, 1.0, 1.0,
      -1.0, 1.0, 1.0
    ]

    return { pos, index: [0, 1, 2, 0, 2, 3] }
  }

  propsByGlobals ({ k }) {
    return { k }
  }

  beforeDraw (gl) {
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
    gl.enable(gl.BLEND)
    gl.disable(gl.DEPTH_TEST)
  }
}

export const createPostProcessingElement = data => createElement(
  data, PostProcessingPlugin
)
