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
  FRAGMENT_PLANET_COLLISION: true,
  THRUST: 4.5,
  TURN_RATE: 2.4,
  DRAG: 0.12,
  // Max corrective acceleration available to the inertial drive while input is held (set to 0 to disable)
  INERTIAL_DRIVE_THRUST: 2.25,
  // Share of inertial-drive thrust allowed to oppose velocity opposite the desired input direction.
  INERTIAL_DRIVE_REVERSE_FRACTION: 1,
  // Share of inertial-drive thrust allowed to oppose velocity sideways to the desired input direction.
  INERTIAL_DRIVE_LATERAL_FRACTION: 1,
  // Quadratic drag in planetary air. Set to 0 to disable atmosphere drag entirely.
  ATMOSPHERE_DRAG: 0.2,
  // Thickness of the atmosphere band above the outer surface, in world units.
  ATMOSPHERE_HEIGHT: 0,
  CRASH_SPEED: 6,
  LAND_SPEED: 4,
  SURFACE_DOT: 0.7,
  LAND_FRICTION: 10,
  MOTHERSHIP_FRICTION: 10,
  MOTHERSHIP_RESTITUTION: 0.2,
  BOUNCE_RESTITUTION: 0.1,
  /** @type {boolean} */
  DEBUG_COLLISION: false,
  /** @type {boolean} */
  DEBUG_NODES: true,
  MINERS_PER_LEVEL: 10,
  MINER_CALL_RADIUS: 4,
  MINER_GUIDE_ATTACH_RADIUS: 1.1,
  MINER_WALK_MAX_SLOPE: 0.35,
  MINER_WALK_CLEARANCE: 0.2,
  MINER_WALK_SIDE_CLEARANCE: 0.25,
  MINER_GUIDE_STEP: 0.22,
  MINER_GUIDE_MAX_SEGMENT: 0.45,
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
  SHIP_STARTING_INERTIAL_DRIVE: 0,
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
  FOG_ALPHA_LERP: 0.2,
  JUMPDRIVE: Object.freeze({
    // Seconds spent damping camera rotation and pitching the mothership up.
    alignDuration: 0.5,
    // Minimum seconds spent in the star-streak jumpdrive run.
    jumpdriveMinDuration: 1.1,
    // Seconds spent revealing the next planet while staying zoomed out.
    revealDuration: 3.05,
    // Seconds spent zooming back into the normal gameplay framing.
    focusDuration: 0.7,
    // Max degrees the mothership pitches from its current heading toward open space.
    launchTiltDeg: 38,
    // Camera radius multiplier reached by the end of the align phase.
    alignZoomMultiplier: 1.12,
    // Additional camera radius multiplier used during the jumpdrive run.
    jumpdriveZoomMultiplier: 1.45,
    // Camera radius multiplier used at the start of the arrival reveal.
    revealStartZoomMultiplier: 3.5,
    // Camera radius multiplier reached by the end of the wide arrival reveal.
    revealZoomMultiplier: 1.85,
    // Overall scale multiplier for the mothership jumpdrive rocket plume.
    plumeScale: 1.5,
    // How far the mothership travels during launch, in view-radius units.
    launchDistanceMultiplier: 3.2,
    // How far above the final orbit position the arrival path starts.
    arrivalOffsetMultiplier: 1.9,
    // Sideways offset applied to the arrival path for a curved orbit entry.
    arrivalLateralMultiplier: 0.42,
    // Number of star streaks drawn in the jumpdrive overlay.
    streakCount: 84
  })
});
const TOUCH_UI = Object.freeze({
  left: { x: 0.13, y: 0.67, r: 0.13 },
  laser: { x: 0.87, y: 0.67, r: 0.12 },
  bomb: { x: 0.87, y: 0.3, r: 0.11 },
  start: { x: 0.13, y: 0.3, r: 0.13 },
  dead: 0.04,
  aimRadius: 0.09,
  activationScale: 1.4
});
function queryParam(key) {
  if (typeof window === "undefined" || typeof window.location === "undefined") return null;
  const params = new URLSearchParams(window.location.search || "");
  const value = params.get(key);
  return value == null ? null : value.trim();
}
function parseBool(value, fallback) {
  if (value == null || value === "") return fallback;
  const lower = value.toLowerCase();
  if (lower === "1" || lower === "true" || lower === "yes" || lower === "on") return true;
  if (lower === "0" || lower === "false" || lower === "no" || lower === "off") return false;
  return fallback;
}
function parseFiniteNumber(value, fallback) {
  if (value == null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
function boolParam(key, fallback = false) {
  return parseBool(queryParam(key), fallback);
}
function numberParam(key, fallback) {
  return parseFiniteNumber(queryParam(key), fallback);
}
function secondsParam(key, fallbackSeconds) {
  return Math.max(0, numberParam(key, fallbackSeconds)) * 1e3;
}
const maxDprRaw = numberParam("perf_max_dpr", NaN);
const maxDpr = Number.isFinite(maxDprRaw) && maxDprRaw >= 1 ? maxDprRaw : null;
const PERF_FLAGS = Object.freeze({
  maxDpr,
  disableMsaa: boolParam("perf_disable_msaa", false),
  disableFogSync: boolParam("perf_disable_fog", false),
  disableDynamicOverlay: boolParam("perf_disable_dynamic_overlay", false),
  disableOverlayCanvas: boolParam("perf_disable_overlay_canvas", false),
  disableHudLayout: boolParam("perf_disable_hud_layout", false),
  disableEnemyAi: boolParam("perf_disable_enemy_ai", false),
  disableAudioPlayback: boolParam("perf_disable_audio_playback", false),
  disableMusicPlayback: boolParam("perf_disable_music_playback", false),
  disableSfxPlayback: boolParam("perf_disable_sfx_playback", false)
});
const ACTIVE_PERF_FLAGS = Object.freeze((() => {
  const out = [];
  if (PERF_FLAGS.maxDpr !== null) out.push(`dpr<=${PERF_FLAGS.maxDpr}`);
  if (PERF_FLAGS.disableMsaa) out.push("msaa=off");
  if (PERF_FLAGS.disableFogSync) out.push("fog=off");
  if (PERF_FLAGS.disableDynamicOverlay) out.push("dynOverlay=off");
  if (PERF_FLAGS.disableOverlayCanvas) out.push("canvasOverlay=off");
  if (PERF_FLAGS.disableHudLayout) out.push("hudLayout=off");
  if (PERF_FLAGS.disableEnemyAi) out.push("enemyAI=off");
  if (PERF_FLAGS.disableAudioPlayback) out.push("audioPlayback=off");
  if (PERF_FLAGS.disableMusicPlayback) out.push("musicPlayback=off");
  if (PERF_FLAGS.disableSfxPlayback) out.push("sfxPlayback=off");
  return out;
})());
const benchEnabled = boolParam("bench", false);
const benchStartRaw = (queryParam("bench_start") || "").toLowerCase();
const BENCH_CONFIG = Object.freeze({
  enabled: benchEnabled,
  seed: numberParam("bench_seed", 1337),
  level: Math.max(1, Math.floor(numberParam("bench_level", 1))),
  start: benchStartRaw === "docked" ? "docked" : "orbit",
  warmupMs: secondsParam("bench_warmup", 3),
  durationMs: secondsParam("bench_duration", 20)
});
function getEffectiveDevicePixelRatio() {
  const base = Math.max(1, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
  return PERF_FLAGS.maxDpr == null ? base : Math.min(base, PERF_FLAGS.maxDpr);
}
class RollingFrameStats {
  /**
   * @param {number} [capacity]
   */
  constructor(capacity = 600) {
    this.capacity = Math.max(30, capacity | 0);
    this.samples = new Float32Array(this.capacity);
    this.count = 0;
    this.cursor = 0;
  }
  /**
   * @returns {void}
   */
  reset() {
    this.count = 0;
    this.cursor = 0;
  }
  /**
   * @param {number} frameMs
   * @returns {void}
   */
  record(frameMs) {
    if (!Number.isFinite(frameMs) || frameMs < 0) return;
    this.samples[this.cursor] = frameMs;
    this.cursor = (this.cursor + 1) % this.capacity;
    if (this.count < this.capacity) this.count++;
  }
  /**
   * @returns {number[]}
   */
  _orderedSamples() {
    const out = new Array(this.count);
    if (this.count < this.capacity) {
      for (let i = 0; i < this.count; i++) out[i] = /** @type {number} */
      this.samples[i];
      return out;
    }
    for (let i = 0; i < this.count; i++) {
      out[i] = /** @type {number} */
      this.samples[(this.cursor + i) % this.capacity];
    }
    return out;
  }
  /**
   * @param {number[]} sorted
   * @param {number} p
   * @returns {number}
   */
  _percentile(sorted, p) {
    if (!sorted.length) return 0;
    const idx = Math.max(0, Math.min(sorted.length - 1, (sorted.length - 1) * p));
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    const a = sorted[lo];
    const b = sorted[hi];
    if (a === void 0 || b === void 0) return 0;
    if (lo === hi) return a;
    return a + (b - a) * (idx - lo);
  }
  /**
   * @returns {{
   *  sampleCount:number,
   *  avgMs:number,
   *  avgFps:number,
   *  p50Ms:number,
   *  p95Ms:number,
   *  p99Ms:number,
   *  low1Fps:number,
   *  over16_7:number,
   *  over25:number,
   *  over33_3:number,
   *  maxMs:number
   * }|null}
   */
  snapshot() {
    if (!this.count) return null;
    const ordered = this._orderedSamples();
    let sum = 0;
    let maxMs = 0;
    let over16_7 = 0;
    let over25 = 0;
    let over33_3 = 0;
    for (let i = 0; i < ordered.length; i++) {
      const sample = ordered[i] || 0;
      sum += sample;
      if (sample > maxMs) maxMs = sample;
      if (sample > 16.7) over16_7++;
      if (sample > 25) over25++;
      if (sample > 33.3) over33_3++;
    }
    const avgMs = sum / ordered.length;
    const sorted = ordered.slice().sort((a, b) => a - b);
    const slowCount = Math.max(1, Math.ceil(sorted.length * 0.01));
    let slowSum = 0;
    for (let i = sorted.length - slowCount; i < sorted.length; i++) {
      slowSum += sorted[i] || 0;
    }
    const slowAvgMs = slowSum / slowCount;
    return {
      sampleCount: ordered.length,
      avgMs,
      avgFps: avgMs > 0 ? 1e3 / avgMs : 0,
      p50Ms: this._percentile(sorted, 0.5),
      p95Ms: this._percentile(sorted, 0.95),
      p99Ms: this._percentile(sorted, 0.99),
      low1Fps: slowAvgMs > 0 ? 1e3 / slowAvgMs : 0,
      over16_7,
      over25,
      over33_3,
      maxMs
    };
  }
}
function reportBenchmarkResult(result) {
  const stats = result.stats;
  const summary = stats ? {
    sample_count: stats.sampleCount,
    avg_fps: Number(stats.avgFps.toFixed(2)),
    low_1pct_fps: Number(stats.low1Fps.toFixed(2)),
    avg_ms: Number(stats.avgMs.toFixed(2)),
    p50_ms: Number(stats.p50Ms.toFixed(2)),
    p95_ms: Number(stats.p95Ms.toFixed(2)),
    p99_ms: Number(stats.p99Ms.toFixed(2)),
    max_ms: Number(stats.maxMs.toFixed(2)),
    over_16_7ms: stats.over16_7,
    over_25ms: stats.over25,
    over_33_3ms: stats.over33_3
  } : { error: "No frame samples captured" };
  console.groupCollapsed("[Bench] Result");
  console.log("config", {
    bench_seed: result.bench.seed,
    planet_seed: result.planetSeed,
    bench_level: result.bench.level,
    bench_start: result.bench.start,
    bench_warmup_s: result.bench.warmupMs / 1e3,
    bench_duration_s: result.bench.durationMs / 1e3,
    perf_flags: result.perfFlags.join(", ") || "none"
  });
  console.table(summary);
  console.groupEnd();
  if (typeof window !== "undefined") {
    window.__dropshipBenchLast = { ...result, summary };
  }
}
if (typeof window !== "undefined") {
  window.__dropshipPerfConfig = PERF_FLAGS;
  window.__dropshipBenchConfig = BENCH_CONFIG;
}
const DROPSHIP_MODEL = Object.freeze({
  shipRenderHScale: 0.7,
  shipRenderWScale: 0.75,
  shipHullWScale: 0.7,
  bodyLiftN: 0.18,
  skiLiftN: 0,
  cargoWidthScale: 2 / 3,
  cargoHeightScale: 2,
  cargoBottomN: -0.35,
  cargoTopBaseN: 0.18,
  gunStrutHeightN: 0.12,
  gunLiftN: 0.04
});
function getDropshipRenderSize(game) {
  return {
    shipHWorld: DROPSHIP_MODEL.shipRenderHScale * game.SHIP_SCALE,
    shipWWorld: DROPSHIP_MODEL.shipRenderWScale * game.SHIP_SCALE
  };
}
function getDropshipHullSize(game) {
  return {
    shipHWorld: DROPSHIP_MODEL.shipRenderHScale * game.SHIP_SCALE,
    shipWWorld: DROPSHIP_MODEL.shipHullWScale * game.SHIP_SCALE
  };
}
function getDropshipCargoBoundsN() {
  const cargoBottomN = DROPSHIP_MODEL.cargoBottomN;
  const cargoHeightN = (DROPSHIP_MODEL.cargoTopBaseN - cargoBottomN) * DROPSHIP_MODEL.cargoHeightScale;
  const cargoTopN = cargoBottomN + cargoHeightN;
  return { cargoBottomN, cargoHeightN, cargoTopN };
}
function getDropshipGeometryProfileN() {
  const { cargoBottomN, cargoTopN } = getDropshipCargoBoundsN();
  const bodyBottomHalfWRenderN = 0.85 * DROPSHIP_MODEL.cargoWidthScale;
  const bodyTopHalfWRenderN = 0.6 * DROPSHIP_MODEL.cargoWidthScale * 0.8;
  const bodyBottomHalfWConvexN = 0.87 * DROPSHIP_MODEL.cargoWidthScale;
  const bodyTopHalfWConvexN = 0.65 * DROPSHIP_MODEL.cargoWidthScale * 0.8;
  return {
    cargoBottomN,
    cargoTopN,
    bodyBottomHalfWRenderN,
    bodyTopHalfWRenderN,
    bodyBottomHalfWConvexN,
    bodyTopHalfWConvexN,
    cabinOffsetN: 0.75 * DROPSHIP_MODEL.cargoWidthScale,
    cabinHalfWBaseN: 0.28 * DROPSHIP_MODEL.cargoWidthScale,
    cabinHalfWScale: 1.3,
    windowHalfWScale: 0.5,
    windowBaseT: 0.25,
    windowTipT: 0.8,
    skiOffsetRenderN: 0.32,
    skiHalfWRenderN: 0.2,
    skiTopYRenderN: cargoBottomN + 0.05,
    gunLenH: 1.05,
    gunHalfWW: 0.09,
    gunMountBackOffsetLen: 0.25,
    gunStrutHalfW: 0.05,
    gunPivotYInsetN: DROPSHIP_MODEL.gunStrutHeightN + DROPSHIP_MODEL.gunLiftN,
    convexSkiOuterXN: bodyBottomHalfWConvexN + 0.18,
    convexSkiYDropN: cargoBottomN - 0.08
  };
}
function convexHull(points) {
  if (!Array.isArray(points) || points.length <= 3) return Array.isArray(points) ? points.slice() : [];
  const sorted = points.map((p) => (
    /** @type {[number,number]} */
    [Number(p[0]), Number(p[1])]
  )).filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1])).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (sorted.length <= 3) return sorted;
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(
      /** @type {[number, number]} */
      lower[lower.length - 2],
      /** @type {[number, number]} */
      lower[lower.length - 1],
      p
    ) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }
  const upper = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = (
      /** @type {[number, number]} */
      sorted[i]
    );
    while (upper.length >= 2 && cross(
      /** @type {[number, number]} */
      upper[upper.length - 2],
      /** @type {[number, number]} */
      upper[upper.length - 1],
      p
    ) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}
function buildDropshipLocalConvexHullPoints(game) {
  const { shipHWorld, shipWWorld } = getDropshipHullSize(game);
  const { bodyLiftN } = DROPSHIP_MODEL;
  const profile = getDropshipGeometryProfileN();
  const bodyLift = shipHWorld * bodyLiftN;
  const cargoBottom = shipHWorld * profile.cargoBottomN - bodyLift;
  const cargoTop = shipHWorld * profile.cargoTopN - bodyLift;
  const bottomHalfW = shipWWorld * profile.bodyBottomHalfWConvexN;
  const topHalfW = shipWWorld * profile.bodyTopHalfWConvexN;
  const xBody = bottomHalfW;
  const xTop = topHalfW;
  const xSki = shipWWorld * profile.convexSkiOuterXN;
  const yTop = cargoTop + bodyLift;
  const yBody = cargoBottom + bodyLift;
  const ySki = shipHWorld * profile.convexSkiYDropN + bodyLift;
  return convexHull([
    [xTop, yTop],
    [xBody, yBody],
    [xSki, ySki],
    [-xSki, ySki],
    [-xBody, yBody],
    [-xTop, yTop]
  ]);
}
function computeDropshipConvexHullBoundRadius(convexHullPoints) {
  let r2 = 0;
  for (const p of convexHullPoints) {
    const x = p[0] || 0;
    const y = p[1] || 0;
    const d2 = x * x + y * y;
    if (d2 > r2) r2 = d2;
  }
  return Math.sqrt(r2);
}
function buildDropshipWorldConvexHullVertices(localConvexHull, x, y) {
  const camRot = Math.atan2(x, y || 1e-6);
  const shipRot = -camRot;
  const c = Math.cos(shipRot);
  const s = Math.sin(shipRot);
  const out = [];
  for (const p of localConvexHull) {
    const lx = p[0];
    const ly = p[1];
    const wx = c * lx - s * ly;
    const wy = s * lx + c * ly;
    out.push([x + wx, y + wy]);
  }
  return out;
}
function buildDropshipWorldConvexHullSampleSet(localConvexHull, x, y, edgeSamplesPerEdge = 0, maxSampleSpacing = 0) {
  const verts = buildDropshipWorldConvexHullVertices(localConvexHull, x, y);
  if (verts.length < 2) {
    return {
      points: verts,
      edgeIdxByPoint: verts.map(() => 0),
      pointMetaByPoint: verts.map((_, i) => ({ kind: "vertex", edgeIdx: i, vertexIdx: i, t: 0 }))
    };
  }
  const edgeSamples = Math.max(0, edgeSamplesPerEdge | 0);
  const spacingLimit = Number.isFinite(maxSampleSpacing) ? Math.max(0, Number(maxSampleSpacing)) : 0;
  if (edgeSamples <= 0 && !(spacingLimit > 0)) {
    return {
      points: verts,
      edgeIdxByPoint: verts.map((_, i) => i),
      pointMetaByPoint: verts.map((_, i) => ({ kind: "vertex", edgeIdx: i, vertexIdx: i, t: 0 }))
    };
  }
  const points = [];
  const edgeIdxByPoint = [];
  const pointMetaByPoint = [];
  const n = verts.length;
  for (let i = 0; i < n; i++) {
    const a = (
      /** @type {[number, number]} */
      verts[i]
    );
    const b = (
      /** @type {[number, number]} */
      verts[(i + 1) % n]
    );
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const edgeLen = Math.hypot(dx, dy);
    const spacingSamples = spacingLimit > 0 ? Math.max(0, Math.ceil(edgeLen / spacingLimit) - 1) : 0;
    const samplesPerEdge = Math.max(edgeSamples, spacingSamples);
    const segCount = samplesPerEdge + 1;
    for (let s = 0; s < segCount; s++) {
      const t = s / segCount;
      points.push([a[0] + dx * t, a[1] + dy * t]);
      edgeIdxByPoint.push(i);
      pointMetaByPoint.push({
        kind: s === 0 ? "vertex" : "edge",
        edgeIdx: i,
        vertexIdx: i,
        t
      });
    }
  }
  return { points, edgeIdxByPoint, pointMetaByPoint };
}
function pointDistanceToDropshipWorldConvexHull(localConvexHull, px, py, shipX, shipY, fallbackRadius) {
  const verts = buildDropshipWorldConvexHullVertices(localConvexHull, shipX, shipY);
  if (verts.length < 2) {
    const dx = px - shipX;
    const dy = py - shipY;
    return Math.max(0, Math.hypot(dx, dy) - fallbackRadius);
  }
  const distPointToSegment = (qx, qy, ax, ay, bx, by) => {
    const dx = bx - ax;
    const dy = by - ay;
    const denom = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((qx - ax) * dx + (qy - ay) * dy) / denom));
    const cx = ax + dx * t;
    const cy = ay + dy * t;
    return Math.hypot(qx - cx, qy - cy);
  };
  let best = Infinity;
  for (let i = 0; i < verts.length; i++) {
    const a = (
      /** @type {[number, number]} */
      verts[i]
    );
    const b = (
      /** @type {[number, number]} */
      verts[(i + 1) % verts.length]
    );
    const d = distPointToSegment(px, py, a[0], a[1], b[0], b[1]);
    if (d < best) best = d;
  }
  let inside = false;
  for (let i = 0, j = verts.length - 1; i < verts.length; j = i++) {
    const vi = (
      /** @type {[number, number]} */
      verts[i]
    );
    const vj = (
      /** @type {[number, number]} */
      verts[j]
    );
    const xi = vi[0], yi = vi[1];
    const xj = vj[0], yj = vj[1];
    const intersects = yi > py !== yj > py && px < (xj - xi) * (py - yi) / (yj - yi || 1e-6) + xi;
    if (intersects) inside = !inside;
  }
  return inside ? 0 : best;
}
function getDropshipGunPivotLocal(game) {
  const { shipHWorld } = getDropshipRenderSize(game);
  const { bodyLiftN } = DROPSHIP_MODEL;
  const { cargoTopN } = getDropshipCargoBoundsN();
  const profile = getDropshipGeometryProfileN();
  return {
    x: 0,
    y: (cargoTopN + profile.gunPivotYInsetN + bodyLiftN) * shipHWorld
  };
}
function getDropshipWorldRotation(x, y) {
  return -Math.atan2(x, y || 1e-6);
}
function computeDropshipAxes(x, y) {
  const r2 = Math.hypot(x, y) || 1;
  const rx = x / r2;
  const ry = y / r2;
  const tx = -ry;
  const ty = rx;
  return { r: r2, rx, ry, tx, ty };
}
function computeDropshipAcceleration(ship, input2, thrustMax) {
  const { r: r2, rx, ry, tx, ty } = computeDropshipAxes(ship.x, ship.y);
  const stick = input2.stickThrust || { x: 0, y: 0 };
  let ax = 0;
  let ay = 0;
  if (input2.left) {
    ax += tx * thrustMax;
    ay += ty * thrustMax;
  }
  if (input2.right) {
    ax -= tx * thrustMax;
    ay -= ty * thrustMax;
  }
  if (input2.thrust) {
    ax += rx * thrustMax;
    ay += ry * thrustMax;
  }
  if (input2.down) {
    ax -= rx * thrustMax;
    ay -= ry * thrustMax;
  }
  ax += (stick.x * -tx + stick.y * rx) * thrustMax;
  ay += (stick.x * -ty + stick.y * ry) * thrustMax;
  return { ax, ay, r: r2, rx, ry, tx, ty };
}
function computeDropshipInertialDriveAcceleration(ship, input2, driveThrust, reverseFraction, lateralFraction, dt) {
  if (!(driveThrust > 0) || !(dt > 0)) return { ax: 0, ay: 0 };
  const { rx, ry, tx, ty } = computeDropshipAxes(ship.x, ship.y);
  const stick = input2.stickThrust || { x: 0, y: 0 };
  let dx = 0;
  let dy = 0;
  if (input2.left) {
    dx += tx;
    dy += ty;
  }
  if (input2.right) {
    dx -= tx;
    dy -= ty;
  }
  if (input2.thrust) {
    dx += rx;
    dy += ry;
  }
  if (input2.down) {
    dx -= rx;
    dy -= ry;
  }
  dx += stick.x * -tx + stick.y * rx;
  dy += stick.x * -ty + stick.y * ry;
  const desiredLen = Math.hypot(dx, dy);
  if (desiredLen <= 1e-6) return { ax: 0, ay: 0 };
  dx /= desiredLen;
  dy /= desiredLen;
  const lx = -dy;
  const ly = dx;
  const vForward = ship.vx * dx + ship.vy * dy;
  const vLateral = ship.vx * lx + ship.vy * ly;
  let ax = 0;
  let ay = 0;
  const reverseCap = driveThrust * Math.max(0, reverseFraction);
  const reverseSpeed = Math.max(0, -vForward);
  if (reverseCap > 0 && reverseSpeed > 1e-6) {
    const accel = Math.min(reverseSpeed / dt, reverseCap);
    ax += dx * accel;
    ay += dy * accel;
  }
  const lateralCap = driveThrust * Math.max(0, lateralFraction);
  if (lateralCap > 0 && Math.abs(vLateral) > 1e-6) {
    const accel = Math.min(Math.abs(vLateral) / dt, lateralCap);
    const sign = Math.sign(vLateral);
    ax -= lx * sign * accel;
    ay -= ly * sign * accel;
  }
  const accelLen = Math.hypot(ax, ay);
  if (accelLen > driveThrust) {
    const scale = driveThrust / accelLen;
    ax *= scale;
    ay *= scale;
  }
  return { ax, ay };
}
function resolveDropshipFacing(cabinSide, input2, stickDead = 0.15) {
  const stickX = input2.stickThrust && Number.isFinite(input2.stickThrust.x) ? input2.stickThrust.x : 0;
  const faceLeft = !!input2.left || stickX < -stickDead;
  const faceRight = !!input2.right || stickX > stickDead;
  if (faceLeft && !faceRight) return -1;
  if (faceRight && !faceLeft) return 1;
  return cabinSide;
}
function hasDropshipThrustInput(input2, stickDead = 0.12) {
  const stick = input2.stickThrust || { x: 0, y: 0 };
  const stickMagSqr = stick.x * stick.x + stick.y * stick.y;
  return !!(input2.left || input2.right || input2.thrust || input2.down || stickMagSqr > stickDead * stickDead);
}
function wantsDropshipLiftoff(input2) {
  const stick = input2.stickThrust || { x: 0, y: 0 };
  const stickMagSqr = stick.x * stick.x + stick.y * stick.y;
  return !!(input2.left || input2.right || input2.thrust || stickMagSqr > 0);
}
function getDropshipThrusterPowers(input2) {
  const stick = input2.stickThrust || { x: 0, y: 0 };
  const analogLeft = Math.max(0, -stick.x);
  const analogRight = Math.max(0, stick.x);
  const analogUp = Math.max(0, stick.y);
  const analogDown = Math.max(0, -stick.y);
  return {
    up: Math.max(input2.thrust ? 1 : 0, analogUp),
    down: Math.max(input2.down ? 1 : 0, analogDown),
    left: Math.max(input2.left ? 1 : 0, analogLeft),
    right: Math.max(input2.right ? 1 : 0, analogRight)
  };
}
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
    const palette = (
      /** @type {[number, number, number]} */
      palettes[Math.floor(rand() * palettes.length)]
    );
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
function expectDefined$4(value) {
  if (value === void 0 || value === null) {
    throw new Error("Expected value");
  }
  return value;
}
function ringVertexCount(r2) {
  if (r2 <= 0) return 1;
  return Math.max(CFG.N_MIN, Math.floor(2 * Math.PI * r2));
}
function makeNavPaddingRing(radius) {
  if (radius <= 0) return [{ x: 0, y: 0, air: 1 }];
  const n = ringVertexCount(radius);
  const phase = 0.5 / n * Math.PI * 2;
  const out = [];
  for (let k = 0; k < n; k++) {
    const a = k / n * Math.PI * 2 + phase;
    out.push({ x: radius * Math.cos(a), y: radius * Math.sin(a), air: 1 });
  }
  return out;
}
function stitchBand(inner, outer) {
  const tris = [];
  if (!inner.length || !outer.length) return tris;
  const n0 = inner.length;
  const n1 = outer.length;
  const I = inner.concat([expectDefined$4(inner[0])]);
  const O = outer.concat([expectDefined$4(outer[0])]);
  let i = 0;
  let j = 0;
  while (i < n0 || j < n1) {
    if (i >= n0) {
      tris.push([expectDefined$4(I[i]), expectDefined$4(O[j]), expectDefined$4(O[j + 1])]);
      j++;
      continue;
    }
    if (j >= n1) {
      tris.push([expectDefined$4(I[i]), expectDefined$4(O[j]), expectDefined$4(I[i + 1])]);
      i++;
      continue;
    }
    if ((i + 1) / n0 < (j + 1) / n1) {
      tris.push([expectDefined$4(I[i]), expectDefined$4(O[j]), expectDefined$4(I[i + 1])]);
      i++;
    } else {
      tris.push([expectDefined$4(I[i]), expectDefined$4(O[j]), expectDefined$4(O[j + 1])]);
      j++;
    }
  }
  return tris;
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
      const parent = expectDefined$4(items[p]);
      if (parent.f <= item.f) break;
      items[i] = parent;
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
    const root = expectDefined$4(items[0]);
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
      const left = expectDefined$4(items[l]);
      if (r2 < n && expectDefined$4(items[r2]).f < left.f) m = r2;
      if (expectDefined$4(items[i]).f <= expectDefined$4(items[m]).f) break;
      const tmp = expectDefined$4(items[i]);
      items[i] = expectDefined$4(items[m]);
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
   * @param {{rings: Array<Point[]>, bandTris: Array<Array<Array<Point>>>, airValueAtWorld:(x:number,y:number)=>number}} mesh Mesh rings and band triangles.
   * @param {{navPadding?:number}} [opts]
   */
  constructor(mesh, opts = {}) {
    const { rings, bandTris } = mesh;
    const outerMeshRingIndex = Math.max(0, rings.length - 1);
    const outerMeshRing = rings[outerMeshRingIndex] || [];
    const outerMeshRadius = outerMeshRing.length ? Math.max(...outerMeshRing.map((v) => Math.hypot(v.x, v.y))) : outerMeshRingIndex;
    const requestedNavPadding = typeof opts.navPadding === "number" ? Math.max(0, opts.navPadding) : 0;
    const navPaddedRingRadius = requestedNavPadding > 0 ? outerMeshRadius + requestedNavPadding : NaN;
    const hasNavPadding = Number.isFinite(navPaddedRingRadius) && navPaddedRingRadius > outerMeshRadius + 1e-6;
    const nodes = [];
    const neighbors = [];
    const ringIndex = [];
    const nodeOfRef = /* @__PURE__ */ new Map();
    for (let r2 = 0; r2 < rings.length; r2++) {
      const ring = rings[r2] || [];
      ringIndex[r2] = [];
      const ringRefs = expectDefined$4(ringIndex[r2]);
      for (let i = 0; i < ring.length; i++) {
        const v = ring[i];
        if (!v) continue;
        const idx = nodes.length;
        nodes.push({ x: v.x, y: v.y, r: r2, i, navPadded: false });
        neighbors.push([]);
        ringRefs.push(idx);
        nodeOfRef.set(v, idx);
      }
    }
    const navPaddingRing = hasNavPadding ? makeNavPaddingRing(navPaddedRingRadius) : null;
    const navPaddedRingIndex = ringIndex.length;
    if (navPaddingRing && navPaddingRing.length) {
      ringIndex[navPaddedRingIndex] = [];
      const navPaddedRefs = expectDefined$4(ringIndex[navPaddedRingIndex]);
      for (let i = 0; i < navPaddingRing.length; i++) {
        const v = navPaddingRing[i];
        if (!v) continue;
        const idx = nodes.length;
        nodes.push({ x: v.x, y: v.y, r: navPaddedRingIndex, i, navPadded: true });
        neighbors.push([]);
        navPaddedRefs.push(idx);
        nodeOfRef.set(v, idx);
      }
    }
    const graphBandTris = bandTris.slice();
    if (navPaddingRing && navPaddingRing.length && outerMeshRing.length) {
      graphBandTris.push(stitchBand(outerMeshRing, navPaddingRing));
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
      expectDefined$4(neighbors[a]).push({ to: b, cost });
      expectDefined$4(neighbors[b]).push({ to: a, cost });
    }
    function canConnect(a, b) {
      const na = nodes[a];
      const nb = nodes[b];
      if (!na || !nb) return false;
      if (!na.navPadded && !nb.navPadded) return true;
      if (na.navPadded && nb.navPadded) return true;
      return lineOfSightAir(mesh, na.x, na.y, nb.x, nb.y);
    }
    for (let r2 = 0; r2 < rings.length; r2++) {
      const ring = rings[r2] || [];
      const n = ring.length;
      if (n <= 1) continue;
      const ringRefs = ringIndex[r2];
      if (!ringRefs) continue;
      for (let i = 0; i < n; i++) {
        const a = ringRefs[i];
        const b = ringRefs[(i + 1) % n];
        if (a === void 0 || b === void 0) continue;
        addEdge(a, b);
      }
    }
    if (navPaddingRing && navPaddingRing.length) {
      const n = navPaddingRing.length;
      const ringRefs = ringIndex[navPaddedRingIndex];
      if (ringRefs) {
        for (let i = 0; i < n; i++) {
          const a = ringRefs[i];
          const b = ringRefs[(i + 1) % n];
          if (a === void 0 || b === void 0) continue;
          addEdge(a, b);
        }
      }
    }
    for (const tris of graphBandTris) {
      if (!tris) continue;
      for (const tri of tris) {
        const va = tri[0];
        const vb = tri[1];
        const vc = tri[2];
        if (!va || !vb || !vc) continue;
        const ia = nodeOfRef.get(va);
        const ib = nodeOfRef.get(vb);
        const ic = nodeOfRef.get(vc);
        if (ia === void 0 || ib === void 0 || ic === void 0) continue;
        if (canConnect(ia, ib)) addEdge(ia, ib);
        if (canConnect(ib, ic)) addEdge(ib, ic);
        if (canConnect(ic, ia)) addEdge(ic, ia);
      }
    }
    if (ringIndex[0] && ringIndex[0].length === 1 && ringIndex[1]) {
      const center = ringIndex[0][0];
      if (center === void 0) return;
      for (const idx of ringIndex[1]) {
        if (idx === void 0) continue;
        addEdge(center, idx);
      }
    }
    this.nodes = nodes;
    this.neighbors = neighbors;
    this.ringIndex = ringIndex;
    this.nodeOfRef = nodeOfRef;
    this.navPadded = !!(navPaddingRing && navPaddingRing.length);
    this.outerMeshRingIndex = outerMeshRingIndex;
    this.outerMeshRadius = outerMeshRadius;
    this.navPaddedRingIndex = this.navPadded ? navPaddedRingIndex : null;
    this.navPaddedRingRadius = this.navPadded ? navPaddedRingRadius : null;
    this.navPadding = this.navPadded ? requestedNavPadding : 0;
  }
}
function buildPassableMask(mesh, graph, threshold = 0.5) {
  const passable = new Uint8Array(graph.nodes.length);
  for (let i = 0; i < graph.nodes.length; i++) {
    const n = graph.nodes[i];
    if (!n) continue;
    passable[i] = n && n.navPadded ? 1 : mesh.airValueAtWorld(n.x, n.y) > threshold ? 1 : 0;
  }
  return passable;
}
function nearestRadialNode(graph, mesh, x, y) {
  if (graph.navPadded && graph.navPaddedRingIndex !== null) {
    const r2 = Math.hypot(x, y);
    if (r2 > graph.outerMeshRadius) {
      let best2 = -1;
      let bestD2 = Infinity;
      const candidateRings = [graph.outerMeshRingIndex, graph.navPaddedRingIndex];
      for (const ringIdx of candidateRings) {
        const ring = graph.ringIndex[ringIdx] || [];
        for (const idx of ring) {
          const n = graph.nodes[idx];
          if (!n) continue;
          const dx = n.x - x;
          const dy = n.y - y;
          const d = dx * dx + dy * dy;
          if (d < bestD2) {
            bestD2 = d;
            best2 = idx;
          }
        }
      }
      if (best2 >= 0) return best2;
    }
  }
  const ref = mesh.nearestNodeOnRing(x, y);
  if (ref && graph.nodeOfRef.has(ref)) return graph.nodeOfRef.get(ref) ?? -1;
  let best = -1;
  let bestD = 1e9;
  for (let i = 0; i < graph.nodes.length; i++) {
    const n = graph.nodes[i];
    if (!n) continue;
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
    const neighbors = graph.neighbors[node] || [];
    for (const edge of neighbors) {
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
  const gScore = new Array(n).fill(Infinity);
  gScore[start] = 0;
  const cameFrom = new Int32Array(n).fill(-1);
  const heap = new MinHeap();
  const h = (a) => {
    const na = graph.nodes[a];
    const nb = graph.nodes[goal];
    if (!na || !nb) return Infinity;
    return Math.hypot(na.x - nb.x, na.y - nb.y);
  };
  heap.push(start, h(start), 0);
  while (heap.size) {
    const item = heap.pop();
    if (!item) break;
    const { node, g } = item;
    if (node === goal) break;
    if (g > gScore[node]) continue;
    const neighbors = graph.neighbors[node] || [];
    for (const edge of neighbors) {
      if (!passable[edge.to]) {
        continue;
      }
      const tentative = g + edge.cost;
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
    const prev = cameFrom[cur];
    if (prev === void 0) return null;
    cur = prev;
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
function fragmentBaseColor(type) {
  if (type === "hunter") {
    return [0.92, 0.25, 0.2];
  }
  if (type === "ranger") {
    return [0.2, 0.75, 0.95];
  }
  if (type === "crawler") {
    return [0.95, 0.55, 0.2];
  }
  if (type === "dropship") {
    return [0.7, 0.73, 0.77];
  }
  if (type === "pilot") {
    return [0.1, 0.25, 0.98];
  }
  if (type === "engineer") {
    return [0.2, 0.98, 0.2];
  }
  if (type === "miner") {
    return [0.98, 0.85, 0.25];
  }
  if (type === "rock") {
    return [0.58, 0.36, 0.2];
  }
  return [0.5, 0.125, 1];
}
function fragmentBurstProfile(type, destroyedBy) {
  const explosive = destroyedBy === "bomb" || destroyedBy === "explosion" || destroyedBy === "detonate";
  const crawler = type === "crawler";
  if (crawler) {
    const baseCrawler = {
      pieces: 8,
      speedMin: 0.95,
      speedMax: 2.8,
      lifeMin: 0.95,
      lifeMax: 1.45,
      offset: 0.2,
      sizeMin: 0.18,
      sizeMax: 0.31,
      stretchMin: 1.6,
      stretchMax: 2.6,
      spinMin: 2.6,
      spinMax: 8.8,
      inheritVelocity: 0.55,
      dragMul: 1.45
    };
    if (destroyedBy === "bomb") {
      return {
        ...baseCrawler,
        speedMin: baseCrawler.speedMin * 2,
        speedMax: baseCrawler.speedMax * 2,
        dragMul: 1.7
      };
    }
    if (explosive) {
      return {
        ...baseCrawler,
        speedMin: baseCrawler.speedMin * 1.35,
        speedMax: baseCrawler.speedMax * 1.35,
        dragMul: 1.55
      };
    }
    return baseCrawler;
  }
  if (type === "turret") {
    const baseTurret = {
      pieces: 4,
      speedMin: 0.18,
      speedMax: 0.7,
      lifeMin: 0.7,
      lifeMax: 1.05,
      offset: 0.1,
      sizeMin: 0.12,
      sizeMax: 0.2,
      stretchMin: 1.35,
      stretchMax: 2.1,
      spinMin: 1.6,
      spinMax: 5.8,
      inheritVelocity: 0.55,
      dragMul: 1
    };
    if (explosive) {
      return {
        ...baseTurret,
        speedMin: 0.9,
        speedMax: 2.2
      };
    }
    return baseTurret;
  }
  if (type === "dropship") {
    if (explosive) {
      return {
        pieces: 6,
        speedMin: 0.75,
        speedMax: 1.8,
        lifeMin: 1,
        lifeMax: 1.45,
        offset: 0.2,
        sizeMin: 0.22,
        sizeMax: 0.34,
        stretchMin: 1.5,
        stretchMax: 2.35,
        spinMin: 1.9,
        spinMax: 6,
        inheritVelocity: 0.45,
        dragMul: 1.1
      };
    }
    return {
      pieces: 6,
      speedMin: 0.22,
      speedMax: 0.75,
      lifeMin: 0.85,
      lifeMax: 1.25,
      offset: 0.14,
      sizeMin: 0.18,
      sizeMax: 0.28,
      stretchMin: 1.35,
      stretchMax: 2,
      spinMin: 1.4,
      spinMax: 4.6,
      inheritVelocity: 0.6,
      dragMul: 1
    };
  }
  if (type === "miner" || type === "pilot" || type === "engineer") {
    if (explosive) {
      return {
        pieces: 1,
        speedMin: 0.45,
        speedMax: 1.15,
        lifeMin: 0.9,
        lifeMax: 1.2,
        offset: 0.13,
        sizeMin: 0.12,
        sizeMax: 0.18,
        stretchMin: 1.35,
        stretchMax: 1.9,
        spinMin: 1.5,
        spinMax: 4.8,
        inheritVelocity: 0.5,
        dragMul: 1
      };
    }
    return {
      pieces: 1,
      speedMin: 0.12,
      speedMax: 0.45,
      lifeMin: 0.7,
      lifeMax: 1,
      offset: 0.09,
      sizeMin: 0.11,
      sizeMax: 0.16,
      stretchMin: 1.2,
      stretchMax: 1.7,
      spinMin: 1,
      spinMax: 3.6,
      inheritVelocity: 0.65,
      dragMul: 1
    };
  }
  const baseEnemy = {
    pieces: 6,
    speedMin: 0.18,
    speedMax: 0.7,
    lifeMin: 0.7,
    lifeMax: 1.05,
    offset: 0.1,
    sizeMin: 0.12,
    sizeMax: 0.2,
    stretchMin: 1.35,
    stretchMax: 2.1,
    spinMin: 1.6,
    spinMax: 5.8,
    inheritVelocity: 0.55,
    dragMul: 1
  };
  if (explosive) {
    return {
      ...baseEnemy,
      speedMin: 0.9,
      speedMax: 2.2
    };
  }
  return baseEnemy;
}
function spawnFragmentBurst(out, source, ownerType, destroyedBy, overrides = {}) {
  const profile = { ...fragmentBurstProfile(ownerType, destroyedBy), ...overrides };
  const baseVx = (source.vx || 0) * profile.inheritVelocity;
  const baseVy = (source.vy || 0) * profile.inheritVelocity;
  const pieces = Math.max(1, profile.pieces | 0);
  for (let k = 0; k < pieces; k++) {
    const angBase = k / pieces * Math.PI * 2;
    const ang = angBase + (Math.random() * 2 - 1) * (Math.PI / Math.max(3, pieces));
    const radial = profile.offset * (0.55 + Math.random() * 0.9);
    const sp = profile.speedMin + Math.random() * Math.max(0, profile.speedMax - profile.speedMin);
    const life = profile.lifeMin + Math.random() * Math.max(0, profile.lifeMax - profile.lifeMin);
    const spinMag = profile.spinMin + Math.random() * Math.max(0, profile.spinMax - profile.spinMin);
    out.push({
      x: source.x + Math.cos(ang) * radial,
      y: source.y + Math.sin(ang) * radial,
      vx: baseVx + Math.cos(ang) * sp,
      vy: baseVy + Math.sin(ang) * sp,
      a: ang + (Math.random() - 0.5) * 0.8,
      w: (Math.random() < 0.5 ? -1 : 1) * spinMag,
      life,
      maxLife: life,
      ownerType,
      size: profile.sizeMin + Math.random() * Math.max(0, profile.sizeMax - profile.sizeMin),
      stretch: profile.stretchMin + Math.random() * Math.max(0, profile.stretchMax - profile.stretchMin),
      dragMul: profile.dragMul
    });
  }
}
function lerp$1(a, b, t) {
  return a + (b - a) * t;
}
function basisFromExplosion(point, explosionSource, fallbackNx, fallbackNy) {
  let baseX = point.x - explosionSource.x;
  let baseY = point.y - explosionSource.y;
  let baseLen = Math.hypot(baseX, baseY);
  if (baseLen <= 1e-4 && Number.isFinite(fallbackNx) && Number.isFinite(fallbackNy)) {
    baseX = Number(fallbackNx);
    baseY = Number(fallbackNy);
    baseLen = Math.hypot(baseX, baseY);
  }
  if (baseLen <= 1e-4) {
    const a = Math.random() * Math.PI * 2;
    baseX = Math.cos(a);
    baseY = Math.sin(a);
    baseLen = 1;
  }
  const dirX = baseX / baseLen;
  const dirY = baseY / baseLen;
  return { dirX, dirY, tanX: -dirY, tanY: dirX };
}
function spawnTerrainHexFragments(out, nodes, explosionSource, palette) {
  if (!out || !nodes || !nodes.length || !explosionSource || !palette) return;
  const rockDark = palette.rockDark || [0.58, 0.36, 0.2];
  const rockLight = palette.rockLight || rockDark;
  for (const node of nodes) {
    if (!node) continue;
    const { dirX, dirY, tanX, tanY } = basisFromExplosion(node, explosionSource, node.nx, node.ny);
    const ringRadius = 0.3;
    for (let i = 0; i < 7; i++) {
      const ringIndex = i - 1;
      const localAng = ringIndex >= 0 ? ringIndex / 6 * Math.PI * 2 : 0;
      const localR = ringIndex >= 0 ? ringRadius : 0;
      const localJitter = ringIndex >= 0 ? (Math.random() * 2 - 1) * 0.02 : 0;
      const ringCos = Math.cos(localAng);
      const ringSin = Math.sin(localAng);
      const localX = dirX * (ringCos * localR + localJitter) + tanX * (ringSin * localR);
      const localY = dirY * (ringCos * localR + localJitter) + tanY * (ringSin * localR);
      let velX = node.x + localX - explosionSource.x;
      let velY = node.y + localY - explosionSource.y;
      let velLen = Math.hypot(velX, velY);
      if (velLen <= 1e-4) {
        velX = dirX;
        velY = dirY;
        velLen = 1;
      }
      velX /= velLen;
      velY /= velLen;
      const angleNoise = (Math.random() * 2 - 1) * 0.42;
      const ca = Math.cos(angleNoise);
      const sa = Math.sin(angleNoise);
      const ux = velX * ca - velY * sa;
      const uy = velX * sa + velY * ca;
      const speed = 0.24 + Math.random() * 0.62;
      const life = 1.2 + Math.random() * 0.75;
      const shadeT = 0.35 + Math.random() * 0.3;
      out.push({
        x: node.x + localX,
        y: node.y + localY,
        vx: ux * speed,
        vy: uy * speed,
        a: Math.random() * Math.PI * 2,
        w: (Math.random() - 0.5) * 4.8,
        life,
        maxLife: life,
        ownerType: "rock",
        size: ringIndex < 0 ? 0.185 + Math.random() * 0.025 : 0.165 + Math.random() * 0.025,
        dragMul: 1.1,
        alpha: 0.96,
        cr: lerp$1(rockDark[0], rockLight[0], shadeT),
        cg: lerp$1(rockDark[1], rockLight[1], shadeT),
        cb: lerp$1(rockDark[2], rockLight[2], shadeT),
        sides: 6
      });
    }
  }
}
function spawnTerrainPropFragments(out, props, explosionSource, palette) {
  if (!out || !props || !props.length || !explosionSource || !palette) return;
  const rockDark = palette.rockDark || [0.58, 0.36, 0.2];
  const rockLight = palette.rockLight || rockDark;
  for (const prop of props) {
    if (!prop) continue;
    const scale = Math.max(0.2, prop.scale || 1);
    const { dirX, dirY, tanX, tanY } = basisFromExplosion(prop, explosionSource, prop.nx, prop.ny);
    if (prop.type === "boulder") {
      const speed = 0.2 + Math.random() * 0.45;
      const life = 1.3 + Math.random() * 0.7;
      const shadeT = 0.4 + Math.random() * 0.2;
      out.push({
        x: prop.x + dirX * 0.06 * scale,
        y: prop.y + dirY * 0.06 * scale,
        vx: dirX * speed,
        vy: dirY * speed,
        a: (prop.rot || 0) + (Math.random() - 0.5) * 0.4,
        w: (Math.random() - 0.5) * 3.6,
        life,
        maxLife: life,
        ownerType: "rock",
        size: 0.24 * scale,
        dragMul: 1.05,
        alpha: 0.96,
        cr: lerp$1(rockDark[0], rockLight[0], shadeT),
        cg: lerp$1(rockDark[1], rockLight[1], shadeT),
        cb: lerp$1(rockDark[2], rockLight[2], shadeT),
        sides: 6
      });
      continue;
    }
    if (prop.type !== "tree") continue;
    const pieces = [
      { localX: -0.08 * scale, localY: 0.14 * scale, size: 0.13 * scale, stretch: 1.7, spin: 4.2, color: [0.45, 0.3, 0.18] },
      { localX: 0.08 * scale, localY: 0.3 * scale, size: 0.12 * scale, stretch: 1.8, spin: 4.9, color: [0.45, 0.3, 0.18] },
      { localX: -0.18 * scale, localY: 0.62 * scale, size: 0.18 * scale, stretch: 1.65, spin: 5.4, color: [0.22, 0.64, 0.24] },
      { localX: 0.18 * scale, localY: 0.66 * scale, size: 0.18 * scale, stretch: 1.65, spin: 5.1, color: [0.2, 0.58, 0.22] },
      { localX: -0.04 * scale, localY: 0.92 * scale, size: 0.17 * scale, stretch: 1.55, spin: 4.8, color: [0.18, 0.56, 0.2] },
      { localX: -0.22 * scale, localY: 0.82 * scale, size: 0.16 * scale, stretch: 1.55, spin: 5.6, color: [0.2, 0.6, 0.22] },
      { localX: 0.22 * scale, localY: 0.84 * scale, size: 0.16 * scale, stretch: 1.55, spin: 5.2, color: [0.18, 0.54, 0.2] }
    ];
    for (const piece of pieces) {
      const worldX = prop.x + tanX * piece.localX + dirX * piece.localY;
      const worldY = prop.y + tanY * piece.localX + dirY * piece.localY;
      let velX = worldX - explosionSource.x;
      let velY = worldY - explosionSource.y;
      let velLen = Math.hypot(velX, velY);
      if (velLen <= 1e-4) {
        velX = dirX;
        velY = dirY;
        velLen = 1;
      }
      velX /= velLen;
      velY /= velLen;
      const angleNoise = (Math.random() * 2 - 1) * 0.36;
      const ca = Math.cos(angleNoise);
      const sa = Math.sin(angleNoise);
      const ux = velX * ca - velY * sa;
      const uy = velX * sa + velY * ca;
      const speed = 0.24 + Math.random() * 0.56;
      const life = 1 + Math.random() * 0.55;
      out.push({
        x: worldX,
        y: worldY,
        vx: ux * speed,
        vy: uy * speed,
        a: Math.atan2(uy, ux) + (Math.random() - 0.5) * 0.7,
        w: (Math.random() < 0.5 ? -1 : 1) * piece.spin,
        life,
        maxLife: life,
        ownerType: "rock",
        size: piece.size,
        stretch: piece.stretch,
        dragMul: 1.08,
        alpha: 0.96,
        cr: piece.color[0],
        cg: piece.color[1],
        cb: piece.color[2]
      });
    }
  }
}
function updateFragmentDebris(debris, opts) {
  if (!debris || !debris.length) return;
  const gravityAt = opts.gravityAt;
  const dragCoeff = Math.max(0, opts.dragCoeff || 0);
  const dt = Math.max(0, opts.dt || 0);
  const terrainCrossing = opts.terrainCrossing || null;
  const terrainCollisionEnabled = !!(opts.terrainCollisionEnabled && terrainCrossing);
  const restitution = Number.isFinite(opts.restitution) ? Math.max(0, Math.min(1, Number(opts.restitution))) : 0.58;
  for (let i = debris.length - 1; i >= 0; i--) {
    const d = debris[i];
    if (!d) continue;
    const prevX = d.x;
    const prevY = d.y;
    const g = gravityAt(d.x, d.y);
    const dragMul = Number.isFinite(d.dragMul) ? Math.max(0, Number(d.dragMul)) : 1;
    d.vx += g.x * dt;
    d.vy += g.y * dt;
    d.vx *= Math.max(0, 1 - dragCoeff * dragMul * dt);
    d.vy *= Math.max(0, 1 - dragCoeff * dragMul * dt);
    d.x += d.vx * dt;
    d.y += d.vy * dt;
    if (terrainCollisionEnabled && terrainCrossing) {
      const crossing = terrainCrossing({ x: prevX, y: prevY }, { x: d.x, y: d.y });
      if (crossing) {
        const nx = crossing.nx;
        const ny = crossing.ny;
        const vNormal = nx * d.vx + ny * d.vy;
        if (vNormal < 0) {
          const tangentDamp = 0.92;
          const tx = -ny;
          const ty = nx;
          const vTangent = d.vx * tx + d.vy * ty;
          const nextVNormal = -vNormal * restitution;
          d.vx = tx * (vTangent * tangentDamp) + nx * nextVNormal;
          d.vy = ty * (vTangent * tangentDamp) + ny * nextVNormal;
        }
        d.x = crossing.x + nx * 0.03 + d.vx * Math.min(dt, 0.04) * 0.5;
        d.y = crossing.y + ny * 0.03 + d.vy * Math.min(dt, 0.04) * 0.5;
      }
    }
    d.a += d.w * dt;
    d.life -= dt;
    if (d.life <= 0) debris.splice(i, 1);
  }
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
        const rowMask = (
          /** @type {string} */
          map[row]
        );
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
          vertAirSum[idx] = (vertAirSum[idx] || 0) + air;
          vertAirCount[idx] = (vertAirCount[idx] || 0) + 1;
          triIdx.push(idx);
        }
        tris.push([
          /** @type {number} */
          triIdx[0],
          /** @type {number} */
          triIdx[1],
          /** @type {number} */
          triIdx[2]
        ]);
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
      const p = (
        /** @type {MothershipPoint} */
        points[i]
      );
      p.x -= cx;
      p.y -= cy;
      const count = (
        /** @type {number} */
        vertAirCount[i] || 1
      );
      p.air = /** @type {number} */
      (vertAirSum[i] || 0) / count;
      const r2 = p.x * p.x + p.y * p.y;
      if (r2 > maxR2) maxR2 = r2;
    }
    const orbitHeight = typeof cfg.MOTHERSHIP_ORBIT_HEIGHT === "number" ? cfg.MOTHERSHIP_ORBIT_HEIGHT : 15;
    const orbitRadius = cfg.RMAX + orbitHeight;
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
  const triAir = mothership.triAir || [];
  let hit = false;
  let maxAir = -Infinity;
  for (let i = 0; i < tris.length; i++) {
    const tri = (
      /** @type {[number, number, number]} */
      tris[i]
    );
    const a = (
      /** @type {MothershipPoint} */
      points[tri[0]]
    );
    const b = (
      /** @type {MothershipPoint} */
      points[tri[1]]
    );
    const c = (
      /** @type {MothershipPoint} */
      points[tri[2]]
    );
    if (!pointInTri(lx, ly, a.x, a.y, b.x, b.y, c.x, c.y)) continue;
    const air = Number.isFinite(triAir[i]) ? (
      /** @type {number} */
      triAir[i]
    ) : 1;
    if (!hit || air > maxAir) {
      maxAir = air;
      hit = true;
    }
  }
  return hit ? maxAir : null;
}
function mothershipAirAtWorld(mothership, x, y) {
  const dx = x - mothership.x;
  const dy = y - mothership.y;
  if (dx * dx + dy * dy > mothership.bounds * mothership.bounds) return null;
  const c = Math.cos(-mothership.angle);
  const s = Math.sin(-mothership.angle);
  const lx = c * dx - s * dy;
  const ly = s * dx + c * dy;
  return mothershipAirAtLocal(mothership, lx, ly);
}
function mothershipCollisionInfo(mothership, x, y) {
  const dx = x - mothership.x;
  const dy = y - mothership.y;
  if (dx * dx + dy * dy > mothership.bounds * mothership.bounds) return null;
  const c = Math.cos(-mothership.angle);
  const s = Math.sin(-mothership.angle);
  const lx = c * dx - s * dy;
  const ly = s * dx + c * dy;
  const baseEps = Math.max(0.02, mothership.gridCell || mothership.spacing * 0.4);
  let nx = 0;
  let ny = 0;
  let nlen = 0;
  const gradScales = [1, 1.6, 2.4];
  for (const sEps of gradScales) {
    const eps = baseEps * sEps;
    nx = mothershipAirAtLocalGrid(mothership, lx + eps, ly) - mothershipAirAtLocalGrid(mothership, lx - eps, ly);
    ny = mothershipAirAtLocalGrid(mothership, lx, ly + eps) - mothershipAirAtLocalGrid(mothership, lx, ly - eps);
    nlen = Math.hypot(nx, ny);
    if (nlen >= 1e-4) break;
  }
  if (nlen < 1e-4) {
    return null;
  }
  nx /= nlen;
  ny /= nlen;
  const probeOut = Math.max(0.03, baseEps * 0.9);
  const probeIn = Math.max(0.02, baseEps * 0.7);
  const scoreDir = (sx, sy) => {
    const front = mothershipAirAtLocalGrid(mothership, lx + sx * probeOut, ly + sy * probeOut);
    const back = mothershipAirAtLocalGrid(mothership, lx - sx * probeIn, ly - sy * probeIn);
    const boundaryOk = front > 0.5 && back <= 0.52 ? 1 : 0;
    return boundaryOk * 4 + (front - back) * 2;
  };
  const scorePos = scoreDir(nx, ny);
  const scoreNeg = scoreDir(-nx, -ny);
  if (scoreNeg > scorePos) {
    nx = -nx;
    ny = -ny;
  }
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
  const v00 = (
    /** @type {number} */
    grid[idx]
  );
  const v10 = (
    /** @type {number} */
    grid[idx + 1]
  );
  const v01 = (
    /** @type {number} */
    grid[idx + size]
  );
  const v11 = (
    /** @type {number} */
    grid[idx + size + 1]
  );
  const vx0 = v00 + (v10 - v00) * tx;
  const vx1 = v01 + (v11 - v01) * tx;
  return vx0 + (vx1 - vx0) * ty;
}
function lerpAngleShortest$1(a, b, t) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}
function worldToMothershipLocal(pose, x, y) {
  const dx = x - pose.x;
  const dy = y - pose.y;
  const c = Math.cos(-pose.angle);
  const s = Math.sin(-pose.angle);
  return {
    x: c * dx - s * dy,
    y: s * dx + c * dy
  };
}
function mothershipLocalToWorld(pose, x, y) {
  const c = Math.cos(pose.angle);
  const s = Math.sin(pose.angle);
  return {
    x: pose.x + c * x - s * y,
    y: pose.y + s * x + c * y
  };
}
function mothershipLocalDirToWorld(pose, nx, ny) {
  const c = Math.cos(pose.angle);
  const s = Math.sin(pose.angle);
  return {
    x: c * nx - s * ny,
    y: s * nx + c * ny
  };
}
function pointInTriLocal(px, py, ax, ay, bx, by, cx, cy) {
  const v0x = cx - ax;
  const v0y = cy - ay;
  const v1x = bx - ax;
  const v1y = by - ay;
  const v2x = px - ax;
  const v2y = py - ay;
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
function mothershipAirAtLocalExact(mothership, lx, ly) {
  const points = mothership.points;
  const tris = mothership.tris;
  const triAir = mothership.triAir || [];
  let hit = false;
  let maxAir = -Infinity;
  for (let i = 0; i < tris.length; i++) {
    const tri = (
      /** @type {TriIndex} */
      tris[i]
    );
    const a = (
      /** @type {{x:number,y:number,air?:number}} */
      points[tri[0]]
    );
    const b = (
      /** @type {{x:number,y:number,air?:number}} */
      points[tri[1]]
    );
    const c = (
      /** @type {{x:number,y:number,air?:number}} */
      points[tri[2]]
    );
    if (!pointInTriLocal(lx, ly, a.x, a.y, b.x, b.y, c.x, c.y)) continue;
    const air = (
      /** @type {number} */
      triAir[i]
    );
    if (!hit || air > maxAir) {
      maxAir = air;
      hit = true;
    }
  }
  return hit ? maxAir : null;
}
function closestPointOnSegment$1(ax, ay, bx, by, px, py) {
  const ex = bx - ax;
  const ey = by - ay;
  const e2 = ex * ex + ey * ey;
  if (e2 < 1e-10) {
    const dx2 = px - ax;
    const dy2 = py - ay;
    return { x: ax, y: ay, u: 0, d2: dx2 * dx2 + dy2 * dy2 };
  }
  let u = ((px - ax) * ex + (py - ay) * ey) / e2;
  u = Math.max(0, Math.min(1, u));
  const x = ax + ex * u;
  const y = ay + ey * u;
  const dx = px - x;
  const dy = py - y;
  return { x, y, u, d2: dx * dx + dy * dy };
}
function projectPolyAxis$1(poly, nx, ny) {
  let min = Infinity;
  let max = -Infinity;
  for (const p of poly) {
    const d = p[0] * nx + p[1] * ny;
    if (d < min) min = d;
    if (d > max) max = d;
  }
  return { min, max };
}
function convexPolysOverlap$1(a, b) {
  const testAxes = (poly0, poly1) => {
    for (let i = 0; i < poly0.length; i++) {
      const p0 = (
        /** @type {[number, number]} */
        poly0[i]
      );
      const p1 = (
        /** @type {[number, number]} */
        poly0[(i + 1) % poly0.length]
      );
      const ex = p1[0] - p0[0];
      const ey = p1[1] - p0[1];
      const el = Math.hypot(ex, ey);
      if (el < 1e-8) continue;
      const nx = -ey / el;
      const ny = ex / el;
      const pa = projectPolyAxis$1(poly0, nx, ny);
      const pb = projectPolyAxis$1(poly1, nx, ny);
      if (pa.max < pb.min || pb.max < pa.min) {
        return false;
      }
    }
    return true;
  };
  return testAxes(a, b) && testAxes(b, a);
}
function extractHullBoundaryContacts$1(shipConvexHullWorldVertices, x, y, airAt, eps = 0.03) {
  const hull = shipConvexHullWorldVertices(x, y);
  if (hull.length < 2) return [];
  const e = Math.max(1e-3, eps);
  const out = [];
  const addContact = (cx, cy) => {
    if (!Number.isFinite(cx) || !Number.isFinite(cy)) return;
    const av = airAt(cx, cy);
    let nx = airAt(cx + e, cy) - airAt(cx - e, cy);
    let ny = airAt(cx, cy + e) - airAt(cx, cy - e);
    let nLen = Math.hypot(nx, ny);
    if (nLen < 1e-6) {
      nx = cx - x;
      ny = cy - y;
      nLen = Math.hypot(nx, ny);
    }
    if (nLen < 1e-6) return;
    nx /= nLen;
    ny /= nLen;
    const af = airAt(cx + nx * e * 1.6, cy + ny * e * 1.6);
    const ab = airAt(cx - nx * e * 1.2, cy - ny * e * 1.2);
    if (ab > af) {
      nx = -nx;
      ny = -ny;
    }
    for (const c of out) {
      if (Math.hypot(c.x - cx, c.y - cy) <= 0.015) {
        c.nx += nx;
        c.ny += ny;
        const nn = Math.hypot(c.nx, c.ny) || 1;
        c.nx /= nn;
        c.ny /= nn;
        c.av = Math.min(c.av, av);
        return;
      }
    }
    out.push({ x: cx, y: cy, nx, ny, av });
  };
  const n = hull.length;
  for (let i = 0; i < n; i++) {
    const a = hull[i];
    const b = hull[(i + 1) % n];
    if (!a || !b) continue;
    const av0 = airAt(a[0], a[1]);
    const av1 = airAt(b[0], b[1]);
    const in0 = av0 <= 0.5;
    const in1 = av1 <= 0.5;
    if (in0) addContact(a[0], a[1]);
    if (in1) addContact(b[0], b[1]);
    if (in0 === in1) continue;
    let lo = 0;
    let hi = 1;
    for (let k = 0; k < 14; k++) {
      const mid = (lo + hi) * 0.5;
      const mx = a[0] + (b[0] - a[0]) * mid;
      const my = a[1] + (b[1] - a[1]) * mid;
      const avm = airAt(mx, my);
      const inm = avm <= 0.5;
      if (inm === in0) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
    const t = (lo + hi) * 0.5;
    const cx = a[0] + (b[0] - a[0]) * t;
    const cy = a[1] + (b[1] - a[1]) * t;
    addContact(cx, cy);
  }
  return out;
}
function findMothershipCollisionExactAtPose(ctx, x, y, mothershipPose) {
  const m = mothershipPose;
  if (!m) return null;
  const hull = ctx.shipConvexHullWorldVertices(x, y);
  if (hull.length < 3) return null;
  const shipR = ctx.shipRadius();
  const broadR = (Number.isFinite(m.bounds) ? m.bounds : 0) + shipR + 0.25;
  const dxm = x - m.x;
  const dym = y - m.y;
  if (dxm * dxm + dym * dym > broadR * broadR) return null;
  let hxMin = Infinity;
  let hyMin = Infinity;
  let hxMax = -Infinity;
  let hyMax = -Infinity;
  for (const p of hull) {
    hxMin = Math.min(hxMin, p[0]);
    hyMin = Math.min(hyMin, p[1]);
    hxMax = Math.max(hxMax, p[0]);
    hyMax = Math.max(hyMax, p[1]);
  }
  const points = m.points || [];
  const tris = m.tris || [];
  const triAir = m.triAir || [];
  const c = Math.cos(m.angle);
  const s = Math.sin(m.angle);
  let bestD2 = Infinity;
  let best = null;
  for (let i = 0; i < tris.length; i++) {
    const air = (
      /** @type {number} */
      triAir[i]
    );
    if (air > 0.5) continue;
    const tri = (
      /** @type {TriIndex} */
      tris[i]
    );
    const a = (
      /** @type {{x:number,y:number,air?:number}} */
      points[tri[0]]
    );
    const b = (
      /** @type {{x:number,y:number,air?:number}} */
      points[tri[1]]
    );
    const cpt = (
      /** @type {{x:number,y:number,air?:number}} */
      points[tri[2]]
    );
    const ax = m.x + c * a.x - s * a.y;
    const ay = m.y + s * a.x + c * a.y;
    const bx = m.x + c * b.x - s * b.y;
    const by = m.y + s * b.x + c * b.y;
    const cx = m.x + c * cpt.x - s * cpt.y;
    const cy = m.y + s * cpt.x + c * cpt.y;
    const txMin = Math.min(ax, bx, cx);
    const tyMin = Math.min(ay, by, cy);
    const txMax = Math.max(ax, bx, cx);
    const tyMax = Math.max(ay, by, cy);
    if (txMax < hxMin || txMin > hxMax || tyMax < hyMin || tyMin > hyMax) continue;
    const triPoly = [[ax, ay], [bx, by], [cx, cy]];
    if (!convexPolysOverlap$1(hull, triPoly)) continue;
    for (let e = 0; e < 3; e++) {
      const p0 = (
        /** @type {[number, number]} */
        triPoly[e]
      );
      const p1 = (
        /** @type {[number, number]} */
        triPoly[(e + 1) % 3]
      );
      const cp = closestPointOnSegment$1(p0[0], p0[1], p1[0], p1[1], x, y);
      if (cp.d2 < bestD2) {
        bestD2 = cp.d2;
        best = { x: cp.x, y: cp.y };
      }
    }
  }
  if (!best) return null;
  const contacts = extractHullBoundaryContacts$1(
    ctx.shipConvexHullWorldVertices,
    x,
    y,
    (sx, sy) => {
      const lp = worldToMothershipLocal(m, sx, sy);
      const v = mothershipAirAtLocalExact(m, lp.x, lp.y);
      return v === null ? 1 : v;
    },
    Math.max(0.01, ctx.collisionEps * 0.2)
  );
  if (contacts.length) {
    best.contacts = contacts;
  }
  return best;
}
function getMothershipBoundaryEdges(mothership) {
  if (Array.isArray(mothership._collisionBoundaryEdgesExact)) {
    return mothership._collisionBoundaryEdgesExact;
  }
  const points = mothership.points;
  const tris = mothership.tris;
  const triAir = mothership.triAir || [];
  const edgeMap = /* @__PURE__ */ new Map();
  for (let ti = 0; ti < tris.length; ti++) {
    const tri = (
      /** @type {TriIndex} */
      tris[ti]
    );
    const solid = (
      /** @type {number} */
      triAir[ti] <= 0.5
    );
    for (let e = 0; e < 3; e++) {
      const i0 = (
        /** @type {number} */
        tri[e]
      );
      const i1 = (
        /** @type {number} */
        tri[(e + 1) % 3]
      );
      const ik = (
        /** @type {number} */
        tri[(e + 2) % 3]
      );
      const i = Math.min(i0, i1);
      const j = Math.max(i0, i1);
      const key = `${i},${j}`;
      let rec = edgeMap.get(key);
      if (!rec) {
        rec = {
          i,
          j,
          solidCount: 0,
          airCount: 0,
          solidThird: -1,
          solidTriIdx: -1,
          airTriIdx: -1
        };
        edgeMap.set(key, rec);
      }
      if (solid) {
        rec.solidCount += 1;
        if (rec.solidThird < 0) rec.solidThird = ik;
        if (rec.solidTriIdx < 0) rec.solidTriIdx = ti;
      } else if (rec.airTriIdx < 0) {
        rec.airCount += 1;
        rec.airTriIdx = ti;
      } else {
        rec.airCount += 1;
      }
    }
  }
  const edges = [];
  for (const rec of edgeMap.values()) {
    if (rec.solidCount <= 0) continue;
    if (rec.solidCount >= 2 && rec.airCount === 0) continue;
    const a = (
      /** @type {{x:number,y:number,air?:number}} */
      points[rec.i]
    );
    const b = (
      /** @type {{x:number,y:number,air?:number}} */
      points[rec.j]
    );
    const ex = b.x - a.x;
    const ey = b.y - a.y;
    const len = Math.hypot(ex, ey);
    if (len < 1e-8) continue;
    let nx = ey / len;
    let ny = -ex / len;
    const mx = (a.x + b.x) * 0.5;
    const my = (a.y + b.y) * 0.5;
    if (rec.solidCount === 1 && rec.solidThird >= 0) {
      const c = (
        /** @type {{x:number,y:number,air?:number}} */
        points[rec.solidThird]
      );
      const toSolidX = c.x - mx;
      const toSolidY = c.y - my;
      if (toSolidX * nx + toSolidY * ny > 0) {
        nx = -nx;
        ny = -ny;
      }
    } else {
      const eps = Math.max(0.01, (mothership.spacing || 0.4) * 0.18);
      const av1Raw = mothershipAirAtLocalExact(mothership, mx + nx * eps, my + ny * eps);
      const av2Raw = mothershipAirAtLocalExact(mothership, mx - nx * eps, my - ny * eps);
      const av1 = av1Raw === null ? 1 : av1Raw;
      const av2 = av2Raw === null ? 1 : av2Raw;
      if (av2 > av1 + 1e-6) {
        nx = -nx;
        ny = -ny;
      }
    }
    edges.push({
      ax: a.x,
      ay: a.y,
      bx: b.x,
      by: b.y,
      nx,
      ny,
      i: rec.i,
      j: rec.j,
      solidTriIdx: rec.solidTriIdx,
      airTriIdx: rec.airTriIdx
    });
  }
  mothership._collisionBoundaryEdgesExact = edges;
  return edges;
}
function aabbOverlap(a, b) {
  return !(a.maxX < b.minX || a.minX > b.maxX || a.maxY < b.minY || a.minY > b.maxY);
}
function segmentAabb(a, b) {
  return {
    minX: Math.min(a.x, b.x),
    minY: Math.min(a.y, b.y),
    maxX: Math.max(a.x, b.x),
    maxY: Math.max(a.y, b.y)
  };
}
function mergeAabb(a, b) {
  return {
    minX: Math.min(a.minX, b.minX),
    minY: Math.min(a.minY, b.minY),
    maxX: Math.max(a.maxX, b.maxX),
    maxY: Math.max(a.maxY, b.maxY)
  };
}
function expandAabb(aabb, r2) {
  return {
    minX: aabb.minX - r2,
    minY: aabb.minY - r2,
    maxX: aabb.maxX + r2,
    maxY: aabb.maxY + r2
  };
}
function signedArea2(verts) {
  let s = 0;
  for (let i = 0; i < verts.length; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % verts.length];
    if (!a || !b) continue;
    s += a.x * b.y - a.y * b.x;
  }
  return s;
}
function hullAabb(verts) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of verts) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY };
}
function transformHull(localHull, pos, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const verts = localHull.map(([lx, ly]) => ({
    x: pos.x + c * lx - s * ly,
    y: pos.y + s * lx + c * ly
  }));
  const edges = [];
  for (let i = 0; i < verts.length; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % verts.length];
    if (!a || !b) continue;
    const ex = b.x - a.x;
    const ey = b.y - a.y;
    const len = Math.hypot(ex, ey) || 1;
    edges.push({
      a,
      b,
      normal: { x: -ey / len, y: ex / len }
    });
  }
  if (signedArea2(verts) > 0) {
    for (const edge of edges) {
      edge.normal.x = -edge.normal.x;
      edge.normal.y = -edge.normal.y;
    }
  }
  return { verts, edges, pos, angle };
}
function sweptHullAabb(localHull, startPos, endPos, startAngle, endAngle) {
  const startHull = transformHull(localHull, startPos, startAngle);
  const endHull = transformHull(localHull, endPos, endAngle);
  return expandAabb(mergeAabb(hullAabb(startHull.verts), hullAabb(endHull.verts)), 0.05);
}
function getMothershipCollisionFeatures(mothership) {
  if (mothership._triangleCollisionFeatures) {
    return mothership._triangleCollisionFeatures;
  }
  const pad = Math.max(0.03, (mothership.spacing || 0.4) * 0.25);
  const edges = getMothershipBoundaryEdges(mothership).map((edge, id) => ({
    id,
    a: { x: edge.ax, y: edge.ay },
    b: { x: edge.bx, y: edge.by },
    normal: { x: edge.nx, y: edge.ny },
    aabb: expandAabb(segmentAabb({ x: edge.ax, y: edge.ay }, { x: edge.bx, y: edge.by }), pad),
    i: edge.i,
    j: edge.j
  }));
  const cornerMap = /* @__PURE__ */ new Map();
  for (const edge of edges) {
    const endpoints = [
      { vertexIdx: edge.i, point: edge.a },
      { vertexIdx: edge.j, point: edge.b }
    ];
    for (const endpoint of endpoints) {
      let corner = cornerMap.get(endpoint.vertexIdx);
      if (!corner) {
        corner = {
          id: cornerMap.size,
          p: { x: endpoint.point.x, y: endpoint.point.y },
          edgeIds: []
        };
        cornerMap.set(endpoint.vertexIdx, corner);
      }
      corner.edgeIds.push(edge.id);
    }
  }
  const corners = Array.from(cornerMap.values(), (corner) => ({
    ...corner,
    aabb: {
      minX: corner.p.x - pad,
      minY: corner.p.y - pad,
      maxX: corner.p.x + pad,
      maxY: corner.p.y + pad
    }
  }));
  const out = { edges, corners };
  mothership._triangleCollisionFeatures = out;
  return out;
}
function gatherCandidateFeatures(localHull, startPos, endPos, startAngle, endAngle, mothership) {
  const sweptAabb = sweptHullAabb(localHull, startPos, endPos, startAngle, endAngle);
  const features = getMothershipCollisionFeatures(mothership);
  return {
    edges: features.edges.filter((edge) => aabbOverlap(edge.aabb, sweptAabb)),
    corners: features.corners.filter((corner) => aabbOverlap(corner.aabb, sweptAabb))
  };
}
function pointEdgeToi(p0, v, edge, dt) {
  const denom = edge.normal.x * v.x + edge.normal.y * v.y;
  if (denom >= -1e-8) return null;
  const t = ((edge.a.x - p0.x) * edge.normal.x + (edge.a.y - p0.y) * edge.normal.y) / denom;
  if (t < -1e-8 || t > dt + 1e-8) return null;
  const hitX = p0.x + v.x * t;
  const hitY = p0.y + v.y * t;
  const ex = edge.b.x - edge.a.x;
  const ey = edge.b.y - edge.a.y;
  const e2 = ex * ex + ey * ey;
  const u = ((hitX - edge.a.x) * ex + (hitY - edge.a.y) * ey) / Math.max(e2, 1e-8);
  if (u < -1e-8 || u > 1 + 1e-8) return null;
  return {
    type: "vertex-edge",
    time: Math.max(0, Math.min(dt, t)),
    point: { x: hitX, y: hitY },
    normal: edge.normal,
    u
  };
}
function wallCornerPlayerEdgeToi(corner, edge, edgeVel, dt) {
  const denom = edge.normal.x * edgeVel.x + edge.normal.y * edgeVel.y;
  if (denom <= 1e-8) return null;
  const t = ((corner.p.x - edge.a.x) * edge.normal.x + (corner.p.y - edge.a.y) * edge.normal.y) / denom;
  if (t < -1e-8 || t > dt + 1e-8) return null;
  const atX = edge.a.x + edgeVel.x * t;
  const atY = edge.a.y + edgeVel.y * t;
  const btX = edge.b.x + edgeVel.x * t;
  const btY = edge.b.y + edgeVel.y * t;
  const ex = btX - atX;
  const ey = btY - atY;
  const e2 = ex * ex + ey * ey;
  const u = ((corner.p.x - atX) * ex + (corner.p.y - atY) * ey) / Math.max(e2, 1e-8);
  if (u < -1e-8 || u > 1 + 1e-8) return null;
  return {
    type: "edge-corner",
    time: Math.max(0, Math.min(dt, t)),
    point: { x: corner.p.x, y: corner.p.y },
    normal: edge.normal,
    u
  };
}
function localPointVelocity(state, localPoint) {
  const c = Math.cos(state.angle);
  const s = Math.sin(state.angle);
  const rx = c * localPoint[0] - s * localPoint[1];
  const ry = s * localPoint[0] + c * localPoint[1];
  return {
    x: state.vel.x - state.angVel * ry,
    y: state.vel.y + state.angVel * rx
  };
}
function chooseBestHitIndex(hits, vel) {
  if (!hits.length) return -1;
  let bestIdx = 0;
  for (let i = 1; i < hits.length; i++) {
    const best = hits[bestIdx];
    const hit = hits[i];
    if (!best || !hit) continue;
    if (hit.time < best.time - 1e-8) {
      bestIdx = i;
      continue;
    }
    if (Math.abs(hit.time - best.time) > 1e-8) continue;
    const hitScore = vel.x * hit.normal.x + vel.y * hit.normal.y;
    const bestScore = vel.x * best.normal.x + vel.y * best.normal.y;
    if (hitScore < bestScore) {
      bestIdx = i;
    }
  }
  return bestIdx;
}
function shipWorldAngleAt(shipX, shipY) {
  return -Math.atan2(shipX, shipY || 1e-6);
}
function interpolateMothershipPose(prevPose, currPose, t) {
  return {
    x: prevPose.x + (currPose.x - prevPose.x) * t,
    y: prevPose.y + (currPose.y - prevPose.y) * t,
    angle: lerpAngleShortest$1(prevPose.angle, currPose.angle, t)
  };
}
function findSweptMothershipCollision(args) {
  const {
    mothership,
    mothershipPrevPose,
    shipLocalConvexHull,
    shipStartX,
    shipStartY,
    shipEndX,
    shipEndY,
    dt
  } = args;
  if (!mothership || !Array.isArray(shipLocalConvexHull) || shipLocalConvexHull.length < 3) return null;
  const span = Math.max(1e-6, Number.isFinite(dt) ? Number(dt) : 1);
  const prevPose = mothershipPrevPose || mothership;
  const currPose = mothership;
  const startPos = worldToMothershipLocal(prevPose, shipStartX, shipStartY);
  const endPos = worldToMothershipLocal(currPose, shipEndX, shipEndY);
  const startAngle = shipWorldAngleAt(shipStartX, shipStartY) - prevPose.angle;
  const endAngle = shipWorldAngleAt(shipEndX, shipEndY) - currPose.angle;
  const angVel = (lerpAngleShortest$1(startAngle, endAngle, 1) - startAngle) / span;
  const state = {
    pos: startPos,
    angle: startAngle,
    vel: {
      x: (endPos.x - startPos.x) / span,
      y: (endPos.y - startPos.y) / span
    },
    angVel
  };
  const candidates = gatherCandidateFeatures(shipLocalConvexHull, startPos, endPos, startAngle, endAngle, mothership);
  if (!candidates.edges.length) return null;
  const worldHull = transformHull(shipLocalConvexHull, state.pos, state.angle);
  const hits = [];
  for (let vertexIdx = 0; vertexIdx < shipLocalConvexHull.length; vertexIdx++) {
    const p0 = worldHull.verts[vertexIdx];
    const localPoint = shipLocalConvexHull[vertexIdx];
    if (!p0 || !localPoint) continue;
    const v = localPointVelocity(state, localPoint);
    for (const edge of candidates.edges) {
      const hit2 = pointEdgeToi(p0, v, edge, span);
      if (!hit2) continue;
      hits.push({
        time: hit2.time,
        point: hit2.point,
        normal: hit2.normal,
        type: hit2.type,
        edgeId: edge.id,
        cornerId: null,
        playerVertex: vertexIdx,
        playerEdgeIndex: null
      });
    }
  }
  for (const corner of candidates.corners) {
    for (let edgeIdx = 0; edgeIdx < worldHull.edges.length; edgeIdx++) {
      const edge = worldHull.edges[edgeIdx];
      const localPoint = shipLocalConvexHull[edgeIdx];
      if (!edge || !localPoint) continue;
      const edgeVel = localPointVelocity(state, localPoint);
      const hit2 = wallCornerPlayerEdgeToi(corner, edge, edgeVel, span);
      if (!hit2) continue;
      let bestNormal = hit2.normal;
      let bestD2 = Infinity;
      for (const boundaryEdgeId of corner.edgeIds) {
        const wallEdge = candidates.edges.find((item) => item.id === boundaryEdgeId);
        if (!wallEdge) continue;
        const cp = closestPointOnSegment$1(
          wallEdge.a.x,
          wallEdge.a.y,
          wallEdge.b.x,
          wallEdge.b.y,
          hit2.point.x,
          hit2.point.y
        );
        if (cp.d2 < bestD2) {
          bestD2 = cp.d2;
          bestNormal = wallEdge.normal;
        }
      }
      hits.push({
        time: hit2.time,
        point: hit2.point,
        normal: bestNormal,
        type: hit2.type,
        edgeId: null,
        cornerId: corner.id,
        playerVertex: null,
        playerEdgeIndex: edgeIdx
      });
    }
  }
  const bestIdx = chooseBestHitIndex(hits, state.vel);
  if (bestIdx < 0) return null;
  const hit = hits[bestIdx];
  if (!hit) return null;
  const fraction = Math.max(0, Math.min(1, hit.time / span));
  const safeFraction = Math.max(0, Math.min(1, (hit.time - 1e-5) / span));
  const poseAtImpact = interpolateMothershipPose(prevPose, currPose, fraction);
  const worldPoint = mothershipLocalToWorld(poseAtImpact, hit.point.x, hit.point.y);
  const worldNormal = mothershipLocalDirToWorld(poseAtImpact, hit.normal.x, hit.normal.y);
  return {
    time: hit.time,
    fraction,
    safeFraction,
    type: hit.type,
    localPoint: hit.point,
    localNormal: hit.normal,
    worldPoint,
    worldNormal,
    edgeId: hit.edgeId,
    cornerId: hit.cornerId,
    playerVertex: hit.playerVertex,
    playerEdgeIndex: hit.playerEdgeIndex
  };
}
function sweptShipVsMovingMothership(ctx, shipX0, shipY0, shipX1, shipY1, shipRadius, mothershipPrev, mothershipCurr) {
  if (!ctx.mothership) return null;
  const impact = findSweptMothershipCollision({
    mothership: ctx.mothership,
    mothershipPrevPose: mothershipPrev,
    shipLocalConvexHull: ctx.shipLocalConvexHull(),
    shipStartX: shipX0,
    shipStartY: shipY0,
    shipEndX: shipX1,
    shipEndY: shipY1,
    dt: 1
  });
  if (!impact) return null;
  const safeFraction = impact.safeFraction;
  return {
    x: shipX0 + (shipX1 - shipX0) * safeFraction,
    y: shipY0 + (shipY1 - shipY0) * safeFraction,
    hit: {
      x: impact.worldPoint.x,
      y: impact.worldPoint.y,
      contacts: [{
        x: impact.worldPoint.x,
        y: impact.worldPoint.y,
        nx: impact.worldNormal.x,
        ny: impact.worldNormal.y,
        av: 0
      }]
    },
    hitSource: "mothership"
  };
}
function hasStrictMothershipOverlapAtPose(mothership, shipCollisionPointsAt, x, y) {
  const edges = getMothershipBoundaryEdges(mothership);
  const strictSkin = Math.max(2e-3, (mothership.spacing || 0.4) * 0.01);
  const pts = shipCollisionPointsAt(x, y);
  pts.push([x, y]);
  for (const p of pts) {
    const av = mothershipAirAtWorld(mothership, p[0], p[1]);
    if (av === null || av > 0.5) continue;
    const lp = worldToMothershipLocal(mothership, p[0], p[1]);
    let bestD2 = Infinity;
    for (const edge of edges) {
      const cp = closestPointOnSegment$1(edge.ax, edge.ay, edge.bx, edge.by, lp.x, lp.y);
      if (cp.d2 < bestD2) bestD2 = cp.d2;
    }
    if (Math.sqrt(bestD2) > strictSkin) {
      return true;
    }
  }
  return false;
}
function vecDiag(vx, vy) {
  return {
    vx,
    vy,
    speed: Math.hypot(vx, vy),
    dirDeg: Math.atan2(vy, vx) * 180 / Math.PI
  };
}
function normalize(x, y) {
  const len = Math.hypot(x, y) || 1;
  return { x: x / len, y: y / len };
}
function reflectVelocity(v, n, restitution) {
  const vn = v.x * n.x + v.y * n.y;
  if (vn >= 0) return { x: v.x, y: v.y };
  return {
    x: v.x - (1 + restitution) * vn * n.x,
    y: v.y - (1 + restitution) * vn * n.y
  };
}
function reflectVelocityWithFriction(v, n, restitution, friction, dt) {
  const reflected = reflectVelocity(v, n, restitution);
  const tx = -n.y;
  const ty = n.x;
  const vn = reflected.x * n.x + reflected.y * n.y;
  const vt = reflected.x * tx + reflected.y * ty;
  const damp = Math.max(0, 1 - Math.max(0, friction) * 0.45 * Math.max(0, dt));
  const vtDamped = vt * damp;
  return {
    x: n.x * vn + tx * vtDamped,
    y: n.y * vn + ty * vtDamped
  };
}
function lerpPose(a, b, t) {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    angle: lerpAngleShortest$1(a.angle, b.angle, t)
  };
}
function baseVelocityAtPose(mothership, pose, omega, x, y) {
  const rx = x - pose.x;
  const ry = y - pose.y;
  return {
    vx: mothership.vx - omega * ry,
    vy: mothership.vy + omega * rx
  };
}
function nearestBoundaryContactAtPose(mothership, shipCollisionPointsAt, x, y) {
  const edges = getMothershipBoundaryEdges(mothership);
  const pts = shipCollisionPointsAt(x, y);
  pts.push([x, y]);
  let best = null;
  for (const p of pts) {
    const lp = worldToMothershipLocal(mothership, p[0], p[1]);
    const av = mothershipAirAtLocalExact(mothership, lp.x, lp.y);
    const inside = av !== null && av <= 0.5;
    for (let edgeIdx = 0; edgeIdx < edges.length; edgeIdx++) {
      const edge = edges[edgeIdx];
      if (!edge) continue;
      const cp = closestPointOnSegment$1(edge.ax, edge.ay, edge.bx, edge.by, lp.x, lp.y);
      const candidate = {
        inside,
        d2: cp.d2,
        x: cp.x,
        y: cp.y,
        nx: edge.nx,
        ny: edge.ny,
        edgeIdx
      };
      if (!best) {
        best = candidate;
        continue;
      }
      if (candidate.inside !== best.inside) {
        if (candidate.inside) best = candidate;
        continue;
      }
      if (candidate.d2 < best.d2) {
        best = candidate;
      }
    }
  }
  if (!best) return null;
  const c = Math.cos(mothership.angle);
  const s = Math.sin(mothership.angle);
  const n = normalize(
    c * best.nx - s * best.ny,
    s * best.nx + c * best.ny
  );
  return {
    x: mothership.x + c * best.x - s * best.y,
    y: mothership.y + s * best.x + c * best.y,
    nx: n.x,
    ny: n.y,
    edgeIdx: best.edgeIdx
  };
}
function fallbackGradientNormal(sample, eps, shipX, shipY, cx, cy) {
  let nx = sample(cx + eps, cy) - sample(cx - eps, cy);
  let ny = sample(cx, cy + eps) - sample(cx, cy - eps);
  let nLen = Math.hypot(nx, ny);
  if (nLen < 1e-4) {
    nx = shipX - cx;
    ny = shipY - cy;
    nLen = Math.hypot(nx, ny);
  }
  if (nLen < 1e-4) {
    nx = shipX;
    ny = shipY;
    nLen = Math.hypot(nx, ny) || 1;
  }
  return { nx: nx / nLen, ny: ny / nLen };
}
function depenetrateAlongNormal$1(mothership, shipCollisionPointsAt, x, y, nx, ny, shipRadius) {
  const n = normalize(nx, ny);
  const maxPush = Math.max(0.35, shipRadius * 1.4);
  let lo = 0;
  let hi = Math.max(0.01, shipRadius * 0.06);
  while (hi < maxPush && hasStrictMothershipOverlapAtPose(mothership, shipCollisionPointsAt, x + n.x * hi, y + n.y * hi)) {
    lo = hi;
    hi *= 2;
  }
  hi = Math.min(hi, maxPush);
  const cleared = !hasStrictMothershipOverlapAtPose(mothership, shipCollisionPointsAt, x + n.x * hi, y + n.y * hi);
  if (cleared) {
    for (let i = 0; i < 14; i++) {
      const mid = (lo + hi) * 0.5;
      if (hasStrictMothershipOverlapAtPose(mothership, shipCollisionPointsAt, x + n.x * mid, y + n.y * mid)) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
  }
  return {
    x: x + n.x * hi,
    y: y + n.y * hi,
    push: hi,
    cleared
  };
}
function setDiag(landingDbg, ship, payload) {
  if (!landingDbg) return;
  const prev = ship._lastMothershipCollisionDiag || null;
  const outAbs = payload && payload.absOut ? payload.absOut : null;
  const outRel = payload && payload.relOut ? payload.relOut : null;
  landingDbg.collisionDiag = { ...payload, prev };
  ship._lastMothershipCollisionDiag = { abs: outAbs, rel: outRel };
}
function buildLandingData(mothership, nx, ny, shipX, shipY, shipRadius, game) {
  const cUp = Math.cos(mothership.angle);
  const sUp = Math.sin(mothership.angle);
  const upx = -sUp;
  const upy = cUp;
  const maxSlope = 1 - Math.cos(Math.PI / 8);
  const landSlope = Math.min(1 - game.SURFACE_DOT + 0.03, maxSlope);
  const dotUpRaw = nx * upx + ny * upy;
  const slope = 1 - Math.abs(dotUpRaw);
  const landable = dotUpRaw < 0 && slope <= landSlope;
  const landingClearance = Math.max(0.01, Math.min(shipRadius * 0.16, (mothership.spacing || 0.4) * 0.08));
  const landedTestX = shipX + nx * landingClearance;
  const landedTestY = shipY + ny * landingClearance;
  const dx = landedTestX - mothership.x;
  const dy = landedTestY - mothership.y;
  const c = Math.cos(-mothership.angle);
  const s = Math.sin(-mothership.angle);
  const dockTest = {
    lx: c * dx - s * dy,
    ly: s * dx + c * dy
  };
  const dockLocalNormal = {
    x: c * nx - s * ny,
    y: s * nx + c * ny
  };
  return {
    dotUpRaw,
    slope,
    landSlope,
    dockTest,
    dockLocalNormal,
    dockableSurface: dockTest.ly > 0.5,
    dockFloorNormal: dockLocalNormal.y <= -0.6,
    landedTestX,
    landedTestY,
    landable
  };
}
function resolveMothershipCollisionResponse(args) {
  const {
    ship,
    collision,
    mothership,
    planetParams,
    game,
    dt,
    eps,
    debugEnabled = false,
    shipRadius,
    shipCollisionPointsAt,
    mothershipAngularVel,
    mothershipPrevPose,
    shipLocalConvexHull,
    shipStartX,
    shipStartY,
    shipEndX,
    shipEndY,
    onCrash,
    isDockedWithMothership,
    onSuccessfullyDocked
  } = args;
  const hit = ship._collision;
  if (!hit || hit.source !== "mothership") return;
  if (!debugEnabled) {
    ship._landingDebug = null;
    ship._lastMothershipCollisionDiag = null;
  }
  const omega = Number.isFinite(mothershipAngularVel) ? Number(mothershipAngularVel) : 0;
  const restitution = Number.isFinite(game.MOTHERSHIP_RESTITUTION) ? Math.max(0, Math.min(1, Number(game.MOTHERSHIP_RESTITUTION))) : 0.8;
  const mothershipFriction = Number.isFinite(game.MOTHERSHIP_FRICTION) ? Math.max(0, Number(game.MOTHERSHIP_FRICTION)) : 0;
  const maxImpacts = 4;
  const finalPose = (
    /** @type {Pose} */
    { x: mothership.x, y: mothership.y, angle: mothership.angle }
  );
  const startPose = mothershipPrevPose ? (
    /** @type {Pose} */
    { x: mothershipPrevPose.x, y: mothershipPrevPose.y, angle: mothershipPrevPose.angle }
  ) : finalPose;
  const hx = Number.isFinite(hit.x) ? hit.x : ship.x;
  const hy = Number.isFinite(hit.y) ? hit.y : ship.y;
  let curX = shipStartX;
  let curY = shipStartY;
  let curVx = ship.vx;
  let curVy = ship.vy;
  let remainingDt = Math.max(1e-6, Number.isFinite(dt) ? Number(dt) : 1 / 60);
  let segStartPose = startPose;
  let firstSegment = true;
  let lastContact = null;
  let lastDiagDebug = null;
  let overlapBefore = false;
  let overlapAfter = false;
  let depenPush = 0;
  let depenCleared = true;
  let handledImpact = false;
  for (let impactCount = 0; impactCount < maxImpacts && remainingDt > 1e-6; impactCount++) {
    const targetX = firstSegment ? shipEndX : curX + curVx * remainingDt;
    const targetY = firstSegment ? shipEndY : curY + curVy * remainingDt;
    const impact = findSweptMothershipCollision({
      mothership,
      mothershipPrevPose: segStartPose,
      shipLocalConvexHull,
      shipStartX: curX,
      shipStartY: curY,
      shipEndX: targetX,
      shipEndY: targetY,
      dt: remainingDt
    });
    firstSegment = false;
    if (!impact) {
      curX = targetX;
      curY = targetY;
      break;
    }
    handledImpact = true;
    const safeFraction = impact.safeFraction;
    const hitFraction = impact.fraction;
    curX = curX + (targetX - curX) * safeFraction;
    curY = curY + (targetY - curY) * safeFraction;
    const hitPose = lerpPose(segStartPose, finalPose, hitFraction);
    const baseAtHit = baseVelocityAtPose(mothership, hitPose, omega, impact.worldPoint.x, impact.worldPoint.y);
    const n = normalize(impact.worldNormal.x, impact.worldNormal.y);
    const relIn = { x: curVx - baseAtHit.vx, y: curVy - baseAtHit.vy };
    const vnIn = relIn.x * n.x + relIn.y * n.y;
    const tx2 = -n.y;
    const ty2 = n.x;
    const vtIn = relIn.x * tx2 + relIn.y * ty2;
    lastContact = {
      x: impact.worldPoint.x,
      y: impact.worldPoint.y,
      nx: n.x,
      ny: n.y,
      kind: impact.type,
      edgeIdx: Number.isFinite(impact.edgeId) ? impact.edgeId : null
    };
    if (debugEnabled) {
      lastDiagDebug = {
        type: impact.type,
        time: impact.time,
        fraction: impact.fraction,
        safeFraction: impact.safeFraction,
        edgeId: impact.edgeId,
        cornerId: impact.cornerId,
        playerVertex: impact.playerVertex,
        playerEdgeIndex: impact.playerEdgeIndex
      };
    }
    if (vnIn < -planetParams.CRASH_SPEED) {
      if (debugEnabled) {
        ship._landingDebug = {
          source: "mothership",
          reason: "mothership_crash",
          vn: vnIn,
          vt: vtIn,
          speed: Math.hypot(relIn.x, relIn.y),
          impactX: impact.worldPoint.x,
          impactY: impact.worldPoint.y,
          supportX: impact.worldPoint.x,
          supportY: impact.worldPoint.y
        };
      }
      onCrash();
      return;
    }
    const landing2 = buildLandingData(mothership, n.x, n.y, curX, curY, shipRadius, game);
    const mothershipLandSpeed = Math.max(0, Number(game.LAND_SPEED) || 0);
    const landVn = Math.max(0.08, mothershipLandSpeed * 3);
    const landVt = Math.max(0.8, mothershipLandSpeed * 0.6);
    if (landing2.landable && landing2.dockableSurface && landing2.dockFloorNormal && vnIn >= -landVn && Math.abs(vtIn) < landVt) {
      ship.state = "landed";
      ship.x = landing2.landedTestX;
      ship.y = landing2.landedTestY;
      ship.vx = mothership.vx;
      ship.vy = mothership.vy;
      ship._dock = landing2.dockTest;
      ship._landingDebug = debugEnabled ? {
        source: "mothership",
        reason: "mothership_landed",
        dotUp: landing2.dotUpRaw,
        slope: landing2.slope,
        landSlope: landing2.landSlope,
        vn: vnIn,
        vt: vtIn,
        speed: Math.hypot(relIn.x, relIn.y),
        impactX: impact.worldPoint.x,
        impactY: impact.worldPoint.y,
        supportX: impact.worldPoint.x,
        supportY: impact.worldPoint.y,
        contactsCount: 1,
        overlapBeforeCount: 0,
        overlapAfterCount: 0,
        overlapBeforeMin: 1,
        overlapAfterMin: 1,
        depenIter: 0,
        depenPush: 0,
        depenCushion: 0,
        depenDir: 0,
        depenCleared: true,
        landable: true,
        landed: true
      } : null;
      if (debugEnabled) setDiag(ship._landingDebug, ship, {
        phase: "landed",
        hitCount: 1,
        distinctHullCount: 1,
        averageNormal: { nx: n.x, ny: n.y },
        normals: [{
          kind: impact.type,
          edgeIdx: Number.isFinite(impact.edgeId) ? impact.edgeId : -1,
          hullIdx: -1,
          x: impact.worldPoint.x,
          y: impact.worldPoint.y,
          nx: n.x,
          ny: n.y,
          av: null
        }],
        absIn: vecDiag(ship.vx, ship.vy),
        absOut: vecDiag(ship.vx, ship.vy),
        baseAtContact: vecDiag(baseAtHit.vx, baseAtHit.vy),
        relIn: vecDiag(relIn.x, relIn.y),
        relOut: vecDiag(0, 0),
        absInLocal: vecDiag(ship.vx, ship.vy),
        absOutLocal: vecDiag(ship.vx, ship.vy),
        baseAtContactLocal: vecDiag(baseAtHit.vx, baseAtHit.vy),
        relInLocal: vecDiag(relIn.x, relIn.y),
        relOutLocal: vecDiag(0, 0),
        vnIn,
        vtIn,
        vnOut: 0,
        vtOut: 0,
        backoff: { dist: 0, dirX: n.x, dirY: n.y, cleared: true },
        overlap: { before: false, after: false },
        evidence: {
          valid: true,
          reason: impact.type,
          hits: [{
            kind: impact.type,
            edgeIdx: Number.isFinite(impact.edgeId) ? impact.edgeId : -1,
            hullIdx: -1,
            x: impact.worldPoint.x,
            y: impact.worldPoint.y,
            nx: n.x,
            ny: n.y,
            av: null
          }],
          debug: lastDiagDebug
        },
        dock: {
          lx: landing2.dockTest.lx,
          ly: landing2.dockTest.ly,
          localNx: landing2.dockLocalNormal.x,
          localNy: landing2.dockLocalNormal.y,
          dockableSurface: landing2.dockableSurface,
          dockFloorNormal: landing2.dockFloorNormal
        }
      });
      if (isDockedWithMothership()) {
        onSuccessfullyDocked();
      }
      return;
    }
    const relOut = reflectVelocityWithFriction(relIn, n, restitution, mothershipFriction, dt);
    curVx = baseAtHit.vx + relOut.x;
    curVy = baseAtHit.vy + relOut.y;
    curX += n.x * Math.max(2e-3, (mothership.spacing || 0.4) * 0.03);
    curY += n.y * Math.max(2e-3, (mothership.spacing || 0.4) * 0.03);
    remainingDt = Math.max(0, remainingDt - impact.time);
    segStartPose = lerpPose(segStartPose, finalPose, hitFraction);
  }
  ship.x = curX;
  ship.y = curY;
  ship.vx = curVx;
  ship.vy = curVy;
  overlapBefore = hasStrictMothershipOverlapAtPose(mothership, shipCollisionPointsAt, ship.x, ship.y);
  if (overlapBefore) {
    const poseContact = nearestBoundaryContactAtPose(mothership, shipCollisionPointsAt, ship.x, ship.y) || (() => {
      const n2 = fallbackGradientNormal((x, y) => collision.airValueAtWorld(x, y), eps, ship.x, ship.y, hx, hy);
      return { x: hx, y: hy, nx: n2.nx, ny: n2.ny, edgeIdx: -1 };
    })();
    const depen = depenetrateAlongNormal$1(mothership, shipCollisionPointsAt, ship.x, ship.y, poseContact.nx, poseContact.ny, shipRadius);
    ship.x = depen.x;
    ship.y = depen.y;
    depenPush += depen.push;
    depenCleared = depenCleared && depen.cleared;
    overlapAfter = hasStrictMothershipOverlapAtPose(mothership, shipCollisionPointsAt, ship.x, ship.y);
    const n = normalize(poseContact.nx, poseContact.ny);
    const base2 = baseVelocityAtPose(mothership, finalPose, omega, poseContact.x, poseContact.y);
    const relIn = { x: ship.vx - base2.vx, y: ship.vy - base2.vy };
    const vnIn = relIn.x * n.x + relIn.y * n.y;
    if (vnIn < 0) {
      const relOut = reflectVelocityWithFriction(relIn, n, restitution, mothershipFriction, dt);
      ship.vx = base2.vx + relOut.x;
      ship.vy = base2.vy + relOut.y;
    }
    ship.x += n.x * Math.max(2e-3, shipRadius * 0.02);
    ship.y += n.y * Math.max(2e-3, shipRadius * 0.02);
    lastContact = {
      x: poseContact.x,
      y: poseContact.y,
      nx: n.x,
      ny: n.y,
      kind: "overlap_pose",
      edgeIdx: Number.isFinite(poseContact.edgeIdx) ? poseContact.edgeIdx : null
    };
  } else {
    overlapAfter = false;
  }
  if (!handledImpact && !lastContact) {
    ship._collision = null;
    ship._landingDebug = debugEnabled ? {
      source: "mothership",
      reason: "mothership_no_contact",
      vn: 0,
      vt: 0,
      speed: 0,
      impactX: hx,
      impactY: hy,
      supportX: hx,
      supportY: hy,
      contactsCount: 0,
      overlapBeforeCount: 0,
      overlapAfterCount: 0,
      overlapBeforeMin: 1,
      overlapAfterMin: 1,
      depenIter: 0,
      depenPush: 0,
      depenCushion: 0,
      depenDir: 0,
      depenCleared: true
    } : null;
    if (debugEnabled) setDiag(ship._landingDebug, ship, {
      phase: "no_contact",
      hitCount: 0,
      distinctHullCount: 0,
      averageNormal: null,
      normals: [],
      absIn: vecDiag(curVx, curVy),
      absOut: vecDiag(curVx, curVy),
      baseAtContact: vecDiag(0, 0),
      relIn: vecDiag(0, 0),
      relOut: vecDiag(0, 0),
      absInLocal: vecDiag(curVx, curVy),
      absOutLocal: vecDiag(curVx, curVy),
      baseAtContactLocal: vecDiag(0, 0),
      relInLocal: vecDiag(0, 0),
      relOutLocal: vecDiag(0, 0),
      vnIn: 0,
      vtIn: 0,
      vnOut: 0,
      vtOut: 0,
      backoff: { dist: depenPush, dirX: 0, dirY: 0, cleared: depenCleared },
      overlap: { before: false, after: false },
      evidence: { valid: false, reason: "no_contact", hits: [], debug: null },
      dock: null
    });
    return;
  }
  const base = lastContact ? baseVelocityAtPose(mothership, finalPose, omega, lastContact.x, lastContact.y) : { vx: 0, vy: 0 };
  const relNowVx = ship.vx - base.vx;
  const relNowVy = ship.vy - base.vy;
  const tx = lastContact ? -lastContact.ny : 0;
  const ty = lastContact ? lastContact.nx : 0;
  const vnNow = lastContact ? relNowVx * lastContact.nx + relNowVy * lastContact.ny : 0;
  const vtNow = lastContact ? relNowVx * tx + relNowVy * ty : 0;
  const landing = lastContact ? buildLandingData(mothership, lastContact.nx, lastContact.ny, ship.x, ship.y, shipRadius, game) : null;
  ship._collision = null;
  if (debugEnabled) {
    const landingDebug = {
      source: "mothership",
      reason: overlapAfter ? "mothership_overlap_only" : "mothership_reflect",
      vn: vnNow,
      vt: vtNow,
      speed: Math.hypot(relNowVx, relNowVy),
      impactX: lastContact ? lastContact.x : hx,
      impactY: lastContact ? lastContact.y : hy,
      supportX: lastContact ? lastContact.x : hx,
      supportY: lastContact ? lastContact.y : hy,
      contactsCount: lastContact ? 1 : 0,
      overlapBeforeCount: overlapBefore ? 1 : 0,
      overlapAfterCount: overlapAfter ? 1 : 0,
      overlapBeforeMin: overlapBefore ? 0 : 1,
      overlapAfterMin: overlapAfter ? 0 : 1,
      depenIter: depenPush > 0 ? 1 : 0,
      depenPush,
      depenCushion: 0,
      depenDir: depenPush > 0 ? 1 : 0,
      depenCleared
    };
    if (landing) {
      landingDebug.dotUp = landing.dotUpRaw;
      landingDebug.slope = landing.slope;
      landingDebug.landSlope = landing.landSlope;
    }
    ship._landingDebug = landingDebug;
  } else {
    ship._landingDebug = null;
  }
  if (debugEnabled && ship._landingDebug) setDiag(ship._landingDebug, ship, {
    phase: "reflect",
    hitCount: lastContact ? 1 : 0,
    distinctHullCount: lastContact ? 1 : 0,
    averageNormal: lastContact ? { nx: lastContact.nx, ny: lastContact.ny } : null,
    normals: lastContact ? [{
      kind: lastContact.kind,
      edgeIdx: Number.isFinite(lastContact.edgeIdx) ? lastContact.edgeIdx : -1,
      hullIdx: -1,
      x: lastContact.x,
      y: lastContact.y,
      nx: lastContact.nx,
      ny: lastContact.ny,
      av: null
    }] : [],
    absIn: vecDiag(curVx, curVy),
    absOut: vecDiag(ship.vx, ship.vy),
    baseAtContact: vecDiag(base.vx, base.vy),
    relIn: vecDiag(relNowVx, relNowVy),
    relOut: vecDiag(relNowVx, relNowVy),
    absInLocal: vecDiag(curVx, curVy),
    absOutLocal: vecDiag(ship.vx, ship.vy),
    baseAtContactLocal: vecDiag(base.vx, base.vy),
    relInLocal: vecDiag(relNowVx, relNowVy),
    relOutLocal: vecDiag(relNowVx, relNowVy),
    vnIn: vnNow,
    vtIn: vtNow,
    vnOut: vnNow,
    vtOut: vtNow,
    backoff: { dist: depenPush, dirX: lastContact ? lastContact.nx : 0, dirY: lastContact ? lastContact.ny : 0, cleared: depenCleared },
    overlap: { before: overlapBefore, after: overlapAfter },
    evidence: {
      valid: !!lastContact,
      reason: lastContact ? lastContact.kind : "no_contact",
      hits: lastContact ? [{
        kind: lastContact.kind,
        edgeIdx: Number.isFinite(lastContact.edgeIdx) ? lastContact.edgeIdx : -1,
        hullIdx: -1,
        x: lastContact.x,
        y: lastContact.y,
        nx: lastContact.nx,
        ny: lastContact.ny,
        av: null
      }] : [],
      debug: lastDiagDebug
    },
    dock: landing ? {
      lx: landing.dockTest.lx,
      ly: landing.dockTest.ly,
      localNx: landing.dockLocalNormal.x,
      localNy: landing.dockLocalNormal.y,
      dockableSurface: landing.dockableSurface,
      dockFloorNormal: landing.dockFloorNormal
    } : null
  });
}
function expectDefined$3(value) {
  if (value == null) {
    throw new Error("Expected value to be defined");
  }
  return value;
}
function brightenColor(base, boost) {
  return [
    Math.min(1, base[0] + (1 - base[0]) * boost),
    Math.min(1, base[1] + (1 - base[1]) * boost),
    Math.min(1, base[2] + (1 - base[2]) * boost)
  ];
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
  const a = expectDefined$3(tri[0]);
  const b = expectDefined$3(tri[1]);
  const c = expectDefined$3(tri[2]);
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
  const a = expectDefined$3(tri[0]);
  const b = expectDefined$3(tri[1]);
  const c = expectDefined$3(tri[2]);
  const edges = [[a, b], [b, c], [c, a]];
  const eps = 1e-6;
  for (const [a2, b2] of edges) {
    const va = a2.air;
    const vb = b2.air;
    const da = va - threshold;
    const db = vb - threshold;
    if (Math.abs(da) <= eps && Math.abs(db) <= eps) {
      pushUniquePoint(pts, a2.x, a2.y);
      pushUniquePoint(pts, b2.x, b2.y);
      continue;
    }
    if (Math.abs(da) <= eps) {
      pushUniquePoint(pts, a2.x, a2.y);
      continue;
    }
    if (Math.abs(db) <= eps) {
      pushUniquePoint(pts, b2.x, b2.y);
      continue;
    }
    if (da * db < 0) {
      const t = (threshold - va) / (vb - va || 1);
      const clampedT = Math.max(0, Math.min(1, t));
      pushUniquePoint(pts, a2.x + (b2.x - a2.x) * clampedT, a2.y + (b2.y - a2.y) * clampedT);
    }
  }
  if (pts.length < 2) return null;
  if (pts.length === 2) {
    const p0 = expectDefined$3(pts[0]);
    const p1 = expectDefined$3(pts[1]);
    return [p0, p1];
  }
  let iBest = 0;
  let jBest = 1;
  let bestD2 = -1;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const pi = expectDefined$3(pts[i]);
      const pj = expectDefined$3(pts[j]);
      const dx = pj[0] - pi[0];
      const dy = pj[1] - pi[1];
      const d2 = dx * dx + dy * dy;
      if (d2 > bestD2) {
        bestD2 = d2;
        iBest = i;
        jBest = j;
      }
    }
  }
  return [expectDefined$3(pts[iBest]), expectDefined$3(pts[jBest])];
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
    const ax = expectDefined$3(triPositions[i0]);
    const ay = expectDefined$3(triPositions[i0 + 1]);
    const bx = expectDefined$3(triPositions[i0 + 2]);
    const by = expectDefined$3(triPositions[i0 + 3]);
    const cx = expectDefined$3(triPositions[i0 + 4]);
    const cy = expectDefined$3(triPositions[i0 + 5]);
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
    const p0 = expectDefined$3(pts[i]);
    const p1 = expectDefined$3(pts[(i + 1) % 6]);
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
    const p0 = expectDefined$3(pts[i]);
    const p1 = expectDefined$3(pts[(i + 1) % sides]);
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
function pushMiner(pos, col, x, y, jumpCycle, r2, g, b, scale, skipHelmet = false, outlineExpand = 0, opts = null) {
  const len = Math.hypot(x, y) || 1;
  const upLen = opts && Number.isFinite(opts.upx) && Number.isFinite(opts.upy) ? Math.hypot(Number(opts.upx), Number(opts.upy)) || 1 : len;
  const upx = opts && Number.isFinite(opts.upx) ? Number(opts.upx) / upLen : x / len;
  const upy = opts && Number.isFinite(opts.upy) ? Number(opts.upy) / upLen : y / len;
  const jumpOffset = 0.5 * jumpCycle * (1 - jumpCycle);
  const tx = -upy;
  const ty = upx;
  const s = scale ?? 1;
  const deformX = opts && Number.isFinite(opts.deformX) ? Number(opts.deformX) : 1;
  const deformY = opts && Number.isFinite(opts.deformY) ? Number(opts.deformY) : 1;
  const alpha = opts && Number.isFinite(opts.alpha) ? Math.max(0, Math.min(1, Number(opts.alpha))) : 1;
  const ox = x + upx * jumpOffset;
  const oy = y + upy * jumpOffset;
  const toWorld = (lx, ly) => [ox + tx * lx * deformX + upx * ly * deformY, oy + ty * lx * deformX + upy * ly * deformY];
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
          pushTri(pos, col, sax, say, sbx, sby, scx, scy, darken(t.col[0]), darken(t.col[1]), darken(t.col[2]), alpha);
          triCount += 1;
        }
      }
    }
    for (const t of tris) {
      pushTri(pos, col, t.a[0], t.a[1], t.b[0], t.b[1], t.c[0], t.c[1], t.col[0], t.col[1], t.col[2], alpha);
      triCount += 1;
    }
  }
  return triCount;
}
function pushHealthPickup(pos, col, x, y, life) {
  let s = 0.1 * (1 + 0.2 * Math.sin(8 * life));
  s *= Math.min(1, 16 * life);
  const x0 = x - s, x1 = x + s;
  const y0 = y - s, y1 = y + s;
  pushTri(pos, col, x0, y0, x1, y0, x1, y1, 0, 1, 0, 1);
  pushTri(pos, col, x0, y0, x1, y1, x0, y1, 0, 1, 0, 1);
  return 6;
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
  const clamp012 = (v) => Math.max(0, Math.min(1, v));
  const colorFor = (ly) => {
    const t = clamp012(ly / (scale || 1) * 0.5 + 0.5);
    return [
      dark[0] + (bright[0] - dark[0]) * t,
      dark[1] + (bright[1] - dark[1]) * t,
      dark[2] + (bright[2] - dark[2]) * t,
      alpha
    ];
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
  const showGameplayIndicators = state.showGameplayIndicators !== false;
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
  if (PERF_FLAGS.disableDynamicOverlay) {
    gl.disable(gl.BLEND);
    return;
  }
  const outerRingRadius = planet.radial && planet.radial.rings && planet.radial.rings.length ? planet.radial.rings.length - 1 : rMax;
  const outerRingEntityBand = Math.max(1.1, Math.min(2, outerRingRadius * 0.035));
  const visibleEntityNow = (x, y) => {
    if (!state.fogEnabled) return true;
    if (planet.fogSeenAt(x, y)) return true;
    if (!state.showVisibleOuterRingEntities) return false;
    if (!planet.fogVisibleAt(x, y)) return false;
    return Math.hypot(x, y) >= outerRingRadius - outerRingEntityBand;
  };
  const visibleHostileNow = (x, y) => {
    return visibleEntityNow(x, y);
  };
  const { shipHWorld, shipWWorld } = getDropshipRenderSize(game);
  const { bodyLiftN, skiLiftN, cargoWidthScale, cargoBottomN, cargoTopBaseN } = DROPSHIP_MODEL;
  const cabinSide = state.ship.cabinSide || 1;
  const { cargoTopN } = getDropshipCargoBoundsN();
  const dropshipGeomN = getDropshipGeometryProfileN();
  const cargoMidN = (cargoBottomN + cargoTopN) * 0.5;
  const oldCargoMidN = (cargoTopBaseN + cargoBottomN) * 0.5;
  const thrustLiftAll = (cargoMidN - oldCargoMidN) * shipHWorld * 1;
  const thrustDownExtraUp = shipHWorld * 0.18;
  const thrustUpExtraDown = shipHWorld * -0.12;
  const pos = [];
  const col = [];
  let triVerts = 0;
  let lineVerts = 0;
  let pointVerts = 0;
  const planetCfg = planet.getPlanetConfig ? planet.getPlanetConfig() : null;
  {
    const atmo = planetCfg && planetCfg.defaults && planetCfg.defaults.ATMOSPHERE ? planetCfg.defaults.ATMOSPHERE : null;
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
  const shipRot = Number.isFinite(state.ship.renderAngle) ? Number(state.ship.renderAngle) : getDropshipWorldRotation(state.ship.x, state.ship.y);
  const lighten = (c) => Math.min(1, c + 0.3);
  const rockPoint = [1, 0.55, 0.12];
  const airPoint = [
    lighten(expectDefined$3(airLight[0])),
    lighten(expectDefined$3(airLight[1])),
    lighten(expectDefined$3(airLight[2]))
  ];
  const now = performance.now() * 1e-3;
  const invertT = Math.max(0, state.ship.invertT || 0);
  const invertPulse = invertT > 0 ? 0.55 + 0.45 * Math.sin(now * 8) : 0;
  const invertMix = invertT > 0 ? Math.min(0.65, 0.25 + 0.35 * invertPulse) : 0;
  const invertTint = planetCfg && planetCfg.id === "molten" ? [1, 0.48, 0.16] : [0.72, 0.25, 0.9];
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
    const rotated = rot2(lx, ly, shipRot);
    const wx = expectDefined$3(rotated[0]);
    const wy = expectDefined$3(rotated[1]);
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
      const normal = planet.normalAtWorld ? planet.normalAtWorld(p.x, p.y) : null;
      if (normal) {
        ux = normal.nx;
        uy = normal.ny;
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
    const nx = expectDefined$3(ux);
    const ny = expectDefined$3(uy);
    const tangentX = expectDefined$3(tx);
    const tangentY = expectDefined$3(ty);
    const cx = p.x - nx * sink;
    const cy = p.y - ny * sink;
    const toWorld = (x, y, lx, ly) => [x + tangentX * lx + nx * ly, y + tangentY * lx + ny * ly];
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
      const bottomHalfW = dropshipGeomN.bodyBottomHalfWRenderN;
      const topHalfW = dropshipGeomN.bodyTopHalfWRenderN;
      const lb = L(-bottomHalfW, cargoBottomN, bodyLiftN);
      const rb = L(bottomHalfW, cargoBottomN, bodyLiftN);
      const rt = L(topHalfW, cargoTopN, bodyLiftN);
      const lt = L(-topHalfW, cargoTopN, bodyLiftN);
      addShipTri(shipTris, lb[0], lb[1], rb[0], rb[1], rt[0], rt[1]);
      addShipTri(shipTris, lb[0], lb[1], rt[0], rt[1], lt[0], lt[1]);
      const cabOffset = dropshipGeomN.cabinOffsetN * cabinSide;
      const cabHalfW = dropshipGeomN.cabinHalfWBaseN * dropshipGeomN.cabinHalfWScale;
      const cabBaseY = cargoBottomN;
      const cabTipY = cargoTopN;
      const cabTip = L(cabOffset, cabTipY, bodyLiftN);
      const cabBL = L(cabOffset - cabHalfW, cabBaseY, bodyLiftN);
      const cabBR = L(cabOffset + cabHalfW, cabBaseY, bodyLiftN);
      addShipTri(shipTris, cabBL[0], cabBL[1], cabBR[0], cabBR[1], cabTip[0], cabTip[1]);
      const winHalfW = cabHalfW * dropshipGeomN.windowHalfWScale;
      const winBaseY = cabBaseY + (cabTipY - cabBaseY) * dropshipGeomN.windowBaseT;
      const winTipY = cabBaseY + (cabTipY - cabBaseY) * dropshipGeomN.windowTipT;
      const winTip = L(cabOffset, winTipY, bodyLiftN);
      const winBL = L(cabOffset - winHalfW, winBaseY, bodyLiftN);
      const winBR = L(cabOffset + winHalfW, winBaseY, bodyLiftN);
      addTri(windowTris, winBL[0], winBL[1], winBR[0], winBR[1], winTip[0], winTip[1], 0.05, 0.05, 0.05, 1, false);
      const gunLen = shipHWorld * dropshipGeomN.gunLenH;
      const gunHalfW = shipWWorld * dropshipGeomN.gunHalfWW;
      const mountOffset = gunLen * dropshipGeomN.gunMountBackOffsetLen;
      const [mountCx, mountCy] = L(0, cargoTopN + dropshipGeomN.gunPivotYInsetN, bodyLiftN);
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
      const gstrutW = dropshipGeomN.gunStrutHalfW;
      const gsb0 = L(-gstrutW, cargoTopN, bodyLiftN);
      const gsb1 = L(gstrutW, cargoTopN, bodyLiftN);
      const gst0 = L(-gstrutW, cargoTopN + DROPSHIP_MODEL.gunStrutHeightN, bodyLiftN);
      const gst1 = L(gstrutW, cargoTopN + DROPSHIP_MODEL.gunStrutHeightN, bodyLiftN);
      addShipTri(shipTris, gsb0[0], gsb0[1], gsb1[0], gsb1[1], gst1[0], gst1[1], void 0, false);
      addShipTri(shipTris, gsb0[0], gsb0[1], gst1[0], gst1[1], gst0[0], gst0[1], void 0, false);
      const skiY0 = cargoBottomN;
      const skiY1 = dropshipGeomN.skiTopYRenderN;
      const skiHalfW = dropshipGeomN.skiHalfWRenderN;
      const skiOffset = dropshipGeomN.skiOffsetRenderN;
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
      if (!visibleHostileNow(enemy.x, enemy.y)) continue;
      const enemyRender = enemy;
      const base = fragmentBaseColor(enemy.type);
      const moltenStun = !!(planetCfg && planetCfg.id === "molten" && enemy.stunT && enemy.stunT > 0);
      const bodyBase = moltenStun ? (
        /** @type {[number,number,number]} */
        [0.92, 0.34, 0.08]
      ) : base;
      const outline = moltenStun ? (
        /** @type {[number,number,number]} */
        [0.55, 0.2, 0.06]
      ) : (
        /** @type {[number,number,number]} */
        [bodyBase[0] * 0.55, bodyBase[1] * 0.55, bodyBase[2] * 0.55]
      );
      triVerts += pushEnemyShape(pos, col, enemyRender, outline, game.ENEMY_SCALE, 1, false, outlineSize) * 3;
      triVerts += pushEnemyShape(pos, col, enemyRender, bodyBase, game.ENEMY_SCALE, 1, true) * 3;
      if (enemy.hitT && enemy.hitT > 0) {
        const pulse = 0.5 + 0.5 * Math.sin(tNow * 14);
        const alpha = 0.25 + pulse * 0.45;
        triVerts += pushEnemyShape(pos, col, enemyRender, [1, 0.2, 0.2], game.ENEMY_SCALE * 1.08, alpha, false) * 3;
      }
      if (enemy.stunT && enemy.stunT > 0) {
        const pulse = 0.5 + 0.5 * Math.sin(tNow * 10);
        const alpha = 0.18 + pulse * 0.24;
        const stunCol = planetCfg && planetCfg.id === "molten" ? (
          /** @type {[number,number,number]} */
          [1, 0.38, 0.04]
        ) : (
          /** @type {[number,number,number]} */
          [0.72, 0.92, 1]
        );
        triVerts += pushEnemyShape(pos, col, enemyRender, stunCol, game.ENEMY_SCALE * 1.12, alpha, false) * 3;
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
      const a = expectDefined$3(points[tri[0]]);
      const b = expectDefined$3(points[tri[1]]);
      const d = expectDefined$3(points[tri[2]]);
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
        return expectDefined$3(m.triAir[idx]) <= 0.5;
      }
      const a = expectDefined$3(points[tri[0]]);
      const b = expectDefined$3(points[tri[1]]);
      const d = expectDefined$3(points[tri[2]]);
      const aAir = "air" in a ? a.air : 1;
      const bAir = "air" in b ? b.air : 1;
      const cAir = "air" in d ? d.air : 1;
      return (aAir + bAir + cAir) / 3 <= 0.5;
    };
    for (let i = 0; i < tris.length; i++) {
      const tri = (
        /** @type {[number, number, number]} */
        expectDefined$3(tris[i])
      );
      if (!triIsWall(tri, i)) drawTri(tri, false);
    }
    for (let i = 0; i < tris.length; i++) {
      const tri = (
        /** @type {[number, number, number]} */
        expectDefined$3(tris[i])
      );
      if (triIsWall(tri, i)) drawTri(tri, true);
    }
    {
      const rotCos = Math.cos(state.mothership.angle);
      const rotSin = Math.sin(state.mothership.angle);
      const minerUpX = rotSin;
      const minerUpY = -rotCos;
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
        triVerts += pushMiner(
          pos,
          col,
          minerWorldX,
          minerWorldY,
          0,
          r2,
          g,
          b,
          game.MINER_SCALE,
          false,
          1 / 16,
          { upx: minerUpX, upy: minerUpY }
        ) * 3;
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
        if (!visibleEntityNow(p.x, p.y)) continue;
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
      if (!visibleEntityNow(miner.x, miner.y)) continue;
      const [r2, g, b] = minerColor(miner.type);
      triVerts += pushMiner(pos, col, miner.x, miner.y, miner.jumpCycle, r2, g, b, game.MINER_SCALE, false, 1 / 16) * 3;
    }
  }
  if (state.fallenMiners && state.fallenMiners.length) {
    for (const miner of state.fallenMiners) {
      if (!visibleEntityNow(miner.x, miner.y)) continue;
      const [r2, g, b] = minerColor(miner.type);
      const maxLife = Math.max(1e-3, miner.maxLife || miner.life || 1);
      const t = Math.max(0, Math.min(1, miner.life / maxLife));
      const fadeT = Math.min(1, t / 0.22);
      let upx2 = miner.upx;
      let upy2 = miner.upy;
      let deformX = 1;
      let deformY = 1;
      if (miner.mode === "shot") {
        const progress = 1 - t;
        const baseAng = Math.atan2(miner.upy, miner.upx);
        const ang = baseAng + miner.leanDir * progress * Math.PI * 0.52;
        const flattenT = Math.max(0, Math.min(1, (progress - 0.62) / 0.38));
        upx2 = Math.cos(ang);
        upy2 = Math.sin(ang);
        deformX = 1 + 0.08 * flattenT;
        deformY = 1 - 0.06 * flattenT;
      } else {
        upx2 = Math.cos(miner.rot);
        upy2 = Math.sin(miner.rot);
        deformX = 1.04;
        deformY = 0.96;
      }
      triVerts += pushMiner(
        pos,
        col,
        miner.x,
        miner.y,
        0,
        r2,
        g,
        b,
        game.MINER_SCALE,
        false,
        1 / 16,
        { upx: upx2, upy: upy2, deformX, deformY, alpha: fadeT }
      ) * 3;
    }
  }
  for (const healthPickup of state.healthPickups) {
    if (!visibleEntityNow(healthPickup.x, healthPickup.y)) continue;
    triVerts += pushHealthPickup(pos, col, healthPickup.x, healthPickup.y, healthPickup.life);
  }
  if (state.shots && state.shots.length) {
    const size = 0.1;
    for (const s2 of state.shots) {
      if (!visibleHostileNow(s2.x, s2.y)) continue;
      if (s2.owner === "hunter") pushDiamond(pos, col, s2.x, s2.y, size, 1, 0.35, 0.3, 0.9);
      else if (s2.owner === "ranger") pushDiamond(pos, col, s2.x, s2.y, size, 0.3, 0.8, 1, 0.9);
      else pushDiamond(pos, col, s2.x, s2.y, size, 0.5, 0.125, 1, 0.9);
      triVerts += 6;
    }
  }
  if (state.playerShots && state.playerShots.length) {
    const size = 0.11;
    for (const s2 of state.playerShots) {
      if (!visibleEntityNow(s2.x, s2.y)) continue;
      pushDiamond(pos, col, s2.x, s2.y, size, 0.95, 0.95, 0.95, 0.95);
      triVerts += 6;
    }
  }
  if (state.playerBombs && state.playerBombs.length) {
    const size = 0.13;
    for (const b of state.playerBombs) {
      if (!visibleEntityNow(b.x, b.y)) continue;
      pushSquare(pos, col, b.x, b.y, size, 1, 0.7, 0.2, 0.95);
      triVerts += 6;
    }
  }
  const featureParticles = state.featureParticles || null;
  const lavaParticles = featureParticles ? featureParticles.lava : null;
  if (lavaParticles && lavaParticles.length) {
    const size = 0.1;
    for (const p of lavaParticles) {
      if (!visibleEntityNow(p.x, p.y)) continue;
      pushDiamond(pos, col, p.x, p.y, size, 1, 0.25, 0.15, 0.95);
      triVerts += 6;
    }
  }
  const mushroomParticles = featureParticles ? featureParticles.mushroom : null;
  if (mushroomParticles && mushroomParticles.length) {
    const size = 0.12;
    for (const p of mushroomParticles) {
      if (!visibleEntityNow(p.x, p.y)) continue;
      pushDiamond(pos, col, p.x, p.y, size, 0.95, 0.45, 0.75, 0.95);
      triVerts += 6;
    }
  }
  const iceShardParticles = featureParticles ? featureParticles.iceShard : null;
  if (iceShardParticles && iceShardParticles.length) {
    for (const p of iceShardParticles) {
      if (!visibleEntityNow(p.x, p.y)) continue;
      const life = p.life ?? 0;
      const lifeN = p.maxLife && p.maxLife > 0 ? Math.max(0, Math.min(1, life / p.maxLife)) : 1;
      const progress = 1 - lifeN;
      const vlen = Math.hypot(p.vx || 0, p.vy || 0) || 1;
      const ux = (p.vx || 0) / vlen;
      const uy = (p.vy || 0) / vlen;
      const tx = -uy;
      const ty = ux;
      const size = (p.size || 0.16) * (0.9 + progress * 0.45);
      const tipX = p.x + ux * (size * 1.25);
      const tipY = p.y + uy * (size * 1.25);
      const baseX = p.x - ux * (size * 0.4);
      const baseY = p.y - uy * (size * 0.4);
      const blX = baseX + tx * (size * 0.52);
      const blY = baseY + ty * (size * 0.52);
      const brX = baseX - tx * (size * 0.52);
      const brY = baseY - ty * (size * 0.52);
      pushTri(pos, col, blX, blY, brX, brY, tipX, tipY, 0.74, 0.92, 1, 0.92 * lifeN);
      triVerts += 3;
    }
  }
  const splashParticles = featureParticles ? featureParticles.splashes : null;
  if (splashParticles && splashParticles.length) {
    for (const p of splashParticles) {
      if (!visibleEntityNow(p.x, p.y)) continue;
      const life = p.life ?? 0;
      const lifeN = p.maxLife && p.maxLife > 0 ? Math.max(0, Math.min(1, life / p.maxLife)) : 1;
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
      if (!visibleEntityNow(p.x, p.y)) continue;
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
          const normal = planet.normalAtWorld ? planet.normalAtWorld(p.x, p.y) : null;
          if (normal) {
            ux = normal.nx;
            uy = normal.ny;
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
  const pushCrawlerExplosionShards = (ex) => {
    if (!visibleHostileNow(ex.x, ex.y)) return;
    const maxLife = Math.max(1e-3, ex.maxLife ?? 0.5);
    const t = Math.max(0, Math.min(1, (ex.life ?? 0) / maxLife));
    const baseRadius = ex.radius ?? 0.8;
    const alpha = 0.85 * t;
    const burstN = 6;
    const burstPhase = Math.max(0, Math.min(1, (1 - t) * 2));
    const burstCenterR = baseRadius * (0.18 + 0.5 * burstPhase);
    const burstLen = baseRadius * 0.55;
    const burstHalfW = baseRadius * 0.095;
    for (let i = 0; i < burstN; i++) {
      const travelA = i / burstN * Math.PI * 2 + burstPhase * 0.18;
      const cx = ex.x + Math.cos(travelA) * burstCenterR;
      const cy = ex.y + Math.sin(travelA) * burstCenterR;
      const spinDir = i & 1 ? -1 : 1;
      const a = travelA + spinDir * burstPhase * 1.3;
      const ux = Math.cos(a);
      const uy = Math.sin(a);
      const tx = -uy;
      const ty = ux;
      const tipX = cx + ux * (burstLen * 0.58);
      const tipY = cy + uy * (burstLen * 0.58);
      const baseCx = cx - ux * (burstLen * 0.42);
      const baseCy = cy - uy * (burstLen * 0.42);
      pushTri(
        pos,
        col,
        baseCx + tx * burstHalfW,
        baseCy + ty * burstHalfW,
        baseCx - tx * burstHalfW,
        baseCy - ty * burstHalfW,
        tipX,
        tipY,
        1,
        0.68,
        0.18,
        0.92 * alpha
      );
      triVerts += 3;
      pushTri(
        pos,
        col,
        cx + ux * (burstLen * 0.08),
        cy + uy * (burstLen * 0.08),
        baseCx + tx * (burstHalfW * 0.45),
        baseCy + ty * (burstHalfW * 0.45),
        baseCx - tx * (burstHalfW * 0.45),
        baseCy - ty * (burstHalfW * 0.45),
        1,
        0.95,
        0.48,
        0.55 * alpha
      );
      triVerts += 3;
    }
  };
  const pushFragmentShard = (d) => {
    const ownerType = d.ownerType || "crawler";
    const visible = ownerType === "dropship" || ownerType === "miner" || ownerType === "pilot" || ownerType === "engineer" || ownerType === "rock" ? visibleEntityNow(d.x, d.y) : visibleHostileNow(d.x, d.y);
    if (!visible) return;
    const maxLife = Math.max(1e-3, d.maxLife ?? d.life ?? 1);
    const t = Math.max(0, Math.min(1, d.life / maxLife));
    const fadeT = Math.min(1, t / 0.22);
    const base = Number.isFinite(d.cr) && Number.isFinite(d.cg) && Number.isFinite(d.cb) ? (
      /** @type {[number,number,number]} */
      [Number(d.cr), Number(d.cg), Number(d.cb)]
    ) : fragmentBaseColor(ownerType);
    const glow = brightenColor(base, 0.4);
    const len = d.size ?? 0.16 * game.ENEMY_SCALE;
    const sides = Number.isFinite(d.sides) ? Math.max(3, Math.floor(Number(d.sides))) : 0;
    if (sides >= 5) {
      triVerts += pushPolyFan(pos, col, d.x, d.y, len, sides, d.a, base[0], base[1], base[2], 0.92 * fadeT) * 3;
      triVerts += pushPolyFan(pos, col, d.x, d.y, len * 0.58, sides, d.a + 0.15, glow[0], glow[1], glow[2], 0.45 * fadeT) * 3;
      return;
    }
    const stretch = d.stretch ?? 1.7;
    const halfW = len * 0.42;
    const ux = Math.cos(d.a);
    const uy = Math.sin(d.a);
    const tx = -uy;
    const ty = ux;
    const tipX = d.x + ux * len * stretch;
    const tipY = d.y + uy * len * stretch;
    const baseCx = d.x - ux * len * 0.6;
    const baseCy = d.y - uy * len * 0.6;
    pushTri(
      pos,
      col,
      baseCx + tx * halfW,
      baseCy + ty * halfW,
      baseCx - tx * halfW,
      baseCy - ty * halfW,
      tipX,
      tipY,
      base[0],
      base[1],
      base[2],
      0.92 * fadeT
    );
    triVerts += 3;
    pushTri(
      pos,
      col,
      d.x + ux * len * 0.1,
      d.y + uy * len * 0.1,
      baseCx + tx * (halfW * 0.45),
      baseCy + ty * (halfW * 0.45),
      baseCx - tx * (halfW * 0.45),
      baseCy - ty * (halfW * 0.45),
      glow[0],
      glow[1],
      glow[2],
      0.55 * fadeT
    );
    triVerts += 3;
  };
  if (state.explosions && state.explosions.length) {
    for (const ex of state.explosions) {
      if (ex.owner !== "crawler") continue;
      pushCrawlerExplosionShards(ex);
    }
  }
  if (state.fragments && state.fragments.length) {
    for (const d of state.fragments) {
      pushFragmentShard(d);
    }
  }
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
    const liftRot = rot2(0, lift, shipRot);
    const lx = expectDefined$3(liftRot[0]);
    const ly = expectDefined$3(liftRot[1]);
    const tipRot = rot2(tipx + posUx * offset2, tipy + posUy * offset2, shipRot);
    const tx = expectDefined$3(tipRot[0]);
    const ty = expectDefined$3(tipRot[1]);
    const p1Rot = rot2(b1x + posUx * offset2, b1y + posUy * offset2, shipRot);
    const p1x = expectDefined$3(p1Rot[0]);
    const p1y = expectDefined$3(p1Rot[1]);
    const p2Rot = rot2(b2x + posUx * offset2, b2y + posUy * offset2, shipRot);
    const p2x = expectDefined$3(p2Rot[0]);
    const p2y = expectDefined$3(p2Rot[1]);
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
    if (showGameplayIndicators) {
      if (state.mothership) {
        const rotCos = Math.cos(state.mothership.angle);
        const rotSin = Math.sin(state.mothership.angle);
        const localX = -2.75;
        const localY = 1;
        const x = state.mothership.x + localX * rotCos - localY * rotSin;
        const y = state.mothership.y + localX * rotSin + localY * rotCos;
        drawOffscreenIndicator(x, y, 0.5, 0.84, 1);
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
      if (state.ship.state === "flying") {
        const thickness = state.view.radius * 8e-3;
        const isInsideMothership = (x, y) => {
          const mothership = expectDefined$3(state.mothership);
          x -= mothership.x;
          y -= mothership.y;
          const rotCos = Math.cos(mothership.angle);
          const rotSin = Math.sin(mothership.angle);
          const xLocal = x * rotCos + y * rotSin;
          const yLocal = x * rotSin + y * -rotCos;
          return yLocal < 1.2 && yLocal > -1.2 && xLocal > -4 && xLocal < 2.75;
        };
        const insideMothership = isInsideMothership(state.ship.x, state.ship.y);
        const thrustMax = planet.planetParams.THRUST * (1 + state.ship.thrust * 0.1);
        const inertialDriveThrust = game.INERTIAL_DRIVE_THRUST * (1 + state.ship.inertialDrive * 0.1);
        let vx = state.ship.vx;
        let vy = state.ship.vy;
        if (insideMothership) {
          const mothership = expectDefined$3(state.mothership);
          vx -= mothership.vx;
          vy -= mothership.vy;
        }
        const vscale = vScaleStopping(planet, state.ship.x, state.ship.y, vx, vy, thrustMax + inertialDriveThrust);
        vx *= vscale;
        vy *= vscale;
        const r1 = Math.hypot(vx, vy);
        const r0 = 0.35;
        if (r1 > r0) {
          const x1 = state.ship.x + vx;
          const y1 = state.ship.y + vy;
          const x0 = state.ship.x + vx * r0 / r1;
          const y0 = state.ship.y + vy * r0 / r1;
          pushThickLine(pos, col, x0, y0, x1, y1, thickness, 0.5, 0.84, 1, 0.5);
          triVerts += 6;
        }
        if (!insideMothership) {
          const { rPerigee, rApogee } = planet.perigeeAndApogee(state.ship.x, state.ship.y, state.ship.vx, state.ship.vy);
          const rMin = rMax - 0.5;
          if (rPerigee >= rMin) {
            const r2 = Math.hypot(state.ship.x, state.ship.y);
            const dirX = state.ship.x / r2;
            const dirY = state.ship.y / r2;
            const crossTickSize = 0.01 * state.view.radius;
            const crossX = -dirY * crossTickSize;
            const crossY = dirX * crossTickSize;
            const upX0 = dirX * thickness / 2;
            const upY0 = dirY * thickness / 2;
            const upLen2 = Math.min(2 * crossTickSize, (rApogee - rPerigee) / 2);
            const upX1 = dirX * upLen2;
            const upY1 = dirY * upLen2;
            const apoX = dirX * rApogee;
            const apoY = dirY * rApogee;
            const periX = dirX * rPerigee;
            const periY = dirY * rPerigee;
            let offsetX = -dirY * (crossTickSize + 0.35);
            let offsetY = dirX * (crossTickSize + 0.35);
            if (state.ship.x * state.ship.vy - state.ship.y * state.ship.vx < 0) {
              offsetX = -offsetX;
              offsetY = -offsetY;
            }
            pushThickLine(pos, col, apoX + offsetX - crossX, apoY + offsetY - crossY, apoX + offsetX + crossX, apoY + offsetY + crossY, thickness, 0.5, 0.84, 1, 0.5);
            pushThickLine(pos, col, periX + offsetX - crossX, periY + offsetY - crossY, periX + offsetX + crossX, periY + offsetY + crossY, thickness, 0.5, 0.84, 1, 0.5);
            pushThickLine(pos, col, apoX + offsetX - upX0, apoY + offsetY - upY0, apoX + offsetX - upX1, apoY + offsetY - upY1, thickness, 0.5, 0.84, 1, 0.5);
            pushThickLine(pos, col, periX + offsetX + upX0, periY + offsetY + upY0, periX + offsetX + upX1, periY + offsetY + upY1, thickness, 0.5, 0.84, 1, 0.5);
            triVerts += 24;
          }
        }
      }
    }
    const tc = [1, 0.55, 0.15];
    const thrusterPower = getDropshipThrusterPowers(state.input || {});
    const manualThrustersActive = thrusterPower.up > 1e-3 || thrusterPower.down > 1e-3 || thrusterPower.left > 1e-3 || thrusterPower.right > 1e-3;
    if (thrusterPower.up > 0) {
      thrustV(0, 1, tc[0], tc[1], tc[2], shipHWorld * 0.2, thrustLiftAll + thrustUpExtraDown, thrusterPower.up);
    }
    if (thrusterPower.down > 0) {
      thrustV(0, -1, tc[0], tc[1], tc[2], shipHWorld * 0.35, thrustLiftAll + thrustDownExtraUp, thrusterPower.down);
    }
    if (thrusterPower.left > 0) {
      thrustV(-1, 0, tc[0], tc[1], tc[2], shipWWorld * 0.5, thrustLiftAll, thrusterPower.left);
    }
    if (thrusterPower.right > 0) {
      thrustV(1, 0, tc[0], tc[1], tc[2], shipWWorld * 0.5, thrustLiftAll, thrusterPower.right);
    }
    if (!manualThrustersActive && state.ship.state === "flying") {
      const speed = Math.hypot(state.ship.vx, state.ship.vy);
      if (speed <= 0.18) {
        const idlePulse = 0.12 + 0.05 * (0.5 + 0.5 * Math.sin(now * 11));
        thrustV(0, 1, 0.95, 0.68, 0.22, shipHWorld * 0.14, thrustLiftAll + thrustUpExtraDown * 0.35, idlePulse);
      }
    }
  }
  if (showGameplayIndicators && state.aimWorld) {
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
      const maxLife = Math.max(1e-3, d.maxLife ?? d.life ?? 1);
      const t = Math.max(0, Math.min(1, d.life / maxLife));
      const len = d.size ?? shipHWorld * 0.18;
      const hx = Math.cos(d.a) * len;
      const hy = Math.sin(d.a) * len;
      pushLine(
        pos,
        col,
        d.x - hx,
        d.y - hy,
        d.x + hx,
        d.y + hy,
        d.cr ?? 0.9,
        d.cg ?? 0.9,
        d.cb ?? 0.9,
        (d.alpha ?? 0.9) * t
      );
      lineVerts += 2;
    }
  }
  if (state.explosions && state.explosions.length) {
    for (const ex of state.explosions) {
      if (!visibleHostileNow(ex.x, ex.y)) continue;
      const maxLife = Math.max(1e-3, ex.maxLife ?? 0.5);
      const t = Math.max(0, Math.min(1, ex.life / maxLife));
      const baseRadius = ex.radius ?? 0.8;
      if (ex.owner === "crawler") {
        const ringR = baseRadius * (0.4 + (1 - t) * 0.52);
        const alpha = 0.85 * t;
        const seg = 14;
        for (let i = 0; i < seg; i++) {
          const a0 = i / seg * Math.PI * 2;
          const a1 = (i + 1) / seg * Math.PI * 2;
          const wobble0 = 0.88 + 0.16 * Math.sin((1 - t) * 12 + i * 0.9);
          const wobble1 = 0.88 + 0.16 * Math.sin((1 - t) * 12 + (i + 1) * 0.9);
          const x0 = ex.x + Math.cos(a0) * ringR * wobble0;
          const y0 = ex.y + Math.sin(a0) * ringR * wobble0;
          const x1 = ex.x + Math.cos(a1) * ringR * wobble1;
          const y1 = ex.y + Math.sin(a1) * ringR * wobble1;
          pushLine(pos, col, x0, y0, x1, y1, 1, 0.7, 0.2, alpha);
          lineVerts += 2;
        }
        const spokeR = ringR * (0.35 + 0.25 * (1 - t));
        const spokeOuter = Math.min(baseRadius, ringR * 1.08);
        for (let i = 0; i < 4; i++) {
          const a = i * Math.PI * 0.5 + (1 - t) * 0.35;
          const ix = ex.x + Math.cos(a) * spokeR;
          const iy = ex.y + Math.sin(a) * spokeR;
          const ox = ex.x + Math.cos(a) * spokeOuter;
          const oy = ex.y + Math.sin(a) * spokeOuter;
          pushLine(pos, col, ix, iy, ox, oy, 1, 0.95, 0.5, 0.95 * alpha);
          lineVerts += 2;
        }
      } else {
        const r2 = baseRadius * (0.4 + (1 - t) * 0.75);
        pushLine(pos, col, ex.x - r2, ex.y, ex.x + r2, ex.y, 1, 0.5, 0.3, 0.8 * t);
        pushLine(pos, col, ex.x, ex.y - r2, ex.x, ex.y + r2, 1, 0.5, 0.3, 0.8 * t);
        lineVerts += 4;
      }
    }
  }
  if (state.entityExplosions && state.entityExplosions.length) {
    for (const ex of state.entityExplosions) {
      if (!visibleHostileNow(ex.x, ex.y)) continue;
      const t = Math.max(0, Math.min(1, ex.life / 0.8));
      const r2 = (ex.radius ?? 1) * (0.4 + (1 - t) * 0.9);
      const alpha = 0.9 * t;
      const er = Number.isFinite(ex.cr) ? Number(ex.cr) : 1;
      const eg = Number.isFinite(ex.cg) ? Number(ex.cg) : 0.9;
      const eb = Number.isFinite(ex.cb) ? Number(ex.cb) : 0.4;
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
        pushLine(pos, col, x0, y0, x1, y1, er, eg, eb, alpha);
        lineVerts += 2;
      }
      pushLine(pos, col, ex.x - r2 * 0.6, ex.y, ex.x + r2 * 0.6, ex.y, Math.min(1, er), Math.min(1, expectDefined$3(eg) + 0.05), Math.min(1, expectDefined$3(eb) + 0.08), 0.7 * alpha);
      pushLine(pos, col, ex.x, ex.y - r2 * 0.6, ex.x, ex.y + r2 * 0.6, Math.min(1, er), Math.min(1, expectDefined$3(eg) + 0.05), Math.min(1, expectDefined$3(eb) + 0.08), 0.7 * alpha);
      lineVerts += 4;
    }
  }
  if (props && props.length) {
    for (const p of props) {
      if (p.dead || typeof p.hp === "number" && p.hp <= 0) continue;
      if (p.type !== "bubble_hex") continue;
      if (!visibleEntityNow(p.x, p.y)) continue;
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
      if (!visibleEntityNow(p.x, p.y)) continue;
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
      if (!visibleEntityNow(p.x, p.y)) continue;
      const life = p.life ?? 0;
      const lifeN = p.maxLife && p.maxLife > 0 ? Math.max(0, Math.min(1, life / p.maxLife)) : 1;
      const radius = (p.size || 0.08) * (1 + (1 - lifeN) * 0.35);
      const alpha = 0.3 + 0.58 * lifeN;
      pushHexOutline(pos, col, p.x, p.y, radius, p.rot || 0, 0.8, 0.95, 1, alpha);
      lineVerts += 12;
    }
  }
  if (state.debugMinerGuidePath && state.ship && state.ship.state === "landed" && state.ship.guidePath && state.ship.guidePath.path && state.ship.guidePath.path.length > 0) {
    const path = state.ship.guidePath.path;
    for (let i = 1; i < path.length; ++i) {
      const p0 = expectDefined$3(path[i - 1]);
      const p1 = expectDefined$3(path[i]);
      pushLine(pos, col, p0.x, p0.y, p1.x, p1.y, 1, 0.9, 0.1, 0.85);
      lineVerts += 2;
    }
    if (state.debugMinerPathToMiner && state.debugMinerPathToMiner.length > 1) {
      const minerPath = state.debugMinerPathToMiner;
      for (let i = 1; i < minerPath.length; i++) {
        const p0 = expectDefined$3(minerPath[i - 1]);
        const p1 = expectDefined$3(minerPath[i]);
        pushLine(pos, col, p0.x, p0.y, p1.x, p1.y, 0.2, 0.95, 0.25, 0.98);
        lineVerts += 2;
      }
    }
    const idxRaw = Math.max(0, Math.min(path.length - 1, Number(state.ship.guidePath.indexClosest) || 0));
    let pShip = null;
    if (path.length === 1) {
      pShip = path[0];
    } else {
      let i0 = Math.floor(idxRaw);
      let u = idxRaw - i0;
      if (i0 >= path.length - 1) {
        i0 = path.length - 2;
        u = 1;
      }
      const p0 = expectDefined$3(path[Math.max(0, i0)]);
      const p1 = expectDefined$3(path[Math.min(path.length - 1, i0 + 1)]);
      pShip = {
        x: p0.x + (p1.x - p0.x) * u,
        y: p0.y + (p1.y - p0.y) * u
      };
    }
    if (pShip) {
      pushLine(pos, col, state.ship.x, state.ship.y, pShip.x, pShip.y, 0.2, 0.95, 1, 0.95);
      lineVerts += 2;
    }
  }
  lineVerts = pos.length / 2 - triVerts;
  const dbgSamples = state.debugCollisionSamples || state.ship._samples;
  const landingDbg = state.ship._landingDebug || null;
  const debugCollisionSeeds = [];
  const addDebugSeed = (x, y) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    for (const s2 of debugCollisionSeeds) {
      if (Math.hypot(s2.x - x, s2.y - y) <= 1e-4) return;
    }
    const av = planet.airValueAtWorld(x, y);
    debugCollisionSeeds.push({ x, y, av, air: av > 0.5 });
  };
  if (dbgSamples) {
    for (const [sxw, syw, air, av] of dbgSamples) {
      debugCollisionSeeds.push({ x: sxw, y: syw, air: !!air, av });
    }
  }
  if (landingDbg) {
    if (Number.isFinite(landingDbg.impactX) && Number.isFinite(landingDbg.impactY)) {
      addDebugSeed(Number(landingDbg.impactX), Number(landingDbg.impactY));
    }
    if (Number.isFinite(landingDbg.supportX) && Number.isFinite(landingDbg.supportY)) {
      addDebugSeed(Number(landingDbg.supportX), Number(landingDbg.supportY));
    }
  }
  if ((state.debugCollisions || state.debugCollisionContours) && state.ship) {
    if (dbgSamples && dbgSamples.length >= 4) {
      let nHull = dbgSamples.length;
      const last = expectDefined$3(dbgSamples[dbgSamples.length - 1]);
      if (Math.hypot(last[0] - state.ship.x, last[1] - state.ship.y) < 1e-5) {
        nHull = Math.max(0, nHull - 1);
      }
      if (nHull >= 3) {
        for (let i = 0; i < nHull; i++) {
          const a = expectDefined$3(dbgSamples[i]);
          const b = expectDefined$3(dbgSamples[(i + 1) % nHull]);
          pushLine(pos, col, a[0], a[1], b[0], b[1], 0.2, 0.95, 1, 0.7);
          lineVerts += 2;
        }
      } else {
        const cx = state.ship.x;
        const cy = state.ship.y;
        const r2 = Number.isFinite(state.ship._shipRadius) ? Number(state.ship._shipRadius) : 0;
        if (Number.isFinite(cx) && Number.isFinite(cy) && r2 > 0) {
          const segs = 28;
          for (let i = 0; i < segs; i++) {
            const a0 = i / segs * Math.PI * 2;
            const a1 = (i + 1) / segs * Math.PI * 2;
            const x0 = cx + Math.cos(a0) * r2;
            const y0 = cy + Math.sin(a0) * r2;
            const x1 = cx + Math.cos(a1) * r2;
            const y1 = cy + Math.sin(a1) * r2;
            pushLine(pos, col, x0, y0, x1, y1, 0.2, 0.95, 1, 0.7);
            lineVerts += 2;
          }
        }
      }
    } else {
      const cx = state.ship.x;
      const cy = state.ship.y;
      const r2 = Number.isFinite(state.ship._shipRadius) ? Number(state.ship._shipRadius) : 0;
      if (Number.isFinite(cx) && Number.isFinite(cy) && r2 > 0) {
        const segs = 28;
        for (let i = 0; i < segs; i++) {
          const a0 = i / segs * Math.PI * 2;
          const a1 = (i + 1) / segs * Math.PI * 2;
          const x0 = cx + Math.cos(a0) * r2;
          const y0 = cy + Math.sin(a0) * r2;
          const x1 = cx + Math.cos(a1) * r2;
          const y1 = cy + Math.sin(a1) * r2;
          pushLine(pos, col, x0, y0, x1, y1, 0.2, 0.95, 1, 0.7);
          lineVerts += 2;
        }
      }
    }
  }
  if (state.debugCollisions) {
    for (const s2 of debugCollisionSeeds) {
      pos.push(s2.x, s2.y);
      if (s2.air) col.push(0.45, 1, 0.55, 0.9);
      else col.push(1, 0.3, 0.3, 0.9);
      pointVerts += 1;
    }
  }
  const findTriAtOrNear = (x, y) => {
    if (!planet.radial || typeof planet.radial.findTriAtWorld !== "function") return null;
    let tri = planet.radial.findTriAtWorld(x, y);
    if (tri) return tri;
    const r2 = Math.hypot(x, y) || 1;
    const ux = x / r2;
    const uy = y / r2;
    const tx = -uy;
    const ty = ux;
    const dirs = [[ux, uy], [-ux, -uy], [tx, ty], [-tx, -ty]];
    const probe = [0.02, 0.05, 0.1, 0.18];
    for (const d of probe) {
      for (const dir of dirs) {
        tri = planet.radial.findTriAtWorld(x + dir[0] * d, y + dir[1] * d);
        if (tri) return tri;
      }
    }
    return null;
  };
  if (state.debugCollisionContours && debugCollisionSeeds.length && planet.radial && typeof planet.radial.findTriAtWorld === "function") {
    const testedTris = [];
    for (const s2 of debugCollisionSeeds) {
      const sxw = s2.x;
      const syw = s2.y;
      const tri = findTriAtOrNear(sxw, syw);
      if (!tri) continue;
      if (testedTris.indexOf(tri) < 0) testedTris.push(tri);
      if (!state.debugCollisions) {
        pos.push(sxw, syw);
        if (s2.air) col.push(0.45, 1, 0.55, 0.9);
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
      const a = expectDefined$3(tri[0]);
      const b = expectDefined$3(tri[1]);
      const c = expectDefined$3(tri[2]);
      pushTriangleOutline(pos, col, a.x, a.y, b.x, b.y, c.x, c.y, 0.25, 0.65, 1, 0.25);
      lineVerts += 6;
      const seg = triIsoSegment(tri, 0.5);
      if (!seg) continue;
      pushLine(pos, col, seg[0][0], seg[0][1], seg[1][0], seg[1][1], 1, 0.95, 0.2, 0.95);
      lineVerts += 2;
    }
  }
  if (state.debugCollisionContours && debugCollisionSeeds.length && state.mothership) {
    const mothership = state.mothership;
    const boundaryEdges = getMothershipBoundaryEdges(mothership);
    const edgeHintDist = Math.max(0.12, (mothership.spacing || 0.4) * 0.7);
    const edgeHintDist2 = edgeHintDist * edgeHintDist;
    const hintedEdges = /* @__PURE__ */ new Map();
    for (const s2 of debugCollisionSeeds) {
      const lp = worldToMothershipLocal(mothership, s2.x, s2.y);
      let nearestIdx = -1;
      let nearest = null;
      let nearestD2 = Infinity;
      for (let i = 0; i < boundaryEdges.length; i++) {
        const edge = expectDefined$3(boundaryEdges[i]);
        const cp = closestPointOnSegment$1(edge.ax, edge.ay, edge.bx, edge.by, lp.x, lp.y);
        if (cp.d2 < nearestD2) {
          nearestD2 = cp.d2;
          nearestIdx = i;
          nearest = cp;
        }
        if (cp.d2 <= edgeHintDist2) {
          const prev = hintedEdges.get(i);
          if (!prev || cp.d2 < prev.cp.d2) {
            hintedEdges.set(i, { cp, seed: { x: s2.x, y: s2.y } });
          }
        }
      }
      if (nearestIdx >= 0 && nearest) {
        const prev = hintedEdges.get(nearestIdx);
        if (!prev || nearest.d2 < prev.cp.d2) {
          hintedEdges.set(nearestIdx, { cp: nearest, seed: { x: s2.x, y: s2.y } });
        }
      }
    }
    let drawn = 0;
    for (const [edgeIdx, hint] of hintedEdges) {
      if (drawn >= 16) break;
      const edge = boundaryEdges[edgeIdx];
      if (!edge) continue;
      const aw = mothershipLocalToWorld(mothership, edge.ax, edge.ay);
      const bw = mothershipLocalToWorld(mothership, edge.bx, edge.by);
      pushLine(pos, col, aw.x, aw.y, bw.x, bw.y, 1, 0.55, 0.15, 0.95);
      lineVerts += 2;
      const cpw = mothershipLocalToWorld(mothership, hint.cp.x, hint.cp.y);
      pushLine(pos, col, hint.seed.x, hint.seed.y, cpw.x, cpw.y, 1, 0.9, 0.2, 0.65);
      lineVerts += 2;
      pushSquareOutline(pos, col, cpw.x, cpw.y, 0.035, 1, 0.9, 0.2, 0.95);
      lineVerts += 8;
      const nw = mothershipLocalDirToWorld(mothership, edge.nx, edge.ny);
      const nScale = Math.max(0.06, (mothership.spacing || 0.4) * 0.18);
      pushLine(pos, col, cpw.x, cpw.y, cpw.x + nw.x * nScale, cpw.y + nw.y * nScale, 0.2, 1, 0.95, 0.9);
      lineVerts += 2;
      drawn += 1;
    }
    const diagEvidence = landingDbg && landingDbg.collisionDiag && landingDbg.collisionDiag.evidence ? landingDbg.collisionDiag.evidence : null;
    if (diagEvidence && Array.isArray(diagEvidence.hits) && diagEvidence.hits.length) {
      const exactEdgeSet = /* @__PURE__ */ new Set();
      const exactTriSet = /* @__PURE__ */ new Set();
      for (const hit of diagEvidence.hits) {
        if (!hit || !Number.isFinite(hit.edgeIdx)) continue;
        const edgeIdx = (
          /** @type {number} */
          hit.edgeIdx
        );
        exactEdgeSet.add(edgeIdx);
        const edge = boundaryEdges[edgeIdx];
        if (!edge) continue;
        if (Number.isFinite(edge.solidTriIdx) && edge.solidTriIdx >= 0) exactTriSet.add(edge.solidTriIdx);
        if (Number.isFinite(edge.airTriIdx) && edge.airTriIdx >= 0) exactTriSet.add(edge.airTriIdx);
      }
      for (const triIdx of exactTriSet) {
        const tri = mothership.tris && mothership.tris[triIdx];
        if (!tri || tri.length < 3) continue;
        const a0 = mothership.points[tri[0]];
        const b0 = mothership.points[tri[1]];
        const c0 = mothership.points[tri[2]];
        if (!a0 || !b0 || !c0) continue;
        const a = {
          x: mothership.x + Math.cos(mothership.angle) * a0.x - Math.sin(mothership.angle) * a0.y,
          y: mothership.y + Math.sin(mothership.angle) * a0.x + Math.cos(mothership.angle) * a0.y
        };
        const b = {
          x: mothership.x + Math.cos(mothership.angle) * b0.x - Math.sin(mothership.angle) * b0.y,
          y: mothership.y + Math.sin(mothership.angle) * b0.x + Math.cos(mothership.angle) * b0.y
        };
        const c = {
          x: mothership.x + Math.cos(mothership.angle) * c0.x - Math.sin(mothership.angle) * c0.y,
          y: mothership.y + Math.sin(mothership.angle) * c0.x + Math.cos(mothership.angle) * c0.y
        };
        pushTriangleOutline(pos, col, a.x, a.y, b.x, b.y, c.x, c.y, 1, 0.15, 0.75, 0.95);
        lineVerts += 6;
      }
      for (const edgeIdx of exactEdgeSet) {
        const edge = boundaryEdges[edgeIdx];
        if (!edge) continue;
        const aw = mothershipLocalToWorld(mothership, edge.ax, edge.ay);
        const bw = mothershipLocalToWorld(mothership, edge.bx, edge.by);
        pushLine(pos, col, aw.x, aw.y, bw.x, bw.y, 1, 1, 0, 1);
        lineVerts += 2;
        const mx = (edge.ax + edge.bx) * 0.5;
        const my = (edge.ay + edge.by) * 0.5;
        const mw = mothershipLocalToWorld(mothership, mx, my);
        const nw = mothershipLocalDirToWorld(mothership, edge.nx, edge.ny);
        const nScale = Math.max(0.08, (mothership.spacing || 0.4) * 0.22);
        pushLine(pos, col, mw.x, mw.y, mw.x + nw.x * nScale, mw.y + nw.y * nScale, 1, 1, 0, 1);
        lineVerts += 2;
      }
    }
  }
  const dbg = state.debugPoints;
  if (state.debugRingVertices && dbg) {
    for (const [sxw, syw, air, av] of dbg) {
      pos.push(sxw, syw);
      if (air) col.push(0.83, 0.83, 0.83, 0.95);
      else col.push(0.58, 0.42, 0.24, 0.95);
      pointVerts += 1;
    }
  }
  if (state.debugCollisions && state.debugNodes && dbg && !state.debugRingVertices) {
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
      const a = expectDefined$3(c.tri[0]);
      const b = expectDefined$3(c.tri[1]);
      const d = expectDefined$3(c.tri[2]);
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
  if (state.debugCollisions && landingDbg) {
    const ix = landingDbg.impactX;
    const iy = landingDbg.impactY;
    if (Number.isFinite(ix) && Number.isFinite(iy)) {
      pos.push(Number(ix), Number(iy));
      col.push(1, 0.55, 0.1, 1);
      pointVerts += 1;
    }
    const sx2 = landingDbg.supportX;
    const sy2 = landingDbg.supportY;
    if (Number.isFinite(sx2) && Number.isFinite(sy2)) {
      pos.push(Number(sx2), Number(sy2));
      col.push(0.2, 1, 1, 1);
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
  if (showGameplayIndicators && state.touchUi) {
    const linePos = [];
    const lineCol = [];
    const w = canvas2.width;
    const h = canvas2.height;
    const minDim = Math.max(1, Math.min(w, h));
    const toPx = (nx, ny) => {
      return { x: nx * w, y: (1 - ny) * h };
    };
    const toClampedPx = (center, touch, maxOffset) => {
      const base = toPx(center.x, center.y);
      if (!touch) {
        return base;
      }
      const touchPx = toPx(touch.x, touch.y);
      let dx = touchPx.x - base.x;
      let dy = touchPx.y - base.y;
      const len = Math.hypot(dx, dy);
      if (len > maxOffset && len > 1e-4) {
        const scale = maxOffset / len;
        dx *= scale;
        dy *= scale;
      }
      return { x: base.x + dx, y: base.y + dy };
    };
    const leftCenter = state.touchUi.leftCenter || TOUCH_UI.left;
    const laserCenter = state.touchUi.laserCenter || TOUCH_UI.laser;
    const bombCenter = state.touchUi.bombCenter || TOUCH_UI.bomb;
    const left = toPx(leftCenter.x, leftCenter.y);
    const leftRadius = TOUCH_UI.left.r * minDim;
    const laser = toPx(laserCenter.x, laserCenter.y);
    const laserSize = TOUCH_UI.laser.r * minDim;
    pushDiamondOutline(linePos, lineCol, laser.x, laser.y, laserSize, 0.95, 0.95, 0.95, 0.9);
    const bomb = toPx(bombCenter.x, bombCenter.y);
    const bombSize = TOUCH_UI.bomb.r * minDim;
    pushSquareOutline(linePos, lineCol, bomb.x, bomb.y, bombSize, 1, 0.75, 0.2, 0.9);
    pushCircle(linePos, lineCol, left.x, left.y, leftRadius, 1, 0.55, 0.15, 0.9, 64);
    if (state.touchUi.leftTouch) {
      const touch = toClampedPx(leftCenter, state.touchUi.leftTouch, leftRadius * 0.65);
      pushLine(linePos, lineCol, left.x, left.y, touch.x, touch.y, 1, 0.4, 0.15, 0.9);
      pushCircle(linePos, lineCol, touch.x, touch.y, leftRadius * 0.42, 1, 0.82, 0.3, 0.95, 32);
    }
    if (state.touchUi.laserTouch) {
      const touch = toClampedPx(laserCenter, state.touchUi.laserTouch, laserSize * 0.75);
      pushLine(linePos, lineCol, laser.x, laser.y, touch.x, touch.y, 0.95, 0.95, 0.95, 0.85);
      pushDiamondOutline(linePos, lineCol, touch.x, touch.y, laserSize * 0.68, 0.95, 0.95, 0.95, 0.98);
    }
    if (state.touchUi.bombTouch) {
      const touch = toClampedPx(bombCenter, state.touchUi.bombTouch, bombSize * 0.75);
      pushLine(linePos, lineCol, bomb.x, bomb.y, touch.x, touch.y, 1, 0.75, 0.2, 0.9);
      pushSquareOutline(linePos, lineCol, touch.x, touch.y, bombSize * 0.68, 1, 0.82, 0.3, 0.98);
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
  if (showGameplayIndicators && state.touchStart) {
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
      const restartTriScale = touchStartMode === "restartGame" ? 0.84 : 1;
      const triLeft = centerX - radius * 0.28 * restartTriScale;
      const triRight = centerX + radius * 0.4 * restartTriScale;
      const triTop = centerY + radius * 0.4 * restartTriScale;
      const triBottom = centerY - radius * 0.4 * restartTriScale;
      pushTriangleOutline(linePos, lineCol, triLeft, triTop, triRight, centerY, triLeft, triBottom, iconR, iconG, iconB, iconA);
      if (touchStartMode === "respawnShip") {
        const d = radius * 0.16;
        const px = centerX + radius * 0.28;
        const py = centerY - radius * 0.28;
        pushLine(linePos, lineCol, px - d, py, px + d, py, iconR, iconG, iconB, iconA);
        pushLine(linePos, lineCol, px, py - d, px, py + d, iconR, iconG, iconB, iconA);
      } else if (touchStartMode === "restartGame") {
        const triMidLeftY = (triTop + triBottom) * 0.5;
        const spiralStartX = triLeft - radius * 0.04;
        const spiralStartY = triBottom - radius * 0.16;
        const spiralLowerRightX = triRight;
        const spiralLowerRightY = centerY - radius * 0.08;
        const spiralTopX = triLeft + radius * 0.1;
        const spiralTopY = triTop;
        const spiralMidLeftX = triLeft - radius * 0.26;
        const spiralMidLeftY = triMidLeftY;
        pushLine(linePos, lineCol, spiralStartX, spiralStartY, spiralLowerRightX, spiralLowerRightY, iconR, iconG, iconB, iconA);
        pushLine(linePos, lineCol, spiralLowerRightX, spiralLowerRightY, spiralTopX, spiralTopY, iconR, iconG, iconB, iconA);
        pushLine(linePos, lineCol, spiralTopX, spiralTopY, spiralMidLeftX, spiralMidLeftY, iconR, iconG, iconB, iconA);
        pushLine(linePos, lineCol, spiralMidLeftX, spiralMidLeftY, triLeft, triMidLeftY, iconR, iconG, iconB, iconA);
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
    const glMaybe = canvas2.getContext("webgl2", {
      antialias: !PERF_FLAGS.disableMsaa,
      premultipliedAlpha: false
    });
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
    const dpr = getEffectiveDevicePixelRatio();
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
    this.leftControl = { id: null, pos: null, start: null, center: null };
    this.laserControl = { id: null, pos: null, start: null, center: null };
    this.bombControl = { id: null, pos: null, start: null, center: null };
    this.startControl = { id: null, downAt: 0, triggered: false };
    this.touchRestartControl = { id: null, downAt: 0, triggered: false };
    this.oneshot = {
      regen: false,
      toggleDebug: false,
      toggleDevHud: false,
      toggleFrameStep: false,
      togglePlanetView: false,
      toggleRingVertices: false,
      togglePlanetTriangles: false,
      toggleCollisionContours: false,
      toggleMinerGuidePath: false,
      toggleFog: false,
      toggleMusic: false,
      toggleCombatMusic: false,
      musicVolumeUp: false,
      musicVolumeDown: false,
      sfxVolumeUp: false,
      sfxVolumeDown: false,
      copyScreenshot: false,
      copyScreenshotClean: false,
      copyScreenshotCleanTitle: false,
      reset: false,
      abandonRun: false,
      nextLevel: false,
      prevLevel: false,
      promptLevelJump: false,
      zoomReset: false,
      shoot: false,
      bomb: false,
      rescueAll: false,
      killAllEnemies: false,
      removeEntities: false,
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
    this.zoomDelta = 0;
    this.HOLD_ABANDON_MS = 1e3;
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
    canvas2.addEventListener("wheel", (e) => this._onWheel(e), { passive: false });
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
      this.leftControl.center = null;
      this.laserControl.id = null;
      this.laserControl.pos = null;
      this.laserControl.start = null;
      this.laserControl.center = null;
      this.bombControl.id = null;
      this.bombControl.pos = null;
      this.bombControl.start = null;
      this.bombControl.center = null;
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
      this.oneshot.zoomReset = false;
      this.oneshot.rescueAll = false;
      this.oneshot.killAllEnemies = false;
      this.oneshot.removeEntities = false;
      this.oneshot.musicVolumeUp = false;
      this.oneshot.musicVolumeDown = false;
      this.oneshot.sfxVolumeUp = false;
      this.oneshot.sfxVolumeDown = false;
      this.oneshot.copyScreenshot = false;
      this.oneshot.copyScreenshotClean = false;
      this.oneshot.copyScreenshotCleanTitle = false;
      this.zoomDelta = 0;
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
    this.leftControl.center = null;
    this.laserControl.id = null;
    this.laserControl.pos = null;
    this.laserControl.start = null;
    this.laserControl.center = null;
    this.bombControl.id = null;
    this.bombControl.pos = null;
    this.bombControl.start = null;
    this.bombControl.center = null;
    this.startControl.id = null;
    this.startControl.downAt = 0;
    this.startControl.triggered = false;
    this._clearTouchRestartControl();
    this.mouseShootHeld = false;
    this.prevPadShoot = false;
    this.prevPadBomb = false;
    this.prevPadReset = false;
    this.zoomDelta = 0;
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
   * Enable/disable debug keyboard commands (except Alt+\ and screenshot shortcuts).
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
    button.setAttribute("aria-label", "Hold 1 second to abandon run");
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
    const debugDigitChar = code.charAt(5);
    const debugDigit = code.startsWith("Digit") && code.length === 6 && debugDigitChar >= "1" && debugDigitChar <= "9";
    const debugToggleHud = debugChord && code === "Backslash";
    const screenshotTitleShortcut = debugChord && code === "KeyZ";
    const debugAction = debugChord && (code === "KeyM" || code === "KeyI" || code === "KeyK" || code === "KeyN" || code === "KeyL" || code === "KeyV" || code === "KeyG" || code === "KeyH" || code === "KeyT" || code === "KeyY" || code === "KeyU" || code === "KeyF" || code === "KeyC" || code === "KeyP" || code === "KeyX" || code === "KeyZ" || debugDigit);
    const debugShortcut = debugToggleHud || debugAction || screenshotTitleShortcut;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "Space"].includes(key)) e.preventDefault();
    if (debugShortcut) e.preventDefault();
    if (!this.keys.has(key)) this.justPressed.add(key);
    this.keys.add(key);
    this.lastInputType = "keyboard";
    if (debugToggleHud) this.oneshot.toggleDevHud = true;
    if (this.debugCommandsEnabled && debugChord && code === "KeyM") this.oneshot.regen = true;
    if (this.debugCommandsEnabled && debugChord && code === "KeyI") this.oneshot.toggleDebug = true;
    if (this.debugCommandsEnabled && debugChord && code === "KeyK") this.oneshot.promptLevelJump = true;
    if (this.debugCommandsEnabled && debugChord && code === "KeyL") this.oneshot.toggleFrameStep = true;
    if (this.debugCommandsEnabled && debugChord && code === "KeyN") {
      if (e.shiftKey) this.oneshot.prevLevel = true;
      else this.oneshot.nextLevel = true;
    }
    if (code === "Digit0" && !e.ctrlKey && !e.metaKey && !e.altKey) {
      this.oneshot.zoomReset = true;
    }
    if (key === "r" || key === "R") {
      if (!e.shiftKey) this.oneshot.reset = true;
    }
    if (this.debugCommandsEnabled && debugChord && code === "KeyV") this.oneshot.togglePlanetView = true;
    if (this.debugCommandsEnabled && debugChord && code === "KeyG") this.oneshot.toggleRingVertices = true;
    if (this.debugCommandsEnabled && debugChord && code === "KeyH") this.oneshot.toggleRingVertices = true;
    if (this.debugCommandsEnabled && debugChord && code === "KeyT") this.oneshot.togglePlanetTriangles = true;
    if (this.debugCommandsEnabled && debugChord && code === "KeyY") this.oneshot.toggleCollisionContours = true;
    if (this.debugCommandsEnabled && debugChord && code === "KeyU") this.oneshot.toggleMinerGuidePath = true;
    if (this.debugCommandsEnabled && debugChord && code === "KeyF") this.oneshot.toggleFog = true;
    if (debugChord && code === "KeyC") {
      if (e.shiftKey) this.oneshot.copyScreenshotClean = true;
      else this.oneshot.copyScreenshot = true;
    }
    if (screenshotTitleShortcut) this.oneshot.copyScreenshotCleanTitle = true;
    if ((key === "-" || key === "_") && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (e.shiftKey) this.oneshot.sfxVolumeDown = true;
      else this.oneshot.musicVolumeDown = true;
    }
    if ((key === "=" || key === "+") && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (e.shiftKey) this.oneshot.sfxVolumeUp = true;
      else this.oneshot.musicVolumeUp = true;
    }
    if ((key === "m" || key === "M" || key === "b" || key === "B") && !e.ctrlKey && !e.metaKey && !e.altKey) {
      this.oneshot.toggleMusic = true;
    }
    if (key === "j" || key === "J") this.oneshot.toggleCombatMusic = true;
    if (this.debugCommandsEnabled && debugChord && debugDigit) this.oneshot.spawnEnemyType = /** @type {"1"|"2"|"3"|"4"|"5"} */
    debugDigitChar;
    if (this.debugCommandsEnabled && debugChord && code === "KeyP") this.oneshot.rescueAll = true;
    if (this.debugCommandsEnabled && debugChord && code === "KeyX") this.oneshot.killAllEnemies = true;
    if (this.debugCommandsEnabled && debugChord && code === "KeyE") this.oneshot.removeEntities = true;
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
    const x = (e.clientX - rect.left) / Math.max(1, rect.width);
    const y = (e.clientY - rect.top) / Math.max(1, rect.height);
    return {
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y))
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
   * @param {{id:number|null,pos:Point|null,start:Point|null,center:Point|null}} control
   * @param {number} pointerId
   * @param {Point} p
   * @returns {void}
   */
  _captureTouchControl(control, pointerId, p) {
    control.id = pointerId;
    control.pos = p;
    control.start = p;
    control.center = { x: p.x, y: p.y };
  }
  /**
   * @param {{id:number|null,pos:Point|null,start:Point|null,center:Point|null}} control
   * @returns {void}
   */
  _releaseTouchControl(control) {
    control.id = null;
    control.pos = null;
    control.start = null;
    control.center = null;
  }
  /**
   * @param {{id:number|null,pos:Point|null,start:Point|null,center:Point|null}|null|undefined} control
   * @param {Point} fallback
   * @returns {Point}
   */
  _touchControlCenter(control, fallback) {
    const center = control == null ? void 0 : control.center;
    if (center) return center;
    return fallback;
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
    if (this.leftControl.id === null && this._inCircle(p, TOUCH_UI.left, TOUCH_UI.left.r * TOUCH_UI.activationScale)) {
      this._captureTouchControl(this.leftControl, e.pointerId, p);
    } else if (this.laserControl.id === null && this._inDiamond(p, TOUCH_UI.laser, TOUCH_UI.laser.r * TOUCH_UI.activationScale)) {
      this._captureTouchControl(this.laserControl, e.pointerId, p);
    } else if (this.bombControl.id === null && this._inSquare(p, TOUCH_UI.bomb, TOUCH_UI.bomb.r * TOUCH_UI.activationScale)) {
      this._captureTouchControl(this.bombControl, e.pointerId, p);
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
      this._releaseTouchControl(this.leftControl);
    } else if (this.laserControl.id === e.pointerId) {
      this._releaseTouchControl(this.laserControl);
    } else if (this.bombControl.id === e.pointerId) {
      const start = this.bombControl.start;
      const pos = this.bombControl.pos;
      const center = this._touchControlCenter(this.bombControl, TOUCH_UI.bomb);
      if (start && pos) {
        const dx = pos.x - start.x;
        const dy = pos.y - start.y;
        const moved = Math.hypot(dx, dy);
        if (moved >= TOUCH_UI.dead) {
          this.oneshot.bomb = true;
          this.bombReleaseFrom = { x: center.x, y: center.y };
          this.bombReleaseTo = { x: pos.x, y: pos.y };
        }
      }
      this._releaseTouchControl(this.bombControl);
    }
  }
  /**
   * @param {WheelEvent} e
   * @returns {void}
   */
  _onWheel(e) {
    if (this.modalOpen) return;
    e.preventDefault();
    let modeScale = 1;
    if (e.deltaMode === 1) modeScale = 3;
    else if (e.deltaMode === 2) modeScale = 24;
    const delta = e.deltaY / 100 * modeScale;
    if (!Number.isFinite(delta) || Math.abs(delta) < 1e-4) return;
    this.zoomDelta = Math.max(-8, Math.min(8, this.zoomDelta + delta));
    this.lastInputType = "mouse";
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
    const leftCenter = this._touchControlCenter(this.leftControl, TOUCH_UI.left);
    const laserCenter = this._touchControlCenter(this.laserControl, TOUCH_UI.laser);
    const bombCenter = this._touchControlCenter(this.bombControl, TOUCH_UI.bomb);
    this.aimTouchShoot = null;
    this.aimTouchBomb = null;
    this.aimTouchShootFrom = null;
    this.aimTouchShootTo = null;
    this.aimTouchBombFrom = null;
    this.aimTouchBombTo = null;
    const dead = TOUCH_UI.dead;
    if (this.leftControl.id !== null && this.leftControl.pos) {
      const dx = this.leftControl.pos.x - leftCenter.x;
      const dy = this.leftControl.pos.y - leftCenter.y;
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
    this.aimTouchShoot = aimFromControl(this.laserControl, laserCenter);
    this.aimTouchBomb = aimFromControl(this.bombControl, bombCenter);
    if (this.laserControl.id !== null && this.laserControl.pos && this.aimTouchShoot) {
      this.aimTouchShootFrom = { x: laserCenter.x, y: laserCenter.y };
      this.aimTouchShootTo = { x: this.laserControl.pos.x, y: this.laserControl.pos.y };
    }
    if (this.bombControl.id !== null && this.bombControl.pos && this.aimTouchBomb) {
      this.aimTouchBombFrom = { x: bombCenter.x, y: bombCenter.y };
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
      const ax0 = (pad.axes && pad.axes.length ? pad.axes[0] : 0) ?? 0;
      const ax1 = (pad.axes && pad.axes.length > 1 ? pad.axes[1] : 0) ?? 0;
      const ax2 = (pad.axes && pad.axes.length > 2 ? pad.axes[2] : 0) ?? 0;
      const ax3 = (pad.axes && pad.axes.length > 3 ? pad.axes[3] : 0) ?? 0;
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
        toggleRingVertices: false,
        togglePlanetTriangles: false,
        toggleCollisionContours: false,
        toggleMinerGuidePath: false,
        toggleFog: false,
        toggleMusic: false,
        toggleCombatMusic: false,
        musicVolumeUp: false,
        musicVolumeDown: false,
        sfxVolumeUp: false,
        sfxVolumeDown: false,
        copyScreenshot: false,
        copyScreenshotClean: false,
        copyScreenshotCleanTitle: false,
        nextLevel: false,
        prevLevel: false,
        promptLevelJump: false,
        zoomReset: false,
        shootHeld: false,
        shootPressed: false,
        shoot: false,
        bomb: false,
        rescueAll: false,
        killAllEnemies: false,
        removeEntities: false,
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
        zoomDelta: 0,
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
      leftCenter: this._touchControlCenter(this.leftControl, TOUCH_UI.left),
      laserCenter: this._touchControlCenter(this.laserControl, TOUCH_UI.laser),
      bombCenter: this._touchControlCenter(this.bombControl, TOUCH_UI.bomb),
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
      toggleFrameStep: this.oneshot.toggleFrameStep,
      togglePlanetView: this.oneshot.togglePlanetView,
      toggleRingVertices: this.oneshot.toggleRingVertices,
      togglePlanetTriangles: this.oneshot.togglePlanetTriangles,
      toggleCollisionContours: this.oneshot.toggleCollisionContours,
      toggleMinerGuidePath: this.oneshot.toggleMinerGuidePath,
      toggleFog: this.oneshot.toggleFog,
      toggleMusic: this.oneshot.toggleMusic,
      toggleCombatMusic: this.oneshot.toggleCombatMusic,
      musicVolumeUp: this.oneshot.musicVolumeUp,
      musicVolumeDown: this.oneshot.musicVolumeDown,
      sfxVolumeUp: this.oneshot.sfxVolumeUp,
      sfxVolumeDown: this.oneshot.sfxVolumeDown,
      copyScreenshot: this.oneshot.copyScreenshot,
      copyScreenshotClean: this.oneshot.copyScreenshotClean,
      copyScreenshotCleanTitle: this.oneshot.copyScreenshotCleanTitle,
      nextLevel: this.oneshot.nextLevel,
      prevLevel: this.oneshot.prevLevel,
      promptLevelJump: this.oneshot.promptLevelJump,
      zoomReset: this.oneshot.zoomReset,
      shootHeld,
      shootPressed,
      shoot: shootPressed,
      bomb: this.oneshot.bomb,
      rescueAll: this.oneshot.rescueAll,
      killAllEnemies: this.oneshot.killAllEnemies,
      removeEntities: this.oneshot.removeEntities,
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
      zoomDelta: this.zoomDelta,
      stepFrame: this.justPressed.has(" ") || this.justPressed.has("Space"),
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
    this.oneshot.toggleFrameStep = false;
    this.oneshot.togglePlanetView = false;
    this.oneshot.toggleRingVertices = false;
    this.oneshot.togglePlanetTriangles = false;
    this.oneshot.toggleCollisionContours = false;
    this.oneshot.toggleMinerGuidePath = false;
    this.oneshot.toggleFog = false;
    this.oneshot.toggleMusic = false;
    this.oneshot.toggleCombatMusic = false;
    this.oneshot.musicVolumeUp = false;
    this.oneshot.musicVolumeDown = false;
    this.oneshot.sfxVolumeUp = false;
    this.oneshot.sfxVolumeDown = false;
    this.oneshot.copyScreenshot = false;
    this.oneshot.copyScreenshotClean = false;
    this.oneshot.copyScreenshotCleanTitle = false;
    this.oneshot.nextLevel = false;
    this.oneshot.prevLevel = false;
    this.oneshot.promptLevelJump = false;
    this.oneshot.zoomReset = false;
    this.oneshot.shoot = false;
    this.oneshot.bomb = false;
    this.oneshot.rescueAll = false;
    this.oneshot.killAllEnemies = false;
    this.oneshot.removeEntities = false;
    this.oneshot.spawnEnemyType = null;
    this.zoomDelta = 0;
    this.bombReleaseFrom = null;
    this.bombReleaseTo = null;
  }
}
function updateHud(hud2, stats) {
  const landingDbg = stats.landingDebug;
  const landingSuffix = landingDbg ? ` | landDbg src:${landingDbg.source || "-"} r:${landingDbg.reason || "-"} lu:${fmtN(landingDbg.dotUp)} sl:${fmtN(landingDbg.slope)}<=${fmtN(landingDbg.landSlope)} vn:${fmtN(landingDbg.vn)} vt:${fmtN(landingDbg.vt)} sp:${fmtN(landingDbg.speed)} af:${fmtN(landingDbg.airFront)} ab:${fmtN(landingDbg.airBack)} sup:${landingDbg.support ? 1 : 0}@${fmtN(landingDbg.supportDist)} ok:${landingDbg.landable ? 1 : 0}` : "";
  const frameStats = stats.frameStats || null;
  const frameSuffix = frameStats ? ` | ft avg:${frameStats.avgMs.toFixed(2)}ms p95:${frameStats.p95Ms.toFixed(2)} p99:${frameStats.p99Ms.toFixed(2)} 1%:${frameStats.low1Fps.toFixed(1)} >16:${frameStats.over16_7} max:${frameStats.maxMs.toFixed(2)}` : "";
  const perfFlags = Array.isArray(stats.perfFlags) ? stats.perfFlags : [];
  const debugSuffix = stats.debug ? ` | miner candidates: ${stats.minerCandidates}${landingSuffix}` : "";
  const perfLine = perfRecordingLine(stats.benchState, perfFlags);
  hud2.textContent = `fps: ${stats.fps} | hull: ${stats.shipHp} | bombs: ${stats.bombs} | level: ${stats.level} | state: ${stats.state} | speed: ${stats.speed.toFixed(1)} | miners: ${stats.miners} | dead: ${stats.minersDead} | verts: ${stats.verts.toLocaleString()} | air: ${stats.air.toFixed(3)}${frameSuffix}${debugSuffix}
LMB: shoot | RMB: bomb | Wheel: zoom | 0: zoom reset | -/=: music vol | Alt+M: new map | Alt+N: next level | Alt+Shift+N: prev level | Alt+K: jump to level | Alt+G/H: ring vertices | Alt+T: planet tri outline | Alt+Y: collision contours | Alt+U: miner path debug | Alt+I: debug collisions | Alt+V: view map | Alt+F: toggle fog | Alt+X: clear enemies | Alt+E: remove entities | Alt+C: copy screenshot | Alt+Shift+C: copy clean screenshot | Alt+Shift+G: copy title screenshot | Alt+\\: toggle dev HUD | M/B: music | J: combat tracks | R: restart
${perfLine}`;
}
function fmtN(n) {
  return Number.isFinite(n) ? Number(n).toFixed(2) : "-";
}
function perfRecordingLine(benchState, perfFlags) {
  let stateLabel = "idle";
  let detail = "";
  const text = typeof benchState === "string" ? benchState.trim() : "";
  if (text) {
    if (text.startsWith("warmup")) {
      stateLabel = "pending";
      detail = text;
    } else if (text.startsWith("run")) {
      stateLabel = "active";
      detail = text;
    } else if (text === "done") {
      stateLabel = "done";
    } else {
      stateLabel = text;
    }
  }
  const flagsText = perfFlags.length ? ` | perf: ${perfFlags.join(",")}` : "";
  return `perf recording: ${stateLabel}${detail ? ` (${detail})` : ""}${flagsText}`;
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
function updateSignalMeter(el, signalStrength, show) {
  if (!el) return;
  if (!show) {
    el.style.display = "none";
    return;
  }
  el.style.display = "block";
  const fill = (
    /** @type {HTMLElement|null} */
    el.querySelector(".signal-bar-fill")
  );
  if (fill) {
    const pct = Math.max(0, Math.min(100, signalStrength * 10));
    fill.style.width = `${pct}%`;
  }
  if (!PERF_FLAGS.disableHudLayout) layoutSignalMeter(el);
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
  const fill = (
    /** @type {HTMLElement|null} */
    el.querySelector(".heat-bar-fill")
  );
  if (fill) fill.style.width = `${value}%`;
  if (!PERF_FLAGS.disableHudLayout) layoutHeatMeter(el);
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
  const signalMeter2 = (
    /** @type {HTMLElement|null} */
    document.getElementById("signal-meter")
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
  let minTop = (
    /** @type {DOMRect} */
    overlaps[0].top
  );
  for (let i = 1; i < overlaps.length; i++) {
    const overlapRect = (
      /** @type {DOMRect} */
      overlaps[i]
    );
    if (overlapRect.top < minTop) minTop = overlapRect.top;
  }
  const liftedBottom = Math.max(baseBottom, Math.round(vH - minTop + pad));
  const maxLiftedBottom = Math.max(baseBottom, Math.round(vH - meterRect.height - minViewportInset));
  el.style.bottom = `${Math.min(liftedBottom, maxLiftedBottom)}px`;
  el.style.top = "auto";
  const liftedRect = el.getBoundingClientRect();
  const stillOverlaps = labels.some((r2) => rectsOverlap(liftedRect, r2, pad));
  if (!stillOverlaps) return;
  const topAnchors = [shipStatus, signalMeter2].filter((node) => !!node && /** @type {HTMLElement} */
  node.style.display !== "none").map((node) => (
    /** @type {HTMLElement} */
    node.getBoundingClientRect().bottom
  ));
  const topY = topAnchors.length ? Math.round(Math.max(...topAnchors) + pad) : minViewportInset;
  const maxTop = Math.max(minViewportInset, Math.round(vH - liftedRect.height - minViewportInset));
  el.style.top = `${Math.min(maxTop, Math.max(minViewportInset, topY))}px`;
  el.style.bottom = "auto";
}
function layoutSignalMeter(el) {
  const pad = 10;
  const minViewportInset = 12;
  const vH = window.innerHeight || document.documentElement.clientHeight || 0;
  const shipStatus = (
    /** @type {HTMLElement|null} */
    document.getElementById("ship-status-label")
  );
  el.style.left = "50%";
  el.style.transform = "translateX(-50%)";
  el.style.top = "var(--ui-top)";
  el.style.bottom = "auto";
  if (!shipStatus) return;
  const meterRect = el.getBoundingClientRect();
  const shipRect = shipStatus.getBoundingClientRect();
  if (!rectsOverlap(meterRect, shipRect, pad)) return;
  const topY = Math.round(shipRect.bottom + pad);
  const maxTop = Math.max(minViewportInset, Math.round(vH - meterRect.height - minViewportInset));
  el.style.top = `${Math.min(maxTop, Math.max(minViewportInset, topY))}px`;
}
function rectsOverlap(a, b, margin) {
  return !(a.right < b.left - margin || a.left > b.right + margin || a.bottom < b.top - margin || a.top > b.bottom + margin);
}
function triAirNormalFromTri(tri, fallbackNx, fallbackNy) {
  if (!tri || tri.length < 3) {
    return { nx: fallbackNx, ny: fallbackNy };
  }
  const a = tri[0];
  const b = tri[1];
  const c = tri[2];
  if (!a || !b || !c) {
    return { nx: fallbackNx, ny: fallbackNy };
  }
  const det = (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y);
  if (Math.abs(det) < 1e-8) {
    return { nx: fallbackNx, ny: fallbackNy };
  }
  const dfdx = (a.air * (b.y - c.y) + b.air * (c.y - a.y) + c.air * (a.y - b.y)) / det;
  const dfdy = (a.air * (c.x - b.x) + b.air * (a.x - c.x) + c.air * (b.x - a.x)) / det;
  const gLen = Math.hypot(dfdx, dfdy);
  if (gLen < 1e-8) {
    return { nx: fallbackNx, ny: fallbackNy };
  }
  let nx = dfdx / gLen;
  let ny = dfdy / gLen;
  if (nx * fallbackNx + ny * fallbackNy < 0) {
    nx = -nx;
    ny = -ny;
  }
  return { nx, ny };
}
function closestPointOnSegment(ax, ay, bx, by, px, py) {
  const ex = bx - ax;
  const ey = by - ay;
  const e2 = ex * ex + ey * ey;
  if (e2 < 1e-10) {
    const dx2 = px - ax;
    const dy2 = py - ay;
    return { x: ax, y: ay, u: 0, d2: dx2 * dx2 + dy2 * dy2 };
  }
  let u = ((px - ax) * ex + (py - ay) * ey) / e2;
  u = Math.max(0, Math.min(1, u));
  const x = ax + ex * u;
  const y = ay + ey * u;
  const dx = px - x;
  const dy = py - y;
  return { x, y, u, d2: dx * dx + dy * dy };
}
function depenetrateAlongNormal(x, y, nx, ny, collidesAt, maxPush, startPush) {
  let lo = 0;
  let hi = Math.max(1e-3, startPush);
  while (hi < maxPush && collidesAt(x + nx * hi, y + ny * hi)) {
    lo = hi;
    hi *= 2;
  }
  hi = Math.min(hi, maxPush);
  if (collidesAt(x + nx * hi, y + ny * hi)) {
    return { x: x + nx * hi, y: y + ny * hi, push: hi, cleared: false };
  }
  for (let i = 0; i < 14; i++) {
    const mid = (lo + hi) * 0.5;
    if (collidesAt(x + nx * mid, y + ny * mid)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return { x: x + nx * hi, y: y + ny * hi, push: hi, cleared: true };
}
function projectPolyAxis(poly, nx, ny) {
  let min = Infinity;
  let max = -Infinity;
  for (const p of poly) {
    const d = p[0] * nx + p[1] * ny;
    if (d < min) min = d;
    if (d > max) max = d;
  }
  return { min, max };
}
function convexPolysOverlap(a, b) {
  const testAxes = (poly0, poly1) => {
    for (let i = 0; i < poly0.length; i++) {
      const p0 = poly0[i];
      const p1 = poly0[(i + 1) % poly0.length];
      if (!p0 || !p1) continue;
      const ex = p1[0] - p0[0];
      const ey = p1[1] - p0[1];
      const el = Math.hypot(ex, ey);
      if (el < 1e-8) continue;
      const nx = -ey / el;
      const ny = ex / el;
      const pa = projectPolyAxis(poly0, nx, ny);
      const pb = projectPolyAxis(poly1, nx, ny);
      if (pa.max < pb.min || pb.max < pa.min) {
        return false;
      }
    }
    return true;
  };
  return testAxes(a, b) && testAxes(b, a);
}
function rockPolygonFromTri(tri) {
  const out = [];
  for (let i = 0; i < 3; i++) {
    const a = tri[i];
    const b = tri[(i + 1) % 3];
    if (!a || !b) continue;
    const aRock = a.air <= 0.5;
    const bRock = b.air <= 0.5;
    if (aRock) {
      out.push([a.x, a.y]);
    }
    if (aRock !== bRock) {
      const denom = b.air - a.air || 1e-6;
      const t = (0.5 - a.air) / denom;
      out.push([
        a.x + (b.x - a.x) * t,
        a.y + (b.y - a.y) * t
      ]);
    }
  }
  return out;
}
function extractHullBoundaryContacts(shipConvexHullWorldVertices, x, y, airAt, eps = 0.03) {
  const hull = shipConvexHullWorldVertices(x, y);
  if (hull.length < 2) return [];
  const e = Math.max(1e-3, eps);
  const out = [];
  const addContact = (cx, cy) => {
    if (!Number.isFinite(cx) || !Number.isFinite(cy)) return;
    const av = airAt(cx, cy);
    let nx = airAt(cx + e, cy) - airAt(cx - e, cy);
    let ny = airAt(cx, cy + e) - airAt(cx, cy - e);
    let nLen = Math.hypot(nx, ny);
    if (nLen < 1e-6) {
      nx = cx - x;
      ny = cy - y;
      nLen = Math.hypot(nx, ny);
    }
    if (nLen < 1e-6) return;
    nx /= nLen;
    ny /= nLen;
    const af = airAt(cx + nx * e * 1.6, cy + ny * e * 1.6);
    const ab = airAt(cx - nx * e * 1.2, cy - ny * e * 1.2);
    if (ab > af) {
      nx = -nx;
      ny = -ny;
    }
    for (const c of out) {
      if (Math.hypot(c.x - cx, c.y - cy) <= 0.015) {
        c.nx += nx;
        c.ny += ny;
        const nn = Math.hypot(c.nx, c.ny) || 1;
        c.nx /= nn;
        c.ny /= nn;
        c.av = Math.min(c.av, av);
        return;
      }
    }
    out.push({ x: cx, y: cy, nx, ny, av });
  };
  const n = hull.length;
  for (let i = 0; i < n; i++) {
    const a = hull[i];
    const b = hull[(i + 1) % n];
    if (!a || !b) continue;
    const av0 = airAt(a[0], a[1]);
    const av1 = airAt(b[0], b[1]);
    const in0 = av0 <= 0.5;
    const in1 = av1 <= 0.5;
    if (in0) addContact(a[0], a[1]);
    if (in1) addContact(b[0], b[1]);
    if (in0 === in1) continue;
    let lo = 0;
    let hi = 1;
    for (let k = 0; k < 14; k++) {
      const mid = (lo + hi) * 0.5;
      const mx = a[0] + (b[0] - a[0]) * mid;
      const my = a[1] + (b[1] - a[1]) * mid;
      const avm = airAt(mx, my);
      const inm = avm <= 0.5;
      if (inm === in0) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
    const t = (lo + hi) * 0.5;
    const cx = a[0] + (b[0] - a[0]) * t;
    const cy = a[1] + (b[1] - a[1]) * t;
    addContact(cx, cy);
  }
  return out;
}
function findPlanetCollisionExactAt(ctx, x, y) {
  const radial = ctx.planet && ctx.planet.radial;
  if (!radial || !Array.isArray(radial.bandTris)) return null;
  const hull = ctx.shipConvexHullWorldVertices(x, y);
  if (hull.length < 3) return null;
  let hxMin = Infinity;
  let hyMin = Infinity;
  let hxMax = -Infinity;
  let hyMax = -Infinity;
  let rMin = Infinity;
  let rMax = 0;
  for (const p of hull) {
    hxMin = Math.min(hxMin, p[0]);
    hyMin = Math.min(hyMin, p[1]);
    hxMax = Math.max(hxMax, p[0]);
    hyMax = Math.max(hyMax, p[1]);
    const r2 = Math.hypot(p[0], p[1]);
    rMin = Math.min(rMin, r2);
    rMax = Math.max(rMax, r2);
  }
  const b0 = Math.max(0, Math.floor(rMin) - 2);
  const b1 = Math.min(radial.bandTris.length - 1, Math.ceil(rMax) + 2);
  let bestD2 = Infinity;
  let bestHit = null;
  for (let bi = b0; bi <= b1; bi++) {
    const tris = radial.bandTris[bi];
    if (!tris) continue;
    for (const tri of tris) {
      const a = tri[0], b = tri[1], c = tri[2];
      if (!a || !b || !c) continue;
      const txMin = Math.min(a.x, b.x, c.x);
      const tyMin = Math.min(a.y, b.y, c.y);
      const txMax = Math.max(a.x, b.x, c.x);
      const tyMax = Math.max(a.y, b.y, c.y);
      if (txMax < hxMin || txMin > hxMax || tyMax < hyMin || tyMin > hyMax) continue;
      const rock = rockPolygonFromTri(tri);
      if (rock.length < 3) continue;
      if (!convexPolysOverlap(hull, rock)) continue;
      for (let i = 0; i < rock.length; i++) {
        const p0 = rock[i];
        const p1 = rock[(i + 1) % rock.length];
        if (!p0 || !p1) continue;
        const cpt = closestPointOnSegment(p0[0], p0[1], p1[0], p1[1], x, y);
        if (cpt.d2 < bestD2) {
          bestD2 = cpt.d2;
          bestHit = { x: cpt.x, y: cpt.y, tri };
        }
      }
    }
  }
  if (!bestHit) return null;
  const contacts = extractHullBoundaryContacts(
    ctx.shipConvexHullWorldVertices,
    x,
    y,
    (sx, sy) => ctx.collision.planetAirValueAtWorld(sx, sy),
    Math.max(0.01, ctx.collisionEps * 0.2)
  );
  if (contacts.length) {
    bestHit.contacts = contacts;
  }
  return bestHit;
}
function resolvePlanetCollisionResponse(args) {
  const {
    ship,
    collision,
    planet,
    mothership,
    planetParams,
    game,
    dt,
    eps,
    debugEnabled = false,
    shipRadius,
    shipCollidesAt,
    shipCollidesMothershipAt,
    shipCollisionPointsAt,
    shipStartX,
    shipStartY,
    shipEndX,
    shipEndY,
    mothershipAngularVel,
    prevPoints,
    currPoints,
    onCrash,
    isDockedWithMothership,
    onSuccessfullyDocked
  } = args;
  const hit = ship._collision;
  if (!hit) return;
  if (hit.source === "mothership") return;
  if (!debugEnabled) {
    ship._landingDebug = null;
    ship._lastMothershipCollisionDiag = null;
  }
  const hx = Number.isFinite(hit.x) ? hit.x : ship.x;
  const hy = Number.isFinite(hit.y) ? hit.y : ship.y;
  const contactNormal = (sample, cx = hx, cy = hy) => {
    let nx = sample(cx + eps, cy) - sample(cx - eps, cy);
    let ny = sample(cx, cy + eps) - sample(cx, cy - eps);
    let nlen = Math.hypot(nx, ny);
    if (nlen < 1e-4) {
      nx = ship.x - cx;
      ny = ship.y - cy;
      nlen = Math.hypot(nx, ny);
    }
    if (nlen < 1e-4) {
      nx = ship.x;
      ny = ship.y;
      nlen = Math.hypot(nx, ny) || 1;
    }
    nx /= nlen;
    ny /= nlen;
    return { nx, ny };
  };
  const averageImpactContacts = (contacts) => {
    if (!Array.isArray(contacts) || !contacts.length) return null;
    let sx = 0;
    let sy = 0;
    let snx = 0;
    let sny = 0;
    let sw = 0;
    let count = 0;
    for (const c of contacts) {
      if (!c) continue;
      if (!Number.isFinite(c.x) || !Number.isFinite(c.y)) continue;
      if (!Number.isFinite(c.nx) || !Number.isFinite(c.ny)) continue;
      const nLen2 = Math.hypot(c.nx, c.ny);
      if (nLen2 < 1e-8) continue;
      const nx2 = c.nx / nLen2;
      const ny2 = c.ny / nLen2;
      const av = Number.isFinite(c.av) ? Number(c.av) : 0.5;
      const w = Math.max(0.05, 0.55 - Math.min(1, Math.max(0, av)));
      sx += c.x * w;
      sy += c.y * w;
      snx += nx2 * w;
      sny += ny2 * w;
      sw += w;
      count++;
    }
    if (count <= 0 || sw <= 1e-8) return null;
    let nx = snx / sw;
    let ny = sny / sw;
    const nLen = Math.hypot(nx, ny);
    if (nLen < 1e-8) return null;
    nx /= nLen;
    ny /= nLen;
    return {
      x: sx / sw,
      y: sy / sw,
      nx,
      ny,
      count
    };
  };
  {
    const shipR = Math.hypot(ship.x, ship.y) || 1;
    const shipUpX = ship.x / shipR;
    const shipUpY = ship.y / shipR;
    const triStraddlesBoundary = (tri) => {
      if (!tri || tri.length < 3) return false;
      let minA = Infinity;
      let maxA = -Infinity;
      for (const v of tri) {
        minA = Math.min(minA, v.air);
        maxA = Math.max(maxA, v.air);
      }
      return minA <= 0.5 && maxA > 0.5;
    };
    const airInTri = (tri, x, y) => {
      const a = tri[0];
      const b = tri[1];
      const c = tri[2];
      if (!a || !b || !c) return 1;
      const det = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
      if (Math.abs(det) < 1e-8) {
        return (a.air + b.air + c.air) / 3;
      }
      const l1 = ((b.y - c.y) * (x - c.x) + (c.x - b.x) * (y - c.y)) / det;
      const l2 = ((c.y - a.y) * (x - c.x) + (a.x - c.x) * (y - c.y)) / det;
      const l3 = 1 - l1 - l2;
      return a.air * l1 + b.air * l2 + c.air * l3;
    };
    const pickTriAtContact = (x, y, fallbackNx, fallbackNy) => {
      const radial = planet && planet.radial;
      if (!radial || !radial.bandTris || typeof radial._pointInTri !== "function") {
        return radial && typeof radial.findTriAtWorld === "function" ? radial.findTriAtWorld(x, y) : null;
      }
      const r2 = Math.hypot(x, y);
      const rMaxBand = Math.max(0, (radial.bandTris.length || 1) - 1);
      const r0 = Math.max(0, Math.min(rMaxBand, Math.floor(r2)));
      const bands = [r0, r0 - 1, r0 + 1, r0 - 2, r0 + 2];
      let bestTri = null;
      let bestScore = -Infinity;
      for (const bi of bands) {
        if (bi < 0 || bi > rMaxBand) continue;
        const tris = radial.bandTris[bi];
        if (!tris || !tris.length) continue;
        for (const tri of tris) {
          if (!tri || tri.length < 3) continue;
          const a = tri[0], b = tri[1], c = tri[2];
          if (!a || !b || !c) continue;
          if (!radial._pointInTri(x, y, a.x, a.y, b.x, b.y, c.x, c.y)) continue;
          let minA = Infinity;
          let maxA = -Infinity;
          for (const v of tri) {
            minA = Math.min(minA, v.air);
            maxA = Math.max(maxA, v.air);
          }
          const boundaryTri = minA <= 0.5 && maxA > 0.5;
          if (!boundaryTri) continue;
          const n = triAirNormalFromTri(
            /** @type {Array<{x:number,y:number,air:number}>} */
            tri,
            fallbackNx,
            fallbackNy
          );
          const probe = 0.06;
          const front = collision.planetAirValueAtWorld(x + n.nx * probe, y + n.ny * probe);
          const back = collision.planetAirValueAtWorld(x - n.nx * probe, y - n.ny * probe);
          const av = airInTri(
            /** @type {Array<{x:number,y:number,air:number}>} */
            tri,
            x,
            y
          );
          let score = 0;
          score += 2;
          score -= Math.abs(av - 0.5) * 1.2;
          score += Math.max(-1, Math.min(1, n.nx * fallbackNx + n.ny * fallbackNy)) * 0.5;
          score += Math.max(-0.7, Math.min(0.7, front - back)) * 1.4;
          if (score > bestScore) {
            bestScore = score;
            bestTri = /** @type {Array<{x:number,y:number,air:number}>} */
            tri;
          }
        }
      }
      if (bestTri) return bestTri;
      return typeof radial.findTriAtWorld === "function" ? radial.findTriAtWorld(x, y) : null;
    };
    const normalAtContact = (x, y) => {
      const fallback = contactNormal((sx, sy) => collision.planetAirValueAtWorld(sx, sy), x, y);
      let cx = x;
      let cy = y;
      let tri = pickTriAtContact(cx, cy, fallback.nx, fallback.ny);
      if (!tri) {
        const rr2 = Math.hypot(cx, cy) || 1;
        const rux2 = cx / rr2;
        const ruy2 = cy / rr2;
        const probeDirs = [
          [-fallback.nx, -fallback.ny],
          // toward likely rock side
          [fallback.nx, fallback.ny],
          // toward likely air side
          [-rux2, -ruy2],
          // inward radial
          [rux2, ruy2]
          // outward radial
        ];
        const probeSteps = [0.03, 0.06, 0.1, 0.16, 0.24];
        for (const d of probeSteps) {
          let found = null;
          for (const dir of probeDirs) {
            const probeDir = dir;
            if (!probeDir) continue;
            const qx = cx + probeDir[0] * d;
            const qy = cy + probeDir[1] * d;
            const t = pickTriAtContact(qx, qy, fallback.nx, fallback.ny);
            if (t) {
              found = t;
              cx = qx;
              cy = qy;
              break;
            }
          }
          if (found) {
            tri = found;
            break;
          }
        }
      }
      const rr = Math.hypot(cx, cy) || 1;
      const rux = cx / rr;
      const ruy = cy / rr;
      const radial = planet && planet.radial;
      const rOuter = radial && radial.rings && radial.rings.length ? radial.rings.length - 1 : typeof planet.planetRadius === "number" ? planet.planetRadius : rr;
      const shellDist = Math.abs(rr - rOuter);
      const probe = 0.08;
      const shellAirOut = collision.planetAirValueAtWorld(cx + rux * probe, cy + ruy * probe);
      const shellAirIn = collision.planetAirValueAtWorld(cx - rux * probe, cy - ruy * probe);
      const isOuterShellBoundary = shellDist <= 0.35 && shellAirOut > 0.5 && shellAirIn <= 0.5;
      let n = triAirNormalFromTri(
        /** @type {Array<{x:number,y:number,air:number}>|null} */
        tri,
        fallback.nx,
        fallback.ny
      );
      if (isOuterShellBoundary && !triStraddlesBoundary(tri)) {
        n = { nx: rux, ny: ruy };
        if (n.nx * fallback.nx + n.ny * fallback.ny < 0) {
          n.nx = -n.nx;
          n.ny = -n.ny;
        }
      }
      return { x: cx, y: cy, nx: n.nx, ny: n.ny, tri: (
        /** @type {Array<{x:number,y:number,air:number}>|null} */
        tri
      ) };
    };
    const sweepContacts = () => {
      if (!prevPoints || !currPoints || !prevPoints.length || !currPoints.length) {
        return [];
      }
      const nPts = Math.min(prevPoints.length, currPoints.length);
      const out = [];
      for (let i = 0; i < nPts; i++) {
        const p0 = prevPoints[i];
        const p1 = currPoints[i];
        if (!p0 || !p1) continue;
        const a0 = collision.planetAirValueAtWorld(p0[0], p0[1]);
        const a1 = collision.planetAirValueAtWorld(p1[0], p1[1]);
        if (!(a0 > 0.5 && a1 <= 0.5)) continue;
        let lo = 0;
        let hi = 1;
        for (let b = 0; b < 20; b++) {
          const tMid = (lo + hi) * 0.5;
          const mx = p0[0] + (p1[0] - p0[0]) * tMid;
          const my = p0[1] + (p1[1] - p0[1]) * tMid;
          const aMid = collision.planetAirValueAtWorld(mx, my);
          if (aMid > 0.5) {
            lo = tMid;
          } else {
            hi = tMid;
          }
        }
        const tHit = hi;
        const cx = p0[0] + (p1[0] - p0[0]) * tHit;
        const cy = p0[1] + (p1[1] - p0[1]) * tHit;
        const n = normalAtContact(cx, cy);
        const svx = p1[0] - p0[0];
        const svy = p1[1] - p0[1];
        const entryVn = svx * n.nx + svy * n.ny;
        out.push({
          x: n.x,
          y: n.y,
          nx: n.nx,
          ny: n.ny,
          tri: n.tri,
          t: tHit,
          pointIndex: i,
          entryVn
        });
      }
      return out;
    };
    const poseContacts = () => {
      const out = [];
      if (!currPoints || !currPoints.length) {
        return out;
      }
      for (let i = 0; i < currPoints.length; i++) {
        const p = currPoints[i];
        if (!p) continue;
        if (collision.planetAirValueAtWorld(p[0], p[1]) > 0.5) continue;
        const n = normalAtContact(p[0], p[1]);
        out.push({
          x: n.x,
          y: n.y,
          nx: n.nx,
          ny: n.ny,
          tri: n.tri,
          t: 1,
          pointIndex: i,
          entryVn: ship.vx * n.nx + ship.vy * n.ny
        });
      }
      return out;
    };
    const pickImpactContact = (contacts2) => {
      if (!contacts2.length) return null;
      let best = contacts2[0];
      if (!best) return null;
      for (let i = 1; i < contacts2.length; i++) {
        const c = contacts2[i];
        if (!c) continue;
        if (c.t < best.t - 1e-6) {
          best = c;
          continue;
        }
        if (Math.abs(c.t - best.t) <= 1e-6 && c.entryVn < best.entryVn) {
          best = c;
        }
      }
      return best;
    };
    const probeX = ship.x - shipUpX * shipRadius;
    const probeY = ship.y - shipUpY * shipRadius;
    const contacts = sweepContacts();
    const contactsPose = poseContacts();
    const avgHitContact = averageImpactContacts(
      /** @type {Array<{x:number,y:number,nx:number,ny:number,av?:number}>|null|undefined} */
      hit.contacts
    );
    const hitImpactContact = avgHitContact ? {
      x: avgHitContact.x,
      y: avgHitContact.y,
      nx: avgHitContact.nx,
      ny: avgHitContact.ny,
      tri: (
        /** @type {Array<{x:number,y:number,air:number}>|null} */
        hit.tri || null
      ),
      t: 0,
      pointIndex: -10,
      entryVn: ship.vx * avgHitContact.nx + ship.vy * avgHitContact.ny
    } : null;
    const contactImpact = hitImpactContact || pickImpactContact(contacts);
    let impactX = hx;
    let impactY = hy;
    let impactTri = null;
    let impactNormal = contactNormal((x, y) => collision.planetAirValueAtWorld(x, y), impactX, impactY);
    if (contactImpact) {
      impactX = contactImpact.x;
      impactY = contactImpact.y;
      impactNormal = { nx: contactImpact.nx, ny: contactImpact.ny };
      impactTri = contactImpact.tri;
    } else {
      const nHit = normalAtContact(impactX, impactY);
      impactX = nHit.x;
      impactY = nHit.y;
      impactNormal = { nx: nHit.nx, ny: nHit.ny };
      impactTri = nHit.tri;
    }
    const supportX = impactX;
    const supportY = impactY;
    const supportTri = impactTri;
    const triMeta = (tri) => {
      if (!tri || tri.length < 3) return null;
      let outerCount = 0;
      let airMin = Infinity;
      let airMax = -Infinity;
      let rMin = Infinity;
      let rMax = -Infinity;
      const rOuter = typeof planet.planetRadius === "number" ? planet.planetRadius : planet.radial && planet.radial.rings ? planet.radial.rings.length - 1 : Infinity;
      for (const v of tri) {
        const rv = Math.hypot(v.x, v.y);
        rMin = Math.min(rMin, rv);
        rMax = Math.max(rMax, rv);
        airMin = Math.min(airMin, v.air);
        airMax = Math.max(airMax, v.air);
        if (rv >= rOuter - 0.22) outerCount++;
      }
      return { outerCount, airMin, airMax, rMin, rMax };
    };
    let bestDotUpAny = -Infinity;
    let bestDotUpUnder = -Infinity;
    for (const c of contactsPose.length ? contactsPose : contacts) {
      const dot = c.nx * shipUpX + c.ny * shipUpY;
      if (dot > bestDotUpAny) bestDotUpAny = dot;
      const rcx = c.x - ship.x;
      const rcy = c.y - ship.y;
      const rLen = Math.hypot(rcx, rcy);
      const downness = rLen > 1e-6 ? -(rcx * shipUpX + rcy * shipUpY) / rLen : -1;
      if (downness >= 0.1 && dot > bestDotUpUnder) bestDotUpUnder = dot;
    }
    const supportMeta = triMeta(
      /** @type {Array<{x:number,y:number,air:number}>|null} */
      supportTri
    );
    if (hit) {
      ship._collision = {
        x: supportX,
        y: supportY,
        source: "planet",
        tri: supportTri,
        node: planet.radial && typeof planet.radial.nearestNodeOnRing === "function" ? planet.radial.nearestNodeOnRing(supportX, supportY) : null
      };
    }
    const vnImpact = ship.vx * impactNormal.nx + ship.vy * impactNormal.ny;
    if (vnImpact < -planetParams.CRASH_SPEED) {
      if (debugEnabled) {
        ship._landingDebug = {
          source: "planet",
          reason: "planet_crash",
          vn: vnImpact,
          vt: ship.vx * -impactNormal.ny + ship.vy * impactNormal.nx,
          speed: Math.hypot(ship.vx, ship.vy),
          impactX,
          impactY,
          supportX,
          supportY
        };
      }
      onCrash();
      return;
    }
    const speedAbs = Math.hypot(ship.vx, ship.vy);
    const maxSlope = 1 - Math.cos(Math.PI / 8);
    const landSlope = Math.min(1 - game.SURFACE_DOT + 0.03, maxSlope);
    const impactDotUp = impactNormal.nx * shipUpX + impactNormal.ny * shipUpY;
    const impactAirFront = collision.planetAirValueAtWorld(
      impactX + impactNormal.nx * Math.max(0.12, shipRadius * 0.45),
      impactY + impactNormal.ny * Math.max(0.12, shipRadius * 0.45)
    );
    const impactAirBack = collision.planetAirValueAtWorld(
      impactX - impactNormal.nx * Math.max(0.1, shipRadius * 0.38),
      impactY - impactNormal.ny * Math.max(0.1, shipRadius * 0.38)
    );
    const landingInfo = {
      dotUp: impactDotUp,
      slope: Math.max(0, 1 - impactDotUp),
      vn: vnImpact,
      vt: ship.vx * -impactNormal.ny + ship.vy * impactNormal.nx,
      airFront: impactAirFront,
      airBack: impactAirBack,
      supportDist: Math.hypot(impactX - probeX, impactY - probeY),
      landable: impactDotUp > 0 && Math.max(0, 1 - impactDotUp) <= landSlope
    };
    const landVt = Math.max(0.8, planetParams.LAND_SPEED * 0.6);
    let landingSupportRatio = 1;
    if (shipCollisionPointsAt) {
      const supportPts = shipCollisionPointsAt(ship.x, ship.y);
      const supportBand = [];
      let bestDownness = -Infinity;
      const planetOuterRadius = typeof planet.planetRadius === "number" ? planet.planetRadius : planet.radial && planet.radial.rings ? planet.radial.rings.length - 1 : Infinity;
      const supportCheckNormal = contactImpact ? impactNormal : { nx: shipUpX, ny: shipUpY };
      for (const p of supportPts) {
        const dx = p[0] - ship.x;
        const dy = p[1] - ship.y;
        const plen = Math.hypot(dx, dy);
        if (plen < 1e-6) continue;
        const downness = -(dx * shipUpX + dy * shipUpY) / plen;
        if (downness > bestDownness) bestDownness = downness;
        supportBand.push({ x: p[0], y: p[1], downness });
      }
      let supportCount = 0;
      let supportTotal = 0;
      const bandThreshold = bestDownness - 0.12;
      const clearOutside = Math.max(0.12, shipRadius * 0.45);
      const clearInside = Math.max(0.1, shipRadius * 0.38);
      for (const p of supportBand) {
        if (p.downness < bandThreshold) continue;
        supportTotal++;
        const pr = Math.hypot(p.x, p.y) || 1;
        const outerShellSample = pr >= planetOuterRadius - Math.max(0.3, shipRadius * 0.6);
        const sampleNx = outerShellSample ? p.x / pr : supportCheckNormal.nx;
        const sampleNy = outerShellSample ? p.y / pr : supportCheckNormal.ny;
        const airFront = collision.planetAirValueAtWorld(
          p.x + sampleNx * clearOutside,
          p.y + sampleNy * clearOutside
        );
        const airBack = collision.planetAirValueAtWorld(
          p.x - sampleNx * clearInside,
          p.y - sampleNy * clearInside
        );
        if (airFront > 0.5 && airBack <= 0.52) {
          supportCount++;
        }
      }
      landingSupportRatio = supportTotal > 0 ? supportCount / supportTotal : 0;
    }
    const landingDbg = debugEnabled ? {
      source: "planet",
      reason: "planet_eval",
      dotUp: landingInfo ? landingInfo.dotUp : 0,
      slope: landingInfo ? landingInfo.slope : 1,
      landSlope,
      vn: landingInfo.vn,
      vt: landingInfo.vt,
      speed: speedAbs,
      airFront: landingInfo.airFront,
      airBack: landingInfo.airBack,
      landable: landingInfo.landable,
      landed: false,
      support: !!contactImpact,
      supportDist: landingInfo.supportDist,
      contactsCount: contactsPose.length ? contactsPose.length : contacts.length,
      bestDotUpAny,
      bestDotUpUnder,
      impactPoint: contactImpact ? contactImpact.pointIndex : -1,
      supportPoint: contactImpact ? contactImpact.pointIndex : -1,
      impactT: contactImpact ? contactImpact.t : Number.NaN,
      supportT: contactImpact ? contactImpact.t : Number.NaN,
      impactX,
      impactY,
      supportX,
      supportY,
      supportTriOuterCount: supportMeta ? supportMeta.outerCount : -1,
      supportTriAirMin: supportMeta ? supportMeta.airMin : Number.NaN,
      supportTriAirMax: supportMeta ? supportMeta.airMax : Number.NaN,
      supportTriRMin: supportMeta ? supportMeta.rMin : Number.NaN,
      supportTriRMax: supportMeta ? supportMeta.rMax : Number.NaN,
      supportRatio: landingSupportRatio
    } : null;
    const settledLanding = !contactImpact && contactsPose.length > 0 && speedAbs <= Math.max(0.08, planetParams.LAND_SPEED * 0.35) && landingSupportRatio >= 0.5;
    if (landingInfo.landable && landingSupportRatio >= 0.5 && landingInfo.vn >= -planetParams.LAND_SPEED && Math.abs(landingInfo.vt) <= landVt && speedAbs <= planetParams.LAND_SPEED + 0.2 || settledLanding) {
      if (landingDbg) {
        landingDbg.reason = "planet_landed";
        landingDbg.landed = true;
        landingDbg.landable = true;
        if (settledLanding) {
          landingDbg.vn = 0;
          landingDbg.vt = 0;
          landingDbg.speed = 0;
        }
        ship._landingDebug = landingDbg;
      }
      ship.state = "landed";
      ship.vx = 0;
      ship.vy = 0;
      return;
    }
    const restitution = Number.isFinite(planetParams.BOUNCE_RESTITUTION) ? Math.max(0, Math.min(1, Number(planetParams.BOUNCE_RESTITUTION))) : Number.isFinite(game.BOUNCE_RESTITUTION) ? Math.max(0, Number(game.BOUNCE_RESTITUTION)) : 0.8;
    const wallFriction = Number.isFinite(planetParams.WALL_FRICTION) ? Math.max(0, Number(planetParams.WALL_FRICTION)) : Math.max(0, Number(planetParams.LAND_FRICTION) || 0);
    if (vnImpact < 0) {
      ship.vx -= (1 + restitution) * vnImpact * impactNormal.nx;
      ship.vy -= (1 + restitution) * vnImpact * impactNormal.ny;
      if (wallFriction > 0) {
        const tx = -impactNormal.ny;
        const ty = impactNormal.nx;
        const vnAfter = ship.vx * impactNormal.nx + ship.vy * impactNormal.ny;
        const vtAfter = ship.vx * tx + ship.vy * ty;
        const damp = Math.max(0, 1 - wallFriction * 0.45 * Math.max(0, dt));
        const vtDamped = vtAfter * damp;
        ship.vx = impactNormal.nx * vnAfter + tx * vtDamped;
        ship.vy = impactNormal.ny * vnAfter + ty * vtDamped;
      }
      ship.x += impactNormal.nx * Math.max(2e-3, shipRadius * 0.02);
      ship.y += impactNormal.ny * Math.max(2e-3, shipRadius * 0.02);
      if (landingDbg) {
        landingDbg.reason = "planet_reflect";
        landingDbg.vn = ship.vx * impactNormal.nx + ship.vy * impactNormal.ny;
        landingDbg.vt = ship.vx * -impactNormal.ny + ship.vy * impactNormal.nx;
      }
    } else {
      if (landingDbg) {
        landingDbg.reason = "planet_graze";
        landingDbg.vn = ship.vx * impactNormal.nx + ship.vy * impactNormal.ny;
        landingDbg.vt = ship.vx * -impactNormal.ny + ship.vy * impactNormal.nx;
      }
    }
    const overlapBefore = shipCollidesAt(ship.x, ship.y);
    let overlapAfter = overlapBefore;
    let depenPush = 0;
    let depenCleared = true;
    if (overlapBefore) {
      const depNow = depenetrateAlongNormal(
        ship.x,
        ship.y,
        impactNormal.nx,
        impactNormal.ny,
        shipCollidesAt,
        Math.max(0.18, shipRadius * 0.8),
        Math.max(0.02, shipRadius * 0.08)
      );
      ship.x = depNow.x;
      ship.y = depNow.y;
      depenPush = depNow.push;
      depenCleared = depNow.cleared;
      overlapAfter = shipCollidesAt(ship.x, ship.y);
      const vnNow = ship.vx * impactNormal.nx + ship.vy * impactNormal.ny;
      if (vnNow < 0) {
        ship.vx -= impactNormal.nx * vnNow;
        ship.vy -= impactNormal.ny * vnNow;
      }
    }
    if (vnImpact >= 0 && !overlapAfter && Number.isFinite(shipStartX) && Number.isFinite(shipStartY) && Number.isFinite(dt) && dt > 1e-6) {
      ship.vx = (ship.x - Number(shipStartX)) / dt;
      ship.vy = (ship.y - Number(shipStartY)) / dt;
      if (landingDbg) {
        landingDbg.vn = ship.vx * impactNormal.nx + ship.vy * impactNormal.ny;
        landingDbg.vt = ship.vx * -impactNormal.ny + ship.vy * impactNormal.nx;
        landingDbg.speed = Math.hypot(ship.vx, ship.vy);
      }
    }
    if (landingDbg) {
      landingDbg.overlapBeforeCount = overlapBefore ? 1 : 0;
      landingDbg.overlapAfterCount = overlapAfter ? 1 : 0;
      landingDbg.overlapBeforeMin = overlapBefore ? 0 : 1;
      landingDbg.overlapAfterMin = overlapAfter ? 0 : 1;
      landingDbg.depenPush = depenPush;
      landingDbg.depenIter = depenPush > 0 ? 1 : 0;
      landingDbg.depenCleared = depenCleared && !overlapAfter;
    }
    if (!overlapAfter) {
      ship._collision = null;
    } else {
      if (landingDbg) {
        landingDbg.reason = "planet_overlap_only";
      }
    }
    if (landingDbg) {
      ship._landingDebug = landingDbg;
    }
    return;
  }
}
function stabilizePlanetPenetration(ctx, maxIters = 12) {
  const { ship, collision, planet } = ctx;
  const eps = Math.max(1e-3, ctx.collisionEps || 0.18);
  const solidThreshold = 0.47;
  const samplePointsAt = (x, y) => {
    const out = ctx.shipCollisionPointsAt(x, y);
    out.push([x, y]);
    return out;
  };
  const deepestPlanetHitAt = (x, y) => {
    const pts = samplePointsAt(x, y);
    let hit = null;
    for (const p of pts) {
      const av = collision.planetAirValueAtWorld(p[0], p[1]);
      if (av > solidThreshold) continue;
      if (!hit || av < hit.av) {
        hit = { x: p[0], y: p[1], av };
      }
    }
    return hit;
  };
  const collidesPlanetAt = (x, y) => deepestPlanetHitAt(x, y) !== null;
  for (let iter = 0; iter < maxIters; iter++) {
    const planetHit = deepestPlanetHitAt(ship.x, ship.y);
    if (!planetHit) break;
    let nxField = collision.planetAirValueAtWorld(planetHit.x + eps, planetHit.y) - collision.planetAirValueAtWorld(planetHit.x - eps, planetHit.y);
    let nyField = collision.planetAirValueAtWorld(planetHit.x, planetHit.y + eps) - collision.planetAirValueAtWorld(planetHit.x, planetHit.y - eps);
    let nlen = Math.hypot(nxField, nyField);
    if (nlen < 1e-4) {
      nxField = ship.x - planetHit.x;
      nyField = ship.y - planetHit.y;
      nlen = Math.hypot(nxField, nyField);
    }
    if (nlen < 1e-4) {
      const rr = Math.hypot(ship.x, ship.y) || 1;
      nxField = ship.x / rr;
      nyField = ship.y / rr;
      nlen = 1;
    }
    nxField /= nlen;
    nyField /= nlen;
    const tri = planet.radial && typeof planet.radial.findTriAtWorld === "function" ? planet.radial.findTriAtWorld(planetHit.x, planetHit.y) : null;
    const nTri = triAirNormalFromTri(
      /** @type {Array<{x:number,y:number,air:number}>|null} */
      tri,
      nxField,
      nyField
    );
    let nx = nTri.nx;
    let ny = nTri.ny;
    if (nx * ship.x + ny * ship.y < 0) {
      nx = -nx;
      ny = -ny;
    }
    const maxPush = Math.max(0.35, ctx.shipRadius() * 1.6);
    let lo = 0;
    let hi = 0.01;
    while (hi < maxPush && collidesPlanetAt(ship.x + nx * hi, ship.y + ny * hi)) {
      lo = hi;
      hi *= 2;
    }
    if (hi > maxPush) hi = maxPush;
    if (collidesPlanetAt(ship.x + nx * hi, ship.y + ny * hi)) {
      ship.x += nx * hi;
      ship.y += ny * hi;
    } else {
      for (let b = 0; b < 14; b++) {
        const mid = (lo + hi) * 0.5;
        if (collidesPlanetAt(ship.x + nx * mid, ship.y + ny * mid)) {
          lo = mid;
        } else {
          hi = mid;
        }
      }
      ship.x += nx * hi;
      ship.y += ny * hi;
    }
  }
  const refreshed = collision.sampleCollisionPoints(samplePointsAt(ship.x, ship.y));
  ship._samples = refreshed.samples;
  if (refreshed.hit) {
    const collisionHit = {
      x: refreshed.hit.x,
      y: refreshed.hit.y,
      tri: planet.radial.findTriAtWorld(refreshed.hit.x, refreshed.hit.y),
      node: planet.radial.nearestNodeOnRing(refreshed.hit.x, refreshed.hit.y)
    };
    if (refreshed.hitSource) {
      collisionHit.source = refreshed.hitSource;
    }
    ship._collision = collisionHit;
  } else {
    ship._collision = null;
  }
}
function isAir(mesh, x, y) {
  return mesh.airValueAtWorld(x, y) > 0.5;
}
function sampleBodyCollisionAt(collision, pointsAt, x, y, includeCenter = true) {
  const pts = pointsAt(x, y);
  if (includeCenter) {
    pts.push([x, y]);
  }
  return collision.sampleCollisionPoints(pts);
}
function resolveCollisionResponse(args) {
  const hit = args && args.ship ? args.ship._collision : null;
  if (!hit) return;
  if (hit.source === "mothership" && args.mothership) {
    resolveMothershipCollisionResponse(
      /** @type {Parameters<typeof resolveMothershipCollisionResponse>[0]} */
      args
    );
    return;
  }
  resolvePlanetCollisionResponse(
    /** @type {Parameters<typeof resolvePlanetCollisionResponse>[0]} */
    args
  );
}
function findCollisionExactAt(ctx, x, y) {
  const mothershipHit = findMothershipCollisionExactAtPose(ctx, x, y, ctx.mothership);
  const planetHit = findPlanetCollisionExactAt(ctx, x, y);
  if (mothershipHit && planetHit) {
    const dm2 = (mothershipHit.x - x) * (mothershipHit.x - x) + (mothershipHit.y - y) * (mothershipHit.y - y);
    const dp2 = (planetHit.x - x) * (planetHit.x - x) + (planetHit.y - y) * (planetHit.y - y);
    return dm2 <= dp2 ? { hit: mothershipHit, hitSource: "mothership" } : { hit: planetHit, hitSource: "planet" };
  }
  if (mothershipHit) return { hit: mothershipHit, hitSource: "mothership" };
  if (planetHit) return { hit: planetHit, hitSource: "planet" };
  return null;
}
function findFirstCollisionOnSegmentExact(ctx, x0, y0, x1, y1, stepLen, maxSteps) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const travel = Math.hypot(dx, dy);
  if (travel < 1e-6) return null;
  const start = findCollisionExactAt(ctx, x0, y0);
  if (start) {
    return { x: x0, y: y0, hit: start.hit, hitSource: start.hitSource };
  }
  const step = Math.max(1e-3, stepLen || 0.08);
  const steps = Math.max(2, Math.min(maxSteps | 0, Math.ceil(travel / step) + 1));
  let tPrev = 0;
  for (let i = 1; i < steps; i++) {
    const t = i / (steps - 1);
    const sx = x0 + dx * t;
    const sy = y0 + dy * t;
    const cur = findCollisionExactAt(ctx, sx, sy);
    if (!cur) {
      tPrev = t;
      continue;
    }
    let lo = tPrev;
    let hi = t;
    let hiHit = cur;
    for (let b = 0; b < 9; b++) {
      const mid = (lo + hi) * 0.5;
      const mx = x0 + dx * mid;
      const my = y0 + dy * mid;
      const midHit = findCollisionExactAt(ctx, mx, my);
      if (midHit) {
        hi = mid;
        hiHit = midHit;
      } else {
        lo = mid;
      }
    }
    if (!hiHit) return null;
    return {
      x: x0 + dx * lo,
      y: y0 + dy * lo,
      hit: hiHit.hit,
      hitSource: hiHit.hitSource
    };
  }
  return null;
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
    let hitBoundaryAv = -Infinity;
    let hitSource = null;
    for (const [x, y] of points) {
      const sample = sampleAtWorld(x, y);
      const av = sample.air;
      const air = av > 0.5;
      samples.push([x, y, air, av]);
      if (!air && av > hitBoundaryAv) {
        hit = { x, y };
        hitBoundaryAv = av;
        hitSource = sample.source;
      }
    }
    return { samples, hit, hitSource };
  }
  function airValueAtWorld(x, y) {
    return sampleAtWorld(x, y).air;
  }
  function gravityAt(x, y) {
    return planet.gravityAt(x, y);
  }
  function collidesAtPoints(points) {
    for (const [x, y] of points) {
      if (sampleAtWorld(x, y).air <= 0.5) return true;
    }
    return false;
  }
  return {
    airValueAtWorld,
    planetAirValueAtWorld,
    gravityAt,
    sampleAtWorld,
    collidesAtPoints,
    sampleCollisionPoints
  };
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
   * @param {(enemy:Enemy, info?:EnemyDestroyInfo)=>void} [deps.onEnemyDestroyed]
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
    this._pursuitState = /* @__PURE__ */ new WeakMap();
    this._deathBy = /* @__PURE__ */ new WeakMap();
    this._navMaskCacheBase = null;
    this._navMaskCacheNavPadded = null;
    this._HUNTER_SPEED = 1;
    this._RANGER_SPEED = 1.6;
    this._HUNTER_SHOT_CD = 1.2;
    this._RANGER_SHOT_CD = 1.8;
    this._SHOT_SPEED = 6.5;
    this._HUNTER_SIGHT_RANGE = 8;
    this._HUNTER_HUNT_DURATION = 10;
    this._TURRET_MAX_RANGE = 5;
    this._TURRET_SHOT_SPEED = 5;
    this._SHOT_LIFE = 3;
    this._APPROACH_RANGE = 2;
    this._DETONATE_RANGE = 0.5;
    this._DETONATE_FUSE = 0.6;
    this._LOS_STEP = 0.2;
    this._CRAWLER_BLAST_LIFE = 0.75;
    this._CRAWLER_BLAST_RADIUS = 1;
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
    this._navMaskCacheBase = null;
    this._navMaskCacheNavPadded = null;
    this._pursuitState = /* @__PURE__ */ new WeakMap();
    this._deathBy = /* @__PURE__ */ new WeakMap();
  }
  /**
   * @param {Enemy|null|undefined} enemy
   * @param {FragmentDestroyedBy} destroyedBy
   * @returns {void}
   */
  markEnemyDestroyedBy(enemy, destroyedBy) {
    if (!enemy) return;
    this._deathBy.set(enemy, destroyedBy);
  }
  /**
   * @param {boolean} [navPadded]
   * @returns {Uint8Array}
   */
  _enemyNavigationMask(navPadded = false) {
    if (!navPadded && this._navMaskCacheBase) return this._navMaskCacheBase;
    if (navPadded && this._navMaskCacheNavPadded) return this._navMaskCacheNavPadded;
    const fallback = this.planet.getAirNodesBitmap ? this.planet.getAirNodesBitmap(navPadded) : this.planet.airNodesBitmap;
    const graph = this.planet.getRadialGraph ? this.planet.getRadialGraph(navPadded) : this.planet.radialGraph;
    const mask = this.planet.getEnemyNavigationMask ? this.planet.getEnemyNavigationMask(navPadded) : fallback;
    const resolved = mask && graph && graph.nodes && mask.length === graph.nodes.length ? mask : fallback;
    if (navPadded) this._navMaskCacheNavPadded = resolved;
    else this._navMaskCacheBase = resolved;
    return resolved;
  }
  /**
   * @param {boolean} [navPadded]
   * @returns {import("./navigation.js").RadialGraph}
   */
  _enemyNavigationGraph(navPadded = false) {
    return this.planet.getRadialGraph ? this.planet.getRadialGraph(navPadded) : this.planet.radialGraph;
  }
  /**
   * @param {Enemy} e
   * @param {Ship|null} ship
   * @param {number} maxPathDist
   * @param {number} dt
   * @param {boolean} [navPadded]
   * @returns {{graph:import("./navigation.js").RadialGraph,nodeTarget:{x:number,y:number}}|null}
   */
  _nextPursuitNode(e, ship, maxPathDist, dt, navPadded = false) {
    if (!ship) return null;
    if (Math.hypot(e.x - ship.x, e.y - ship.y) > maxPathDist) return null;
    const graph = this._enemyNavigationGraph(navPadded);
    const navMask = this._enemyNavigationMask(navPadded);
    if (!graph || !graph.nodes || !graph.neighbors || !navMask || navMask.length !== graph.nodes.length) {
      return null;
    }
    const nodeShip = this.planet.nearestRadialNodeInAir(ship.x, ship.y, navPadded);
    const nodeEnemy = this.planet.nearestRadialNodeInAir(e.x, e.y, navPadded);
    const pursuitState = this._pursuitState.get(e) || { cooldown: 0, shipNode: -1, nodeGoal: -1, navPadded: false };
    pursuitState.cooldown = Math.max(0, (pursuitState.cooldown || 0) - dt);
    if (pursuitState.cooldown > 0 && pursuitState.shipNode === nodeShip && pursuitState.navPadded === navPadded && pursuitState.nodeGoal >= 0 && pursuitState.nodeGoal < graph.nodes.length && pursuitState.nodeGoal !== nodeEnemy && navMask[pursuitState.nodeGoal]) {
      const nodeTarget2 = graph.nodes[pursuitState.nodeGoal];
      if (nodeTarget2) {
        this._pursuitState.set(e, pursuitState);
        return { graph, nodeTarget: nodeTarget2 };
      }
    }
    const pathNodes = findPathAStar(graph, nodeEnemy, nodeShip, navMask);
    if (!pathNodes || pathNodes.length < 2) return null;
    const startIdx = pathNodes[0];
    const nextIdx = pathNodes[1];
    if (startIdx === void 0 || nextIdx === void 0) return null;
    const nodeStart = graph.nodes[startIdx];
    if (!nodeStart) return null;
    let pathLength = 0;
    let node0 = nodeStart;
    for (let i = 1; i < pathNodes.length; i++) {
      const pathIdx = pathNodes[i];
      if (pathIdx === void 0) return null;
      const node1 = graph.nodes[pathIdx];
      if (!node1) return null;
      pathLength += Math.hypot(node1.x - node0.x, node1.y - node0.y);
      if (pathLength > maxPathDist) return null;
      node0 = node1;
    }
    const nodeTarget = graph.nodes[nextIdx];
    pursuitState.cooldown = 0.18;
    pursuitState.shipNode = nodeShip;
    pursuitState.nodeGoal = nextIdx;
    pursuitState.navPadded = navPadded;
    this._pursuitState.set(e, pursuitState);
    return nodeTarget ? { graph, nodeTarget } : null;
  }
  /**
   * @param {Enemy} e
   * @param {{x:number,y:number}} nodeTarget
   * @param {number} speed
   * @param {number} dt
   * @returns {boolean}
   */
  _moveTowardNode(e, nodeTarget, speed, dt) {
    let dx = nodeTarget.x - e.x;
    let dy = nodeTarget.y - e.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= 1e-6) return false;
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
    return true;
  }
  /**
   * @param {Enemy} e
   * @param {{x:number,y:number}} nodeTarget
   * @param {number} [speedOverride]
   * @returns {boolean}
   */
  _steerTowardNode(e, nodeTarget, speedOverride) {
    const dx = nodeTarget.x - e.x;
    const dy = nodeTarget.y - e.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= 1e-6) return false;
    const speedCandidate = typeof speedOverride === "number" && Number.isFinite(speedOverride) ? speedOverride : Math.hypot(e.vx, e.vy);
    const speed = Math.max(1e-3, speedCandidate);
    e.vx = dx / dist * speed;
    e.vy = dy / dist * speed;
    return true;
  }
  /**
   * @param {EnemyType} type
   * @param {number} x
   * @param {number} y
   * @returns {void}
   */
  spawnDebug(type, x, y) {
    const shotCooldown = Math.random();
    const modeCooldown = 0;
    if (type === "hunter") {
      this.enemies.push({ type, x, y, vx: 0, vy: 0, hp: 3, shotCooldown, modeCooldown, iNodeGoal: null });
    } else if (type === "ranger") {
      this.enemies.push({ type, x, y, vx: 0, vy: 0, hp: 2, shotCooldown, modeCooldown, iNodeGoal: null });
    } else if (type === "crawler") {
      const dir = Math.random() * Math.PI * 2;
      const speed = 1.5;
      this.enemies.push({ type, x, y, vx: Math.cos(dir) * speed, vy: Math.sin(dir) * speed, hp: 1, shotCooldown: 0, modeCooldown: 0, iNodeGoal: null });
    } else if (type === "turret") {
      this.enemies.push({ type, x, y, vx: 0, vy: 0, hp: 1, shotCooldown, modeCooldown, iNodeGoal: null });
    } else if (type === "orbitingTurret") {
      this.enemies.push({ type, x, y, vx: 0, vy: 0, hp: 1, shotCooldown, modeCooldown, iNodeGoal: null });
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
      this.enemies.push({ type: "hunter", x, y, vx: 0, vy: 0, hp: 3, shotCooldown: Math.random(), modeCooldown: 0, iNodeGoal: null });
    }
    for (const [x, y] of rangerPts) {
      this.enemies.push({ type: "ranger", x, y, vx: 0, vy: 0, hp: 2, shotCooldown: Math.random(), modeCooldown: 0, iNodeGoal: null });
    }
    for (const [x, y] of crawlerPts) {
      const dir = Math.random() * Math.PI * 2;
      const speed = Math.min(3, level * 0.25 + 0.5);
      const vx = Math.cos(dir) * speed;
      const vy = Math.sin(dir) * speed;
      this.enemies.push({ type: "crawler", x, y, vx, vy, hp: 1, shotCooldown: 0, modeCooldown: 0, iNodeGoal: null });
    }
    for (const [x, y] of turretPts) {
      let tx = x;
      let ty = y;
      const res = planet.nudgeOutOfTerrain(tx, ty, 0.8, 0.08, 0.18);
      if (res && res.ok) {
        tx = res.x;
        ty = res.y;
      }
      const info = typeof planet._upAlignedNormalAtWorld === "function" ? planet._upAlignedNormalAtWorld(tx, ty) : planet.normalAtWorld(tx, ty);
      if (info) {
        const lift = GAME.ENEMY_SCALE * 0.8;
        tx += info.nx * lift;
        ty += info.ny * lift;
      } else {
        const len = Math.hypot(tx, ty) || 1;
        const lift = GAME.ENEMY_SCALE * 0.8;
        tx += tx / len * lift;
        ty += ty / len * lift;
      }
      this.enemies.push({ type: "turret", x: tx, y: ty, vx: 0, vy: 0, hp: 1, shotCooldown: Math.random(), modeCooldown: 0, iNodeGoal: null });
    }
    {
      const rand = mulberry32$1(seed + 5);
      const directionCCW = rand() < 0.5;
      const perigee = this.params.RMAX + 2;
      const eccentricity = rand() * 0.15;
      let angle = rand() * Math.PI * 2;
      for (let i = 0; i < orbitingTurrets; ++i) {
        const { x, y, vx, vy } = planet.orbitStateFromElements(perigee, eccentricity, angle, directionCCW);
        this.enemies.push({ type: "orbitingTurret", x, y, vx, vy, hp: 1, shotCooldown: Math.random(), modeCooldown: 0, iNodeGoal: null });
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
    this._navMaskCacheBase = null;
    this._navMaskCacheNavPadded = null;
    updateFragmentDebris(this.debris, {
      gravityAt: (x, y) => collision.gravityAt(x, y),
      dragCoeff: this.params.DRAG,
      dt,
      terrainCrossing: GAME.FRAGMENT_PLANET_COLLISION ? (p1, p2) => this.planet.terrainCrossing(p1, p2) : null,
      terrainCollisionEnabled: GAME.FRAGMENT_PLANET_COLLISION,
      restitution: Number.isFinite(this.params.BOUNCE_RESTITUTION) ? Number(this.params.BOUNCE_RESTITUTION) : GAME.BOUNCE_RESTITUTION
    });
    for (let i = this.shots.length - 1; i >= 0; i--) {
      const s = this.shots[i];
      if (!s) continue;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt;
      if (s.life <= 0 || !isAir(collision, s.x, s.y)) {
        this.shots.splice(i, 1);
      }
    }
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const explosion = this.explosions[i];
      if (!explosion) continue;
      explosion.life -= dt;
      if (explosion.life <= 0) this.explosions.splice(i, 1);
    }
    if (PERF_FLAGS.disableEnemyAi) {
      return;
    }
    const shipTarget = ship && ship.state !== "crashed" ? ship : null;
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (!e) continue;
      if (e.hitT && e.hitT > 0) {
        e.hitT = Math.max(0, e.hitT - dt);
      }
      if (e.stunT && e.stunT > 0) {
        e.stunT = Math.max(0, e.stunT - dt);
      }
      if (e.hp <= 0) {
        const deathInfo = this._consumeEnemyDestroyInfo(e, "hp");
        this._notifyEnemyDestroyed(e, deathInfo);
        this._spawnEnemyDeathFragments(e, deathInfo.destroyedBy);
        if (e.type === "crawler") {
          this._spawnCrawlerBlastVisual(e, deathInfo.destroyedBy === "bomb" ? 2 : this._CRAWLER_BLAST_RADIUS);
        }
        this.enemies.splice(i, 1);
        continue;
      }
      if (e.stunT && e.stunT > 0) {
        continue;
      }
      if (e.type === "hunter") {
        this._updateHunter(e, shipTarget, dt);
      } else if (e.type === "ranger") {
        this._updateRanger(e, shipTarget, dt);
      } else if (e.type === "crawler") {
        if (!this._updateCrawler(e, shipTarget, dt)) {
          const deathInfo = this._consumeEnemyDestroyInfo(e, "detonate", "detonate");
          this._notifyEnemyDestroyed(e, deathInfo);
          this._spawnEnemyDeathFragments(e, deathInfo.destroyedBy);
          this.enemies.splice(i, 1);
        }
      } else if (e.type === "turret") {
        if (!shipTarget) continue;
        this._updateTurret(e, shipTarget, dt);
      } else if (e.type === "orbitingTurret") {
        if (!shipTarget) continue;
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
    const seesShip = ship && Math.hypot(ship.x - e.x, ship.y - e.y) < this._HUNTER_SIGHT_RANGE && lineOfSightAir(this.collision, e.x, e.y, ship.x, ship.y, this._LOS_STEP);
    if (seesShip) {
      this.modeCooldown = Math.max(this.modeCooldown, this._HUNTER_HUNT_DURATION);
    } else {
      this.modeCooldown = Math.max(0, this.modeCooldown - dt);
    }
    if (this.modeCooldown <= 0 || !this._tryMoveHunter(e, ship, dt)) {
      this._wander(e, this._HUNTER_SPEED, dt);
    }
    if (ship) this._updateTurret(e, ship, dt);
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
    const pursuit = this._nextPursuitNode(e, ship, maxPathDist, dt, true);
    if (!pursuit) return false;
    return this._moveTowardNode(e, pursuit.nodeTarget, this._HUNTER_SPEED, dt);
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
    } else if (ship && this._tryMoveSeeker(e, ship, this._RANGER_SPEED, dt)) {
      e.iNodeGoal = null;
    } else {
      this._wander(e, this._RANGER_SPEED, dt);
    }
    if (ship) this._updateTurret(e, ship, dt);
  }
  /**
   * @param {Enemy} e 
   * @param {number} speed
   * @param {number} dt 
   * @returns {void}
   */
  _wander(e, speed, dt) {
    const graph = this._enemyNavigationGraph(false);
    const iNodeFrom = this.planet.nearestRadialNodeInAir(e.x, e.y, false);
    const navMask = this._enemyNavigationMask(false);
    if (!graph || !graph.nodes || !graph.neighbors || iNodeFrom < 0) return;
    if (e.iNodeGoal === null || iNodeFrom === e.iNodeGoal || !navMask[e.iNodeGoal]) {
      e.iNodeGoal = this._iNodeWanderDirection(graph, navMask, iNodeFrom, e.x, e.y, e.vx, e.vy);
    }
    const nodeGoal = graph.nodes[e.iNodeGoal];
    if (!nodeGoal) return;
    this._moveTowardNode(e, nodeGoal, speed, dt);
  }
  /**
   * @param {Enemy} e
   * @param {Ship|null} ship
   * @param {number} speed
   * @param {number} dt
   * @returns {boolean}
   */
  _tryMoveSeeker(e, ship, speed, dt) {
    const pursuit = this._nextPursuitNode(e, ship, 16, dt, true);
    if (!pursuit) return false;
    return this._moveTowardNode(e, pursuit.nodeTarget, speed, dt);
  }
  /**
   * @param {import("./navigation.js").RadialGraph} radialGraph
   * @param {Uint8Array} navMask
   * @param {number} iNodeFrom
   * @param {number} x
   * @param {number} y
   * @param {number} vx
   * @param {number} vy
   * @returns {number}
   */
  _iNodeWanderDirection(radialGraph, navMask, iNodeFrom, x, y, vx, vy) {
    const iNodeCandidates = [];
    const neighborList = radialGraph.neighbors[iNodeFrom] || [];
    for (const n of neighborList) {
      const iNode = n.to;
      if (navMask[iNode] === 0) continue;
      const node = radialGraph.nodes[iNode];
      if (!node) continue;
      const dx = node.x - x;
      const dy = node.y - y;
      const dot = dx * vx + dy * vy;
      if (dot <= 0) continue;
      iNodeCandidates.push(iNode);
    }
    if (iNodeCandidates.length === 0) {
      for (const n of neighborList) {
        const iNode = n.to;
        if (navMask[iNode] === 0) continue;
        iNodeCandidates.push(iNode);
      }
    }
    if (iNodeCandidates.length === 0) {
      return iNodeFrom;
    }
    const choice = iNodeCandidates[Math.floor(Math.random() * iNodeCandidates.length)];
    return typeof choice === "number" ? choice : iNodeFrom;
  }
  /**
   * @param {Enemy} e 
   * @param {Ship|null} ship 
   * @param {number} dt 
   * @returns {boolean} keep alive?
   */
  _updateCrawler(e, ship, dt) {
    this._moveCrawler(e, ship, dt);
    if (!ship) return true;
    const dx = ship.x - e.x;
    const dy = ship.y - e.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= this._DETONATE_RANGE) {
      this._spawnCrawlerBlastVisual(e);
      return false;
    }
    return true;
  }
  /**
   * @param {Enemy|null|undefined} e
   * @param {"hp"|"detonate"} cause
   * @param {FragmentDestroyedBy} [fallbackDestroyedBy]
   * @returns {EnemyDestroyInfo}
   */
  _consumeEnemyDestroyInfo(e, cause, fallbackDestroyedBy = "unknown") {
    let destroyedBy = fallbackDestroyedBy;
    if (e) {
      const marked = this._deathBy.get(e);
      if (marked) destroyedBy = marked;
      this._deathBy.delete(e);
    }
    return { cause, destroyedBy };
  }
  /**
   * @param {Enemy} e
   * @param {EnemyDestroyInfo} info
   * @returns {void}
   */
  _notifyEnemyDestroyed(e, info) {
    if (this.onEnemyDestroyed) {
      this.onEnemyDestroyed(e, info);
    }
  }
  /**
   * @param {Enemy} e
   * @param {FragmentDestroyedBy} destroyedBy
   * @returns {void}
   */
  _spawnEnemyDeathFragments(e, destroyedBy) {
    spawnFragmentBurst(this.debris, e, e.type, destroyedBy);
  }
  /**
   * @param {Enemy} e
   * @param {number} [radius]
   * @returns {void}
   */
  _spawnCrawlerBlastVisual(e, radius = this._CRAWLER_BLAST_RADIUS) {
    this.explosions.push({
      x: e.x,
      y: e.y,
      life: this._CRAWLER_BLAST_LIFE,
      maxLife: this._CRAWLER_BLAST_LIFE,
      owner: "crawler",
      radius
    });
  }
  /**
   * @param {Enemy} e
   * @param {Ship|null} ship
   * @param {number} dt 
   */
  _moveCrawler(e, ship, dt) {
    const prev = { x: e.x, y: e.y };
    const seekingShip = this._steerCrawlerTowardShip(e, ship, dt);
    this._approachPlayer(e, ship);
    this._reflectVelocityBackTowardPlanet(e);
    const next = { x: e.x + e.vx * dt, y: e.y + e.vy * dt };
    this._reflectVelocityAwayFromTerrain(e, prev, next);
    this._deflectCrawlerFromUnsafeNodes(e, dt, seekingShip);
    e.x += e.vx * dt;
    e.y += e.vy * dt;
  }
  /**
   * @param {Enemy} e
   * @param {Ship|null} ship
   * @param {number} dt
   * @returns {boolean}
   */
  _steerCrawlerTowardShip(e, ship, dt) {
    const pursuit = this._nextPursuitNode(e, ship, 16, dt, true);
    if (!pursuit) return false;
    const currentSpeed = Math.max(1.2, Math.hypot(e.vx, e.vy));
    return this._steerTowardNode(e, pursuit.nodeTarget, currentSpeed);
  }
  /**
   * @param {Enemy} e
   * @param {number} dt
   * @param {boolean} [navPadded]
   * @returns {void}
   */
  _deflectCrawlerFromUnsafeNodes(e, dt, navPadded = false) {
    const navMask = this._enemyNavigationMask(navPadded);
    const graph = this._enemyNavigationGraph(navPadded);
    if (!graph || !graph.nodes || !graph.neighbors) return;
    const nextX = e.x + e.vx * dt;
    const nextY = e.y + e.vy * dt;
    const iNodeNext = this.planet.nearestRadialNodeInAir(nextX, nextY, navPadded);
    if (iNodeNext < 0 || iNodeNext >= navMask.length || navMask[iNodeNext]) return;
    const iNodeFrom = this.planet.nearestRadialNodeInAir(e.x, e.y, navPadded);
    if (iNodeFrom < 0 || iNodeFrom >= graph.neighbors.length) return;
    const neighborList = graph.neighbors[iNodeFrom];
    if (!neighborList) return;
    let bestDx = 0;
    let bestDy = 0;
    let bestScore = -Infinity;
    for (const edge of neighborList) {
      const iNode = edge.to;
      if (iNode < 0 || iNode >= navMask.length || !navMask[iNode]) continue;
      const node = graph.nodes[iNode];
      if (!node) continue;
      const dx = node.x - e.x;
      const dy = node.y - e.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= 1e-6) continue;
      const score = (dx * e.vx + dy * e.vy) / dist;
      if (score > bestScore) {
        bestScore = score;
        bestDx = dx / dist;
        bestDy = dy / dist;
      }
    }
    if (bestScore <= -Infinity) return;
    const speed = Math.max(1e-3, Math.hypot(e.vx, e.vy));
    e.vx = bestDx * speed;
    e.vy = bestDy * speed;
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
   * @param {{x:number,y:number}} prev
   * @param {{x:number,y:number}} next
   * @returns {void}
   */
  _reflectVelocityAwayFromTerrain(e, prev, next) {
    const planet = this.planet;
    const crossing = planet.terrainCrossing(prev, next);
    if (!crossing) return;
    const nx = crossing.nx;
    const ny = crossing.ny;
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
    e.shotCooldown = Math.max(0, e.shotCooldown - dt);
    const dx = ship.x - e.x;
    const dy = ship.y - e.y;
    const distSqrMax = this._TURRET_MAX_RANGE * this._TURRET_MAX_RANGE;
    if (dx * dx + dy * dy > distSqrMax) {
      e.shotCooldown = Math.max(e.shotCooldown, 0.5);
      return;
    }
    const dvx = ship.vx - e.vx;
    const dvy = ship.vy - e.vy;
    const dtHit = e.type === "orbitingTurret" ? dTImpact(dx, dy, dvx, dvy, this._TURRET_SHOT_SPEED) : 0;
    const dxAim = dx + dvx * dtHit;
    const dyAim = dy + dvy * dtHit;
    if (!lineOfSightAir(this.collision, e.x, e.y, ship.x, ship.y, this._LOS_STEP)) {
      e.shotCooldown = Math.max(e.shotCooldown, 1.5);
      return;
    }
    if (e.shotCooldown > 0) return;
    e.shotCooldown = 1;
    this._shoot(e, this._TURRET_SHOT_SPEED, dxAim, dyAim);
  }
  /**
   * @param {Enemy} e 
   * @param {Ship} ship 
   * @param {number} dt
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
const contourCache = /* @__PURE__ */ new WeakMap();
function expectDefined$2(value) {
  if (value == null) {
    throw new Error("Expected value to be defined");
  }
  return value;
}
function meshCache(mesh) {
  let map = contourCache.get(mesh);
  if (!map) {
    map = /* @__PURE__ */ new Map();
    contourCache.set(mesh, map);
  }
  return map;
}
function invalidateSurfaceGuidePathCache(mesh) {
  contourCache.delete(mesh);
}
function edgeKeyFromVerts(mesh, a, b) {
  if (mesh && typeof mesh._edgeKeyFromVerts === "function") {
    return mesh._edgeKeyFromVerts(a, b);
  }
  const ax = Math.round(a.x * 1e3);
  const ay = Math.round(a.y * 1e3);
  const bx = Math.round(b.x * 1e3);
  const by = Math.round(b.y * 1e3);
  if (ax < bx || ax === bx && ay <= by) {
    return `${ax},${ay}|${bx},${by}`;
  }
  return `${bx},${by}|${ax},${ay}`;
}
function closestPathIndex(path, qx, qy) {
  if (!path || path.length < 2) return null;
  let bestD2 = Infinity;
  let bestIndex = null;
  for (let i = 1; i < path.length; i++) {
    const p0 = expectDefined$2(path[i - 1]);
    const p1 = expectDefined$2(path[i]);
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const den = dx * dx + dy * dy;
    if (den < 1e-10) continue;
    let u = ((qx - p0.x) * dx + (qy - p0.y) * dy) / den;
    u = Math.max(0, Math.min(1, u));
    const cx = p0.x + dx * u;
    const cy = p0.y + dy * u;
    const ddx = qx - cx;
    const ddy = qy - cy;
    const d2 = ddx * ddx + ddy * ddy;
    if (d2 < bestD2) {
      bestD2 = d2;
      bestIndex = i - 1 + u;
    }
  }
  return bestIndex;
}
function ensureSurfaceGuideContour(mesh, threshold = 0.5) {
  const cache = meshCache(mesh);
  const cached = cache.get(threshold);
  if (cached) return cached;
  const nodes = [];
  const neighbors = [];
  const segments = [];
  const nodeOfEdge = /* @__PURE__ */ new Map();
  const nodeOfPoint = /* @__PURE__ */ new Map();
  const segmentKeys = /* @__PURE__ */ new Set();
  const pointKey = (x, y) => `${Math.round(x * 1e3)}:${Math.round(y * 1e3)}`;
  const getOrCreateNode = (x, y, key) => {
    const k = key || pointKey(x, y);
    const existing = nodeOfPoint.get(k);
    if (existing !== void 0) return existing;
    const idx = nodes.length;
    nodes.push({ x, y });
    neighbors.push([]);
    nodeOfPoint.set(k, idx);
    return idx;
  };
  const getVertexNode = (v) => {
    const vid = mesh && mesh._vertIdOf ? mesh._vertIdOf.get(v) : void 0;
    const key = vid !== void 0 ? `v:${vid}` : pointKey(v.x, v.y);
    return getOrCreateNode(v.x, v.y, key);
  };
  const getCrossNode = (a, b) => {
    const eKey = edgeKeyFromVerts(mesh, a, b);
    let nodeIdx = nodeOfEdge.get(eKey);
    if (nodeIdx !== void 0) return nodeIdx;
    const denom = b.air - a.air;
    const t = Math.abs(denom) > 1e-8 ? Math.max(0, Math.min(1, (threshold - a.air) / denom)) : 0.5;
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;
    nodeIdx = getOrCreateNode(x, y, `e:${eKey}`);
    nodeOfEdge.set(eKey, nodeIdx);
    return nodeIdx;
  };
  const addSegment = (ia, ib) => {
    if (ia === ib) return;
    const segKey = ia < ib ? `${ia}:${ib}` : `${ib}:${ia}`;
    if (segmentKeys.has(segKey)) return;
    const pa = nodes[ia];
    const pb = nodes[ib];
    if (!pa || !pb) return;
    const len = Math.hypot(pb.x - pa.x, pb.y - pa.y);
    if (!(len > 1e-6)) return;
    const tx = (pb.x - pa.x) / len;
    const ty = (pb.y - pa.y) / len;
    const mx = (pa.x + pb.x) * 0.5;
    const my = (pa.y + pb.y) * 0.5;
    const rMid = Math.hypot(mx, my) || 1;
    const ux = mx / rMid;
    const uy = my / rMid;
    const n0x = -ty;
    const n0y = tx;
    const n1x = ty;
    const n1y = -tx;
    const probe = 0.08;
    const a0 = mesh.airValueAtWorld(mx + n0x * probe, my + n0y * probe);
    const b0 = mesh.airValueAtWorld(mx - n0x * probe, my - n0y * probe);
    const a1 = mesh.airValueAtWorld(mx + n1x * probe, my + n1y * probe);
    const b1 = mesh.airValueAtWorld(mx - n1x * probe, my - n1y * probe);
    const o0 = a0 - b0;
    const o1 = a1 - b1;
    let nx = n0x;
    let ny = n0y;
    if (o1 > o0) {
      nx = n1x;
      ny = n1y;
    }
    const dotUp = nx * ux + ny * uy;
    const slope = 1 - dotUp;
    segmentKeys.add(segKey);
    const iSeg = segments.length;
    segments.push({ a: ia, b: ib, len, slope, dotUp, rMid });
    expectDefined$2(neighbors[ia]).push({ to: ib, len, seg: iSeg });
    expectDefined$2(neighbors[ib]).push({ to: ia, len, seg: iSeg });
  };
  const triList = mesh._triList || [];
  for (const tri of triList) {
    if (!tri || tri.length < 3) continue;
    const crossed = [];
    const edges = [[tri[0], tri[1]], [tri[1], tri[2]], [tri[2], tri[0]]];
    for (const edge of edges) {
      const a = expectDefined$2(edge[0]);
      const b = expectDefined$2(edge[1]);
      const aboveA = a.air > threshold;
      const aboveB = b.air > threshold;
      if (aboveA === aboveB) continue;
      crossed.push(getCrossNode(a, b));
    }
    if (crossed.length !== 2) continue;
    addSegment(expectDefined$2(crossed[0]), expectDefined$2(crossed[1]));
  }
  const outer = mesh.rings && mesh.rings.length ? mesh.rings[mesh.rings.length - 1] : null;
  if (outer && outer.length > 1) {
    for (let i = 0; i < outer.length; i++) {
      const v0 = expectDefined$2(outer[i]);
      const v1 = expectDefined$2(outer[(i + 1) % outer.length]);
      const rock0 = v0.air <= threshold;
      const rock1 = v1.air <= threshold;
      if (!rock0 && !rock1) continue;
      if (rock0 && rock1) {
        addSegment(getVertexNode(v0), getVertexNode(v1));
        continue;
      }
      if (rock0) {
        addSegment(getVertexNode(v0), getCrossNode(v0, v1));
      } else {
        addSegment(getCrossNode(v0, v1), getVertexNode(v1));
      }
    }
  }
  const contour = { threshold, nodes, neighbors, segments };
  cache.set(threshold, contour);
  return contour;
}
function buildSurfaceGuidePath(mesh, x, y, maxDistance) {
  const contour = ensureSurfaceGuideContour(mesh, 0.5);
  const nodes = contour.nodes;
  const segments = contour.segments;
  const neighbors = contour.neighbors;
  if (!nodes.length || !segments.length) return null;
  const maxSlope = Math.max(0.08, Math.min(0.6, Number.isFinite(GAME.MINER_WALK_MAX_SLOPE) ? GAME.MINER_WALK_MAX_SLOPE : 0.35));
  const minDotUp = Math.max(0.2, 1 - maxSlope);
  const rAnchor = Math.hypot(x, y);
  const radialBias = 2.5;
  const preferOuter = rAnchor >= mesh._R_MESH - 1.8;
  const buildSegAllowed = (outerSlack) => {
    const out = new Uint8Array(segments.length);
    const outerBandInner = rAnchor - outerSlack;
    for (let i = 0; i < segments.length; i++) {
      const s = expectDefined$2(segments[i]);
      if (!(s.dotUp >= minDotUp && s.slope <= maxSlope)) {
        out[i] = 0;
        continue;
      }
      if (preferOuter && s.rMid < outerBandInner) {
        out[i] = 0;
        continue;
      }
      out[i] = 1;
    }
    return out;
  };
  const pickBestSegment = (mask) => {
    let seg = -1;
    let scoreBest = Infinity;
    let pxBest = 0;
    let pyBest = 0;
    let dBest = Infinity;
    for (let i = 0; i < segments.length; i++) {
      if (!mask[i]) continue;
      const s = expectDefined$2(segments[i]);
      const a = expectDefined$2(nodes[s.a]);
      const b = expectDefined$2(nodes[s.b]);
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const den = dx * dx + dy * dy;
      if (den < 1e-10) continue;
      let u = ((x - a.x) * dx + (y - a.y) * dy) / den;
      u = Math.max(0, Math.min(1, u));
      const px = a.x + dx * u;
      const py = a.y + dy * u;
      const ddx = x - px;
      const ddy = y - py;
      const d2 = ddx * ddx + ddy * ddy;
      const rDiff = s.rMid - rAnchor;
      const score = d2 + radialBias * (rDiff * rDiff);
      if (score < scoreBest) {
        scoreBest = score;
        seg = i;
        pxBest = px;
        pyBest = py;
        dBest = Math.hypot(ddx, ddy);
      }
    }
    if (seg < 0) return null;
    return { seg, x: pxBest, y: pyBest, d: dBest };
  };
  let segAllowed = buildSegAllowed(0.55);
  let pick = pickBestSegment(segAllowed);
  if (!pick && preferOuter) {
    segAllowed = buildSegAllowed(1.35);
    pick = pickBestSegment(segAllowed);
  }
  if (!pick && preferOuter) {
    segAllowed = buildSegAllowed(2.2);
    pick = pickBestSegment(segAllowed);
  }
  if (!pick) return null;
  const bestSeg = pick.seg;
  const bestX = pick.x;
  const bestY = pick.y;
  const dAnchor = pick.d;
  if (Number.isFinite(maxDistance) && maxDistance > 0 && dAnchor > maxDistance) {
    return null;
  }
  const start = expectDefined$2(segments[bestSeg]);
  const maxLen = Math.max(0.15, Number.isFinite(maxDistance) ? maxDistance : 4);
  const pickNextNode = (nodeIdx, prevIdx, fromX, fromY) => {
    const list = neighbors[nodeIdx];
    if (!list || !list.length) return -1;
    const node = expectDefined$2(nodes[nodeIdx]);
    const inDx = node.x - fromX;
    const inDy = node.y - fromY;
    const inLen = Math.hypot(inDx, inDy);
    let best = -1;
    let bestScore = -Infinity;
    for (const e of list) {
      if (e.to === prevIdx) continue;
      if (!segAllowed[e.seg]) continue;
      const n = expectDefined$2(nodes[e.to]);
      const outDx = n.x - node.x;
      const outDy = n.y - node.y;
      const outLen = Math.hypot(outDx, outDy);
      if (outLen < 1e-8) continue;
      let score = 0;
      if (inLen > 1e-8) {
        score = inDx / inLen * (outDx / outLen) + inDy / inLen * (outDy / outLen);
      }
      if (score > bestScore) {
        bestScore = score;
        best = e.to;
      }
    }
    return best;
  };
  const walk = (firstNode, prevNode, limit) => {
    const out = [{ x: bestX, y: bestY }];
    let remaining = Math.max(0, limit);
    let fromX = bestX;
    let fromY = bestY;
    let nodeIdx = firstNode;
    let prevIdx = prevNode;
    while (remaining > 1e-6) {
      const node = expectDefined$2(nodes[nodeIdx]);
      const dx = node.x - fromX;
      const dy = node.y - fromY;
      const dist = Math.hypot(dx, dy);
      if (dist > 1e-8) {
        if (dist > remaining) {
          const t = remaining / dist;
          out.push({ x: fromX + dx * t, y: fromY + dy * t });
          break;
        }
        out.push({ x: node.x, y: node.y });
        remaining -= dist;
      }
      const next = pickNextNode(nodeIdx, prevIdx, fromX, fromY);
      if (next < 0) break;
      prevIdx = nodeIdx;
      fromX = node.x;
      fromY = node.y;
      nodeIdx = next;
    }
    return out;
  };
  const walkA = walk(start.a, start.b, maxLen);
  const walkB = walk(start.b, start.a, maxLen);
  const pathRaw = walkA.slice().reverse().concat(walkB.slice(1));
  if (pathRaw.length < 2) return null;
  const path = [];
  const pushUnique = (p) => {
    const last = path.length ? path[path.length - 1] : null;
    if (!last || Math.hypot(last.x - p.x, last.y - p.y) > 1e-4) {
      path.push({ x: p.x, y: p.y });
    }
  };
  for (const p of pathRaw) pushUnique(p);
  if (path.length < 2) return null;
  const idx = closestPathIndex(path, x, y);
  const indexClosest = idx !== null ? idx : Math.max(0, Math.min(path.length - 1, path.length * 0.5));
  return { path, indexClosest };
}
function indexPathFromPos(path, distMax, x, y, rHint = null, rTol = Infinity) {
  if (!path || path.length < 2) return null;
  const distMaxSqr = distMax * distMax;
  let distClosestSqr = Infinity;
  let indexPath = null;
  for (let i = 1; i < path.length; ++i) {
    const pos0 = expectDefined$2(path[i - 1]);
    const pos1 = expectDefined$2(path[i]);
    if (rHint !== null && Number.isFinite(rHint) && Number.isFinite(rTol)) {
      const r0 = Math.hypot(pos0.x, pos0.y);
      const r1 = Math.hypot(pos1.x, pos1.y);
      const rMin = Math.min(r0, r1) - rTol;
      const rMax = Math.max(r0, r1) + rTol;
      if (rHint < rMin || rHint > rMax) continue;
    }
    const dSegX = pos1.x - pos0.x;
    const dSegY = pos1.y - pos0.y;
    const dSeg2 = dSegX * dSegX + dSegY * dSegY;
    if (dSeg2 < 1e-10) continue;
    const dPosX = x - pos0.x;
    const dPosY = y - pos0.y;
    let u = (dSegX * dPosX + dSegY * dPosY) / dSeg2;
    u = Math.max(0, Math.min(1, u));
    const dPosClosestX = dSegX * u - dPosX;
    const dPosClosestY = dSegY * u - dPosY;
    const distSqr = dPosClosestX * dPosClosestX + dPosClosestY * dPosClosestY;
    if (distSqr > distMaxSqr) continue;
    if (distSqr < distClosestSqr) {
      distClosestSqr = distSqr;
      indexPath = i - 1 + u;
    }
  }
  return indexPath;
}
function posFromPathIndex(path, indexPath) {
  if (!path || path.length === 0) {
    return { x: 0, y: 0 };
  }
  if (path.length === 1) {
    const only = expectDefined$2(path[0]);
    return { x: only.x, y: only.y };
  }
  indexPath = Math.max(0, Math.min(path.length - 1, indexPath));
  let iSeg = Math.floor(indexPath);
  let uSeg = indexPath - iSeg;
  if (iSeg === path.length - 1) {
    iSeg -= 1;
    uSeg += 1;
  }
  const start = expectDefined$2(path[iSeg]);
  const end = expectDefined$2(path[iSeg + 1]);
  const x0 = start.x;
  const y0 = start.y;
  const x1 = end.x;
  const y1 = end.y;
  return {
    x: x0 + (x1 - x0) * uSeg,
    y: y0 + (y1 - y0) * uSeg
  };
}
function moveAlongPathPositive(path, indexPath, distRemaining, indexPathMax) {
  if (!(distRemaining > 0)) return indexPath;
  if (!(indexPath < indexPathMax)) return indexPathMax;
  const iSegMax = Math.floor(indexPathMax);
  const uSegMax = indexPathMax - iSegMax;
  let iSeg = Math.floor(indexPath);
  let uSeg = indexPath - iSeg;
  while (iSeg >= 0 && iSeg + 1 < path.length) {
    const a = expectDefined$2(path[iSeg]);
    const b = expectDefined$2(path[iSeg + 1]);
    const dSegX = b.x - a.x;
    const dSegY = b.y - a.y;
    const distSeg = Math.hypot(dSegX, dSegY);
    if (distSeg < 1e-10) {
      indexPath = iSeg + 1;
      ++iSeg;
      uSeg = 0;
      continue;
    }
    const distSegStop = iSeg < iSegMax ? Infinity : Math.max(0, (uSegMax - uSeg) * distSeg);
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
  if (!(distRemaining > 0)) return indexPath;
  if (!(indexPath > indexPathMin)) return indexPathMin;
  const iSegMin = Math.floor(indexPathMin);
  const uSegMin = indexPathMin - iSegMin;
  let iSeg = Math.floor(indexPath);
  let uSeg = indexPath - iSeg;
  if (iSeg >= path.length - 1) {
    iSeg = path.length - 2;
    uSeg = 1;
    indexPath = path.length - 1;
  }
  while (iSeg >= 0 && iSeg + 1 < path.length) {
    const a = expectDefined$2(path[iSeg]);
    const b = expectDefined$2(path[iSeg + 1]);
    const dSegX = b.x - a.x;
    const dSegY = b.y - a.y;
    const distSeg = Math.hypot(dSegX, dSegY);
    if (distSeg < 1e-10) {
      indexPath = iSeg;
      --iSeg;
      uSeg = 1;
      continue;
    }
    const distSegStop = iSeg > iSegMin ? Infinity : Math.max(0, (uSeg - uSegMin) * distSeg);
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
function extractPathSegment(path, indexA, indexB) {
  if (!path || path.length < 2) return null;
  if (!Number.isFinite(indexA) || !Number.isFinite(indexB)) return null;
  const lo = Math.min(indexA, indexB);
  const hi = Math.max(indexA, indexB);
  const forward = indexA <= indexB;
  const out = [];
  const pushUnique = (p) => {
    const last = out.length ? out[out.length - 1] : null;
    if (!last || Math.hypot(last.x - p.x, last.y - p.y) > 1e-4) {
      out.push({ x: p.x, y: p.y });
    }
  };
  pushUnique(posFromPathIndex(path, lo));
  const iMin = Math.max(0, Math.ceil(lo));
  const iMax = Math.min(path.length - 1, Math.floor(hi));
  for (let i = iMin; i <= iMax; i++) {
    pushUnique(expectDefined$2(path[i]));
  }
  pushUnique(posFromPathIndex(path, hi));
  if (!forward) out.reverse();
  return out.length >= 2 ? out : null;
}
function findGuidePathTargetIndex(guidePath, shipX, shipY) {
  if (!guidePath || !guidePath.path || guidePath.path.length < 2) {
    return null;
  }
  const projected = indexPathFromPos(guidePath.path, Number.POSITIVE_INFINITY, shipX, shipY);
  if (projected !== null) return projected;
  if (Number.isFinite(guidePath.indexClosest)) {
    return Math.max(0, Math.min(guidePath.path.length - 1, guidePath.indexClosest));
  }
  return null;
}
function findMinerGuideAttachIndex(path, attachDist, minerX, minerY, rHint = null, debug = null) {
  const radialTolBase = Math.max(0.12, Math.min(0.28, attachDist * 0.28));
  let sameRingIdx = null;
  let nearbyRingIdx = null;
  let plainIdx = null;
  if (debug) {
    debug.radialTolBase = radialTolBase;
    debug.sameRingIdx = sameRingIdx;
    debug.nearbyRingIdx = nearbyRingIdx;
    debug.plainIdx = plainIdx;
    debug.chosenStage = "none";
    debug.chosenIdx = null;
    debug.chosenDist = Number.POSITIVE_INFINITY;
    debug.chosenR = Number.POSITIVE_INFINITY;
    debug.nearestIdx = null;
    debug.nearestDist = Number.POSITIVE_INFINITY;
    debug.nearestR = Number.POSITIVE_INFINITY;
  }
  if (rHint !== null && Number.isFinite(rHint)) {
    sameRingIdx = indexPathFromPos(path, attachDist, minerX, minerY, rHint, radialTolBase);
    if (debug) debug.sameRingIdx = sameRingIdx;
    nearbyRingIdx = indexPathFromPos(path, attachDist, minerX, minerY, rHint, radialTolBase * 2);
    if (debug) debug.nearbyRingIdx = nearbyRingIdx;
  }
  plainIdx = indexPathFromPos(path, attachDist, minerX, minerY);
  if (debug) debug.plainIdx = plainIdx;
  let chosenIdx = null;
  let chosenStage = "none";
  if (sameRingIdx !== null) {
    chosenIdx = sameRingIdx;
    chosenStage = "same_ring";
  } else if (nearbyRingIdx !== null) {
    chosenIdx = nearbyRingIdx;
    chosenStage = "nearby_ring";
  } else if (plainIdx !== null) {
    chosenIdx = plainIdx;
    chosenStage = "plain";
  }
  if (debug) {
    const nearestIdx = indexPathFromPos(path, Number.POSITIVE_INFINITY, minerX, minerY);
    debug.nearestIdx = nearestIdx;
    if (nearestIdx !== null) {
      const nearestPos = posFromPathIndex(path, nearestIdx);
      debug.nearestDist = Math.hypot(nearestPos.x - minerX, nearestPos.y - minerY);
      debug.nearestR = Math.hypot(nearestPos.x, nearestPos.y);
    }
    if (chosenIdx !== null) {
      const chosenPos = posFromPathIndex(path, chosenIdx);
      debug.chosenDist = Math.hypot(chosenPos.x - minerX, chosenPos.y - minerY);
      debug.chosenR = Math.hypot(chosenPos.x, chosenPos.y);
    }
    debug.chosenIdx = chosenIdx;
    debug.chosenStage = chosenStage;
  }
  return chosenIdx;
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
    this._OUTER_FORCED_AIR_RINGS = 0;
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
    function stitchBand2(inner, outer) {
      const tris = [];
      const n0 = inner.length, n1 = outer.length;
      const I = (
        /** @type {MeshRing} */
        inner.concat([
          /** @type {MeshVertex} */
          inner[0]
        ])
      );
      const O = (
        /** @type {MeshRing} */
        outer.concat([
          /** @type {MeshVertex} */
          outer[0]
        ])
      );
      let i = 0, j = 0;
      while (i < n0 || j < n1) {
        if (i >= n0) {
          tris.push([
            /** @type {MeshVertex} */
            I[i],
            /** @type {MeshVertex} */
            O[j],
            /** @type {MeshVertex} */
            O[j + 1]
          ]);
          j++;
          continue;
        }
        if (j >= n1) {
          tris.push([
            /** @type {MeshVertex} */
            I[i],
            /** @type {MeshVertex} */
            O[j],
            /** @type {MeshVertex} */
            I[i + 1]
          ]);
          i++;
          continue;
        }
        if ((i + 1) / n0 < (j + 1) / n1) {
          tris.push([
            /** @type {MeshVertex} */
            I[i],
            /** @type {MeshVertex} */
            O[j],
            /** @type {MeshVertex} */
            I[i + 1]
          ]);
          i++;
        } else {
          tris.push([
            /** @type {MeshVertex} */
            I[i],
            /** @type {MeshVertex} */
            O[j],
            /** @type {MeshVertex} */
            O[j + 1]
          ]);
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
      const ring = (
        /** @type {MeshRing} */
        rings[r2]
      );
      for (const v of ring) {
        v.air = this._sampleAirAtWorldExtended(v.x, v.y);
      }
    }
    this._applyMoltenOverrides();
    this._forceOuterShellAir();
    this._cleanupOuterRimSpikeArtifacts();
    for (let r2 = 0; r2 < this._R_MESH; r2++) {
      const inner = (
        /** @type {MeshRing} */
        rings[r2]
      );
      const outer = (
        /** @type {MeshRing} */
        rings[r2 + 1]
      );
      if (r2 === 0) {
        const tris = [];
        const center = (
          /** @type {MeshVertex} */
          inner[0]
        );
        for (let k = 0; k < outer.length; k++) {
          const a = center;
          const b = (
            /** @type {MeshVertex} */
            outer[k]
          );
          const c = (
            /** @type {MeshVertex} */
            outer[(k + 1) % outer.length]
          );
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
        const tris = stitchBand2(inner, outer);
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
    this._fogAlpha.fill(this._fogUnseenAlpha);
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
    this._markOuterFogBandSeen();
    const vertIdOf = /* @__PURE__ */ new Map();
    let vid = 0;
    for (const ring of this.rings) {
      for (const v of ring) {
        vertIdOf.set(v, vid++);
      }
    }
    this._vertIdOf = vertIdOf;
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
    const forcedRings = Math.max(0, this._OUTER_FORCED_AIR_RINGS | 0);
    if (forcedRings > 0) {
      const outerShellMinR = Math.max(0, this._R_MESH - forcedRings);
      if (r2 >= outerShellMinR) return 1;
    }
    if (r2 > this._params.RMAX) return 1;
    return this._map.airBinaryAtWorld(x, y);
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {MeshTri|null}
   */
  findTriAtWorld(x, y) {
    const r2 = Math.hypot(x, y);
    if (r2 <= 0) return null;
    const r0 = Math.floor(Math.min(this._R_MESH - 1, Math.max(0, r2)));
    const bands = [r0, r0 - 1, r0 + 1];
    for (const bi of bands) {
      if (bi < 0 || bi >= this._R_MESH) continue;
      const tris = (
        /** @type {MeshTri[]} */
        this.bandTris[bi]
      );
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
    const ring = (
      /** @type {MeshRing} */
      this.rings[ri]
    );
    if (ring.length === 0) return null;
    let best = (
      /** @type {MeshVertex} */
      ring[0]
    );
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
    const rOuter = this.rings ? this.rings.length - 1 : this._params.RMAX;
    if (r2 > rOuter + this._OUTER_PAD) return 1;
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
   * @param {MeshTri} tri
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
    const r2 = Math.hypot(x, y);
    if (r2 <= 1e-6) {
      return (
        /** @type {MeshVertex} */
        /** @type {MeshRing} */
        this.rings[0][0].air
      );
    }
    const tri = this.findTriAtWorld(x, y);
    if (!tri) {
      const n = this.nearestNodeOnRing(x, y);
      return n ? n.air : 1;
    }
    return this._airValueInTri(x, y, tri);
  }
  /**
   * @param {{x:number,y:number,air:number}} a
   * @param {{x:number,y:number,air:number}} b
   * @returns {string}
   */
  _edgeKeyFromVerts(a, b) {
    const ia = this._vertIdOf ? this._vertIdOf.get(a) : void 0;
    const ib = this._vertIdOf ? this._vertIdOf.get(b) : void 0;
    if (ia !== void 0 && ib !== void 0) {
      return ia < ib ? `${ia}:${ib}` : `${ib}:${ia}`;
    }
    const ax = Math.round(a.x * 1e3);
    const ay = Math.round(a.y * 1e3);
    const bx = Math.round(b.x * 1e3);
    const by = Math.round(b.y * 1e3);
    if (ax < bx || ax === bx && ay <= by) {
      return `${ax},${ay}|${bx},${by}`;
    }
    return `${bx},${by}|${ax},${ay}`;
  }
  /**
   * Build contour graph from exact triangle-edge crossings at a threshold.
   * Nodes are edge crossing points; edges connect crossings within each triangle.
   * @param {number} [threshold]
   * @returns {{
   *  threshold:number,
   *  nodes:Array<{x:number,y:number}>,
   *  neighbors:Array<Array<{to:number,len:number,seg:number}>>,
   *  segments:Array<{a:number,b:number,len:number,slope:number,dotUp:number,rMid:number}>
   * }}
   */
  _ensureGuideContour(threshold = 0.5) {
    return ensureSurfaceGuideContour(this, threshold);
  }
  /**
   * Continuous closest point index along a polyline path.
   * @param {Array<{x:number,y:number}>} path
   * @param {number} qx
   * @param {number} qy
   * @returns {number|null}
   */
  _closestPathIndex(path, qx, qy) {
    return closestPathIndex(path, qx, qy);
  }
  /**
   * Build miner guide path directly from barycentric triangle contour segments.
   * @param {number} x
   * @param {number} y
   * @param {number} maxDistance
   * @returns {{path:Array<{x:number,y:number}>, indexClosest:number}|null}
   */
  surfaceGuidePathTo(x, y, maxDistance) {
    return buildSurfaceGuidePath(this, x, y, maxDistance);
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
    this._forceOuterShellAir();
    this._cleanupOuterRimSpikeArtifacts();
    for (let i = 0; i < this.vertCount; i++) {
      this.airFlag[i] = /** @type {MeshVertex} */
      this._vertRefs[i].air;
    }
    invalidateSurfaceGuidePathCache(this);
    return new Float32Array(this.airFlag);
  }
  /**
   * Force outer shell rings to air.
   * @returns {void}
   */
  _forceOuterShellAir() {
    if (!this.rings.length) return;
    const ringCount = this.rings.length;
    const forceCount = Math.max(0, Math.min(ringCount, this._OUTER_FORCED_AIR_RINGS | 0));
    if (forceCount <= 0) return;
    const start = Math.max(0, ringCount - forceCount);
    for (let r2 = start; r2 < ringCount; r2++) {
      const ring = (
        /** @type {MeshRing} */
        this.rings[r2]
      );
      for (const v of ring) {
        v.air = 1;
      }
    }
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
      const ring = (
        /** @type {MeshRing} */
        this.rings[r2]
      );
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
    const wrap = (i, n) => {
      let out = i % n;
      if (out < 0) out += n;
      return out;
    };
    const hasInwardSupport = (i) => {
      const v = (
        /** @type {MeshVertex} */
        rim[i]
      );
      const len = Math.hypot(v.x, v.y) || 1;
      const ux = v.x / len;
      const uy = v.y / len;
      let best = 0;
      let bestDot = -2;
      for (let j = 0; j < inner.length; j++) {
        const iv = (
          /** @type {MeshVertex} */
          inner[j]
        );
        const ilen = Math.hypot(iv.x, iv.y) || 1;
        const dot = iv.x / ilen * ux + iv.y / ilen * uy;
        if (dot > bestDot) {
          bestDot = dot;
          best = j;
        }
      }
      const jl = wrap(best - 1, inner.length);
      const jr = wrap(best + 1, inner.length);
      return (
        /** @type {MeshVertex} */
        inner[best].air <= 0.5 || /** @type {MeshVertex} */
        inner[jl].air <= 0.5 || /** @type {MeshVertex} */
        inner[jr].air <= 0.5
      );
    };
    const clear = [];
    const support = new Array(rim.length).fill(false);
    for (let i = 0; i < rim.length; i++) {
      support[i] = hasInwardSupport(i);
    }
    for (let i = 0; i < rim.length; i++) {
      const v = (
        /** @type {MeshVertex} */
        rim[i]
      );
      if (v.air > 0.5) continue;
      const prev = (
        /** @type {MeshVertex} */
        rim[wrap(i - 1, rim.length)]
      );
      const next = (
        /** @type {MeshVertex} */
        rim[wrap(i + 1, rim.length)]
      );
      if (prev.air <= 0.5 || next.air <= 0.5) continue;
      if (!support[i]) {
        clear.push(i);
      }
    }
    const visited = new Array(rim.length).fill(false);
    for (let i = 0; i < rim.length; i++) {
      if (visited[i]) continue;
      if (
        /** @type {MeshVertex} */
        rim[i].air > 0.5 || support[i]
      ) {
        visited[i] = true;
        continue;
      }
      let lenRun = 0;
      let j = i;
      while (!visited[j] && /** @type {MeshVertex} */
      rim[j].air <= 0.5 && !support[j]) {
        visited[j] = true;
        lenRun++;
        j = wrap(j + 1, rim.length);
      }
      const start = i;
      const end = wrap(j - 1, rim.length);
      const before = (
        /** @type {MeshVertex} */
        rim[wrap(start - 1, rim.length)]
      );
      const after = (
        /** @type {MeshVertex} */
        rim[wrap(end + 1, rim.length)]
      );
      if (before.air > 0.5 && after.air > 0.5) {
        for (let k = 0; k < lenRun; k++) {
          clear.push(wrap(start + k, rim.length));
        }
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
    for (let i = 1; i < steps; i++) {
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
    const lerp2 = this._fogAlphaLerp;
    for (let idx = start; idx < end; idx++) {
      const tri = (
        /** @type {MeshTri} */
        this._triList[idx]
      );
      const cx = (
        /** @type {number} */
        c[idx * 2]
      );
      const cy = (
        /** @type {number} */
        c[idx * 2 + 1]
      );
      const m01x = (tri[0].x + tri[1].x) * 0.5;
      const m01y = (tri[0].y + tri[1].y) * 0.5;
      const m12x = (tri[1].x + tri[2].x) * 0.5;
      const m12y = (tri[1].y + tri[2].y) * 0.5;
      const m20x = (tri[2].x + tri[0].x) * 0.5;
      const m20y = (tri[2].y + tri[0].y) * 0.5;
      const visibleNow = pointVisible(cx, cy) || pointVisible(tri[0].x, tri[0].y) || pointVisible(tri[1].x, tri[1].y) || pointVisible(tri[2].x, tri[2].y) || pointVisible(m01x, m01y) || pointVisible(m12x, m12y) || pointVisible(m20x, m20y);
      const holdNow = (
        /** @type {number} */
        this._fogHold[idx]
      );
      if (visibleNow) {
        this._fogHold[idx] = this._fogHoldFrames;
      } else if (holdNow > 0) {
        this._fogHold[idx] = holdNow - 1;
      }
      if (
        /** @type {number} */
        this._fogHold[idx] > 0
      ) {
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
        const a0 = (
          /** @type {number} */
          this._fogAlpha[base]
        );
        const next = a0 + (target - a0) * lerp2;
        this._fogAlpha[base] = next;
        this._fogAlpha[base + 1] = next;
        this._fogAlpha[base + 2] = next;
      }
    }
    this._fogCursor = end >= count ? 0 : end;
  }
  /**
   * Evaluate fog visibility for the full mesh in one pass.
   * @param {number} shipX
   * @param {number} shipY
   * @returns {Float32Array}
   */
  primeFog(shipX, shipY) {
    if (!this._fogVisible || !this._fogVisible.length) {
      return this._fogAlpha;
    }
    const start = this._fogCursor | 0;
    let first = true;
    while (first || this._fogCursor !== start) {
      this.updateFog(shipX, shipY);
      first = false;
    }
    return this._fogAlpha;
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
    if (Math.abs(det) < 1e-6) return (
      /** @type {number} */
      this._fogAlpha[idx * 3]
    );
    const l1 = ((b.y - c.y) * (x - c.x) + (c.x - b.x) * (y - c.y)) / det;
    const l2 = ((c.y - a.y) * (x - c.x) + (a.x - c.x) * (y - c.y)) / det;
    const l3 = 1 - l1 - l2;
    const base = idx * 3;
    return (
      /** @type {number} */
      this._fogAlpha[base] * l1 + /** @type {number} */
      this._fogAlpha[base + 1] * l2 + /** @type {number} */
      this._fogAlpha[base + 2] * l3
    );
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
   * Seed the outermost mesh band as explored after level generation.
   * This does not mark it currently visible.
   * @returns {void}
   */
  _markOuterFogBandSeen() {
    if (!this._triIndexOf || !this.bandTris || !this.bandTris.length) return;
    const outerBand = this.bandTris[this.bandTris.length - 1];
    if (!outerBand || !outerBand.length) return;
    for (const tri of outerBand) {
      const idx = this._triIndexOf.get(tri);
      if (idx === void 0) continue;
      this._fogSeen[idx] = 1;
      const base = idx * 3;
      this._fogAlpha[base] = this._fogSeenAlpha;
      this._fogAlpha[base + 1] = this._fogSeenAlpha;
      this._fogAlpha[base + 2] = this._fogSeenAlpha;
    }
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
      const r2 = Math.hypot(x, y) / p.RMAX;
      let mid = 1 - Math.abs(r2 - 0.6) / 0.6;
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
      const r2 = Math.hypot(x, y);
      if (r2 > rMax) continue;
      const len = Math.max(1e-6, r2);
      const ux = x / len;
      const uy = y / len;
      const profile = this.noise.fbm(ux * waveFreq, uy * waveFreq, waveOctaves, 0.55, 2);
      const detail = this.noise.fbm((ux + 13.7) * waveFreq * 2.1, (uy - 7.1) * waveFreq * 2.1, 2, 0.55, 2);
      const shapeRaw = Math.max(-1, Math.min(1, profile * 0.8 + detail * 0.2));
      const shape = Math.max(-1, Math.min(1, (shapeRaw - shapeMean) / shapeHalfRange));
      const cutDepth = Math.max(0, Math.min(maxDepth, meanDepth + shape * ampEffective));
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
    const prop = (
      /** @type {PlanetProp} */
      props[i]
    );
    if (prop.type === "vent") props.splice(i, 1);
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
    const n = (
      /** @type {RadialNode} */
      nodes[i]
    );
    const r2 = Math.hypot(n.x, n.y);
    if (r2 < rMin || r2 > rMax) continue;
    if (!isFarFromReservations(n.x, n.y, minDist, reservations)) continue;
    const neigh = (
      /** @type {NavEdgeRef[]} */
      neighbors[i] || []
    );
    let airCount = 0;
    let rockNeighbor = null;
    let rockDist2 = Infinity;
    for (const e of neigh) {
      if (air[e.to]) airCount++;
      else {
        const nb = (
          /** @type {RadialNode} */
          nodes[e.to]
        );
        const dx = n.x - nb.x;
        const dy = n.y - nb.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < rockDist2) {
          rockDist2 = d2;
          rockNeighbor = nb;
        }
      }
    }
    if (airCount < 3 || !rockNeighbor) continue;
    const dxr = n.x - rockNeighbor.x;
    const dyr = n.y - rockNeighbor.y;
    const nlen = Math.hypot(dxr, dyr) || 1;
    const nx = dxr / nlen;
    const ny = dyr / nlen;
    candidates.push({ n, rockNeighbor: (
      /** @type {RadialNode} */
      rockNeighbor
    ), nx, ny });
  }
  const rand = mulberry32$1(planet.getSeed() + 991 | 0);
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = (
      /** @type {WallAttachCandidate} */
      candidates[i]
    );
    candidates[i] = /** @type {WallAttachCandidate} */
    candidates[j];
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
    const prop = (
      /** @type {PlanetProp} */
      props[i]
    );
    if (prop.type === "ice_shard") props.splice(i, 1);
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
    const n = (
      /** @type {RadialNode} */
      nodes[i]
    );
    const r2 = Math.hypot(n.x, n.y);
    if (r2 > rMax) continue;
    if (!isFarFromReservations(n.x, n.y, minDist, reservations)) continue;
    const neigh = (
      /** @type {NavEdgeRef[]} */
      neighbors[i] || []
    );
    let rockNeighbor = null;
    let rockDist2 = Infinity;
    for (const e of neigh) {
      if (air[e.to]) continue;
      const nb = (
        /** @type {RadialNode} */
        nodes[e.to]
      );
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
    candidates.push({ n, rockNeighbor: (
      /** @type {RadialNode} */
      rockNeighbor
    ), nx, ny });
  }
  const rand = mulberry32$1(planet.getSeed() + 7331 | 0);
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = (
      /** @type {WallAttachCandidate} */
      candidates[i]
    );
    candidates[i] = /** @type {WallAttachCandidate} */
    candidates[j];
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
    props.push({
      type: "ice_shard",
      x: bx,
      y: by,
      scale,
      rot,
      nx,
      ny,
      hp: 1,
      supportX: hi.x,
      supportY: hi.y,
      supportNodeIndex: rn.i
    });
  }
}
function placeMushrooms(planet, props) {
  const cfg = planet.getPlanetConfig ? planet.getPlanetConfig() : null;
  if (!cfg || cfg.id !== "gaia") return;
  const params = planet.getPlanetParams ? planet.getPlanetParams() : null;
  if (!params) return;
  for (let i = props.length - 1; i >= 0; i--) {
    const prop = (
      /** @type {PlanetProp} */
      props[i]
    );
    if (prop.type === "mushroom") props.splice(i, 1);
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
    const n = (
      /** @type {RadialNode} */
      nodes[i]
    );
    const r2 = Math.hypot(n.x, n.y);
    if (r2 > rMax) continue;
    if (!isFarFromReservations(n.x, n.y, minDist, reservations)) continue;
    const neigh = (
      /** @type {NavEdgeRef[]} */
      neighbors[i] || []
    );
    let rockNeighbor = null;
    let rockDist2 = Infinity;
    for (const e of neigh) {
      if (air[e.to]) continue;
      const nb = (
        /** @type {RadialNode} */
        nodes[e.to]
      );
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
    candidates.push({ n, rockNeighbor: (
      /** @type {RadialNode} */
      rockNeighbor
    ), nx, ny });
  }
  const rand = mulberry32$1(planet.getSeed() + 3313 | 0);
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = (
      /** @type {WallAttachCandidate} */
      candidates[i]
    );
    candidates[i] = /** @type {WallAttachCandidate} */
    candidates[j];
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
    const p = (
      /** @type {PlanetProp} */
      props[i]
    );
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
    const n = (
      /** @type {RadialNode} */
      nodes[i]
    );
    const r2 = Math.hypot(n.x, n.y);
    if (r2 < rMin || r2 > mediumR) continue;
    const neigh = (
      /** @type {NavEdgeRef[]} */
      neighbors[i] || []
    );
    let rockNeighbor = null;
    let rockDist2 = Infinity;
    for (const e of neigh) {
      if (air[e.to]) continue;
      const nb = (
        /** @type {RadialNode} */
        nodes[e.to]
      );
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
    const tmp = (
      /** @type {{x:number,y:number,nx:number,ny:number}} */
      candidates[i]
    );
    candidates[i] = /** @type {{x:number,y:number,nx:number,ny:number}} */
    candidates[j];
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
      blast: 0.55,
      piecesMin: 3,
      piecesMax: 6,
      range: 5,
      speedMin: 6,
      speedMax: 9,
      radius: 0.22,
      sizeMin: 0.13,
      sizeMax: 0.22,
      spread: 0.78
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
      heatHit: 14,
      stunTime: 0.9,
      ventContactHeatRise: 24,
      unsafeReach: 2,
      unsafeBaseWidth: 0.34,
      unsafeWidthGrow: 0.18,
      enemyAvoidAfterLaunchGrace: 1,
      enemyAvoidBeforeLaunchGrace: 1,
      shotTriggerDuration: 1,
      shotTriggerKick: 0.18,
      bombTriggerDuration: 5,
      bombTriggerKick: 0.45,
      bombRateMul: 2.35,
      bombSpeedMul: 1.45
    },
    // Wider hot-core heat falloff so the danger zone reaches farther from the core.
    coreHeatRadius: 3.2,
    coreHeatRise: 22,
    coreHeatDecay: 10,
    mushroom: {
      lifeMin: 2,
      lifeMax: 3,
      speed: 4,
      radius: 0.25,
      pieces: 12,
      confuseTime: 5,
      stunTime: 3
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
    /** @type {Array<{x:number,y:number,vx:number,vy:number,life:number,maxLife:number,size:number}>} */
    iceShard: [],
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
  const waterRadius = isWater ? Math.max(0, outerRingR) : 0;
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
  let enemyVentNavMask = null;
  let enemyVentMaskActive = false;
  const ventAxes = (p) => {
    let nx = typeof p.nx === "number" ? p.nx : 0;
    let ny = typeof p.ny === "number" ? p.ny : 0;
    if (!nx && !ny) {
      const normal = planet.normalAtWorld ? planet.normalAtWorld(p.x, p.y) : null;
      nx = normal ? normal.nx : p.x / (Math.hypot(p.x, p.y) || 1);
      ny = normal ? normal.ny : p.y / (Math.hypot(p.x, p.y) || 1);
    }
    const nlen = Math.hypot(nx, ny) || 1;
    nx /= nlen;
    ny /= nlen;
    return { nx, ny, tx: -ny, ty: nx };
  };
  const ventCyclePhase = (p) => {
    const period = Math.max(1e-3, tuning.lava.ventPeriod);
    const raw = typeof p.ventT === "number" ? p.ventT : 0;
    return (raw % period + period) % period;
  };
  const ventBaseActive = (p) => ventCyclePhase(p) >= tuning.lava.ventPeriod - tuning.lava.flashDuration;
  const ventForcedActive = (p) => (p.ventShotT || 0) > 0 || (p.ventBombT || 0) > 0;
  const ventIsEmitting = (p) => ventBaseActive(p) || ventForcedActive(p);
  const ventBlocksEnemies = (p) => {
    if (p.type !== "vent" || p.dead) return false;
    if (ventForcedActive(p) || ventBaseActive(p)) return true;
    const phase = ventCyclePhase(p);
    const activeStart = tuning.lava.ventPeriod - tuning.lava.flashDuration;
    if (phase <= tuning.lava.enemyAvoidAfterLaunchGrace) return false;
    if (activeStart - phase <= tuning.lava.enemyAvoidBeforeLaunchGrace) return false;
    return true;
  };
  const pointInVentBody = (p, x, y, radius = 0) => {
    const { nx, ny, tx, ty } = ventAxes(p);
    const dx = x - p.x;
    const dy = y - p.y;
    const localX = dx * tx + dy * ty;
    const localY = dx * nx + dy * ny;
    const s = p.scale || 1;
    const halfH = 0.45 * s;
    const halfW0 = 0.22 * s;
    const halfW1 = 0.12 * s;
    if (localY < -halfH - radius || localY > halfH + radius) return false;
    const t = Math.max(0, Math.min(1, (localY + halfH) / (2 * halfH || 1)));
    const halfW = halfW0 + (halfW1 - halfW0) * t;
    return Math.abs(localX) <= halfW + radius;
  };
  const pointInVentPlume = (p, x, y, radius = 0) => {
    const { nx, ny } = ventAxes(p);
    const dx = x - p.x;
    const dy = y - p.y;
    const forward = dx * nx + dy * ny;
    if (forward < -radius || forward > tuning.lava.unsafeReach + radius) return false;
    const side = Math.abs(dx * -ny + dy * nx);
    const width = tuning.lava.unsafeBaseWidth + Math.max(0, forward) * tuning.lava.unsafeWidthGrow;
    return side <= width + radius;
  };
  const ensureVentUnsafeNodes = (p) => {
    if (p.ventUnsafeNodes) return;
    const graph = planet.radialGraph;
    const air = planet.airNodesBitmap;
    const nodes = [];
    if (graph && graph.nodes && air && air.length === graph.nodes.length) {
      for (let i = 0; i < graph.nodes.length; i++) {
        if (!air[i]) continue;
        const n = (
          /** @type {RadialNode} */
          graph.nodes[i]
        );
        if (pointInVentPlume(p, n.x, n.y, 0.08)) {
          nodes.push(i);
        }
      }
    }
    p.ventUnsafeNodes = nodes;
  };
  const rebuildEnemyVentNavMask = () => {
    const base = planet.airNodesBitmap;
    if (!base || !base.length || !props || !props.length) {
      enemyVentMaskActive = false;
      enemyVentNavMask = null;
      return;
    }
    let blocked = false;
    for (const p of props) {
      if (p.type !== "vent" || p.dead) continue;
      if (!ventBlocksEnemies(p)) continue;
      blocked = true;
      break;
    }
    enemyVentMaskActive = blocked;
    if (!blocked) {
      enemyVentNavMask = null;
      return;
    }
    if (!enemyVentNavMask || enemyVentNavMask.length !== base.length) {
      enemyVentNavMask = new Uint8Array(base.length);
    }
    enemyVentNavMask.set(base);
    for (const p of props) {
      if (p.type !== "vent" || p.dead) continue;
      if (!ventBlocksEnemies(p)) continue;
      ensureVentUnsafeNodes(p);
      const unsafeNodes = p.ventUnsafeNodes || [];
      for (const iNode of unsafeNodes) {
        if (iNode < 0 || iNode >= enemyVentNavMask.length) continue;
        enemyVentNavMask[iNode] = 0;
      }
    }
  };
  const emitVentLava = (p, dt, rateMul = 1, speedMul = 1) => {
    if (dt <= 0) return;
    const { nx, ny, tx, ty } = ventAxes(p);
    const rate = tuning.lava.burstRate * Math.max(0, rateMul) * dt;
    const emitCount = Math.max(0, Math.floor(rate));
    const frac = rate - emitCount;
    const total = emitCount + (Math.random() < frac ? 1 : 0);
    const speed = tuning.lava.speed * Math.max(0, speedMul);
    for (let i = 0; i < total; i++) {
      const jitter = (Math.random() * 2 - 1) * 0.25;
      const spread = (Math.random() * 2 - 1) * 0.35;
      const vx = (nx + tx * spread) * speed;
      const vy = (ny + ty * spread) * speed;
      particles.lava.push({
        x: p.x + nx * 0.12,
        y: p.y + ny * 0.12,
        vx: vx + jitter * 0.4 * Math.max(1, speedMul),
        vy: vy + jitter * 0.4 * Math.max(1, speedMul),
        life: tuning.lava.life
      });
    }
  };
  const triggerVentShot = (p) => {
    if (ventIsEmitting(p)) return false;
    p.ventShotT = Math.max(p.ventShotT || 0, tuning.lava.shotTriggerDuration);
    p.ventHeat = 1;
    emitVentLava(p, tuning.lava.shotTriggerKick, 1, 1);
    rebuildEnemyVentNavMask();
    return true;
  };
  const triggerVentBomb = (p) => {
    p.ventBombT = Math.max(p.ventBombT || 0, tuning.lava.bombTriggerDuration);
    p.ventHeat = 1;
    emitVentLava(p, tuning.lava.bombTriggerKick, tuning.lava.bombRateMul, tuning.lava.bombSpeedMul);
    rebuildEnemyVentNavMask();
    return true;
  };
  const emitIceShardBurst = (info, callbacks) => {
    if (!info) return;
    const x = info.x;
    const y = info.y;
    if (callbacks.onExplosion) {
      callbacks.onExplosion({ x, y, life: 0.5, radius: tuning.iceShard.blast });
    }
    const pieces = tuning.iceShard.piecesMin + Math.floor(Math.random() * (tuning.iceShard.piecesMax - tuning.iceShard.piecesMin + 1));
    const nLen = Math.hypot(info.nx, info.ny) || 1;
    const baseNx = info.nx / nLen;
    const baseNy = info.ny / nLen;
    const baseAng = Math.atan2(baseNy, baseNx);
    for (let i = 0; i < pieces; i++) {
      const t = pieces <= 1 ? 0.5 : i / (pieces - 1);
      const ang = baseAng + (t * 2 - 1) * tuning.iceShard.spread + (Math.random() * 2 - 1) * 0.16;
      const sp = tuning.iceShard.speedMin + Math.random() * (tuning.iceShard.speedMax - tuning.iceShard.speedMin);
      const maxLife = tuning.iceShard.range / sp;
      particles.iceShard.push({
        x: x + Math.cos(ang) * 0.1,
        y: y + Math.sin(ang) * 0.1,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp,
        life: maxLife,
        maxLife,
        size: tuning.iceShard.sizeMin + Math.random() * (tuning.iceShard.sizeMax - tuning.iceShard.sizeMin)
      });
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
        life: tuning.mushroom.lifeMin + Math.random() * (tuning.mushroom.lifeMax - tuning.mushroom.lifeMin)
      });
    }
  };
  const mushroomProximityRadius = 4;
  const mushroomLosStep = 0.2;
  const mushroomCandidatesNear = (x, y) => {
    if (!mushroomHazard || mushroomProximityRadius <= 0) return [];
    if (typeof mushroomHazard.listInRadius === "function") {
      return mushroomHazard.listInRadius(x, y, mushroomProximityRadius);
    }
    return [];
  };
  const triggerMushroomBurst = (info) => {
    if (!info) return;
    spawnMushroomBurst(info);
  };
  const handleShipContact = (x, y, radius, dt, callbacks) => {
    let hit = false;
    if (props && props.length) {
      for (const p of props) {
        if (p.type !== "vent" || p.dead) continue;
        if (pointInVentBody(p, x, y, radius)) {
          if (callbacks.onShipHeat) callbacks.onShipHeat(tuning.lava.ventContactHeatRise * Math.max(0, dt));
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
      const candidates = mushroomCandidatesNear(x, y);
      if (candidates.length) {
        let triggered = false;
        for (const candidate of candidates) {
          if (!lineOfSightAir(planet, x, y, candidate.x, candidate.y, mushroomLosStep)) continue;
          const info = mushroomHazard.burst(candidate);
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
    if (props && props.length) {
      for (const p of props) {
        if (p.type !== "vent" || p.dead) continue;
        const sourceHit = pointInVentBody(p, x, y, radius);
        if (!sourceHit) continue;
        triggerVentShot(p);
        hit = true;
        break;
      }
    }
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
    if (props && props.length) {
      const ventRadius = Math.max(impactRadius, bombRadius);
      let triggeredVent = false;
      for (const p of props) {
        if (p.type !== "vent" || p.dead) continue;
        const sourceHit = pointInVentBody(p, x, y, ventRadius);
        if (!sourceHit) continue;
        triggerVentBomb(p);
        triggeredVent = true;
      }
      if (triggeredVent) hit = true;
    }
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
        const e = (
          /** @type {{x:number,y:number,hp:number,hitT?:number,stunT?:number}} */
          state.enemies[i]
        );
        const r2 = e.x * e.x + e.y * e.y;
        if (r2 <= coreR2) e.hp = 0;
      }
    }
    if (state.miners) {
      for (let i = state.miners.length - 1; i >= 0; i--) {
        const m = (
          /** @type {import("./types.d.js").Miner} */
          state.miners[i]
        );
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
      p.ventShotT = Math.max(0, (p.ventShotT || 0) - dt);
      p.ventBombT = Math.max(0, (p.ventBombT || 0) - dt);
      const baseActive = ventBaseActive(p);
      const bombActive = (p.ventBombT || 0) > 0;
      const shotActive = (p.ventShotT || 0) > 0;
      const active = baseActive || shotActive || bombActive;
      p.ventHeat = active ? 1 : 0;
      if (!active) continue;
      const rateMul = bombActive ? tuning.lava.bombRateMul : 1;
      const speedMul = bombActive ? tuning.lava.bombSpeedMul : 1;
      emitVentLava(p, dt, rateMul, speedMul);
    }
    rebuildEnemyVentNavMask();
  };
  const updateLavaParticles = (dt, state) => {
    const lava = particles.lava;
    if (!lava.length) return;
    const hitR2 = tuning.lava.radius * tuning.lava.radius;
    for (let i = lava.length - 1; i >= 0; i--) {
      const p = (
        /** @type {{x:number,y:number,vx:number,vy:number,life:number}} */
        lava[i]
      );
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
          const e = (
            /** @type {{x:number,y:number,hp:number,hitT?:number,stunT?:number}} */
            state.enemies[j]
          );
          const dx = e.x - p.x;
          const dy = e.y - p.y;
          if (dx * dx + dy * dy <= hitR2) {
            if (state.onEnemyStun) state.onEnemyStun(e, tuning.lava.stunTime, "lava");
            lava.splice(i, 1);
            hit = true;
            break;
          }
        }
      }
      if (hit) continue;
      if (state.miners) {
        for (let j = state.miners.length - 1; j >= 0; j--) {
          const m = (
            /** @type {import("./types.d.js").Miner} */
            state.miners[j]
          );
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
      const p = (
        /** @type {{x:number,y:number,vx:number,vy:number,life:number}} */
        mush[i]
      );
      const xPrev = p.x;
      const yPrev = p.y;
      const sporeDrag = -0.25;
      const vSquared = p.vx * p.vx + p.vy * p.vy;
      p.vx += p.vx * sporeDrag * vSquared * dt;
      p.vy += p.vy * sporeDrag * vSquared * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        mush.splice(i, 1);
        continue;
      }
      const crossing = planet.terrainCrossing({ x: xPrev, y: yPrev }, { x: p.x, y: p.y });
      if (crossing) {
        const nx = crossing.nx;
        const ny = crossing.ny;
        const vn = p.vx * nx + p.vy * ny;
        if (vn < 0) {
          const impulse = -1.72 * vn;
          p.vx += impulse * nx;
          p.vy += impulse * ny;
        }
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.x = xPrev;
        p.y = yPrev;
        if (planet.airValueAtWorld(p.x, p.y) <= 0.5) {
          p.x += nx * 0.05;
          p.y += ny * 0.05;
        }
      }
      if (mushroomHazard) {
        const hitProp = mushroomHazard.hitAt(p.x, p.y, tuning.mushroom.radius);
        if (hitProp) {
          const info = mushroomHazard.burst(hitProp);
          triggerMushroomBurst(info);
          mush.splice(i, 1);
          continue;
        }
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
        const e = (
          /** @type {{x:number,y:number,hp:number,hitT?:number,stunT?:number}} */
          state.enemies[j]
        );
        const dx = e.x - p.x;
        const dy = e.y - p.y;
        if (dx * dx + dy * dy <= hitR2) {
          if (state.onEnemyStun) state.onEnemyStun(e, tuning.mushroom.stunTime, "mushroom");
          mush.splice(i, 1);
          break;
        }
      }
    }
  };
  const updateIceShardParticles = (dt, state) => {
    const ice = particles.iceShard;
    if (!ice.length) return;
    const hitR2 = tuning.iceShard.radius * tuning.iceShard.radius;
    for (let i = ice.length - 1; i >= 0; i--) {
      const p = (
        /** @type {{x:number,y:number,vx:number,vy:number,life:number}} */
        ice[i]
      );
      const xPrev = p.x;
      const yPrev = p.y;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      const crossing = planet.terrainCrossing ? planet.terrainCrossing({ x: xPrev, y: yPrev }, { x: p.x, y: p.y }) : null;
      if (p.life <= 0 || crossing || planet.airValueAtWorld(p.x, p.y) <= 0.5) {
        ice.splice(i, 1);
        continue;
      }
      if (state.ship) {
        const dxs = state.ship.x - p.x;
        const dys = state.ship.y - p.y;
        if (dxs * dxs + dys * dys <= hitR2) {
          if (state.onShipDamage) state.onShipDamage(p.x, p.y);
          ice.splice(i, 1);
          continue;
        }
      }
      let hit = false;
      if (state.enemies) {
        for (let j = state.enemies.length - 1; j >= 0; j--) {
          const e = (
            /** @type {{x:number,y:number,hp:number,hitT?:number,stunT?:number}} */
            state.enemies[j]
          );
          const dx = e.x - p.x;
          const dy = e.y - p.y;
          if (dx * dx + dy * dy <= hitR2) {
            if (state.onEnemyHit) state.onEnemyHit(e, p.x, p.y);
            ice.splice(i, 1);
            hit = true;
            break;
          }
        }
      }
      if (hit) continue;
      if (state.miners) {
        for (let j = state.miners.length - 1; j >= 0; j--) {
          const m = (
            /** @type {import("./types.d.js").Miner} */
            state.miners[j]
          );
          const dx = m.x - p.x;
          const dy = m.y - p.y;
          if (dx * dx + dy * dy <= hitR2) {
            state.miners.splice(j, 1);
            if (state.onMinerKilled) state.onMinerKilled(m);
            ice.splice(i, 1);
            break;
          }
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
        const p = (
          /** @type {{x:number,y:number,vx:number,vy:number,life:number,maxLife:number,size:number,rot:number,spin:number}} */
          bubbles[i]
        );
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
        const p = (
          /** @type {{x:number,y:number,vx:number,vy:number,life:number,maxLife:number,size:number,rot:number,cr:number,cg:number,cb:number}} */
          splashes[i]
        );
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
  rebuildEnemyVentNavMask();
  return {
    getParticles: () => particles,
    clearParticles: () => {
      particles.iceShard.length = 0;
      particles.lava.length = 0;
      particles.mushroom.length = 0;
      particles.bubbles.length = 0;
      particles.splashes.length = 0;
    },
    getEnemyNavigationMask: () => {
      if (!enemyVentMaskActive || !enemyVentNavMask) return planet.airNodesBitmap;
      return enemyVentNavMask;
    },
    /** @param {{enemies:Array<{x:number,y:number}>, miners:Array<{x:number,y:number}>}} state */
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
      rebuildEnemyVentNavMask();
    },
    /**
     * @param {number} dt
     * @param {FeatureUpdateState} state
     */
    update: (dt, state) => {
      updateCoreHeat(dt, state);
      updateVents(dt);
      updateIceShardParticles(dt, state);
      updateLavaParticles(dt, state);
      updateMushroomParticles(dt, state);
      updateWaterBubbles(dt, state);
    },
    /**
     * @param {DetachedTerrainProp[]} detachedProps
     * @param {FeatureCallbacks} callbacks
     */
    emitDetachedPropBursts: (detachedProps, callbacks) => {
      if (!detachedProps || !detachedProps.length) return;
      for (const p of detachedProps) {
        if (!p) continue;
        if (p.type === "ridge_spike" || p.type === "stalactite") {
          emitRidgeSpikeBurst({ x: p.x, y: p.y, scale: p.scale || 1 }, callbacks, false);
          continue;
        }
        if (p.type === "ice_shard") {
          emitIceShardBurst({
            x: p.x,
            y: p.y,
            scale: p.scale || 1,
            nx: Number.isFinite(p.nx) ? (
              /** @type {number} */
              p.nx
            ) : 0,
            ny: Number.isFinite(p.ny) ? (
              /** @type {number} */
              p.ny
            ) : 0
          }, callbacks);
        }
      }
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
          const waterSurfaceR = Math.max(0, Math.floor(params.RMAX));
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
  const isAliveShard = (p) => p.type === "ice_shard" && !p.dead && !(typeof p.hp === "number" && p.hp <= 0);
  const burstProp = (prop) => {
    if (!isAliveShard(prop)) return null;
    prop.dead = true;
    prop.hp = 0;
    let nx = typeof prop.nx === "number" ? prop.nx : 0;
    let ny = typeof prop.ny === "number" ? prop.ny : 0;
    let len = Math.hypot(nx, ny);
    if (len < 1e-4) {
      len = Math.hypot(prop.x, prop.y) || 1;
      nx = prop.x / len;
      ny = prop.y / len;
    } else {
      nx /= len;
      ny /= len;
    }
    return { x: prop.x, y: prop.y, scale: prop.scale || 1, nx, ny };
  };
  return {
    burst: (prop) => {
      return burstProp(prop);
    },
    hitAt: (x, y, radius) => {
      for (const p of props) {
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
      for (const p of props) {
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
      for (const p of props) {
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
      for (const p of props) {
        if (!isAlive(p)) continue;
        if (overlapsSpike(p, x, y, radius)) {
          return p;
        }
      }
      return null;
    },
    burstAllInRadius: (x, y, radius) => {
      const bursts = [];
      for (const p of props) {
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
      for (const p of props) {
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
      for (const p of props) {
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
    listInRadius: (x, y, radius) => {
      const out = [];
      for (const p of props) {
        if (!isAlive(p)) continue;
        const sr = 0.28 * (p.scale || 1);
        const dx = p.x - x;
        const dy = p.y - y;
        const r2 = (radius + sr) * (radius + sr);
        if (dx * dx + dy * dy <= r2) {
          out.push(p);
        }
      }
      return out;
    },
    burstAllInRadius: (x, y, radius) => {
      const bursts = [];
      for (const p of props) {
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
      for (const p of props) {
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
function getFactorySpawnCooldownRange(cfg) {
  const min = cfg && typeof cfg.factorySpawnCooldownMin === "number" ? cfg.factorySpawnCooldownMin : 6.5;
  const max = cfg && typeof cfg.factorySpawnCooldownMax === "number" ? cfg.factorySpawnCooldownMax : 10.5;
  const lo = Math.max(0.1, Math.min(min, max));
  const hi = Math.max(lo, Math.max(min, max));
  return { min: lo, max: hi };
}
function expectDefined$1(value) {
  if (value == null) {
    throw new Error("Expected value to be defined");
  }
  return value;
}
class Planet {
  /**
   * @param {{seed:number, planetConfig: import("./planet_config.js").PlanetConfig, planetParams: import("./planet_config.js").PlanetParams, mapWorld?:import("./types.d.js").MapWorld|null}} deps
   */
  constructor({ seed, planetConfig, planetParams, mapWorld = null }) {
    if (!planetConfig) {
      throw new Error("Planet requires a planetConfig");
    }
    if (!planetParams) {
      throw new Error("Planet requires planetParams");
    }
    this.planetConfig = planetConfig;
    this.planetParams = planetParams;
    this.coreRadius = this._coreRadiusWorld();
    this.mapgen = new MapGen(seed, planetParams, mapWorld);
    const rPlanet = planetParams.RMAX ?? CFG.RMAX;
    this.planetRadius = rPlanet;
    const surfaceG = typeof planetParams.SURFACE_G === "number" ? planetParams.SURFACE_G : 2;
    this.gravitationalConstant = surfaceG * rPlanet * rPlanet;
    this.radial = new RingMesh(this.mapgen, planetParams);
    this.radialGraph = new RadialGraph(this.radial);
    this.airNodesBitmap = buildAirNodesBitmap(this.radialGraph, this.radial);
    this.radialGraphNavPadded = new RadialGraph(this.radial, {
      navPadding: 0.75
    });
    this.airNodesBitmapNavPadded = buildAirNodesBitmap(this.radialGraphNavPadded, this.radial);
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
    this._enemyNavigationMaskNavPadded = null;
    this._rebuildSpawnReachabilityMask();
    this._spreadIceShardsUniform();
    this._snapIceShardsToSurface();
    this._alignTurretPadsToSurface();
    this._alignVentsToSurface();
    this._alignGaiaFlora();
    this._alignSurfaceDebris();
    this._alignCavernDebris();
    this._refreshTerrainPropSupportNodes();
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
   *  iceShard:Array<{x:number,y:number,vx:number,vy:number,life:number,maxLife:number,size:number}>,
   *  lava:Array<{x:number,y:number,vx:number,vy:number,life:number}>,
   *  mushroom:Array<{x:number,y:number,vx:number,vy:number,life:number}>,
   *  bubbles:Array<{x:number,y:number,vx:number,vy:number,life:number,maxLife:number,size:number,rot:number,spin:number}>,
   *  splashes:Array<{x:number,y:number,vx:number,vy:number,life:number,maxLife:number,size:number,rot:number,cr:number,cg:number,cb:number}>
   * }}
   */
  getFeatureParticles() {
    return this.features ? this.features.getParticles() : { iceShard: [], lava: [], mushroom: [], bubbles: [], splashes: [] };
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
   *  enemies: Array<{x:number,y:number,hp:number,hitT?:number,stunT?:number}>,
   *  miners: import("./types.d.js").Miner[],
   *  onShipDamage?: (x:number, y:number)=>void,
   *  onShipHeat?: (amount:number)=>void,
   *  onShipConfuse?: (duration:number)=>void,
   *  onEnemyHit?: (enemy:{x:number,y:number,hp:number,hitT?:number,stunT?:number}, x:number, y:number)=>void,
   *  onEnemyStun?: (enemy:{x:number,y:number,hp:number,hitT?:number,stunT?:number}, duration:number, source?:"mushroom"|"lava")=>void,
   *  onMinerKilled?: (miner:import("./types.d.js").Miner)=>void,
   * }} state
   * @returns {void}
   */
  updateFeatureEffects(dt, state) {
    if (this.features) this.features.update(dt, state);
  }
  /**
   * @param {boolean} [navPadded]
   * @returns {RadialGraph}
   */
  getRadialGraph(navPadded = false) {
    return navPadded ? this.radialGraphNavPadded : this.radialGraph;
  }
  /**
   * @param {boolean} [navPadded]
   * @returns {Uint8Array}
   */
  getAirNodesBitmap(navPadded = false) {
    return navPadded ? this.airNodesBitmapNavPadded : this.airNodesBitmap;
  }
  /**
   * @returns {Uint8Array}
   */
  getEnemyNavigationMask(navPadded = false) {
    const baseMask = this.features && this.features.getEnemyNavigationMask ? this.features.getEnemyNavigationMask() : this.airNodesBitmap;
    if (!navPadded) return baseMask;
    const navPaddedBase = this.airNodesBitmapNavPadded;
    if (!navPaddedBase || baseMask.length === navPaddedBase.length) {
      return baseMask;
    }
    if (!this._enemyNavigationMaskNavPadded || this._enemyNavigationMaskNavPadded.length !== navPaddedBase.length) {
      this._enemyNavigationMaskNavPadded = new Uint8Array(navPaddedBase.length);
    }
    this._enemyNavigationMaskNavPadded.set(navPaddedBase);
    this._enemyNavigationMaskNavPadded.set(baseMask.subarray(0, Math.min(baseMask.length, navPaddedBase.length)));
    return this._enemyNavigationMaskNavPadded;
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
   * @param {number} dt
   * @param {{
   *  onExplosion?: (info:{x:number,y:number,life:number,radius:number})=>void,
   *  onDebris?: (info:{x:number,y:number,vx:number,vy:number,a:number,w:number,life:number})=>void,
   *  onAreaDamage?: (x:number, y:number, radius:number)=>void,
   * }} callbacks
   * @returns {boolean}
   */
  handleFeatureContact(x, y, radius, dt, callbacks) {
    if (!this.features) return false;
    return this.features.handleShipContact(x, y, radius, dt, callbacks);
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
   * @param {boolean} [navPadded]
   * @returns {number}
   */
  nearestRadialNodeInAir(x, y, navPadded = false) {
    const graph = this.getRadialGraph(navPadded);
    const iNode = nearestRadialNode(graph, this.radial, x, y);
    if (iNode < 0 || iNode >= graph.nodes.length) return -1;
    const air = this.getAirNodesBitmap(navPadded);
    if (air[iNode]) return iNode;
    const hasAirNeighbor = (idx) => {
      const neigh = graph.neighbors[idx] || [];
      for (const edge of neigh) {
        if (air[edge.to]) return true;
      }
      return false;
    };
    const visited = new Uint8Array(graph.nodes.length);
    let frontier = [iNode];
    visited[iNode] = 1;
    let bestMovable = -1;
    let bestMovableDistSqr = Infinity;
    let best = -1;
    let bestDistSqr = Infinity;
    const maxHops = 6;
    for (let hop = 0; hop < maxHops && frontier.length; hop++) {
      const next = [];
      for (const idx of frontier) {
        if (air[idx]) {
          const node = graph.nodes[idx];
          if (!node) continue;
          const dx = x - node.x;
          const dy = y - node.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < bestDistSqr) {
            bestDistSqr = d2;
            best = idx;
          }
          if (hasAirNeighbor(idx) && d2 < bestMovableDistSqr) {
            bestMovableDistSqr = d2;
            bestMovable = idx;
          }
        }
        const neigh = graph.neighbors[idx] || [];
        for (const edge of neigh) {
          const j = edge.to;
          if (visited[j]) continue;
          visited[j] = 1;
          next.push(j);
        }
      }
      if (bestMovable >= 0) return bestMovable;
      if (best >= 0) return best;
      frontier = next;
    }
    for (let i = 0; i < graph.nodes.length; i++) {
      if (!air[i]) continue;
      const node = graph.nodes[i];
      if (!node) continue;
      const dx = x - node.x;
      const dy = y - node.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestDistSqr) {
        bestDistSqr = d2;
        best = i;
      }
      if (hasAirNeighbor(i) && d2 < bestMovableDistSqr) {
        bestMovableDistSqr = d2;
        bestMovable = i;
      }
    }
    if (bestMovable >= 0) return bestMovable;
    return best >= 0 ? best : iNode;
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} range
   * @param {number} [maxTargets]
   * @returns {{newAir:Float32Array|undefined,destroyedNodes:Array<{idx:number,x:number,y:number,nx?:number,ny?:number}>}|undefined}
   */
  destroyRockRadialNodesInRange(x, y, range, maxTargets = Infinity) {
    const graph = this.radialGraph;
    const nodes = graph && graph.nodes ? graph.nodes : null;
    const air = this.airNodesBitmap;
    if (!nodes || !nodes.length || !air || air.length !== nodes.length) return void 0;
    const limit = Number.isFinite(maxTargets) ? Math.max(1, Math.floor(maxTargets)) : Infinity;
    const rangeClamped = Math.max(0, range);
    const rangeSq = rangeClamped * rangeClamped;
    const coreRadius = Math.max(0, this.coreRadius || 0);
    const candidates = [];
    for (let i = 0; i < nodes.length; i++) {
      if (air[i]) continue;
      const node = nodes[i];
      if (!node || node.navPadded) continue;
      if (coreRadius > 0 && Math.hypot(node.x, node.y) <= coreRadius) continue;
      const dx = node.x - x;
      const dy = node.y - y;
      const d2 = dx * dx + dy * dy;
      if (d2 > rangeSq) continue;
      candidates.push({ idx: i, d2 });
    }
    if (!candidates.length) return void 0;
    candidates.sort((a, b) => a.d2 - b.d2);
    let edited = false;
    const destroyedNodes = [];
    for (let i = 0; i < candidates.length && i < limit; i++) {
      const candidate = candidates[i];
      if (!candidate) continue;
      const node = nodes[candidate.idx];
      if (!node) continue;
      const normal = this.normalAtWorld(node.x, node.y);
      const changed = this.mapgen.setAirAtWorld(node.x, node.y, 1);
      edited = changed || edited;
      if (!changed) continue;
      if (normal) {
        destroyedNodes.push({ idx: candidate.idx, x: node.x, y: node.y, nx: normal.nx, ny: normal.ny });
      } else {
        destroyedNodes.push({ idx: candidate.idx, x: node.x, y: node.y });
      }
    }
    if (!edited) return void 0;
    return { newAir: this._refreshAirAfterEdit(), destroyedNodes };
  }
  /**
   * Mark terrain-attached props whose support nodes were destroyed.
   * @param {DestroyedTerrainNode[]} destroyedNodes
   * @returns {DetachedTerrainProp[]}
   */
  destroyTerrainPropsAttachedToNodes(destroyedNodes) {
    if (!destroyedNodes || !destroyedNodes.length || !this.props || !this.props.length) return [];
    const destroyedProps = [];
    const destroyedNodeIndices = new Set(destroyedNodes.map((node) => node.idx));
    for (const p of this.props) {
      if (!p || p.dead) continue;
      if (p.type !== "tree" && p.type !== "boulder" && p.type !== "ridge_spike" && p.type !== "stalactite" && p.type !== "ice_shard") continue;
      const scale = Math.max(0.2, p.scale || 1);
      const supportIndices = Array.isArray(p.supportNodeIndices) && p.supportNodeIndices.length ? p.supportNodeIndices : Number.isFinite(p.supportNodeIndex) ? [Number(p.supportNodeIndex)] : [];
      if (!supportIndices.length) continue;
      let detached = false;
      for (const idx of supportIndices) {
        if (!destroyedNodeIndices.has(idx)) continue;
        detached = true;
        break;
      }
      if (!detached) continue;
      p.dead = true;
      destroyedProps.push({
        type: p.type,
        x: p.x,
        y: p.y,
        scale,
        nx: p.nx,
        ny: p.ny,
        rot: p.rot
      });
    }
    return destroyedProps;
  }
  /**
   * @param {DetachedTerrainProp[]} detachedProps
   * @param {{onExplosion?:(info:{x:number,y:number,life:number,radius:number})=>void,onDebris?:(info:{x:number,y:number,vx:number,vy:number,a:number,w:number,life:number})=>void,onAreaDamage?:(x:number,y:number,radius:number)=>void,onShipDamage?:(x:number,y:number)=>void,onShipHeat?:(amount:number)=>void,onShipCrash?:(x:number,y:number)=>void,onShipConfuse?:(duration:number)=>void}|null|undefined} callbacks
   * @returns {void}
   */
  emitDetachedTerrainPropBursts(detachedProps, callbacks) {
    if (!detachedProps || !detachedProps.length || !callbacks || !this.features || !this.features.emitDetachedPropBursts) return;
    this.features.emitDetachedPropBursts(detachedProps, callbacks);
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
    const nodeTarget = this.nearestRadialNodeInAir(x, y);
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
      if (!p || !pt) continue;
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
      const minDist = 0.35;
      const rand = mulberry32$1(seed);
      const standable = this._standablePoints && this._standablePoints.length ? this._standablePoints : this._buildStandablePoints();
      const bandPoints = standable.filter((p) => p[3] >= surfaceR && p[3] <= rMax);
      const flatPoints = bandPoints.filter((p) => {
        const normal = this.normalAtWorld(p[0], p[1]);
        if (!normal) return false;
        const r2 = Math.hypot(p[0], p[1]) || 1;
        const nx = p[0] / r2;
        const ny = p[1] / r2;
        const dot = normal.nx * nx + normal.ny * ny;
        return dot >= 0.98;
      });
      const pool = flatPoints.length ? flatPoints : bandPoints.length ? bandPoints : standable;
      const shuffled = pool.slice();
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        const tmp = expectDefined$1(shuffled[i]);
        shuffled[i] = expectDefined$1(shuffled[j]);
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
        points.push(sp);
      }
      for (let i = 0; i < trees.length; i++) {
        const p = trees[i];
        if (!p) continue;
        if (i >= points.length) {
          p.dead = true;
          continue;
        }
        const pt = points[i];
        if (!pt) continue;
        p.supportX = pt[0];
        p.supportY = pt[1];
        p.supportNodeIndex = pt[4];
        p.x = pt[0];
        p.y = pt[1];
        const normal = this.normalAtWorld(p.x, p.y);
        if (normal) {
          p.nx = normal.nx;
          p.ny = normal.ny;
          const recess = 0.02;
          p.x -= normal.nx * recess;
          p.y -= normal.ny * recess;
        }
      }
    }
    if (mush.length) {
      const seed = (this.mapgen.getWorld().seed | 0) + 877;
      const points = this.sampleUndergroundPoints(mush.length, seed, "random");
      for (let i = 0; i < mush.length && i < points.length; i++) {
        const p = mush[i];
        const pt = points[i];
        if (!p || !pt) continue;
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
      if (!p) continue;
      const pt = points[i];
      if (!pt) {
        p.dead = true;
        continue;
      }
      p.supportX = pt[0];
      p.supportY = pt[1];
      p.supportNodeIndex = this._findStandableSupportNodeIndex(pt[0], pt[1]);
      p.x = pt[0];
      p.y = pt[1];
      const info = this.normalAtWorld(p.x, p.y);
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
   * @returns {Array<{x:number,y:number,nx:number,ny:number,supportNodeIndex:number}>}
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
      if (!n) continue;
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
      candidates.push({ x: hi.x, y: hi.y, nx, ny, supportNodeIndex: rockNeighbor.i });
    }
    const rand = mulberry32$1(seed);
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const tmp = expectDefined$1(candidates[i]);
      candidates[i] = expectDefined$1(candidates[j]);
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
      if (!p) return;
      const pt = points[cursor++];
      if (!pt) {
        p.dead = true;
        return;
      }
      p.nx = pt.nx;
      p.ny = pt.ny;
      p.supportX = pt.x;
      p.supportY = pt.y;
      p.supportNodeIndex = pt.supportNodeIndex;
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
    const factorySpawnCooldown = getFactorySpawnCooldownRange(cfg);
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
            if (!sp) continue;
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
        if (!pt) {
          factory.dead = true;
          return;
        }
        factory.x = pt[0];
        factory.y = pt[1];
        const normal = this.normalAtWorld(factory.x, factory.y);
        if (normal) {
          factory.nx = normal.nx;
          factory.ny = normal.ny;
          factory.x -= normal.nx * (0.05 * (factory.scale || 1));
          factory.y -= normal.ny * (0.05 * (factory.scale || 1));
          factory.rot = Math.atan2(normal.ny, normal.nx) - Math.PI * 0.5;
        }
        factory.propId = iFactory;
        factory.hp = typeof factory.hp === "number" ? Math.max(1, factory.hp) : 5;
        factory.spawnCd = factorySpawnCooldown.min + rand() * (factorySpawnCooldown.max - factorySpawnCooldown.min);
        factory.spawnT = rand() * factory.spawnCd;
      };
      for (let i = 0; i < tethers.length; i++) {
        const tether = tethers[i];
        if (!tether) continue;
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
      if (!p) continue;
      const pt = factoryPts[i];
      if (!pt) {
        p.dead = true;
        continue;
      }
      p.x = pt[0];
      p.y = pt[1];
      const normal = this.normalAtWorld(p.x, p.y);
      if (normal) {
        p.nx = normal.nx;
        p.ny = normal.ny;
        p.x -= normal.nx * (0.05 * (p.scale || 1));
        p.y -= normal.ny * (0.05 * (p.scale || 1));
        p.rot = Math.atan2(normal.ny, normal.nx) - Math.PI * 0.5;
      }
      p.propId = i;
      p.hp = typeof p.hp === "number" ? Math.max(1, p.hp) : 5;
      p.spawnCd = factorySpawnCooldown.min + rand() * (factorySpawnCooldown.max - factorySpawnCooldown.min);
      p.spawnT = rand() * p.spawnCd;
    }
    const gatePts = this.sampleStandablePoints(gates.length, seed + 97, "clusters", 2, false);
    for (let i = 0; i < gates.length; i++) {
      const p = gates[i];
      if (!p) continue;
      const pt = gatePts[i];
      if (!pt) {
        p.dead = true;
        continue;
      }
      p.x = pt[0];
      p.y = pt[1];
      const normal = this.normalAtWorld(p.x, p.y);
      if (normal) {
        p.nx = normal.nx;
        p.ny = normal.ny;
        p.x -= normal.nx * (0.03 * (p.scale || 1));
        p.y -= normal.ny * (0.03 * (p.scale || 1));
        p.rot = Math.atan2(normal.ny, normal.nx) - Math.PI * 0.5;
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
      let normal = this.normalAtWorld(p.x, p.y);
      if (!normal) {
        p.dead = true;
        p.hp = 0;
        continue;
      }
      if (this.airValueAtWorld(p.x, p.y) > 0.5) {
        for (let i = 0; i < 6; i++) {
          p.x -= normal.nx * 0.06;
          p.y -= normal.ny * 0.06;
          if (this.airValueAtWorld(p.x, p.y) <= 0.5) break;
        }
      } else {
        const res = this.nudgeOutOfTerrain(p.x, p.y, 0.8, 0.08, 0.18);
        if (res.ok) {
          p.x = res.x;
          p.y = res.y;
        }
      }
      normal = this.normalAtWorld(p.x, p.y);
      if (!normal) {
        p.dead = true;
        p.hp = 0;
        continue;
      }
      p.x -= normal.nx * 0.03;
      p.y -= normal.ny * 0.03;
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
      if (!p) continue;
      const pt = points[i % points.length];
      if (!pt) continue;
      p.x = pt[0];
      p.y = pt[1];
      const normal = this.normalAtWorld(p.x, p.y);
      if (normal) {
        const tx = -normal.ny;
        const ty = normal.nx;
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
   * @param {number} a
   * @param {number} b
   * @returns {number}
   */
  _angleDistance(a, b) {
    let d = Math.abs(a - b);
    if (d > Math.PI) d = Math.abs(d - Math.PI * 2);
    return d;
  }
  /**
   * @param {number} a
   * @returns {number}
   */
  _normalizeAngle(a) {
    const tau = Math.PI * 2;
    let out = a % tau;
    if (out < 0) out += tau;
    return out;
  }
  /**
   * Check whether a turret pad has rock support under both shoulders.
   * @param {number} x
   * @param {number} y
   * @param {number} [scale]
   * @param {number} [eps]
   * @returns {{ok:boolean, plusOk:boolean, minusOk:boolean, info:{nx:number,ny:number,slope:number}|null, tx:number, ty:number}}
   */
  _turretPadSupportAtWorld(x, y, scale = 0.55, eps = 0.18) {
    const normal = this._upAlignedNormalAtWorld(x, y);
    const slope = this._surfaceSlopeAtWorld(x, y, normal);
    if (!normal || slope === null) {
      return { ok: false, plusOk: false, minusOk: false, info: null, tx: 0, ty: 0 };
    }
    const tx = -normal.ny;
    const ty = normal.nx;
    const shoulder = 0.55 * scale + 0.08;
    const airClearance = 0.12;
    const rockDepth = 0.09;
    const shoulderSupported = (dir) => {
      const sx = x + tx * shoulder * dir;
      const sy = y + ty * shoulder * dir;
      return this.airValueAtWorld(sx + normal.nx * airClearance, sy + normal.ny * airClearance) > 0.5 && this.airValueAtWorld(sx - normal.nx * rockDepth, sy - normal.ny * rockDepth) <= 0.5;
    };
    const plusOk = shoulderSupported(1);
    const minusOk = shoulderSupported(-1);
    const ok = this.isLandableAtWorld(x, y, 0.45, 0.16, eps) && plusOk && minusOk;
    return { ok, plusOk, minusOk, info: { nx: normal.nx, ny: normal.ny, slope }, tx, ty };
  }
  /**
   * Read the two ordered ring vertices on either side of an angle.
   * @param {number} ringIndex
   * @param {number} angle
   * @returns {{ring:Array<{x:number,y:number,air:number}>,minusIdx:number,plusIdx:number,minusVertex:{x:number,y:number,air:number},plusVertex:{x:number,y:number,air:number}}|null}
   */
  _ringVerticesAroundAngle(ringIndex, angle) {
    const rings = this.radial && this.radial.rings ? this.radial.rings : null;
    if (!rings || ringIndex < 0 || ringIndex >= rings.length) return null;
    const ring = rings[ringIndex];
    if (!ring || !ring.length) return null;
    const target = this._normalizeAngle(angle);
    let plusIdx = 0;
    let plusDiff = Infinity;
    for (let i = 0; i < ring.length; i++) {
      const v = ring[i];
      if (!v) continue;
      const ang = this._normalizeAngle(Math.atan2(v.y, v.x));
      let diff = ang - target;
      if (diff < 0) diff += Math.PI * 2;
      if (diff < plusDiff) {
        plusDiff = diff;
        plusIdx = i;
      }
    }
    const minusIdx = (plusIdx - 1 + ring.length) % ring.length;
    return {
      ring,
      minusIdx,
      plusIdx,
      minusVertex: expectDefined$1(ring[minusIdx]),
      plusVertex: expectDefined$1(ring[plusIdx])
    };
  }
  /**
   * Flood-fill radial graph air connectivity from outer-ring air vertices.
   * @returns {Uint8Array}
   */
  _buildOuterAirReachableMask() {
    const graph = this.radialGraph;
    const rings = this.radial && this.radial.rings ? this.radial.rings : null;
    if (!graph || !graph.nodes || !graph.neighbors || !graph.nodeOfRef || !rings || !rings.length) {
      return new Uint8Array(0);
    }
    const reachable = new Uint8Array(graph.nodes.length);
    const queue = [];
    const outerRing = rings[rings.length - 1] || [];
    for (const vertex of outerRing) {
      if (!vertex || vertex.air <= 0.5) continue;
      const idx = graph.nodeOfRef.get(vertex);
      if (idx === void 0 || reachable[idx]) continue;
      reachable[idx] = 1;
      queue.push(idx);
    }
    for (let q = 0; q < queue.length; q++) {
      const idx = expectDefined$1(queue[q]);
      const neigh = graph.neighbors[idx] || [];
      for (const edge of neigh) {
        const next = edge.to;
        if (reachable[next]) continue;
        const node = graph.nodes[next];
        if (!node) continue;
        const ring = rings[node.r];
        const vertex = ring && ring[node.i];
        if (!vertex || vertex.air <= 0.5) continue;
        reachable[next] = 1;
        queue.push(next);
      }
    }
    return reachable;
  }
  /**
   * @param {Array<any>} items
   * @param {number} seed
   * @returns {Array<any>}
   */
  _shuffleDeterministic(items, seed) {
    const out = items.slice();
    const rand = mulberry32$1(seed | 0);
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }
  /**
   * @param {number} ring
   * @param {number} seed
   * @returns {number}
   */
  _ringShuffleSeed(ring, seed) {
    return (seed | 0) ^ ((ring + 1) * 2654435761 | 0) | 0;
  }
  /**
   * @returns {Array<{x:number,y:number,angle:number,r:number,ring:number,depth:number,anchorKind:"outer_rock"|"under_air",sourceKind:"rock"|"air",sourceRing:number,sourceIndex:number}>}
   */
  _buildBarrenPadCandidates() {
    const graph = this.radialGraph;
    const rings = this.radial && this.radial.rings ? this.radial.rings : null;
    if (!graph || !graph.nodes || !graph.neighbors || !graph.nodeOfRef || !rings || !rings.length) {
      return [];
    }
    const outerRingIndex = rings.length - 1;
    const reachableAir = this._buildOuterAirReachableMask();
    const out = [];
    const seen = /* @__PURE__ */ new Set();
    const outerRing = rings[outerRingIndex] || [];
    for (let i = 0; i < outerRing.length; i++) {
      const vertex = outerRing[i];
      if (!vertex || vertex.air > 0.5) continue;
      const key = `outer:${outerRingIndex}:${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        x: vertex.x,
        y: vertex.y,
        angle: Math.atan2(vertex.y, vertex.x),
        r: Math.hypot(vertex.x, vertex.y),
        ring: outerRingIndex,
        depth: 0,
        anchorKind: "outer_rock",
        sourceKind: "rock",
        sourceRing: outerRingIndex,
        sourceIndex: i
      });
    }
    for (let ringIndex = outerRingIndex - 1; ringIndex >= 0; ringIndex--) {
      const upperRing = rings[ringIndex + 1] || [];
      for (let airIndex = 0; airIndex < upperRing.length; airIndex++) {
        const airVertex = upperRing[airIndex];
        if (!airVertex || airVertex.air <= 0.5) continue;
        const airNode = graph.nodeOfRef.get(airVertex);
        if (airNode === void 0 || !reachableAir[airNode]) continue;
        const around = this._ringVerticesAroundAngle(ringIndex, Math.atan2(airVertex.y, airVertex.x));
        if (!around) continue;
        if (around.minusVertex.air > 0.5 || around.plusVertex.air > 0.5) continue;
        const minusNode = graph.nodeOfRef.get(around.minusVertex);
        const plusNode = graph.nodeOfRef.get(around.plusVertex);
        if (minusNode === void 0 || plusNode === void 0) continue;
        let minusLinked = false;
        let plusLinked = false;
        for (const edge of graph.neighbors[airNode] || []) {
          if (edge.to === minusNode) minusLinked = true;
          if (edge.to === plusNode) plusLinked = true;
          if (minusLinked && plusLinked) break;
        }
        if (!minusLinked || !plusLinked) continue;
        const angle = Math.atan2(airVertex.y, airVertex.x);
        const supportRadius = (Math.hypot(around.minusVertex.x, around.minusVertex.y) + Math.hypot(around.plusVertex.x, around.plusVertex.y)) * 0.5;
        const airRadius = Math.hypot(airVertex.x, airVertex.y);
        const radius = (supportRadius + airRadius) * 0.5;
        const key = `inner:${ringIndex}:${airIndex}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          angle,
          r: radius,
          ring: ringIndex,
          depth: outerRingIndex - ringIndex,
          anchorKind: "under_air",
          sourceKind: "air",
          sourceRing: ringIndex + 1,
          sourceIndex: airIndex
        });
      }
    }
    return out;
  }
  /**
   * @param {{x:number,y:number}} candidate
   * @param {Array<{x:number,y:number}>} picked
   * @param {number} minDist
   * @returns {boolean}
   */
  _barrenCandidateHasSpacing(candidate, picked, minDist) {
    for (const cur of picked) {
      const dx = candidate.x - cur.x;
      const dy = candidate.y - cur.y;
      if (dx * dx + dy * dy < minDist * minDist) {
        return false;
      }
    }
    return true;
  }
  /**
   * @param {Array<any>} items
   * @param {number} seed
   * @param {boolean} innerFirst
   * @param {(item:any)=>number} getRing
   * @returns {Array<any>}
   */
  _orderBarrenByRing(items, seed, innerFirst, getRing) {
    const groups = /* @__PURE__ */ new Map();
    for (const item of items) {
      const ring = getRing(item);
      const group = groups.get(ring);
      if (group) group.push(item);
      else groups.set(ring, [item]);
    }
    const ringOrder = Array.from(groups.keys()).sort((a, b) => innerFirst ? a - b : b - a);
    const out = [];
    for (const ring of ringOrder) {
      out.push(...this._shuffleDeterministic(groups.get(ring) || [], this._ringShuffleSeed(ring, seed)));
    }
    return out;
  }
  /**
   * @param {Array<any>} ordered
   * @param {number} count
   * @param {number} minDist
   * @returns {Array<any>}
   */
  _pickBarrenCandidates(ordered, count, minDist) {
    if (count <= 0 || !ordered.length) return [];
    const picked = [];
    for (const spacing of [Math.max(0, minDist), Math.max(0.18, minDist * 0.55)]) {
      for (const candidate of ordered) {
        if (picked.length >= count) break;
        if (picked.includes(candidate)) continue;
        if (!this._barrenCandidateHasSpacing(candidate, picked, spacing)) continue;
        picked.push(candidate);
      }
      if (picked.length >= count) break;
    }
    return picked;
  }
  /**
   * @param {number} seed
   * @returns {{inner:Array<any>,outer:Array<any>,outerRockByIndex:Map<number, any>,underAirByNode:Map<number, Array<any>>,outerRingIndex:number}|null}
   */
  _buildBarrenPadLookup(seed) {
    const graph = this.radialGraph;
    const rings = this.radial && this.radial.rings ? this.radial.rings : null;
    if (!graph || !graph.nodeOfRef || !rings || !rings.length) {
      return null;
    }
    const candidates = this._buildBarrenPadCandidates();
    const outerRingIndex = rings.length - 1;
    const outerRockByIndex = /* @__PURE__ */ new Map();
    const underAirByNode = /* @__PURE__ */ new Map();
    for (const candidate of candidates) {
      if (candidate.anchorKind === "outer_rock" && candidate.sourceRing === outerRingIndex) {
        outerRockByIndex.set(candidate.sourceIndex, candidate);
        continue;
      }
      if (candidate.anchorKind !== "under_air") continue;
      const ring = rings[candidate.sourceRing];
      const vertex = ring && ring[candidate.sourceIndex];
      const nodeIdx = vertex ? graph.nodeOfRef.get(vertex) : void 0;
      if (nodeIdx === void 0) continue;
      const bucket = underAirByNode.get(nodeIdx);
      if (bucket) bucket.push(candidate);
      else underAirByNode.set(nodeIdx, [candidate]);
    }
    return {
      inner: this._orderBarrenByRing(candidates, seed, true, (item) => item.ring),
      outer: this._orderBarrenByRing(candidates, seed + 17, false, (item) => item.ring),
      outerRockByIndex,
      underAirByNode,
      outerRingIndex
    };
  }
  /**
   * @param {{x:number,y:number,angle:number,r:number,ring:number,depth:number,anchorKind:"outer_rock"|"under_air",sourceKind:"rock"|"air",sourceRing:number,sourceIndex:number}} candidate
   * @param {{underAirByNode:Map<number, Array<any>>,outerRockByIndex:Map<number, any>,outerRingIndex:number}|null} lookup
   * @param {Set<any>} used
   * @param {Array<any>} chosenTurrets
   * @param {number} minDist
   * @returns {any|null}
   */
  _findBarrenOverwatchCandidate(candidate, lookup, used, chosenTurrets, minDist) {
    const graph = this.radialGraph;
    const rings = this.radial && this.radial.rings ? this.radial.rings : null;
    if (!lookup || !graph || !graph.nodes || !graph.neighbors || !graph.nodeOfRef || !rings || !rings.length) {
      return null;
    }
    const { underAirByNode, outerRockByIndex, outerRingIndex } = lookup;
    const canUseCandidate = (cand) => cand && cand !== candidate && !used.has(cand) && this._barrenCandidateHasSpacing(cand, chosenTurrets, minDist);
    const searchOuterRing = (baseIndex) => {
      const outerRing = rings[outerRingIndex] || [];
      const n = outerRing.length;
      if (!n || !Number.isFinite(baseIndex)) return null;
      for (let off = 1; off < n; off++) {
        const left = ((baseIndex - off) % n + n) % n;
        const right = (baseIndex + off) % n;
        for (const idx of [left, right]) {
          const cand = outerRockByIndex.get(idx);
          if (!canUseCandidate(cand)) continue;
          return cand;
        }
      }
      return null;
    };
    const isAirNode = (nodeIdx) => {
      const node = graph.nodes[nodeIdx];
      if (!node) return false;
      const ring = rings[node.r];
      const vertex = ring && ring[node.i];
      return !!(vertex && vertex.air > 0.5);
    };
    if (candidate.anchorKind === "outer_rock") {
      return searchOuterRing(candidate.sourceIndex);
    }
    if (candidate.sourceKind !== "air") {
      return null;
    }
    const sourceRing = rings[candidate.sourceRing] || null;
    const sourceVertex = sourceRing && sourceRing[candidate.sourceIndex];
    const startNode = sourceVertex ? graph.nodeOfRef.get(sourceVertex) : void 0;
    if (startNode === void 0) return null;
    const start = graph.nodes[startNode];
    if (!start) return null;
    const visited = /* @__PURE__ */ new Set([startNode]);
    let frontier = [startNode];
    for (let nextRing = start.r + 1; nextRing <= outerRingIndex; nextRing++) {
      const ringAir = [];
      const queue = [];
      for (const nodeIdx of frontier) {
        const neigh = graph.neighbors[nodeIdx] || [];
        for (const edge of neigh) {
          const nextIdx = edge.to;
          if (visited.has(nextIdx)) continue;
          const nextNode = graph.nodes[nextIdx];
          if (!nextNode || nextNode.r !== nextRing || !isAirNode(nextIdx)) continue;
          visited.add(nextIdx);
          queue.push(nextIdx);
        }
      }
      for (let qi = 0; qi < queue.length; qi++) {
        const nodeIdx = expectDefined$1(queue[qi]);
        ringAir.push(nodeIdx);
        const neigh = graph.neighbors[nodeIdx] || [];
        for (const edge of neigh) {
          const nextIdx = edge.to;
          if (visited.has(nextIdx)) continue;
          const nextNode = graph.nodes[nextIdx];
          if (!nextNode || nextNode.r !== nextRing || !isAirNode(nextIdx)) continue;
          visited.add(nextIdx);
          queue.push(nextIdx);
        }
      }
      if (!ringAir.length) return null;
      if (nextRing < outerRingIndex) {
        for (const nodeIdx of ringAir) {
          for (const cand of underAirByNode.get(nodeIdx) || []) {
            if (cand.ring <= candidate.ring) continue;
            if (!canUseCandidate(cand)) continue;
            return cand;
          }
        }
        frontier = ringAir;
        continue;
      }
      for (const nodeIdx of ringAir) {
        const node = graph.nodes[nodeIdx];
        if (!node) continue;
        const overwatch = searchOuterRing(node.i);
        if (overwatch) return overwatch;
      }
      return null;
    }
    return null;
  }
  /**
   * @param {{x:number,y:number,angle:number,r:number,ring:number,depth:number,anchorKind:"outer_rock"|"under_air",sourceKind:"rock"|"air",sourceRing:number,sourceIndex:number}} candidate
   * @param {any} prop
   * @param {"miner"|"turret"|null} reservedFor
   * @returns {void}
   */
  _applyBarrenPadCandidateToProp(candidate, prop, reservedFor) {
    prop.dead = false;
    prop.x = candidate.x;
    prop.y = candidate.y;
    prop.padRing = candidate.ring;
    prop.padDepth = candidate.depth;
    prop.padAnchorKind = candidate.anchorKind;
    prop.padSourceKind = candidate.sourceKind;
    prop.padSourceRing = candidate.sourceRing;
    prop.padSourceIndex = candidate.sourceIndex;
    prop.padReservedFor = reservedFor;
    const up = this._upDirAt(prop.x, prop.y);
    if (up) {
      prop.padNx = up.ux;
      prop.padNy = up.uy;
      return;
    }
    const normal = this.normalAtWorld(prop.x, prop.y);
    if (normal) {
      prop.padNx = normal.nx;
      prop.padNy = normal.ny;
    }
  }
  /**
   * Re-layout barren pads so miner pads sit deep and turret pads occupy
   * graph-found overwatch ridges above those miners.
   * @param {number} minerCount
   * @param {number} turretCount
   * @param {number} seed
   * @param {number} [minDist]
   * @returns {void}
   */
  layoutBarrenPadsForRoles(minerCount, turretCount, seed, minDist = GAME.MINER_MIN_SEP) {
    const cfg = this.getPlanetConfig ? this.getPlanetConfig() : null;
    if (!(cfg && cfg.flags && cfg.flags.barrenPerimeter)) return;
    const pads = (this.props || []).filter((p) => p.type === "turret_pad");
    if (!pads.length) return;
    const lookup = this._buildBarrenPadLookup(seed);
    if (!lookup) return;
    const chosenMiners = [];
    const chosenTurrets = [];
    const used = /* @__PURE__ */ new Set();
    const pairedTarget = Math.min(Math.max(0, minerCount | 0), Math.max(0, turretCount | 0));
    if (pairedTarget > 0) {
      for (const candidate of lookup.inner) {
        if (chosenMiners.length >= pairedTarget) break;
        if (used.has(candidate)) continue;
        if (!this._barrenCandidateHasSpacing(candidate, chosenMiners, minDist)) continue;
        const overwatch = this._findBarrenOverwatchCandidate(candidate, lookup, used, chosenTurrets, minDist);
        if (!overwatch) continue;
        used.add(candidate);
        used.add(overwatch);
        chosenMiners.push(candidate);
        chosenTurrets.push(overwatch);
      }
    }
    for (const candidate of lookup.inner) {
      if (chosenMiners.length >= minerCount) break;
      if (used.has(candidate)) continue;
      if (!this._barrenCandidateHasSpacing(candidate, chosenMiners, minDist)) continue;
      used.add(candidate);
      chosenMiners.push(candidate);
    }
    if (chosenTurrets.length < turretCount) {
      for (const miner of chosenMiners) {
        if (chosenTurrets.length >= turretCount) break;
        const overwatch = this._findBarrenOverwatchCandidate(miner, lookup, used, chosenTurrets, minDist);
        if (!overwatch) continue;
        used.add(overwatch);
        chosenTurrets.push(overwatch);
      }
    }
    if (chosenTurrets.length < turretCount) {
      for (const candidate of lookup.outer) {
        if (chosenTurrets.length >= turretCount) break;
        if (used.has(candidate)) continue;
        if (!this._barrenCandidateHasSpacing(candidate, chosenTurrets, minDist)) continue;
        used.add(candidate);
        chosenTurrets.push(candidate);
      }
    }
    const placements = [];
    for (const cand of chosenMiners) {
      placements.push({ candidate: cand, reservedFor: "miner" });
    }
    for (const cand of chosenTurrets) {
      placements.push({ candidate: cand, reservedFor: null });
    }
    for (let i = 0; i < pads.length; i++) {
      const prop = pads[i];
      if (!prop) continue;
      const placement = placements[i] || null;
      if (!placement) {
        prop.dead = true;
        prop.hp = 0;
        delete prop.padRing;
        delete prop.padDepth;
        delete prop.padAnchorKind;
        delete prop.padSourceKind;
        delete prop.padSourceRing;
        delete prop.padSourceIndex;
        prop.padReservedFor = null;
        continue;
      }
      this._applyBarrenPadCandidateToProp(placement.candidate, prop, placement.reservedFor);
    }
  }
  /**
   * @param {number} seed
   * @param {boolean} innerFirst
   * @returns {Array<any>}
   */
  _orderedBarrenPadProps(seed, innerFirst = true) {
    const pads = (this.props || []).filter((prop) => prop.type === "turret_pad" && !prop.dead && typeof prop.padRing === "number");
    return this._orderBarrenByRing(pads, seed, innerFirst, (pad) => pad.padRing);
  }
  /**
   * Reserve deeper barren pads for miners before turrets consume the outer pads.
   * @param {number} count
   * @param {number} seed
   * @param {number} [minDist]
   * @returns {Array<[number,number]>}
   */
  reserveBarrenPadsForMiners(count, seed, minDist = GAME.MINER_MIN_SEP) {
    const cfg = this.getPlanetConfig ? this.getPlanetConfig() : null;
    if (!(cfg && cfg.flags && cfg.flags.barrenPerimeter) || count <= 0) return [];
    const ordered = this._orderedBarrenPadProps(seed, true);
    const existing = ordered.filter((pad) => pad.padReservedFor === "miner");
    if (existing.length >= count) {
      return existing.slice(0, count).map((pad) => [pad.x, pad.y]);
    }
    const chosen = existing.slice();
    for (const pad of ordered) {
      if (chosen.length >= count) break;
      if (pad.padReservedFor) continue;
      if (!this._isFarFromReservations(pad.x, pad.y, minDist, this._spawnReservations)) continue;
      let ok = true;
      for (const cur of chosen) {
        const dx = pad.x - cur.x;
        const dy = pad.y - cur.y;
        if (dx * dx + dy * dy < minDist * minDist) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      pad.padReservedFor = "miner";
      chosen.push(pad);
    }
    if (chosen.length > existing.length) {
      this.reserveSpawnPoints(chosen.slice(existing.length).map((pad) => ({ x: pad.x, y: pad.y })), minDist);
    }
    return chosen.map((pad) => [pad.x, pad.y]);
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
    let placed = [];
    if (forceHorizontalPads) {
      const lookup = this._buildBarrenPadLookup(seed);
      placed = lookup ? this._pickBarrenCandidates(lookup.inner, pads.length, minDist) : [];
    } else {
      const standable = this._standablePoints || [];
      const flatPool = standable.filter((pt) => {
        const normal = this._upAlignedNormalAtWorld(pt[0], pt[1]);
        const slope = this._surfaceSlopeAtWorld(pt[0], pt[1], normal);
        if (!normal || slope === null) return false;
        const up = this._upDirAt(pt[0], pt[1]);
        if (!up) return false;
        if (slope > 0.08) return false;
        if (normal.nx * up.ux + normal.ny * up.uy < 0.98) return false;
        const tx = -normal.ny;
        const ty = normal.nx;
        const shoulder = 0.38;
        for (const dir of [-1, 1]) {
          const sx = pt[0] + tx * shoulder * dir;
          const sy = pt[1] + ty * shoulder * dir;
          if (this.airValueAtWorld(sx + normal.nx * 0.12, sy + normal.ny * 0.12) <= 0.5) return false;
          if (this.airValueAtWorld(sx - normal.nx * 0.09, sy - normal.ny * 0.09) > 0.5) return false;
        }
        return true;
      });
      const pool = flatPool.length >= pads.length ? flatPool : standable;
      if (pool !== standable) {
        const saved = this._standablePoints;
        this._standablePoints = pool;
        placed = this.sampleStandablePoints(pads.length, seed, "uniform", minDist, false).map((pt) => ({ x: pt[0], y: pt[1] }));
        this._standablePoints = saved;
      } else {
        placed = this.sampleStandablePoints(pads.length, seed, "uniform", minDist, false).map((pt) => ({ x: pt[0], y: pt[1] }));
      }
    }
    for (let i = 0; i < pads.length; i++) {
      const p = pads[i];
      if (!p) continue;
      const pt = placed[i] || null;
      p.padReservedFor = null;
      if (!pt) {
        p.dead = true;
        p.hp = 0;
        delete p.padRing;
        delete p.padDepth;
        delete p.padAnchorKind;
        delete p.padSourceKind;
        delete p.padSourceRing;
        delete p.padSourceIndex;
        continue;
      }
      p.dead = false;
      p.x = pt.x;
      p.y = pt.y;
      if (forceHorizontalPads) {
        p.padRing = pt.ring;
        p.padDepth = pt.depth;
        p.padAnchorKind = pt.anchorKind;
        p.padSourceKind = pt.sourceKind;
        p.padSourceRing = pt.sourceRing;
        p.padSourceIndex = pt.sourceIndex;
        const up = this._upDirAt(p.x, p.y);
        if (up) {
          p.padNx = up.ux;
          p.padNy = up.uy;
          continue;
        }
      } else {
        delete p.padRing;
        delete p.padDepth;
        delete p.padAnchorKind;
        delete p.padSourceKind;
        delete p.padSourceRing;
        delete p.padSourceIndex;
      }
      const normal = this.normalAtWorld(p.x, p.y);
      if (normal) {
        p.padNx = normal.nx;
        p.padNy = normal.ny;
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
   * @returns {StandablePoint[]} [x,y,angle,r,supportNodeIndex]
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
      if (!n) continue;
      let inner = -1;
      let innerR = -1;
      const neigh = graph.neighbors[i] || [];
      for (const edge of neigh) {
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
      if (!nb) continue;
      const aOuter = this.radial.airValueAtWorld(n.x, n.y);
      const aInner = this.radial.airValueAtWorld(nb.x, nb.y);
      const denom = aOuter - aInner;
      const t = denom !== 0 ? Math.max(0, Math.min(1, (0.5 - aInner) / denom)) : 0.5;
      const sx = nb.x + (n.x - nb.x) * t;
      const sy = nb.y + (n.y - nb.y) * t;
      const normal = this._upAlignedNormalAtWorld(sx, sy);
      if (!normal) continue;
      const px = sx + normal.nx * 0.02;
      const py = sy + normal.ny * 0.02;
      if (!this.isStandableAtWorld(px, py, maxSlope, clearance, eps, sideClearance)) continue;
      const ang = Math.atan2(py, px);
      const r2 = Math.hypot(px, py);
      points.push([px, py, ang, r2, inner]);
    }
    return points;
  }
  /**
   * Cached standable points. Do not mutate.
   * @returns {StandablePoint[]} [x,y,angle,r,supportNodeIndex]
   */
  getStandablePoints() {
    return this._standablePoints || [];
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {number}
   */
  _findStandableSupportNodeIndex(x, y) {
    const points = this.getStandablePoints();
    let bestIdx = -1;
    let bestD2 = Infinity;
    for (const p of points) {
      if (!p) continue;
      const dx = p[0] - x;
      const dy = p[1] - y;
      const d2 = dx * dx + dy * dy;
      if (d2 >= bestD2) continue;
      bestD2 = d2;
      bestIdx = Number.isFinite(p[4]) ? Number(p[4]) : -1;
      if (d2 <= 1e-10 && bestIdx >= 0) break;
    }
    return bestIdx;
  }
  /**
   * @param {{type:string,scale?:number}} p
   * @returns {number}
   */
  _terrainPropSupportRadius(p) {
    const scale = Math.max(0.2, p && p.scale ? p.scale : 1);
    if (!p) return 0.28;
    if (p.type === "tree") return Math.max(0.24, 0.18 + scale * 0.16);
    if (p.type === "boulder") return Math.max(0.26, 0.18 + scale * 0.22);
    if (p.type === "ridge_spike") return Math.max(0.24, 0.16 + scale * 0.18);
    if (p.type === "stalactite") return Math.max(0.22, 0.15 + scale * 0.16);
    if (p.type === "ice_shard") return Math.max(0.18, 0.12 + scale * 0.14);
    return 0.28;
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} radius
   * @param {number} [preferredIndex]
   * @returns {number[]}
   */
  _collectRockSupportNodeIndices(x, y, radius, preferredIndex = -1) {
    const graph = this.radialGraph;
    const nodes = graph && graph.nodes ? graph.nodes : null;
    const air = this.airNodesBitmap;
    if (!nodes || !air || air.length !== nodes.length) return [];
    const radiusSq = Math.max(0.02, radius) * Math.max(0.02, radius);
    const hits = [];
    for (let i = 0; i < nodes.length; i++) {
      if (air[i]) continue;
      const node = nodes[i];
      if (!node) continue;
      const dx = node.x - x;
      const dy = node.y - y;
      const d2 = dx * dx + dy * dy;
      if (d2 > radiusSq) continue;
      hits.push({ idx: i, d2 });
    }
    hits.sort((a, b) => a.d2 - b.d2);
    const out = [];
    const seen = /* @__PURE__ */ new Set();
    const addIndex = (idx) => {
      if (!Number.isFinite(idx) || idx < 0 || idx >= nodes.length) return;
      if (air[idx] || seen.has(idx)) return;
      seen.add(idx);
      out.push(idx);
    };
    addIndex(preferredIndex);
    for (const hit of hits) {
      addIndex(hit.idx);
      if (out.length >= 8) break;
    }
    return out;
  }
  /**
   * Rebuild support-node footprints for terrain-attached props after placement.
   * @returns {void}
   */
  _refreshTerrainPropSupportNodes() {
    if (!this.props || !this.props.length) return;
    for (const p of this.props) {
      if (!p || p.dead) continue;
      if (p.type !== "tree" && p.type !== "boulder" && p.type !== "ridge_spike" && p.type !== "stalactite" && p.type !== "ice_shard") continue;
      const anchorX = Number.isFinite(p.supportX) ? Number(p.supportX) : p.x;
      const anchorY = Number.isFinite(p.supportY) ? Number(p.supportY) : p.y;
      const supportIndices = this._collectRockSupportNodeIndices(
        anchorX,
        anchorY,
        this._terrainPropSupportRadius(p),
        Number.isFinite(p.supportNodeIndex) ? Number(p.supportNodeIndex) : -1
      );
      if (!supportIndices.length) continue;
      p.supportNodeIndices = supportIndices;
      p.supportNodeIndex = expectDefined$1(supportIndices[0]);
    }
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
      if (!n) continue;
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
   * @param {StandablePoint[]} points
   * @returns {StandablePoint[]}
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
   * @param {number} [minR]
   * @returns {Array<[number,number]>}
   */
  sampleStandablePoints(count, seed, placement = "random", minDist = 0, reserve = false, minR = 0) {
    if (count <= 0) return [];
    const basePoints = this._filterReachableStandable(this.getStandablePoints());
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
      indices.sort((a, b) => expectDefined$1(points[a])[2] - expectDefined$1(points[b])[2]);
      const offset = rand();
      const step = Math.PI * 2 / take;
      const window2 = step * 0.65;
      for (let i = 0; i < take; i++) {
        const target = (i + offset) * step;
        let picked = -1;
        let pickedScore = Infinity;
        for (const idx of indices) {
          const p = points[idx];
          if (!p) continue;
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
          if (!p) continue;
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
          if (!p) continue;
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
          if (idx === void 0) continue;
          const p = points[idx];
          if (!p) continue;
          centers.push(p[2]);
        }
        if (!centers.length) return out;
        let clusterIndex = 0;
        const window2 = Math.PI * 2 / Math.max(6, clusterCount * 2);
        for (let i = 0; i < take; i++) {
          const target = centers[clusterIndex % centers.length];
          if (target === void 0) continue;
          clusterIndex++;
          let picked = -1;
          let pickedScore = Infinity;
          for (const idx of indices) {
            if (used.has(idx)) continue;
            const p = points[idx];
            if (!p) continue;
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
            if (!p) continue;
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
            if (!p) continue;
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
          const tmp = expectDefined$1(indices[i]);
          indices[i] = expectDefined$1(indices[j]);
          indices[j] = tmp;
        }
        for (const idx of indices) {
          const p = points[idx];
          if (!p) continue;
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
            if (!p) continue;
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
      const pads = this._orderedBarrenPadProps(seed, false).filter((pad) => !pad.padReservedFor);
      if (pads.length) {
        const chosen = [];
        for (const pad of pads) {
          if (chosen.length >= count) break;
          if (!this._isFarFromReservations(pad.x, pad.y, minDist, this._spawnReservations)) continue;
          let ok = true;
          for (const cur of chosen) {
            const dx = pad.x - cur.x;
            const dy = pad.y - cur.y;
            if (dx * dx + dy * dy < minDist * minDist) {
              ok = false;
              break;
            }
          }
          if (!ok) continue;
          chosen.push(pad);
        }
        if (reserve && chosen.length) {
          for (const pad of chosen) {
            if (!pad.padReservedFor) pad.padReservedFor = "turret";
          }
          this.reserveSpawnPoints(chosen.map((pad) => ({ x: pad.x, y: pad.y })), minDist);
        }
        return chosen.map((pad) => [pad.x, pad.y]);
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
    return this._refreshAirAfterEdit();
  }
  /**
   * @returns {Float32Array|undefined}
   */
  _refreshAirAfterEdit() {
    const newAir = this.radial.updateAirFlags(true);
    this.airNodesBitmap = buildAirNodesBitmap(this.radialGraph, this.radial);
    this.airNodesBitmapNavPadded = buildAirNodesBitmap(this.radialGraphNavPadded, this.radial);
    this._enemyNavigationMaskNavPadded = null;
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
    const newAir = this._refreshAirAfterEdit();
    if (Array.isArray(state.props) && Array.isArray(this.props)) {
      const count = Math.min(this.props.length, state.props.length);
      for (let i = 0; i < count; i++) {
        const src = state.props[i];
        const dst = this.props[i];
        if (!src || typeof src !== "object" || !dst || typeof dst !== "object") continue;
        const srcRecord = (
          /** @type {Record<string, any>} */
          src
        );
        const dstRecord = (
          /** @type {Record<string, any>} */
          dst
        );
        for (const key of Object.keys(dstRecord)) {
          if (!Object.prototype.hasOwnProperty.call(srcRecord, key)) {
            delete dstRecord[key];
          }
        }
        for (const key of Object.keys(srcRecord)) {
          dstRecord[key] = clonePlainData(srcRecord[key]);
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
    const n = this._airGradientNormalAtWorld(x, y, eps);
    if (!n) {
      return null;
    }
    const step = -dist;
    return { x: x + n.nx * step, y: y + n.ny * step };
  }
  /**
   * Build a guide path to the closest point on the terrain to the query position
   * @param {number} x
   * @param {number} y
   * @param {number} maxDistance
   * @returns {{path:Array<{x:number, y:number}>, indexClosest: number}|null}
   */
  surfaceGuidePathTo(x, y, maxDistance) {
    if (!this.radial || typeof this.radial.surfaceGuidePathTo !== "function") {
      return null;
    }
    return this.radial.surfaceGuidePathTo(x, y, maxDistance);
  }
  /**
   * Exact surface normal at a world point.
   * Returns null when the point is not on a boundary-carrying terrain surface.
   * @param {number} x
   * @param {number} y
   * @returns {{nx:number, ny:number}|null}
   */
  normalAtWorld(x, y) {
    const tri = this.radial && typeof this.radial.findTriAtWorld === "function" ? this.radial.findTriAtWorld(x, y) : null;
    if (this._triStraddlesBoundary(tri)) {
      return this._triGradientNormal(tri);
    }
    const rOuter = this._outerShellRadius();
    if (!(rOuter > 0)) return null;
    const r2 = Math.hypot(x, y);
    if (r2 <= 1e-6) return null;
    const ux = x / r2;
    const uy = y / r2;
    const probe = 0.08;
    const shellGap = Math.max(0.08, probe * 1.5);
    if (Math.abs(r2 - rOuter) > shellGap) return null;
    const airOut = this.airValueAtWorld(x + ux * probe, y + uy * probe);
    const airIn = this.airValueAtWorld(x - ux * probe, y - uy * probe);
    if (!(airOut > 0.5 && airIn <= 0.5)) return null;
    return { nx: ux, ny: uy };
  }
  /**
   * Exact terrain crossing along a swept segment.
   * Returns null when the segment does not cross a terrain surface.
   * @param {{x:number,y:number}} p1
   * @param {{x:number,y:number}} p2
   * @returns {{x:number,y:number,nx:number,ny:number}|null}
   */
  terrainCrossing(p1, p2) {
    if (!p1 || !p2) return null;
    const ax = p1.x;
    const ay = p1.y;
    const bx = p2.x;
    const by = p2.y;
    if (!Number.isFinite(ax) || !Number.isFinite(ay) || !Number.isFinite(bx) || !Number.isFinite(by)) {
      return null;
    }
    const a0 = this.airValueAtWorld(ax, ay);
    const a1 = this.airValueAtWorld(bx, by);
    const s0 = a0 > 0.5;
    const s1 = a1 > 0.5;
    if (s0 === s1) {
      return null;
    }
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) * 0.5;
      const mx = ax + (bx - ax) * mid;
      const my = ay + (by - ay) * mid;
      const airMid = this.airValueAtWorld(mx, my) > 0.5;
      if (airMid === s0) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
    let x = ax + (bx - ax) * hi;
    let y = ay + (by - ay) * hi;
    let n = this.normalAtWorld(x, y);
    if (!n) {
      const tShell = this._segmentOuterShellHitT(ax, ay, bx, by);
      if (tShell === null) {
        return null;
      }
      x = ax + (bx - ax) * tShell;
      y = ay + (by - ay) * tShell;
      const r2 = Math.hypot(x, y);
      if (r2 <= 1e-6) return null;
      n = { nx: x / r2, ny: y / r2 };
    }
    return { x, y, nx: n.nx, ny: n.ny };
  }
  /**
   * @param {Array<{x:number,y:number,air:number}>|null|undefined} tri
   * @param {number} [threshold]
   * @returns {boolean}
   */
  _triStraddlesBoundary(tri, threshold = 0.5) {
    if (!tri || tri.length < 3) return false;
    let minA = Infinity;
    let maxA = -Infinity;
    for (const v of tri) {
      minA = Math.min(minA, v.air);
      maxA = Math.max(maxA, v.air);
    }
    return minA <= threshold && maxA > threshold;
  }
  /**
   * @param {Array<{x:number,y:number,air:number}>|null|undefined} tri
   * @returns {{nx:number,ny:number}|null}
   */
  _triGradientNormal(tri) {
    if (!tri || tri.length < 3) return null;
    const a = tri[0];
    const b = tri[1];
    const c = tri[2];
    if (!a || !b || !c) return null;
    const det = (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y);
    if (Math.abs(det) < 1e-8) return null;
    const dfdx = (a.air * (b.y - c.y) + b.air * (c.y - a.y) + c.air * (a.y - b.y)) / det;
    const dfdy = (a.air * (c.x - b.x) + b.air * (a.x - c.x) + c.air * (b.x - a.x)) / det;
    const gLen = Math.hypot(dfdx, dfdy);
    if (gLen < 1e-8) return null;
    return { nx: dfdx / gLen, ny: dfdy / gLen };
  }
  /**
   * @returns {number}
   */
  _outerShellRadius() {
    return this.radial && this.radial.rings && this.radial.rings.length ? this.radial.rings.length - 1 : this.planetRadius;
  }
  /**
   * @param {number} ax
   * @param {number} ay
   * @param {number} bx
   * @param {number} by
   * @returns {number|null}
   */
  _segmentOuterShellHitT(ax, ay, bx, by) {
    const rOuter = this._outerShellRadius();
    if (!(rOuter > 0)) return null;
    const dx = bx - ax;
    const dy = by - ay;
    const qa = dx * dx + dy * dy;
    if (qa <= 1e-10) return null;
    const qb = 2 * (ax * dx + ay * dy);
    const qc = ax * ax + ay * ay - rOuter * rOuter;
    const disc = qb * qb - 4 * qa * qc;
    if (disc < 0) return null;
    const root = Math.sqrt(disc);
    const t0 = (-qb - root) / (2 * qa);
    const t1 = (-qb + root) / (2 * qa);
    let t = null;
    if (t0 >= 0 && t0 <= 1) t = t0;
    if (t1 >= 0 && t1 <= 1) {
      t = t === null ? t1 : Math.min(t, t1);
    }
    return t;
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {{nx:number,ny:number}|null}
   */
  _upAlignedNormalAtWorld(x, y) {
    const n = this.normalAtWorld(x, y);
    const up = this._upDirAt(x, y);
    if (!n || !up) return null;
    if (n.nx * up.ux + n.ny * up.uy < 0) {
      return { nx: -n.nx, ny: -n.ny };
    }
    return n;
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {{nx:number,ny:number}|null|undefined} normal
   * @returns {number|null}
   */
  _surfaceSlopeAtWorld(x, y, normal) {
    const up = this._upDirAt(x, y);
    if (!up || !normal) return null;
    return 1 - Math.abs(normal.nx * up.ux + normal.ny * up.uy);
  }
  /**
   * Private recovery helper for nudging buried points back toward air.
   * @param {number} x
   * @param {number} y
   * @param {number} eps
   * @returns {{nx:number,ny:number}|null}
   */
  _airGradientNormalAtWorld(x, y, eps) {
    const gdx = this.radial.airValueAtWorld(x + eps, y) - this.radial.airValueAtWorld(x - eps, y);
    const gdy = this.radial.airValueAtWorld(x, y + eps) - this.radial.airValueAtWorld(x, y - eps);
    const len = Math.hypot(gdx, gdy);
    if (len < 1e-6) return null;
    return { nx: gdx / len, ny: gdy / len };
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
    const n = this._upAlignedNormalAtWorld(x, y);
    const slope = this._surfaceSlopeAtWorld(x, y, n);
    if (slope === null) return false;
    return slope <= maxSlope;
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
    const n = this._upAlignedNormalAtWorld(x, y);
    const slope = this._surfaceSlopeAtWorld(x, y, n);
    if (!n || slope === null || slope > maxSlope) return false;
    const ax = x + n.nx * clearance;
    const ay = y + n.ny * clearance;
    const bx = x - n.nx * clearance;
    const by = y - n.ny * clearance;
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
    const n = this._upAlignedNormalAtWorld(x, y);
    const slope = this._surfaceSlopeAtWorld(x, y, n);
    if (!n || slope === null || slope > maxSlope) return false;
    const nx = n.nx;
    const ny = n.ny;
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
      const n = this._airGradientNormalAtWorld(cx, cy, eps);
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
   * Evaluate fog for the entire current mesh and push it to the renderer.
   * @param {{updateFog:(fog:Float32Array)=>void}} renderer
   * @param {number} shipX
   * @param {number} shipY
   * @returns {void}
   */
  primeRenderFog(renderer2, shipX, shipY) {
    const fog = this.radial && typeof this.radial.primeFog === "function" ? this.radial.primeFog(shipX, shipY) : this.updateFogForRender(shipX, shipY);
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
    if (!n) {
      passable[i] = 0;
      continue;
    }
    if (n.navPadded) {
      passable[i] = 1;
      continue;
    }
    const ring = ringMesh.rings[n.r];
    const vertex = ring ? ring[n.i] : null;
    passable[i] = vertex && vertex.air > 0.5 ? 1 : 0;
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
      ATMOSPHERE_DRAG_MULT: r(1, 1),
      DRAG_MULT: r(0.9, 1.1),
      THRUST_MULT: r(0.95, 1.1),
      TURN_RATE_MULT: r(0.95, 1.1),
      LAND_FRICTION_MULT: r(0.7, 1),
      WALL_FRICTION_MULT: r(0.8, 1.1),
      BOUNCE_RESTITUTION: r(0.12, 0.22),
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
      TOPO_BAND: r(0.5, 1.6),
      TOPO_AMP: r(0.2, 1.7),
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
      ATMOSPHERE_DRAG_MULT: r(1, 1),
      DRAG_MULT: r(0.9, 1.1),
      THRUST_MULT: r(0.95, 1.1),
      TURN_RATE_MULT: r(0.95, 1.1),
      LAND_FRICTION_MULT: r(0.7, 1),
      WALL_FRICTION_MULT: r(0.8, 1.1),
      BOUNCE_RESTITUTION: r(0.12, 0.22),
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
      ATMOSPHERE_DRAG_MULT: r(1, 1),
      DRAG_MULT: r(0.9, 1.2),
      THRUST_MULT: r(0.9, 1.15),
      TURN_RATE_MULT: r(0.9, 1.15),
      LAND_FRICTION_MULT: r(0.8, 1.2),
      WALL_FRICTION_MULT: r(0.7, 1),
      BOUNCE_RESTITUTION: r(0.24, 0.36),
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
      ATMOSPHERE_DRAG_MULT: r(1, 1),
      DRAG_MULT: r(0.9, 1.2),
      THRUST_MULT: r(0.9, 1.1),
      TURN_RATE_MULT: r(0.9, 1.1),
      LAND_FRICTION_MULT: r(0.9, 1.1),
      WALL_FRICTION_MULT: r(0.45, 0.7),
      BOUNCE_RESTITUTION: r(0.32, 0.48),
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
      ATMOSPHERE_DRAG_MULT: r(1, 1),
      DRAG_MULT: r(0.9, 1.1),
      THRUST_MULT: r(0.95, 1.15),
      TURN_RATE_MULT: r(0.95, 1.15),
      LAND_FRICTION_MULT: r(0.1, 0.1),
      WALL_FRICTION_MULT: r(0.05, 0.12),
      BOUNCE_RESTITUTION: r(0.08, 0.14),
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
      ATMOSPHERE_DRAG_MULT: r(1, 1),
      DRAG_MULT: r(0.95, 1.25),
      THRUST_MULT: r(0.95, 1.1),
      TURN_RATE_MULT: r(0.95, 1.1),
      LAND_FRICTION_MULT: r(0.8, 1.2),
      WALL_FRICTION_MULT: r(0.9, 1.15),
      BOUNCE_RESTITUTION: r(0.14, 0.24),
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
      ATMOSPHERE_DRAG_MULT: r(1, 1),
      DRAG_MULT: r(2.2, 3.1),
      THRUST_MULT: r(0.85, 1),
      TURN_RATE_MULT: r(0.8, 0.95),
      LAND_FRICTION_MULT: r(0.8, 1.1),
      WALL_FRICTION_MULT: r(0.35, 0.55),
      BOUNCE_RESTITUTION: r(0.04, 0.1),
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
      ATMOSPHERE_DRAG_MULT: r(1, 1),
      DRAG_MULT: r(0.95, 1.15),
      THRUST_MULT: r(0.95, 1.1),
      TURN_RATE_MULT: r(0.95, 1.1),
      LAND_FRICTION_MULT: r(0.8, 1.2),
      WALL_FRICTION_MULT: r(1.1, 1.35),
      BOUNCE_RESTITUTION: r(0.18, 0.28),
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
    objective: { type: "destroy_factories", count: 0 },
    minerCountBase: 0,
    minerCountPerLevel: 0,
    minerCountCap: 0,
    platformCount: 10,
    enemyAllow: ["hunter", "ranger", "turret", "orbitingTurret"],
    factorySpawnCooldownMin: 6.5,
    factorySpawnCooldownMax: 10.5,
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
      ATMOSPHERE_DRAG_MULT: r(1, 1),
      DRAG_MULT: r(0.9, 1.1),
      THRUST_MULT: r(0.95, 1.05),
      TURN_RATE_MULT: r(0.9, 1.05),
      LAND_FRICTION_MULT: r(0.8, 1.1),
      WALL_FRICTION_MULT: r(0.55, 0.8),
      BOUNCE_RESTITUTION: r(0.28, 0.42),
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
function expectDefined(value) {
  if (value == null) {
    throw new Error("Expected value to be defined");
  }
  return value;
}
function pickPlanetConfigById(id) {
  for (const cfg of PLANET_CONFIGS) {
    if (cfg.id === id) return cfg;
  }
  return expectDefined(PLANET_CONFIGS[0]);
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
      const tmp = expectDefined(order[i]);
      order[i] = expectDefined(order[j]);
      order[j] = tmp;
    }
  }
  if (!rule.excludeWhenEnemyTotalAtOrAbove) return order;
  const cycleLen = order.length;
  for (let i = 0; i < cycleLen; i++) {
    const slotI = cycleIndex * cycleLen + i;
    const totalI = enemyTotalAtSlot(rule, slotI);
    const planetI = expectDefined(order[i]);
    if (!isPlanetExcluded(rule, planetI, totalI)) continue;
    let swapped = false;
    for (let j = 0; j < cycleLen; j++) {
      if (j === i) continue;
      const slotJ = cycleIndex * cycleLen + j;
      const totalJ = enemyTotalAtSlot(rule, slotJ);
      const planetJ = expectDefined(order[j]);
      if (isPlanetExcluded(rule, planetJ, totalI)) continue;
      if (isPlanetExcluded(rule, planetI, totalJ)) continue;
      const tmp = planetI;
      order[i] = planetJ;
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
  const planetId = expectDefined(cycle[Math.max(0, Math.min(cycle.length - 1, cyclePos))]);
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
  const out = { planetId };
  if (typeof enemyTotal === "number") out.enemyTotal = enemyTotal;
  if (typeof enemyCap === "number") out.enemyCap = enemyCap;
  if (enemyAllow) out.enemyAllow = enemyAllow;
  if (enemyAllowAddOut) out.enemyAllowAdd = enemyAllowAddOut;
  if (typeof orbitingTurretCount === "number") out.orbitingTurretCount = orbitingTurretCount;
  if (typeof platformCount === "number") out.platformCount = platformCount;
  return out;
}
function pickPlanetConfig(seed, level) {
  const lvl = Math.max(1, level | 0);
  const base = (seed | 0) + lvl * 9973;
  const idx = hash32(base) % PLANET_CONFIGS.length;
  return expectDefined(PLANET_CONFIGS[idx]);
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
    if (k in out) out[k] = Math.round(expectDefined(out[k]));
  }
  return out;
}
function clampPlanetConfig(sample) {
  const limits = {
    RMAX: [8, 26],
    PAD: [0.8, 2],
    MOTHERSHIP_ORBIT_HEIGHT: [4, 26],
    SURFACE_G: [1.2, 3.2],
    ATMOSPHERE_DRAG_MULT: [0, 4],
    ATMOSPHERE_HEIGHT: [0, 12],
    DRAG_MULT: [0.7, 2],
    THRUST_MULT: [0.7, 1.4],
    TURN_RATE_MULT: [0.7, 1.4],
    LAND_FRICTION_MULT: [0.2, 1.6],
    WALL_FRICTION_MULT: [0, 1.6],
    BOUNCE_RESTITUTION: [0, 1],
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
    const v = expectDefined(out[key]);
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
    RMAX: expectDefined(roll.RMAX),
    PAD: expectDefined(roll.PAD),
    MOTHERSHIP_ORBIT_HEIGHT: expectDefined(roll.MOTHERSHIP_ORBIT_HEIGHT),
    SURFACE_G: expectDefined(roll.SURFACE_G),
    ATMOSPHERE_DRAG: baseGame.ATMOSPHERE_DRAG * (roll.ATMOSPHERE_DRAG_MULT ?? 1),
    ATMOSPHERE_HEIGHT: Number.isFinite(roll.ATMOSPHERE_HEIGHT) ? Math.max(0, Number(roll.ATMOSPHERE_HEIGHT)) : baseGame.ATMOSPHERE_HEIGHT,
    TARGET_FINAL_AIR: expectDefined(roll.TARGET_FINAL_AIR),
    CA_STEPS: expectDefined(roll.CA_STEPS),
    AIR_KEEP_N8: expectDefined(roll.AIR_KEEP_N8),
    ROCK_TO_AIR_N8: expectDefined(roll.ROCK_TO_AIR_N8),
    ENTRANCES: expectDefined(roll.ENTRANCES),
    ENTRANCE_OUTER: expectDefined(roll.ENTRANCE_OUTER),
    ENTRANCE_INNER: expectDefined(roll.ENTRANCE_INNER),
    WARP_F: expectDefined(roll.WARP_F),
    WARP_A: expectDefined(roll.WARP_A),
    BASE_F: expectDefined(roll.BASE_F),
    VEIN_F: expectDefined(roll.VEIN_F),
    VEIN_THRESH: expectDefined(roll.VEIN_THRESH),
    VEIN_DILATE: expectDefined(roll.VEIN_DILATE),
    VIS_RANGE: expectDefined(roll.VIS_RANGE),
    FOG_SEEN_ALPHA: expectDefined(roll.FOG_SEEN_ALPHA),
    FOG_UNSEEN_ALPHA: expectDefined(roll.FOG_UNSEEN_ALPHA),
    FOG_BUDGET_TRIS: expectDefined(roll.FOG_BUDGET_TRIS),
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
    DRAG: baseGame.DRAG * expectDefined(roll.DRAG_MULT),
    THRUST: baseGame.THRUST * expectDefined(roll.THRUST_MULT),
    TURN_RATE: baseGame.TURN_RATE * expectDefined(roll.TURN_RATE_MULT),
    LAND_FRICTION: baseGame.LAND_FRICTION * expectDefined(roll.LAND_FRICTION_MULT),
    WALL_FRICTION: baseGame.LAND_FRICTION * (roll.WALL_FRICTION_MULT ?? roll.LAND_FRICTION_MULT ?? 1),
    BOUNCE_RESTITUTION: Number.isFinite(roll.BOUNCE_RESTITUTION) ? Math.max(0, Math.min(1, Number(roll.BOUNCE_RESTITUTION))) : Math.max(0, Math.min(1, baseGame.BOUNCE_RESTITUTION)),
    CRASH_SPEED: baseGame.CRASH_SPEED * expectDefined(roll.CRASH_SPEED_MULT),
    LAND_SPEED: baseGame.LAND_SPEED * expectDefined(roll.LAND_SPEED_MULT),
    NO_CAVES: !!(cfg.flags && cfg.flags.noCaves)
  };
}
const SAVE_SCHEMA_VERSION = 1;
const STORAGE_KEY_BASE = "dropship.save";
const STORAGE_KEY = `${STORAGE_KEY_BASE}.v${SAVE_SCHEMA_VERSION}`;
const LEGACY_STORAGE_KEYS = [STORAGE_KEY_BASE];
function saveGameToStorage(loop2) {
  if (!loop2 || typeof loop2.createSaveSnapshot !== "function") return false;
  try {
    purgeUnversionedLegacySaves();
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
    purgeUnversionedLegacySaves();
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
    for (const key of LEGACY_STORAGE_KEYS) {
      localStorage.removeItem(key);
    }
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
    fallenMiners: cloneSaveData(loop2.fallenMiners),
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
    fragments: cloneSaveData(loop2.fragments),
    entityExplosions: cloneSaveData(loop2.entityExplosions),
    popups: cloneSaveData(loop2.popups),
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
    loop2.fallenMiners = Array.isArray(snapshot.fallenMiners) ? cloneSaveData(snapshot.fallenMiners) : [];
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
    loop2.fragments = Array.isArray(snapshot.fragments) ? cloneSaveData(snapshot.fragments) : [];
    loop2.entityExplosions = Array.isArray(snapshot.entityExplosions) ? cloneSaveData(snapshot.entityExplosions) : [];
    loop2.popups = Array.isArray(snapshot.popups) ? cloneSaveData(snapshot.popups) : [];
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
    loop2.debugMinerGuidePath = false;
    loop2.debugRingVertices = false;
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
  const targetObj = (
    /** @type {Record<string, any>} */
    target
  );
  const sourceObj = (
    /** @type {Record<string, any>} */
    source
  );
  for (const key of Object.keys(sourceObj)) {
    targetObj[key] = cloneSaveData(sourceObj[key]);
  }
}
function cloneSaveData(value) {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((v) => cloneSaveData(v));
  }
  const valueObj = (
    /** @type {Record<string, any>} */
    value
  );
  const out = {};
  for (const key of Object.keys(valueObj)) {
    const v = valueObj[key];
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
      part += String.fromCharCode(
        /** @type {number} */
        slice[j]
      );
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
function purgeUnversionedLegacySaves() {
  for (const key of LEGACY_STORAGE_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const snapshot = JSON.parse(raw);
      if (!hasSnapshotVersion(snapshot)) {
        localStorage.removeItem(key);
      }
    } catch {
      localStorage.removeItem(key);
    }
  }
}
function hasSnapshotVersion(snapshot) {
  return !!snapshot && typeof snapshot === "object" && Number.isFinite(snapshot.version) && (snapshot.version | 0) > 0;
}
function isSnapshotPersistable(snapshot) {
  if (!snapshot || typeof snapshot !== "object") return false;
  if (!hasSnapshotVersion(snapshot)) return false;
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
function drawStartTitle(ctx, w, h, dpr, text, alpha) {
  if (!text || !(alpha > 0)) return;
  const fontFamily = '"Science Gothic", ui-sans-serif, system-ui, sans-serif';
  const fontPx = fitCanvasFontPx$1(
    ctx,
    text,
    700,
    Math.min(Math.round(w * 0.18), Math.round(140 * dpr)),
    Math.round(20 * dpr),
    w * 0.9,
    fontFamily
  );
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${fontPx}px ${fontFamily}`;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgb(48, 174, 224)";
  ctx.fillText(text, w * 0.5, h * 0.25);
  ctx.globalAlpha = 1;
}
function buildScreenshotCanvas(opts) {
  const source = opts.canvas;
  if (!source) return null;
  const dprFallback = typeof window !== "undefined" ? Math.max(1, window.devicePixelRatio || 1) : 1;
  const w = source.width || Math.max(1, Math.floor(source.clientWidth * dprFallback));
  const h = source.height || Math.max(1, Math.floor(source.clientHeight * dprFallback));
  if (w <= 0 || h <= 0) return null;
  if (typeof document === "undefined") return null;
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const ctx = out.getContext("2d");
  if (!ctx) return null;
  const clean = !!opts.clean;
  let switchedFrame = false;
  try {
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect(0, 0, w, h);
    if (clean && typeof opts.drawCleanFrame === "function") {
      opts.drawCleanFrame();
      switchedFrame = true;
    }
    ctx.drawImage(source, 0, 0, w, h);
    if (!clean && opts.overlay && opts.overlay.width > 0 && opts.overlay.height > 0) {
      ctx.drawImage(opts.overlay, 0, 0, w, h);
    }
    if (clean && opts.includeStartTitle) {
      const drawDpr = source.clientWidth > 0 ? source.width / Math.max(1, source.clientWidth) : dprFallback;
      drawStartTitle(
        ctx,
        w,
        h,
        drawDpr,
        opts.startTitleText || "DROPSHIP",
        Math.max(0, opts.startTitleAlpha || 0)
      );
    }
  } catch (_err) {
    return null;
  } finally {
    if (switchedFrame && typeof opts.restoreFrame === "function") {
      try {
        opts.restoreFrame();
      } catch (_err) {
      }
    }
  }
  return out;
}
async function copyCanvasToClipboard(canvas2) {
  if (!canvas2) return "failed";
  if (typeof navigator === "undefined" || !navigator.clipboard || typeof navigator.clipboard.write !== "function" || typeof ClipboardItem === "undefined") {
    return "unsupported";
  }
  try {
    const blob = await new Promise((resolve) => {
      canvas2.toBlob((b) => resolve(b || null), "image/png");
    });
    if (!blob) return "failed";
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return "ok";
  } catch (_err) {
    return "failed";
  }
}
async function copyGameplayScreenshotToClipboard(opts) {
  const clean = !!opts.clean;
  const cleanState = clean ? {
    ...opts.renderState,
    debugCollisions: false,
    debugPlanetTriangles: false,
    debugCollisionContours: false,
    debugRingVertices: false,
    showGameplayIndicators: false,
    touchUi: null,
    touchStart: false,
    touchStartMode: null
  } : null;
  const canvas2 = buildScreenshotCanvas({
    canvas: opts.canvas,
    overlay: opts.overlay,
    clean,
    drawCleanFrame: cleanState ? (() => opts.drawFrame(cleanState)) : null,
    restoreFrame: cleanState ? (() => {
      opts.drawFrame(opts.renderState);
      if (typeof opts.redrawOverlay === "function") {
        opts.redrawOverlay();
      }
    }) : null,
    includeStartTitle: clean && !!opts.includeStartTitle,
    startTitleText: opts.startTitleText || "DROPSHIP",
    startTitleAlpha: opts.startTitleAlpha
  });
  if (!canvas2) return "failed";
  return copyCanvasToClipboard(canvas2);
}
function fitCanvasFontPx$1(ctx, text, weight, maxPx, minPx, maxWidth, family) {
  let px = Math.max(minPx, maxPx);
  while (px > minPx) {
    ctx.font = `${weight} ${px}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    px -= 1;
  }
  return Math.max(minPx, px);
}
const PHASE_ALIGN = "align";
const PHASE_JUMPDRIVE = "jumpdrive";
const PHASE_WAIT_APPLY = "waitApply";
const PHASE_REVEAL = "reveal";
const PHASE_FOCUS = "focus";
function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}
function clamp01(t) {
  return Math.max(0, Math.min(1, t));
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function lerpAngleShortest(a, b, t) {
  let delta = (b - a) % (Math.PI * 2);
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;
  return a + delta * t;
}
function shortestAngleDelta(from, to) {
  let delta = (to - from) % (Math.PI * 2);
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
}
function easeOutCubic(t) {
  const u = 1 - clamp01(t);
  return 1 - u * u * u;
}
function easeInOutCubic(t) {
  const u = clamp01(t);
  return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) * 0.5;
}
function angleVec(angle) {
  return { x: Math.cos(angle), y: Math.sin(angle) };
}
function worldToScreenPx(view, w, h, x, y) {
  const s = 1 / Math.max(1e-6, view.radius);
  let sx;
  let sy;
  if (w > h) {
    sy = s;
    sx = s * h / Math.max(1, w);
  } else {
    sx = s;
    sy = s * w / Math.max(1, h);
  }
  const dx = x - view.xCenter;
  const dy = y - view.yCenter;
  const c = Math.cos(view.angle);
  const s2 = Math.sin(view.angle);
  const rx = c * dx - s2 * dy;
  const ry = s2 * dx + c * dy;
  return {
    x: (rx * sx * 0.5 + 0.5) * w,
    y: (0.5 - ry * sy * 0.5) * h
  };
}
function screenDirFromWorldAngle(worldAngle, viewAngle) {
  const ang = worldAngle + viewAngle;
  return { x: Math.cos(ang), y: -Math.sin(ang) };
}
function mothershipSternLocalCenter(mothership) {
  const points = mothership && (mothership.renderPoints || mothership.points);
  if (!points || !points.length) {
    return { x: 0, y: 0 };
  }
  let minX = Number.POSITIVE_INFINITY;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
  }
  const eps = Math.max(0.02, (mothership && mothership.spacing ? mothership.spacing : 0.4) * 0.45);
  let sumX = 0;
  let sumY = 0;
  let count = 0;
  for (const p of points) {
    if (p.x <= minX + eps) {
      sumX += p.x;
      sumY += p.y;
      count++;
    }
  }
  if (!count) {
    return { x: minX, y: 0 };
  }
  return {
    x: sumX / count,
    y: sumY / count
  };
}
function mothershipSternWorld(mothership) {
  if (!mothership) {
    return { x: 0, y: 0 };
  }
  const stern = mothershipSternLocalCenter(mothership);
  const c = Math.cos(mothership.angle);
  const s = Math.sin(mothership.angle);
  return {
    x: mothership.x + c * stern.x - s * stern.y,
    y: mothership.y + s * stern.x + c * stern.y
  };
}
function cloneMothershipPose(mothership) {
  if (!mothership) return null;
  return {
    x: mothership.x,
    y: mothership.y,
    vx: mothership.vx,
    vy: mothership.vy,
    angle: mothership.angle,
    points: mothership.points,
    tris: mothership.tris,
    triAir: mothership.triAir,
    renderPoints: mothership.renderPoints,
    renderTris: mothership.renderTris,
    bounds: mothership.bounds,
    spacing: mothership.spacing,
    rows: mothership.rows,
    cols: mothership.cols
  };
}
function cloneRenderState(state) {
  return {
    ...state,
    ship: { ...state.ship }
  };
}
function shipDockPoseForMothership(ship, mothership) {
  if (!ship || !mothership) {
    return ship ? { ...ship, explodeT: 0 } : ship;
  }
  const dock = ship._dock || { lx: GAME.MOTHERSHIP_START_DOCK_X, ly: GAME.MOTHERSHIP_START_DOCK_Y };
  const c = Math.cos(mothership.angle);
  const s = Math.sin(mothership.angle);
  return {
    ...ship,
    x: mothership.x + c * dock.lx - s * dock.ly,
    y: mothership.y + s * dock.lx + c * dock.ly,
    vx: mothership.vx,
    vy: mothership.vy,
    state: "landed",
    explodeT: 0,
    _dock: { lx: dock.lx, ly: dock.ly },
    renderAngle: mothership.angle + Math.PI
  };
}
class JumpdriveTransition {
  constructor() {
    this.cfg = GAME.JUMPDRIVE;
    this.active = false;
    this.phase = PHASE_ALIGN;
    this.phaseTime = 0;
    this.phaseDuration = 0;
    this.totalTime = 0;
    this.startView = null;
    this.stoppedView = null;
    this.revealStartView = null;
    this.revealEndView = null;
    this.revealView = null;
    this.focusStartView = null;
    this.focusEndView = null;
    this.startMothership = null;
    this.visualMothership = null;
    this.finalMothership = null;
    this.hiddenShip = null;
    this.seed = 0;
    this.level = 0;
    this.planetConfig = null;
    this.planetParams = null;
    this.mapWorld = null;
    this.worker = null;
    this.workerRequestId = 0;
    this.pendingPreparedLevel = null;
    this.awaitingApply = false;
    this.loadFailed = false;
    this.loadError = "";
    this.launchCamAngle = 0;
    this.launchWorldAngle = 0;
    this.startCamAngularVel = 0;
    this.currentPlanetRadius = 0;
    this.starSeed = Math.random() * 1e3;
  }
  /**
   * @returns {boolean}
   */
  isActive() {
    return this.active;
  }
  /**
   * @returns {void}
   */
  cancel() {
    this.active = false;
    this.phase = PHASE_ALIGN;
    this.phaseTime = 0;
    this.phaseDuration = 0;
    this.totalTime = 0;
    this.startView = null;
    this.stoppedView = null;
    this.revealStartView = null;
    this.revealEndView = null;
    this.revealView = null;
    this.focusStartView = null;
    this.focusEndView = null;
    this.startMothership = null;
    this.visualMothership = null;
    this.finalMothership = null;
    this.hiddenShip = null;
    this.mapWorld = null;
    this.pendingPreparedLevel = null;
    this.awaitingApply = false;
    this.loadFailed = false;
    this.loadError = "";
  }
  /**
   * @param {{seed:number, level:number, planetConfig:import("./planet_config.js").PlanetConfig, planetParams:import("./planet_config.js").PlanetParams, view:ViewState, mothership:Mothership|null|undefined, ship:any, currentPlanetRadius:number, mapWorld?:MapWorld|null}} opts
   * @returns {void}
   */
  start(opts) {
    this.cancel();
    this.active = true;
    this.phase = PHASE_ALIGN;
    this.phaseTime = 0;
    this.phaseDuration = Math.max(0.05, this.cfg.alignDuration || 0.5);
    this.totalTime = 0;
    this.seed = opts.seed;
    this.level = opts.level;
    this.planetConfig = opts.planetConfig;
    this.planetParams = opts.planetParams;
    this.startView = { ...opts.view };
    this.currentPlanetRadius = opts.currentPlanetRadius || 0;
    this.startMothership = cloneMothershipPose(opts.mothership);
    this.visualMothership = cloneMothershipPose(opts.mothership);
    const mothership = opts.mothership;
    this.hiddenShip = shipDockPoseForMothership({
      ...opts.ship,
      _dock: opts.ship && opts.ship._dock ? opts.ship._dock : { lx: GAME.MOTHERSHIP_START_DOCK_X, ly: GAME.MOTHERSHIP_START_DOCK_Y }
    }, mothership);
    if (mothership) {
      const r2 = mothership.x * mothership.x + mothership.y * mothership.y;
      this.startCamAngularVel = r2 > 1e-6 ? (mothership.x * mothership.vy - mothership.y * mothership.vx) / r2 : 0;
    } else {
      this.startCamAngularVel = 0;
    }
    const stopOffset = this.startCamAngularVel * this.phaseDuration * 0.5;
    this.launchCamAngle = this.startView.angle + stopOffset;
    const launchTiltDeg = Number.isFinite(this.cfg.launchTiltDeg) ? this.cfg.launchTiltDeg : 38;
    const launchTilt = clamp(launchTiltDeg, -85, 85) * (Math.PI / 180);
    if (mothership) {
      const currentAngle = mothership.angle;
      const outwardAngle = Math.atan2(mothership.y, mothership.x);
      const outwardDelta = shortestAngleDelta(currentAngle, outwardAngle);
      const turn = clamp(outwardDelta, -Math.abs(launchTilt), Math.abs(launchTilt));
      this.launchWorldAngle = currentAngle + turn;
    } else {
      this.launchWorldAngle = Math.PI * 0.5 - this.launchCamAngle - launchTilt;
    }
    if (opts.mapWorld) {
      this.mapWorld = opts.mapWorld;
      this.pendingPreparedLevel = {
        seed: this.seed,
        level: this.level,
        planetConfig: this.planetConfig,
        planetParams: this.planetParams,
        mapWorld: opts.mapWorld
      };
    } else {
      this._requestMapWorld();
    }
  }
  /**
   * @returns {void}
   */
  _requestMapWorld() {
    const requestId = ++this.workerRequestId;
    const finishPrepared = (mapWorld) => {
      if (!this.active || requestId !== this.workerRequestId) return;
      this.mapWorld = mapWorld;
      this.pendingPreparedLevel = {
        seed: this.seed,
        level: this.level,
        planetConfig: this.planetConfig,
        planetParams: this.planetParams,
        mapWorld
      };
    };
    const failPrepared = (error) => {
      if (!this.active || requestId !== this.workerRequestId) return;
      this.loadFailed = true;
      this.loadError = typeof error === "string" ? error : "";
      const mapgen = new MapGen(
        this.seed,
        /** @type {import("./planet_config.js").PlanetParams} */
        this.planetParams
      );
      const world = mapgen.getWorld();
      finishPrepared({
        seed: world.seed,
        air: world.air,
        entrances: world.entrances,
        finalAir: world.finalAir
      });
    };
    if (typeof Worker !== "undefined") {
      try {
        if (!this.worker) {
          this.worker = new Worker(new URL(
            /* @vite-ignore */
            "/dropship-testing/assets/jumpdrive_level_worker-DaHl9Ck_.js",
            import.meta.url
          ), { type: "module" });
        }
        const worker = (
          /** @type {Worker} */
          this.worker
        );
        const onMessage = (event) => {
          const data = event && event.data ? event.data : null;
          if (!data || (data.requestId | 0) !== requestId) return;
          worker.removeEventListener("message", onMessage);
          worker.removeEventListener("error", onError);
          if (!data.ok) {
            failPrepared(data.error || "worker_failed");
            return;
          }
          finishPrepared(data.mapWorld);
        };
        const onError = () => {
          worker.removeEventListener("message", onMessage);
          worker.removeEventListener("error", onError);
          failPrepared("worker_error");
        };
        worker.addEventListener("message", onMessage);
        worker.addEventListener("error", onError);
        worker.postMessage({
          requestId,
          seed: this.seed,
          planetParams: this.planetParams
        });
        return;
      } catch (err) {
        failPrepared(err instanceof Error ? err.message : String(err));
        return;
      }
    }
    failPrepared("worker_unavailable");
  }
  /**
   * @param {number} dt
   * @returns {void}
   */
  update(dt) {
    if (!this.active) return;
    const safeDt = Math.max(0, dt);
    this.totalTime += safeDt;
    this.phaseTime += safeDt;
    if (this.phase === PHASE_ALIGN) {
      this._updateAlign();
      if (this.phaseTime >= this.phaseDuration) {
        this.phase = PHASE_JUMPDRIVE;
        this.phaseTime = 0;
        this.phaseDuration = Math.max(0.1, this.cfg.jumpdriveMinDuration || 1);
      }
      return;
    }
    if (this.phase === PHASE_JUMPDRIVE) {
      this._updateJumpdrive();
      if (this.phaseTime >= this.phaseDuration && this.pendingPreparedLevel) {
        this.phase = PHASE_WAIT_APPLY;
        this.awaitingApply = true;
      }
      return;
    }
    if (this.phase === PHASE_REVEAL) {
      this._updateReveal();
      if (this.phaseTime >= this.phaseDuration) {
        this.revealView = this.revealEndView ? { ...this.revealEndView } : this.revealView;
        this.focusStartView = this.revealEndView ? { ...this.revealEndView } : this.revealView ? { ...this.revealView } : this.focusStartView;
        this.phase = PHASE_FOCUS;
        this.phaseTime = 0;
        this.phaseDuration = Math.max(0.05, this.cfg.focusDuration || 0.65);
      }
      return;
    }
    if (this.phase === PHASE_FOCUS) {
      if (this.phaseTime >= this.phaseDuration) {
        this.cancel();
      }
    }
  }
  /**
   * @returns {void}
   */
  _updateAlign() {
    if (!this.startView || !this.startMothership || !this.visualMothership) return;
    const u = clamp01(this.phaseTime / Math.max(1e-6, this.phaseDuration));
    const eased = easeOutCubic(u);
    const angleOffset = this.startCamAngularVel * this.phaseDuration * (u - 0.5 * u * u);
    const camAngle = this.startView.angle + angleOffset;
    const zoomMul = lerp(1, this.cfg.alignZoomMultiplier || 1.12, eased);
    this.stoppedView = {
      xCenter: this.startMothership.x,
      yCenter: this.startMothership.y,
      radius: this.startView.radius * zoomMul,
      angle: camAngle
    };
    this.visualMothership.x = this.startMothership.x;
    this.visualMothership.y = this.startMothership.y;
    this.visualMothership.angle = lerpAngleShortest(this.startMothership.angle, this.launchWorldAngle, eased);
  }
  /**
   * @returns {void}
   */
  _updateJumpdrive() {
    if (!this.startMothership || !this.visualMothership || !this.stoppedView) return;
    const minDuration = Math.max(0.1, this.cfg.jumpdriveMinDuration || 1);
    const u = clamp01(this.phaseTime / minDuration);
    const travel = easeOutCubic(u);
    const launchDir = angleVec(this.launchWorldAngle);
    const launchDistance = Math.max(
      this.startView ? this.startView.radius * (this.cfg.launchDistanceMultiplier || 3.2) : 10,
      (this.currentPlanetRadius || 0) * 1.6
    );
    const mx = this.startMothership.x + launchDir.x * launchDistance * travel;
    const my = this.startMothership.y + launchDir.y * launchDistance * travel;
    this.visualMothership.x = mx;
    this.visualMothership.y = my;
    this.visualMothership.angle = this.launchWorldAngle;
    this.visualMothership.vx = launchDir.x;
    this.visualMothership.vy = launchDir.y;
  }
  /**
   * @returns {void}
   */
  _updateReveal() {
    if (!this.revealView || !this.visualMothership || !this.finalMothership) return;
    const u = clamp01(this.phaseTime / Math.max(1e-6, this.phaseDuration));
    const eased = easeInOutCubic(u);
    const startPose = this.arrivalStartPose;
    if (!startPose) return;
    this.visualMothership.x = lerp(startPose.x, this.finalMothership.x, eased);
    this.visualMothership.y = lerp(startPose.y, this.finalMothership.y, eased);
    this.visualMothership.angle = lerpAngleShortest(startPose.angle, this.finalMothership.angle, eased);
  }
  /**
   * @returns {null|{seed:number,level:number,planetConfig:any,planetParams:any,mapWorld:MapWorld}}
   */
  consumePreparedLevel() {
    if (!this.awaitingApply || !this.pendingPreparedLevel) return null;
    this.awaitingApply = false;
    return this.pendingPreparedLevel;
  }
  /**
   * @param {{mothership:Mothership|null|undefined, view:ViewState}} applied
   * @returns {void}
   */
  applyPreparedLevel(applied) {
    const finalMothership = cloneMothershipPose(applied.mothership);
    if (!this.active || !finalMothership) return;
    this.finalMothership = finalMothership;
    this.visualMothership = cloneMothershipPose(finalMothership);
    const revealAngle = applied.view.angle;
    const revealRadius = Math.max(
      applied.view.radius * (this.cfg.revealZoomMultiplier || 1.85),
      (this.planetParams && this.planetParams.RMAX ? this.planetParams.RMAX : 0) * 1.5
    );
    const revealStartRadius = Math.max(
      applied.view.radius * (this.cfg.revealStartZoomMultiplier || (this.cfg.revealZoomMultiplier || 1.85) * 1.9),
      revealRadius * 1.35
    );
    this.revealStartView = {
      xCenter: 0,
      yCenter: 0,
      radius: revealStartRadius,
      angle: revealAngle
    };
    this.revealEndView = {
      xCenter: 0,
      yCenter: 0,
      radius: revealRadius,
      angle: revealAngle
    };
    this.revealView = { ...this.revealStartView };
    this.focusStartView = { ...this.revealEndView };
    this.focusEndView = { ...applied.view };
    const up = angleVec(Math.PI * 0.5 - revealAngle);
    const side = { x: -up.y, y: up.x };
    const orbitRadius = Math.hypot(finalMothership.x, finalMothership.y);
    const arriveOffset = orbitRadius * (this.cfg.arrivalOffsetMultiplier || 1.9);
    const lateralOffset = orbitRadius * (this.cfg.arrivalLateralMultiplier || 0.42);
    this.arrivalStartPose = {
      x: finalMothership.x + up.x * arriveOffset + side.x * lateralOffset,
      y: finalMothership.y + up.y * arriveOffset + side.y * lateralOffset,
      angle: this.launchWorldAngle
    };
    this.phase = PHASE_REVEAL;
    this.phaseTime = 0;
    this.phaseDuration = Math.max(0.05, this.cfg.revealDuration || 0.85);
  }
  /**
   * @param {RenderState} state
   * @returns {RenderState}
   */
  decorateRenderState(state) {
    if (!this.active) return state;
    const nextState = cloneRenderState(state);
    nextState.showGameplayIndicators = false;
    nextState.touchUi = null;
    nextState.touchStart = false;
    nextState.touchStartMode = null;
    nextState.aimWorld = null;
    nextState.aimOrigin = null;
    nextState.ship = shipDockPoseForMothership(
      this.hiddenShip || nextState.ship,
      this.visualMothership || nextState.mothership || null
    );
    const view = this._currentView(state.view);
    nextState.view = view;
    nextState.showVisibleOuterRingEntities = this.phase === PHASE_REVEAL || this.phase === PHASE_FOCUS;
    if (this.visualMothership) {
      nextState.mothership = /** @type {import("./mothership.js").Mothership} */
      { ...this.visualMothership };
    }
    return nextState;
  }
  /**
   * @param {{x:number,y:number}} fallbackShip
   * @returns {{x:number,y:number}|null}
   */
  fogOrigin(fallbackShip) {
    if (!this.active) return null;
    if (this.phase !== PHASE_REVEAL && this.phase !== PHASE_FOCUS) return null;
    const ship = shipDockPoseForMothership(
      this.hiddenShip || fallbackShip,
      this.visualMothership || null
    );
    if (!ship) return null;
    return { x: ship.x, y: ship.y };
  }
  /**
   * @param {ViewState} fallback
   * @returns {ViewState}
   */
  _currentView(fallback) {
    if (!this.active) return fallback;
    if (this.phase === PHASE_ALIGN || this.phase === PHASE_JUMPDRIVE || this.phase === PHASE_WAIT_APPLY) {
      if (!this.stoppedView) return fallback;
      const base = { ...this.stoppedView };
      if (this.phase !== PHASE_ALIGN) {
        base.radius = this.stoppedView.radius * (this.cfg.jumpdriveZoomMultiplier || 1.45);
        if (this.visualMothership) {
          base.xCenter = this.visualMothership.x;
          base.yCenter = this.visualMothership.y;
        }
      }
      return base;
    }
    if (this.phase === PHASE_REVEAL) {
      if (this.revealStartView && this.revealEndView) {
        const u = clamp01(this.phaseTime / Math.max(1e-6, this.phaseDuration));
        const eased = easeInOutCubic(u);
        const view = {
          xCenter: lerp(this.revealStartView.xCenter, this.revealEndView.xCenter, eased),
          yCenter: lerp(this.revealStartView.yCenter, this.revealEndView.yCenter, eased),
          radius: lerp(this.revealStartView.radius, this.revealEndView.radius, eased),
          angle: lerpAngleShortest(this.revealStartView.angle, this.revealEndView.angle, eased)
        };
        this.revealView = view;
        return view;
      }
      return this.revealView ? { ...this.revealView } : fallback;
    }
    if (this.phase === PHASE_FOCUS && this.focusStartView && this.focusEndView) {
      const u = clamp01(this.phaseTime / Math.max(1e-6, this.phaseDuration));
      const eased = easeInOutCubic(u);
      return {
        xCenter: lerp(this.focusStartView.xCenter, this.focusEndView.xCenter, eased),
        yCenter: lerp(this.focusStartView.yCenter, this.focusEndView.yCenter, eased),
        radius: lerp(this.focusStartView.radius, this.focusEndView.radius, eased),
        angle: lerpAngleShortest(this.focusStartView.angle, this.focusEndView.angle, eased)
      };
    }
    return fallback;
  }
  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} w
   * @param {number} h
   * @param {number} dpr
   * @param {RenderState|null|undefined} renderState
   * @returns {boolean}
   */
  drawOverlay(ctx, w, h, dpr, renderState) {
    if (!this.active || !renderState) return false;
    const view = renderState.view;
    const phaseStrength = this.phase === PHASE_ALIGN ? clamp01(this.phaseTime / Math.max(1e-6, this.phaseDuration)) * 0.35 : this.phase === PHASE_JUMPDRIVE || this.phase === PHASE_WAIT_APPLY ? 1 : this.phase === PHASE_REVEAL ? 1 - easeInOutCubic(clamp01(this.phaseTime / Math.max(1e-6, this.phaseDuration))) : 0.12;
    if (phaseStrength > 0) {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, `rgba(8, 18, 34, ${0.18 + phaseStrength * 0.32})`);
      grad.addColorStop(0.55, `rgba(4, 10, 26, ${0.28 + phaseStrength * 0.28})`);
      grad.addColorStop(1, `rgba(0, 0, 0, ${0.45 + phaseStrength * 0.2})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      this._drawStarStreaks(ctx, w, h, dpr, phaseStrength);
    }
    this._drawMothershipThrusters(ctx, w, h, dpr, view);
    if ((this.phase === PHASE_JUMPDRIVE || this.phase === PHASE_WAIT_APPLY) && !this.pendingPreparedLevel) {
      this._drawLoadingText(ctx, w, h, dpr);
    }
    return true;
  }
  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} w
   * @param {number} h
   * @param {number} dpr
   * @param {number} strength
   * @returns {void}
   */
  _drawStarStreaks(ctx, w, h, dpr, strength) {
    const count = Math.max(24, (this.cfg.streakCount || 84) | 0);
    const speed = this.phase === PHASE_REVEAL ? 0.22 : 1;
    const t = this.totalTime * (0.85 + strength * 2.8) + this.starSeed;
    const view = this._currentView({
      xCenter: 0,
      yCenter: 0,
      radius: 1,
      angle: this.launchCamAngle
    });
    const dir0 = screenDirFromWorldAngle(this.launchWorldAngle, view.angle);
    const dirLen = Math.hypot(dir0.x, dir0.y) || 1;
    const dir = { x: dir0.x / dirLen, y: dir0.y / dirLen };
    const side = { x: -dir.y, y: dir.x };
    const span = Math.hypot(w, h);
    const travelSpan = span * 2.2;
    for (let i = 0; i < count; i++) {
      const seed = i * 12.9898 + this.starSeed * 31.7;
      const depth = 0.2 + fract(Math.sin(seed * 2.371) * 9631.417);
      const speedMul = speed * (0.35 + depth * 1.2);
      const lane = (fract(Math.sin(seed * 1.123) * 43758.5453) * 2 - 1) * span;
      const along = (fract(Math.sin(seed * 4.711) * 28541.94 + t * speedMul) * 2 - 0.5) * travelSpan;
      const headX = w * 0.5 + side.x * lane + dir.x * along;
      const headY = h * 0.5 + side.y * lane + dir.y * along;
      const len = (6 + strength * 70) * depth * dpr;
      const tailX = headX - dir.x * len;
      const tailY = headY - dir.y * len;
      const alpha = clamp01(0.15 + strength * 0.9) * (0.45 + depth * 0.5);
      ctx.strokeStyle = `rgba(${Math.round(180 + depth * 70)}, ${Math.round(215 + depth * 30)}, 255, ${alpha})`;
      ctx.lineWidth = Math.max(1, (0.8 + strength * 1.8) * depth * dpr);
      ctx.beginPath();
      ctx.moveTo(headX, headY);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
    }
  }
  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} w
   * @param {number} h
   * @param {number} dpr
   * @param {ViewState} view
   * @returns {void}
   */
  _drawMothershipThrusters(ctx, w, h, dpr, view) {
    if (!this.visualMothership) return;
    const sternWorld = mothershipSternWorld(this.visualMothership);
    const stern = worldToScreenPx(view, w, h, sternWorld.x, sternWorld.y);
    const forward = screenDirFromWorldAngle(this.visualMothership.angle, view.angle);
    const back = { x: -forward.x, y: -forward.y };
    const right = { x: -back.y, y: back.x };
    const phaseBoost = this.phase === PHASE_ALIGN ? 0.35 + 0.65 * easeOutCubic(clamp01(this.phaseTime / Math.max(1e-6, this.phaseDuration))) : this.phase === PHASE_JUMPDRIVE || this.phase === PHASE_WAIT_APPLY ? 1 : this.phase === PHASE_REVEAL ? 0.9 - 0.35 * easeInOutCubic(clamp01(this.phaseTime / Math.max(1e-6, this.phaseDuration))) : 0.15;
    const plumeScale = Math.max(0.1, Number.isFinite(this.cfg.plumeScale) ? this.cfg.plumeScale : 1);
    const coreLen = (24 + 52 * phaseBoost) * dpr * plumeScale;
    const coreSpread = (8 + 14 * phaseBoost) * dpr * plumeScale;
    const baseOffset = 8 * dpr * plumeScale;
    const jitter = 0.88 + 0.22 * Math.sin(this.totalTime * 34);
    const baseX = stern.x + back.x * baseOffset;
    const baseY = stern.y + back.y * baseOffset;
    const leftX = baseX + right.x * coreSpread;
    const leftY = baseY + right.y * coreSpread;
    const rightX = baseX - right.x * coreSpread;
    const rightY = baseY - right.y * coreSpread;
    const tipX = stern.x + back.x * (baseOffset + coreLen * jitter);
    const tipY = stern.y + back.y * (baseOffset + coreLen * jitter);
    ctx.save();
    const outer = ctx.createLinearGradient(baseX, baseY, tipX, tipY);
    outer.addColorStop(0, "rgba(255, 220, 120, 0.28)");
    outer.addColorStop(1, "rgba(120, 220, 255, 0)");
    ctx.fillStyle = outer;
    ctx.beginPath();
    ctx.moveTo(leftX, leftY);
    ctx.lineTo(rightX, rightY);
    ctx.lineTo(tipX, tipY);
    ctx.closePath();
    ctx.fill();
    const innerSpread = coreSpread * 0.42;
    const innerBaseX = stern.x + back.x * (baseOffset * 0.62);
    const innerBaseY = stern.y + back.y * (baseOffset * 0.62);
    const innerTipX = stern.x + back.x * (baseOffset + coreLen * 0.7 * jitter);
    const innerTipY = stern.y + back.y * (baseOffset + coreLen * 0.7 * jitter);
    ctx.fillStyle = "rgba(255, 248, 210, 0.78)";
    ctx.beginPath();
    ctx.moveTo(innerBaseX + right.x * innerSpread, innerBaseY + right.y * innerSpread);
    ctx.lineTo(innerBaseX - right.x * innerSpread, innerBaseY - right.y * innerSpread);
    ctx.lineTo(innerTipX, innerTipY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} w
   * @param {number} h
   * @param {number} dpr
   * @returns {void}
   */
  _drawLoadingText(ctx, w, h, dpr) {
    const text = "CHARGING JUMPDRIVE";
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 ${Math.max(10, Math.round(14 * dpr))}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
    ctx.fillStyle = "rgba(190, 228, 255, 0.88)";
    ctx.fillText(text, w * 0.5, h * 0.84);
    ctx.restore();
  }
}
function fract(value) {
  return value - Math.floor(value);
}
const EMPTY_RENDER_ARRAY = [];
Object.freeze(EMPTY_RENDER_ARRAY);
const EMPTY_FEATURE_PARTICLES = Object.freeze({
  iceShard: [],
  lava: [],
  mushroom: [],
  bubbles: [],
  splashes: []
});
const CRAWLER_BOMB_DEATH_SFX_DELAY_MS = 45;
function sampleAtmosphereDensity(planet, planetParams, surfaceR, x, y) {
  if (!(planetParams && planetParams.ATMOSPHERE_DRAG > 0)) return 0;
  if (!planet || typeof planet.airValueAtWorld !== "function") return 0;
  if (planet.airValueAtWorld(x, y) <= 0.5) return 0;
  const r2 = Math.hypot(x, y);
  const surface = Math.max(0, surfaceR);
  const height = Math.max(0, planetParams.ATMOSPHERE_HEIGHT || 0);
  if (height <= 0) return r2 <= surface + 0.02 ? 1 : 0;
  const altitude = Math.max(0, r2 - surface);
  return Math.max(0, Math.min(1, 1 - altitude / height));
}
function applyQuadraticVelocityDrag(vx, vy, dragCoeff, dt) {
  if (!(dragCoeff > 0) || !(dt > 0)) return { vx, vy };
  const speed = Math.hypot(vx, vy);
  if (speed <= 1e-6) return { vx, vy };
  const scale = 1 / (1 + dragCoeff * speed * dt);
  return { vx: vx * scale, vy: vy * scale };
}
class GameLoop {
  /**
   * Main gameplay loop orchestrator.
   * @param {Object} deps
   * @param {import("./rendering.js").Renderer} deps.renderer
   * @param {import("./input.js").Input} deps.input
   * @param {Ui} deps.ui
   * @param {{toggleMuted?:()=>boolean,toggleCombatMusicEnabled?:()=>boolean,stepMusicVolume?:(direction:number)=>number,stepSfxVolume?:(direction:number)=>number,setCombatActive?:(active:boolean)=>boolean,triggerCombatImmediate?:()=>boolean,triggerVictoryMusic?:()=>boolean,returnToAmbient?:(withFade?:boolean)=>void,playSfx?:(id:string,opts?:{volume?:number,rate?:number})=>boolean,setThrustLoopActive?:(active:boolean)=>boolean,isPlaybackBypassed?:()=>boolean,setPlaybackBypassed?:(bypassed:boolean)=>boolean}|null|undefined} [deps.audio]
   * @param {HTMLCanvasElement} deps.canvas
   * @param {HTMLCanvasElement|null|undefined} deps.overlay
   * @param {HTMLElement} deps.hud
   * @param {HTMLElement} [deps.planetLabel]
   * @param {HTMLElement} [deps.objectiveLabel]
   * @param {HTMLElement} [deps.shipStatusLabel]
   * @param {HTMLElement} [deps.signalMeter]
   * @param {HTMLElement} [deps.heatMeter]
   * @param {HelpPopup} [deps.helpPopup]
   */
  constructor({ renderer: renderer2, input: input2, ui, audio, canvas: canvas2, hud: hud2, overlay, planetLabel: planetLabel2, objectiveLabel: objectiveLabel2, shipStatusLabel: shipStatusLabel2, signalMeter: signalMeter2, heatMeter: heatMeter2, helpPopup: helpPopup2 }) {
    this.level = BENCH_CONFIG.enabled ? BENCH_CONFIG.level : 1;
    const seed = BENCH_CONFIG.enabled ? BENCH_CONFIG.seed : performance.now();
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
    this.signalMeter = signalMeter2 || null;
    this.heatMeter = heatMeter2 || null;
    this.helpPopup = helpPopup2 || null;
    this.overlay = overlay || null;
    this.overlayCtx = this.overlay ? this.overlay.getContext("2d") : null;
    this.jumpdriveTransition = new JumpdriveTransition();
    this._lastRenderState = null;
    this.TERRAIN_PAD = 0.5;
    this.TERRAIN_MAX = this.planetParams.RMAX + this.TERRAIN_PAD;
    this.TERRAIN_IMPACT_RADIUS = 0.75;
    this.TERRAIN_NODE_IMPACT_RANGE = 1;
    this.shipCollisionLocalConvexHull = buildDropshipLocalConvexHullPoints(GAME);
    this.shipCollisionEdgeSamplesPerEdge = 2;
    this.shipCollisionMaxSampleSpacing = 0.03;
    this.shipCollisionConvexHullBoundRadius = computeDropshipConvexHullBoundRadius(this.shipCollisionLocalConvexHull);
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
      _landingDebug: null,
      dropshipMiners: 0,
      dropshipPilots: 0,
      dropshipEngineers: 0,
      mothershipMiners: 0,
      mothershipPilots: 0,
      mothershipEngineers: 0,
      hpMax: GAME.SHIP_STARTING_MAX_HP,
      bombsMax: GAME.SHIP_STARTING_MAX_BOMBS,
      thrust: GAME.SHIP_STARTING_THRUST,
      inertialDrive: GAME.SHIP_STARTING_INERTIAL_DRIVE,
      gunPower: GAME.SHIP_STARTING_GUN_POWER,
      rescueeDetector: false,
      planetScanner: false,
      bounceShots: false
    };
    this.mothership = mothership;
    this.debris = [];
    this.fragments = [];
    this.fallenMiners = [];
    this.playerShots = [];
    this.playerBombs = [];
    this.entityExplosions = [];
    this.popups = [];
    this.shipHitPopups = [];
    this.lastAimWorld = null;
    this.lastAimScreen = null;
    this._shipWasInWater = false;
    this.ship.renderAngle = getDropshipWorldRotation(this.ship.x, this.ship.y);
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
    this.CRAWLER_DEATH_BLAST = 1;
    this.CRAWLER_BOMB_DEATH_BLAST = 2;
    this.CRAWLER_DEATH_DAMAGE = 1;
    this.CRAWLER_DEATH_FLASH_LIFE = 0.8;
    this.SHIP_HIT_BLAST = 0.55;
    this.ENEMY_HIT_BLAST = 0.35;
    this.NONLETHAL_HIT_FLASH_LIFE = 0.25;
    this.FACTORY_HIT_FLASH_T = 0.35;
    this.MINER_SHOT_DEATH_LIFE = 1.1;
    this.MINER_EXPLOSION_DEATH_LIFE = 1.45;
    this.MINER_EXPLOSION_DEATH_SPEED_MIN = 0.5;
    this.MINER_EXPLOSION_DEATH_SPEED_MAX = 1.1;
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
    this._prepareBarrenMinerPadReservations(this.planet, planetConfig, this.level);
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
      onEnemyDestroyed: (enemy, info) => {
        this._handleEnemyDestroyed(enemy, info);
      }
    });
    this.healthPickups = [];
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
    this.frameStats = null;
    this.frameStatsTracker = new RollingFrameStats(BENCH_CONFIG.enabled ? 2400 : 600);
    this.frameStatsUpdatedAt = this.lastTime;
    this.perfFlags = ACTIVE_PERF_FLAGS;
    this.benchmarkRun = BENCH_CONFIG.enabled ? {
      startedAtMs: 0,
      sampleStartAtMs: 0,
      sampleEndAtMs: 0,
      active: false,
      finished: false,
      stateText: `warmup ${Math.ceil(BENCH_CONFIG.warmupMs / 1e3)}s`,
      tracker: new RollingFrameStats(Math.max(600, Math.ceil(BENCH_CONFIG.durationMs / 1e3 * 180))),
      result: null
    } : null;
    this.debugCollisions = GAME.DEBUG_COLLISION;
    this.debugPlanetTriangles = false;
    this.debugCollisionContours = false;
    this.debugFrameStepMode = false;
    this.debugMinerGuidePath = false;
    this.debugRingVertices = false;
    this.debugMinerPathToMiner = null;
    this.devHudVisible = BENCH_CONFIG.enabled;
    this.hud.style.display = this.devHudVisible ? "block" : "none";
    if (this.input && typeof this.input.setDebugCommandsEnabled === "function") {
      this.input.setDebugCommandsEnabled(this.devHudVisible);
    }
    this.levelAdvanceReady = false;
    this.lastHeat = 0;
    this.statusCueText = "";
    this.statusCueUntil = 0;
    this.screenshotCopyInFlight = false;
    this._lastLandingDebugConsoleLine = "";
    this._landingDebugSessionIdNext = 1;
    this._landingDebugSessionId = 0;
    this._landingDebugSessionFrame = 0;
    this._landingDebugSessionActive = false;
    this._landingDebugSessionSource = "";
    this._minerPathDebugCooldown = 0;
    this._resetStartTitle();
    this.pendingBootJumpdriveIntro = !BENCH_CONFIG.enabled;
    this.NEW_GAME_HELP_PROMPT_SECS = 10;
    this.newGameHelpPromptT = 0;
    this.newGameHelpPromptArmed = true;
    this.START_TITLE_FADE_PER_SEC = 1.8;
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
        this._damageEnemy(enemy, 1);
      },
      onEnemyStun: (enemy, duration, source) => {
        this._stunEnemy(enemy, duration, source);
      },
      onMinerKilled: () => {
        this.minersRemaining = Math.max(0, this.minersRemaining - 1);
        this.minersDead++;
      }
    };
    this.planetView = false;
    this.fogEnabled = true;
    this.manualZoomActive = false;
    this.manualZoomMultiplier = 1;
    this.hasLaunchedPlayerShip = false;
    this.pendingPerkChoice = null;
    this.objectiveCompleteSfxPlayed = this._objectiveComplete();
    this.objectiveCompleteSfxDueAtMs = Number.POSITIVE_INFINITY;
    this.victoryMusicTriggered = false;
    if (BENCH_CONFIG.enabled) {
      this._applyBenchmarkSetup();
    }
  }
  /**
   * @returns {void}
   */
  _applyBenchmarkSetup() {
    this.pendingBootJumpdriveIntro = false;
    this.startTitleSeen = true;
    this.startTitleFade = true;
    this.startTitleAlpha = 0;
    this.newGameHelpPromptT = 0;
    this.newGameHelpPromptArmed = false;
    this.devHudVisible = true;
    this.hud.style.display = "block";
    if (this.input && typeof this.input.setDebugCommandsEnabled === "function") {
      this.input.setDebugCommandsEnabled(true);
    }
    if (BENCH_CONFIG.start === "orbit") {
      this._putShipInLowOrbit();
      this.hasLaunchedPlayerShip = true;
    }
    const perfText = this.perfFlags.length ? ` | ${this.perfFlags.join(",")}` : "";
    this._showStatusCue(`Benchmark warmup ${Math.ceil(BENCH_CONFIG.warmupMs / 1e3)}s${perfText}`, 2.5);
  }
  /**
   * @param {number} now
   * @param {number} frameMs
   * @returns {void}
   */
  _recordFrameTiming(now, frameMs) {
    this.frameStatsTracker.record(frameMs);
    if (!this.frameStats || now - this.frameStatsUpdatedAt >= 500) {
      this.frameStats = this.frameStatsTracker.snapshot();
      this.frameStatsUpdatedAt = now;
    }
    if (!this.benchmarkRun || this.benchmarkRun.finished) return;
    if (!this.benchmarkRun.startedAtMs) {
      this.benchmarkRun.startedAtMs = now;
      this.benchmarkRun.sampleStartAtMs = now + BENCH_CONFIG.warmupMs;
      this.benchmarkRun.sampleEndAtMs = this.benchmarkRun.sampleStartAtMs + BENCH_CONFIG.durationMs;
    }
    if (now < this.benchmarkRun.sampleStartAtMs) {
      this.benchmarkRun.stateText = `warmup ${Math.max(0, Math.ceil((this.benchmarkRun.sampleStartAtMs - now) / 1e3))}s`;
      return;
    }
    if (!this.benchmarkRun.active) {
      this.benchmarkRun.active = true;
      this.benchmarkRun.tracker.reset();
      this._showStatusCue(`Benchmark recording ${Math.ceil(BENCH_CONFIG.durationMs / 1e3)}s`, 1.5);
    }
    this.benchmarkRun.tracker.record(frameMs);
    const remainingMs = this.benchmarkRun.sampleEndAtMs - now;
    if (remainingMs > 0) {
      this.benchmarkRun.stateText = `run ${Math.max(0, Math.ceil(remainingMs / 1e3))}s`;
      return;
    }
    this.benchmarkRun.finished = true;
    this.benchmarkRun.stateText = "done";
    this.benchmarkRun.result = this.benchmarkRun.tracker.snapshot();
    reportBenchmarkResult({
      bench: BENCH_CONFIG,
      stats: this.benchmarkRun.result,
      perfFlags: this.perfFlags,
      planetSeed: this.planet.getSeed()
    });
    this._showStatusCue("Benchmark complete; see console", 3.5);
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
   * Reserve barren pads for miners before turrets sample remaining platforms.
   * @param {Planet} planet
   * @param {PlanetConfig|null|undefined} cfg
   * @param {number} level
   * @returns {void}
   */
  _prepareBarrenMinerPadReservations(planet, cfg, level) {
    if (!planet || !(cfg && cfg.flags && cfg.flags.barrenPerimeter)) return;
    const minerTarget = this._minerTargetForConfig(cfg, level);
    const turretTarget = this._enemyTotalForConfig(cfg, level);
    const seed = planet.getSeed() + level * 97;
    if (typeof planet.layoutBarrenPadsForRoles === "function" && (minerTarget > 0 || turretTarget > 0)) {
      planet.layoutBarrenPadsForRoles(minerTarget, turretTarget, seed, GAME.MINER_MIN_SEP);
    }
    if (minerTarget <= 0 || typeof planet.reserveBarrenPadsForMiners !== "function") return;
    planet.reserveBarrenPadsForMiners(minerTarget, seed, GAME.MINER_MIN_SEP);
  }
  /**
   * @param {import("./planet_config.js").PlanetConfig} cfg
   * @param {number} lvl
   * @returns {{type:string,target:number}}
   */
  _buildObjective(cfg, lvl) {
    const obj = cfg && cfg.objective ? cfg.objective : { type: "extract", count: 0 };
    if (cfg && cfg.id === "mechanized" && this.planet && this.planet.getCoreRadius && this.planet.getCoreRadius() > 0.5) {
      const target = this._tetherPropsAll().length;
      if (target > 0) {
        return { type: "destroy_core", target };
      }
    }
    if (obj.type === "clear") {
      const target = obj.count && obj.count > 0 ? obj.count : this._enemyTotalForConfig(cfg, lvl);
      return { type: "clear", target };
    }
    if (obj.type === "destroy_factories") {
      const target = obj.count && obj.count > 0 ? obj.count : this._factoryPropsAlive().length;
      return { type: "destroy_factories", target };
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
      if (
        /** @type {number} */
        (p.propId | 0) === (propId | 0)
      ) return p;
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
    return this._remainingCombatEnemies();
  }
  /**
   * @returns {number}
   */
  _remainingFactoryTargets() {
    return this._factoryPropsAlive().length;
  }
  /**
   * @returns {{min:number,max:number}}
   */
  _factorySpawnCooldownRange() {
    const cfg = this.planet && this.planet.getPlanetConfig ? this.planet.getPlanetConfig() : null;
    const min = cfg && typeof cfg.factorySpawnCooldownMin === "number" ? cfg.factorySpawnCooldownMin : 6.5;
    const max = cfg && typeof cfg.factorySpawnCooldownMax === "number" ? cfg.factorySpawnCooldownMax : 10.5;
    const lo = Math.max(0.1, Math.min(min, max));
    const hi = Math.max(lo, Math.max(min, max));
    return { min: lo, max: hi };
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
      return `Objective: Clear enemies ${done}${target ? `/${target}` : ""}`;
    }
    if (this.objective.type === "destroy_factories") {
      return "Object: Destroy factories";
    }
    if (this.objective.type === "extract") {
      const remaining = this.minersRemaining;
      const target = this.objective.target || 0;
      const rescued = target ? Math.max(0, target - remaining) : 0;
      return `Objective: Extract miners ${rescued}${target ? `/${target}` : ""} (dead ${this.minersDead})`;
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
    this.ship._dock = { lx: GAME.MOTHERSHIP_START_DOCK_X, ly: GAME.MOTHERSHIP_START_DOCK_Y };
    this.ship._collision = null;
    this.ship._samples = null;
    this.ship._landingDebug = null;
    this.debris.length = 0;
    this.fragments.length = 0;
    this.fallenMiners.length = 0;
    this.playerShots.length = 0;
    this.playerBombs.length = 0;
    this.entityExplosions.length = 0;
    this.popups.length = 0;
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
    this._resetShipRenderAngle();
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
    this._resetShipRenderAngle();
  }
  /**
   * Reset ship/camera orientation after teleports, respawns, and load.
   * @returns {void}
   */
  _resetShipRenderAngle() {
    this.ship.renderAngle = getDropshipWorldRotation(this.ship.x, this.ship.y);
  }
  /**
   * Damp the singular 180-degree flip at the planet core without adding general camera lag.
   * @param {number} dt
   * @returns {void}
   */
  _updateShipRenderAngle(dt) {
    const target = getDropshipWorldRotation(this.ship.x, this.ship.y);
    const current = Number.isFinite(this.ship.renderAngle) ? (
      /** @type {number} */
      this.ship.renderAngle
    ) : target;
    const delta = lerpAngleShortest$1(current, target, 1) - current;
    const maxStep = Math.PI * 8 * Math.max(0, dt);
    if (!(maxStep > 0) || Math.abs(delta) <= maxStep) {
      this.ship.renderAngle = target;
      return;
    }
    this.ship.renderAngle = lerpAngleShortest$1(current, target, maxStep / Math.abs(delta));
  }
  /**
   * @param {import("./types.d.js").FragmentDestroyedBy} [destroyedBy]
   * @returns {void}
   */
  _triggerCrash(destroyedBy = "unknown") {
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
    this._spawnShipDestructionFragments(destroyedBy);
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
   * @param {import("./types.d.js").FragmentDestroyedBy} [destroyedBy]
   * @returns {void}
   */
  _damageShip(x, y, destroyedBy = "unknown") {
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
      this._triggerCrash(destroyedBy);
    }
  }
  /**
   * @param {import("./types.d.js").FragmentDestroyedBy} destroyedBy
   * @returns {void}
   */
  _spawnShipDestructionFragments(destroyedBy) {
    const start = this.fragments.length;
    spawnFragmentBurst(this.fragments, this.ship, "dropship", destroyedBy, { pieces: 6 });
    const shipSilverTop = [0.85, 0.87, 0.9];
    const shipSilverBottom = [0.55, 0.58, 0.62];
    const shipWindow = [0.05, 0.05, 0.05];
    const created = this.fragments.slice(start);
    for (let i = 0; i < created.length; i++) {
      const frag = created[i];
      if (!frag) continue;
      if (i === 0) {
        frag.cr = shipWindow[0];
        frag.cg = shipWindow[1];
        frag.cb = shipWindow[2];
        continue;
      }
      const t = Math.max(0, Math.min(1, (i - 1) / Math.max(1, created.length - 2)));
      frag.cr = shipSilverBottom[0] + (shipSilverTop[0] - shipSilverBottom[0]) * t;
      frag.cg = shipSilverBottom[1] + (shipSilverTop[1] - shipSilverBottom[1]) * t;
      frag.cb = shipSilverBottom[2] + (shipSilverTop[2] - shipSilverBottom[2]) * t;
    }
    const cargo = [];
    for (let i = 0; i < this.ship.dropshipMiners; i++) cargo.push("miner");
    for (let i = 0; i < this.ship.dropshipPilots; i++) cargo.push("pilot");
    for (let i = 0; i < this.ship.dropshipEngineers; i++) cargo.push("engineer");
    const cargoCount = cargo.length;
    for (let i = 0; i < cargoCount; i++) {
      const cargoType = cargo[i];
      if (!cargoType) continue;
      const ang = i / Math.max(1, cargoCount) * Math.PI * 2 + Math.random() * 0.35;
      const radius = 0.18 + Math.random() * 0.12;
      spawnFragmentBurst(this.fragments, {
        x: this.ship.x + Math.cos(ang) * radius,
        y: this.ship.y + Math.sin(ang) * radius,
        vx: this.ship.vx,
        vy: this.ship.vy
      }, cargoType, destroyedBy, { pieces: 1 });
    }
  }
  /**
   * @param {{x:number,y:number,hitT?:number}} enemy
   * @param {"lava"|"mushroom"|null} [source]
   * @returns {void}
   */
  _applyEnemyHitFeedback(enemy, source = null) {
    enemy.hitT = 0.25;
    const flashCol = source === "lava" ? { cr: 1, cg: 0.42, cb: 0.08 } : null;
    this.entityExplosions.push({
      x: enemy.x,
      y: enemy.y,
      life: this.NONLETHAL_HIT_FLASH_LIFE,
      radius: this.ENEMY_HIT_BLAST,
      ...flashCol || {}
    });
  }
  /**
   * @param {{x:number,y:number,hp:number,hitT?:number}} enemy
   * @param {number} amount
   * @returns {void}
   */
  _damageEnemy(enemy, amount) {
    if (!enemy || enemy.hp <= 0) return;
    const dmg = Math.max(0, amount || 0);
    if (dmg <= 0) return;
    enemy.hp = Math.max(0, enemy.hp - dmg);
    if (enemy.hp > 0) {
      this._applyEnemyHitFeedback(enemy);
    }
  }
  /**
   * @param {{x:number,y:number,hp:number,stunT?:number,hitT?:number}} enemy
   * @param {number} duration
   * @param {"lava"|"mushroom"} [source]
   * @returns {void}
   */
  _stunEnemy(enemy, duration, source) {
    if (!enemy || enemy.hp <= 0) return;
    enemy.stunT = Math.max(0.1, duration || 0);
    this._applyEnemyHitFeedback(enemy, source || null);
  }
  /**
   * @param {{type?:string,x:number,y:number,vx?:number,vy?:number}} enemy
   * @param {{cause?:"hp"|"detonate",destroyedBy?:import("./types.d.js").FragmentDestroyedBy}|null|undefined} [info]
   * @returns {void}
   */
  _handleEnemyDestroyed(enemy, info) {
    this._playSfx("enemy_destroyed", { volume: 0.8 });
    if (this.healthPickups.length === 0 && this.ship.hpCur < this.ship.hpMax && enemy.type !== "orbitingTurret") {
      const hpCurClamped = Math.min(4, this.ship.hpCur);
      const hpMaxClamped = 4;
      const healthPickupChance = (hpMaxClamped - hpCurClamped) / hpMaxClamped;
      if (Math.random() < healthPickupChance) {
        this.healthPickups.push({
          x: enemy.x,
          y: enemy.y,
          life: 4
        });
      }
    }
    if (!enemy || enemy.type !== "crawler") {
      return;
    }
    this._playCrawlerDeathSfx(info && info.destroyedBy ? info.destroyedBy : "unknown");
    this._applyCrawlerDeathBlast(enemy, info && info.destroyedBy ? info.destroyedBy : "unknown");
  }
  /**
   * @param {import("./types.d.js").FragmentDestroyedBy} destroyedBy
   * @returns {void}
   */
  _playCrawlerDeathSfx(destroyedBy) {
    const opts = {
      volume: destroyedBy === "bomb" ? 0.58 : 0.72,
      rate: destroyedBy === "bomb" ? 0.88 + Math.random() * 0.08 : 0.92 + Math.random() * 0.12
    };
    if (destroyedBy === "bomb") {
      setTimeout(() => {
        this._playSfx("bomb_explosion", opts);
      }, CRAWLER_BOMB_DEATH_SFX_DELAY_MS);
      return;
    }
    this._playSfx("bomb_explosion", opts);
  }
  /**
   * @param {{x:number,y:number,vx?:number,vy?:number}} enemy
   * @param {import("./types.d.js").FragmentDestroyedBy} destroyedBy
   * @returns {void}
   */
  _applyCrawlerDeathBlast(enemy, destroyedBy) {
    const x = enemy.x;
    const y = enemy.y;
    const blastRadius = destroyedBy === "bomb" ? this.CRAWLER_BOMB_DEATH_BLAST : this.CRAWLER_DEATH_BLAST;
    this.entityExplosions.push({
      x,
      y,
      life: this.CRAWLER_DEATH_FLASH_LIFE,
      radius: blastRadius
    });
    this._applyCrawlerBlastDamage(x, y, blastRadius, enemy, destroyedBy);
    this._applyCrawlerTerrainImpact(x, y, blastRadius);
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} radius
   * @param {{x:number,y:number}|null|undefined} sourceEnemy
   * @param {import("./types.d.js").FragmentDestroyedBy} [destroyedBy]
   * @returns {void}
   */
  _applyCrawlerBlastDamage(x, y, radius, sourceEnemy, destroyedBy = "unknown") {
    const r2 = radius * radius;
    const collateralDestroyedBy = destroyedBy === "bomb" ? "bomb" : "detonate";
    for (let j = this.enemies.enemies.length - 1; j >= 0; j--) {
      const e = this.enemies.enemies[j];
      if (!e || e === sourceEnemy || e.hp <= 0) continue;
      const dx = e.x - x;
      const dy = e.y - y;
      if (dx * dx + dy * dy > r2) continue;
      e.hp = Math.max(0, e.hp - this.CRAWLER_DEATH_DAMAGE);
      if (e.hp <= 0) {
        this.enemies.markEnemyDestroyedBy(e, collateralDestroyedBy);
      }
      if (e.hp > 0) {
        this._applyEnemyHitFeedback(e);
      }
    }
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} range
   * @returns {void}
   */
  _applyCrawlerTerrainImpact(x, y, range) {
    const cfg = this.planet ? this.planet.getPlanetConfig() : null;
    if (cfg && cfg.flags && cfg.flags.disableTerrainDestruction) return;
    const result = this.planet.destroyRockRadialNodesInRange(x, y, Math.max(this.TERRAIN_NODE_IMPACT_RANGE, range));
    if (!result) return;
    this._emitTerrainDestructionFragments(result, x, y);
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
    if (this._audioPlaybackBypassed()) return;
    if (!this.audio || typeof this.audio.playSfx !== "function") return;
    this.audio.playSfx(id, opts);
  }
  /**
   * @returns {boolean}
   */
  _audioPlaybackBypassed() {
    return !!(this.audio && typeof this.audio.isPlaybackBypassed === "function" && this.audio.isPlaybackBypassed());
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
    if (this._audioPlaybackBypassed()) {
      if (!active && this.audio && typeof this.audio.setThrustLoopActive === "function") {
        this.audio.setThrustLoopActive(false);
      }
      return;
    }
    if (!this.audio || typeof this.audio.setThrustLoopActive !== "function") return;
    this.audio.setThrustLoopActive(active);
  }
  /**
   * @param {boolean} active
   * @returns {void}
   */
  _setCombatActive(active) {
    if (this._audioPlaybackBypassed()) {
      if (!active && this.audio && typeof this.audio.setCombatActive === "function") {
        this.audio.setCombatActive(false);
      }
      return;
    }
    if (!this.audio || typeof this.audio.setCombatActive !== "function") return;
    this.audio.setCombatActive(active);
  }
  /**
   * @param {number} [holdMs]
   * @returns {void}
   */
  _markCombatThreat(holdMs) {
    const hold = Number.isFinite(holdMs) ? (
      /** @type {number} */
      holdMs
    ) : this.COMBAT_THREAT_HOLD_MS;
    const now = performance.now();
    this.combatThreatUntilMs = Math.max(this.combatThreatUntilMs, now + Math.max(0, hold));
  }
  /**
   * @returns {void}
   */
  _triggerCombatImmediate() {
    if (this.ship.state === "crashed") return;
    if (this._objectiveComplete()) return;
    if (this._audioPlaybackBypassed()) return;
    if (!this.audio || typeof this.audio.triggerCombatImmediate !== "function") return;
    this.audio.triggerCombatImmediate();
  }
  /**
   * @returns {void}
   */
  _triggerVictoryMusic() {
    if (this._audioPlaybackBypassed()) return;
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
   * @returns {number}
   */
  _manualZoomMinMultiplier() {
    return 0.35;
  }
  /**
   * @returns {number}
   */
  _manualZoomMaxMultiplier() {
    return 4;
  }
  /**
   * @returns {number}
   */
  _currentZoomMultiplier() {
    if (!this.manualZoomActive) return 1;
    const minMul = this._manualZoomMinMultiplier();
    const maxMul = this._manualZoomMaxMultiplier();
    const raw = Number.isFinite(this.manualZoomMultiplier) ? this.manualZoomMultiplier : 1;
    return Math.max(minMul, Math.min(maxMul, raw));
  }
  /**
   * @returns {void}
   */
  _resetManualZoom() {
    this.manualZoomActive = false;
    this.manualZoomMultiplier = 1;
  }
  /**
   * @returns {void}
   */
  _showZoomCue() {
    this._showStatusCue(`Zoom ${this._currentZoomMultiplier().toFixed(2)}x`, 1);
  }
  /**
   * @param {number} delta
   * @returns {void}
   */
  _applyManualZoomDelta(delta) {
    if (!Number.isFinite(delta) || Math.abs(delta) < 1e-4) return;
    if (this.planetView) return;
    if (!this.manualZoomActive) {
      this.manualZoomActive = true;
    }
    const step = Math.max(-6, Math.min(6, delta));
    const factor = Math.pow(1.1, step);
    const minMul = this._manualZoomMinMultiplier();
    const maxMul = this._manualZoomMaxMultiplier();
    const nextMul = Math.max(minMul, Math.min(maxMul, this.manualZoomMultiplier / factor));
    if (Math.abs(nextMul - 1) <= 0.02) {
      this._resetManualZoom();
      this._showZoomCue();
      return;
    }
    this.manualZoomMultiplier = nextMul;
    this._showZoomCue();
  }
  /**
   * @returns {ViewState}
   */
  _autoViewState() {
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
      angle: -(Number.isFinite(this.ship.renderAngle) ? (
        /** @type {number} */
        this.ship.renderAngle
      ) : getDropshipWorldRotation(this.ship.x, this.ship.y))
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
   * @returns {ViewState}
   */
  _viewState() {
    const view = this._autoViewState();
    if (!this.manualZoomActive || this.planetView) return view;
    const zoomMul = this._currentZoomMultiplier();
    const baseRadius = Math.max(1e-6, view.radius);
    const radiusScaled = baseRadius / zoomMul;
    const ratio = radiusScaled / baseRadius;
    view.xCenter = this.ship.x + (view.xCenter - this.ship.x) * ratio;
    view.yCenter = this.ship.y + (view.yCenter - this.ship.y) * ratio;
    view.radius = radiusScaled;
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
    const result = this.planet.destroyRockRadialNodesInRange(x, y, this.TERRAIN_NODE_IMPACT_RANGE, 1);
    if (!result) return;
    this._emitTerrainDestructionFragments(result, x, y);
  }
  /**
   * @param {{newAir:Float32Array|undefined,destroyedNodes:DestroyedTerrainNode[]}} result
   * @param {number} x
   * @param {number} y
   * @returns {void}
   */
  _emitTerrainDestructionFragments(result, x, y) {
    if (result.newAir) this.renderer.updateAir(result.newAir);
    if (!result.destroyedNodes || !result.destroyedNodes.length) return;
    const palette = this._planetPalette();
    spawnTerrainHexFragments(this.fragments, result.destroyedNodes, { x, y }, palette);
    const destroyedProps = this.planet.destroyTerrainPropsAttachedToNodes(result.destroyedNodes);
    if (destroyedProps.length) {
      this.planet.emitDetachedTerrainPropBursts(destroyedProps, this.featureCallbacks);
      spawnTerrainPropFragments(this.fragments, destroyedProps, { x, y }, palette);
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
        this._damageShip(x, y, "explosion");
      }
    }
    for (let j = this.enemies.enemies.length - 1; j >= 0; j--) {
      const e = (
        /** @type {import("./types.d.js").Enemy} */
        this.enemies.enemies[j]
      );
      const dx = e.x - x;
      const dy = e.y - y;
      if (dx * dx + dy * dy <= r2) {
        e.hp = 0;
        this.enemies.markEnemyDestroyedBy(e, "bomb");
      }
    }
    for (let j = this.miners.length - 1; j >= 0; j--) {
      const m = (
        /** @type {Miner} */
        this.miners[j]
      );
      const dx = m.x - x;
      const dy = m.y - y;
      if (dx * dx + dy * dy <= r2) {
        this._killMinerAt(j, "exploded", { x, y });
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
        this._damageShip(x, y, "explosion");
      }
    }
    for (let j = this.enemies.enemies.length - 1; j >= 0; j--) {
      const e = (
        /** @type {import("./types.d.js").Enemy} */
        this.enemies.enemies[j]
      );
      const dx = e.x - x;
      const dy = e.y - y;
      if (dx * dx + dy * dy <= r2) {
        e.hp = Math.max(0, e.hp - this.ship.gunPower);
        if (e.hp > 0) {
          this._applyEnemyHitFeedback(e);
        } else {
          this.enemies.markEnemyDestroyedBy(e, "explosion");
        }
      }
    }
    for (let j = this.miners.length - 1; j >= 0; j--) {
      const m = (
        /** @type {Miner} */
        this.miners[j]
      );
      const dx = m.x - x;
      const dy = m.y - y;
      if (dx * dx + dy * dy <= r2) {
        this._killMinerAt(j, "exploded", { x, y });
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
   *  size?:number,
   *  cr?:number,
   *  cg?:number,
   *  cb?:number,
   *  alpha?:number,
   *  normalX?:number,
   *  normalY?:number,
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
    const size = opts && typeof opts.size === "number" ? opts.size : void 0;
    const cr = opts && typeof opts.cr === "number" ? opts.cr : void 0;
    const cg = opts && typeof opts.cg === "number" ? opts.cg : void 0;
    const cb = opts && typeof opts.cb === "number" ? opts.cb : void 0;
    const alpha = opts && typeof opts.alpha === "number" ? opts.alpha : void 0;
    const normalX = opts && typeof opts.normalX === "number" ? opts.normalX : 0;
    const normalY = opts && typeof opts.normalY === "number" ? opts.normalY : 0;
    const normalLen = Math.hypot(normalX, normalY);
    const useHemisphere = normalLen > 1e-5;
    const nx = useHemisphere ? normalX / normalLen : 0;
    const ny = useHemisphere ? normalY / normalLen : 0;
    let burstBaseVx = baseVx;
    let burstBaseVy = baseVy;
    if (useHemisphere) {
      const baseNormal = burstBaseVx * nx + burstBaseVy * ny;
      if (baseNormal < 0) {
        burstBaseVx -= 2 * baseNormal * nx;
        burstBaseVy -= 2 * baseNormal * ny;
      }
    }
    for (let i = 0; i < pieces; i++) {
      const ang = Math.random() * Math.PI * 2;
      let dirX = Math.cos(ang);
      let dirY = Math.sin(ang);
      if (useHemisphere && dirX * nx + dirY * ny < 0) {
        dirX = -dirX;
        dirY = -dirY;
      }
      const sp = speedMin + Math.random() * speedMax;
      const life = lifeMin + Math.random() * lifeMax;
      this.debris.push(
        /** @type {import("./types.d.js").Debris} */
        {
          x: x + dirX * offset,
          y: y + dirY * offset,
          vx: burstBaseVx + dirX * sp,
          vy: burstBaseVy + dirY * sp,
          a: Math.random() * Math.PI * 2,
          w: (Math.random() - 0.5) * spin,
          life,
          maxLife: life,
          size,
          cr,
          cg,
          cb,
          alpha
        }
      );
    }
  }
  /**
   * @param {"shot"|"bomb"} kind
   * @param {number} x
   * @param {number} y
   * @param {number} [baseVx]
   * @param {number} [baseVy]
   * @param {{normalX?:number,normalY?:number}|null} [impact]
   * @returns {void}
   */
  _spawnWeaponImpactFragments(kind, x, y, baseVx = 0, baseVy = 0, impact = null) {
    if (kind === "bomb") {
      this._spawnDebrisBurst(x, y, {
        pieces: 12,
        speedMin: 0.95,
        speedMax: 1.95,
        lifeMin: 0.45,
        lifeMax: 0.45,
        offset: 0.12,
        spin: 8,
        baseVx: baseVx * 0.2,
        baseVy: baseVy * 0.2,
        size: 0.12,
        cr: 1,
        cg: 0.72,
        cb: 0.2,
        alpha: 0.95
      });
      return;
    }
    const normalX = impact && typeof impact.normalX === "number" ? impact.normalX : void 0;
    const normalY = impact && typeof impact.normalY === "number" ? impact.normalY : void 0;
    this._spawnDebrisBurst(
      x,
      y,
      /** @type {{
      *  pieces?:number,
      *  speedMin?:number,
      *  speedMax?:number,
      *  lifeMin?:number,
      *  lifeMax?:number,
      *  offset?:number,
      *  spin?:number,
      *  baseVx?:number,
      *  baseVy?:number,
      *  size?:number,
      *  cr?:number,
      *  cg?:number,
      *  cb?:number,
      *  alpha?:number,
      *  normalX?:number,
      *  normalY?:number,
      * }} */
      {
        pieces: 6,
        speedMin: 0.4,
        speedMax: 0.9,
        lifeMin: 0.22,
        lifeMax: 0.22,
        offset: 0.04,
        spin: 6,
        baseVx: baseVx * 0.15,
        baseVy: baseVy * 0.15,
        size: 0.07,
        cr: 0.96,
        cg: 0.96,
        cb: 0.96,
        alpha: 0.92,
        normalX,
        normalY
      }
    );
  }
  /**
   * @param {Miner} miner
   * @param {"shot"|"exploded"} mode
   * @param {{x?:number,y?:number,vx?:number,vy?:number}|null|undefined} [impact]
   * @returns {void}
   */
  _spawnFallenMiner(miner, mode, impact) {
    if (!miner) return;
    const r2 = Math.hypot(miner.x, miner.y) || 1;
    const upx = miner.x / r2;
    const upy = miner.y / r2;
    const tx = -upy;
    const ty = upx;
    if (mode === "exploded") {
      let dirX = miner.x - (impact && Number.isFinite(impact.x) ? Number(impact.x) : miner.x - upx * 0.1);
      let dirY = miner.y - (impact && Number.isFinite(impact.y) ? Number(impact.y) : miner.y - upy * 0.1);
      let dirLen = Math.hypot(dirX, dirY);
      if (dirLen <= 1e-4) {
        dirX = upx;
        dirY = upy;
        dirLen = 1;
      }
      dirX /= dirLen;
      dirY /= dirLen;
      const speed = this.MINER_EXPLOSION_DEATH_SPEED_MIN + Math.random() * (this.MINER_EXPLOSION_DEATH_SPEED_MAX - this.MINER_EXPLOSION_DEATH_SPEED_MIN);
      const life2 = this.MINER_EXPLOSION_DEATH_LIFE + Math.random() * 0.35;
      this.fallenMiners.push({
        x: miner.x,
        y: miner.y,
        vx: dirX * speed + (impact && impact.vx || 0) * 0.16,
        vy: dirY * speed + (impact && impact.vy || 0) * 0.16,
        life: life2,
        maxLife: life2,
        upx,
        upy,
        rot: Math.atan2(dirY, dirX),
        spin: (Math.random() < 0.5 ? -1 : 1) * (5.5 + Math.random() * 5.5),
        leanDir: Math.random() < 0.5 ? -1 : 1,
        type: miner.type,
        mode
      });
      this._playSfx("miner_down", { volume: 0.42, rate: 0.68 + Math.random() * 0.08 });
      return;
    }
    const tangential = (impact && impact.vx || 0) * tx + (impact && impact.vy || 0) * ty;
    const leanDir = tangential < -1e-4 ? -1 : tangential > 1e-4 ? 1 : Math.random() < 0.5 ? -1 : 1;
    let impactDirX = impact && Number.isFinite(impact.vx) ? Number(impact.vx) : 0;
    let impactDirY = impact && Number.isFinite(impact.vy) ? Number(impact.vy) : 0;
    let impactDirLen = Math.hypot(impactDirX, impactDirY);
    if (impactDirLen <= 1e-4 && impact && Number.isFinite(impact.x) && Number.isFinite(impact.y)) {
      impactDirX = miner.x - Number(impact.x);
      impactDirY = miner.y - Number(impact.y);
      impactDirLen = Math.hypot(impactDirX, impactDirY);
    }
    if (impactDirLen <= 1e-4) {
      impactDirX = tx * leanDir;
      impactDirY = ty * leanDir;
      impactDirLen = 1;
    }
    impactDirX /= impactDirLen;
    impactDirY /= impactDirLen;
    const hitPush = 0.07 + Math.random() * 0.06;
    const sidewaysSlide = 0.03 + Math.random() * 0.05;
    const life = this.MINER_SHOT_DEATH_LIFE + Math.random() * 0.25;
    this.fallenMiners.push({
      x: miner.x,
      y: miner.y,
      vx: impactDirX * hitPush + tx * leanDir * sidewaysSlide,
      vy: impactDirY * hitPush + ty * leanDir * sidewaysSlide,
      life,
      maxLife: life,
      upx,
      upy,
      rot: Math.atan2(upy, upx),
      spin: 0,
      leanDir,
      type: miner.type,
      mode
    });
    this._playSfx("miner_down", { volume: 0.35, rate: 0.78 + Math.random() * 0.08 });
  }
  /**
   * @param {number} index
   * @param {"shot"|"exploded"} mode
   * @param {{x?:number,y?:number,vx?:number,vy?:number}|null|undefined} [impact]
   * @returns {void}
   */
  _killMinerAt(index, mode, impact) {
    const miner = (
      /** @type {Miner|undefined} */
      this.miners[index]
    );
    if (!miner) return;
    this._spawnFallenMiner(miner, mode, impact);
    this.miners.splice(index, 1);
    this.minersRemaining = Math.max(0, this.minersRemaining - 1);
    this.minersDead++;
  }
  /**
   * @param {number} dt
   * @returns {void}
   */
  _updateFallenMiners(dt) {
    if (!this.fallenMiners.length) return;
    const drag = Math.max(0, 1 - this.planetParams.DRAG * 0.8 * dt);
    for (let i = this.fallenMiners.length - 1; i >= 0; i--) {
      const miner = this.fallenMiners[i];
      if (!miner) continue;
      if (miner.mode === "exploded") {
        const g = this.planet.gravityAt(miner.x, miner.y);
        miner.vx += g.x * dt;
        miner.vy += g.y * dt;
        miner.vx *= drag;
        miner.vy *= drag;
        miner.x += miner.vx * dt;
        miner.y += miner.vy * dt;
        miner.rot += miner.spin * dt;
      } else {
        miner.vx *= Math.max(0, 1 - 5 * dt);
        miner.vy *= Math.max(0, 1 - 5 * dt);
        miner.x += miner.vx * dt;
        miner.y += miner.vy * dt;
      }
      miner.life -= dt;
      if (miner.life <= 0) {
        this.fallenMiners.splice(i, 1);
      }
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
    const shotCooldown = Math.random();
    if (type === "hunter") {
      this.enemies.enemies.push({ type, x, y, vx: 0, vy: 0, hp: 3, shotCooldown, modeCooldown: 0, iNodeGoal: null });
    } else if (type === "ranger") {
      this.enemies.enemies.push({ type, x, y, vx: 0, vy: 0, hp: 2, shotCooldown, modeCooldown: 0, iNodeGoal: null });
    } else {
      const ang = Math.random() * Math.PI * 2;
      const speed = Math.min(3, this.level * 0.25 + 0.5);
      this.enemies.enemies.push({ type: "crawler", x, y, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, hp: 1, shotCooldown: 0, modeCooldown: 0, iNodeGoal: null });
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
    const spawnCooldown = this._factorySpawnCooldownRange();
    for (const p of factories) {
      p.spawnCd = typeof p.spawnCd === "number" && p.spawnCd > 0 ? p.spawnCd : spawnCooldown.min + Math.random() * (spawnCooldown.max - spawnCooldown.min);
      p.spawnT = typeof p.spawnT === "number" ? p.spawnT + dt : Math.random() * p.spawnCd;
      if (p.spawnT < p.spawnCd) continue;
      p.spawnT -= p.spawnCd;
      p.spawnCd = spawnCooldown.min + Math.random() * (spawnCooldown.max - spawnCooldown.min);
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
      if (typeof this.planet.reserveBarrenPadsForMiners === "function") {
        this.planet.reserveBarrenPadsForMiners(count, seed, GAME.MINER_MIN_SEP);
      }
      const reservedPads = [];
      for (const p of this.planet.props || []) {
        if (p.type !== "turret_pad" || p.dead || p.padReservedFor !== "miner") continue;
        reservedPads.push(p);
      }
      const normalizeAngle = (ang) => {
        let out = ang % (Math.PI * 2);
        if (out < 0) out += Math.PI * 2;
        return out;
      };
      reservedPads.sort((a, b) => {
        const ringA = typeof a.padRing === "number" ? a.padRing : Number.MAX_SAFE_INTEGER;
        const ringB = typeof b.padRing === "number" ? b.padRing : Number.MAX_SAFE_INTEGER;
        if (ringA !== ringB) return ringA - ringB;
        return normalizeAngle(Math.atan2(a.y, a.x)) - normalizeAngle(Math.atan2(b.y, b.x));
      });
      placed = reservedPads.slice(0, count).map((p) => [p.x, p.y]);
      if (placed.length < count) {
        console.error("[Level] miners spawn insufficient barren pads", {
          level: this.level,
          target: count,
          placed: placed.length,
          pads: reservedPads.length
        });
      }
    } else {
      const standable = this.planet.getStandablePoints();
      if (cfg && cfg.id === "molten") {
        const moltenOuter = this.planetParams.MOLTEN_RING_OUTER || 0;
        const minR = moltenOuter + 0.6;
        placed = this.planet.sampleStandablePoints(count, seed, "uniform", GAME.MINER_MIN_SEP, true, minR);
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
        let x = (
          /** @type {[number, number]} */
          p[0]
        );
        let y = (
          /** @type {[number, number]} */
          p[1]
        );
        const normal = this.planet.normalAtWorld(x, y);
        if (normal) {
          x += normal.nx * 0.02;
          y += normal.ny * 0.02;
        }
        nudged.push({ x, y, jumpCycle: Math.random(), type: minerType, state: "idle" });
      } else {
        const res = this.planet.nudgeOutOfTerrain(
          /** @type {[number, number]} */
          p[0],
          /** @type {[number, number]} */
          p[1]
        );
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
   * @param {number} [progressionSeedOverride]
   * @returns {PlanetConfig}
   */
  _planetConfigFromLevel(level, progressionSeedOverride) {
    const overrideSeed = progressionSeedOverride ?? Number.NaN;
    const progressionSeed = Number.isFinite(overrideSeed) ? overrideSeed : this.progressionSeed || CFG.seed;
    const progression = resolveLevelProgression(progressionSeed, level);
    const configOverride = progression ? progression.planetId : void 0;
    const planetConfig = configOverride !== void 0 ? pickPlanetConfigById(configOverride) : pickPlanetConfig(progressionSeed, level);
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
   * @param {import("./types.d.js").MapWorld|null} [mapWorld]
   * @returns {{seed:number, level:number, planetConfig:PlanetConfig, planetParams:import("./planet_config.js").PlanetParams, planet:Planet, objective:any, mothership:Mothership, collision:import("./types.d.js").CollisionQuery, enemies:Enemies}}
   */
  _buildLevelBundle(seed, level, mapWorld = null) {
    const planetConfig = this._planetConfigFromLevel(level, level === 1 ? seed | 0 : void 0);
    const planetParams = resolvePlanetParams(seed, level, planetConfig, GAME);
    const planet = new Planet({ seed, planetConfig, planetParams, mapWorld });
    this._prepareBarrenMinerPadReservations(planet, planetConfig, level);
    const mothership = new Mothership({ RMAX: planetParams.RMAX, MOTHERSHIP_ORBIT_HEIGHT: planetParams.MOTHERSHIP_ORBIT_HEIGHT }, planet);
    const collision = createCollisionRouter(planet, () => mothership);
    const enemies = new Enemies({
      planet,
      collision,
      total: this._enemyTotalForConfig(planetConfig, level),
      level,
      levelSeed: planet.getSeed(),
      placement: planetConfig.enemyPlacement || "random",
      onEnemyShot: () => {
        this._playSfx("enemy_fire", { volume: 0.55 });
        this._markCombatThreat();
        this._triggerCombatImmediate();
      },
      onEnemyDestroyed: (enemy, info) => {
        this._handleEnemyDestroyed(enemy, info);
      }
    });
    return {
      seed,
      level,
      planetConfig,
      planetParams,
      planet,
      objective: this._buildObjective(planetConfig, level),
      mothership,
      collision,
      enemies
    };
  }
  /**
   * @param {{seed:number, level:number, planetConfig:PlanetConfig, planetParams:import("./planet_config.js").PlanetParams, planet:Planet, objective:any, mothership:Mothership, collision:import("./types.d.js").CollisionQuery, enemies:Enemies}} bundle
   * @param {number} previousLevel
   * @returns {void}
   */
  _applyLevelBundle(bundle, previousLevel) {
    this.level = bundle.level;
    if (bundle.level === 1) {
      this.progressionSeed = bundle.seed | 0;
    }
    this.planet = bundle.planet;
    this.planetParams = bundle.planetParams;
    this.objective = bundle.objective;
    this.TERRAIN_MAX = this.planetParams.RMAX + this.TERRAIN_PAD;
    this.SURFACE_EPS = Math.max(0.12, this.planetParams.RMAX / 280);
    this.COLLISION_EPS = Math.max(0.18, this.planetParams.RMAX / 240);
    this.mothership = bundle.mothership;
    this.collision = bundle.collision;
    this.enemies = bundle.enemies;
    this.healthPickups = [];
    console.log("[Level] begin", {
      level: this.level,
      planetId: bundle.planetConfig.id,
      enemies: this._totalEnemiesForLevel(this.level),
      miners: this._targetMinersForLevel(),
      platformCount: bundle.planetConfig.platformCount,
      props: (this.planet.props || []).length
    });
    if (this.planet.props && this.planet.props.length) {
      console.log("[Level] props sample", this.planet.props.slice(0, 3).map((p) => ({ type: p.type, x: p.x, y: p.y, dead: !!p.dead })));
    }
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
    this.popups.length = 0;
    this.planet.clearFeatureParticles();
    if (this.level === 1) {
      this.hasLaunchedPlayerShip = false;
      this.newGameHelpPromptT = 0;
      this.newGameHelpPromptArmed = true;
      this._resetStartTitle();
      this.manualZoomActive = false;
      this.manualZoomMultiplier = 1;
      this.ship.mothershipMiners = 0;
      this.ship.mothershipPilots = 0;
      this.ship.mothershipEngineers = 0;
      this.ship.hpMax = GAME.SHIP_STARTING_MAX_HP;
      this.ship.hpCur = GAME.SHIP_STARTING_MAX_HP;
      this.ship.bombsMax = GAME.SHIP_STARTING_MAX_BOMBS;
      this.ship.bombsCur = GAME.SHIP_STARTING_MAX_BOMBS;
      this.ship.thrust = GAME.SHIP_STARTING_THRUST;
      this.ship.inertialDrive = GAME.SHIP_STARTING_INERTIAL_DRIVE;
      this.ship.gunPower = GAME.SHIP_STARTING_GUN_POWER;
      this.ship.rescueeDetector = false;
      this.ship.planetScanner = false;
      this.ship.bounceShots = false;
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
    if (previousLevel !== this.level) {
      this.levelAdvanceReady = false;
    }
  }
  /**
   * @param {number} seed
   * @param {number} level
   * @param {import("./types.d.js").MapWorld|null} [mapWorld]
   * @param {boolean} [keepTransition]
   * @returns {void}
   */
  _beginLevel(seed, level, mapWorld = null, keepTransition = false) {
    if (!keepTransition) {
      this.jumpdriveTransition.cancel();
    }
    const previousLevel = this.level;
    const bundle = this._buildLevelBundle(seed, level, mapWorld);
    this._applyLevelBundle(bundle, previousLevel);
  }
  /**
   * @param {number} seed
   * @param {number} level
   * @returns {void}
   */
  _startJumpdriveTransition(seed, level) {
    if (this.jumpdriveTransition.isActive()) return;
    this.manualZoomActive = false;
    this.manualZoomMultiplier = 1;
    this.planetView = false;
    this.levelAdvanceReady = false;
    this._setThrustLoopActive(false);
    const planetConfig = this._planetConfigFromLevel(level);
    const planetParams = resolvePlanetParams(seed, level, planetConfig, GAME);
    this.jumpdriveTransition.start({
      seed,
      level,
      planetConfig,
      planetParams,
      view: this._autoViewState(),
      mothership: this.mothership,
      ship: this.ship,
      currentPlanetRadius: this.planet ? this.planet.planetRadius : this.planetParams ? this.planetParams.RMAX : 0
    });
  }
  /**
   * Dev-only level jump that keeps map generation but skips the jumpdrive overlay.
   * @param {number} level
   * @returns {void}
   */
  _devJumpToLevel(level) {
    if (!this.planet) return;
    const targetLevel = Math.max(1, Math.floor(level));
    if (!Number.isFinite(targetLevel)) return;
    const reloadingCurrentLevel = targetLevel === this.level;
    const nextSeed = this.planet.getSeed() + 1;
    this.manualZoomActive = false;
    this.manualZoomMultiplier = 1;
    this.planetView = false;
    this.levelAdvanceReady = false;
    this._setThrustLoopActive(false);
    this._beginLevel(nextSeed, targetLevel);
    this._showStatusCue(reloadingCurrentLevel ? `Reloaded level ${targetLevel}` : `Jumped to level ${targetLevel}`);
  }
  /**
   * @returns {void}
   */
  _promptDevJumpToLevel() {
    if (typeof window === "undefined" || typeof window.prompt !== "function") return;
    const raw = window.prompt("Jump to level number", String(this.level));
    if (raw === null) return;
    const targetLevel = Number.parseInt(raw.trim(), 10);
    if (!Number.isFinite(targetLevel) || targetLevel < 1) {
      this._showStatusCue("Invalid level number");
      return;
    }
    this._devJumpToLevel(targetLevel);
  }
  /**
   * @returns {import("./types.d.js").MapWorld|null}
   */
  _currentMapWorldClone() {
    if (!this.planet || !this.planet.mapgen || typeof this.planet.mapgen.getWorld !== "function") return null;
    const world = this.planet.mapgen.getWorld();
    if (!world || !world.air) return null;
    return {
      seed: +world.seed || 0,
      air: new Uint8Array(world.air),
      entrances: Array.isArray(world.entrances) ? world.entrances.map((p) => [p[0], p[1]]) : [],
      finalAir: +world.finalAir || 0
    };
  }
  /**
   * @returns {void}
   */
  _startCurrentLevelJumpdriveIntro() {
    if (this.jumpdriveTransition.isActive() || !this.mothership || !this.planet) return;
    this.manualZoomActive = false;
    this.manualZoomMultiplier = 1;
    this.planetView = false;
    this.levelAdvanceReady = false;
    this._setThrustLoopActive(false);
    const planetConfig = this.planet.getPlanetConfig();
    const planetParams = this.planet.getPlanetParams();
    const mapWorld = this._currentMapWorldClone();
    if (!planetConfig || !planetParams || !mapWorld) return;
    this.jumpdriveTransition.start({
      seed: this.planet.getSeed(),
      level: this.level,
      planetConfig,
      planetParams,
      mapWorld,
      view: this._autoViewState(),
      mothership: this.mothership,
      ship: this.ship,
      currentPlanetRadius: this.planet.planetRadius
    });
  }
  /**
   * @param {number} seed
   * @returns {void}
   */
  _beginNewGameWithIntro(seed) {
    this._beginLevel(seed, 1);
    this._startCurrentLevelJumpdriveIntro();
  }
  /**
   * @param {Array<[number, number]>} points
   * @returns {number}
   */
  /**
   * Set an arbitrary local convex hull for ship collisions.
   * @param {Array<[number, number]>} localConvexHull
   * @param {number} [edgeSamplesPerEdge]
   * @returns {void}
   */
  setShipCollisionConvexHull(localConvexHull, edgeSamplesPerEdge = 1) {
    if (!Array.isArray(localConvexHull) || localConvexHull.length < 3) return;
    const clean = [];
    for (const p of localConvexHull) {
      if (!p || p.length < 2) continue;
      const x = Number(p[0]);
      const y = Number(p[1]);
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      clean.push([x, y]);
    }
    if (clean.length < 3) return;
    this.shipCollisionLocalConvexHull = clean;
    this.shipCollisionEdgeSamplesPerEdge = Math.max(0, edgeSamplesPerEdge | 0);
    this.shipCollisionConvexHullBoundRadius = computeDropshipConvexHullBoundRadius(clean);
  }
  /**
   * Back-compat wrapper.
   * @param {Array<[number, number]>} localConvexHull
   * @param {number} [edgeSamplesPerEdge]
   * @returns {void}
   */
  setShipCollisionHull(localConvexHull, edgeSamplesPerEdge = 1) {
    this.setShipCollisionConvexHull(localConvexHull, edgeSamplesPerEdge);
  }
  /**
   * @returns {Array<[number, number]>}
   */
  _shipCollisionLocalConvexHull() {
    if (Array.isArray(this.shipCollisionLocalConvexHull) && this.shipCollisionLocalConvexHull.length >= 3) {
      return this.shipCollisionLocalConvexHull;
    }
    return buildDropshipLocalConvexHullPoints(GAME);
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {Array<[number, number]>}
   */
  _shipConvexHullWorldVertices(x, y) {
    return buildDropshipWorldConvexHullVertices(this._shipCollisionLocalConvexHull(), x, y);
  }
  /**
   * Collision sample points from convex hull vertices, with originating convex-hull edge metadata.
   * Optional per-edge subdivisions increase persistent tracked collision points.
   * @param {number} x
   * @param {number} y
   * @returns {{points:Array<[number, number]>, edgeIdxByPoint:number[], pointMetaByPoint:Array<{kind:"vertex"|"edge",edgeIdx:number,vertexIdx:number,t:number}>}}
   */
  _shipConvexHullSampleSet(x, y) {
    return buildDropshipWorldConvexHullSampleSet(
      this._shipCollisionLocalConvexHull(),
      x,
      y,
      this.shipCollisionEdgeSamplesPerEdge,
      this.shipCollisionMaxSampleSpacing
    );
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {Array<[number, number]>}
   */
  _shipCollisionPoints(x, y) {
    return this._shipConvexHullSampleSet(x, y).points;
  }
  _shipCollisionExactCtx() {
    const shipConvexHullWorldVertices = (x, y) => this._shipConvexHullWorldVertices(x, y);
    return {
      planet: this.planet,
      mothership: this.mothership,
      collision: this.collision,
      collisionEps: this.COLLISION_EPS,
      shipRadius: () => this._shipRadius(),
      shipLocalConvexHull: () => this._shipCollisionLocalConvexHull(),
      shipConvexHullWorldVertices
    };
  }
  /**
   * Interpolate angle along the shortest arc.
   * @param {number} a
   * @param {number} b
   * @param {number} t
   * @returns {number}
   */
  _lerpAngleShortest(a, b, t) {
    return lerpAngleShortest$1(a, b, t);
  }
  /**
   * Swept collision against moving mothership using exact hull-vs-solid-tri overlap.
   * @param {number} shipX0
   * @param {number} shipY0
   * @param {number} shipX1
   * @param {number} shipY1
   * @param {number} shipRadius
   * @param {{x:number,y:number,angle:number}} mothershipPrev
   * @param {{x:number,y:number,angle:number}} mothershipCurr
   * @returns {{x:number,y:number,hit:import("./types.d.js").CollisionHit,hitSource:"mothership"}|null}
   */
  _sweptShipVsMovingMothership(shipX0, shipY0, shipX1, shipY1, shipRadius, mothershipPrev, mothershipCurr) {
    return sweptShipVsMovingMothership(
      this._shipCollisionExactCtx(),
      shipX0,
      shipY0,
      shipX1,
      shipY1,
      shipRadius,
      mothershipPrev
    );
  }
  /**
   * Nudge miners out of terrain after mode changes; kill if deeply buried.
   * @returns {void}
   */
  _nudgeMinersFromTerrain() {
    for (let i = this.miners.length - 1; i >= 0; i--) {
      const m = (
        /** @type {Miner} */
        this.miners[i]
      );
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
  _shipConvexHullDistance(px, py, shipX, shipY) {
    return pointDistanceToDropshipWorldConvexHull(
      this._shipCollisionLocalConvexHull(),
      px,
      py,
      shipX,
      shipY,
      this._shipRadius()
    );
  }
  /**
   * Conservative line-of-sight check against planet terrain for short miner
   * approach steps to a guide path attach point.
   * @param {number} x0
   * @param {number} y0
   * @param {number} x1
   * @param {number} y1
   * @param {number} [sidePad]
   * @returns {boolean}
   */
  _segmentPlanetAirClear(x0, y0, x1, y1, sidePad = 0.02) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.hypot(dx, dy);
    if (len < 1e-6) {
      return this.collision.planetAirValueAtWorld(x0, y0) > 0.5;
    }
    const tx = dx / len;
    const ty = dy / len;
    const nx = -ty;
    const ny = tx;
    const steps = Math.max(2, Math.min(24, Math.ceil(len / 0.06) + 1));
    for (let i = 0; i < steps; i++) {
      const t = steps <= 1 ? 1 : i / (steps - 1);
      const sx = x0 + dx * t;
      const sy = y0 + dy * t;
      if (this.collision.planetAirValueAtWorld(sx, sy) <= 0.5) return false;
      if (sidePad > 1e-6) {
        if (this.collision.planetAirValueAtWorld(sx + nx * sidePad, sy + ny * sidePad) <= 0.5) return false;
        if (this.collision.planetAirValueAtWorld(sx - nx * sidePad, sy - ny * sidePad) <= 0.5) return false;
      }
    }
    return true;
  }
  /**
   * Convert world point to ship-local coordinates where local X is ship-right
   * and local Y is ship-up (with ship orientation locked to planet tangent).
   * @param {number} px
   * @param {number} py
   * @param {number} shipX
   * @param {number} shipY
   * @returns {{x:number,y:number}}
   */
  _shipLocalPoint(px, py, shipX, shipY) {
    const camRot = -(Number.isFinite(this.ship.renderAngle) ? (
      /** @type {number} */
      this.ship.renderAngle
    ) : getDropshipWorldRotation(shipX, shipY));
    const shipRot = -camRot;
    const c = Math.cos(shipRot);
    const s = Math.sin(shipRot);
    const dx = px - shipX;
    const dy = py - shipY;
    return {
      x: c * dx + s * dy,
      y: -s * dx + c * dy
    };
  }
  /**
   * Convert ship-local coordinates to world coordinates.
   * Local X is ship-right and local Y is ship-up.
   * @param {number} lx
   * @param {number} ly
   * @param {number} shipX
   * @param {number} shipY
   * @returns {{x:number,y:number}}
   */
  _shipWorldPoint(lx, ly, shipX, shipY) {
    const camRot = -(Number.isFinite(this.ship.renderAngle) ? (
      /** @type {number} */
      this.ship.renderAngle
    ) : getDropshipWorldRotation(shipX, shipY));
    const shipRot = -camRot;
    const c = Math.cos(shipRot);
    const s = Math.sin(shipRot);
    return {
      x: shipX + c * lx - s * ly,
      y: shipY + s * lx + c * ly
    };
  }
  _shipRadius() {
    if (!(this.shipCollisionConvexHullBoundRadius > 0)) {
      this.shipCollisionConvexHullBoundRadius = computeDropshipConvexHullBoundRadius(this._shipCollisionLocalConvexHull());
    }
    return this.shipCollisionConvexHullBoundRadius;
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
    const hitPad = 0.02;
    const shipR = this._shipRadius() + hitPad;
    const broadR = shipR + Math.hypot(shot.vx, shot.vy) * dt + Math.hypot(this.ship.vx, this.ship.vy) * dt + 0.35;
    const dxBroad = shotX1 - shipX1;
    const dyBroad = shotY1 - shipY1;
    if (dxBroad * dxBroad + dyBroad * dyBroad > broadR * broadR) {
      return false;
    }
    const shotTravel = Math.hypot(shotX1 - shotX0, shotY1 - shotY0);
    const shipTravel = Math.hypot(shipX1 - shipX0, shipY1 - shipY0);
    const steps = Math.max(2, Math.min(20, Math.ceil((shotTravel + shipTravel) / 0.06) + 1));
    for (let i = 0; i < steps; i++) {
      const t = steps <= 1 ? 1 : i / (steps - 1);
      const px = shotX0 + (shotX1 - shotX0) * t;
      const py = shotY0 + (shotY1 - shotY0) * t;
      const sx = shipX0 + (shipX1 - shipX0) * t;
      const sy = shipY0 + (shipY1 - shipY0) * t;
      if (this._shipConvexHullDistance(px, py, sx, sy) <= hitPad) {
        return true;
      }
    }
    return false;
  }
  _shipGunPivotWorld() {
    const localPivot = getDropshipGunPivotLocal(GAME);
    const camRot = -(Number.isFinite(this.ship.renderAngle) ? (
      /** @type {number} */
      this.ship.renderAngle
    ) : getDropshipWorldRotation(this.ship.x, this.ship.y));
    const shipRot = -camRot;
    const c = Math.cos(shipRot), s = Math.sin(shipRot);
    const wx = c * localPivot.x - s * localPivot.y;
    const wy = s * localPivot.x + c * localPivot.y;
    return { x: this.ship.x + wx, y: this.ship.y + wy };
  }
  /**
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  _shipCollidesAt(x, y) {
    return !!this._shipCollisionExactAt(x, y);
  }
  /**
   * Mothership-only overlap check at ship pose.
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  _shipCollidesWithMothershipAt(x, y) {
    return !!this._shipMothershipCollisionExactWithPose(x, y, this.mothership);
  }
  /**
   * Exact hull-vs-planet-rock overlap at pose.
   * @param {number} x
   * @param {number} y
   * @returns {import("./types.d.js").CollisionHit|null}
   */
  _shipPlanetCollisionExact(x, y) {
    return findPlanetCollisionExactAt(this._shipCollisionExactCtx(), x, y);
  }
  /**
   * Exact hull-vs-mothership-solid overlap at pose.
   * @param {number} x
   * @param {number} y
   * @param {Pick<import("./mothership.js").Mothership, "x"|"y"|"angle"|"bounds"|"points"|"tris"|"triAir">|null|undefined} mothershipPose
   * @returns {import("./types.d.js").CollisionHit|null}
   */
  _shipMothershipCollisionExactWithPose(x, y, mothershipPose) {
    return findMothershipCollisionExactAtPose(this._shipCollisionExactCtx(), x, y, mothershipPose);
  }
  /**
   * Exact ship overlap at pose.
   * @param {number} x
   * @param {number} y
   * @returns {{hit:import("./types.d.js").CollisionHit, hitSource:"planet"|"mothership"}|null}
   */
  _shipCollisionExactAt(x, y) {
    return findCollisionExactAt(this._shipCollisionExactCtx(), x, y);
  }
  /**
   * Continuous sweep using exact hull overlap checks.
   * @param {number} x0
   * @param {number} y0
   * @param {number} x1
   * @param {number} y1
   * @param {number} stepLen
   * @param {number} maxSteps
   * @returns {{x:number,y:number,hit:import("./types.d.js").CollisionHit,hitSource:"planet"|"mothership"}|null}
   */
  _firstShipCollisionOnSegmentExact(x0, y0, x1, y1, stepLen, maxSteps) {
    return findFirstCollisionOnSegmentExact(this._shipCollisionExactCtx(), x0, y0, x1, y1, stepLen, maxSteps);
  }
  /**
   * Hard post-collision depenetration against planet terrain.
   * Prevents sustained control input from nudging the ship through rock.
   * @param {number} [maxIters]
   * @returns {void}
   */
  _stabilizeShipAgainstPlanetPenetration(maxIters = 12) {
    stabilizePlanetPenetration({
      ship: this.ship,
      collision: this.collision,
      planet: this.planet,
      collisionEps: this.COLLISION_EPS,
      shipCollisionPointsAt: (x, y) => this._shipCollisionPoints(x, y),
      shipRadius: () => this._shipRadius()
    }, maxIters);
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
    if (this.jumpdriveTransition.isActive()) {
      this._setThrustLoopActive(false);
      this.jumpdriveTransition.update(dt);
      const preparedLevel = this.jumpdriveTransition.consumePreparedLevel();
      if (preparedLevel) {
        this._beginLevel(preparedLevel.seed, preparedLevel.level, preparedLevel.mapWorld, true);
        this.jumpdriveTransition.applyPreparedLevel({
          mothership: this.mothership,
          view: this._autoViewState()
        });
        this.planet.primeRenderFog(this.renderer, this.ship.x, this.ship.y);
      }
      return;
    }
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
          this._beginNewGameWithIntro(nextSeed);
        }
      } else if (this._isDockedWithMothership()) {
        if (this.pendingPerkChoice === null && this.ship.mothershipEngineers > 0) {
          this._presentNextPerkChoice();
        } else if (this.levelAdvanceReady) {
          const nextSeed = this.planet.getSeed() + 1;
          this._startJumpdriveTransition(nextSeed, this.level + 1);
        } else if (this.ship.planetScanner) {
          this.planetView = !this.planetView;
        }
      } else {
        this._resetShip();
        return;
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
    if (this._isDockedWithMothership()) {
      left = false;
      right = false;
      stickThrust.x = 0;
      if (stickThrust.y < 0.25) {
        stickThrust.y = 0;
      }
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
    let mothershipPrevPose = null;
    let mothershipAngularVel = 0;
    if (this.mothership) {
      mothershipPrevPose = {
        x: this.mothership.x,
        y: this.mothership.y,
        angle: this.mothership.angle
      };
      updateMothership(this.mothership, this.planet, dt);
      let da = this.mothership.angle - mothershipPrevPose.angle;
      while (da > Math.PI) da -= Math.PI * 2;
      while (da < -Math.PI) da += Math.PI * 2;
      mothershipAngularVel = da / Math.max(1e-6, dt);
    }
    if (spawnEnemyType) {
      const map = {
        "1": "hunter",
        "2": "ranger",
        "3": "crawler",
        "4": "turret",
        "5": "orbitingTurret"
      };
      const type = spawnEnemyType in map ? map[
        /** @type {"1"|"2"|"3"|"4"|"5"} */
        spawnEnemyType
      ] : (
        /** @type {import("./types.d.js").EnemyType} */
        spawnEnemyType
      );
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
        const shipRadius2 = this._shipRadius();
        const pushStep = shipRadius2 * 0.35;
        for (let i = 0; i < 8 && this._shipCollidesAt(this.ship.x, this.ship.y); i++) {
          const info2 = mothershipCollisionInfo(this.mothership, this.ship.x, this.ship.y);
          if (!info2) break;
          this.ship.x += info2.nx * pushStep;
          this.ship.y += info2.ny * pushStep;
        }
        const info = mothershipCollisionInfo(this.mothership, this.ship.x, this.ship.y);
        if (info) {
          const lift = shipRadius2 * 0.25;
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
        this.ship._shipRadius = this._shipRadius();
        this.ship._samples = sampleBodyCollisionAt(
          this.collision,
          (px, py) => this._shipCollisionPoints(px, py),
          this.ship.x,
          this.ship.y,
          false
        ).samples;
        this.lastAimWorld = null;
        this.lastAimScreen = null;
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
      this.ship.cabinSide = resolveDropshipFacing(this.ship.cabinSide || 1, {
        left,
        right,
        stickThrust
      });
      this._setThrustLoopActive(hasDropshipThrustInput({
        left,
        right,
        thrust,
        down,
        stickThrust
      }));
      const isWaterWorld = !!(planetCfg && planetCfg.id === "water");
      const outerRingR = this.planet && this.planet.radial && this.planet.radial.rings && this.planet.radial.rings.length ? this.planet.radial.rings.length - 1 : Math.floor(this.planetParams.RMAX || 0);
      const thrustMax = this.planetParams.THRUST * (1 + this.ship.thrust * 0.1);
      const inertialDriveThrust = GAME.INERTIAL_DRIVE_THRUST * (1 + this.ship.inertialDrive * 0.1);
      const thrustAccel = computeDropshipAcceleration(this.ship, { left, right, thrust, down, stickThrust }, thrustMax);
      let ax = thrustAccel.ax;
      let ay = thrustAccel.ay;
      const inertialDriveAccel = computeDropshipInertialDriveAcceleration(
        this.ship,
        { left, right, thrust, down, stickThrust },
        inertialDriveThrust,
        GAME.INERTIAL_DRIVE_REVERSE_FRACTION,
        GAME.INERTIAL_DRIVE_LATERAL_FRACTION,
        dt
      );
      ax += inertialDriveAccel.ax;
      ay += inertialDriveAccel.ay;
      const { r: r2, rx, ry } = thrustAccel;
      const waterR = isWaterWorld ? Math.max(0, outerRingR) : 0;
      const shipInWaterBefore = !!(isWaterWorld && waterR > 0 && r2 <= waterR + 0.02 && this.planet.airValueAtWorld(this.ship.x, this.ship.y) > 0.5);
      if (isWaterWorld && shipInWaterBefore) {
        let buoyancy = Math.max(0, this.planetParams.SURFACE_G * 0.45);
        buoyancy = Math.max(buoyancy, this.planetParams.SURFACE_G * 0.95);
        ax += rx * buoyancy;
        ay += ry * buoyancy;
      }
      const prevShipX = this.ship.x;
      const prevShipY = this.ship.y;
      const { x: gx, y: gy } = this.planet.gravityAt(this.ship.x, this.ship.y);
      this.ship.x += (this.ship.vx + 0.5 * (ax + gx) * dt) * dt;
      this.ship.y += (this.ship.vy + 0.5 * (ay + gy) * dt) * dt;
      const { x: gx2, y: gy2 } = this.planet.gravityAt(this.ship.x, this.ship.y);
      this.ship.vx += (ax + (gx + gx2) / 2) * dt;
      this.ship.vy += (ay + (gy + gy2) / 2) * dt;
      const shipWaterSpeed = Math.hypot(this.ship.vx, this.ship.vy);
      let shipInWaterNow = false;
      if (isWaterWorld) {
        const rNow = Math.hypot(this.ship.x, this.ship.y) || 1;
        shipInWaterNow = !!(waterR > 0 && rNow <= waterR + 0.02 && this.planet.airValueAtWorld(this.ship.x, this.ship.y) > 0.5);
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
      if (!shipInWaterNow) {
        const atmosphereDensity = sampleAtmosphereDensity(this.planet, this.planetParams, outerRingR, this.ship.x, this.ship.y);
        if (atmosphereDensity > 0) {
          const dragOut = applyQuadraticVelocityDrag(
            this.ship.vx,
            this.ship.vy,
            this.planetParams.ATMOSPHERE_DRAG * atmosphereDensity,
            dt
          );
          this.ship.vx = dragOut.vx;
          this.ship.vy = dragOut.vy;
        }
      }
      const eps = this.COLLISION_EPS;
      const shipRadius2 = this._shipRadius();
      const attemptedShipX = this.ship.x;
      const attemptedShipY = this.ship.y;
      const travelDist = Math.hypot(attemptedShipX - prevShipX, attemptedShipY - prevShipY);
      const sweepStep = Math.max(0.03, Math.min(0.05, shipRadius2 * 0.2));
      const sweepMaxSteps = Math.max(18, Math.min(96, Math.ceil(travelDist / sweepStep) + 2));
      this.ship._landingDebug = null;
      let sweptHit = this._firstShipCollisionOnSegmentExact(
        prevShipX,
        prevShipY,
        this.ship.x,
        this.ship.y,
        sweepStep,
        sweepMaxSteps
      );
      if (!sweptHit && this.mothership && mothershipPrevPose) {
        const mothershipCurrPose = {
          x: this.mothership.x,
          y: this.mothership.y,
          angle: this.mothership.angle
        };
        sweptHit = this._sweptShipVsMovingMothership(
          prevShipX,
          prevShipY,
          this.ship.x,
          this.ship.y,
          shipRadius2,
          mothershipPrevPose,
          mothershipCurrPose
        );
      }
      let samples;
      let hit;
      let hitSource;
      if (sweptHit) {
        this.ship.x = sweptHit.x;
        this.ship.y = sweptHit.y;
        samples = sampleBodyCollisionAt(
          this.collision,
          (px, py) => this._shipCollisionPoints(px, py),
          this.ship.x,
          this.ship.y,
          false
        ).samples;
        hit = sweptHit.hit;
        hitSource = sweptHit.hitSource;
      } else {
        ({ samples, hit, hitSource } = sampleBodyCollisionAt(
          this.collision,
          (px, py) => this._shipCollisionPoints(px, py),
          this.ship.x,
          this.ship.y,
          false
        ));
      }
      const collides = !!hit;
      this.ship._samples = samples;
      this.ship._shipRadius = shipRadius2;
      if (hit) {
        const hitTri = hitSource === "planet" ? hit.tri || this.planet.radial.findTriAtWorld(hit.x, hit.y) : null;
        const collisionHit = {
          x: hit.x,
          y: hit.y,
          tri: hitTri,
          node: hitSource === "planet" ? this.planet.radial.nearestNodeOnRing(hit.x, hit.y) : null,
          contacts: Array.isArray(hit.contacts) ? hit.contacts : null
        };
        if (hitSource) {
          collisionHit.source = hitSource;
        }
        this.ship._collision = collisionHit;
      } else {
        this.ship._collision = null;
      }
      if (collides) {
        const prevCollider = this._shipConvexHullSampleSet(prevShipX, prevShipY);
        const currCollider = this._shipConvexHullSampleSet(attemptedShipX, attemptedShipY);
        resolveCollisionResponse({
          ship: this.ship,
          collision: this.collision,
          planet: this.planet,
          mothership: this.mothership,
          planetParams: this.planetParams,
          game: GAME,
          dt,
          eps,
          debugEnabled: this.devHudVisible,
          shipRadius: shipRadius2,
          shipCollidesAt: (x, y) => this._shipCollidesAt(x, y),
          shipCollidesMothershipAt: (x, y) => this._shipCollidesWithMothershipAt(x, y),
          shipLocalConvexHull: this._shipCollisionLocalConvexHull(),
          shipCollisionPointsAt: (x, y) => this._shipCollisionPoints(x, y),
          shipStartX: prevShipX,
          shipStartY: prevShipY,
          shipEndX: attemptedShipX,
          shipEndY: attemptedShipY,
          mothershipAngularVel,
          mothershipPrevPose,
          prevPoints: prevCollider.points,
          currPoints: currCollider.points,
          onCrash: () => this._triggerCrash(),
          isDockedWithMothership: () => this._isDockedWithMothership(),
          onSuccessfullyDocked: () => this._onSuccessfullyDocked()
        });
      }
    }
    if (this.ship.state !== "crashed" && this.ship._collision && this.ship._collision.source === "planet") {
      this._stabilizeShipAgainstPlanetPenetration(10);
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
    if (!this._isDockedWithMothership()) {
      this.lastAimWorld = aimWorld;
      if (aim) this.lastAimScreen = aim;
    }
    if (this.ship.state === "crashed") {
      this.ship.guidePath = null;
    } else {
      const tryGuidePath = (px, py) => {
        const gp = this.planet.surfaceGuidePathTo(px, py, GAME.MINER_CALL_RADIUS);
        if (!gp || !gp.path || gp.path.length < 1) {
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
      const guidePathUsable2 = (gp) => !!(gp && gp.path && gp.path.length > 1 && Number.isFinite(gp.indexClosest));
      let guideAnchorX = this.ship.x;
      let guideAnchorY = this.ship.y;
      const shipContact = this.ship._collision;
      if (this.ship.state === "landed" && shipContact && shipContact.source === "planet") {
        let anchorBest = { x: shipContact.x, y: shipContact.y };
        let rBest = Math.hypot(anchorBest.x, anchorBest.y);
        const samples = this.ship._samples;
        if (samples && samples.length) {
          for (const s of samples) {
            if (!s || s.length < 3) continue;
            const sx = s[0];
            const sy = s[1];
            const isAir2 = !!s[2];
            if (isAir2) continue;
            if (this.collision.planetAirValueAtWorld(sx, sy) > 0.5) continue;
            const rs = Math.hypot(sx, sy);
            if (rs > rBest) {
              rBest = rs;
              anchorBest = { x: sx, y: sy };
            }
          }
        }
        guideAnchorX = anchorBest.x;
        guideAnchorY = anchorBest.y;
      }
      let guidePath2 = tryGuidePath(guideAnchorX, guideAnchorY);
      if (!guidePathUsable2(guidePath2) && this.ship.state === "landed") {
        const normal = this.planet.normalAtWorld(guideAnchorX, guideAnchorY);
        if (normal) {
          const tx = -normal.ny;
          const ty = normal.nx;
          const nx = normal.nx;
          const ny = normal.ny;
          const probes = [
            [tx * 0.3, ty * 0.3],
            [-tx * 0.3, -ty * 0.3],
            [tx * 0.6, ty * 0.6],
            [-tx * 0.6, -ty * 0.6],
            [nx * 0.18, ny * 0.18],
            [-nx * 0.18, -ny * 0.18]
          ];
          for (let i = 0; i < probes.length && !guidePathUsable2(guidePath2); i++) {
            const p = (
              /** @type {[number, number]} */
              probes[i]
            );
            guidePath2 = tryGuidePath(guideAnchorX + p[0], guideAnchorY + p[1]);
          }
        }
        if (!guidePathUsable2(guidePath2)) {
          const ringOffsets = [0.35, 0.65];
          for (let i = 0; i < ringOffsets.length && !guidePathUsable2(guidePath2); i++) {
            const r2 = (
              /** @type {number} */
              ringOffsets[i]
            );
            for (let a = 0; a < 8 && !guidePathUsable2(guidePath2); a++) {
              const ang = Math.PI * 2 * a / 8;
              guidePath2 = tryGuidePath(guideAnchorX + Math.cos(ang) * r2, guideAnchorY + Math.sin(ang) * r2);
            }
          }
        }
        if (!guidePathUsable2(guidePath2)) {
          const posClosest = this.planet.posClosest(guideAnchorX, guideAnchorY);
          if (posClosest && Number.isFinite(posClosest.x) && Number.isFinite(posClosest.y)) {
            guidePath2 = { path: [{ x: posClosest.x, y: posClosest.y }], indexClosest: 0 };
          }
        }
      }
      this.ship.guidePath = guidePath2;
    }
    this._resolveShipSolidPropCollisions();
    if (this.ship.state !== "crashed" && !this._isDockedWithMothership()) {
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
          const { vx, vy } = muzzleVelocity(dirx, diry, this.ship.vx, this.ship.vy, this.PLAYER_SHOT_SPEED);
          this.playerShots.push({
            x: gunOrigin.x + dirx * 0.45,
            y: gunOrigin.y + diry * 0.45,
            vx,
            vy,
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
          const { vx, vy } = muzzleVelocity(dirx, diry, this.ship.vx, this.ship.vy, this.PLAYER_BOMB_SPEED);
          --this.ship.bombsCur;
          this.playerBombs.push({
            x: gunOrigin.x + dirx * 0.45,
            y: gunOrigin.y + diry * 0.45,
            vx,
            vy,
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
      const shipRadius2 = this._shipRadius();
      this.planet.handleFeatureContact(this.ship.x, this.ship.y, shipRadius2, dt, this.featureCallbacks);
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
      onEnemyStun: this.featureCallbacks.onEnemyStun,
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
    for (let i = this.playerShots.length - 1; i >= 0; i--) {
      const s = (
        /** @type {import("./types.d.js").Shot} */
        this.playerShots[i]
      );
      const prevX = s.x;
      const prevY = s.y;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt;
      if (s.life <= 0) {
        this.playerShots.splice(i, 1);
        continue;
      }
      if (this.planet.handleFeatureShot(s.x, s.y, this.PLAYER_SHOT_RADIUS, this.featureCallbacks)) {
        this._spawnWeaponImpactFragments("shot", s.x, s.y, s.vx, s.vy);
        this.playerShots.splice(i, 1);
        continue;
      }
      if (this.collision.airValueAtWorld(s.x, s.y) <= 0.5) {
        const crossing = this.planet.terrainCrossing(
          { x: prevX, y: prevY },
          { x: s.x, y: s.y }
        );
        if (this.ship.bounceShots) {
          if (crossing) {
            const { nx, ny } = crossing;
            const vNormal = nx * s.vx + ny * s.vy;
            if (vNormal < 0) {
              s.x = prevX;
              s.y = prevY;
              s.vx -= 2 * vNormal * nx;
              s.vy -= 2 * vNormal * ny;
              continue;
            }
          }
        }
        const impactX = crossing ? crossing.x + crossing.nx * 0.02 : s.x;
        const impactY = crossing ? crossing.y + crossing.ny * 0.02 : s.y;
        this._spawnWeaponImpactFragments(
          "shot",
          impactX,
          impactY,
          s.vx,
          s.vy,
          crossing ? { normalX: crossing.nx, normalY: crossing.ny } : null
        );
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
          this._spawnWeaponImpactFragments("shot", s.x, s.y, s.vx, s.vy);
          this.playerShots.splice(i, 1);
          continue;
        }
        if (this._damageFactoryPropsAt(mechFactories, s.x, s.y, this.PLAYER_SHOT_RADIUS, 1, false)) {
          this._spawnWeaponImpactFragments("shot", s.x, s.y, s.vx, s.vy);
          this.playerShots.splice(i, 1);
          continue;
        }
      }
      for (let j = this.enemies.enemies.length - 1; j >= 0; j--) {
        const e = (
          /** @type {import("./types.d.js").Enemy} */
          this.enemies.enemies[j]
        );
        if (e.hp <= 0) continue;
        const dx = e.x - s.x;
        const dy = e.y - s.y;
        if (dx * dx + dy * dy <= this.PLAYER_SHOT_RADIUS * this.PLAYER_SHOT_RADIUS) {
          e.hp -= this.ship.gunPower;
          if (e.hp > 0) {
            this._applyEnemyHitFeedback(e);
          }
          this._spawnWeaponImpactFragments("shot", s.x, s.y, s.vx, s.vy);
          this.playerShots.splice(i, 1);
          if (e.hp <= 0) {
            e.hp = 0;
            this.enemies.markEnemyDestroyedBy(e, "bullet");
          }
          break;
        }
      }
      if (i >= this.playerShots.length) continue;
      for (let j = this.miners.length - 1; j >= 0; j--) {
        const m = (
          /** @type {Miner} */
          this.miners[j]
        );
        const dx = m.x - s.x;
        const dy = m.y - s.y;
        if (dx * dx + dy * dy <= this.PLAYER_SHOT_RADIUS * this.PLAYER_SHOT_RADIUS) {
          this._spawnWeaponImpactFragments("shot", s.x, s.y, s.vx, s.vy);
          this._killMinerAt(j, "shot", { x: s.x, y: s.y, vx: s.vx, vy: s.vy });
          this.playerShots.splice(i, 1);
          break;
        }
      }
    }
    if (this.playerBombs.length) {
      for (let i = this.playerBombs.length - 1; i >= 0; i--) {
        const b = (
          /** @type {{x:number,y:number,vx:number,vy:number,life:number}} */
          this.playerBombs[i]
        );
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.life -= dt;
        let hit = false;
        if (b.life <= 0) {
          hit = true;
        } else {
          const sample = this.collision.sampleAtWorld(b.x, b.y);
          if (sample.air <= 0.5) {
            hit = true;
            sample.source;
          }
        }
        if (!hit) {
          if (mechanizedLevel && mechBombBlockers) {
            for (const p of mechBombBlockers) {
              if (p.dead) continue;
              if (this._solidPropPenetration(p, b.x, b.y, this.PLAYER_BOMB_RADIUS * 0.8)) {
                hit = true;
                break;
              }
            }
          }
        }
        if (!hit) {
          for (let j = this.enemies.enemies.length - 1; j >= 0; j--) {
            const e = (
              /** @type {import("./types.d.js").Enemy} */
              this.enemies.enemies[j]
            );
            const dx = e.x - b.x;
            const dy = e.y - b.y;
            if (dx * dx + dy * dy <= this.PLAYER_BOMB_RADIUS * this.PLAYER_BOMB_RADIUS) {
              e.hp = 0;
              this.enemies.markEnemyDestroyedBy(e, "bomb");
              hit = true;
              break;
            }
          }
          if (!hit) {
            for (let j = this.miners.length - 1; j >= 0; j--) {
              const m = (
                /** @type {Miner} */
                this.miners[j]
              );
              const dx = m.x - b.x;
              const dy = m.y - b.y;
              if (dx * dx + dy * dy <= this.PLAYER_BOMB_RADIUS * this.PLAYER_BOMB_RADIUS) {
                this._killMinerAt(j, "exploded", { x: b.x, y: b.y, vx: b.vx, vy: b.vy });
                hit = true;
                break;
              }
            }
          }
        }
        if (hit) {
          this.playerBombs.splice(i, 1);
          this._spawnWeaponImpactFragments("bomb", b.x, b.y, b.vx, b.vy);
          this._applyBombImpact(b.x, b.y);
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
        const explosion = (
          /** @type {import("./types.d.js").Explosion} */
          this.entityExplosions[i]
        );
        explosion.life -= dt;
        if (explosion.life <= 0) this.entityExplosions.splice(i, 1);
      }
    }
    for (let i = this.healthPickups.length - 1; i >= 0; i--) {
      const pickup = (
        /** @type {HealthPickup} */
        this.healthPickups[i]
      );
      if (Math.hypot(pickup.x - this.ship.x, pickup.y - this.ship.y) < GAME.SHIP_SCALE) {
        const prevHp = this.ship.hpCur;
        this.ship.hpCur = Math.min(this.ship.hpMax, this.ship.hpCur + 1);
        if (this.ship.hpCur > prevHp) {
          const r2 = Math.hypot(pickup.x, pickup.y) || 1;
          const upx = pickup.x / r2;
          const upy = pickup.y / r2;
          const tx = -upy;
          const ty = upx;
          const jitter = (Math.random() * 2 - 1) * GAME.MINER_POPUP_TANGENTIAL;
          this.popups.push({
            x: pickup.x + upx * 0.1,
            y: pickup.y + upy * 0.1,
            vx: upx * GAME.MINER_POPUP_SPEED + tx * jitter,
            vy: upy * GAME.MINER_POPUP_SPEED + ty * jitter,
            text: "+1 hull",
            life: GAME.MINER_POPUP_LIFE
          });
          this._playSfx("miner_rescued", {
            volume: 0.45,
            rate: 0.95 + Math.random() * 0.1
          });
        }
        this.healthPickups.splice(i, 1);
      } else {
        pickup.life -= dt;
        if (pickup.life <= 0) this.healthPickups.splice(i, 1);
      }
    }
    const guidepathMargin = Math.max(0.15, GAME.MINER_GUIDE_ATTACH_RADIUS || 0.75);
    const guidepathAttachTolerance = 0.12;
    const attachDist = guidepathMargin + guidepathAttachTolerance;
    const guidePath = this.ship.guidePath;
    const guidePathUsable = !!(guidePath && guidePath.path && guidePath.path.length > 1 && Number.isFinite(guidePath.indexClosest));
    let debugMinerPathToMiner = null;
    let debugMinerPathScore = Infinity;
    const minerPathDebugEnabled = this.debugMinerGuidePath;
    if (this._minerPathDebugCooldown > 0) {
      this._minerPathDebugCooldown = Math.max(0, this._minerPathDebugCooldown - dt);
    }
    let minerPathDebugRecord = null;
    const pathRaiseAmount = 0.02;
    const boardTargetLocalY = GAME.SHIP_SCALE * 0.12;
    const landed = this.ship.state === "landed";
    const shipRadius = this._shipRadius();
    const boardTarget = landed ? this._shipWorldPoint(0, boardTargetLocalY, this.ship.x, this.ship.y) : null;
    const directBoardRange = shipRadius + Math.max(0.28, (GAME.MINER_GUIDE_ATTACH_RADIUS || 0) * 0.3);
    const guidePathIndexShip = landed && guidePathUsable ? findGuidePathTargetIndex(guidePath, this.ship.x, this.ship.y) : null;
    for (let i = this.miners.length - 1; i >= 0; i--) {
      const miner = (
        /** @type {Miner} */
        this.miners[i]
      );
      const prevMinerX = miner.x;
      const prevMinerY = miner.y;
      let indexPathMiner = null;
      let attachDebug = null;
      if (landed && guidePathUsable) {
        const rMiner = Math.hypot(miner.x, miner.y);
        attachDebug = minerPathDebugEnabled ? {} : null;
        indexPathMiner = findMinerGuideAttachIndex(guidePath.path, attachDist, miner.x, miner.y, rMiner, attachDebug);
        if (indexPathMiner !== null) {
          const targetForDebug = guidePathIndexShip !== null ? guidePathIndexShip : guidePath.indexClosest;
          const score = Math.abs(indexPathMiner - targetForDebug);
          if (score < debugMinerPathScore) {
            debugMinerPathScore = score;
            debugMinerPathToMiner = extractPathSegment(guidePath.path, targetForDebug, indexPathMiner);
          }
        }
      }
      miner.state = indexPathMiner !== null ? "running" : "idle";
      const indexPathMinerInitial = indexPathMiner;
      let indexPathTarget = null;
      let distMax = 0;
      let dAttach = null;
      let attachSnap = Math.max(0.03, guidepathAttachTolerance);
      let attachBlocked = false;
      const r2 = Math.hypot(miner.x, miner.y) || 1;
      miner.jumpCycle += 1.5 * dt * r2 / this.planet.planetRadius;
      miner.jumpCycle -= Math.floor(miner.jumpCycle);
      if (miner.state === "running") {
        const activeGuidePath = (
          /** @type {NonNullable<typeof guidePath>} */
          guidePath
        );
        indexPathTarget = guidePathIndexShip !== null ? guidePathIndexShip : activeGuidePath.indexClosest;
        distMax = (landed ? GAME.MINER_RUN_SPEED : GAME.MINER_JOG_SPEED) * dt;
        const posAttach = posFromPathIndex(
          activeGuidePath.path,
          /** @type {number} */
          indexPathMiner
        );
        const dxAttach = posAttach.x - miner.x;
        const dyAttach = posAttach.y - miner.y;
        dAttach = Math.hypot(dxAttach, dyAttach);
        if (dAttach > attachSnap) {
          attachBlocked = !this._segmentPlanetAirClear(miner.x, miner.y, posAttach.x, posAttach.y, 0.02);
        }
        if (attachBlocked) {
          miner.state = "idle";
          indexPathMiner = null;
        } else if (dAttach > attachSnap) {
          const step = Math.min(distMax, dAttach);
          miner.x += dxAttach / dAttach * step;
          miner.y += dyAttach / dAttach * step;
        } else {
          const atBoardingSegment = Math.abs(
            /** @type {number} */
            indexPathMiner - /** @type {number} */
            indexPathTarget
          ) <= 0.08;
          if (!atBoardingSegment && /** @type {number} */
          indexPathMiner < /** @type {number} */
          indexPathTarget) {
            indexPathMiner = moveAlongPathPositive(
              activeGuidePath.path,
              /** @type {number} */
              indexPathMiner,
              distMax,
              /** @type {number} */
              indexPathTarget
            );
          } else if (!atBoardingSegment && /** @type {number} */
          indexPathMiner > /** @type {number} */
          indexPathTarget) {
            indexPathMiner = moveAlongPathNegative(
              activeGuidePath.path,
              /** @type {number} */
              indexPathMiner,
              distMax,
              /** @type {number} */
              indexPathTarget
            );
            console.assert(indexPathMiner >= 0);
          }
          if (!atBoardingSegment) {
            const posNew = posFromPathIndex(
              activeGuidePath.path,
              /** @type {number} */
              indexPathMiner
            );
            const rNew = Math.hypot(posNew.x, posNew.y);
            const scalePos = 1 + pathRaiseAmount / rNew;
            miner.x = posNew.x * scalePos;
            miner.y = posNew.y * scalePos;
          }
          if (atBoardingSegment) {
            const boardTargetNow = (
              /** @type {{x:number,y:number}} */
              boardTarget
            );
            const dxShip = boardTargetNow.x - miner.x;
            const dyShip = boardTargetNow.y - miner.y;
            const dShip = Math.hypot(dxShip, dyShip);
            if (dShip > 1e-5) {
              const stepShip = Math.min(distMax, dShip);
              miner.x += dxShip / dShip * stepShip;
              miner.y += dyShip / dShip * stepShip;
            }
          }
        }
      }
      if (landed && miner.state !== "running" && boardTarget) {
        const bodyHullDist = this._shipConvexHullDistance(miner.x, miner.y, this.ship.x, this.ship.y);
        const centerDistDirect = Math.hypot(miner.x - this.ship.x, miner.y - this.ship.y);
        const nearShipForDirectBoard = centerDistDirect <= directBoardRange || bodyHullDist <= Math.max(0.18, GAME.MINER_BOARD_RADIUS * 2.5);
        if (nearShipForDirectBoard) {
          const boardLineClear = bodyHullDist <= 0.05 || this._segmentPlanetAirClear(miner.x, miner.y, boardTarget.x, boardTarget.y, 0.02);
          if (boardLineClear) {
            const dxShip = boardTarget.x - miner.x;
            const dyShip = boardTarget.y - miner.y;
            const dShip = Math.hypot(dxShip, dyShip);
            if (dShip > 1e-5) {
              const stepShip = Math.min(GAME.MINER_RUN_SPEED * dt, dShip);
              miner.x += dxShip / dShip * stepShip;
              miner.y += dyShip / dShip * stepShip;
            }
          }
        }
      }
      const minerMoved = Math.hypot(miner.x - prevMinerX, miner.y - prevMinerY);
      if (minerPathDebugEnabled && this._minerPathDebugCooldown <= 0 && !minerPathDebugRecord && dt > 0 && landed && guidePathUsable) {
        const rMiner = Math.hypot(prevMinerX, prevMinerY);
        if (indexPathMinerInitial === null && attachDebug && Number.isFinite(attachDebug.nearestDist) && /** @type {number} */
        attachDebug.nearestDist <= attachDist * 2.25) {
          minerPathDebugRecord = {
            reason: "idle_no_attach",
            minerIndex: i,
            minerType: miner.type,
            ship: { x: this.ship.x, y: this.ship.y },
            miner: { x: prevMinerX, y: prevMinerY, r: rMiner },
            attachDist,
            attach: attachDebug
          };
        } else if (indexPathMinerInitial !== null) {
          const pathDelta = indexPathTarget !== null ? Math.abs(indexPathMinerInitial - indexPathTarget) : 0;
          const attachDistance = dAttach ?? Number.NaN;
          const shouldStepToAttach = Number.isFinite(attachDistance) && attachDistance > attachSnap + 1e-4;
          const shouldStepAlongPath = Number.isFinite(pathDelta) && pathDelta > 0.06;
          if (attachBlocked) {
            minerPathDebugRecord = {
              reason: "attach_blocked_by_terrain",
              minerIndex: i,
              minerType: miner.type,
              ship: { x: this.ship.x, y: this.ship.y },
              miner: { x: prevMinerX, y: prevMinerY, moved: minerMoved, r: rMiner },
              path: {
                indexInitial: indexPathMinerInitial,
                indexFinal: indexPathMiner,
                indexTarget: indexPathTarget,
                deltaToTarget: pathDelta
              },
              step: {
                distMax,
                dAttach,
                attachSnap
              },
              attachDist,
              attach: attachDebug
            };
          } else if ((shouldStepToAttach || shouldStepAlongPath) && distMax > 1e-4 && minerMoved < 1e-5) {
            minerPathDebugRecord = {
              reason: "running_no_step",
              minerIndex: i,
              minerType: miner.type,
              ship: { x: this.ship.x, y: this.ship.y },
              miner: { x: prevMinerX, y: prevMinerY, moved: minerMoved, r: rMiner },
              path: {
                indexInitial: indexPathMinerInitial,
                indexFinal: indexPathMiner,
                indexTarget: indexPathTarget,
                deltaToTarget: pathDelta
              },
              step: {
                distMax,
                dAttach,
                attachSnap
              },
              attachDist,
              attach: attachDebug
            };
          }
        }
      }
      const upx = miner.x / r2;
      const upy = miner.y / r2;
      const headX = miner.x + upx * this.MINER_HEAD_OFFSET;
      const headY = miner.y + upy * this.MINER_HEAD_OFFSET;
      const footX = miner.x - upx * this.MINER_HEAD_OFFSET * 0.32;
      const footY = miner.y - upy * this.MINER_HEAD_OFFSET * 0.32;
      const hullDistHead = this._shipConvexHullDistance(headX, headY, this.ship.x, this.ship.y);
      const hullDistBody = this._shipConvexHullDistance(miner.x, miner.y, this.ship.x, this.ship.y);
      const hullDistFeet = this._shipConvexHullDistance(footX, footY, this.ship.x, this.ship.y);
      const hullDist = Math.min(hullDistHead, hullDistBody, hullDistFeet);
      const boardAcceptRadius = Math.max(GAME.MINER_BOARD_RADIUS, GAME.SHIP_SCALE * 0.28);
      const minerLocalBody = this._shipLocalPoint(miner.x, miner.y, this.ship.x, this.ship.y);
      const minerLocalHead = this._shipLocalPoint(headX, headY, this.ship.x, this.ship.y);
      const centerDist = Math.min(
        Math.hypot(headX - this.ship.x, headY - this.ship.y),
        Math.hypot(miner.x - this.ship.x, miner.y - this.ship.y),
        Math.hypot(footX - this.ship.x, footY - this.ship.y)
      );
      const boardNearShip = centerDist <= shipRadius + boardAcceptRadius;
      const boardPastCenterLine = Math.max(minerLocalBody.y, minerLocalHead.y) >= -(GAME.SHIP_SCALE * 0.08);
      const boardAtTarget = !!(boardTarget && Math.hypot(miner.x - boardTarget.x, miner.y - boardTarget.y) <= Math.max(boardAcceptRadius, GAME.SHIP_SCALE * 0.18));
      if (landed && hullDist <= boardAcceptRadius && boardNearShip && (boardPastCenterLine || boardAtTarget)) {
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
        this.popups.push({
          x: miner.x + upx * 0.1,
          y: miner.y + upy * 0.1,
          vx: upx * GAME.MINER_POPUP_SPEED + tx * jitter,
          vy: upy * GAME.MINER_POPUP_SPEED + ty * jitter,
          text: "+1",
          life: GAME.MINER_POPUP_LIFE
        });
        this._playSfx("miner_rescued", {
          volume: 0.45,
          rate: 0.95 + Math.random() * 0.1
        });
        this.miners.splice(i, 1);
      }
    }
    this.debugMinerPathToMiner = landed && guidePathUsable ? debugMinerPathToMiner : null;
    if (minerPathDebugEnabled && this._minerPathDebugCooldown <= 0 && minerPathDebugRecord) {
      console.log("[minerDbg]", minerPathDebugRecord);
      this._minerPathDebugCooldown = 0.35;
    }
    if (this.popups.length) {
      for (let i = this.popups.length - 1; i >= 0; i--) {
        const p = (
          /** @type {{x:number,y:number,vx:number,vy:number,life:number}} */
          this.popups[i]
        );
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0) this.popups.splice(i, 1);
      }
    }
    if (this.shipHitPopups.length) {
      for (let i = this.shipHitPopups.length - 1; i >= 0; i--) {
        const p = (
          /** @type {{x:number,y:number,vx:number,vy:number,life:number}} */
          this.shipHitPopups[i]
        );
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0) this.shipHitPopups.splice(i, 1);
      }
    }
    updateFragmentDebris(this.fragments, {
      gravityAt: (x, y) => this.planet.gravityAt(x, y),
      dragCoeff: this.planetParams.DRAG,
      dt,
      terrainCrossing: GAME.FRAGMENT_PLANET_COLLISION ? (p1, p2) => this.planet.terrainCrossing(p1, p2) : null,
      terrainCollisionEnabled: GAME.FRAGMENT_PLANET_COLLISION,
      restitution: Number.isFinite(this.planetParams.BOUNCE_RESTITUTION) ? Number(this.planetParams.BOUNCE_RESTITUTION) : GAME.BOUNCE_RESTITUTION
    });
    this._updateFallenMiners(dt);
    if (this.debris.length) {
      for (let i = this.debris.length - 1; i >= 0; i--) {
        const d = (
          /** @type {import("./types.d.js").Debris} */
          this.debris[i]
        );
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
        const s = (
          /** @type {import("./types.d.js").Shot} */
          this.enemies.shots[i]
        );
        if (this._enemyShotHitsShip(s, dt)) {
          this.enemies.shots.splice(i, 1);
          this._damageShip(s.x, s.y, "bullet");
          continue;
        }
      }
    }
    if (this.ship.state !== "crashed" && this.enemies.explosions.length) {
      const shipR = this._shipRadius();
      for (const ex of this.enemies.explosions) {
        const r2 = (ex.radius ?? 1) + shipR;
        const dx = this.ship.x - ex.x;
        const dy = this.ship.y - ex.y;
        if (dx * dx + dy * dy <= r2 * r2) {
          this._damageShip(ex.x, ex.y, "explosion");
          break;
        }
      }
    }
    if (this.ship.state === "landed") {
      if (wantsDropshipLiftoff({ left, right, thrust, stickThrust })) {
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
    const frameMs = Math.max(0, now - this.lastTime);
    const rawDt = Math.min(0.05, frameMs / 1e3);
    this.lastTime = now;
    this._recordFrameTiming(now, frameMs);
    const transitionActive = this.jumpdriveTransition.isActive();
    const touchStartActionMode = transitionActive ? null : this._touchStartActionMode();
    const touchStartPromptActive = touchStartActionMode !== null;
    this.input.setTouchStartPromptActive(touchStartPromptActive);
    this.input.setGameOver(!transitionActive && this.ship.state === "crashed");
    if (this.input && typeof this.input.setDebugCommandsEnabled === "function") {
      this.input.setDebugCommandsEnabled(this.devHudVisible);
    }
    const inputState = this.input.update();
    if (!transitionActive && inputState.toggleFrameStep) {
      this.debugFrameStepMode = !this.debugFrameStepMode;
      this.accumulator = 0;
      this._showStatusCue(this.debugFrameStepMode ? "Frame step on (Alt+L, Space steps)" : "Frame step off");
    }
    if (this.debugFrameStepMode || transitionActive) {
      inputState.thrust = false;
    }
    if (!transitionActive && inputState.zoomReset) {
      this._resetManualZoom();
      this._showZoomCue();
    }
    if (!transitionActive && typeof inputState.zoomDelta === "number" && Math.abs(inputState.zoomDelta) > 1e-4) {
      this._applyManualZoomDelta(inputState.zoomDelta);
    }
    if (this.helpPopup && typeof this.helpPopup.setTouchMode === "function") {
      this.helpPopup.setTouchMode(inputState.inputType === "touch");
    }
    const helpOpen = !!(this.helpPopup && this.helpPopup.isOpen && this.helpPopup.isOpen());
    const fixed = 1 / 60;
    const stepFrame = !!(this.debugFrameStepMode && inputState.stepFrame && !helpOpen);
    const dt = helpOpen ? 0 : this.debugFrameStepMode ? stepFrame ? fixed : 0 : rawDt;
    this._updateShipRenderAngle(dt);
    if (this.newGameHelpPromptT > 0) {
      this.newGameHelpPromptT = Math.max(0, this.newGameHelpPromptT - dt);
    }
    if (helpOpen) {
      this.accumulator = 0;
      this._setThrustLoopActive(false);
    } else if (this.debugFrameStepMode) {
      this.accumulator = stepFrame ? fixed : 0;
      if (!stepFrame) {
        this._setThrustLoopActive(false);
      }
    } else {
      this.accumulator += dt;
    }
    this.levelAdvanceReady = !transitionActive && this.pendingPerkChoice === null && this.ship.mothershipEngineers <= 0 && this._objectiveComplete() && this._isDockedWithMothership();
    if (!transitionActive) {
      this._updateStartTitle(dt, inputState);
    }
    if (!transitionActive && this.ship.state === "crashed") {
      this.ship.explodeT = Math.min(1.2, this.ship.explodeT + dt * 0.9);
    }
    if (!transitionActive && inputState.regen) {
      const nextSeed = this.planet.getSeed() + 1;
      this._beginLevel(nextSeed, this.level);
    }
    if (!transitionActive && inputState.promptLevelJump) {
      this._promptDevJumpToLevel();
    }
    if (!transitionActive && inputState.prevLevel) {
      if (this.level > 1) {
        this._devJumpToLevel(this.level - 1);
      }
    } else if (!transitionActive && inputState.nextLevel) {
      const nextSeed = this.planet.getSeed() + 1;
      this._startJumpdriveTransition(nextSeed, this.level + 1);
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
    if (inputState.toggleRingVertices) {
      this.debugRingVertices = !this.debugRingVertices;
      this._showStatusCue(this.debugRingVertices ? "Ring vertex debug on" : "Ring vertex debug off");
    }
    if (inputState.togglePlanetTriangles) {
      this.debugPlanetTriangles = !this.debugPlanetTriangles;
      this._showStatusCue(this.debugPlanetTriangles ? "Planet triangle outlines on" : "Planet triangle outlines off");
    }
    if (inputState.toggleCollisionContours) {
      this.debugCollisionContours = !this.debugCollisionContours;
      this._showStatusCue(this.debugCollisionContours ? "Collision contour debug on" : "Collision contour debug off");
    }
    if (inputState.toggleMinerGuidePath) {
      this.debugMinerGuidePath = !this.debugMinerGuidePath;
      this._showStatusCue(this.debugMinerGuidePath ? "Miner guide path debug on" : "Miner guide path debug off");
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
    } else if (inputState.sfxVolumeDown && this.audio && typeof this.audio.stepSfxVolume === "function") {
      const nextPct = this.audio.stepSfxVolume(-1);
      this._showStatusCue(`FX volume ${nextPct}%`);
    } else if (inputState.sfxVolumeUp && this.audio && typeof this.audio.stepSfxVolume === "function") {
      const nextPct = this.audio.stepSfxVolume(1);
      this._showStatusCue(`FX volume ${nextPct}%`);
    }
    if (inputState.rescueAll) {
      this._rescueAll();
    }
    if (inputState.killAllEnemies) {
      this._killAllEnemies();
    }
    if (inputState.removeEntities) {
      this._killAllEnemiesAndFactories();
    }
    const captureScreenshot = !!inputState.copyScreenshot;
    const captureScreenshotClean = !!inputState.copyScreenshotClean;
    const captureScreenshotCleanTitle = !!inputState.copyScreenshotCleanTitle;
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
    const landingDbg = this.devHudVisible ? this.ship._landingDebug : null;
    if (!this.devHudVisible) {
      this.ship._landingDebug = null;
      this.ship._lastMothershipCollisionDiag = null;
      this._lastLandingDebugConsoleLine = "";
      this._landingDebugSessionActive = false;
      this._landingDebugSessionFrame = 0;
      this._landingDebugSessionSource = "";
    } else if (landingDbg) {
      const fmt = (n) => Number.isFinite(n) ? Number(n).toFixed(2) : "-";
      const fmtI = (n) => Number.isFinite(n) ? String(Math.round(Number(n))) : "-";
      const fmtVec = (v) => {
        if (!v) return "-";
        return `${fmt(v.vx)},${fmt(v.vy)}@${fmt(v.speed)}/${fmt(v.dirDeg)}deg`;
      };
      const fmtNormal = (n) => {
        if (!n) return "-";
        return `${fmt(n.nx)},${fmt(n.ny)}`;
      };
      const fmtHits = (e) => {
        if (!e || !Array.isArray(e.hits)) return "-";
        return e.hits.map((h) => {
          const kind = h && h.kind ? h.kind : "?";
          const edge = Number.isFinite(h && h.edgeIdx) ? h.edgeIdx : "-";
          const hull = Number.isFinite(h && h.hullIdx) ? h.hullIdx : "-";
          return `${kind}[e${edge}/h${hull}]`;
        }).join(",");
      };
      const reason = String(landingDbg.reason || "-");
      let mothershipRelatedNoContact = false;
      if (reason === "mothership_no_contact" && landingDbg.source === "mothership" && this.mothership) {
        const shipRadius = this._shipRadius();
        const dx = this.ship.x - this.mothership.x;
        const dy = this.ship.y - this.mothership.y;
        const nearMothership = dx * dx + dy * dy <= Math.pow((this.mothership.bounds || 0) + shipRadius + 0.8, 2);
        const overlap = nearMothership && this._shipCollidesWithMothershipAt(this.ship.x, this.ship.y);
        const activeHit = !!(this.ship._collision && this.ship._collision.source === "mothership");
        mothershipRelatedNoContact = overlap || activeHit;
      }
      const hasCollisionEvidence = Number(landingDbg.contactsCount) > 0 || Number(landingDbg.overlapBeforeCount) > 0 || Number(landingDbg.overlapAfterCount) > 0 || Number(landingDbg.depenPush) > 0;
      const landedState = reason.includes("landed");
      (reason.includes("no_contact") || reason.includes("graze")) && !hasCollisionEvidence;
      const mothershipSessionCandidate = landingDbg.source === "mothership" && reason.startsWith("mothership_") && hasCollisionEvidence;
      const sessionActive = !!(!landedState && (hasCollisionEvidence || mothershipRelatedNoContact || mothershipSessionCandidate));
      let sessionId = this._landingDebugSessionActive ? this._landingDebugSessionId : 0;
      let sessionFrame = this._landingDebugSessionActive ? this._landingDebugSessionFrame : 0;
      if (sessionActive) {
        if (!this._landingDebugSessionActive) {
          this._landingDebugSessionActive = true;
          this._landingDebugSessionId = this._landingDebugSessionIdNext++;
          this._landingDebugSessionFrame = 1;
          this._landingDebugSessionSource = String(landingDbg.source || "");
          console.log(`[landDbgStart] sid:${this._landingDebugSessionId} src:${landingDbg.source || "-"} r:${reason}`);
        } else {
          this._landingDebugSessionFrame += 1;
        }
        sessionId = this._landingDebugSessionId;
        sessionFrame = this._landingDebugSessionFrame;
      } else if (this._landingDebugSessionActive) {
        console.log(
          `[landDbgEnd] sid:${this._landingDebugSessionId} frames:${this._landingDebugSessionFrame} end:${reason}`
        );
        this._landingDebugSessionActive = false;
        this._landingDebugSessionFrame = 0;
        this._landingDebugSessionSource = "";
        sessionId = 0;
        sessionFrame = 0;
      }
      if (landingDbg.collisionDiag) {
        landingDbg.collisionDiag.session = {
          id: sessionId,
          frame: sessionFrame,
          active: this._landingDebugSessionActive,
          reason
        };
      }
      const line = `[landDbg] sid:${sessionId || "-"} sf:${sessionFrame || "-"} src:${landingDbg.source || "-"} r:${reason} lu:${fmt(landingDbg.dotUp)} sl:${fmt(landingDbg.slope)}<=${fmt(landingDbg.landSlope)} vn:${fmt(landingDbg.vn)} vt:${fmt(landingDbg.vt)} sp:${fmt(landingDbg.speed)} af:${fmt(landingDbg.airFront)} ab:${fmt(landingDbg.airBack)} sup:${landingDbg.support ? 1 : 0}@${fmt(landingDbg.supportDist)} ok:${landingDbg.landable ? 1 : 0} c:${landingDbg.contactsCount ?? -1} bd:${fmt(landingDbg.bestDotUpAny)}/${fmt(landingDbg.bestDotUpUnder)} ip:${landingDbg.impactPoint ?? -1}@${fmt(landingDbg.impactT)} sp:${landingDbg.supportPoint ?? -1}@${fmt(landingDbg.supportT)} tri:o${landingDbg.supportTriOuterCount ?? -1} a:${fmt(landingDbg.supportTriAirMin)}-${fmt(landingDbg.supportTriAirMax)} r:${fmt(landingDbg.supportTriRMin)}-${fmt(landingDbg.supportTriRMax)} ov:${fmtI(landingDbg.overlapBeforeCount)}>${fmtI(landingDbg.overlapAfterCount)} ovm:${fmt(landingDbg.overlapBeforeMin)}>${fmt(landingDbg.overlapAfterMin)} dep:${fmt(landingDbg.depenPush)} csh:${fmt(landingDbg.depenCushion)} d:${fmtI(landingDbg.depenDir)} i:${fmtI(landingDbg.depenIter)} clr:${landingDbg.depenCleared ? 1 : 0}`;
      const diag = landingDbg.collisionDiag || null;
      const detailLine = diag ? ` phase:${diag.phase || "-"} hits:${diag.hitCount ?? "-"} avgNormal:${fmtNormal(diag.averageNormal)} baseW:${fmtVec(diag.baseAtContact)} relInW:${fmtVec(diag.relIn)} relOutW:${fmtVec(diag.relOut)} baseL:${fmtVec(diag.baseAtContactLocal)} relInL:${fmtVec(diag.relInLocal)} relOutL:${fmtVec(diag.relOutLocal)} vnIn:${fmt(diag.vnIn)} vtIn:${fmt(diag.vtIn)} vnOut:${fmt(diag.vnOut)} vtOut:${fmt(diag.vtOut)} evidence:${diag.evidence && diag.evidence.reason ? diag.evidence.reason : "-"} hitList:${fmtHits(diag.evidence)} sweepDbg:${diag.evidence && diag.evidence.debug ? [
        `s${diag.evidence.debug.sampleCount ?? 0}`,
        `e${diag.evidence.debug.edgeCount ?? 0}`,
        `cand${diag.evidence.debug.candidateCount ?? 0}`,
        `air${diag.evidence.debug.rejectStartNotAir ?? 0}`,
        `solid${diag.evidence.debug.rejectEndNotSolid ?? 0}`,
        `seg${diag.evidence.debug.rejectSegment ?? 0}`,
        `t${diag.evidence.debug.rejectT ?? 0}`,
        `feat${diag.evidence.debug.featureKeptCount ?? 0}/${diag.evidence.debug.featureGroupCount ?? 0}`,
        `early${diag.evidence.debug.earliestCandidateCount ?? 0}`,
        `keep${diag.evidence.debug.clusterKeptCount ?? 0}/${diag.evidence.debug.clusterInputCount ?? 0}`,
        `inside${diag.evidence.debug.insideCount ?? 0}`
      ].join("|") : "-"} dock:${diag.dock ? `${fmt(diag.dock.lx)},${fmt(diag.dock.ly)} n:${fmt(diag.dock.localNx)},${fmt(diag.dock.localNy)} floor:${diag.dock.dockFloorNormal ? 1 : 0}` : "-"} backoff:${diag.backoff ? `${fmt(diag.backoff.dist)} dir:${fmt(diag.backoff.dirX)},${fmt(diag.backoff.dirY)} clear:${diag.backoff.cleared ? 1 : 0}` : "-"} overlapNow:${diag.overlap ? `${diag.overlap.before ? 1 : 0}->${diag.overlap.after ? 1 : 0}` : "-"}` : "";
      const combinedLine = line + detailLine;
      const idleNoContact = !sessionActive && reason === "mothership_no_contact" && !mothershipRelatedNoContact;
      const shouldLog = !idleNoContact && (sessionActive || line !== this._lastLandingDebugConsoleLine);
      if (shouldLog) {
        console.log(combinedLine);
        this._lastLandingDebugConsoleLine = line;
      }
    } else if (this.devHudVisible && this.mothership) {
      const shipRadius = this._shipRadius();
      const dx = this.ship.x - this.mothership.x;
      const dy = this.ship.y - this.mothership.y;
      const nearMothership = dx * dx + dy * dy <= Math.pow((this.mothership.bounds || 0) + shipRadius + 0.8, 2);
      const overlap = nearMothership && this._shipCollidesWithMothershipAt(this.ship.x, this.ship.y);
      if (this._landingDebugSessionActive && this._landingDebugSessionSource !== "mothership") {
        console.log(
          `[landDbgEnd] sid:${this._landingDebugSessionId} frames:${this._landingDebugSessionFrame} end:no_debug`
        );
        this._landingDebugSessionActive = false;
        this._landingDebugSessionFrame = 0;
        this._landingDebugSessionSource = "";
      }
      if (!this._landingDebugSessionActive && overlap) {
        this._landingDebugSessionActive = true;
        this._landingDebugSessionId = this._landingDebugSessionIdNext++;
        this._landingDebugSessionFrame = 0;
        this._landingDebugSessionSource = "mothership";
        console.log(`[landDbgStart] sid:${this._landingDebugSessionId} src:mothership r:mothership_trace_overlap`);
      }
      if (this._landingDebugSessionActive && this._landingDebugSessionSource === "mothership") {
        if (nearMothership) {
          this._landingDebugSessionFrame += 1;
          const sid = this._landingDebugSessionId;
          const sf = this._landingDebugSessionFrame;
          const c = Math.cos(-this.mothership.angle);
          const s = Math.sin(-this.mothership.angle);
          const lx = c * dx - s * dy;
          const ly = s * dx + c * dy;
          const relVx = this.ship.vx - this.mothership.vx;
          const relVy = this.ship.vy - this.mothership.vy;
          const relLx = c * relVx - s * relVy;
          const relLy = s * relVx + c * relVy;
          const traceLine = `[landDbgGap] sid:${sid} sf:${sf} src:mothership r:${overlap ? "mothership_trace_overlap" : "mothership_trace_near"} ship:${this.ship.x.toFixed(2)},${this.ship.y.toFixed(2)} dock:${lx.toFixed(2)},${ly.toFixed(2)} relW:${relVx.toFixed(2)},${relVy.toFixed(2)}@${Math.hypot(relVx, relVy).toFixed(2)} relL:${relLx.toFixed(2)},${relLy.toFixed(2)}@${Math.hypot(relLx, relLy).toFixed(2)} overlap:${overlap ? 1 : 0}`;
          if (traceLine !== this._lastLandingDebugConsoleLine) {
            console.log(traceLine);
            this._lastLandingDebugConsoleLine = traceLine;
          }
        } else {
          console.log(
            `[landDbgEnd] sid:${this._landingDebugSessionId} frames:${this._landingDebugSessionFrame} end:trace_far`
          );
          this._landingDebugSessionActive = false;
          this._landingDebugSessionFrame = 0;
          this._landingDebugSessionSource = "";
        }
      }
    } else if (this.devHudVisible && this._landingDebugSessionActive) {
      console.log(
        `[landDbgEnd] sid:${this._landingDebugSessionId} frames:${this._landingDebugSessionFrame} end:no_debug`
      );
      this._landingDebugSessionActive = false;
      this._landingDebugSessionFrame = 0;
      this._landingDebugSessionSource = "";
    }
    this.levelAdvanceReady = this.pendingPerkChoice === null && this.ship.mothershipEngineers <= 0 && objectiveCompleteNow && this._isDockedWithMothership();
    this.fpsFrames++;
    if (now - this.fpsTime >= 500) {
      this.fps = Math.round(this.fpsFrames * 1e3 / (now - this.fpsTime));
      this.fpsFrames = 0;
      this.fpsTime = now;
    }
    const gameOver = !transitionActive && this.ship.state === "crashed";
    const transitionFogOrigin = transitionActive ? this.jumpdriveTransition.fogOrigin(this.ship) : null;
    const fogSyncEnabled = !PERF_FLAGS.disableFogSync;
    const dynamicOverlayEnabled = !PERF_FLAGS.disableDynamicOverlay;
    if (fogSyncEnabled && !transitionActive) {
      this.planet.syncRenderFog(this.renderer, this.ship.x, this.ship.y);
    } else if (fogSyncEnabled && transitionFogOrigin) {
      this.planet.syncRenderFog(this.renderer, transitionFogOrigin.x, transitionFogOrigin.y);
    }
    let renderState = {
      view: this._viewState(),
      ship: this.ship,
      mothership: this.mothership,
      debris: this.debris,
      input: inputState,
      debugCollisions: this.debugCollisions,
      debugNodes: GAME.DEBUG_NODES,
      debugPlanetTriangles: this.debugPlanetTriangles,
      debugCollisionContours: this.debugCollisionContours,
      debugRingVertices: this.debugRingVertices,
      debugMinerGuidePath: this.debugMinerGuidePath,
      debugMinerPathToMiner: this.debugMinerPathToMiner,
      debugCollisionSamples: this.debugCollisions || this.debugCollisionContours ? this.ship._samples || [] : null,
      debugPoints: this.debugCollisions && GAME.DEBUG_NODES || this.debugRingVertices ? this.planet.debugPoints() : null,
      fogEnabled: this.fogEnabled && fogSyncEnabled,
      fps: this.fps,
      finalAir: this.planet.getFinalAir(),
      miners: dynamicOverlayEnabled ? this.miners : EMPTY_RENDER_ARRAY,
      fallenMiners: dynamicOverlayEnabled ? this.fallenMiners : EMPTY_RENDER_ARRAY,
      minersRemaining: this.minersRemaining,
      minerTarget: this.minerTarget,
      level: this.level,
      minersDead: this.minersDead,
      healthPickups: dynamicOverlayEnabled ? this.healthPickups : EMPTY_RENDER_ARRAY,
      enemies: dynamicOverlayEnabled ? this.enemies.enemies : EMPTY_RENDER_ARRAY,
      shots: dynamicOverlayEnabled ? this.enemies.shots : EMPTY_RENDER_ARRAY,
      explosions: dynamicOverlayEnabled ? this.enemies.explosions : EMPTY_RENDER_ARRAY,
      fragments: dynamicOverlayEnabled ? this.fragments.concat(this.enemies.debris) : EMPTY_RENDER_ARRAY,
      playerShots: dynamicOverlayEnabled ? this.playerShots : EMPTY_RENDER_ARRAY,
      playerBombs: dynamicOverlayEnabled ? this.playerBombs : EMPTY_RENDER_ARRAY,
      featureParticles: dynamicOverlayEnabled ? this.planet.getFeatureParticles() : EMPTY_FEATURE_PARTICLES,
      entityExplosions: dynamicOverlayEnabled ? this.entityExplosions : EMPTY_RENDER_ARRAY,
      aimWorld: gameOver ? null : this.lastAimWorld,
      aimOrigin: gameOver ? null : this._shipGunPivotWorld(),
      planetPalette: this._planetPalette(),
      touchUi: gameOver ? null : inputState.touchUi,
      touchStart: inputState.inputType === "touch" && touchStartPromptActive,
      touchStartMode: inputState.inputType === "touch" ? touchStartActionMode : null
    };
    if (transitionActive) {
      renderState = this.jumpdriveTransition.decorateRenderState(renderState);
    }
    this._lastRenderState = renderState;
    this.renderer.drawFrame(renderState, this.planet);
    this._drawMinerPopups();
    if ((captureScreenshotClean || captureScreenshot || captureScreenshotCleanTitle) && !this.screenshotCopyInFlight) {
      const mode = captureScreenshotCleanTitle ? "cleanTitle" : captureScreenshotClean ? "clean" : "full";
      const clean = mode !== "full";
      const includeStartTitle = mode === "cleanTitle" || clean && !this.startTitleSeen && this.startTitleAlpha > 0;
      this.screenshotCopyInFlight = true;
      void copyGameplayScreenshotToClipboard({
        canvas: this.canvas,
        overlay: this.overlay,
        renderState,
        clean,
        drawFrame: (state) => this.renderer.drawFrame(state, this.planet),
        redrawOverlay: () => this._drawMinerPopups(),
        includeStartTitle,
        startTitleText: this.startTitleText || "DROPSHIP",
        startTitleAlpha: mode === "cleanTitle" ? 1 : this.startTitleAlpha
      }).then((result) => {
        if (result === "ok") {
          this._showStatusCue(
            mode === "cleanTitle" ? "Title screenshot copied" : clean ? "Clean screenshot copied" : "Screenshot copied"
          );
        } else if (result === "unsupported") {
          this._showStatusCue("Clipboard image copy unsupported");
        } else {
          this._showStatusCue("Screenshot copy failed");
        }
      }).finally(() => {
        this.screenshotCopyInFlight = false;
      });
    }
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
        landingDebug: this.ship._landingDebug || null,
        inputType: inputState.inputType,
        frameStats: this.frameStats,
        benchState: this.benchmarkRun ? this.benchmarkRun.stateText : null,
        perfFlags: this.perfFlags
      });
    }
    const heat = this.ship.heat || 0;
    const showHeat = !transitionActive && this._heatMechanicsActive();
    const heating = showHeat && heat > this.lastHeat + 0.1;
    this.lastHeat = heat;
    if (this.heatMeter && this.ui.updateHeatMeter) {
      this.ui.updateHeatMeter(this.heatMeter, heat, showHeat, heating);
    }
    const titleShowing = !this.startTitleSeen && this.startTitleAlpha > 0;
    if (this.planetLabel) {
      this.planetLabel.style.visibility = titleShowing || transitionActive ? "hidden" : "visible";
      if (!titleShowing && !transitionActive && this.ui.updatePlanetLabel) {
        const cfg = this.planet.getPlanetConfig();
        const label = cfg ? cfg.label : "";
        const prefix = `Level ${this.level}: `;
        this.ui.updatePlanetLabel(this.planetLabel, label ? `${prefix}${label}` : `Level ${this.level}`);
      }
    }
    if (this.objectiveLabel) {
      this.objectiveLabel.style.visibility = transitionActive ? "hidden" : "visible";
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
      this.shipStatusLabel.style.visibility = titleShowing || transitionActive ? "hidden" : "visible";
      if (!titleShowing && !transitionActive && this.ui.updateShipStatusLabel) {
        this.ui.updateShipStatusLabel(this.shipStatusLabel, {
          shipHp: this.ship.hpCur,
          shipHpMax: this.ship.hpMax,
          bombs: this.ship.bombsCur,
          bombsMax: this.ship.bombsMax
        });
      }
    }
    if (this.signalMeter && this.ui.updateSignalMeter) {
      this.ui.updateSignalMeter(this.signalMeter, this._signalStrength(), !titleShowing && !transitionActive);
    }
    requestAnimationFrame(() => this._frame());
  }
  /**
   * @returns {number}
   */
  _signalStrength() {
    let signalStrength = 0;
    for (const m of this.miners) {
      const dx = m.x - this.ship.x;
      const dy = m.y - this.ship.y;
      signalStrength += 1 / Math.max(1, dx * dx + dy * dy);
    }
    if (signalStrength > 0) {
      signalStrength = Math.min(10, Math.ceil(10 + Math.log2(signalStrength)));
    }
    return signalStrength;
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
   * @param {import("./types.d.js").InputState} inputState
   * @returns {boolean}
   */
  _hasAnyPlayerInput(inputState) {
    if (inputState.left || inputState.right || inputState.thrust || inputState.down) return true;
    if (inputState.shootHeld || inputState.shootPressed || inputState.shoot || inputState.bomb || inputState.reset || inputState.abandonRun) return true;
    if (inputState.regen || inputState.nextLevel || inputState.prevLevel) return true;
    if (inputState.toggleDebug || inputState.toggleDevHud || inputState.togglePlanetView || inputState.toggleCollisionContours || inputState.toggleMinerGuidePath || inputState.toggleFog) return true;
    if (inputState.copyScreenshot || inputState.copyScreenshotClean || inputState.copyScreenshotCleanTitle) return true;
    if (inputState.zoomReset) return true;
    if (typeof inputState.zoomDelta === "number" && Math.abs(inputState.zoomDelta) > 1e-4) return true;
    if (inputState.rescueAll || inputState.killAllEnemies || inputState.removeEntities || inputState.spawnEnemyType !== null) return true;
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
   * @param {number} remainingMs
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
    if (objType === "destroy_factories") return this._remainingFactoryTargets() === 0;
    if (objType === "extract") return this.minersRemaining === 0;
    if (objType === "destroy_core") return this.coreMeltdownActive || this._tetherPropsAlive().length === 0;
    return false;
  }
  /**
   * @returns {void}
   */
  start() {
    if (this.pendingBootJumpdriveIntro) {
      this.pendingBootJumpdriveIntro = false;
      this._startCurrentLevelJumpdriveIntro();
    }
    requestAnimationFrame(() => this._frame());
  }
  /**
   * @returns {void}
   */
  _onSuccessfullyDocked() {
    let y = 0.5;
    const r2 = Math.hypot(this.ship.x, this.ship.y);
    const upx = this.ship.x / r2;
    const upy = this.ship.y / r2;
    const addPopup = (msg) => {
      this.popups.push({
        x: this.ship.x + upx * y,
        y: this.ship.y + upy * y,
        vx: this.mothership.vx + upx * GAME.MINER_POPUP_SPEED,
        vy: this.mothership.vy + upy * GAME.MINER_POPUP_SPEED,
        text: msg,
        life: 2
      });
      y += 0.25;
    };
    const addGroupPopup = (name, count) => {
      if (count <= 0) return;
      addPopup(name + " +" + count);
    };
    addGroupPopup("pilot", this.ship.dropshipPilots);
    addGroupPopup("engineer", this.ship.dropshipEngineers);
    addGroupPopup("miner", this.ship.dropshipMiners);
    addGroupPopup("hull", this.ship.hpMax - this.ship.hpCur);
    addGroupPopup("bomb", this.ship.bombsMax - this.ship.bombsCur);
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
    if (this.ship.inertialDrive < 3) {
      perksAvailable.push("inertialDrive");
    }
    if (this.level > 5 && this.ship.gunPower < 2) {
      perksAvailable.push("gunPower");
    }
    if (!this.ship.rescueeDetector) {
      perksAvailable.push("rescueeDetector");
    }
    if (!this.ship.planetScanner) {
      perksAvailable.push("planetScanner");
    }
    if (!this.ship.bounceShots) {
      perksAvailable.push("bounceShots");
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
    return [
      /** @type {string} */
      perksAvailable[idx0],
      /** @type {string} */
      perksAvailable[idx1]
    ];
  }
  /**
   * @param {string} perk
   * @returns {string}
   */
  _perkChoiceText(perk) {
    if (perk === "hpMax") return "Reinforced hull: +1 max HP";
    if (perk === "bombsMax") return "Expanded payload bay: +1 max bomb";
    if (perk === "thrust") return "Engine tune-up: +10% thrust power";
    if (perk === "inertialDrive") return "Inertial drive: +10% corrective thrust";
    if (perk === "gunPower") return "Firepower: +1 HP damage";
    if (perk === "rescueeDetector") return "Rescuee detector: locate stranded crew";
    if (perk === "planetScanner") return "Planet scanner: scan planet from mothership";
    if (perk === "bounceShots") return "Bounce shots";
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
    } else if (perk === "inertialDrive") {
      ++this.ship.inertialDrive;
    } else if (perk === "gunPower") {
      ++this.ship.gunPower;
    } else if (perk === "rescueeDetector") {
      this.ship.rescueeDetector = true;
    } else if (perk === "planetScanner") {
      this.ship.planetScanner = true;
    } else if (perk === "bounceShots") {
      this.ship.bounceShots = true;
    }
  }
  /**
   * @param {boolean} leftPressed
   * @param {boolean} rightPressed
   * @returns {void}
   */
  _handlePerkChoiceInput(leftPressed, rightPressed) {
    const i = leftPressed ? 0 : rightPressed ? 1 : 2;
    const pendingPerkChoice = this.pendingPerkChoice;
    if (pendingPerkChoice && i < pendingPerkChoice.length) {
      this._applyPerk(
        /** @type {{perk:string}} */
        pendingPerkChoice[i].perk
      );
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
    this._beginNewGameWithIntro(nextSeed);
  }
  /**
   * @returns {void}
   */
  _rescueAll() {
    for (let i = this.miners.length - 1; i >= 0; i--) {
      const miner = (
        /** @type {Miner} */
        this.miners[i]
      );
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
   * Debug helper: remove all active enemies without touching factories.
   * @returns {void}
   */
  _killAllEnemies() {
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
    this._showStatusCue(enemyCount > 0 ? `Debug clear: ${enemyCount} enemies` : "Debug clear: no enemies alive");
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
    this.pendingBootJumpdriveIntro = false;
    this.jumpdriveTransition.cancel();
    const restored = restoreLoopFromSaveSnapshot(this, snapshot);
    if (restored) {
      this._resetShipRenderAngle();
    }
    return restored;
  }
  /**
   * @returns {void}
   */
  _drawMinerPopups() {
    if (PERF_FLAGS.disableOverlayCanvas || !this.overlay || !this.overlayCtx) {
      return;
    }
    const ctx = this.overlayCtx;
    const dpr = getEffectiveDevicePixelRatio();
    const w = Math.floor(this.overlay.clientWidth * dpr);
    const h = Math.floor(this.overlay.clientHeight * dpr);
    if (this.overlay.width !== w || this.overlay.height !== h) {
      this.overlay.width = w;
      this.overlay.height = h;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    if (this.jumpdriveTransition.isActive()) {
      this.jumpdriveTransition.drawOverlay(ctx, w, h, dpr, this._lastRenderState);
      ctx.globalAlpha = 1;
      return;
    }
    const showStartTitle = !this.startTitleSeen && this.startTitleAlpha > 0;
    if (!showStartTitle && !this.popups.length && !this.shipHitPopups.length && !this.lastAimScreen && !this.pendingPerkChoice) {
      return;
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 ${Math.max(12, Math.round(16 * dpr))}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
    const screenT = this._screenTransform(w / h);
    for (const p of this.popups) {
      const t = Math.max(0, Math.min(1, p.life / GAME.MINER_POPUP_LIFE));
      const alpha = 0.9 * t;
      const screen = this._worldToScreenNorm(p.x, p.y, screenT);
      const px = screen.x * w;
      const py = screen.y * h;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(255, 236, 170, 1)";
      ctx.fillText(p.text, px, py);
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
    if (showStartTitle) {
      drawStartTitle(
        ctx,
        w,
        h,
        dpr,
        /** @type {string} */
        this.startTitleText,
        /** @type {number} */
        this.startTitleAlpha
      );
    }
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
    ctx.fillText(
      /** @type {string} */
      lines[i],
      cx,
      topY + i * lineHeight
    );
  }
}
function muzzleVelocity(dirx, diry, vx, vy, bulletSpeed) {
  const vn = vx * dirx + vy * diry;
  const vt = vx * -diry + vy * dirx;
  let speed = Math.sqrt(Math.max(0, bulletSpeed * bulletSpeed - vt * vt));
  const MIN_LAUNCH_SPEED = 0.5;
  if (speed < MIN_LAUNCH_SPEED) {
    vx += dirx * bulletSpeed;
    vy += diry * bulletSpeed;
  } else {
    speed += vn;
    vx = dirx * speed;
    vy = diry * speed;
  }
  return { vx, vy };
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
const minerDownUrl = "/dropship-testing/assets/lose%20sound%201_0_256k-GwJhTFnY.mp3";
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
const DEFAULT_MUSIC_CROSSFADE_MS = 1400;
const COMBAT_TRIGGER_MIN_MS = 24e3;
const COMBAT_TRIGGER_MAX_MS = 48e3;
const COMBAT_RETRIGGER_COOLDOWN_MS = 18e3;
const THRUST_LOOP_GAIN = 0.25;
const THRUST_LOOP_FADE_IN_MS = 90;
const THRUST_LOOP_FADE_OUT_MS = 320;
const AUDIO_SETTINGS_VERSION = 1;
const AUDIO_SETTINGS_STORAGE_KEY = `dropship.audio.v${AUDIO_SETTINGS_VERSION}`;
const MAX_PENDING_SFX = 24;
const DEFAULT_SFX_POOL_SIZE = 3;
const SFX_POOL_SIZE = {
  ship_laser: 4,
  enemy_fire: 4,
  bomb_explosion: 3,
  water_splash: 4
};
const SFX_MIN_INTERVAL_MS = {
  ship_laser: 70,
  miner_down: 90
};
const DEFAULT_WEB_AUDIO_SFX_IDS = Object.freeze(["ship_laser", "enemy_fire"]);
const WEB_AUDIO_SFX_VARIANT_RATES = Object.freeze({
  ship_laser: [0.96, 1, 1.04]
});
function detectAudioRuntimeProfile() {
  const hasAudioContext = typeof window !== "undefined" && !!(window.AudioContext || /** @type {any} */
  window.webkitAudioContext);
  if (typeof navigator === "undefined") {
    return {
      lowOverhead: false,
      useWebAudio: true,
      primeSfx: true,
      preRenderPitchVariants: true,
      musicCrossfadeMs: DEFAULT_MUSIC_CROSSFADE_MS,
      maxSfxPoolSize: Number.POSITIVE_INFINITY,
      preloadMode: "auto",
      musicEnabledByDefault: true,
      thrustLoopMode: hasAudioContext ? "webAudio" : "htmlAudio"
    };
  }
  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const maxTouchPoints = Number.isFinite(navigator.maxTouchPoints) ? navigator.maxTouchPoints : 0;
  const appleMobileWebKit = /AppleWebKit/i.test(ua) && (/iP(hone|ad|od)/i.test(ua) || platform === "MacIntel" && maxTouchPoints > 1);
  if (!appleMobileWebKit) {
    return {
      lowOverhead: false,
      useWebAudio: true,
      primeSfx: true,
      preRenderPitchVariants: true,
      musicCrossfadeMs: DEFAULT_MUSIC_CROSSFADE_MS,
      maxSfxPoolSize: Number.POSITIVE_INFINITY,
      preloadMode: "auto",
      musicEnabledByDefault: true,
      thrustLoopMode: hasAudioContext ? "webAudio" : "htmlAudio"
    };
  }
  return {
    lowOverhead: true,
    useWebAudio: false,
    primeSfx: false,
    preRenderPitchVariants: false,
    musicCrossfadeMs: 120,
    maxSfxPoolSize: 2,
    preloadMode: "metadata",
    musicEnabledByDefault: true,
    thrustLoopMode: hasAudioContext ? "webAudio" : "htmlAudio"
  };
}
function runtimeSfxPoolSize(profile, id) {
  const base = SFX_POOL_SIZE[id] || DEFAULT_SFX_POOL_SIZE;
  return Math.max(1, Math.min(base, profile.maxSfxPoolSize));
}
const SFX_PLACEHOLDER_URLS = {
  ship_laser: pistol256Url,
  bomb_launch: bombLaunch256Url,
  bomb_explosion: crash256Url,
  ship_hit: shipHitUrl,
  ship_crash: crash256Url,
  enemy_fire: enemyFireUrl,
  enemy_destroyed: explosion256Url,
  miner_down: minerDownUrl,
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
  { id: "miner_down", priority: 7, trigger: "GameLoop miner death / fatal terrain displacement", placeholderFile: "audio/fx/lose sound 1_0_256k.mp3" },
  { id: "miner_rescued", priority: 8, trigger: "GameLoop miner boards ship", placeholderFile: "audio/fx/key-176034.mp3" },
  { id: "objective_complete", priority: 9, trigger: "When objective transitions to complete", placeholderFile: "audio/fx/levelcompletesplash.mp3" },
  { id: "ship_thrust_loop", priority: 10, trigger: "While ship thrust is active", placeholderFile: "audio/fx/engine_sound.mp3" },
  { id: "heat_warning", priority: 11, trigger: "Heat meter warning state", placeholderFile: "audio/fx/lava_256k.mp3" },
  { id: "water_splash", priority: 12, trigger: "GameLoop ship crosses water surface in/out", placeholderFile: "audio/fx/splash1_256k.mp3" },
  { id: "dock_refuel", priority: 13, trigger: "Docked and refilling hp/bombs", placeholderFile: "(placeholder only, pick clip)" }
]);
class BackgroundMusic {
  /**
   * @param {{volume?:number}} [opts]
   */
  constructor(opts) {
    const volume = opts && typeof opts.volume === "number" ? opts.volume : 0.35;
    const persisted = loadAudioSettings();
    this.musicVolume = clampUnit(persisted ? persisted.musicVolume : volume);
    this.runtimeProfile = detectAudioRuntimeProfile();
    this.enabled = this.runtimeProfile.musicEnabledByDefault;
    this.sfxEnabled = true;
    this.playbackBypassed = false;
    this.musicCrossfadeMs = this.runtimeProfile.musicCrossfadeMs;
    this.sfxMasterVolume = clampUnit(persisted ? persisted.sfxMasterVolume : 0.7);
    this.combatMusicEnabled = true;
    this.webAudioCtx = null;
    this.webAudioBuffers = /* @__PURE__ */ new Map();
    this.webAudioVariantBuffers = /* @__PURE__ */ new Map();
    this.webAudioBufferPromises = /* @__PURE__ */ new Map();
    this.webAudioSfxIds = new Set(this.runtimeProfile.useWebAudio ? (
      /** @type {SfxId[]} */
      DEFAULT_WEB_AUDIO_SFX_IDS
    ) : []);
    if (this.runtimeProfile.thrustLoopMode === "webAudio") {
      this.webAudioSfxIds.add("ship_thrust_loop");
    }
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
    this.audio.preload = this.runtimeProfile.preloadMode;
    this.audio.volume = this.musicVolume;
    this.audio.addEventListener("ended", () => this._onAmbientEnded());
    this.combatAudio = new Audio();
    this.combatAudio.loop = false;
    this.combatAudio.preload = this.runtimeProfile.preloadMode;
    this.combatAudio.volume = 0;
    this.combatAudio.addEventListener("ended", () => this._onCombatEnded());
    this.victoryAudio = new Audio(victoryMusicUrl);
    this.victoryAudio.loop = false;
    this.victoryAudio.preload = this.runtimeProfile.preloadMode;
    this.victoryAudio.volume = 0;
    this.victoryAudio.addEventListener("ended", () => this._onVictoryEnded());
    this.thrustLoopRequested = false;
    this.thrustLoopAudible = false;
    this.thrustLoopTargetVolume = 0;
    this.thrustLoopSourceNode = null;
    this.thrustLoopGainNode = null;
    const thrustTemplateUrl = SFX_PLACEHOLDER_URLS.ship_thrust_loop;
    this.thrustLoopAudio = this.runtimeProfile.thrustLoopMode === "htmlAudio" ? new Audio(thrustTemplateUrl) : null;
    if (this.thrustLoopAudio) {
      this.thrustLoopAudio.loop = true;
      this.thrustLoopAudio.preload = this.runtimeProfile.preloadMode;
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
      const voiceCount = runtimeSfxPoolSize(this.runtimeProfile, typedPoolId);
      const voices = [];
      for (let i = 0; i < voiceCount; i++) {
        const el = new Audio(url);
        el.preload = this.runtimeProfile.preloadMode;
        voices.push(el);
      }
      this.sfxPools.set(typedId, { voices, next: 0 });
    }
    this._onFirstGesture = () => {
      this.audioUnlocked = true;
      this._detachGestureListeners();
      this._initWebAudioContext();
      this._preloadWebAudioSfx();
      if (this.runtimeProfile.thrustLoopMode === "webAudio") {
        this._ensureWebAudioBuffer("ship_thrust_loop");
      }
      this._playModeIfEnabled();
      if (!this.playbackBypassed && this.runtimeProfile.primeSfx) {
        this._primeSfx();
      }
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
   * @param {boolean} suspended
   * @returns {void}
   */
  _setWebAudioSuspended(suspended) {
    const ctx = this.webAudioCtx;
    if (!ctx) return;
    const target = suspended ? "suspended" : "running";
    if (ctx.state === target) return;
    const maybePromise = suspended ? ctx.suspend() : ctx.resume();
    if (maybePromise && typeof maybePromise.then === "function") {
      maybePromise.catch(() => {
      });
    }
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
    if (!this.runtimeProfile.preRenderPitchVariants) {
      return [baseBuffer];
    }
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
    if (this.playbackBypassed || !this.enabled || !this.audioUnlocked || document.hidden) return;
    this._playAudio(this.audio);
  }
  /**
   * @returns {void}
   */
  _playCombatIfEnabled() {
    if (this.playbackBypassed || !this.enabled || !this.audioUnlocked || document.hidden) return;
    this._playAudio(this.combatAudio);
  }
  /**
   * @returns {void}
   */
  _playVictoryIfEnabled() {
    if (this.playbackBypassed || !this.enabled || !this.audioUnlocked || document.hidden) return;
    this._playAudio(this.victoryAudio);
  }
  /**
   * @returns {void}
   */
  _playModeIfEnabled() {
    if (this.playbackBypassed || !this.enabled || !this.audioUnlocked || document.hidden) return;
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
   * @returns {void}
   */
  _stopAllSfxPlayback() {
    this.sfxPools.forEach((pool) => {
      for (const voice of pool.voices) {
        voice.pause();
        voice.currentTime = 0;
      }
    });
    this._stopWebAudioThrustLoop(true);
    if (this.thrustLoopAudio) {
      this._cancelFade(this.thrustLoopAudio);
      this.thrustLoopAudio.pause();
      this.thrustLoopAudio.currentTime = 0;
      this.thrustLoopAudio.volume = 0;
    }
    this.thrustLoopAudible = false;
  }
  /**
   * @param {boolean} immediate
   * @returns {void}
   */
  _stopWebAudioThrustLoop(immediate) {
    const source = this.thrustLoopSourceNode;
    const gain = this.thrustLoopGainNode;
    if (!source || !gain) {
      this.thrustLoopSourceNode = null;
      this.thrustLoopGainNode = null;
      this.thrustLoopTargetVolume = 0;
      return;
    }
    const ctx = this.webAudioCtx;
    const now = ctx ? ctx.currentTime : 0;
    try {
      gain.gain.cancelScheduledValues(now);
      if (immediate || !ctx) {
        gain.gain.value = 0;
        source.stop();
      } else {
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0, now + THRUST_LOOP_FADE_OUT_MS / 1e3);
        source.stop(now + THRUST_LOOP_FADE_OUT_MS / 1e3 + 0.05);
      }
    } catch (_err) {
      try {
        source.stop();
      } catch (_stopErr) {
      }
    }
    this.thrustLoopSourceNode = null;
    this.thrustLoopGainNode = null;
    this.thrustLoopTargetVolume = 0;
  }
  /**
   * @param {number} targetVolume
   * @returns {void}
   */
  _setWebAudioThrustGain(targetVolume) {
    const gain = this.thrustLoopGainNode;
    const ctx = this.webAudioCtx;
    if (!gain || !ctx) return;
    const clamped = Math.max(0, Math.min(1, targetVolume));
    if (Math.abs(clamped - this.thrustLoopTargetVolume) <= 1e-3) return;
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(clamped, now + 0.05);
    this.thrustLoopTargetVolume = clamped;
  }
  /**
   * @param {number} targetVolume
   * @returns {void}
   */
  _ensureWebAudioThrustLoop(targetVolume) {
    if (this.thrustLoopSourceNode && this.thrustLoopGainNode) {
      this._setWebAudioThrustGain(targetVolume);
      return;
    }
    const ctx = this._initWebAudioContext();
    if (!ctx) return;
    const buffer = this.webAudioBuffers.get("ship_thrust_loop") || null;
    if (!buffer) {
      this._ensureWebAudioBuffer("ship_thrust_loop");
      return;
    }
    try {
      if (ctx.state === "suspended") {
        const maybe = ctx.resume();
        if (maybe && typeof maybe.then === "function") {
          maybe.catch(() => {
          });
        }
      }
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      source.buffer = buffer;
      source.loop = true;
      gain.gain.value = 0;
      source.connect(gain);
      gain.connect(ctx.destination);
      source.onended = () => {
        if (this.thrustLoopSourceNode === source) {
          this.thrustLoopSourceNode = null;
          this.thrustLoopGainNode = null;
          this.thrustLoopTargetVolume = 0;
        }
        source.disconnect();
        gain.disconnect();
      };
      source.start(0);
      this.thrustLoopSourceNode = source;
      this.thrustLoopGainNode = gain;
      this.thrustLoopTargetVolume = 0;
      this._setWebAudioThrustGain(targetVolume);
    } catch (_err) {
      this.thrustLoopSourceNode = null;
      this.thrustLoopGainNode = null;
      this.thrustLoopTargetVolume = 0;
    }
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
    this._fadeAudio(this.audio, 0, this.musicCrossfadeMs, () => {
      this.audio.pause();
      this.audio.volume = this.musicVolume;
    });
    this._fadeAudio(this.victoryAudio, 0, this.musicCrossfadeMs, () => {
      this.victoryAudio.pause();
      this.victoryAudio.currentTime = 0;
    });
    this._fadeAudio(this.combatAudio, this.musicVolume, this.musicCrossfadeMs);
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
    this._fadeAudio(this.combatAudio, 0, this.musicCrossfadeMs, () => {
      this.combatAudio.pause();
      this.combatAudio.currentTime = 0;
    });
    this._fadeAudio(this.victoryAudio, 0, this.musicCrossfadeMs, () => {
      this.victoryAudio.pause();
      this.victoryAudio.currentTime = 0;
    });
    this._fadeAudio(this.audio, this.musicVolume, this.musicCrossfadeMs);
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
    this._fadeAudio(this.audio, 0, this.musicCrossfadeMs, () => {
      this.audio.pause();
      this.audio.volume = this.musicVolume;
    });
    this._fadeAudio(this.combatAudio, 0, this.musicCrossfadeMs, () => {
      this.combatAudio.pause();
      this.combatAudio.currentTime = 0;
    });
    this._fadeAudio(this.victoryAudio, this.musicVolume, this.musicCrossfadeMs);
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
    const shouldPlay = !this.playbackBypassed && this.sfxEnabled && this.thrustLoopRequested && !document.hidden;
    const targetVolume = Math.max(0, Math.min(1, this.sfxMasterVolume * THRUST_LOOP_GAIN));
    if (this.runtimeProfile.thrustLoopMode === "webAudio") {
      this.thrustLoopAudible = shouldPlay;
      if (shouldPlay) {
        this._ensureWebAudioThrustLoop(targetVolume);
      } else {
        this._stopWebAudioThrustLoop(false);
      }
      return;
    }
    if (!this.thrustLoopAudio) return;
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
    if (this.playbackBypassed) return;
    if (!this.runtimeProfile.primeSfx) return;
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
    if (this.playbackBypassed) {
      this.pendingSfx.length = 0;
      return;
    }
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
    if (this.playbackBypassed) return false;
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
      voice = /** @type {HTMLAudioElement} */
      pool.voices[pool.next];
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
   * @param {boolean} enabled
   * @returns {boolean}
   */
  setSfxEnabled(enabled) {
    this.sfxEnabled = !!enabled;
    if (!this.sfxEnabled) {
      this.pendingSfx.length = 0;
      this._stopAllSfxPlayback();
    } else {
      this._syncThrustLoopPlayback();
    }
    return this.sfxEnabled;
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
    this._persistSettings();
    return nextPercent;
  }
  /**
   * Step SFX master volume in 10% increments and apply immediately.
   * @param {number} direction Positive to increase, negative to decrease.
   * @returns {number} New volume in percent [0..100].
   */
  stepSfxVolume(direction) {
    const dir = (direction || 0) >= 0 ? 1 : -1;
    const stepPercent = 10;
    const currentPercent = Math.round(this.sfxMasterVolume * 100);
    const nextPercent = dir > 0 ? Math.min(100, (Math.floor(currentPercent / stepPercent) + 1) * stepPercent) : Math.max(0, (Math.ceil(currentPercent / stepPercent) - 1) * stepPercent);
    this.sfxMasterVolume = nextPercent / 100;
    this._syncThrustLoopPlayback();
    this._persistSettings();
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
   * @param {boolean} enabled
   * @returns {boolean}
   */
  setMusicEnabled(enabled) {
    this.enabled = !!enabled;
    if (this.enabled) {
      this._playModeIfEnabled();
    } else {
      this._cancelAllFades();
      this._pauseAllMusic();
    }
    return this.enabled;
  }
  /**
   * @param {boolean} bypassed
   * @returns {boolean}
   */
  setPlaybackBypassed(bypassed) {
    const next = !!bypassed;
    if (next === this.playbackBypassed) return this.playbackBypassed;
    this.playbackBypassed = next;
    if (this.playbackBypassed) {
      this._setWebAudioSuspended(true);
      this._cancelAllFades();
      this._pauseAllMusic();
      this.pendingSfx.length = 0;
      this._stopAllSfxPlayback();
      return this.playbackBypassed;
    }
    this._setWebAudioSuspended(false);
    this._playModeIfEnabled();
    this._syncThrustLoopPlayback();
    return this.playbackBypassed;
  }
  /**
   * @returns {boolean}
   */
  isPlaybackBypassed() {
    return this.playbackBypassed;
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
  /**
   * @returns {void}
   */
  _persistSettings() {
    saveAudioSettings({
      version: AUDIO_SETTINGS_VERSION,
      musicVolume: this.musicVolume,
      sfxMasterVolume: this.sfxMasterVolume
    });
  }
}
function saveAudioSettings(settings) {
  try {
    localStorage.setItem(AUDIO_SETTINGS_STORAGE_KEY, JSON.stringify({
      version: AUDIO_SETTINGS_VERSION,
      musicVolume: clampUnit(settings.musicVolume),
      sfxMasterVolume: clampUnit(settings.sfxMasterVolume)
    }));
  } catch (_err) {
  }
}
function loadAudioSettings() {
  try {
    const raw = localStorage.getItem(AUDIO_SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      localStorage.removeItem(AUDIO_SETTINGS_STORAGE_KEY);
      return null;
    }
    if ((parsed.version | 0) !== AUDIO_SETTINGS_VERSION) {
      localStorage.removeItem(AUDIO_SETTINGS_STORAGE_KEY);
      return null;
    }
    if (!Number.isFinite(parsed.musicVolume) || !Number.isFinite(parsed.sfxMasterVolume)) {
      localStorage.removeItem(AUDIO_SETTINGS_STORAGE_KEY);
      return null;
    }
    return {
      version: AUDIO_SETTINGS_VERSION,
      musicVolume: clampUnit(parsed.musicVolume),
      sfxMasterVolume: clampUnit(parsed.sfxMasterVolume)
    };
  } catch (_err) {
    try {
      localStorage.removeItem(AUDIO_SETTINGS_STORAGE_KEY);
    } catch {
    }
    return null;
  }
}
function clampUnit(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}
const HELP_STYLE_ID = "help-popup-style";
const HELP_CONTENT = `
  <section class="help-section">
    <h3>Mission Brief</h3>
    <div class="help-grid">
      <div class="help-k">Your Job</div><div class="help-v">Fly a dropship down to hostile planets, locate survivors, and return them safely to the mothership in orbit.</div>
      <div class="help-k">Mothership</div><div class="help-v">The mothership is your mobile base in orbit. Landing there repairs and resupplies your dropship, stores rescued crew, and is where runs are reset, missions completed, and dropships upgraded.</div>
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
      <div class="help-k">Adjust Zoom</div><div class="help-v"><span class="help-chip">Mouse Wheel</span> adjusts zoom multiplier on top of auto framing.</div>
      <div class="help-k">Reset Zoom</div><div class="help-v"><span class="help-chip">0</span> returns zoom to <span class="help-chip">1.00x</span> auto.</div>
      <div class="help-k">Restart / Upgrade / Level up</div><div class="help-v"><span class="help-chip">R</span>, hold <span class="help-chip">Shift+R</span> 1s abandon run</div>
      <div class="help-k">Open / Close Help</div><div class="help-v"><span class="help-chip">/</span> <span class="help-chip">?</span> (close also with <span class="help-chip">Esc</span>)</div>
      <div class="help-k">Music</div><div class="help-v"><span class="help-chip">M</span>/<span class="help-chip">B</span> mute toggle, <span class="help-chip">J</span> combat tracks toggle, <span class="help-chip">-</span>/<span class="help-chip">=</span> volume</div>
      <div class="help-k">FX audio</div><div class="help-v"><span class="help-chip">Shift+-</span>/<span class="help-chip">Shift+=</span> volume</div>
    </div>
  </section>
  <section class="help-section">
    <h3>Touch & Gamepad</h3>
    <div class="help-grid">
      <div class="help-k">Touch Movement</div><div class="help-v">Left circular pad (lower-left): drag for strafe + thrust/down.</div>
      <div class="help-k">Touch Aim / Fire</div><div class="help-v">Right diamond (lower-right): drag to aim, hold to fire.</div>
      <div class="help-k">Touch Bomb</div><div class="help-v">Right square (upper-right): drag + release to throw bomb.</div>
      <div class="help-k">Touch Play</div><div class="help-v">Large play circle (upper-left area): appears for context actions (new dropship, upgrades, scanner, next level).</div>
      <div class="help-k">Touch Restart</div><div class="help-v">Small <span class="help-chip">↻</span> button next to <span class="help-chip">?</span>: hold 1s to restart run during active play.</div>
      <div class="help-k">Touch Help</div><div class="help-v">Small circled <span class="help-chip">?</span> button in upper-left.</div>
      <div class="help-k">Gamepad Move</div><div class="help-v">Left stick (analog thrust vector).</div>
      <div class="help-k">Gamepad Aim</div><div class="help-v">Right stick.</div>
      <div class="help-k">Gamepad Inputs</div><div class="help-v"><span class="help-chip">Left Stick</span> analog thrust vector, <span class="help-chip">D-pad</span> left/right/up/down digital thrust, <span class="help-chip">B</span> down, <span class="help-chip">LB</span>/<span class="help-chip">LT</span> bomb, <span class="help-chip">RB</span>/<span class="help-chip">RT</span> laser (hold for autofire), <span class="help-chip">A/Button0</span> restart/upgrade/level, <span class="help-chip">Start</span> hold 1s abandon run, <span class="help-chip">Y/Button3</span> help, <span class="help-chip">RT/LT</span>, both sticks, or <span class="help-chip">D-pad Up/Down</span> scroll help.</div>
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
      <div class="help-legend-item"><span class="help-glyph help-glyph-hud"></span><div><b>Status labels</b><span>Top-left: hull/bombs. Top-center: signal meter. Bottom-left: objective + prompts. Bottom-right: planet/level. Bottom-center: heat meter when active.</span></div></div>
    </div>
  </section>
  <section class="help-section">
    <h3>Audio Credits</h3>
    <div class="help-v">
      Luke.RUSTLTD, brandon75689, cynicmusic, pauliuw, Michel Baradari, Ogrebane, remaxim, ycake, Blender Foundation, Matthew Pablo, Q009, qubodup, yd, Musheran, GreyFrogGames.
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
      const leftY = this._gamepadAxisValue((pad.axes && pad.axes.length > 1 ? pad.axes[1] : 0) ?? 0);
      const rightY = this._gamepadAxisValue((pad.axes && pad.axes.length > 3 ? pad.axes[3] : 0) ?? 0);
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
const signalMeter = (
  /** @type {HTMLElement} */
  document.getElementById("signal-meter")
);
const heatMeter = (
  /** @type {HTMLElement} */
  document.getElementById("heat-meter")
);
const renderer = new Renderer(canvas, GAME);
const input = new Input(canvas);
const bgm = new BackgroundMusic({ volume: 0.35 });
if (PERF_FLAGS.disableAudioPlayback) {
  bgm.setPlaybackBypassed(true);
} else {
  if (PERF_FLAGS.disableMusicPlayback) {
    bgm.setMusicEnabled(false);
  }
  if (PERF_FLAGS.disableSfxPlayback) {
    bgm.setSfxEnabled(false);
  }
}
const helpPopup = new HelpPopup({
  onToggle: (open) => input.setModalOpen(open)
});
const loop = new GameLoop({
  renderer,
  input,
  audio: (
    /** @type {{toggleMuted?:()=>boolean,toggleCombatMusicEnabled?:()=>boolean,stepMusicVolume?:(direction:number)=>number,stepSfxVolume?:(direction:number)=>number,setCombatActive?:(active:boolean)=>boolean,triggerCombatImmediate?:()=>boolean,triggerVictoryMusic?:()=>boolean,returnToAmbient?:(withFade?:boolean)=>void,playSfx?:(id:string,opts?:{volume?:number,rate?:number})=>boolean,setThrustLoopActive?:(active:boolean)=>boolean,isPlaybackBypassed?:()=>boolean,setPlaybackBypassed?:(bypassed:boolean)=>boolean}} */
    bgm
  ),
  ui: { updateHud, updatePlanetLabel, updateObjectiveLabel, updateShipStatusLabel, updateSignalMeter, updateHeatMeter },
  canvas,
  overlay: (
    /** @type {HTMLCanvasElement} */
    document.getElementById("overlay")
  ),
  hud,
  planetLabel,
  objectiveLabel,
  shipStatusLabel,
  signalMeter,
  heatMeter,
  helpPopup
});
if (!BENCH_CONFIG.enabled) {
  loadGameFromStorage(loop);
  installExitSaveHandlers(loop);
}
loop.start();
