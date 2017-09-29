attribute vec3 a_pos;

varying vec2 v_uv;


void main () {
  gl_Position = vec4(a_pos, 1.0);
  v_uv = (a_pos.xy + vec2(1.0, 1.0)) / 2.0;
}
