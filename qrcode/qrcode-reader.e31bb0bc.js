// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"node_modules/qr-scanner/qr-scanner.min.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class e {
  static hasCamera() {
    return navigator.mediaDevices.enumerateDevices().then(a => a.some(a => "videoinput" === a.kind)).catch(() => !1);
  }

  constructor(a, c, b = e.DEFAULT_CANVAS_SIZE) {
    this.$video = a;
    this.$canvas = document.createElement("canvas");
    this._onDecode = c;
    this._paused = this._active = !1;
    this.$canvas.width = b;
    this.$canvas.height = b;
    this._sourceRect = {
      x: 0,
      y: 0,
      width: b,
      height: b
    };
    this._onCanPlay = this._onCanPlay.bind(this);
    this._onPlay = this._onPlay.bind(this);
    this._onVisibilityChange = this._onVisibilityChange.bind(this);
    this.$video.addEventListener("canplay", this._onCanPlay);
    this.$video.addEventListener("play", this._onPlay);
    document.addEventListener("visibilitychange", this._onVisibilityChange);
    this._qrWorker = new Worker(e.WORKER_PATH);
  }

  destroy() {
    this.$video.removeEventListener("canplay", this._onCanPlay);
    this.$video.removeEventListener("play", this._onPlay);
    document.removeEventListener("visibilitychange", this._onVisibilityChange);
    this.stop();

    this._qrWorker.postMessage({
      type: "close"
    });
  }

  start() {
    if (this._active && !this._paused) return Promise.resolve();
    "https:" !== window.location.protocol && console.warn("The camera stream is only accessible if the page is transferred via https.");
    this._active = !0;
    this._paused = !1;
    if (document.hidden) return Promise.resolve();
    clearTimeout(this._offTimeout);
    this._offTimeout = null;
    if (this.$video.srcObject) return this.$video.play(), Promise.resolve();
    let a = "environment";
    return this._getCameraStream("environment", !0).catch(() => {
      a = "user";
      return this._getCameraStream();
    }).then(c => {
      this.$video.srcObject = c;

      this._setVideoMirror(a);
    }).catch(a => {
      this._active = !1;
      throw a;
    });
  }

  stop() {
    this.pause();
    this._active = !1;
  }

  pause() {
    this._paused = !0;
    this._active && (this.$video.pause(), this._offTimeout || (this._offTimeout = setTimeout(() => {
      let a = this.$video.srcObject && this.$video.srcObject.getTracks()[0];
      a && (a.stop(), this._offTimeout = this.$video.srcObject = null);
    }, 300)));
  }

  static scanImage(a, c = null, b = null, d = null, f = !1, g = !1) {
    let h = !1,
        l = new Promise((l, g) => {
      b || (b = new Worker(e.WORKER_PATH), h = !0, b.postMessage({
        type: "inversionMode",
        data: "both"
      }));
      let n, m, k;

      m = a => {
        "qrResult" === a.data.type && (b.removeEventListener("message", m), b.removeEventListener("error", k), clearTimeout(n), null !== a.data.data ? l(a.data.data) : g("QR code not found."));
      };

      k = a => {
        b.removeEventListener("message", m);
        b.removeEventListener("error", k);
        clearTimeout(n);
        g("Scanner error: " + (a ? a.message || a : "Unknown Error"));
      };

      b.addEventListener("message", m);
      b.addEventListener("error", k);
      n = setTimeout(() => k("timeout"), 3E3);

      e._loadImage(a).then(a => {
        a = e._getImageData(a, c, d, f);
        b.postMessage({
          type: "decode",
          data: a
        }, [a.data.buffer]);
      }).catch(k);
    });
    c && g && (l = l.catch(() => e.scanImage(a, null, b, d, f)));
    return l = l.finally(() => {
      h && b.postMessage({
        type: "close"
      });
    });
  }

  setGrayscaleWeights(a, c, b, d = !0) {
    this._qrWorker.postMessage({
      type: "grayscaleWeights",
      data: {
        red: a,
        green: c,
        blue: b,
        useIntegerApproximation: d
      }
    });
  }

  setInversionMode(a) {
    this._qrWorker.postMessage({
      type: "inversionMode",
      data: a
    });
  }

  _onCanPlay() {
    this._updateSourceRect();

    this.$video.play();
  }

  _onPlay() {
    this._updateSourceRect();

    this._scanFrame();
  }

  _onVisibilityChange() {
    document.hidden ? this.pause() : this._active && this.start();
  }

  _updateSourceRect() {
    let a = Math.round(2 / 3 * Math.min(this.$video.videoWidth, this.$video.videoHeight));
    this._sourceRect.width = this._sourceRect.height = a;
    this._sourceRect.x = (this.$video.videoWidth - a) / 2;
    this._sourceRect.y = (this.$video.videoHeight - a) / 2;
  }

  _scanFrame() {
    if (!this._active || this.$video.paused || this.$video.ended) return !1;
    requestAnimationFrame(() => {
      e.scanImage(this.$video, this._sourceRect, this._qrWorker, this.$canvas, !0).then(this._onDecode, a => {
        this._active && "QR code not found." !== a && console.error(a);
      }).then(() => this._scanFrame());
    });
  }

  _getCameraStream(a, c = !1) {
    let b = [{
      width: {
        min: 1024
      }
    }, {
      width: {
        min: 768
      }
    }, {}];
    a && (c && (a = {
      exact: a
    }), b.forEach(b => b.facingMode = a));
    return this._getMatchingCameraStream(b);
  }

  _getMatchingCameraStream(a) {
    return 0 === a.length ? Promise.reject("Camera not found.") : navigator.mediaDevices.getUserMedia({
      video: a.shift()
    }).catch(() => this._getMatchingCameraStream(a));
  }

  _setVideoMirror(a) {
    this.$video.style.transform = "scaleX(" + ("user" === a ? -1 : 1) + ")";
  }

  static _getImageData(a, c = null, b = null, d = !1) {
    b = b || document.createElement("canvas");
    let f = c && c.x ? c.x : 0,
        g = c && c.y ? c.y : 0,
        h = c && c.width ? c.width : a.width || a.videoWidth;
    c = c && c.height ? c.height : a.height || a.videoHeight;
    d || b.width === h && b.height === c || (b.width = h, b.height = c);
    d = b.getContext("2d", {
      alpha: !1
    });
    d.imageSmoothingEnabled = !1;
    d.drawImage(a, f, g, h, c, 0, 0, b.width, b.height);
    return d.getImageData(0, 0, b.width, b.height);
  }

  static _loadImage(a) {
    if (a instanceof HTMLCanvasElement || a instanceof HTMLVideoElement || window.ImageBitmap && a instanceof window.ImageBitmap || window.OffscreenCanvas && a instanceof window.OffscreenCanvas) return Promise.resolve(a);
    if (a instanceof Image) return e._awaitImageLoad(a).then(() => a);

    if (a instanceof File || a instanceof URL || "string" === typeof a) {
      let c = new Image();
      c.src = a instanceof File ? URL.createObjectURL(a) : a;
      return e._awaitImageLoad(c).then(() => {
        a instanceof File && URL.revokeObjectURL(c.src);
        return c;
      });
    }

    return Promise.reject("Unsupported image type.");
  }

  static _awaitImageLoad(a) {
    return new Promise((c, b) => {
      if (a.complete && 0 !== a.naturalWidth) c();else {
        let d, f;

        d = () => {
          a.removeEventListener("load", d);
          a.removeEventListener("error", f);
          c();
        };

        f = () => {
          a.removeEventListener("load", d);
          a.removeEventListener("error", f);
          b("Image load error");
        };

        a.addEventListener("load", d);
        a.addEventListener("error", f);
      }
    });
  }

}

e.DEFAULT_CANVAS_SIZE = 400;
e.WORKER_PATH = "qr-scanner-worker.min.js";
var _default = e;
exports.default = _default;
},{}],"index.js":[function(require,module,exports) {
"use strict";

var _qrScanner = _interopRequireDefault(require("qr-scanner"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var video = document.getElementById("preview");
var qrScanner = new _qrScanner.default(video, function (result) {
  return console.log(result);
});
},{"qr-scanner":"node_modules/qr-scanner/qr-scanner.min.js"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "41399" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/qrcode-reader.e31bb0bc.js.map