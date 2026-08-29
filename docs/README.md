# Documentação — WMS Golinho

Sistema de controle de estoque da **Bebidas Golinho**: um back-end Spring Boot,
um painel Web em Angular e um app coletor em React Native/Expo, todos falando
com o mesmo banco PostgreSQL através da mesma API REST.

## Índice

| Documento | O que cobre |
|---|---|
| [01 — Front-End](01-frontend.md) | Painel Web Angular: rotas, componentes, serviços, design system, modo escuro, notificações |
| [02 — Back-End](02-backend.md) | API Spring Boot: camadas, endpoints, regras de negócio, canal de eventos em tempo real |
| [03 — Banco de Dados](03-banco-de-dados.md) | Tabelas, colunas, relacionamentos, DER, scripts de seed e de reforço de integridade |
| [04 — App Mobile](04-app-mobile.md) | Coletor Expo: telas, fluxo operacional, integração REST + SSE |
| [05 — Atualizações aplicadas](05-atualizacoes-aplicadas.md) | O que foi feito de cada item da pasta `Atualizações` e do prompt do app |

## Mapa do repositório

```
estoque-api/
├── estoque/            # back-end Spring Boot 4.1 (Java 25) + PostgreSQL
├── estoque-front/      # painel Web Angular 21 (zoneless, standalone)
├── estoque-app/        # app coletor Expo 57 / React Native 0.86
└── docs/               # esta documentação
```

## Como subir tudo

```bash
# 1) banco — PostgreSQL com o database ControleEstoque criado
#    (usuário/senha em estoque/src/main/resources/application.properties)

# 2) back-end  → http://localhost:8080  (Swagger em /swagger-ui.html)
cd estoque/ && ./mvnw spring-boot:run

# 3) painel Web → http://localhost:4200
cd estoque-front/ && npm install && npm start

# 4) app coletor → Expo Go / emulador
cd estoque-app/ && npm install && npx expo start
```

O app descobre o IP do back-end sozinho a partir do host do Metro. Para apontar
para outro servidor, defina `EXPO_PUBLIC_API_URL` antes do `expo start`.

## Fluxo operacional em uma frase

A Web registra a chegada do caminhão numa doca → o operador confere a carga item
a item no coletor → ao finalizar, a doca é liberada e volta a aparecer como
**Livre** na Web → o operador endereça o palete numa posição → o mapa do galpão e
a taxa de ocupação da rua mudam **na hora** no painel, sem recarregar a página.
