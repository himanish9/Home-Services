# HomeServe – Cloud Deployment & Hosting Guide

This guide provides step-by-step instructions to deploy the **HomeServe** full-stack platform to free, high-performance cloud infrastructure:
- **Database**: Cloud MySQL 8.0 (Aiven / Railway / TiDB)
- **Backend API**: Render / Railway (Node.js & Express)
- **Frontend App**: Vercel / Netlify (React & Vite SPA)

---

## Architecture Overview

```
[ Client Browser ]
       │
       ▼ (HTTPS)
[ Vercel / Netlify CDN ]  ───►  Frontend (React SPA)
       │
       ▼ (REST API / Axios)
[ Render / Railway ]      ───►  Backend (Node.js + Express)
       │
       ▼ (mysql2 connection pool over TLS)
[ Aiven / Railway Cloud ] ───►  Database (MySQL 8.0)
```

---

## Step 1: Provision Cloud MySQL Database

You can use **Aiven for MySQL** (free credits), **Railway**, or **Clever Cloud**.

### Using Railway or Aiven:
1. Create a free account at [railway.app](https://railway.app) or [aiven.io](https://aiven.io).
2. Click **New Project** → **Provision MySQL**.
3. Once provisioned, locate your connection credentials:
   - `DB_HOST` (e.g., `mysql.railway.internal` or `*.aivencloud.com`)
   - `DB_PORT` (e.g., `3306` or custom port)
   - `DB_USER` (e.g., `root` or `avnadmin`)
   - `DB_PASSWORD` (provided password)
   - `DB_NAME` (e.g., `railway` or `homeserve`)

### Run Database Schema Migration:
Connect to your cloud MySQL instance using MySQL Workbench, DBeaver, or the MySQL CLI, and execute the initialization script:
```bash
mysql -h <DB_HOST> -P <DB_PORT> -u <DB_USER> -p <DB_NAME> < homeserve-backend/database.sql
```
This sets up all 7 relational tables, 8 pre-seeded service categories, foreign key constraints, and default demo user accounts.

---

## Step 2: Deploy Backend API on Render

1. Sign up / log in to [render.com](https://render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository (`HomeServe`).
4. Configure service settings:
   - **Name**: `homeserve-api`
   - **Region**: Choose closest to you (e.g., Singapore or Frankfurt)
   - **Root Directory**: `homeserve-backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add the following **Environment Variables** in Render's dashboard:

| Variable | Value |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `DB_HOST` | `<Your cloud MySQL host>` |
| `DB_PORT` | `<Your cloud MySQL port>` |
| `DB_USER` | `<Your cloud MySQL user>` |
| `DB_PASSWORD` | `<Your cloud MySQL password>` |
| `DB_NAME` | `<Your cloud MySQL database name>` |
| `JWT_SECRET` | `<A secure 32+ character random string>` |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | `https://<your-frontend-subdomain>.vercel.app` |

6. Click **Deploy Web Service**.
7. Once deployed, test your health check at:
   `https://homeserve-api.onrender.com/api/health`
   Expected response:
   ```json
   {
     "success": true,
     "message": "HomeServe API server is healthy and running smoothly"
   }
   ```

---

## Step 3: Deploy Frontend on Vercel

1. Sign up / log in to [vercel.com](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository (`HomeServe`).
4. Configure the build parameters:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `homeserve-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Configure Environment Variable:

| Name | Value |
| :--- | :--- |
| `VITE_API_URL` | `https://homeserve-api.onrender.com/api` |

*(Note: Replace with your actual live Render backend URL, appending `/api`)*

6. Click **Deploy**.
7. In a few seconds, your production URL will be live (e.g., `https://homeserve.vercel.app`).
8. Return to Render and ensure `CLIENT_URL` in backend environment variables matches your exact Vercel URL.

---

## Single Page Application (SPA) Routing Note

When users refresh on deep routes (e.g., `/customer/bookings` or `/worker/dashboard`), static hosts return 404 unless rewrites are configured.

This project already contains:
- `homeserve-frontend/vercel.json` for Vercel rewrites.
- `homeserve-frontend/public/_redirects` for Netlify rewrites.

No manual rewrite setup is required.

---

## Production Verification Checklist

- [ ] Backend health check responds with HTTP 200 at `GET /api/health`.
- [ ] Frontend successfully loads service categories from backend API.
- [ ] User login works with demo credentials:
  - Customer: `customer@homeserve.com` / `Password123!`
  - Worker: `worker@homeserve.com` / `Password123!`
  - Admin: `admin@homeserve.com` / `Password123!`
- [ ] Booking creation persists to cloud MySQL and displays on Customer Bookings dashboard.
- [ ] Provider dashboard displays matching open jobs and allows status progression.
