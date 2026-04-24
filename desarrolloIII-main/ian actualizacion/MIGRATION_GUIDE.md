# 🚀 Guía de migración: Monolito → Microservicios

> **Propósito**: este documento captura el plan completo para evolucionar Univalle Shop desde su arquitectura actual (monolito modular Next.js) hacia microservicios, **sin perder funcionalidad en ningún paso intermedio**. Está diseñado para ser autosuficiente — cualquier desarrollador (o agente) puede retomarlo sin contexto previo de la conversación que lo originó.
>
> **Fecha de redacción**: 2026-04-23
> **Estado del proyecto al redactarlo**: monolito Next.js 16 con Hexagonal, MongoDB único, Camino A de SAGA in-process implementado para Pagos y Catálogo (archivado con compensación de imagen).

---

## 1. Snapshot del estado actual (para anclar a tu yo futuro)

### Stack
- **Next.js 16** (App Router) — UI + API en el mismo proceso.
- **TypeScript estricto** + **React 19** + **Tailwind 4**.
- **MongoDB único** vía Mongoose (`src/application/infrastructure/database/mongo.ts`).
- **JWT stateless** con `JWT_SECRET` compartido (`JwtService.ts`).
- **bcryptjs** para hashing.
- **Docker Compose** con dos contenedores: `next-app` + `mongo`.

### Módulos lógicos ya delimitados
| Módulo | Use cases | Adapters infra |
|--------|-----------|-----------------|
| **Auth** | `RegisterUser`, `LoginUser` | `JwtService`, `HashService`, `MongoUserRepository` |
| **User** | `CreateUser`, `GetUsers` | `MongoUserRepository` |
| **Catalog** | `CreateProduct`, `UpdateProduct`, `ArchiveProduct`, `GetProducts`, `GetProductById` | `MongoProductRepository`, `LocalImageStorage`, `CloudinaryImageStorage` |
| **Order** | `CreateOrder`, `GetOrders`, `GetOrderById`, `UpdateOrderStatus` | `MongoOrderRepository` |
| **Payment** | `ProcessPayment` | `SimulatedPaymentGateway` |
| **Admin** | (consultas directas a modelos en `app/api/admin/`) | — |
| **Cart** (cliente) | `useCart` hook | `localStorage` |

### Lo que YA juega a tu favor
1. **Puertos en el dominio** — los use cases dependen de interfaces (`ProductRepository`, `OrderRepository`, `PaymentGateway`, `ImageStorage`), no de Mongoose ni de HTTP.
2. **Composition root manual** en cada `*Controller.ts` — único sitio donde se decide qué adaptador concreto usar. **Cambiar de adaptador = cambiar 5 líneas**.
3. **JWT stateless** — todos los servicios futuros pueden verificar tokens compartiendo `JWT_SECRET` sin estado central.
4. **Denormalización en `OrderItem`** — `name`, `price`, `image` se copian al crear la orden, evitando joins distribuidos posteriores.
5. **SAGA con compensación implementada**:
   - `src/application/use-cases/payments/ProcessPayment.ts` — paga → si falla, marca `cancelled`.
   - `src/application/use-cases/products/ArchiveProduct.ts` — archiva → borra imagen → **revierte archive si falla el delete**.
6. **Patrón puerto/adaptador validado en práctica** con `ImageStorage` (Local + Cloudinary, conmutables por `STORAGE_DRIVER`).

### Lo que NO existe (y vas a tener que construir)
- Broker de eventos / message queue.
- Una BD por servicio.
- Service discovery / API gateway.
- Adaptadores HTTP cliente para llamadas inter-servicio.
- Trazabilidad distribuida (correlation IDs, structured logging).

### Puntos de fricción concretos identificados
- **`src/application/use-cases/orders/CreateOrder.ts:30`** — `productRepository.findById()` y `productRepository.update({stock})` son hoy en proceso y atómicos. Cuando Catalog y Order sean servicios separados, esto se convierte en una SAGA `OrderRequested → ReserveStock → StockReserved | StockRejected`.
- **`src/application/use-cases/payments/ProcessPayment.ts:34-37`** — el cambio de estado de la orden tras el pago es in-process. Cuando Payment se separe, debe emitir `PaymentApproved` / `PaymentFailed` y Order suscribirse.
- **`app/api/admin/metrics/route.ts`** — consulta directa a modelos Mongo de tres dominios. En microservicios necesitará ser un BFF que agregue desde tres servicios.

