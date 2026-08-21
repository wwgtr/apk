precision mediump float;

uniform float uTime;
uniform vec2 uResolution;

void main(void) {
  vec2 uv = gl_FragCoord.xy / uResolution.xy - 0.5;
  float ring = abs(length(uv) - (0.34 + sin(uTime * 1.6) * 0.015));
  float glow = smoothstep(0.06, 0.0, ring);
  vec3 color = mix(vec3(0.01, 0.09, 0.12), vec3(0.05, 0.82, 0.90), glow);
  gl_FragColor = vec4(color, 0.78);
}
