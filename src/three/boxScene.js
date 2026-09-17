import * as THREE from 'three';
import { createBonbonTexture, createChocolateBumpMap } from './textures.js';
import { FLAVORS_3D } from '../data/products.js';

export class BoxScene {
  constructor(containerElement, onBonbonSelected) {
    this.container = containerElement;
    this.onBonbonSelected = onBonbonSelected;
    this.isOpen = true;
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.targetRotation = { x: 0.65, y: -0.45 };
    this.currentRotation = { x: 0.65, y: -0.45 };
    this.bonbonMeshes = [];

    this.init();
    this.createLighting();
    this.createBox();
    this.createBonbonsInBox();
    this.setupEvents();
    this.animate();
  }

  init() {
    this.scene = new THREE.Scene();

    const width = this.container.clientWidth || 600;
    const height = this.container.clientHeight || 450;

    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    this.camera.position.set(0, 4.2, 5.2);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    this.container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.cursor = 'grab';

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
  }

  createLighting() {
    const ambientLight = new THREE.AmbientLight(0x3d281e, 1.6);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, 3.0);
    keyLight.position.set(4, 7, 4);
    this.scene.add(keyLight);

    const goldFill = new THREE.DirectionalLight(0xd4af37, 2.5);
    goldFill.position.set(-4, 3, -2);
    this.scene.add(goldFill);

