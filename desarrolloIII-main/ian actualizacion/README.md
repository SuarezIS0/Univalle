# 🛒 Univalle Shop

Plataforma de e-commerce para la **Universidad del Valle**. Permite registrarse con correo institucional (`@correounivalle.edu.co` / `@univalle.edu.co`), navegar catálogo, gestionar carrito, generar órdenes y simular pagos con tarjeta.

El backend está dividido en **microservicios Node.js** que aplican **Arquitectura Hexagonal**, **principios SOLID** y un **patrón Saga coreografiado** con **RabbitMQ + Outbox** para mantener la consistencia entre servicios. El frontend es una app **Next.js 16 (App Router)** que solo consume el `api-gateway`.

> Para el detalle técnico fino (diagramas, exchanges, queues, eventos) ver **`ARQUITECTURA-MICROSERVICIOS.md`**. Para el plan histórico de migración ver **`MIGRATION_GUIDE.md`**.

---

## 1. Stack tecnológico

| Capa | Tecnología | Versión | Dónde vive |
|------|------------|---------|------------|
| Frontend | **Next.js (App Router) + React + TypeScript** | 16.2 / 19.2 / ^5 | `app/` |
| Estilos | **Tailwind CSS** | ^4 | `globals.css`, `postcss.config.mjs` |
| Microservicios | **Node.js + Express** (CommonJS) | 20-alpine / ^4.19 | `microservices/*-service/` |
| API Gateway | **http-proxy-middleware** | — | `microservices/api-gateway/` |
| Persistencia | **MongoDB** (1 DB por servicio) + **Mongoose** | 7 / ^8.5 | `infrastructure/persistence/` |
| Mensajería | **RabbitMQ** (topic exchange durable) + **amqplib** | 3-management / ^0.10 | `microservices/docker-compose.yml`, `infrastructure/messaging/` |
| Auth | **JWT** (`jsonwebtoken`) + **bcryptjs** | ^9.0 / ^3.0 | `auth-service/` |
| Contenedores | **Docker** + **Docker Compose** | — | `microservices/docker-compose.yml` |

---

## 2. ¿Por qué Arquitectura Hexagonal?

**Problema:** si el dominio depende del framework HTTP, de Mongoose o de la pasarela de pago, cualquier cambio técnico (cambiar Mongo por Postgres, Express por Fastify, simulador por Stripe) obliga a tocar la lógica de negocio. Y los tests de dominio requieren levantar Mongo y Rabbit.

**Solución:** **invertir las dependencias**. El dominio define **puertos** (interfaces); la infraestructura provee **adaptadores** (implementaciones). El composition root (`index.js` de cada servicio) es el único lugar que conoce las concreciones.

Cada microservicio sigue exactamente la misma estructura interna:

```
service/src/
├── domain/                  ← Núcleo. NO importa nada externo.
│   ├── entities/            ← Reglas e invariantes (User, Product, Order, Payment, OutboxEvent)
│   ├── repositories/        ← Puertos de salida: UserRepository, OrderRepository, OutboxRepository...
│   ├── services/            ← Puertos de salida: Hasher, TokenService, PaymentGateway, ProcessedEventStore
│   └── events/              ← Puerto de salida: EventPublisher
│
├── application/             ← Orquestación. Sin Mongoose, sin Express, sin amqplib.
│   └── use-cases/           ← 1 archivo = 1 intención (CreateOrder, ProcessPayment, CancelOrder, ReleaseStock)
│
├── infrastructure/          ← Adaptadores concretos.
│   ├── persistence/         ← MongoXxxRepository + schemas Mongoose
│   ├── services/            ← BcryptHasher, JwtTokenService, SimulatedPaymentGateway, HttpProductCatalog
│   └── messaging/           ← RabbitMQEventPublisher, RabbitMQEventSubscriber, OutboxRelay
│
├── interfaces/http/         ← Adaptadores de entrada (Express)
│   ├── XxxController.js     ← Traduce HTTP ↔ casos de uso
│   ├── middlewares/         ← auth, requireAdmin
│   └── routes.js
│
└── index.js                 ← Composition Root: instancia adaptadores e inyecta puertos
```

