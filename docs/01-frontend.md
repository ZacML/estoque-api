# Front-End — Painel Web WMS Golinho

Painel de retaguarda em Angular 21. É onde o gestor cadastra produtos, registra a
chegada de caminhões, acompanha o mapa do galpão e libera as saídas.

---

## 1. Stack

| Item | Escolha |
|---|---|
| Framework | Angular 21 — componentes **standalone**, sem NgModules |
| Change detection | **Zoneless** (não há `zone.js` nos polyfills) |
| Estado | **Signals** (`signal`, `computed`, `effect`) — sem NgRx |
| HTTP | `HttpClient` + `provideHttpClient()` |
| Estilos | SCSS com **CSS custom properties** (design tokens) |
| Tempo real | `EventSource` (SSE) |
| Build | `@angular/build:application` |

```bash
npm install
npm start            # http://localhost:4200
npm run build
```

---

## 2. Estrutura

```
src/
├── styles.scss                      design tokens + utilitários globais
├── main.ts                          bootstrapApplication(App, appConfig)
└── app/
    ├── app.ts / app.html / app.scss  shell: sidebar, navegação, botão de tema
    ├── app.routes.ts                 rotas com lazy loading
    ├── app.config.ts                 providers (router, httpClient)
    ├── core/
    │   ├── models.ts                 interfaces espelhando os DTOs da API
    │   ├── api.service.ts            todas as chamadas REST + BASE_URL
    │   ├── realtime.service.ts       conexão SSE única com reconexão
    │   ├── notificacoes.service.ts   central de notificações
    │   ├── theme.service.ts          modo claro/escuro persistido
    │   └── occupancy.ts              faixas de ocupação (verde/âmbar/vermelho)
    ├── shared/
    │   ├── icon.component.ts         ícones SVG inline (sem biblioteca externa)
    │   ├── modal.component.ts        modal genérico com ng-content
    │   ├── movimentacao-form.component.ts  formulário de entrada/saída
    │   └── notificacoes.component.ts       sino + painel de notificações
    └── pages/
        ├── dashboard/    indicadores, ocupação por rua, saídas pendentes
        ├── ruas/         mapa do galpão (grade de posições)
        ├── docas/        cartões de doca e autorização de saída
        ├── produtos/     CRUD de produtos
        └── movimentacoes/ lista + criar/editar/excluir
```

### Rotas

| Caminho | Componente | Conteúdo |
|---|---|---|
| `/dashboard` | `DashboardComponent` | KPIs, gráfico de ocupação, movimentações do dia, saídas pendentes |
| `/ruas` | `RuasComponent` | Mapa do galpão, grade de posições, detalhe do que está guardado |
| `/docas` | `DocasComponent` | Uma carta por doca, dados do caminhão, autorização de saída |
| `/produtos` | `ProdutosComponent` | Tabela + modal de criar/editar |
| `/movimentacoes` | `MovimentacoesComponent` | Tabela + criar, **editar** e **excluir** |

Todas usam `loadComponent` (lazy). `''` redireciona para `/dashboard`, e `**`
também — nunca cai em tela branca.

---

## 3. Design system

Os tokens vivem em `:root` no `styles.scss` e **nenhum componente usa cor
literal** — é o que faz o modo escuro funcionar sem tocar em componente algum.

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--bg` | `#f3f4f6` | `#0f172a` | Fundo da página |
| `--surface` | `#ffffff` | `#1e293b` | Cartões, sidebar, modais |
| `--border` | `#e5e7eb` | `#334155` | Divisórias |
| `--text` | `#111827` | `#f1f5f9` | Texto principal |
| `--text-muted` | `#6b7280` | `#94a3b8` | Texto secundário |
| `--primary` | `#16a34a` | `#16a34a` | Ação primária |
| `--primary-dark` | `#15803d` | `#4ade80` | Texto sobre fundo verde suave |
| `--primary-hover` | `#15803d` | `#15803d` | Hover do botão primário |
| `--primary-light` | `#dcfce7` | `rgba(34,197,94,.18)` | Fundo de pill verde |
| `--blue` / `--blue-light` | `#2563eb` / `#dbeafe` | `#60a5fa` / translúcido | Informação |
| `--amber` / `--amber-light` | `#d97706` / `#fef3c7` | `#fbbf24` / translúcido | Atenção |
| `--red` / `--red-light` | `#dc2626` / `#fee2e2` | `#f87171` / translúcido | Crítico |
| `--dark` | `#111827` | `#334155` | Fundo das badges monoespaçadas |
| `--overlay` | `rgba(17,24,39,.45)` | `rgba(2,6,23,.72)` | Véu dos modais |
| `--radius` | `0.75rem` | — | Raio padrão |

