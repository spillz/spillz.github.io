const canvas = document.getElementById("garden");
const ctx = canvas.getContext("2d");
const musicToggle = document.getElementById("music-toggle");
const envelopeCover = document.getElementById("envelope-cover");

const GROWTH_SECONDS = 82;
const MESSAGE_START_SECONDS = 42;
const SUNSET_SECONDS = 96;
const BRANCH_LIMIT = 280;
const LEAF_LIMIT = 1680;
const FLOWER_LIMIT = 240;
const MESSAGE_PETAL_LIMIT = 3000;

let width = 0;
let height = 0;
let dpr = 1;
let soilY = 0;
let startTime = 0;
let animationStarted = false;
let branches = [];
let leaves = [];
let buds = [];
let clouds = [];
let messagePetals = [];
let messageTextLines = [];

function mulberry32(seed) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function smooth(value) {
  const x = clamp(value, 0, 1);
  return x * x * (3 - 2 * x);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function colorMix(a, b, t) {
  const r = Math.round(lerp(a[0], b[0], t));
  const g = Math.round(lerp(a[1], b[1], t));
  const blue = Math.round(lerp(a[2], b[2], t));
  return `rgb(${r}, ${g}, ${blue})`;
}

function angleDelta(from, to) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

function branchPoint(branch, u) {
  const inv = 1 - u;
  return {
    x: inv * inv * branch.x + 2 * inv * u * branch.controlX + u * u * branch.endX,
    y: inv * inv * branch.y + 2 * inv * u * branch.controlY + u * u * branch.endY,
  };
}

function branchTangent(branch, u) {
  const dx = 2 * (1 - u) * (branch.controlX - branch.x) + 2 * u * (branch.endX - branch.controlX);
  const dy = 2 * (1 - u) * (branch.controlY - branch.y) + 2 * u * (branch.endY - branch.controlY);
  return Math.atan2(dy, dx);
}

function makeBranch(parent, x, y, angle, length, depth, birth, random, role = "branch") {
  const scale = Math.min(width, height);
  const vectorX = Math.cos(angle) * length * scale;
  const vectorY = Math.sin(angle) * length * scale;
  const bendX = Math.cos(angle + Math.PI / 2) * lerp(-0.024, 0.024, random());
  const bendY = lerp(-0.035, 0.018, random());
  const branch = {
    x,
    y,
    angle,
    length,
    depth,
    birth,
    duration: lerp(3.5, 6.4, random()) * Math.max(0.52, length / 0.22),
    width: Math.max(1.3, lerp(2.1, 12, Math.pow(0.78, depth))),
    vectorX,
    vectorY,
    endX: x + vectorX,
    endY: y + vectorY,
    controlX: x + vectorX * 0.45 + bendX * scale,
    controlY: y + vectorY * 0.45 + bendY * scale,
    bendX,
    bendY,
    hueShift: lerp(-10, 16, random()),
    role,
    parent,
  };
  branches.push(branch);
  return branch;
}

function createSpreadMap() {
  return {
    cols: 15,
    rows: 10,
    cells: new Array(15 * 10).fill(0),
  };
}

function spreadCell(map, x, y) {
  const col = clamp(Math.floor((x / width) * map.cols), 0, map.cols - 1);
  const row = clamp(Math.floor((y / soilY) * map.rows), 0, map.rows - 1);
  return row * map.cols + col;
}

function readSpread(map, x, y) {
  const col = clamp(Math.floor((x / width) * map.cols), 0, map.cols - 1);
  const row = clamp(Math.floor((y / soilY) * map.rows), 0, map.rows - 1);
  let total = 0;
  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      const cx = col + dx;
      const cy = row + dy;
      if (cx >= 0 && cx < map.cols && cy >= 0 && cy < map.rows) {
        total += map.cells[cy * map.cols + cx] * (dx === 0 && dy === 0 ? 1 : 0.45);
      }
    }
  }
  return total;
}

function registerBranchSpace(map, branch) {
  for (let u = 0.35; u <= 1.001; u += 0.32) {
    const point = branchPoint(branch, u);
    map.cells[spreadCell(map, point.x, point.y)] += branch.depth < 2 ? 1.8 : 1;
  }
}

function scoreCandidate(map, x, y, angle, length, depth) {
  const scale = Math.min(width, height);
  const endX = x + Math.cos(angle) * length * scale;
  const endY = y + Math.sin(angle) * length * scale;
  const midX = lerp(x, endX, 0.62);
  const midY = lerp(y, endY, 0.62);
  const canopyTop = height * 0.08;
  const canopyBottom = soilY - height * 0.05;
  const centerBias = Math.abs(endX / width - 0.5);
  let score = readSpread(map, endX, endY) * 3.2 + readSpread(map, midX, midY) * 1.4;

  if (endX < width * 0.035 || endX > width * 0.965) {
    score += 9;
  }
  if (endY < canopyTop || endY > canopyBottom) {
    score += 8;
  }
  if (depth < 4) {
    score -= centerBias * 4.8;
  }
  score += Math.max(0, Math.sin(angle)) * 7;
  score += Math.abs(angle + Math.PI / 2) < 0.2 ? 1.8 : 0;
  return score;
}

function chooseChildCandidate(map, branch, random, u) {
  const point = branchPoint(branch, u);
  const attempts = branch.depth < 2 ? 9 : 6;
  let best = null;

  for (let i = 0; i < attempts; i += 1) {
    const direction = i % 2 === 0 ? -1 : 1;
    const spread = lerp(0.5, 1.45, random()) * direction;
    const outward = point.x < width * 0.5 ? -0.35 : 0.35;
    const upwardPull = -Math.PI / 2 + outward;
    const inherited = branch.angle + spread;
    const angle = lerp(inherited, upwardPull + lerp(-1.7, 1.7, random()), 0.28);
    const length = branch.length * lerp(0.62, 0.92, random()) * (branch.depth < 2 ? 1.18 : 1);
    const score = scoreCandidate(map, point.x, point.y, angle, length, branch.depth + 1);

    if (!best || score < best.score) {
      best = { point, angle, length, score };
    }
  }

  return best;
}

