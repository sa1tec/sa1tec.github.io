// js/three/scene-aurora.js
import * as THREE from 'three';

const vertex = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// Lightweight aurora / northern-lights style fragment shader.
// Layered sine noise instead of full simplex noise to keep it cheap.
const fragment = /* glsl */`
  precision mediump float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;

  float wave(vec2 uv, float freq, float speed, float t) {
    return sin(uv.x * freq + t * speed) * 0.5 + 0.5;
  }

  void main() {
    vec2 uv = vUv;
    float parallax = (uMouse.x - 0.5) * 0.04;
    uv.x += parallax;

    float t = uTime * 0.12;
    float band1 = wave(uv, 3.0, 1.0, t);
    float band2 = wave(uv, 5.5, -1.4, t + 10.0);
    float band3 = wave(uv, 2.1, 0.7, t + 4.0);

    float mask = smoothstep(0.15, 0.85, uv.y);
    float glow = (band1 * 0.5 + band2 * 0.3 + band3 * 0.4) * mask;
    glow *= smoothstep(1.0, 0.4, uv.y) * 1.1;

    vec3 color = mix(uColorA, uColorB, band1);
    color = mix(color, uColorC, band3 * 0.6);
    color *= glow;

    float vignette = 1.0 - length(uv - vec2(0.5, 0.35)) * 0.9;
    color *= clamp(vignette, 0.0, 1.0);

    gl_FragColor = vec4(color, glow * 0.85);
  }
`;

export function createAuroraScene(canvas, guard) {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, guard.isFull ? 1.6 : 1));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  const geo = new THREE.PlaneGeometry(2, 2);
  const mat = new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uColorA: { value: new THREE.Color(0x4fd1c5) },
      uColorB: { value: new THREE.Color(0xd4af6a) },
      uColorC: { value: new THREE.Color(0x8a6fd1) }
    }
  });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  window.addEventListener('mousemove', (e) => {
    mat.uniforms.uMouse.value.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
  });

  const clock = new THREE.Clock();
  let raf = null;
  let running = true;
  function animate() {
    raf = requestAnimationFrame(animate);
    if (!running) return;
    mat.uniforms.uTime.value = clock.getElapsedTime();
    renderer.render(scene, camera);
  }
  animate();

  function setActive(active) { running = active; }

  function onResize() {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  }
  window.addEventListener('resize', onResize);

  function destroy() {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', onResize);
    renderer.dispose();
  }

  return { setActive, destroy };
}
