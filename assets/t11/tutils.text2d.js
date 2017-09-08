/* global Tut, WebGL2RenderingContext */
(function () {
  "use strict";
  var __init__ = false;
  var __texture__ = null;
  var __shader__ = null;
  var __opt__ = null;

  var __stateError__ = class StateError extends Error {};
  var __text__ = class Text {
    constructor (x, y, size, str, colour) {
      var __x, __y, __size, __str, __colour;

      Object.defineProperties(this, {
        x: {
          get: function () {
            return __x;
          },
          set: function (x) {
            Tut.checkType(x, 'number');
            __x = x;
            return x;
          },
          configurable: true
        },
        y: {
          get: function () {
            return __y;
          },
          set: function (x) {
            Tut.checkType(x, 'number');
            __y = x;
            return x;
          },
          configurable: true
        },
        size: {
          get: function () {
            return __size;
          },
          set: function (x) {
            Tut.checkType(x, 'number');
            __size = x;
            return x;
          },
          configurable: true
        },
        str: {
          get: function () {
            return __str;
          },
          set: function (x) {
            Tut.checkType(x, 'string');
            __str = x;
            return x;
          },
          configurable: true
        },
        colour: {
          get: function () {
            return __colour;
          },
          set: function (x) {
            Tut.checkClass(x, Array);
            if (x.length < 3) {
              Tut.throwFreezed(new RangeError("Float32Array of at least 3 elements required."));
            }
            __colour = new Float32Array(x);
            return x;
          },
          configurable: true
        }
      });

      this.x = x || 0;
      this.y = y || 0;
      this.size = size || 10;
      this.str = str || '';
      this.colour = colour || [1.0, 1.0, 1.0];
    }
  };

  Tut.initText2D = function (r, opt) {
    Tut.checkClass(r.texture, HTMLImageElement);
    Tut.checkType(r.shader.vert, 'string');
    Tut.checkType(r.shader.frag, 'string');

    __texture__ = r.texture;
    __shader__ = {
      vert: r.shader.vert,
      frag: r.shader.frag
    };
    __opt__ = opt || {
      invert_uv: false
    };

    __init__ = true;
  };

  Tut.Text2D = class {
    static get StateError () {
      return __stateError__;
    }

    static get Text () {
      return __text__;
    }

    constructor (gl) {
      var glo = {};
      var unif = {};
      var __checkValid, __render;

      if (!__init__) {
        Tut.throwFreezed(new Tut.Text2D.StateError("Tut.Text2D not initialised."));
      }
      Tut.checkClass(gl, [WebGLRenderingContext, WebGL2RenderingContext]);

      glo.shader = {
        vert: Tut.loadShader(gl, __shader__.vert, gl.VERTEX_SHADER),
        frag: Tut.loadShader(gl, __shader__.frag, gl.FRAGMENT_SHADER)
      };
      glo.pro = gl.createProgram();
      gl.attachShader(glo.pro, glo.shader.vert);
      gl.attachShader(glo.pro, glo.shader.frag);
      gl.bindAttribLocation(glo.pro, 0, 'a_pos');
      gl.bindAttribLocation(glo.pro, 1, 'a_uv');
      gl.linkProgram(glo.pro);
      Tut.printLegit(gl.getProgramInfoLog(glo.pro)); // XXX: debug
      if (!gl.getProgramParameter(glo.pro, gl.LINK_STATUS)) {
        let e = new Tut.GLError(gl, "failed to link program");
        e.infoLog = gl.getProgramInfoLog(glo.pro);
        Tut.throwFreezed(e);
      }
      unif.tex = gl.getUniformLocation(glo.pro, "u_tex");
      unif.colour = gl.getUniformLocation(glo.pro, "u_colour");
      unif.screenDim = gl.getUniformLocation(glo.pro, "u_screenDim");

      glo.tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, glo.tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, __texture__);
      gl.generateMipmap(gl.TEXTURE_2D);

      glo.vert = gl.createBuffer();
      glo.uv = gl.createBuffer();

      __checkValid = function () {
        if (!glo) {
          Tut.throwFreezed(new Tut.Text2D.StateError("instance finalised."));
        }
      };
      __render = function (t) {
        if (t.str.trim()) {
          const arrLen = t.str.length * 6 * 2;
          let vertices = new Float32Array(arrLen);
          let uvs = new Float32Array(arrLen);
          let vert_up_left = [0, 0];
          let vert_up_right = [0, 0];
          let vert_down_right = [0, 0];
          let vert_down_left = [0, 0];
          let uv_up_left = [0, 0];
          let uv_up_right = [0, 0];
          let uv_down_right = [0, 0];
          let uv_down_left = [0, 0];
          let uv_x, uv_y;
          let p, c, i;

          // For each right side.
          p = 0;
          for (i = 0; i < t.str.length; i += 1) {
            c = t.str.charCodeAt(i);
            uv_x = (c % 16) / 16;
            uv_y = Math.trunc(c / 16) / 16;

            [vert_up_left[0], vert_up_left[1]] = [t.x + i * t.size, t.y + t.size];
            [vert_up_right[0], vert_up_right[1]] = [t.x + (i + 1) * t.size, t.y + t.size];
            [vert_down_right[0], vert_down_right[1]] = [t.x + (i + 1) * t.size, t.y];
            [vert_down_left[0], vert_down_left[1]] = [t.x + i * t.size, t.y];
            [uv_up_left[0], uv_up_left[1]] = [uv_x, uv_y];
            [uv_up_right[0], uv_up_right[1]] = [uv_x + 1 / 16, uv_y];
            [uv_down_right[0], uv_down_right[1]] = [uv_x + 1 / 16, uv_y + 1 / 16];
            [uv_down_left[0], uv_down_left[1]] = [uv_x, uv_y + 1 / 16];

            [vertices[p + 0], vertices[p + 1]] = [vert_up_left[0], vert_up_left[1]];
            [vertices[p + 2], vertices[p + 3]] = [vert_down_left[0], vert_down_left[1]];
            [vertices[p + 4], vertices[p + 5]] = [vert_up_right[0], vert_up_right[1]];
            [vertices[p + 6], vertices[p + 7]] = [vert_down_right[0], vert_down_right[1]];
            [vertices[p + 8], vertices[p + 9]] = [vert_up_right[0], vert_up_right[1]];
            [vertices[p + 10], vertices[p + 11]] = [vert_down_left[0], vert_down_left[1]];
            [uvs[p + 0], uvs[p + 1]] = [uv_up_left[0], uv_up_left[1]];
            [uvs[p + 2], uvs[p + 3]] = [uv_down_left[0], uv_down_left[1]];
            [uvs[p + 4], uvs[p + 5]] = [uv_up_right[0], uv_up_right[1]];
            [uvs[p + 6], uvs[p + 7]] = [uv_down_right[0], uv_down_right[1]];
            [uvs[p + 8], uvs[p + 9]] = [uv_up_right[0], uv_up_right[1]];
            [uvs[p + 10], uvs[p + 11]] = [uv_down_left[0], uv_down_left[1]];

            p += 12;
          }
          // Invert UVs.
          if (__opt__.invert_uv) {
            for (i = 0; i < uvs.length; i += 1) {
              uvs[i] = 1 - uvs[i];
            }
          }
          // Buffer upload and draw.
          gl.uniform3fv(unif.colour, t.colour);

          gl.bindBuffer(gl.ARRAY_BUFFER, glo.vert);
          gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
          gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
          gl.bindBuffer(gl.ARRAY_BUFFER, glo.uv);
          gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.DYNAMIC_DRAW);
          gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

          gl.drawArrays(gl.TRIANGLES, 0, t.str.length * 6);
        }
      };

      Object.defineProperties(this, {
        render: {
          value: function (x) {
            let vp;

            __checkValid();

            vp = gl.getParameter(gl.VIEWPORT);

            gl.useProgram(glo.pro);

            gl.uniform2fv(unif.screenDim, new Float32Array([vp[2], vp[3]]));
            gl.uniform1i(unif.tex, 0);

            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.disable(gl.DEPTH_TEST);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, glo.tex);

            gl.enableVertexAttribArray(0);
            gl.enableVertexAttribArray(1);

            if (Array.isArray(x)) {
              let e;

              for (e of x) {
                Tut.checkClass(e, Tut.Text2D.Text);
              }
              for (e of x) {
                __render(e);
              }
            }
            else {
              Tut.checkClass(x, Tut.Text2D.Text);
              __render(x);
            }

            gl.disable(gl.BLEND);

            gl.disableVertexAttribArray(0);
            gl.disableVertexAttribArray(1);

            return this;
          },
          configurable: true
        },
        fin: {
          value: function () {
            if (glo) {
              gl.deleteProgram(glo.pro);
              gl.deleteShader(glo.shader.vert);
              gl.deleteShader(glo.shader.frag);
              gl.deleteBuffer(glo.vert);
              gl.deleteBuffer(glo.uv);
              gl.deleteTexture(glo.tex);
              glo = null;
            }

            return this;
          },
          configurable: true
        }
      });
    }
  };
})();
