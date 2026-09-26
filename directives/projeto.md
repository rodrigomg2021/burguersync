# 📘 SOP Mestre: BurguerSync
**Status:** Planejamento / Inicialização | **Versão:** 2.5.5

## 1. Visão Geral e Objetivo Principal
A aplicação "BurguerSync" (focada na unidade Ourinhos) é um sistema de pedidos e gestão de cozinha em tempo real[cite: 3]. O objetivo é entregar uma experiência web moderna e responsiva, dividida entre a jornada de compra do cliente (Vitrine/Carrinho) e a operação do restaurante (Dashboard Kanban da Cozinha)[cite: 1, 3]. A arquitetura garante a separação rigorosa entre a lógica de negócios e o código estrito de execução, visando alta disponibilidade e uma operação fluida semelhante aos padrões de aplicativos de delivery líderes de mercado, como o iFood[cite: 1].

## 2. Arquitetura do Projeto (Antigravity v2.5.5)
O projeto utilizará a arquitetura de 3 camadas para isolar responsabilidades e garantir resiliência:

*   **Layer 1 (Diretiva & Estratégia - Lógica de Negócio):** 
    *   Este documento de SOP, onde residem as regras de negócio intrínsecas: taxa de entrega fixa de R$ 5,00[cite: 1, 3], obrigatoriedade de validação (Nome, Celular, Endereço e carrinho não vazio)[cite: 3], estruturação do banco de dados (coleção `pedidos` com campos para `cliente`, `itens`, `pagamento`, `valores`, `status` e `horario`)[cite: 3], e o fluxo estrito de status do pedido: `"Recebido" -> "Em Preparo" -> "Saiu para Entrega" -> "Entregue"`[cite: 1, 3].
*   **Layer 2 (Orquestração / Gemini 3.8 Flash):** 
    *   O Agente de IA coordenando o fluxo de dados, interpretando as regras da Layer 1 para gerar o layout, instruindo a injeção correta de credenciais via arquivo `.env`, e guiando o ambiente para que os entregáveis finais sejam preparados para a nuvem[cite: 2, 3].
*   **Layer 3 (Execução & Determinismo - Código):** 
    *   Scripts, arquivos de UI e lógicas de interação em HTML5, CSS3 e JavaScript. O código será puramente determinístico, focado em interações diretas como o envio de um pedido à base via `addDoc` e a alteração de status via `updateDoc` no Firebase[cite: 3].

## 3. Escopo Tecnológico & Requisitos (Tech Stack)
*   **Frontend / Interface:** HTML5 e CSS3 nativos ou estruturados, visando uma UI gerada inicialmente via Google Stitch e refinamento por IA[cite: 3].
*   **Backend / API e Persistência:** Firebase Cloud Firestore (Banco NoSQL) operando em tempo real com o SDK Web v10 (Módulos ES6 via CDN)[cite: 3]. 
*   **Infraestrutura e Entregáveis:** O deploy final e automatizado será feito em nuvem, especificamente no GitHub Pages[cite: 3].
*   **Variáveis de Ambiente:** As credenciais do Firebase deverão ser lidas dinamicamente a partir do arquivo `.env` estrito ao ambiente[cite: 3].

## 4. Diretrizes de UX/UI e Referências Visuais
*   **Inspiração Real:** A interface deve emular a experiência fluida do aplicativo iFood, adotando um visual Premium Dark Mode[cite: 1, 2].
*   **Experiência do Usuário:** Priorizar a abordagem Mobile-First[cite: 1, 2]. A paleta de cores deve seguir: Fundo escuro (#121214), cards cinza (#202024), contrastando com chamadas de ação em laranja/amarelo neon (#FF9000) e notificações/confirmações em verde (#04D361)[cite: 1].
*   **Interatividade Realtime:** A "Visão Cozinha" deve atualizar sua interface instantaneamente sem necessidade de refresh (F5), utilizando `onSnapshot` ordenado de forma descendente pelo horário do pedido[cite: 3].

## 5. Fluxo Operacional de Execução
1.  **Kickoff e Configuração de Ambiente:** Leitura do prompt consolidado e do arquivo `ideia-projeto.md`[cite: 2]. Garantir que todo e qualquer rascunho, log ou arquivo intermediário seja salvo exclusivamente no diretório `.tmp/`.
2.  **Desenvolvimento Modular da Interface (Layer 3):** Implementação segregada da **Visão Cliente** (Vitrine e Carrinho com campos de endereço e pagamento) e **Visão Cozinha** (Dashboard interativo de Kanban) baseados nas diretrizes do design[cite: 1, 3].
3.  **Codificação do Backend as a Service (Firebase):** Configuração determinística de envio (`addDoc`), escuta (`onSnapshot`) e atualização (`updateDoc`) no Firestore[cite: 3].
4.  **Empacotamento e Entrega:** Geração de scripts de inicialização locais e documentação de build[cite: 2]. Preparação e migração dos arquivos do diretório `.tmp/` para os entregáveis que irão para a nuvem no GitHub Pages[cite: 3].

## 6. Definição de Sucesso (Deliverables)
*   **Entregáveis Finais:** Uma aplicação web em nuvem, totalmente responsiva e funcional, com clientes conseguindo efetuar pedidos e a cozinha acompanhando as atualizações de forma reativa e instantânea.
*   **Arquivos de Suporte Obrigatórios:** 
    *   `README.md` (Vitrine bilíngue e moderna documentando o BurguerSync)[cite: 2].
    *   `instruction.md` (Guia rápido de terminal para gerenciar chaves e dependências locais)[cite: 2].
    *   `executar.bat` (Script de inicialização autossuficiente para ambiente Windows local)[cite: 2].

## 7. Tratamento de Erros, Resiliência e Self-Annealing
*   **Detecção e Isolamento de Falhas:** Quaisquer erros de compilação de front-end, logs de testes ou travamentos de rede durante a execução no ambiente local devem gerar rastreios que serão despejados unicamente na pasta `.tmp/error_logs.txt`. 
*   **Correção Direta (Self-Annealing):** O sistema deve analisar autonomamente o traceback no diretório `.tmp/` e reverter ou ajustar o código na Layer 3. Em caso de falha de conexão na escuta em tempo real do Firebase (`onSnapshot`), a lógica do painel da cozinha deverá implementar retentativas silenciosas e caches de estado local até o restabelecimento da rede, sem depender de refresh manual. 
*   **Evolução Documental:** Atualizar as premissas deste SOP e regras do banco de dados na pasta de documentação caso o schema do Firebase precise evoluir para suportar novos comportamentos não previstos no `.env` atual[cite: 2, 3].