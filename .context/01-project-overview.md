# Project Overview

## Identity

**Name:** File Processing Platform
**Type:** Engineering Portfolio Project
**Purpose:** Demonstrate production-quality full-stack engineering through a realistic, async file-processing system.

This is not a commercial product. Business complexity is intentionally simple so that technical excellence — architecture, patterns, and engineering depth — remains the primary showcase.

---

## Goals

| Goal | Description |
|---|---|
| Full-stack depth | Showcase modern React and Node.js in a realistic, end-to-end system |
| Async architecture | Demonstrate queue-based background processing with BullMQ and Redis |
| Real-time communication | WebSocket-driven progress updates from worker to browser |
| Scalable backend design | Modular, service-oriented backend that mirrors production systems |
| Infrastructure literacy | Multi-container Docker architecture with reverse proxy and service isolation |
| Portfolio quality | Clean code, consistent patterns, and proper documentation throughout |

---

## Domain Summary

The platform simulates systems like Google Drive, Dropbox, Cloudinary, and document-conversion services. Users upload files, the platform processes them asynchronously in the background, and users can track progress in real time before downloading the result.

The frontend is organised around three product pillars, each served by a dedicated section of the UI:

| Pillar | Purpose |
|---|---|
| **Converter** | Convert files between formats (e.g. image → PDF, DOCX → PDF) |
| **Compressor** | Reduce file size for images, PDFs, and archives |
| **Tools** | Miscellaneous file utilities |

A shared **Files** section acts as the general-purpose file manager (upload, browse, download, delete).

The domain is deliberately thin on business rules to keep complexity from obscuring the engineering patterns underneath.

---

## Core User Capabilities

- Authenticate (register, login, token refresh, logout)
- Upload one or more files
- Submit files for processing
- Watch processing progress live (via WebSocket)
- Download processed results
- Manage their file library (list, search, filter, delete)

---

## Technology Choices and Rationale

### Frontend

| Technology | Rationale |
|---|---|
| React + TypeScript | Industry-standard UI library; TypeScript enforces correctness |
| React Router | Declarative, nested routing for SPA navigation |
| TanStack Query | Server-state management, caching, background refetching |
| Zustand | Lightweight client-state management (auth, UI state) |
| Axios | HTTP client with interceptors for token refresh |
| WebSocket (native) | Real-time progress streaming without heavy library overhead |

### Backend

| Technology | Rationale |
|---|---|
| Node.js + TypeScript | High-throughput I/O, large ecosystem, portfolio relevance |
| Fastify | Low-overhead HTTP framework with schema validation built in |
| PostgreSQL | Relational database for structured file metadata and job records |
| Redis | In-memory store; powers BullMQ queues and optionally caches hot data |
| BullMQ | Robust, Redis-backed job queue with retries, delays, and priority |
| WebSocket (ws) | Push job-progress events to connected clients |

### Infrastructure

| Technology | Rationale |
|---|---|
| Docker + Compose | Reproducible local environment; mirrors production container topology |
| Nginx | Reverse proxy, static asset serving, WebSocket upgrade, SSL termination point |
| JWT + Refresh Tokens | Stateless authentication with short-lived access tokens |

---

## What This Project Is Not

- Not a production SaaS product — no billing, no multi-tenancy, no SLA
- Not a storage service — file storage is local (or a simple S3-compatible volume); durability is not the focus
- Not optimized for massive scale — patterns are correct but not pre-optimized