---

## 2. Principios rectores de la migración

1. **Cada paso debe dejar la página funcionando**. Si algún paso rompe el deploy, está mal diseñado.
2. **Migración por sustitución de adaptador**, no por reescritura. La hexagonal te lo permite — úsalo.
3. **Eventos de dominio antes que separación física**. Introduce el lenguaje de eventos cuando todavía es un monolito; cuando separes procesos, el contrato ya está validado.
4. **Empieza por el módulo más desacoplado** (Pagos) y termina por el más acoplado (Catálogo).
5. **Strangler Fig**: el viejo código convive con el nuevo durante la migración. Nunca hay un "big bang".
6. **Idempotencia obligatoria** en todos los handlers de eventos — los brokers garantizan "at-least-once", no "exactly-once".

---

## 3. Roadmap por fases

### 📍 FASE 0 — Preparación (ya completada al escribir esta guía)
- [x] Hexagonal con puertos claros.
- [x] SAGA in-process con compensación.
- [x] Composition root centralizado.
- [x] Denormalización en agregados.
- [x] JWT stateless.

---

### 🟢 FASE 1 — EventBus in-process (1-2 días)

**Objetivo**: introducir el lenguaje de eventos sin cambiar el despliegue. Sigue siendo un monolito, pero los módulos dejan de llamarse directamente entre sí.

**Entregables**:

1. **Puerto `EventBus` en el dominio**
   - Archivo: `src/domain/services/EventBus.ts`
   ```ts
   export interface DomainEvent<T = unknown> {
     name: string;          // "order.created", "payment.approved", etc.
     occurredAt: Date;
     payload: T;
   }
   export type EventHandler<T = unknown> = (event: DomainEvent<T>) => Promise<void>;
   export interface EventBus {
     publish<T>(event: DomainEvent<T>): Promise<void>;
     subscribe<T>(eventName: string, handler: EventHandler<T>): void;
   }
   ```

2. **Adaptador `InMemoryEventBus`**
   - Archivo: `src/application/infrastructure/services/InMemoryEventBus.ts`
   - Singleton (Map<eventName, handler[]>). Ejecuta handlers en `Promise.allSettled` para que un fallo no tire al resto.
   - Añade un wrapper `withRetry` (máx 3 intentos con backoff exponencial).

3. **Catálogo de eventos** (contratos versionados)
   - Archivo: `src/domain/events/index.ts`
   - Empieza con: `OrderCreatedV1`, `PaymentApprovedV1`, `PaymentFailedV1`, `ProductArchivedV1`, `StockReservedV1`, `StockReleasedV1`.
   - **Cada payload incluye `correlationId: string`** (UUID) para trazabilidad futura.

4. **Refactor mínimo de los use cases existentes para PUBLICAR**
   - `CreateOrder.execute` → al final, `eventBus.publish({name: "order.created", ...})`.
   - `ProcessPayment.execute` → publica `payment.approved` o `payment.failed` **además** de actualizar estado.
   - `ArchiveProduct.execute` → publica `product.archived`.
   - **No suscribas nada todavía** — solo publica.

5. **Activar suscripciones in-process**
   - En `src/application/bootstrap.ts` (nuevo archivo): registra handlers que hoy reproduzcan el comportamiento actual. Ejemplo: `payment.approved` → handler que llama `OrderRepository.updateStatus("confirmed")`.
   - Llama `bootstrap()` desde `app/layout.tsx` o un `instrumentation.ts` de Next.

**Criterio de aceptación**: el flujo de checkout completo funciona idéntico al actual, pero ahora con eventos publicados en cada paso clave. Verificable con un `console.log` en cada handler.

**Riesgos**:
- **Orden de booting**: en serverless / Next.js los módulos se cargan perezosamente. Asegúrate de que `bootstrap()` se ejecute antes de cualquier route handler. Usa `instrumentation.ts` (soportado por Next 16).
- **Concurrencia**: si dos requests publican eventos simultáneos, los handlers se ejecutan en paralelo. Asegura idempotencia desde el principio.

