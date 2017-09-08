uniform vec2 u_screenDim;

attribute vec2 a_pos;
attribute vec2 a_uv;

varying vec2 v_uv;


void main () {
  gl_Position = vec4((2.0 * a_pos / u_screenDim) - 1.0, 0.0, 1.0);
  v_uv = a_uv;
}
