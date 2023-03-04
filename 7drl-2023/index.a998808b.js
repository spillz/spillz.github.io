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
var _myMatrix = require("./my-matrix");
var _createMap = require("./create-map");
var _gameMap = require("./game-map");
var _guard = require("./guard");
var _render = require("./render");
var _audio = require("./audio");
var _colorPreset = require("./color-preset");
var fontImageRequire = require("aa29dbe273d3c9e5");
var tilesImageRequire = require("69220e6d6d3be079");
window.onload = loadResourcesThenRun;
function loadResourcesThenRun() {
    Promise.all([
        loadImage(fontImageRequire),
        loadImage(tilesImageRequire)
    ]).then(main);
}
function main(images) {
    const canvas = document.querySelector("#canvas");
    const gl = canvas.getContext("webgl2", {
        alpha: false,
        depth: false
    });
    if (gl == null) {
        alert("Unable to initialize WebGL2. Your browser or machine may not support it.");
        return;
    }
    const renderer = (0, _render.createRenderer)(gl, images);
    const sounds = {};
    const state = initState(sounds);
    document.body.addEventListener("keydown", onKeyDown);
    document.body.addEventListener("keyup", onKeyUp);
    function onKeyDown(e) {
        if (Object.keys(state.sounds).length == 0) (0, _audio.setupSounds)(state.sounds);
        if (e.code == "KeyF" || e.code == "NumpadAdd") {
            state.shiftModifierActive = true;
            return;
        }
        if (e.code == "KeyR") {
            e.preventDefault();
            resetState(state);
        } else if (e.code == "KeyA") {
            e.preventDefault();
            if (e.ctrlKey) state.seeAll = !state.seeAll;
            else {
                const speed = state.shiftModifierActive || e.shiftKey || e.timeStamp - state.shiftUpLastTimeStamp < 1.0 ? 2 : 1;
                tryMovePlayer(state, -speed, 0);
            }
        } else {
            const speed = state.shiftModifierActive || e.shiftKey || e.timeStamp - state.shiftUpLastTimeStamp < 1.0 ? 2 : 1;
            if (e.code == "ArrowLeft" || e.code == "Numpad4" || e.code == "KeyA" || e.code == "KeyH") {
                e.preventDefault();
                tryMovePlayer(state, -speed, 0);
            } else if (e.code == "ArrowRight" || e.code == "Numpad6" || e.code == "KeyD" || e.code == "KeyL") {
                e.preventDefault();
                tryMovePlayer(state, speed, 0);
            } else if (e.code == "ArrowDown" || e.code == "Numpad2" || e.code == "KeyS" || e.code == "KeyJ") {
                e.preventDefault();
                tryMovePlayer(state, 0, -speed);
            } else if (e.code == "ArrowUp" || e.code == "Numpad8" || e.code == "KeyW" || e.code == "KeyK") {
                e.preventDefault();
                tryMovePlayer(state, 0, speed);
            }
        }
        state.shiftModifierActive = false;
    }
    function onKeyUp(e) {
        if (e.code == "ShiftLeft" || e.code == "ShiftRight") state.shiftUpLastTimeStamp = e.timeStamp;
    }
    function requestUpdateAndRender() {
        requestAnimationFrame((now)=>updateAndRender(now, renderer, state));
    }
    function onWindowResized() {
        requestUpdateAndRender();
    }
    window.addEventListener("resize", onWindowResized);
    requestUpdateAndRender();
}
function tryMovePlayer(state, dx, dy) {
    const player = state.player;
    // Can't move if you're dead.
    if (player.health == 0) return;
    // Are we trying to exit the level?
    const posNew = (0, _myMatrix.vec2).fromValues(player.pos[0] + dx, player.pos[1] + dy);
    if (posNew[0] < 0 || posNew[1] < 0 || posNew[0] >= state.gameMap.cells.sizeX || posNew[1] >= state.gameMap.cells.sizeY) return;
    // Is something in the way?
    if (blocked(state.gameMap, player.pos, posNew)) return;
    player.pos = posNew;
    switch(state.gameMap.cells.at(...posNew).type){
        case (0, _gameMap.TerrainType).GroundWood:
            state.sounds["footstepWood"].volume(0.15);
            state.sounds["footstepWood"].play();
            break;
        case (0, _gameMap.TerrainType).GroundNormal:
            state.sounds["footstepGravel"].volume(0.03);
            state.sounds["footstepGravel"].play();
            break;
        case (0, _gameMap.TerrainType).GroundGrass:
            state.sounds["footstepGrass"].volume(0.05);
            state.sounds["footstepGrass"].play();
            break;
        case (0, _gameMap.TerrainType).GroundWater:
            state.sounds["footstepWater"].volume(0.05);
            state.sounds["footstepWater"].play();
            break;
        case (0, _gameMap.TerrainType).GroundMarble:
            state.sounds["footstepTile"].volume(0.05);
            state.sounds["footstepTile"].play();
            break;
        default:
            state.sounds["footstepTile"].volume(0.02);
            state.sounds["footstepTile"].play();
            break;
    }
}
function blocked(map, posOld, posNew) {
    if (posNew[0] < 0 || posNew[1] < 0 || posNew[0] >= map.cells.sizeX || posNew[1] >= map.cells.sizeY) return true;
    if (posOld[0] == posNew[0] && posOld[1] == posNew[1]) return false;
    const cell = map.cells.at(posNew[0], posNew[1]);
    const tileType = cell.type;
    if (cell.blocksPlayerMove) return true;
    if (tileType == (0, _gameMap.TerrainType).OneWayWindowE && posNew[0] <= posOld[0]) return true;
    if (tileType == (0, _gameMap.TerrainType).OneWayWindowW && posNew[0] >= posOld[0]) return true;
    if (tileType == (0, _gameMap.TerrainType).OneWayWindowN && posNew[1] <= posOld[1]) return true;
    if (tileType == (0, _gameMap.TerrainType).OneWayWindowS && posNew[1] >= posOld[1]) return true;
    if (map.guards.find((guard)=>guard.pos[0] == posNew[0] && guard.pos[1] == posNew[1]) !== undefined) return true;
    return false;
}
function loadImage(src) {
    return new Promise((resolve, reject)=>{
        const img = new Image();
        img.onload = ()=>resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}
const tileIndexForTerrainType = [
    112,
    116,
    118,
    120,
    122,
    122,
    64,
    65,
    65,
    65,
    66,
    67,
    70,
    73,
    66,
    68,
    69,
    72,
    66,
    74,
    71,
    75,
    52,
    53,
    54,
    55,
    50,
    50,
    77,
    76
];
const colorForTerrainType = [
    _colorPreset.lightGray,
    _colorPreset.darkGreen,
    _colorPreset.lightBlue,
    _colorPreset.darkCyan,
    _colorPreset.darkBrown,
    _colorPreset.darkBrown,
    _colorPreset.lightGray,
    _colorPreset.lightGray,
    _colorPreset.lightGray,
    _colorPreset.lightGray,
    _colorPreset.lightGray,
    _colorPreset.lightGray,
    _colorPreset.lightGray,
    _colorPreset.lightGray,
    _colorPreset.lightGray,
    _colorPreset.lightGray,
    _colorPreset.lightGray,
    _colorPreset.lightGray,
    _colorPreset.lightGray,
    _colorPreset.lightGray,
    _colorPreset.lightGray,
    _colorPreset.lightGray,
    _colorPreset.lightGray,
    _colorPreset.lightGray,
    _colorPreset.lightGray,
    _colorPreset.lightGray,
    _colorPreset.lightGray,
    _colorPreset.lightGray,
    _colorPreset.lightGray,
    _colorPreset.lightGray
];
const tileIndexForItemType = [
    100,
    98,
    96,
    110,
    89,
    87,
    50,
    50
];
const colorForItemType = [
    _colorPreset.darkBrown,
    _colorPreset.darkBrown,
    _colorPreset.darkGreen,
    _colorPreset.lightYellow,
    _colorPreset.darkBrown,
    _colorPreset.darkBrown,
    _colorPreset.lightGray,
    _colorPreset.lightGray
];
const unlitColor = _colorPreset.lightBlue;
function renderWorld(state, addGlyph) {
    for(let x = 0; x < state.gameMap.cells.sizeX; ++x)for(let y = 0; y < state.gameMap.cells.sizeY; ++y){
        const cell = state.gameMap.cells.at(x, y);
        if (!cell.seen && !state.seeAll) continue;
        const terrainType = cell.type;
        const tileIndex = tileIndexForTerrainType[terrainType];
        const color = cell.lit ? colorForTerrainType[terrainType] : unlitColor;
        addGlyph(x, y, x + 1, y + 1, tileIndex, color);
    }
    for (const item of state.gameMap.items){
        const cell = state.gameMap.cells.at(item.pos[0], item.pos[1]);
        if (!cell.seen && !state.seeAll) continue;
        const tileIndex = tileIndexForItemType[item.type];
        const color = cell.lit ? colorForItemType[item.type] : unlitColor;
        addGlyph(item.pos[0], item.pos[1], item.pos[0] + 1, item.pos[1] + 1, tileIndex, color);
    }
}
function renderPlayer(state, addGlyph) {
    const player = state.player;
    const x = player.pos[0];
    const y = player.pos[1];
    const lit = state.gameMap.cells.at(x, y).lit;
    const hidden = player.hidden(state.gameMap);
    const color = player.damagedLastTurn ? 0xff0000ff : player.noisy ? _colorPreset.lightCyan : hidden ? 0xd0101010 : !lit ? _colorPreset.lightBlue : _colorPreset.lightGray;
    addGlyph(x, y, x + 1, y + 1, 32, color);
}
function renderGuards(state, addGlyph) {
    for (const guard of state.gameMap.guards){
        const tileIndex = 33 + tileIndexOffsetForDir(guard.dir);
        const cell = state.gameMap.cells.at(guard.pos[0], guard.pos[1]);
        const visible = state.seeAll || cell.seen || guard.speaking;
        if (!visible && (0, _myMatrix.vec2).squaredDistance(state.player.pos, guard.pos) > 36) continue;
        const color = !visible ? _colorPreset.darkGray : guard.mode == (0, _guard.GuardMode).Patrol && !guard.speaking && !cell.lit ? unlitColor : _colorPreset.lightMagenta;
        addGlyph(guard.pos[0], guard.pos[1], guard.pos[0] + 1, guard.pos[1] + 1, tileIndex, color);
    }
}
function tileIndexOffsetForDir(dir) {
    if (dir[1] > 0) return 1;
    else if (dir[1] < 0) return 3;
    else if (dir[0] > 0) return 0;
    else if (dir[0] < 0) return 2;
    else return 3;
}
function createCamera(posPlayer) {
    const camera = {
        position: (0, _myMatrix.vec2).create(),
        velocity: (0, _myMatrix.vec2).create()
    };
    (0, _myMatrix.vec2).copy(camera.position, posPlayer);
    (0, _myMatrix.vec2).zero(camera.velocity);
    return camera;
}
function initState(sounds) {
    const level = 3;
    const gameMap = (0, _createMap.createGameMap)(level);
    return {
        tLast: undefined,
        shiftModifierActive: false,
        shiftUpLastTimeStamp: -Infinity,
        player: new (0, _gameMap.Player)(gameMap.playerStartPos),
        seeAll: true,
        camera: createCamera(gameMap.playerStartPos),
        sounds: sounds,
        level: level,
        gameMap: gameMap
    };
}
function resetState(state) {
    const gameMap = (0, _createMap.createGameMap)(state.level);
    state.player = new (0, _gameMap.Player)(gameMap.playerStartPos);
    state.camera = createCamera(gameMap.playerStartPos);
    state.gameMap = gameMap;
}
function updateAndRender(now, renderer, state) {
    const t = now / 1000;
    const dt = state.tLast === undefined ? 0 : Math.min(1 / 30, t - state.tLast);
    state.tLast = t;
    if (dt > 0) updateState(state, dt);
    renderScene(renderer, state);
    requestAnimationFrame((now)=>updateAndRender(now, renderer, state));
}
function updateState(state, dt) {
    updateCamera(state, dt);
}
function updateCamera(state, dt) {
    // Update player follow
    const posError = (0, _myMatrix.vec2).create();
    (0, _myMatrix.vec2).subtract(posError, state.player.pos, state.camera.position);
    const velError = (0, _myMatrix.vec2).create();
    (0, _myMatrix.vec2).negate(velError, state.camera.velocity);
    const kSpring = 8; // spring constant, radians/sec
    const acc = (0, _myMatrix.vec2).create();
    (0, _myMatrix.vec2).scale(acc, posError, kSpring ** 2);
    (0, _myMatrix.vec2).scaleAndAdd(acc, acc, velError, 2 * kSpring);
    const velNew = (0, _myMatrix.vec2).create();
    (0, _myMatrix.vec2).scaleAndAdd(velNew, state.camera.velocity, acc, dt);
    (0, _myMatrix.vec2).scaleAndAdd(state.camera.position, state.camera.position, state.camera.velocity, 0.5 * dt);
    (0, _myMatrix.vec2).scaleAndAdd(state.camera.position, state.camera.position, velNew, 0.5 * dt);
    (0, _myMatrix.vec2).copy(state.camera.velocity, velNew);
}
function renderScene(renderer, state) {
    const screenSize = (0, _myMatrix.vec2).create();
    renderer.beginFrame(screenSize);
    const matScreenFromWorld = (0, _myMatrix.mat4).create();
    setupViewMatrix(state, screenSize, matScreenFromWorld);
    renderer.renderGlyphs.start(matScreenFromWorld, 1);
    renderWorld(state, renderer.renderGlyphs.addGlyph);
    renderPlayer(state, renderer.renderGlyphs.addGlyph);
    renderGuards(state, renderer.renderGlyphs.addGlyph);
    renderer.renderGlyphs.flush();
}
function setupViewMatrix(state, screenSize, matScreenFromWorld) {
    const cxGame = state.camera.position[0];
    const cyGame = state.camera.position[1];
    const rGame = 18;
    let rxGame, ryGame;
    if (screenSize[0] < screenSize[1]) {
        rxGame = rGame;
        ryGame = rGame * screenSize[1] / screenSize[0];
    } else {
        ryGame = rGame;
        rxGame = rGame * screenSize[0] / screenSize[1];
    }
    (0, _myMatrix.mat4).ortho(matScreenFromWorld, cxGame - rxGame, cxGame + rxGame, cyGame - ryGame, cyGame + ryGame, 1, -1);
}
function renderTextLines(renderer, screenSize, lines) {
    let maxLineLength = 0;
    for (const line of lines)maxLineLength = Math.max(maxLineLength, line.length);
    const minCharsX = 40;
    const minCharsY = 22;
    const scaleLargestX = Math.max(1, Math.floor(screenSize[0] / (8 * minCharsX)));
    const scaleLargestY = Math.max(1, Math.floor(screenSize[1] / (16 * minCharsY)));
    const scaleFactor = Math.min(scaleLargestX, scaleLargestY);
    const pixelsPerCharX = 8 * scaleFactor;
    const pixelsPerCharY = 16 * scaleFactor;
    const linesPixelSizeX = maxLineLength * pixelsPerCharX;
    const numCharsX = screenSize[0] / pixelsPerCharX;
    const numCharsY = screenSize[1] / pixelsPerCharY;
    const offsetX = Math.floor((screenSize[0] - linesPixelSizeX) / -2) / pixelsPerCharX;
    const offsetY = lines.length + 2 - numCharsY;
    const matScreenFromTextArea = (0, _myMatrix.mat4).create();
    (0, _myMatrix.mat4).ortho(matScreenFromTextArea, offsetX, offsetX + numCharsX, offsetY, offsetY + numCharsY, 1, -1);
    renderer.renderGlyphs.start(matScreenFromTextArea, 0);
    const colorText = 0xffeeeeee;
    const colorBackground = 0xe0555555;
    // Draw a stretched box to make a darkened background for the text.
    renderer.renderGlyphs.addGlyph(-1, -1, maxLineLength + 1, lines.length + 1, 219, colorBackground);
    for(let i = 0; i < lines.length; ++i){
        const row = lines.length - (1 + i);
        for(let j = 0; j < lines[i].length; ++j){
            const col = j;
            const ch = lines[i];
            if (ch === " ") continue;
            const glyphIndex = lines[i].charCodeAt(j);
            renderer.renderGlyphs.addGlyph(col, row, col + 1, row + 1, glyphIndex, colorText);
        }
    }
    renderer.renderGlyphs.flush();
}

},{"./my-matrix":"21x0k","./create-map":"gnPbX","./game-map":"3bH7G","./render":"9AS2t","./audio":"1vRTt","aa29dbe273d3c9e5":"kqDrS","69220e6d6d3be079":"b6zov","./guard":"bP2Su","./color-preset":"37fo9"}],"21x0k":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "vec2", ()=>vec2);
parcelHelpers.export(exports, "mat4", ()=>mat4);
let vec2;
(function(vec2) {
    function create() {
        return [
            0,
            0
        ];
    }
    vec2.create = create;
    function clone(v) {
        return [
            v[0],
            v[1]
        ];
    }
    vec2.clone = clone;
    function fromValues(x0, x1) {
        return [
            x0,
            x1
        ];
    }
    vec2.fromValues = fromValues;
    function copy(result, v) {
        result[0] = v[0];
        result[1] = v[1];
    }
    vec2.copy = copy;
    function set(result, x0, x1) {
        result[0] = x0;
        result[1] = x1;
    }
    vec2.set = set;
    function add(result, a, b) {
        result[0] = a[0] + b[0];
        result[1] = a[1] + b[1];
    }
    vec2.add = add;
    function subtract(result, a, b) {
        result[0] = a[0] - b[0];
        result[1] = a[1] - b[1];
    }
    vec2.subtract = subtract;
    function multiply(result, a, b) {
        result[0] = a[0] * b[0];
        result[1] = a[1] * b[1];
    }
    vec2.multiply = multiply;
    function scale(result, a, scale) {
        result[0] = a[0] * scale;
        result[1] = a[1] * scale;
    }
    vec2.scale = scale;
    function scaleAndAdd(result, a, b, scale) {
        result[0] = a[0] + b[0] * scale;
        result[1] = a[1] + b[1] * scale;
    }
    vec2.scaleAndAdd = scaleAndAdd;
    function distance(a, b) {
        const x = a[0] - b[0];
        const y = a[1] - b[1];
        return Math.hypot(x, y);
    }
    vec2.distance = distance;
    function squaredDistance(a, b) {
        const x = a[0] - b[0];
        const y = a[1] - b[1];
        return x * x + y * y;
    }
    vec2.squaredDistance = squaredDistance;
    function length(a) {
        return Math.hypot(a[0], a[1]);
    }
    vec2.length = length;
    function squaredLength(a) {
        const x = a[0];
        const y = a[1];
        return x * x + y * y;
    }
    vec2.squaredLength = squaredLength;
    function negate(result, a) {
        result[0] = -a[0];
        result[1] = -a[1];
    }
    vec2.negate = negate;
    function dot(a, b) {
        return a[0] * b[0] + a[1] * b[1];
    }
    vec2.dot = dot;
    function lerp(result, a, b, t) {
        result[0] = a[0] + t * (b[0] - a[0]);
        result[1] = a[1] + t * (b[1] - a[1]);
    }
    vec2.lerp = lerp;
    function zero(result) {
        result[0] = 0;
        result[1] = 0;
    }
    vec2.zero = zero;
})(vec2 || (vec2 = {}));
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
var _gameMap = require("./game-map");
var _guard = require("./guard");
var _myMatrix = require("./my-matrix");
const roomSizeX = 5;
const roomSizeY = 5;
const outerBorder = 3;
let RoomType;
(function(RoomType) {
    RoomType[RoomType["Exterior"] = 0] = "Exterior";
    RoomType[RoomType["PublicCourtyard"] = 1] = "PublicCourtyard";
    RoomType[RoomType["PublicRoom"] = 2] = "PublicRoom";
    RoomType[RoomType["PrivateCourtyard"] = 3] = "PrivateCourtyard";
    RoomType[RoomType["PrivateRoom"] = 4] = "PrivateRoom";
})(RoomType || (RoomType = {}));
function createGameMap(level) {
    const sizeX = randomHouseWidth(level);
    const sizeY = randomHouseDepth(level);
    const inside = makeSiheyuanRoomGrid(sizeX, sizeY);
    const mirrorX = true;
    const mirrorY = false;
    const [offsetX, offsetY] = offsetWalls(mirrorX, mirrorY, inside);
    const cells = plotWalls(inside, offsetX, offsetY);
    const map = {
        cells: cells,
        patrolRegions: [],
        patrolRoutes: [],
        items: [],
        guards: [],
        playerStartPos: (0, _myMatrix.vec2).create(),
        totalLoot: 0
    };
    const [rooms, adjacencies, posStart] = createExits(level, mirrorX, mirrorY, inside, offsetX, offsetY, map);
    (0, _myMatrix.vec2).copy(map.playerStartPos, posStart);
    placeLoot(rooms, adjacencies, map);
    placeExteriorBushes(map);
    placeFrontPillars(map);
    placeGuards(level, rooms, map);
    markExteriorAsSeen(map);
    cacheCellInfo(map);
    map.totalLoot = map.items.reduce((totalLoot, item)=>totalLoot + (item.type == (0, _gameMap.ItemType).Coin ? 1 : 0), 0);
    fixupWalls(cells);
    return map;
}
function randomHouseWidth(level) {
    let sizeX = 0;
    const c = Math.min(3, level);
    for(let i = 0; i < c; ++i)sizeX += randomInRange(2);
    return sizeX * 2 + 3;
}
function randomHouseDepth(level) {
    if (level === 0) return 2;
    else {
        let sizeY = 3;
        const c = Math.min(4, level - 1);
        for(let i = 0; i < c; ++i)sizeY += randomInRange(2);
        return sizeY;
    }
}
function makeSiheyuanRoomGrid(sizeX, sizeY) {
    const inside = new (0, _gameMap.BooleanGrid)(sizeX, sizeY, true);
    const halfX = Math.floor((sizeX + 1) / 2);
    const numCourtyardRoomsHalf = Math.floor(sizeY * halfX / 4);
    for(let i = numCourtyardRoomsHalf; i > 0; --i){
        const x = randomInRange(halfX);
        const y = randomInRange(sizeY);
        inside.set(x, y, false);
    }
    for(let y = 0; y < sizeY; ++y)for(let x = halfX; x < sizeX; ++x)inside.set(x, y, inside.get(sizeX - 1 - x, y));
    return inside;
}
function offsetWalls(mirrorX, mirrorY, inside) {
    const roomsX = inside.sizeX;
    const roomsY = inside.sizeY;
    const offsetX = new (0, _gameMap.Int32Grid)(roomsX + 1, roomsY, 0);
    const offsetY = new (0, _gameMap.Int32Grid)(roomsX, roomsY + 1, 0);
    let i = randomInRange(3) - 1;
    for(let y = 0; y < roomsY; ++y)offsetX.set(0, y, i);
    i = randomInRange(3) - 1;
    for(let y = 0; y < roomsY; ++y)offsetX.set(roomsX, y, i);
    i = randomInRange(3) - 1;
    for(let x = 0; x < roomsX; ++x)offsetY.set(x, 0, i);
    i = randomInRange(3) - 1;
    for(let x = 0; x < roomsX; ++x)offsetY.set(x, roomsY, i);
    for(let x = 1; x < roomsX; ++x)for(let y = 0; y < roomsY; ++y)offsetX.set(x, y, randomInRange(3) - 1);
    for(let x = 0; x < roomsX; ++x)for(let y = 1; y < roomsY; ++y)offsetY.set(x, y, randomInRange(3) - 1);
    for(let x = 1; x < roomsX; ++x){
        for(let y = 1; y < roomsY; ++y)if (randomInRange(2) === 0) offsetX.set(x, y, offsetX.get(x, y - 1));
        else offsetY.set(x, y, offsetY.get(x - 1, y));
    }
    if (mirrorX) {
        if ((roomsX & 1) === 0) {
            const xMid = Math.floor(roomsX / 2);
            for(let y = 0; y < roomsY; ++y)offsetX.set(xMid, y, 0);
        }
        for(let x = 0; x < Math.floor((roomsX + 1) / 2); ++x)for(let y = 0; y < roomsY; ++y)offsetX.set(roomsX - x, y, 1 - offsetX.get(x, y));
        for(let x = 0; x < Math.floor(roomsX / 2); ++x)for(let y = 0; y < roomsY + 1; ++y)offsetY.set(roomsX - 1 - x, y, offsetY.get(x, y));
    }
    if (mirrorY) {
        if ((roomsY & 1) === 0) {
            const yMid = roomsY / 2;
            for(let x = 0; x < roomsX; ++x)offsetY.set(x, yMid, 0);
        }
        for(let y = 0; y < Math.floor((roomsY + 1) / 2); ++y)for(let x = 0; x < roomsX; ++x)offsetY.set(x, roomsY - y, 1 - offsetY.get(x, y));
        for(let y = 0; y < Math.floor(roomsY / 2); ++y)for(let x = 0; x < roomsX + 1; ++x)offsetX.set(x, roomsY - 1 - y, offsetX.get(x, y));
    }
    let roomOffsetX = Number.MIN_SAFE_INTEGER;
    let roomOffsetY = Number.MIN_SAFE_INTEGER;
    for(let y = 0; y < roomsY; ++y)roomOffsetX = Math.max(roomOffsetX, -offsetX.get(0, y));
    for(let x = 0; x < roomsX; ++x)roomOffsetY = Math.max(roomOffsetY, -offsetY.get(x, 0));
    roomOffsetX += outerBorder;
    roomOffsetY += outerBorder;
    for(let x = 0; x < roomsX + 1; ++x)for(let y = 0; y < roomsY; ++y){
        const z = offsetX.get(x, y) + roomOffsetX + x * roomSizeX;
        offsetX.set(x, y, z);
    }
    for(let x = 0; x < roomsX; ++x)for(let y = 0; y < roomsY + 1; ++y)offsetY.set(x, y, offsetY.get(x, y) + roomOffsetY + y * roomSizeY);
    return [
        offsetX,
        offsetY
    ];
}
function plotWalls(inside, offsetX, offsetY) {
    const cx = inside.sizeX;
    const cy = inside.sizeY;
    let mapSizeX = 0;
    let mapSizeY = 0;
    for(let y = 0; y < cy; ++y)mapSizeX = Math.max(mapSizeX, offsetX.get(cx, y));
    for(let x = 0; x < cx; ++x)mapSizeY = Math.max(mapSizeY, offsetY.get(x, cy));
    mapSizeX += outerBorder + 1;
    mapSizeY += outerBorder + 1;
    const map = new (0, _gameMap.CellGrid)(mapSizeX, mapSizeY);
    // Super hacky: put down grass under all the rooms to plug holes, and light the interior.
    for(let rx = 0; rx < cx; ++rx)for(let ry = 0; ry < cy; ++ry){
        const x0 = offsetX.get(rx, ry);
        const x1 = offsetX.get(rx + 1, ry) + 1;
        const y0 = offsetY.get(rx, ry);
        const y1 = offsetY.get(rx, ry + 1) + 1;
        for(let x = x0; x < x1; ++x)for(let y = y0; y < y1; ++y){
            const cell = map.at(x, y);
            cell.type = (0, _gameMap.TerrainType).GroundGrass;
            cell.lit = true;
        }
    }
    // Draw walls. Really this should be done in createExits, where the
    //  walls are getting decorated with doors and windows.
    for(let rx = 0; rx < cx; ++rx)for(let ry = 0; ry < cy; ++ry){
        const isInside = inside.get(rx, ry);
        const x0 = offsetX.get(rx, ry);
        const x1 = offsetX.get(rx + 1, ry);
        const y0 = offsetY.get(rx, ry);
        const y1 = offsetY.get(rx, ry + 1);
        if (rx == 0 || isInside) plotNSWall(map, x0, y0, y1);
        if (rx == cx - 1 || isInside) plotNSWall(map, x1, y0, y1);
        if (ry == 0 || isInside) plotEWWall(map, x0, y0, x1);
        if (ry == cy - 1 || isInside) plotEWWall(map, x0, y1, x1);
    }
    return map;
}
function plotNSWall(map, x0, y0, y1) {
    for(let y = y0; y <= y1; ++y)map.at(x0, y).type = (0, _gameMap.TerrainType).Wall0000;
}
function plotEWWall(map, x0, y0, x1) {
    for(let x = x0; x <= x1; ++x)map.at(x, y0).type = (0, _gameMap.TerrainType).Wall0000;
}
function createExits(level, mirrorX, mirrorY, inside, offsetX, offsetY, map) {
    // Make a set of rooms.
    const roomsX = inside.sizeX;
    const roomsY = inside.sizeY;
    const roomIndex = new (0, _gameMap.Int32Grid)(roomsX, roomsY, 0);
    const rooms = [];
    // This room represents the area surrounding the map.
    rooms.push({
        roomType: RoomType.Exterior,
        group: 0,
        depth: 0,
        posMin: (0, _myMatrix.vec2).fromValues(0, 0),
        posMax: (0, _myMatrix.vec2).fromValues(0, 0),
        edges: []
    });
    for(let rx = 0; rx < roomsX; ++rx)for(let ry = 0; ry < roomsY; ++ry){
        let group_index = rooms.length;
        roomIndex.set(rx, ry, group_index);
        rooms.push({
            roomType: inside.get(rx, ry) ? RoomType.PublicRoom : RoomType.PublicCourtyard,
            group: group_index,
            depth: 0,
            posMin: (0, _myMatrix.vec2).fromValues(offsetX.get(rx, ry) + 1, offsetY.get(rx, ry) + 1),
            posMax: (0, _myMatrix.vec2).fromValues(offsetX.get(rx + 1, ry), offsetY.get(rx, ry + 1)),
            edges: []
        });
    }
    // Compute a list of room adjacencies.
    const adjacencies = computeAdjacencies(mirrorX, mirrorY, offsetX, offsetY, roomIndex);
    storeAdjacenciesInRooms(adjacencies, rooms);
    // Connect rooms together.
    let posStart = connectRooms(rooms, adjacencies);
    // Assign types to the rooms.
    assignRoomTypes(roomIndex, adjacencies, rooms);
    // Generate pathing information.
    generatePatrolRoutes(map, rooms, adjacencies);
    // Render doors and windows.
    renderWalls(rooms, adjacencies, map);
    // Render floors.
    renderRooms(level, rooms, map);
    return [
        rooms,
        adjacencies,
        posStart
    ];
}
function computeAdjacencies(mirrorX, mirrorY, offsetX, offsetY, roomIndex) {
    let roomsX = roomIndex.sizeX;
    let roomsY = roomIndex.sizeY;
    const adjacencies = [];
    {
        const adjacencyRows = [];
        {
            const adjacencyRow = [];
            let ry = 0;
            for(let rx = 0; rx < roomsX; ++rx){
                let x0 = offsetX.get(rx, ry);
                let x1 = offsetX.get(rx + 1, ry);
                let y = offsetY.get(rx, ry);
                let i = adjacencies.length;
                adjacencyRow.push(i);
                adjacencies.push({
                    origin: (0, _myMatrix.vec2).fromValues(x0 + 1, y),
                    dir: (0, _myMatrix.vec2).fromValues(1, 0),
                    length: x1 - (x0 + 1),
                    room_left: roomIndex.get(rx, ry),
                    room_right: 0,
                    next_matching: i,
                    door: false
                });
            }
            adjacencyRows.push(adjacencyRow);
        }
        for(let ry = 1; ry < roomsY; ++ry){
            const adjacencyRow = [];
            for(let rx = 0; rx < roomsX; ++rx){
                let x0_upper = offsetX.get(rx, ry);
                let x0_lower = offsetX.get(rx, ry - 1);
                let x1_upper = offsetX.get(rx + 1, ry);
                let x1_lower = offsetX.get(rx + 1, ry - 1);
                let x0 = Math.max(x0_lower, x0_upper);
                let x1 = Math.min(x1_lower, x1_upper);
                let y = offsetY.get(rx, ry);
                if (rx > 0 && x0_lower - x0_upper > 1) {
                    let i = adjacencies.length;
                    adjacencyRow.push(i);
                    adjacencies.push({
                        origin: (0, _myMatrix.vec2).fromValues(x0_upper + 1, y),
                        dir: (0, _myMatrix.vec2).fromValues(1, 0),
                        length: x0_lower - (x0_upper + 1),
                        room_left: roomIndex.get(rx, ry),
                        room_right: roomIndex.get(rx - 1, ry - 1),
                        next_matching: i,
                        door: false
                    });
                }
                if (x1 - x0 > 1) {
                    let i = adjacencies.length;
                    adjacencyRow.push(i);
                    adjacencies.push({
                        origin: (0, _myMatrix.vec2).fromValues(x0 + 1, y),
                        dir: (0, _myMatrix.vec2).fromValues(1, 0),
                        length: x1 - (x0 + 1),
                        room_left: roomIndex.get(rx, ry),
                        room_right: roomIndex.get(rx, ry - 1),
                        next_matching: i,
                        door: false
                    });
                }
                if (rx + 1 < roomsX && x1_upper - x1_lower > 1) {
                    let i = adjacencies.length;
                    adjacencyRow.push(i);
                    adjacencies.push({
                        origin: (0, _myMatrix.vec2).fromValues(x1_lower + 1, y),
                        dir: (0, _myMatrix.vec2).fromValues(1, 0),
                        length: x1_upper - (x1_lower + 1),
                        room_left: roomIndex.get(rx, ry),
                        room_right: roomIndex.get(rx + 1, ry - 1),
                        next_matching: i,
                        door: false
                    });
                }
            }
            adjacencyRows.push(adjacencyRow);
        }
        {
            const adjacencyRow = [];
            let ry = roomsY;
            for(let rx = 0; rx < roomsX; ++rx){
                let x0 = offsetX.get(rx, ry - 1);
                let x1 = offsetX.get(rx + 1, ry - 1);
                let y = offsetY.get(rx, ry);
                let i = adjacencies.length;
                adjacencyRow.push(i);
                adjacencies.push({
                    origin: (0, _myMatrix.vec2).fromValues(x0 + 1, y),
                    dir: (0, _myMatrix.vec2).fromValues(1, 0),
                    length: x1 - (x0 + 1),
                    room_left: 0,
                    room_right: roomIndex.get(rx, ry - 1),
                    next_matching: i,
                    door: false
                });
            }
            adjacencyRows.push(adjacencyRow);
        }
        if (mirrorX) for(let ry = 0; ry < adjacencyRows.length; ++ry){
            let row = adjacencyRows[ry];
            let i = 0;
            let j = row.length - 1;
            while(i < j){
                let adj0 = row[i];
                let adj1 = row[j];
                adjacencies[adj0].next_matching = adj1;
                adjacencies[adj1].next_matching = adj0;
                // Flip edge a1 to point the opposite direction
                {
                    let a1 = adjacencies[adj1];
                    (0, _myMatrix.vec2).scaleAndAdd(a1.origin, a1.origin, a1.dir, a1.length - 1);
                    (0, _myMatrix.vec2).negate(a1.dir, a1.dir);
                    [a1.room_left, a1.room_right] = [
                        a1.room_right,
                        a1.room_left
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
                    adjacencies[adj0].next_matching = adj1;
                    adjacencies[adj1].next_matching = adj0;
                }
                ry0 += 1;
                ry1 -= 1;
            }
        }
    }
    {
        let adjacencyRows = [];
        {
            const adjacencyRow = [];
            let rx = 0;
            for(let ry = 0; ry < roomsY; ++ry){
                let y0 = offsetY.get(rx, ry);
                let y1 = offsetY.get(rx, ry + 1);
                let x = offsetX.get(rx, ry);
                let i = adjacencies.length;
                adjacencyRow.push(i);
                adjacencies.push({
                    origin: (0, _myMatrix.vec2).fromValues(x, y0 + 1),
                    dir: (0, _myMatrix.vec2).fromValues(0, 1),
                    length: y1 - (y0 + 1),
                    room_left: 0,
                    room_right: roomIndex.get(rx, ry),
                    next_matching: i,
                    door: false
                });
            }
            adjacencyRows.push(adjacencyRow);
        }
        for(let rx = 1; rx < roomsX; ++rx){
            const adjacencyRow = [];
            for(let ry = 0; ry < roomsY; ++ry){
                let y0_left = offsetY.get(rx - 1, ry);
                let y0_right = offsetY.get(rx, ry);
                let y1_left = offsetY.get(rx - 1, ry + 1);
                let y1_right = offsetY.get(rx, ry + 1);
                let y0 = Math.max(y0_left, y0_right);
                let y1 = Math.min(y1_left, y1_right);
                let x = offsetX.get(rx, ry);
                if (ry > 0 && y0_left - y0_right > 1) {
                    let i = adjacencies.length;
                    adjacencyRow.push(i);
                    adjacencies.push({
                        origin: (0, _myMatrix.vec2).fromValues(x, y0_right + 1),
                        dir: (0, _myMatrix.vec2).fromValues(0, 1),
                        length: y0_left - (y0_right + 1),
                        room_left: roomIndex.get(rx - 1, ry - 1),
                        room_right: roomIndex.get(rx, ry),
                        next_matching: i,
                        door: false
                    });
                }
                if (y1 - y0 > 1) {
                    let i = adjacencies.length;
                    adjacencyRow.push(i);
                    adjacencies.push({
                        origin: (0, _myMatrix.vec2).fromValues(x, y0 + 1),
                        dir: (0, _myMatrix.vec2).fromValues(0, 1),
                        length: y1 - (y0 + 1),
                        room_left: roomIndex.get(rx - 1, ry),
                        room_right: roomIndex.get(rx, ry),
                        next_matching: i,
                        door: false
                    });
                }
                if (ry + 1 < roomsY && y1_right - y1_left > 1) {
                    let i = adjacencies.length;
                    adjacencyRow.push(i);
                    adjacencies.push({
                        origin: (0, _myMatrix.vec2).fromValues(x, y1_left + 1),
                        dir: (0, _myMatrix.vec2).fromValues(0, 1),
                        length: y1_right - (y1_left + 1),
                        room_left: roomIndex.get(rx - 1, ry + 1),
                        room_right: roomIndex.get(rx, ry),
                        next_matching: i,
                        door: false
                    });
                }
            }
            adjacencyRows.push(adjacencyRow);
        }
        {
            const adjacencyRow = [];
            let rx = roomsX;
            for(let ry = 0; ry < roomsY; ++ry){
                let y0 = offsetY.get(rx - 1, ry);
                let y1 = offsetY.get(rx - 1, ry + 1);
                let x = offsetX.get(rx, ry);
                let i = adjacencies.length;
                adjacencies.push({
                    origin: (0, _myMatrix.vec2).fromValues(x, y0 + 1),
                    dir: (0, _myMatrix.vec2).fromValues(0, 1),
                    length: y1 - (y0 + 1),
                    room_left: roomIndex.get(rx - 1, ry),
                    room_right: 0,
                    next_matching: i,
                    door: false
                });
                adjacencyRow.push(i);
            }
            adjacencyRows.push(adjacencyRow);
        }
        if (mirrorY) for(let ry = 0; ry < adjacencyRows.length; ++ry){
            let row = adjacencyRows[ry];
            let n = Math.floor(row.length / 2);
            for(let i = 0; i < n; ++i){
                let adj0 = row[i];
                let adj1 = row[row.length - 1 - i];
                adjacencies[adj0].next_matching = adj1;
                adjacencies[adj1].next_matching = adj0;
                {
                    // Flip edge a1 to point the opposite direction
                    let a1 = adjacencies[adj1];
                    (0, _myMatrix.vec2).scaleAndAdd(a1.origin, a1.origin, a1.dir, a1.length - 1);
                    (0, _myMatrix.vec2).negate(a1.dir, a1.dir);
                    [a1.room_left, a1.room_right] = [
                        a1.room_right,
                        a1.room_left
                    ];
                }
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
                    adjacencies[adj0].next_matching = adj1;
                    adjacencies[adj1].next_matching = adj0;
                }
                ry0 += 1;
                ry1 -= 1;
            }
        }
    }
    return adjacencies;
}
function storeAdjacenciesInRooms(adjacencies, rooms) {
    for(let i = 0; i < adjacencies.length; ++i){
        const adj = adjacencies[i];
        let i0 = adj.room_left;
        let i1 = adj.room_right;
        rooms[i0].edges.push(i);
        rooms[i1].edges.push(i);
    }
}
function connectRooms(rooms, adjacencies) {
    // Collect sets of edges that are mirrors of each other
    let edgeSets = getEdgeSets(adjacencies);
    // Connect all adjacent courtyard rooms together.
    for (const adj of adjacencies){
        let i0 = adj.room_left;
        let i1 = adj.room_right;
        if (rooms[i0].roomType != RoomType.PublicCourtyard || rooms[i1].roomType != RoomType.PublicCourtyard) continue;
        adj.door = true;
        let group0 = rooms[i0].group;
        let group1 = rooms[i1].group;
        joinGroups(rooms, group0, group1);
    }
    // Connect all the interior rooms with doors.
    for (const edgeSet of edgeSets){
        let addedDoor = false;
        {
            let adj = adjacencies[edgeSet[0]];
            let i0 = adj.room_left;
            let i1 = adj.room_right;
            if (rooms[i0].roomType != RoomType.PublicRoom || rooms[i1].roomType != RoomType.PublicRoom) continue;
            let group0 = rooms[i0].group;
            let group1 = rooms[i1].group;
            if (group0 != group1 || Math.random() < 0.4) {
                adj.door = true;
                addedDoor = true;
                joinGroups(rooms, group0, group1);
            }
        }
        if (addedDoor) for(let i = 1; i < edgeSet.length; ++i){
            let adj = adjacencies[edgeSet[i]];
            let i0 = adj.room_left;
            let i1 = adj.room_right;
            let group0 = rooms[i0].group;
            let group1 = rooms[i1].group;
            adj.door = true;
            joinGroups(rooms, group0, group1);
        }
    }
    // Create doors between the interiors and the courtyard areas.
    for (const edgeSet of edgeSets){
        let addedDoor = false;
        {
            let adj = adjacencies[edgeSet[0]];
            let i0 = adj.room_left;
            let i1 = adj.room_right;
            let room_type0 = rooms[i0].roomType;
            let room_type1 = rooms[i1].roomType;
            if (room_type0 == room_type1) continue;
            if (room_type0 == RoomType.Exterior || room_type1 == RoomType.Exterior) continue;
            let group0 = rooms[i0].group;
            let group1 = rooms[i1].group;
            if (group0 != group1 || Math.random() < 0.4) {
                adj.door = true;
                addedDoor = true;
                joinGroups(rooms, group0, group1);
            }
        }
        if (addedDoor) for(let i = 1; i < edgeSet.length; ++i){
            let adj = adjacencies[edgeSet[i]];
            let i0 = adj.room_left;
            let i1 = adj.room_right;
            let group0 = rooms[i0].group;
            let group1 = rooms[i1].group;
            adj.door = true;
            joinGroups(rooms, group0, group1);
        }
    }
    // Create the door to the surrounding exterior. It must be on the south side.
    let posStart = (0, _myMatrix.vec2).fromValues(0, 0);
    {
        let i = frontDoorAdjacencyIndex(rooms, adjacencies, edgeSets);
        // Set the player's start position based on where the door is.
        posStart[0] = adjacencies[i].origin[0] + adjacencies[i].dir[0] * Math.floor(adjacencies[i].length / 2);
        posStart[1] = outerBorder - 1;
        adjacencies[i].door = true;
        // Break symmetry if the door is off center.
        let j = adjacencies[i].next_matching;
        if (j != i) {
            adjacencies[j].next_matching = j;
            adjacencies[i].next_matching = i;
        }
    }
    return posStart;
}
function getEdgeSets(adjacencies) {
    const edgeSets = [];
    for(let i = 0; i < adjacencies.length; ++i){
        const adj = adjacencies[i];
        let j = adj.next_matching;
        if (j >= i) {
            if (j > i) edgeSets.push([
                i,
                j
            ]);
            else edgeSets.push([
                i
            ]);
        }
    }
    shuffleArray(edgeSets);
    return edgeSets;
}
function joinGroups(rooms, groupFrom, groupTo) {
    if (groupFrom != groupTo) {
        for (const room of rooms)if (room.group == groupFrom) room.group = groupTo;
    }
}
function frontDoorAdjacencyIndex(rooms, adjacencies, edgeSets) {
    for (const edgeSet of edgeSets)for (const i of edgeSet){
        let adj = adjacencies[i];
        if (adj.dir[0] == 0) continue;
        if (adj.next_matching > i) continue;
        if (adj.next_matching == i) {
            if (rooms[adj.room_right].roomType != RoomType.Exterior) continue;
        } else {
            if (rooms[adj.room_left].roomType != RoomType.Exterior) continue;
        }
        return i;
    }
    // Should always return above...
    return 0;
}
function assignRoomTypes(roomIndex, adjacencies, rooms) {
    // Assign rooms depth based on distance from the bottom row of rooms.
    let unvisited = rooms.length;
    rooms[0].depth = 0;
    for(let i = 1; i < rooms.length; ++i)rooms[i].depth = unvisited;
    const roomsToVisit = [];
    for(let x = 0; x < roomIndex.sizeX; ++x){
        let iRoom = roomIndex.get(x, 0);
        rooms[iRoom].depth = 1;
        roomsToVisit.push(iRoom);
    }
    // Visit rooms in breadth-first order, assigning them distances from the seed rooms.
    let iiRoom = 0;
    while(iiRoom < roomsToVisit.length){
        let iRoom = roomsToVisit[iiRoom];
        for (const iAdj of rooms[iRoom].edges){
            let adj = adjacencies[iAdj];
            if (!adj.door) continue;
            const iRoomNeighbor = adj.room_left == iRoom ? adj.room_right : adj.room_left;
            if (rooms[iRoomNeighbor].depth == unvisited) {
                rooms[iRoomNeighbor].depth = rooms[iRoom].depth + 1;
                roomsToVisit.push(iRoomNeighbor);
            }
        }
        iiRoom += 1;
    }
    // Assign master-suite room type to the inner rooms.
    let maxDepth = 0;
    for (const room of rooms)maxDepth = Math.max(maxDepth, room.depth);
    const targetNumMasterRooms = Math.floor(roomIndex.sizeX * roomIndex.sizeY / 4);
    let numMasterRooms = 0;
    let depth = maxDepth;
    while(depth > 0){
        for (const room of rooms){
            if (room.roomType != RoomType.PublicRoom && room.roomType != RoomType.PublicCourtyard) continue;
            if (room.depth != depth) continue;
            room.roomType = room.roomType == RoomType.PublicRoom ? RoomType.PrivateRoom : RoomType.PrivateCourtyard;
            if (room.roomType == RoomType.PrivateRoom) numMasterRooms += 1;
        }
        if (numMasterRooms >= targetNumMasterRooms) break;
        depth -= 1;
    }
    // Change any public courtyards that are adjacent to private courtyards into private courtyards
    while(true){
        let changed = false;
        for(let iRoom = 0; iRoom < rooms.length; ++iRoom){
            if (rooms[iRoom].roomType != RoomType.PublicCourtyard) continue;
            for (const iAdj of rooms[iRoom].edges){
                const adj = adjacencies[iAdj];
                let iRoomOther = adj.room_left != iRoom ? adj.room_left : adj.room_right;
                if (rooms[iRoomOther].roomType == RoomType.PrivateCourtyard) {
                    rooms[iRoom].roomType = RoomType.PrivateCourtyard;
                    changed = true;
                    break;
                }
            }
        }
        if (!changed) break;
    }
}
function generatePatrolRoutes(map, rooms, adjacencies) {
    const includeRoom = Array(rooms.length).fill(true);
    // Exclude exterior rooms.
    for(let iRoom = 0; iRoom < rooms.length; ++iRoom)if (rooms[iRoom].roomType == RoomType.Exterior) includeRoom[iRoom] = false;
    // Trim dead ends out repeatedly until no more can be trimmed.
    while(true){
        let trimmed = false;
        for(let iRoom = 0; iRoom < rooms.length; ++iRoom){
            if (!includeRoom[iRoom]) continue;
            const room = rooms[iRoom];
            let numExits = 0;
            for (const iAdj of room.edges){
                const adj = adjacencies[iAdj];
                if (!adj.door) continue;
                let iRoomOther = adj.room_left != iRoom ? adj.room_left : adj.room_right;
                if (includeRoom[iRoomOther]) numExits += 1;
            }
            if (numExits < 2) {
                includeRoom[iRoom] = false;
                trimmed = true;
            }
        }
        if (!trimmed) break;
    }
    // Generate patrol regions for included rooms.
    const roomPatrolRegion = Array(rooms.length).fill((0, _gameMap.invalidRegion));
    for(let iRoom = 0; iRoom < rooms.length; ++iRoom)if (includeRoom[iRoom]) roomPatrolRegion[iRoom] = addPatrolRegion(map, rooms[iRoom].posMin, rooms[iRoom].posMax);
    // Add connections between included rooms.
    for (const adj of adjacencies){
        if (!adj.door) continue;
        let region0 = roomPatrolRegion[adj.room_left];
        let region1 = roomPatrolRegion[adj.room_right];
        if (region0 == (0, _gameMap.invalidRegion) || region1 == (0, _gameMap.invalidRegion)) continue;
        addPatrolRoute(map, region0, region1);
    }
}
function addPatrolRegion(map, posMin, posMax) {
    let iPatrolRegion = map.patrolRegions.length;
    map.patrolRegions.push({
        posMin,
        posMax
    });
    // Plot the region into the map.
    for(let x = posMin[0]; x < posMax[0]; ++x)for(let y = posMin[1]; y < posMax[1]; ++y)map.cells.at(x, y).region = iPatrolRegion;
    return iPatrolRegion;
}
function addPatrolRoute(map, region0, region1) {
    console.assert(region0 < map.patrolRegions.length);
    console.assert(region1 < map.patrolRegions.length);
    map.patrolRoutes.push([
        region0,
        region1
    ]);
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
function renderWalls(rooms, adjacencies, map) {
    // Render grass connecting courtyard rooms.
    for (const adj of adjacencies){
        const type0 = rooms[adj.room_left].roomType;
        const type1 = rooms[adj.room_right].roomType;
        if (!isCourtyardRoomType(type0) || !isCourtyardRoomType(type1)) continue;
        for(let j = 0; j < adj.length; ++j){
            const p = (0, _myMatrix.vec2).create();
            (0, _myMatrix.vec2).scaleAndAdd(p, adj.origin, adj.dir, j);
            map.cells.at(p[0], p[1]).type = (0, _gameMap.TerrainType).GroundGrass;
        }
    }
    // Render doors and windows for the rest of the walls.
    for(let i = 0; i < adjacencies.length; ++i){
        const adj0 = adjacencies[i];
        const type0 = rooms[adj0.room_left].roomType;
        const type1 = rooms[adj0.room_right].roomType;
        if (isCourtyardRoomType(type0) && isCourtyardRoomType(type1)) continue;
        const j = adj0.next_matching;
        if (j < i) continue;
        let offset;
        if (j == i) offset = Math.floor(adj0.length / 2);
        else if (adj0.length > 2) offset = 1 + randomInRange(adj0.length - 2);
        else offset = randomInRange(adj0.length);
        let walls = [];
        walls.push(adj0);
        if (j != i) walls.push(adjacencies[j]);
        if (!adj0.door && type0 != type1) {
            if (type0 == RoomType.Exterior || type1 == RoomType.Exterior) {
                if ((adj0.length & 1) != 0) {
                    let k = Math.floor(adj0.length / 2);
                    for (const a of walls){
                        const p = (0, _myMatrix.vec2).create();
                        (0, _myMatrix.vec2).scaleAndAdd(p, a.origin, a.dir, k);
                        let dir = (0, _myMatrix.vec2).clone(a.dir);
                        if (rooms[a.room_right].roomType == RoomType.Exterior) (0, _myMatrix.vec2).negate(dir, dir);
                        map.cells.at(p[0], p[1]).type = oneWayWindowTerrainTypeFromDir(dir);
                    }
                }
            } else if (isCourtyardRoomType(type0) || isCourtyardRoomType(type1)) {
                let k = randomInRange(2);
                const k_end = Math.floor((adj0.length + 1) / 2);
                while(k < k_end){
                    for (const a of walls){
                        let dir = (0, _myMatrix.vec2).clone(a.dir);
                        if (isCourtyardRoomType(rooms[a.room_right].roomType)) (0, _myMatrix.vec2).negate(dir, dir);
                        let windowType = oneWayWindowTerrainTypeFromDir(dir);
                        const p = (0, _myMatrix.vec2).create();
                        (0, _myMatrix.vec2).scaleAndAdd(p, a.origin, a.dir, k);
                        const q = (0, _myMatrix.vec2).create();
                        (0, _myMatrix.vec2).scaleAndAdd(q, a.origin, a.dir, a.length - (k + 1));
                        map.cells.at(p[0], p[1]).type = windowType;
                        map.cells.at(q[0], q[1]).type = windowType;
                    }
                    k += 2;
                }
            }
        }
        let installMasterSuiteDoor = Math.random() < 0.3333;
        for (const a of walls){
            if (!a.door) continue;
            const p = (0, _myMatrix.vec2).create();
            (0, _myMatrix.vec2).scaleAndAdd(p, a.origin, a.dir, offset);
            let orientNS = a.dir[0] == 0;
            map.cells.at(p[0], p[1]).type = orientNS ? (0, _gameMap.TerrainType).DoorNS : (0, _gameMap.TerrainType).DoorEW;
            let roomTypeLeft = rooms[a.room_left].roomType;
            let roomTypeRight = rooms[a.room_right].roomType;
            if (roomTypeLeft == RoomType.Exterior || roomTypeRight == RoomType.Exterior) {
                map.cells.at(p[0], p[1]).type = orientNS ? (0, _gameMap.TerrainType).PortcullisNS : (0, _gameMap.TerrainType).PortcullisEW;
                placeItem(map, p[0], p[1], orientNS ? (0, _gameMap.ItemType).PortcullisNS : (0, _gameMap.ItemType).PortcullisEW);
            } else if (roomTypeLeft != RoomType.PrivateRoom || roomTypeRight != RoomType.PrivateRoom || installMasterSuiteDoor) {
                map.cells.at(p[0], p[1]).type = orientNS ? (0, _gameMap.TerrainType).DoorNS : (0, _gameMap.TerrainType).DoorEW;
                placeItem(map, p[0], p[1], orientNS ? (0, _gameMap.ItemType).DoorNS : (0, _gameMap.ItemType).DoorEW);
            }
        }
    }
}
function renderRooms(level, rooms, map) {
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
        }
        for(let x = room.posMin[0]; x < room.posMax[0]; ++x)for(let y = room.posMin[1]; y < room.posMax[1]; ++y)map.cells.at(x, y).type = cellType;
        let dx = room.posMax[0] - room.posMin[0];
        let dy = room.posMax[1] - room.posMin[1];
        if (isCourtyardRoomType(room.roomType)) {
            if (dx >= 5 && dy >= 5) {
                for(let x = room.posMin[0] + 1; x < room.posMax[0] - 1; ++x)for(let y = room.posMin[1] + 1; y < room.posMax[1] - 1; ++y)map.cells.at(x, y).type = (0, _gameMap.TerrainType).GroundWater;
            } else if (dx >= 2 && dy >= 2) {
                tryPlaceBush(map, room.posMin[0], room.posMin[1]);
                tryPlaceBush(map, room.posMax[0] - 1, room.posMin[1]);
                tryPlaceBush(map, room.posMin[0], room.posMax[1] - 1);
                tryPlaceBush(map, room.posMax[0] - 1, room.posMax[1] - 1);
            }
        } else if (room.roomType == RoomType.PublicRoom || room.roomType == RoomType.PrivateRoom) {
            if (dx >= 5 && dy >= 5) {
                if (room.roomType == RoomType.PrivateRoom) {
                    for(let x = 2; x < dx - 2; ++x)for(let y = 2; y < dy - 2; ++y)map.cells.at(room.posMin[0] + x, room.posMin[1] + y).type = (0, _gameMap.TerrainType).GroundWater;
                }
                map.cells.at(room.posMin[0] + 1, room.posMin[1] + 1).type = (0, _gameMap.TerrainType).Wall0000;
                map.cells.at(room.posMax[0] - 2, room.posMin[1] + 1).type = (0, _gameMap.TerrainType).Wall0000;
                map.cells.at(room.posMin[0] + 1, room.posMax[1] - 2).type = (0, _gameMap.TerrainType).Wall0000;
                map.cells.at(room.posMax[0] - 2, room.posMax[1] - 2).type = (0, _gameMap.TerrainType).Wall0000;
            } else if (dx == 5 && dy >= 3 && (room.roomType == RoomType.PublicRoom || Math.random() < 0.33333)) for(let y = 1; y < dy - 1; ++y){
                placeItem(map, room.posMin[0] + 1, room.posMin[1] + y, (0, _gameMap.ItemType).Chair);
                placeItem(map, room.posMin[0] + 2, room.posMin[1] + y, (0, _gameMap.ItemType).Table);
                placeItem(map, room.posMin[0] + 3, room.posMin[1] + y, (0, _gameMap.ItemType).Chair);
            }
            else if (dy == 5 && dx >= 3 && (room.roomType == RoomType.PublicRoom || Math.random() < 0.33333)) for(let x = 1; x < dx - 1; ++x){
                placeItem(map, room.posMin[0] + x, room.posMin[1] + 1, (0, _gameMap.ItemType).Chair);
                placeItem(map, room.posMin[0] + x, room.posMin[1] + 2, (0, _gameMap.ItemType).Table);
                placeItem(map, room.posMin[0] + x, room.posMin[1] + 3, (0, _gameMap.ItemType).Chair);
            }
            else if (dx > dy && (dy & 1) == 1 && Math.random() < 0.66667) {
                let y = Math.floor(room.posMin[1] + dy / 2);
                if (room.roomType == RoomType.PublicRoom) {
                    tryPlaceTable(map, room.posMin[0] + 1, y);
                    tryPlaceTable(map, room.posMax[0] - 2, y);
                } else {
                    tryPlaceChair(map, room.posMin[0] + 1, y);
                    tryPlaceChair(map, room.posMax[0] - 2, y);
                }
            } else if (dy > dx && (dx & 1) == 1 && Math.random() < 0.66667) {
                let x = Math.floor(room.posMin[0] + dx / 2);
                if (room.roomType == RoomType.PublicRoom) {
                    tryPlaceTable(map, x, room.posMin[1] + 1);
                    tryPlaceTable(map, x, room.posMax[1] - 2);
                } else {
                    tryPlaceChair(map, x, room.posMin[1] + 1);
                    tryPlaceChair(map, x, room.posMax[1] - 2);
                }
            } else if (dx > 3 && dy > 3) {
                if (room.roomType == RoomType.PublicRoom) {
                    tryPlaceTable(map, room.posMin[0], room.posMin[1]);
                    tryPlaceTable(map, room.posMax[0] - 1, room.posMin[1]);
                    tryPlaceTable(map, room.posMin[0], room.posMax[1] - 1);
                    tryPlaceTable(map, room.posMax[0] - 1, room.posMax[1] - 1);
                } else {
                    tryPlaceChair(map, room.posMin[0], room.posMin[1]);
                    tryPlaceChair(map, room.posMax[0] - 1, room.posMin[1]);
                    tryPlaceChair(map, room.posMin[0], room.posMax[1] - 1);
                    tryPlaceChair(map, room.posMax[0] - 1, room.posMax[1] - 1);
                }
            }
        }
    }
}
function tryPlaceBush(map, x, y) {
    if (map.cells.at(x, y).type != (0, _gameMap.TerrainType).GroundGrass) return;
    if (doorAdjacent(map.cells, x, y)) return;
    placeItem(map, x, y, (0, _gameMap.ItemType).Bush);
}
function tryPlaceTable(map, x, y) {
    if (doorAdjacent(map.cells, x, y)) return;
    placeItem(map, x, y, (0, _gameMap.ItemType).Table);
}
function tryPlaceChair(map, x, y) {
    if (doorAdjacent(map.cells, x, y)) return;
    placeItem(map, x, y, (0, _gameMap.ItemType).Chair);
}
function doorAdjacent(map, x, y) {
    if (map.at(x - 1, y).type >= (0, _gameMap.TerrainType).PortcullisNS) return true;
    if (map.at(x + 1, y).type >= (0, _gameMap.TerrainType).PortcullisNS) return true;
    if (map.at(x, y - 1).type >= (0, _gameMap.TerrainType).PortcullisNS) return true;
    if (map.at(x, y + 1).type >= (0, _gameMap.TerrainType).PortcullisNS) return true;
    return false;
}
function placeItem(map, x, y, type) {
    map.items.push({
        pos: (0, _myMatrix.vec2).fromValues(x, y),
        type: type
    });
}
function placeLoot(rooms, adjacencies, map) {
    // Count number of internal rooms.
    let numRooms = 0;
    for (const room of rooms)if (room.roomType == RoomType.PublicRoom || room.roomType == RoomType.PrivateRoom) numRooms += 1;
    // Master-suite rooms get loot.
    for (const room of rooms){
        if (room.roomType != RoomType.PrivateRoom) continue;
        if (Math.random() < 0.2) continue;
        tryPlaceLoot(room.posMin, room.posMax, map);
    }
    // Dead-end rooms automatically get loot.
    for (const room of rooms){
        if (room.roomType != RoomType.PublicRoom && room.roomType != RoomType.PrivateRoom) continue;
        let numExits = 0;
        for (const iAdj of room.edges)if (adjacencies[iAdj].door) numExits += 1;
        if (numExits < 2) tryPlaceLoot(room.posMin, room.posMax, map);
    }
    // Place a bit of extra loot.
    let posMin = (0, _myMatrix.vec2).fromValues(0, 0);
    let posMax = (0, _myMatrix.vec2).fromValues(map.cells.sizeX, map.cells.sizeY);
    for(let i = Math.floor(numRooms / 4 + randomInRange(4)); i > 0; --i)tryPlaceLoot(posMin, posMax, map);
}
function tryPlaceLoot(posMin, posMax, map) {
    let dx = posMax[0] - posMin[0];
    let dy = posMax[1] - posMin[1];
    for(let i = 1000; i > 0; --i){
        let pos = (0, _myMatrix.vec2).fromValues(posMin[0] + randomInRange(dx), posMin[1] + randomInRange(dy));
        let cellType = map.cells.at(pos[0], pos[1]).type;
        if (cellType != (0, _gameMap.TerrainType).GroundWood && cellType != (0, _gameMap.TerrainType).GroundMarble) continue;
        if (isItemAtPos(map, pos[0], pos[1])) continue;
        placeItem(map, pos[0], pos[1], (0, _gameMap.ItemType).Coin);
        break;
    }
}
function placeExteriorBushes(map) {
    let sx = map.cells.sizeX;
    let sy = map.cells.sizeY;
    for(let x = 0; x < sx; ++x){
        for(let y = sy - outerBorder + 1; y < sy; ++y){
            if (map.cells.at(x, y).type != (0, _gameMap.TerrainType).GroundNormal) continue;
            let cell = map.cells.at(x, y);
            cell.type = (0, _gameMap.TerrainType).GroundGrass;
            cell.seen = true;
        }
        if ((x & 1) == 0 && Math.random() < 0.8) placeItem(map, x, sy - 1, (0, _gameMap.ItemType).Bush);
    }
    for(let y = outerBorder; y < sy - outerBorder + 1; ++y){
        for(let x = 0; x < outerBorder - 1; ++x){
            if (map.cells.at(x, y).type != (0, _gameMap.TerrainType).GroundNormal) continue;
            let cell = map.cells.at(x, y);
            cell.type = (0, _gameMap.TerrainType).GroundGrass;
            cell.seen = true;
        }
        for(let x = sx - outerBorder + 1; x < sx; ++x){
            if (map.cells.at(x, y).type != (0, _gameMap.TerrainType).GroundNormal) continue;
            let cell = map.cells.at(x, y);
            cell.type = (0, _gameMap.TerrainType).GroundGrass;
            cell.seen = true;
        }
        if ((sy - y & 1) != 0) {
            if (Math.random() < 0.8) placeItem(map, 0, y, (0, _gameMap.ItemType).Bush);
            if (Math.random() < 0.8) placeItem(map, sx - 1, y, (0, _gameMap.ItemType).Bush);
        }
    }
}
function placeFrontPillars(map) {
    let sx = map.cells.sizeX - 1;
    let cx = Math.floor(map.cells.sizeX / 2);
    for(let x = outerBorder; x < cx; x += 5){
        map.cells.at(x, 1).type = (0, _gameMap.TerrainType).Wall0000;
        map.cells.at(sx - x, 1).type = (0, _gameMap.TerrainType).Wall0000;
        map.cells.at(x, 1).lit = true;
        map.cells.at(sx - x, 1).lit = true;
    }
}
function isItemAtPos(map, x, y) {
    for (const item of map.items){
        if (item.pos[0] == x && item.pos[1] == y) return true;
    }
    /*
    for guard in &map.guards {
        if guard.pos.0 == x && guard.pos.1 == y {
            return true;
        }
    }
    */ return false;
}
function isCourtyardRoomType(roomType) {
    switch(roomType){
        case RoomType.Exterior:
            return false;
        case RoomType.PublicCourtyard:
            return true;
        case RoomType.PublicRoom:
            return false;
        case RoomType.PrivateCourtyard:
            return true;
        case RoomType.PrivateRoom:
            return false;
    }
}
function placeGuards(level, rooms, map) {
    if (level <= 0) return;
    // Count number of internal rooms.
    let numRooms = 0;
    for (const room of rooms)if (room.roomType != RoomType.Exterior) numRooms += 1;
    // Generate guards
    let numGuards = level == 1 ? 1 : Math.max(2, Math.floor(numRooms * Math.min(level + 18, 40) / 100));
    while(numGuards > 0){
        const pos = generateInitialGuardPos(map);
        if (pos === undefined) break;
        map.guards.push(new (0, _guard.Guard)(pos, map));
        numGuards -= 1;
    }
}
function generateInitialGuardPos(map) {
    let sizeX = map.cells.sizeX;
    let sizeY = map.cells.sizeY;
    for(let i = 0; i < 1000; ++i){
        let pos = (0, _myMatrix.vec2).fromValues(randomInRange(sizeX), randomInRange(sizeY));
        if ((0, _myMatrix.vec2).squaredDistance(map.playerStartPos, pos) < 64) continue;
        let cellType = map.cells.at(pos[0], pos[1]).type;
        if (cellType != (0, _gameMap.TerrainType).GroundWood && cellType != (0, _gameMap.TerrainType).GroundMarble) continue;
        if (isItemAtPos(map, pos[0], pos[1])) continue;
        return pos;
    }
    return undefined;
}
function markExteriorAsSeen(map) {
    let sx = map.cells.sizeX;
    let sy = map.cells.sizeY;
    for(let x = 0; x < sx; ++x){
        for(let y = 0; y < sy; ++y)if (map.cells.at(x, y).type == (0, _gameMap.TerrainType).GroundNormal || x > 0 && map.cells.at(x - 1, y).type == (0, _gameMap.TerrainType).GroundNormal || x > 0 && y > 0 && map.cells.at(x - 1, y - 1).type == (0, _gameMap.TerrainType).GroundNormal || x > 0 && y + 1 < sy && map.cells.at(x - 1, y + 1).type == (0, _gameMap.TerrainType).GroundNormal || y > 0 && map.cells.at(x, y - 1).type == (0, _gameMap.TerrainType).GroundNormal || y + 1 < sy && map.cells.at(x, y + 1).type == (0, _gameMap.TerrainType).GroundNormal || x + 1 < sx && map.cells.at(x + 1, y).type == (0, _gameMap.TerrainType).GroundNormal || x + 1 < sx && y > 0 && map.cells.at(x + 1, y - 1).type == (0, _gameMap.TerrainType).GroundNormal || x + 1 < sx && y + 1 < sy && map.cells.at(x + 1, y + 1).type == (0, _gameMap.TerrainType).GroundNormal) map.cells.at(x, y).seen = true;
    }
}
function cacheCellInfo(map) {
    let sx = map.cells.sizeX;
    let sy = map.cells.sizeY;
    for(let x = 0; x < sx; ++x)for(let y = 0; y < sy; ++y){
        const cell = map.cells.at(x, y);
        const cellType = cell.type;
        const isWall = cellType >= (0, _gameMap.TerrainType).Wall0000 && cellType <= (0, _gameMap.TerrainType).Wall1111;
        const isWindow = cellType >= (0, _gameMap.TerrainType).OneWayWindowE && cellType <= (0, _gameMap.TerrainType).OneWayWindowS;
        const isWater = cellType == (0, _gameMap.TerrainType).GroundWater;
        cell.moveCost = isWall || isWindow ? Infinity : isWater ? 4096 : 0;
        cell.blocksPlayerMove = isWall;
        cell.blocksPlayerSight = isWall;
        cell.blocksSight = isWall || isWindow;
        cell.blocksSound = isWall;
        cell.hidesPlayer = false;
    }
    for (const item of map.items){
        let cell = map.cells.at(item.pos[0], item.pos[1]);
        let itemType = item.type;
        cell.moveCost = Math.max(cell.moveCost, (0, _gameMap.guardMoveCostForItemType)(itemType));
        if (itemType == (0, _gameMap.ItemType).DoorNS || itemType == (0, _gameMap.ItemType).DoorEW) cell.blocksPlayerSight = true;
        if (itemType == (0, _gameMap.ItemType).DoorNS || itemType == (0, _gameMap.ItemType).DoorEW || itemType == (0, _gameMap.ItemType).PortcullisNS || itemType == (0, _gameMap.ItemType).PortcullisEW || itemType == (0, _gameMap.ItemType).Bush) cell.blocksSight = true;
        if (itemType == (0, _gameMap.ItemType).Table || itemType == (0, _gameMap.ItemType).Bush) cell.hidesPlayer = true;
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
    return terrainType >= (0, _gameMap.TerrainType).Wall0000;
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

},{"./game-map":"3bH7G","./guard":"bP2Su","./my-matrix":"21x0k","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"3bH7G":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "BooleanGrid", ()=>BooleanGrid);
parcelHelpers.export(exports, "CellGrid", ()=>CellGrid);
parcelHelpers.export(exports, "Int32Grid", ()=>Int32Grid);
parcelHelpers.export(exports, "ItemType", ()=>ItemType);
parcelHelpers.export(exports, "Player", ()=>Player);
parcelHelpers.export(exports, "TerrainType", ()=>TerrainType);
parcelHelpers.export(exports, "guardMoveCostForItemType", ()=>guardMoveCostForItemType);
parcelHelpers.export(exports, "invalidRegion", ()=>invalidRegion);
var _guard = require("./guard");
var _myMatrix = require("./my-matrix");
const invalidRegion = -1;
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
let TerrainType;
(function(TerrainType) {
    TerrainType[TerrainType["GroundNormal"] = 0] = "GroundNormal";
    TerrainType[TerrainType["GroundGrass"] = 1] = "GroundGrass";
    TerrainType[TerrainType["GroundWater"] = 2] = "GroundWater";
    TerrainType[TerrainType["GroundMarble"] = 3] = "GroundMarble";
    TerrainType[TerrainType["GroundWood"] = 4] = "GroundWood";
    TerrainType[TerrainType["GroundWoodCreaky"] = 5] = "GroundWoodCreaky";
    TerrainType[TerrainType[//  NSEW
    "Wall0000"] = 6] = "Wall0000";
    TerrainType[TerrainType["Wall0001"] = 7] = "Wall0001";
    TerrainType[TerrainType["Wall0010"] = 8] = "Wall0010";
    TerrainType[TerrainType["Wall0011"] = 9] = "Wall0011";
    TerrainType[TerrainType["Wall0100"] = 10] = "Wall0100";
    TerrainType[TerrainType["Wall0101"] = 11] = "Wall0101";
    TerrainType[TerrainType["Wall0110"] = 12] = "Wall0110";
    TerrainType[TerrainType["Wall0111"] = 13] = "Wall0111";
    TerrainType[TerrainType["Wall1000"] = 14] = "Wall1000";
    TerrainType[TerrainType["Wall1001"] = 15] = "Wall1001";
    TerrainType[TerrainType["Wall1010"] = 16] = "Wall1010";
    TerrainType[TerrainType["Wall1011"] = 17] = "Wall1011";
    TerrainType[TerrainType["Wall1100"] = 18] = "Wall1100";
    TerrainType[TerrainType["Wall1101"] = 19] = "Wall1101";
    TerrainType[TerrainType["Wall1110"] = 20] = "Wall1110";
    TerrainType[TerrainType["Wall1111"] = 21] = "Wall1111";
    TerrainType[TerrainType["OneWayWindowE"] = 22] = "OneWayWindowE";
    TerrainType[TerrainType["OneWayWindowW"] = 23] = "OneWayWindowW";
    TerrainType[TerrainType["OneWayWindowN"] = 24] = "OneWayWindowN";
    TerrainType[TerrainType["OneWayWindowS"] = 25] = "OneWayWindowS";
    TerrainType[TerrainType["PortcullisNS"] = 26] = "PortcullisNS";
    TerrainType[TerrainType["PortcullisEW"] = 27] = "PortcullisEW";
    TerrainType[TerrainType["DoorNS"] = 28] = "DoorNS";
    TerrainType[TerrainType["DoorEW"] = 29] = "DoorEW";
})(TerrainType || (TerrainType = {}));
class CellGrid {
    constructor(sizeX, sizeY){
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        const size = sizeX * sizeY;
        this.values = new Array(size);
        for(let i = 0; i < size; ++i)this.values[i] = {
            type: TerrainType.GroundNormal,
            moveCost: Infinity,
            region: invalidRegion,
            blocksPlayerMove: false,
            blocksPlayerSight: false,
            blocksSight: false,
            blocksSound: false,
            hidesPlayer: false,
            lit: false,
            seen: false
        };
    }
    at(x, y) {
        const i = this.sizeX * y + x;
        console.assert(i >= 0);
        console.assert(i < this.values.length);
        return this.values[i];
    }
}
let ItemType;
(function(ItemType) {
    ItemType[ItemType["Chair"] = 0] = "Chair";
    ItemType[ItemType["Table"] = 1] = "Table";
    ItemType[ItemType["Bush"] = 2] = "Bush";
    ItemType[ItemType["Coin"] = 3] = "Coin";
    ItemType[ItemType["DoorNS"] = 4] = "DoorNS";
    ItemType[ItemType["DoorEW"] = 5] = "DoorEW";
    ItemType[ItemType["PortcullisNS"] = 6] = "PortcullisNS";
    ItemType[ItemType["PortcullisEW"] = 7] = "PortcullisEW";
})(ItemType || (ItemType = {}));
function guardMoveCostForItemType(itemType) {
    switch(itemType){
        case ItemType.Chair:
            return 4;
        case ItemType.Table:
            return 10;
        case ItemType.Bush:
            return 10;
        case ItemType.Coin:
            return 0;
        case ItemType.DoorNS:
            return 0;
        case ItemType.DoorEW:
            return 0;
        case ItemType.PortcullisNS:
            return 0;
        case ItemType.PortcullisEW:
            return 0;
    }
}
const maxPlayerHealth = 5;
class Player {
    constructor(pos){
        this.pos = (0, _myMatrix.vec2).clone(pos);
        this.dir = (0, _myMatrix.vec2).fromValues(0, -1);
        this.health = maxPlayerHealth;
        this.gold = 0;
        this.noisy = false;
        this.damagedLastTurn = false;
        this.turnsRemainingUnderwater = 0;
    }
    applyDamage(d) {
        this.health -= Math.min(d, this.health);
        this.damagedLastTurn = true;
    }
    hidden(map) {
        if (map.guards.find((guard)=>guard.mode == (0, _guard.GuardMode).ChaseVisibleTarget) !== undefined) return false;
        if (map.cells.at(this.pos[0], this.pos[1]).hidesPlayer) return true;
        let cellType = map.cells.at(this.pos[0], this.pos[1]).type;
        if (cellType == TerrainType.GroundWater && this.turnsRemainingUnderwater > 0) return true;
        return false;
    }
}

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3","./guard":"bP2Su","./my-matrix":"21x0k"}],"bP2Su":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "Guard", ()=>Guard);
parcelHelpers.export(exports, "GuardMode", ()=>GuardMode);
var _gameMap = require("./game-map");
var _myMatrix = require("./my-matrix");
let GuardMode;
(function(GuardMode) {
    GuardMode[GuardMode["Patrol"] = 0] = "Patrol";
    GuardMode[GuardMode["Look"] = 1] = "Look";
    GuardMode[GuardMode["Listen"] = 2] = "Listen";
    GuardMode[GuardMode["ChaseVisibleTarget"] = 3] = "ChaseVisibleTarget";
    GuardMode[GuardMode["MoveToLastSighting"] = 4] = "MoveToLastSighting";
    GuardMode[GuardMode["MoveToLastSound"] = 5] = "MoveToLastSound";
    GuardMode[GuardMode["MoveToGuardShout"] = 6] = "MoveToGuardShout";
})(GuardMode || (GuardMode = {}));
class Guard {
    constructor(pos, map){
        this.pos = (0, _myMatrix.vec2).clone(pos);
        this.dir = (0, _myMatrix.vec2).fromValues(1, 0);
        this.mode = GuardMode.Patrol;
        this.speaking = false;
        this.hasMoved = false;
        this.heardThief = false;
        this.hearingGuard = false;
        this.heardGuard = false;
        this.heardGuardPos = pos;
        this.goal = pos;
        this.modeTimeout = 0;
        this.regionGoal = (0, _gameMap.invalidRegion);
        this.regionPrev = (0, _gameMap.invalidRegion);
        this.setupGoalRegion(map);
    }
    setupGoalRegion(map) {
        let regionCur = map.cells.at(this.pos[0], this.pos[1]).region;
        if (this.regionGoal != (0, _gameMap.invalidRegion) && regionCur == this.regionPrev) return;
    /*
        if (regionCur == invalidRegion) {
            this.regionGoal = map.closestRegion(this.pos);
        } else {
            this.regionGoal = map.randomNeighborRegion(regionCur, this.regionPrev);
            this.regionPrev = regionCur;
        }
        */ }
}

},{"./game-map":"3bH7G","./my-matrix":"21x0k","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"9AS2t":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "createRenderer", ()=>createRenderer);
var _myMatrix = require("./my-matrix");
function createRenderer(gl, images) {
    const textures = images.map((image)=>createTextureFromImage(gl, image));
    const renderer = {
        beginFrame: createBeginFrame(gl),
        renderGlyphs: createGlyphRenderer(gl, textures)
    };
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    gl.clearColor(0, 0, 0, 1);
    return renderer;
}
function createBeginFrame(gl) {
    return (screenSize)=>{
        const canvas = gl.canvas;
        resizeCanvasToDisplaySize(canvas);
        const screenX = canvas.clientWidth;
        const screenY = canvas.clientHeight;
        gl.viewport(0, 0, screenX, screenY);
        gl.clear(gl.COLOR_BUFFER_BIT);
        (0, _myMatrix.vec2).set(screenSize, screenX, screenY);
    };
}
function createGlyphRenderer(gl, textures) {
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
    function start(matScreenFromWorld, textureIndex) {
        (0, _myMatrix.mat4).copy(matScreenFromWorldCached, matScreenFromWorld);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, textures[textureIndex]);
    }
    function addGlyph(x0, y0, x1, y1, glyphIndex, color) {
        if (numQuads >= maxQuads) flushQuads();
        const i = numQuads * wordsPerQuad;
        const srcBase = glyphIndex << 16;
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
    }
    function flushQuads() {
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
    }
    return {
        start: start,
        addGlyph: addGlyph,
        flush: flushQuads
    };
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
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
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
function resizeCanvasToDisplaySize(canvas) {
    const parentElement = canvas.parentNode;
    const rect = parentElement.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
}

},{"./my-matrix":"21x0k","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"1vRTt":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "setupSounds", ()=>setupSounds);
var _howler = require("howler");
var footstepWood = require("ad47e8b5ed76fe4a");
var footstepTile = require("2f755f5070ea53c0");
var footstepWater = require("6cb1691bb15e0568");
var footstepGravel = require("1fd22dd1e154b1da");
var footstepGrass = require("776d101e0a3be845");
function setupSounds(sounds) {
    sounds.footstepWood = new (0, _howler.Howl)({
        src: [
            footstepWood
        ]
    });
    sounds.footstepTile = new (0, _howler.Howl)({
        src: [
            footstepTile
        ]
    });
    sounds.footstepWater = new (0, _howler.Howl)({
        src: [
            footstepWater
        ]
    });
    sounds.footstepGravel = new (0, _howler.Howl)({
        src: [
            footstepGravel
        ]
    });
    sounds.footstepGrass = new (0, _howler.Howl)({
        src: [
            footstepGrass
        ]
    });
}

},{"howler":"5Vjgk","ad47e8b5ed76fe4a":"50X7U","2f755f5070ea53c0":"13pme","6cb1691bb15e0568":"gzFm0","1fd22dd1e154b1da":"fWdtN","776d101e0a3be845":"2VkLN","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"5Vjgk":[function(require,module,exports) {
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

},{}],"50X7U":[function(require,module,exports) {
module.exports = require("fa63aeccc5fc3408").getBundleURL("lf1OY") + "footstep-wood.f9be433b.ogg" + "?" + Date.now();

},{"fa63aeccc5fc3408":"lgJ39"}],"lgJ39":[function(require,module,exports) {
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

},{}],"13pme":[function(require,module,exports) {
module.exports = require("78b475c288145e37").getBundleURL("lf1OY") + "footstep-tile.7138e49d.ogg" + "?" + Date.now();

},{"78b475c288145e37":"lgJ39"}],"gzFm0":[function(require,module,exports) {
module.exports = require("aa5ef8c78b6d3229").getBundleURL("lf1OY") + "footstep-water.d5def44e.ogg" + "?" + Date.now();

},{"aa5ef8c78b6d3229":"lgJ39"}],"fWdtN":[function(require,module,exports) {
module.exports = require("fec33f0e6a31b6c5").getBundleURL("lf1OY") + "footstep-gravel.3fee9591.ogg" + "?" + Date.now();

},{"fec33f0e6a31b6c5":"lgJ39"}],"2VkLN":[function(require,module,exports) {
module.exports = require("cebc8972b1a3f2a1").getBundleURL("lf1OY") + "footstep-grass.065fbb6c.ogg" + "?" + Date.now();

},{"cebc8972b1a3f2a1":"lgJ39"}],"kqDrS":[function(require,module,exports) {
module.exports = require("1625ddc13ad7e489").getBundleURL("lf1OY") + "font.6c02c9e3.png" + "?" + Date.now();

},{"1625ddc13ad7e489":"lgJ39"}],"b6zov":[function(require,module,exports) {
module.exports = require("129a3193568f465a").getBundleURL("lf1OY") + "tiles.c8147b8a.png" + "?" + Date.now();

},{"129a3193568f465a":"lgJ39"}],"37fo9":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "black", ()=>black);
parcelHelpers.export(exports, "darkBlue", ()=>darkBlue);
parcelHelpers.export(exports, "darkGreen", ()=>darkGreen);
parcelHelpers.export(exports, "darkCyan", ()=>darkCyan);
parcelHelpers.export(exports, "darkRed", ()=>darkRed);
parcelHelpers.export(exports, "darkMagenta", ()=>darkMagenta);
parcelHelpers.export(exports, "darkBrown", ()=>darkBrown);
parcelHelpers.export(exports, "lightGray", ()=>lightGray);
parcelHelpers.export(exports, "darkGray", ()=>darkGray);
parcelHelpers.export(exports, "lightBlue", ()=>lightBlue);
parcelHelpers.export(exports, "lightGreen", ()=>lightGreen);
parcelHelpers.export(exports, "lightCyan", ()=>lightCyan);
parcelHelpers.export(exports, "lightRed", ()=>lightRed);
parcelHelpers.export(exports, "lightMagenta", ()=>lightMagenta);
parcelHelpers.export(exports, "lightYellow", ()=>lightYellow);
parcelHelpers.export(exports, "white", ()=>white);
const black = 0xff000000;
const darkBlue = 0xffa80000;
const darkGreen = 0xff00a800;
const darkCyan = 0xffa8a800;
const darkRed = 0xff0000a8;
const darkMagenta = 0xffa800a8;
const darkBrown = 0xff0054a8;
const lightGray = 0xffa8a8a8;
const darkGray = 0xff545454;
const lightBlue = 0xfffe5454;
const lightGreen = 0xff54fe54;
const lightCyan = 0xfffefe54;
const lightRed = 0xff5454fe;
const lightMagenta = 0xfffe54fe;
const lightYellow = 0xff54fefe;
const white = 0xfffefefe;

},{"@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}]},["kH4kW","edeGs"], "edeGs", "parcelRequire550f")

//# sourceMappingURL=index.a998808b.js.map
