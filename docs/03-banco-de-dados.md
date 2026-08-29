# Banco de Dados — WMS Golinho

PostgreSQL, database `ControleEstoque`. O schema é gerado pelo Hibernate a partir
das entidades JPA (`spring.jpa.hibernate.ddl-auto = update`) — as tabelas abaixo
são exatamente o que existe hoje no banco.

---

## 1. Diagrama de relacionamentos

```
                       ┌──────────┐
                       │   rua    │
                       │──────────│
                       │ id (PK)  │
                       │ codigo   │
                       │ categoria│
                       └────┬─────┘
                            │ 1
                            │
                            │ N
                       ┌────▼─────┐
                       │ posicao  │
                       │──────────│
                       │ id (PK)  │
                       │ numero   │
                       │ ocupada  │
                       │ id_rua FK│
                       └────┬─────┘
                            │ 1
              ┌─────────────┼─────────────┐
              │ N                         │ N (opcional)
        ┌─────▼──────┐             ┌──────▼────────┐        ┌──────────┐
        │  estoque   │             │ movimentacao  │◄───────┤   doca   │
        │────────────│             │───────────────│ N    1 │──────────│
        │ id (PK)    │             │ id (PK)       │        │ id (PK)  │
        │ quantidade │             │ saida         │        │ numero   │
        │ id_produto │             │ data_hora     │        │ expedicao│
        │ id_posicao │             │ quantidade    │        │ ocupada  │
        └─────┬──────┘             │ qtd_conferida │        └──────────┘
              │ N                  │ conferida     │
              │                    │ placa         │
              │                    │ motorista     │
              │                    │ transportadora│
              │                    │ nota          │
              │                    │ autorizada    │
              │                    │ liberada      │
              │                    │ id_produto FK │
              │                    │ id_posicao FK │
              │                    │ id_doca    FK │
              │                    └───────┬───────┘
              │ 1                          │ N
            ┌─▼──────────┐                 │
            │  produto   │◄────────────────┘ 1
            │────────────│
            │ id (PK)    │
            │ nome       │
            │ unidade    │
            └────────────┘
```

Em uma linha: **rua** tem N **posições**; uma posição guarda N itens de
**estoque**; cada item de estoque é de um **produto**; toda entrada e saída vira
uma **movimentação**, opcionalmente ligada a uma **posição** e a uma **doca**.

---

## 2. Tabelas

### `rua`

O corredor de armazenagem.

| Coluna | Tipo | Nulo | Descrição |
|---|---|---|---|
| `id` | `bigserial` | não | PK, identity |
| `codigo` | `varchar(10)` | não | Código exibido no mapa (ex.: `R01`) |
| `categoria` | `varchar(40)` | não | Agrupamento operacional (ex.: `Refrigerante 2L`) |

**Regra:** o `RuaService` bloqueia o cadastro da 7ª rua (limite de 6, RN01).

### `posicao`

O endereço físico onde o palete é guardado.

| Coluna | Tipo | Nulo | Descrição |
|---|---|---|---|
| `id` | `bigserial` | não | PK |
| `numero` | `integer` | não | Número da posição dentro da rua |
| `ocupada` | `boolean` | não | `false` por padrão — é o que pinta o mapa na Web |
| `id_rua` | `bigint` | não | FK → `rua.id` |

**Quem escreve `ocupada`:** o `EstoqueService`. Guardar um item marca `true`;
remover o último item daquela posição volta para `false`. Nenhum cliente precisa
manter esse campo na mão — é o que garante que Web e app enxerguem o mesmo mapa.

### `doca`

A baia de caminhão.

| Coluna | Tipo | Nulo | Descrição |
|---|---|---|---|
| `id` | `bigserial` | não | PK |
| `numero` | `integer` | não | Número da doca |
| `expedicao` | `boolean` | não | `true` = expedição, `false` = recebimento |
| `ocupada` | `boolean` | não | `false` por padrão — caminhão encostado |

**Ciclo de vida:** registrar chegada marca `ocupada = true`;
`validar-liberar-doca` (finalizar a conferência no coletor) devolve para `false`.

### `produto`

| Coluna | Tipo | Nulo | Descrição |
|---|---|---|---|
| `id` | `bigserial` | não | PK |
| `nome` | `varchar(80)` | não | Nome/sabor do produto |
| `unidade` | `varchar(10)` | não | Unidade de medida (`un`, `cx`, `pallet`…) |

### `estoque`

