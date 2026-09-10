# Align Compliance Intelligence Platform — Architecture Overview

## System Context & Design Principles

Align is engineered as a deterministic compliance intelligence system.
It maps regulatory frameworks directly to corporate policy structures, Standard Operating Procedures (SOPs), runtime operational workflows, audit findings, and automated remediation tasks.

### Core Principles
1. **Zero Black-Box AI Reliance**: AI/ML components are non-critical assist modules; system integrity relies on deterministic state machines and relational mappings.
2. **Vertical Slice Architecture**: Feature slices span full-stack (UI component -> REST DTO -> Domain Entity -> Database Schema -> Audit Log).
3. **Auditability & Traceability**: Every compliance mapping and policy delta retains strict temporal lineage.

---

## Domain Entity Model (Phase 0 Foundation)

```mermaid
erDiagram
    USERS ||--o{ ORGANIZATION_MEMBERS : "belongs to"
    ORGANIZATIONS ||--o{ ORGANIZATION_MEMBERS : "has member"

    USERS {
        uuid id PK
        string email UK
        string password_hash
        string full_name
        string role
        string status
        timestamp created_at
        timestamp updated_at
    }

    ORGANIZATIONS {
        uuid id PK
        string name
        string slug UK
        string domain
        string status
        timestamp created_at
        timestamp updated_at
    }

    ORGANIZATION_MEMBERS {
        uuid id PK
        uuid organization_id FK
        uuid user_id FK
        string member_role
        string status
        timestamp joined_at
    }
```
