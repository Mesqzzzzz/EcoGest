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

---

## 🧪 Suite de Testes Automatizados

O projeto inclui uma suite completa de testes automatizados abrangendo testes unitários, testes de API, testes de interface UI (Selenium) e testes de performance (Apache JMeter).

### **Como Executar os Testes**

Siga estes passos para executar os testes exatamente como foram executados na validação:

#### **1. Instalar as Dependências da Raiz**
Na pasta raiz do projeto, instale as dependências necessárias para a suite de testes:
```bash
npm install
```

#### **2. Iniciar os Serviços (Local)**
Certifique-se de que o backend local está a correr em `http://localhost:3000` e o frontend em `http://localhost:5173`.
> [!IMPORTANT]
> Se o contentor Docker estiver ativo na porta `3000`, pare-o com `docker stop ecogest-backend` para poder executar o backend localmente com as configurações de teste.

#### **3. Configurar Limites de Pedidos (Rate Limit)**
Para evitar que os testes de login automatizados sejam bloqueados pelo mecanismo de Rate Limit do backend (gerando erros HTTP 429), adicione a seguinte linha no seu ficheiro `backend/.env`:
```env
LOGIN_RATE_LIMIT=1000
```
Inicie/reinicie o backend local com `npm run dev` na pasta `backend` para aplicar esta configuração.

#### **4. Executar os Testes Funcionais (Jest + Selenium)**
Corra a suite completa de testes unitários, de API e de UI sequencialmente de forma invisível (modo headless) com o comando na raiz:
```bash
SELENIUM_HEADLESS=true npm test
```

#### **5. Executar os Testes de Performance (Apache JMeter)**
Corra o teste de carga e concorrência sobre a API (requer o `jmeter` instalado no sistema):
```bash
npm run test:perf
```

Para mais detalhes sobre a estrutura de pastas e integração com relatórios Allure ou Jira Xray, consulte o **[README específico de testes](file:///Users/mesquita/ESMAD/webp2/EcoGest/tests/README.md)**.