# Align — Privacy-First Regulatory & SOP Compliance Intelligence Platform

Align is an enterprise compliance platform designed to map regulations → requirements → company policies → SOPs → actual workflows → compliance findings → remediation.

---

## Monorepo Architecture

```
/
├── docs/                # Architectural & domain documentation
├── infrastructure/      # Local development Docker Compose services
│   └── docker-compose.yml
├── backend/             # Java 21 + Spring Boot 3 REST API engine
└── frontend/            # React + TypeScript + Vite web client
```

---

## Prerequisites

- **Java JDK 17+** (JDK 21 recommended)
- **Node.js 18+** & npm
- **Docker Desktop** (for PostgreSQL local database)

---

## Phase 0 Quick Start Guide

### 1. Start Infrastructure (PostgreSQL)

From the project root:

```bash
docker compose -f infrastructure/docker-compose.yml up -d
```

Verify that PostgreSQL container `align-postgres` is healthy:

```bash
docker ps
```

---

## 2. Backend Setup & Startup

Navigate to `/backend`:

```bash
cd backend
mvn spring-boot:run
```

- **Health Endpoint**: [http://localhost:8080/api/v1/health](http://localhost:8080/api/v1/health)
- **OpenAPI / Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI JSON Spec**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

### Run Backend Tests

```bash
mvn test
```

---

## 3. Frontend Setup & Startup

Navigate to `/frontend`:

```bash
cd frontend
npm install
npm run dev
```

- **Application URL**: [http://localhost:3000](http://localhost:3000)

The frontend automatically connects to `http://localhost:8080/api/v1/health` and displays the real-time status indicator: **Backend: Online / Offline**.

### Run Frontend Tests

```bash
npm test
```

---

## Database Migrations (Flyway)

Flyway automatically handles initial schema migrations on application startup.

Schemas managed under `backend/src/main/resources/db/migration/`:
- `V1__initial_schema.sql`: Scaffolds core tables:
  - `users`
  - `organizations`
  - `organization_members`
