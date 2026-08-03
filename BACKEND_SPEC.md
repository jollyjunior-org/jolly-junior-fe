# FastAPI Backend & PostgreSQL Architecture Specification

This specification documents the complete backend of the **JollyJuniors** E-Commerce platform, implemented as a **microservices architecture** using **FastAPI** (Python 3.11+), **PostgreSQL 15**, and deployed via **Docker Compose**.

---

## 1. Tech Stack & Architecture

| Layer | Technology |
| :--- | :--- |
| **Framework** | FastAPI (Async Engine) |
| **Database** | PostgreSQL 15+ |
| **ORM** | SQLAlchemy 2.0 (Async) |
| **Database Driver** | `asyncpg` |
| **Migrations** | Alembic (Async, Autogenerate) |
| **Authentication** | OAuth2 Password Bearer + JWT (`python-jose`, `passlib[bcrypt]`) |
| **Data Validation** | Pydantic v2 + `pydantic[email]` |
| **API Docs** | Swagger UI (`/docs`) & ReDoc (`/redoc`) |
| **Containerization** | Docker + Docker Compose |
| **Email Validation** | `email-validator` via `pydantic[email]` |

### Architecture Pattern: Microservices (Shared DB)
All services connect to a **single shared PostgreSQL database**. Shared models and utilities live in `service_core_libs`, which is imported by every service.

```
service_core_libs   <──── shared package (models, security, db, schemas)
      │
      ├──── auth_service     (Port 8001)
      ├──── admin_service    (Port 8002)
      └──── jollyjunior_be  (Port 8003)
             │
      PostgreSQL (Port 5432)
```

---

## 2. PostgreSQL Database Schema (DDL)

> Tables are managed by **Alembic** autogenerate migrations. Do not modify the database manually.

```sql
-- Enums
CREATE TYPE user_role AS ENUM ('customer', 'admin');
CREATE TYPE order_status AS ENUM ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled');
CREATE TYPE age_group_type AS ENUM ('0-6M', '6-12M', '1-3Y', '3-5Y', '5Y+');

-- 1. Users Table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    role user_role DEFAULT 'customer' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Categories Table
CREATE TABLE categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    icon VARCHAR(100),
    image TEXT,
    description TEXT,
    is_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Category Subcategories Table
CREATE TABLE category_subcategories (
    id SERIAL PRIMARY KEY,
    category_id VARCHAR(36) REFERENCES categories(id) ON DELETE CASCADE,
    subcategory_name VARCHAR(255) NOT NULL
);

-- 3. Products Table
CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    category_id VARCHAR(36) REFERENCES categories(id) ON DELETE SET NULL,
    category_name VARCHAR(255) NOT NULL,
    age_group age_group_type NOT NULL,
    description TEXT,
    in_stock BOOLEAN DEFAULT TRUE NOT NULL,
    stock_quantity INTEGER DEFAULT 10 NOT NULL CHECK (stock_quantity >= 0),
    low_stock_threshold INTEGER DEFAULT 5 NOT NULL,
    is_published BOOLEAN DEFAULT TRUE NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 5.00 NOT NULL,
    review_count INTEGER DEFAULT 0 NOT NULL,
    badge VARCHAR(50),
    discount_badge VARCHAR(50),
    frequently_bought_together_id VARCHAR(36) REFERENCES products(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Product Images Table
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(36) REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL
);

-- Product Features Table
CREATE TABLE product_features (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(36) REFERENCES products(id) ON DELETE CASCADE,
    feature_text TEXT NOT NULL
);

-- 4. Product Variants Table
CREATE TABLE product_variants (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    in_stock BOOLEAN DEFAULT TRUE NOT NULL,
    stock_quantity INTEGER DEFAULT 10 NOT NULL
);

-- 5. Product Reviews Table
CREATE TABLE reviews (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) REFERENCES products(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. Orders Table
CREATE TABLE orders (
    id VARCHAR(36) PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    shipping_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'COD',
    status order_status DEFAULT 'Pending' NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 7. Order Items Table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(36) REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(36) REFERENCES products(id) ON DELETE RESTRICT,
    variant_id VARCHAR(36) REFERENCES product_variants(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    variant_name VARCHAR(255),
    price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0)
);

-- Indexes for Query Performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_published ON products(is_published, in_stock);
CREATE INDEX idx_products_stock ON products(stock_quantity);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
```

