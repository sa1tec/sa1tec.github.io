// js/core/cursor.js
export function initCursor(guard) {
  const hasFine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (!hasFine || guard.isLite) return;

  const cursor = document.getElementById('cursor');
  const dot = cursor.querySelector('.cursor__dot');
  const ring = cursor.querySelector('.cursor__ring');
  document.body.classList.add('has-custom-cursor');

  let mx = 0, my = 0, rx = 0, ry = 0;
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px,${my}px)`;
  });

  (function raf() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px,${ry}px)`;
    requestAnimationFrame(raf);
  })();

  document.addEventListener('mousedown', () => cursor.classList.add('is-clicking'));
  document.addEventListener('mouseup', () => cursor.classList.remove('is-clicking'));

  const bindStateEls = () => {
    document.querySelectorAll('a, button, [data-cursor]').forEach((el) => {
      if (el.dataset.cursorBound) return;
      el.dataset.cursorBound = '1';
      const type = el.dataset.cursor || 'link';
      el.addEventListener('mouseenter', () => cursor.classList.add(`is-${type}`));
      el.addEventListener('mouseleave', () => cursor.classList.remove(`is-${type}`));
    });
  };
  bindStateEls();
  // Re-bind after dynamic content renders
  document.addEventListener('content-rendered', bindStateEls);

  // Magnetic buttons
  document.querySelectorAll('.magnetic').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const px = e.clientX - r.left - r.width / 2;
      const py = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${px * 0.3}px,${py * 0.4}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = 'translate(0,0)'; });
  });
}
