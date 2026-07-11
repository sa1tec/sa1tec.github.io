// js/three/scene-hero.js
import * as THREE from 'three';

const particleVertex = /* glsl */`
  attribute float aScale;
  attribute float aSeed;
  uniform float uTime;
  varying float vAlpha;

  void main() {
    vec3 pos = position;
    pos.x += sin(uTime * 0.06 + aSeed * 6.2831) * 0.6;
    pos.y += cos(uTime * 0.05 + aSeed * 6.2831) * 0.4;
    pos.z += sin(uTime * 0.04 + aSeed * 3.1415) * 0.5;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aScale * (220.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    vAlpha = smoothstep(28.0, 4.0, -mvPosition.z);
  }
`;

const particleFragment = /* glsl */`
  precision mediump float;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.0, d);
    vec3 color = mix(uColorA, uColorB, vAlpha);
    gl_FragColor = vec4(color, soft * vAlpha * 0.9);
  }
`;

export function createHeroScene(canvas, guard) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050506, 0.035);

  const camera = new THREE.PerspectiveCamera(55, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 14);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, guard.isFull ? 2 : 1.3));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.setClearColor(0x000000, 0);

  // ---- Particle fog field ----
  const count = guard.isFull ? 1400 : guard.isBalanced ? 700 : 0;
  let points = null;
  if (count > 0) {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 26;
      scales[i] = Math.random() * 2.2 + 0.4;
      seeds[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: particleVertex,
      fragmentShader: particleFragment,
      uniforms: {
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color(0x4fd1c5) },
        uColorB: { value: new THREE.Color(0xd4af6a) }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    points = new THREE.Points(geo, mat);
    scene.add(points);
  }

  // ---- Glass-like rotating object (skipped on balanced/lite for GPU cost) ----
  let glass = null;
  if (guard.isFull) {
    const glassGeo = new THREE.TorusKnotGeometry(2.6, 0.55, 180, 24);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0d0d10,
      metalness: 0.1,
      roughness: 0.08,
      transmission: 1,
      thickness: 1.6,
      ior: 1.4,
      envMapIntensity: 1,
      clearcoat: 1
    });
    glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(4.6, -1, -6);
    glass.scale.setScalar(0.9);
    scene.add(glass);

    const key = new THREE.PointLight(0xd4af6a, 40, 40);
    key.position.set(6, 4, 4);
    scene.add(key);
    const rim = new THREE.PointLight(0x4fd1c5, 30, 40);
    rim.position.set(-6, -2, -2);
    scene.add(rim);
    scene.add(new THREE.AmbientLight(0x222226, 1.2));
  } else {
    scene.add(new THREE.AmbientLight(0x333338, 2));
  }

  let targetX = 0, targetY = 0;
  window.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  let scrollFade = 1;
  function setScrollProgress(p) {
    // p: 0 at top of hero, 1 once scrolled past
    scrollFade = 1 - p;
    camera.position.y = -p * 3;
  }

  const clock = new THREE.Clock();
  let raf = null;
  function animate() {
    raf = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    if (points) points.material.uniforms.uTime.value = t;
    if (glass) { glass.rotation.x = t * 0.08; glass.rotation.y = t * 0.11; }

    camera.position.x += (targetX * 1.4 - camera.position.x) * 0.03;
    camera.position.z = 14 + (-targetY * 1.1);
    camera.lookAt(0, 0, 0);

    renderer.domElement.style.opacity = String(Math.max(scrollFade, 0));
    renderer.render(scene, camera);
  }
  animate();

  function onResize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  window.addEventListener('resize', onResize);

  function destroy() {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', onResize);
    renderer.dispose();
  }

  return { setScrollProgress, destroy };
}
