# 🌿 EcoGest Backend — REST API

This directory contains the **REST API** for **EcoGest**, built using **Node.js** with the **Express** framework, and **MongoDB** database persistence through the **Mongoose** library.

---

## 🛠️ Main Tech Stack

*   **Runtime**: Node.js (v20+ recommended)
*   **Framework**: Express
*   **Database**: MongoDB (Atlas or Local) via Mongoose ODM
*   **Security & Cryptography**: JSON Web Tokens (JWT), bcryptjs (hashing) and crypto (refresh token rotation)
*   **File Uploads**: Multer (managing physical file storage on disk)
*   **API Documentation**: Swagger UI (`swagger-ui-express`)

---

## ⚙️ Local Setup and Execution

### **1. Environment Variables**
The `.env` file containing the default API settings (including the MongoDB connection URI `MONGODB_URI` and `JWT_SECRET`) is already included and versioned in the repository. You do not need to create or copy any example configurations — the application is ready to run immediately.

### **2. Install Dependencies**
Install the required npm packages:
```bash
npm install
```

### **3. Start the Server**

*   **Development Mode** (with auto-reload using `nodemon`):
    ```bash
    npm run dev
    ```
*   **Production Mode**:
    ```bash
    npm start
    ```

---

## 🐳 Running with Docker (Standalone)

You can build and run this backend independently inside a Docker container. The `.env` file is automatically copied into the container during the build process:

1. **Build the Image:**
   ```bash
   docker build -t ecogest-backend .
   ```
2. **Run the Container:**
   ```bash
   docker run -d --name ecogest-backend -p 3000:3000 ecogest-backend
   ```

---

## 🔍 API Documentation & Testing

*   **API Interactive Playground (Swagger)**: With the server running, navigate to **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)** in your browser to view the technical specification of all API endpoints, parameters, and live JSON responses.
*   **Postman Collection**: You can import the Postman test collection located at the root of the project: **[EcoGest_API.postman_collection](../EcoGest_API.postman_collection)**. It contains pre-configured requests (Login, Register, Activities, Meetings, Audits, etc.) with automatic session token extraction.
