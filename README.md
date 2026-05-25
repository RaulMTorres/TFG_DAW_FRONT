# LoQueHay — Sistema de Gestión de Inventario

Aplicación web para la gestión de inventario con control de stock, movimientos de entrada/salida, almacenes, categorías y generación de reportes en PDF.

Proyecto de Trabajo de Fin de Grado (DAW).

---

## Arquitectura

El proyecto está dividido en dos repositorios independientes:

| Capa | Tecnología | Puerto por defecto |
|---|---|---|
| Frontend | React 19 + Vite + CoreUI 5 | `3001` |
| Backend | Java 21 + Spring Boot 3.5 + PostgreSQL | `8080` |

La comunicación entre capas se realiza mediante una API REST. La autenticación usa JWT; el token se envía en cada petición protegida mediante la cabecera `Authorization: Bearer <token>`.

---

## Requisitos previos

**Frontend**
- Node.js ≥ 18
- npm ≥ 9

**Backend**
- Java 21
- Maven (incluido wrapper `mvnw`)
- PostgreSQL ≥ 14

---

## Instalación y arranque

### Base de datos

Crear una base de datos PostgreSQL llamada `loquehay` y ejecutar el script de DDL incluido en el repositorio back:

```bash
psql -U postgres -c "CREATE DATABASE loquehay;"
psql -U postgres -d loquehay -f src/main/resources/db/ddl.sql
```

### Backend

Configurar las credenciales en `src/main/resources/application.properties` (ver sección de configuración) y arrancar:

```bash
./mvnw spring-boot:run
# El servidor queda escuchando en http://localhost:8080
```

### Frontend

```bash
# Instalar dependencias
npm install

# Modo desarrollo (http://localhost:3001)
npm run dev

# Compilar para producción
npm run build

# Previsualizar build de producción
npm run serve
```

---

## Configuración del backend

Archivo: `src/main/resources/application.properties`

```properties
# Base de datos
spring.datasource.url=jdbc:postgresql://localhost:5432/loquehay
spring.datasource.username=postgres
spring.datasource.password=tu-password

# JWT
jwt.secret=clave-secreta-larga-minimo-256-bits
jwt.expiration-ms=3600000

# Correo (para recuperación de contraseña)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=tu-email@gmail.com
spring.mail.password=tu-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# URL del frontend (usada en los enlaces de reset de contraseña)
app.frontend-url=http://localhost:3001
```

**Configuración del frontend:** la URL del backend se define en `src/services/api.js`:

```js
const BASE_URL = 'http://localhost:8080'
```

---

## Estructura del proyecto

### Backend

```
src/main/java/com/LoQueHay/project/
├── config/           # SecurityConfig, CORS, inicialización de roles y permisos
├── controller/       # Controladores REST
├── dto/              # DTOs de request/response por módulo
├── exception/        # Excepciones personalizadas y GlobalExceptionHandler
├── integrations/     # Clientes externos (Shopify)
├── mappers/          # Conversión entidad ↔ DTO
├── model/            # Entidades JPA
├── repository/       # Repositorios Spring Data JPA
├── security/         # Filtro JWT, JwtService, UserDetailsService
├── service/          # Lógica de negocio
│   └── reports/      # Generadores de reportes PDF por tipo
├── Specification/    # Especificaciones JPA para filtros dinámicos
└── util/             # AuthUtils y utilidades generales
src/main/resources/
├── application.properties
└── db/
    ├── ddl.sql       # Script de creación de tablas
    └── dbdiagram.dbml
```

### Frontend

```
src/
├── assets/           # Imágenes y recursos estáticos
├── components/       # Componentes reutilizables (layout, tabla, paginación)
├── hooks/            # Custom hooks (usePagination)
├── layout/           # Layout principal con sidebar y header
├── services/
│   └── api.js        # Cliente HTTP centralizado (apiFetch, apiFetchBlob)
├── utils/
│   └── auth.js       # Login / logout / gestión del token JWT
├── views/
│   ├── account/      # Perfil de usuario, edición y cambio de contraseña
│   ├── categories/   # Listado y creación de categorías
│   ├── dashboard/    # Dashboard con gráficas y KPIs
│   ├── movements/    # Movimientos de inventario (entradas y salidas)
│   ├── pages/        # Login, registro, recuperación de contraseña, 404, 500
│   ├── products/     # Catálogo de productos y detalles técnicos
│   ├── reports/      # Generación de reportes en PDF
│   └── warehouse/    # Almacenes
├── _nav.js           # Definición de la navegación lateral
├── routes.js         # Definición de rutas de la SPA
└── store.js          # Store Redux
```