function leafColor(random) {
  return random() < 0.5 ? "#2f8f47" : random() < 0.78 ? "#4aaa52" : "#7ac45a";
}

function addLeaf(branch, random, u, options = {}) {
  if (leaves.length >= LEAF_LIMIT) {
    return false;
  }

  const minSize = options.minSize || 18;
  const maxSize = options.maxSize || 42;
  const sizeScale = options.sizeScale || 1;
  const branchDelay = branch.role === "twig" ? 1.65 : 2.8;
  const birthDelay = options.birthDelay === undefined ? lerp(0.22, branchDelay, random()) : options.birthDelay;
  leaves.push({
    branch,
    u,
    side: options.side || (random() < 0.5 ? -1 : 1),
    size: lerp(minSize, maxSize, random()) * Math.max(0.72, 1.15 - branch.depth * 0.045) * sizeScale,
    tilt: lerp(-0.75, 0.75, random()),
    curl: lerp(-0.34, 0.34, random()),
    stem: lerp(0.1, 0.24, random()),
    birth: branch.birth + branch.duration * u + birthDelay,
    color: leafColor(random),
  });
  return true;
}

function addBud(branch, random, u = lerp(0.78, 1, random())) {
  if (buds.length >= FLOWER_LIMIT) {
    return false;
  }

  const hue = lerp(327, 350, random());
  buds.push({
    branch,
    u,
    size: lerp(24, 46, random()) * Math.max(0.72, 1.12 - branch.depth * 0.035),
    birth: branch.birth + branch.duration + lerp(3.2, 10.5, random()),
    hue,
    rotation: random() * Math.PI * 2,
    lean: lerp(-0.28, 0.28, random()),
    cup: lerp(0.82, 1.18, random()),
  });
  return true;
}

function addFoliage(branch, random) {
  const leafCount = clamp(Math.round(branch.length * 12 + (7 - branch.depth) * 0.55), branch.depth > 4 ? 2 : 1, branch.role === "twig" ? 7 : 6);
  for (let i = 0; i < leafCount && leaves.length < LEAF_LIMIT; i += 1) {
    const u = lerp(0.18, 0.98, (i + random() * 0.8) / leafCount);
    addLeaf(branch, random, u);
  }

  if (branch.depth >= 2 && buds.length < FLOWER_LIMIT && (branch.role === "twig" ? random() > 0.38 : random() > 0.76)) {
    addBud(branch, random);
  }
}

function dressSparseGrowth(random) {
  const leafCounts = new Map();
  const childCounts = new Map();

  for (const branch of branches) {
    leafCounts.set(branch, 0);
    childCounts.set(branch, 0);
  }
  for (const leaf of leaves) {
    leafCounts.set(leaf.branch, (leafCounts.get(leaf.branch) || 0) + 1);
  }
  for (const branch of branches) {
    if (branch.parent) {
      childCounts.set(branch.parent, (childCounts.get(branch.parent) || 0) + 1);
    }
  }

  for (const branch of branches) {
    if (branch.role === "trunk") {
      continue;
    }

    const isTerminal = (childCounts.get(branch) || 0) === 0;
    const baseLeaves = branch.depth > 4 || isTerminal ? 3 : 2;
    let count = leafCounts.get(branch) || 0;
    let added = 0;

    while (count < baseLeaves && leaves.length < LEAF_LIMIT) {
      const step = baseLeaves <= 1 ? 1 : added / (baseLeaves - 1);
      const u = clamp(lerp(0.34, 0.95, step + random() * 0.16), 0.28, 0.98);
      addLeaf(branch, random, u, {
        side: added % 2 === 0 ? -1 : 1,
        birthDelay: lerp(0.1, branch.role === "twig" ? 1.1 : 1.6, random()),
      });
      count += 1;
      added += 1;
    }
    leafCounts.set(branch, count);
  }

  const dressedBranches = branches.slice().sort((a, b) => {
    const ay = branchPoint(a, 0.86).y;
    const by = branchPoint(b, 0.86).y;
    return ay - by || b.depth - a.depth;
  });

  for (const branch of dressedBranches) {
    if (branch.role === "trunk") {
      continue;
    }

    const tip = branchPoint(branch, 0.92);
    const isTopCanopy = tip.y < soilY * 0.56;
    const isTerminal = (childCounts.get(branch) || 0) === 0;
    const targetLeaves = clamp(
      2 + (branch.depth > 2 ? 1 : 0) + (branch.depth > 4 ? 1 : 0) + (isTerminal ? 2 : 0) + (isTopCanopy ? 2 : 0),
      2,
      8,
    );
    let count = leafCounts.get(branch) || 0;
    let added = 0;

    while (count < targetLeaves && leaves.length < LEAF_LIMIT) {
      const step = targetLeaves <= 1 ? 1 : added / (targetLeaves - 1);
      const u = clamp(lerp(0.42, 0.99, step + random() * 0.18), 0.36, 0.995);
      const side = added % 2 === 0 ? -1 : 1;
      const topScale = isTopCanopy || isTerminal ? 1.08 : 1;
      addLeaf(branch, random, u, {
        side,
        sizeScale: topScale,
        birthDelay: lerp(0.12, branch.role === "twig" ? 1.35 : 1.95, random()),
      });
      count += 1;
      added += 1;
    }
  }

  const buddedBranches = new Set(buds.map((bud) => bud.branch));
  for (const branch of dressedBranches) {
    if (branch.depth < 3 || buds.length >= FLOWER_LIMIT || buddedBranches.has(branch)) {
      continue;
    }

    const tip = branchPoint(branch, 0.9);
    const isTopCanopy = tip.y < soilY * 0.58;
    const isTerminal = (childCounts.get(branch) || 0) === 0;
    if ((isTerminal && random() > 0.16) || (isTopCanopy && random() > 0.42)) {
      addBud(branch, random, lerp(0.84, 1, random()));
      buddedBranches.add(branch);
    }
  }
}

