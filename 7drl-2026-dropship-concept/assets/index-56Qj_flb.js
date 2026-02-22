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
  ZOOM: 4,
  // ~25% of the world visible
  THRUST: 18,
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
  DEBUG_COLLISION: true,
  DEBUG_NODES: true,
  MINERS_PER_LEVEL: 10,
  MINER_CALL_RADIUS: 4,
  MINER_RUN_SPEED: 1.6,
  MINER_BOARD_RADIUS: 0.5,
  MINER_MIN_SEP: 1.4,
  MINER_STAND_OFFSET: 0.12,
  EXIT_MARGIN: 1,
  MAX_TANGENTIAL_SPEED: 4
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
function createNoise(seed) {
  let perm = buildPerm(seed);
  function setSeed(s) {
    perm = buildPerm(s);
  }
  function simplex2(x, y) {
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
      const gi0 = perm[ii + perm[jj]] % 12;
      const g = grad2[gi0];
      t0 *= t0;
      n0 = t0 * t0 * (g[0] * x0 + g[1] * y0);
    }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 > 0) {
      const gi1 = perm[ii + i1 + perm[jj + j1]] % 12;
      const g = grad2[gi1];
      t1 *= t1;
      n1 = t1 * t1 * (g[0] * x1 + g[1] * y1);
    }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 > 0) {
      const gi2 = perm[ii + 1 + perm[jj + 1]] % 12;
      const g = grad2[gi2];
      t2 *= t2;
      n2 = t2 * t2 * (g[0] * x2 + g[1] * y2);
    }
    return 70 * (n0 + n1 + n2);
  }
  function fbm(x, y, oct = 4, pers = 0.55, lac = 2) {
    let amp = 1, freq = 1, total = 0, norm = 0;
    for (let o = 0; o < oct; o++) {
      total += amp * simplex2(x * freq, y * freq);
      norm += amp;
      amp *= pers;
      freq *= lac;
    }
    return norm ? total / norm : 0;
  }
  function ridged(x, y, oct = 4, pers = 0.55, lac = 2) {
    let amp = 1, freq = 1, total = 0, norm = 0;
    for (let o = 0; o < oct; o++) {
      const n = simplex2(x * freq, y * freq);
      let r = 1 - Math.abs(n);
      r *= r;
      total += amp * r;
      norm += amp;
      amp *= pers;
      freq *= lac;
    }
    return norm ? total / norm : 0;
  }
  return { setSeed, simplex2, fbm, ridged };
}
function createMapGen(cfg) {
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
  const grid = { G, cell, worldMin, worldMax, worldSize, R2, inside, idx, toWorld, toGrid };
  const dirs4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const dirs8 = [];
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) dirs8.push([dx, dy]);
  function countN(field, i, j, dirs) {
    let c = 0;
    for (const [dx, dy] of dirs) {
      const x = i + dx, y = j + dy;
      if (x < 0 || x >= G || y < 0 || y >= G) continue;
      const k = idx(x, y);
      if (inside[k] && field[k]) c++;
    }
    return c;
  }
  function dilate(field, iters) {
    let out = new Uint8Array(field);
    for (let it = 0; it < iters; it++) {
      const next = new Uint8Array(out);
      for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
        const k = idx(i, j);
        if (!inside[k] || out[k]) continue;
        for (const [dx, dy] of dirs4) {
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
  function carveDisk(field, cx, cy, radius, val = 1) {
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
  function floodFromSeeds(field, seeds) {
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
      for (const [dx, dy] of dirs4) {
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
  function fractionAir(field) {
    let ins = 0, a = 0;
    for (let k = 0; k < G * G; k++) {
      if (!inside[k]) continue;
      ins++;
      if (field[k]) a++;
    }
    return a / ins;
  }
  const noise = createNoise(cfg.seed);
  let wx = new Float32Array(G * G);
  let wy = new Float32Array(G * G);
  let caveNoise = new Float32Array(G * G);
  let veinNoise = new Float32Array(G * G);
  function buildWorld(targetInitialAir, rand) {
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
        const v = caveNoise[k] > mid ? 1 : 0;
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
        const n8 = countN(air, i, j, dirs8);
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
      if (veinNoise[k] > cfg.VEIN_THRESH && mid > cfg.VEIN_MID_MIN) veins[k] = 1;
    }
    veins = dilate(veins, cfg.VEIN_DILATE);
    for (let k = 0; k < G * G; k++) {
      if (veins[k]) air[k] = 0;
    }
    for (const [ex, ey] of entrances) {
      carveDisk(air, ex, ey, cfg.ENTRANCE_OUTER, 1);
      carveDisk(air, ex * 0.97, ey * 0.97, cfg.ENTRANCE_INNER, 1);
    }
    const seeds = [];
    for (const [ex, ey] of entrances) {
      const [ix, iy] = toGrid(ex * 0.97, ey * 0.97);
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) seeds.push([ix + dx, iy + dy]);
    }
    const vis = floodFromSeeds(air, seeds);
    for (let k = 0; k < G * G; k++) {
      if (air[k] && !vis[k]) air[k] = 0;
    }
    return { air, entrances };
  }
  let current = { seed: cfg.seed, air: new Uint8Array(G * G), entrances: [], finalAir: 0 };
  function regenWorld(seed) {
    const rand = mulberry32(seed);
    noise.setSeed(seed);
    wx = new Float32Array(G * G);
    wy = new Float32Array(G * G);
    for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
      const k = idx(i, j);
      if (!inside[k]) continue;
      const [x, y] = toWorld(i, j);
      wx[k] = noise.fbm(x * cfg.WARP_F, y * cfg.WARP_F, 3, 0.6, 2);
      wy[k] = noise.fbm((x + 19.3) * cfg.WARP_F, (y - 11.7) * cfg.WARP_F, 3, 0.6, 2);
    }
    caveNoise = new Float32Array(G * G);
    veinNoise = new Float32Array(G * G);
    for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
      const k = idx(i, j);
      if (!inside[k]) continue;
      const [x, y] = toWorld(i, j);
      const xw = x + cfg.WARP_A * wx[k];
      const yw = y + cfg.WARP_A * wy[k];
      const chambers = 0.5 + 0.5 * noise.fbm(xw * cfg.BASE_F * 0.8, yw * cfg.BASE_F * 0.8, 4, 0.55, 2);
      const corridors = noise.ridged(xw * cfg.BASE_F * 1.35, yw * cfg.BASE_F * 1.35, 4, 0.55, 2.05);
      caveNoise[k] = 0.45 * chambers + 0.55 * corridors;
      veinNoise[k] = noise.ridged(xw * cfg.VEIN_F, yw * cfg.VEIN_F, 3, 0.6, 2.2);
    }
    let best = null, bestDiff = 1e9, bestWorld = null;
    for (const g of [0.58, 0.6, 0.62, 0.64, 0.66, 0.68, 0.7]) {
      const w = buildWorld(g, rand);
      const frac = fractionAir(w.air);
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
      const w = buildWorld(g, rand);
      const frac = fractionAir(w.air);
      const d = Math.abs(frac - cfg.TARGET_FINAL_AIR);
      if (d < bestDiff) {
        bestDiff = d;
        best = g;
        bestWorld = w;
      }
    }
    const finalAir = bestWorld ? fractionAir(bestWorld.air) : 0;
    current = { seed, air: bestWorld ? bestWorld.air : new Uint8Array(G * G), entrances: bestWorld ? bestWorld.entrances : [], finalAir };
    return current;
  }
  function airBinaryAtWorld(x, y) {
    const [i, j] = toGrid(x, y);
    if (i < 0 || i >= G || j < 0 || j >= G) return 1;
    const k = idx(i, j);
    if (!inside[k]) return 1;
    return current.air[k] ? 1 : 0;
  }
  return {
    grid,
    noise,
    regenWorld,
    airBinaryAtWorld,
    getWorld: () => current
  };
}
function buildRingMesh(cfg, map) {
  const OUTER_PAD = 1;
  const R_MESH = cfg.RMAX + OUTER_PAD;
  function ringCount(r) {
    if (r <= 0) return 1;
    return Math.max(cfg.N_MIN, Math.floor(2 * Math.PI * r));
  }
  function ringVertices(r) {
    if (r === 0) return [{ x: 0, y: 0 }];
    const n = ringCount(r);
    const phase = 0.5 / n * 2 * Math.PI;
    const out = [];
    for (let k = 0; k < n; k++) {
      const a = 2 * Math.PI * k / n + phase;
      out.push({ x: r * Math.cos(a), y: r * Math.sin(a) });
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
  const rings = [];
  const bandTris = [];
  for (let r = 0; r <= cfg.RMAX; r++) rings.push(ringVertices(r));
  rings.push(ringVertices(cfg.RMAX + OUTER_PAD));
  for (let r = 0; r < R_MESH; r++) {
    const inner = rings[r];
    const outer = rings[r + 1];
    if (r === 0) {
      for (let k = 0; k < outer.length; k++) {
        const a = { x: 0, y: 0 };
        const b = outer[k];
        const c = outer[(k + 1) % outer.length];
        for (const v of [a, b, c]) {
          positions.push(v.x, v.y);
          airFlag.push(sampleAirAtWorldExtended(v.x, v.y));
          shade.push(shadeAt(v.x, v.y));
        }
      }
    } else {
      const tris = stitchBand(inner, outer);
      bandTris[r] = tris;
      for (const tri of tris) {
        for (const v of tri) {
          positions.push(v.x, v.y);
          airFlag.push(sampleAirAtWorldExtended(v.x, v.y));
          shade.push(shadeAt(v.x, v.y));
        }
      }
    }
  }
  const vertCount = positions.length / 2;
  function pointInTri(px, py, ax, ay, bx, by, cx, cy) {
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
  function sampleAirAtWorldExtended(x, y) {
    const r = Math.hypot(x, y);
    if (r > cfg.RMAX) return 1;
    return map.airBinaryAtWorld(x, y);
  }
  function findTriAtWorld(x, y) {
    const r = Math.hypot(x, y);
    if (r <= 0) return null;
    const r0 = Math.floor(Math.min(R_MESH - 1, Math.max(0, r)));
    const bands = [r0, r0 - 1, r0 + 1];
    for (const bi of bands) {
      if (bi < 0 || bi >= R_MESH) continue;
      const tris = bandTris[bi];
      if (!tris) continue;
      for (const tri of tris) {
        const a = tri[0], b = tri[1], c = tri[2];
        if (pointInTri(x, y, a.x, a.y, b.x, b.y, c.x, c.y)) return tri;
      }
    }
    return null;
  }
  function nearestNodeOnRing(x, y) {
    const r = Math.hypot(x, y);
    const ri = Math.max(0, Math.min(cfg.RMAX, Math.round(r)));
    const ring = rings[ri];
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
  function airValueAtWorld(x, y) {
    const r = Math.hypot(x, y);
    if (r > cfg.RMAX + OUTER_PAD) return 1;
    const r0 = Math.floor(Math.min(R_MESH - 1, Math.max(0, r)));
    if (r0 <= 0) {
      return sampleAirAtWorldExtended(x, y);
    }
    const tri = findTriAtWorld(x, y);
    if (!tri) return sampleAirAtWorldExtended(x, y);
    const a = tri[0], b = tri[1], c = tri[2];
    const det = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
    if (Math.abs(det) < 1e-6) return sampleAirAtWorldExtended(x, y);
    const l1 = ((b.y - c.y) * (x - c.x) + (c.x - b.x) * (y - c.y)) / det;
    const l2 = ((c.y - a.y) * (x - c.x) + (a.x - c.x) * (y - c.y)) / det;
    const l3 = 1 - l1 - l2;
    const a0 = sampleAirAtWorldExtended(a.x, a.y);
    const a1 = sampleAirAtWorldExtended(b.x, b.y);
    const a2 = sampleAirAtWorldExtended(c.x, c.y);
    return a0 * l1 + a1 * l2 + a2 * l3;
  }
  function updateAirFlags() {
    for (let i = 0; i < vertCount; i++) {
      const x = positions[i * 2];
      const y = positions[i * 2 + 1];
      airFlag[i] = sampleAirAtWorldExtended(x, y);
    }
    return new Float32Array(airFlag);
  }
  return {
    positions: new Float32Array(positions),
    airFlag: new Float32Array(airFlag),
    shade: new Float32Array(shade),
    vertCount,
    rings,
    bandTris,
    airValueAtWorld,
    nearestNodeOnRing,
    findTriAtWorld,
    updateAirFlags
  };
}
function createRenderer(canvas2, cfg, game) {
  const gl = canvas2.getContext("webgl2", { antialias: true, premultipliedAlpha: false });
  if (!gl) throw new Error("WebGL2 not available");
  function resize() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = Math.floor(canvas2.clientWidth * dpr);
    const h = Math.floor(canvas2.clientHeight * dpr);
    if (canvas2.width !== w || canvas2.height !== h) {
      canvas2.width = w;
      canvas2.height = h;
    }
  }
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
  function compile(type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(sh);
      gl.deleteShader(sh);
      throw new Error(log || "Shader compile failed");
    }
    return sh;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(prog) || "Program link failed");
  }
  const oprog = gl.createProgram();
  gl.attachShader(oprog, compile(gl.VERTEX_SHADER, ovs));
  gl.attachShader(oprog, compile(gl.FRAGMENT_SHADER, ofs));
  gl.linkProgram(oprog);
  if (!gl.getProgramParameter(oprog, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(oprog) || "Overlay program link failed");
  }
  const vao = gl.createVertexArray();
  const oVao = gl.createVertexArray();
  let airBuf = null;
  let vertCount = 0;
  function uploadAttrib(loc, data, size, type = gl.FLOAT) {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, type, false, 0, 0);
    return buf;
  }
  function setMesh(mesh2) {
    gl.bindVertexArray(vao);
    uploadAttrib(0, mesh2.positions, 2);
    airBuf = uploadAttrib(1, mesh2.airFlag, 1);
    uploadAttrib(2, mesh2.shade, 1);
    gl.bindVertexArray(null);
    vertCount = mesh2.vertCount;
  }
  function updateAir(airFlag) {
    if (!airBuf) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, airBuf);
    gl.bufferData(gl.ARRAY_BUFFER, airFlag, gl.STATIC_DRAW);
  }
  gl.useProgram(prog);
  const uScale = gl.getUniformLocation(prog, "uScale");
  const uCam = gl.getUniformLocation(prog, "uCam");
  const uRot = gl.getUniformLocation(prog, "uRot");
  const uRockDark = gl.getUniformLocation(prog, "uRockDark");
  const uRockLight = gl.getUniformLocation(prog, "uRockLight");
  const uAirDark = gl.getUniformLocation(prog, "uAirDark");
  const uAirLight = gl.getUniformLocation(prog, "uAirLight");
  const uMaxR = gl.getUniformLocation(prog, "uMaxR");
  gl.uniform3fv(uRockDark, cfg.ROCK_DARK);
  gl.uniform3fv(uRockLight, cfg.ROCK_LIGHT);
  gl.uniform3fv(uAirDark, cfg.AIR_DARK);
  gl.uniform3fv(uAirLight, cfg.AIR_LIGHT);
  gl.uniform1f(uMaxR, cfg.RMAX + 0.5);
  gl.bindVertexArray(oVao);
  const oPos = gl.createBuffer();
  const oCol = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, oPos);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, oCol);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);
  const ouScale = gl.getUniformLocation(oprog, "uScale");
  const ouCam = gl.getUniformLocation(oprog, "uCam");
  const ouRot = gl.getUniformLocation(oprog, "uRot");
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
  function pushMiner(pos, col, x, y, r, g, b) {
    const len = Math.hypot(x, y) || 1;
    const upx = x / len;
    const upy = y / len;
    const tx = -upy;
    const ty = upx;
    const base = 0.14;
    const height = 0.24;
    const lx = x - tx * base;
    const ly = y - ty * base;
    const rx = x + tx * base;
    const ry = y + ty * base;
    const hx = x + upx * height;
    const hy = y + upy * height;
    pushTri(pos, col, lx, ly, rx, ry, hx, hy, r, g, b, 1);
  }
  function drawFrame(state, mesh2) {
    resize();
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
    const shipHWorld = 0.7;
    const shipWWorld = 0.5;
    const nose = shipHWorld * 0.6;
    const pos = [];
    const col = [];
    let triVerts = 0;
    let lineVerts = 0;
    let pointVerts = 0;
    const local = [
      [0, nose],
      [shipWWorld * 0.6, -0.27999999999999997],
      [0, -0.27999999999999997 * 0.6],
      [-shipWWorld * 0.6, -0.27999999999999997]
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
          pushMiner(pos, col, miner.x, miner.y, 0.98, 0.62, 0.2);
        } else {
          pushMiner(pos, col, miner.x, miner.y, 0.98, 0.85, 0.25);
        }
        triVerts += 3;
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
    gl.uniform2f(ouScale, sx, sy);
    gl.uniform2f(ouCam, state.ship.x, state.ship.y);
    gl.uniform1f(ouRot, camRot);
    gl.bindBuffer(gl.ARRAY_BUFFER, oPos);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, oCol);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(col), gl.DYNAMIC_DRAW);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
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
    gl.bindVertexArray(null);
    gl.disable(gl.BLEND);
  }
  return {
    setMesh,
    updateAir,
    drawFrame
  };
}
const KEY_LEFT = /* @__PURE__ */ new Set(["ArrowLeft", "a", "A"]);
const KEY_RIGHT = /* @__PURE__ */ new Set(["ArrowRight", "d", "D"]);
const KEY_THRUST = /* @__PURE__ */ new Set([" ", "Space", "ArrowUp", "w", "W"]);
const KEY_DOWN = /* @__PURE__ */ new Set(["ArrowDown", "s", "S"]);
const KEY_RESET = /* @__PURE__ */ new Set(["r", "R"]);
function createInput(canvas2) {
  const keys = /* @__PURE__ */ new Set();
  const justPressed = /* @__PURE__ */ new Set();
  const pointers = /* @__PURE__ */ new Map();
  const oneshot = {
    regen: false,
    toggleDebug: false,
    reset: false
  };
  function onKeyDown(e) {
    const key = e.key;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "Space"].includes(key)) e.preventDefault();
    if (!keys.has(key)) justPressed.add(key);
    keys.add(key);
    if (key === "m" || key === "M") oneshot.regen = true;
    if (key === "c" || key === "C") oneshot.toggleDebug = true;
  }
  function onKeyUp(e) {
    keys.delete(e.key);
  }
  window.addEventListener("keydown", onKeyDown, { passive: false });
  window.addEventListener("keyup", onKeyUp, { passive: false });
  function pointerPos(e) {
    const rect = canvas2.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / Math.max(1, rect.width),
      y: (e.clientY - rect.top) / Math.max(1, rect.height)
    };
  }
  function onPointerDown(e) {
    canvas2.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, pointerPos(e));
  }
  function onPointerMove(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, pointerPos(e));
  }
  function onPointerUp(e) {
    pointers.delete(e.pointerId);
  }
  canvas2.addEventListener("pointerdown", onPointerDown, { passive: true });
  canvas2.addEventListener("pointermove", onPointerMove, { passive: true });
  canvas2.addEventListener("pointerup", onPointerUp, { passive: true });
  canvas2.addEventListener("pointercancel", onPointerUp, { passive: true });
  function touchState() {
    let left = false;
    let right = false;
    let thrust = false;
    let down = false;
    for (const p of pointers.values()) {
      if (p.x < 0.5) {
        if (p.x < 0.25) left = true;
        else right = true;
      } else {
        if (p.y < 0.5) thrust = true;
        else down = true;
      }
    }
    return { left, right, thrust, down };
  }
  function gamepadState() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const pad = pads && pads[0];
    if (!pad) return { left: false, right: false, thrust: false, down: false };
    const dead = 0.2;
    const ax0 = pad.axes && pad.axes.length ? pad.axes[0] : 0;
    const ax1 = pad.axes && pad.axes.length > 1 ? pad.axes[1] : 0;
    const left = ax0 < -dead;
    const right = ax0 > dead;
    const thrust = pad.buttons && pad.buttons[0] && pad.buttons[0].pressed || ax1 < -dead;
    const down = pad.buttons && pad.buttons[1] && pad.buttons[1].pressed || ax1 > dead;
    return { left, right, thrust, down };
  }
  function update() {
    const keyState = {
      left: false,
      right: false,
      thrust: false,
      down: false
    };
    for (const k of keys) {
      if (KEY_LEFT.has(k)) keyState.left = true;
      if (KEY_RIGHT.has(k)) keyState.right = true;
      if (KEY_THRUST.has(k)) keyState.thrust = true;
      if (KEY_DOWN.has(k)) keyState.down = true;
      if (KEY_RESET.has(k)) oneshot.reset = true;
    }
    const t = touchState();
    const g = gamepadState();
    const left = keyState.left || t.left || g.left;
    const right = keyState.right || t.right || g.right;
    const thrust = keyState.thrust || t.thrust || g.thrust;
    const down = keyState.down || t.down || g.down;
    const state = {
      left,
      right,
      thrust,
      down,
      reset: oneshot.reset,
      regen: oneshot.regen,
      toggleDebug: oneshot.toggleDebug
    };
    justPressed.clear();
    oneshot.reset = false;
    oneshot.regen = false;
    oneshot.toggleDebug = false;
    return state;
  }
  return { update };
}
function updateHud(hud2, stats) {
  hud2.textContent = `fps: ${stats.fps} | level: ${stats.level} | state: ${stats.state} | speed: ${stats.speed.toFixed(2)} | miners: ${stats.miners} | verts: ${stats.verts.toLocaleString()} | air: ${stats.air.toFixed(3)} | M: new map | C: debug collisions | R: restart`;
}
function createGameLoop({ cfg, mapgen: mapgen2, mesh: mesh2, renderer: renderer2, input: input2, ui, canvas: canvas2, hud: hud2 }) {
  const TERRAIN_PAD = 0.5;
  const TERRAIN_MAX = cfg.RMAX + TERRAIN_PAD;
  const ship = {
    x: 0,
    y: cfg.RMAX + 0.9,
    vx: 0,
    vy: 0,
    state: "flying",
    explodeT: 0,
    lastAir: 1
  };
  const debris = [];
  function resetShip() {
    ship.x = 0;
    ship.y = cfg.RMAX + 0.9;
    ship.vx = 0;
    ship.vy = 0;
    ship.state = "flying";
    ship.explodeT = 0;
    debris.length = 0;
  }
  let level = 1;
  let miners = [];
  let minersRemaining = 0;
  function shuffle(items, rand) {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const tmp = items[i];
      items[i] = items[j];
      items[j] = tmp;
    }
  }
  function gatherMinerCandidates(minDot) {
    const { G, inside, idx, toWorld, cell } = mapgen2.grid;
    const air = mapgen2.getWorld().air;
    const eps = cell * 0.5;
    const candidates = [];
    for (let j = 1; j < G - 1; j++) {
      for (let i = 1; i < G - 1; i++) {
        const k = idx(i, j);
        if (!inside[k] || !air[k]) continue;
        const [x, y] = toWorld(i, j);
        const r = Math.hypot(x, y);
        if (r < 1) continue;
        const upx = x / r;
        const upy = y / r;
        const belowX = x - upx * cell * 0.7;
        const belowY = y - upy * cell * 0.7;
        if (mesh2.airValueAtWorld(belowX, belowY) > 0.5) continue;
        const aboveX = x + upx * cell * 0.4;
        const aboveY = y + upy * cell * 0.4;
        if (mesh2.airValueAtWorld(aboveX, aboveY) <= 0.5) continue;
        const gdx = mesh2.airValueAtWorld(x + eps, y) - mesh2.airValueAtWorld(x - eps, y);
        const gdy = mesh2.airValueAtWorld(x, y + eps) - mesh2.airValueAtWorld(x, y - eps);
        const nlen = Math.hypot(gdx, gdy);
        if (nlen < 1e-4) continue;
        const nx = gdx / nlen;
        const ny = gdy / nlen;
        const dotUp = nx * upx + ny * upy;
        if (dotUp < minDot) continue;
        candidates.push({
          x: x + upx * GAME.MINER_STAND_OFFSET,
          y: y + upy * GAME.MINER_STAND_OFFSET
        });
      }
    }
    return candidates;
  }
  function spawnMiners() {
    const count = GAME.MINERS_PER_LEVEL;
    const seed = mapgen2.getWorld().seed + level * 97;
    const rand = mulberry32(seed);
    const minDots = [GAME.SURFACE_DOT + 0.1, GAME.SURFACE_DOT, GAME.SURFACE_DOT - 0.1];
    let candidates = [];
    for (const minDot of minDots) {
      candidates = gatherMinerCandidates(minDot);
      if (candidates.length >= count * 3) break;
    }
    if (!candidates.length) {
      miners = [];
      minersRemaining = 0;
      return;
    }
    shuffle(candidates, rand);
    const placed = [];
    const minSep2 = GAME.MINER_MIN_SEP * GAME.MINER_MIN_SEP;
    for (const c of candidates) {
      let ok = true;
      for (const p of placed) {
        const dx = c.x - p.x;
        const dy = c.y - p.y;
        if (dx * dx + dy * dy < minSep2) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      placed.push(c);
      if (placed.length >= count) break;
    }
    miners = placed.map((p) => ({ x: p.x, y: p.y, state: "idle" }));
    minersRemaining = miners.length;
  }
  function beginLevel(seed, advanceLevel) {
    mapgen2.regenWorld(seed);
    const newAir = mesh2.updateAirFlags();
    renderer2.updateAir(newAir);
    resetShip();
    if (advanceLevel) level++;
    spawnMiners();
  }
  spawnMiners();
  function shipCollisionPoints(x, y) {
    const camRot = Math.atan2(x, y || 1e-6);
    const shipRot = -camRot;
    const shipHWorld = 0.7;
    const shipWWorld = 0.5;
    const nose = shipHWorld * 0.6;
    const local = [
      [0, nose],
      [shipWWorld * 0.6, -0.27999999999999997],
      [-shipWWorld * 0.6, -0.27999999999999997]
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
  function shipCollidesAt(x, y, shipRadius) {
    const rCenter = Math.hypot(x, y);
    if (rCenter - shipRadius > TERRAIN_MAX) return false;
    if (mesh2.airValueAtWorld(x, y) <= 0.5) return true;
    for (const [sx, sy] of shipCollisionPoints(x, y)) {
      const av = mesh2.airValueAtWorld(sx, sy);
      if (av <= 0.5) return true;
    }
    return false;
  }
  function step(dt, inputState) {
    const { left, right, thrust, down, reset } = inputState;
    if (reset) resetShip();
    if (ship.state === "flying") {
      let ax = 0, ay = 0;
      const r = Math.hypot(ship.x, ship.y) || 1;
      const rx = ship.x / r;
      const ry = ship.y / r;
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
      ax += -ship.x / r * GAME.GRAVITY;
      ay += -ship.y / r * GAME.GRAVITY;
      ship.vx += ax * dt;
      ship.vy += ay * dt;
      const drag = Math.max(0, 1 - GAME.DRAG * dt);
      ship.vx *= drag;
      ship.vy *= drag;
      const vt = ship.vx * tx + ship.vy * ty;
      const vtMax = GAME.MAX_TANGENTIAL_SPEED;
      if (Math.abs(vt) > vtMax) {
        const excess = vt - Math.sign(vt) * vtMax;
        ship.vx -= tx * excess;
        ship.vy -= ty * excess;
      }
      ship.x += ship.vx * dt;
      ship.y += ship.vy * dt;
      const speed = Math.hypot(ship.vx, ship.vy);
      const eps = mapgen2.grid.cell * 0.75;
      const shipHWorld = 0.7;
      const shipRadius = shipHWorld * 0.28;
      let collides = false;
      const samples = [];
      let hit = null;
      const rCenter = Math.hypot(ship.x, ship.y);
      if (rCenter - shipRadius <= TERRAIN_MAX) {
        for (const [sx, sy] of shipCollisionPoints(ship.x, ship.y)) {
          const av = mesh2.airValueAtWorld(sx, sy);
          const air = av > 0.5;
          samples.push([sx, sy, air, av]);
          if (!air) {
            collides = true;
            if (!hit) hit = { x: sx, y: sy };
          }
        }
      }
      ship._samples = samples;
      ship._shipRadius = shipRadius;
      if (hit) {
        ship._collision = {
          x: hit.x,
          y: hit.y,
          tri: mesh2.findTriAtWorld(hit.x, hit.y),
          node: mesh2.nearestNodeOnRing(hit.x, hit.y)
        };
      } else {
        ship._collision = null;
      }
      if (collides) {
        const gdx = mesh2.airValueAtWorld(ship.x + eps, ship.y) - mesh2.airValueAtWorld(ship.x - eps, ship.y);
        const gdy = mesh2.airValueAtWorld(ship.x, ship.y + eps) - mesh2.airValueAtWorld(ship.x, ship.y - eps);
        let nx = gdx;
        let ny = gdy;
        let nlen = Math.hypot(nx, ny);
        if (nlen < 1e-4) {
          const c = ship._collision;
          if (c) {
            nx = ship.x - c.x;
            ny = ship.y - c.y;
            nlen = Math.hypot(nx, ny);
          }
        }
        if (nlen < 1e-4) {
          nx = ship.x;
          ny = ship.y;
          nlen = Math.hypot(nx, ny) || 1;
        }
        nx /= nlen;
        ny /= nlen;
        const camRot = Math.atan2(ship.x, ship.y || 1e-6);
        const upx = Math.sin(camRot);
        const upy = Math.cos(camRot);
        const dotUp = nx * upx + ny * upy;
        const vn = ship.vx * nx + ship.vy * ny;
        const impactSpeed = Math.max(0, -vn);
        const resolvePenetration = () => {
          const maxSteps = 8;
          const stepSize = shipRadius * 0.2;
          for (let i = 0; i < maxSteps; i++) {
            if (!shipCollidesAt(ship.x, ship.y, shipRadius)) break;
            ship.x += nx * stepSize;
            ship.y += ny * stepSize;
          }
        };
        if (impactSpeed <= GAME.LAND_SPEED && vn < -0.05 && dotUp >= GAME.SURFACE_DOT) {
          ship.state = "landed";
          ship.vx = 0;
          ship.vy = 0;
          resolvePenetration();
        } else if (impactSpeed >= GAME.CRASH_SPEED) {
          ship.state = "crashed";
          ship.explodeT = 0;
          ship.vx = 0;
          ship.vy = 0;
          debris.length = 0;
          const pieces = 10;
          for (let i = 0; i < pieces; i++) {
            const ang = Math.random() * Math.PI * 2;
            const sp = 1.5 + Math.random() * 2.5;
            debris.push({
              x: ship.x + Math.cos(ang) * 0.1,
              y: ship.y + Math.sin(ang) * 0.1,
              vx: ship.vx + Math.cos(ang) * sp,
              vy: ship.vy + Math.sin(ang) * sp,
              a: Math.random() * Math.PI * 2,
              w: (Math.random() - 0.5) * 4,
              life: 2.5 + Math.random() * 1.5
            });
          }
        } else {
          if (impactSpeed <= GAME.LAND_SPEED && vn < -0.05 && dotUp >= GAME.SURFACE_DOT) {
            ship.vx -= nx * GAME.LAND_PULL * dt;
            ship.vy -= ny * GAME.LAND_PULL * dt;
            const tx2 = -ny;
            const ty2 = nx;
            const vt2 = ship.vx * tx2 + ship.vy * ty2;
            ship.vx -= vt2 * tx2 * GAME.LAND_FRICTION * dt;
            ship.vy -= vt2 * ty2 * GAME.LAND_FRICTION * dt;
            resolvePenetration();
          } else if (vn < 0) {
            const restitution = GAME.BOUNCE_RESTITUTION;
            ship.vx -= (1 + restitution) * vn * nx;
            ship.vy -= (1 + restitution) * vn * ny;
            const fast = speed >= GAME.LAND_SPEED * 1.2;
            const push = shipRadius * (fast ? GAME.COLLIDE_PUSH_FAST : 0.02);
            ship.x += nx * push;
            ship.y += ny * push;
            resolvePenetration();
          }
        }
      }
    }
    if (miners.length) {
      const landed = ship.state === "landed";
      for (const miner of miners) {
        if (miner.state === "boarded") continue;
        const dx = ship.x - miner.x;
        const dy = ship.y - miner.y;
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
            if (mesh2.airValueAtWorld(nx, ny) > 0.5) {
              miner.x = nx;
              miner.y = ny;
              return true;
            }
            return false;
          };
          if (!tryMove(dirx, diry)) {
            const r = Math.hypot(miner.x, miner.y) || 1;
            const upx = miner.x / r;
            const upy = miner.y / r;
            const dotUp = dirx * upx + diry * upy;
            const tx = dirx - upx * dotUp;
            const ty = diry - upy * dotUp;
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
        const postDx = ship.x - miner.x;
        const postDy = ship.y - miner.y;
        const postDist = Math.hypot(postDx, postDy);
        if (landed && postDist <= GAME.MINER_BOARD_RADIUS) {
          miner.state = "boarded";
          minersRemaining = Math.max(0, minersRemaining - 1);
        }
      }
    }
    if (debris.length) {
      for (let i = debris.length - 1; i >= 0; i--) {
        const d = debris[i];
        const r = Math.hypot(d.x, d.y) || 1;
        d.vx += -d.x / r * GAME.GRAVITY * dt;
        d.vy += -d.y / r * GAME.GRAVITY * dt;
        d.vx *= Math.max(0, 1 - GAME.DRAG * dt);
        d.vy *= Math.max(0, 1 - GAME.DRAG * dt);
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.a += d.w * dt;
        d.life -= dt;
        if (d.life <= 0) debris.splice(i, 1);
      }
    }
    if (ship.state === "landed") {
      if (left || right || thrust) {
        ship.state = "flying";
      }
    }
  }
  let lastTime = performance.now();
  let accumulator = 0;
  let fpsTime = lastTime;
  let fpsFrames = 0;
  let fps = 0;
  let debugCollisions = GAME.DEBUG_COLLISION;
  function frame() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastTime) / 1e3);
    lastTime = now;
    accumulator += dt;
    const inputState = input2.update();
    if (ship.state === "crashed") {
      ship.explodeT = Math.min(1.2, ship.explodeT + dt * 0.9);
    }
    if (inputState.regen) {
      const nextSeed = mapgen2.getWorld().seed + 1;
      beginLevel(nextSeed, false);
    }
    if (inputState.toggleDebug) {
      debugCollisions = !debugCollisions;
    }
    const fixed = 1 / 60;
    const maxSteps = 4;
    let steps = 0;
    while (accumulator >= fixed && steps < maxSteps) {
      step(fixed, inputState);
      accumulator -= fixed;
      steps++;
    }
    if (minersRemaining === 0 && ship.state === "flying") {
      const r = Math.hypot(ship.x, ship.y);
      if (r > cfg.RMAX + GAME.EXIT_MARGIN) {
        const nextSeed = mapgen2.getWorld().seed + 1;
        beginLevel(nextSeed, true);
      }
    }
    fpsFrames++;
    if (now - fpsTime >= 500) {
      fps = Math.round(fpsFrames * 1e3 / (now - fpsTime));
      fpsFrames = 0;
      fpsTime = now;
    }
    renderer2.drawFrame({
      ship,
      debris,
      input: inputState,
      debugCollisions,
      debugNodes: GAME.DEBUG_NODES,
      fps,
      finalAir: mapgen2.getWorld().finalAir,
      miners,
      minersRemaining,
      level
    }, mesh2);
    ui.updateHud(hud2, {
      fps,
      state: ship.state,
      speed: Math.hypot(ship.vx, ship.vy),
      verts: mesh2.vertCount,
      air: mapgen2.getWorld().finalAir,
      miners: minersRemaining,
      level
    });
    requestAnimationFrame(frame);
  }
  function start() {
    requestAnimationFrame(frame);
  }
  return { start, ship, debris };
}
const canvas = (
  /** @type {HTMLCanvasElement} */
  document.getElementById("gl")
);
const hud = (
  /** @type {HTMLElement} */
  document.getElementById("hud")
);
const mapgen = createMapGen(CFG);
mapgen.regenWorld(CFG.seed);
const mesh = buildRingMesh(CFG, mapgen);
const renderer = createRenderer(canvas, CFG, GAME);
renderer.setMesh(mesh);
const input = createInput(canvas);
const loop = createGameLoop({
  cfg: CFG,
  mapgen,
  mesh,
  renderer,
  input,
  ui: { updateHud },
  canvas,
  hud
});
loop.start();