---

## 3. FastAPI Microservices Project Structure

```
backend/                                    ← Root (lives alongside /JollyJuniors frontend)
├── Dockerfile                              # Shared Docker image for all Python services
├── service_core_libs/                      # ★ Core config & shared library
│   ├── .env                               # Central environment variables for ALL services
│   ├── docker-compose.yml                 # Docker Compose orchestration (run from here)
│   ├── requirements.txt                   # Shared Python dependencies
│   ├── alembic.ini                        # Alembic config file
│   ├── alembic/                           # Alembic migrations
│   │   ├── env.py                         # Configured for async SQLAlchemy + all models
│   │   └── versions/                      # Generated migration scripts
│   ├── database.py                        # Async SQLAlchemy engine, session, Base
│   ├── auth_deps.py                       # FastAPI auth dependency (get_current_user, admin guard)
│   ├── security.py                        # JWT creation/decode, password hash/verify
│   ├── models/                            # SQLAlchemy ORM Models (shared across all services)
│   │   ├── user.py
│   │   ├── category.py
│   │   ├── product.py
│   │   └── order.py
│   └── schemas/                           # Pydantic v2 Request/Response schemas
│       ├── user.py
│       ├── category.py
│       └── product.py
├── auth_service/                           # Authentication Service (Port 8001)
│   ├── main.py                            # FastAPI app + CORS + health check
│   └── routers/
│       └── auth.py                        # /api/v1/auth endpoints
├── admin_service/                          # Admin Management Service (Port 8002)
│   ├── main.py                            # FastAPI app + CORS + health check
│   └── routers/
│       ├── categories.py                  # /api/v1/admin/categories endpoints
│       └── products.py                    # /api/v1/admin/products endpoints
└── jollyjunior_be/                         # Customer Storefront Service (Port 8003)
    ├── main.py                            # FastAPI app + CORS + health check
    └── routers/
        ├── categories.py                  # /api/v1/categories endpoints
        └── products.py                    # /api/v1/products endpoints
```

---

## 4. Environment Configuration (`service_core_libs/.env`)

All services load environment variables from this single central `.env` file:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=jollyjuniors

DATABASE_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/jollyjuniors
SECRET_KEY=<your-secret-key>
```

> **Note:** When running Alembic migrations locally (outside Docker), `@postgres:5432` is automatically remapped to `@localhost:5432` in `alembic/env.py`.

---

## 5. Docker Compose Orchestration

All services are orchestrated from `service_core_libs/docker-compose.yml`. The `Dockerfile` at the `backend/` root is shared across all services.

### Start all services:
```bash
cd backend/service_core_libs
docker compose up --build
```

### Start a single service:
```bash
docker compose up --build auth-service
```

### Service Port Map:

| Service | Container Name | Port |
| :--- | :--- | :--- |
| PostgreSQL | `jollyjuniors_db` | `5432` |
| auth-service | `auth_service` | `8001` |
| admin-service | `admin_service` | `8002` |
| jollyjunior-be | `jollyjunior_be` | `8003` |

### Swagger UI Docs:
- **Auth Service**: http://localhost:8001/docs
- **Admin Service**: http://localhost:8002/docs
- **Customer Service**: http://localhost:8003/docs

---

## 6. Database Migrations (Alembic)

Migrations are configured in `service_core_libs/alembic/`. The `env.py` auto-imports all models and connects to the local PostgreSQL instance.

### Generate a new migration:
```bash
cd backend/service_core_libs
.venv/bin/alembic revision --autogenerate -m "Description of changes"
```

### Apply all pending migrations:
```bash
.venv/bin/alembic upgrade head
```

### Rollback one migration:
```bash
.venv/bin/alembic downgrade -1
```

> **Initial migration** (`Initial tables`) has already been applied and creates all tables listed in Section 2.

---

## 7. REST API Endpoint Specification

### 7.1 Authentication & Profile — `auth_service` (Port 8001)

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register new customer account | No |
| `POST` | `/api/v1/auth/login` | Login, returns JWT Bearer token | No |
| `GET` | `/api/v1/auth/me` | Fetch current logged-in user profile | Yes |
| `GET` | `/health` | Health check | No |

> Login uses OAuth2 `form-data` format (`username` = email, `password`).

### 7.2 Admin Categories — `admin_service` (Port 8002)

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/categories/all` | List all categories (including disabled) | Admin |
| `POST` | `/api/v1/admin/categories/` | Create new category | Admin |
| `PUT` | `/api/v1/admin/categories/{id}` | Update category | Admin |
| `DELETE` | `/api/v1/admin/categories/{id}` | Delete category | Admin |

