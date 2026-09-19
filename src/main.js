import confetti from 'canvas-confetti';

// Global Cart State
window.cart = [
  { 
    name: 'Caja 24 Bombones', 
    price: 187900, 
    qty: 1, 
    img: 'https://lh3.googleusercontent.com/aida/AEtjO1VhVQYt6X7VoFj2WPrasIRnIk3QhxfMGO-INbnUFihBcuHg13cQmtN-Y1Y-k5kFYRGKD-pwWMj6DAaDuJbxOHHyIzBIMqqUziWEeK5BQGKZ0rALJt-qsYKAkvIzt6kDztuLT7d0P1yCPdVboUatIDI-kRKt7DEGMf0cUrQ6uW1xbDy8y5Rl2MVB_N7OQk4AZKBah_rFyYd6Z9TX4vaWKYiP5aDvum6jSkEgR-9_87IE7yhixTKxfk8Jbw' 
  },
  { 
    name: 'Tableta 70% Cacao Tumaco (42g)', 
    price: 29900, 
    qty: 1, 
    img: 'https://lh3.googleusercontent.com/aida/AEtjO1Wq-WvHCY1iK_O3BLpdMVVha7GW-PwmJBYkjjF30wKV1pHjpCT8IOeM_TsGMDBZ_DI3Sgpzth8L-GRbZTNRGtBP1fKR6GMblb_D-UQv2SdV9LC4FsGlBcfJdOvoEBAuzhKDKidlV0NsligQkf9o2chrTXEXpbCh4YyMdmoOmVG8HbKSfzs12EBEOgV-PMtCwpBcq_rlMB_D1i_bXjywrgXuIjGka3ElJQU2fSqX5OScZ0vGZor7JI31' 
  }
];

document.addEventListener('DOMContentLoaded', () => {
  // Render cart initially
  renderCart();

  // Initialize Theme from query param or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const paramTheme = urlParams.get('theme');
  const savedTheme = paramTheme || localStorage.getItem('ketoret_theme');
  if (savedTheme === 'ivory') {
    document.body.classList.add('theme-ivory');
    const icon = document.getElementById('theme-icon');
    const label = document.getElementById('theme-label');
    if (icon) {
      icon.textContent = 'dark_mode';
      icon.classList.remove('text-[#e2bd82]');
      icon.classList.add('text-[#0E1628]');
    }
    if (label) label.textContent = 'AZUL';
  }
});

// ==========================================
// GLOBAL WINDOW FUNCTIONS FOR HTML ACTIONS
// ==========================================

// Theme Switcher (Azul Medianoche / Marfil Cálido)
window.toggleTheme = function() {
  const isIvory = document.body.classList.toggle('theme-ivory');
  const icon = document.getElementById('theme-icon');
  const label = document.getElementById('theme-label');
  
  if (isIvory) {
    if (icon) {
      icon.textContent = 'dark_mode';
      icon.classList.remove('text-[#e2bd82]');
      icon.classList.add('text-[#0E1628]');
    }
    if (label) label.textContent = 'AZUL';
    localStorage.setItem('ketoret_theme', 'ivory');
    window.showToast('Tema Marfil Cálido activado ✨');
  } else {
    if (icon) {
      icon.textContent = 'light_mode';
      icon.classList.add('text-[#e2bd82]');
      icon.classList.remove('text-[#0E1628]');
    }
    if (label) label.textContent = 'MARFIL';
    localStorage.setItem('ketoret_theme', 'navy');
    window.showToast('Tema Azul Medianoche activado 🌙');
  }
};

window.scrollToTop = function() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Modals
window.openModal = function(id) {
  window.closeModals();
  const modal = document.getElementById(id);
  const backdrop = document.getElementById('backdrop');
  if (modal && backdrop) {
    backdrop.classList.remove('opacity-0', 'pointer-events-none');
    backdrop.classList.add('opacity-100', 'pointer-events-auto');
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100', 'pointer-events-auto');
  }
};

window.closeModals = function() {
  const modalIds = ['historia-modal', 'blog-modal', 'corporativo-modal', 'contacto-modal', 'auth-modal'];
  modalIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('opacity-100', 'pointer-events-auto');
      el.classList.add('opacity-0', 'pointer-events-none');
    }
  });
  const backdrop = document.getElementById('backdrop');
  if (backdrop) {
    backdrop.classList.remove('opacity-100', 'pointer-events-auto');
    backdrop.classList.add('opacity-0', 'pointer-events-none');
  }
};

// Escape Key Listener
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    window.closeModals();
    const searchBox = document.getElementById('search-box');
    if (searchBox && !searchBox.classList.contains('hidden')) {
      searchBox.classList.add('hidden');
    }
    const drawer = document.getElementById('cart-drawer');
    if (drawer && drawer.classList.contains('translate-x-0')) {
      window.toggleCart();
    }
  }
});

// Search Box
window.toggleSearch = function() {
  const box = document.getElementById('search-box');
  if (box) {
    box.classList.toggle('hidden');
  }
};

window.handleSearch = function(val) {
  const items = document.querySelectorAll('#search-results > div');
  items.forEach(el => {
    const match = el.textContent.toLowerCase().includes(val.toLowerCase());
    el.style.display = match ? 'flex' : 'none';
  });
};

