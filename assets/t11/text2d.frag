precision mediump float;

uniform vec3 u_colour;
uniform sampler2D u_tex;

varying vec2 v_uv;


void main () {
  vec4 matColour = texture2D(u_tex, v_uv);

  gl_FragColor.r = matColour.r * u_colour.r;
  gl_FragColor.g = matColour.g * u_colour.g;
  gl_FragColor.b = matColour.b * u_colour.b;
  gl_FragColor.a = matColour.a;
}
