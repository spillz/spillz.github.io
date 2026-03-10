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
  EDGE_DARK: [20 / 255, 20 / 255, 20 / 255],
  STAR_SATURATION: 2
  //1 = baseline, >1 more intense colors
});
const GAME = Object.freeze({
  PLANETSIDE_ZOOM: 4.5,
  MOTHERSHIP_ZOOM: 6,
  MOTHERSHIP_START_DOCK_X: 0,
  MOTHERSHIP_START_DOCK_Y: 0.7,
  SHIP_SCALE: 0.5,
  MINER_SCALE: 0.5,
  ENEMY_SCALE: 0.25,
  THRUST: 4.5,
  TURN_RATE: 2.4,
  DRAG: 0.12,
  CRASH_SPEED: 4.5,
  LAND_SPEED: 2,
  SURFACE_DOT: 0.7,
  LAND_FRICTION: 10,
  MOTHERSHIP_FRICTION: 10,
  BOUNCE_RESTITUTION: 0.1,
  /** @type {boolean} */
  DEBUG_COLLISION: false,
  /** @type {boolean} */
  DEBUG_NODES: true,
  MINERS_PER_LEVEL: 10,
  MINER_CALL_RADIUS: 4,
  MINER_JOG_SPEED: 0.8,
  MINER_RUN_SPEED: 1.2,
  MINER_BOARD_RADIUS: 0.12,
  MINER_MIN_SEP: 1.4,
  MINER_STAND_OFFSET: 0.12,
  MINER_POPUP_LIFE: 0.9,
  MINER_POPUP_SPEED: 0.6,
  MINER_POPUP_TANGENTIAL: 0.18,
  MAX_TANGENTIAL_SPEED: 4,
  SHIP_STARTING_MAX_HP: 3,
  SHIP_STARTING_MAX_BOMBS: 3,
  SHIP_STARTING_THRUST: 0,
  SHIP_STARTING_GUN_POWER: 1,
  SHIP_HIT_COOLDOWN: 0.25,
  SHIP_HIT_POPUP_LIFE: 0.6,
  AIM_SCREEN_RADIUS: 0.25,
  VIS_RANGE: 7,
  VIS_STEP: 0.25,
  FOG_COLOR: [0.1, 0.1, 0.1],
  FOG_UNSEEN_ALPHA: 0.95,
  FOG_SEEN_ALPHA: 0.0625,
  FOG_HOLD_FRAMES: 4,
  FOG_BUDGET_TRIS: 300,
  FOG_LOS_THRESH: 0.5,
  FOG_ALPHA_LERP: 0.2
});
const TOUCH_UI = Object.freeze({
  left: { x: 0.13, y: 0.72, r: 0.13 },
  laser: { x: 0.87, y: 0.72, r: 0.12 },
  bomb: { x: 0.87, y: 0.3, r: 0.11 },
  start: { x: 0.13, y: 0.3, r: 0.13 },
  dead: 0.04,
  aimRadius: 0.09
});
function mulberry32$1(seed) {
  let t = seed >>> 0;
  return function() {
    t += 1831565813;
    let x = Math.imul(t ^ t >>> 15, 1 | t);
    x ^= x + Math.imul(x ^ x >>> 7, 61 | x);
    return ((x ^ x >>> 14) >>> 0) / 4294967296;
  };
}
function buildStarfieldMesh(seed, opts = {}) {
  const count = Math.max(1, opts.count ?? 420);
  const sizeMin = opts.sizeMin ?? 4e-3;
  const sizeMax = opts.sizeMax ?? 0.012;
  const span = opts.span ?? 1;
  const rand = mulberry32$1(seed >>> 0);
  const triVerts = count * 3;
  const positions = new Float32Array(triVerts * 2);
  const phase = new Float32Array(triVerts);
  const rate = new Float32Array(triVerts);
  const depth = new Float32Array(triVerts);
  const color = new Float32Array(triVerts * 3);
  let p = 0;
  const palettes = [
    [1, 1, 1],
    // white
    [1, 0.92, 0.78],
    // yellow
    [1, 0.8, 0.55],
    // orange
    [1, 0.7, 0.7],
    // red
    [0.7, 0.8, 1]
    // blue
  ];
  for (let i = 0; i < count; i++) {
    const x = (rand() * 2 - 1) * span;
    const y = (rand() * 2 - 1) * span;
    const baseSize = sizeMin + rand() * (sizeMax - sizeMin);
    const ang = rand() * Math.PI * 2;
    const d = 0.15 + rand() * 0.85;
    const ph = rand() * Math.PI * 2;
    const tw = 0.6 + rand() * 1.4;
    const size = baseSize * (0.6 + d * 0.7);
    const a0 = ang;
    const a1 = ang + Math.PI * 2 / 3;
    const a2 = ang + Math.PI * 4 / 3;
    const ax = Math.cos(a0) * size;
    const ay = Math.sin(a0) * size;
    const bx = Math.cos(a1) * size;
    const by = Math.sin(a1) * size;
    const cx = Math.cos(a2) * size;
    const cy = Math.sin(a2) * size;
    positions[p + 0] = x + ax;
    positions[p + 1] = y + ay;
    positions[p + 2] = x + bx;
    positions[p + 3] = y + by;
    positions[p + 4] = x + cx;
    positions[p + 5] = y + cy;
    const base = p / 2;
    const palette = palettes[Math.floor(rand() * palettes.length)];
    const mixToWhite = 0.55 + rand() * 0.35;
    const cr = palette[0] * (1 - mixToWhite) + mixToWhite;
    const cg = palette[1] * (1 - mixToWhite) + mixToWhite;
    const cb = palette[2] * (1 - mixToWhite) + mixToWhite;
    for (let v = 0; v < 3; v++) {
      phase[base + v] = ph;
      rate[base + v] = tw;
      depth[base + v] = d;
      const ci = (base + v) * 3;
      color[ci + 0] = cr;
      color[ci + 1] = cg;
      color[ci + 2] = cb;
    }
    p += 6;
  }
  return { positions, phase, rate, depth, color, vertCount: triVerts };
}
class MinHeap {
  /**
   * @constructor
   */
  constructor() {
    this.items = [];
  }
  /**
   * @param {number} node
   * @param {number} f
   * @param {number} g
   * @returns {void}
   */
  push(node, f, g) {
    const item = { node, f, g };
    const items = this.items;
    items.push(item);
    let i = items.length - 1;
    while (i > 0) {
      const p = i - 1 >> 1;
      if (items[p].f <= item.f) break;
      items[i] = items[p];
      i = p;
    }
    items[i] = item;
  }
  /**
   * @returns {{node:number, f:number, g:number}|null}
   */
  pop() {
    const items = this.items;
    if (!items.length) return null;
    const root = items[0];
    const last = items.pop();
    if (!last || !items.length) return root;
    items[0] = last;
    let i = 0;
    const n = items.length;
    while (true) {
      const l = i * 2 + 1;
      const r2 = l + 1;
      if (l >= n) break;
      let m = l;
      if (r2 < n && items[r2].f < items[l].f) m = r2;
      if (items[i].f <= items[m].f) break;
      const tmp = items[i];
      items[i] = items[m];
      items[m] = tmp;
      i = m;
    }
    return root;
  }
  /**
   * @returns {number}
   */
  get size() {
    return this.items.length;
  }
}
class RadialGraph {
  /**
   * Build a navigation graph using discrete radial point adjacencies.
   * @param {{rings: Array<Point[]>, bandTris: Array<Array<Array<Point>>>}} mesh Mesh rings and band triangles.
   */
  constructor(mesh) {
    const { rings, bandTris } = mesh;
    const nodes = [];
    const neighbors = [];
    const ringIndex = [];
    const nodeOfRef = /* @__PURE__ */ new Map();
    for (let r2 = 0; r2 < rings.length; r2++) {
      const ring = rings[r2] || [];
      ringIndex[r2] = [];
      for (let i = 0; i < ring.length; i++) {
        const v = ring[i];
        const idx = nodes.length;
        nodes.push({ x: v.x, y: v.y, r: r2, i });
        neighbors.push([]);
        ringIndex[r2].push(idx);
        nodeOfRef.set(v, idx);
      }
    }
    function addEdge(a, b) {
      if (a === b) return;
      if (a < 0 || b < 0) return;
      const na = nodes[a];
      const nb = nodes[b];
      if (!na || !nb) return;
      const dx = na.x - nb.x;
      const dy = na.y - nb.y;
      const cost = Math.hypot(dx, dy);
      neighbors[a].push({ to: b, cost });
      neighbors[b].push({ to: a, cost });
    }
    for (let r2 = 0; r2 < rings.length; r2++) {
      const ring = rings[r2] || [];
      const n = ring.length;
      if (n <= 1) continue;
      for (let i = 0; i < n; i++) {
        const a = ringIndex[r2][i];
        const b = ringIndex[r2][(i + 1) % n];
        addEdge(a, b);
      }
    }
    for (const tris of bandTris) {
      if (!tris) continue;
      for (const tri of tris) {
        const ia = nodeOfRef.get(tri[0]);
        const ib = nodeOfRef.get(tri[1]);
        const ic = nodeOfRef.get(tri[2]);
        if (ia === void 0 || ib === void 0 || ic === void 0) continue;
        addEdge(ia, ib);
        addEdge(ib, ic);
        addEdge(ic, ia);
      }
    }
    if (ringIndex[0] && ringIndex[0].length === 1 && ringIndex[1]) {
      const center = ringIndex[0][0];
      for (const idx of ringIndex[1]) {
        addEdge(center, idx);
      }
    }
    this.nodes = nodes;
    this.neighbors = neighbors;
    this.ringIndex = ringIndex;
    this.nodeOfRef = nodeOfRef;
  }
}
function buildPassableMask(mesh, graph, threshold = 0.5) {
  const passable = new Uint8Array(graph.nodes.length);
  for (let i = 0; i < graph.nodes.length; i++) {
    const n = graph.nodes[i];
    passable[i] = mesh.airValueAtWorld(n.x, n.y) > threshold ? 1 : 0;
  }
  return passable;
}
function nearestRadialNode(graph, mesh, x, y) {
  const ref = mesh.nearestNodeOnRing(x, y);
  if (ref && graph.nodeOfRef.has(ref)) return graph.nodeOfRef.get(ref) ?? -1;
  let best = -1;
  let bestD = 1e9;
  for (let i = 0; i < graph.nodes.length; i++) {
    const n = graph.nodes[i];
    const dx = n.x - x;
    const dy = n.y - y;
    const d = dx * dx + dy * dy;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}
function dijkstraMap(graph, sources, passable) {
  const n = graph.nodes.length;
  const dist = new Array(n).fill(Infinity);
  const heap = new MinHeap();
  for (const s of sources) {
    if (s < 0 || s >= n) continue;
    if (!passable[s]) continue;
    dist[s] = 0;
    heap.push(s, 0, 0);
  }
  while (heap.size) {
    const item = heap.pop();
    if (!item) break;
    const { node, g } = item;
    if (g > dist[node]) continue;
    for (const edge of graph.neighbors[node]) {
      if (!passable[edge.to]) continue;
      const nd = g + edge.cost;
      if (nd < dist[edge.to]) {
        dist[edge.to] = nd;
        heap.push(edge.to, nd, nd);
      }
    }
  }
  return Float32Array.from(dist);
}
function findPathAStar(graph, start, goal, passable) {
  const n = graph.nodes.length;
  if (start < 0 || start >= n || goal < 0 || goal >= n) return null;
  const costImpassable = 1e3;
  const gScore = new Array(n).fill(Infinity);
  gScore[start] = 0;
  const cameFrom = new Int32Array(n).fill(-1);
  const heap = new MinHeap();
  const h = (a) => {
    const na = graph.nodes[a];
    const nb = graph.nodes[goal];
    return Math.hypot(na.x - nb.x, na.y - nb.y);
  };
  heap.push(start, h(start), 0);
  while (heap.size) {
    const item = heap.pop();
    if (!item) break;
    const { node, g } = item;
    if (node === goal) break;
    if (g > gScore[node]) continue;
    for (const edge of graph.neighbors[node]) {
      const tentative = g + edge.cost + (passable[edge.to] ? 0 : costImpassable);
      if (tentative < gScore[edge.to]) {
        gScore[edge.to] = tentative;
        cameFrom[edge.to] = node;
        const f = tentative + h(edge.to);
        heap.push(edge.to, f, tentative);
      }
    }
  }
  if (start !== goal && cameFrom[goal] === -1) return null;
  const path = [];
  let cur = goal;
  path.push(cur);
  while (cur !== start) {
    cur = cameFrom[cur];
    if (cur === -1) return null;
    path.push(cur);
  }
  path.reverse();
  return path;
}
function lineOfSightAir(mesh, ax, ay, bx, by, step = 0.25) {
  const dx = bx - ax;
  const dy = by - ay;
  const dist = Math.hypot(dx, dy);
  if (dist <= 1e-6) return true;
  const steps = Math.max(1, Math.ceil(dist / step));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const x = ax + dx * t;
    const y = ay + dy * t;
    if (mesh.airValueAtWorld(x, y) <= 0.5) return false;
  }
  return true;
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
function pushTri(pos, col, ax, ay, bx, by, cx, cy, r2, g, b, a) {
  pos.push(ax, ay, bx, by, cx, cy);
  for (let i = 0; i < 3; i++) col.push(r2, g, b, a);
}
function pushTriColored(pos, col, ax, ay, bx, by, cx, cy, ca, cb, cc) {
  pos.push(ax, ay, bx, by, cx, cy);
  col.push(ca[0], ca[1], ca[2], ca[3]);
  col.push(cb[0], cb[1], cb[2], cb[3]);
  col.push(cc[0], cc[1], cc[2], cc[3]);
}
function pushLine(pos, col, ax, ay, bx, by, r2, g, b, a) {
  pos.push(ax, ay, bx, by);
  col.push(r2, g, b, a, r2, g, b, a);
}
function pushThickLine(pos, col, ax, ay, bx, by, thickness, r2, g, b, a) {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy);
  if (len <= 1e-6) return;
  const half = Math.max(1e-4, thickness * 0.5);
  const nx = -dy / len * half;
  const ny = dx / len * half;
  pushTri(pos, col, ax + nx, ay + ny, bx + nx, by + ny, bx - nx, by - ny, r2, g, b, a);
  pushTri(pos, col, ax + nx, ay + ny, bx - nx, by - ny, ax - nx, ay - ny, r2, g, b, a);
}
function pushTriangleOutline(pos, col, ax, ay, bx, by, cx, cy, r2, g, b, a) {
  pushLine(pos, col, ax, ay, bx, by, r2, g, b, a);
  pushLine(pos, col, bx, by, cx, cy, r2, g, b, a);
  pushLine(pos, col, cx, cy, ax, ay, r2, g, b, a);
}
function triAirAtWorld(tri, x, y) {
  const a = tri[0], b = tri[1], c = tri[2];
  const det = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
  if (Math.abs(det) < 1e-6) {
    return (a.air + b.air + c.air) / 3;
  }
  const l1 = ((b.y - c.y) * (x - c.x) + (c.x - b.x) * (y - c.y)) / det;
  const l2 = ((c.y - a.y) * (x - c.x) + (a.x - c.x) * (y - c.y)) / det;
  const l3 = 1 - l1 - l2;
  return a.air * l1 + b.air * l2 + c.air * l3;
}
function pushUniquePoint(out, x, y) {
  const eps2 = 1e-10;
  for (const p of out) {
    const dx = p[0] - x;
    const dy = p[1] - y;
    if (dx * dx + dy * dy <= eps2) return;
  }
  out.push([x, y]);
}
function triIsoSegment(tri, threshold = 0.5) {
  const pts = [];
  const edges = [[tri[0], tri[1]], [tri[1], tri[2]], [tri[2], tri[0]]];
  const eps = 1e-6;
  for (const [a, b] of edges) {
    const va = a.air;
    const vb = b.air;
    const da = va - threshold;
    const db = vb - threshold;
    if (Math.abs(da) <= eps && Math.abs(db) <= eps) {
      pushUniquePoint(pts, a.x, a.y);
      pushUniquePoint(pts, b.x, b.y);
      continue;
    }
    if (Math.abs(da) <= eps) {
      pushUniquePoint(pts, a.x, a.y);
      continue;
    }
    if (Math.abs(db) <= eps) {
      pushUniquePoint(pts, b.x, b.y);
      continue;
    }
    if (da * db < 0) {
      const t = (threshold - va) / (vb - va || 1);
      const clampedT = Math.max(0, Math.min(1, t));
      pushUniquePoint(pts, a.x + (b.x - a.x) * clampedT, a.y + (b.y - a.y) * clampedT);
    }
  }
  if (pts.length < 2) return null;
  if (pts.length === 2) return [pts[0], pts[1]];
  let iBest = 0;
  let jBest = 1;
  let bestD2 = -1;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[j][0] - pts[i][0];
      const dy = pts[j][1] - pts[i][1];
      const d2 = dx * dx + dy * dy;
      if (d2 > bestD2) {
        bestD2 = d2;
        iBest = i;
        jBest = j;
      }
    }
  }
  return [pts[iBest], pts[jBest]];
}
function buildTriangleWireframe(triPositions) {
  const triCount = Math.floor(triPositions.length / 6);
  const positions = new Float32Array(triCount * 12);
  const colors = new Float32Array(triCount * 24);
  let pi = 0;
  let ci = 0;
  const r2 = 0.96, g = 0.97, b = 1, a = 0.33;
  for (let i = 0; i < triCount; i++) {
    const i0 = i * 6;
    const ax = triPositions[i0];
    const ay = triPositions[i0 + 1];
    const bx = triPositions[i0 + 2];
    const by = triPositions[i0 + 3];
    const cx = triPositions[i0 + 4];
    const cy = triPositions[i0 + 5];
    positions[pi++] = ax;
    positions[pi++] = ay;
    positions[pi++] = bx;
    positions[pi++] = by;
    positions[pi++] = bx;
    positions[pi++] = by;
    positions[pi++] = cx;
    positions[pi++] = cy;
    positions[pi++] = cx;
    positions[pi++] = cy;
    positions[pi++] = ax;
    positions[pi++] = ay;
    for (let j = 0; j < 6; j++) {
      colors[ci++] = r2;
      colors[ci++] = g;
      colors[ci++] = b;
      colors[ci++] = a;
    }
  }
  return { positions, colors, vertCount: triCount * 6 };
}
function pushDiamondOutline(pos, col, x, y, size, r2, g, b, a) {
  const up = size;
  const right = size;
  const top = [x, y + up];
  const rightP = [x + right, y];
  const bot = [x, y - up];
  const left = [x - right, y];
  pushLine(pos, col, top[0], top[1], rightP[0], rightP[1], r2, g, b, a);
  pushLine(pos, col, rightP[0], rightP[1], bot[0], bot[1], r2, g, b, a);
  pushLine(pos, col, bot[0], bot[1], left[0], left[1], r2, g, b, a);
  pushLine(pos, col, left[0], left[1], top[0], top[1], r2, g, b, a);
}
function pushSquareOutline(pos, col, x, y, size, r2, g, b, a) {
  const s = size;
  const x0 = x - s, x1 = x + s;
  const y0 = y - s, y1 = y + s;
  pushLine(pos, col, x0, y0, x1, y0, r2, g, b, a);
  pushLine(pos, col, x1, y0, x1, y1, r2, g, b, a);
  pushLine(pos, col, x1, y1, x0, y1, r2, g, b, a);
  pushLine(pos, col, x0, y1, x0, y0, r2, g, b, a);
}
function pushDiamond(pos, col, x, y, size, r2, g, b, a) {
  const up = size;
  const right = size;
  pushTri(pos, col, x, y + up, x + right, y, x, y - up, r2, g, b, a);
  pushTri(pos, col, x, y - up, x - right, y, x, y + up, r2, g, b, a);
}
function pushSquare(pos, col, x, y, size, r2, g, b, a) {
  const s = size;
  const x0 = x - s, x1 = x + s;
  const y0 = y - s, y1 = y + s;
  pushTri(pos, col, x0, y0, x1, y0, x1, y1, r2, g, b, a);
  pushTri(pos, col, x0, y0, x1, y1, x0, y1, r2, g, b, a);
}
function pushHexOutline(pos, col, x, y, radius, rot, r2, g, b, a) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const ang = rot + i / 6 * Math.PI * 2;
    pts.push([x + Math.cos(ang) * radius, y + Math.sin(ang) * radius]);
  }
  for (let i = 0; i < 6; i++) {
    const p0 = pts[i];
    const p1 = pts[(i + 1) % 6];
    pushLine(pos, col, p0[0], p0[1], p1[0], p1[1], r2, g, b, a);
  }
  return 12;
}
function pushPolyFan(pos, col, x, y, radius, sides, rot, r2, g, b, a) {
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const ang = rot + i / sides * Math.PI * 2;
    pts.push([x + Math.cos(ang) * radius, y + Math.sin(ang) * radius]);
  }
  for (let i = 0; i < sides; i++) {
    const p0 = pts[i];
    const p1 = pts[(i + 1) % sides];
    pushTri(pos, col, x, y, p0[0], p0[1], p1[0], p1[1], r2, g, b, a);
  }
  return sides;
}
function pushCircle(pos, col, x, y, radius, r2, g, b, a, seg = 24) {
  const aStart = 0;
  const x0 = x + Math.cos(aStart) * radius;
  const y0 = y + Math.sin(aStart) * radius;
  let px = x0;
  let py = y0;
  for (let i = 1; i <= seg; i++) {
    const ang = i / seg * Math.PI * 2;
    const nx = x + Math.cos(ang) * radius;
    const ny = y + Math.sin(ang) * radius;
    pushLine(pos, col, px, py, nx, ny, r2, g, b, a);
    px = nx;
    py = ny;
  }
  return seg * 2;
}
function pushMiner(pos, col, x, y, jumpCycle, r2, g, b, scale, skipHelmet = false, outlineExpand = 0) {
  const len = Math.hypot(x, y) || 1;
  const upx = x / len;
  const upy = y / len;
  const jumpOffset = 0.5 * jumpCycle * (1 - jumpCycle);
  const tx = -upy;
  const ty = upx;
  const s = scale ?? 1;
  const ox = x + upx * jumpOffset;
  const oy = y + upy * jumpOffset;
  const toWorld = (lx, ly) => [ox + tx * lx + upx * ly, oy + ty * lx + upy * ly];
  let triCount = 0;
  const darken = (v) => Math.max(0, Math.min(1, v * 0.55));
  const tris = [];
  const emitTri = (ax, ay, bx, by, cx, cy, cr, cg, cb, outline = true) => {
    tris.push({ a: [ax, ay], b: [bx, by], c: [cx, cy], col: [cr, cg, cb], outline });
  };
  const quad = (lx0, ly0, lx1, ly1, qr = r2, qg = g, qb = b, outline = true) => {
    const [ax, ay] = toWorld(lx0, ly0);
    const [bx, by] = toWorld(lx1, ly0);
    const [cx, cy] = toWorld(lx1, ly1);
    const [dx, dy] = toWorld(lx0, ly1);
    emitTri(ax, ay, bx, by, cx, cy, qr, qg, qb, outline);
    emitTri(ax, ay, cx, cy, dx, dy, qr, qg, qb, outline);
  };
  const legHalfW = 0.028 * s;
  const legBaseY = 0.08 * s;
  const legTipY = -0.08 * s;
  const legCenterOffset = 0.055 * s;
  const legTri = (cx) => {
    const [aX, aY] = toWorld(cx - legHalfW, legBaseY);
    const [bX, bY] = toWorld(cx + legHalfW, legBaseY);
    const [cX, cY] = toWorld(cx, legTipY);
    emitTri(aX, aY, bX, bY, cX, cY, r2, g, b);
  };
  legTri(-legCenterOffset);
  legTri(legCenterOffset);
  const torsoHalf = 0.08 * s;
  const torsoBottom = legBaseY;
  const torsoTop = torsoBottom + 2 * torsoHalf;
  quad(-torsoHalf, torsoBottom, torsoHalf, torsoTop);
  const shoulderBaseY = torsoTop + 0.02 * s;
  const shoulderTipY = torsoTop - 0.06 * s;
  const shoulderHalfW = 0.14 * s;
  {
    const [aX, aY] = toWorld(-shoulderHalfW, shoulderBaseY);
    const [bX, bY] = toWorld(shoulderHalfW, shoulderBaseY);
    const [cX, cY] = toWorld(0, shoulderTipY);
    emitTri(aX, aY, bX, bY, cX, cY, r2, g, b);
  }
  const headHalf = 0.045 * s;
  const headBottom = shoulderBaseY + 0.01 * s;
  const headTop = headBottom + 2 * headHalf;
  const glassHalf = shoulderHalfW * 0.85;
  const glassBottom = shoulderBaseY - 5e-3 * s;
  const glassTop = headTop + 0.06 * s;
  if (!skipHelmet) {
    const br = 0.25, bg = 0.55, bb = 1;
    quad(-glassHalf, glassBottom, glassHalf, glassTop, br, bg, bb, false);
    quad(-headHalf, headBottom, headHalf, headTop);
  }
  if (tris.length) {
    if (outlineExpand > 0) {
      for (const t of tris) {
        if (!t.outline) continue;
        const ax = t.a[0], ay = t.a[1];
        const bx = t.b[0], by = t.b[1];
        const cx = t.c[0], cy = t.c[1];
        const cxm = (ax + bx + cx) / 3;
        const cym = (ay + by + cy) / 3;
        const da = Math.hypot(ax - cxm, ay - cym);
        const db = Math.hypot(bx - cxm, by - cym);
        const dc = Math.hypot(cx - cxm, cy - cym);
        const maxd = Math.max(da, db, dc);
        if (maxd > 1e-6) {
          const ab = Math.hypot(ax - bx, ay - by);
          const bc = Math.hypot(bx - cx, by - cy);
          const ca = Math.hypot(cx - ax, cy - ay);
          const minEdge = Math.max(1e-6, Math.min(ab, bc, ca));
          const effExpand = Math.min(outlineExpand, minEdge * 0.35);
          const scaleO = (maxd + effExpand) / maxd;
          const sax = cxm + (ax - cxm) * scaleO;
          const say = cym + (ay - cym) * scaleO;
          const sbx = cxm + (bx - cxm) * scaleO;
          const sby = cym + (by - cym) * scaleO;
          const scx = cxm + (cx - cxm) * scaleO;
          const scy = cym + (cy - cym) * scaleO;
          pushTri(pos, col, sax, say, sbx, sby, scx, scy, darken(t.col[0]), darken(t.col[1]), darken(t.col[2]), 1);
          triCount += 1;
        }
      }
    }
    for (const t of tris) {
      pushTri(pos, col, t.a[0], t.a[1], t.b[0], t.b[1], t.c[0], t.c[1], t.col[0], t.col[1], t.col[2], 1);
      triCount += 1;
    }
  }
  return triCount;
}
function pushEnemyShape(pos, col, enemy, baseColor, scale, alpha, useGradient, outlineExpand = 0) {
  const { x, y } = enemy;
  const len = Math.hypot(x, y) || 1;
  let upx = x / len;
  let upy = y / len;
  if (enemy.type === "hunter") {
    const vlen = Math.hypot(enemy.vx || 0, enemy.vy || 0);
    if (vlen > 1e-4) {
      upx = (enemy.vx || 0) / vlen;
      upy = (enemy.vy || 0) / vlen;
    }
  }
  const tx = -upy;
  const ty = upx;
  const r2 = baseColor[0];
  const g = baseColor[1];
  const b = baseColor[2];
  const bright = [Math.min(1, r2 + 0.3), Math.min(1, g + 0.3), Math.min(1, b + 0.3), alpha];
  const dark = [r2 * 0.55, g * 0.55, b * 0.55, alpha];
  const toWorld = (lx, ly) => [x + tx * lx + upx * ly, y + ty * lx + upy * ly];
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const colorFor = (ly) => {
    const t = clamp01(ly / (scale || 1) * 0.5 + 0.5);
    return (
      /** @type {[number,number,number,number]} */
      [
        dark[0] + (bright[0] - dark[0]) * t,
        dark[1] + (bright[1] - dark[1]) * t,
        dark[2] + (bright[2] - dark[2]) * t,
        alpha
      ]
    );
  };
  const tri = (ax, ay, bx, by, cx, cy) => {
    if (outlineExpand > 0) {
      const cxm = (ax + bx + cx) / 3;
      const cym = (ay + by + cy) / 3;
      const da = Math.hypot(ax - cxm, ay - cym);
      const db = Math.hypot(bx - cxm, by - cym);
      const dc = Math.hypot(cx - cxm, cy - cym);
      const maxd = Math.max(da, db, dc);
      if (maxd > 1e-6) {
        const scaleO = (maxd + outlineExpand) / maxd;
        ax = cxm + (ax - cxm) * scaleO;
        ay = cym + (ay - cym) * scaleO;
        bx = cxm + (bx - cxm) * scaleO;
        by = cym + (by - cym) * scaleO;
        cx = cxm + (cx - cxm) * scaleO;
        cy = cym + (cy - cym) * scaleO;
      }
    }
    const [axw, ayw] = toWorld(ax, ay);
    const [bxw, byw] = toWorld(bx, by);
    const [cxw, cyw] = toWorld(cx, cy);
    if (useGradient) {
      const ca = colorFor(ay);
      const cb = colorFor(by);
      const cc = colorFor(cy);
      pushTriColored(pos, col, axw, ayw, bxw, byw, cxw, cyw, ca, cb, cc);
    } else {
      pushTri(pos, col, axw, ayw, bxw, byw, cxw, cyw, r2, g, b, alpha);
    }
  };
  let triCount = 0;
  const s = scale;
  if (enemy.type === "hunter") {
    const topY = 1.1 * s;
    const baseY = -0.55 * s;
    const halfW = 0.8 * s;
    tri(0, topY, -halfW, baseY, halfW, baseY);
    const scale2 = 0.62;
    const offsetY = -0.64 * s;
    tri(0, topY * scale2 + offsetY, -halfW * scale2, baseY * scale2 + offsetY, halfW * scale2, baseY * scale2 + offsetY);
    triCount += 2;
  } else if (enemy.type === "ranger") {
    const ds = 0.8;
    const halfW = 0.75 * s * ds;
    const halfH = 1.05 * s * ds;
    const cxOff = halfW * 0.5;
    const diamond = (cx) => {
      tri(cx, halfH, cx + halfW, 0, cx, -halfH);
      tri(cx, -halfH, cx - halfW, 0, cx, halfH);
    };
    diamond(-cxOff);
    diamond(cxOff);
    triCount += 4;
  } else if (enemy.type === "crawler") {
    const tNow = performance.now() * 1e-3;
    const spin = tNow * 1.6;
    const spikeLen = 1.05 * s;
    const spikeW = 0.28 * s;
    const spikeBack = 0.35 * s;
    for (let i = 0; i < 4; i++) {
      const a = spin + i * Math.PI * 0.5;
      const [tx1, ty1] = rot2(0, spikeLen, a);
      const [tx2, ty2] = rot2(-spikeW, -spikeBack, a);
      const [tx3, ty3] = rot2(spikeW, -spikeBack, a);
      tri(tx1, ty1, tx2, ty2, tx3, ty3);
    }
    triCount += 4;
  } else if (enemy.type === "turret") {
    tri(-0.7 * s, 0.3 * s, 0 * s, 0.3 * s, -0.35 * s, -0.75 * s);
    tri(0 * s, 0.3 * s, 0.7 * s, 0.3 * s, 0.35 * s, -0.75 * s);
    tri(0, 0.05 * s, 0.6 * s, 0.55 * s, -0.6 * s, 0.55 * s);
    triCount += 3;
  } else {
    tri(-0.75 * s, 0.3 * s, 0 * s, 0.3 * s, -1.05 * s, -0.95 * s);
    tri(0 * s, 0.3 * s, 0.75 * s, 0.3 * s, 1.05 * s, -0.95 * s);
    tri(0, 0.05 * s, 0.6 * s, 0.55 * s, -0.6 * s, 0.55 * s);
    triCount += 3;
  }
  return triCount;
}
function vScaleStopping(planet, x, y, vx, vy, thrust) {
  const { x: gx, y: gy } = planet.gravityAt(x, y);
  const speed = Math.hypot(vx, vy);
  if (speed < 1e-6) {
    return 0;
  }
  const deceleration = thrust - (gx * vx + gy * vy) / speed;
  const dt = speed / deceleration;
  const dist = 0.5 * Math.abs(deceleration) * dt * dt;
  return dist / speed;
}
function minerColor(minerType) {
  if (minerType === "pilot") {
    return [0.1, 0.25, 0.98];
  } else if (minerType === "engineer") {
    return [0.2, 0.98, 0.2];
  } else {
    return [0.98, 0.85, 0.25];
  }
}
function drawFrameImpl(renderer2, state, planet) {
  const {
    gl,
    canvas: canvas2,
    game,
    prog,
    oprog,
    vao,
    oVao,
    uScale,
    uCam,
    uRot,
    uFog,
    uRockDark,
    uRockLight,
    uSurfaceRockDark,
    uSurfaceRockLight,
    uAirDark,
    uAirLight,
    uSurfaceBand,
    uRmax,
    uMeshRmax,
    ouScale,
    ouCam,
    ouRot,
    oPos,
    oCol,
    planetWireVao,
    planetWireVertCount,
    starProg,
    starVao,
    starRot,
    starTime,
    starAspect,
    starSpan,
    starSaturation,
    starVertCount
  } = renderer2;
  const vertCount = renderer2.vertCount;
  renderer2.resize();
  gl.viewport(0, 0, canvas2.width, canvas2.height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  const camRot = state.view.angle;
  const s = 1 / state.view.radius;
  let sx, sy;
  if (canvas2.width > canvas2.height) {
    sy = s;
    sx = s * canvas2.height / canvas2.width;
  } else {
    sx = s;
    sy = s * canvas2.width / canvas2.height;
  }
  if (starProg && starVao && starVertCount) {
    gl.useProgram(starProg);
    gl.bindVertexArray(starVao);
    const aspect = canvas2.width / Math.max(1, canvas2.height);
    const span = Math.max(aspect, 1 / aspect) * 1.15;
    if (starRot) gl.uniform1f(starRot, camRot);
    if (starAspect) {
      const ax = aspect >= 1 ? 1 / aspect : 1;
      const ay = aspect >= 1 ? 1 : aspect;
      gl.uniform2f(starAspect, ax, ay);
    }
    if (starSpan) gl.uniform1f(starSpan, span);
    if (starSaturation) gl.uniform1f(starSaturation, CFG.STAR_SATURATION ?? 1);
    if (starTime) gl.uniform1f(starTime, performance.now() * 1e-3);
    gl.drawArrays(gl.TRIANGLES, 0, starVertCount);
    gl.bindVertexArray(null);
  }
  gl.useProgram(prog);
  gl.bindVertexArray(vao);
  gl.uniform2f(uScale, sx, sy);
  gl.uniform2f(uCam, state.view.xCenter, state.view.yCenter);
  gl.uniform1f(uRot, camRot);
  gl.uniform1f(uFog, state.fogEnabled ? 1 : 0);
  const palette = state.planetPalette || null;
  const rockDark = palette && palette.rockDark ? palette.rockDark : CFG.ROCK_DARK;
  const rockLight = palette && palette.rockLight ? palette.rockLight : CFG.ROCK_LIGHT;
  const airDark = palette && palette.airDark ? palette.airDark : CFG.AIR_DARK;
  const airLight = palette && palette.airLight ? palette.airLight : CFG.AIR_LIGHT;
  const surfaceRockDark = palette && palette.surfaceRockDark ? palette.surfaceRockDark : rockDark;
  const surfaceRockLight = palette && palette.surfaceRockLight ? palette.surfaceRockLight : rockLight;
  const band = palette && typeof palette.surfaceBand === "number" ? palette.surfaceBand : 0;
  if (uRockDark) gl.uniform3fv(uRockDark, rockDark);
  if (uRockLight) gl.uniform3fv(uRockLight, rockLight);
  if (uSurfaceRockDark) gl.uniform3fv(uSurfaceRockDark, surfaceRockDark);
  if (uSurfaceRockLight) gl.uniform3fv(uSurfaceRockLight, surfaceRockLight);
  if (uAirDark) gl.uniform3fv(uAirDark, airDark);
  if (uAirLight) gl.uniform3fv(uAirLight, airLight);
  if (uSurfaceBand) gl.uniform1f(uSurfaceBand, band);
  const params = planet.getPlanetParams ? planet.getPlanetParams() : null;
  const rMax = params && params.RMAX ? params.RMAX : CFG.RMAX;
  if (uRmax) gl.uniform1f(uRmax, rMax);
  if (uMeshRmax) gl.uniform1f(uMeshRmax, planet.radial ? planet.radial.rings.length - 1 : rMax);
  if (renderer2.uMaxR) gl.uniform1f(renderer2.uMaxR, rMax + 0.5);
  gl.drawArrays(gl.TRIANGLES, 0, vertCount);
  gl.bindVertexArray(null);
  const shipHWorld = 0.7 * game.SHIP_SCALE;
  const shipWWorld = 0.75 * game.SHIP_SCALE;
  const bodyLiftN = 0.18;
  const skiLiftN = 0;
  const cabinSide = state.ship.cabinSide || 1;
  const cargoHeightScale = 2;
  const cargoWidthScale = 2 / 3;
  const cargoBottomN = -0.35;
  const cargoHeightN = (0.18 - cargoBottomN) * cargoHeightScale;
  const cargoTopN = cargoBottomN + cargoHeightN;
  const cargoMidN = (cargoBottomN + cargoTopN) * 0.5;
  const oldCargoMidN = (0.18 + -0.35) * 0.5;
  const thrustLiftAll = (cargoMidN - oldCargoMidN) * shipHWorld * 1;
  const thrustDownExtraUp = shipHWorld * 0.18;
  const thrustUpExtraDown = shipHWorld * -0.12;
  const pos = [];
  const col = [];
  let triVerts = 0;
  let lineVerts = 0;
  let pointVerts = 0;
  {
    const cfg = planet.getPlanetConfig ? planet.getPlanetConfig() : null;
    const atmo = cfg && cfg.defaults && cfg.defaults.ATMOSPHERE ? cfg.defaults.ATMOSPHERE : null;
    if (!atmo) ;
    else {
      const rings = planet.radial && planet.radial.rings ? planet.radial.rings : null;
      let outerR = rMax;
      let ringStep = 1;
      if (rings && rings.length >= 2) {
        const ringOuter = rings[rings.length - 1];
        const ringInner = rings[rings.length - 2];
        if (ringOuter && ringOuter.length) {
          let acc = 0;
          for (const v of ringOuter) acc += Math.hypot(v.x, v.y);
          outerR = acc / ringOuter.length;
        }
        if (ringInner && ringInner.length) {
          let acc = 0;
          for (const v of ringInner) acc += Math.hypot(v.x, v.y);
          const innerR2 = acc / ringInner.length;
          ringStep = Math.max(0.5, outerR - innerR2);
        }
      }
      const ringCount = Math.max(1, atmo.ringCount || 1);
      const ringOffset = atmo.ringOffset || 0;
      const innerR = outerR + ringStep * ringOffset;
      const outerR2 = innerR + ringStep * ringCount;
      const segs = 96;
      const cIn = atmo.inner || [0.45, 0.72, 1, 0.22];
      const cOut = atmo.outer || [0.45, 0.72, 1, 0];
      for (let i = 0; i < segs; i++) {
        const a0 = i / segs * Math.PI * 2;
        const a1 = (i + 1) / segs * Math.PI * 2;
        const x0i = Math.cos(a0) * innerR;
        const y0i = Math.sin(a0) * innerR;
        const x1i = Math.cos(a1) * innerR;
        const y1i = Math.sin(a1) * innerR;
        const x0o = Math.cos(a0) * outerR2;
        const y0o = Math.sin(a0) * outerR2;
        const x1o = Math.cos(a1) * outerR2;
        const y1o = Math.sin(a1) * outerR2;
        pushTriColored(pos, col, x0i, y0i, x0o, y0o, x1o, y1o, cIn, cOut, cOut);
        pushTriColored(pos, col, x0i, y0i, x1o, y1o, x1i, y1i, cIn, cOut, cIn);
        triVerts += 6;
      }
    }
  }
  const shipRot = -Math.atan2(state.ship.x, state.ship.y || 1e-6);
  const lighten = (c) => Math.min(1, c + 0.3);
  const rockPoint = [1, 0.55, 0.12];
  const airPoint = [lighten(airLight[0]), lighten(airLight[1]), lighten(airLight[2])];
  const now = performance.now() * 1e-3;
  const invertT = Math.max(0, state.ship.invertT || 0);
  const invertPulse = invertT > 0 ? 0.55 + 0.45 * Math.sin(now * 8) : 0;
  const invertMix = invertT > 0 ? Math.min(0.65, 0.25 + 0.35 * invertPulse) : 0;
  const invertTint = [0.72, 0.25, 0.9];
  const hitCooldownT = state.ship.state !== "crashed" ? Math.max(0, state.ship.hitCooldown || 0) : 0;
  const hitCooldownMax = Math.max(1e-6, game.SHIP_HIT_COOLDOWN || 1);
  const damageNorm = hitCooldownT > 0 ? Math.min(1, hitCooldownT / hitCooldownMax) : 0;
  const damagePulse = damageNorm > 0 ? 0.5 + 0.5 * Math.sin(now * 22) : 0;
  const damageMix = damageNorm > 0 ? (0.18 + 0.42 * damagePulse) * damageNorm : 0;
  const damageTint = [1, 0.12, 0.12];
  const lowHullPulse = state.ship.state !== "crashed" && state.ship.hpCur === 1 ? Math.pow(Math.max(0, Math.sin(now * 4.2)), 7) : 0;
  const lowHullMix = lowHullPulse > 0 ? 0.48 * lowHullPulse : 0;
  const lowHullTint = [1, 0.14, 0.14];
  const applyTint = (cr, cg, cb) => {
    let outR = cr;
    let outG = cg;
    let outB = cb;
    if (invertMix) {
      outR = outR * (1 - invertMix) + invertTint[0] * invertMix;
      outG = outG * (1 - invertMix) + invertTint[1] * invertMix;
      outB = outB * (1 - invertMix) + invertTint[2] * invertMix;
    }
    if (damageMix) {
      outR = outR * (1 - damageMix) + damageTint[0] * damageMix;
      outG = outG * (1 - damageMix) + damageTint[1] * damageMix;
      outB = outB * (1 - damageMix) + damageTint[2] * damageMix;
    }
    if (lowHullMix) {
      outR = outR * (1 - lowHullMix) + lowHullTint[0] * lowHullMix;
      outG = outG * (1 - lowHullMix) + lowHullTint[1] * lowHullMix;
      outB = outB * (1 - lowHullMix) + lowHullTint[2] * lowHullMix;
    }
    return [outR, outG, outB];
  };
  const toShipWorldLocal = (lx, ly) => {
    const [wx, wy] = rot2(lx, ly, shipRot);
    return [state.ship.x + wx, state.ship.y + wy];
  };
  const L = (x, y, liftN = 0) => {
    return toShipWorldLocal(x * shipWWorld, (y + liftN) * shipHWorld);
  };
  const shipOutlineSize = 1 / 16;
  const shipTris = [];
  const gunTris = [];
  const windowTris = [];
  const upLen = Math.hypot(state.ship.x, state.ship.y) || 1;
  const upx = state.ship.x / upLen;
  const upy = state.ship.y / upLen;
  const topY = (cargoTopN + bodyLiftN) * shipHWorld;
  const bottomY = (cargoBottomN + bodyLiftN) * shipHWorld;
  const silverTop = [0.85, 0.87, 0.9];
  const silverBottom = [0.55, 0.58, 0.62];
  const addTri = (list, ax, ay, bx, by, cx, cy, cr, cg, cb, ca = 1, outline = true) => {
    const tinted = applyTint(cr, cg, cb);
    list.push({
      a: [ax, ay],
      b: [bx, by],
      c: [cx, cy],
      col: [tinted[0], tinted[1], tinted[2], ca],
      outline
    });
  };
  const addShipTri = (list, ax, ay, bx, by, cx, cy, ly, outline = true) => {
    const mx = (ax + bx + cx) / 3;
    const my = (ay + by + cy) / 3;
    const localY = (mx - state.ship.x) * upx + (my - state.ship.y) * upy;
    const t = Math.max(0, Math.min(1, (localY - bottomY) / Math.max(1e-6, topY - bottomY)));
    const cr = silverBottom[0] + (silverTop[0] - silverBottom[0]) * t;
    const cg = silverBottom[1] + (silverTop[1] - silverBottom[1]) * t;
    const cb = silverBottom[2] + (silverTop[2] - silverBottom[2]) * t;
    addTri(list, ax, ay, bx, by, cx, cy, cr, cg, cb, 1, outline);
  };
  const drawTurretPadProp = (p) => {
    let ux;
    let uy;
    if (typeof p.padNx === "number" && typeof p.padNy === "number") {
      const nlen = Math.hypot(p.padNx, p.padNy) || 1;
      ux = p.padNx / nlen;
      uy = p.padNy / nlen;
    } else {
      const info = planet.surfaceInfoAtWorld ? planet.surfaceInfoAtWorld(p.x, p.y, 0.18) : null;
      if (info) {
        ux = info.nx;
        uy = info.ny;
      }
    }
    let tx;
    let ty;
    if (ux !== void 0 && uy !== void 0) {
      tx = -uy;
      ty = ux;
    } else {
      const len = Math.hypot(p.x, p.y) || 1;
      ux = p.x / len;
      uy = p.y / len;
      tx = -uy;
      ty = ux;
    }
    const s2 = p.scale || 1;
    const halfW = 0.55 * s2;
    const halfH = 0.12 * s2;
    const sink = halfH + 0.02 * s2;
    const cx = p.x - ux * sink;
    const cy = p.y - uy * sink;
    const toWorld = (x, y, lx, ly) => [x + tx * lx + ux * ly, y + ty * lx + uy * ly];
    const a0 = toWorld(cx, cy, -halfW, -halfH);
    const a1 = toWorld(cx, cy, halfW, -halfH);
    const a2 = toWorld(cx, cy, halfW, halfH);
    const a3 = toWorld(cx, cy, -halfW, halfH);
    pushTri(pos, col, a0[0], a0[1], a1[0], a1[1], a2[0], a2[1], 0.28, 0.28, 0.3, 0.95);
    pushTri(pos, col, a0[0], a0[1], a2[0], a2[1], a3[0], a3[1], 0.28, 0.28, 0.3, 0.95);
    triVerts += 6;
  };
  const appendShipGeometry = () => {
    if (state.ship.state === "crashed") return;
    {
      const bottomHalfW = 0.85 * cargoWidthScale;
      const topHalfW = 0.6 * cargoWidthScale * 0.8;
      const lb = L(-bottomHalfW, cargoBottomN, bodyLiftN);
      const rb = L(bottomHalfW, cargoBottomN, bodyLiftN);
      const rt = L(topHalfW, cargoTopN, bodyLiftN);
      const lt = L(-topHalfW, cargoTopN, bodyLiftN);
      addShipTri(shipTris, lb[0], lb[1], rb[0], rb[1], rt[0], rt[1]);
      addShipTri(shipTris, lb[0], lb[1], rt[0], rt[1], lt[0], lt[1]);
      const cabOffset = 0.75 * cargoWidthScale * cabinSide;
      const cabHalfW = 0.28 * cargoWidthScale * 1.3;
      const cabBaseY = cargoBottomN;
      const cabTipY = cargoTopN;
      const cabTip = L(cabOffset, cabTipY, bodyLiftN);
      const cabBL = L(cabOffset - cabHalfW, cabBaseY, bodyLiftN);
      const cabBR = L(cabOffset + cabHalfW, cabBaseY, bodyLiftN);
      addShipTri(shipTris, cabBL[0], cabBL[1], cabBR[0], cabBR[1], cabTip[0], cabTip[1]);
      const winHalfW = cabHalfW * 0.5;
      const winBaseY = cabBaseY + (cabTipY - cabBaseY) * 0.25;
      const winTipY = cabBaseY + (cabTipY - cabBaseY) * 0.8;
      const winTip = L(cabOffset, winTipY, bodyLiftN);
      const winBL = L(cabOffset - winHalfW, winBaseY, bodyLiftN);
      const winBR = L(cabOffset + winHalfW, winBaseY, bodyLiftN);
      addTri(windowTris, winBL[0], winBL[1], winBR[0], winBR[1], winTip[0], winTip[1], 0.05, 0.05, 0.05, 1, false);
      const gunLen = shipHWorld * 1.05;
      const gunHalfW = shipWWorld * 0.09;
      const mountOffset = gunLen * 0.25;
      const [mountCx, mountCy] = L(0, cargoTopN + 0.12 + 0.04, bodyLiftN);
      let dirx = 0;
      let diry = 0;
      if (state.aimWorld) {
        const ao = state.aimOrigin || state.ship;
        dirx = state.aimWorld.x - ao.x;
        diry = state.aimWorld.y - ao.y;
        const dlen = Math.hypot(dirx, diry);
        if (dlen > 1e-4) {
          dirx /= dlen;
          diry /= dlen;
        } else {
          dirx = cabinSide;
          diry = 0;
        }
      } else if (state.ship.state === "landed") {
        const rightx = upy;
        const righty = -upx;
        dirx = rightx * cabinSide;
        diry = righty * cabinSide;
      } else {
        const r2 = Math.hypot(state.ship.x, state.ship.y) || 1;
        dirx = state.ship.x / r2;
        diry = state.ship.y / r2;
      }
      const px = -diry;
      const py = dirx;
      const gmx = mountCx;
      const gmy = mountCy;
      const backCx = gmx - dirx * mountOffset;
      const backCy = gmy - diry * mountOffset;
      const frontCx = backCx + dirx * gunLen;
      const frontCy = backCy + diry * gunLen;
      const backL = [backCx + px * gunHalfW, backCy + py * gunHalfW];
      const backR = [backCx - px * gunHalfW, backCy - py * gunHalfW];
      const frontL = [frontCx + px * gunHalfW, frontCy + py * gunHalfW];
      const frontR = [frontCx - px * gunHalfW, frontCy - py * gunHalfW];
      addShipTri(gunTris, backL[0], backL[1], backR[0], backR[1], frontR[0], frontR[1], void 0, true);
      addShipTri(gunTris, backL[0], backL[1], frontR[0], frontR[1], frontL[0], frontL[1], void 0, true);
      const gstrutW = 0.05;
      const gsb0 = L(-gstrutW, cargoTopN, bodyLiftN);
      const gsb1 = L(gstrutW, cargoTopN, bodyLiftN);
      const gst0 = L(-gstrutW, cargoTopN + 0.12, bodyLiftN);
      const gst1 = L(gstrutW, cargoTopN + 0.12, bodyLiftN);
      addShipTri(shipTris, gsb0[0], gsb0[1], gsb1[0], gsb1[1], gst1[0], gst1[1], void 0, false);
      addShipTri(shipTris, gsb0[0], gsb0[1], gst1[0], gst1[1], gst0[0], gst0[1], void 0, false);
      const skiY0 = cargoBottomN;
      const skiY1 = skiY0 + 0.05;
      const skiHalfW = 0.2;
      const skiOffset = 0.32;
      const skiL0 = L(-skiOffset - skiHalfW, skiY0, skiLiftN);
      const skiL1 = L(-skiOffset + skiHalfW, skiY0, skiLiftN);
      const skiL2 = L(-skiOffset + skiHalfW, skiY1, skiLiftN);
      const skiL3 = L(-skiOffset - skiHalfW, skiY1, skiLiftN);
      addShipTri(shipTris, skiL0[0], skiL0[1], skiL1[0], skiL1[1], skiL2[0], skiL2[1]);
      addShipTri(shipTris, skiL0[0], skiL0[1], skiL2[0], skiL2[1], skiL3[0], skiL3[1]);
      const skiR0 = L(skiOffset - skiHalfW, skiY0, skiLiftN);
      const skiR1 = L(skiOffset + skiHalfW, skiY0, skiLiftN);
      const skiR2 = L(skiOffset + skiHalfW, skiY1, skiLiftN);
      const skiR3 = L(skiOffset - skiHalfW, skiY1, skiLiftN);
      addShipTri(shipTris, skiR0[0], skiR0[1], skiR1[0], skiR1[1], skiR2[0], skiR2[1]);
      addShipTri(shipTris, skiR0[0], skiR0[1], skiR2[0], skiR2[1], skiR3[0], skiR3[1]);
      const strutW = 0.05;
      const strutTop = cargoBottomN;
      const strutBot = skiY1 + 0.01;
      const sL0 = L(-skiOffset - strutW, strutBot, skiLiftN);
      const sL1 = L(-skiOffset + strutW, strutBot, skiLiftN);
      const sL2 = L(-skiOffset + strutW, strutTop, bodyLiftN);
      const sL3 = L(-skiOffset - strutW, strutTop, bodyLiftN);
      addShipTri(shipTris, sL0[0], sL0[1], sL1[0], sL1[1], sL2[0], sL2[1], void 0, false);
      addShipTri(shipTris, sL0[0], sL0[1], sL2[0], sL2[1], sL3[0], sL3[1], void 0, false);
      const sR0 = L(skiOffset - strutW, strutBot, skiLiftN);
      const sR1 = L(skiOffset + strutW, strutBot, skiLiftN);
      const sR2 = L(skiOffset + strutW, strutTop, bodyLiftN);
      const sR3 = L(skiOffset - strutW, strutTop, bodyLiftN);
      addShipTri(shipTris, sR0[0], sR0[1], sR1[0], sR1[1], sR2[0], sR2[1], void 0, false);
      addShipTri(shipTris, sR0[0], sR0[1], sR2[0], sR2[1], sR3[0], sR3[1], void 0, false);
    }
  };
  if (state.enemies && state.enemies.length) {
    const tNow = performance.now() * 1e-3;
    const outlineSize = 1 / 16;
    for (const enemy of state.enemies) {
      if (state.fogEnabled && !planet.fogSeenAt(enemy.x, enemy.y)) continue;
      const enemyRender = enemy;
      let base;
      if (enemy.type === "hunter") {
        base = [0.92, 0.25, 0.2];
      } else if (enemy.type === "ranger") {
        base = [0.2, 0.75, 0.95];
      } else if (enemy.type === "crawler") {
        base = [0.95, 0.55, 0.2];
      } else {
        base = [0.5, 0.125, 1];
      }
      const outline = (
        /** @type {[number,number,number]} */
        [base[0] * 0.55, base[1] * 0.55, base[2] * 0.55]
      );
      triVerts += pushEnemyShape(pos, col, enemyRender, outline, game.ENEMY_SCALE, 1, false, outlineSize) * 3;
      triVerts += pushEnemyShape(pos, col, enemyRender, base, game.ENEMY_SCALE, 1, true) * 3;
      if (enemy.hitT && enemy.hitT > 0) {
        const pulse = 0.5 + 0.5 * Math.sin(tNow * 14);
        const alpha = 0.25 + pulse * 0.45;
        triVerts += pushEnemyShape(pos, col, enemyRender, [1, 0.2, 0.2], game.ENEMY_SCALE * 1.08, alpha, false) * 3;
      }
    }
  }
  if (state.mothership) {
    const m = state.mothership;
    const c = Math.cos(m.angle);
    const s3 = Math.sin(m.angle);
    const points = m.renderPoints || m.points;
    const tris = m.renderTris || m.tris;
    const drawTri = (tri, isWall) => {
      const a = points[tri[0]];
      const b = points[tri[1]];
      const d = points[tri[2]];
      const ax = m.x + c * a.x - s3 * a.y;
      const ay = m.y + s3 * a.x + c * a.y;
      const bx = m.x + c * b.x - s3 * b.y;
      const by = m.y + s3 * b.x + c * b.y;
      const cx = m.x + c * d.x - s3 * d.y;
      const cy = m.y + s3 * d.x + c * d.y;
      if (isWall) {
        pushTri(pos, col, ax, ay, bx, by, cx, cy, 0.78, 0.78, 0.78, 0.98);
      } else {
        pushTri(pos, col, ax, ay, bx, by, cx, cy, 0.2, 0.2, 0.2, 0.98);
      }
      triVerts += 3;
    };
    const triIsWall = (tri, idx) => {
      if (m.triAir && idx < m.triAir.length) {
        return m.triAir[idx] <= 0.5;
      }
      const a = points[tri[0]];
      const b = points[tri[1]];
      const d = points[tri[2]];
      const aAir = "air" in a ? a.air : 1;
      const bAir = "air" in b ? b.air : 1;
      const cAir = "air" in d ? d.air : 1;
      return (aAir + bAir + cAir) / 3 <= 0.5;
    };
    for (let i = 0; i < tris.length; i++) {
      const tri = tris[i];
      if (!triIsWall(tri, i)) drawTri(tri, false);
    }
    for (let i = 0; i < tris.length; i++) {
      const tri = tris[i];
      if (triIsWall(tri, i)) drawTri(tri, true);
    }
    {
      const rotCos = Math.cos(state.mothership.angle);
      const rotSin = Math.sin(state.mothership.angle);
      const minerLocalRangeX = 3.5;
      const minerLocalCenterX = 0.25;
      const minerLocalY = 0.8;
      const numMinersVisible = Math.min(state.ship.mothershipMiners, 20);
      const numPilotsVisible = state.ship.mothershipPilots;
      const numEngineersVisible = Math.min(state.ship.mothershipEngineers, 10);
      const totalMiners = numMinersVisible + numPilotsVisible + numEngineersVisible;
      const minerLocalStepX = Math.min(0.15, minerLocalRangeX / Math.max(1, totalMiners - 1));
      const minerLocalMinX = minerLocalCenterX - minerLocalStepX * totalMiners / 2;
      let x = 0;
      for (let i = 0; i < totalMiners; ++i) {
        const minerLocalX = minerLocalMinX + x;
        const minerWorldX = state.mothership.x + minerLocalX * rotCos - minerLocalY * rotSin;
        const minerWorldY = state.mothership.y + minerLocalX * rotSin + minerLocalY * rotCos;
        const minerType = i < numPilotsVisible ? "pilot" : i < numPilotsVisible + numEngineersVisible ? "engineer" : "miner";
        const [r2, g, b] = minerColor(minerType);
        triVerts += pushMiner(pos, col, minerWorldX, minerWorldY, 0, r2, g, b, game.MINER_SCALE, false, 1 / 16) * 3;
        x += minerLocalStepX;
      }
    }
  }
  {
    const levelProps = planet.props;
    if (levelProps && levelProps.length) {
      for (const p of levelProps) {
        if (p.type !== "turret_pad") continue;
        if (p.dead || typeof p.hp === "number" && p.hp <= 0) continue;
        if (state.fogEnabled && !planet.fogSeenAt(p.x, p.y)) continue;
        drawTurretPadProp(p);
      }
    }
  }
  appendShipGeometry();
  if (shipTris.length) {
    for (const t of shipTris) {
      if (!t.outline) continue;
      const ax = t.a[0], ay = t.a[1];
      const bx = t.b[0], by = t.b[1];
      const cx = t.c[0], cy = t.c[1];
      const cxm = (ax + bx + cx) / 3;
      const cym = (ay + by + cy) / 3;
      const da = Math.hypot(ax - cxm, ay - cym);
      const db = Math.hypot(bx - cxm, by - cym);
      const dc = Math.hypot(cx - cxm, cy - cym);
      const maxd = Math.max(da, db, dc);
      const scaleO = maxd > 1e-6 ? (maxd + shipOutlineSize) / maxd : 1;
      const sax = cxm + (ax - cxm) * scaleO;
      const say = cym + (ay - cym) * scaleO;
      const sbx = cxm + (bx - cxm) * scaleO;
      const sby = cym + (by - cym) * scaleO;
      const scx = cxm + (cx - cxm) * scaleO;
      const scy = cym + (cy - cym) * scaleO;
      pushTri(pos, col, sax, say, sbx, sby, scx, scy, t.col[0] * 0.55, t.col[1] * 0.55, t.col[2] * 0.55, t.col[3]);
      triVerts += 3;
    }
    for (const t of shipTris) {
      pushTri(pos, col, t.a[0], t.a[1], t.b[0], t.b[1], t.c[0], t.c[1], t.col[0], t.col[1], t.col[2], t.col[3]);
      triVerts += 3;
    }
  }
  if (windowTris.length) {
    for (const t of windowTris) {
      pushTri(pos, col, t.a[0], t.a[1], t.b[0], t.b[1], t.c[0], t.c[1], t.col[0], t.col[1], t.col[2], t.col[3]);
      triVerts += 3;
    }
  }
  if (gunTris.length) {
    for (const t of gunTris) {
      if (!t.outline) continue;
      const ax = t.a[0], ay = t.a[1];
      const bx = t.b[0], by = t.b[1];
      const cx = t.c[0], cy = t.c[1];
      const cxm = (ax + bx + cx) / 3;
      const cym = (ay + by + cy) / 3;
      const da = Math.hypot(ax - cxm, ay - cym);
      const db = Math.hypot(bx - cxm, by - cym);
      const dc = Math.hypot(cx - cxm, cy - cym);
      const maxd = Math.max(da, db, dc);
      const scaleO = maxd > 1e-6 ? (maxd + shipOutlineSize) / maxd : 1;
      const sax = cxm + (ax - cxm) * scaleO;
      const say = cym + (ay - cym) * scaleO;
      const sbx = cxm + (bx - cxm) * scaleO;
      const sby = cym + (by - cym) * scaleO;
      const scx = cxm + (cx - cxm) * scaleO;
      const scy = cym + (cy - cym) * scaleO;
      pushTri(pos, col, sax, say, sbx, sby, scx, scy, t.col[0] * 0.55, t.col[1] * 0.55, t.col[2] * 0.55, t.col[3]);
      triVerts += 3;
    }
    for (const t of gunTris) {
      pushTri(pos, col, t.a[0], t.a[1], t.b[0], t.b[1], t.c[0], t.c[1], t.col[0], t.col[1], t.col[2], t.col[3]);
      triVerts += 3;
    }
  }
  if (state.miners && state.miners.length) {
    for (const miner of state.miners) {
      if (state.fogEnabled && !planet.fogSeenAt(miner.x, miner.y)) continue;
      const [r2, g, b] = minerColor(miner.type);
      triVerts += pushMiner(pos, col, miner.x, miner.y, miner.jumpCycle, r2, g, b, game.MINER_SCALE, false, 1 / 16) * 3;
    }
  }
  if (state.shots && state.shots.length) {
    const size = 0.1;
    for (const s2 of state.shots) {
      if (s2.owner === "hunter") pushDiamond(pos, col, s2.x, s2.y, size, 1, 0.35, 0.3, 0.9);
      else if (s2.owner === "ranger") pushDiamond(pos, col, s2.x, s2.y, size, 0.3, 0.8, 1, 0.9);
      else pushDiamond(pos, col, s2.x, s2.y, size, 0.5, 0.125, 1, 0.9);
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
  const featureParticles = state.featureParticles || null;
  const lavaParticles = featureParticles ? featureParticles.lava : null;
  if (lavaParticles && lavaParticles.length) {
    const size = 0.1;
    for (const p of lavaParticles) {
      if (state.fogEnabled && !planet.fogSeenAt(p.x, p.y)) continue;
      pushDiamond(pos, col, p.x, p.y, size, 1, 0.25, 0.15, 0.95);
      triVerts += 6;
    }
  }
  const mushroomParticles = featureParticles ? featureParticles.mushroom : null;
  if (mushroomParticles && mushroomParticles.length) {
    const size = 0.12;
    for (const p of mushroomParticles) {
      if (state.fogEnabled && !planet.fogSeenAt(p.x, p.y)) continue;
      pushDiamond(pos, col, p.x, p.y, size, 0.95, 0.45, 0.75, 0.95);
      triVerts += 6;
    }
  }
  const splashParticles = featureParticles ? featureParticles.splashes : null;
  if (splashParticles && splashParticles.length) {
    for (const p of splashParticles) {
      if (state.fogEnabled && !planet.fogSeenAt(p.x, p.y)) continue;
      const lifeN = p.maxLife && p.maxLife > 0 ? Math.max(0, Math.min(1, p.life / p.maxLife)) : 1;
      const vlen = Math.hypot(p.vx || 0, p.vy || 0);
      let ux = 1;
      let uy = 0;
      if (vlen > 1e-4) {
        ux = (p.vx || 0) / vlen;
        uy = (p.vy || 0) / vlen;
      } else {
        const r2 = Math.hypot(p.x, p.y) || 1;
        ux = p.x / r2;
        uy = p.y / r2;
      }
      const tx = -uy;
      const ty = ux;
      const size = (p.size || 0.1) * (0.8 + 0.35 * lifeN);
      const tipX = p.x + ux * (size * 0.95);
      const tipY = p.y + uy * (size * 0.95);
      const baseX = p.x - ux * (size * 0.42);
      const baseY = p.y - uy * (size * 0.42);
      const blX = baseX + tx * (size * 0.38);
      const blY = baseY + ty * (size * 0.38);
      const brX = baseX - tx * (size * 0.38);
      const brY = baseY - ty * (size * 0.38);
      const cr = typeof p.cr === "number" ? p.cr : 0.18;
      const cg = typeof p.cg === "number" ? p.cg : 0.52;
      const cb = typeof p.cb === "number" ? p.cb : 0.86;
      pushTri(pos, col, blX, blY, brX, brY, tipX, tipY, cr, cg, cb, 0.9 * lifeN);
      triVerts += 3;
    }
  }
  const coreR = planet.getCoreRadius ? planet.getCoreRadius() : 0;
  if (coreR > 0) {
    const params2 = planet.getPlanetParams ? planet.getPlanetParams() : null;
    const moltenOuter = params2 && typeof params2.MOLTEN_RING_OUTER === "number" ? params2.MOLTEN_RING_OUTER : 0;
    const r0 = coreR + 0.5;
    const baseOuter = moltenOuter > coreR ? moltenOuter : coreR + 0.8;
    const r1 = baseOuter + 0.5;
    const steps = 7;
    const pulse = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(now * 1.6));
    for (let i = 0; i < steps; i++) {
      const t = (i + 1) / steps;
      const r2 = r0 + (r1 - r0) * t;
      const root = Math.sqrt(Math.max(0, 1 - t));
      const exp = Math.exp(-2.2 * t);
      const a = 0.85 * root * exp * pulse;
      triVerts += pushPolyFan(pos, col, 0, 0, r2, 28, 0, 1, 0.25, 0.12, a) * 3;
    }
    triVerts += pushPolyFan(pos, col, 0, 0, r0, 28, 0, 1, 0.45, 0.2, 0.9) * 3;
  }
  const props = planet.props;
  if (props && props.length) {
    const basisAt = (x, y) => {
      const len = Math.hypot(x, y) || 1;
      const ux = x / len;
      const uy = y / len;
      const tx = -uy;
      const ty = ux;
      return { ux, uy, tx, ty };
    };
    const toWorld = (x, y, tx, ty, ux, uy, lx, ly) => {
      return [x + tx * lx + ux * ly, y + ty * lx + uy * ly];
    };
    for (const p of props) {
      if (p.dead || typeof p.hp === "number" && p.hp <= 0) continue;
      if (state.fogEnabled && !planet.fogSeenAt(p.x, p.y)) continue;
      if (p.type === "bubble_hex") continue;
      const rot = (p.rot || 0) + (p.rotSpeed ? p.rotSpeed * now : 0);
      const s2 = p.scale || 1;
      if (p.type === "turret_pad") {
        continue;
      } else if (p.type === "boulder") {
        triVerts += pushPolyFan(pos, col, p.x, p.y, 0.3 * s2, 7, rot, 0.45, 0.45, 0.48, 0.95) * 3;
        triVerts += pushPolyFan(pos, col, p.x, p.y, 0.18 * s2, 7, rot, 0.35, 0.35, 0.37, 0.95) * 3;
      } else if (p.type === "ridge_spike") {
        let ux, uy, tx, ty;
        if (typeof p.nx === "number" && typeof p.ny === "number") {
          const nlen = Math.hypot(p.nx, p.ny) || 1;
          ux = p.nx / nlen;
          uy = p.ny / nlen;
          tx = -uy;
          ty = ux;
        } else {
          ({ ux, uy, tx, ty } = basisAt(p.x, p.y));
        }
        const cx = p.x - ux * 0.02 * s2;
        const cy = p.y - uy * 0.02 * s2;
        const tip = toWorld(cx, cy, tx, ty, ux, uy, 0, 0.62 * s2);
        const bl = toWorld(cx, cy, tx, ty, ux, uy, -0.18 * s2, -0.08 * s2);
        const br = toWorld(cx, cy, tx, ty, ux, uy, 0.18 * s2, -0.08 * s2);
        pushTri(pos, col, bl[0], bl[1], br[0], br[1], tip[0], tip[1], 0.4, 0.4, 0.42, 0.95);
        triVerts += 3;
      } else if (p.type === "vent") {
        const heat = p.ventHeat ? Math.max(0, Math.min(1, p.ventHeat)) : 0;
        const cr = 0.6 + heat * 0.4;
        const cg = 0.2 + heat * 0.05;
        const cb = 0.1 + heat * 0.05;
        let ux, uy, tx, ty;
        if (typeof p.nx === "number" && typeof p.ny === "number") {
          const nlen = Math.hypot(p.nx, p.ny) || 1;
          ux = p.nx / nlen;
          uy = p.ny / nlen;
          tx = -uy;
          ty = ux;
        } else {
          ({ ux, uy, tx, ty } = basisAt(p.x, p.y));
        }
        const h = 0.9 * s2;
        const w0 = 0.28 * s2;
        const w1 = 0.16 * s2;
        const a0 = toWorld(p.x, p.y, tx, ty, ux, uy, -w0, -h * 0.5);
        const a1 = toWorld(p.x, p.y, tx, ty, ux, uy, w0, -h * 0.5);
        const a2 = toWorld(p.x, p.y, tx, ty, ux, uy, w1, h * 0.5);
        const a3 = toWorld(p.x, p.y, tx, ty, ux, uy, -w1, h * 0.5);
        pushTri(pos, col, a0[0], a0[1], a1[0], a1[1], a2[0], a2[1], cr, cg, cb, 0.95);
        pushTri(pos, col, a0[0], a0[1], a2[0], a2[1], a3[0], a3[1], cr, cg, cb, 0.95);
        triVerts += 6;
        const ih = h * 0.5;
        const iw0 = w0 * 0.55;
        const iw1 = w1 * 0.5;
        const b0 = toWorld(p.x, p.y, tx, ty, ux, uy, -iw0, -ih * 0.5);
        const b1 = toWorld(p.x, p.y, tx, ty, ux, uy, iw0, -ih * 0.5);
        const b2 = toWorld(p.x, p.y, tx, ty, ux, uy, iw1, ih * 0.5);
        const b3 = toWorld(p.x, p.y, tx, ty, ux, uy, -iw1, ih * 0.5);
        pushTri(pos, col, b0[0], b0[1], b1[0], b1[1], b2[0], b2[1], 0.2 + heat * 0.6, 0.05, 0.05, 0.95);
        pushTri(pos, col, b0[0], b0[1], b2[0], b2[1], b3[0], b3[1], 0.2 + heat * 0.6, 0.05, 0.05, 0.95);
        triVerts += 6;
      } else if (p.type === "ice_shard") {
        let ux, uy, tx, ty;
        if (typeof p.nx === "number" && typeof p.ny === "number") {
          const nlen = Math.hypot(p.nx, p.ny) || 1;
          ux = p.nx / nlen;
          uy = p.ny / nlen;
          tx = -uy;
          ty = ux;
        } else {
          const info = planet.surfaceInfoAtWorld ? planet.surfaceInfoAtWorld(p.x, p.y, 0.18) : null;
          if (info) {
            ux = info.nx;
            uy = info.ny;
            tx = -uy;
            ty = ux;
          } else {
            ({ ux, uy, tx, ty } = basisAt(p.x, p.y));
          }
        }
        const tip = toWorld(p.x, p.y, tx, ty, ux, uy, 0, 0.7 * s2);
        const bl = toWorld(p.x, p.y, tx, ty, ux, uy, -0.14 * s2, -0.05 * s2);
        const br = toWorld(p.x, p.y, tx, ty, ux, uy, 0.14 * s2, -0.05 * s2);
        pushTri(pos, col, bl[0], bl[1], br[0], br[1], tip[0], tip[1], 0.75, 0.9, 1, 0.95);
        triVerts += 3;
      } else if (p.type === "tree") {
        let ux, uy, tx, ty;
        if (typeof p.nx === "number" && typeof p.ny === "number") {
          const nlen = Math.hypot(p.nx, p.ny) || 1;
          ux = p.nx / nlen;
          uy = p.ny / nlen;
          tx = -uy;
          ty = ux;
        } else {
          ({ ux, uy, tx, ty } = basisAt(p.x, p.y));
        }
        if (planet.airValueAtWorld && planet.airValueAtWorld(p.x + ux * 0.25, p.y + uy * 0.25) <= 0.5) {
          ux = -ux;
          uy = -uy;
          tx = -uy;
          ty = ux;
        }
        const trunkW = 0.07 * s2;
        const trunkH = 0.6 * s2;
        const t0 = toWorld(p.x, p.y, tx, ty, ux, uy, -trunkW, -0.02 * s2);
        const t1 = toWorld(p.x, p.y, tx, ty, ux, uy, trunkW, -0.02 * s2);
        const t2 = toWorld(p.x, p.y, tx, ty, ux, uy, trunkW, trunkH);
        const t3 = toWorld(p.x, p.y, tx, ty, ux, uy, -trunkW, trunkH);
        pushTri(pos, col, t0[0], t0[1], t1[0], t1[1], t2[0], t2[1], 0.45, 0.3, 0.18, 0.95);
        pushTri(pos, col, t0[0], t0[1], t2[0], t2[1], t3[0], t3[1], 0.45, 0.3, 0.18, 0.95);
        triVerts += 6;
        const seed = Math.abs(Math.sin(p.x * 12.9898 + p.y * 78.233) * 43758.5453);
        const tierCount = 3 + Math.floor(seed % 1 * 3);
        const tierStep = 0.44 * s2;
        const tierOverlap = 0.12 * s2;
        const tierHeight = 0.52 * s2;
        const baseStart = 0.36 * s2;
        for (let i = 0; i < tierCount; i++) {
          const t = i / Math.max(1, tierCount);
          const halfW = (0.38 - 0.18 * t) * s2;
          const baseY = baseStart + i * Math.max(0.05 * s2, tierStep - tierOverlap);
          const tipY = baseY + tierHeight;
          const bl = toWorld(p.x, p.y, tx, ty, ux, uy, -halfW, baseY);
          const br = toWorld(p.x, p.y, tx, ty, ux, uy, halfW, baseY);
          const tip = toWorld(p.x, p.y, tx, ty, ux, uy, 0, tipY);
          const shade = 0.25 + 0.08 * (tierCount - i);
          pushTri(pos, col, bl[0], bl[1], br[0], br[1], tip[0], tip[1], 0.18, 0.52 + shade, 0.2, 0.95);
          triVerts += 3;
        }
      } else if (p.type === "mushroom") {
        let ux, uy, tx, ty;
        if (typeof p.nx === "number" && typeof p.ny === "number") {
          const nlen = Math.hypot(p.nx, p.ny) || 1;
          ux = p.nx / nlen;
          uy = p.ny / nlen;
          tx = -uy;
          ty = ux;
        } else {
          ({ ux, uy, tx, ty } = basisAt(p.x, p.y));
        }
        if (planet.airValueAtWorld && planet.airValueAtWorld(p.x + ux * 0.25, p.y + uy * 0.25) <= 0.5) {
          ux = -ux;
          uy = -uy;
          tx = -uy;
          ty = ux;
        }
        const sink = 0.05 * s2;
        const cx = p.x - ux * sink;
        const cy = p.y - uy * sink;
        const st0 = toWorld(cx, cy, tx, ty, ux, uy, -0.05 * s2, 0);
        const st1 = toWorld(cx, cy, tx, ty, ux, uy, 0.05 * s2, 0);
        const st2 = toWorld(cx, cy, tx, ty, ux, uy, 0.05 * s2, 0.22 * s2);
        const st3 = toWorld(cx, cy, tx, ty, ux, uy, -0.05 * s2, 0.22 * s2);
        pushTri(pos, col, st0[0], st0[1], st1[0], st1[1], st2[0], st2[1], 0.9, 0.7, 0.9, 0.95);
        pushTri(pos, col, st0[0], st0[1], st2[0], st2[1], st3[0], st3[1], 0.9, 0.7, 0.9, 0.95);
        triVerts += 6;
        const capL = toWorld(cx, cy, tx, ty, ux, uy, -0.26 * s2, 0.28 * s2);
        const capR = toWorld(cx, cy, tx, ty, ux, uy, 0.26 * s2, 0.28 * s2);
        const capT = toWorld(cx, cy, tx, ty, ux, uy, 0, 0.48 * s2);
        pushTri(pos, col, capL[0], capL[1], capR[0], capR[1], capT[0], capT[1], 0.95, 0.35, 0.75, 0.95);
        triVerts += 3;
      } else if (p.type === "stalactite") {
        let ux, uy, tx, ty;
        if (typeof p.nx === "number" && typeof p.ny === "number") {
          const nlen = Math.hypot(p.nx, p.ny) || 1;
          ux = p.nx / nlen;
          uy = p.ny / nlen;
          tx = -uy;
          ty = ux;
        } else {
          ({ ux, uy, tx, ty } = basisAt(p.x, p.y));
        }
        const cx = p.x - ux * 0.02 * s2;
        const cy = p.y - uy * 0.02 * s2;
        const tip = toWorld(cx, cy, tx, ty, ux, uy, 0, 0.62 * s2);
        const bl = toWorld(cx, cy, tx, ty, ux, uy, -0.18 * s2, -0.1 * s2);
        const br = toWorld(cx, cy, tx, ty, ux, uy, 0.18 * s2, -0.1 * s2);
        pushTri(pos, col, bl[0], bl[1], br[0], br[1], tip[0], tip[1], 0.45, 0.45, 0.5, 0.95);
        triVerts += 3;
      } else if (p.type === "tether") {
        let ux, uy, tx, ty;
        if (typeof p.nx === "number" && typeof p.ny === "number") {
          const nlen = Math.hypot(p.nx, p.ny) || 1;
          ux = p.nx / nlen;
          uy = p.ny / nlen;
          tx = -uy;
          ty = ux;
        } else {
          ({ ux, uy, tx, ty } = basisAt(p.x, p.y));
        }
        const halfL = typeof p.halfLength === "number" && p.halfLength > 0 ? p.halfLength : 0.9 * s2;
        const halfW = typeof p.halfWidth === "number" && p.halfWidth > 0 ? p.halfWidth : 0.12 * s2;
        const locked = !!p.locked;
        const bodyCol = locked ? [0.28, 0.31, 0.38] : [0.78, 0.38, 0.2];
        const coreCol = locked ? [0.14, 0.17, 0.22] : [1, 0.68, 0.32];
        const a0 = toWorld(p.x, p.y, tx, ty, ux, uy, -halfW, -halfL);
        const a1 = toWorld(p.x, p.y, tx, ty, ux, uy, halfW, -halfL);
        const a2 = toWorld(p.x, p.y, tx, ty, ux, uy, halfW, halfL);
        const a3 = toWorld(p.x, p.y, tx, ty, ux, uy, -halfW, halfL);
        pushTri(pos, col, a0[0], a0[1], a1[0], a1[1], a2[0], a2[1], bodyCol[0], bodyCol[1], bodyCol[2], 0.98);
        pushTri(pos, col, a0[0], a0[1], a2[0], a2[1], a3[0], a3[1], bodyCol[0], bodyCol[1], bodyCol[2], 0.98);
        triVerts += 6;
        const iw = halfW * 0.45;
        const i0 = toWorld(p.x, p.y, tx, ty, ux, uy, -iw, -halfL);
        const i1 = toWorld(p.x, p.y, tx, ty, ux, uy, iw, -halfL);
        const i2 = toWorld(p.x, p.y, tx, ty, ux, uy, iw, halfL);
        const i3 = toWorld(p.x, p.y, tx, ty, ux, uy, -iw, halfL);
        pushTri(pos, col, i0[0], i0[1], i1[0], i1[1], i2[0], i2[1], coreCol[0], coreCol[1], coreCol[2], locked ? 0.65 : 0.95);
        pushTri(pos, col, i0[0], i0[1], i2[0], i2[1], i3[0], i3[1], coreCol[0], coreCol[1], coreCol[2], locked ? 0.65 : 0.95);
        triVerts += 6;
      } else if (p.type === "gate") {
        let ux, uy, tx, ty;
        if (typeof p.nx === "number" && typeof p.ny === "number") {
          const nlen = Math.hypot(p.nx, p.ny) || 1;
          ux = p.nx / nlen;
          uy = p.ny / nlen;
          tx = -uy;
          ty = ux;
        } else {
          ({ ux, uy, tx, ty } = basisAt(p.x, p.y));
        }
        const cx = p.x - ux * 0.02 * s2;
        const cy = p.y - uy * 0.02 * s2;
        const hw = 0.62 * s2;
        const hh = 0.14 * s2;
        const a0 = toWorld(cx, cy, tx, ty, ux, uy, -hw, -hh);
        const a1 = toWorld(cx, cy, tx, ty, ux, uy, hw, -hh);
        const a2 = toWorld(cx, cy, tx, ty, ux, uy, hw, hh);
        const a3 = toWorld(cx, cy, tx, ty, ux, uy, -hw, hh);
        pushTri(pos, col, a0[0], a0[1], a1[0], a1[1], a2[0], a2[1], 0.32, 0.33, 0.36, 0.96);
        pushTri(pos, col, a0[0], a0[1], a2[0], a2[1], a3[0], a3[1], 0.32, 0.33, 0.36, 0.96);
        triVerts += 6;
        const iw = hw * 0.82;
        const ih = hh * 0.38;
        const b0 = toWorld(cx, cy, tx, ty, ux, uy, -iw, -ih);
        const b1 = toWorld(cx, cy, tx, ty, ux, uy, iw, -ih);
        const b2 = toWorld(cx, cy, tx, ty, ux, uy, iw, ih);
        const b3 = toWorld(cx, cy, tx, ty, ux, uy, -iw, ih);
        pushTri(pos, col, b0[0], b0[1], b1[0], b1[1], b2[0], b2[1], 0.16, 0.17, 0.19, 0.95);
        pushTri(pos, col, b0[0], b0[1], b2[0], b2[1], b3[0], b3[1], 0.16, 0.17, 0.19, 0.95);
        triVerts += 6;
      } else if (p.type === "factory") {
        let ux, uy, tx, ty;
        if (typeof p.nx === "number" && typeof p.ny === "number") {
          const nlen = Math.hypot(p.nx, p.ny) || 1;
          ux = p.nx / nlen;
          uy = p.ny / nlen;
          tx = -uy;
          ty = ux;
        } else {
          ({ ux, uy, tx, ty } = basisAt(p.x, p.y));
        }
        const sink = 0.08 * s2;
        const cx = p.x - ux * sink;
        const cy = p.y - uy * sink;
        const halfBase = 0.46 * s2;
        const halfTop = 0.3 * s2;
        const h = 0.56 * s2;
        const factoryHitNorm = typeof p.hitT === "number" && p.hitT > 0 ? Math.min(1, p.hitT / 0.35) : 0;
        const factoryHitPulse = factoryHitNorm > 0 ? 0.5 + 0.5 * Math.sin(now * 18) : 0;
        const factoryHitMix = factoryHitNorm > 0 ? (0.24 + 0.5 * factoryHitPulse) * factoryHitNorm : 0;
        const tintFactory = (r2, g, b) => {
          if (factoryHitMix <= 0) return [r2, g, b];
          return [
            r2 * (1 - factoryHitMix) + 1 * factoryHitMix,
            g * (1 - factoryHitMix) + 0.2 * factoryHitMix,
            b * (1 - factoryHitMix) + 0.2 * factoryHitMix
          ];
        };
        const bodyCol = tintFactory(0.38, 0.39, 0.42);
        const doorCol = tintFactory(0.14, 0.15, 0.17);
        const stackCol = tintFactory(0.3, 0.31, 0.34);
        const a0 = toWorld(cx, cy, tx, ty, ux, uy, -halfBase, 0);
        const a1 = toWorld(cx, cy, tx, ty, ux, uy, halfBase, 0);
        const a2 = toWorld(cx, cy, tx, ty, ux, uy, halfTop, h);
        const a3 = toWorld(cx, cy, tx, ty, ux, uy, -halfTop, h);
        pushTri(pos, col, a0[0], a0[1], a1[0], a1[1], a2[0], a2[1], bodyCol[0], bodyCol[1], bodyCol[2], 0.98);
        pushTri(pos, col, a0[0], a0[1], a2[0], a2[1], a3[0], a3[1], bodyCol[0], bodyCol[1], bodyCol[2], 0.98);
        triVerts += 6;
        const doorW = 0.11 * s2;
        const doorH = 0.22 * s2;
        const d0 = toWorld(cx, cy, tx, ty, ux, uy, -doorW, 0.02 * s2);
        const d1 = toWorld(cx, cy, tx, ty, ux, uy, doorW, 0.02 * s2);
        const d2 = toWorld(cx, cy, tx, ty, ux, uy, doorW, doorH);
        const d3 = toWorld(cx, cy, tx, ty, ux, uy, -doorW, doorH);
        pushTri(pos, col, d0[0], d0[1], d1[0], d1[1], d2[0], d2[1], doorCol[0], doorCol[1], doorCol[2], 0.96);
        pushTri(pos, col, d0[0], d0[1], d2[0], d2[1], d3[0], d3[1], doorCol[0], doorCol[1], doorCol[2], 0.96);
        triVerts += 6;
        const sx2 = halfTop * 0.55;
        const sw = 0.07 * s2;
        const sh = 0.26 * s2;
        const st0 = toWorld(cx, cy, tx, ty, ux, uy, sx2 - sw, h);
        const st1 = toWorld(cx, cy, tx, ty, ux, uy, sx2 + sw, h);
        const st2 = toWorld(cx, cy, tx, ty, ux, uy, sx2 + sw, h + sh);
        const st3 = toWorld(cx, cy, tx, ty, ux, uy, sx2 - sw, h + sh);
        pushTri(pos, col, st0[0], st0[1], st1[0], st1[1], st2[0], st2[1], stackCol[0], stackCol[1], stackCol[2], 0.95);
        pushTri(pos, col, st0[0], st0[1], st2[0], st2[1], st3[0], st3[1], stackCol[0], stackCol[1], stackCol[2], 0.95);
        triVerts += 6;
      }
    }
  }
  triVerts = pos.length / 2;
  const thrustV = (dx, dy, r2, g, b, extraOffset = 0, lift = 0, power = 1) => {
    const mag = Math.hypot(dx, dy) || 1;
    const p = Math.max(0, Math.min(1, power));
    const posUx = -dx / mag;
    const posUy = -dy / mag;
    const ux = dx / mag;
    const uy = dy / mag;
    const len = shipHWorld * (0.14 + 0.22 * p);
    const spread = shipHWorld * (0.06 + 0.09 * p);
    const px = -uy;
    const py = ux;
    const offset2 = shipHWorld * 0.72 + extraOffset;
    const tipx = ux * len;
    const tipy = uy * len;
    const b1x = -ux * len * 0.45 + px * spread;
    const b1y = -uy * len * 0.45 + py * spread;
    const b2x = -ux * len * 0.45 - px * spread;
    const b2y = -uy * len * 0.45 - py * spread;
    const [lx, ly] = rot2(0, lift, shipRot);
    const [tx, ty] = rot2(tipx + posUx * offset2, tipy + posUy * offset2, shipRot);
    const [p1x, p1y] = rot2(b1x + posUx * offset2, b1y + posUy * offset2, shipRot);
    const [p2x, p2y] = rot2(b2x + posUx * offset2, b2y + posUy * offset2, shipRot);
    const a = 0.35 + 0.65 * p;
    pushLine(pos, col, state.ship.x + p1x + lx, state.ship.y + p1y + ly, state.ship.x + tx + lx, state.ship.y + ty + ly, r2, g, b, a);
    pushLine(pos, col, state.ship.x + p2x + lx, state.ship.y + p2y + ly, state.ship.x + tx + lx, state.ship.y + ty + ly, r2, g, b, a);
    lineVerts += 4;
  };
  if (state.ship.state !== "crashed") {
    const drawOffscreenIndicator = (x, y, r2, g, b) => {
      const dX = x - state.view.xCenter;
      const dY = y - state.view.yCenter;
      const camRotCos = Math.cos(-camRot);
      const camRotSin = Math.sin(-camRot);
      const horzLen = 0.9 / sx;
      const horzX = camRotCos * horzLen;
      const horzY = camRotSin * horzLen;
      const vertLen = 0.9 / sy;
      const vertX = -camRotSin * vertLen;
      const vertY = camRotCos * vertLen;
      let u = 1;
      let projection = (dX * horzX + dY * horzY) / (horzX * horzX + horzY * horzY);
      u = Math.min(u, 1 / Math.max(1, projection));
      projection = (dX * -horzX + dY * -horzY) / (horzX * horzX + horzY * horzY);
      u = Math.min(u, 1 / Math.max(1, projection));
      projection = (dX * vertX + dY * vertY) / (vertX * vertX + vertY * vertY);
      u = Math.min(u, 1 / Math.max(1, projection));
      projection = (dX * -vertX + dY * -vertY) / (vertX * vertX + vertY * vertY);
      u = Math.min(u, 1 / Math.max(1, projection));
      if (u < 1) {
        const mx = state.view.xCenter + dX * u;
        const my = state.view.yCenter + dY * u;
        const n = Math.hypot(dX, dY);
        const s2 = state.view.radius * 0.05;
        const nx = dX / n;
        const ny = dY / n;
        const tx = -0.5 * ny;
        const ty = 0.5 * nx;
        const ax = mx + s2 * (-nx - tx);
        const ay = my + s2 * (-ny - ty);
        const bx = mx + s2 * (-nx + tx);
        const by = my + s2 * (-ny + ty);
        const thickness = Math.max(0.03, s2 * 0.16);
        pushThickLine(pos, col, mx, my, ax, ay, thickness, r2, g, b, 0.9);
        pushThickLine(pos, col, mx, my, bx, by, thickness, r2, g, b, 0.9);
        triVerts += 12;
      }
    };
    if (state.mothership) {
      drawOffscreenIndicator(state.mothership.x, state.mothership.y, 0.5, 0.84, 1);
    }
    if (state.ship.rescueeDetector) {
      let closestRescuee = null;
      let closestDistSqr = Infinity;
      for (const miner of state.miners) {
        const dx = miner.x - state.ship.x;
        const dy = miner.y - state.ship.y;
        const distSqr = dx * dx + dy * dy;
        if (distSqr < closestDistSqr) {
          closestDistSqr = distSqr;
          closestRescuee = miner;
        }
      }
      if (closestRescuee !== null) {
        const [r2, g, b] = minerColor("miner");
        drawOffscreenIndicator(closestRescuee.x, closestRescuee.y, r2, g, b);
      }
    }
    const tc = [1, 0.55, 0.15];
    const stick = state.input.stickThrust || { x: 0, y: 0 };
    const analogLeft = Math.max(0, -stick.x);
    const analogRight = Math.max(0, stick.x);
    const analogUp = Math.max(0, stick.y);
    const analogDown = Math.max(0, -stick.y);
    if (state.input.thrust || analogUp > 0) {
      thrustV(0, 1, tc[0], tc[1], tc[2], shipHWorld * 0.2, thrustLiftAll + thrustUpExtraDown, Math.max(state.input.thrust ? 1 : 0, analogUp));
    }
    if (state.input.down || analogDown > 0) {
      thrustV(0, -1, tc[0], tc[1], tc[2], shipHWorld * 0.35, thrustLiftAll + thrustDownExtraUp, Math.max(state.input.down ? 1 : 0, analogDown));
    }
    if (state.input.left || analogLeft > 0) {
      thrustV(-1, 0, tc[0], tc[1], tc[2], shipWWorld * 0.5, thrustLiftAll, Math.max(state.input.left ? 1 : 0, analogLeft));
    }
    if (state.input.right || analogRight > 0) {
      thrustV(1, 0, tc[0], tc[1], tc[2], shipWWorld * 0.5, thrustLiftAll, Math.max(state.input.right ? 1 : 0, analogRight));
    }
  }
  if (state.ship.state === "flying") {
    const vscale = vScaleStopping(planet, state.ship.x, state.ship.y, state.ship.vx, state.ship.vy, game.THRUST);
    pushLine(pos, col, state.ship.x, state.ship.y, state.ship.x + state.ship.vx * vscale, state.ship.y + state.ship.vy * vscale, 0.5, 0.84, 1, 0.5);
    lineVerts += 2;
    const { rPerigee, rApogee } = planet.perigeeAndApogee(state.ship.x, state.ship.y, state.ship.vx, state.ship.vy);
    const rMin = rMax + 0.5;
    if (rPerigee >= rMin) {
      const r2 = Math.hypot(state.ship.x, state.ship.y);
      const dirX = state.ship.x / r2;
      const dirY = state.ship.y / r2;
      const crossTickSize = 0.01 * state.view.radius;
      const crossX = -dirY * crossTickSize;
      const crossY = dirX * crossTickSize;
      const apoX = dirX * rApogee;
      const apoY = dirY * rApogee;
      const periX = dirX * rPerigee;
      const periY = dirY * rPerigee;
      pushLine(pos, col, apoX - crossX, apoY - crossY, apoX + crossX, apoY + crossY, 0.5, 0.84, 1, 0.5);
      pushLine(pos, col, periX - crossX, periY - crossY, periX + crossX, periY + crossY, 0.5, 0.84, 1, 0.5);
      pushLine(pos, col, apoX, apoY, periX, periY, 0.5, 0.84, 1, 0.5);
      lineVerts += 6;
    }
  }
  if (state.aimWorld) {
    const ao = state.aimOrigin || state.ship;
    pushLine(pos, col, ao.x, ao.y, state.aimWorld.x, state.aimWorld.y, 0.85, 0.9, 1, 0.65);
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
      const len = 0.2 * game.ENEMY_SCALE;
      const hx = Math.cos(d.a) * len;
      const hy = Math.sin(d.a) * len;
      pushLine(pos, col, d.x - hx, d.y - hy, d.x + hx, d.y + hy, 1, 0.5, 0.2, 0.9);
      lineVerts += 2;
    }
  }
  if (state.explosions && state.explosions.length) {
    for (const ex of state.explosions) {
      const t = Math.max(0, Math.min(1, ex.life / 0.5));
      const r2 = 0.35 + (1 - t) * 0.6;
      const colr = ex.owner === "crawler" ? [1, 0.7, 0.2] : [1, 0.5, 0.3];
      pushLine(pos, col, ex.x - r2, ex.y, ex.x + r2, ex.y, colr[0], colr[1], colr[2], 0.8 * t);
      pushLine(pos, col, ex.x, ex.y - r2, ex.x, ex.y + r2, colr[0], colr[1], colr[2], 0.8 * t);
      lineVerts += 4;
    }
  }
  if (state.entityExplosions && state.entityExplosions.length) {
    for (const ex of state.entityExplosions) {
      const t = Math.max(0, Math.min(1, ex.life / 0.8));
      const r2 = (ex.radius ?? 1) * (0.4 + (1 - t) * 0.9);
      const alpha = 0.9 * t;
      const seg = 18;
      for (let i = 0; i < seg; i++) {
        const a0 = i / seg * Math.PI * 2;
        const a1 = (i + 1) / seg * Math.PI * 2;
        const r0 = r2 * (0.85 + 0.2 * Math.sin(t * 8 + i));
        const r1 = r2 * (0.85 + 0.2 * Math.sin(t * 8 + i + 1));
        const x0 = ex.x + Math.cos(a0) * r0;
        const y0 = ex.y + Math.sin(a0) * r0;
        const x1 = ex.x + Math.cos(a1) * r1;
        const y1 = ex.y + Math.sin(a1) * r1;
        pushLine(pos, col, x0, y0, x1, y1, 1, 0.9, 0.4, alpha);
        lineVerts += 2;
      }
      pushLine(pos, col, ex.x - r2 * 0.6, ex.y, ex.x + r2 * 0.6, ex.y, 1, 0.95, 0.6, 0.7 * alpha);
      pushLine(pos, col, ex.x, ex.y - r2 * 0.6, ex.x, ex.y + r2 * 0.6, 1, 0.95, 0.6, 0.7 * alpha);
      lineVerts += 4;
    }
  }
  if (props && props.length) {
    for (const p of props) {
      if (p.dead || typeof p.hp === "number" && p.hp <= 0) continue;
      if (p.type !== "bubble_hex") continue;
      if (state.fogEnabled && !planet.fogSeenAt(p.x, p.y)) continue;
      const rot = (p.rot || 0) + (p.rotSpeed ? p.rotSpeed * now : 0);
      const s2 = p.scale || 1;
      pushHexOutline(pos, col, p.x, p.y, 0.28 * s2, rot, 0.6, 0.62, 0.66, 0.78);
      lineVerts += 12;
    }
    const basisAt = (x, y) => {
      const len = Math.hypot(x, y) || 1;
      const ux = x / len;
      const uy = y / len;
      const tx = -uy;
      const ty = ux;
      return { ux, uy, tx, ty };
    };
    const toWorld = (x, y, tx, ty, ux, uy, lx, ly) => {
      return [x + tx * lx + ux * ly, y + ty * lx + uy * ly];
    };
    for (const p of props) {
      if (p.dead || typeof p.hp === "number" && p.hp <= 0) continue;
      if (p.type !== "ridge_spike" && p.type !== "stalactite" && p.type !== "ice_shard") continue;
      if (state.fogEnabled && !planet.fogSeenAt(p.x, p.y)) continue;
      let ux, uy, tx, ty;
      if (typeof p.nx === "number" && typeof p.ny === "number") {
        const nlen = Math.hypot(p.nx, p.ny) || 1;
        ux = p.nx / nlen;
        uy = p.ny / nlen;
        tx = -uy;
        ty = ux;
      } else {
        ({ ux, uy, tx, ty } = basisAt(p.x, p.y));
      }
      const s2 = p.scale || 1;
      const isIce = p.type === "ice_shard";
      const cx = p.x - ux * (isIce ? 0 : 0.02 * s2);
      const cy = p.y - uy * (isIce ? 0 : 0.02 * s2);
      const tipY = (isIce ? 0.7 : 0.62) * s2;
      const tip = toWorld(cx, cy, tx, ty, ux, uy, 0, tipY);
      const hash = Math.abs(Math.sin(p.x * 17.23 + p.y * 29.71));
      const pulse = Math.max(0, Math.sin(now * (6 + hash * 4) + hash * Math.PI * 2));
      const twinkle = pulse * pulse * pulse;
      if (twinkle <= 0.02) continue;
      const arm = (isIce ? 0.032 + 0.055 * twinkle : 0.03 + 0.05 * twinkle) * s2;
      const alpha = 0.2 + 0.8 * twinkle;
      const tr = isIce ? 0.7 : 1;
      const tg = isIce ? 0.94 : 0.93;
      const tb = isIce ? 1 : 0.62;
      pushLine(pos, col, tip[0] - tx * arm, tip[1] - ty * arm, tip[0] + tx * arm, tip[1] + ty * arm, tr, tg, tb, alpha);
      pushLine(pos, col, tip[0] - ux * arm, tip[1] - uy * arm, tip[0] + ux * arm, tip[1] + uy * arm, tr, tg, tb, alpha);
      lineVerts += 4;
    }
  }
  const bubbleParticles = featureParticles ? featureParticles.bubbles : null;
  if (bubbleParticles && bubbleParticles.length) {
    for (const p of bubbleParticles) {
      if (state.fogEnabled && !planet.fogSeenAt(p.x, p.y)) continue;
      const lifeN = p.maxLife && p.maxLife > 0 ? Math.max(0, Math.min(1, p.life / p.maxLife)) : 1;
      const radius = (p.size || 0.08) * (1 + (1 - lifeN) * 0.35);
      const alpha = 0.3 + 0.58 * lifeN;
      pushHexOutline(pos, col, p.x, p.y, radius, p.rot || 0, 0.8, 0.95, 1, alpha);
      lineVerts += 12;
    }
  }
  lineVerts = pos.length / 2 - triVerts;
  const dbgSamples = state.debugCollisionSamples || state.ship._samples;
  if (state.debugCollisions && dbgSamples) {
    for (const [sxw, syw, air, av] of dbgSamples) {
      pos.push(sxw, syw);
      if (air) col.push(0.45, 1, 0.55, 0.9);
      else col.push(1, 0.3, 0.3, 0.9);
      pointVerts += 1;
    }
  }
  if (state.debugCollisionContours && dbgSamples && planet.radial && typeof planet.radial.findTriAtWorld === "function") {
    const testedTris = [];
    for (const [sxw, syw, air, av] of dbgSamples) {
      const tri = planet.radial.findTriAtWorld(sxw, syw);
      if (!tri) continue;
      if (testedTris.indexOf(tri) < 0) testedTris.push(tri);
      if (!state.debugCollisions) {
        pos.push(sxw, syw);
        if (air) col.push(0.45, 1, 0.55, 0.9);
        else col.push(1, 0.3, 0.3, 0.9);
        pointVerts += 1;
      }
      const airRaw = triAirAtWorld(tri, sxw, syw);
      const nearBoundary = Math.abs(airRaw - 0.5);
      if (nearBoundary <= 0.06) {
        pushSquareOutline(pos, col, sxw, syw, 0.04, 1, 0.9, 0.2, 0.95);
        lineVerts += 8;
      }
    }
    for (const tri of testedTris) {
      const a = tri[0], b = tri[1], c = tri[2];
      pushTriangleOutline(pos, col, a.x, a.y, b.x, b.y, c.x, c.y, 0.25, 0.65, 1, 0.25);
      lineVerts += 6;
      const seg = triIsoSegment(tri, 0.5);
      if (!seg) continue;
      pushLine(pos, col, seg[0][0], seg[0][1], seg[1][0], seg[1][1], 1, 0.95, 0.2, 0.95);
      lineVerts += 2;
    }
  }
  const dbg = state.debugPoints;
  if (state.debugCollisions && state.debugNodes && dbg) {
    for (const [sxw, syw, air, av] of dbg) {
      pos.push(sxw, syw);
      if (air) col.push(airPoint[0], airPoint[1], airPoint[2], 0.45);
      else col.push(rockPoint[0], rockPoint[1], rockPoint[2], 0.45);
      pointVerts += 1;
    }
    const outerRing = planet.radial && planet.radial.rings ? planet.radial.rings[planet.radial.rings.length - 1] : null;
    if (outerRing) {
      for (const v of outerRing) {
        pos.push(v.x, v.y);
        col.push(0.8, 0.2, 0.9, 0.6);
        pointVerts += 1;
      }
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
  pointVerts = pos.length / 2 - triVerts - lineVerts;
  gl.useProgram(oprog);
  gl.bindVertexArray(oVao);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.uniform2f(ouScale, sx, sy);
  gl.uniform2f(ouCam, state.view.xCenter, state.view.yCenter);
  gl.uniform1f(ouRot, camRot);
  if (state.debugPlanetTriangles && planetWireVao && planetWireVertCount > 0) {
    gl.bindVertexArray(planetWireVao);
    gl.drawArrays(gl.LINES, 0, planetWireVertCount);
    gl.bindVertexArray(oVao);
  }
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
  if (state.touchStart) {
    const linePos = [];
    const lineCol = [];
    const w = canvas2.width;
    const h = canvas2.height;
    const minDim = Math.max(1, Math.min(w, h));
    const centerX = TOUCH_UI.start.x * w;
    const centerY = (1 - TOUCH_UI.start.y) * h;
    const radius = TOUCH_UI.start.r * minDim;
    const touchStartMode = typeof state.touchStartMode === "string" ? state.touchStartMode : "play";
    let ringR = 0.62;
    let ringG = 1;
    let ringB = 0.56;
    if (touchStartMode === "upgrade") {
      ringR = 1;
      ringG = 0.92;
      ringB = 0.58;
    } else if (touchStartMode === "nextLevel") {
      ringR = 0.58;
      ringG = 0.92;
      ringB = 1;
    } else if (touchStartMode === "viewMap" || touchStartMode === "exitMap") {
      ringR = 0.66;
      ringG = 0.84;
      ringB = 1;
    } else if (touchStartMode === "respawnShip") {
      ringR = 1;
      ringG = 0.68;
      ringB = 0.56;
    } else if (touchStartMode === "restartGame") {
      ringR = 1;
      ringG = 0.74;
      ringB = 0.42;
    }
    pushCircle(linePos, lineCol, centerX, centerY, radius, ringR, ringG, ringB, 0.98, 64);
    const iconR = Math.min(1, ringR + 0.2);
    const iconG = Math.min(1, ringG + 0.2);
    const iconB = Math.min(1, ringB + 0.2);
    const iconA = 0.98;
    if (touchStartMode === "upgrade") {
      const d = radius * 0.34;
      pushLine(linePos, lineCol, centerX - d, centerY, centerX + d, centerY, iconR, iconG, iconB, iconA);
      pushLine(linePos, lineCol, centerX, centerY - d, centerX, centerY + d, iconR, iconG, iconB, iconA);
    } else if (touchStartMode === "nextLevel") {
      const dx = radius * 0.16;
      const dy = radius * 0.3;
      const cx0 = centerX - radius * 0.18;
      const cx1 = centerX + radius * 0.14;
      pushLine(linePos, lineCol, cx0 - dx, centerY - dy, cx0 + dx, centerY, iconR, iconG, iconB, iconA);
      pushLine(linePos, lineCol, cx0 + dx, centerY, cx0 - dx, centerY + dy, iconR, iconG, iconB, iconA);
      pushLine(linePos, lineCol, cx1 - dx, centerY - dy, cx1 + dx, centerY, iconR, iconG, iconB, iconA);
      pushLine(linePos, lineCol, cx1 + dx, centerY, cx1 - dx, centerY + dy, iconR, iconG, iconB, iconA);
    } else if (touchStartMode === "viewMap" || touchStartMode === "exitMap") {
      const rr = radius * 0.38;
      pushSquareOutline(linePos, lineCol, centerX, centerY, rr, iconR, iconG, iconB, iconA);
      pushLine(linePos, lineCol, centerX - rr * 0.33, centerY - rr, centerX - rr * 0.33, centerY + rr, iconR, iconG, iconB, iconA);
      pushLine(linePos, lineCol, centerX + rr * 0.33, centerY - rr, centerX + rr * 0.33, centerY + rr, iconR, iconG, iconB, iconA);
      if (touchStartMode === "exitMap") {
        const xr = rr * 0.78;
        pushLine(linePos, lineCol, centerX - xr, centerY - xr, centerX + xr, centerY + xr, iconR, iconG, iconB, iconA);
        pushLine(linePos, lineCol, centerX - xr, centerY + xr, centerX + xr, centerY - xr, iconR, iconG, iconB, iconA);
      }
    } else {
      const triLeft = centerX - radius * 0.28;
      const triRight = centerX + radius * 0.4;
      const triTop = centerY + radius * 0.4;
      const triBottom = centerY - radius * 0.4;
      pushTriangleOutline(linePos, lineCol, triLeft, triTop, triRight, centerY, triLeft, triBottom, iconR, iconG, iconB, iconA);
      if (touchStartMode === "respawnShip") {
        const d = radius * 0.16;
        const px = centerX + radius * 0.28;
        const py = centerY - radius * 0.28;
        pushLine(linePos, lineCol, px - d, py, px + d, py, iconR, iconG, iconB, iconA);
        pushLine(linePos, lineCol, px, py - d, px, py + d, iconR, iconG, iconB, iconA);
      } else if (touchStartMode === "restartGame") {
        pushCircle(linePos, lineCol, centerX, centerY, radius * 0.43, iconR, iconG, iconB, iconA, 40);
        const ahx = centerX + radius * 0.33;
        const ahy = centerY - radius * 0.2;
        const d = radius * 0.11;
        pushLine(linePos, lineCol, ahx - d, ahy, ahx + d, ahy, iconR, iconG, iconB, iconA);
        pushLine(linePos, lineCol, ahx + d, ahy, ahx, ahy + d, iconR, iconG, iconB, iconA);
      }
    }
    const uiLine = linePos.length / 2;
    gl.uniform2f(ouScale, 2 / w, 2 / h);
    gl.uniform2f(ouCam, w * 0.5, h * 0.5);
    gl.uniform1f(ouRot, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, oPos);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(linePos), gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, oCol);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineCol), gl.DYNAMIC_DRAW);
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
   * @param {typeof import("./config.js").GAME} game Gameplay constants used in rendering.
   */
  constructor(canvas2, game) {
    this.canvas = canvas2;
    this.game = game;
    const glMaybe = canvas2.getContext("webgl2", { antialias: true, premultipliedAlpha: false });
    if (!glMaybe) throw new Error("WebGL2 not available");
    const gl = glMaybe;
    this.gl = gl;
    this.airBuf = null;
    this.fogBuf = null;
    this.vertCount = 0;
    this.shadeTex = null;
    this.planetWirePosBuf = null;
    this.planetWireColBuf = null;
    this.planetWireVertCount = 0;
    const vs = `#version 300 es
  precision highp float;
  layout(location=0) in vec2 aPos;
  layout(location=1) in float aAir;
  layout(location=2) in float aShade;
  layout(location=3) in float aFog;
  out vec2 vWorld;

  uniform vec2 uScale;
  uniform vec2 uCam;
  uniform float uRot;
  uniform float uFog;

  out float vAir;
  out float vShade;
  out float vFog;

  vec2 rot(vec2 p, float a){
    float c = cos(a), s = sin(a);
    return vec2(c*p.x - s*p.y, s*p.x + c*p.y);
  }

  void main(){
    vAir = aAir;
    vShade = aShade;
    vFog = aFog * uFog;
    vWorld = aPos;
    vec2 p = aPos - uCam;
    p = rot(p, uRot);
    gl_Position = vec4(p * uScale, 0.0, 1.0);
  }`;
    const fs = `#version 300 es
  precision highp float;

  in float vAir;
  in float vShade;
  in float vFog;
  in vec2 vWorld;
  out vec4 outColor;

  uniform vec3 uRockDark;
  uniform vec3 uRockLight;
  uniform vec3 uSurfaceRockDark;
  uniform vec3 uSurfaceRockLight;
  uniform vec3 uAirDark;
  uniform vec3 uAirLight;
    uniform float uMaxR;
    uniform float uRmax;
    uniform float uMeshRmax;
  uniform float uSurfaceBand;
  uniform vec3 uFogColor;

  vec3 lerp(vec3 a, vec3 b, float t){ return a + (b-a)*t; }

    void main(){
      float r = length(vWorld);
      if (r > uMaxR){
        discard;
      }
      if (r > (uMeshRmax - 0.5)){
        discard;
      }
      float t = clamp(vShade, 0.0, 1.0);
      float band = uSurfaceBand * uRmax;
      bool useSurface = (uSurfaceBand > 0.0) && (length(vWorld) > (uRmax - band));
    vec3 rockDark = useSurface ? uSurfaceRockDark : uRockDark;
    vec3 rockLight = useSurface ? uSurfaceRockLight : uRockLight;
    vec3 c = (vAir > 0.5) ? lerp(uAirDark,  uAirLight,  t)
                          : lerp(rockDark, rockLight, t);
    vec3 fogged = mix(c, uFogColor, clamp(vFog, 0.0, 1.0));
    outColor = vec4(fogged, 1.0);
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
    const starVs = `#version 300 es
  precision highp float;
  layout(location=0) in vec2 aPos;
  layout(location=1) in float aPhase;
  layout(location=2) in float aRate;
  layout(location=3) in float aDepth;
  layout(location=4) in vec3 aColor;

  uniform float uRot;
  uniform vec2 uAspect;
  uniform float uSpan;

  out float vPhase;
  out float vRate;
  out float vDepth;
  out vec3 vColor;

  vec2 rot(vec2 p, float a){
    float c = cos(a), s = sin(a);
    return vec2(c*p.x - s*p.y, s*p.x + c*p.y);
  }

  void main(){
    float depth = clamp(aDepth, 0.0, 1.0);
    vec2 p = rot(aPos * uSpan, uRot);
    p.x *= uAspect.x;
    p.y *= uAspect.y;
    gl_Position = vec4(p, 0.0, 1.0);
    vPhase = aPhase;
    vRate = aRate;
    vDepth = depth;
    vColor = aColor;
  }`;
    const starFs = `#version 300 es
  precision highp float;
  in float vPhase;
  in float vRate;
  in float vDepth;
  in vec3 vColor;
  out vec4 outColor;

  uniform float uTime;
  uniform float uSaturation;

  void main(){
    float tw = 0.7 + 0.3 * sin(uTime * vRate + vPhase);
    float depthBoost = mix(0.6, 1.0, vDepth);
    float brightness = clamp(tw * depthBoost, 0.0, 1.0);
    vec3 col = mix(vec3(1.0), vColor, 0.6);
    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    float sat = exp2((uSaturation - 1.0) * 2.0);
    col = mix(vec3(luma), col, sat);
    outColor = vec4(col * brightness, 1.0);
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
    const starProg = gl.createProgram();
    if (!starProg) throw new Error("Failed to create starfield program");
    gl.attachShader(starProg, compile(gl, gl.VERTEX_SHADER, starVs));
    gl.attachShader(starProg, compile(gl, gl.FRAGMENT_SHADER, starFs));
    gl.linkProgram(starProg);
    if (!gl.getProgramParameter(starProg, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(starProg) || "Starfield program link failed");
    }
    this.starProg = starProg;
    const vao = gl.createVertexArray();
    const oVao = gl.createVertexArray();
    const planetWireVao = gl.createVertexArray();
    const starVao = gl.createVertexArray();
    if (!vao || !oVao || !planetWireVao || !starVao) throw new Error("Failed to create VAO");
    this.vao = vao;
    this.oVao = oVao;
    this.planetWireVao = planetWireVao;
    this.starVao = starVao;
    gl.useProgram(prog);
    this.uScale = gl.getUniformLocation(prog, "uScale");
    this.uCam = gl.getUniformLocation(prog, "uCam");
    this.uRot = gl.getUniformLocation(prog, "uRot");
    this.uFog = gl.getUniformLocation(prog, "uFog");
    this.uRockDark = gl.getUniformLocation(prog, "uRockDark");
    this.uRockLight = gl.getUniformLocation(prog, "uRockLight");
    this.uSurfaceRockDark = gl.getUniformLocation(prog, "uSurfaceRockDark");
    this.uSurfaceRockLight = gl.getUniformLocation(prog, "uSurfaceRockLight");
    this.uAirDark = gl.getUniformLocation(prog, "uAirDark");
    this.uAirLight = gl.getUniformLocation(prog, "uAirLight");
    this.uMaxR = gl.getUniformLocation(prog, "uMaxR");
    this.uRmax = gl.getUniformLocation(prog, "uRmax");
    this.uMeshRmax = gl.getUniformLocation(prog, "uMeshRmax");
    this.uSurfaceBand = gl.getUniformLocation(prog, "uSurfaceBand");
    this.uFogColor = gl.getUniformLocation(prog, "uFogColor");
    gl.uniform3fv(this.uRockDark, CFG.ROCK_DARK);
    gl.uniform3fv(this.uRockLight, CFG.ROCK_LIGHT);
    if (this.uSurfaceRockDark) gl.uniform3fv(this.uSurfaceRockDark, CFG.ROCK_DARK);
    if (this.uSurfaceRockLight) gl.uniform3fv(this.uSurfaceRockLight, CFG.ROCK_LIGHT);
    gl.uniform3fv(this.uAirDark, CFG.AIR_DARK);
    gl.uniform3fv(this.uAirLight, CFG.AIR_LIGHT);
    gl.uniform1f(this.uMaxR, CFG.RMAX + 0.5);
    if (this.uRmax) gl.uniform1f(this.uRmax, CFG.RMAX);
    if (this.uMeshRmax) gl.uniform1f(this.uMeshRmax, CFG.RMAX);
    if (this.uSurfaceBand) gl.uniform1f(this.uSurfaceBand, 0);
    gl.uniform3fv(this.uFogColor, game.FOG_COLOR);
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
    const starMesh = buildStarfieldMesh(CFG.seed + 911, {
      count: 480,
      sizeMin: 15e-4,
      sizeMax: 5e-3,
      span: 1
    });
    this.starVertCount = starMesh.vertCount;
    gl.useProgram(starProg);
    this.starRot = gl.getUniformLocation(starProg, "uRot");
    this.starTime = gl.getUniformLocation(starProg, "uTime");
    this.starAspect = gl.getUniformLocation(starProg, "uAspect");
    this.starSpan = gl.getUniformLocation(starProg, "uSpan");
    this.starSaturation = gl.getUniformLocation(starProg, "uSaturation");
    gl.bindVertexArray(starVao);
    uploadAttrib(gl, 0, starMesh.positions, 2);
    uploadAttrib(gl, 1, starMesh.phase, 1);
    uploadAttrib(gl, 2, starMesh.rate, 1);
    uploadAttrib(gl, 3, starMesh.depth, 1);
    uploadAttrib(gl, 4, starMesh.color, 3);
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
   * @param {Planet} planet
   * @returns {void}
   */
  setPlanet(planet) {
    const gl = this.gl;
    const mesh = planet.radial;
    gl.bindVertexArray(this.vao);
    uploadAttrib(gl, 0, mesh.positions, 2);
    this.airBuf = uploadAttrib(gl, 1, mesh.airFlag, 1);
    uploadAttrib(gl, 2, mesh.shade, 1);
    const fog = mesh.fogAlpha && mesh.fogAlpha() || new Float32Array(mesh.vertCount);
    this.fogBuf = uploadAttrib(gl, 3, fog, 1);
    gl.bindVertexArray(null);
    this.vertCount = mesh.vertCount;
    if (this.planetWirePosBuf) gl.deleteBuffer(this.planetWirePosBuf);
    if (this.planetWireColBuf) gl.deleteBuffer(this.planetWireColBuf);
    const wire = buildTriangleWireframe(mesh.positions);
    gl.bindVertexArray(this.planetWireVao);
    this.planetWirePosBuf = uploadAttrib(gl, 0, wire.positions, 2);
    this.planetWireColBuf = uploadAttrib(gl, 1, wire.colors, 4);
    gl.bindVertexArray(null);
    this.planetWireVertCount = wire.vertCount;
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
   * @param {Float32Array} fogAlpha
   * @returns {void}
   */
  updateFog(fogAlpha) {
    if (!this.fogBuf) return;
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.fogBuf);
    gl.bufferData(gl.ARRAY_BUFFER, fogAlpha, gl.DYNAMIC_DRAW);
  }
  /**
   * @param {RenderState} state
   * @param {Planet} planet
   * @returns {void}
   */
  drawFrame(state, planet) {
    drawFrameImpl(this, state, planet);
  }
}
const KEY_LEFT = /* @__PURE__ */ new Set(["ArrowLeft", "a", "A"]);
const KEY_RIGHT = /* @__PURE__ */ new Set(["ArrowRight", "d", "D"]);
const KEY_THRUST = /* @__PURE__ */ new Set([" ", "Space", "ArrowUp", "w", "W"]);
const KEY_DOWN = /* @__PURE__ */ new Set(["ArrowDown", "s", "S"]);
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
    this.laserControl = { id: null, pos: null, start: null };
    this.bombControl = { id: null, pos: null, start: null };
    this.startControl = { id: null, downAt: 0, triggered: false };
    this.touchRestartControl = { id: null, downAt: 0, triggered: false };
    this.oneshot = {
      regen: false,
      toggleDebug: false,
      toggleDevHud: false,
      togglePlanetView: false,
      togglePlanetTriangles: false,
      toggleCollisionContours: false,
      toggleFog: false,
      toggleMusic: false,
      toggleCombatMusic: false,
      musicVolumeUp: false,
      musicVolumeDown: false,
      reset: false,
      abandonRun: false,
      nextLevel: false,
      prevLevel: false,
      shoot: false,
      bomb: false,
      rescueAll: false,
      killAllEnemies: false,
      spawnEnemyType: null
    };
    this.prevPadShoot = false;
    this.prevPadBomb = false;
    this.prevPadReset = false;
    this.aimMouse = null;
    this.aimTouchShoot = null;
    this.aimTouchBomb = null;
    this.aimTouchShootFrom = null;
    this.aimTouchShootTo = null;
    this.aimTouchBombFrom = null;
    this.aimTouchBombTo = null;
    this.bombReleaseFrom = null;
    this.bombReleaseTo = null;
    this.lastInputType = null;
    this.mouseShootHeld = false;
    this.HOLD_ABANDON_MS = 3e3;
    this.pointerLocked = false;
    this.gameOver = false;
    this.modalOpen = false;
    this.touchStartPromptActive = false;
    this.debugCommandsEnabled = false;
    this.touchRestartButton = null;
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
    document.addEventListener("pointerlockchange", () => {
      this.pointerLocked = document.pointerLockElement === this.canvas;
      this.canvas.style.cursor = this.pointerLocked ? "none" : "default";
    });
    window.addEventListener("gamepaddisconnected", () => {
      this.prevPadShoot = false;
      this.prevPadBomb = false;
      this.prevPadReset = false;
      if (this.lastInputType === "gamepad" && !this._hasConnectedGamepad()) {
        this.lastInputType = null;
      }
    });
    this.abandonHoldSource = null;
    this.abandonHoldStartMs = 0;
    this.abandonHoldTriggered = false;
  }
  /**
   * @param {boolean} gameOver
   * @returns {void}
   */
  setGameOver(gameOver) {
    if (this.gameOver === gameOver) return;
    this.gameOver = gameOver;
    if (gameOver) {
      this.aimMouse = null;
      this.aimTouchShoot = null;
      this.aimTouchBomb = null;
      this.aimTouchShootFrom = null;
      this.aimTouchShootTo = null;
      this.aimTouchBombFrom = null;
      this.aimTouchBombTo = null;
      this.bombReleaseFrom = null;
      this.bombReleaseTo = null;
      this.leftControl.id = null;
      this.leftControl.pos = null;
      this.leftControl.start = null;
      this.laserControl.id = null;
      this.laserControl.pos = null;
      this.laserControl.start = null;
      this.bombControl.id = null;
      this.bombControl.pos = null;
      this.bombControl.start = null;
      this.startControl.id = null;
      this.startControl.downAt = 0;
      this.startControl.triggered = false;
      this._clearTouchRestartControl();
      this.mouseShootHeld = false;
      this.prevPadShoot = false;
      this.prevPadBomb = false;
      this.prevPadReset = false;
      this.oneshot.shoot = false;
      this.oneshot.bomb = false;
      this.oneshot.abandonRun = false;
      this.oneshot.rescueAll = false;
      this.oneshot.killAllEnemies = false;
      this.oneshot.musicVolumeUp = false;
      this.oneshot.musicVolumeDown = false;
      this.abandonHoldSource = null;
      this.abandonHoldStartMs = 0;
      this.abandonHoldTriggered = false;
    }
  }
  /**
   * @param {boolean} modalOpen
   * @returns {void}
   */
  setModalOpen(modalOpen) {
    this.modalOpen = !!modalOpen;
    if (!this.modalOpen) return;
    this.keys.clear();
    this.justPressed.clear();
    this.aimMouse = null;
    this.aimTouchShoot = null;
    this.aimTouchBomb = null;
    this.aimTouchShootFrom = null;
    this.aimTouchShootTo = null;
    this.aimTouchBombFrom = null;
    this.aimTouchBombTo = null;
    this.bombReleaseFrom = null;
    this.bombReleaseTo = null;
    this.leftControl.id = null;
    this.leftControl.pos = null;
    this.leftControl.start = null;
    this.laserControl.id = null;
    this.laserControl.pos = null;
    this.laserControl.start = null;
    this.bombControl.id = null;
    this.bombControl.pos = null;
    this.bombControl.start = null;
    this.startControl.id = null;
    this.startControl.downAt = 0;
    this.startControl.triggered = false;
    this._clearTouchRestartControl();
    this.mouseShootHeld = false;
    this.prevPadShoot = false;
    this.prevPadBomb = false;
    this.prevPadReset = false;
    this.abandonHoldSource = null;
    this.abandonHoldStartMs = 0;
    this.abandonHoldTriggered = false;
    this._resetOneShotFlags();
  }
  /**
   * @param {boolean} active
   * @returns {void}
   */
  setTouchStartPromptActive(active) {
    this.touchStartPromptActive = !!active;
  }
  /**
   * Enable/disable debug keyboard commands (except Alt+\ toggle).
   * @param {boolean} enabled
   * @returns {void}
   */
  setDebugCommandsEnabled(enabled) {
    this.debugCommandsEnabled = !!enabled;
  }
  /**
   * @returns {HTMLButtonElement|null}
   */
  _ensureTouchRestartButton() {
    if (typeof document === "undefined" || !document.body) return null;
    const existing = document.getElementById("touch-restart-toggle");
    if (existing && existing.parentElement) {
      existing.parentElement.removeChild(existing);
    }
    const button = document.createElement("button");
    button.id = "touch-restart-toggle";
    button.type = "button";
    button.setAttribute("aria-label", "Hold 3 seconds to abandon run");
    button.textContent = "↻";
    button.style.setProperty("--restart-hold-progress", "0%");
    button.addEventListener("pointerdown", (e) => {
      if (this.modalOpen) return;
      if (e.pointerType !== "touch") return;
      if (this.gameOver) return;
      e.preventDefault();
      e.stopPropagation();
      this.lastInputType = "touch";
      this.touchRestartControl.id = e.pointerId;
      this.touchRestartControl.downAt = performance.now();
      this.touchRestartControl.triggered = false;
      if (button.setPointerCapture) {
        try {
          button.setPointerCapture(e.pointerId);
        } catch (_err) {
        }
      }
      this._updateTouchRestartButtonVisual(this.touchRestartControl.downAt);
    });
    const finishHold = (e) => {
      if (e.pointerType !== "touch") return;
      if (this.touchRestartControl.id !== e.pointerId) return;
      e.preventDefault();
      e.stopPropagation();
      const cancelled = e.type === "pointercancel";
      const heldMs = performance.now() - this.touchRestartControl.downAt;
      if (!cancelled && !this.touchRestartControl.triggered && heldMs >= this.HOLD_ABANDON_MS) {
        this.oneshot.abandonRun = true;
      }
      this._clearTouchRestartControl();
    };
    button.addEventListener("pointerup", finishHold);
    button.addEventListener("pointercancel", finishHold);
    button.addEventListener("contextmenu", (e) => e.preventDefault());
    document.body.appendChild(button);
    return button;
  }
  /**
   * @returns {void}
   */
  _clearTouchRestartControl() {
    this.touchRestartControl.id = null;
    this.touchRestartControl.downAt = 0;
    this.touchRestartControl.triggered = false;
    this._updateTouchRestartButtonVisual(performance.now());
  }
  /**
   * @param {number} now
   * @returns {void}
   */
  _updateTouchRestartButtonVisual(now) {
    if (!this.touchRestartButton) return;
    const holding = this.touchRestartControl.id !== null;
    const heldMs = holding ? Math.max(0, now - this.touchRestartControl.downAt) : 0;
    const holdProgress = holding ? Math.max(0, Math.min(1, heldMs / this.HOLD_ABANDON_MS)) : 0;
    const disabled = this.gameOver || this.modalOpen;
    this.touchRestartButton.classList.toggle("touch-restart-disabled", disabled);
    this.touchRestartButton.classList.toggle("touch-restart-holding", holding);
    this.touchRestartButton.style.setProperty("--restart-hold-progress", `${(holdProgress * 100).toFixed(1)}%`);
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
    if (this.modalOpen) {
      return;
    }
    const key = e.key;
    const code = e.code;
    const debugChord = e.altKey && !e.ctrlKey && !e.metaKey;
    const debugDigit = code.startsWith("Digit") && code.length === 6 && code[5] >= "1" && code[5] <= "9";
    const debugToggleHud = debugChord && code === "Backslash";
    const debugAction = debugChord && (code === "KeyM" || code === "KeyC" || code === "KeyN" || code === "KeyV" || code === "KeyT" || code === "KeyY" || code === "KeyF" || code === "KeyP" || code === "KeyX" || debugDigit);
    const debugShortcut = debugToggleHud || debugAction;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "Space"].includes(key)) e.preventDefault();
    if (debugShortcut) e.preventDefault();
    if (!this.keys.has(key)) this.justPressed.add(key);
    this.keys.add(key);
    this.lastInputType = "keyboard";
    if (debugToggleHud) this.oneshot.toggleDevHud = true;
    if (this.debugCommandsEnabled && debugChord && code === "KeyM") this.oneshot.regen = true;
    if (this.debugCommandsEnabled && debugChord && code === "KeyC") this.oneshot.toggleDebug = true;
    if (this.debugCommandsEnabled && debugChord && code === "KeyN") {
      if (e.shiftKey) this.oneshot.prevLevel = true;
      else this.oneshot.nextLevel = true;
    }
    if (key === "r" || key === "R") {
      if (!e.shiftKey) this.oneshot.reset = true;
    }
    if (this.debugCommandsEnabled && debugChord && code === "KeyV") this.oneshot.togglePlanetView = true;
    if (this.debugCommandsEnabled && debugChord && code === "KeyT") this.oneshot.togglePlanetTriangles = true;
    if (this.debugCommandsEnabled && debugChord && code === "KeyY") this.oneshot.toggleCollisionContours = true;
    if (this.debugCommandsEnabled && debugChord && code === "KeyF") this.oneshot.toggleFog = true;
    if ((key === "-" || key === "_") && !e.ctrlKey && !e.metaKey && !e.altKey) {
      this.oneshot.musicVolumeDown = true;
    }
    if ((key === "=" || key === "+") && !e.ctrlKey && !e.metaKey && !e.altKey) {
      this.oneshot.musicVolumeUp = true;
    }
    if ((key === "m" || key === "M" || key === "b" || key === "B") && !e.ctrlKey && !e.metaKey && !e.altKey) {
      this.oneshot.toggleMusic = true;
    }
    if (key === "j" || key === "J") this.oneshot.toggleCombatMusic = true;
    if (this.debugCommandsEnabled && debugChord && debugDigit) this.oneshot.spawnEnemyType = code[5];
    if (this.debugCommandsEnabled && debugChord && code === "KeyP") this.oneshot.rescueAll = true;
    if (this.debugCommandsEnabled && debugChord && code === "KeyX") this.oneshot.killAllEnemies = true;
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
  _inCircle(p, c, r2) {
    const dx = p.x - c.x;
    const dy = p.y - c.y;
    return dx * dx + dy * dy <= r2 * r2;
  }
  /**
   * @param {Point} p
   * @param {{x:number,y:number}} c
   * @param {number} r
   * @returns {boolean}
   */
  _inDiamond(p, c, r2) {
    const dx = Math.abs(p.x - c.x);
    const dy = Math.abs(p.y - c.y);
    return dx + dy <= r2;
  }
  /**
   * @param {Point} p
   * @param {{x:number,y:number}} c
   * @param {number} r
   * @returns {boolean}
   */
  _inSquare(p, c, r2) {
    const dx = Math.abs(p.x - c.x);
    const dy = Math.abs(p.y - c.y);
    return Math.max(dx, dy) <= r2;
  }
  /**
   * @param {PointerEvent} e
   * @returns {void}
   */
  _onPointerDown(e) {
    if (this.modalOpen) {
      return;
    }
    if (this.gameOver && e.pointerType !== "touch") {
      return;
    }
    if (e.pointerType !== "touch") {
      if (!this.pointerLocked && document.pointerLockElement !== this.canvas) {
        this.canvas.requestPointerLock();
      }
      if (!this.pointerLocked) {
        this.aimMouse = this._pointerPos(e);
      }
      if (e.button === 2) this._fireBomb();
      if ((e.button === 0 || e.buttons & 1) && !this.mouseShootHeld) {
        this.mouseShootHeld = true;
        this.oneshot.shoot = true;
      }
      this.lastInputType = "mouse";
      return;
    }
    e.preventDefault();
    this.lastInputType = "touch";
    const p = this._pointerPos(e);
    this.canvas.setPointerCapture(e.pointerId);
    if (this.touchStartPromptActive && this._inCircle(p, TOUCH_UI.start, TOUCH_UI.start.r)) {
      this.startControl.id = e.pointerId;
      this.startControl.downAt = performance.now();
      this.startControl.triggered = false;
      return;
    }
    if (this.gameOver) {
      return;
    }
    if (this.leftControl.id === null && this._inCircle(p, TOUCH_UI.left, TOUCH_UI.left.r)) {
      this.leftControl.id = e.pointerId;
      this.leftControl.pos = p;
      this.leftControl.start = p;
    } else if (this.laserControl.id === null && this._inDiamond(p, TOUCH_UI.laser, TOUCH_UI.laser.r)) {
      this.laserControl.id = e.pointerId;
      this.laserControl.pos = p;
      this.laserControl.start = p;
    } else if (this.bombControl.id === null && this._inSquare(p, TOUCH_UI.bomb, TOUCH_UI.bomb.r)) {
      this.bombControl.id = e.pointerId;
      this.bombControl.pos = p;
      this.bombControl.start = p;
    }
  }
  /**
   * @param {PointerEvent} e
   * @returns {void}
   */
  _onPointerMove(e) {
    if (this.modalOpen) {
      return;
    }
    if (this.gameOver && e.pointerType !== "touch") {
      return;
    }
    if (e.pointerType !== "touch") {
      if (this.pointerLocked) {
        const rect = this.canvas.getBoundingClientRect();
        const w = Math.max(1, rect.width);
        const h = Math.max(1, rect.height);
        const nx = (this.aimMouse ? this.aimMouse.x : 0.5) + e.movementX / w;
        const ny = (this.aimMouse ? this.aimMouse.y : 0.5) + e.movementY / h;
        this.aimMouse = {
          x: Math.max(0, Math.min(1, nx)),
          y: Math.max(0, Math.min(1, ny))
        };
      } else {
        this.aimMouse = this._pointerPos(e);
      }
      this.mouseShootHeld = !!(e.buttons & 1);
      this.lastInputType = "mouse";
      return;
    }
    const p = this._pointerPos(e);
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
    if (this.modalOpen) {
      return;
    }
    if (this.gameOver && e.pointerType !== "touch") {
      return;
    }
    if (e.pointerType !== "touch") {
      if (!this.pointerLocked) {
        this.aimMouse = this._pointerPos(e);
      }
      this.mouseShootHeld = !!(e.buttons & 1);
      this.lastInputType = "mouse";
      return;
    }
    if (this.startControl.id === e.pointerId) {
      const cancelled = e.type === "pointercancel";
      if (!cancelled && !this.startControl.triggered) {
        this.oneshot.reset = true;
      }
      this.startControl.id = null;
      this.startControl.downAt = 0;
      this.startControl.triggered = false;
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
      const start = this.bombControl.start;
      const pos = this.bombControl.pos;
      if (start && pos) {
        const dx = pos.x - start.x;
        const dy = pos.y - start.y;
        const moved = Math.hypot(dx, dy);
        if (moved >= TOUCH_UI.dead) {
          this.oneshot.bomb = true;
          this.bombReleaseFrom = { x: TOUCH_UI.bomb.x, y: TOUCH_UI.bomb.y };
          this.bombReleaseTo = { x: pos.x, y: pos.y };
        }
      }
      this.bombControl.id = null;
      this.bombControl.pos = null;
      this.bombControl.start = null;
    }
  }
  /**
   * @returns {boolean}
   */
  _hasConnectedGamepad() {
    if (typeof navigator === "undefined" || typeof navigator.getGamepads !== "function") return false;
    const pads = navigator.getGamepads() || [];
    for (const pad of pads) {
      if (!pad) continue;
      if (pad.connected === false) continue;
      return true;
    }
    return false;
  }
  /**
   * @returns {{stickThrust:Point,left:boolean,right:boolean,thrust:boolean,down:boolean}}
   */
  _touchState() {
    let left = false;
    let right = false;
    let thrust = false;
    let down = false;
    let stickThrust = { x: 0, y: 0 };
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
      const len = Math.hypot(dx, dy);
      const maxRadius = Math.max(dead + 1e-4, TOUCH_UI.left.r || 0);
      const clampedLen = Math.min(len, maxRadius);
      let lenAdjusted = (clampedLen - dead) / Math.max(1e-4, maxRadius - dead);
      lenAdjusted = Math.max(0, Math.min(1, lenAdjusted));
      if (len > 1e-4 && lenAdjusted > 0) {
        const ux = dx / len;
        const uy = dy / len;
        stickThrust = { x: ux * lenAdjusted, y: -uy * lenAdjusted };
      }
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
      const radius = Math.max(0.25, GAME.AIM_SCREEN_RADIUS || 0.25);
      if (len > 1e-4) {
        const ux = dx / len;
        const uy = dy / len;
        return { x: 0.5 + ux * radius, y: 0.5 + uy * radius };
      }
      return { x: 0.5, y: 0.5 - radius };
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
    return { stickThrust, left, right, thrust, down };
  }
  /**
   * @returns {{stickThrust:Point,left:boolean,right:boolean,thrust:boolean,down:boolean,aim:Point|null,shoot:boolean,bomb:boolean,reset:boolean,abandonRun:boolean}}
   */
  _gamepadState() {
    const pads = navigator.getGamepads ? navigator.getGamepads() || [] : [];
    let hasConnectedPad = false;
    let inputCombined = { stickThrust: { x: 0, y: 0 }, left: false, right: false, thrust: false, down: false, aim: null, shoot: false, bomb: false, reset: false, abandonRun: false };
    for (const pad of pads) {
      if (!pad || pad.connected === false) continue;
      hasConnectedPad = true;
      const dead = 0.2;
      const ax0 = pad.axes && pad.axes.length ? pad.axes[0] : 0;
      const ax1 = pad.axes && pad.axes.length > 1 ? pad.axes[1] : 0;
      const ax2 = pad.axes && pad.axes.length > 2 ? pad.axes[2] : 0;
      const ax3 = pad.axes && pad.axes.length > 3 ? pad.axes[3] : 0;
      const alen = Math.hypot(ax2, ax3);
      const thrustLen = Math.hypot(ax0, ax1);
      let thrustLenAdjusted = (thrustLen - dead) / (1 - dead);
      thrustLenAdjusted = Math.max(0, Math.min(1, thrustLenAdjusted));
      const thrustScale = thrustLenAdjusted <= 0 ? 0 : thrustLenAdjusted / thrustLen;
      const stickThrust = { x: ax0 * thrustScale, y: -ax1 * thrustScale };
      const faceBottomPressed = !!(pad.buttons && pad.buttons[0] && pad.buttons[0].pressed);
      const faceRightPressed = !!(pad.buttons && pad.buttons[1] && pad.buttons[1].pressed);
      const dpadUpPressed = !!(pad.buttons && pad.buttons[12] && pad.buttons[12].pressed);
      const dpadDownPressed = !!(pad.buttons && pad.buttons[13] && pad.buttons[13].pressed);
      const dpadLeftPressed = !!(pad.buttons && pad.buttons[14] && pad.buttons[14].pressed);
      const dpadRightPressed = !!(pad.buttons && pad.buttons[15] && pad.buttons[15].pressed);
      const left = dpadLeftPressed;
      const right = dpadRightPressed;
      const thrust = dpadUpPressed;
      const down = faceRightPressed || dpadDownPressed;
      let aim = null;
      if (alen > dead) {
        const ux = ax2 / alen;
        const uy = ax3 / alen;
        const radius = Math.max(0.25, GAME.AIM_SCREEN_RADIUS || 0.25);
        aim = { x: 0.5 + ux * radius, y: 0.5 + uy * radius };
      }
      const lb = !!(pad.buttons && pad.buttons[4] && pad.buttons[4].pressed);
      const lt = !!(pad.buttons && pad.buttons[6] && (pad.buttons[6].pressed || pad.buttons[6].value > 0.4));
      const rb = !!(pad.buttons && pad.buttons[5] && pad.buttons[5].pressed);
      const rt = !!(pad.buttons && pad.buttons[7] && (pad.buttons[7].pressed || pad.buttons[7].value > 0.4));
      const startPressed = !!(pad.buttons && pad.buttons[9] && pad.buttons[9].pressed);
      const shoot = rb || rt;
      const bomb = lb || lt;
      const reset = faceBottomPressed;
      const abandonRun = startPressed;
      if (thrustLenAdjusted > 0) {
        const thrustLenCombined = Math.hypot(inputCombined.stickThrust.x, inputCombined.stickThrust.y);
        if (thrustLenAdjusted > thrustLenCombined) {
          inputCombined.stickThrust = stickThrust;
        }
      }
      inputCombined.left = inputCombined.left || left;
      inputCombined.right = inputCombined.right || right;
      inputCombined.thrust = inputCombined.thrust || thrust;
      inputCombined.down = inputCombined.down || down;
      inputCombined.shoot = inputCombined.shoot || shoot;
      inputCombined.bomb = inputCombined.bomb || bomb;
      inputCombined.reset = inputCombined.reset || reset;
      inputCombined.abandonRun = inputCombined.abandonRun || abandonRun;
      if (aim) {
        const ax = aim.x - 0.5;
        const ay = aim.y - 0.5;
        if (!inputCombined.aim || ax * ax + ay * ay > (inputCombined.aim.x - 0.5) * (inputCombined.aim.x - 0.5) + (inputCombined.aim.y - 0.5) * (inputCombined.aim.y - 0.5)) {
          inputCombined.aim = aim;
        }
      }
    }
    if (inputCombined.left || inputCombined.right || inputCombined.thrust || inputCombined.down || inputCombined.shoot || inputCombined.bomb || inputCombined.reset || inputCombined.abandonRun || inputCombined.stickThrust.x * inputCombined.stickThrust.x + inputCombined.stickThrust.y * inputCombined.stickThrust.y > 0) {
      this.lastInputType = "gamepad";
    } else if (!hasConnectedPad && this.lastInputType === "gamepad") {
      this.lastInputType = null;
      this.prevPadShoot = false;
      this.prevPadBomb = false;
      this.prevPadReset = false;
    }
    return inputCombined;
  }
  /**
   * @returns {InputState}
   */
  update() {
    if (!this.touchRestartButton) {
      this.touchRestartButton = this._ensureTouchRestartButton();
    }
    if (this.modalOpen) {
      const state2 = {
        stickThrust: { x: 0, y: 0 },
        left: false,
        right: false,
        thrust: false,
        down: false,
        reset: false,
        abandonRun: false,
        abandonHoldActive: false,
        abandonHoldRemainingMs: 0,
        regen: false,
        toggleDebug: false,
        toggleDevHud: false,
        togglePlanetView: false,
        togglePlanetTriangles: false,
        toggleCollisionContours: false,
        toggleFog: false,
        toggleMusic: false,
        toggleCombatMusic: false,
        musicVolumeUp: false,
        musicVolumeDown: false,
        nextLevel: false,
        prevLevel: false,
        shootHeld: false,
        shootPressed: false,
        shoot: false,
        bomb: false,
        rescueAll: false,
        killAllEnemies: false,
        spawnEnemyType: null,
        aim: null,
        aimShoot: null,
        aimBomb: null,
        aimShootFrom: null,
        aimShootTo: null,
        aimBombFrom: null,
        aimBombTo: null,
        touchUi: null,
        touchUiVisible: false,
        inputType: this.lastInputType
      };
      this._resetOneShotFlags();
      return state2;
    }
    const now = performance.now();
    const keyState = {
      left: false,
      right: false,
      thrust: false,
      down: false
    };
    this.keys.forEach((k) => {
      if (KEY_LEFT.has(k)) keyState.left = true;
      if (KEY_RIGHT.has(k)) keyState.right = true;
      if (KEY_THRUST.has(k)) keyState.thrust = true;
      if (KEY_DOWN.has(k)) keyState.down = true;
    });
    const t = this._touchState();
    const g = this._gamepadState();
    let left = keyState.left || t.left || g.left;
    let right = keyState.right || t.right || g.right;
    let thrust = keyState.thrust || t.thrust || g.thrust;
    let down = keyState.down || t.down || g.down;
    let stickThrust = g.stickThrust;
    const touchStickMag = Math.hypot(t.stickThrust.x, t.stickThrust.y);
    const gamepadStickMag = Math.hypot(stickThrust.x, stickThrust.y);
    if (touchStickMag > gamepadStickMag) {
      stickThrust = t.stickThrust;
    }
    if (!this.gameOver && g.shoot && !this.prevPadShoot) {
      this.oneshot.shoot = true;
    }
    if (g.bomb && !this.prevPadBomb) this.oneshot.bomb = true;
    if (g.reset && !this.prevPadReset) this.oneshot.reset = true;
    this.prevPadShoot = g.shoot;
    this.prevPadBomb = g.bomb;
    this.prevPadReset = g.reset;
    const keyboardAbandonHeld = this.keys.has("Shift") && (this.keys.has("r") || this.keys.has("R"));
    const gamepadAbandonHeld = !!g.abandonRun;
    const touchAbandonHeld = !this.gameOver && this.touchRestartControl.id !== null;
    const holdSource = touchAbandonHeld ? "touch" : gamepadAbandonHeld ? "gamepad" : keyboardAbandonHeld ? "keyboard" : null;
    if (holdSource) {
      if (this.abandonHoldSource !== holdSource) {
        this.abandonHoldSource = holdSource;
        this.abandonHoldStartMs = now;
        this.abandonHoldTriggered = false;
      }
      if (!this.abandonHoldTriggered && now - this.abandonHoldStartMs >= this.HOLD_ABANDON_MS) {
        this.oneshot.abandonRun = true;
        this.abandonHoldTriggered = true;
        if (holdSource === "touch") {
          this.touchRestartControl.triggered = true;
        }
      }
    } else {
      this.abandonHoldSource = null;
      this.abandonHoldStartMs = 0;
      this.abandonHoldTriggered = false;
    }
    const abandonHoldActive = !!holdSource;
    const abandonHoldRemainingMs = abandonHoldActive ? Math.max(0, this.HOLD_ABANDON_MS - (now - this.abandonHoldStartMs)) : 0;
    this._updateTouchRestartButtonVisual(now);
    const touchUiVisible = !this.gameOver && this.lastInputType === "touch";
    const touchUi = touchUiVisible ? {
      leftTouch: this.leftControl.pos,
      laserTouch: this.laserControl.pos,
      bombTouch: this.bombControl.pos
    } : null;
    let aimShoot = null;
    let aimBomb = null;
    let aim = null;
    let aimBombFrom = this.aimTouchBombFrom;
    let aimBombTo = this.aimTouchBombTo;
    if (this.bombReleaseFrom && this.bombReleaseTo) {
      aimBombFrom = this.bombReleaseFrom;
      aimBombTo = this.bombReleaseTo;
    }
    if (this.gameOver) {
      aimShoot = null;
      aimBomb = null;
      aim = null;
      left = false;
      right = false;
      thrust = false;
      down = false;
      this.oneshot.shoot = false;
      this.oneshot.bomb = false;
    } else if (this.lastInputType === "touch") {
      aimShoot = this.aimTouchShoot;
      aimBomb = this.aimTouchBomb || aimShoot;
      aim = aimShoot || aimBomb || null;
    } else if (this.lastInputType === "gamepad") {
      aimShoot = g.aim;
      aimBomb = aimShoot;
      aim = aimShoot || null;
    } else {
      aimShoot = this.aimMouse || g.aim || null;
      aimBomb = this.aimTouchBomb || aimShoot;
      aim = aimShoot || aimBomb || null;
    }
    const touchShootHeld = !this.gameOver && this.laserControl.id !== null && !!this.aimTouchShoot;
    const shootHeld = !this.gameOver && (this.mouseShootHeld || !!g.shoot || touchShootHeld);
    const shootPressed = this.oneshot.shoot;
    const state = {
      stickThrust,
      left,
      right,
      thrust,
      down,
      reset: this.oneshot.reset,
      abandonRun: this.oneshot.abandonRun,
      abandonHoldActive,
      abandonHoldRemainingMs,
      regen: this.oneshot.regen,
      toggleDebug: this.oneshot.toggleDebug,
      toggleDevHud: this.oneshot.toggleDevHud,
      togglePlanetView: this.oneshot.togglePlanetView,
      togglePlanetTriangles: this.oneshot.togglePlanetTriangles,
      toggleCollisionContours: this.oneshot.toggleCollisionContours,
      toggleFog: this.oneshot.toggleFog,
      toggleMusic: this.oneshot.toggleMusic,
      toggleCombatMusic: this.oneshot.toggleCombatMusic,
      musicVolumeUp: this.oneshot.musicVolumeUp,
      musicVolumeDown: this.oneshot.musicVolumeDown,
      nextLevel: this.oneshot.nextLevel,
      prevLevel: this.oneshot.prevLevel,
      shootHeld,
      shootPressed,
      shoot: shootPressed,
      bomb: this.oneshot.bomb,
      rescueAll: this.oneshot.rescueAll,
      killAllEnemies: this.oneshot.killAllEnemies,
      spawnEnemyType: this.oneshot.spawnEnemyType,
      aim,
      aimShoot,
      aimBomb,
      aimShootFrom: this.aimTouchShootFrom,
      aimShootTo: this.aimTouchShootTo,
      aimBombFrom,
      aimBombTo,
      touchUi,
      touchUiVisible,
      inputType: this.lastInputType
    };
    this._resetOneShotFlags();
    return state;
  }
  /**
   * @returns {void}
   */
  _resetOneShotFlags() {
    this.justPressed.clear();
    this.oneshot.reset = false;
    this.oneshot.abandonRun = false;
    this.oneshot.regen = false;
    this.oneshot.toggleDebug = false;
    this.oneshot.toggleDevHud = false;
    this.oneshot.togglePlanetView = false;
    this.oneshot.togglePlanetTriangles = false;
    this.oneshot.toggleCollisionContours = false;
    this.oneshot.toggleFog = false;
    this.oneshot.toggleMusic = false;
    this.oneshot.toggleCombatMusic = false;
    this.oneshot.musicVolumeUp = false;
    this.oneshot.musicVolumeDown = false;
    this.oneshot.nextLevel = false;
    this.oneshot.prevLevel = false;
    this.oneshot.shoot = false;
    this.oneshot.bomb = false;
    this.oneshot.rescueAll = false;
    this.oneshot.killAllEnemies = false;
    this.oneshot.spawnEnemyType = null;
    this.bombReleaseFrom = null;
    this.bombReleaseTo = null;
  }
}
function updateHud(hud2, stats) {
  if (stats.state === "crashed") {
    hud2.textContent = "Game over";
    return;
  }
  const debugSuffix = stats.debug ? ` | miner candidates: ${stats.minerCandidates}` : "";
  hud2.textContent = `fps: ${stats.fps} | hull: ${stats.shipHp} | bombs: ${stats.bombs} | level: ${stats.level} | state: ${stats.state} | speed: ${stats.speed.toFixed(1)} | miners: ${stats.miners} | dead: ${stats.minersDead} | verts: ${stats.verts.toLocaleString()} | air: ${stats.air.toFixed(3)}${debugSuffix} | LMB: shoot | RMB: bomb | -/=: music vol | Alt+M: new map | Alt+N: next level | Alt+Shift+N: prev level | Alt+C: debug collisions | Alt+T: planet tri outline | Alt+Y: collision contours | Alt+V: view map | Alt+X: clear enemies | Alt+\\: toggle dev HUD | M/B: music | J: combat tracks | R: restart`;
}
function updatePlanetLabel(el, label) {
  el.textContent = label || "";
}
function updateObjectiveLabel(el, text) {
  el.textContent = text || "";
}
function updateShipStatusLabel(el, stats) {
  el.textContent = `Hull ${stats.shipHp}/${stats.shipHpMax} | Bombs ${stats.bombs}/${stats.bombsMax}`;
}
function updateHeatMeter(el, heat, show, flashing) {
  if (!el) return;
  if (!show) {
    el.style.display = "none";
    el.classList.remove("heat-flash");
    return;
  }
  el.style.display = "block";
  el.classList.toggle("heat-flash", !!flashing);
  const value = Math.max(0, Math.min(100, Math.round(heat)));
  const text = (
    /** @type {HTMLElement|null} */
    el.querySelector(".heat-text")
  );
  if (text) text.textContent = `Heat ${value}`;
  const fill = (
    /** @type {HTMLElement|null} */
    el.querySelector(".heat-bar-fill")
  );
  if (fill) fill.style.width = `${value}%`;
  layoutHeatMeter(el);
}
function layoutHeatMeter(el) {
  const pad = 10;
  const baseBottom = 14;
  const minViewportInset = 12;
  const vH = window.innerHeight || document.documentElement.clientHeight || 0;
  const objective = (
    /** @type {HTMLElement|null} */
    document.getElementById("objective-label")
  );
  const planet = (
    /** @type {HTMLElement|null} */
    document.getElementById("planet-label")
  );
  const shipStatus = (
    /** @type {HTMLElement|null} */
    document.getElementById("ship-status-label")
  );
  el.style.left = "50%";
  el.style.transform = "translateX(-50%)";
  el.style.top = "auto";
  el.style.bottom = `${baseBottom}px`;
  const meterRect = el.getBoundingClientRect();
  const labels = [objective, planet].filter((node) => !!node).map((node) => (
    /** @type {HTMLElement} */
    node.getBoundingClientRect()
  ));
  const overlaps = labels.filter((r2) => rectsOverlap(meterRect, r2, pad));
  if (!overlaps.length) return;
  let minTop = overlaps[0].top;
  for (let i = 1; i < overlaps.length; i++) {
    if (overlaps[i].top < minTop) minTop = overlaps[i].top;
  }
  const liftedBottom = Math.max(baseBottom, Math.round(vH - minTop + pad));
  const maxLiftedBottom = Math.max(baseBottom, Math.round(vH - meterRect.height - minViewportInset));
  el.style.bottom = `${Math.min(liftedBottom, maxLiftedBottom)}px`;
  el.style.top = "auto";
  const liftedRect = el.getBoundingClientRect();
  const stillOverlaps = labels.some((r2) => rectsOverlap(liftedRect, r2, pad));
  if (!stillOverlaps) return;
  const topY = shipStatus ? Math.round(shipStatus.getBoundingClientRect().bottom + pad) : minViewportInset;
  const maxTop = Math.max(minViewportInset, Math.round(vH - liftedRect.height - minViewportInset));
  el.style.top = `${Math.min(maxTop, Math.max(minViewportInset, topY))}px`;
  el.style.bottom = "auto";
}
function rectsOverlap(a, b, margin) {
  return !(a.right < b.left - margin || a.left > b.right + margin || a.bottom < b.top - margin || a.top > b.bottom + margin);
}
function isAir(mesh, x, y) {
  return mesh.airValueAtWorld(x, y) > 0.5;
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
class Enemies {
  /**
   * Build enemy state and behavior helpers.
   * @param {Object} deps
   * @param {import("./planet.js").Planet} deps.planet Planet (gravity/orbits).
   * @param {import("./types.d.js").CollisionQuery} deps.collision Collision query API.
   * @param {number} deps.total Initial enemy count to spawn.
   * @param {"uniform"|"random"|"clusters"} [deps.placement]
   * @param {number} [deps.orbitingTurretCount]
   * @param {number} deps.level Current level index.
   * @param {number} deps.levelSeed Base seed for this level.
   * @param {(enemy:Enemy)=>void} [deps.onEnemyShot]
   * @param {(enemy:Enemy)=>void} [deps.onEnemyDestroyed]
   */
  constructor({ planet, collision, total, level, levelSeed, placement, orbitingTurretCount, onEnemyShot, onEnemyDestroyed }) {
    this.planet = planet;
    this.collision = collision;
    this.params = planet.getPlanetParams();
    this.onEnemyShot = typeof onEnemyShot === "function" ? onEnemyShot : null;
    this.onEnemyDestroyed = typeof onEnemyDestroyed === "function" ? onEnemyDestroyed : null;
    this.enemies = [];
    this.shots = [];
    this.explosions = [];
    this.debris = [];
    this._HUNTER_SPEED = 1;
    this._RANGER_SPEED = 1.6;
    this._HUNTER_SHOT_CD = 1.2;
    this._RANGER_SHOT_CD = 1.8;
    this._SHOT_SPEED = 6.5;
    this._TURRET_MAX_RANGE = 5;
    this._TURRET_SHOT_SPEED = 5;
    this._SHOT_LIFE = 3;
    this._APPROACH_RANGE = 2;
    this._DETONATE_RANGE = 0.5;
    this._DETONATE_FUSE = 0.6;
    this._LOS_STEP = 0.2;
    this._HUNTER_COLLIDER = circleOffsets(0.22, 6);
    this._RANGER_COLLIDER = circleOffsets(0.22, 6);
    this._CRAWLER_COLLIDER = circleOffsets(0.2, 6);
    this._placement = placement || "random";
    this.spawn(total, level, levelSeed, this._placement, orbitingTurretCount);
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
   * @param {EnemyType} type
   * @param {number} x
   * @param {number} y
   * @returns {void}
   */
  spawnDebug(type, x, y) {
    const cooldown = Math.random();
    if (type === "hunter") {
      this.enemies.push({ type, x, y, vx: 0, vy: 0, cooldown, hp: 2, iNodeGoal: null });
    } else if (type === "ranger") {
      this.enemies.push({ type, x, y, vx: 0, vy: 0, cooldown, hp: 2, iNodeGoal: null });
    } else if (type === "crawler") {
      const dir = Math.random() * Math.PI * 2;
      const speed = 1.5;
      this.enemies.push({ type, x, y, vx: Math.cos(dir) * speed, vy: Math.sin(dir) * speed, cooldown: 0, hp: 1, iNodeGoal: null });
    } else if (type === "turret") {
      this.enemies.push({ type, x, y, vx: 0, vy: 0, cooldown, hp: 1, iNodeGoal: null });
    } else if (type === "orbitingTurret") {
      this.enemies.push({ type, x, y, vx: 0, vy: 0, cooldown, hp: 1, iNodeGoal: null });
    }
  }
  /**
   * @param {number} total
   * @param {number} level
   * @param {number} levelSeed
   * @param {"uniform"|"random"|"clusters"} [placement]
   * @param {number} [orbitingTurretCount]
   * @returns {void}
   */
  spawn(total, level, levelSeed, placement, orbitingTurretCount) {
    this.enemies.length = 0;
    this.shots.length = 0;
    this.explosions.length = 0;
    this.debris.length = 0;
    if (total <= 0) return;
    const planet = this.planet;
    const planetCfg = planet.getPlanetConfig ? planet.getPlanetConfig() : null;
    const allowedSet = new Set(planetCfg && planetCfg.enemyAllow ? planetCfg.enemyAllow : []);
    if (allowedSet.size === 0) {
      allowedSet.add("hunter");
    }
    const fallbackOrder = ["hunter", "ranger", "crawler", "turret"];
    const fallbackType = fallbackOrder.find((t) => allowedSet.has(t)) || "hunter";
    const seed = levelSeed + level * 133;
    let numEnemiesRemaining = total;
    let hunters = Math.min(numEnemiesRemaining, Math.floor(total * 0.125));
    numEnemiesRemaining -= hunters;
    let rangers = Math.min(numEnemiesRemaining, Math.floor(total * 0.25));
    numEnemiesRemaining -= rangers;
    let crawlers = Math.min(numEnemiesRemaining, Math.floor(total * 0.25));
    numEnemiesRemaining -= crawlers;
    let turrets = numEnemiesRemaining;
    const cfgOrbiting = planetCfg && typeof planetCfg.orbitingTurretCount === "number" ? Math.max(0, Math.round(planetCfg.orbitingTurretCount)) : void 0;
    let orbitingTurrets = typeof orbitingTurretCount === "number" ? Math.max(0, Math.round(orbitingTurretCount)) : typeof cfgOrbiting === "number" ? cfgOrbiting : 8;
    let remainder = 0;
    if (!allowedSet.has("hunter")) {
      remainder += hunters;
      hunters = 0;
    }
    if (!allowedSet.has("ranger")) {
      remainder += rangers;
      rangers = 0;
    }
    if (!allowedSet.has("crawler")) {
      remainder += crawlers;
      crawlers = 0;
    }
    if (!allowedSet.has("turret")) {
      remainder += turrets;
      turrets = 0;
    }
    if (remainder > 0) {
      if (fallbackType === "hunter") hunters += remainder;
      else if (fallbackType === "ranger") rangers += remainder;
      else if (fallbackType === "crawler") crawlers += remainder;
      else turrets += remainder;
    }
    if (!allowedSet.has("orbitingTurret")) orbitingTurrets = 0;
    const rHunterRangerMax = this.params.RMAX - 1;
    const hunterPts = planet.sampleAirPoints(hunters, seed + 1, rHunterRangerMax * 0.5, rHunterRangerMax, placement);
    const rangerPts = planet.sampleAirPoints(rangers, seed + 2, rHunterRangerMax * 0.75, rHunterRangerMax, placement);
    const crawlerPts = planet.sampleAirPoints(crawlers, seed + 3, 0, this.params.RMAX - 0.6, placement);
    const turretPts = planet.sampleTurretPoints(turrets, seed + 4, placement, GAME.MINER_MIN_SEP, true);
    if (turrets > 0 && turretPts.length < turrets) {
      const standable = planet.getStandablePoints && planet.getStandablePoints() || [];
      console.error("[Level] turrets spawn insufficient standable points", {
        level,
        target: turrets,
        placed: turretPts.length,
        standable: standable.length
      });
    }
    for (const [x, y] of hunterPts) {
      this.enemies.push({ type: "hunter", x, y, vx: 0, vy: 0, cooldown: Math.random(), hp: 3, iNodeGoal: null });
    }
    for (const [x, y] of rangerPts) {
      this.enemies.push({ type: "ranger", x, y, vx: 0, vy: 0, cooldown: Math.random(), hp: 2, iNodeGoal: null });
    }
    for (const [x, y] of crawlerPts) {
      const dir = Math.random() * Math.PI * 2;
      const speed = Math.min(3, level * 0.25 + 0.5);
      const vx = Math.cos(dir) * speed;
      const vy = Math.sin(dir) * speed;
      this.enemies.push({ type: "crawler", x, y, vx, vy, cooldown: 0, hp: 1, iNodeGoal: null });
    }
    for (const [x, y] of turretPts) {
      let tx = x;
      let ty = y;
      const res = planet.nudgeOutOfTerrain(tx, ty, 0.8, 0.08, 0.18);
      if (res && res.ok) {
        tx = res.x;
        ty = res.y;
      }
      const info = planet.surfaceInfoAtWorld(tx, ty, 0.18);
      if (info) {
        const lift = 0.18;
        tx += info.nx * lift;
        ty += info.ny * lift;
      }
      this.enemies.push({ type: "turret", x: tx, y: ty, vx: 0, vy: 0, cooldown: Math.random(), hp: 1, iNodeGoal: null });
    }
    {
      const rand = mulberry32$1(seed + 5);
      const directionCCW = rand() < 0.5;
      const perigee = this.params.RMAX + 2;
      const eccentricity = rand() * 0.15;
      let angle = rand() * Math.PI * 2;
      for (let i = 0; i < orbitingTurrets; ++i) {
        const { x, y, vx, vy } = planet.orbitStateFromElements(perigee, eccentricity, angle, directionCCW);
        this.enemies.push({ type: "orbitingTurret", x, y, vx, vy, cooldown: Math.random(), hp: 1, iNodeGoal: null });
        angle += 0.1;
      }
    }
  }
  /**
   * @param {Ship} ship
   * @param {number} dt
   * @returns {void}
   */
  update(ship, dt) {
    const { collision } = this;
    if (this.debris.length) {
      for (let i = this.debris.length - 1; i >= 0; i--) {
        const d = this.debris[i];
        Math.hypot(d.x, d.y) || 1;
        const { x: gx, y: gy } = collision.gravityAt(d.x, d.y);
        d.vx += gx * dt;
        d.vy += gy * dt;
        d.vx *= Math.max(0, 1 - this.params.DRAG * dt);
        d.vy *= Math.max(0, 1 - this.params.DRAG * dt);
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
      if (s.life <= 0 || !isAir(collision, s.x, s.y)) {
        this.shots.splice(i, 1);
      }
    }
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      this.explosions[i].life -= dt;
      if (this.explosions[i].life <= 0) this.explosions.splice(i, 1);
    }
    const shipTarget = ship && ship.state !== "crashed" ? ship : null;
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (e.hitT && e.hitT > 0) {
        e.hitT = Math.max(0, e.hitT - dt);
      }
      if (e.hp <= 0) {
        if (this.onEnemyDestroyed) {
          this.onEnemyDestroyed(e);
        }
        const pieces = 6;
        for (let k = 0; k < pieces; k++) {
          const ang = Math.random() * Math.PI * 2;
          const sp = 1 + Math.random() * 2;
          this.debris.push({
            x: e.x + Math.cos(ang) * 0.08,
            y: e.y + Math.sin(ang) * 0.08,
            vx: e.vx + Math.cos(ang) * sp,
            vy: e.vy + Math.sin(ang) * sp,
            a: Math.random() * Math.PI * 2,
            w: (Math.random() - 0.5) * 6,
            life: 1.1 + Math.random() * 0.8
          });
        }
        this.explosions.push({ x: e.x, y: e.y, life: 0.5, owner: e.type, radius: 0.8 });
        this.enemies.splice(i, 1);
        continue;
      }
      if (e.type === "hunter") {
        this._updateHunter(e, shipTarget, dt);
      } else if (e.type === "ranger") {
        this._updateRanger(e, shipTarget, dt);
      } else if (e.type === "crawler") {
        if (!this._updateCrawler(e, shipTarget, dt)) {
          if (this.onEnemyDestroyed) {
            this.onEnemyDestroyed(e);
          }
          this.enemies.splice(i, 1);
        }
      } else if (e.type === "turret") {
        this._updateTurret(e, shipTarget, dt);
      } else if (e.type === "orbitingTurret") {
        this._updateOrbitingTurret(e, shipTarget, dt);
      }
    }
  }
  /**
   * @param {Enemy} e 
   * @param {Ship|null} ship 
   * @param {number} dt 
   * @returns {void}
   */
  _updateHunter(e, ship, dt) {
    if (this._tryMoveHunter(e, ship, dt)) {
      e.iNodeGoal = null;
    } else {
      this._wander(e, this._HUNTER_SPEED, dt);
    }
    this._updateTurret(e, ship, dt);
  }
  /**
   * @param {Enemy} e 
   * @param {Ship|null} ship 
   * @param {number} dt 
   * @returns {boolean}
   */
  _tryMoveHunter(e, ship, dt) {
    if (!ship) return false;
    if (Math.hypot(ship.x, ship.y) > this.planet.planetRadius + 1) return false;
    const maxPathDist = 16;
    if (Math.hypot(e.x - ship.x, e.y - ship.y) > maxPathDist) return false;
    const radialGraph = this.planet.radialGraph;
    const nodeShip = this.planet.nearestRadialNodeInAir(ship.x, ship.y);
    const nodeHunter = this.planet.nearestRadialNodeInAir(e.x, e.y);
    const pathNodes = findPathAStar(radialGraph, nodeHunter, nodeShip, this.planet.airNodesBitmap);
    if (!pathNodes || pathNodes.length < 2) return false;
    const pathLengthExceeds = (maxLength) => {
      let pathLength = 0;
      let node0 = radialGraph.nodes[pathNodes[0]];
      for (let i = 1; i < pathNodes.length; ++i) {
        const node1 = radialGraph.nodes[pathNodes[i]];
        pathLength += Math.hypot(node1.x - node0.x, node1.y - node0.y);
        if (pathLength > maxLength) return true;
        node0 = node1;
      }
      return false;
    };
    if (pathLengthExceeds(maxPathDist)) return false;
    const nodeTarget = radialGraph.nodes[pathNodes[1]];
    let dx = nodeTarget.x - e.x;
    let dy = nodeTarget.y - e.y;
    const dist = Math.hypot(dx, dy);
    const maxMoveDist = this._HUNTER_SPEED * dt;
    if (dist > maxMoveDist) {
      const scale = maxMoveDist / dist;
      dx *= scale;
      dy *= scale;
    }
    e.x += dx;
    e.y += dy;
    e.vx = dx / dt;
    e.vy = dy / dt;
    return true;
  }
  /**
   * @param {Enemy} e 
   * @param {Ship|null} ship 
   * @param {number} dt 
   * @returns {void}
   */
  _updateRanger(e, ship, dt) {
    const seesShip = ship && Math.hypot(ship.x - e.x, ship.y - e.y) < this._TURRET_MAX_RANGE && lineOfSightAir(this.collision, e.x, e.y, ship.x, ship.y, this._LOS_STEP);
    if (seesShip) {
      const decay = Math.exp(-5 * dt);
      const vxPrev = e.vx;
      const vyPrev = e.vy;
      e.vx *= decay;
      e.vy *= decay;
      e.x += (vxPrev + e.vx) * (dt / 2);
      e.y += (vyPrev + e.vy) * (dt / 2);
      e.iNodeGoal = null;
    } else {
      this._wander(e, this._RANGER_SPEED, dt);
    }
    this._updateTurret(e, ship, dt);
  }
  /**
   * @param {Enemy} e 
   * @param {number} speed
   * @param {number} dt 
   * @returns {void}
   */
  _wander(e, speed, dt) {
    const iNodeFrom = this.planet.nearestRadialNodeInAir(e.x, e.y);
    if (e.iNodeGoal === null || iNodeFrom === e.iNodeGoal) {
      e.iNodeGoal = this._iNodeWanderDirection(iNodeFrom, e.x, e.y, e.vx, e.vy);
    }
    const nodeGoal = this.planet.radialGraph.nodes[e.iNodeGoal];
    let dx = nodeGoal.x - e.x;
    let dy = nodeGoal.y - e.y;
    const dist = Math.hypot(dx, dy);
    const maxMoveDist = speed * dt;
    if (dist > maxMoveDist) {
      const scale = maxMoveDist / dist;
      dx *= scale;
      dy *= scale;
    }
    e.x += dx;
    e.y += dy;
    e.vx = dx / dt;
    e.vy = dy / dt;
  }
  /**
   * @param {number} iNodeFrom
   * @param {number} x
   * @param {number} y
   * @param {number} vx
   * @param {number} vy
   * @returns {number}
   */
  _iNodeWanderDirection(iNodeFrom, x, y, vx, vy) {
    const radialGraph = this.planet.radialGraph;
    const iNodeCandidates = [];
    for (const n of radialGraph.neighbors[iNodeFrom]) {
      const iNode = n.to;
      if (this.planet.airNodesBitmap[iNode] === 0) continue;
      const node = radialGraph.nodes[iNode];
      const dx = node.x - x;
      const dy = node.y - y;
      const dot = dx * vx + dy * vy;
      if (dot <= 0) continue;
      iNodeCandidates.push(iNode);
    }
    if (iNodeCandidates.length === 0) {
      for (const n of radialGraph.neighbors[iNodeFrom]) {
        const iNode = n.to;
        if (this.planet.airNodesBitmap[iNode] === 0) continue;
        iNodeCandidates.push(iNode);
      }
    }
    if (iNodeCandidates.length === 0) {
      return iNodeFrom;
    }
    return iNodeCandidates[Math.floor(Math.random() * iNodeCandidates.length)];
  }
  /**
   * @param {Enemy} e 
   * @param {Ship|null} ship 
   * @param {number} dt 
   * @returns {boolean} keep alive?
   */
  _updateCrawler(e, ship, dt) {
    this._moveCrawler(e, ship, dt);
    if (!ship) return;
    const dx = ship.x - e.x;
    const dy = ship.y - e.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= this._DETONATE_RANGE) {
      this.explosions.push({ x: e.x, y: e.y, life: 0.5, owner: "crawler", radius: 1.1 });
      return false;
    }
    return true;
  }
  /**
   * @param {Enemy} e
   * @param {Ship|null} ship
   * @param {number} dt 
   */
  _moveCrawler(e, ship, dt) {
    this._approachPlayer(e, ship);
    this._reflectVelocityBackTowardPlanet(e);
    this._reflectVelocityAwayFromTerrain(e);
    e.x += e.vx * dt;
    e.y += e.vy * dt;
  }
  /**
   * @param {Enemy} e 
   * @param {Ship|null} ship 
   * @returns {void}
   */
  _approachPlayer(e, ship) {
    if (!ship) return;
    const dx = ship.x - e.x;
    const dy = ship.y - e.y;
    const dist = Math.hypot(dx, dy);
    if (dist >= this._APPROACH_RANGE) return;
    if (dist < 1e-4) return;
    const s = Math.hypot(e.vx, e.vy) / dist;
    e.vx = dx * s;
    e.vy = dy * s;
  }
  /**
   * @param {Enemy} e 
   * @returns {void}
   */
  _reflectVelocityBackTowardPlanet(e) {
    const rMax = this.planet.planetRadius + 1;
    const rEnemy = Math.hypot(e.x, e.y);
    if (rEnemy < rMax) return;
    const nx = e.x / rEnemy;
    const ny = e.y / rEnemy;
    const vNormal = e.vx * nx + e.vy * ny;
    if (vNormal <= 0) return;
    const impulse = -2 * vNormal;
    e.vx += impulse * nx;
    e.vy += impulse * ny;
  }
  /**
   * 
   * @param {Enemy} e 
   * @returns {void}
   */
  _reflectVelocityAwayFromTerrain(e) {
    const planet = this.planet;
    const distAboveGround = planet.airValueAtWorld(e.x, e.y) - 0.75;
    if (distAboveGround > 0) return;
    const eps = 0.18;
    const gdx = planet.airValueAtWorld(e.x + eps, e.y) - planet.airValueAtWorld(e.x - eps, e.y);
    const gdy = planet.airValueAtWorld(e.x, e.y + eps) - planet.airValueAtWorld(e.x, e.y - eps);
    let nx = gdx;
    let ny = gdy;
    let nlen = Math.hypot(nx, ny);
    if (nlen < 1e-4) return;
    nx /= nlen;
    ny /= nlen;
    const vNormal = nx * e.vx + ny * e.vy;
    if (vNormal >= 0) return;
    const impulse = -2 * vNormal;
    e.vx += impulse * nx;
    e.vy += impulse * ny;
  }
  /**
   * @param {Enemy} e 
   * @param {Ship} ship 
   * @param {number} dt
   * @returns {void}
   */
  _updateTurret(e, ship, dt) {
    if (!ship) return;
    e.cooldown = Math.max(0, e.cooldown - dt);
    const dx = ship.x - e.x;
    const dy = ship.y - e.y;
    const distSqrMax = this._TURRET_MAX_RANGE * this._TURRET_MAX_RANGE;
    if (dx * dx + dy * dy > distSqrMax) {
      e.cooldown = Math.max(e.cooldown, 0.5);
      return;
    }
    const dvx = ship.vx - e.vx;
    const dvy = ship.vy - e.vy;
    const dtHit = dTImpact(dx, dy, dvx, dvy, this._TURRET_SHOT_SPEED);
    const dxAim = dx + dvx * dtHit;
    const dyAim = dy + dvy * dtHit;
    if (!lineOfSightAir(this.collision, e.x, e.y, ship.x, ship.y, this._LOS_STEP)) {
      e.cooldown = Math.max(e.cooldown, 1.5);
      return;
    }
    if (e.cooldown > 0) return;
    e.cooldown = 1;
    this._shoot(e, this._TURRET_SHOT_SPEED, dxAim, dyAim);
  }
  /**
   * @param {Enemy} e 
   * @param {Ship} ship 
   * @returns {void}
   */
  _updateOrbitingTurret(e, ship, dt) {
    const { x: gx, y: gy } = this.planet.gravityAt(e.x, e.y);
    e.x += (e.vx + 0.5 * gx * dt) * dt;
    e.y += (e.vy + 0.5 * gy * dt) * dt;
    const { x: gx2, y: gy2 } = this.planet.gravityAt(e.x, e.y);
    e.vx += (gx + gx2) / 2 * dt;
    e.vy += (gy + gy2) / 2 * dt;
    this._updateTurret(e, ship, dt);
  }
  /**
   * Shoot a bullet in the specified direction
   * @param {Enemy} e
   * @param {number} shotSpeed
   * @param {number} dx
   * @param {number} dy
   * @returns {void}
   */
  _shoot(e, shotSpeed, dx, dy) {
    const vScale = shotSpeed / (Math.hypot(dx, dy) || 1);
    this.shots.push({
      x: e.x,
      y: e.y,
      vx: e.vx + dx * vScale,
      vy: e.vy + dy * vScale,
      life: this._SHOT_LIFE,
      owner: e.type
    });
    if (this.onEnemyShot) {
      this.onEnemyShot(e);
    }
  }
}
function dTImpact(x, y, vx, vy, s) {
  const a = s * s - vx * vx - vy * vy;
  const b = x * vx + y * vy;
  const c = x * x + y * y;
  const d = b * b + a * c;
  if (d < 0) return 0;
  const t = Math.max(0, (b + Math.sqrt(d)) / a);
  return t;
}
const SQRT3_OVER_2 = Math.sqrt(3) / 2;
const SHIPMAP = [
  "#######XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX#",
  "##XXXXXXXX0000000000000000000000000000000XX",
  "#XX0XXXXX00000000000000000000000000000000XX",
  "XXXXXXXXX00000000000000000000000000000000XX",
  "XXXXXXXXXX0000000000000000000000000000000XX",
  "###XXXXXXXX000000000000000000000000000000XX",
  "##########XXXXXXXXXXXXXXXXXXXX00000000000XX"
];
function triangleVerticesForCell(col, parityCol, row, s) {
  const h = s * SQRT3_OVER_2;
  const x0 = col * (s / 2);
  const y0 = row * h;
  const up = (parityCol + row & 1) === 1;
  if (up) {
    return [
      { x: x0, y: y0 + h },
      { x: x0 + s / 2, y: y0 },
      { x: x0 + s, y: y0 + h }
    ];
  }
  return [
    { x: x0, y: y0 },
    { x: x0 + s, y: y0 },
    { x: x0 + s / 2, y: y0 + h }
  ];
}
class Mothership {
  /**
   * @param {{RMAX:number, MOTHERSHIP_ORBIT_HEIGHT:number}} cfg
   * @param {import("./planet.js").Planet} planet
   * @param {string[]} [shipMap]
   */
  constructor(cfg, planet, shipMap) {
    const map = shipMap && shipMap.length ? shipMap : SHIPMAP;
    const rows = map.length;
    const cols = Math.max(0, ...map.map((row) => row.length));
    const spacing = 0.8;
    this.scale = 0.5;
    const points = [];
    const tris = [];
    const triAir = [];
    const vertAirSum = [];
    const vertAirCount = [];
    const vertIndex = /* @__PURE__ */ new Map();
    const keyOf = (x, y) => `${x.toFixed(5)},${y.toFixed(5)}`;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const rowMask = map[row];
        const colMask = rowMask ? rowMask.length - 1 - col : -1;
        const ch = rowMask && colMask >= 0 && colMask < rowMask.length ? rowMask[colMask] : "O";
        if (ch === "#" || ch === " ") continue;
        const air = ch === "X" || ch === "x" ? 0 : 1;
        const parityCol = colMask >= 0 ? colMask : col;
        const verts = triangleVerticesForCell(col, parityCol, row, spacing * this.scale);
        const triIdx = [];
        for (const v of verts) {
          const key = keyOf(v.x, v.y);
          let idx = vertIndex.get(key);
          if (idx == null) {
            idx = points.length;
            points.push({ x: v.x, y: v.y, air: 1 });
            vertAirSum.push(0);
            vertAirCount.push(0);
            vertIndex.set(key, idx);
          }
          vertAirSum[idx] += air;
          vertAirCount[idx] += 1;
          triIdx.push(idx);
        }
        tris.push([triIdx[0], triIdx[1], triIdx[2]]);
        triAir.push(air);
      }
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of points) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    const cx = (minX + maxX) * 0.5;
    const cy = (minY + maxY) * 0.5;
    let maxR2 = 0;
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      p.x -= cx;
      p.y -= cy;
      const count = vertAirCount[i] || 1;
      p.air = vertAirSum[i] / count;
      const r2 = p.x * p.x + p.y * p.y;
      if (r2 > maxR2) maxR2 = r2;
    }
    const orbitRadius = cfg.RMAX + 15;
    const mu = planet.gravitationalConstant;
    const speed = Math.sqrt(mu / orbitRadius);
    this.x = orbitRadius;
    this.y = 0;
    this.vx = 0;
    this.vy = speed;
    this.angle = Math.PI / 2;
    this.spacing = spacing * this.scale;
    this.bounds = Math.sqrt(maxR2) + spacing * this.scale;
    this.rows = rows;
    this.cols = cols;
    this.points = points;
    this.tris = tris;
    this.triAir = triAir;
    this.renderPoints = points;
    this.renderTris = tris;
    this._buildAirGrid();
  }
  _buildAirGrid() {
    const cell = Math.max(this.spacing * 0.25, 0.05);
    const size = Math.max(8, Math.ceil(this.bounds * 2 / cell) + 1);
    const half = (size - 1) * cell * 0.5;
    const grid = new Float32Array(size * size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const lx = x * cell - half;
        const ly = y * cell - half;
        const v = mothershipAirAtLocal(this, lx, ly);
        grid[y * size + x] = v === null ? 1 : v;
      }
    }
    this.gridCell = cell;
    this.gridSize = size;
    this.gridHalf = half;
    this.gridAir = grid;
  }
}
function updateMothership(mothership, planet, dt) {
  const { x: gx, y: gy } = planet.gravityAt(mothership.x, mothership.y);
  mothership.x += (mothership.vx + 0.5 * gx * dt) * dt;
  mothership.y += (mothership.vy + 0.5 * gy * dt) * dt;
  const { x: gx2, y: gy2 } = planet.gravityAt(mothership.x, mothership.y);
  mothership.vx += 0.5 * (gx + gx2) * dt;
  mothership.vy += 0.5 * (gy + gy2) * dt;
  mothership.angle = Math.atan2(mothership.vy, mothership.vx || 1e-6);
}
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
function mothershipAirAtLocal(mothership, lx, ly) {
  const points = mothership.points;
  const tris = mothership.tris;
  for (let i = 0; i < tris.length; i++) {
    const tri = tris[i];
    const a = points[tri[0]];
    const b = points[tri[1]];
    const c = points[tri[2]];
    if (!pointInTri(lx, ly, a.x, a.y, b.x, b.y, c.x, c.y)) continue;
    return mothership.triAir ? mothership.triAir[i] : 1;
  }
  return null;
}
function mothershipAirAtWorld(mothership, x, y) {
  const dx = x - mothership.x;
  const dy = y - mothership.y;
  if (dx * dx + dy * dy > mothership.bounds * mothership.bounds) return null;
  const c = Math.cos(-mothership.angle);
  const s = Math.sin(-mothership.angle);
  const lx = c * dx - s * dy;
  const ly = s * dx + c * dy;
  return mothershipAirAtLocalGrid(mothership, lx, ly);
}
function mothershipCollisionInfo(mothership, x, y) {
  const dx = x - mothership.x;
  const dy = y - mothership.y;
  if (dx * dx + dy * dy > mothership.bounds * mothership.bounds) return null;
  const c = Math.cos(-mothership.angle);
  const s = Math.sin(-mothership.angle);
  const lx = c * dx - s * dy;
  const ly = s * dx + c * dy;
  const eps = mothership.gridCell || mothership.spacing * 0.4;
  let nx = mothershipAirAtLocalGrid(mothership, lx + eps, ly) - mothershipAirAtLocalGrid(mothership, lx - eps, ly);
  let ny = mothershipAirAtLocalGrid(mothership, lx, ly + eps) - mothershipAirAtLocalGrid(mothership, lx, ly - eps);
  let nlen = Math.hypot(nx, ny);
  if (nlen < 1e-4) {
    return null;
  }
  nx /= nlen;
  ny /= nlen;
  const c2 = Math.cos(mothership.angle);
  const s2 = Math.sin(mothership.angle);
  const nxw = c2 * nx - s2 * ny;
  const nyw = s2 * nx + c2 * ny;
  return { nx: nxw, ny: nyw, isFloor: false };
}
function mothershipAirAtLocalGrid(mothership, lx, ly) {
  const size = mothership.gridSize || 0;
  const cell = mothership.gridCell || 0;
  const half = mothership.gridHalf || 0;
  const grid = mothership.gridAir;
  if (!grid || size <= 1 || cell <= 0) {
    const v = mothershipAirAtLocal(mothership, lx, ly);
    return v === null ? 1 : v;
  }
  const fx = (lx + half) / cell;
  const fy = (ly + half) / cell;
  const ix = Math.floor(fx);
  const iy = Math.floor(fy);
  if (ix < 0 || iy < 0 || ix >= size - 1 || iy >= size - 1) return 1;
  const tx = fx - ix;
  const ty = fy - iy;
  const idx = iy * size + ix;
  const v00 = grid[idx];
  const v10 = grid[idx + 1];
  const v01 = grid[idx + size];
  const v11 = grid[idx + size + 1];
  const vx0 = v00 + (v10 - v00) * tx;
  const vx1 = v01 + (v11 - v01) * tx;
  return vx0 + (vx1 - vx0) * ty;
}
function createCollisionRouter(planet, getMothership) {
  function planetAirValueAtWorld(x, y) {
    if (typeof planet.airValueAtWorldForCollision === "function") {
      return planet.airValueAtWorldForCollision(x, y);
    }
    return planet.airValueAtWorld(x, y);
  }
  function sampleAtWorld(x, y) {
    const mothership = getMothership();
    if (mothership) {
      const r2 = Math.hypot(x, y);
      const dPlanet = Math.abs(r2 - planet.planetRadius);
      const dx = x - mothership.x;
      const dy = y - mothership.y;
      const dM = Math.max(0, Math.hypot(dx, dy) - mothership.bounds);
      if (dM < dPlanet) {
        const v = mothershipAirAtWorld(mothership, x, y);
        if (v !== null) return { air: v, source: "mothership" };
      }
    }
    const air = planetAirValueAtWorld(x, y);
    return { air, source: "planet" };
  }
  function sampleCollisionPoints(points) {
    const samples = [];
    let hit = null;
    let hitSource = null;
    for (const [x, y] of points) {
      const sample = sampleAtWorld(x, y);
      const av = sample.air;
      const air = av > 0.5;
      samples.push([x, y, air, av]);
      if (!air && !hit) {
        hit = { x, y };
        hitSource = sample.source;
      }
    }
    return { samples, hit, hitSource };
  }
  return {
    airValueAtWorld: (x, y) => sampleAtWorld(x, y).air,
    planetAirValueAtWorld: (x, y) => planetAirValueAtWorld(x, y),
    gravityAt: (x, y) => planet.gravityAt(x, y),
    sampleAtWorld,
    collidesAtPoints: (points) => {
      for (const [x, y] of points) {
        if (sampleAtWorld(x, y).air <= 0.5) return true;
      }
      return false;
    },
    sampleCollisionPoints
  };
}
class RingMesh {
  /**
   * Build mesh geometry and sampling helpers from a map source.
   * @param {import("./mapgen.js").MapGen} map Map generator.
   * @param {import("./planet_config.js").PlanetParams} params
   */
  constructor(map, params) {
    this._params = params;
    this._map = map;
    this._OUTER_PAD = 0;
    this._R_MESH = Math.max(0, Math.floor(params.RMAX)) + 1;
    function ringCount(r2) {
      if (r2 <= 0) return 1;
      return Math.max(CFG.N_MIN, Math.floor(2 * Math.PI * r2));
    }
    function ringVertices(r2) {
      if (r2 === 0) return [{ x: 0, y: 0, air: 1 }];
      const n = ringCount(r2);
      const phase = 0.5 / n * 2 * Math.PI;
      const out = [];
      for (let k = 0; k < n; k++) {
        const a = 2 * Math.PI * k / n + phase;
        let rr = r2;
        out.push({ x: rr * Math.cos(a), y: rr * Math.sin(a), air: 1 });
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
    const triCentroids = [];
    const triList = [];
    const airFlag = [];
    const shade = [];
    const vertRefs = [];
    const rings = [];
    const bandTris = [];
    const rMaxInt = Math.max(0, Math.floor(params.RMAX));
    for (let r2 = 0; r2 <= rMaxInt; r2++) rings.push(ringVertices(r2));
    this._R_MESH = rings.length - 1;
    this.rings = rings;
    for (let r2 = 0; r2 < rings.length; r2++) {
      const ring = rings[r2];
      const isOuterRing = r2 === rings.length - 1;
      for (const v of ring) {
        v.air = isOuterRing ? 1 : this._sampleAirAtWorldExtended(v.x, v.y);
      }
    }
    this._applyMoltenOverrides();
    this._cleanupOuterRimSpikeArtifacts();
    for (let r2 = 0; r2 < this._R_MESH; r2++) {
      const inner = rings[r2];
      const outer = rings[r2 + 1];
      if (!inner || !outer) continue;
      if (r2 === 0) {
        const tris = [];
        const center = inner && inner.length ? inner[0] : { x: 0, y: 0, air: this._sampleAirAtWorldExtended(0, 0) };
        for (let k = 0; k < outer.length; k++) {
          const a = center;
          const b = outer[k];
          const c = outer[(k + 1) % outer.length];
          tris.push([a, b, c]);
          triCentroids.push((a.x + b.x + c.x) / 3, (a.y + b.y + c.y) / 3);
          triList.push([a, b, c]);
          for (const v of [a, b, c]) {
            positions.push(v.x, v.y);
            airFlag.push(v.air);
            vertRefs.push(v);
            shade.push(shadeAt(v.x, v.y));
          }
        }
        bandTris[r2] = tris;
      } else {
        const tris = stitchBand(inner, outer);
        bandTris[r2] = tris;
        for (const tri of tris) {
          triCentroids.push((tri[0].x + tri[1].x + tri[2].x) / 3, (tri[0].y + tri[1].y + tri[2].y) / 3);
          triList.push(tri);
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
    this.triCount = triCentroids.length / 2;
    this.positions = new Float32Array(positions);
    this.airFlag = new Float32Array(airFlag);
    this.shade = new Float32Array(shade);
    this.rings = rings;
    this.bandTris = bandTris;
    this._vertRefs = vertRefs;
    this._triCentroids = new Float32Array(triCentroids);
    this._triList = triList;
    this._fogCursor = 0;
    this._fogRange = params.VIS_RANGE;
    this._fogStep = GAME.VIS_STEP;
    this._fogSeenAlpha = params.FOG_SEEN_ALPHA;
    this._fogUnseenAlpha = params.FOG_UNSEEN_ALPHA;
    this._fogHoldFrames = GAME.FOG_HOLD_FRAMES;
    this._fogLosThresh = GAME.FOG_LOS_THRESH ?? 0.45;
    this._fogAlphaLerp = GAME.FOG_ALPHA_LERP ?? 0.2;
    this._fogBudgetTris = params.FOG_BUDGET_TRIS ?? 200;
    const total = this.triCount;
    this._fogAlpha = new Float32Array(total * 3);
    this._fogVisible = new Uint8Array(total);
    this._fogSeen = new Uint8Array(total);
    this._fogHold = new Uint8Array(total);
    const triIndexOf = /* @__PURE__ */ new Map();
    let idx = 0;
    for (const band of this.bandTris) {
      if (!band) continue;
      for (const tri of band) {
        triIndexOf.set(tri, idx);
        idx++;
      }
    }
    this._triIndexOf = triIndexOf;
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
    const r2 = Math.hypot(x, y);
    const coreR = this._params.CORE_RADIUS > 1 ? this._params.CORE_RADIUS : this._params.CORE_RADIUS * this._params.RMAX;
    if (coreR > 0 && r2 <= coreR) return 0;
    if (r2 > this._params.RMAX) return 1;
    return this._map.airBinaryAtWorld(x, y);
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {Array<{x:number,y:number,air:number}>|null}
   */
  findTriAtWorld(x, y) {
    const r2 = Math.hypot(x, y);
    if (r2 <= 0) return null;
    const r0 = Math.floor(Math.min(this._R_MESH - 1, Math.max(0, r2)));
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
    const r2 = Math.hypot(x, y);
    const ri = Math.max(0, Math.min(this.rings.length - 1, Math.round(r2)));
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
    const r2 = Math.hypot(x, y);
    if (r2 > this._params.RMAX + this._OUTER_PAD) return 1;
    const rOuter = this.rings ? this.rings.length - 1 : this._params.RMAX;
    if (r2 > rOuter - 0.5) return 1;
    return this._airValueAtWorldNoOuterClamp(x, y);
  }
  /**
   * Air sampling variant for guide-path construction near the outer ring.
   * Keeps collision sampling unchanged while allowing surface gradients in the outer band.
   * @param {number} x
   * @param {number} y
   * @returns {number}
   */
  airValueAtWorldForPath(x, y) {
    const r2 = Math.hypot(x, y);
    if (r2 > this._params.RMAX + this._OUTER_PAD) return 1;
    return this._airValueAtWorldNoOuterClamp(x, y);
  }
  /**
   * Collision-focused air sampling.
   * Uses the same terrain field as rendering so visible terrain remains collidable.
   * @param {number} x
   * @param {number} y
   * @returns {number}
   */
  airValueAtWorldForCollision(x, y) {
    return this.airValueAtWorld(x, y);
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {Array<{x:number,y:number,air:number}>} tri
   * @returns {number}
   */
  _airValueInTri(x, y, tri) {
    const a = tri[0], b = tri[1], c = tri[2];
    const det = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
    if (Math.abs(det) < 1e-6) {
      const n = this.nearestNodeOnRing(x, y);
      return n ? n.air : 1;
    }
    const l1 = ((b.y - c.y) * (x - c.x) + (c.x - b.x) * (y - c.y)) / det;
    const l2 = ((c.y - a.y) * (x - c.x) + (a.x - c.x) * (y - c.y)) / det;
    const l3 = 1 - l1 - l2;
    return a.air * l1 + b.air * l2 + c.air * l3;
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {number}
   */
  _airValueAtWorldNoOuterClamp(x, y) {
    const r0 = Math.floor(Math.min(this._R_MESH - 1, Math.max(0, Math.hypot(x, y))));
    if (r0 <= 0) {
      return this.rings[0][0].air;
    }
    const tri = this.findTriAtWorld(x, y);
    if (!tri) {
      const n = this.nearestNodeOnRing(x, y);
      return n ? n.air : 1;
    }
    return this._airValueInTri(x, y, tri);
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
    this._applyMoltenOverrides();
    this._cleanupOuterRimSpikeArtifacts();
    for (let i = 0; i < this.vertCount; i++) {
      this.airFlag[i] = this._vertRefs[i].air;
    }
    return new Float32Array(this.airFlag);
  }
  /**
   * Override radial air flags for molten band/core to avoid grid aliasing.
   * @returns {void}
   */
  _applyMoltenOverrides() {
    const params = this._params;
    const moltenInner = typeof params.MOLTEN_RING_INNER === "number" ? Math.max(0, params.MOLTEN_RING_INNER) : 0;
    const moltenOuter = typeof params.MOLTEN_RING_OUTER === "number" ? params.MOLTEN_RING_OUTER : 0;
    if (!(moltenOuter > moltenInner)) return;
    for (let r2 = 0; r2 < this.rings.length; r2++) {
      const ring = this.rings[r2];
      if (!ring) continue;
      const inBand = r2 >= moltenInner && r2 <= moltenOuter;
      const inCore = moltenInner > 0 && r2 <= moltenInner;
      if (!inBand && !inCore) continue;
      for (const v of ring) {
        if (inBand) v.air = 1;
        if (inCore) v.air = 0;
      }
    }
  }
  /**
   * Remove isolated rock spikes in the penultimate ring that have no inward support.
   * This trims likely outer-rim raster artifacts while preserving actual thin terrain.
   * @returns {void}
   */
  _cleanupOuterRimSpikeArtifacts() {
    const outer = this.rings.length - 1;
    if (outer < 2) return;
    const rim = this.rings[outer - 1];
    const inner = this.rings[outer - 2];
    if (!rim || !inner || rim.length < 3 || inner.length < 3) return;
    const clear = [];
    for (let i = 0; i < rim.length; i++) {
      const v = rim[i];
      if (v.air > 0.5) continue;
      const prev = rim[(i + rim.length - 1) % rim.length];
      const next = rim[(i + 1) % rim.length];
      if (prev.air <= 0.5 || next.air <= 0.5) continue;
      const len = Math.hypot(v.x, v.y) || 1;
      const ux = v.x / len;
      const uy = v.y / len;
      let best = 0;
      let bestDot = -2;
      for (let j = 0; j < inner.length; j++) {
        const iv = inner[j];
        const ilen = Math.hypot(iv.x, iv.y) || 1;
        const dot = iv.x / ilen * ux + iv.y / ilen * uy;
        if (dot > bestDot) {
          bestDot = dot;
          best = j;
        }
      }
      const jl = (best + inner.length - 1) % inner.length;
      const jr = (best + 1) % inner.length;
      const hasSupport = inner[best].air <= 0.5 || inner[jl].air <= 0.5 || inner[jr].air <= 0.5;
      if (!hasSupport) {
        clear.push(i);
      }
    }
    for (const i of clear) {
      rim[i].air = 1;
    }
  }
  /**
   * @param {number} ax
   * @param {number} ay
   * @param {number} bx
   * @param {number} by
   * @param {number} step
   * @returns {boolean}
   */
  _lineOfSightMesh(ax, ay, bx, by, step) {
    const dx = bx - ax;
    const dy = by - ay;
    const dist = Math.hypot(dx, dy);
    if (dist <= 1e-6) return true;
    const steps = Math.max(1, Math.ceil(dist / step));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const x = ax + dx * t;
      const y = ay + dy * t;
      if (this.airValueAtWorld(x, y) <= this._fogLosThresh) return false;
    }
    return true;
  }
  /**
   * @param {number} ax
   * @param {number} ay
   * @param {number} bx
   * @param {number} by
   * @returns {boolean}
   */
  lineOfSight(ax, ay, bx, by) {
    return this._lineOfSightMesh(ax, ay, bx, by, this._fogStep);
  }
  /**
   * Update fog visibility for mesh triangles.
   * @param {number} shipX
   * @param {number} shipY
   * @returns {void}
   */
  updateFog(shipX, shipY) {
    if (this._fogCursor === 0) {
      this._fogVisible.fill(0);
    }
    const r2 = this._fogRange * this._fogRange;
    const c = this._triCentroids;
    const count = this._fogVisible.length;
    const pointVisible = (px, py) => {
      const dx = px - shipX;
      const dy = py - shipY;
      if (dx * dx + dy * dy > r2) return false;
      return this._lineOfSightMesh(shipX, shipY, px, py, this._fogStep);
    };
    const budget = Math.max(1, this._fogBudgetTris | 0);
    const start = this._fogCursor;
    const end = Math.min(count, start + budget);
    const lerp = this._fogAlphaLerp;
    for (let idx = start; idx < end; idx++) {
      const tri = this._triList[idx];
      const cx = c[idx * 2];
      const cy = c[idx * 2 + 1];
      const m01x = (tri[0].x + tri[1].x) * 0.5;
      const m01y = (tri[0].y + tri[1].y) * 0.5;
      const m12x = (tri[1].x + tri[2].x) * 0.5;
      const m12y = (tri[1].y + tri[2].y) * 0.5;
      const m20x = (tri[2].x + tri[0].x) * 0.5;
      const m20y = (tri[2].y + tri[0].y) * 0.5;
      const visibleNow = pointVisible(cx, cy) || pointVisible(tri[0].x, tri[0].y) || pointVisible(tri[1].x, tri[1].y) || pointVisible(tri[2].x, tri[2].y) || pointVisible(m01x, m01y) || pointVisible(m12x, m12y) || pointVisible(m20x, m20y);
      if (visibleNow) {
        this._fogHold[idx] = this._fogHoldFrames;
      } else if (this._fogHold[idx] > 0) {
        this._fogHold[idx]--;
      }
      if (this._fogHold[idx] > 0) {
        this._fogVisible[idx] = 1;
        this._fogSeen[idx] = 1;
      }
      const base = idx * 3;
      if (this._fogVisible[idx]) {
        this._fogAlpha[base] = 0;
        this._fogAlpha[base + 1] = 0;
        this._fogAlpha[base + 2] = 0;
      } else {
        const target = this._fogSeen[idx] ? this._fogSeenAlpha : this._fogUnseenAlpha;
        const a0 = this._fogAlpha[base];
        const next = a0 + (target - a0) * lerp;
        this._fogAlpha[base] = next;
        this._fogAlpha[base + 1] = next;
        this._fogAlpha[base + 2] = next;
      }
    }
    this._fogCursor = end >= count ? 0 : end;
  }
  /**
   * @returns {Float32Array|undefined}
   */
  fogAlpha() {
    if (!this._fogAlpha) return void 0;
    return this._fogAlpha;
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  fogVisibleAt(x, y) {
    if (!this._fogVisible || !this._triIndexOf) return true;
    const tri = this.findTriAtWorld(x, y);
    if (!tri) return true;
    const idx = this._triIndexOf.get(tri);
    if (idx === void 0) return true;
    return !!this._fogVisible[idx];
  }
  /**
   * Sample fog alpha at world position (barycentric).
   * @param {number} x
   * @param {number} y
   * @returns {number}
   */
  fogAlphaAtWorld(x, y) {
    if (!this._fogAlpha) return 0;
    const tri = this.findTriAtWorld(x, y);
    if (!tri) return 0;
    const idx = this._triIndexOf ? this._triIndexOf.get(tri) : void 0;
    if (idx === void 0) return 0;
    const a = tri[0], b = tri[1], c = tri[2];
    const det = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
    if (Math.abs(det) < 1e-6) return this._fogAlpha[idx * 3];
    const l1 = ((b.y - c.y) * (x - c.x) + (c.x - b.x) * (y - c.y)) / det;
    const l2 = ((c.y - a.y) * (x - c.x) + (a.x - c.x) * (y - c.y)) / det;
    const l3 = 1 - l1 - l2;
    const base = idx * 3;
    return this._fogAlpha[base] * l1 + this._fogAlpha[base + 1] * l2 + this._fogAlpha[base + 2] * l3;
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  fogSeenAt(x, y) {
    if (!this._fogSeen || !this._triIndexOf) return true;
    const tri = this.findTriAtWorld(x, y);
    if (!tri) return true;
    const idx = this._triIndexOf.get(tri);
    if (idx === void 0) return true;
    return !!this._fogSeen[idx];
  }
  /**
   * @returns {{
   *  alpha:Float32Array,
   *  visible:Uint8Array,
   *  seen:Uint8Array,
   *  hold:Uint8Array,
   *  cursor:number
   * }}
   */
  exportFogState() {
    return {
      alpha: new Float32Array(this._fogAlpha),
      visible: new Uint8Array(this._fogVisible),
      seen: new Uint8Array(this._fogSeen),
      hold: new Uint8Array(this._fogHold),
      cursor: this._fogCursor | 0
    };
  }
  /**
   * @param {{
   *  alpha:Float32Array,
   *  visible:Uint8Array,
   *  seen:Uint8Array,
   *  hold:Uint8Array,
   *  cursor:number
   * }|null|undefined} state
   * @returns {boolean}
   */
  importFogState(state) {
    if (!state) return false;
    if (!(state.alpha instanceof Float32Array)) return false;
    if (!(state.visible instanceof Uint8Array)) return false;
    if (!(state.seen instanceof Uint8Array)) return false;
    if (!(state.hold instanceof Uint8Array)) return false;
    if (state.alpha.length !== this._fogAlpha.length) return false;
    if (state.visible.length !== this._fogVisible.length) return false;
    if (state.seen.length !== this._fogSeen.length) return false;
    if (state.hold.length !== this._fogHold.length) return false;
    this._fogAlpha.set(state.alpha);
    this._fogVisible.set(state.visible);
    this._fogSeen.set(state.seen);
    this._fogHold.set(state.hold);
    const count = this._fogVisible.length;
    const nextCursor = Math.max(0, Math.min(count, state.cursor | 0));
    this._fogCursor = nextCursor >= count ? 0 : nextCursor;
    return true;
  }
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
  const r2 = mulberry32$1(seed);
  for (let i = 255; i > 0; i--) {
    const j = r2() * (i + 1) | 0;
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
      let r2 = 1 - Math.abs(n);
      r2 *= r2;
      total += amp * r2;
      norm += amp;
      amp *= pers;
      freq *= lac;
    }
    return norm ? total / norm : 0;
  }
}
class MapGen {
  /**
   * Create a map generator.
   * @param {number} seed
   * @param {import("./planet_config.js").PlanetParams} params
   */
  constructor(seed, params) {
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
    this.regenWorld(seed);
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
    const coreR = this.params.CORE_RADIUS > 1 ? this.params.CORE_RADIUS : this.params.CORE_RADIUS * this.params.RMAX;
    const coreR2 = coreR * coreR;
    const [ix0, iy0] = toGrid(cx - radius, cy - radius);
    const [ix1, iy1] = toGrid(cx + radius, cy + radius);
    const x0 = Math.max(0, ix0), y0 = Math.max(0, iy0);
    const x1 = Math.min(G - 1, ix1), y1 = Math.min(G - 1, iy1);
    for (let j = y0; j <= y1; j++) for (let i = x0; i <= x1; i++) {
      const k = idx(i, j);
      if (!inside[k]) continue;
      const [x, y] = toWorld(i, j);
      if (coreR > 0 && x * x + y * y <= coreR2) continue;
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
        const v = this._caveNoise[k] > mid ? 1 : 0;
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
      const r2 = Math.hypot(x, y) / p.RMAX;
      let mid = 1 - Math.abs(r2 - 0.6) / 0.6;
      mid = Math.max(0, Math.min(1, mid));
      if (this._veinNoise[k] > p.VEIN_THRESH && mid > CFG.VEIN_MID_MIN) veins[k] = 1;
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
    const rand = mulberry32$1(seed);
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
      const xw = x + p.WARP_A * this._wx[k];
      const yw = y + p.WARP_A * this._wy[k];
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
      const r2 = rMin + (rMax - rMin) * Math.min(1, Math.max(0, t + jitter));
      centers.push(r2);
    }
    const half = thickness * 0.5;
    for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
      const k = idx(i, j);
      if (!inside[k]) continue;
      const [x, y] = toWorld(i, j);
      const r2 = Math.hypot(x, y);
      for (const c of centers) {
        if (Math.abs(r2 - c) <= half) {
          air[k] = 1;
          break;
        }
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
    const { G, idx, inside, toWorld } = this.grid;
    const rMax = this.params.RMAX;
    const maxDepth = Math.max(0.05, depth);
    const ampClamped = Math.max(0, Math.min(maxDepth * 0.95, amp || 0));
    const meanDepth = Math.max(0, Math.min(maxDepth, maxDepth * 0.42));
    const waveFreq = Math.max(0.2, freq || 1.2);
    const waveOctaves = Math.max(1, Math.round(octaves || 3));
    for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
      const k = idx(i, j);
      if (!inside[k]) continue;
      const [x, y] = toWorld(i, j);
      const r2 = Math.hypot(x, y);
      if (r2 > rMax) continue;
      const len = Math.max(1e-6, r2);
      const ux = x / len;
      const uy = y / len;
      const profile = this.noise.fbm(ux * waveFreq, uy * waveFreq, waveOctaves, 0.55, 2);
      const detail = this.noise.fbm((ux + 13.7) * waveFreq * 2.1, (uy - 7.1) * waveFreq * 2.1, 2, 0.55, 2);
      const shape = Math.max(-1, Math.min(1, profile * 0.8 + detail * 0.2));
      const cutDepth = Math.max(0, Math.min(maxDepth, meanDepth + shape * ampClamped));
      const surfaceR = rMax - cutDepth;
      if (r2 >= surfaceR) {
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
function isFarFromReservations(x, y, minDist, reservations) {
  if (minDist <= 0 || !reservations.length) return true;
  for (const rsv of reservations) {
    const dx = x - rsv.x;
    const dy = y - rsv.y;
    const rr = minDist + (rsv.r || 0);
    if (dx * dx + dy * dy < rr * rr) return false;
  }
  return true;
}
function placeMoltenVents(planet, props) {
  const cfg = planet.getPlanetConfig ? planet.getPlanetConfig() : null;
  if (!cfg || cfg.id !== "molten") return;
  const params = planet.getPlanetParams ? planet.getPlanetParams() : null;
  if (!params) return;
  const target = Math.max(0, params.MOLTEN_VENT_COUNT || 0);
  if (target <= 0) return;
  for (let i = props.length - 1; i >= 0; i--) {
    if (props[i].type === "vent") props.splice(i, 1);
  }
  const nodes = planet.radialGraph.nodes;
  const neighbors = planet.radialGraph.neighbors;
  const air = planet.airNodesBitmap;
  const moltenOuter = params.MOLTEN_RING_OUTER || 0;
  const rMin = Math.max(0, moltenOuter + 0.6);
  const rMax = Math.max(rMin + 0.5, params.RMAX - 0.6);
  const minDist = 0.9;
  const reservations = [];
  const baseReserve = Math.max(0.4, GAME.MINER_MIN_SEP * 0.6);
  for (const p of props) {
    if (p.dead) continue;
    if (p.type === "vent") continue;
    if (p.type === "turret_pad") continue;
    reservations.push({ x: p.x, y: p.y, r: baseReserve });
  }
  const candidates = [];
  for (let i = 0; i < nodes.length; i++) {
    if (!air[i]) continue;
    const n = nodes[i];
    const r2 = Math.hypot(n.x, n.y);
    if (r2 < rMin || r2 > rMax) continue;
    if (!isFarFromReservations(n.x, n.y, minDist, reservations)) continue;
    const neigh = neighbors[i] || [];
    let airCount = 0;
    let rockNeighbor = null;
    let rockDist2 = Infinity;
    for (const e of neigh) {
      if (air[e.to]) airCount++;
      else {
        const nb = nodes[e.to];
        if (nb) {
          const dx = n.x - nb.x;
          const dy = n.y - nb.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < rockDist2) {
            rockDist2 = d2;
            rockNeighbor = nb;
          }
        }
      }
    }
    if (airCount < 3 || !rockNeighbor) continue;
    const dxr = n.x - rockNeighbor.x;
    const dyr = n.y - rockNeighbor.y;
    const nlen = Math.hypot(dxr, dyr) || 1;
    const nx = dxr / nlen;
    const ny = dyr / nlen;
    candidates.push({ n, rockNeighbor, nx, ny });
  }
  const rand = mulberry32$1(planet.getSeed() + 991 | 0);
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = candidates[i];
    candidates[i] = candidates[j];
    candidates[j] = tmp;
  }
  const picked = [];
  for (const c of candidates) {
    const n = c.n;
    let tooClose = false;
    for (const p of picked) {
      const dx = n.x - p.n.x;
      const dy = n.y - p.n.y;
      if (dx * dx + dy * dy < minDist * minDist) {
        tooClose = true;
        break;
      }
    }
    if (tooClose) continue;
    picked.push(c);
    if (picked.length >= target) break;
  }
  const recess = 0.08;
  for (const entry of picked) {
    if (!entry.rockNeighbor) continue;
    const n = entry.n;
    const rn = entry.rockNeighbor;
    const nx = entry.nx;
    const ny = entry.ny;
    let lo = { x: rn.x, y: rn.y };
    let hi = { x: n.x, y: n.y };
    for (let i = 0; i < 8; i++) {
      const mx = (lo.x + hi.x) * 0.5;
      const my = (lo.y + hi.y) * 0.5;
      if (planet.airValueAtWorld(mx, my) > 0.5) {
        hi = { x: mx, y: my };
      } else {
        lo = { x: mx, y: my };
      }
    }
    const bx = hi.x - nx * recess;
    const by = hi.y - ny * recess;
    const rot = Math.atan2(ny, nx) - Math.PI * 0.5;
    const scale = 0.55 + rand() * 0.25;
    props.push({ type: "vent", x: bx, y: by, scale, rot, nx, ny });
  }
}
function placeIceShards(planet, props) {
  const cfg = planet.getPlanetConfig ? planet.getPlanetConfig() : null;
  if (!cfg || cfg.id !== "ice") return;
  const params = planet.getPlanetParams ? planet.getPlanetParams() : null;
  if (!params) return;
  for (let i = props.length - 1; i >= 0; i--) {
    if (props[i].type === "ice_shard") props.splice(i, 1);
  }
  const nodes = planet.radialGraph.nodes;
  const neighbors = planet.radialGraph.neighbors;
  const air = planet.airNodesBitmap;
  const surfaceBand = cfg && cfg.defaults && typeof cfg.defaults.SURFACE_BAND === "number" ? cfg.defaults.SURFACE_BAND : 0;
  const surfaceR = params.RMAX * (1 - surfaceBand);
  const surfaceExclude = Math.max(2, params.RMAX * 0.08);
  const rMax = Math.max(0.5, Math.min(params.RMAX - 0.6, surfaceR - surfaceExclude));
  const minDist = 0.55;
  const reservations = [];
  for (const p of props) {
    if (p.dead) continue;
    if (p.type === "turret_pad") continue;
    reservations.push({ x: p.x, y: p.y, r: 0.35 });
  }
  const candidates = [];
  for (let i = 0; i < nodes.length; i++) {
    if (!air[i]) continue;
    const n = nodes[i];
    const r2 = Math.hypot(n.x, n.y);
    if (r2 > rMax) continue;
    if (!isFarFromReservations(n.x, n.y, minDist, reservations)) continue;
    const neigh = neighbors[i] || [];
    let rockNeighbor = null;
    let rockDist2 = Infinity;
    for (const e of neigh) {
      if (air[e.to]) continue;
      const nb = nodes[e.to];
      if (!nb) continue;
      const dx = n.x - nb.x;
      const dy = n.y - nb.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < rockDist2) {
        rockDist2 = d2;
        rockNeighbor = nb;
      }
    }
    if (!rockNeighbor) continue;
    if (Math.hypot(rockNeighbor.x, rockNeighbor.y) >= surfaceR - surfaceExclude) continue;
    const dxr = n.x - rockNeighbor.x;
    const dyr = n.y - rockNeighbor.y;
    const nlen = Math.hypot(dxr, dyr) || 1;
    const nx = dxr / nlen;
    const ny = dyr / nlen;
    candidates.push({ n, rockNeighbor, nx, ny });
  }
  const rand = mulberry32$1(planet.getSeed() + 7331 | 0);
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = candidates[i];
    candidates[i] = candidates[j];
    candidates[j] = tmp;
  }
  const target = Math.max(70, Math.min(270, Math.floor(candidates.length * 0.525)));
  const picked = [];
  for (const c of candidates) {
    const n = c.n;
    let tooClose = false;
    for (const p of picked) {
      const dx = n.x - p.n.x;
      const dy = n.y - p.n.y;
      if (dx * dx + dy * dy < minDist * minDist) {
        tooClose = true;
        break;
      }
    }
    if (tooClose) continue;
    picked.push(c);
    if (picked.length >= target) break;
  }
  const recess = 0.06;
  for (const entry of picked) {
    if (!entry.rockNeighbor) continue;
    const n = entry.n;
    const rn = entry.rockNeighbor;
    const nx = entry.nx;
    const ny = entry.ny;
    let lo = { x: rn.x, y: rn.y };
    let hi = { x: n.x, y: n.y };
    for (let i = 0; i < 8; i++) {
      const mx = (lo.x + hi.x) * 0.5;
      const my = (lo.y + hi.y) * 0.5;
      if (planet.airValueAtWorld(mx, my) > 0.5) {
        hi = { x: mx, y: my };
      } else {
        lo = { x: mx, y: my };
      }
    }
    const bx = hi.x - nx * recess;
    const by = hi.y - ny * recess;
    const rot = Math.atan2(ny, nx) - Math.PI * 0.5;
    const scale = 0.32 + rand() * 0.45;
    props.push({ type: "ice_shard", x: bx, y: by, scale, rot, nx, ny, hp: 1 });
  }
}
function placeMushrooms(planet, props) {
  const cfg = planet.getPlanetConfig ? planet.getPlanetConfig() : null;
  if (!cfg || cfg.id !== "gaia") return;
  const params = planet.getPlanetParams ? planet.getPlanetParams() : null;
  if (!params) return;
  for (let i = props.length - 1; i >= 0; i--) {
    if (props[i].type === "mushroom") props.splice(i, 1);
  }
  const nodes = planet.radialGraph.nodes;
  const neighbors = planet.radialGraph.neighbors;
  const air = planet.airNodesBitmap;
  const surfaceBand = cfg.defaults && typeof cfg.defaults.SURFACE_BAND === "number" ? cfg.defaults.SURFACE_BAND : 0;
  const surfaceR = params.RMAX * (1 - surfaceBand);
  const rMax = Math.max(0.5, surfaceR - 0.5);
  const minDist = 0.7;
  const reservations = [];
  for (const p of props) {
    if (p.dead) continue;
    if (p.type === "turret_pad") continue;
    reservations.push({ x: p.x, y: p.y, r: 0.45 });
  }
  const candidates = [];
  for (let i = 0; i < nodes.length; i++) {
    if (!air[i]) continue;
    const n = nodes[i];
    const r2 = Math.hypot(n.x, n.y);
    if (r2 > rMax) continue;
    if (!isFarFromReservations(n.x, n.y, minDist, reservations)) continue;
    const neigh = neighbors[i] || [];
    let rockNeighbor = null;
    let rockDist2 = Infinity;
    for (const e of neigh) {
      if (air[e.to]) continue;
      const nb = nodes[e.to];
      if (!nb) continue;
      const dx = n.x - nb.x;
      const dy = n.y - nb.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < rockDist2) {
        rockDist2 = d2;
        rockNeighbor = nb;
      }
    }
    if (!rockNeighbor) continue;
    const dxr = n.x - rockNeighbor.x;
    const dyr = n.y - rockNeighbor.y;
    const nlen = Math.hypot(dxr, dyr) || 1;
    const nx = dxr / nlen;
    const ny = dyr / nlen;
    candidates.push({ n, rockNeighbor, nx, ny });
  }
  const rand = mulberry32$1(planet.getSeed() + 3313 | 0);
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = candidates[i];
    candidates[i] = candidates[j];
    candidates[j] = tmp;
  }
  const target = Math.max(30, Math.min(120, Math.floor(candidates.length * 0.18)));
  const picked = [];
  for (const c of candidates) {
    const n = c.n;
    let tooClose = false;
    for (const p of picked) {
      const dx = n.x - p.n.x;
      const dy = n.y - p.n.y;
      if (dx * dx + dy * dy < minDist * minDist) {
        tooClose = true;
        break;
      }
    }
    if (tooClose) continue;
    picked.push(c);
    if (picked.length >= target) break;
  }
  const recess = 0.04;
  for (const entry of picked) {
    if (!entry.rockNeighbor) continue;
    const n = entry.n;
    const rn = entry.rockNeighbor;
    const nx = entry.nx;
    const ny = entry.ny;
    let lo = { x: rn.x, y: rn.y };
    let hi = { x: n.x, y: n.y };
    for (let i = 0; i < 8; i++) {
      const mx = (lo.x + hi.x) * 0.5;
      const my = (lo.y + hi.y) * 0.5;
      if (planet.airValueAtWorld(mx, my) > 0.5) {
        hi = { x: mx, y: my };
      } else {
        lo = { x: mx, y: my };
      }
    }
    const bx = hi.x + nx * recess;
    const by = hi.y + ny * recess;
    const rot = Math.atan2(ny, nx) - Math.PI * 0.5;
    const scale = 0.28 + rand() * 0.24;
    props.push({ type: "mushroom", x: bx, y: by, scale, rot, nx, ny, hp: 1 });
  }
}
function pruneMoltenVentsAgainstPoints(planet, props, points) {
  const cfg = planet.getPlanetConfig ? planet.getPlanetConfig() : null;
  if (!cfg || cfg.id !== "molten") return 0;
  if (!props || !props.length) return 0;
  if (!points || !points.length) return 0;
  const inFront = (vx, vy, nx, ny, px, py, maxDist, cosLimit, maxSide) => {
    const dx = px - vx;
    const dy = py - vy;
    const d2 = dx * dx + dy * dy;
    if (d2 <= 1e-6 || d2 > maxDist * maxDist) return false;
    const d = Math.sqrt(d2);
    const dir = (dx * nx + dy * ny) / d;
    if (dir < cosLimit) return false;
    const side = Math.abs(dx * -ny + dy * nx);
    return side <= maxSide;
  };
  let removed = 0;
  for (let i = props.length - 1; i >= 0; i--) {
    const p = props[i];
    if (p.type !== "vent" || p.dead) continue;
    const nx = typeof p.nx === "number" ? p.nx : 0;
    const ny = typeof p.ny === "number" ? p.ny : 0;
    const nlen = Math.hypot(nx, ny) || 1;
    const ux = nx / nlen;
    const uy = ny / nlen;
    let bad = false;
    for (const t of points) {
      if (inFront(p.x, p.y, ux, uy, t.x, t.y, 7.5, 0.6, 0.9)) {
        bad = true;
        break;
      }
    }
    if (bad) {
      props.splice(i, 1);
      removed++;
    }
  }
  return removed;
}
function collectWaterBubbleSources(planet, target) {
  const cfg = planet.getPlanetConfig ? planet.getPlanetConfig() : null;
  if (!cfg || cfg.id !== "water") return [];
  const params = planet.getPlanetParams ? planet.getPlanetParams() : null;
  if (!params || target <= 0) return [];
  if (!planet.radialGraph || !planet.radialGraph.nodes || !planet.radialGraph.neighbors) return [];
  const nodes = planet.radialGraph.nodes;
  const neighbors = planet.radialGraph.neighbors;
  const air = planet.airNodesBitmap || null;
  if (!air || air.length !== nodes.length) return [];
  const rings = planet && planet.radial && planet.radial.rings ? planet.radial.rings : null;
  const outerRingR = rings && rings.length ? rings.length - 1 : Math.floor(params.RMAX);
  const mediumR = Math.max(0.8, outerRingR - 0.5);
  const rMin = Math.max(0.7, params.RMAX * 0.12);
  const minDist = 0.65;
  const candidates = [];
  for (let i = 0; i < nodes.length; i++) {
    if (!air[i]) continue;
    const n = nodes[i];
    const r2 = Math.hypot(n.x, n.y);
    if (r2 < rMin || r2 > mediumR) continue;
    const neigh = neighbors[i] || [];
    let rockNeighbor = null;
    let rockDist2 = Infinity;
    for (const e of neigh) {
      if (air[e.to]) continue;
      const nb = nodes[e.to];
      if (!nb) continue;
      const dx = n.x - nb.x;
      const dy = n.y - nb.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < rockDist2) {
        rockDist2 = d2;
        rockNeighbor = nb;
      }
    }
    if (!rockNeighbor) continue;
    const dxr = n.x - rockNeighbor.x;
    const dyr = n.y - rockNeighbor.y;
    const nlen = Math.hypot(dxr, dyr) || 1;
    const nx = dxr / nlen;
    const ny = dyr / nlen;
    const upx = n.x / (r2 || 1);
    const upy = n.y / (r2 || 1);
    const dotUp = nx * upx + ny * upy;
    if (dotUp < 0.2) continue;
    let lo = { x: rockNeighbor.x, y: rockNeighbor.y };
    let hi = { x: n.x, y: n.y };
    for (let it = 0; it < 8; it++) {
      const mx = (lo.x + hi.x) * 0.5;
      const my = (lo.y + hi.y) * 0.5;
      if (planet.airValueAtWorld(mx, my) > 0.5) {
        hi = { x: mx, y: my };
      } else {
        lo = { x: mx, y: my };
      }
    }
    const sx = hi.x + nx * 0.06;
    const sy = hi.y + ny * 0.06;
    if (Math.hypot(sx, sy) > mediumR - 0.03) continue;
    if (planet.airValueAtWorld(sx, sy) <= 0.5) continue;
    if (planet.airValueAtWorld(sx + upx * 0.2, sy + upy * 0.2) <= 0.5) continue;
    candidates.push({ x: sx, y: sy, nx, ny });
  }
  const rand = mulberry32$1(planet.getSeed() + 14011 | 0);
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = candidates[i];
    candidates[i] = candidates[j];
    candidates[j] = tmp;
  }
  const picked = [];
  for (const c of candidates) {
    let tooClose = false;
    for (const p of picked) {
      const dx = c.x - p.x;
      const dy = c.y - p.y;
      if (dx * dx + dy * dy < minDist * minDist) {
        tooClose = true;
        break;
      }
    }
    if (tooClose) continue;
    picked.push({
      x: c.x,
      y: c.y,
      nx: c.nx,
      ny: c.ny,
      t: rand() * 2.2
    });
    if (picked.length >= target) break;
  }
  return picked;
}
function createPlanetFeatures(planet, props, iceShardHazard, ridgeSpikeHazard, mushroomHazard) {
  const tuning = {
    iceShard: {
      blast: 0.8,
      damage: 0.9,
      pieces: 8,
      debrisLifeMin: 0.8,
      debrisLifeMax: 0.7,
      debrisSpeedMin: 1.2,
      debrisSpeedMax: 2
    },
    ridgeSpike: {
      blast: 0.36,
      pieces: 6,
      debrisLifeMin: 0.7,
      debrisLifeMax: 0.55,
      debrisSpeedMin: 1,
      debrisSpeedMax: 1.6
    },
    lava: {
      life: 1.4,
      speed: 2.8,
      radius: 0.22,
      burstRate: 18,
      flashDuration: 2,
      ventPeriod: 6.5,
      heatHit: 14
    },
    // Wider hot-core heat falloff so the danger zone reaches farther from the core.
    coreHeatRadius: 3.2,
    coreHeatRise: 22,
    coreHeatDecay: 10,
    mushroom: {
      life: 2,
      speed: 4,
      radius: 0.25,
      pieces: 12,
      confuseTime: 5
    },
    water: {
      sourceRate: 2.1,
      sourceJitter: 0.45,
      shipRateMin: 0.07,
      shipRateMax: 0.22,
      rise: 1.25,
      drift: 0.32,
      lifeMin: 1.2,
      lifeMax: 2,
      sizeMin: 0.032,
      sizeMax: 0.072,
      sourcePropScaleMin: 0.22,
      sourcePropScaleMax: 0.34,
      entryBurstCount: 10,
      entrySprayCount: 8,
      exitSprayCount: 12,
      splashLifeMin: 1.34,
      splashLifeMax: 1.56,
      splashSizeMin: 0.08,
      splashSizeMax: 0.15,
      splashSpeedMin: 1.4,
      splashSpeedMax: 3.6
    }
  };
  const particles = {
    /** @type {Array<{x:number,y:number,vx:number,vy:number,life:number}>} */
    lava: [],
    /** @type {Array<{x:number,y:number,vx:number,vy:number,life:number}>} */
    mushroom: [],
    /** @type {Array<{x:number,y:number,vx:number,vy:number,life:number,maxLife:number,size:number,rot:number,spin:number}>} */
    bubbles: [],
    /** @type {Array<{x:number,y:number,vx:number,vy:number,life:number,maxLife:number,size:number,rot:number,cr:number,cg:number,cb:number}>} */
    splashes: []
  };
  placeMoltenVents(planet, props || []);
  const ventReserve = (props || []).filter((p) => p.type === "vent").map((p) => ({ x: p.x, y: p.y }));
  if (ventReserve.length && planet.reserveSpawnPoints) {
    const minDist = Math.max(0.4, GAME.MINER_MIN_SEP * 0.6);
    planet.reserveSpawnPoints(ventReserve, minDist);
  }
  placeIceShards(planet, props || []);
  const iceReserve = (props || []).filter((p) => p.type === "ice_shard").map((p) => ({ x: p.x, y: p.y }));
  if (iceReserve.length && planet.reserveSpawnPoints) {
    planet.reserveSpawnPoints(iceReserve, 0.5);
  }
  placeMushrooms(planet, props || []);
  const mushReserve = (props || []).filter((p) => p.type === "mushroom").map((p) => ({ x: p.x, y: p.y }));
  if (mushReserve.length && planet.reserveSpawnPoints) {
    planet.reserveSpawnPoints(mushReserve, 0.5);
  }
  let ventsPruned = false;
  const waterCfg = planet.getPlanetConfig ? planet.getPlanetConfig() : null;
  const isWater = !!(waterCfg && waterCfg.id === "water");
  const waterParams = planet.getPlanetParams ? planet.getPlanetParams() : null;
  const outerRingR = planet && planet.radial && planet.radial.rings && planet.radial.rings.length ? planet.radial.rings.length - 1 : waterParams && typeof waterParams.RMAX === "number" ? Math.floor(waterParams.RMAX) : 0;
  const waterRadius = isWater ? Math.max(0, outerRingR - 0.5) : 0;
  const bubbleSources = isWater ? collectWaterBubbleSources(planet, 36) : [];
  if (isWater && bubbleSources.length && props) {
    const rand = mulberry32$1(planet.getSeed() + 14591 | 0);
    for (const src of bubbleSources) {
      props.push({
        type: "bubble_hex",
        x: src.x - src.nx * 0.02,
        y: src.y - src.ny * 0.02,
        scale: tuning.water.sourcePropScaleMin + rand() * (tuning.water.sourcePropScaleMax - tuning.water.sourcePropScaleMin),
        rot: Math.atan2(src.ny, src.nx),
        rotSpeed: (rand() * 2 - 1) * 0.1,
        nx: src.nx,
        ny: src.ny
      });
    }
  }
  let shipBubbleT = tuning.water.shipRateMin;
  let shipUnderwater = false;
  const emitIceShardBurst = (info, callbacks) => {
    if (!info) return;
    const x = info.x;
    const y = info.y;
    if (callbacks.onExplosion) {
      callbacks.onExplosion({ x, y, life: 0.5, radius: tuning.iceShard.blast });
    }
    if (callbacks.onAreaDamage) {
      callbacks.onAreaDamage(x, y, tuning.iceShard.damage);
    }
    if (callbacks.onDebris) {
      const pieces = tuning.iceShard.pieces;
      for (let i = 0; i < pieces; i++) {
        const ang = Math.random() * Math.PI * 2;
        const sp = tuning.iceShard.debrisSpeedMin + Math.random() * tuning.iceShard.debrisSpeedMax;
        callbacks.onDebris({
          x: x + Math.cos(ang) * 0.08,
          y: y + Math.sin(ang) * 0.08,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          a: Math.random() * Math.PI * 2,
          w: (Math.random() - 0.5) * 8,
          life: tuning.iceShard.debrisLifeMin + Math.random() * tuning.iceShard.debrisLifeMax
        });
      }
    }
  };
  const spawnMushroomBurst = (info) => {
    if (!info) return;
    const { x, y } = info;
    const pieces = tuning.mushroom.pieces;
    for (let i = 0; i < pieces; i++) {
      const ang = i / pieces * Math.PI * 2 + Math.random() * 0.4;
      const sp = tuning.mushroom.speed * (0.8 + Math.random() * 0.4);
      particles.mushroom.push({
        x,
        y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp,
        life: tuning.mushroom.life
      });
    }
  };
  const mushroomProximityRadius = 4;
  const mushroomLosStep = 0.2;
  const triggerMushroomBurst = (info) => {
    if (!info) return;
    spawnMushroomBurst(info);
    if (!mushroomHazard || mushroomProximityRadius <= 0) return;
    const nearby = mushroomHazard.burstAllInRadius(info.x, info.y, mushroomProximityRadius);
    if (!nearby.length) return;
    for (const next of nearby) {
      spawnMushroomBurst(next);
    }
  };
  const handleShipContact = (x, y, radius, callbacks) => {
    let hit = false;
    if (props && props.length) {
      for (const p of props) {
        if (p.type !== "vent" || p.dead) continue;
        const info = planet.surfaceInfoAtWorld ? planet.surfaceInfoAtWorld(p.x, p.y, 0.18) : null;
        const nx = info ? info.nx : p.x / (Math.hypot(p.x, p.y) || 1);
        const ny = info ? info.ny : p.y / (Math.hypot(p.x, p.y) || 1);
        const tx = -ny;
        const ty = nx;
        const dx = x - p.x;
        const dy = y - p.y;
        const localX = dx * tx + dy * ty;
        const localY = dx * nx + dy * ny;
        const s = p.scale || 1;
        const halfH = 0.45 * s;
        const halfW0 = 0.22 * s;
        const halfW1 = 0.12 * s;
        if (localY < -halfH - radius || localY > halfH + radius) continue;
        const t = Math.max(0, Math.min(1, (localY + halfH) / (2 * halfH || 1)));
        const halfW = halfW0 + (halfW1 - halfW0) * t;
        if (Math.abs(localX) <= halfW + radius) {
          if (callbacks.onShipCrash) callbacks.onShipCrash(p.x, p.y);
          hit = true;
          break;
        }
      }
    }
    if (mushroomHazard) {
      const hitProp = mushroomHazard.hitAt(x, y, radius);
      if (hitProp) {
        const info = mushroomHazard.burst(hitProp);
        triggerMushroomBurst(info);
        hit = true;
      }
    }
    if (mushroomHazard && !hit) {
      const bursts = mushroomHazard.burstAllInRadius(x, y, mushroomProximityRadius);
      if (bursts.length) {
        let triggered = false;
        for (const info of bursts) {
          if (!lineOfSightAir(planet, x, y, info.x, info.y, mushroomLosStep)) continue;
          triggerMushroomBurst(info);
          triggered = true;
        }
        if (triggered) hit = true;
      }
    }
    if (ridgeSpikeHazard) {
      const hitProp = ridgeSpikeHazard.hitAt(x, y, radius);
      if (hitProp) {
        const info = ridgeSpikeHazard.burst(hitProp);
        emitRidgeSpikeBurst(info, callbacks, true);
        hit = true;
      }
    }
    if (iceShardHazard) {
      const hitProp = iceShardHazard.hitAt(x, y, radius);
      if (hitProp) {
        const info = iceShardHazard.burst(hitProp);
        emitIceShardBurst(info, callbacks);
        hit = true;
      }
    }
    return hit;
  };
  const handleShot = (x, y, radius, callbacks) => {
    let hit = false;
    if (ridgeSpikeHazard) {
      const hitProp = ridgeSpikeHazard.hitAt(x, y, radius);
      if (hitProp) {
        const info = ridgeSpikeHazard.burst(hitProp);
        emitRidgeSpikeBurst(info, callbacks, false);
        hit = true;
      }
    }
    if (iceShardHazard) {
      const hitProp = iceShardHazard.hitAt(x, y, radius);
      if (hitProp) {
        const info = iceShardHazard.burst(hitProp);
        emitIceShardBurst(info, callbacks);
        hit = true;
      }
    }
    if (mushroomHazard) {
      const hitProp = mushroomHazard.hitAt(x, y, radius);
      if (hitProp) {
        const info = mushroomHazard.burst(hitProp);
        triggerMushroomBurst(info);
        hit = true;
      }
    }
    return hit;
  };
  const handleBomb = (x, y, impactRadius, bombRadius, callbacks) => {
    let hit = false;
    if (ridgeSpikeHazard) {
      const exposed = ridgeSpikeHazard.breakIfExposed(planet, x, y, impactRadius + 0.4);
      for (const info of exposed) {
        emitRidgeSpikeBurst(info, callbacks, false);
        hit = true;
      }
      const direct = ridgeSpikeHazard.burstAllInRadius(x, y, bombRadius);
      for (const info of direct) {
        emitRidgeSpikeBurst(info, callbacks, false);
        hit = true;
      }
    }
    if (iceShardHazard) {
      const exposed = iceShardHazard.breakIfExposed(planet, x, y, impactRadius + 0.4);
      for (const info of exposed) {
        emitIceShardBurst(info, callbacks);
        hit = true;
      }
      const direct = iceShardHazard.burstAllInRadius(x, y, bombRadius);
      for (const info of direct) {
        emitIceShardBurst(info, callbacks);
        hit = true;
      }
    }
    if (mushroomHazard) {
      const exposed = mushroomHazard.breakIfExposed(planet, x, y, impactRadius + 0.4);
      for (const info of exposed) {
        triggerMushroomBurst(info);
        hit = true;
      }
      const bursts = mushroomHazard.burstAllInRadius(x, y, Math.max(bombRadius, mushroomProximityRadius));
      if (bursts.length) {
        hit = true;
        for (const info of bursts) triggerMushroomBurst(info);
      }
    }
    return hit;
  };
  const updateCoreHeat = (dt, state) => {
    const cfg = planet.getPlanetConfig ? planet.getPlanetConfig() : null;
    const coreR = planet.getCoreRadius();
    const coreHeatWorld = !!(cfg && (cfg.id === "molten" || cfg.id === "mechanized" && coreR > 0.5));
    if (!coreHeatWorld) return;
    if (coreR <= 0) return;
    const heatR = coreR + tuning.coreHeatRadius;
    const heatR2 = heatR * heatR;
    const ship = state.ship;
    if (ship) {
      const shipR2 = ship.x * ship.x + ship.y * ship.y;
      const shipR = Math.sqrt(shipR2);
      const inHeat = shipR2 <= heatR2;
      if (ship.heat === void 0) ship.heat = 0;
      if (inHeat) {
        const t = Math.max(0, Math.min(1, 1 - (shipR - coreR) / Math.max(1e-3, tuning.coreHeatRadius)));
        ship.heat = Math.min(100, ship.heat + tuning.coreHeatRise * t * dt);
      } else {
        ship.heat = Math.max(0, ship.heat - tuning.coreHeatDecay * dt);
      }
    }
    const coreR2 = coreR * coreR;
    if (state.enemies) {
      for (let i = state.enemies.length - 1; i >= 0; i--) {
        const e = state.enemies[i];
        const r2 = e.x * e.x + e.y * e.y;
        if (r2 <= coreR2) e.hp = 0;
      }
    }
    if (state.miners) {
      for (let i = state.miners.length - 1; i >= 0; i--) {
        const m = state.miners[i];
        const r2 = m.x * m.x + m.y * m.y;
        if (r2 <= coreR2) {
          state.miners.splice(i, 1);
          if (state.onMinerKilled) state.onMinerKilled(m);
        }
      }
    }
  };
  const updateVents = (dt) => {
    if (!props || !props.length) return;
    for (const p of props) {
      if (p.type !== "vent") continue;
      p.ventT = (p.ventT || 0) + dt;
      const phase = p.ventT % tuning.lava.ventPeriod;
      const active = phase >= tuning.lava.ventPeriod - tuning.lava.flashDuration;
      p.ventHeat = active ? 1 : 0;
      if (!active) continue;
      const rate = tuning.lava.burstRate * dt;
      const emitCount = Math.max(0, Math.floor(rate));
      const frac = rate - emitCount;
      const total = emitCount + (Math.random() < frac ? 1 : 0);
      let nx = typeof p.nx === "number" ? p.nx : 0;
      let ny = typeof p.ny === "number" ? p.ny : 0;
      if (!nx && !ny) {
        const info = planet.surfaceInfoAtWorld ? planet.surfaceInfoAtWorld(p.x, p.y, 0.18) : null;
        nx = info ? info.nx : p.x / (Math.hypot(p.x, p.y) || 1);
        ny = info ? info.ny : p.y / (Math.hypot(p.x, p.y) || 1);
      }
      const nlen = Math.hypot(nx, ny) || 1;
      nx /= nlen;
      ny /= nlen;
      const tx = -ny;
      const ty = nx;
      for (let i = 0; i < total; i++) {
        const jitter = (Math.random() * 2 - 1) * 0.25;
        const spread = (Math.random() * 2 - 1) * 0.35;
        const vx = (nx + tx * spread) * tuning.lava.speed;
        const vy = (ny + ty * spread) * tuning.lava.speed;
        particles.lava.push({
          x: p.x + nx * 0.12,
          y: p.y + ny * 0.12,
          vx: vx + jitter * 0.4,
          vy: vy + jitter * 0.4,
          life: tuning.lava.life
        });
      }
    }
  };
  const updateLavaParticles = (dt, state) => {
    const lava = particles.lava;
    if (!lava.length) return;
    const hitR2 = tuning.lava.radius * tuning.lava.radius;
    for (let i = lava.length - 1; i >= 0; i--) {
      const p = lava[i];
      const { x: gx, y: gy } = planet.gravityAt(p.x, p.y);
      p.vx += gx * dt;
      p.vy += gy * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0 || planet.airValueAtWorld(p.x, p.y) <= 0.5) {
        lava.splice(i, 1);
        continue;
      }
      if (state.ship) {
        const dxs = state.ship.x - p.x;
        const dys = state.ship.y - p.y;
        if (dxs * dxs + dys * dys <= hitR2) {
          if (state.onShipHeat) state.onShipHeat(tuning.lava.heatHit);
          lava.splice(i, 1);
          continue;
        }
      }
      let hit = false;
      if (state.enemies) {
        for (let j = state.enemies.length - 1; j >= 0; j--) {
          const e = state.enemies[j];
          const dx = e.x - p.x;
          const dy = e.y - p.y;
          if (dx * dx + dy * dy <= hitR2) {
            if (state.onEnemyHit) state.onEnemyHit(e, p.x, p.y);
            lava.splice(i, 1);
            hit = true;
            break;
          }
        }
      }
      if (hit) continue;
      if (state.miners) {
        for (let j = state.miners.length - 1; j >= 0; j--) {
          const m = state.miners[j];
          const dx = m.x - p.x;
          const dy = m.y - p.y;
          if (dx * dx + dy * dy <= hitR2) {
            state.miners.splice(j, 1);
            if (state.onMinerKilled) state.onMinerKilled(m);
            lava.splice(i, 1);
            break;
          }
        }
      }
    }
  };
  const updateMushroomParticles = (dt, state) => {
    const mush = particles.mushroom;
    if (!mush.length) return;
    const hitR2 = tuning.mushroom.radius * tuning.mushroom.radius;
    for (let i = mush.length - 1; i >= 0; i--) {
      const p = mush[i];
      const { x: gx, y: gy } = planet.gravityAt(p.x, p.y);
      p.vx += gx * dt;
      p.vy += gy * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        mush.splice(i, 1);
        continue;
      }
      if (state.ship) {
        const dxs = state.ship.x - p.x;
        const dys = state.ship.y - p.y;
        if (dxs * dxs + dys * dys <= hitR2) {
          if (state.onShipConfuse) state.onShipConfuse(tuning.mushroom.confuseTime);
          mush.splice(i, 1);
          continue;
        }
      }
      if (!state.enemies) continue;
      for (let j = state.enemies.length - 1; j >= 0; j--) {
        const e = state.enemies[j];
        const dx = e.x - p.x;
        const dy = e.y - p.y;
        if (dx * dx + dy * dy <= hitR2) {
          if (state.onEnemyHit) state.onEnemyHit(e, p.x, p.y);
          mush.splice(i, 1);
          break;
        }
      }
    }
  };
  const emitRidgeSpikeBurst = (info, callbacks, damageShip = false) => {
    if (!info) return;
    const x = info.x;
    const y = info.y;
    const scale = info.scale || 1;
    if (callbacks.onExplosion) {
      callbacks.onExplosion({ x, y, life: 0.35, radius: tuning.ridgeSpike.blast * scale });
    }
    if (callbacks.onDebris) {
      const pieces = tuning.ridgeSpike.pieces;
      for (let i = 0; i < pieces; i++) {
        const ang = Math.random() * Math.PI * 2;
        const sp = tuning.ridgeSpike.debrisSpeedMin + Math.random() * tuning.ridgeSpike.debrisSpeedMax;
        callbacks.onDebris({
          x: x + Math.cos(ang) * 0.06,
          y: y + Math.sin(ang) * 0.06,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          a: Math.random() * Math.PI * 2,
          w: (Math.random() - 0.5) * 7,
          life: tuning.ridgeSpike.debrisLifeMin + Math.random() * tuning.ridgeSpike.debrisLifeMax
        });
      }
    }
    if (damageShip && callbacks.onShipDamage) {
      callbacks.onShipDamage(x, y);
    }
  };
  const updateWaterBubbles = (dt, state) => {
    if (!isWater) return;
    const bubbles = particles.bubbles;
    const splashes = particles.splashes;
    const spawnBubble = (x, y, baseUpX, baseUpY) => {
      if (waterRadius > 0 && Math.hypot(x, y) > waterRadius + 0.02) return;
      if (planet.airValueAtWorld(x, y) <= 0.5) return;
      const t = Math.random() * 2 - 1;
      const tx = -baseUpY;
      const ty = baseUpX;
      const rise = tuning.water.rise * (0.75 + Math.random() * 0.5);
      const drift = tuning.water.drift * t;
      const vx = baseUpX * rise + tx * drift;
      const vy = baseUpY * rise + ty * drift;
      const life = tuning.water.lifeMin + Math.random() * (tuning.water.lifeMax - tuning.water.lifeMin);
      const size = tuning.water.sizeMin + Math.random() * (tuning.water.sizeMax - tuning.water.sizeMin);
      bubbles.push({
        x,
        y,
        vx,
        vy,
        life,
        maxLife: life,
        size,
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() * 2 - 1) * 1.6
      });
    };
    const spawnSplash = (x, y, baseUpX, baseUpY, baseVx = 0, baseVy = 0, impactSpeed = 0) => {
      const t = Math.random() * 2 - 1;
      const tx = -baseUpY;
      const ty = baseUpX;
      const spBase = tuning.water.splashSpeedMin + Math.random() * (tuning.water.splashSpeedMax - tuning.water.splashSpeedMin);
      const impactMul = Math.min(3.5, 1 + Math.max(0, impactSpeed) * 0.28);
      const sp = spBase * impactMul;
      const vx = baseVx + baseUpX * sp + tx * (0.9 * t);
      const vy = baseVy + baseUpY * sp + ty * (0.9 * t);
      const life = tuning.water.splashLifeMin + Math.random() * (tuning.water.splashLifeMax - tuning.water.splashLifeMin);
      const size = tuning.water.splashSizeMin + Math.random() * (tuning.water.splashSizeMax - tuning.water.splashSizeMin);
      const cmix = Math.random();
      const cr = Math.max(0, Math.min(1, 0.05 + cmix * 0.24 + Math.random() * 0.04));
      const cg = Math.max(0, Math.min(1, 0.24 + cmix * 0.44 + Math.random() * 0.05));
      const cb = Math.max(0, Math.min(1, 0.58 + cmix * 0.38 + Math.random() * 0.04));
      splashes.push({
        x,
        y,
        vx,
        vy,
        life,
        maxLife: life,
        size,
        rot: Math.random() * Math.PI * 2,
        cr,
        cg,
        cb
      });
    };
    if (bubbleSources.length) {
      for (const src of bubbleSources) {
        src.t -= dt;
        if (src.t > 0) continue;
        src.t = 1 / tuning.water.sourceRate + Math.random() * tuning.water.sourceJitter;
        const r2 = Math.hypot(src.x, src.y) || 1;
        const upx = src.x / r2;
        const upy = src.y / r2;
        spawnBubble(src.x + src.nx * 0.015, src.y + src.ny * 0.015, upx, upy);
        if (Math.random() < 0.55) {
          spawnBubble(src.x + src.nx * 0.03, src.y + src.ny * 0.03, upx, upy);
        }
      }
    }
    const ship = state && state.ship ? state.ship : null;
    let shipNowUnderwater = false;
    if (ship && ship.state !== "crashed" && waterRadius > 0) {
      const sr = Math.hypot(ship.x, ship.y);
      const upx = sr > 1e-6 ? ship.x / sr : 1;
      const upy = sr > 1e-6 ? ship.y / sr : 0;
      const airAtShip = planet.airValueAtWorld(ship.x, ship.y) > 0.5;
      const nearSurfaceBand = Math.abs(sr - waterRadius) <= 0.35;
      const shipInSpaceBand = sr > waterRadius + 0.02 && airAtShip;
      shipNowUnderwater = sr <= waterRadius + 0.02 && airAtShip;
      if (shipNowUnderwater && !shipUnderwater && nearSurfaceBand) {
        const inwardSpeed = Math.max(0, -(ship.vx * upx + ship.vy * upy));
        const crashSpeed = Math.max(inwardSpeed, Math.hypot(ship.vx, ship.vy) * 0.45);
        for (let i = 0; i < tuning.water.entrySprayCount; i++) {
          const t = (Math.random() * 2 - 1) * 0.22;
          const tx = -upy;
          const ty = upx;
          spawnSplash(
            ship.x + tx * t + upx * 0.05,
            ship.y + ty * t + upy * 0.05,
            upx,
            upy,
            ship.vx * 0.12,
            ship.vy * 0.12,
            crashSpeed
          );
        }
        for (let i = 0; i < tuning.water.entryBurstCount; i++) {
          const t = (Math.random() * 2 - 1) * 0.16;
          const tx = -upy;
          const ty = upx;
          spawnBubble(
            ship.x - upx * (0.16 + Math.random() * 0.14) + tx * t,
            ship.y - upy * (0.16 + Math.random() * 0.14) + ty * t,
            upx,
            upy
          );
        }
      }
      if (!shipNowUnderwater && shipUnderwater && shipInSpaceBand && nearSurfaceBand) {
        for (let i = 0; i < tuning.water.exitSprayCount; i++) {
          const t = (Math.random() * 2 - 1) * 0.22;
          const tx = -upy;
          const ty = upx;
          spawnSplash(
            ship.x + tx * t,
            ship.y + ty * t,
            upx,
            upy,
            ship.vx * 0.18,
            ship.vy * 0.18
          );
        }
      }
      if (shipNowUnderwater) {
        shipBubbleT -= dt;
        if (shipBubbleT <= 0) {
          shipBubbleT = tuning.water.shipRateMin + Math.random() * (tuning.water.shipRateMax - tuning.water.shipRateMin);
          spawnBubble(
            ship.x - upx * 0.2 + (Math.random() * 2 - 1) * 0.05,
            ship.y - upy * 0.2 + (Math.random() * 2 - 1) * 0.05,
            upx,
            upy
          );
        }
      }
    }
    shipUnderwater = shipNowUnderwater;
    if (bubbles.length) {
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const p = bubbles[i];
        const r2 = Math.hypot(p.x, p.y) || 1;
        const upx = p.x / r2;
        const upy = p.y / r2;
        p.vx += upx * 0.55 * dt;
        p.vy += upy * 0.55 * dt;
        const drag = Math.max(0, 1 - 1.5 * dt);
        p.vx *= drag;
        p.vy *= drag;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.spin * dt;
        p.life -= dt;
        p.size += dt * 0.013;
        const pr = Math.hypot(p.x, p.y);
        if (waterRadius > 0 && pr >= waterRadius - 0.03) {
          p.life -= dt * 1.8;
          p.size += dt * 0.04;
        }
        if (p.life <= 0 || planet.airValueAtWorld(p.x, p.y) <= 0.5) {
          bubbles.splice(i, 1);
        }
      }
    }
    if (splashes.length) {
      for (let i = splashes.length - 1; i >= 0; i--) {
        const p = splashes[i];
        const { x: gx, y: gy } = planet.gravityAt(p.x, p.y);
        p.vx += gx * dt * 0.55;
        p.vy += gy * dt * 0.55;
        const drag = Math.max(0, 1 - 0.75 * dt);
        p.vx *= drag;
        p.vy *= drag;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += dt * 3.2;
        p.life -= dt;
        if (p.life <= 0 || planet.airValueAtWorld(p.x, p.y) <= 0.5) {
          splashes.splice(i, 1);
        }
      }
    }
  };
  return {
    getParticles: () => particles,
    clearParticles: () => {
      particles.lava.length = 0;
      particles.mushroom.length = 0;
      particles.bubbles.length = 0;
      particles.splashes.length = 0;
    },
    reconcile: (state) => {
      if (ventsPruned) return;
      if (!state) return;
      const points = [];
      if (state.enemies) {
        for (const e of state.enemies) {
          points.push({ x: e.x, y: e.y });
        }
      }
      if (state.miners) {
        for (const m of state.miners) {
          points.push({ x: m.x, y: m.y });
        }
      }
      if (!points.length) return;
      pruneMoltenVentsAgainstPoints(planet, props, points);
      ventsPruned = true;
    },
    update: (dt, state) => {
      updateCoreHeat(dt, state);
      updateVents(dt);
      updateLavaParticles(dt, state);
      updateMushroomParticles(dt, state);
      updateWaterBubbles(dt, state);
    },
    handleShipContact,
    handleShot,
    handleBomb
  };
}
function buildPlanetMaterials(mapgen, planetConfig, params) {
  const { G, inside, idx, toWorld } = mapgen.grid;
  const world = mapgen.getWorld();
  const air = world.air;
  const material = new Uint8Array(G * G);
  for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
    const k = idx(i, j);
    if (!inside[k]) continue;
    const [x, y] = toWorld(i, j);
    const r2 = Math.hypot(x, y);
    const coreR = params.CORE_RADIUS > 1 ? params.CORE_RADIUS : params.CORE_RADIUS * params.RMAX;
    const rf = r2 / params.RMAX;
    const isAir2 = !!air[k];
    let mat = 0;
    switch (planetConfig.id) {
      case "molten":
        if (!isAir2 && r2 <= Math.max(0.2, coreR)) mat = 2;
        break;
      case "ice":
        if (!isAir2 && rf >= Math.max(0, 1 - params.ICE_CRUST_THICKNESS)) mat = 1;
        break;
      case "gaia":
        if (!isAir2 && rf >= 0.58) mat = 3;
        break;
      case "water":
        if (isAir2) {
          const waterSurfaceR = Math.max(0, Math.floor(params.RMAX) - 0.5);
          if (r2 <= waterSurfaceR) mat = 5;
        }
        break;
      case "mechanized": {
        if (!isAir2) {
          const ang = Math.atan2(y, x);
          const band = (ang / (Math.PI * 2) + 1) % 1;
          if (band < 0.12 && rf >= 0.45 && rf <= 0.9) mat = 4;
        }
        break;
      }
    }
    material[k] = mat;
  }
  const props = buildProps(mapgen, planetConfig, params);
  return { material, props };
}
function buildProps(mapgen, planetConfig, params, material) {
  const rng = mulberry32$1(mapgen.getWorld().seed + params.RMAX * 97 | 0);
  const props = [];
  const coreR = params.CORE_RADIUS > 1 ? params.CORE_RADIUS : params.CORE_RADIUS * params.RMAX;
  const surface = sampleSurfacePoints(mapgen, params, 120);
  const add = (type, x, y, scale, rot, rotSpeed = 0, extra = void 0) => {
    props.push({ type, x, y, scale, rot, rotSpeed, ...extra || {} });
  };
  switch (planetConfig.id) {
    case "barren_pickup":
    case "barren_clear": {
      const countRaw = typeof planetConfig.platformCount === "number" ? Math.round(planetConfig.platformCount) : 10;
      const count = Math.max(0, countRaw);
      for (let i = 0; i < count; i++) {
        const a = i / count * Math.PI * 2;
        const r2 = params.RMAX * 0.98;
        add("turret_pad", Math.cos(a) * r2, Math.sin(a) * r2, 0.55, a, 0);
      }
      break;
    }
    case "no_caves": {
      const base = Math.max(18, Math.round(params.RMAX * 2.2));
      const boulderCount = Math.max(8, Math.round(base * 0.5));
      const spikeCount = Math.max(6, Math.round(base * 0.35));
      for (let i = 0; i < boulderCount; i++) {
        add("boulder", 0, 0, 0.35 + rng() * 0.35, rng() * Math.PI * 2, 0);
      }
      for (let i = 0; i < spikeCount; i++) {
        add("ridge_spike", 0, 0, 0.45 + rng() * 0.45, rng() * Math.PI * 2, 0);
      }
      break;
    }
    case "molten": {
      break;
    }
    case "ice": {
      break;
    }
    case "gaia": {
      for (const p of surface) {
        if (rng() < 0.3) add("tree", p[0], p[1], 0.45 + rng() * 0.35, rng() * Math.PI * 2, 0);
      }
      break;
    }
    case "water": {
      const boulderCount = Math.max(10, Math.round(params.RMAX * 1.1));
      const spikeCount = Math.max(6, Math.round(params.RMAX * 0.6));
      for (let i = 0; i < boulderCount; i++) {
        add("boulder", 0, 0, 0.3 + rng() * 0.32, rng() * Math.PI * 2, 0);
      }
      for (let i = 0; i < spikeCount; i++) {
        add("ridge_spike", 0, 0, 0.4 + rng() * 0.36, rng() * Math.PI * 2, 0);
      }
      break;
    }
    case "cavern": {
      const stalCount = Math.max(40, Math.round(params.RMAX * 2.3));
      const boulderCount = Math.max(12, Math.round(params.RMAX * 0.95));
      const spikeCount = Math.max(10, Math.round(params.RMAX * 0.8));
      for (let i = 0; i < stalCount; i++) {
        add("stalactite", 0, 0, 0.34 + rng() * 0.42, rng() * Math.PI * 2, 0);
      }
      for (let i = 0; i < boulderCount; i++) {
        add("boulder", 0, 0, 0.28 + rng() * 0.28, rng() * Math.PI * 2, 0);
      }
      for (let i = 0; i < spikeCount; i++) {
        add("ridge_spike", 0, 0, 0.36 + rng() * 0.32, rng() * Math.PI * 2, 0);
      }
      break;
    }
    case "mechanized": {
      if (coreR > 0.5) {
        const base = Math.max(3, Math.round((planetConfig.platformCount || 10) * 0.32));
        const tetherCount = Math.max(3, Math.min(8, base + Math.floor(rng() * 2)));
        for (let i = 0; i < tetherCount; i++) {
          add("factory", 0, 0, 0.68 + rng() * 0.24, rng() * Math.PI * 2, 0, { hp: 6, spawnT: 0, spawnCd: 0 });
        }
        for (let i = 0; i < tetherCount; i++) {
          add("tether", 0, 0, 1, 0, 0, { hp: 1, halfLength: 1.2 + rng() * 0.8, halfWidth: 0.12 + rng() * 0.05 });
        }
      } else {
        const base = Math.max(5, Math.round((planetConfig.platformCount || 10) * 0.7));
        for (let i = 0; i < base; i++) {
          add("factory", 0, 0, 0.62 + rng() * 0.36, rng() * Math.PI * 2, 0, { hp: 5, spawnT: 0, spawnCd: 0 });
        }
      }
      break;
    }
  }
  return props;
}
function createIceShardHazard(props) {
  const shards = props.filter((p) => p && p.type === "ice_shard");
  const isAliveShard = (p) => p.type === "ice_shard" && !p.dead && !(typeof p.hp === "number" && p.hp <= 0);
  const burstProp = (prop) => {
    if (!isAliveShard(prop)) return null;
    prop.dead = true;
    prop.hp = 0;
    return { x: prop.x, y: prop.y, scale: prop.scale || 1 };
  };
  return {
    burst: (prop) => {
      return burstProp(prop);
    },
    hitAt: (x, y, radius) => {
      for (const p of shards) {
        if (!isAliveShard(p)) continue;
        const sr = 0.32 * (p.scale || 1);
        const dx = p.x - x;
        const dy = p.y - y;
        const r2 = (radius + sr) * (radius + sr);
        if (dx * dx + dy * dy <= r2) {
          return p;
        }
      }
      return null;
    },
    burstAllInRadius: (x, y, radius) => {
      const bursts = [];
      for (const p of shards) {
        if (!isAliveShard(p)) continue;
        const sr = 0.32 * (p.scale || 1);
        const dx = p.x - x;
        const dy = p.y - y;
        const r2 = (radius + sr) * (radius + sr);
        if (dx * dx + dy * dy <= r2) {
          const info = burstProp(p);
          if (info) bursts.push(info);
        }
      }
      return bursts;
    },
    breakIfExposed: (planet, x, y, radius) => {
      const bursts = [];
      for (const p of shards) {
        if (!isAliveShard(p)) continue;
        const sr = 0.32 * (p.scale || 1);
        const dx = p.x - x;
        const dy = p.y - y;
        const r2 = (radius + sr) * (radius + sr);
        if (dx * dx + dy * dy > r2) continue;
        if (planet.airValueAtWorld(p.x, p.y) > 0.5) {
          const info = burstProp(p);
          if (info) bursts.push(info);
        }
      }
      return bursts;
    }
  };
}
function createRidgeSpikeHazard(props) {
  const spikes = props.filter((p) => p && (p.type === "ridge_spike" || p.type === "stalactite"));
  const isAlive = (p) => (p.type === "ridge_spike" || p.type === "stalactite") && !p.dead && !(typeof p.hp === "number" && p.hp <= 0);
  const burstProp = (prop) => {
    if (!isAlive(prop)) return null;
    prop.dead = true;
    prop.hp = 0;
    return { x: prop.x, y: prop.y, scale: prop.scale || 1 };
  };
  const overlapsSpike = (p, x, y, radius) => {
    const s = p.scale || 1;
    const dx = x - p.x;
    const dy = y - p.y;
    const radial = radius + 0.42 * s;
    if (dx * dx + dy * dy <= radial * radial) return true;
    let nx = typeof p.nx === "number" ? p.nx : 0;
    let ny = typeof p.ny === "number" ? p.ny : 0;
    if (!nx && !ny) {
      const r2 = Math.hypot(p.x, p.y) || 1;
      nx = p.x / r2;
      ny = p.y / r2;
    } else {
      const nlen = Math.hypot(nx, ny) || 1;
      nx /= nlen;
      ny /= nlen;
    }
    const tx = -ny;
    const ty = nx;
    const localX = dx * tx + dy * ty;
    const localY = dx * nx + dy * ny;
    const minY = -0.1 * s;
    const maxY = 0.62 * s;
    if (localY < minY - radius || localY > maxY + radius) return false;
    const t = Math.max(0, Math.min(1, (localY - minY) / Math.max(1e-3, maxY - minY)));
    const halfW = 0.2 * (1 - t) * s;
    return Math.abs(localX) <= halfW + radius;
  };
  return {
    burst: (prop) => burstProp(prop),
    hitAt: (x, y, radius) => {
      for (const p of spikes) {
        if (!isAlive(p)) continue;
        if (overlapsSpike(p, x, y, radius)) {
          return p;
        }
      }
      return null;
    },
    burstAllInRadius: (x, y, radius) => {
      const bursts = [];
      for (const p of spikes) {
        if (!isAlive(p)) continue;
        if (overlapsSpike(p, x, y, radius)) {
          const info = burstProp(p);
          if (info) bursts.push(info);
        }
      }
      return bursts;
    },
    breakIfExposed: (planet, x, y, radius) => {
      const bursts = [];
      for (const p of spikes) {
        if (!isAlive(p)) continue;
        if (!overlapsSpike(p, x, y, radius)) continue;
        if (planet.airValueAtWorld(p.x, p.y) > 0.5) {
          const info = burstProp(p);
          if (info) bursts.push(info);
        }
      }
      return bursts;
    }
  };
}
function createMushroomHazard(props) {
  const mushrooms = props.filter((p) => p && p.type === "mushroom");
  const isAlive = (p) => p.type === "mushroom" && !p.dead && !(typeof p.hp === "number" && p.hp <= 0);
  const burstProp = (prop) => {
    if (!isAlive(prop)) return null;
    prop.dead = true;
    prop.hp = 0;
    return { x: prop.x, y: prop.y, scale: prop.scale || 1 };
  };
  return {
    burst: (prop) => burstProp(prop),
    hitAt: (x, y, radius) => {
      for (const p of mushrooms) {
        if (!isAlive(p)) continue;
        const sr = 0.28 * (p.scale || 1);
        const dx = p.x - x;
        const dy = p.y - y;
        const r2 = (radius + sr) * (radius + sr);
        if (dx * dx + dy * dy <= r2) {
          return p;
        }
      }
      return null;
    },
    burstAllInRadius: (x, y, radius) => {
      const bursts = [];
      for (const p of mushrooms) {
        if (!isAlive(p)) continue;
        const sr = 0.28 * (p.scale || 1);
        const dx = p.x - x;
        const dy = p.y - y;
        const r2 = (radius + sr) * (radius + sr);
        if (dx * dx + dy * dy <= r2) {
          const info = burstProp(p);
          if (info) bursts.push(info);
        }
      }
      return bursts;
    },
    breakIfExposed: (planet, x, y, radius) => {
      const bursts = [];
      for (const p of mushrooms) {
        if (!isAlive(p)) continue;
        const sr = 0.28 * (p.scale || 1);
        const dx = p.x - x;
        const dy = p.y - y;
        const r2 = (radius + sr) * (radius + sr);
        if (dx * dx + dy * dy > r2) continue;
        if (planet.airValueAtWorld(p.x, p.y) > 0.5) {
          const info = burstProp(p);
          if (info) bursts.push(info);
        }
      }
      return bursts;
    }
  };
}
function sampleSurfacePoints(mapgen, params, limit) {
  const { G, inside, idx, toWorld } = mapgen.grid;
  const air = mapgen.getWorld().air;
  const pts = [];
  for (let j = 1; j < G - 1; j++) for (let i = 1; i < G - 1; i++) {
    const k = idx(i, j);
    if (!inside[k]) continue;
    if (air[k]) continue;
    const kk0 = idx(i + 1, j);
    const kk1 = idx(i - 1, j);
    const kk2 = idx(i, j + 1);
    const kk3 = idx(i, j - 1);
    const touchesOutside = !inside[kk0] || !inside[kk1] || !inside[kk2] || !inside[kk3];
    const touchesAir = air[kk0] || air[kk1] || air[kk2] || air[kk3];
    if (!touchesOutside && !touchesAir) continue;
    const [x, y] = toWorld(i, j);
    const r2 = Math.hypot(x, y);
    if (r2 < params.RMAX * 0.75) continue;
    pts.push([x, y]);
    if (pts.length >= limit) return pts;
  }
  return pts;
}
class Planet {
  /**
   * @param {{seed:number, planetConfig: import("./planet_config.js").PlanetConfig, planetParams: import("./planet_config.js").PlanetParams}} deps
   */
  constructor({ seed, planetConfig, planetParams }) {
    if (!planetConfig) {
      throw new Error("Planet requires a planetConfig");
    }
    if (!planetParams) {
      throw new Error("Planet requires planetParams");
    }
    this.planetConfig = planetConfig;
    this.planetParams = planetParams;
    this.coreRadius = this._coreRadiusWorld();
    this.mapgen = new MapGen(seed, planetParams);
    const rPlanet = planetParams.RMAX ?? CFG.RMAX;
    this.planetRadius = rPlanet;
    const surfaceG = typeof planetParams.SURFACE_G === "number" ? planetParams.SURFACE_G : 2;
    this.gravitationalConstant = surfaceG * rPlanet * rPlanet;
    this.radial = new RingMesh(this.mapgen, planetParams);
    this.radialGraph = new RadialGraph(this.radial);
    this.airNodesBitmap = buildAirNodesBitmap(this.radialGraph, this.radial);
    this.distanceToTarget = new Float32Array(this.radialGraph.nodes.length);
    const mats = buildPlanetMaterials(this.mapgen, this.planetConfig, this.planetParams);
    this.material = mats.material;
    this.props = mats.props;
    this.iceShardHazard = createIceShardHazard(this.props || []);
    this.ridgeSpikeHazard = createRidgeSpikeHazard(this.props || []);
    this.mushroomHazard = createMushroomHazard(this.props || []);
    this._standablePoints = [];
    this._spawnReservations = [];
    this._spawnReachableMask = null;
    this._rebuildSpawnReachabilityMask();
    this._spreadIceShardsUniform();
    this._snapIceShardsToSurface();
    this._alignTurretPadsToSurface();
    this._alignVentsToSurface();
    this._alignGaiaFlora();
    this._alignSurfaceDebris();
    this._alignCavernDebris();
    this._alignMechanizedStructures();
    this._reserveSpawnPointsFromProps();
    if (!this._standablePoints || !this._standablePoints.length) {
      this._standablePoints = this._buildStandablePoints();
    }
    this.features = createPlanetFeatures(this, this.props || [], this.iceShardHazard, this.ridgeSpikeHazard, this.mushroomHazard);
    this._radialDebugPoints = null;
    this._radialDebugDirty = true;
  }
  /**
   * @returns {number}
   */
  getSeed() {
    return this.mapgen.getWorld().seed;
  }
  /**
   * @returns {number}
   */
  getFinalAir() {
    return this.mapgen.getWorld().finalAir;
  }
  /**
   * @returns {{seed:number, finalAir:number}}
   */
  getWorldMeta() {
    const world = this.mapgen.getWorld();
    return { seed: world.seed, finalAir: world.finalAir };
  }
  /**
   * @returns {import("./planet_config.js").PlanetConfig}
   */
  getPlanetConfig() {
    return this.planetConfig;
  }
  /**
   * @returns {import("./planet_config.js").PlanetParams}
   */
  getPlanetParams() {
    return this.planetParams;
  }
  /**
   * @returns {{
   *  lava:Array<{x:number,y:number,vx:number,vy:number,life:number}>,
   *  mushroom:Array<{x:number,y:number,vx:number,vy:number,life:number}>,
   *  bubbles:Array<{x:number,y:number,vx:number,vy:number,life:number,maxLife:number,size:number,rot:number,spin:number}>,
   *  splashes:Array<{x:number,y:number,vx:number,vy:number,life:number,maxLife:number,size:number,rot:number,cr:number,cg:number,cb:number}>
   * }}
   */
  getFeatureParticles() {
    return this.features ? this.features.getParticles() : { lava: [], mushroom: [], bubbles: [], splashes: [] };
  }
  /**
   * @returns {void}
   */
  clearFeatureParticles() {
    if (this.features) this.features.clearParticles();
  }
  /**
   * @returns {number}
   */
  getCoreRadius() {
    return this.coreRadius || 0;
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} radius
   * @returns {{x:number,y:number,scale:number}|null}
   */
  /**
   * @param {number} dt
   * @param {{
   *  ship: import("./types.d.js").Ship,
   *  enemies: Array<{x:number,y:number,hp:number,hitT?:number}>,
   *  miners: import("./types.d.js").Miner[],
   *  onShipDamage?: (x:number, y:number)=>void,
   *  onShipHeat?: (amount:number)=>void,
   *  onShipConfuse?: (duration:number)=>void,
   *  onEnemyHit?: (enemy:{x:number,y:number,hp:number,hitT?:number}, x:number, y:number)=>void,
   *  onMinerKilled?: (miner:import("./types.d.js").Miner)=>void,
   * }} state
   * @returns {void}
   */
  updateFeatureEffects(dt, state) {
    if (this.features) this.features.update(dt, state);
  }
  /**
   * @param {{enemies:Array<{x:number,y:number}>, miners:Array<{x:number,y:number}>}} state
   * @returns {void}
   */
  reconcileFeatures(state) {
    if (this.features && this.features.reconcile) this.features.reconcile(state);
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} radius
   * @param {{
   *  onExplosion?: (info:{x:number,y:number,life:number,radius:number})=>void,
   *  onDebris?: (info:{x:number,y:number,vx:number,vy:number,a:number,w:number,life:number})=>void,
   *  onAreaDamage?: (x:number, y:number, radius:number)=>void,
   * }} callbacks
   * @returns {boolean}
   */
  handleFeatureContact(x, y, radius, callbacks) {
    if (!this.features) return false;
    return this.features.handleShipContact(x, y, radius, callbacks);
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} radius
   * @param {{
   *  onExplosion?: (info:{x:number,y:number,life:number,radius:number})=>void,
   *  onDebris?: (info:{x:number,y:number,vx:number,vy:number,a:number,w:number,life:number})=>void,
   *  onAreaDamage?: (x:number, y:number, radius:number)=>void,
   * }} callbacks
   * @returns {boolean}
   */
  handleFeatureShot(x, y, radius, callbacks) {
    if (!this.features) return false;
    return this.features.handleShot(x, y, radius, callbacks);
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} impactRadius
   * @param {number} bombRadius
   * @param {{
   *  onExplosion?: (info:{x:number,y:number,life:number,radius:number})=>void,
   *  onDebris?: (info:{x:number,y:number,vx:number,vy:number,a:number,w:number,life:number})=>void,
   *  onAreaDamage?: (x:number, y:number, radius:number)=>void,
   * }} callbacks
   * @returns {boolean}
   */
  handleFeatureBomb(x, y, impactRadius, bombRadius, callbacks) {
    if (!this.features) return false;
    return this.features.handleBomb(x, y, impactRadius, bombRadius, callbacks);
  }
  /**
   * Find nearest radial node to world point using ring radius.
   * @param {number} x
   * @param {number} y
   * @returns {number}
   */
  nearestRadialNodeInAir(x, y) {
    const iNode = nearestRadialNode(this.radialGraph, this.radial, x, y);
    if (this.airNodesBitmap[iNode]) return iNode;
    let iNodeBest = iNode;
    let distSqrBest = Infinity;
    for (const n of this.radialGraph.neighbors[iNode]) {
      const iNodeNeighbor = n.to;
      if (!this.airNodesBitmap[iNodeNeighbor]) continue;
      const nodeNeighbor = this.radialGraph.nodes[iNodeNeighbor];
      const dx = x - nodeNeighbor.x;
      const dy = y - nodeNeighbor.y;
      const distSqr = dx * dx + dy * dy;
      if (distSqr < distSqrBest) {
        distSqrBest = distSqr;
        iNodeBest = iNodeNeighbor;
      }
    }
    return iNodeBest;
  }
  /**
   * Compute and cache a distance map for every node in the graph to a given target position.
   * Useful when multiple enemies all want to go to the same place.
   * @param {number} x 
   * @param {number} y 
   * @returns {void}
   */
  computeDistanceMapTo(x, y) {
    const radialGraph = this.radialGraph;
    const nodeTarget = nearestRadialNode(radialGraph, this.radial, x, y);
    this.distanceToTarget = dijkstraMap(radialGraph, [nodeTarget], this.airNodesBitmap);
  }
  /**
   * @returns {number}
   */
  _coreRadiusWorld() {
    const p = this.planetParams;
    if (!p || !p.CORE_RADIUS) return 0;
    if (p.CORE_RADIUS > 1) return p.CORE_RADIUS;
    return p.CORE_RADIUS * (p.RMAX || 0);
  }
  /**
   * Align vent props to landable points.
   * @returns {void}
   */
  _alignVentsToSurface() {
    const cfg = this.getPlanetConfig ? this.getPlanetConfig() : null;
    if (cfg && cfg.id === "molten") return;
    if (!this.props || !this.props.length) return;
    const vents = [];
    for (const p of this.props) {
      if (p.type === "vent") vents.push(p);
    }
    if (!vents.length) return;
    const seed = (this.mapgen.getWorld().seed | 0) + 1721;
    const points = this.sampleLandablePoints(vents.length, seed, 0.3, 0.2, "random");
    if (!points.length) return;
    for (let i = 0; i < vents.length; i++) {
      const p = vents[i];
      const idx = i % points.length;
      const pt = points[idx];
      p.x = pt[0];
      p.y = pt[1];
    }
  }
  /**
   * Align Gaia flora: trees on landable surface, mushrooms underground.
   * @returns {void}
   */
  _alignGaiaFlora() {
    const cfg = this.getPlanetConfig ? this.getPlanetConfig() : null;
    if (!cfg || cfg.id !== "gaia") return;
    if (!this.props || !this.props.length) return;
    const trees = [];
    const mush = [];
    for (const p of this.props) {
      if (p.type === "tree") trees.push(p);
      else if (p.type === "mushroom") mush.push(p);
    }
    if (trees.length) {
      const seed = (this.mapgen.getWorld().seed | 0) + 811;
      const surfaceBand = cfg.defaults && typeof cfg.defaults.SURFACE_BAND === "number" ? cfg.defaults.SURFACE_BAND : 0;
      const surfaceR = this.planetParams.RMAX * (1 - surfaceBand);
      const rMax = this.planetParams.RMAX - 0.2;
      const eps = 0.18;
      const minDist = 0.35;
      const rand = mulberry32$1(seed);
      const standable = this._standablePoints && this._standablePoints.length ? this._standablePoints : this._buildStandablePoints();
      const bandPoints = standable.filter((p) => p[3] >= surfaceR && p[3] <= rMax);
      const flatPoints = bandPoints.filter((p) => {
        const info = this.surfaceInfoAtWorld(p[0], p[1], eps);
        if (!info) return false;
        const r2 = Math.hypot(p[0], p[1]) || 1;
        const nx = p[0] / r2;
        const ny = p[1] / r2;
        const dot = info.nx * nx + info.ny * ny;
        return dot >= 0.98;
      });
      const pool = flatPoints.length ? flatPoints : bandPoints.length ? bandPoints : standable;
      const shuffled = pool.slice();
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        const tmp = shuffled[i];
        shuffled[i] = shuffled[j];
        shuffled[j] = tmp;
      }
      const points = [];
      for (const sp of shuffled) {
        if (points.length >= trees.length) break;
        const x = sp[0];
        const y = sp[1];
        let ok = true;
        for (const q of points) {
          const dx = x - q[0];
          const dy = y - q[1];
          if (dx * dx + dy * dy < minDist * minDist) {
            ok = false;
            break;
          }
        }
        if (!ok) continue;
        points.push([x, y]);
      }
      for (let i = 0; i < trees.length; i++) {
        const p = trees[i];
        if (i >= points.length) {
          p.dead = true;
          continue;
        }
        const pt = points[i];
        p.x = pt[0];
        p.y = pt[1];
        const info = this.surfaceInfoAtWorld(p.x, p.y, eps);
        if (info) {
          p.nx = info.nx;
          p.ny = info.ny;
          const recess = 0.02;
          p.x -= info.nx * recess;
          p.y -= info.ny * recess;
        }
      }
    }
    if (mush.length) {
      const seed = (this.mapgen.getWorld().seed | 0) + 877;
      const points = this.sampleUndergroundPoints(mush.length, seed, "random");
      for (let i = 0; i < mush.length && i < points.length; i++) {
        const p = mush[i];
        const pt = points[i];
        p.x = pt[0];
        p.y = pt[1];
      }
    }
  }
  /**
   * Align no-caves/water debris onto standable surface using radial-graph standable points.
   * @returns {void}
   */
  _alignSurfaceDebris() {
    const cfg = this.getPlanetConfig ? this.getPlanetConfig() : null;
    if (!cfg || cfg.id !== "no_caves" && cfg.id !== "water") return;
    if (!this.props || !this.props.length) return;
    const debris = [];
    for (const p of this.props) {
      if (p.type === "boulder" || p.type === "ridge_spike") debris.push(p);
    }
    if (!debris.length) return;
    if (!this._standablePoints || !this._standablePoints.length) {
      this._standablePoints = this._buildStandablePoints();
    }
    const seed = (this.mapgen.getWorld().seed | 0) + (cfg.id === "no_caves" ? 1207 : 1239);
    const placement = cfg.id === "no_caves" ? "uniform" : "random";
    const minDist = cfg.id === "no_caves" ? 0.5 : 0.4;
    const points = this.sampleStandablePoints(debris.length, seed, placement, minDist, false);
    for (let i = 0; i < debris.length; i++) {
      const p = debris[i];
      const pt = points[i];
      if (!pt) {
        p.dead = true;
        continue;
      }
      p.x = pt[0];
      p.y = pt[1];
      const info = this.surfaceInfoAtWorld(p.x, p.y, 0.18);
      if (!info) continue;
      p.nx = info.nx;
      p.ny = info.ny;
      const sink = p.type === "boulder" ? 0.06 * (p.scale || 1) : 0.035 * (p.scale || 1);
      p.x -= info.nx * sink;
      p.y -= info.ny * sink;
      p.rot = Math.atan2(info.ny, info.nx) - Math.PI * 0.5;
    }
  }
  /**
   * Sample cave-wall attachment points from radial graph air/rock boundaries.
   * @param {number} count
   * @param {number} seed
   * @param {number} minDist
   * @returns {Array<{x:number,y:number,nx:number,ny:number}>}
   */
  _sampleCaveAttachmentPoints(count, seed, minDist = 0.45) {
    if (count <= 0) return [];
    const graph = this.radialGraph;
    const nodes = graph && graph.nodes ? graph.nodes : [];
    const neighbors = graph && graph.neighbors ? graph.neighbors : [];
    const air = this.airNodesBitmap;
    if (!nodes.length || !neighbors.length || !air || air.length !== nodes.length) {
      return [];
    }
    const cfg = this.getPlanetConfig ? this.getPlanetConfig() : null;
    const surfaceBand = cfg && cfg.defaults && typeof cfg.defaults.SURFACE_BAND === "number" ? cfg.defaults.SURFACE_BAND : 0;
    const surfaceR = this.planetParams.RMAX * (1 - surfaceBand);
    const rMin = Math.max(0.7, this.planetParams.RMAX * 0.12);
    const rMax = Math.max(rMin + 0.8, Math.min(this.planetParams.RMAX - 0.5, surfaceR - 0.25));
    const candidates = [];
    for (let i = 0; i < nodes.length; i++) {
      if (!air[i]) continue;
      const n = nodes[i];
      const r2 = Math.hypot(n.x, n.y);
      if (r2 < rMin || r2 > rMax) continue;
      const neigh = neighbors[i] || [];
      let rockNeighbor = null;
      let rockDist2 = Infinity;
      for (const e of neigh) {
        if (air[e.to]) continue;
        const nb = nodes[e.to];
        if (!nb) continue;
        const dx = n.x - nb.x;
        const dy = n.y - nb.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < rockDist2) {
          rockDist2 = d2;
          rockNeighbor = nb;
        }
      }
      if (!rockNeighbor) continue;
      const dxr = n.x - rockNeighbor.x;
      const dyr = n.y - rockNeighbor.y;
      const len = Math.hypot(dxr, dyr) || 1;
      const nx = dxr / len;
      const ny = dyr / len;
      let lo = { x: rockNeighbor.x, y: rockNeighbor.y };
      let hi = { x: n.x, y: n.y };
      for (let it = 0; it < 8; it++) {
        const mx = (lo.x + hi.x) * 0.5;
        const my = (lo.y + hi.y) * 0.5;
        if (this.airValueAtWorld(mx, my) > 0.5) {
          hi = { x: mx, y: my };
        } else {
          lo = { x: mx, y: my };
        }
      }
      candidates.push({ x: hi.x, y: hi.y, nx, ny });
    }
    const rand = mulberry32$1(seed);
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const tmp = candidates[i];
      candidates[i] = candidates[j];
      candidates[j] = tmp;
    }
    const picked = [];
    for (const c of candidates) {
      let tooClose = false;
      for (const p of picked) {
        const dx = c.x - p.x;
        const dy = c.y - p.y;
        if (dx * dx + dy * dy < minDist * minDist) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) continue;
      picked.push(c);
      if (picked.length >= count) break;
    }
    return picked;
  }
  /**
   * Align cavern debris to cave walls with normals from radial graph boundaries.
   * @returns {void}
   */
  _alignCavernDebris() {
    const cfg = this.getPlanetConfig ? this.getPlanetConfig() : null;
    if (!cfg || cfg.id !== "cavern") return;
    if (!this.props || !this.props.length) return;
    const stal = [];
    const boulders = [];
    const spikes = [];
    for (const p of this.props) {
      if (p.type === "stalactite") stal.push(p);
      else if (p.type === "boulder") boulders.push(p);
      else if (p.type === "ridge_spike") spikes.push(p);
    }
    const total = stal.length + boulders.length + spikes.length;
    if (!total) return;
    const seed = (this.mapgen.getWorld().seed | 0) + 1327;
    const points = this._sampleCaveAttachmentPoints(total, seed, 0.45);
    let cursor = 0;
    const applyAttach = (p, sinkMul) => {
      const pt = points[cursor++];
      if (!pt) {
        p.dead = true;
        return;
      }
      p.nx = pt.nx;
      p.ny = pt.ny;
      p.rot = Math.atan2(pt.ny, pt.nx) - Math.PI * 0.5;
      const sink = sinkMul * (p.scale || 1);
      p.x = pt.x - pt.nx * sink;
      p.y = pt.y - pt.ny * sink;
    };
    for (const p of stal) applyAttach(p, 0.025);
    for (const p of boulders) applyAttach(p, 0.1);
    for (const p of spikes) applyAttach(p, 0.05);
  }
  /**
   * Align mechanized factories/gates/tethers to standable surfaces.
   * @returns {void}
   */
  _alignMechanizedStructures() {
    const cfg = this.getPlanetConfig ? this.getPlanetConfig() : null;
    if (!cfg || cfg.id !== "mechanized") return;
    if (!this.props || !this.props.length) return;
    const coreR = this.getCoreRadius ? this.getCoreRadius() : 0;
    const factories = [];
    const gates = [];
    const tethers = [];
    for (const p of this.props) {
      if (p.type === "factory") factories.push(p);
      else if (p.type === "gate") gates.push(p);
      else if (p.type === "tether") tethers.push(p);
    }
    if (!factories.length && !gates.length && !tethers.length) return;
    if (!this._standablePoints || !this._standablePoints.length) {
      this._standablePoints = this._buildStandablePoints();
    }
    const seed = (this.mapgen.getWorld().seed | 0) + 1907;
    const rand = mulberry32$1(seed + 31);
    const coreMode = coreR > 0.5 && tethers.length > 0;
    if (coreMode) {
      for (const p of gates) {
        p.dead = true;
      }
      const innerR = Math.max(0.6, coreR + 0.55);
      const outerCap = Math.max(innerR + 0.8, this.planetParams.RMAX - 0.5);
      const standable = this._filterReachableStandable(this.getStandablePoints()).filter((p) => p[3] >= innerR + 0.9);
      const landableStandable = standable.filter((p) => this.isLandableAtWorld(p[0], p[1], 0.32, 0.2, 0.18));
      const factorySites = landableStandable.length ? landableStandable : standable;
      const usedAngles = [];
      const usedSites = /* @__PURE__ */ new Set();
      const wrapDiff = (a, b) => {
        let d = Math.abs(a - b);
        if (d > Math.PI) d = Math.abs(d - Math.PI * 2);
        return d;
      };
      const normalizeAngle = (x) => {
        let a = x % (Math.PI * 2);
        if (a < 0) a += Math.PI * 2;
        return a;
      };
      const evaluateTetherAngle = (ang) => {
        const nx = Math.cos(ang);
        const ny = Math.sin(ang);
        let firstAir = -1;
        let rockAfterAir = -1;
        for (let r2 = innerR + 0.25; r2 <= outerCap; r2 += 0.16) {
          const isAir2 = this.airValueAtWorld(nx * r2, ny * r2) > 0.5;
          if (isAir2) {
            if (firstAir < 0) firstAir = r2;
          } else if (firstAir >= 0) {
            rockAfterAir = r2;
            break;
          }
        }
        if (firstAir < 0 || rockAfterAir < 0) return null;
        return {
          nx,
          ny,
          outerR: Math.max(innerR + 0.9, rockAfterAir - 0.08)
        };
      };
      const pickFactoryStandableIndex = (ang, minR) => {
        if (!factorySites.length) return -1;
        let best = -1;
        let bestScore = Infinity;
        const thresholds = [0.42, 0.68];
        for (const th of thresholds) {
          best = -1;
          bestScore = Infinity;
          for (let i = 0; i < factorySites.length; i++) {
            if (usedSites.has(i)) continue;
            const sp = factorySites[i];
            if (sp[3] < minR) continue;
            const dAng = wrapDiff(sp[2], ang);
            if (dAng > th) continue;
            const score = dAng * 3 + Math.max(0, sp[3] - minR) * 0.03;
            if (score < bestScore) {
              bestScore = score;
              best = i;
            }
          }
          if (best >= 0) return best;
        }
        return -1;
      };
      const placeFactoryAtStandable = (factory, idx, iFactory) => {
        if (!factory || idx < 0 || idx >= factorySites.length) {
          if (factory) {
            factory.dead = true;
          }
          return;
        }
        usedSites.add(idx);
        const pt = factorySites[idx];
        factory.x = pt[0];
        factory.y = pt[1];
        const info = this.surfaceInfoAtWorld(factory.x, factory.y, 0.18);
        if (info) {
          factory.nx = info.nx;
          factory.ny = info.ny;
          factory.x -= info.nx * (0.05 * (factory.scale || 1));
          factory.y -= info.ny * (0.05 * (factory.scale || 1));
          factory.rot = Math.atan2(info.ny, info.nx) - Math.PI * 0.5;
        }
        factory.propId = iFactory;
        factory.hp = typeof factory.hp === "number" ? Math.max(1, factory.hp) : 5;
        factory.spawnCd = 6.5 + rand() * 4;
        factory.spawnT = rand() * factory.spawnCd;
      };
      for (let i = 0; i < tethers.length; i++) {
        const tether = tethers[i];
        let picked = null;
        const minAngSep = 0.4;
        const base = normalizeAngle(i / Math.max(1, tethers.length) * Math.PI * 2 + (rand() - 0.5) * 0.35);
        for (let attempt = 0; attempt < 56; attempt++) {
          const jitter = (rand() * 2 - 1) * (0.18 + 0.015 * attempt);
          const ang = normalizeAngle(base + jitter);
          if (usedAngles.some((a) => wrapDiff(a, ang) < minAngSep)) continue;
          const evalRes = evaluateTetherAngle(ang);
          if (!evalRes) continue;
          const fIdx = pickFactoryStandableIndex(ang, evalRes.outerR + 0.45);
          if (fIdx < 0) continue;
          picked = { ang, fIdx, ...evalRes };
          break;
        }
        if (!picked) {
          for (let attempt = 0; attempt < 140; attempt++) {
            const ang = normalizeAngle(rand() * Math.PI * 2);
            if (usedAngles.some((a) => wrapDiff(a, ang) < minAngSep)) continue;
            const evalRes = evaluateTetherAngle(ang);
            if (!evalRes) continue;
            const fIdx = pickFactoryStandableIndex(ang, evalRes.outerR + 0.25);
            if (fIdx < 0) continue;
            picked = { ang, fIdx, ...evalRes };
            break;
          }
        }
        if (!picked) {
          tether.dead = true;
          tether.hp = 0;
          continue;
        }
        usedAngles.push(picked.ang);
        const centerR = 0.5 * (innerR + picked.outerR);
        tether.x = picked.nx * centerR;
        tether.y = picked.ny * centerR;
        tether.nx = picked.nx;
        tether.ny = picked.ny;
        tether.rot = Math.atan2(picked.ny, picked.nx) - Math.PI * 0.5;
        tether.halfLength = Math.max(0.5, 0.5 * (picked.outerR - innerR));
        tether.halfWidth = Math.max(0.08, Math.min(0.18, typeof tether.halfWidth === "number" ? tether.halfWidth : 0.11 + rand() * 0.04));
        const factory = i < factories.length ? factories[i] : null;
        if (factory) {
          placeFactoryAtStandable(factory, picked.fIdx, i);
          tether.protectedBy = typeof factory.propId === "number" ? factory.propId : i;
        } else {
          tether.protectedBy = -1;
        }
      }
      for (let i = tethers.length; i < factories.length; i++) {
        const factory = factories[i];
        if (!factory) continue;
        let idx = -1;
        for (let j = 0; j < factorySites.length; j++) {
          if (usedSites.has(j)) continue;
          idx = j;
          break;
        }
        placeFactoryAtStandable(factory, idx, i);
      }
      return;
    }
    const factoryPts = this.sampleStandablePoints(factories.length, seed, "uniform", 1.5, false);
    for (let i = 0; i < factories.length; i++) {
      const p = factories[i];
      const pt = factoryPts[i];
      if (!pt) {
        p.dead = true;
        continue;
      }
      p.x = pt[0];
      p.y = pt[1];
      const info = this.surfaceInfoAtWorld(p.x, p.y, 0.18);
      if (info) {
        p.nx = info.nx;
        p.ny = info.ny;
        p.x -= info.nx * (0.05 * (p.scale || 1));
        p.y -= info.ny * (0.05 * (p.scale || 1));
        p.rot = Math.atan2(info.ny, info.nx) - Math.PI * 0.5;
      }
      p.propId = i;
      p.hp = typeof p.hp === "number" ? Math.max(1, p.hp) : 5;
      p.spawnCd = 6.5 + rand() * 4;
      p.spawnT = rand() * p.spawnCd;
    }
    const gatePts = this.sampleStandablePoints(gates.length, seed + 97, "clusters", 2, false);
    for (let i = 0; i < gates.length; i++) {
      const p = gates[i];
      const pt = gatePts[i];
      if (!pt) {
        p.dead = true;
        continue;
      }
      p.x = pt[0];
      p.y = pt[1];
      const info = this.surfaceInfoAtWorld(p.x, p.y, 0.18);
      if (info) {
        p.nx = info.nx;
        p.ny = info.ny;
        p.x -= info.nx * (0.03 * (p.scale || 1));
        p.y -= info.ny * (0.03 * (p.scale || 1));
        p.rot = Math.atan2(info.ny, info.nx) - Math.PI * 0.5;
      }
    }
  }
  /**
   * @param {number} count
   * @param {number} seed
   * @param {"uniform"|"random"|"clusters"} [placement]
   * @returns {Array<[number,number]>}
   */
  sampleUndergroundPoints(count, seed, placement = "random") {
    if (count <= 0) return [];
    const rand = mulberry32$1(seed);
    const points = [];
    const rMax = this.planetParams.RMAX * 0.9;
    const attempts = Math.max(200, count * 140);
    const angleAt = (i) => {
      if (placement === "uniform") {
        const base = i / count * Math.PI * 2;
        return base + (rand() - 0.5) * 0.35;
      }
      return rand() * Math.PI * 2;
    };
    for (let i = 0; i < attempts && points.length < count; i++) {
      const ang = angleAt(points.length);
      const r2 = Math.sqrt(rand()) * rMax;
      const x = Math.cos(ang) * r2;
      const y = Math.sin(ang) * r2;
      if (this.airValueAtWorld(x, y) > 0.5) continue;
      const eps = 0.18;
      if (this.airValueAtWorld(x + eps, y) > 0.5) continue;
      if (this.airValueAtWorld(x - eps, y) > 0.5) continue;
      if (this.airValueAtWorld(x, y + eps) > 0.5) continue;
      if (this.airValueAtWorld(x, y - eps) > 0.5) continue;
      points.push([x, y]);
    }
    return points;
  }
  /**
   * Keep ice shards attached to the nearest surface.
   * @returns {void}
   */
  _snapIceShardsToSurface() {
    if (!this.props || !this.props.length) return;
    for (const p of this.props) {
      if (p.type !== "ice_shard") continue;
      if (p.dead || typeof p.hp === "number" && p.hp <= 0) continue;
      let info = this.surfaceInfoAtWorld(p.x, p.y, 0.18);
      if (!info) {
        p.dead = true;
        p.hp = 0;
        continue;
      }
      if (this.airValueAtWorld(p.x, p.y) > 0.5) {
        for (let i = 0; i < 6; i++) {
          p.x -= info.nx * 0.06;
          p.y -= info.ny * 0.06;
          if (this.airValueAtWorld(p.x, p.y) <= 0.5) break;
        }
      } else {
        const res = this.nudgeOutOfTerrain(p.x, p.y, 0.8, 0.08, 0.18);
        if (res.ok) {
          p.x = res.x;
          p.y = res.y;
        }
      }
      info = this.surfaceInfoAtWorld(p.x, p.y, 0.18);
      if (!info) {
        p.dead = true;
        p.hp = 0;
        continue;
      }
      p.x -= info.nx * 0.03;
      p.y -= info.ny * 0.03;
    }
  }
  /**
   * Spread ice shards uniformly around the planet (ice worlds only).
   * @returns {void}
   */
  _spreadIceShardsUniform() {
    const cfg = this.getPlanetConfig ? this.getPlanetConfig() : null;
    if (!cfg || cfg.id !== "ice") return;
    if (!this.props || !this.props.length) return;
    const shards = [];
    for (const p of this.props) {
      if (p.type === "ice_shard") shards.push(p);
    }
    if (!shards.length) return;
    const seed = (this.mapgen.getWorld().seed | 0) + 331;
    const points = this.sampleSurfacePoints(shards.length, seed, "uniform");
    if (!points.length) return;
    const rand = mulberry32$1(seed + 17);
    for (let i = 0; i < shards.length; i++) {
      const p = shards[i];
      const pt = points[i % points.length];
      p.x = pt[0];
      p.y = pt[1];
      const info = this.surfaceInfoAtWorld(p.x, p.y, 0.18);
      if (info) {
        const tx = -info.ny;
        const ty = info.nx;
        const base = Math.atan2(ty, tx);
        p.rot = base + (rand() - 0.5) * 0.6;
      } else {
        p.rot = rand() * Math.PI * 2;
      }
    }
  }
  /**
   * @param {number} count
   * @param {number} seed
   * @param {"uniform"|"random"|"clusters"} [placement]
   * @returns {Array<[number,number]>}
   */
  sampleSurfacePoints(count, seed, placement = "random") {
    if (count <= 0) return [];
    const rand = mulberry32$1(seed);
    const points = [];
    const rMin = 1;
    const shell = this.planetParams.NO_CAVES && this.mapgen && this.mapgen.grid ? Math.max(this.mapgen.grid.cell * 1.5, 0.35) : 0;
    const rMax = Math.max(rMin + 0.5, this.planetParams.RMAX - shell - 0.15);
    const attempts = Math.max(200, count * 120);
    const angleAt = (i) => {
      if (placement === "uniform") {
        const base = i / count * Math.PI * 2;
        return base + (rand() - 0.5) * 0.35;
      }
      return rand() * Math.PI * 2;
    };
    for (let i = 0; i < attempts && points.length < count; i++) {
      const ang = angleAt(points.length);
      const surf = this._findSurfaceAtAngle(ang, rMin, rMax);
      if (!surf) continue;
      points.push([surf.x, surf.y]);
    }
    return points;
  }
  /**
   * Align turret pads to landable surface points.
   * @returns {void}
   */
  _alignTurretPadsToSurface() {
    if (!this.props || !this.props.length) return;
    const cfg = this.getPlanetConfig ? this.getPlanetConfig() : null;
    const forceHorizontalPads = !!(cfg && cfg.flags && cfg.flags.barrenPerimeter);
    const pads = [];
    for (const p of this.props) {
      if (p.type === "turret_pad") pads.push(p);
    }
    if (!pads.length) return;
    if (!this._standablePoints || !this._standablePoints.length) {
      this._standablePoints = this._buildStandablePoints();
    }
    const seed = (this.mapgen.getWorld().seed | 0) + 913;
    const minDist = GAME.MINER_MIN_SEP;
    const standable = this._standablePoints || [];
    const flatPool = standable.filter((pt) => {
      const info = this.surfaceInfoAtWorld(pt[0], pt[1], 0.18);
      if (!info) return false;
      const up = this._upDirAt(pt[0], pt[1]);
      if (!up) return false;
      if (info.slope > 0.08) return false;
      if (info.nx * up.ux + info.ny * up.uy < 0.98) return false;
      const tx = -info.ny;
      const ty = info.nx;
      const shoulder = 0.38;
      for (const dir of [-1, 1]) {
        const sx = pt[0] + tx * shoulder * dir;
        const sy = pt[1] + ty * shoulder * dir;
        if (this.airValueAtWorld(sx + info.nx * 0.12, sy + info.ny * 0.12) <= 0.5) return false;
        if (this.airValueAtWorld(sx - info.nx * 0.09, sy - info.ny * 0.09) > 0.5) return false;
      }
      return true;
    });
    const pool = flatPool.length >= pads.length ? flatPool : standable;
    let placed = [];
    if (pool !== standable) {
      const saved = this._standablePoints;
      this._standablePoints = pool;
      placed = this.sampleStandablePoints(pads.length, seed, "uniform", minDist, false);
      this._standablePoints = saved;
    } else {
      placed = this.sampleStandablePoints(pads.length, seed, "uniform", minDist, false);
    }
    for (let i = 0; i < pads.length; i++) {
      const p = pads[i];
      const pt = placed[i];
      if (!pt) {
        p.dead = true;
        p.hp = 0;
        continue;
      }
      p.x = pt[0];
      p.y = pt[1];
      if (forceHorizontalPads) {
        const up = this._upDirAt(p.x, p.y);
        if (up) {
          p.padNx = up.ux;
          p.padNy = up.uy;
          continue;
        }
      }
      const info = this.surfaceInfoAtWorld(p.x, p.y, 0.18);
      if (info) {
        p.padNx = info.nx;
        p.padNy = info.ny;
      } else {
        const up = this._upDirAt(p.x, p.y);
        if (up) {
          p.padNx = up.ux;
          p.padNy = up.uy;
        }
      }
    }
  }
  /**
   * @param {number} ang
   * @param {number} rMin
   * @param {number} rMax
   * @param {number} [steps]
   * @returns {{x:number,y:number,r:number}|null}
   */
  _findSurfaceAtAngle(ang, rMin, rMax, steps = 64) {
    const cx = Math.cos(ang);
    const cy = Math.sin(ang);
    let prevR = rMin;
    let prevAir = this.airValueAtWorld(cx * prevR, cy * prevR) > 0.5;
    for (let i = 1; i <= steps; i++) {
      const r2 = rMin + i / steps * (rMax - rMin);
      const curAir = this.airValueAtWorld(cx * r2, cy * r2) > 0.5;
      if (curAir !== prevAir) {
        let lo = prevR;
        let hi = r2;
        const loAir = prevAir;
        for (let it = 0; it < 8; it++) {
          const mid = (lo + hi) * 0.5;
          const midAir = this.airValueAtWorld(cx * mid, cy * mid) > 0.5;
          if (midAir === loAir) {
            lo = mid;
          } else {
            hi = mid;
          }
        }
        const baseR = (lo + hi) * 0.5;
        return { x: cx * baseR, y: cy * baseR, r: baseR };
      }
      prevR = r2;
      prevAir = curAir;
    }
    return null;
  }
  /**
   * @param {number} count
   * @param {number} seed
   * @param {number} rMin
   * @param {number} rMax
   * @param {"uniform"|"random"|"clusters"} [placement]
   * @returns {Array<[number,number]>}
   */
  sampleAirPoints(count, seed, rMin, rMax, placement = "random") {
    if (rMin >= rMax || count <= 0) return [];
    const rand = mulberry32$1(seed);
    const restrictReachability = !!this._spawnReachableMask;
    const points = [];
    const attempts = Math.max(200, count * 80);
    if (placement === "uniform") {
      const jitter = 0.35;
      for (let i = 0; i < count; i++) {
        const base = i / count * Math.PI * 2;
        const ang = base + (rand() - 0.5) * jitter;
        const rr = rMin * rMin + rand() * (rMax * rMax - rMin * rMin);
        const r2 = Math.sqrt(Math.max(0, rr));
        const x = r2 * Math.cos(ang);
        const y = r2 * Math.sin(ang);
        if (this.airValueAtWorld(x, y) <= 0.5) continue;
        if (restrictReachability && !this._isSpawnReachableAt(x, y)) continue;
        points.push([x, y]);
      }
      return points;
    }
    for (let i = 0; i < attempts && points.length < count; i++) {
      const ang = rand() * Math.PI * 2;
      const r2 = Math.sqrt(rMin * rMin + rand() * (rMax * rMax - rMin * rMin));
      const x = r2 * Math.cos(ang);
      const y = r2 * Math.sin(ang);
      if (this.airValueAtWorld(x, y) <= 0.5) continue;
      if (restrictReachability && !this._isSpawnReachableAt(x, y)) continue;
      points.push([x, y]);
    }
    return points;
  }
  /**
   * @param {number} count
   * @param {number} seed
   * @param {number} maxSlope
   * @param {number} clearance
   * @param {"uniform"|"random"|"clusters"} [placement]
   * @returns {Array<[number,number]>}
   */
  sampleLandablePoints(count, seed, maxSlope = 0.28, clearance = 0.2, placement = "random") {
    if (count <= 0) return [];
    const rand = mulberry32$1(seed);
    const points = [];
    const rMin = 1;
    const rMax = this.planetParams.RMAX + 1.2;
    const attempts = Math.max(200, count * 120);
    const angleAt = (i) => {
      if (placement === "uniform") {
        const base = i / count * Math.PI * 2;
        return base + (rand() - 0.5) * 0.35;
      }
      return rand() * Math.PI * 2;
    };
    for (let i = 0; i < attempts && points.length < count; i++) {
      const ang = angleAt(points.length);
      const surf = this._findSurfaceAtAngle(ang, rMin, rMax);
      if (!surf) continue;
      const nx = surf.x / (Math.hypot(surf.x, surf.y) || 1);
      const ny = surf.y / (Math.hypot(surf.x, surf.y) || 1);
      const x = surf.x + nx * 0.02;
      const y = surf.y + ny * 0.02;
      if (!this.isLandableAtWorld(x, y, maxSlope, clearance, 0.18)) continue;
      points.push([x, y]);
    }
    return points;
  }
  /**
   * Precompute a dense set of standable surface points based on mesh vertices.
   * @returns {Array<[number,number,number,number]>} [x,y,angle,r]
   */
  _buildStandablePoints() {
    const maxSlope = 0.28;
    const clearance = 0.2;
    const eps = 0.18;
    const sideClearance = 0.25;
    const graph = this.radialGraph;
    const points = [];
    if (!graph || !graph.nodes || !graph.nodes.length) return points;
    const passable = buildPassableMask(this.radial, graph, 0.5);
    for (let i = 0; i < graph.nodes.length; i++) {
      if (!passable[i]) continue;
      const n = graph.nodes[i];
      let inner = -1;
      let innerR = -1;
      for (const edge of graph.neighbors[i]) {
        const nb2 = graph.nodes[edge.to];
        if (!nb2 || nb2.r >= n.r) continue;
        if (passable[edge.to]) continue;
        if (nb2.r > innerR) {
          innerR = nb2.r;
          inner = edge.to;
        }
      }
      if (inner < 0) continue;
      const nb = graph.nodes[inner];
      const aOuter = this.radial.airValueAtWorld(n.x, n.y);
      const aInner = this.radial.airValueAtWorld(nb.x, nb.y);
      const denom = aOuter - aInner;
      const t = denom !== 0 ? Math.max(0, Math.min(1, (0.5 - aInner) / denom)) : 0.5;
      const sx = nb.x + (n.x - nb.x) * t;
      const sy = nb.y + (n.y - nb.y) * t;
      const info = this.surfaceInfoAtWorld(sx, sy, eps);
      if (!info) continue;
      const px = sx + info.nx * 0.02;
      const py = sy + info.ny * 0.02;
      if (!this.isStandableAtWorld(px, py, maxSlope, clearance, eps, sideClearance)) continue;
      const ang = Math.atan2(py, px);
      const r2 = Math.hypot(px, py);
      points.push([px, py, ang, r2]);
    }
    return points;
  }
  /**
   * Cached standable points. Do not mutate.
   * @returns {Array<[number,number,number,number]>} [x,y,angle,r]
   */
  getStandablePoints() {
    return this._standablePoints || [];
  }
  /**
   * Debug helper: count standable points that are not blocked by reservations.
   * @param {number} minDist
   * @returns {{standable:number, available:number, reservations:number}}
   */
  debugAvailableStandableCount(minDist = 0) {
    const points = this.getStandablePoints();
    const reservations = this._spawnReservations || [];
    let available = 0;
    for (const p of points) {
      if (this._isFarFromReservations(p[0], p[1], minDist, reservations)) {
        available++;
      }
    }
    return { standable: points.length, available, reservations: reservations.length };
  }
  /**
   * Debug helper: count prop types.
   * @returns {Record<string, number>}
   */
  debugPropCounts() {
    const counts = {};
    if (!this.props || !this.props.length) return counts;
    for (const p of this.props) {
      const key = p.type || "unknown";
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }
  /**
   * Reserve prop locations so spawns avoid them.
   * @returns {void}
   */
  _reserveSpawnPointsFromProps() {
    if (!this.props || !this.props.length) return;
    const base = Math.max(0.4, GAME.MINER_MIN_SEP * 0.6);
    for (const p of this.props) {
      if (p.dead) continue;
      if (p.type === "turret_pad") continue;
      this._spawnReservations.push({ x: p.x, y: p.y, r: base });
    }
  }
  /**
   * @returns {boolean}
   */
  _restrictToReachableSpawns() {
    const cfg = this.getPlanetConfig ? this.getPlanetConfig() : null;
    return !!(cfg && cfg.flags && cfg.flags.disableTerrainDestruction);
  }
  /**
   * Rebuild mask of air nodes reachable from near-surface air using dijkstra.
   * Used to avoid spawning required units in sealed pockets on non-destructible worlds.
   * @returns {void}
   */
  _rebuildSpawnReachabilityMask() {
    if (!this._restrictToReachableSpawns()) {
      this._spawnReachableMask = null;
      return;
    }
    const graph = this.radialGraph;
    const passable = this.airNodesBitmap;
    if (!graph || !graph.nodes || !graph.nodes.length || !passable || passable.length !== graph.nodes.length) {
      this._spawnReachableMask = null;
      return;
    }
    const nearSurfaceR = Math.max(0, (this.planetParams.RMAX || this.planetRadius || 0) - 0.9);
    const sources = [];
    for (let i = 0; i < graph.nodes.length; i++) {
      if (!passable[i]) continue;
      const n = graph.nodes[i];
      const r2 = Math.hypot(n.x, n.y);
      if (r2 >= nearSurfaceR) {
        sources.push(i);
      }
    }
    if (!sources.length) {
      for (let i = 0; i < passable.length; i++) {
        if (passable[i]) {
          sources.push(i);
          break;
        }
      }
    }
    if (!sources.length) {
      this._spawnReachableMask = null;
      return;
    }
    const dist = dijkstraMap(graph, sources, passable);
    const mask = new Uint8Array(passable.length);
    for (let i = 0; i < passable.length; i++) {
      if (!passable[i]) continue;
      if (Number.isFinite(dist[i])) mask[i] = 1;
    }
    this._spawnReachableMask = mask;
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  _isSpawnReachableAt(x, y) {
    if (!this._spawnReachableMask) return true;
    const iNode = this.nearestRadialNodeInAir(x, y);
    if (iNode < 0 || iNode >= this._spawnReachableMask.length) return false;
    return !!this._spawnReachableMask[iNode];
  }
  /**
   * @param {Array<[number,number,number,number]>} points
   * @returns {Array<[number,number,number,number]>}
   */
  _filterReachableStandable(points) {
    if (!this._spawnReachableMask) return points;
    const out = [];
    for (const p of points) {
      if (!this._isSpawnReachableAt(p[0], p[1])) continue;
      out.push(p);
    }
    return out;
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} minDist
   * @param {Array<{x:number,y:number,r:number}>} reservations
   * @returns {boolean}
   */
  _isFarFromReservations(x, y, minDist, reservations) {
    if (minDist <= 0 || !reservations.length) return true;
    for (const rsv of reservations) {
      const dx = x - rsv.x;
      const dy = y - rsv.y;
      const rr = Math.max(minDist, rsv.r || 0);
      if (dx * dx + dy * dy < rr * rr) return false;
    }
    return true;
  }
  /**
   * @param {Array<{x:number,y:number}>} points
   * @param {number} minDist
   * @returns {void}
   */
  reserveSpawnPoints(points, minDist = 0) {
    if (!points || !points.length) return;
    const r2 = Math.max(0, minDist);
    for (const p of points) {
      this._spawnReservations.push({ x: p.x, y: p.y, r: r2 });
    }
  }
  /**
   * Sample from cached standable points.
   * @param {number} count
   * @param {number} seed
   * @param {"uniform"|"random"|"clusters"} [placement]
   * @param {number} [minDist]
   * @param {boolean} [reserve]
   * @returns {Array<[number,number]>}
   */
  sampleStandablePoints(count, seed, placement = "random", minDist = 0, reserve = false) {
    if (count <= 0) return [];
    const points = this._filterReachableStandable(this.getStandablePoints());
    if (!points.length) return [];
    const rand = mulberry32$1(seed);
    const rMax = this.planetParams.RMAX || CFG.RMAX || 1;
    const bias = 0.35;
    const take = Math.min(count, points.length);
    const out = [];
    const indices = points.map((_, i) => i);
    const used = /* @__PURE__ */ new Set();
    const reservations = this._spawnReservations || [];
    if (placement === "uniform") {
      indices.sort((a, b) => points[a][2] - points[b][2]);
      const offset = rand();
      const step = Math.PI * 2 / take;
      const window2 = step * 0.65;
      for (let i = 0; i < take; i++) {
        const target = (i + offset) * step;
        let picked = -1;
        let pickedScore = Infinity;
        for (const idx of indices) {
          const p = points[idx];
          const ang = p[2];
          let d = Math.abs(ang - target);
          d = Math.min(d, Math.abs(d - Math.PI * 2));
          if (d > window2) continue;
          if (used.has(idx)) continue;
          if (!this._isFarFromReservations(p[0], p[1], minDist, reservations)) continue;
          let ok = true;
          for (const q of out) {
            const dx = p[0] - q[0];
            const dy = p[1] - q[1];
            if (dx * dx + dy * dy < minDist * minDist) {
              ok = false;
              break;
            }
          }
          if (!ok) continue;
          const r2 = p[3];
          const biasScore = r2 / rMax * bias;
          const score = d / window2 + biasScore;
          if (score < pickedScore) {
            pickedScore = score;
            picked = idx;
          }
        }
        if (picked >= 0) {
          const p = points[picked];
          used.add(picked);
          out.push([p[0], p[1]]);
          if (out.length >= take) break;
        }
      }
      if (out.length < take) {
        for (const idx of indices) {
          if (out.length >= take) break;
          if (used.has(idx)) continue;
          const p = points[idx];
          if (!this._isFarFromReservations(p[0], p[1], minDist, reservations)) continue;
          let ok = true;
          for (const q of out) {
            const dx = p[0] - q[0];
            const dy = p[1] - q[1];
            if (dx * dx + dy * dy < minDist * minDist) {
              ok = false;
              break;
            }
          }
          if (!ok) continue;
          used.add(idx);
          out.push([p[0], p[1]]);
        }
      }
    } else {
      if (placement === "clusters") {
        const clusterCount = Math.max(1, Math.floor(Math.sqrt(take)));
        const centers = [];
        for (let i = 0; i < indices.length && centers.length < clusterCount; i++) {
          const idx = indices[Math.floor(rand() * indices.length)];
          centers.push(points[idx][2]);
        }
        let clusterIndex = 0;
        const window2 = Math.PI * 2 / Math.max(6, clusterCount * 2);
        for (let i = 0; i < take; i++) {
          const target = centers[clusterIndex % centers.length];
          clusterIndex++;
          let picked = -1;
          let pickedScore = Infinity;
          for (const idx of indices) {
            if (used.has(idx)) continue;
            const p = points[idx];
            let d = Math.abs(p[2] - target);
            d = Math.min(d, Math.abs(d - Math.PI * 2));
            if (d > window2) continue;
            if (!this._isFarFromReservations(p[0], p[1], minDist, reservations)) continue;
            let ok = true;
            for (const q of out) {
              const dx = p[0] - q[0];
              const dy = p[1] - q[1];
              if (dx * dx + dy * dy < minDist * minDist) {
                ok = false;
                break;
              }
            }
            if (!ok) continue;
            const r2 = p[3];
            const biasScore = r2 / rMax * bias;
            const score = d / window2 + biasScore;
            if (score < pickedScore) {
              pickedScore = score;
              picked = idx;
            }
          }
          if (picked >= 0) {
            const p = points[picked];
            used.add(picked);
            out.push([p[0], p[1]]);
            if (out.length >= take) break;
          }
        }
        if (out.length < take) {
          for (const idx of indices) {
            if (out.length >= take) break;
            if (used.has(idx)) continue;
            const p = points[idx];
            if (!this._isFarFromReservations(p[0], p[1], minDist, reservations)) continue;
            let ok = true;
            for (const q of out) {
              const dx = p[0] - q[0];
              const dy = p[1] - q[1];
              if (dx * dx + dy * dy < minDist * minDist) {
                ok = false;
                break;
              }
            }
            if (!ok) continue;
            used.add(idx);
            out.push([p[0], p[1]]);
          }
        }
      } else {
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(rand() * (i + 1));
          const tmp = indices[i];
          indices[i] = indices[j];
          indices[j] = tmp;
        }
        for (const idx of indices) {
          const p = points[idx];
          if (used.has(idx)) continue;
          if (!this._isFarFromReservations(p[0], p[1], minDist, reservations)) continue;
          let ok = true;
          for (const q of out) {
            const dx = p[0] - q[0];
            const dy = p[1] - q[1];
            if (dx * dx + dy * dy < minDist * minDist) {
              ok = false;
              break;
            }
          }
          if (!ok) continue;
          const r2 = p[3];
          const w = 1 + bias * Math.max(0, 1 - r2 / rMax);
          const maxW = 1 + bias;
          if (rand() > w / maxW) continue;
          used.add(idx);
          out.push([p[0], p[1]]);
          if (out.length >= take) break;
        }
        if (out.length < take) {
          for (const idx of indices) {
            if (out.length >= take) break;
            if (used.has(idx)) continue;
            const p = points[idx];
            if (!this._isFarFromReservations(p[0], p[1], minDist, reservations)) continue;
            let ok = true;
            for (const q of out) {
              const dx = p[0] - q[0];
              const dy = p[1] - q[1];
              if (dx * dx + dy * dy < minDist * minDist) {
                ok = false;
                break;
              }
            }
            if (!ok) continue;
            used.add(idx);
            out.push([p[0], p[1]]);
          }
        }
      }
    }
    if (reserve && out.length) {
      const reservePoints = out.map((p) => ({ x: p[0], y: p[1] }));
      this.reserveSpawnPoints(reservePoints, minDist);
    }
    return out;
  }
  /**
   * Sample standable points with a minimum radius constraint.
   * @param {number} count
   * @param {number} seed
   * @param {"uniform"|"random"|"clusters"} [placement]
   * @param {number} [minDist]
   * @param {boolean} [reserve]
   * @param {number} [minR]
   * @returns {Array<[number,number]>}
   */
  sampleStandablePointsMinRadius(count, seed, placement = "random", minDist = 0, reserve = false, minR = 0) {
    if (count <= 0) return [];
    const basePoints = this._filterReachableStandable(this.getStandablePoints());
    if (!basePoints.length) return [];
    const points = minR > 0 ? basePoints.filter((p) => p[3] >= minR) : basePoints;
    if (!points.length) return [];
    const rand = mulberry32$1(seed);
    const rMax = this.planetParams.RMAX || CFG.RMAX || 1;
    const bias = 0.35;
    const take = Math.min(count, points.length);
    const out = [];
    const indices = points.map((_, i) => i);
    const used = /* @__PURE__ */ new Set();
    const reservations = this._spawnReservations || [];
    if (placement === "uniform") {
      indices.sort((a, b) => points[a][2] - points[b][2]);
      const offset = rand();
      const step = Math.PI * 2 / take;
      const window2 = step * 0.65;
      for (let i = 0; i < take; i++) {
        const target = (i + offset) * step;
        let picked = -1;
        let pickedScore = Infinity;
        for (const idx of indices) {
          const p = points[idx];
          const ang = p[2];
          let d = Math.abs(ang - target);
          d = Math.min(d, Math.abs(d - Math.PI * 2));
          if (d > window2) continue;
          if (used.has(idx)) continue;
          if (!this._isFarFromReservations(p[0], p[1], minDist, reservations)) continue;
          let ok = true;
          for (const q of out) {
            const dx = p[0] - q[0];
            const dy = p[1] - q[1];
            if (dx * dx + dy * dy < minDist * minDist) {
              ok = false;
              break;
            }
          }
          if (!ok) continue;
          const r2 = p[3];
          const biasScore = r2 / rMax * bias;
          const score = d / window2 + biasScore;
          if (score < pickedScore) {
            pickedScore = score;
            picked = idx;
          }
        }
        if (picked >= 0) {
          const p = points[picked];
          used.add(picked);
          out.push([p[0], p[1]]);
          if (out.length >= take) break;
        }
      }
      if (out.length < take) {
        for (const idx of indices) {
          if (out.length >= take) break;
          if (used.has(idx)) continue;
          const p = points[idx];
          if (!this._isFarFromReservations(p[0], p[1], minDist, reservations)) continue;
          let ok = true;
          for (const q of out) {
            const dx = p[0] - q[0];
            const dy = p[1] - q[1];
            if (dx * dx + dy * dy < minDist * minDist) {
              ok = false;
              break;
            }
          }
          if (!ok) continue;
          used.add(idx);
          out.push([p[0], p[1]]);
        }
      }
    } else {
      if (placement === "clusters") {
        const clusterCount = Math.max(1, Math.floor(Math.sqrt(take)));
        const centers = [];
        for (let i = 0; i < indices.length && centers.length < clusterCount; i++) {
          const idx = indices[Math.floor(rand() * indices.length)];
          centers.push(points[idx][2]);
        }
        let clusterIndex = 0;
        const window2 = Math.PI * 2 / Math.max(6, clusterCount * 2);
        for (let i = 0; i < take; i++) {
          const target = centers[clusterIndex % centers.length];
          clusterIndex++;
          let picked = -1;
          let pickedScore = Infinity;
          for (const idx of indices) {
            if (used.has(idx)) continue;
            const p = points[idx];
            let d = Math.abs(p[2] - target);
            d = Math.min(d, Math.abs(d - Math.PI * 2));
            if (d > window2) continue;
            if (!this._isFarFromReservations(p[0], p[1], minDist, reservations)) continue;
            let ok = true;
            for (const q of out) {
              const dx = p[0] - q[0];
              const dy = p[1] - q[1];
              if (dx * dx + dy * dy < minDist * minDist) {
                ok = false;
                break;
              }
            }
            if (!ok) continue;
            const r2 = p[3];
            const biasScore = r2 / rMax * bias;
            const score = d / window2 + biasScore;
            if (score < pickedScore) {
              pickedScore = score;
              picked = idx;
            }
          }
          if (picked >= 0) {
            const p = points[picked];
            used.add(picked);
            out.push([p[0], p[1]]);
            if (out.length >= take) break;
          }
        }
        if (out.length < take) {
          for (const idx of indices) {
            if (out.length >= take) break;
            if (used.has(idx)) continue;
            const p = points[idx];
            if (!this._isFarFromReservations(p[0], p[1], minDist, reservations)) continue;
            let ok = true;
            for (const q of out) {
              const dx = p[0] - q[0];
              const dy = p[1] - q[1];
              if (dx * dx + dy * dy < minDist * minDist) {
                ok = false;
                break;
              }
            }
            if (!ok) continue;
            used.add(idx);
            out.push([p[0], p[1]]);
          }
        }
      } else {
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(rand() * (i + 1));
          const tmp = indices[i];
          indices[i] = indices[j];
          indices[j] = tmp;
        }
        for (const idx of indices) {
          const p = points[idx];
          if (used.has(idx)) continue;
          if (!this._isFarFromReservations(p[0], p[1], minDist, reservations)) continue;
          let ok = true;
          for (const q of out) {
            const dx = p[0] - q[0];
            const dy = p[1] - q[1];
            if (dx * dx + dy * dy < minDist * minDist) {
              ok = false;
              break;
            }
          }
          if (!ok) continue;
          const r2 = p[3];
          const w = 1 + bias * Math.max(0, 1 - r2 / rMax);
          const maxW = 1 + bias;
          if (rand() > w / maxW) continue;
          used.add(idx);
          out.push([p[0], p[1]]);
          if (out.length >= take) break;
        }
        if (out.length < take) {
          for (const idx of indices) {
            if (out.length >= take) break;
            if (used.has(idx)) continue;
            const p = points[idx];
            if (!this._isFarFromReservations(p[0], p[1], minDist, reservations)) continue;
            let ok = true;
            for (const q of out) {
              const dx = p[0] - q[0];
              const dy = p[1] - q[1];
              if (dx * dx + dy * dy < minDist * minDist) {
                ok = false;
                break;
              }
            }
            if (!ok) continue;
            used.add(idx);
            out.push([p[0], p[1]]);
          }
        }
      }
    }
    if (reserve && out.length) {
      const reservePoints = out.map((p) => ({ x: p[0], y: p[1] }));
      this.reserveSpawnPoints(reservePoints, minDist);
    }
    return out;
  }
  /**
   * Turret placement helper (special case for barren perimeter pads).
   * @param {number} count
   * @param {number} seed
   * @param {"uniform"|"random"|"clusters"} [placement]
   * @returns {Array<[number,number]>}
   */
  sampleTurretPoints(count, seed, placement = "random", minDist = 0, reserve = false) {
    const cfg = this.getPlanetConfig ? this.getPlanetConfig() : null;
    if (cfg && cfg.flags && cfg.flags.barrenPerimeter) {
      const pads = [];
      for (const p of this.props || []) {
        if (p.type === "turret_pad" && !p.dead) pads.push([p.x, p.y]);
      }
      if (pads.length) {
        const rand = mulberry32$1(seed);
        for (let i = pads.length - 1; i > 0; i--) {
          const j = Math.floor(rand() * (i + 1));
          const tmp = pads[i];
          pads[i] = pads[j];
          pads[j] = tmp;
        }
        if (minDist <= 0) {
          return pads.slice(0, count);
        }
        const out2 = [];
        for (const p of pads) {
          if (!this._isFarFromReservations(p[0], p[1], minDist, this._spawnReservations)) continue;
          let ok = true;
          for (const q of out2) {
            const dx = p[0] - q[0];
            const dy = p[1] - q[1];
            if (dx * dx + dy * dy < minDist * minDist) {
              ok = false;
              break;
            }
          }
          if (!ok) continue;
          out2.push(p);
          if (out2.length >= count) break;
        }
        if (reserve && out2.length) {
          const reservePoints = out2.map((pt) => ({ x: pt[0], y: pt[1] }));
          this.reserveSpawnPoints(reservePoints, minDist);
        }
        return out2;
      }
    }
    const pool = this.sampleStandablePoints(Math.max(count * 3, count), seed, placement, minDist, false);
    const coreR = this.getCoreRadius ? this.getCoreRadius() : 0;
    const moltenOuter = this.planetParams && typeof this.planetParams.MOLTEN_RING_OUTER === "number" ? this.planetParams.MOLTEN_RING_OUTER : 0;
    const minR = Math.max(0, Math.max(coreR, moltenOuter) + 0.6);
    const out = minR > 0 ? pool.filter((p) => Math.hypot(p[0], p[1]) >= minR).slice(0, count) : pool.slice(0, count);
    if (reserve && out.length) {
      const reservePoints = out.map((pt) => ({ x: pt[0], y: pt[1] }));
      this.reserveSpawnPoints(reservePoints, minDist);
    }
    return out;
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {number}
   */
  airValueAtWorld(x, y) {
    return this.radial.airValueAtWorld(x, y);
  }
  /**
   * Collision-focused air sampling (filtered against outer-shell sliver spikes).
   * @param {number} x
   * @param {number} y
   * @returns {number}
   */
  airValueAtWorldForCollision(x, y) {
    if (this.radial && typeof this.radial.airValueAtWorldForCollision === "function") {
      return this.radial.airValueAtWorldForCollision(x, y);
    }
    return this.radial.airValueAtWorld(x, y);
  }
  /**
   * @returns {Array<[number,number,boolean,number]>|null}
   */
  debugPoints() {
    if (this._radialDebugDirty || !this._radialDebugPoints) {
      this._buildRadialDebugPoints();
    }
    return this._radialDebugPoints || null;
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} radius
   * @param {0|1} [val]
   * @returns {Float32Array|undefined}
   */
  applyAirEdit(x, y, radius, val = 1) {
    this.mapgen.setAirDisk(x, y, radius, val);
    let newAir = this.radial.updateAirFlags(true);
    this.airNodesBitmap = buildAirNodesBitmap(this.radialGraph, this.radial);
    this._rebuildSpawnReachabilityMask();
    this._radialDebugDirty = true;
    return newAir;
  }
  /**
   * Capture mutable runtime state needed for save/resume.
   * @returns {{
   *  air:Uint8Array,
   *  props:Array<any>,
   *  fog:{
   *    alpha:Float32Array,
   *    visible:Uint8Array,
   *    seen:Uint8Array,
   *    hold:Uint8Array,
   *    cursor:number
   *  }
   * }}
   */
  exportRuntimeState() {
    const world = this.mapgen.getWorld();
    const srcAir = world && world.air instanceof Uint8Array ? world.air : new Uint8Array(0);
    const air = new Uint8Array(srcAir);
    const props = Array.isArray(this.props) ? this.props.map((p) => clonePlainData(p)) : [];
    const fog = this.radial.exportFogState();
    return { air, props, fog };
  }
  /**
   * Restore mutable runtime state from save data.
   * @param {{
   *  air:Uint8Array,
   *  props?:Array<any>,
   *  fog?:{
   *    alpha:Float32Array,
   *    visible:Uint8Array,
   *    seen:Uint8Array,
   *    hold:Uint8Array,
   *    cursor:number
   *  }
   * }|null|undefined} state
   * @returns {Float32Array|undefined}
   */
  importRuntimeState(state) {
    if (!state || !(state.air instanceof Uint8Array)) {
      return void 0;
    }
    const world = this.mapgen.getWorld();
    if (!world || !(world.air instanceof Uint8Array) || world.air.length !== state.air.length) {
      return void 0;
    }
    world.air.set(state.air);
    const newAir = this.radial.updateAirFlags(true);
    this.airNodesBitmap = buildAirNodesBitmap(this.radialGraph, this.radial);
    this._rebuildSpawnReachabilityMask();
    this._radialDebugDirty = true;
    if (Array.isArray(state.props) && Array.isArray(this.props)) {
      const count = Math.min(this.props.length, state.props.length);
      for (let i = 0; i < count; i++) {
        const src = state.props[i];
        const dst = this.props[i];
        if (!src || typeof src !== "object" || !dst || typeof dst !== "object") continue;
        for (const key of Object.keys(dst)) {
          if (!Object.prototype.hasOwnProperty.call(src, key)) {
            delete dst[key];
          }
        }
        for (const key of Object.keys(src)) {
          dst[key] = clonePlainData(src[key]);
        }
      }
    }
    if (state.fog) {
      this.radial.importFogState(state.fog);
    }
    return newAir;
  }
  /**
   * @param {number} shipX
   * @param {number} shipY
   * @returns {Float32Array|undefined}
   */
  updateFog(shipX, shipY) {
    this.radial.updateFog(shipX, shipY);
    return this.radial.fogAlpha();
  }
  /**
   * Update fog for current render mode and return radial fog alpha when applicable.
   * @param {number} shipX
   * @param {number} shipY
   * @returns {Float32Array|undefined}
   */
  updateFogForRender(shipX, shipY) {
    return this.updateFog(shipX, shipY);
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  fogVisibleAt(x, y) {
    return this.radial.fogVisibleAt(x, y);
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  fogSeenAt(x, y) {
    return this.radial.fogSeenAt(x, y);
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {number}
   */
  fogAlphaAtWorld(x, y) {
    return this.radial.fogAlphaAtWorld(x, y);
  }
  /**
   * Find closest point on world
   * Note: Does not work very far from the surface
   * @param {number} x
   * @param {number} y
   * @returns {{x:number, y:number}|null}
   */
  posClosest(x, y) {
    const eps = 0.1;
    const dist = this.radial.airValueAtWorld(x, y) - 0.5;
    const gdx = this.radial.airValueAtWorld(x + eps, y) - this.radial.airValueAtWorld(x - eps, y);
    const gdy = this.radial.airValueAtWorld(x, y + eps) - this.radial.airValueAtWorld(x, y - eps);
    const g = Math.hypot(gdx, gdy);
    if (g < 1e-4) {
      return null;
    }
    const step = -dist / g;
    return { x: x + gdx * step, y: y + gdy * step };
  }
  /**
   * Closest point variant for guide-path construction near the outer ring.
   * @param {number} x
   * @param {number} y
   * @returns {{x:number, y:number}|null}
   */
  _posClosestForPath(x, y) {
    const eps = 0.1;
    const air = (px, py) => this.radial.airValueAtWorldForPath(px, py);
    const dist = air(x, y) - 0.5;
    const gdx = air(x + eps, y) - air(x - eps, y);
    const gdy = air(x, y + eps) - air(x, y - eps);
    const g = Math.hypot(gdx, gdy);
    if (g < 1e-4) {
      return null;
    }
    const step = -dist / g;
    return { x: x + gdx * step, y: y + gdy * step };
  }
  /**
   * Build a guide path to the closest point on the terrain to the query position
   * @param {number} x
   * @param {number} y
   * @param {number} maxDistance
   * @returns {{path:Array<{x:number, y:number}>, indexClosest: number}|null}
   */
  surfaceGuidePathTo(x, y, maxDistance) {
    const projectToRadialSurface = (sx, sy) => {
      const pos2 = this.posClosest(sx, sy);
      if (!pos2) return null;
      const info = this.surfaceInfoAtWorld(pos2.x, pos2.y, 0.18);
      if (!info) return null;
      const airProbe = 0.08;
      const ax = pos2.x + info.nx * airProbe;
      const ay = pos2.y + info.ny * airProbe;
      const bx = pos2.x - info.nx * airProbe;
      const by = pos2.y - info.ny * airProbe;
      if (this.airValueAtWorld(ax, ay) <= 0.5) return null;
      if (this.airValueAtWorld(bx, by) > 0.5) return null;
      return pos2;
    };
    const posRaw = this._posClosestForPath(x, y);
    if (!posRaw) return null;
    const pos = projectToRadialSurface(posRaw.x, posRaw.y);
    if (!pos) return null;
    if (Math.hypot(pos.x, pos.y) > this.planetRadius + 0.02) return null;
    const path = [{ x: pos.x, y: pos.y }];
    let indexClosest = 0;
    const tryGetNormalAt = (x2, y2) => {
      const eps = 0.18;
      const gdx = this.radial.airValueAtWorldForPath(x2 + eps, y2) - this.radial.airValueAtWorldForPath(x2 - eps, y2);
      const gdy = this.radial.airValueAtWorldForPath(x2, y2 + eps) - this.radial.airValueAtWorldForPath(x2, y2 - eps);
      const len = Math.hypot(gdx, gdy);
      if (len < 1e-6) return null;
      return { nx: gdx / len, ny: gdy / len };
    };
    const tryGetStep = (px, py, stepSize2) => {
      let n = tryGetNormalAt(px, py);
      if (!n) return null;
      const r2 = Math.hypot(px, py) || 1;
      let dotUp = (px * n.nx + py * n.ny) / r2;
      if (dotUp < 0) {
        n = { nx: -n.nx, ny: -n.ny };
        dotUp = -dotUp;
      }
      if (dotUp <= 0.5) return null;
      const qx = px + n.ny * -stepSize2;
      const qy = py + n.nx * stepSize2;
      const posNextRaw = this._posClosestForPath(qx, qy);
      if (!posNextRaw) return null;
      const posNext = projectToRadialSurface(posNextRaw.x, posNextRaw.y);
      if (!posNext) return null;
      if (Math.hypot(posNext.x, posNext.y) > this.planetRadius + 0.02) return null;
      if (Math.hypot(posNext.x - x, posNext.y - y) > maxDistance) return null;
      return { x: posNext.x, y: posNext.y };
    };
    const stepSize = 0.25;
    const maxPointsPos = 16;
    while (path.length < maxPointsPos) {
      const posExtend = tryGetStep(path[0].x, path[0].y, stepSize);
      if (!posExtend) break;
      const head = path[0];
      if (Math.hypot(posExtend.x - head.x, posExtend.y - head.y) < 1e-4) break;
      path.unshift(posExtend);
      ++indexClosest;
    }
    const maxPointsNeg = path.length + 15;
    while (path.length < maxPointsNeg) {
      const posExtend = tryGetStep(path[path.length - 1].x, path[path.length - 1].y, -stepSize);
      if (!posExtend) break;
      const tail = path[path.length - 1];
      if (Math.hypot(posExtend.x - tail.x, posExtend.y - tail.y) < 1e-4) break;
      path.push(posExtend);
    }
    return { path, indexClosest };
  }
  /**
   * Surface normal and slope info at world point.
   * Returns slope as (1 - dot(normal, gravityDir)), so 0 is perfectly flat.
   * @param {number} x
   * @param {number} y
   * @param {number} [eps]
   * @returns {{nx:number, ny:number, slope:number}|null}
   */
  surfaceInfoAtWorld(x, y, eps = 0.18) {
    const up = this._upDirAt(x, y);
    if (!up) return null;
    const n = this.radialNormalAtWorld(x, y, eps);
    if (!n) return null;
    let dot = n.nx * up.ux + n.ny * up.uy;
    if (dot < 0) {
      n.nx = -n.nx;
      n.ny = -n.ny;
      dot = -dot;
    }
    return { nx: n.nx, ny: n.ny, slope: 1 - dot };
  }
  /**
   * Walkability test using surface slope (lower is flatter).
   * @param {number} x
   * @param {number} y
   * @param {number} maxSlope
   * @param {number} [eps]
   * @returns {boolean}
   */
  isWalkableAtWorld(x, y, maxSlope = 0.35, eps = 0.18) {
    const info = this.surfaceInfoAtWorld(x, y, eps);
    if (!info) return false;
    return info.slope <= maxSlope;
  }
  /**
   * Landable check using slope and a small clearance test.
   * @param {number} x
   * @param {number} y
   * @param {number} maxSlope
   * @param {number} clearance
   * @param {number} [eps]
   * @returns {boolean}
   */
  isLandableAtWorld(x, y, maxSlope = 0.4, clearance = 0.2, eps = 0.18) {
    const info = this.surfaceInfoAtWorld(x, y, eps);
    if (!info) return false;
    if (info.slope > maxSlope) return false;
    const ax = x + info.nx * clearance;
    const ay = y + info.ny * clearance;
    const bx = x - info.nx * clearance;
    const by = y - info.ny * clearance;
    return this.airValueAtWorld(ax, ay) > 0.5 && this.airValueAtWorld(bx, by) <= 0.5;
  }
  /**
   * Standable check: air above and on both sides, rock behind.
   * @param {number} x
   * @param {number} y
   * @param {number} maxSlope
   * @param {number} clearance
   * @param {number} [eps]
   * @param {number} [sideClearance]
   * @returns {boolean}
   */
  isStandableAtWorld(x, y, maxSlope = 0.4, clearance = 0.2, eps = 0.18, sideClearance = 0.25) {
    const info = this.surfaceInfoAtWorld(x, y, eps);
    if (!info) return false;
    if (info.slope > maxSlope) return false;
    const nx = info.nx;
    const ny = info.ny;
    const tx = -ny;
    const ty = nx;
    const ax = x + nx * clearance;
    const ay = y + ny * clearance;
    const bx = x - nx * clearance;
    const by = y - ny * clearance;
    const lx = x + tx * sideClearance;
    const ly = y + ty * sideClearance;
    const rx = x - tx * sideClearance;
    const ry = y - ty * sideClearance;
    return this.airValueAtWorld(ax, ay) > 0.5 && this.airValueAtWorld(lx, ly) > 0.5 && this.airValueAtWorld(rx, ry) > 0.5 && this.airValueAtWorld(bx, by) <= 0.5;
  }
  /**
   * Nudge a point out of rock along the local surface normal.
   * Returns ok=false if it stays buried after maxPush.
   * @param {number} x
   * @param {number} y
   * @param {number} [maxPush]
   * @param {number} [step]
   * @param {number} [eps]
   * @returns {{x:number,y:number,ok:boolean}}
   */
  nudgeOutOfTerrain(x, y, maxPush = 0.6, step = 0.06, eps = 0.18) {
    if (this.airValueAtWorld(x, y) > 0.5) {
      return { x, y, ok: true };
    }
    const steps = Math.max(1, Math.ceil(maxPush / step));
    let cx = x;
    let cy = y;
    for (let i = 0; i < steps; i++) {
      const n = this.radialNormalAtWorld(cx, cy, eps);
      if (!n) break;
      cx += n.nx * step;
      cy += n.ny * step;
      if (this.airValueAtWorld(cx, cy) > 0.5) {
        return { x: cx, y: cy, ok: true };
      }
    }
    return { x: cx, y: cy, ok: false };
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {{ux:number,uy:number}|null}
   */
  _upDirAt(x, y) {
    const r2 = Math.hypot(x, y);
    if (r2 < 1e-6) return null;
    return { ux: x / r2, uy: y / r2 };
  }
  /**
   * Normal from radial occupancy gradient.
   * @param {number} x
   * @param {number} y
   * @param {number} eps
   * @returns {{nx:number,ny:number}|null}
   */
  radialNormalAtWorld(x, y, eps) {
    const gdx = this.radial.airValueAtWorld(x + eps, y) - this.radial.airValueAtWorld(x - eps, y);
    const gdy = this.radial.airValueAtWorld(x, y + eps) - this.radial.airValueAtWorld(x, y - eps);
    const len = Math.hypot(gdx, gdy);
    if (len < 1e-6) return null;
    return { nx: gdx / len, ny: gdy / len };
  }
  /**
   * Update fog for current mode and push fog resources to renderer.
   * @param {{updateFog:(fog:Float32Array)=>void}} renderer
   * @param {number} shipX
   * @param {number} shipY
   * @returns {void}
   */
  syncRenderFog(renderer2, shipX, shipY) {
    const fog = this.updateFogForRender(shipX, shipY);
    if (fog) renderer2.updateFog(fog);
  }
  /**
   * Evaluate gravitational acceleration at a position relative to the planet
   * @param {number} x
   * @param {number} y
   * @returns {{x:number,y:number}}
   */
  gravityAt(x, y) {
    const rPlanet = this.planetRadius;
    const r2 = Math.max(x * x + y * y, rPlanet * rPlanet);
    const r3 = Math.sqrt(r2);
    const a = -this.gravitationalConstant / (r2 * r3);
    return { x: x * a, y: y * a };
  }
  /**
   * Position and velocity on an orbit (specified by closest approach, orbit eccentricity, current angle, and direction)
   * @param {number} perigee
   * @param {number} eccentricity
   * @param {number} angle
   * @param {boolean} directionCCW
   * @returns {{x: number, y: number, vx: number, vy: number}}
   */
  orbitStateFromElements(perigee, eccentricity, angle, directionCCW) {
    angle *= directionCCW ? -1 : 1;
    const p = perigee * (1 + eccentricity);
    const r2 = p / (1 + eccentricity * Math.cos(angle));
    const x = r2 * Math.cos(angle);
    const y = r2 * Math.sin(angle);
    const vScale = Math.sqrt(this.gravitationalConstant / p) * (directionCCW ? -1 : 1);
    const vx = vScale * Math.sin(angle);
    const vy = -vScale * (eccentricity + Math.cos(angle));
    return { x, y, vx, vy };
  }
  /**
   * Evaluate perigee and apogee height for orbit defined by a position and velocity
   * @param {number} x
   * @param {number} y
   * @param {number} vx
   * @param {number} vy
   * @returns {{rPerigee: number, rApogee: number}}
   */
  perigeeAndApogee(x, y, vx, vy) {
    const rCrossV = x * vy - y * vx;
    const r2 = Math.hypot(x, y);
    const gravMu = this.gravitationalConstant;
    const eccentricityX = vy * rCrossV / gravMu - x / r2;
    const eccentricityY = -vx * rCrossV / gravMu - y / r2;
    const eccentricity = Math.hypot(eccentricityX, eccentricityY);
    if (eccentricity >= 1) {
      return { rPerigee: 0, rApogee: Infinity };
    }
    const vSqr = vx * vx + vy * vy;
    const specificEnergy = vSqr / 2 - gravMu / r2;
    const a = -gravMu / (2 * specificEnergy);
    const rPerigee = a * (1 - eccentricity);
    const rApogee = a * (1 + eccentricity);
    return { rPerigee, rApogee };
  }
  /**
   * @returns {number}
   */
  _radialNodeCount() {
    let nodes = 0;
    for (const ring of this.radial.rings) {
      if (ring) nodes += ring.length;
    }
    return nodes;
  }
  /**
   * @returns {void}
   */
  _buildRadialDebugPoints() {
    const pts = [];
    for (const ring of this.radial.rings) {
      if (!ring) continue;
      for (const v of ring) {
        const air = v.air > 0.5;
        pts.push([v.x, v.y, air, v.air]);
      }
    }
    this._radialDebugPoints = pts;
    this._radialDebugDirty = false;
  }
}
function buildAirNodesBitmap(radialGraph, ringMesh) {
  const passable = new Uint8Array(radialGraph.nodes.length);
  for (let i = 0; i < radialGraph.nodes.length; i++) {
    const n = radialGraph.nodes[i];
    passable[i] = ringMesh.rings[n.r][n.i].air > 0.5 ? 1 : 0;
  }
  return passable;
}
function clonePlainData(value) {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((v) => clonePlainData(v));
  }
  const out = {};
  for (const key of Object.keys(value)) {
    const v = value[key];
    if (typeof v === "function" || v === void 0) continue;
    out[key] = clonePlainData(v);
  }
  return out;
}
function r(min, max) {
  return { min, max };
}
const PLANET_CONFIGS = [
  {
    id: "barren_pickup",
    label: "Barren Perimeter",
    enemyCountBase: 0,
    enemyCountPerLevel: 0,
    enemyCountCap: 0,
    enemyPlacement: "uniform",
    objective: { type: "extract", count: 5 },
    minerCountBase: 5,
    minerCountPerLevel: 0,
    minerCountCap: 5,
    platformCount: 5,
    enemyAllow: [],
    notes: "Solid interior, external topography only, miner pickup.",
    flags: { noCaves: true, barrenPerimeter: true },
    defaults: {
      ROCK_DARK: [0.2, 0.2, 0.22],
      ROCK_LIGHT: [0.46, 0.46, 0.5],
      AIR_DARK: [0.14, 0.14, 0.16],
      AIR_LIGHT: [0.26, 0.26, 0.3],
      SURFACE_ROCK_DARK: [0.24, 0.24, 0.26],
      SURFACE_ROCK_LIGHT: [0.6, 0.6, 0.66],
      SURFACE_BAND: 0.12
    },
    ranges: {
      RMAX: r(10, 12),
      PAD: r(1, 1.4),
      MOTHERSHIP_ORBIT_HEIGHT: r(8, 12),
      SURFACE_G: r(1.6, 2.2),
      DRAG_MULT: r(0.9, 1.1),
      THRUST_MULT: r(0.95, 1.1),
      TURN_RATE_MULT: r(0.95, 1.1),
      LAND_FRICTION_MULT: r(0.7, 1),
      CRASH_SPEED_MULT: r(0.9, 1.1),
      LAND_SPEED_MULT: r(0.9, 1.1),
      TARGET_FINAL_AIR: r(0, 0),
      CA_STEPS: r(1, 1),
      AIR_KEEP_N8: r(3, 3),
      ROCK_TO_AIR_N8: r(6, 6),
      ENTRANCES: r(0, 0),
      ENTRANCE_OUTER: r(0, 0),
      ENTRANCE_INNER: r(0, 0),
      WARP_F: r(0, 0),
      WARP_A: r(0, 0),
      BASE_F: r(0, 0),
      VEIN_F: r(0, 0),
      VEIN_THRESH: r(0, 0),
      VEIN_DILATE: r(0, 0),
      VIS_RANGE: r(6, 7.5),
      FOG_SEEN_ALPHA: r(0.5, 0.6),
      FOG_UNSEEN_ALPHA: r(0.8, 0.9),
      FOG_BUDGET_TRIS: r(220, 320),
      CORE_RADIUS: r(0, 0),
      CORE_DPS: r(0, 0),
      ICE_CRUST_THICKNESS: r(0, 0),
      WATER_LEVEL: r(0, 0),
      MOLTEN_RING_INNER: r(0, 0),
      MOLTEN_RING_OUTER: r(0, 0),
      EXCAVATE_RINGS: r(0, 0),
      EXCAVATE_RING_THICKNESS: r(0, 0),
      TOPO_BAND: r(2, 3),
      TOPO_AMP: r(1.5, 3.5),
      TOPO_FREQ: r(2, 3.2),
      TOPO_OCTAVES: r(3, 4)
    }
  },
  {
    id: "barren_clear",
    label: "Ominous Rock",
    enemyCountBase: 5,
    enemyCountPerLevel: 0,
    enemyCountCap: 5,
    enemyPlacement: "uniform",
    objective: { type: "clear", count: 5 },
    minerCountBase: 5,
    minerCountPerLevel: 0,
    minerCountCap: 5,
    platformCount: 10,
    enemyAllow: ["turret"],
    notes: "Solid interior, external topography only, clear turrets; optional miner rescue.",
    flags: { noCaves: true, barrenPerimeter: true },
    defaults: {
      ROCK_DARK: [0.2, 0.2, 0.22],
      ROCK_LIGHT: [0.46, 0.46, 0.5],
      AIR_DARK: [0.14, 0.14, 0.16],
      AIR_LIGHT: [0.26, 0.26, 0.3],
      SURFACE_ROCK_DARK: [0.24, 0.24, 0.26],
      SURFACE_ROCK_LIGHT: [0.6, 0.6, 0.66],
      SURFACE_BAND: 0.12
    },
    ranges: {
      RMAX: r(10, 12),
      PAD: r(1, 1.4),
      MOTHERSHIP_ORBIT_HEIGHT: r(8, 12),
      SURFACE_G: r(1.6, 2.2),
      DRAG_MULT: r(0.9, 1.1),
      THRUST_MULT: r(0.95, 1.1),
      TURN_RATE_MULT: r(0.95, 1.1),
      LAND_FRICTION_MULT: r(0.7, 1),
      CRASH_SPEED_MULT: r(0.9, 1.1),
      LAND_SPEED_MULT: r(0.9, 1.1),
      TARGET_FINAL_AIR: r(0, 0),
      CA_STEPS: r(1, 1),
      AIR_KEEP_N8: r(3, 3),
      ROCK_TO_AIR_N8: r(6, 6),
      ENTRANCES: r(0, 0),
      ENTRANCE_OUTER: r(0, 0),
      ENTRANCE_INNER: r(0, 0),
      WARP_F: r(0, 0),
      WARP_A: r(0, 0),
      BASE_F: r(0, 0),
      VEIN_F: r(0, 0),
      VEIN_THRESH: r(0, 0),
      VEIN_DILATE: r(0, 0),
      VIS_RANGE: r(6, 7.5),
      FOG_SEEN_ALPHA: r(0.5, 0.6),
      FOG_UNSEEN_ALPHA: r(0.8, 0.9),
      FOG_BUDGET_TRIS: r(220, 320),
      CORE_RADIUS: r(0, 0),
      CORE_DPS: r(0, 0),
      ICE_CRUST_THICKNESS: r(0, 0),
      WATER_LEVEL: r(0, 0),
      MOLTEN_RING_INNER: r(0, 0),
      MOLTEN_RING_OUTER: r(0, 0),
      EXCAVATE_RINGS: r(0, 0),
      EXCAVATE_RING_THICKNESS: r(0, 0),
      TOPO_BAND: r(2.8, 4),
      TOPO_AMP: r(1.8, 2.6),
      TOPO_FREQ: r(2.9, 3.6),
      TOPO_OCTAVES: r(4, 5)
    }
  },
  {
    id: "no_caves",
    label: "Barren Ridge",
    enemyCountBase: 5,
    enemyCountPerLevel: 5,
    enemyCountCap: 30,
    enemyPlacement: "random",
    objective: { type: "extract", count: 0 },
    minerCountBase: 5,
    minerCountPerLevel: 2,
    minerCountCap: 30,
    platformCount: 10,
    enemyAllow: ["hunter", "ranger", "crawler"],
    notes: "Solid interior with strong hills/valleys and no cave networks.",
    flags: { noCaves: true },
    defaults: {
      ROCK_DARK: [0.4, 0.26, 0.16],
      ROCK_LIGHT: [0.62, 0.42, 0.26],
      AIR_DARK: [0.16, 0.16, 0.16],
      AIR_LIGHT: [0.3, 0.3, 0.3],
      SURFACE_ROCK_DARK: [0.45, 0.32, 0.2],
      SURFACE_ROCK_LIGHT: [0.7, 0.52, 0.32],
      SURFACE_BAND: 0.1
    },
    ranges: {
      RMAX: r(16, 22),
      PAD: r(1, 1.6),
      MOTHERSHIP_ORBIT_HEIGHT: r(12, 20),
      SURFACE_G: r(1.8, 2.6),
      DRAG_MULT: r(0.9, 1.2),
      THRUST_MULT: r(0.9, 1.15),
      TURN_RATE_MULT: r(0.9, 1.15),
      LAND_FRICTION_MULT: r(0.8, 1.2),
      CRASH_SPEED_MULT: r(0.9, 1.1),
      LAND_SPEED_MULT: r(0.9, 1.1),
      TARGET_FINAL_AIR: r(0.12, 0.22),
      CA_STEPS: r(1, 2),
      AIR_KEEP_N8: r(3, 4),
      ROCK_TO_AIR_N8: r(6, 7),
      ENTRANCES: r(1, 3),
      ENTRANCE_OUTER: r(0.55, 0.75),
      ENTRANCE_INNER: r(0.38, 0.6),
      WARP_F: r(0.035, 0.055),
      WARP_A: r(1.4, 2),
      BASE_F: r(0.09, 0.12),
      VEIN_F: r(0.12, 0.16),
      VEIN_THRESH: r(0.8, 0.9),
      VEIN_DILATE: r(1, 2),
      VIS_RANGE: r(6.2, 7.8),
      FOG_SEEN_ALPHA: r(0.5, 0.62),
      FOG_UNSEEN_ALPHA: r(0.8, 0.9),
      FOG_BUDGET_TRIS: r(220, 360),
      CORE_RADIUS: r(0, 0),
      CORE_DPS: r(0, 0),
      ICE_CRUST_THICKNESS: r(0, 0),
      WATER_LEVEL: r(0, 0),
      MOLTEN_RING_INNER: r(0, 0),
      MOLTEN_RING_OUTER: r(0, 0),
      EXCAVATE_RINGS: r(0, 0),
      EXCAVATE_RING_THICKNESS: r(0, 0),
      TOPO_BAND: r(3.2, 4.8),
      TOPO_AMP: r(2.2, 3.4),
      TOPO_FREQ: r(1.1, 1.8),
      TOPO_OCTAVES: r(3, 4)
    }
  },
  {
    id: "molten",
    label: "Molten Core",
    enemyCountBase: 5,
    enemyCountPerLevel: 5,
    enemyCountCap: 30,
    enemyPlacement: "random",
    objective: { type: "extract", count: 0 },
    minerCountBase: 5,
    minerCountPerLevel: 2,
    minerCountCap: 30,
    platformCount: 12,
    enemyAllow: ["hunter", "ranger", "crawler", "turret"],
    notes: "Heat hazard in inner radius.",
    flags: { disableTerrainDestruction: true },
    defaults: {
      ROCK_DARK: [0.38, 0.12, 0.1],
      ROCK_LIGHT: [0.78, 0.26, 0.18],
      AIR_DARK: [0.2, 0.14, 0.16],
      AIR_LIGHT: [0.38, 0.22, 0.26],
      SURFACE_ROCK_DARK: [0.24, 0.1, 0.1],
      SURFACE_ROCK_LIGHT: [0.44, 0.18, 0.16],
      SURFACE_BAND: 0.08
    },
    ranges: {
      RMAX: r(14, 21),
      PAD: r(1, 1.5),
      MOTHERSHIP_ORBIT_HEIGHT: r(11, 19),
      SURFACE_G: r(2, 2.8),
      DRAG_MULT: r(0.9, 1.2),
      THRUST_MULT: r(0.9, 1.1),
      TURN_RATE_MULT: r(0.9, 1.1),
      LAND_FRICTION_MULT: r(0.9, 1.1),
      CRASH_SPEED_MULT: r(0.9, 1.1),
      LAND_SPEED_MULT: r(0.9, 1.1),
      TARGET_FINAL_AIR: r(0.42, 0.56),
      CA_STEPS: r(2, 4),
      AIR_KEEP_N8: r(3, 4),
      ROCK_TO_AIR_N8: r(6, 7),
      ENTRANCES: r(2, 4),
      ENTRANCE_OUTER: r(0.65, 0.8),
      ENTRANCE_INNER: r(0.48, 0.65),
      WARP_F: r(0.045, 0.07),
      WARP_A: r(1.6, 2.4),
      BASE_F: r(0.11, 0.15),
      VEIN_F: r(0.16, 0.2),
      VEIN_THRESH: r(0.74, 0.84),
      VEIN_DILATE: r(1, 2),
      VIS_RANGE: r(6, 7.5),
      FOG_SEEN_ALPHA: r(0.52, 0.6),
      FOG_UNSEEN_ALPHA: r(0.82, 0.9),
      FOG_BUDGET_TRIS: r(240, 380),
      CORE_RADIUS: r(5, 5),
      CORE_DPS: r(0.4, 1),
      ICE_CRUST_THICKNESS: r(0, 0),
      WATER_LEVEL: r(0, 0),
      MOLTEN_RING_INNER: r(5, 5),
      MOLTEN_RING_OUTER: r(7, 7),
      EXCAVATE_RINGS: r(0, 0),
      EXCAVATE_RING_THICKNESS: r(0, 0),
      TOPO_BAND: r(2.8, 4),
      TOPO_AMP: r(1.8, 2.6),
      TOPO_FREQ: r(2.9, 3.6),
      TOPO_OCTAVES: r(4, 5)
    }
  },
  {
    id: "ice",
    label: "Ice World",
    enemyCountBase: 5,
    enemyCountPerLevel: 5,
    enemyCountCap: 30,
    enemyPlacement: "random",
    objective: { type: "extract", count: 0 },
    minerCountBase: 5,
    minerCountPerLevel: 2,
    minerCountCap: 30,
    platformCount: 10,
    enemyAllow: ["hunter", "ranger", "crawler"],
    notes: "Slippery landings; icy crust.",
    defaults: {
      ROCK_DARK: [0.32, 0.4, 0.55],
      ROCK_LIGHT: [0.68, 0.8, 0.92],
      AIR_DARK: [0.18, 0.24, 0.3],
      AIR_LIGHT: [0.4, 0.52, 0.62],
      SURFACE_ROCK_DARK: [0.55, 0.7, 0.86],
      SURFACE_ROCK_LIGHT: [0.82, 0.92, 0.98],
      SURFACE_BAND: 0.2
    },
    ranges: {
      RMAX: r(15, 23),
      PAD: r(1, 1.7),
      MOTHERSHIP_ORBIT_HEIGHT: r(12, 20),
      SURFACE_G: r(1.6, 2.3),
      DRAG_MULT: r(0.9, 1.1),
      THRUST_MULT: r(0.95, 1.15),
      TURN_RATE_MULT: r(0.95, 1.15),
      LAND_FRICTION_MULT: r(0.1, 0.1),
      CRASH_SPEED_MULT: r(0.9, 1.1),
      LAND_SPEED_MULT: r(0.85, 1.05),
      TARGET_FINAL_AIR: r(0.45, 0.62),
      CA_STEPS: r(2, 4),
      AIR_KEEP_N8: r(3, 4),
      ROCK_TO_AIR_N8: r(6, 7),
      ENTRANCES: r(2, 4),
      ENTRANCE_OUTER: r(0.6, 0.8),
      ENTRANCE_INNER: r(0.44, 0.62),
      WARP_F: r(0.04, 0.06),
      WARP_A: r(1.5, 2.3),
      BASE_F: r(0.1, 0.14),
      VEIN_F: r(0.14, 0.18),
      VEIN_THRESH: r(0.78, 0.88),
      VEIN_DILATE: r(1, 2),
      VIS_RANGE: r(6.5, 8.2),
      FOG_SEEN_ALPHA: r(0.5, 0.58),
      FOG_UNSEEN_ALPHA: r(0.8, 0.88),
      FOG_BUDGET_TRIS: r(220, 360),
      CORE_RADIUS: r(0, 0),
      CORE_DPS: r(0, 0),
      ICE_CRUST_THICKNESS: r(0.18, 0.32),
      WATER_LEVEL: r(0, 0),
      MOLTEN_RING_INNER: r(0, 0),
      MOLTEN_RING_OUTER: r(0, 0),
      EXCAVATE_RINGS: r(0, 0),
      EXCAVATE_RING_THICKNESS: r(0, 0),
      TOPO_BAND: r(2.8, 4),
      TOPO_AMP: r(1.8, 2.6),
      TOPO_FREQ: r(2.9, 3.6),
      TOPO_OCTAVES: r(4, 5)
    }
  },
  {
    id: "gaia",
    label: "Gaia",
    enemyCountBase: 5,
    enemyCountPerLevel: 5,
    enemyCountCap: 30,
    enemyPlacement: "random",
    objective: { type: "extract", count: 0 },
    minerCountBase: 5,
    minerCountPerLevel: 2,
    minerCountCap: 30,
    platformCount: 10,
    enemyAllow: ["hunter", "ranger", "crawler", "orbitingTurret"],
    notes: "Lush surface; slightly denser interior.",
    defaults: {
      ROCK_DARK: [0.3, 0.2, 0.12],
      ROCK_LIGHT: [0.52, 0.34, 0.2],
      AIR_DARK: [0.17, 0.22, 0.18],
      AIR_LIGHT: [0.38, 0.5, 0.4],
      SURFACE_ROCK_DARK: [0.08, 0.3, 0.12],
      SURFACE_ROCK_LIGHT: [0.18, 0.55, 0.22],
      SURFACE_BAND: 0.25,
      ATMOSPHERE: {
        inner: [0.45, 0.72, 1, 0.22],
        outer: [0.45, 0.72, 1, 0],
        ringCount: 4,
        ringOffset: -1
      }
    },
    ranges: {
      RMAX: r(20, 25),
      PAD: r(1, 1.5),
      MOTHERSHIP_ORBIT_HEIGHT: r(12, 18),
      SURFACE_G: r(1.8, 2.4),
      DRAG_MULT: r(0.95, 1.25),
      THRUST_MULT: r(0.95, 1.1),
      TURN_RATE_MULT: r(0.95, 1.1),
      LAND_FRICTION_MULT: r(0.8, 1.2),
      CRASH_SPEED_MULT: r(0.9, 1.1),
      LAND_SPEED_MULT: r(0.9, 1.1),
      TARGET_FINAL_AIR: r(0.4, 0.55),
      CA_STEPS: r(3, 4),
      AIR_KEEP_N8: r(3, 4),
      ROCK_TO_AIR_N8: r(6, 7),
      ENTRANCES: r(2, 4),
      ENTRANCE_OUTER: r(0.65, 0.8),
      ENTRANCE_INNER: r(0.48, 0.65),
      WARP_F: r(0.05, 0.07),
      WARP_A: r(1.7, 2.6),
      BASE_F: r(0.11, 0.15),
      VEIN_F: r(0.14, 0.18),
      VEIN_THRESH: r(0.76, 0.86),
      VEIN_DILATE: r(1, 2),
      VIS_RANGE: r(6.2, 7.8),
      FOG_SEEN_ALPHA: r(0.5, 0.6),
      FOG_UNSEEN_ALPHA: r(0.8, 0.9),
      FOG_BUDGET_TRIS: r(220, 360),
      CORE_RADIUS: r(0, 0),
      CORE_DPS: r(0, 0),
      ICE_CRUST_THICKNESS: r(0, 0),
      WATER_LEVEL: r(0, 0),
      MOLTEN_RING_INNER: r(0, 0),
      MOLTEN_RING_OUTER: r(0, 0),
      EXCAVATE_RINGS: r(0, 0),
      EXCAVATE_RING_THICKNESS: r(0, 0),
      TOPO_BAND: r(2.8, 4),
      TOPO_AMP: r(1.8, 2.6),
      TOPO_FREQ: r(2.9, 3.6),
      TOPO_OCTAVES: r(4, 5)
    }
  },
  {
    id: "water",
    label: "Water World",
    enemyCountBase: 5,
    enemyCountPerLevel: 5,
    enemyCountCap: 30,
    enemyPlacement: "random",
    objective: { type: "extract", count: 0 },
    minerCountBase: 5,
    minerCountPerLevel: 2,
    minerCountCap: 30,
    platformCount: 10,
    enemyAllow: ["hunter", "ranger", "crawler"],
    notes: "High-drag buoyant control and deep-water cave visuals.",
    defaults: {
      ROCK_DARK: [0.3, 0.32, 0.34],
      ROCK_LIGHT: [0.56, 0.58, 0.62],
      AIR_DARK: [0.03, 0.12, 0.26],
      AIR_LIGHT: [0.12, 0.34, 0.58],
      SURFACE_ROCK_DARK: [0.34, 0.36, 0.38],
      SURFACE_ROCK_LIGHT: [0.62, 0.64, 0.68],
      SURFACE_BAND: 0.1
    },
    ranges: {
      RMAX: r(15, 22),
      PAD: r(1.1, 1.8),
      MOTHERSHIP_ORBIT_HEIGHT: r(12, 20),
      SURFACE_G: r(1, 1.6),
      DRAG_MULT: r(2.2, 3.1),
      THRUST_MULT: r(0.85, 1),
      TURN_RATE_MULT: r(0.8, 0.95),
      LAND_FRICTION_MULT: r(0.8, 1.1),
      CRASH_SPEED_MULT: r(0.9, 1.1),
      LAND_SPEED_MULT: r(0.9, 1.1),
      TARGET_FINAL_AIR: r(0.48, 0.65),
      CA_STEPS: r(2, 4),
      AIR_KEEP_N8: r(3, 4),
      ROCK_TO_AIR_N8: r(6, 7),
      ENTRANCES: r(2, 4),
      ENTRANCE_OUTER: r(0.6, 0.8),
      ENTRANCE_INNER: r(0.44, 0.62),
      WARP_F: r(0.04, 0.065),
      WARP_A: r(1.6, 2.4),
      BASE_F: r(0.11, 0.15),
      VEIN_F: r(0.14, 0.19),
      VEIN_THRESH: r(0.75, 0.86),
      VEIN_DILATE: r(1, 2),
      VIS_RANGE: r(5.8, 7.2),
      FOG_SEEN_ALPHA: r(0.55, 0.65),
      FOG_UNSEEN_ALPHA: r(0.85, 0.95),
      FOG_BUDGET_TRIS: r(220, 360),
      CORE_RADIUS: r(0, 0),
      CORE_DPS: r(0, 0),
      ICE_CRUST_THICKNESS: r(0, 0),
      WATER_LEVEL: r(0.2, 0.45),
      MOLTEN_RING_INNER: r(0, 0),
      MOLTEN_RING_OUTER: r(0, 0),
      EXCAVATE_RINGS: r(0, 0),
      EXCAVATE_RING_THICKNESS: r(0, 0),
      TOPO_BAND: r(2.8, 4),
      TOPO_AMP: r(1.8, 2.6),
      TOPO_FREQ: r(2.9, 3.6),
      TOPO_OCTAVES: r(4, 5)
    }
  },
  {
    id: "cavern",
    label: "Cavern",
    enemyCountBase: 5,
    enemyCountPerLevel: 5,
    enemyCountCap: 30,
    enemyPlacement: "random",
    objective: { type: "extract", count: 0 },
    minerCountBase: 5,
    minerCountPerLevel: 2,
    minerCountCap: 30,
    platformCount: 10,
    enemyAllow: ["hunter", "ranger", "crawler", "turret"],
    notes: "Baseline cave world.",
    defaults: {
      ROCK_DARK: [0.3725, 0.2275, 0.125],
      ROCK_LIGHT: [0.541, 0.337, 0.192],
      AIR_DARK: [0.1686, 0.1686, 0.1686],
      AIR_LIGHT: [0.29, 0.29, 0.29],
      SURFACE_ROCK_DARK: [0.4, 0.28, 0.18],
      SURFACE_ROCK_LIGHT: [0.62, 0.44, 0.28],
      SURFACE_BAND: 0.08
    },
    ranges: {
      RMAX: r(16, 20),
      PAD: r(1, 1.4),
      MOTHERSHIP_ORBIT_HEIGHT: r(12, 17),
      SURFACE_G: r(1.9, 2.4),
      DRAG_MULT: r(0.95, 1.15),
      THRUST_MULT: r(0.95, 1.1),
      TURN_RATE_MULT: r(0.95, 1.1),
      LAND_FRICTION_MULT: r(0.8, 1.2),
      CRASH_SPEED_MULT: r(0.9, 1.1),
      LAND_SPEED_MULT: r(0.9, 1.1),
      TARGET_FINAL_AIR: r(0.45, 0.55),
      CA_STEPS: r(3, 4),
      AIR_KEEP_N8: r(3, 4),
      ROCK_TO_AIR_N8: r(6, 7),
      ENTRANCES: r(3, 4),
      ENTRANCE_OUTER: r(0.65, 0.75),
      ENTRANCE_INNER: r(0.5, 0.6),
      WARP_F: r(0.05, 0.065),
      WARP_A: r(1.8, 2.4),
      BASE_F: r(0.12, 0.14),
      VEIN_F: r(0.16, 0.18),
      VEIN_THRESH: r(0.77, 0.83),
      VEIN_DILATE: r(1, 2),
      VIS_RANGE: r(6.3, 7.6),
      FOG_SEEN_ALPHA: r(0.52, 0.6),
      FOG_UNSEEN_ALPHA: r(0.82, 0.9),
      FOG_BUDGET_TRIS: r(240, 360),
      CORE_RADIUS: r(0, 0),
      CORE_DPS: r(0, 0),
      ICE_CRUST_THICKNESS: r(0, 0),
      WATER_LEVEL: r(0, 0),
      MOLTEN_RING_INNER: r(0, 0),
      MOLTEN_RING_OUTER: r(0, 0),
      EXCAVATE_RINGS: r(0, 0),
      EXCAVATE_RING_THICKNESS: r(0, 0),
      TOPO_BAND: r(2.8, 4),
      TOPO_AMP: r(1.8, 2.6),
      TOPO_FREQ: r(2.9, 3.6),
      TOPO_OCTAVES: r(4, 5)
    }
  },
  {
    id: "mechanized",
    label: "Mechanized",
    enemyCountBase: 5,
    enemyCountPerLevel: 5,
    enemyCountCap: 30,
    enemyPlacement: "random",
    objective: { type: "clear", count: 0 },
    minerCountBase: 0,
    minerCountPerLevel: 0,
    minerCountCap: 0,
    platformCount: 10,
    enemyAllow: ["hunter", "ranger", "turret", "orbitingTurret"],
    notes: "Industrial look with destroyable factories and blocked gates.",
    flags: { disableTerrainDestruction: true },
    defaults: {
      ROCK_DARK: [0.2, 0.2, 0.22],
      ROCK_LIGHT: [0.45, 0.45, 0.5],
      AIR_DARK: [0.16, 0.18, 0.2],
      AIR_LIGHT: [0.32, 0.36, 0.4],
      SURFACE_ROCK_DARK: [0.26, 0.28, 0.3],
      SURFACE_ROCK_LIGHT: [0.55, 0.58, 0.62],
      SURFACE_BAND: 0.08
    },
    ranges: {
      RMAX: r(18, 26),
      PAD: r(1, 1.4),
      MOTHERSHIP_ORBIT_HEIGHT: r(14, 22),
      SURFACE_G: r(2, 2.6),
      DRAG_MULT: r(0.9, 1.1),
      THRUST_MULT: r(0.95, 1.05),
      TURN_RATE_MULT: r(0.9, 1.05),
      LAND_FRICTION_MULT: r(0.8, 1.1),
      CRASH_SPEED_MULT: r(0.9, 1.1),
      LAND_SPEED_MULT: r(0.9, 1.1),
      TARGET_FINAL_AIR: r(0.4, 0.52),
      CA_STEPS: r(2, 3),
      AIR_KEEP_N8: r(3, 4),
      ROCK_TO_AIR_N8: r(6, 7),
      ENTRANCES: r(2, 4),
      ENTRANCE_OUTER: r(0.62, 0.78),
      ENTRANCE_INNER: r(0.46, 0.64),
      WARP_F: r(0.035, 0.055),
      WARP_A: r(1.2, 2),
      BASE_F: r(0.1, 0.13),
      VEIN_F: r(0.18, 0.24),
      VEIN_THRESH: r(0.8, 0.9),
      VEIN_DILATE: r(1, 2),
      VIS_RANGE: r(6, 7.2),
      FOG_SEEN_ALPHA: r(0.52, 0.6),
      FOG_UNSEEN_ALPHA: r(0.84, 0.92),
      FOG_BUDGET_TRIS: r(240, 380),
      CORE_RADIUS: r(0, 0),
      CORE_DPS: r(0, 0),
      ICE_CRUST_THICKNESS: r(0, 0),
      WATER_LEVEL: r(0, 0),
      MOLTEN_RING_INNER: r(0, 0),
      MOLTEN_RING_OUTER: r(0, 0),
      EXCAVATE_RINGS: r(0, 0),
      EXCAVATE_RING_THICKNESS: r(0, 0),
      TOPO_BAND: r(2.8, 4),
      TOPO_AMP: r(1.8, 2.6),
      TOPO_FREQ: r(2.9, 3.6),
      TOPO_OCTAVES: r(4, 5)
    }
  }
];
function pickPlanetConfigById(id) {
  for (const cfg of PLANET_CONFIGS) {
    if (cfg.id === id) return cfg;
  }
  return PLANET_CONFIGS[0];
}
function mulberry32(a) {
  let t = a >>> 0;
  return function() {
    t += 1831565813;
    let x = t;
    x = Math.imul(x ^ x >>> 15, x | 1);
    x ^= x + Math.imul(x ^ x >>> 7, x | 61);
    return ((x ^ x >>> 14) >>> 0) / 4294967296;
  };
}
function hash32(x) {
  let h = x >>> 0;
  h ^= h >>> 16;
  h = Math.imul(h, 2146121005);
  h ^= h >>> 15;
  h = Math.imul(h, 2221713035);
  h ^= h >>> 16;
  return h >>> 0;
}
const LEVEL_PROGRESSION_RULES = [
  {
    start: 1,
    end: 1,
    planets: ["barren_pickup"],
    enemyTotal: 0,
    enemyCap: 0
  },
  {
    start: 2,
    end: 2,
    planets: ["barren_clear"],
    enemyTotal: 5,
    enemyCap: 5
  },
  {
    start: 3,
    end: 4,
    planets: ["cavern", "gaia"],
    randomOrder: true,
    enemyTotal: [10, 15],
    enemyCap: [10, 15],
    enemyAllowByPlanet: {
      cavern: ["crawler", "turret"],
      gaia: ["turret", "orbitingTurret"]
    },
    orbitingTurretCountByPlanet: {
      gaia: [10, 15]
    }
  },
  {
    start: 5,
    end: 6,
    planets: ["water", "molten"],
    randomOrder: true,
    enemyTotal: 20,
    enemyCap: 20,
    enemyAllowByPlanet: {
      water: ["hunter"],
      molten: ["ranger"]
    }
  },
  {
    start: 7,
    end: 8,
    planets: ["ice", "mechanized"],
    randomOrder: true,
    enemyTotal: [20, 25],
    enemyCap: 25,
    excludeWhenEnemyTotalAtOrAbove: {
      mechanized: 25
    }
  },
  {
    start: 9,
    end: 12,
    planets: ["barren_pickup", "barren_clear", "cavern", "gaia"],
    randomOrder: true,
    enemyTotal: 25,
    enemyCap: 25,
    enemyAllowAdd: ["crawler", "orbitingTurret", "turret"]
  },
  {
    start: 13,
    end: 15,
    planets: ["water", "ice", "molten"],
    randomOrder: true,
    enemyTotal: 30,
    enemyCap: 30
  },
  {
    start: 16,
    end: null,
    planets: ["mechanized"],
    enemyTotal: 40,
    enemyPerLevel: 10,
    enemyCap: 100,
    enemyAllowByPlanet: {
      mechanized: ["hunter", "ranger", "crawler", "turret", "orbitingTurret"]
    },
    platformCountByPlanet: {
      mechanized: 24
    }
  }
];
function valueAtSlot(spec, slot) {
  if (typeof spec === "number") return spec;
  if (!Array.isArray(spec) || spec.length === 0) return void 0;
  const i = Math.max(0, Math.min(spec.length - 1, slot | 0));
  return spec[i];
}
function enemyTotalAtSlot(rule, slot) {
  const base = valueAtSlot(rule.enemyTotal, slot);
  if (typeof base !== "number") return void 0;
  const extra = typeof rule.enemyPerLevel === "number" ? Math.max(0, slot) * rule.enemyPerLevel : 0;
  return Math.max(0, Math.round(base + extra));
}
function isPlanetExcluded(rule, planetId, enemyTotal) {
  if (typeof enemyTotal !== "number") return false;
  if (!rule.excludeWhenEnemyTotalAtOrAbove) return false;
  const threshold = rule.excludeWhenEnemyTotalAtOrAbove[planetId];
  return typeof threshold === "number" && enemyTotal >= threshold;
}
function planetCycleForRule(seed, rule, cycleIndex) {
  const order = rule.planets.slice();
  if (order.length <= 1) return order;
  if (rule.randomOrder) {
    const cycleSeed = hash32((seed | 0) + (rule.start | 0) * 8191 + (cycleIndex | 0) * 131071);
    const rand = mulberry32(cycleSeed);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const tmp = order[i];
      order[i] = order[j];
      order[j] = tmp;
    }
  }
  if (!rule.excludeWhenEnemyTotalAtOrAbove) return order;
  const cycleLen = order.length;
  for (let i = 0; i < cycleLen; i++) {
    const slotI = cycleIndex * cycleLen + i;
    const totalI = enemyTotalAtSlot(rule, slotI);
    if (!isPlanetExcluded(rule, order[i], totalI)) continue;
    let swapped = false;
    for (let j = 0; j < cycleLen; j++) {
      if (j === i) continue;
      const slotJ = cycleIndex * cycleLen + j;
      const totalJ = enemyTotalAtSlot(rule, slotJ);
      if (isPlanetExcluded(rule, order[j], totalI)) continue;
      if (isPlanetExcluded(rule, order[i], totalJ)) continue;
      const tmp = order[i];
      order[i] = order[j];
      order[j] = tmp;
      swapped = true;
      break;
    }
    if (swapped) continue;
    for (const alt of rule.planets) {
      if (isPlanetExcluded(rule, alt, totalI)) continue;
      order[i] = alt;
      swapped = true;
      break;
    }
  }
  return order;
}
function resolveLevelProgression(seed, level) {
  const lvl = Math.max(1, level | 0);
  let rule = void 0;
  for (const r2 of LEVEL_PROGRESSION_RULES) {
    const end = typeof r2.end === "number" ? r2.end : Infinity;
    if (lvl >= r2.start && lvl <= end) {
      rule = r2;
      break;
    }
  }
  if (!rule || !rule.planets || !rule.planets.length) return null;
  const slot = Math.max(0, lvl - rule.start);
  const cycleLen = Math.max(1, rule.planets.length);
  const cycleIndex = Math.floor(slot / cycleLen);
  const cyclePos = slot % cycleLen;
  const cycle = planetCycleForRule(seed, rule, cycleIndex);
  const planetId = cycle[Math.max(0, Math.min(cycle.length - 1, cyclePos))];
  const enemyTotal = enemyTotalAtSlot(rule, slot);
  const enemyCapRaw = valueAtSlot(rule.enemyCap, slot);
  const enemyCap = typeof enemyCapRaw === "number" ? Math.max(0, Math.round(enemyCapRaw)) : void 0;
  const baseAllow = rule.enemyAllowByPlanet ? rule.enemyAllowByPlanet[planetId] : void 0;
  const enemyAllowAdd = Array.isArray(rule.enemyAllowAdd) ? rule.enemyAllowAdd : [];
  let enemyAllow = void 0;
  if (Array.isArray(baseAllow)) {
    enemyAllow = baseAllow.slice();
  }
  const enemyAllowAddOut = enemyAllowAdd.length ? enemyAllowAdd.slice() : void 0;
  const orbitRaw = rule.orbitingTurretCountByPlanet ? rule.orbitingTurretCountByPlanet[planetId] : void 0;
  const orbitValue = valueAtSlot(orbitRaw, slot);
  const orbitingTurretCount = typeof orbitValue === "number" ? Math.max(0, Math.round(orbitValue)) : void 0;
  const platformRaw = rule.platformCountByPlanet ? rule.platformCountByPlanet[planetId] : void 0;
  const platformCount = typeof platformRaw === "number" ? Math.max(1, Math.round(platformRaw)) : void 0;
  return {
    planetId,
    enemyTotal,
    enemyCap,
    enemyAllow,
    enemyAllowAdd: enemyAllowAddOut,
    orbitingTurretCount,
    platformCount
  };
}
function pickPlanetConfig(seed, level) {
  const lvl = Math.max(1, level | 0);
  const base = (seed | 0) + lvl * 9973;
  const idx = hash32(base) % PLANET_CONFIGS.length;
  return PLANET_CONFIGS[idx];
}
function rollPlanetConfig(seed, level, cfg) {
  const lvl = Math.max(1, level | 0);
  const base = (seed | 0) + lvl * 977 + hash32(cfg.id.length * 131 + cfg.label.length * 17);
  const rand = mulberry32(base);
  const out = {};
  for (const [key, range] of Object.entries(cfg.ranges)) {
    const v = range.min + (range.max - range.min) * rand();
    out[key] = v;
  }
  for (const k of ["CA_STEPS", "AIR_KEEP_N8", "ROCK_TO_AIR_N8", "ENTRANCES", "VEIN_DILATE", "FOG_BUDGET_TRIS", "EXCAVATE_RINGS", "TOPO_OCTAVES"]) {
    if (k in out) out[k] = Math.round(out[k]);
  }
  return out;
}
function clampPlanetConfig(sample) {
  const limits = {
    RMAX: [8, 26],
    PAD: [0.8, 2],
    MOTHERSHIP_ORBIT_HEIGHT: [8, 26],
    SURFACE_G: [1.2, 3.2],
    DRAG_MULT: [0.7, 2],
    THRUST_MULT: [0.7, 1.4],
    TURN_RATE_MULT: [0.7, 1.4],
    LAND_FRICTION_MULT: [0.2, 1.6],
    CRASH_SPEED_MULT: [0.6, 1.5],
    LAND_SPEED_MULT: [0.6, 1.5],
    TARGET_FINAL_AIR: [0.08, 0.75],
    CA_STEPS: [1, 6],
    AIR_KEEP_N8: [2, 5],
    ROCK_TO_AIR_N8: [5, 8],
    ENTRANCES: [0, 6],
    ENTRANCE_OUTER: [0, 0.9],
    ENTRANCE_INNER: [0, 0.8],
    WARP_F: [0.02, 0.09],
    WARP_A: [0.8, 3],
    BASE_F: [0.06, 0.2],
    VEIN_F: [0.08, 0.26],
    VEIN_THRESH: [0.65, 0.95],
    VEIN_DILATE: [1, 3],
    VIS_RANGE: [4.5, 9],
    FOG_SEEN_ALPHA: [0.35, 0.7],
    FOG_UNSEEN_ALPHA: [0.65, 0.98],
    FOG_BUDGET_TRIS: [120, 450],
    CORE_RADIUS: [0, 10],
    CORE_DPS: [0, 3],
    ICE_CRUST_THICKNESS: [0, 0.6],
    WATER_LEVEL: [0, 0.8],
    MOLTEN_RING_INNER: [0, 12],
    MOLTEN_RING_OUTER: [0, 16],
    EXCAVATE_RINGS: [0, 8],
    EXCAVATE_RING_THICKNESS: [0, 1.2],
    TOPO_BAND: [0, 6],
    TOPO_AMP: [0, 4],
    TOPO_FREQ: [0.5, 4.5],
    TOPO_OCTAVES: [1, 6]
  };
  const out = { ...sample };
  for (const [key, [lo, hi]] of Object.entries(limits)) {
    if (!(key in out)) continue;
    const v = out[key];
    out[key] = Math.max(lo, Math.min(hi, v));
  }
  if ("ENTRANCE_OUTER" in out && "ENTRANCE_INNER" in out) {
    if (out.ENTRANCE_INNER >= out.ENTRANCE_OUTER) {
      out.ENTRANCE_INNER = Math.max(0.25, out.ENTRANCE_OUTER - 0.12);
    }
  }
  if ("ENTRANCES" in out) {
    out.ENTRANCES = Math.max(0, Math.round(out.ENTRANCES));
  }
  return out;
}
function resolvePlanetParams(seed, level, cfg, baseGame) {
  const roll = clampPlanetConfig(rollPlanetConfig(seed, level, cfg));
  const isMechanizedCoreLevel = !!(cfg && cfg.id === "mechanized" && level >= 16);
  const mechanizedCoreRadius = isMechanizedCoreLevel ? 8 : roll.CORE_RADIUS ?? 0;
  const moltenInner = isMechanizedCoreLevel ? mechanizedCoreRadius : roll.MOLTEN_RING_INNER ?? 0;
  const moltenOuter = isMechanizedCoreLevel ? mechanizedCoreRadius + 2.2 : roll.MOLTEN_RING_OUTER ?? 0;
  return {
    RMAX: roll.RMAX,
    PAD: roll.PAD,
    MOTHERSHIP_ORBIT_HEIGHT: roll.MOTHERSHIP_ORBIT_HEIGHT,
    SURFACE_G: roll.SURFACE_G,
    TARGET_FINAL_AIR: roll.TARGET_FINAL_AIR,
    CA_STEPS: roll.CA_STEPS,
    AIR_KEEP_N8: roll.AIR_KEEP_N8,
    ROCK_TO_AIR_N8: roll.ROCK_TO_AIR_N8,
    ENTRANCES: roll.ENTRANCES,
    ENTRANCE_OUTER: roll.ENTRANCE_OUTER,
    ENTRANCE_INNER: roll.ENTRANCE_INNER,
    WARP_F: roll.WARP_F,
    WARP_A: roll.WARP_A,
    BASE_F: roll.BASE_F,
    VEIN_F: roll.VEIN_F,
    VEIN_THRESH: roll.VEIN_THRESH,
    VEIN_DILATE: roll.VEIN_DILATE,
    VIS_RANGE: roll.VIS_RANGE,
    FOG_SEEN_ALPHA: roll.FOG_SEEN_ALPHA,
    FOG_UNSEEN_ALPHA: roll.FOG_UNSEEN_ALPHA,
    FOG_BUDGET_TRIS: roll.FOG_BUDGET_TRIS,
    CORE_RADIUS: mechanizedCoreRadius,
    CORE_DPS: roll.CORE_DPS ?? 0,
    ICE_CRUST_THICKNESS: roll.ICE_CRUST_THICKNESS ?? 0,
    WATER_LEVEL: roll.WATER_LEVEL ?? 0,
    MOLTEN_RING_INNER: moltenInner,
    MOLTEN_RING_OUTER: moltenOuter,
    MOLTEN_VENT_COUNT: cfg && cfg.id === "molten" ? Math.max(0, level * 5) : 0,
    EXCAVATE_RINGS: roll.EXCAVATE_RINGS ?? 0,
    EXCAVATE_RING_THICKNESS: roll.EXCAVATE_RING_THICKNESS ?? 0,
    TOPO_BAND: roll.TOPO_BAND ?? 0,
    TOPO_AMP: roll.TOPO_AMP ?? 0,
    TOPO_FREQ: roll.TOPO_FREQ ?? 0,
    TOPO_OCTAVES: roll.TOPO_OCTAVES ?? 0,
    DRAG: baseGame.DRAG * roll.DRAG_MULT,
    THRUST: baseGame.THRUST * roll.THRUST_MULT,
    TURN_RATE: baseGame.TURN_RATE * roll.TURN_RATE_MULT,
    LAND_FRICTION: baseGame.LAND_FRICTION * roll.LAND_FRICTION_MULT,
    CRASH_SPEED: baseGame.CRASH_SPEED * roll.CRASH_SPEED_MULT,
    LAND_SPEED: baseGame.LAND_SPEED * roll.LAND_SPEED_MULT,
    NO_CAVES: !!(cfg.flags && cfg.flags.noCaves)
  };
}
const STORAGE_KEY = "dropship.save.v1";
const SAVE_SCHEMA_VERSION = 1;
function saveGameToStorage(loop2) {
  if (!loop2 || typeof loop2.createSaveSnapshot !== "function") return false;
  try {
    const snapshot = loop2.createSaveSnapshot();
    if (!isSnapshotPersistable(snapshot)) {
      localStorage.removeItem(STORAGE_KEY);
      return false;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    return true;
  } catch (err) {
    console.warn("[Save] write failed", err);
    return false;
  }
}
function loadGameFromStorage(loop2) {
  if (!loop2 || typeof loop2.restoreFromSaveSnapshot !== "function") return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const snapshot = JSON.parse(raw);
    if (!isSnapshotPersistable(snapshot)) {
      localStorage.removeItem(STORAGE_KEY);
      return false;
    }
    return !!loop2.restoreFromSaveSnapshot(snapshot);
  } catch (err) {
    console.warn("[Save] read failed", err);
    return false;
  }
}
function installExitSaveHandlers(loop2) {
  const saveNow = () => {
    saveGameToStorage(loop2);
  };
  const onVisibility = () => {
    if (document.visibilityState === "hidden") {
      saveNow();
    }
  };
  window.addEventListener("pagehide", saveNow);
  window.addEventListener("beforeunload", saveNow);
  document.addEventListener("visibilitychange", onVisibility);
  return () => {
    window.removeEventListener("pagehide", saveNow);
    window.removeEventListener("beforeunload", saveNow);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}
function clearSavedGame() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (err) {
    console.warn("[Save] clear failed", err);
    return false;
  }
}
function createLoopSaveSnapshot(loop2) {
  const nowMs = performance.now();
  const cfg = loop2.planet && loop2.planet.getPlanetConfig ? loop2.planet.getPlanetConfig() : null;
  const planetRuntime = loop2.planet.exportRuntimeState();
  return {
    version: SAVE_SCHEMA_VERSION,
    savedAtUtcMs: Date.now(),
    progressionSeed: loop2.progressionSeed | 0,
    level: loop2.level | 0,
    planetSeed: loop2.planet.getSeed(),
    planetConfigId: cfg ? cfg.id : null,
    planetRuntime: encodePlanetRuntimeState(planetRuntime),
    ship: sanitizeShipForSave(loop2.ship),
    mothership: {
      x: loop2.mothership.x,
      y: loop2.mothership.y,
      vx: loop2.mothership.vx,
      vy: loop2.mothership.vy,
      angle: loop2.mothership.angle
    },
    miners: cloneSaveData(loop2.miners),
    minersRemaining: loop2.minersRemaining | 0,
    minersDead: loop2.minersDead | 0,
    minerTarget: loop2.minerTarget | 0,
    minerCandidates: loop2.minerCandidates | 0,
    enemies: {
      enemies: cloneSaveData(loop2.enemies.enemies),
      shots: cloneSaveData(loop2.enemies.shots),
      explosions: cloneSaveData(loop2.enemies.explosions),
      debris: cloneSaveData(loop2.enemies.debris)
    },
    playerShots: cloneSaveData(loop2.playerShots),
    playerBombs: cloneSaveData(loop2.playerBombs),
    debris: cloneSaveData(loop2.debris),
    entityExplosions: cloneSaveData(loop2.entityExplosions),
    minerPopups: cloneSaveData(loop2.minerPopups),
    shipHitPopups: cloneSaveData(loop2.shipHitPopups),
    objective: cloneSaveData(loop2.objective),
    clearObjectiveTotal: loop2.clearObjectiveTotal | 0,
    coreMeltdownActive: !!loop2.coreMeltdownActive,
    coreMeltdownT: +loop2.coreMeltdownT || 0,
    coreMeltdownEruptT: +loop2.coreMeltdownEruptT || 0,
    planetView: !!loop2.planetView,
    fogEnabled: !!loop2.fogEnabled,
    pendingPerkChoice: cloneSaveData(loop2.pendingPerkChoice),
    objectiveCompleteSfxPlayed: !!loop2.objectiveCompleteSfxPlayed,
    objectiveCompleteSfxDelayMs: Number.isFinite(loop2.objectiveCompleteSfxDueAtMs) ? Math.max(0, loop2.objectiveCompleteSfxDueAtMs - nowMs) : null,
    victoryMusicTriggered: !!loop2.victoryMusicTriggered,
    combatThreatDelayMs: Math.max(0, loop2.combatThreatUntilMs - nowMs),
    statusCueText: loop2.statusCueText || "",
    statusCueDelayMs: Math.max(0, loop2.statusCueUntil - nowMs),
    lastAimWorld: cloneSaveData(loop2.lastAimWorld),
    lastAimScreen: cloneSaveData(loop2.lastAimScreen),
    title: {
      startTitleSeen: !!loop2.startTitleSeen,
      startTitleAlpha: +loop2.startTitleAlpha || 0,
      startTitleFade: !!loop2.startTitleFade,
      newGameHelpPromptT: +loop2.newGameHelpPromptT || 0,
      newGameHelpPromptArmed: !!loop2.newGameHelpPromptArmed
    },
    hasLaunchedPlayerShip: !!loop2.hasLaunchedPlayerShip,
    lastHeat: +loop2.lastHeat || 0,
    shipWasInWater: !!loop2._shipWasInWater
  };
}
function restoreLoopFromSaveSnapshot(loop2, snapshot) {
  try {
    if (!snapshot || typeof snapshot !== "object") return false;
    if ((snapshot.version | 0) !== SAVE_SCHEMA_VERSION) return false;
    const level = snapshot.level | 0;
    if (level < 1) return false;
    const planetSeed = Number(snapshot.planetSeed);
    if (!Number.isFinite(planetSeed)) return false;
    const progressionSeed = Number(snapshot.progressionSeed);
    if (!Number.isFinite(progressionSeed)) return false;
    loop2.progressionSeed = progressionSeed | 0;
    loop2._beginLevel(planetSeed, level);
    const runtimeState = decodePlanetRuntimeState(snapshot.planetRuntime);
    if (runtimeState) {
      const newAir = loop2.planet.importRuntimeState(runtimeState);
      if (newAir) loop2.renderer.updateAir(newAir);
    }
    const restoredShip = sanitizeShipForSave(snapshot.ship);
    applyObjectState(loop2.ship, restoredShip);
    loop2.ship.guidePath = null;
    if (loop2.ship._dock && (typeof loop2.ship._dock.lx !== "number" || typeof loop2.ship._dock.ly !== "number")) {
      loop2.ship._dock = { lx: GAME.MOTHERSHIP_START_DOCK_X, ly: GAME.MOTHERSHIP_START_DOCK_Y };
    }
    if (snapshot.mothership && typeof snapshot.mothership === "object") {
      if (Number.isFinite(snapshot.mothership.x)) loop2.mothership.x = snapshot.mothership.x;
      if (Number.isFinite(snapshot.mothership.y)) loop2.mothership.y = snapshot.mothership.y;
      if (Number.isFinite(snapshot.mothership.vx)) loop2.mothership.vx = snapshot.mothership.vx;
      if (Number.isFinite(snapshot.mothership.vy)) loop2.mothership.vy = snapshot.mothership.vy;
      if (Number.isFinite(snapshot.mothership.angle)) loop2.mothership.angle = snapshot.mothership.angle;
    }
    loop2.miners = Array.isArray(snapshot.miners) ? cloneSaveData(snapshot.miners) : [];
    loop2.minersRemaining = clampNonNegativeInt(snapshot.minersRemaining, loop2.miners.length);
    loop2.minersDead = clampNonNegativeInt(snapshot.minersDead, 0);
    loop2.minerTarget = clampNonNegativeInt(snapshot.minerTarget, loop2.minersRemaining + loop2.minersDead);
    loop2.minerCandidates = clampNonNegativeInt(snapshot.minerCandidates, loop2.miners.length);
    const enemies = snapshot.enemies || {};
    loop2.enemies.enemies = Array.isArray(enemies.enemies) ? cloneSaveData(enemies.enemies) : [];
    loop2.enemies.shots = Array.isArray(enemies.shots) ? cloneSaveData(enemies.shots) : [];
    loop2.enemies.explosions = Array.isArray(enemies.explosions) ? cloneSaveData(enemies.explosions) : [];
    loop2.enemies.debris = Array.isArray(enemies.debris) ? cloneSaveData(enemies.debris) : [];
    loop2.playerShots = Array.isArray(snapshot.playerShots) ? cloneSaveData(snapshot.playerShots) : [];
    loop2.playerBombs = Array.isArray(snapshot.playerBombs) ? cloneSaveData(snapshot.playerBombs) : [];
    loop2.debris = Array.isArray(snapshot.debris) ? cloneSaveData(snapshot.debris) : [];
    loop2.entityExplosions = Array.isArray(snapshot.entityExplosions) ? cloneSaveData(snapshot.entityExplosions) : [];
    loop2.minerPopups = Array.isArray(snapshot.minerPopups) ? cloneSaveData(snapshot.minerPopups) : [];
    loop2.shipHitPopups = Array.isArray(snapshot.shipHitPopups) ? cloneSaveData(snapshot.shipHitPopups) : [];
    loop2.objective = snapshot.objective && typeof snapshot.objective === "object" ? cloneSaveData(snapshot.objective) : loop2.objective;
    loop2.clearObjectiveTotal = clampNonNegativeInt(snapshot.clearObjectiveTotal, loop2.clearObjectiveTotal);
    loop2.coreMeltdownActive = !!snapshot.coreMeltdownActive;
    loop2.coreMeltdownT = clampNonNegativeNumber(snapshot.coreMeltdownT, 0);
    loop2.coreMeltdownEruptT = clampNonNegativeNumber(snapshot.coreMeltdownEruptT, 0);
    loop2.planetView = !!snapshot.planetView;
    loop2.fogEnabled = !!snapshot.fogEnabled;
    loop2.pendingPerkChoice = Array.isArray(snapshot.pendingPerkChoice) ? cloneSaveData(snapshot.pendingPerkChoice) : null;
    loop2.objectiveCompleteSfxPlayed = !!snapshot.objectiveCompleteSfxPlayed;
    loop2.victoryMusicTriggered = !!snapshot.victoryMusicTriggered;
    loop2.statusCueText = typeof snapshot.statusCueText === "string" ? snapshot.statusCueText : "";
    loop2.lastAimWorld = snapshot.lastAimWorld && typeof snapshot.lastAimWorld === "object" ? cloneSaveData(snapshot.lastAimWorld) : null;
    loop2.lastAimScreen = snapshot.lastAimScreen && typeof snapshot.lastAimScreen === "object" ? cloneSaveData(snapshot.lastAimScreen) : null;
    loop2.debugCollisions = GAME.DEBUG_COLLISION;
    loop2.debugPlanetTriangles = false;
    loop2.debugCollisionContours = false;
    loop2.devHudVisible = false;
    loop2.hud.style.display = "none";
    const title = snapshot.title || {};
    loop2.startTitleSeen = !!title.startTitleSeen;
    loop2.startTitleAlpha = clampRange(title.startTitleAlpha, 0, 1, loop2.startTitleSeen ? 0 : 1);
    loop2.startTitleFade = !!title.startTitleFade;
    loop2.newGameHelpPromptT = clampNonNegativeNumber(title.newGameHelpPromptT, 0);
    loop2.newGameHelpPromptArmed = !!title.newGameHelpPromptArmed;
    loop2.hasLaunchedPlayerShip = typeof snapshot.hasLaunchedPlayerShip === "boolean" ? snapshot.hasLaunchedPlayerShip : (snapshot.level | 0) > 1 || snapshot.ship && (snapshot.ship.state === "flying" || snapshot.ship._dock === null);
    loop2.lastHeat = clampNonNegativeNumber(snapshot.lastHeat, 0);
    loop2._shipWasInWater = !!snapshot.shipWasInWater;
    const nowMs = performance.now();
    loop2.combatThreatUntilMs = nowMs + clampNonNegativeNumber(snapshot.combatThreatDelayMs, 0);
    const objectiveDueMs = snapshot.objectiveCompleteSfxDelayMs;
    loop2.objectiveCompleteSfxDueAtMs = Number.isFinite(objectiveDueMs) ? nowMs + clampNonNegativeNumber(objectiveDueMs, 0) : Number.POSITIVE_INFINITY;
    loop2.statusCueUntil = nowMs + clampNonNegativeNumber(snapshot.statusCueDelayMs, 0);
    loop2.accumulator = 0;
    loop2.lastTime = nowMs;
    loop2.fpsTime = nowMs;
    loop2.fpsFrames = 0;
    loop2.ship._samples = null;
    loop2.ship._collision = null;
    loop2._syncTetherProtectionStates();
    loop2.planet.reconcileFeatures({
      enemies: loop2.enemies.enemies,
      miners: loop2.miners
    });
    loop2.renderer.setPlanet(loop2.planet);
    loop2.planet.syncRenderFog(loop2.renderer, loop2.ship.x, loop2.ship.y);
    loop2._setThrustLoopActive(false);
    loop2._setCombatActive(false);
    return true;
  } catch (err) {
    console.warn("[Save] restore failed", err);
    return false;
  }
}
function sanitizeShipForSave(ship) {
  const out = cloneSaveData(ship && typeof ship === "object" ? ship : {});
  out.guidePath = null;
  delete out._samples;
  delete out._collision;
  if (out._dock && (typeof out._dock.lx !== "number" || typeof out._dock.ly !== "number")) {
    out._dock = { lx: GAME.MOTHERSHIP_START_DOCK_X, ly: GAME.MOTHERSHIP_START_DOCK_Y };
  }
  return out;
}
function encodePlanetRuntimeState(state) {
  if (!state) return null;
  return {
    airLen: state.air.length,
    airB64: uint8ToBase64(state.air),
    props: cloneSaveData(state.props || []),
    fog: {
      alphaLen: state.fog.alpha.length,
      alphaB64: float32ToBase64(state.fog.alpha),
      visibleLen: state.fog.visible.length,
      visibleB64: uint8ToBase64(state.fog.visible),
      seenLen: state.fog.seen.length,
      seenB64: uint8ToBase64(state.fog.seen),
      holdLen: state.fog.hold.length,
      holdB64: uint8ToBase64(state.fog.hold),
      cursor: state.fog.cursor | 0
    }
  };
}
function decodePlanetRuntimeState(state) {
  if (!state || typeof state !== "object") return null;
  const air = base64ToUint8(state.airB64, state.airLen | 0);
  if (!air) return null;
  const fog = state.fog || {};
  const alpha = base64ToFloat32(fog.alphaB64, fog.alphaLen | 0);
  const visible = base64ToUint8(fog.visibleB64, fog.visibleLen | 0);
  const seen = base64ToUint8(fog.seenB64, fog.seenLen | 0);
  const hold = base64ToUint8(fog.holdB64, fog.holdLen | 0);
  if (!alpha || !visible || !seen || !hold) return null;
  return {
    air,
    props: Array.isArray(state.props) ? cloneSaveData(state.props) : [],
    fog: {
      alpha,
      visible,
      seen,
      hold,
      cursor: fog.cursor | 0
    }
  };
}
function applyObjectState(target, source) {
  for (const key of Object.keys(source)) {
    target[key] = cloneSaveData(source[key]);
  }
}
function cloneSaveData(value) {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((v) => cloneSaveData(v));
  }
  const out = {};
  for (const key of Object.keys(value)) {
    const v = value[key];
    if (typeof v === "function" || v === void 0) continue;
    out[key] = cloneSaveData(v);
  }
  return out;
}
function uint8ToBase64(value) {
  let binary = "";
  const chunk = 32768;
  for (let i = 0; i < value.length; i += chunk) {
    const slice = value.subarray(i, i + chunk);
    let part = "";
    for (let j = 0; j < slice.length; j++) {
      part += String.fromCharCode(slice[j]);
    }
    binary += part;
  }
  return btoa(binary);
}
function float32ToBase64(value) {
  const bytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  return uint8ToBase64(bytes);
}
function base64ToUint8(b64, expectedLen) {
  if (typeof b64 !== "string" || expectedLen < 0) return null;
  const binary = atob(b64);
  if (binary.length !== expectedLen) return null;
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i) & 255;
  }
  return out;
}
function base64ToFloat32(b64, expectedLen) {
  const bytes = base64ToUint8(b64, expectedLen * 4);
  if (!bytes) return null;
  return new Float32Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
}
function clampNonNegativeNumber(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, n);
}
function clampNonNegativeInt(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, n | 0);
}
function clampRange(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}
function isSnapshotPersistable(snapshot) {
  if (!snapshot || typeof snapshot !== "object") return false;
  const level = snapshot.level | 0;
  const ship = snapshot.ship || null;
  const hardGameOver = !!(ship && ship.state === "crashed" && (ship.mothershipPilots | 0) <= 0);
  if (hardGameOver) {
    return false;
  }
  if (level === 1 && !snapshot.hasLaunchedPlayerShip) {
    return false;
  }
  return true;
}
class GameLoop {
  /**
   * Main gameplay loop orchestrator.
   * @param {Object} deps
   * @param {import("./rendering.js").Renderer} deps.renderer
   * @param {import("./input.js").Input} deps.input
   * @param {Ui} deps.ui
   * @param {{toggleMuted?:()=>boolean,toggleCombatMusicEnabled?:()=>boolean,stepMusicVolume?:(direction:number)=>number,setCombatActive?:(active:boolean)=>boolean,triggerCombatImmediate?:()=>boolean,triggerVictoryMusic?:()=>boolean,returnToAmbient?:(withFade?:boolean)=>void,playSfx?:(id:string,opts?:{volume?:number,rate?:number})=>boolean,setThrustLoopActive?:(active:boolean)=>boolean}|null|undefined} [deps.audio]
   * @param {HTMLCanvasElement} deps.canvas
   * @param {HTMLCanvasElement|null|undefined} deps.overlay
   * @param {HTMLElement} deps.hud
   * @param {HTMLElement} [deps.planetLabel]
   * @param {HTMLElement} [deps.objectiveLabel]
   * @param {HTMLElement} [deps.shipStatusLabel]
   * @param {HTMLElement} [deps.heatMeter]
   * @param {HelpPopup} [deps.helpPopup]
   */
  constructor({ renderer: renderer2, input: input2, ui, audio, canvas: canvas2, hud: hud2, overlay, planetLabel: planetLabel2, objectiveLabel: objectiveLabel2, shipStatusLabel: shipStatusLabel2, heatMeter: heatMeter2, helpPopup: helpPopup2 }) {
    this.level = 1;
    const seed = performance.now();
    this.progressionSeed = seed | 0;
    const planetConfig = this._planetConfigFromLevel(this.level);
    const planetParams = resolvePlanetParams(seed, this.level, planetConfig, GAME);
    this.planet = new Planet({ seed, planetConfig, planetParams });
    this.planetParams = planetParams;
    this.renderer = renderer2;
    this.renderer.setPlanet(this.planet);
    this.input = input2;
    this.ui = ui;
    this.audio = audio || null;
    this.canvas = canvas2;
    this.hud = hud2;
    this.planetLabel = planetLabel2 || null;
    this.objectiveLabel = objectiveLabel2 || null;
    this.shipStatusLabel = shipStatusLabel2 || null;
    this.heatMeter = heatMeter2 || null;
    this.helpPopup = helpPopup2 || null;
    this.overlay = overlay || null;
    this.overlayCtx = this.overlay ? this.overlay.getContext("2d") : null;
    this.TERRAIN_PAD = 0.5;
    this.TERRAIN_MAX = this.planetParams.RMAX + this.TERRAIN_PAD;
    this.TERRAIN_IMPACT_RADIUS = 0.75;
    this.SHIP_RADIUS_BASE = 0.7 * 0.28 * GAME.SHIP_SCALE * 1.5;
    this.MINER_HEIGHT = 0.36 * GAME.MINER_SCALE;
    this.MINER_SURFACE_EPS = 0.01 * GAME.MINER_SCALE;
    this.SURFACE_EPS = Math.max(0.12, this.planetParams.RMAX / 280);
    this.COLLISION_EPS = Math.max(0.18, this.planetParams.RMAX / 240);
    this.MINER_HEAD_OFFSET = this.MINER_HEIGHT;
    this.MINER_FOOT_OFFSET = 0;
    const mothership = new Mothership({ RMAX: this.planetParams.RMAX, MOTHERSHIP_ORBIT_HEIGHT: this.planetParams.MOTHERSHIP_ORBIT_HEIGHT }, this.planet);
    const c = Math.cos(mothership.angle);
    const s = Math.sin(mothership.angle);
    this.ship = {
      x: mothership.x + c * GAME.MOTHERSHIP_START_DOCK_X - s * GAME.MOTHERSHIP_START_DOCK_Y,
      y: mothership.y + s * GAME.MOTHERSHIP_START_DOCK_X + c * GAME.MOTHERSHIP_START_DOCK_Y,
      vx: mothership.vx,
      vy: mothership.vy,
      state: "landed",
      explodeT: 0,
      lastAir: 1,
      hpCur: GAME.SHIP_STARTING_MAX_HP,
      bombsCur: GAME.SHIP_STARTING_MAX_BOMBS,
      heat: 0,
      invertT: 0,
      hitCooldown: 0,
      cabinSide: 1,
      guidePath: null,
      _dock: { lx: GAME.MOTHERSHIP_START_DOCK_X, ly: GAME.MOTHERSHIP_START_DOCK_Y },
      dropshipMiners: 0,
      dropshipPilots: 0,
      dropshipEngineers: 0,
      mothershipMiners: 0,
      mothershipPilots: 0,
      mothershipEngineers: 0,
      hpMax: GAME.SHIP_STARTING_MAX_HP,
      bombsMax: GAME.SHIP_STARTING_MAX_BOMBS,
      thrust: GAME.SHIP_STARTING_THRUST,
      gunPower: GAME.SHIP_STARTING_GUN_POWER,
      rescueeDetector: false,
      planetScanner: false
    };
    this.mothership = mothership;
    this.debris = [];
    this.playerShots = [];
    this.playerBombs = [];
    this.entityExplosions = [];
    this.minerPopups = [];
    this.shipHitPopups = [];
    this.lastAimWorld = null;
    this.lastAimScreen = null;
    this._shipWasInWater = false;
    this.PLAYER_SHOT_SPEED = 7.5;
    this.PLAYER_SHOT_LIFE = 1.2;
    this.PLAYER_SHOT_RADIUS = 0.22;
    this.PLAYER_SHOT_INTERVAL = 0.2;
    this.playerShotCooldown = 0;
    this.PLAYER_BOMB_SPEED = 4.5;
    this.PLAYER_BOMB_LIFE = 3.2;
    this.PLAYER_BOMB_RADIUS = 0.35;
    this.PLAYER_BOMB_BLAST = 0.9;
    this.PLAYER_BOMB_DAMAGE = 1.2;
    this.SHIP_HIT_BLAST = 0.55;
    this.ENEMY_HIT_BLAST = 0.35;
    this.NONLETHAL_HIT_FLASH_LIFE = 0.25;
    this.FACTORY_HIT_FLASH_T = 0.35;
    this.miners = [];
    this.minersRemaining = 0;
    this.minersDead = 0;
    this.minerTarget = 0;
    this.minerCandidates = 0;
    this.collision = createCollisionRouter(this.planet, () => this.mothership);
    this.objective = this._buildObjective(planetConfig, this.level);
    this.clearObjectiveTotal = 0;
    this.coreMeltdownActive = false;
    this.coreMeltdownT = 0;
    this.coreMeltdownDuration = 120;
    this.coreMeltdownEruptT = 0;
    console.log("[Level] init", {
      level: this.level,
      planetId: planetConfig.id,
      enemies: this._totalEnemiesForLevel(this.level),
      miners: this._targetMinersForLevel(),
      platformCount: planetConfig.platformCount,
      props: (this.planet.props || []).length
    });
    if (this.planet.props && this.planet.props.length) {
      console.log("[Level] props sample", this.planet.props.slice(0, 3).map((p) => ({ type: p.type, x: p.x, y: p.y, dead: !!p.dead })));
    }
    this.enemies = new Enemies({
      planet: this.planet,
      collision: this.collision,
      total: this._totalEnemiesForLevel(this.level),
      level: this.level,
      levelSeed: this.planet.getSeed(),
      placement: planetConfig.enemyPlacement || "random",
      onEnemyShot: () => {
        this._playSfx("enemy_fire", { volume: 0.55 });
        this._markCombatThreat();
        this._triggerCombatImmediate();
      },
      onEnemyDestroyed: () => {
        this._playSfx("enemy_destroyed", { volume: 0.8 });
      }
    });
    this._initializeClearObjectiveTracking();
    this._syncTetherProtectionStates();
    this._spawnMiners();
    this.planet.reconcileFeatures({
      enemies: this.enemies.enemies,
      miners: this.miners
    });
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.fpsTime = this.lastTime;
    this.fpsFrames = 0;
    this.fps = 0;
    this.debugCollisions = GAME.DEBUG_COLLISION;
    this.debugPlanetTriangles = false;
    this.debugCollisionContours = false;
    this.devHudVisible = false;
    if (this.input && typeof this.input.setDebugCommandsEnabled === "function") {
      this.input.setDebugCommandsEnabled(this.devHudVisible);
    }
    this.levelAdvanceReady = false;
    this.lastHeat = 0;
    this.statusCueText = "";
    this.statusCueUntil = 0;
    this._resetStartTitle();
    this.NEW_GAME_HELP_PROMPT_SECS = 10;
    this.newGameHelpPromptT = 0;
    this.newGameHelpPromptArmed = true;
    this.START_TITLE_FADE_PER_SEC = 1.8;
    this.levelWipeActive = false;
    this.levelWipeT = 0;
    this.levelWipeDir = 1;
    this.LEVEL_WIPE_DURATION = 1;
    this.COMBAT_THREAT_HOLD_MS = 12e3;
    this.OBJECTIVE_COMPLETE_SFX_DELAY_MS = 1e3;
    this.combatThreatUntilMs = 0;
    this.featureCallbacks = {
      onExplosion: (info) => {
        this.entityExplosions.push(info);
      },
      onDebris: (info) => {
        this.debris.push(info);
      },
      onAreaDamage: (x, y, radius) => {
        this._applyAreaDamage(x, y, radius);
      },
      onShipDamage: (x, y) => {
        this._damageShip(x, y);
      },
      onShipHeat: (amount) => {
        if (this.ship.state === "crashed") return;
        this.ship.heat = Math.min(100, (this.ship.heat || 0) + Math.max(0, amount));
      },
      onShipCrash: () => {
        this._triggerCrash();
      },
      onShipConfuse: (duration) => {
        if (this.ship.state === "crashed") return;
        const d = Math.max(0.1, duration || 0);
        this.ship.invertT = Math.max(this.ship.invertT || 0, d);
      },
      onEnemyHit: (enemy, x, y) => {
        enemy.hp = Math.max(0, enemy.hp - 1);
        if (enemy.hp > 0) {
          this._applyEnemyHitFeedback(enemy);
        }
      },
      onMinerKilled: () => {
        this.minersRemaining = Math.max(0, this.minersRemaining - 1);
        this.minersDead++;
      }
    };
    this.planetView = false;
    this.fogEnabled = true;
    this.hasLaunchedPlayerShip = false;
    this.pendingPerkChoice = null;
    this.objectiveCompleteSfxPlayed = this._objectiveComplete();
    this.objectiveCompleteSfxDueAtMs = Number.POSITIVE_INFINITY;
    this.victoryMusicTriggered = false;
  }
  /**
   * @param {PlanetConfig|null|undefined} cfg
   * @param {number} lvl
   * @returns {number}
   */
  _enemyTotalForConfig(cfg, lvl) {
    const base = cfg && typeof cfg.enemyCountBase === "number" ? cfg.enemyCountBase : 5;
    const per = cfg && typeof cfg.enemyCountPerLevel === "number" ? cfg.enemyCountPerLevel : 5;
    const cap = cfg && typeof cfg.enemyCountCap === "number" ? cfg.enemyCountCap : 30;
    const count = base + Math.max(0, (lvl | 0) - 1) * per;
    return Math.min(cap, count);
  }
  /**
   * @param {number} lvl
   * @returns {number}
   */
  _totalEnemiesForLevel(lvl) {
    const cfg = this.planet ? this.planet.getPlanetConfig() : null;
    return this._enemyTotalForConfig(cfg, lvl);
  }
  /**
   * @param {PlanetConfig|null|undefined} cfg
   * @param {number} lvl
   * @returns {number}
   */
  _minerTargetForConfig(cfg, lvl) {
    const base = cfg && typeof cfg.minerCountBase === "number" ? cfg.minerCountBase : 0;
    const per = cfg && typeof cfg.minerCountPerLevel === "number" ? cfg.minerCountPerLevel : 0;
    const cap = cfg && typeof cfg.minerCountCap === "number" ? cfg.minerCountCap : 0;
    return Math.min(cap, base + Math.max(0, (lvl | 0) - 1) * per);
  }
  /**
   * @returns {number}
   */
  _targetMinersForLevel() {
    const cfg = this.planet ? this.planet.getPlanetConfig() : null;
    return this._minerTargetForConfig(cfg, this.level);
  }
  /**
   * @param {import("./planet_config.js").PlanetConfig} cfg
   * @param {number} lvl
   * @returns {{type:string,target:number}}
   */
  _buildObjective(cfg, lvl) {
    const obj = cfg && cfg.objective ? cfg.objective : { type: "extract", count: 0 };
    if (cfg && cfg.id === "mechanized" && lvl >= 16) {
      const target = this._tetherPropsAll().length;
      if (target > 0) {
        return { type: "destroy_core", target };
      }
    }
    if (obj.type === "clear") {
      const target = obj.count && obj.count > 0 ? obj.count : this._totalEnemiesForLevel(lvl);
      return { type: "clear", target };
    }
    if (obj.type === "extract") {
      const base = cfg && typeof cfg.minerCountBase === "number" ? cfg.minerCountBase : 5;
      const per = cfg && typeof cfg.minerCountPerLevel === "number" ? cfg.minerCountPerLevel : 2;
      const cap = cfg && typeof cfg.minerCountCap === "number" ? cfg.minerCountCap : 30;
      const target = obj.count && obj.count > 0 ? obj.count : Math.min(cap, base + Math.max(0, (lvl | 0) - 1) * per);
      return { type: "extract", target };
    }
    return { type: obj.type || "extract", target: obj.count || 0 };
  }
  /**
   * @returns {boolean}
   */
  _isMechanizedLevel() {
    const cfg = this.planet && this.planet.getPlanetConfig ? this.planet.getPlanetConfig() : null;
    return !!(cfg && cfg.id === "mechanized");
  }
  /**
   * @returns {boolean}
   */
  _isMechanizedCoreLevel() {
    return this._isMechanizedLevel() && !!(this.planet && this.planet.getCoreRadius && this.planet.getCoreRadius() > 0.5);
  }
  /**
   * @returns {Array<any>}
   */
  _factoryPropsAlive() {
    const out = [];
    if (!this.planet || !this.planet.props || !this.planet.props.length) return out;
    for (const p of this.planet.props) {
      if (p.type !== "factory") continue;
      if (p.dead || typeof p.hp === "number" && p.hp <= 0) continue;
      out.push(p);
    }
    return out;
  }
  /**
   * @returns {Array<any>}
   */
  _tetherPropsAlive() {
    const out = [];
    if (!this.planet || !this.planet.props || !this.planet.props.length) return out;
    for (const p of this.planet.props) {
      if (p.type !== "tether") continue;
      if (p.dead || typeof p.hp === "number" && p.hp <= 0) continue;
      out.push(p);
    }
    return out;
  }
  /**
   * @returns {Array<any>}
   */
  _tetherPropsAll() {
    const out = [];
    if (!this.planet || !this.planet.props || !this.planet.props.length) return out;
    for (const p of this.planet.props) {
      if (p.type === "tether") out.push(p);
    }
    return out;
  }
  /**
   * @param {number} propId
   * @returns {any|null}
   */
  _findFactoryById(propId) {
    if (!this.planet || !this.planet.props || !this.planet.props.length) return null;
    for (const p of this.planet.props) {
      if (p.type !== "factory") continue;
      if ((p.propId | 0) === (propId | 0)) return p;
    }
    return null;
  }
  /**
   * @param {any} tether
   * @returns {boolean}
   */
  _isTetherUnlocked(tether) {
    if (!tether) return false;
    const protectedBy = typeof tether.protectedBy === "number" ? tether.protectedBy : -1;
    if (protectedBy < 0) return true;
    const factory = this._findFactoryById(protectedBy);
    if (!factory) return true;
    if (factory.dead) return true;
    if (typeof factory.hp === "number" && factory.hp <= 0) return true;
    return false;
  }
  /**
   * @returns {void}
   */
  _syncTetherProtectionStates() {
    const tethers = this._tetherPropsAll();
    if (!tethers.length) return;
    for (const t of tethers) {
      t.locked = !this._isTetherUnlocked(t);
    }
  }
  /**
   * @returns {number}
   */
  _remainingCombatEnemies() {
    if (!this.enemies || !this.enemies.enemies) return 0;
    let c = 0;
    for (const e of this.enemies.enemies) {
      if (!e || e.hp <= 0) continue;
      c++;
    }
    return c;
  }
  /**
   * @returns {number}
   */
  _remainingClearTargets() {
    let remaining = this._remainingCombatEnemies();
    if (this._isMechanizedLevel()) {
      remaining += this._factoryPropsAlive().length;
    }
    return remaining;
  }
  /**
   * Recompute clear-objective totals at level init.
   * @returns {void}
   */
  _initializeClearObjectiveTracking() {
    if (!this.objective || this.objective.type !== "clear") {
      this.clearObjectiveTotal = 0;
      return;
    }
    const remaining = this._remainingClearTargets();
    this.clearObjectiveTotal = Math.max(this.objective.target || 0, remaining);
    this.objective.target = this.clearObjectiveTotal;
  }
  /**
   * @returns {string}
   */
  _objectiveText() {
    if (!this.objective) return "";
    if (this.objective.type === "destroy_core") {
      const target = Math.max(this.objective.target || 0, this._tetherPropsAll().length);
      const remaining = this._tetherPropsAlive().length;
      const done = target ? Math.max(0, target - remaining) : 0;
      if (this.coreMeltdownActive) {
        const timeLeft = Math.max(0, this.coreMeltdownDuration - this.coreMeltdownT);
        return `Objective: Escape to mothership ${Math.ceil(timeLeft)}s`;
      }
      return `Objective: Destroy core ${done}${target ? `/${target}` : ""}`;
    }
    if (this.objective.type === "clear") {
      const remaining = this._remainingClearTargets();
      const target = Math.max(this.objective.target || 0, this.clearObjectiveTotal || 0, remaining);
      const done = target ? Math.max(0, target - remaining) : 0;
      return `Objective: Clear ${done}${target ? `/${target}` : ""}`;
    }
    if (this.objective.type === "extract") {
      const remaining = this.minersRemaining;
      const target = this.objective.target || 0;
      const rescued = target ? Math.max(0, target - remaining) : 0;
      return `Objective: Extract ${rescued}${target ? `/${target}` : ""} (dead ${this.minersDead})`;
    }
    if (this.minerTarget > 0) {
      const remaining = this.enemies ? this.enemies.enemies.length : 0;
      const clearTarget = this.objective && this.objective.target ? this.objective.target : 0;
      const cleared = clearTarget ? Math.max(0, clearTarget - remaining) : 0;
      const rescued = Math.max(0, this.minerTarget - this.minersRemaining);
      return `Objective: Clear ${cleared}/${clearTarget} | Rescue ${rescued}/${this.minerTarget} (dead ${this.minersDead})`;
    }
    return `Objective: ${this.objective.type}`;
  }
  /**
   * @returns {void}
   */
  _resetShip() {
    const c = Math.cos(this.mothership.angle);
    const s = Math.sin(this.mothership.angle);
    this.ship.x = this.mothership.x + c * GAME.MOTHERSHIP_START_DOCK_X - s * GAME.MOTHERSHIP_START_DOCK_Y;
    this.ship.y = this.mothership.y + s * GAME.MOTHERSHIP_START_DOCK_X + c * GAME.MOTHERSHIP_START_DOCK_Y;
    this.ship.vx = this.mothership.vx;
    this.ship.vy = this.mothership.vy;
    this.ship.state = "landed";
    this.ship.explodeT = 0;
    this.ship.hpCur = this.ship.hpMax;
    this.ship.bombsCur = this.ship.bombsMax;
    this.ship.heat = 0;
    this.ship.invertT = 0;
    this.ship.hitCooldown = 0;
    this.ship.dropshipMiners = 0;
    this.ship.dropshipPilots = 0;
    this.ship.dropshipEngineers = 0;
    if (this.ship._dock === null) {
      this.ship._dock = { lx: GAME.MOTHERSHIP_START_DOCK_X, ly: GAME.MOTHERSHIP_START_DOCK_Y };
    }
    this.debris.length = 0;
    this.playerShots.length = 0;
    this.playerBombs.length = 0;
    this.entityExplosions.length = 0;
    this.minerPopups.length = 0;
    this.shipHitPopups.length = 0;
    this.playerShotCooldown = 0;
    this.planet.clearFeatureParticles();
    this.lastAimWorld = null;
    this.lastAimScreen = null;
    this.lastHeat = 0;
    this._shipWasInWater = false;
    this.combatThreatUntilMs = 0;
    this._setCombatActive(false);
    this._setThrustLoopActive(false);
  }
  /**
   * @returns {void}
   */
  _putShipInLowOrbit() {
    const orbitState = this.planet.orbitStateFromElements(this.planet.planetRadius + 1, 0, 0, true);
    this.ship.x = orbitState.x;
    this.ship.y = orbitState.y;
    this.ship.vx = orbitState.vx;
    this.ship.vy = orbitState.vy;
    this.ship.state = "flying";
    this.ship._dock = null;
  }
  /**
   * @returns {void}
   */
  _triggerCrash() {
    if (this.ship.state === "crashed") return;
    this.ship.state = "crashed";
    this.ship.explodeT = 0;
    this.combatThreatUntilMs = 0;
    this._setCombatActive(false);
    this._setThrustLoopActive(false);
    this._playSfx("ship_crash", { volume: 0.9 });
    this.lastAimWorld = null;
    this.lastAimScreen = null;
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
    this.minersDead += this.ship.dropshipMiners;
    this.minersDead += this.ship.dropshipPilots;
    this.minersDead += this.ship.dropshipEngineers;
    this.ship.dropshipMiners = 0;
    this.ship.dropshipPilots = 0;
    this.ship.dropshipEngineers = 0;
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {void}
   */
  _damageShip(x, y) {
    if (this.ship.state === "crashed") return;
    if (this.ship.hitCooldown > 0) return;
    this._markCombatThreat();
    this._triggerCombatImmediate();
    this.ship.hpCur = Math.max(0, this.ship.hpCur - 1);
    this.ship.hitCooldown = GAME.SHIP_HIT_COOLDOWN;
    this._playSfx("ship_hit", { volume: 0.8 });
    this.entityExplosions.push({ x, y, life: 0.5, radius: this.SHIP_HIT_BLAST });
    this.shipHitPopups.push({
      x: this.ship.x,
      y: this.ship.y,
      vx: 0,
      vy: 0,
      life: GAME.SHIP_HIT_POPUP_LIFE
    });
    if (this.ship.hpCur <= 0) {
      this._triggerCrash();
    }
  }
  /**
   * @param {{x:number,y:number,hitT?:number}} enemy
   * @returns {void}
   */
  _applyEnemyHitFeedback(enemy) {
    enemy.hitT = 0.25;
    this.entityExplosions.push({
      x: enemy.x,
      y: enemy.y,
      life: this.NONLETHAL_HIT_FLASH_LIFE,
      radius: this.ENEMY_HIT_BLAST
    });
  }
  /**
   * @param {{x:number,y:number,scale?:number,hitT?:number}} factory
   * @returns {void}
   */
  _applyFactoryHitFeedback(factory) {
    factory.hitT = this.FACTORY_HIT_FLASH_T;
    this.entityExplosions.push({
      x: factory.x,
      y: factory.y,
      life: this.NONLETHAL_HIT_FLASH_LIFE,
      radius: 0.4 * (factory.scale || 1)
    });
  }
  /**
   * @param {string} id
   * @param {{volume?:number,rate?:number}} [opts]
   * @returns {void}
   */
  _playSfx(id, opts) {
    if (!this.audio || typeof this.audio.playSfx !== "function") return;
    this.audio.playSfx(id, opts);
  }
  /**
   * @param {string} text
   * @param {number} [duration]
   * @returns {void}
   */
  _showStatusCue(text, duration = 1.5) {
    this.statusCueText = text || "";
    this.statusCueUntil = performance.now() + Math.max(0.1, duration) * 1e3;
  }
  /**
   * @param {boolean} active
   * @returns {void}
   */
  _setThrustLoopActive(active) {
    if (!this.audio || typeof this.audio.setThrustLoopActive !== "function") return;
    this.audio.setThrustLoopActive(active);
  }
  /**
   * @param {boolean} active
   * @returns {void}
   */
  _setCombatActive(active) {
    if (!this.audio || typeof this.audio.setCombatActive !== "function") return;
    this.audio.setCombatActive(active);
  }
  /**
   * @param {number} [holdMs]
   * @returns {void}
   */
  _markCombatThreat(holdMs) {
    const hold = Number.isFinite(holdMs) ? holdMs : this.COMBAT_THREAT_HOLD_MS;
    const now = performance.now();
    this.combatThreatUntilMs = Math.max(this.combatThreatUntilMs, now + Math.max(0, hold));
  }
  /**
   * @returns {void}
   */
  _triggerCombatImmediate() {
    if (this.ship.state === "crashed") return;
    if (this._objectiveComplete()) return;
    if (!this.audio || typeof this.audio.triggerCombatImmediate !== "function") return;
    this.audio.triggerCombatImmediate();
  }
  /**
   * @returns {void}
   */
  _triggerVictoryMusic() {
    if (!this.audio || typeof this.audio.triggerVictoryMusic !== "function") return;
    this.audio.triggerVictoryMusic();
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
    const viewState = this._viewState();
    const camRot = viewState.angle;
    const s = 1 / viewState.radius;
    const aspect = w / h;
    const sx = s / aspect;
    const sy = s;
    const px = xN / sx;
    const py = yN / sy;
    const c = Math.cos(-camRot), s2 = Math.sin(-camRot);
    const wx = c * px - s2 * py + viewState.xCenter;
    const wy = s2 * px + c * py + viewState.yCenter;
    return { x: wx, y: wy };
  }
  /**
   * @param {number} aspect
   * @returns {{xCenter:number,yCenter:number,c:number,s:number,sx:number,sy:number}}
   */
  _screenTransform(aspect) {
    const viewState = this._viewState();
    const camRot = viewState.angle;
    const s = 1 / viewState.radius;
    return {
      xCenter: viewState.xCenter,
      yCenter: viewState.yCenter,
      c: Math.cos(camRot),
      s: Math.sin(camRot),
      sx: s / aspect,
      sy: s
    };
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {{xCenter:number,yCenter:number,c:number,s:number,sx:number,sy:number}} t
   * @returns {{x:number,y:number}}
   */
  _worldToScreenNorm(x, y, t) {
    const dx = x - t.xCenter;
    const dy = y - t.yCenter;
    const rx = t.c * dx - t.s * dy;
    const ry = t.s * dx + t.c * dy;
    return {
      x: rx * t.sx * 0.5 + 0.5,
      y: 0.5 - ry * t.sy * 0.5
    };
  }
  /**
   * @param {{x:number,y:number}|null|undefined} aim
   * @returns {{x:number,y:number}|null}
   */
  _aimScreenAroundShip(aim) {
    if (!aim) return null;
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    const aspect = w / h;
    const t = this._screenTransform(aspect);
    const ship = this._worldToScreenNorm(this.ship.x, this.ship.y, t);
    const ox = aim.x - 0.5;
    const oy = aim.y - 0.5;
    return {
      x: ship.x + ox,
      y: ship.y + oy
    };
  }
  /**
   * @param {number} screenFrac
   * @returns {number}
   */
  _aimWorldDistance(screenFrac) {
    const s = GAME.PLANETSIDE_ZOOM / (this.planetParams.RMAX + this.planetParams.PAD);
    return 2 * screenFrac / s;
  }
  /**
   * Seed a stable default reticle ahead of the ship when no pointer/stick aim exists.
   * @returns {{x:number,y:number}|null}
   */
  _defaultAimScreenFromShip() {
    const r2 = Math.hypot(this.ship.x, this.ship.y) || 1;
    const upx = this.ship.x / r2;
    const upy = this.ship.y / r2;
    const rightx = upy;
    const righty = -upx;
    const side = this.ship.cabinSide || 1;
    const dirx = rightx * side;
    const diry = righty * side;
    const gunOrigin = this._shipGunPivotWorld();
    const aimLen = Math.max(4, this._aimWorldDistance(GAME.AIM_SCREEN_RADIUS || 0.25));
    const aimWorldX = gunOrigin.x + dirx * aimLen;
    const aimWorldY = gunOrigin.y + diry * aimLen;
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    const screen = this._worldToScreenNorm(aimWorldX, aimWorldY, this._screenTransform(w / h));
    return {
      x: Math.max(0, Math.min(1, screen.x)),
      y: Math.max(0, Math.min(1, screen.y))
    };
  }
  /**
   * @returns {ViewState}
   */
  _viewState() {
    if (this.planetView) {
      return {
        xCenter: 0,
        yCenter: 0,
        radius: (this.planet.planetRadius + CFG.PAD) * 1.05,
        angle: 0
      };
    }
    const radiusViewMin = GAME.PLANETSIDE_ZOOM;
    const rShip = Math.hypot(this.ship.x, this.ship.y);
    const rPlanet = this.planetParams.RMAX + this.planetParams.PAD;
    let uTransition = Math.max(0, Math.min(1, (rShip - rPlanet) / rPlanet));
    uTransition = (3 - 2 * uTransition) * uTransition * uTransition;
    const rFramedMin = rShip - radiusViewMin + (-rPlanet - (rShip - radiusViewMin)) * uTransition;
    const rFramedMax = rShip + radiusViewMin;
    const rViewCenter = (rFramedMin + rFramedMax) / 2;
    const scale = rViewCenter / rShip;
    const posViewCenterX = scale * this.ship.x;
    const posViewCenterY = scale * this.ship.y;
    const radiusView = (rFramedMax - rFramedMin) / 2;
    const view = {
      xCenter: posViewCenterX,
      yCenter: posViewCenterY,
      radius: radiusView,
      angle: Math.atan2(this.ship.x, this.ship.y || 1e-6)
    };
    if (this.mothership) {
      const dx = this.ship.x - this.mothership.x;
      const dy = this.ship.y - this.mothership.y;
      const d = Math.hypot(dx, dy);
      let t = Math.max(0, Math.min(1, (12 - d) / 8));
      t = (3 - 2 * t) * t * t;
      view.xCenter = view.xCenter * (1 - t) + this.ship.x * t;
      view.yCenter = view.yCenter * (1 - t) + this.ship.y * t;
      view.radius = radiusView * (1 - t) + GAME.MOTHERSHIP_ZOOM * t;
    }
    if (this.coreMeltdownActive && !this._isDockedWithMothership()) {
      const t = (this.lastTime || performance.now()) * 1e-3;
      const progress = Math.max(0, Math.min(1, this.coreMeltdownT / Math.max(1e-3, this.coreMeltdownDuration)));
      const amp = 0.035 + 0.085 * progress;
      view.xCenter += Math.sin(t * 24.7) * amp + Math.sin(t * 41.3) * amp * 0.45;
      view.yCenter += Math.cos(t * 19.9) * amp + Math.cos(t * 37.1) * amp * 0.45;
    }
    return view;
  }
  /**
   * @returns {{rockDark:[number,number,number],rockLight:[number,number,number],airDark:[number,number,number],airLight:[number,number,number],surfaceRockDark:[number,number,number],surfaceRockLight:[number,number,number],surfaceBand:number}}
   */
  _planetPalette() {
    const cfg = this.planet ? this.planet.getPlanetConfig() : null;
    const def = cfg && cfg.defaults ? cfg.defaults : null;
    if (!def) {
      return {
        rockDark: (
          /** @type {[number,number,number]} */
          CFG.ROCK_DARK
        ),
        rockLight: (
          /** @type {[number,number,number]} */
          CFG.ROCK_LIGHT
        ),
        airDark: (
          /** @type {[number,number,number]} */
          CFG.AIR_DARK
        ),
        airLight: (
          /** @type {[number,number,number]} */
          CFG.AIR_LIGHT
        ),
        surfaceRockDark: (
          /** @type {[number,number,number]} */
          CFG.ROCK_DARK
        ),
        surfaceRockLight: (
          /** @type {[number,number,number]} */
          CFG.ROCK_LIGHT
        ),
        surfaceBand: 0
      };
    }
    return {
      rockDark: def.ROCK_DARK ?? /** @type {[number,number,number]} */
      CFG.ROCK_DARK,
      rockLight: def.ROCK_LIGHT ?? /** @type {[number,number,number]} */
      CFG.ROCK_LIGHT,
      airDark: def.AIR_DARK ?? /** @type {[number,number,number]} */
      CFG.AIR_DARK,
      airLight: def.AIR_LIGHT ?? /** @type {[number,number,number]} */
      CFG.AIR_LIGHT,
      surfaceRockDark: def.SURFACE_ROCK_DARK ?? def.ROCK_DARK ?? /** @type {[number,number,number]} */
      CFG.ROCK_DARK,
      surfaceRockLight: def.SURFACE_ROCK_LIGHT ?? def.ROCK_LIGHT ?? /** @type {[number,number,number]} */
      CFG.ROCK_LIGHT,
      surfaceBand: typeof def.SURFACE_BAND === "number" ? def.SURFACE_BAND : 0
    };
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {void}
   */
  _applyBombImpact(x, y) {
    const cfg = this.planet ? this.planet.getPlanetConfig() : null;
    if (cfg && cfg.flags && cfg.flags.disableTerrainDestruction) return;
    const newAir = this.planet.applyAirEdit(x, y, this.TERRAIN_IMPACT_RADIUS, 1);
    if (newAir) this.renderer.updateAir(newAir);
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
        this._damageShip(x, y);
      }
    }
    for (let j = this.enemies.enemies.length - 1; j >= 0; j--) {
      const e = this.enemies.enemies[j];
      const dx = e.x - x;
      const dy = e.y - y;
      if (dx * dx + dy * dy <= r2) {
        e.hp = 0;
      }
    }
    for (let j = this.miners.length - 1; j >= 0; j--) {
      const m = this.miners[j];
      const dx = m.x - x;
      const dy = m.y - y;
      if (dx * dx + dy * dy <= r2) {
        this.miners.splice(j, 1);
        this.minersRemaining = Math.max(0, this.minersRemaining - 1);
        this.minersDead++;
      }
    }
    this._damageFactoriesAt(x, y, this.PLAYER_BOMB_DAMAGE, 999, true);
    this._destroyTethersAt(x, y, this.PLAYER_BOMB_DAMAGE);
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} radius
   * @returns {void}
   */
  _applyAreaDamage(x, y, radius) {
    const r2 = radius * radius;
    if (this.ship.state !== "crashed") {
      const dx = this.ship.x - x;
      const dy = this.ship.y - y;
      if (dx * dx + dy * dy <= r2) {
        this._damageShip(x, y);
      }
    }
    for (let j = this.enemies.enemies.length - 1; j >= 0; j--) {
      const e = this.enemies.enemies[j];
      const dx = e.x - x;
      const dy = e.y - y;
      if (dx * dx + dy * dy <= r2) {
        e.hp = Math.max(0, e.hp - this.ship.gunPower);
        if (e.hp > 0) {
          this._applyEnemyHitFeedback(e);
        }
      }
    }
    for (let j = this.miners.length - 1; j >= 0; j--) {
      const m = this.miners[j];
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
   * @param {{x:number,y:number,nx?:number,ny?:number}} p
   * @returns {{nx:number,ny:number,tx:number,ty:number}}
   */
  _propBasis(p) {
    let nx = typeof p.nx === "number" ? p.nx : 0;
    let ny = typeof p.ny === "number" ? p.ny : 0;
    if (!nx && !ny) {
      const r2 = Math.hypot(p.x, p.y) || 1;
      nx = p.x / r2;
      ny = p.y / r2;
    } else {
      const len = Math.hypot(nx, ny) || 1;
      nx /= len;
      ny /= len;
    }
    return { nx, ny, tx: -ny, ty: nx };
  }
  /**
   * @param {any} p
   * @returns {number}
   */
  _factoryHitRadius(p) {
    const s = p && p.scale ? p.scale : 1;
    return 0.42 * s;
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {{
   *  pieces?:number,
   *  speedMin?:number,
   *  speedMax?:number,
   *  lifeMin?:number,
   *  lifeMax?:number,
   *  offset?:number,
   *  spin?:number,
   *  baseVx?:number,
   *  baseVy?:number,
   * }} [opts]
   * @returns {void}
   */
  _spawnDebrisBurst(x, y, opts) {
    const pieces = opts && typeof opts.pieces === "number" ? Math.max(1, opts.pieces | 0) : 6;
    const speedMin = opts && typeof opts.speedMin === "number" ? opts.speedMin : 1;
    const speedMax = opts && typeof opts.speedMax === "number" ? opts.speedMax : 2;
    const lifeMin = opts && typeof opts.lifeMin === "number" ? opts.lifeMin : 0.9;
    const lifeMax = opts && typeof opts.lifeMax === "number" ? opts.lifeMax : 0.8;
    const offset = opts && typeof opts.offset === "number" ? opts.offset : 0.08;
    const spin = opts && typeof opts.spin === "number" ? opts.spin : 6;
    const baseVx = opts && typeof opts.baseVx === "number" ? opts.baseVx : 0;
    const baseVy = opts && typeof opts.baseVy === "number" ? opts.baseVy : 0;
    for (let i = 0; i < pieces; i++) {
      const ang = Math.random() * Math.PI * 2;
      const sp = speedMin + Math.random() * speedMax;
      this.debris.push({
        x: x + Math.cos(ang) * offset,
        y: y + Math.sin(ang) * offset,
        vx: baseVx + Math.cos(ang) * sp,
        vy: baseVy + Math.sin(ang) * sp,
        a: Math.random() * Math.PI * 2,
        w: (Math.random() - 0.5) * spin,
        life: lifeMin + Math.random() * lifeMax
      });
    }
  }
  /**
   * @param {any} p
   * @returns {void}
   */
  _destroyFactoryProp(p) {
    if (!p || p.dead) return;
    p.hp = 0;
    p.dead = true;
    const s = p.scale || 1;
    this.entityExplosions.push({ x: p.x, y: p.y, life: 0.65, radius: 0.95 * s });
    this._spawnDebrisBurst(p.x, p.y, {
      pieces: 9,
      speedMin: 0.95,
      speedMax: 1.8,
      lifeMin: 0.8,
      lifeMax: 0.7,
      offset: 0.1 * s,
      spin: 7
    });
    this._playSfx("enemy_destroyed", {
      volume: 0.78,
      rate: 0.85 + Math.random() * 0.14
    });
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} radius
   * @param {number} damage
   * @param {boolean} forceKill
   * @returns {boolean}
   */
  _damageFactoriesAt(x, y, radius, damage = 1, forceKill = false) {
    if (!this._isMechanizedLevel()) return false;
    return this._damageFactoryPropsAt(this._factoryPropsAlive(), x, y, radius, damage, forceKill);
  }
  /**
   * @param {Array<any>|null|undefined} factories
   * @param {number} x
   * @param {number} y
   * @param {number} radius
   * @param {number} damage
   * @param {boolean} forceKill
   * @returns {boolean}
   */
  _damageFactoryPropsAt(factories, x, y, radius, damage = 1, forceKill = false) {
    if (!factories || !factories.length) return false;
    let hit = false;
    let factoryDestroyed = false;
    for (const p of factories) {
      if (!p || p.type !== "factory") continue;
      if (p.dead || typeof p.hp === "number" && p.hp <= 0) continue;
      const rr = radius + this._factoryHitRadius(p);
      const dx = p.x - x;
      const dy = p.y - y;
      if (dx * dx + dy * dy > rr * rr) continue;
      hit = true;
      if (forceKill) {
        p.hp = 0;
      } else {
        const cur = typeof p.hp === "number" ? p.hp : 5;
        p.hp = Math.max(0, cur - Math.max(0.1, damage));
      }
      if ((p.hp || 0) <= 0) {
        this._destroyFactoryProp(p);
        factoryDestroyed = true;
      } else {
        this._applyFactoryHitFeedback(p);
      }
    }
    if (factoryDestroyed) {
      this._syncTetherProtectionStates();
    }
    return hit;
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} radius
   * @returns {boolean}
   */
  _destroyTethersAt(x, y, radius) {
    if (!this._isMechanizedCoreLevel()) return false;
    const tethers = this._tetherPropsAlive();
    if (!tethers.length) return false;
    let destroyed = false;
    for (const t of tethers) {
      if (!this._isTetherUnlocked(t)) continue;
      if (!this._solidPropPenetration(t, x, y, radius)) continue;
      t.dead = true;
      t.hp = 0;
      destroyed = true;
      const blastR = Math.max(0.5, (typeof t.halfLength === "number" ? t.halfLength : 0.9) * 0.35);
      this.entityExplosions.push({ x: t.x, y: t.y, life: 0.75, radius: blastR });
    }
    if (destroyed && this._tetherPropsAlive().length <= 0) {
      this._startCoreMeltdown();
    }
    return destroyed;
  }
  /**
   * @returns {boolean}
   */
  _heatMechanicsActive() {
    const cfg = this.planet && this.planet.getPlanetConfig ? this.planet.getPlanetConfig() : null;
    if (!cfg) return false;
    if (cfg.id === "molten") return true;
    return this._isMechanizedCoreLevel();
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} radius
   * @returns {void}
   */
  _applyMeltdownAirEdit(x, y, radius) {
    if (!this.planet || !this.renderer) return;
    const newAir = this.planet.applyAirEdit(x, y, radius, 1);
    if (newAir) this.renderer.updateAir(newAir);
  }
  /**
   * @returns {void}
   */
  _startCoreMeltdown() {
    if (this.coreMeltdownActive) return;
    this.coreMeltdownActive = true;
    this.coreMeltdownT = 0;
    this.coreMeltdownEruptT = 0;
    this._syncTetherProtectionStates();
    const coreR = this.planet && this.planet.getCoreRadius ? this.planet.getCoreRadius() : 0;
    this.entityExplosions.push({ x: 0, y: 0, life: 1.2, radius: Math.max(1.5, coreR * 0.6) });
  }
  /**
   * @param {number} dt
   * @returns {void}
   */
  _updateCoreMeltdown(dt) {
    if (!this.coreMeltdownActive) return;
    const coreR = this.planet && this.planet.getCoreRadius ? this.planet.getCoreRadius() : 0;
    if (coreR <= 0) return;
    this.coreMeltdownT += dt;
    const progress = Math.max(0, Math.min(1, this.coreMeltdownT / Math.max(1e-3, this.coreMeltdownDuration)));
    const featureParticles = this.planet && this.planet.getFeatureParticles ? this.planet.getFeatureParticles() : null;
    const lava = featureParticles && featureParticles.lava ? featureParticles.lava : null;
    if (lava) {
      const rate = 10 + 24 * progress;
      const emitBase = rate * dt;
      const emitWhole = Math.floor(emitBase);
      const emitCount = emitWhole + (Math.random() < emitBase - emitWhole ? 1 : 0);
      for (let i = 0; i < emitCount; i++) {
        const ang = Math.random() * Math.PI * 2;
        const nx = Math.cos(ang);
        const ny = Math.sin(ang);
        const tx = -ny;
        const ty = nx;
        const spread = (Math.random() * 2 - 1) * (0.22 + progress * 0.28);
        const speed = 2.2 + progress * 3.8 + Math.random() * 1.2;
        lava.push({
          x: nx * (coreR + 0.15),
          y: ny * (coreR + 0.15),
          vx: (nx + tx * spread) * speed,
          vy: (ny + ty * spread) * speed,
          life: 1 + Math.random() * 0.8
        });
      }
    }
    this.coreMeltdownEruptT -= dt;
    if (this.coreMeltdownEruptT <= 0) {
      this.coreMeltdownEruptT = Math.max(0.18, 0.95 - progress * 0.7);
      const maxReach = coreR + 1 + progress * Math.max(1.2, this.planetParams.RMAX - coreR - 0.8);
      const burstCount = 1 + (Math.random() < 0.5 + progress * 0.35 ? 1 : 0);
      for (let b = 0; b < burstCount; b++) {
        const ang = Math.random() * Math.PI * 2;
        const nx = Math.cos(ang);
        const ny = Math.sin(ang);
        const reach = coreR + 0.65 + Math.random() * Math.max(0.25, maxReach - coreR - 0.65);
        const segments = 2 + Math.floor(progress * 5);
        for (let s = 0; s < segments; s++) {
          const t = segments <= 1 ? 1 : s / (segments - 1);
          const r2 = coreR + 0.55 + (reach - coreR - 0.55) * t;
          const x = nx * r2;
          const y = ny * r2;
          const carveR = 0.45 + progress * 1 + Math.random() * 0.25;
          this._applyMeltdownAirEdit(x, y, carveR);
          this.entityExplosions.push({ x, y, life: 0.45 + progress * 0.4, radius: carveR * 0.85 });
        }
      }
    }
    if (this.coreMeltdownT >= this.coreMeltdownDuration && !this._isDockedWithMothership() && this.ship.state !== "crashed") {
      this._triggerCrash();
    }
  }
  /**
   * @param {any} factory
   * @returns {boolean}
   */
  _spawnEnemyFromFactory(factory) {
    if (!factory || factory.dead || (factory.hp || 0) <= 0) return false;
    if (!this.enemies || !this.enemies.enemies) return false;
    const cfg = this.planet && this.planet.getPlanetConfig ? this.planet.getPlanetConfig() : null;
    const maxEnemies = cfg && typeof cfg.enemyCountCap === "number" ? Math.max(0, cfg.enemyCountCap | 0) : 30;
    if (this._remainingCombatEnemies() >= maxEnemies) return false;
    const allow = cfg && cfg.enemyAllow ? cfg.enemyAllow : [];
    const pool = allow.filter((t) => t === "hunter" || t === "ranger" || t === "crawler");
    const type = pool.length ? pool[Math.floor(Math.random() * pool.length)] : "hunter";
    const { nx, ny, tx, ty } = this._propBasis(factory);
    const s = factory.scale || 1;
    let x = factory.x + nx * (0.58 * s + 0.28);
    let y = factory.y + ny * (0.58 * s + 0.28);
    x += tx * ((Math.random() * 2 - 1) * 0.16);
    y += ty * ((Math.random() * 2 - 1) * 0.16);
    if (this.collision.airValueAtWorld(x, y) <= 0.5) {
      const nudge = this.planet.nudgeOutOfTerrain(x, y, 0.9, 0.08, 0.18);
      if (!nudge.ok) return false;
      x = nudge.x;
      y = nudge.y;
      if (this.collision.airValueAtWorld(x, y) <= 0.5) return false;
    }
    const cooldown = Math.random();
    if (type === "hunter") {
      this.enemies.enemies.push({ type, x, y, vx: 0, vy: 0, cooldown, hp: 3, iNodeGoal: null });
    } else if (type === "ranger") {
      this.enemies.enemies.push({ type, x, y, vx: 0, vy: 0, cooldown, hp: 2, iNodeGoal: null });
    } else {
      const ang = Math.random() * Math.PI * 2;
      const speed = Math.min(3, this.level * 0.25 + 0.5);
      this.enemies.enemies.push({ type: "crawler", x, y, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, cooldown: 0, hp: 1, iNodeGoal: null });
    }
    if (this.objective && this.objective.type === "clear") {
      this.clearObjectiveTotal = Math.max(this.clearObjectiveTotal || 0, this._remainingClearTargets()) + 1;
      this.objective.target = this.clearObjectiveTotal;
    }
    this.entityExplosions.push({ x, y, life: 0.35, radius: 0.45 });
    return true;
  }
  /**
   * @param {number} dt
   * @returns {void}
   */
  _updateFactorySpawns(dt) {
    if (!this._isMechanizedLevel()) return;
    const factories = this._factoryPropsAlive();
    if (!factories.length) return;
    for (const p of factories) {
      p.spawnCd = typeof p.spawnCd === "number" && p.spawnCd > 0 ? p.spawnCd : 6.5 + Math.random() * 4;
      p.spawnT = typeof p.spawnT === "number" ? p.spawnT + dt : Math.random() * p.spawnCd;
      if (p.spawnT < p.spawnCd) continue;
      p.spawnT -= p.spawnCd;
      p.spawnCd = 6.5 + Math.random() * 4;
      this._spawnEnemyFromFactory(p);
    }
  }
  /**
   * @param {any} p
   * @param {number} x
   * @param {number} y
   * @param {number} radius
   * @returns {{nx:number,ny:number,depth:number}|null}
   */
  _solidPropPenetration(p, x, y, radius) {
    if (!p || p.dead) return null;
    if (p.type !== "gate" && p.type !== "factory" && p.type !== "tether") return null;
    const { nx, ny, tx, ty } = this._propBasis(p);
    const dx = x - p.x;
    const dy = y - p.y;
    const lx = dx * tx + dy * ty;
    const ly = dx * nx + dy * ny;
    const s = p.scale || 1;
    const halfW = p.type === "gate" ? 0.62 * s : p.type === "factory" ? 0.45 * s : (typeof p.halfWidth === "number" ? p.halfWidth : 0.12) * s;
    const halfN = p.type === "gate" ? 0.12 * s : p.type === "factory" ? 0.2 * s : (typeof p.halfLength === "number" ? p.halfLength : 0.9) * s;
    const overX = halfW + radius - Math.abs(lx);
    const overY = halfN + radius - Math.abs(ly);
    if (overX <= 0 || overY <= 0) return null;
    const sign = ly >= 0 ? 1 : -1;
    return { nx: nx * sign, ny: ny * sign, depth: overY };
  }
  /**
   * @returns {void}
   */
  _resolveShipSolidPropCollisions() {
    if (!this._isMechanizedLevel()) return;
    if (!this.planet || !this.planet.props || !this.planet.props.length) return;
    if (this.ship.state === "crashed") return;
    const radius = this._shipRadius();
    for (const p of this.planet.props) {
      const hit = this._solidPropPenetration(p, this.ship.x, this.ship.y, radius);
      if (!hit) continue;
      this.ship.x += hit.nx * (hit.depth + 0.01);
      this.ship.y += hit.ny * (hit.depth + 0.01);
      const vn = this.ship.vx * hit.nx + this.ship.vy * hit.ny;
      if (vn < 0) {
        this.ship.vx -= hit.nx * vn;
        this.ship.vy -= hit.ny * vn;
      }
    }
  }
  /**
   * @returns {void}
   */
  _resolveEnemySolidPropCollisions() {
    if (!this._isMechanizedLevel()) return;
    if (!this.planet || !this.planet.props || !this.planet.props.length) return;
    if (!this.enemies || !this.enemies.enemies || !this.enemies.enemies.length) return;
    const radius = 0.24 * GAME.ENEMY_SCALE;
    for (const e of this.enemies.enemies) {
      for (const p of this.planet.props) {
        const hit = this._solidPropPenetration(p, e.x, e.y, radius);
        if (!hit) continue;
        e.x += hit.nx * (hit.depth + 0.01);
        e.y += hit.ny * (hit.depth + 0.01);
        const vn = e.vx * hit.nx + e.vy * hit.ny;
        if (vn < 0) {
          e.vx -= hit.nx * vn;
          e.vy -= hit.ny * vn;
        }
      }
    }
  }
  /**
   * @param {{x:number,y:number,scale:number}|null} info
   * @returns {void}
   */
  /**
   * @returns {void}
   */
  _spawnMiners() {
    const cfg = this.planet ? this.planet.getPlanetConfig() : null;
    const base = cfg && typeof cfg.minerCountBase === "number" ? cfg.minerCountBase : 0;
    const per = cfg && typeof cfg.minerCountPerLevel === "number" ? cfg.minerCountPerLevel : 0;
    const cap = cfg && typeof cfg.minerCountCap === "number" ? cfg.minerCountCap : 0;
    const count = Math.min(cap, base + Math.max(0, this.level - 1) * per);
    const seed = this.planet.getSeed() + this.level * 97;
    const barrenPerimeter = !!(cfg && cfg.flags && cfg.flags.barrenPerimeter);
    let placed;
    if (barrenPerimeter) {
      const pads = [];
      for (const p of this.planet.props || []) {
        if (p.type === "turret_pad" && !p.dead) pads.push([p.x, p.y]);
      }
      const rand = mulberry32$1(seed + 17);
      placed = [];
      const shuffledPadIndices = pads.map((_, i) => i);
      for (let i = shuffledPadIndices.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        const tmp = shuffledPadIndices[i];
        shuffledPadIndices[i] = shuffledPadIndices[j];
        shuffledPadIndices[j] = tmp;
      }
      const turretsByPad = /* @__PURE__ */ new Map();
      if (this.enemies && this.enemies.enemies && pads.length) {
        const padOccupancyRadius = 0.48;
        const padOccupancyRadiusSq = padOccupancyRadius * padOccupancyRadius;
        for (const e of this.enemies.enemies) {
          if (e.type !== "turret") continue;
          let nearestPad = -1;
          let nearestPadDistSq = Infinity;
          for (let i = 0; i < pads.length; i++) {
            const pt = pads[i];
            const dx = e.x - pt[0];
            const dy = e.y - pt[1];
            const d2 = dx * dx + dy * dy;
            if (d2 < nearestPadDistSq) {
              nearestPadDistSq = d2;
              nearestPad = i;
            }
          }
          if (nearestPad < 0 || nearestPadDistSq > padOccupancyRadiusSq) continue;
          if (!turretsByPad.has(nearestPad)) turretsByPad.set(nearestPad, []);
          turretsByPad.get(nearestPad).push(e);
        }
      }
      const turretsToRemove = /* @__PURE__ */ new Set();
      for (const i of shuffledPadIndices) {
        if (placed.length >= count) break;
        if (turretsByPad.has(i)) continue;
        placed.push(pads[i]);
      }
      if (placed.length < count) {
        for (const i of shuffledPadIndices) {
          if (placed.length >= count) break;
          const turrets = turretsByPad.get(i);
          if (!turrets || !turrets.length) continue;
          for (const t of turrets) {
            turretsToRemove.add(t);
          }
          placed.push(pads[i]);
          turretsByPad.delete(i);
        }
      }
      if (turretsToRemove.size && this.enemies && this.enemies.enemies) {
        this.enemies.enemies = this.enemies.enemies.filter((e) => !turretsToRemove.has(e));
        if (this.objective && this.objective.type === "clear") {
          const remaining = this._remainingClearTargets();
          this.clearObjectiveTotal = remaining;
          this.objective.target = remaining;
        }
      }
      if (placed.length < count) {
        const extras = this.planet.sampleStandablePoints(
          Math.max(count * 2, count),
          seed + 71,
          "uniform",
          GAME.MINER_MIN_SEP,
          false
        );
        for (const pt of extras) {
          if (placed.length >= count) break;
          let exists = false;
          for (const q of placed) {
            const dx = pt[0] - q[0];
            const dy = pt[1] - q[1];
            if (dx * dx + dy * dy < 1e-6) {
              exists = true;
              break;
            }
          }
          if (exists) continue;
          placed.push(pt);
        }
      }
    } else {
      const standable = this.planet.getStandablePoints();
      if (cfg && cfg.id === "molten") {
        const moltenOuter = this.planetParams.MOLTEN_RING_OUTER || 0;
        const minR = moltenOuter + 0.6;
        placed = this.planet.sampleStandablePointsMinRadius ? this.planet.sampleStandablePointsMinRadius(count, seed, "uniform", GAME.MINER_MIN_SEP, true, minR) : this.planet.sampleStandablePoints(count, seed, "uniform", GAME.MINER_MIN_SEP, true).filter((p) => Math.hypot(p[0], p[1]) >= minR);
      } else {
        placed = this.planet.sampleStandablePoints(count, seed, "uniform", GAME.MINER_MIN_SEP, true);
      }
      if (placed.length < count) {
        const availability = this.planet.debugAvailableStandableCount ? this.planet.debugAvailableStandableCount(GAME.MINER_MIN_SEP) : { standable: standable.length, available: standable.length, reservations: 0 };
        const propCounts = this.planet.debugPropCounts ? this.planet.debugPropCounts() : null;
        console.error("[Level] miners spawn insufficient standable points", {
          level: this.level,
          target: count,
          placed: placed.length,
          standable: standable.length,
          available: availability.available,
          reservations: availability.reservations,
          props: propCounts,
          moltenFiltered: 0
        });
      }
    }
    console.log("[Level] miners spawn", { level: this.level, target: count, placed: placed.length });
    this.minerCandidates = placed.length;
    const cutoffPilot = this.ship.mothershipPilots < 3 ? 1 : 0;
    const cutoffEngineer = cutoffPilot + 1;
    const nudged = [];
    for (const p of placed) {
      const minerType = nudged.length < cutoffPilot ? "pilot" : nudged.length < cutoffEngineer ? "engineer" : "miner";
      if (barrenPerimeter) {
        let x = p[0];
        let y = p[1];
        const info = this.planet.surfaceInfoAtWorld(x, y, 0.18);
        if (info) {
          x += info.nx * 0.02;
          y += info.ny * 0.02;
        }
        nudged.push({ x, y, jumpCycle: Math.random(), type: minerType, state: "idle" });
      } else {
        const res = this.planet.nudgeOutOfTerrain(p[0], p[1]);
        if (!res.ok) {
          continue;
        }
        nudged.push({ x: res.x, y: res.y, jumpCycle: Math.random(), type: minerType, state: "idle" });
      }
    }
    this.miners = nudged;
    this.minersRemaining = this.miners.length;
    const missed = Math.max(0, count - this.miners.length);
    this.minersDead = missed;
    this.minerTarget = count;
  }
  /**
   * @param {PlanetConfig} base
   * @param {{planetId?:PlanetTypeId,enemyTotal?:number,enemyCap?:number,enemyAllow?:Array<"hunter"|"ranger"|"crawler"|"turret"|"orbitingTurret">,enemyAllowAdd?:Array<"hunter"|"ranger"|"crawler"|"turret"|"orbitingTurret">,orbitingTurretCount?:number,platformCount?:number}|null} progression
   * @returns {PlanetConfig}
   */
  _applyProgressionOverrides(base, progression) {
    if (!progression) return base;
    const out = { ...base };
    if (typeof progression.enemyTotal === "number") {
      out.enemyCountBase = Math.max(0, Math.round(progression.enemyTotal));
      out.enemyCountPerLevel = 0;
      const cap = typeof progression.enemyCap === "number" ? progression.enemyCap : out.enemyCountCap;
      out.enemyCountCap = Math.max(out.enemyCountBase, Math.round(Math.max(0, cap)));
    } else if (typeof progression.enemyCap === "number") {
      out.enemyCountCap = Math.max(0, Math.round(progression.enemyCap));
    }
    if (Array.isArray(progression.enemyAllow)) {
      out.enemyAllow = progression.enemyAllow.slice();
    }
    if (Array.isArray(progression.enemyAllowAdd) && progression.enemyAllowAdd.length) {
      const merged = new Set(out.enemyAllow || []);
      for (const type of progression.enemyAllowAdd) {
        merged.add(type);
      }
      out.enemyAllow = Array.from(merged);
    }
    if (typeof progression.orbitingTurretCount === "number") {
      out.orbitingTurretCount = Math.max(0, Math.round(progression.orbitingTurretCount));
    }
    if (typeof progression.platformCount === "number") {
      out.platformCount = Math.max(1, Math.round(progression.platformCount));
    }
    return out;
  }
  /**
   * @param {number} level
   * @returns {PlanetConfig}
   */
  _planetConfigFromLevel(level) {
    const progression = resolveLevelProgression(this.progressionSeed || CFG.seed, level);
    const configOverride = progression ? progression.planetId : void 0;
    const planetConfig = configOverride !== void 0 ? pickPlanetConfigById(configOverride) : pickPlanetConfig(this.progressionSeed || CFG.seed, level);
    const out = this._applyProgressionOverrides(planetConfig, progression);
    if (out.id === "barren_pickup" || out.id === "barren_clear") {
      const basePads = Math.max(1, Math.round(out.platformCount || 1));
      const growth = Math.floor(Math.max(0, (level | 0) - 1) / 2);
      const enemyBudget = Math.max(1, this._enemyTotalForConfig(out, level));
      const minerBudget = Math.max(0, this._minerTargetForConfig(out, level));
      const platformBudget = enemyBudget + minerBudget;
      out.platformCount = Math.max(basePads + growth, platformBudget);
    }
    return out;
  }
  /**
   * @param {number} seed
   * @param {number} level
   * @returns {void}
   */
  _beginLevel(seed, level) {
    const previousLevel = this.level;
    this.level = level;
    if (level === 1) {
      this.progressionSeed = seed | 0;
    }
    const planetConfig = this._planetConfigFromLevel(this.level);
    const planetParams = resolvePlanetParams(seed, this.level, planetConfig, GAME);
    this.planet = new Planet({ seed, planetConfig, planetParams });
    this.planetParams = planetParams;
    this.objective = this._buildObjective(planetConfig, this.level);
    console.log("[Level] begin", {
      level: this.level,
      planetId: planetConfig.id,
      enemies: this._totalEnemiesForLevel(this.level),
      miners: this._targetMinersForLevel(),
      platformCount: planetConfig.platformCount,
      props: (this.planet.props || []).length
    });
    if (this.planet.props && this.planet.props.length) {
      console.log("[Level] props sample", this.planet.props.slice(0, 3).map((p) => ({ type: p.type, x: p.x, y: p.y, dead: !!p.dead })));
    }
    this.TERRAIN_MAX = this.planetParams.RMAX + this.TERRAIN_PAD;
    this.SURFACE_EPS = Math.max(0.12, this.planetParams.RMAX / 280);
    this.COLLISION_EPS = Math.max(0.18, this.planetParams.RMAX / 240);
    this.mothership = new Mothership({ RMAX: this.planetParams.RMAX, MOTHERSHIP_ORBIT_HEIGHT: this.planetParams.MOTHERSHIP_ORBIT_HEIGHT }, this.planet);
    this.collision = createCollisionRouter(this.planet, () => this.mothership);
    this.enemies = new Enemies({
      planet: this.planet,
      collision: this.collision,
      total: this._totalEnemiesForLevel(this.level),
      level: this.level,
      levelSeed: this.planet.getSeed(),
      placement: planetConfig.enemyPlacement || "random",
      onEnemyShot: () => {
        this._playSfx("enemy_fire", { volume: 0.55 });
        this._markCombatThreat();
        this._triggerCombatImmediate();
      },
      onEnemyDestroyed: () => {
        this._playSfx("enemy_destroyed", { volume: 0.8 });
      }
    });
    this._initializeClearObjectiveTracking();
    this.coreMeltdownActive = false;
    this.coreMeltdownT = 0;
    this.coreMeltdownEruptT = 0;
    this._syncTetherProtectionStates();
    console.log("[Level] enemies spawned", { level: this.level, enemies: this.enemies.enemies.length });
    this.renderer.setPlanet(this.planet);
    this._resetShip();
    this.entityExplosions.length = 0;
    this._spawnMiners();
    this.planet.reconcileFeatures({
      enemies: this.enemies.enemies,
      miners: this.miners
    });
    this.minerPopups.length = 0;
    this.planet.clearFeatureParticles();
    if (level === 1) {
      this.hasLaunchedPlayerShip = false;
      this.newGameHelpPromptT = 0;
      this.newGameHelpPromptArmed = true;
      this._resetStartTitle();
      this.ship.mothershipMiners = 0;
      this.ship.mothershipPilots = 0;
      this.ship.mothershipEngineers = 0;
      this.ship.hpMax = GAME.SHIP_STARTING_MAX_HP;
      this.ship.hpCur = GAME.SHIP_STARTING_MAX_HP;
      this.ship.bombsMax = GAME.SHIP_STARTING_MAX_BOMBS;
      this.ship.bombsCur = GAME.SHIP_STARTING_MAX_BOMBS;
      this.ship.thrust = GAME.SHIP_STARTING_THRUST;
      this.ship.gunPower = GAME.SHIP_STARTING_GUN_POWER;
      this.ship.rescueeDetector = false;
      this.ship.planetScanner = false;
      this.pendingPerkChoice = null;
      this.victoryMusicTriggered = false;
    }
    this.objectiveCompleteSfxPlayed = this._objectiveComplete();
    this.objectiveCompleteSfxDueAtMs = Number.POSITIVE_INFINITY;
    this.combatThreatUntilMs = 0;
    this._setCombatActive(false);
    if (this.audio && typeof this.audio.returnToAmbient === "function") {
      this.audio.returnToAmbient(true);
    }
    this._setThrustLoopActive(false);
    if (level === previousLevel + 1) {
      this._startLevelWipe(level);
    }
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {Array<[number, number]>}
   */
  _shipCollisionPoints(x, y) {
    const camRot = Math.atan2(x, y || 1e-6);
    const shipRot = -camRot;
    const local = this._shipLocalHullPoints();
    const verts = [];
    const c = Math.cos(shipRot), s = Math.sin(shipRot);
    for (const [lx, ly] of local) {
      const wx = c * lx - s * ly;
      const wy = s * lx + c * ly;
      verts.push([x + wx, y + wy]);
    }
    return verts;
  }
  /**
   * Nudge miners out of terrain after mode changes; kill if deeply buried.
   * @returns {void}
   */
  _nudgeMinersFromTerrain() {
    for (let i = this.miners.length - 1; i >= 0; i--) {
      const m = this.miners[i];
      const res = this.planet.nudgeOutOfTerrain(m.x, m.y);
      if (!res.ok) {
        this.miners.splice(i, 1);
        this.minersRemaining = Math.max(0, this.minersRemaining - 1);
        this.minersDead++;
        continue;
      }
      m.x = res.x;
      m.y = res.y;
    }
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
    const local = this._shipLocalHullPoints();
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
    let inside = false;
    for (let i = 0, j = verts.length - 1; i < verts.length; j = i++) {
      const xi = verts[i][0], yi = verts[i][1];
      const xj = verts[j][0], yj = verts[j][1];
      const intersects = yi > py !== yj > py && px < (xj - xi) * (py - yi) / (yj - yi || 1e-6) + xi;
      if (intersects) inside = !inside;
    }
    if (inside) return 0;
    return best;
  }
  _shipRadius() {
    return this.SHIP_RADIUS_BASE * 1.2;
  }
  /**
   * Approximate ship body using several circles (includes a center collider).
   * @param {number} [shipX]
   * @param {number} [shipY]
   * @returns {Array<{x:number,y:number,r:number}>}
   */
  _shipShotColliders(shipX = this.ship.x, shipY = this.ship.y) {
    const shipR = this._shipRadius();
    const rLen = Math.hypot(shipX, shipY) || 1;
    const upx = shipX / rLen;
    const upy = shipY / rLen;
    const rightx = -upy;
    const righty = upx;
    return [
      { x: shipX, y: shipY, r: shipR * 0.5 },
      // center guard
      { x: shipX + upx * shipR * 0.55, y: shipY + upy * shipR * 0.55, r: shipR * 0.42 },
      { x: shipX - upx * shipR * 0.38, y: shipY - upy * shipR * 0.38, r: shipR * 0.38 },
      { x: shipX + rightx * shipR * 0.48, y: shipY + righty * shipR * 0.48, r: shipR * 0.3 },
      { x: shipX - rightx * shipR * 0.48, y: shipY - righty * shipR * 0.48, r: shipR * 0.3 }
    ];
  }
  /**
   * Swept enemy-shot vs ship hit test to avoid tunneling between frames.
   * @param {{x:number,y:number,vx:number,vy:number}} shot
   * @param {number} dt
   * @returns {boolean}
   */
  _enemyShotHitsShip(shot, dt) {
    const shotX0 = shot.x - shot.vx * dt;
    const shotY0 = shot.y - shot.vy * dt;
    const shotX1 = shot.x;
    const shotY1 = shot.y;
    const shipX1 = this.ship.x;
    const shipY1 = this.ship.y;
    const shipX0 = shipX1 - this.ship.vx * dt;
    const shipY0 = shipY1 - this.ship.vy * dt;
    const broadR = this._shipRadius() + Math.hypot(shot.vx, shot.vy) * dt + Math.hypot(this.ship.vx, this.ship.vy) * dt + 0.35;
    const dxBroad = shotX1 - shipX1;
    const dyBroad = shotY1 - shipY1;
    if (dxBroad * dxBroad + dyBroad * dyBroad > broadR * broadR) {
      return false;
    }
    const colliders0 = this._shipShotColliders(shipX0, shipY0);
    const colliders1 = this._shipShotColliders(shipX1, shipY1);
    const hitPad = 0.02;
    for (let i = 0; i < colliders1.length; i++) {
      const c0 = colliders0[i];
      const c1 = colliders1[i];
      if (!c0 || !c1) continue;
      const r2 = Math.max(c0.r, c1.r) + hitPad;
      const rx0 = shotX0 - c0.x;
      const ry0 = shotY0 - c0.y;
      const rx1 = shotX1 - c1.x;
      const ry1 = shotY1 - c1.y;
      if (this._distPointToSegment(0, 0, rx0, ry0, rx1, ry1) <= r2) return true;
    }
    const travel = Math.hypot(shotX1 - shotX0, shotY1 - shotY0);
    const steps = Math.max(2, Math.min(10, Math.ceil(travel / 0.08) + 1));
    for (let i = 0; i < steps; i++) {
      const t = steps <= 1 ? 1 : i / (steps - 1);
      const px = shotX0 + (shotX1 - shotX0) * t;
      const py = shotY0 + (shotY1 - shotY0) * t;
      const sx = shipX0 + (shipX1 - shipX0) * t;
      const sy = shipY0 + (shipY1 - shipY0) * t;
      if (this._shipHullDistance(px, py, sx, sy) <= hitPad) {
        return true;
      }
    }
    return false;
  }
  _shipGunPivotWorld() {
    const shipHWorld = 0.7 * GAME.SHIP_SCALE;
    const shipWWorld = 0.75 * GAME.SHIP_SCALE;
    const bodyLiftN = 0.18;
    const cargoHeightScale = 2;
    const cargoBottomN = -0.35;
    const cargoHeightN = (0.18 - cargoBottomN) * cargoHeightScale;
    const cargoTopN = cargoBottomN + cargoHeightN;
    const gstrutHN = 0.12;
    const gunLiftN = 0.04;
    const localX = 0;
    const localY = (cargoTopN + gstrutHN + gunLiftN + bodyLiftN) * shipHWorld;
    const camRot = Math.atan2(this.ship.x, this.ship.y || 1e-6);
    const shipRot = -camRot;
    const c = Math.cos(shipRot), s = Math.sin(shipRot);
    const wx = c * (localX * shipWWorld) - s * localY;
    const wy = s * (localX * shipWWorld) + c * localY;
    return { x: this.ship.x + wx, y: this.ship.y + wy };
  }
  _shipLocalHullPoints() {
    const shipHWorld = 0.7 * GAME.SHIP_SCALE;
    const shipWWorld = 0.7 * GAME.SHIP_SCALE;
    const bodyLiftN = 0.18;
    const bodyLift = shipHWorld * bodyLiftN;
    const cargoHeightScale = 2;
    const cargoWidthScale = 2 / 3;
    const cargoBottomN = -0.35;
    const cargoHeightN = (0.18 - cargoBottomN) * cargoHeightScale;
    const cargoTopN = cargoBottomN + cargoHeightN;
    const cargoBottom = shipHWorld * cargoBottomN - bodyLift;
    const cargoTop = shipHWorld * cargoTopN - bodyLift;
    const bottomHalfW = shipWWorld * 0.87 * cargoWidthScale;
    const topHalfW = shipWWorld * 0.65 * cargoWidthScale * 0.8;
    const topRight = topHalfW;
    const topLeft = -topHalfW;
    return [
      [topRight, cargoTop + bodyLift],
      [bottomHalfW, cargoBottom + bodyLift],
      [0, cargoBottom + bodyLift],
      [-bottomHalfW, cargoBottom + bodyLift],
      [topLeft, cargoTop + bodyLift],
      [0, cargoTop + bodyLift]
    ];
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} shipRadius
   * @returns {boolean}
   */
  _shipCollidesAt(x, y, shipRadius) {
    const samples = this._shipCollisionPoints(x, y);
    samples.push([x, y]);
    return this.collision.collidesAtPoints(samples);
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  _minerCollidesAt(x, y) {
    const r2 = Math.hypot(x, y) || 1;
    const upx = x / r2;
    const upy = y / r2;
    const footX = x + upx * this.MINER_FOOT_OFFSET;
    const footY = y + upy * this.MINER_FOOT_OFFSET;
    const headX = x + upx * this.MINER_HEAD_OFFSET;
    const headY = y + upy * this.MINER_HEAD_OFFSET;
    return this.collision.collidesAtPoints([
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
    let {
      stickThrust,
      left,
      right,
      thrust,
      down,
      reset,
      abandonRun,
      shootHeld = false,
      shootPressed = false,
      shoot = false,
      bomb,
      aim,
      aimShoot,
      aimBomb,
      aimShootFrom,
      aimShootTo,
      aimBombFrom,
      aimBombTo,
      spawnEnemyType
    } = inputState;
    if (!shootPressed && shoot) {
      shootPressed = true;
    }
    if (abandonRun) {
      this._abandonRunAndRestart();
      inputState.abandonRun = false;
      inputState.abandonHoldActive = false;
      inputState.abandonHoldRemainingMs = 0;
      return;
    }
    this.playerShotCooldown = Math.max(0, this.playerShotCooldown - dt);
    if (inputState.inputType === "gamepad") {
      const aimAdjusted = this._aimScreenAroundShip(aim);
      aim = aimAdjusted;
      aimShoot = aimAdjusted;
      aimBomb = aimAdjusted;
    }
    if (!aim && this.lastAimScreen) {
      aim = this.lastAimScreen;
    }
    if (!aimShoot) aimShoot = aim;
    if (!aimBomb) aimBomb = aimShoot || aim;
    if (reset) {
      if (this.ship.state === "crashed") {
        if (this.ship.mothershipPilots > 0) {
          this._restartWithNewPilot();
        } else {
          const nextSeed = this.planet.getSeed() + 1;
          this._beginLevel(nextSeed, 1);
        }
      } else if (this._isDockedWithMothership()) {
        if (this.pendingPerkChoice === null && this.ship.mothershipEngineers > 0) {
          this._presentNextPerkChoice();
        } else if (this.levelAdvanceReady) {
          const nextSeed = this.planet.getSeed() + 1;
          this._beginLevel(nextSeed, this.level + 1);
        } else if (this.ship.planetScanner) {
          this.planetView = !this.planetView;
        }
      }
    }
    if (this.pendingPerkChoice !== null) {
      this._setThrustLoopActive(false);
      this._handlePerkChoiceInput(left || stickThrust.x < -0.5, right || stickThrust.x > 0.5);
      return;
    }
    this._syncTetherProtectionStates();
    if (!this.coreMeltdownActive && this.objective && this.objective.type === "destroy_core" && this._tetherPropsAlive().length <= 0) {
      this._startCoreMeltdown();
    }
    if (this.planetView) {
      left = false;
      right = false;
      thrust = false;
      down = false;
      stickThrust.x = 0;
      stickThrust.y = 0;
    }
    if (this.ship.invertT > 0) {
      this.ship.invertT = Math.max(0, this.ship.invertT - dt);
      const tmp = left;
      left = right;
      right = tmp;
      const tmp2 = thrust;
      thrust = down;
      down = tmp2;
      stickThrust.x = -stickThrust.x;
      stickThrust.y = -stickThrust.y;
    }
    if (this.mothership) {
      updateMothership(this.mothership, this.planet, dt);
    }
    if (spawnEnemyType) {
      const map = {
        "1": "hunter",
        "2": "ranger",
        "3": "crawler",
        "4": "turret",
        "5": "orbitingTurret"
      };
      const type = map[spawnEnemyType];
      if (type) {
        const ang = Math.random() * Math.PI * 2;
        const dist = 10;
        const sx = this.ship.x + Math.cos(ang) * dist;
        const sy = this.ship.y + Math.sin(ang) * dist;
        this.enemies.spawnDebug(type, sx, sy);
      }
    }
    const planetCfg = this.planet && this.planet.getPlanetConfig ? this.planet.getPlanetConfig() : null;
    if (this.ship.state === "landed" && this.ship._dock && this.mothership) {
      if (thrust || stickThrust.y > 0.5) {
        const shipRadius = this._shipRadius();
        const pushStep = shipRadius * 0.35;
        for (let i = 0; i < 8 && this._shipCollidesAt(this.ship.x, this.ship.y, shipRadius); i++) {
          const info2 = mothershipCollisionInfo(this.mothership, this.ship.x, this.ship.y);
          if (!info2) break;
          this.ship.x += info2.nx * pushStep;
          this.ship.y += info2.ny * pushStep;
        }
        const info = mothershipCollisionInfo(this.mothership, this.ship.x, this.ship.y);
        if (info) {
          const lift = shipRadius * 0.25;
          this.ship.x += info.nx * lift;
          this.ship.y += info.ny * lift;
          this.ship.vx += info.nx * 0.05;
          this.ship.vy += info.ny * 0.05;
        }
        this.ship.state = "flying";
        this.ship._dock = null;
        this.hasLaunchedPlayerShip = true;
        if (this.newGameHelpPromptArmed) {
          this.newGameHelpPromptT = this.NEW_GAME_HELP_PROMPT_SECS;
          this.newGameHelpPromptArmed = false;
        }
        if (!aim && !aimShoot && !aimBomb && !this.lastAimScreen) {
          const seededAim = this._defaultAimScreenFromShip();
          if (seededAim) {
            aim = seededAim;
            aimShoot = seededAim;
            aimBomb = seededAim;
          }
        }
      } else {
        const { lx, ly } = this.ship._dock;
        const c = Math.cos(this.mothership.angle);
        const s = Math.sin(this.mothership.angle);
        this.ship.x = this.mothership.x + c * lx - s * ly;
        this.ship.y = this.mothership.y + s * lx + c * ly;
        this.ship.vx = this.mothership.vx;
        this.ship.vy = this.mothership.vy;
        this.lastAimWorld = null;
        this.lastAimScreen = null;
        this._setThrustLoopActive(false);
        this.enemies.update(this.ship, dt);
        return;
      }
    }
    if (this.ship.hitCooldown > 0) {
      this.ship.hitCooldown = Math.max(0, this.ship.hitCooldown - dt);
    }
    if (this.planet && this.planet.props && this.planet.props.length) {
      for (const p of this.planet.props) {
        if (p.type !== "factory") continue;
        if (!p.hitT || p.hitT <= 0) continue;
        p.hitT = Math.max(0, p.hitT - dt);
      }
    }
    if (this.ship.state === "flying") {
      const stickFaceDead = 0.15;
      const stickFaceLeft = stickThrust.x < -stickFaceDead;
      const stickFaceRight = stickThrust.x > stickFaceDead;
      const faceLeft = left || stickFaceLeft;
      const faceRight = right || stickFaceRight;
      if (faceLeft && !faceRight) this.ship.cabinSide = -1;
      if (faceRight && !faceLeft) this.ship.cabinSide = 1;
      const stickMag = Math.hypot(stickThrust.x, stickThrust.y);
      this._setThrustLoopActive(left || right || thrust || down || stickMag > 0.12);
      let ax = 0, ay = 0;
      const r2 = Math.hypot(this.ship.x, this.ship.y) || 1;
      const rx = this.ship.x / r2;
      const ry = this.ship.y / r2;
      const tx = -ry;
      const ty = rx;
      const isWaterWorld = !!(planetCfg && planetCfg.id === "water");
      const outerRingR = this.planet && this.planet.radial && this.planet.radial.rings && this.planet.radial.rings.length ? this.planet.radial.rings.length - 1 : Math.floor(this.planetParams.RMAX || 0);
      const waterR = isWaterWorld ? Math.max(0, outerRingR - 0.5) : 0;
      const shipInWaterBefore = !!(isWaterWorld && waterR > 0 && r2 <= waterR + 0.02 && this.planet.airValueAtWorld(this.ship.x, this.ship.y) > 0.5);
      const thrustMax = this.planetParams.THRUST * (1 + this.ship.thrust * 0.1);
      if (left) {
        ax += tx * thrustMax;
        ay += ty * thrustMax;
      }
      if (right) {
        ax -= tx * thrustMax;
        ay -= ty * thrustMax;
      }
      if (thrust) {
        ax += rx * thrustMax;
        ay += ry * thrustMax;
      }
      if (down) {
        ax += -rx * thrustMax;
        ay += -ry * thrustMax;
      }
      ax += (stickThrust.x * -tx + stickThrust.y * rx) * thrustMax;
      ay += (stickThrust.x * -ty + stickThrust.y * ry) * thrustMax;
      if (isWaterWorld && shipInWaterBefore) {
        let buoyancy = Math.max(0, this.planetParams.SURFACE_G * 0.45);
        buoyancy = Math.max(buoyancy, this.planetParams.SURFACE_G * 0.95);
        ax += rx * buoyancy;
        ay += ry * buoyancy;
      }
      const { x: gx, y: gy } = this.planet.gravityAt(this.ship.x, this.ship.y);
      this.ship.x += (this.ship.vx + 0.5 * (ax + gx) * dt) * dt;
      this.ship.y += (this.ship.vy + 0.5 * (ay + gy) * dt) * dt;
      const { x: gx2, y: gy2 } = this.planet.gravityAt(this.ship.x, this.ship.y);
      this.ship.vx += (ax + (gx + gx2) / 2) * dt;
      this.ship.vy += (ay + (gy + gy2) / 2) * dt;
      const shipWaterSpeed = Math.hypot(this.ship.vx, this.ship.vy);
      if (isWaterWorld) {
        const rNow = Math.hypot(this.ship.x, this.ship.y) || 1;
        const shipInWaterNow = !!(waterR > 0 && rNow <= waterR + 0.02 && this.planet.airValueAtWorld(this.ship.x, this.ship.y) > 0.5);
        if (shipInWaterNow && !this._shipWasInWater) {
          this._playSfx("water_splash", {
            volume: Math.max(0.35, Math.min(0.95, 0.42 + shipWaterSpeed * 0.12)),
            rate: Math.max(0.86, Math.min(1.16, 0.9 + shipWaterSpeed * 0.04))
          });
        } else if (!shipInWaterNow && this._shipWasInWater) {
          this._playSfx("water_splash", {
            volume: Math.max(0.3, Math.min(0.8, 0.36 + shipWaterSpeed * 0.1)),
            rate: Math.max(0.9, Math.min(1.22, 1.02 + shipWaterSpeed * 0.03))
          });
        }
        if (shipInWaterNow) {
          const depth = Math.max(0, waterR - rNow);
          const edgeBand = Math.max(0.35, waterR * 0.22);
          const edgeMix = Math.max(0, Math.min(1, 1 - depth / edgeBand));
          const dragK = this.planetParams.DRAG * (4.8 + edgeMix * 5.4);
          const drag = Math.max(0, 1 - dragK * dt);
          this.ship.vx *= drag;
          this.ship.vy *= drag;
          const maxWaterSpeed = Math.max(1.35, thrustMax * 0.55);
          const speed = Math.hypot(this.ship.vx, this.ship.vy);
          if (speed > maxWaterSpeed) {
            const s = maxWaterSpeed / speed;
            this.ship.vx *= s;
            this.ship.vy *= s;
          }
          if (!this._shipWasInWater) {
            this.ship.vx *= 0.68;
            this.ship.vy *= 0.68;
          }
        }
        this._shipWasInWater = shipInWaterNow;
      } else {
        this._shipWasInWater = false;
      }
      const eps = this.COLLISION_EPS;
      const shipRadius = this._shipRadius();
      let collides = false;
      let { samples, hit, hitSource } = this.collision.sampleCollisionPoints(this._shipCollisionPoints(this.ship.x, this.ship.y));
      collides = !!hit;
      this.ship._samples = samples;
      this.ship._shipRadius = shipRadius;
      if (hit) {
        this.ship._collision = {
          x: hit.x,
          y: hit.y,
          tri: this.planet.radial.findTriAtWorld(hit.x, hit.y),
          node: this.planet.radial.nearestNodeOnRing(hit.x, hit.y)
        };
      } else {
        this.ship._collision = null;
      }
      if (collides) {
        const mothershipHit = hitSource === "mothership" && this.mothership;
        if (!mothershipHit) {
          const gdx = this.collision.planetAirValueAtWorld(this.ship.x + eps, this.ship.y) - this.collision.planetAirValueAtWorld(this.ship.x - eps, this.ship.y);
          const gdy = this.collision.planetAirValueAtWorld(this.ship.x, this.ship.y + eps) - this.collision.planetAirValueAtWorld(this.ship.x, this.ship.y - eps);
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
          const dotUp = (nx * this.ship.x + ny * this.ship.y) / (Math.hypot(this.ship.x, this.ship.y) || 1);
          const vn = this.ship.vx * nx + this.ship.vy * ny;
          const vt = this.ship.vx * -ny + this.ship.vy * nx;
          if (vn < -this.planetParams.CRASH_SPEED) {
            const restitution = -vn;
            this.ship.vx += restitution * nx;
            this.ship.vy += restitution * ny;
            this._triggerCrash();
          } else {
            if (vn < 0) {
              const maxSlope = 1 - Math.cos(Math.PI / 8);
              const landSlope = Math.min(1 - GAME.SURFACE_DOT + 0.03, maxSlope);
              const clearance = this.ship._shipRadius || 0.25;
              if (dotUp < 0 || !this.planet.isLandableAtWorld(this.ship.x, this.ship.y, landSlope, clearance, 0.2)) {
                const restitution = (1 + GAME.BOUNCE_RESTITUTION) * -vn;
                this.ship.vx += restitution * nx;
                this.ship.vy += restitution * ny;
              } else if (vn >= -this.planetParams.LAND_SPEED && Math.abs(vt) < 0.5) {
                this.ship.state = "landed";
                this.ship.vx = 0;
                this.ship.vy = 0;
              } else {
                const restitution = -vn;
                this.ship.vx += restitution * nx;
                this.ship.vy += restitution * ny;
                const friction = this.planetParams.LAND_FRICTION * -vt * dt;
                this.ship.vx += friction * -ny;
                this.ship.vy += friction * nx;
              }
            }
          }
        } else {
          const gdx = this.collision.airValueAtWorld(this.ship.x + eps, this.ship.y) - this.collision.airValueAtWorld(this.ship.x - eps, this.ship.y);
          const gdy = this.collision.airValueAtWorld(this.ship.x, this.ship.y + eps) - this.collision.airValueAtWorld(this.ship.x, this.ship.y - eps);
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
          const baseVx = this.mothership.vx;
          const baseVy = this.mothership.vy;
          let relVx = this.ship.vx - baseVx;
          let relVy = this.ship.vy - baseVy;
          const vn = relVx * nx + relVy * ny;
          const vt = relVx * -ny + relVy * nx;
          if (vn < -this.planetParams.CRASH_SPEED) {
            this._triggerCrash();
          } else {
            if (vn < 0) {
              const maxSlope = 1 - Math.cos(Math.PI / 8);
              const landSlope = Math.min(1 - GAME.SURFACE_DOT + 0.03, maxSlope);
              const cUp = Math.cos(this.mothership.angle);
              const sUp = Math.sin(this.mothership.angle);
              const upx = -sUp;
              const upy = cUp;
              const dotUpRaw = nx * upx + ny * upy;
              const slope = 1 - Math.abs(dotUpRaw);
              const landable = dotUpRaw < 0 && slope <= landSlope;
              const landVn = this.planetParams.LAND_SPEED * 3;
              const landVt = 1;
              if (!landable) {
                const restitution = (1 + GAME.BOUNCE_RESTITUTION) * -vn;
                relVx += restitution * nx;
                relVy += restitution * ny;
              } else if (vn >= -landVn && Math.abs(vt) < landVt) {
                this.ship.state = "landed";
                const shipRadius2 = this._shipRadius();
                const lift = shipRadius2 * 0.3;
                this.ship.x += nx * lift;
                this.ship.y += ny * lift;
                const clearStep = shipRadius2 * 0.2;
                for (let i = 0; i < 8 && this._shipCollidesAt(this.ship.x, this.ship.y, shipRadius2); i++) {
                  this.ship.x += nx * clearStep;
                  this.ship.y += ny * clearStep;
                }
                const dx2 = this.ship.x - this.mothership.x;
                const dy2 = this.ship.y - this.mothership.y;
                const c2 = Math.cos(-this.mothership.angle);
                const s2 = Math.sin(-this.mothership.angle);
                const lx2 = c2 * dx2 - s2 * dy2;
                const ly2 = s2 * dx2 + c2 * dy2;
                this.ship._dock = { lx: lx2, ly: ly2 };
                this.ship.vx = this.mothership.vx;
                this.ship.vy = this.mothership.vy;
                if (this._isDockedWithMothership()) {
                  this._onSuccessfullyDocked();
                }
              } else {
                const restitution = -vn;
                relVx += restitution * nx;
                relVy += restitution * ny;
                const friction = GAME.MOTHERSHIP_FRICTION * -vt * dt;
                relVx += friction * -ny;
                relVy += friction * nx;
                const vn2 = relVx * nx + relVy * ny;
                if (vn2 < 0) {
                  relVx -= nx * vn2;
                  relVy -= ny * vn2;
                }
              }
            }
          }
          if (this.ship.state !== "landed") {
            this.ship.vx = relVx + baseVx;
            this.ship.vy = relVy + baseVy;
          }
        }
      }
    }
    if (this.ship.state !== "flying") {
      this._setThrustLoopActive(false);
    }
    const gunOrigin = this._shipGunPivotWorld();
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
        const aimLen = Math.max(4, this._aimWorldDistance(GAME.AIM_SCREEN_RADIUS || 0.25));
        aimWorld = { x: gunOrigin.x + dirx * aimLen, y: gunOrigin.y + diry * aimLen };
      }
    }
    this.lastAimWorld = aimWorld;
    if (aim) this.lastAimScreen = aim;
    if (this.ship.state === "crashed") {
      this.ship.guidePath = null;
    } else {
      const tryGuidePath = (px, py) => {
        const gp = this.planet.surfaceGuidePathTo(px, py, GAME.MINER_CALL_RADIUS);
        if (!gp || !gp.path || gp.path.length < 2) {
          return null;
        }
        if (!Number.isFinite(gp.indexClosest)) return null;
        for (const p of gp.path) {
          if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) {
            return null;
          }
        }
        return gp;
      };
      let guidePath2 = tryGuidePath(this.ship.x, this.ship.y);
      if (!guidePath2 && this.ship.state === "landed") {
        const info = this.planet.surfaceInfoAtWorld(this.ship.x, this.ship.y, 0.24);
        if (info) {
          const tx = -info.ny;
          const ty = info.nx;
          const nx = info.nx;
          const ny = info.ny;
          const probes = [
            [tx * 0.3, ty * 0.3],
            [-tx * 0.3, -ty * 0.3],
            [tx * 0.6, ty * 0.6],
            [-tx * 0.6, -ty * 0.6],
            [nx * 0.18, ny * 0.18],
            [-nx * 0.18, -ny * 0.18]
          ];
          for (let i = 0; i < probes.length && !guidePath2; i++) {
            const p = probes[i];
            guidePath2 = tryGuidePath(this.ship.x + p[0], this.ship.y + p[1]);
          }
        }
        if (!guidePath2) {
          const ringOffsets = [0.35, 0.65];
          for (let i = 0; i < ringOffsets.length && !guidePath2; i++) {
            const r2 = ringOffsets[i];
            for (let a = 0; a < 8 && !guidePath2; a++) {
              const ang = Math.PI * 2 * a / 8;
              guidePath2 = tryGuidePath(this.ship.x + Math.cos(ang) * r2, this.ship.y + Math.sin(ang) * r2);
            }
          }
        }
      }
      this.ship.guidePath = guidePath2;
    }
    this._resolveShipSolidPropCollisions();
    if (this.ship.state !== "crashed") {
      const wantsShoot = !!(shootPressed || shootHeld);
      if (wantsShoot && this.playerShotCooldown <= 0) {
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
          const dx = aimWorldShoot.x - gunOrigin.x;
          const dy = aimWorldShoot.y - gunOrigin.y;
          const dist = Math.hypot(dx, dy) || 1;
          dirx = dx / dist;
          diry = dy / dist;
        }
        if (dirx || diry) {
          this.playerShots.push({
            x: gunOrigin.x + dirx * 0.45,
            y: gunOrigin.y + diry * 0.45,
            vx: dirx * this.PLAYER_SHOT_SPEED + this.ship.vx,
            vy: diry * this.PLAYER_SHOT_SPEED + this.ship.vy,
            life: this.PLAYER_SHOT_LIFE
          });
          this.playerShotCooldown = this.PLAYER_SHOT_INTERVAL;
          this._playSfx("ship_laser", {
            volume: 0.1
          });
        }
      }
      if (bomb && this.ship.bombsCur > 0) {
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
          const dx = aimWorldBomb.x - gunOrigin.x;
          const dy = aimWorldBomb.y - gunOrigin.y;
          const dist = Math.hypot(dx, dy) || 1;
          dirx = dx / dist;
          diry = dy / dist;
        }
        if (dirx || diry) {
          --this.ship.bombsCur;
          this.playerBombs.push({
            x: gunOrigin.x + dirx * 0.45,
            y: gunOrigin.y + diry * 0.45,
            vx: dirx * this.PLAYER_BOMB_SPEED + this.ship.vx,
            vy: diry * this.PLAYER_BOMB_SPEED + this.ship.vy,
            life: this.PLAYER_BOMB_LIFE
          });
          this._playSfx("bomb_launch", {
            volume: 0.55,
            rate: 0.96 + Math.random() * 0.08
          });
        }
      }
    }
    if (this.ship.state !== "crashed") {
      const shipRadius = this._shipRadius() * 0.8;
      this.planet.handleFeatureContact(this.ship.x, this.ship.y, shipRadius, this.featureCallbacks);
    }
    this._updateCoreMeltdown(dt);
    this.planet.updateFeatureEffects(dt, {
      ship: this.ship,
      enemies: this.enemies.enemies,
      miners: this.miners,
      onShipDamage: this.featureCallbacks.onShipDamage,
      onShipHeat: this.featureCallbacks.onShipHeat,
      onShipConfuse: this.featureCallbacks.onShipConfuse,
      onEnemyHit: this.featureCallbacks.onEnemyHit,
      onMinerKilled: this.featureCallbacks.onMinerKilled
    });
    if (this.ship.state !== "crashed") {
      if (this._heatMechanicsActive() && (this.ship.heat || 0) >= 100) {
        this._triggerCrash();
      }
    }
    const mechanizedLevel = this._isMechanizedLevel();
    let mechShotBlockers = null;
    let mechBombBlockers = null;
    let mechFactories = null;
    if (mechanizedLevel && this.planet && this.planet.props && this.planet.props.length) {
      mechShotBlockers = [];
      mechBombBlockers = [];
      mechFactories = [];
      for (const p of this.planet.props) {
        if (!p) continue;
        if (p.type === "factory") {
          mechFactories.push(p);
          mechBombBlockers.push(p);
        } else if (p.type === "gate" || p.type === "tether") {
          mechShotBlockers.push(p);
          mechBombBlockers.push(p);
        }
      }
    }
    if (this.playerShots.length) {
      for (let i = this.playerShots.length - 1; i >= 0; i--) {
        const s = this.playerShots[i];
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= dt;
        if (s.life <= 0) {
          this.playerShots.splice(i, 1);
          continue;
        }
        if (this.planet.handleFeatureShot(s.x, s.y, this.PLAYER_SHOT_RADIUS, this.featureCallbacks)) {
          this.playerShots.splice(i, 1);
          continue;
        }
        if (this.collision.airValueAtWorld(s.x, s.y) <= 0.5) {
          this.playerShots.splice(i, 1);
          continue;
        }
        if (mechanizedLevel) {
          let blocked = false;
          if (mechShotBlockers) {
            for (const p of mechShotBlockers) {
              if (p.dead) continue;
              if (this._solidPropPenetration(p, s.x, s.y, this.PLAYER_SHOT_RADIUS * 0.5)) {
                blocked = true;
                break;
              }
            }
          }
          if (blocked) {
            this.playerShots.splice(i, 1);
            continue;
          }
          if (this._damageFactoryPropsAt(mechFactories, s.x, s.y, this.PLAYER_SHOT_RADIUS, 1, false)) {
            this.playerShots.splice(i, 1);
            continue;
          }
        }
        for (let j = this.enemies.enemies.length - 1; j >= 0; j--) {
          const e = this.enemies.enemies[j];
          if (e.hp <= 0) continue;
          const dx = e.x - s.x;
          const dy = e.y - s.y;
          if (dx * dx + dy * dy <= this.PLAYER_SHOT_RADIUS * this.PLAYER_SHOT_RADIUS) {
            e.hp -= this.ship.gunPower;
            if (e.hp > 0) {
              this._applyEnemyHitFeedback(e);
            }
            this.playerShots.splice(i, 1);
            if (e.hp <= 0) e.hp = 0;
            break;
          }
        }
        if (i >= this.playerShots.length) continue;
        for (let j = this.miners.length - 1; j >= 0; j--) {
          const m = this.miners[j];
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
        let hitSource = "planet";
        if (b.life <= 0) {
          hit = true;
        } else {
          const sample = this.collision.sampleAtWorld(b.x, b.y);
          if (sample.air <= 0.5) {
            hit = true;
            hitSource = sample.source;
          }
        }
        if (!hit) {
          if (mechanizedLevel && mechBombBlockers) {
            for (const p of mechBombBlockers) {
              if (p.dead) continue;
              if (this._solidPropPenetration(p, b.x, b.y, this.PLAYER_BOMB_RADIUS * 0.8)) {
                hit = true;
                hitSource = "planet";
                break;
              }
            }
          }
        }
        if (!hit) {
          for (let j = this.enemies.enemies.length - 1; j >= 0; j--) {
            const e = this.enemies.enemies[j];
            const dx = e.x - b.x;
            const dy = e.y - b.y;
            if (dx * dx + dy * dy <= this.PLAYER_BOMB_RADIUS * this.PLAYER_BOMB_RADIUS) {
              this.enemies.enemies.splice(j, 1);
              this._playSfx("enemy_destroyed", { volume: 0.8 });
              hit = true;
              break;
            }
          }
          if (!hit) {
            for (let j = this.miners.length - 1; j >= 0; j--) {
              const m = this.miners[j];
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
          if (hitSource === "planet") {
            this._applyBombImpact(b.x, b.y);
          }
          this.planet.handleFeatureBomb(b.x, b.y, this.TERRAIN_IMPACT_RADIUS, this.PLAYER_BOMB_RADIUS, this.featureCallbacks);
          this._applyBombDamage(b.x, b.y);
          this.entityExplosions.push({ x: b.x, y: b.y, life: 0.8, radius: this.PLAYER_BOMB_BLAST });
          this._playSfx("bomb_explosion", {
            volume: 0.9,
            rate: 0.95 + Math.random() * 0.1
          });
        }
      }
    }
    if (this.entityExplosions.length) {
      for (let i = this.entityExplosions.length - 1; i >= 0; i--) {
        this.entityExplosions[i].life -= dt;
        if (this.entityExplosions[i].life <= 0) this.entityExplosions.splice(i, 1);
      }
    }
    const guidepathMargin = 1.5;
    const guidePath = this.ship.guidePath;
    const guidePathUsable = !!(guidePath && guidePath.path && guidePath.path.length > 1 && Number.isFinite(guidePath.indexClosest));
    const landed = this.ship.state === "landed";
    for (let i = this.miners.length - 1; i >= 0; i--) {
      const miner = this.miners[i];
      let indexPathMiner = null;
      if (landed && guidePathUsable) {
        indexPathMiner = indexPathFromPos(guidePath.path, guidepathMargin, miner.x, miner.y);
      }
      miner.state = indexPathMiner !== null ? "running" : "idle";
      const r2 = Math.hypot(miner.x, miner.y) || 1;
      miner.jumpCycle += 1.5 * dt * r2 / this.planet.planetRadius;
      miner.jumpCycle -= Math.floor(miner.jumpCycle);
      if (miner.state === "running") {
        let indexPathTarget = guidePath.indexClosest;
        const distMax = (landed ? GAME.MINER_RUN_SPEED : GAME.MINER_JOG_SPEED) * dt;
        if (indexPathMiner < indexPathTarget) {
          indexPathMiner = moveAlongPathPositive(guidePath.path, indexPathMiner, distMax, indexPathTarget);
        } else if (indexPathMiner > indexPathTarget) {
          indexPathMiner = moveAlongPathNegative(guidePath.path, indexPathMiner, distMax, indexPathTarget);
          console.assert(indexPathMiner >= 0);
        }
        const posNew = posFromPathIndex(guidePath.path, indexPathMiner);
        const rNew = Math.hypot(posNew.x, posNew.y);
        const raiseAmount = 0.02;
        const scalePos = 1 + raiseAmount / rNew;
        miner.x = posNew.x * scalePos;
        miner.y = posNew.y * scalePos;
      }
      const upx = miner.x / r2;
      const upy = miner.y / r2;
      const headX = miner.x + upx * this.MINER_HEAD_OFFSET;
      const headY = miner.y + upy * this.MINER_HEAD_OFFSET;
      const footX = miner.x - upx * this.MINER_HEAD_OFFSET * 0.32;
      const footY = miner.y - upy * this.MINER_HEAD_OFFSET * 0.32;
      const hullDistHead = this._shipHullDistance(headX, headY, this.ship.x, this.ship.y);
      const hullDistBody = this._shipHullDistance(miner.x, miner.y, this.ship.x, this.ship.y);
      const hullDistFeet = this._shipHullDistance(footX, footY, this.ship.x, this.ship.y);
      const hullDist = Math.min(hullDistHead, hullDistBody, hullDistFeet);
      if (landed && hullDist <= GAME.MINER_BOARD_RADIUS) {
        if (miner.type === "miner") {
          ++this.ship.dropshipMiners;
        } else if (miner.type === "pilot") {
          ++this.ship.dropshipPilots;
        } else if (miner.type === "engineer") {
          ++this.ship.dropshipEngineers;
        }
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
        this._playSfx("miner_rescued", {
          volume: 0.45,
          rate: 0.95 + Math.random() * 0.1
        });
        this.miners.splice(i, 1);
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
    if (this.shipHitPopups.length) {
      for (let i = this.shipHitPopups.length - 1; i >= 0; i--) {
        const p = this.shipHitPopups[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0) this.shipHitPopups.splice(i, 1);
      }
    }
    if (this.debris.length) {
      for (let i = this.debris.length - 1; i >= 0; i--) {
        const d = this.debris[i];
        Math.hypot(d.x, d.y) || 1;
        const { x: gx, y: gy } = this.planet.gravityAt(d.x, d.y);
        d.vx += gx * dt;
        d.vy += gy * dt;
        d.vx *= Math.max(0, 1 - this.planetParams.DRAG * dt);
        d.vy *= Math.max(0, 1 - this.planetParams.DRAG * dt);
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.a += d.w * dt;
        d.life -= dt;
        if (d.life <= 0) this.debris.splice(i, 1);
      }
    }
    this.enemies.update(this.ship, dt);
    this._updateFactorySpawns(dt);
    this._resolveEnemySolidPropCollisions();
    if (this.ship.state !== "crashed") {
      for (let i = this.enemies.shots.length - 1; i >= 0; i--) {
        const s = this.enemies.shots[i];
        if (this._enemyShotHitsShip(s, dt)) {
          this.enemies.shots.splice(i, 1);
          this._damageShip(s.x, s.y);
          continue;
        }
      }
    }
    if (this.ship.state !== "crashed" && this.enemies.explosions.length) {
      for (const ex of this.enemies.explosions) {
        const r2 = ex.radius ?? 1;
        const dx = this.ship.x - ex.x;
        const dy = this.ship.y - ex.y;
        if (dx * dx + dy * dy <= r2 * r2) {
          this._damageShip(ex.x, ex.y);
          break;
        }
      }
    }
    if (this.ship.state === "landed") {
      if (left || right || thrust || stickThrust.x * stickThrust.x + stickThrust.y * stickThrust.y > 0) {
        this.ship.state = "flying";
        this.ship._dock = null;
        this.hasLaunchedPlayerShip = true;
      }
    }
  }
  /**
   * @returns {void}
   */
  _frame() {
    const now = performance.now();
    const rawDt = Math.min(0.05, (now - this.lastTime) / 1e3);
    this.lastTime = now;
    if (this.newGameHelpPromptT > 0) {
      this.newGameHelpPromptT = Math.max(0, this.newGameHelpPromptT - rawDt);
    }
    const touchStartActionMode = this._touchStartActionMode();
    const touchStartPromptActive = touchStartActionMode !== null;
    this.input.setTouchStartPromptActive(touchStartPromptActive);
    this.input.setGameOver(this.ship.state === "crashed");
    if (this.input && typeof this.input.setDebugCommandsEnabled === "function") {
      this.input.setDebugCommandsEnabled(this.devHudVisible);
    }
    const inputState = this.input.update();
    if (this.helpPopup && typeof this.helpPopup.setTouchMode === "function") {
      this.helpPopup.setTouchMode(inputState.inputType === "touch");
    }
    const helpOpen = !!(this.helpPopup && this.helpPopup.isOpen && this.helpPopup.isOpen());
    const dt = helpOpen ? 0 : rawDt;
    if (helpOpen) {
      this.accumulator = 0;
      this._setThrustLoopActive(false);
    } else {
      this.accumulator += dt;
    }
    this.levelAdvanceReady = this.pendingPerkChoice === null && this.ship.mothershipEngineers <= 0 && this._objectiveComplete() && this._isDockedWithMothership();
    this._updateStartTitle(dt, inputState);
    this._updateLevelWipe(dt);
    if (this.ship.state === "crashed") {
      this.ship.explodeT = Math.min(1.2, this.ship.explodeT + dt * 0.9);
    }
    if (inputState.regen) {
      const nextSeed = this.planet.getSeed() + 1;
      this._beginLevel(nextSeed, this.level);
    }
    if (inputState.prevLevel) {
      if (this.level > 1) {
        const nextSeed = this.planet.getSeed() + 1;
        this._beginLevel(nextSeed, this.level - 1);
      }
    } else if (inputState.nextLevel) {
      const nextSeed = this.planet.getSeed() + 1;
      this._beginLevel(nextSeed, this.level + 1);
    }
    if (inputState.toggleDebug) {
      this.debugCollisions = !this.debugCollisions;
    }
    if (inputState.toggleDevHud) {
      this.devHudVisible = !this.devHudVisible;
      this.hud.style.display = this.devHudVisible ? "block" : "none";
      if (this.input && typeof this.input.setDebugCommandsEnabled === "function") {
        this.input.setDebugCommandsEnabled(this.devHudVisible);
      }
    }
    if (inputState.togglePlanetView) {
      this.planetView = !this.planetView;
    }
    if (inputState.togglePlanetTriangles) {
      this.debugPlanetTriangles = !this.debugPlanetTriangles;
      this._showStatusCue(this.debugPlanetTriangles ? "Planet triangle outlines on" : "Planet triangle outlines off");
    }
    if (inputState.toggleCollisionContours) {
      this.debugCollisionContours = !this.debugCollisionContours;
      this._showStatusCue(this.debugCollisionContours ? "Collision contour debug on" : "Collision contour debug off");
    }
    if (inputState.toggleFog) {
      this.fogEnabled = !this.fogEnabled;
    }
    if (inputState.toggleMusic && this.audio && typeof this.audio.toggleMuted === "function") {
      this.audio.toggleMuted();
    }
    if (inputState.toggleCombatMusic && this.audio && typeof this.audio.toggleCombatMusicEnabled === "function") {
      this.audio.toggleCombatMusicEnabled();
    }
    if (inputState.musicVolumeDown && this.audio && typeof this.audio.stepMusicVolume === "function") {
      const nextPct = this.audio.stepMusicVolume(-1);
      this._showStatusCue(`Music volume ${nextPct}%`);
    } else if (inputState.musicVolumeUp && this.audio && typeof this.audio.stepMusicVolume === "function") {
      const nextPct = this.audio.stepMusicVolume(1);
      this._showStatusCue(`Music volume ${nextPct}%`);
    }
    if (inputState.rescueAll) {
      this._rescueAll();
    }
    if (inputState.killAllEnemies) {
      this._killAllEnemiesAndFactories();
    }
    const fixed = 1 / 60;
    const maxSteps = 4;
    let steps = 0;
    while (this.accumulator >= fixed && steps < maxSteps) {
      this._step(fixed, inputState);
      inputState.reset = false;
      inputState.abandonRun = false;
      inputState.shootPressed = false;
      inputState.shoot = false;
      inputState.bomb = false;
      inputState.spawnEnemyType = null;
      this.accumulator -= fixed;
      steps++;
    }
    const objectiveCompleteNow = this._objectiveComplete();
    if (objectiveCompleteNow && this.level >= 16 && !this.victoryMusicTriggered) {
      this.victoryMusicTriggered = true;
      this._triggerVictoryMusic();
    }
    if (objectiveCompleteNow && !this.objectiveCompleteSfxPlayed) {
      if (!Number.isFinite(this.objectiveCompleteSfxDueAtMs)) {
        this.objectiveCompleteSfxDueAtMs = now + this.OBJECTIVE_COMPLETE_SFX_DELAY_MS;
      } else if (now >= this.objectiveCompleteSfxDueAtMs) {
        this.objectiveCompleteSfxPlayed = true;
        this.objectiveCompleteSfxDueAtMs = Number.POSITIVE_INFINITY;
        this._playSfx("objective_complete", { volume: 0.75 });
      }
    } else if (!objectiveCompleteNow) {
      this.objectiveCompleteSfxDueAtMs = Number.POSITIVE_INFINITY;
    }
    const combatActive = !objectiveCompleteNow && this.ship.state !== "crashed" && performance.now() < this.combatThreatUntilMs;
    this._setCombatActive(combatActive);
    this.levelAdvanceReady = this.pendingPerkChoice === null && this.ship.mothershipEngineers <= 0 && objectiveCompleteNow && this._isDockedWithMothership();
    this.fpsFrames++;
    if (now - this.fpsTime >= 500) {
      this.fps = Math.round(this.fpsFrames * 1e3 / (now - this.fpsTime));
      this.fpsFrames = 0;
      this.fpsTime = now;
    }
    const gameOver = this.ship.state === "crashed";
    this.planet.syncRenderFog(this.renderer, this.ship.x, this.ship.y);
    this.renderer.drawFrame({
      view: this._viewState(),
      ship: this.ship,
      mothership: this.mothership,
      debris: this.debris,
      input: inputState,
      debugCollisions: this.debugCollisions,
      debugNodes: GAME.DEBUG_NODES,
      debugPlanetTriangles: this.debugPlanetTriangles,
      debugCollisionContours: this.debugCollisionContours,
      debugCollisionSamples: this.debugCollisions || this.debugCollisionContours ? this.ship._samples || [] : null,
      debugPoints: this.debugCollisions && GAME.DEBUG_NODES ? this.planet.debugPoints() : null,
      fogEnabled: this.fogEnabled,
      fps: this.fps,
      finalAir: this.planet.getFinalAir(),
      miners: this.miners,
      minersRemaining: this.minersRemaining,
      minerTarget: this.minerTarget,
      level: this.level,
      minersDead: this.minersDead,
      enemies: this.enemies.enemies,
      shots: this.enemies.shots,
      explosions: this.enemies.explosions,
      enemyDebris: this.enemies.debris,
      playerShots: this.playerShots,
      playerBombs: this.playerBombs,
      featureParticles: this.planet.getFeatureParticles(),
      entityExplosions: this.entityExplosions,
      aimWorld: gameOver ? null : this.lastAimWorld,
      aimOrigin: gameOver ? null : this._shipGunPivotWorld(),
      planetPalette: this._planetPalette(),
      touchUi: gameOver ? null : inputState.touchUi,
      touchStart: inputState.inputType === "touch" && touchStartPromptActive,
      touchStartMode: inputState.inputType === "touch" ? touchStartActionMode : null
    }, this.planet);
    this._drawMinerPopups();
    if (this.devHudVisible) {
      this.ui.updateHud(this.hud, {
        fps: this.fps,
        state: this.ship.state,
        speed: Math.hypot(this.ship.vx, this.ship.vy),
        shipHp: this.ship.hpCur,
        bombs: this.ship.bombsCur,
        verts: this.planet.radial.vertCount,
        air: this.planet.getFinalAir(),
        miners: this.minersRemaining,
        minersDead: this.minersDead,
        level: this.level,
        debug: this.debugCollisions,
        minerCandidates: this.minerCandidates,
        inputType: inputState.inputType
      });
    }
    const heat = this.ship.heat || 0;
    const showHeat = this._heatMechanicsActive();
    const heating = showHeat && heat > this.lastHeat + 0.1;
    this.lastHeat = heat;
    if (this.heatMeter && this.ui.updateHeatMeter) {
      this.ui.updateHeatMeter(this.heatMeter, heat, showHeat, heating);
    }
    const titleShowing = !this.startTitleSeen && this.startTitleAlpha > 0;
    if (this.planetLabel) {
      this.planetLabel.style.visibility = titleShowing ? "hidden" : "visible";
      if (!titleShowing && this.ui.updatePlanetLabel) {
        const cfg = this.planet.getPlanetConfig();
        const label = cfg ? cfg.label : "";
        const prefix = `Level ${this.level}: `;
        this.ui.updatePlanetLabel(this.planetLabel, label ? `${prefix}${label}` : `Level ${this.level}`);
      }
    }
    if (this.objectiveLabel) {
      this.objectiveLabel.style.visibility = "visible";
      const abandonHoldActive = !!inputState.abandonHoldActive;
      const abandonHoldRemainingMs = typeof inputState.abandonHoldRemainingMs === "number" ? inputState.abandonHoldRemainingMs : 0;
      this.objectiveLabel.style.color = abandonHoldActive ? "rgb(255, 72, 72)" : "";
      if (this.ui.updateObjectiveLabel) {
        if (abandonHoldActive) {
          this.ui.updateObjectiveLabel(this.objectiveLabel, this._abandonHoldCountdownText(abandonHoldRemainingMs));
        } else {
          const cue = now < this.statusCueUntil ? this.statusCueText : "";
          if (cue) {
            this.ui.updateObjectiveLabel(this.objectiveLabel, cue);
          } else if (titleShowing && this.ship.state !== "crashed") {
            this.ui.updateObjectiveLabel(this.objectiveLabel, this._startObjectiveText(inputState.inputType));
          } else {
            const prompt = this._objectivePromptText(inputState.inputType);
            const objectiveText = prompt || this._objectiveText();
            if (this.ship.state !== "crashed" && this.newGameHelpPromptT > 0) {
              const helpLine = this._helpPromptLine(inputState.inputType);
              this.ui.updateObjectiveLabel(this.objectiveLabel, objectiveText ? `${helpLine}
${objectiveText}` : helpLine);
            } else {
              this.ui.updateObjectiveLabel(this.objectiveLabel, objectiveText);
            }
          }
        }
      }
    }
    if (this.shipStatusLabel) {
      this.shipStatusLabel.style.visibility = titleShowing ? "hidden" : "visible";
      if (!titleShowing && this.ui.updateShipStatusLabel) {
        this.ui.updateShipStatusLabel(this.shipStatusLabel, {
          shipHp: this.ship.hpCur,
          shipHpMax: this.ship.hpMax,
          bombs: this.ship.bombsCur,
          bombsMax: this.ship.bombsMax
        });
      }
    }
    requestAnimationFrame(() => this._frame());
  }
  /**
   * @param {number} dt
   * @param {import("./types.d.js").InputState} inputState
   * @returns {void}
   */
  _updateStartTitle(dt, inputState) {
    if (this.startTitleSeen) return;
    if (!this.startTitleFade && this._hasAnyPlayerInput(inputState)) {
      this.startTitleFade = true;
    }
    if (!this.startTitleFade) return;
    this.startTitleAlpha = Math.max(0, this.startTitleAlpha - this.START_TITLE_FADE_PER_SEC * Math.max(0, dt));
    if (this.startTitleAlpha <= 0) {
      this.startTitleSeen = true;
      this.startTitleAlpha = 0;
    }
  }
  /**
   * @param {number} nextLevel
   * @returns {void}
   */
  _startLevelWipe(nextLevel) {
    this.levelWipeActive = true;
    this.levelWipeT = 0;
    this.levelWipeDir = (nextLevel | 0) % 2 === 0 ? 1 : -1;
  }
  /**
   * @param {number} dt
   * @returns {void}
   */
  _updateLevelWipe(dt) {
    if (!this.levelWipeActive) return;
    const duration = Math.max(0.05, this.LEVEL_WIPE_DURATION);
    this.levelWipeT += Math.max(0, dt) / duration;
    if (this.levelWipeT >= 1) {
      this.levelWipeT = 1;
      this.levelWipeActive = false;
    }
  }
  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} w
   * @param {number} h
   * @param {number} dpr
   * @returns {void}
   */
  _drawLevelWipe(ctx, w, h, dpr) {
    if (!this.levelWipeActive) return;
    const t = Math.max(0, Math.min(1, this.levelWipeT));
    const coverage = 1 - Math.abs(1 - 2 * t);
    const band = Math.max(20 * dpr, w * 0.07);
    const edge = this.levelWipeDir > 0 ? coverage * (w + band) - band : w - coverage * (w + band);
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(5, 8, 15, 0.96)";
    if (this.levelWipeDir > 0) {
      ctx.fillRect(0, 0, Math.max(0, edge), h);
    } else {
      ctx.fillRect(edge, 0, w - edge, h);
    }
    const grad = this.levelWipeDir > 0 ? ctx.createLinearGradient(edge - band, 0, edge + band, 0) : ctx.createLinearGradient(edge + band, 0, edge - band, 0);
    grad.addColorStop(0, "rgba(72, 226, 255, 0)");
    grad.addColorStop(0.4, "rgba(72, 226, 255, 0.2)");
    grad.addColorStop(0.5, "rgba(245, 250, 255, 0.92)");
    grad.addColorStop(0.6, "rgba(72, 226, 255, 0.2)");
    grad.addColorStop(1, "rgba(72, 226, 255, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(edge - band, 0, band * 2, h);
    ctx.restore();
  }
  /**
   * @param {import("./types.d.js").InputState} inputState
   * @returns {boolean}
   */
  _hasAnyPlayerInput(inputState) {
    if (inputState.left || inputState.right || inputState.thrust || inputState.down) return true;
    if (inputState.shootHeld || inputState.shootPressed || inputState.shoot || inputState.bomb || inputState.reset || inputState.abandonRun) return true;
    if (inputState.regen || inputState.nextLevel || inputState.prevLevel) return true;
    if (inputState.toggleDebug || inputState.toggleDevHud || inputState.togglePlanetView || inputState.toggleCollisionContours || inputState.toggleFog) return true;
    if (inputState.rescueAll || inputState.spawnEnemyType !== null) return true;
    if (inputState.inputType === "touch" && (inputState.aim || inputState.aimShoot || inputState.aimBomb)) return true;
    if (inputState.inputType === "gamepad" && (inputState.aim || inputState.aimShoot || inputState.aimBomb)) return true;
    const st = inputState.stickThrust;
    return !!(st && st.x * st.x + st.y * st.y > 0);
  }
  /**
   * @param {"keyboard"|"mouse"|"touch"|"gamepad"|null|undefined} inputType
   * @returns {string}
   */
  _objectivePromptText(inputType) {
    const type = inputType || "keyboard";
    const startButtonPrefix = type === "touch" ? "Tap Play to " : type === "gamepad" ? "Press Button0 to " : "Press R to ";
    if (this.pendingPerkChoice) {
      if (type === "touch") return "Choose upgrade: use left/right thrust controls.";
      if (type === "gamepad") return "Choose upgrade: press left/right.";
      return "Choose upgrade: press left/right.";
    } else if (this.ship.state === "crashed") {
      if (this.ship.mothershipPilots > 0) {
        return startButtonPrefix + "launch a new dropship.";
      } else {
        return "Game over. " + startButtonPrefix + "start a new game.";
      }
    } else if (this._isDockedWithMothership()) {
      if (this.ship.mothershipEngineers > 0) {
        return startButtonPrefix + "choose an upgrade.";
      } else if (this.levelAdvanceReady) {
        return startButtonPrefix + "fly to next planet.";
      } else if (this.ship.planetScanner) {
        if (this.planetView) {
          return startButtonPrefix + "exit planet scan.";
        } else {
          return startButtonPrefix + "view planet scan.";
        }
      }
    } else if (this._objectiveComplete()) {
      if (this.objective && this.objective.type === "destroy_core") {
        return "Core meltdown! Return to mothership.";
      }
      return "Objective complete! Return to mothership.";
    }
    return "";
  }
  /**
   * @param {"keyboard"|"mouse"|"touch"|"gamepad"|null|undefined} inputType
   * @returns {string}
   */
  _startObjectiveText(inputType) {
    return `Lift off to start, or press ${this._helpActionLabel(inputType)} for help.`;
  }
  /**
   * @param {"keyboard"|"mouse"|"touch"|"gamepad"|null|undefined} inputType
   * @returns {string}
   */
  _helpPromptLine(inputType) {
    return `Press ${this._helpActionLabel(inputType)} for help. ${this._abandonPromptText(inputType || "keyboard")}`;
  }
  /**
   * @param {"keyboard"|"mouse"|"touch"|"gamepad"|null|undefined} inputType
   * @returns {string}
   */
  _abandonPromptText(inputType) {
    const type = inputType || "keyboard";
    if (type === "touch") return "Hold ↻ to restart.";
    if (type === "gamepad") return "Hold Start to restart.";
    return "Hold Shift+R to restart.";
  }
  /**
   * @returns {string}
   */
  _abandonHoldCountdownText(remainingMs) {
    const ms = Math.max(0, remainingMs || 0);
    return `Abandoning run in ${Math.ceil(ms / 1e3)} seconds`;
  }
  /**
   * @returns {void}
   */
  _resetStartTitle() {
    this.startTitleText = "DROPSHIP";
    this.startTitleAlpha = 1;
    this.startTitleFade = false;
    this.startTitleSeen = false;
  }
  /**
   * @param {"keyboard"|"mouse"|"touch"|"gamepad"|null|undefined} inputType
   * @returns {string}
   */
  _helpActionLabel(inputType) {
    const type = inputType || "keyboard";
    if (type === "touch") return "the ? button";
    if (type === "gamepad") return "Button3";
    return "/";
  }
  /**
   * @returns {"respawnShip"|"restartGame"|"upgrade"|"nextLevel"|"viewMap"|"exitMap"|null}
   */
  _touchStartActionMode() {
    if (this.ship.state === "crashed") {
      return this.ship.mothershipPilots > 0 ? "respawnShip" : "restartGame";
    }
    if (!this._isDockedWithMothership()) {
      return null;
    }
    if (this.pendingPerkChoice !== null) {
      return null;
    }
    if (this.ship.mothershipEngineers > 0) return "upgrade";
    if (this.levelAdvanceReady) return "nextLevel";
    if (this.ship.planetScanner) return this.planetView ? "exitMap" : "viewMap";
    return null;
  }
  /**
   * @returns {boolean}
   */
  _objectiveComplete() {
    const objType = this.objective ? this.objective.type : "extract";
    if (objType === "clear") return this._remainingClearTargets() === 0;
    if (objType === "extract") return this.minersRemaining === 0;
    if (objType === "destroy_core") return this.coreMeltdownActive || this._tetherPropsAlive().length === 0;
    return false;
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
  _onSuccessfullyDocked() {
    this.ship.mothershipMiners += this.ship.dropshipMiners;
    this.ship.mothershipPilots += this.ship.dropshipPilots;
    this.ship.mothershipEngineers += this.ship.dropshipEngineers;
    this.ship.dropshipMiners = 0;
    this.ship.dropshipPilots = 0;
    this.ship.dropshipEngineers = 0;
    this.ship.hpCur = this.ship.hpMax;
    this.ship.bombsCur = this.ship.bombsMax;
  }
  /**
   * @returns {boolean}
   */
  _isDockedWithMothership() {
    return this.ship.state === "landed" && this.ship._dock !== null && this.ship._dock.ly > 0.5;
  }
  /**
   * @returns {Array<string>}
   */
  _perksAvailable() {
    const perksAvailable = [];
    perksAvailable.push("hpMax");
    perksAvailable.push("bombsMax");
    if (this.ship.thrust < 3) {
      perksAvailable.push("thrust");
    }
    if (this.ship.gunPower < 2) {
      perksAvailable.push("gunPower");
    }
    if (!this.ship.rescueeDetector) {
      perksAvailable.push("rescueeDetector");
    }
    if (!this.ship.planetScanner) {
      perksAvailable.push("planetScanner");
    }
    return perksAvailable;
  }
  /**
   * @param {Array<string>} perksAvailable
   * @returns {Array<string>}
   */
  _pickPerkChoices(perksAvailable) {
    console.assert(perksAvailable.length >= 2);
    const idx0 = Math.floor(Math.random() * perksAvailable.length);
    let idx1 = Math.floor(Math.random() * (perksAvailable.length - 1));
    if (idx1 >= idx0) idx1 += 1;
    return [perksAvailable[idx0], perksAvailable[idx1]];
  }
  /**
   * @param {string} perk
   * @returns {string}
   */
  _perkChoiceText(perk) {
    if (perk === "hpMax") return "Reinforced hull: +1 max HP";
    if (perk === "bombsMax") return "Expanded payload bay: +1 max bomb";
    if (perk === "thrust") return "Engine tune-up: +10% thrust power";
    if (perk === "gunPower") return "Firepower: +1 HP damage";
    if (perk === "rescueeDetector") return "Rescuee detector: locate stranded crew";
    if (perk === "planetScanner") return "Planet scanner: scan planet from mothership";
    return perk;
  }
  /**
   * @returns {void}
   */
  _presentNextPerkChoice() {
    console.assert(this.ship.mothershipEngineers > 0);
    const perksAvailable = this._perksAvailable();
    const perkChoices = this._pickPerkChoices(perksAvailable);
    this.pendingPerkChoice = perkChoices.map((perk) => {
      return { perk, text: this._perkChoiceText(perk) };
    });
    --this.ship.mothershipEngineers;
  }
  /**
   * @param {string} perk
   * @returns {void}
   */
  _applyPerk(perk) {
    if (perk === "hpMax") {
      ++this.ship.hpMax;
      this.ship.hpCur = this.ship.hpMax;
    } else if (perk === "bombsMax") {
      ++this.ship.bombsMax;
      this.ship.bombsCur = this.ship.bombsMax;
    } else if (perk === "thrust") {
      ++this.ship.thrust;
    } else if (perk === "gunPower") {
      ++this.ship.gunPower;
    } else if (perk === "rescueeDetector") {
      this.ship.rescueeDetector = true;
    } else if (perk === "planetScanner") {
      this.ship.planetScanner = true;
    }
  }
  /**
   * @param {boolean} leftPressed
   * @param {boolean} rightPressed
   * @returns {void}
   */
  _handlePerkChoiceInput(leftPressed, rightPressed) {
    const i = leftPressed ? 0 : rightPressed ? 1 : 2;
    if (i < this.pendingPerkChoice.length) {
      this._applyPerk(this.pendingPerkChoice[i].perk);
      this.pendingPerkChoice = null;
    }
  }
  /**
   * @returns {void}
   */
  _restartWithNewPilot() {
    console.log("Restart: num pilots", this.ship.mothershipPilots);
    this.ship.mothershipPilots = Math.max(0, this.ship.mothershipPilots - 1);
    this._resetShip();
  }
  /**
   * Abandon current run: clear persisted save and start from level 1.
   * @returns {void}
   */
  _abandonRunAndRestart() {
    clearSavedGame();
    const nextSeed = this.planet.getSeed() + 1;
    this._beginLevel(nextSeed, 1);
  }
  /**
   * @returns {void}
   */
  _rescueAll() {
    for (let i = this.miners.length - 1; i >= 0; i--) {
      const miner = this.miners[i];
      if (miner.type === "miner") {
        ++this.ship.dropshipMiners;
      } else if (miner.type === "pilot") {
        ++this.ship.dropshipPilots;
      } else if (miner.type === "engineer") {
        ++this.ship.dropshipEngineers;
      }
      this.minersRemaining = Math.max(0, this.minersRemaining - 1);
      this.miners.splice(i, 1);
    }
    if (this._isDockedWithMothership()) {
      this._onSuccessfullyDocked();
    }
  }
  /**
   * Debug helper: remove all active enemies and destroy all active factories.
   * @returns {void}
   */
  _killAllEnemiesAndFactories() {
    let enemyCount = 0;
    if (this.enemies && this.enemies.enemies) {
      for (const e of this.enemies.enemies) {
        if (e && (e.hp || 0) > 0) enemyCount++;
      }
      this.enemies.enemies.length = 0;
      if (this.enemies.shots) this.enemies.shots.length = 0;
      if (this.enemies.explosions) this.enemies.explosions.length = 0;
      if (this.enemies.debris) this.enemies.debris.length = 0;
    }
    let factories = 0;
    if (this.planet && this.planet.props) {
      for (const p of this.planet.props) {
        if (p.type !== "factory") continue;
        if (p.dead || typeof p.hp === "number" && p.hp <= 0) continue;
        this._destroyFactoryProp(p);
        factories++;
      }
    }
    if (factories > 0) {
      this._syncTetherProtectionStates();
    }
    if (enemyCount > 0 || factories > 0) {
      this._showStatusCue(`Debug clear: ${enemyCount} enemies, ${factories} factories`);
    } else {
      this._showStatusCue("Debug clear: no enemies or factories alive");
    }
  }
  /**
   * Build a versioned runtime snapshot suitable for localStorage.
   * @returns {any}
   */
  createSaveSnapshot() {
    return createLoopSaveSnapshot(this);
  }
  /**
   * Restore a previously serialized runtime snapshot.
   * @param {any} snapshot
   * @returns {boolean}
   */
  restoreFromSaveSnapshot(snapshot) {
    return restoreLoopFromSaveSnapshot(this, snapshot);
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
    const drawStartTitle = !this.startTitleSeen && this.startTitleAlpha > 0;
    if (!drawStartTitle && !this.minerPopups.length && !this.shipHitPopups.length && !this.lastAimScreen && !this.pendingPerkChoice && !this.levelWipeActive) {
      return;
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 ${Math.max(12, Math.round(16 * dpr))}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
    const screenT = this._screenTransform(w / h);
    for (const p of this.minerPopups) {
      const t = Math.max(0, Math.min(1, p.life / GAME.MINER_POPUP_LIFE));
      const alpha = 0.9 * t;
      const screen = this._worldToScreenNorm(p.x, p.y, screenT);
      const px = screen.x * w;
      const py = screen.y * h;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(255, 236, 170, 1)";
      ctx.fillText("+1", px, py);
    }
    for (const p of this.shipHitPopups) {
      const t = Math.max(0, Math.min(1, p.life / GAME.SHIP_HIT_POPUP_LIFE));
      const alpha = 0.9 * t;
      const screen = this._worldToScreenNorm(p.x, p.y, screenT);
      const px = screen.x * w;
      const py = screen.y * h;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(255, 80, 80, 1)";
      ctx.fillText("-1", px, py);
    }
    if (this.lastAimScreen && this.ship.state !== "crashed") {
      const px = this.lastAimScreen.x * w;
      const py = this.lastAimScreen.y * h;
      const r2 = Math.max(6, Math.round(10 * dpr));
      const cross = Math.max(4, Math.round(r2 * 0.6));
      ctx.globalAlpha = 0.95;
      ctx.strokeStyle = "rgba(120, 255, 220, 1)";
      ctx.lineWidth = Math.max(1, Math.round(2 * dpr));
      ctx.beginPath();
      ctx.arc(px, py, r2, 0, Math.PI * 2);
      ctx.moveTo(px - cross, py);
      ctx.lineTo(px + cross, py);
      ctx.moveTo(px, py - cross);
      ctx.lineTo(px, py + cross);
      ctx.stroke();
    }
    if (this.pendingPerkChoice) {
      const panelW = Math.min(w * 0.92, 900 * dpr);
      const panelH = Math.min(h * 0.52, 380 * dpr);
      const x = (w - panelW) * 0.5;
      const y = (h - panelH) * 0.5;
      const panelGrad = ctx.createLinearGradient(0, y, 0, y + panelH);
      panelGrad.addColorStop(0, "rgba(14, 16, 28, 0.96)");
      panelGrad.addColorStop(1, "rgba(8, 10, 18, 0.96)");
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = panelGrad;
      ctx.fillRect(x, y, panelW, panelH);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "rgba(255, 215, 110, 0.95)";
      ctx.lineWidth = Math.max(1, Math.round(2 * dpr));
      ctx.strokeRect(x, y, panelW, panelH);
      const lineY = y + panelH * 0.3;
      const linePad = panelW * 0.12;
      ctx.strokeStyle = "rgba(120, 210, 255, 0.55)";
      ctx.lineWidth = Math.max(1, Math.round(1.25 * dpr));
      ctx.beginPath();
      ctx.moveTo(x + linePad, lineY);
      ctx.lineTo(x + panelW - linePad, lineY);
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(255, 240, 190, 1)";
      const fontFamily = '"Science Gothic", ui-sans-serif, system-ui, sans-serif';
      const titlePx = fitCanvasFontPx(ctx, "Choose an Upgrade", 700, Math.round(24 * dpr), Math.round(14 * dpr), panelW * 0.84, fontFamily);
      ctx.font = `700 ${titlePx}px ${fontFamily}`;
      ctx.fillText("Choose an Upgrade", x + panelW * 0.5, y + panelH * 0.18);
      const left = this.pendingPerkChoice[0];
      const right = this.pendingPerkChoice[1];
      const bodyPx = Math.max(Math.round(12 * dpr), Math.round(panelW * 0.017));
      const lineHeight = Math.max(Math.round(15 * dpr), Math.round(bodyPx * 1.24));
      ctx.font = `600 ${bodyPx}px ${fontFamily}`;
      ctx.fillStyle = "rgba(200, 235, 255, 1)";
      drawCenteredWrappedText(ctx, `[LEFT] ${left ? left.text : ""}`, x + panelW * 0.5, y + panelH * 0.4, panelW * 0.84, lineHeight, 2);
      ctx.fillStyle = "rgba(255, 214, 180, 1)";
      drawCenteredWrappedText(ctx, `[RIGHT] ${right ? right.text : ""}`, x + panelW * 0.5, y + panelH * 0.64, panelW * 0.84, lineHeight, 2);
    }
    if (drawStartTitle) {
      const fontFamily = '"Science Gothic", ui-sans-serif, system-ui, sans-serif';
      const fontPx = fitCanvasFontPx(
        ctx,
        this.startTitleText,
        700,
        Math.min(Math.round(w * 0.18), Math.round(140 * dpr)),
        Math.round(20 * dpr),
        w * 0.9,
        fontFamily
      );
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `700 ${fontPx}px ${fontFamily}`;
      ctx.globalAlpha = this.startTitleAlpha;
      ctx.fillStyle = "rgba(224, 64, 48, 1)";
      ctx.fillText(this.startTitleText, w * 0.5, h * 0.25);
    }
    this._drawLevelWipe(ctx, w, h, dpr);
    ctx.globalAlpha = 1;
  }
}
function fitCanvasFontPx(ctx, text, weight, maxPx, minPx, maxWidth, family) {
  let px = Math.max(minPx, maxPx);
  while (px > minPx) {
    ctx.font = `${weight} ${px}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    px -= 1;
  }
  return Math.max(minPx, px);
}
function drawCenteredWrappedText(ctx, text, cx, topY, maxWidth, lineHeight, maxLines) {
  const rawWords = String(text || "").trim().split(/\s+/).filter(Boolean);
  if (!rawWords.length) return;
  const words = [];
  for (const token of rawWords) {
    if (ctx.measureText(token).width <= maxWidth) {
      words.push(token);
      continue;
    }
    let chunk = "";
    for (const ch of token) {
      const next = chunk + ch;
      if (chunk && ctx.measureText(next).width > maxWidth) {
        words.push(chunk);
        chunk = ch;
      } else {
        chunk = next;
      }
    }
    if (chunk) words.push(chunk);
  }
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line);
      line = word;
      if (lines.length >= maxLines - 1) break;
    } else {
      line = next;
    }
  }
  if (line && lines.length < maxLines) {
    lines.push(line);
  }
  if (!lines.length) return;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], cx, topY + i * lineHeight);
  }
}
function indexPathFromPos(path, distMax, x, y) {
  let distClosestSqr = Infinity;
  let indexPath = null;
  for (let i = 1; i < path.length; ++i) {
    const pos0 = path[i - 1];
    const pos1 = path[i];
    const dSegX = pos1.x - pos0.x;
    const dSegY = pos1.y - pos0.y;
    const dPosX = x - pos0.x;
    const dPosY = y - pos0.y;
    let u = (dSegX * dPosX + dSegY * dPosY) / (dSegX * dSegX + dSegY * dSegY);
    u = Math.max(0, Math.min(1, u));
    const dPosClosestX = dSegX * u - dPosX;
    const dPosClosestY = dSegY * u - dPosY;
    const distSqr = dPosClosestX * dPosClosestX + dPosClosestY * dPosClosestY;
    if (distSqr > distMax * distMax) continue;
    if (distSqr < distClosestSqr) {
      distClosestSqr = distSqr;
      indexPath = i - 1 + u;
    }
  }
  return indexPath;
}
function posFromPathIndex(path, indexPath) {
  if (path.length === 0) {
    return path[0];
  }
  indexPath = Math.max(0, Math.min(path.length - 1, indexPath));
  let iSeg = Math.floor(indexPath);
  let uSeg = indexPath - iSeg;
  if (iSeg === path.length - 1) {
    iSeg -= 1;
    uSeg += 1;
  }
  const x0 = path[iSeg].x;
  const y0 = path[iSeg].y;
  const x1 = path[iSeg + 1].x;
  const y1 = path[iSeg + 1].y;
  const dSegX = x1 - x0;
  const dSegY = y1 - y0;
  return { x: x0 + dSegX * uSeg, y: y0 + dSegY * uSeg };
}
function moveAlongPathPositive(path, indexPath, distRemaining, indexPathMax) {
  const iSegMax = Math.floor(indexPathMax);
  const uSegMax = indexPathMax - iSegMax;
  let iSeg = Math.floor(indexPath);
  let uSeg = indexPath - iSeg;
  while (iSeg > 0 && iSeg + 1 < path.length) {
    const dSegX = path[iSeg + 1].x - path[iSeg].x;
    const dSegY = path[iSeg + 1].y - path[iSeg].y;
    const distSeg = Math.hypot(dSegX, dSegY);
    const distSegStop = iSeg < iSegMax ? Infinity : uSegMax * distSeg;
    if (distRemaining >= distSegStop) {
      indexPath = indexPathMax;
      break;
    }
    const distSegRemaining = (1 - uSeg) * distSeg;
    if (distRemaining < distSegRemaining) {
      indexPath += distRemaining / distSeg;
      break;
    }
    distRemaining -= distSegRemaining;
    ++iSeg;
    uSeg = 0;
    indexPath = iSeg;
  }
  return indexPath;
}
function moveAlongPathNegative(path, indexPath, distRemaining, indexPathMin) {
  const iSegMin = Math.floor(indexPathMin);
  const uSegMin = indexPathMin - iSegMin;
  let iSeg = Math.floor(indexPath);
  let uSeg = indexPath - iSeg;
  while (iSeg > 0 && iSeg + 1 < path.length) {
    const dSegX = path[iSeg + 1].x - path[iSeg].x;
    const dSegY = path[iSeg + 1].y - path[iSeg].y;
    const distSeg = Math.hypot(dSegX, dSegY);
    const distSegStop = iSeg > iSegMin ? Infinity : (1 - uSegMin) * distSeg;
    if (distRemaining >= distSegStop) {
      indexPath = indexPathMin;
      break;
    }
    const distSegRemaining = uSeg * distSeg;
    if (distRemaining < distSegRemaining) {
      indexPath -= distRemaining / distSeg;
      break;
    }
    distRemaining -= distSegRemaining;
    indexPath = iSeg;
    --iSeg;
    uSeg = 1;
  }
  return indexPath;
}
const ambientMain256Url = "/dropship-testing/assets/ambientmain_0_256k-BQUU4_sA.mp3";
const spacelife256Url = "/dropship-testing/assets/spacelifeNo14_256k-Dk4aCysq.mp3";
const victoryMusicUrl = "/dropship-testing/assets/Space%20Sprinkles-kov5bht1.mp3";
const combatAwakeUrl = "/dropship-testing/assets/awake10_megaWall-BexXQOGy.mp3";
const combatOrbitalUrl = "/dropship-testing/assets/Orbital%20Colossus-C937vrvo.mp3";
const bombLaunch256Url = "/dropship-testing/assets/rlaunch_256k-DNfk__OA.mp3";
const pistol256Url = "/dropship-testing/assets/pistol_256k-D9XTDHkJ.mp3";
const explosion256Url = "/dropship-testing/assets/8bit_gunloop_explosion_256k-CtsUsLx7.mp3";
const crash256Url = "/dropship-testing/assets/qubodup-crash_256k-Cn_3-9G1.mp3";
const shipHitUrl = "/dropship-testing/assets/metalthunk-Cuhnb1KH.mp3";
const enemyFireUrl = "/dropship-testing/assets/ghost_256k-CH8qtza0.mp3";
const thrustUrl = "/dropship-testing/assets/engine_sound-DOSUhxEp.mp3";
const rescueUrl = "/dropship-testing/assets/key-176034-BT_eNYTi.mp3";
const levelCompleteUrl = "/dropship-testing/assets/levelcompletesplash-BGVngfyX.mp3";
const hazardHeatUrl = "/dropship-testing/assets/lava_256k-BXgCrPRI.mp3";
const splash256Url = "/dropship-testing/assets/splash1_256k-YxYHLH8L.mp3";
const TRACK_PLAY_COUNT = 2;
const AMBIENT_PLAYLIST = [
  ambientMain256Url,
  spacelife256Url
];
const COMBAT_PLAYLIST = [
  combatAwakeUrl,
  combatOrbitalUrl
];
const MUSIC_CROSSFADE_MS = 1400;
const COMBAT_TRIGGER_MIN_MS = 24e3;
const COMBAT_TRIGGER_MAX_MS = 48e3;
const COMBAT_RETRIGGER_COOLDOWN_MS = 18e3;
const THRUST_LOOP_GAIN = 0.25;
const THRUST_LOOP_FADE_IN_MS = 90;
const THRUST_LOOP_FADE_OUT_MS = 320;
const MAX_PENDING_SFX = 24;
const DEFAULT_SFX_POOL_SIZE = 3;
const SFX_POOL_SIZE = {
  ship_laser: 4,
  enemy_fire: 4,
  bomb_explosion: 3,
  water_splash: 4
};
const SFX_MIN_INTERVAL_MS = {
  ship_laser: 70
};
const WEB_AUDIO_SFX_IDS = Object.freeze(["ship_laser", "enemy_fire"]);
const WEB_AUDIO_SFX_VARIANT_RATES = Object.freeze({
  ship_laser: [0.96, 1, 1.04]
});
const SFX_PLACEHOLDER_URLS = {
  ship_laser: pistol256Url,
  bomb_launch: bombLaunch256Url,
  bomb_explosion: crash256Url,
  ship_hit: shipHitUrl,
  ship_crash: crash256Url,
  enemy_fire: enemyFireUrl,
  enemy_destroyed: explosion256Url,
  miner_rescued: rescueUrl,
  objective_complete: levelCompleteUrl,
  ship_thrust_loop: thrustUrl,
  heat_warning: hazardHeatUrl,
  water_splash: splash256Url,
  dock_refuel: null
};
const SFX_IMPORTANT = Object.freeze([
  { id: "ship_laser", priority: 1, trigger: "GameLoop._step when player shot is created", placeholderFile: "audio/fx/q009-sounds/q009/pistol_256k.mp3" },
  { id: "ship_hit", priority: 2, trigger: "GameLoop._damageShip", placeholderFile: "audio/fx/metalthunk.mp3" },
  { id: "ship_crash", priority: 3, trigger: "GameLoop._triggerCrash", placeholderFile: "audio/fx/qubodup-crash_256k.mp3" },
  { id: "bomb_explosion", priority: 4, trigger: "GameLoop player bomb detonation path", placeholderFile: "audio/fx/qubodup-crash_256k.mp3" },
  { id: "enemy_destroyed", priority: 5, trigger: "GameLoop enemy HP reaches 0 and removed", placeholderFile: "audio/fx/8bit_gunloop_explosion_256k.mp3" },
  { id: "enemy_fire", priority: 6, trigger: "Enemies._shoot", placeholderFile: "audio/fx/ghost_256k.mp3" },
  { id: "miner_rescued", priority: 7, trigger: "GameLoop miner boards ship", placeholderFile: "audio/fx/key-176034.mp3" },
  { id: "objective_complete", priority: 8, trigger: "When objective transitions to complete", placeholderFile: "audio/fx/levelcompletesplash.mp3" },
  { id: "ship_thrust_loop", priority: 9, trigger: "While ship thrust is active", placeholderFile: "audio/fx/engine_sound.mp3" },
  { id: "heat_warning", priority: 10, trigger: "Heat meter warning state", placeholderFile: "audio/fx/lava_256k.mp3" },
  { id: "water_splash", priority: 11, trigger: "GameLoop ship crosses water surface in/out", placeholderFile: "audio/fx/splash1_256k.mp3" },
  { id: "dock_refuel", priority: 12, trigger: "Docked and refilling hp/bombs", placeholderFile: "(placeholder only, pick clip)" }
]);
class BackgroundMusic {
  /**
   * @param {{volume?:number}} [opts]
   */
  constructor(opts) {
    const volume = opts && typeof opts.volume === "number" ? opts.volume : 0.35;
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.enabled = true;
    this.sfxEnabled = true;
    this.sfxMasterVolume = 0.7;
    this.combatMusicEnabled = true;
    this.webAudioCtx = null;
    this.webAudioBuffers = /* @__PURE__ */ new Map();
    this.webAudioVariantBuffers = /* @__PURE__ */ new Map();
    this.webAudioBufferPromises = /* @__PURE__ */ new Map();
    this.webAudioSfxIds = new Set(
      /** @type {SfxId[]} */
      WEB_AUDIO_SFX_IDS
    );
    this.audioUnlocked = false;
    this.sfxPrimed = false;
    this.trackIndex = 0;
    this.trackPlays = 0;
    this.mode = "ambient";
    this.victoryTriggered = false;
    this.combatActive = false;
    this.nextCombatEligibleAt = performance.now() + this._randomCombatDelayMs();
    this.lastCombatIndex = -1;
    this.audio = new Audio(AMBIENT_PLAYLIST[0]);
    this.audio.loop = false;
    this.audio.preload = "auto";
    this.audio.volume = this.musicVolume;
    this.audio.addEventListener("ended", () => this._onAmbientEnded());
    this.combatAudio = new Audio();
    this.combatAudio.loop = false;
    this.combatAudio.preload = "auto";
    this.combatAudio.volume = 0;
    this.combatAudio.addEventListener("ended", () => this._onCombatEnded());
    this.victoryAudio = new Audio(victoryMusicUrl);
    this.victoryAudio.loop = false;
    this.victoryAudio.preload = "auto";
    this.victoryAudio.volume = 0;
    this.victoryAudio.addEventListener("ended", () => this._onVictoryEnded());
    this.thrustLoopRequested = false;
    this.thrustLoopAudible = false;
    const thrustTemplateUrl = SFX_PLACEHOLDER_URLS.ship_thrust_loop;
    this.thrustLoopAudio = new Audio(thrustTemplateUrl);
    if (this.thrustLoopAudio) {
      this.thrustLoopAudio.loop = true;
      this.thrustLoopAudio.preload = "auto";
      this.thrustLoopAudio.volume = 0;
    }
    this.fadeTimers = /* @__PURE__ */ new Map();
    this.sfxPools = /* @__PURE__ */ new Map();
    this.sfxLastPlayAtMs = /* @__PURE__ */ new Map();
    this.pendingSfx = [];
    for (const [id, url] of Object.entries(SFX_PLACEHOLDER_URLS)) {
      if (!url) continue;
      if (id === "ship_thrust_loop") continue;
      const typedId = (
        /** @type {SfxId} */
        id
      );
      const typedPoolId = (
        /** @type {keyof typeof SFX_POOL_SIZE} */
        id
      );
      const voiceCount = SFX_POOL_SIZE[typedPoolId] || DEFAULT_SFX_POOL_SIZE;
      const voices = [];
      for (let i = 0; i < voiceCount; i++) {
        const el = new Audio(url);
        el.preload = "auto";
        voices.push(el);
      }
      this.sfxPools.set(typedId, { voices, next: 0 });
    }
    this._onFirstGesture = () => {
      this.audioUnlocked = true;
      this._detachGestureListeners();
      this._initWebAudioContext();
      this._preloadWebAudioSfx();
      this._playModeIfEnabled();
      this._primeSfx();
      this._flushPendingSfx();
      this._syncThrustLoopPlayback();
    };
    this._onVisibilityChange = () => {
      if (document.hidden) {
        this._pauseAllMusic();
        if (this.thrustLoopAudio) {
          this._cancelFade(this.thrustLoopAudio);
          this.thrustLoopAudio.pause();
          this.thrustLoopAudio.volume = 0;
        }
        this.thrustLoopAudible = false;
        return;
      }
      this._playModeIfEnabled();
      this._syncThrustLoopPlayback();
    };
    window.addEventListener("pointerdown", this._onFirstGesture, { passive: true });
    window.addEventListener("keydown", this._onFirstGesture, { passive: true });
    document.addEventListener("visibilitychange", this._onVisibilityChange, { passive: true });
    this._playModeIfEnabled();
  }
  /**
   * @returns {number}
   */
  _randomCombatDelayMs() {
    return COMBAT_TRIGGER_MIN_MS + Math.random() * (COMBAT_TRIGGER_MAX_MS - COMBAT_TRIGGER_MIN_MS);
  }
  /**
   * @returns {void}
   */
  _onAmbientEnded() {
    if (this.mode !== "ambient") return;
    this.trackPlays += 1;
    if (this.trackPlays < TRACK_PLAY_COUNT) {
      this.audio.currentTime = 0;
      this._playAmbientIfEnabled();
      return;
    }
    this.trackPlays = 0;
    this.trackIndex = (this.trackIndex + 1) % AMBIENT_PLAYLIST.length;
    this.audio.src = AMBIENT_PLAYLIST[this.trackIndex];
    this.audio.load();
    this._playAmbientIfEnabled();
  }
  /**
   * @returns {void}
   */
  _onCombatEnded() {
    if (this.mode !== "combat") return;
    this._switchToAmbient(true);
    this.nextCombatEligibleAt = performance.now() + COMBAT_RETRIGGER_COOLDOWN_MS + this._randomCombatDelayMs();
  }
  /**
   * @returns {void}
   */
  _onVictoryEnded() {
    if (this.mode !== "victory") return;
    this._switchToAmbient(true);
  }
  /**
   * @param {HTMLAudioElement} el
   * @returns {void}
   */
  _playAudio(el) {
    const maybePromise = el.play();
    if (maybePromise && typeof maybePromise.then === "function") {
      maybePromise.catch(() => {
      });
    }
  }
  /**
   * @returns {AudioContext|null}
   */
  _initWebAudioContext() {
    if (this.webAudioCtx) return this.webAudioCtx;
    const Ctor = window.AudioContext || /** @type {typeof AudioContext | undefined} */
    /** @type {any} */
    window.webkitAudioContext;
    if (!Ctor) return null;
    try {
      this.webAudioCtx = new Ctor();
    } catch (_err) {
      this.webAudioCtx = null;
    }
    return this.webAudioCtx;
  }
  /**
   * @param {AudioContext} ctx
   * @param {ArrayBuffer} data
   * @returns {Promise<AudioBuffer>}
   */
  _decodeAudioData(ctx, data) {
    return new Promise((resolve, reject) => {
      const done = (buffer) => resolve(buffer);
      const fail = (err) => reject(err);
      try {
        const maybe = ctx.decodeAudioData(data, done, fail);
        if (maybe && typeof maybe.then === "function") {
          maybe.then(done).catch(fail);
        }
      } catch (err) {
        reject(err);
      }
    });
  }
  /**
   * Pre-render one pitch-shifted variant so playback can stay at rate=1.
   * @param {AudioBuffer} baseBuffer
   * @param {number} rate
   * @returns {Promise<AudioBuffer|null>}
   */
  _renderPitchVariant(baseBuffer, rate) {
    const r2 = Math.max(0.5, Math.min(2, rate));
    const OfflineCtor = window.OfflineAudioContext || /** @type {any} */
    window.webkitOfflineAudioContext;
    if (!OfflineCtor) return Promise.resolve(null);
    try {
      const channels = Math.max(1, baseBuffer.numberOfChannels || 1);
      const length = Math.max(1, Math.ceil(baseBuffer.length / r2));
      const offline = new OfflineCtor(channels, length, baseBuffer.sampleRate);
      const source = offline.createBufferSource();
      source.buffer = baseBuffer;
      source.playbackRate.value = r2;
      source.connect(offline.destination);
      source.start(0);
      return offline.startRendering().catch(() => null);
    } catch (_err) {
      return Promise.resolve(null);
    }
  }
  /**
   * @param {SfxId} id
   * @param {AudioBuffer} baseBuffer
   * @returns {Promise<AudioBuffer[]>}
   */
  async _buildWebAudioVariants(id, baseBuffer) {
    const rates = WEB_AUDIO_SFX_VARIANT_RATES[id];
    if (!Array.isArray(rates) || rates.length <= 1) {
      return [baseBuffer];
    }
    const out = [];
    for (const rate of rates) {
      if (Math.abs(rate - 1) < 1e-6) {
        out.push(baseBuffer);
        continue;
      }
      const variant = await this._renderPitchVariant(baseBuffer, rate);
      out.push(variant || baseBuffer);
    }
    return out.length ? out : [baseBuffer];
  }
  /**
   * @param {SfxId} id
   * @returns {Promise<AudioBuffer|null>}
   */
  _ensureWebAudioBuffer(id) {
    if (!this.webAudioSfxIds.has(id)) return Promise.resolve(null);
    const existing = this.webAudioBuffers.get(id);
    if (existing) return Promise.resolve(existing);
    const pending = this.webAudioBufferPromises.get(id);
    if (pending) return pending;
    const url = SFX_PLACEHOLDER_URLS[id];
    const ctx = this._initWebAudioContext();
    if (!url || !ctx) return Promise.resolve(null);
    const request = fetch(url).then((r2) => {
      if (!r2.ok) throw new Error("SFX fetch failed");
      return r2.arrayBuffer();
    }).then((ab) => this._decodeAudioData(ctx, ab)).then(async (buffer) => {
      this.webAudioBuffers.set(id, buffer);
      this.webAudioVariantBuffers.set(id, [buffer]);
      const variants = await this._buildWebAudioVariants(id, buffer);
      this.webAudioVariantBuffers.set(id, variants);
      this.webAudioBufferPromises.delete(id);
      return buffer;
    }).catch((_err) => {
      this.webAudioBufferPromises.delete(id);
      return null;
    });
    this.webAudioBufferPromises.set(id, request);
    return request;
  }
  /**
   * @returns {void}
   */
  _preloadWebAudioSfx() {
    this.webAudioSfxIds.forEach((id) => {
      this._ensureWebAudioBuffer(id);
    });
  }
  /**
   * @param {SfxId} id
   * @param {number} volume
   * @param {number} rate
   * @returns {boolean}
   */
  _playWebAudioSfx(id, volume, rate) {
    if (!this.webAudioSfxIds.has(id)) return false;
    const ctx = this._initWebAudioContext();
    if (!ctx) return false;
    if (ctx.state === "suspended") {
      const maybe = ctx.resume();
      if (maybe && typeof maybe.then === "function") {
        maybe.catch(() => {
        });
      }
    }
    const variants = this.webAudioVariantBuffers.get(id);
    let buffer = null;
    if (variants && variants.length) {
      const i = variants.length > 1 ? Math.floor(Math.random() * variants.length) : 0;
      buffer = variants[i];
    } else {
      buffer = this.webAudioBuffers.get(id) || null;
    }
    if (!buffer) {
      this._ensureWebAudioBuffer(id);
      return false;
    }
    try {
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      source.buffer = buffer;
      const usePreBakedPitch = !!(variants && variants.length > 1);
      source.playbackRate.value = usePreBakedPitch ? 1 : Math.max(0.5, Math.min(2, rate));
      gain.gain.value = Math.max(0, Math.min(1, volume * this.sfxMasterVolume));
      source.connect(gain);
      gain.connect(ctx.destination);
      source.onended = () => {
        source.disconnect();
        gain.disconnect();
      };
      source.start(0);
      return true;
    } catch (_err) {
      return false;
    }
  }
  /**
   * @returns {void}
   */
  _playAmbientIfEnabled() {
    if (!this.enabled || !this.audioUnlocked || document.hidden) return;
    this._playAudio(this.audio);
  }
  /**
   * @returns {void}
   */
  _playCombatIfEnabled() {
    if (!this.enabled || !this.audioUnlocked || document.hidden) return;
    this._playAudio(this.combatAudio);
  }
  /**
   * @returns {void}
   */
  _playVictoryIfEnabled() {
    if (!this.enabled || !this.audioUnlocked || document.hidden) return;
    this._playAudio(this.victoryAudio);
  }
  /**
   * @returns {void}
   */
  _playModeIfEnabled() {
    if (!this.enabled || !this.audioUnlocked || document.hidden) return;
    if (this.mode === "combat") {
      this._playCombatIfEnabled();
    } else if (this.mode === "victory") {
      this._playVictoryIfEnabled();
    } else {
      this._playAmbientIfEnabled();
    }
  }
  /**
   * @returns {void}
   */
  _pauseAllMusic() {
    this.audio.pause();
    this.combatAudio.pause();
    this.victoryAudio.pause();
  }
  /**
   * @param {HTMLAudioElement} el
   * @returns {void}
   */
  _cancelFade(el) {
    const id = this.fadeTimers.get(el);
    if (typeof id === "number") {
      window.clearInterval(id);
      this.fadeTimers.delete(el);
    }
  }
  /**
   * @returns {void}
   */
  _cancelAllFades() {
    this.fadeTimers.forEach((id, el) => {
      window.clearInterval(id);
      this.fadeTimers.delete(el);
    });
  }
  /**
   * @param {HTMLAudioElement} el
   * @param {number} targetVolume
   * @param {number} durationMs
   * @param {(()=>void)|undefined} [onDone]
   * @returns {void}
   */
  _fadeAudio(el, targetVolume, durationMs, onDone) {
    const target = Math.max(0, Math.min(1, targetVolume));
    this._cancelFade(el);
    if (durationMs <= 0) {
      el.volume = target;
      if (onDone) onDone();
      return;
    }
    const startVol = el.volume;
    const startTime = performance.now();
    const timerId = window.setInterval(() => {
      const t = Math.max(0, Math.min(1, (performance.now() - startTime) / durationMs));
      el.volume = startVol + (target - startVol) * t;
      if (t >= 1) {
        this._cancelFade(el);
        if (onDone) onDone();
      }
    }, 33);
    this.fadeTimers.set(el, timerId);
  }
  /**
   * @returns {string|null}
   */
  _pickCombatTrack() {
    if (!COMBAT_PLAYLIST.length) return null;
    if (COMBAT_PLAYLIST.length === 1) {
      this.lastCombatIndex = 0;
      return COMBAT_PLAYLIST[0];
    }
    let i = Math.floor(Math.random() * COMBAT_PLAYLIST.length);
    if (i === this.lastCombatIndex) {
      i = (i + 1 + Math.floor(Math.random() * (COMBAT_PLAYLIST.length - 1))) % COMBAT_PLAYLIST.length;
    }
    this.lastCombatIndex = i;
    return COMBAT_PLAYLIST[i];
  }
  /**
   * @returns {boolean}
   */
  _startCombatTrackRandom() {
    const track = this._pickCombatTrack();
    if (!track) return false;
    this.mode = "combat";
    this._cancelAllFades();
    this.combatAudio.src = track;
    this.combatAudio.currentTime = 0;
    this.combatAudio.load();
    this.combatAudio.volume = 0;
    this._playCombatIfEnabled();
    this._fadeAudio(this.audio, 0, MUSIC_CROSSFADE_MS, () => {
      this.audio.pause();
      this.audio.volume = this.musicVolume;
    });
    this._fadeAudio(this.victoryAudio, 0, MUSIC_CROSSFADE_MS, () => {
      this.victoryAudio.pause();
      this.victoryAudio.currentTime = 0;
    });
    this._fadeAudio(this.combatAudio, this.musicVolume, MUSIC_CROSSFADE_MS);
    return true;
  }
  /**
   * @param {boolean} withFade
   * @returns {void}
   */
  _switchToAmbient(withFade) {
    this.mode = "ambient";
    if (!withFade) {
      this._cancelAllFades();
      this.combatAudio.pause();
      this.combatAudio.currentTime = 0;
      this.victoryAudio.pause();
      this.victoryAudio.currentTime = 0;
      this.audio.volume = this.musicVolume;
      this._playAmbientIfEnabled();
      return;
    }
    this._cancelAllFades();
    this.audio.volume = 0;
    this._playAmbientIfEnabled();
    this._fadeAudio(this.combatAudio, 0, MUSIC_CROSSFADE_MS, () => {
      this.combatAudio.pause();
      this.combatAudio.currentTime = 0;
    });
    this._fadeAudio(this.victoryAudio, 0, MUSIC_CROSSFADE_MS, () => {
      this.victoryAudio.pause();
      this.victoryAudio.currentTime = 0;
    });
    this._fadeAudio(this.audio, this.musicVolume, MUSIC_CROSSFADE_MS);
  }
  /**
   * @param {boolean} active
   * @returns {boolean}
   */
  setCombatActive(active) {
    this.combatActive = !!active;
    if (!this.combatActive && this.mode === "combat") {
      this._switchToAmbient(true);
      this.nextCombatEligibleAt = performance.now() + this._randomCombatDelayMs();
      return false;
    }
    if (!this.combatMusicEnabled || this.victoryTriggered) return false;
    if (!this.enabled || !this.audioUnlocked || document.hidden) return false;
    if (this.mode === "combat") return true;
    if (!this.combatActive) return false;
    if (performance.now() < this.nextCombatEligibleAt) return false;
    const started = this._startCombatTrackRandom();
    if (started) {
      this.nextCombatEligibleAt = Number.POSITIVE_INFINITY;
    }
    return started;
  }
  /**
   * Immediately start combat music when combat is already active.
   * Bypasses randomized eligibility delay used for ambient pacing.
   * @returns {boolean}
   */
  triggerCombatImmediate() {
    this.combatActive = true;
    this.nextCombatEligibleAt = 0;
    if (!this.combatMusicEnabled || this.victoryTriggered) return false;
    if (this.mode === "combat") return true;
    if (!this.enabled || !this.audioUnlocked || document.hidden) return false;
    const started = this._startCombatTrackRandom();
    if (started) {
      this.nextCombatEligibleAt = Number.POSITIVE_INFINITY;
    }
    return started;
  }
  /**
   * @returns {boolean}
   */
  toggleCombatMusicEnabled() {
    this.combatMusicEnabled = !this.combatMusicEnabled;
    if (!this.combatMusicEnabled) {
      this.nextCombatEligibleAt = Number.POSITIVE_INFINITY;
      if (this.mode === "combat") {
        this._switchToAmbient(true);
      }
    } else {
      const now = performance.now();
      const next = now + this._randomCombatDelayMs();
      const soon = now + 7e3 + Math.random() * 5e3;
      this.nextCombatEligibleAt = this.combatActive ? Math.min(next, soon) : next;
    }
    return !this.combatMusicEnabled;
  }
  /**
   * @returns {boolean}
   */
  triggerVictoryMusic() {
    if (this.victoryTriggered) return false;
    this.victoryTriggered = true;
    this.combatActive = false;
    this.nextCombatEligibleAt = Number.POSITIVE_INFINITY;
    this.mode = "victory";
    this._cancelAllFades();
    this.victoryAudio.currentTime = 0;
    this.victoryAudio.volume = this.audioUnlocked ? 0 : this.musicVolume;
    this._playVictoryIfEnabled();
    this._fadeAudio(this.audio, 0, MUSIC_CROSSFADE_MS, () => {
      this.audio.pause();
      this.audio.volume = this.musicVolume;
    });
    this._fadeAudio(this.combatAudio, 0, MUSIC_CROSSFADE_MS, () => {
      this.combatAudio.pause();
      this.combatAudio.currentTime = 0;
    });
    this._fadeAudio(this.victoryAudio, this.musicVolume, MUSIC_CROSSFADE_MS);
    return true;
  }
  /**
   * @returns {void}
   */
  _detachGestureListeners() {
    window.removeEventListener("pointerdown", this._onFirstGesture);
    window.removeEventListener("keydown", this._onFirstGesture);
  }
  /**
   * @returns {void}
   */
  _syncThrustLoopPlayback() {
    if (!this.thrustLoopAudio) return;
    const shouldPlay = this.sfxEnabled && this.thrustLoopRequested && !document.hidden;
    const targetVolume = Math.max(0, Math.min(1, this.sfxMasterVolume * THRUST_LOOP_GAIN));
    if (shouldPlay === this.thrustLoopAudible) {
      if (shouldPlay) {
        if (this.thrustLoopAudio.paused) {
          this._playAudio(this.thrustLoopAudio);
        }
        this.thrustLoopAudio.volume = targetVolume;
      }
      return;
    }
    this.thrustLoopAudible = shouldPlay;
    if (shouldPlay) {
      if (this.thrustLoopAudio.paused) {
        this._playAudio(this.thrustLoopAudio);
      }
      this._fadeAudio(this.thrustLoopAudio, targetVolume, THRUST_LOOP_FADE_IN_MS);
      return;
    }
    this._fadeAudio(this.thrustLoopAudio, 0, THRUST_LOOP_FADE_OUT_MS, () => {
      if (!this.thrustLoopAudio || this.thrustLoopAudible) return;
      this.thrustLoopAudio.pause();
    });
  }
  /**
   * @param {boolean} active
   * @returns {boolean}
   */
  setThrustLoopActive(active) {
    const next = !!active;
    if (next === this.thrustLoopRequested) return this.thrustLoopRequested;
    this.thrustLoopRequested = next;
    this._syncThrustLoopPlayback();
    return this.thrustLoopRequested;
  }
  /**
   * Best-effort warm-up for first-play latency after user unlock.
   * @returns {void}
   */
  _primeSfx() {
    if (this.sfxPrimed) return;
    this.sfxPrimed = true;
    this.sfxPools.forEach((pool) => {
      const voice = pool.voices[0];
      if (!voice) return;
      voice.muted = true;
      const maybePromise = voice.play();
      if (maybePromise && typeof maybePromise.then === "function") {
        maybePromise.then(() => {
          voice.pause();
          voice.currentTime = 0;
          voice.muted = false;
        }).catch(() => {
          voice.muted = false;
        });
      } else {
        voice.pause();
        voice.currentTime = 0;
        voice.muted = false;
      }
    });
    if (this.thrustLoopAudio) {
      this.thrustLoopAudio.muted = true;
      const maybePromise = this.thrustLoopAudio.play();
      if (maybePromise && typeof maybePromise.then === "function") {
        maybePromise.then(() => {
          if (this.thrustLoopAudio) {
            this.thrustLoopAudio.pause();
            this.thrustLoopAudio.currentTime = 0;
            this.thrustLoopAudio.muted = false;
          }
        }).catch(() => {
          if (this.thrustLoopAudio) {
            this.thrustLoopAudio.muted = false;
          }
        });
      } else {
        this.thrustLoopAudio.pause();
        this.thrustLoopAudio.currentTime = 0;
        this.thrustLoopAudio.muted = false;
      }
    }
  }
  /**
   * @param {SfxId} id
   * @param {{volume?:number,rate?:number}|undefined} opts
   * @returns {void}
   */
  _queuePendingSfx(id, opts) {
    this.pendingSfx.push({ id, opts });
    if (this.pendingSfx.length > MAX_PENDING_SFX) {
      this.pendingSfx.splice(0, this.pendingSfx.length - MAX_PENDING_SFX);
    }
  }
  /**
   * @returns {void}
   */
  _flushPendingSfx() {
    if (!this.pendingSfx.length) return;
    const queued = this.pendingSfx.slice();
    this.pendingSfx.length = 0;
    for (const item of queued) {
      this.playSfx(item.id, item.opts);
    }
  }
  /**
   * Placeholder one-shot SFX trigger.
   * @param {SfxId} id
   * @param {{volume?:number, rate?:number}} [opts]
   * @returns {boolean}
   */
  playSfx(id, opts) {
    if (!this.sfxEnabled) return false;
    if (!this.audioUnlocked) {
      this._queuePendingSfx(id, opts);
      return false;
    }
    const nowMs = performance.now();
    const minInterval = SFX_MIN_INTERVAL_MS[id] || 0;
    const lastPlay = this.sfxLastPlayAtMs.get(id) || -Infinity;
    if (minInterval > 0 && nowMs - lastPlay < minInterval) {
      return false;
    }
    const volume = opts && typeof opts.volume === "number" ? opts.volume : 1;
    const rate = opts && typeof opts.rate === "number" ? opts.rate : 1;
    if (this._playWebAudioSfx(id, volume, rate)) {
      this.sfxLastPlayAtMs.set(id, nowMs);
      return true;
    }
    const pool = this.sfxPools.get(id);
    if (!pool || !pool.voices.length) return false;
    let voice = pool.voices.find((v) => v.paused || v.ended);
    if (!voice) {
      voice = pool.voices[pool.next];
      pool.next = (pool.next + 1) % pool.voices.length;
    }
    voice.currentTime = 0;
    voice.volume = Math.max(0, Math.min(1, volume * this.sfxMasterVolume));
    voice.playbackRate = Math.max(0.5, Math.min(2, rate));
    const maybePromise = voice.play();
    if (maybePromise && typeof maybePromise.then === "function") {
      maybePromise.catch(() => {
      });
    }
    this.sfxLastPlayAtMs.set(id, nowMs);
    return true;
  }
  /**
   * @returns {boolean}
   */
  toggleSfxMuted() {
    this.sfxEnabled = !this.sfxEnabled;
    this._syncThrustLoopPlayback();
    return !this.sfxEnabled;
  }
  /**
   * @returns {ReadonlyArray<{id:string,priority:number,trigger:string,placeholderFile:string}>}
   */
  listImportantSfx() {
    return SFX_IMPORTANT;
  }
  /**
   * Step music volume in 10% increments and apply immediately.
   * @param {number} direction Positive to increase, negative to decrease.
   * @returns {number} New volume in percent [0..100].
   */
  stepMusicVolume(direction) {
    const dir = (direction || 0) >= 0 ? 1 : -1;
    const stepPercent = 10;
    const currentPercent = Math.round(this.musicVolume * 100);
    const nextPercent = dir > 0 ? Math.min(100, (Math.floor(currentPercent / stepPercent) + 1) * stepPercent) : Math.max(0, (Math.ceil(currentPercent / stepPercent) - 1) * stepPercent);
    this.musicVolume = nextPercent / 100;
    this._cancelAllFades();
    if (this.mode === "combat") {
      this.audio.volume = 0;
      this.victoryAudio.volume = 0;
      this.combatAudio.volume = this.enabled ? this.musicVolume : 0;
    } else if (this.mode === "victory") {
      this.audio.volume = 0;
      this.combatAudio.volume = 0;
      this.victoryAudio.volume = this.enabled ? this.musicVolume : 0;
    } else {
      this.combatAudio.volume = 0;
      this.victoryAudio.volume = 0;
      this.audio.volume = this.enabled ? this.musicVolume : 0;
    }
    return nextPercent;
  }
  /**
   * @returns {boolean}
   */
  toggleMuted() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this._playModeIfEnabled();
    } else {
      this._pauseAllMusic();
    }
    this._syncThrustLoopPlayback();
    return !this.enabled;
  }
  /**
   * Force music back to ambient playlist, used on level transitions.
   * @param {boolean} [withFade]
   * @returns {void}
   */
  returnToAmbient(withFade = true) {
    this.victoryTriggered = false;
    this.combatActive = false;
    this.mode = "ambient";
    this._switchToAmbient(!!withFade);
    this.nextCombatEligibleAt = performance.now() + this._randomCombatDelayMs();
  }
}
const HELP_STYLE_ID = "help-popup-style";
const HELP_CONTENT = `
  <section class="help-section">
    <h3>Mission Brief</h3>
    <div class="help-grid">
      <div class="help-k">Your Job</div><div class="help-v">Fly a dropship down to hostile planets, locate survivors, and return them safely to the mothership in orbit.</div>
      <div class="help-k">Mothership</div><div class="help-v">The mothership is your mobile base in orbit. It stores rescued crew and is where runs are reset, missions completed, and dropships upgraded.</div>
      <div class="help-k">Dropship</div><div class="help-v">The dropship is your active craft for terrain flight, combat, extraction, and docking back at the mothership.</div>
      <div class="help-k">Rescue Flow</div><div class="help-v">Find stranded crew on the surface, pick them up by landing next to them, survive enemies and terrain, then drop them off at the mothership.</div>
      <div class="help-k">Survivor Types</div><div class="help-v"><span class="help-chip">Miners</span> are the primary rescue objective. <span class="help-chip">Pilots</span> let you launch replacement dropships after a crash. <span class="help-chip">Engineers</span> unlock dropship upgrades while docked.</div>
      <div class="help-k">Upgrades</div><div class="help-v">Engineers can improve ship systems (for example hull, bombs, thrust, firepower, and utility gear). Choose upgrades when prompted at the mothership.</div>
    </div>
  </section>
  <section class="help-section">
    <h3>Flight Controls</h3>
    <div class="help-grid">
      <div class="help-k">Move / Strafe</div><div class="help-v"><span class="help-chip">A / D</span> or <span class="help-chip">Left / Right</span></div>
      <div class="help-k">Main Thrust</div><div class="help-v"><span class="help-chip">W</span> <span class="help-chip">Up</span> <span class="help-chip">Space</span></div>
      <div class="help-k">Reverse Thrust</div><div class="help-v"><span class="help-chip">S</span> or <span class="help-chip">Down</span></div>
      <div class="help-k">Fire Laser</div><div class="help-v"><span class="help-chip">LMB</span> (hold for autofire)</div>
      <div class="help-k">Drop Bomb</div><div class="help-v"><span class="help-chip">RMB</span></div>
      <div class="help-k">Restart / Upgrade / Level up</div><div class="help-v"><span class="help-chip">R</span>, hold <span class="help-chip">Shift+R</span> 3s abandon run</div>
      <div class="help-k">Open / Close Help</div><div class="help-v"><span class="help-chip">/</span> <span class="help-chip">?</span> (close also with <span class="help-chip">Esc</span>)</div>
      <div class="help-k">Music</div><div class="help-v"><span class="help-chip">M</span>/<span class="help-chip">B</span> mute toggle, <span class="help-chip">J</span> combat tracks toggle, <span class="help-chip">-</span>/<span class="help-chip">=</span> volume</div>
      <div class="help-k">Other audio</div><div class="help-v">Use system volume</div>
    </div>
  </section>
  <section class="help-section">
    <h3>Touch & Gamepad</h3>
    <div class="help-grid">
      <div class="help-k">Touch Movement</div><div class="help-v">Left circular pad (lower-left): drag for strafe + thrust/down.</div>
      <div class="help-k">Touch Aim / Fire</div><div class="help-v">Right diamond (lower-right): drag to aim, hold to fire.</div>
      <div class="help-k">Touch Bomb</div><div class="help-v">Right square (upper-right): drag + release to throw bomb.</div>
      <div class="help-k">Touch Play</div><div class="help-v">Large play circle (upper-left area): appears for context actions (new dropship, upgrades, scanner, next level).</div>
      <div class="help-k">Touch Restart</div><div class="help-v">Small <span class="help-chip">↻</span> button next to <span class="help-chip">?</span>: hold 3s to restart run during active play.</div>
      <div class="help-k">Touch Help</div><div class="help-v">Small circled <span class="help-chip">?</span> button in upper-left.</div>
      <div class="help-k">Gamepad Move</div><div class="help-v">Left stick (analog thrust vector).</div>
      <div class="help-k">Gamepad Aim</div><div class="help-v">Right stick.</div>
      <div class="help-k">Gamepad Inputs</div><div class="help-v"><span class="help-chip">Left Stick</span> analog thrust vector, <span class="help-chip">D-pad</span> left/right/up/down digital thrust, <span class="help-chip">B</span> down, <span class="help-chip">LB</span>/<span class="help-chip">LT</span> bomb, <span class="help-chip">RB</span>/<span class="help-chip">RT</span> laser (hold for autofire), <span class="help-chip">A/Button0</span> restart/upgrade/level, <span class="help-chip">Start</span> hold 3s abandon run, <span class="help-chip">Y/Button3</span> help, <span class="help-chip">RT/LT</span>, both sticks, or <span class="help-chip">D-pad Up/Down</span> scroll help.</div>
    </div>
  </section>
  <section class="help-section">
    <h3>HUD & Indicators</h3>
    <div class="help-legend">
      <div class="help-legend-item"><span class="help-glyph help-glyph-thrust"></span><div><b>Thruster plumes</b><span>Active directional thrust output from the dropship.</span></div></div>
      <div class="help-legend-item"><span class="help-glyph help-glyph-velocity"></span><div><b>Velocity / braking line</b><span>Projected stopping distance from your current speed and local gravity.</span></div></div>
      <div class="help-legend-item"><span class="help-glyph help-glyph-mother"></span><div><b>Mothership indicator</b><span>Blue edge arrow points toward off-screen mothership.</span></div></div>
      <div class="help-legend-item"><span class="help-glyph help-glyph-orbit"></span><div><b>Apogee / Perigee markers</b><span>Orbit line with cross ticks for farthest and closest altitude points.</span></div></div>
      <div class="help-legend-item"><span class="help-glyph help-glyph-miner"></span><div><b>Closest miner indicator</b><span>When rescuee detector is unlocked, edge arrow points to nearest stranded miner.</span></div></div>
      <div class="help-legend-item"><span class="help-glyph help-glyph-hud"></span><div><b>Status labels</b><span>Top-left: hull/bombs. Bottom-left: objective + prompts. Bottom-right: planet/level. Bottom-center: heat meter when active.</span></div></div>
    </div>
  </section>
  <section class="help-section">
    <h3>Audio Credits</h3>
    <div class="help-v">
      Luke.RUSTLTD, brandon75689, cynicmusic, pauliuw, Michel Baradari, Ogrebane, ycake, Blender Foundation, Matthew Pablo, Q009, qubodup, yd, Musheran, GreyFrogGames.
      Full attribution: <a href="https://github.com/mcneja/dropship/blob/main/gameaudio/ATTRIBUTION.md" target="_blank" rel="noopener noreferrer">ATTRIBUTION.md on GitHub</a>.
    </div>
  </section>
`;
function ensureHelpStyles() {
  if (document.getElementById(HELP_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = HELP_STYLE_ID;
  style.textContent = `
    #help-popup {
      position: fixed;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 60;
      pointer-events: auto;
    }
    #help-popup.help-open { display: flex; }
    #help-popup .help-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(3, 5, 10, 0.68);
      backdrop-filter: blur(2px);
    }
    #help-popup .help-panel {
      position: relative;
      width: min(940px, calc(100vw - max(16px, env(safe-area-inset-left)) - max(16px, env(safe-area-inset-right))));
      max-height: min(88vh, calc(100vh - max(16px, env(safe-area-inset-top)) - max(16px, env(safe-area-inset-bottom))));
      border: 2px solid rgba(255, 215, 110, 0.95);
      border-radius: 12px;
      background: linear-gradient(180deg, rgba(14,16,27,0.98), rgba(9,10,18,0.96));
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.55), inset 0 0 0 1px rgba(255,255,255,0.05);
      color: #e8f0ff;
      font: 500 15px/1.35 "Science Gothic", ui-sans-serif, system-ui, sans-serif;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    #help-popup .help-panel,
    #help-popup .help-panel * {
      user-select: text;
      -webkit-user-select: text;
      -webkit-touch-callout: default;
    }
    #help-popup .help-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 12px 16px 10px;
      border-bottom: 1px solid rgba(255, 215, 110, 0.35);
      background: linear-gradient(90deg, rgba(255, 215, 110, 0.12), rgba(120, 210, 255, 0.1));
    }
    #help-popup .help-title {
      margin: 0;
      color: rgba(255, 240, 190, 1);
      font: 700 clamp(16px, 2.4vw, 26px)/1.1 "Science Gothic", ui-sans-serif, system-ui, sans-serif;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    #help-popup .help-close-hint {
      color: rgba(200, 235, 255, 0.95);
      font-size: clamp(11px, 1.8vw, 14px);
      white-space: nowrap;
    }
    #help-popup .help-close-btn {
      appearance: none;
      border: 1px solid rgba(255,255,255,0.25);
      color: #fff;
      background: rgba(255,255,255,0.06);
      border-radius: 8px;
      font: 700 14px/1 "Science Gothic", ui-sans-serif, system-ui, sans-serif;
      width: 32px;
      height: 32px;
      cursor: pointer;
      flex: 0 0 auto;
      user-select: none;
      -webkit-user-select: none;
      -webkit-touch-callout: none;
    }
    #help-popup .help-scroll {
      overflow-y: auto;
      padding: 10px 16px 16px;
      display: block;
      scrollbar-width: thin;
      scrollbar-color: rgba(136, 210, 255, 0.9) rgba(255, 255, 255, 0.08);
      scrollbar-gutter: stable;
      overscroll-behavior: contain;
    }
    #help-popup .help-scroll::-webkit-scrollbar {
      width: 10px;
    }
    #help-popup .help-scroll::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.08);
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.12);
    }
    #help-popup .help-scroll::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, rgba(176, 226, 255, 0.95), rgba(120, 210, 255, 0.92));
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.28);
      box-shadow: 0 0 0 1px rgba(10, 14, 24, 0.35) inset;
    }
    #help-popup .help-scroll::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, rgba(196, 236, 255, 0.98), rgba(136, 220, 255, 0.95));
    }
    #help-popup .help-section + .help-section { margin-top: 16px; }
    #help-popup .help-section h3 {
      margin: 0 0 8px;
      font: 650 clamp(14px, 2vw, 19px)/1.2 "Science Gothic", ui-sans-serif, system-ui, sans-serif;
      letter-spacing: 0.02em;
      color: rgba(255, 240, 190, 0.98);
    }
    #help-popup .help-grid {
      display: grid;
      grid-template-columns: minmax(140px, 0.34fr) 1fr;
      gap: 8px 12px;
      align-items: start;
    }
    #help-popup .help-k {
      color: rgba(200, 235, 255, 0.96);
      font-weight: 650;
    }
    #help-popup .help-v { color: rgba(232, 240, 255, 0.95); }
    #help-popup .help-v a {
      color: rgba(136, 210, 255, 1);
      text-decoration-color: rgba(136, 210, 255, 0.8);
    }
    #help-popup .help-v a:hover {
      color: rgba(176, 226, 255, 1);
    }
    #help-popup .help-chip {
      display: inline-block;
      border: 1px solid rgba(255,255,255,0.28);
      border-radius: 6px;
      padding: 0 6px;
      margin: 0 2px;
      background: rgba(255,255,255,0.07);
      color: #fff;
      font-size: 0.92em;
      line-height: 1.35;
    }
    #help-popup .help-legend { display: grid; gap: 9px; }
    #help-popup .help-legend-item {
      display: grid;
      grid-template-columns: 22px 1fr;
      gap: 10px;
      align-items: start;
      padding: 6px 8px;
      border-radius: 8px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
    }
    #help-popup .help-legend-item b {
      display: block;
      color: rgba(200, 235, 255, 1);
      font-weight: 700;
    }
    #help-popup .help-legend-item span { color: rgba(232, 240, 255, 0.92); }
    #help-popup .help-glyph {
      width: 20px;
      height: 16px;
      position: relative;
      margin-top: 1px;
      box-sizing: border-box;
    }
    #help-popup .help-glyph::before,
    #help-popup .help-glyph::after {
      content: "";
      position: absolute;
      box-sizing: border-box;
    }
    #help-popup .help-glyph-thrust {
      color: rgba(255, 140, 38, 0.98);
    }
    #help-popup .help-glyph-thrust::before,
    #help-popup .help-glyph-thrust::after {
      top: 2px;
      width: 2px;
      height: 12px;
      background: rgba(255, 145, 45, 1);
      transform-origin: center top;
    }
    #help-popup .help-glyph-thrust::before {
      left: 6px;
      transform: rotate(42deg);
    }
    #help-popup .help-glyph-thrust::after {
      left: 13px;
      transform: rotate(-42deg);
    }
    #help-popup .help-glyph-velocity::before {
      left: 1px;
      right: 1px;
      top: 7px;
      height: 2px;
      background: rgba(106, 198, 255, 1);
    }
    #help-popup .help-glyph-mother::before,
    #help-popup .help-glyph-mother::after,
    #help-popup .help-glyph-miner::before,
    #help-popup .help-glyph-miner::after {
      width: 2px;
      height: 9px;
      top: 3px;
      transform-origin: center center;
    }
    #help-popup .help-glyph-mother::before,
    #help-popup .help-glyph-mother::after {
      background: rgba(95, 194, 255, 1);
    }
    #help-popup .help-glyph-miner::before,
    #help-popup .help-glyph-miner::after {
      background: rgba(255, 206, 156, 1);
    }
    #help-popup .help-glyph-mother::before,
    #help-popup .help-glyph-miner::before {
      left: 9px;
      transform: rotate(48deg);
    }
    #help-popup .help-glyph-mother::after,
    #help-popup .help-glyph-miner::after {
      left: 13px;
      transform: rotate(-48deg);
    }
    #help-popup .help-glyph-orbit::before {
      left: 9px;
      top: 2px;
      width: 2px;
      height: 12px;
      background: rgba(106, 198, 255, 1);
    }
    #help-popup .help-glyph-orbit::after {
      left: 5px;
      top: 2px;
      width: 9px;
      height: 2px;
      background: rgba(106, 198, 255, 1);
      box-shadow: 0 10px 0 rgba(106, 198, 255, 1);
    }
    #help-popup .help-glyph-hud::before {
      inset: 2px;
      border: 1.5px solid rgba(232, 240, 255, 0.92);
      border-radius: 2px;
    }
    #help-touch-toggle {
      position: fixed;
      left: calc(max(8px, env(safe-area-inset-left)));
      top: calc(max(8px, env(safe-area-inset-top)));
      width: 34px;
      height: 34px;
      border-radius: 999px;
      border: 1px solid rgba(255, 215, 110, 0.95);
      background: rgba(12, 14, 24, 0.88);
      color: rgba(255, 240, 190, 1);
      display: none;
      place-items: center;
      z-index: 45;
      font: 700 21px/1 "Science Gothic", ui-sans-serif, system-ui, sans-serif;
      text-shadow: 0 1px 3px rgba(0,0,0,0.7);
      box-shadow: 0 3px 12px rgba(0,0,0,0.35);
      padding: 0;
      pointer-events: auto;
      touch-action: manipulation;
    }
    #help-touch-toggle.help-touch-visible { display: grid; }
    #touch-restart-toggle {
      position: fixed;
      left: calc(max(8px, env(safe-area-inset-left)) + 40px);
      top: calc(max(8px, env(safe-area-inset-top)));
      width: 34px;
      height: 34px;
      border-radius: 999px;
      border: 1px solid rgba(255, 130, 90, 0.95);
      background: rgba(22, 15, 18, 0.9);
      color: rgba(255, 190, 170, 1);
      display: none;
      place-items: center;
      z-index: 45;
      font: 700 19px/1 "Science Gothic", ui-sans-serif, system-ui, sans-serif;
      text-shadow: 0 1px 3px rgba(0,0,0,0.7);
      box-shadow: 0 3px 12px rgba(0,0,0,0.35);
      padding: 0;
      pointer-events: auto;
      touch-action: manipulation;
      --restart-hold-progress: 0%;
    }
    body.help-touch-visible #touch-restart-toggle { display: grid; }
    body.help-touch-visible #touch-restart-toggle.touch-restart-disabled { display: none; }
    #touch-restart-toggle.touch-restart-holding {
      border-color: rgba(255, 98, 70, 1);
      background:
        conic-gradient(
          rgba(255, 98, 70, 0.92) var(--restart-hold-progress),
          rgba(22, 15, 18, 0.9) 0
        );
    }
    @media (max-width: 780px) {
      #help-popup .help-panel {
        width: calc(100vw - max(12px, env(safe-area-inset-left)) - max(12px, env(safe-area-inset-right)));
        max-height: calc(100vh - max(12px, env(safe-area-inset-top)) - max(12px, env(safe-area-inset-bottom)));
      }
      #help-popup .help-header { padding: 10px 12px 8px; }
      #help-popup .help-scroll { padding: 8px 12px 12px; }
      #help-popup .help-grid { grid-template-columns: 1fr; gap: 3px 8px; }
      #help-popup .help-k { margin-top: 2px; }
      #help-popup .help-close-hint { display: none; }
    }
  `;
  document.head.appendChild(style);
}
class HelpPopup {
  /**
   * @param {HelpPopupOptions} [options]
   */
  constructor(options = {}) {
    ensureHelpStyles();
    this.onToggle = typeof options.onToggle === "function" ? options.onToggle : null;
    this.open = false;
    this.root = document.createElement("div");
    this.root.id = "help-popup";
    this.root.innerHTML = `
      <div class="help-backdrop"></div>
      <section class="help-panel" role="dialog" aria-modal="true" aria-label="Dropship Help">
        <header class="help-header">
          <h2 class="help-title">Operations Manual</h2>
          <div class="help-close-hint">Close: / ? Esc Button3</div>
          <button type="button" class="help-close-btn" aria-label="Close help">x</button>
        </header>
        <div class="help-scroll">
          ${HELP_CONTENT}
        </div>
      </section>
    `;
    this.touchButton = document.createElement("button");
    this.touchButton.id = "help-touch-toggle";
    this.touchButton.type = "button";
    this.touchButton.setAttribute("aria-label", "Open help");
    this.touchButton.textContent = "?";
    this.scroller = /** @type {HTMLElement|null} */
    this.root.querySelector(".help-scroll");
    const closeBtn = (
      /** @type {HTMLButtonElement|null} */
      this.root.querySelector(".help-close-btn")
    );
    const backdrop = (
      /** @type {HTMLElement|null} */
      this.root.querySelector(".help-backdrop")
    );
    closeBtn == null ? void 0 : closeBtn.addEventListener("click", () => this.close());
    backdrop == null ? void 0 : backdrop.addEventListener("click", () => this.close());
    this.touchButton.addEventListener("click", (e) => {
      e.preventDefault();
      this.toggle();
    });
    this.touchButton.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    this.root.addEventListener("click", (e) => {
      if (e.target === this.root) this.close();
    });
    this._onKeyDownBound = (e) => this._onKeyDown(e);
    this._gamepadHelpHeld = false;
    this._lastGamepadPollMs = performance.now();
    this._pollGamepadBound = (ts) => this._pollGamepadToggle(ts);
    window.addEventListener("keydown", this._onKeyDownBound, true);
    document.body.appendChild(this.root);
    document.body.appendChild(this.touchButton);
    requestAnimationFrame(this._pollGamepadBound);
  }
  /**
   * @returns {boolean}
   */
  isOpen() {
    return this.open;
  }
  /**
   * @param {boolean} touchMode
   * @returns {void}
   */
  setTouchMode(touchMode) {
    const show = !!touchMode;
    this.touchButton.classList.toggle("help-touch-visible", show);
    document.body.classList.toggle("help-touch-visible", show);
  }
  /**
   * @returns {void}
   */
  show() {
    if (this.open) return;
    this.open = true;
    this.root.classList.add("help-open");
    document.body.classList.add("help-popup-open");
    if (this.scroller) this.scroller.scrollTop = 0;
    if (this.onToggle) this.onToggle(true);
  }
  /**
   * @returns {void}
   */
  close() {
    if (!this.open) return;
    this.open = false;
    this.root.classList.remove("help-open");
    document.body.classList.remove("help-popup-open");
    if (this.onToggle) this.onToggle(false);
  }
  /**
   * @returns {void}
   */
  toggle() {
    if (this.open) this.close();
    else this.show();
  }
  /**
   * @returns {boolean}
   */
  _isGamepadHelpPressed() {
    if (typeof navigator === "undefined" || typeof navigator.getGamepads !== "function") return false;
    const pads = navigator.getGamepads() || [];
    for (const pad of pads) {
      if (!pad || pad.connected === false || !pad.buttons) continue;
      const button3 = pad.buttons[3];
      if (button3 && (button3.pressed || button3.value > 0.5)) {
        return true;
      }
    }
    return false;
  }
  /**
   * @param {Gamepad|null|undefined} pad
   * @param {number} index
   * @returns {number}
   */
  _gamepadButtonValue(pad, index) {
    if (!pad || !pad.buttons || !pad.buttons[index]) return 0;
    const btn = pad.buttons[index];
    if (btn.pressed) return 1;
    return Math.max(0, Math.min(1, btn.value || 0));
  }
  /**
   * @param {number} v
   * @returns {number}
   */
  _gamepadAxisValue(v) {
    const raw = Number.isFinite(v) ? v : 0;
    const dead = 0.16;
    const mag = Math.abs(raw);
    if (mag <= dead) return 0;
    const scaled = (mag - dead) / (1 - dead);
    return Math.sign(raw) * Math.max(0, Math.min(1, scaled));
  }
  /**
   * @returns {number}
   */
  _gamepadScrollAxis() {
    if (typeof navigator === "undefined" || typeof navigator.getGamepads !== "function") return 0;
    const pads = navigator.getGamepads() || [];
    let down = 0;
    let up = 0;
    for (const pad of pads) {
      if (!pad || pad.connected === false) continue;
      const rt = this._gamepadButtonValue(pad, 7);
      const lt = this._gamepadButtonValue(pad, 6);
      const dpadDown = this._gamepadButtonValue(pad, 13);
      const dpadUp = this._gamepadButtonValue(pad, 12);
      const leftY = this._gamepadAxisValue(pad.axes && pad.axes.length > 1 ? pad.axes[1] : 0);
      const rightY = this._gamepadAxisValue(pad.axes && pad.axes.length > 3 ? pad.axes[3] : 0);
      down = Math.max(down, rt, dpadDown, Math.max(0, leftY), Math.max(0, rightY));
      up = Math.max(up, lt, dpadUp, Math.max(0, -leftY), Math.max(0, -rightY));
    }
    return Math.max(-1, Math.min(1, down - up));
  }
  /**
   * @param {number} ts
   * @returns {void}
   */
  _pollGamepadToggle(ts) {
    const dt = Math.max(0, Math.min(0.05, (ts - this._lastGamepadPollMs) / 1e3));
    this._lastGamepadPollMs = ts;
    const pressed = this._isGamepadHelpPressed();
    if (pressed && !this._gamepadHelpHeld) {
      this.toggle();
    }
    this._gamepadHelpHeld = pressed;
    if (this.open && this.scroller) {
      const axis = this._gamepadScrollAxis();
      if (Math.abs(axis) > 0.04) {
        const scrollPxPerSec = 780;
        this.scroller.scrollTop += axis * scrollPxPerSec * dt;
      }
    }
    requestAnimationFrame(this._pollGamepadBound);
  }
  /**
   * @param {KeyboardEvent} e
   * @returns {void}
   */
  _onKeyDown(e) {
    const slashKey = e.key === "/" || e.key === "?" || e.code === "Slash";
    if (e.repeat) return;
    if (!this.open) {
      if (!slashKey) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      this.show();
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (e.key === "Escape" || slashKey) {
      this.close();
      e.preventDefault();
      e.stopPropagation();
    }
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
const planetLabel = (
  /** @type {HTMLElement} */
  document.getElementById("planet-label")
);
const objectiveLabel = (
  /** @type {HTMLElement} */
  document.getElementById("objective-label")
);
const shipStatusLabel = (
  /** @type {HTMLElement} */
  document.getElementById("ship-status-label")
);
const heatMeter = (
  /** @type {HTMLElement} */
  document.getElementById("heat-meter")
);
const renderer = new Renderer(canvas, GAME);
const input = new Input(canvas);
const bgm = new BackgroundMusic({ volume: 0.35 });
const helpPopup = new HelpPopup({
  onToggle: (open) => input.setModalOpen(open)
});
const loop = new GameLoop({
  renderer,
  input,
  audio: bgm,
  ui: { updateHud, updatePlanetLabel, updateObjectiveLabel, updateShipStatusLabel, updateHeatMeter },
  canvas,
  overlay: (
    /** @type {HTMLCanvasElement} */
    document.getElementById("overlay")
  ),
  hud,
  planetLabel,
  objectiveLabel,
  shipStatusLabel,
  heatMeter,
  helpPopup
});
loadGameFromStorage(loop);
installExitSaveHandlers(loop);
loop.start();
