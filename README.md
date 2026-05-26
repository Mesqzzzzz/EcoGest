# 🌿 EcoGest — Plataforma de Gestão Eco-Escolas

O **EcoGest** é uma plataforma web concebida para gerir iniciativas e projetos no âmbito do programa internacional **Eco-Escolas**. A aplicação foi projetada para unificar propostas ambientais, reuniões, auditorias ecológicas, relatórios e acompanhamento do nível dinâmico dos projetos anuais.

---

## 🚀 Tecnologias Usadas (Stack)

A plataforma é dividida numa arquitetura desacoplada cliente-servidor (Frontend e Backend):

### **Frontend**
*   **Biblioteca Principal**: [React.js](https://react.dev/) (construído com [Vite](https://vite.dev/))
*   **Estilização**: [TailwindCSS](https://tailwindcss.com/) (layouts e utilitários modernos, responsivos e dinâmicos)
*   **Ícones**: [Lucide React](https://lucide.dev/) (design minimalista e consistente)
*   **Roteamento**: [React Router DOM v6](https://reactrouter.com/) (rotas protegidas e baseadas em layouts dinâmicos)
*   **Geração de Documentos**: [jsPDF](https://rawgit.com/MrRio/jsPDF/master/docs/index.html) (exportação de relatórios dinâmicos diretamente do navegador)

### **Backend**
*   **Ambiente de Execução**: [Node.js](https://nodejs.org/) com a framework [Express](https://expressjs.com/)
*   **Base de Dados**: [MongoDB](https://www.mongodb.com/) mapeada através do ORM [Mongoose](https://mongoosejs.com/)
*   **Autenticação**: [JSON Web Tokens (JWT)](https://jwt.io/) para sessões de utilizador sem estado (*stateless*)
*   **Encriptação**: [bcryptjs](https://github.com/dcodeIO/bcrypt.js) para hashing seguro de passwords
*   **Gestão de Ficheiros**: [Multer](https://github.com/expressjs/multer) para upload e arquivo de atas e fotos de execução
*   **Documentação**: [Swagger UI Express](https://swagger.io/tools/swagger-ui/) para expor as rotas e contratos da API

---

## 🔒 Métodos de Segurança Implementados

O EcoGest adota as melhores práticas de segurança de APIs industriais:

1.  **Autenticação Avançada com Refresh Tokens (Token Rotation)**:
    *   O **Access Token (JWT)** é de curta duração (**15 minutos**) para evitar roubos de sessão.
    *   O **Refresh Token** é um identificador de alta entropia guardado na base de dados com validade de **7 dias**.
    *   É realizada a **rotação automática** no frontend: quando o Access Token expira, o serviço faz um pedido silencioso de renovação. O Refresh Token antigo é invalidado e um novo par é gerado.
    *   No momento do logout, o Refresh Token é permanentemente destruído na base de dados.
2.  **Proteção contra Força Bruta (Rate Limiting)**:
    *   O endpoint de login `/api/users/login` possui rate limiting de **5 tentativas por minuto por IP**.
    *   As tentativas são guardadas no MongoDB na coleção `AuthLog`, garantindo persistência contínua e distribuída mesmo que o servidor seja reiniciado.
    *   Caso o limite seja excedido, é retornado o status HTTP **`429 Too Many Requests`**.
3.  **Encriptação de Passwords**:
    *   Passwords guardadas na base de dados são encriptadas de forma unidirecional usando `bcryptjs` com **10 salt rounds**.
4.  **Autorização Baseada em Funções (RBAC - Role-Based Access Control)**:
    *   Funções suportadas: `admin` (Administrador), `coordinator` (Coordenador), `secretary` (Secretário/a), `council_member` (Membro do Conselho) e `user` (Utilizador/Membro Geral).
    *   Rotas no backend e layouts no frontend são protegidos. Tentativas de acesso não autorizado são bloqueadas com status `403 Forbidden` ou ecrãs de Acesso Restrito.

---

## 📑 Documentação da API e Testes

A API do EcoGest está documentada e exposta de forma nativa:

*   **Swagger UI**: Com o servidor backend ativo, aceda a **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)** para visualizar a especificação interativa das rotas, parâmetros e payloads.
*   **Coleção Postman**: O repositório contém o ficheiro de especificação na raiz para testes rápidos de integração:
    *   `EcoGest_API.postman_collection.json`


---

## ⚙️ Como Correr o Projeto Localmente

### **Requisitos Prévios**
*   [Node.js](https://nodejs.org/) instalado (versão 18 ou superior recomendada)
*   Instância ativa do [MongoDB](https://www.mongodb.com/) (local ou na cloud através do MongoDB Atlas)

---

### **1. Configurar e Iniciar o Backend**

1.  Aceda ao diretório do backend:
    ```bash
    cd backend
    ```
2.  Instale todas as dependências necessárias:
    ```bash
    npm install
    ```
3.  Crie um ficheiro `.env` na raiz da pasta `backend` com as seguintes variáveis de configuração:
    ```env
    PORT=3000
    MONGO_URI=mongodb://localhost:27017/ecogest   # Substitua pelo seu URI
    JWT_SECRET=super_secret_key_de_assinatura_do_jwt
    JWT_EXPIRES_IN=15m                            # Tempo de vida curto para Access Token
    LOGIN_RATE_LIMIT=5                            # Número máx de logins p/ minuto por IP
    ```
4.  Inicie o servidor em modo de desenvolvimento (com *hot-reload* automático via nodemon):
    ```bash
    npm run dev
    ```
    *O servidor iniciará em `http://localhost:3000`.*

---

### **2. Configurar e Iniciar o Frontend**

1.  Aceda ao diretório do frontend (a partir da raiz do projeto):
    ```bash
    cd frontend
    ```
2.  Instale todas as dependências do cliente React:
    ```bash
    npm install
    ```
3.  Inicie o servidor de desenvolvimento Vite:
    ```bash
    npm run dev
    ```
    *O frontend estará disponível em **[http://localhost:5173](http://localhost:5173)**.*

---

## 🌟 Funcionalidades Principais

*   **Nível Dinâmico Automático**: O nível do projeto anual da escola (Bronze, Prata ou Ouro) é calculado dinamicamente com base nas áreas abrangidas e atividades concluídas.
*   **Auditoria Ambiental**: Questionário ecológico completo dividido em Água, Energia e Resíduos com cálculo de pontuação global.
*   **Gestão de Reuniões & Atas**: Agendamento de reuniões, geração e arquivo digital de atas em PDF e galeria de fotos comprovativas.
*   **Relatórios em PDF**: Emissão instantânea e descarregamento de relatórios ambientais executivos (Mensal, Anual ou Geral) em formato PDF.
*   **Cópias de Segurança (Backups)**: Criação de instantâneos da base de dados e restauro completo do sistema a partir de backups a qualquer momento.