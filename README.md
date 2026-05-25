# LoQueHay — Sistema de Gestión de Inventario

Aplicación web para la gestión de inventario con control de stock, movimientos de entrada/salida, almacenes, categorías y generación de reportes en PDF.

Proyecto de Trabajo de Fin de Grado (DAW).

---

## Arquitectura

El proyecto está dividido en dos repositorios independientes:

| Capa | Tecnología | Puerto por defecto |
|---|---|---|
| Frontend | React 19 + Vite + CoreUI 5 | `3001` |
| Backend | Java Spring Boot | `8080` |

La comunicación entre capas se realiza mediante una API REST. La autenticación usa JWT; el token se envía en cada petición protegida mediante la cabecera `Authorization: Bearer <token>`.

---

## Requisitos previos

**Frontend**
- Node.js ≥ 18
- npm ≥ 9

**Backend**
- Java 17+
- Maven
- Base de datos postgresql

---

## Instalación y arranque

### Backend

```bash
# Clonar el repositorio back y arrancar
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

## Variables de entorno / configuración

El frontend apunta al backend mediante la constante `BASE_URL` definida en `src/services/api.js`:

```js
const BASE_URL = 'http://localhost:8080'
```

Cambiar este valor para apuntar a otro entorno (staging, producción, etc.).

---

## Estructura del proyecto (frontend)

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

## API REST

Todas las rutas bajo `/api/*` requieren el token JWT. Las rutas bajo `/auth/*` son públicas (salvo `/auth/user`).

### Autenticación

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/auth/login` | Obtener token JWT |
| `POST` | `/auth/register-owner` | Registro de nuevo usuario propietario |
| `GET` | `/auth/user` | Datos del usuario autenticado |
| `POST` | `/auth/forgot-password` | Solicitar email de recuperación |
| `POST` | `/auth/reset-password` | Restablecer contraseña con token |

### Productos

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/products` | Listado completo |
| `GET` | `/api/products/paged` | Listado paginado (`page`, `size`, `search`, `sku`, `categoryId`) |
| `GET` | `/api/products/:id` | Detalle de un producto |
| `POST` | `/api/products` | Crear producto |
| `PUT` | `/api/products/:id` | Editar producto |
| `POST` | `/api/products/delete-multiple` | Eliminar varios productos (array de IDs en el body) |

### Categorías

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/categories` | Listado completo |
| `GET` | `/api/categories/paged` | Listado paginado (`page`, `size`, `search`) |
| `POST` | `/api/categories/delete-multiple` | Eliminar varias categorías |

### Almacenes

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/warehouses` | Listado completo |
| `GET` | `/api/warehouses/paged` | Listado paginado (`page`, `size`, `search`) |
| `POST` | `/api/warehouses/delete-multiple` | Eliminar varios almacenes |

### Movimientos de inventario

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/inventory-movements/paged` | Listado paginado (`page`, `size`, `reference`, `movementType`, `warehouseId`) |
| `POST` | `/api/inventory-movements` | Registrar movimiento (`IN` o `OUT`) |
| `POST` | `/api/inventory-movements/delete-multiple` | Eliminar varios movimientos |

#### Body de creación de movimiento

```json
{
  "movementType": "IN",
  "referenceDocument": "string",
  "note": "string",
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

### Reportes

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/reports/generate` | Genera y devuelve un PDF |
| `GET` | `/api/reports/dashboard/summary` | KPIs generales |
| `GET` | `/api/reports/dashboard/stock-by-category` | Stock por categoría |
| `GET` | `/api/reports/dashboard/stock-value-by-warehouse` | Valor de stock por almacén |
| `GET` | `/api/reports/dashboard/products-expiring` | Lotes próximos a vencer |
| `GET` | `/api/reports/dashboard/monthly-sales-purchases` | Ventas y compras mensuales |

#### Tipos de reporte disponibles

| Valor | Descripción |
|---|---|
| `INVENTORY_SUMMARY` | Resumen de inventario por producto y almacén |
| `STOCK_VALUATION` | Valoración de stock por lote |
| `PRODUCT_STOCK_VALUE` | Valor total por producto |
| `SALES` | Salidas en un rango de fechas |
| `PURCHASES` | Entradas en un rango de fechas |
| `PRODUCT_MOVEMENT_HISTORY` | Historial de movimientos |
| `EXPIRATION` | Lotes próximos a vencer |

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


