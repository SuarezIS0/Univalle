# 🛒 Univalle Shop

Plataforma de e-commerce desarrollada para la comunidad de la **Universidad del Valle**.
El sistema permite registrar usuarios con correo institucional (`@correounivalle.edu.co` / `@univalle.edu.co`), gestionar un catálogo de productos, administrar un carrito de compras, procesar pedidos y simular pagos con tarjeta.

El proyecto está construido sobre **Next.js 16 (App Router)** siguiendo los principios de **Arquitectura Hexagonal (Ports & Adapters)** y **SOLID**, con persistencia en **MongoDB** y autenticación basada en **JWT**.

---

## 1. Identificación del Stack Tecnológico

| Capa | Tecnología | Versión | Evidencia |
|------|-------------|---------|-----------|
| Lenguaje | **TypeScript** | ^5 | `tsconfig.json`, `*.ts`, `*.tsx` |
| Runtime | Node.js | 20-alpine | `Dockerfile` |
| Framework Web | **Next.js** (App Router) | 16.2.0 | `next.config.ts`, `app/` |
| UI | **React** | 19.2.4 | `package.json` |
| Estilos | **Tailwind CSS** | ^4 | `postcss.config.mjs`, `globals.css` |
| Base de datos | **MongoDB** | latest | `docker-compose.yml` |
| ODM | **Mongoose** | ^9.3.1 | `src/application/infrastructure/database/` |
| Autenticación | **JSON Web Tokens** (`jsonwebtoken`) | ^9.0.2 | `JwtService.ts` |
| Hashing de credenciales | **bcryptjs** | ^3.0.3 | `HashService.ts` |
| Contenerización | **Docker** + **Docker Compose** | — | `Dockerfile`, `docker-compose.yml` |
| Linter | ESLint 9 + `eslint-config-next` | — | `eslint.config.mjs` |

---

## 2. Arquitectura Hexagonal (Ports & Adapters)

La organización de carpetas separa las reglas de negocio (dominio) de los detalles técnicos (framework, base de datos, red), cumpliendo el principio de **Inversión de Dependencias**. El dominio no conoce a Mongoose ni a Next.js; los adaptadores se inyectan desde la capa externa.

```
ian actualizacion/
├── app/                                   # 🟦 ADAPTADOR DE ENTRADA — Next.js App Router (UI + HTTP)
│   ├── page.tsx                           #   Landing / Home
│   ├── layout.tsx
│   ├── products/        products/[id]/    #   Catálogo y detalle
│   ├── cart/            checkout/         #   Flujo de compra
│   ├── orders/          dashboard/        #   Historial del cliente
│   ├── payment/success/ payment/failure/  #   Retorno de la pasarela
│   ├── login/           register/         #   Autenticación
│   ├── admin/                             #   Panel de administración
│   ├── components/                        #   Navbar, Footer, ProductCard, Reveal
│   ├── lib/cart.ts                        #   Hook useCart (localStorage + eventos)
│   └── api/                               # 🟩 ADAPTADOR HTTP (route handlers)
│       ├── auth/{login,register}/route.ts
│       ├── users/[id]/route.ts
│       ├── products/[id]/ + seed/route.ts
│       ├── orders/[id]/route.ts
│       ├── payments/route.ts
│       └── admin/{metrics,promote}/route.ts
│
└── src/
    ├── domain/                            # 🟥 NÚCLEO DEL DOMINIO — sin dependencias externas
    │   ├── entities/                      #   Reglas e invariantes de negocio
    │   │   ├── User.ts                    #     Validación de correo institucional
    │   │   ├── Product.ts                 #     hasStock() / reduceStock()
    │   │   ├── Order.ts                   #     Máquina de estados (VALID_TRANSITIONS)
    │   │   └── Cart.ts
    │   ├── repositories/                  #   PUERTOS de persistencia (interfaces)
    │   │   ├── UserRepository.ts
    │   │   ├── ProductRepository.ts
    │   │   └── OrderRepository.ts
    │   └── services/                      #   PUERTOS de servicios externos
    │       └── PaymentGateway.ts
    │
    └── application/                       # 🟨 CASOS DE USO + INFRAESTRUCTURA
        ├── use-cases/                     #   Orquestación de reglas de negocio
        │   ├── RegisterUser.ts   LoginUser.ts
        │   ├── products/        (Create / Get / Update / Delete)
        │   ├── orders/          (Create / Get / UpdateStatus)
        │   └── payments/        ProcessPayment.ts
        ├── interfaces/controllers/        #   Composición y delegación (DI manual)
        │   ├── UserController.ts
        │   ├── ProductController.ts
        │   └── OrderController.ts
        └── infrastructure/                # 🟫 ADAPTADORES DE SALIDA
            ├── database/
            │   ├── mongo.ts               #     Gestor de conexión singleton
            │   ├── models/                #     Schemas Mongoose
            │   └── repositories/          #     Implementaciones concretas:
            │                              #       MongoUserRepository, MongoOrderRepository,
            │                              #       MongoProductRepository
            └── services/                  #     HashService, JwtService, AuthGuard,
                                           #     SimulatedPaymentGateway
```

