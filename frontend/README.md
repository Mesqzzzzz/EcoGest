# 🌿 EcoGest Frontend — User Portal

This directory contains the client-side application of **EcoGest**, developed using **React** (v19) compiled with **Vite**, and styled with **TailwindCSS** and **Lucide React** icons.

---

## 🛠️ Main Tech Stack & Dependencies

*   **Core**: React 19 + Vite 8
*   **Routing**: React Router Dom v7
*   **Design & UI**: TailwindCSS v3 (responsive, modern, and clean interface)
*   **Icons**: Lucide React
*   **Report Generation**: jsPDF (generates physical PDF reports directly in the client browser)

---

## 🖥️ Portal Modules & Pages

The application is structured modularly in `src/pages`:

1.  **Homepage (`Home.jsx`)**: Public landing page containing ecological impact metrics and a high-level overview of the Eco-Schools program.
2.  **Authentication (`Login.jsx`, `Register.jsx`)**: Interfaces for secure registration and login, utilizing local storage for JWT tokens (Access & Refresh tokens).
3.  **Control Panel / Dashboard (`dashboard/`):**
    *   **Overview (`Overview.jsx`)**: Analytical display showing global statistics and comparative graphs of monthly activity over the past 6 months.
    *   **Projects (`Projects.jsx`)**: Manages the Eco-Schools school years, assigns coordinators, and automatically calculates the project's award level (Bronze, Silver, Gold) based on completed initiatives.
    *   **Activities (`Activities.jsx`)**: A calendar of eco-initiatives, participant registration (with support for external guests), and evidence photo uploads.
    *   **Proposals (`Proposals.jsx`)**: Council members submit environmental proposals for coordinator review and approval.
    *   **Meetings (`Meetings.jsx`)**: Scheduling of council meetings, managing notices, and uploading official meeting minutes in PDF format.
    *   **Audits (`Audits.jsx`)**: Interactive questionnaires with dynamic scores (0, 50, 100 points) divided into critical areas (Water, Energy, Waste).
    *   **Reports (`Reports.jsx`)**: Center for exporting aggregated environmental reports directly to PDF using `jsPDF`.
    *   **Users (`UsersPage.jsx`)**: Administrative panel for managing user accounts and Role-Based Access Control (RBAC).
    *   **Backups (`Backups.jsx`)**: Interface for administrators to trigger and restore database backups.

---

## ⚙️ Local Execution

### **Requirements**
*   Node.js (v20+ recommended)
*   EcoGest Backend running on port `3000`.

### **Steps**

1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   *Visit **[http://localhost:5173](http://localhost:5173)** in your browser.*

3. **Build for Production:**
   ```bash
   npm run build
   ```
   *Optimized production assets will be generated in the `/dist` directory.*

---

## 🐳 Running with Docker (Standalone)

You can build and run this frontend independently inside a Docker container:

1. **Build the Image:**
   ```bash
   docker build -t ecogest-frontend .
   ```
2. **Run the Container:**
   ```bash
   docker run -d --name ecogest-frontend -p 5173:5173 ecogest-frontend
   ```