Saldo físico: **o que está guardado onde**.

| Coluna | Tipo | Nulo | Descrição |
|---|---|---|---|
| `id` | `bigserial` | não | PK |
| `quantidade` | `numeric(10,2)` | não | Quantidade guardada, `0` por padrão |
| `id_produto` | `bigint` | não | FK → `produto.id` |
| `id_posicao` | `bigint` | não | FK → `posicao.id` |

### `movimentacao`

Histórico de entradas e saídas — é a tabela que sustenta a doca, a conferência e
a auditoria.

| Coluna | Tipo | Nulo | Descrição |
|---|---|---|---|
| `id` | `bigserial` | não | PK |
| `saida` | `boolean` | não | `true` = saída, `false` = entrada |
| `data_hora` | `timestamp` | não | Momento do registro (preenchido pelo servidor se vier vazio) |
| `quantidade` | `numeric(10,2)` | não | **Quantidade declarada na nota fiscal** |
| `quantidade_conferida` | `numeric(10,2)` | sim | **Quantidade contada no coletor** — `null` enquanto não conferida |
| `conferida` | `boolean` | não | `false` por padrão; vira `true` na conferência física |
| `placa` | `varchar(10)` | sim | Placa do caminhão |
| `motorista` | `varchar(80)` | sim | Nome do motorista |
| `transportadora` | `varchar(80)` | sim | Transportadora |
| `nota` | `varchar(20)` | sim | Número da nota fiscal |
| `autorizada` | `boolean` | não | `false` por padrão — liberação do gestor |
| `liberada` | `boolean` | não | `false` por padrão — caminhão liberado |
| `id_produto` | `bigint` | não | FK → `produto.id` |
| `id_posicao` | `bigint` | sim | FK → `posicao.id` — preenchida no endereçamento |
| `id_doca` | `bigint` | sim | FK → `doca.id` |

**Colunas novas nesta versão:** `quantidade_conferida` e `conferida`. Foram
adicionadas para o módulo de conferência do coletor. Manter as duas quantidades
separadas é o que permite calcular e auditar a **divergência**
(`quantidade_conferida − quantidade`): negativa é falta, positiva é sobra. Se a
conferência sobrescrevesse `quantidade`, a divergência sumiria no instante em que
fosse detectada.

O Hibernate cria as duas colunas sozinho na primeira subida (`ddl-auto = update`).
Para aplicar à mão:

```sql
ALTER TABLE movimentacao ADD COLUMN IF NOT EXISTS quantidade_conferida numeric(10,2);
ALTER TABLE movimentacao ADD COLUMN IF NOT EXISTS conferida boolean NOT NULL DEFAULT false;
```

---

## 3. Estados e transições

### Movimentação de entrada (recebimento)

```
registrada  ──conferir item──►  conferida  ──endereçar──►  em estoque
   │                                │
   │                                └──validar-liberar-doca──► doca livre
   └── doca.ocupada = true
```

### Movimentação de saída (expedição)

```
registrada  ──autorizar──►  autorizada + liberada  ──►  doca livre
```

### Posição

```
livre  ──POST /estoques──►  ocupada  ──DELETE do último item──►  livre
```

---

## 4. Seed mínimo para demonstração

O sistema não cria dados sozinho. Este script deixa o ambiente pronto:
6 ruas × 8 posições (48 endereços), 4 docas de recebimento e os 4 sabores.

```sql
-- Ruas (limite de 6 pela regra de negócio)
INSERT INTO rua (codigo, categoria) VALUES
  ('R01', 'Refrigerante 2L'), ('R02', 'Refrigerante 2L'),
  ('R03', 'Refrigerante 2L'), ('R04', 'Refrigerante 2L'),
  ('R05', 'Refrigerante 2L'), ('R06', 'Refrigerante 2L');

-- 8 posições por rua
INSERT INTO posicao (numero, ocupada, id_rua)
SELECT g, false, r.id FROM rua r CROSS JOIN generate_series(1, 8) AS g;

-- 4 docas de recebimento
INSERT INTO doca (numero, expedicao, ocupada) VALUES
  (1, false, false), (2, false, false), (3, false, false), (4, false, false);

-- Catálogo
INSERT INTO produto (nome, unidade) VALUES
  ('Guaraná PET 2L', 'pallet'), ('Laranja PET 2L', 'pallet'),
  ('Caju PET 2L',    'pallet'), ('Maçã PET 2L',    'pallet');
```

Conferir o resultado:

