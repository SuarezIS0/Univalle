# Arquitectura: Microservicios + Hexagonal + SOLID + Saga

## 1. Nivel sistema: Microservicios

```
┌─────────────┐       ┌──────────────┐       ┌──────────────────┐
│  Next.js    │──────▶│  api-gateway │──────▶│ auth-service     │──▶ mongo-auth
│  (frontend) │       │  :8080       │       │ :3001            │
│  :3000      │       │              │       ├──────────────────┤
└─────────────┘       │              │──────▶│ users-service    │──▶ mongo-users
                      │              │       │ :3002            │
                      │              │       ├──────────────────┤
                      │              │──────▶│ products-service │──▶ mongo-products
                      │              │       │ :3003            │
                      │              │       ├──────────────────┤
                      │              │──────▶│ orders-service   │──▶ mongo-orders
                      │              │       │ :3004            │
                      │              │       ├──────────────────┤
                      │              │──────▶│ payments-service │──▶ mongo-payments
                      └──────────────┘       │ :3005            │
                                             └──────────────────┘
```

- Una DB por servicio. JWT compartido.
- `orders → products` (HTTP) para consultar stock y decrementarlo (camino feliz).
- `payments → orders` (HTTP) sólo para **leer** total al cobrar.
- Confirmación de orden y compensación de stock van por **eventos** (RabbitMQ + saga coreografiada). Ver §8.

## 2. Nivel servicio: Hexagonal (Ports & Adapters)

Cada microservicio sigue la misma estructura interna:

```
service/src/
├── domain/                  ← Núcleo. No depende de NADA externo.
│   ├── entities/            ← Clases con invariantes (User, Product, Order, Payment).
│   ├── repositories/        ← Puertos salientes (interfaces abstractas).
│   └── services/            ← Puertos salientes (Hasher, TokenService, PaymentGateway...).
│
├── application/             ← Orquestación.
│   └── use-cases/           ← Un archivo por intención de negocio (RegisterUser, CreateOrder, ProcessPayment...).
│
├── infrastructure/          ← Adaptadores (implementaciones concretas).
│   ├── persistence/         ← MongoXxxRepository + Mongoose schemas.
│   └── services/            ← BcryptHasher, JwtTokenService, HttpProductCatalog, SimulatedPaymentGateway...
│
├── interfaces/              ← Adaptadores de entrada.
│   └── http/
│       ├── XxxController.js ← Traduce HTTP ↔ use-cases.
│       ├── middlewares/     ← auth, requireAdmin.
│       └── routes.js        ← Cableado de rutas Express.
│
└── index.js                 ← Composition Root: única capa que conoce TODO.
```

### Regla de dependencia

```
interfaces ──▶ application ──▶ domain
infrastructure ──▶ domain
```

`domain/` no importa nada de `infrastructure/`, `application/` o `interfaces/`. Los casos de uso reciben los puertos por constructor (inyección de dependencias); el `index.js` es el único lugar donde se instancian las implementaciones concretas.

## 3. SOLID aplicado

| Principio | Cómo se cumple |
| --------- | -------------- |
| **S — Single Responsibility** | 1 archivo = 1 caso de uso (`RegisterUser`, `CreateOrder`, `ReduceStock`). Entidades solo contienen reglas de su dominio. |
| **O — Open/Closed** | Agregar Stripe = crear `StripePaymentGateway` que extienda `PaymentGateway`. Cero cambios en `ProcessPayment.js`. |
| **L — Liskov** | Cualquier `PaymentGateway` puede sustituirse sin romper casos de uso. Igual con `UserRepository`, `ProductCatalog`, etc. |
| **I — Interface Segregation** | Puertos específicos: `Hasher` (solo hash/compare), `TokenService` (solo verify/generate), `OrderClient` (solo getOrder/confirmOrder). Nadie depende de métodos que no usa. |
| **D — Dependency Inversion** | Casos de uso dependen de **abstracciones** (`PaymentGateway`, `UserRepository`). Las concreciones (`SimulatedPaymentGateway`, `MongoUserRepository`) se inyectan desde `index.js`. |

