const canvas = document.getElementById("garden");
const ctx = canvas.getContext("2d");
const musicToggle = document.getElementById("music-toggle");
const envelopeCover = document.getElementById("envelope-cover");

const MESSAGE_PUFF_START_SECONDS = 62;
const TULIP_COUNT = 8;
const LILY_COUNT = 4;
const FIRST_FLOWER_BIRTH_SECONDS = 1.2;
const FLOWER_STAGGER_SECONDS = 3.25;
const TULIP_GROW_SECONDS = 6.2;
const LILY_GROW_SECONDS = 7.1;
const MESSAGE_RASTER_SCALE = 3;
const MESSAGE_PUFF_ALPHA_THRESHOLD = 48;
const MAX_PUFFS_PER_CHARACTER = 76;

let width = 0;
let height = 0;
let dpr = 1;
let soilY = 0;
let startTime = performance.now();
let branches = [];
let leaves = [];
let buds = [];
let clouds = [];
let messagePetals = [];
let messageTextLines = [];
let planter = null;
let flowers = [];
let ladybug = null;
let messageClouds = [];
let groundY = 0;

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

function addFoliage(branch, random) {
  const leafCount = clamp(Math.round(branch.length * 10 + (7 - branch.depth) * 0.5), 1, 6);
  for (let i = 0; i < leafCount && leaves.length < 720; i += 1) {
    const u = lerp(0.18, 0.98, (i + random() * 0.8) / leafCount);
    leaves.push({
      branch,
      u,
      side: random() < 0.5 ? -1 : 1,
      size: lerp(18, 42, random()) * Math.max(0.72, 1.15 - branch.depth * 0.045),
      tilt: lerp(-0.75, 0.75, random()),
      curl: lerp(-0.34, 0.34, random()),
      stem: lerp(0.1, 0.24, random()),
      birth: branch.birth + branch.duration * u + lerp(1.4, 7.6, random()),
      color: random() < 0.5 ? "#2f8f47" : random() < 0.78 ? "#4aaa52" : "#7ac45a",
    });
  }

  if (branch.depth >= 2 && buds.length < 200 && (branch.role === "twig" ? random() > 0.38 : random() > 0.76)) {
    const hue = lerp(327, 350, random());
    buds.push({
      branch,
      u: lerp(0.78, 1, random()),
      size: lerp(24, 46, random()) * Math.max(0.72, 1.12 - branch.depth * 0.035),
      birth: branch.birth + branch.duration + lerp(4, 13, random()),
      hue,
      rotation: random() * Math.PI * 2,
      lean: lerp(-0.28, 0.28, random()),
      cup: lerp(0.82, 1.18, random()),
    });
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

  for (let index = 0; index < queue.length && branches.length < 280; index += 1) {
    const branch = queue[index];
    addFoliage(branch, random);
    if (branch.depth >= 7) {
      continue;
    }

    const childCount = branch.depth < 2 ? 3 : branch.depth < 5 ? 2 : 1;
    for (let i = 0; i < childCount && branches.length < 280; i += 1) {
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

  const selected = selectEvenMaskPoints(candidates, Math.min(3000, candidates.length), pixelWidth, pixelHeight);

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
  const fallbackSource = { x: width * 0.5, y: soilY - height * 0.32, radius: 36, angle: -Math.PI / 2, matureAt: MESSAGE_PUFF_START_SECONDS };
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
      delay: Math.max(MESSAGE_PUFF_START_SECONDS + lerp(0, 9, random()), source.matureAt + lerp(0, 5, random())),
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
  const sunset = smooth(time / 102);
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
  const coreRadius = size * lerp(0.06, 0.34, sphere);
  const coreY = -size * lerp(0.16, 0.03, sphere);

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
    ctx.translate(0, coreY);
    drawBudPetals(size, petals, bud.hue, bud.rotation, bud.cup, coreRadius);
    ctx.restore();
  }

  if (sphere > 0.02) {
    ctx.fillStyle = `hsl(${bud.hue}, 72%, 66%)`;
    ctx.strokeStyle = `hsla(${bud.hue - 12}, 58%, 38%, 0.28)`;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.arc(0, coreY, coreRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
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

function drawBudPetals(size, openness, hue, rotation, cup = 1, coreRx = 0) {
  for (let layer = 0; layer < 2; layer += 1) {
    const count = 7 + layer * 4;
    const layerOpen = smooth(clamp((openness - layer * 0.14) / 0.86, 0, 1));
    if (layerOpen <= 0) {
      continue;
    }
    const petalSize = size * lerp(layer === 0 ? 0.12 : 0.08, layer === 0 ? 0.46 : 0.43, layerOpen) * cup;
    const radius = layer === 0
      ? lerp(coreRx * 0.28, size * 0.15, layerOpen)
      : lerp(coreRx * 0.55, size * 0.35, layerOpen);
    ctx.fillStyle = `hsl(${hue + layer * 5}, ${72 + layer * 3}%, ${64 + layer * 4}%)`;
    ctx.strokeStyle = `hsla(${hue - 8}, 72%, 45%, 0.22)`;
    ctx.lineWidth = 0.6;
    for (let i = 0; i < count; i += 1) {
      const folded = (1 - layerOpen) * 0.72;
      const a = rotation + (i / count) * Math.PI * 2 + layer * 0.35 + Math.sin(i * 1.7 + rotation) * folded;
      const petalLength = petalSize * lerp(0.8, 1.7, layerOpen);
      const petalWidth = petalSize * lerp(0.34, 0.5, layerOpen);
      ctx.save();
      ctx.translate(Math.cos(a) * radius, Math.sin(a) * radius);
      ctx.rotate(a + Math.PI / 2 + Math.sin(i + rotation) * (1 - layerOpen) * 0.55);
      ctx.beginPath();
      ctx.ellipse(0, 0, petalLength, petalWidth, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }
}

function drawPetalTextShadow(time) {
  const fade = smooth((time - (MESSAGE_PUFF_START_SECONDS + 25)) / 11);
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
  if (time < MESSAGE_PUFF_START_SECONDS - 1) {
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
  const sunset = smooth(time / 102);
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
  const time = (timeMs - startTime) / 1000;
  const displayTime = time;

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

function cubicPoint(a, b, c, d, t) {
  const inv = 1 - t;
  return {
    x: inv * inv * inv * a.x + 3 * inv * inv * t * b.x + 3 * inv * t * t * c.x + t * t * t * d.x,
    y: inv * inv * inv * a.y + 3 * inv * inv * t * b.y + 3 * inv * t * t * c.y + t * t * t * d.y,
  };
}

function buildPlanterScene() {
  const random = mulberry32(20260510);
  branches = [];
  leaves = [];
  buds = [];
  clouds = [];
  messagePetals = [];
  messageTextLines = [];
  flowers = [];
  messageClouds = [];

  const scale = Math.min(width, height);
  const boxWidth = clamp(width * 0.78, 310, 800);
  const boxHeight = clamp(height * 0.17, 88, 150);
  const boxX = (width - boxWidth) * 0.5;
  groundY = height * 0.69;
  const boxY = groundY - boxHeight * 0.58;
  planter = {
    x: boxX,
    y: boxY,
    width: boxWidth,
    height: boxHeight,
    lipHeight: boxHeight * 0.22,
    plankCount: width < 520 ? 4 : 5,
  };
  soilY = planter.y + planter.lipHeight * 0.52;

  const types = Array.from({ length: TULIP_COUNT + LILY_COUNT }, (_, index) => ((index + 1) % 3 === 0 ? "lily" : "tulip"));
  const usableWidth = planter.width * 0.82;
  const startX = planter.x + planter.width * 0.09;
  const gap = usableWidth / (types.length - 1);

  for (let i = 0; i < types.length; i += 1) {
    const type = types[i];
    const jitter = (random() - 0.5) * gap * 0.32;
    const stemHeight = (type === "lily" ? lerp(0.36, 0.5, random()) : lerp(0.26, 0.39, random())) * scale;
    flowers.push({
      type,
      x: startX + gap * i + jitter,
      baseY: planter.y + planter.lipHeight * 0.42 + lerp(-4, 5, random()),
      stemHeight,
      birth: FIRST_FLOWER_BIRTH_SECONDS + i * FLOWER_STAGGER_SECONDS,
      duration: type === "lily" ? LILY_GROW_SECONDS : TULIP_GROW_SECONDS,
      lean: lerp(-0.19, 0.19, random()) + (i - 5.5) * 0.008,
      phase: random() * Math.PI * 2,
      leafSide: random() < 0.5 ? -1 : 1,
      size: (type === "lily" ? lerp(32, 44, random()) : lerp(28, 38, random())) * (width < 520 ? 0.82 : 1),
      rotation: random() * Math.PI * 2,
    });
  }

  buildLadybugMessage(random);
}

function generateGrowth() {
  buildPlanterScene();
}

function generatePetalMessage() {
  messagePetals = [];
  messageTextLines = [];
}

function flowerProgress(flower, time) {
  return smooth((time - flower.birth) / flower.duration);
}

function flowerHeadPoint(flower, time, forcedProgress = null) {
  const progress = forcedProgress === null ? flowerProgress(flower, time) : forcedProgress;
  const stem = flower.stemHeight * progress;
  const sway = Math.sin(time * 0.55 + flower.phase) * 5 * progress;
  return {
    x: flower.x + flower.lean * stem + sway,
    y: flower.baseY - stem,
  };
}

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = Math.max(320, window.innerWidth);
  height = Math.max(360, window.innerHeight);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  buildPlanterScene();
}

function buildLadybugMessage(random) {
  const titleSize = clamp(width / 18, 25, 58);
  const bodySize = clamp(width / 28, 18, 36);
  const lineGap = clamp(height * 0.028, 14, 28);
  const lines = [
    { text: "Love, Henry, Evan, Thomas and Damien", size: bodySize, weight: 700 },
    { text: "Happy Mother's Day 2026, Sammi", size: titleSize, weight: 700 },
  ];

  const measureCanvas = document.createElement("canvas");
  const measureCtx = measureCanvas.getContext("2d");
  const startTime = MESSAGE_PUFF_START_SECONDS - 7.5;
  const charDuration = width < 520 ? 0.2 : 0.17;
  let cursorTime = startTime;
  const lowerThirdBottom = Math.min((groundY || height * 0.69) - 26, height * 0.64);
  const lowerThirdTop = height * 0.42;
  const lineAdvance = titleSize * 0.88 + lineGap;
  const baselineBottom = clamp(lowerThirdBottom, lowerThirdTop + lineAdvance, height - 42);
  const tracks = [];
  const puffs = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    measureCtx.font = `${line.weight} ${line.size}px Georgia, "Times New Roman", serif`;
    const maxLineWidth = width * 0.88;
    const rawWidth = measureCtx.measureText(line.text).width;
    const fitScale = Math.min(1, maxLineWidth / Math.max(1, rawWidth));
    const fontSize = line.size * fitScale;
    measureCtx.font = `${line.weight} ${fontSize}px Georgia, "Times New Roman", serif`;
    const charWidths = [...line.text].map((char) => measureCtx.measureText(char).width);
    const lineWidth = charWidths.reduce((total, value) => total + value, 0);
    const xStart = (width - lineWidth) * 0.5;
    const y = baselineBottom - lineIndex * lineAdvance;
    const direction = lineIndex % 2 === 0 ? 1 : -1;
    const order = [...line.text].map((_, index) => index);
    if (direction < 0) {
      order.reverse();
    }

    const track = {
      fromX: direction > 0 ? xStart - 46 : xStart + lineWidth + 46,
      toX: direction > 0 ? xStart + lineWidth + 46 : xStart - 46,
      y: y - fontSize * 0.68,
      start: cursorTime,
      duration: Math.max(3.2, order.length * charDuration + 1.1),
      direction,
    };
    tracks.push(track);

    let charX = xStart;
    const positions = charWidths.map((charWidth) => {
      const position = charX;
      charX += charWidth;
      return position;
    });

    for (let orderIndex = 0; orderIndex < order.length; orderIndex += 1) {
      const charIndex = order[orderIndex];
      const char = line.text[charIndex];
      const appear = track.start + orderIndex * charDuration;
      if (char.trim() === "") {
        continue;
      }

      const targetPuffs = rasterizeCharacterPuffs(
        char,
        `${line.weight} ${fontSize}px Georgia, "Times New Roman", serif`,
        positions[charIndex],
        y,
        fontSize,
        random,
      );
      const source = ladybugMessagePointAt(appear, { tracks, landingStart: Infinity, landingDuration: 1 });
      for (const puff of targetPuffs) {
        puffs.push({
          ...puff,
          startX: source.x - direction * lerp(18, 34, random()),
          startY: source.y + lerp(-4, 8, random()),
          appear: appear + lerp(0, charDuration * 0.85, random()),
          duration: lerp(1.1, 1.85, random()),
          drift: lerp(-4, 4, random()),
        });
      }
    }

    cursorTime = track.start + track.duration + 1.15;
  }

  ladybug = {
    tracks,
    introStart: startTime - 3.8,
    landingStart: cursorTime + 0.8,
    landingDuration: 6.8,
  };
  messageClouds = puffs;
}

function rasterizeCharacterPuffs(char, font, targetX, baseline, fontSize, random) {
  const textCanvas = document.createElement("canvas");
  const textCtx = textCanvas.getContext("2d", { willReadFrequently: true });
  const rasterScale = MESSAGE_RASTER_SCALE;
  const padding = Math.ceil(fontSize * 0.42 * rasterScale);

  textCtx.font = font;
  const charWidth = Math.ceil(textCtx.measureText(char).width * rasterScale);
  const canvasWidth = Math.max(24, charWidth + padding * 2);
  const canvasHeight = Math.ceil(fontSize * 1.72 * rasterScale);
  const canvasBaseline = Math.ceil(fontSize * 1.18 * rasterScale);
  textCanvas.width = canvasWidth;
  textCanvas.height = canvasHeight;

  textCtx.clearRect(0, 0, canvasWidth, canvasHeight);
  textCtx.font = font.replace(`${fontSize}px`, `${fontSize * rasterScale}px`);
  textCtx.textBaseline = "alphabetic";
  textCtx.fillStyle = "#000";
  textCtx.fillText(char, padding, canvasBaseline);

  const data = textCtx.getImageData(0, 0, canvasWidth, canvasHeight).data;
  const sampleStep = clamp(Math.round((fontSize * rasterScale) / 16), 3, 7);
  const candidates = [];
  for (let y = 0; y < canvasHeight; y += sampleStep) {
    for (let x = 0; x < canvasWidth; x += sampleStep) {
      const alpha = data[(y * canvasWidth + x) * 4 + 3];
      if (alpha > MESSAGE_PUFF_ALPHA_THRESHOLD) {
        candidates.push({ x, y, alpha });
      }
    }
  }

  const maxPuffs = clamp(Math.round(fontSize * 1.25), 24, MAX_PUFFS_PER_CHARACTER);
  const selected = selectEvenMaskPoints(candidates, Math.min(maxPuffs, candidates.length), canvasWidth, canvasHeight);
  return selected.map((point) => ({
    targetX: targetX + (point.x - padding) / rasterScale + lerp(-0.35, 0.35, random()),
    targetY: baseline + (point.y - canvasBaseline) / rasterScale + lerp(-0.35, 0.35, random()),
    radius: lerp(fontSize * 0.026, fontSize * 0.052, random()),
  }));
}

function ladybugMessagePointAt(time, bug = ladybug) {
  const tracks = bug?.tracks || [];
  if (tracks.length === 0) {
    return { x: -80, y: height * 0.2, direction: 1, flying: true };
  }

  const first = tracks[0];
  if (time < first.start) {
    const t = smooth((time - (bug.introStart || first.start - 3)) / Math.max(0.1, first.start - (bug.introStart || first.start - 3)));
    return {
      x: lerp(-80, first.fromX, t),
      y: lerp(height * 0.2, first.y, t) + Math.sin(t * Math.PI) * -24,
      direction: first.direction,
      flying: true,
    };
  }

  for (let i = 0; i < tracks.length; i += 1) {
    const track = tracks[i];
    if (time <= track.start + track.duration) {
      const t = smooth((time - track.start) / track.duration);
      return {
        x: lerp(track.fromX, track.toX, t),
        y: track.y + Math.sin(t * Math.PI * 2) * 3,
        direction: track.direction,
        flying: true,
      };
    }

    const next = tracks[i + 1];
    if (next && time < next.start) {
      const t = smooth((time - (track.start + track.duration)) / (next.start - track.start - track.duration));
      return {
        x: lerp(track.toX, next.fromX, t),
        y: lerp(track.y, next.y, t) - Math.sin(t * Math.PI) * 22,
        direction: next.fromX >= track.toX ? 1 : -1,
        flying: true,
      };
    }
  }

  const landing = ladybugLandingPoint(time);
  const last = tracks[tracks.length - 1];
  const t = smooth((time - bug.landingStart) / bug.landingDuration);
  return {
    x: lerp(last.toX, landing.x, t),
    y: lerp(last.y, landing.y, t) - Math.sin(t * Math.PI) * 34,
    direction: landing.x >= last.toX ? 1 : -1,
    flying: t < 0.98,
  };
}

function ladybugLandingPoint(time) {
  const rightmostLily = flowers[flowers.length - 1];
  const landing = rightmostLily ? flowerHeadPoint(rightmostLily, time, 1) : { x: width * 0.78, y: height * 0.35 };
  return {
    x: landing.x + (rightmostLily?.size || 34) * 0.25,
    y: landing.y - (rightmostLily?.size || 34) * 0.2,
  };
}

function drawSky() {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#35a8ff");
  gradient.addColorStop(0.48, "#83ceff");
  gradient.addColorStop(1, "#dff8ff");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawGrass(time) {
  const y = groundY || height * 0.69;
  const gradient = ctx.createLinearGradient(0, y, 0, height);
  gradient.addColorStop(0, "#65c956");
  gradient.addColorStop(0.5, "#3d9b3e");
  gradient.addColorStop(1, "#24742e");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(0, y);
  for (let x = 0; x <= width + 36; x += 36) {
    ctx.lineTo(x, y + Math.sin(x * 0.035) * 5 + Math.cos(x * 0.017) * 4);
  }
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();

  ctx.save();
  ctx.strokeStyle = "rgba(242, 255, 211, 0.24)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 120; i += 1) {
    const x = (i * 37) % width;
    const baseY = y + 10 + ((i * 19) % Math.max(1, height - y - 16));
    const blade = 8 + (i % 7);
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.quadraticCurveTo(x + Math.sin(time + i) * 3, baseY - blade * 0.55, x + ((i % 3) - 1) * 4, baseY - blade);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSoftCloud(x, y, scale, alpha = 0.92) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#fffdf9";
  const puffs = [
    [-60, 10, 27],
    [-38, 23, 25],
    [-20, -6, 39],
    [20, -12, 47],
    [54, 2, 35],
    [70, 22, 23],
    [9, 18, 49],
    [-8, 29, 33],
    [37, 28, 36],
  ];
  for (const [px, py, radius] of puffs) {
    ctx.beginPath();
    ctx.arc(x + px * scale, y + py * scale, radius * scale, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = alpha * 0.12;
  ctx.fillStyle = "#6f9fc0";
  ctx.beginPath();
  ctx.ellipse(x + 12 * scale, y + 32 * scale, 86 * scale, 15 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPlanter() {
  if (!planter) {
    return;
  }

  const { x, y, width: boxWidth, height: boxHeight, lipHeight, plankCount } = planter;
  const radius = 7;

  ctx.save();
  ctx.fillStyle = "rgba(65, 38, 20, 0.2)";
  ctx.beginPath();
  ctx.ellipse(x + boxWidth * 0.5, y + boxHeight + 12, boxWidth * 0.48, boxHeight * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  const sideGradient = ctx.createLinearGradient(x, y, x, y + boxHeight);
  sideGradient.addColorStop(0, "#a76637");
  sideGradient.addColorStop(0.48, "#8f512c");
  sideGradient.addColorStop(1, "#673819");
  ctx.fillStyle = sideGradient;
  roundedRect(x, y + lipHeight * 0.35, boxWidth, boxHeight - lipHeight * 0.2, radius);
  ctx.fill();

  const plankWidth = boxWidth / plankCount;
  ctx.strokeStyle = "rgba(68, 35, 18, 0.42)";
  ctx.lineWidth = 2;
  for (let i = 1; i < plankCount; i += 1) {
    const px = x + plankWidth * i;
    ctx.beginPath();
    ctx.moveTo(px, y + lipHeight * 0.5);
    ctx.lineTo(px, y + boxHeight - 6);
    ctx.stroke();
  }

  ctx.globalAlpha = 0.26;
  ctx.strokeStyle = "#f0bb79";
  ctx.lineWidth = 1.1;
  for (let i = 0; i < plankCount; i += 1) {
    const px = x + plankWidth * i + plankWidth * 0.16;
    for (let j = 0; j < 3; j += 1) {
      const yy = y + lipHeight + 14 + j * boxHeight * 0.2 + ((i + j) % 2) * 5;
      ctx.beginPath();
      ctx.moveTo(px, yy);
      ctx.bezierCurveTo(px + plankWidth * 0.2, yy - 6, px + plankWidth * 0.52, yy + 8, px + plankWidth * 0.76, yy);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  const lipGradient = ctx.createLinearGradient(x, y, x, y + lipHeight);
  lipGradient.addColorStop(0, "#c98247");
  lipGradient.addColorStop(1, "#895029");
  ctx.fillStyle = lipGradient;
  roundedRect(x - 12, y, boxWidth + 24, lipHeight, radius);
  ctx.fill();

  ctx.fillStyle = "#3e2417";
  roundedRect(x + 18, y + lipHeight * 0.28, boxWidth - 36, lipHeight * 0.5, 12);
  ctx.fill();

  ctx.globalAlpha = 0.28;
  ctx.fillStyle = "#24150e";
  for (let i = 0; i < 42; i += 1) {
    const px = x + 28 + ((i * 47) % Math.max(1, boxWidth - 56));
    const py = y + lipHeight * lerp(0.42, 0.72, (i % 7) / 6);
    ctx.beginPath();
    ctx.ellipse(px, py, 2.4 + (i % 3), 1.1 + (i % 2), 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.fillStyle = "rgba(48, 26, 15, 0.48)";
  for (const nx of [x + 28, x + boxWidth - 28]) {
    for (const ny of [y + lipHeight + 18, y + boxHeight - 22]) {
      ctx.beginPath();
      ctx.arc(nx, ny, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function roundedRect(x, y, rectWidth, rectHeight, radius) {
  const r = Math.min(radius, rectWidth * 0.5, rectHeight * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + rectWidth - r, y);
  ctx.quadraticCurveTo(x + rectWidth, y, x + rectWidth, y + r);
  ctx.lineTo(x + rectWidth, y + rectHeight - r);
  ctx.quadraticCurveTo(x + rectWidth, y + rectHeight, x + rectWidth - r, y + rectHeight);
  ctx.lineTo(x + r, y + rectHeight);
  ctx.quadraticCurveTo(x, y + rectHeight, x, y + rectHeight - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawFlower(flower, time) {
  const progress = flowerProgress(flower, time);
  if (progress <= 0) {
    return;
  }

  const head = flowerHeadPoint(flower, time, progress);
  const stemStart = { x: flower.x, y: flower.baseY + 4 };
  const stemAngle = Math.atan2(head.y - stemStart.y, head.x - stemStart.x);
  const open = smooth((progress - 0.48) / 0.52);

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = flower.type === "lily" ? "#428642" : "#3f9145";
  ctx.lineWidth = flower.type === "lily" ? 4.2 : 3.6;
  ctx.beginPath();
  ctx.moveTo(stemStart.x, stemStart.y);
  ctx.quadraticCurveTo(
    lerp(stemStart.x, head.x, 0.48) - flower.lean * 18,
    lerp(stemStart.y, head.y, 0.52),
    head.x,
    head.y,
  );
  ctx.stroke();

  drawFlowerLeaves(flower, stemStart, head, progress);

  ctx.translate(head.x, head.y);
  ctx.rotate(stemAngle + Math.PI / 2 + Math.sin(time * 0.45 + flower.phase) * 0.035);
  if (flower.type === "lily") {
    drawLilyBloom(flower, open);
  } else {
    drawTulipBloom(flower, open);
  }
  ctx.restore();
}

function drawFlowerLeaves(flower, start, head, progress) {
  const count = flower.type === "lily" ? 3 : 2;
  for (let i = 0; i < count; i += 1) {
    const u = count === 1 ? 0.5 : lerp(0.28, 0.72, i / (count - 1));
    if (progress < u * 0.72) {
      continue;
    }

    const leafGrow = smooth((progress - u * 0.72) / 0.28);
    const side = (i + (flower.leafSide < 0 ? 0 : 1)) % 2 === 0 ? -1 : 1;
    const x = lerp(start.x, head.x, u);
    const y = lerp(start.y, head.y, u);
    const angle = Math.atan2(head.y - start.y, head.x - start.x) + side * lerp(1.0, 1.35, u);
    const length = flower.size * (flower.type === "lily" ? 0.78 : 0.68) * leafGrow;
    const widthLeaf = flower.size * 0.17 * leafGrow;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = side < 0 ? "#3d9a46" : "#58aa4d";
    ctx.strokeStyle = "rgba(25, 91, 35, 0.34)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(length * 0.28, -widthLeaf, length * 0.78, -widthLeaf * 0.55, length, 0);
    ctx.bezierCurveTo(length * 0.72, widthLeaf * 0.8, length * 0.22, widthLeaf * 0.55, 0, 0);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

function drawTulipBloom(flower, open) {
  const size = flower.size * lerp(0.2, 1, open);
  if (size <= 0.5) {
    return;
  }

  ctx.save();
  ctx.fillStyle = "#f47c23";
  ctx.strokeStyle = "rgba(158, 73, 24, 0.32)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-size * 0.58, -size * 0.04);
  ctx.bezierCurveTo(-size * 0.52, -size * 0.72, -size * 0.18, -size * 1.04, 0, -size * 1.2);
  ctx.bezierCurveTo(size * 0.18, -size * 1.04, size * 0.52, -size * 0.72, size * 0.58, -size * 0.04);
  ctx.bezierCurveTo(size * 0.46, size * 0.28, -size * 0.46, size * 0.28, -size * 0.58, -size * 0.04);
  ctx.fill();
  ctx.stroke();

  const petals = [
    [-0.36, -0.54, -0.48],
    [0.36, -0.54, 0.48],
    [0, -0.62, 0],
  ];
  for (const [px, py, rotation] of petals) {
    ctx.save();
    ctx.translate(px * size, py * size);
    ctx.rotate(rotation * open);
    ctx.fillStyle = px === 0 ? "#ff9a2f" : "#f17820";
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.25, size * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  ctx.fillStyle = "#ffb24f";
  ctx.globalAlpha = 0.34;
  ctx.beginPath();
  ctx.ellipse(-size * 0.16, -size * 0.48, size * 0.08, size * 0.34, -0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLilyBloom(flower, open) {
  const size = flower.size * lerp(0.18, 1, open);
  if (size <= 0.5) {
    return;
  }

  ctx.save();
  ctx.rotate(flower.rotation * 0.08);
  ctx.strokeStyle = "rgba(151, 109, 22, 0.3)";
  ctx.lineWidth = 0.9;
  for (let i = 0; i < 6; i += 1) {
    const angle = (i / 6) * Math.PI * 2;
    const curl = Math.sin(i * 1.7 + flower.rotation) * 0.16;
    ctx.save();
    ctx.rotate(angle + curl * open);
    ctx.fillStyle = i % 2 === 0 ? "#ffd84f" : "#ffe778";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(size * 0.26, -size * 0.26, size * 0.3, -size * 0.9, 0, -size * 1.2);
    ctx.bezierCurveTo(-size * 0.32, -size * 0.86, -size * 0.25, -size * 0.24, 0, 0);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  ctx.strokeStyle = "#a36a23";
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 5; i += 1) {
    const angle = -0.58 + i * 0.29;
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -size * 0.66);
    ctx.stroke();
    ctx.fillStyle = "#a95120";
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.71, size * 0.055, size * 0.105, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = "#f7b92e";
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLadybugAndMessage(time) {
  if (!ladybug || flowers.length === 0 || time < ladybug.introStart - 0.5) {
    return;
  }

  drawMessagePuffs(time);

  const point = ladybugMessagePointAt(time);
  drawLadybug(point.x, point.y, point.direction, point.flying, time);
}

function drawMessagePuffs(time) {
  ctx.save();
  for (const puff of messageClouds) {
    const progress = smooth((time - puff.appear) / puff.duration);
    if (progress <= 0) {
      continue;
    }

    const settle = smooth(progress);
    const x = lerp(puff.startX, puff.targetX, settle) + Math.sin((time - puff.appear) * 2.2) * puff.drift * (1 - settle);
    const y = lerp(puff.startY, puff.targetY, settle) - Math.sin(progress * Math.PI) * 7;
    const radius = puff.radius * lerp(0.46, 1, settle);
    ctx.globalAlpha = lerp(0.42, 0.94, settle);
    ctx.fillStyle = "#fffdf8";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.12 * settle;
    ctx.fillStyle = "#8fb8cf";
    ctx.beginPath();
    ctx.arc(x + radius * 0.24, y + radius * 0.28, radius * 0.72, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawLadybug(x, y, direction, flying, time) {
  const size = clamp(Math.min(width, height) * 0.035, 20, 34);
  const flap = flying ? Math.sin(time * 21) : 0;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(direction >= 0 ? 1 : -1, 1);
  ctx.rotate(flying ? Math.sin(time * 3.2) * 0.06 : -0.08 + Math.sin(time * 0.55) * 0.04);

  if (flying) {
    ctx.save();
    ctx.globalAlpha = 0.44;
    ctx.fillStyle = "#fff8ed";
    ctx.strokeStyle = "rgba(155, 190, 205, 0.3)";
    ctx.lineWidth = 0.8;
    ctx.translate(-size * 0.16, -size * 0.34);
    ctx.rotate(-0.25 - Math.abs(flap) * 0.75);
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.64, size * 0.22, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.34;
    ctx.fillStyle = "#fff8ed";
    ctx.translate(-size * 0.08, -size * 0.2);
    ctx.rotate(0.18 + Math.abs(flap) * 0.42);
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.54, size * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = "#26211e";
  ctx.beginPath();
  ctx.arc(size * 0.57, -size * 0.06, size * 0.24, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#211512";
  ctx.lineWidth = 1.1;
  for (const leg of [-0.42, -0.08, 0.25]) {
    ctx.beginPath();
    ctx.moveTo(leg * size, size * 0.34);
    ctx.lineTo((leg + 0.1) * size, size * 0.55);
    ctx.stroke();
  }

  ctx.fillStyle = "#d92d28";
  ctx.strokeStyle = "#241712";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.ellipse(-size * 0.08, 0, size * 0.7, size * 0.48, -0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#241712";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-size * 0.67, -size * 0.02);
  ctx.bezierCurveTo(-size * 0.26, -size * 0.18, size * 0.24, -size * 0.18, size * 0.55, -size * 0.04);
  ctx.stroke();

  ctx.fillStyle = "#241712";
  const spots = [
    [-0.43, -0.12],
    [-0.31, 0.18],
    [-0.04, -0.24],
    [0.14, 0.12],
    [0.31, -0.05],
  ];
  for (const [sx, sy] of spots) {
    ctx.beginPath();
    ctx.arc(sx * size, sy * size, size * 0.075, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#fff4df";
  ctx.beginPath();
  ctx.arc(size * 0.67, -size * 0.12, size * 0.04, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#241712";
  ctx.lineWidth = 0.9;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(size * 0.68, -size * 0.23);
    ctx.quadraticCurveTo(size * 0.82, -size * (0.36 + side * 0.02), size * 0.94, -size * (0.4 + side * 0.08));
    ctx.stroke();
  }
  ctx.restore();
}

function drawSunsetTint(time) {
}

function drawPetalMessage() {
}

function draw(timeMs) {
  const time = (timeMs - startTime) / 1000;
  const displayTime = time;

  ctx.clearRect(0, 0, width, height);
  drawSky(displayTime);
  drawGrass(displayTime);

  for (const flower of flowers) {
    drawFlower(flower, displayTime);
  }

  drawPlanter();
  drawLadybugAndMessage(displayTime);
  drawSunsetTint(displayTime);

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

const tempo = 64;
const beatSeconds = 60 / tempo;
const chords = [
  ["C3", "G3", "E4", "G4", "C5", "E5"],
  ["G2", "D3", "B3", "D4", "G4", "B4"],
  ["A2", "E3", "C4", "E4", "A4", "C5"],
  ["F2", "C3", "A3", "C4", "F4", "A4"],
  ["D3", "A3", "F4", "A4", "C5", "F5"],
  ["G2", "D3", "B3", "D4", "G4", "D5"],
  ["C3", "G3", "D4", "E4", "G4", "C5"],
  ["F2", "C3", "A3", "C4", "E4", "A4"],
];
const melody = [
  "E5", null, null, "D5", null, null, "C5", null,
  null, "B4", null, null, "A4", null, null, "G4",
  null, null, "A4", null, null, "C5", null, null,
  "E5", null, null, "D5", null, null, "C5", null,
  null, "D5", null, null, "F5", null, null, "E5",
  null, null, "D5", null, null, "B4", null, null,
];
const guitarPattern = [0, 2, 4, 1, 3, 5];

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
  tune.master.gain.value = 0.34;
  tune.compressor = tune.context.createDynamicsCompressor();
  tune.compressor.threshold.value = -20;
  tune.compressor.knee.value = 24;
  tune.compressor.ratio.value = 3;
  tune.compressor.attack.value = 0.012;
  tune.compressor.release.value = 0.34;

  tune.filter = tune.context.createBiquadFilter();
  tune.filter.type = "lowpass";
  tune.filter.frequency.value = 3100;
  tune.filter.Q.value = 0.45;

  tune.delay = tune.context.createDelay(2);
  tune.delay.delayTime.value = beatSeconds * 1.5;
  tune.feedback = tune.context.createGain();
  tune.feedback.gain.value = 0.14;

  tune.filter.connect(tune.master);
  tune.filter.connect(tune.delay);
  tune.delay.connect(tune.feedback);
  tune.feedback.connect(tune.delay);
  tune.delay.connect(tune.master);
  tune.master.connect(tune.compressor);
  tune.compressor.connect(tune.context.destination);
}

function playAcousticPluck(note, start, duration, velocity = 0.5) {
  const frequency = noteFrequency(note);
  const gain = tune.context.createGain();
  const body = tune.context.createBiquadFilter();
  const fundamental = tune.context.createOscillator();
  const overtone = tune.context.createOscillator();
  const air = tune.context.createOscillator();

  fundamental.type = "triangle";
  overtone.type = "triangle";
  air.type = "sine";
  fundamental.frequency.setValueAtTime(frequency, start);
  overtone.frequency.setValueAtTime(frequency * 2.005, start);
  air.frequency.setValueAtTime(frequency * 3.01, start);
  fundamental.detune.setValueAtTime(-4, start);
  overtone.detune.setValueAtTime(3, start);

  body.type = "bandpass";
  body.frequency.value = clamp(frequency * 1.35, 180, 1100);
  body.Q.value = 0.85;

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, velocity), start + 0.012);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, velocity * 0.28), start + 0.16);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, velocity * 0.12), start + duration * 0.55);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  const fundamentalGain = tune.context.createGain();
  const overtoneGain = tune.context.createGain();
  const airGain = tune.context.createGain();
  fundamentalGain.gain.value = 0.76;
  overtoneGain.gain.value = 0.22;
  airGain.gain.value = 0.08;

  fundamental.connect(fundamentalGain);
  overtone.connect(overtoneGain);
  air.connect(airGain);
  fundamentalGain.connect(body);
  overtoneGain.connect(body);
  airGain.connect(body);
  body.connect(gain);
  gain.connect(tune.filter);

  fundamental.start(start);
  overtone.start(start);
  air.start(start);
  fundamental.stop(start + duration + 0.08);
  overtone.stop(start + duration + 0.08);
  air.stop(start + duration + 0.08);
}

function playGardenChime(note, start, duration, velocity = 0.16) {
  const frequency = noteFrequency(note);
  const gain = tune.context.createGain();
  const tone = tune.context.createOscillator();
  const shimmer = tune.context.createOscillator();

  tone.type = "sine";
  shimmer.type = "sine";
  tone.frequency.setValueAtTime(frequency, start);
  shimmer.frequency.setValueAtTime(frequency * 2.01, start);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, velocity), start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  const shimmerGain = tune.context.createGain();
  shimmerGain.gain.value = 0.28;
  tone.connect(gain);
  shimmer.connect(shimmerGain);
  shimmerGain.connect(gain);
  gain.connect(tune.delay);

  tone.start(start);
  shimmer.start(start);
  tone.stop(start + duration + 0.12);
  shimmer.stop(start + duration + 0.12);
}

function playOpeningChord(start) {
  const notes = ["C3", "G3", "E4", "G4", "C5"];
  for (let i = 0; i < notes.length; i += 1) {
    playAcousticPluck(notes[i], start + i * 0.09, beatSeconds * 3.8, i === 0 ? 0.34 : 0.22);
  }
  playGardenChime("E5", start + beatSeconds * 1.2, beatSeconds * 3.4, 0.1);
}

function scheduleStep(time) {
  const beat = tune.step % 48;
  const chordIndex = Math.floor(beat / 6) % chords.length;
  const chord = chords[chordIndex];
  const position = beat % 6;
  const note = chord[guitarPattern[position] % chord.length];
  const isBass = position === 0;

  playAcousticPluck(note, time, beatSeconds * (isBass ? 3.2 : 2.15), isBass ? 0.25 : 0.16);
  if (position === 3) {
    playAcousticPluck(chord[2], time + beatSeconds * 0.28, beatSeconds * 2.1, 0.1);
  }

  const lead = melody[beat];
  if (lead) {
    playAcousticPluck(lead, time + beatSeconds * 0.08, beatSeconds * 2.6, 0.13);
  }

  if (position === 5 && chordIndex % 2 === 1) {
    const chimeNote = chordIndex % 4 === 1 ? "G5" : "E5";
    playGardenChime(chimeNote, time + beatSeconds * 0.18, beatSeconds * 3.2, 0.075);
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
    tune.master.gain.setTargetAtTime(0.34, tune.context.currentTime, 0.05);
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
        tune.master.gain.value = 0.34;
      }
    }, 220);
    musicToggle.setAttribute("aria-pressed", "false");
  }
}

if (musicToggle) {
  musicToggle.addEventListener("click", toggleMusic);
}
