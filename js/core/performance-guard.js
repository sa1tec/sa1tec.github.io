// js/core/performance-guard.js
// Determines a quality tier: 'full' | 'balanced' | 'lite'
// Used by three/scene-hero.js and three/scene-aurora.js to scale effects,
// and by main.js to enable/disable heavy CSS effects (cursor glow, grain).

const coarsePointer = window.matchMedia('(pointer:coarse)').matches;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const lowCores = (navigator.hardwareConcurrency || 4) < 4;
const smallViewport = window.innerWidth < 760;

let tier = 'full';
if (reducedMotion) tier = 'lite';
else if (coarsePointer && smallViewport) tier = 'lite';
else if (coarsePointer || lowCores) tier = 'balanced';

export const PerformanceGuard = {
  tier,
  isLite: tier === 'lite',
  isBalanced: tier === 'balanced',
  isFull: tier === 'full',
  reducedMotion,

  /**
   * Runtime FPS probe — samples actual frame rate for ~1.2s and can
   * downgrade the tier further if the device struggles once real
   * rendering starts (e.g. integrated GPU reporting >=4 cores).
   * @param {(tier:string)=>void} onResult
   */
  probe(onResult) {
    if (this.isLite) { onResult(this.tier); return; }
    let frames = 0;
    const start = performance.now();
    const tick = (t) => {
      frames++;
      if (t - start < 1200) {
        requestAnimationFrame(tick);
      } else {
        const fps = frames / ((t - start) / 1000);
        if (fps < 40 && this.tier === 'full') this.tier = 'balanced';
        if (fps < 22) this.tier = 'lite';
        this.isLite = this.tier === 'lite';
        this.isBalanced = this.tier === 'balanced';
        this.isFull = this.tier === 'full';
        onResult(this.tier);
      }
    };
    requestAnimationFrame(tick);
  }
};
