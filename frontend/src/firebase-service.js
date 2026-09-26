/**
 * Firebase Firestore Service com Camada de Resiliência Self-Annealing
 * Sistema: BurguerSync Ourinhos
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

export const firebaseConfig = {
  apiKey: "AIzaSyARt37OUOTmk_Dps0PcAV7ZRGFAy4m4UaA",
  authDomain: "buggersync.firebaseapp.com",
  projectId: "buggersync",
  storageBucket: "buggersync.firebasestorage.app",
  messagingSenderId: "574213602808",
  appId: "1:574213602808:web:10eea116cc0964e93aaa0d"
};

class FirebaseSyncEngine {
  constructor() {
    this.app = null;
    this.db = null;
    this.isCloudOnline = false;
    this.broadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('burguersync_realtime_channel') : null;
    this.localOrdersKey = 'burguersync_orders_cache';
    this.listeners = [];
    this.init();
  }

  init() {
    try {
      this.app = initializeApp(firebaseConfig);
      this.db = getFirestore(this.app);
      console.log('🔥 [FirebaseSyncEngine] SDK do Firebase inicializado com sucesso.');
    } catch (err) {
      console.warn('⚠️ [FirebaseSyncEngine] Falha ao inicializar SDK Firebase direto:', err.message);
    }

    // Inicializa canal de sincronização entre abas locais
    if (this.broadcastChannel) {
      this.broadcastChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'SYNC_ORDERS') {
          console.log('🔄 [BroadcastChannel] Sincronização entre abas recebida.');
          this.notifyListeners(this.getLocalOrders());
        }
      };
    }

    // Carrega pedidos iniciais se vazio
    if (!localStorage.getItem(this.localOrdersKey)) {
      this.seedInitialOrders();
    }
  }

  seedInitialOrders() {
    const defaultOrders = [
      {
        id: 'ord-1042',
        numero: '1042',
        cliente: {
          nome: 'Lucas Silva',
          celular: '(14) 99876-5432',
          email: 'lucas.silva@email.com',
          endereco: 'Rua das Flores, 420 - Centro, Ourinhos',
          obsEntrega: 'Interfone 12, portaria liberada'
        },
        itens: [
          { nome: 'Monster Bacon SENAI', preco: 38.50, quantidade: 1, obsItem: 'Bacon bem crocante, sem picles' },
          { nome: 'Batata Rústica Trufada', preco: 18.00, quantidade: 1, obsItem: 'Padrão' }
        ],
        pagamento: { metodo: 'Pix', troco: null },
        valores: { subtotal: 56.50, taxaEntrega: 5.00, total: 61.50 },
        status: 'Recebido',
        horario: Date.now() - 8 * 60 * 1000 // 8 minutos atrás
      },
      {
        id: 'ord-1041',
        numero: '1041',
        cliente: {
          nome: 'Mariana Costa',
          celular: '(14) 99123-4567',
          email: 'mariana.costa@email.com',
          endereco: 'Av. Brasil, 1500 - Ap 42, Ourinhos',
          obsEntrega: 'Deixar na portaria'
        },
        itens: [
          { nome: 'Ourinhos Smash Burguer', preco: 32.90, quantidade: 2, obsItem: '1x sem cebola, carne bem passada' },
          { nome: 'Bebida Artesanal Gelada', preco: 8.00, quantidade: 2, obsItem: 'Soda artesanal de limão' }
        ],
        pagamento: { metodo: 'Cartao_Entrega', troco: null },
        valores: { subtotal: 81.80, taxaEntrega: 5.00, total: 86.80 },
        status: 'Em Preparo',
        horario: Date.now() - 15 * 60 * 1000 // 15 minutos atrás
      },
      {
        id: 'ord-1040',
        numero: '1040',
        cliente: {
          nome: 'Rodrigo Souza',
          celular: '(14) 99765-4321',
          email: 'rodrigo.souza@email.com',
          endereco: 'Rua Antonio Prado, 310 - Vila Boa Esperança, Ourinhos',
          obsEntrega: 'Casa com portão preto'
        },
        itens: [
          { nome: 'Double Cheddar Melt', preco: 34.00, quantidade: 1, obsItem: 'Cheddar extra' },
          { nome: 'Batata Rústica Trufada', preco: 18.00, quantidade: 1, obsItem: 'Padrão' }
        ],
        pagamento: { metodo: 'Pix', troco: null },
        valores: { subtotal: 52.00, taxaEntrega: 5.00, total: 57.00 },
        status: 'Saiu para Entrega',
        horario: Date.now() - 22 * 60 * 1000 // 22 minutos atrás
      },
      {
        id: 'ord-1039',
        numero: '1039',
        cliente: {
          nome: 'Camila Nogueira',
          celular: '(14) 98888-1122',
          email: 'camila.nogueira@email.com',
          endereco: 'Rua Nove de Julho, 750 - Centro, Ourinhos',
          obsEntrega: 'Entregue'
        },
        itens: [
          { nome: 'Ourinhos Smash Burguer', preco: 32.90, quantidade: 1, obsItem: 'Padrão' }
        ],
        pagamento: { metodo: 'Dinheiro_Entrega', troco: 'Troco para R$ 50,00' },
        valores: { subtotal: 32.90, taxaEntrega: 5.00, total: 37.90 },
        status: 'Entregue',
        horario: Date.now() - 45 * 60 * 1000 // 45 minutos atrás
      }
    ];
    localStorage.setItem(this.localOrdersKey, JSON.stringify(defaultOrders));
  }

  getLocalOrders() {
    try {
      const data = localStorage.getItem(this.localOrdersKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveLocalOrders(orders) {
    localStorage.setItem(this.localOrdersKey, JSON.stringify(orders));
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'SYNC_ORDERS' });
    }
    this.notifyListeners(orders);
  }

  notifyListeners(orders) {
    this.listeners.forEach(callback => {
      try {
        callback(orders);
      } catch (err) {
        console.error('Erro ao notificar listener:', err);
      }
    });
  }

  /**
   * Assina atualizações em tempo real dos pedidos
   */
  subscribeToOrders(callback) {
    this.listeners.push(callback);

    // Emite o estado inicial imediatamente
    callback(this.getLocalOrders());

    // Conecta ao Firestore Realtime onSnapshot
    if (this.db) {
      try {
        const q = query(collection(this.db, 'pedidos'), orderBy('horario', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          this.isCloudOnline = true;
          this.updateConnectionStatusUI(true);
          
          if (!snapshot.empty) {
            const cloudOrders = [];
            snapshot.forEach(docSnap => {
              const data = docSnap.data();
              cloudOrders.push({
                id: docSnap.id,
                ...data,
                horario: data.horario?.toMillis ? data.horario.toMillis() : (data.horario || Date.now())
              });
            });
            this.saveLocalOrders(cloudOrders);
          }
        }, (error) => {
          console.warn('⚡ [Self-Annealing] Firestore em modo resiliente local:', error.message);
          this.isCloudOnline = false;
          this.updateConnectionStatusUI(false);
          // Continua operando perfeitamente via buffer local
          callback(this.getLocalOrders());
        });

        return unsubscribe;
      } catch (err) {
        console.warn('⚡ [Self-Annealing] Ativando buffer local reativo:', err.message);
        this.updateConnectionStatusUI(false);
      }
    }

    return () => {};
  }

  /**
   * Criação de novo pedido (Visão do Cliente)
   */
  async createOrder(orderData) {
    const orderNumber = Math.floor(1000 + Math.random() * 9000).toString();
    const formattedOrder = {
      numero: orderNumber,
      cliente: orderData.cliente,
      itens: orderData.itens,
      pagamento: orderData.pagamento,
      valores: {
        subtotal: orderData.valores.subtotal,
        taxaEntrega: 5.00, // SOP Layer 1: Taxa fixa R$ 5,00
        total: orderData.valores.total
      },
      status: 'Recebido', // Fluxo inicial SOP
      horario: Date.now()
    };

    // Salva localmente primeiro (Optimistic UI / Zero Latência)
    const localOrders = this.getLocalOrders();
    const localId = 'ord-' + Date.now();
    const newOrder = { id: localId, ...formattedOrder };
    localOrders.unshift(newOrder);
    this.saveLocalOrders(localOrders);

    // Grava no Firestore se disponível
    if (this.db) {
      try {
        const docRef = await addDoc(collection(this.db, 'pedidos'), {
          ...formattedOrder,
          horario: serverTimestamp()
        });
        newOrder.id = docRef.id;
        this.saveLocalOrders(localOrders);
        console.log('✅ [Firebase] Pedido salvo na nuvem com ID:', docRef.id);
      } catch (err) {
        console.warn('⚡ [Self-Annealing] Pedido salvo localmente no buffer de contingência:', err.message);
      }
    }

    return newOrder;
  }

  /**
   * Atualização de status do pedido (Visão da Cozinha KDS)
   */
  async updateOrderStatus(orderId, newStatus) {
    // Atualiza localmente
    const localOrders = this.getLocalOrders();
    const orderIndex = localOrders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      localOrders[orderIndex].status = newStatus;
      this.saveLocalOrders(localOrders);
    }

    // Tenta atualizar no Firestore
    if (this.db && !orderId.startsWith('ord-')) {
      try {
        const orderRef = doc(this.db, 'pedidos', orderId);
        await updateDoc(orderRef, { status: newStatus });
        console.log(`✅ [Firebase] Status do pedido ${orderId} alterado para "${newStatus}"`);
      } catch (err) {
        console.warn('⚡ [Self-Annealing] Status atualizado no buffer local:', err.message);
      }
    }
  }

  updateConnectionStatusUI(isOnline) {
    const pill = document.getElementById('connection-pill');
    if (pill) {
      if (isOnline) {
        pill.innerHTML = `
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-neon-green opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-neon-green"></span>
          </span>
          <span class="font-label-code text-label-code text-accent-neon-green uppercase tracking-wider">Cloud Firestore Ativo</span>
        `;
      } else {
        pill.innerHTML = `
          <span class="relative flex h-2.5 w-2.5">
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary-container"></span>
          </span>
          <span class="font-label-code text-label-code text-secondary-container uppercase tracking-wider">Buffer Local Sincronizado</span>
        `;
      }
    }
  }
}

export const syncEngine = new FirebaseSyncEngine();
