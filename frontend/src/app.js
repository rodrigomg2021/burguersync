/**
 * Lógica Principal da Aplicação BurguerSync Ourinhos
 * Layer 2 (Orquestração de Estado) & Layer 3 (Execução Determinística)
 */

import { syncEngine } from './firebase-service.js';

// Catálogo de Produtos
export const PRODUCTS = [
  {
    id: 'prod-1',
    category: 'smash',
    badge: 'Mais Pedido',
    badgeColor: 'bg-secondary-container text-surface-base',
    nome: 'Ourinhos Smash Burguer',
    preco: 32.90,
    descricao: 'Pão brioche tostado na manteiga, 2x smash burger 90g ultra prensado com crostinha crocante, queijo cheddar cremoso derretido, cebola caramelizada e maionese defumada artesanal.',
    tags: ['2x 90g Smash', 'Brioche Toast'],
    imagem: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    canCustomize: true
  },
  {
    id: 'prod-2',
    category: 'artesanais',
    badge: 'Chef Pick',
    badgeColor: 'bg-accent-neon-green text-surface-base',
    nome: 'Monster Bacon SENAI',
    preco: 38.50,
    descricao: 'Pão australiano artesanal, blend bovino 180g grelhado no fogo, generosas fatias de bacon crocante em tiras, queijo prato, cebola crispy e barbecue artesanal.',
    tags: ['180g Charbroil', 'Bacon Extra Tiras'],
    imagem: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
    canCustomize: true
  },
  {
    id: 'prod-3',
    category: 'smash',
    badge: 'Cheddar Lover',
    badgeColor: 'bg-accent-neon-orange text-surface-base',
    nome: 'Double Cheddar Melt',
    preco: 34.00,
    descricao: 'Duplo smash 100g, banho de cheddar inglês derretido e cebola glaciada no shoyu servido em pão escuro macio e tostado.',
    tags: ['2x 100g Smash', 'Molho Shoyu Glaze'],
    imagem: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=600&q=80',
    canCustomize: true
  },
  {
    id: 'prod-4',
    category: 'acompanhamentos',
    badge: 'Crocante',
    badgeColor: 'bg-surface-container-high text-accent-neon-green',
    nome: 'Batata Rústica Trufada',
    preco: 18.00,
    descricao: 'Batatas artesanais com corte rústico, fritas no ponto exato, sal de alecrim e maionese verde fresca da casa.',
    tags: ['Sal de Alecrim', 'Maionese da Casa'],
    imagem: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
    canCustomize: false
  },
  {
    id: 'prod-5',
    category: 'bebidas',
    badge: 'Refrescante',
    badgeColor: 'bg-surface-container-high text-accent-neon-orange',
    nome: 'Bebida Artesanal Gelada',
    preco: 8.00,
    descricao: 'Soda artesanal de limão siciliano com xarope da casa ou suco natural de polpa de maracujá gelado.',
    tags: ['350ml', 'Gelada'],
    imagem: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    canCustomize: false
  }
];

class BurguerSyncApp {
  constructor() {
    this.cart = [
      {
        id: 'cart-init-1',
        productId: 'prod-1',
        nome: 'Ourinhos Smash Burguer',
        preco: 32.90,
        quantidade: 1,
        obs: 'Sem cebola, maionese à parte'
      },
      {
        id: 'cart-init-2',
        productId: 'prod-2',
        nome: 'Monster Bacon SENAI',
        preco: 38.50,
        quantidade: 1,
        obs: 'Ponto da carne ao ponto para bem'
      }
    ];
    this.quantities = {
      'prod-1': 1,
      'prod-2': 1,
      'prod-3': 1,
      'prod-4': 1,
      'prod-5': 1
    };
    this.selectedCategory = 'all';
    this.currentCustomizingProduct = null;
    this.allOrders = [];
    this.audioContext = null;
    this.lastOrderCount = 0;
  }

  init() {
    this.renderProducts();
    this.updateCartUI();
    this.bindEvents();
    this.startOrderSubscription();
    this.startTicketTimers();
  }