---

### 🟡 FASE 2 — Extraer Pagos como microservicio (3-5 días)

**Por qué Pagos primero**: ya está desacoplado vía `PaymentGateway`. Solo cambias el adaptador.

**Entregables**:

1. **Nuevo proyecto `payment-service/`** (sibling a `ian actualizacion/`)
   - Estructura mínima: Express o Fastify + TypeScript + el mismo `JWT_SECRET`.
   - Endpoint `POST /payments` que internamente usa la lógica actual de `SimulatedPaymentGateway`.
   - Health check `GET /health`.

2. **Adaptador HTTP en el monolito**
   - Archivo: `src/application/infrastructure/services/HttpPaymentGateway.ts`
   - Implementa `PaymentGateway` haciendo `fetch(process.env.PAYMENT_SERVICE_URL + "/payments", ...)`.
   - Timeout de 5s, reintentos con backoff (idempotencia vía `orderId`).

3. **Conmutador en composition root**
   - `OrderController.paymentGateway()` lee `PAYMENT_DRIVER=local|http`. Por defecto `local` para no romper.

4. **Broker real en `docker-compose.yml`**
   - Añade contenedor `redis` (Redis Streams) o `nats`. Recomendación: **Redis Streams** por madurez del cliente Node.
   - Crea `RedisEventBus` implementando el mismo puerto `EventBus`. Conmutador `EVENT_BUS_DRIVER=memory|redis`.

5. **Pagos publica en el bus distribuido**
   - El `payment-service` publica `payment.approved` / `payment.failed` en Redis tras procesar.
   - El monolito (Order module) se suscribe vía `RedisEventBus`.
   - **Quita** la lógica que hoy hace `OrderRepository.updateStatus` desde dentro de `ProcessPayment` — ahora la disparará el handler suscrito al evento.

6. **Pruebas de migración**
   - Levanta Pagos como servicio externo, conmuta `PAYMENT_DRIVER=http` y `EVENT_BUS_DRIVER=redis`.
   - Ejecuta el flujo de checkout. Debe seguir aprobando/rechazando pagos exactamente igual.
   - Si algo va mal: rollback inmediato cambiando ambas variables de entorno.

**Criterio de aceptación**: puedes apagar el `payment-service` y la página sigue funcionando para todo lo que no sea pagar. Apagar el monolito tira todo (es esperado).

**Riesgo principal**: pagos fantasma si el bus duplica eventos. Mitigación: cada handler de `payment.*` valida `orderId` + estado actual antes de actuar.

---

### 🟠 FASE 3 — Extraer Catálogo (1-2 semanas) — el paso difícil

**Por qué es difícil**: `CreateOrder` consulta el catálogo síncronamente para validar stock y enriquecer items. No puedes hacer una llamada HTTP por cada producto del carrito sin pagar latencia y riesgo de fallos parciales.

**Estrategia recomendada: Proyección local de productos en Order**

1. **Nuevo `catalog-service/`**
   - CRUD de productos. Es dueño exclusivo de la BD de productos.
   - Publica eventos en cada cambio: `product.created`, `product.updated`, `product.archived`, `product.stock_changed`.

2. **Read model en Order**
   - El monolito (Order module) mantiene una colección Mongo `product_projections` con `{productId, name, price, stock, archivedAt, version}`.
   - Suscriptor a `product.*` que actualiza esta proyección. Idempotente vía `version`.
   - **`CreateOrder` deja de llamar `productRepository.findById`** — consulta el read model local.

3. **Reserva de stock con SAGA distribuida**
   - `CreateOrder` ya no muta stock directamente. Publica `order.requested` con los items.
   - `catalog-service` se suscribe, intenta `reserveStock(orderId, items)` atómicamente, publica `stock.reserved` o `stock.rejected`.
   - Order suscribe ambos:
     - `stock.reserved` → marca orden como `pending` y procede al flujo de pago.
     - `stock.rejected` → marca orden como `cancelled` con motivo.
   - Después del pago: `payment.approved` → publica `order.confirmed` → Catalog convierte la reserva en deducción definitiva.
   - `payment.failed` o timeout → publica `order.cancelled` → Catalog libera la reserva (`stock.released`).

