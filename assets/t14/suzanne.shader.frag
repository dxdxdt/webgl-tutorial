precision mediump float;

uniform sampler2D u_tex;
uniform mediump vec3 u_wsLightPos;

varying vec2 v_uv;
varying vec3 v_wsPos;
varying vec3 v_csNormal;
varying vec3 v_csEyeDir;
varying vec3 v_csLightDir;


void main () {
  vec3 lightColor = vec3(1.0, 1.0, 1.0); // TODO: uniform
  float lightPower = 50.0; // TODO: uniform

  vec3 matDiffColor = texture2D(u_tex, v_uv).rgb;
   // TODO: uniform
  vec3 matAmbientColor = vec3(0.1, 0.1, 0.1) * matDiffColor;
   // TODO: uniform
  vec3 matSpecularColor = vec3(0.3, 0.3, 0.3);

  float dSqrd = pow(length(u_wsLightPos - v_wsPos), 2.0);

  vec3 n = normalize(v_csNormal);
  vec3 l = normalize(v_csLightDir);
  float cosTheta = clamp(dot(n, l), 0.0, 1.0);

  vec3 eye = normalize(v_csEyeDir);
  vec3 ref = reflect(-l, n);
  float cosAlpha = clamp(dot(eye, ref), 0.0, 1.0);

  gl_FragColor = vec4(
      matAmbientColor +
      matDiffColor * lightColor * lightPower * cosTheta / dSqrd +
       // TODO: uniform
      matSpecularColor * lightColor * lightPower * pow(cosAlpha, 5.0) / dSqrd,
    1.0);
}
