uniform mat4 u_mvp;
uniform mat4 u_view;
uniform mat4 u_model;
uniform mediump vec3 u_wsLightPos;

attribute vec3 a_msPos;
attribute vec2 a_uv;
attribute vec3 a_msNormal;

varying vec2 v_uv;
varying vec3 v_wsPos;
varying vec3 v_csNormal;
varying vec3 v_csEyeDir;
varying vec3 v_csLightDir;


void main () {
  gl_Position = u_mvp * vec4(a_msPos, 1.0);

  v_wsPos = (u_model * vec4(a_msPos, 1.0)).xyz;

  vec3 csPos = (u_view * u_model * vec4(a_msPos, 1.0)).xyz;
  v_csEyeDir = vec3(0, 0, 0) - csPos;

  vec3 csLightPos = (u_view * vec4(u_wsLightPos, 1.0)).xyz;
  v_csLightDir = csLightPos + v_csEyeDir;

  v_csNormal = (u_view * u_model * vec4(a_msNormal, 0.0)).xyz;

  v_uv = a_uv;
}