---

## Modelo de datos

Las tablas principales de la base de datos son:

| Tabla | Descripción |
|---|---|
| `users` | Usuarios del sistema. Un usuario puede ser propietario (`owner_id` propio) o empleado (apunta al owner) |
| `role` / `permission` | Roles y permisos del sistema (RBAC). Se inicializan automáticamente al arrancar |
| `business` | Negocio asociado a un propietario |
| `category` | Categorías de productos, con `owner_id` |
| `product` | Productos con SKU, barcode y flag `has_expiration_date` |
| `product_details` | Detalles físicos del producto (peso, dimensiones) — relación 1:1 con product |
| `product_stock` | Stock por producto, almacén y lote. Incluye `unit_cost` y `expiration_date` |
| `warehouses` | Almacenes con nombre, ubicación y propietario |
| `inventory_movements` | Cabecera del movimiento (tipo `IN`/`OUT`, almacén, referencia) |
| `inventory_movement_details` | Líneas del movimiento: producto, cantidad, coste, lote, precio de venta |

---

## Seguridad

- Autenticación **stateless** mediante JWT (JJWT 0.11.5).
- Contraseñas hasheadas con **BCrypt**.
- Rutas públicas: `POST /auth/login`, `POST /auth/register-owner`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `GET /auth/reset-password/validate`.
- El resto de rutas requiere token válido en la cabecera `Authorization: Bearer <token>`.
- Las rutas bajo `/admin/**` requieren la autoridad `admin:access`.
- El sistema de permisos es RBAC con permisos adicionales y revocación individual por usuario.

---

## API REST

### Autenticación — `/auth`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `POST` | `/auth/login` | No | Obtener token JWT |
| `POST` | `/auth/register-owner` | No | Registro de usuario propietario |
| `POST` | `/auth/register-user` | Sí | Registro de usuario empleado (header `X-Owner-Id`) |
| `GET` | `/auth/user` | Sí | Datos del usuario autenticado |
| `GET` | `/auth/user/{userId}` | Sí | Datos de un usuario por ID |
| `PUT` | `/auth/user` | Sí | Actualizar datos del usuario |
| `PUT` | `/auth/user/password` | Sí | Cambiar contraseña |
| `POST` | `/auth/forgot-password` | No | Solicitar email de recuperación |
| `GET` | `/auth/reset-password/validate` | No | Validar token de recuperación |
| `POST` | `/auth/reset-password` | No | Restablecer contraseña con token |

### Permisos — `/auth/permissions`

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/auth/permissions/user/{userId}/add` | Agregar permisos a un usuario |
| `POST` | `/auth/permissions/user/{userId}/revoke` | Revocar permisos de un usuario |
| `POST` | `/auth/permissions/role/{roleName}/add` | Agregar permisos a un rol |
| `POST` | `/auth/permissions/role/{roleName}/remove` | Eliminar permisos de un rol |

### Productos — `/api/products`

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/products` | Listado completo |
| `GET` | `/api/products/paged` | Paginado (`page`, `size`, `search`, `sku`, `categoryId`) |
| `GET` | `/api/products/{id}` | Detalle de un producto |
| `POST` | `/api/products` | Crear producto |
| `PUT` | `/api/products/{id}` | Editar producto |
| `DELETE` | `/api/products/{id}` | Eliminar producto |
| `POST` | `/api/products/delete-multiple` | Eliminar varios productos (array de IDs) |

### Detalles técnicos de producto — `/api/products/{productId}/details`

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/products/{productId}/details` | Crear detalles técnicos |
| `GET` | `/api/products/{productId}/details` | Obtener detalles técnicos |
| `PUT` | `/api/products/{productId}/details` | Actualizar detalles técnicos |
| `DELETE` | `/api/products/{productId}/details` | Eliminar detalles técnicos |

### Stock de producto — `/api/products/{productId}/stocks`

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/products/{productId}/stocks` | Listado de lotes en stock |
| `POST` | `/api/products/{productId}/stocks` | Crear entrada de stock manual |
| `PUT` | `/api/products/{productId}/stocks/{id}` | Actualizar lote |
| `DELETE` | `/api/products/{productId}/stocks/{id}` | Eliminar lote |

