export function initAudio() {
  const toggle = document.getElementById('soundToggle');
  if (!toggle) return;

  let enabled = false;

  const music = new Audio('./assets/music.mp3');
  music.loop = true;
  music.volume = 0.5;

  toggle.addEventListener('click', async () => {
    enabled = !enabled;

    toggle.classList.toggle('is-on', enabled);
    toggle.setAttribute('aria-pressed', String(enabled));

    if (enabled) {
      try {
        await music.play();
      } catch (err) {
        console.error('Не удалось воспроизвести музыку:', err);
      }
    } else {
      music.pause();
      music.currentTime = 0;
    }
  });
}