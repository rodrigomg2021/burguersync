# 🚀 Guia de Comandos e Execução - BurguerSync

Este guia detalha o passo a passo para inicialização local, gestão de variáveis de ambiente e publicação em nuvem do **BurguerSync**.

---

## 📋 Pré-requisitos
* **Node.js:** Versão 18 ou superior instalada.
* **Navegador Moderno:** Chrome, Edge, Firefox ou Safari.

---

## ⚙️ Configuração de Variáveis de Ambiente (.env)
Certifique-se de que o arquivo `.env` na raiz contenha as chaves de integração:

```env
GITHUB_PERSONAL_KEY=ghp_suaChaveAqui
FIREBASE_apiKey= "AIzaSy..."
FIREBASE_authDomain= "buggersync.firebaseapp.com"
FIREBASE_projectId= "buggersync"
FIREBASE_storageBucket= "buggersync.firebasestorage.app"
FIREBASE_messagingSenderId= "574213602808"
FIREBASE_appId= "1:574213602808:web:..."
```

---

## 💻 Execução Local

### Método Rápido (Windows)
Basta clicar duas vezes no arquivo `executar.bat` na raiz do projeto.

### Método Manual (Terminal)
```bash
# 1. Navegar até a pasta do frontend
cd frontend

# 2. Instalar as dependências
npm install

# 3. Iniciar o servidor de desenvolvimento
npm run dev
```
Acesse no navegador: `http://localhost:3000`

---

## ☁️ Publicação no GitHub e Deploy
Para enviar todo o código para o GitHub e configurar o GitHub Pages automaticamente:

```bash
node scripts/publish-to-github.js
```
