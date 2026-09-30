# Product & Architectural Overview

### What it does & Why I built it
I built this [File Processing Platform](https://file-processing-platform.viktorlab.io.vn) to solve performance bottlenecks caused by heavy, synchronous file uploads and data parsing. It offloads compute-heavy file transformations to an asynchronous background worker pipeline, keeping the core API responsive and ensuring a non-blocking user experience under load.

### Key Decisions & Trade-offs
- **Self-Hosted Containerization vs. Managed PaaS:** I deployed the system on a standalone VPS using custom [Docker Containerization](./Dockerfile) orchestrated via [Docker Compose](./docker-compose.yml). 
  * *Trade-off:* Requires manual SSL configuration, server monitoring, and security management, but drastically cuts operational costs and provides full infrastructural control.
- **Asynchronous Queue Architecture:** API requests offload processing immediately to a background queue. 
  * *Trade-off:* Introduces eventual consistency and state management complexity, but prevents HTTP request timeouts during heavy concurrent workloads.

### Repository Deep-Dives
- 📘 [Full System Architecture & API Documentation](./README.md)
- 🐳 [Docker & Deployment Configuration](./docker-compose.yml)