function generateGrowth() {
  const random = mulberry32(20260510);
  branches = [];
  leaves = [];
  buds = [];
  clouds = [];

  soilY = height * 0.67;
  const baseX = width * 0.5;
  const baseY = soilY + height * 0.012;
  const trunk = makeBranch(null, baseX, baseY, -Math.PI / 2 - 0.03, 0.23, 0, -2.5, random, "trunk");
  const spreadMap = createSpreadMap();
  registerBranchSpace(spreadMap, trunk);

  const queue = [trunk];
  const leaderAngles = [-2.92, -2.45, -2.02, -1.66, -1.25, -0.82, -0.3];

  for (let i = 0; i < leaderAngles.length; i += 1) {
    const u = lerp(0.28, 0.96, i / (leaderAngles.length - 1));
    const start = branchPoint(trunk, u);
    const branch = makeBranch(
      trunk,
      start.x,
      start.y,
      leaderAngles[i] + lerp(-0.1, 0.1, random()),
      lerp(0.27, 0.44, random()) * (i === 0 || i === leaderAngles.length - 1 ? 1.18 : 1),
      1,
      trunk.birth + trunk.duration * u + lerp(0.8, 2.4, random()),
      random,
      "leader",
    );
    registerBranchSpace(spreadMap, branch);
    queue.push(branch);
  }

  for (let index = 0; index < queue.length && branches.length < BRANCH_LIMIT; index += 1) {
    const branch = queue[index];
    addFoliage(branch, random);
    if (branch.depth >= 7) {
      continue;
    }

    const childCount = branch.depth < 2 ? 3 : branch.depth < 5 ? 2 : 1;
    for (let i = 0; i < childCount && branches.length < BRANCH_LIMIT; i += 1) {
      const u = lerp(0.34, 0.95, (i + random() * 0.7) / childCount);
      const candidate = chooseChildCandidate(spreadMap, branch, random, u);
      const child = makeBranch(
        branch,
        candidate.point.x,
        candidate.point.y,
        candidate.angle,
        candidate.length,
        branch.depth + 1,
        branch.birth + branch.duration * u + lerp(0.8, 2.9, random()),
        random,
        branch.depth > 4 ? "twig" : "branch",
      );
      registerBranchSpace(spreadMap, child);
      queue.push(child);
    }
  }

  dressSparseGrowth(random);

  for (let i = 0; i < 10; i += 1) {
    clouds.push({
      x: random() * width,
      y: height * lerp(0.055, 0.28, random()),
      scale: lerp(0.78, 1.75, random()),
      speed: lerp(2, 9, random()),
      phase: random() * Math.PI * 2,
    });
  }

  buds.sort((a, b) => branchPoint(a.branch, a.u).y - branchPoint(b.branch, b.u).y);
}

function generatePetalMessage() {
  const random = mulberry32(20260616 + Math.round(width) * 3 + Math.round(height));
  const groundHeight = height - soilY;
  const textCanvas = document.createElement("canvas");
  const textCtx = textCanvas.getContext("2d", { willReadFrequently: true });
  const pixelWidth = Math.round(width);
  const pixelHeight = Math.round(groundHeight);
  const titleSize = clamp(width / 16.5, 27, 70);
  const bodySize = clamp(width / 24, 20, 48);
  const lines = [
    { text: "Happy Mother's Day 2026, Nanna J.", size: titleSize, weight: 700 },
    { text: "With love from Henry, Evan, Thomas, Sammi and Damien", size: bodySize, weight: 700 },
  ];
  const lineGap = Math.max(8, groundHeight * 0.055);
  const totalTextHeight = titleSize + bodySize + lineGap;
  let y = Math.max(titleSize + 10, groundHeight * 0.24 + titleSize * 0.5);

  textCanvas.width = pixelWidth;
  textCanvas.height = pixelHeight;
  textCtx.clearRect(0, 0, pixelWidth, pixelHeight);
  textCtx.textAlign = "center";
  textCtx.textBaseline = "middle";
  textCtx.fillStyle = "#000";
  if (y + totalTextHeight > groundHeight - 18) {
    y = Math.max(titleSize, (groundHeight - totalTextHeight) * 0.5 + titleSize * 0.5);
  }

  messageTextLines = [];
  for (const line of lines) {
    textCtx.font = `${line.weight} ${line.size}px Georgia Bold, "Times New Roman", serif`;
    textCtx.fillText(line.text, pixelWidth * 0.5, y, pixelWidth * 0.94);
    messageTextLines.push({
      ...line,
      x: pixelWidth * 0.5,
      y: soilY + y,
      maxWidth: pixelWidth * 0.94,
    });
    y += line.size * 0.9 + lineGap;
  }

  const image = textCtx.getImageData(0, 0, pixelWidth, pixelHeight).data;
  const candidates = [];
  const sampleStep = 2;
  const alphaAt = (px, py) => {
    const x = clamp(Math.round(px), 0, pixelWidth - 1);
    const ySample = clamp(Math.round(py), 0, pixelHeight - 1);
    return image[(ySample * pixelWidth + x) * 4 + 3];
  };
  const orientationAt = (px, py) => {
    let bestAngle = 0;
    let bestScore = -1;
    const maxDistance = clamp(Math.max(titleSize, bodySize) * 0.46, 10, 24);
    const angleCount = 32;

    for (let i = 0; i < angleCount; i += 1) {
      const angle = (i / angleCount) * Math.PI;
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);
      let score = 0;
      let run = 0;

      for (let direction = -1; direction <= 1; direction += 2) {
        let missed = 0;
        for (let distance = 1; distance <= maxDistance; distance += 1) {
          const alpha = alphaAt(px + dx * distance * direction, py + dy * distance * direction);
          if (alpha > 72) {
            run += 1;
            score += alpha / 255;
            missed = 0;
          } else {
            missed += 1;
            if (missed > 1) {
              break;
            }
          }
        }
      }

      score += run * 0.65;
      if (score > bestScore) {
        bestScore = score;
        bestAngle = angle;
      }
    }

    return bestAngle;
  };

  for (let py = 0; py < pixelHeight; py += sampleStep) {
    for (let px = 0; px < pixelWidth; px += sampleStep) {
      const alpha = alphaAt(px, py);
      if (alpha > 72) {
        candidates.push({ x: px, y: py, alpha, targetAngle: orientationAt(px, py) });
      }
    }
  }

  const selected = selectEvenMaskPoints(candidates, Math.min(MESSAGE_PETAL_LIMIT, candidates.length), pixelWidth, pixelHeight);

  const flowerSources = buds.map((bud) => {
    const point = branchPoint(bud.branch, bud.u);
    return {
      x: point.x,
      y: point.y,
      radius: bud.size * 0.8,
      angle: branchTangent(bud.branch, bud.u) + Math.PI / 2,
      matureAt: bud.birth + 8,
    };
  });
  const fallbackSource = { x: width * 0.5, y: soilY - height * 0.32, radius: 36, angle: -Math.PI / 2, matureAt: MESSAGE_START_SECONDS };
  const sourceUseCounts = new Array(Math.max(1, flowerSources.length)).fill(0);

  messagePetals = selected.map((point, index) => {
    const sourceIndex = flowerSources.length > 0 ? index % flowerSources.length : 0;
    const source = flowerSources.length > 0 ? flowerSources[sourceIndex] : fallbackSource;
    const sourceCount = sourceUseCounts[sourceIndex];
    sourceUseCounts[sourceIndex] += 1;
    const sourceAngle = sourceCount * 2.399963229728653 + sourceIndex * 0.37;
    const sourceRadius = source.radius * Math.sqrt(((sourceCount * 0.61803398875) % 1) * 0.86 + 0.08);
    const targetX = point.x + lerp(-0.45, 0.45, random());
    const targetY = soilY + point.y + lerp(-0.4, 0.4, random());
    return {
      targetX,
      targetY,
      startX: source.x + Math.cos(sourceAngle) * sourceRadius,
      startY: source.y + Math.sin(sourceAngle) * sourceRadius,
      startAngle: source.angle + lerp(-1.5, 1.5, random()),
      targetAngle: point.targetAngle,
      delay: Math.max(MESSAGE_START_SECONDS + lerp(0, 9, random()), source.matureAt + lerp(0, 5, random())),
      duration: lerp(9.6, 19.2, random()),
      size: lerp(2, 3.6, random()) * (width < 520 ? 0.82 : 1),
      hue: lerp(325, 350, random()),
      phase: random() * Math.PI * 2,
    };
  });
}