  bindEvents() {
    // Abas de navegação
    document.querySelectorAll('[data-tab-target]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = btn.getAttribute('data-tab-target');
        this.switchTab(target);
      });
    });

    // Filtros de categoria
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.category-btn').forEach(b => {
          b.classList.remove('bg-secondary-container', 'text-surface-base');
          b.classList.add('bg-surface-card', 'text-on-surface-variant');
        });
        btn.classList.remove('bg-surface-card', 'text-on-surface-variant');
        btn.classList.add('bg-secondary-container', 'text-surface-base');

        this.selectedCategory = btn.getAttribute('data-category') || 'all';
        this.renderProducts();
      });
    });

    // Teste de som sonoro
    const audioBtn = document.getElementById('btn-test-audio');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        this.playBeepAlert();
        this.updateSystemLog('Sinal sonoro disparado no display de comando KDS.');
      });
    }

    // Botão de Checkout
    const checkoutBtn = document.getElementById('btn-checkout');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => this.handleCheckoutClick());
    }

    // Modal de Checkout / Pix
    const closePaymentBtn = document.getElementById('btn-close-payment');
    if (closePaymentBtn) {
      closePaymentBtn.addEventListener('click', () => this.closeModal('payment-modal'));
    }

    const copyPixBtn = document.getElementById('btn-copy-pix');
    if (copyPixBtn) {
      copyPixBtn.addEventListener('click', () => this.copyPixCode());
    }

    const confirmPaymentBtn = document.getElementById('btn-confirm-payment');
    if (confirmPaymentBtn) {
      confirmPaymentBtn.addEventListener('click', () => this.confirmOrderPayment());
    }

    // Modal de Customização
    const closeCustBtn = document.getElementById('btn-close-customize');
    if (closeCustBtn) {
      closeCustBtn.addEventListener('click', () => this.closeModal('customize-modal'));
    }

    const applyCustBtn = document.getElementById('btn-apply-customize');
    if (applyCustBtn) {
      applyCustBtn.addEventListener('click', () => this.applyCustomization());
    }
  }

  switchTab(tabId) {
    document.querySelectorAll('.tab-pane').forEach(tab => tab.classList.remove('active'));
    const activeTab = document.getElementById(`tab-${tabId}`);
    if (activeTab) activeTab.classList.add('active');

    document.querySelectorAll('[data-tab-target]').forEach(btn => {
      const isCurrent = btn.getAttribute('data-tab-target') === tabId;
      if (isCurrent) {
        btn.className = "px-4 py-1.5 rounded-full font-label-badge uppercase tracking-wider transition-all flex items-center gap-1.5 bg-secondary-container text-on-secondary-container shadow-md";
      } else {
        btn.className = "px-4 py-1.5 rounded-full font-label-badge text-label-badge uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-all flex items-center gap-1.5";
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderProducts() {
    const container = document.getElementById('products-grid');
    if (!container) return;

    const filtered = this.selectedCategory === 'all' 
      ? PRODUCTS 
      : PRODUCTS.filter(p => p.category === this.selectedCategory);

    container.innerHTML = filtered.map(prod => {
      const qty = this.quantities[prod.id] || 1;
      return `
        <div class="bg-surface-card rounded-xl p-5 md:p-6 transition-all duration-200 hover:bg-surface-hover flex flex-col md:flex-row gap-6 shadow-md border border-surface-stroke/40" id="card-${prod.id}">
          <div class="w-full md:w-48 h-48 rounded-lg overflow-hidden shrink-0 relative bg-surface-container-lowest">
            <img class="w-full h-full object-cover transition-transform duration-300 hover:scale-105" src="${prod.imagem}" alt="${prod.nome}">
            <span class="absolute top-2 left-2 ${prod.badgeColor} font-label-badge text-label-badge uppercase px-2.5 py-0.5 rounded-full font-bold shadow">${prod.badge}</span>
          </div>
          <div class="flex-1 flex flex-col justify-between space-y-4">
            <div>
              <div class="flex items-center justify-between gap-2">
                <h3 class="font-headline-lg text-headline-lg text-text-primary">${prod.nome}</h3>
                <span class="font-headline-lg text-headline-lg text-accent-neon-green">R$ ${prod.preco.toFixed(2).replace('.', ',')}</span>
              </div>
              <p class="font-body-md text-body-md text-text-secondary mt-1 leading-relaxed">
                ${prod.descricao}
              </p>
              <div class="flex flex-wrap items-center gap-2 mt-3">
                ${prod.tags.map(t => `<span class="font-label-code text-label-code text-accent-neon-orange bg-accent-neon-orange/10 px-2 py-0.5 rounded">${t}</span>`).join('')}
              </div>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div class="flex items-center bg-surface-container-lowest rounded-lg p-1">
                <button class="w-8 h-8 rounded bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-text-primary active:scale-95 transition-all" onclick="window.burguerApp.decrementProduct('${prod.id}')" type="button">
                  <span class="material-symbols-outlined text-base">remove</span>
                </button>
                <span class="w-10 text-center font-headline-sm text-body-md text-text-primary" id="qty-${prod.id}">${qty}</span>
                <button class="w-8 h-8 rounded bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-text-primary active:scale-95 transition-all" onclick="window.burguerApp.incrementProduct('${prod.id}')" type="button">
                  <span class="material-symbols-outlined text-base">add</span>
                </button>
              </div>
              <div class="flex items-center gap-2">
                ${prod.canCustomize ? `
                  <button class="px-4 py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-hover text-accent-neon-orange font-headline-sm text-body-md uppercase tracking-wider transition-all duration-150 active:scale-95 flex items-center gap-1.5 shadow-sm border border-accent-neon-orange/30" onclick="window.burguerApp.openCustomizeModal('${prod.id}')" type="button">
                    <span class="material-symbols-outlined text-lg">tune</span>
                    <span>Personalizar</span>
                  </button>
                ` : ''}
                <button class="px-5 py-2.5 rounded-lg bg-secondary-container hover:bg-accent-neon-orange text-surface-base font-headline-sm text-body-md uppercase tracking-wider transition-all duration-150 active:scale-95 flex items-center gap-2 shadow-sm font-bold" onclick="window.burguerApp.addToCart('${prod.id}')" type="button">
                  <span class="material-symbols-outlined text-lg">add_shopping_cart</span>
                  <span>Adicionar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  incrementProduct(productId) {
    this.quantities[productId] = (this.quantities[productId] || 1) + 1;
    const el = document.getElementById(`qty-${productId}`);
    if (el) el.textContent = this.quantities[productId];
  }

  decrementProduct(productId) {
    if ((this.quantities[productId] || 1) > 1) {
      this.quantities[productId] -= 1;
      const el = document.getElementById(`qty-${productId}`);
      if (el) el.textContent = this.quantities[productId];
    }
  }

  addToCart(productId, customObs = '') {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const qty = this.quantities[productId] || 1;
    const existingIndex = this.cart.findIndex(item => item.productId === productId && item.obs === customObs);

    if (existingIndex > -1) {
      this.cart[existingIndex].quantidade += qty;
    } else {
      this.cart.push({
        id: 'cart-' + Date.now() + Math.random().toString(36).substr(2, 4),
        productId: product.id,
        nome: product.nome,
        preco: product.preco,
        quantidade: qty,
        obs: customObs
      });
    }

    // Reset qty selector
    this.quantities[productId] = 1;
    const el = document.getElementById(`qty-${productId}`);
    if (el) el.textContent = 1;

    this.updateCartUI();
    this.showToast(`Adicionado: ${qty}x ${product.nome}`);
  }

  openCustomizeModal(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    this.currentCustomizingProduct = product;

    document.getElementById('cust-title').textContent = `Personalizar ${product.nome}`;
    document.getElementById('cust-base-price').textContent = `BASE: R$ ${product.preco.toFixed(2).replace('.', ',')}`;
    this.openModal('customize-modal');
  }

  applyCustomization() {
    if (!this.currentCustomizingProduct) return;

    const doneness = document.querySelector('input[name="meat_doneness"]:checked')?.value || 'Ao Ponto';
    const bread = document.querySelector('input[name="bread_choice"]:checked')?.value || 'Brioche';
    const extraNotes = document.getElementById('cust-extra-notes')?.value || '';

    const obsParts = [`Ponto: ${doneness}`, `Pão: ${bread}`];
    if (extraNotes.trim()) obsParts.push(extraNotes.trim());

    const finalObs = obsParts.join(' • ');
    this.addToCart(this.currentCustomizingProduct.id, finalObs);
    this.closeModal('customize-modal');
  }

  updateCartItemQty(cartItemId, delta) {
    const item = this.cart.find(i => i.id === cartItemId);
    if (!item) return;

    item.quantidade += delta;
    if (item.quantidade <= 0) {
      this.cart = this.cart.filter(i => i.id !== cartItemId);
    }
    this.updateCartUI();
  }

  removeCartItem(cartItemId) {
    this.cart = this.cart.filter(i => i.id !== cartItemId);
    this.updateCartUI();
  }

  updateCartItemObs(cartItemId, newObs) {
    const item = this.cart.find(i => i.id === cartItemId);
    if (item) {
      item.obs = newObs;
    }
  }

  updateCartUI() {
    const container = document.getElementById('cart-items-container');
    const countBadge = document.getElementById('cart-item-count');
    const headerCartBadge = document.getElementById('header-cart-badge');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-grand-total');
    const checkoutLabel = document.getElementById('checkout-btn-label');

    const totalCount = this.cart.reduce((sum, item) => sum + item.quantidade, 0);
    const subtotal = this.cart.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    const taxaEntrega = this.cart.length > 0 ? 5.00 : 0.00;
    const total = subtotal + taxaEntrega;

    if (countBadge) countBadge.textContent = `${totalCount} ${totalCount === 1 ? 'ITEM' : 'ITENS'}`;
    if (headerCartBadge) headerCartBadge.textContent = totalCount;
    if (subtotalEl) subtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    if (totalEl) totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    if (checkoutLabel) checkoutLabel.textContent = `Avançar para Pagamento (R$ ${total.toFixed(2).replace('.', ',')})`;

    if (!container) return;

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-text-muted space-y-2">
          <span class="material-symbols-outlined text-4xl text-text-muted/50">production_quantity_limits</span>
          <p class="font-body-md text-body-md">Sua sacola está vazia.</p>
          <p class="font-body-sm text-body-sm text-text-secondary">Escolha um lanche delicioso do cardápio!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.cart.map(item => `
      <div class="bg-surface-container-low rounded-lg p-3.5 space-y-2.5 border border-surface-stroke/30" id="item-${item.id}">
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1">
            <h5 class="font-headline-sm text-body-md text-text-primary">${item.nome}</h5>
            <div class="font-label-code text-label-code text-accent-neon-green mt-0.5">R$ ${item.preco.toFixed(2).replace('.', ',')} un</div>
          </div>
          <button class="text-text-muted hover:text-error transition-colors p-1" onclick="window.burguerApp.removeCartItem('${item.id}')" type="button" title="Remover item">
            <span class="material-symbols-outlined text-sm">delete</span>
          </button>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center bg-surface-base rounded p-0.5">
            <button class="w-6 h-6 rounded bg-surface-card hover:bg-surface-hover text-text-primary flex items-center justify-center text-xs" onclick="window.burguerApp.updateCartItemQty('${item.id}', -1)" type="button">-</button>
            <span class="w-8 text-center font-label-code text-label-code text-text-primary">${item.quantidade}</span>
            <button class="w-6 h-6 rounded bg-surface-card hover:bg-surface-hover text-text-primary flex items-center justify-center text-xs" onclick="window.burguerApp.updateCartItemQty('${item.id}', 1)" type="button">+</button>
          </div>
          <span class="font-label-code text-body-sm text-text-primary font-bold">R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</span>
        </div>
        <div class="rounded bg-accent-neon-orange/10 p-2 space-y-1">
          <div class="flex items-center gap-1 text-accent-neon-orange font-label-badge text-label-badge uppercase">
            <span class="material-symbols-outlined text-xs">edit_note</span>
            <span>Obs do Cliente</span>
          </div>
          <input class="w-full bg-surface-base text-text-primary font-body-sm text-body-sm px-2 py-1 rounded placeholder-text-muted outline-none focus:ring-1 focus:ring-accent-neon-orange" placeholder="Adicionar observação (ex: sem cebola)..." type="text" value="${item.obs || ''}" onchange="window.burguerApp.updateCartItemObs('${item.id}', this.value)">
        </div>
      </div>
    `).join('');
  }

  handleCheckoutClick() {
    if (this.cart.length === 0) {
      alert('Seu carrinho está vazio! Adicione pelo menos um item para continuar.');
      return;
    }

    const nome = document.getElementById('input-client-name')?.value?.trim();
    const celular = document.getElementById('input-client-phone')?.value?.trim();
    const endereco = document.getElementById('input-client-address')?.value?.trim();

    if (!nome || !celular || !endereco) {
      alert('Por favor, preencha Nome, Celular e Endereço de Entrega para prosseguir.');
      document.getElementById('checkout-form')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const subtotal = this.cart.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    const total = subtotal + 5.00;

    const modalTotal = document.getElementById('modal-pix-total');
    if (modalTotal) modalTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

    this.openModal('payment-modal');
  }

  async confirmOrderPayment() {
    const nome = document.getElementById('input-client-name')?.value?.trim();
    const celular = document.getElementById('input-client-phone')?.value?.trim();
    const email = document.getElementById('input-client-email')?.value?.trim() || 'cliente@burguersync.com';
    const endereco = document.getElementById('input-client-address')?.value?.trim();
    const obsEntrega = document.getElementById('input-client-delivery-obs')?.value?.trim() || '';
    const paymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value || 'Pix';
    const troco = document.getElementById('input-client-troco')?.value?.trim() || null;

    const subtotal = this.cart.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    const total = subtotal + 5.00;

    const orderPayload = {
      cliente: { nome, celular, email, endereco, obsEntrega },
      itens: this.cart.map(i => ({
        nome: i.nome,
        preco: i.preco,
        quantidade: i.quantidade,
        obsItem: i.obs || 'Padrão'
      })),
      pagamento: { metodo: paymentMethod, troco },
      valores: { subtotal, taxaEntrega: 5.00, total }
    };

    const newOrder = await syncEngine.createOrder(orderPayload);

    this.closeModal('payment-modal');
    this.cart = [];
    this.updateCartUI();

    this.showToast(`🎉 Pedido #${newOrder.numero} enviado com sucesso para a cozinha!`);
    this.updateSystemLog(`Novo pedido #${newOrder.numero} recebido de ${nome}.`);
    this.playBeepAlert();

    // Redireciona para o KDS após 1.5s para visualização
    setTimeout(() => {
      this.switchTab('cozinha-kds');
    }, 1200);
  }

  startOrderSubscription() {
    syncEngine.subscribeToOrders((orders) => {
      if (this.lastOrderCount > 0 && orders.length > this.lastOrderCount) {
        this.playBeepAlert();
      }
      this.lastOrderCount = orders.length;
      this.allOrders = orders;
      this.renderKitchenKDS(orders);
    });
  }

  renderKitchenKDS(orders) {
    const laneRecebido = document.getElementById('lane-recebido');
    const lanePreparo = document.getElementById('lane-preparo');
    const laneEntrega = document.getElementById('lane-entrega');
    const laneEntregue = document.getElementById('lane-entregue');

    if (!laneRecebido || !lanePreparo || !laneEntrega || !laneEntregue) return;

    const counts = {
      recebido: 0,
      preparo: 0,
      entrega: 0,
      entregue: 0
    };

    const lanes = {
      'Recebido': [],
      'Em Preparo': [],
      'Saiu para Entrega': [],
      'Entregue': []
    };

    orders.forEach(order => {
      const st = order.status || 'Recebido';
      if (lanes[st]) lanes[st].push(order);
    });

    counts.recebido = lanes['Recebido'].length;
    counts.preparo = lanes['Em Preparo'].length;
    counts.entrega = lanes['Saiu para Entrega'].length;
    counts.entregue = lanes['Entregue'].length;

    // Atualiza contadores dos headers
    const countRecebido = document.getElementById('count-recebido');
    const countPreparo = document.getElementById('count-preparo');
    const countEntrega = document.getElementById('count-entrega');
    const countEntregue = document.getElementById('count-entregue');
    const activeOrdersCount = document.getElementById('active-orders-count');

    if (countRecebido) countRecebido.textContent = `${counts.recebido} Novos`;
    if (countPreparo) countPreparo.textContent = `${counts.preparo} Chapas`;
    if (countEntrega) countEntrega.textContent = `${counts.entrega} em Rota`;
    if (countEntregue) countEntregue.textContent = `${counts.entregue} Finalizados`;
    if (activeOrdersCount) activeOrdersCount.textContent = (counts.recebido + counts.preparo + counts.entrega);

    // Renderiza cada coluna
    laneRecebido.innerHTML = lanes['Recebido'].map(o => this.buildKanbanCard(o, 'recebido')).join('') || '<div class="text-xs text-text-muted text-center py-4">Nenhum pedido novo</div>';
    lanePreparo.innerHTML = lanes['Em Preparo'].map(o => this.buildKanbanCard(o, 'preparo')).join('') || '<div class="text-xs text-text-muted text-center py-4">Nenhum lanche na chapa</div>';
    laneEntrega.innerHTML = lanes['Saiu para Entrega'].map(o => this.buildKanbanCard(o, 'entrega')).join('') || '<div class="text-xs text-text-muted text-center py-4">Nenhum em trânsito</div>';
    laneEntregue.innerHTML = lanes['Entregue'].map(o => this.buildKanbanCard(o, 'entregue')).join('') || '<div class="text-xs text-text-muted text-center py-4">Nenhum concluído ainda</div>';
  }

  buildKanbanCard(order, stage) {
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - (order.horario || Date.now())) / 1000));
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    const timeFormatted = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

    let statusColorClass = 'bg-status-received';
    let buttonHtml = '';

    if (stage === 'recebido') {
      statusColorClass = 'bg-status-received';
      buttonHtml = `
        <button class="w-full mt-1 bg-surface-hover hover:bg-secondary-container hover:text-surface-base text-text-primary py-2.5 px-3 rounded font-headline-sm text-body-sm uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 group-hover:bg-secondary-container group-hover:text-surface-base shadow-sm" onclick="window.burguerApp.advanceStatus('${order.id}', 'Em Preparo')" type="button">
          <span>Iniciar Preparo</span>
          <span class="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      `;
    } else if (stage === 'preparo') {
      statusColorClass = 'bg-status-prep';
      buttonHtml = `
        <button class="w-full bg-status-prep hover:bg-accent-neon-orange text-surface-base py-2.5 px-3 rounded font-headline-sm text-body-sm uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 shadow-sm" onclick="window.burguerApp.advanceStatus('${order.id}', 'Saiu para Entrega')" type="button">
          <span>Enviar para Entrega</span>
          <span class="material-symbols-outlined text-sm">moped</span>
        </button>
      `;
    } else if (stage === 'entrega') {
      statusColorClass = 'bg-status-transit';
      buttonHtml = `
        <button class="w-full bg-surface-hover hover:bg-status-delivered hover:text-surface-base text-text-primary py-2.5 px-3 rounded font-headline-sm text-body-sm uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 group-hover:bg-status-delivered group-hover:text-surface-base shadow-sm" onclick="window.burguerApp.advanceStatus('${order.id}', 'Entregue')" type="button">
          <span class="material-symbols-outlined text-sm">check_circle</span>
          <span>Marcar como Entregue ✓</span>
        </button>
      `;
    } else if (stage === 'entregue') {
      statusColorClass = 'bg-status-delivered';
      buttonHtml = `
        <div class="w-full bg-surface-container text-text-muted py-2 px-3 rounded font-label-badge text-label-badge uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-default">
          <span class="material-symbols-outlined text-xs text-status-delivered">done_all</span>
          <span>Entregue com Sucesso</span>
        </div>
      `;
    }

    const isPix = order.pagamento?.metodo === 'Pix';
    const payBadge = isPix 
      ? '<span class="bg-primary/10 text-accent-neon-green font-label-badge text-label-badge px-1.5 py-0.5 rounded">PIX CONFIRMADO</span>'
      : `<span class="bg-secondary/10 text-secondary font-label-badge text-label-badge px-1.5 py-0.5 rounded">${order.pagamento?.metodo || 'DINHEIRO'}</span>`;

    return `
      <article class="bg-surface-card rounded-lg p-4 shadow-sm hover:shadow-md transition-all flex flex-col gap-3 group relative overflow-hidden card-kanban border border-surface-stroke/30 ${stage === 'entregue' ? 'opacity-75' : ''}" id="card-${order.id}">
        <div class="absolute left-0 top-0 bottom-0 w-1.5 ${statusColorClass}"></div>
        <div class="flex items-start justify-between gap-2 pl-1">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-label-code text-headline-sm text-text-primary font-bold">#${order.numero || order.id.substr(0, 5)}</span>
              ${payBadge}
            </div>
            <h3 class="font-headline-sm text-body-md text-text-primary mt-1 font-semibold">${order.cliente?.nome || 'Cliente'}</h3>
          </div>
          <div class="flex flex-col items-end">
            <span class="font-label-code text-label-code text-secondary-container flex items-center gap-1 bg-surface-container px-2 py-1 rounded">
              <span class="material-symbols-outlined text-xs">alarm</span>
              <span class="ticket-timer" data-timestamp="${order.horario || Date.now()}">${timeFormatted}</span>
            </span>
            <span class="font-body-sm text-body-sm text-text-muted mt-1 text-[11px]">${order.cliente?.celular || ''}</span>
          </div>
        </div>
        <div class="flex items-start gap-1.5 bg-surface-base/60 p-2 rounded text-text-secondary text-xs pl-2">
          <span class="material-symbols-outlined text-sm text-text-muted mt-0.5">location_on</span>
          <p class="font-body-sm text-body-sm leading-tight text-on-surface truncate">${order.cliente?.endereco || 'Retirada no Balcão'}</p>
        </div>
        <div class="flex flex-col gap-2 pt-1">
          ${(order.itens || []).map(item => `
            <div class="flex flex-col bg-surface-container p-2.5 rounded gap-1.5">
              <div class="flex items-center justify-between text-text-primary">
                <span class="font-headline-sm text-body-md font-semibold flex items-center gap-2">
                  <span class="bg-surface-card text-secondary-container px-1.5 py-0.5 rounded font-label-code text-xs">${item.quantidade}x</span>
                  ${item.nome}
                </span>
                <span class="font-label-code text-xs text-text-secondary">R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</span>
              </div>
              ${item.obsItem && item.obsItem !== 'Padrão' ? `
                <div class="bg-secondary-container/15 p-2 rounded flex items-start gap-2">
                  <span class="material-symbols-outlined text-accent-neon-orange text-sm mt-0.5">priority_high</span>
                  <span class="font-body-sm text-body-sm text-accent-neon-orange font-medium leading-tight">
                    "${item.obsItem}"
                  </span>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
        <div class="flex items-center justify-between text-xs text-text-secondary pt-1 px-1">
          <span>Total Pedido:</span>
          <span class="font-headline-sm text-sm text-accent-neon-green font-bold">R$ ${(order.valores?.total || 0).toFixed(2).replace('.', ',')}</span>
        </div>
        ${buttonHtml}
      </article>
    `;
  }

  async advanceStatus(orderId, newStatus) {
    await syncEngine.updateOrderStatus(orderId, newStatus);
    this.updateSystemLog(`Comanda ${orderId} avançou para [${newStatus}].`);
  }

  updateSystemLog(msg) {
    const logEl = document.getElementById('system-log-entry');
    if (logEl) {
      const timeStr = new Date().toLocaleTimeString('pt-BR');
      logEl.innerHTML = `<span class="text-accent-neon-green">[${timeStr}]</span> ${msg}`;
    }
  }

  startTicketTimers() {
    setInterval(() => {
      document.querySelectorAll('.ticket-timer').forEach(el => {
        const timestamp = parseInt(el.getAttribute('data-timestamp') || '0', 10);
        if (timestamp > 0) {
          const elapsed = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
          const mins = Math.floor(elapsed / 60);
          const secs = elapsed % 60;
          el.textContent = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }
      });
    }, 1000);
  }

  playBeepAlert() {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.audioContext.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1320, this.audioContext.currentTime + 0.15); // E6
      gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.start();
      osc.stop(this.audioContext.currentTime + 0.35);
    } catch (e) {
      console.log('Audio notification prevented:', e.message);
    }
  }

  copyPixCode() {
    const input = document.getElementById('pix-copy-input');
    if (input) {
      input.select();
      navigator.clipboard.writeText(input.value).then(() => {
        const btn = document.getElementById('btn-copy-pix');
        if (btn) {
          btn.textContent = 'Copiado!';
          btn.classList.add('bg-white', 'text-surface-base');
          setTimeout(() => {
            btn.textContent = 'Copiar';
            btn.classList.remove('bg-white', 'text-surface-base');
          }, 2000);
        }
        this.showToast('Chave Pix copiada para a área de transferência!');
      });
    }
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-6 right-6 z-50 bg-surface-card border border-accent-neon-green/50 text-text-primary px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in text-body-sm';
    toast.innerHTML = `
      <span class="material-symbols-outlined text-accent-neon-green">check_circle</span>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

// Inicializa a aplicação
window.addEventListener('DOMContentLoaded', () => {
  window.burguerApp = new BurguerSyncApp();
  window.burguerApp.init();
});
