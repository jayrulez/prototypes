// uDelta: Delta distance for each pixel, e.g., `1 / width`.
// uTaps: Created by lanczos lobes config.

// `uTaps` generated with following JS, `scale` is image scale ratio:
/* js
[...Array(15)].map((x, i) => lanczosFn((i + 1) * scale))
*/

// The `lanczosFn` shapes as below with `filterWindow` = 16, `lobes` = 3:
/* js
function lanczosFn (x) {
  if (x >= lobes || x <= -lobes) return 0.0
  if (x < 1.19209290E-07 && x > -1.19209290E-07) return 1.0
  x *= Math.PI
  const xx = x / lobes
  return (Math.sin(x) / x) * Math.sin(xx) / xx
}
*/

precision highp float;
uniform sampler2D uTexture;
uniform vec2 uDelta;
varying vec2 vTexCoord;
uniform float uTaps[16];
void main() {
  vec4 color = texture2D(uTexture, vTexCoord);
  float sum = 1.0;
  color += texture2D(uTexture, vTexCoord + 1.0 * uDelta) * uTaps[0];
  color += texture2D(uTexture, vTexCoord - 1.0 * uDelta) * uTaps[0];
  sum += 2.0 * uTaps[0];
  color += texture2D(uTexture, vTexCoord + 2.0 * uDelta) * uTaps[1];
  color += texture2D(uTexture, vTexCoord - 2.0 * uDelta) * uTaps[1];
  sum += 2.0 * uTaps[1];
  color += texture2D(uTexture, vTexCoord + 3.0 * uDelta) * uTaps[2];
  color += texture2D(uTexture, vTexCoord - 3.0 * uDelta) * uTaps[2];
  sum += 2.0 * uTaps[2];
  color += texture2D(uTexture, vTexCoord + 4.0 * uDelta) * uTaps[3];
  color += texture2D(uTexture, vTexCoord - 4.0 * uDelta) * uTaps[3];
  sum += 2.0 * uTaps[3];
  color += texture2D(uTexture, vTexCoord + 5.0 * uDelta) * uTaps[4];
  color += texture2D(uTexture, vTexCoord - 5.0 * uDelta) * uTaps[4];
  sum += 2.0 * uTaps[4];
  color += texture2D(uTexture, vTexCoord + 6.0 * uDelta) * uTaps[5];
  color += texture2D(uTexture, vTexCoord - 6.0 * uDelta) * uTaps[5];
  sum += 2.0 * uTaps[5];
  color += texture2D(uTexture, vTexCoord + 7.0 * uDelta) * uTaps[6];
  color += texture2D(uTexture, vTexCoord - 7.0 * uDelta) * uTaps[6];
  sum += 2.0 * uTaps[6];
  color += texture2D(uTexture, vTexCoord + 8.0 * uDelta) * uTaps[7];
  color += texture2D(uTexture, vTexCoord - 8.0 * uDelta) * uTaps[7];
  sum += 2.0 * uTaps[7];
  color += texture2D(uTexture, vTexCoord + 9.0 * uDelta) * uTaps[8];
  color += texture2D(uTexture, vTexCoord - 9.0 * uDelta) * uTaps[8];
  sum += 2.0 * uTaps[8];
  color += texture2D(uTexture, vTexCoord + 10.0 * uDelta) * uTaps[9];
  color += texture2D(uTexture, vTexCoord - 10.0 * uDelta) * uTaps[9];
  sum += 2.0 * uTaps[9];
  color += texture2D(uTexture, vTexCoord + 11.0 * uDelta) * uTaps[10];
  color += texture2D(uTexture, vTexCoord - 11.0 * uDelta) * uTaps[10];
  sum += 2.0 * uTaps[10];
  color += texture2D(uTexture, vTexCoord + 12.0 * uDelta) * uTaps[11];
  color += texture2D(uTexture, vTexCoord - 12.0 * uDelta) * uTaps[11];
  sum += 2.0 * uTaps[11];
  color += texture2D(uTexture, vTexCoord + 13.0 * uDelta) * uTaps[12];
  color += texture2D(uTexture, vTexCoord - 13.0 * uDelta) * uTaps[12];
  sum += 2.0 * uTaps[12];
  color += texture2D(uTexture, vTexCoord + 14.0 * uDelta) * uTaps[13];
  color += texture2D(uTexture, vTexCoord - 14.0 * uDelta) * uTaps[13];
  sum += 2.0 * uTaps[13];
  color += texture2D(uTexture, vTexCoord + 15.0 * uDelta) * uTaps[14];
  color += texture2D(uTexture, vTexCoord - 15.0 * uDelta) * uTaps[14];
  sum += 2.0 * uTaps[14];
  color += texture2D(uTexture, vTexCoord + 16.0 * uDelta) * uTaps[15];
  color += texture2D(uTexture, vTexCoord - 16.0 * uDelta) * uTaps[15];
  sum += 2.0 * uTaps[15];
  gl_FragColor = color / sum;
}
