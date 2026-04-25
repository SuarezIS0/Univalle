<div align="center">

# Univalle Shop

**Plataforma de e-commerce institucional construida sobre una arquitectura hexagonal de microservicios, comunicación asíncrona vía RabbitMQ y un patrón Saga coreografiado para garantizar consistencia eventual entre dominios desacoplados.**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20--alpine-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3--management-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

[![Architecture](https://img.shields.io/badge/Architecture-Hexagonal-5C2D91?style=flat-square)](#-arquitectura-y-patrones)
[![Pattern](https://img.shields.io/badge/Pattern-Saga_Choreography-0066CC?style=flat-square)](#-patrón-saga-coreografiado)
[![Principles](https://img.shields.io/badge/Principles-SOLID-2E7D32?style=flat-square)](#-principios-solid)
[![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)](#)
[![License](https://img.shields.io/badge/License-Academic-lightgrey?style=flat-square)](#-licencia)

</div>

---

## Tabla de Contenidos

1. [Visión General](#-visión-general)
2. [Stack Tecnológico](#-stack-tecnológico)
3. [Arquitectura y Patrones](#-arquitectura-y-patrones)
   - [¿Por qué Microservicios y no Monolito Modular?](#-por-qué-microservicios-y-no-monolito-modular)
   - [Arquitectura Hexagonal](#-arquitectura-hexagonal-ports--adapters)
   - [Principios SOLID](#-principios-solid)
   - [Patrón Saga Coreografiado](#-patrón-saga-coreografiado)
   - [Outbox Pattern e Idempotencia](#-outbox-pattern-e-idempotencia)
4. [Infraestructura](#-infraestructura)
5. [Microservicios](#-microservicios)
6. [Especificaciones de E-commerce](#-especificaciones-de-e-commerce)
   - [Gestión de Inventario](#gestión-de-inventario)
   - [Pasarela de Pagos](#pasarela-de-pagos)
   - [Flujo de Usuarios](#flujo-de-usuarios)
7. [Guía de Inicio Rápido](#-guía-de-inicio-rápido)
   - [Requisitos Previos](#requisitos-previos)
   - [Instalación](#instalación)
   - [Variables de Entorno](#variables-de-entorno)
   - [Ejecución en Desarrollo](#ejecución-en-desarrollo)
   - [Ejecución en Producción](#ejecución-en-producción-docker)
8. [Estructura de Directorios](#-estructura-de-directorios)
9. [Contrato de API](#-contrato-de-api)
10. [Verificación End-to-End](#-verificación-end-to-end-de-la-saga)
11. [Licencia](#-licencia)

---

## 🎯 Visión General

**Univalle Shop** es una plataforma de e-commerce diseñada para la comunidad de la **Universidad del Valle**. Restringe el registro a correos institucionales (`@correounivalle.edu.co` / `@univalle.edu.co`), expone catálogo público, gestiona carrito y checkout, y simula el cobro con tarjeta a través de una pasarela inyectable.

El sistema está dividido en dos planos:

- **Frontend** — Aplicación **Next.js 16** con App Router que consume exclusivamente el `api-gateway`. Reescribe `/api/*` al gateway y desconoce las URLs internas de los servicios de dominio.
- **Backend** — Cinco microservicios **Node.js + Express** containerizados, cada uno con su propia base de datos **MongoDB**, comunicándose mediante HTTP síncrono en el camino feliz y eventos asíncronos sobre **RabbitMQ** para coordinación y compensaciones.

> Para el detalle técnico fino (diagramas de exchanges, queues, payloads y eventos) consulta [`ARQUITECTURA-MICROSERVICIOS.md`](desarrolloIII-main/ian%20actualizacion/ARQUITECTURA-MICROSERVICIOS.md). Para el plan histórico de migración del monolito ver [`MIGRATION_GUIDE.md`](desarrolloIII-main/ian%20actualizacion/MIGRATION_GUIDE.md).

---

## 🧱 Stack Tecnológico

### Frontend

| Capa | Tecnología | Versión | Ubicación |
|------|-----------|---------|-----------|
| Framework | **Next.js (App Router)** | `16.2.0` | [app/](desarrolloIII-main/ian%20actualizacion/app/) |
| UI | **React** | `19.2.4` | [app/components/](desarrolloIII-main/ian%20actualizacion/app/components/) |
| Lenguaje | **TypeScript** | `^5` | [tsconfig.json](desarrolloIII-main/ian%20actualizacion/tsconfig.json) |
| Estilos | **Tailwind CSS** | `^4` | [app/globals.css](desarrolloIII-main/ian%20actualizacion/app/globals.css) |
| Build/Lint | **Turbopack · ESLint 9** | — | [next.config.ts](desarrolloIII-main/ian%20actualizacion/next.config.ts) |

### Backend

| Capa | Tecnología | Versión | Dónde vive |
|------|-----------|---------|------------|
| Runtime | **Node.js (alpine)** | `20-alpine` | `microservices/*/Dockerfile` |
| Lenguaje | **JavaScript (CommonJS)** | ES2022 | `microservices/*/src/` |
| HTTP | **Express** | `^4.19` | `interfaces/http/` |
| API Gateway | **http-proxy-middleware** | — | [microservices/api-gateway/](desarrolloIII-main/ian%20actualizacion/microservices/api-gateway/) |
| Persistencia | **MongoDB + Mongoose** | `7` / `^8.5` | `infrastructure/persistence/` |
| Mensajería | **RabbitMQ + amqplib** | `3-management` / `^0.10` | `infrastructure/messaging/` |
| Seguridad | **JWT + bcryptjs** | `^9.0` / `^3.0` | [auth-service/](desarrolloIII-main/ian%20actualizacion/microservices/auth-service/) |
| Orquestación | **Docker · Docker Compose** | — | [microservices/docker-compose.yml](desarrolloIII-main/ian%20actualizacion/microservices/docker-compose.yml) |

---

## 🏛️ Arquitectura y Patrones

### 🧬 ¿Por qué Microservicios y no Monolito Modular?

El sistema está implementado en una **arquitectura de microservicios** plena. No se trata de un monolito modular con carpetas separadas: cada bounded context (`auth`, `users`, `products`, `orders`, `payments`) es un **proceso independiente, con su propio ciclo de despliegue, su propia base de datos y comunicación exclusivamente sobre red**. La taxonomía completa del sistema es:

> **Microservicios** (a nivel de sistema) **+ Hexagonal** (a nivel de cada servicio) **+ Saga coreografiada** (a nivel de coordinación entre servicios).

#### Criterios verificables en este repositorio

| Criterio | Monolito Modular | Microservicios | Estado real del proyecto |
|----------|------------------|----------------|--------------------------|
| **Despliegue** | Un único artefacto | Un artefacto por servicio | ✅ 5 `Dockerfile` + 5 `package.json` independientes |
| **Proceso** | Un solo proceso | Un proceso por servicio | ✅ Cada servicio escucha en su propio puerto (`3001`–`3005`) |
| **Base de datos** | DB compartida | DB por servicio | ✅ 5 instancias Mongo aisladas (`mongo-auth`, `mongo-users`, `mongo-products`, `mongo-orders`, `mongo-payments`) |
| **Comunicación** | Llamadas en memoria | Red (HTTP / eventos) | ✅ HTTP síncrono vía `api-gateway` + eventos asíncronos sobre RabbitMQ |
| **Acoplamiento de datos** | Joins SQL / refs directas | Cada servicio dueño de su modelo | ✅ Sin acceso cruzado a colecciones — solo a través de adaptadores HTTP o eventos |
| **Coordinación transaccional** | Transacciones ACID | Saga / consistencia eventual | ✅ Saga coreografiada + Outbox + idempotencia con `processedevents` |
| **Stack tecnológico** | Único | Independiente por servicio | ✅ Posible heterogeneidad (cada servicio puede evolucionar su versión de Node, Mongoose, etc.) |
| **Escalado** | Vertical del binario completo | Horizontal por servicio | ✅ `docker compose up --scale products-service=N` |

#### Por qué **no** es un monolito modular

Un monolito modular comparte **proceso y base de datos**, separando únicamente *carpetas* dentro del mismo deployable. Aquí ocurre lo contrario en cada límite que importa:

- **Aislamiento de datos.** `orders-service` **no puede** leer la colección `products` directamente. Para reservar stock invoca `POST /api/products/:id/reduce-stock` por HTTP a otro contenedor — pasando por la red, con su propio timeout, sus propios códigos de error y su propio adaptador (`HttpProductCatalog`).
- **Compensación por eventos, no por funciones.** Cuando un pago falla, `orders-service` no llama una función de `products` — publica el evento `order.cancelled` en el exchange `domain-events` de RabbitMQ. `products-service` lo consume desde su queue `products.order-events` y ejecuta `ReleaseStock`. Ambos servicios pueden estar en máquinas distintas y en versiones distintas.
- **Outbox + idempotencia.** Cada servicio mantiene sus propias colecciones `outboxevents` y `processedevents`. **Estos mecanismos solo tienen sentido cuando hay fronteras de red y bases de datos independientes** — en un monolito serían innecesarios porque una transacción ACID resolvería el problema.
- **Failure isolation.** Si `payments-service` cae, `auth`, `users` y `products` siguen funcionando. El frontend continúa permitiendo navegar el catálogo y autenticarse. En un monolito, una excepción no manejada tumba el proceso completo.
- **Composition root por servicio.** Cada microservicio tiene su propio `index.js` que cablea sus adaptadores. No existe un único entrypoint que conozca todas las dependencias del sistema.

#### Beneficios obtenidos en este caso de uso

| Beneficio | Cómo se materializa aquí |
|-----------|--------------------------|
| **Desacoplamiento de dominio** | Cambiar la lógica de inventario no requiere redeployar `auth` ni `payments`. |
| **Sustitución tecnológica progresiva** | Reemplazar `SimulatedPaymentGateway` por Stripe afecta solo a `payments-service`. |
| **Escalado dirigido** | El catálogo (`products-service`) puede escalarse de forma independiente del servicio de auth, que tiene un patrón de carga radicalmente distinto. |
| **Resiliencia ante fallos parciales** | Una caída de RabbitMQ no pierde eventos: el `OutboxRelay` reintenta hasta que el broker vuelve. |
| **Equipos autónomos** | Cada servicio puede ser owned por un equipo distinto sin coordinación centralizada de despliegues. |

#### Costo asumido (trade-offs honestos)

Microservicios no es gratis. El proyecto paga conscientemente:

- **Complejidad operacional** — Docker Compose orquesta 12 contenedores (5 servicios, 5 mongos, gateway, broker).
- **Consistencia eventual** — La orden no queda `confirmed` instantáneamente; depende del ciclo del `OutboxRelay` (poll cada 1s).
- **Observabilidad distribuida** — Trazar una orden requiere correlacionar logs de `orders`, `payments` y `products`.
- **Latencia adicional** — Cada llamada `orders → products` cruza la red en lugar de ser una invocación en memoria.

Estos costos están justificados por el objetivo académico del proyecto: **practicar de forma realista los patrones de coordinación entre servicios distribuidos** (Saga, Outbox, idempotencia, gateway, mensajería durable) que un monolito modular no exigiría.

---

### 🔷 Arquitectura Hexagonal (Ports & Adapters)

Cada microservicio implementa de forma estricta la separación entre **dominio**, **aplicación**, **infraestructura** e **interfaces**. El núcleo de negocio define **puertos** (interfaces abstractas) y la infraestructura provee **adaptadores** (implementaciones concretas). El composition root (`index.js` de cada servicio) es el único lugar que conoce las concreciones.

```
┌──────────────────────────────────────────────────────────────────────┐
│                         service/src/                                 │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  domain/  ← Núcleo. Cero dependencias externas.                │  │
│  │  ├── entities/      User · Product · Order · Payment           │  │
│  │  ├── repositories/  Puertos de salida (UserRepository, ...)    │  │
│  │  ├── services/      Puertos de salida (Hasher, PaymentGateway) │  │
│  │  └── events/        EventPublisher                             │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                              ▲                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  application/  ← Orquestación pura.                            │  │
│  │  └── use-cases/  CreateOrder · ProcessPayment · ReleaseStock   │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                              ▲                                       │
│  ┌──────────────────────────────┐  ┌────────────────────────────┐    │
│  │  infrastructure/             │  │  interfaces/http/          │    │
│  │  ├── persistence/  (Mongo)   │  │  ├── controllers           │    │
│  │  ├── messaging/    (Rabbit)  │  │  ├── middlewares           │    │
│  │  └── services/     (Bcrypt)  │  │  └── routes.js             │    │
│  └──────────────────────────────┘  └────────────────────────────┘    │
│                                                                      │
│  index.js  ← Composition Root: instancia adaptadores y los inyecta   │
└──────────────────────────────────────────────────────────────────────┘
```

**Regla de dependencia.** El flujo es unidireccional hacia el dominio:

```
interfaces      ──▶ application ──▶ domain
infrastructure  ──▶                  domain
```

`domain/` no importa de `application/`, `infrastructure/` ni `interfaces/`. Esto permite probar cualquier caso de uso inyectando mocks de los puertos — **sin Mongo, sin red, sin Rabbit**.

---

### 🧭 Principios SOLID

| Principio | Manifestación en el código |
|-----------|---------------------------|
| **S** — Single Responsibility | 1 archivo = 1 caso de uso (`RegisterUser`, `CreateOrder`, `ProcessPayment`, `CancelOrder`, `ReleaseStock`). Las entidades exponen únicamente reglas de su propio dominio (`Order.confirm()`, `Product.reduceStock()`). |
| **O** — Open/Closed | Sustituir el simulador por Stripe = crear `StripePaymentGateway extends PaymentGateway`. Cero cambios en `ProcessPayment.js`. Cambiar Rabbit por Kafka = escribir `KafkaEventPublisher` y reemplazar 1 línea en `index.js`. |
| **L** — Liskov Substitution | Cualquier `PaymentGateway`, `UserRepository`, `OutboxRepository` o `EventPublisher` puede sustituirse sin romper consumidores. |
| **I** — Interface Segregation | Puertos pequeños y enfocados: `Hasher` (hash/compare), `TokenService` (verify/generate), `OrderClient` (getOrder), `ProcessedEventStore` (markIfNew). |
| **D** — Dependency Inversion | Los casos de uso dependen de abstracciones del dominio. Las concreciones se inyectan desde `index.js`, nunca se instancian dentro de la lógica de negocio. |

**Ejemplo concreto** — `payments-service/src/application/use-cases/ProcessPayment.js`:

```text
ProcessPayment depende de:
  ├── PaymentGateway       (puerto, domain/services)
  ├── PaymentRepository    (puerto, domain/repositories)
  ├── OrderClient          (puerto, domain/services)
  └── OutboxRepository     (puerto, domain/repositories)

index.js cablea las concreciones:
  PaymentGateway     ◀── SimulatedPaymentGateway
  PaymentRepository  ◀── MongoPaymentRepository
  OrderClient        ◀── HttpOrderClient
  OutboxRepository   ◀── MongoOutboxRepository
```

---

### 🪢 Patrón Saga Coreografiado

Una orden involucra a tres servicios — `orders` valida y persiste, `products` reserva stock, `payments` cobra. **No hay transacción ACID que atraviese microservicios.** Si el cobro falla, el stock decrementado debe devolverse; si `payments` cae después de cobrar, la orden no debe quedar eternamente en `pending`.

La solución es una **saga coreografiada**: cada servicio reacciona a eventos del bus y emite los suyos; no existe un coordinador central. El estado se reconcilia mediante **consistencia eventual**.

```
1. POST /api/orders ──▶ orders ──HTTP──▶ products.reduceStock
                          │
                       Order(status=pending)
                          │
2. POST /api/payments ──▶ payments
                          │
                       SimulatedPaymentGateway.charge()
                          │
                       Payment + OutboxEvent
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
        ┌─────────────────┴─────────────────┐
        │                                   │
 payment.approved                    payment.failed
        │                                   │
        ▼                                   ▼
  ConfirmOrder                          CancelOrder
  (status=confirmed)                    (status=cancelled)
                                            │
                                       OutboxEvent(order.cancelled)
                                            │
                                        OutboxRelay
                                            │
                                            ▼
                                     ReleaseStock  ◀── compensación
                                     (stock += quantity)
```

**Routing keys del bus de eventos:**

| Routing key         | Productor  | Consumidor | Payload |
|--------------------|------------|------------|---------|
| `payment.approved` | `payments` | `orders`   | `{orderId, paymentId, userId, amount, transactionId}` |
| `payment.failed`   | `payments` | `orders`   | `{orderId, paymentId, userId, amount, reason}` |
| `order.cancelled`  | `orders`   | `products` | `{orderId, userId, reason, items:[{productId, quantity}]}` |

---

### 📦 Outbox Pattern e Idempotencia

**Problema 1: pérdida de eventos.** Si un servicio escribe en su DB y RabbitMQ se cae antes de publicar, el evento se pierde y se rompe la consistencia.

**Solución:** el caso de uso escribe el evento en una colección `outboxevents` **dentro de la misma transacción** que el cambio de estado. Un `OutboxRelay` (worker que despierta cada segundo) lee filas con `publishedAt = null`, las publica al broker y las marca como entregadas. Si Rabbit está caído, las filas permanecen — el siguiente tick reintenta.

**Problema 2: redelivery.** Rabbit puede reentregar el mismo mensaje si el consumidor crashea antes del `ack`. Procesar dos veces `ReleaseStock` rompe el inventario (sumaría stock al doble).

**Solución:** cada consumidor mantiene una colección `processedevents` con índice único en `eventId`. Antes de procesar, intenta insertar; si falla por duplicado → ya fue procesado, `ack` y skip.

---

## 🐳 Infraestructura

Toda la plataforma se orquesta vía **Docker Compose**. El archivo [`microservices/docker-compose.yml`](desarrolloIII-main/ian%20actualizacion/microservices/docker-compose.yml) define los siguientes servicios sobre la red `ecommerce-shared-net`:

| Contenedor | Imagen / Build | Puerto | Volumen |
|------------|---------------|--------|---------|
| `api-gateway` | `./api-gateway` | `8080:8080` | — |
| `auth-service` | `./auth-service` | `3001:3001` | — |
| `users-service` | `./users-service` | `3002:3002` | — |
| `products-service` | `./products-service` | `3003:3003` | `products-uploads:/app/uploads` |
| `orders-service` | `./orders-service` | `3004:3004` | — |
| `payments-service` | `./payments-service` | `3005:3005` | — |
| `mongo-auth` | `mongo:7` | interno | `auth-data` |
| `mongo-users` | `mongo:7` | interno | `users-data` |
| `mongo-products` | `mongo:7` | interno | `products-data` |
| `mongo-orders` | `mongo:7` | interno | `orders-data` |
| `mongo-payments` | `mongo:7` | interno | `payments-data` |
| `rabbitmq` | `rabbitmq:3-management` | `5672` AMQP · `15672` UI | — |

El frontend Next.js cuenta con su propio [`docker-compose.yml`](desarrolloIII-main/ian%20actualizacion/docker-compose.yml) y un [`Dockerfile`](desarrolloIII-main/ian%20actualizacion/Dockerfile) multistage basado en `node:20-alpine`, conectándose a la red externa `ecommerce-shared-net` para alcanzar el `api-gateway`.

---

## 🧩 Microservicios

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

### `api-gateway` · puerto **8080**
Punto único de entrada HTTP. Reescribe `/api/<servicio>/*` y proxy-pasa al microservicio correspondiente vía `http-proxy-middleware`. **No tiene lógica de negocio**, no toca Mongo y no autentica — los servicios de dominio validan el JWT.

### `auth-service` · puerto **3001** · DB `mongo-auth`
Registro, login y verificación de JWT. Valida que el correo termine en `@correounivalle.edu.co` o `@univalle.edu.co` (regla de dominio en `User.ts`).
- `POST /api/auth/register` — crea usuario y retorna JWT
- `POST /api/auth/login` — valida credenciales y retorna JWT
- `POST /api/auth/verify` — verifica token

### `users-service` · puerto **3002** · DB `mongo-users`
CRUD de usuarios y promoción a administrador con secreto compartido.
- `GET /api/users` · `GET/PUT/DELETE /api/users/:id`
- `POST /api/admin/promote` — requiere `secret` en el body

### `products-service` · puerto **3003** · DB `mongo-products`
Catálogo, gestión de stock, **upload de imágenes** (volumen `products-uploads`) y compensación de stock cuando una orden se cancela.
- `GET /api/products` · `GET /api/products/:id` (públicos)
- `POST/PUT/DELETE /api/products[/:id]` (admin)
- `POST /api/products/seed` — seed inicial
- `POST /api/products/:id/reduce-stock` — interno
- **Suscripción:** `order.cancelled` → `HandleOrderCancelled` → `ReleaseStock`

### `orders-service` · puerto **3004** · DB `mongo-orders`
Creación de órdenes con validación síncrona de stock + reacción a eventos de pago para confirmar/cancelar.
- `GET /api/orders` (user) · `GET /api/orders?scope=all` (admin)
- `GET /api/orders/:id` · `POST /api/orders` · `PUT /api/orders/:id`
- `GET /api/admin/metrics`
- **Saga:** consume `payment.approved`/`payment.failed`, publica `order.cancelled`

### `payments-service` · puerto **3005** · DB `mongo-payments`
Procesar cobros y emitir el resultado al bus de eventos.
- `POST /api/payments`
- `GET /api/payments/order/:orderId`
- **Pasarela simulada:** último dígito de la tarjeta **par → aprobado · impar → fallido**
- **Saga:** publica `payment.approved` o `payment.failed` vía outbox

---

## 🛒 Especificaciones de E-commerce

### Gestión de Inventario

- Cada producto tiene un campo `stock` numérico, gestionado exclusivamente por `products-service`.
- **Reserva (camino feliz):** `orders-service` invoca `POST /api/products/:id/reduce-stock` de forma **síncrona** durante `CreateOrder`. Si el stock es insuficiente, la orden se rechaza antes de persistirse.
- **Compensación:** ante un `payment.failed`, `orders-service` ejecuta `CancelOrder` y publica `order.cancelled` con la lista de items. `products-service` consume el evento y, por cada item, ejecuta el caso de uso `ReleaseStock` (idempotente vía `processedevents`).
- **Seed:** el endpoint `POST /api/products/seed` carga el catálogo inicial.
- **Imágenes:** `products-service` monta el volumen `products-uploads:/app/uploads` para almacenamiento local; configurable a Cloudinary vía `STORAGE_DRIVER`.

### Pasarela de Pagos

- Implementación inyectable a través del puerto `PaymentGateway` (`domain/services`).
- Adaptador por defecto: **`SimulatedPaymentGateway`**. Regla de simulación → si el último dígito del número de tarjeta es **par**, el cobro se aprueba; si es **impar**, se rechaza.
  - ✅ Ejemplo aprobado: `4111 1111 1111 1112`
  - ❌ Ejemplo rechazado: `4111 1111 1111 1111`
- El resultado se persiste en `payments` y se escribe en la `outboxevents` para publicación atómica en RabbitMQ.
- **Sustituir por una pasarela real (Stripe, Wompi, MercadoPago)** únicamente requiere implementar la interfaz `PaymentGateway` y registrarla en `index.js`. La lógica del caso de uso `ProcessPayment` permanece intacta (Open/Closed).

### Flujo de Usuarios

```
[Visitante] ──▶ /register ──▶ valida @correounivalle.edu.co ──▶ JWT
     │
     └─▶ /login ──▶ JWT (Bearer) ──▶ Authorization header
                                          │
                                          ▼
[Usuario]  ──▶ /products ──▶ /cart ──▶ /checkout ──▶ POST /api/orders
                                                          │
                                                  Order(status=pending)
                                                          │
                                          ──▶ /payment ──▶ POST /api/payments
                                                          │
                                                          ▼
                                               ✅ confirmed   ❌ cancelled
                                                          │
                                          ──▶ /orders ──▶ historial del usuario
                                          ──▶ /dashboard ──▶ resumen personal

[Admin]    ──▶ /admin ──▶ /admin/products · /admin/orders
            (promovido vía POST /api/admin/promote con ADMIN_PROMOTE_SECRET)
```

---

## 🚀 Guía de Inicio Rápido

### Requisitos Previos

| Herramienta | Versión mínima | Necesario para |
|-------------|----------------|----------------|
| **Docker** | `24.x` | Backend completo + Mongo + RabbitMQ |
| **Docker Compose** | `v2` | Orquestación |
| **Node.js** | `≥ 20` | Frontend (modo dev) |
| **npm** | `≥ 10` | Gestor de paquetes |
| **Git** | `≥ 2.x` | Clonar el repositorio |

### Instalación

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd "desarrolloIII-main (1)/desarrolloIII-main/ian actualizacion"

# 2. Instalar dependencias del frontend
npm install
```

### Variables de Entorno

Crea un archivo **`.env.local`** en la raíz de `ian actualizacion/`:

```bash
# --- Frontend → API Gateway ---
API_GATEWAY_URL=http://api-gateway:8080

# --- Imágenes del catálogo (products-service) ---
STORAGE_DRIVER=local           # local | cloudinary
# LOCAL_UPLOAD_DIR=            # default: <cwd>/public/uploads

# --- Cloudinary (opcional) ---
# CLOUDINARY_CLOUD_NAME=
# CLOUDINARY_UPLOAD_PRESET=
# CLOUDINARY_API_KEY=
# CLOUDINARY_API_SECRET=
# CLOUDINARY_FOLDER=univalle-shop
```

Las variables sensibles del backend ya están declaradas en [`microservices/docker-compose.yml`](desarrolloIII-main/ian%20actualizacion/microservices/docker-compose.yml):

| Variable | Servicio(s) | Default en compose |
|----------|-------------|-------------------|
| `MONGO_URI` | todos | `mongodb://mongo-<svc>:27017/<db>` |
| `JWT_SECRET` | auth, users, products, orders, payments | `supersecret-univalle-ecommerce-2026` |
| `ADMIN_PROMOTE_SECRET` | auth, users | `univalle-admin-seed` |
| `RABBITMQ_URL` | products, orders, payments | `amqp://guest:guest@rabbitmq:5672` |
| `PRODUCTS_URL` | orders | `http://products-service:3003` |
| `ORDERS_URL` | payments | `http://orders-service:3004` |
| `UPLOADS_DIR` | products | `/app/uploads` |

> ⚠️ **Producción**: rota `JWT_SECRET` y `ADMIN_PROMOTE_SECRET` y nunca los hardcodees en el repositorio.

### Ejecución en Desarrollo

**Terminal 1 — Backend completo:**

```bash
cd "desarrolloIII-main/ian actualizacion/microservices"
docker compose up --build
```

Esto levanta los 5 microservicios, las 5 instancias de MongoDB, el `api-gateway` y RabbitMQ.

**Health-checks útiles:**
- API Gateway → http://localhost:8080/health
- RabbitMQ Management UI → http://localhost:15672 (`guest` / `guest`)

**Terminal 2 — Frontend en modo desarrollo:**

```bash
cd "desarrolloIII-main/ian actualizacion"
npm run dev
```

Frontend disponible en **http://localhost:3000**. `next.config.ts` reescribe `/api/*` al gateway (`:8080`).

**Seed inicial de catálogo:**

```bash
curl -X POST http://localhost:8080/api/products/seed
```

**Promover un usuario a admin:**

```bash
curl -X POST http://localhost:8080/api/admin/promote \
  -H "Content-Type: application/json" \
  -d '{"secret":"univalle-admin-seed","email":"tu@correounivalle.edu.co"}'
```

### Ejecución en Producción (Docker)

**Build y arranque del frontend containerizado:**

```bash
cd "desarrolloIII-main/ian actualizacion"
docker compose up --build -d
```

Esto compila la imagen multistage definida en [`Dockerfile`](desarrolloIII-main/ian%20actualizacion/Dockerfile) (`npm ci` → `next build` → `npm start`) y la conecta a la red externa `ecommerce-shared-net` para alcanzar el `api-gateway`.

**Stack completo en producción:**

```bash
# 1. Levantar backend (crea la red ecommerce-shared-net)
cd microservices && docker compose up -d --build

# 2. Levantar frontend (se une a la red existente)
cd ..        && docker compose up -d --build
```

Comandos útiles:

```bash
docker compose ps              # estado de los contenedores
docker compose logs -f <svc>   # logs en tiempo real
docker compose down -v         # apaga y borra volúmenes (⚠️ pierde datos)
```

---

## 📂 Estructura de Directorios

```
desarrolloIII-main (1)/
├── README.md                              ← este archivo
├── package.json
├── package-lock.json
└── desarrolloIII-main/
    └── ian actualizacion/                 ← raíz del proyecto
        ├── .env.local
        ├── .gitignore
        ├── .dockerignore
        ├── AGENTS.md
        ├── ARQUITECTURA-MICROSERVICIOS.md
        ├── CLAUDE.md
        ├── MIGRATION_GUIDE.md
        ├── README.md
        ├── Dockerfile                     ← imagen del frontend
        ├── docker-compose.yml             ← compose del frontend
        ├── eslint.config.mjs
        ├── next.config.ts                 ← rewrites /api/* → gateway
        ├── next-env.d.ts
        ├── package.json
        ├── postcss.config.mjs
        ├── tsconfig.json
        │
        ├── app/                           ← Frontend Next.js (App Router)
        │   ├── admin/
        │   │   ├── orders/
        │   │   ├── products/
        │   │   └── page.tsx
        │   ├── cart/
        │   ├── checkout/
        │   ├── components/
        │   │   ├── Footer.tsx
        │   │   ├── Navbar.tsx
        │   │   ├── ProductCard.tsx
        │   │   └── Reveal.tsx
        │   ├── dashboard/
        │   │   └── page.tsx
        │   ├── lib/
        │   │   ├── api.ts
        │   │   └── cart.ts
        │   ├── login/
        │   ├── orders/
        │   ├── payment/
        │   ├── products/
        │   │   ├── [id]/
        │   │   └── page.tsx
        │   ├── register/
        │   ├── favicon.ico
        │   ├── globals.css
        │   ├── layout.tsx
        │   └── page.tsx
        │
        ├── public/                        ← assets estáticos
        │
        └── microservices/                 ← Backend (Node.js + Express)
            ├── README.md
            ├── docker-compose.yml         ← orquestación completa
            │
            ├── api-gateway/
            │   ├── Dockerfile
            │   ├── package.json
            │   └── src/
            │       └── index.js           ← proxy → servicios de dominio
            │
            ├── auth-service/              ← :3001 · DB mongo-auth
            │   ├── Dockerfile
            │   ├── package.json
            │   └── src/
            │       ├── domain/            ← User · UserRepository · Hasher · TokenService
            │       ├── application/use-cases/
            │       ├── infrastructure/    ← Mongo · Bcrypt · JWT
            │       ├── interfaces/http/
            │       └── index.js           ← composition root
            │
            ├── users-service/             ← :3002 · DB mongo-users
            │   └── src/
            │       ├── domain/  application/  infrastructure/  interfaces/
            │       └── index.js
            │
            ├── products-service/          ← :3003 · DB mongo-products
            │   └── src/
            │       ├── domain/
            │       │   ├── entities/      ← Product · ProcessedEvent
            │       │   ├── repositories/
            │       │   └── services/
            │       ├── application/use-cases/
            │       │   └── ReleaseStock · ReduceStock · HandleOrderCancelled · ...
            │       ├── infrastructure/
            │       │   ├── persistence/   ← MongoProductRepository · ProcessedEventStore
            │       │   ├── messaging/     ← RabbitMQEventSubscriber
            │       │   └── services/      ← LocalImageStorage · CloudinaryImageStorage
            │       ├── interfaces/http/
            │       └── index.js
            │
            ├── orders-service/            ← :3004 · DB mongo-orders
            │   └── src/
            │       ├── domain/
            │       │   ├── entities/      ← Order · OutboxEvent · ProcessedEvent
            │       │   ├── events/        ← EventPublisher (puerto)
            │       │   ├── repositories/
            │       │   └── services/      ← ProductCatalog (puerto)
            │       ├── application/use-cases/
            │       │   └── CreateOrder · ConfirmOrder · CancelOrder · HandlePaymentApproved · HandlePaymentFailed
            │       ├── infrastructure/
            │       │   ├── persistence/   ← MongoOrderRepository · OutboxRepository
            │       │   ├── messaging/     ← RabbitMQEventPublisher · Subscriber · OutboxRelay
            │       │   └── services/      ← HttpProductCatalog
            │       ├── interfaces/http/
            │       └── index.js
            │
            └── payments-service/          ← :3005 · DB mongo-payments
                └── src/
                    ├── domain/
                    │   ├── entities/      ← Payment · OutboxEvent
                    │   ├── events/
                    │   ├── repositories/
                    │   └── services/      ← PaymentGateway · OrderClient (puertos)
                    ├── application/use-cases/
                    │   └── ProcessPayment · ListPaymentsByOrder
                    ├── infrastructure/
                    │   ├── persistence/   ← MongoPaymentRepository · OutboxRepository
                    │   ├── messaging/     ← RabbitMQEventPublisher · OutboxRelay
                    │   └── services/      ← SimulatedPaymentGateway · HttpOrderClient
                    ├── interfaces/http/
                    └── index.js
```

---

## 📡 Contrato de API

Todos los endpoints retornan un sobre uniforme:

```json
{ "success": true,  "data":  { /* ... */ } }
{ "success": false, "error": "mensaje legible" }
```

Los endpoints protegidos requieren el header:

```http
Authorization: Bearer <JWT>
```

obtenido de `POST /api/auth/login` o `POST /api/auth/register`.

---

## 🔬 Verificación End-to-End de la Saga

1. Regístrate con un correo `@correounivalle.edu.co`, agrega productos al carrito y procede al checkout.
2. **Camino feliz** — paga con tarjeta cuyo último dígito sea **par** (ej. `4111 1111 1111 1112`).
   - En la UI de RabbitMQ verás el mensaje `payment.approved` en el exchange `domain-events`.
   - La orden transiciona a `confirmed`.
3. **Camino de compensación** — paga con tarjeta de último dígito **impar** (ej. `4111 1111 1111 1111`).
   - Se publica `payment.failed` → `orders` cancela la orden y publica `order.cancelled`.
   - `products` ejecuta `ReleaseStock` y el inventario vuelve a su valor original.
   - Verifícalo con `GET /api/products/:id`.

---

## 📜 Licencia

Proyecto académico desarrollado para la asignatura **Desarrollo de Software III** — **Universidad del Valle**.

<div align="center">

**Hecho con arquitectura limpia, café institucional y un bus de eventos que nunca duerme.**

</div>
