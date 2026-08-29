# Back-End — API WMS Golinho

API REST em Spring Boot que concentra toda a regra de negócio do armazém. É o
**único** ponto de acesso ao banco: nem a Web nem o app tocam o PostgreSQL
diretamente.

---

## 1. Stack

| Item | Versão / escolha |
|---|---|
| Java | 25 |
| Spring Boot | 4.1.1 |
| Persistência | Spring Data JPA + Hibernate |
| Banco | PostgreSQL (`ControleEstoque`) |
| Validação | Bean Validation (`spring-boot-starter-validation`) |
| Documentação | springdoc-openapi 3.1 → Swagger UI |
| Boilerplate | Lombok |
| Tempo real | Server-Sent Events (`SseEmitter`, sem dependência extra) |

`pom.xml` na raiz de `estoque/`. Build e execução pelo wrapper Maven:

```bash
./mvnw spring-boot:run       # sobe em http://localhost:8080
./mvnw test                  # testes
```

---

## 2. Arquitetura em camadas

```
HTTP ──► controller/   (rotas, validação de entrada, anotações OpenAPI)
           │
           ▼
        Service/       (regra de negócio, transações, publicação de eventos)
           │
           ▼
   database/repository/ (Spring Data JPA)
           │
           ▼
    database/model/     (entidades JPA ↔ tabelas)

         DTO/           (contrato JSON — records imutáveis)
        config/         (CORS e tratamento de erros)
```

**Por que DTO e não entidade na resposta:** os controllers devolvem `record`s do
pacote `DTO`, nunca a entidade JPA. Isso evita vazar coluna interna, evita
`LazyInitializationException` ao serializar relação preguiçosa e garante que Web
e app consumam exatamente o mesmo JSON.

### Estrutura de pastas

```
src/main/java/com/senai/estoque/
├── EstoqueApplication.java
├── config/
│   ├── WebConfig.java                 CORS para Angular (4200) e Expo (8081/IP local)
│   └── RestExceptionHandler.java      exceções → 404 / 409 / 400 com JSON padronizado
├── controller/
│   ├── ProdutoController.java         /produtos
│   ├── RuaController.java             /ruas
│   ├── PosicaoController.java         /posicoes
│   ├── DocaController.java            /docas
│   ├── EstoqueController.java         /estoques
│   ├── MovimentacaoController.java    /movimentacoes
│   └── EventoController.java          /eventos/stream  (SSE)
├── Service/
│   ├── ProdutoService.java
│   ├── RuaService.java
│   ├── PosicaoService.java
│   ├── DocaService.java
│   ├── EstoqueService.java
│   ├── MovimentacaoService.java
│   └── EventoService.java             barramento de eventos em tempo real
├── database/
│   ├── model/       Produto, Rua, Posicao, Doca, Estoque, Movimentacao
│   └── repository/  um JpaRepository por entidade
└── DTO/
    ├── ProdutoDTO, RuaDTO, PosicaoDTO, DocaDTO, EstoqueDTO, MovimentacaoDTO
    ├── ConferenciaDTO      { quantidadeConferida }
    └── EnderecamentoDTO    { posicaoId, quantidade }
```

---

## 3. Endpoints

Base: `http://localhost:8080`. Swagger UI em `/swagger-ui.html`.

### `/produtos`

| Método | Rota | Descrição |
|---|---|---|
| GET | `/produtos` | Lista todos |
| GET | `/produtos/{id}` | Busca por id |
| GET | `/produtos/buscar?nome=` | Busca parcial por nome (case-insensitive) |
| POST | `/produtos` | Cadastra `{ nome, unidade }` |
| PUT | `/produtos/{id}` | Atualiza |
| DELETE | `/produtos/{id}` | Remove |

### `/ruas`

| Método | Rota | Descrição |
|---|---|---|
| GET | `/ruas` | Lista todas |
| GET | `/ruas/{id}` | Busca por id |
| GET | `/ruas/categoria/{categoria}` | Filtra por categoria |
| POST | `/ruas` | Cadastra `{ codigo, categoria }` — **bloqueia acima de 6 ruas** |
| PUT | `/ruas/{id}` | Atualiza |
| DELETE | `/ruas/{id}` | Remove |

