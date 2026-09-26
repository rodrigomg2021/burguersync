# Standard Operating Procedure (SOP) - Projeto: BurguerSync

## Layer 1: Diretivas (Lógica de Negócio e Regras de Decisão)
**Objetivo Principal:** Desenvolver a arquitetura e estruturação do projeto "BurguerSync", uma aplicação web moderna, fluida e responsiva voltada para o setor de alimentação (estilo iFood)[cite: 1].

**Regras de Negócio e Restrições:**
1. **Separação de Contextos de Usuário:** A aplicação deve obrigatoriamente possuir duas interfaces principais na navegação inicial: a "Visão do Cliente" (focada em fazer pedidos) e a "Visão da Cozinha" (painel em tempo real para gerenciamento)[cite: 1].
2. **Identidade Visual e UX:** O design deve adotar a abordagem Mobile-First em Dark Mode, utilizando fundo escuro (#121214), cards cinza (#202024), destaques em laranja/amarelo neon (#FF9000) e verde para confirmações (#04D361), conforme descrito no arquivo `ideia-desing.md`[cite: 1].
3. **Gerenciamento de Infraestrutura e Artefatos:** Todo e qualquer arquivo temporário, log de execução, rascunho de código ou artefato intermediário deve ser armazenado exclusivamente no diretório `.tmp/`. Os arquivos finais e entregáveis do projeto devem ser configurados para provisionamento direto em nuvem.
4. **Fluxo Financeiro e de Pedido:** O carrinho de compras deve aplicar uma taxa de entrega fixa de R$ 5,00 e oferecer opções de pagamento na entrega (cartão ou dinheiro com troco) ou via Pix instantâneo (com chave copia e cola ou QR Code)[cite: 1].
5. **Mapeamento de Status (Cozinha):** O ciclo de vida do pedido deve seguir estritamente o fluxo sequencial: `[Recebido]` ➔ `[Em Preparo]` ➔ `[Saiu para Entrega]` ➔ `[Entregue]`[cite: 1].

## Layer 2: Orquestração (Fluxo de Trabalho e Coordenação de Estados)
**Passo a Passo da Implementação:**
1. **Setup Inicial:** Inicializar o repositório do projeto, criar a estrutura de pastas (garantindo a existência da pasta `.tmp/`) e definir as variáveis de ambiente para a arquitetura de nuvem.
2. **Roteamento e Visualização:** Configurar os endpoints e rotas do Frontend para separar o tráfego que acessa a Vitrine de Lanches e o tráfego que acessa o Dashboard Kanban da Cozinha[cite: 1].
3. **Orquestração da Vitrine do Cliente:** Construir a interface dos produtos (como o *Ourinhos Smash Burguer* e *Monster Bacon SENAI*), integrando a lógica de incremento/decremento de quantidades no carrinho e o campo de observações por item[cite: 1].
4. **Orquestração de Eventos da Cozinha:** Implementar o gerenciamento de estado em tempo real. Cada novo pedido deve surgir como um card no dashboard contendo os dados do cliente, endereço, itens e observações em amarelo[cite: 1].
5. **Preparação para Nuvem:** Compilar a versão de produção. Transferir o build final para o diretório de artefatos da nuvem e limpar de forma segura os dados temporários desnecessários da pasta `.tmp/`.

## Layer 3: Execução (Código Determinístico e Ações Finais)
**Instruções de Implementação:**
*   **Isolamento de Código:** A camada de UI (componentes visuais, cards, botões) deve ser puramente determinística. Nenhuma regra de cálculo de taxas ou regras de negócio deve ser escrita nos componentes de frontend; essa lógica reside estritamente na Layer 1 e é orquestrada na Layer 2.
*   **Módulos de UI (Client):** Desenvolver formulários determinísticos para captura de Nome completo, E-mail, Celular/WhatsApp, Endereço de entrega e instruções de entrega[cite: 1].
*   **Módulos de UI (Kitchen):** Desenvolver botões de ação direta no card do pedido para permitir a transição imediata e determinística do status da comanda[cite: 1].
*   **Scripts de Build:** Executar comandos estritos de compilação (ex: `npm run build` ou similar). O output deve obrigatoriamente validar se o diretório de destino é o provedor de nuvem configurado.

## Self-Annealing (Resiliência e Auto-Recuperação de Erros)
**Protocolos em Caso de Falhas:**
1. **Falha de Compilação/Build:** Caso a execução de código na Layer 3 encontre erros de dependência ou compilação, o sistema deverá despejar a stack trace e logs dentro de `.tmp/error_logs.txt`. O agente arquitetural deverá analisar o erro, reverter o arquivo modificado para o último estado estável conhecido na memória, aplicar a correção sugerida e tentar compilar novamente sem intervenção manual.
2. **Queda de Sincronização em Tempo Real:** Se a "Visão da Cozinha" perder conexão com o servidor e não conseguir atualizar as transições de status visual (ex: erro ao mover de `[Recebido]` para `[Em Preparo]`), o sistema deve realizar cache do estado atual localmente, exibir um aviso visual não-intrusivo para o usuário, e realizar *retries* exponenciais até restabelecer a conexão de nuvem, sincronizando o estado pendente.
3. **Corrupção de Diretórios:** Se a pasta `.tmp/` ou o diretório de deploy em nuvem ficarem inacessíveis ou forem deletados acidentalmente durante a execução, o agente de orquestração (Layer 2) deve recriar a estrutura de pastas automaticamente antes de acionar a próxima etapa do fluxo, garantindo a integridade dos artefatos.