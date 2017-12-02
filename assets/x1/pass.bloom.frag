precision mediump float;

struct TextureSet {
  sampler2D bloom;
};
struct TexelStep {
  float w;
  float h;
};

uniform TextureSet u_tex;
uniform bool u_propVPass;
uniform TexelStep u_propBlurStep;
uniform float u_propWeight[9];

varying vec2 v_uv;


void main () {
  vec3 ret;

  ret = texture2D(u_tex.bloom, v_uv).rgb * u_propWeight[0];
  if (u_propVPass) {
    for (int i = 1; i < 9; i += 1) {
      ret +=
        (texture2D(u_tex.bloom, v_uv + vec2(0.0, u_propBlurStep.h * float(i))).rgb +
        texture2D(u_tex.bloom, v_uv - vec2(0.0, u_propBlurStep.h * float(i))).rgb) *
        u_propWeight[i];
    }
  }
  else {
    for (int i = 1; i < 9; i += 1) {
      ret +=
        (texture2D(u_tex.bloom, v_uv + vec2(u_propBlurStep.w * float(i), 0.0)).rgb +
        texture2D(u_tex.bloom, v_uv - vec2(u_propBlurStep.w * float(i), 0.0)).rgb) *
        u_propWeight[i];
    }
  }

  gl_FragColor = vec4(ret, 1.0);
}