### Regla de dependencia

```
interfaces      ──▶ application ──▶ domain
infrastructure  ──▶                  domain
```

`domain/` no importa de `application/`, `infrastructure/` ni `interfaces/`. Por eso un caso de uso se testea inyectando mocks de los puertos — sin Mongo, sin red, sin Rabbit.

---

## 3. ¿Por qué SOLID?

| Principio | Cómo se manifiesta en el código |
|-----------|----------------------------------|
| **S — Single Responsibility** | 1 archivo = 1 caso de uso (`RegisterUser`, `CreateOrder`, `ProcessPayment`, `CancelOrder`, `ReleaseStock`). Las entidades solo contienen reglas de su dominio (`Order.confirm()`, `Order.cancel()`, `Product.reduceStock()`, `Product.releaseStock()`). El `OutboxRelay` solo retransmite, no toca lógica de negocio. |
| **O — Open/Closed** | Reemplazar el simulador por Stripe = crear `StripePaymentGateway` que extienda `PaymentGateway`. Cero cambios en `ProcessPayment.js`. Cambiar Rabbit por Kafka = escribir `KafkaEventPublisher` y reemplazar 1 línea en `index.js`. |
| **L — Liskov Substitution** | Cualquier `PaymentGateway`, `UserRepository`, `OutboxRepository` o `EventPublisher` puede sustituirse sin romper consumidores. |
| **I — Interface Segregation** | Puertos pequeños y enfocados: `Hasher` (solo hash/compare), `TokenService` (solo verify/generate), `OrderClient` (solo getOrder), `ProcessedEventStore` (solo markIfNew). Nadie depende de métodos que no usa. |
| **D — Dependency Inversion** | Los casos de uso dependen de **abstracciones** del dominio (`PaymentGateway`, `UserRepository`, `EventPublisher`, `OutboxRepository`). Las concreciones (`SimulatedPaymentGateway`, `MongoUserRepository`, `RabbitMQEventPublisher`, `MongoOutboxRepository`) se inyectan desde `index.js`. |

**Ejemplo concreto — `ProcessPayment`** (`payments-service/src/application/use-cases/ProcessPayment.js`):

```
ProcessPayment depende de:
  ├── PaymentGateway       (puerto, en domain/services)
  ├── PaymentRepository    (puerto, en domain/repositories)
  ├── OrderClient          (puerto, en domain/services)
  └── OutboxRepository     (puerto, en domain/repositories)

index.js cablea:
  PaymentGateway     ←─ SimulatedPaymentGateway
  PaymentRepository  ←─ MongoPaymentRepository
  OrderClient        ←─ HttpOrderClient
  OutboxRepository   ←─ MongoOutboxRepository
```

Para testearlo no se necesita Mongo, ni HTTP, ni Rabbit: se inyectan mocks de los 4 puertos.

---

## 4. ¿Por qué Saga (coreografiada)?

**Problema:** una orden involucra a tres servicios — `orders` valida y persiste, `products` reserva stock, `payments` cobra. Cada uno tiene **su propia base de datos**. No hay transacción ACID que atraviese microservicios. Si:

- el cobro falla → el stock ya decrementado debe devolverse,
- el servicio de pagos cae justo después de cobrar → la orden no debe quedar para siempre en `pending`,

…necesitamos un mecanismo que mantenga consistencia **eventual** sin bloquear los servicios.

**Solución:** **saga coreografiada**. Cada servicio reacciona a eventos del bus y emite los suyos; no hay coordinador central.

### Patrón Outbox

El "talón de Aquiles" del modelo evento-driven es: ¿qué pasa si el servicio graba en su DB y el broker se cae antes de publicar? Pierde el evento → inconsistencia.

