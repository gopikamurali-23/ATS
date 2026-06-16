








                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        













































































# TalentPulse - Applicant Tracking System & Resume AI Analyzer

TalentPulse is a premium, production-ready AI-powered Applicant Tracking System (ATS) and Resume Analyzer platform built with Spring Boot 3, React, Tailwind CSS, and PostgreSQL.

## Features

1. **AI Resume Analytics**: Instantly parses PDF/Word resumes locally, estimating experience years, extracting education, matching skills against dictionaries, and calculating ATS fit.
2. **Dashboard Analytics**: Integrated metrics, SVG bar charts, and funnel statistics.
3. **Candidate Ranking**: Auto-ranks job submissions based on calculated final matching percentages.
4. **Role Security (JWT)**: Candidates, Companies, and Admins can log in and view their role-appropriate portals.
5. **Database Resilience**: Configured to run on an in-memory H2 database by default for easy testing, with options to deploy on PostgreSQL immediately.

---

## Directory Structure

```
c:\Data\FDSmax\projects\ATS\
  ├── backend/               # Spring Boot 3 REST API Backend
  ├── frontend/              # Vite + React + Tailwind CSS Web Client
  ├── backend.Dockerfile     # Production build Dockerfile for Backend
  ├── frontend.Dockerfile    # Nginx + SPA Fallback routing for Frontend
  └── docker-compose.yml     # PostgreSQL + Web Client + Backend deployment orchestrator
```

---

## Running Locally

### Prerequisites

- Java 21 JDK
- Node.js (v18+)
- Maven (v3+)

### 1. Starting the Backend

Go to the `backend/` directory:
```bash
mvn spring-boot:run
```
- Server launches on: `http://localhost:8080`
- Interactive Swagger API Documentation: `http://localhost:8080/swagger-ui.html`
- In-memory H2 database console: `http://localhost:8080/h2-console` (Credentials specified in `application.properties`)

### 2. Starting the Frontend

Go to the `frontend/` directory:
```bash
npm install
npm run dev
```
- Browser launches on: `http://localhost:3000` (proxies `/api` calls automatically to `8080`).

---

## Docker Deployment (PostgreSQL integration)

To build and launch the database container alongside the web and service components:
```bash
docker-compose up --build
```
- Web Portal: `http://localhost:80` (or `http://localhost`)
- API endpoints: `http://localhost:8080`
- PostgreSQL Database: `localhost:5432`

---

## Demo Accounts (Pre-seeded at Startup)

| Role | Username | Password |
| :--- | :--- | :--- |
| **Candidate** | john_doe | john123 |
| **Company** | google | google123 |
| **Admin** | admin | admin123 |