### Dirección de las dependencias

```
   [app/**/route.ts]  ──▶  [Controllers]  ──▶  [Use Cases]  ──▶  [Domain Interfaces]
         │                                                              ▲
         └──── inyecta ──▶ [Mongo*Repository, SimulatedPaymentGateway] ─┘
```

El dominio define **interfaces** (`OrderRepository`, `PaymentGateway`), y la infraestructura **las implementa**. Los casos de uso dependen solo de abstracciones, nunca de Mongoose ni de Next.js.

---

## 3. Patrones y Principios

### 3.1 SOLID

| Principio | Implementación en el código |
|-----------|------------------------------|
| **S — Single Responsibility** | Cada caso de uso resuelve una sola intención: `CreateOrder`, `ProcessPayment`, `UpdateOrderStatus`, `LoginUser`. Los controladores solo ensamblan dependencias; los modelos Mongoose solo describen el schema. |
| **O — Open/Closed** | La máquina de estados `VALID_TRANSITIONS` en `Order.ts` permite extender nuevos estados sin modificar la lógica de transición. Nuevos métodos de pago se añaden implementando `PaymentGateway` sin tocar `ProcessPayment`. |
| **L — Liskov Substitution** | Cualquier clase que implemente `OrderRepository` (Mongo, InMemory) es intercambiable. Existe `InMemoryUserRepository` junto a `UserRepositoryMongo` como evidencia. |
| **I — Interface Segregation** | Interfaces pequeñas y enfocadas: `PaymentGateway` expone únicamente `charge()`; `ProductRepository` separa lectura de escritura; `OrderRepository` expone `save`, `findById`, `updateStatus`. |
| **D — Dependency Inversion** | Los casos de uso reciben sus dependencias por constructor: `new CreateOrder(orderRepo, productRepo)`, `new ProcessPayment(orderRepo, paymentGateway)`. El dominio nunca importa a Mongoose. |

### 3.2 Gestión de consistencia — patrón SAGA (orquestación)

> ⚠️ **Nota honesta sobre el estado actual:** el repositorio **no** contiene un broker de mensajería (RabbitMQ, Kafka, NATS) ni un bus de eventos explícito. La consistencia entre los agregados `Order`, `Product` (stock) y el `PaymentGateway` se gestiona mediante una **SAGA orquestada en proceso**, donde los casos de uso actúan como orquestadores síncronos.

**SAGA de Checkout** — `CreateOrder` → `ProcessPayment`:

```
┌──────────────┐    1. validar stock       ┌───────────────────┐
│ CreateOrder  │ ────────────────────────▶ │ ProductRepository │
│ (use-case)   │    2. reduceStock + update└───────────────────┘
│              │    3. save(Order, pending)
└──────┬───────┘
       │
       ▼  (cliente invoca /api/payments)
┌──────────────┐    4. findById(orderId)   ┌───────────────────┐
│ProcessPayment│ ────────────────────────▶ │  OrderRepository  │
│ (use-case /  │    5. charge()            ├───────────────────┤
│  orquestador)│ ────────────────────────▶ │   PaymentGateway  │
│              │    6a. ok    → updateStatus("confirmed")
│              │    6b. error → updateStatus("cancelled")  (compensación)
└──────────────┘
```

Elementos implementados:

1. **Orquestador único** (`ProcessPayment.execute`, `src/application/use-cases/payments/ProcessPayment.ts`) coordina la transición de la orden.
2. **Transacción compensatoria**: si `PaymentGateway.charge()` devuelve `success: false`, la orden se marca como `cancelled`, evitando quedar en estado inconsistente.
3. **Máquina de estados del agregado** `Order` (`VALID_TRANSITIONS`) protege invariantes y bloquea transiciones inválidas (`pending → shipped`, `delivered → cancelled`, etc.).
4. **Idempotencia defensiva**: `ProcessPayment` rechaza el cobro si la orden ya no está en estado `pending`.