// Catalog Category Filter
window.filterCatalog = function(category) {
  const tabs = document.querySelectorAll('.catalog-tab');
  tabs.forEach(t => {
    t.classList.remove('bg-[#e2bd82]', 'text-[#050811]');
    t.classList.add('text-[#c5a059]');
  });
  const activeTab = document.getElementById('tab-' + category);
  if (activeTab) {
    activeTab.classList.add('bg-[#e2bd82]', 'text-[#050811]');
    activeTab.classList.remove('text-[#c5a059]');
  }

  const products = document.querySelectorAll('#product-list .prod-card');
  products.forEach(p => {
    if (category === 'todos' || p.getAttribute('data-cat') === category) {
      p.style.display = 'flex';
    } else {
      p.style.display = 'none';
    }
  });

  const prodSection = document.getElementById('productos');
  if (prodSection) {
    prodSection.scrollIntoView({ behavior: 'smooth' });
  }
};

// Auth Tab Switch
window.toggleAuthTab = function(tab) {
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  const btnLogin = document.getElementById('auth-btn-login');
  const btnRegister = document.getElementById('auth-btn-register');

  if (tab === 'login') {
    formLogin.classList.remove('hidden');
    formRegister.classList.add('hidden');
    btnLogin.classList.add('bg-[#e2bd82]', 'text-[#050811]');
    btnLogin.classList.remove('text-[#c5a059]');
    btnRegister.classList.remove('bg-[#e2bd82]', 'text-[#050811]');
    btnRegister.classList.add('text-[#c5a059]');
  } else {
    formLogin.classList.add('hidden');
    formRegister.classList.remove('hidden');
    btnRegister.classList.add('bg-[#e2bd82]', 'text-[#050811]');
    btnRegister.classList.remove('text-[#c5a059]');
    btnLogin.classList.remove('bg-[#e2bd82]', 'text-[#050811]');
    btnLogin.classList.add('text-[#c5a059]');
  }
};

// Toast Notification
window.showToast = function(msg) {
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');
  if (toast && toastText) {
    toastText.textContent = msg;
    toast.classList.remove('opacity-0', 'pointer-events-none', '-translate-y-5');
    toast.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');
    setTimeout(() => {
      toast.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
      toast.classList.add('opacity-0', 'pointer-events-none', '-translate-y-5');
    }, 2500);
  }
};

// Cart Drawer
window.toggleCart = function() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  if (!drawer) return;

  const isOpen = drawer.classList.contains('translate-x-0');
  if (isOpen) {
    drawer.classList.remove('translate-x-0');
    drawer.classList.add('translate-x-full');
    backdrop.classList.remove('opacity-100', 'pointer-events-auto');
    backdrop.classList.add('opacity-0', 'pointer-events-none');
  } else {
    drawer.classList.add('translate-x-0');
    drawer.classList.remove('translate-x-full');
    backdrop.classList.add('opacity-100', 'pointer-events-auto');
    backdrop.classList.remove('opacity-0', 'pointer-events-none');
  }
};

window.addToCart = function(name, price, img) {
  const found = window.cart.find(i => i.name === name);
  if (found) {
    found.qty += 1;
  } else {
    window.cart.push({ name, price, qty: 1, img });
  }
  renderCart();
  window.showToast(`¡${name} agregado al carrito!`);

  // Confetti burst
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#e2bd82', '#ffd700', '#f7e7ce', '#25d366']
    });
  } catch {
    // ignore
  }
};

window.changeQty = function(name, delta) {
  const item = window.cart.find(i => i.name === name);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) {
      window.cart = window.cart.filter(i => i.name !== name);
    }
    renderCart();
  }
};

function renderCart() {
  const container = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  const badge = document.getElementById('cart-badge');
  const whatsappLink = document.getElementById('cart-whatsapp-link');

  if (!container || !totalEl || !badge || !whatsappLink) return;

  let total = 0;
  let count = 0;
  container.innerHTML = '';

  if (window.cart.length === 0) {
    container.innerHTML = '<div class="text-center py-10 text-xs text-[#a8957e]">Tu carrito está vacío. Agrega tus chocolates favoritos.</div>';
  } else {
    window.cart.forEach(item => {
      total += item.price * item.qty;
      count += item.qty;
      const div = document.createElement('div');
      div.className = 'flex items-center justify-between p-3 rounded-xl bg-[#0e1628]/80 border border-[#e2bd82]/15';
      div.innerHTML = `
        <div class="flex items-center gap-3">
          <img src="${item.img}" class="w-12 h-12 object-cover rounded-lg bg-[#050811]" />
          <div>
            <h4 class="text-xs font-medium text-[#faebd2]">${item.name}</h4>
            <span class="text-[11px] text-[#c5a059]">$${(item.price * item.qty).toLocaleString('es-CO')} COP</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="changeQty('${item.name}', -1)" class="w-6 h-6 rounded-md bg-[#131d33] text-[#e2bd82] flex items-center justify-center hover:bg-[#e2bd82] hover:text-[#050811] text-xs cursor-pointer">-</button>
          <span class="text-xs text-[#faebd2] font-semibold w-4 text-center">${item.qty}</span>
          <button onclick="changeQty('${item.name}', 1)" class="w-6 h-6 rounded-md bg-[#131d33] text-[#e2bd82] flex items-center justify-center hover:bg-[#e2bd82] hover:text-[#050811] text-xs cursor-pointer">+</button>
        </div>
      `;
      container.appendChild(div);
    });
  }

  totalEl.textContent = `$${total.toLocaleString('es-CO')} COP`;
  badge.textContent = count;

  const orderSummary = window.cart.map(i => `${i.qty}x ${i.name}`).join(', ');
  whatsappLink.href = `https://wa.me/573001439633?text=Hola%20Ketóret,%20quisiera%20pedir:%20${encodeURIComponent(orderSummary)}%20(Total:%20$${total.toLocaleString('es-CO')}%20COP)`;
}
