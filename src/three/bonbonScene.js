import * as THREE from 'three';
import { createBonbonTexture, createChocolateBumpMap, createGanacheTexture } from './textures.js';
import { FLAVORS_3D } from '../data/products.js';

export class BonbonScene {
  constructor(containerElement) {
    this.container = containerElement;
    this.isCut = false;
    this.currentFlavor = FLAVORS_3D[0];
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.targetRotation = { x: 0.2, y: 0.4 };
    this.currentRotation = { x: 0.2, y: 0.4 };
    this.autoRotateSpeed = 0.004;

    this.init();
    this.createLighting();
    this.createBonbon();
    this.createParticles();
    this.setupEvents();
    this.animate();
  }

  init() {
    this.scene = new THREE.Scene();

    const width = this.container.clientWidth || 500;
    const height = this.container.clientHeight || 500;

    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.camera.position.set(0, 0.5, 4.2);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    this.container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.cursor = 'grab';
  }

  createLighting() {
    // Soft warm ambient
    const ambientLight = new THREE.AmbientLight(0x3a251c, 1.4);
    this.scene.add(ambientLight);

    // Warm key light (top-right)
    this.keyLight = new THREE.DirectionalLight(0xfff4e6, 3.2);
    this.keyLight.position.set(3.5, 4.5, 3.5);
    this.scene.add(this.keyLight);

    // Gold rim light (back-left for luxury silhouette)
    this.rimLight = new THREE.DirectionalLight(0xd4af37, 4.5);
    this.rimLight.position.set(-4, 2, -3);
    this.scene.add(this.rimLight);

    // Subtle bottom bounce light (from luxury table)
    this.bounceLight = new THREE.DirectionalLight(0xa16207, 1.2);
    this.bounceLight.position.set(0, -3, 2);
    this.scene.add(this.bounceLight);

    // Dynamic point light for sparkle
    this.sparkleLight = new THREE.PointLight(0xffd700, 2.0, 10);
    this.sparkleLight.position.set(1.5, 2, 2.5);
    this.scene.add(this.sparkleLight);
  }

  createBonbonGeometry() {
    // Create authentic artisan bonbon profile using LatheGeometry
    // Dome shaped top with slight rounded taper and flat base
    const points = [];
    points.push(new THREE.Vector2(0, 0)); // bottom center
    points.push(new THREE.Vector2(1.05, 0)); // bottom outer edge
    points.push(new THREE.Vector2(1.12, 0.2)); // slight swell
    points.push(new THREE.Vector2(1.08, 0.5));
    points.push(new THREE.Vector2(0.95, 0.85)); // shoulder
    points.push(new THREE.Vector2(0.68, 1.2)); // upper dome
    points.push(new THREE.Vector2(0.35, 1.38));
    points.push(new THREE.Vector2(0, 1.42)); // peak

    // 48 radial segments for smooth round curve
    const geom = new THREE.LatheGeometry(points, 48);
    geom.center();
    return geom;
  }

  createBonbon() {
    this.bonbonGroup = new THREE.Group();

    this.bumpMap = createChocolateBumpMap();
    this.ganacheTex = createGanacheTexture();
    this.bonbonTexture = createBonbonTexture(this.currentFlavor);

    // Physical shell material with tempered sheen & clearcoat
    this.shellMaterial = new THREE.MeshPhysicalMaterial({
      map: this.bonbonTexture,
      bumpMap: this.bumpMap,
      bumpScale: 0.003,
      roughness: 0.18,
      metalness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.12,
      reflectivity: 0.95
    });

    this.ganacheMaterial = new THREE.MeshStandardMaterial({
      map: this.ganacheTex,
      roughness: 0.65,
      metalness: 0.05,
      color: 0x1f0e08
    });

    // Whole bonbon mesh
    this.geom = this.createBonbonGeometry();
    this.bonbonMesh = new THREE.Mesh(this.geom, this.shellMaterial);
    this.bonbonGroup.add(this.bonbonMesh);

    // Interior cut halves (created for slice/reveal mode)
    this.createCutHalves();

    this.scene.add(this.bonbonGroup);
  }

