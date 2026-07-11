// js/main.js
import { PerformanceGuard } from './core/performance-guard.js';
import { initCursor } from './core/cursor.js';
import { initAudio } from './core/audio.js';
import { createHeroScene } from './three/scene-hero.js';
import { createAuroraScene } from './three/scene-aurora.js';
import {
  renderTimeline, renderProjects, openProjectOverlay, closeProjectOverlay,
  renderGallery, renderFriends, renderMoments, renderVideos,
  renderQuotes, renderBlog, openBlogOverlay, closeBlogOverlay
} from './render/render.js';

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);

/* ==========================================================
   PRELOADER
========================================================== */
const preloader = document.getElementById('preloader');
const preloaderFill = document.getElementById('preloaderFill');
const preloaderPct = document.getElementById('preloaderPct');
let loadProgress = 0;
const loadTimer = setInterval(() => {
  loadProgress += Math.random() * 16;
  if (loadProgress >= 100) loadProgress = 100;
  if (preloaderFill) preloaderFill.style.width = loadProgress + '%';
  if (preloaderPct) preloaderPct.textContent = Math.floor(loadProgress) + '%';
  if (loadProgress >= 100) {
    clearInterval(loadTimer);
    setTimeout(boot, 260);
  }
}, 130);
setTimeout(() => { if (loadProgress < 100) { loadProgress = 100; } }, 3500);

function finishPreloader() {
  preloader.classList.add('is-done');
  document.body.classList.remove('is-loading');
  setTimeout(() => { preloader.style.display = 'none'; }, 900);
}

/* ==========================================================
   BOOT SEQUENCE
========================================================== */
let heroScene = null;
let auroraScene = null;

function boot() {
  PerformanceGuard.probe((tier) => {
    document.documentElement.dataset.quality = tier;
    initLenis();
    initCursor(PerformanceGuard);
    initAudio();
    renderAllSections();
    initThreeScenes();
    initHeroIntro();
    initScrollSystems();
    initGallery();
    initMoments();
    initQuotes();
    initAchievements();
    initGoals();
    initContactParticles();
    initNav();
    initMisc();
    initShowcase();
    finishPreloader();
  });
}

/* ==========================================================
   LENIS SMOOTH SCROLL + GSAP TICKER BRIDGE
========================================================== */
function initLenis() {
  if (PerformanceGuard.reducedMotion || !window.Lenis) return;
  const lenis = window.__lenis = new window.Lenis({
    duration: 1.05,
    smoothWheel: true,
    smoothTouch: false
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);
}

/* ==========================================================
   THREE.JS SCENES
========================================================== */
function initThreeScenes() {
  if (PerformanceGuard.isLite) return;
  const heroCanvas = document.getElementById('heroCanvas');
  const auroraCanvas = document.getElementById('auroraCanvas');
  if (heroCanvas) heroScene = createHeroScene(heroCanvas, PerformanceGuard);
  if (auroraCanvas) auroraScene = createAuroraScene(auroraCanvas, PerformanceGuard);
}

/* ==========================================================
   HERO INTRO (SplitType letter reveal)
========================================================== */
function initHeroIntro() {
  const hero = document.getElementById('hero');
  if (window.SplitType) {
    new window.SplitType('#heroTitle', { types: 'chars, words' });
  }
  const chars = document.querySelectorAll('#heroTitle .char');
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.set(hero, {}, 0);
  tl.to('.nav', { opacity: 1, y: 0, duration: 0.8 }, 0.1);
  tl.from(chars.length ? chars : '#heroTitle', {
    yPercent: 120, opacity: 0, stagger: 0.02, duration: 1.1
  }, 0.2);
  tl.from('#heroEyebrow', { opacity: 0, y: 14, duration: 0.7 }, 0.15);
  tl.from('#heroSubtitle', { opacity: 0, y: 14, duration: 0.8 }, 0.55);
  tl.from('.hero__cta', { opacity: 0, y: 18, duration: 0.8 }, 0.7);
  tl.from('.hero__scroll', { opacity: 0, duration: 0.6 }, 0.9);
  hero.classList.add('is-ready');
}

/* ==========================================================
   RENDER ALL DATA-DRIVEN SECTIONS
========================================================== */
function renderAllSections() {
  renderTimeline();
  renderProjects(openProjectOverlay);
  renderFriends();
  renderMoments();
  renderVideos();
  renderQuotes();
  renderBlog(openBlogOverlay);

  document.getElementById('closeProjectOverlayBackdrop')?.addEventListener('click', closeProjectOverlay);
  document.getElementById('projectOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'projectOverlay') closeProjectOverlay();
  });
  document.getElementById('blogOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'blogOverlay') closeBlogOverlay();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeProjectOverlay(); closeBlogOverlay(); }
  });
}

