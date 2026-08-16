const canvas = document.querySelector("#emblem");
const ctx = canvas.getContext("2d");
const arena = document.querySelector("#arena");
const teamName = document.querySelector("#team-name");
const shortName = document.querySelector("#short-name");
const season = document.querySelector("#season");
const motto = document.querySelector("#motto");
const rosterList = document.querySelector("#roster-list");
const loading = document.querySelector("#loading");
const spinState = document.querySelector("#spin-state");
const editor = document.querySelector("#editor");
const editToggle = document.querySelector("#edit-toggle");
const closeEditor = document.querySelector("#close-editor");
const form = document.querySelector("#detail-form");
const formStatus = document.querySelector("#form-status");
const previewButton = document.querySelector("#preview");
const fields = {
  teamName: document.querySelector("#field-name"),
  shortName: document.querySelector("#field-short"),
  season: document.querySelector("#field-season"),
  motto: document.querySelector("#field-motto"),
  description: document.querySelector("#field-description"),
  primary: document.querySelector("#field-primary"),
  secondary: document.querySelector("#field-secondary")
};
const colorValues = {
  primary: document.querySelector("#primary-value"),
  secondary: document.querySelector("#secondary-value")
};

const state = {
  teams: [],
  selected: 0,
  rotation: -0.18,
  tilt: -0.05,
  spin: 0.01,
  reveal: 0,
  rebuilding: false,
  dragging: false,
  pointerX: 0,
  pointerY: 0,
  particles: []
};

const vertices = [[0, -1], [0.78, -0.66], [0.66, 0.46], [0, 0.98], [-0.66, 0.46], [-0.78, -0.66]];

function hash(seed) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function segment(a, b, count, seed) {
  const result = [];
  for (let index = 0; index < count; index += 1) {
    const amount = count === 1 ? 0 : index / (count - 1);
    result.push({
      x: a[0] + (b[0] - a[0]) * amount,
      y: a[1] + (b[1] - a[1]) * amount,
      z: (hash(seed + index) - 0.5) * 0.07,
      size: 1.5 + hash(seed + index + 300) * 1.8,
      offset: hash(seed + index + 600)
    });
  }
  return result;
}

function makeParticles() {
  const result = [];
  vertices.forEach((vertex, index) => result.push(...segment(vertex, vertices[(index + 1) % vertices.length], 34, index * 40 + 1)));
  result.push(...segment([-0.44, -0.44], [-0.08, 0.46], 28, 400));
  result.push(...segment([-0.08, 0.46], [0.46, -0.44], 34, 500));
  result.push(...segment([0.46, -0.44], [0.46, 0.03], 14, 600));
  result.push(...segment([-0.44, -0.44], [0.12, -0.44], 18, 700));
  for (let index = 0; index < 44; index += 1) {
    const angle = (Math.PI * 2 * index) / 44;
    const radius = 0.16 + hash(index + 900) * 0.08;
    result.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, z: 0, size: 1.4 + hash(index + 1000) * 2, offset: hash(index + 1100) });
  }
  return result;
}

function resize() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function currentTeam() {
  return state.teams[state.selected];
}

function applyTeam(team) {
  if (!team) return;
  teamName.textContent = team.teamName;
  shortName.textContent = team.shortName;
  season.textContent = team.season;
  motto.textContent = team.motto;
  arena.style.setProperty("--particle", team.primary);
  arena.style.setProperty("--accent", team.secondary);
  fields.teamName.value = team.teamName;
  fields.shortName.value = team.shortName;
  fields.season.value = team.season;
  fields.motto.value = team.motto;
  fields.description.value = team.description;
  fields.primary.value = team.primary;
  fields.secondary.value = team.secondary;
  colorValues.primary.textContent = team.primary.toUpperCase();
  colorValues.secondary.textContent = team.secondary.toUpperCase();
  formStatus.textContent = "";
  renderRoster();
}

function renderRoster() {
  rosterList.replaceChildren();
  state.teams.forEach((team, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = index === state.selected ? "roster-item active" : "roster-item";
    button.innerHTML = `<span>${String(index + 1).padStart(2, "0")}</span><b>${team.shortName}</b>`;
    button.addEventListener("click", () => {
      state.selected = index;
      state.reveal = 0;
      state.rebuilding = true;
      applyTeam(currentTeam());
    });
    rosterList.append(button);
  });
}

function draw() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  ctx.clearRect(0, 0, width, height);
  state.rotation += state.spin;
  if (state.rebuilding) {
    state.reveal += 0.018;
    if (state.reveal >= 1) {
      state.reveal = 1;
      state.rebuilding = false;
    }
  }
  const scale = Math.min(width, height) * 0.28;
  const centerX = width * 0.5;
  const centerY = height * 0.49;
  const team = currentTeam();
  const primary = team?.primary || "#f4f0e8";
  const accent = team?.secondary || "#f24b3b";
  for (let index = 0; index < state.particles.length; index += 1) {
    const particle = state.particles[index];
    const scatterX = (hash(index + 1500) - 0.5) * 5.5;
    const scatterY = (hash(index + 1800) - 0.5) * 3.5;
    const spread = 1 - state.reveal;
    const sourceX = particle.x + scatterX * spread;
    const sourceY = particle.y + scatterY * spread;
    const sourceZ = particle.z + (hash(index + 2100) - 0.5) * 3.5 * spread;
    const cos = Math.cos(state.rotation);
    const sin = Math.sin(state.rotation);
    const rotatedX = sourceX * cos - sourceZ * sin;
    const rotatedZ = sourceX * sin + sourceZ * cos;
    const depth = 1 + rotatedZ * 0.12;
    const x = centerX + rotatedX * scale;
    const y = centerY + sourceY * scale + Math.sin(state.tilt) * rotatedZ * scale * 0.22;
    const alpha = Math.max(0.1, Math.min(1, 0.34 + depth * 0.28)) * (0.65 + state.reveal * 0.35);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = particle.offset > 0.78 ? accent : primary;
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.7, particle.size * depth), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(draw);
}

