Você é um desenvolvedor Front-End Sênior, especialista em aplicações corporativas, sistemas WMS/ERP, UX/UI operacional, responsividade, acessibilidade e arquitetura de aplicações web.

Sua tarefa é desenvolver o FRONT-END do sistema Golinho — Sistema de Gestão de Estoque, seguindo EXATAMENTE as telas, informações, hierarquia visual e funcionalidades apresentadas no documento de referência fornecido.

IMPORTANTE:
O PDF é a FONTE DE VERDADE do projeto.

seguir as ideias do back end

não alterar nada além do back, só junte o back com o front


NÃO invente funcionalidades.

NÃO crie telas que não estejam apresentadas.

NÃO adicione dashboards, filtros, gráficos, menus, botões, campos, modais ou configurações que não estejam representados ou sejam estritamente necessários para implementar o que já existe.

NÃO altere a finalidade das telas.

NÃO transforme o projeto em um ERP genérico.

NÃO tente "melhorar" o escopo adicionando recursos.

Evite gastar código, componentes ou dependências sem necessidade.

O objetivo é criar uma implementação profissional, enxuta, responsiva e fiel ao projeto apresentado.

==================================================

OBJETIVO DO SISTEMA
==================================================

O Golinho é um sistema operacional de gestão de estoque e armazenagem.

O sistema possui os seguintes módulos/telas:

Dashboard

Estoque Geral / consulta de posição

Mapa do Galpão

Ocupação Física

Produtos

Entradas NF-e

A navegação deve ser feita por uma SIDEBAR lateral fixa no desktop, conforme apresentado no PDF.

Os módulos devem estar disponíveis com acesso direto pela navegação.

==================================================
2. DESIGN SYSTEM
Siga rigorosamente a identidade visual apresentada no PDF.

Cor estrutural principal:

Slate Dark: #0F172A

Cor primária de destaque:

Royal Blue: #2563EB

Cores semânticas:

Verde: sucesso / disponível / conforme

Amarelo: atenção / ocupação elevada / estoque baixo

Vermelho: crítico / ruptura / divergência

As cores devem ser utilizadas de forma funcional, e não decorativa.

A interface deve possuir:

Alto contraste

Boa legibilidade

Hierarquia visual clara

Densidade de informação adequada para ambiente operacional

Tabelas compactas

Badges de status

Código de barras/SKU com fonte monospace quando apropriado

Bordas discretas

Cards objetivos

Pouco espaço desperdiçado

Pouca ornamentação

Foco em produtividade

Não utilizar gradientes desnecessários.
Não utilizar glassmorphism.
Não utilizar sombras exageradas.
Não utilizar animações chamativas.
Não utilizar elementos puramente decorativos que não existam no PDF.

==================================================
3. TEMA CLARO E ESCURO
O sistema deve possuir suporte completo aos modos:

Light Mode

Dark Mode

Criar um Theme System utilizando variáveis CSS.

Não basta inverter as cores.

Todos os componentes precisam possuir estados adequados para os dois temas:

Background

Sidebar

Cards

Tabelas

Inputs

Selects

Textos

Bordas

Badges

Gráficos

Barras de progresso

Estados de hover

Estados de foco

Estados disabled

No Dark Mode, manter o Slate Dark como referência estrutural e preservar o contraste.

O Royal Blue #2563EB deve continuar sendo utilizado como cor de ação/destaque.

Verde, amarelo e vermelho continuam representando os estados semânticos.

==================================================
4. TIPOGRAFIA (REMETIDA A REM / UNIDADES RELATIVAS)
Utilizar uma fonte sans-serif moderna e legível.

Priorizar:

Inter
ou

equivalente system-ui caso não seja necessário adicionar dependência.

Hierarquia em unidades relativas (base 1rem = 16px):

Títulos:

1.5rem a 2rem (24px–32px)

font-weight 600/700

Subtítulos:

1rem a 1.25rem (16px–20px)

font-weight 600

Texto:

0.875rem a 1rem (14px–16px)

Informações secundárias:

0.75rem a 0.875rem (12px–14px)

Tabelas:

0.75rem a 0.875rem (12px–14px)

KPIs:

1.75rem a 2.25rem (28px–36px)

font-weight 700

