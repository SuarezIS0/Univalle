# Microservices Stack

Migración del monolito Next.js a una arquitectura de microservicios.

## Servicios

| Servicio          | Puerto | DB                  | Responsabilidad                     |
| ----------------- | ------ | ------------------- | ----------------------------------- |
| api-gateway       | 8080   | -                   | Enrutamiento y auth edge            |
| auth-service      | 3001   | mongo-auth:27017    | Register, login, verify token (JWT) |
| users-service     | 3002   | mongo-users:27017   | CRUD usuarios, promote a admin      |
| products-service  | 3003   | mongo-products:27017| CRUD productos, seed                |
| orders-service    | 3004   | mongo-orders:27017  | Órdenes, métricas                   |
| payments-service  | 3005   | mongo-payments:27017| Pasarela de pago (simulada)         |

## Comunicación

- Síncrona HTTP entre servicios (p.ej. `orders-service` llama a `products-service` para validar stock).
- El frontend Next.js solo habla con el **api-gateway** (`http://localhost:8080`).
- JWT firmado por `auth-service`; cada servicio valida con la misma clave pública (`JWT_SECRET`).

## Correr todo

```bash
cd microservices
docker compose up --build
```

Luego abre el frontend Next (`cd ..` y `npm run dev`) apuntando a `NEXT_PUBLIC_API_URL=http://localhost:8080`.

## Endpoints (vía gateway)

- `POST /api/auth/register`, `POST /api/auth/login`
- `GET/PUT/DELETE /api/users`, `/api/users/:id`, `POST /api/admin/promote`
- `GET/POST /api/products`, `GET/PUT/DELETE /api/products/:id`, `POST /api/products/seed`
- `GET/POST /api/orders`, `GET/PUT /api/orders/:id`, `GET /api/admin/metrics`
- `POST /api/payments`
