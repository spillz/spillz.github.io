const canvas = document.getElementById("garden");
const ctx = canvas.getContext("2d");
const musicToggle = document.getElementById("music-toggle");
const envelopeCover = document.getElementById("envelope-cover");

const GROWTH_SECONDS = 82;
const MESSAGE_START_SECONDS = 42;
const SUNSET_SECONDS = 96;
const BRANCH_LIMIT = 280;
const LEAF_LIMIT = 720;
const FLOWER_LIMIT = 200;
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

function addFoliage(branch, random) {
  const leafCount = clamp(Math.round(branch.length * 10 + (7 - branch.depth) * 0.5), 1, 6);
  for (let i = 0; i < leafCount && leaves.length < LEAF_LIMIT; i += 1) {
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

  if (branch.depth >= 2 && buds.length < FLOWER_LIMIT && (branch.role === "twig" ? random() > 0.38 : random() > 0.76)) {
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

const tempo = 76;
const beatSeconds = 60 / tempo;
const chords = [
  ["C3", "G3", "C4", "E4"],
  ["G2", "D3", "B3", "D4"],
  ["A2", "E3", "C4", "E4"],
  ["F2", "C3", "A3", "C4"],
  ["D3", "A3", "C4", "F4"],
  ["G2", "D3", "G3", "B3"],
  ["C3", "E3", "G3", "D4"],
  ["F2", "C3", "F3", "A3"],
];
const melody = [
  "E4", null, "G4", "A4", "G4", null, "E4", "D4",
  "C4", null, "E4", "G4", "E4", null, "D4", "C4",
  "A3", null, "C4", "E4", "G4", null, "E4", "C4",
  "F4", null, "E4", "D4", "C4", null, "G3", null,
  "D4", null, "F4", "A4", "G4", null, "F4", "D4",
  "B3", null, "D4", "G4", "F4", null, "D4", "B3",
  "E4", null, "G4", "C5", "B4", null, "G4", "E4",
  "A4", null, "G4", "E4", "F4", null, "E4", null,
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
  tune.master.gain.value = 0.42;
  tune.compressor = tune.context.createDynamicsCompressor();
  tune.compressor.threshold.value = -18;
  tune.compressor.knee.value = 24;
  tune.compressor.ratio.value = 4;
  tune.compressor.attack.value = 0.008;
  tune.compressor.release.value = 0.22;

  tune.filter = tune.context.createBiquadFilter();
  tune.filter.type = "lowpass";
  tune.filter.frequency.value = 4200;
  tune.filter.Q.value = 0.6;

  tune.delay = tune.context.createDelay(1.2);
  tune.delay.delayTime.value = beatSeconds * 0.75;
  tune.feedback = tune.context.createGain();
  tune.feedback.gain.value = 0.18;

  tune.filter.connect(tune.master);
  tune.filter.connect(tune.delay);
  tune.delay.connect(tune.feedback);
  tune.feedback.connect(tune.delay);
  tune.delay.connect(tune.master);
  tune.master.connect(tune.compressor);
  tune.compressor.connect(tune.context.destination);
}

function playElectricPianoNote(note, start, duration, velocity = 0.5) {
  const frequency = noteFrequency(note);
  const gain = tune.context.createGain();
  const fundamentalGain = tune.context.createGain();
  const overtoneGain = tune.context.createGain();
  const chimeGain = tune.context.createGain();
  const fundamental = tune.context.createOscillator();
  const overtone = tune.context.createOscillator();
  const chime = tune.context.createOscillator();

  fundamental.type = "triangle";
  overtone.type = "sine";
  chime.type = "sine";
  fundamental.frequency.setValueAtTime(frequency, start);
  overtone.frequency.setValueAtTime(frequency * 2.01, start);
  chime.frequency.setValueAtTime(frequency * 3.98, start);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, velocity), start + 0.018);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, velocity * 0.38), start + 0.18);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  fundamentalGain.gain.setValueAtTime(0.8, start);
  overtoneGain.gain.setValueAtTime(0.28, start);
  chimeGain.gain.setValueAtTime(0.16, start);

  fundamental.connect(fundamentalGain);
  overtone.connect(overtoneGain);
  chime.connect(chimeGain);
  fundamentalGain.connect(gain);
  overtoneGain.connect(gain);
  chimeGain.connect(gain);
  gain.connect(tune.filter);

  fundamental.start(start);
  overtone.start(start);
  chime.start(start);
  fundamental.stop(start + duration + 0.08);
  overtone.stop(start + duration + 0.08);
  chime.stop(start + duration + 0.08);
}

function playOpeningChord(start) {
  const notes = ["C3", "G3", "C4", "E4", "G4"];
  for (let i = 0; i < notes.length; i += 1) {
    playElectricPianoNote(notes[i], start + i * 0.035, beatSeconds * 3.2, i === 0 ? 0.42 : 0.32);
  }
}

function scheduleStep(time) {
  const beat = tune.step % 64;
  const chordIndex = Math.floor(beat / 8) % chords.length;
  const chord = chords[chordIndex];
  const position = beat % 8;

  playElectricPianoNote(chord[position % chord.length], time, beatSeconds * 1.6, 0.28);
  if (position === 0 || position === 4) {
    for (let i = 0; i < chord.length; i += 1) {
      playElectricPianoNote(chord[i], time + i * 0.018, beatSeconds * 2.4, i === 0 ? 0.34 : 0.22);
    }
  }

  const lead = melody[beat];
  if (lead) {
    playElectricPianoNote(lead, time + beatSeconds * 0.04, beatSeconds * 1.15, 0.38);
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