function selectEvenMaskPoints(candidates, count, pixelWidth, pixelHeight) {
  if (count <= 0 || candidates.length === 0) {
    return [];
  }
  if (count >= candidates.length) {
    return candidates.slice();
  }

  const selected = [];
  const taken = new Uint8Array(candidates.length);
  const nearest = new Float32Array(candidates.length);
  nearest.fill(Number.POSITIVE_INFINITY);

  const seedIndex = candidates.reduce((best, candidate, index) => (candidate.alpha > candidates[best].alpha ? index : best), 0);
  let currentIndex = seedIndex;

  for (let selectedCount = 0; selectedCount < count; selectedCount += 1) {
    const current = candidates[currentIndex];
    selected.push(current);
    taken[currentIndex] = 1;

    let farthestIndex = -1;
    let farthestScore = -1;
    for (let i = 0; i < candidates.length; i += 1) {
      if (taken[i]) {
        continue;
      }

      const candidate = candidates[i];
      const dx = (candidate.x - current.x) / pixelWidth;
      const dy = (candidate.y - current.y) / pixelHeight;
      const distance = dx * dx + dy * dy;
      if (distance < nearest[i]) {
        nearest[i] = distance;
      }

      const edgePreference = 0.82 + (candidate.alpha / 255) * 0.18;
      const score = nearest[i] * edgePreference;
      if (score > farthestScore) {
        farthestScore = score;
        farthestIndex = i;
      }
    }

    if (farthestIndex < 0) {
      break;
    }
    currentIndex = farthestIndex;
  }

  return selected;
}

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = Math.max(320, window.innerWidth);
  height = Math.max(360, window.innerHeight);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  generateGrowth();
  generatePetalMessage();
}

function drawSky(time) {
  const sunset = smooth(time / SUNSET_SECONDS);
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, colorMix([107, 188, 241], [244, 122, 104], sunset));
  gradient.addColorStop(0.5, colorMix([167, 220, 245], [247, 161, 112], sunset));
  gradient.addColorStop(1, colorMix([217, 242, 251], [252, 201, 145], sunset));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  drawSun(sunset);

  for (const cloud of clouds) {
    const x = (cloud.x + time * cloud.speed) % (width + 260) - 130;
    const y = cloud.y + Math.sin(time * 0.22 + cloud.phase) * 5;
    drawCloud(x, y, cloud.scale);
  }
}

