# 🎨 Design System - Cyber-Kitchen Industrial HUD (BurguerSync)

Extraído diretamente do protótipo **Google Stitch** (`projects/28706035966455653`).

---

## 1. Paleta de Cores

| Token | Hex / Valor | Uso |
|---|---|---|
| `surface-base` | `#121214` | Fundo principal da aplicação |
| `surface-card` | `#202024` | Superfície de cards, comandas e modais |
| `surface-hover` | `#29292E` | Estado de hover e foco em cards |
| `surface-stroke` | `#323238` | Bordas e divisores sutis |
| `accent-neon-green` | `#04D361` | Confirmação de Pix, status Entregue, CTAs de sucesso |
| `accent-neon-orange` | `#FF9000` | CTAs principais, status Em Preparo, alertas de comanda |
| `status-received` | `#388E3C` | Comandas recebidas / entrada |
| `status-prep` | `#FF9000` | Comandas em cocção na chapa |
| `status-transit` | `#00B4D8` | Comandas em trânsito com motoboy |
| `status-delivered` | `#04D361` | Comandas concluídas e arquivadas |

---

## 2. Tipografia

* **Títulos, Números e Códigos:** `Space Grotesk` (Pesos: 600, 700, 800)
* **Textos Corridos e Ingredientes:** `Geist` (Pesos: 300, 400, 500, 600)
* **Ícones de Ação:** `Material Symbols Outlined` (Google Fonts)

---

## 3. Componentes Chave

1. **Card de Comanda KDS:** Indicador de status lateral (1.5rem), temporizador reativo em tempo real, badges de pagamento e botão de avanço determinístico de estado.
2. **Vitrine Split-Card:** Imagem gastronômica lateral, tags de composição, stepper numérico de quantidade e modal de customização (ponto da carne e pão).
3. **Modal de Pix:** QR Code gerado, Chave Copia e Cola instantânea e feedback tátil/visual de cópia.
