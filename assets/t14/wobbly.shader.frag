precision mediump float;

uniform float u_time;
uniform vec2 u_dim;
uniform sampler2D u_tex;

varying vec2 v_uv;


void main () {
  gl_FragColor = vec4(texture2D(u_tex, v_uv + 0.005 * vec2(sin(u_time + u_dim.x * v_uv.x), cos(u_time + u_dim.y * v_uv.y))).rgb, 1.0);
}