**Classes utilitárias:** `.card`, `.grid-auto`, `.grid-2`, `.page-header`,
`.page-body`, `.page-title`, `.search-input`, `.btn`, `.btn-primary`,
`.btn-danger`, `.btn-icon`, `.pill` (+ `-green/-amber/-red/-blue/-gray`),
`.badge` (monoespaçada, para placa e nota), `.table`.

**Princípios visuais:** tipografia em `rem`, alvos de toque com no mínimo
`2.75rem`, badges compactas, monoespaçada para código (placa, NF, endereço),
sem gradiente e sem glassmorphism.

---

## 4. Modo escuro

`ThemeService` (`core/theme.service.ts`):

1. Lê a preferência salva em `localStorage['estoque.tema']`; se não houver, cai
   no `prefers-color-scheme` do sistema.
2. Um `effect()` escreve `data-theme="light|dark"` no `<html>`, ajusta
   `style.colorScheme` (para os controles nativos do navegador acompanharem) e
   persiste a escolha.
3. `alternar()` inverte o valor.

O CSS tem um único bloco `:root[data-theme='dark']` redefinindo os tokens. Como
tudo consome variável, **um bloco de ~20 linhas escurece o sistema inteiro**,
inclusive páginas que ninguém tocou.

O botão fica no rodapé da sidebar (`app.html`), mostra ☀️ no escuro e 🌙 no
claro, e expõe `aria-pressed` + `aria-label` descritivo.

---

## 5. Tempo real

`RealtimeService` (`core/realtime.service.ts`) mantém **uma** conexão
`EventSource` com `GET /eventos/stream`, assina os eventos por nome e republica
tudo num `Subject<EventoRecebido>`. Em caso de erro fecha e reconecta em 5s; o
sinal `conectado` alimenta o indicador "ao vivo / offline".

Cada página consome assim:

```ts
constructor() {
  this.refresh();
  this.realtime.eventos$.pipe(takeUntilDestroyed()).subscribe(({ nome }) => {
    if (nome !== 'conectado') this.refresh();
  });
}
```

`takeUntilDestroyed()` cancela a inscrição junto com o componente — sem
vazamento ao navegar entre rotas.

**Efeito prático:** o operador finaliza a conferência no coletor e, sem ninguém
apertar F5, a doca vira "Livre" em `/docas`, a rua muda de cor em `/ruas` e o
percentual de ocupação sobe no `/dashboard`.

Como o serviço é `providedIn: 'root'`, as quatro páginas compartilham a mesma
conexão.

---

## 6. Notificações

`NotificacoesService` (`core/notificacoes.service.ts`) escuta o canal SSE e
transforma evento técnico em aviso legível:

| Evento recebido | Notificação |
|---|---|
| `movimentacao:autorizada` (entrada) | **Entrada aprovada para o estoque** |
| `movimentacao:autorizada` (saída) | **Saída autorizada** |
| `pallet:stored` | **Palete guardado no estoque** — com rua e posição |
| `dock:released` | **Doca liberada** |
| `movimentacao:created` | **Chegada registrada** / **Saída aguardando liberação** |

Ao iniciar, o serviço também carrega as saídas já pendentes (`GET
/movimentacoes/pendentes`) para o sino não abrir vazio, e mantém em memória os
catálogos de produtos, ruas, posições e docas para traduzir id em nome — o
payload do evento traz só ids.

`NotificacoesComponent` (`shared/notificacoes.component.ts`) é o sino no
cabeçalho do dashboard: contador vermelho de não lidas, painel com as 30 últimas,
marcador colorido por tipo e badge "ao vivo/offline". As notificações só são
marcadas como lidas **ao fechar** o painel, para o operador conseguir ler o que
chegou.