4. **Endpoints públicos del catálogo**
   - El frontend Next.js sigue llamando a `/api/products/*`. Esas rutas ahora actúan como **BFF**: hacen `fetch` al `catalog-service` y devuelven la respuesta. Cero cambios en la UI.

5. **Migración de imágenes**
   - `LocalImageStorage` ya no sirve si Catalog está en otro contenedor sin acceso a `public/uploads/`. **Forzar `STORAGE_DRIVER=cloudinary`** o montar un volumen compartido (peor opción).

**Criterio de aceptación**: el read model en Order está siempre actualizado dentro de los 2 segundos posteriores a un cambio en Catalog. La SAGA de checkout completa correctamente o se compensa de forma observable.

**Riesgos**:
- **Consistencia eventual** — un usuario puede ver un producto en el listado y al añadirlo al carrito recibir "stock insuficiente". Esto es aceptable y es el trade-off documentado de microservicios.
- **Drift del read model** — si el bus se cae, la proyección queda desactualizada. Implementa un **sync periódico de reconciliación** (cron horario que pide a Catalog el snapshot completo).

---

### 🔵 FASE 4 — Resto de servicios (2-3 semanas)

Sigue el mismo patrón con menor complejidad porque ya tienes la infraestructura:

| Servicio | Particularidad |
|----------|----------------|
| **auth-service** | Trivial. Solo expone `POST /login` y `POST /register`. JWT compartido evita necesidad de "introspection endpoint". |
| **user-service** | CRUD de usuarios. Order necesitará read model de usuarios (similar a Catalog). |
| **order-service** | Lo último que extraes. Hasta entonces vive en el monolito-BFF. |
| **admin-service** (opcional) | Aglutina métricas. Hace `fetch` paralelos a los tres servicios y agrega. |

El monolito original se va vaciando hasta convertirse en **BFF + frontend Next.js**. Esa es la forma final.

---

### 🟣 FASE 5 — Endurecimiento (continuo)

- **Observabilidad**: OpenTelemetry, propagar `correlationId` en headers HTTP y en eventos.
- **Resiliencia**: circuit breakers (ej. `opossum`), bulkheads, dead-letter queues para eventos no procesables.
- **Seguridad**: red interna privada en Docker (sin exponer puertos de servicios internos al host), rate limiting en el BFF.
- **CI/CD**: pipelines independientes por servicio, contratos versionados (Pact o similar).

---

## 4. Decisiones técnicas recomendadas (con justificación)

| Decisión | Recomendación | Por qué |
|----------|---------------|---------|
| Broker | **Redis Streams** | Ya conoces Redis, cliente Node maduro (`ioredis`), un contenedor extra, suficiente para tu volumen. Migrar a Kafka cuando tengas >10K eventos/día. |
| Comunicación síncrona | **HTTP/REST** entre servicios | gRPC sería sobreingeniería para tu equipo. Usa OpenAPI para contratos. |
| Service discovery | **Variables de entorno + Docker network** | Suficiente con Docker Compose. Cuando uses K8s, los Services nativos lo resuelven. |
| API Gateway | **El propio Next.js como BFF** | Evita añadir Kong/Traefik. Las rutas `/api/*` actúan de gateway hacia los microservicios. |
| Bases de datos | **Una Mongo por servicio** (mismo cluster, distintas DBs al inicio) | Aísla schemas sin pagar el coste operativo de N clusters. Migra a clusters separados solo si hay razones de escala/compliance. |
| Autenticación | **Sigue con JWT firmado**, secret compartido | Stateless, sin cambios. Cada servicio valida con `JwtService.verify`. |
| Logging | **Pino + stdout + agregador (Loki o ELK)** | Estructura JSON desde el día 1. |
| Trace ID | **Header `x-correlation-id`** generado en el BFF, propagado en HTTP y en eventos | Permite reconstruir flujos cross-service. |

---

## 5. Anti-patrones a evitar

❌ **Compartir la BD entre servicios** — anula todo el beneficio. Cada servicio dueño absoluto de sus datos.

❌ **Llamadas HTTP en cadena (A → B → C → D)** — latencias se acumulan, fallos parciales sin compensar. Usa eventos.