### `/posicoes`

| Método | Rota | Descrição |
|---|---|---|
| GET | `/posicoes` | Lista todas |
| GET | `/posicoes/{id}` | Busca por id |
| GET | `/posicoes/rua/{ruaId}` | Posições de uma rua |
| POST | `/posicoes` | Cadastra `{ numero, ocupada, ruaId }` |
| PUT | `/posicoes/{id}` | Atualiza (dispara `street:occupancy_updated`) |
| DELETE | `/posicoes/{id}` | Remove |

### `/docas`

| Método | Rota | Descrição |
|---|---|---|
| GET | `/docas` | Lista todas |
| GET | `/docas/livres` | Só as com `ocupada = false` |
| GET | `/docas/{id}` | Busca por id |
| POST | `/docas` | Cadastra `{ numero, expedicao, ocupada }` |
| PUT | `/docas/{id}` | Atualiza (dispara `doca:status_changed`) |
| DELETE | `/docas/{id}` | Remove |

### `/estoques`

| Método | Rota | Descrição |
|---|---|---|
| GET | `/estoques` | Lista todos os itens guardados |
| GET | `/estoques/{id}` | Busca por id |
| GET | `/estoques/produto/{produtoId}` | Saldo de um produto |
| GET | `/estoques/posicao/{posicaoId}` | O que está guardado numa posição |
| POST | `/estoques` | Guarda `{ quantidade, produtoId, posicaoId }` — **ocupa a posição** |
| PUT | `/estoques/{id}` | Move/atualiza — libera a posição antiga, ocupa a nova |
| DELETE | `/estoques/{id}` | Remove — **libera a posição** se ficar vazia |

### `/movimentacoes`

| Método | Rota | Descrição |
|---|---|---|
| GET | `/movimentacoes` | Lista todas |
| GET | `/movimentacoes/{id}` | Busca por id |
| GET | `/movimentacoes/pendentes` | Saídas com `autorizada = false` |
| GET | `/movimentacoes/doca/{docaId}` | Carga vinculada a uma doca (usado pelo coletor) |
| POST | `/movimentacoes` | Registra entrada ou saída |
| PUT | `/movimentacoes/{id}` | **Edita** a movimentação inteira |
| DELETE | `/movimentacoes/{id}` | **Exclui** a movimentação |
| PUT | `/movimentacoes/{id}/autorizar` | Autoriza e libera a saída |
| PUT | `/movimentacoes/{id}/conferir` | Grava `{ quantidadeConferida }` da conferência física |
| PUT | `/movimentacoes/{id}/validar-liberar-doca` | Finaliza a nota **e libera a doca** |
| POST | `/movimentacoes/{id}/enderecar` | Guarda o palete em `{ posicaoId, quantidade }` |

### `/eventos`

| Método | Rota | Descrição |
|---|---|---|
| GET | `/eventos/stream` | Canal SSE (`text/event-stream`) assinado pela Web e pelo app |

---

## 4. Regras de negócio no back-end

| Regra | Onde está | Comportamento |
|---|---|---|
| Máximo de 6 ruas | `RuaService.salvar` | `IllegalStateException` → **409 Conflict** |
| Posição ocupada não recebe palete | `MovimentacaoService.enderecar` | `IllegalStateException("Posição já ocupada")` → **409 Conflict** |
| Guardar estoque ocupa a posição | `EstoqueService.salvar` / `atualizar` | `posicao.ocupada = true` + evento de ocupação |
| Tirar estoque libera a posição | `EstoqueService.deletar` / `atualizar` | Só libera quando **não sobra nenhum** item naquela posição |
| Conferência preserva a nota | `MovimentacaoService.conferirItem` | Grava em `quantidade_conferida`; `quantidade` continua sendo o declarado |
| Finalizar a nota libera a doca | `MovimentacaoService.validarLiberarDoca` | `@Transactional`: autoriza + libera + `doca.ocupada = false` |
| Endereçar usa o que foi contado | `MovimentacaoService.enderecar` | `quantidadeConferida ?? quantidade` |
| Entidade inexistente | todos os services | `EntityNotFoundException` → **404 Not Found** |

### Divergência de conferência

