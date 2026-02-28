(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const CFG = Object.freeze({
  seed: 1337,
  RMAX: 18,
  N_MIN: 6,
  // cave grid resolution (simulation) - independent from mesh
  GRID: 360,
  PAD: 1.2,
  TARGET_FINAL_AIR: 0.5,
  // noise shaping
  WARP_F: 0.055,
  WARP_A: 2,
  BASE_F: 0.13,
  VEIN_F: 0.17,
  // CA smoothing
  CA_STEPS: 3,
  AIR_KEEP_N8: 3,
  ROCK_TO_AIR_N8: 6,
  // barriers
  VEIN_THRESH: 0.79,
  VEIN_MID_MIN: 0.35,
  VEIN_DILATE: 1,
  // entrances
  ENTRANCES: 4,
  ENTRANCE_OUTER: 0.7,
  ENTRANCE_INNER: 0.55,
  ENTRANCE_ANGLE_JITTER: 0.35,
  // render
  ROCK_DARK: [95 / 255, 58 / 255, 32 / 255],
  ROCK_LIGHT: [138 / 255, 86 / 255, 49 / 255],
  AIR_DARK: [43 / 255, 43 / 255, 43 / 255],
  AIR_LIGHT: [74 / 255, 74 / 255, 74 / 255],
  EDGE_DARK: [20 / 255, 20 / 255, 20 / 255]
});
const GAME = Object.freeze({
  ZOOM: 8,
  // ~12% of the world visible
  SHIP_SCALE: 0.5,
  MINER_SCALE: 0.5,
  ENEMY_SCALE: 1,
  THRUST: 4.5,
  TURN_RATE: 2.4,
  DRAG: 0.12,
  GRAVITY: 2,
  CRASH_SPEED: 4.5,
  LAND_SPEED: 2,
  SURFACE_DOT: 0.7,
  LAND_PULL: 1.2,
  LAND_FRICTION: 0.6,
  BOUNCE_RESTITUTION: 0.35,
  COLLIDE_PUSH_FAST: 0.08,
  /** @type {boolean} */
  DEBUG_COLLISION: false,
  /** @type {boolean} */
  DEBUG_NODES: true,
  MINERS_PER_LEVEL: 10,
  MINER_CALL_RADIUS: 4,
  MINER_RUN_SPEED: 1.6,
  MINER_BOARD_RADIUS: 0.12,
  MINER_MIN_SEP: 1.4,
  MINER_STAND_OFFSET: 0.12,
  MINER_POPUP_LIFE: 0.9,
  MINER_POPUP_SPEED: 0.6,
  MINER_POPUP_TANGENTIAL: 0.18,
  EXIT_MARGIN: 1,
  MAX_TANGENTIAL_SPEED: 4
});
const TOUCH_UI = Object.freeze({
  left: { x: 0.13, y: 0.72, r: 0.13 },
  laser: { x: 0.87, y: 0.72, r: 0.12 },
  bomb: { x: 0.87, y: 0.3, r: 0.11 },
  dead: 0.04,
  aimRadius: 0.09
});
function mulberry32(seed) {
  let t = seed >>> 0;
  return function() {
    t += 1831565813;
    let x = Math.imul(t ^ t >>> 15, 1 | t);
    x ^= x + Math.imul(x ^ x >>> 7, 61 | x);
    return ((x ^ x >>> 14) >>> 0) / 4294967296;
  };
}
const grad2 = [
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
  [1, 0],
  [-1, 0],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [0, 1],
  [0, -1]
];
function buildPerm(seed) {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  const r = mulberry32(seed);
  for (let i = 255; i > 0; i--) {
    const j = r() * (i + 1) | 0;
    const tmp = p[i];
    p[i] = p[j];
    p[j] = tmp;
  }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  return perm;
}
const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;
class Noise {
  /**
   * Simplex noise generator.
   * @param {number} seed Seed for permutation table.
   */
  constructor(seed) {
    this._perm = buildPerm(seed);
  }
  /**
   * @param {number} s
   * @returns {void}
   */
  setSeed(s) {
    this._perm = buildPerm(s);
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {number}
   */
  simplex2(x, y) {
    const s = (x + y) * F2;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const t = (i + j) * G2;
    const X0 = i - t, Y0 = j - t;
    const x0 = x - X0, y0 = y - Y0;
    let i1, j1;
    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    } else {
      i1 = 0;
      j1 = 1;
    }
    const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
    const ii = i & 255, jj = j & 255;
    let n0 = 0, n1 = 0, n2 = 0;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 > 0) {
      const gi0 = this._perm[ii + this._perm[jj]] % 12;
      const g = grad2[gi0];
      t0 *= t0;
      n0 = t0 * t0 * (g[0] * x0 + g[1] * y0);
    }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 > 0) {
      const gi1 = this._perm[ii + i1 + this._perm[jj + j1]] % 12;
      const g = grad2[gi1];
      t1 *= t1;
      n1 = t1 * t1 * (g[0] * x1 + g[1] * y1);
    }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 > 0) {
      const gi2 = this._perm[ii + 1 + this._perm[jj + 1]] % 12;
      const g = grad2[gi2];
      t2 *= t2;
      n2 = t2 * t2 * (g[0] * x2 + g[1] * y2);
    }
    return 70 * (n0 + n1 + n2);
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} [oct]
   * @param {number} [pers]
   * @param {number} [lac]
   * @returns {number}
   */
  fbm(x, y, oct = 4, pers = 0.55, lac = 2) {
    let amp = 1, freq = 1, total = 0, norm = 0;
    for (let o = 0; o < oct; o++) {
      total += amp * this.simplex2(x * freq, y * freq);
      norm += amp;
      amp *= pers;
      freq *= lac;
    }
    return norm ? total / norm : 0;
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} [oct]
   * @param {number} [pers]
   * @param {number} [lac]
   * @returns {number}
   */
  ridged(x, y, oct = 4, pers = 0.55, lac = 2) {
    let amp = 1, freq = 1, total = 0, norm = 0;
    for (let o = 0; o < oct; o++) {
      const n = this.simplex2(x * freq, y * freq);
      let r = 1 - Math.abs(n);
      r *= r;
      total += amp * r;
      norm += amp;
      amp *= pers;
      freq *= lac;
    }
    return norm ? total / norm : 0;
  }
}
class MapGen {
  /**
   * Create a map generator for the given config.
   * @param {typeof import("./config.js").CFG} cfg Mapgen constants.
   */
  constructor(cfg) {
    this.cfg = cfg;
    const G = cfg.GRID;
    const worldMin = -(cfg.RMAX + cfg.PAD);
    const worldMax = +(cfg.RMAX + cfg.PAD);
    const worldSize = worldMax - worldMin;
    const cell = worldSize / G;
    const R2 = cfg.RMAX * cfg.RMAX;
    const inside = new Uint8Array(G * G);
    const idx = (i, j) => j * G + i;
    const toWorld = (i, j) => [worldMin + (i + 0.5) * cell, worldMin + (j + 0.5) * cell];
    const toGrid = (x, y) => [Math.floor((x - worldMin) / cell), Math.floor((y - worldMin) / cell)];
    for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
      const [x, y] = toWorld(i, j);
      inside[idx(i, j)] = x * x + y * y <= R2 ? 1 : 0;
    }
    this.grid = { G, cell, worldMin, worldMax, worldSize, R2, inside, idx, toWorld, toGrid };
    this._dirs4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    this._dirs8 = [];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) this._dirs8.push([dx, dy]);
    this.noise = new Noise(cfg.seed);
    this._wx = new Float32Array(G * G);
    this._wy = new Float32Array(G * G);
    this._caveNoise = new Float32Array(G * G);
    this._veinNoise = new Float32Array(G * G);
    this._current = { seed: cfg.seed, air: new Uint8Array(G * G), entrances: [], finalAir: 0 };
  }
  /**
   * @param {Uint8Array} field
   * @param {number} i
   * @param {number} j
   * @param {number[][]} dirs
   * @returns {number}
   */
  _countN(field, i, j, dirs) {
    const { G, idx, inside } = this.grid;
    let c = 0;
    for (const [dx, dy] of dirs) {
      const x = i + dx, y = j + dy;
      if (x < 0 || x >= G || y < 0 || y >= G) continue;
      const k = idx(x, y);
      if (inside[k] && field[k]) c++;
    }
    return c;
  }
  /**
   * @param {Uint8Array<ArrayBuffer>} field
   * @param {number} iters
   * @returns {Uint8Array<ArrayBuffer>}
   */
  _dilate(field, iters) {
    const { G, idx, inside } = this.grid;
    let out = new Uint8Array(field);
    for (let it = 0; it < iters; it++) {
      const next = new Uint8Array(out);
      for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
        const k = idx(i, j);
        if (!inside[k] || out[k]) continue;
        for (const [dx, dy] of this._dirs4) {
          const x = i + dx, y = j + dy;
          if (x < 0 || x >= G || y < 0 || y >= G) continue;
          const kk = idx(x, y);
          if (inside[kk] && out[kk]) {
            next[k] = 1;
            break;
          }
        }
      }
      out = next;
    }
    return out;
  }
  /**
   * @param {Uint8Array} field
   * @param {number} cx
   * @param {number} cy
   * @param {number} radius
   * @param {0|1} [val]
   * @returns {void}
   */
  _carveDisk(field, cx, cy, radius, val = 1) {
    const { G, idx, inside, toGrid, toWorld } = this.grid;
    const r2 = radius * radius;
    const [ix0, iy0] = toGrid(cx - radius, cy - radius);
    const [ix1, iy1] = toGrid(cx + radius, cy + radius);
    const x0 = Math.max(0, ix0), y0 = Math.max(0, iy0);
    const x1 = Math.min(G - 1, ix1), y1 = Math.min(G - 1, iy1);
    for (let j = y0; j <= y1; j++) for (let i = x0; i <= x1; i++) {
      const k = idx(i, j);
      if (!inside[k]) continue;
      const [x, y] = toWorld(i, j);
      const dx = x - cx, dy = y - cy;
      if (dx * dx + dy * dy <= r2) field[k] = val;
    }
  }
  /**
   * @param {Uint8Array} field
   * @param {Vec2[]} seeds
   * @returns {Uint8Array}
   */
  _floodFromSeeds(field, seeds) {
    const { G, idx, inside } = this.grid;
    const vis = new Uint8Array(G * G);
    const qx = new Int32Array(G * G);
    const qy = new Int32Array(G * G);
    let qh = 0, qt = 0;
    for (const [sx, sy] of seeds) {
      if (sx < 0 || sx >= G || sy < 0 || sy >= G) continue;
      const k = idx(sx, sy);
      if (!inside[k] || !field[k] || vis[k]) continue;
      vis[k] = 1;
      qx[qt] = sx;
      qy[qt] = sy;
      qt++;
    }
    while (qh < qt) {
      const x = qx[qh], y = qy[qh];
      qh++;
      for (const [dx, dy] of this._dirs4) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || xx >= G || yy < 0 || yy >= G) continue;
        const kk = idx(xx, yy);
        if (!inside[kk] || !field[kk] || vis[kk]) continue;
        vis[kk] = 1;
        qx[qt] = xx;
        qy[qt] = yy;
        qt++;
      }
    }
    return vis;
  }
  /**
   * @param {Uint8Array} field
   * @returns {number}
   */
  _fractionAir(field) {
    const { G, inside } = this.grid;
    let ins = 0, a = 0;
    for (let k = 0; k < G * G; k++) {
      if (!inside[k]) continue;
      ins++;
      if (field[k]) a++;
    }
    return a / ins;
  }
  /**
   * @param {number} targetInitialAir
   * @param {() => number} rand
   * @returns {{air:Uint8Array<ArrayBufferLike>,entrances:Vec2[]}}
   */
  _buildWorld(targetInitialAir, rand) {
    const { G, idx, inside, toWorld, toGrid } = this.grid;
    const cfg = this.cfg;
    const entrances = [];
    for (let e = 0; e < cfg.ENTRANCES; e++) {
      const th = e / cfg.ENTRANCES * 2 * Math.PI + (rand() - 0.5) * cfg.ENTRANCE_ANGLE_JITTER;
      entrances.push([(cfg.RMAX - 0.05) * Math.cos(th), (cfg.RMAX - 0.05) * Math.sin(th)]);
    }
    let lo = 0, hi = 1;
    let air = new Uint8Array(G * G);
    for (let iter = 0; iter < 20; iter++) {
      const mid = (lo + hi) * 0.5;
      let ins = 0, a = 0;
      for (let k = 0; k < G * G; k++) {
        if (!inside[k]) {
          air[k] = 0;
          continue;
        }
        ins++;
        const v = this._caveNoise[k] > mid ? 1 : 0;
        air[k] = v;
        a += v;
      }
      const frac = a / ins;
      if (frac > targetInitialAir) lo = mid;
      else hi = mid;
    }
    for (let s = 0; s < cfg.CA_STEPS; s++) {
      const next = new Uint8Array(air);
      for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
        const k = idx(i, j);
        if (!inside[k]) continue;
        const n8 = this._countN(air, i, j, this._dirs8);
        if (air[k]) next[k] = n8 >= cfg.AIR_KEEP_N8 ? 1 : 0;
        else next[k] = n8 >= cfg.ROCK_TO_AIR_N8 ? 1 : 0;
      }
      air = next;
    }
    let veins = new Uint8Array(G * G);
    for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
      const k = idx(i, j);
      if (!inside[k]) continue;
      const [x, y] = toWorld(i, j);
      const r = Math.hypot(x, y) / cfg.RMAX;
      let mid = 1 - Math.abs(r - 0.6) / 0.6;
      mid = Math.max(0, Math.min(1, mid));
      if (this._veinNoise[k] > cfg.VEIN_THRESH && mid > cfg.VEIN_MID_MIN) veins[k] = 1;
    }
    veins = this._dilate(veins, cfg.VEIN_DILATE);
    for (let k = 0; k < G * G; k++) {
      if (veins[k]) air[k] = 0;
    }
    for (const [ex, ey] of entrances) {
      this._carveDisk(air, ex, ey, cfg.ENTRANCE_OUTER, 1);
      this._carveDisk(air, ex * 0.97, ey * 0.97, cfg.ENTRANCE_INNER, 1);
    }
    const seeds = [];
    for (const [ex, ey] of entrances) {
      const [ix, iy] = toGrid(ex * 0.97, ey * 0.97);
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) seeds.push([ix + dx, iy + dy]);
    }
    const vis = this._floodFromSeeds(air, seeds);
    for (let k = 0; k < G * G; k++) {
      if (air[k] && !vis[k]) air[k] = 0;
    }
    return { air, entrances };
  }
  /**
   * @param {number} seed
   * @returns {MapWorld}
   */
  regenWorld(seed) {
    const { G, idx, inside, toWorld } = this.grid;
    const cfg = this.cfg;
    const rand = mulberry32(seed);
    this.noise.setSeed(seed);
    this._wx = new Float32Array(G * G);
    this._wy = new Float32Array(G * G);
    for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
      const k = idx(i, j);
      if (!inside[k]) continue;
      const [x, y] = toWorld(i, j);
      this._wx[k] = this.noise.fbm(x * cfg.WARP_F, y * cfg.WARP_F, 3, 0.6, 2);
      this._wy[k] = this.noise.fbm((x + 19.3) * cfg.WARP_F, (y - 11.7) * cfg.WARP_F, 3, 0.6, 2);
    }
    this._caveNoise = new Float32Array(G * G);
    this._veinNoise = new Float32Array(G * G);
    for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
      const k = idx(i, j);
      if (!inside[k]) continue;
      const [x, y] = toWorld(i, j);
      const xw = x + cfg.WARP_A * this._wx[k];
      const yw = y + cfg.WARP_A * this._wy[k];
      const chambers = 0.5 + 0.5 * this.noise.fbm(xw * cfg.BASE_F * 0.8, yw * cfg.BASE_F * 0.8, 4, 0.55, 2);
      const corridors = this.noise.ridged(xw * cfg.BASE_F * 1.35, yw * cfg.BASE_F * 1.35, 4, 0.55, 2.05);
      this._caveNoise[k] = 0.45 * chambers + 0.55 * corridors;
      this._veinNoise[k] = this.noise.ridged(xw * cfg.VEIN_F, yw * cfg.VEIN_F, 3, 0.6, 2.2);
    }
    let best = 0.6;
    let bestDiff = 1e9;
    let bestWorld = null;
    for (const g of [0.58, 0.6, 0.62, 0.64, 0.66, 0.68, 0.7]) {
      const w = this._buildWorld(g, rand);
      const frac = this._fractionAir(w.air);
      const d = Math.abs(frac - cfg.TARGET_FINAL_AIR);
      if (d < bestDiff) {
        bestDiff = d;
        best = g;
        bestWorld = w;
      }
    }
    for (const delta of [-0.04, -0.03, -0.02, -0.01, 0, 0.01, 0.02, 0.03, 0.04]) {
      const g = best + delta;
      if (g <= 0 || g >= 1) continue;
      const w = this._buildWorld(g, rand);
      const frac = this._fractionAir(w.air);
      const d = Math.abs(frac - cfg.TARGET_FINAL_AIR);
      if (d < bestDiff) {
        bestDiff = d;
        best = g;
        bestWorld = w;
      }
    }
    const finalAir = bestWorld ? this._fractionAir(bestWorld.air) : 0;
    this._current = { seed, air: bestWorld ? bestWorld.air : new Uint8Array(G * G), entrances: bestWorld ? bestWorld.entrances : [], finalAir };
    return this._current;
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {0|1}
   */
  airBinaryAtWorld(x, y) {
    const { G, idx, inside, toGrid } = this.grid;
    const [i, j] = toGrid(x, y);
    if (i < 0 || i >= G || j < 0 || j >= G) return 1;
    const k = idx(i, j);
    if (!inside[k]) return 1;
    return this._current.air[k] ? 1 : 0;
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {0|1} [val]
   * @returns {boolean}
   */
  setAirAtWorld(x, y, val = 1) {
    const { G, idx, inside, toGrid } = this.grid;
    const [i, j] = toGrid(x, y);
    if (i < 0 || i >= G || j < 0 || j >= G) return false;
    const k = idx(i, j);
    if (!inside[k]) return false;
    this._current.air[k] = val ? 1 : 0;
    return true;
  }
  /**
   * @returns {MapWorld}
   */
  getWorld() {
    return this._current;
  }
}
class RingMesh {
  /**
   * Build mesh geometry and sampling helpers from a map source.
   * @param {typeof import("./config.js").CFG} cfg Mesh config constants.
   * @param {import("./mapgen.js").MapGen} map Map generator.
   */
  constructor(cfg, map) {
    this._cfg = cfg;
    this._map = map;
    this._OUTER_PAD = 1;
    this._R_MESH = cfg.RMAX + this._OUTER_PAD;
    function ringCount(r) {
      if (r <= 0) return 1;
      return Math.max(cfg.N_MIN, Math.floor(2 * Math.PI * r));
    }
    function ringVertices(r) {
      if (r === 0) return [{ x: 0, y: 0, air: 1 }];
      const n = ringCount(r);
      const phase = 0.5 / n * 2 * Math.PI;
      const out = [];
      for (let k = 0; k < n; k++) {
        const a = 2 * Math.PI * k / n + phase;
        out.push({ x: r * Math.cos(a), y: r * Math.sin(a), air: 1 });
      }
      return out;
    }
    function stitchBand(inner, outer) {
      const tris = [];
      const n0 = inner.length, n1 = outer.length;
      const I = inner.concat([inner[0]]);
      const O = outer.concat([outer[0]]);
      let i = 0, j = 0;
      while (i < n0 || j < n1) {
        if (i >= n0) {
          tris.push([I[i], O[j], O[j + 1]]);
          j++;
          continue;
        }
        if (j >= n1) {
          tris.push([I[i], O[j], I[i + 1]]);
          i++;
          continue;
        }
        if ((i + 1) / n0 < (j + 1) / n1) {
          tris.push([I[i], O[j], I[i + 1]]);
          i++;
        } else {
          tris.push([I[i], O[j], O[j + 1]]);
          j++;
        }
      }
      return tris;
    }
    function shadeAt(x, y) {
      const n = map.noise.fbm(x * 0.16, y * 0.16, 2, 0.6, 2);
      return Math.max(0, Math.min(1, 0.5 + 0.5 * n));
    }
    const positions = [];
    const airFlag = [];
    const shade = [];
    const vertRefs = [];
    const rings = [];
    const bandTris = [];
    for (let r = 0; r <= cfg.RMAX; r++) rings.push(ringVertices(r));
    rings.push(ringVertices(cfg.RMAX + this._OUTER_PAD));
    for (const ring of rings) {
      for (const v of ring) {
        v.air = this._sampleAirAtWorldExtended(v.x, v.y);
      }
    }
    for (let r = 0; r < this._R_MESH; r++) {
      const inner = rings[r];
      const outer = rings[r + 1];
      if (r === 0) {
        for (let k = 0; k < outer.length; k++) {
          const a = { x: 0, y: 0, air: 1 };
          const b = outer[k];
          const c = outer[(k + 1) % outer.length];
          for (const v of [a, b, c]) {
            positions.push(v.x, v.y);
            airFlag.push(v.air);
            vertRefs.push(v);
            shade.push(shadeAt(v.x, v.y));
          }
        }
      } else {
        const tris = stitchBand(inner, outer);
        bandTris[r] = tris;
        for (const tri of tris) {
          for (const v of tri) {
            positions.push(v.x, v.y);
            airFlag.push(v.air);
            vertRefs.push(v);
            shade.push(shadeAt(v.x, v.y));
          }
        }
      }
    }
    this.vertCount = positions.length / 2;
    this.positions = new Float32Array(positions);
    this.airFlag = new Float32Array(airFlag);
    this.shade = new Float32Array(shade);
    this.rings = rings;
    this.bandTris = bandTris;
    this._vertRefs = vertRefs;
  }
  /**
   * @param {number} px
   * @param {number} py
   * @param {number} ax
   * @param {number} ay
   * @param {number} bx
   * @param {number} by
   * @param {number} cx
   * @param {number} cy
   * @returns {boolean}
   */
  _pointInTri(px, py, ax, ay, bx, by, cx, cy) {
    const v0x = cx - ax, v0y = cy - ay;
    const v1x = bx - ax, v1y = by - ay;
    const v2x = px - ax, v2y = py - ay;
    const dot00 = v0x * v0x + v0y * v0y;
    const dot01 = v0x * v1x + v0y * v1y;
    const dot02 = v0x * v2x + v0y * v2y;
    const dot11 = v1x * v1x + v1y * v1y;
    const dot12 = v1x * v2x + v1y * v2y;
    const invDen = 1 / (dot00 * dot11 - dot01 * dot01 || 1);
    const u = (dot11 * dot02 - dot01 * dot12) * invDen;
    const v = (dot00 * dot12 - dot01 * dot02) * invDen;
    return u >= -1e-6 && v >= -1e-6 && u + v <= 1 + 1e-6;
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {number}
   */
  _sampleAirAtWorldExtended(x, y) {
    const r = Math.hypot(x, y);
    if (r > this._cfg.RMAX) return 1;
    return this._map.airBinaryAtWorld(x, y);
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {Array<{x:number,y:number,air:number}>|null}
   */
  findTriAtWorld(x, y) {
    const r = Math.hypot(x, y);
    if (r <= 0) return null;
    const r0 = Math.floor(Math.min(this._R_MESH - 1, Math.max(0, r)));
    const bands = [r0, r0 - 1, r0 + 1];
    for (const bi of bands) {
      if (bi < 0 || bi >= this._R_MESH) continue;
      const tris = this.bandTris[bi];
      if (!tris) continue;
      for (const tri of tris) {
        const a = tri[0], b = tri[1], c = tri[2];
        if (this._pointInTri(x, y, a.x, a.y, b.x, b.y, c.x, c.y)) return tri;
      }
    }
    return null;
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {{x:number,y:number,air:number}|null}
   */
  nearestNodeOnRing(x, y) {
    const r = Math.hypot(x, y);
    const ri = Math.max(0, Math.min(this._cfg.RMAX, Math.round(r)));
    const ring = this.rings[ri];
    if (!ring || ring.length === 0) return null;
    let best = ring[0];
    let bestD = 1e9;
    for (const v of ring) {
      const dx = v.x - x;
      const dy = v.y - y;
      const d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        best = v;
      }
    }
    return best;
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {number}
   */
  airValueAtWorld(x, y) {
    const r = Math.hypot(x, y);
    if (r > this._cfg.RMAX + this._OUTER_PAD) return 1;
    const r0 = Math.floor(Math.min(this._R_MESH - 1, Math.max(0, r)));
    if (r0 <= 0) {
      return this.rings[0][0].air;
    }
    const tri = this.findTriAtWorld(x, y);
    if (!tri) return this.nearestNodeOnRing(x, y).air;
    const a = tri[0], b = tri[1], c = tri[2];
    const det = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
    if (Math.abs(det) < 1e-6) return this.nearestNodeOnRing(x, y).air;
    const l1 = ((b.y - c.y) * (x - c.x) + (c.x - b.x) * (y - c.y)) / det;
    const l2 = ((c.y - a.y) * (x - c.x) + (a.x - c.x) * (y - c.y)) / det;
    const l3 = 1 - l1 - l2;
    const a0 = a.air;
    const a1 = b.air;
    const a2 = c.air;
    return a0 * l1 + a1 * l2 + a2 * l3;
  }
  /**
   * @param {boolean} [resampleFromMap=true]
   * @returns {Float32Array}
   */
  updateAirFlags(resampleFromMap = true) {
    if (resampleFromMap) {
      for (const ring of this.rings) {
        for (const v of ring) {
          v.air = this._sampleAirAtWorldExtended(v.x, v.y);
        }
      }
    }
    for (let i = 0; i < this.vertCount; i++) {
      this.airFlag[i] = this._vertRefs[i].air;
    }
    return new Float32Array(this.airFlag);
  }
}
function compile(gl, type, src) {
  const sh = gl.createShader(type);
  if (!sh) throw new Error("Shader allocation failed");
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(log || "Shader compile failed");
  }
  return sh;
}
function uploadAttrib(gl, loc, data, size, type = gl.FLOAT) {
  const buf = gl.createBuffer();
  if (!buf) throw new Error("Failed to create buffer");
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, size, type, false, 0, 0);
  return buf;
}
function rot2(x, y, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [c * x - s * y, s * x + c * y];
}
function pushTri(pos, col, ax, ay, bx, by, cx, cy, r, g, b, a) {
  pos.push(ax, ay, bx, by, cx, cy);
  for (let i = 0; i < 3; i++) col.push(r, g, b, a);
}
function pushLine(pos, col, ax, ay, bx, by, r, g, b, a) {
  pos.push(ax, ay, bx, by);
  col.push(r, g, b, a, r, g, b, a);
}
function pushDiamondOutline(pos, col, x, y, size, r, g, b, a) {
  const up = size;
  const right = size;
  const top = [x, y + up];
  const rightP = [x + right, y];
  const bot = [x, y - up];
  const left = [x - right, y];
  pushLine(pos, col, top[0], top[1], rightP[0], rightP[1], r, g, b, a);
  pushLine(pos, col, rightP[0], rightP[1], bot[0], bot[1], r, g, b, a);
  pushLine(pos, col, bot[0], bot[1], left[0], left[1], r, g, b, a);
  pushLine(pos, col, left[0], left[1], top[0], top[1], r, g, b, a);
}
function pushSquareOutline(pos, col, x, y, size, r, g, b, a) {
  const s = size;
  const x0 = x - s, x1 = x + s;
  const y0 = y - s, y1 = y + s;
  pushLine(pos, col, x0, y0, x1, y0, r, g, b, a);
  pushLine(pos, col, x1, y0, x1, y1, r, g, b, a);
  pushLine(pos, col, x1, y1, x0, y1, r, g, b, a);
  pushLine(pos, col, x0, y1, x0, y0, r, g, b, a);
}
function pushDiamond(pos, col, x, y, size, r, g, b, a) {
  const up = size;
  const right = size;
  pushTri(pos, col, x, y + up, x + right, y, x, y - up, r, g, b, a);
  pushTri(pos, col, x, y - up, x - right, y, x, y + up, r, g, b, a);
}
function pushSquare(pos, col, x, y, size, r, g, b, a) {
  const s = size;
  const x0 = x - s, x1 = x + s;
  const y0 = y - s, y1 = y + s;
  pushTri(pos, col, x0, y0, x1, y0, x1, y1, r, g, b, a);
  pushTri(pos, col, x0, y0, x1, y1, x0, y1, r, g, b, a);
}
function pushCircle(pos, col, x, y, radius, r, g, b, a, seg = 24) {
  const aStart = 0;
  const x0 = x + Math.cos(aStart) * radius;
  const y0 = y + Math.sin(aStart) * radius;
  let px = x0;
  let py = y0;
  for (let i = 1; i <= seg; i++) {
    const ang = i / seg * Math.PI * 2;
    const nx = x + Math.cos(ang) * radius;
    const ny = y + Math.sin(ang) * radius;
    pushLine(pos, col, px, py, nx, ny, r, g, b, a);
    px = nx;
    py = ny;
  }
  return seg * 2;
}
function pushMiner(pos, col, x, y, r, g, b, scale) {
  const len = Math.hypot(x, y) || 1;
  const upx = x / len;
  const upy = y / len;
  const tx = -upy;
  const ty = upx;
  const s = scale ?? 1;
  const halfW = 0.06 * s;
  const halfH = 0.18 * s;
  const b0x = x + tx * halfW;
  const b0y = y + ty * halfW;
  const b1x = x - tx * halfW;
  const b1y = y - ty * halfW;
  const t0x = b0x + upx * (2 * halfH);
  const t0y = b0y + upy * (2 * halfH);
  const t1x = b1x + upx * (2 * halfH);
  const t1y = b1y + upy * (2 * halfH);
  pushTri(pos, col, t0x, t0y, t1x, t1y, b0x, b0y, r, g, b, 1);
  pushTri(pos, col, t1x, t1y, b1x, b1y, b0x, b0y, r, g, b, 1);
}
function pushEnemy(pos, col, x, y, r, g, b, scale) {
  const len = Math.hypot(x, y) || 1;
  const upx = x / len;
  const upy = y / len;
  const tx = -upy;
  const ty = upx;
  const s = (scale ?? 1) * 1.5;
  const base = 0.18 * s;
  const height = 0.26 * s;
  const lx = x - tx * base;
  const ly = y - ty * base;
  const rx = x + tx * base;
  const ry = y + ty * base;
  const hx = x + upx * height;
  const hy = y + upy * height;
  pushTri(pos, col, lx, ly, rx, ry, hx, hy, r, g, b, 1);
}
function drawFrameImpl(renderer2, state, mesh2) {
  const { gl, canvas: canvas2, cfg, game, prog, oprog, vao, oVao, uScale, uCam, uRot, ouScale, ouCam, ouRot, oPos, oCol } = renderer2;
  const vertCount = renderer2.vertCount;
  renderer2.resize();
  gl.viewport(0, 0, canvas2.width, canvas2.height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  const camRot = Math.atan2(state.ship.x, state.ship.y || 1e-6);
  gl.useProgram(prog);
  gl.bindVertexArray(vao);
  const s = game.ZOOM / (cfg.RMAX + cfg.PAD);
  const aspect = canvas2.width / canvas2.height;
  const sx = s / aspect;
  const sy = s;
  gl.uniform2f(uScale, sx, sy);
  gl.uniform2f(uCam, state.ship.x, state.ship.y);
  gl.uniform1f(uRot, camRot);
  gl.drawArrays(gl.TRIANGLES, 0, vertCount);
  gl.bindVertexArray(null);
  const shipHWorld = 0.7 * game.SHIP_SCALE;
  const shipWWorld = 0.5 * game.SHIP_SCALE;
  const nose = shipHWorld * 0.6;
  const tail = shipHWorld * 0.4;
  const pos = [];
  const col = [];
  let triVerts = 0;
  let lineVerts = 0;
  let pointVerts = 0;
  const local = [
    [0, nose],
    [shipWWorld * 0.6, -tail],
    [0, -tail * 0.6],
    [-shipWWorld * 0.6, -tail]
  ];
  const body = [];
  const shipRot = -camRot;
  if (state.ship.state !== "crashed") {
    for (const [lx, ly] of local) {
      const [wx, wy] = rot2(lx, ly, shipRot);
      body.push([state.ship.x + wx, state.ship.y + wy]);
    }
    pushTri(pos, col, body[0][0], body[0][1], body[1][0], body[1][1], body[2][0], body[2][1], 0.06, 0.08, 0.12, 1);
    pushTri(pos, col, body[0][0], body[0][1], body[2][0], body[2][1], body[3][0], body[3][1], 0.06, 0.08, 0.12, 1);
    triVerts += 6;
  }
  if (state.miners && state.miners.length) {
    for (const miner of state.miners) {
      if (miner.state === "boarded") continue;
      if (miner.state === "running") {
        pushMiner(pos, col, miner.x, miner.y, 0.98, 0.62, 0.2, game.MINER_SCALE);
      } else {
        pushMiner(pos, col, miner.x, miner.y, 0.98, 0.85, 0.25, game.MINER_SCALE);
      }
      triVerts += 6;
    }
  }
  if (state.enemies && state.enemies.length) {
    for (const enemy of state.enemies) {
      if (enemy.type === "hunter") {
        pushEnemy(pos, col, enemy.x, enemy.y, 0.92, 0.25, 0.2, game.ENEMY_SCALE);
      } else if (enemy.type === "ranger") {
        pushEnemy(pos, col, enemy.x, enemy.y, 0.2, 0.75, 0.95, game.ENEMY_SCALE);
      } else {
        pushEnemy(pos, col, enemy.x, enemy.y, 0.95, 0.55, 0.2, game.ENEMY_SCALE);
      }
      triVerts += 3;
    }
  }
  if (state.shots && state.shots.length) {
    const size = 0.1;
    for (const s2 of state.shots) {
      if (s2.owner === "hunter") pushDiamond(pos, col, s2.x, s2.y, size, 1, 0.35, 0.3, 0.9);
      else pushDiamond(pos, col, s2.x, s2.y, size, 0.3, 0.8, 1, 0.9);
      triVerts += 6;
    }
  }
  if (state.playerShots && state.playerShots.length) {
    const size = 0.11;
    for (const s2 of state.playerShots) {
      pushDiamond(pos, col, s2.x, s2.y, size, 0.95, 0.95, 0.95, 0.95);
      triVerts += 6;
    }
  }
  if (state.playerBombs && state.playerBombs.length) {
    const size = 0.13;
    for (const b of state.playerBombs) {
      pushSquare(pos, col, b.x, b.y, size, 1, 0.7, 0.2, 0.95);
      triVerts += 6;
    }
  }
  if (state.ship.state !== "crashed") {
    pushLine(pos, col, body[0][0], body[0][1], body[1][0], body[1][1], 0.9, 0.9, 0.9, 1);
    pushLine(pos, col, body[1][0], body[1][1], body[2][0], body[2][1], 0.9, 0.9, 0.9, 1);
    pushLine(pos, col, body[2][0], body[2][1], body[3][0], body[3][1], 0.9, 0.9, 0.9, 1);
    pushLine(pos, col, body[3][0], body[3][1], body[0][0], body[0][1], 0.9, 0.9, 0.9, 1);
    lineVerts += 8;
  }
  const thrustV = (dx, dy, r, g, b, extraOffset = 0) => {
    const mag = Math.hypot(dx, dy) || 1;
    const ux = -dx / mag;
    const uy = -dy / mag;
    const len = shipHWorld * 0.28;
    const spread = shipHWorld * 0.12;
    const px = -uy;
    const py = ux;
    const offset2 = shipHWorld * 0.55 + extraOffset;
    const tipx = ux * len;
    const tipy = uy * len;
    const b1x = -ux * len * 0.45 + px * spread;
    const b1y = -uy * len * 0.45 + py * spread;
    const b2x = -ux * len * 0.45 - px * spread;
    const b2y = -uy * len * 0.45 - py * spread;
    const [tx, ty] = rot2(tipx + ux * offset2, tipy + uy * offset2, shipRot);
    const [p1x, p1y] = rot2(b1x + ux * offset2, b1y + uy * offset2, shipRot);
    const [p2x, p2y] = rot2(b2x + ux * offset2, b2y + uy * offset2, shipRot);
    pushLine(pos, col, state.ship.x + p1x, state.ship.y + p1y, state.ship.x + tx, state.ship.y + ty, r, g, b, 1);
    pushLine(pos, col, state.ship.x + p2x, state.ship.y + p2y, state.ship.x + tx, state.ship.y + ty, r, g, b, 1);
    lineVerts += 4;
  };
  if (state.ship.state !== "crashed") {
    const tc = [1, 0.55, 0.15];
    if (state.input.thrust) thrustV(0, 1, tc[0], tc[1], tc[2]);
    if (state.input.down) thrustV(0, -1, tc[0], tc[1], tc[2], shipHWorld * 0.08);
    if (state.input.left) thrustV(-1, 0, tc[0], tc[1], tc[2]);
    if (state.input.right) thrustV(1, 0, tc[0], tc[1], tc[2]);
  }
  if (state.ship.state !== "crashed") {
    const vscale = 0.35;
    pushLine(pos, col, state.ship.x, state.ship.y, state.ship.x + state.ship.vx * vscale, state.ship.y + state.ship.vy * vscale, 0.5, 0.84, 1, 1);
    lineVerts += 2;
  }
  if (state.aimWorld) {
    pushLine(pos, col, state.ship.x, state.ship.y, state.aimWorld.x, state.aimWorld.y, 0.85, 0.9, 1, 0.65);
    lineVerts += 2;
  }
  if (state.ship.state === "crashed") {
    const t = state.ship.explodeT;
    const radius = shipHWorld * (0.6 + t * 1.6);
    const alpha = Math.max(0, 1 - t);
    const seg = 28;
    for (let i = 0; i < seg; i++) {
      const a0 = i / seg * Math.PI * 2;
      const a1 = (i + 1) / seg * Math.PI * 2;
      const r0 = radius * (0.85 + 0.2 * Math.sin(t * 8 + i));
      const r1 = radius * (0.85 + 0.2 * Math.sin(t * 8 + i + 1));
      const x0 = state.ship.x + Math.cos(a0) * r0;
      const y0 = state.ship.y + Math.sin(a0) * r0;
      const x1 = state.ship.x + Math.cos(a1) * r1;
      const y1 = state.ship.y + Math.sin(a1) * r1;
      pushLine(pos, col, x0, y0, x1, y1, 1, 0.72, 0.3, 0.9 * alpha);
      lineVerts += 2;
    }
    pushLine(pos, col, state.ship.x - radius * 0.7, state.ship.y, state.ship.x + radius * 0.7, state.ship.y, 1, 0.85, 0.4, 0.6 * alpha);
    pushLine(pos, col, state.ship.x, state.ship.y - radius * 0.7, state.ship.x, state.ship.y + radius * 0.7, 1, 0.85, 0.4, 0.6 * alpha);
    lineVerts += 4;
  }
  if (state.debris.length) {
    for (const d of state.debris) {
      const len = shipHWorld * 0.18;
      const hx = Math.cos(d.a) * len;
      const hy = Math.sin(d.a) * len;
      pushLine(pos, col, d.x - hx, d.y - hy, d.x + hx, d.y + hy, 0.9, 0.9, 0.9, 0.9);
      lineVerts += 2;
    }
  }
  if (state.enemyDebris && state.enemyDebris.length) {
    for (const d of state.enemyDebris) {
      const len = 0.098 * game.ENEMY_SCALE;
      const hx = Math.cos(d.a) * len;
      const hy = Math.sin(d.a) * len;
      pushLine(pos, col, d.x - hx, d.y - hy, d.x + hx, d.y + hy, 1, 0.5, 0.2, 0.9);
      lineVerts += 2;
    }
  }
  if (state.explosions && state.explosions.length) {
    for (const ex of state.explosions) {
      const t = Math.max(0, Math.min(1, ex.life / 0.5));
      const r = 0.35 + (1 - t) * 0.6;
      const colr = ex.owner === "crawler" ? [1, 0.7, 0.2] : [1, 0.5, 0.3];
      pushLine(pos, col, ex.x - r, ex.y, ex.x + r, ex.y, colr[0], colr[1], colr[2], 0.8 * t);
      pushLine(pos, col, ex.x, ex.y - r, ex.x, ex.y + r, colr[0], colr[1], colr[2], 0.8 * t);
      lineVerts += 4;
    }
  }
  if (state.playerExplosions && state.playerExplosions.length) {
    for (const ex of state.playerExplosions) {
      const t = Math.max(0, Math.min(1, ex.life / 0.8));
      const r = (ex.radius ?? 1) * (0.4 + (1 - t) * 0.9);
      const alpha = 0.9 * t;
      const seg = 18;
      for (let i = 0; i < seg; i++) {
        const a0 = i / seg * Math.PI * 2;
        const a1 = (i + 1) / seg * Math.PI * 2;
        const r0 = r * (0.85 + 0.2 * Math.sin(t * 8 + i));
        const r1 = r * (0.85 + 0.2 * Math.sin(t * 8 + i + 1));
        const x0 = ex.x + Math.cos(a0) * r0;
        const y0 = ex.y + Math.sin(a0) * r0;
        const x1 = ex.x + Math.cos(a1) * r1;
        const y1 = ex.y + Math.sin(a1) * r1;
        pushLine(pos, col, x0, y0, x1, y1, 1, 0.9, 0.4, alpha);
        lineVerts += 2;
      }
      pushLine(pos, col, ex.x - r * 0.6, ex.y, ex.x + r * 0.6, ex.y, 1, 0.95, 0.6, 0.7 * alpha);
      pushLine(pos, col, ex.x, ex.y - r * 0.6, ex.x, ex.y + r * 0.6, 1, 0.95, 0.6, 0.7 * alpha);
      lineVerts += 4;
    }
  }
  if (state.debugCollisions && state.ship._samples) {
    for (const [sxw, syw, air, av] of state.ship._samples) {
      pos.push(sxw, syw);
      if (air) col.push(0.45, 1, 0.55, 0.9);
      else col.push(1, 0.3, 0.3, 0.9);
      pointVerts += 1;
    }
  }
  if (state.debugCollisions && state.ship._collision) {
    const c = state.ship._collision;
    pos.push(c.x, c.y);
    col.push(1, 0.95, 0.2, 1);
    pointVerts += 1;
    if (c.tri) {
      const a = c.tri[0], b = c.tri[1], d = c.tri[2];
      pushLine(pos, col, a.x, a.y, b.x, b.y, 1, 0.4, 0.2, 0.8);
      pushLine(pos, col, b.x, b.y, d.x, d.y, 1, 0.4, 0.2, 0.8);
      pushLine(pos, col, d.x, d.y, a.x, a.y, 1, 0.4, 0.2, 0.8);
      lineVerts += 6;
    }
    if (c.node) {
      pos.push(c.node.x, c.node.y);
      col.push(0.2, 0.9, 1, 0.9);
      pointVerts += 1;
    }
  }
  if (state.debugCollisions && state.debugNodes) {
    for (const ring of mesh2.rings) {
      for (const v of ring) {
        pos.push(v.x, v.y);
        col.push(0.95, 0.8, 0.2, 0.6);
        pointVerts += 1;
      }
    }
  }
  gl.useProgram(oprog);
  gl.bindVertexArray(oVao);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.uniform2f(ouScale, sx, sy);
  gl.uniform2f(ouCam, state.ship.x, state.ship.y);
  gl.uniform1f(ouRot, camRot);
  gl.bindBuffer(gl.ARRAY_BUFFER, oPos);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.DYNAMIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, oCol);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(col), gl.DYNAMIC_DRAW);
  if (triVerts > 0) {
    gl.drawArrays(gl.TRIANGLES, 0, triVerts);
  }
  let offset = triVerts;
  if (lineVerts > 0) {
    gl.drawArrays(gl.LINES, offset, lineVerts);
    offset += lineVerts;
  }
  if (pointVerts > 0) {
    gl.drawArrays(gl.POINTS, offset, pointVerts);
  }
  if (state.touchUi) {
    const linePos = [];
    const lineCol = [];
    const w = canvas2.width;
    const h = canvas2.height;
    const minDim = Math.max(1, Math.min(w, h));
    const toPx = (nx, ny) => {
      return { x: nx * w, y: (1 - ny) * h };
    };
    const left = toPx(TOUCH_UI.left.x, TOUCH_UI.left.y);
    const leftRadius = TOUCH_UI.left.r * minDim;
    const laser = toPx(TOUCH_UI.laser.x, TOUCH_UI.laser.y);
    const laserSize = TOUCH_UI.laser.r * minDim;
    pushDiamondOutline(linePos, lineCol, laser.x, laser.y, laserSize, 0.95, 0.95, 0.95, 0.9);
    const bomb = toPx(TOUCH_UI.bomb.x, TOUCH_UI.bomb.y);
    const bombSize = TOUCH_UI.bomb.r * minDim;
    pushSquareOutline(linePos, lineCol, bomb.x, bomb.y, bombSize, 1, 0.75, 0.2, 0.9);
    pushCircle(linePos, lineCol, left.x, left.y, leftRadius, 1, 0.55, 0.15, 0.9, 64);
    if (state.touchUi.leftTouch) {
      const touch = toPx(state.touchUi.leftTouch.x, state.touchUi.leftTouch.y);
      pushCircle(linePos, lineCol, touch.x, touch.y, leftRadius * 0.35, 1, 0.2, 0.2, 0.9, 24);
    }
    if (state.touchUi.laserTouch) {
      const touch = toPx(state.touchUi.laserTouch.x, state.touchUi.laserTouch.y);
      pushCircle(linePos, lineCol, touch.x, touch.y, leftRadius * 0.35, 1, 0.2, 0.2, 0.9, 24);
    }
    if (state.touchUi.bombTouch) {
      const touch = toPx(state.touchUi.bombTouch.x, state.touchUi.bombTouch.y);
      pushCircle(linePos, lineCol, touch.x, touch.y, leftRadius * 0.35, 1, 0.2, 0.2, 0.9, 24);
    }
    const uiLine = linePos.length / 2;
    const uiPos = linePos;
    const uiCol = lineCol;
    gl.uniform2f(ouScale, 2 / w, 2 / h);
    gl.uniform2f(ouCam, w * 0.5, h * 0.5);
    gl.uniform1f(ouRot, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, oPos);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uiPos), gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, oCol);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uiCol), gl.DYNAMIC_DRAW);
    if (uiLine > 0) {
      gl.drawArrays(gl.LINES, 0, uiLine);
    }
  }
  gl.bindVertexArray(null);
  gl.disable(gl.BLEND);
}
class Renderer {
  /**
   * WebGL renderer for the game scene.
   * @param {HTMLCanvasElement} canvas Render surface.
   * @param {typeof import("./config.js").CFG} cfg Render configuration.
   * @param {typeof import("./config.js").GAME} game Gameplay constants used in rendering.
   */
  constructor(canvas2, cfg, game) {
    this.canvas = canvas2;
    this.cfg = cfg;
    this.game = game;
    const glMaybe = canvas2.getContext("webgl2", { antialias: true, premultipliedAlpha: false });
    if (!glMaybe) throw new Error("WebGL2 not available");
    const gl = glMaybe;
    this.gl = gl;
    this.airBuf = null;
    this.vertCount = 0;
    const vs = `#version 300 es
  precision highp float;
  layout(location=0) in vec2 aPos;
  layout(location=1) in float aAir;
  layout(location=2) in float aShade;
  out vec2 vWorld;

  uniform vec2 uScale;
  uniform vec2 uCam;
  uniform float uRot;

  out float vAir;
  out float vShade;

  vec2 rot(vec2 p, float a){
    float c = cos(a), s = sin(a);
    return vec2(c*p.x - s*p.y, s*p.x + c*p.y);
  }

  void main(){
    vAir = aAir;
    vShade = aShade;
    vWorld = aPos;
    vec2 p = aPos - uCam;
    p = rot(p, uRot);
    gl_Position = vec4(p * uScale, 0.0, 1.0);
  }`;
    const fs = `#version 300 es
  precision highp float;

  in float vAir;
  in float vShade;
  in vec2 vWorld;
  out vec4 outColor;

  uniform vec3 uRockDark;
  uniform vec3 uRockLight;
  uniform vec3 uAirDark;
  uniform vec3 uAirLight;
  uniform float uMaxR;

  vec3 lerp(vec3 a, vec3 b, float t){ return a + (b-a)*t; }

  void main(){
    if (length(vWorld) > uMaxR){
      discard;
    }
    float t = clamp(vShade, 0.0, 1.0);
    vec3 c = (vAir > 0.5) ? lerp(uAirDark,  uAirLight,  t)
                          : lerp(uRockDark, uRockLight, t);
    outColor = vec4(c, 1.0);
  }`;
    const ovs = `#version 300 es
  precision highp float;
  layout(location=0) in vec2 aPos;
  layout(location=1) in vec4 aColor;

  uniform vec2 uScale;
  uniform vec2 uCam;
  uniform float uRot;

  out vec4 vColor;

  vec2 rot(vec2 p, float a){
    float c = cos(a), s = sin(a);
    return vec2(c*p.x - s*p.y, s*p.x + c*p.y);
  }

  void main(){
    vec2 p = aPos - uCam;
    p = rot(p, uRot);
    gl_Position = vec4(p * uScale, 0.0, 1.0);
    vColor = aColor;
    gl_PointSize = 6.0;
  }`;
    const ofs = `#version 300 es
  precision highp float;
  in vec4 vColor;
  out vec4 outColor;
  void main(){
    outColor = vColor;
  }`;
    const prog = gl.createProgram();
    if (!prog) throw new Error("Failed to create program");
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(prog) || "Program link failed");
    }
    this.prog = prog;
    const oprog = gl.createProgram();
    if (!oprog) throw new Error("Failed to create overlay program");
    gl.attachShader(oprog, compile(gl, gl.VERTEX_SHADER, ovs));
    gl.attachShader(oprog, compile(gl, gl.FRAGMENT_SHADER, ofs));
    gl.linkProgram(oprog);
    if (!gl.getProgramParameter(oprog, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(oprog) || "Overlay program link failed");
    }
    this.oprog = oprog;
    const vao = gl.createVertexArray();
    const oVao = gl.createVertexArray();
    if (!vao || !oVao) throw new Error("Failed to create VAO");
    this.vao = vao;
    this.oVao = oVao;
    gl.useProgram(prog);
    this.uScale = gl.getUniformLocation(prog, "uScale");
    this.uCam = gl.getUniformLocation(prog, "uCam");
    this.uRot = gl.getUniformLocation(prog, "uRot");
    this.uRockDark = gl.getUniformLocation(prog, "uRockDark");
    this.uRockLight = gl.getUniformLocation(prog, "uRockLight");
    this.uAirDark = gl.getUniformLocation(prog, "uAirDark");
    this.uAirLight = gl.getUniformLocation(prog, "uAirLight");
    this.uMaxR = gl.getUniformLocation(prog, "uMaxR");
    gl.uniform3fv(this.uRockDark, cfg.ROCK_DARK);
    gl.uniform3fv(this.uRockLight, cfg.ROCK_LIGHT);
    gl.uniform3fv(this.uAirDark, cfg.AIR_DARK);
    gl.uniform3fv(this.uAirLight, cfg.AIR_LIGHT);
    gl.uniform1f(this.uMaxR, cfg.RMAX + 0.5);
    gl.bindVertexArray(oVao);
    const oPos = gl.createBuffer();
    const oCol = gl.createBuffer();
    if (!oPos || !oCol) throw new Error("Failed to create overlay buffers");
    this.oPos = oPos;
    this.oCol = oCol;
    gl.bindBuffer(gl.ARRAY_BUFFER, oPos);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, oCol);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    this.ouScale = gl.getUniformLocation(oprog, "uScale");
    this.ouCam = gl.getUniformLocation(oprog, "uCam");
    this.ouRot = gl.getUniformLocation(oprog, "uRot");
  }
  /**
   * @returns {void}
   */
  resize() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = Math.floor(this.canvas.clientWidth * dpr);
    const h = Math.floor(this.canvas.clientHeight * dpr);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }
  /**
   * @param {{positions:Float32Array, airFlag:Float32Array, shade:Float32Array, vertCount:number}} mesh
   * @returns {void}
   */
  setMesh(mesh2) {
    const gl = this.gl;
    gl.bindVertexArray(this.vao);
    uploadAttrib(gl, 0, mesh2.positions, 2);
    this.airBuf = uploadAttrib(gl, 1, mesh2.airFlag, 1);
    uploadAttrib(gl, 2, mesh2.shade, 1);
    gl.bindVertexArray(null);
    this.vertCount = mesh2.vertCount;
  }
  /**
   * @param {Float32Array} airFlag
   * @returns {void}
   */
  updateAir(airFlag) {
    if (!this.airBuf) return;
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.airBuf);
    gl.bufferData(gl.ARRAY_BUFFER, airFlag, gl.STATIC_DRAW);
  }
  /**
   * @param {RenderState} state
   * @param {import("./mesh.js").RingMesh} mesh
   * @returns {void}
   */
  drawFrame(state, mesh2) {
    drawFrameImpl(this, state, mesh2);
  }
}
const KEY_LEFT = /* @__PURE__ */ new Set(["ArrowLeft", "a", "A"]);
const KEY_RIGHT = /* @__PURE__ */ new Set(["ArrowRight", "d", "D"]);
const KEY_THRUST = /* @__PURE__ */ new Set([" ", "Space", "ArrowUp", "w", "W"]);
const KEY_DOWN = /* @__PURE__ */ new Set(["ArrowDown", "s", "S"]);
const KEY_RESET = /* @__PURE__ */ new Set(["r", "R"]);
class Input {
  /**
   * Input handler for keyboard/mouse/touch/gamepad.
   * @param {HTMLCanvasElement} canvas Input surface.
   */
  constructor(canvas2) {
    this.canvas = canvas2;
    this.keys = /* @__PURE__ */ new Set();
    this.justPressed = /* @__PURE__ */ new Set();
    this.leftControl = { id: null, pos: null, start: null };
    this.laserControl = { id: null, pos: null, start: null, lastFire: 0 };
    this.bombControl = { id: null, pos: null, start: null, lastFire: 0 };
    this.oneshot = {
      regen: false,
      toggleDebug: false,
      reset: false,
      nextLevel: false,
      shoot: false,
      bomb: false
    };
    this.prevPadShoot = false;
    this.prevPadBomb = false;
    this.aimMouse = null;
    this.aimTouchShoot = null;
    this.aimTouchBomb = null;
    this.aimTouchShootFrom = null;
    this.aimTouchShootTo = null;
    this.aimTouchBombFrom = null;
    this.aimTouchBombTo = null;
    this.lastInputType = null;
    this.lastPointerShootTime = 0;
    this.SHOOT_DEBOUNCE_MS = 50;
    this.LASER_INTERVAL_MS = 500;
    this.BOMB_INTERVAL_MS = 2e3;
    window.addEventListener("keydown", (e) => this._onKeyDown(e), { passive: false });
    window.addEventListener("keyup", (e) => this._onKeyUp(e), { passive: false });
    canvas2.addEventListener("pointerdown", (e) => this._onPointerDown(e), { passive: false });
    canvas2.addEventListener("pointermove", (e) => this._onPointerMove(e), { passive: true });
    canvas2.addEventListener("pointerup", (e) => this._onPointerUp(e), { passive: true });
    canvas2.addEventListener("pointercancel", (e) => this._onPointerUp(e), { passive: true });
    canvas2.addEventListener("contextmenu", (e) => e.preventDefault());
    canvas2.addEventListener("dblclick", (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, { passive: false });
  }
  /**
   * @param {number} now
   * @returns {void}
   */
  _fireShoot(now) {
    if (now - this.lastPointerShootTime < this.SHOOT_DEBOUNCE_MS) return;
    this.oneshot.shoot = true;
    this.lastPointerShootTime = now;
  }
  /** @returns {void} */
  _fireBomb() {
    this.oneshot.bomb = true;
  }
  /**
   * @param {KeyboardEvent} e
   * @returns {void}
   */
  _onKeyDown(e) {
    const key = e.key;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "Space"].includes(key)) e.preventDefault();
    if (!this.keys.has(key)) this.justPressed.add(key);
    this.keys.add(key);
    this.lastInputType = "keyboard";
    if (key === "m" || key === "M") this.oneshot.regen = true;
    if (key === "c" || key === "C") this.oneshot.toggleDebug = true;
    if (key === "n" || key === "N") this.oneshot.nextLevel = true;
  }
  /**
   * @param {KeyboardEvent} e
   * @returns {void}
   */
  _onKeyUp(e) {
    this.keys.delete(e.key);
  }
  /**
   * @param {PointerEvent|MouseEvent} e
   * @returns {Point}
   */
  _pointerPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / Math.max(1, rect.width),
      y: (e.clientY - rect.top) / Math.max(1, rect.height)
    };
  }
  /**
   * @param {Point} p
   * @param {{x:number,y:number}} c
   * @param {number} r
   * @returns {boolean}
   */
  _inCircle(p, c, r) {
    const dx = p.x - c.x;
    const dy = p.y - c.y;
    return dx * dx + dy * dy <= r * r;
  }
  /**
   * @param {Point} p
   * @param {{x:number,y:number}} c
   * @param {number} r
   * @returns {boolean}
   */
  _inDiamond(p, c, r) {
    const dx = Math.abs(p.x - c.x);
    const dy = Math.abs(p.y - c.y);
    return dx + dy <= r;
  }
  /**
   * @param {Point} p
   * @param {{x:number,y:number}} c
   * @param {number} r
   * @returns {boolean}
   */
  _inSquare(p, c, r) {
    const dx = Math.abs(p.x - c.x);
    const dy = Math.abs(p.y - c.y);
    return Math.max(dx, dy) <= r;
  }
  /**
   * @param {PointerEvent} e
   * @returns {void}
   */
  _onPointerDown(e) {
    if (e.pointerType !== "touch") {
      this.aimMouse = this._pointerPos(e);
      const now = performance.now();
      if (e.button === 2) this._fireBomb();
      else if (e.button === 0 || e.buttons & 1) this._fireShoot(now);
      this.lastInputType = "mouse";
      return;
    }
    e.preventDefault();
    this.lastInputType = "touch";
    const p = this._pointerPos(e);
    this.canvas.setPointerCapture(e.pointerId);
    if (this.leftControl.id === null && this._inCircle(p, TOUCH_UI.left, TOUCH_UI.left.r)) {
      this.leftControl.id = e.pointerId;
      this.leftControl.pos = p;
      this.leftControl.start = p;
    } else if (this.laserControl.id === null && this._inDiamond(p, TOUCH_UI.laser, TOUCH_UI.laser.r)) {
      this.laserControl.id = e.pointerId;
      this.laserControl.pos = p;
      this.laserControl.start = p;
      this.laserControl.lastFire = performance.now() - this.LASER_INTERVAL_MS;
    } else if (this.bombControl.id === null && this._inSquare(p, TOUCH_UI.bomb, TOUCH_UI.bomb.r)) {
      this.bombControl.id = e.pointerId;
      this.bombControl.pos = p;
      this.bombControl.start = p;
      this.bombControl.lastFire = performance.now() - this.BOMB_INTERVAL_MS;
    }
  }
  /**
   * @param {PointerEvent} e
   * @returns {void}
   */
  _onPointerMove(e) {
    const p = this._pointerPos(e);
    if (e.pointerType !== "touch") {
      this.aimMouse = p;
      this.lastInputType = "mouse";
      return;
    }
    if (this.leftControl.id === e.pointerId) {
      this.leftControl.pos = p;
    } else if (this.laserControl.id === e.pointerId) {
      this.laserControl.pos = p;
    } else if (this.bombControl.id === e.pointerId) {
      this.bombControl.pos = p;
    }
  }
  /**
   * @param {PointerEvent} e
   * @returns {void}
   */
  _onPointerUp(e) {
    if (e.pointerType !== "touch") {
      this.aimMouse = this._pointerPos(e);
      this.lastInputType = "mouse";
      return;
    }
    if (this.leftControl.id === e.pointerId) {
      this.leftControl.id = null;
      this.leftControl.pos = null;
      this.leftControl.start = null;
    } else if (this.laserControl.id === e.pointerId) {
      this.laserControl.id = null;
      this.laserControl.pos = null;
      this.laserControl.start = null;
    } else if (this.bombControl.id === e.pointerId) {
      this.bombControl.id = null;
      this.bombControl.pos = null;
      this.bombControl.start = null;
    }
  }
  /**
   * @returns {{left:boolean,right:boolean,thrust:boolean,down:boolean}}
   */
  _touchState() {
    let left = false;
    let right = false;
    let thrust = false;
    let down = false;
    this.aimTouchShoot = null;
    this.aimTouchBomb = null;
    this.aimTouchShootFrom = null;
    this.aimTouchShootTo = null;
    this.aimTouchBombFrom = null;
    this.aimTouchBombTo = null;
    const dead = TOUCH_UI.dead;
    if (this.leftControl.id !== null && this.leftControl.pos) {
      const dx = this.leftControl.pos.x - TOUCH_UI.left.x;
      const dy = this.leftControl.pos.y - TOUCH_UI.left.y;
      if (dx < -dead) left = true;
      if (dx > dead) right = true;
      if (dy < -dead) thrust = true;
      if (dy > dead) down = true;
    }
    const aimFromControl = (control, center) => {
      if (!control || control.id === null || !control.pos) return null;
      const dx = control.pos.x - center.x;
      const dy = control.pos.y - center.y;
      const sx = control.start ? control.pos.x - control.start.x : dx;
      const sy = control.start ? control.pos.y - control.start.y : dy;
      const move = Math.hypot(sx, sy);
      if (move < dead) return null;
      const len = Math.hypot(dx, dy);
      const radius = TOUCH_UI.aimRadius;
      if (len > 1e-4) {
        const ux = dx / len;
        const uy = dy / len;
        return { x: center.x + ux * radius, y: center.y + uy * radius };
      }
      return { x: center.x, y: center.y - radius };
    };
    this.aimTouchShoot = aimFromControl(this.laserControl, TOUCH_UI.laser);
    this.aimTouchBomb = aimFromControl(this.bombControl, TOUCH_UI.bomb);
    if (this.laserControl.id !== null && this.laserControl.pos && this.aimTouchShoot) {
      this.aimTouchShootFrom = { x: TOUCH_UI.laser.x, y: TOUCH_UI.laser.y };
      this.aimTouchShootTo = { x: this.laserControl.pos.x, y: this.laserControl.pos.y };
    }
    if (this.bombControl.id !== null && this.bombControl.pos && this.aimTouchBomb) {
      this.aimTouchBombFrom = { x: TOUCH_UI.bomb.x, y: TOUCH_UI.bomb.y };
      this.aimTouchBombTo = { x: this.bombControl.pos.x, y: this.bombControl.pos.y };
    }
    return { left, right, thrust, down };
  }
  /**
   * @returns {{left:boolean,right:boolean,thrust:boolean,down:boolean,aim:Point|null,shoot:boolean,bomb:boolean}}
   */
  _gamepadState() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const pad = pads && pads[0];
    if (!pad) return { left: false, right: false, thrust: false, down: false, aim: null, shoot: false, bomb: false };
    const dead = 0.2;
    const ax0 = pad.axes && pad.axes.length ? pad.axes[0] : 0;
    const ax1 = pad.axes && pad.axes.length > 1 ? pad.axes[1] : 0;
    const ax2 = pad.axes && pad.axes.length > 2 ? pad.axes[2] : 0;
    const ax3 = pad.axes && pad.axes.length > 3 ? pad.axes[3] : 0;
    const left = ax0 < -dead;
    const right = ax0 > dead;
    const thrust = pad.buttons && pad.buttons[0] && pad.buttons[0].pressed || ax1 < -dead;
    const down = pad.buttons && pad.buttons[1] && pad.buttons[1].pressed || ax1 > dead;
    let aim = null;
    const alen = Math.hypot(ax2, ax3);
    if (alen > dead) {
      const ux = ax2 / alen;
      const uy = ax3 / alen;
      const radius = 0.22;
      aim = { x: 0.5 + ux * radius, y: 0.5 + uy * radius };
    }
    const rb = !!(pad.buttons && pad.buttons[5] && pad.buttons[5].pressed);
    const rt = !!(pad.buttons && pad.buttons[7] && (pad.buttons[7].pressed || pad.buttons[7].value > 0.4));
    const shoot = rb && !this.prevPadShoot;
    const bomb = rt && !this.prevPadBomb;
    const anyInput = left || right || thrust || down || aim || rb || rt;
    if (anyInput) this.lastInputType = "gamepad";
    this.prevPadShoot = rb;
    this.prevPadBomb = rt;
    return { left, right, thrust, down, aim, shoot, bomb };
  }
  /**
   * @returns {InputState}
   */
  update() {
    const now = performance.now();
    const keyState = {
      left: false,
      right: false,
      thrust: false,
      down: false
    };
    for (const k of this.keys) {
      if (KEY_LEFT.has(k)) keyState.left = true;
      if (KEY_RIGHT.has(k)) keyState.right = true;
      if (KEY_THRUST.has(k)) keyState.thrust = true;
      if (KEY_DOWN.has(k)) keyState.down = true;
      if (KEY_RESET.has(k)) this.oneshot.reset = true;
    }
    const t = this._touchState();
    const g = this._gamepadState();
    const left = keyState.left || t.left || g.left;
    const right = keyState.right || t.right || g.right;
    const thrust = keyState.thrust || t.thrust || g.thrust;
    const down = keyState.down || t.down || g.down;
    if (g.shoot) this.oneshot.shoot = true;
    if (g.bomb) this.oneshot.bomb = true;
    if (this.aimTouchShoot && this.laserControl.id !== null) {
      if (now - this.laserControl.lastFire >= this.LASER_INTERVAL_MS) {
        this.oneshot.shoot = true;
        this.laserControl.lastFire = now;
      }
    }
    if (this.aimTouchBomb && this.bombControl.id !== null) {
      if (now - this.bombControl.lastFire >= this.BOMB_INTERVAL_MS) {
        this.oneshot.bomb = true;
        this.bombControl.lastFire = now;
      }
    }
    const touchUiVisible = this.lastInputType === "touch";
    const touchUi = touchUiVisible ? {
      leftTouch: this.leftControl.pos,
      laserTouch: this.laserControl.pos,
      bombTouch: this.bombControl.pos
    } : null;
    const aimShoot = this.aimTouchShoot || this.aimMouse || g.aim || null;
    const aimBomb = this.aimTouchBomb || aimShoot;
    const aim = aimShoot || aimBomb || null;
    const state = {
      left,
      right,
      thrust,
      down,
      reset: this.oneshot.reset,
      regen: this.oneshot.regen,
      toggleDebug: this.oneshot.toggleDebug,
      nextLevel: this.oneshot.nextLevel,
      shoot: this.oneshot.shoot,
      bomb: this.oneshot.bomb,
      aim,
      aimShoot,
      aimBomb,
      aimShootFrom: this.aimTouchShootFrom,
      aimShootTo: this.aimTouchShootTo,
      aimBombFrom: this.aimTouchBombFrom,
      aimBombTo: this.aimTouchBombTo,
      touchUi,
      touchUiVisible
    };
    this.justPressed.clear();
    this.oneshot.reset = false;
    this.oneshot.regen = false;
    this.oneshot.toggleDebug = false;
    this.oneshot.nextLevel = false;
    this.oneshot.shoot = false;
    this.oneshot.bomb = false;
    return state;
  }
}
function updateHud(hud2, stats) {
  const debugSuffix = stats.debug ? ` | miner candidates: ${stats.minerCandidates}` : "";
  hud2.textContent = `fps: ${stats.fps} | level: ${stats.level} | state: ${stats.state} | speed: ${stats.speed.toFixed(2)} | miners: ${stats.miners} | dead: ${stats.minersDead} | verts: ${stats.verts.toLocaleString()} | air: ${stats.air.toFixed(3)}${debugSuffix} | LMB: shoot | RMB: bomb | M: new map | N: next level | C: debug collisions | R: restart`;
}
function lineOfSightAir(mesh2, ax, ay, bx, by, step = 0.25) {
  const dx = bx - ax;
  const dy = by - ay;
  const dist = Math.hypot(dx, dy);
  if (dist <= 1e-6) return true;
  const steps = Math.max(1, Math.ceil(dist / step));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const x = ax + dx * t;
    const y = ay + dy * t;
    if (mesh2.airValueAtWorld(x, y) <= 0.5) return false;
  }
  return true;
}
function isAir(mesh2, x, y) {
  return mesh2.airValueAtWorld(x, y) > 0.5;
}
function collidesAtWorldPoints(mesh2, points) {
  for (const [x, y] of points) {
    if (mesh2.airValueAtWorld(x, y) <= 0.5) return true;
  }
  return false;
}
function collidesAtOffsets(mesh2, x, y, offsets) {
  for (const [dx, dy] of offsets) {
    if (mesh2.airValueAtWorld(x + dx, y + dy) <= 0.5) return true;
  }
  return false;
}
function circleOffsets(radius, points) {
  const out = [];
  for (let i = 0; i < points; i++) {
    const ang = i / points * Math.PI * 2;
    out.push([Math.cos(ang) * radius, Math.sin(ang) * radius]);
  }
  out.push([0, 0]);
  return out;
}
function airGradient(mesh2, x, y, eps) {
  const gdx = mesh2.airValueAtWorld(x + eps, y) - mesh2.airValueAtWorld(x - eps, y);
  const gdy = mesh2.airValueAtWorld(x, y + eps) - mesh2.airValueAtWorld(x, y - eps);
  return [gdx, gdy];
}
function tryMoveAir(e, mesh2, dx, dy, speed, dt, collider) {
  const len = Math.hypot(dx, dy);
  if (len < 1e-6) return false;
  const nx = dx / len;
  const ny = dy / len;
  const step = speed * dt;
  const tx = e.x + nx * step;
  const ty = e.y + ny * step;
  if (!collider ? isAir(mesh2, tx, ty) : !collidesAtOffsets(mesh2, tx, ty, collider)) {
    e.x = tx;
    e.y = ty;
    e.vx = nx * speed;
    e.vy = ny * speed;
    return true;
  }
  return false;
}
function nudgeTowardSurface(mesh2, x, y) {
  const eps = 0.12;
  const [gdx, gdy] = airGradient(mesh2, x, y, eps);
  const nlen = Math.hypot(gdx, gdy);
  if (nlen < 1e-5) return [x, y];
  const nx = gdx / nlen;
  const ny = gdy / nlen;
  const air = mesh2.airValueAtWorld(x, y);
  const push = 0.08;
  if (air > 0.55) {
    return [x - nx * push, y - ny * push];
  }
  if (air < 0.45) {
    return [x + nx * push, y + ny * push];
  }
  return [x, y];
}
function pickAirPoints(count, seed, minR, maxR, mesh2) {
  const rand = mulberry32(seed);
  const points = [];
  const attempts = Math.max(200, count * 80);
  for (let i = 0; i < attempts && points.length < count; i++) {
    const ang = rand() * Math.PI * 2;
    const r = minR + rand() * (maxR - minR);
    const x = r * Math.cos(ang);
    const y = r * Math.sin(ang);
    if (mesh2.airValueAtWorld(x, y) <= 0.5) continue;
    points.push([x, y]);
  }
  return points;
}
function pickSurfacePoints(count, seed, mesh2, rMax) {
  const rand = mulberry32(seed);
  const points = [];
  const eps = 0.12;
  const rMin = 1;
  const steps = 64;
  const findSurface = (ang) => {
    const cx = Math.cos(ang);
    const cy = Math.sin(ang);
    let prevR = rMin;
    let prevAir = mesh2.airValueAtWorld(cx * prevR, cy * prevR) > 0.5;
    for (let i = 1; i <= steps; i++) {
      const r = rMin + i / steps * (rMax - rMin);
      const curAir = mesh2.airValueAtWorld(cx * r, cy * r) > 0.5;
      if (curAir !== prevAir) {
        let lo = prevR;
        let hi = r;
        const loAir = prevAir;
        for (let it = 0; it < 8; it++) {
          const mid = (lo + hi) * 0.5;
          const midAir = mesh2.airValueAtWorld(cx * mid, cy * mid) > 0.5;
          if (midAir === loAir) {
            lo = mid;
          } else {
            hi = mid;
          }
        }
        const baseR = (lo + hi) * 0.5 + (loAir ? -eps : eps);
        return { x: cx * baseR, y: cy * baseR, r: baseR };
      }
      prevR = r;
      prevAir = curAir;
    }
    return null;
  };
  const attempts = Math.max(200, count * 120);
  for (let i = 0; i < attempts && points.length < count; i++) {
    const ang = rand() * Math.PI * 2;
    const surf = findSurface(ang);
    if (!surf) continue;
    const upx = surf.x / (Math.hypot(surf.x, surf.y) || 1);
    const upy = surf.y / (Math.hypot(surf.x, surf.y) || 1);
    const below = surf.r - eps * 2;
    const above = surf.r + eps * 2;
    if (mesh2.airValueAtWorld(upx * below, upy * below) > 0.5) continue;
    if (mesh2.airValueAtWorld(upx * above, upy * above) <= 0.5) continue;
    points.push([surf.x, surf.y]);
  }
  return points;
}
class Enemies {
  /**
   * Build enemy state and behavior helpers.
   * @param {Object} deps
   * @param {typeof import("./config.js").CFG} deps.cfg Game config constants.
   * @param {import("./mapgen.js").MapGen} deps.mapgen Map generator.
   * @param {import("./mesh.js").RingMesh} deps.mesh Mesh query API.
   */
  constructor({ cfg, mapgen: mapgen2, mesh: mesh2 }) {
    this.cfg = cfg;
    this.mapgen = mapgen2;
    this.mesh = mesh2;
    this.enemies = [];
    this.shots = [];
    this.explosions = [];
    this.debris = [];
    this._HUNTER_SPEED = 2.3;
    this._RANGER_SPEED = 1.6;
    this._CRAWLER_SPEED = 1.2;
    this._HUNTER_SHOT_CD = 1.2;
    this._RANGER_SHOT_CD = 1.8;
    this._SHOT_SPEED = 6.5;
    this._SHOT_LIFE = 3;
    this._DETONATE_RANGE = 1.6;
    this._DETONATE_FUSE = 0.6;
    this._LOS_STEP = 0.2;
    this._RANGER_MIN = 5;
    this._RANGER_MAX = 9;
    this._HUNTER_COLLIDER = circleOffsets(0.22, 6);
    this._RANGER_COLLIDER = circleOffsets(0.22, 6);
    this._CRAWLER_COLLIDER = circleOffsets(0.2, 6);
  }
  /**
   * Reset enemy and projectile lists.
   * @returns {void}
   */
  reset() {
    this.enemies.length = 0;
    this.shots.length = 0;
    this.explosions.length = 0;
    this.debris.length = 0;
  }
  /**
   * @param {number} total
   * @param {number} level
   * @returns {void}
   */
  spawn(total, level) {
    const { cfg, mapgen: mapgen2, mesh: mesh2 } = this;
    this.enemies.length = 0;
    this.shots.length = 0;
    this.explosions.length = 0;
    this.debris.length = 0;
    if (total <= 0) return;
    const seed = mapgen2.getWorld().seed + level * 133;
    const hunters = Math.max(0, Math.floor(total * 0.5));
    const rangers = Math.max(0, Math.floor(total * 0.25));
    const crawlers = Math.max(0, total - hunters - rangers);
    const hunterPts = pickAirPoints(hunters, seed + 1, 2, cfg.RMAX - 1, mesh2);
    const rangerPts = pickAirPoints(rangers, seed + 2, 3, cfg.RMAX - 1, mesh2);
    const crawlerPts = pickSurfacePoints(crawlers, seed + 3, mesh2, cfg.RMAX - 0.6);
    for (const [x, y] of hunterPts) {
      this.enemies.push({ type: "hunter", x, y, vx: 0, vy: 0, cooldown: Math.random(), hp: 2, dir: 1, fuse: 0 });
    }
    for (const [x, y] of rangerPts) {
      this.enemies.push({ type: "ranger", x, y, vx: 0, vy: 0, cooldown: Math.random(), hp: 2, dir: -1, fuse: 0 });
    }
    for (const [x, y] of crawlerPts) {
      this.enemies.push({ type: "crawler", x, y, vx: 0, vy: 0, cooldown: 0, hp: 1, dir: Math.random() < 0.5 ? -1 : 1, fuse: 0 });
    }
  }
  /**
   * @param {{x:number,y:number}} ship
   * @param {number} dt
   * @returns {void}
   */
  update(ship, dt) {
    const { mesh: mesh2 } = this;
    if (this.debris.length) {
      for (let i = this.debris.length - 1; i >= 0; i--) {
        const d = this.debris[i];
        const r = Math.hypot(d.x, d.y) || 1;
        d.vx += -d.x / r * GAME.GRAVITY * dt;
        d.vy += -d.y / r * GAME.GRAVITY * dt;
        d.vx *= Math.max(0, 1 - GAME.DRAG * dt);
        d.vy *= Math.max(0, 1 - GAME.DRAG * dt);
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.a += d.w * dt;
        d.life -= dt;
        if (d.life <= 0) this.debris.splice(i, 1);
      }
    }
    for (let i = this.shots.length - 1; i >= 0; i--) {
      const s = this.shots[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt;
      if (s.life <= 0 || !isAir(mesh2, s.x, s.y)) {
        this.shots.splice(i, 1);
      }
    }
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      this.explosions[i].life -= dt;
      if (this.explosions[i].life <= 0) this.explosions.splice(i, 1);
    }
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (e.hp <= 0) {
        const pieces = 6;
        for (let k = 0; k < pieces; k++) {
          const ang = Math.random() * Math.PI * 2;
          const sp = 1 + Math.random() * 2;
          this.debris.push({
            x: e.x + Math.cos(ang) * 0.08,
            y: e.y + Math.sin(ang) * 0.08,
            vx: Math.cos(ang) * sp,
            vy: Math.sin(ang) * sp,
            a: Math.random() * Math.PI * 2,
            w: (Math.random() - 0.5) * 6,
            life: 1.1 + Math.random() * 0.8
          });
        }
        this.explosions.push({ x: e.x, y: e.y, life: 0.5, owner: e.type, radius: 0.8 });
        this.enemies.splice(i, 1);
        continue;
      }
      const dx = ship.x - e.x;
      const dy = ship.y - e.y;
      const dist = Math.hypot(dx, dy);
      e.cooldown = Math.max(0, e.cooldown - dt);
      if (e.type === "hunter") {
        if (!tryMoveAir(e, mesh2, dx, dy, this._HUNTER_SPEED, dt, this._HUNTER_COLLIDER)) {
          const [gx, gy] = airGradient(mesh2, e.x, e.y, 0.18);
          const tlen = Math.hypot(gx, gy);
          if (tlen > 1e-4) {
            const tx = -gy / tlen;
            const ty = gx / tlen;
            tryMoveAir(e, mesh2, tx, ty, this._HUNTER_SPEED, dt, this._HUNTER_COLLIDER) || tryMoveAir(e, mesh2, -tx, -ty, this._HUNTER_SPEED, dt, this._HUNTER_COLLIDER);
          }
        }
        if (e.cooldown <= 0 && dist < 10 && lineOfSightAir(mesh2, e.x, e.y, ship.x, ship.y, this._LOS_STEP)) {
          const inv = 1 / (dist || 1);
          this.shots.push({ x: e.x, y: e.y, vx: dx * inv * this._SHOT_SPEED, vy: dy * inv * this._SHOT_SPEED, life: this._SHOT_LIFE, owner: "hunter" });
          e.cooldown = this._HUNTER_SHOT_CD;
        }
      } else if (e.type === "ranger") {
        if (dist < this._RANGER_MIN) {
          tryMoveAir(e, mesh2, -dx, -dy, this._RANGER_SPEED, dt, this._RANGER_COLLIDER);
        } else if (dist > this._RANGER_MAX) {
          tryMoveAir(e, mesh2, dx, dy, this._RANGER_SPEED, dt, this._RANGER_COLLIDER);
        }
        if (e.cooldown <= 0 && dist > this._RANGER_MIN * 0.8 && lineOfSightAir(mesh2, e.x, e.y, ship.x, ship.y, this._LOS_STEP)) {
          const inv = 1 / (dist || 1);
          this.shots.push({ x: e.x, y: e.y, vx: dx * inv * this._SHOT_SPEED, vy: dy * inv * this._SHOT_SPEED, life: this._SHOT_LIFE, owner: "ranger" });
          e.cooldown = this._RANGER_SHOT_CD;
        }
      } else if (e.type === "crawler") {
        const [gx, gy] = airGradient(mesh2, e.x, e.y, 0.16);
        const nlen = Math.hypot(gx, gy);
        if (nlen > 1e-4) {
          const nx = gx / nlen;
          const ny = gy / nlen;
          const tx = -ny * e.dir;
          const ty = nx * e.dir;
          const step = this._CRAWLER_SPEED * dt;
          const txw = e.x + tx * step;
          const tyw = e.y + ty * step;
          if (!collidesAtOffsets(mesh2, txw, tyw, this._CRAWLER_COLLIDER)) {
            e.x = txw;
            e.y = tyw;
          }
          const nudged = nudgeTowardSurface(mesh2, e.x, e.y);
          if (!collidesAtOffsets(mesh2, nudged[0], nudged[1], this._CRAWLER_COLLIDER)) {
            e.x = nudged[0];
            e.y = nudged[1];
          }
        }
        if (dist <= this._DETONATE_RANGE) {
          e.fuse += dt;
          if (e.fuse >= this._DETONATE_FUSE) {
            this.explosions.push({ x: e.x, y: e.y, life: 0.5, owner: "crawler", radius: 1.1 });
            this.enemies.splice(i, 1);
          }
        } else {
          e.fuse = Math.max(0, e.fuse - dt * 0.5);
        }
      }
    }
  }
}
class GameLoop {
  /**
   * Main gameplay loop orchestrator.
   * @param {Object} deps
   * @param {typeof import("./config.js").CFG} deps.cfg
   * @param {import("./mapgen.js").MapGen} deps.mapgen
   * @param {import("./mesh.js").RingMesh} deps.mesh
   * @param {import("./rendering.js").Renderer} deps.renderer
   * @param {import("./input.js").Input} deps.input
   * @param {Ui} deps.ui
   * @param {HTMLCanvasElement} deps.canvas
   * @param {HTMLCanvasElement|null|undefined} deps.overlay
   * @param {HTMLElement} deps.hud
   */
  constructor({ cfg, mapgen: mapgen2, mesh: mesh2, renderer: renderer2, input: input2, ui, canvas: canvas2, hud: hud2, overlay }) {
    this.cfg = cfg;
    this.mapgen = mapgen2;
    this.mesh = mesh2;
    this.renderer = renderer2;
    this.input = input2;
    this.ui = ui;
    this.canvas = canvas2;
    this.hud = hud2;
    this.overlay = overlay || null;
    this.overlayCtx = this.overlay ? this.overlay.getContext("2d") : null;
    this.TERRAIN_PAD = 0.5;
    this.TERRAIN_MAX = cfg.RMAX + this.TERRAIN_PAD;
    this.SHIP_RADIUS = 0.7 * 0.28 * GAME.SHIP_SCALE;
    this.MINER_HEIGHT = 0.36 * GAME.MINER_SCALE;
    this.MINER_SURFACE_EPS = 0.01 * GAME.MINER_SCALE;
    this.SURFACE_EPS = Math.max(0.12, cfg.RMAX / 280);
    this.COLLISION_EPS = Math.max(0.18, cfg.RMAX / 240);
    this.MINER_HEAD_OFFSET = this.MINER_HEIGHT;
    this.MINER_FOOT_OFFSET = 0;
    this.ship = {
      x: 0,
      y: cfg.RMAX + 0.9,
      vx: 0,
      vy: 0,
      state: "flying",
      explodeT: 0,
      lastAir: 1
    };
    this.debris = [];
    this.playerShots = [];
    this.playerBombs = [];
    this.playerExplosions = [];
    this.minerPopups = [];
    this.lastAimWorld = null;
    this.PLAYER_SHOT_SPEED = 7.5;
    this.PLAYER_SHOT_LIFE = 1.2;
    this.PLAYER_SHOT_RADIUS = 0.22;
    this.PLAYER_BOMB_SPEED = 4.5;
    this.PLAYER_BOMB_LIFE = 3.2;
    this.PLAYER_BOMB_RADIUS = 0.35;
    this.PLAYER_BOMB_BLAST = 0.9;
    this.PLAYER_BOMB_DAMAGE = 1.2;
    this.level = 1;
    this.miners = [];
    this.minersRemaining = 0;
    this.minersDead = 0;
    this.minerCandidates = 0;
    this.enemies = new Enemies({ cfg, mapgen: mapgen2, mesh: mesh2 });
    this._spawnMiners();
    this.enemies.spawn(this._totalEnemiesForLevel(this.level), this.level);
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.fpsTime = this.lastTime;
    this.fpsFrames = 0;
    this.fps = 0;
    this.debugCollisions = GAME.DEBUG_COLLISION;
    this.debugCollisions = this.debugCollisions;
  }
  /**
   * @param {number} lvl
   * @returns {number}
   */
  _totalEnemiesForLevel(lvl) {
    return lvl <= 1 ? 0 : 2 * (lvl - 1);
  }
  /**
   * @returns {void}
   */
  _resetShip() {
    const cfg = this.cfg;
    this.ship.x = 0;
    this.ship.y = cfg.RMAX + 0.9;
    this.ship.vx = 0;
    this.ship.vy = 0;
    this.ship.state = "flying";
    this.ship.explodeT = 0;
    this.debris.length = 0;
    this.playerShots.length = 0;
    this.playerBombs.length = 0;
    this.playerExplosions.length = 0;
    this.minerPopups.length = 0;
    this.minersDead = 0;
  }
  /**
   * @returns {void}
   */
  _triggerCrash() {
    if (this.ship.state === "crashed") return;
    this.ship.state = "crashed";
    this.ship.explodeT = 0;
    this.ship.vx = 0;
    this.ship.vy = 0;
    this.debris.length = 0;
    const pieces = 10;
    for (let i = 0; i < pieces; i++) {
      const ang = Math.random() * Math.PI * 2;
      const sp = 1.5 + Math.random() * 2.5;
      this.debris.push({
        x: this.ship.x + Math.cos(ang) * 0.1,
        y: this.ship.y + Math.sin(ang) * 0.1,
        vx: this.ship.vx + Math.cos(ang) * sp,
        vy: this.ship.vy + Math.sin(ang) * sp,
        a: Math.random() * Math.PI * 2,
        w: (Math.random() - 0.5) * 4,
        life: 2.5 + Math.random() * 1.5
      });
    }
  }
  /**
   * @param {{x:number,y:number}|null|undefined} aim
   * @returns {{x:number,y:number}|null}
   */
  _toWorldFromAim(aim) {
    if (!aim) return null;
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    const xN = aim.x * 2 - 1;
    const yN = (1 - aim.y) * 2 - 1;
    const camRot = Math.atan2(this.ship.x, this.ship.y || 1e-6);
    const s = GAME.ZOOM / (this.cfg.RMAX + this.cfg.PAD);
    const aspect = w / h;
    const sx = s / aspect;
    const sy = s;
    const px = xN / sx;
    const py = yN / sy;
    const c = Math.cos(-camRot), s2 = Math.sin(-camRot);
    const wx = c * px - s2 * py + this.ship.x;
    const wy = s2 * px + c * py + this.ship.y;
    return { x: wx, y: wy };
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {void}
   */
  _applyBombImpact(x, y) {
    const candidates = [];
    const maxRing = Math.min(this.cfg.RMAX, this.mesh.rings.length - 1);
    for (let r = 0; r <= maxRing; r++) {
      const ring = this.mesh.rings[r];
      if (!ring) continue;
      for (const v of ring) {
        const dx = v.x - x;
        const dy = v.y - y;
        const d2 = dx * dx + dy * dy;
        candidates.push({ v, d2 });
      }
    }
    candidates.sort((a, b) => a.d2 - b.d2);
    let changed = false;
    for (let i = 0; i < 3 && i < candidates.length; i++) {
      const v = candidates[i].v;
      if (v.air <= 0.5) {
        v.air = 1;
        changed = true;
      }
    }
    if (changed) {
      const newAir = this.mesh.updateAirFlags(false);
      this.renderer.updateAir(newAir);
    }
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {void}
   */
  _applyBombDamage(x, y) {
    const r2 = this.PLAYER_BOMB_DAMAGE * this.PLAYER_BOMB_DAMAGE;
    if (this.ship.state !== "crashed") {
      const dx = this.ship.x - x;
      const dy = this.ship.y - y;
      if (dx * dx + dy * dy <= r2) {
        this._triggerCrash();
      }
    }
    for (let j = this.enemies.enemies.length - 1; j >= 0; j--) {
      const e = this.enemies.enemies[j];
      const dx = e.x - x;
      const dy = e.y - y;
      if (dx * dx + dy * dy <= r2) {
        this.enemies.enemies.splice(j, 1);
      }
    }
    for (let j = this.miners.length - 1; j >= 0; j--) {
      const m = this.miners[j];
      if (m.state === "boarded") continue;
      const dx = m.x - x;
      const dy = m.y - y;
      if (dx * dx + dy * dy <= r2) {
        this.miners.splice(j, 1);
        this.minersRemaining = Math.max(0, this.minersRemaining - 1);
        this.minersDead++;
      }
    }
  }
  /**
   * @template T
   * @param {T[]} items
   * @param {() => number} rand
   * @returns {void}
   */
  _shuffle(items, rand) {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const tmp = items[i];
      items[i] = items[j];
      items[j] = tmp;
    }
  }
  /**
   * @param {number} ang
   * @param {number} ringLen
   * @returns {number}
   */
  _angleToRingIndex(ang, ringLen) {
    let a = ang % (Math.PI * 2);
    if (a < 0) a += Math.PI * 2;
    return Math.round(a / (Math.PI * 2) * ringLen) % ringLen;
  }
  /**
   * Valid placement rule:
   * - On ring r: three consecutive air points with center at index i.
   * - On ring r-1: the center angle maps to two consecutive rock points (i-1,i+1 around mapped index).
   * @param {() => number} rand
   * @param {number} rMin
   * @param {number} rMax
   * @returns {{x:number,y:number,r:number,key:string}|null}
   */
  _sampleMinerCandidate(rand, rMin, rMax) {
    const r = Math.max(rMin, Math.min(rMax, rMin + rand() * (rMax - rMin)));
    const ri = Math.max(2, Math.min(this.cfg.RMAX - 1, Math.round(r)));
    const ring = this.mesh.rings[ri];
    const inner = this.mesh.rings[ri - 1];
    if (!ring || !inner || ring.length < 3 || inner.length < 3) return null;
    const i = Math.floor(rand() * ring.length);
    const i0 = (i - 1 + ring.length) % ring.length;
    const i2 = (i + 1) % ring.length;
    if (ring[i0].air <= 0.5 || ring[i].air <= 0.5 || ring[i2].air <= 0.5) return null;
    const x = ring[i].x;
    const y = ring[i].y;
    const ang = Math.atan2(y, x);
    const j = this._angleToRingIndex(ang, inner.length);
    const j0 = (j - 1 + inner.length) % inner.length;
    const j2 = (j + 1) % inner.length;
    if (inner[j0].air > 0.5 || inner[j].air > 0.5 || inner[j2].air > 0.5) return null;
    const base = inner[j];
    const len = Math.hypot(base.x, base.y) || 1;
    const upx = base.x / len;
    const upy = base.y / len;
    const midX = (base.x + x) * 0.5;
    const midY = (base.y + y) * 0.5;
    const lift = this.MINER_SURFACE_EPS;
    const baseX = midX + upx * lift;
    const baseY = midY + upy * lift;
    return { x: baseX, y: baseY, r: len, key: `${ri},${i}` };
  }
  /**
   * @returns {void}
   */
  _spawnMiners() {
    const count = GAME.MINERS_PER_LEVEL;
    const seed = this.mapgen.getWorld().seed + this.level * 97;
    const rand = mulberry32(seed);
    const rMin = 1;
    const rMax = this.cfg.RMAX - 0.8;
    const target = count * 3;
    const attempts = Math.max(200, count * 120);
    let candidates = [];
    for (let i = 0; i < attempts && candidates.length < target; i++) {
      const cand = this._sampleMinerCandidate(rand, rMin, rMax);
      if (cand) candidates.push(cand);
    }
    if (!candidates.length) {
      this.miners = [];
      this.minersRemaining = 0;
      this.minersDead = 0;
      this.minerCandidates = 0;
      return;
    }
    if (candidates.length > 1) {
      const seen = /* @__PURE__ */ new Set();
      const deduped = [];
      for (const c of candidates) {
        if (seen.has(c.key)) continue;
        seen.add(c.key);
        deduped.push(c);
      }
      candidates = deduped;
    }
    this.minerCandidates = candidates.length;
    this._shuffle(candidates, rand);
    const placed = [];
    const baseMinSep = GAME.MINER_MIN_SEP;
    let minSep = baseMinSep;
    const tryFill = () => {
      const minSep2 = minSep * minSep;
      for (const c of candidates) {
        if (placed.length >= count) break;
        let ok = true;
        for (const p of placed) {
          const dx = c.x - p.x;
          const dy = c.y - p.y;
          if (dx * dx + dy * dy < minSep2) {
            ok = false;
            break;
          }
        }
        if (ok) placed.push(c);
      }
    };
    tryFill();
    if (placed.length < count && candidates.length < count * 2) {
      while (placed.length < count && minSep > 0.25) {
        minSep = Math.max(0.25, minSep * 0.7);
        tryFill();
      }
    }
    if (placed.length < count) {
      for (const c of candidates) {
        if (placed.length >= count) break;
        let exists = false;
        for (const p of placed) {
          if (p === c || p.x === c.x && p.y === c.y) {
            exists = true;
            break;
          }
        }
        if (!exists) placed.push(c);
      }
    }
    this.miners = placed.map((p) => ({ x: p.x, y: p.y, state: "idle" }));
    this.minersRemaining = this.miners.length;
    this.minersDead = 0;
  }
  /**
   * @param {number} seed
   * @param {boolean} advanceLevel
   * @returns {void}
   */
  _beginLevel(seed, advanceLevel) {
    this.mapgen.regenWorld(seed);
    const newAir = this.mesh.updateAirFlags();
    this.renderer.updateAir(newAir);
    this._resetShip();
    this.playerExplosions.length = 0;
    if (advanceLevel) this.level++;
    this._spawnMiners();
    this.enemies.spawn(this._totalEnemiesForLevel(this.level), this.level);
    this.minerPopups.length = 0;
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {Array<[number, number]>}
   */
  _shipCollisionPoints(x, y) {
    const camRot = Math.atan2(x, y || 1e-6);
    const shipRot = -camRot;
    const shipHWorld = 0.7 * GAME.SHIP_SCALE;
    const shipWWorld = 0.5 * GAME.SHIP_SCALE;
    const nose = shipHWorld * 0.6;
    const tail = shipHWorld * 0.4;
    const local = [
      [0, nose],
      [shipWWorld * 0.6, -tail],
      [-shipWWorld * 0.6, -tail]
    ];
    const verts = [];
    const c = Math.cos(shipRot), s = Math.sin(shipRot);
    for (const [lx, ly] of local) {
      const wx = c * lx - s * ly;
      const wy = s * lx + c * ly;
      verts.push([x + wx, y + wy]);
    }
    return [
      verts[0],
      verts[1],
      verts[2],
      [(verts[0][0] + verts[1][0]) * 0.5, (verts[0][1] + verts[1][1]) * 0.5],
      [(verts[1][0] + verts[2][0]) * 0.5, (verts[1][1] + verts[2][1]) * 0.5],
      [(verts[2][0] + verts[0][0]) * 0.5, (verts[2][1] + verts[0][1]) * 0.5]
    ];
  }
  /**
   * @param {number} px
   * @param {number} py
   * @param {number} ax
   * @param {number} ay
   * @param {number} bx
   * @param {number} by
   * @returns {number}
   */
  _distPointToSegment(px, py, ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    const denom = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / denom));
    const cx = ax + dx * t;
    const cy = ay + dy * t;
    return Math.hypot(px - cx, py - cy);
  }
  /**
   * @param {number} px
   * @param {number} py
   * @param {number} shipX
   * @param {number} shipY
   * @returns {number}
   */
  _shipHullDistance(px, py, shipX, shipY) {
    const camRot = Math.atan2(shipX, shipY || 1e-6);
    const shipRot = -camRot;
    const shipHWorld = 0.7 * GAME.SHIP_SCALE;
    const shipWWorld = 0.5 * GAME.SHIP_SCALE;
    const nose = shipHWorld * 0.6;
    const tail = shipHWorld * 0.4;
    const local = [
      [0, nose],
      [shipWWorld * 0.6, -tail],
      [0, -tail * 0.6],
      [-shipWWorld * 0.6, -tail]
    ];
    const c = Math.cos(shipRot);
    const s = Math.sin(shipRot);
    const verts = local.map(([lx, ly]) => {
      const wx = c * lx - s * ly;
      const wy = s * lx + c * ly;
      return [shipX + wx, shipY + wy];
    });
    let best = Infinity;
    for (let i = 0; i < verts.length; i++) {
      const a = verts[i];
      const b = verts[(i + 1) % verts.length];
      const d = this._distPointToSegment(px, py, a[0], a[1], b[0], b[1]);
      if (d < best) best = d;
    }
    return best;
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} shipRadius
   * @returns {boolean}
   */
  _shipCollidesAt(x, y, shipRadius) {
    const rCenter = Math.hypot(x, y);
    if (rCenter - shipRadius > this.TERRAIN_MAX) return false;
    const samples = this._shipCollisionPoints(x, y);
    samples.push([x, y]);
    return collidesAtWorldPoints(this.mesh, samples);
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  _minerCollidesAt(x, y) {
    const r = Math.hypot(x, y) || 1;
    const upx = x / r;
    const upy = y / r;
    const footX = x + upx * this.MINER_FOOT_OFFSET;
    const footY = y + upy * this.MINER_FOOT_OFFSET;
    const headX = x + upx * this.MINER_HEAD_OFFSET;
    const headY = y + upy * this.MINER_HEAD_OFFSET;
    return collidesAtWorldPoints(this.mesh, [
      [footX, footY],
      [headX, headY]
    ]);
  }
  /**
   * @param {number} dt
   * @param {ReturnType<import("./input.js").Input["update"]>} inputState
   * @returns {void}
   */
  _step(dt, inputState) {
    const { left, right, thrust, down, reset, shoot, bomb, aim, aimShoot, aimBomb, aimShootFrom, aimShootTo, aimBombFrom, aimBombTo } = inputState;
    if (reset) this._resetShip();
    const aimWorldShoot = this._toWorldFromAim(aimShoot || aim);
    const aimWorldBomb = this._toWorldFromAim(aimBomb || aimShoot || aim);
    let aimWorld = aimShootTo && this._toWorldFromAim(aimShootTo) || aimWorldShoot || aimBombTo && this._toWorldFromAim(aimBombTo) || aimWorldBomb;
    if (aimShootFrom && aimShootTo || aimBombFrom && aimBombTo) {
      const from = aimShootFrom || aimBombFrom;
      const to = aimShootTo || aimBombTo;
      const wFrom = from ? this._toWorldFromAim(from) : null;
      const wTo = to ? this._toWorldFromAim(to) : null;
      if (wFrom && wTo) {
        const dx = wTo.x - wFrom.x;
        const dy = wTo.y - wFrom.y;
        const dist = Math.hypot(dx, dy) || 1;
        const dirx = dx / dist;
        const diry = dy / dist;
        const aimLen = 4;
        aimWorld = { x: this.ship.x + dirx * aimLen, y: this.ship.y + diry * aimLen };
      }
    }
    this.lastAimWorld = aimWorld;
    if (this.ship.state === "flying") {
      let ax = 0, ay = 0;
      const r = Math.hypot(this.ship.x, this.ship.y) || 1;
      const rx = this.ship.x / r;
      const ry = this.ship.y / r;
      const tx = -ry;
      const ty = rx;
      if (left) {
        ax += tx * GAME.THRUST;
        ay += ty * GAME.THRUST;
      }
      if (right) {
        ax -= tx * GAME.THRUST;
        ay -= ty * GAME.THRUST;
      }
      if (thrust) {
        ax += rx * GAME.THRUST;
        ay += ry * GAME.THRUST;
      }
      if (down) {
        ax += -rx * GAME.THRUST;
        ay += -ry * GAME.THRUST;
      }
      ax += -this.ship.x / r * GAME.GRAVITY;
      ay += -this.ship.y / r * GAME.GRAVITY;
      this.ship.vx += ax * dt;
      this.ship.vy += ay * dt;
      const drag = Math.max(0, 1 - GAME.DRAG * dt);
      this.ship.vx *= drag;
      this.ship.vy *= drag;
      const vt = this.ship.vx * tx + this.ship.vy * ty;
      const vtMax = GAME.MAX_TANGENTIAL_SPEED;
      if (Math.abs(vt) > vtMax) {
        const excess = vt - Math.sign(vt) * vtMax;
        this.ship.vx -= tx * excess;
        this.ship.vy -= ty * excess;
      }
      this.ship.x += this.ship.vx * dt;
      this.ship.y += this.ship.vy * dt;
      const speed = Math.hypot(this.ship.vx, this.ship.vy);
      const eps = this.COLLISION_EPS;
      const shipRadius = this.SHIP_RADIUS;
      let collides = false;
      const samples = [];
      let hit = null;
      const rCenter = Math.hypot(this.ship.x, this.ship.y);
      if (rCenter - shipRadius <= this.TERRAIN_MAX) {
        for (const [sx, sy] of this._shipCollisionPoints(this.ship.x, this.ship.y)) {
          const av = this.mesh.airValueAtWorld(sx, sy);
          const air = av > 0.5;
          samples.push([sx, sy, air, av]);
          if (!air) {
            collides = true;
            if (!hit) hit = { x: sx, y: sy };
          }
        }
      }
      this.ship._samples = samples;
      this.ship._shipRadius = shipRadius;
      if (hit) {
        this.ship._collision = {
          x: hit.x,
          y: hit.y,
          tri: this.mesh.findTriAtWorld(hit.x, hit.y),
          node: this.mesh.nearestNodeOnRing(hit.x, hit.y)
        };
      } else {
        this.ship._collision = null;
      }
      if (collides) {
        const gdx = this.mesh.airValueAtWorld(this.ship.x + eps, this.ship.y) - this.mesh.airValueAtWorld(this.ship.x - eps, this.ship.y);
        const gdy = this.mesh.airValueAtWorld(this.ship.x, this.ship.y + eps) - this.mesh.airValueAtWorld(this.ship.x, this.ship.y - eps);
        let nx = gdx;
        let ny = gdy;
        let nlen = Math.hypot(nx, ny);
        if (nlen < 1e-4) {
          const c = this.ship._collision;
          if (c) {
            nx = this.ship.x - c.x;
            ny = this.ship.y - c.y;
            nlen = Math.hypot(nx, ny);
          }
        }
        if (nlen < 1e-4) {
          nx = this.ship.x;
          ny = this.ship.y;
          nlen = Math.hypot(nx, ny) || 1;
        }
        nx /= nlen;
        ny /= nlen;
        const camRot = Math.atan2(this.ship.x, this.ship.y || 1e-6);
        const upx = Math.sin(camRot);
        const upy = Math.cos(camRot);
        const dotUp = nx * upx + ny * upy;
        const vn = this.ship.vx * nx + this.ship.vy * ny;
        const impactSpeed = Math.max(0, -vn);
        const resolvePenetration = () => {
          const maxSteps = 8;
          const stepSize = shipRadius * 0.2;
          for (let i = 0; i < maxSteps; i++) {
            if (!this._shipCollidesAt(this.ship.x, this.ship.y, shipRadius)) break;
            this.ship.x += nx * stepSize;
            this.ship.y += ny * stepSize;
          }
        };
        if (impactSpeed <= GAME.LAND_SPEED && vn < -0.05 && dotUp >= GAME.SURFACE_DOT) {
          this.ship.state = "landed";
          this.ship.vx = 0;
          this.ship.vy = 0;
          resolvePenetration();
        } else if (impactSpeed >= GAME.CRASH_SPEED) {
          this._triggerCrash();
        } else {
          if (impactSpeed <= GAME.LAND_SPEED && vn < -0.05 && dotUp >= GAME.SURFACE_DOT) {
            this.ship.vx -= nx * GAME.LAND_PULL * dt;
            this.ship.vy -= ny * GAME.LAND_PULL * dt;
            const tx2 = -ny;
            const ty2 = nx;
            const vt2 = this.ship.vx * tx2 + this.ship.vy * ty2;
            this.ship.vx -= vt2 * tx2 * GAME.LAND_FRICTION * dt;
            this.ship.vy -= vt2 * ty2 * GAME.LAND_FRICTION * dt;
            resolvePenetration();
          } else if (vn < 0) {
            const restitution = GAME.BOUNCE_RESTITUTION;
            this.ship.vx -= (1 + restitution) * vn * nx;
            this.ship.vy -= (1 + restitution) * vn * ny;
            const fast = speed >= GAME.LAND_SPEED * 1.2;
            const push = shipRadius * (fast ? GAME.COLLIDE_PUSH_FAST : 0.02);
            this.ship.x += nx * push;
            this.ship.y += ny * push;
            resolvePenetration();
          }
        }
      }
    }
    if (this.ship.state !== "crashed") {
      if (shoot) {
        let dirx = 0, diry = 0;
        if (aimShootFrom && aimShootTo) {
          const wFrom = this._toWorldFromAim(aimShootFrom);
          const wTo = this._toWorldFromAim(aimShootTo);
          if (wFrom && wTo) {
            const dx = wTo.x - wFrom.x;
            const dy = wTo.y - wFrom.y;
            const dist = Math.hypot(dx, dy) || 1;
            dirx = dx / dist;
            diry = dy / dist;
          }
        } else if (aimWorldShoot) {
          const dx = aimWorldShoot.x - this.ship.x;
          const dy = aimWorldShoot.y - this.ship.y;
          const dist = Math.hypot(dx, dy) || 1;
          dirx = dx / dist;
          diry = dy / dist;
        }
        if (dirx || diry) {
          this.playerShots.push({
            x: this.ship.x + dirx * 0.45,
            y: this.ship.y + diry * 0.45,
            vx: dirx * this.PLAYER_SHOT_SPEED,
            vy: diry * this.PLAYER_SHOT_SPEED,
            life: this.PLAYER_SHOT_LIFE
          });
        }
      }
      if (bomb) {
        let dirx = 0, diry = 0;
        if (aimBombFrom && aimBombTo) {
          const wFrom = this._toWorldFromAim(aimBombFrom);
          const wTo = this._toWorldFromAim(aimBombTo);
          if (wFrom && wTo) {
            const dx = wTo.x - wFrom.x;
            const dy = wTo.y - wFrom.y;
            const dist = Math.hypot(dx, dy) || 1;
            dirx = dx / dist;
            diry = dy / dist;
          }
        } else if (aimWorldBomb) {
          const dx = aimWorldBomb.x - this.ship.x;
          const dy = aimWorldBomb.y - this.ship.y;
          const dist = Math.hypot(dx, dy) || 1;
          dirx = dx / dist;
          diry = dy / dist;
        }
        if (dirx || diry) {
          this.playerBombs.push({
            x: this.ship.x + dirx * 0.45,
            y: this.ship.y + diry * 0.45,
            vx: dirx * this.PLAYER_BOMB_SPEED,
            vy: diry * this.PLAYER_BOMB_SPEED,
            life: this.PLAYER_BOMB_LIFE
          });
        }
      }
    }
    if (this.playerShots.length) {
      for (let i = this.playerShots.length - 1; i >= 0; i--) {
        const s = this.playerShots[i];
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= dt;
        if (s.life <= 0 || this.mesh.airValueAtWorld(s.x, s.y) <= 0.5) {
          this.playerShots.splice(i, 1);
          continue;
        }
        for (let j = this.enemies.enemies.length - 1; j >= 0; j--) {
          const e = this.enemies.enemies[j];
          const dx = e.x - s.x;
          const dy = e.y - s.y;
          if (dx * dx + dy * dy <= this.PLAYER_SHOT_RADIUS * this.PLAYER_SHOT_RADIUS) {
            e.hp -= 1;
            this.playerShots.splice(i, 1);
            if (e.hp <= 0) this.enemies.enemies.splice(j, 1);
            break;
          }
        }
        if (i >= this.playerShots.length) continue;
        for (let j = this.miners.length - 1; j >= 0; j--) {
          const m = this.miners[j];
          if (m.state === "boarded") continue;
          const dx = m.x - s.x;
          const dy = m.y - s.y;
          if (dx * dx + dy * dy <= this.PLAYER_SHOT_RADIUS * this.PLAYER_SHOT_RADIUS) {
            this.miners.splice(j, 1);
            this.minersRemaining = Math.max(0, this.minersRemaining - 1);
            this.minersDead++;
            this.playerShots.splice(i, 1);
            break;
          }
        }
      }
    }
    if (this.playerBombs.length) {
      for (let i = this.playerBombs.length - 1; i >= 0; i--) {
        const b = this.playerBombs[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.life -= dt;
        let hit = false;
        if (b.life <= 0 || this.mesh.airValueAtWorld(b.x, b.y) <= 0.5) {
          hit = true;
        } else {
          for (let j = this.enemies.enemies.length - 1; j >= 0; j--) {
            const e = this.enemies.enemies[j];
            const dx = e.x - b.x;
            const dy = e.y - b.y;
            if (dx * dx + dy * dy <= this.PLAYER_BOMB_RADIUS * this.PLAYER_BOMB_RADIUS) {
              this.enemies.enemies.splice(j, 1);
              hit = true;
              break;
            }
          }
          if (!hit) {
            for (let j = this.miners.length - 1; j >= 0; j--) {
              const m = this.miners[j];
              if (m.state === "boarded") continue;
              const dx = m.x - b.x;
              const dy = m.y - b.y;
              if (dx * dx + dy * dy <= this.PLAYER_BOMB_RADIUS * this.PLAYER_BOMB_RADIUS) {
                this.miners.splice(j, 1);
                this.minersRemaining = Math.max(0, this.minersRemaining - 1);
                this.minersDead++;
                hit = true;
                break;
              }
            }
          }
        }
        if (hit) {
          this.playerBombs.splice(i, 1);
          this._applyBombImpact(b.x, b.y);
          this._applyBombDamage(b.x, b.y);
          this.playerExplosions.push({ x: b.x, y: b.y, life: 0.8, radius: this.PLAYER_BOMB_BLAST });
        }
      }
    }
    if (this.playerExplosions.length) {
      for (let i = this.playerExplosions.length - 1; i >= 0; i--) {
        this.playerExplosions[i].life -= dt;
        if (this.playerExplosions[i].life <= 0) this.playerExplosions.splice(i, 1);
      }
    }
    if (this.miners.length) {
      const landed = this.ship.state === "landed";
      for (const miner of this.miners) {
        if (miner.state === "boarded") continue;
        const dx = this.ship.x - miner.x;
        const dy = this.ship.y - miner.y;
        const dist = Math.hypot(dx, dy);
        if (landed && dist <= GAME.MINER_CALL_RADIUS) {
          miner.state = "running";
        } else if (!landed && miner.state === "running") {
          miner.state = "idle";
        }
        if (landed && miner.state === "running") {
          const speed = GAME.MINER_RUN_SPEED;
          const stepLen = speed * dt;
          const inv = 1 / (dist || 1);
          const dirx = dx * inv;
          const diry = dy * inv;
          const tryMove = (tx, ty) => {
            const nx = miner.x + tx * stepLen;
            const ny = miner.y + ty * stepLen;
            if (!this._minerCollidesAt(nx, ny)) {
              miner.x = nx;
              miner.y = ny;
              return true;
            }
            return false;
          };
          if (!tryMove(dirx, diry)) {
            const r2 = Math.hypot(miner.x, miner.y) || 1;
            const upx2 = miner.x / r2;
            const upy2 = miner.y / r2;
            const dotUp = dirx * upx2 + diry * upy2;
            const tx = dirx - upx2 * dotUp;
            const ty = diry - upy2 * dotUp;
            const tlen = Math.hypot(tx, ty);
            if (tlen > 1e-4) {
              const tnx = tx / tlen;
              const tny = ty / tlen;
              if (!tryMove(tnx, tny)) {
                tryMove(-tnx, -tny);
              }
            }
          }
        }
        const r = Math.hypot(miner.x, miner.y) || 1;
        const upx = miner.x / r;
        const upy = miner.y / r;
        const headX = miner.x + upx * this.MINER_HEAD_OFFSET;
        const headY = miner.y + upy * this.MINER_HEAD_OFFSET;
        const hullDist = this._shipHullDistance(headX, headY, this.ship.x, this.ship.y);
        if (landed && hullDist <= GAME.MINER_BOARD_RADIUS) {
          miner.state = "boarded";
          this.minersRemaining = Math.max(0, this.minersRemaining - 1);
          const tx = -upy;
          const ty = upx;
          const jitter = (Math.random() * 2 - 1) * GAME.MINER_POPUP_TANGENTIAL;
          this.minerPopups.push({
            x: miner.x + upx * 0.1,
            y: miner.y + upy * 0.1,
            vx: upx * GAME.MINER_POPUP_SPEED + tx * jitter,
            vy: upy * GAME.MINER_POPUP_SPEED + ty * jitter,
            life: GAME.MINER_POPUP_LIFE
          });
        }
      }
    }
    if (this.minerPopups.length) {
      for (let i = this.minerPopups.length - 1; i >= 0; i--) {
        const p = this.minerPopups[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0) this.minerPopups.splice(i, 1);
      }
    }
    if (this.debris.length) {
      for (let i = this.debris.length - 1; i >= 0; i--) {
        const d = this.debris[i];
        const r = Math.hypot(d.x, d.y) || 1;
        d.vx += -d.x / r * GAME.GRAVITY * dt;
        d.vy += -d.y / r * GAME.GRAVITY * dt;
        d.vx *= Math.max(0, 1 - GAME.DRAG * dt);
        d.vy *= Math.max(0, 1 - GAME.DRAG * dt);
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.a += d.w * dt;
        d.life -= dt;
        if (d.life <= 0) this.debris.splice(i, 1);
      }
    }
    this.enemies.update(this.ship, dt);
    if (this.ship.state !== "crashed") {
      for (let i = this.enemies.shots.length - 1; i >= 0; i--) {
        const s = this.enemies.shots[i];
        const dx = this.ship.x - s.x;
        const dy = this.ship.y - s.y;
        if (dx * dx + dy * dy <= this.SHIP_RADIUS * this.SHIP_RADIUS) {
          this.enemies.shots.splice(i, 1);
          this._triggerCrash();
          break;
        }
      }
    }
    if (this.ship.state !== "crashed" && this.enemies.explosions.length) {
      for (const ex of this.enemies.explosions) {
        const r = ex.radius ?? 1;
        const dx = this.ship.x - ex.x;
        const dy = this.ship.y - ex.y;
        if (dx * dx + dy * dy <= r * r) {
          this._triggerCrash();
          break;
        }
      }
    }
    if (this.ship.state === "landed") {
      if (left || right || thrust) {
        this.ship.state = "flying";
      }
    }
  }
  /**
   * @returns {void}
   */
  _frame() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.lastTime) / 1e3);
    this.lastTime = now;
    this.accumulator += dt;
    const inputState = this.input.update();
    if (this.ship.state === "crashed") {
      this.ship.explodeT = Math.min(1.2, this.ship.explodeT + dt * 0.9);
    }
    if (inputState.regen) {
      const nextSeed = this.mapgen.getWorld().seed + 1;
      this._beginLevel(nextSeed, false);
    }
    if (inputState.nextLevel) {
      const nextSeed = this.mapgen.getWorld().seed + 1;
      this._beginLevel(nextSeed, true);
    }
    if (inputState.toggleDebug) {
      this.debugCollisions = !this.debugCollisions;
    }
    const fixed = 1 / 60;
    const maxSteps = 4;
    let steps = 0;
    while (this.accumulator >= fixed && steps < maxSteps) {
      this._step(fixed, inputState);
      this.accumulator -= fixed;
      steps++;
    }
    if (this.minersRemaining === 0 && this.ship.state === "flying") {
      const r = Math.hypot(this.ship.x, this.ship.y);
      if (r > this.cfg.RMAX + GAME.EXIT_MARGIN) {
        const nextSeed = this.mapgen.getWorld().seed + 1;
        this._beginLevel(nextSeed, true);
      }
    }
    this.fpsFrames++;
    if (now - this.fpsTime >= 500) {
      this.fps = Math.round(this.fpsFrames * 1e3 / (now - this.fpsTime));
      this.fpsFrames = 0;
      this.fpsTime = now;
    }
    this.renderer.drawFrame({
      ship: this.ship,
      debris: this.debris,
      input: inputState,
      debugCollisions: this.debugCollisions,
      debugNodes: GAME.DEBUG_NODES,
      fps: this.fps,
      finalAir: this.mapgen.getWorld().finalAir,
      miners: this.miners,
      minersRemaining: this.minersRemaining,
      level: this.level,
      minersDead: this.minersDead,
      enemies: this.enemies.enemies,
      shots: this.enemies.shots,
      explosions: this.enemies.explosions,
      enemyDebris: this.enemies.debris,
      playerShots: this.playerShots,
      playerBombs: this.playerBombs,
      playerExplosions: this.playerExplosions,
      aimWorld: this.lastAimWorld,
      touchUi: inputState.touchUi
    }, this.mesh);
    this._drawMinerPopups();
    this.ui.updateHud(this.hud, {
      fps: this.fps,
      state: this.ship.state,
      speed: Math.hypot(this.ship.vx, this.ship.vy),
      verts: this.mesh.vertCount,
      air: this.mapgen.getWorld().finalAir,
      miners: this.minersRemaining,
      minersDead: this.minersDead,
      level: this.level,
      debug: this.debugCollisions,
      minerCandidates: this.minerCandidates
    });
    requestAnimationFrame(() => this._frame());
  }
  /**
   * @returns {void}
   */
  start() {
    requestAnimationFrame(() => this._frame());
  }
  /**
   * @returns {void}
   */
  _drawMinerPopups() {
    if (!this.overlay || !this.overlayCtx) {
      return;
    }
    const ctx = this.overlayCtx;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = Math.floor(this.overlay.clientWidth * dpr);
    const h = Math.floor(this.overlay.clientHeight * dpr);
    if (this.overlay.width !== w || this.overlay.height !== h) {
      this.overlay.width = w;
      this.overlay.height = h;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    if (!this.minerPopups.length) {
      return;
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 ${Math.max(12, Math.round(16 * dpr))}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
    ctx.fillStyle = "rgba(255, 236, 170, 1)";
    const camRot = Math.atan2(this.ship.x, this.ship.y || 1e-6);
    const s = GAME.ZOOM / (this.cfg.RMAX + this.cfg.PAD);
    const sx = s / (w / h);
    const sy = s;
    const c = Math.cos(camRot), s2 = Math.sin(camRot);
    for (const p of this.minerPopups) {
      const t = Math.max(0, Math.min(1, p.life / GAME.MINER_POPUP_LIFE));
      const alpha = 0.9 * t;
      const dx = p.x - this.ship.x;
      const dy = p.y - this.ship.y;
      const rx = c * dx - s2 * dy;
      const ry = s2 * dx + c * dy;
      const px = (rx * sx * 0.5 + 0.5) * w;
      const py = (1 - (ry * sy * 0.5 + 0.5)) * h;
      ctx.globalAlpha = alpha;
      ctx.fillText("+1", px, py);
    }
    ctx.globalAlpha = 1;
  }
}
const canvas = (
  /** @type {HTMLCanvasElement} */
  document.getElementById("gl")
);
const hud = (
  /** @type {HTMLElement} */
  document.getElementById("hud")
);
const mapgen = new MapGen(CFG);
mapgen.regenWorld(CFG.seed);
const mesh = new RingMesh(CFG, mapgen);
const renderer = new Renderer(canvas, CFG, GAME);
renderer.setMesh(mesh);
const input = new Input(canvas);
const loop = new GameLoop({
  cfg: CFG,
  mapgen,
  mesh,
  renderer,
  input,
  ui: { updateHud },
  canvas,
  overlay: (
    /** @type {HTMLCanvasElement} */
    document.getElementById("overlay")
  ),
  hud
});
loop.start();
