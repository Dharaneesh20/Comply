# Align — Privacy-First Regulatory & SOP Compliance Intelligence Platform

Align is an enterprise compliance intelligence platform designed to map regulations → requirements → company policies → SOPs → actual workflows → compliance findings → remediation.

---

## Monorepo Architecture

```text
/
├── docs/                # Architectural & domain documentation
├── backend/             # Java 21 + Spring Boot 3 REST API + Spring Data MongoDB
├── frontend/            # React + TypeScript + Vite web client
├── docker-compose.yml   # Multi-container orchestration (frontend, backend, mongodb)
└── .env.example         # Environment template
```

---

## Prerequisites

- **Java JDK 21+**
- **Node.js 18+** & npm
- **Docker Desktop / Docker Engine** (for running MongoDB or full stack containers)

---

## Quick Start (Docker Compose)

From the project root:

```bash
docker compose up -d
```

Verify running containers:

```bash
docker compose ps
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API Health**: [http://localhost:8080/api/v1/health](http://localhost:8080/api/v1/health)
- **OpenAPI / Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

---

## Local Development (Without Docker Compose)

### 1. Start MongoDB Container

```bash
docker run -d --name align-mongodb -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=align_user \
  -e MONGO_INITDB_ROOT_PASSWORD=align_password \
  -e MONGO_INITDB_DATABASE=align_db \
  mongo:7.0
```

### 2. Run Backend

Navigate to `/backend`:

```bash
cd backend
mvn spring-boot:run
```

Run backend test suite:

```bash
mvn test
```

### 3. Run Frontend

Navigate to `/frontend`:

```bash
cd frontend
npm install
npm run dev
```

Run frontend test suite:

```bash
npm test -- --watch=false
```

---

## Health API Specification

`GET /api/v1/health`

Response:
```json
{
  "application": "UP",
  "database": "UP"
}
```