`quantidade` = o que a nota fiscal declarou.
`quantidadeConferida` = o que o operador contou fisicamente (`null` até conferir).

A divergência é `quantidadeConferida − quantidade`: negativa é **falta**,
positiva é **sobra**. Como as duas colunas coexistem, a divergência continua
auditável depois da conferência — por isso o `conferirItem` não sobrescreve
`quantidade`.

---

## 5. Tempo real (SSE)

O `EventoService` mantém uma lista `CopyOnWriteArrayList<SseEmitter>` com todos
os clientes conectados. Cada service, ao alterar dado, chama
`eventoService.publicar(nome, payload)` e a mudança chega em todos os
navegadores e coletores abertos.

**Por que SSE e não WebSocket:** o fluxo é unidirecional (servidor → clientes);
as ações dos clientes já vão por REST. SSE resolve isso sem dependência nova,
sem handshake e com reconexão automática — o `SseEmitter` já vem no
`spring-boot-starter-webmvc`.

### Eventos publicados

| Evento | Payload | Disparado por |
|---|---|---|
| `conectado` | `{ clientes }` | assinatura do canal |
| `doca:status_changed` | `DocaDTO` | criar/atualizar doca |
| `dock:released` | `DocaDTO` | `validar-liberar-doca` |
| `doca:removed` | `id` | excluir doca |
| `street:occupancy_updated` | `PosicaoDTO` | criar/atualizar posição, guardar/retirar estoque |
| `posicao:removed` | `id` | excluir posição |
| `pallet:stored` | `EstoqueDTO` | guardar/mover item de estoque |
| `estoque:removed` | `id` | excluir item de estoque |
| `movimentacao:created` | `MovimentacaoDTO` | nova movimentação |
| `movimentacao:updated` | `MovimentacaoDTO` | edição |
| `movimentacao:removed` | `id` | exclusão |
| `movimentacao:conferida` | `MovimentacaoDTO` | conferência de item |
| `movimentacao:autorizada` | `MovimentacaoDTO` | autorizar / validar-liberar |
| `movimentacao:enderecada` | `MovimentacaoDTO` | endereçamento de palete |

O emitter expira em 30 minutos; os dois clientes reconectam sozinhos (Web em 5s,
app em 3s). Se o `send` falhar, o emitter é removido da lista na hora.

Teste manual do canal:

```bash
curl -N http://localhost:8080/eventos/stream
```

---

## 6. Tratamento de erros

`RestExceptionHandler` (`@RestControllerAdvice`) padroniza tudo:

| Exceção | HTTP | Corpo |
|---|---|---|
| `EntityNotFoundException` | 404 | `{ timestamp, status, erro, mensagem }` |
| `IllegalStateException`, `IllegalArgumentException` | 409 | idem |
| `MethodArgumentNotValidException` | 400 | idem + `campos: { campo: motivo }` |

Antes disso qualquer campo inválido virava um 500 genérico — a Web e o app agora
conseguem exibir a mensagem real para o operador.

---

## 7. CORS

`WebConfig` libera por padrão de origem, não por lista fixa, porque o app roda no
IP da rede local:

- `http://localhost:4200` — Angular
- `http://localhost:8081` — Expo Web
- `http://127.0.0.1:*`, `http://192.168.*.*:*`, `http://10.*.*.*:*` — device físico
- `exp://*` — Expo Go

Métodos liberados: `GET, POST, PUT, PATCH, DELETE, OPTIONS`.

---

## 8. Configuração

`src/main/resources/application.properties`:

```properties
spring.datasource.url = jdbc:postgresql://localhost:5432/ControleEstoque
spring.datasource.username = postgres
spring.datasource.password = Suc3ss0@

spring.jpa.hibernate.ddl-auto = update
spring.jpa.show-sql = true
spring.jpa.properties.hibernate.format_sql = true
```

> `ddl-auto = update` cria e evolui o schema sozinho — as colunas
> `quantidade_conferida` e `conferida` aparecem na primeira subida depois desta
> versão. Em produção, trocar por `validate` + migrações versionadas (Flyway).
> A senha do banco está em texto puro no arquivo: para publicar o projeto, mover
> para variável de ambiente (`${DB_PASSWORD}`).
