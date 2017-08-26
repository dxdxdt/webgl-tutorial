"use strict";

var Tut = (() => {
  // Scope local decl ...
  var __ret__; // Scope object.
  const __RAD2DEG__ = Math.PI / 180;
  var __fabAcc__, __fabRacc__;

  __ret__ = {
    GLError: class GLError extends Error {
      constructor (ctx, msg, fn, ln) {
        var glCode = new Set();
        super(msg, fn, ln);

        (function (){
          var c;
          while ((c = ctx.getError())) {
            glCode.add(c);
          }
        })();

        Object.defineProperty(this, 'glCode', {
          get : function () {
            return glCode;
          }});
        Object.defineProperty(this, 'ctx', {
          get : function () {
            return ctx;
          }});
      }

      throwFreezed() {
        throw Object.freeze(this);
      }
    },

    PerfStopwatch: class PerfStopwatch {
      constructor () {
        var tsArr = [];
        var prec = 4;

        Object.defineProperty(this, 'ts', {
          get : function () {
            return tsArr.slice();
          }
        });
        Object.defineProperty(this, 'push', {
          value : function (report) {
            var ts = performance.now();

            if (report) {
              if (tsArr.length) {
                console.log(tsArr.length + ": " + (ts - tsArr[0]).toFixed(prec) + "ms (diff: " + (ts - tsArr[tsArr.length - 1]).toFixed(prec) + "ms)");
              }
              else {
                console.log("0: " + (0).toFixed(prec) + "ms");
              }
            }
            tsArr.push(ts);

            return this;
          }
        });
        Object.defineProperty(this, 'reset', {
          value : function () {
            tsArr = [];
            return this;
          }
        });
      }
    },

    FrameCounter: class {
      constructor () {
        var __arr = [];
        var __sum, __min, __max, __stdev, __mean, __cnt = 0;

        this.calc = function () {
          if (__arr.length) {
            __min = __max = __arr[0];
            __stdev = __sum = 0;

            for (let v of __arr) {
              __max = Math.max(v, __max);
              __min = Math.min(v, __min);
              __sum += v;
            }
            __mean = __sum / __arr.length;

            for (let v of __arr) {
              __stdev += Math.abs(v - __mean);
            }
            __stdev = __stdev / __arr.length;
          }
          __cnt = __arr.length;
          __arr = [];

          return this;
        };
        this.push = function (x) {
          __arr.push(x);
          return this;
        };

        Object.defineProperty(this, 'sum', {
          get : function () {
            return __sum;
          }
        });
        Object.defineProperty(this, 'min', {
          get : function () {
            return __min;
          }
        });
        Object.defineProperty(this, 'max', {
          get : function () {
            return __max;
          }
        });
        Object.defineProperty(this, 'stdev', {
          get : function () {
            return __stdev;
          }
        });
        Object.defineProperty(this, 'mean', {
          get : function () {
            return __mean;
          }
        });
        Object.defineProperty(this, 'cnt', {
          get : function () {
            return __cnt;
          }
        });
      }
    },

    Camera: class {
      constructor () {
        var __vecAdd__ = vec3.create();
        var __vecDir__ = vec3.create();
        var __vecRight__ = vec3.create();

        this.position = vec3.fromValues(0, 0, 5);
        this.angle = {
          h: Math.deg2rad(180), // toward -Z
          v: Math.deg2rad(0) // look at the horizon
        };
        this.fov = 45.0;
        this.direction = vec3.create();
        this.right = vec3.create();
        this.up = vec3.create();

        this.correctAngles = function () {
          var wrapAngle = (x) => {
            var ret = x % (Math.PI * 2);
            if (ret < -Math.PI) {
              ret += (Math.PI * 2);
            }
            else if (ret > Math.PI) {
              ret -= (Math.PI * 2);
            }
            return ret;
          };

          // Wrap angles in [-180, 180] range.
          this.angle.h = wrapAngle(this.angle.h);
          this.angle.v = wrapAngle(this.angle.v);

          // Limit verticle angle so that the camera won't go upside down.
          if (true) {
            if (this.angle.v > Math.PI / 2) {
              this.angle.v = Math.PI / 2;
            }
            else if (this.angle.v < -Math.PI / 2) {
              this.angle.v = -Math.PI / 2;
            }
          }

          return this;
        };
        this.setAngles = function (v, h) {
          this.angle.h = v;
          this.angle.v = h;

          this
            .correctAngles()
            .calcVectors();

          return this;
        };
        this.addAngles = function (v, h) {
          this.angle.h += v;
          this.angle.v += h;

          this
            .correctAngles()
            .calcVectors();

          return this;
        };
        this.move = function (direction, right) {
          var i;

          for (i = 0; i < 3; i += 1) {
            __vecDir__[i] = this.direction[i] * direction;
            __vecRight__[i] = this.right[i] * right;
          }
          vec3.add(__vecAdd__, this.position, __vecDir__);
          vec3.copy(this.position, __vecAdd__);
          vec3.add(__vecAdd__, this.position, __vecRight__);
          vec3.copy(this.position, __vecAdd__);

          this.onupdate();

          return this;
        };
        this.calcVectors = function () {
          this.direction[0] = Math.cos(this.angle.v) * Math.sin(this.angle.h);
          this.direction[1] = Math.sin(this.angle.v);
          this.direction[2] = Math.cos(this.angle.v) * Math.cos(this.angle.h);
          this.right[0] = Math.sin(this.angle.h - Math.deg2rad(90));
          this.right[1] = 0;
          this.right[2] = Math.cos(this.angle.h - Math.deg2rad(90));
          vec3.cross(this.up, this.right, this.direction);

          this.onupdate();

          return this;
        };
        this.onupdate = function () {};

        this.calcVectors();
      }
    },

    printLegit: (str) => {
      if (typeof str == 'string' && str) {
        console.log(str);
        return true;
      }
      return false;
    },

    setTextNode: (e, str) => {
      while (e.firstChild) {
        e.removeChild(e.firstChild);
      }
      if (str && typeof str === 'string') {
        e.appendChild(document.createTextNode(str));
      }
    },

    loadShader: (gl, src, type) => {
      var shader, shaderInfo;

      shader = gl.createShader(type);
      if (!shader) {
        let e = new Tut.GLError(gl, "Could not create shader.");
        e.throwFreezed();
      }

      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      shaderInfo = gl.getShaderInfoLog(shader);

      Tut.printLegit(shaderInfo);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        let e = new Tut.GLError(gl, "Failed to compile shader.");
        e.infoLog = shaderInfo;

        gl.deleteShader(shader);

        e.throwFreezed();
      }

      return shader;
    },

    printGLCap: (gl) => {
      var shaderPrecision = (s, t) => {
        var x = gl.getShaderPrecisionFormat(gl[s], gl[t]);

        if (x) {
          return s + "/" + t + ": " + x.precision + "(" + x.rangeMin + "~" + x.rangeMax + ")";
        }
        throw new Tut.GLError(gl, "gl.getShaderPrecisionFormat() returned error.");
      };
      var glParam = (name) => {
        var prop;
        var ret;

        if (name.substr(0, 3) !== 'GL_') {
          return;
        }
        prop = gl[name.substr(3)];
        ret = prop && gl.getParameter(prop);

        if (ret) {
          return name + ": " + ret;
        }
        throw new Tut.GLError(gl, "gl.getParameter() returned error.");
      };
      var arr;

      arr = [];
      arr.push(glParam("GL_MAX_TEXTURE_IMAGE_UNITS"));
      arr.push(glParam("GL_MAX_VERTEX_UNIFORM_VECTORS"));
      arr.push(glParam("GL_MAX_FRAGMENT_UNIFORM_VECTORS"));
      arr.push(glParam("GL_MAX_VERTEX_ATTRIBS"));
      arr.push(glParam("GL_MAX_VARYING_VECTORS"));
      arr.push(glParam("GL_ALIASED_POINT_SIZE_RANGE"));
      arr.push(glParam("GL_SAMPLES"));
      console.log(arr.join("\n"));

      arr = [];
      arr.push(shaderPrecision("VERTEX_SHADER", "LOW_FLOAT"));
      arr.push(shaderPrecision("VERTEX_SHADER", "MEDIUM_FLOAT"));
      arr.push(shaderPrecision("VERTEX_SHADER", "HIGH_FLOAT"));
      arr.push(shaderPrecision("VERTEX_SHADER", "LOW_INT"));
      arr.push(shaderPrecision("VERTEX_SHADER", "MEDIUM_INT"));
      arr.push(shaderPrecision("VERTEX_SHADER", "HIGH_INT"));
      arr.push(shaderPrecision("FRAGMENT_SHADER", "LOW_FLOAT"));
      arr.push(shaderPrecision("FRAGMENT_SHADER", "MEDIUM_FLOAT"));
      arr.push(shaderPrecision("FRAGMENT_SHADER", "HIGH_FLOAT"));
      arr.push(shaderPrecision("FRAGMENT_SHADER", "LOW_INT"));
      arr.push(shaderPrecision("FRAGMENT_SHADER", "MEDIUM_INT"));
      arr.push(shaderPrecision("FRAGMENT_SHADER", "HIGH_INT"));
      console.log(arr.join("\n"));

      console.log(gl.getSupportedExtensions().join("\n"));
    }
  };

  // External library augmentation.
  Math.deg2rad = (x) => {
    return x * __RAD2DEG__;
  };
  Math.rad2deg = (x) => {
    return x / __RAD2DEG__;
  };

  __fabAcc__ = (t, op) => {
    var tmp;

    tmp = t.create();

    return function () {
      var i;
      var ret;

      if (arguments.length < 3) {
        throw new TypeError("at least 3 arguments required, but only " + arguments.length + " passed.");
      }
      ret = arguments[0];

      t.copy(ret, arguments[1]);
      for (i = 2; i < arguments.length; i += 1) {
        op(tmp, ret, arguments[i]);
        t.copy(ret, tmp);
      }

      return ret;
    };
  };
  __fabRacc__ = (t, op) => {
    var regular = __fabAcc__(t, op);

    return () => {
      var nyArgs = [arguments[0]];

      nyArgs.concat(Array.from(arguments).slice(1).reverse());
      regular.apply(undefined, nyArgs);
    };
  };

  mat4.aadd = __fabAcc__(mat4, mat4.add);
  mat4.asub = __fabAcc__(mat4, mat4.sub);
  mat4.amul = __fabAcc__(mat4, mat4.mul);
  mat3.aadd = __fabAcc__(mat3, mat3.add);
  mat3.asub = __fabAcc__(mat3, mat3.sub);
  mat3.amul = __fabAcc__(mat3, mat3.mul);
  mat2.aadd = __fabAcc__(mat2, mat2.add);
  mat2.asub = __fabAcc__(mat2, mat2.sub);
  mat2.amul = __fabAcc__(mat2, mat2.mul);
  mat2d.aadd = __fabAcc__(mat2d, mat2d.add);
  mat2d.asub = __fabAcc__(mat2d, mat2d.sub);
  mat2d.amul = __fabAcc__(mat2d, mat2d.mul);

  mat4.raadd = __fabRacc__(mat4, mat4.add);
  mat4.rasub = __fabRacc__(mat4, mat4.sub);
  mat4.ramul = __fabRacc__(mat4, mat4.mul);
  mat3.raadd = __fabRacc__(mat3, mat3.add);
  mat3.rasub = __fabRacc__(mat3, mat3.sub);
  mat3.ramul = __fabRacc__(mat3, mat3.mul);
  mat2.raadd = __fabRacc__(mat2, mat2.add);
  mat2.rasub = __fabRacc__(mat2, mat2.sub);
  mat2.ramul = __fabRacc__(mat2, mat2.mul);
  mat2d.raadd = __fabRacc__(mat2d, mat2d.add);
  mat2d.rasub = __fabRacc__(mat2d, mat2d.sub);
  mat2d.ramul = __fabRacc__(mat2d, mat2d.mul);

  vec4.aadd = __fabAcc__(vec4, vec4.add);
  vec4.asub = __fabAcc__(vec4, vec4.sub);
  vec4.amul = __fabAcc__(vec4, vec4.mul);
  vec4.adiv = __fabAcc__(vec4, vec4.div);
  vec3.aadd = __fabAcc__(vec3, vec3.add);
  vec3.asub = __fabAcc__(vec3, vec3.sub);
  vec3.amul = __fabAcc__(vec3, vec3.mul);
  vec3.adiv = __fabAcc__(vec3, vec3.div);
  vec2.aadd = __fabAcc__(vec2, vec2.add);
  vec2.asub = __fabAcc__(vec2, vec2.sub);
  vec2.amul = __fabAcc__(vec2, vec2.mul);
  vec2.adiv = __fabAcc__(vec2, vec2.div);

  vec4.raadd = __fabRacc__(vec4, vec4.add);
  vec4.rasub = __fabRacc__(vec4, vec4.sub);
  vec4.ramul = __fabRacc__(vec4, vec4.mul);
  vec4.radiv = __fabRacc__(vec4, vec4.div);
  vec3.raadd = __fabRacc__(vec3, vec3.add);
  vec3.rasub = __fabRacc__(vec3, vec3.sub);
  vec3.ramul = __fabRacc__(vec3, vec3.mul);
  vec3.radiv = __fabRacc__(vec3, vec3.div);
  vec2.raadd = __fabRacc__(vec2, vec2.add);
  vec2.rasub = __fabRacc__(vec2, vec2.sub);
  vec2.ramul = __fabRacc__(vec2, vec2.mul);
  vec2.radiv = __fabRacc__(vec2, vec2.div);

  return __ret__;
})();