---

## 7. Movimentações — criar, editar e excluir

`MovimentacoesComponent` usa um único sinal de estado para o modal:

```ts
editando = signal<Movimentacao | null | undefined>(undefined);
// undefined = fechado · null = nova · Movimentacao = edição
```

- **Criar** → `POST /movimentacoes`
- **Editar** → `PUT /movimentacoes/{id}` com o formulário pré-preenchido
- **Excluir** → modal de confirmação nomeando produto, quantidade e data →
  `DELETE /movimentacoes/{id}`

Erros da API aparecem na tela lendo `error.mensagem` (o formato padronizado do
`RestExceptionHandler`), não como alerta genérico.

A tabela também mostra o **endereço** (`R01 · 5`) e a **divergência de
conferência** como pill âmbar (sobra) ou vermelha (falta), comparando
`quantidadeConferida` com `quantidade`.

### `MovimentacaoFormComponent`

Formulário compartilhado por dashboard, docas e movimentações. Entradas:

| Input | Uso |
|---|---|
| `produtos`, `posicoes`, `docas`, `ruas` | opções dos selects |
| `fixedDocaId` | trava a doca (usado em "Registrar chegada" na página de docas) |
| `fixedSaida` | trava o tipo entrada/saída |
| `inicial` | movimentação a editar — semeia todos os campos |

Detalhe de implementação: os inputs de um componente Angular só chegam **depois**
do construtor. A semente de `fixedSaida` e de `inicial` roda dentro de um
`effect()`, não no construtor — antes disso o `fixedSaida` era lido como valor
padrão e a trava não pegava.

Validações do formulário: produto e quantidade obrigatórios, quantidade `> 0`,
placa em maiúscula com `maxlength=10`, nota `maxlength=20`, motorista e
transportadora `maxlength=80` (os mesmos limites das colunas do banco), e campos
vazios enviados como `null` em vez de string vazia. Em edição, `conferida`,
`quantidadeConferida`, `autorizada`, `liberada` e `dataHora` originais são
preservados — editar a placa não desfaz a conferência.

O campo "Posição" só aparece quando há posições carregadas: em "Registrar
chegada" o endereçamento é feito no coletor, então o select ficaria vazio.

---

## 8. Padrões usados nas páginas

**Estado com signals + `computed` para tudo que é derivado.** Nada de recalcular
no template:

```ts
posicoesOcupadas = computed(() => this.posicoes().filter((p) => p.ocupada).length);
ocupacaoPct = computed(() =>
  this.totalPosicoes() === 0 ? 0
    : Math.round((this.posicoesOcupadas() / this.totalPosicoes()) * 100));
```

**Carga paralela com `forkJoin`** — uma chamada só para todas as listas que a
página precisa, evitando cascata de requisições.

**Mapas de lookup memoizados** (`produtoMap`, `ruaMap`, `posicaoMap`) para não
fazer `.find()` dentro de laço de template.

**Busca por sinal** (`searchTerm`) filtrando dentro do `computed`, sem
`debounce` — as listas são pequenas.

**Faixas de ocupação** centralizadas em `core/occupancy.ts`: `< 80%` verde,
`80–94%` âmbar, `>= 95%` vermelho. Dashboard e ruas usam a mesma função.

---

## 9. Acessibilidade

- Todo botão só com ícone tem `aria-label` (sino, tema, editar, excluir, fechar).
- Alvos de toque com no mínimo `2.75rem` de altura.
- As posições no mapa expõem `aria-label` com número e estado
  ("Posição 5, ocupada") — a cor não é a única portadora da informação.
- O painel de notificações tem `role="dialog"` e o sino, `aria-expanded`.
- `color-scheme` declarado nos dois temas, para os controles nativos do
  navegador acompanharem.

---

## 10. Pontos em aberto

- `BASE_URL` está fixo em `http://localhost:8080` (`core/api.service.ts`). Para
  publicar, mover para `environments/`.
- Não há autenticação: a sidebar mostra "Operador" fixo.
- Não há testes de componente além do `app.spec.ts` do scaffold.
- A reconexão do SSE é de intervalo fixo (5s), sem backoff exponencial.