SKUs, EANs e códigos:

font-family monospace

Não utilizar tipografia exageradamente grande.

==================================================
5. LAYOUT DESKTOP (% E UNIDADES RELATIVAS)
A aplicação deve ser pensada primeiro para desktop operacional.

Medidas relativas e fluidas baseadas na Viewport/Porcentagem:

Sidebar:

Largura aproximada: 15% a 18% do layout (ou fixado em 15rem no desktop, transicionando para 100% no mobile)

Altura: 100vh

Posição fixa/sticky

Background: #0F172A

Conteúdo:

Ocupar o restante da largura disponível (flex: 1 ou width: calc(100% - largura_sidebar))

Padding aproximado de 1.5% a 2% da tela (ou 1.5rem–2rem)

Largura máxima relativa (ex: max-width: 95% ou 100% para preenchimento operacional)

Evitar excesso de espaço vazio

Header:

Altura aproximada de 4rem–4.5rem (~64px–72px)

Cards:

border-radius moderado: 0.5rem–0.75rem

borda discreta

sombra extremamente sutil ou inexistente

Utilizar CSS Grid/Flexbox com larguras baseadas em % para os elementos internos.

==================================================
6. SIDEBAR
Criar sidebar fixa contendo o nome Golinho.

Itens:

Dashboard

Estoque

Mapa Galpão

Ocupação

Entradas NF-e

Também deve existir o acesso ao módulo de Produtos conforme apresentado no documento.

Cada item deve possuir:

Ícone

Texto

Estado normal

Estado hover

Estado ativo

Item ativo:

Royal Blue #2563EB

texto branco

contraste evidente

Não criar novos itens no menu.

No mobile:

sidebar deve transformar-se em navegação compacta/drawer (width: 100% quando aberta)

não ocupar permanentemente toda a tela

conteúdo deve permanecer utilizável

==================================================
7. TELA 1 — DASHBOARD GENERAL & OPERACIONAL
Criar exatamente o Dashboard apresentado.

Estrutura:

HEADER:

Logo/Golinho

Campo de pesquisa global (width: 100% no container)

Identificação do galpão operacional

Perfil/operador

A pesquisa deve permitir consulta por:

SKU

Endereço

NF-e

Indicadores principais (Grid responsivo com width: 100% total):

CARD 1:
TOTAL SKUs CADASTRADOS
4.820
+12 novos esta semana

CARD 2:
TOTAL ITENS ESTOCADOS
142.950
Unidades físicas

CARD 3:
ESTOQUE BAIXO (ALERTA)
28 SKUs
Abaixo do limite mínimo

CARD 4:
SEM ESTOQUE (RUPTURA)
5 SKUs
Ação de compra urgente

Os quatro cards devem formar um grid responsivo adaptável em porcentagem (repeat(auto-fit, minmax(220px, 1fr))).

Abaixo:

GRÁFICO:
"Entradas x Saídas de Mercadorias (Últimos 7 dias)" (Ocupando 100% do container)

Mostrar os dias:

Seg

Ter

Qua

Qui

Sex

Sáb

Utilizar gráfico simples e objetivo.

Não adicionar outros indicadores.

Ao lado ou abaixo, conforme largura:

TABELA:
"Notas Fiscais Pendentes de Conferência" (Largura 100%)

Colunas:

NF-e

Fornecedor

Itens

Status

Dados apresentados:
NF-88219 | TechParts Brasil | 450 un | Aguardando
NF-88210 | LogiPack Embalagens | 1.200 un | Em Conferência

Status devem utilizar badges.

==================================================
8. DASHBOARD — RELATÓRIOS & CONSULTA DE POSIÇÃO
Criar a seção/tela apresentada no PDF.

Título:
Dashboard: Relatórios & Consulta de Posição

Bloco 1:
"Evolução de Movimentação do Estoque"

Gráfico:
"Tendência de Volume Armazenado"

Visão trimestral.

Dados:
Mês 1: 112k unidades
Mês 2: 128k unidades
Mês 3: 142k unidades (+11%)

Utilizar gráfico de linha/área conforme referência visual.

Bloco 2:
"Widget de Consulta Posição do Produto"

Campo:
"Pesquisar Código SKU / Nome"

