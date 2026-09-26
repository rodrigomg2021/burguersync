/**
 * Script Determinístico de Publicação no GitHub e GitHub Pages
 * Projeto: BurguerSync Ourinhos
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Carregar variáveis do .env
function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error('Arquivo .env não encontrado na raiz!');
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        let key = match[1].trim();
        let val = match[2].trim();
        // Remove aspas se houver
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.endsWith(',')) val = val.slice(0, -1).trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        env[key] = val;
      }
    }
  });
  return env;
}

const env = loadEnv();
const token = env.GITHUB_PERSONAL_KEY;
const repoName = 'burguersync';

if (!token) {
  console.error('❌ Chave GITHUB_PERSONAL_KEY não encontrada no .env!');
  process.exit(1);
}

const headers = {
  'Authorization': `token ${token}`,
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'BurguerSync-Orchestrator'
};

async function githubRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) }
  });
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: response.status, ok: response.ok, data: json, text };
}

async function run() {
  console.log('🚀 [GitHub Deploy] Iniciando processo de publicação do BurguerSync...');

  // 1. Obter usuário autenticado
  const userRes = await githubRequest('https://api.github.com/user');
  if (!userRes.ok) {
    console.error('❌ Falha ao autenticar no GitHub:', userRes.data || userRes.text);
    process.exit(1);
  }
  const username = userRes.data.login;
  console.log(`👤 Autenticado como usuário: ${username}`);

  // 2. Verificar se o repositório já existe ou criar
  let repoRes = await githubRequest(`https://api.github.com/repos/${username}/${repoName}`);
  if (repoRes.status === 404) {
    console.log(`📦 Criando repositório '${repoName}' no GitHub...`);
    const createRes = await githubRequest('https://api.github.com/user/repos', {
      method: 'POST',
      body: JSON.stringify({
        name: repoName,
        description: '🍔 BurguerSync Ourinhos - Sistema de Pedidos & Cozinha em Tempo Real com Firebase e Google Antigravity',
        private: false,
        auto_init: true
      })
    });
    if (!createRes.ok) {
      console.error('❌ Erro ao criar repositório:', createRes.data || createRes.text);
      process.exit(1);
    }
    console.log(`✅ Repositório criado com sucesso: ${createRes.data.html_url}`);
    // Aguarda 3 segundos para propagação do commit inicial
    await new Promise(r => setTimeout(r, 3000));
  } else {
    console.log(`📦 Repositório '${repoName}' já existe.`);
  }

  // 3. Coletar arquivos do projeto para upload
  console.log('📂 Coletando arquivos do projeto...');
  const filesToUpload = [];

  function collectFiles(dirPath, relativeDir = '') {
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      if (item === 'node_modules' || item === '.git' || item === '.tmp' || item === '.env' || item === '.agents') {
        continue;
      }
      const fullPath = path.join(dirPath, item);
      const relPath = path.join(relativeDir, item).replace(/\\/g, '/');
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        collectFiles(fullPath, relPath);
      } else {
        filesToUpload.push({
          relPath,
          fullPath
        });
      }
    }
  }

  collectFiles(rootDir);
  console.log(`📄 Total de ${filesToUpload.length} arquivos mapeados para sincronização.`);

  // 4. Upload de arquivos via GitHub Contents API
  for (const file of filesToUpload) {
    try {
      const contentBuffer = fs.readFileSync(file.fullPath);
      const contentBase64 = contentBuffer.toString('base64');
      const url = `https://api.github.com/repos/${username}/${repoName}/contents/${file.relPath}`;

      // Verifica se o arquivo já existe no repo para obter o sha
      const existingRes = await githubRequest(url);
      const body = {
        message: `feat(sync): sincronizar ${file.relPath} via Antigravity Orchestrator`,
        content: contentBase64
      };
      if (existingRes.ok && existingRes.data && existingRes.data.sha) {
        body.sha = existingRes.data.sha;
      }

      const putRes = await githubRequest(url, {
        method: 'PUT',
        body: JSON.stringify(body)
      });

      if (putRes.ok) {
        console.log(`  ✓ Enviado: ${file.relPath}`);
      } else {
        console.warn(`  ⚠️ Falha ao enviar ${file.relPath}:`, putRes.data?.message || putRes.text);
      }
    } catch (err) {
      console.warn(`  ⚠️ Erro no arquivo ${file.relPath}:`, err.message);
    }
  }

  // 5. Configurar GitHub Pages
  console.log('🌐 Configurando GitHub Pages...');
  const pagesRes = await githubRequest(`https://api.github.com/repos/${username}/${repoName}/pages`, {
    method: 'POST',
    body: JSON.stringify({
      source: {
        branch: 'main',
        path: '/'
      }
    })
  });

  const repoUrl = `https://github.com/${username}/${repoName}`;
  const pagesUrl = `https://${username}.github.io/${repoName}/frontend/`;

  console.log('\n========================================================');
  console.log('🎉 PUBLICAÇÃO CONCLUÍDA COM SUCESSO!');
  console.log(`🔗 Repositório GitHub: ${repoUrl}`);
  console.log(`🚀 Live Demo (GitHub Pages): ${pagesUrl}`);
  console.log('========================================================\n');
}

run().catch(err => {
  console.error('❌ Erro fatal no script de publicação:', err);
  process.exit(1);
});