❌ **Eventos como "RPC asíncrono"** (`get_user_request` / `get_user_response`) — para consultas síncronas usa HTTP. Eventos = hechos pasados, no preguntas.

❌ **Olvidar la idempotencia** — el broker reentregará eventos. Cada handler debe poder ejecutarse 2× sin daño.

❌ **Migración big-bang** — siempre incremental, siempre con rollback de un cambio de variable de entorno.

❌ **Quitar el monolito antes de que esté vacío** — déjalo morir naturalmente.

❌ **Microservicios sin observabilidad** — depurar errores distribuidos sin trazas es un infierno.

---

## 6. Checklist de "listo para producción" por servicio

Antes de considerar un servicio extraído como completo:

- [ ] Health check (`GET /health`) y readiness (`GET /ready`).
- [ ] Logs estructurados con `correlationId`.
- [ ] Métricas básicas expuestas (latencia p50/p95, error rate).
- [ ] Dockerfile multi-stage (build + runtime slim).
- [ ] Variables de entorno documentadas en su `README.md`.
- [ ] Endpoints públicos documentados (OpenAPI).
- [ ] Eventos que publica documentados con su payload.
- [ ] Eventos que consume documentados con su handler.
- [ ] Pruebas de integración contra una instancia local del broker.
- [ ] Estrategia de rollback documentada (variable de entorno + comando).

---

## 7. Estimación realista (1 desarrollador full-time)

| Fase | Tiempo | Entregable principal |
|------|--------|----------------------|
| Fase 1 — EventBus in-process | **1-2 días** | Eventos publicándose, monolito intacto |
| Fase 2 — Pagos extraído | **3-5 días** | Primer microservicio en producción |
| Fase 3 — Catálogo extraído | **1-2 semanas** | SAGA distribuida real funcionando |
| Fase 4 — Resto de servicios | **2-3 semanas** | Monolito reducido a BFF |
| Fase 5 — Endurecimiento | **continuo** | Observabilidad, resiliencia |
| **Total** | **5-8 semanas** | Sistema microservicios completo |

Para una entrega académica: **Fase 1 + Fase 2** (1 semana) ya demuestra dominio del patrón sin requerir el esfuerzo completo. Fase 3 si quieres puntos extra.

---

## 8. Cuando retomes esta guía

1. Lee primero **el `README.md`** para refrescar el estado actual del repo (puede haber cambiado).
2. Verifica con `git log --oneline -20` qué se ha hecho desde esta fecha.
3. Comprueba si los archivos referenciados aquí (`CreateOrder.ts:30`, `ProcessPayment.ts`, etc.) siguen existiendo y siguen siendo los puntos de fricción descritos.
4. Empieza por la fase más temprana **no completada**. No saltes fases.
5. Si una decisión de la sección 4 ya no aplica (ej. el equipo decidió usar Kafka), actualiza este documento antes de proceder.

---

## 9. Referencias internas del repo (a fecha 2026-04-23)

| Archivo | Por qué importa para la migración |
|---------|-----------------------------------|
| `src/domain/services/PaymentGateway.ts` | Plantilla mental de lo que será cada puerto a microservicio. |
| `src/domain/services/ImageStorage.ts` | Demostración viva de DIP con dos adaptadores conmutables. |
| `src/application/infrastructure/services/SimulatedPaymentGateway.ts` | Lógica que extraerás tal cual a `payment-service`. |
| `src/application/use-cases/orders/CreateOrder.ts:30` | El punto de fricción más importante. Léelo antes de Fase 3. |
| `src/application/use-cases/payments/ProcessPayment.ts` | SAGA in-process. En Fase 2 dejarás solo la parte de "publicar evento". |
| `src/application/use-cases/products/ArchiveProduct.ts` | SAGA con compensación real. Mismo patrón aplicará para reservas de stock. |
| `src/application/interfaces/controllers/*.ts` | Composition root — único sitio que cambias para conmutar adaptadores. |
| `docker-compose.yml` | Aquí añadirás `redis`, `payment-service`, `catalog-service`, etc. |

---

**Última actualización**: 2026-04-23 — versión inicial del plan de migración.
