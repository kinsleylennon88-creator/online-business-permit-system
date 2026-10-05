# Online Business Permit System - Complete Render Deployment Guide

This guide explains how to deploy both the **Frontend (React + Vite)** and **Backend (Node.js + Express + Socket.IO)** together on **Render.com** connected to **MongoDB Atlas**, with **no Vercel account required**.

---

## 🏗️ Architecture Overview

The system is configured as a unified Full-Stack Web Service:
- **Build Step (`npm run build`)**: Installs backend & frontend dependencies, then compiles the React SPA into `frontend/dist`.
- **Runtime (`npm start`)**: The Node.js Express server starts, serves all `/api` endpoints, handles WebSocket connections, and serves the compiled React frontend static files with client-side SPA routing.

---

## 📋 Step 1: Configure MongoDB Atlas

1. Open your MongoDB Atlas Dashboard: [https://cloud.mongodb.com/](https://cloud.mongodb.com/)
2. **Whitelist Network Access (Critical for Render)**:
   - Navigate to **Network Access** (under *Security* on the left sidebar).
   - Click **Add IP Address**.
   - Click **Allow Access From Anywhere** (`0.0.0.0/0`).
   - Click **Confirm**. *(Render uses dynamic outbound IP addresses, so this is required).*
3. **Create Database User**:
   - Navigate to **Database Access** (under *Security* on the left sidebar).
   - Click **Add New Database User**.
   - Choose **Password** Authentication.
   - Enter a username (e.g. `bplo_admin`) and a secure password.
   - Set **Database User Privileges** to `Read and write to any database` (or Built-in Role: `Atlas admin`).
   - Click **Add User**.
4. **Copy Connection String**:
   - Navigate to **Database** / **Clusters**.
   - Click **Connect** on your cluster.
   - Choose **Drivers** (Node.js).
   - Copy the connection string format:
     ```
     mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/janiuay?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with the credentials created in Step 1.3.

---

## 🚀 Step 2: Configure & Deploy on Render.com

1. Go to your Render Dashboard: [https://dashboard.render.com/](https://dashboard.render.com/)
2. Open your Web Service (or click **New +** -> **Web Service** if setting up a new one).
3. Connect your GitHub repository:
   - Repository: `https://github.com/kinsleylennon88-creator/online-business-permit-system`
   - Branch: `main`
4. **Settings Configuration**:
   - **Name**: `online-business-permit-system`
   - **Region**: Singapore (or nearest to your users)
   - **Root Directory**: *(Leave blank / empty)*
   - **Environment / Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. **Environment Variables**:
   In the **Environment** tab on Render, add the following variables:

| Key | Example / Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production mode & caching |
| `PORT` | `10000` | Render assigns this automatically |
| `MONGO_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/janiuay` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | *(Generate a random 32+ character string)* | Secret for auth tokens |
| `EMAIL_USER` | `your-email@gmail.com` | (Optional) Gmail address for notifications |
| `EMAIL_PASS` | `your-16-char-app-password` | (Optional) Google App Password for email |
| `OPENAI_API_KEY` | `sk-...` | (Optional) OpenAI API key for chatbot AI |
| `CLOUDINARY_CLOUD_NAME` | `your-cloud-name` | (Optional) Cloudinary name for document uploads |
| `CLOUDINARY_API_KEY` | `your-api-key` | (Optional) Cloudinary API key |
| `CLOUDINARY_API_SECRET` | `your-api-secret` | (Optional) Cloudinary API secret |

6. Click **Save Changes** and click **Manual Deploy** -> **Deploy latest commit** (or **Clear build cache & deploy**).

---

## 🔑 Default Accounts (Auto-seeded on Startup)

When the server starts with a connected database, the system automatically initializes the database with default accounts:

| Role | Email | Password | Access / Portal |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `kerziecandelon@gmail.com` | `admin123` | Full admin analytics, logs, permissions |
| **BPLO Staff** | `bplo.officer@janiuay.gov.ph` | `admin123` | Permit processing & approval |
| **Bureau of Fire** | `fire.reviewer@janiuay.gov.ph` | `fire123` | Fire clearance inspection queue |
| **Bureau of Sanitation**| `sanitation.reviewer@janiuay.gov.ph` | `sanitation123` | Sanitary inspection queue |
| **Citizen / Applicant** | `juan.delacruz@gmail.com` | `password123` | Apply permit & track status |

---

## 💻 Local Development Commands

If you want to run or test locally on your computer:

```bash
# Install all dependencies
npm run install:all

# Run backend (port 5000)
npm run dev:backend

# Run frontend (port 5173)
npm run dev:frontend

# Test full production build locally
npm run build
npm start
```

---

## 🛠️ Troubleshooting

- **Error: `MongoServerError: bad auth`**:
  Check your `MONGO_URI` in Render environment variables. Ensure the username and password match your MongoDB Database User (note: URL-encode special characters in the password).
- **Error: `MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster`**:
  Make sure `0.0.0.0/0` is added in MongoDB Atlas -> Network Access.
- **Page returns 404 on refresh**:
  The Express server is configured with SPA fallback routing. Ensure `npm run build` completed so `frontend/dist` is generated.