### Ejemplo concreto de inversión — payments

```
ProcessPayment (application)
    │
    ├── depende de PaymentGateway (puerto, en domain/)
    ├── depende de OrderClient (puerto, en domain/)
    └── depende de PaymentRepository (puerto, en domain/)

index.js cablea:
    PaymentGateway      ←─ SimulatedPaymentGateway
    OrderClient         ←─ HttpOrderClient
    PaymentRepository   ←─ MongoPaymentRepository
```

Para testear `ProcessPayment` no necesitas Mongo ni HTTP: inyectas mocks de los 3 puertos.

## 4. Cómo correr

```bash
cd microservices
docker compose up --build
# En otra terminal:
cd .. && npm run dev
# Frontend: http://localhost:3000
# Gateway:  http://localhost:8080
```

Seed de productos:
```bash
curl -X POST http://localhost:8080/api/products/seed
```

Promover un admin:
```bash
curl -X POST http://localhost:8080/api/admin/promote \
  -H "Content-Type: application/json" \
  -d '{"secret":"univalle-admin-seed","email":"tu@email.com"}'
```

## 5. Estado actual

El monolito fue eliminado por completo. Lo único en `app/` ahora es:
- **Páginas y componentes Next** (UI): `app/page.tsx`, `app/products/`, `app/cart/`, `app/checkout/`, `app/dashboard/`, `app/admin/`, `app/orders/`, `app/payment/`, `app/login/`, `app/register/`, `app/components/`, `app/lib/`.
- **Layout y estilos**: `app/layout.tsx`, `app/globals.css`.

`next.config.ts` redirige todo `/api/*` al gateway (puerto 8080). El frontend nunca toca Mongo ni lógica de negocio: solo consume HTTP del gateway.

Ya no existe `app/api/` ni `src/`. El proyecto es 100% microservicios hexagonales con saga.

## 6. Endpoints (vía gateway :8080)

| Método | Ruta                        | Auth        |
| ------ | --------------------------- | ----------- |
| POST   | `/api/auth/register`        | público     |
| POST   | `/api/auth/login`           | público     |
| POST   | `/api/auth/verify`          | público     |
| GET    | `/api/users`                | user        |
| GET    | `/api/users/:id`            | user        |
| PUT    | `/api/users/:id`            | user        |
| DELETE | `/api/users/:id`            | user        |
| POST   | `/api/admin/promote`        | secret      |
| GET    | `/api/products`             | público     |
| GET    | `/api/products/:id`         | público     |
| POST   | `/api/products`             | admin       |
| PUT    | `/api/products/:id`         | admin       |
| DELETE | `/api/products/:id`         | admin       |
| POST   | `/api/products/seed`        | público     |
| GET    | `/api/orders`               | user        |
| GET    | `/api/orders?scope=all`     | admin       |
| GET    | `/api/orders/:id`           | user/owner  |
| POST   | `/api/orders`               | user        |
| PUT    | `/api/orders/:id`           | admin       |
| GET    | `/api/admin/metrics`        | admin       |
| POST   | `/api/payments`             | user        |

## 7. Siguientes pasos recomendados

1. Tests unitarios de dominio (no requieren Mongo ni red — por eso hexagonal).
2. Observabilidad: OpenTelemetry + Jaeger + Prometheus.
3. Kubernetes en vez de docker-compose para producción.
4. Mover ProcessedEvents y Outbox a transacciones Mongo (requiere replica set) para atomicidad estricta.

## 8. Saga coreografiada + Outbox (RabbitMQ)

### 8.1 Por qué

La llamada HTTP síncrona `payments → orders.confirm` y la decremento eager de stock en `CreateOrder` dejaban dos huecos:
- Si `payments` se cae justo después de cobrar y antes de confirmar, la orden queda en `pending` con plata cobrada.
- Si el cobro falla, el stock ya está decrementado y no vuelve solo.

