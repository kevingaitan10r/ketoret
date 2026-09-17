import { PRODUCTS } from '../data/products.js';
import { sensoryAudio } from '../three/sound.js';
import confetti from 'canvas-confetti';

class CartManager {
  constructor() {
    this.items = this.loadCart();
    this.giftCard = {
      enabled: true,
      to: '',
      from: '',
      message: ''
    };
    this.listeners = [];
  }

  loadCart() {
    try {
      const saved = localStorage.getItem('ketoret_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem('ketoret_cart', JSON.stringify(this.items));
    } catch (e) {
      console.warn('Could not save cart', e);
    }
    this.notify();
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.getState());
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach(cb => cb(state));
  }

  getState() {
    return {
      items: this.items,
      count: this.items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: this.getSubtotal(),
      subtotalFormatted: this.formatCOP(this.getSubtotal()),
      giftCard: this.giftCard
    };
  }

  addItem(productId, qty = 1) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const existing = this.items.find(i => i.product.id === productId);
    if (existing) {
      existing.quantity += qty;
    } else {
      this.items.push({ product, quantity: qty });
    }

    sensoryAudio.playSuccess();
    this.saveCart();
  }

  updateQuantity(productId, delta) {
    const item = this.items.find(i => i.product.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.items = this.items.filter(i => i.product.id !== productId);
    }
    sensoryAudio.playChime(700);
    this.saveCart();
  }

  removeItem(productId) {
    this.items = this.items.filter(i => i.product.id !== productId);
    sensoryAudio.playChime(500);
    this.saveCart();
  }

  clear() {
    this.items = [];
    this.saveCart();
  }

  updateGiftCard(data) {
    this.giftCard = { ...this.giftCard, ...data };
    this.notify();
  }

  getSubtotal() {
    return this.items.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);
  }

  formatCOP(val) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val);
  }

  generateWhatsAppUrl(deliveryDetails = {}) {
    if (this.items.length === 0) return null;

    let text = `🍫 *NUEVO PEDIDO · KETÓRET CHOCOLATE ARTESANAL*\n`;
    text += `──────────────────────\n`;
    text += `*Productos Seleccionados:*\n`;

    this.items.forEach(item => {
      text += `• ${item.quantity}x ${item.product.name} — ${this.formatCOP(item.product.price * item.quantity)}\n`;
    });

    text += `\n*Total Estimado:* ${this.formatCOP(this.getSubtotal())} COP\n`;
    text += `*Ciudad de Entrega:* ${deliveryDetails.city || 'Bogotá (Mismo día)'}\n`;
    if (deliveryDetails.date) {
      text += `*Fecha deseada:* ${deliveryDetails.date}\n`;
    }

    if (this.giftCard.to || this.giftCard.message) {
      text += `\n💌 *Tarjeta Manuscrita de Regalo (Incluida):*\n`;
      if (this.giftCard.to) text += `• *Para:* ${this.giftCard.to}\n`;
      if (this.giftCard.from) text += `• *De:* ${this.giftCard.from}\n`;
      if (this.giftCard.message) text += `• *Mensaje:* "${this.giftCard.message}"\n`;
    }

    text += `──────────────────────\n`;
    text += `Hola Ketóret, deseo confirmar la disponibilidad de este pedido y recibir los medios de pago para coordinar la entrega. ¡Gracias!`;

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#ffd700', '#451a03', '#fef08a']
      });
    } catch {
      // ignore
    }

    return `https://wa.me/573001439633?text=${encodeURIComponent(text)}`;
  }
}

export const cartManager = new CartManager();