```sql
SELECT r.codigo,
       count(*)                                  AS posicoes,
       count(*) FILTER (WHERE p.ocupada)         AS ocupadas,
       round(100.0 * count(*) FILTER (WHERE p.ocupada) / count(*)) AS pct
FROM rua r JOIN posicao p ON p.id_rua = r.id
GROUP BY r.codigo ORDER BY r.codigo;
```

---

## 5. Integridade — o que o banco garante hoje e o que falta

**Garantido hoje pelo schema:** chaves primárias identity, `NOT NULL` nas colunas
obrigatórias, FKs de `posicao→rua`, `estoque→produto/posicao` e
`movimentacao→produto/posicao/doca`, e os limites de tamanho de cada `varchar`.

**Garantido hoje só pela aplicação (não pelo banco):**

| Regra | Onde é validada |
|---|---|
| Máximo de 6 ruas | `RuaService.salvar` |
| Posição ocupada não recebe outro palete | `MovimentacaoService.enderecar` |
| Código de rua único | não validado |
| Número de doca único | não validado |

Para transformar essas regras em invariantes reais — imunes a corrida entre dois
operadores conferindo ao mesmo tempo — vale aplicar as constraints abaixo. Elas
**não** foram aplicadas automaticamente porque falham na subida se o banco já
tiver dados que as violem; rode primeiro a consulta de verificação de cada uma.

```sql
-- Rua com código único
SELECT codigo, count(*) FROM rua GROUP BY codigo HAVING count(*) > 1;   -- deve vir vazio
ALTER TABLE rua ADD CONSTRAINT uk_rua_codigo UNIQUE (codigo);

-- Doca com número único
SELECT numero, count(*) FROM doca GROUP BY numero HAVING count(*) > 1;  -- deve vir vazio
ALTER TABLE doca ADD CONSTRAINT uk_doca_numero UNIQUE (numero);

-- Posição sem coordenada duplicada dentro da rua
SELECT id_rua, numero, count(*) FROM posicao
GROUP BY id_rua, numero HAVING count(*) > 1;                            -- deve vir vazio
ALTER TABLE posicao ADD CONSTRAINT uk_posicao_rua_numero UNIQUE (id_rua, numero);

-- RN04 no banco: uma posição, um palete. É a proteção definitiva contra
-- dois coletores endereçando na mesma posição no mesmo instante.
SELECT id_posicao, count(*) FROM estoque
GROUP BY id_posicao HAVING count(*) > 1;                                -- deve vir vazio
ALTER TABLE estoque ADD CONSTRAINT uk_estoque_posicao UNIQUE (id_posicao);
```

> Atenção à última: com `uk_estoque_posicao` ativa, o back-end passa a receber
> `DataIntegrityViolationException` em vez de conseguir gravar. O tratamento
> desse caso ainda precisa ser adicionado ao `RestExceptionHandler` (mapear para
> 409 com "Posição já ocupada! Escolha uma posição livre") antes de ligar a
> constraint em produção.

---

## 6. Divergências em relação à modelagem original

`WMS_Gollinho_Regras_e_Modelagem.md` propõe um modelo mais granular
(`nota_fiscal_entrada`, `nota_fiscal_item`, `palete`, `operador`,
`posicao_estoque` com `rua/andar/posicao`). O que foi implementado é uma versão
condensada:

| Modelo proposto | Implementado | Efeito |
|---|---|---|
| `nota_fiscal_entrada` + `nota_fiscal_item` | campos `nota`, `placa`, `motorista`, `transportadora` em `movimentacao` | Uma movimentação é um item de nota. Uma nota com vários itens vira várias movimentações com o mesmo `nota` |
| `palete` como entidade | linha em `estoque` | Não há etiqueta de palete rastreável individualmente |
| `posicao_estoque (rua, andar, posicao)` | `posicao (numero, id_rua)` | O endereço é `RXX-Pnn`, sem o nível de andar. O código `RXX-AXX-PXX` do briefing exigiria uma coluna `andar` em `posicao` |
| `operador` | — | Não há autenticação nem autoria de ação |
| `status` textual de NF/palete | booleanos `conferida`, `autorizada`, `liberada` | Mesma informação, menos flexível para novos estados |

Nenhuma dessas simplificações impede o fluxo da demo. As duas que mais valem a
pena evoluir depois são a coluna `andar` em `posicao` (para bater com o código de
endereçamento do briefing) e a tabela `operador` (para saber quem conferiu).
