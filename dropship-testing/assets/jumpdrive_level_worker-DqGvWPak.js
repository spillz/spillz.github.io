(function() {
  "use strict";
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
      const tmp = (
        /** @type {number} */
        p[i]
      );
      p[i] = /** @type {number} */
      p[j];
      p[j] = tmp;
    }
    const perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) perm[i] = /** @type {number} */
    p[i & 255];
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
        const gi0 = (
          /** @type {number} */
          this._perm[ii + /** @type {number} */
          this._perm[jj]] % 12
        );
        const g = (
          /** @type {[number, number]} */
          grad2[gi0]
        );
        t0 *= t0;
        n0 = t0 * t0 * (g[0] * x0 + g[1] * y0);
      }
      let t1 = 0.5 - x1 * x1 - y1 * y1;
      if (t1 > 0) {
        const gi1 = (
          /** @type {number} */
          this._perm[ii + i1 + /** @type {number} */
          this._perm[jj + j1]] % 12
        );
        const g = (
          /** @type {[number, number]} */
          grad2[gi1]
        );
        t1 *= t1;
        n1 = t1 * t1 * (g[0] * x1 + g[1] * y1);
      }
      let t2 = 0.5 - x2 * x2 - y2 * y2;
      if (t2 > 0) {
        const gi2 = (
          /** @type {number} */
          this._perm[ii + 1 + /** @type {number} */
          this._perm[jj + 1]] % 12
        );
        const g = (
          /** @type {[number, number]} */
          grad2[gi2]
        );
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
  const PLANET_SHADOW_THICKNESS = 0.05;
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
    // darker end of the interior rock gradient; normalized RGB
    ROCK_LIGHT: [138 / 255, 86 / 255, 49 / 255],
    // lighter end of the interior rock gradient; normalized RGB
    AIR_DARK: [43 / 255, 43 / 255, 43 / 255],
    // darker end of the cave-air gradient away from lit/open areas; normalized RGB
    AIR_LIGHT: [74 / 255, 74 / 255, 74 / 255],
    // lighter end of the cave-air gradient; normalized RGB
    EDGE_DARK: [20 / 255, 20 / 255, 20 / 255],
    // legacy dark edge color constant; normalized RGB
    TERRAIN_EDGE_AIR_OCCLUSION: 0.24,
    // strength of the rock-casts-into-air darkening band along cave walls
    TERRAIN_EDGE_AIR_BAND_WORLD: PLANET_SHADOW_THICKNESS,
    // world-space thickness of the air-side wall darkening band
    TERRAIN_EDGE_AIR_HARDNESS: 0,
    // 0 = soft falloff, 1 = hard cutoff for the air-side wall darkening
    TERRAIN_EDGE_ROCK_LIGHT: 0.14,
    // strength of the lightened highlight band on the rock side of the boundary
    TERRAIN_EDGE_ROCK_BAND_WORLD: 0.05,
    // world-space thickness of the rock-side highlight band
    TERRAIN_EDGE_ROCK_HARDNESS: 0,
    // 0 = soft falloff, 1 = hard cutoff for the rock-side highlight
    TERRAIN_EDGE_OUTWARD_BIAS: 0.8,
    // biases rock-side highlighting toward outward-facing walls near the surface
    DROPSHIP_OUTLINE_WORLD: PLANET_SHADOW_THICKNESS,
    // ship silhouette shell thickness in world units; ~0.01-0.08 typical
    DROPSHIP_OUTLINE_TOP: [22 / 255, 22 / 255, 24 / 255],
    // top color for the dark outer shell; normalized RGB
    DROPSHIP_OUTLINE_BOTTOM: [22 / 255, 22 / 255, 24 / 255],
    // bottom color for the dark outer shell; normalized RGB
    DROPSHIP_OUTLINE_ALPHA_TOP: 0.1,
    // top opacity for the dark outer shell; ~0.02-0.3 typical
    DROPSHIP_OUTLINE_ALPHA_BOTTOM: 0.4,
    // bottom opacity for the dark outer shell; ~0.1-0.5 typical
    DROPSHIP_HULL_TOP: [0.7, 0.72, 0.75],
    // top-of-hull gradient color; normalized RGB
    DROPSHIP_HULL_BOTTOM: [0.52, 0.55, 0.6],
    // bottom-of-hull gradient color; normalized RGB
    DROPSHIP_WINDOW_COLOR: [0.08, 0.1, 0.13],
    // cockpit/window fill color; normalized RGB
    DROPSHIP_GUN_TOP: [0.42, 0.45, 0.5],
    // top-of-gun gradient color; normalized RGB
    DROPSHIP_GUN_BOTTOM: [0.18, 0.2, 0.24],
    // bottom-of-gun gradient color; normalized RGB
    DROPSHIP_GUN_OUTLINE_TOP: [42 / 255, 42 / 255, 45 / 255],
    // top outline color for the gun; normalized RGB
    DROPSHIP_GUN_OUTLINE_BOTTOM: [16 / 255, 16 / 255, 18 / 255],
    // bottom outline color for the gun; normalized RGB
    DROPSHIP_HULL_SHEEN_ALPHA: 0.1,
    // centerline highlight strength; ~0-0.25 typical
    DROPSHIP_HULL_SHEEN_FALLOFF: 8,
    // centerline highlight tightness across X; ~3-14 typical
    STAR_SATURATION: 2
    //1 = baseline, >1 more intense colors
  });
  class MapGen {
    /**
     * Create a map generator.
     * @param {number} seed
     * @param {import("./planet_config.js").PlanetParams} params
     * @param {MapWorld|null} [prebuiltWorld]
     */
    constructor(seed, params, prebuiltWorld = null) {
      this.params = params;
      const G = CFG.GRID;
      const worldMin = -(params.RMAX + params.PAD);
      const worldMax = +(params.RMAX + params.PAD);
      const worldSize = worldMax - worldMin;
      const cell = worldSize / G;
      const R2 = params.RMAX * params.RMAX;
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
      this.noise = new Noise(seed);
      this._wx = new Float32Array(G * G);
      this._wy = new Float32Array(G * G);
      this._caveNoise = new Float32Array(G * G);
      this._veinNoise = new Float32Array(G * G);
      this._current = { seed, air: new Uint8Array(G * G), entrances: [], finalAir: 0 };
      if (prebuiltWorld) {
        this._current = normalizeMapWorld(prebuiltWorld, G, seed);
        this._overwriteOuterAirRing(this._current.air);
      } else {
        this.regenWorld(seed);
      }
    }
    /**
     * @param {Uint8Array} field
     * @param {number} i
     * @param {number} j
     * @param {Vec2[]} dirs
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
      const coreR = this.params.CORE_RADIUS > 1 ? this.params.CORE_RADIUS : this.params.CORE_RADIUS * this.params.RMAX;
      const coreR2 = coreR * coreR;
      const shellR = this._surfaceShellRadius();
      const shellR2 = shellR * shellR;
      const [ix0, iy0] = toGrid(cx - radius, cy - radius);
      const [ix1, iy1] = toGrid(cx + radius, cy + radius);
      const x0 = Math.max(0, ix0), y0 = Math.max(0, iy0);
      const x1 = Math.min(G - 1, ix1), y1 = Math.min(G - 1, iy1);
      for (let j = y0; j <= y1; j++) for (let i = x0; i <= x1; i++) {
        const k = idx(i, j);
        if (!inside[k]) continue;
        const [x, y] = toWorld(i, j);
        if (coreR > 0 && x * x + y * y <= coreR2) continue;
        if (!val && x * x + y * y >= shellR2) continue;
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
        const x = (
          /** @type {number} */
          qx[qh]
        );
        const y = (
          /** @type {number} */
          qy[qh]
        );
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
      const p = this.params;
      const entrances = [];
      for (let e = 0; e < p.ENTRANCES; e++) {
        const th = e / p.ENTRANCES * 2 * Math.PI + (rand() - 0.5) * CFG.ENTRANCE_ANGLE_JITTER;
        entrances.push([(p.RMAX - 0.05) * Math.cos(th), (p.RMAX - 0.05) * Math.sin(th)]);
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
          const v = (
            /** @type {number} */
            this._caveNoise[k] > mid ? 1 : 0
          );
          air[k] = v;
          a += v;
        }
        const frac = a / ins;
        if (frac > targetInitialAir) lo = mid;
        else hi = mid;
      }
      for (let s = 0; s < p.CA_STEPS; s++) {
        const next = new Uint8Array(air);
        for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
          const k = idx(i, j);
          if (!inside[k]) continue;
          const n8 = this._countN(air, i, j, this._dirs8);
          if (air[k]) next[k] = n8 >= p.AIR_KEEP_N8 ? 1 : 0;
          else next[k] = n8 >= p.ROCK_TO_AIR_N8 ? 1 : 0;
        }
        air = next;
      }
      let veins = new Uint8Array(G * G);
      for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
        const k = idx(i, j);
        if (!inside[k]) continue;
        const [x, y] = toWorld(i, j);
        const r = Math.hypot(x, y) / p.RMAX;
        let mid = 1 - Math.abs(r - 0.6) / 0.6;
        mid = Math.max(0, Math.min(1, mid));
        if (
          /** @type {number} */
          this._veinNoise[k] > p.VEIN_THRESH && mid > CFG.VEIN_MID_MIN
        ) veins[k] = 1;
      }
      veins = this._dilate(veins, p.VEIN_DILATE);
      for (let k = 0; k < G * G; k++) {
        if (veins[k]) air[k] = 0;
      }
      for (const [ex, ey] of entrances) {
        this._carveDisk(air, ex, ey, p.ENTRANCE_OUTER, 1);
        this._carveDisk(air, ex * 0.97, ey * 0.97, p.ENTRANCE_INNER, 1);
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
      const p = this.params;
      const rand = mulberry32(seed);
      this.noise.setSeed(seed);
      if (p.NO_CAVES) {
        const air = new Uint8Array(G * G);
        for (let k = 0; k < air.length; k++) {
          if (!inside[k]) continue;
          air[k] = 0;
        }
        const topoDepth = p.TOPO_BAND && p.TOPO_BAND > 0 ? p.TOPO_BAND : Math.max(1.5, p.RMAX * 0.18);
        this._carveNoCavesTopography(
          air,
          topoDepth,
          p.TOPO_FREQ || 1.4,
          p.TOPO_OCTAVES || 4,
          typeof p.TOPO_AMP === "number" ? p.TOPO_AMP : topoDepth * 0.65
        );
        if (p.EXCAVATE_RINGS && p.EXCAVATE_RING_THICKNESS > 0) {
          this._carveRings(air, rand, p.EXCAVATE_RINGS, p.EXCAVATE_RING_THICKNESS);
        }
        this._overwriteOuterAirRing(air);
        this._current = { seed, air, entrances: [], finalAir: 0 };
        return this._current;
      }
      this._wx = new Float32Array(G * G);
      this._wy = new Float32Array(G * G);
      for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
        const k = idx(i, j);
        if (!inside[k]) continue;
        const [x, y] = toWorld(i, j);
        this._wx[k] = this.noise.fbm(x * p.WARP_F, y * p.WARP_F, 3, 0.6, 2);
        this._wy[k] = this.noise.fbm((x + 19.3) * p.WARP_F, (y - 11.7) * p.WARP_F, 3, 0.6, 2);
      }
      this._caveNoise = new Float32Array(G * G);
      this._veinNoise = new Float32Array(G * G);
      for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
        const k = idx(i, j);
        if (!inside[k]) continue;
        const [x, y] = toWorld(i, j);
        const xw = x + p.WARP_A * /** @type {number} */
        this._wx[k];
        const yw = y + p.WARP_A * /** @type {number} */
        this._wy[k];
        const chambers = 0.5 + 0.5 * this.noise.fbm(xw * p.BASE_F * 0.8, yw * p.BASE_F * 0.8, 4, 0.55, 2);
        const corridors = this.noise.ridged(xw * p.BASE_F * 1.35, yw * p.BASE_F * 1.35, 4, 0.55, 2.05);
        this._caveNoise[k] = 0.45 * chambers + 0.55 * corridors;
        this._veinNoise[k] = this.noise.ridged(xw * p.VEIN_F, yw * p.VEIN_F, 3, 0.6, 2.2);
      }
      let best = 0.6;
      let bestDiff = 1e9;
      let bestWorld = null;
      for (const g of [0.58, 0.6, 0.62, 0.64, 0.66, 0.68, 0.7]) {
        const w = this._buildWorld(g, rand);
        const frac = this._fractionAir(w.air);
        const d = Math.abs(frac - p.TARGET_FINAL_AIR);
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
        const d = Math.abs(frac - p.TARGET_FINAL_AIR);
        if (d < bestDiff) {
          bestDiff = d;
          best = g;
          bestWorld = w;
        }
      }
      const finalAir = bestWorld ? this._fractionAir(bestWorld.air) : 0;
      const airFinal = bestWorld ? bestWorld.air : new Uint8Array(G * G);
      const coreR = p.CORE_RADIUS > 1 ? p.CORE_RADIUS : p.CORE_RADIUS * p.RMAX;
      if (coreR > 0) {
        const coreR2 = coreR * coreR;
        for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
          const k = idx(i, j);
          if (!inside[k]) continue;
          const [x, y] = toWorld(i, j);
          if (x * x + y * y <= coreR2) airFinal[k] = 0;
        }
      }
      const moltenInner = typeof p.MOLTEN_RING_INNER === "number" ? Math.max(0, p.MOLTEN_RING_INNER) : 0;
      const moltenOuter = typeof p.MOLTEN_RING_OUTER === "number" ? p.MOLTEN_RING_OUTER : 0;
      if (moltenOuter > moltenInner) {
        const r0 = moltenInner;
        const r1 = moltenOuter;
        const r02 = r0 * r0;
        const r12 = r1 * r1;
        for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
          const k = idx(i, j);
          if (!inside[k]) continue;
          const [x, y] = toWorld(i, j);
          const rr = x * x + y * y;
          if (rr >= r02 && rr <= r12) {
            airFinal[k] = 1;
          }
        }
        if (r0 > 0) {
          for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
            const k = idx(i, j);
            if (!inside[k]) continue;
            const [x, y] = toWorld(i, j);
            if (x * x + y * y <= r02) airFinal[k] = 0;
          }
        }
      }
      if (p.EXCAVATE_RINGS && p.EXCAVATE_RING_THICKNESS > 0) {
        this._carveRings(airFinal, rand, p.EXCAVATE_RINGS, p.EXCAVATE_RING_THICKNESS);
      }
      this._overwriteOuterAirRing(airFinal);
      this._current = { seed, air: airFinal, entrances: bestWorld ? bestWorld.entrances : [], finalAir };
      return this._current;
    }
    /**
     * @param {Uint8Array} air
     * @param {() => number} rand
     * @param {number} maxRings
     * @param {number} thickness
     * @returns {void}
     */
    _carveRings(air, rand, maxRings, thickness) {
      const { G, idx, inside, toWorld } = this.grid;
      const count = Math.max(0, Math.round(maxRings * rand()));
      if (count <= 0) return;
      const rMin = Math.max(1.2, this.params.RMAX * 0.25);
      const rMax = Math.max(rMin + 0.5, this.params.RMAX * 0.9);
      const centers = [];
      for (let i = 0; i < count; i++) {
        const t = (i + 0.5) / count;
        const jitter = (rand() - 0.5) * 0.15;
        const r = rMin + (rMax - rMin) * Math.min(1, Math.max(0, t + jitter));
        centers.push(r);
      }
      const half = thickness * 0.5;
      for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
        const k = idx(i, j);
        if (!inside[k]) continue;
        const [x, y] = toWorld(i, j);
        const r = Math.hypot(x, y);
        for (const c of centers) {
          if (Math.abs(r - c) <= half) {
            air[k] = 1;
            break;
          }
        }
      }
    }
    /**
     * @returns {number}
     */
    _surfaceShellRadius() {
      return Math.max(0, Math.floor(this.params.RMAX) - 0.5);
    }
    /**
     * Keep the top half of the outermost radial band as air so the render/collision
     * shell sits at the barycentric midpoint between the outer two mesh rings.
     * @param {Uint8Array} air
     * @returns {void}
     */
    _overwriteOuterAirRing(air) {
      const shellR = this._surfaceShellRadius();
      if (!(shellR > 0)) return;
      const shellR2 = shellR * shellR;
      const { G, idx, inside, toWorld } = this.grid;
      for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
        const k = idx(i, j);
        if (!inside[k]) continue;
        const [x, y] = toWorld(i, j);
        if (x * x + y * y >= shellR2) {
          air[k] = 1;
        }
      }
    }
    /**
     * Ensure a continuous air layer just inside the surface for no-caves worlds.
     * @param {Uint8Array} air
     * @param {number} thickness
     * @returns {void}
     */
    /**
     * Carve surface topography for no-caves planets by removing air near the surface.
     * @param {Uint8Array} air
     * @param {number} depth
     * @param {number} freq
     * @param {number} octaves
     * @param {number} amp
     * @returns {void}
     */
    _carveNoCavesTopography(air, depth, freq, octaves, amp) {
      if (depth <= 0) return;
      const { G, idx, inside, toWorld, cell } = this.grid;
      const rMax = this.params.RMAX;
      const maxDepth = Math.max(0.05, depth);
      const ampClamped = Math.max(0, Math.min(maxDepth * 0.95, amp || 0));
      const ampFloor = Math.min(maxDepth * 0.65, Math.max(cell * 1.1, maxDepth * 0.25));
      const ampEffective = Math.max(ampClamped, ampFloor);
      const meanDepth = Math.max(0, Math.min(maxDepth * 0.3, ampEffective * 0.72));
      const waveFreq = Math.max(0.2, freq || 1.2);
      const waveOctaves = Math.max(1, Math.round(octaves || 3));
      let shapeMean = 0;
      let shapeMin = Infinity;
      let shapeMax = -Infinity;
      const shapeSamples = 512;
      for (let s = 0; s < shapeSamples; s++) {
        const th = s / shapeSamples * (Math.PI * 2);
        const ux = Math.cos(th);
        const uy = Math.sin(th);
        const profile = this.noise.fbm(ux * waveFreq, uy * waveFreq, waveOctaves, 0.55, 2);
        const detail = this.noise.fbm((ux + 13.7) * waveFreq * 2.1, (uy - 7.1) * waveFreq * 2.1, 2, 0.55, 2);
        const shape = Math.max(-1, Math.min(1, profile * 0.8 + detail * 0.2));
        shapeMean += shape;
        if (shape < shapeMin) shapeMin = shape;
        if (shape > shapeMax) shapeMax = shape;
      }
      shapeMean /= shapeSamples;
      const shapeHalfRange = Math.max(0.22, (shapeMax - shapeMin) * 0.5);
      for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
        const k = idx(i, j);
        if (!inside[k]) continue;
        const [x, y] = toWorld(i, j);
        const r = Math.hypot(x, y);
        if (r > rMax) continue;
        const len = Math.max(1e-6, r);
        const ux = x / len;
        const uy = y / len;
        const profile = this.noise.fbm(ux * waveFreq, uy * waveFreq, waveOctaves, 0.55, 2);
        const detail = this.noise.fbm((ux + 13.7) * waveFreq * 2.1, (uy - 7.1) * waveFreq * 2.1, 2, 0.55, 2);
        const shapeRaw = Math.max(-1, Math.min(1, profile * 0.8 + detail * 0.2));
        const shape = Math.max(-1, Math.min(1, (shapeRaw - shapeMean) / shapeHalfRange));
        const cutDepth = Math.max(0, Math.min(maxDepth, meanDepth + shape * ampEffective));
        const surfaceR = rMax - cutDepth;
        if (r >= surfaceR) {
          air[k] = 1;
        }
      }
    }
    /**
     * Set air/rock in a disk around world point.
     * @param {number} x
     * @param {number} y
     * @param {number} radius
     * @param {0|1} [val]
     * @returns {void}
     */
    setAirDisk(x, y, radius, val = 1) {
      this._carveDisk(this._current.air, x, y, radius, val);
    }
    /**
     * @param {number} x
     * @param {number} y
     * @returns {0|1}
     */
    airBinaryAtWorld(x, y) {
      const { G, idx, inside, toGrid } = this.grid;
      const shellR = this._surfaceShellRadius();
      if (x * x + y * y >= shellR * shellR) return 1;
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
      if (!val) {
        const shellR = this._surfaceShellRadius();
        if (x * x + y * y >= shellR * shellR) {
          this._current.air[k] = 1;
          return true;
        }
      }
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
  function normalizeMapWorld(world, gridSize, fallbackSeed) {
    const targetSize = Math.max(1, gridSize | 0) * Math.max(1, gridSize | 0);
    const srcAir = world && world.air ? world.air : null;
    let air;
    if (srcAir instanceof Uint8Array && srcAir.length === targetSize) {
      air = srcAir;
    } else {
      air = new Uint8Array(targetSize);
      if (srcAir) {
        air.set(srcAir.subarray ? srcAir.subarray(0, targetSize) : srcAir.slice(0, targetSize));
      }
    }
    return {
      seed: world && Number.isFinite(world.seed) ? +world.seed : +fallbackSeed,
      air,
      entrances: Array.isArray(world == null ? void 0 : world.entrances) ? world.entrances.map((p) => [p[0], p[1]]) : [],
      finalAir: world && Number.isFinite(world.finalAir) ? +world.finalAir : 0
    };
  }
  const workerScope = (
    /** @type {any} */
    self
  );
  workerScope.onmessage = (event) => {
    const data = event && event.data ? event.data : null;
    const requestId = data && Number.isFinite(data.requestId) ? data.requestId | 0 : 0;
    try {
      const seed = data && Number.isFinite(data.seed) ? +data.seed : 0;
      const planetParams = data ? data.planetParams : null;
      const mapgen = new MapGen(seed, planetParams);
      const world = mapgen.getWorld();
      workerScope.postMessage({
        requestId,
        ok: true,
        mapWorld: {
          seed: world.seed,
          air: world.air,
          entrances: world.entrances,
          finalAir: world.finalAir
        }
      }, [world.air.buffer]);
    } catch (err) {
      workerScope.postMessage({
        requestId,
        ok: false,
        error: err instanceof Error ? err.message : String(err)
      });
    }
  };
})();
