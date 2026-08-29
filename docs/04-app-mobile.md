# App Mobile — Coletor & Doca (WMS Golinho)

App operacional de chão de fábrica. Faz **três coisas** e nada além disso:
escolher a doca, conferir a nota e endereçar o palete.

---

## 1. Stack

| Item | Escolha |
|---|---|
| Runtime | Expo 57 / React Native 0.86 / React 19 |
| Navegação | `expo-router` (Stack, rotas por arquivo) |
| Linguagem | TypeScript estrito |
| Tempo real | SSE — `EventSource` na Web, `XMLHttpRequest` incremental no nativo |
| Estilo | `StyleSheet` + tokens `Golinho` |

```bash
npm install
npx expo start          # Expo Go, emulador ou web
```

---

## 2. Estrutura

```
src/
├── app/                       rotas (expo-router)
│   ├── _layout.tsx            Stack + tema claro/escuro
│   ├── index.tsx              Tela 1 — seleção de doca e carga
│   ├── doca/[id].tsx          Tela 2 — conferência e validação da nota
│   └── enderecar/[id].tsx     Tela 3 — endereçamento manual do palete
├── components/
│   └── golinho-ui.tsx         Pill, CodeBadge, Card, Button, Progresso, Aviso, Linha
├── constants/theme.ts         paleta Golinho + escala Ui (raio, toque, fontes)
├── hooks/use-golinho.ts       paleta conforme o tema do aparelho
└── services/
    ├── api.ts                 cliente REST + modelos + descoberta do host
    └── realtime.ts            cliente SSE + hook useRealtime
```

As telas de exemplo do template Expo (`explore.tsx`, `app-tabs.tsx`) foram
removidas: o app é um **Stack de três telas**, sem barra de abas, sem login, sem
dashboard, sem histórico — exatamente o escopo pedido.

---

## 3. Fidelidade visual ao Golinho Web

`constants/theme.ts` exporta `Golinho.light` e `Golinho.dark` com **os mesmos
valores hexadecimais** de `estoque-front/src/styles.scss`: Slate `#0f172a` /
`#1e293b` no escuro, verde `#16a34a` como ação primária, Royal Blue `#2563eb`
como informação, âmbar e vermelho como semânticas.

`Ui` define as constantes operacionais: `radius: 12`, `touch: 56` (altura mínima
de qualquer alvo de toque, para uso com uma mão e luva) e a escala de fonte.

`golinho-ui.tsx` reproduz os mesmos elementos da Web:

| Componente | Equivalente Web |
|---|---|
| `Pill` | `.pill` — badge com bolinha, tons green/amber/red/blue/gray |
| `CodeBadge` | `.badge` — monoespaçada para placa, NF e endereço |
| `Card` | `.card` — superfície com borda de 1px e raio |
| `Button` | `.btn` / `.btn-primary` — altura mínima de 56px |
| `Progresso` | barra de ocupação |
| `Aviso` | faixa semântica de divergência/erro |

Sem gradiente, sem glassmorphism, sem ornamento — a mesma estética enxuta.

---

## 4. As três telas

### Tela 1 — `index.tsx` · Seleção de doca e carga

Lista todas as docas ordenadas por número. Cada carta mostra:

- número da doca em bloco colorido e o tipo (Expedição / Recebimento);
- estado como pill: **Livre** (verde), **Aguardando conferência** (azul) ou
  **Pronta para liberar** (âmbar);
- a NF e a placa em `CodeBadge`, produto, quantidade e transportadora;
- **indicador de progresso da conferência física**: `conferidos/total` mais barra
  de progresso.

Pull-to-refresh, badge "ao vivo/offline" no cabeçalho, e toque na doca navega
para a conferência.

### Tela 2 — `doca/[id].tsx` · Conferência e validação da NF-e

Resumo da nota no topo (número, placa, motorista, transportadora, progresso) e a
lista de itens abaixo.

**Seleção de produto por clique:** tocar o item abre uma folha inferior com a
quantidade em campo grande e teclado numérico, já preenchida com o valor da nota.

**Validação quantitativa manual:** o operador confirma ou corrige o número e toca
em Confirmar → `PUT /movimentacoes/{id}/conferir`.

**Tratamento de divergência:** enquanto digita, um aviso aparece na hora —
vermelho para falta, âmbar para sobra. Depois de gravado, o item exibe pill
**Conferido** (verde), **Falta −N** (vermelha) ou **Sobra +N** (âmbar).

**Validação final:** o botão "Validar & Finalizar Conferência" só habilita quando
todos os itens estiverem conferidos. Ele chama
`PUT /movimentacoes/{id}/validar-liberar-doca`, que autoriza a nota **e libera a
doca** — a Web recebe `dock:released` e a doca vira "Livre" no mesmo instante.

Item já conferido ganha o botão "Endereçar palete", que leva à Tela 3.

### Tela 3 — `enderecar/[id].tsx` · Endereçamento manual (putaway)

Passo a passo em dois toques:

1. **Escolha a rua** — grade de cartas, cada uma com código, categoria, barra de
   ocupação (verde/âmbar/vermelho pelas mesmas faixas da Web) e contagem de
   posições livres.
2. **Escolha a posição** — grade de botões 56×56. Livre é tocável, **ocupada é
   vermelha e desabilitada** (é a RN04 visível na interface, antes mesmo de o
   back-end recusar).

Antes de confirmar, o app mostra a **projeção**: "Ocupação da rua agora 78% →
Depois de guardar 82%".

