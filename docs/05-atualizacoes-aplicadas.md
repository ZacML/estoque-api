# Atualizações aplicadas

Rastreamento do que foi entregue a partir de
`estoque-front/Atualizações/Correções.md` e de
`estoque-front/info/promptAPP.md`.

---

## 1. Pasta `Atualizações`

### ✅ Notificações de quando for aprovado para ir ao estoque

O sino do dashboard era um botão sem função. Agora existe uma central de
notificações alimentada pelo canal de eventos do back-end.

- `estoque/.../Service/EventoService.java` — barramento SSE novo.
- `estoque/.../controller/EventoController.java` — `GET /eventos/stream`.
- `estoque-front/src/app/core/realtime.service.ts` — conexão SSE com reconexão.
- `estoque-front/src/app/core/notificacoes.service.ts` — traduz evento em aviso.
- `estoque-front/src/app/shared/notificacoes.component.ts` — sino, contador e painel.

Avisos gerados: **Entrada aprovada para o estoque**, **Saída autorizada**,
**Palete guardado no estoque** (com rua e posição), **Doca liberada**, **Chegada
registrada** e **Saída aguardando liberação**. As saídas já pendentes são
carregadas na abertura para o sino não começar vazio.

### ✅ Modo escuro com botão de lua e sol

- `estoque-front/src/app/core/theme.service.ts` — preferência persistida em
  `localStorage`, com fallback para o `prefers-color-scheme` do sistema.
- `estoque-front/src/styles.scss` — bloco `:root[data-theme='dark']` redefinindo
  os tokens, mais `color-scheme` nos dois temas.
- `estoque-front/src/app/app.html` / `app.scss` — botão no rodapé da sidebar,
  ☀️ no escuro e 🌙 no claro, com `aria-pressed`.
- `estoque-front/src/app/shared/icon.component.ts` — ícones `sun`, `moon`,
  `edit`, `trash`.

Como todas as páginas já usavam variáveis CSS, o tema escuro alcançou o sistema
inteiro sem alterar componente algum. Ajustes pontuais: `--primary-hover` foi
separado de `--primary-dark` (que no escuro precisa ser claro, por ser cor de
texto sobre fundo verde suave) e o véu do modal passou a usar `--overlay`.

### ✅ Verificação dos campos

Problemas encontrados e corrigidos:

| Problema | Correção |
|---|---|
| `fixedSaida` do formulário era lido no construtor, quando os inputs ainda não chegaram — a trava "Entrada" em "Registrar chegada" nunca pegava | Semente movida para dentro de um `effect()` |
| Campos sem limite de tamanho, aceitando mais do que a coluna do banco comporta | `maxlength` alinhado ao schema: placa 10, nota 20, motorista/transportadora 80, produto 80, unidade 10 |
| Placa aceita em minúscula | Normalizada para maiúscula na digitação |
| Quantidade aceitava zero e negativo | `min` no campo, validação no `canSubmit()` e aviso visível |
| Campos de texto vazios enviados como `""` | Enviados como `null` |
| Select "Posição" aparecia vazio em "Registrar chegada" | Campo escondido quando não há posições carregadas |
| Qualquer erro da API virava HTTP 500 genérico | `RestExceptionHandler` novo → 404 / 409 / 400 com `{ mensagem }` |
| Erros silenciosos em produtos e movimentações | Mensagem exibida na tela, lida de `error.mensagem` |
| Inputs sem `background`/`color` tokenizados | Corrigido — legíveis no modo escuro |

### ✅ Documento explicando todo o Front-End

[`docs/01-frontend.md`](01-frontend.md)

### ✅ Documento explicando todo o Back-End

[`docs/02-backend.md`](02-backend.md)

### ✅ Documento explicando o banco de dados

[`docs/03-banco-de-dados.md`](03-banco-de-dados.md)

### ✅ Movimentação: excluir e editar (banco, back-end e front-end)

**Banco** — `movimentacao` ganhou `quantidade_conferida numeric(10,2)` e
`conferida boolean not null default false`, criadas pelo `ddl-auto = update`.
Elas separam o que a nota declarou do que o operador contou, e é essa separação
que mantém a divergência auditável depois da conferência. O documento de banco
traz também os scripts de constraint que faltam para fechar as regras no nível do
banco.

**Back-end** — `PUT /movimentacoes/{id}` e `DELETE /movimentacoes/{id}` já
existiam mas ninguém usava. Foram revisados e passaram a publicar
`movimentacao:updated` e `movimentacao:removed`. `montar()` agora preserva os
campos de conferência.

