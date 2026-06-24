/* ============================================================
   PRÉMIOS LUSÓFONOS · CRIATIVIDADE EM SAÚDE · 2026
   Cinematic landing — scroll + autoplay
============================================================ */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* -------------------------------------------------------------
   1. Scroll reveals (IntersectionObserver) + stagger
------------------------------------------------------------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

$$('.reveal, [data-pop]').forEach((el, i) => io.observe(el));

// stagger reveals that share a parent group
$$('.cols, .hero-cta, .manifesto, .timeline, .foot-grid').forEach(group => {
  $$('.reveal', group).forEach((el, i) => el.style.setProperty('--d', (i * 0.09) + 's'));
});

/* -------------------------------------------------------------
   2. Nav state + scroll progress
------------------------------------------------------------- */
const nav = $('#nav');
const progressBar = $('#progressBar');
function onScroll() {
  const y = window.scrollY;
  nav.classList.toggle('solid', y > 60);
  const h = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = clamp((y / h) * 100, 0, 100) + '%';
  updateOpener();
  parallax(y);
}
window.addEventListener('scroll', onScroll, { passive: true });

/* -------------------------------------------------------------
   3. "Formas que abrem a seção" — radial mask opens as the
      Por-que section scrolls into the centre of the viewport.
------------------------------------------------------------- */
const porque = $('#porque');
const opener = $('#opener');
const aberturaVideo = $('#aberturaVideo');
let aberturaStarted = false;

function updateOpener() {
  if (!porque || !opener) return;
  const r = porque.getBoundingClientRect();
  const vh = window.innerHeight;
  // progress: 0 when section top enters bottom, 1 when centred
  const p = clamp(1 - (r.top - vh * 0.1) / (vh * 0.9), 0, 1);
  // ease — drives the capsule split (--open 0..1)
  const eased = p < 0 ? 0 : (1 - Math.pow(1 - p, 3));
  opener.style.setProperty('--open', eased.toFixed(3));
  // optional upgrade: if abertura.mp4 exists, fade it in over the capsule
  if (eased > 0.05 && !aberturaStarted) {
    aberturaStarted = true;
    aberturaVideo?.play?.()
      .then(() => aberturaVideo.classList.add('live'))
      .catch(() => {}); // no file → procedural capsule stays
  }
}

/* -------------------------------------------------------------
   4. Parallax on floating blobs + hero video drift
------------------------------------------------------------- */
const forms = $$('.form');
const heroMedia = $('#heroMedia');
// anchor each form to its section so parallax is smooth across the page
const formAnchors = forms.map(f => (f.closest('.s')?.offsetTop ?? 0));
function parallax(y) {
  const vh = window.innerHeight;
  forms.forEach((f, i) => {
    const par = parseFloat(f.dataset.par || 0);
    const rel = y - formAnchors[i] + vh;           // scroll relative to the form's section
    f.style.setProperty('--py', (rel * par).toFixed(1) + 'px');
  });
  if (heroMedia) heroMedia.style.transform = `translateY(${y * 0.08}px)`; // no scaling = stays crisp
}

/* -------------------------------------------------------------
   5. 3D tilt / "texto saindo pra fora" — mouse-reactive hero
------------------------------------------------------------- */
const tiltEls = $$('[data-tilt]');
let mx = 0, my = 0, tx = 0, ty = 0;
window.addEventListener('mousemove', (e) => {
  mx = (e.clientX / window.innerWidth - 0.5);
  my = (e.clientY / window.innerHeight - 0.5);
});
function tiltLoop() {
  tx += (mx - tx) * 0.06;
  ty += (my - ty) * 0.06;
  tiltEls.forEach(el => {
    el.style.transform =
      `rotateY(${tx * 10}deg) rotateX(${ty * -10}deg) translateZ(0)`;
  });
  if (heroMedia) {
    heroMedia.style.filter = `hue-rotate(${tx * 16}deg)`;
  }
  requestAnimationFrame(tiltLoop);
}
tiltLoop();

/* -------------------------------------------------------------
   6. Iridescent shimmer / particle layer
------------------------------------------------------------- */
(() => {
  const cv = $('#fx'); if (!cv) return;
  const ctx = cv.getContext('2d');
  let W, H, dots = [];
  const COLORS = ['131,103,223', '255,115,0', '115,3,148', '236,232,246'];
  function resize() {
    W = cv.width = innerWidth; H = cv.height = innerHeight;
    dots = [];
    const n = Math.min(Math.floor(W * H / 26000), 70);
    for (let i = 0; i < n; i++) dots.push({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.18, vy: -0.05 - Math.random() * 0.22,
      r: 0.6 + Math.random() * 1.8, a: 0.08 + Math.random() * 0.4,
      c: COLORS[(Math.random() * COLORS.length) | 0],
      ph: Math.random() * 6.28, ps: 0.008 + Math.random() * 0.012,
    });
  }
  addEventListener('resize', resize); resize();
  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (const d of dots) {
      d.ph += d.ps;
      const a = d.a * (0.5 + 0.5 * Math.sin(d.ph));
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r * 5, 0, 6.28);
      ctx.fillStyle = `rgba(${d.c},${a * 0.05})`; ctx.fill();
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.28);
      ctx.fillStyle = `rgba(${d.c},${a})`; ctx.fill();
      d.x += d.vx; d.y += d.vy;
      if (d.y < -10) { d.y = H + 10; d.x = Math.random() * W; }
      if (d.x < -10) d.x = W + 10; if (d.x > W + 10) d.x = -10;
    }
    requestAnimationFrame(frame);
  }
  frame();
})();

/* -------------------------------------------------------------
   7. Modo cinematográfico (autoplay) — Espaço toca/pausa
      Rola suavemente a página inteira em ~95s.
------------------------------------------------------------- */
let cinePlaying = false, cineRAF = null, cineStart = 0, cineFrom = 0, cineTarget = 0;
const CINE_DURATION = 95000; // ms p/ percorrer a página toda

function cineFrame(t) {
  if (!cinePlaying) return;
  if (!cineStart) { cineStart = t; cineFrom = window.scrollY; }
  const max = document.documentElement.scrollHeight - window.innerHeight;
  cineTarget = max;
  const p = clamp((t - cineStart) / CINE_DURATION, 0, 1);
  // gentle ease in-out
  const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  window.scrollTo(0, cineFrom + (cineTarget - cineFrom) * eased);
  if (p >= 1) { cinePlaying = false; toggleHintFlash('fim'); return; }
  cineRAF = requestAnimationFrame(cineFrame);
}
function startCine() {
  cinePlaying = true; cineStart = 0;
  document.body.classList.add('cine-on');
  cineRAF = requestAnimationFrame(cineFrame);
}
function stopCine() {
  cinePlaying = false; cancelAnimationFrame(cineRAF);
  document.body.classList.remove('cine-on');
}
function toggleHintFlash(msg) {
  const h = $('#cineHint'); if (!h) return;
  h.style.opacity = '1';
}

/* -------------------------------------------------------------
   8. Keyboard
------------------------------------------------------------- */
addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    cinePlaying ? stopCine() : startCine();
  }
  if (e.key.toLowerCase() === 'h') document.body.classList.toggle('hud-hidden');
  if (e.key === 'Home') { stopCine(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
});
// any manual scroll cancels cinematic
['wheel', 'touchstart'].forEach(ev =>
  addEventListener(ev, () => { if (cinePlaying) stopCine(); }, { passive: true }));

/* initial paint */
onScroll();
