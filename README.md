# 💎 HiraFund — Expense & Pool Money Management

HiraFund is a collaborative expense and pool money management web application where group members contribute money to an admin pool, and the admin handles payments for group expenses.

---

## 📁 Repository Structure (Deployment-Ready)

The project is cleanly separated into two standalone folders for effortless deployment:

```
HiraFund/
├── client/                 # Frontend React SPA (Vite + Tailwind CSS) -> Deploy to Vercel
│   ├── src/
│   ├── vercel.json         # React Router SPA rewrite rules
│   ├── .env.example        # Frontend environment variables template
│   └── package.json
├── server/                 # Backend Node.js / Express API -> Deploy to Render
│   ├── config/             # MongoDB Atlas connection setup
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── server.js           # API server entrypoint & Render health check
│   ├── .env.example        # Backend environment variables template
│   ├── render.yaml         # One-click Render Blueprint configuration
│   └── package.json
├── package.json            # Root workspace scripts
└── README.md
```

---

## 🚀 Step-by-Step Deployment Guide

### 1️⃣ Database Setup: MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in or create a free account.
2. Create a new **FREE** cluster (M0).
3. Under **Database Access**, create a new database user with a secure password.
4. Under **Network Access**, click **Add IP Address** and select **Allow Access From Anywhere** (`0.0.0.0/0`). This is required so Render servers can connect to your database.
5. Go to **Database** → click **Connect** on your cluster → select **Drivers** (Node.js) → copy your connection string.
6. Replace `<password>` with your database user password:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/hirafund?retryWrites=true&w=majority
   ```

---

### 2️⃣ Backend Deployment: Render

You can deploy the backend to Render in **2 easy ways**:

#### Option A: One-Click Render Blueprint (Recommended)
1. Push this repository to GitHub.
2. Log in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New** → **Blueprint** and select your repository.
4. Render will automatically read `render.yaml` and prompt you to enter:
   - `MONGO_URI`: Your MongoDB Atlas connection string from Step 1.
   - `CLIENT_URL`: Your frontend URL (e.g., `https://hirafund.vercel.app`).
5. Click **Apply** to deploy!

#### Option B: Manual Web Service Setup
1. In Render, click **New** → **Web Service** and connect your GitHub repository.
2. Configure the service settings:
   - **Name**: `hirafund-backend`
   - **Root Directory**: `server` *(Important)*
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `MONGO_URI` = `mongodb+srv://...` (your Atlas connection string)
   - `JWT_SECRET` = `your_strong_random_secret`
   - `CLIENT_URL` = `https://your-frontend-domain.vercel.app`
4. Click **Create Web Service**.
5. Once deployed, note down your backend URL (e.g., `https://hirafund-backend.onrender.com`).
6. **Optional (Seed Admin User)**: In the Render Shell tab, run `npm run seed` to create the default admin account (`admin@hirafund.com` / password: `admin`).

---

### 3️⃣ Frontend Deployment: Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/) and click **Add New** → **Project** → Import your GitHub repository.
2. Configure project settings:
   - **Root Directory**: Click **Edit** next to Root Directory and select `client`.
   - **Framework Preset**: `Vite` (automatically detected).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Expand **Environment Variables** and add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-render-backend.onrender.com/api` *(Your Render backend URL with `/api` at the end)*
4. Click **Deploy**.
5. Once deployed, update your backend's `CLIENT_URL` environment variable on Render with your Vercel domain so CORS allows requests from your app.

---

## 💻 Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or a local MongoDB instance

### Quick Start (Monorepo Commands)
1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd HiraFund
   ```

2. **Configure Backend Environment**:
   - Copy `server/.env.example` to `server/.env`:
     ```bash
     cp server/.env.example server/.env
     ```
   - Add your `MONGO_URI` in `server/.env`.

3. **Configure Frontend Environment**:
   - Copy `client/.env.example` to `client/.env`:
     ```bash
     cp client/.env.example client/.env
     ```

4. **Install Dependencies & Start Locally**:
   - Open two terminal tabs:
     - **Terminal 1 (Backend)**:
       ```bash
       npm run dev:server
       ```
       Backend runs on `http://localhost:5000`.
     - **Terminal 2 (Frontend)**:
       ```bash
       npm run dev:client
       ```
       Frontend runs on `http://localhost:5173`.

---

## 🛠️ Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Axios, Recharts
- **Backend**: Node.js, Express 5, Mongoose, JSON Web Tokens (JWT), Security Middleware (Helmet, CORS, Rate Limiting)
- **Database**: MongoDB Atlas (Cloud NoSQL)
- **Hosting**: Vercel (Client) + Render (Server)