**Front-end** — a tabela de movimentações ganhou botões de editar e excluir. A
edição reaproveita o `MovimentacaoFormComponent` com o novo input `inicial`,
preservando `conferida`, `quantidadeConferida`, `autorizada`, `liberada` e
`dataHora`. A exclusão passa por modal de confirmação nomeando produto,
quantidade e data. Colunas novas: endereço e divergência de conferência.

---

## 2. Prompt de criação do app (`promptAPP.md`)

### ✅ Padrão visual e restrição de escopo

Tokens copiados do `styles.scss` da Web para `constants/theme.ts`; kit
`golinho-ui.tsx` reproduz pill, badge monoespaçada, card e botão. Tipografia em
escala relativa, sem ornamento.

Escopo respeitado: **três telas**, sem dashboard, sem relatório, sem login, sem
cadastro de usuário, sem histórico. As telas de exemplo do template Expo
(`explore.tsx`, `app-tabs.tsx`, `app-tabs.web.tsx`) foram removidas.

### ✅ Integralidade em tempo real (Web ↔ Backend ↔ Mobile)

Canal SSE em `/eventos/stream`. Cada ação no coletor faz o painel Web mudar sem
recarregar: a doca vira "Livre", a rua muda de cor no mapa e o percentual de
ocupação sobe.

O prompt supunha WebSocket/Socket.io; foi usado SSE porque o fluxo é
unidirecional (servidor → clientes), as ações já vão por REST e o `SseEmitter` já
vem no `spring-boot-starter-webmvc` — sem dependência nova nos três projetos.

### ✅ Módulos e funcionalidades

| Item do prompt | Onde está |
|---|---|
| Listagem de docas ativas | `src/app/index.tsx` |
| Seleção da NF vinculada à doca | toque na carta da doca |
| Indicador de progresso da conferência | barra + `conferidos/total` |
| Seleção de produtos por clique | `src/app/doca/[id].tsx` |
| Validação quantitativa manual | folha inferior com teclado numérico |
| Tratamento de divergências | aviso ao digitar + pill de sobra/falta |
| Validação final da NF-e | "Validar & Finalizar Conferência" |
| Liberação da doca | `PUT /movimentacoes/{id}/validar-liberar-doca` |
| Seleção do palete | item conferido → "Endereçar palete" |
| Seleção manual da posição | `src/app/enderecar/[id].tsx` — rua → posição |
| Confirmação de guardado | `POST /movimentacoes/{id}/enderecar` |
| Impacto no mapa Web | `pallet:stored` + `street:occupancy_updated` |

### ⚠️ Contrato de comunicação — adaptado

As rotas listadas no prompt não existiam no back-end e o recurso `nfe` não faz
parte do modelo (a nota é representada por campos de `movimentacao`). Foram
criadas rotas equivalentes sobre o recurso existente:

| Previsto no prompt | Implementado |
|---|---|
| `GET /api/docas` | `GET /docas` |
| `POST /api/nfe/{id}/conferir-item` | `PUT /movimentacoes/{id}/conferir` |
| `POST /api/nfe/{id}/validar-liberar-doca` | `PUT /movimentacoes/{id}/validar-liberar-doca` |
| `POST /api/paletes/enderecar` | `POST /movimentacoes/{id}/enderecar` |
| `pallet:stored` (app → servidor) | publicado pelo servidor no SSE |
| `street:occupancy_updated` (servidor → Web) | igual |
| `dock:released` (app → servidor) | publicado pelo servidor no SSE |
| `dock:status_changed` (servidor → Web) | igual |

Os nomes dos eventos foram mantidos como no prompt.

### ✅ Entregáveis

Estrutura do app, camada de integração (`services/api.ts`) e cliente de eventos
(`services/realtime.ts`) — documentados em
[`docs/04-app-mobile.md`](04-app-mobile.md).

---

## 3. Não verificado nesta entrega

O back-end foi **compilado com sucesso** (`./mvnw -o compile`).

O painel Web e o app **não foram compilados nem executados**: não há Node.js
instalado nesta máquina, então `npm install`, `ng build` e `expo start` não
puderam rodar. Antes da demo, vale executar:

```bash
cd estoque-front && npm install && npm run build
cd estoque-app   && npm install && npx tsc --noEmit
```

E o roteiro de ponta a ponta: cadastrar produto na Web → registrar chegada numa
doca → conferir os itens no coletor → finalizar (doca fica Livre na Web) →
endereçar o palete → tentar endereçar em posição ocupada (deve bloquear) →
conferir o dashboard atualizando sozinho.
