# DevMate Portfolio — Complete Setup Guide

This guide provides end-to-end instructions for running the DevMate Portfolio project locally on Windows, macOS, and Linux.

---

## Architecture Overview

- **Backend (`server/`)**: Python 3.11+, Django 5.2, Django REST Framework, SQLite (Development) / PostgreSQL (Production).
- **Frontend (`client/`)**: React 18, Vite 5, Lenis Smooth Scroll, KaTeX, Mermaid, Vanilla CSS Design System.

---

## Prerequisites

- **Python**: Version 3.11 or higher
- **Node.js**: Version 18.x or 20.x (LTS recommended)
- **Git**: Version 2.30+

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/logicbyroshan/devmate-portfolio.git
cd devmate-portfolio
```

---

## Step 2: Backend Setup (Django)

1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create local environment file:
   ```bash
   # Copy sample development environment
   cp .env.example .env
   ```

5. Apply database migrations:
   ```bash
   python manage.py migrate
   ```

6. Seed initial portfolio data & categories:
   ```bash
   python manage.py loaddata portfolio/fixtures/initial_data.json
   ```

7. (Optional) Create a superuser for administrative access:
   ```bash
   python manage.py createsuperuser
   ```

8. Start the Django development server:
   ```bash
   python manage.py runserver 8000
   ```
   *Backend will be accessible at: `http://127.0.0.1:8000/`*
   *Admin Panel: `http://127.0.0.1:8000/dashboard/`*

---

## Step 3: Frontend Setup (React + Vite)

1. Open a new terminal and navigate to the `client/` directory:
   ```bash
   cd client
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Frontend will run at: `http://localhost:5173/`*
   *The Vite proxy forwards `/api/*` and `/media/*` requests directly to Django on port 8000.*

---

## Running Automated Test Suites

### Backend Unit & Integration Tests:
```bash
cd server
python manage.py test
```

### Frontend Tests, Linting & Build Verification:
```bash
cd client
npm test        # Runs Vitest unit suite
npm run lint    # Runs ESLint checks
npm run build   # Validates production Vite bundle
```

---

## Environment Variables Reference

| Variable | Default (Dev) | Description |
|---|---|---|
| `DJANGO_SECRET_KEY` | `django-insecure-...` | Cryptographic secret key for hashing and sessions |
| `DJANGO_DEBUG` | `True` | Debug mode (Must be `False` in production) |
| `DJANGO_ALLOWED_HOSTS` | `127.0.0.1,localhost` | Comma-separated list of valid Host headers |
| `PORTFOLIO_API_KEY` | `(empty)` | Optional API key requirement for external consumers |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173...` | Allowed cross-origin domains |
| `CSRF_TRUSTED_ORIGINS` | `http://localhost:5173...` | Trusted origins for state-modifying requests |