**Por qué orquestación y no coreografía:** dado que el proyecto se ejecuta como un único proceso Next.js, un orquestador in-process ofrece trazabilidad lineal y simplicidad operativa. Una evolución natural hacia coreografía requeriría introducir un broker (ej. Kafka/Rabbit) y reemplazar las llamadas directas por publicación de eventos `OrderCreated`, `PaymentApproved`, `PaymentFailed`.

---

## 4. Servicios detectados (módulos funcionales)

> El proyecto es un **monolito modular** desplegado como una sola aplicación Next.js. Aun así, la separación por dominios permite identificar **módulos/servicios lógicos** claramente delimitados, cada uno con su propio conjunto de entidades, casos de uso, adaptadores y endpoints HTTP.

| Módulo | Responsabilidad | Endpoints (`app/api/*`) | Casos de uso |
|--------|-----------------|--------------------------|---------------|
| **Auth Service** | Registro, login y emisión de JWT con validación de dominio `@correounivalle.edu.co`. | `POST /api/auth/register`, `POST /api/auth/login` | `RegisterUser`, `LoginUser` |
| **User Service** | Gestión de usuarios y promoción a rol `admin` mediante secreto. | `GET/PUT /api/users/[id]`, `POST /api/admin/promote` | `CreateUser`, `GetUsers` |
| **Product Service** | CRUD de catálogo, búsqueda/filtrado por categoría y seed inicial. | `GET/POST /api/products`, `GET/PUT/DELETE /api/products/[id]`, `POST /api/products/seed` | `CreateProduct`, `GetProducts`, `GetProductById`, `UpdateProduct`, `DeleteProduct` |
| **Order Service** | Creación de pedidos, validación de stock y consulta del historial (propio o global). | `GET/POST /api/orders`, `GET/PATCH /api/orders/[id]` | `CreateOrder`, `GetOrders`, `GetOrderById`, `UpdateOrderStatus` |
| **Payment Service** | Pasarela simulada (regla: último dígito par → aprobado). Dispara la compensación de la SAGA. | `POST /api/payments` | `ProcessPayment` |
| **Admin Service** | Métricas agregadas (ventas, conteo de órdenes por estado, usuarios, productos). | `GET /api/admin/metrics`, `POST /api/admin/promote` | (consulta directa a modelos) |
| **Cart Module** (client-side) | Carrito persistido en `localStorage` con sincronización vía `CustomEvent`. | — | `Cart` entity + `useCart` hook |

---

## 5. Guía de inicio

### Requisitos previos

- **Node.js** ≥ 20
- **Docker** + **Docker Compose** (opción recomendada)
- o, en su defecto, una instancia local de **MongoDB** escuchando en `mongodb://localhost:27017`

### Variables de entorno

Crea un archivo `.env.local` en la raíz de `ian actualizacion/` con:

```env
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=supersecret-univalle-ecommerce-2026
ADMIN_PROMOTE_SECRET=univalle-admin-seed
```

### Opción A — Ejecución con Docker (recomendada)

Levanta la aplicación y MongoDB con un único comando:

```bash
docker compose up --build
```

Esto orquesta dos contenedores definidos en `docker-compose.yml`:
- `ecommerce-next` — la app Next.js en `http://localhost:3000`
- `ecommerce-mongo` — MongoDB en `mongodb://localhost:27017/ecommerce`

Para detener y limpiar:

```bash
docker compose down          # detiene los contenedores
docker compose down -v       # elimina también el volumen mongo-data
```

### Opción B — Ejecución local (sin Docker)

```bash
# 1. Instalar dependencias
npm install

# 2. Asegúrate de que MongoDB esté corriendo en localhost:27017

# 3. Entorno de desarrollo (con hot reload)
npm run dev

# 4. Build y ejecución en modo producción
npm run build
npm start

# 5. Linter
npm run lint
```

La aplicación quedará disponible en [http://localhost:3000](http://localhost:3000).

### Primer uso — seed de datos

Una vez arriba, puedes poblar el catálogo llamando al endpoint de seed:

```bash
curl -X POST http://localhost:3000/api/products/seed
```

Y promover un usuario a administrador (después de registrarlo con correo institucional):

```bash
curl -X POST http://localhost:3000/api/admin/promote \
  -H "Content-Type: application/json" \
  -d '{"email":"tuCorreo@correounivalle.edu.co","secret":"univalle-admin-seed"}'
```

---

## 6. Estructura de la respuesta API

Todos los endpoints siguen el contrato:

```json
{ "success": true,  "data":  { ... } }
{ "success": false, "error": "mensaje legible" }
```

Los endpoints protegidos requieren la cabecera `Authorization: Bearer <JWT>`, obtenida tras `POST /api/auth/login`.

---

## Licencia

Proyecto académico — Universidad del Valle, Desarrollo de Software III.