/* ==========================================================
   SCROLL SYSTEMS: reveal, pinned journey, hero fade, nav state
========================================================== */
function initScrollSystems() {
  // Generic reveal for elements marked .reveal / .reveal-item
  const revealTargets = document.querySelectorAll('.reveal, .reveal-item');
  revealTargets.forEach((el) => {
    gsap.fromTo(el, { opacity: 0, y: 40 }, {
      opacity: 1, y: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });

  // Hero fade / parallax tied to scroll, drives three.js camera too
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      if (heroScene) heroScene.setScrollProgress(self.progress);
    }
  });

  // Pinned journey / timeline scroll-storytelling
  const journey = document.getElementById('journey');
  const thread = document.getElementById('journeyThreadFill');
  if (journey && thread) {
    ScrollTrigger.create({
      trigger: journey,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        thread.style.height = (self.progress * 100) + '%';
      }
    });
  }

  // Aurora scene pause when quotes section off-screen (perf)
  const quotesSection = document.getElementById('quotes');
  if (quotesSection && auroraScene) {
    ScrollTrigger.create({
      trigger: quotesSection,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => auroraScene.setActive(true),
      onLeave: () => auroraScene.setActive(false),
      onEnterBack: () => auroraScene.setActive(true),
      onLeaveBack: () => auroraScene.setActive(false)
    });
  }

  // Section mask reveal for About
  gsap.from('#aboutMask', {
    clipPath: 'inset(0 0 100% 0)', duration: 1.3, ease: 'power4.inOut',
    scrollTrigger: { trigger: '#about', start: 'top 70%' }
  });

  ScrollTrigger.refresh();
}

/* ==========================================================
   NAV: scroll state, active link, mobile menu
========================================================== */
function initNav() {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  const toTop = document.getElementById('toTop');
  const navLinks = document.querySelectorAll('[data-nav]');
  const sectionIds = ['about', 'journey', 'projects', 'gallery', 'lifestyle', 'travel', 'friends', 'moments', 'videos', 'showcase', 'achievements', 'goals', 'quotes', 'blog', 'contact'];
  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

  ScrollTrigger.create({
    start: 40, onUpdate: () => {
      const y = window.scrollY;
      nav.classList.toggle('is-scrolled', y > 40);
      if (toTop) toTop.style.opacity = y > 700 ? '1' : '.35';
    }
  });

  sections.forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec, start: 'top 45%', end: 'bottom 45%',
      onToggle: (self) => {
        if (self.isActive) {
          navLinks.forEach((a) => a.classList.toggle('is-active', a.dataset.nav === sec.id));
        }
      }
    });
  });

  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      mobileMenu.classList.toggle('is-open', !open);
      document.body.classList.toggle('menu-open', !open);
    });
    mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
      burger.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('is-open');
      document.body.classList.remove('menu-open');
    }));
  }

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (window.__lenis) window.__lenis.scrollTo(target, { offset: -60 });
      else window.scrollTo({ top: target.offsetTop - 60, behavior: 'smooth' });
    });
  });

  if (toTop) {
    toTop.addEventListener('click', () => {
      if (window.__lenis) window.__lenis.scrollTo(0);
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

/* ==========================================================
   GALLERY LIGHTBOX
========================================================== */
function initGallery() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  let items = [];
  let index = 0;

  function open(i) {
    index = i;
    const img = items[i].querySelector('img');
    lightboxImg.src = img.src.replace('w=1000', 'w=1800');
    lightboxImg.alt = img.alt;
    lightbox.classList.add('is-open');
    document.body.classList.add('overlay-open');
  }
  function close() {
    lightbox.classList.remove('is-open');
    document.body.classList.remove('overlay-open');
  }
  function nav(delta) { open((index + delta + items.length) % items.length); }

  items = renderGallery(open);

  document.getElementById('lightboxClose')?.addEventListener('click', close);
  document.getElementById('lightboxPrev')?.addEventListener('click', () => nav(-1));
  document.getElementById('lightboxNext')?.addEventListener('click', () => nav(1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') nav(-1);
    if (e.key === 'ArrowRight') nav(1);
  });
}

/* ==========================================================
   MOMENTS SLIDER (with clip-path cinematic wipe)
========================================================== */
function initMoments() {
  const track = document.getElementById('momentsTrack');
  if (!track) return;
  const dotsWrap = document.getElementById('momentsDots');
  let idx = 0;
  let slides = [];
  let timer = null;

  function rebuild() {
    slides = Array.from(track.children);
    slides.forEach((s, i) => s.classList.toggle('is-active', i === 0));
    if (dotsWrap) {
      dotsWrap.innerHTML = slides.map((_, i) => `<span data-i="${i}"${i === 0 ? ' class="is-active"' : ''}></span>`).join('');
      dotsWrap.querySelectorAll('span').forEach((dot) => {
        dot.addEventListener('click', () => go(parseInt(dot.dataset.i, 10)));
      });
    }
  }

  function go(next) {
    if (!slides.length) return;
    slides[idx].classList.remove('is-active');
    idx = (next + slides.length) % slides.length;
    slides[idx].classList.add('is-active');
    if (dotsWrap) {
      dotsWrap.querySelectorAll('span').forEach((d, i) => d.classList.toggle('is-active', i === idx));
    }
    restart();
  }
  function restart() {
    clearInterval(timer);
    timer = setInterval(() => go(idx + 1), 5000);
  }

  rebuild();
  restart();
  document.getElementById('momentsPrev')?.addEventListener('click', () => go(idx - 1));
  document.getElementById('momentsNext')?.addEventListener('click', () => go(idx + 1));
}

/* ==========================================================
   QUOTES SLIDER
========================================================== */
function initQuotes() {
  const track = document.getElementById('quotesTrack');
  if (!track) return;
  let idx = 0;
  const slides = Array.from(track.children);
  const dots = document.getElementById('quotesDots');
  function go(next) {
    idx = (next + slides.length) % slides.length;
    gsap.to(track, {
      xPercent: -100 * idx, duration: 0.9, ease: 'power3.inOut'
    });
    if (dots) dots.querySelectorAll('span').forEach((d, i) => d.classList.toggle('is-active', i === idx));
  }
  setInterval(() => go(idx + 1), 4800);
  dots?.querySelectorAll('span').forEach((dot) => {
    dot.addEventListener('click', () => go(parseInt(dot.dataset.i, 10)));
  });
}

/* ==========================================================
   ACHIEVEMENTS COUNTERS
========================================================== */
function initAchievements() {
  document.querySelectorAll('.counter').forEach((el) => {
    const target = parseInt(el.dataset.target, 10) || 0;
    const suffix = el.dataset.suffix || '';
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target, duration: 1.8, ease: 'power3.out',
          onUpdate: () => { el.textContent = Math.floor(obj.val) + suffix; }
        });
      }
    });
  });
}

