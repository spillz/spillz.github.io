// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (modules, entry, mainEntry, parcelRequireName, globalName) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
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

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        this
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      var res = localRequire.resolve(x);
      return res === false ? {} : newRequire(res);
    }

    function resolve(x) {
      var id = modules[name][1][x];
      return id != null ? id : x;
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
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  Object.defineProperty(newRequire, 'root', {
    get: function () {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        return mainExports;
      });

      // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }
})({"kH4kW":[function(require,module,exports) {
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SECURE = false;
var HMR_ENV_HASH = "d6ea1d42532a7575";
module.bundle.HMR_BUNDLE_ID = "f76c6955a998808b";
"use strict";
/* global HMR_HOST, HMR_PORT, HMR_ENV_HASH, HMR_SECURE, chrome, browser, globalThis, __parcel__import__, __parcel__importScripts__, ServiceWorkerGlobalScope */ /*::
import type {
  HMRAsset,
  HMRMessage,
} from '@parcel/reporter-dev-server/src/HMRServer.js';
interface ParcelRequire {
  (string): mixed;
  cache: {|[string]: ParcelModule|};
  hotData: {|[string]: mixed|};
  Module: any;
  parent: ?ParcelRequire;
  isParcelRequire: true;
  modules: {|[string]: [Function, {|[string]: string|}]|};
  HMR_BUNDLE_ID: string;
  root: ParcelRequire;
}
interface ParcelModule {
  hot: {|
    data: mixed,
    accept(cb: (Function) => void): void,
    dispose(cb: (mixed) => void): void,
    // accept(deps: Array<string> | string, cb: (Function) => void): void,
    // decline(): void,
    _acceptCallbacks: Array<(Function) => void>,
    _disposeCallbacks: Array<(mixed) => void>,
  |};
}
interface ExtensionContext {
  runtime: {|
    reload(): void,
    getURL(url: string): string;
    getManifest(): {manifest_version: number, ...};
  |};
}
declare var module: {bundle: ParcelRequire, ...};
declare var HMR_HOST: string;
declare var HMR_PORT: string;
declare var HMR_ENV_HASH: string;
declare var HMR_SECURE: boolean;
declare var chrome: ExtensionContext;
declare var browser: ExtensionContext;
declare var __parcel__import__: (string) => Promise<void>;
declare var __parcel__importScripts__: (string) => Promise<void>;
declare var globalThis: typeof self;
declare var ServiceWorkerGlobalScope: Object;
*/ var OVERLAY_ID = "__parcel__error__overlay__";
var OldModule = module.bundle.Module;
function Module(moduleName) {
    OldModule.call(this, moduleName);
    this.hot = {
        data: module.bundle.hotData[moduleName],
        _acceptCallbacks: [],
        _disposeCallbacks: [],
        accept: function(fn) {
            this._acceptCallbacks.push(fn || function() {});
        },
        dispose: function(fn) {
            this._disposeCallbacks.push(fn);
        }
    };
    module.bundle.hotData[moduleName] = undefined;
}
module.bundle.Module = Module;
module.bundle.hotData = {};
var checkedAssets, assetsToDispose, assetsToAccept /*: Array<[ParcelRequire, string]> */ ;
function getHostname() {
    return HMR_HOST || (location.protocol.indexOf("http") === 0 ? location.hostname : "localhost");
}
function getPort() {
    return HMR_PORT || location.port;
} // eslint-disable-next-line no-redeclare
var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== "undefined") {
    var hostname = getHostname();
    var port = getPort();
    var protocol = HMR_SECURE || location.protocol == "https:" && !/localhost|127.0.0.1|0.0.0.0/.test(hostname) ? "wss" : "ws";
    var ws = new WebSocket(protocol + "://" + hostname + (port ? ":" + port : "") + "/"); // Web extension context
    var extCtx = typeof chrome === "undefined" ? typeof browser === "undefined" ? null : browser : chrome; // Safari doesn't support sourceURL in error stacks.
    // eval may also be disabled via CSP, so do a quick check.
    var supportsSourceURL = false;
    try {
        (0, eval)('throw new Error("test"); //# sourceURL=test.js');
    } catch (err) {
        supportsSourceURL = err.stack.includes("test.js");
    } // $FlowFixMe
    ws.onmessage = async function(event) {
        checkedAssets = {} /*: {|[string]: boolean|} */ ;
        assetsToAccept = [];
        assetsToDispose = [];
        var data = JSON.parse(event.data);
        if (data.type === "update") {
            // Remove error overlay if there is one
            if (typeof document !== "undefined") removeErrorOverlay();
            let assets = data.assets.filter((asset)=>asset.envHash === HMR_ENV_HASH); // Handle HMR Update
            let handled = assets.every((asset)=>{
                return asset.type === "css" || asset.type === "js" && hmrAcceptCheck(module.bundle.root, asset.id, asset.depsByBundle);
            });
            if (handled) {
                console.clear(); // Dispatch custom event so other runtimes (e.g React Refresh) are aware.
                if (typeof window !== "undefined" && typeof CustomEvent !== "undefined") window.dispatchEvent(new CustomEvent("parcelhmraccept"));
                await hmrApplyUpdates(assets); // Dispose all old assets.
                let processedAssets = {} /*: {|[string]: boolean|} */ ;
                for(let i = 0; i < assetsToDispose.length; i++){
                    let id = assetsToDispose[i][1];
                    if (!processedAssets[id]) {
                        hmrDispose(assetsToDispose[i][0], id);
                        processedAssets[id] = true;
                    }
                } // Run accept callbacks. This will also re-execute other disposed assets in topological order.
                processedAssets = {};
                for(let i = 0; i < assetsToAccept.length; i++){
                    let id = assetsToAccept[i][1];
                    if (!processedAssets[id]) {
                        hmrAccept(assetsToAccept[i][0], id);
                        processedAssets[id] = true;
                    }
                }
            } else fullReload();
        }
        if (data.type === "error") {
            // Log parcel errors to console
            for (let ansiDiagnostic of data.diagnostics.ansi){
                let stack = ansiDiagnostic.codeframe ? ansiDiagnostic.codeframe : ansiDiagnostic.stack;
                console.error("\uD83D\uDEA8 [parcel]: " + ansiDiagnostic.message + "\n" + stack + "\n\n" + ansiDiagnostic.hints.join("\n"));
            }
            if (typeof document !== "undefined") {
                // Render the fancy html overlay
                removeErrorOverlay();
                var overlay = createErrorOverlay(data.diagnostics.html); // $FlowFixMe
                document.body.appendChild(overlay);
            }
        }
    };
    ws.onerror = function(e) {
        console.error(e.message);
    };
    ws.onclose = function() {
        console.warn("[parcel] \uD83D\uDEA8 Connection to the HMR server was lost");
    };
}
function removeErrorOverlay() {
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
        overlay.remove();
        console.log("[parcel] ✨ Error resolved");
    }
}
function createErrorOverlay(diagnostics) {
    var overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    let errorHTML = '<div style="background: black; opacity: 0.85; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; font-family: Menlo, Consolas, monospace; z-index: 9999;">';
    for (let diagnostic of diagnostics){
        let stack = diagnostic.frames.length ? diagnostic.frames.reduce((p, frame)=>{
            return `${p}
<a href="/__parcel_launch_editor?file=${encodeURIComponent(frame.location)}" style="text-decoration: underline; color: #888" onclick="fetch(this.href); return false">${frame.location}</a>
${frame.code}`;
        }, "") : diagnostic.stack;
        errorHTML += `
      <div>
        <div style="font-size: 18px; font-weight: bold; margin-top: 20px;">
          🚨 ${diagnostic.message}
        </div>
        <pre>${stack}</pre>
        <div>
          ${diagnostic.hints.map((hint)=>"<div>\uD83D\uDCA1 " + hint + "</div>").join("")}
        </div>
        ${diagnostic.documentation ? `<div>📝 <a style="color: violet" href="${diagnostic.documentation}" target="_blank">Learn more</a></div>` : ""}
      </div>
    `;
    }
    errorHTML += "</div>";
    overlay.innerHTML = errorHTML;
    return overlay;
}
function fullReload() {
    if ("reload" in location) location.reload();
    else if (extCtx && extCtx.runtime && extCtx.runtime.reload) extCtx.runtime.reload();
}
function getParents(bundle, id) /*: Array<[ParcelRequire, string]> */ {
    var modules = bundle.modules;
    if (!modules) return [];
    var parents = [];
    var k, d, dep;
    for(k in modules)for(d in modules[k][1]){
        dep = modules[k][1][d];
        if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) parents.push([
            bundle,
            k
        ]);
    }
    if (bundle.parent) parents = parents.concat(getParents(bundle.parent, id));
    return parents;
}
function updateLink(link) {
    var newLink = link.cloneNode();
    newLink.onload = function() {
        if (link.parentNode !== null) // $FlowFixMe
        link.parentNode.removeChild(link);
    };
    newLink.setAttribute("href", link.getAttribute("href").split("?")[0] + "?" + Date.now()); // $FlowFixMe
    link.parentNode.insertBefore(newLink, link.nextSibling);
}
var cssTimeout = null;
function reloadCSS() {
    if (cssTimeout) return;
    cssTimeout = setTimeout(function() {
        var links = document.querySelectorAll('link[rel="stylesheet"]');
        for(var i = 0; i < links.length; i++){
            // $FlowFixMe[incompatible-type]
            var href = links[i].getAttribute("href");
            var hostname = getHostname();
            var servedFromHMRServer = hostname === "localhost" ? new RegExp("^(https?:\\/\\/(0.0.0.0|127.0.0.1)|localhost):" + getPort()).test(href) : href.indexOf(hostname + ":" + getPort());
            var absolute = /^https?:\/\//i.test(href) && href.indexOf(location.origin) !== 0 && !servedFromHMRServer;
            if (!absolute) updateLink(links[i]);
        }
        cssTimeout = null;
    }, 50);
}
function hmrDownload(asset) {
    if (asset.type === "js") {
        if (typeof document !== "undefined") {
            let script = document.createElement("script");
            script.src = asset.url + "?t=" + Date.now();
            if (asset.outputFormat === "esmodule") script.type = "module";
            return new Promise((resolve, reject)=>{
                var _document$head;
                script.onload = ()=>resolve(script);
                script.onerror = reject;
                (_document$head = document.head) === null || _document$head === void 0 || _document$head.appendChild(script);
            });
        } else if (typeof importScripts === "function") {
            // Worker scripts
            if (asset.outputFormat === "esmodule") return import(asset.url + "?t=" + Date.now());
            else return new Promise((resolve, reject)=>{
                try {
                    importScripts(asset.url + "?t=" + Date.now());
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        }
    }
}
async function hmrApplyUpdates(assets) {
    global.parcelHotUpdate = Object.create(null);
    let scriptsToRemove;
    try {
        // If sourceURL comments aren't supported in eval, we need to load
        // the update from the dev server over HTTP so that stack traces
        // are correct in errors/logs. This is much slower than eval, so
        // we only do it if needed (currently just Safari).
        // https://bugs.webkit.org/show_bug.cgi?id=137297
        // This path is also taken if a CSP disallows eval.
        if (!supportsSourceURL) {
            let promises = assets.map((asset)=>{
                var _hmrDownload;
                return (_hmrDownload = hmrDownload(asset)) === null || _hmrDownload === void 0 ? void 0 : _hmrDownload.catch((err)=>{
                    // Web extension bugfix for Chromium
                    // https://bugs.chromium.org/p/chromium/issues/detail?id=1255412#c12
                    if (extCtx && extCtx.runtime && extCtx.runtime.getManifest().manifest_version == 3) {
                        if (typeof ServiceWorkerGlobalScope != "undefined" && global instanceof ServiceWorkerGlobalScope) {
                            extCtx.runtime.reload();
                            return;
                        }
                        asset.url = extCtx.runtime.getURL("/__parcel_hmr_proxy__?url=" + encodeURIComponent(asset.url + "?t=" + Date.now()));
                        return hmrDownload(asset);
                    }
                    throw err;
                });
            });
            scriptsToRemove = await Promise.all(promises);
        }
        assets.forEach(function(asset) {
            hmrApply(module.bundle.root, asset);
        });
    } finally{
        delete global.parcelHotUpdate;
        if (scriptsToRemove) scriptsToRemove.forEach((script)=>{
            if (script) {
                var _document$head2;
                (_document$head2 = document.head) === null || _document$head2 === void 0 || _document$head2.removeChild(script);
            }
        });
    }
}
function hmrApply(bundle, asset) {
    var modules = bundle.modules;
    if (!modules) return;
    if (asset.type === "css") reloadCSS();
    else if (asset.type === "js") {
        let deps = asset.depsByBundle[bundle.HMR_BUNDLE_ID];
        if (deps) {
            if (modules[asset.id]) {
                // Remove dependencies that are removed and will become orphaned.
                // This is necessary so that if the asset is added back again, the cache is gone, and we prevent a full page reload.
                let oldDeps = modules[asset.id][1];
                for(let dep in oldDeps)if (!deps[dep] || deps[dep] !== oldDeps[dep]) {
                    let id = oldDeps[dep];
                    let parents = getParents(module.bundle.root, id);
                    if (parents.length === 1) hmrDelete(module.bundle.root, id);
                }
            }
            if (supportsSourceURL) // Global eval. We would use `new Function` here but browser
            // support for source maps is better with eval.
            (0, eval)(asset.output);
             // $FlowFixMe
            let fn = global.parcelHotUpdate[asset.id];
            modules[asset.id] = [
                fn,
                deps
            ];
        } else if (bundle.parent) hmrApply(bundle.parent, asset);
    }
}
function hmrDelete(bundle, id) {
    let modules = bundle.modules;
    if (!modules) return;
    if (modules[id]) {
        // Collect dependencies that will become orphaned when this module is deleted.
        let deps = modules[id][1];
        let orphans = [];
        for(let dep in deps){
            let parents = getParents(module.bundle.root, deps[dep]);
            if (parents.length === 1) orphans.push(deps[dep]);
        } // Delete the module. This must be done before deleting dependencies in case of circular dependencies.
        delete modules[id];
        delete bundle.cache[id]; // Now delete the orphans.
        orphans.forEach((id)=>{
            hmrDelete(module.bundle.root, id);
        });
    } else if (bundle.parent) hmrDelete(bundle.parent, id);
}
function hmrAcceptCheck(bundle, id, depsByBundle) {
    if (hmrAcceptCheckOne(bundle, id, depsByBundle)) return true;
     // Traverse parents breadth first. All possible ancestries must accept the HMR update, or we'll reload.
    let parents = getParents(module.bundle.root, id);
    let accepted = false;
    while(parents.length > 0){
        let v = parents.shift();
        let a = hmrAcceptCheckOne(v[0], v[1], null);
        if (a) // If this parent accepts, stop traversing upward, but still consider siblings.
        accepted = true;
        else {
            // Otherwise, queue the parents in the next level upward.
            let p = getParents(module.bundle.root, v[1]);
            if (p.length === 0) {
                // If there are no parents, then we've reached an entry without accepting. Reload.
                accepted = false;
                break;
            }
            parents.push(...p);
        }
    }
    return accepted;
}
function hmrAcceptCheckOne(bundle, id, depsByBundle) {
    var modules = bundle.modules;
    if (!modules) return;
    if (depsByBundle && !depsByBundle[bundle.HMR_BUNDLE_ID]) {
        // If we reached the root bundle without finding where the asset should go,
        // there's nothing to do. Mark as "accepted" so we don't reload the page.
        if (!bundle.parent) return true;
        return hmrAcceptCheck(bundle.parent, id, depsByBundle);
    }
    if (checkedAssets[id]) return true;
    checkedAssets[id] = true;
    var cached = bundle.cache[id];
    assetsToDispose.push([
        bundle,
        id
    ]);
    if (!cached || cached.hot && cached.hot._acceptCallbacks.length) {
        assetsToAccept.push([
            bundle,
            id
        ]);
        return true;
    }
}
function hmrDispose(bundle, id) {
    var cached = bundle.cache[id];
    bundle.hotData[id] = {};
    if (cached && cached.hot) cached.hot.data = bundle.hotData[id];
    if (cached && cached.hot && cached.hot._disposeCallbacks.length) cached.hot._disposeCallbacks.forEach(function(cb) {
        cb(bundle.hotData[id]);
    });
    delete bundle.cache[id];
}
function hmrAccept(bundle, id) {
    // Execute the module.
    bundle(id); // Run the accept callbacks in the new version of the module.
    var cached = bundle.cache[id];
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) cached.hot._acceptCallbacks.forEach(function(cb) {
        var assetsToAlsoAccept = cb(function() {
            return getParents(module.bundle.root, id);
        });
        if (assetsToAlsoAccept && assetsToAccept.length) {
            assetsToAlsoAccept.forEach(function(a) {
                hmrDispose(a[0], a[1]);
            }); // $FlowFixMe[method-unbinding]
            assetsToAccept.push.apply(assetsToAccept, assetsToAlsoAccept);
        }
    });
}

},{}],"edeGs":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "gameConfig", ()=>gameConfig);
parcelHelpers.export(exports, "setupLevel", ()=>setupLevel);
parcelHelpers.export(exports, "numTurnsParForCurrentMap", ()=>numTurnsParForCurrentMap);
parcelHelpers.export(exports, "advanceToWin", ()=>advanceToWin);
parcelHelpers.export(exports, "setSoundVolume", ()=>setSoundVolume);
parcelHelpers.export(exports, "setVolumeMute", ()=>setVolumeMute);
parcelHelpers.export(exports, "setGuardMute", ()=>setGuardMute);
//TODO: should do some runtime type checking here to validate what's being written
parcelHelpers.export(exports, "getStat", ()=>getStat);
parcelHelpers.export(exports, "setStat", ()=>setStat);
parcelHelpers.export(exports, "loadStats", ()=>loadStats);
parcelHelpers.export(exports, "saveStats", ()=>saveStats);
parcelHelpers.export(exports, "zoomIn", ()=>zoomIn);
parcelHelpers.export(exports, "zoomOut", ()=>zoomOut);
parcelHelpers.export(exports, "restartGame", ()=>restartGame);
parcelHelpers.export(exports, "statusBarZoom", ()=>statusBarZoom);
parcelHelpers.export(exports, "getCurrentDateFormatted", ()=>getCurrentDateFormatted);
var _myMatrix = require("./my-matrix");
var _createMap = require("./create-map");
var _gameMap = require("./game-map");
var _animation = require("./animation");
var _guard = require("./guard");
var _render = require("./render");
var _random = require("./random");
var _tilesets = require("./tilesets");
var _audio = require("./audio");
var _popups = require("./popups");
var _controllers = require("./controllers");
var _ui = require("./ui");
var _types = require("./types");
var _colorPreset = require("./color-preset");
const gameConfig = {
    numGameMaps: 10,
    totalGameLoot: 100
};
let NoiseType;
(function(NoiseType) {
    NoiseType[NoiseType["Creak"] = 0] = "Creak";
    NoiseType[NoiseType["Splash"] = 1] = "Splash";
    NoiseType[NoiseType["Thud"] = 2] = "Thud";
    NoiseType[NoiseType["BangDoor"] = 3] = "BangDoor";
    NoiseType[NoiseType["BangChair"] = 4] = "BangChair";
})(NoiseType || (NoiseType = {}));
let StepType;
(function(StepType) {
    StepType[StepType["Normal"] = 0] = "Normal";
    StepType[StepType["AttemptedLeap"] = 1] = "AttemptedLeap";
})(StepType || (StepType = {}));
const debugInitialLevel = 0; // set to non-zero to test level generation
const debugSeeAll = false; // initial value for see-all cheat code
const tileSet = (0, _tilesets.getTileSet)();
const fontTileSet = (0, _tilesets.getFontTileSet)();
const canvas = document.querySelector("canvas");
let canvasSizeX = canvas.clientWidth;
let canvasSizeY = canvas.clientHeight;
window.onload = loadResourcesThenRun;
const statusBarCharPixelSizeX = 8;
const statusBarCharPixelSizeY = 16;
//TODO: The constants live in the tileset and code should reference the tileset
const pixelsPerTileX = 16; // width of unzoomed tile
const pixelsPerTileY = 16; // height of unzoomed tile
const zoomPower = 1.1892;
const initZoomLevel = 4;
const minZoomLevel = -4;
const maxZoomLevel = 16;
const leapPrompt = "Shift+Move: Leap/Run";
function loadResourcesThenRun() {
    Promise.all([
        loadImage(fontTileSet.imageSrc, fontTileSet.image),
        loadImage(tileSet.imageSrc, tileSet.image)
    ]).then(main);
}
function main(images) {
    document.body.addEventListener("keydown", (e)=>ensureInitSound());
    canvas.addEventListener("mousedown", (e)=>ensureInitSound());
    canvas.addEventListener("touchstart", (e)=>ensureInitSound());
    window.addEventListener("gamepadconnected", (e)=>ensureInitSound());
    const renderer = new (0, _render.Renderer)(canvas, tileSet, fontTileSet);
    const sounds = {};
    const subtitledSounds = {};
    const activeSoundPool = new (0, _audio.ActiveHowlPool)();
    const touchController = new (0, _controllers.TouchController)(canvas);
    const state = initState(sounds, subtitledSounds, activeSoundPool, touchController);
    function ensureInitSound() {
        if (Object.keys(state.sounds).length == 0) {
            (0, _audio.setupSounds)(state.sounds, state.subtitledSounds, state.activeSoundPool);
            // Set Howler volume and mutes from game state
            (0, _audio.Howler).volume(state.soundVolume);
            (0, _audio.Howler).mute(state.volumeMute);
            for(const s in state.subtitledSounds)state.subtitledSounds[s].mute = state.guardMute;
        }
    }
    function requestUpdateAndRender() {
        requestAnimationFrame((now)=>updateAndRender(now, renderer, state));
    }
    const observer = new ResizeObserver((entries)=>{
        canvasSizeX = canvas.clientWidth;
        canvasSizeY = canvas.clientHeight;
        state.camera.snapped = false;
    });
    observer.observe(canvas);
    requestUpdateAndRender();
}
function updateControllerState(state) {
    state.gamepadManager.updateGamepadStates();
    if ((0, _controllers.lastController) !== null) {
        if (state.gameMode == (0, _types.GameMode).Mansion) onControlsInMansion((0, _controllers.lastController));
        else state.textWindows[state.gameMode]?.onControls(state, menuActivated);
        state.touchController.endFrame();
        state.keyboardController.endFrame();
        for(const g in state.gamepadManager.gamepads)state.gamepadManager.gamepads[g].endFrame();
    }
    function activated(action) {
        const dt = Date.now();
        let result = false;
        if ((0, _controllers.lastController) === null) return false;
        const controlStates = (0, _controllers.lastController).controlStates;
        if (!(action in controlStates)) return false;
        const threshold = state.keyRepeatActive === action ? state.keyRepeatRate : state.keyRepeatDelay;
        result = (0, _controllers.lastController).currentFramePresses.has(action) || controlStates[action] && dt - (0, _controllers.lastController).controlTimes[action] > threshold;
        if (result) {
            if (controlStates[action] && dt - (0, _controllers.lastController).controlTimes[action] > threshold) state.keyRepeatActive = action;
            (0, _controllers.lastController).controlTimes[action] = dt;
        }
        if (!controlStates[action] && state.keyRepeatActive === action) state.keyRepeatActive = undefined;
        return result;
    }
    function menuActivated(action) {
        //same as activated but no repeating, which is better for menus
        let result = false;
        if ((0, _controllers.lastController) === null) return false;
        const controlStates = (0, _controllers.lastController).controlStates;
        if (!(action in controlStates)) return false;
        result = (0, _controllers.lastController).currentFramePresses.has(action);
        if (result) (0, _controllers.lastController).controlTimes[action], Date.now();
        return result;
    }
    function onControlsInMansion(controller) {
        if (controller.controlStates["panLeft"]) {
            state.camera.panning = true;
            state.camera.position[0] -= 1 / state.camera.zoom;
        }
        if (controller.controlStates["panRight"]) {
            state.camera.panning = true;
            state.camera.position[0] += 1 / state.camera.zoom;
        }
        if (controller.controlStates["panUp"]) {
            state.camera.panning = true;
            state.camera.position[1] += 1 / state.camera.zoom;
        }
        if (controller.controlStates["panDown"]) {
            state.camera.panning = true;
            state.camera.position[1] -= 1 / state.camera.zoom;
        }
        if (controller.controlStates["snapToPlayer"]) state.camera.panning = false;
        if (activated("left")) {
            if (state.leapToggleActive !== controller.controlStates["jump"]) tryPlayerLeap(state, -1, 0);
            else tryPlayerStep(state, -1, 0, StepType.Normal);
        } else if (activated("right")) {
            if (state.leapToggleActive !== controller.controlStates["jump"]) tryPlayerLeap(state, 1, 0);
            else tryPlayerStep(state, 1, 0, StepType.Normal);
        } else if (activated("down")) {
            if (state.leapToggleActive !== controller.controlStates["jump"]) tryPlayerLeap(state, 0, -1);
            else tryPlayerStep(state, 0, -1, StepType.Normal);
        } else if (activated("up")) {
            if (state.leapToggleActive !== controller.controlStates["jump"]) tryPlayerLeap(state, 0, 1);
            else tryPlayerStep(state, 0, 1, StepType.Normal);
        } else if (activated("wait")) tryPlayerWait(state);
        else if (activated("menu")) {
            if (state.player.health > 0) {
                state.gameMode = (0, _types.GameMode).HomeScreen;
                state.hasOpenedMenu = true;
            } else state.gameMode = (0, _types.GameMode).Dead;
        } else if (activated("jumpToggle")) state.leapToggleActive = !state.leapToggleActive;
        else if (activated("seeAll")) state.seeAll = !state.seeAll;
        else if (activated("collectLoot")) {
            const loot = state.gameMap.collectAllLoot();
            state.player.loot += loot;
            state.lootStolen += loot;
            postTurn(state);
        } else if (activated("forceRestart")) {
            state.rng = new (0, _random.RNG)();
            state.dailyRun = null;
            restartGame(state);
        } else if (activated("nextLevel")) {
            if (state.level < state.gameMapRoughPlans.length - 1) {
                scoreCompletedLevel(state);
                setupLevel(state, state.level + 1);
            }
        } else if (activated("resetState")) resetState(state);
        else if (activated("prevLevel")) {
            if (state.level > 0) {
                scoreCompletedLevel(state);
                setupLevel(state, state.level - 1);
            }
        } else if (activated("guardSight")) state.seeGuardSight = !state.seeGuardSight;
        else if (activated("guardPatrols")) state.seeGuardPatrols = !state.seeGuardPatrols;
        else if (activated("markSeen")) {
            state.gameMap.markAllSeen();
            postTurn(state);
        } else if (activated("zoomIn")) zoomIn(state);
        else if (activated("zoomOut")) zoomOut(state);
        else if (activated("seeAll")) state.seeAll = !state.seeAll;
        else if (activated("guardMute")) setGuardMute(state, !state.guardMute);
        else if (activated("volumeMute")) setVolumeMute(state, !state.volumeMute);
        else if (activated("volumeDown")) {
            const soundVolume = Math.max(0.1, state.soundVolume - 0.1);
            setSoundVolume(state, soundVolume);
        } else if (activated("volumeUp")) {
            const soundVolume = Math.min(1.0, state.soundVolume + 0.1);
            setSoundVolume(state, soundVolume);
        } else if (activated("showSpeech")) state.popups.currentPopupTimeRemaining = 2.0;
    }
}
function scoreCompletedLevel(state) {
    if (state.gameMapRoughPlans[state.level].played) return;
    state.gameMapRoughPlans[state.level].played = true;
    const ghosted = state.levelStats.numSpottings === 0;
    const numTurnsPar = numTurnsParForCurrentMap(state);
    const timeBonus = Math.max(0, numTurnsPar - state.turns);
    const lootScore = state.lootStolen * 10;
    const ghostBonus = ghosted ? lootScore : 0;
    const score = lootScore + timeBonus + ghostBonus;
    state.gameStats.totalScore += score;
    state.gameStats.turns += state.totalTurns;
    state.gameStats.numLevels = state.gameMapRoughPlans.length;
    state.gameStats.numCompletedLevels = state.level + 1;
    state.gameStats.numGhostedLevels += ghosted ? 1 : 0;
    state.gameStats.daily = state.dailyRun;
    state.gameStats.timeEnded = Date.now();
}
function scoreIncompleteLevel(state) {
    if (state.gameMapRoughPlans[state.level].played) return;
    state.gameMapRoughPlans[state.level].played = true;
    const score = state.lootStolen * 10;
    state.gameStats.totalScore += score;
    state.gameStats.turns += state.totalTurns;
    state.gameStats.numLevels = state.gameMapRoughPlans.length;
    state.gameStats.numCompletedLevels = state.level;
    state.gameStats.daily = state.dailyRun;
    state.gameStats.timeEnded = Date.now();
}
function clearLevelStats(levelStats) {
    levelStats.numKnockouts = 0;
    levelStats.numSpottings = 0;
    levelStats.damageTaken = 0;
}
function setupLevel(state, level) {
    state.level = level;
    if (state.level >= gameConfig.numGameMaps) {
        restartGame(state);
        return;
    }
    state.activeSoundPool.empty();
    state.gameMap = (0, _createMap.createGameMap)(state.level, state.gameMapRoughPlans[state.level]);
    state.lightStates = new Array(state.gameMap.lightCount).fill(0);
    setLights(state.gameMap, state);
    setCellAnimations(state.gameMap, state);
    state.topStatusMessage = "";
    state.topStatusMessageSticky = false;
    state.topStatusMessageAnim = 0;
    state.finishedLevel = false;
    state.turns = 0;
    state.lootStolen = 0;
    state.lootAvailable = state.gameMapRoughPlans[state.level].totalLoot;
    clearLevelStats(state.levelStats);
    state.player.pos = state.gameMap.playerStartPos;
    state.player.dir = (0, _myMatrix.vec2).fromValues(0, -1);
    state.player.noisy = false;
    state.player.hasVaultKey = false;
    state.player.damagedLastTurn = false;
    state.player.turnsRemainingUnderwater = (0, _gameMap.maxPlayerTurnsUnderwater);
    state.player.animation = null;
    state.popups.reset();
    state.camera = createCamera(state.gameMap.playerStartPos, state.zoomLevel);
    state.camera.zoomed = level !== 0;
    state.gameMode = (0, _types.GameMode).Mansion;
    (0, _guard.chooseGuardMoves)(state);
    postTurn(state);
//    analyzeLevel(state);
}
function analyzeLevel(state) {
    const numDiscoverableCells = state.gameMap.numCells() - state.gameMap.numPreRevealedCells;
    const numGuards = state.gameMap.guards.length;
    const guardsPerCell = numGuards / numDiscoverableCells;
    const turnsForDiscovery = numDiscoverableCells / 3;
    const turnsForGuardAvoidance = 8 * numGuards + 800 * guardsPerCell;
    const par = 10 * Math.ceil((turnsForDiscovery + turnsForGuardAvoidance) / 10);
    console.log("Level:", state.level);
    console.log("Discoverable cells:", numDiscoverableCells);
    console.log("Number of guards:", numGuards);
    console.log("Guards per cell:", guardsPerCell);
    console.log("Turns for discovery:", turnsForDiscovery);
    console.log("Turns for guards:", turnsForGuardAvoidance);
    console.log("Par:", par);
}
function numTurnsParForCurrentMap(state) {
    const numDiscoverableCells = state.gameMap.numCells() - state.gameMap.numPreRevealedCells;
    const numGuards = state.gameMap.guards.length;
    const guardsPerCell = numGuards / numDiscoverableCells;
    const turnsForDiscovery = numDiscoverableCells / 3;
    const turnsForGuardAvoidance = 8 * numGuards + 1000 * guardsPerCell;
    const par = 10 * Math.ceil((turnsForDiscovery + turnsForGuardAvoidance) / 10);
    return par;
}
function advanceToMansionComplete(state) {
    scoreCompletedLevel(state);
    state.activeSoundPool.empty();
    state.sounds["levelCompleteJingle"].play(0.35);
    if (state.levelStats.numSpottings === 0) {
        state.persistedStats.totalGhosts++;
        setStat("totalGhosts", state.persistedStats.totalGhosts);
    }
    state.topStatusMessage = "";
    state.topStatusMessageSticky = false;
    state.topStatusMessageAnim = 0;
    state.gameMode = (0, _types.GameMode).MansionComplete;
}
function advanceToWin(state) {
    const victorySong = Math.random() < 0.1 ? "easterEgg" : "victorySong";
    state.sounds[victorySong].play(0.5);
    state.persistedStats.totalWins++;
    const score = state.gameStats.totalScore;
    state.persistedStats.bestScore = Math.max(state.persistedStats.bestScore, score);
    const scoreEntry = {
        score: score,
        date: getCurrentDateFormatted(),
        turns: state.totalTurns,
        level: state.level + 1
    };
    state.persistedStats.scores.push(scoreEntry);
    if (state.dailyRun) {
        state.persistedStats.currentDailyBestScore = Math.max(state.persistedStats.currentDailyBestScore, score);
        state.persistedStats.currentDailyWins++;
        state.persistedStats.currentDailyWinFirstTry = state.persistedStats.currentDailyPlays === 1 ? 1 : state.persistedStats.currentDailyWinFirstTry;
        state.persistedStats.lastPlayedDailyGame = structuredClone(state.gameStats);
        state.persistedStats.allDailyWins++;
        state.persistedStats.allDailyWinsFirstTry += state.persistedStats.currentDailyPlays === 1 ? 1 : 0;
    //TODO: notify user if the game was finished after the deadline
    // if(state.dailyRun===getCurrentDateFormatted()) state.scoreServer.addScore(score, state.totalTurns, state.level+1);
    }
    saveStats(state.persistedStats);
    state.gameMode = (0, _types.GameMode).Win;
}
function collectLoot(state, pos, posFlyToward) {
    const itemsCollected = state.gameMap.collectLootAt(pos);
    if (itemsCollected.length === 0) return false;
    let coinCollected = false;
    let healthCollected = false;
    for (const item of itemsCollected){
        if (item.type === (0, _gameMap.ItemType).Coin) {
            ++state.player.loot;
            ++state.lootStolen;
            coinCollected = true;
        } else if (item.type === (0, _gameMap.ItemType).Health) {
            state.player.health = Math.min((0, _gameMap.maxPlayerHealth), state.player.health + 1);
            healthCollected = true;
        }
        const pt0 = (0, _myMatrix.vec2).create();
        const pt2 = (0, _myMatrix.vec2).fromValues(posFlyToward[0] - item.pos[0], posFlyToward[1] - item.pos[1]);
        const pt1 = pt2.scale(0.3333).add((0, _myMatrix.vec2).fromValues(0, 0.5));
        const animation = new (0, _animation.SpriteAnimation)([
            {
                pt0: pt0,
                pt1: pt1,
                duration: 0.1,
                fn: (0, _animation.tween).easeOutQuad
            },
            {
                pt0: pt1,
                pt1: pt2,
                duration: 0.1,
                fn: (0, _animation.tween).easeInQuad
            }
        ], [
            tileSet.itemTiles[item.type],
            tileSet.itemTiles[item.type]
        ]);
        animation.removeOnFinish = true;
        item.animation = animation;
        state.particles.push(item);
    }
    if (coinCollected) state.sounds.coin.play(1.0);
    healthCollected;
    return true;
}
function canStepToPos(state, pos) {
    // Cannot step off map if level is unfinished
    if (pos[0] < 0 || pos[0] >= state.gameMap.cells.sizeX || pos[1] < 0 || pos[1] >= state.gameMap.cells.sizeY) {
        if (!state.finishedLevel) return false;
    }
    // Cannot step onto walls or windows
    const cellNew = state.gameMap.cells.atVec(pos);
    if (cellNew.blocksPlayerMove) return false;
    if (isOneWayWindowTerrainType(cellNew.type)) return false;
    // Cannot step onto torches or portcullises
    for (const item of state.gameMap.items.filter((item)=>item.pos.equals(pos)))switch(item.type){
        case (0, _gameMap.ItemType).DrawersShort:
        case (0, _gameMap.ItemType).TorchUnlit:
        case (0, _gameMap.ItemType).TorchLit:
        case (0, _gameMap.ItemType).PortcullisEW:
        case (0, _gameMap.ItemType).PortcullisNS:
            return false;
    }
    // Cannot step onto guards
    if (state.gameMap.guards.find((guard)=>guard.pos.equals(pos))) return false;
    return true;
}
function canLeapToPosDisregardingGuard(state, pos) {
    // Cannot leap off map if level is unfinished
    if (pos[0] < 0 || pos[0] >= state.gameMap.cells.sizeX || pos[1] < 0 || pos[1] >= state.gameMap.cells.sizeY) {
        if (!state.finishedLevel) return false;
    }
    // Cannot leap onto a wall, window, portcullis, or door
    const cellNew = state.gameMap.cells.atVec(pos);
    if (cellNew.blocksPlayerMove) return false;
    if (isOneWayWindowTerrainType(cellNew.type)) return false;
    if (cellNew.type === (0, _gameMap.TerrainType).PortcullisNS || cellNew.type === (0, _gameMap.TerrainType).PortcullisEW) return false;
    if ((cellNew.type === (0, _gameMap.TerrainType).DoorNS || cellNew.type === (0, _gameMap.TerrainType).DoorEW) && state.gameMap.items.find((item)=>item.pos.equals(pos) && (0, _gameMap.isDoorItemType)(item.type))) return false;
    // Cannot leap onto a blocking item
    if (state.gameMap.items.find((item)=>item.pos.equals(pos) && !canLeapOntoItemType(item.type))) return false;
    return true;
}
function canLeapToPos(state, pos) {
    if (!canLeapToPosDisregardingGuard(state, pos)) return false;
    // Cannot leap onto a stationary guard
    if (state.gameMap.guards.find((guard)=>guard.pos.equals(pos) && !guard.allowsMoveOntoFrom(state.player.pos))) return false;
    return true;
}
function playMoveSound(state, cellOld, cellNew) {
    // Hide sound effect
    if (cellNew.hidesPlayer) {
        state.sounds["hide"].play(0.2);
        return;
    }
    // Water exit sound
    const volScale = 0.5 + Math.random() / 2;
    const changedTile = cellOld.type !== cellNew.type;
    if (changedTile) {
        if (cellOld.type === (0, _gameMap.TerrainType).GroundWater) {
            state.sounds["waterExit"].play(0.5 * volScale);
            return;
        } else if (cellNew.type === (0, _gameMap.TerrainType).GroundWater) {
            state.sounds["waterEnter"].play(0.5 * volScale);
            return;
        }
    }
    // Terrain sound effects
    switch(cellNew.type){
        case (0, _gameMap.TerrainType).GroundWoodCreaky:
            state.sounds["footstepCreaky"].play(0.15 * volScale);
            break;
        case (0, _gameMap.TerrainType).GroundWood:
            if (changedTile || Math.random() > 0.9) state.sounds["footstepWood"].play(0.15 * volScale);
            break;
        case (0, _gameMap.TerrainType).GroundNormal:
            if (changedTile || Math.random() > 0.5) state.sounds["footstepGravel"].play(0.03 * volScale);
            break;
        case (0, _gameMap.TerrainType).GroundGrass:
            if (changedTile || Math.random() > 0.75) state.sounds["footstepGrass"].play(0.05 * volScale);
            break;
        case (0, _gameMap.TerrainType).GroundWater:
            if (changedTile || Math.random() > 0.6) state.sounds["footstepWater"].play(0.02 * volScale);
            break;
        case (0, _gameMap.TerrainType).GroundMarble:
            if (changedTile || Math.random() > 0.8) state.sounds["footstepTile"].play(0.05 * volScale);
            break;
        case (0, _gameMap.TerrainType).GroundVault:
            if (changedTile || Math.random() > 0.8) state.sounds["footstepTile"].play(0.05 * volScale);
            break;
        default:
            if (changedTile || Math.random() > 0.8) state.sounds["footstepTile"].play(0.02 * volScale);
            break;
    }
}
function bumpAnim(state, dx, dy) {
    const pos0 = (0, _myMatrix.vec2).create();
    const pos1 = (0, _myMatrix.vec2).fromValues(dx / 4, dy / 4);
    state.player.animation = new (0, _animation.SpriteAnimation)([
        {
            pt0: pos0,
            pt1: pos1,
            duration: 0.05,
            fn: (0, _animation.tween).linear
        },
        {
            pt0: pos1,
            pt1: pos0,
            duration: 0.05,
            fn: (0, _animation.tween).linear
        }
    ], [
        tileSet.playerTiles.normal
    ]);
}
function bumpFail(state, dx, dy) {
    state.sounds["footstepTile"].play(0.1);
    bumpAnim(state, dx, dy);
}
function collectGuardLoot(state, player, guard, posNew, animDelay = 0) {
    let pickedItem = null;
    player.pickTarget = null;
    if (guard.hasPurse) {
        guard.hasPurse = false;
        player.loot += 1;
        state.lootStolen += 1;
        pickedItem = {
            pos: (0, _myMatrix.vec2).clone(guard.pos),
            type: (0, _gameMap.ItemType).Coin
        };
    }
    if (guard.hasVaultKey) {
        guard.hasVaultKey = false;
        player.hasVaultKey = true;
        pickedItem = {
            pos: (0, _myMatrix.vec2).clone(guard.pos),
            type: (0, _gameMap.ItemType).Key
        };
    }
    if (pickedItem) {
        const pt0 = (0, _myMatrix.vec2).create();
        const pt2 = posNew.subtract(pickedItem.pos);
        const pt1 = pt2.scale(0.3333).add((0, _myMatrix.vec2).fromValues(0, 0.5));
        const animation = animDelay > 0 ? new (0, _animation.SpriteAnimation)([
            {
                pt0: pt0,
                pt1: pt0,
                duration: 0.1,
                fn: (0, _animation.tween).easeOutQuad
            },
            {
                pt0: pt0,
                pt1: pt1,
                duration: 0.1,
                fn: (0, _animation.tween).easeOutQuad
            },
            {
                pt0: pt1,
                pt1: pt2,
                duration: 0.1,
                fn: (0, _animation.tween).easeInQuad
            }
        ], [
            tileSet.itemTiles[pickedItem.type],
            tileSet.itemTiles[pickedItem.type],
            tileSet.itemTiles[pickedItem.type]
        ]) : new (0, _animation.SpriteAnimation)([
            {
                pt0: pt0,
                pt1: pt1,
                duration: 0.1,
                fn: (0, _animation.tween).easeOutQuad
            },
            {
                pt0: pt1,
                pt1: pt2,
                duration: 0.1,
                fn: (0, _animation.tween).easeInQuad
            }
        ], [
            tileSet.itemTiles[pickedItem.type],
            tileSet.itemTiles[pickedItem.type]
        ]);
        animation.removeOnFinish = true;
        pickedItem.animation = animation;
        state.particles.push(pickedItem);
        state.sounds.coin.play(1.0);
    }
}
function pushOrSwapGuard(state, guard) {
    const posGuardOld = (0, _myMatrix.vec2).clone(guard.pos);
    const posPlayer = (0, _myMatrix.vec2).clone(state.player.pos);
    // Try to push the guard away from the player. If that doesn't work,
    //  exchange places with the player.
    const posGuardNew = (0, _myMatrix.vec2).create();
    (0, _myMatrix.vec2).subtract(posGuardNew, posGuardOld, posPlayer);
    (0, _myMatrix.vec2).add(posGuardNew, posGuardNew, posGuardOld);
    let pulledGuard = false;
    if (blocksPushedGuard(state, posGuardNew)) {
        (0, _myMatrix.vec2).copy(posGuardNew, posPlayer);
        pulledGuard = true;
    }
    // Update guard position
    (0, _myMatrix.vec2).copy(guard.pos, posGuardNew);
    // If guard ends up in water he wakes up immediately
    if (state.gameMap.cells.atVec(guard.pos).type === (0, _gameMap.TerrainType).GroundWater) guard.modeTimeout = 0;
    // Animate guard sliding
    const gpos0 = (0, _myMatrix.vec2).clone(posGuardOld).subtract(guard.pos);
    const gpos1 = (0, _myMatrix.vec2).create();
    let tweenSeq;
    if (pulledGuard) tweenSeq = [
        {
            pt0: gpos0,
            pt1: gpos1,
            duration: 0.2,
            fn: (0, _animation.tween).easeOutQuad
        }
    ];
    else {
        const gp = (0, _myMatrix.vec2).fromValues(0.5 * (posGuardOld[0] - guard.pos[0]), 0.5 * (posGuardOld[1] - guard.pos[1]));
        tweenSeq = [
            {
                pt0: gpos0,
                pt1: gp,
                duration: 0.2,
                fn: (0, _animation.tween).easeInQuad
            },
            {
                pt0: gp,
                pt1: gpos1,
                duration: 0.1,
                fn: (0, _animation.tween).easeOutQuad
            }
        ];
    }
    guard.animation = new (0, _animation.SpriteAnimation)(tweenSeq, []);
}
function moveGuardToPlayerPos(state, guard) {
    // Update guard position
    const posGuardOld = (0, _myMatrix.vec2).clone(guard.pos);
    (0, _myMatrix.vec2).copy(guard.pos, state.player.pos);
    // Animate guard sliding
    const gpos0 = (0, _myMatrix.vec2).clone(posGuardOld).subtract(state.player.pos);
    const gpos1 = (0, _myMatrix.vec2).create();
    const tweenSeq = [
        {
            pt0: gpos0,
            pt1: gpos1,
            duration: 0.2,
            fn: (0, _animation.tween).easeOutQuad
        }
    ];
    guard.animation = new (0, _animation.SpriteAnimation)(tweenSeq, []);
}
function blocksPushedGuard(state, posGuardNew) {
    if (posGuardNew[0] < 0 || posGuardNew[1] < 0 || posGuardNew[0] >= state.gameMap.cells.sizeX || posGuardNew[1] >= state.gameMap.cells.sizeY) return true;
    if (state.gameMap.cells.atVec(posGuardNew).moveCost === Infinity) return true;
    if (state.gameMap.guards.find((guard)=>guard.pos.equals(posGuardNew))) return true;
    for (const item of state.gameMap.items.filter((item)=>item.pos.equals(posGuardNew)))switch(item.type){
        case (0, _gameMap.ItemType).PortcullisEW:
        case (0, _gameMap.ItemType).PortcullisNS:
            return true;
        case (0, _gameMap.ItemType).LockedDoorEW:
        case (0, _gameMap.ItemType).LockedDoorNS:
            if (!state.player.hasVaultKey) return true;
            break;
    }
    return false;
}
function tryPlayerWait(state) {
    const player = state.player;
    // Can't move if you're dead.
    if (player.health <= 0) return;
    state.idleTimer = 5;
    // Move camera with player by releasing any panning motion
    state.camera.panning = false;
    state.touchController.clearMotion();
    preTurn(state);
    state.gameMap.identifyAdjacentCells(player.pos);
    player.pickTarget = null;
    ++state.numWaitMoves;
    advanceTime(state);
}
function tryPlayerStep(state, dx, dy, stepType) {
    // Can't move if you're dead
    const player = state.player;
    if (player.health <= 0) return;
    state.idleTimer = 5;
    // Move camera with player by releasing any panning motion
    state.camera.panning = false;
    state.touchController.clearMotion();
    // Get the player's current position and new position
    const posOld = (0, _myMatrix.vec2).clone(player.pos);
    const posNew = (0, _myMatrix.vec2).fromValues(player.pos[0] + dx, player.pos[1] + dy);
    // Trying to move off the map?
    if (posNew[0] < 0 || posNew[0] >= state.gameMap.cells.sizeX || posNew[1] < 0 || posNew[1] >= state.gameMap.cells.sizeY) {
        if (!state.finishedLevel) {
            setStatusMessage(state, "Collect all loot before leaving");
            bumpFail(state, dx, dy);
        } else {
            preTurn(state);
            advanceToMansionComplete(state);
            // Animate the player moving off the map edge
            // This is largely a simplified copy of the normal player-movement animation;
            // should probably be commonized
            const start = (0, _myMatrix.vec2).create();
            const end = (0, _myMatrix.vec2).clone(posNew).subtract(posOld);
            let mid = start.add(end).scale(0.5).add((0, _myMatrix.vec2).fromValues(0, 0.0625));
            const tweenSeq = [
                {
                    pt0: start,
                    pt1: mid,
                    duration: 0.1,
                    fn: (0, _animation.tween).easeInQuad
                },
                {
                    pt0: mid,
                    pt1: end,
                    duration: 0.1,
                    fn: (0, _animation.tween).easeOutQuad
                },
                {
                    pt0: end,
                    pt1: end,
                    duration: dy > 0 ? 0.5 : 0.1,
                    fn: (0, _animation.tween).easeOutQuad
                }
            ];
            const tile = dx < 0 ? tileSet.playerTiles.left : dx > 0 ? tileSet.playerTiles.right : dy > 0 ? tileSet.playerTiles.up : tileSet.playerTiles.down;
            player.animation = new (0, _animation.SpriteAnimation)(tweenSeq, [
                tile,
                tile,
                tile,
                tile
            ]);
        }
        return;
    }
    // Trying to move into solid terrain?
    const cellNew = state.gameMap.cells.atVec(posNew);
    if (cellNew.blocksPlayerMove) {
        if (collectLoot(state, posNew, player.pos)) {
            preTurn(state);
            player.pickTarget = null;
            bumpAnim(state, dx, dy);
            advanceTime(state);
        } else bumpFail(state, dx, dy);
        return;
    }
    // Trying to go through the wrong way through a one-way window?
    if (cellNew.type == (0, _gameMap.TerrainType).OneWayWindowE && posNew[0] <= posOld[0] || cellNew.type == (0, _gameMap.TerrainType).OneWayWindowW && posNew[0] >= posOld[0] || cellNew.type == (0, _gameMap.TerrainType).OneWayWindowN && posNew[1] <= posOld[1] || cellNew.type == (0, _gameMap.TerrainType).OneWayWindowS && posNew[1] >= posOld[1]) {
        setStatusMessage(state, "Window cannot be accessed from outside");
        if (state.level === 0) setTimeout(()=>state.sounds["tooHigh"].play(0.3), 250);
        bumpFail(state, dx, dy);
        return;
    }
    // Trying to move into a one-way window instead of leaping through?
    if (isOneWayWindowTerrainType(cellNew.type)) {
        setStatusMessage(state, leapPrompt);
        if (state.level === 0) setTimeout(()=>state.sounds["jump"].play(0.3), 250);
        bumpFail(state, dx, dy);
        return;
    }
    // Trying to move into an item that blocks movement?
    for (const item of state.gameMap.items.filter((item)=>item.pos.equals(posNew)))switch(item.type){
        case (0, _gameMap.ItemType).DrawersShort:
            if (canLeapToPos(state, (0, _myMatrix.vec2).fromValues(posOld[0] + 2 * dx, posOld[1] + 2 * dy))) setStatusMessage(state, leapPrompt);
            if (collectLoot(state, posNew, player.pos)) {
                preTurn(state);
                player.pickTarget = null;
                bumpAnim(state, dx, dy);
                advanceTime(state);
            } else bumpFail(state, dx, dy);
            return;
        case (0, _gameMap.ItemType).TorchUnlit:
            preTurn(state);
            state.sounds["ignite"].play(0.08);
            item.type = (0, _gameMap.ItemType).TorchLit;
            player.pickTarget = null;
            bumpAnim(state, dx, dy);
            advanceTime(state);
            return;
        case (0, _gameMap.ItemType).TorchLit:
            preTurn(state);
            state.sounds["douse"].play(0.05);
            item.type = (0, _gameMap.ItemType).TorchUnlit;
            player.pickTarget = null;
            bumpAnim(state, dx, dy);
            advanceTime(state);
            return;
        case (0, _gameMap.ItemType).PortcullisEW:
        case (0, _gameMap.ItemType).PortcullisNS:
            setStatusMessage(state, leapPrompt);
            state.sounds["gate"].play(0.3);
            if (state.level === 0) setTimeout(()=>state.sounds["jump"].play(0.3), 1000);
            bumpAnim(state, dx, dy);
            return;
        case (0, _gameMap.ItemType).LockedDoorEW:
        case (0, _gameMap.ItemType).LockedDoorNS:
            if (!player.hasVaultKey) {
                setStatusMessage(state, "Locked!");
                bumpFail(state, dx, dy);
                return;
            }
            break;
    }
    // Trying to move onto a guard?
    const guard = state.gameMap.guards.find((guard)=>guard.pos.equals(posNew));
    if (guard === undefined) player.pickTarget = null;
    else if (guard.mode === (0, _guard.GuardMode).Unconscious) {
        player.pickTarget = null;
        pushOrSwapGuard(state, guard);
    } else if (guard.mode === (0, _guard.GuardMode).ChaseVisibleTarget) {
        bumpFail(state, dx, dy);
        return;
    } else {
        let needGuardLootCollect = false;
        if (guard.hasPurse || guard.hasVaultKey) {
            // If we have already targeted this guard, pick their pocket; otherwise target them
            if (player.pickTarget === guard) needGuardLootCollect = true;
            else player.pickTarget = guard;
        }
        // If the guard is stationary, pass time in place
        if (!guard.allowsMoveOntoFrom(player.pos)) {
            if (needGuardLootCollect) collectGuardLoot(state, player, guard, posOld);
            preTurn(state);
            advanceTime(state);
            return;
        }
        if (needGuardLootCollect) collectGuardLoot(state, player, guard, posNew);
    }
    // Execute the move
    const fromHid = player.hidden(state.gameMap);
    preTurn(state);
    (0, _myMatrix.vec2).copy(player.pos, posNew);
    ++state.numStepMoves;
    // Identify creaky floors nearby
    state.gameMap.identifyAdjacentCells(player.pos);
    // Animate player moving
    const start = (0, _myMatrix.vec2).clone(posOld).subtract(posNew);
    const end = (0, _myMatrix.vec2).create();
    let mid = start.add(end).scale(0.5).add((0, _myMatrix.vec2).fromValues(0, 0.0625));
    const hid = player.hidden(state.gameMap);
    let tweenSeq;
    if (guard !== undefined && guard.mode === (0, _guard.GuardMode).Unconscious) {
        const gp = (0, _myMatrix.vec2).fromValues(0.5 * (posOld[0] - posNew[0]), 0.5 * (posOld[1] - posNew[1]));
        tweenSeq = [
            {
                pt0: start,
                pt1: gp,
                duration: 0.2,
                fn: (0, _animation.tween).easeInQuad
            },
            {
                pt0: gp,
                pt1: end,
                duration: 0.1,
                fn: (0, _animation.tween).easeOutQuad
            }
        ];
    } else {
        tweenSeq = [
            {
                pt0: start,
                pt1: mid,
                duration: 0.1,
                fn: (0, _animation.tween).easeInQuad
            },
            {
                pt0: mid,
                pt1: end,
                duration: 0.1,
                fn: (0, _animation.tween).easeOutQuad
            },
            {
                pt0: end,
                pt1: end,
                duration: dy > 0 && !hid ? 0.5 : 0.1,
                fn: (0, _animation.tween).easeOutQuad
            }
        ];
        if (dy > 0 && !hid) tweenSeq.push({
            pt0: end,
            pt1: end,
            duration: 0.1,
            fn: (0, _animation.tween).easeOutQuad
        });
    }
    const baseTile = dx < 0 ? tileSet.playerTiles.left : dx > 0 ? tileSet.playerTiles.right : dy > 0 ? tileSet.playerTiles.up : tileSet.playerTiles.down;
    const tile1 = fromHid ? tileSet.playerTiles.hidden : baseTile;
    const tile2 = hid ? tileSet.playerTiles.hidden : baseTile;
    const tile3 = hid ? tileSet.playerTiles.hidden : tileSet.playerTiles.left;
    player.animation = new (0, _animation.SpriteAnimation)(tweenSeq, [
        tile1,
        tile2,
        tile2,
        tile3
    ]);
    // Collect loot
    collectLoot(state, player.pos, posNew);
    // Generate movement AI noises
    if (stepType === StepType.AttemptedLeap && (cellNew.type === (0, _gameMap.TerrainType).DoorNS || cellNew.type === (0, _gameMap.TerrainType).DoorEW) && state.gameMap.items.find((item)=>item.pos.equals(posNew) && (0, _gameMap.isDoorItemType)(item.type))) makeNoise(state.gameMap, player, NoiseType.BangDoor, 17, state.sounds);
    else if (cellNew.type === (0, _gameMap.TerrainType).GroundWoodCreaky) makeNoise(state.gameMap, player, NoiseType.Creak, 17, state.sounds);
    // Let guards take a turn
    advanceTime(state);
    // Play sound for terrain type changes
    playMoveSound(state, state.gameMap.cells.atVec(posOld), cellNew);
}
function tryPlayerLeap(state, dx, dy) {
    // Can't move if you're dead
    const player = state.player;
    if (player.health <= 0) return;
    state.idleTimer = 5;
    // Move camera with player by releasing any panning motion
    state.camera.panning = false;
    state.touchController.clearMotion();
    // Get the player's current position and new position, and the middle position between them
    const posOld = (0, _myMatrix.vec2).clone(player.pos);
    const posMid = (0, _myMatrix.vec2).fromValues(player.pos[0] + dx, player.pos[1] + dy);
    const posNew = (0, _myMatrix.vec2).fromValues(player.pos[0] + 2 * dx, player.pos[1] + 2 * dy);
    // If an unaware guard is adjacent in the leap direction, knock them unconscious
    const guardMid = state.gameMap.guards.find((guard)=>guard.pos.equals(posMid) && guard.mode !== (0, _guard.GuardMode).Unconscious);
    if (guardMid) {
        if (guardMid.mode === (0, _guard.GuardMode).ChaseVisibleTarget) {
            // Swap places with the guard
            moveGuardToPlayerPos(state, guardMid);
            tryPlayerStep(state, dx, dy, StepType.AttemptedLeap);
        } else {
            preTurn(state);
            guardMid.mode = (0, _guard.GuardMode).Unconscious;
            guardMid.modeTimeout = Math.max(1, 40 - 2 * state.level) + (0, _random.randomInRange)(20);
            if (guardMid.hasPurse || guardMid.hasVaultKey) collectGuardLoot(state, player, guardMid, posOld);
            player.pickTarget = null;
            ++state.levelStats.numKnockouts;
            state.sounds.hitGuard.play(0.25);
            advanceTime(state);
            bumpAnim(state, dx, dy);
        }
        return;
    }
    // If player is in water, downgrade to a step
    if (state.gameMap.cells.atVec(posOld).type === (0, _gameMap.TerrainType).GroundWater) {
        tryPlayerStep(state, dx, dy, StepType.AttemptedLeap);
        return;
    }
    // If the midpoint is off the map, downgrade to a step
    if (posMid[0] < 0 || posMid[1] < 0 || posMid[0] >= state.gameMap.cells.sizeX || posMid[1] >= state.gameMap.cells.sizeY) {
        tryPlayerStep(state, dx, dy, StepType.AttemptedLeap);
        return;
    }
    // If the midpoint is a wall, downgrade to a step
    const cellMid = state.gameMap.cells.atVec(posMid);
    if (cellMid.blocksPlayerMove) {
        tryPlayerStep(state, dx, dy, StepType.AttemptedLeap);
        return;
    }
    // If the midpoint is a door, downgrade to a step
    if ((cellMid.type === (0, _gameMap.TerrainType).DoorNS || cellMid.type === (0, _gameMap.TerrainType).DoorEW) && state.gameMap.items.find((item)=>item.pos.equals(posMid) && (0, _gameMap.isDoorItemType)(item.type))) {
        tryPlayerStep(state, dx, dy, StepType.AttemptedLeap);
        return;
    }
    // If the midpoint is a one-way window but is the wrong way, downgrade to a step
    if (cellMid.type == (0, _gameMap.TerrainType).OneWayWindowE && posNew[0] <= posOld[0] || cellMid.type == (0, _gameMap.TerrainType).OneWayWindowW && posNew[0] >= posOld[0] || cellMid.type == (0, _gameMap.TerrainType).OneWayWindowN && posNew[1] <= posOld[1] || cellMid.type == (0, _gameMap.TerrainType).OneWayWindowS && posNew[1] >= posOld[1]) {
        tryPlayerStep(state, dx, dy, StepType.AttemptedLeap);
        return;
    }
    // If the leap destination is blocked, try a step if it can succeeed; else fail
    const guard = state.gameMap.guards.find((guard)=>guard.pos.equals(posNew));
    if (!canLeapToPos(state, posNew)) {
        if (canStepToPos(state, posMid)) {
            if (guard !== undefined && guard.overheadIcon() === (0, _gameMap.GuardStates).Alerted) // Leaping attack: An alert guard at posNew will be KO'd and looted with player landing at posMid
            executeLeapAttack(state, player, guard, dx, dy, posOld, posMid, posNew);
            else tryPlayerStep(state, dx, dy, StepType.AttemptedLeap);
        } else if (collectLoot(state, posMid, player.pos)) {
            preTurn(state);
            player.pickTarget = null;
            bumpAnim(state, dx, dy);
            advanceTime(state);
        } else bumpFail(state, dx, dy);
        return;
    }
    // Handle a guard at the endpoint
    if (guard === undefined || !(guard.hasPurse || guard.hasVaultKey)) player.pickTarget = null;
    else player.pickTarget = guard;
    // Execute the leap
    preTurn(state);
    // Collect any loot from posMid
    collectLoot(state, posMid, posNew);
    // End level if moving off the map
    if (posNew[0] < 0 || posNew[1] < 0 || posNew[0] >= state.gameMap.cells.sizeX || posNew[1] >= state.gameMap.cells.sizeY) {
        advanceToMansionComplete(state);
        // Animate player moving off the map
        const start = (0, _myMatrix.vec2).create();
        const end = (0, _myMatrix.vec2).clone(posNew).subtract(posOld);
        let mid = start.add(end).scale(0.5).add((0, _myMatrix.vec2).fromValues(0, 0.25));
        const tile = dx < 0 ? tileSet.playerTiles.left : dx > 0 ? tileSet.playerTiles.right : dy > 0 ? tileSet.playerTiles.up : tileSet.playerTiles.down;
        const tweenSeq = [
            {
                pt0: start,
                pt1: mid,
                duration: 0.1,
                fn: (0, _animation.tween).easeInQuad
            },
            {
                pt0: mid,
                pt1: end,
                duration: 0.1,
                fn: (0, _animation.tween).easeOutQuad
            },
            {
                pt0: end,
                pt1: end,
                duration: dy > 0 ? 0.5 : 0.1,
                fn: (0, _animation.tween).easeOutQuad
            }
        ];
        player.animation = new (0, _animation.SpriteAnimation)(tweenSeq, [
            tile,
            tile,
            tile
        ]);
        return;
    }
    // Update player position
    (0, _myMatrix.vec2).copy(player.pos, posNew);
    ++state.numLeapMoves;
    // Identify creaky floor under player
    const cellNew = state.gameMap.cells.atVec(posNew);
    cellNew.identified = true;
    // Animate player moving
    const start = (0, _myMatrix.vec2).clone(posOld).subtract(posNew);
    const end = (0, _myMatrix.vec2).create();
    let mid = start.add(end).scale(0.5).add((0, _myMatrix.vec2).fromValues(0, 0.25));
    const tile = dx < 0 ? tileSet.playerTiles.left : dx > 0 ? tileSet.playerTiles.right : dy > 0 ? tileSet.playerTiles.up : tileSet.playerTiles.down;
    const hid = player.hidden(state.gameMap);
    const tweenSeq = [
        {
            pt0: start,
            pt1: mid,
            duration: 0.1,
            fn: (0, _animation.tween).easeInQuad
        },
        {
            pt0: mid,
            pt1: end,
            duration: 0.1,
            fn: (0, _animation.tween).easeOutQuad
        },
        {
            pt0: end,
            pt1: end,
            duration: dy > 0 && !hid ? 0.5 : 0.1,
            fn: (0, _animation.tween).easeOutQuad
        }
    ];
    if (dy > 0 && !hid) tweenSeq.push({
        pt0: end,
        pt1: end,
        duration: 0.1,
        fn: (0, _animation.tween).easeOutQuad
    });
    const tile2 = hid ? tileSet.playerTiles.hidden : tile;
    player.animation = new (0, _animation.SpriteAnimation)(tweenSeq, [
        tile,
        tile2,
        tile2,
        tileSet.playerTiles.left
    ]);
    // Collect any loot from posNew
    collectLoot(state, posNew, posNew);
    // Generate movement AI noises
    if (state.gameMap.items.find((item)=>item.pos.equals(posNew) && item.type === (0, _gameMap.ItemType).Chair)) makeNoise(state.gameMap, player, NoiseType.BangChair, 17, state.sounds);
    else if (cellNew.type === (0, _gameMap.TerrainType).GroundWoodCreaky) makeNoise(state.gameMap, player, NoiseType.Creak, 17, state.sounds);
    else if (cellNew.type === (0, _gameMap.TerrainType).GroundWater) {
        makeNoise(state.gameMap, player, NoiseType.Splash, 17, state.sounds);
        state.sounds["splash"].play(0.5);
    }
    // Let guards take a turn
    advanceTime(state);
    // Play sound for terrain type changes
    playMoveSound(state, state.gameMap.cells.atVec(posOld), cellNew);
    if (cellMid.type === (0, _gameMap.TerrainType).PortcullisNS || cellMid.type === (0, _gameMap.TerrainType).PortcullisEW) state.sounds["gate"].play(0.3);
}
function executeLeapAttack(state, player, target, dx, dy, posOld, posMid, posNew) {
    // Execute the leaping attack that will finish at posMid
    preTurn(state);
    // Collect any loot from posMid
    collectLoot(state, posMid, posNew);
    // Update player position
    (0, _myMatrix.vec2).copy(player.pos, posMid);
    ++state.numLeapMoves;
    target.mode = (0, _guard.GuardMode).Unconscious;
    target.modeTimeout = Math.max(1, 40 - 2 * state.level) + (0, _random.randomInRange)(20);
    if (target.hasPurse || target.hasVaultKey) collectGuardLoot(state, player, target, posMid, 0.15);
    player.pickTarget = null;
    ++state.levelStats.numKnockouts;
    state.sounds.hitGuard.play(0.25);
    // Identify creaky floor under player
    const cellMid = state.gameMap.cells.atVec(posMid);
    cellMid.identified = true;
    // Animate player moving
    const start = (0, _myMatrix.vec2).clone(posOld).subtract(posMid);
    const mid = (0, _myMatrix.vec2).clone(posNew).subtract(posMid).scale(0.5).add((0, _myMatrix.vec2).fromValues(0, 0.25));
    const end = (0, _myMatrix.vec2).create();
    // let smid = start.add(mid).scale(0.5).add(vec2.fromValues(0,0.25));
    // let emid = mid.add(end).scale(0.5).add(vec2.fromValues(0,0.25));
    const tile = dx < 0 ? tileSet.playerTiles.left : dx > 0 ? tileSet.playerTiles.right : dy > 0 ? tileSet.playerTiles.up : tileSet.playerTiles.down;
    const hid = player.hidden(state.gameMap);
    const tweenSeq = [
        {
            pt0: start,
            pt1: mid,
            duration: 0.15,
            fn: (0, _animation.tween).easeInQuad
        },
        {
            pt0: mid,
            pt1: end,
            duration: 0.1,
            fn: (0, _animation.tween).easeOutQuad
        },
        {
            pt0: end,
            pt1: end,
            duration: dy > 0 && !hid ? 0.5 : 0.1,
            fn: (0, _animation.tween).easeOutQuad
        }
    ];
    if (dy > 0 && !hid) tweenSeq.push({
        pt0: end,
        pt1: end,
        duration: 0.1,
        fn: (0, _animation.tween).easeOutQuad
    });
    const tile2 = hid ? tileSet.playerTiles.hidden : tile;
    player.animation = new (0, _animation.SpriteAnimation)(tweenSeq, [
        tile,
        tile2,
        tile2,
        tileSet.playerTiles.left
    ]);
    // Generate movement AI noises
    makeNoise(state.gameMap, player, NoiseType.Thud, 17, state.sounds);
    if (cellMid.type === (0, _gameMap.TerrainType).GroundWoodCreaky) makeNoise(state.gameMap, player, NoiseType.Creak, 17, state.sounds);
    else if (cellMid.type === (0, _gameMap.TerrainType).GroundWater) makeNoise(state.gameMap, player, NoiseType.Splash, 17, state.sounds);
    // Let guards take a turn
    advanceTime(state);
    // Play sound for terrain type changes
    playMoveSound(state, state.gameMap.cells.atVec(posOld), cellMid);
}
function canLeapOntoItemType(itemType) {
    switch(itemType){
        case (0, _gameMap.ItemType).DrawersShort:
        case (0, _gameMap.ItemType).TorchUnlit:
        case (0, _gameMap.ItemType).TorchLit:
            return false;
        default:
            return true;
    }
}
function isOneWayWindowTerrainType(terrainType) {
    switch(terrainType){
        case (0, _gameMap.TerrainType).OneWayWindowE:
        case (0, _gameMap.TerrainType).OneWayWindowW:
        case (0, _gameMap.TerrainType).OneWayWindowN:
        case (0, _gameMap.TerrainType).OneWayWindowS:
            return true;
        default:
            return false;
    }
}
function makeNoise(map, player, noiseType, radius, sounds) {
    player.noisy = true;
    switch(noiseType){
        case NoiseType.Creak:
            sounds.footstepCreaky.play(0.6);
            break;
        case NoiseType.Splash:
            sounds.splash.play(0.5);
            break;
        case NoiseType.Thud:
            break;
        case NoiseType.BangDoor:
            break;
        case NoiseType.BangChair:
            break;
    }
    let closestGuardDist = Infinity;
    let closestGuard = null;
    for (const guard of map.guardsInEarshot(player.pos, radius)){
        guard.heardThief = true;
        const dist = player.pos.squaredDistance(guard.pos);
        if (dist < closestGuardDist && (0, _guard.isRelaxedGuardMode)(guard.mode)) {
            closestGuardDist = dist;
            closestGuard = guard;
        }
    }
    if (closestGuard !== null) closestGuard.heardThiefClosest = true;
}
function preTurn(state) {
    state.popups.clear();
    state.player.noisy = false;
    state.player.damagedLastTurn = false;
}
function advanceTime(state) {
    let oldHealth = state.player.health;
    ++state.turns;
    ++state.totalTurns;
    if (state.gameMap.cells.atVec(state.player.pos).type == (0, _gameMap.TerrainType).GroundWater) {
        if (state.player.turnsRemainingUnderwater > 0) {
            --state.player.turnsRemainingUnderwater;
            if (state.player.turnsRemainingUnderwater <= 0) state.sounds["waterExit"].play(0.25);
        }
    } else state.player.turnsRemainingUnderwater = (0, _gameMap.maxPlayerTurnsUnderwater);
    state.gameMap.computeLighting(state.gameMap.cells.atVec(state.player.pos));
    (0, _guard.guardActAll)(state, state.gameMap, state.popups, state.player);
    state.gameMap.recomputeVisibility(state.player.pos);
    (0, _guard.chooseGuardMoves)(state);
    postTurn(state);
    if (oldHealth > state.player.health) {
        state.sounds["hitPlayer"].play(0.5);
        if (state.player.health <= 0) {
            setTimeout(()=>state.sounds["gameOverJingle"].play(0.5), 1000);
            scoreIncompleteLevel(state);
            state.persistedStats.bestScore = Math.max(state.persistedStats.bestScore, state.gameStats.totalScore);
            const scoreEntry = {
                score: state.gameStats.totalScore,
                date: getCurrentDateFormatted(),
                turns: state.totalTurns,
                level: state.level + 1
            };
            state.persistedStats.scores.push(scoreEntry);
            if (state.dailyRun) {
                state.persistedStats.currentDailyBestScore = Math.max(state.persistedStats.currentDailyBestScore, state.gameStats.totalScore);
                state.persistedStats.lastPlayedDailyGame = structuredClone(state.gameStats);
            //                setStat('lastDaily', state.gameStats);
            }
            saveStats(state.persistedStats);
            setStatusMessageSticky(state, "You were killed. Press Escape/Menu to see score.");
        }
    }
}
function postTurn(state) {
    const allSeen = state.gameMap.allSeen();
    const allLooted = state.lootStolen >= state.lootAvailable;
    if (allSeen && allLooted) {
        if (!state.finishedLevel) state.sounds["levelRequirementJingle"].play(0.5);
        state.finishedLevel = true;
    }
    // Update top status-bar message
    state.popups.endOfUpdate(state.player.pos, state.subtitledSounds);
    if (allSeen) {
        if (allLooted) setStatusMessage(state, "Loot collected! Exit any map edge");
        else setStatusMessage(state, "Collect all loot");
    } else if (state.numStepMoves < 4) setStatusMessage(state, "Left, Right, Up, Down: Move");
    else if (state.numLeapMoves < 4) setStatusMessage(state, leapPrompt);
    else if (state.level === 0) setStatusMessage(state, "Map entire mansion");
    else if (state.level === 1) {
        if (state.numWaitMoves < 4) setStatusMessage(state, "Z, Period, or Space: Wait");
        else if (!state.hasOpenedMenu) setStatusMessage(state, "Esc or Slash: More help");
        else if (!state.topStatusMessageSticky) setStatusMessage(state, "");
    } else if (state.level === 3 && state.turns === 0) setStatusMessage(state, "Zoom view with brackets [ and ]");
    else if (!state.topStatusMessageSticky) setStatusMessage(state, "");
}
function setStatusMessage(state, msg) {
    if (state.topStatusMessage === msg) return;
    state.topStatusMessage = msg;
    state.topStatusMessageSticky = false;
    state.topStatusMessageAnim = msg.length === 0 ? 0 : 1;
}
function setStatusMessageSticky(state, msg) {
    if (state.topStatusMessage === msg) return;
    state.topStatusMessage = msg;
    state.topStatusMessageSticky = true;
    state.topStatusMessageAnim = msg.length === 0 ? 0 : 1;
}
function loadImage(src, img) {
    return new Promise((resolve, reject)=>{
        img.onload = ()=>resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}
function lightAnimator(baseVal, lightStates, srcIds, seen) {
    //Returns the exponent to apply to the light value for tiles hit with animated light
    if (srcIds.size == 0) return baseVal;
    if (!seen) return 0;
    let expo = 0;
    for (let l of [
        ...srcIds
    ])expo += lightStates[l];
    return baseVal ** (1 + expo / srcIds.size);
}
function updateAnimatedLight(cells, lightStates, seeAll) {
    for(let x = 0; x < cells.sizeX; x++)for(let y = 0; y < cells.sizeY; y++){
        const c = cells.at(x, y);
        if (c.type < (0, _gameMap.TerrainType).Wall0000 || c.type > (0, _gameMap.TerrainType).DoorEW) cells.at(x, y).litAnim = lightAnimator(c.lit, lightStates, c.litSrc, seeAll || c.seen);
        else //Walls and portals get rendered unlit regardless of light sources
        cells.at(x, y).litAnim = 0;
    }
}
function litVertices(x, y, cells) {
    const scale = (cells.at(x, y).lit ? 1 : 0.03) / 4;
    const l = cells.at(x, y).litAnim;
    const lld = cells.at(x - 1, y - 1).litAnim;
    const ld = cells.at(x, y - 1).litAnim;
    const lrd = cells.at(x + 1, y - 1).litAnim;
    const ll = cells.at(x - 1, y).litAnim;
    const lr = cells.at(x + 1, y).litAnim;
    const llu = cells.at(x - 1, y + 1).litAnim;
    const lu = cells.at(x, y + 1).litAnim;
    const lru = cells.at(x + 1, y + 1).litAnim;
    return [
        scale * (lld + ld + ll + l),
        scale * (lrd + ld + lr + l),
        scale * (llu + lu + ll + l),
        scale * (lru + lu + lr + l)
    ];
}
function renderTouchButtons(renderer, touchController) {
    for(const bkey in touchController.coreTouchTargets){
        if (!(bkey in touchController.controlStates)) continue;
        const b = touchController.coreTouchTargets[bkey];
        if (b.tileInfo === null || b.rect[2] === 0 || b.rect[3] === 0) continue;
        const lit = touchController.controlStates[bkey] ? 1 : 0;
        renderer.addGlyphLit(b.rect[0], b.rect[1], b.rect[0] + b.rect[2], b.rect[1] + b.rect[3], b.tileInfo, lit);
    }
    renderer.flush();
}
function renderWorld(state, renderer) {
    updateAnimatedLight(state.gameMap.cells, state.lightStates, state.seeAll);
    // Draw terrain
    for(let x = 0; x < state.gameMap.cells.sizeX; ++x)for(let y = state.gameMap.cells.sizeY - 1; y >= 0; --y){
        const cell = state.gameMap.cells.at(x, y);
        if (!cell.seen && !state.seeAll) continue;
        let terrainType = cell.type;
        if (terrainType == (0, _gameMap.TerrainType).GroundWoodCreaky) {
            if (!(cell.lit || cell.identified)) terrainType = (0, _gameMap.TerrainType).GroundWood;
        }
        const lv = litVertices(x, y, state.gameMap.cells);
        // Draw tile
        if (terrainType === (0, _gameMap.TerrainType).PortcullisEW && state.gameMap.guards.find((guard)=>guard.pos[0] == x && guard.pos[1] == y)) renderer.addGlyphLit4(x, y, x + 1, y + 1, renderer.tileSet.terrainTiles[(0, _gameMap.TerrainType).PortcullisNS], lv);
        else {
            const tile = cell.animation ? cell.animation.currentTile() : renderer.tileSet.terrainTiles[terrainType];
            renderer.addGlyphLit4(x, y, x + 1, y + 1, tile, lv);
        }
        // Draw border for water
        if (terrainType === (0, _gameMap.TerrainType).GroundWater) {
            const ledge = renderer.tileSet.ledgeTiles;
            let ctr = 0;
            for (let adj of [
                [
                    0,
                    1
                ],
                [
                    0,
                    -1
                ],
                [
                    -1,
                    0
                ],
                [
                    1,
                    0
                ]
            ]){
                const cell = state.gameMap.cells.at(x + adj[0], y + adj[1]);
                if (cell.type !== (0, _gameMap.TerrainType).GroundWater) renderer.addGlyphLit4(x, y, x + 1, y + 1, ledge[ctr], lv);
                ctr++;
            }
        }
    }
    // Draw items
    for (const item of state.gameMap.items){
        let x = item.pos[0];
        let y = item.pos[1];
        const cell = state.gameMap.cells.at(x, y);
        if (!cell.seen && !state.seeAll) continue;
        const terrainType = cell.type;
        const lv = litVertices(x, y, state.gameMap.cells);
        if (terrainType === (0, _gameMap.TerrainType).PortcullisEW && state.gameMap.guards.find((guard)=>guard.pos[0] == x && guard.pos[1] == y)) renderer.addGlyphLit4(x, y, x + 1, y + 1, renderer.tileSet.itemTiles[(0, _gameMap.ItemType).PortcullisNS], lv);
        else {
            //Don't draw the door if someone standing in it
            if ([
                (0, _gameMap.TerrainType).DoorEW,
                (0, _gameMap.TerrainType).DoorNS
            ].includes(terrainType)) {
                if (state.gameMap.guards.find((guard)=>guard.pos[0] == x && guard.pos[1] == y) || state.player.pos[0] == x && state.player.pos[1] == y) continue;
            }
            const ti = item.animation ? item.animation.currentTile() : renderer.tileSet.itemTiles[item.type];
            if (item.animation instanceof (0, _animation.SpriteAnimation)) {
                const o = item.animation.offset;
                x += o[0];
                y += o[1];
            }
            renderer.addGlyphLit4(x, y, x + 1, y + 1, ti, lv);
        }
    }
// Draw adjacencies
//    renderRoomAdjacencies(state.gameMap.adjacencies, renderer);
}
function renderRoomAdjacencies(adjacencies, renderer) {
    const tile = {
        textureIndex: 2,
        color: 0xffffffff,
        unlitColor: 0xffffffff
    };
    for (const adj of adjacencies){
        const x0 = adj.origin[0];
        const y0 = adj.origin[1];
        const x1 = adj.origin[0] + adj.dir[0] * adj.length;
        const y1 = adj.origin[1] + adj.dir[1] * adj.length;
        renderer.addGlyph(x0 + 0.25, y0 + 0.25, x0 + 0.75, y0 + 0.75, tile);
        renderer.addGlyph(x1 + 0.25, y1 + 0.25, x1 + 0.75, y1 + 0.75, tile);
    }
    for (const adj of adjacencies){
        const p0x = adj.origin[0] + 0.5;
        const p0y = adj.origin[1] + 0.5;
        const p1x = adj.origin[0] + adj.dir[0] * adj.length + 0.5;
        const p1y = adj.origin[1] + adj.dir[1] * adj.length + 0.5;
        const r = 0.1;
        const x0 = Math.min(p0x, p1x) - r + Math.abs(adj.dir[0]) * 0.5;
        const y0 = Math.min(p0y, p1y) - r + Math.abs(adj.dir[1]) * 0.5;
        const x1 = Math.max(p0x, p1x) + r + Math.abs(adj.dir[0]) * -0.5;
        const y1 = Math.max(p0y, p1y) + r + Math.abs(adj.dir[1]) * -0.5;
        renderer.addGlyph(x0, y0, x1, y1, tile);
    }
}
function renderWorldBorder(state, renderer) {
    const sizeX = state.gameMap.cells.sizeX;
    const sizeY = state.gameMap.cells.sizeY;
    const tileInfo = {
        textureIndex: 0,
        color: _colorPreset.white,
        unlitColor: _colorPreset.white
    };
    renderer.addGlyph(-1, 0, 0, sizeY, tileInfo);
    renderer.addGlyph(sizeX, 0, sizeX + 1, sizeY, tileInfo);
    renderer.addGlyph(-1, -1, sizeX + 1, 0, tileInfo);
    renderer.addGlyph(-1, sizeY, sizeX + 1, sizeY + 1, tileInfo);
}
function renderPlayer(state, renderer) {
    const player = state.player;
    const a = player.animation;
    const offset = a && a instanceof (0, _animation.SpriteAnimation) ? a.offset : (0, _myMatrix.vec2).create();
    const x = player.pos[0] + offset[0];
    const y = player.pos[1] + offset[1];
    const x0 = player.pos[0];
    const y0 = player.pos[1];
    const cell = state.gameMap.cells.at(x0, y0);
    const lit = lightAnimator(cell.lit, state.lightStates, cell.litSrc, state.seeAll || cell.seen);
    const hidden = player.hidden(state.gameMap);
    const dead = player.health <= 0;
    let tileInfo;
    if (a) tileInfo = a.currentTile();
    else {
        const p = renderer.tileSet.playerTiles;
        tileInfo = dead ? p.dead : hidden ? p.hidden : p.normal;
    }
    const tileInfoTinted = structuredClone(tileInfo);
    if (!dead) {
        if (player.damagedLastTurn) {
            tileInfoTinted.color = _colorPreset.lightRed;
            tileInfoTinted.unlitColor = _colorPreset.darkRed;
        } else if (hidden) {
            tileInfoTinted.color = _colorPreset.darkGray;
            tileInfoTinted.unlitColor = _colorPreset.darkerGray;
        }
    }
    renderer.addGlyphLit(x, y, x + 1, y + 1, tileInfoTinted, lit);
}
function renderGuards(state, renderer) {
    for (const guard of state.gameMap.guards){
        let tileIndex = 0 + tileIndexOffsetForDir(guard.dir);
        const cell = state.gameMap.cells.atVec(guard.pos);
        let lit = lightAnimator(cell.lit, state.lightStates, cell.litSrc, state.seeAll || cell.seen);
        const visible = state.seeAll || cell.seen || guard.speaking;
        if (!visible && (0, _myMatrix.vec2).squaredDistance(state.player.pos, guard.pos) > 36) continue;
        if (!visible && guard.mode !== (0, _guard.GuardMode).Unconscious) tileIndex += 4;
        else if (guard.mode === (0, _guard.GuardMode).Patrol && !guard.speaking && cell.lit == 0) lit = 0;
        else if (guard.mode === (0, _guard.GuardMode).Unconscious) tileIndex += 12;
        else tileIndex += 8;
        const tileInfo = structuredClone(renderer.tileSet.npcTiles[tileIndex]);
        if (guard.mode === (0, _guard.GuardMode).Unconscious && guard.hidden(state.gameMap)) {
            tileInfo.color = _colorPreset.darkGray;
            tileInfo.unlitColor = _colorPreset.darkerGray;
        }
        const gate = state.gameMap.items.find((item)=>[
                (0, _gameMap.ItemType).PortcullisEW,
                (0, _gameMap.ItemType).PortcullisNS
            ].includes(item.type));
        const offX = gate !== undefined && gate.pos.equals(guard.pos) ? 0.25 : 0;
        let offset = guard.animation?.offset ?? (0, _myMatrix.vec2).create();
        const x = guard.pos[0] + offset[0] + offX;
        const y = guard.pos[1] + offset[1];
        if (guard.hasTorch || guard.hasPurse || guard.hasVaultKey) {
            let t0 = x + guard.dir[0] * 0.375 + guard.dir[1] * 0.375;
            let t1 = y - 0.125;
            const tti = guard.torchAnimation?.currentTile() ?? renderer.tileSet.itemTiles[(0, _gameMap.ItemType).TorchCarry];
            let p0 = x - guard.dir[0] * 0.250 + (guard.dir[1] < 0 ? 0.375 : 0);
            let p1 = y - 0.125;
            const pti = guard.hasVaultKey ? tileSet.itemTiles[(0, _gameMap.ItemType).KeyCarry] : renderer.tileSet.itemTiles[(0, _gameMap.ItemType).PurseCarry];
            if (guard.dir[1] > 0) {
                if (guard.hasTorch) renderer.addGlyphLit(t0, t1, t0 + 1, t1 + 1, tti, lit);
                renderer.addGlyphLit(x, y, x + 1, y + 1, tileInfo, lit);
                if (guard.hasPurse || guard.hasVaultKey) renderer.addGlyphLit(p0, p1, p0 + 1, p1 + 1, pti, lit);
            } else if (guard.dir[1] < 0) {
                if (guard.hasPurse || guard.hasVaultKey) renderer.addGlyphLit(p0, p1, p0 + 1, p1 + 1, pti, lit);
                renderer.addGlyphLit(x, y, x + 1, y + 1, tileInfo, lit);
                if (guard.hasTorch) renderer.addGlyphLit(t0, t1, t0 + 1, t1 + 1, tti, lit);
            } else {
                renderer.addGlyphLit(x, y, x + 1, y + 1, tileInfo, lit);
                if (guard.hasTorch) renderer.addGlyphLit(t0, t1, t0 + 1, t1 + 1, tti, lit);
                if (guard.hasPurse || guard.hasVaultKey) renderer.addGlyphLit(p0, p1, p0 + 1, p1 + 1, pti, lit);
            }
        } else renderer.addGlyphLit(x, y, x + 1, y + 1, tileInfo, lit);
    // renderer.addGlyphLit(guard.pos[0], guard.pos[1], guard.pos[0] + 1, guard.pos[1] + 1, tileInfo, lit);
    }
}
function renderParticles(state, renderer) {
    for (let p of state.particles)if (p.animation) {
        const a = p.animation;
        const offset = a instanceof (0, _animation.SpriteAnimation) ? a.offset : (0, _myMatrix.vec2).create();
        const x = p.pos[0] + offset[0];
        const y = p.pos[1] + offset[1];
        const tileInfo = a.currentTile();
        renderer.addGlyph(x, y, x + 1, y + 1, tileInfo);
    }
}
function renderIconOverlays(state, renderer) {
    const player = state.player;
    const bubble_right = renderer.tileSet.namedTiles["speechBubbleR"];
    const bubble_left = renderer.tileSet.namedTiles["speechBubbleL"];
    for (const guard of state.gameMap.guards){
        const cell = state.gameMap.cells.atVec(guard.pos);
        const visible = state.seeAll || cell.seen || guard.speaking;
        if (!visible && (0, _myMatrix.vec2).squaredDistance(state.player.pos, guard.pos) > 36) continue;
        let offset = guard.animation?.offset ?? (0, _myMatrix.vec2).create();
        const x = guard.pos[0] + offset[0];
        const y = guard.pos[1] + offset[1];
        if (guard.speaking) {
            const dir = guard.dir[0];
            if (dir >= 0) renderer.addGlyph(x + 1, y, x + 2, y + 1, bubble_right);
            else renderer.addGlyph(x - 1, y, x, y + 1, bubble_left);
        }
        const guardState = guard.overheadIcon();
        if (guardState !== (0, _gameMap.GuardStates).Relaxed) {
            const gtile = renderer.tileSet.guardStateTiles[guardState];
            renderer.addGlyph(x, y + 0.625, x + 1, y + 1.625, gtile);
        }
        if (guard === player.pickTarget) {
            // Render the shadowing indicator if player is shadowing a guard
            const gtile = tileSet.namedTiles["pickTarget"];
            renderer.addGlyph(x, y + 0.625, x + 1, y + 1.625, gtile);
        }
    }
    // DISABLING BUT MIGHT BE USEFUL AS AN ACCESSIBILITY OPTION
    // Render the light status indicator if player is standing in the light
    // const litVal = state.gameMap.cells.atVec(player.pos).lit?1:0;
    // if(litVal) {
    //     const litTile = tileSet.namedTiles['litPlayer'];
    //     const offset = player.animation?.offset?? vec2.create();
    //     const x = player.pos[0] + offset[0];
    //     const y = player.pos[1] + offset[1];
    //     renderer.addGlyph(x, y+0.625, x+1, y+1.625, litTile, litVal);                
    // }
    // Render an icon over the player if the player is being noisy
    if (player.noisy) {
        const x = player.pos[0];
        const y = player.pos[1] - 0.5;
        renderer.addGlyph(x, y, x + 1, y + 1, tileSet.namedTiles["noise"]);
    }
}
function renderGuardSight(state, renderer) {
    if (!state.seeGuardSight) return;
    const mapSizeX = state.gameMap.cells.sizeX;
    const mapSizeY = state.gameMap.cells.sizeY;
    const seenByGuard = new (0, _gameMap.BooleanGrid)(mapSizeX, mapSizeY, false);
    const pos = (0, _myMatrix.vec2).create();
    const dpos = (0, _myMatrix.vec2).create();
    for (const guard of state.gameMap.guards){
        const maxSightCutoff = 3;
        const xMin = Math.max(0, Math.floor(guard.pos[0] - maxSightCutoff));
        const xMax = Math.min(mapSizeX, Math.floor(guard.pos[0] + maxSightCutoff) + 1);
        const yMin = Math.max(0, Math.floor(guard.pos[1] - maxSightCutoff));
        const yMax = Math.min(mapSizeY, Math.floor(guard.pos[1] + maxSightCutoff) + 1);
        for(let y = yMin; y < yMax; ++y)for(let x = xMin; x < xMax; ++x){
            (0, _myMatrix.vec2).set(pos, x, y);
            (0, _myMatrix.vec2).subtract(dpos, pos, guard.pos);
            const cell = state.gameMap.cells.at(x, y);
            if (seenByGuard.get(x, y)) continue;
            if (cell.blocksPlayerMove) continue;
            if (!state.seeAll && !cell.seen) continue;
            if ((0, _myMatrix.vec2).dot(guard.dir, dpos) < 0) continue;
            if ((0, _myMatrix.vec2).squaredLen(dpos) >= guard.sightCutoff(cell.lit > 0)) continue;
            if (!(0, _guard.lineOfSight)(state.gameMap, guard.pos, pos)) continue;
            seenByGuard.set(x, y, true);
        }
    }
    for(let y = 0; y < state.gameMap.cells.sizeY; ++y){
        for(let x = 0; x < state.gameMap.cells.sizeX; ++x)if (seenByGuard.get(x, y)) renderer.addGlyph(x, y, x + 1, y + 1, tileSet.namedTiles["crossHatch"]);
    }
}
function renderGuardPatrolPaths(state, renderer) {
    if (!state.seeGuardPatrols) return;
    for (const guard of state.gameMap.guards)for (const pos of guard.patrolPath)renderer.addGlyph(pos[0], pos[1], pos[0] + 1, pos[1] + 1, tileSet.namedTiles["patrolRoute"]);
}
function tileIndexOffsetForDir(dir) {
    if (dir[1] > 0) return 1;
    else if (dir[1] < 0) return 3;
    else if (dir[0] > 0) return 0;
    else if (dir[0] < 0) return 2;
    else return 3;
}
function createCamera(posPlayer, zoomLevel) {
    const camera = {
        position: (0, _myMatrix.vec2).create(),
        velocity: (0, _myMatrix.vec2).create(),
        zoom: zoomLevel,
        zoomVelocity: 0,
        scale: Math.pow(zoomPower, zoomLevel),
        anchor: (0, _myMatrix.vec2).create(),
        snapped: false,
        zoomed: false,
        panning: false
    };
    (0, _myMatrix.vec2).copy(camera.position, posPlayer);
    (0, _myMatrix.vec2).zero(camera.velocity);
    return camera;
}
function setSoundVolume(state, soundVolume) {
    state.soundVolume = soundVolume;
    (0, _audio.Howler).volume(soundVolume);
    window.localStorage.setItem("LLL/soundVolume", soundVolume.toString());
}
function setVolumeMute(state, volumeMute) {
    state.volumeMute = volumeMute;
    (0, _audio.Howler).mute(volumeMute);
    window.localStorage.setItem("LLL/volumeMute", volumeMute ? "true" : "false");
}
function setGuardMute(state, guardMute) {
    state.guardMute = guardMute;
    window.localStorage.setItem("LLL/guardMute", guardMute ? "true" : "false");
    for(const s in state.subtitledSounds)state.subtitledSounds[s].mute = guardMute;
}
function getStat(name) {
    const statJson = window.localStorage.getItem("LLL/stat/" + name);
    if (statJson === null || statJson === undefined) return undefined;
    if (statJson === "undefined") return undefined;
    return JSON.parse(String(statJson));
}
function setStat(name, value) {
    const statJson = JSON.stringify(value);
    window.localStorage.setItem("LLL/stat/" + name, statJson);
}
function loadStats() {
    return {
        scores: getStat("highScores") ?? [],
        lastPlayedDailyGame: getStat("lastPlayedDailyGame") ?? null,
        currentDailyGameId: getStat("currentDailyGameId") ?? "",
        currentDailyPlays: getStat("currentDailyPlays") ?? 0,
        currentDailyWins: getStat("currentDailyWins") ?? 0,
        currentDailyBestScore: getStat("currentDailyBestScore") ?? 0,
        currentDailyWinFirstTry: getStat("currentDailyWinFirstTry") ?? 0,
        bestScore: getStat("bestScore") ?? 0,
        totalPlays: getStat("totalPlays") ?? 0,
        totalWins: getStat("totalWins") ?? 0,
        totalGhosts: getStat("totalGhosts") ?? 0,
        allDailyPlays: getStat("allDailyPlays") ?? 0,
        allDailyWins: getStat("allDailyWins") ?? 0,
        allDailyWinsFirstTry: getStat("allDailyWinsFirstTry") ?? 0
    };
}
function saveStats(persistedStats) {
    setStat("currentDailyGameId", persistedStats.currentDailyGameId);
    setStat("currentDailyPlays", persistedStats.currentDailyPlays);
    setStat("currentDailyWins", persistedStats.currentDailyWins);
    setStat("currentDailyBestScore", persistedStats.currentDailyBestScore);
    setStat("currentDailyWinFirstTry", persistedStats.currentDailyWinFirstTry);
    setStat("lastPlayedDailyGame", persistedStats.lastPlayedDailyGame);
    setStat("allDailyPlays", persistedStats.allDailyPlays);
    setStat("allDailyWins", persistedStats.allDailyWins);
    setStat("allDailyWinsFirstTry", persistedStats.allDailyWinsFirstTry);
    setStat("scores", persistedStats.scores);
    setStat("bestScore", persistedStats.bestScore);
    setStat("totalPlays", persistedStats.totalPlays);
    setStat("totalWins", persistedStats.totalWins);
    setStat("totalGhosts", persistedStats.totalGhosts);
}
function initState(sounds, subtitledSounds, activeSoundPool, touchController) {
    const rng = new (0, _random.RNG)();
    const initialLevel = debugInitialLevel;
    const gameMapRoughPlans = (0, _createMap.createGameMapRoughPlans)(gameConfig.numGameMaps, gameConfig.totalGameLoot, rng);
    const gameMap = (0, _createMap.createGameMap)(initialLevel, gameMapRoughPlans[initialLevel]);
    const stats = loadStats();
    let keyRepeatRate = parseInt(window.localStorage.getItem("LLL/keyRepeatRate") ?? "175");
    if (isNaN(keyRepeatRate)) keyRepeatRate = 175;
    let keyRepeatDelay = parseInt(window.localStorage.getItem("LLL/keyRepeatDelay") ?? "250");
    if (isNaN(keyRepeatDelay)) keyRepeatDelay = 250;
    let soundVolume = parseFloat(window.localStorage.getItem("LLL/soundVolume") ?? "1.0");
    if (isNaN(soundVolume)) soundVolume = 1.0;
    let volumeMuteSaved = window.localStorage.getItem("LLL/volumeMute");
    const volumeMute = volumeMuteSaved === null ? false : volumeMuteSaved === "true";
    let guardMuteSaved = window.localStorage.getItem("LLL/guardMute");
    const guardMute = guardMuteSaved === null ? false : guardMuteSaved === "true";
    const state = {
        gameStats: {
            totalScore: 0,
            turns: 0,
            numLevels: 0,
            numCompletedLevels: 0,
            numGhostedLevels: 0,
            daily: null,
            timeStarted: 0,
            timeEnded: 0
        },
        persistedStats: stats,
        levelStats: {
            numKnockouts: 0,
            numSpottings: 0,
            damageTaken: 0
        },
        lightStates: Array(gameMap.lightCount).fill(0),
        particles: [],
        tLast: undefined,
        dt: 0,
        idleTimer: 0,
        rng: rng,
        dailyRun: null,
        leapToggleActive: false,
        gameMode: (0, _types.GameMode).HomeScreen,
        textWindows: {
            [(0, _types.GameMode).HomeScreen]: new (0, _ui.HomeScreen)(),
            [(0, _types.GameMode).OptionsScreen]: new (0, _ui.OptionsScreen)(),
            [(0, _types.GameMode).StatsScreen]: new (0, _ui.StatsScreen)(),
            [(0, _types.GameMode).DailyHub]: new (0, _ui.DailyHubScreen)(),
            [(0, _types.GameMode).HelpControls]: new (0, _ui.HelpControls)(),
            [(0, _types.GameMode).HelpKey]: new (0, _ui.HelpKey)(),
            [(0, _types.GameMode).MansionComplete]: new (0, _ui.MansionCompleteScreen)(),
            [(0, _types.GameMode).Dead]: new (0, _ui.DeadScreen)(),
            [(0, _types.GameMode).Win]: new (0, _ui.WinScreen)(),
            [(0, _types.GameMode).CreditsScreen]: new (0, _ui.CreditsScreen)()
        },
        player: new (0, _gameMap.Player)(gameMap.playerStartPos),
        topStatusMessage: "",
        topStatusMessageSticky: false,
        topStatusMessageAnim: 0,
        numStepMoves: 0,
        numLeapMoves: 0,
        numWaitMoves: 0,
        hasOpenedMenu: false,
        finishedLevel: false,
        hasStartedGame: false,
        zoomLevel: initZoomLevel,
        seeAll: debugSeeAll,
        seeGuardSight: false,
        seeGuardPatrols: false,
        camera: createCamera(gameMap.playerStartPos, initZoomLevel),
        level: initialLevel,
        turns: 0,
        totalTurns: 0,
        lootStolen: 0,
        lootAvailable: gameMapRoughPlans[initialLevel].totalLoot,
        gameMapRoughPlans: gameMapRoughPlans,
        gameMap: gameMap,
        sounds: sounds,
        subtitledSounds: subtitledSounds,
        activeSoundPool: activeSoundPool,
        soundVolume: soundVolume,
        guardMute: guardMute,
        volumeMute: volumeMute,
        keyRepeatActive: undefined,
        keyRepeatRate: keyRepeatRate,
        keyRepeatDelay: keyRepeatDelay,
        touchController: touchController,
        gamepadManager: new (0, _controllers.GamepadManager)(),
        keyboardController: new (0, _controllers.KeyboardController)(),
        popups: new (0, _popups.Popups)
    };
    setLights(gameMap, state);
    setCellAnimations(gameMap, state);
    (0, _guard.chooseGuardMoves)(state);
    postTurn(state);
    return state;
}
function zoomIn(state) {
    state.zoomLevel = Math.min(maxZoomLevel, state.zoomLevel + 1);
    state.camera.panning = false;
}
function zoomOut(state) {
    state.zoomLevel = Math.max(minZoomLevel, state.zoomLevel - 1);
    state.camera.panning = false;
}
function setCellAnimations(gameMap, state) {
    for (let c of gameMap.cells.values)if (c.type === (0, _gameMap.TerrainType).GroundWater) c.animation = new (0, _animation.FrameAnimator)(tileSet.waterAnimation, .5);
}
function setLights(gameMap, state) {
    let id = 0;
    if (tileSet.candleAnimation.length >= 3) {
        const stoveSeq = tileSet.stoveAnimation.slice(0, 2).map((t)=>[
                t,
                0.5
            ]);
        const stoveDim = stoveSeq[0][0];
        const stoveOff = stoveSeq[0][0];
        const candleSeq = tileSet.candleAnimation.slice(0, 3).map((t)=>[
                t,
                0.5
            ]);
        const candleDim = tileSet.candleAnimation.at(-2);
        const candleOff = tileSet.candleAnimation.at(-1);
        for (let i of gameMap.items){
            if (i.type === (0, _gameMap.ItemType).Stove) {
                i.animation = new (0, _animation.LightSourceAnimation)((0, _animation.LightState).idle, id, state.lightStates, i, stoveSeq, stoveDim, stoveOff);
                id++;
            } else if (i.type === (0, _gameMap.ItemType).TorchLit) {
                i.animation = new (0, _animation.LightSourceAnimation)((0, _animation.LightState).idle, id, state.lightStates, i, candleSeq, candleDim, candleOff);
                id++;
            } else if (i.type === (0, _gameMap.ItemType).TorchUnlit) {
                i.animation = new (0, _animation.LightSourceAnimation)((0, _animation.LightState).off, id, state.lightStates, i, candleSeq, candleDim, candleOff);
                id++;
            }
        }
    }
    if (tileSet.torchAnimation.length >= 3) {
        const torchSeq = tileSet.torchAnimation.slice(0, 3).map((t)=>[
                t,
                0.5
            ]);
        const torchDim = tileSet.torchAnimation.at(-2);
        const torchOff = tileSet.torchAnimation.at(-1);
        for (let g of gameMap.guards)if (g.hasTorch) {
            g.torchAnimation = new (0, _animation.LightSourceAnimation)((0, _animation.LightState).idle, id, state.lightStates, null, torchSeq, torchDim, torchOff);
            id++;
        }
    }
}
function restartGame(state) {
    state.gameMapRoughPlans = (0, _createMap.createGameMapRoughPlans)(gameConfig.numGameMaps, gameConfig.totalGameLoot, state.rng);
    state.level = debugInitialLevel;
    state.persistedStats.totalPlays++;
    setStat("totalPlays", state.persistedStats.totalPlays);
    if (state.dailyRun) {
        state.persistedStats.currentDailyPlays++;
        setStat("currentDailyPlays", state.persistedStats.currentDailyPlays);
        state.persistedStats.allDailyPlays++;
        setStat("allDailyPlays", state.persistedStats.allDailyPlays);
    }
    state.gameStats = {
        totalScore: 0,
        turns: 0,
        numLevels: 0,
        numCompletedLevels: 0,
        numGhostedLevels: 0,
        daily: state.dailyRun,
        timeStarted: Date.now(),
        timeEnded: 0
    };
    const gameMap = (0, _createMap.createGameMap)(state.level, state.gameMapRoughPlans[state.level]);
    state.lightStates = Array(gameMap.lightCount).fill(0);
    setLights(gameMap, state);
    setCellAnimations(gameMap, state);
    state.gameMode = (0, _types.GameMode).Mansion;
    state.topStatusMessage = "";
    state.topStatusMessageSticky = false;
    state.topStatusMessageAnim = 0;
    state.numStepMoves = 0;
    state.numLeapMoves = 0;
    state.numWaitMoves = 0;
    state.hasOpenedMenu = false;
    state.finishedLevel = false;
    state.turns = 0;
    state.totalTurns = 0;
    state.lootStolen = 0;
    state.lootAvailable = state.gameMapRoughPlans[state.level].totalLoot;
    clearLevelStats(state.levelStats);
    state.player = new (0, _gameMap.Player)(gameMap.playerStartPos);
    state.camera = createCamera(gameMap.playerStartPos, state.zoomLevel);
    state.gameMap = gameMap;
    state.activeSoundPool.empty();
    state.popups.reset();
    (0, _guard.chooseGuardMoves)(state);
    postTurn(state);
    //    analyzeLevel(state);
    (0, _audio.Howler).stop();
}
function resetState(state) {
    const gameMap = (0, _createMap.createGameMap)(state.level, state.gameMapRoughPlans[state.level]);
    state.lightStates = Array(gameMap.lightCount).fill(0);
    setLights(gameMap, state);
    setCellAnimations(gameMap, state);
    state.turns = 0;
    state.totalTurns = 0;
    state.lootStolen = 0;
    state.lootAvailable = state.gameMapRoughPlans[state.level].totalLoot;
    clearLevelStats(state.levelStats);
    state.topStatusMessage = "";
    state.topStatusMessageSticky = false;
    state.topStatusMessageAnim = 0;
    state.finishedLevel = false;
    state.player = new (0, _gameMap.Player)(gameMap.playerStartPos);
    state.camera = createCamera(gameMap.playerStartPos, state.zoomLevel);
    state.gameMap = gameMap;
    state.popups.reset();
    state.activeSoundPool.empty();
    (0, _guard.chooseGuardMoves)(state);
    postTurn(state);
    (0, _audio.Howler).stop();
}
function updateIdle(state, dt) {
    if (state.player.health <= 0) return;
    if (state.gameMode === (0, _types.GameMode).MansionComplete || state.gameMode === (0, _types.GameMode).Win) return;
    if (state.player.animation !== null) return;
    state.idleTimer -= dt;
    if (state.idleTimer > 0) return;
    state.idleTimer = 5;
    const player = state.player;
    const start = (0, _myMatrix.vec2).create();
    const left = (0, _myMatrix.vec2).fromValues(-0.125, 0);
    const right = (0, _myMatrix.vec2).fromValues(0.125, 0);
    const up = (0, _myMatrix.vec2).fromValues(0, 0.125);
    const hid = player.hidden(state.gameMap);
    const p = tileSet.playerTiles;
    let tweenSeq, tiles;
    if (hid || Math.random() > 0.5) {
        tweenSeq = [
            {
                pt0: start,
                pt1: up,
                duration: 0.1,
                fn: (0, _animation.tween).easeInQuad
            },
            {
                pt0: up,
                pt1: start,
                duration: 0.05,
                fn: (0, _animation.tween).easeOutQuad
            },
            {
                pt0: start,
                pt1: start,
                duration: 0.1,
                fn: (0, _animation.tween).easeOutQuad
            },
            {
                pt0: start,
                pt1: up,
                duration: 0.1,
                fn: (0, _animation.tween).easeInQuad
            },
            {
                pt0: up,
                pt1: start,
                duration: 0.05,
                fn: (0, _animation.tween).easeOutQuad
            }
        ];
        tiles = hid ? [
            p.hidden
        ] : [
            p.normal
        ];
    } else {
        tweenSeq = [
            {
                pt0: start,
                pt1: left,
                duration: 0.1,
                fn: (0, _animation.tween).easeOutQuad
            },
            {
                pt0: left,
                pt1: left,
                duration: 0.5,
                fn: (0, _animation.tween).easeOutQuad
            },
            {
                pt0: left,
                pt1: start,
                duration: 0.1,
                fn: (0, _animation.tween).easeInQuad
            },
            {
                pt0: start,
                pt1: right,
                duration: 0.1,
                fn: (0, _animation.tween).easeOutQuad
            },
            {
                pt0: right,
                pt1: right,
                duration: 0.5,
                fn: (0, _animation.tween).easeOutQuad
            },
            {
                pt0: right,
                pt1: start,
                duration: 0.1,
                fn: (0, _animation.tween).easeInQuad
            }
        ];
        tiles = [
            p.left,
            p.left,
            p.normal,
            p.right,
            p.right,
            p.normal
        ];
    }
    player.animation = new (0, _animation.SpriteAnimation)(tweenSeq, tiles);
}
function updateAndRender(now, renderer, state) {
    const t = now / 1000;
    const dt = state.tLast === undefined ? 0 : Math.min(1 / 30, t - state.tLast);
    state.dt = dt;
    state.tLast = t;
    canvas.width = canvasSizeX;
    canvas.height = canvasSizeY;
    const screenSize = (0, _myMatrix.vec2).fromValues(canvasSizeX, canvasSizeY);
    updateControllerState(state);
    state.topStatusMessageAnim = Math.max(0, state.topStatusMessageAnim - 4 * dt);
    if (!state.camera.zoomed) {
        state.camera.zoomed = true;
        zoomToFitCamera(state, screenSize);
    }
    if (!state.camera.snapped) {
        state.camera.panning = false;
        state.camera.snapped = true;
        snapCamera(state, screenSize);
    }
    if (dt > 0) updateState(state, screenSize, dt);
    const tw = state.textWindows[state.gameMode];
    if (tw !== undefined) {
        tw.update(state);
        tw.parseUI(screenSize);
    }
    updateTouchButtons(state.touchController, renderer, screenSize, state);
    renderScene(renderer, screenSize, state);
    requestAnimationFrame((now)=>updateAndRender(now, renderer, state));
}
function updateState(state, screenSize, dt) {
    updateCamera(state, screenSize, dt);
    updateIdle(state, dt);
    state.popups.currentPopupTimeRemaining = Math.max(0, state.popups.currentPopupTimeRemaining - dt);
    if (state.player.animation) {
        if (state.player.animation.update(dt)) state.player.animation = null;
    }
    for (let c of state.gameMap.cells.values)c.animation?.update(dt);
    for (let g of state.gameMap.guards){
        if (g.animation?.update(dt)) g.animation = null;
        if (g.torchAnimation?.update(dt)) g.torchAnimation = null;
    }
    state.gameMap.items = state.gameMap.items.filter((i)=>{
        const done = i.animation?.update(dt);
        if (i.animation instanceof (0, _animation.SpriteAnimation)) return !(i.animation.removeOnFinish && done);
        return true;
    });
    state.particles = state.particles.filter((p)=>{
        const done = p.animation?.update(dt);
        if (p.animation instanceof (0, _animation.SpriteAnimation)) return !(p.animation.removeOnFinish && done);
        return true;
    });
}
function renderScene(renderer, screenSize, state) {
    renderer.beginFrame(screenSize);
    const matScreenFromWorld = (0, _myMatrix.mat4).create();
    setupViewMatrix(state, screenSize, matScreenFromWorld);
    renderer.start(matScreenFromWorld, 1);
    renderWorld(state, renderer);
    if (state.gameMode === (0, _types.GameMode).Mansion) {
        renderGuardSight(state, renderer);
        renderGuardPatrolPaths(state, renderer);
    }
    renderGuards(state, renderer);
    if (state.gameMode !== (0, _types.GameMode).MansionComplete && state.gameMode !== (0, _types.GameMode).Win || state.player.animation) renderPlayer(state, renderer);
    renderParticles(state, renderer);
    if (state.gameMode === (0, _types.GameMode).Mansion) renderIconOverlays(state, renderer);
    renderWorldBorder(state, renderer);
    renderer.flush();
    if (state.gameMode === (0, _types.GameMode).Mansion || state.gameMode === (0, _types.GameMode).MansionComplete) renderTextBox(renderer, screenSize, state);
    const menuWindow = state.textWindows[state.gameMode];
    if (menuWindow !== undefined) menuWindow.render(renderer);
    if (state.gameMode === (0, _types.GameMode).Mansion || state.gameMode === (0, _types.GameMode).MansionComplete) renderTopStatusBar(renderer, screenSize, state);
    renderBottomStatusBar(renderer, screenSize, state);
    if ((0, _controllers.lastController) === state.touchController) {
        const matScreenFromPixel = (0, _myMatrix.mat4).create();
        (0, _myMatrix.mat4).ortho(matScreenFromPixel, 0, screenSize[0], 0, screenSize[1], 1, -1);
        renderer.start(matScreenFromPixel, 1);
        renderTouchButtons(renderer, state.touchController);
        renderer.flush();
    }
}
function updateTouchButtons(touchController, renderer, screenSize, state) {
    //TODO: Perhaps should move more of the game-specific logic from touchcontroller class into here
    if ((0, _controllers.lastController) !== touchController) return;
    const menu = state.textWindows[state.gameMode];
    if (touchController.lastMotion.id !== -1 && menu === undefined && touchController.targetOnTouchDown === null && touchController.lastMotion.active) {
        const dXScreen = touchController.lastMotion.x - touchController.lastMotion.x0;
        const dYScreen = touchController.lastMotion.y - touchController.lastMotion.y0;
        const dXWorld = dXScreen / (pixelsPerTileX * state.camera.scale);
        const dYWorld = dYScreen / (pixelsPerTileY * state.camera.scale);
        state.camera.panning = true;
        state.camera.position[0] -= dXWorld - state.camera.anchor[0];
        state.camera.position[1] -= dYWorld - state.camera.anchor[1];
        state.camera.anchor[0] = dXWorld;
        state.camera.anchor[1] = dYWorld;
    } else {
        state.camera.anchor[0] = 0;
        state.camera.anchor[1] = 0;
    }
    updateTouchButtonsGamepad(touchController, renderer, screenSize, state);
    touchController.activateTouchTargets(menu ? menu.touchTargets : undefined);
}
function updateTouchButtonsGamepad(touchController, renderer, screenSize, state) {
    const tt = renderer.tileSet.touchButtons !== undefined ? renderer.tileSet.touchButtons : {};
    const statusBarPixelSizeY = statusBarCharPixelSizeY * statusBarZoom(screenSize);
    const x = 0;
    const y = statusBarPixelSizeY;
    const w = screenSize[0];
    const h = screenSize[1] - 2 * statusBarPixelSizeY;
    const buttonSizePixels = Math.min(80, Math.floor(Math.min(w, h) / 5));
    const bw = buttonSizePixels;
    const bh = buttonSizePixels;
    const r = 8;
    const inGame = state.gameMode === (0, _types.GameMode).Mansion;
    const buttonData = [
        {
            action: "menu",
            rect: new (0, _controllers.Rect)(x + r, y + h - bh - r, bw, bh),
            tileInfo: tt["menu"],
            visible: true
        },
        {
            action: "zoomIn",
            rect: new (0, _controllers.Rect)(x + w - bw - r, y + h - bh - r, bw, bh),
            tileInfo: tt["zoomIn"],
            visible: inGame
        },
        {
            action: "zoomOut",
            rect: new (0, _controllers.Rect)(x + w - bw - r, y + h - 2 * bh - r, bw, bh),
            tileInfo: tt["zoomOut"],
            visible: inGame
        },
        {
            action: "left",
            rect: new (0, _controllers.Rect)(x + r, y + bh + r, bw, bh),
            tileInfo: tt["left"],
            visible: true
        },
        {
            action: "right",
            rect: new (0, _controllers.Rect)(x + 2 * bw + r, y + bh + r, bw, bh),
            tileInfo: tt["right"],
            visible: true
        },
        {
            action: "up",
            rect: new (0, _controllers.Rect)(x + bw + r, y + 2 * bh + r, bw, bh),
            tileInfo: tt["up"],
            visible: true
        },
        {
            action: "down",
            rect: new (0, _controllers.Rect)(x + bw + r, y + r, bw, bh),
            tileInfo: tt["down"],
            visible: true
        },
        {
            action: "wait",
            rect: new (0, _controllers.Rect)(x + bw + r, y + bh + r, bw, bh),
            tileInfo: tt["wait"],
            visible: inGame
        },
        {
            action: "jump",
            rect: new (0, _controllers.Rect)(x + w - 1.75 * bw - r, y + 0.75 * bw + r, 1.5 * bw, 1.5 * bh),
            tileInfo: tt["jump"],
            visible: inGame
        },
        {
            action: "menuAccept",
            rect: new (0, _controllers.Rect)(x + w - 1.75 * bw - r, y + 0.75 * bw + r, 1.5 * bw, 1.5 * bh),
            tileInfo: tt["menuAccept"],
            visible: !inGame
        }
    ];
    const emptyRect = new (0, _controllers.Rect)();
    for (const b of buttonData)touchController.updateCoreTouchTarget(b.action, b.visible ? b.rect : emptyRect, b.tileInfo);
}
function updateCamera(state, screenSize, dt) {
    const kSpring = 8; // spring constant, radians/sec
    const zoomError = state.zoomLevel - state.camera.zoom;
    const zoomVelocityError = -state.camera.zoomVelocity;
    const zoomAcceleration = (2 * zoomVelocityError + zoomError * kSpring) * kSpring;
    const zoomVelocityNew = state.camera.zoomVelocity + zoomAcceleration * dt;
    state.camera.zoom += (state.camera.zoomVelocity + zoomVelocityNew) * (0.5 * dt);
    state.camera.zoomVelocity = zoomVelocityNew;
    state.camera.scale = Math.pow(zoomPower, state.camera.zoom);
    const velNew = (0, _myMatrix.vec2).create();
    if (!state.camera.panning) {
        // Figure out where the camera should be pointed
        const posCameraTarget = (0, _myMatrix.vec2).create();
        const scaleTarget = Math.pow(zoomPower, state.zoomLevel);
        cameraTargetCenterPosition(posCameraTarget, (0, _myMatrix.vec2).fromValues(state.gameMap.cells.sizeX, state.gameMap.cells.sizeY), scaleTarget, screenSize, state.player.pos);
        // Update player follow
        const posError = (0, _myMatrix.vec2).create();
        (0, _myMatrix.vec2).subtract(posError, posCameraTarget, state.camera.position);
        const velError = (0, _myMatrix.vec2).create();
        (0, _myMatrix.vec2).negate(velError, state.camera.velocity);
        const acc = (0, _myMatrix.vec2).create();
        (0, _myMatrix.vec2).scale(acc, posError, kSpring ** 2);
        (0, _myMatrix.vec2).scaleAndAdd(acc, acc, velError, 2 * kSpring);
        (0, _myMatrix.vec2).scaleAndAdd(velNew, state.camera.velocity, acc, dt);
    }
    (0, _myMatrix.vec2).scaleAndAdd(state.camera.position, state.camera.position, state.camera.velocity, 0.5 * dt);
    (0, _myMatrix.vec2).scaleAndAdd(state.camera.position, state.camera.position, velNew, 0.5 * dt);
    (0, _myMatrix.vec2).copy(state.camera.velocity, velNew);
}
function zoomToFitCamera(state, screenSize) {
    const statusBarPixelSizeY = statusBarCharPixelSizeY * statusBarZoom(screenSize);
    const viewportTileSizeX = screenSize[0] / pixelsPerTileX;
    const viewportTileSizeY = (screenSize[1] - 2 * statusBarPixelSizeY) / pixelsPerTileY;
    const worldTileSizeX = state.gameMap.cells.sizeX;
    const worldTileSizeY = state.gameMap.cells.sizeY;
    if (viewportTileSizeX * worldTileSizeY < viewportTileSizeY * worldTileSizeX) // horizontal dimension is limiting dimension. zoom to fit horizontally
    state.zoomLevel = Math.log(viewportTileSizeX / worldTileSizeX) / Math.log(zoomPower);
    else // vertical dimension is limiting. zoom to fit vertically
    state.zoomLevel = Math.log(viewportTileSizeY / worldTileSizeY) / Math.log(zoomPower);
    state.zoomLevel = Math.max(0, Math.floor(state.zoomLevel));
}
function snapCamera(state, screenSize) {
    state.camera.zoom = state.zoomLevel;
    state.camera.zoomVelocity = 0;
    state.camera.scale = Math.pow(zoomPower, state.camera.zoom);
    cameraTargetCenterPosition(state.camera.position, (0, _myMatrix.vec2).fromValues(state.gameMap.cells.sizeX, state.gameMap.cells.sizeY), state.camera.scale, screenSize, state.player.pos);
    (0, _myMatrix.vec2).zero(state.camera.velocity);
}
function cameraTargetCenterPosition(posCameraCenter, worldSize, zoomScale, screenSize, posPlayer) {
    const posCenterMin = (0, _myMatrix.vec2).create();
    const posCenterMax = (0, _myMatrix.vec2).create();
    cameraCenterPositionLegalRange(worldSize, screenSize, zoomScale, posCenterMin, posCenterMax);
    posCameraCenter[0] = Math.max(posCenterMin[0], Math.min(posCenterMax[0], posPlayer[0] + 0.5));
    posCameraCenter[1] = Math.max(posCenterMin[1], Math.min(posCenterMax[1], posPlayer[1] + 0.5));
}
function cameraCenterPositionLegalRange(worldSize, screenSize, zoomScale, posLegalMin, posLegalMax) {
    const statusBarPixelSizeY = statusBarCharPixelSizeY * statusBarZoom(screenSize);
    const viewPixelSizeX = screenSize[0];
    const viewPixelSizeY = screenSize[1] - 2 * statusBarPixelSizeY;
    const viewWorldSizeX = viewPixelSizeX / (pixelsPerTileX * zoomScale);
    const viewWorldSizeY = viewPixelSizeY / (pixelsPerTileY * zoomScale);
    let viewCenterMinX = viewWorldSizeX / 2;
    let viewCenterMaxX = worldSize[0] - viewWorldSizeX / 2;
    if (viewCenterMinX > viewCenterMaxX) viewCenterMinX = viewCenterMaxX = worldSize[0] / 2;
    let viewCenterMinY = viewWorldSizeY / 2;
    let viewCenterMaxY = worldSize[1] - viewWorldSizeY / 2;
    if (viewCenterMinY > viewCenterMaxY) viewCenterMinY = viewCenterMaxY = worldSize[1] / 2;
    posLegalMin[0] = viewCenterMinX;
    posLegalMin[1] = viewCenterMinY;
    posLegalMax[0] = viewCenterMaxX;
    posLegalMax[1] = viewCenterMaxY;
}
function setupViewMatrix(state, screenSize, matScreenFromWorld) {
    const statusBarPixelSizeY = statusBarCharPixelSizeY * statusBarZoom(screenSize);
    const viewportPixelSize = (0, _myMatrix.vec2).fromValues(screenSize[0], screenSize[1] - 2 * statusBarPixelSizeY);
    const [viewWorldSizeX, viewWorldSizeY] = viewWorldSize(viewportPixelSize, state.camera.scale);
    const viewWorldCenterX = state.camera.position[0];
    const viewWorldCenterY = state.camera.position[1];
    const statusBarWorldSizeY = statusBarPixelSizeY / (pixelsPerTileY * state.camera.scale);
    const viewWorldMinX = viewWorldCenterX - viewWorldSizeX / 2;
    const viewWorldMinY = viewWorldCenterY - viewWorldSizeY / 2;
    (0, _myMatrix.mat4).ortho(matScreenFromWorld, viewWorldMinX, viewWorldMinX + viewWorldSizeX, viewWorldMinY - statusBarWorldSizeY, viewWorldMinY + viewWorldSizeY + statusBarWorldSizeY, 1, -1);
}
function viewWorldSize(viewportPixelSize, zoomScale) {
    const zoomedPixelsPerTileX = pixelsPerTileX * zoomScale;
    const zoomedPixelsPerTileY = pixelsPerTileY * zoomScale;
    const viewWorldSizeX = viewportPixelSize[0] / zoomedPixelsPerTileX;
    const viewWorldSizeY = viewportPixelSize[1] / zoomedPixelsPerTileY;
    return [
        viewWorldSizeX,
        viewWorldSizeY
    ];
}
function statusBarZoom(screenSize) {
    const minCharsX = 45;
    const minCharsY = 25;
    const scaleLargestX = Math.max(1, screenSize[0] / (statusBarCharPixelSizeX * minCharsX));
    const scaleLargestY = Math.max(1, screenSize[1] / (statusBarCharPixelSizeY * minCharsY));
    const scaleFactor = Math.floor(Math.min(scaleLargestX, scaleLargestY) * 2) / 2;
    return scaleFactor;
}
function renderTextBox(renderer, screenSize, state) {
    if (state.popups.currentPopupTimeRemaining <= 0) return;
    const message = state.popups.currentPopup;
    if (message.length === 0) return;
    const tileZoom = statusBarZoom(screenSize);
    const pixelsPerCharX = tileZoom * statusBarCharPixelSizeX;
    const pixelsPerCharY = tileZoom * statusBarCharPixelSizeY;
    const worldToPixelScaleX = pixelsPerTileX * state.camera.scale;
    const worldToPixelScaleY = pixelsPerTileY * state.camera.scale;
    const viewportPixelSize = (0, _myMatrix.vec2).fromValues(screenSize[0], screenSize[1] - 2 * pixelsPerCharY);
    const [viewWorldSizeX, viewWorldSizeY] = viewWorldSize(viewportPixelSize, state.camera.scale);
    const viewWorldCenterX = state.camera.position[0];
    const viewWorldCenterY = state.camera.position[1];
    const playerPixelY = Math.floor((state.player.pos[1] + 0.5 - viewWorldCenterY + viewWorldSizeY / 2) * worldToPixelScaleY) + pixelsPerCharY;
    const posPopupWorld = state.popups.currentPopupWorldPos();
    const popupPixelX = Math.floor((posPopupWorld[0] + 0.5 - viewWorldCenterX + viewWorldSizeX / 2) * worldToPixelScaleX);
    const popupPixelY = Math.floor((posPopupWorld[1] + 0.5 - viewWorldCenterY + viewWorldSizeY / 2) * worldToPixelScaleY) + pixelsPerCharY;
    const lines = message.split("\n");
    const numCharsX = lines.reduce((maxLen, line)=>Math.max(maxLen, line.length), 0);
    const numCharsY = lines.length;
    const matScreenFromWorld = (0, _myMatrix.mat4).create();
    (0, _myMatrix.mat4).ortho(matScreenFromWorld, 0, screenSize[0], 0, screenSize[1], 1, -1);
    const marginX = tileZoom * 4;
    const marginY = tileZoom * 2;
    const border = tileZoom * 2;
    const rectSizeX = numCharsX * pixelsPerCharX + 2 * (marginX + border);
    const rectSizeY = numCharsY * pixelsPerCharY + 2 * (marginY + border);
    let yMin;
    const xMin = Math.floor(Math.max(0, Math.min(screenSize[0] - rectSizeX, popupPixelX - rectSizeX / 2)));
    if (playerPixelY <= popupPixelY) yMin = Math.floor(popupPixelY + 1.0 * worldToPixelScaleY);
    else yMin = Math.floor(popupPixelY + -0.5 * worldToPixelScaleY - rectSizeY);
    yMin = Math.max(pixelsPerCharY, Math.min(screenSize[1] - (pixelsPerCharY + rectSizeY), yMin));
    renderer.start(matScreenFromWorld, 0);
    renderer.addGlyph(xMin, yMin, xMin + numCharsX * pixelsPerCharX + 2 * (marginX + border), yMin + numCharsY * pixelsPerCharY + 2 * (marginY + border), {
        textureIndex: 219,
        color: 0xff080808
    });
    renderer.addGlyph(xMin + border, yMin + border, xMin + numCharsX * pixelsPerCharX + 2 * marginX + border, yMin + numCharsY * pixelsPerCharY + 2 * marginY + border, {
        textureIndex: 219,
        color: 0xffd0d0d0
    });
    let y = yMin + (numCharsY - 1) * pixelsPerCharY + marginY + border;
    for (const line of lines){
        let x = Math.floor(xMin + marginX + border + (numCharsX - line.length) * pixelsPerCharX / 2);
        for(let i = 0; i < line.length; ++i){
            const glyphIndex = line.charCodeAt(i);
            renderer.addGlyph(x, y, x + pixelsPerCharX, y + pixelsPerCharY, {
                textureIndex: glyphIndex,
                color: 0xff080808
            });
            x += pixelsPerCharX;
        }
        y -= pixelsPerCharY;
    }
    renderer.flush();
}
function renderTopStatusBar(renderer, screenSize, state) {
    const tileZoom = statusBarZoom(screenSize);
    const screenSizeInTilesX = screenSize[0] / (tileZoom * statusBarCharPixelSizeX);
    const screenSizeInTilesY = screenSize[1] / (tileZoom * statusBarCharPixelSizeY);
    const offsetTilesY = 1 - screenSizeInTilesY;
    const matScreenFromWorld = (0, _myMatrix.mat4).create();
    (0, _myMatrix.mat4).ortho(matScreenFromWorld, 0, screenSizeInTilesX, offsetTilesY, screenSizeInTilesY + offsetTilesY, 1, -1);
    renderer.start(matScreenFromWorld, 0);
    const colorBackground = colorLerp(0xff101010, 0xff404040, 1 - (1 - state.topStatusMessageAnim) ** 2);
    renderer.addGlyph(0, 0, screenSizeInTilesX, 1, {
        textureIndex: fontTileSet.background.textureIndex,
        color: colorBackground,
        unlitColor: colorBackground
    });
    if (state.dailyRun) putString(renderer, 0, "Daily run", _colorPreset.lightYellow);
    const message = state.topStatusMessage;
    const messageX = (screenSizeInTilesX - message.length) / 2;
    putString(renderer, messageX, message, _colorPreset.lightGray);
    renderer.flush();
}
function colorLerp(color0, color1, u) {
    const r0 = color0 & 255;
    const g0 = color0 >> 8 & 255;
    const b0 = color0 >> 16 & 255;
    const a0 = color0 >> 24 & 255;
    const r1 = color1 & 255;
    const g1 = color1 >> 8 & 255;
    const b1 = color1 >> 16 & 255;
    const a1 = color1 >> 24 & 255;
    const r = Math.max(0, Math.min(255, Math.trunc(r0 + (r1 - r0) * u)));
    const g = Math.max(0, Math.min(255, Math.trunc(g0 + (g1 - g0) * u)));
    const b = Math.max(0, Math.min(255, Math.trunc(b0 + (b1 - b0) * u)));
    const a = Math.max(0, Math.min(255, Math.trunc(a0 + (a1 - a0) * u)));
    return r + (g << 8) + (b << 16) + (a << 24);
}
function putString(renderer, x, s, color) {
    for(let i = 0; i < s.length; ++i){
        let glyphIndex = s.charCodeAt(i);
        if (glyphIndex === 10) glyphIndex = 32;
        renderer.addGlyph(x, 0, x + 1, 1, {
            textureIndex: glyphIndex,
            color: color
        });
        ++x;
    }
}
function renderBottomStatusBar(renderer, screenSize, state) {
    const tileZoom = statusBarZoom(screenSize);
    const screenSizeInTilesX = screenSize[0] / (tileZoom * statusBarCharPixelSizeX);
    const screenSizeInTilesY = screenSize[1] / (tileZoom * statusBarCharPixelSizeY);
    const matScreenFromWorld = (0, _myMatrix.mat4).create();
    (0, _myMatrix.mat4).ortho(matScreenFromWorld, 0, screenSizeInTilesX, 0, screenSizeInTilesY, 1, -1);
    renderer.start(matScreenFromWorld, 0);
    renderer.addGlyph(0, 0, screenSizeInTilesX, 1, fontTileSet.background);
    let leftSideX = 1;
    const playerUnderwater = state.gameMap.cells.at(state.player.pos[0], state.player.pos[1]).type == (0, _gameMap.TerrainType).GroundWater && state.player.turnsRemainingUnderwater > 0;
    if (playerUnderwater) {
        // Underwater indicator
        const glyphBubble = fontTileSet.air.textureIndex;
        for(let i = 0; i < (0, _gameMap.maxPlayerTurnsUnderwater) - 2; ++i){
            const color = i < state.player.turnsRemainingUnderwater - 1 ? _colorPreset.lightCyan : _colorPreset.darkGray;
            renderer.addGlyph(leftSideX, 0, leftSideX + 1, 1, {
                textureIndex: glyphBubble,
                color: color
            });
            ++leftSideX;
        }
    } else {
        // Health indicator
        const glyphHeart = fontTileSet.heart.textureIndex;
        for(let i = 0; i < (0, _gameMap.maxPlayerHealth); ++i){
            const color = i < state.player.health ? _colorPreset.darkRed : _colorPreset.darkGray;
            renderer.addGlyph(leftSideX, 0, leftSideX + 1, 1, {
                textureIndex: glyphHeart,
                color: color
            });
            ++leftSideX;
        }
    }
    // Leap toggle indicator
    ++leftSideX;
    const msgLeapToggle = "Leap";
    if (state.leapToggleActive) putString(renderer, leftSideX, msgLeapToggle, _colorPreset.lightGreen);
    leftSideX += msgLeapToggle.length;
    let rightSideX = screenSizeInTilesX;
    const percentRevealed = Math.floor(state.gameMap.fractionRevealed() * 100);
    if (percentRevealed >= 100) {
        // Total loot
        let msgLoot = "Loot " + state.lootStolen + "/" + (percentRevealed >= 100 ? state.lootAvailable : "?");
        rightSideX -= msgLoot.length + 1;
        putString(renderer, rightSideX, msgLoot, _colorPreset.lightYellow);
    } else {
        // Mapping percentage
        let msgSeen = "Map " + percentRevealed + "%";
        rightSideX -= msgSeen.length + 1;
        putString(renderer, rightSideX, msgSeen, _colorPreset.white);
    }
    // Key possession
    const msgKey = "Key";
    if (state.player.hasVaultKey) {
        rightSideX -= msgKey.length + 1;
        putString(renderer, rightSideX, msgKey, _colorPreset.lightCyan);
    }
    // Level number, turn count, and speed bonus
    const msgLevel = "Lvl " + (state.level + 1);
    let msgTimer = state.turns + "/" + numTurnsParForCurrentMap(state);
    const ghosted = state.levelStats.numSpottings === 0;
    if (!ghosted) msgTimer += "!";
    const centeredX = (leftSideX + rightSideX - (msgLevel.length + msgTimer.length + 1)) / 2;
    putString(renderer, centeredX, msgLevel, _colorPreset.lightGray);
    putString(renderer, centeredX + msgLevel.length + 1, msgTimer, _colorPreset.darkGray);
    renderer.flush();
}
function getCurrentDateFormatted(date = null, utcConvert = true) {
    const currentDate = date ?? new Date();
    // Extract the year, month, and day from the Date object
    const year = utcConvert ? currentDate.getUTCFullYear() : currentDate.getFullYear();
    const month = 1 + (utcConvert ? currentDate.getUTCMonth() : currentDate.getMonth()); // Months are 0-indexed, so we add 1
    const day = utcConvert ? currentDate.getUTCDate() : currentDate.getDate();
    // Format the date components as strings with proper padding
    const yearString = String(year);
    const monthString = String(month).padStart(2, "0");
    const dayString = String(day).padStart(2, "0");
    // Concatenate the date components using the desired format
    const formattedDate = `${yearString}/${monthString}/${dayString}`;
    return formattedDate;
}

},{"./my-matrix":"21x0k","./create-map":"gnPbX","./game-map":"3bH7G","./animation":"iKgaV","./guard":"bP2Su","./render":"9AS2t","./random":"gUC1v","./tilesets":"3SSZh","./audio":"1vRTt","./popups":"eiIYq","./controllers":"ldPU4","./ui":"iGTI0","./types":"38MWl","./color-preset":"37fo9","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"21x0k":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "vec2", ()=>vec2);
parcelHelpers.export(exports, "mat4", ()=>mat4);
class vec2 extends Array {
    constructor(...args){
        super(...args);
    }
    static fromValues(x, y) {
        return new vec2(x, y);
    }
    static create() {
        return new vec2(0, 0);
    }
    static clone(v) {
        return new vec2(v[0], v[1]);
    }
    equals(v) {
        return this[0] === v[0] && this[1] === v[1];
    }
    equalsValues(x, y) {
        return this[0] === x && this[1] === y;
    }
    copy(v) {
        this[0] = v[0];
        this[1] = v[1];
    }
    set(x0, x1) {
        this[0] = x0;
        this[1] = x1;
    }
    add(b) {
        return vec2.fromValues(this[0] + b[0], this[1] + b[1]);
    }
    subtract(b) {
        return vec2.fromValues(this[0] - b[0], this[1] - b[1]);
    }
    multiply(b) {
        return vec2.fromValues(this[0] * b[0], this[1] * b[1]);
    }
    scale(scale) {
        return vec2.fromValues(this[0] * scale, this[1] * scale);
    }
    scaleAndAdd(b, scale) {
        return vec2.fromValues(this[0] + b[0] * scale, this[1] + b[1] * scale);
    }
    distance(b) {
        const x = this[0] - b[0];
        const y = this[1] - b[1];
        return Math.hypot(x, y);
    }
    squaredDistance(b) {
        const x = this[0] - b[0];
        const y = this[1] - b[1];
        return x * x + y * y;
    }
    len() {
        return Math.hypot(this[0], this[1]);
    }
    squaredLen(a) {
        const x = this[0];
        const y = this[1];
        return x * x + y * y;
    }
    negate() {
        return vec2.fromValues(-this[0], -this[1]);
    }
    dot(b) {
        return this[0] * b[0] + this[1] * b[1];
    }
    lerp(b, t) {
        return vec2.fromValues(this[0] + t * (b[0] - this[0]), this[1] + t * (b[1] - this[1]));
    }
    zero() {
        this[0] = 0;
        this[1] = 0;
    }
    static copy(result, v) {
        result[0] = v[0];
        result[1] = v[1];
    }
    static set(result, x0, x1) {
        result[0] = x0;
        result[1] = x1;
    }
    static add(result, a, b) {
        result[0] = a[0] + b[0];
        result[1] = a[1] + b[1];
    }
    static subtract(result, a, b) {
        result[0] = a[0] - b[0];
        result[1] = a[1] - b[1];
    }
    static multiply(result, a, b) {
        result[0] = a[0] * b[0];
        result[1] = a[1] * b[1];
    }
    static scale(result, a, scale) {
        result[0] = a[0] * scale;
        result[1] = a[1] * scale;
    }
    static scaleAndAdd(result, a, b, scale) {
        result[0] = a[0] + b[0] * scale;
        result[1] = a[1] + b[1] * scale;
    }
    static distance(a, b) {
        const x = a[0] - b[0];
        const y = a[1] - b[1];
        return Math.hypot(x, y);
    }
    static squaredDistance(a, b) {
        const x = a[0] - b[0];
        const y = a[1] - b[1];
        return x * x + y * y;
    }
    static len(a) {
        return Math.hypot(a[0], a[1]);
    }
    static squaredLen(a) {
        const x = a[0];
        const y = a[1];
        return x * x + y * y;
    }
    static negate(result, a) {
        result[0] = -a[0];
        result[1] = -a[1];
    }
    static dot(a, b) {
        return a[0] * b[0] + a[1] * b[1];
    }
    static lerp(result, a, b, t) {
        result[0] = a[0] + t * (b[0] - a[0]);
        result[1] = a[1] + t * (b[1] - a[1]);
    }
    static zero(result) {
        result[0] = 0;
        result[1] = 0;
    }
}
let mat4;
(function(mat4) {
    function create() {
        return [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
        ];
    }
    mat4.create = create;
    function copy(result, a) {
        result[0] = a[0];
        result[1] = a[1];
        result[2] = a[2];
        result[3] = a[3];
        result[4] = a[4];
        result[5] = a[5];
        result[6] = a[6];
        result[7] = a[7];
        result[8] = a[8];
        result[9] = a[9];
        result[10] = a[10];
        result[11] = a[11];
        result[12] = a[12];
        result[13] = a[13];
        result[14] = a[14];
        result[15] = a[15];
    }
    mat4.copy = copy;
    function ortho(result, left, right, bottom, top, near, far) {
        const lr = 1 / (left - right);
        const bt = 1 / (bottom - top);
        const nf = 1 / (near - far);
        result[0] = -2 * lr;
        result[1] = 0;
        result[2] = 0;
        result[3] = 0;
        result[4] = 0;
        result[5] = -2 * bt;
        result[6] = 0;
        result[7] = 0;
        result[8] = 0;
        result[9] = 0;
        result[10] = 2 * nf;
        result[11] = 0;
        result[12] = (left + right) * lr;
        result[13] = (top + bottom) * bt;
        result[14] = (far + near) * nf;
        result[15] = 1;
    }
    mat4.ortho = ortho;
})(mat4 || (mat4 = {}));

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"gkKU3":[function(require,module,exports) {
exports.interopDefault = function(a) {
    return a && a.__esModule ? a : {
        default: a
    };
};
exports.defineInteropFlag = function(a) {
    Object.defineProperty(a, "__esModule", {
        value: true
    });
};
exports.exportAll = function(source, dest) {
    Object.keys(source).forEach(function(key) {
        if (key === "default" || key === "__esModule" || dest.hasOwnProperty(key)) return;
        Object.defineProperty(dest, key, {
            enumerable: true,
            get: function() {
                return source[key];
            }
        });
    });
    return dest;
};
exports.export = function(dest, destName, get) {
    Object.defineProperty(dest, destName, {
        enumerable: true,
        get: get
    });
};

},{}],"gnPbX":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "createGameMap", ()=>createGameMap);
parcelHelpers.export(exports, "createGameMapRoughPlans", ()=>createGameMapRoughPlans);
var _gameMap = require("./game-map");
var _guard = require("./guard");
var _myMatrix = require("./my-matrix");
var _random = require("./random");
const roomSizeX = 5;
const roomSizeY = 5;
const outerBorder = 3;
const levelShapeInfo = [
    //xmin,xmax,ymin,ymax,areamin,areamax -- params used to constrain the map size
    [
        3,
        3,
        2,
        2,
        6,
        6
    ],
    [
        3,
        5,
        2,
        5,
        6,
        12
    ],
    [
        3,
        5,
        2,
        6,
        9,
        15
    ],
    [
        3,
        5,
        2,
        6,
        12,
        18
    ],
    [
        3,
        7,
        3,
        6,
        15,
        21
    ],
    [
        3,
        7,
        3,
        6,
        18,
        24
    ],
    [
        3,
        7,
        3,
        6,
        21,
        30
    ],
    [
        5,
        7,
        4,
        6,
        24,
        36
    ],
    [
        5,
        9,
        4,
        6,
        30,
        42
    ],
    [
        7,
        9,
        7,
        9,
        36,
        49
    ]
];
let LevelType;
(function(LevelType) {
    LevelType[LevelType["Mansion"] = 0] = "Mansion";
    LevelType[LevelType["Fortress"] = 1] = "Fortress";
})(LevelType || (LevelType = {}));
let RoomType;
(function(RoomType) {
    RoomType[RoomType["Exterior"] = 0] = "Exterior";
    RoomType[RoomType["PublicCourtyard"] = 1] = "PublicCourtyard";
    RoomType[RoomType["PublicRoom"] = 2] = "PublicRoom";
    RoomType[RoomType["PrivateCourtyard"] = 3] = "PrivateCourtyard";
    RoomType[RoomType["PrivateRoom"] = 4] = "PrivateRoom";
    RoomType[RoomType["Vault"] = 5] = "Vault";
    RoomType[RoomType["Bedroom"] = 6] = "Bedroom";
    RoomType[RoomType["Dining"] = 7] = "Dining";
    RoomType[RoomType["PublicLibrary"] = 8] = "PublicLibrary";
    RoomType[RoomType["PrivateLibrary"] = 9] = "PrivateLibrary";
    RoomType[RoomType["Kitchen"] = 10] = "Kitchen";
})(RoomType || (RoomType = {}));
let DoorType;
(function(DoorType) {
    DoorType[DoorType["Standard"] = 0] = "Standard";
    DoorType[DoorType["GateFront"] = 1] = "GateFront";
    DoorType[DoorType["GateBack"] = 2] = "GateBack";
    DoorType[DoorType["Locked"] = 3] = "Locked";
})(DoorType || (DoorType = {}));
function levelTypeFromLevel(level) {
    return level === 9 ? LevelType.Fortress : LevelType.Mansion;
}
function createGameMapRoughPlans(numMaps, totalLoot, rng) {
    const gameMapRoughPlans = [];
    // Establish the level sizes
    for(let level = 0; level < numMaps; ++level){
        const levelRNG = new (0, _random.RNG)("lvl" + level + rng.random());
        const levelType = levelTypeFromLevel(level);
        const [numRoomsX, numRoomsY] = makeLevelSize(level, levelType, levelRNG);
        gameMapRoughPlans.push({
            numRoomsX: numRoomsX,
            numRoomsY: numRoomsY,
            totalLoot: 0,
            rng: levelRNG,
            played: false
        });
    }
    // Distribute the total loot in proportion to each level's size
    let totalArea = 0;
    for (const gameMapRoughPlan of gameMapRoughPlans){
        const area = gameMapRoughPlan.numRoomsX * gameMapRoughPlan.numRoomsY;
        totalArea += area;
    }
    let totalLootPlaced = 0;
    for (const gameMapRoughPlan of gameMapRoughPlans){
        const area = gameMapRoughPlan.numRoomsX * gameMapRoughPlan.numRoomsY;
        const loot = Math.floor(totalLoot * area / totalArea);
        totalLootPlaced += loot;
        gameMapRoughPlan.totalLoot = loot;
    }
    // Put any leftover loot needed in the last level
    gameMapRoughPlans[gameMapRoughPlans.length - 1].totalLoot += totalLoot - totalLootPlaced;
    // Debug print the plans
    /*
    for (let i = 0; i < gameMapRoughPlans.length; ++i) {
        const plan = gameMapRoughPlans[i];
        console.log('Level', i, 'size', plan.numRoomsX, 'by', plan.numRoomsY, 'gold', plan.totalLoot);
    }
    */ return gameMapRoughPlans;
}
function makeLevelSize(level, levelType, rng) {
    let xmin, xmax, ymin, ymax, Amin, Amax;
    [xmin, xmax, ymin, ymax, Amin, Amax] = levelShapeInfo[level];
    const x = xmin + 2 * rng.randomInRange(1 + (xmax - xmin) / 2);
    let y = ymin + rng.randomInRange(1 + ymax - ymin);
    y = Math.min(Math.floor(Amax / x), y);
    y = Math.max(y, Math.ceil(Amin / x));
    // Ensure LevelType.Fortress levels have odd number of rooms vertically
    // (All levels have an odd number of rooms horizontally)
    if (levelType === LevelType.Fortress && (y & 1) === 0) {
        if (y > 5) --y;
        else ++y;
    }
    return [
        x,
        y
    ];
}
function createGameMap(level, plan) {
    const rng = plan.rng;
    rng.reset();
    const levelType = levelTypeFromLevel(level);
    // Designate rooms as interior or courtyard
    const inside = new (0, _gameMap.BooleanGrid)(plan.numRoomsX, plan.numRoomsY, true);
    switch(levelType){
        case LevelType.Mansion:
            makeSiheyuanRoomGrid(inside, rng);
            break;
        case LevelType.Fortress:
            const ringCourtyard = rng.random() < 0.5;
            for(let x = 0; x < plan.numRoomsX; ++x)for(let y = 0; y < plan.numRoomsY; ++y){
                const dx = Math.min(x, plan.numRoomsX - 1 - x);
                const dy = Math.min(y, plan.numRoomsY - 1 - y);
                const d = Math.min(dx, dy);
                inside.set(x, y, d !== 1 || !ringCourtyard && y > 1 && dx !== 1);
            }
            break;
    }
    // Randomly offset walls, and establish mirror relationships between them
    const mirrorRoomsX = (plan.numRoomsX & 1) === 1;
    const mirrorRoomsY = (plan.numRoomsY & 1) === 1 && levelType === LevelType.Fortress;
    const [offsetX, offsetY] = offsetWalls(plan.numRoomsX, plan.numRoomsY, rng);
    // Enforce symmetry by overwriting one area with another area
    if (mirrorRoomsX) {
        mirrorInteriorLeftToRight(inside);
        mirrorOffsetsLeftToRight(offsetX, offsetY);
    }
    if (mirrorRoomsY) {
        mirrorOffsetsBottomToTop(offsetX, offsetY);
        if (levelType !== LevelType.Fortress) mirrorInteriorBottomToTop(inside);
    }
    // Translate the building so it abuts the X and Y axes with outerBorder padding
    offsetBuilding(offsetX, offsetY, outerBorder);
    // Make a set of rooms.
    const [rooms, roomIndex] = createRooms(inside, offsetX, offsetY);
    // Compute a list of room adjacencies.
    const mirrorAdjacencies = rng.randomInRange(24) >= level;
    const mirrorAdjacenciesX = mirrorRoomsX && mirrorAdjacencies;
    const mirrorAdjacenciesY = mirrorRoomsY && mirrorAdjacencies;
    const adjacencies = computeAdjacencies(mirrorAdjacenciesX, mirrorAdjacenciesY, offsetX, offsetY, rooms, roomIndex);
    storeAdjacenciesInRooms(adjacencies);
    // Connect rooms together.
    connectRooms(rooms, adjacencies, level, levelType, rng);
    // Join a pair of rooms together.
    makeDoubleRooms(rooms, adjacencies, rng);
    // Compute room distances from entrance.
    computeRoomBetweenness(rooms);
    computeRoomDepths(rooms);
    // Assign types to the rooms.
    assignRoomTypes(rooms, level, rng);
    // Create the actual map
    const map = createBlankGameMap(rooms);
    // Render doors and windows.
    renderWalls(levelType, adjacencies, map, rng);
    // Render floors.
    renderRooms(level, rooms, map, rng);
    // Set player start position
    map.playerStartPos = playerStartPosition(level, adjacencies, map);
    // Additional decorations
    const outsidePatrolRoute = {
        rooms: [
            rooms[0]
        ],
        path: outerBuildingPerimeter(adjacencies, map)
    };
    placeExteriorBushes(map, outsidePatrolRoute.path, rng);
    placeFrontPillars(map);
    // Convert walls to proper straight, corner, T-junction, cross tiles
    fixupWalls(map.cells);
    // Cache info about how the cells in the map affect sound, lighting, and movement
    cacheCellInfo(map);
    // Place patrol routes
    let patrolRoutes;
    if (level < 1) patrolRoutes = [];
    else if (level < 2) patrolRoutes = placePatrolRouteSingle(level, map, rooms, outsidePatrolRoute, rng);
    else patrolRoutes = placePatrolRoutesDense(level, map, rooms, adjacencies, outsidePatrolRoute, rng);
    addStationaryPatrols(level, map, rooms, adjacencies, patrolRoutes, rng);
    // Place loot
    const needKey = map.items.find((item)=>item.type === (0, _gameMap.ItemType).LockedDoorNS || item.type === (0, _gameMap.ItemType).LockedDoorEW) !== undefined;
    const guardsAvailableForLoot = patrolRoutes.length - (needKey ? 1 : 0);
    const guardLoot = Math.min(Math.floor(level / 3), Math.min(guardsAvailableForLoot, plan.totalLoot));
    placeLoot(plan.totalLoot - guardLoot, rooms, map, rng);
    placeHealth(level, map, rooms, rng);
    // Put guards on the patrol routes
    placeGuards(level, map, patrolRoutes, guardLoot, needKey, rng);
    // Final setup
    markExteriorAsSeen(map);
    map.computeLighting();
    map.recomputeVisibility(map.playerStartPos);
    map.adjacencies = adjacencies;
    return map;
}
function makeSiheyuanRoomGrid(inside, rng) {
    const sizeX = inside.sizeX;
    const sizeY = inside.sizeY;
    const halfX = Math.floor((sizeX + 1) / 2);
    const numCourtyardRoomsHalf = Math.floor(sizeY * halfX / 4);
    for(let i = numCourtyardRoomsHalf; i > 0; --i){
        const x = rng.randomInRange(halfX);
        const y = rng.randomInRange(sizeY);
        inside.set(x, y, false);
    }
    for(let y = 0; y < sizeY; ++y)for(let x = halfX; x < sizeX; ++x)inside.set(x, y, inside.get(sizeX - 1 - x, y));
    return inside;
}
function addStationaryPatrols(level, map, rooms, adjacencies, patrolRoutes, rng) {
    if (level < 8) return;
    const ttypes = [
        (0, _gameMap.TerrainType).GroundGrass,
        (0, _gameMap.TerrainType).GroundMarble,
        (0, _gameMap.TerrainType).GroundWood
    ];
    const room = rooms.find((r)=>r.roomType === RoomType.Vault);
    if (room === undefined) return;
    for (let adj of room.edges)if (adj.doorType === DoorType.Locked) {
        let pos = adj.origin;
        const outsideVault = adj.roomLeft.roomType === RoomType.Vault ? adj.roomRight : adj.roomLeft;
        for(let i = 0; i < adj.length; i++){
            if (map.cells.atVec(pos).type === (0, _gameMap.TerrainType).DoorEW || map.cells.atVec(pos).type === (0, _gameMap.TerrainType).DoorNS) {
                if (adj.dir[0] === 0) for (let dx of [
                    -1,
                    1
                ]){
                    const pos0 = pos.add(new (0, _myMatrix.vec2)(dx, 0));
                    if (ttypes.includes(map.cells.atVec(pos0).type)) {
                        patrolRoutes.push({
                            rooms: [
                                outsideVault
                            ],
                            path: [
                                pos0
                            ]
                        });
                        return;
                    }
                }
                if (adj.dir[1] === 0) for (let dy of [
                    -1,
                    1
                ]){
                    const pos0 = pos.add(new (0, _myMatrix.vec2)(0, dy));
                    if (ttypes.includes(map.cells.atVec(pos0).type)) {
                        patrolRoutes.push({
                            rooms: [
                                outsideVault
                            ],
                            path: [
                                pos0
                            ]
                        });
                        return;
                    }
                }
            }
            pos = pos.add(adj.dir);
        }
    }
    return;
}
function offsetWalls(roomsX, roomsY, rng) {
    const offsetX = new (0, _gameMap.Int32Grid)(roomsX + 1, roomsY, 0);
    const offsetY = new (0, _gameMap.Int32Grid)(roomsX, roomsY + 1, 0);
    const straightOutsideWalls = rng.random() < 0.25;
    if (straightOutsideWalls) {
        let i = rng.randomInRange(3) - 1;
        for(let y = 0; y < roomsY; ++y)offsetX.set(0, y, i);
        i = rng.randomInRange(3) - 1;
        for(let y = 0; y < roomsY; ++y)offsetX.set(roomsX, y, i);
        i = rng.randomInRange(3) - 1;
        for(let x = 0; x < roomsX; ++x)offsetY.set(x, 0, i);
        i = rng.randomInRange(3) - 1;
        for(let x = 0; x < roomsX; ++x)offsetY.set(x, roomsY, i);
        for(let x = 1; x < roomsX; ++x)for(let y = 0; y < roomsY; ++y)offsetX.set(x, y, rng.randomInRange(3) - 1);
        for(let x = 0; x < roomsX; ++x)for(let y = 1; y < roomsY; ++y)offsetY.set(x, y, rng.randomInRange(3) - 1);
    } else {
        for(let x = 0; x < roomsX + 1; ++x)for(let y = 0; y < roomsY; ++y)offsetX.set(x, y, rng.randomInRange(3) - 1);
        for(let x = 0; x < roomsX; ++x)for(let y = 0; y < roomsY + 1; ++y)offsetY.set(x, y, rng.randomInRange(3) - 1);
    }
    for(let x = 1; x < roomsX; ++x){
        for(let y = 1; y < roomsY; ++y)if (rng.randomInRange(2) === 0) offsetX.set(x, y, offsetX.get(x, y - 1));
        else offsetY.set(x, y, offsetY.get(x - 1, y));
    }
    // Add in room widths
    for(let x = 0; x < roomsX + 1; ++x)for(let y = 0; y < roomsY; ++y)offsetX.set(x, y, offsetX.get(x, y) + x * roomSizeX);
    for(let x = 0; x < roomsX; ++x)for(let y = 0; y < roomsY + 1; ++y)offsetY.set(x, y, offsetY.get(x, y) + y * roomSizeY);
    return [
        offsetX,
        offsetY
    ];
}
function mirrorInteriorLeftToRight(inside) {
    const roomsX = inside.sizeX;
    const roomsY = inside.sizeY;
    console.assert((roomsX & 1) === 1);
    const roomCenter = (roomsX - 1) / 2;
    for(let x = roomCenter + 1; x < roomsX; ++x)for(let y = 0; y < roomsY; ++y)inside.set(x, y, inside.get(roomsX - 1 - x, y));
}
function mirrorInteriorBottomToTop(inside) {
    const roomsX = inside.sizeX;
    const roomsY = inside.sizeY;
    console.assert((roomsY & 1) === 1);
    const roomCenter = (roomsY - 1) / 2;
    for(let x = 0; x < roomsX; ++x)for(let y = roomCenter + 1; y < roomsY; ++y)inside.set(x, y, inside.get(x, roomsY - 1 - y));
}
function mirrorOffsetsLeftToRight(offsetX, offsetY) {
    const roomsX = offsetY.sizeX;
    const roomsY = offsetX.sizeY;
    console.assert(offsetX.sizeX = roomsX + 1);
    console.assert(offsetY.sizeY = roomsY + 1);
    console.assert((roomsX & 1) === 1);
    const roomCenter = (roomsX - 1) / 2;
    const centerX = Math.floor((roomCenter + 0.5) * roomSizeX + 1);
    // Mirror X wall offsets
    for(let x = roomCenter + 1; x < roomsX + 1; ++x)for(let y = 0; y < roomsY; ++y)offsetX.set(x, y, 2 * centerX - offsetX.get(roomsX - x, y));
    // Mirror Y wall offsets
    for(let x = roomCenter + 1; x < roomsX; ++x)for(let y = 0; y < roomsY + 1; ++y)offsetY.set(x, y, offsetY.get(roomsX - 1 - x, y));
}
function mirrorOffsetsBottomToTop(offsetX, offsetY) {
    const roomsX = offsetY.sizeX;
    const roomsY = offsetX.sizeY;
    console.assert(offsetX.sizeX = roomsX + 1);
    console.assert(offsetY.sizeY = roomsY + 1);
    console.assert((roomsY & 1) === 1);
    const roomCenter = (roomsY - 1) / 2;
    const centerY = Math.floor((roomCenter + 0.5) * roomSizeY + 1);
    // Mirror X wall offsets
    for(let x = 0; x < roomsX + 1; ++x)for(let y = roomCenter + 1; y < roomsY; ++y)offsetX.set(x, y, offsetX.get(x, roomsY - 1 - y));
    // Mirror Y wall offsets
    for(let x = 0; x < roomsX; ++x)for(let y = roomCenter + 1; y < roomsY + 1; ++y)offsetY.set(x, y, 2 * centerY - offsetY.get(x, roomsY - y));
}
function offsetBuilding(offsetX, offsetY, borderSize) {
    const roomsX = offsetY.sizeX;
    const roomsY = offsetX.sizeY;
    let roomOffsetX = Number.MIN_SAFE_INTEGER;
    for(let y = 0; y < roomsY; ++y)roomOffsetX = Math.max(roomOffsetX, -offsetX.get(0, y));
    roomOffsetX += outerBorder;
    for(let x = 0; x < roomsX + 1; ++x)for(let y = 0; y < roomsY; ++y)offsetX.set(x, y, offsetX.get(x, y) + roomOffsetX);
    let roomOffsetY = Number.MIN_SAFE_INTEGER;
    for(let x = 0; x < roomsX; ++x)roomOffsetY = Math.max(roomOffsetY, -offsetY.get(x, 0));
    roomOffsetY += outerBorder;
    for(let x = 0; x < roomsX; ++x)for(let y = 0; y < roomsY + 1; ++y)offsetY.set(x, y, offsetY.get(x, y) + roomOffsetY);
}
function createBlankGameMap(rooms) {
    let mapSizeX = 0;
    let mapSizeY = 0;
    for (const room of rooms){
        mapSizeX = Math.max(mapSizeX, room.posMax[0]);
        mapSizeY = Math.max(mapSizeY, room.posMax[1]);
    }
    mapSizeX += outerBorder + 1;
    mapSizeY += outerBorder + 1;
    const cells = new (0, _gameMap.CellGrid)(mapSizeX, mapSizeY);
    return new (0, _gameMap.GameMap)(cells);
}
function createRooms(inside, offsetX, offsetY) {
    const roomsX = inside.sizeX;
    const roomsY = inside.sizeY;
    const roomIndex = new (0, _gameMap.Int32Grid)(roomsX, roomsY, 0);
    const rooms = [];
    // This room represents the area surrounding the map.
    rooms.push({
        roomType: RoomType.Exterior,
        group: 0,
        depth: 0,
        betweenness: 0,
        privateRoom: false,
        posMin: (0, _myMatrix.vec2).fromValues(0, 0),
        posMax: (0, _myMatrix.vec2).fromValues(0, 0),
        edges: [],
        gridX: -1,
        gridY: -1
    });
    for(let rx = 0; rx < roomsX; ++rx)for(let ry = 0; ry < roomsY; ++ry){
        let group_index = rooms.length;
        roomIndex.set(rx, ry, group_index);
        rooms.push({
            roomType: inside.get(rx, ry) ? RoomType.PublicRoom : RoomType.PublicCourtyard,
            group: group_index,
            depth: 0,
            betweenness: 0,
            privateRoom: false,
            posMin: (0, _myMatrix.vec2).fromValues(offsetX.get(rx, ry) + 1, offsetY.get(rx, ry) + 1),
            posMax: (0, _myMatrix.vec2).fromValues(offsetX.get(rx + 1, ry), offsetY.get(rx, ry + 1)),
            edges: [],
            gridX: rx,
            gridY: ry
        });
    }
    return [
        rooms,
        roomIndex
    ];
}
function computeAdjacencies(mirrorX, mirrorY, offsetX, offsetY, rooms, roomIndex) {
    let roomsX = roomIndex.sizeX;
    let roomsY = roomIndex.sizeY;
    const adjacencies = [];
    {
        const adjacencyRows = [];
        // Rooms along the bottom are all adjacent along their bottoms to room 0 (the exterior)
        {
            const adjacencyRow = [];
            let ry = 0;
            for(let rx = 0; rx < roomsX; ++rx){
                let x0 = offsetX.get(rx, ry);
                let x1 = offsetX.get(rx + 1, ry);
                let y = offsetY.get(rx, ry);
                const adj = {
                    origin: (0, _myMatrix.vec2).fromValues(x0, y),
                    dir: (0, _myMatrix.vec2).fromValues(1, 0),
                    length: x1 - x0,
                    roomLeft: rooms[roomIndex.get(rx, ry)],
                    roomRight: rooms[0],
                    nextMatching: null,
                    door: false,
                    doorType: DoorType.Standard
                };
                adjacencyRow.push(adj);
                adjacencies.push(adj);
            }
            adjacencyRows.push(adjacencyRow);
        }
        // Along the interior lines, generate adjacencies between touching pairs of rooms on either side
        for(let ry = 1; ry < roomsY; ++ry){
            const adjacencyRow = [];
            function addAdj(y, x0, x1, iRoomLeft, iRoomRight) {
                if (x1 - x0 <= 0) return;
                const adj = {
                    origin: (0, _myMatrix.vec2).fromValues(x0, y),
                    dir: (0, _myMatrix.vec2).fromValues(1, 0),
                    length: x1 - x0,
                    roomLeft: rooms[iRoomLeft],
                    roomRight: rooms[iRoomRight],
                    nextMatching: null,
                    door: false,
                    doorType: DoorType.Standard
                };
                adjacencyRow.push(adj);
                adjacencies.push(adj);
            }
            let rxLeft = 0;
            let rxRight = 0;
            while(rxLeft < offsetX.sizeX && rxRight < offsetX.sizeX){
                const xLeft = rxLeft < offsetX.sizeX ? offsetX.get(rxLeft, ry) : Infinity;
                const xRight = rxRight < offsetX.sizeX ? offsetX.get(rxRight, ry - 1) : Infinity;
                const y = offsetY.get(Math.max(0, Math.max(rxLeft, rxRight) - 1), ry);
                if (xLeft < xRight) {
                    const xLeftNext = Math.min(xRight, rxLeft + 1 < offsetX.sizeX ? offsetX.get(rxLeft + 1, ry) : Infinity);
                    const iRoomLeft = rxLeft >= roomIndex.sizeX ? 0 : roomIndex.get(rxLeft, ry);
                    const iRoomRight = rxRight <= 0 ? 0 : roomIndex.get(rxRight - 1, ry - 1);
                    addAdj(y, xLeft, xLeftNext, iRoomLeft, iRoomRight);
                    ++rxLeft;
                } else {
                    const xRightNext = Math.min(xLeft, rxRight + 1 < offsetX.sizeX ? offsetX.get(rxRight + 1, ry - 1) : Infinity);
                    const iRoomLeft = rxLeft <= 0 ? 0 : roomIndex.get(rxLeft - 1, ry);
                    const iRoomRight = rxRight >= roomIndex.sizeX ? 0 : roomIndex.get(rxRight, ry - 1);
                    addAdj(y, xRight, xRightNext, iRoomLeft, iRoomRight);
                    ++rxRight;
                }
            }
            adjacencyRows.push(adjacencyRow);
        }
        // Rooms along the top are all adjacent along their tops to room 0 (the exterior)
        {
            const adjacencyRow = [];
            let ry = roomsY;
            for(let rx = 0; rx < roomsX; ++rx){
                let x0 = offsetX.get(rx, ry - 1);
                let x1 = offsetX.get(rx + 1, ry - 1);
                let y = offsetY.get(rx, ry);
                const adj = {
                    origin: (0, _myMatrix.vec2).fromValues(x0, y),
                    dir: (0, _myMatrix.vec2).fromValues(1, 0),
                    length: x1 - x0,
                    roomLeft: rooms[0],
                    roomRight: rooms[roomIndex.get(rx, ry - 1)],
                    nextMatching: null,
                    door: false,
                    doorType: DoorType.Standard
                };
                adjacencyRow.push(adj);
                adjacencies.push(adj);
            }
            adjacencyRows.push(adjacencyRow);
        }
        if (mirrorX) for(let ry = 0; ry < adjacencyRows.length; ++ry){
            let row = adjacencyRows[ry];
            let i = 0;
            let j = row.length - 1;
            while(i <= j){
                let adj0 = row[i];
                let adj1 = row[j];
                adj0.nextMatching = adj1;
                adj1.nextMatching = adj0;
                if (i !== j) {
                    // Flip edge adj1 to point the opposite direction
                    (0, _myMatrix.vec2).scaleAndAdd(adj1.origin, adj1.origin, adj1.dir, adj1.length);
                    (0, _myMatrix.vec2).negate(adj1.dir, adj1.dir);
                    [adj1.roomLeft, adj1.roomRight] = [
                        adj1.roomRight,
                        adj1.roomLeft
                    ];
                }
                i += 1;
                j -= 1;
            }
        }
        if (mirrorY) {
            let ry0 = 0;
            let ry1 = adjacencyRows.length - 1;
            while(ry0 < ry1){
                let row0 = adjacencyRows[ry0];
                let row1 = adjacencyRows[ry1];
                console.assert(row0.length == row1.length);
                for(let i = 0; i < row0.length; ++i){
                    let adj0 = row0[i];
                    let adj1 = row1[i];
                    adj0.nextMatching = adj1;
                    adj1.nextMatching = adj0;
                }
                ry0 += 1;
                ry1 -= 1;
            }
        }
    }
    {
        let adjacencyRows = [];
        // Rooms along the left are all adjacent on their left to room 0 (the exterior)
        {
            const adjacencyRow = [];
            let rx = 0;
            for(let ry = 0; ry < roomsY; ++ry){
                let y0 = offsetY.get(rx, ry);
                let y1 = offsetY.get(rx, ry + 1);
                let x = offsetX.get(rx, ry);
                const adj = {
                    origin: (0, _myMatrix.vec2).fromValues(x, y0),
                    dir: (0, _myMatrix.vec2).fromValues(0, 1),
                    length: y1 - y0,
                    roomLeft: rooms[0],
                    roomRight: rooms[roomIndex.get(rx, ry)],
                    nextMatching: null,
                    door: false,
                    doorType: DoorType.Standard
                };
                adjacencyRow.push(adj);
                adjacencies.push(adj);
            }
            adjacencyRows.push(adjacencyRow);
        }
        // Along the interior lines, generate adjacencies between touching pairs of rooms on either side
        for(let rx = 1; rx < roomsX; ++rx){
            const adjacencyRow = [];
            function addAdj(x, y0, y1, iRoomLeft, iRoomRight) {
                if (y1 - y0 <= 0) return;
                const adj = {
                    origin: (0, _myMatrix.vec2).fromValues(x, y0),
                    dir: (0, _myMatrix.vec2).fromValues(0, 1),
                    length: y1 - y0,
                    roomLeft: rooms[iRoomLeft],
                    roomRight: rooms[iRoomRight],
                    nextMatching: null,
                    door: false,
                    doorType: DoorType.Standard
                };
                adjacencyRow.push(adj);
                adjacencies.push(adj);
            }
            let ryLeft = 0;
            let ryRight = 0;
            while(ryLeft < offsetY.sizeY && ryRight < offsetY.sizeY){
                const yLeft = ryLeft < offsetY.sizeY ? offsetY.get(rx - 1, ryLeft) : Infinity;
                const yRight = ryRight < offsetY.sizeY ? offsetY.get(rx, ryRight) : Infinity;
                const x = offsetX.get(rx, Math.max(0, Math.max(ryLeft, ryRight) - 1));
                if (yLeft < yRight) {
                    const yLeftNext = Math.min(yRight, ryLeft + 1 < offsetY.sizeY ? offsetY.get(rx - 1, ryLeft + 1) : Infinity);
                    const iRoomLeft = ryLeft >= roomIndex.sizeY ? 0 : roomIndex.get(rx - 1, ryLeft);
                    const iRoomRight = ryRight <= 0 ? 0 : roomIndex.get(rx, ryRight - 1);
                    addAdj(x, yLeft, yLeftNext, iRoomLeft, iRoomRight);
                    ++ryLeft;
                } else {
                    const yRightNext = Math.min(yLeft, ryRight + 1 < offsetY.sizeY ? offsetY.get(rx, ryRight + 1) : Infinity);
                    const iRoomLeft = ryLeft <= 0 ? 0 : roomIndex.get(rx - 1, ryLeft - 1);
                    const iRoomRight = ryRight >= roomIndex.sizeY ? 0 : roomIndex.get(rx, ryRight);
                    addAdj(x, yRight, yRightNext, iRoomLeft, iRoomRight);
                    ++ryRight;
                }
            }
            adjacencyRows.push(adjacencyRow);
        }
        // Rooms along the right are all adjacent on their right to room 0 (the exterior)
        {
            const adjacencyRow = [];
            let rx = roomsX;
            for(let ry = 0; ry < roomsY; ++ry){
                let y0 = offsetY.get(rx - 1, ry);
                let y1 = offsetY.get(rx - 1, ry + 1);
                let x = offsetX.get(rx, ry);
                const adj = {
                    origin: (0, _myMatrix.vec2).fromValues(x, y0),
                    dir: (0, _myMatrix.vec2).fromValues(0, 1),
                    length: y1 - y0,
                    roomLeft: rooms[roomIndex.get(rx - 1, ry)],
                    roomRight: rooms[0],
                    nextMatching: null,
                    door: false,
                    doorType: DoorType.Standard
                };
                adjacencyRow.push(adj);
                adjacencies.push(adj);
            }
            adjacencyRows.push(adjacencyRow);
        }
        if (mirrorY) for(let ry = 0; ry < adjacencyRows.length; ++ry){
            let row = adjacencyRows[ry];
            let n = Math.floor(row.length / 2);
            for(let i = 0; i < n; ++i){
                let adj0 = row[i];
                let adj1 = row[row.length - 1 - i];
                adj0.nextMatching = adj1;
                adj1.nextMatching = adj0;
                // Flip edge a1 to point the opposite direction
                (0, _myMatrix.vec2).scaleAndAdd(adj1.origin, adj1.origin, adj1.dir, adj1.length);
                (0, _myMatrix.vec2).negate(adj1.dir, adj1.dir);
                [adj1.roomLeft, adj1.roomRight] = [
                    adj1.roomRight,
                    adj1.roomLeft
                ];
            }
        }
        if (mirrorX) {
            let ry0 = 0;
            let ry1 = adjacencyRows.length - 1;
            while(ry0 < ry1){
                let row0 = adjacencyRows[ry0];
                let row1 = adjacencyRows[ry1];
                for(let i = 0; i < row0.length; ++i){
                    let adj0 = row0[i];
                    let adj1 = row1[i];
                    adj0.nextMatching = adj1;
                    adj1.nextMatching = adj0;
                }
                ry0 += 1;
                ry1 -= 1;
            }
        }
    }
    return adjacencies;
}
function storeAdjacenciesInRooms(adjacencies) {
    for (const adj of adjacencies){
        adj.roomLeft.edges.push(adj);
        adj.roomRight.edges.push(adj);
    }
}
function connectRooms(rooms, adjacencies, level, levelType, rng) {
    // Collect sets of edges that are mirrors of each other
    const edgeSets = getEdgeSets(adjacencies, rng);
    // Connect all adjacent courtyard rooms together.
    for (const adj of adjacencies){
        const room0 = adj.roomLeft;
        const room1 = adj.roomRight;
        if (room0.roomType != RoomType.PublicCourtyard || room1.roomType != RoomType.PublicCourtyard) continue;
        if (adj.length < 2) continue;
        adj.door = true;
        adj.doorType = DoorType.Standard;
        const group0 = room0.group;
        const group1 = room1.group;
        joinGroups(rooms, group0, group1);
    }
    // Connect all the interior rooms with doors.
    for (const edgeSet of edgeSets){
        // This is pretty bad; I just want to grab one adjacency from the set to decide
        // whether to put doors in all of them, since they all should have the same
        // situation.
        let addDoor = false;
        for (const adj of edgeSet){
            if (adj.roomLeft.roomType !== RoomType.PublicRoom) break;
            if (adj.roomRight.roomType !== RoomType.PublicRoom) break;
            if (adj.roomLeft.group !== adj.roomRight.group) addDoor = true;
            else if (rng.random() < 0.4) addDoor = true;
            break;
        }
        if (addDoor) for (const adj of edgeSet){
            const room0 = adj.roomLeft;
            const room1 = adj.roomRight;
            const group0 = room0.group;
            const group1 = room1.group;
            adj.door = true;
            adj.doorType = DoorType.Standard;
            joinGroups(rooms, group0, group1);
        }
    }
    // Create doors between the interiors and the courtyard areas.
    for (const edgeSet of edgeSets){
        let addDoor = false;
        for (const adj of edgeSet){
            if (adj.roomLeft.roomType === adj.roomRight.roomType) break;
            if (adj.roomLeft.roomType === RoomType.Exterior) break;
            if (adj.roomRight.roomType === RoomType.Exterior) break;
            if (adj.roomLeft.group !== adj.roomRight.group) addDoor = true;
            else if (rng.random() < (levelType === LevelType.Fortress ? 0.1 : 0.4)) addDoor = true;
            break;
        }
        if (addDoor) for (const adj of edgeSet){
            const room0 = adj.roomLeft;
            const room1 = adj.roomRight;
            const group0 = room0.group;
            const group1 = room1.group;
            adj.door = true;
            adj.doorType = DoorType.Standard;
            joinGroups(rooms, group0, group1);
        }
    }
    // Create a door to the surrounding exterior.
    const adjDoor = frontDoorAdjacency(edgeSets);
    if (adjDoor !== undefined) {
        adjDoor.door = true;
        adjDoor.doorType = DoorType.GateFront;
        // Break symmetry if the door is off center.
        let adjDoorMirror = adjDoor.nextMatching;
        if (adjDoorMirror !== null && adjDoorMirror !== adjDoor) {
            adjDoor.nextMatching = null;
            adjDoorMirror.nextMatching = null;
        }
    }
    // Occasionally create a back door to the exterior.
    if (rng.randomInRange(30) < rooms.length) {
        const adjDoor = backDoorAdjacency(edgeSets);
        if (adjDoor !== undefined) {
            adjDoor.door = true;
            adjDoor.doorType = level < 3 || rng.random() < 0.75 ? DoorType.GateBack : DoorType.Locked;
            // Break symmetry if the door is off center.
            let adjDoorMirror = adjDoor.nextMatching;
            if (adjDoorMirror !== null && adjDoorMirror !== adjDoor) {
                adjDoor.nextMatching = null;
                adjDoorMirror.nextMatching = null;
            }
        }
    }
    // Also create side doors sometimes.
    if (rng.randomInRange(30) < rooms.length) {
        const adjDoor = sideDoorAdjacency(edgeSets);
        if (adjDoor !== undefined) {
            const doorType = level < 3 ? DoorType.GateBack : DoorType.Locked;
            adjDoor.door = true;
            adjDoor.doorType = doorType;
            const adjDoorMirror = adjDoor.nextMatching;
            if (adjDoorMirror !== null && adjDoorMirror !== adjDoor) {
                adjDoorMirror.door = true;
                adjDoorMirror.doorType = doorType;
            }
        }
    }
}
function getEdgeSets(adjacencies, rng) {
    const edgeSets = [];
    const adjHandled = new Set();
    for (const adj of adjacencies){
        if (adj.length < 2) continue;
        if (adjHandled.has(adj)) continue;
        const adjMirror = adj.nextMatching;
        const setAdjMirror = new Set();
        setAdjMirror.add(adj);
        adjHandled.add(adj);
        if (adjMirror !== null) {
            setAdjMirror.add(adjMirror);
            adjHandled.add(adjMirror);
        }
        edgeSets.push(setAdjMirror);
    }
    rng.shuffleArray(edgeSets);
    return edgeSets;
}
function joinGroups(rooms, groupFrom, groupTo) {
    if (groupFrom != groupTo) {
        for (const room of rooms)if (room.group == groupFrom) room.group = groupTo;
    }
}
function frontDoorAdjacency(edgeSets) {
    const adjs = [];
    for (const edgeSet of edgeSets)for (const adj of edgeSet){
        if (adj.dir[0] == 0) continue;
        if (adj.roomLeft.roomType === RoomType.Exterior && adj.roomRight.roomType !== RoomType.Exterior && adj.dir[0] < 0) adjs.push(adj);
        else if (adj.roomLeft.roomType !== RoomType.Exterior && adj.roomRight.roomType === RoomType.Exterior && adj.dir[0] > 0) adjs.push(adj);
    }
    adjs.sort((adj0, adj1)=>adj0.origin[0] + adj0.dir[0] * adj0.length / 2 - (adj1.origin[0] + adj1.dir[0] * adj1.length / 2));
    if (adjs.length <= 0) return undefined;
    return adjs[Math.floor(adjs.length / 2)];
}
function backDoorAdjacency(edgeSets) {
    const adjs = [];
    for (const edgeSet of edgeSets)for (const adj of edgeSet){
        if (adj.dir[0] == 0) continue;
        if (adj.roomLeft.roomType === RoomType.Exterior && adj.roomRight.roomType !== RoomType.Exterior && adj.dir[0] > 0) adjs.push(adj);
        else if (adj.roomLeft.roomType !== RoomType.Exterior && adj.roomRight.roomType === RoomType.Exterior && adj.dir[0] < 0) adjs.push(adj);
    }
    adjs.sort((adj0, adj1)=>adj0.origin[0] + adj0.dir[0] * adj0.length / 2 - (adj1.origin[0] + adj1.dir[0] * adj1.length / 2));
    if (adjs.length <= 0) return undefined;
    return adjs[Math.floor(adjs.length / 2)];
}
function sideDoorAdjacency(edgeSets) {
    const adjs = [];
    for (const edgeSet of edgeSets)for (const adj of edgeSet){
        if (adj.dir[1] == 0) continue;
        if (adj.length < 3) continue;
        if ((adj.length & 1) !== 0) continue;
        if (adj.roomLeft.roomType === RoomType.Exterior === (adj.roomRight.roomType === RoomType.Exterior)) continue;
        const adjMirror = adj.nextMatching;
        if (adjMirror === null || adjMirror === adj) continue;
        adjs.push(adj);
    }
    adjs.sort((adj0, adj1)=>adj0.origin[1] + adj0.dir[1] * adj0.length / 2 - (adj1.origin[1] + adj1.dir[1] * adj1.length / 2));
    if (adjs.length <= 0) return undefined;
    return adjs[Math.floor(adjs.length / 2)];
}
function computeRoomDepths(rooms) {
    // Start from rooms with exterior doors
    let unvisited = rooms.length;
    const roomsToVisit = [];
    for (const room of rooms){
        if (room.roomType === RoomType.Exterior) room.depth = 0;
        else if (hasExteriorDoor(room)) {
            room.depth = 1;
            roomsToVisit.push(room);
        } else room.depth = unvisited;
    }
    // Visit rooms in breadth-first order, assigning them distances from the seed rooms.
    for(let iRoom = 0; iRoom < roomsToVisit.length; ++iRoom){
        const room = roomsToVisit[iRoom];
        const depthNext = room.depth + 1;
        for (const adj of room.edges){
            if (!adj.door) continue;
            const roomNeighbor = adj.roomLeft == room ? adj.roomRight : adj.roomLeft;
            if (roomNeighbor.depth > depthNext) {
                roomNeighbor.depth = depthNext;
                roomsToVisit.push(roomNeighbor);
            }
        }
    }
}
function computeRoomBetweenness(rooms) {
    // Start from rooms with exterior doors
    //    const sourceRooms = [];
    for (const room of rooms)room.betweenness = 0;
    for (const roomSource of rooms){
        const roomNumPaths = new Map();
        const roomDependency = new Map();
        const roomDepth = new Map();
        for (const room of rooms){
            roomDepth.set(room, Infinity);
            roomDependency.set(room, 0);
            roomNumPaths.set(room, 0);
        }
        roomDepth.set(roomSource, 0);
        roomNumPaths.set(roomSource, 1);
        const roomsToVisit = [];
        roomsToVisit.push(roomSource);
        const roomStack = [];
        while(true){
            const room = roomsToVisit.shift();
            if (room === undefined) break;
            roomStack.push(room);
            const depthNext = (roomDepth.get(room) ?? 0) + 1;
            for (const adj of room.edges){
                if (!adj.door) continue;
                const roomNext = adj.roomLeft === room ? adj.roomRight : adj.roomLeft;
                if (roomNext.roomType === RoomType.Exterior) continue;
                if (roomNext.depth === Infinity) {
                    roomNext.depth = depthNext;
                    roomsToVisit.push(roomNext);
                }
                if (roomNext.depth === depthNext) roomNumPaths.set(roomNext, (roomNumPaths.get(roomNext) ?? 0) + (roomNumPaths.get(room) ?? 0));
            }
        }
        const weight = roomSource.roomType === RoomType.Exterior ? 10 : 1;
        while(true){
            const room = roomStack.pop();
            if (room === undefined) break;
            const depthRoomPrev = (roomDepth.get(room) ?? 0) - 1;
            const numPathsRoom = roomNumPaths.get(room) ?? 1;
            const depRoom = roomDependency.get(room) ?? 0;
            for (const adj of room.edges){
                if (!adj.door) continue;
                const roomPrev = adj.roomLeft === room ? adj.roomRight : adj.roomLeft;
                if (roomDepth.get(roomPrev) !== depthRoomPrev) continue;
                const numPathsRoomPrev = roomNumPaths.get(roomPrev) ?? 0;
                const depRoomPrev = numPathsRoomPrev / numPathsRoom * (1 + depRoom);
                roomDependency.set(roomPrev, depRoomPrev);
                if (room !== roomSource) room.betweenness += depRoom * weight;
            }
        }
    }
}
function hasExteriorDoor(room) {
    for (const adj of room.edges){
        if (!adj.door) continue;
        if (adj.doorType === DoorType.Locked) continue;
        if (adj.roomLeft === room) {
            if (adj.roomRight.roomType === RoomType.Exterior) return true;
        } else {
            if (adj.roomLeft.roomType === RoomType.Exterior) return true;
        }
    }
    return false;
}
function assignRoomTypes(rooms, level, rng) {
    // Assign master-suite room type to the inner rooms.
    let maxDepth = 0;
    for (const room of rooms)maxDepth = Math.max(maxDepth, room.depth);
    const numRooms = rooms.length - 1; // subtract off the RoomType.Exterior room
    const targetNumMasterRooms = Math.floor(numRooms / 4);
    let numMasterRooms = 0;
    let depth = maxDepth;
    while(depth > 0){
        for (const room of rooms){
            if (room.roomType != RoomType.PublicRoom && room.roomType != RoomType.PublicCourtyard) continue;
            if (room.depth != depth) continue;
            room.roomType = room.roomType == RoomType.PublicRoom ? RoomType.PrivateRoom : RoomType.PrivateCourtyard;
            room.privateRoom = true;
            if (room.roomType == RoomType.PrivateRoom) numMasterRooms += 1;
        }
        if (numMasterRooms >= targetNumMasterRooms) break;
        depth -= 1;
    }
    // Change any private courtyards that are adjacent to public courtyards into public courtyards
    while(true){
        let changed = false;
        for (const room of rooms){
            if (room.roomType != RoomType.PrivateCourtyard) continue;
            for (const adj of room.edges){
                let roomOther = adj.roomLeft != room ? adj.roomLeft : adj.roomRight;
                if (roomOther.roomType == RoomType.PublicCourtyard) {
                    room.roomType = RoomType.PublicCourtyard;
                    room.privateRoom = true;
                    changed = true;
                    break;
                }
            }
        }
        if (!changed) break;
    }
    // Pick a dead-end room to be a Vault room
    if (level > 4) {
        const deadEndRooms = [];
        for (const room of rooms){
            if (room.roomType === RoomType.Exterior) continue;
            let numDoors = 0;
            for (const adj of room.edges)if (adj.door) ++numDoors;
            if (numDoors <= 1) deadEndRooms.push(room);
        }
        if (deadEndRooms.length > 0) {
            rng.shuffleArray(deadEndRooms);
            deadEndRooms.sort((a, b)=>roomArea(a) - roomArea(b));
            const vaultRoom = deadEndRooms[0];
            vaultRoom.roomType = RoomType.Vault;
            for (const adj of vaultRoom.edges)if (adj.door) adj.doorType = DoorType.Locked;
        }
    }
    // Assign private rooms with only one or two entrances to be bedrooms, if they are large enough
    // TODO: Ideally bedrooms need to be on a dead-end branch of the house (low betweenness)
    for (const room of rooms){
        if (room.roomType !== RoomType.PrivateRoom) continue;
        const sizeX = room.posMax[0] - room.posMin[0];
        const sizeY = room.posMax[1] - room.posMin[1];
        if (sizeX < 3 && sizeY < 3) continue;
        if (sizeX * sizeY > 25) continue;
        let numDoors = 0;
        for (const adj of room.edges)if (adj.door) ++numDoors;
        if (numDoors > 2) continue;
        room.roomType = RoomType.Bedroom;
    }
    // TODO: All these rooms should be chosen in round-robin fashion, where we ensure we've got
    // at least one of everything important for a given mansion size, before then allocating any
    // remaining rooms.
    // Pick rooms to be kitchens
    if (numRooms >= 8) {
        const kitchenRooms = rooms.filter((room)=>roomCanBeKitchen(room));
        if (kitchenRooms.length > 0) {
            rng.shuffleArray(kitchenRooms);
            kitchenRooms[0].roomType = RoomType.Kitchen;
        }
    }
    // Pick rooms to be dining rooms
    for (const room of chooseRooms(rooms, roomCanBeDining, Math.ceil(rooms.length / 21), rng))room.roomType = RoomType.Dining;
    // Pick rooms to be libraries
    for (const room of chooseRooms(rooms, roomCanBePublicLibrary, Math.ceil(rooms.length / 42), rng))room.roomType = RoomType.PublicLibrary;
    for (const room of chooseRooms(rooms, roomCanBePrivateLibrary, Math.ceil(rooms.length / 42), rng))room.roomType = RoomType.PrivateLibrary;
}
function roomArea(room) {
    return (room.posMax[0] - room.posMin[0]) * (room.posMax[1] - room.posMin[1]);
}
function chooseRooms(rooms, acceptRoom, maxRooms, rng) {
    const acceptableRooms = rooms.filter(acceptRoom);
    rng.shuffleArray(acceptableRooms);
    return acceptableRooms.slice(0, maxRooms);
}
function roomCanBeKitchen(room) {
    if (room.roomType !== RoomType.PublicRoom && room.roomType !== RoomType.PrivateRoom) return false;
    const sizeX = room.posMax[0] - room.posMin[0];
    const sizeY = room.posMax[1] - room.posMin[1];
    if (Math.min(sizeX, sizeY) < 3) return false;
    if (Math.max(sizeX, sizeY) > 7) return false;
    if (roomHasExteriorDoor(room)) return false;
    return true;
}
function roomHasExteriorDoor(room) {
    for (const adj of room.edges){
        if (!adj.door) continue;
        if (adj.roomLeft === room && adj.roomRight.roomType === RoomType.Exterior) return true;
        else if (adj.roomRight === room && adj.roomLeft.roomType === RoomType.Exterior) return true;
    }
    return false;
}
function roomCanBeDining(room) {
    if (room.roomType !== RoomType.PublicRoom) return false;
    const sizeX = room.posMax[0] - room.posMin[0];
    if (sizeX < 5) return false;
    const sizeY = room.posMax[1] - room.posMin[1];
    if (sizeY < 5) return false;
    return true;
}
function roomCanBePublicLibrary(room) {
    if (room.roomType !== RoomType.PublicRoom) return false;
    const sizeX = room.posMax[0] - room.posMin[0];
    const sizeY = room.posMax[1] - room.posMin[1];
    if (Math.min(sizeX, sizeY) < 4) return false;
    if (Math.max(sizeX, sizeY) < 5) return false;
    return true;
}
function roomCanBePrivateLibrary(room) {
    if (room.roomType !== RoomType.PrivateRoom) return false;
    const sizeX = room.posMax[0] - room.posMin[0];
    const sizeY = room.posMax[1] - room.posMin[1];
    if (Math.min(sizeX, sizeY) < 4) return false;
    if (Math.max(sizeX, sizeY) < 5) return false;
    return true;
}
function removableAdjacency(adjacencies, rng) {
    const removableAdjs = [];
    for (const adj of adjacencies){
        const room0 = adj.roomLeft;
        const room1 = adj.roomRight;
        if (!adj.door) continue;
        if (room0.roomType !== room1.roomType) continue;
        if (adj.dir[1] === 0) {
            // Horizontal adjacency
            if (adj.length !== 1 + (room0.posMax[0] - room0.posMin[0])) continue;
            if (adj.length !== 1 + (room1.posMax[0] - room1.posMin[0])) continue;
        } else {
            // Vertical adjacency
            if (adj.length !== 1 + (room0.posMax[1] - room0.posMin[1])) continue;
            if (adj.length !== 1 + (room1.posMax[1] - room1.posMin[1])) continue;
        }
        // Compute the area of the merged room
        const xMin = Math.min(room0.posMin[0], room1.posMin[0]);
        const yMin = Math.min(room0.posMin[1], room1.posMin[1]);
        const xMax = Math.max(room0.posMax[0], room1.posMax[0]);
        const yMax = Math.max(room0.posMax[1], room1.posMax[1]);
        const rx = xMax - xMin;
        const ry = yMax - yMin;
        const area = rx * ry;
        // Don't let rooms get too big
        if (area > roomSizeX * roomSizeY * 30) continue;
        const aspect = Math.max(rx, ry) / Math.min(rx, ry);
        removableAdjs.push([
            adj,
            aspect
        ]);
    }
    if (removableAdjs.length <= 0) return undefined;
    rng.shuffleArray(removableAdjs);
    removableAdjs.sort((a, b)=>a[1] - b[1]);
    return removableAdjs[0][0];
}
function removeAdjacency(rooms, adjacencies, adj) {
    const room0 = adj.roomLeft;
    const room1 = adj.roomRight;
    // Copy all adjacencies except for adj from room1 to room0
    // Adjust all of the adjacencies pointing at room1 to point to room0 instead
    for (const adjMove of room1.edges)if (adjMove !== adj) {
        room0.edges.push(adjMove);
        if (adjMove.roomLeft === room1) adjMove.roomLeft = room0;
        else {
            console.assert(adjMove.roomRight === room1);
            adjMove.roomRight = room0;
        }
    }
    // Resize room0 to encompass room1
    const posMin = (0, _myMatrix.vec2).fromValues(Math.min(room0.posMin[0], room1.posMin[0]), Math.min(room0.posMin[1], room1.posMin[1]));
    const posMax = (0, _myMatrix.vec2).fromValues(Math.max(room0.posMax[0], room1.posMax[0]), Math.max(room0.posMax[1], room1.posMax[1]));
    (0, _myMatrix.vec2).copy(room0.posMin, posMin);
    (0, _myMatrix.vec2).copy(room0.posMax, posMax);
    room0.depth = Math.min(room0.depth, room1.depth);
    // Remove adj from its twin
    const adjMatch = adj.nextMatching;
    if (adjMatch !== null) adjMatch.nextMatching = null;
    // Remove adj from adjacencies and from room0.edges
    removeByValue(adjacencies, adj);
    removeByValue(room0.edges, adj);
    // Remove room1 from rooms
    removeByValue(rooms, room1);
    // Join adjacencies between pairs of rooms to form longer adjacencies
    while(tryJoinCollinearAdjacencies(adjacencies, room0));
}
function tryJoinCollinearAdjacencies(adjacencies, room0) {
    for (const adj0 of room0.edges)for (const adj1 of room0.edges){
        if (adj0 === adj1) continue;
        if (!adjacenciesAreMergeable(adj0, adj1)) continue;
        // Compute the new origin and length for the combined edge
        const x0 = adj0.dir[0] >= 0 ? Math.min(adj0.origin[0], adj1.origin[0]) : Math.max(adj0.origin[0], adj1.origin[0]);
        const y0 = adj0.dir[1] >= 0 ? Math.min(adj0.origin[1], adj1.origin[1]) : Math.max(adj0.origin[1], adj1.origin[1]);
        const length = adj0.length + adj1.length;
        // Store combined origin and length on adj0, the edge we're keeping
        adj0.origin[0] = x0;
        adj0.origin[1] = y0;
        adj0.length = length;
        // Break all symmetry links
        if (adj0.nextMatching !== null) adj0.nextMatching.nextMatching = null;
        if (adj1.nextMatching !== null) adj1.nextMatching.nextMatching = null;
        adj0.nextMatching = null;
        // If either edge had a door, the combined edge must have a door, since we already established connectivity.
        adj0.door = adj0.door || adj1.door;
        adj0.doorType = Math.max(adj0.doorType, adj1.doorType);
        // Remove edge adj1 from the rooms and the overall list of adjacencies
        const room1 = adj0.roomLeft === room0 ? adj0.roomRight : adj0.roomLeft;
        removeByValue(room0.edges, adj1);
        removeByValue(room1.edges, adj1);
        removeByValue(adjacencies, adj1);
        return true;
    }
    return false;
}
function adjacenciesAreMergeable(adj0, adj1) {
    // Edges have to be parallel to each other to be merged
    if (Math.abs(adj0.dir.dot(adj1.dir)) !== 1) return false;
    const posAdj0End = (0, _myMatrix.vec2).create();
    (0, _myMatrix.vec2).scaleAndAdd(posAdj0End, adj0.origin, adj0.dir, adj0.length);
    const posAdj1End = (0, _myMatrix.vec2).create();
    (0, _myMatrix.vec2).scaleAndAdd(posAdj1End, adj1.origin, adj1.dir, adj1.length);
    if (adj1.roomLeft === adj0.roomLeft && adj1.roomRight === adj0.roomRight) {
        if (posAdj0End.equals(adj1.origin)) return true;
        else if (posAdj1End.equals(adj0.origin)) return true;
    } else if (adj1.roomLeft === adj0.roomRight && adj1.roomRight === adj0.roomLeft) {
        if (posAdj0End.equals(posAdj1End)) return true;
        else if (adj0.origin.equals(adj1.origin)) return true;
    }
    return false;
}
function removeByValue(array, value) {
    const i = array.indexOf(value);
    array.splice(i, 1);
}
function makeDoubleRooms(rooms, adjacencies, rng) {
    rng.shuffleArray(adjacencies);
    for(let numMergeAttempts = 2 * Math.floor(rooms.length / 12); numMergeAttempts > 0; --numMergeAttempts){
        const adj = removableAdjacency(adjacencies, rng);
        if (adj === undefined) return;
        //        const adjMirror = adj.nextMatching;
        removeAdjacency(rooms, adjacencies, adj);
    //        if (adjMirror !== null && adjMirror !== adj && adjMirror.roomLeft.roomType === adjMirror.roomRight.roomType) {
    //            removeAdjacency(rooms, adjacencies, adjMirror);
    //        }
    }
}
function placePatrolRoutesLong(level, gameMap, rooms, outsidePatrolRoute, rng) {
    let numGuards = Math.floor(rooms.length / 2);
    let patrolRoutes = [];
    for(let i = 0; i < numGuards; ++i)patrolRoutes = patrolRoutes.concat(placePatrolRouteSingle(level, gameMap, rooms, outsidePatrolRoute, rng));
    return patrolRoutes;
}
function generatePatrolRouteSingle(rooms, rng) {
    const roomsValid = new Set();
    for (const room of rooms)if (room.roomType !== RoomType.Exterior && room.roomType !== RoomType.Vault) roomsValid.add(room);
    const roomVisited = new Set();
    const roomSequence = [];
    function visitRoom(room) {
        roomSequence.push(room);
        roomVisited.add(room);
        const adjShuffled = [
            ...room.edges
        ];
        rng.shuffleArray(adjShuffled);
        for (const adj of adjShuffled){
            if (!adj.door) continue;
            const roomNext = adj.roomLeft === room ? adj.roomRight : adj.roomLeft;
            if (roomVisited.has(roomNext)) continue;
            if (!roomsValid.has(roomNext)) continue;
            visitRoom(roomNext);
            roomSequence.push(room);
        }
    }
    const roomsToVisit = Array.from(roomsValid);
    const roomStart = roomsToVisit[rng.randomInRange(roomsToVisit.length)];
    visitRoom(roomStart);
    --roomSequence.length;
    const nodes = generatePatrolNodesFromRoomSequence(roomSequence);
    return nodes;
}
function placePatrolRouteSingle(level, gameMap, rooms, outsidePatrolRoute, rng) {
    const nodes = generatePatrolRouteSingle(rooms, rng);
    const patrolRoutes = generatePatrolPathsFromNodes(nodes, level, gameMap, outsidePatrolRoute, rng);
    console.assert(patrolRoutes.length === 1);
    return patrolRoutes;
}
function placePatrolRouteSingleDense(level, gameMap, rooms, outsidePatrolRoute, rng) {
    const roomsValid = new Set();
    for (const room of rooms)if (room.roomType !== RoomType.Exterior && room.roomType !== RoomType.Vault) roomsValid.add(room);
    const adjUsed = new Set();
    const roomSequence = [];
    function visitRoom(room) {
        roomSequence.push(room);
        const adjShuffled = [
            ...room.edges
        ];
        rng.shuffleArray(adjShuffled);
        for (const adj of adjShuffled){
            if (!adj.door) continue;
            if (adjUsed.has(adj)) continue;
            adjUsed.add(adj);
            const roomNext = adj.roomLeft === room ? adj.roomRight : adj.roomLeft;
            if (!roomsValid.has(roomNext)) continue;
            visitRoom(roomNext);
            roomSequence.push(room);
        }
    }
    const roomsToVisit = Array.from(roomsValid);
    const roomStart = roomsToVisit[rng.randomInRange(roomsToVisit.length)];
    visitRoom(roomStart);
    --roomSequence.length;
    const nodes = generatePatrolNodesFromRoomSequence(roomSequence);
    const patrolRoutes = generatePatrolPathsFromNodes(nodes, level, gameMap, outsidePatrolRoute, rng);
    console.assert(patrolRoutes.length === 1);
    return patrolRoutes;
}
function placePatrolRouteLargeLoop(level, gameMap, rooms, outsidePatrolRoute, rng) {
    const roomsValid = new Set();
    for (const room of rooms)if (room.roomType !== RoomType.Exterior && room.roomType !== RoomType.Vault) roomsValid.add(room);
    let roomStart = randomSetMember(roomsValid, rng);
    if (roomStart === undefined) return [];
    let roomLoopLongest = [];
    const roomsVisited = [];
    const roomsToVisit = [];
    roomsToVisit.push({
        stackLen: 0,
        room: roomStart
    });
    while(true){
        const visit = roomsToVisit.pop();
        if (visit === undefined) break;
        roomsVisited.length = visit.stackLen;
        const i = roomsVisited.indexOf(visit.room);
        if (i >= 0) {
            if (roomsVisited.length - i > roomLoopLongest.length) roomLoopLongest = roomsVisited.slice(i);
            continue;
        }
        roomsVisited.push(visit.room);
        const stackLen = roomsVisited.length;
        const adjShuffled = [
            ...visit.room.edges
        ];
        rng.shuffleArray(adjShuffled);
        for (const adj of adjShuffled){
            if (!adj.door) continue;
            const roomNext = adj.roomLeft === visit.room ? adj.roomRight : adj.roomLeft;
            if (!roomsValid.has(roomNext)) continue;
            roomsToVisit.push({
                stackLen: stackLen,
                room: roomNext
            });
        }
    }
    const nodes = generatePatrolNodesFromRoomSequence(roomLoopLongest);
    const patrolRoutes = generatePatrolPathsFromNodes(nodes, level, gameMap, outsidePatrolRoute, rng);
    console.assert(patrolRoutes.length === 1);
    return patrolRoutes;
}
function randomSetMember(items, rng) {
    const itemsAsList = Array.from(items);
    if (itemsAsList.length === 0) return undefined;
    return itemsAsList[rng.randomInRange(itemsAsList.length)];
}
function generatePatrolNodesFromRoomSequence(roomSequence) {
    const nodes = [];
    for (const room of roomSequence)nodes.push({
        room: room,
        nodeNext: null,
        nodePrev: null,
        visited: false
    });
    for(let i = 0; i < roomSequence.length; ++i){
        nodes[i].nodeNext = nodes[(i + 1) % nodes.length];
        nodes[i].nodePrev = nodes[(i + nodes.length - 1) % nodes.length];
    }
    return nodes;
}
function deadEndPatrolNode(nodes) {
    for (const node of nodes){
        if (node.nodeNext !== null && node.nodePrev !== null && node.nodeNext.room === node.nodePrev.room) return node;
    }
    return undefined;
}
function placePatrolRoutesDense(level, gameMap, rooms, adjacencies, outsidePatrolRoute, rng) {
    // Keep adjacencies that connect interior rooms via a door; shuffle them
    const adjacenciesShuffled = adjacencies.filter((adj)=>adj.door && isPatrolledRoom(adj.roomLeft) && isPatrolledRoom(adj.roomRight));
    rng.shuffleArray(adjacenciesShuffled);
    // Track nodes for each room. Each node represents a visit to that room by a patrol route.
    let nodes = [];
    const roomNodes = new Map();
    // Add edges one at a time.
    // If the room at an edge end has a single node, that means it's a dead-end on a route.
    // Extend that route using this edge, so long as doing so does not make the route too
    // long.
    // If there is not a dead-end in the room, then the new edge will dead-end in the room.
    // If the new edge joins two ends of a route to form a loop, remove one path around the
    // loop, transferring all side-loops from the removed path to the remaining path around
    // the loop.
    //console.log('Start with %d rooms and %d adjacencies', rooms.length, adjacenciesShuffled.length);
    const maxRouteLength = 26 - 2 * level;
    for (const adj of adjacenciesShuffled){
        const room0 = adj.roomLeft;
        const room1 = adj.roomRight;
        let nodes0 = roomNodes.get(room0);
        if (nodes0 === undefined) {
            nodes0 = [];
            roomNodes.set(room0, nodes0);
        }
        let nodes1 = roomNodes.get(room1);
        if (nodes1 === undefined) {
            nodes1 = [];
            roomNodes.set(room1, nodes1);
        }
        const deadEnd0 = deadEndPatrolNode(nodes0);
        const deadEnd1 = deadEndPatrolNode(nodes1);
        // TODO:
        //  Reserve activity stations in rooms so multiple people can stop in them
        if (deadEnd0) {
            if (deadEnd1) {
                if (!canJoinNodes(deadEnd0, deadEnd1, maxRouteLength)) continue;
                // Join deadEnd0 and deadEnd1 together.
                // Before: ... -> deadEnd0 -> nodeNext0 -> ...
                //         ... -> deadEnd1 -> nodeNext1 -> ...
                // After:  ... -> deadEnd0 -> node1 -> nodeNext1 -> ... -> deadEnd1 -> node0 -> nodeNext0 -> ...
                const node0 = {
                    room: room0,
                    nodeNext: null,
                    nodePrev: null,
                    visited: false
                };
                const node1 = {
                    room: room1,
                    nodeNext: null,
                    nodePrev: null,
                    visited: false
                };
                const nodeNext0 = deadEnd0.nodeNext;
                const nodeNext1 = deadEnd1.nodeNext;
                deadEnd0.nodeNext = node1;
                node1.nodePrev = deadEnd0;
                node1.nodeNext = nodeNext1;
                if (nodeNext1 !== null) nodeNext1.nodePrev = node1;
                deadEnd1.nodeNext = node0;
                node0.nodePrev = deadEnd1;
                node0.nodeNext = nodeNext0;
                if (nodeNext0 !== null) nodeNext0.nodePrev = node0;
                nodes0.push(node0);
                nodes1.push(node1);
                nodes.push(node0);
                nodes.push(node1);
                if (!nodesAreConnected(deadEnd0, deadEnd1)) {
                    if (rng.random() < 0.5) deletePatrolRoute(deadEnd0, nodes, roomNodes);
                    else deletePatrolRoute(deadEnd1, nodes, roomNodes);
                } else ;
            } else {
                const length0 = loopingPatrolRouteLength(deadEnd0);
                if (length0 + 2 > maxRouteLength) continue;
                // Create a new dead end in room1, extending from the dead end in room0.
                //console.log('Extend %d,%d to %d,%d', room0.gridX, room0.gridY, room1.gridX, room1.gridY);
                const node0 = {
                    room: room0,
                    nodeNext: null,
                    nodePrev: null,
                    visited: false
                };
                const node1 = {
                    room: room1,
                    nodeNext: null,
                    nodePrev: null,
                    visited: false
                };
                const nodeNext = deadEnd0.nodeNext;
                deadEnd0.nodeNext = node1;
                node1.nodePrev = deadEnd0;
                node1.nodeNext = node0;
                node0.nodePrev = node1;
                node0.nodeNext = nodeNext;
                if (nodeNext !== null) nodeNext.nodePrev = node0;
                nodes0.push(node0);
                nodes1.push(node1);
                nodes.push(node0);
                nodes.push(node1);
            }
        } else if (deadEnd1) {
            const length1 = loopingPatrolRouteLength(deadEnd1);
            if (length1 + 2 > maxRouteLength) continue;
            // Create a new dead end in room0, extending from the dead end in room1.
            //console.log('Extend %d,%d to %d,%d', room1.gridX, room1.gridY, room0.gridX, room0.gridY);
            const node0 = {
                room: room0,
                nodeNext: null,
                nodePrev: null,
                visited: false
            };
            const node1 = {
                room: room1,
                nodeNext: null,
                nodePrev: null,
                visited: false
            };
            const nodeNext = deadEnd1.nodeNext;
            deadEnd1.nodeNext = node0;
            node0.nodePrev = deadEnd1;
            node0.nodeNext = node1;
            node1.nodePrev = node0;
            node1.nodeNext = nodeNext;
            if (nodeNext !== null) nodeNext.nodePrev = node1;
            nodes0.push(node0);
            nodes1.push(node1);
            nodes.push(node0);
            nodes.push(node1);
        } else {
            // Neither end is a dead end, so add this as its own standalone segment.
            //console.log('Create %d,%d to %d,%d', room0.gridX, room0.gridY, room1.gridX, room1.gridY);
            const node0 = {
                room: room0,
                nodeNext: null,
                nodePrev: null,
                visited: false
            };
            const node1 = {
                room: room1,
                nodeNext: null,
                nodePrev: null,
                visited: false
            };
            node0.nodeNext = node1;
            node0.nodePrev = node1;
            node1.nodeNext = node0;
            node1.nodePrev = node0;
            nodes0.push(node0);
            nodes1.push(node1);
            nodes.push(node0);
            nodes.push(node1);
        }
    }
    // Find unvisited rooms and generate segments from them
    for (const room of rooms){
        if (!isPatrolledRoom(room)) continue;
        {
            const nodes = roomNodes.get(room);
            if (nodes !== undefined && nodes.length > 0) continue;
        }
        const adjPotential = room.edges.filter((adj)=>adj.door && isPatrolledRoom(adj.roomLeft) && isPatrolledRoom(adj.roomRight));
        if (adjPotential.length === 0) continue;
        const adj = adjPotential[rng.randomInRange(adjPotential.length)];
        const room0 = adj.roomLeft;
        const room1 = adj.roomRight;
        let nodes0 = roomNodes.get(room0);
        if (nodes0 === undefined) {
            nodes0 = [];
            roomNodes.set(room0, nodes0);
        }
        let nodes1 = roomNodes.get(room1);
        if (nodes1 === undefined) {
            nodes1 = [];
            roomNodes.set(room1, nodes1);
        }
        //console.log('Connect unvisited %d,%d to %d,%d', room.gridX, room.gridY, (adj.roomLeft === room) ? adj.roomRight.gridX : adj.roomLeft.gridX, (adj.roomLeft === room) ? adj.roomRight.gridY : adj.roomLeft.gridY);
        const node0 = {
            room: room0,
            nodeNext: null,
            nodePrev: null,
            visited: false
        };
        const node1 = {
            room: room1,
            nodeNext: null,
            nodePrev: null,
            visited: false
        };
        node0.nodeNext = node1;
        node0.nodePrev = node1;
        node1.nodeNext = node0;
        node1.nodePrev = node0;
        nodes0.push(node0);
        nodes1.push(node1);
        nodes.push(node0);
        nodes.push(node1);
    }
    // Find single-segment routes and stitch them into routes passing through their endpoints, where possible
    for (const node of nodes)node.visited = false;
    for (const node of nodes){
        if (node.visited) continue;
        const routeLength = loopingPatrolRouteLength(node);
        if (routeLength > 2) {
            markLoopingPatrolRouteVisited(node);
            continue;
        }
        // Find the shortest patrol route we can join
        let minLength = Number.MAX_SAFE_INTEGER;
        const potentialJoins = [];
        const node0 = node;
        const node1 = node.nodeNext;
        const room0 = node0.room;
        const room1 = node1.room;
        const room0Nodes = roomNodes.get(room0);
        const room1Nodes = roomNodes.get(room1);
        for (const nodeOther of room0Nodes){
            if (nodeOther === node0) continue;
            const length = loopingPatrolRouteLength(nodeOther);
            if (length > minLength) continue;
            if (length < minLength) {
                minLength = length;
                potentialJoins.length = 0;
            }
            potentialJoins.push([
                node0,
                nodeOther
            ]);
        }
        for (const nodeOther of room1Nodes){
            if (nodeOther === node1) continue;
            const length = loopingPatrolRouteLength(nodeOther);
            if (length > minLength) continue;
            if (length < minLength) {
                minLength = length;
                potentialJoins.length = 0;
            }
            potentialJoins.push([
                node1,
                nodeOther
            ]);
        }
        if (potentialJoins.length === 0) {
            markLoopingPatrolRouteVisited(node);
            continue;
        }
        const [nodeJoin0, nodeJoin1] = potentialJoins[rng.randomInRange(potentialJoins.length)];
        const nodeJoin0Prev = nodeJoin0.nodePrev;
        const nodeJoin1Prev = nodeJoin1.nodePrev;
        //console.log('Join single-segment patrol route ending in %d,%d with patrol route passing through %d,%d', nodeJoin0Prev.room.gridX, nodeJoin0Prev.room.gridY, nodeJoin1.room.gridX, nodeJoin1.room.gridY);
        nodeJoin0Prev.nodeNext = nodeJoin1;
        nodeJoin1.nodePrev = nodeJoin0Prev;
        nodeJoin1Prev.nodeNext = nodeJoin0;
        nodeJoin0.nodePrev = nodeJoin1Prev;
        markLoopingPatrolRouteVisited(node);
    }
    // Search for adjacencies that will stitch in single-segment patrol routes
    for (const adj of adjacenciesShuffled){
        const room0 = adj.roomLeft;
        const room1 = adj.roomRight;
        let nodes0 = roomNodes.get(room0);
        if (nodes0 === undefined) {
            nodes0 = [];
            roomNodes.set(room0, nodes0);
        }
        let nodes1 = roomNodes.get(room1);
        if (nodes1 === undefined) {
            nodes1 = [];
            roomNodes.set(room1, nodes1);
        }
        const node0 = shortestPatrolRoute(nodes0);
        const node1 = shortestPatrolRoute(nodes1);
        if (node0 === undefined || node1 === undefined) continue;
        if (nodesAreConnected(node0, node1)) continue;
        const length0 = loopingPatrolRouteLength(node0);
        const length1 = loopingPatrolRouteLength(node1);
        if (length0 > 2 && length1 > 2) continue;
        // Before: ... -> node0 -> nodeNext0 -> ...
        //         ... -> nodePrev1 -> node1 -> ...
        // After:  ... -> node0 -> node1 -> ...
        //         ... -> nodePrev1 -> node3 -> node2 -> nodeNext0 -> ...
        //console.log('Join %d-segment route through %d,%d with %d-segment route through %d,%d', length0, room0.gridX, room0.gridY, length1, room1.gridX, room1.gridY);
        const node2 = {
            room: room0,
            nodeNext: null,
            nodePrev: null,
            visited: false
        };
        const node3 = {
            room: room1,
            nodeNext: null,
            nodePrev: null,
            visited: false
        };
        const nodeNext0 = node0.nodeNext;
        const nodePrev1 = node1.nodePrev;
        node0.nodeNext = node1;
        node1.nodePrev = node0;
        nodePrev1.nodeNext = node3;
        node3.nodePrev = nodePrev1;
        node3.nodeNext = node2;
        node2.nodePrev = node3;
        node2.nodeNext = nodeNext0;
        nodeNext0.nodePrev = node2;
        nodes0.push(node2);
        nodes1.push(node3);
        nodes.push(node2);
        nodes.push(node3);
    }
    // On the last couple of levels, add an additional guard who patrols all rooms.
    // TODO: Avoid picking the same activity stations for guards who stop in the same room.
    if (level >= 8) nodes = nodes.concat(generatePatrolRouteSingle(rooms, rng));
    // Convert the node-based patrol routes to actual patrol routes
    const patrolRoutes = generatePatrolPathsFromNodes(nodes, level, gameMap, outsidePatrolRoute, rng);
    //console.log('End with %d patrol routes for %d rooms', patrolRoutes.length, rooms.length);
    return patrolRoutes;
}
function shortestPatrolRoute(nodes) {
    if (nodes === undefined) return undefined;
    let nodeShortest = undefined;
    let lengthShortest = Number.MAX_SAFE_INTEGER;
    for (const node of nodes){
        const length = loopingPatrolRouteLength(node);
        if (length < lengthShortest) {
            lengthShortest = length;
            nodeShortest = node;
        }
    }
    return nodeShortest;
}
function isPatrolledRoom(room) {
    return room.roomType !== RoomType.Exterior && room.roomType !== RoomType.Vault;
}
function canJoinNodes(node0, node1, maxRouteLength) {
    if (nodesAreConnected(node0, node1)) {
        if (!isSimpleChain(node0, node1)) //            console.log('Skip join %d,%d to %d,%d because it would form a complex loop', node0.room.gridX, node0.room.gridY, node1.room.gridX, node1.room.gridY);
        return false;
        const length = loopingPatrolRouteLength(node0);
        if (length <= 4) //            console.log('Skip join %d,%d to %d,%d because it would form a short loop', node0.room.gridX, node0.room.gridY, node1.room.gridX, node1.room.gridY);
        return false;
    } else {
        const length0 = loopingPatrolRouteLength(node0);
        const length1 = loopingPatrolRouteLength(node1);
        if (length0 + length1 + 2 > maxRouteLength) //            console.log('Skip join %d,%d to %d,%d because length %d+%d+2 = %d > %d', node0.room.gridX, node0.room.gridY, node1.room.gridX, node1.room.gridY, length0, length1, length0 + length1 + 2, maxRouteLength);
        return false;
    }
    return true;
}
function isSimpleChain(node0, node1) {
    let nodePrev = node0.nodePrev;
    let nodeNext = node0.nodeNext;
    while(true){
        if (nodePrev === nodeNext) return nodePrev === node1;
        if (nodePrev === null || nodeNext === null) return false;
        if (nodePrev === node0 || nodeNext === node0) return false;
        if (nodePrev.room !== nodeNext.room) return false;
        nodePrev = nodePrev.nodePrev;
        nodeNext = nodeNext.nodeNext;
    }
}
function deletePatrolRoute(node, nodes, roomNodes) {
    if (node.nodePrev === null) return;
    node.nodePrev.nodeNext = null;
    while(true){
        const nodeNext = node.nodeNext;
        node.nodePrev = null;
        node.nodeNext = null;
        removeByValue(nodes, node);
        const nodesInRoom = roomNodes.get(node.room);
        if (nodesInRoom !== undefined) removeByValue(nodesInRoom, node);
        if (nodeNext === null) break;
        node = nodeNext;
    }
}
function placePatrolRoutes(level, gameMap, rooms, adjacencies, outsidePatrolRoute, rng) {
    // Keep adjacencies that connect interior rooms via a door; shuffle them
    const adjacenciesShuffled = adjacencies.filter((adj)=>adj.door && adj.roomLeft.roomType !== RoomType.Exterior && adj.roomRight.roomType !== RoomType.Exterior && adj.roomLeft.roomType !== RoomType.Vault && adj.roomRight.roomType !== RoomType.Vault);
    rng.shuffleArray(adjacenciesShuffled);
    // Build a set of nodes for joining into routes. Initially there will be one per room.
    // More may be added if rooms participate in more than one route, or if they are
    // visited multiple times in the route.
    const nodes = [];
    const nodeForRoom = new Map();
    for (const room of rooms){
        const node = {
            room: room,
            nodeNext: null,
            nodePrev: null,
            visited: false
        };
        nodes.push(node);
        nodeForRoom.set(room, node);
    }
    // Join rooms onto the start or end (or both) of patrol routes
    for (const adj of adjacenciesShuffled){
        let node0 = nodeForRoom.get(adj.roomLeft);
        let node1 = nodeForRoom.get(adj.roomRight);
        if (node0 === undefined || node1 === undefined) continue;
        if (node0.nodeNext == null && node1.nodePrev == null) {
            node0.nodeNext = node1;
            node1.nodePrev = node0;
        } else if (node1.nodeNext == null && node0.nodePrev == null) {
            node1.nodeNext = node0;
            node0.nodePrev = node1;
        } else if (node0.nodeNext == null && node1.nodeNext == null) {
            flipReverse(node1);
            node0.nodeNext = node1;
            node1.nodePrev = node0;
        } else if (node0.nodePrev == null && node1.nodePrev == null) {
            flipForward(node0);
            node0.nodeNext = node1;
            node1.nodePrev = node0;
        }
    }
    // Split long routes into separate pieces
    for (const node of nodes){
        if (node.visited) continue;
        visitRoute(node);
        if (isLoopingPatrolRoute(node)) continue;
        const pieceLength = Math.max(3, 10 - level);
        splitPatrolRoute(node, pieceLength);
    }
    // Convert patrol routes into directed graphs by doubling the nodes
    convertOneWayRoutesToReversibleRoutes(nodes);
    // Join orphan rooms by generating new nodes in the existing paths
    for (const adj of adjacenciesShuffled){
        const node0 = nodeForRoom.get(adj.roomLeft);
        const node1 = nodeForRoom.get(adj.roomRight);
        if (node0 === undefined || node1 === undefined) continue;
        if (node0.nodeNext == null && node0.nodePrev == null && node1.nodeNext != null && node1.nodePrev != null) {
            // Old: node1 --> node3
            // New: node1 --> node0 --> node2 --> node3 (where node2 is the same room as node1)
            const node3 = node1.nodeNext;
            const node2 = {
                room: node1.room,
                nodeNext: node3,
                nodePrev: node0,
                visited: false
            };
            nodes.push(node2);
            node1.nodeNext = node0;
            node0.nodePrev = node1;
            node0.nodeNext = node2;
            node3.nodePrev = node2;
        } else if (node0.nodeNext != null && node0.nodePrev != null && node1.nodeNext == null && node1.nodePrev == null) {
            // Old: node0 <-> node3
            // New: node0 <-> node1 <-> node2 <-> node3
            const node3 = node0.nodeNext;
            const node2 = {
                room: node0.room,
                nodeNext: node3,
                nodePrev: node1,
                visited: false
            };
            nodes.push(node2);
            node0.nodeNext = node1;
            node1.nodeNext = node2;
            node1.nodePrev = node0;
            node3.nodePrev = node2;
        }
    }
    return generatePatrolPathsFromNodes(nodes, level, gameMap, outsidePatrolRoute, rng);
}
function generatePatrolPathsFromNodes(nodes, level, gameMap, outsidePatrolRoute, rng) {
    // Generate sub-paths within each room along the paths
    // Each room is responsible for the path from the
    // incoming door to the outgoing door, including the
    // incoming door but not the outgoing door. If there
    // is no incoming door, the path starts next to the
    // outgoing door, and if there is no outgoing door,
    // the path ends next to the incoming door.
    for (const node of nodes)node.visited = false;
    const patrolRoutes = [];
    for (const nodeIter of nodes){
        if (nodeIter.visited) continue;
        if (nodeIter.nodeNext == null && nodeIter.nodePrev == null) {
            nodeIter.visited = true;
            continue;
        }
        const nodeStart = startingNode(nodeIter);
        const patrolPositions = [];
        const rooms = new Set();
        for(let node = nodeStart; node != null; node = node.nodeNext){
            if (node.visited) break;
            node.visited = true;
            const nodeNext = node.nodeNext;
            const nodePrev = node.nodePrev;
            if (nodeNext == null) continue;
            if (nodePrev == null) continue;
            const room = node.room;
            const roomNext = nodeNext.room;
            const roomPrev = nodePrev.room;
            rooms.add(room);
            const posStart = (0, _myMatrix.vec2).create();
            posInDoor(posStart, room, roomPrev, gameMap);
            if (roomNext === roomPrev) {
                // Have to get ourselves from the door to an activity station and then back to the door.
                const positions = activityStationPositions(gameMap, room);
                const posMid = (0, _myMatrix.vec2).create();
                if (positions.length > 0) (0, _myMatrix.vec2).copy(posMid, positions[rng.randomInRange(positions.length)]);
                else posBesideDoor(posMid, room, roomPrev, gameMap);
                for (const pos of pathBetweenPointsInRoom(gameMap, room, posStart, posMid))patrolPositions.push(pos);
                patrolPositions.push((0, _myMatrix.vec2).clone(posMid));
                patrolPositions.push((0, _myMatrix.vec2).clone(posMid));
                patrolPositions.push((0, _myMatrix.vec2).clone(posMid));
                (0, _myMatrix.vec2).copy(posStart, posMid);
            }
            const posEnd = (0, _myMatrix.vec2).create();
            posInDoor(posEnd, room, roomNext, gameMap);
            const path = pathBetweenPointsInRoom(gameMap, room, posStart, posEnd);
            for (const pos of path)patrolPositions.push(pos);
        }
        const path = shiftedPathCopy(patrolPositions, rng.randomInRange(patrolPositions.length));
        patrolRoutes.push({
            rooms: Array.from(rooms),
            path: path
        });
    }
    // Shuffle the patrol routes generated so far, since they were created by iterating over the rooms in order.
    rng.shuffleArray(patrolRoutes);
    // On the leap-training level, and past level 5, include patrols around the outside of
    // the mansion. Keep these ones at the end so they won't get keys or purses.
    if (level > 5) {
        const patrolLength = outsidePatrolRoute.path.length;
        patrolRoutes.push({
            rooms: outsidePatrolRoute.rooms,
            path: shiftedPathCopy(outsidePatrolRoute.path, Math.floor(patrolLength * 0.25))
        });
        patrolRoutes.push({
            rooms: outsidePatrolRoute.rooms,
            path: shiftedPathCopy(outsidePatrolRoute.path, Math.floor(patrolLength * 0.75))
        });
    }
    return patrolRoutes;
}
function convertOneWayRoutesToReversibleRoutes(nodes) {
    const nodesOriginal = [
        ...nodes
    ];
    for (const node of nodesOriginal)node.visited = false;
    for (const nodeOriginal of nodesOriginal){
        if (nodeOriginal.visited) continue;
        visitRoute(nodeOriginal);
        if (isLoopingPatrolRoute(nodeOriginal)) continue;
        const nodeForward = startingNode(nodeOriginal);
        // The start and end nodes do not get duplicated, but
        // all nodes in between are duplicated and strung
        // together from the end back to the start.
        let nodeForwardNext = nodeForward.nodeNext;
        let nodeReverseNext = nodeForward;
        while(nodeForwardNext !== null && nodeForwardNext.nodeNext !== null){
            const nodeReverse = {
                room: nodeForwardNext.room,
                nodeNext: nodeReverseNext,
                nodePrev: null,
                visited: true
            };
            nodes.push(nodeReverse);
            nodeReverseNext.nodePrev = nodeReverse;
            nodeForwardNext = nodeForwardNext.nodeNext;
            nodeReverseNext = nodeReverse;
        }
        if (nodeForwardNext !== null) {
            nodeReverseNext.nodePrev = nodeForwardNext;
            nodeForwardNext.nodeNext = nodeReverseNext;
        }
    }
}
function shiftedPathCopy(patrolPath, offset) {
    const patrolPathNew = [];
    for(let i = offset; i < patrolPath.length; ++i)patrolPathNew.push(patrolPath[i]);
    for(let i = 0; i < offset; ++i)patrolPathNew.push(patrolPath[i]);
    return patrolPathNew;
}
function flipReverse(node) {
    let nodeVisited = null;
    while(node != null){
        const nodeToVisit = node.nodePrev;
        node.nodeNext = nodeToVisit;
        node.nodePrev = nodeVisited;
        nodeVisited = node;
        node = nodeToVisit;
    }
}
function flipForward(node) {
    let nodeVisited = null;
    while(node != null){
        const nodeToVisit = node.nodeNext;
        node.nodePrev = nodeToVisit;
        node.nodeNext = nodeVisited;
        nodeVisited = node;
        node = nodeToVisit;
    }
}
function startingNode(node) {
    let nodeStart = node;
    while(nodeStart.nodePrev != null){
        nodeStart = nodeStart.nodePrev;
        if (nodeStart == node) break;
    }
    return nodeStart;
}
function nodesAreConnected(node0, node1) {
    let node = node0;
    while(true){
        if (node === node1) return true;
        if (node.nodeNext === null) break;
        node = node.nodeNext;
        if (node === node0) break;
    }
    return false;
}
function loopingPatrolRouteLength(nodeStart) {
    let c = 0;
    let node = nodeStart;
    while(true){
        ++c;
        if (node.nodeNext === null) break;
        node = node.nodeNext;
        if (node === nodeStart) break;
    }
    return c;
}
function markLoopingPatrolRouteVisited(nodeStart) {
    let node = nodeStart;
    while(true){
        node.visited = true;
        if (node.nodeNext === null) break;
        node = node.nodeNext;
        if (node === nodeStart) break;
    }
}
function isLoopingPatrolRoute(nodeStart) {
    for(let node = nodeStart.nodeNext; node != null; node = node.nodeNext){
        if (node == nodeStart) return true;
    }
    return false;
}
function patrolRouteLength(nodeAny) {
    let c = 0;
    let nodeStart = startingNode(nodeAny);
    for(let node = nodeStart; node != null; node = node.nodeNext){
        ++c;
        if (node.nodeNext == nodeStart) break;
    }
    return c;
}
function visitRoute(nodeAny) {
    let nodeStart = startingNode(nodeAny);
    for(let node = nodeStart; node != null; node = node.nodeNext){
        node.visited = true;
        if (node.nodeNext == nodeStart) break;
    }
}
function splitPatrolRoute(nodeAny, pieceLength) {
    const nodeStart = startingNode(nodeAny);
    let node = nodeStart;
    let cNode = 0;
    while(true){
        const nodeNext = node.nodeNext;
        if (nodeNext == null) break;
        if (patrolRouteLength(node) < 2 * pieceLength) break;
        ++cNode;
        if (cNode >= pieceLength) {
            cNode = 0;
            node.nodeNext = null;
            nodeNext.nodePrev = null;
        }
        node = nodeNext;
        if (node == nodeStart) break;
    }
}
function posInDoor(pos, room0, room1, gameMap) {
    for (const adj of room0.edges)if (adj.roomLeft === room0 && adj.roomRight === room1 || adj.roomLeft === room1 && adj.roomRight === room0) {
        const posAdj = (0, _myMatrix.vec2).create();
        for(let i = 1; i < adj.length; ++i){
            (0, _myMatrix.vec2).scaleAndAdd(posAdj, adj.origin, adj.dir, i);
            const terrainType = gameMap.cells.atVec(posAdj).type;
            if (terrainType >= (0, _gameMap.TerrainType).PortcullisNS && terrainType <= (0, _gameMap.TerrainType).GardenDoorEW) {
                (0, _myMatrix.vec2).copy(pos, posAdj);
                return;
            }
        }
    }
    (0, _myMatrix.vec2).zero(pos);
}
function posBesideDoor(pos, room, roomNext, gameMap) {
    // Try two squares into the room, if possible. If not, fall back to one square in, which will be clear.
    for (const adj of room.edges){
        if (adj.roomLeft === room && adj.roomRight === roomNext) {
            const posDoor = (0, _myMatrix.vec2).create();
            posInDoor(posDoor, room, roomNext, gameMap);
            const dirCross = (0, _myMatrix.vec2).fromValues(-adj.dir[1], adj.dir[0]);
            (0, _myMatrix.vec2).scaleAndAdd(pos, posDoor, dirCross, 2);
            if (gameMap.cells.at(pos[0], pos[1]).moveCost != 0) (0, _myMatrix.vec2).scaleAndAdd(pos, posDoor, dirCross, 1);
            return;
        } else if (adj.roomLeft === roomNext && adj.roomRight === room) {
            const posDoor = (0, _myMatrix.vec2).create();
            posInDoor(posDoor, room, roomNext, gameMap);
            const dirCross = (0, _myMatrix.vec2).fromValues(adj.dir[1], -adj.dir[0]);
            (0, _myMatrix.vec2).scaleAndAdd(pos, posDoor, dirCross, 2);
            if (gameMap.cells.at(pos[0], pos[1]).moveCost != 0) (0, _myMatrix.vec2).scaleAndAdd(pos, posDoor, dirCross, 1);
            return;
        }
    }
    (0, _myMatrix.vec2).zero(pos);
}
function playerStartPosition(level, adjacencies, gameMap) {
    return playerStartPositionFrontDoor(adjacencies, gameMap);
}
function playerStartPositionLeapTrainer(adjacencies, gameMap) {
    // Find top-rightmost horizontal adjacency
    const posTopRight = (0, _myMatrix.vec2).fromValues(gameMap.cells.sizeX - 1, gameMap.cells.sizeY - 1);
    let posBest = playerStartPositionFrontDoor(adjacencies, gameMap);
    let distBest = Infinity;
    for (const adj of adjacencies){
        if (adj.dir[1] !== 0) continue;
        const posAdjTopRight = (0, _myMatrix.vec2).create();
        (0, _myMatrix.vec2).scaleAndAdd(posAdjTopRight, adj.origin, (0, _myMatrix.vec2).fromValues(Math.max(0, adj.dir[0]), 0), adj.length + 1);
        const dist = (0, _myMatrix.vec2).squaredDistance(posTopRight, posAdjTopRight);
        if (dist < distBest) {
            distBest = dist;
            posBest.set(posAdjTopRight[0], posAdjTopRight[1] + 1);
        }
    }
    return posBest;
}
function playerStartPositionFrontDoor(adjacencies, gameMap) {
    // Find lowest door to exterior
    let adjFrontDoor = undefined;
    let yMin = 0;
    for (const adj of adjacencies){
        if (!adj.door) continue;
        if (adj.roomLeft.roomType !== RoomType.Exterior && adj.roomRight.roomType !== RoomType.Exterior) continue;
        const y = adj.origin[1] + Math.max(0, adj.dir[1]) * adj.length;
        if (adjFrontDoor === undefined) {
            adjFrontDoor = adj;
            yMin = y;
            continue;
        }
        if (y < yMin) {
            adjFrontDoor = adj;
            yMin = y;
        }
    }
    if (adjFrontDoor === undefined) return (0, _myMatrix.vec2).fromValues(0, 0);
    let roomFrom, roomTo;
    if (adjFrontDoor.roomLeft.roomType === RoomType.Exterior) {
        roomFrom = adjFrontDoor.roomRight;
        roomTo = adjFrontDoor.roomLeft;
    } else {
        roomFrom = adjFrontDoor.roomLeft;
        roomTo = adjFrontDoor.roomRight;
    }
    const pos = (0, _myMatrix.vec2).create();
    posBesideDoor(pos, roomTo, roomFrom, gameMap);
    return pos;
}
function activityStationPositions(gameMap, room) {
    const positions = [];
    // Search for positions with adjacent windows to look out of
    for(let x = room.posMin[0]; x < room.posMax[0]; ++x){
        if (room.posMin[1] > 0) {
            const terrainType = gameMap.cells.at(x, room.posMin[1] - 1).type;
            if (terrainType == (0, _gameMap.TerrainType).OneWayWindowS && gameMap.cells.at(x, room.posMin[1]).moveCost === 0) positions.push((0, _myMatrix.vec2).fromValues(x, room.posMin[1]));
        }
        if (room.posMax[1] < gameMap.cells.sizeY) {
            const terrainType = gameMap.cells.at(x, room.posMax[1]).type;
            if (terrainType == (0, _gameMap.TerrainType).OneWayWindowN && gameMap.cells.at(x, room.posMax[1] - 1).moveCost === 0) positions.push((0, _myMatrix.vec2).fromValues(x, room.posMax[1] - 1));
        }
    }
    for(let y = room.posMin[1]; y < room.posMax[1]; ++y){
        if (room.posMin[0] > 0) {
            const terrainType = gameMap.cells.at(room.posMin[0] - 1, y).type;
            if (terrainType == (0, _gameMap.TerrainType).OneWayWindowW && gameMap.cells.at(room.posMin[0], y).moveCost === 0) positions.push((0, _myMatrix.vec2).fromValues(room.posMin[0], y));
        }
        if (room.posMax[0] < gameMap.cells.sizeX) {
            const terrainType = gameMap.cells.at(room.posMax[0], y).type;
            if (terrainType == (0, _gameMap.TerrainType).OneWayWindowE && gameMap.cells.at(room.posMax[0] - 1, y).moveCost === 0) positions.push((0, _myMatrix.vec2).fromValues(room.posMax[0] - 1, y));
        }
    }
    if (positions.length > 0) return positions;
    // Search for chairs to sit on
    for (const item of gameMap.items)if (item.type == (0, _gameMap.ItemType).Chair && item.pos[0] >= room.posMin[0] && item.pos[1] >= room.posMin[1] && item.pos[0] < room.posMax[0] && item.pos[1] < room.posMax[1]) positions.push((0, _myMatrix.vec2).clone(item.pos));
    return positions;
}
function pathBetweenPointsInRoom(gameMap, room, pos0, pos1) {
    const distanceFieldMinX = Math.max(0, room.posMin[0] - 1);
    const distanceFieldMinY = Math.max(0, room.posMin[1] - 1);
    const distanceFieldMaxX = Math.min(gameMap.cells.sizeX, room.posMax[0] + 1);
    const distanceFieldMaxY = Math.min(gameMap.cells.sizeY, room.posMax[1] + 1);
    const distanceFieldRoom = gameMap.computeDistancesToPositionSubrect(pos1, distanceFieldMinX, distanceFieldMinY, distanceFieldMaxX, distanceFieldMaxY);
    const pos = (0, _myMatrix.vec2).clone(pos0);
    const path = [];
    while(!pos.equals(pos1)){
        path.push((0, _myMatrix.vec2).clone(pos));
        const posNext = posNextBestInRoom(gameMap, room, distanceFieldRoom, pos);
        if (posNext.equals(pos)) break;
        (0, _myMatrix.vec2).copy(pos, posNext);
    }
    return path;
}
function posNextBestInRoom(gameMap, room, distanceFieldRoom, posFrom) {
    let costBest = Infinity;
    let posBest = (0, _myMatrix.vec2).clone(posFrom);
    const distanceFieldMinX = Math.max(0, room.posMin[0] - 1);
    const distanceFieldMinY = Math.max(0, room.posMin[1] - 1);
    const distanceFieldMaxX = Math.min(gameMap.cells.sizeX, room.posMax[0] + 1);
    const distanceFieldMaxY = Math.min(gameMap.cells.sizeY, room.posMax[1] + 1);
    const posMin = (0, _myMatrix.vec2).fromValues(Math.max(distanceFieldMinX, posFrom[0] - 1), Math.max(distanceFieldMinY, posFrom[1] - 1));
    const posMax = (0, _myMatrix.vec2).fromValues(Math.min(distanceFieldMaxX, posFrom[0] + 2), Math.min(distanceFieldMaxY, posFrom[1] + 2));
    for(let x = posMin[0]; x < posMax[0]; ++x)for(let y = posMin[1]; y < posMax[1]; ++y){
        const cost = distanceFieldRoom.get(x - distanceFieldMinX, y - distanceFieldMinY);
        if (cost == Infinity) continue;
        let pos = (0, _myMatrix.vec2).fromValues(x, y);
        if (gameMap.guardMoveCost(posFrom, pos) == Infinity) continue;
        if (cost < costBest) {
            costBest = cost;
            posBest = pos;
        }
    }
    if (posBest.equals(posFrom)) {
        console.log("failed to proceed");
        for(let x = posMin[0]; x < posMax[0]; ++x)for(let y = posMin[1]; y < posMax[1]; ++y){
            const cost = distanceFieldRoom.get(x - distanceFieldMinX, y - distanceFieldMinY);
            console.log(x, y, cost);
        }
    }
    return posBest;
}
const oneWayWindowTerrainType = [
    (0, _gameMap.TerrainType).OneWayWindowS,
    (0, _gameMap.TerrainType).OneWayWindowE,
    (0, _gameMap.TerrainType).OneWayWindowN,
    (0, _gameMap.TerrainType).OneWayWindowW
];
function oneWayWindowTerrainTypeFromDir(dir) {
    return oneWayWindowTerrainType[dir[0] + 2 * Math.max(0, dir[1]) + 1];
}
function renderWalls(levelType, adjacencies, map, rng) {
    // Plot walls around all the rooms, except between courtyard rooms.
    for (const adj of adjacencies){
        const type0 = adj.roomLeft.roomType;
        const type1 = adj.roomRight.roomType;
        if (isCourtyardRoomType(type0) && isCourtyardRoomType(type1)) continue;
        for(let i = 0; i < adj.length + 1; ++i){
            const pos = (0, _myMatrix.vec2).create();
            (0, _myMatrix.vec2).scaleAndAdd(pos, adj.origin, adj.dir, i);
            map.cells.atVec(pos).type = (0, _gameMap.TerrainType).Wall0000;
        }
    }
    // Add windows and doors to the walls.
    const adjHandled = new Set();
    const allowExteriorWindows = levelType !== LevelType.Fortress;
    for (const adj0 of adjacencies){
        if (adjHandled.has(adj0)) continue;
        adjHandled.add(adj0);
        const adjMirror = adj0.nextMatching;
        if (adjMirror !== null && adjMirror !== adj0) adjHandled.add(adjMirror);
        let walls = [];
        walls.push(adj0);
        if (adjMirror !== null && adjMirror !== adj0) walls.push(adjMirror);
        for (const a of walls){
            if (a.door) continue;
            const roomTypeL = a.roomLeft.roomType;
            const roomTypeR = a.roomRight.roomType;
            if (roomTypeL === RoomType.Vault || roomTypeR === RoomType.Vault) continue;
            const dir = (0, _myMatrix.vec2).clone(a.dir);
            if (roomTypeL === RoomType.Exterior !== (roomTypeR === RoomType.Exterior)) {
                if (!allowExteriorWindows) continue;
                if (roomTypeR == RoomType.Exterior) (0, _myMatrix.vec2).negate(dir, dir);
            } else if (isCourtyardRoomType(roomTypeL) !== isCourtyardRoomType(roomTypeR)) {
                if (isCourtyardRoomType(roomTypeR)) (0, _myMatrix.vec2).negate(dir, dir);
            } else continue;
            const windowType = oneWayWindowTerrainTypeFromDir(dir);
            if (a.length === 5) {
                const p = (0, _myMatrix.vec2).clone(a.origin).scaleAndAdd(a.dir, 2 + (a.origin[0] + a.origin[1] & 1));
                map.cells.atVec(p).type = windowType;
            } else {
                const k_end = 1 + Math.floor(a.length / 2) - (a.length & 1);
                for(let k = 2; k < k_end; k += 2){
                    const p = (0, _myMatrix.vec2).clone(a.origin).scaleAndAdd(a.dir, k);
                    const q = (0, _myMatrix.vec2).clone(a.origin).scaleAndAdd(a.dir, a.length - k);
                    map.cells.atVec(p).type = windowType;
                    map.cells.atVec(q).type = windowType;
                }
            }
        }
        let installMasterSuiteDoor = rng.random() < 0.3333;
        let offset = Math.floor(adj0.length / 2);
        /*
        if (adjMirror === adj0) {
            offset = Math.floor(adj0.length / 2);
        } else if (adj0.length > 2) {
            offset = 2 + rng.randomInRange(adj0.length - 3);
        } else {
            offset = 1 + rng.randomInRange(adj0.length - 1);
        }
        */ for (const a of walls){
            if (!a.door) continue;
            const p = (0, _myMatrix.vec2).clone(a.origin).scaleAndAdd(a.dir, offset);
            let orientNS = a.dir[0] == 0;
            let roomTypeLeft = a.roomLeft.roomType;
            let roomTypeRight = a.roomRight.roomType;
            if (a.doorType === DoorType.GateFront || a.doorType === DoorType.GateBack) {
                map.cells.atVec(p).type = orientNS ? (0, _gameMap.TerrainType).PortcullisNS : (0, _gameMap.TerrainType).PortcullisEW;
                placeItem(map, p, orientNS ? (0, _gameMap.ItemType).PortcullisNS : (0, _gameMap.ItemType).PortcullisEW);
            } else if (a.doorType === DoorType.Locked) {
                map.cells.atVec(p).type = orientNS ? (0, _gameMap.TerrainType).DoorNS : (0, _gameMap.TerrainType).DoorEW;
                placeItem(map, p, orientNS ? (0, _gameMap.ItemType).LockedDoorNS : (0, _gameMap.ItemType).LockedDoorEW);
            } else if (isCourtyardRoomType(roomTypeLeft) && isCourtyardRoomType(roomTypeRight)) map.cells.atVec(p).type = orientNS ? (0, _gameMap.TerrainType).GardenDoorNS : (0, _gameMap.TerrainType).GardenDoorEW;
            else if (roomTypeLeft != RoomType.PrivateRoom || roomTypeRight != RoomType.PrivateRoom || installMasterSuiteDoor) {
                map.cells.atVec(p).type = orientNS ? (0, _gameMap.TerrainType).DoorNS : (0, _gameMap.TerrainType).DoorEW;
                placeItem(map, p, orientNS ? (0, _gameMap.ItemType).DoorNS : (0, _gameMap.ItemType).DoorEW);
            } else map.cells.atVec(p).type = orientNS ? (0, _gameMap.TerrainType).DoorNS : (0, _gameMap.TerrainType).DoorEW;
        }
    }
}
function renderRooms(level, rooms, map, rng) {
    for(let iRoom = 1; iRoom < rooms.length; ++iRoom){
        const room = rooms[iRoom];
        let cellType;
        switch(room.roomType){
            case RoomType.Exterior:
                cellType = (0, _gameMap.TerrainType).GroundNormal;
                break;
            case RoomType.PublicCourtyard:
                cellType = (0, _gameMap.TerrainType).GroundGrass;
                break;
            case RoomType.PublicRoom:
                cellType = (0, _gameMap.TerrainType).GroundWood;
                break;
            case RoomType.PrivateCourtyard:
                cellType = (0, _gameMap.TerrainType).GroundGrass;
                break;
            case RoomType.PrivateRoom:
                cellType = (0, _gameMap.TerrainType).GroundMarble;
                break;
            case RoomType.Vault:
                cellType = (0, _gameMap.TerrainType).GroundVault;
                break;
            case RoomType.Bedroom:
                cellType = (0, _gameMap.TerrainType).GroundMarble;
                break;
            case RoomType.Dining:
                cellType = (0, _gameMap.TerrainType).GroundWood;
                break;
            case RoomType.PublicLibrary:
                cellType = (0, _gameMap.TerrainType).GroundWood;
                break;
            case RoomType.PrivateLibrary:
                cellType = (0, _gameMap.TerrainType).GroundMarble;
                break;
            case RoomType.Kitchen:
                cellType = (0, _gameMap.TerrainType).GroundWood;
                break;
        }
        setRectTerrainType(map, room.posMin[0], room.posMin[1], room.posMax[0], room.posMax[1], cellType);
        if (isCourtyardRoomType(room.roomType)) renderRoomCourtyard(map, room, level, rng);
        else if (room.roomType === RoomType.PublicRoom || room.roomType === RoomType.PrivateRoom) renderRoomGeneric(map, room, level, rng);
        else if (room.roomType === RoomType.Vault) renderRoomVault(map, room, rng);
        else if (room.roomType === RoomType.Bedroom) renderRoomBedroom(map, room, level, rng);
        else if (room.roomType === RoomType.Dining) renderRoomDining(map, room, level, rng);
        else if (room.roomType === RoomType.Kitchen) renderRoomKitchen(map, room, level, rng);
        else if (room.roomType === RoomType.PublicLibrary || room.roomType === RoomType.PrivateLibrary) renderRoomLibrary(map, room, level, rng);
        // Place creaky floor tiles
        if (cellType == (0, _gameMap.TerrainType).GroundWood && level > 3) placeCreakyFloorTiles(map, room, rng);
    }
}
function renderRoomCourtyard(map, room, level, rng) {
    const dx = room.posMax[0] - room.posMin[0];
    const dy = room.posMax[1] - room.posMin[1];
    if (dx >= 5 && dy >= 5) setRectTerrainType(map, room.posMin[0] + 1, room.posMin[1] + 1, room.posMax[0] - 1, room.posMax[1] - 1, (0, _gameMap.TerrainType).GroundWater);
    else if (dx >= 2 && dy >= 2) {
        const itemTypes = [
            (0, _gameMap.ItemType).Bush,
            (0, _gameMap.ItemType).Bush,
            (0, _gameMap.ItemType).Bush,
            (0, _gameMap.ItemType).Bush
        ];
        if (dx > 2 && dy > 2) itemTypes.push(randomlyLitTorch(level, rng));
        rng.shuffleArray(itemTypes);
        const itemPositions = [
            (0, _myMatrix.vec2).fromValues(room.posMin[0], room.posMin[1]),
            (0, _myMatrix.vec2).fromValues(room.posMax[0] - 1, room.posMin[1]),
            (0, _myMatrix.vec2).fromValues(room.posMin[0], room.posMax[1] - 1),
            (0, _myMatrix.vec2).fromValues(room.posMax[0] - 1, room.posMax[1] - 1)
        ];
        for(let i = 0; i < itemPositions.length; ++i){
            const pos = itemPositions[i];
            const cellType = map.cells.atVec(pos).type;
            if (cellType !== (0, _gameMap.TerrainType).GroundGrass) continue;
            tryPlaceItem(map, pos, itemTypes[i]);
        }
    }
}
function renderRoomGeneric(map, room, level, rng) {
    const dx = room.posMax[0] - room.posMin[0];
    const dy = room.posMax[1] - room.posMin[1];
    if (dx >= 5 && dy >= 5) {
        if (room.roomType == RoomType.PrivateRoom) setRectTerrainType(map, room.posMin[0] + 2, room.posMin[1] + 2, room.posMax[0] - 2, room.posMax[1] - 2, (0, _gameMap.TerrainType).GroundWater);
        map.cells.at(room.posMin[0] + 1, room.posMin[1] + 1).type = (0, _gameMap.TerrainType).Wall0000;
        map.cells.at(room.posMax[0] - 2, room.posMin[1] + 1).type = (0, _gameMap.TerrainType).Wall0000;
        map.cells.at(room.posMin[0] + 1, room.posMax[1] - 2).type = (0, _gameMap.TerrainType).Wall0000;
        map.cells.at(room.posMax[0] - 2, room.posMax[1] - 2).type = (0, _gameMap.TerrainType).Wall0000;
    } else if (dx == 5 && dy >= 3 && (room.roomType == RoomType.PublicRoom || rng.random() < 0.33333)) {
        const itemTypes = new Array(dy - 2).fill((0, _gameMap.ItemType).Table);
        itemTypes.push(randomlyLitTorch(level, rng));
        rng.shuffleArray(itemTypes);
        for(let y = 1; y < dy - 1; ++y){
            placeItem(map, (0, _myMatrix.vec2).fromValues(room.posMin[0] + 1, room.posMin[1] + y), (0, _gameMap.ItemType).Chair);
            placeItem(map, (0, _myMatrix.vec2).fromValues(room.posMin[0] + 2, room.posMin[1] + y), itemTypes[y - 1]);
            placeItem(map, (0, _myMatrix.vec2).fromValues(room.posMin[0] + 3, room.posMin[1] + y), (0, _gameMap.ItemType).Chair);
        }
    } else if (dy == 5 && dx >= 3 && (room.roomType == RoomType.PublicRoom || rng.random() < 0.33333)) {
        const itemTypes = new Array(dx - 2).fill((0, _gameMap.ItemType).Table);
        itemTypes.push(randomlyLitTorch(level, rng));
        rng.shuffleArray(itemTypes);
        for(let x = 1; x < dx - 1; ++x){
            placeItem(map, (0, _myMatrix.vec2).fromValues(room.posMin[0] + x, room.posMin[1] + 1), (0, _gameMap.ItemType).Chair);
            placeItem(map, (0, _myMatrix.vec2).fromValues(room.posMin[0] + x, room.posMin[1] + 2), itemTypes[x - 1]);
            placeItem(map, (0, _myMatrix.vec2).fromValues(room.posMin[0] + x, room.posMin[1] + 3), (0, _gameMap.ItemType).Chair);
        }
    } else if (dx > dy && (dy & 1) == 1 && rng.random() < 0.66667) {
        let y = Math.floor(room.posMin[1] + dy / 2);
        const furnitureType = room.roomType == RoomType.PublicRoom ? (0, _gameMap.ItemType).Table : (0, _gameMap.ItemType).Chair;
        const torchType = randomlyLitTorch(level, rng);
        const itemTypes = [
            torchType,
            furnitureType
        ];
        rng.shuffleArray(itemTypes);
        tryPlaceItem(map, (0, _myMatrix.vec2).fromValues(room.posMin[0] + 1, y), itemTypes[0]);
        tryPlaceItem(map, (0, _myMatrix.vec2).fromValues(room.posMax[0] - 2, y), itemTypes[1]);
    } else if (dy > dx && (dx & 1) == 1 && rng.random() < 0.66667) {
        let x = Math.floor(room.posMin[0] + dx / 2);
        const furnitureType = room.roomType == RoomType.PublicRoom ? (0, _gameMap.ItemType).Table : (0, _gameMap.ItemType).Chair;
        const torchType = randomlyLitTorch(level, rng);
        const itemTypes = [
            torchType,
            furnitureType
        ];
        rng.shuffleArray(itemTypes);
        tryPlaceItem(map, (0, _myMatrix.vec2).fromValues(x, room.posMin[1] + 1), itemTypes[0]);
        tryPlaceItem(map, (0, _myMatrix.vec2).fromValues(x, room.posMax[1] - 2), itemTypes[1]);
    } else if (dx > 3 && dy > 3) {
        const furnitureType = room.roomType == RoomType.PublicRoom ? (0, _gameMap.ItemType).Table : (0, _gameMap.ItemType).Chair;
        const torchType = randomlyLitTorch(level, rng);
        const itemTypes = [
            torchType,
            furnitureType,
            furnitureType,
            furnitureType
        ];
        rng.shuffleArray(itemTypes);
        tryPlaceItem(map, (0, _myMatrix.vec2).fromValues(room.posMin[0], room.posMin[1]), itemTypes[0]);
        tryPlaceItem(map, (0, _myMatrix.vec2).fromValues(room.posMax[0] - 1, room.posMin[1]), itemTypes[1]);
        tryPlaceItem(map, (0, _myMatrix.vec2).fromValues(room.posMin[0], room.posMax[1] - 1), itemTypes[2]);
        tryPlaceItem(map, (0, _myMatrix.vec2).fromValues(room.posMax[0] - 1, room.posMax[1] - 1), itemTypes[3]);
    }
}
function renderRoomVault(map, room, rng) {
    const dx = room.posMax[0] - room.posMin[0];
    const dy = room.posMax[1] - room.posMin[1];
    if (dx >= 5 && dy >= 5) {
        map.cells.at(room.posMin[0] + 1, room.posMin[1] + 1).type = (0, _gameMap.TerrainType).Wall0000;
        map.cells.at(room.posMax[0] - 2, room.posMin[1] + 1).type = (0, _gameMap.TerrainType).Wall0000;
        map.cells.at(room.posMin[0] + 1, room.posMax[1] - 2).type = (0, _gameMap.TerrainType).Wall0000;
        map.cells.at(room.posMax[0] - 2, room.posMax[1] - 2).type = (0, _gameMap.TerrainType).Wall0000;
    }
    // TODO: This is all largely a copy of renderRoomBedroom. Need to commonize
    const candidateItems = [
        (0, _gameMap.ItemType).DrawersTall,
        (0, _gameMap.ItemType).DrawersShort,
        (0, _gameMap.ItemType).Chair,
        (0, _gameMap.ItemType).Table,
        (0, _gameMap.ItemType).Bookshelf,
        (0, _gameMap.ItemType).Shelf,
        (0, _gameMap.ItemType).TorchUnlit
    ];
    rng.shuffleArray(candidateItems);
    const sizeX = room.posMax[0] - room.posMin[0];
    const sizeY = room.posMax[1] - room.posMin[1];
    const usable = new (0, _gameMap.BooleanGrid)(sizeX, sizeY, true);
    const unusable = new (0, _gameMap.BooleanGrid)(sizeX, sizeY, false);
    const occupied = new (0, _gameMap.BooleanGrid)(sizeX, sizeY, false);
    let rootX, rootY;
    for(let x = 0; x < sizeX; ++x)for(let y = 0; y < sizeY; ++y){
        if (!isWalkableTerrainType(map.cells.at(x + room.posMin[0], y + room.posMin[1]).type)) {
            occupied.set(x, y, true);
            unusable.set(x, y, true);
        } else if (doorAdjacent(map.cells, (0, _myMatrix.vec2).fromValues(x + room.posMin[0], y + room.posMin[1]))) {
            unusable.set(x, y, true);
            rootX = x;
            rootY = y;
        }
    }
    if (rootX === undefined || rootY === undefined) return;
    const itemsInRoom = [];
    for(let iItemType = 0;; iItemType = (iItemType + 1) % candidateItems.length){
        for(let j = 0; j < usable.values.length; ++j)usable.values[j] = unusable.values[j] ? 0 : 1;
        updateUsable(usable, occupied, rootX, rootY);
        updateUsableForReachability(usable, occupied, itemsInRoom, room);
        const positions = getUsablePositions(usable);
        if (positions.length === 0) break;
        const pos = positions[rng.randomInRange(positions.length)];
        console.assert(usable.get(pos[0], pos[1]));
        console.assert(!occupied.get(pos[0], pos[1]));
        const item = {
            pos: (0, _myMatrix.vec2).fromValues(pos[0] + room.posMin[0], pos[1] + room.posMin[1]),
            type: candidateItems[iItemType]
        };
        map.items.push(item);
        itemsInRoom.push(item);
        occupied.set(pos[0], pos[1], true);
        unusable.set(pos[0], pos[1], true);
    }
}
function renderRoomBedroom(map, room, level, rng) {
    // Look for a place to put the bed that doesn't block any doors and is against a wall
    // Should I use indices for the graph positions, and convert to coordinates via a lookup table or something?
    const sizeX = room.posMax[0] - room.posMin[0];
    const sizeY = room.posMax[1] - room.posMin[1];
    const usable = new (0, _gameMap.BooleanGrid)(sizeX, sizeY, true);
    const unusableShort = new (0, _gameMap.BooleanGrid)(sizeX, sizeY, false);
    const unusableTall = new (0, _gameMap.BooleanGrid)(sizeX, sizeY, false);
    const occupied = new (0, _gameMap.BooleanGrid)(sizeX, sizeY, false);
    let rootX, rootY;
    const pos = (0, _myMatrix.vec2).create();
    for(let x = 0; x < sizeX; ++x)for(let y = 0; y < sizeY; ++y){
        pos.set(x + room.posMin[0], y + room.posMin[1]);
        if (!isWalkableTerrainType(map.cells.atVec(pos).type)) {
            occupied.set(x, y, true);
            unusableShort.set(x, y, true);
            unusableTall.set(x, y, true);
        } else if (doorAdjacent(map.cells, pos)) {
            unusableShort.set(x, y, true);
            unusableTall.set(x, y, true);
            rootX = x;
            rootY = y;
        }
        if (windowAdjacent(map.cells, pos) || !isAdjacentToWall(map, pos)) unusableTall.set(x, y, true);
    }
    if (rootX === undefined || rootY === undefined) return;
    const potentialPositions = [];
    for(let x = room.posMin[0]; x < room.posMax[0] - 1; ++x)for(let y = room.posMin[1]; y < room.posMax[1]; ++y){
        const pos0 = (0, _myMatrix.vec2).fromValues(x, y);
        const pos1 = (0, _myMatrix.vec2).fromValues(x + 1, y);
        if (!wallOrWindowAdjacent(map.cells, pos0) && !wallOrWindowAdjacent(map.cells, pos1)) continue;
        if (isItemAtPos(map, pos0) || isItemAtPos(map, pos1)) continue;
        if (doorAdjacent(map.cells, pos0) || doorAdjacent(map.cells, pos1)) continue;
        // If the room is only as wide as the bed, the bed must be at the top or bottom
        // or it will split the room.
        if (sizeX === 2 && y !== room.posMin[1] && y !== room.posMax[1] - 1) continue;
        potentialPositions.push(pos0);
    }
    const itemsInRoom = [];
    if (potentialPositions.length > 0) {
        const pos0 = potentialPositions[rng.randomInRange(potentialPositions.length)];
        const pos1 = (0, _myMatrix.vec2).fromValues(pos0[0] + 1, pos0[1]);
        const itemBedL = {
            pos: (0, _myMatrix.vec2).clone(pos0),
            type: (0, _gameMap.ItemType).BedL
        };
        const itemBedR = {
            pos: (0, _myMatrix.vec2).clone(pos1),
            type: (0, _gameMap.ItemType).BedR
        };
        map.items.push(itemBedL);
        map.items.push(itemBedR);
        itemsInRoom.push(itemBedL); // will check adjacency for the right side of the bed with this too
        const x = pos0[0] - room.posMin[0];
        const y = pos0[1] - room.posMin[1];
        occupied.set(x, y, true);
        occupied.set(x + 1, y, true);
        unusableShort.set(x, y, true);
        unusableShort.set(x + 1, y, true);
        unusableTall.set(x, y, true);
        unusableTall.set(x + 1, y, true);
    }
    const candidateItems = [
        (0, _gameMap.ItemType).DrawersTall,
        (0, _gameMap.ItemType).DrawersShort,
        (0, _gameMap.ItemType).Chair,
        (0, _gameMap.ItemType).Chair,
        (0, _gameMap.ItemType).Table,
        (0, _gameMap.ItemType).Bookshelf,
        randomlyLitTorch(level, rng)
    ];
    rng.shuffleArray(candidateItems);
    for (const itemType of candidateItems){
        const unusable = isTallItemType(itemType) ? unusableTall : unusableShort;
        for(let j = 0; j < usable.values.length; ++j)usable.values[j] = unusable.values[j] ? 0 : 1;
        updateUsable(usable, occupied, rootX, rootY);
        updateUsableForReachability(usable, occupied, itemsInRoom, room);
        const positions = getUsablePositions(usable);
        if (positions.length === 0) break;
        const pos = positions[rng.randomInRange(positions.length)];
        console.assert(usable.get(pos[0], pos[1]));
        console.assert(!occupied.get(pos[0], pos[1]));
        const item = {
            pos: (0, _myMatrix.vec2).fromValues(pos[0] + room.posMin[0], pos[1] + room.posMin[1]),
            type: itemType
        };
        map.items.push(item);
        itemsInRoom.push(item);
        occupied.set(pos[0], pos[1], true);
        unusableShort.set(pos[0], pos[1], true);
        unusableTall.set(pos[0], pos[1], true);
    }
}
function isTallItemType(itemType) {
    switch(itemType){
        case (0, _gameMap.ItemType).Bookshelf:
        case (0, _gameMap.ItemType).DrawersShort:
        case (0, _gameMap.ItemType).DrawersTall:
        case (0, _gameMap.ItemType).Shelf:
        case (0, _gameMap.ItemType).TorchUnlit:
        case (0, _gameMap.ItemType).TorchLit:
        case (0, _gameMap.ItemType).Stove:
            return true;
        default:
            return false;
    }
}
function updateUsableForReachability(usable, occupied, items, room) {
    const sizeX = usable.sizeX;
    const sizeY = usable.sizeY;
    for (const item of items){
        const x = item.pos[0] - room.posMin[0];
        const y = item.pos[1] - room.posMin[1];
        const unoccupiedNeighbors = [];
        for (const [dx, dy] of [
            [
                1,
                0
            ],
            [
                0,
                1
            ],
            [
                -1,
                0
            ],
            [
                0,
                -1
            ]
        ]){
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= sizeX || ny >= sizeY) continue;
            if (!occupied.get(nx, ny)) unoccupiedNeighbors.push([
                nx,
                ny
            ]);
        }
        // For beds, also consider positions around the right side of the bed
        if (item.type === (0, _gameMap.ItemType).BedL) for (const [dx, dy] of [
            [
                1,
                0
            ],
            [
                0,
                1
            ],
            [
                0,
                -1
            ]
        ]){
            const nx = x + dx + 1;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= sizeX || ny >= sizeY) continue;
            if (!occupied.get(nx, ny)) unoccupiedNeighbors.push([
                nx,
                ny
            ]);
        }
        if (unoccupiedNeighbors.length === 1) {
            const [nx, ny] = unoccupiedNeighbors[0];
            usable.set(nx, ny, false);
        }
    }
}
// Find "biconnected components" in the graph formed by occupied and mark them not usable.
// These are squares that, if they were to become occupied, would split the graph into disjoint pieces.
// Algorithm from Hopcroft/Tarjan via wikipedia.
function updateUsable(usable, occupied, rootX, rootY) {
    const sizeX = occupied.sizeX;
    const sizeY = occupied.sizeY;
    console.assert(usable.sizeX === sizeX);
    console.assert(usable.sizeY === sizeY);
    console.assert(rootX >= 0);
    console.assert(rootY >= 0);
    console.assert(rootX < sizeX);
    console.assert(rootY < sizeY);
    console.assert(!occupied.get(rootX, rootY));
    const visited = new (0, _gameMap.BooleanGrid)(sizeX, sizeY, false);
    const depth = new (0, _gameMap.Int32Grid)(sizeX, sizeY, 0);
    const low = new (0, _gameMap.Int32Grid)(sizeX, sizeY, 0);
    function dfs(x, y, depthCur, parentX, parentY) {
        visited.set(x, y, true);
        depth.set(x, y, depthCur);
        low.set(x, y, depthCur);
        let numChildren = 0;
        let isArticulation = false;
        for (const [dx, dy] of [
            [
                1,
                0
            ],
            [
                0,
                1
            ],
            [
                -1,
                0
            ],
            [
                0,
                -1
            ]
        ]){
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || nx >= sizeX || ny < 0 || ny >= sizeY) continue;
            if (occupied.get(nx, ny)) continue;
            if (!visited.get(nx, ny)) {
                dfs(nx, ny, depthCur + 1, x, y);
                ++numChildren;
                if (low.get(nx, ny) >= depthCur) isArticulation = true;
                low.set(x, y, Math.min(low.get(x, y), low.get(nx, ny)));
            } else if (nx !== parentX || ny !== parentY) low.set(x, y, Math.min(low.get(x, y), depth.get(nx, ny)));
        }
        const hasParent = parentX >= 0;
        if (hasParent) {
            if (isArticulation) usable.set(x, y, false);
        } else if (numChildren > 1) usable.set(x, y, false);
    }
    dfs(rootX, rootY, 0, -1, -1);
/*
    for (let y = sizeY - 1; y >= 0; --y) {
        let s = '';
        for (let x = 0; x < sizeX; ++x) {
            s += occupied.get(x, y) ? 'O' : usable.get(x, y) ? '.' : 'X';
        }
        console.log('%d: %s', y, s);
    }
    */ }
function renderRoomKitchen(map, room, level, rng) {
    const sizeX = room.posMax[0] - room.posMin[0];
    const sizeY = room.posMax[1] - room.posMin[1];
    // Work out a major axis for the kitchen, based on dimensions first, and exits second
    let positions = [];
    const axisEW = sizeX > sizeY || sizeX === sizeY && numExitsNS(room) <= numExitsEW(room);
    if (axisEW) {
        for(let x = 0; x < sizeX; ++x){
            positions.push((0, _myMatrix.vec2).fromValues(x + room.posMin[0], room.posMin[1]));
            positions.push((0, _myMatrix.vec2).fromValues(x + room.posMin[0], room.posMax[1] - 1));
        }
        const centerX = (room.posMin[0] + room.posMax[0]) / 2;
        positions.sort((pos0, pos1)=>Math.abs(pos0[0] - centerX) - Math.abs(pos1[0] - centerX));
    } else {
        for(let y = 0; y < sizeY; ++y){
            positions.push((0, _myMatrix.vec2).fromValues(room.posMin[0], y + room.posMin[1]));
            positions.push((0, _myMatrix.vec2).fromValues(room.posMax[0] - 1, y + room.posMin[1]));
        }
        const centerY = (room.posMin[1] + room.posMax[1]) / 2;
        positions.sort((pos0, pos1)=>Math.abs(pos0[1] - centerY) - Math.abs(pos1[1] - centerY));
    }
    positions = positions.filter((pos)=>!doorAdjacent(map.cells, pos) && wallOrWindowAdjacent(map.cells, pos));
    let numStoves = numberToIntegral(sizeX * sizeY / 10, rng);
    let numShelves = numberToIntegral(positions.length / 3, rng);
    let numTables = numberToIntegral(positions.length / 2, rng);
    for (const pos of positions){
        if (windowAdjacent(map.cells, pos)) {
            if (numTables > 0) {
                placeItem(map, pos, (0, _gameMap.ItemType).Table);
                --numTables;
            }
        } else {
            if (numStoves > 0) {
                placeItem(map, pos, (0, _gameMap.ItemType).Stove);
                --numStoves;
            } else if (numTables > 0) {
                placeItem(map, pos, (0, _gameMap.ItemType).Table);
                --numTables;
            } else if (numShelves > 0) {
                placeItem(map, pos, (0, _gameMap.ItemType).Shelf);
                --numShelves;
            }
        }
    }
    // Put tables in the middle if the room is big enough
    if (axisEW) {
        if (sizeY >= 5) {
            for(let x = room.posMin[0] + 1; x < room.posMax[0] - 1; x += 2)for(let y = room.posMin[1] + 2; y < room.posMax[1] - 2; ++y)placeItem(map, (0, _myMatrix.vec2).fromValues(x, y), (0, _gameMap.ItemType).Table);
        }
    } else if (sizeX >= 5) {
        for(let y = room.posMin[1] + 1; y < room.posMax[1] - 1; y += 2)for(let x = room.posMin[0] + 2; x < room.posMax[0] - 2; ++x)placeItem(map, (0, _myMatrix.vec2).fromValues(x, y), (0, _gameMap.ItemType).Table);
    }
}
function numberToIntegral(n, rng) {
    const fraction = n - Math.floor(n);
    n = Math.floor(n);
    if (rng.random() < fraction) ++n;
    return n;
}
function numExitsEW(room) {
    let numExits = 0;
    for (const adj of room.edges){
        if (adj.dir[0] !== 0) continue;
        if (adj.door) ++numExits;
    }
    return numExits;
}
function numExitsNS(room) {
    let numExits = 0;
    for (const adj of room.edges){
        if (adj.dir[1] !== 0) continue;
        if (adj.door) ++numExits;
    }
    return numExits;
}
function renderRoomDining(map, room, level, rng) {
    const x0 = room.posMin[0];
    const y0 = room.posMin[1];
    const rx = room.posMax[0] - room.posMin[0];
    const ry = room.posMax[1] - room.posMin[1];
    if (rx >= ry) {
        const yCenter = y0 + Math.floor(ry / 2);
        if ((rx & 1) == 0) {
            tryPlaceItem(map, (0, _myMatrix.vec2).fromValues(x0 + 1, yCenter), randomlyLitTorch(level, rng));
            tryPlaceItem(map, (0, _myMatrix.vec2).fromValues(x0 + rx - 2, yCenter), randomlyLitTorch(level, rng));
            for(let x = x0 + 2; x < x0 + rx - 2; ++x){
                placeItem(map, (0, _myMatrix.vec2).fromValues(x, yCenter - 1), (0, _gameMap.ItemType).Chair);
                placeItem(map, (0, _myMatrix.vec2).fromValues(x, yCenter), (0, _gameMap.ItemType).Table);
                placeItem(map, (0, _myMatrix.vec2).fromValues(x, yCenter + 1), (0, _gameMap.ItemType).Chair);
            }
        } else {
            const xCenter = x0 + (rx - 1) / 2;
            tryPlaceItem(map, (0, _myMatrix.vec2).fromValues(xCenter, yCenter), randomlyLitTorch(level, rng));
            for(let x = x0 + 1; x < xCenter; ++x){
                placeItem(map, (0, _myMatrix.vec2).fromValues(x, yCenter - 1), (0, _gameMap.ItemType).Chair);
                placeItem(map, (0, _myMatrix.vec2).fromValues(x, yCenter), (0, _gameMap.ItemType).Table);
                placeItem(map, (0, _myMatrix.vec2).fromValues(x, yCenter + 1), (0, _gameMap.ItemType).Chair);
            }
            for(let x = xCenter + 1; x < x0 + rx - 1; ++x){
                placeItem(map, (0, _myMatrix.vec2).fromValues(x, yCenter - 1), (0, _gameMap.ItemType).Chair);
                placeItem(map, (0, _myMatrix.vec2).fromValues(x, yCenter), (0, _gameMap.ItemType).Table);
                placeItem(map, (0, _myMatrix.vec2).fromValues(x, yCenter + 1), (0, _gameMap.ItemType).Chair);
            }
        }
    } else {
        const xCenter = x0 + Math.floor(rx / 2);
        if ((ry & 1) == 0) {
            tryPlaceItem(map, (0, _myMatrix.vec2).fromValues(xCenter, y0 + 1), randomlyLitTorch(level, rng));
            tryPlaceItem(map, (0, _myMatrix.vec2).fromValues(xCenter, y0 + ry - 2), randomlyLitTorch(level, rng));
            for(let y = y0 + 2; y < y0 + ry - 2; ++y){
                placeItem(map, (0, _myMatrix.vec2).fromValues(xCenter - 1, y), (0, _gameMap.ItemType).Chair);
                placeItem(map, (0, _myMatrix.vec2).fromValues(xCenter, y), (0, _gameMap.ItemType).Table);
                placeItem(map, (0, _myMatrix.vec2).fromValues(xCenter + 1, y), (0, _gameMap.ItemType).Chair);
            }
        } else {
            const yCenter = y0 + (ry - 1) / 2;
            tryPlaceItem(map, (0, _myMatrix.vec2).fromValues(xCenter, yCenter), randomlyLitTorch(level, rng));
            for(let y = y0 + 1; y < yCenter; ++y){
                placeItem(map, (0, _myMatrix.vec2).fromValues(xCenter - 1, y), (0, _gameMap.ItemType).Chair);
                placeItem(map, (0, _myMatrix.vec2).fromValues(xCenter, y), (0, _gameMap.ItemType).Table);
                placeItem(map, (0, _myMatrix.vec2).fromValues(xCenter + 1, y), (0, _gameMap.ItemType).Chair);
            }
            for(let y = yCenter + 1; y < y0 + ry - 1; ++y){
                placeItem(map, (0, _myMatrix.vec2).fromValues(xCenter - 1, y), (0, _gameMap.ItemType).Chair);
                placeItem(map, (0, _myMatrix.vec2).fromValues(xCenter, y), (0, _gameMap.ItemType).Table);
                placeItem(map, (0, _myMatrix.vec2).fromValues(xCenter + 1, y), (0, _gameMap.ItemType).Chair);
            }
        }
    }
}
function renderRoomLibrary(map, room, level, rng) {
    const x0 = room.posMin[0];
    const y0 = room.posMin[1];
    const rx = room.posMax[0] - room.posMin[0];
    const ry = room.posMax[1] - room.posMin[1];
    if (rx >= ry) {
        const cx = Math.floor((rx - 1) / 2);
        for(let x = 1; x < cx; x += 2)for(let y = 1; y < ry - 1; ++y){
            placeItem(map, (0, _myMatrix.vec2).fromValues(x0 + x, y0 + y), (0, _gameMap.ItemType).Bookshelf);
            placeItem(map, (0, _myMatrix.vec2).fromValues(x0 + rx - (x + 1), y0 + y), (0, _gameMap.ItemType).Bookshelf);
        }
    } else {
        const cy = Math.floor((ry - 1) / 2);
        for(let y = 1; y < cy; y += 2)for(let x = 1; x < rx - 1; ++x){
            placeItem(map, (0, _myMatrix.vec2).fromValues(x0 + x, y0 + y), (0, _gameMap.ItemType).Bookshelf);
            placeItem(map, (0, _myMatrix.vec2).fromValues(x0 + x, y0 + ry - (y + 1)), (0, _gameMap.ItemType).Bookshelf);
        }
    }
}
function getUsablePositions(usable) {
    const positions = [];
    for(let x = 0; x < usable.sizeX; ++x){
        for(let y = 0; y < usable.sizeY; ++y)if (usable.get(x, y)) positions.push((0, _myMatrix.vec2).fromValues(x, y));
    }
    return positions;
}
function placeCreakyFloorTiles(map, room, rng) {
    for(let x = room.posMin[0]; x < room.posMax[0]; ++x)for(let y = room.posMin[1]; y < room.posMax[1]; ++y){
        if (map.cells.at(x, y).type != (0, _gameMap.TerrainType).GroundWood) continue;
        if (map.items.some((item)=>item.pos[0] === x && item.pos[1] === y && blocksPlayerMovement(item.type))) continue;
        if (doorAdjacent(map.cells, (0, _myMatrix.vec2).fromValues(x, y))) continue;
        if (rng.random() >= 0.02) continue;
        const canLeapHorz = x > room.posMin[0] && x < room.posMax[0] - 1 && map.cells.at(x - 1, y).type === (0, _gameMap.TerrainType).GroundWood && map.cells.at(x + 1, y).type === (0, _gameMap.TerrainType).GroundWood && !map.items.some((item)=>item.pos[0] === x - 1 && item.pos[1] === y && blocksPlayerMovement(item.type)) && !map.items.some((item)=>item.pos[0] === x + 1 && item.pos[1] === y && blocksPlayerMovement(item.type));
        const canLeapVert = y > room.posMin[1] && y < room.posMax[1] - 1 && map.cells.at(x, y - 1).type === (0, _gameMap.TerrainType).GroundWood && map.cells.at(x, y + 1).type === (0, _gameMap.TerrainType).GroundWood && !map.items.some((item)=>item.pos[0] === x && item.pos[1] === y - 1 && blocksPlayerMovement(item.type)) && !map.items.some((item)=>item.pos[0] === x && item.pos[1] === y + 1 && blocksPlayerMovement(item.type));
        if (!(canLeapHorz || canLeapVert)) continue;
        map.cells.at(x, y).type = (0, _gameMap.TerrainType).GroundWoodCreaky;
    }
}
function randomlyLitTorch(level, rng) {
    if (level === 0) return (0, _gameMap.ItemType).TorchUnlit;
    return rng.random() < 0.05 ? (0, _gameMap.ItemType).TorchUnlit : (0, _gameMap.ItemType).TorchLit;
}
function tryPlaceItem(map, pos, itemType) {
    if (doorAdjacent(map.cells, pos)) return;
    if ((itemType == (0, _gameMap.ItemType).TorchUnlit || itemType == (0, _gameMap.ItemType).TorchLit) && windowAdjacent(map.cells, pos)) return;
    placeItem(map, pos, itemType);
}
function doorAdjacent(map, pos) {
    let [x, y] = pos;
    if (map.at(x - 1, y).type >= (0, _gameMap.TerrainType).PortcullisNS) return true;
    if (map.at(x + 1, y).type >= (0, _gameMap.TerrainType).PortcullisNS) return true;
    if (map.at(x, y - 1).type >= (0, _gameMap.TerrainType).PortcullisNS) return true;
    if (map.at(x, y + 1).type >= (0, _gameMap.TerrainType).PortcullisNS) return true;
    return false;
}
function windowAdjacent(map, pos) {
    let [x, y] = pos;
    if ((0, _gameMap.isWindowTerrainType)(map.at(x - 1, y).type)) return true;
    if ((0, _gameMap.isWindowTerrainType)(map.at(x + 1, y).type)) return true;
    if ((0, _gameMap.isWindowTerrainType)(map.at(x, y - 1).type)) return true;
    if ((0, _gameMap.isWindowTerrainType)(map.at(x, y + 1).type)) return true;
    return false;
}
function wallAdjacent(map, pos) {
    let [x, y] = pos;
    if (isWallTerrainType(map.at(x - 1, y).type)) return true;
    if (isWallTerrainType(map.at(x + 1, y).type)) return true;
    if (isWallTerrainType(map.at(x, y - 1).type)) return true;
    if (isWallTerrainType(map.at(x, y + 1).type)) return true;
    return false;
}
function wallOrWindowAdjacent(map, pos) {
    let [x, y] = pos;
    if (isWallOrWindowTerrainType(map.at(x - 1, y).type)) return true;
    if (isWallOrWindowTerrainType(map.at(x + 1, y).type)) return true;
    if (isWallOrWindowTerrainType(map.at(x, y - 1).type)) return true;
    if (isWallOrWindowTerrainType(map.at(x, y + 1).type)) return true;
    return false;
}
function isWalkableTerrainType(terrainType) {
    return terrainType < (0, _gameMap.TerrainType).Wall0000 && terrainType !== (0, _gameMap.TerrainType).GroundWater;
}
function isWallTerrainType(terrainType) {
    return terrainType >= (0, _gameMap.TerrainType).Wall0000 && terrainType <= (0, _gameMap.TerrainType).Wall1111;
}
function isWallOrWindowTerrainType(terrainType) {
    return terrainType >= (0, _gameMap.TerrainType).Wall0000 && terrainType <= (0, _gameMap.TerrainType).OneWayWindowS;
}
function placeItem(map, pos, type) {
    map.items.push({
        pos: (0, _myMatrix.vec2).clone(pos),
        type: type
    });
}
function placeLoot(totalLootToPlace, rooms, map, rng) {
    let totalLootPlaced = 0;
    // Vault rooms (may) get loot.
    for (const room of rooms){
        if (room.roomType !== RoomType.Vault) continue;
        for(let i = rng.randomInRange(3) + rng.randomInRange(3); i > 0; --i){
            if (totalLootPlaced >= totalLootToPlace) break;
            if (tryPlaceLoot(room.posMin, room.posMax, map, rng)) ++totalLootPlaced;
        }
    }
    // Other dead-end rooms automatically get loot.
    for (const room of rooms){
        if (totalLootPlaced >= totalLootToPlace) break;
        if (room.roomType === RoomType.Exterior || room.roomType === RoomType.Vault) continue;
        if ((room.roomType === RoomType.PublicCourtyard || room.roomType === RoomType.PrivateCourtyard) && rng.random() < 0.75) continue;
        let numExits = 0;
        for (const adj of room.edges)if (adj.door) numExits += 1;
        if (numExits < 2) {
            if (tryPlaceLoot(room.posMin, room.posMax, map, rng)) ++totalLootPlaced;
        }
    }
    // Master-suite rooms get loot.
    for (const room of rooms){
        if (totalLootPlaced >= totalLootToPlace) break;
        if (!isMasterSuiteRoomType(room.roomType)) continue;
        if (rng.random() < 0.5) continue;
        if (tryPlaceLoot(room.posMin, room.posMax, map, rng)) ++totalLootPlaced;
    }
    // Place extra loot to reach desired total.
    const candidateRooms = rooms.filter((room)=>room.roomType !== RoomType.Exterior && !isCourtyardRoomType(room.roomType));
    rng.shuffleArray(candidateRooms);
    for(let i = 0; i < 1000 && totalLootPlaced < totalLootToPlace; ++i){
        const room = candidateRooms[i % candidateRooms.length];
        if (tryPlaceLoot(room.posMin, room.posMax, map, rng)) ++totalLootPlaced;
    }
    console.assert(totalLootPlaced === totalLootToPlace);
}
function canHoldLoot(itemType) {
    switch(itemType){
        case (0, _gameMap.ItemType).Chair:
        case (0, _gameMap.ItemType).Table:
        case (0, _gameMap.ItemType).DrawersShort:
        case (0, _gameMap.ItemType).DrawersTall:
        case (0, _gameMap.ItemType).Bookshelf:
        case (0, _gameMap.ItemType).Shelf:
        case (0, _gameMap.ItemType).Bush:
            return true;
        default:
            return false;
    }
}
function canHoldHealth(itemType) {
    return itemType === (0, _gameMap.ItemType).Table;
}
function isValidGroundLootPos(pos, map) {
    let cellType = map.cells.atVec(pos).type;
    if (cellType === (0, _gameMap.TerrainType).GroundWater || cellType >= (0, _gameMap.TerrainType).Wall0000) return false;
    if (isItemAtPos(map, pos)) return false;
    return true;
}
function isLootPreferredAtPos(pos, map) {
    let cellType = map.cells.atVec(pos).type;
    if (cellType === (0, _gameMap.TerrainType).GroundWater || cellType >= (0, _gameMap.TerrainType).Wall0000) return false;
    let foundLootHoldingItem = false;
    for (const item of map.items)if (item.pos.equals(pos)) {
        if (!canHoldLoot(item.type)) return false;
        foundLootHoldingItem = true;
    }
    return foundLootHoldingItem;
}
function tryPlaceLoot(posMin, posMax, map, rng) {
    const positions = [];
    for(let x = posMin[0]; x < posMax[0]; ++x)for(let y = posMin[1]; y < posMax[1]; ++y){
        const pos = (0, _myMatrix.vec2).fromValues(x, y);
        if (isLootPreferredAtPos(pos, map)) positions.push(pos);
    }
    if (positions.length === 0) {
        for(let x = posMin[0]; x < posMax[0]; ++x)for(let y = posMin[1]; y < posMax[1]; ++y){
            const pos = (0, _myMatrix.vec2).fromValues(x, y);
            if (isValidGroundLootPos(pos, map)) positions.push(pos);
        }
        if (positions.length === 0) return false;
    }
    placeItem(map, positions[rng.randomInRange(positions.length)], (0, _gameMap.ItemType).Coin);
    return true;
}
function placeHealth(level, map, rooms, rng) {
    if (level < 1) return;
    let numHealthToPlace = 1 + Math.floor((9 - level) / 4);
    if (tryPlaceHealthInRoomTypes([
        RoomType.Kitchen
    ], map, rooms, rng)) --numHealthToPlace;
    if (numHealthToPlace > 0 && tryPlaceHealthInRoomTypes([
        RoomType.Kitchen,
        RoomType.Dining
    ], map, rooms, rng)) --numHealthToPlace;
    for(let iTry = 10; iTry > 0 && numHealthToPlace > 0; --iTry)if (tryPlaceHealthInRoomTypes([
        RoomType.Kitchen,
        RoomType.Dining,
        RoomType.Bedroom
    ], map, rooms, rng)) --numHealthToPlace;
}
function tryPlaceHealthInRoomTypes(roomTypes, map, rooms, rng) {
    const healthRooms = rooms.filter((room)=>roomTypes.includes(room.roomType));
    if (healthRooms.length === 0) return false;
    for(let iTry = 0; iTry < 10; ++iTry){
        const room = healthRooms[rng.randomInRange(healthRooms.length)];
        if (tryPlaceHealth(room.posMin, room.posMax, map, rng)) return true;
    }
    return false;
}
function tryPlaceHealth(posMin, posMax, map, rng) {
    const positions = [];
    for(let x = posMin[0]; x < posMax[0]; ++x)for(let y = posMin[1]; y < posMax[1]; ++y){
        const pos = (0, _myMatrix.vec2).fromValues(x, y);
        if (isHealthAllowedAtPos(pos, map)) positions.push(pos);
    }
    if (positions.length === 0) return false;
    placeItem(map, positions[rng.randomInRange(positions.length)], (0, _gameMap.ItemType).Health);
    return true;
}
function isHealthAllowedAtPos(pos, map) {
    let cellType = map.cells.atVec(pos).type;
    if (cellType === (0, _gameMap.TerrainType).GroundWater || cellType >= (0, _gameMap.TerrainType).Wall0000) return false;
    let foundHealthHoldingItem = false;
    for (const item of map.items)if (item.pos.equals(pos)) {
        if (!canHoldHealth(item.type)) return false;
        foundHealthHoldingItem = true;
    }
    return foundHealthHoldingItem;
}
function setRectTerrainType(map, xMin, yMin, xMax, yMax, terrainType) {
    for(let x = xMin; x < xMax; ++x)for(let y = yMin; y < yMax; ++y)map.cells.at(x, y).type = terrainType;
}
function placeExteriorBushes(map, outerPerimeter, rng) {
    const sx = map.cells.sizeX;
    const sy = map.cells.sizeY;
    for (const pos of outerPerimeter)map.cells.atVec(pos).type = (0, _gameMap.TerrainType).GroundNormal;
    setRectTerrainType(map, 0, 0, sx, outerBorder, (0, _gameMap.TerrainType).GroundNormal);
    for(let x = 0; x < sx; ++x)if ((x & 1) == 0 && rng.random() < 0.8) placeItem(map, (0, _myMatrix.vec2).fromValues(x, sy - 1), (0, _gameMap.ItemType).Bush);
    for(let y = outerBorder; y < sy - outerBorder + 1; ++y)if ((sy - y & 1) != 0) {
        if (rng.random() < 0.8) placeItem(map, (0, _myMatrix.vec2).fromValues(0, y), (0, _gameMap.ItemType).Bush);
        if (rng.random() < 0.8) placeItem(map, (0, _myMatrix.vec2).fromValues(sx - 1, y), (0, _gameMap.ItemType).Bush);
    }
}
function isAdjacentToWall(map, pos) {
    if (map.cells.atVec(pos).type >= (0, _gameMap.TerrainType).Wall0000) return false;
    if (pos[0] >= 0 && map.cells.at(pos[0] - 1, pos[1]).type >= (0, _gameMap.TerrainType).Wall0000) return true;
    if (pos[1] >= 0 && map.cells.at(pos[0], pos[1] - 1).type >= (0, _gameMap.TerrainType).Wall0000) return true;
    if (pos[0] + 1 < map.cells.sizeX && map.cells.at(pos[0] + 1, pos[1]).type >= (0, _gameMap.TerrainType).Wall0000) return true;
    if (pos[1] + 1 < map.cells.sizeY && map.cells.at(pos[0], pos[1] + 1).type >= (0, _gameMap.TerrainType).Wall0000) return true;
    return false;
}
function outerBuildingPerimeter(adjacencies, map) {
    const path = [];
    const posStart = playerStartPositionFrontDoor(adjacencies, map);
    const pos = (0, _myMatrix.vec2).clone(posStart);
    const dir = (0, _myMatrix.vec2).fromValues(1, 0);
    while(true){
        // Add current position to path
        path.push((0, _myMatrix.vec2).clone(pos));
        // Change movement direction if we are either headed into a wall, or are not adjacent to a wall
        const dirLeft = (0, _myMatrix.vec2).fromValues(-dir[1], dir[0]);
        const dirRight = (0, _myMatrix.vec2).fromValues(dir[1], -dir[0]);
        if (map.cells.at(pos[0] + dir[0], pos[1] + dir[1]).type >= (0, _gameMap.TerrainType).Wall0000) {
            if (map.cells.at(pos[0] + dirLeft[0], pos[1] + dirLeft[1]).type < (0, _gameMap.TerrainType).Wall0000) (0, _myMatrix.vec2).copy(dir, dirLeft);
            else if (map.cells.at(pos[0] + dirRight[0], pos[1] + dirRight[1]).type < (0, _gameMap.TerrainType).Wall0000) (0, _myMatrix.vec2).copy(dir, dirRight);
            else break;
        } else if (!isAdjacentToWall(map, pos)) {
            if (isAdjacentToWall(map, (0, _myMatrix.vec2).fromValues(pos[0] + dirLeft[0], pos[1] + dirLeft[1]))) (0, _myMatrix.vec2).copy(dir, dirLeft);
            else if (isAdjacentToWall(map, (0, _myMatrix.vec2).fromValues(pos[0] + dirRight[0], pos[1] + dirRight[1]))) (0, _myMatrix.vec2).copy(dir, dirRight);
            else break;
        }
        // Take a step
        pos.set(pos[0] + dir[0], pos[1] + dir[1]);
        // Stop if we return to the starting point, or move off the map
        if (pos.equals(posStart)) break;
        if (pos[0] < 0 || pos[1] < 0 || pos[0] >= map.cells.sizeX || pos[1] >= map.cells.sizeY) break;
    }
    return path;
}
function placeFrontPillars(map) {
    let sx = map.cells.sizeX - 1;
    let cx = Math.floor(map.cells.sizeX / 2);
    for(let x = outerBorder; x < cx; x += 5){
        map.cells.at(x, 1).type = (0, _gameMap.TerrainType).Wall0000;
        map.cells.at(sx - x, 1).type = (0, _gameMap.TerrainType).Wall0000;
    }
}
function isItemAtPos(map, pos) {
    for (const item of map.items){
        if (item.pos.equals(pos)) return true;
    }
    for (const guard of map.guards){
        if (guard.pos.equals(pos)) return true;
    }
    return false;
}
function isCourtyardRoomType(roomType) {
    switch(roomType){
        case RoomType.PublicCourtyard:
        case RoomType.PrivateCourtyard:
            return true;
        case RoomType.Exterior:
        case RoomType.PublicRoom:
        case RoomType.PrivateRoom:
        case RoomType.Vault:
        case RoomType.Bedroom:
        case RoomType.Dining:
        case RoomType.PublicLibrary:
        case RoomType.PrivateLibrary:
        case RoomType.Kitchen:
            return false;
    }
}
function isMasterSuiteRoomType(roomType) {
    return roomType === RoomType.PrivateRoom || roomType === RoomType.Bedroom;
}
function placeGuards(level, map, patrolRoutes, guardLoot, placeKey, rng) {
    if (level <= 0) return;
    for (const patrolRoute of patrolRoutes){
        let pathIndexStart = 0;
        const guard = new (0, _guard.Guard)(patrolRoute.path, pathIndexStart);
        if (level > 1 && rng.randomInRange(5 + level) < level) guard.hasTorch = true;
        if (placeKey) {
            placeKey = false;
            guard.hasVaultKey = true;
        } else if (guardLoot > 0) {
            guard.hasPurse = true;
            guardLoot--;
        }
        map.guards.push(guard);
    }
    console.assert(guardLoot === 0);
}
function markExteriorAsSeen(map) {
    const visited = new (0, _gameMap.BooleanGrid)(map.cells.sizeX, map.cells.sizeY, false);
    const toVisit = [
        map.playerStartPos
    ];
    for(let iToVisit = 0; iToVisit < toVisit.length; ++iToVisit){
        const p = toVisit[iToVisit];
        if (visited.get(p[0], p[1])) continue;
        visited.set(p[0], p[1], true);
        map.cells.atVec(p).seen = true;
        ++map.numPreRevealedCells;
        if (map.cells.atVec(p).type >= (0, _gameMap.TerrainType).Wall0000) continue;
        for(let dx = -1; dx <= 1; ++dx)for(let dy = -1; dy <= 1; ++dy){
            const p2 = (0, _myMatrix.vec2).fromValues(p[0] + dx, p[1] + dy);
            if (p2[0] >= 0 && p2[1] >= 0 && p2[0] < map.cells.sizeX && p2[1] < map.cells.sizeY && !visited.get(p2[0], p2[1])) toVisit.push(p2);
        }
    }
}
function blocksPlayerMovement(itemType) {
    return itemType === (0, _gameMap.ItemType).DrawersTall || itemType === (0, _gameMap.ItemType).Bookshelf || itemType === (0, _gameMap.ItemType).Shelf || itemType === (0, _gameMap.ItemType).Stove;
}
function cacheCellInfo(map) {
    let sx = map.cells.sizeX;
    let sy = map.cells.sizeY;
    for(let x = 0; x < sx; ++x)for(let y = 0; y < sy; ++y){
        const cell = map.cells.at(x, y);
        const cellType = cell.type;
        const isWall = cellType >= (0, _gameMap.TerrainType).Wall0000 && cellType <= (0, _gameMap.TerrainType).Wall1111;
        const isWindow = (0, _gameMap.isWindowTerrainType)(cellType);
        const isWater = cellType == (0, _gameMap.TerrainType).GroundWater;
        cell.moveCost = isWall || isWindow ? Infinity : isWater ? 64 : 0;
        cell.blocksPlayerMove = isWall;
        cell.blocksPlayerSight = isWall && cellType !== (0, _gameMap.TerrainType).Wall0000;
        cell.blocksSight = isWall;
        cell.blocksSound = isWall;
        cell.hidesPlayer = false;
    }
    for (const item of map.items){
        let cell = map.cells.atVec(item.pos);
        let itemType = item.type;
        cell.moveCost = Math.max(cell.moveCost, (0, _gameMap.guardMoveCostForItemType)(itemType));
        if (itemType === (0, _gameMap.ItemType).DoorNS || itemType === (0, _gameMap.ItemType).DoorEW || itemType === (0, _gameMap.ItemType).LockedDoorNS || itemType === (0, _gameMap.ItemType).LockedDoorEW) cell.blocksPlayerSight = true;
        if (itemType === (0, _gameMap.ItemType).DoorNS || itemType === (0, _gameMap.ItemType).DoorEW || itemType === (0, _gameMap.ItemType).LockedDoorNS || itemType === (0, _gameMap.ItemType).LockedDoorEW || itemType === (0, _gameMap.ItemType).PortcullisNS || itemType === (0, _gameMap.ItemType).PortcullisEW || itemType === (0, _gameMap.ItemType).Bush || itemType === (0, _gameMap.ItemType).DrawersTall || itemType === (0, _gameMap.ItemType).Bookshelf || itemType === (0, _gameMap.ItemType).Shelf || itemType === (0, _gameMap.ItemType).Stove) cell.blocksSight = true;
        if (itemType === (0, _gameMap.ItemType).Table || itemType === (0, _gameMap.ItemType).Bush || itemType === (0, _gameMap.ItemType).BedL || itemType === (0, _gameMap.ItemType).BedR) cell.hidesPlayer = true;
        if (blocksPlayerMovement(itemType)) cell.blocksPlayerMove = true;
    }
}
function fixupWalls(map) {
    for(let x = 0; x < map.sizeX; ++x)for(let y = 0; y < map.sizeY; ++y){
        const terrainType = map.at(x, y).type;
        if (terrainType == (0, _gameMap.TerrainType).Wall0000) map.at(x, y).type = wallTypeFromNeighbors(neighboringWalls(map, x, y));
    }
}
function wallTypeFromNeighbors(neighbors) {
    return (0, _gameMap.TerrainType).Wall0000 + neighbors;
}
function isWall(terrainType) {
    return terrainType >= (0, _gameMap.TerrainType).Wall0000 && terrainType <= (0, _gameMap.TerrainType).DoorEW;
}
function neighboringWalls(map, x, y) {
    const sizeX = map.sizeX;
    const sizeY = map.sizeY;
    let wallBits = 0;
    if (y < sizeY - 1 && isWall(map.at(x, y + 1).type)) wallBits |= 8;
    if (y > 0 && isWall(map.at(x, y - 1).type)) wallBits |= 4;
    if (x < sizeX - 1 && isWall(map.at(x + 1, y).type)) wallBits |= 2;
    if (x > 0 && isWall(map.at(x - 1, y).type)) wallBits |= 1;
    return wallBits;
}

},{"./game-map":"3bH7G","./guard":"bP2Su","./my-matrix":"21x0k","./random":"gUC1v","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"3bH7G":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "BooleanGrid", ()=>BooleanGrid);
parcelHelpers.export(exports, "CellGrid", ()=>CellGrid);
parcelHelpers.export(exports, "Float64Grid", ()=>Float64Grid);
parcelHelpers.export(exports, "Int32Grid", ()=>Int32Grid);
parcelHelpers.export(exports, "ItemType", ()=>ItemType);
parcelHelpers.export(exports, "GameMap", ()=>GameMap);
parcelHelpers.export(exports, "Player", ()=>Player);
parcelHelpers.export(exports, "TerrainType", ()=>TerrainType);
parcelHelpers.export(exports, "GuardStates", ()=>GuardStates);
parcelHelpers.export(exports, "guardMoveCostForItemType", ()=>guardMoveCostForItemType);
parcelHelpers.export(exports, "isWindowTerrainType", ()=>isWindowTerrainType);
parcelHelpers.export(exports, "isDoorItemType", ()=>isDoorItemType);
parcelHelpers.export(exports, "maxPlayerHealth", ()=>maxPlayerHealth);
parcelHelpers.export(exports, "maxPlayerTurnsUnderwater", ()=>maxPlayerTurnsUnderwater);
var _guard = require("./guard");
var _myMatrix = require("./my-matrix");
const cardinalDirections = [
    (0, _myMatrix.vec2).fromValues(-1, 0),
    (0, _myMatrix.vec2).fromValues(1, 0),
    (0, _myMatrix.vec2).fromValues(0, -1),
    (0, _myMatrix.vec2).fromValues(0, 1)
];
// TODO: Figure out how to make a generic grid data structure
class BooleanGrid {
    constructor(sizeX, sizeY, initialValue){
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.values = new Uint8Array(sizeX * sizeY);
        this.fill(initialValue);
    }
    fill(value) {
        this.values.fill(value ? 1 : 0);
    }
    get(x, y) {
        return this.values[this.sizeX * y + x] !== 0;
    }
    set(x, y, value) {
        this.values[this.sizeX * y + x] = value ? 1 : 0;
    }
}
class Int32Grid {
    constructor(sizeX, sizeY, initialValue){
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.values = new Int32Array(sizeX * sizeY);
        this.fill(initialValue);
    }
    fill(value) {
        this.values.fill(value);
    }
    get(x, y) {
        return this.values[this.sizeX * y + x];
    }
    set(x, y, value) {
        this.values[this.sizeX * y + x] = value;
    }
}
class Float64Grid {
    constructor(sizeX, sizeY, initialValue){
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.values = new Float64Array(sizeX * sizeY);
        this.fill(initialValue);
    }
    fill(value) {
        this.values.fill(value);
    }
    get(x, y) {
        return this.values[this.sizeX * y + x];
    }
    set(x, y, value) {
        this.values[this.sizeX * y + x] = value;
    }
}
let TerrainType;
(function(TerrainType) {
    TerrainType[TerrainType["GroundNormal"] = 0] = "GroundNormal";
    TerrainType[TerrainType["GroundGrass"] = 1] = "GroundGrass";
    TerrainType[TerrainType["GroundWater"] = 2] = "GroundWater";
    TerrainType[TerrainType["GroundMarble"] = 3] = "GroundMarble";
    TerrainType[TerrainType["GroundWood"] = 4] = "GroundWood";
    TerrainType[TerrainType["GroundWoodCreaky"] = 5] = "GroundWoodCreaky";
    TerrainType[TerrainType["GroundVault"] = 6] = "GroundVault";
    TerrainType[TerrainType[//  NSEW
    "Wall0000"] = 7] = "Wall0000";
    TerrainType[TerrainType["Wall0001"] = 8] = "Wall0001";
    TerrainType[TerrainType["Wall0010"] = 9] = "Wall0010";
    TerrainType[TerrainType["Wall0011"] = 10] = "Wall0011";
    TerrainType[TerrainType["Wall0100"] = 11] = "Wall0100";
    TerrainType[TerrainType["Wall0101"] = 12] = "Wall0101";
    TerrainType[TerrainType["Wall0110"] = 13] = "Wall0110";
    TerrainType[TerrainType["Wall0111"] = 14] = "Wall0111";
    TerrainType[TerrainType["Wall1000"] = 15] = "Wall1000";
    TerrainType[TerrainType["Wall1001"] = 16] = "Wall1001";
    TerrainType[TerrainType["Wall1010"] = 17] = "Wall1010";
    TerrainType[TerrainType["Wall1011"] = 18] = "Wall1011";
    TerrainType[TerrainType["Wall1100"] = 19] = "Wall1100";
    TerrainType[TerrainType["Wall1101"] = 20] = "Wall1101";
    TerrainType[TerrainType["Wall1110"] = 21] = "Wall1110";
    TerrainType[TerrainType["Wall1111"] = 22] = "Wall1111";
    TerrainType[TerrainType["OneWayWindowE"] = 23] = "OneWayWindowE";
    TerrainType[TerrainType["OneWayWindowW"] = 24] = "OneWayWindowW";
    TerrainType[TerrainType["OneWayWindowN"] = 25] = "OneWayWindowN";
    TerrainType[TerrainType["OneWayWindowS"] = 26] = "OneWayWindowS";
    TerrainType[TerrainType["PortcullisNS"] = 27] = "PortcullisNS";
    TerrainType[TerrainType["PortcullisEW"] = 28] = "PortcullisEW";
    TerrainType[TerrainType["DoorNS"] = 29] = "DoorNS";
    TerrainType[TerrainType["DoorEW"] = 30] = "DoorEW";
    TerrainType[TerrainType["GardenDoorNS"] = 31] = "GardenDoorNS";
    TerrainType[TerrainType["GardenDoorEW"] = 32] = "GardenDoorEW";
})(TerrainType || (TerrainType = {}));
class CellGrid {
    constructor(sizeX, sizeY){
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        const size = sizeX * sizeY;
        this.values = new Array(size);
        for(let i = 0; i < size; ++i)this.values[i] = this.emptyCell();
    }
    at(x, y) {
        if (x < 0 || x >= this.sizeX || y < 0 || y >= this.sizeY) return this.emptyCell();
        const i = this.sizeX * y + x;
        return this.values[i];
    }
    atVec(pos) {
        return this.at(pos[0], pos[1]);
    }
    index(x, y) {
        return this.sizeX * y + x;
    }
    indexVec(pos) {
        return this.index(pos[0], pos[1]);
    }
    emptyCell() {
        return {
            type: TerrainType.GroundGrass,
            moveCost: Infinity,
            blocksPlayerMove: false,
            blocksPlayerSight: false,
            blocksSight: false,
            blocksSound: false,
            hidesPlayer: false,
            lit: 0,
            litAnim: 0,
            litSrc: new Set(),
            seen: false,
            identified: false
        };
    }
}
let GuardStates;
(function(GuardStates) {
    GuardStates[GuardStates["Relaxed"] = 0] = "Relaxed";
    GuardStates[GuardStates["Angry"] = 1] = "Angry";
    GuardStates[GuardStates["Alerted"] = 2] = "Alerted";
    GuardStates[GuardStates["Chasing"] = 3] = "Chasing";
    GuardStates[GuardStates["Unconscious"] = 4] = "Unconscious";
})(GuardStates || (GuardStates = {}));
let ItemType;
(function(ItemType) {
    ItemType[ItemType["Chair"] = 0] = "Chair";
    ItemType[ItemType["Table"] = 1] = "Table";
    ItemType[ItemType["BedL"] = 2] = "BedL";
    ItemType[ItemType["BedR"] = 3] = "BedR";
    ItemType[ItemType["DrawersShort"] = 4] = "DrawersShort";
    ItemType[ItemType["DrawersTall"] = 5] = "DrawersTall";
    ItemType[ItemType["Bookshelf"] = 6] = "Bookshelf";
    ItemType[ItemType["Shelf"] = 7] = "Shelf";
    ItemType[ItemType["Stove"] = 8] = "Stove";
    ItemType[ItemType["Bush"] = 9] = "Bush";
    ItemType[ItemType["Coin"] = 10] = "Coin";
    ItemType[ItemType["Health"] = 11] = "Health";
    ItemType[ItemType["DoorNS"] = 12] = "DoorNS";
    ItemType[ItemType["DoorEW"] = 13] = "DoorEW";
    ItemType[ItemType["LockedDoorNS"] = 14] = "LockedDoorNS";
    ItemType[ItemType["LockedDoorEW"] = 15] = "LockedDoorEW";
    ItemType[ItemType["PortcullisNS"] = 16] = "PortcullisNS";
    ItemType[ItemType["PortcullisEW"] = 17] = "PortcullisEW";
    ItemType[ItemType["TorchUnlit"] = 18] = "TorchUnlit";
    ItemType[ItemType["TorchLit"] = 19] = "TorchLit";
    ItemType[ItemType["TorchCarry"] = 20] = "TorchCarry";
    ItemType[ItemType["PurseCarry"] = 21] = "PurseCarry";
    ItemType[ItemType["Key"] = 22] = "Key";
    ItemType[ItemType["KeyCarry"] = 23] = "KeyCarry";
})(ItemType || (ItemType = {}));
function guardMoveCostForItemType(itemType) {
    switch(itemType){
        case ItemType.Chair:
            return 32;
        case ItemType.Table:
            return 64;
        case ItemType.BedL:
            return 64;
        case ItemType.BedR:
            return 64;
        case ItemType.DrawersShort:
            return Infinity;
        case ItemType.DrawersTall:
            return Infinity;
        case ItemType.Bookshelf:
            return Infinity;
        case ItemType.Shelf:
            return Infinity;
        case ItemType.Stove:
            return Infinity;
        case ItemType.Bush:
            return 10;
        case ItemType.Coin:
            return 0;
        case ItemType.Health:
            return 0;
        case ItemType.DoorNS:
            return 0;
        case ItemType.DoorEW:
            return 0;
        case ItemType.LockedDoorNS:
            return 0;
        case ItemType.LockedDoorEW:
            return 0;
        case ItemType.PortcullisNS:
            return 0;
        case ItemType.PortcullisEW:
            return 0;
        case ItemType.TorchUnlit:
            return Infinity;
        case ItemType.TorchLit:
            return Infinity;
        case ItemType.TorchCarry:
            return 0;
        case ItemType.PurseCarry:
            return 0;
        case ItemType.Key:
            return 0;
        case ItemType.KeyCarry:
            return 0;
    }
}
const maxPlayerHealth = 5;
const maxPlayerTurnsUnderwater = 7;
class Player {
    animation = null;
    pickTarget = null;
    constructor(pos){
        this.pos = (0, _myMatrix.vec2).clone(pos);
        this.dir = (0, _myMatrix.vec2).fromValues(0, -1);
        this.health = maxPlayerHealth;
        this.loot = 0;
        this.noisy = false;
        this.hasVaultKey = false;
        this.damagedLastTurn = false;
        this.turnsRemainingUnderwater = maxPlayerTurnsUnderwater;
    }
    applyDamage(d) {
        this.health -= Math.min(d, this.health);
        this.damagedLastTurn = true;
    }
    hidden(map) {
        if (map.guards.find((guard)=>guard.mode == (0, _guard.GuardMode).ChaseVisibleTarget) !== undefined) return false;
        if (map.cells.atVec(this.pos).hidesPlayer) return true;
        let cellType = map.cells.atVec(this.pos).type;
        if (cellType == TerrainType.GroundWater && this.turnsRemainingUnderwater > 0) return true;
        return false;
    }
}
const portals = [
    {
        lx: -1,
        ly: -1,
        rx: -1,
        ry: 1,
        nx: -1,
        ny: 0
    },
    {
        lx: -1,
        ly: 1,
        rx: 1,
        ry: 1,
        nx: 0,
        ny: 1
    },
    {
        lx: 1,
        ly: 1,
        rx: 1,
        ry: -1,
        nx: 1,
        ny: 0
    },
    {
        lx: 1,
        ly: -1,
        rx: -1,
        ry: -1,
        nx: 0,
        ny: -1
    }
];
const lightPortals = [
    {
        lx: -1,
        ly: -1,
        rx: -1,
        ry: -1,
        nx: -1,
        ny: -1
    },
    {
        lx: -1,
        ly: -1,
        rx: -1,
        ry: 1,
        nx: -1,
        ny: 0
    },
    {
        lx: -1,
        ly: 1,
        rx: -1,
        ry: 1,
        nx: -1,
        ny: 1
    },
    {
        lx: -1,
        ly: 1,
        rx: 1,
        ry: 1,
        nx: 0,
        ny: 1
    },
    {
        lx: 1,
        ly: 1,
        rx: 1,
        ry: 1,
        nx: 1,
        ny: 1
    },
    {
        lx: 1,
        ly: 1,
        rx: 1,
        ry: -1,
        nx: 1,
        ny: 0
    },
    {
        lx: 1,
        ly: -1,
        rx: 1,
        ry: -1,
        nx: 1,
        ny: -1
    },
    {
        lx: 1,
        ly: -1,
        rx: -1,
        ry: -1,
        nx: 0,
        ny: -1
    }
];
function aRightOfB(ax, ay, bx, by) {
    return ax * by > ay * bx;
}
const adjacentMoves = [
    {
        dx: 1,
        dy: 0,
        cost: 2
    },
    {
        dx: -1,
        dy: 0,
        cost: 2
    },
    {
        dx: 0,
        dy: 1,
        cost: 2
    },
    {
        dx: 0,
        dy: -1,
        cost: 2
    },
    {
        dx: -1,
        dy: -1,
        cost: 3
    },
    {
        dx: 1,
        dy: -1,
        cost: 3
    },
    {
        dx: -1,
        dy: 1,
        cost: 3
    },
    {
        dx: 1,
        dy: 1,
        cost: 3
    }
];
class GameMap {
    constructor(cells){
        this.cells = cells;
        this.patrolRegions = [];
        this.patrolRoutes = [];
        this.items = [];
        this.guards = [];
        this.playerStartPos = (0, _myMatrix.vec2).create();
        this.lightCount = 0;
        this.numPreRevealedCells = 0;
        this.adjacencies = [];
    }
    collectLootAt(pos) {
        let items = [];
        this.items = this.items.filter((item)=>{
            if (!item.pos.equals(pos)) return true;
            else if (item.type === ItemType.Coin || item.type === ItemType.Health) {
                items.push(item);
                return false;
            } else return true;
        });
        return items;
    }
    collectAllLoot() {
        let gold = 0;
        this.items = this.items.filter((item)=>{
            if (item.type != ItemType.Coin) return true;
            else {
                ++gold;
                return false;
            }
        });
        for (let g of this.guards)if (g.hasPurse) {
            ++gold;
            g.hasPurse = false;
        }
        return gold;
    }
    identifyAdjacentCells(pos) {
        const xMin = Math.max(pos[0] - 1, 0);
        const yMin = Math.max(pos[1] - 1, 0);
        const xMax = Math.min(pos[0] + 2, this.cells.sizeX);
        const yMax = Math.min(pos[1] + 2, this.cells.sizeY);
        for(let x = xMin; x < xMax; ++x)for(let y = yMin; y < yMax; ++y)this.cells.at(x, y).identified = true;
    }
    allSeen() {
        for (const cell of this.cells.values){
            if (!cell.seen) return false;
        }
        return true;
    }
    numCells() {
        return this.cells.values.length;
    }
    numCellsSeen() {
        let numSeen = 0;
        for (const cell of this.cells.values)if (cell.seen) ++numSeen;
        return numSeen;
    }
    fractionRevealed() {
        return (this.numCellsSeen() - this.numPreRevealedCells) / (this.numCells() - this.numPreRevealedCells);
    }
    markAllSeen() {
        for (const cell of this.cells.values){
            cell.seen = true;
            cell.identified = true;
        }
    }
    markAllUnseen() {
        for (const cell of this.cells.values){
            cell.seen = false;
            cell.identified = false;
        }
    }
    recomputeVisibility(posViewer) {
        this.recomputeVisibilityFromPos(posViewer);
        const pos = (0, _myMatrix.vec2).create();
        for (const dir of cardinalDirections)if (this.playerCanSeeInDirection(posViewer, dir)) {
            (0, _myMatrix.vec2).add(pos, posViewer, dir);
            this.recomputeVisibilityFromPos(pos);
        }
    }
    recomputeVisibilityFromPos(posViewer) {
        for (const portal of portals)this.computeVisibility(posViewer[0], posViewer[1], posViewer[0], posViewer[1], portal.lx, portal.ly, portal.rx, portal.ry);
    }
    playerCanSeeInDirection(posViewer, dir) {
        const posTarget = (0, _myMatrix.vec2).create();
        (0, _myMatrix.vec2).add(posTarget, posViewer, dir);
        if (posTarget[0] < 0 || posTarget[1] < 0 || posTarget[0] >= this.cells.sizeX || posTarget[1] >= this.cells.sizeY) return false;
        const cell = this.cells.at(posTarget[0], posTarget[1]);
        if (cell.blocksPlayerSight) return false;
        return true;
    }
    computeVisibility(// Viewer map coordinates:
    viewerX, viewerY, // Target cell map coordinates:
    targetX, targetY, // Left edge of current view frustum (relative to viewer):
    ldx, ldy, // Right edge of current view frustum (relative to viewer):
    rdx, rdy) {
        // End recursion if the target cell is out of bounds.
        if (targetX < 0 || targetY < 0 || targetX >= this.cells.sizeX || targetY >= this.cells.sizeY) return;
        // End recursion if the target square is too far away.
        let dx = targetX - viewerX;
        let dy = targetY - viewerY;
        if (dx ** 2 + dy ** 2 > 400) return;
        dx *= 2;
        dy *= 2;
        // This square is visible.
        const cell = this.cells.at(targetX, targetY);
        cell.seen = true;
        // End recursion if the target square occludes the view.
        if (cell.blocksPlayerSight) return;
        // Mark diagonally-adjacent squares as visible if their corners are visible
        for(let x = 0; x < 2; ++x)for(let y = 0; y < 2; ++y){
            let nx = targetX + 2 * x - 1;
            let ny = targetY + 2 * y - 1;
            let cdx = dx + 2 * x - 1;
            let cdy = dy + 2 * y - 1;
            if (nx >= 0 && ny >= 0 && nx < this.cells.sizeX && ny < this.cells.sizeY && !aRightOfB(ldx, ldy, cdx, cdy) && !aRightOfB(cdx, cdy, rdx, rdy)) this.cells.at(nx, ny).seen = true;
        }
        // Clip portals to adjacent squares and recurse through the visible portions
        for (const portal of portals){
            // Relative positions of the portal's left and right endpoints:
            const pldx = dx + portal.lx;
            const pldy = dy + portal.ly;
            const prdx = dx + portal.rx;
            const prdy = dy + portal.ry;
            // Clip portal against current view frustum:
            const [cldx, cldy] = aRightOfB(ldx, ldy, pldx, pldy) ? [
                ldx,
                ldy
            ] : [
                pldx,
                pldy
            ];
            const [crdx, crdy] = aRightOfB(rdx, rdy, prdx, prdy) ? [
                prdx,
                prdy
            ] : [
                rdx,
                rdy
            ];
            // If we can see through the clipped portal, recurse through it.
            if (aRightOfB(crdx, crdy, cldx, cldy)) this.computeVisibility(viewerX, viewerY, targetX + portal.nx, targetY + portal.ny, cldx, cldy, crdx, crdy);
        }
    }
    computeLighting(playerCell = null) {
        //TODO: These light source calculation depend on the number of lights (either on or off) 
        //not changing and not changing their order during play to avoid ugly flickering when lights
        //switch on/off
        const occupied = new Set();
        if (playerCell !== null && playerCell.type >= TerrainType.Wall0000) occupied.add(playerCell);
        for (let g of this.guards){
            const gCell = this.cells.at(g.pos[0], g.pos[1]);
            if (gCell.type >= TerrainType.Wall0000) occupied.add(gCell);
        }
        for (const cell of this.cells.values){
            cell.lit = 0;
            cell.litSrc.clear();
        }
        let lightId = 0;
        for (const item of this.items){
            if (item.type === ItemType.TorchLit || item.type === ItemType.Stove) {
                this.castLight(item.pos, 45, lightId, occupied);
                lightId++;
            }
            if (item.type == ItemType.TorchUnlit) lightId++;
        }
        for (const guard of this.guards)if (guard.hasTorch) {
            if (guard.mode !== (0, _guard.GuardMode).Unconscious) this.castLight(guard.pos, 15, lightId, occupied);
            lightId++;
        }
        this.lightCount = lightId;
    }
    castLight(posLight, radiusSquared, lightId, occupied) {
        this.cells.at(posLight[0], posLight[1]).lit = 1;
        for (const portal of lightPortals)this.castLightRecursive(posLight[0], posLight[1], posLight[0] + portal.nx, posLight[1] + portal.ny, portal.lx, portal.ly, portal.rx, portal.ry, radiusSquared, lightId, occupied);
    }
    castLightRecursive(// Light source map coordinates:
    lightX, lightY, // Target cell map coordinates:
    targetX, targetY, // Left edge of current view frustum (relative to viewer):
    ldx, ldy, // Right edge of current view frustum (relative to viewer):
    rdx, rdy, // Max radius of light source
    radiusSquared, lightId, occupied) {
        // End recursion if the target cell is out of bounds.
        if (targetX < 0 || targetY < 0 || targetX >= this.cells.sizeX || targetY >= this.cells.sizeY) return;
        // End recursion if the target square is too far away.
        let dx = targetX - lightX;
        let dy = targetY - lightY;
        if (dx ** 2 + dy ** 2 > radiusSquared) return;
        // Grab the cell
        const cell = this.cells.at(targetX, targetY);
        // The cell is lit
        if (!cell.litSrc.has(lightId)) {
            const dist2 = dx ** 2 + dy ** 2;
            cell.lit += 1 / (4 * dist2 + 1);
            cell.lit = Math.min(cell.lit, 1);
            cell.litSrc.add(lightId);
        }
        // A solid target square blocks all further light through it.
        if (cell.blocksSight && !occupied.has(cell)) return;
        // If the portal is zero-width, end here.
        if (!aRightOfB(rdx, rdy, ldx, ldy)) return;
        dx *= 2;
        dy *= 2;
        // Clip portals to adjacent squares and recurse through the visible portions
        for (const portal of lightPortals){
            // Relative positions of the portal's left and right endpoints:
            const pldx = dx + portal.lx;
            const pldy = dy + portal.ly;
            const prdx = dx + portal.rx;
            const prdy = dy + portal.ry;
            // Clip portal against current view frustum:
            const [cldx, cldy] = aRightOfB(ldx, ldy, pldx, pldy) ? [
                ldx,
                ldy
            ] : [
                pldx,
                pldy
            ];
            const [crdx, crdy] = aRightOfB(rdx, rdy, prdx, prdy) ? [
                prdx,
                prdy
            ] : [
                rdx,
                rdy
            ];
            // If we can see through the clipped portal, recurse through it.
            if (!aRightOfB(cldx, cldy, crdx, crdy)) this.castLightRecursive(lightX, lightY, targetX + portal.nx, targetY + portal.ny, cldx, cldy, crdx, crdy, radiusSquared, lightId, occupied);
        }
    }
    allLootCollected() {
        return this.items.find((item)=>item.type == ItemType.Coin) === undefined;
    }
    isGuardAt(x, y) {
        return this.guards.find((guard)=>guard.hasMoved && guard.pos.equalsValues(x, y)) != undefined;
    }
    isGuardAtVec(pos) {
        return this.guards.find((guard)=>guard.hasMoved && guard.pos.equals(pos)) != undefined;
    }
    guardMoveCost(posOld, posNew) {
        const cost = this.cells.atVec(posNew).moveCost;
        if (cost === Infinity) return cost;
        // Guards are not allowed to move diagonally around corners.
        // TODO: I think there may be a better way to do this. The 64 here is the current movement
        // cost for water; trying to allow diagonal movement past chairs and tables and such, but
        // not around the corner of a water pool.
        if (posOld[0] != posNew[0] && posOld[1] != posNew[1] && (this.cells.at(posOld[0], posNew[1]).moveCost >= 64 || this.cells.at(posNew[0], posOld[1]).moveCost >= 64)) return Infinity;
        return cost;
    }
    posNextBest(distanceField, posFrom) {
        let costBest = Infinity;
        let posBest = (0, _myMatrix.vec2).clone(posFrom);
        const posMin = (0, _myMatrix.vec2).fromValues(Math.max(0, posFrom[0] - 1), Math.max(0, posFrom[1] - 1));
        const posMax = (0, _myMatrix.vec2).fromValues(Math.min(this.cells.sizeX, posFrom[0] + 2), Math.min(this.cells.sizeY, posFrom[1] + 2));
        for(let x = posMin[0]; x < posMax[0]; ++x)for(let y = posMin[1]; y < posMax[1]; ++y){
            const cost = distanceField.get(x, y);
            if (cost == Infinity) continue;
            let pos = (0, _myMatrix.vec2).fromValues(x, y);
            if (this.guardMoveCost(posFrom, pos) == Infinity) continue;
            if (this.isGuardAtVec(pos)) continue;
            if (cost < costBest) {
                costBest = cost;
                posBest = pos;
            }
        }
        return posBest;
    }
    nextPositions(distanceField, posFrom) {
        const posMin = (0, _myMatrix.vec2).fromValues(Math.max(0, posFrom[0] - 1), Math.max(0, posFrom[1] - 1));
        const posMax = (0, _myMatrix.vec2).fromValues(Math.min(this.cells.sizeX, posFrom[0] + 2), Math.min(this.cells.sizeY, posFrom[1] + 2));
        const positionsAndCosts = [];
        for(let x = posMin[0]; x < posMax[0]; ++x)for(let y = posMin[1]; y < posMax[1]; ++y){
            const cost = distanceField.get(x, y);
            if (cost === Infinity) continue;
            let pos = (0, _myMatrix.vec2).fromValues(x, y);
            if (this.guardMoveCost(posFrom, pos) === Infinity) continue;
            const moveCost = Math.abs(posFrom[0] - pos[0]) + Math.abs(posFrom[1] - pos[1]);
            positionsAndCosts.push([
                cost,
                moveCost,
                pos
            ]);
        }
        positionsAndCosts.sort((a, b)=>a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]);
        return positionsAndCosts.map((a)=>a[2]);
    }
    patrolPathIndexForResume(patrolPositions, patrolIndexCur, pos) {
        const distanceToPos = this.computeDistancesToPosition(pos);
        let patrolIndexBest = patrolIndexCur;
        // Advance along the patrol path until it's headed the same direction the
        // distance field is.
        for(let dPatrolIndex = 0; dPatrolIndex < patrolPositions.length; ++dPatrolIndex){
            const posPatrol = patrolPositions[patrolIndexBest];
            const posGuardPrev = this.posNextBest(distanceToPos, posPatrol);
            const posPatrolPrev = patrolPositions[(patrolIndexBest + patrolPositions.length - 1) % patrolPositions.length];
            const dirGuard = (0, _myMatrix.vec2).create();
            (0, _myMatrix.vec2).subtract(dirGuard, posPatrol, posGuardPrev);
            const dirPatrol = (0, _myMatrix.vec2).create();
            (0, _myMatrix.vec2).subtract(dirPatrol, posPatrol, posPatrolPrev);
            if ((0, _myMatrix.vec2).dot(dirGuard, dirPatrol) > 0) break;
            patrolIndexBest = (patrolIndexBest + 1) % patrolPositions.length;
        }
        return patrolIndexBest;
    }
    computeDistancesToPosition(posGoal) {
        console.assert(posGoal[0] >= 0);
        console.assert(posGoal[1] >= 0);
        console.assert(posGoal[0] < this.cells.sizeX);
        console.assert(posGoal[1] < this.cells.sizeY);
        return this.computeDistanceField([
            {
                priority: 0,
                pos: (0, _myMatrix.vec2).clone(posGoal)
            }
        ]);
    }
    computeDistancesToPositionSubrect(posGoal, xMin, yMin, xMax, yMax) {
        console.assert(posGoal[0] >= xMin);
        console.assert(posGoal[1] >= yMin);
        console.assert(posGoal[0] < xMax);
        console.assert(posGoal[1] < yMax);
        return this.computeDistanceFieldSubrect([
            {
                priority: 0,
                pos: (0, _myMatrix.vec2).clone(posGoal)
            }
        ], xMin, yMin, xMax, yMax);
    }
    computeDistancesToAdjacentToPosition(posGoal) {
        const goal = [];
        for (const dir of cardinalDirections){
            const pos = (0, _myMatrix.vec2).clone(posGoal).add(dir);
            if (pos[0] < 0 || pos[1] < 0 || pos[0] >= this.cells.sizeX || pos[1] >= this.cells.sizeY) continue;
            const cell = this.cells.atVec(pos);
            if (cell.moveCost !== Infinity) goal.push({
                priority: cell.moveCost,
                pos: pos
            });
        }
        return this.computeDistanceField(goal);
    }
    computeDistanceField(initialDistances) {
        let sizeX = this.cells.sizeX;
        let sizeY = this.cells.sizeY;
        const toVisit = [];
        const distField = new Float64Grid(sizeX, sizeY, Infinity);
        for (const distPos of initialDistances)priorityQueuePush(toVisit, distPos);
        while(toVisit.length > 0){
            const distPos = priorityQueuePop(toVisit);
            if (distPos.priority >= distField.get(distPos.pos[0], distPos.pos[1])) continue;
            distField.set(distPos.pos[0], distPos.pos[1], distPos.priority);
            for (const adjacentMove of adjacentMoves){
                const posNew = (0, _myMatrix.vec2).fromValues(distPos.pos[0] + adjacentMove.dx, distPos.pos[1] + adjacentMove.dy);
                if (posNew[0] < 0 || posNew[1] < 0 || posNew[0] >= sizeX || posNew[1] >= sizeY) continue;
                const moveCost = this.guardMoveCost(distPos.pos, posNew);
                if (moveCost == Infinity) continue;
                const distNew = distPos.priority + moveCost + adjacentMove.cost;
                if (distNew < distField.get(posNew[0], posNew[1])) priorityQueuePush(toVisit, {
                    priority: distNew,
                    pos: posNew
                });
            }
        }
        return distField;
    }
    computeDistanceFieldSubrect(initialDistances, xMin, yMin, xMax, yMax) {
        console.assert(xMin >= 0);
        console.assert(yMin >= 0);
        console.assert(xMax <= this.cells.sizeX);
        console.assert(yMax <= this.cells.sizeY);
        const sizeX = xMax - xMin;
        const sizeY = yMax - yMin;
        const toVisit = [];
        const distField = new Float64Grid(sizeX, sizeY, Infinity);
        for (const distPos of initialDistances)priorityQueuePush(toVisit, {
            priority: distPos.priority,
            pos: [
                distPos.pos[0] - xMin,
                distPos.pos[1] - yMin
            ]
        });
        while(toVisit.length > 0){
            const distPos = priorityQueuePop(toVisit);
            if (distPos.priority >= distField.get(distPos.pos[0], distPos.pos[1])) continue;
            distField.set(distPos.pos[0], distPos.pos[1], distPos.priority);
            const posOldMap = (0, _myMatrix.vec2).fromValues(distPos.pos[0] + xMin, distPos.pos[1] + yMin);
            for (const adjacentMove of adjacentMoves){
                const posNew = (0, _myMatrix.vec2).fromValues(distPos.pos[0] + adjacentMove.dx, distPos.pos[1] + adjacentMove.dy);
                if (posNew[0] < 0 || posNew[1] < 0 || posNew[0] >= sizeX || posNew[1] >= sizeY) continue;
                const posNewMap = (0, _myMatrix.vec2).fromValues(posNew[0] + xMin, posNew[1] + yMin);
                const moveCost = this.guardMoveCost(posOldMap, posNewMap);
                if (moveCost == Infinity) continue;
                const distNew = distPos.priority + moveCost + adjacentMove.cost;
                if (distNew < distField.get(posNew[0], posNew[1])) priorityQueuePush(toVisit, {
                    priority: distNew,
                    pos: posNew
                });
            }
        }
        return distField;
    }
    guardsInEarshot(soundPos, radius) {
        const coords = this.coordsInEarshot(soundPos, radius);
        return this.guards.filter((guard)=>coords.has(this.cells.sizeX * guard.pos[1] + guard.pos[0]));
    }
    coordsInEarshot(soundPos, costCutoff) {
        let sizeX = this.cells.sizeX;
        let sizeY = this.cells.sizeY;
        const toVisit = [];
        const distField = new Float64Grid(sizeX, sizeY, Infinity);
        const coordsVisited = new Set();
        priorityQueuePush(toVisit, {
            priority: 0,
            pos: soundPos
        });
        while(toVisit.length > 0){
            const distPos = priorityQueuePop(toVisit);
            if (distPos.priority >= distField.get(distPos.pos[0], distPos.pos[1])) continue;
            distField.set(distPos.pos[0], distPos.pos[1], distPos.priority);
            coordsVisited.add(sizeX * distPos.pos[1] + distPos.pos[0]);
            for (const adjacentMove of adjacentMoves){
                const posNew = (0, _myMatrix.vec2).fromValues(distPos.pos[0] + adjacentMove.dx, distPos.pos[1] + adjacentMove.dy);
                if (posNew[0] < 0 || posNew[1] < 0 || posNew[0] >= sizeX || posNew[1] >= sizeY) continue;
                const costNew = distPos.priority + adjacentMove.cost;
                if (costNew > costCutoff) continue;
                if (this.cells.at(posNew[0], posNew[1]).blocksSound) continue;
                if (costNew >= distField.get(posNew[0], posNew[1])) continue;
                priorityQueuePush(toVisit, {
                    priority: costNew,
                    pos: posNew
                });
            }
        }
        return coordsVisited;
    }
}
function isWindowTerrainType(terrainType) {
    return terrainType >= TerrainType.OneWayWindowE && terrainType <= TerrainType.OneWayWindowS;
}
function isDoorItemType(itemType) {
    return itemType >= ItemType.DoorNS && itemType <= ItemType.PortcullisEW;
}
function priorityQueuePop(q) {
    const x = q[0];
    q[0] = q[q.length - 1]; // q.at(-1);
    q.pop();
    let i = 0;
    const c = q.length;
    while(true){
        let iChild = i;
        const iChild0 = 2 * i + 1;
        if (iChild0 < c && q[iChild0].priority < q[iChild].priority) iChild = iChild0;
        const iChild1 = iChild0 + 1;
        if (iChild1 < c && q[iChild1].priority < q[iChild].priority) iChild = iChild1;
        if (iChild == i) break;
        [q[i], q[iChild]] = [
            q[iChild],
            q[i]
        ];
        i = iChild;
    }
    return x;
}
function priorityQueuePush(q, x) {
    q.push(x);
    let i = q.length - 1;
    while(i > 0){
        const iParent = Math.floor((i - 1) / 2);
        if (q[i].priority >= q[iParent].priority) break;
        [q[i], q[iParent]] = [
            q[iParent],
            q[i]
        ];
        i = iParent;
    }
}

},{"./guard":"bP2Su","./my-matrix":"21x0k","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"bP2Su":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "Guard", ()=>Guard);
parcelHelpers.export(exports, "GuardMode", ()=>GuardMode);
parcelHelpers.export(exports, "chooseGuardMoves", ()=>chooseGuardMoves);
parcelHelpers.export(exports, "guardActAll", ()=>guardActAll);
parcelHelpers.export(exports, "lineOfSight", ()=>lineOfSight);
parcelHelpers.export(exports, "isRelaxedGuardMode", ()=>isRelaxedGuardMode);
var _gameMap = require("./game-map");
var _myMatrix = require("./my-matrix");
var _random = require("./random");
var _popups = require("./popups");
var _animation = require("./animation");
let GuardMode;
(function(GuardMode) {
    GuardMode[GuardMode["Patrol"] = 0] = "Patrol";
    GuardMode[GuardMode["Look"] = 1] = "Look";
    GuardMode[GuardMode["Listen"] = 2] = "Listen";
    GuardMode[GuardMode["ChaseVisibleTarget"] = 3] = "ChaseVisibleTarget";
    GuardMode[GuardMode["MoveToLastSighting"] = 4] = "MoveToLastSighting";
    GuardMode[GuardMode["MoveToLastSound"] = 5] = "MoveToLastSound";
    GuardMode[GuardMode["MoveToGuardShout"] = 6] = "MoveToGuardShout";
    GuardMode[GuardMode["MoveToDownedGuard"] = 7] = "MoveToDownedGuard";
    GuardMode[GuardMode["WakeGuard"] = 8] = "WakeGuard";
    GuardMode[GuardMode["MoveToTorch"] = 9] = "MoveToTorch";
    GuardMode[GuardMode["LightTorch"] = 10] = "LightTorch";
    GuardMode[GuardMode["Unconscious"] = 11] = "Unconscious";
})(GuardMode || (GuardMode = {}));
class Guard {
    dir = (0, _myMatrix.vec2).fromValues(1, 0);
    mode = GuardMode.Patrol;
    modePrev = GuardMode.Patrol;
    angry = false;
    hasTorch = false;
    hasPurse = false;
    hasVaultKey = false;
    torchAnimation = null;
    speaking = false;
    hasMoved = false;
    heardThief = false;
    heardThiefClosest = false;
    hearingGuard = false;
    heardGuard = false;
    animation = null;
    // Desired moves, in order
    goals = [];
    modeTimeout = 0;
    constructor(patrolPath, pathIndexStart){
        const posStart = patrolPath[pathIndexStart];
        this.pos = (0, _myMatrix.vec2).clone(posStart);
        this.heardGuardPos = (0, _myMatrix.vec2).clone(posStart);
        this.goal = (0, _myMatrix.vec2).clone(posStart);
        this.patrolPath = patrolPath;
        this.patrolPathIndex = pathIndexStart;
        this.updateDirInitial();
    }
    overheadIcon() {
        if (this.mode === GuardMode.Unconscious) return (0, _gameMap.GuardStates).Unconscious;
        else if (this.mode === GuardMode.ChaseVisibleTarget) return (0, _gameMap.GuardStates).Chasing;
        else if (!isRelaxedGuardMode(this.mode)) return (0, _gameMap.GuardStates).Alerted;
        else if (this.angry) return (0, _gameMap.GuardStates).Angry;
        else return (0, _gameMap.GuardStates).Relaxed;
    }
    posAnimated() {
        let offset = this.animation?.offset ?? (0, _myMatrix.vec2).create();
        const pos = (0, _myMatrix.vec2).create();
        (0, _myMatrix.vec2).add(pos, this.pos, offset);
        return pos;
    }
    allowsMoveOntoFrom(posFrom) {
        if (this.goals.length <= 0) return true;
        const posNextPlanned = this.goals[0];
        // If the guard is planning on standing still, disallow movement onto them.
        if (posNextPlanned.equals(this.pos)) return false;
        // If the guard is planning on moving to posFrom, disallow it.
        if (posNextPlanned.equals(posFrom)) return false;
        // If the guard is planning on moving to the point between posFrom
        // and where they are, disallow it.
        const midX = Math.floor((this.pos[0] + posFrom[0]) / 2);
        const midY = Math.floor((this.pos[1] + posFrom[1]) / 2);
        if (posNextPlanned[0] === midX && posNextPlanned[1] === midY) return false;
        return true;
    }
    moving() {
        if (this.goals.length <= 0) return false;
        const posNextPlanned = this.goals[0];
        return !this.pos.equals(posNextPlanned);
    }
    chooseMoves(state) {
        switch(this.mode){
            case GuardMode.Patrol:
                this.goals = this.choosePatrolStep(state);
                break;
            case GuardMode.Look:
            case GuardMode.Listen:
            case GuardMode.Unconscious:
                this.goals = this.chooseMoveTowardPosition(this.pos, state.gameMap);
                break;
            case GuardMode.ChaseVisibleTarget:
            case GuardMode.MoveToLastSighting:
            case GuardMode.MoveToGuardShout:
            case GuardMode.MoveToLastSound:
                this.goals = this.chooseMoveTowardPosition(this.goal, state.gameMap);
                break;
            case GuardMode.MoveToDownedGuard:
            case GuardMode.WakeGuard:
            case GuardMode.MoveToTorch:
            case GuardMode.LightTorch:
                this.goals = this.chooseMoveTowardAdjacentToPosition(this.goal, state.gameMap);
                break;
        }
    }
    bestAvailableMove(moves, gameMap, player) {
        let bumpedPlayer = false;
        for (const pos of moves){
            if (gameMap.guardMoveCost(this.pos, pos) == Infinity) continue;
            if (player.pos.equals(pos)) {
                bumpedPlayer = true;
                continue;
            }
            if (gameMap.isGuardAtVec(pos)) continue;
            return [
                pos,
                bumpedPlayer
            ];
        }
        // Should never hit this point; our current position should always be in available moves
        return [
            this.pos,
            bumpedPlayer
        ];
    }
    act(map, popups, player, levelStats, shouts) {
        const posPrev = (0, _myMatrix.vec2).clone(this.pos);
        // Immediately upgrade to chasing if we see the player while investigating;
        // this lets us start moving toward the player on this turn rather than
        // wait for next turn.
        if (this.mode !== GuardMode.Unconscious && !isRelaxedGuardMode(this.mode)) {
            // If guard expects to move, ignore squares in line with their current position
            const offset = this.moving() ? 1 : 0;
            if (this.seesActor(map, player, offset)) this.mode = GuardMode.ChaseVisibleTarget;
        }
        // Pass time in the current mode
        switch(this.mode){
            case GuardMode.Patrol:
                this.makeBestAvailableMove(map, player);
                if (!this.pos.equals(this.patrolPath[this.patrolPathIndex])) this.enterPatrolMode(map);
                else if (this.pos.equals(posPrev)) {
                    const posLookAt = this.tryGetPosLookAt(map);
                    if (posLookAt !== undefined) updateDir(this.dir, this.pos, posLookAt);
                }
                break;
            case GuardMode.Look:
            case GuardMode.Listen:
                this.makeBestAvailableMove(map, player);
                this.modeTimeout -= 1;
                if (this.modeTimeout <= 0) this.enterPatrolMode(map);
                break;
            case GuardMode.ChaseVisibleTarget:
                (0, _myMatrix.vec2).copy(this.goal, player.pos);
                if (this.adjacentTo(player.pos) && !this.pos.equals(player.pos)) {
                    updateDir(this.dir, this.pos, this.goal);
                    if (this.modePrev === GuardMode.ChaseVisibleTarget) {
                        if (!player.damagedLastTurn) {
                            popups.add((0, _popups.PopupType).Damage, ()=>this.posAnimated());
                            this.speaking = true;
                        }
                        const startend = (0, _myMatrix.vec2).create();
                        const middle = (0, _myMatrix.vec2).create();
                        (0, _myMatrix.vec2).subtract(middle, player.pos, this.pos);
                        (0, _myMatrix.vec2).scale(middle, middle, 0.5);
                        this.animation = new (0, _animation.SpriteAnimation)([
                            {
                                pt0: startend,
                                pt1: middle,
                                duration: 0.1,
                                fn: (0, _animation.tween).easeInQuad
                            },
                            {
                                pt0: middle,
                                pt1: startend,
                                duration: 0.1,
                                fn: (0, _animation.tween).easeOutQuad
                            }
                        ], []);
                        player.applyDamage(1);
                        ++levelStats.damageTaken;
                    }
                } else {
                    this.goals = this.chooseMoveTowardPosition(this.goal, map);
                    this.makeBestAvailableMove(map, player);
                }
                break;
            case GuardMode.MoveToLastSighting:
            case GuardMode.MoveToLastSound:
            case GuardMode.MoveToGuardShout:
                this.makeBestAvailableMove(map, player);
                if (this.pos.equals(posPrev)) {
                    updateDir(this.dir, this.pos, this.goal);
                    this.modeTimeout -= 1;
                }
                if (this.modeTimeout <= 0) this.enterPatrolMode(map);
                break;
            case GuardMode.MoveToDownedGuard:
                this.makeBestAvailableMove(map, player);
                if (this.cardinallyAdjacentTo(this.goal)) {
                    if (map.guards.find((g)=>g.pos.equals(this.goal) && g.mode === GuardMode.Unconscious)) {
                        this.mode = GuardMode.WakeGuard;
                        this.modeTimeout = 3;
                    } else {
                        this.modeTimeout = 0;
                        this.enterPatrolMode(map);
                    }
                } else if (this.pos.equals(posPrev)) {
                    this.modeTimeout -= 1;
                    if (this.modeTimeout <= 0) this.enterPatrolMode(map);
                }
                break;
            case GuardMode.WakeGuard:
                this.makeBestAvailableMove(map, player);
                if (this.pos.equals(posPrev)) updateDir(this.dir, this.pos, this.goal);
                --this.modeTimeout;
                const g = map.guards.find((g)=>g.pos.equals(this.goal) && g.mode === GuardMode.Unconscious);
                if (g !== undefined) {
                    if (this.modeTimeout <= 0) {
                        g.modeTimeout = 0;
                        this.enterPatrolMode(map);
                    }
                } else {
                    this.modeTimeout = 0;
                    this.enterPatrolMode(map);
                }
                break;
            case GuardMode.MoveToTorch:
                this.makeBestAvailableMove(map, player);
                if (map.items.some((item)=>item.pos.equals(this.goal) && item.type === (0, _gameMap.ItemType).TorchLit)) this.enterPatrolMode(map);
                else {
                    if (this.cardinallyAdjacentTo(this.goal)) {
                        this.mode = GuardMode.LightTorch;
                        this.modeTimeout = 5;
                    } else if (!this.pos.equals(posPrev)) this.modeTimeout = 3;
                    else {
                        this.modeTimeout -= 1;
                        if (this.modeTimeout <= 0) this.enterPatrolMode(map);
                    }
                }
                break;
            case GuardMode.LightTorch:
                this.makeBestAvailableMove(map, player);
                --this.modeTimeout;
                updateDir(this.dir, this.pos, this.goal);
                if (this.modeTimeout <= 0) {
                    relightTorchAt(map, this.goal, player);
                    this.enterPatrolMode(map);
                }
                break;
            case GuardMode.Unconscious:
                // this.modeTimeout -= 1;
                if (this.modeTimeout === 5) {
                    const popup = (0, _popups.PopupType).GuardStirring;
                    popups.add(popup, ()=>this.posAnimated());
                    this.speaking = true;
                } else if (this.modeTimeout <= 0) {
                    this.enterPatrolMode(map);
                    this.modeTimeout = 0;
                    this.angry = true;
                    shouts.push({
                        pos_shouter: this.pos,
                        pos_target: this.pos,
                        target: this
                    });
                    popups.add((0, _popups.PopupType).GuardAwakesWarning, ()=>this.posAnimated());
                    this.speaking = true;
                }
                break;
        }
    }
    postActSense(map, popups, player, levelStats, shouts) {
        if (this.mode !== GuardMode.Unconscious) {
            // See the thief, or lose sight of the thief
            if (this.seesActor(map, player)) {
                if (isRelaxedGuardMode(this.mode) && !this.adjacentTo(player.pos)) {
                    this.mode = GuardMode.Look;
                    this.modeTimeout = 2 + (0, _random.randomInRange)(4);
                } else this.mode = GuardMode.ChaseVisibleTarget;
            } else if (this.mode === GuardMode.ChaseVisibleTarget && this.modePrev === GuardMode.ChaseVisibleTarget) {
                this.mode = GuardMode.MoveToLastSighting;
                this.modeTimeout = 3;
            }
            // Hear the thief
            if (this.heardThief && this.mode !== GuardMode.ChaseVisibleTarget) {
                if (this.adjacentTo(player.pos)) this.mode = GuardMode.ChaseVisibleTarget;
                else if (isRelaxedGuardMode(this.mode) && !this.heardThiefClosest) {
                    this.mode = GuardMode.Listen;
                    this.modeTimeout = 2 + (0, _random.randomInRange)(4);
                } else if (this.mode !== GuardMode.MoveToDownedGuard) {
                    this.mode = GuardMode.MoveToLastSound;
                    this.modeTimeout = 2 + (0, _random.randomInRange)(4);
                    (0, _myMatrix.vec2).copy(this.goal, player.pos);
                }
            }
            // Hear another guard shouting
            if (this.heardGuard && this.mode !== GuardMode.Look && this.mode !== GuardMode.ChaseVisibleTarget && this.mode !== GuardMode.MoveToLastSighting && this.mode !== GuardMode.MoveToLastSound && this.mode !== GuardMode.MoveToDownedGuard && this.mode !== GuardMode.WakeGuard) {
                this.mode = GuardMode.MoveToGuardShout;
                this.modeTimeout = 2 + (0, _random.randomInRange)(4);
                (0, _myMatrix.vec2).copy(this.goal, this.heardGuardPos);
            }
            // If we see a downed guard, move to revive him.
            if (this.mode !== GuardMode.ChaseVisibleTarget && this.mode !== GuardMode.MoveToDownedGuard && this.mode !== GuardMode.WakeGuard) for (let guard of map.guards){
                if (guard === this) continue;
                if (guard.mode !== GuardMode.Unconscious) continue;
                if (!this.seesActor(map, guard)) continue;
                (0, _myMatrix.vec2).copy(this.goal, guard.pos);
                this.mode = GuardMode.MoveToDownedGuard;
                this.angry = true;
                this.modeTimeout = 3;
                shouts.push({
                    pos_shouter: this.pos,
                    pos_target: guard.pos,
                    target: guard
                });
                break;
            }
            // If we see an extinguished torch, move to light it.
            if (this.mode === GuardMode.Patrol && (this.angry || this.hasTorch)) {
                const torch = torchNeedingRelighting(map, this.pos);
                if (torch !== undefined) {
                    (0, _myMatrix.vec2).copy(this.goal, torch.pos);
                    if (this.cardinallyAdjacentTo(this.goal)) {
                        this.mode = GuardMode.LightTorch;
                        this.modeTimeout = 5;
                    } else {
                        this.mode = GuardMode.MoveToTorch;
                        this.modeTimeout = 3;
                    }
                }
            }
        }
        // Clear heard-thief flags
        this.heardThief = false;
        this.heardThiefClosest = false;
        // Say something to indicate state changes
        const popupType = popupTypeForStateChange(this.modePrev, this.mode);
        if (popupType !== undefined) {
            popups.add(popupType, ()=>this.posAnimated());
            this.speaking = true;
        }
        if (this.mode === GuardMode.ChaseVisibleTarget && this.modePrev !== GuardMode.ChaseVisibleTarget) {
            shouts.push({
                pos_shouter: this.pos,
                pos_target: player.pos,
                target: player
            });
            this.speaking = true;
            ++levelStats.numSpottings;
        }
    }
    cardinallyAdjacentTo(pos) {
        const dx = Math.abs(pos[0] - this.pos[0]);
        const dy = Math.abs(pos[1] - this.pos[1]);
        return dx == 1 && dy == 0 || dx == 0 && dy == 1;
    }
    adjacentTo(pos) {
        const dx = pos[0] - this.pos[0];
        const dy = pos[1] - this.pos[1];
        return Math.abs(dx) < 2 && Math.abs(dy) < 2;
    }
    seesActor(map, person, offset = 0) {
        const d = (0, _myMatrix.vec2).create();
        (0, _myMatrix.vec2).subtract(d, person.pos, this.pos);
        // Check view frustum except when in GuardMode.ChaseVisibleTarget
        if (this.mode !== GuardMode.ChaseVisibleTarget && (0, _myMatrix.vec2).dot(this.dir, d) < offset) return false;
        const personIsLit = map.cells.atVec(person.pos).lit > 0;
        const d2 = (0, _myMatrix.vec2).squaredLen(d);
        if (d2 >= this.sightCutoff(personIsLit) && !(d[0] === this.dir[0] * 2 && d[1] === this.dir[1] * 2)) return false;
        if (isRelaxedGuardMode(this.mode) && !this.angry || Math.abs(d[0]) >= 2 || Math.abs(d[1]) >= 2) {
            // Enemy is relaxed and/or player is distant. Normal line-of-sight applies.
            if (person.hidden(map) || !lineOfSight(map, this.pos, person.pos)) return false;
        } else {
            // Enemy is searching and player is adjacent. If diagonally adjacent, line of
            // sight can be blocked by a sight-blocker in either mutually-adjacent square.
            if (this.pos[0] !== person.pos[0] && this.pos[1] !== person.pos[1] && (map.cells.at(this.pos[0], person.pos[1]).blocksSight || map.cells.at(person.pos[0], this.pos[1]).blocksSight)) return false;
        }
        return true;
    }
    hidden(map) {
        if (map.cells.atVec(this.pos).hidesPlayer) return true;
        return false;
    }
    sightCutoff(litTarget) {
        if (this.mode === GuardMode.ChaseVisibleTarget) return litTarget ? 75 : 33;
        else if (!isRelaxedGuardMode(this.mode) || this.angry) return litTarget ? 75 : 15;
        else return litTarget ? 40 : 3;
    }
    enterPatrolMode(map) {
        this.patrolPathIndex = map.patrolPathIndexForResume(this.patrolPath, this.patrolPathIndex, this.pos);
        this.mode = GuardMode.Patrol;
    }
    choosePatrolStep(state) {
        if (this.pos.equals(this.patrolPath[this.patrolPathIndex])) this.patrolPathIndex = (this.patrolPathIndex + 1) % this.patrolPath.length;
        return this.chooseMoveTowardPosition(this.patrolPath[this.patrolPathIndex], state.gameMap);
    }
    makeBestAvailableMove(map, player) {
        const [pos, bumpedPlayer] = this.bestAvailableMove(this.goals, map, player);
        if (!pos.equals(this.pos)) {
            updateDir(this.dir, this.pos, pos);
            const start = (0, _myMatrix.vec2).create();
            (0, _myMatrix.vec2).subtract(start, this.pos, pos);
            const end = (0, _myMatrix.vec2).create();
            this.animation = new (0, _animation.SpriteAnimation)([
                {
                    pt0: start,
                    pt1: end,
                    duration: 0.2,
                    fn: (0, _animation.tween).linear
                }
            ], []);
            (0, _myMatrix.vec2).copy(this.pos, pos);
        }
        if (bumpedPlayer) {
            this.mode = GuardMode.ChaseVisibleTarget;
            updateDir(this.dir, this.pos, player.pos);
        }
    }
    updateDirInitial() {
        const patrolPathIndexNext = (this.patrolPathIndex + 1) % this.patrolPath.length;
        updateDir(this.dir, this.pos, this.patrolPath[patrolPathIndexNext]);
    }
    chooseMoveTowardPosition(posGoal, map) {
        const distanceField = map.computeDistancesToPosition(posGoal);
        return map.nextPositions(distanceField, this.pos);
    }
    chooseMoveTowardAdjacentToPosition(posGoal, map) {
        const distanceField = map.computeDistancesToAdjacentToPosition(posGoal);
        return map.nextPositions(distanceField, this.pos);
    }
    tryGetPosLookAt(map) {
        const x = this.pos[0];
        const y = this.pos[1];
        if (this.patrolPath.length === 1) {
            const gPos = this.patrolPath[0];
            for (let delta of [
                [
                    -1,
                    0
                ],
                [
                    1,
                    0
                ],
                [
                    0,
                    -1
                ],
                [
                    0,
                    1
                ]
            ]){
                const doorPos = gPos.add(new (0, _myMatrix.vec2)(...delta));
                const type = map.cells.atVec(doorPos).type;
                if (type === (0, _gameMap.TerrainType).DoorEW || type === (0, _gameMap.TerrainType).DoorNS) return gPos.add(new (0, _myMatrix.vec2)(...delta).scale(-1));
            }
        }
        // If there's a window adjacent to us, look out it
        if (x > 0 && map.cells.at(x - 1, y).type == (0, _gameMap.TerrainType).OneWayWindowW) return (0, _myMatrix.vec2).fromValues(x - 1, y);
        else if (x < map.cells.sizeX - 1 && map.cells.at(x + 1, y).type == (0, _gameMap.TerrainType).OneWayWindowE) return (0, _myMatrix.vec2).fromValues(x + 1, y);
        else if (y > 0 && map.cells.at(x, y - 1).type == (0, _gameMap.TerrainType).OneWayWindowS) return (0, _myMatrix.vec2).fromValues(x, y - 1);
        else if (y < map.cells.sizeY - 1 && map.cells.at(x, y + 1).type == (0, _gameMap.TerrainType).OneWayWindowN) return (0, _myMatrix.vec2).fromValues(x, y + 1);
        // If guard is on a chair, and there is a table adjacent to us, look at it
        if (map.items.find((item)=>item.pos.equals(this.pos) && item.type === (0, _gameMap.ItemType).Chair)) {
            const tables = map.items.filter((item)=>Math.abs(item.pos[0] - x) < 2 && Math.abs(item.pos[1] - y) < 2 && item.type === (0, _gameMap.ItemType).Table);
            if (tables.find((item)=>item.pos[0] === x - 1 && item.pos[1] === y)) return (0, _myMatrix.vec2).fromValues(x - 1, y);
            if (tables.find((item)=>item.pos[0] === x + 1 && item.pos[1] === y)) return (0, _myMatrix.vec2).fromValues(x + 1, y);
            if (tables.find((item)=>item.pos[0] === x && item.pos[1] === y - 1)) return (0, _myMatrix.vec2).fromValues(x, y - 1);
            if (tables.find((item)=>item.pos[0] === x && item.pos[1] === y + 1)) return (0, _myMatrix.vec2).fromValues(x, y + 1);
        }
        return undefined;
    }
}
function isRelaxedGuardMode(guardMode) {
    return guardMode === GuardMode.Patrol || guardMode === GuardMode.MoveToTorch || guardMode === GuardMode.LightTorch;
}
function guardOnGate(guard, map) {
    const gate = map.items.find((item)=>[
            (0, _gameMap.ItemType).PortcullisEW,
            (0, _gameMap.ItemType).PortcullisNS
        ].includes(item.type));
    return gate !== undefined && guard.pos.equals(gate.pos);
}
function chooseGuardMoves(state) {
    for (const guard of state.gameMap.guards)guard.chooseMoves(state);
}
function guardActAll(state, map, popups, player) {
    // Mark if we heard a guard last turn, and clear the speaking flag.
    for (const guard of map.guards){
        guard.modePrev = guard.mode;
        guard.heardGuard = guard.hearingGuard;
        guard.hearingGuard = false;
        guard.speaking = false;
        guard.hasMoved = false;
    }
    // Sort guards so the ones in GuardMode.ChaseVisibleTarget update first.
    const guardOrdering = (guard0, guard1)=>{
        const guard0Chasing = guard0.mode === GuardMode.ChaseVisibleTarget;
        const guard1Chasing = guard1.mode === GuardMode.ChaseVisibleTarget;
        if (guard0Chasing && !guard1Chasing) return -1;
        if (!guard0Chasing && guard1Chasing) return 1;
        return 0;
    };
    map.guards.sort(guardOrdering);
    // Update each guard for this turn.
    const shouts = [];
    let ontoGate = false;
    for (const guard of map.guards){
        const oldPos = (0, _myMatrix.vec2).clone(guard.pos);
        guard.act(map, popups, player, state.levelStats, shouts);
        guard.hasMoved = true;
        ontoGate = ontoGate || guardOnGate(guard, map) && !oldPos.equals(guard.pos);
    }
    // Update lighting to account for guards moving with torches, or opening/closing doors
    map.computeLighting(map.cells.atVec(player.pos));
    // Update guard states based on their senses
    for (const guard of map.guards)guard.postActSense(map, popups, player, state.levelStats, shouts);
    // Process shouts
    for (const shout of shouts)alertNearbyGuards(map, shout);
    // Clear pickTarget if the guard sees the player or is no longer adjacent to the player
    if (player.pickTarget !== null && (player.pickTarget.mode === GuardMode.ChaseVisibleTarget || !player.pickTarget.cardinallyAdjacentTo(player.pos))) player.pickTarget = null;
    if (ontoGate) state.sounds["gate"].play(0.2);
}
function popupTypeForStateChange(modePrev, modeNext) {
    if (modeNext == modePrev) return undefined;
    switch(modeNext){
        case GuardMode.Patrol:
        case GuardMode.MoveToTorch:
        case GuardMode.LightTorch:
            switch(modePrev){
                case GuardMode.Look:
                    return (0, _popups.PopupType).GuardFinishLooking;
                case GuardMode.Listen:
                    return (0, _popups.PopupType).GuardFinishListening;
                case GuardMode.MoveToLastSound:
                    return (0, _popups.PopupType).GuardFinishInvestigating;
                case GuardMode.MoveToGuardShout:
                    return (0, _popups.PopupType).GuardEndChase;
                case GuardMode.MoveToLastSighting:
                    return (0, _popups.PopupType).GuardEndChase;
                case GuardMode.Unconscious:
                    return (0, _popups.PopupType).GuardAwakesWarning;
                default:
                    return undefined;
            }
        case GuardMode.Look:
            return (0, _popups.PopupType).GuardSeeThief;
        case GuardMode.Listen:
            return (0, _popups.PopupType).GuardHearThief;
        case GuardMode.ChaseVisibleTarget:
            if (modePrev != GuardMode.MoveToLastSighting) return (0, _popups.PopupType).GuardChase;
            else return undefined;
        case GuardMode.MoveToLastSighting:
            return undefined;
        case GuardMode.MoveToLastSound:
            return (0, _popups.PopupType).GuardInvestigate;
        case GuardMode.MoveToGuardShout:
            return (0, _popups.PopupType).GuardHearGuard;
        case GuardMode.MoveToDownedGuard:
            return (0, _popups.PopupType).GuardDownWarning;
    }
    return undefined;
}
function alertNearbyGuards(map, shout) {
    for (const guard of map.guardsInEarshot(shout.pos_shouter, 25))if (guard.pos[0] != shout.pos_shouter[0] || guard.pos[1] != shout.pos_shouter[1]) {
        guard.hearingGuard = true;
        if (shout.target instanceof Guard) guard.angry = true;
        (0, _myMatrix.vec2).copy(guard.heardGuardPos, shout.pos_shouter);
    }
}
function updateDir(dir, pos, posTarget) {
    const dirTarget = (0, _myMatrix.vec2).create();
    (0, _myMatrix.vec2).subtract(dirTarget, posTarget, pos);
    const dirLeft = (0, _myMatrix.vec2).fromValues(-dir[1], dir[0]);
    const dotForward = (0, _myMatrix.vec2).dot(dir, dirTarget);
    const dotLeft = (0, _myMatrix.vec2).dot(dirLeft, dirTarget);
    if (dotForward >= Math.abs(dotLeft)) ;
    else if (-dotForward > Math.abs(dotLeft)) // dirTarget is in rear quarter; reverse direction
    // (Excluding diagonals from rear quarter)
    (0, _myMatrix.vec2).negate(dir, dir);
    else if (dotLeft >= 0) // dirTarget is in left quarter; turn left
    (0, _myMatrix.vec2).copy(dir, dirLeft);
    else // dirTarget is in right quarter; turn right
    (0, _myMatrix.vec2).negate(dir, dirLeft);
}
function torchNeedingRelighting(map, posViewer) {
    let bestItem = undefined;
    let bestDistSquared = 65;
    for (const item of map.items)if (item.type === (0, _gameMap.ItemType).TorchUnlit) {
        const distSquared = (0, _myMatrix.vec2).squaredDistance(item.pos, posViewer);
        if (distSquared >= bestDistSquared) continue;
        if (!lineOfSightToTorch(map, posViewer, item.pos)) continue;
        bestDistSquared = distSquared;
        bestItem = item;
    }
    return bestItem;
}
function relightTorchAt(map, posTorch, player) {
    for (const item of map.items)if (item.type === (0, _gameMap.ItemType).TorchUnlit && item.pos.equals(posTorch)) item.type = (0, _gameMap.ItemType).TorchLit;
    map.computeLighting(map.cells.atVec(player.pos));
}
function lineOfSight(map, from, to) {
    let x = from[0];
    let y = from[1];
    const dx = to[0] - x;
    const dy = to[1] - y;
    let ax = Math.abs(dx);
    let ay = Math.abs(dy);
    const x_inc = dx > 0 ? 1 : -1;
    const y_inc = dy > 0 ? 1 : -1;
    let error = ay - ax;
    let n = ax + ay - 1;
    ax *= 2;
    ay *= 2;
    while(n > 0){
        if (error > 0) {
            y += y_inc;
            error -= ax;
        } else {
            if (error === 0 && map.cells.at(x, y + y_inc).blocksSight) return false;
            x += x_inc;
            error += ay;
        }
        if (map.cells.at(x, y).blocksSight) return false;
        --n;
    }
    return true;
}
function blocksLineOfSightToTorch(cell) {
    if (cell.blocksSight) return true;
    if ((0, _gameMap.isWindowTerrainType)(cell.type)) return true;
    return false;
}
function lineOfSightToTorch(map, from, to) {
    let x = from[0];
    let y = from[1];
    const dx = to[0] - x;
    const dy = to[1] - y;
    let ax = Math.abs(dx);
    let ay = Math.abs(dy);
    const x_inc = dx > 0 ? 1 : -1;
    const y_inc = dy > 0 ? 1 : -1;
    let error = ay - ax;
    let n = ax + ay - 1;
    ax *= 2;
    ay *= 2;
    while(n > 0){
        if (error > 0) {
            y += y_inc;
            error -= ax;
        } else {
            if (error === 0 && blocksLineOfSightToTorch(map.cells.at(x, y + y_inc))) return false;
            x += x_inc;
            error += ay;
        }
        const cell = map.cells.at(x, y);
        if (cell.blocksSight) return false;
        if ((0, _gameMap.isWindowTerrainType)(cell.type)) return false;
        --n;
    }
    return true;
}

},{"./game-map":"3bH7G","./my-matrix":"21x0k","./random":"gUC1v","./popups":"eiIYq","./animation":"iKgaV","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"gUC1v":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "randomInRange", ()=>randomInRange);
parcelHelpers.export(exports, "shuffleArray", ()=>shuffleArray);
parcelHelpers.export(exports, "seedRandom", ()=>seedRandom);
parcelHelpers.export(exports, "RNG", ()=>RNG);
var _seedrandom = require("seedrandom");
var _seedrandomDefault = parcelHelpers.interopDefault(_seedrandom);
class RNG {
    constructor(seed = ""){
        if (seed !== "") {
            this.seed = seed;
            this.rng = (0, _seedrandomDefault.default)(seed);
        } else {
            this.seed = "";
            this.rng = (0, _seedrandomDefault.default)();
        }
    }
    reset() {
        this.rng = (0, _seedrandomDefault.default)(this.seed);
    }
    random() {
        return this.rng();
    }
    randomInRange(n) {
        return Math.floor(this.rng() * n);
    }
    shuffleArray(array) {
        for(let i = array.length - 1; i > 0; --i){
            let j = this.randomInRange(i + 1);
            let temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }
}
function seedRandom(seed) {
    (0, _seedrandomDefault.default)(seed, {
        global: true
    });
}
function randomInRange(n) {
    return Math.floor(Math.random() * n);
}
function shuffleArray(array) {
    for(let i = array.length - 1; i > 0; --i){
        let j = randomInRange(i + 1);
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

},{"seedrandom":"kcfU7","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"kcfU7":[function(require,module,exports) {
// A library of seedable RNGs implemented in Javascript.
//
// Usage:
//
// var seedrandom = require('seedrandom');
// var random = seedrandom(1); // or any seed.
// var x = random();       // 0 <= x < 1.  Every bit is random.
// var x = random.quick(); // 0 <= x < 1.  32 bits of randomness.
// alea, a 53-bit multiply-with-carry generator by Johannes Baagøe.
// Period: ~2^116
// Reported to pass all BigCrush tests.
var alea = require("7bf590523ce23bdd");
// xor128, a pure xor-shift generator by George Marsaglia.
// Period: 2^128-1.
// Reported to fail: MatrixRank and LinearComp.
var xor128 = require("6f22271c47aa398b");
// xorwow, George Marsaglia's 160-bit xor-shift combined plus weyl.
// Period: 2^192-2^32
// Reported to fail: CollisionOver, SimpPoker, and LinearComp.
var xorwow = require("b3f05ba4cc02a1e5");
// xorshift7, by François Panneton and Pierre L'ecuyer, takes
// a different approach: it adds robustness by allowing more shifts
// than Marsaglia's original three.  It is a 7-shift generator
// with 256 bits, that passes BigCrush with no systmatic failures.
// Period 2^256-1.
// No systematic BigCrush failures reported.
var xorshift7 = require("6b87207d7b592c71");
// xor4096, by Richard Brent, is a 4096-bit xor-shift with a
// very long period that also adds a Weyl generator. It also passes
// BigCrush with no systematic failures.  Its long period may
// be useful if you have many generators and need to avoid
// collisions.
// Period: 2^4128-2^32.
// No systematic BigCrush failures reported.
var xor4096 = require("999b871f72fbe5e6");
// Tyche-i, by Samuel Neves and Filipe Araujo, is a bit-shifting random
// number generator derived from ChaCha, a modern stream cipher.
// https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf
// Period: ~2^127
// No systematic BigCrush failures reported.
var tychei = require("4acb41f51fb8d2db");
// The original ARC4-based prng included in this library.
// Period: ~2^1600
var sr = require("a135c26b6302ae09");
sr.alea = alea;
sr.xor128 = xor128;
sr.xorwow = xorwow;
sr.xorshift7 = xorshift7;
sr.xor4096 = xor4096;
sr.tychei = tychei;
module.exports = sr;

},{"7bf590523ce23bdd":"c47hP","6f22271c47aa398b":"hy9Go","b3f05ba4cc02a1e5":"8ktBo","6b87207d7b592c71":"i5aBa","999b871f72fbe5e6":"7tXtZ","4acb41f51fb8d2db":"eVmNr","a135c26b6302ae09":"lbeKh"}],"c47hP":[function(require,module,exports) {
// A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010
// http://baagoe.com/en/RandomMusings/javascript/
// https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
// Original work is under MIT license -
// Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
(function(global, module1, define1) {
    function Alea(seed) {
        var me = this, mash = Mash();
        me.next = function() {
            var t = 2091639 * me.s0 + me.c * 2.3283064365386963e-10; // 2^-32
            me.s0 = me.s1;
            me.s1 = me.s2;
            return me.s2 = t - (me.c = t | 0);
        };
        // Apply the seeding algorithm from Baagoe.
        me.c = 1;
        me.s0 = mash(" ");
        me.s1 = mash(" ");
        me.s2 = mash(" ");
        me.s0 -= mash(seed);
        if (me.s0 < 0) me.s0 += 1;
        me.s1 -= mash(seed);
        if (me.s1 < 0) me.s1 += 1;
        me.s2 -= mash(seed);
        if (me.s2 < 0) me.s2 += 1;
        mash = null;
    }
    function copy(f, t) {
        t.c = f.c;
        t.s0 = f.s0;
        t.s1 = f.s1;
        t.s2 = f.s2;
        return t;
    }
    function impl(seed, opts) {
        var xg = new Alea(seed), state = opts && opts.state, prng = xg.next;
        prng.int32 = function() {
            return xg.next() * 0x100000000 | 0;
        };
        prng.double = function() {
            return prng() + (prng() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
        };
        prng.quick = prng;
        if (state) {
            if (typeof state == "object") copy(state, xg);
            prng.state = function() {
                return copy(xg, {});
            };
        }
        return prng;
    }
    function Mash() {
        var n = 0xefc8249d;
        var mash = function(data) {
            data = String(data);
            for(var i = 0; i < data.length; i++){
                n += data.charCodeAt(i);
                var h = 0.02519603282416938 * n;
                n = h >>> 0;
                h -= n;
                h *= n;
                n = h >>> 0;
                h -= n;
                n += h * 0x100000000; // 2^32
            }
            return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
        };
        return mash;
    }
    if (module1 && module1.exports) module1.exports = impl;
    else if (define1 && define1.amd) define1(function() {
        return impl;
    });
    else this.alea = impl;
})(this, module, typeof define == "function" && define // present with an AMD loader
);

},{}],"hy9Go":[function(require,module,exports) {
// A Javascript implementaion of the "xor128" prng algorithm by
// George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper
(function(global, module1, define1) {
    function XorGen(seed) {
        var me = this, strseed = "";
        me.x = 0;
        me.y = 0;
        me.z = 0;
        me.w = 0;
        // Set up generator function.
        me.next = function() {
            var t = me.x ^ me.x << 11;
            me.x = me.y;
            me.y = me.z;
            me.z = me.w;
            return me.w ^= me.w >>> 19 ^ t ^ t >>> 8;
        };
        if (seed === (seed | 0)) // Integer seed.
        me.x = seed;
        else // String seed.
        strseed += seed;
        // Mix in string seed, then discard an initial batch of 64 values.
        for(var k = 0; k < strseed.length + 64; k++){
            me.x ^= strseed.charCodeAt(k) | 0;
            me.next();
        }
    }
    function copy(f, t) {
        t.x = f.x;
        t.y = f.y;
        t.z = f.z;
        t.w = f.w;
        return t;
    }
    function impl(seed, opts) {
        var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
            return (xg.next() >>> 0) / 0x100000000;
        };
        prng.double = function() {
            do var top = xg.next() >>> 11, bot = (xg.next() >>> 0) / 0x100000000, result = (top + bot) / 2097152;
            while (result === 0);
            return result;
        };
        prng.int32 = xg.next;
        prng.quick = prng;
        if (state) {
            if (typeof state == "object") copy(state, xg);
            prng.state = function() {
                return copy(xg, {});
            };
        }
        return prng;
    }
    if (module1 && module1.exports) module1.exports = impl;
    else if (define1 && define1.amd) define1(function() {
        return impl;
    });
    else this.xor128 = impl;
})(this, module, typeof define == "function" && define // present with an AMD loader
);

},{}],"8ktBo":[function(require,module,exports) {
// A Javascript implementaion of the "xorwow" prng algorithm by
// George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper
(function(global, module1, define1) {
    function XorGen(seed) {
        var me = this, strseed = "";
        // Set up generator function.
        me.next = function() {
            var t = me.x ^ me.x >>> 2;
            me.x = me.y;
            me.y = me.z;
            me.z = me.w;
            me.w = me.v;
            return (me.d = me.d + 362437 | 0) + (me.v = me.v ^ me.v << 4 ^ (t ^ t << 1)) | 0;
        };
        me.x = 0;
        me.y = 0;
        me.z = 0;
        me.w = 0;
        me.v = 0;
        if (seed === (seed | 0)) // Integer seed.
        me.x = seed;
        else // String seed.
        strseed += seed;
        // Mix in string seed, then discard an initial batch of 64 values.
        for(var k = 0; k < strseed.length + 64; k++){
            me.x ^= strseed.charCodeAt(k) | 0;
            if (k == strseed.length) me.d = me.x << 10 ^ me.x >>> 4;
            me.next();
        }
    }
    function copy(f, t) {
        t.x = f.x;
        t.y = f.y;
        t.z = f.z;
        t.w = f.w;
        t.v = f.v;
        t.d = f.d;
        return t;
    }
    function impl(seed, opts) {
        var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
            return (xg.next() >>> 0) / 0x100000000;
        };
        prng.double = function() {
            do var top = xg.next() >>> 11, bot = (xg.next() >>> 0) / 0x100000000, result = (top + bot) / 2097152;
            while (result === 0);
            return result;
        };
        prng.int32 = xg.next;
        prng.quick = prng;
        if (state) {
            if (typeof state == "object") copy(state, xg);
            prng.state = function() {
                return copy(xg, {});
            };
        }
        return prng;
    }
    if (module1 && module1.exports) module1.exports = impl;
    else if (define1 && define1.amd) define1(function() {
        return impl;
    });
    else this.xorwow = impl;
})(this, module, typeof define == "function" && define // present with an AMD loader
);

},{}],"i5aBa":[function(require,module,exports) {
// A Javascript implementaion of the "xorshift7" algorithm by
// François Panneton and Pierre L'ecuyer:
// "On the Xorgshift Random Number Generators"
// http://saluc.engr.uconn.edu/refs/crypto/rng/panneton05onthexorshift.pdf
(function(global, module1, define1) {
    function XorGen(seed) {
        var me = this;
        // Set up generator function.
        me.next = function() {
            // Update xor generator.
            var X = me.x, i = me.i, t, v, w;
            t = X[i];
            t ^= t >>> 7;
            v = t ^ t << 24;
            t = X[i + 1 & 7];
            v ^= t ^ t >>> 10;
            t = X[i + 3 & 7];
            v ^= t ^ t >>> 3;
            t = X[i + 4 & 7];
            v ^= t ^ t << 7;
            t = X[i + 7 & 7];
            t = t ^ t << 13;
            v ^= t ^ t << 9;
            X[i] = v;
            me.i = i + 1 & 7;
            return v;
        };
        function init(me, seed) {
            var j, w, X = [];
            if (seed === (seed | 0)) // Seed state array using a 32-bit integer.
            w = X[0] = seed;
            else {
                // Seed state using a string.
                seed = "" + seed;
                for(j = 0; j < seed.length; ++j)X[j & 7] = X[j & 7] << 15 ^ seed.charCodeAt(j) + X[j + 1 & 7] << 13;
            }
            // Enforce an array length of 8, not all zeroes.
            while(X.length < 8)X.push(0);
            for(j = 0; j < 8 && X[j] === 0; ++j);
            if (j == 8) w = X[7] = -1;
            else w = X[j];
            me.x = X;
            me.i = 0;
            // Discard an initial 256 values.
            for(j = 256; j > 0; --j)me.next();
        }
        init(me, seed);
    }
    function copy(f, t) {
        t.x = f.x.slice();
        t.i = f.i;
        return t;
    }
    function impl(seed, opts) {
        if (seed == null) seed = +new Date;
        var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
            return (xg.next() >>> 0) / 0x100000000;
        };
        prng.double = function() {
            do var top = xg.next() >>> 11, bot = (xg.next() >>> 0) / 0x100000000, result = (top + bot) / 2097152;
            while (result === 0);
            return result;
        };
        prng.int32 = xg.next;
        prng.quick = prng;
        if (state) {
            if (state.x) copy(state, xg);
            prng.state = function() {
                return copy(xg, {});
            };
        }
        return prng;
    }
    if (module1 && module1.exports) module1.exports = impl;
    else if (define1 && define1.amd) define1(function() {
        return impl;
    });
    else this.xorshift7 = impl;
})(this, module, typeof define == "function" && define // present with an AMD loader
);

},{}],"7tXtZ":[function(require,module,exports) {
// A Javascript implementaion of Richard Brent's Xorgens xor4096 algorithm.
//
// This fast non-cryptographic random number generator is designed for
// use in Monte-Carlo algorithms. It combines a long-period xorshift
// generator with a Weyl generator, and it passes all common batteries
// of stasticial tests for randomness while consuming only a few nanoseconds
// for each prng generated.  For background on the generator, see Brent's
// paper: "Some long-period random number generators using shifts and xors."
// http://arxiv.org/pdf/1004.3115v1.pdf
//
// Usage:
//
// var xor4096 = require('xor4096');
// random = xor4096(1);                        // Seed with int32 or string.
// assert.equal(random(), 0.1520436450538547); // (0, 1) range, 53 bits.
// assert.equal(random.int32(), 1806534897);   // signed int32, 32 bits.
//
// For nonzero numeric keys, this impelementation provides a sequence
// identical to that by Brent's xorgens 3 implementaion in C.  This
// implementation also provides for initalizing the generator with
// string seeds, or for saving and restoring the state of the generator.
//
// On Chrome, this prng benchmarks about 2.1 times slower than
// Javascript's built-in Math.random().
(function(global, module1, define1) {
    function XorGen(seed) {
        var me = this;
        // Set up generator function.
        me.next = function() {
            var w = me.w, X = me.X, i = me.i, t, v;
            // Update Weyl generator.
            me.w = w = w + 0x61c88647 | 0;
            // Update xor generator.
            v = X[i + 34 & 127];
            t = X[i = i + 1 & 127];
            v ^= v << 13;
            t ^= t << 17;
            v ^= v >>> 15;
            t ^= t >>> 12;
            // Update Xor generator array state.
            v = X[i] = v ^ t;
            me.i = i;
            // Result is the combination.
            return v + (w ^ w >>> 16) | 0;
        };
        function init(me, seed) {
            var t, v, i, j, w, X = [], limit = 128;
            if (seed === (seed | 0)) {
                // Numeric seeds initialize v, which is used to generates X.
                v = seed;
                seed = null;
            } else {
                // String seeds are mixed into v and X one character at a time.
                seed = seed + "\0";
                v = 0;
                limit = Math.max(limit, seed.length);
            }
            // Initialize circular array and weyl value.
            for(i = 0, j = -32; j < limit; ++j){
                // Put the unicode characters into the array, and shuffle them.
                if (seed) v ^= seed.charCodeAt((j + 32) % seed.length);
                // After 32 shuffles, take v as the starting w value.
                if (j === 0) w = v;
                v ^= v << 10;
                v ^= v >>> 15;
                v ^= v << 4;
                v ^= v >>> 13;
                if (j >= 0) {
                    w = w + 0x61c88647 | 0; // Weyl.
                    t = X[j & 127] ^= v + w; // Combine xor and weyl to init array.
                    i = 0 == t ? i + 1 : 0; // Count zeroes.
                }
            }
            // We have detected all zeroes; make the key nonzero.
            if (i >= 128) X[(seed && seed.length || 0) & 127] = -1;
            // Run the generator 512 times to further mix the state before using it.
            // Factoring this as a function slows the main generator, so it is just
            // unrolled here.  The weyl generator is not advanced while warming up.
            i = 127;
            for(j = 512; j > 0; --j){
                v = X[i + 34 & 127];
                t = X[i = i + 1 & 127];
                v ^= v << 13;
                t ^= t << 17;
                v ^= v >>> 15;
                t ^= t >>> 12;
                X[i] = v ^ t;
            }
            // Storing state as object members is faster than using closure variables.
            me.w = w;
            me.X = X;
            me.i = i;
        }
        init(me, seed);
    }
    function copy(f, t) {
        t.i = f.i;
        t.w = f.w;
        t.X = f.X.slice();
        return t;
    }
    function impl(seed, opts) {
        if (seed == null) seed = +new Date;
        var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
            return (xg.next() >>> 0) / 0x100000000;
        };
        prng.double = function() {
            do var top = xg.next() >>> 11, bot = (xg.next() >>> 0) / 0x100000000, result = (top + bot) / 2097152;
            while (result === 0);
            return result;
        };
        prng.int32 = xg.next;
        prng.quick = prng;
        if (state) {
            if (state.X) copy(state, xg);
            prng.state = function() {
                return copy(xg, {});
            };
        }
        return prng;
    }
    if (module1 && module1.exports) module1.exports = impl;
    else if (define1 && define1.amd) define1(function() {
        return impl;
    });
    else this.xor4096 = impl;
})(this, module, typeof define == "function" && define // present with an AMD loader
);

},{}],"eVmNr":[function(require,module,exports) {
// A Javascript implementaion of the "Tyche-i" prng algorithm by
// Samuel Neves and Filipe Araujo.
// See https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf
(function(global, module1, define1) {
    function XorGen(seed) {
        var me = this, strseed = "";
        // Set up generator function.
        me.next = function() {
            var b = me.b, c = me.c, d = me.d, a = me.a;
            b = b << 25 ^ b >>> 7 ^ c;
            c = c - d | 0;
            d = d << 24 ^ d >>> 8 ^ a;
            a = a - b | 0;
            me.b = b = b << 20 ^ b >>> 12 ^ c;
            me.c = c = c - d | 0;
            me.d = d << 16 ^ c >>> 16 ^ a;
            return me.a = a - b | 0;
        };
        /* The following is non-inverted tyche, which has better internal
   * bit diffusion, but which is about 25% slower than tyche-i in JS.
  me.next = function() {
    var a = me.a, b = me.b, c = me.c, d = me.d;
    a = (me.a + me.b | 0) >>> 0;
    d = me.d ^ a; d = d << 16 ^ d >>> 16;
    c = me.c + d | 0;
    b = me.b ^ c; b = b << 12 ^ d >>> 20;
    me.a = a = a + b | 0;
    d = d ^ a; me.d = d = d << 8 ^ d >>> 24;
    me.c = c = c + d | 0;
    b = b ^ c;
    return me.b = (b << 7 ^ b >>> 25);
  }
  */ me.a = 0;
        me.b = 0;
        me.c = -1640531527;
        me.d = 1367130551;
        if (seed === Math.floor(seed)) {
            // Integer seed.
            me.a = seed / 0x100000000 | 0;
            me.b = seed | 0;
        } else // String seed.
        strseed += seed;
        // Mix in string seed, then discard an initial batch of 64 values.
        for(var k = 0; k < strseed.length + 20; k++){
            me.b ^= strseed.charCodeAt(k) | 0;
            me.next();
        }
    }
    function copy(f, t) {
        t.a = f.a;
        t.b = f.b;
        t.c = f.c;
        t.d = f.d;
        return t;
    }
    function impl(seed, opts) {
        var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
            return (xg.next() >>> 0) / 0x100000000;
        };
        prng.double = function() {
            do var top = xg.next() >>> 11, bot = (xg.next() >>> 0) / 0x100000000, result = (top + bot) / 2097152;
            while (result === 0);
            return result;
        };
        prng.int32 = xg.next;
        prng.quick = prng;
        if (state) {
            if (typeof state == "object") copy(state, xg);
            prng.state = function() {
                return copy(xg, {});
            };
        }
        return prng;
    }
    if (module1 && module1.exports) module1.exports = impl;
    else if (define1 && define1.amd) define1(function() {
        return impl;
    });
    else this.tychei = impl;
})(this, module, typeof define == "function" && define // present with an AMD loader
);

},{}],"lbeKh":[function(require,module,exports) {
/*
Copyright 2019 David Bau.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/ (function(global, pool, math) {
    //
    // The following constants are related to IEEE 754 limits.
    //
    var width = 256, chunks = 6, digits = 52, rngname = "random", startdenom = math.pow(width, chunks), significance = math.pow(2, digits), overflow = significance * 2, mask = width - 1, nodecrypto; // node.js crypto module, initialized at the bottom.
    //
    // seedrandom()
    // This is the seedrandom function described above.
    //
    function seedrandom(seed, options, callback) {
        var key = [];
        options = options == true ? {
            entropy: true
        } : options || {};
        // Flatten the seed string or build one from local entropy if needed.
        var shortseed = mixkey(flatten(options.entropy ? [
            seed,
            tostring(pool)
        ] : seed == null ? autoseed() : seed, 3), key);
        // Use the seed to initialize an ARC4 generator.
        var arc4 = new ARC4(key);
        // This function returns a random double in [0, 1) that contains
        // randomness in every bit of the mantissa of the IEEE 754 value.
        var prng = function() {
            var n = arc4.g(chunks), d = startdenom, x = 0; //   and no 'extra last byte'.
            while(n < significance){
                n = (n + x) * width; //   shifting numerator and
                d *= width; //   denominator and generating a
                x = arc4.g(1); //   new least-significant-byte.
            }
            while(n >= overflow){
                n /= 2; //   last byte, shift everything
                d /= 2; //   right using integer math until
                x >>>= 1; //   we have exactly the desired bits.
            }
            return (n + x) / d; // Form the number within [0, 1).
        };
        prng.int32 = function() {
            return arc4.g(4) | 0;
        };
        prng.quick = function() {
            return arc4.g(4) / 0x100000000;
        };
        prng.double = prng;
        // Mix the randomness into accumulated entropy.
        mixkey(tostring(arc4.S), pool);
        // Calling convention: what to return as a function of prng, seed, is_math.
        return (options.pass || callback || function(prng, seed, is_math_call, state) {
            if (state) {
                // Load the arc4 state from the given state if it has an S array.
                if (state.S) copy(state, arc4);
                // Only provide the .state method if requested via options.state.
                prng.state = function() {
                    return copy(arc4, {});
                };
            }
            // If called as a method of Math (Math.seedrandom()), mutate
            // Math.random because that is how seedrandom.js has worked since v1.0.
            if (is_math_call) {
                math[rngname] = prng;
                return seed;
            } else return prng;
        })(prng, shortseed, "global" in options ? options.global : this == math, options.state);
    }
    //
    // ARC4
    //
    // An ARC4 implementation.  The constructor takes a key in the form of
    // an array of at most (width) integers that should be 0 <= x < (width).
    //
    // The g(count) method returns a pseudorandom integer that concatenates
    // the next (count) outputs from ARC4.  Its return value is a number x
    // that is in the range 0 <= x < (width ^ count).
    //
    function ARC4(key) {
        var t, keylen = key.length, me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];
        // The empty key [] is treated as [0].
        if (!keylen) key = [
            keylen++
        ];
        // Set up S using the standard key scheduling algorithm.
        while(i < width)s[i] = i++;
        for(i = 0; i < width; i++){
            s[i] = s[j = mask & j + key[i % keylen] + (t = s[i])];
            s[j] = t;
        }
        // The "g" method returns the next (count) outputs as one number.
        (me.g = function(count) {
            // Using instance members instead of closure state nearly doubles speed.
            var t, r = 0, i = me.i, j = me.j, s = me.S;
            while(count--){
                t = s[i = mask & i + 1];
                r = r * width + s[mask & (s[i] = s[j = mask & j + t]) + (s[j] = t)];
            }
            me.i = i;
            me.j = j;
            return r;
        // For robust unpredictability, the function call below automatically
        // discards an initial batch of values.  This is called RC4-drop[256].
        // See http://google.com/search?q=rsa+fluhrer+response&btnI
        })(width);
    }
    //
    // copy()
    // Copies internal state of ARC4 to or from a plain object.
    //
    function copy(f, t) {
        t.i = f.i;
        t.j = f.j;
        t.S = f.S.slice();
        return t;
    }
    //
    // flatten()
    // Converts an object tree to nested arrays of strings.
    //
    function flatten(obj, depth) {
        var result = [], typ = typeof obj, prop;
        if (depth && typ == "object") {
            for(prop in obj)try {
                result.push(flatten(obj[prop], depth - 1));
            } catch (e) {}
        }
        return result.length ? result : typ == "string" ? obj : obj + "\0";
    }
    //
    // mixkey()
    // Mixes a string seed into a key that is an array of integers, and
    // returns a shortened string seed that is equivalent to the result key.
    //
    function mixkey(seed, key) {
        var stringseed = seed + "", smear, j = 0;
        while(j < stringseed.length)key[mask & j] = mask & (smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++);
        return tostring(key);
    }
    //
    // autoseed()
    // Returns an object for autoseeding, using window.crypto and Node crypto
    // module if available.
    //
    function autoseed() {
        try {
            var out;
            if (nodecrypto && (out = nodecrypto.randomBytes)) // The use of 'out' to remember randomBytes makes tight minified code.
            out = out(width);
            else {
                out = new Uint8Array(width);
                (global.crypto || global.msCrypto).getRandomValues(out);
            }
            return tostring(out);
        } catch (e) {
            var browser = global.navigator, plugins = browser && browser.plugins;
            return [
                +new Date,
                global,
                plugins,
                global.screen,
                tostring(pool)
            ];
        }
    }
    //
    // tostring()
    // Converts an array of charcodes to a string
    //
    function tostring(a) {
        return String.fromCharCode.apply(0, a);
    }
    //
    // When seedrandom.js is loaded, we immediately mix a few bits
    // from the built-in RNG into the entropy pool.  Because we do
    // not want to interfere with deterministic PRNG state later,
    // seedrandom will not call math.random on its own again after
    // initialization.
    //
    mixkey(math.random(), pool);
    //
    // Nodejs and AMD support: export the implementation as a module using
    // either convention.
    //
    if (0, module.exports) {
        module.exports = seedrandom;
        // When in node.js, try using crypto package for autoseeding.
        try {
            nodecrypto = require("2080230c56ad12b8");
        } catch (ex) {}
    } else if (typeof define == "function" && define.amd) define(function() {
        return seedrandom;
    });
    else // When included as a plain script, set up Math.seedrandom global.
    math["seed" + rngname] = seedrandom;
// End anonymous scope, and pass initial values.
})(// global: `self` in browsers (including strict mode and web workers),
// otherwise `this` in Node and other environments
typeof self !== "undefined" ? self : this, [], Math // math: package containing random, pow, and seedrandom
);

},{"2080230c56ad12b8":"jhUEF"}],"jhUEF":[function(require,module,exports) {
"use strict";

},{}],"eiIYq":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "Popups", ()=>Popups);
parcelHelpers.export(exports, "PopupType", ()=>PopupType);
var _myMatrix = require("./my-matrix");
let PopupType;
(function(PopupType) {
    PopupType[PopupType["Damage"] = 0] = "Damage";
    PopupType[PopupType["GuardChase"] = 1] = "GuardChase";
    PopupType[PopupType["GuardInvestigate"] = 2] = "GuardInvestigate";
    PopupType[PopupType["GuardSeeThief"] = 3] = "GuardSeeThief";
    PopupType[PopupType["GuardHearThief"] = 4] = "GuardHearThief";
    PopupType[PopupType["GuardDownWarning"] = 5] = "GuardDownWarning";
    PopupType[PopupType["GuardAwakesWarning"] = 6] = "GuardAwakesWarning";
    PopupType[PopupType["GuardWarningResponse"] = 7] = "GuardWarningResponse";
    PopupType[PopupType["GuardHearGuard"] = 8] = "GuardHearGuard";
    PopupType[PopupType["GuardEndChase"] = 9] = "GuardEndChase";
    PopupType[PopupType["GuardFinishInvestigating"] = 10] = "GuardFinishInvestigating";
    PopupType[PopupType["GuardFinishLooking"] = 11] = "GuardFinishLooking";
    PopupType[PopupType["GuardFinishListening"] = 12] = "GuardFinishListening";
    PopupType[PopupType["GuardStirring"] = 13] = "GuardStirring";
})(PopupType || (PopupType = {}));
class Popups {
    constructor(){
        this.popups = [];
        this.currentPopup = "";
        this.currentPopupWorldPos = ()=>(0, _myMatrix.vec2).create();
        this.currentPopupTimeRemaining = 0;
    }
    add(popupType, posWorld) {
        this.popups.push({
            popupType: popupType,
            posWorld: posWorld
        });
    }
    clear() {
        this.popups.length = 0;
    }
    reset() {
        this.popups.length = 0;
        this.currentPopup = "";
        this.currentPopupTimeRemaining = 0;
    }
    endOfUpdate(posPlayer, subtitledSounds) {
        if (this.popups.length === 0) return "";
        this.popups.sort((a, b)=>{
            if (a.popupType < b.popupType) return -1;
            if (a.popupType > b.popupType) return 1;
            const posA = a.posWorld();
            const posB = b.posWorld();
            const aDist = (0, _myMatrix.vec2).squaredDistance(posA, posPlayer);
            const bDist = (0, _myMatrix.vec2).squaredDistance(posB, posPlayer);
            if (aDist < bDist) return -1;
            if (aDist > bDist) return 1;
            return 0;
        });
        const popup = this.popups[0];
        const soundName = soundNameForPopupType(popup.popupType);
        const subtitledSound = subtitledSounds[soundName].play(0.6);
        this.currentPopup = subtitledSound.subtitle;
        this.currentPopupWorldPos = popup.posWorld;
        this.currentPopupTimeRemaining = 2.0;
        return subtitledSound.subtitle;
    }
}
function soundNameForPopupType(popupType) {
    switch(popupType){
        case PopupType.Damage:
            return "guardDamage";
        case PopupType.GuardChase:
            return "guardChase";
        case PopupType.GuardSeeThief:
            return "guardSeeThief";
        case PopupType.GuardHearThief:
            return "guardHearThief";
        case PopupType.GuardHearGuard:
            return "guardHearGuard";
        case PopupType.GuardDownWarning:
            return "guardDownWarning";
        case PopupType.GuardAwakesWarning:
            return "guardAwakesWarning";
        case PopupType.GuardWarningResponse:
            return "guardWarningResponse";
        case PopupType.GuardInvestigate:
            return "guardInvestigate";
        case PopupType.GuardEndChase:
            return "guardEndChase";
        case PopupType.GuardFinishInvestigating:
            return "guardFinishInvestigating";
        case PopupType.GuardFinishLooking:
            return "guardFinishLooking";
        case PopupType.GuardFinishListening:
            return "guardFinishListening";
        case PopupType.GuardStirring:
            return "guardStirring";
    }
}

},{"./my-matrix":"21x0k","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"iKgaV":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "Animator", ()=>Animator);
parcelHelpers.export(exports, "SpriteAnimation", ()=>SpriteAnimation);
parcelHelpers.export(exports, "FrameAnimator", ()=>FrameAnimator);
parcelHelpers.export(exports, "LightSourceAnimation", ()=>LightSourceAnimation);
parcelHelpers.export(exports, "tween", ()=>tween);
parcelHelpers.export(exports, "LightState", ()=>LightState);
var _myMatrix = require("./my-matrix");
var _gameMap = require("./game-map");
var tween = require("74ddcfb5b40ba0c4");
class Animator {
    update(dt) {
        return false;
    }
    currentTile() {
        return {};
    }
}
class FrameAnimator extends Animator {
    constructor(tileInfo, frameDuration, time = 0, frame = 0){
        super();
        this.time = time;
        this.tileInfo = tileInfo;
        this.activeFrame = frame;
        this.frameDuration = frameDuration;
    }
    update(dt) {
        this.time += dt;
        const fDuration = this.frameDuration instanceof Array ? this.frameDuration[this.activeFrame] : this.frameDuration;
        if (this.time > fDuration) {
            this.activeFrame++;
            if (this.activeFrame >= this.tileInfo.length) this.activeFrame = 0;
            this.time = 0;
        }
        return false;
    }
    currentTile() {
        return this.tileInfo[this.activeFrame];
    }
}
class SpriteAnimation extends Animator {
    constructor(tweenSeq, tileInfo){
        super();
        this.time = 0;
        this.offset = (0, _myMatrix.vec2).clone(tweenSeq[0].pt0);
        this.tileInfo = tileInfo;
        this.activeFrame = 0;
        this.frameStep = 1;
        this.activePt = 0;
        this.tweenSeq = tweenSeq;
        this.removeOnFinish = false;
    }
    update(dt) {
        const start = this.tweenSeq[this.activePt].pt0;
        const end = this.tweenSeq[this.activePt].pt1;
        const duration = this.tweenSeq[this.activePt].duration;
        const fn = this.tweenSeq[this.activePt].fn;
        if (start === undefined || end == undefined) return true;
        this.time = Math.min(this.time + dt, duration);
        this.offset[0] = fn(this.time, start[0], end[0], duration);
        this.offset[1] = fn(this.time, start[1], end[1], duration);
        if (this.time == duration) {
            this.activePt++;
            this.time = 0;
            this.activeFrame++;
        }
        if (this.activeFrame >= this.tileInfo.length) this.activeFrame = 0;
        return this.activePt === this.tweenSeq.length;
    }
    currentTile() {
        return this.tileInfo[this.activeFrame];
    }
}
let LightState;
(function(LightState) {
    LightState[LightState["idle"] = 0] = "idle";
    LightState[LightState["dimmed"] = 1] = "dimmed";
    LightState[LightState["off"] = 2] = "off";
})(LightState || (LightState = {}));
class LightSourceAnimation extends Animator {
    activeFrame = 0;
    time = 0;
    dimDuration = 300;
    constructor(state, lightId, lightVector, item, idleTiles, dimTile, offTile){
        super();
        this.idleTiles = idleTiles;
        this.dimTile = dimTile;
        this.offTile = offTile;
        this.lightId = lightId;
        this.lightVector = lightVector;
        this.state = state;
        this.item = item;
    }
    update(dt) {
        if (this.item !== null) {
            if (this.item.type === (0, _gameMap.ItemType).TorchUnlit) this.state = LightState.off;
            if (this.item.type !== (0, _gameMap.ItemType).TorchUnlit && this.state === LightState.off) {
                this.state = LightState.idle;
                this.lightVector[this.lightId] = 0;
            }
        }
        this.time += dt;
        if (this.state == LightState.off) return false;
        let lm = this.lightVector[this.lightId];
        if (lm == 0 && Math.random() > 0.995 ** (dt * 60)) {
            this.state = LightState.dimmed;
            lm = 3; //0.98;        
        } else if (lm > 0) lm = Math.max(lm - 5 * dt, 0);
        if (lm == 0) {
            this.state = LightState.idle;
            const duration = this.idleTiles[this.activeFrame][1];
            if (this.time >= duration) {
                this.time = 0;
                this.activeFrame++;
                if (this.activeFrame >= this.idleTiles.length) this.activeFrame = 0;
            }
        }
        this.lightVector[this.lightId] = lm;
        return false;
    }
    currentTile() {
        if (this.state == LightState.idle) return this.idleTiles[this.activeFrame][0];
        if (this.state == LightState.dimmed) return this.dimTile;
        return this.offTile;
    }
}

},{"./my-matrix":"21x0k","./game-map":"3bH7G","74ddcfb5b40ba0c4":"k5maZ","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"k5maZ":[function(require,module,exports) {
"use strict";
// t: current time, b: beginning value, _c: final value, d: total duration
var tweenFunctions = {
    linear: function(t, b, _c, d) {
        var c = _c - b;
        return c * t / d + b;
    },
    easeInQuad: function(t, b, _c, d) {
        var c = _c - b;
        return c * (t /= d) * t + b;
    },
    easeOutQuad: function(t, b, _c, d) {
        var c = _c - b;
        return -c * (t /= d) * (t - 2) + b;
    },
    easeInOutQuad: function(t, b, _c, d) {
        var c = _c - b;
        if ((t /= d / 2) < 1) return c / 2 * t * t + b;
        else return -c / 2 * (--t * (t - 2) - 1) + b;
    },
    easeInCubic: function(t, b, _c, d) {
        var c = _c - b;
        return c * (t /= d) * t * t + b;
    },
    easeOutCubic: function(t, b, _c, d) {
        var c = _c - b;
        return c * ((t = t / d - 1) * t * t + 1) + b;
    },
    easeInOutCubic: function(t, b, _c, d) {
        var c = _c - b;
        if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
        else return c / 2 * ((t -= 2) * t * t + 2) + b;
    },
    easeInQuart: function(t, b, _c, d) {
        var c = _c - b;
        return c * (t /= d) * t * t * t + b;
    },
    easeOutQuart: function(t, b, _c, d) {
        var c = _c - b;
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    },
    easeInOutQuart: function(t, b, _c, d) {
        var c = _c - b;
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
        else return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
    },
    easeInQuint: function(t, b, _c, d) {
        var c = _c - b;
        return c * (t /= d) * t * t * t * t + b;
    },
    easeOutQuint: function(t, b, _c, d) {
        var c = _c - b;
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    },
    easeInOutQuint: function(t, b, _c, d) {
        var c = _c - b;
        if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
        else return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    },
    easeInSine: function(t, b, _c, d) {
        var c = _c - b;
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    },
    easeOutSine: function(t, b, _c, d) {
        var c = _c - b;
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
    },
    easeInOutSine: function(t, b, _c, d) {
        var c = _c - b;
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    },
    easeInExpo: function(t, b, _c, d) {
        var c = _c - b;
        return t == 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
    },
    easeOutExpo: function(t, b, _c, d) {
        var c = _c - b;
        return t == d ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    },
    easeInOutExpo: function(t, b, _c, d) {
        var c = _c - b;
        if (t === 0) return b;
        if (t === d) return b + c;
        if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
        else return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
    },
    easeInCirc: function(t, b, _c, d) {
        var c = _c - b;
        return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
    },
    easeOutCirc: function(t, b, _c, d) {
        var c = _c - b;
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    },
    easeInOutCirc: function(t, b, _c, d) {
        var c = _c - b;
        if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        else return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    },
    easeInElastic: function(t, b, _c, d) {
        var c = _c - b;
        var a, p, s;
        s = 1.70158;
        p = 0;
        a = c;
        if (t === 0) return b;
        else if ((t /= d) === 1) return b + c;
        if (!p) p = d * 0.3;
        if (a < Math.abs(c)) {
            a = c;
            s = p / 4;
        } else s = p / (2 * Math.PI) * Math.asin(c / a);
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    },
    easeOutElastic: function(t, b, _c, d) {
        var c = _c - b;
        var a, p, s;
        s = 1.70158;
        p = 0;
        a = c;
        if (t === 0) return b;
        else if ((t /= d) === 1) return b + c;
        if (!p) p = d * 0.3;
        if (a < Math.abs(c)) {
            a = c;
            s = p / 4;
        } else s = p / (2 * Math.PI) * Math.asin(c / a);
        return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
    },
    easeInOutElastic: function(t, b, _c, d) {
        var c = _c - b;
        var a, p, s;
        s = 1.70158;
        p = 0;
        a = c;
        if (t === 0) return b;
        else if ((t /= d / 2) === 2) return b + c;
        if (!p) p = d * (0.3 * 1.5);
        if (a < Math.abs(c)) {
            a = c;
            s = p / 4;
        } else s = p / (2 * Math.PI) * Math.asin(c / a);
        if (t < 1) return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        else return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
    },
    easeInBack: function(t, b, _c, d, s) {
        var c = _c - b;
        if (s === void 0) s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    easeOutBack: function(t, b, _c, d, s) {
        var c = _c - b;
        if (s === void 0) s = 1.70158;
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    easeInOutBack: function(t, b, _c, d, s) {
        var c = _c - b;
        if (s === void 0) s = 1.70158;
        if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
        else return c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
    },
    easeInBounce: function(t, b, _c, d) {
        var c = _c - b;
        var v;
        v = tweenFunctions.easeOutBounce(d - t, 0, c, d);
        return c - v + b;
    },
    easeOutBounce: function(t, b, _c, d) {
        var c = _c - b;
        if ((t /= d) < 1 / 2.75) return c * (7.5625 * t * t) + b;
        else if (t < 2 / 2.75) return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
        else if (t < 2.5 / 2.75) return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
        else return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
    },
    easeInOutBounce: function(t, b, _c, d) {
        var c = _c - b;
        var v;
        if (t < d / 2) {
            v = tweenFunctions.easeInBounce(t * 2, 0, c, d);
            return v * 0.5 + b;
        } else {
            v = tweenFunctions.easeOutBounce(t * 2 - d, 0, c, d);
            return v * 0.5 + c * 0.5 + b;
        }
    }
};
module.exports = tweenFunctions;

},{}],"9AS2t":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "Renderer", ()=>Renderer);
var _myMatrix = require("./my-matrix");
// #####################
// Web-GL Renderer
// #####################
class Renderer {
    beginFrame = (screenSize)=>{};
    start(matScreenFromWorld, textureIndex) {}
    addGlyph(x0, y0, x1, y1, tileInfo) {}
    addGlyphLit(x0, y0, x1, y1, tileInfo, lit) {}
    addGlyphLit4(x0, y0, x1, y1, tileInfo, lit) {}
    flush() {}
    constructor(canvas, tileSet, fontTileSet){
        this.tileSet = tileSet;
        this.fontTileSet = fontTileSet;
        const gl = canvas.getContext("webgl2", {
            alpha: false,
            depth: false
        });
        const textures = [
            fontTileSet.image,
            tileSet.image
        ].map((image)=>createTextureFromImage(gl, image));
        const vsSource = `#version 300 es
            in vec2 vPosition;
            in vec3 vTexcoord;
            in vec4 vColor;

            uniform mat4 uMatScreenFromWorld;

            out highp vec3 fTexcoord;
            out highp vec4 fColor;

            void main() {
                fTexcoord = vTexcoord;
                fColor = vColor;
                gl_Position = uMatScreenFromWorld * vec4(vPosition, 0, 1);
            }
        `;
        const fsSource = `#version 300 es
            in highp vec3 fTexcoord;
            in highp vec4 fColor;

            uniform highp sampler2DArray uOpacity;

            out lowp vec4 fragColor;

            void main() {
                fragColor = fColor * texture(uOpacity, fTexcoord);
            }
        `;
        const attribs = {
            vPosition: 0,
            vTexcoord: 1,
            vColor: 2
        };
        function colorLerp(color0, color1, u) {
            const r0 = color0 & 255;
            const g0 = color0 >> 8 & 255;
            const b0 = color0 >> 16 & 255;
            const a0 = color0 >> 24 & 255;
            const r1 = color1 & 255;
            const g1 = color1 >> 8 & 255;
            const b1 = color1 >> 16 & 255;
            const a1 = color1 >> 24 & 255;
            const r = Math.max(0, Math.min(255, Math.trunc(r0 + (r1 - r0) * u)));
            const g = Math.max(0, Math.min(255, Math.trunc(g0 + (g1 - g0) * u)));
            const b = Math.max(0, Math.min(255, Math.trunc(b0 + (b1 - b0) * u)));
            const a = Math.max(0, Math.min(255, Math.trunc(a0 + (a1 - a0) * u)));
            return r + (g << 8) + (b << 16) + (a << 24);
        }
        const tileRatios = [
            tileSet.tileSize[0] / tileSet.cellSize[0],
            tileSet.tileSize[1] / tileSet.cellSize[1]
        ];
        const program = initShaderProgram(gl, vsSource, fsSource, attribs);
        const uProjectionMatrixLoc = gl.getUniformLocation(program, "uMatScreenFromWorld");
        const uOpacityLoc = gl.getUniformLocation(program, "uOpacity");
        const maxQuads = 64;
        const numVertices = 4 * maxQuads;
        const bytesPerVertex = 2 * Float32Array.BYTES_PER_ELEMENT + 2 * Uint32Array.BYTES_PER_ELEMENT;
        const wordsPerQuad = bytesPerVertex; // divide by four bytes per word, but also multiply by four vertices per quad
        const vertexData = new ArrayBuffer(numVertices * bytesPerVertex);
        const vertexDataAsFloat32 = new Float32Array(vertexData);
        const vertexDataAsUint32 = new Uint32Array(vertexData);
        const vertexBuffer = gl.createBuffer();
        let numQuads = 0;
        const matScreenFromWorldCached = (0, _myMatrix.mat4).create();
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        gl.enableVertexAttribArray(attribs.vPosition);
        gl.enableVertexAttribArray(attribs.vTexcoord);
        gl.enableVertexAttribArray(attribs.vColor);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(attribs.vPosition, 2, gl.FLOAT, false, bytesPerVertex, 0);
        gl.vertexAttribPointer(attribs.vTexcoord, 3, gl.UNSIGNED_BYTE, false, bytesPerVertex, 8);
        gl.vertexAttribPointer(attribs.vColor, 4, gl.UNSIGNED_BYTE, true, bytesPerVertex, 12);
        gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.DYNAMIC_DRAW);
        const indexBuffer = createGlyphIndexBuffer(gl, maxQuads);
        gl.bindVertexArray(null);
        this.start = (matScreenFromWorld, textureIndex)=>{
            (0, _myMatrix.mat4).copy(matScreenFromWorldCached, matScreenFromWorld);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D_ARRAY, textures[textureIndex]);
        };
        this.addGlyph = (x0, y0, x1, y1, tileInfo)=>{
            if (tileInfo.textureIndex === undefined) return;
            if (numQuads >= maxQuads) this.flush();
            x1 = x0 + (x1 - x0) * tileRatios[0];
            y1 = y0 + (y1 - y0) * tileRatios[1];
            const color = tileInfo.color ? tileInfo.color : 0xffffffff;
            const i = numQuads * wordsPerQuad;
            const srcBase = tileInfo.textureIndex << 16;
            vertexDataAsFloat32[i + 0] = x0;
            vertexDataAsFloat32[i + 1] = y0;
            vertexDataAsUint32[i + 2] = srcBase + 256;
            vertexDataAsUint32[i + 3] = color;
            vertexDataAsFloat32[i + 4] = x1;
            vertexDataAsFloat32[i + 5] = y0;
            vertexDataAsUint32[i + 6] = srcBase + 257;
            vertexDataAsUint32[i + 7] = color;
            vertexDataAsFloat32[i + 8] = x0;
            vertexDataAsFloat32[i + 9] = y1;
            vertexDataAsUint32[i + 10] = srcBase;
            vertexDataAsUint32[i + 11] = color;
            vertexDataAsFloat32[i + 12] = x1;
            vertexDataAsFloat32[i + 13] = y1;
            vertexDataAsUint32[i + 14] = srcBase + 1;
            vertexDataAsUint32[i + 15] = color;
            ++numQuads;
        };
        this.addGlyphLit = (x0, y0, x1, y1, tileInfo, lit)=>{
            if (tileInfo.textureIndex === undefined) return;
            if (numQuads >= maxQuads) this.flush();
            x1 = x0 + (x1 - x0) * tileRatios[0];
            y1 = y0 + (y1 - y0) * tileRatios[1];
            const colorLit = tileInfo.color ? tileInfo.color : 0xffffffff;
            const colorUnlit = tileInfo.unlitColor ? tileInfo.unlitColor : 0xff505050;
            const color = colorLerp(colorUnlit, colorLit, lit ** 0.25);
            const i = numQuads * wordsPerQuad;
            const srcBase = tileInfo.textureIndex << 16;
            vertexDataAsFloat32[i + 0] = x0;
            vertexDataAsFloat32[i + 1] = y0;
            vertexDataAsUint32[i + 2] = srcBase + 256;
            vertexDataAsUint32[i + 3] = color;
            vertexDataAsFloat32[i + 4] = x1;
            vertexDataAsFloat32[i + 5] = y0;
            vertexDataAsUint32[i + 6] = srcBase + 257;
            vertexDataAsUint32[i + 7] = color;
            vertexDataAsFloat32[i + 8] = x0;
            vertexDataAsFloat32[i + 9] = y1;
            vertexDataAsUint32[i + 10] = srcBase;
            vertexDataAsUint32[i + 11] = color;
            vertexDataAsFloat32[i + 12] = x1;
            vertexDataAsFloat32[i + 13] = y1;
            vertexDataAsUint32[i + 14] = srcBase + 1;
            vertexDataAsUint32[i + 15] = color;
            ++numQuads;
        };
        this.addGlyphLit4 = (x0, y0, x1, y1, tileInfo, lit)=>{
            if (tileInfo.textureIndex === undefined) return;
            if (numQuads >= maxQuads) this.flush();
            const colorLit = tileInfo.color ? tileInfo.color : 0xffffffff;
            const colorUnlit = tileInfo.unlitColor ? tileInfo.unlitColor : 0xff505050;
            function colorInterpolated(u) {
                return colorLerp(colorUnlit, colorLit, u ** 0.25);
            }
            x1 = x0 + (x1 - x0) * tileRatios[0];
            y1 = y0 + (y1 - y0) * tileRatios[1];
            const i = numQuads * wordsPerQuad;
            const srcBase = tileInfo.textureIndex << 16;
            vertexDataAsFloat32[i + 0] = x0;
            vertexDataAsFloat32[i + 1] = y0;
            vertexDataAsUint32[i + 2] = srcBase + 256;
            vertexDataAsUint32[i + 3] = colorInterpolated(lit[0]);
            vertexDataAsFloat32[i + 4] = x1;
            vertexDataAsFloat32[i + 5] = y0;
            vertexDataAsUint32[i + 6] = srcBase + 257;
            vertexDataAsUint32[i + 7] = colorInterpolated(lit[1]);
            vertexDataAsFloat32[i + 8] = x0;
            vertexDataAsFloat32[i + 9] = y1;
            vertexDataAsUint32[i + 10] = srcBase;
            vertexDataAsUint32[i + 11] = colorInterpolated(lit[2]);
            vertexDataAsFloat32[i + 12] = x1;
            vertexDataAsFloat32[i + 13] = y1;
            vertexDataAsUint32[i + 14] = srcBase + 1;
            vertexDataAsUint32[i + 15] = colorInterpolated(lit[3]);
            ++numQuads;
        };
        this.flush = ()=>{
            if (numQuads <= 0) return;
            gl.useProgram(program);
            gl.bindVertexArray(vao);
            gl.uniform1i(uOpacityLoc, 0);
            gl.uniformMatrix4fv(uProjectionMatrixLoc, false, matScreenFromWorldCached);
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertexDataAsFloat32, 0);
            gl.drawElements(gl.TRIANGLES, 6 * numQuads, gl.UNSIGNED_SHORT, 0);
            gl.bindVertexArray(null);
            numQuads = 0;
        };
        this.beginFrame = (screenSize)=>{
            gl.viewport(0, 0, screenSize[0], screenSize[1]);
            gl.clear(gl.COLOR_BUFFER_BIT);
        };
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        gl.clearColor(0, 0, 0, 1);
    }
}
function createGlyphIndexBuffer(gl, maxQuads) {
    const indices = new Uint16Array(maxQuads * 6);
    for(let i = 0; i < maxQuads; ++i){
        let j = 6 * i;
        let k = 4 * i;
        indices[j + 0] = k + 0;
        indices[j + 1] = k + 1;
        indices[j + 2] = k + 2;
        indices[j + 3] = k + 2;
        indices[j + 4] = k + 1;
        indices[j + 5] = k + 3;
    }
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    return indexBuffer;
}
function createTextureFromImage(gl, image) {
    const numGlyphsX = 16;
    const numGlyphsY = 16;
    const numGlyphs = numGlyphsX * numGlyphsY;
    const srcGlyphSizeX = image.naturalWidth / numGlyphsX;
    const srcGlyphSizeY = image.naturalHeight / numGlyphsY;
    const scaleFactor = 4;
    const dstGlyphSizeX = srcGlyphSizeX * scaleFactor;
    const dstGlyphSizeY = srcGlyphSizeY * scaleFactor;
    // Rearrange the glyph data from a grid to a vertical array
    const canvas = document.createElement("canvas");
    canvas.width = dstGlyphSizeX;
    canvas.height = dstGlyphSizeY * numGlyphs;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    for(let y = 0; y < numGlyphsY; ++y)for(let x = 0; x < numGlyphsX; ++x){
        const sx = x * srcGlyphSizeX;
        const sy = y * srcGlyphSizeY;
        const dx = 0;
        const dy = (numGlyphsX * y + x) * dstGlyphSizeY;
        ctx.drawImage(image, sx, sy, srcGlyphSizeX, srcGlyphSizeY, dx, dy, dstGlyphSizeX, dstGlyphSizeY);
    }
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = new Uint8Array(imageData.data.buffer);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, gl.RGBA, dstGlyphSizeX, dstGlyphSizeY, numGlyphs, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
    return texture;
}
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }
    return shader;
}
function initShaderProgram(gl, vsSource, fsSource, attribs) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    for(const attrib in attribs)gl.bindAttribLocation(program, attribs[attrib], attrib);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) alert("Unable to initialize the shader program: " + gl.getProgramInfoLog(program));
    return program;
}

},{"./my-matrix":"21x0k","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"3SSZh":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "getTileSet", ()=>getTileSet);
parcelHelpers.export(exports, "getFontTileSet", ()=>getFontTileSet);
var _colorPreset = require("./color-preset");
const imageTileset31Color = require("e3a6a72e474edc4d");
const imageTilesetFont = require("f18515cbd1b4d5cd");
function getTileSet() {
    return tileSet31Color;
}
function getFontTileSet() {
    return basicFontTileset;
}
function r(x) {
    return x[1] * 16 + x[0];
}
const basicFontTileset = {
    name: "Basic Font",
    imageSrc: imageTilesetFont,
    image: new Image(),
    tileSize: [
        16,
        16
    ],
    offset: [
        0,
        0
    ],
    letterMap: [],
    background: {
        textureIndex: 219,
        color: 0xff101010
    },
    heart: {
        textureIndex: 3
    },
    air: {
        textureIndex: 9
    }
};
const colorWallUnlit = 0xffc0aaaa;
const colorWallLit = 0xffd0ffff;
const colorGroundUnlit = 0xff956a6a;
const colorGroundLit = 0xffd0f3ff;
const colorWoodFloorLit = 0xffc2e3ee;
const colorItemUnlit = 0xffb49090;
const tileSet31Color = {
    name: "31 Color Tileset",
    imageSrc: imageTileset31Color,
    image: new Image(),
    tileSize: [
        16,
        16
    ],
    cellSize: [
        16,
        16
    ],
    offset: [
        0,
        0
    ],
    flattenTexture: true,
    unlitTile: {
        textureIndex: r([
            0,
            0
        ])
    },
    namedTiles: {
        litPlayer: {
            textureIndex: 0xbc,
            color: 0xffffffff
        },
        pickTarget: {
            textureIndex: 0xbc,
            color: 0xffffffff
        },
        noise: {
            textureIndex: 0xbb,
            color: 0x80ffffff
        },
        crossHatch: {
            textureIndex: 3,
            color: 0xffffffff
        },
        patrolRoute: {
            textureIndex: 0x1f,
            color: 0xff80ff80
        },
        speechBubbleR: {
            textureIndex: 0xb7,
            color: 0xffffffff
        },
        speechBubbleL: {
            textureIndex: 0xb8,
            color: 0xffffffff
        }
    },
    touchButtons: {
        "menu": {
            textureIndex: r([
                11,
                1
            ]),
            color: 0xa0ffffff,
            unlitColor: 0x30ffffff
        },
        "up": {
            textureIndex: r([
                2,
                1
            ]),
            color: 0xa0ffffff,
            unlitColor: 0x30ffffff
        },
        "down": {
            textureIndex: r([
                3,
                1
            ]),
            color: 0xa0ffffff,
            unlitColor: 0x30ffffff
        },
        "left": {
            textureIndex: r([
                0,
                1
            ]),
            color: 0xa0ffffff,
            unlitColor: 0x30ffffff
        },
        "right": {
            textureIndex: r([
                1,
                1
            ]),
            color: 0xa0ffffff,
            unlitColor: 0x30ffffff
        },
        "wait": {
            textureIndex: r([
                4,
                1
            ]),
            color: 0xa0ffffff,
            unlitColor: 0x30ffffff
        },
        "jump": {
            textureIndex: r([
                5,
                1
            ]),
            color: 0xa0ffffff,
            unlitColor: 0x30ffffff
        },
        "menuAccept": {
            textureIndex: r([
                4,
                1
            ]),
            color: 0xa0ffffff,
            unlitColor: 0x30ffffff
        },
        "zoomOut": {
            textureIndex: r([
                6,
                1
            ]),
            color: 0xa0ffffff,
            unlitColor: 0x30ffffff
        },
        "zoomIn": {
            textureIndex: r([
                7,
                1
            ]),
            color: 0xa0ffffff,
            unlitColor: 0x30ffffff
        },
        "heal": {
            textureIndex: r([
                8,
                1
            ]),
            color: 0xa0ffffff,
            unlitColor: 0x30ffffff
        },
        "startLevel": {
            textureIndex: r([
                9,
                1
            ]),
            color: 0xa0ffffff,
            unlitColor: 0x30ffffff
        },
        "nextLevel": {
            textureIndex: r([
                9,
                1
            ]),
            color: 0xa0ffffff,
            unlitColor: 0x30ffffff
        },
        "forceRestart": {
            textureIndex: r([
                10,
                1
            ]),
            color: 0xa0ffffff,
            unlitColor: 0x30ffffff
        },
        "fullscreen": {
            textureIndex: r([
                14,
                1
            ]),
            color: 0xa0ffffff,
            unlitColor: 0x30ffffff
        }
    },
    terrainTiles: [
        {
            textureIndex: r([
                5,
                4
            ]),
            color: colorGroundLit,
            unlitColor: colorGroundUnlit
        },
        {
            textureIndex: r([
                8,
                4
            ]),
            color: colorGroundLit,
            unlitColor: colorGroundUnlit
        },
        {
            textureIndex: r([
                10,
                4
            ]),
            color: colorGroundLit,
            unlitColor: colorGroundUnlit
        },
        {
            textureIndex: r([
                0,
                4
            ]),
            color: colorGroundLit,
            unlitColor: colorGroundUnlit
        },
        {
            textureIndex: r([
                7,
                4
            ]),
            color: colorWoodFloorLit,
            unlitColor: colorGroundUnlit
        },
        {
            textureIndex: r([
                7,
                5
            ]),
            color: colorWoodFloorLit,
            unlitColor: colorGroundUnlit
        },
        {
            textureIndex: r([
                5,
                4
            ]),
            color: colorGroundLit,
            unlitColor: colorGroundUnlit
        },
        {
            textureIndex: r([
                0,
                2
            ]),
            color: colorWallLit,
            unlitColor: colorWallUnlit
        },
        {
            textureIndex: r([
                2,
                2
            ]),
            color: colorWallLit,
            unlitColor: colorWallUnlit
        },
        {
            textureIndex: r([
                4,
                2
            ]),
            color: colorWallLit,
            unlitColor: colorWallUnlit
        },
        {
            textureIndex: r([
                6,
                2
            ]),
            color: colorWallLit,
            unlitColor: colorWallUnlit
        },
        {
            textureIndex: r([
                1,
                2
            ]),
            color: colorWallLit,
            unlitColor: colorWallUnlit
        },
        {
            textureIndex: r([
                9,
                2
            ]),
            color: colorWallLit,
            unlitColor: colorWallUnlit
        },
        {
            textureIndex: r([
                8,
                2
            ]),
            color: colorWallLit,
            unlitColor: colorWallUnlit
        },
        {
            textureIndex: r([
                12,
                2
            ]),
            color: colorWallLit,
            unlitColor: colorWallUnlit
        },
        {
            textureIndex: r([
                3,
                2
            ]),
            color: colorWallLit,
            unlitColor: colorWallUnlit
        },
        {
            textureIndex: r([
                10,
                2
            ]),
            color: colorWallLit,
            unlitColor: colorWallUnlit
        },
        {
            textureIndex: r([
                7,
                2
            ]),
            color: colorWallLit,
            unlitColor: colorWallUnlit
        },
        {
            textureIndex: r([
                14,
                2
            ]),
            color: colorWallLit,
            unlitColor: colorWallUnlit
        },
        {
            textureIndex: r([
                5,
                2
            ]),
            color: colorWallLit,
            unlitColor: colorWallUnlit
        },
        {
            textureIndex: r([
                13,
                2
            ]),
            color: colorWallLit,
            unlitColor: colorWallUnlit
        },
        {
            textureIndex: r([
                11,
                2
            ]),
            color: colorWallLit,
            unlitColor: colorWallUnlit
        },
        {
            textureIndex: r([
                15,
                2
            ]),
            color: colorWallLit,
            unlitColor: colorWallUnlit
        },
        {
            textureIndex: r([
                0,
                3
            ]),
            color: colorWallLit,
            unlitColor: colorWallUnlit
        },
        {
            textureIndex: r([
                2,
                3
            ]),
            color: colorWallLit,
            unlitColor: colorWallUnlit
        },
        {
            textureIndex: r([
                3,
                3
            ]),
            color: colorWallLit,
            unlitColor: colorWallUnlit
        },
        {
            textureIndex: r([
                1,
                3
            ]),
            color: colorWallLit,
            unlitColor: colorWallUnlit
        },
        {
            textureIndex: r([
                11,
                3
            ]),
            color: colorWallLit,
            unlitColor: colorWallUnlit
        },
        {
            textureIndex: r([
                11,
                3
            ]),
            color: colorWallLit,
            unlitColor: colorWallUnlit
        },
        {
            textureIndex: r([
                8,
                3
            ]),
            color: colorWallLit,
            unlitColor: colorWallUnlit
        },
        {
            textureIndex: r([
                5,
                3
            ]),
            color: colorWallLit,
            unlitColor: colorWallUnlit
        },
        {
            textureIndex: r([
                8,
                4
            ]),
            color: colorGroundLit,
            unlitColor: colorGroundUnlit
        },
        {
            textureIndex: r([
                8,
                4
            ]),
            color: colorGroundLit,
            unlitColor: colorGroundUnlit
        }
    ],
    itemTiles: [
        {
            textureIndex: r([
                3,
                13
            ]),
            color: _colorPreset.white,
            unlitColor: colorItemUnlit
        },
        {
            textureIndex: r([
                4,
                13
            ]),
            color: _colorPreset.white,
            unlitColor: colorItemUnlit
        },
        {
            textureIndex: r([
                7,
                14
            ]),
            color: _colorPreset.white,
            unlitColor: colorItemUnlit
        },
        {
            textureIndex: r([
                8,
                14
            ]),
            color: _colorPreset.white,
            unlitColor: colorItemUnlit
        },
        {
            textureIndex: r([
                10,
                14
            ]),
            color: _colorPreset.white,
            unlitColor: colorItemUnlit
        },
        {
            textureIndex: r([
                9,
                14
            ]),
            color: _colorPreset.white,
            unlitColor: colorItemUnlit
        },
        {
            textureIndex: r([
                7,
                12
            ]),
            color: _colorPreset.white,
            unlitColor: colorItemUnlit
        },
        {
            textureIndex: r([
                5,
                12
            ]),
            color: _colorPreset.white,
            unlitColor: colorItemUnlit
        },
        {
            textureIndex: r([
                14,
                14
            ]),
            color: _colorPreset.white,
            unlitColor: colorItemUnlit
        },
        {
            textureIndex: r([
                2,
                13
            ]),
            color: _colorPreset.white,
            unlitColor: colorItemUnlit
        },
        {
            textureIndex: r([
                5,
                13
            ]),
            color: _colorPreset.white,
            unlitColor: _colorPreset.white
        },
        {
            textureIndex: r([
                15,
                11
            ]),
            color: _colorPreset.white,
            unlitColor: _colorPreset.white
        },
        {
            textureIndex: r([
                7,
                3
            ]),
            color: colorWallLit,
            unlitColor: colorWallUnlit
        },
        {
            textureIndex: r([
                4,
                3
            ]),
            color: colorWallLit,
            unlitColor: colorWallUnlit
        },
        {
            textureIndex: r([
                9,
                3
            ]),
            color: colorWallLit,
            unlitColor: colorWallUnlit
        },
        {
            textureIndex: r([
                6,
                3
            ]),
            color: colorWallLit,
            unlitColor: colorWallUnlit
        },
        {
            textureIndex: r([
                11,
                3
            ]),
            color: colorWallLit,
            unlitColor: colorWallUnlit
        },
        {
            textureIndex: r([
                11,
                3
            ]),
            color: colorWallLit,
            unlitColor: colorWallUnlit
        },
        {
            textureIndex: r([
                0,
                13
            ]),
            color: _colorPreset.white,
            unlitColor: _colorPreset.white
        },
        {
            textureIndex: r([
                1,
                13
            ]),
            color: _colorPreset.white,
            unlitColor: _colorPreset.white
        },
        {
            textureIndex: r([
                12,
                13
            ]),
            color: _colorPreset.yellowTint,
            unlitColor: _colorPreset.yellowTint
        },
        {
            textureIndex: r([
                0,
                15
            ]),
            color: _colorPreset.white,
            unlitColor: _colorPreset.white
        },
        {
            textureIndex: r([
                6,
                13
            ]),
            color: _colorPreset.white,
            unlitColor: _colorPreset.white
        },
        {
            textureIndex: r([
                1,
                15
            ]),
            color: _colorPreset.white,
            unlitColor: _colorPreset.white
        }
    ],
    npcTiles: [
        {
            textureIndex: r([
                3,
                8
            ]),
            color: _colorPreset.white,
            unlitColor: _colorPreset.darkGray
        },
        {
            textureIndex: r([
                2,
                8
            ]),
            color: _colorPreset.white,
            unlitColor: _colorPreset.darkGray
        },
        {
            textureIndex: r([
                4,
                8
            ]),
            color: _colorPreset.white,
            unlitColor: _colorPreset.darkGray
        },
        {
            textureIndex: r([
                1,
                8
            ]),
            color: _colorPreset.white,
            unlitColor: _colorPreset.darkGray
        },
        {
            textureIndex: r([
                3,
                8
            ]),
            color: _colorPreset.darkGray
        },
        {
            textureIndex: r([
                2,
                8
            ]),
            color: _colorPreset.darkGray
        },
        {
            textureIndex: r([
                4,
                8
            ]),
            color: _colorPreset.darkGray
        },
        {
            textureIndex: r([
                1,
                8
            ]),
            color: _colorPreset.darkGray
        },
        {
            textureIndex: r([
                3,
                8
            ]),
            color: _colorPreset.white,
            unlitColor: _colorPreset.darkGray
        },
        {
            textureIndex: r([
                2,
                8
            ]),
            color: _colorPreset.white,
            unlitColor: _colorPreset.darkGray
        },
        {
            textureIndex: r([
                4,
                8
            ]),
            color: _colorPreset.white,
            unlitColor: _colorPreset.darkGray
        },
        {
            textureIndex: r([
                1,
                8
            ]),
            color: _colorPreset.white,
            unlitColor: _colorPreset.darkGray
        },
        //KO'd
        {
            textureIndex: r([
                0,
                8
            ]),
            color: _colorPreset.white,
            unlitColor: _colorPreset.darkGray
        },
        {
            textureIndex: r([
                0,
                8
            ]),
            color: _colorPreset.white,
            unlitColor: _colorPreset.darkGray
        },
        {
            textureIndex: r([
                0,
                8
            ]),
            color: _colorPreset.white,
            unlitColor: _colorPreset.darkGray
        },
        {
            textureIndex: r([
                0,
                8
            ]),
            color: _colorPreset.white,
            unlitColor: _colorPreset.darkGray
        }
    ],
    playerTiles: {
        normal: {
            textureIndex: r([
                1,
                9
            ]),
            color: _colorPreset.white,
            unlitColor: _colorPreset.lightGray
        },
        hidden: {
            textureIndex: r([
                0,
                9
            ]),
            color: _colorPreset.white,
            unlitColor: _colorPreset.lightGray
        },
        right: {
            textureIndex: r([
                2,
                9
            ]),
            color: _colorPreset.white,
            unlitColor: _colorPreset.lightGray
        },
        left: {
            textureIndex: r([
                3,
                9
            ]),
            color: _colorPreset.white,
            unlitColor: _colorPreset.lightGray
        },
        down: {
            textureIndex: r([
                1,
                9
            ]),
            color: _colorPreset.white,
            unlitColor: _colorPreset.lightGray
        },
        up: {
            textureIndex: r([
                4,
                9
            ]),
            color: _colorPreset.white,
            unlitColor: _colorPreset.lightGray
        },
        dead: {
            textureIndex: r([
                5,
                9
            ]),
            color: _colorPreset.white,
            unlitColor: _colorPreset.lightGray
        }
    },
    guardStateTiles: [
        {
            textureIndex: r([
                0,
                11
            ])
        },
        {
            textureIndex: r([
                1,
                11
            ])
        },
        {
            textureIndex: r([
                2,
                11
            ])
        },
        {
            textureIndex: r([
                3,
                11
            ])
        },
        {
            textureIndex: r([
                4,
                11
            ])
        }
    ],
    ledgeTiles: [
        {
            textureIndex: r([
                12,
                0
            ]),
            color: 0xFF736847,
            unlitColor: 0xFF483428
        },
        {
            textureIndex: r([
                13,
                0
            ]),
            color: 0xFF736847,
            unlitColor: 0xFF483428
        },
        {
            textureIndex: r([
                14,
                0
            ]),
            color: 0xFF736847,
            unlitColor: 0xFF483428
        },
        {
            textureIndex: r([
                15,
                0
            ]),
            color: 0xFF736847,
            unlitColor: 0xFF483428
        }
    ],
    waterAnimation: [
        {
            textureIndex: 0x60,
            color: _colorPreset.yellowTint,
            unlitColor: _colorPreset.midGray
        },
        {
            textureIndex: 0x61,
            color: _colorPreset.yellowTint,
            unlitColor: _colorPreset.midGray
        },
        {
            textureIndex: 0x62,
            color: _colorPreset.yellowTint,
            unlitColor: _colorPreset.midGray
        },
        {
            textureIndex: 0x63,
            color: _colorPreset.yellowTint,
            unlitColor: _colorPreset.midGray
        }
    ],
    stoveAnimation: [
        {
            textureIndex: 0xee,
            color: _colorPreset.white,
            unlitColor: _colorPreset.midGray
        },
        {
            textureIndex: 0xef,
            color: _colorPreset.white,
            unlitColor: _colorPreset.midGray
        }
    ],
    candleAnimation: [
        {
            textureIndex: 0xe0,
            color: _colorPreset.yellowTint,
            unlitColor: _colorPreset.midGray
        },
        {
            textureIndex: 0xe1,
            color: _colorPreset.yellowTint,
            unlitColor: _colorPreset.midGray
        },
        {
            textureIndex: 0xe2,
            color: _colorPreset.yellowTint,
            unlitColor: _colorPreset.midGray
        },
        {
            textureIndex: 0xe3,
            color: _colorPreset.yellowTint,
            unlitColor: _colorPreset.midGray
        },
        {
            textureIndex: 0xd0,
            color: _colorPreset.yellowTint,
            unlitColor: _colorPreset.midGray
        }
    ],
    torchAnimation: [
        {
            textureIndex: 0xdc
        },
        {
            textureIndex: 0xdd
        },
        {
            textureIndex: 0xde
        },
        {
            textureIndex: 0xdf
        },
        {
            textureIndex: 0xdf
        }
    ]
};

},{"./color-preset":"37fo9","e3a6a72e474edc4d":"1YCFZ","f18515cbd1b4d5cd":"bEQAo","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"37fo9":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "black", ()=>black);
parcelHelpers.export(exports, "darkBlue", ()=>darkBlue);
parcelHelpers.export(exports, "darkGreen", ()=>darkGreen);
parcelHelpers.export(exports, "darkCyan", ()=>darkCyan);
parcelHelpers.export(exports, "darkRed", ()=>darkRed);
parcelHelpers.export(exports, "darkMagenta", ()=>darkMagenta);
parcelHelpers.export(exports, "darkBrown", ()=>darkBrown);
parcelHelpers.export(exports, "lighterGray", ()=>lighterGray);
parcelHelpers.export(exports, "lightGray", ()=>lightGray);
parcelHelpers.export(exports, "midGray", ()=>midGray);
parcelHelpers.export(exports, "darkGray", ()=>darkGray);
parcelHelpers.export(exports, "darkerGray", ()=>darkerGray);
parcelHelpers.export(exports, "darkestGray", ()=>darkestGray);
parcelHelpers.export(exports, "lightBlue", ()=>lightBlue);
parcelHelpers.export(exports, "lightGreen", ()=>lightGreen);
parcelHelpers.export(exports, "lightCyan", ()=>lightCyan);
parcelHelpers.export(exports, "lightRed", ()=>lightRed);
parcelHelpers.export(exports, "lightMagenta", ()=>lightMagenta);
parcelHelpers.export(exports, "lightYellow", ()=>lightYellow);
parcelHelpers.export(exports, "yellowTint", ()=>yellowTint);
parcelHelpers.export(exports, "darkerYellowTint", ()=>darkerYellowTint);
parcelHelpers.export(exports, "white", ()=>white);
const black = 0xff000000;
const darkBlue = 0xffa80000;
const darkGreen = 0xff00a800;
const darkCyan = 0xffa8a800;
const darkRed = 0xff0000a8;
const darkMagenta = 0xffa800a8;
const darkBrown = 0xff0054a8;
const lighterGray = 0xffd0d0d0;
const lightGray = 0xffa8a8a8;
const midGray = 0xff908080;
const darkGray = 0xff705050;
const darkerGray = 0xff604040;
const darkestGray = 0xff301010;
const lightBlue = 0xfffe5454;
const lightGreen = 0xff54fe54;
const lightCyan = 0xfffefe54;
const lightRed = 0xff5454fe;
const lightMagenta = 0xfffe54fe;
const lightYellow = 0xff54fefe;
const yellowTint = 0xffd0fefe;
const darkerYellowTint = 0xffc0eeee;
const white = 0xffffffff;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"1YCFZ":[function(require,module,exports) {
module.exports = require("4908690a836c7ba1").getBundleURL("lf1OY") + "tiles31color.eef502e2.png" + "?" + Date.now();

},{"4908690a836c7ba1":"lgJ39"}],"lgJ39":[function(require,module,exports) {
"use strict";
var bundleURL = {};
function getBundleURLCached(id) {
    var value = bundleURL[id];
    if (!value) {
        value = getBundleURL();
        bundleURL[id] = value;
    }
    return value;
}
function getBundleURL() {
    try {
        throw new Error();
    } catch (err) {
        var matches = ("" + err.stack).match(/(https?|file|ftp|(chrome|moz|safari-web)-extension):\/\/[^)\n]+/g);
        if (matches) // The first two stack frames will be this function and getBundleURLCached.
        // Use the 3rd one, which will be a runtime in the original bundle.
        return getBaseURL(matches[2]);
    }
    return "/";
}
function getBaseURL(url) {
    return ("" + url).replace(/^((?:https?|file|ftp|(chrome|moz|safari-web)-extension):\/\/.+)\/[^/]+$/, "$1") + "/";
} // TODO: Replace uses with `new URL(url).origin` when ie11 is no longer supported.
function getOrigin(url) {
    var matches = ("" + url).match(/(https?|file|ftp|(chrome|moz|safari-web)-extension):\/\/[^/]+/);
    if (!matches) throw new Error("Origin not found");
    return matches[0];
}
exports.getBundleURL = getBundleURLCached;
exports.getBaseURL = getBaseURL;
exports.getOrigin = getOrigin;

},{}],"bEQAo":[function(require,module,exports) {
module.exports = require("1e5eb13fe118761e").getBundleURL("lf1OY") + "font.e7668d7f.png" + "?" + Date.now();

},{"1e5eb13fe118761e":"lgJ39"}],"1vRTt":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "Howler", ()=>(0, _howler.Howler));
parcelHelpers.export(exports, "ActiveHowlPool", ()=>ActiveHowlPool);
parcelHelpers.export(exports, "HowlGroup", ()=>HowlGroup);
parcelHelpers.export(exports, "SubtitledHowlGroup", ()=>SubtitledHowlGroup);
parcelHelpers.export(exports, "setupSounds", ()=>setupSounds);
var _howler = require("howler");
var _random = require("./random");
const victorySong = require("d8be2bd7ee235459");
const levelRequirementJingle = require("2846b3fe1f8d0ace");
const levelCompleteJingle = require("40b99350e8e2f6cc");
const gameOverJingle = require("36f769a5f0dc43e6");
const easterEgg = require("40db36a513c976cc");
const footstepWood = require("1791be9b7c7eee03");
const footstepTile = require("34c8e3236e76c872");
const footstepWater = require("25e560b466ee46c9");
const footstepGravel = require("dd9ae501a09f49b5");
const footstepGrass = require("4d8e6a94e903bccb");
const footstepCreakSet = [
    require("4548c030266b51d7"),
    require("126501b655fa9afa"),
    require("e6ca3ad34aa458f3"),
    require("622a1db4690fe37d"),
    require("22c76dbbac11e9c8"),
    require("90003c50dc9dc398"),
    require("ee2c250460d76b76"),
    require("8c455b21134381da"),
    require("dce21359b6473004"),
    require("958728459ce5ad9")
];
const hitPlayerSet = [
    require("59cb5ab2c73f6758"),
    require("91b458e1c498a812"),
    require("e192c1b2c20aaf62"),
    require("d41593edbaa53ee4"),
    require("ac1de7689610792f"),
    require("36fad69d632fab09"),
    require("13bac3caa3992ca2")
];
const hitGuardSet = [
    require("36fad69d632fab09")
];
const coinSet = [
    require("2784580c96fffee8"),
    require("54f9824621755d5e"),
    require("3c8650e30ac0c35d"),
    require("62d89b46318d70c0"),
    require("bd31e4570f77526")
];
const gruntSet = [
    require("eb1c71a70afb7403"),
    require("ad188d1a6617e894"),
    require("a28119595675c465"),
    require("4148e9dead0ad061"),
    require("7cc54700e81f0cb2"),
    require("9f12e903f624967c"),
    require("6c7faa4701b34fb6"),
    require("61ead1e798c0f61e")
];
const douseSet = [
    require("cb75f8dce606e9cd"),
    require("b943464a88b1b153"),
    require("e3f5243a3059488b"),
    require("e6aa4943bd2b7c32")
];
const igniteSet = [
    require("380652c99ba87d6"),
    require("3973fc9e72324db5")
];
const hideSet = [
    require("2afb5681fb5aa605"),
    require("851741874f77a9ee"),
    require("ccb70b5667a4518a"),
    require("576285c07095594f"),
    require("48fff4ee20b1593d"),
    require("515be48043402fb2")
];
const gateSet = [
    require("11692f5099756fad"),
    require("48848c085391f7ee"),
    require("7ee8287e4980cca"),
    require("4987406cb0ca6036"),
    require("de21946c81ff8b45")
];
const splashSet = [
    require("973fe71d2b1c35b0"),
    require("f805b96600a628a3")
];
const waterEnterSet = [
    require("3c0254c5df21dfe0")
];
const waterExitSet = [
    require("bcbc13e2d5f1a4b6")
];
const jumpSet = [
    require("1505541a03324ba3"),
    require("7bdb88453d2751ac")
];
const tooHighSet = [
    require("77935f9ec1d69787"),
    require("5a7fe79a20e19bcb")
];
const guardSeeThiefSet = [
    [
        require("a6782583d3bcfab0"),
        "Hmm..."
    ],
    [
        require("61aaf127ae6233a3"),
        "What?"
    ],
    [
        require("332c88ebe5bffb92"),
        "Hey!"
    ],
    [
        require("379cfd599dca4a7"),
        "Hey!"
    ],
    [
        require("44e17fc55e40fdb5"),
        "Hey!"
    ],
    [
        require("eb32510d8a70fbf"),
        "What was that?"
    ],
    [
        require("20b041461dcd4dfe"),
        "What was that?"
    ],
    [
        require("9e772393541b208"),
        "What was that?"
    ],
    [
        require("7a7a25aefea189"),
        "What was that?"
    ],
    [
        require("711db0f041d33a26"),
        "What was that?"
    ],
    [
        require("d186312139fed697"),
        "Who goes there?"
    ],
    [
        require("91efe67cb2a41c7f"),
        "Huh?"
    ],
    [
        require("61aaf127ae6233a3"),
        "What?"
    ],
    [
        require("bf8228ece25758da"),
        "Wha..."
    ],
    [
        require("7c0e2da8c9873842"),
        "Wait!"
    ],
    [
        require("b79b89ec6acb7480"),
        "Who's there?"
    ],
    [
        require("877574795d6d50cc"),
        "What moved?"
    ],
    [
        require("3565284318cb4ff0"),
        "What's that\nin the shadows?"
    ],
    [
        require("33eadadb11f0bf4b"),
        "Did that\nshadow move?"
    ],
    [
        require("ea52f0c88dcdb982"),
        "I see\nsomething!"
    ],
    [
        require("9d42ba6cef670c72"),
        "Hello?"
    ],
    [
        require("f7ffeaac3d5e4ab6"),
        "Uhh..."
    ]
];
// TODO: We don't have a guard rest state to attach these too.
const guardRestSet = [
    [
        require("76b204aa1dbfe2d6"),
        "Ahh..."
    ],
    [
        require("433817c476ce7401"),
        "Aww..."
    ],
    [
        require("8e40265776cf5775"),
        "Quiet out..."
    ],
    [
        require("df93ca7613b78f6a"),
        "Rest me old\nbones..."
    ]
];
const guardFinishLookingSet = [
    [
        require("a6782583d3bcfab0"),
        "Hmm..."
    ],
    [
        require("61aaf127ae6233a3"),
        "What?"
    ],
    [
        require("eb32510d8a70fbf"),
        "What was that?"
    ],
    [
        require("8e40265776cf5775"),
        "Quiet out\nthere..."
    ],
    [
        require("a81d1c1900309603"),
        "Jumpy tonight..."
    ],
    [
        require("e2525562fa139099"),
        "Jumpin' at\nshadows!"
    ],
    [
        require("a6782583d3bcfab0"),
        "Hmm..."
    ],
    [
        require("c4c27d000d3384ff"),
        "Oh well..."
    ],
    [
        require("188f4a0cc9ea5c70"),
        "I've got myself\na case of the\njitters..."
    ],
    [
        require("c9aa2c5a42c61c63"),
        "I must be\nseein' things..."
    ],
    [
        require("18b1b67ff58ba9fd"),
        "What'd they put\nin my coffee?"
    ],
    [
        require("b119313e97e0882d"),
        "Coffee must be\ntoo strong!"
    ],
    [
        require("9fbd9249af5fc7ed"),
        "Hmm!\nNothing..."
    ],
    [
        require("ee3aeb6b650ef329"),
        "Well, I thought\nI saw something."
    ],
    [
        require("3dba1b9c2ddae2e4"),
        "Nothing..."
    ],
    [
        require("d4f743e02167d0fc"),
        "Hopefully\nnothing."
    ],
    [
        require("a3d7dff3b153d3e4"),
        "Seein' things,\nI guess."
    ],
    [
        require("a3d7dff3b153d3e4"),
        "Seein' things,\nI guess."
    ]
];
const guardHearThiefSet = [
    [
        require("a6782583d3bcfab0"),
        "Hmm..."
    ],
    [
        require("61aaf127ae6233a3"),
        "What?"
    ],
    [
        require("4fe8213e96106e18"),
        "What?"
    ],
    [
        require("332c88ebe5bffb92"),
        "Hey!"
    ],
    [
        require("379cfd599dca4a7"),
        "Hey!"
    ],
    [
        require("44e17fc55e40fdb5"),
        "Hey!"
    ],
    [
        require("eb32510d8a70fbf"),
        "What was that?"
    ],
    [
        require("20b041461dcd4dfe"),
        "What was that?"
    ],
    [
        require("9e772393541b208"),
        "What was that?"
    ],
    [
        require("7a7a25aefea189"),
        "What was that?"
    ],
    [
        require("711db0f041d33a26"),
        "What was that?"
    ],
    [
        require("91efe67cb2a41c7f"),
        "Huh?"
    ],
    [
        require("61aaf127ae6233a3"),
        "What?"
    ],
    [
        require("bf8228ece25758da"),
        "Wha..."
    ],
    [
        require("7c0e2da8c9873842"),
        "Wait!"
    ],
    [
        require("b79b89ec6acb7480"),
        "Who's there?"
    ],
    [
        require("9d42ba6cef670c72"),
        "Hello?"
    ],
    [
        require("f7ffeaac3d5e4ab6"),
        "Uhh..."
    ],
    [
        require("7ac555b7fb9898e5"),
        "Hark?"
    ],
    [
        require("4a61fcff714a7344"),
        "What was that noise?"
    ],
    [
        require("4a61fcff714a7344"),
        "What was that noise?"
    ],
    [
        require("3fddc47090cc7cc"),
        "I heard something..."
    ],
    [
        require("3fddc47090cc7cc"),
        "I heard something..."
    ]
];
const guardFinishListeningSet = [
    [
        require("a6782583d3bcfab0"),
        "Hmm..."
    ],
    [
        require("a81d1c1900309603"),
        "Jumpy tonight..."
    ],
    [
        require("c4c27d000d3384ff"),
        "Oh well..."
    ],
    [
        require("188f4a0cc9ea5c70"),
        "I've got myself\na case of the\njitters..."
    ],
    [
        require("18b1b67ff58ba9fd"),
        "What's in my\ncoffee today?"
    ],
    [
        require("b119313e97e0882d"),
        "Coffee must be\ntoo strong!"
    ],
    [
        require("9fbd9249af5fc7ed"),
        "Hmm!\nNothing..."
    ],
    [
        require("9272bd200d73707c"),
        "Well, I can't\nhear it now."
    ],
    [
        require("3dba1b9c2ddae2e4"),
        "Nothing..."
    ],
    [
        require("d4f743e02167d0fc"),
        "Hopefully\nnothing."
    ],
    [
        require("cf7d91cc8f4443bf"),
        "I must be\nhearing things."
    ]
];
const guardInvestigateSet = [
    [
        require("a6782583d3bcfab0"),
        "Hmm..."
    ],
    [
        require("332c88ebe5bffb92"),
        "Hey!"
    ],
    [
        require("379cfd599dca4a7"),
        "Hey!"
    ],
    [
        require("44e17fc55e40fdb5"),
        "Hey!"
    ],
    [
        require("61aaf127ae6233a3"),
        "What?"
    ],
    [
        require("244cdea9e71c8ba5"),
        "That noise\nagain?"
    ],
    [
        require("a1065a3881bff421"),
        "Someone's there!"
    ],
    [
        require("c752f7d2c650037"),
        "Who could\nthat be?"
    ],
    [
        require("ea5dd47a39cb99be"),
        "Better check\nit out."
    ],
    [
        require("d9ae76cbc6f63795"),
        "That better\nbe rats!"
    ],
    [
        require("7168138f684b7578"),
        "Who is that?"
    ],
    [
        require("2426022d8c68304d"),
        "Come out, come out\nwherever you are!"
    ]
];
// TODO: When the thief has been chased, many of these lines will no longer seem appropriate
// Perhaps need to disambiguate the state in some way 
// (guardFinishedInvestgiateButUnseen gaurdFinishedInvestigateAndSeen or something)
const guardFinishInvestigatingSet = [
    [
        require("a6782583d3bcfab0"),
        "Hmm..."
    ],
    [
        require("e2525562fa139099"),
        "Jumpin' at\nshadows!"
    ],
    [
        require("a81d1c1900309603"),
        "Jumpy!"
    ],
    [
        require("c4c27d000d3384ff"),
        "Oh, well."
    ],
    [
        require("d6cb7af44352bbf2"),
        "Guess it was\nnothing."
    ],
    [
        require("adf6ffd37ae1dbd0"),
        "Wonder what it was."
    ],
    [
        require("4b676e6456899be1"),
        "Back to my post."
    ],
    [
        require("e6c5feb70a10ac51"),
        "All quiet now."
    ],
    [
        require("d3d77cf9e69c828a"),
        "I'm sure I\nheard something."
    ],
    [
        require("25eba2c8e406d957"),
        "Not there anymore."
    ],
    [
        require("19ca2d8dcdde6987"),
        "Probably nothing."
    ],
    [
        require("9fbd9249af5fc7ed"),
        "Hmm!\nNothing."
    ],
    [
        require("5e00908d021a313a"),
        "I don't know why\nI work here."
    ],
    [
        require("32b0bcbf45dfc08f"),
        "Waste of my time."
    ],
    [
        require("efaebfea4a23d1a6"),
        "Why do I\neven try?"
    ],
    [
        require("6785b00738f913bc"),
        "At least I'm not\non cleaning duty."
    ],
    [
        require("607f1b10dbd9d132"),
        "At least my\nshift ends soon."
    ],
    [
        require("42f7ecfc8e93ade4"),
        "What do you\nwant me to\ndo about it?"
    ]
];
// TODO: If we split this group up for guards that are in the same room vs another room
// we could use more of these
const guardHearGuardSet = [
    [
        require("44e17fc55e40fdb5"),
        "Hey!"
    ],
    [
        require("61aaf127ae6233a3"),
        "What?"
    ],
    // [require('url:./audio/guards/where.mp3'), 'Where!?'],
    [
        require("7ec1f7d563f050b2"),
        "Coming!"
    ],
    // [require('url:./audio/guards/here I come.mp3'), 'Here I come!'],
    [
        require("13e6bee2a33afad8"),
        "To arms!"
    ]
];
const guardChaseSet = [
    [
        require("1548059b57afcb5b"),
        "(Whistle)"
    ],
    [
        require("e492fd85f9832fed"),
        "(Whistle)"
    ],
    [
        require("86c6bfaa821c33a0"),
        "(Whistle)"
    ],
    [
        require("2494c24e0559a596"),
        "Get 'em!"
    ],
    [
        require("dea94d3a4ffe309d"),
        "Intruder!"
    ],
    [
        require("c16d7ebbd6a319d9"),
        "Oh no...\nIt's a thief!"
    ],
    [
        require("8d0babdd13b4f1d1"),
        "We're coming\nfor you!"
    ],
    [
        require("b22d077dabee1bd2"),
        "Coming for you!"
    ],
    [
        require("97a353f66fd6259"),
        "Halt!"
    ],
    [
        require("28733b2c5c3da8b5"),
        "We see you!"
    ],
    [
        require("40cd6301a73c0854"),
        "I'll get you!"
    ],
    [
        require("13956e26f1e89dee"),
        "You're a goner!"
    ],
    [
        require("84b1e6a929ccffc7"),
        "Just you wait!"
    ],
    [
        require("369e58dbc629a38d"),
        "You won't get away!"
    ],
    [
        require("a014c5eb65ddf401"),
        "No you don't!"
    ],
    [
        require("e687a3a3b764bfd0"),
        "Thief!"
    ],
    [
        require("44fa829dafc10ef9"),
        "Thief!"
    ],
    [
        require("3110f0d4b92ac603"),
        "Thief!"
    ],
    [
        require("bc29c05f64ef3090"),
        "After them!"
    ],
    [
        require("7501d9826ab3a78e"),
        "What is thy business\nwith this gold?"
    ],
    [
        require("3d2e4a631d22f43"),
        "No mercy for\nthe wicked!"
    ]
];
const guardEndChaseSet = [
    [
        require("d542a1fac8e3437"),
        "Lost 'im!"
    ],
    [
        require("29890f6cbdea9ec1"),
        "Must have\nrun off..."
    ],
    [
        require("c4c27d000d3384ff"),
        "Oh, well..."
    ],
    [
        require("7b8a1bb5a3e2eb5c"),
        "Where did they go?"
    ],
    [
        require("25c5e92bbc6a2994"),
        "His Holiness would\nnot be pleased!"
    ],
    [
        require("1669eba1dcb42b00"),
        "The boss will\nnot be pleased!"
    ],
    [
        require("1680c2c9f735cab7"),
        "I give up!"
    ],
    [
        require("70f2e192489111a4"),
        "Where did he go!?"
    ],
    [
        require("1c97cad2f0fc1da3"),
        "Drats!\nLost him!"
    ],
    [
        require("61f27516438c7a6d"),
        "Gone!"
    ],
    [
        require("2386f10e544f2d4d"),
        "Come back here!"
    ],
    [
        require("e5493c8061fb9002"),
        "Rotten scoundrel!"
    ],
    [
        require("31afdcdb85a8c09"),
        "Aargh!!"
    ],
    [
        require("277c37ae4c873074"),
        "He's not coming back!"
    ],
    [
        require("976243abc04d61a8"),
        "Blast!"
    ],
    [
        require("34ac8808828d77cd"),
        "Don't come back!"
    ],
    [
        require("f830afe20d11b271"),
        "You won't\nget away\nnext time!"
    ],
    [
        require("5c4371ce2c6163c6"),
        "His Holiness is a\nlord of mercy!"
    ],
    [
        require("aa1891424451254c"),
        "What a lousy day\nat work!"
    ],
    [
        require("2316a6f9edba15da"),
        "I give up..."
    ],
    [
        require("34537cd137208624"),
        "What do I do?\nHelp me, help me..."
    ],
    [
        require("680749970a32616b"),
        "Oh no,\nhe got away!"
    ],
    [
        require("c3e623bfebaf2956"),
        "(Guard rant)"
    ]
];
const guardAwakesWarningSet = [
    [
        require("76b204aa1dbfe2d6"),
        "Someone smacked me!"
    ],
    [
        require("76b204aa1dbfe2d6"),
        "Someone hit me!"
    ],
    [
        require("76b204aa1dbfe2d6"),
        "Who hit me!?"
    ]
];
const guardDownWarningSet = [
    [
        require("76b204aa1dbfe2d6"),
        "We have a guard down!"
    ],
    [
        require("76b204aa1dbfe2d6"),
        "Man down!"
    ],
    [
        require("76b204aa1dbfe2d6"),
        "Guard down!"
    ]
];
const guardStirringSet = [
    [
        require("76b204aa1dbfe2d6"),
        "Ahh..."
    ]
];
const guardWarningResponseSet = [
    [
        require("dea94d3a4ffe309d"),
        "We must have\nan intruder!"
    ],
    [
        require("dea94d3a4ffe309d"),
        "I will keep\nan eye out!"
    ]
];
const guardDamageSet = [
    [
        require("f1fa5a78c991b754"),
        "Take that!!"
    ],
    [
        require("bfc6269fbcfac317"),
        "Oof!!"
    ],
    [
        require("33d2b94f6b7b0747"),
        "Ugg!!"
    ],
    [
        require("ba961ce8902149a2"),
        "Ahh!!"
    ],
    [
        require("10bebf0e4d73d8e9"),
        "Ahh!!"
    ],
    [
        require("c754db0b3f0fc35"),
        "Hi-yah!"
    ],
    [
        require("92683cf3422bcd3a"),
        "Hi-yah!"
    ],
    [
        require("9ee996622054dedc"),
        "Hi-yah!"
    ]
];
class ActiveHowlPool {
    constructor(){
        this.activeHowls = [];
        this.activeLimit = 2;
        this.fadeTime = 1000;
    }
    setFadetime(time = 1000) {
        this.fadeTime = time;
        return this;
    }
    fade(howl, id) {
        if (this.fadeTime > 0) {
            howl.fade(1, 0, this.fadeTime, id);
            setTimeout(()=>howl.stop(id), this.fadeTime);
        } else howl.stop(id);
        return this;
    }
    empty() {
        for (let hDat of this.activeHowls)this.fade(...hDat);
        this.activeHowls = [];
        return this;
    }
    queue(howl, id) {
        this.activeHowls.unshift([
            howl,
            id
        ]);
        if (this.activeHowls.length > this.activeLimit) {
            const hDat = this.activeHowls.pop();
            this.fade(...hDat);
        }
        this.activeHowls = this.activeHowls.slice(0, this.activeLimit);
        return this;
    }
}
class HowlGroup {
    constructor(files, soundPool = null){
        this.howls = files.map((file)=>new (0, _howler.Howl)({
                src: [
                    file
                ]
            }));
        this.howlNum = 0;
        this.soundPool = soundPool;
        (0, _random.shuffleArray)(this.howls);
    }
    play(volume) {
        const howl = this.next();
        howl.volume(volume);
        try {
            const id = howl.play();
            if (this.soundPool !== null) this.soundPool.queue(howl, id);
            return id;
        } catch (error) {
            console.log(`Audio playback error ${howl}`, error);
        }
        return -1;
    }
    next() {
        this.howlNum++;
        if (this.howlNum == this.howls.length) {
            this.howlNum = 0;
            (0, _random.shuffleArray)(this.howls);
        }
        return this.howls[this.howlNum];
    }
}
class SubtitledHowlGroup {
    constructor(filesAndSubtitles, soundPool = null){
        this.sounds = filesAndSubtitles.map(makeSubtitledSound);
        this.soundNum = 0;
        this.soundPool = soundPool;
        this.mute = false;
        (0, _random.shuffleArray)(this.sounds);
    }
    play(volume) {
        const subSound = this.next();
        if (!this.mute) {
            subSound.sound.volume(volume);
            const id = subSound.sound.play();
            if (this.soundPool !== null) this.soundPool.queue(subSound.sound, id);
        }
        return subSound;
    }
    next() {
        const subtitledSound = this.sounds[this.soundNum];
        ++this.soundNum;
        if (this.soundNum === this.sounds.length) {
            this.soundNum = 0;
            (0, _random.shuffleArray)(this.sounds);
        }
        return subtitledSound;
    }
}
function makeSubtitledSound(fileAndSub) {
    return {
        sound: new (0, _howler.Howl)({
            src: [
                fileAndSub[0]
            ]
        }),
        subtitle: fileAndSub[1]
    };
}
function setupSounds(sounds, subtitledSounds, howlPool) {
    sounds.footstepWood = new HowlGroup([
        footstepWood
    ]);
    sounds.footstepTile = new HowlGroup([
        footstepTile
    ]);
    sounds.footstepWater = new HowlGroup([
        footstepWater
    ]);
    sounds.footstepGravel = new HowlGroup([
        footstepGravel
    ]);
    sounds.footstepGrass = new HowlGroup([
        footstepGrass
    ]);
    sounds.footstepCreaky = new HowlGroup(footstepCreakSet);
    sounds.victorySong = new HowlGroup([
        victorySong
    ]);
    sounds.levelRequirementJingle = new HowlGroup([
        levelRequirementJingle
    ], howlPool);
    sounds.levelCompleteJingle = new HowlGroup([
        levelCompleteJingle
    ], howlPool);
    sounds.gameOverJingle = new HowlGroup([
        gameOverJingle
    ], howlPool);
    sounds.easterEgg = new HowlGroup([
        easterEgg
    ], howlPool);
    sounds.hitPlayer = new HowlGroup(hitPlayerSet);
    sounds.hitGuard = new HowlGroup(hitGuardSet);
    sounds.coin = new HowlGroup(coinSet);
    sounds.grunt = new HowlGroup(gruntSet), sounds.douse = new HowlGroup(douseSet), sounds.ignite = new HowlGroup(igniteSet), sounds.hide = new HowlGroup(hideSet), sounds.gate = new HowlGroup(gateSet), sounds.splash = new HowlGroup(splashSet), sounds.waterEnter = new HowlGroup(waterEnterSet), sounds.waterExit = new HowlGroup(waterExitSet), sounds.jump = new HowlGroup(jumpSet), sounds.tooHigh = new HowlGroup(tooHighSet), subtitledSounds.guardInvestigate = new SubtitledHowlGroup(guardInvestigateSet, howlPool);
    subtitledSounds.guardFinishInvestigating = new SubtitledHowlGroup(guardFinishInvestigatingSet, howlPool);
    subtitledSounds.guardSeeThief = new SubtitledHowlGroup(guardSeeThiefSet), howlPool;
    subtitledSounds.guardFinishLooking = new SubtitledHowlGroup(guardFinishLookingSet, howlPool);
    subtitledSounds.guardChase = new SubtitledHowlGroup(guardChaseSet, howlPool);
    subtitledSounds.guardEndChase = new SubtitledHowlGroup(guardEndChaseSet, howlPool);
    subtitledSounds.guardHearGuard = new SubtitledHowlGroup(guardHearGuardSet, howlPool);
    subtitledSounds.guardHearThief = new SubtitledHowlGroup(guardHearThiefSet, howlPool);
    subtitledSounds.guardAwakesWarning = new SubtitledHowlGroup(guardAwakesWarningSet, howlPool);
    subtitledSounds.guardDownWarning = new SubtitledHowlGroup(guardDownWarningSet, howlPool);
    subtitledSounds.guardWarningResponse = new SubtitledHowlGroup(guardWarningResponseSet, howlPool);
    subtitledSounds.guardFinishListening = new SubtitledHowlGroup(guardFinishListeningSet, howlPool);
    subtitledSounds.guardDamage = new SubtitledHowlGroup(guardDamageSet, howlPool);
    subtitledSounds.guardStirring = new SubtitledHowlGroup(guardStirringSet, howlPool);
    subtitledSounds.guardRest = new SubtitledHowlGroup(guardRestSet, howlPool);
}

},{"howler":"5Vjgk","./random":"gUC1v","d8be2bd7ee235459":"9zKUC","2846b3fe1f8d0ace":"cHoSB","40b99350e8e2f6cc":"iNzdT","36f769a5f0dc43e6":"04Z21","40db36a513c976cc":"1SIsy","1791be9b7c7eee03":"9JVPU","34c8e3236e76c872":"fGTkM","25e560b466ee46c9":"k14gH","dd9ae501a09f49b5":"5GAcE","4d8e6a94e903bccb":"f1aB8","4548c030266b51d7":"kGQAb","126501b655fa9afa":"2XGfn","e6ca3ad34aa458f3":"2r6eZ","622a1db4690fe37d":"7ei1H","22c76dbbac11e9c8":"jg9uN","90003c50dc9dc398":"gj9kS","ee2c250460d76b76":"26zV0","8c455b21134381da":"5s0T0","dce21359b6473004":"36S8f","958728459ce5ad9":"6ptWC","59cb5ab2c73f6758":"dvdqa","91b458e1c498a812":"aBtts","e192c1b2c20aaf62":"8mLsA","d41593edbaa53ee4":"ajJoe","ac1de7689610792f":"wy2ST","36fad69d632fab09":"jPeF6","13bac3caa3992ca2":"2ZtkO","2784580c96fffee8":"jZaET","54f9824621755d5e":"4dkLh","3c8650e30ac0c35d":"kvn87","62d89b46318d70c0":"JMLiq","bd31e4570f77526":"8Lw3Q","eb1c71a70afb7403":"2nUq5","ad188d1a6617e894":"lHBqN","a28119595675c465":"4X6eo","4148e9dead0ad061":"ltpKK","7cc54700e81f0cb2":"iPB70","9f12e903f624967c":"9tbU5","6c7faa4701b34fb6":"a46JQ","61ead1e798c0f61e":"epH9n","cb75f8dce606e9cd":"dwcOP","b943464a88b1b153":"4Rqw7","e3f5243a3059488b":"hEMO1","e6aa4943bd2b7c32":"6uN4N","380652c99ba87d6":"denBs","3973fc9e72324db5":"ai87a","2afb5681fb5aa605":"e4yW2","851741874f77a9ee":"e0rLU","ccb70b5667a4518a":"5mFUd","576285c07095594f":"e5ksw","48fff4ee20b1593d":"bFfhf","515be48043402fb2":"ewAQQ","11692f5099756fad":"gELii","48848c085391f7ee":"5nU87","7ee8287e4980cca":"7uWJZ","4987406cb0ca6036":"bYumL","de21946c81ff8b45":"6gY1x","973fe71d2b1c35b0":"fTvDo","f805b96600a628a3":"3E807","3c0254c5df21dfe0":"8n85h","bcbc13e2d5f1a4b6":"3Nd3F","1505541a03324ba3":"2vWH3","7bdb88453d2751ac":"8rRS9","77935f9ec1d69787":"iQKP6","5a7fe79a20e19bcb":"5Wuxs","a6782583d3bcfab0":"s2Q2L","61aaf127ae6233a3":"224to","332c88ebe5bffb92":"fzuGN","379cfd599dca4a7":"6RqV3","44e17fc55e40fdb5":"h3YyP","eb32510d8a70fbf":"3zmDf","20b041461dcd4dfe":"bVmQ3","9e772393541b208":"9Ktkp","7a7a25aefea189":"9x3D3","711db0f041d33a26":"fd0c0","d186312139fed697":"hqU6N","91efe67cb2a41c7f":"bx4BT","bf8228ece25758da":"ffzGR","7c0e2da8c9873842":"cghPs","b79b89ec6acb7480":"8T7H4","877574795d6d50cc":"7z9d9","3565284318cb4ff0":"agX7A","33eadadb11f0bf4b":"8aQyK","ea52f0c88dcdb982":"dJQsj","9d42ba6cef670c72":"gKhEi","f7ffeaac3d5e4ab6":"lITH8","76b204aa1dbfe2d6":"2E6Ey","433817c476ce7401":"g90E0","8e40265776cf5775":"inZis","df93ca7613b78f6a":"eBH2o","a81d1c1900309603":"cFuxm","e2525562fa139099":"gCVVo","c4c27d000d3384ff":"7tUMg","188f4a0cc9ea5c70":"LWHfM","c9aa2c5a42c61c63":"3taIr","18b1b67ff58ba9fd":"6HKZl","b119313e97e0882d":"9s0IZ","9fbd9249af5fc7ed":"bmUje","ee3aeb6b650ef329":"r8pEn","3dba1b9c2ddae2e4":"gmBDQ","d4f743e02167d0fc":"cZw51","a3d7dff3b153d3e4":"cnzN4","4fe8213e96106e18":"jefVX","7ac555b7fb9898e5":"aPaoT","4a61fcff714a7344":"g0dhG","3fddc47090cc7cc":"kDwJ2","9272bd200d73707c":"2x9nC","cf7d91cc8f4443bf":"9fVaC","244cdea9e71c8ba5":"k1uRF","a1065a3881bff421":"fLNJF","c752f7d2c650037":"chTre","ea5dd47a39cb99be":"2QvYX","d9ae76cbc6f63795":"5V3sW","7168138f684b7578":"8PECt","2426022d8c68304d":"abuDI","d6cb7af44352bbf2":"39DEl","adf6ffd37ae1dbd0":"3kmal","4b676e6456899be1":"85RTq","e6c5feb70a10ac51":"6JYFN","d3d77cf9e69c828a":"8o6R6","25eba2c8e406d957":"g7juJ","19ca2d8dcdde6987":"2IFEg","5e00908d021a313a":"bCvEE","32b0bcbf45dfc08f":"iI2P6","efaebfea4a23d1a6":"fTTTf","6785b00738f913bc":"in1Yk","607f1b10dbd9d132":"4sFml","42f7ecfc8e93ade4":"8DCSZ","7ec1f7d563f050b2":"8HYPW","13e6bee2a33afad8":"gCSP7","1548059b57afcb5b":"94LvL","e492fd85f9832fed":"aD2F4","86c6bfaa821c33a0":"1ZglP","2494c24e0559a596":"k7f64","dea94d3a4ffe309d":"cZ0PT","c16d7ebbd6a319d9":"4FfLU","8d0babdd13b4f1d1":"4WptE","b22d077dabee1bd2":"eODND","97a353f66fd6259":"hZ2B8","28733b2c5c3da8b5":"AMRHc","40cd6301a73c0854":"6UCsk","13956e26f1e89dee":"g7XAg","84b1e6a929ccffc7":"cFlu7","369e58dbc629a38d":"7FJ37","a014c5eb65ddf401":"3Hs3x","e687a3a3b764bfd0":"coNMD","44fa829dafc10ef9":"4s9gT","3110f0d4b92ac603":"ikayr","bc29c05f64ef3090":"bUSG1","7501d9826ab3a78e":"gs4UN","3d2e4a631d22f43":"j5cRJ","d542a1fac8e3437":"hF47h","29890f6cbdea9ec1":"kYZUc","7b8a1bb5a3e2eb5c":"lqrS2","25c5e92bbc6a2994":"kbO4H","1669eba1dcb42b00":"ckkdt","1680c2c9f735cab7":"3WyJt","70f2e192489111a4":"hlHmX","1c97cad2f0fc1da3":"hIFxo","61f27516438c7a6d":"7eQ6w","2386f10e544f2d4d":"2Pk6f","e5493c8061fb9002":"jovj4","31afdcdb85a8c09":"c3U1l","277c37ae4c873074":"b2ME2","976243abc04d61a8":"lMgKq","34ac8808828d77cd":"8hWQ7","f830afe20d11b271":"f4Hq0","5c4371ce2c6163c6":"2Bc7G","aa1891424451254c":"4bzJ9","2316a6f9edba15da":"lvXdP","34537cd137208624":"gPuPz","680749970a32616b":"iZ55y","c3e623bfebaf2956":"cvhbf","f1fa5a78c991b754":"bgYzw","bfc6269fbcfac317":"fmwYX","33d2b94f6b7b0747":"1sAT4","ba961ce8902149a2":"iT3UI","10bebf0e4d73d8e9":"HN7wh","c754db0b3f0fc35":"6mKlg","92683cf3422bcd3a":"b3mdd","9ee996622054dedc":"iyQcS","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"5Vjgk":[function(require,module,exports) {
var global = arguments[3];
/*!
 *  howler.js v2.2.3
 *  howlerjs.com
 *
 *  (c) 2013-2020, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */ (function() {
    "use strict";
    /** Global Methods **/ /***************************************************************************/ /**
   * Create the global controller. All contained methods and properties apply
   * to all sounds that are currently playing or will be in the future.
   */ var HowlerGlobal1 = function() {
        this.init();
    };
    HowlerGlobal1.prototype = {
        /**
     * Initialize the global Howler object.
     * @return {Howler}
     */ init: function() {
            var self = this || Howler1;
            // Create a global ID counter.
            self._counter = 1000;
            // Pool of unlocked HTML5 Audio objects.
            self._html5AudioPool = [];
            self.html5PoolSize = 10;
            // Internal properties.
            self._codecs = {};
            self._howls = [];
            self._muted = false;
            self._volume = 1;
            self._canPlayEvent = "canplaythrough";
            self._navigator = typeof window !== "undefined" && window.navigator ? window.navigator : null;
            // Public properties.
            self.masterGain = null;
            self.noAudio = false;
            self.usingWebAudio = true;
            self.autoSuspend = true;
            self.ctx = null;
            // Set to false to disable the auto audio unlocker.
            self.autoUnlock = true;
            // Setup the various state values for global tracking.
            self._setup();
            return self;
        },
        /**
     * Get/set the global volume for all sounds.
     * @param  {Float} vol Volume from 0.0 to 1.0.
     * @return {Howler/Float}     Returns self or current volume.
     */ volume: function(vol) {
            var self = this || Howler1;
            vol = parseFloat(vol);
            // If we don't have an AudioContext created yet, run the setup.
            if (!self.ctx) setupAudioContext();
            if (typeof vol !== "undefined" && vol >= 0 && vol <= 1) {
                self._volume = vol;
                // Don't update any of the nodes if we are muted.
                if (self._muted) return self;
                // When using Web Audio, we just need to adjust the master gain.
                if (self.usingWebAudio) self.masterGain.gain.setValueAtTime(vol, Howler1.ctx.currentTime);
                // Loop through and change volume for all HTML5 audio nodes.
                for(var i = 0; i < self._howls.length; i++)if (!self._howls[i]._webAudio) {
                    // Get all of the sounds in this Howl group.
                    var ids = self._howls[i]._getSoundIds();
                    // Loop through all sounds and change the volumes.
                    for(var j = 0; j < ids.length; j++){
                        var sound = self._howls[i]._soundById(ids[j]);
                        if (sound && sound._node) sound._node.volume = sound._volume * vol;
                    }
                }
                return self;
            }
            return self._volume;
        },
        /**
     * Handle muting and unmuting globally.
     * @param  {Boolean} muted Is muted or not.
     */ mute: function(muted) {
            var self = this || Howler1;
            // If we don't have an AudioContext created yet, run the setup.
            if (!self.ctx) setupAudioContext();
            self._muted = muted;
            // With Web Audio, we just need to mute the master gain.
            if (self.usingWebAudio) self.masterGain.gain.setValueAtTime(muted ? 0 : self._volume, Howler1.ctx.currentTime);
            // Loop through and mute all HTML5 Audio nodes.
            for(var i = 0; i < self._howls.length; i++)if (!self._howls[i]._webAudio) {
                // Get all of the sounds in this Howl group.
                var ids = self._howls[i]._getSoundIds();
                // Loop through all sounds and mark the audio node as muted.
                for(var j = 0; j < ids.length; j++){
                    var sound = self._howls[i]._soundById(ids[j]);
                    if (sound && sound._node) sound._node.muted = muted ? true : sound._muted;
                }
            }
            return self;
        },
        /**
     * Handle stopping all sounds globally.
     */ stop: function() {
            var self = this || Howler1;
            // Loop through all Howls and stop them.
            for(var i = 0; i < self._howls.length; i++)self._howls[i].stop();
            return self;
        },
        /**
     * Unload and destroy all currently loaded Howl objects.
     * @return {Howler}
     */ unload: function() {
            var self = this || Howler1;
            for(var i = self._howls.length - 1; i >= 0; i--)self._howls[i].unload();
            // Create a new AudioContext to make sure it is fully reset.
            if (self.usingWebAudio && self.ctx && typeof self.ctx.close !== "undefined") {
                self.ctx.close();
                self.ctx = null;
                setupAudioContext();
            }
            return self;
        },
        /**
     * Check for codec support of specific extension.
     * @param  {String} ext Audio file extention.
     * @return {Boolean}
     */ codecs: function(ext) {
            return (this || Howler1)._codecs[ext.replace(/^x-/, "")];
        },
        /**
     * Setup various state values for global tracking.
     * @return {Howler}
     */ _setup: function() {
            var self = this || Howler1;
            // Keeps track of the suspend/resume state of the AudioContext.
            self.state = self.ctx ? self.ctx.state || "suspended" : "suspended";
            // Automatically begin the 30-second suspend process
            self._autoSuspend();
            // Check if audio is available.
            if (!self.usingWebAudio) {
                // No audio is available on this system if noAudio is set to true.
                if (typeof Audio !== "undefined") try {
                    var test = new Audio();
                    // Check if the canplaythrough event is available.
                    if (typeof test.oncanplaythrough === "undefined") self._canPlayEvent = "canplay";
                } catch (e) {
                    self.noAudio = true;
                }
                else self.noAudio = true;
            }
            // Test to make sure audio isn't disabled in Internet Explorer.
            try {
                var test = new Audio();
                if (test.muted) self.noAudio = true;
            } catch (e) {}
            // Check for supported codecs.
            if (!self.noAudio) self._setupCodecs();
            return self;
        },
        /**
     * Check for browser support for various codecs and cache the results.
     * @return {Howler}
     */ _setupCodecs: function() {
            var self = this || Howler1;
            var audioTest = null;
            // Must wrap in a try/catch because IE11 in server mode throws an error.
            try {
                audioTest = typeof Audio !== "undefined" ? new Audio() : null;
            } catch (err) {
                return self;
            }
            if (!audioTest || typeof audioTest.canPlayType !== "function") return self;
            var mpegTest = audioTest.canPlayType("audio/mpeg;").replace(/^no$/, "");
            // Opera version <33 has mixed MP3 support, so we need to check for and block it.
            var ua = self._navigator ? self._navigator.userAgent : "";
            var checkOpera = ua.match(/OPR\/([0-6].)/g);
            var isOldOpera = checkOpera && parseInt(checkOpera[0].split("/")[1], 10) < 33;
            var checkSafari = ua.indexOf("Safari") !== -1 && ua.indexOf("Chrome") === -1;
            var safariVersion = ua.match(/Version\/(.*?) /);
            var isOldSafari = checkSafari && safariVersion && parseInt(safariVersion[1], 10) < 15;
            self._codecs = {
                mp3: !!(!isOldOpera && (mpegTest || audioTest.canPlayType("audio/mp3;").replace(/^no$/, ""))),
                mpeg: !!mpegTest,
                opus: !!audioTest.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ""),
                ogg: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""),
                oga: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""),
                wav: !!(audioTest.canPlayType('audio/wav; codecs="1"') || audioTest.canPlayType("audio/wav")).replace(/^no$/, ""),
                aac: !!audioTest.canPlayType("audio/aac;").replace(/^no$/, ""),
                caf: !!audioTest.canPlayType("audio/x-caf;").replace(/^no$/, ""),
                m4a: !!(audioTest.canPlayType("audio/x-m4a;") || audioTest.canPlayType("audio/m4a;") || audioTest.canPlayType("audio/aac;")).replace(/^no$/, ""),
                m4b: !!(audioTest.canPlayType("audio/x-m4b;") || audioTest.canPlayType("audio/m4b;") || audioTest.canPlayType("audio/aac;")).replace(/^no$/, ""),
                mp4: !!(audioTest.canPlayType("audio/x-mp4;") || audioTest.canPlayType("audio/mp4;") || audioTest.canPlayType("audio/aac;")).replace(/^no$/, ""),
                weba: !!(!isOldSafari && audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, "")),
                webm: !!(!isOldSafari && audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, "")),
                dolby: !!audioTest.canPlayType('audio/mp4; codecs="ec-3"').replace(/^no$/, ""),
                flac: !!(audioTest.canPlayType("audio/x-flac;") || audioTest.canPlayType("audio/flac;")).replace(/^no$/, "")
            };
            return self;
        },
        /**
     * Some browsers/devices will only allow audio to be played after a user interaction.
     * Attempt to automatically unlock audio on the first user interaction.
     * Concept from: http://paulbakaus.com/tutorials/html5/web-audio-on-ios/
     * @return {Howler}
     */ _unlockAudio: function() {
            var self = this || Howler1;
            // Only run this if Web Audio is supported and it hasn't already been unlocked.
            if (self._audioUnlocked || !self.ctx) return;
            self._audioUnlocked = false;
            self.autoUnlock = false;
            // Some mobile devices/platforms have distortion issues when opening/closing tabs and/or web views.
            // Bugs in the browser (especially Mobile Safari) can cause the sampleRate to change from 44100 to 48000.
            // By calling Howler.unload(), we create a new AudioContext with the correct sampleRate.
            if (!self._mobileUnloaded && self.ctx.sampleRate !== 44100) {
                self._mobileUnloaded = true;
                self.unload();
            }
            // Scratch buffer for enabling iOS to dispose of web audio buffers correctly, as per:
            // http://stackoverflow.com/questions/24119684
            self._scratchBuffer = self.ctx.createBuffer(1, 1, 22050);
            // Call this method on touch start to create and play a buffer,
            // then check if the audio actually played to determine if
            // audio has now been unlocked on iOS, Android, etc.
            var unlock = function(e) {
                // Create a pool of unlocked HTML5 Audio objects that can
                // be used for playing sounds without user interaction. HTML5
                // Audio objects must be individually unlocked, as opposed
                // to the WebAudio API which only needs a single activation.
                // This must occur before WebAudio setup or the source.onended
                // event will not fire.
                while(self._html5AudioPool.length < self.html5PoolSize)try {
                    var audioNode = new Audio();
                    // Mark this Audio object as unlocked to ensure it can get returned
                    // to the unlocked pool when released.
                    audioNode._unlocked = true;
                    // Add the audio node to the pool.
                    self._releaseHtml5Audio(audioNode);
                } catch (e) {
                    self.noAudio = true;
                    break;
                }
                // Loop through any assigned audio nodes and unlock them.
                for(var i = 0; i < self._howls.length; i++)if (!self._howls[i]._webAudio) {
                    // Get all of the sounds in this Howl group.
                    var ids = self._howls[i]._getSoundIds();
                    // Loop through all sounds and unlock the audio nodes.
                    for(var j = 0; j < ids.length; j++){
                        var sound = self._howls[i]._soundById(ids[j]);
                        if (sound && sound._node && !sound._node._unlocked) {
                            sound._node._unlocked = true;
                            sound._node.load();
                        }
                    }
                }
                // Fix Android can not play in suspend state.
                self._autoResume();
                // Create an empty buffer.
                var source = self.ctx.createBufferSource();
                source.buffer = self._scratchBuffer;
                source.connect(self.ctx.destination);
                // Play the empty buffer.
                if (typeof source.start === "undefined") source.noteOn(0);
                else source.start(0);
                // Calling resume() on a stack initiated by user gesture is what actually unlocks the audio on Android Chrome >= 55.
                if (typeof self.ctx.resume === "function") self.ctx.resume();
                // Setup a timeout to check that we are unlocked on the next event loop.
                source.onended = function() {
                    source.disconnect(0);
                    // Update the unlocked state and prevent this check from happening again.
                    self._audioUnlocked = true;
                    // Remove the touch start listener.
                    document.removeEventListener("touchstart", unlock, true);
                    document.removeEventListener("touchend", unlock, true);
                    document.removeEventListener("click", unlock, true);
                    document.removeEventListener("keydown", unlock, true);
                    // Let all sounds know that audio has been unlocked.
                    for(var i = 0; i < self._howls.length; i++)self._howls[i]._emit("unlock");
                };
            };
            // Setup a touch start listener to attempt an unlock in.
            document.addEventListener("touchstart", unlock, true);
            document.addEventListener("touchend", unlock, true);
            document.addEventListener("click", unlock, true);
            document.addEventListener("keydown", unlock, true);
            return self;
        },
        /**
     * Get an unlocked HTML5 Audio object from the pool. If none are left,
     * return a new Audio object and throw a warning.
     * @return {Audio} HTML5 Audio object.
     */ _obtainHtml5Audio: function() {
            var self = this || Howler1;
            // Return the next object from the pool if one exists.
            if (self._html5AudioPool.length) return self._html5AudioPool.pop();
            //.Check if the audio is locked and throw a warning.
            var testPlay = new Audio().play();
            if (testPlay && typeof Promise !== "undefined" && (testPlay instanceof Promise || typeof testPlay.then === "function")) testPlay.catch(function() {
                console.warn("HTML5 Audio pool exhausted, returning potentially locked audio object.");
            });
            return new Audio();
        },
        /**
     * Return an activated HTML5 Audio object to the pool.
     * @return {Howler}
     */ _releaseHtml5Audio: function(audio) {
            var self = this || Howler1;
            // Don't add audio to the pool if we don't know if it has been unlocked.
            if (audio._unlocked) self._html5AudioPool.push(audio);
            return self;
        },
        /**
     * Automatically suspend the Web Audio AudioContext after no sound has played for 30 seconds.
     * This saves processing/energy and fixes various browser-specific bugs with audio getting stuck.
     * @return {Howler}
     */ _autoSuspend: function() {
            var self = this;
            if (!self.autoSuspend || !self.ctx || typeof self.ctx.suspend === "undefined" || !Howler1.usingWebAudio) return;
            // Check if any sounds are playing.
            for(var i = 0; i < self._howls.length; i++){
                if (self._howls[i]._webAudio) for(var j = 0; j < self._howls[i]._sounds.length; j++){
                    if (!self._howls[i]._sounds[j]._paused) return self;
                }
            }
            if (self._suspendTimer) clearTimeout(self._suspendTimer);
            // If no sound has played after 30 seconds, suspend the context.
            self._suspendTimer = setTimeout(function() {
                if (!self.autoSuspend) return;
                self._suspendTimer = null;
                self.state = "suspending";
                // Handle updating the state of the audio context after suspending.
                var handleSuspension = function() {
                    self.state = "suspended";
                    if (self._resumeAfterSuspend) {
                        delete self._resumeAfterSuspend;
                        self._autoResume();
                    }
                };
                // Either the state gets suspended or it is interrupted.
                // Either way, we need to update the state to suspended.
                self.ctx.suspend().then(handleSuspension, handleSuspension);
            }, 30000);
            return self;
        },
        /**
     * Automatically resume the Web Audio AudioContext when a new sound is played.
     * @return {Howler}
     */ _autoResume: function() {
            var self = this;
            if (!self.ctx || typeof self.ctx.resume === "undefined" || !Howler1.usingWebAudio) return;
            if (self.state === "running" && self.ctx.state !== "interrupted" && self._suspendTimer) {
                clearTimeout(self._suspendTimer);
                self._suspendTimer = null;
            } else if (self.state === "suspended" || self.state === "running" && self.ctx.state === "interrupted") {
                self.ctx.resume().then(function() {
                    self.state = "running";
                    // Emit to all Howls that the audio has resumed.
                    for(var i = 0; i < self._howls.length; i++)self._howls[i]._emit("resume");
                });
                if (self._suspendTimer) {
                    clearTimeout(self._suspendTimer);
                    self._suspendTimer = null;
                }
            } else if (self.state === "suspending") self._resumeAfterSuspend = true;
            return self;
        }
    };
    // Setup the global audio controller.
    var Howler1 = new HowlerGlobal1();
    /** Group Methods **/ /***************************************************************************/ /**
   * Create an audio group controller.
   * @param {Object} o Passed in properties for this group.
   */ var Howl1 = function(o) {
        var self = this;
        // Throw an error if no source is provided.
        if (!o.src || o.src.length === 0) {
            console.error("An array of source files must be passed with any new Howl.");
            return;
        }
        self.init(o);
    };
    Howl1.prototype = {
        /**
     * Initialize a new Howl group object.
     * @param  {Object} o Passed in properties for this group.
     * @return {Howl}
     */ init: function(o) {
            var self = this;
            // If we don't have an AudioContext created yet, run the setup.
            if (!Howler1.ctx) setupAudioContext();
            // Setup user-defined default properties.
            self._autoplay = o.autoplay || false;
            self._format = typeof o.format !== "string" ? o.format : [
                o.format
            ];
            self._html5 = o.html5 || false;
            self._muted = o.mute || false;
            self._loop = o.loop || false;
            self._pool = o.pool || 5;
            self._preload = typeof o.preload === "boolean" || o.preload === "metadata" ? o.preload : true;
            self._rate = o.rate || 1;
            self._sprite = o.sprite || {};
            self._src = typeof o.src !== "string" ? o.src : [
                o.src
            ];
            self._volume = o.volume !== undefined ? o.volume : 1;
            self._xhr = {
                method: o.xhr && o.xhr.method ? o.xhr.method : "GET",
                headers: o.xhr && o.xhr.headers ? o.xhr.headers : null,
                withCredentials: o.xhr && o.xhr.withCredentials ? o.xhr.withCredentials : false
            };
            // Setup all other default properties.
            self._duration = 0;
            self._state = "unloaded";
            self._sounds = [];
            self._endTimers = {};
            self._queue = [];
            self._playLock = false;
            // Setup event listeners.
            self._onend = o.onend ? [
                {
                    fn: o.onend
                }
            ] : [];
            self._onfade = o.onfade ? [
                {
                    fn: o.onfade
                }
            ] : [];
            self._onload = o.onload ? [
                {
                    fn: o.onload
                }
            ] : [];
            self._onloaderror = o.onloaderror ? [
                {
                    fn: o.onloaderror
                }
            ] : [];
            self._onplayerror = o.onplayerror ? [
                {
                    fn: o.onplayerror
                }
            ] : [];
            self._onpause = o.onpause ? [
                {
                    fn: o.onpause
                }
            ] : [];
            self._onplay = o.onplay ? [
                {
                    fn: o.onplay
                }
            ] : [];
            self._onstop = o.onstop ? [
                {
                    fn: o.onstop
                }
            ] : [];
            self._onmute = o.onmute ? [
                {
                    fn: o.onmute
                }
            ] : [];
            self._onvolume = o.onvolume ? [
                {
                    fn: o.onvolume
                }
            ] : [];
            self._onrate = o.onrate ? [
                {
                    fn: o.onrate
                }
            ] : [];
            self._onseek = o.onseek ? [
                {
                    fn: o.onseek
                }
            ] : [];
            self._onunlock = o.onunlock ? [
                {
                    fn: o.onunlock
                }
            ] : [];
            self._onresume = [];
            // Web Audio or HTML5 Audio?
            self._webAudio = Howler1.usingWebAudio && !self._html5;
            // Automatically try to enable audio.
            if (typeof Howler1.ctx !== "undefined" && Howler1.ctx && Howler1.autoUnlock) Howler1._unlockAudio();
            // Keep track of this Howl group in the global controller.
            Howler1._howls.push(self);
            // If they selected autoplay, add a play event to the load queue.
            if (self._autoplay) self._queue.push({
                event: "play",
                action: function() {
                    self.play();
                }
            });
            // Load the source file unless otherwise specified.
            if (self._preload && self._preload !== "none") self.load();
            return self;
        },
        /**
     * Load the audio file.
     * @return {Howler}
     */ load: function() {
            var self = this;
            var url = null;
            // If no audio is available, quit immediately.
            if (Howler1.noAudio) {
                self._emit("loaderror", null, "No audio support.");
                return;
            }
            // Make sure our source is in an array.
            if (typeof self._src === "string") self._src = [
                self._src
            ];
            // Loop through the sources and pick the first one that is compatible.
            for(var i = 0; i < self._src.length; i++){
                var ext, str;
                if (self._format && self._format[i]) // If an extension was specified, use that instead.
                ext = self._format[i];
                else {
                    // Make sure the source is a string.
                    str = self._src[i];
                    if (typeof str !== "string") {
                        self._emit("loaderror", null, "Non-string found in selected audio sources - ignoring.");
                        continue;
                    }
                    // Extract the file extension from the URL or base64 data URI.
                    ext = /^data:audio\/([^;,]+);/i.exec(str);
                    if (!ext) ext = /\.([^.]+)$/.exec(str.split("?", 1)[0]);
                    if (ext) ext = ext[1].toLowerCase();
                }
                // Log a warning if no extension was found.
                if (!ext) console.warn('No file extension was found. Consider using the "format" property or specify an extension.');
                // Check if this extension is available.
                if (ext && Howler1.codecs(ext)) {
                    url = self._src[i];
                    break;
                }
            }
            if (!url) {
                self._emit("loaderror", null, "No codec support for selected audio sources.");
                return;
            }
            self._src = url;
            self._state = "loading";
            // If the hosting page is HTTPS and the source isn't,
            // drop down to HTML5 Audio to avoid Mixed Content errors.
            if (window.location.protocol === "https:" && url.slice(0, 5) === "http:") {
                self._html5 = true;
                self._webAudio = false;
            }
            // Create a new sound object and add it to the pool.
            new Sound1(self);
            // Load and decode the audio data for playback.
            if (self._webAudio) loadBuffer(self);
            return self;
        },
        /**
     * Play a sound or resume previous playback.
     * @param  {String/Number} sprite   Sprite name for sprite playback or sound id to continue previous.
     * @param  {Boolean} internal Internal Use: true prevents event firing.
     * @return {Number}          Sound ID.
     */ play: function(sprite, internal) {
            var self = this;
            var id = null;
            // Determine if a sprite, sound id or nothing was passed
            if (typeof sprite === "number") {
                id = sprite;
                sprite = null;
            } else if (typeof sprite === "string" && self._state === "loaded" && !self._sprite[sprite]) // If the passed sprite doesn't exist, do nothing.
            return null;
            else if (typeof sprite === "undefined") {
                // Use the default sound sprite (plays the full audio length).
                sprite = "__default";
                // Check if there is a single paused sound that isn't ended.
                // If there is, play that sound. If not, continue as usual.
                if (!self._playLock) {
                    var num = 0;
                    for(var i = 0; i < self._sounds.length; i++)if (self._sounds[i]._paused && !self._sounds[i]._ended) {
                        num++;
                        id = self._sounds[i]._id;
                    }
                    if (num === 1) sprite = null;
                    else id = null;
                }
            }
            // Get the selected node, or get one from the pool.
            var sound = id ? self._soundById(id) : self._inactiveSound();
            // If the sound doesn't exist, do nothing.
            if (!sound) return null;
            // Select the sprite definition.
            if (id && !sprite) sprite = sound._sprite || "__default";
            // If the sound hasn't loaded, we must wait to get the audio's duration.
            // We also need to wait to make sure we don't run into race conditions with
            // the order of function calls.
            if (self._state !== "loaded") {
                // Set the sprite value on this sound.
                sound._sprite = sprite;
                // Mark this sound as not ended in case another sound is played before this one loads.
                sound._ended = false;
                // Add the sound to the queue to be played on load.
                var soundId = sound._id;
                self._queue.push({
                    event: "play",
                    action: function() {
                        self.play(soundId);
                    }
                });
                return soundId;
            }
            // Don't play the sound if an id was passed and it is already playing.
            if (id && !sound._paused) {
                // Trigger the play event, in order to keep iterating through queue.
                if (!internal) self._loadQueue("play");
                return sound._id;
            }
            // Make sure the AudioContext isn't suspended, and resume it if it is.
            if (self._webAudio) Howler1._autoResume();
            // Determine how long to play for and where to start playing.
            var seek = Math.max(0, sound._seek > 0 ? sound._seek : self._sprite[sprite][0] / 1000);
            var duration = Math.max(0, (self._sprite[sprite][0] + self._sprite[sprite][1]) / 1000 - seek);
            var timeout = duration * 1000 / Math.abs(sound._rate);
            var start = self._sprite[sprite][0] / 1000;
            var stop = (self._sprite[sprite][0] + self._sprite[sprite][1]) / 1000;
            sound._sprite = sprite;
            // Mark the sound as ended instantly so that this async playback
            // doesn't get grabbed by another call to play while this one waits to start.
            sound._ended = false;
            // Update the parameters of the sound.
            var setParams = function() {
                sound._paused = false;
                sound._seek = seek;
                sound._start = start;
                sound._stop = stop;
                sound._loop = !!(sound._loop || self._sprite[sprite][2]);
            };
            // End the sound instantly if seek is at the end.
            if (seek >= stop) {
                self._ended(sound);
                return;
            }
            // Begin the actual playback.
            var node = sound._node;
            if (self._webAudio) {
                // Fire this when the sound is ready to play to begin Web Audio playback.
                var playWebAudio = function() {
                    self._playLock = false;
                    setParams();
                    self._refreshBuffer(sound);
                    // Setup the playback params.
                    var vol = sound._muted || self._muted ? 0 : sound._volume;
                    node.gain.setValueAtTime(vol, Howler1.ctx.currentTime);
                    sound._playStart = Howler1.ctx.currentTime;
                    // Play the sound using the supported method.
                    if (typeof node.bufferSource.start === "undefined") sound._loop ? node.bufferSource.noteGrainOn(0, seek, 86400) : node.bufferSource.noteGrainOn(0, seek, duration);
                    else sound._loop ? node.bufferSource.start(0, seek, 86400) : node.bufferSource.start(0, seek, duration);
                    // Start a new timer if none is present.
                    if (timeout !== Infinity) self._endTimers[sound._id] = setTimeout(self._ended.bind(self, sound), timeout);
                    if (!internal) setTimeout(function() {
                        self._emit("play", sound._id);
                        self._loadQueue();
                    }, 0);
                };
                if (Howler1.state === "running" && Howler1.ctx.state !== "interrupted") playWebAudio();
                else {
                    self._playLock = true;
                    // Wait for the audio context to resume before playing.
                    self.once("resume", playWebAudio);
                    // Cancel the end timer.
                    self._clearTimer(sound._id);
                }
            } else {
                // Fire this when the sound is ready to play to begin HTML5 Audio playback.
                var playHtml5 = function() {
                    node.currentTime = seek;
                    node.muted = sound._muted || self._muted || Howler1._muted || node.muted;
                    node.volume = sound._volume * Howler1.volume();
                    node.playbackRate = sound._rate;
                    // Some browsers will throw an error if this is called without user interaction.
                    try {
                        var play = node.play();
                        // Support older browsers that don't support promises, and thus don't have this issue.
                        if (play && typeof Promise !== "undefined" && (play instanceof Promise || typeof play.then === "function")) {
                            // Implements a lock to prevent DOMException: The play() request was interrupted by a call to pause().
                            self._playLock = true;
                            // Set param values immediately.
                            setParams();
                            // Releases the lock and executes queued actions.
                            play.then(function() {
                                self._playLock = false;
                                node._unlocked = true;
                                if (!internal) self._emit("play", sound._id);
                                else self._loadQueue();
                            }).catch(function() {
                                self._playLock = false;
                                self._emit("playerror", sound._id, "Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction.");
                                // Reset the ended and paused values.
                                sound._ended = true;
                                sound._paused = true;
                            });
                        } else if (!internal) {
                            self._playLock = false;
                            setParams();
                            self._emit("play", sound._id);
                        }
                        // Setting rate before playing won't work in IE, so we set it again here.
                        node.playbackRate = sound._rate;
                        // If the node is still paused, then we can assume there was a playback issue.
                        if (node.paused) {
                            self._emit("playerror", sound._id, "Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction.");
                            return;
                        }
                        // Setup the end timer on sprites or listen for the ended event.
                        if (sprite !== "__default" || sound._loop) self._endTimers[sound._id] = setTimeout(self._ended.bind(self, sound), timeout);
                        else {
                            self._endTimers[sound._id] = function() {
                                // Fire ended on this audio node.
                                self._ended(sound);
                                // Clear this listener.
                                node.removeEventListener("ended", self._endTimers[sound._id], false);
                            };
                            node.addEventListener("ended", self._endTimers[sound._id], false);
                        }
                    } catch (err) {
                        self._emit("playerror", sound._id, err);
                    }
                };
                // If this is streaming audio, make sure the src is set and load again.
                if (node.src === "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA") {
                    node.src = self._src;
                    node.load();
                }
                // Play immediately if ready, or wait for the 'canplaythrough'e vent.
                var loadedNoReadyState = window && window.ejecta || !node.readyState && Howler1._navigator.isCocoonJS;
                if (node.readyState >= 3 || loadedNoReadyState) playHtml5();
                else {
                    self._playLock = true;
                    self._state = "loading";
                    var listener = function() {
                        self._state = "loaded";
                        // Begin playback.
                        playHtml5();
                        // Clear this listener.
                        node.removeEventListener(Howler1._canPlayEvent, listener, false);
                    };
                    node.addEventListener(Howler1._canPlayEvent, listener, false);
                    // Cancel the end timer.
                    self._clearTimer(sound._id);
                }
            }
            return sound._id;
        },
        /**
     * Pause playback and save current position.
     * @param  {Number} id The sound ID (empty to pause all in group).
     * @return {Howl}
     */ pause: function(id) {
            var self = this;
            // If the sound hasn't loaded or a play() promise is pending, add it to the load queue to pause when capable.
            if (self._state !== "loaded" || self._playLock) {
                self._queue.push({
                    event: "pause",
                    action: function() {
                        self.pause(id);
                    }
                });
                return self;
            }
            // If no id is passed, get all ID's to be paused.
            var ids = self._getSoundIds(id);
            for(var i = 0; i < ids.length; i++){
                // Clear the end timer.
                self._clearTimer(ids[i]);
                // Get the sound.
                var sound = self._soundById(ids[i]);
                if (sound && !sound._paused) {
                    // Reset the seek position.
                    sound._seek = self.seek(ids[i]);
                    sound._rateSeek = 0;
                    sound._paused = true;
                    // Stop currently running fades.
                    self._stopFade(ids[i]);
                    if (sound._node) {
                        if (self._webAudio) {
                            // Make sure the sound has been created.
                            if (!sound._node.bufferSource) continue;
                            if (typeof sound._node.bufferSource.stop === "undefined") sound._node.bufferSource.noteOff(0);
                            else sound._node.bufferSource.stop(0);
                            // Clean up the buffer source.
                            self._cleanBuffer(sound._node);
                        } else if (!isNaN(sound._node.duration) || sound._node.duration === Infinity) sound._node.pause();
                    }
                }
                // Fire the pause event, unless `true` is passed as the 2nd argument.
                if (!arguments[1]) self._emit("pause", sound ? sound._id : null);
            }
            return self;
        },
        /**
     * Stop playback and reset to start.
     * @param  {Number} id The sound ID (empty to stop all in group).
     * @param  {Boolean} internal Internal Use: true prevents event firing.
     * @return {Howl}
     */ stop: function(id, internal) {
            var self = this;
            // If the sound hasn't loaded, add it to the load queue to stop when capable.
            if (self._state !== "loaded" || self._playLock) {
                self._queue.push({
                    event: "stop",
                    action: function() {
                        self.stop(id);
                    }
                });
                return self;
            }
            // If no id is passed, get all ID's to be stopped.
            var ids = self._getSoundIds(id);
            for(var i = 0; i < ids.length; i++){
                // Clear the end timer.
                self._clearTimer(ids[i]);
                // Get the sound.
                var sound = self._soundById(ids[i]);
                if (sound) {
                    // Reset the seek position.
                    sound._seek = sound._start || 0;
                    sound._rateSeek = 0;
                    sound._paused = true;
                    sound._ended = true;
                    // Stop currently running fades.
                    self._stopFade(ids[i]);
                    if (sound._node) {
                        if (self._webAudio) // Make sure the sound's AudioBufferSourceNode has been created.
                        {
                            if (sound._node.bufferSource) {
                                if (typeof sound._node.bufferSource.stop === "undefined") sound._node.bufferSource.noteOff(0);
                                else sound._node.bufferSource.stop(0);
                                // Clean up the buffer source.
                                self._cleanBuffer(sound._node);
                            }
                        } else if (!isNaN(sound._node.duration) || sound._node.duration === Infinity) {
                            sound._node.currentTime = sound._start || 0;
                            sound._node.pause();
                            // If this is a live stream, stop download once the audio is stopped.
                            if (sound._node.duration === Infinity) self._clearSound(sound._node);
                        }
                    }
                    if (!internal) self._emit("stop", sound._id);
                }
            }
            return self;
        },
        /**
     * Mute/unmute a single sound or all sounds in this Howl group.
     * @param  {Boolean} muted Set to true to mute and false to unmute.
     * @param  {Number} id    The sound ID to update (omit to mute/unmute all).
     * @return {Howl}
     */ mute: function(muted, id) {
            var self = this;
            // If the sound hasn't loaded, add it to the load queue to mute when capable.
            if (self._state !== "loaded" || self._playLock) {
                self._queue.push({
                    event: "mute",
                    action: function() {
                        self.mute(muted, id);
                    }
                });
                return self;
            }
            // If applying mute/unmute to all sounds, update the group's value.
            if (typeof id === "undefined") {
                if (typeof muted === "boolean") self._muted = muted;
                else return self._muted;
            }
            // If no id is passed, get all ID's to be muted.
            var ids = self._getSoundIds(id);
            for(var i = 0; i < ids.length; i++){
                // Get the sound.
                var sound = self._soundById(ids[i]);
                if (sound) {
                    sound._muted = muted;
                    // Cancel active fade and set the volume to the end value.
                    if (sound._interval) self._stopFade(sound._id);
                    if (self._webAudio && sound._node) sound._node.gain.setValueAtTime(muted ? 0 : sound._volume, Howler1.ctx.currentTime);
                    else if (sound._node) sound._node.muted = Howler1._muted ? true : muted;
                    self._emit("mute", sound._id);
                }
            }
            return self;
        },
        /**
     * Get/set the volume of this sound or of the Howl group. This method can optionally take 0, 1 or 2 arguments.
     *   volume() -> Returns the group's volume value.
     *   volume(id) -> Returns the sound id's current volume.
     *   volume(vol) -> Sets the volume of all sounds in this Howl group.
     *   volume(vol, id) -> Sets the volume of passed sound id.
     * @return {Howl/Number} Returns self or current volume.
     */ volume: function() {
            var self = this;
            var args = arguments;
            var vol, id;
            // Determine the values based on arguments.
            if (args.length === 0) // Return the value of the groups' volume.
            return self._volume;
            else if (args.length === 1 || args.length === 2 && typeof args[1] === "undefined") {
                // First check if this is an ID, and if not, assume it is a new volume.
                var ids = self._getSoundIds();
                var index = ids.indexOf(args[0]);
                if (index >= 0) id = parseInt(args[0], 10);
                else vol = parseFloat(args[0]);
            } else if (args.length >= 2) {
                vol = parseFloat(args[0]);
                id = parseInt(args[1], 10);
            }
            // Update the volume or return the current volume.
            var sound;
            if (typeof vol !== "undefined" && vol >= 0 && vol <= 1) {
                // If the sound hasn't loaded, add it to the load queue to change volume when capable.
                if (self._state !== "loaded" || self._playLock) {
                    self._queue.push({
                        event: "volume",
                        action: function() {
                            self.volume.apply(self, args);
                        }
                    });
                    return self;
                }
                // Set the group volume.
                if (typeof id === "undefined") self._volume = vol;
                // Update one or all volumes.
                id = self._getSoundIds(id);
                for(var i = 0; i < id.length; i++){
                    // Get the sound.
                    sound = self._soundById(id[i]);
                    if (sound) {
                        sound._volume = vol;
                        // Stop currently running fades.
                        if (!args[2]) self._stopFade(id[i]);
                        if (self._webAudio && sound._node && !sound._muted) sound._node.gain.setValueAtTime(vol, Howler1.ctx.currentTime);
                        else if (sound._node && !sound._muted) sound._node.volume = vol * Howler1.volume();
                        self._emit("volume", sound._id);
                    }
                }
            } else {
                sound = id ? self._soundById(id) : self._sounds[0];
                return sound ? sound._volume : 0;
            }
            return self;
        },
        /**
     * Fade a currently playing sound between two volumes (if no id is passed, all sounds will fade).
     * @param  {Number} from The value to fade from (0.0 to 1.0).
     * @param  {Number} to   The volume to fade to (0.0 to 1.0).
     * @param  {Number} len  Time in milliseconds to fade.
     * @param  {Number} id   The sound id (omit to fade all sounds).
     * @return {Howl}
     */ fade: function(from, to, len, id) {
            var self = this;
            // If the sound hasn't loaded, add it to the load queue to fade when capable.
            if (self._state !== "loaded" || self._playLock) {
                self._queue.push({
                    event: "fade",
                    action: function() {
                        self.fade(from, to, len, id);
                    }
                });
                return self;
            }
            // Make sure the to/from/len values are numbers.
            from = Math.min(Math.max(0, parseFloat(from)), 1);
            to = Math.min(Math.max(0, parseFloat(to)), 1);
            len = parseFloat(len);
            // Set the volume to the start position.
            self.volume(from, id);
            // Fade the volume of one or all sounds.
            var ids = self._getSoundIds(id);
            for(var i = 0; i < ids.length; i++){
                // Get the sound.
                var sound = self._soundById(ids[i]);
                // Create a linear fade or fall back to timeouts with HTML5 Audio.
                if (sound) {
                    // Stop the previous fade if no sprite is being used (otherwise, volume handles this).
                    if (!id) self._stopFade(ids[i]);
                    // If we are using Web Audio, let the native methods do the actual fade.
                    if (self._webAudio && !sound._muted) {
                        var currentTime = Howler1.ctx.currentTime;
                        var end = currentTime + len / 1000;
                        sound._volume = from;
                        sound._node.gain.setValueAtTime(from, currentTime);
                        sound._node.gain.linearRampToValueAtTime(to, end);
                    }
                    self._startFadeInterval(sound, from, to, len, ids[i], typeof id === "undefined");
                }
            }
            return self;
        },
        /**
     * Starts the internal interval to fade a sound.
     * @param  {Object} sound Reference to sound to fade.
     * @param  {Number} from The value to fade from (0.0 to 1.0).
     * @param  {Number} to   The volume to fade to (0.0 to 1.0).
     * @param  {Number} len  Time in milliseconds to fade.
     * @param  {Number} id   The sound id to fade.
     * @param  {Boolean} isGroup   If true, set the volume on the group.
     */ _startFadeInterval: function(sound, from, to, len, id, isGroup) {
            var self = this;
            var vol = from;
            var diff = to - from;
            var steps = Math.abs(diff / 0.01);
            var stepLen = Math.max(4, steps > 0 ? len / steps : len);
            var lastTick = Date.now();
            // Store the value being faded to.
            sound._fadeTo = to;
            // Update the volume value on each interval tick.
            sound._interval = setInterval(function() {
                // Update the volume based on the time since the last tick.
                var tick = (Date.now() - lastTick) / len;
                lastTick = Date.now();
                vol += diff * tick;
                // Round to within 2 decimal points.
                vol = Math.round(vol * 100) / 100;
                // Make sure the volume is in the right bounds.
                if (diff < 0) vol = Math.max(to, vol);
                else vol = Math.min(to, vol);
                // Change the volume.
                if (self._webAudio) sound._volume = vol;
                else self.volume(vol, sound._id, true);
                // Set the group's volume.
                if (isGroup) self._volume = vol;
                // When the fade is complete, stop it and fire event.
                if (to < from && vol <= to || to > from && vol >= to) {
                    clearInterval(sound._interval);
                    sound._interval = null;
                    sound._fadeTo = null;
                    self.volume(to, sound._id);
                    self._emit("fade", sound._id);
                }
            }, stepLen);
        },
        /**
     * Internal method that stops the currently playing fade when
     * a new fade starts, volume is changed or the sound is stopped.
     * @param  {Number} id The sound id.
     * @return {Howl}
     */ _stopFade: function(id) {
            var self = this;
            var sound = self._soundById(id);
            if (sound && sound._interval) {
                if (self._webAudio) sound._node.gain.cancelScheduledValues(Howler1.ctx.currentTime);
                clearInterval(sound._interval);
                sound._interval = null;
                self.volume(sound._fadeTo, id);
                sound._fadeTo = null;
                self._emit("fade", id);
            }
            return self;
        },
        /**
     * Get/set the loop parameter on a sound. This method can optionally take 0, 1 or 2 arguments.
     *   loop() -> Returns the group's loop value.
     *   loop(id) -> Returns the sound id's loop value.
     *   loop(loop) -> Sets the loop value for all sounds in this Howl group.
     *   loop(loop, id) -> Sets the loop value of passed sound id.
     * @return {Howl/Boolean} Returns self or current loop value.
     */ loop: function() {
            var self = this;
            var args = arguments;
            var loop, id, sound;
            // Determine the values for loop and id.
            if (args.length === 0) // Return the grou's loop value.
            return self._loop;
            else if (args.length === 1) {
                if (typeof args[0] === "boolean") {
                    loop = args[0];
                    self._loop = loop;
                } else {
                    // Return this sound's loop value.
                    sound = self._soundById(parseInt(args[0], 10));
                    return sound ? sound._loop : false;
                }
            } else if (args.length === 2) {
                loop = args[0];
                id = parseInt(args[1], 10);
            }
            // If no id is passed, get all ID's to be looped.
            var ids = self._getSoundIds(id);
            for(var i = 0; i < ids.length; i++){
                sound = self._soundById(ids[i]);
                if (sound) {
                    sound._loop = loop;
                    if (self._webAudio && sound._node && sound._node.bufferSource) {
                        sound._node.bufferSource.loop = loop;
                        if (loop) {
                            sound._node.bufferSource.loopStart = sound._start || 0;
                            sound._node.bufferSource.loopEnd = sound._stop;
                            // If playing, restart playback to ensure looping updates.
                            if (self.playing(ids[i])) {
                                self.pause(ids[i], true);
                                self.play(ids[i], true);
                            }
                        }
                    }
                }
            }
            return self;
        },
        /**
     * Get/set the playback rate of a sound. This method can optionally take 0, 1 or 2 arguments.
     *   rate() -> Returns the first sound node's current playback rate.
     *   rate(id) -> Returns the sound id's current playback rate.
     *   rate(rate) -> Sets the playback rate of all sounds in this Howl group.
     *   rate(rate, id) -> Sets the playback rate of passed sound id.
     * @return {Howl/Number} Returns self or the current playback rate.
     */ rate: function() {
            var self = this;
            var args = arguments;
            var rate, id;
            // Determine the values based on arguments.
            if (args.length === 0) // We will simply return the current rate of the first node.
            id = self._sounds[0]._id;
            else if (args.length === 1) {
                // First check if this is an ID, and if not, assume it is a new rate value.
                var ids = self._getSoundIds();
                var index = ids.indexOf(args[0]);
                if (index >= 0) id = parseInt(args[0], 10);
                else rate = parseFloat(args[0]);
            } else if (args.length === 2) {
                rate = parseFloat(args[0]);
                id = parseInt(args[1], 10);
            }
            // Update the playback rate or return the current value.
            var sound;
            if (typeof rate === "number") {
                // If the sound hasn't loaded, add it to the load queue to change playback rate when capable.
                if (self._state !== "loaded" || self._playLock) {
                    self._queue.push({
                        event: "rate",
                        action: function() {
                            self.rate.apply(self, args);
                        }
                    });
                    return self;
                }
                // Set the group rate.
                if (typeof id === "undefined") self._rate = rate;
                // Update one or all volumes.
                id = self._getSoundIds(id);
                for(var i = 0; i < id.length; i++){
                    // Get the sound.
                    sound = self._soundById(id[i]);
                    if (sound) {
                        // Keep track of our position when the rate changed and update the playback
                        // start position so we can properly adjust the seek position for time elapsed.
                        if (self.playing(id[i])) {
                            sound._rateSeek = self.seek(id[i]);
                            sound._playStart = self._webAudio ? Howler1.ctx.currentTime : sound._playStart;
                        }
                        sound._rate = rate;
                        // Change the playback rate.
                        if (self._webAudio && sound._node && sound._node.bufferSource) sound._node.bufferSource.playbackRate.setValueAtTime(rate, Howler1.ctx.currentTime);
                        else if (sound._node) sound._node.playbackRate = rate;
                        // Reset the timers.
                        var seek = self.seek(id[i]);
                        var duration = (self._sprite[sound._sprite][0] + self._sprite[sound._sprite][1]) / 1000 - seek;
                        var timeout = duration * 1000 / Math.abs(sound._rate);
                        // Start a new end timer if sound is already playing.
                        if (self._endTimers[id[i]] || !sound._paused) {
                            self._clearTimer(id[i]);
                            self._endTimers[id[i]] = setTimeout(self._ended.bind(self, sound), timeout);
                        }
                        self._emit("rate", sound._id);
                    }
                }
            } else {
                sound = self._soundById(id);
                return sound ? sound._rate : self._rate;
            }
            return self;
        },
        /**
     * Get/set the seek position of a sound. This method can optionally take 0, 1 or 2 arguments.
     *   seek() -> Returns the first sound node's current seek position.
     *   seek(id) -> Returns the sound id's current seek position.
     *   seek(seek) -> Sets the seek position of the first sound node.
     *   seek(seek, id) -> Sets the seek position of passed sound id.
     * @return {Howl/Number} Returns self or the current seek position.
     */ seek: function() {
            var self = this;
            var args = arguments;
            var seek, id;
            // Determine the values based on arguments.
            if (args.length === 0) // We will simply return the current position of the first node.
            {
                if (self._sounds.length) id = self._sounds[0]._id;
            } else if (args.length === 1) {
                // First check if this is an ID, and if not, assume it is a new seek position.
                var ids = self._getSoundIds();
                var index = ids.indexOf(args[0]);
                if (index >= 0) id = parseInt(args[0], 10);
                else if (self._sounds.length) {
                    id = self._sounds[0]._id;
                    seek = parseFloat(args[0]);
                }
            } else if (args.length === 2) {
                seek = parseFloat(args[0]);
                id = parseInt(args[1], 10);
            }
            // If there is no ID, bail out.
            if (typeof id === "undefined") return 0;
            // If the sound hasn't loaded, add it to the load queue to seek when capable.
            if (typeof seek === "number" && (self._state !== "loaded" || self._playLock)) {
                self._queue.push({
                    event: "seek",
                    action: function() {
                        self.seek.apply(self, args);
                    }
                });
                return self;
            }
            // Get the sound.
            var sound = self._soundById(id);
            if (sound) {
                if (typeof seek === "number" && seek >= 0) {
                    // Pause the sound and update position for restarting playback.
                    var playing = self.playing(id);
                    if (playing) self.pause(id, true);
                    // Move the position of the track and cancel timer.
                    sound._seek = seek;
                    sound._ended = false;
                    self._clearTimer(id);
                    // Update the seek position for HTML5 Audio.
                    if (!self._webAudio && sound._node && !isNaN(sound._node.duration)) sound._node.currentTime = seek;
                    // Seek and emit when ready.
                    var seekAndEmit = function() {
                        // Restart the playback if the sound was playing.
                        if (playing) self.play(id, true);
                        self._emit("seek", id);
                    };
                    // Wait for the play lock to be unset before emitting (HTML5 Audio).
                    if (playing && !self._webAudio) {
                        var emitSeek = function() {
                            if (!self._playLock) seekAndEmit();
                            else setTimeout(emitSeek, 0);
                        };
                        setTimeout(emitSeek, 0);
                    } else seekAndEmit();
                } else {
                    if (self._webAudio) {
                        var realTime = self.playing(id) ? Howler1.ctx.currentTime - sound._playStart : 0;
                        var rateSeek = sound._rateSeek ? sound._rateSeek - sound._seek : 0;
                        return sound._seek + (rateSeek + realTime * Math.abs(sound._rate));
                    } else return sound._node.currentTime;
                }
            }
            return self;
        },
        /**
     * Check if a specific sound is currently playing or not (if id is provided), or check if at least one of the sounds in the group is playing or not.
     * @param  {Number}  id The sound id to check. If none is passed, the whole sound group is checked.
     * @return {Boolean} True if playing and false if not.
     */ playing: function(id) {
            var self = this;
            // Check the passed sound ID (if any).
            if (typeof id === "number") {
                var sound = self._soundById(id);
                return sound ? !sound._paused : false;
            }
            // Otherwise, loop through all sounds and check if any are playing.
            for(var i = 0; i < self._sounds.length; i++){
                if (!self._sounds[i]._paused) return true;
            }
            return false;
        },
        /**
     * Get the duration of this sound. Passing a sound id will return the sprite duration.
     * @param  {Number} id The sound id to check. If none is passed, return full source duration.
     * @return {Number} Audio duration in seconds.
     */ duration: function(id) {
            var self = this;
            var duration = self._duration;
            // If we pass an ID, get the sound and return the sprite length.
            var sound = self._soundById(id);
            if (sound) duration = self._sprite[sound._sprite][1] / 1000;
            return duration;
        },
        /**
     * Returns the current loaded state of this Howl.
     * @return {String} 'unloaded', 'loading', 'loaded'
     */ state: function() {
            return this._state;
        },
        /**
     * Unload and destroy the current Howl object.
     * This will immediately stop all sound instances attached to this group.
     */ unload: function() {
            var self = this;
            // Stop playing any active sounds.
            var sounds = self._sounds;
            for(var i = 0; i < sounds.length; i++){
                // Stop the sound if it is currently playing.
                if (!sounds[i]._paused) self.stop(sounds[i]._id);
                // Remove the source or disconnect.
                if (!self._webAudio) {
                    // Set the source to 0-second silence to stop any downloading (except in IE).
                    self._clearSound(sounds[i]._node);
                    // Remove any event listeners.
                    sounds[i]._node.removeEventListener("error", sounds[i]._errorFn, false);
                    sounds[i]._node.removeEventListener(Howler1._canPlayEvent, sounds[i]._loadFn, false);
                    sounds[i]._node.removeEventListener("ended", sounds[i]._endFn, false);
                    // Release the Audio object back to the pool.
                    Howler1._releaseHtml5Audio(sounds[i]._node);
                }
                // Empty out all of the nodes.
                delete sounds[i]._node;
                // Make sure all timers are cleared out.
                self._clearTimer(sounds[i]._id);
            }
            // Remove the references in the global Howler object.
            var index = Howler1._howls.indexOf(self);
            if (index >= 0) Howler1._howls.splice(index, 1);
            // Delete this sound from the cache (if no other Howl is using it).
            var remCache = true;
            for(i = 0; i < Howler1._howls.length; i++)if (Howler1._howls[i]._src === self._src || self._src.indexOf(Howler1._howls[i]._src) >= 0) {
                remCache = false;
                break;
            }
            if (cache && remCache) delete cache[self._src];
            // Clear global errors.
            Howler1.noAudio = false;
            // Clear out `self`.
            self._state = "unloaded";
            self._sounds = [];
            self = null;
            return null;
        },
        /**
     * Listen to a custom event.
     * @param  {String}   event Event name.
     * @param  {Function} fn    Listener to call.
     * @param  {Number}   id    (optional) Only listen to events for this sound.
     * @param  {Number}   once  (INTERNAL) Marks event to fire only once.
     * @return {Howl}
     */ on: function(event, fn, id, once) {
            var self = this;
            var events = self["_on" + event];
            if (typeof fn === "function") events.push(once ? {
                id: id,
                fn: fn,
                once: once
            } : {
                id: id,
                fn: fn
            });
            return self;
        },
        /**
     * Remove a custom event. Call without parameters to remove all events.
     * @param  {String}   event Event name.
     * @param  {Function} fn    Listener to remove. Leave empty to remove all.
     * @param  {Number}   id    (optional) Only remove events for this sound.
     * @return {Howl}
     */ off: function(event, fn, id) {
            var self = this;
            var events = self["_on" + event];
            var i = 0;
            // Allow passing just an event and ID.
            if (typeof fn === "number") {
                id = fn;
                fn = null;
            }
            if (fn || id) // Loop through event store and remove the passed function.
            for(i = 0; i < events.length; i++){
                var isId = id === events[i].id;
                if (fn === events[i].fn && isId || !fn && isId) {
                    events.splice(i, 1);
                    break;
                }
            }
            else if (event) // Clear out all events of this type.
            self["_on" + event] = [];
            else {
                // Clear out all events of every type.
                var keys = Object.keys(self);
                for(i = 0; i < keys.length; i++)if (keys[i].indexOf("_on") === 0 && Array.isArray(self[keys[i]])) self[keys[i]] = [];
            }
            return self;
        },
        /**
     * Listen to a custom event and remove it once fired.
     * @param  {String}   event Event name.
     * @param  {Function} fn    Listener to call.
     * @param  {Number}   id    (optional) Only listen to events for this sound.
     * @return {Howl}
     */ once: function(event, fn, id) {
            var self = this;
            // Setup the event listener.
            self.on(event, fn, id, 1);
            return self;
        },
        /**
     * Emit all events of a specific type and pass the sound id.
     * @param  {String} event Event name.
     * @param  {Number} id    Sound ID.
     * @param  {Number} msg   Message to go with event.
     * @return {Howl}
     */ _emit: function(event, id, msg) {
            var self = this;
            var events = self["_on" + event];
            // Loop through event store and fire all functions.
            for(var i = events.length - 1; i >= 0; i--)// Only fire the listener if the correct ID is used.
            if (!events[i].id || events[i].id === id || event === "load") {
                setTimeout((function(fn) {
                    fn.call(this, id, msg);
                }).bind(self, events[i].fn), 0);
                // If this event was setup with `once`, remove it.
                if (events[i].once) self.off(event, events[i].fn, events[i].id);
            }
            // Pass the event type into load queue so that it can continue stepping.
            self._loadQueue(event);
            return self;
        },
        /**
     * Queue of actions initiated before the sound has loaded.
     * These will be called in sequence, with the next only firing
     * after the previous has finished executing (even if async like play).
     * @return {Howl}
     */ _loadQueue: function(event) {
            var self = this;
            if (self._queue.length > 0) {
                var task = self._queue[0];
                // Remove this task if a matching event was passed.
                if (task.event === event) {
                    self._queue.shift();
                    self._loadQueue();
                }
                // Run the task if no event type is passed.
                if (!event) task.action();
            }
            return self;
        },
        /**
     * Fired when playback ends at the end of the duration.
     * @param  {Sound} sound The sound object to work with.
     * @return {Howl}
     */ _ended: function(sound) {
            var self = this;
            var sprite = sound._sprite;
            // If we are using IE and there was network latency we may be clipping
            // audio before it completes playing. Lets check the node to make sure it
            // believes it has completed, before ending the playback.
            if (!self._webAudio && sound._node && !sound._node.paused && !sound._node.ended && sound._node.currentTime < sound._stop) {
                setTimeout(self._ended.bind(self, sound), 100);
                return self;
            }
            // Should this sound loop?
            var loop = !!(sound._loop || self._sprite[sprite][2]);
            // Fire the ended event.
            self._emit("end", sound._id);
            // Restart the playback for HTML5 Audio loop.
            if (!self._webAudio && loop) self.stop(sound._id, true).play(sound._id);
            // Restart this timer if on a Web Audio loop.
            if (self._webAudio && loop) {
                self._emit("play", sound._id);
                sound._seek = sound._start || 0;
                sound._rateSeek = 0;
                sound._playStart = Howler1.ctx.currentTime;
                var timeout = (sound._stop - sound._start) * 1000 / Math.abs(sound._rate);
                self._endTimers[sound._id] = setTimeout(self._ended.bind(self, sound), timeout);
            }
            // Mark the node as paused.
            if (self._webAudio && !loop) {
                sound._paused = true;
                sound._ended = true;
                sound._seek = sound._start || 0;
                sound._rateSeek = 0;
                self._clearTimer(sound._id);
                // Clean up the buffer source.
                self._cleanBuffer(sound._node);
                // Attempt to auto-suspend AudioContext if no sounds are still playing.
                Howler1._autoSuspend();
            }
            // When using a sprite, end the track.
            if (!self._webAudio && !loop) self.stop(sound._id, true);
            return self;
        },
        /**
     * Clear the end timer for a sound playback.
     * @param  {Number} id The sound ID.
     * @return {Howl}
     */ _clearTimer: function(id) {
            var self = this;
            if (self._endTimers[id]) {
                // Clear the timeout or remove the ended listener.
                if (typeof self._endTimers[id] !== "function") clearTimeout(self._endTimers[id]);
                else {
                    var sound = self._soundById(id);
                    if (sound && sound._node) sound._node.removeEventListener("ended", self._endTimers[id], false);
                }
                delete self._endTimers[id];
            }
            return self;
        },
        /**
     * Return the sound identified by this ID, or return null.
     * @param  {Number} id Sound ID
     * @return {Object}    Sound object or null.
     */ _soundById: function(id) {
            var self = this;
            // Loop through all sounds and find the one with this ID.
            for(var i = 0; i < self._sounds.length; i++){
                if (id === self._sounds[i]._id) return self._sounds[i];
            }
            return null;
        },
        /**
     * Return an inactive sound from the pool or create a new one.
     * @return {Sound} Sound playback object.
     */ _inactiveSound: function() {
            var self = this;
            self._drain();
            // Find the first inactive node to recycle.
            for(var i = 0; i < self._sounds.length; i++){
                if (self._sounds[i]._ended) return self._sounds[i].reset();
            }
            // If no inactive node was found, create a new one.
            return new Sound1(self);
        },
        /**
     * Drain excess inactive sounds from the pool.
     */ _drain: function() {
            var self = this;
            var limit = self._pool;
            var cnt = 0;
            var i = 0;
            // If there are less sounds than the max pool size, we are done.
            if (self._sounds.length < limit) return;
            // Count the number of inactive sounds.
            for(i = 0; i < self._sounds.length; i++)if (self._sounds[i]._ended) cnt++;
            // Remove excess inactive sounds, going in reverse order.
            for(i = self._sounds.length - 1; i >= 0; i--){
                if (cnt <= limit) return;
                if (self._sounds[i]._ended) {
                    // Disconnect the audio source when using Web Audio.
                    if (self._webAudio && self._sounds[i]._node) self._sounds[i]._node.disconnect(0);
                    // Remove sounds until we have the pool size.
                    self._sounds.splice(i, 1);
                    cnt--;
                }
            }
        },
        /**
     * Get all ID's from the sounds pool.
     * @param  {Number} id Only return one ID if one is passed.
     * @return {Array}    Array of IDs.
     */ _getSoundIds: function(id) {
            var self = this;
            if (typeof id === "undefined") {
                var ids = [];
                for(var i = 0; i < self._sounds.length; i++)ids.push(self._sounds[i]._id);
                return ids;
            } else return [
                id
            ];
        },
        /**
     * Load the sound back into the buffer source.
     * @param  {Sound} sound The sound object to work with.
     * @return {Howl}
     */ _refreshBuffer: function(sound) {
            var self = this;
            // Setup the buffer source for playback.
            sound._node.bufferSource = Howler1.ctx.createBufferSource();
            sound._node.bufferSource.buffer = cache[self._src];
            // Connect to the correct node.
            if (sound._panner) sound._node.bufferSource.connect(sound._panner);
            else sound._node.bufferSource.connect(sound._node);
            // Setup looping and playback rate.
            sound._node.bufferSource.loop = sound._loop;
            if (sound._loop) {
                sound._node.bufferSource.loopStart = sound._start || 0;
                sound._node.bufferSource.loopEnd = sound._stop || 0;
            }
            sound._node.bufferSource.playbackRate.setValueAtTime(sound._rate, Howler1.ctx.currentTime);
            return self;
        },
        /**
     * Prevent memory leaks by cleaning up the buffer source after playback.
     * @param  {Object} node Sound's audio node containing the buffer source.
     * @return {Howl}
     */ _cleanBuffer: function(node) {
            var self = this;
            var isIOS = Howler1._navigator && Howler1._navigator.vendor.indexOf("Apple") >= 0;
            if (Howler1._scratchBuffer && node.bufferSource) {
                node.bufferSource.onended = null;
                node.bufferSource.disconnect(0);
                if (isIOS) try {
                    node.bufferSource.buffer = Howler1._scratchBuffer;
                } catch (e) {}
            }
            node.bufferSource = null;
            return self;
        },
        /**
     * Set the source to a 0-second silence to stop any downloading (except in IE).
     * @param  {Object} node Audio node to clear.
     */ _clearSound: function(node) {
            var checkIE = /MSIE |Trident\//.test(Howler1._navigator && Howler1._navigator.userAgent);
            if (!checkIE) node.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
        }
    };
    /** Single Sound Methods **/ /***************************************************************************/ /**
   * Setup the sound object, which each node attached to a Howl group is contained in.
   * @param {Object} howl The Howl parent group.
   */ var Sound1 = function(howl) {
        this._parent = howl;
        this.init();
    };
    Sound1.prototype = {
        /**
     * Initialize a new Sound object.
     * @return {Sound}
     */ init: function() {
            var self = this;
            var parent = self._parent;
            // Setup the default parameters.
            self._muted = parent._muted;
            self._loop = parent._loop;
            self._volume = parent._volume;
            self._rate = parent._rate;
            self._seek = 0;
            self._paused = true;
            self._ended = true;
            self._sprite = "__default";
            // Generate a unique ID for this sound.
            self._id = ++Howler1._counter;
            // Add itself to the parent's pool.
            parent._sounds.push(self);
            // Create the new node.
            self.create();
            return self;
        },
        /**
     * Create and setup a new sound object, whether HTML5 Audio or Web Audio.
     * @return {Sound}
     */ create: function() {
            var self = this;
            var parent = self._parent;
            var volume = Howler1._muted || self._muted || self._parent._muted ? 0 : self._volume;
            if (parent._webAudio) {
                // Create the gain node for controlling volume (the source will connect to this).
                self._node = typeof Howler1.ctx.createGain === "undefined" ? Howler1.ctx.createGainNode() : Howler1.ctx.createGain();
                self._node.gain.setValueAtTime(volume, Howler1.ctx.currentTime);
                self._node.paused = true;
                self._node.connect(Howler1.masterGain);
            } else if (!Howler1.noAudio) {
                // Get an unlocked Audio object from the pool.
                self._node = Howler1._obtainHtml5Audio();
                // Listen for errors (http://dev.w3.org/html5/spec-author-view/spec.html#mediaerror).
                self._errorFn = self._errorListener.bind(self);
                self._node.addEventListener("error", self._errorFn, false);
                // Listen for 'canplaythrough' event to let us know the sound is ready.
                self._loadFn = self._loadListener.bind(self);
                self._node.addEventListener(Howler1._canPlayEvent, self._loadFn, false);
                // Listen for the 'ended' event on the sound to account for edge-case where
                // a finite sound has a duration of Infinity.
                self._endFn = self._endListener.bind(self);
                self._node.addEventListener("ended", self._endFn, false);
                // Setup the new audio node.
                self._node.src = parent._src;
                self._node.preload = parent._preload === true ? "auto" : parent._preload;
                self._node.volume = volume * Howler1.volume();
                // Begin loading the source.
                self._node.load();
            }
            return self;
        },
        /**
     * Reset the parameters of this sound to the original state (for recycle).
     * @return {Sound}
     */ reset: function() {
            var self = this;
            var parent = self._parent;
            // Reset all of the parameters of this sound.
            self._muted = parent._muted;
            self._loop = parent._loop;
            self._volume = parent._volume;
            self._rate = parent._rate;
            self._seek = 0;
            self._rateSeek = 0;
            self._paused = true;
            self._ended = true;
            self._sprite = "__default";
            // Generate a new ID so that it isn't confused with the previous sound.
            self._id = ++Howler1._counter;
            return self;
        },
        /**
     * HTML5 Audio error listener callback.
     */ _errorListener: function() {
            var self = this;
            // Fire an error event and pass back the code.
            self._parent._emit("loaderror", self._id, self._node.error ? self._node.error.code : 0);
            // Clear the event listener.
            self._node.removeEventListener("error", self._errorFn, false);
        },
        /**
     * HTML5 Audio canplaythrough listener callback.
     */ _loadListener: function() {
            var self = this;
            var parent = self._parent;
            // Round up the duration to account for the lower precision in HTML5 Audio.
            parent._duration = Math.ceil(self._node.duration * 10) / 10;
            // Setup a sprite if none is defined.
            if (Object.keys(parent._sprite).length === 0) parent._sprite = {
                __default: [
                    0,
                    parent._duration * 1000
                ]
            };
            if (parent._state !== "loaded") {
                parent._state = "loaded";
                parent._emit("load");
                parent._loadQueue();
            }
            // Clear the event listener.
            self._node.removeEventListener(Howler1._canPlayEvent, self._loadFn, false);
        },
        /**
     * HTML5 Audio ended listener callback.
     */ _endListener: function() {
            var self = this;
            var parent = self._parent;
            // Only handle the `ended`` event if the duration is Infinity.
            if (parent._duration === Infinity) {
                // Update the parent duration to match the real audio duration.
                // Round up the duration to account for the lower precision in HTML5 Audio.
                parent._duration = Math.ceil(self._node.duration * 10) / 10;
                // Update the sprite that corresponds to the real duration.
                if (parent._sprite.__default[1] === Infinity) parent._sprite.__default[1] = parent._duration * 1000;
                // Run the regular ended method.
                parent._ended(self);
            }
            // Clear the event listener since the duration is now correct.
            self._node.removeEventListener("ended", self._endFn, false);
        }
    };
    /** Helper Methods **/ /***************************************************************************/ var cache = {};
    /**
   * Buffer a sound from URL, Data URI or cache and decode to audio source (Web Audio API).
   * @param  {Howl} self
   */ var loadBuffer = function(self) {
        var url = self._src;
        // Check if the buffer has already been cached and use it instead.
        if (cache[url]) {
            // Set the duration from the cache.
            self._duration = cache[url].duration;
            // Load the sound into this Howl.
            loadSound(self);
            return;
        }
        if (/^data:[^;]+;base64,/.test(url)) {
            // Decode the base64 data URI without XHR, since some browsers don't support it.
            var data = atob(url.split(",")[1]);
            var dataView = new Uint8Array(data.length);
            for(var i = 0; i < data.length; ++i)dataView[i] = data.charCodeAt(i);
            decodeAudioData(dataView.buffer, self);
        } else {
            // Load the buffer from the URL.
            var xhr = new XMLHttpRequest();
            xhr.open(self._xhr.method, url, true);
            xhr.withCredentials = self._xhr.withCredentials;
            xhr.responseType = "arraybuffer";
            // Apply any custom headers to the request.
            if (self._xhr.headers) Object.keys(self._xhr.headers).forEach(function(key) {
                xhr.setRequestHeader(key, self._xhr.headers[key]);
            });
            xhr.onload = function() {
                // Make sure we get a successful response back.
                var code = (xhr.status + "")[0];
                if (code !== "0" && code !== "2" && code !== "3") {
                    self._emit("loaderror", null, "Failed loading audio file with status: " + xhr.status + ".");
                    return;
                }
                decodeAudioData(xhr.response, self);
            };
            xhr.onerror = function() {
                // If there is an error, switch to HTML5 Audio.
                if (self._webAudio) {
                    self._html5 = true;
                    self._webAudio = false;
                    self._sounds = [];
                    delete cache[url];
                    self.load();
                }
            };
            safeXhrSend(xhr);
        }
    };
    /**
   * Send the XHR request wrapped in a try/catch.
   * @param  {Object} xhr XHR to send.
   */ var safeXhrSend = function(xhr) {
        try {
            xhr.send();
        } catch (e) {
            xhr.onerror();
        }
    };
    /**
   * Decode audio data from an array buffer.
   * @param  {ArrayBuffer} arraybuffer The audio data.
   * @param  {Howl}        self
   */ var decodeAudioData = function(arraybuffer, self) {
        // Fire a load error if something broke.
        var error = function() {
            self._emit("loaderror", null, "Decoding audio data failed.");
        };
        // Load the sound on success.
        var success = function(buffer) {
            if (buffer && self._sounds.length > 0) {
                cache[self._src] = buffer;
                loadSound(self, buffer);
            } else error();
        };
        // Decode the buffer into an audio source.
        if (typeof Promise !== "undefined" && Howler1.ctx.decodeAudioData.length === 1) Howler1.ctx.decodeAudioData(arraybuffer).then(success).catch(error);
        else Howler1.ctx.decodeAudioData(arraybuffer, success, error);
    };
    /**
   * Sound is now loaded, so finish setting everything up and fire the loaded event.
   * @param  {Howl} self
   * @param  {Object} buffer The decoded buffer sound source.
   */ var loadSound = function(self, buffer) {
        // Set the duration.
        if (buffer && !self._duration) self._duration = buffer.duration;
        // Setup a sprite if none is defined.
        if (Object.keys(self._sprite).length === 0) self._sprite = {
            __default: [
                0,
                self._duration * 1000
            ]
        };
        // Fire the loaded event.
        if (self._state !== "loaded") {
            self._state = "loaded";
            self._emit("load");
            self._loadQueue();
        }
    };
    /**
   * Setup the audio context when available, or switch to HTML5 Audio mode.
   */ var setupAudioContext = function() {
        // If we have already detected that Web Audio isn't supported, don't run this step again.
        if (!Howler1.usingWebAudio) return;
        // Check if we are using Web Audio and setup the AudioContext if we are.
        try {
            if (typeof AudioContext !== "undefined") Howler1.ctx = new AudioContext();
            else if (typeof webkitAudioContext !== "undefined") Howler1.ctx = new webkitAudioContext();
            else Howler1.usingWebAudio = false;
        } catch (e) {
            Howler1.usingWebAudio = false;
        }
        // If the audio context creation still failed, set using web audio to false.
        if (!Howler1.ctx) Howler1.usingWebAudio = false;
        // Check if a webview is being used on iOS8 or earlier (rather than the browser).
        // If it is, disable Web Audio as it causes crashing.
        var iOS = /iP(hone|od|ad)/.test(Howler1._navigator && Howler1._navigator.platform);
        var appVersion = Howler1._navigator && Howler1._navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
        var version = appVersion ? parseInt(appVersion[1], 10) : null;
        if (iOS && version && version < 9) {
            var safari = /safari/.test(Howler1._navigator && Howler1._navigator.userAgent.toLowerCase());
            if (Howler1._navigator && !safari) Howler1.usingWebAudio = false;
        }
        // Create and expose the master GainNode when using Web Audio (useful for plugins or advanced usage).
        if (Howler1.usingWebAudio) {
            Howler1.masterGain = typeof Howler1.ctx.createGain === "undefined" ? Howler1.ctx.createGainNode() : Howler1.ctx.createGain();
            Howler1.masterGain.gain.setValueAtTime(Howler1._muted ? 0 : Howler1._volume, Howler1.ctx.currentTime);
            Howler1.masterGain.connect(Howler1.ctx.destination);
        }
        // Re-run the setup on Howler.
        Howler1._setup();
    };
    // Add support for AMD (Asynchronous Module Definition) libraries such as require.js.
    if (typeof define === "function" && define.amd) define([], function() {
        return {
            Howler: Howler1,
            Howl: Howl1
        };
    });
    exports.Howler = Howler1;
    exports.Howl = Howl1;
    // Add to global in Node.js (for testing, etc).
    if (typeof global !== "undefined") {
        global.HowlerGlobal = HowlerGlobal1;
        global.Howler = Howler1;
        global.Howl = Howl1;
        global.Sound = Sound1;
    } else if (typeof window !== "undefined") {
        window.HowlerGlobal = HowlerGlobal1;
        window.Howler = Howler1;
        window.Howl = Howl1;
        window.Sound = Sound1;
    }
})();
/*!
 *  Spatial Plugin - Adds support for stereo and 3D audio where Web Audio is supported.
 *  
 *  howler.js v2.2.3
 *  howlerjs.com
 *
 *  (c) 2013-2020, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */ (function() {
    "use strict";
    // Setup default properties.
    HowlerGlobal.prototype._pos = [
        0,
        0,
        0
    ];
    HowlerGlobal.prototype._orientation = [
        0,
        0,
        -1,
        0,
        1,
        0
    ];
    /** Global Methods **/ /***************************************************************************/ /**
   * Helper method to update the stereo panning position of all current Howls.
   * Future Howls will not use this value unless explicitly set.
   * @param  {Number} pan A value of -1.0 is all the way left and 1.0 is all the way right.
   * @return {Howler/Number}     Self or current stereo panning value.
   */ HowlerGlobal.prototype.stereo = function(pan) {
        var self = this;
        // Stop right here if not using Web Audio.
        if (!self.ctx || !self.ctx.listener) return self;
        // Loop through all Howls and update their stereo panning.
        for(var i = self._howls.length - 1; i >= 0; i--)self._howls[i].stereo(pan);
        return self;
    };
    /**
   * Get/set the position of the listener in 3D cartesian space. Sounds using
   * 3D position will be relative to the listener's position.
   * @param  {Number} x The x-position of the listener.
   * @param  {Number} y The y-position of the listener.
   * @param  {Number} z The z-position of the listener.
   * @return {Howler/Array}   Self or current listener position.
   */ HowlerGlobal.prototype.pos = function(x, y, z) {
        var self = this;
        // Stop right here if not using Web Audio.
        if (!self.ctx || !self.ctx.listener) return self;
        // Set the defaults for optional 'y' & 'z'.
        y = typeof y !== "number" ? self._pos[1] : y;
        z = typeof z !== "number" ? self._pos[2] : z;
        if (typeof x === "number") {
            self._pos = [
                x,
                y,
                z
            ];
            if (typeof self.ctx.listener.positionX !== "undefined") {
                self.ctx.listener.positionX.setTargetAtTime(self._pos[0], Howler.ctx.currentTime, 0.1);
                self.ctx.listener.positionY.setTargetAtTime(self._pos[1], Howler.ctx.currentTime, 0.1);
                self.ctx.listener.positionZ.setTargetAtTime(self._pos[2], Howler.ctx.currentTime, 0.1);
            } else self.ctx.listener.setPosition(self._pos[0], self._pos[1], self._pos[2]);
        } else return self._pos;
        return self;
    };
    /**
   * Get/set the direction the listener is pointing in the 3D cartesian space.
   * A front and up vector must be provided. The front is the direction the
   * face of the listener is pointing, and up is the direction the top of the
   * listener is pointing. Thus, these values are expected to be at right angles
   * from each other.
   * @param  {Number} x   The x-orientation of the listener.
   * @param  {Number} y   The y-orientation of the listener.
   * @param  {Number} z   The z-orientation of the listener.
   * @param  {Number} xUp The x-orientation of the top of the listener.
   * @param  {Number} yUp The y-orientation of the top of the listener.
   * @param  {Number} zUp The z-orientation of the top of the listener.
   * @return {Howler/Array}     Returns self or the current orientation vectors.
   */ HowlerGlobal.prototype.orientation = function(x, y, z, xUp, yUp, zUp) {
        var self = this;
        // Stop right here if not using Web Audio.
        if (!self.ctx || !self.ctx.listener) return self;
        // Set the defaults for optional 'y' & 'z'.
        var or = self._orientation;
        y = typeof y !== "number" ? or[1] : y;
        z = typeof z !== "number" ? or[2] : z;
        xUp = typeof xUp !== "number" ? or[3] : xUp;
        yUp = typeof yUp !== "number" ? or[4] : yUp;
        zUp = typeof zUp !== "number" ? or[5] : zUp;
        if (typeof x === "number") {
            self._orientation = [
                x,
                y,
                z,
                xUp,
                yUp,
                zUp
            ];
            if (typeof self.ctx.listener.forwardX !== "undefined") {
                self.ctx.listener.forwardX.setTargetAtTime(x, Howler.ctx.currentTime, 0.1);
                self.ctx.listener.forwardY.setTargetAtTime(y, Howler.ctx.currentTime, 0.1);
                self.ctx.listener.forwardZ.setTargetAtTime(z, Howler.ctx.currentTime, 0.1);
                self.ctx.listener.upX.setTargetAtTime(xUp, Howler.ctx.currentTime, 0.1);
                self.ctx.listener.upY.setTargetAtTime(yUp, Howler.ctx.currentTime, 0.1);
                self.ctx.listener.upZ.setTargetAtTime(zUp, Howler.ctx.currentTime, 0.1);
            } else self.ctx.listener.setOrientation(x, y, z, xUp, yUp, zUp);
        } else return or;
        return self;
    };
    /** Group Methods **/ /***************************************************************************/ /**
   * Add new properties to the core init.
   * @param  {Function} _super Core init method.
   * @return {Howl}
   */ Howl.prototype.init = function(_super) {
        return function(o) {
            var self = this;
            // Setup user-defined default properties.
            self._orientation = o.orientation || [
                1,
                0,
                0
            ];
            self._stereo = o.stereo || null;
            self._pos = o.pos || null;
            self._pannerAttr = {
                coneInnerAngle: typeof o.coneInnerAngle !== "undefined" ? o.coneInnerAngle : 360,
                coneOuterAngle: typeof o.coneOuterAngle !== "undefined" ? o.coneOuterAngle : 360,
                coneOuterGain: typeof o.coneOuterGain !== "undefined" ? o.coneOuterGain : 0,
                distanceModel: typeof o.distanceModel !== "undefined" ? o.distanceModel : "inverse",
                maxDistance: typeof o.maxDistance !== "undefined" ? o.maxDistance : 10000,
                panningModel: typeof o.panningModel !== "undefined" ? o.panningModel : "HRTF",
                refDistance: typeof o.refDistance !== "undefined" ? o.refDistance : 1,
                rolloffFactor: typeof o.rolloffFactor !== "undefined" ? o.rolloffFactor : 1
            };
            // Setup event listeners.
            self._onstereo = o.onstereo ? [
                {
                    fn: o.onstereo
                }
            ] : [];
            self._onpos = o.onpos ? [
                {
                    fn: o.onpos
                }
            ] : [];
            self._onorientation = o.onorientation ? [
                {
                    fn: o.onorientation
                }
            ] : [];
            // Complete initilization with howler.js core's init function.
            return _super.call(this, o);
        };
    }(Howl.prototype.init);
    /**
   * Get/set the stereo panning of the audio source for this sound or all in the group.
   * @param  {Number} pan  A value of -1.0 is all the way left and 1.0 is all the way right.
   * @param  {Number} id (optional) The sound ID. If none is passed, all in group will be updated.
   * @return {Howl/Number}    Returns self or the current stereo panning value.
   */ Howl.prototype.stereo = function(pan, id) {
        var self = this;
        // Stop right here if not using Web Audio.
        if (!self._webAudio) return self;
        // If the sound hasn't loaded, add it to the load queue to change stereo pan when capable.
        if (self._state !== "loaded") {
            self._queue.push({
                event: "stereo",
                action: function() {
                    self.stereo(pan, id);
                }
            });
            return self;
        }
        // Check for PannerStereoNode support and fallback to PannerNode if it doesn't exist.
        var pannerType = typeof Howler.ctx.createStereoPanner === "undefined" ? "spatial" : "stereo";
        // Setup the group's stereo panning if no ID is passed.
        if (typeof id === "undefined") {
            // Return the group's stereo panning if no parameters are passed.
            if (typeof pan === "number") {
                self._stereo = pan;
                self._pos = [
                    pan,
                    0,
                    0
                ];
            } else return self._stereo;
        }
        // Change the streo panning of one or all sounds in group.
        var ids = self._getSoundIds(id);
        for(var i = 0; i < ids.length; i++){
            // Get the sound.
            var sound = self._soundById(ids[i]);
            if (sound) {
                if (typeof pan === "number") {
                    sound._stereo = pan;
                    sound._pos = [
                        pan,
                        0,
                        0
                    ];
                    if (sound._node) {
                        // If we are falling back, make sure the panningModel is equalpower.
                        sound._pannerAttr.panningModel = "equalpower";
                        // Check if there is a panner setup and create a new one if not.
                        if (!sound._panner || !sound._panner.pan) setupPanner(sound, pannerType);
                        if (pannerType === "spatial") {
                            if (typeof sound._panner.positionX !== "undefined") {
                                sound._panner.positionX.setValueAtTime(pan, Howler.ctx.currentTime);
                                sound._panner.positionY.setValueAtTime(0, Howler.ctx.currentTime);
                                sound._panner.positionZ.setValueAtTime(0, Howler.ctx.currentTime);
                            } else sound._panner.setPosition(pan, 0, 0);
                        } else sound._panner.pan.setValueAtTime(pan, Howler.ctx.currentTime);
                    }
                    self._emit("stereo", sound._id);
                } else return sound._stereo;
            }
        }
        return self;
    };
    /**
   * Get/set the 3D spatial position of the audio source for this sound or group relative to the global listener.
   * @param  {Number} x  The x-position of the audio source.
   * @param  {Number} y  The y-position of the audio source.
   * @param  {Number} z  The z-position of the audio source.
   * @param  {Number} id (optional) The sound ID. If none is passed, all in group will be updated.
   * @return {Howl/Array}    Returns self or the current 3D spatial position: [x, y, z].
   */ Howl.prototype.pos = function(x, y, z, id) {
        var self = this;
        // Stop right here if not using Web Audio.
        if (!self._webAudio) return self;
        // If the sound hasn't loaded, add it to the load queue to change position when capable.
        if (self._state !== "loaded") {
            self._queue.push({
                event: "pos",
                action: function() {
                    self.pos(x, y, z, id);
                }
            });
            return self;
        }
        // Set the defaults for optional 'y' & 'z'.
        y = typeof y !== "number" ? 0 : y;
        z = typeof z !== "number" ? -0.5 : z;
        // Setup the group's spatial position if no ID is passed.
        if (typeof id === "undefined") {
            // Return the group's spatial position if no parameters are passed.
            if (typeof x === "number") self._pos = [
                x,
                y,
                z
            ];
            else return self._pos;
        }
        // Change the spatial position of one or all sounds in group.
        var ids = self._getSoundIds(id);
        for(var i = 0; i < ids.length; i++){
            // Get the sound.
            var sound = self._soundById(ids[i]);
            if (sound) {
                if (typeof x === "number") {
                    sound._pos = [
                        x,
                        y,
                        z
                    ];
                    if (sound._node) {
                        // Check if there is a panner setup and create a new one if not.
                        if (!sound._panner || sound._panner.pan) setupPanner(sound, "spatial");
                        if (typeof sound._panner.positionX !== "undefined") {
                            sound._panner.positionX.setValueAtTime(x, Howler.ctx.currentTime);
                            sound._panner.positionY.setValueAtTime(y, Howler.ctx.currentTime);
                            sound._panner.positionZ.setValueAtTime(z, Howler.ctx.currentTime);
                        } else sound._panner.setPosition(x, y, z);
                    }
                    self._emit("pos", sound._id);
                } else return sound._pos;
            }
        }
        return self;
    };
    /**
   * Get/set the direction the audio source is pointing in the 3D cartesian coordinate
   * space. Depending on how direction the sound is, based on the `cone` attributes,
   * a sound pointing away from the listener can be quiet or silent.
   * @param  {Number} x  The x-orientation of the source.
   * @param  {Number} y  The y-orientation of the source.
   * @param  {Number} z  The z-orientation of the source.
   * @param  {Number} id (optional) The sound ID. If none is passed, all in group will be updated.
   * @return {Howl/Array}    Returns self or the current 3D spatial orientation: [x, y, z].
   */ Howl.prototype.orientation = function(x, y, z, id) {
        var self = this;
        // Stop right here if not using Web Audio.
        if (!self._webAudio) return self;
        // If the sound hasn't loaded, add it to the load queue to change orientation when capable.
        if (self._state !== "loaded") {
            self._queue.push({
                event: "orientation",
                action: function() {
                    self.orientation(x, y, z, id);
                }
            });
            return self;
        }
        // Set the defaults for optional 'y' & 'z'.
        y = typeof y !== "number" ? self._orientation[1] : y;
        z = typeof z !== "number" ? self._orientation[2] : z;
        // Setup the group's spatial orientation if no ID is passed.
        if (typeof id === "undefined") {
            // Return the group's spatial orientation if no parameters are passed.
            if (typeof x === "number") self._orientation = [
                x,
                y,
                z
            ];
            else return self._orientation;
        }
        // Change the spatial orientation of one or all sounds in group.
        var ids = self._getSoundIds(id);
        for(var i = 0; i < ids.length; i++){
            // Get the sound.
            var sound = self._soundById(ids[i]);
            if (sound) {
                if (typeof x === "number") {
                    sound._orientation = [
                        x,
                        y,
                        z
                    ];
                    if (sound._node) {
                        // Check if there is a panner setup and create a new one if not.
                        if (!sound._panner) {
                            // Make sure we have a position to setup the node with.
                            if (!sound._pos) sound._pos = self._pos || [
                                0,
                                0,
                                -0.5
                            ];
                            setupPanner(sound, "spatial");
                        }
                        if (typeof sound._panner.orientationX !== "undefined") {
                            sound._panner.orientationX.setValueAtTime(x, Howler.ctx.currentTime);
                            sound._panner.orientationY.setValueAtTime(y, Howler.ctx.currentTime);
                            sound._panner.orientationZ.setValueAtTime(z, Howler.ctx.currentTime);
                        } else sound._panner.setOrientation(x, y, z);
                    }
                    self._emit("orientation", sound._id);
                } else return sound._orientation;
            }
        }
        return self;
    };
    /**
   * Get/set the panner node's attributes for a sound or group of sounds.
   * This method can optionall take 0, 1 or 2 arguments.
   *   pannerAttr() -> Returns the group's values.
   *   pannerAttr(id) -> Returns the sound id's values.
   *   pannerAttr(o) -> Set's the values of all sounds in this Howl group.
   *   pannerAttr(o, id) -> Set's the values of passed sound id.
   *
   *   Attributes:
   *     coneInnerAngle - (360 by default) A parameter for directional audio sources, this is an angle, in degrees,
   *                      inside of which there will be no volume reduction.
   *     coneOuterAngle - (360 by default) A parameter for directional audio sources, this is an angle, in degrees,
   *                      outside of which the volume will be reduced to a constant value of `coneOuterGain`.
   *     coneOuterGain - (0 by default) A parameter for directional audio sources, this is the gain outside of the
   *                     `coneOuterAngle`. It is a linear value in the range `[0, 1]`.
   *     distanceModel - ('inverse' by default) Determines algorithm used to reduce volume as audio moves away from
   *                     listener. Can be `linear`, `inverse` or `exponential.
   *     maxDistance - (10000 by default) The maximum distance between source and listener, after which the volume
   *                   will not be reduced any further.
   *     refDistance - (1 by default) A reference distance for reducing volume as source moves further from the listener.
   *                   This is simply a variable of the distance model and has a different effect depending on which model
   *                   is used and the scale of your coordinates. Generally, volume will be equal to 1 at this distance.
   *     rolloffFactor - (1 by default) How quickly the volume reduces as source moves from listener. This is simply a
   *                     variable of the distance model and can be in the range of `[0, 1]` with `linear` and `[0, ∞]`
   *                     with `inverse` and `exponential`.
   *     panningModel - ('HRTF' by default) Determines which spatialization algorithm is used to position audio.
   *                     Can be `HRTF` or `equalpower`.
   *
   * @return {Howl/Object} Returns self or current panner attributes.
   */ Howl.prototype.pannerAttr = function() {
        var self = this;
        var args = arguments;
        var o, id, sound;
        // Stop right here if not using Web Audio.
        if (!self._webAudio) return self;
        // Determine the values based on arguments.
        if (args.length === 0) // Return the group's panner attribute values.
        return self._pannerAttr;
        else if (args.length === 1) {
            if (typeof args[0] === "object") {
                o = args[0];
                // Set the grou's panner attribute values.
                if (typeof id === "undefined") {
                    if (!o.pannerAttr) o.pannerAttr = {
                        coneInnerAngle: o.coneInnerAngle,
                        coneOuterAngle: o.coneOuterAngle,
                        coneOuterGain: o.coneOuterGain,
                        distanceModel: o.distanceModel,
                        maxDistance: o.maxDistance,
                        refDistance: o.refDistance,
                        rolloffFactor: o.rolloffFactor,
                        panningModel: o.panningModel
                    };
                    self._pannerAttr = {
                        coneInnerAngle: typeof o.pannerAttr.coneInnerAngle !== "undefined" ? o.pannerAttr.coneInnerAngle : self._coneInnerAngle,
                        coneOuterAngle: typeof o.pannerAttr.coneOuterAngle !== "undefined" ? o.pannerAttr.coneOuterAngle : self._coneOuterAngle,
                        coneOuterGain: typeof o.pannerAttr.coneOuterGain !== "undefined" ? o.pannerAttr.coneOuterGain : self._coneOuterGain,
                        distanceModel: typeof o.pannerAttr.distanceModel !== "undefined" ? o.pannerAttr.distanceModel : self._distanceModel,
                        maxDistance: typeof o.pannerAttr.maxDistance !== "undefined" ? o.pannerAttr.maxDistance : self._maxDistance,
                        refDistance: typeof o.pannerAttr.refDistance !== "undefined" ? o.pannerAttr.refDistance : self._refDistance,
                        rolloffFactor: typeof o.pannerAttr.rolloffFactor !== "undefined" ? o.pannerAttr.rolloffFactor : self._rolloffFactor,
                        panningModel: typeof o.pannerAttr.panningModel !== "undefined" ? o.pannerAttr.panningModel : self._panningModel
                    };
                }
            } else {
                // Return this sound's panner attribute values.
                sound = self._soundById(parseInt(args[0], 10));
                return sound ? sound._pannerAttr : self._pannerAttr;
            }
        } else if (args.length === 2) {
            o = args[0];
            id = parseInt(args[1], 10);
        }
        // Update the values of the specified sounds.
        var ids = self._getSoundIds(id);
        for(var i = 0; i < ids.length; i++){
            sound = self._soundById(ids[i]);
            if (sound) {
                // Merge the new values into the sound.
                var pa = sound._pannerAttr;
                pa = {
                    coneInnerAngle: typeof o.coneInnerAngle !== "undefined" ? o.coneInnerAngle : pa.coneInnerAngle,
                    coneOuterAngle: typeof o.coneOuterAngle !== "undefined" ? o.coneOuterAngle : pa.coneOuterAngle,
                    coneOuterGain: typeof o.coneOuterGain !== "undefined" ? o.coneOuterGain : pa.coneOuterGain,
                    distanceModel: typeof o.distanceModel !== "undefined" ? o.distanceModel : pa.distanceModel,
                    maxDistance: typeof o.maxDistance !== "undefined" ? o.maxDistance : pa.maxDistance,
                    refDistance: typeof o.refDistance !== "undefined" ? o.refDistance : pa.refDistance,
                    rolloffFactor: typeof o.rolloffFactor !== "undefined" ? o.rolloffFactor : pa.rolloffFactor,
                    panningModel: typeof o.panningModel !== "undefined" ? o.panningModel : pa.panningModel
                };
                // Update the panner values or create a new panner if none exists.
                var panner = sound._panner;
                if (panner) {
                    panner.coneInnerAngle = pa.coneInnerAngle;
                    panner.coneOuterAngle = pa.coneOuterAngle;
                    panner.coneOuterGain = pa.coneOuterGain;
                    panner.distanceModel = pa.distanceModel;
                    panner.maxDistance = pa.maxDistance;
                    panner.refDistance = pa.refDistance;
                    panner.rolloffFactor = pa.rolloffFactor;
                    panner.panningModel = pa.panningModel;
                } else {
                    // Make sure we have a position to setup the node with.
                    if (!sound._pos) sound._pos = self._pos || [
                        0,
                        0,
                        -0.5
                    ];
                    // Create a new panner node.
                    setupPanner(sound, "spatial");
                }
            }
        }
        return self;
    };
    /** Single Sound Methods **/ /***************************************************************************/ /**
   * Add new properties to the core Sound init.
   * @param  {Function} _super Core Sound init method.
   * @return {Sound}
   */ Sound.prototype.init = function(_super) {
        return function() {
            var self = this;
            var parent = self._parent;
            // Setup user-defined default properties.
            self._orientation = parent._orientation;
            self._stereo = parent._stereo;
            self._pos = parent._pos;
            self._pannerAttr = parent._pannerAttr;
            // Complete initilization with howler.js core Sound's init function.
            _super.call(this);
            // If a stereo or position was specified, set it up.
            if (self._stereo) parent.stereo(self._stereo);
            else if (self._pos) parent.pos(self._pos[0], self._pos[1], self._pos[2], self._id);
        };
    }(Sound.prototype.init);
    /**
   * Override the Sound.reset method to clean up properties from the spatial plugin.
   * @param  {Function} _super Sound reset method.
   * @return {Sound}
   */ Sound.prototype.reset = function(_super) {
        return function() {
            var self = this;
            var parent = self._parent;
            // Reset all spatial plugin properties on this sound.
            self._orientation = parent._orientation;
            self._stereo = parent._stereo;
            self._pos = parent._pos;
            self._pannerAttr = parent._pannerAttr;
            // If a stereo or position was specified, set it up.
            if (self._stereo) parent.stereo(self._stereo);
            else if (self._pos) parent.pos(self._pos[0], self._pos[1], self._pos[2], self._id);
            else if (self._panner) {
                // Disconnect the panner.
                self._panner.disconnect(0);
                self._panner = undefined;
                parent._refreshBuffer(self);
            }
            // Complete resetting of the sound.
            return _super.call(this);
        };
    }(Sound.prototype.reset);
    /** Helper Methods **/ /***************************************************************************/ /**
   * Create a new panner node and save it on the sound.
   * @param  {Sound} sound Specific sound to setup panning on.
   * @param {String} type Type of panner to create: 'stereo' or 'spatial'.
   */ var setupPanner = function(sound, type) {
        type = type || "spatial";
        // Create the new panner node.
        if (type === "spatial") {
            sound._panner = Howler.ctx.createPanner();
            sound._panner.coneInnerAngle = sound._pannerAttr.coneInnerAngle;
            sound._panner.coneOuterAngle = sound._pannerAttr.coneOuterAngle;
            sound._panner.coneOuterGain = sound._pannerAttr.coneOuterGain;
            sound._panner.distanceModel = sound._pannerAttr.distanceModel;
            sound._panner.maxDistance = sound._pannerAttr.maxDistance;
            sound._panner.refDistance = sound._pannerAttr.refDistance;
            sound._panner.rolloffFactor = sound._pannerAttr.rolloffFactor;
            sound._panner.panningModel = sound._pannerAttr.panningModel;
            if (typeof sound._panner.positionX !== "undefined") {
                sound._panner.positionX.setValueAtTime(sound._pos[0], Howler.ctx.currentTime);
                sound._panner.positionY.setValueAtTime(sound._pos[1], Howler.ctx.currentTime);
                sound._panner.positionZ.setValueAtTime(sound._pos[2], Howler.ctx.currentTime);
            } else sound._panner.setPosition(sound._pos[0], sound._pos[1], sound._pos[2]);
            if (typeof sound._panner.orientationX !== "undefined") {
                sound._panner.orientationX.setValueAtTime(sound._orientation[0], Howler.ctx.currentTime);
                sound._panner.orientationY.setValueAtTime(sound._orientation[1], Howler.ctx.currentTime);
                sound._panner.orientationZ.setValueAtTime(sound._orientation[2], Howler.ctx.currentTime);
            } else sound._panner.setOrientation(sound._orientation[0], sound._orientation[1], sound._orientation[2]);
        } else {
            sound._panner = Howler.ctx.createStereoPanner();
            sound._panner.pan.setValueAtTime(sound._stereo, Howler.ctx.currentTime);
        }
        sound._panner.connect(sound._node);
        // Update the connections.
        if (!sound._paused) sound._parent.pause(sound._id, true).play(sound._id, true);
    };
})();

},{}],"9zKUC":[function(require,module,exports) {
module.exports = require("41e4b2c1dda6b973").getBundleURL("lf1OY") + "Minstrel_Dance.1ffad141.mp3" + "?" + Date.now();

},{"41e4b2c1dda6b973":"lgJ39"}],"cHoSB":[function(require,module,exports) {
module.exports = require("f906aa5070df93ad").getBundleURL("lf1OY") + "level-requirement-1.571b17b1.mp3" + "?" + Date.now();

},{"f906aa5070df93ad":"lgJ39"}],"iNzdT":[function(require,module,exports) {
module.exports = require("b5c66c6f174b419d").getBundleURL("lf1OY") + "level-requirement-2.f84b8465.mp3" + "?" + Date.now();

},{"b5c66c6f174b419d":"lgJ39"}],"04Z21":[function(require,module,exports) {
module.exports = require("ca5b61f496b2dd7b").getBundleURL("lf1OY") + "lose-game-over.a878a217.mp3" + "?" + Date.now();

},{"ca5b61f496b2dd7b":"lgJ39"}],"1SIsy":[function(require,module,exports) {
module.exports = require("2fb24ee88a800e4d").getBundleURL("lf1OY") + "Minstrel Dance Easter Egg.a4d96f81.mp3" + "?" + Date.now();

},{"2fb24ee88a800e4d":"lgJ39"}],"9JVPU":[function(require,module,exports) {
module.exports = require("21876527de980903").getBundleURL("lf1OY") + "footstep-wood.8690031b.mp3" + "?" + Date.now();

},{"21876527de980903":"lgJ39"}],"fGTkM":[function(require,module,exports) {
module.exports = require("367f1b751b37cf4d").getBundleURL("lf1OY") + "footstep-tile.e4daf0bf.mp3" + "?" + Date.now();

},{"367f1b751b37cf4d":"lgJ39"}],"k14gH":[function(require,module,exports) {
module.exports = require("40f53fa2ce15e91b").getBundleURL("lf1OY") + "footstep-water.9888f7f5.mp3" + "?" + Date.now();

},{"40f53fa2ce15e91b":"lgJ39"}],"5GAcE":[function(require,module,exports) {
module.exports = require("e5f8326c78171127").getBundleURL("lf1OY") + "footstep-gravel.01f28ef2.mp3" + "?" + Date.now();

},{"e5f8326c78171127":"lgJ39"}],"f1aB8":[function(require,module,exports) {
module.exports = require("368008586e9916c2").getBundleURL("lf1OY") + "footstep-grass.e4966900.mp3" + "?" + Date.now();

},{"368008586e9916c2":"lgJ39"}],"kGQAb":[function(require,module,exports) {
module.exports = require("56904baf78b36ad2").getBundleURL("lf1OY") + "creak.1d93b972.mp3" + "?" + Date.now();

},{"56904baf78b36ad2":"lgJ39"}],"2XGfn":[function(require,module,exports) {
module.exports = require("53ecc84a358d5a60").getBundleURL("lf1OY") + "creak-2.a1adac63.mp3" + "?" + Date.now();

},{"53ecc84a358d5a60":"lgJ39"}],"2r6eZ":[function(require,module,exports) {
module.exports = require("a637a2ed1a308728").getBundleURL("lf1OY") + "creak-3.bdf1752d.mp3" + "?" + Date.now();

},{"a637a2ed1a308728":"lgJ39"}],"7ei1H":[function(require,module,exports) {
module.exports = require("814c39de272aed25").getBundleURL("lf1OY") + "creak-4.851b4602.mp3" + "?" + Date.now();

},{"814c39de272aed25":"lgJ39"}],"jg9uN":[function(require,module,exports) {
module.exports = require("f98b522544c24f8f").getBundleURL("lf1OY") + "creak-5.7a5a448b.mp3" + "?" + Date.now();

},{"f98b522544c24f8f":"lgJ39"}],"gj9kS":[function(require,module,exports) {
module.exports = require("8d08cca99c6704a4").getBundleURL("lf1OY") + "creak-6.40a39a61.mp3" + "?" + Date.now();

},{"8d08cca99c6704a4":"lgJ39"}],"26zV0":[function(require,module,exports) {
module.exports = require("408371f775185a8f").getBundleURL("lf1OY") + "squeak1.a56771a8.wav" + "?" + Date.now();

},{"408371f775185a8f":"lgJ39"}],"5s0T0":[function(require,module,exports) {
module.exports = require("2758fd19d281c69f").getBundleURL("lf1OY") + "squeak2.22cf1d83.wav" + "?" + Date.now();

},{"2758fd19d281c69f":"lgJ39"}],"36S8f":[function(require,module,exports) {
module.exports = require("2fc2d8a254aa3017").getBundleURL("lf1OY") + "squeak3.29042a05.wav" + "?" + Date.now();

},{"2fc2d8a254aa3017":"lgJ39"}],"6ptWC":[function(require,module,exports) {
module.exports = require("d1c0885f741362f8").getBundleURL("lf1OY") + "squeak4.3a2d4289.wav" + "?" + Date.now();

},{"d1c0885f741362f8":"lgJ39"}],"dvdqa":[function(require,module,exports) {
module.exports = require("375d2909e5dcf1e7").getBundleURL("lf1OY") + "hit16.mp3.455b231f.flac" + "?" + Date.now();

},{"375d2909e5dcf1e7":"lgJ39"}],"aBtts":[function(require,module,exports) {
module.exports = require("b1512f8c9db36646").getBundleURL("lf1OY") + "hit17.mp3.9928478e.flac" + "?" + Date.now();

},{"b1512f8c9db36646":"lgJ39"}],"8mLsA":[function(require,module,exports) {
module.exports = require("c0b380ee321f6850").getBundleURL("lf1OY") + "hit18.mp3.15d993c9.flac" + "?" + Date.now();

},{"c0b380ee321f6850":"lgJ39"}],"ajJoe":[function(require,module,exports) {
module.exports = require("24a9aa964e99ee57").getBundleURL("lf1OY") + "hit19.mp3.683d9630.flac" + "?" + Date.now();

},{"24a9aa964e99ee57":"lgJ39"}],"wy2ST":[function(require,module,exports) {
module.exports = require("bd84155498648606").getBundleURL("lf1OY") + "hit20.mp3.b9d8f281.flac" + "?" + Date.now();

},{"bd84155498648606":"lgJ39"}],"jPeF6":[function(require,module,exports) {
module.exports = require("2a103d2eb5499556").getBundleURL("lf1OY") + "hit26.mp3.37fc8009.flac" + "?" + Date.now();

},{"2a103d2eb5499556":"lgJ39"}],"2ZtkO":[function(require,module,exports) {
module.exports = require("25027ee6e6de9aef").getBundleURL("lf1OY") + "hit27.mp3.cada292a.flac" + "?" + Date.now();

},{"25027ee6e6de9aef":"lgJ39"}],"jZaET":[function(require,module,exports) {
module.exports = require("eb38345ebaad8976").getBundleURL("lf1OY") + "coin.98a2b3da.mp3" + "?" + Date.now();

},{"eb38345ebaad8976":"lgJ39"}],"4dkLh":[function(require,module,exports) {
module.exports = require("882379a23a5057c0").getBundleURL("lf1OY") + "coin-2.8069d244.mp3" + "?" + Date.now();

},{"882379a23a5057c0":"lgJ39"}],"kvn87":[function(require,module,exports) {
module.exports = require("e476e31a526b7c4b").getBundleURL("lf1OY") + "coin-3.75056641.mp3" + "?" + Date.now();

},{"e476e31a526b7c4b":"lgJ39"}],"JMLiq":[function(require,module,exports) {
module.exports = require("c671fd0b7d35db99").getBundleURL("lf1OY") + "coin-4.64116cd7.mp3" + "?" + Date.now();

},{"c671fd0b7d35db99":"lgJ39"}],"8Lw3Q":[function(require,module,exports) {
module.exports = require("677ad6434fa168ad").getBundleURL("lf1OY") + "coin-5.85f618a0.mp3" + "?" + Date.now();

},{"677ad6434fa168ad":"lgJ39"}],"2nUq5":[function(require,module,exports) {
module.exports = require("6064dd6d2e02f3f9").getBundleURL("lf1OY") + "grunt.eacdcc86.mp3" + "?" + Date.now();

},{"6064dd6d2e02f3f9":"lgJ39"}],"lHBqN":[function(require,module,exports) {
module.exports = require("20ea5458748e7c8c").getBundleURL("lf1OY") + "grunt-2.7a21b9a3.mp3" + "?" + Date.now();

},{"20ea5458748e7c8c":"lgJ39"}],"4X6eo":[function(require,module,exports) {
module.exports = require("4d5f140529458e01").getBundleURL("lf1OY") + "grunt-3.78a3d0bf.mp3" + "?" + Date.now();

},{"4d5f140529458e01":"lgJ39"}],"ltpKK":[function(require,module,exports) {
module.exports = require("3cb4895061d36c73").getBundleURL("lf1OY") + "grunt-4.1442a7f9.mp3" + "?" + Date.now();

},{"3cb4895061d36c73":"lgJ39"}],"iPB70":[function(require,module,exports) {
module.exports = require("142e297143acb46d").getBundleURL("lf1OY") + "grunt-5.2684595d.mp3" + "?" + Date.now();

},{"142e297143acb46d":"lgJ39"}],"9tbU5":[function(require,module,exports) {
module.exports = require("37a4a7f0cf10053f").getBundleURL("lf1OY") + "grunt-6.383135e1.mp3" + "?" + Date.now();

},{"37a4a7f0cf10053f":"lgJ39"}],"a46JQ":[function(require,module,exports) {
module.exports = require("f43b7fceed8dd5a0").getBundleURL("lf1OY") + "grunt-7.97264993.mp3" + "?" + Date.now();

},{"f43b7fceed8dd5a0":"lgJ39"}],"epH9n":[function(require,module,exports) {
module.exports = require("a1374265bf14f6c7").getBundleURL("lf1OY") + "grunt-8.2ac6e957.mp3" + "?" + Date.now();

},{"a1374265bf14f6c7":"lgJ39"}],"dwcOP":[function(require,module,exports) {
module.exports = require("e82461ec7552b7db").getBundleURL("lf1OY") + "douse.3fb10c42.mp3" + "?" + Date.now();

},{"e82461ec7552b7db":"lgJ39"}],"4Rqw7":[function(require,module,exports) {
module.exports = require("82626de792bd1a19").getBundleURL("lf1OY") + "douse-2.4d606725.mp3" + "?" + Date.now();

},{"82626de792bd1a19":"lgJ39"}],"hEMO1":[function(require,module,exports) {
module.exports = require("f76eed594bc61f63").getBundleURL("lf1OY") + "douse-3.20efd3b8.mp3" + "?" + Date.now();

},{"f76eed594bc61f63":"lgJ39"}],"6uN4N":[function(require,module,exports) {
module.exports = require("8d12f41e3c76e760").getBundleURL("lf1OY") + "douse-4.85b52d3b.mp3" + "?" + Date.now();

},{"8d12f41e3c76e760":"lgJ39"}],"denBs":[function(require,module,exports) {
module.exports = require("89d991780bcf0dd4").getBundleURL("lf1OY") + "ignite.b71a30ef.mp3" + "?" + Date.now();

},{"89d991780bcf0dd4":"lgJ39"}],"ai87a":[function(require,module,exports) {
module.exports = require("557ac8453ea0634a").getBundleURL("lf1OY") + "ignite-2.98391ff8.mp3" + "?" + Date.now();

},{"557ac8453ea0634a":"lgJ39"}],"e4yW2":[function(require,module,exports) {
module.exports = require("6bd79a9373c99f47").getBundleURL("lf1OY") + "hide.6ddfbe7f.mp3" + "?" + Date.now();

},{"6bd79a9373c99f47":"lgJ39"}],"e0rLU":[function(require,module,exports) {
module.exports = require("2c745d630726ba4c").getBundleURL("lf1OY") + "hide-2.78cc2235.mp3" + "?" + Date.now();

},{"2c745d630726ba4c":"lgJ39"}],"5mFUd":[function(require,module,exports) {
module.exports = require("7498f6b582800351").getBundleURL("lf1OY") + "hide-3.d141fece.mp3" + "?" + Date.now();

},{"7498f6b582800351":"lgJ39"}],"e5ksw":[function(require,module,exports) {
module.exports = require("9bb9fc7d4fb27984").getBundleURL("lf1OY") + "hide-4.aafbec6e.mp3" + "?" + Date.now();

},{"9bb9fc7d4fb27984":"lgJ39"}],"bFfhf":[function(require,module,exports) {
module.exports = require("b08fcc5799535049").getBundleURL("lf1OY") + "hide-5.c2a443ef.mp3" + "?" + Date.now();

},{"b08fcc5799535049":"lgJ39"}],"ewAQQ":[function(require,module,exports) {
module.exports = require("c91bb53f38ecd66f").getBundleURL("lf1OY") + "hide-6.d8af61de.mp3" + "?" + Date.now();

},{"c91bb53f38ecd66f":"lgJ39"}],"gELii":[function(require,module,exports) {
module.exports = require("e3342b3544f89eec").getBundleURL("lf1OY") + "gate.2fa92558.mp3" + "?" + Date.now();

},{"e3342b3544f89eec":"lgJ39"}],"5nU87":[function(require,module,exports) {
module.exports = require("2893f199caa89fdb").getBundleURL("lf1OY") + "gate-2.231cf45f.mp3" + "?" + Date.now();

},{"2893f199caa89fdb":"lgJ39"}],"7uWJZ":[function(require,module,exports) {
module.exports = require("5600861910f069f8").getBundleURL("lf1OY") + "gate-3.6d01307f.mp3" + "?" + Date.now();

},{"5600861910f069f8":"lgJ39"}],"bYumL":[function(require,module,exports) {
module.exports = require("6e2ff9c1c65e4aca").getBundleURL("lf1OY") + "gate-4.2ad533bc.mp3" + "?" + Date.now();

},{"6e2ff9c1c65e4aca":"lgJ39"}],"6gY1x":[function(require,module,exports) {
module.exports = require("5b61140ce41a1775").getBundleURL("lf1OY") + "gate-5.ab6675de.mp3" + "?" + Date.now();

},{"5b61140ce41a1775":"lgJ39"}],"fTvDo":[function(require,module,exports) {
module.exports = require("84e78116d3081d34").getBundleURL("lf1OY") + "splash1.752ee478.mp3" + "?" + Date.now();

},{"84e78116d3081d34":"lgJ39"}],"3E807":[function(require,module,exports) {
module.exports = require("f1e8696b4f63477").getBundleURL("lf1OY") + "splash2.eb81451d.mp3" + "?" + Date.now();

},{"f1e8696b4f63477":"lgJ39"}],"8n85h":[function(require,module,exports) {
module.exports = require("bc6935b8629fc384").getBundleURL("lf1OY") + "water-submerge.add4042d.mp3" + "?" + Date.now();

},{"bc6935b8629fc384":"lgJ39"}],"3Nd3F":[function(require,module,exports) {
module.exports = require("420c275abeb74a53").getBundleURL("lf1OY") + "water-exit.64a0d3e4.mp3" + "?" + Date.now();

},{"420c275abeb74a53":"lgJ39"}],"2vWH3":[function(require,module,exports) {
module.exports = require("9000d0904557ef0").getBundleURL("lf1OY") + "jump.bca32e3f.mp3" + "?" + Date.now();

},{"9000d0904557ef0":"lgJ39"}],"8rRS9":[function(require,module,exports) {
module.exports = require("ae74ba4079865bc8").getBundleURL("lf1OY") + "jump-2.e646c371.mp3" + "?" + Date.now();

},{"ae74ba4079865bc8":"lgJ39"}],"iQKP6":[function(require,module,exports) {
module.exports = require("6a5ce3a3d6679dea").getBundleURL("lf1OY") + "too high.36fb70fa.mp3" + "?" + Date.now();

},{"6a5ce3a3d6679dea":"lgJ39"}],"5Wuxs":[function(require,module,exports) {
module.exports = require("8f3de6be19b9ee02").getBundleURL("lf1OY") + "too high-2.b6dab1d5.mp3" + "?" + Date.now();

},{"8f3de6be19b9ee02":"lgJ39"}],"s2Q2L":[function(require,module,exports) {
module.exports = require("68fd3234eeef8521").getBundleURL("lf1OY") + "Hmm.9c642d91.mp3" + "?" + Date.now();

},{"68fd3234eeef8521":"lgJ39"}],"224to":[function(require,module,exports) {
module.exports = require("8b031a4a9fd450a4").getBundleURL("lf1OY") + "What.5fbd0c56.mp3" + "?" + Date.now();

},{"8b031a4a9fd450a4":"lgJ39"}],"fzuGN":[function(require,module,exports) {
module.exports = require("3b172c5ffc9bd18").getBundleURL("lf1OY") + "hey.aac49d21.mp3" + "?" + Date.now();

},{"3b172c5ffc9bd18":"lgJ39"}],"6RqV3":[function(require,module,exports) {
module.exports = require("bace266fe82d36d3").getBundleURL("lf1OY") + "hey-2.8ce95bbe.mp3" + "?" + Date.now();

},{"bace266fe82d36d3":"lgJ39"}],"h3YyP":[function(require,module,exports) {
module.exports = require("c3a29a40c776a50f").getBundleURL("lf1OY") + "hey-3.3ac6a922.mp3" + "?" + Date.now();

},{"c3a29a40c776a50f":"lgJ39"}],"3zmDf":[function(require,module,exports) {
module.exports = require("95afce8d214c6bd9").getBundleURL("lf1OY") + "what was that.c6e8a3c2.mp3" + "?" + Date.now();

},{"95afce8d214c6bd9":"lgJ39"}],"bVmQ3":[function(require,module,exports) {
module.exports = require("ffb2c8c0f62278ee").getBundleURL("lf1OY") + "what was that-2.5fe20783.mp3" + "?" + Date.now();

},{"ffb2c8c0f62278ee":"lgJ39"}],"9Ktkp":[function(require,module,exports) {
module.exports = require("158d8f37cc345882").getBundleURL("lf1OY") + "what was that-3.6f2cdd0e.mp3" + "?" + Date.now();

},{"158d8f37cc345882":"lgJ39"}],"9x3D3":[function(require,module,exports) {
module.exports = require("88a9b7085a9ecb4").getBundleURL("lf1OY") + "what was that-4.0aad96c3.mp3" + "?" + Date.now();

},{"88a9b7085a9ecb4":"lgJ39"}],"fd0c0":[function(require,module,exports) {
module.exports = require("a61798681600abc6").getBundleURL("lf1OY") + "what was that-5.38eccbfc.mp3" + "?" + Date.now();

},{"a61798681600abc6":"lgJ39"}],"hqU6N":[function(require,module,exports) {
module.exports = require("252ffcaad8ac631a").getBundleURL("lf1OY") + "who goes there.90c8da6d.mp3" + "?" + Date.now();

},{"252ffcaad8ac631a":"lgJ39"}],"bx4BT":[function(require,module,exports) {
module.exports = require("b70b5c101e1c5ede").getBundleURL("lf1OY") + "huh.6993c461.mp3" + "?" + Date.now();

},{"b70b5c101e1c5ede":"lgJ39"}],"ffzGR":[function(require,module,exports) {
module.exports = require("52025793bddccfd3").getBundleURL("lf1OY") + "wha.a8433e96.mp3" + "?" + Date.now();

},{"52025793bddccfd3":"lgJ39"}],"cghPs":[function(require,module,exports) {
module.exports = require("4f53ce21a3003528").getBundleURL("lf1OY") + "wait.504d3960.mp3" + "?" + Date.now();

},{"4f53ce21a3003528":"lgJ39"}],"8T7H4":[function(require,module,exports) {
module.exports = require("e3a0a1bbcbd6a70d").getBundleURL("lf1OY") + "who there.ce669432.mp3" + "?" + Date.now();

},{"e3a0a1bbcbd6a70d":"lgJ39"}],"7z9d9":[function(require,module,exports) {
module.exports = require("b0dff58582d6afeb").getBundleURL("lf1OY") + "what moved.3ff542a2.mp3" + "?" + Date.now();

},{"b0dff58582d6afeb":"lgJ39"}],"agX7A":[function(require,module,exports) {
module.exports = require("e2b78086629a2ce7").getBundleURL("lf1OY") + "what in the shadows.b736a4ef.mp3" + "?" + Date.now();

},{"e2b78086629a2ce7":"lgJ39"}],"8aQyK":[function(require,module,exports) {
module.exports = require("9af0dc621ea115b3").getBundleURL("lf1OY") + "shadow move.b0baebdd.mp3" + "?" + Date.now();

},{"9af0dc621ea115b3":"lgJ39"}],"dJQsj":[function(require,module,exports) {
module.exports = require("c47fb389fa95132c").getBundleURL("lf1OY") + "see something.0f9e94e8.mp3" + "?" + Date.now();

},{"c47fb389fa95132c":"lgJ39"}],"gKhEi":[function(require,module,exports) {
module.exports = require("c53a0c3f67a256d5").getBundleURL("lf1OY") + "hello.a532132d.mp3" + "?" + Date.now();

},{"c53a0c3f67a256d5":"lgJ39"}],"lITH8":[function(require,module,exports) {
module.exports = require("1c71de158073f08d").getBundleURL("lf1OY") + "ugh.04a1dfba.mp3" + "?" + Date.now();

},{"1c71de158073f08d":"lgJ39"}],"2E6Ey":[function(require,module,exports) {
module.exports = require("7c020cce187e019d").getBundleURL("lf1OY") + "ahh.176e0d5e.mp3" + "?" + Date.now();

},{"7c020cce187e019d":"lgJ39"}],"g90E0":[function(require,module,exports) {
module.exports = require("9187ec764a18521e").getBundleURL("lf1OY") + "aww.f9d5ccbe.mp3" + "?" + Date.now();

},{"9187ec764a18521e":"lgJ39"}],"inZis":[function(require,module,exports) {
module.exports = require("2010baf9da8d2b2f").getBundleURL("lf1OY") + "quiet out.f7ea726c.mp3" + "?" + Date.now();

},{"2010baf9da8d2b2f":"lgJ39"}],"eBH2o":[function(require,module,exports) {
module.exports = require("db799165b3e4b107").getBundleURL("lf1OY") + "rest me bones.1a3842d9.mp3" + "?" + Date.now();

},{"db799165b3e4b107":"lgJ39"}],"cFuxm":[function(require,module,exports) {
module.exports = require("1a805916895e8e81").getBundleURL("lf1OY") + "jumpy.717ed28d.mp3" + "?" + Date.now();

},{"1a805916895e8e81":"lgJ39"}],"gCVVo":[function(require,module,exports) {
module.exports = require("65f215a502ce03ea").getBundleURL("lf1OY") + "jumpin shadows.f5b3f61f.mp3" + "?" + Date.now();

},{"65f215a502ce03ea":"lgJ39"}],"7tUMg":[function(require,module,exports) {
module.exports = require("42d8ad40244cab5f").getBundleURL("lf1OY") + "oh well.8f730a7f.mp3" + "?" + Date.now();

},{"42d8ad40244cab5f":"lgJ39"}],"LWHfM":[function(require,module,exports) {
module.exports = require("25ead04e0d869c08").getBundleURL("lf1OY") + "case of the jitters.23c7641b.mp3" + "?" + Date.now();

},{"25ead04e0d869c08":"lgJ39"}],"3taIr":[function(require,module,exports) {
module.exports = require("352fc71dd107ef52").getBundleURL("lf1OY") + "must be seeing.170c8a9b.mp3" + "?" + Date.now();

},{"352fc71dd107ef52":"lgJ39"}],"6HKZl":[function(require,module,exports) {
module.exports = require("aadf68a75c5307c9").getBundleURL("lf1OY") + "what in my coffee.aefc32da.mp3" + "?" + Date.now();

},{"aadf68a75c5307c9":"lgJ39"}],"9s0IZ":[function(require,module,exports) {
module.exports = require("1b05704546241aa8").getBundleURL("lf1OY") + "coffee too strong.71f40271.mp3" + "?" + Date.now();

},{"1b05704546241aa8":"lgJ39"}],"bmUje":[function(require,module,exports) {
module.exports = require("8d69f63860627ac4").getBundleURL("lf1OY") + "hmm nothing.3f1d7137.mp3" + "?" + Date.now();

},{"8d69f63860627ac4":"lgJ39"}],"r8pEn":[function(require,module,exports) {
module.exports = require("37773ad78f76b3d2").getBundleURL("lf1OY") + "well I though I saw.d247b6e6.mp3" + "?" + Date.now();

},{"37773ad78f76b3d2":"lgJ39"}],"gmBDQ":[function(require,module,exports) {
module.exports = require("479b3888c56e7cc0").getBundleURL("lf1OY") + "nothing.27b9ccb3.mp3" + "?" + Date.now();

},{"479b3888c56e7cc0":"lgJ39"}],"cZw51":[function(require,module,exports) {
module.exports = require("38dc81413cc8f1c5").getBundleURL("lf1OY") + "hopefully nothing.0e6a952f.mp3" + "?" + Date.now();

},{"38dc81413cc8f1c5":"lgJ39"}],"cnzN4":[function(require,module,exports) {
module.exports = require("1c6abf656fe8b2e4").getBundleURL("lf1OY") + "seeing things.cde1305b.mp3" + "?" + Date.now();

},{"1c6abf656fe8b2e4":"lgJ39"}],"jefVX":[function(require,module,exports) {
module.exports = require("f3b7183b567e9563").getBundleURL("lf1OY") + "what-2.0eb6da69.mp3" + "?" + Date.now();

},{"f3b7183b567e9563":"lgJ39"}],"aPaoT":[function(require,module,exports) {
module.exports = require("9f0208830b1c8caa").getBundleURL("lf1OY") + "hark.5dcc56a1.mp3" + "?" + Date.now();

},{"9f0208830b1c8caa":"lgJ39"}],"g0dhG":[function(require,module,exports) {
module.exports = require("2e6f3a9c9efed481").getBundleURL("lf1OY") + "noise.158a091c.mp3" + "?" + Date.now();

},{"2e6f3a9c9efed481":"lgJ39"}],"kDwJ2":[function(require,module,exports) {
module.exports = require("2d968b6a17a17117").getBundleURL("lf1OY") + "heard something.7fdfb9f6.mp3" + "?" + Date.now();

},{"2d968b6a17a17117":"lgJ39"}],"2x9nC":[function(require,module,exports) {
module.exports = require("27e3fa51c793cf5e").getBundleURL("lf1OY") + "cant hear now.1dc1a7a2.mp3" + "?" + Date.now();

},{"27e3fa51c793cf5e":"lgJ39"}],"9fVaC":[function(require,module,exports) {
module.exports = require("9a61e8b7fdf73498").getBundleURL("lf1OY") + "hearing things.19769955.mp3" + "?" + Date.now();

},{"9a61e8b7fdf73498":"lgJ39"}],"k1uRF":[function(require,module,exports) {
module.exports = require("c15a3cbba53106d4").getBundleURL("lf1OY") + "noise again.0a7dbd4f.mp3" + "?" + Date.now();

},{"c15a3cbba53106d4":"lgJ39"}],"fLNJF":[function(require,module,exports) {
module.exports = require("8bf2ee601b8b9d36").getBundleURL("lf1OY") + "someone there.1c0ae6c5.mp3" + "?" + Date.now();

},{"8bf2ee601b8b9d36":"lgJ39"}],"chTre":[function(require,module,exports) {
module.exports = require("a42c90818fb8f375").getBundleURL("lf1OY") + "who could that be.1719858b.mp3" + "?" + Date.now();

},{"a42c90818fb8f375":"lgJ39"}],"2QvYX":[function(require,module,exports) {
module.exports = require("f6f9539362b88f64").getBundleURL("lf1OY") + "better check it out.feef2002.mp3" + "?" + Date.now();

},{"f6f9539362b88f64":"lgJ39"}],"5V3sW":[function(require,module,exports) {
module.exports = require("231a9f0d65c43a2f").getBundleURL("lf1OY") + "better be rats.936e36a9.mp3" + "?" + Date.now();

},{"231a9f0d65c43a2f":"lgJ39"}],"8PECt":[function(require,module,exports) {
module.exports = require("49ea18e4b2cdf05d").getBundleURL("lf1OY") + "who that.275fc7f3.mp3" + "?" + Date.now();

},{"49ea18e4b2cdf05d":"lgJ39"}],"abuDI":[function(require,module,exports) {
module.exports = require("5881618dd56b5e67").getBundleURL("lf1OY") + "come out come out.14617e69.mp3" + "?" + Date.now();

},{"5881618dd56b5e67":"lgJ39"}],"39DEl":[function(require,module,exports) {
module.exports = require("2165ff423bf7b65e").getBundleURL("lf1OY") + "guess nothing.3d80bc80.mp3" + "?" + Date.now();

},{"2165ff423bf7b65e":"lgJ39"}],"3kmal":[function(require,module,exports) {
module.exports = require("a1816f78b0ae35").getBundleURL("lf1OY") + "wonder it was.0995203b.mp3" + "?" + Date.now();

},{"a1816f78b0ae35":"lgJ39"}],"85RTq":[function(require,module,exports) {
module.exports = require("cf45d28003fee492").getBundleURL("lf1OY") + "back to post.71ea15a2.mp3" + "?" + Date.now();

},{"cf45d28003fee492":"lgJ39"}],"6JYFN":[function(require,module,exports) {
module.exports = require("bb2b9604ca4f5b40").getBundleURL("lf1OY") + "quiet now.0be637de.mp3" + "?" + Date.now();

},{"bb2b9604ca4f5b40":"lgJ39"}],"8o6R6":[function(require,module,exports) {
module.exports = require("2272a463d4b23274").getBundleURL("lf1OY") + "sure I heard something.000bbbca.mp3" + "?" + Date.now();

},{"2272a463d4b23274":"lgJ39"}],"g7juJ":[function(require,module,exports) {
module.exports = require("17c184dc76bd47b8").getBundleURL("lf1OY") + "not there anymore.8a26ff97.mp3" + "?" + Date.now();

},{"17c184dc76bd47b8":"lgJ39"}],"2IFEg":[function(require,module,exports) {
module.exports = require("f99068aa2c27a978").getBundleURL("lf1OY") + "probably nothing.96183200.mp3" + "?" + Date.now();

},{"f99068aa2c27a978":"lgJ39"}],"bCvEE":[function(require,module,exports) {
module.exports = require("45975e9169346725").getBundleURL("lf1OY") + "i dont know why i work here.a5dea8b7.mp3" + "?" + Date.now();

},{"45975e9169346725":"lgJ39"}],"iI2P6":[function(require,module,exports) {
module.exports = require("2f6dca6ae5f2129e").getBundleURL("lf1OY") + "waste of my time.5c694a4a.mp3" + "?" + Date.now();

},{"2f6dca6ae5f2129e":"lgJ39"}],"fTTTf":[function(require,module,exports) {
module.exports = require("8eaa24d701d9a367").getBundleURL("lf1OY") + "why do I even try.f1249983.mp3" + "?" + Date.now();

},{"8eaa24d701d9a367":"lgJ39"}],"in1Yk":[function(require,module,exports) {
module.exports = require("8abf9a040a8522e5").getBundleURL("lf1OY") + "at least Im not on cleaning duty.e05d8ddf.mp3" + "?" + Date.now();

},{"8abf9a040a8522e5":"lgJ39"}],"4sFml":[function(require,module,exports) {
module.exports = require("afd64e0309fc08fd").getBundleURL("lf1OY") + "at least my shift ends soon.e9a0264b.mp3" + "?" + Date.now();

},{"afd64e0309fc08fd":"lgJ39"}],"8DCSZ":[function(require,module,exports) {
module.exports = require("435be610030aceee").getBundleURL("lf1OY") + "what do you want me to do about it.a0951444.mp3" + "?" + Date.now();

},{"435be610030aceee":"lgJ39"}],"8HYPW":[function(require,module,exports) {
module.exports = require("d4570a3ff4379ec5").getBundleURL("lf1OY") + "coming.2fe1e9ab.mp3" + "?" + Date.now();

},{"d4570a3ff4379ec5":"lgJ39"}],"gCSP7":[function(require,module,exports) {
module.exports = require("6681af9994b4e2f7").getBundleURL("lf1OY") + "to arms.d090e7eb.mp3" + "?" + Date.now();

},{"6681af9994b4e2f7":"lgJ39"}],"94LvL":[function(require,module,exports) {
module.exports = require("f01dc3a7b29b7c4a").getBundleURL("lf1OY") + "whistle.4535aef4.mp3" + "?" + Date.now();

},{"f01dc3a7b29b7c4a":"lgJ39"}],"aD2F4":[function(require,module,exports) {
module.exports = require("a052bb8e943fbbea").getBundleURL("lf1OY") + "whistle-2.7bab7a2a.mp3" + "?" + Date.now();

},{"a052bb8e943fbbea":"lgJ39"}],"1ZglP":[function(require,module,exports) {
module.exports = require("d90eb81886fb794d").getBundleURL("lf1OY") + "whistle-3.8e4b2c7d.mp3" + "?" + Date.now();

},{"d90eb81886fb794d":"lgJ39"}],"k7f64":[function(require,module,exports) {
module.exports = require("684a233db0a18439").getBundleURL("lf1OY") + "get em.b3cfa67a.mp3" + "?" + Date.now();

},{"684a233db0a18439":"lgJ39"}],"cZ0PT":[function(require,module,exports) {
module.exports = require("b8d301e5dd741d0").getBundleURL("lf1OY") + "intruder.26c962b0.mp3" + "?" + Date.now();

},{"b8d301e5dd741d0":"lgJ39"}],"4FfLU":[function(require,module,exports) {
module.exports = require("d65fc7d6135ef5f7").getBundleURL("lf1OY") + "oh no its a thief.08c79d07.mp3" + "?" + Date.now();

},{"d65fc7d6135ef5f7":"lgJ39"}],"4WptE":[function(require,module,exports) {
module.exports = require("2b115ba4e50944b2").getBundleURL("lf1OY") + "we coming for you.e3350b58.mp3" + "?" + Date.now();

},{"2b115ba4e50944b2":"lgJ39"}],"eODND":[function(require,module,exports) {
module.exports = require("c5867897434cb7a4").getBundleURL("lf1OY") + "coming for you.d5bd7177.mp3" + "?" + Date.now();

},{"c5867897434cb7a4":"lgJ39"}],"hZ2B8":[function(require,module,exports) {
module.exports = require("799fd3f84736d6bc").getBundleURL("lf1OY") + "halt.87f5623f.mp3" + "?" + Date.now();

},{"799fd3f84736d6bc":"lgJ39"}],"AMRHc":[function(require,module,exports) {
module.exports = require("301f9a78ef928fec").getBundleURL("lf1OY") + "see you.f1a894b8.mp3" + "?" + Date.now();

},{"301f9a78ef928fec":"lgJ39"}],"6UCsk":[function(require,module,exports) {
module.exports = require("4a7b31cc4a3d09ef").getBundleURL("lf1OY") + "ill get you.3f2c4f5a.mp3" + "?" + Date.now();

},{"4a7b31cc4a3d09ef":"lgJ39"}],"g7XAg":[function(require,module,exports) {
module.exports = require("c70aae21d9a549a9").getBundleURL("lf1OY") + "a goner.fbb93c98.mp3" + "?" + Date.now();

},{"c70aae21d9a549a9":"lgJ39"}],"cFlu7":[function(require,module,exports) {
module.exports = require("2c680fe9f94f41f9").getBundleURL("lf1OY") + "just you wait.f3233a1b.mp3" + "?" + Date.now();

},{"2c680fe9f94f41f9":"lgJ39"}],"7FJ37":[function(require,module,exports) {
module.exports = require("c7e65eb821e7d857").getBundleURL("lf1OY") + "you wont get away.9fb1f168.mp3" + "?" + Date.now();

},{"c7e65eb821e7d857":"lgJ39"}],"3Hs3x":[function(require,module,exports) {
module.exports = require("a08db60bde8dd464").getBundleURL("lf1OY") + "no you dont.7a3b744b.mp3" + "?" + Date.now();

},{"a08db60bde8dd464":"lgJ39"}],"coNMD":[function(require,module,exports) {
module.exports = require("7fd97222c1418d8a").getBundleURL("lf1OY") + "thief.61a85088.mp3" + "?" + Date.now();

},{"7fd97222c1418d8a":"lgJ39"}],"4s9gT":[function(require,module,exports) {
module.exports = require("9178f0fa87d00fda").getBundleURL("lf1OY") + "thief-2.51754a24.mp3" + "?" + Date.now();

},{"9178f0fa87d00fda":"lgJ39"}],"ikayr":[function(require,module,exports) {
module.exports = require("c28879ee8f1742af").getBundleURL("lf1OY") + "thief-3.6126aef5.mp3" + "?" + Date.now();

},{"c28879ee8f1742af":"lgJ39"}],"bUSG1":[function(require,module,exports) {
module.exports = require("8384b1c322efe216").getBundleURL("lf1OY") + "after them.d8ae69aa.mp3" + "?" + Date.now();

},{"8384b1c322efe216":"lgJ39"}],"gs4UN":[function(require,module,exports) {
module.exports = require("9ea79a657c85a952").getBundleURL("lf1OY") + "what is thy business.4d2220bf.mp3" + "?" + Date.now();

},{"9ea79a657c85a952":"lgJ39"}],"j5cRJ":[function(require,module,exports) {
module.exports = require("9f00e93c84b96907").getBundleURL("lf1OY") + "no mercy for the wicked.81f47509.mp3" + "?" + Date.now();

},{"9f00e93c84b96907":"lgJ39"}],"hF47h":[function(require,module,exports) {
module.exports = require("40f4f8ed883489d1").getBundleURL("lf1OY") + "lost em.0b39dc1c.mp3" + "?" + Date.now();

},{"40f4f8ed883489d1":"lgJ39"}],"kYZUc":[function(require,module,exports) {
module.exports = require("d3f0d8d4bd4c2494").getBundleURL("lf1OY") + "must have run.5c6304f4.mp3" + "?" + Date.now();

},{"d3f0d8d4bd4c2494":"lgJ39"}],"lqrS2":[function(require,module,exports) {
module.exports = require("55be351b1270c57f").getBundleURL("lf1OY") + "where they go.82eb2f61.mp3" + "?" + Date.now();

},{"55be351b1270c57f":"lgJ39"}],"kbO4H":[function(require,module,exports) {
module.exports = require("4552f472c8f79b87").getBundleURL("lf1OY") + "his holiness.4a6fcfcd.mp3" + "?" + Date.now();

},{"4552f472c8f79b87":"lgJ39"}],"ckkdt":[function(require,module,exports) {
module.exports = require("e9da03dc6fe8b8c1").getBundleURL("lf1OY") + "the boss.3de0ea38.mp3" + "?" + Date.now();

},{"e9da03dc6fe8b8c1":"lgJ39"}],"3WyJt":[function(require,module,exports) {
module.exports = require("4ba9b35ce57b80cb").getBundleURL("lf1OY") + "huff puff give up.99b47dc0.mp3" + "?" + Date.now();

},{"4ba9b35ce57b80cb":"lgJ39"}],"hlHmX":[function(require,module,exports) {
module.exports = require("b37a76880e8d53c7").getBundleURL("lf1OY") + "where did he go.37e4fea4.mp3" + "?" + Date.now();

},{"b37a76880e8d53c7":"lgJ39"}],"hIFxo":[function(require,module,exports) {
module.exports = require("8eb84d3fd58b801d").getBundleURL("lf1OY") + "drats lost him.2708ad1d.mp3" + "?" + Date.now();

},{"8eb84d3fd58b801d":"lgJ39"}],"7eQ6w":[function(require,module,exports) {
module.exports = require("c44d0a773dc770e8").getBundleURL("lf1OY") + "gone.1debb79d.mp3" + "?" + Date.now();

},{"c44d0a773dc770e8":"lgJ39"}],"2Pk6f":[function(require,module,exports) {
module.exports = require("17fcca66f7113f73").getBundleURL("lf1OY") + "come back here.2fb213c2.mp3" + "?" + Date.now();

},{"17fcca66f7113f73":"lgJ39"}],"jovj4":[function(require,module,exports) {
module.exports = require("8ed2b9c28aa25a60").getBundleURL("lf1OY") + "rotten scoundrel.9389ebb8.mp3" + "?" + Date.now();

},{"8ed2b9c28aa25a60":"lgJ39"}],"c3U1l":[function(require,module,exports) {
module.exports = require("10d577827faef479").getBundleURL("lf1OY") + "aargh.6c11f002.mp3" + "?" + Date.now();

},{"10d577827faef479":"lgJ39"}],"b2ME2":[function(require,module,exports) {
module.exports = require("237fb314f1059370").getBundleURL("lf1OY") + "not coming back.c270432d.mp3" + "?" + Date.now();

},{"237fb314f1059370":"lgJ39"}],"lMgKq":[function(require,module,exports) {
module.exports = require("41764b3de782422f").getBundleURL("lf1OY") + "blast.1d706954.mp3" + "?" + Date.now();

},{"41764b3de782422f":"lgJ39"}],"8hWQ7":[function(require,module,exports) {
module.exports = require("cf38e9a4322dc4ed").getBundleURL("lf1OY") + "dont come back.8969903f.mp3" + "?" + Date.now();

},{"cf38e9a4322dc4ed":"lgJ39"}],"f4Hq0":[function(require,module,exports) {
module.exports = require("e1e13adcf95517f5").getBundleURL("lf1OY") + "wont get away next time.aa747c7e.mp3" + "?" + Date.now();

},{"e1e13adcf95517f5":"lgJ39"}],"2Bc7G":[function(require,module,exports) {
module.exports = require("6bee240a793dbf30").getBundleURL("lf1OY") + "for his holiness.55339d5f.mp3" + "?" + Date.now();

},{"6bee240a793dbf30":"lgJ39"}],"4bzJ9":[function(require,module,exports) {
module.exports = require("5fb86790a241da55").getBundleURL("lf1OY") + "lousy day at work.77a0f71d.mp3" + "?" + Date.now();

},{"5fb86790a241da55":"lgJ39"}],"lvXdP":[function(require,module,exports) {
module.exports = require("70d05d294a898bfa").getBundleURL("lf1OY") + "i give up.e37cde88.mp3" + "?" + Date.now();

},{"70d05d294a898bfa":"lgJ39"}],"gPuPz":[function(require,module,exports) {
module.exports = require("cf8df36877290263").getBundleURL("lf1OY") + "what do i do help me.f6de8dea.mp3" + "?" + Date.now();

},{"cf8df36877290263":"lgJ39"}],"iZ55y":[function(require,module,exports) {
module.exports = require("3d1cd26c914e5b3").getBundleURL("lf1OY") + "oh no he got away.2c545080.mp3" + "?" + Date.now();

},{"3d1cd26c914e5b3":"lgJ39"}],"cvhbf":[function(require,module,exports) {
module.exports = require("8a855e7ba36c2a53").getBundleURL("lf1OY") + "guard rant.5915471e.mp3" + "?" + Date.now();

},{"8a855e7ba36c2a53":"lgJ39"}],"bgYzw":[function(require,module,exports) {
module.exports = require("bcf2909e42187d52").getBundleURL("lf1OY") + "take that.2363e886.mp3" + "?" + Date.now();

},{"bcf2909e42187d52":"lgJ39"}],"fmwYX":[function(require,module,exports) {
module.exports = require("48139c38a19635a7").getBundleURL("lf1OY") + "oof.853f9b21.mp3" + "?" + Date.now();

},{"48139c38a19635a7":"lgJ39"}],"1sAT4":[function(require,module,exports) {
module.exports = require("ed2244d191d759fd").getBundleURL("lf1OY") + "uh.1621da60.mp3" + "?" + Date.now();

},{"ed2244d191d759fd":"lgJ39"}],"iT3UI":[function(require,module,exports) {
module.exports = require("cb709f03013cb612").getBundleURL("lf1OY") + "ah.c51a22c9.mp3" + "?" + Date.now();

},{"cb709f03013cb612":"lgJ39"}],"HN7wh":[function(require,module,exports) {
module.exports = require("6d39f11b8cb5888e").getBundleURL("lf1OY") + "ah-2.3c91fb45.mp3" + "?" + Date.now();

},{"6d39f11b8cb5888e":"lgJ39"}],"6mKlg":[function(require,module,exports) {
module.exports = require("7d9e00b7bdb2138f").getBundleURL("lf1OY") + "ha ya.4e39519f.mp3" + "?" + Date.now();

},{"7d9e00b7bdb2138f":"lgJ39"}],"b3mdd":[function(require,module,exports) {
module.exports = require("84f6fa2778b43943").getBundleURL("lf1OY") + "ha ya-2.2e2702bd.mp3" + "?" + Date.now();

},{"84f6fa2778b43943":"lgJ39"}],"iyQcS":[function(require,module,exports) {
module.exports = require("66aafb15676fee16").getBundleURL("lf1OY") + "ha ya-3.004305ba.mp3" + "?" + Date.now();

},{"66aafb15676fee16":"lgJ39"}],"ldPU4":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "lastController", ()=>lastController);
parcelHelpers.export(exports, "Controller", ()=>Controller);
parcelHelpers.export(exports, "TouchController", ()=>TouchController);
parcelHelpers.export(exports, "GamepadManager", ()=>GamepadManager);
parcelHelpers.export(exports, "KeyboardController", ()=>KeyboardController);
parcelHelpers.export(exports, "Rect", ()=>Rect);
const controlStates0 = {
    "left": false,
    "right": false,
    "up": false,
    "down": false,
    "wait": false,
    "jump": false,
    "zoomIn": false,
    "zoomOut": false,
    "snapToPlayer": false,
    "menuAccept": false,
    "panUp": false,
    "panDown": false,
    "panLeft": false,
    "panRight": false,
    "menu": false,
    "homePlay": false,
    "homeDaily": false,
    "homeStats": false,
    "homeOptions": false,
    "jumpToggle": false,
    "startLevel": false,
    "guardMute": false,
    "volumeMute": false,
    "volumeDown": false,
    "volumeUp": false,
    "forceRestart": false,
    "resetState": false,
    "seeAll": false,
    "collectLoot": false,
    "markSeen": false,
    "guardSight": false,
    "guardPatrols": false,
    "nextLevel": false,
    "prevLevel": false,
    "fullscreen": false,
    "showSpeech": false
};
var lastController = null;
const defaultKeyMap = {
    "Alt+Comma": [
        "prevLevel"
    ],
    "Alt+KeyA": [
        "seeAll"
    ],
    "Alt+KeyC": [
        "collectLoot"
    ],
    "Alt+KeyP": [
        "guardPatrols"
    ],
    "Alt+KeyR": [
        "resetState"
    ],
    "Alt+KeyS": [
        "markSeen"
    ],
    "Alt+KeyV": [
        "guardSight"
    ],
    "Alt+Period": [
        "nextLevel"
    ],
    "ArrowDown": [
        "down"
    ],
    "ArrowLeft": [
        "left"
    ],
    "ArrowRight": [
        "right"
    ],
    "ArrowUp": [
        "up"
    ],
    "BracketLeft": [
        "zoomOut"
    ],
    "BracketRight": [
        "zoomIn"
    ],
    "Digit0": [
        "volumeMute"
    ],
    "Digit9": [
        "guardMute"
    ],
    "Enter": [
        "wait",
        "menuAccept"
    ],
    "Equal": [
        "volumeUp"
    ],
    "Escape": [
        "menu"
    ],
    "KeyA": [
        "left"
    ],
    "KeyC": [
        "copyScore",
        "credits"
    ],
    "KeyD": [
        "right",
        "homeDaily",
        "keyRepeatDelay"
    ],
    "KeyF": [
        "jumpToggle",
        "fullscreen"
    ],
    "KeyG": [
        "guardMute"
    ],
    "KeyJ": [
        "down"
    ],
    "KeyK": [
        "up",
        "keyRepeatRate"
    ],
    "KeyH": [
        "left",
        "helpControls"
    ],
    "KeyL": [
        "right"
    ],
    "KeyM": [
        "helpKey"
    ],
    "KeyN": [
        "homeRestart",
        "startLevel"
    ],
    "KeyO": [
        "homeOptions"
    ],
    "KeyP": [
        "homePlay"
    ],
    "KeyR": [
        "homePlay"
    ],
    "KeyS": [
        "down",
        "homeStats"
    ],
    "KeyW": [
        "up"
    ],
    "KeyZ": [
        "wait",
        "menuAccept"
    ],
    "Period": [
        "wait",
        "menuAccept"
    ],
    "Shift": [
        "jump"
    ],
    "Slash": [
        "menu"
    ],
    "Space": [
        "wait",
        "menuAccept"
    ],
    "Minus": [
        "volumeDown"
    ],
    "Numpad2": [
        "down"
    ],
    "Numpad4": [
        "left",
        "menu"
    ],
    "Numpad6": [
        "right",
        "menuAccept"
    ],
    "Numpad8": [
        "up"
    ],
    "NumpadAdd": [
        "jumpToggle"
    ],
    "NumpadEnter": [
        "menuAccept"
    ],
    "Tab": [
        "showSpeech"
    ],
    "Control+ArrowDown": [
        "panDown"
    ],
    "Control+ArrowLeft": [
        "panLeft"
    ],
    "Control+ArrowRight": [
        "panRight"
    ],
    "Control+ArrowUp": [
        "panUp"
    ],
    "Control+KeyA": [
        "panLeft"
    ],
    "Control+KeyC": [
        "copyScore"
    ],
    "Control+KeyD": [
        "panRight"
    ],
    "Control+KeyH": [
        "panLeft"
    ],
    "Control+KeyJ": [
        "panUp"
    ],
    "Control+KeyK": [
        "panDown"
    ],
    "Control+KeyL": [
        "panRight"
    ],
    "Control+KeyR": [
        "forceRestart"
    ],
    "Control+KeyS": [
        "panDown"
    ],
    "Control+KeyW": [
        "panUp"
    ],
    "Control+Numpad2": [
        "panDown"
    ],
    "Control+Numpad4": [
        "panLeft"
    ],
    "Control+Numpad6": [
        "panRight"
    ],
    "Control+Numpad8": [
        "panUp"
    ],
    "Control+Period": [
        "snapToPlayer"
    ],
    "Control+Space": [
        "snapToPlayer"
    ]
};
class Rect extends Array {
    constructor(x = 0, y = 0, w = 0, h = 0){
        super(x, y, w, h);
    }
    collide(x, y, w = 0, h = 0) {
        if (x + w < this[0]) return false;
        if (y + h < this[1]) return false;
        if (x >= this[0] + this[2]) return false;
        if (y >= this[1] + this[3]) return false;
        return true;
    }
}
class Controller {
    currentFramePresses = new Set();
    constructor(){
        this.controlStates = {
            ...controlStates0
        };
        this.controlTimes = {};
        for(const c in this.controlStates)this.controlTimes[c] = Date.now();
    }
    setPressed(action, state, updateFrame = true) {
        this.controlStates[action] = state;
        this.controlTimes[action] = Date.now();
        if (updateFrame) {
            if (state) this.currentFramePresses.add(action);
        }
        lastController = this;
    }
    endFrame() {
        this.currentFramePresses.clear();
    }
}
class KeyboardController extends Controller {
    constructor(keyMap = null){
        super();
        if (keyMap == null) keyMap = defaultKeyMap;
        this.keyMap = keyMap;
        let that = this;
        const html = document.querySelector("html");
        if (html) {
            html.onkeydown = function(e) {
                that.keyDownHandler(e);
            };
            html.onkeyup = function(e) {
                that.keyUpHandler(e);
            };
        }
    }
    getCode(e, modifyShift = false) {
        let code = e.code;
        if (e.altKey) {
            if (e.code !== "AltLeft" && e.code !== "AltRight") code = "Alt+" + code;
        }
        if (e.shiftKey && modifyShift) {
            if (e.code !== "ShiftLeft" && e.code !== "ShiftRight") code = "Shift+" + code;
        }
        if (e.ctrlKey) {
            if (e.code !== "ControlLeft" && e.code !== "ControlRight") code = "Control+" + code;
        }
        if (e.code == "AltLeft" || e.code == "AltRight") code = "Alt";
        if (e.code == "ShiftLeft" || e.code == "ShiftRight") code = "Shift";
        if (e.code == "ControlLeft" || e.code == "ControlRight") code = "Control";
        return code;
    }
    updateModifierDown(mod) {
        for(let key in this.keyMap){
            const actions = this.keyMap[key];
            for (let a of actions)// if(key.includes(mod) && !this.controlStates[a]) {
            //     this.controlStates[a] = true;
            // }
            if (!key.includes(mod) && this.controlStates[a]) this.controlStates[a] = false;
        }
    }
    updateModifierUp(mod) {
        for(let key in this.keyMap){
            const actions = this.keyMap[key];
            for (let a of actions)if (key.includes(mod) && this.controlStates[a]) this.controlStates[a] = false;
        }
    }
    keyDownHandler(e) {
        lastController = this;
        const code = this.getCode(e);
        if ([
            "Alt",
            "Control"
        ].includes(code)) this.updateModifierDown(code);
        if (code in this.keyMap) {
            e.preventDefault();
            const keys = this.keyMap[code];
            for (let key of keys)if (!this.controlStates[key]) this.setPressed(key, true);
        }
    }
    keyUpHandler(e) {
        const code = this.getCode(e);
        if ([
            "Alt",
            "Control"
        ].includes(code)) this.updateModifierUp(code);
        if (code in this.keyMap) {
            e.preventDefault();
            const keys = this.keyMap[code];
            for (let key of keys)this.setPressed(key, false);
        }
    }
}
class GamepadController extends Controller {
    constructor(gamepad){
        super();
        this.gamepad = gamepad;
        this.thresh = 0.4;
        this.internalStates = {
            ...this.controlStates
        };
    }
    setPressed(action, state) {
        if (this.internalStates[action] == state) return;
        this.internalStates[action] = state;
        super.setPressed(action, state);
    }
}
class GamepadManager {
    constructor(){
        window.addEventListener("gamepadconnected", (e)=>this.connected(e));
        window.addEventListener("gamepaddisconnected", (e)=>this.disconnected(e));
        this.gamepads = {};
    }
    connected(e) {
        this.gamepads[e.gamepad.index] = new GamepadController(e.gamepad);
    }
    disconnected(e) {
        let g = this.gamepads[e.gamepad.index];
        delete this.gamepads[e.gamepad.index];
    }
    updateGamepadStates() {
        let gps = navigator.getGamepads();
        if (gps == null) return;
        for (const g of gps){
            if (g == null) continue;
            let c = this.gamepads[g.index];
            c.gamepad = g; //put the latest state in the gamepad object
            c.setPressed("jump", buttonPressed(g, 0));
            c.setPressed("wait", buttonPressed(g, 2));
            c.setPressed("menuAccept", buttonPressed(g, 0) || buttonPressed(g, 2));
            //            c.setPressed("startLevel", buttonPressed(g, 3));
            c.setPressed("zoomOut", buttonPressed(g, 6) && !buttonPressed(g, 7));
            c.setPressed("zoomIn", buttonPressed(g, 7) && !buttonPressed(g, 6));
            //            c.setPressed("fullscreen", buttonPressed(g, 8));
            c.setPressed("menu", buttonPressed(g, 9));
            c.setPressed("left", buttonPressed(g, 14) && !buttonPressed(g, 12) && !buttonPressed(g, 13) || g.axes[0] < -c.thresh && Math.abs(g.axes[1]) < 0.5 * Math.abs(g.axes[0]));
            c.setPressed("right", buttonPressed(g, 15) && !buttonPressed(g, 12) && !buttonPressed(g, 13) || g.axes[0] > c.thresh && Math.abs(g.axes[1]) < 0.5 * Math.abs(g.axes[0]));
            c.setPressed("up", buttonPressed(g, 12) && !buttonPressed(g, 14) && !buttonPressed(g, 15) || g.axes[1] < -c.thresh && Math.abs(g.axes[0]) < 0.5 * Math.abs(g.axes[1]));
            c.setPressed("down", buttonPressed(g, 13) && !buttonPressed(g, 14) && !buttonPressed(g, 15) || g.axes[1] > c.thresh && Math.abs(g.axes[0]) < 0.5 * Math.abs(g.axes[1]));
            c.setPressed("panLeft", g.axes[2] < -c.thresh);
            c.setPressed("panRight", g.axes[2] > c.thresh);
            c.setPressed("panUp", g.axes[3] < -c.thresh);
            c.setPressed("panDown", g.axes[3] > c.thresh);
        }
    }
}
function buttonPressed(g, b) {
    return b < g.buttons.length && g.buttons[b].pressed;
}
class TouchController extends Controller {
    mouseActive = false;
    targetOnTouchDown = null;
    constructor(canvas){
        super();
        this.canvas = canvas;
        // Register touch event handlers
        canvas.addEventListener("touchstart", (ev)=>this.process_touchstart(ev), true);
        canvas.addEventListener("touchmove", (ev)=>this.process_touchmove(ev), true);
        canvas.addEventListener("touchcancel", (ev)=>this.process_touchend(ev), true);
        canvas.addEventListener("touchend", (ev)=>this.process_touchend(ev), true);
        canvas.addEventListener("mousedown", (ev)=>this.process_mousedown(ev), true);
        canvas.addEventListener("mouseup", (ev)=>this.process_mouseup(ev), true);
        canvas.addEventListener("mousemove", (ev)=>this.process_mousemove(ev), true);
        this.lastMotion = {
            id: -1,
            active: false,
            x0: 0,
            y0: 0,
            x: 0,
            y: 0
        };
        this.coreTouchTargets = {
            "up": {
                id: -1,
                rect: new Rect(),
                touchXY: [
                    0,
                    0
                ],
                tileInfo: null
            },
            "down": {
                id: -1,
                rect: new Rect(),
                touchXY: [
                    0,
                    0
                ],
                tileInfo: null
            },
            "left": {
                id: -1,
                rect: new Rect(),
                touchXY: [
                    0,
                    0
                ],
                tileInfo: null
            },
            "right": {
                id: -1,
                rect: new Rect(),
                touchXY: [
                    0,
                    0
                ],
                tileInfo: null
            },
            "wait": {
                id: -1,
                rect: new Rect(),
                touchXY: [
                    0,
                    0
                ],
                tileInfo: null
            },
            "jump": {
                id: -1,
                rect: new Rect(),
                touchXY: [
                    0,
                    0
                ],
                tileInfo: null
            },
            "menuAccept": {
                id: -1,
                rect: new Rect(),
                touchXY: [
                    0,
                    0
                ],
                tileInfo: null
            },
            "pan": {
                id: -1,
                rect: new Rect(),
                touchXY: [
                    0,
                    0
                ],
                tileInfo: null
            },
            "zoomIn": {
                id: -1,
                rect: new Rect(),
                touchXY: [
                    0,
                    0
                ],
                tileInfo: null
            },
            "zoomOut": {
                id: -1,
                rect: new Rect(),
                touchXY: [
                    0,
                    0
                ],
                tileInfo: null
            },
            "forceRestart": {
                id: -1,
                rect: new Rect(),
                touchXY: [
                    0,
                    0
                ],
                tileInfo: null
            },
            "menu": {
                id: -1,
                rect: new Rect(),
                touchXY: [
                    0,
                    0
                ],
                tileInfo: null
            },
            "fullscreen": {
                id: -1,
                rect: new Rect(),
                touchXY: [
                    0,
                    0
                ],
                tileInfo: null
            }
        };
        this.touchTargets = this.coreTouchTargets;
    }
    clearMotion() {
        this.lastMotion.active = false;
        this.lastMotion.id = -1;
        this.lastMotion.x0 = 0;
        this.lastMotion.y0 = 0;
        this.lastMotion.x = 0;
        this.lastMotion.y = 0;
        this.targetOnTouchDown = null;
    }
    updateCoreTouchTarget(id, rect, tileInfo) {
        const b0 = this.coreTouchTargets[id];
        b0.rect = rect;
        b0.tileInfo = tileInfo;
        const x = b0.touchXY[0];
        const y = this.canvas.clientHeight - (b0.touchXY[1] + 1);
        if (!b0.rect.collide(x, y)) {
            if (this.controlStates[id] && b0.id != -1) {
                this.setPressed(id, false, false);
                b0.id = -1;
            }
        }
    }
    activateTouchTargets(extraTouchTargets) {
        if (extraTouchTargets === undefined) this.touchTargets = this.coreTouchTargets;
        else this.touchTargets = {
            ...this.coreTouchTargets,
            ...extraTouchTargets
        };
    }
    //touchstart handler
    process_mousedown(ev) {
        lastController = this;
        const x = ev.clientX;
        const y = this.canvas.clientHeight - (ev.clientY + 1);
        this.mouseActive = true;
        this.lastMotion.id = -2;
        this.lastMotion.active = false;
        this.lastMotion.x0 = x;
        this.lastMotion.y0 = y;
        this.lastMotion.x = x;
        this.lastMotion.y = y;
        this.targetOnTouchDown = null;
        for (const [bname, b] of Object.entries(this.touchTargets)){
            const touching = b.rect.collide(x, y);
            if (touching) {
                b.touchXY = [
                    ev.clientX,
                    ev.clientY
                ];
                b.id = -2;
                this.setPressed(bname, true);
                this.targetOnTouchDown = bname;
            }
        }
        ev.preventDefault();
    }
    // touchmove handler
    process_mousemove(ev) {
        lastController = this;
        this.mouseActive = true;
        const x = ev.clientX;
        const y = this.canvas.clientHeight - (ev.clientY + 1);
        if (this.lastMotion.id == -2) {
            this.lastMotion.active = true;
            this.lastMotion.x = x;
            this.lastMotion.y = y;
        }
        for (const [bname, b] of Object.entries(this.touchTargets))if (b.id === -2) {
            const touching = b.rect.collide(x, y);
            if (touching) b.touchXY = [
                ev.clientX,
                ev.clientY
            ]; //update touch info but don't trigger another activation
            else {
                this.setPressed(bname, false, false);
                b.id = -1;
            }
        }
        ev.preventDefault();
    }
    // mouseup handler
    process_mouseup(ev) {
        for (const [bname, b] of Object.entries(this.touchTargets))if (this.controlStates[bname]) {
            b.id = -1;
            this.setPressed(bname, false, true);
            this.controlTimes[bname] = 0;
        }
        this.clearMotion();
        ev.preventDefault();
    }
    //touchstart handler
    process_touchstart(ev) {
        lastController = this;
        this.mouseActive = false;
        this.targetOnTouchDown = null;
        for (let t of ev.changedTouches){
            const x = t.clientX;
            const y = this.canvas.clientHeight - (t.clientY + 1);
            this.lastMotion.id = t.identifier;
            this.lastMotion.active = false;
            this.lastMotion.x0 = x;
            this.lastMotion.y0 = y;
            this.lastMotion.x = x;
            this.lastMotion.y = y;
            for (const [bname, b] of Object.entries(this.touchTargets)){
                const touching = b.rect.collide(x, y);
                if (touching) {
                    b.touchXY = [
                        t.clientX,
                        t.clientY
                    ];
                    b.id = t.identifier;
                    this.targetOnTouchDown = bname;
                    this.setPressed(bname, true);
                }
            }
        }
        ev.preventDefault();
    }
    // touchmove handler
    process_touchmove(ev) {
        this.mouseActive = false;
        for (let t of ev.changedTouches){
            const x = t.clientX;
            const y = this.canvas.clientHeight - (t.clientY + 1);
            if (this.lastMotion.id == t.identifier) {
                this.lastMotion.active = true;
                this.lastMotion.x = x;
                this.lastMotion.y = y;
            }
            for (const [bname, b] of Object.entries(this.touchTargets))if (b.id == t.identifier) {
                const touching = b.rect.collide(x, y);
                if (touching) b.touchXY = [
                    t.clientX,
                    t.clientY
                ];
                else {
                    b.id = -1;
                    this.setPressed(bname, false, false);
                }
            }
        }
        ev.preventDefault();
    }
    // touchend handler
    process_touchend(ev) {
        this.mouseActive = false;
        for (let t of ev.changedTouches){
            for (const [bname, b] of Object.entries(this.touchTargets))if (b.id == t.identifier) {
                b.id = -1;
                this.setPressed(bname, false, true);
                this.controlTimes[bname] = 0;
            }
            if (this.lastMotion.id == t.identifier) this.clearMotion();
        }
        ev.preventDefault();
    }
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"iGTI0":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "TextWindow", ()=>TextWindow);
parcelHelpers.export(exports, "HomeScreen", ()=>HomeScreen);
parcelHelpers.export(exports, "OptionsScreen", ()=>OptionsScreen);
parcelHelpers.export(exports, "WinScreen", ()=>WinScreen);
parcelHelpers.export(exports, "DeadScreen", ()=>DeadScreen);
parcelHelpers.export(exports, "StatsScreen", ()=>StatsScreen);
parcelHelpers.export(exports, "MansionCompleteScreen", ()=>MansionCompleteScreen);
parcelHelpers.export(exports, "HelpControls", ()=>HelpControls);
parcelHelpers.export(exports, "HelpKey", ()=>HelpKey);
parcelHelpers.export(exports, "DailyHubScreen", ()=>DailyHubScreen);
parcelHelpers.export(exports, "CreditsScreen", ()=>CreditsScreen);
var _myMatrix = require("./my-matrix");
var _controllers = require("./controllers");
var _types = require("./types");
var _colorPreset = require("./color-preset");
var _game = require("./game");
var _random = require("./random");
var _tilesets = require("./tilesets");
var _gameMap = require("./game-map");
function scoreToClipboard(stats) {
    const numGhostedLevels = stats.numGhostedLevels;
    const totalScore = stats.totalScore;
    const turns = stats.turns;
    const numCompletedLevels = stats.numCompletedLevels;
    const numLevels = stats.numLevels;
    const win = numCompletedLevels >= numLevels;
    const daily = stats.daily;
    const runText = daily !== null ? "\uD83D\uDCC5 Daily run for " + daily : "\uD83C\uDFB2 Random game";
    const endText = win ? "Completed mission in " + turns + " turns." : "\uD83D\uDC80 Died in mansion " + (numCompletedLevels + 1) + " after " + turns + " turns.";
    navigator.clipboard.writeText(`\uD83C\uDFDB\uFE0F Lurk, Leap, Loot \uD83C\uDFDB\uFE0F\n${runText}\n${endText}\n` + `Completed:   ${numCompletedLevels} of ${numLevels}\n` + `Ghosted:     ${numGhostedLevels}\n` + `Total score: ${totalScore}\n`);
}
class TextWindow {
    pages = [];
    activePage = 0;
    activePageData = [];
    highlightedAction = 0;
    actionSequence = [];
    cachedPageText = "";
    screenSize = (0, _myMatrix.vec2).create();
    state = new Map();
    glyphs = [];
    maxLineLength = 0;
    pixelsPerCharX = 0;
    pixelsPerCharY = 0;
    offsetX = 0;
    offsetY = 0;
    textW = 8;
    textH = 16;
    constructor(){
        this.mat = (0, _myMatrix.mat4).create();
        this.touchTargets = {};
    }
    initAction(action) {
        this.touchTargets[action] = {
            id: -1,
            rect: new (0, _controllers.Rect)(0, 0, 0, 0),
            tileInfo: {},
            touchXY: [
                -1,
                -1
            ]
        };
    }
    parseImage(line, base, row, rows) {
        const end = line.slice(base + 2).indexOf("#");
        if (end < 0) return [
            line,
            base
        ];
        const spriteNum = Number(line.slice(base + 1, base + 2 + end));
        if (Number.isNaN(spriteNum)) return [
            line,
            base
        ];
        this.glyphs.push([
            spriteNum,
            new (0, _controllers.Rect)(base, rows - row - 0.875, 2, 1)
        ]);
        line = line.slice(0, base) + "  " + line.slice(base + 3 + end); //trim out the sprite tag and replace with two spaces
        return [
            line,
            base + 1
        ];
    }
    parseButton(line, base, row, rows) {
        const origin = base;
        let pipe, end;
        while(true){
            pipe = line.slice(base).indexOf("|");
            if (pipe < 0) return [
                line,
                base
            ];
            pipe += base;
            end = line.slice(pipe + 1).indexOf("]");
            if (end < 0) return [
                line,
                base
            ];
            end += pipe + 1;
            if (base === pipe) break;
            if (line[base] === "#") [line, base] = this.parseImage(line, base, row, rows);
            base += 1;
        }
        const action = line.slice(pipe + 1, end);
        if (action !== undefined && action !== "") {
            if (!(action in this.touchTargets)) this.initAction(action);
            const posData = [
                origin,
                base + 1,
                row
            ];
            const [x0, y0] = [
                posData[0],
                posData[2] - 1 / 8
            ];
            const [x1, y1] = [
                posData[1],
                posData[2] + 1
            ];
            const tt = this.touchTargets[action];
            tt.rect = new (0, _controllers.Rect)(x0, rows - y1, x1 - x0, y1 - y0);
            this.actionSequence.push(action);
        }
        line = line.slice(0, pipe) + line.slice(end);
        base = pipe;
        return [
            line,
            base
        ];
    }
    parseUI(screenSize) {
        //TODO: Parse Glyphs and convert to double spaces
        let pageText = this.pages[this.activePage];
        for (const [key, value] of this.state)pageText = pageText.replace("$" + key + "$", value);
        if (pageText === this.cachedPageText && this.screenSize.equals(screenSize)) return;
        this.cachedPageText = pageText;
        (0, _myMatrix.vec2).copy(this.screenSize, screenSize);
        this.activePageData = pageText.split("\n");
        const lines = this.activePageData;
        this.glyphs.length = 0;
        this.actionSequence = [];
        this.touchTargets = {};
        for(let row = 0; row < lines.length; ++row){
            let line = lines[row];
            let base = 0;
            while(base < line.length){
                switch(line[base]){
                    case "#":
                        [line, base] = this.parseImage(line, base, row, lines.length);
                        break;
                    case "[":
                        [line, base] = this.parseButton(line, base, row, lines.length);
                        break;
                }
                base += 1;
            }
            lines[row] = line;
        }
        this.highlightedAction = Math.max(0, Math.min(this.actionSequence.length - 1, this.highlightedAction));
        this.maxLineLength = 0;
        for (const line of this.activePageData)this.maxLineLength = Math.max(this.maxLineLength, line.length);
        this.updateScreenSize(screenSize);
        // Now that screen size has been determined, compute touch targets' screen extents
        for(let a in this.touchTargets){
            const tt = this.touchTargets[a];
            tt.rect[0] -= this.offsetX;
            tt.rect[1] -= this.offsetY;
            tt.rect[0] *= this.pixelsPerCharX;
            tt.rect[1] *= this.pixelsPerCharY;
            tt.rect[2] *= this.pixelsPerCharX;
            tt.rect[3] *= this.pixelsPerCharY;
        }
    }
    updateScreenSize(screenSize) {
        const scaleFactor = _game.statusBarZoom(screenSize);
        this.pixelsPerCharX = this.textW * scaleFactor;
        this.pixelsPerCharY = this.textH * scaleFactor;
        const linesPixelSizeX = this.maxLineLength * this.pixelsPerCharX;
        const linesPixelSizeY = this.activePageData.length * this.pixelsPerCharY;
        const numCharsX = screenSize[0] / this.pixelsPerCharX;
        const numCharsY = screenSize[1] / this.pixelsPerCharY;
        this.offsetX = Math.floor((screenSize[0] - linesPixelSizeX) / -2) / this.pixelsPerCharX;
        this.offsetY = Math.floor((screenSize[1] - linesPixelSizeY) / -2) / this.pixelsPerCharY;
        (0, _myMatrix.mat4).ortho(this.mat, this.offsetX, this.offsetX + numCharsX, this.offsetY, this.offsetY + numCharsY, 1, -1);
    }
    render(renderer) {
        const lines = this.activePageData;
        const matScreenFromTextArea = this.mat;
        const maxLineLength = this.maxLineLength;
        const colorBorder = 0xffd020b0;
        const colorBackground = 0xff1a0416;
        const colorText = 0xffeef0ff;
        const buttonColor = 0xff802060;
        const uiSelectColor = 0xffd020b0;
        // Draw a stretched box to make a darkened background for the text.
        const solidChar = (0, _tilesets.getFontTileSet)().background.textureIndex;
        renderer.start(matScreenFromTextArea, 0);
        renderer.addGlyph(-1.5, -0.75, maxLineLength + 1.5, lines.length + 0.75, {
            textureIndex: solidChar,
            color: colorBorder
        });
        renderer.addGlyph(-1, -0.5, maxLineLength + 1, lines.length + 0.5, {
            textureIndex: solidChar,
            color: colorBackground
        });
        renderer.flush();
        // Draw background areas for touchTargets
        const matScreenFromPixel = (0, _myMatrix.mat4).create();
        (0, _myMatrix.mat4).ortho(matScreenFromPixel, 0, this.screenSize[0], 0, this.screenSize[1], 1, -1);
        renderer.start(matScreenFromPixel, 0);
        for(let a in this.touchTargets){
            if ((0, _controllers.lastController)?.controlStates[a]) this.highlightedAction = this.actionSequence.indexOf(a);
            const r = this.touchTargets[a].rect;
            const isHighlightedAction = this.highlightedAction < this.actionSequence.length && this.actionSequence[this.highlightedAction] === a;
            const color = isHighlightedAction ? uiSelectColor : buttonColor;
            renderer.addGlyph(r[0], r[1], r[0] + r[2], r[1] + r[3], {
                textureIndex: solidChar,
                color: color
            });
        }
        renderer.flush();
        // Draw glyphs
        renderer.start(matScreenFromTextArea, 1);
        for (const g of this.glyphs){
            const r = g[1];
            renderer.addGlyph(r[0], r[1], r[2] + r[0], r[3] + r[1], {
                textureIndex: g[0],
                color: _colorPreset.white
            });
        }
        renderer.flush();
        // Draw text
        renderer.start(matScreenFromTextArea, 0);
        for(let i = 0; i < lines.length; ++i){
            const row = lines.length - (1 + i);
            for(let j = 0; j < lines[i].length; ++j){
                const col = j;
                const ch = lines[i];
                if (ch === " ") continue;
                const glyphIndex = lines[i].charCodeAt(j);
                renderer.addGlyph(col, row, col + 1, row + 1, {
                    textureIndex: glyphIndex,
                    color: colorText
                });
            }
        }
        renderer.flush();
    }
    updateData(properties) {}
    update(state) {}
    navigateUI(activated) {
        let action = "";
        if (activated("up")) {
            this.highlightedAction--;
            if (this.highlightedAction < 0) this.highlightedAction = this.actionSequence.length - 1;
        } else if (activated("down")) {
            this.highlightedAction++;
            if (this.highlightedAction >= this.actionSequence.length) this.highlightedAction = 0;
        } else if (this.highlightedAction < this.actionSequence.length && activated("menuAccept")) action = this.actionSequence[this.highlightedAction];
        return action;
    }
    onControls(state, activated) {}
}
class HomeScreen extends TextWindow {
    pages = [
        `Lurk, Leap, Loot

$playRestartOrResume$
[H|helpControls]: Controls help
[M|helpKey]: Map key
[D|homeDaily]: Daily challenge
[O|homeOptions]: Options
[S|homeStats]: Statistics
[C|credits]: Credits`
    ];
    constructor(){
        super();
    }
    update(state) {
        const commands = !state.hasStartedGame ? "[P|homePlay]: Play game\n" : state.dailyRun !== null ? "[R|homePlay]: Resume daily game\n[N|homeRestart]: New game" : "[R|homePlay]: Resume game\n[N|homeRestart]: New game";
        this.state.set("playRestartOrResume", commands);
    }
    onControls(state, activated) {
        const actionSelected = this.navigateUI(activated);
        if (activated("homePlay") || actionSelected == "homePlay" || activated("menu") || actionSelected == "menu") {
            state.gameMode = (0, _types.GameMode).Mansion;
            state.hasStartedGame = true;
        } else if (activated("homeRestart") || actionSelected == "homeRestart") {
            state.rng = new (0, _random.RNG)();
            state.dailyRun = null;
            _game.restartGame(state);
        } else if (activated("homeDaily") || actionSelected == "homeDaily") state.gameMode = (0, _types.GameMode).DailyHub;
        else if (activated("homeStats") || actionSelected == "homeStats") state.gameMode = (0, _types.GameMode).StatsScreen;
        else if (activated("homeOptions") || actionSelected == "homeOptions") state.gameMode = (0, _types.GameMode).OptionsScreen;
        else if (activated("helpControls") || actionSelected == "helpControls") state.gameMode = (0, _types.GameMode).HelpControls;
        else if (activated("helpKey") || actionSelected == "helpKey") state.gameMode = (0, _types.GameMode).HelpKey;
        else if (activated("credits") || actionSelected == "credits") state.gameMode = (0, _types.GameMode).CreditsScreen;
    }
}
class OptionsScreen extends TextWindow {
    pages = [
        `Options

         Sound volume: $volumeLevel$%
[=|volumeUp]      Volume up
[-|volumeDown]      Volume down
[0|volumeMute]      Volume mute: $volumeMute$
[9|guardMute]      Guard mute: $guardMute$
[K|keyRepeatRate]      Key repeat rate $keyRepeatRate$ms
[D|keyRepeatDelay]      Key repeat delay $keyRepeatDelay$ms
[Ctrl+R|forceRestart] Reset data

[Esc|menu]    Back to menu`
    ];
    update(state) {
        this.state.set("volumeLevel", (state.soundVolume * 100).toFixed(0));
        this.state.set("volumeMute", state.volumeMute ? "Yes" : "No");
        this.state.set("guardMute", state.guardMute ? "Yes" : "No");
        this.state.set("keyRepeatRate", state.keyRepeatRate.toString());
        this.state.set("keyRepeatDelay", state.keyRepeatDelay.toString());
    }
    onControls(state, activated) {
        const action = this.navigateUI(activated);
        if (activated("menu") || action == "menu") state.gameMode = (0, _types.GameMode).HomeScreen;
        else if (activated("volumeUp") || action == "volumeUp") {
            const soundVolume = Math.min(1.0, state.soundVolume + 0.1);
            _game.setSoundVolume(state, soundVolume);
        } else if (activated("volumeDown") || action == "volumeDown") {
            const soundVolume = Math.max(0.1, state.soundVolume - 0.1);
            _game.setSoundVolume(state, soundVolume);
        } else if (activated("volumeMute") || action == "volumeMute") _game.setVolumeMute(state, !state.volumeMute);
        else if (activated("guardMute") || action == "guardMute") _game.setGuardMute(state, !state.guardMute);
        else if (activated("keyRepeatRate") || action == "keyRepeatRate") {
            state.keyRepeatRate -= 50;
            if (state.keyRepeatRate < 100) state.keyRepeatRate = 400;
            window.localStorage.setItem("LLL/keyRepeatRate", state.keyRepeatRate.toString());
        } else if (activated("keyRepeatDelay") || action == "keyRepeatDelay") {
            state.keyRepeatDelay -= 50;
            if (state.keyRepeatDelay < 100) state.keyRepeatDelay = 500;
            window.localStorage.setItem("LLL/keyRepeatDelay", state.keyRepeatDelay.toString());
        } else if (activated("forceRestart") || action == "forceRestart") {
            //TODO: Prompt??
            window.localStorage.clear();
            state.persistedStats = _game.loadStats();
            state.gameMode = (0, _types.GameMode).HomeScreen;
            _game.setSoundVolume(state, 1.0);
            _game.setVolumeMute(state, false);
            _game.setGuardMute(state, false);
        }
    }
}
class HelpControls extends TextWindow {
    pages = [
        `Help: Controls

  Move: Arrows / WASD / HJKL
  Wait: Space / Z / Period / Numpad5
  Leap/Run: Shift + move (unlimited!)
  Leap/Run (Toggle): F / Numpad+
  Zoom View: [ / ]
  Volume: (Mute/Down/Up) 0 / - / =
  Guard Mute (Toggle): 9
  Show last speech: Tab

Disable NumLock if using numpad
Mouse, touch and gamepad also supported

[Esc|menu] Back to menu`
    ];
    update(state) {}
    onControls(state, activated) {
        const action = this.navigateUI(activated);
        if (activated("menu") || action == "menu") state.gameMode = (0, _types.GameMode).HomeScreen;
    }
}
class HelpKey extends TextWindow {
    pages = [
        `Map Key

#${(0, _tilesets.getTileSet)().playerTiles.normal.textureIndex}# Thief: You!
#${(0, _tilesets.getTileSet)().npcTiles[3].textureIndex}# Guard: Avoid them!
#${(0, _tilesets.getTileSet)().itemTiles[(0, _gameMap.ItemType).Coin].textureIndex}# Loot: Steal it!
#${(0, _tilesets.getTileSet)().itemTiles[(0, _gameMap.ItemType).Bush].textureIndex}# Tree: Hiding place
#${(0, _tilesets.getTileSet)().itemTiles[(0, _gameMap.ItemType).Table].textureIndex}# Table: Hiding place
#${(0, _tilesets.getTileSet)().itemTiles[(0, _gameMap.ItemType).Chair].textureIndex}# Stool: Guards sit here
#${(0, _tilesets.getTileSet)().itemTiles[(0, _gameMap.ItemType).TorchLit].textureIndex}# Torch: Guards light them
#${(0, _tilesets.getTileSet)().terrainTiles[(0, _gameMap.TerrainType).OneWayWindowN].textureIndex}# Window: One-way escape route
#${(0, _tilesets.getTileSet)().terrainTiles[(0, _gameMap.TerrainType).GroundWoodCreaky].textureIndex}# Creaky floor: Alerts guards

[Esc|menu] Back to menu`
    ];
    update(state) {}
    onControls(state, activated) {
        const action = this.navigateUI(activated);
        if (activated("menu") || action == "menu") state.gameMode = (0, _types.GameMode).HomeScreen;
    }
}
class CreditsScreen extends TextWindow {
    pages = [
        `Credits

Made for 2023 Seven-Day Roguelike Challenge
Expanded Post-Jam Edition

by James McNeill and Damien Moore

Additional voices by Evan Moore
Additional assistance by Mike Gaffney
Testing by Mendi Carroll and Tom Elmer
Special thanks to Mendi Carroll

[Esc|menu] Back to menu`
    ];
    update(state) {}
    onControls(state, activated) {
        const action = this.navigateUI(activated);
        if (activated("menu") || action == "menu") state.gameMode = (0, _types.GameMode).HomeScreen;
    }
}
class DailyHubScreen extends TextWindow {
    pages = [
        //Daily runs
        `The Daily Challenge

Play a new seeded game each day and 
compare results with your rivals.

$dailyStatus$
Plays:             $plays$
Wins:              $wins$
Best score:        $bestScore$

$playMode$
$timeLeft$

Last game played:  $lastPlayed$
Last score:        $lastScore$
[C|copyScore] Copy last game to clipboard
$copyState$

[Esc|menu] Back to menu`
    ];
    stateCopied = false;
    prevDay(d) {
        const pd = new Date(d);
        pd.setDate(pd.getDate() - 1);
        return pd;
    }
    nextDay(d) {
        const pd = new Date(d);
        pd.setDate(pd.getDate() + 1);
        const dnow = new Date();
        dnow.setUTCHours(24, 0, 0, 0);
        if (pd > dnow) return d;
        return pd;
    }
    timeToMidnightUTC() {
        const d = new Date();
        const dm = new Date(d);
        dm.setUTCHours(24, 0, 0, 0);
        const duration = dm.getTime() - d.getTime();
        const seconds = Math.floor(duration / 1000 % 60);
        const minutes = Math.floor(duration / 60000 % 60);
        const hours = Math.floor(duration / 3600000 % 24);
        return hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
    }
    update(state) {
        const lastDailyGameStats = state.persistedStats.lastPlayedDailyGame;
        if (state.persistedStats.currentDailyGameId !== _game.getCurrentDateFormatted()) {
            state.persistedStats.currentDailyGameId = _game.getCurrentDateFormatted();
            state.persistedStats.currentDailyPlays = 0;
            state.persistedStats.currentDailyWins = 0;
            state.persistedStats.currentDailyWinFirstTry = 0;
            state.persistedStats.currentDailyBestScore = 0;
            _game.saveStats(state.persistedStats);
        }
        if (lastDailyGameStats !== null && state.persistedStats.currentDailyPlays > 0) {
            if (state.persistedStats.currentDailyWins === 0) this.state.set("dailyStatus", state.persistedStats.currentDailyGameId + " game played");
            else if (state.persistedStats.currentDailyWinFirstTry === 0) this.state.set("dailyStatus", state.persistedStats.currentDailyGameId + " game won");
            else {
                const tile = (0, _tilesets.getTileSet)().itemTiles[(0, _gameMap.ItemType).TorchLit].textureIndex;
                this.state.set("dailyStatus", state.persistedStats.currentDailyGameId + ` game won first try #${tile}#`);
            }
            this.state.set("timeLeft", "Time to next game: " + this.timeToMidnightUTC());
            this.state.set("playMode", "[P|homePlay] Play it again");
        } else {
            this.state.set("dailyStatus", state.persistedStats.currentDailyGameId + ` game ready`);
            this.state.set("timeLeft", "Time left to play: " + this.timeToMidnightUTC());
            this.state.set("playMode", "[P|homePlay] Play now");
        }
        const lastDailyDate = lastDailyGameStats?.daily ?? "None";
        const lastDailyScore = lastDailyGameStats?.totalScore ?? 0;
        this.state.set("plays", state.persistedStats.currentDailyPlays.toString());
        this.state.set("wins", state.persistedStats.currentDailyWins.toString());
        this.state.set("lastPlayed", lastDailyDate);
        this.state.set("lastScore", lastDailyScore.toString());
        this.state.set("bestScore", state.persistedStats.currentDailyBestScore.toString());
        this.state.set("copyState", this.stateCopied ? "    COPIED!" : "");
    }
    onControls(state, activated) {
        const action = this.navigateUI(activated);
        if (activated("menu") || action == "menu") {
            this.stateCopied = false;
            state.gameMode = (0, _types.GameMode).HomeScreen;
        } else if (activated("homePlay") || action == "homePlay") {
            this.stateCopied = false;
            let date = _game.getCurrentDateFormatted();
            state.rng = new (0, _random.RNG)("Daily " + date);
            state.dailyRun = date;
            _game.restartGame(state);
            state.hasStartedGame = true;
        } else if (activated("copyScore") || action == "copyScore") {
            const stats = state.persistedStats.lastPlayedDailyGame ?? {
                totalScore: 0,
                turns: 0,
                numLevels: 0,
                numCompletedLevels: 0,
                numGhostedLevels: 0,
                daily: null,
                timeStarted: Date.now(),
                timeEnded: 0
            };
            scoreToClipboard(stats);
            this.stateCopied = true;
        }
    }
}
class StatsScreen extends TextWindow {
    pages = [
        `Play Statistics

All games
Total plays:             $totalPlays$
Total wins:              $totalWins$
Total mansions ghosted:  $totalGhosts$
Best score:              $bestScore$

Daily games
Total plays:             $allDailyPlays$
Total wins:              $allDailyWins$
Total wins first try:    $allDailyWinsFirstTry$

[Esc|menu] Back to menu`
    ];
    update(state) {
        this.state.set("totalPlays", state.persistedStats.totalPlays.toString());
        this.state.set("totalWins", state.persistedStats.totalWins.toString());
        this.state.set("totalGhosts", state.persistedStats.totalGhosts.toString());
        this.state.set("bestScore", state.persistedStats.bestScore.toString());
        this.state.set("allDailyPlays", state.persistedStats.allDailyPlays.toString());
        this.state.set("allDailyWins", state.persistedStats.allDailyWins.toString());
        this.state.set("allDailyWinsFirstTry", state.persistedStats.allDailyWinsFirstTry.toString());
    }
    onControls(state, activated) {
        const action = this.navigateUI(activated);
        if (activated("menu") || action == "menu") state.gameMode = (0, _types.GameMode).HomeScreen;
    }
}
class MansionCompleteScreen extends TextWindow {
    pages = [
        `Mansion $level$ Complete!

$levelStats$Loot:        $lootScore$
Ghost:       $ghostBonus$
Speed:       $timeBonus$
Total:       $levelScore$

Cumulative:  $totalScore$

[N|startLevel]: Next`
    ];
    update(state) {
        const numTurnsPar = _game.numTurnsParForCurrentMap(state);
        const timeBonus = Math.max(0, numTurnsPar - state.turns);
        const lootScore = state.lootStolen * 10;
        const ghosted = state.levelStats.numSpottings === 0;
        const ghostBonus = ghosted ? lootScore : 0;
        const score = lootScore + timeBonus + ghostBonus;
        let levelStats = "Turns:       " + state.turns + "\n";
        if (state.levelStats.numSpottings > 0) levelStats += "Spottings:   " + state.levelStats.numSpottings + "\n";
        if (state.levelStats.damageTaken > 0) levelStats += "Injuries:    " + state.levelStats.damageTaken + "\n";
        if (state.levelStats.numKnockouts > 0) levelStats += "Knockouts:   " + state.levelStats.numKnockouts + "\n";
        if (levelStats.length > 0) levelStats += "\n";
        this.state.set("level", (state.level + 1).toString());
        this.state.set("levelStats", levelStats);
        this.state.set("lootScore", (state.lootStolen * 10).toString());
        this.state.set("timeBonus", timeBonus.toString());
        this.state.set("ghostBonus", ghostBonus.toString());
        this.state.set("levelScore", score.toString());
        this.state.set("totalScore", state.gameStats.totalScore.toString());
    }
    onControls(state, activated) {
        const action = this.navigateUI(activated);
        if (activated("startLevel") || action == "startLevel") {
            if (state.level >= _game.gameConfig.numGameMaps - 1) _game.advanceToWin(state);
            else _game.setupLevel(state, state.level + 1);
        }
    }
}
class DeadScreen extends TextWindow {
    pages = [
        `         You are dead!

Statistics
Completed:     $level$ of $numLevels$
Ghosted:       $numGhostedLevels$
Total Score:   $totalScore$

[N|homeRestart]:   New game
[C|copyScore]:   Copy score to clipboard
$copyState$
[Esc|menu]: Exit to home screen`
    ];
    stateCopied = false;
    update(state) {
        this.state.set("level", state.level.toString());
        this.state.set("numLevels", state.gameMapRoughPlans.length.toString());
        this.state.set("numGhostedLevels", state.gameStats.numGhostedLevels.toString());
        this.state.set("totalScore", state.gameStats.totalScore.toString());
        this.state.set("copyState", this.stateCopied ? "       COPIED!" : "");
    }
    onControls(state, activated) {
        const action = this.navigateUI(activated);
        if (activated("homeRestart") || action == "homeRestart") {
            this.stateCopied = false;
            state.rng = new (0, _random.RNG)();
            state.dailyRun = null;
            _game.restartGame(state);
        } else if (activated("menu") || action == "menu") {
            this.stateCopied = false;
            state.rng = new (0, _random.RNG)();
            state.dailyRun = null;
            _game.restartGame(state);
            state.gameMode = (0, _types.GameMode).HomeScreen;
            state.hasStartedGame = false;
        } else if (activated("copyScore") || action == "copyScore") {
            scoreToClipboard(state.gameStats);
            this.stateCopied = true;
        }
    }
}
class WinScreen extends TextWindow {
    pages = [
        `Mission Complete!

Statistics
Ghosted:       $numGhostedLevels$ of $numLevels$
Total Score:   $totalScore$

[N|homeRestart]:   New game
[C|copyScore]:   Copy score to clipboard
$copyState$
[Esc|menu]: Exit to home screen`
    ];
    stateCopied = false;
    update(state) {
        this.state.set("numLevels", state.gameMapRoughPlans.length.toString());
        this.state.set("numGhostedLevels", state.gameStats.numGhostedLevels.toString());
        this.state.set("totalScore", state.gameStats.totalScore.toString());
        this.state.set("copyState", this.stateCopied ? "       COPIED!" : "");
    }
    onControls(state, activated) {
        const action = this.navigateUI(activated);
        if (activated("homeRestart") || action == "homeRestart") {
            this.stateCopied = false;
            state.rng = new (0, _random.RNG)();
            state.dailyRun = null;
            _game.restartGame(state);
        } else if (activated("menu") || action == "menu") {
            this.stateCopied = false;
            state.rng = new (0, _random.RNG)();
            state.dailyRun = null;
            _game.restartGame(state);
            state.gameMode = (0, _types.GameMode).HomeScreen;
            state.hasStartedGame = false;
        } else if (activated("copyScore") || action == "copyScore") {
            scoreToClipboard(state.gameStats);
            this.stateCopied = true;
        }
    }
}

},{"./my-matrix":"21x0k","./controllers":"ldPU4","./types":"38MWl","./color-preset":"37fo9","./game":"edeGs","./random":"gUC1v","./tilesets":"3SSZh","./game-map":"3bH7G","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"38MWl":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "GameMode", ()=>GameMode);
let GameMode;
(function(GameMode) {
    GameMode[GameMode["HomeScreen"] = 0] = "HomeScreen";
    GameMode[GameMode["StatsScreen"] = 1] = "StatsScreen";
    GameMode[GameMode["OptionsScreen"] = 2] = "OptionsScreen";
    GameMode[GameMode["HelpControls"] = 3] = "HelpControls";
    GameMode[GameMode["HelpKey"] = 4] = "HelpKey";
    GameMode[GameMode["Mansion"] = 5] = "Mansion";
    GameMode[GameMode["MansionComplete"] = 6] = "MansionComplete";
    GameMode[GameMode["Dead"] = 7] = "Dead";
    GameMode[GameMode["Win"] = 8] = "Win";
    GameMode[GameMode["DailyHub"] = 9] = "DailyHub";
    GameMode[GameMode["CreditsScreen"] = 10] = "CreditsScreen";
})(GameMode || (GameMode = {}));

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}]},["kH4kW","edeGs"], "edeGs", "parcelRequire550f")

//# sourceMappingURL=index.a998808b.js.map