La saga resuelve ambos sin coordinador central: cada servicio reacciona a eventos del bus.

### 8.2 Flujo

```
Cliente ──POST /orders──▶ orders ──HTTP reduceStock──▶ products      (camino feliz, igual que antes)
Cliente ──POST /payments──▶ payments
                              │  graba Payment + escribe outbox event
                              ▼
                       OutboxRelay (poll 1s)
                              │
                              ▼
                  ┌──────── RabbitMQ ────────┐
                  │  exchange: domain-events │
                  │  (topic, durable)        │
                  └──────────────────────────┘
                       │                       │
        payment.approved│                       │payment.failed
                       ▼                       ▼
              orders.payment-events    orders.payment-events
                       │                       │
                  ConfirmOrder            CancelOrder
                                              │
                                              │ escribe outbox event
                                              ▼
                                          OutboxRelay
                                              │
                                              ▼ order.cancelled
                                      products.order-events
                                              │
                                          ReleaseStock  ← compensación
```

### 8.3 Eventos

| Routing key         | Productor | Consumidor | Payload                                         |
| ------------------- | --------- | ---------- | ----------------------------------------------- |
| `payment.approved`  | payments  | orders     | `{orderId, paymentId, userId, amount, transactionId}` |
| `payment.failed`    | payments  | orders     | `{orderId, paymentId, userId, amount, reason}`  |
| `order.cancelled`   | orders    | products   | `{orderId, userId, reason, items:[{productId,quantity}]}` |

Exchange: `domain-events` (topic, durable). Mensajes persistentes con `messageId = eventId` (UUID).

### 8.4 Outbox pattern

Cada servicio que publica (payments, orders) tiene una colección Mongo `outboxevents`:

```
domain/entities/OutboxEvent.js
domain/repositories/OutboxRepository.js   ← puerto
infrastructure/persistence/MongoOutboxRepository.js
infrastructure/persistence/OutboxModel.js
infrastructure/messaging/OutboxRelay.js   ← worker (setInterval 1s)
infrastructure/messaging/RabbitMQEventPublisher.js
```

El use case escribe `Payment` + `OutboxEvent` secuencialmente en la misma DB. Un relay polea filas con `publishedAt = null`, las publica y las marca. Si Rabbit está caído, las filas quedan pendientes y reintenta el siguiente tick.

> Nota: con Mongo standalone los dos `INSERT` no son atómicos; en producción se usa replica set + transacción.

### 8.5 Idempotencia

Los consumidores guardan los `eventId` ya procesados en `processedevents` (índice único). Si Rabbit redelivera el mismo mensaje, `markIfNew` retorna `false` y se ack-ea sin re-procesar. Esto importa especialmente para `ReleaseStock`, que no es naturalmente idempotente.

### 8.6 SOLID en la saga

- **D**: los use cases dependen de los puertos `EventPublisher`, `OutboxRepository`, `ProcessedEventStore`. Las concreciones (`RabbitMQEventPublisher`, `MongoOutboxRepository`) se inyectan en `index.js`.
- **S**: `OutboxRelay` solo retransmite, no toca lógica de negocio. `HandlePaymentFailed` solo orquesta dedupe + cancelación.
- **O**: cambiar Rabbit por Kafka es escribir `KafkaEventPublisher` y reemplazar 1 línea en cada `index.js`. Cero cambios en use cases.

### 8.7 Cómo verificar

Con `docker compose up --build`:
1. UI Rabbit en `http://localhost:15672` (guest/guest). Mirá el exchange `domain-events` y las queues `orders.payment-events`, `products.order-events`.
2. Camino feliz: crear orden, pagar con tarjeta cuyo último dígito sea **par** (`SimulatedPaymentGateway` aprueba). La orden pasa a `confirmed` vía evento `payment.approved`.
3. Camino compensación: pagar con tarjeta cuyo último dígito sea **impar**. Se emite `payment.failed` → orders cancela y emite `order.cancelled` → products devuelve el stock al inventario (verificable con `GET /api/products/:id`).