Solución: **el caso de uso escribe el evento en una colección `outboxevents` de su misma DB**. Un `OutboxRelay` (worker que se despierta cada segundo) lee filas con `publishedAt = null`, las publica a Rabbit y las marca. Si Rabbit está caído, las filas siguen ahí; el siguiente tick reintenta.

### Idempotencia

Rabbit puede redelivrar el mismo mensaje (si el consumidor crashea antes del ack). Cada consumidor (`orders`, `products`) mantiene una colección `processedevents` con índice único en `eventId`. Antes de procesar, intenta insertar; si falla por duplicado → ya procesado, ack y skip. Esto es crítico para `ReleaseStock`, que **no** es naturalmente idempotente (sumar stock dos veces rompe el inventario).

### Flujo completo

```
1. Cliente ──POST /api/orders──▶ orders
                                    │ (HTTP síncrono — camino feliz)
                                    ▼
                                  products.reduceStock
                                    │
                                  Order(status=pending) guardada

2. Cliente ──POST /api/payments──▶ payments
                                    │
                                  charge() en SimulatedPaymentGateway
                                    │
                                  Payment guardado + OutboxEvent escrito
                                    │
                                  OutboxRelay (poll 1s)
                                    │
                              ┌─────────────────┐
                              │   RabbitMQ      │
                              │ exchange:       │
                              │ domain-events   │
                              │ (topic, durable)│
                              └─────────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            │                                               │
   payment.approved                                  payment.failed
            │                                               │
            ▼                                               ▼
     orders.payment-events                          orders.payment-events
            │                                               │
       ConfirmOrder                                    CancelOrder
       (status=confirmed)                              (status=cancelled)
                                                           │
                                                  OutboxEvent(order.cancelled, items)
                                                           │
                                                      OutboxRelay
                                                           │
                                                           ▼
                                                  products.order-events
                                                           │
                                                      ReleaseStock  ← compensación
                                                      (stock += quantity)
```

| Routing key         | Productor | Consumidor | Payload |
|---------------------|-----------|------------|---------|
| `payment.approved`  | payments  | orders     | `{orderId, paymentId, userId, amount, transactionId}` |
| `payment.failed`    | payments  | orders     | `{orderId, paymentId, userId, amount, reason}` |
| `order.cancelled`   | orders    | products   | `{orderId, userId, reason, items:[{productId, quantity}]}` |

---

## 5. Microservicios

Diagrama:

```
┌─────────────┐       ┌──────────────┐       ┌──────────────────┐
│  Next.js    │──────▶│ api-gateway  │──────▶│ auth-service     │──▶ mongo-auth
│ (frontend)  │       │  :8080       │       │ :3001            │
│  :3000      │       │              │       ├──────────────────┤
└─────────────┘       │              │──────▶│ users-service    │──▶ mongo-users
                      │              │       │ :3002            │
                      │              │       ├──────────────────┤
                      │              │──────▶│ products-service │──▶ mongo-products ◀─┐
                      │              │       │ :3003            │                     │
                      │              │       ├──────────────────┤                     │
                      │              │──────▶│ orders-service   │──▶ mongo-orders     │ eventos
                      │              │       │ :3004            │                     │
                      │              │       ├──────────────────┤                     │
                      │              │──────▶│ payments-service │──▶ mongo-payments   │
                      └──────────────┘       │ :3005            │                     │
                                             └──────────────────┘                     │
                                                       │                              │
                                                       └────▶ RabbitMQ ───────────────┘
                                                              :5672 (AMQP)
                                                              :15672 (UI)
```

### 5.1 `api-gateway` (puerto 8080)

**Qué hace:** único punto de entrada HTTP. Reescribe `/api/<servicio>/*` y proxy-pasa al microservicio correspondiente vía `http-proxy-middleware`. No tiene lógica de negocio, no toca Mongo, no autentica — los servicios de dominio validan el JWT.