    const rim = new THREE.DirectionalLight(0x854d0e, 1.5);
    rim.position.set(0, -4, 3);
    this.scene.add(rim);
  }

  createBox() {
    this.boxGroup = new THREE.Group();

    // Base box: rigid matte black obsidian
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0x120a07,
      roughness: 0.5,
      metalness: 0.15
    });

    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.25,
      metalness: 0.85
    });

    // Outer Tray (length 3.6, width 2.0, height 0.6)
    const trayGeom = new THREE.BoxGeometry(3.8, 0.5, 2.2);
    const trayMesh = new THREE.Mesh(trayGeom, boxMat);
    trayMesh.position.y = -0.25;
    this.boxGroup.add(trayMesh);

    // Gold inner lining border
    const rimGeom = new THREE.BoxGeometry(3.84, 0.05, 2.24);
    const rimMesh = new THREE.Mesh(rimGeom, goldTrimMat);
    rimMesh.position.y = 0.01;
    this.boxGroup.add(rimMesh);

    // Inner tray bed (cavity)
    const bedMat = new THREE.MeshStandardMaterial({
      color: 0x080402,
      roughness: 0.8
    });
    const bedGeom = new THREE.BoxGeometry(3.6, 0.04, 2.0);
    const bedMesh = new THREE.Mesh(bedGeom, bedMat);
    bedMesh.position.y = 0.02;
    this.boxGroup.add(bedMesh);

    // Box Lid (semi-opened in perspective for luxury reveal)
    const lidGeom = new THREE.BoxGeometry(3.86, 0.35, 2.26);
    this.lidMesh = new THREE.Mesh(lidGeom, boxMat);
    this.lidMesh.position.set(0, 0.3, -1.8);
    this.lidMesh.rotation.x = -0.4;
    this.boxGroup.add(this.lidMesh);

    // Gold embossed emblem on lid
    const emblemGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.02, 32);
    const emblem = new THREE.Mesh(emblemGeom, goldTrimMat);
    emblem.position.set(0, 0.19, 0);
    this.lidMesh.add(emblem);

    this.scene.add(this.boxGroup);
  }

  createBonbonsInBox() {
    // 2 rows of 4 bonbons
    const cols = 4;
    const rows = 2;
    const startX = -1.35;
    const stepX = 0.9;
    const startZ = -0.5;
    const stepZ = 1.0;

    const bumpMap = createChocolateBumpMap();

    // Prepare bonbon dome geometry (smaller scale for box)
    const points = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.32, 0),
      new THREE.Vector2(0.34, 0.08),
      new THREE.Vector2(0.32, 0.2),
      new THREE.Vector2(0.24, 0.36),
      new THREE.Vector2(0.12, 0.44),
      new THREE.Vector2(0, 0.46)
    ];
    const bonbonGeom = new THREE.LatheGeometry(points, 32);

    // Gold cup foil for each chocolate
    const cupGeom = new THREE.CylinderGeometry(0.35, 0.28, 0.1, 24, 1, true);
    const cupMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.3,
      metalness: 0.9,
      side: THREE.DoubleSide
    });

    let index = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const flavor = FLAVORS_3D[index % FLAVORS_3D.length];
        const tex = createBonbonTexture(flavor);

        const mat = new THREE.MeshPhysicalMaterial({
          map: tex,
          bumpMap: bumpMap,
          bumpScale: 0.002,
          roughness: 0.18,
          metalness: 0.08,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1
        });

        const mesh = new THREE.Mesh(bonbonGeom, mat);
        const posX = startX + c * stepX;
        const posZ = startZ + r * stepZ;
        mesh.position.set(posX, 0.05, posZ);
        mesh.userData = {
          flavorIndex: index % FLAVORS_3D.length,
          flavor: flavor,
          baseY: 0.05,
          slot: index + 1
        };

        // Cup foil
        const cup = new THREE.Mesh(cupGeom, cupMat);
        cup.position.set(posX, 0.06, posZ);
        this.boxGroup.add(cup);

        this.boxGroup.add(mesh);
        this.bonbonMeshes.push(mesh);
        index++;
      }
    }
  }

  setupEvents() {
    const el = this.renderer.domElement;

    el.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      el.style.cursor = 'grabbing';
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
      this.dragStartTime = performance.now();
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;

        this.targetRotation.y += deltaX * 0.008;
        this.targetRotation.x += deltaY * 0.006;
        this.targetRotation.x = Math.max(0.2, Math.min(1.1, this.targetRotation.x));

        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (this.isDragging) {
        const duration = performance.now() - (this.dragStartTime || 0);
        // If it was a quick click without dragging, check for raycasting hit
        if (duration < 250) {
          this.checkClick(e);
        }
      }
      this.isDragging = false;
      el.style.cursor = 'grab';
    });

    // Touch Support
    el.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        this.dragStartTime = performance.now();
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
        const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

        this.targetRotation.y += deltaX * 0.008;
        this.targetRotation.x += deltaY * 0.006;
        this.targetRotation.x = Math.max(0.2, Math.min(1.1, this.targetRotation.x));

        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (this.isDragging) {
        const duration = performance.now() - (this.dragStartTime || 0);
        if (duration < 250 && e.changedTouches.length === 1) {
          const touch = e.changedTouches[0];
          this.checkClick({ clientX: touch.clientX, clientY: touch.clientY });
        }
      }
      this.isDragging = false;
    });

    const resizeObserver = new ResizeObserver(() => this.resize());
    resizeObserver.observe(this.container);
  }

  checkClick(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.bonbonMeshes);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      this.selectBonbon(hit);
    }
  }

  selectBonbon(mesh) {
    // Reset all bonbon positions
    this.bonbonMeshes.forEach(b => {
      b.position.y = b.userData.baseY;
      b.scale.set(1, 1, 1);
    });

    // Lift selected bonbon slightly
    mesh.position.y = mesh.userData.baseY + 0.25;
    mesh.scale.set(1.15, 1.15, 1.15);

    if (this.onBonbonSelected && mesh.userData.flavor) {
      this.onBonbonSelected(mesh.userData.flavor, mesh.userData.slot);
    }
  }

  toggleLid() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.lidMesh.position.set(0, 0.3, -1.8);
      this.lidMesh.rotation.x = -0.4;
    } else {
      this.lidMesh.position.set(0, 0.32, 0);
      this.lidMesh.rotation.x = 0;
    }
    return this.isOpen;
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

    if (!this.isDragging) {
      this.targetRotation.y += 0.002;
    }

    this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.08;
    this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.08;

    this.boxGroup.rotation.x = this.currentRotation.x;
    this.boxGroup.rotation.y = this.currentRotation.y;

    this.renderer.render(this.scene, this.camera);
  }
}
