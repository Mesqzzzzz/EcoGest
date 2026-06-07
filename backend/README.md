# 🌿 EcoGest Backend — REST API

Este diretório contém a **API REST** do **EcoGest**, construída em **Node.js** com a framework **Express** e persistência em **MongoDB** utilizando a biblioteca **Mongoose**.

---

## 🛠️ Tecnologias Principais

*   **Runtime**: Node.js (v20+ recomendado)
*   **Framework**: Express
*   **Base de Dados**: MongoDB (Atlas ou Local) via Mongoose ODM
*   **Segurança e Criptografia**: JSON Web Tokens (JWT), bcryptjs (Hashing) e crypto (Refresh Token)
*   **Uploads**: Multer (gestão física de ficheiros no disco)
*   **Documentação**: Swagger UI (`swagger-ui-express`)

---

## ⚙️ Configuração Local e Execução

### **1. Variáveis de Ambiente**
O ficheiro `.env` com as configurações da API (incluindo a ligação ao MongoDB Atlas `MONGODB_URI` e o `JWT_SECRET`) já se encontra incluído e versionado no repositório. Não necessita de criar ou copiar ficheiros de exemplo — a aplicação está pronta para ser executada.

### **2. Instalar Dependências**
Instale os pacotes npm necessários:
```bash
npm install
```

### **3. Iniciar o Servidor**

*   **Modo de Desenvolvimento** (com auto-reload usando `nodemon`):
    ```bash
    npm run dev
    ```
*   **Modo de Produção**:
    ```bash
    npm start
    ```

---

## 🐳 Execução com Docker (Standalone)

Pode construir e executar este backend de forma independente no Docker. Como o ficheiro `.env` está incluído na pasta, ele é copiado automaticamente para dentro do container durante a construção da imagem (build):

1. **Construir a Imagem:**
   ```bash
   docker build -t ecogest-backend .
   ```
2. **Iniciar o Container:**
   ```bash
   docker run -d --name ecogest-backend -p 3000:3000 ecogest-backend
   ```

## 🔍 Documentação e Testes

*   **API Interactive Playground (Swagger)**: Com o servidor a correr, aceda a **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)** para ver a especificação técnica de todos os endpoints da API, parâmetros exigidos e respostas JSON em tempo real.
*   **Testes da API (Postman)**: Pode importar a coleção do Postman localizada na raiz do projeto: **[EcoGest_API.postman_collection.json](../EcoGest_API.postman_collection.json)**. Ela contém todos os pedidos configurados (Login, Registo, Atividades, Reuniões, Auditorias, etc.) com salvamento automático do token JWT após o login.