/* ==========================================================
   GOALS — SVG progress rings
========================================================== */
function initGoals() {
  document.querySelectorAll('.goal-ring').forEach((svg) => {
    const circle = svg.querySelector('.goal-ring__fg');
    const pct = parseFloat(svg.dataset.progress) || 0;
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    circle.style.strokeDasharray = `${circumference}`;
    circle.style.strokeDashoffset = `${circumference}`;
    ScrollTrigger.create({
      trigger: svg, start: 'top 85%', once: true,
      onEnter: () => {
        gsap.to(circle, {
          strokeDashoffset: circumference - (pct / 100) * circumference,
          duration: 1.6, ease: 'power3.out'
        });
      }
    });
  });
}

/* ==========================================================
   CONTACT — canvas particles converge on focus
========================================================== */
function initContactParticles() {
  const canvas = document.getElementById('contactCanvas');
  if (!canvas || PerformanceGuard.isLite) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];
  const N = PerformanceGuard.isFull ? 90 : 45;
  let focused = false;

  function resize() {
    const r = canvas.getBoundingClientRect();
    w = canvas.width = r.width * devicePixelRatio;
    h = canvas.height = r.height * devicePixelRatio;
  }
  function init() {
    particles = Array.from({ length: N }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      tx: Math.random() * w, ty: Math.random() * h,
      r: Math.random() * 1.6 + 0.6
    }));
  }
  function setTargets() {
    particles.forEach((p, i) => {
      if (focused) {
        const angle = (i / particles.length) * Math.PI * 2;
        p.tx = w / 2 + Math.cos(angle) * w * 0.32;
        p.ty = h / 2 + Math.sin(angle) * h * 0.32;
      } else {
        p.tx = Math.random() * w;
        p.ty = Math.random() * h;
      }
    });
  }
  function loop() {
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(212,175,106,0.65)';
    particles.forEach((p) => {
      p.x += (p.tx - p.x) * 0.02;
      p.y += (p.ty - p.y) * 0.02;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * devicePixelRatio, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  resize(); init(); loop();
  window.addEventListener('resize', () => { resize(); setTargets(); });

  document.querySelectorAll('#contactForm input, #contactForm textarea').forEach((field) => {
    field.addEventListener('focus', () => { focused = true; setTargets(); });
    field.addEventListener('blur', () => { focused = false; setTargets(); });
  });
  setInterval(() => { if (!focused) setTargets(); }, 4000);
}

/* ==========================================================
   MISC: form validation, toasts, footer year, video reveal
========================================================== */
function initMisc() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const toastsContainer = document.getElementById('toasts');
  function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = 'toast' + (type === 'error' ? ' toast--error' : '');
    toast.textContent = message;
    toastsContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('is-leaving');
      setTimeout(() => toast.remove(), 400);
    }, 3800);
  }

  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      const name = document.getElementById('fName');
      const email = document.getElementById('fEmail');
      const message = document.getElementById('fMessage');
      [name, email, message].forEach((field) => {
        const wrapper = field.closest('.field');
        const empty = field.value.trim().length === 0;
        const badEmail = field === email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
        const invalid = empty || badEmail;
        wrapper.classList.toggle('is-invalid', invalid);
        if (invalid) valid = false;
      });
      if (!valid) { showToast('Проверьте поля формы', 'error'); return; }
      showToast('Спасибо! Сообщение отправлено — отвечу совсем скоро.');
      form.reset();
      form.querySelectorAll('.field').forEach((f) => f.classList.remove('is-invalid'));
    });
  }

  // Lifestyle floating icons parallax
  const lifestyle = document.getElementById('lifestyle');
  if (lifestyle && !PerformanceGuard.isLite) {
    lifestyle.addEventListener('mousemove', (e) => {
      const r = lifestyle.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      lifestyle.querySelectorAll('.float-item').forEach((el) => {
        const depth = parseFloat(el.dataset.depth) || 1;
        el.style.transform = `translate(${px * 30 * depth}px, ${py * 30 * depth}px)`;
      });
    });
  }

  // Travel canvas dotted route map
  initTravelMap();
}