**Por qué existe:** evita que el frontend conozca las URLs/puertos internos y permite cambiar el despliegue de un servicio sin tocar el cliente.

### 5.2 `auth-service` (puerto 3001 — DB `mongo-auth`)

**Responsabilidad:** registro, login y verificación de JWT. Valida que el correo termine en `@correounivalle.edu.co` o `@univalle.edu.co` (regla de dominio en `User.ts`).

**Casos de uso:** `RegisterUser`, `LoginUser`, `VerifyToken`, `PromoteUser`.
**Adaptadores:** `MongoUserRepository`, `BcryptHasher`, `JwtTokenService`.
**Endpoints (vía gateway):**
- `POST /api/auth/register` — crea usuario + retorna JWT
- `POST /api/auth/login` — valida credenciales + retorna JWT
- `POST /api/auth/verify` — verifica token
- `POST /api/auth/promote` — eleva un usuario a `admin` (requiere `secret` del env `ADMIN_PROMOTE_SECRET`)

### 5.3 `users-service` (puerto 3002 — DB `mongo-users`)

**Responsabilidad:** CRUD de usuarios y promoción a admin con secreto compartido.

**Casos de uso:** `ListUsers`, `GetUser`, `UpdateUser`, `DeleteUser`, `PromoteToAdmin`.
**Endpoints:**
- `GET/PUT/DELETE /api/users/:id`
- `GET /api/users`
- `POST /api/admin/promote` (requiere `secret` en el body)

### 5.4 `products-service` (puerto 3003 — DB `mongo-products`)

**Responsabilidad:** catálogo, stock y compensación de stock cuando una orden se cancela.

**Casos de uso:** `ListProducts`, `GetProduct`, `CreateProduct`, `UpdateProduct`, `ArchiveProduct`, `ReduceStock`, `ReleaseStock`, `SeedProducts`, `HandleOrderCancelled`.
**Adaptadores:** `MongoProductRepository`, `MongoProcessedEventStore`, `RabbitMQEventSubscriber` (queue `products.order-events`), `multer` (disk storage en `/app/uploads`).
**Endpoints:**
- `GET /api/products` (público)
- `GET /api/products/:id` (público)
- `POST /api/products` (admin)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin — archive)
- `POST /api/products/seed` (público — seed inicial)
- `POST /api/products/:id/reduce-stock` (interno, llamado por `orders` vía HTTP)
- `POST /api/products/upload` (admin) — recibe multipart/form-data con `file`, guarda PNG/JPG/WEBP (máx 5 MB) en el volumen `products-uploads` y devuelve `{ url, storageKey }`
- `GET /api/products/uploads/:filename` (público) — sirve los archivos subidos

**Suscripción a eventos:** `order.cancelled` → `HandleOrderCancelled` → por cada item: `ReleaseStock`.

**Persistencia de imágenes:** las imágenes subidas viven en el volumen Docker `products-uploads` (montado en `/app/uploads`). Sobreviven a `docker compose down/up` y rebuilds del servicio. El campo `image` en Mongo guarda `{ url, storageKey }`.

### 5.5 `orders-service` (puerto 3004 — DB `mongo-orders`)

**Responsabilidad:** creación de órdenes con validación de stock + reacción a eventos de pago para confirmar/cancelar.

**Casos de uso:** `CreateOrder`, `ListOrders`, `GetOrder`, `UpdateOrderStatus`, `ConfirmOrder`, `CancelOrder`, `GetMetrics`, `HandlePaymentApproved`, `HandlePaymentFailed`.
**Adaptadores:** `MongoOrderRepository`, `MongoOutboxRepository`, `MongoProcessedEventStore`, `HttpProductCatalog`, `RabbitMQEventPublisher` + `RabbitMQEventSubscriber` (queue `orders.payment-events`), `OutboxRelay`.
**Endpoints:**
- `GET /api/orders` (user) / `GET /api/orders?scope=all` (admin)
- `GET /api/orders/:id` (owner o admin)
- `POST /api/orders` (user)
- `PUT /api/orders/:id` (admin — cambiar status)
- `GET /api/admin/metrics` (admin)

