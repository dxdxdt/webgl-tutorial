precision mediump float;

uniform sampler2D u_tex;
uniform vec3 u_baseColor;

varying vec2 v_uv;


void main () {
  gl_FragColor = vec4(texture2D(u_tex, v_uv).rgb * u_baseColor, 1.0);
}