"Confirmar Endereçamento" chama `POST /movimentacoes/{id}/enderecar` com
`{ posicaoId }`. O back-end cria o item de estoque, marca a posição como ocupada
e emite `pallet:stored` + `street:occupancy_updated` — **o mapa do galpão e a
taxa de ocupação mudam na Web em tempo real**.

Se outro operador tomar a posição no meio do caminho, a tela se atualiza sozinha
(o `useRealtime` recarrega) e, se a corrida acontecer mesmo assim, o back-end
responde 409 e o app mostra "Posição já ocupada".

---

## 5. Camada de integração

### `services/api.ts`

Descoberta do host — o ponto que costuma travar demo em device físico:

```ts
const explicito = process.env.EXPO_PUBLIC_API_URL;
const hostUri = Constants.expoConfig?.hostUri;   // ex.: "192.168.0.14:8081"
export const BASE_URL = explicito ?? `http://${hostUri?.split(':')[0]}:8080`;
```

No emulador e no celular, `localhost` é o próprio aparelho — por isso o app usa o
IP que o Metro já conhece. Para apontar para outro servidor, basta definir
`EXPO_PUBLIC_API_URL`.

Toda resposta de erro é convertida em `ApiError` com a `mensagem` que o
`RestExceptionHandler` do back-end devolve, e falha de rede vira
"Sem conexão com o servidor (<url>)" — o operador vê o motivo, não um crash.

Rotas consumidas:

| Função | Endpoint |
|---|---|
| `listarDocas` | `GET /docas` |
| `listarMovimentacoes` | `GET /movimentacoes` |
| `listarMovimentacoesPorDoca` | `GET /movimentacoes/doca/{docaId}` |
| `buscarMovimentacao` | `GET /movimentacoes/{id}` |
| `listarProdutos` / `listarRuas` / `listarPosicoes` | `GET /produtos`, `/ruas`, `/posicoes` |
| `conferirItem` | `PUT /movimentacoes/{id}/conferir` |
| `validarLiberarDoca` | `PUT /movimentacoes/{id}/validar-liberar-doca` |
| `enderecarPalete` | `POST /movimentacoes/{id}/enderecar` |

> **Nota sobre o prompt original.** O prompt do app previa `GET /api/docas`,
> `POST /api/nfe/{id}/conferir-item`, `POST /api/nfe/{id}/validar-liberar-doca` e
> `POST /api/paletes/enderecar`. O back-end existente não tem o prefixo `/api`
> nem um recurso `nfe` — a nota fiscal é representada pelos campos `nota`,
> `placa`, `motorista` e `transportadora` de `movimentacao`. As rotas de
> conferência, validação/liberação e endereçamento foram **criadas** no back-end
> com a mesma semântica, sobre o recurso que já existia.

### `services/realtime.ts`

O React Native não tem `EventSource`. O cliente resolve nos dois ambientes:

- **Expo Web** → `EventSource` nativo, um `addEventListener` por nome de evento.
- **iOS/Android** → `XMLHttpRequest` lendo `responseText` de forma incremental em
  `readyState === 3`, cortando o buffer em `\n\n` e interpretando as linhas
  `event:` e `data:` do protocolo SSE.

Reconexão automática em 3s ao cair. O hook devolve o estado da conexão:

```ts
const conectado = useRealtime(carregar);   // recarrega a tela a cada evento
```

Nenhuma dependência nova foi adicionada ao `package.json`.

### Eventos que o app emite (indiretamente)

O app não abre socket de escrita: ele chama REST e é o back-end que publica. O
efeito na Web é o mesmo previsto no prompt:

| Ação no app | Chamada REST | Evento na Web | Efeito |
|---|---|---|---|
| Confirmar quantidade | `PUT /conferir` | `movimentacao:conferida` | Divergência aparece na lista |
| Validar & Finalizar | `PUT /validar-liberar-doca` | `dock:released`, `movimentacao:autorizada` | Doca vira "Livre"; notificação de aprovação |
| Confirmar Endereçamento | `POST /enderecar` | `pallet:stored`, `street:occupancy_updated` | Rua muda de cor; % de ocupação sobe |

---

## 6. UX operacional

- Alvo de toque mínimo de 56px em botões, posições e cartas.
- Campo de quantidade grande, centralizado, com `decimal-pad` e `autoFocus`.
- Alto contraste nos dois temas; a divergência nunca é comunicada só por cor —
  há sempre texto ("Sobra +2", "Falta −3").
- Pull-to-refresh em todas as listas, além do refresh automático por evento.
- `accessibilityRole`, `accessibilityLabel` e `accessibilityState` nos elementos
  interativos; posição ocupada é anunciada como desabilitada.
- Erro sempre visível em faixa, nunca em `alert` bloqueante.

---

## 7. Pontos em aberto

- **Finalizar conferência com vários itens** percorre os itens em sequência,
  chamando `validar-liberar-doca` para cada um. Funciona, mas o ideal seria um
  endpoint que finalize a nota inteira numa transação só.
- Não há leitura de código de barras — a seleção é por clique, como o escopo pede.
- Sem autenticação: qualquer aparelho na rede conversa com a API.
- Sem modo offline: perdendo a rede, o app avisa e bloqueia a ação.
- O endereço é `RXX-Pnn`; o código `RXX-AXX-PXX` do briefing exigiria a coluna
  `andar` em `posicao` (ver [03 — Banco de Dados](03-banco-de-dados.md)).