function openEditor(open) {
  editor.classList.toggle("open", open);
  editor.setAttribute("aria-hidden", String(!open));
  editToggle.setAttribute("aria-expanded", String(open));
  editToggle.textContent = open ? "关闭编辑" : "编辑明细";
}

function readForm() {
  return {
    ...currentTeam(),
    teamName: fields.teamName.value.trim(),
    shortName: fields.shortName.value.trim(),
    season: fields.season.value.trim(),
    motto: fields.motto.value.trim(),
    description: fields.description.value.trim(),
    primary: fields.primary.value,
    secondary: fields.secondary.value
  };
}

function preview() {
  state.teams[state.selected] = readForm();
  applyTeam(currentTeam());
  formStatus.textContent = "预览已更新，保存后同步到服务。";
}

async function save(event) {
  event.preventDefault();
  const detail = readForm();
  formStatus.textContent = "正在同步…";
  try {
    const response = await fetch(`/api/showcases/${encodeURIComponent(detail.id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(detail)
    });
    if (!response.ok) throw new Error("sync failed");
    state.teams[state.selected] = await response.json();
    applyTeam(currentTeam());
    formStatus.textContent = "已保存到亮相明细。";
  } catch (_error) {
    formStatus.textContent = "保存失败，请检查服务状态。";
  }
}

function changeSpin(direction) {
  if (direction === "left") state.spin = -Math.max(0.004, Math.abs(state.spin));
  if (direction === "right") state.spin = Math.max(0.004, Math.abs(state.spin));
  if (direction === "up") state.spin = Math.min(0.032, state.spin + (state.spin < 0 ? -0.004 : 0.004));
  if (direction === "down") state.spin = Math.max(-0.032, state.spin - (state.spin < 0 ? -0.004 : 0.004));
  const directionLabel = state.spin < 0 ? "逆时针" : "顺时针";
  spinState.textContent = `${directionLabel} ${(Math.abs(state.spin) / 0.01).toFixed(1)}×`;
}

document.querySelector("#rebuild").addEventListener("click", () => {
  state.reveal = 0;
  state.rebuilding = true;
});
document.querySelector("#previous-team").addEventListener("click", () => {
  state.selected = (state.selected + state.teams.length - 1) % state.teams.length;
  state.reveal = 0;
  state.rebuilding = true;
  applyTeam(currentTeam());
});
document.querySelector("#next-team").addEventListener("click", () => {
  state.selected = (state.selected + 1) % state.teams.length;
  state.reveal = 0;
  state.rebuilding = true;
  applyTeam(currentTeam());
});
editToggle.addEventListener("click", () => openEditor(!editor.classList.contains("open")));
closeEditor.addEventListener("click", () => openEditor(false));
previewButton.addEventListener("click", preview);
form.addEventListener("submit", save);
fields.primary.addEventListener("input", () => { colorValues.primary.textContent = fields.primary.value.toUpperCase(); });
fields.secondary.addEventListener("input", () => { colorValues.secondary.textContent = fields.secondary.value.toUpperCase(); });
window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    state.reveal = 0;
    state.rebuilding = true;
  }
  if (event.key === "ArrowLeft") changeSpin("left");
  if (event.key === "ArrowRight") changeSpin("right");
  if (event.key === "ArrowUp") changeSpin("up");
  if (event.key === "ArrowDown") changeSpin("down");
});
canvas.addEventListener("pointerdown", (event) => {
  state.dragging = true;
  state.pointerX = event.clientX;
  state.pointerY = event.clientY;
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener("pointermove", (event) => {
  if (!state.dragging) return;
  state.rotation += (event.clientX - state.pointerX) * 0.008;
  state.tilt += (event.clientY - state.pointerY) * 0.004;
  state.pointerX = event.clientX;
  state.pointerY = event.clientY;
});
canvas.addEventListener("pointerup", (event) => {
  state.dragging = false;
  canvas.releasePointerCapture(event.pointerId);
});

async function start() {
  state.particles = makeParticles();
  resize();
  window.addEventListener("resize", resize);
  draw();
  try {
    const response = await fetch("/api/showcases");
    if (!response.ok) throw new Error("load failed");
    state.teams = (await response.json()).items;
    applyTeam(currentTeam());
    loading.classList.add("hidden");
  } catch (_error) {
    loading.querySelector("b").textContent = "SERVICE OFFLINE";
  }
}

start();