**Saga:** publica `order.cancelled` cuando un pago falla; consume `payment.approved` y `payment.failed`.

### 5.6 `payments-service` (puerto 3005 — DB `mongo-payments`)

**Responsabilidad:** procesar cobros y emitir el resultado al bus de eventos.

**Casos de uso:** `ProcessPayment`, `ListPaymentsByOrder`.
**Adaptadores:** `MongoPaymentRepository`, `MongoOutboxRepository`, `SimulatedPaymentGateway` (regla: último dígito **par** → aprobado), `HttpOrderClient` (solo para leer el total de la orden), `RabbitMQEventPublisher`, `OutboxRelay`.
**Endpoints:**
- `POST /api/payments` (user)
- `GET /api/payments/order/:orderId` (user)

**Saga:** publica `payment.approved` o `payment.failed` vía outbox.

---

## 6. Comunicación entre servicios

| Tipo | Cuándo se usa | Ejemplo |
|------|----------------|---------|
| **HTTP síncrono** | Lecturas y operaciones en el camino feliz que necesitan respuesta inmediata | `orders → products` (`reduceStock`, `getProduct`); `payments → orders` (`getOrder` para leer total) |
| **Eventos asíncronos (RabbitMQ)** | Coordinación de estado y compensaciones | `payments → orders` (`payment.approved`/`failed`); `orders → products` (`order.cancelled`) |

**Regla:** las **lecturas** y la **reserva inicial de stock** son síncronas (camino feliz, baja latencia). Las **transiciones de estado** y las **compensaciones** son asíncronas (resiliencia, desacoplamiento).

---

## 7. Cómo correr

### Requisitos
- **Docker** + **Docker Compose**
- **Node.js** ≥ 20 (solo para el frontend)

### Backend (microservicios)

```bash
cd "ian actualizacion/microservices"
docker compose up --build
```

Esto levanta: `api-gateway`, los 5 microservicios, las 5 instancias de Mongo y RabbitMQ. Logs útiles:
- Gateway: http://localhost:8080/health
- RabbitMQ UI: http://localhost:15672 (`guest`/`guest`) — mirá el exchange `domain-events` y las queues `orders.payment-events`, `products.order-events`.

### Frontend (Next.js)

En otra terminal:

```bash
cd "ian actualizacion"
npm install
npm run dev
```

Frontend en http://localhost:3000. `next.config.ts` redirige todo `/api/*` al gateway en `:8080`.

### Seed de catálogo

```bash
curl -X POST http://localhost:8080/api/products/seed
```

### Promover admin

Hay dos endpoints disponibles (mismo `secret`):

```bash
# Recomendado — auth-service (caso de uso PromoteUser)
curl -X POST http://localhost:8080/api/auth/promote \
  -H "Content-Type: application/json" \
  -d '{"secret":"univalle-admin-seed","email":"tu@correounivalle.edu.co"}'

# Alternativo — users-service (legacy)
curl -X POST http://localhost:8080/api/admin/promote \
  -H "Content-Type: application/json" \
  -d '{"secret":"univalle-admin-seed","email":"tu@correounivalle.edu.co"}'
```

### Subir imagen de producto desde el panel admin

En `http://localhost:3000/admin/products` el formulario incluye un selector de archivo PNG/JPG/WEBP (máx 5 MB). El flujo es:

1. Seleccionar archivo → el frontend hace `POST /api/products/upload` con `multipart/form-data` y el `Bearer` del admin.
2. La respuesta `{ url, storageKey }` se guarda en `form.image` y aparece preview.
3. Al enviar el formulario se crea/actualiza el producto con ese `image`.