  createCutHalves() {
    this.cutGroup = new THREE.Group();
    this.cutGroup.visible = false;

    // Left and Right halves using clipped or partitioned geometry
    const halfGeom = new THREE.LatheGeometry([
      new THREE.Vector2(0, 0),
      new THREE.Vector2(1.05, 0),
      new THREE.Vector2(1.12, 0.2),
      new THREE.Vector2(1.08, 0.5),
      new THREE.Vector2(0.95, 0.85),
      new THREE.Vector2(0.68, 1.2),
      new THREE.Vector2(0.35, 1.38),
      new THREE.Vector2(0, 1.42)
    ], 32, 0, Math.PI);
    halfGeom.center();

    // Plane cap for ganache filling inside
    const capGeom = new THREE.PlaneGeometry(2.1, 1.4);
    capGeom.rotateY(-Math.PI / 2);
    capGeom.translate(0, 0.05, 0);

    // Left half
    this.leftHalf = new THREE.Group();
    const leftMesh = new THREE.Mesh(halfGeom, this.shellMaterial);
    const leftCap = new THREE.Mesh(capGeom, this.ganacheMaterial);
    this.leftHalf.add(leftMesh);
    this.leftHalf.add(leftCap);
    this.leftHalf.rotation.y = Math.PI;

    // Right half
    this.rightHalf = new THREE.Group();
    const rightMesh = new THREE.Mesh(halfGeom.clone(), this.shellMaterial);
    const rightCap = new THREE.Mesh(capGeom.clone(), this.ganacheMaterial);
    this.rightHalf.add(rightMesh);
    this.rightHalf.add(rightCap);

    this.cutGroup.add(this.leftHalf);
    this.cutGroup.add(this.rightHalf);
    this.bonbonGroup.add(this.cutGroup);
  }

  createParticles() {
    const count = 90;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const radius = 1.6 + Math.random() * 1.5;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = (radius * Math.cos(phi)) * 0.7;
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      scales[i] = Math.random() * 0.04 + 0.015;
      speeds[i] = Math.random() * 0.002 + 0.001;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Warm gold and copper flakes
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 2, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 230, 120, 1)');
    grad.addColorStop(0.5, 'rgba(212, 175, 55, 0.8)');
    grad.addColorStop(1, 'rgba(212, 175, 55, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(16, 16, 15, 0, Math.PI * 2);
    ctx.fill();

    const pTex = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.12,
      map: pTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0xf5d77f
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  setFlavor(flavorId) {
    const flavor = FLAVORS_3D.find(f => f.id === flavorId);
    if (!flavor) return;

    this.currentFlavor = flavor;
    const newTexture = createBonbonTexture(flavor);
    this.shellMaterial.map = newTexture;
    this.shellMaterial.needsUpdate = true;

    // Small impulse rotation on flavor change
    this.targetRotation.y += Math.PI * 0.5;
  }

  toggleCut() {
    this.isCut = !this.isCut;

    if (this.isCut) {
      this.bonbonMesh.visible = false;
      this.cutGroup.visible = true;
      this.leftHalf.position.x = -0.35;
      this.leftHalf.rotation.z = -0.15;
      this.rightHalf.position.x = 0.35;
      this.rightHalf.rotation.z = 0.15;
    } else {
      this.leftHalf.position.set(0, 0, 0);
      this.leftHalf.rotation.z = 0;
      this.rightHalf.position.set(0, 0, 0);
      this.rightHalf.rotation.z = 0;
      this.cutGroup.visible = false;
      this.bonbonMesh.visible = true;
    }

    return this.isCut;
  }

  setupEvents() {
    const el = this.renderer.domElement;

    // Mouse Dragging
    el.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      el.style.cursor = 'grabbing';
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;

        this.targetRotation.y += deltaX * 0.008;
        this.targetRotation.x += deltaY * 0.008;
        this.targetRotation.x = Math.max(-0.6, Math.min(0.8, this.targetRotation.x));

        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      } else {
        // Parallax hover tilt
        const rect = el.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        if (Math.abs(mouseX) <= 1.5 && Math.abs(mouseY) <= 1.5) {
          this.sparkleLight.position.x = mouseX * 2.5;
          this.sparkleLight.position.y = mouseY * 2.5 + 1;
        }
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      el.style.cursor = 'grab';
    });

    // Touch Support
    el.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
        const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

        this.targetRotation.y += deltaX * 0.008;
        this.targetRotation.x += deltaY * 0.008;
        this.targetRotation.x = Math.max(-0.6, Math.min(0.8, this.targetRotation.x));

        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    // Resize Observer
    const resizeObserver = new ResizeObserver(() => this.resize());
    resizeObserver.observe(this.container);
  }

  resize() {
    if (!this.container || !this.renderer) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Auto rotate when not dragging
    if (!this.isDragging) {
      this.targetRotation.y += this.autoRotateSpeed;
    }

    // Smooth lerp damping
    this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.08;
    this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.08;

    this.bonbonGroup.rotation.x = this.currentRotation.x;
    this.bonbonGroup.rotation.y = this.currentRotation.y;

    // Floating levitation bobbing
    const time = performance.now() * 0.0015;
    this.bonbonGroup.position.y = Math.sin(time) * 0.08;

    // Slow ambient particle rotation
    if (this.particles) {
      this.particles.rotation.y = time * 0.06;
      this.particles.rotation.x = Math.sin(time * 0.5) * 0.05;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
