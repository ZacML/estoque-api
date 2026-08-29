# WMS Gollinho — Regras de Negócio e Modelagem de Dados

Baseado no briefing do hackathon (fotos do enunciado) e no scaffold Spring Boot já existente em `estoque-api-master` (Spring Boot 4.1.1, Java 25, `spring-boot-starter-data-jpa`, `spring-boot-starter-webmvc`, `spring-boot-starter-validation`, driver PostgreSQL, Lombok — projeto ainda vazio, só o boilerplate).

## 1. Contexto

A Bebidas Gollinho fabrica refrigerante PET 2L em 4 sabores (Guaraná, Laranja, Caju, Maçã) e precisa de um WMS (Warehouse Management System) integrado Web + Mobile (Android) para controlar recebimento e endereçamento no armazém.

## 2. Regras de negócio

**Produto e unidade de carga**
- 1 palete = 100 fardos = 600 garrafas = 1.200 litros (conversão fixa, vale para os 4 sabores).
- Formato único: PET 2L.

**Layout físico do armazém**
- 4 docas de recebimento (entrada de mercadoria).
- Armazenagem: 6 ruas × 4 andares × 8 posições = 192 posições/paletes.
- Capacidade máxima: 192 × 1.200L = 230.400 litros.
- Código de endereçamento padrão: `RXX-AXX-PXX` (ex.: `R01-A03-P05` = Rua 1, Andar 3, Posição 5).

**Regra de ocupação (regra crítica de validação)**
- Uma posição só pode receber um palete se estiver **completamente vazia**.
- O sistema **deve impedir sobreposição**: tentar alocar em posição ocupada tem que ser bloqueado instantaneamente, com mensagem clara ao operador (ex.: "Posição já ocupada! Escolha uma posição livre").

**Fluxo operacional**
1. **Web (retaguarda):** cadastro de produtos (sabores) e lançamento de Notas Fiscais de Entrada. Ao registrar uma NF, o sistema gera automaticamente uma pendência de conferência associada a uma das 4 docas.
2. **App Android (chão de fábrica):** operador acessa a doca, faz a **conferência física/cega** do recebimento contra a NF, e então registra o **endereçamento** (alocação do palete numa posição Rua/Andar/Posição). O backend valida a matriz de estocagem (192 posições) e só grava se a posição estiver 100% livre.
3. **Web (tempo real):** assim que o app confirma a alocação, o dashboard atualiza na hora — local exato de cada lote/sabor, % de ocupação por rua/corredor, saldo consolidado em estoque e capacidade disponível.

**Critérios de entrega (o que precisa ficar visivelmente correto na demo)**
- Fluxo contínuo e integrado entre Web e App Android.
- Validação de regra de negócio (impedir alocar em local ocupado) — é o ponto que mais será cobrado na demo.
- Interface intuitiva para o operador de armazém.
- Comunicação backend em tempo real (REST com resposta imediata ou WebSocket).

## 3. Modelo de dados sugerido (PostgreSQL / JPA)

A ideia central: a regra de ocupação vira uma **constraint no banco**, não só validação em código — assim fica impossível dois paletes caírem na mesma posição mesmo com concorrência (dois operadores no app ao mesmo tempo).


```

## 4. Arquitetura e "como vamos fazer"

**Stack:** o esqueleto já usa Spring Boot + Spring Data JPA + PostgreSQL + Bean Validation + Lombok — segue com isso no backend. Web consome a mesma API REST que o Android.

**Backend único, banco único** — confirmado: uma única API (o próprio `estoque-api-master`) fala com um único Postgres, e tanto a Web quanto o App Android são clientes dela. Nenhum dos dois acessa o banco direto. Pontos práticos para isso funcionar bem com dois consumidores diferentes:
- **Contrato único (DTOs):** os endpoints retornam DTOs, não as entidades JPA direto — evita vazar coluna interna e evita `LazyInitializationException` serializando relação preguiçosa. Web e Android consomem exatamente o mesmo JSON.
- **CORS liberado para o front Web** (`@CrossOrigin` ou `WebMvcConfigurer`), já que o Android não tem esse problema mas o navegador tem.
- **Prefixo de versão:** `/api/v1/...` em todos os endpoints, pra não travar se precisar mudar contrato no meio do hackathon.
- **Autenticação simples:** se der tempo, um login básico (usuário/senha do `operador`) com token simples (JWT ou até um header fixo) — senão, pode ficar sem auth pra focar na regra de negócio, que é o critério de entrega principal.
- **Erros padronizados:** um `@ControllerAdvice` central traduzindo a exceção de posição ocupada (e outras) num JSON `{ codigo, mensagem }` consistente — assim Web e App tratam o mesmo formato de erro.

**Endpoints REST principais**
- `POST /produtos` / `GET /produtos` — cadastro de sabores.
- `POST /notas-fiscais` — lança NF, cria pendência na doca.
- `GET /notas-fiscais/pendentes?docaId=` — fila de conferência do app.
- `POST /notas-fiscais/{id}/conferencia` — operador confirma conferência física.
- `POST /paletes/{id}/alocar` `{ rua, andar, posicao }` — tenta gravar a posição:
  - sucesso → `200 OK` + código gerado (`R01-A03-P05`).
  - posição ocupada → `409 Conflict` + mensagem "Posição já ocupada! Escolha uma posição livre" (é a "Dica de Ouro nº1/2" do briefing, então precisa estar bem visível no app).
- `GET /armazem/ocupacao` — % ocupado por rua, para heatmap/barras de progresso no dashboard.
- `GET /estoque/saldo?produtoId=` — saldo consolidado por sabor + onde está.
- Opcional: WebSocket/STOMP em `/topic/armazem` emitindo evento a cada alocação, pra Web atualizar sem polling (mais impressionante na demo, mas dá pra fazer com REST simples também se o tempo apertar).

**Concorrência (ponto que mais derruba equipes na demo):** a validação de posição livre não pode ser só um `if` em Java lendo e depois gravando — precisa ser transação com `SELECT ... FOR UPDATE` na posição, ou confiar na constraint `unique` de `palete_id` em `posicao_estoque` e tratar a exceção de violação de unicidade como o gatilho do erro 409. A segunda opção é mais simples de implementar num hackathon.

**Divisão de papéis (conforme sugestão do briefing, até 4 pessoas)**
- Pessoa 1/2 — Web/Backend: modelagem, entidades JPA, endpoints, regra de validação transacional.
- Pessoa 3 — Mobile: telas de conferência de NF e endereçamento, tratamento do erro 409 com alerta.
- Pessoa 4 — QA/Operações: testes do fluxo completo (cadastro → NF → conferência → alocação → bloqueio de posição ocupada → dashboard atualizado), roteiro da demo.

**Roteiro de demo (bate com o briefing):** cadastro de produto/NF na Web → conferência no app → alocação com sucesso → **forçar erro** tentando ocupar a mesma posição de novo → mostrar dashboard atualizando em tempo real com heatmap de ocupação por rua.
