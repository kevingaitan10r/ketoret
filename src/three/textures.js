import * as THREE from 'three';

/**
 * Generates an artistic hand-painted bonbon texture with galaxy swirls,
 * 24k gold flecks, and tempered chocolate base.
 */
export function createBonbonTexture(flavorConfig) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  const { primary, swirl, gold, base } = flavorConfig.colors;

  // Base background: rich dark chocolate gradient
  const bgGradient = ctx.createRadialGradient(512, 512, 100, 512, 512, 600);
  bgGradient.addColorStop(0, primary);
  bgGradient.addColorStop(0.5, base);
  bgGradient.addColorStop(1, '#050201');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, 1024, 1024);

  // Artisan hand-painted brush strokes (organic curves)
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.strokeStyle = swirl;
    ctx.lineWidth = 40 + Math.random() * 80;
    ctx.lineCap = 'round';
    ctx.filter = 'blur(6px)';

    const startX = 200 + Math.random() * 600;
    const startY = 100 + Math.random() * 300;
    const cp1x = startX - 150 + Math.random() * 300;
    const cp1y = startY + 200 + Math.random() * 200;
    const cp2x = startX + 100 + Math.random() * 300;
    const cp2y = startY + 400 + Math.random() * 200;
    const endX = 200 + Math.random() * 600;
    const endY = 800 + Math.random() * 200;

    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
    ctx.stroke();
  }
  ctx.restore();

  // Fine gold leaf splatters & metallic dust
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = gold;
  ctx.filter = 'none';

  // Clusters of 24k gold leaf specks
  for (let i = 0; i < 180; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.pow(Math.random(), 0.7) * 460;
    const x = 512 + Math.cos(angle) * radius;
    const y = 512 + Math.sin(angle) * radius;
    const size = Math.random() < 0.15 ? Math.random() * 7 + 3 : Math.random() * 2.5 + 0.8;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Golden nebula mist
  const goldMist = ctx.createRadialGradient(420, 380, 20, 480, 450, 320);
  goldMist.addColorStop(0, 'rgba(255, 220, 100, 0.45)');
  goldMist.addColorStop(0.5, 'rgba(212, 175, 55, 0.2)');
  goldMist.addColorStop(1, 'rgba(212, 175, 55, 0)');
  ctx.fillStyle = goldMist;
  ctx.fillRect(0, 0, 1024, 1024);

  ctx.restore();

  // Subtle cacao sheen lines
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 3;
  ctx.filter = 'blur(2px)';
  ctx.beginPath();
  ctx.arc(512, 512, 380, 0.1, 1.2);
  ctx.stroke();
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Generates a subtle bump map for realistic chocolate micro-texture
 */
export function createChocolateBumpMap() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 512, 512);

  // Micro-crystallization noise
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 18;
    const val = 128 + noise;
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates dark cocoa ganache texture for the interior cut
 */
export function createGanacheTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(256, 256, 10, 256, 256, 260);
  grad.addColorStop(0, '#2e1810');
  grad.addColorStop(0.7, '#1b0d08');
  grad.addColorStop(1, '#110704');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Velvety ganache swirl lines
  ctx.strokeStyle = 'rgba(70, 35, 20, 0.4)';
  ctx.lineWidth = 15;
  for (let r = 30; r < 240; r += 35) {
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
