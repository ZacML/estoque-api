Você é um Engenheiro de Software Sênior especializado em desenvolvimento Mobile (React Native / Flutter). Sua expertise abrange UX/UI para aplicações operacionais, consumo de APIs REST, WebSockets/SSE em tempo real e sincronização de dados entre Web e Mobile.

Sua tarefa é desenvolver o APLICATIVO MOBILE OPERACIONAL do sistema Golinho — Módulo Coletor & Doca Mobile.

O objetivo principal deste app é permitir que o operador no galpão selecione o produto na lista, faça a conferência/validação da Nota Fiscal, libere a doca e cadastre/enderece o palete selecionando manualmente a sua posição no mapa (rua, prateleira e nível).

1. REGRA ABSOLUTA DE PADRÃO VISUAL E RESTRIÇÃO DE ESCOPO
Seguir o Design System do Front-End Golinho: O aplicativo mobile DEVE seguir rigorosamente os padrões de UI/UX, cores, temas (Slate Dark #0F172A, Royal Blue #2563EB, cores semânticas verde/amarelo/vermelho), tipografia em unidades relativas (rem), badges compactas, fontes monospace para SKUs/EANs e ausência de ornamentos decorativos desnecessários já definidos na aplicação Web.

NÃO CRIE MAIS DO QUE FOI PEDIDO: Não adicione dashboards extras, relatórios, telas de login complexas, cadastro de usuários, perfil, notificações genéricas, histórico de movimentações ou qualquer funcionalidade que não esteja explicitamente descrita neste prompt. Foque única e exclusivamente no fluxo operacional solicitado.

2. INTEGRALIDADE EM TEMPO REAL (WEB <-> BACKEND <-> MOBILE)
O aplicativo Mobile e a aplicação Web devem estar sincronizados em tempo real.

Ação em Tempo Real: Sempre que um operador realizar uma ação no aplicativo (ex: selecionar e validar um palete/produto, escolher uma posição ou finalizar a conferência de uma NF-e), o mapa do galpão e os indicadores no painel Web devem atualizar imediatamente (mudando a cor da rua, atualizando a porcentagem de ocupação e atualizando o status da doca).

Consumo de Backend Existente: O Backend já está desenvolvido. O app deverá apenas integrar com as rotas/endpoints REST existentes e escutar/emitir os eventos via WebSockets (Socket.io / Native WebSockets) ou Server-Sent Events (SSE).

3. MÓDULOS E FUNCIONALIDADES DO APLICATIVO MOBILE
O app deve ser enxuto, focado em alta velocidade de operação por toque/clique e navegação com o mínimo de passos.

3.1. Tela Inicial — Seleção de Doca e Carga
Listagem de Docas Ativas (ex: Doca 01 - Aguardando Conferência, Doca 02 - Livre).

Seleção por clique da Nota Fiscal (NF-e) vinculada à doca.

Indicador de progresso da conferência física da carga.

3.2. Módulo de Conferência & Validação de NF-e
Seleção de Produtos: O operador visualiza a lista de itens da NF-e e clica diretamente no produto/item desejado.

Validação Quantitativa Manual: O operador insere/confirma a quantidade recebida.

Tratamento de Divergências: Identificação visual imediata se houver divergência entre a quantidade da NF e a inserida (sobra ou falta).

Validação Final da NF-e: Botão "Validar & Finalizar Conferência".

Efeito no Backend/Web: Dispara a chamada de rota/evento para finalizar a NF e LIBERA A DOCA (mudando o status da doca na Web para "Disponível/Livre").

3.3. Módulo de Endereçamento de Palete (Putaway Manual)
Após selecionar o produto/palete, o aplicativo deve guiar o endereçamento visual:

Seleção do Produto/Palete: Clique no produto ou palete gerado na lista.

Seleção Manual da Posição de Destino: O operador escolhe na interface o local físico de destino através de seletores ou lista visual de endereços disponíveis (Exemplo: Selecionar Rua 03 -> Prateleira B -> Nível 2).

Confirmação de Guardado: Ao clicar em "Confirmar Endereçamento":

O palete/produto é vinculado à posição exata via API REST.

IMPACTO NO MAPA WEB: O evento WebSocket atualiza o Mapeamento do Galpão (Tela 2 da Web) e a taxa de ocupação da rua em tempo real (ex: Rua 03 passa de 78% para 82% de ocupação).

4. CONTRATO DE COMUNICAÇÃO E INTEGRAÇÃO (BACKEND EXISTENTE)
Estruture a camada de serviços (services/api.js ou equivalente) para consumir e tratar os dados do backend já existente:

Endpoints API REST a Consumir:

GET /api/docas — Listar status das docas

POST /api/nfe/{id}/conferir-item — Enviar item e quantidade confirmada manualmente

POST /api/nfe/{id}/validar-liberar-doca — Finalizar NF e liberar doca

POST /api/paletes/enderecar — Vincular palete à posição selecionada (ruaId, prateleira, nivel)

Eventos WebSocket a Emitir e Escutar:

Emissor (App) -> pallet:stored { palletId, sku, ruaId, newStreetOccupancy }

Receptor (Web UI) -> street:occupancy_updated -> Atualiza a rua no mapa Web instantaneamente.

Emissor (App) -> dock:released { dockId, nfeNumber }

Receptor (Web UI) -> dock:status_changed -> Libera a doca na Web.

5. REGRAS DE UX/UI OPERACIONAL (MOBILE)
Design Operacional: Botões grandes, áreas de toque generosas para uso rápido com uma mão, alto contraste, sem gradientes ou glassmorphism, totalmente fiel à estética enxuta do sistema Golinho Web.

Confirmações Claras: Modais simples ou feedbacks visuais (badges/toast) confirmando que o palete foi endereçado ou a doca foi liberada.

6. ENTREGÁVEIS ESPERADOS
Estrutura do App Mobile: Código e componentes React Native / Expo estritamente para as telas solicitadas (Seleção de Doca, Conferência Manual de NF por clique e Seleção Manual de Posição de Palete).

Camada de Integração: Funções de chamada de API (fetch/axios) e gerenciamento de Socket.io conectados com as rotas do backend existente.

Proceda apresentando a estrutura do app mobile focando na simplicidade de uso por cliques e na fidelidade visual ao Golinho!    