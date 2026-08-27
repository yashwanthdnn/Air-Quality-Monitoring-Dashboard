# 🚀 Render Deployment Guide — AeroPulse Full-Stack App

This guide walks you through deploying the **AeroPulse Air Quality & Weather Monitoring** application to [Render](https://render.com) in just a few minutes.

---

## 🏗️ Architecture Overview

AeroPulse is configured as a **unified production build**:
- **Express Backend** (`server/server.js`) runs the API on `/api/*` and serves the pre-compiled **Vite React Frontend** (`client/dist`) for all web requests.
- **Single Web Service**: Requires only **one free Web Service** on Render to run both the frontend and backend together with zero CORS issues and zero extra cost.

---

## 📋 Prerequisites

### 1. Free Cloud MongoDB (MongoDB Atlas)
Render does not include a free managed MongoDB database, so use **MongoDB Atlas** (Free Tier):

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. Create a free **M0 Cluster** (Shared / Free).
3. Under **Security > Database Access**, add a new database user (choose Username and Password).
4. Under **Security > Network Access**, click **Add IP Address** and select **Allow Access from Anywhere (`0.0.0.0/0`)**. *(Required so Render servers can connect)*.
5. In **Database Deployments**, click **Connect** > **Drivers** (Node.js) and copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/aeropulse?retryWrites=true&w=majority
   ```
   *(Replace `<username>` and `<password>` with your database user credentials)*.

---

## ⚡ Deployment Methods

### 🌟 Method 1: Blueprint Deployment via `render.yaml` (Recommended & Fastest)

This repository includes a pre-configured [`render.yaml`](./render.yaml) file for 1-click infrastructure setup:

1. Push your project code to **GitHub** or **GitLab**.
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** in the top right, then select **Blueprint**.
4. Connect your GitHub/GitLab repository.
5. Render will automatically detect `render.yaml` and configure:
   - **Service Name**: `aeropulse-air-quality`
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
6. Under **Environment Variables**, fill in your `MONGODB_URI` from MongoDB Atlas.
7. Click **Apply**. Render will automatically install dependencies, build the React frontend, start the server, and give you a live URL (`https://your-app.onrender.com`)!

---

### 🛠️ Method 2: Manual Web Service Setup

If you prefer to configure the Web Service manually via Render Dashboard:

1. Push your code to **GitHub** or **GitLab**.
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** > **Web Service**.
4. Choose **Build and deploy from a Git repository** and connect your repo.
5. Configure the following settings:
   - **Name**: `aeropulse-air-quality` (or your preferred name)
   - **Region**: Choose the closest region (e.g. *Oregon (US West)*, *Frankfurt (EU)*, or *Singapore (Asia)*)
   - **Branch**: `main` (or `master`)
   - **Root Directory**: *(Leave empty — runs from repository root)*
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm run build
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Instance Type**: `Free`

6. Under **Environment Variables**, click **Add Environment Variable** and add:
   | Key | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production static file serving |
   | `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | `your-secure-random-secret-key` | Random 32+ character string for token encryption |

7. Click **Create Web Service**.

---

## 🔍 Verification & Health Check

Once the deployment completes:

1. Open your Render live URL: `https://<your-service-name>.onrender.com`
2. Test the health endpoint: `https://<your-service-name>.onrender.com/api/health`
   - You should receive:
     ```json
     {
       "status": "healthy",
       "uptime": 24.1,
       "database": "connected",
       "environment": "production"
     }
     ```
3. Test user registration / login and saving favorite cities to verify MongoDB read/writes.

---

## 💡 Troubleshooting & Tips

### 1. MongoDB Connection Warning / Error
- **Symptom**: `database: "disconnected"` in health check or `MongooseServerSelectionError`.
- **Fix**: Make sure you added `0.0.0.0/0` under **Network Access** in MongoDB Atlas, and ensure your database user password does not contain unescaped special characters (e.g., replace `@` with `%40`).

### 2. Free Tier Cold Starts
- On Render's Free tier, instances spin down after 15 minutes of inactivity. The first request after a period of inactivity may take ~30–50 seconds to spin up. Subsequent requests are instant.

### 3. Deploying Frontend Separately (Optional Alternative)
If you ever want to deploy the frontend as a separate **Render Static Site**:
- **Static Site Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist` (in `client` folder)
- **Environment Variable on Static Site**: `VITE_API_BASE_URL=https://<your-backend-api>.onrender.com/api`
