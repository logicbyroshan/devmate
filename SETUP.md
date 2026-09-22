# DevMate Portfolio — Complete Setup Guide

This guide provides end-to-end instructions for running the DevMate Portfolio frontend locally on Windows, macOS, and Linux.

---

## Architecture Overview

- **Frontend (`DevMate`)**: Pure Standalone React 18, Vite 5, Lenis Smooth Scroll, KaTeX, Mermaid, Shiki, and Vanilla CSS Design System.
- **Backend (`DevAdmin`)**: External Headless Django REST API + PostgreSQL backend managing database records and staff CMS.
- **Resilience**: Operates with full local UI fidelity and glowing empty states if DevAdmin API is offline or unconfigured.

---

## Prerequisites

- **Node.js**: Version 18.x or 20.x (LTS recommended)
- **Git**: Version 2.30+

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/logicbyroshan/devmate-portfolio.git
cd devmate-portfolio
```

---

## Step 2: Install Dependencies

```bash
npm install
```

---

## Step 3: Environment Configuration (Optional)

Copy the example environment file to configure your connection to the DevAdmin API:

```bash
cp .env.example .env
```

| Variable | Default (Dev) | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | Base URL of DevAdmin REST API (e.g. `https://admin.logicbyroshan.in/api`) |
| `VITE_API_TIMEOUT_MS` | `7000` | HTTP request timeout threshold in milliseconds |
| `VITE_API_RETRY_ATTEMPTS` | `1` | Number of automatic retries on network/server errors |
| `VITE_PORTFOLIO_CACHE_TTL_MS` | `300000` | Session cache TTL for aggregated bootstrap payload (5 minutes) |

---

## Step 4: Start Local Development Server

```bash
npm run dev
```

*Frontend will run at: `http://localhost:5173/`*

---

## Running Automated Test Suites & Verification

```bash
npm test        # Runs Vitest unit test suite (16 tests)
npm run lint    # Runs ESLint checks (0 warnings)
npm run build   # Validates and compiles production Vite bundle
```

