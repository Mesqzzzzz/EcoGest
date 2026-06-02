# 🌿 EcoGest — Plataforma de Gestão Eco-Escolas

O **EcoGest** é uma plataforma web concebida para gerir iniciativas e projetos do programa internacional **Eco-Escolas**, unificando propostas ambientais, reuniões, auditorias ecológicas, relatórios e monitorização de progresso.

### 👥 Grupo 31
*   **Francisco Mesquita**
*   **Sérgio Alves**
*   **Gustavo Silva**

---

## 🐳 Execução Rápida com Docker Compose (Recomendado)

O projeto está totalmente dockerizado para facilitar a inicialização. Segue as instruções abaixo para correr a aplicação:

### **Requisitos**
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e ativo.

### **Como Correr**
Na raiz do projeto, executa o seguinte comando no teu terminal:
```bash
docker compose up --build
```

*   **Frontend**: Acede a **[http://localhost:5173](http://localhost:5173)** no teu browser.
*   **Backend & Swagger API Docs**: Acede a **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**.

> [!NOTE]
> Por padrão, a aplicação liga-se ao **MongoDB Atlas** configurado em `backend/.env` para manter todos os teus dados de teste atuais. Se preferires utilizar uma base de dados MongoDB local em container, descomenta a linha `MONGODB_URI` no ficheiro `docker-compose.yml`.

---

## ⚙️ Execução Manual (Sem Docker)

Se preferires correr os serviços manualmente:

### **1. Backend**
1. Acede à pasta do backend e instala as dependências:
   ```bash
   cd backend && npm install
   ```
2. Garante que tens o teu ficheiro `backend/.env` configurado.
3. Inicia o servidor:
   ```bash
   npm run dev
   ```

### **2. Frontend**
1. Acede à pasta do frontend e instala as dependências:
   ```bash
   cd ../frontend && npm install
   ```
2. Inicia o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

---

## 🛠️ Tecnologias Principais (Stack)
*   **Frontend**: React.js (Vite), TailwindCSS, Lucide Icons, React Router, jsPDF.
*   **Backend**: Node.js, Express, MongoDB (Mongoose), JWT (Access + Refresh Token Rotation), bcryptjs, Multer, Swagger UI.

---

## 🔒 Segurança Implementada
*   **Access & Refresh Token Rotation**: Acesso de 15 minutos; renovação e invalidação silenciosa de tokens.
*   **Rate Limiting**: Limite de 5 tentativas de login por IP/minuto persistido no MongoDB (`AuthLog`) (retorna HTTP 429).
*   **Hashing**: Passwords encriptadas via `bcryptjs` (10 salt rounds).
*   **RBAC**: Controlo de acesso baseado em funções (`admin`, `coordinator`, `secretary`, `council_member`, `user`).