function drawSun(sunset) {
  const x = lerp(width * 0.86, width * 0.66, sunset);
  const y = lerp(height * 0.12, soilY - height * 0.06, sunset);
  const radius = clamp(Math.min(width, height) * lerp(0.052, 0.072, sunset), 26, 62);
  const glow = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius * 3.2);
  glow.addColorStop(0, `rgba(255, ${Math.round(235 - sunset * 55)}, 116, 0.72)`);
  glow.addColorStop(0.38, `rgba(255, ${Math.round(192 - sunset * 42)}, 91, 0.24)`);
  glow.addColorStop(1, "rgba(255, 140, 80, 0)");

  ctx.save();
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, radius * 3.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = colorMix([255, 245, 149], [255, 114, 84], sunset);
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCloud(x, y, scale) {
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "#ffffff";
  const puffs = [
    [-58, 6, 27],
    [-42, 20, 24],
    [-22, -9, 42],
    [18, -14, 50],
    [55, -1, 34],
    [66, 19, 23],
    [12, 14, 48],
    [-12, 26, 31],
    [34, 25, 36],
  ];
  for (const [px, py, radius] of puffs) {
    ctx.beginPath();
    ctx.arc(x + px * scale, y + py * scale, radius * scale, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = "#77a7c5";
  ctx.beginPath();
  ctx.ellipse(x + 12 * scale, y + 31 * scale, 82 * scale, 14 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSoil() {
  const gradient = ctx.createLinearGradient(0, soilY, 0, height);
  gradient.addColorStop(0, "#8a5730");
  gradient.addColorStop(0.5, "#6b3f25");
  gradient.addColorStop(1, "#432918");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(0, soilY);
  for (let x = 0; x <= width; x += 48) {
    const y = soilY + Math.sin(x * 0.018) * 6 + Math.cos(x * 0.031) * 3;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 0.26;
  ctx.fillStyle = "#2f1c12";
  for (let x = 18; x < width; x += 39) {
    const y = soilY + 20 + ((x * 17) % Math.max(70, height - soilY - 20));
    ctx.beginPath();
    ctx.ellipse(x, y, 2.8 + (x % 5), 1.5 + (x % 3), 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawBranch(branch, time) {
  const progress = smooth((time - branch.birth) / branch.duration);
  if (progress <= 0) {
    return;
  }

  const scale = Math.min(width, height);
  const end = branchPoint(branch, progress);
  const control = branchPoint(branch, progress * 0.48);
  const stemGreen = branch.depth > 2 ? `hsl(${118 + branch.hueShift}, 36%, ${24 + branch.depth * 2}%)` : "#6f4b2a";

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = stemGreen;
  ctx.lineWidth = Math.max(0.85, branch.width * (1 - branch.depth * 0.055));
  ctx.beginPath();
  ctx.moveTo(branch.x, branch.y);
  ctx.quadraticCurveTo(control.x + branch.bendX * scale * 0.4, control.y + branch.bendY * scale * 0.4, end.x, end.y);
  ctx.stroke();

  if (branch.depth < 3) {
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = "#f3d7a9";
    ctx.lineWidth = Math.max(0.6, branch.width * 0.16);
    ctx.beginPath();
    ctx.moveTo(branch.x - 1, branch.y);
    ctx.quadraticCurveTo(control.x, control.y, end.x, end.y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawLeaf(leaf, time) {
  if (time < leaf.birth) {
    return;
  }
  const branchProgress = smooth((time - leaf.branch.birth) / leaf.branch.duration);
  if (branchProgress < leaf.u) {
    return;
  }

  const progress = smooth((time - leaf.birth) / 8);
  const point = branchPoint(leaf.branch, leaf.u);
  const stemAngle = branchTangent(leaf.branch, leaf.u) + leaf.side * (Math.PI * 0.5 + leaf.tilt * 0.22);
  const leafAngle = stemAngle + leaf.side * (0.24 + leaf.curl * progress);
  const size = leaf.size * lerp(0.15, 1, progress);
  const stemLength = size * leaf.stem;

  ctx.save();
  ctx.translate(point.x, point.y);
  ctx.rotate(stemAngle);
  ctx.strokeStyle = "rgba(38, 103, 37, 0.58)";
  ctx.lineWidth = Math.max(0.7, size * 0.035);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(stemLength * 0.45, leaf.side * size * 0.035, stemLength, 0);
  ctx.stroke();
  ctx.translate(stemLength, 0);
  ctx.rotate(leafAngle - stemAngle);
  ctx.fillStyle = leaf.color;
  ctx.strokeStyle = "rgba(20, 80, 33, 0.32)";
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(size * 0.26, -size * 0.3, size * 0.78, -size * 0.2, size * 1.02, 0);
  ctx.bezierCurveTo(size * 0.72, size * 0.3, size * 0.25, size * 0.24, 0, 0);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.42, leaf.curl * size * 0.08, size * 0.94, 0);
  ctx.strokeStyle = "rgba(236, 255, 211, 0.28)";
  ctx.stroke();
  ctx.restore();
}

function drawBud(bud, time) {
  if (time < bud.birth - 8) {
    return;
  }
  const branchProgress = smooth((time - bud.branch.birth) / bud.branch.duration);
  if (branchProgress < bud.u) {
    return;
  }

  const point = branchPoint(bud.branch, bud.u);
  const angle = branchTangent(bud.branch, bud.u);
  const emerge = smooth((time - (bud.birth - 8)) / 8);
  const open = smooth((time - (bud.birth - 2)) / 9);
  const sphere = smooth((time - (bud.birth + 7)) / 10);
  const petals = smooth((time - (bud.birth + 13)) / 18);
  const size = bud.size * lerp(0.42, 1, emerge);
  const openAngle = lerp(0.06, 1.34, open);
  const bloomRadius = size * lerp(0.06, 0.34, sphere);
  const bloomY = -size * lerp(0.16, 0.03, sphere);

  ctx.save();
  ctx.translate(point.x, point.y);
  ctx.rotate(angle + Math.PI / 2 + bud.lean * petals);

  const shellFall = smooth(clamp((sphere - 0.35) / 0.42, 0, 1));
  const shellFade = 1 - smooth(clamp((sphere - 0.78) / 0.22, 0, 1));
  const shellAlpha = shellFade;

  ctx.globalAlpha = shellAlpha;
  ctx.fillStyle = "#327b35";
  for (let i = 0; i < 3; i += 1) {
    ctx.save();
    const shellSide = Math.cos((i / 3) * Math.PI * 2 + bud.rotation) < 0 ? -1 : 1;
    ctx.translate(shellSide * size * (0.08 * open + 0.1 * shellFall), size * 0.32 * shellFall);
    ctx.rotate((i / 3) * Math.PI * 2 + bud.rotation + open * 0.12 + shellSide * shellFall * 0.45);
    ctx.beginPath();
    ctx.ellipse(0, -size * lerp(0.25, 0.42, open), size * 0.09, size * lerp(0.34, 0.5, open), open * 0.26, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;

  if (sphere > 0.02) {
    ctx.save();
    ctx.translate(0, bloomY);
    drawBudPetals(size, petals, bud.hue, bud.rotation, bud.cup, bloomRadius);
    ctx.restore();
  }

  if (shellAlpha > 0.02) {
    ctx.globalAlpha = shellAlpha;
    ctx.fillStyle = "#3b8a3b";
    ctx.strokeStyle = "rgba(25, 86, 31, 0.32)";
    for (let side = -1; side <= 1; side += 2) {
      ctx.save();
      ctx.translate(side * size * (0.1 + 0.18 * open + 0.16 * shellFall), size * 0.46 * shellFall);
      ctx.rotate(side * (openAngle + shellFall * 0.7));
      ctx.beginPath();
      ctx.moveTo(0, size * 0.22);
      ctx.bezierCurveTo(side * size * 0.18, size * 0.02, side * size * 0.22, -size * 0.36, side * size * 0.06, -size * 0.55);
      ctx.bezierCurveTo(side * size * 0.01, -size * 0.28, side * size * 0.02, -size * 0.02, 0, size * 0.22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function drawCarnationPetal(length, widthLeaf, ruffle, hue, baseLight, tipLight) {
  const gradient = ctx.createLinearGradient(0, length * 0.2, 0, -length * 0.86);
  gradient.addColorStop(0, `hsl(${hue - 3}, 76%, ${baseLight}%)`);
  gradient.addColorStop(0.58, `hsl(${hue + 2}, 78%, ${lerp(baseLight, tipLight, 0.62)}%)`);
  gradient.addColorStop(1, `hsl(${hue + 5}, 82%, ${tipLight}%)`);
  ctx.fillStyle = gradient;

  ctx.beginPath();
  ctx.moveTo(0, length * 0.2);
  ctx.bezierCurveTo(-widthLeaf * 0.62, length * 0.02, -widthLeaf * 0.98, -length * 0.34, -widthLeaf * 0.46, -length * 0.78);
  for (let i = 0; i <= 4; i += 1) {
    const t = i / 4;
    const x = lerp(-widthLeaf * 0.44, widthLeaf * 0.44, t);
    const y = -length * (0.82 + Math.sin((t + ruffle) * Math.PI * 4) * 0.045);
    ctx.quadraticCurveTo(x - widthLeaf * 0.12, y - length * 0.06, x, y);
  }
  ctx.bezierCurveTo(widthLeaf * 0.98, -length * 0.34, widthLeaf * 0.62, length * 0.02, 0, length * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawBudPetals(size, openness, hue, rotation, cup = 1, bloomRadius = 0) {
  const layers = [
    { count: 8, delay: 0, radius: 0.34, length: 0.56, width: 0.25, baseLight: 54, tipLight: 74, backShade: 5, spread: 0.82 },
    { count: 7, delay: 0.12, radius: 0.22, length: 0.48, width: 0.22, baseLight: 50, tipLight: 70, backShade: 2.5, spread: 0.58 },
    { count: 5, delay: 0.24, radius: 0.1, length: 0.38, width: 0.19, baseLight: 45, tipLight: 64, backShade: 0, spread: 0.34 },
  ];

  for (let layer = 0; layer < layers.length; layer += 1) {
    const config = layers[layer];
    const layerOpen = smooth(clamp((openness - config.delay) / (1 - config.delay), 0, 1));
    if (layerOpen <= 0) {
      continue;
    }

    const radius = lerp(bloomRadius * 0.24, size * config.radius, layerOpen);
    const length = size * config.length * lerp(0.3, 1, layerOpen) * cup;
    const widthLeaf = size * config.width * lerp(0.45, 1, layerOpen);
    ctx.strokeStyle = `hsla(${hue - 10}, 72%, 42%, ${0.18 + layer * 0.02})`;
    ctx.lineWidth = 0.6;
    for (let i = 0; i < config.count; i += 1) {
      const folded = (1 - layerOpen) * config.spread;
      const a = rotation + (i / config.count) * Math.PI * 2 + layer * 0.31 + Math.sin(i * 1.7 + rotation) * folded;
      const petalRadius = radius * lerp(0.08, 0.78, layerOpen);
      ctx.save();
      ctx.translate(Math.cos(a) * petalRadius, Math.sin(a) * petalRadius);
      ctx.rotate(a + Math.PI / 2 + Math.sin(i + rotation) * (1 - layerOpen) * 0.45);
      drawCarnationPetal(
        length,
        widthLeaf,
        rotation + i * 0.37 + layer,
        hue + layer * 3,
        config.baseLight - config.backShade,
        config.tipLight - config.backShade + layerOpen * 2,
      );
      ctx.restore();
    }
  }
}

function drawPetalTextShadow(time) {
  const fade = smooth((time - (MESSAGE_START_SECONDS + 25)) / 11);
  if (fade <= 0 || messageTextLines.length === 0) {
    return;
  }

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(55, 24, 28, 0.24)";
  ctx.shadowBlur = 5;
  ctx.globalAlpha = fade * 0.42;
  ctx.fillStyle = "#6f2538";
  for (const line of messageTextLines) {
    ctx.font = `${line.weight} ${line.size}px Roboto Bold, "Times New Roman", serif`;
    ctx.fillText(line.text, line.x + 1.2, line.y + 1.2, line.maxWidth);
  }

  ctx.shadowBlur = 0;
  ctx.globalAlpha = fade * 0.18;
  ctx.fillStyle = "#ffd5dd";
  for (const line of messageTextLines) {
    ctx.font = `${line.weight} ${line.size}px Roboto Bold, "Times New Roman", serif`;
    ctx.fillText(line.text, line.x - 0.8, line.y - 0.8, line.maxWidth);
  }
  ctx.restore();
}

function drawPetalMessage(time) {
  if (time < MESSAGE_START_SECONDS - 1) {
    return;
  }

  drawPetalTextShadow(time);

  ctx.save();
  for (const petal of messagePetals) {
    const progress = smooth((time - petal.delay) / petal.duration);
    if (progress <= 0) {
      continue;
    }

    const settle = smooth(progress);
    const fallTime = time - petal.delay;
    const sway =
      Math.sin(fallTime * 1.15 + petal.phase) * 32 +
      Math.sin(fallTime * 2.35 + petal.phase * 0.7) * 11;
    const x = lerp(petal.startX, petal.targetX, progress) + sway * (1 - settle);
    const y = lerp(petal.startY, petal.targetY, progress) + Math.sin(progress * Math.PI) * 26;
    const angle =
      petal.startAngle +
      angleDelta(petal.startAngle, petal.targetAngle) * settle +
      Math.sin(fallTime * 2.8 + petal.phase) * (1 - settle) * 1.05;

    ctx.globalAlpha = 1;
    ctx.fillStyle = `hsl(${petal.hue}, 74%, ${lerp(61, 76, progress)}%)`;
    ctx.strokeStyle = `hsla(${petal.hue - 10}, 70%, 42%, 0.25)`;
    ctx.lineWidth = 0.55;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(0, 0, petal.size * 1.65, petal.size * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

function drawSunsetTint(time) {
  const sunset = smooth(time / SUNSET_SECONDS);
  if (sunset <= 0.01) {
    return;
  }

  ctx.save();
  ctx.globalCompositeOperation = "source-atop";
  ctx.globalAlpha = sunset * 0.18;
  ctx.fillStyle = "#ff8f55";
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = sunset * 0.08;
  ctx.fillStyle = "#63304f";
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function draw(timeMs) {
  const time = animationStarted ? Math.max(0, (timeMs - startTime) / 1000) : 0;
  const displayTime = Math.min(time, GROWTH_SECONDS + 60);

  ctx.clearRect(0, 0, width, height);
  drawSky(displayTime);
  drawSoil();

  for (const branch of branches) {
    drawBranch(branch, displayTime);
  }
  for (const leaf of leaves) {
    drawLeaf(leaf, displayTime);
  }
  for (const bud of buds) {
    drawBud(bud, displayTime);
  }
  drawSunsetTint(displayTime);
  drawPetalMessage(displayTime);

  requestAnimationFrame(draw);
}

window.addEventListener("resize", resize);
resize();
requestAnimationFrame(draw);

const tune = {
  context: null,
  master: null,
  delay: null,
  feedback: null,
  filter: null,
  compressor: null,
  timer: null,
  step: 0,
  nextTime: 0,
  playing: false,
};

const tempo = 48;
const beatSeconds = 60 / tempo;
const chords = [
  ["D3", "A3", "D4", "F#4"],
  ["G2", "D3", "B3", "D4"],
  ["A2", "E3", "A3", "C#4"],
  ["D3", "A3", "D4", "F#4"],
  ["B2", "F#3", "B3", "D4"],
  ["G2", "D3", "G3", "B3"],
  ["D3", "A3", "D4", "A4"],
  ["A2", "E3", "A3", "E4"],
];
const bassLine = [
  "D2", "D2", "A1", "D2", "G1", "G1", "D2", "G1",
  "A1", "A1", "E2", "A1", "D2", "D2", "A1", "D2",
  "B1", "B1", "F#2", "B1", "G1", "G1", "D2", "G1",
  "D2", "D2", "A1", "D2", "A1", "A1", "E2", "A1",
];
const melody = [
  "F#4", null, "A4", null, "B4", "A4", "F#4", null,
  "G4", null, "B4", "A4", "G4", null, "E4", null,
  "E4", null, "A4", "B4", "C#5", null, "A4", "E4",
  "F#4", null, "A4", "F#4", "D4", null, null, null,
  "D4", null, "F#4", "A4", "B4", null, "A4", "F#4",
  "G4", null, "B4", "D5", "B4", null, "G4", null,
  "A4", null, "F#4", "D4", "F#4", null, "A4", null,
  "E4", null, "C#4", "E4", "A4", null, null, null,
];

function noteFrequency(note) {
  const match = /^([A-G])(#?)(\d)$/.exec(note);
  if (!match) {
    return 440;
  }

  const semitones = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
  const [, name, sharp, octaveText] = match;
  const octave = Number(octaveText);
  const offset = semitones[name] + (sharp ? 1 : 0) + (octave - 4) * 12;
  return 440 * 2 ** (offset / 12);
}

function setupMusic() {
  if (tune.context) {
    return;
  }

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) {
    musicToggle.disabled = true;
    musicToggle.textContent = "No audio";
    return;
  }

  tune.context = new AudioContext();
  tune.master = tune.context.createGain();
  tune.master.gain.value = 0.48;
  tune.compressor = tune.context.createDynamicsCompressor();
  tune.compressor.threshold.value = -18;
  tune.compressor.knee.value = 24;
  tune.compressor.ratio.value = 4;
  tune.compressor.attack.value = 0.008;
  tune.compressor.release.value = 0.22;

  tune.filter = tune.context.createBiquadFilter();
  tune.filter.type = "lowpass";
  tune.filter.frequency.value = 3600;
  tune.filter.Q.value = 0.6;

  tune.delay = tune.context.createDelay(1.2);
  tune.delay.delayTime.value = beatSeconds * 0.5;
  tune.feedback = tune.context.createGain();
  tune.feedback.gain.value = 0.11;

  tune.filter.connect(tune.master);
  tune.filter.connect(tune.delay);
  tune.delay.connect(tune.feedback);
  tune.feedback.connect(tune.delay);
  tune.delay.connect(tune.master);
  tune.master.connect(tune.compressor);
  tune.compressor.connect(tune.context.destination);
}

function playAcousticStringNote(note, start, duration, velocity = 0.5) {
  const frequency = noteFrequency(note);
  const gain = tune.context.createGain();
  const body = tune.context.createBiquadFilter();
  const bodyGain = tune.context.createGain();
  const stringGain = tune.context.createGain();
  const shimmerGain = tune.context.createGain();
  const bodyOsc = tune.context.createOscillator();
  const stringOsc = tune.context.createOscillator();
  const shimmerOsc = tune.context.createOscillator();

  body.type = "bandpass";
  body.frequency.setValueAtTime(clamp(frequency * 1.35, 220, 1900), start);
  body.Q.setValueAtTime(0.72, start);
  bodyOsc.type = "triangle";
  stringOsc.type = "sawtooth";
  shimmerOsc.type = "sine";
  bodyOsc.frequency.setValueAtTime(frequency, start);
  stringOsc.frequency.setValueAtTime(frequency * 2.003, start);
  shimmerOsc.frequency.setValueAtTime(frequency * 3.01, start);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, velocity), start + 0.012);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, velocity * 0.34), start + 0.13);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  bodyGain.gain.setValueAtTime(0.78, start);
  stringGain.gain.setValueAtTime(0.18, start);
  shimmerGain.gain.setValueAtTime(0.09, start);

  bodyOsc.connect(bodyGain);
  stringOsc.connect(stringGain);
  shimmerOsc.connect(shimmerGain);
  bodyGain.connect(body);
  stringGain.connect(body);
  shimmerGain.connect(body);
  body.connect(gain);
  gain.connect(tune.filter);

  bodyOsc.start(start);
  stringOsc.start(start);
  shimmerOsc.start(start);
  bodyOsc.stop(start + duration + 0.08);
  stringOsc.stop(start + duration + 0.08);
  shimmerOsc.stop(start + duration + 0.08);
}

function playBassNote(note, start, duration, velocity = 0.5) {
  const frequency = noteFrequency(note);
  const gain = tune.context.createGain();
  const filter = tune.context.createBiquadFilter();
  const bodyGain = tune.context.createGain();
  const edgeGain = tune.context.createGain();
  const bodyOsc = tune.context.createOscillator();
  const edgeOsc = tune.context.createOscillator();

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(620, start);
  filter.Q.setValueAtTime(0.55, start);
  bodyOsc.type = "sine";
  edgeOsc.type = "triangle";
  bodyOsc.frequency.setValueAtTime(frequency, start);
  edgeOsc.frequency.setValueAtTime(frequency * 2, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, velocity), start + 0.026);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, velocity * 0.62), start + 0.24);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  bodyGain.gain.setValueAtTime(0.9, start);
  edgeGain.gain.setValueAtTime(0.16, start);

  bodyOsc.connect(bodyGain);
  edgeOsc.connect(edgeGain);
  bodyGain.connect(filter);
  edgeGain.connect(filter);
  filter.connect(gain);
  gain.connect(tune.master);

  bodyOsc.start(start);
  edgeOsc.start(start);
  bodyOsc.stop(start + duration + 0.1);
  edgeOsc.stop(start + duration + 0.1);
}

function playOpeningChord(start) {
  const notes = ["D2", "A2", "D3", "A3", "D4", "F#4"];
  for (let i = 0; i < notes.length; i += 1) {
    if (i < 2) {
      playBassNote(notes[i], start + i * 0.045, beatSeconds * 3.2, 0.34);
    } else {
      playAcousticStringNote(notes[i], start + i * 0.032, beatSeconds * 2.4, 0.28);
    }
  }
}

function scheduleStep(time) {
  const beat = tune.step % 64;
  const chordIndex = Math.floor(beat / 8) % chords.length;
  const chord = chords[chordIndex];
  const position = beat % 8;
  const bass = bassLine[Math.floor(beat / 2) % bassLine.length];
  const arpeggio = position % 2 === 0 ? [0, 2, 3] : [1, 2];
  const accent = position === 0 || position === 4;

  for (let i = 0; i < arpeggio.length; i += 1) {
    const note = chord[arpeggio[i] % chord.length];
    const delay = i * beatSeconds * 0.18;
    playAcousticStringNote(note, time + delay, beatSeconds * (accent ? 1.45 : 1.05), accent ? 0.25 - i * 0.03 : 0.17);
  }
  if (position === 2 || position === 6) {
    playAcousticStringNote(chord[(position / 2) % chord.length], time + beatSeconds * 0.08, beatSeconds * 0.9, 0.14);
  }
  if (position === 0 || position === 4) {
    playBassNote(bass, time, beatSeconds * 2.7, position === 0 ? 0.34 : 0.28);
  } else if (position === 6) {
    playBassNote(bass, time + beatSeconds * 0.08, beatSeconds * 1.25, 0.2);
  }

  const lead = melody[beat];
  if (lead) {
    playAcousticStringNote(lead, time + beatSeconds * 0.04, beatSeconds * 1.28, 0.31);
  }

  tune.step += 1;
}

function musicScheduler() {
  while (tune.nextTime < tune.context.currentTime + 0.4) {
    scheduleStep(tune.nextTime);
    tune.nextTime += beatSeconds;
  }
}

function openEnvelope() {
  if (!envelopeCover || envelopeCover.classList.contains("opening")) {
    return;
  }

  animationStarted = true;
  startTime = performance.now();
  envelopeCover.classList.add("opening");
  window.setTimeout(() => {
    enterFullscreen();
  }, 850);
  window.setTimeout(() => {
    envelopeCover.remove();
  }, 2100);
}

async function enterFullscreen() {
  if (document.fullscreenElement || !document.documentElement.requestFullscreen) {
    return;
  }

  try {
    await document.documentElement.requestFullscreen();
  } catch {
    // Fullscreen is optional; some browsers deny it despite a click gesture.
  }
}

async function toggleMusic() {
  openEnvelope();
  setupMusic();
  if (!tune.context) {
    return;
  }

  if (!tune.playing) {
    await tune.context.resume();
    tune.master.gain.cancelScheduledValues(tune.context.currentTime);
    tune.master.gain.setTargetAtTime(0.42, tune.context.currentTime, 0.05);
    tune.playing = true;
    tune.nextTime = tune.context.currentTime + 0.05;
    playOpeningChord(tune.context.currentTime + 0.03);
    tune.timer = window.setInterval(musicScheduler, 80);
    musicScheduler();
    musicToggle.setAttribute("aria-pressed", "true");
  } else {
    tune.playing = false;
    window.clearInterval(tune.timer);
    tune.timer = null;
    tune.master.gain.cancelScheduledValues(tune.context.currentTime);
    tune.master.gain.setTargetAtTime(0.0001, tune.context.currentTime, 0.08);
    window.setTimeout(() => {
      if (!tune.playing && tune.context) {
        tune.context.suspend();
        tune.master.gain.value = 0.42;
      }
    }, 220);
    musicToggle.setAttribute("aria-pressed", "false");
  }
}

if (musicToggle) {
  musicToggle.addEventListener("click", toggleMusic);
}