### Categorías — `/api/categories`

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/categories` | Listado completo |
| `GET` | `/api/categories/paged` | Paginado (`page`, `size`, `search`) |
| `GET` | `/api/categories/{id}` | Detalle de una categoría |
| `POST` | `/api/categories` | Crear categoría |
| `PUT` | `/api/categories/{id}` | Editar categoría |
| `DELETE` | `/api/categories/{id}` | Eliminar categoría |
| `POST` | `/api/categories/delete-multiple` | Eliminar varias categorías |

### Almacenes — `/api/warehouses`

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/warehouses` | Listado completo |
| `GET` | `/api/warehouses/paged` | Paginado (`page`, `size`, `search`) |
| `GET` | `/api/warehouses/{id}` | Detalle de un almacén |
| `POST` | `/api/warehouses` | Crear almacén |
| `PUT` | `/api/warehouses/{id}` | Editar almacén |
| `DELETE` | `/api/warehouses/{id}` | Eliminar almacén |
| `POST` | `/api/warehouses/delete-multiple` | Eliminar varios almacenes |

### Movimientos de inventario — `/api/inventory-movements`

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/inventory-movements` | Registrar movimiento (`IN` o `OUT`) |
| `GET` | `/api/inventory-movements/paged` | Paginado (`page`, `size`, `reference`, `movementType`, `warehouseId`) |
| `GET` | `/api/inventory-movements/product/{productId}` | Movimientos de un producto (paginado) |
| `GET` | `/api/inventory-movements/{id}` | Detalle de un movimiento |
| `POST` | `/api/inventory-movements/delete-multiple` | Eliminar varios movimientos |

#### Body de creación de movimiento

```json
{
  "movementType": "IN",
  "referenceDocument": "FACT-001",
  "note": "Texto libre opcional",
  "warehouseId": 1,
  "entryDetails": [
    {
      "productId": 1,
      "quantity": 10,
      "unitCost": 5.00,
      "lotNumber": "LOT-001",
      "expirationDate": "2026-12-31"
    }
  ],
  "exitDetails": null
}
```

Para movimientos de salida (`OUT`), `entryDetails` es `null` y `exitDetails` contiene `productId`, `quantity` y `sellPriceUnit`.

### Reportes — `/api/reports`

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/reports/generate` | Genera y devuelve el archivo (PDF por defecto) |
| `GET` | `/api/reports/dashboard/summary` | KPIs generales del dashboard |
| `GET` | `/api/reports/dashboard/stock-by-category` | Stock agrupado por categoría |
| `GET` | `/api/reports/dashboard/stock-value-by-warehouse` | Valor de stock por almacén |
| `GET` | `/api/reports/dashboard/products-expiring` | Lotes próximos a vencer por período |
| `GET` | `/api/reports/dashboard/monthly-sales-purchases` | Ventas y compras mensuales |

#### Tipos de reporte disponibles

| `reportType` | Descripción | Fechas |
|---|---|---|
| `INVENTORY_SUMMARY` | Resumen por producto y almacén | No |
| `STOCK_VALUATION` | Valoración de stock por lote | No |
| `PRODUCT_STOCK_VALUE` | Valor total por producto | No |
| `SALES` | Salidas en un rango de fechas | Obligatorias |
| `PURCHASES` | Entradas en un rango de fechas | Obligatorias |
| `PRODUCT_MOVEMENT_HISTORY` | Historial de movimientos | Opcionales |
| `EXPIRATION` | Lotes próximos a vencer | Opcionales |

#### Body de generación de reporte

```json
{
  "reportType": "INVENTORY_SUMMARY",
  "warehouseId": null,
  "categoryId": null,
  "productId": null,
  "dateFrom": null,
  "dateTo": null,
  "format": "PDF"
}
```

---

## Dependencias principales

**Backend**

| Dependencia | Versión |
|---|---|
| Spring Boot | 3.5.6 |
| Java | 21 |
| PostgreSQL Driver | (runtime) |
| Spring Security | (incluido en Boot) |
| JJWT | 0.11.5 |
| iText PDF | 5.5.13.3 |
| Hibernate Validator | 8.0.0 |
| Lombok | 1.18.34 |

**Frontend**

| Dependencia | Versión |
|---|---|
| React | 19 |
| Vite | 7 |
| CoreUI React | 5.7 |
| React Router DOM | 7 |
| React Redux | 9 |
| Chart.js / CoreUI Charts | 4 |
| jwt-decode | 4 |
| react-select | 5 |

---