Mostrar:
Qtd. Disponível: 1.450 un
Qtd. Reservada: 120 un

Depois:

"Localização Física Exata"

Exemplo:
GALPÃO A → RUA 03 → PRATELEIRA B → NÍVEL 2

A consulta deve ser visualmente destacada.

==================================================
9. TELA 2 — MAPA DE LOCALIZAÇÃO DO GALPÃO
Título:
Tela 2: Mapeamento de Localização do Galpão

Layout desktop (Dividido em porcentagens):

ESQUERDA (width: 60% a 65% no desktop):
Mapa Visual do Galpão — Setor A
Corredores 01 a 06

DIREITA (width: 35% a 40% no desktop):
Detalhes da Posição Selecionada

Mapa deve conter:

RUA 01 | 12 | 45% ocupação
RUA 02 | 30 | 98% ocupação
RUA 03 | 25 | 78% ocupação
RUA 04 | 8  | 20% ocupação
RUA 05 | 28 | 95% ocupação
RUA 06 | 25 | 82% ocupação

Estados:

Livre: verde

Ocupado: amarelo

Crítico: vermelho

Cada posição deve ser visualmente clicável.

Ao selecionar:

Detalhes da Posição Selecionada

Endereço: RUA-01-A-02-N3
Produto: Motor Elétrico X200
SKU: SKU-7721
Lote: L-2026-08
Qtd Armazenada: 80 Caixa(s)
Validade Lote: 12/2028
Acessibilidade: Empilhadeira Nível 3

Não criar funcionalidades 3D complexas. O PDF apresenta um grid/mapa visual simples.

==================================================
10. TELA 3 — INDICADOR DE OCUPAÇÃO FÍSICA
Título:
Tela 3: Indicador de Ocupação Física

Subtítulo:
Percentual de Ocupação Detalhado por Rua / Corredor

Cards superiores:

CAPACIDADE TOTAL GALPÃO
12.000 m³
4.500 posições pallet

ESPAÇO OCUPADO ATUAL
10.104 m³
84.2% da capacidade

ESPAÇO DISPONÍVEL
1.896 m³
702 posições livres

Abaixo:

BARRAS DE OCUPAÇÃO (Preenchimento dinâmico em %):

Corredor / Rua 01 | Insumos Pesados | 96% | Crítico — Próximo da Capacidade Máxima
Corredor / Rua 02 | Eletrônicos & Peças | 82% | Ocupação Elevada
Corredor / Rua 03 | Embalagens & Matéria Prima | 54% | Excelente Disponibilidade

As barras devem possuir preenchimento proporcional ao percentual (width: 96%, width: 82%, etc).

Cores:

crítico → vermelho

elevado → amarelo

disponibilidade → verde

==================================================
11. TELA 4 — CADASTRO E GERENCIAMENTO DE PRODUTOS
Título:
Tela 4: Cadastro e Gerenciamento de Produtos

Criar tabela compacta com largura 100%.

Topo:

filtro/categoria

botão "+ Novo Produto"

Tabela:

Colunas:
Código / EAN | Nome do Produto | Categoria | Estoque Atual | Mín / Máx | Localização Base | Status | Ações

Dados:
789100021 | Caixa Organizadora Industrial 50L | Plásticos | 450 un | 100 / 1000 | RUA-01-A-01 | Ativo
789100088 | Placa Controladora CNC V2 | Eletrônicos | 15 un | 20 / 200 | RUA-02-B-04 | Estoque Baixo
789100099 | Cabo Cobre Flexível 10mm 100m | Elétrica | 0 un | 10 / 100 | RUA-03-C-01 | Sem Estoque

Status:

Ativo → verde

Estoque Baixo → amarelo

Sem Estoque → vermelho

Ações devem seguir o PDF:

editar

visualizar

Não criar outras ações sem necessidade.

A tabela deve funcionar corretamente em telas pequenas através de:

scroll horizontal controlado (overflow-x: auto) OU

transformação responsiva adequada.

==================================================
12. TELA 5 — LANÇAMENTO & CONFERÊNCIA DE NF-e
Título:
Tela 5: Lançamento & Conferência de NF-e

Header da NF-e:
Nº Nota Fiscal: 104.982
Série: 001
Fornecedor: TechComponentes S.A.
Chave NF-e: 3526 0812 3456...