El campo de URL externa sigue disponible debajo del file picker como fallback.

### Verificar la saga end-to-end

1. Registrate, agregá productos al carrito y andá a checkout.
2. **Camino feliz** — pagá con tarjeta cuyo **último dígito sea par** (ej. `4111 1111 1111 1112`). En la UI de Rabbit verás un mensaje en `domain-events` con routing key `payment.approved`. La orden pasa a `confirmed`.
3. **Camino compensación** — pagá con tarjeta de **último dígito impar** (ej. `4111 1111 1111 1111`). Se publica `payment.failed` → `orders` cancela la orden y publica `order.cancelled` → `products` ejecuta `ReleaseStock` y el inventario vuelve a su valor original (verificable con `GET /api/products/:id`).

---

## 8. Contrato de respuesta API

Todos los endpoints retornan:

```json
{ "success": true,  "data":  { ... } }
{ "success": false, "error": "mensaje legible" }
```

Los endpoints protegidos requieren `Authorization: Bearer <JWT>`, obtenido vía `POST /api/auth/login`.

---

## 9. Estructura del repositorio

```
ian actualizacion/
├── app/                      # Frontend Next.js (UI únicamente)
│   ├── components/  lib/
│   ├── products/  cart/  checkout/  orders/  payment/
│   ├── login/  register/  dashboard/  admin/
│   └── layout.tsx  page.tsx  globals.css
├── microservices/            # Backend
│   ├── api-gateway/
│   ├── auth-service/
│   ├── users-service/
│   ├── products-service/
│   ├── orders-service/
│   ├── payments-service/
│   └── docker-compose.yml
├── next.config.ts            # Rewrites /api/* → gateway:8080
├── ARQUITECTURA-MICROSERVICIOS.md  # Detalle técnico fino
├── MIGRATION_GUIDE.md        # Plan histórico de la migración
└── README.md                 # Este archivo
```

---

## 10. Cambios recientes

**Backend**

- `auth-service`: nuevo caso de uso `PromoteUser` y endpoint `POST /api/auth/promote`. Se añadió `updateRole(email, role)` al puerto `UserRepository` y su implementación en `MongoUserRepository`. El secreto se lee del env `ADMIN_PROMOTE_SECRET`.
- `products-service`: integración de **multer** para subir imágenes de producto. Endpoint `POST /api/products/upload` (admin) y servicio estático en `GET /api/products/uploads/:filename`. Volumen Docker `products-uploads` montado en `/app/uploads` para persistencia entre rebuilds.

**Frontend**

- **Hero**: nueva imagen de campus, gradiente lateral solo detrás del texto (resto de la foto sin overlay), texto enrasado con el logo del navbar; arreglo de la franja blanca residual debajo del hero (`calc(100vh - 65px)` en vez de `72px`).
- **Categorías**: imágenes locales (`univalle-ropa.png`, `univalle-tecnologia.png`, `univalle-libros.png`), aspect square, hover con scale + shadow + lift, tipografía premium.
- **Propuesta de valor**: cards con borde sutil, iconos en círculo con tinte rojo institucional, hover con elevación.
- **CTA banner**: gradiente premium de tres capas, halo blanco difuso, sombra coloreada, botones rounded-full.
- **Footer**: compactado (padding y line-height reducidos), corrección de copy ("e-learning" → "e-commerce"), columna "Programas" → "Catálogo" con categorías reales (Ropa, Tecnología, Libros y papelería).
- **Login / Register**: nuevas imágenes de fondo (`univalle_login.png`, `univalle-registro.png`).
- **Admin / products**: el formulario ahora incluye `<input type="file">` con preview, sube al endpoint del backend y guarda `form.image = { url, storageKey }`. El campo de URL externa queda como fallback.

---

## Licencia

Proyecto académico — Universidad del Valle, Desarrollo de Software III.
