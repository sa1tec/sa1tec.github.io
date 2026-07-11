// js/render/render.js
import { projects } from '../data/projects.js';
import { posts } from '../data/blog.js';
import { timeline } from '../data/timeline.js';
import { friends } from '../data/friends.js';
import { gallery } from '../data/gallery.js';
import { videos } from '../data/videos.js';
import { quotes } from '../data/quotes.js';
import { moments } from '../data/moments.js';

function notify() {
  document.dispatchEvent(new CustomEvent('content-rendered'));
}

/* ---------------- TIMELINE ---------------- */
export function renderTimeline() {
  const root = document.getElementById('timelineList');
  if (!root) return;
  root.innerHTML = timeline.map((item, i) => `
    <div class="timeline__item reveal-item" style="--i:${i}">
      <div class="timeline__year">${item.year}</div>
      <div class="timeline__body">
        <h3>${item.title}</h3>
        <p>${item.text}</p>
      </div>
    </div>
  `).join('');
}

/* ---------------- PROJECTS ---------------- */
export function renderProjects(onOpen) {
  const root = document.getElementById('projectsGrid');
  if (!root) return;
  root.innerHTML = projects.map((p, i) => `
    <article class="proj-card reveal-item" style="--i:${i % 3}" data-id="${p.id}" data-cursor="view">
      <div class="proj-card__media">
        <img src="${p.image}" alt="${p.title}" loading="lazy">
      </div>
      <div class="proj-card__info">
        <span class="proj-card__cat">${p.category} · ${p.year}</span>
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <div class="proj-card__tags">${p.tech.slice(0, 3).map(t => `<span>${t}</span>`).join('')}</div>
      </div>
    </article>
  `).join('');

  root.querySelectorAll('.proj-card').forEach((card) => {
    card.addEventListener('click', () => {
      const proj = projects.find((p) => p.id === card.dataset.id);
      if (proj) onOpen(proj);
    });
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -8;
      const ry = ((e.clientX - r.left) / r.width - 0.5) * 8;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
  notify();
}

export function openProjectOverlay(proj) {
  const overlay = document.getElementById('projectOverlay');
  overlay.innerHTML = `
    <button class="overlay__close" id="closeProjectOverlay" aria-label="Закрыть">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>
    <div class="overlay__content">
      <img src="${proj.image}" alt="${proj.title}" class="overlay__hero-img">
      <div class="overlay__body">
        <span class="proj-card__cat">${proj.category} · ${proj.year} · ${proj.status}</span>
        <h2>${proj.title}</h2>
        <p class="overlay__lead">${proj.longText}</p>
        <div class="overlay__features">
          <h4>Особенности</h4>
          <ul>${proj.features.map(f => `<li>${f}</li>`).join('')}</ul>
        </div>
        <div class="overlay__tags">${proj.tech.map(t => `<span>${t}</span>`).join('')}</div>
        <div class="overlay__links">
          ${proj.website ? `<a href="${proj.website}" target="_blank" rel="noopener" class="btn btn--primary magnetic"><span>Сайт проекта</span></a>` : ''}
          ${proj.github ? `<a href="${proj.github}" target="_blank" rel="noopener" class="btn btn--ghost magnetic"><span>GitHub</span></a>` : ''}
        </div>
      </div>
    </div>
  `;
  overlay.classList.add('is-open');
  document.body.classList.add('overlay-open');
  document.getElementById('closeProjectOverlay').addEventListener('click', closeProjectOverlay);
  notify();
}
export function closeProjectOverlay() {
  document.getElementById('projectOverlay').classList.remove('is-open');
  document.body.classList.remove('overlay-open');
}

/* ---------------- GALLERY ---------------- */
export function renderGallery(onOpen) {
  const root = document.getElementById('galleryGrid');
  if (!root) return;
  root.innerHTML = gallery.map((g, i) => `
    <button class="gallery__item gallery__item--${g.size} reveal-item" style="--i:${i % 4}" data-index="${i}" data-cursor="view">
      <img src="${g.src}" alt="${g.alt}" loading="lazy">
    </button>
  `).join('');
  const items = Array.from(root.querySelectorAll('.gallery__item'));
  items.forEach((item, i) => item.addEventListener('click', () => onOpen(i)));
  notify();
  return items;
}

/* ---------------- FRIENDS ---------------- */
export function renderFriends() {
  const root = document.getElementById('friendsTrack');
  if (!root) return;
  const cards = friends.map((f) => `
    <div class="friend-card magnetic">
      <img src="${f.img}" alt="${f.name}" loading="lazy">
      <h4>${f.name}</h4>
      <p>${f.role}</p>
    </div>
  `).join('');
  root.innerHTML = cards + cards; // duplicate for seamless marquee
  notify();
}

/* ---------------- MOMENTS ---------------- */
export function renderMoments() {
  const root = document.getElementById('momentsTrack');
  if (!root) return;
  root.innerHTML = moments.map((m) => `
    <div class="moment-slide">
      <img src="${m.img}" alt="${m.title}" loading="lazy">
      <div class="moment-slide__caption">
        <h4>${m.title}</h4>
        <p>${m.text}</p>
      </div>
    </div>
  `).join('');
  notify();
}

/* ---------------- VIDEOS ---------------- */
export function renderVideos() {
  const root = document.getElementById('videosGrid');
  if (!root) return;
  root.innerHTML = videos.map((v, i) => `
    <div class="video-card reveal-item" style="--i:${i}">
      <video muted loop playsinline preload="metadata" poster="${v.poster}" data-src="${v.src}"></video>
      <button class="video-card__play" aria-label="Воспроизвести">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </button>
      <div class="video-card__info"><span>${v.title}</span><time>${v.duration}</time></div>
    </div>
  `).join('');

  root.querySelectorAll('.video-card').forEach((card) => {
    const video = card.querySelector('video');
    const playBtn = card.querySelector('.video-card__play');
    playBtn.addEventListener('click', () => {
      if (video.src !== video.dataset.src) video.src = video.dataset.src;
      if (video.paused) { video.play(); card.classList.add('is-playing'); }
      else { video.pause(); card.classList.remove('is-playing'); }
    });
  });
  notify();
}

/* ---------------- QUOTES ---------------- */
export function renderQuotes() {
  const root = document.getElementById('quotesTrack');
  const dots = document.getElementById('quotesDots');
  if (!root) return;
  root.innerHTML = quotes.map((q) => `
    <blockquote class="quote-slide">
      <p>${q.text}</p>
      <cite>${q.author}</cite>
    </blockquote>
  `).join('');
  if (dots) {
    dots.innerHTML = quotes.map((_, i) => `<span data-i="${i}"${i === 0 ? ' class="is-active"' : ''}></span>`).join('');
  }
  notify();
}

/* ---------------- BLOG ---------------- */
export function renderBlog(onOpen) {
  const root = document.getElementById('blogGrid');
  if (!root) return;
  root.innerHTML = posts.map((p, i) => `
    <article class="blog-card reveal-item" style="--i:${i}" data-id="${p.id}" data-cursor="view">
      <div class="blog-card__cover"><img src="${p.cover}" alt="${p.title}" loading="lazy"></div>
      <span class="blog-card__meta">${p.tag} · ${p.readTime} чтения</span>
      <h3>${p.title}</h3>
      <p>${p.excerpt}</p>
    </article>
  `).join('');
  root.querySelectorAll('.blog-card').forEach((card) => {
    card.addEventListener('click', () => {
      const post = posts.find((p) => p.id === card.dataset.id);
      if (post) onOpen(post);
    });
  });
  notify();
}

export function openBlogOverlay(post) {
  const overlay = document.getElementById('blogOverlay');
  const bodyHtml = post.content.map((block) => {
    if (block.type === 'p') return `<p>${block.text}</p>`;
    if (block.type === 'quote') return `<blockquote>${block.text}</blockquote>`;
    if (block.type === 'image') return `<img src="${block.src}" alt="" loading="lazy">`;
    return '';
  }).join('');

  overlay.innerHTML = `
    <div class="overlay__progress"><span id="blogProgressFill"></span></div>
    <button class="overlay__close" id="closeBlogOverlay" aria-label="Закрыть">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>
    <div class="overlay__content overlay__content--scroll" id="blogScrollArea">
      <img src="${post.cover}" alt="${post.title}" class="overlay__hero-img">
      <div class="overlay__body">
        <span class="proj-card__cat">${post.tag} · ${new Date(post.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} · ${post.readTime}</span>
        <h2>${post.title}</h2>
        <div class="blog-prose">${bodyHtml}</div>
      </div>
    </div>
  `;
  overlay.classList.add('is-open');
  document.body.classList.add('overlay-open');
  document.getElementById('closeBlogOverlay').addEventListener('click', closeBlogOverlay);

  const scrollArea = document.getElementById('blogScrollArea');
  const progressFill = document.getElementById('blogProgressFill');
  scrollArea.addEventListener('scroll', () => {
    const pct = scrollArea.scrollTop / (scrollArea.scrollHeight - scrollArea.clientHeight);
    progressFill.style.width = (pct * 100) + '%';
  });
  notify();
}
export function closeBlogOverlay() {
  document.getElementById('blogOverlay').classList.remove('is-open');
  document.body.classList.remove('overlay-open');
}