### 7.3 Admin Products — `admin_service` (Port 8002)

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/products/` | List all products (published or not) | Admin |
| `POST` | `/api/v1/admin/products/` | Create new product | Admin |
| `PUT` | `/api/v1/admin/products/{id}` | Update product | Admin |
| `DELETE` | `/api/v1/admin/products/{id}` | Delete product | Admin |

### 7.4 Customer Categories — `jollyjunior_be` (Port 8003)

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/categories/` | List enabled categories only (`is_enabled=true`) | No |

### 7.5 Customer Products — `jollyjunior_be` (Port 8003)

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/products/` | List published products (`is_published=true`) | No |
| `GET` | `/api/v1/products/{id}` | Get single published product | No |

---

## 8. Auth Flow

```
Client
  │── POST /api/v1/auth/register (email, password, name)
  │── POST /api/v1/auth/login (username=email, password)
  │       └─► Returns: { access_token, token_type: "bearer" }
  │
  │── GET /api/v1/auth/me
  │   Authorization: Bearer <token>
  │       └─► Returns: UserResponse (id, name, email, role, ...)
  │
  │── Admin-only endpoints (admin_service):
      Authorization: Bearer <admin_token>
          └─► Verified by get_current_admin_user() in service_core_libs/auth_deps.py
```

JWT tokens contain: `sub` (user ID), `role` (`customer` | `admin`), `exp`.

---

## 9. Local Development Setup

### Prerequisites
- Python 3.9+
- Docker Desktop running

### Install dependencies locally:
```bash
cd backend/service_core_libs
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Start PostgreSQL via Docker:
```bash
docker compose up postgres -d
```

### Run migrations:
```bash
alembic upgrade head
```

### Run a service locally (no Docker):
```bash
cd backend
PYTHONPATH=. uvicorn auth-service.main:app --reload --port 8001
```

---

## 10. Frontend Integration Guide

Connect the React/Zustand frontend (`useShopStore.ts`) to these microservices:

```env
# JollyJuniors/.env
VITE_AUTH_API_BASE_URL=http://localhost:8001/api/v1
VITE_ADMIN_API_BASE_URL=http://localhost:8002/api/v1
VITE_PUBLIC_API_BASE_URL=http://localhost:8003/api/v1
```

```typescript
// Example store actions in useShopStore.ts
fetchProducts: async () => {
  const res = await axios.get(`${import.meta.env.VITE_PUBLIC_API_BASE_URL}/products`);
  set({ products: res.data });
},
login: async (email, password) => {
  const form = new FormData();
  form.append('username', email);
  form.append('password', password);
  const res = await axios.post(`${import.meta.env.VITE_AUTH_API_BASE_URL}/auth/login`, form);
  // Store token for subsequent requests
  set({ authToken: res.data.access_token });
},
```
