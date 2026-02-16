/* =========================
   Helper
========================= */
const $ = (s) => document.querySelector(s);
const pad2 = (n) => String(n).padStart(2, "0");
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* =========================
   Elements
========================= */
const headline = $("#headline");   // dòng chữ chúc (ở panel)
const sub = $("#sub");             // dòng phụ (ở panel)
const nameInput = $("#name");
const yearInput = $("#year");
const applyBtn = $("#apply");
const celebrateBtn = $("#celebrate");
const toggleMusicBtn = $("#toggleMusic");
const music = $("#music");


// số năm to trên khung (2 số cuối)
const yearBig = $("#yearBig");

/* =========================
   Default year
========================= */
const now = new Date();
let targetYear = now.getFullYear() + 1;

// nếu input year có sẵn value từ HTML thì dùng
if (yearInput) {
  const v = Number(yearInput.value);
  if (!Number.isNaN(v) && v > 1900) targetYear = v;
  yearInput.value = targetYear;
}

// set 2 số cuối lên khung
if (yearBig) yearBig.textContent = String(targetYear).slice(-2);

/* =========================
   Apply Greeting
========================= */
function applyGreeting() {
  const nm = (nameInput?.value || "").trim();
  const yr = Number(yearInput?.value) || targetYear;

  targetYear = yr;

  // update số năm to (lấy 2 số cuối)
  if (yearBig) yearBig.textContent = String(yr).slice(-2);

  // update lời chúc
  if (headline) headline.textContent = nm ? `Happy New Year, ${nm}! ✨` : "Happy New Year! ✨";
  if (sub) sub.textContent = `Em/Anh/Cường xin chúc mọi người năm mới ${yr} thật nhiều sức khỏe, nhiều may mắn và niềm vui trong cuộc sống ^^✨`;
}

applyBtn?.addEventListener("click", applyGreeting);

/* =========================
   Music toggle
   - Browser chặn autoplay => phải click nút mới play được
========================= */
let musicOn = false;

async function toggleMusic() {
  try {
    if (!musicOn) {
      await music.play();
      musicOn = true;
      toggleMusicBtn.textContent = "🔊 Nhạc";
    } else {
      music.pause();
      musicOn = false;
      toggleMusicBtn.textContent = "🔇 Nhạc";
    }
  } catch (e) {
    alert("Không phát được nhạc. Hãy đặt file newyear.mp3 cùng thư mục (root) và bấm lại.");
  }
}

toggleMusicBtn?.addEventListener("click", toggleMusic);

/* =========================
   Fireworks Canvas
========================= */
const canvas = $("#fx");
const ctx = canvas?.getContext("2d");

let W = 0, H = 0;
function resizeCanvas() {
  if (!canvas || !ctx) return;

  // dùng devicePixelRatio để nét hơn
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;

  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  W = w;
  H = h;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Particles
const particles = [];

function rand(a, b) {
  return a + Math.random() * (b - a);
}

function boom(x, y) {
  // số hạt
  const count = Math.floor(rand(70, 130));

  // màu ưu tiên vàng/đỏ cho hợp theme
  const baseHues = [10, 25, 40, 340, 0]; // đỏ/cam/vàng
  const base = baseHues[Math.floor(Math.random() * baseHues.length)];
  const hueJitter = rand(-18, 18);

  for (let i = 0; i < count; i++) {
    const speed = rand(1.6, 4.8);
    const angle = rand(0, Math.PI * 2);

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - rand(1.0, 2.2),
      life: rand(45, 95),
      maxLife: 0,
      r: rand(1.2, 2.8),
      hue: (base + hueJitter + rand(-10, 10) + 360) % 360
    });
  }

  // set maxLife sau khi push (để tính alpha)
  for (let i = particles.length - count; i < particles.length; i++) {
    particles[i].maxLife = particles[i].life;
  }
}

// draw loop
function draw() {
  if (!ctx) return;

  // phủ nhẹ để tạo vệt mờ (trail)
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(0, 0, W, H);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    // physics
    p.life -= 1;
    p.vy += 0.07;  // gravity
    p.vx *= 0.988; // drag
    p.vy *= 0.988;

    p.x += p.vx;
    p.y += p.vy;

    // alpha theo tuổi thọ
    const alpha = clamp(p.life / p.maxLife, 0, 1);

    ctx.beginPath();
    ctx.fillStyle = `hsla(${p.hue}, 100%, 65%, ${alpha})`;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();

    // remove
    if (p.life <= 0 || p.x < -50 || p.x > W + 50 || p.y < -50 || p.y > H + 50) {
      particles.splice(i, 1);
    }
  }

  requestAnimationFrame(draw);
}
draw();

/* =========================
   Interactions
========================= */
celebrateBtn?.addEventListener("click", () => {
  boom(rand(120, W - 120), rand(90, H * 0.45));
});

// click bất kỳ để bắn
window.addEventListener("pointerdown", (e) => {
  // tránh bắn khi click vào input/button (cho đỡ khó chịu)
  const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
  if (["input", "button", "label"].includes(tag)) return;

  boom(e.clientX, e.clientY);
});

// auto bắn nhẹ cho vui
setInterval(() => {
  if (particles.length < 900) {
    boom(rand(120, W - 120), rand(80, H * 0.42));
  }
}, 1100);

/* =========================
   Init
========================= */
applyGreeting(); // set nội dung ban đầu
let player;
let ytReady = false;

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '0',
    width: '0',
    videoId: 'n8l_j0UKT3Y',
    playerVars: {
      autoplay: 1,
      loop: 1,
      playlist: 'n8l_j0UKT3Y',
    },
    events: {
      onReady: (event) => {
        ytReady = true;
        event.target.playVideo();
      }
    }
  });
}

// nút nhạc
toggleMusicBtn?.addEventListener("click", () => {
  if (!ytReady) return;

  const state = player.getPlayerState();
  if (state === 1) {
    player.pauseVideo();
    toggleMusicBtn.textContent = "🔇 Nhạc";
  } else {
    player.playVideo();
    toggleMusicBtn.textContent = "🔊 Nhạc";
  }
});