/* ==========================================================
   SHOWCASE — books / music / gaming / tech tab filter
========================================================== */
function initShowcase() {
  const tabs = document.querySelectorAll('.showcase__tab');
  const cards = document.querySelectorAll('.showcase-card');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      const filter = tab.dataset.filter;
      cards.forEach((card) => {
        const show = filter === 'all' || card.dataset.cat === filter;
        gsap.to(card, {
          opacity: show ? 1 : 0,
          scale: show ? 1 : 0.9,
          duration: 0.3,
          onStart: () => { if (show) card.style.display = ''; },
          onComplete: () => { if (!show) card.style.display = 'none'; }
        });
      });
    });
  });
}

/* ==========================================================
   TRAVEL — lightweight animated dot-route canvas
========================================================== */
function initTravelMap() {
  const canvas = document.getElementById('travelCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const points = [
    { x: 0.18, y: 0.35 }, { x: 0.32, y: 0.55 }, { x: 0.48, y: 0.28 },
    { x: 0.63, y: 0.48 }, { x: 0.78, y: 0.32 }, { x: 0.88, y: 0.58 }
  ];
  let w, h, t = 0;
  function resize() {
    const r = canvas.getBoundingClientRect();
    w = canvas.width = r.width * devicePixelRatio;
    h = canvas.height = r.height * devicePixelRatio;
  }
  function draw() {
    requestAnimationFrame(draw);
    t += 0.006;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(212,175,106,0.35)';
    ctx.lineWidth = 1.5 * devicePixelRatio;
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = p.x * w, y = p.y * h;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    points.forEach((p, i) => {
      const x = p.x * w, y = p.y * h;
      const pulse = Math.sin(t * 2 + i) * 0.5 + 0.5;
      ctx.beginPath();
      ctx.fillStyle = `rgba(79,209,197,${0.5 + pulse * 0.5})`;
      ctx.arc(x, y, (3 + pulse * 2) * devicePixelRatio, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(212,175,106,0.5)';
      ctx.arc(x, y, (7 + pulse * 5) * devicePixelRatio, 0, Math.PI * 2);
      ctx.stroke();
    });

    const travelerIndex = Math.floor(t * 6) % points.length;
    const p = points[travelerIndex];
    ctx.beginPath();
    ctx.fillStyle = '#f2c879';
    ctx.arc(p.x * w, p.y * h, 5 * devicePixelRatio, 0, Math.PI * 2);
    ctx.fill();
  }
  resize(); draw();
  window.addEventListener('resize', resize);
}
