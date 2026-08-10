# 🌿 EcoGest — Eco-Schools Management Platform

[![Node.js Version](https://img.shields.io/badge/node-v20+-green.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-v19-blue.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/tailwind-v3-cyan.svg)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/docker-standalone-blue.svg)](https://www.docker.com/)

**EcoGest** is a modern web application designed to manage initiatives and projects for the international **Eco-Schools** program. It integrates and unifies environmental proposals, council meetings, ecological audits, visual reports, and progress monitoring into a single web portal.

---

## 🐳 Backend Standalone Execution (Docker)

The backend has an optimized, standalone **Dockerfile** that allows running it independently without needing Docker Compose.

### **Requirements**
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### **Step-by-step Setup**

1. **Build the Backend Docker image:**
   Navigate to the backend directory (or reference the folder from the root) and build the image:
   ```bash
   docker build -t ecogest-backend ./backend
   ```

2. **Run the Container:**
   Run the container exposing port `3000`. Since the `.env` file is already in the repository, it will be automatically copied into the container during the build:
   ```bash
   docker run -d \
     --name ecogest-backend \
     -p 3000:3000 \
     ecogest-backend
   ```

3. **Verify Execution:**
   *   **Swagger API Docs**: Visit **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)** in your browser.
   *   **Health Check**: Check the API status at **[http://localhost:3000/api/health](http://localhost:3000/api/health)**.

---

## ⚙️ Manual Execution (Without Docker)

If you prefer to run services manually on your local system:

### **1. Backend**
1. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend && npm install
   ```
2. Verify that your `backend/.env` file is configured properly.
3. Start the development server:
   ```bash
   npm run dev
   ```

### **2. Frontend**
1. Navigate to the frontend directory and install dependencies:
   ```bash
   cd ../frontend && npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The portal will be accessible at `http://localhost:5173`.*

---

## 🛠️ Technology Stack

*   **Frontend**: React.js (Vite), TailwindCSS, Lucide Icons, React Router, jsPDF.
*   **Backend**: Node.js, Express, MongoDB (Mongoose), JWT (Access + Refresh Token Rotation), bcryptjs, Multer, Swagger UI.

---

## 🔒 Security Features

*   **Access & Refresh Token Rotation**: 15-minute expiration for access tokens; silent token rotation and invalidation.
*   **Rate Limiting**: Rate limiter set to 5 login attempts per IP per minute, persisted in MongoDB (`AuthLog`) (returns HTTP 429).
*   **Password Hashing**: Passwords encrypted using `bcryptjs` with 10 salt rounds.
*   **Role-Based Access Control (RBAC)**: Detailed access control based on user roles (`admin`, `coordinator`, `secretary`, `council_member`, `user`).

---

## 🧪 Automated Test Suite

The project includes an automated test suite covering unit tests, API integration tests, E2E UI tests (Selenium), and load/performance tests (Apache JMeter).

### **How to Run the Tests**

Follow these steps to run the test suite locally:

#### **1. Install Root Dependencies**
At the root directory, install the required testing dependencies:
```bash
npm install
```

#### **2. Start Local Services**
Make sure the local backend is running on `http://localhost:3000` and the frontend is on `http://localhost:5173`.
> [!IMPORTANT]
> If the Docker container is active on port `3000`, stop it using `docker stop ecogest-backend` to run the local backend server with test configurations.

#### **3. Configure Rate Limits for Testing**
To prevent automated login tests from being blocked by the backend's Rate Limiting mechanism (which returns HTTP 429), add the following line to your `backend/.env` file:
```env
LOGIN_RATE_LIMIT=1000
```
Restart the local backend with `npm run dev` to apply this change.

#### **4. Run Functional Tests (Jest + Selenium)**
Run the complete suite of unit, API, and UI tests sequentially in headless mode using:
```bash
SELENIUM_HEADLESS=true npm test
```

#### **5. Run Performance Tests (Apache JMeter)**
Execute load and concurrency tests against the API (requires `jmeter` installed and available in system PATH):
```bash
npm run test:perf
```

For more details on folder structure, Allure reports, and Jira Xray integration, check the **[Automated Test Suite Guide](file:///tests/README.md)**.