Depois:

"Conferência Física vs Nota Fiscal"

Tabela (width: 100%):
Item / Produto | Qtd Nota Fiscal | Qtd Recebida (Bipada) | Divergência | Status Conferência

Produto 1:
Sensor Indutivo M12 | 100 un | 100 un | 0 un | OK Conforme

Produto 2:
Fonte Chaveada 24V 10A | 50 un | 48 un | -2 un (Falta) | Divergência

Divergências devem possuir destaque visual vermelho.

Ao final:

Mensagem informativa:
"Ao confirmar o lançamento, o estoque das mercadorias validadas será incrementado automaticamente nas localizações indicadas."

Botão principal (width: 100% ou auto no desktop):
"Confirmar & Dar Entrada no Estoque" (Botão em verde).

==================================================
13. RESPONSIVIDADE E ADAPTAÇÃO DE BREAKPOINTS (%)
O sistema precisa ser totalmente fluido e responsivo.

Breakpoints de referência:

Mobile: < 48rem (< 768px) -> Containers em 100%, layout de 1 coluna.

Tablet: 48rem a 64rem (768px–1024px) -> Grids em 2 colunas (50% / 50%).

Desktop: > 64rem (> 1024px) -> Layout completo, Sidebar em largura relativa/fixa enxuta, conteúdo em 100% do espaço restante.

No mobile:

Sidebar vira drawer/menu compacto (100% de largura quando aberta)

Cards passam para 1 coluna (width: 100%)

Gráficos ocupam 100% do container

Tabelas possuem scroll horizontal suave

Formulários em 1 coluna

Mapa do galpão empilha os blocos verticalmente (width: 100%)

Botões possuem área de toque adequada (mínimo 2.75rem / 44px de altura)

==================================================
14. ACESSIBILIDADE
Seguir boas práticas WCAG AA.

Garantir:

contraste adequado

foco visível

navegação por teclado

labels nos inputs

aria-label quando necessário

botões semanticamente corretos

estados não dependentes somente de cor

Status não devem depender apenas da cor. Exemplo: "96% — Crítico".

==================================================
15. UX OPERACIONAL
O sistema será utilizado em ambiente de galpão.

Priorizar velocidade e quantidade mínima de cliques.

Implementar suporte conceitual para leitor de código de barras:
O sistema deve aceitar entrada do leitor sem exigir que o operador clique manualmente no campo de busca.

Atalhos:

F2 → Nova Entrada

F4 → Consultar Endereço

Esc → Fechar Modais

Divergências da conferência devem possuir alerta visual claro.

==================================================
16. ARQUITETURA FRONT-END
Utilize uma arquitetura limpa e organizada.

Separar:

pages

components

layouts

services

models/interfaces

shared

styles

assets

Criar componentes reutilizáveis somente quando realmente houver repetição (Sidebar, Header, Card KPI, Status Badge, Table, Search Input, Progress Bar, Modal, Theme Toggle).

==================================================
17. DADOS E INTEGRALIDADE
Utilizar dados mockados organizados em services e models separados, prontos para integração com API REST.

==================================================
18. PERFORMANCE
Priorizar performance. Não adicionar bibliotecas pesadas sem necessidade. Resolver layouts com HTML5 e CSS flex/grid funcional.

==================================================
19. REGRAS VISUAIS IMPORTANTES
O resultado deve parecer um sistema WMS profissional (Golinho), não um site institucional.

Priorizar:

Informação, produtividade, tabelas, indicadores, localização, status e operações rápidas.

Evitar:

Hero sections, banners, ilustrações decorativas, carrosséis, excesso de ícones, gradientes ou efeitos 3D.

==================================================
20. REGRA ABSOLUTA DE FIDELIDADE
Antes de criar qualquer componente, compare com o PDF.

Pergunte: "Isso aparece no PDF ou é indispensável para implementar algo que aparece no PDF?"
Se a resposta for NÃO: NÃO IMPLEMENTAR.

==================================================
21. RESULTADO ESPERADO
Entregar um front-end:

profissional, sênior, limpo, responsivo (base em % e rem), acessível, rápido, com Light/Dark Mode, visualmente fiel ao PDF e preparado para o sistema Golinho.