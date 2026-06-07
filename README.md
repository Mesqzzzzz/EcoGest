# 🌿 EcoGest — Plataforma de Gestão Eco-Escolas

O **EcoGest** é uma plataforma web concebida para gerir iniciativas e projetos do programa internacional **Eco-Escolas**, unificando propostas ambientais, reuniões, auditorias ecológicas, relatórios e monitorização de progresso.

### 👥 Grupo 31
*   **Francisco Mesquita**
*   **Sérgio Alves**
*   **Gustavo Silva**

---

## 🐳 Execução do Backend com Docker (Standalone)

O backend possui um **Dockerfile** altamente otimizado para ser executado de forma totalmente independente e isolada, sem necessidade de utilizar o Docker Compose.

### **Requisitos**
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e ativo.

### **Como Correr o Backend com Docker**

1. **Construir a imagem Docker do Backend:**
   Navega até à pasta do backend (ou executa da raiz referenciando a pasta) e constrói a imagem:
   ```bash
   docker build -t ecogest-backend ./backend
   ```

2. **Iniciar o Container:**
   Executa o container expondo a porta `3000`. Como o ficheiro `.env` já está no repositório, ele é copiado para dentro do container automaticamente no build:
   ```bash
   docker run -d \
     --name ecogest-backend \
     -p 3000:3000 \
     ecogest-backend
   ```

3. **Verificar o Funcionamento:**
   *   **API & Documentação Swagger**: Acede a **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)** no teu browser.
   *   **Health Check**: Verifica a saúde da API em **[http://localhost:3000/api/health](http://localhost:3000/api/health)**.

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