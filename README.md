<div align="center">

# 🍔 BurguerSync Ourinhos
### *Real-Time Order & Kitchen Display System (KDS)*
### *Sistema de Pedidos e Gestão de Cozinha em Tempo Real*

[![Google Antigravity](https://img.shields.io/badge/Developed%20with-Google%20Antigravity-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://antigravity.google)
[![Google Stitch](https://img.shields.io/badge/Design-Google%20Stitch-FF9000?style=for-the-badge&logo=material-design&logoColor=white)](https://stitch.googleapis.com)
[![Firebase](https://img.shields.io/badge/Database-Cloud%20Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/Styles-Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Bundler-Vite%206-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-222222?style=for-the-badge&logo=github&logoColor=white)](https://pages.github.com)

<br/>

[English Version](#-english-version) • [Versão em Português](#-versão-em-português) • [Live Demo](#-live-demo)

</div>

---

## 🌐 Live Demo
* 🔗 **Aplicação em Nuvem:** [https://rodrigomg2021.github.io/burguersync/frontend/](https://rodrigomg2021.github.io/burguersync/frontend/)
* 📦 **Repositório Oficial:** [https://github.com/rodrigomg2021/burguersync](https://github.com/rodrigomg2021/burguersync)

---

## 🇧🇷 Versão em Português

### 📖 Sobre o Projeto
O **BurguerSync** é uma plataforma de delivery e controle operacional de cozinha em tempo real desenhada para a hamburgueria artesanal de Ourinhos. A solução combina a experiência de compra fluida (estilo iFood Dark Mode) com uma central de produção industrial KDS (Kitchen Display System) em Kanban dinâmico.

Construído utilizando **Google Antigravity**, integrando os protótipos visuais gerados no **Google Stitch**, banco de dados NoSQL reativo no **Firebase Cloud Firestore** e hospedagem contínua no **GitHub Pages**.

### 🤖 Agentes de IA & Skill Packs Utilizados
* 🧠 **Agente Orquestrador:** Coordenação de diretivas estratégicas (SOP), automação determinística e auto-recuperação (Self-Annealing).
* 🎨 **Google Stitch MCP:** Extração dos tokens de design, tipografia Space Grotesk/Geist e componentes Cyber-Kitchen.
* 📦 **Skill Packs Antigravity:** `@clean-code`, `@frontend-design`, `@intelligent-routing`, `@database-design`.

### 🏗️ Arquitetura de 3 Camadas
1. **Layer 1 (Diretiva & Estratégia):** Regras de negócio estritas em `/directives/` (taxa de entrega fixa de R$ 5,00, validação obrigatória de clientes, fluxo determinístico de 4 estados `[Recebido] ➔ [Em Preparo] ➔ [Saiu para Entrega] ➔ [Entregue]`).
2. **Layer 2 (Orquestração & Inteligência):** Gestão de estado reativo, sincronização multi-aba via `BroadcastChannel` e integração Firebase no `/frontend/src/firebase-service.js`.
3. **Layer 3 (Execução & Determinismo):** Componentes de interface pura, modais de Pix instantâneo, cálculo de comanda e triggers do Firestore.

### 🚀 Inicialização Rápida (Windows)
1. Dê um duplo clique no arquivo `executar.bat` na raiz do projeto.
2. Ou via terminal:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🇺🇸 English Version

### 📖 About the Project
**BurguerSync** is a high-performance food delivery and realtime kitchen display system (KDS) designed for an artisanal burger house. It delivers a rich, dark-mode consumer shopping experience coupled with a 4-column live production Kanban board.

Built with **Google Antigravity**, leveraging UI screens from **Google Stitch**, realtime NoSQL persistence via **Firebase Cloud Firestore**, and automated deployment to **GitHub Pages**.

### 🤖 AI Agents & Skill Packs
* 🧠 **Orchestrator Agent:** 3-Layer architecture governance, self-annealing error resilience, and automated deployment pipelines.
* 🎨 **Google Stitch MCP:** Seamless design token import, Space Grotesk / Geist typography, and Cyber-Kitchen HUD aesthetics.
* 📦 **Antigravity Skill Packs:** `@clean-code`, `@frontend-design`, `@intelligent-routing`, `@database-design`.

### 🛠️ Tech Stack & Key Features
- **Frontend:** HTML5, Modern ES6+, Tailwind CSS, Space Grotesk & Geist typography.
- **Backend & Database:** Firebase Cloud Firestore (Web SDK v10 ES6 modules) with `onSnapshot` realtime listeners.
- **Self-Annealing Resilience:** Automatic fallback buffer with `BroadcastChannel` for zero-downtime offline multi-tab synchronization.
- **Interactive Checkout:** Instant Pix QR Code + copy-paste key, card on delivery, cash with change calculation.
- **Audio Telemetry:** Web Audio API sound alerts upon receiving new orders in the kitchen.

---

<div align="center">
  <sub>Desenvolvido com excelência por Rodrigo Carlos com <strong>Google Antigravity</strong> • SENAI Ourinhos Edition</sub>
</div>
