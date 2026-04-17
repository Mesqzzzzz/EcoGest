# EcoGest Backend - Grupo 31

## Requisitos
- Node.js
- MySQL

## Instalação

1. Clone o repositório.
2. Navegue até a pasta `backend`.
3. Crie a base de dados no MySQL: `CREATE DATABASE ecogest;`
4. Crie um ficheiro `.env` baseado no `.env.example` e preencha as suas credenciais.
5. Instale as dependências:
   ```bash
   npm install
   ```

## Execução

Para desenvolvimento (com nodemon):
```bash
npm run dev
```

Para produção:
```bash
npm start
```

## Testes (Postman)

Importe o ficheiro `EcoGest_API.postman_collection.json` localizado na raiz do projeto para o Postman.
- A `base_url` está definida para `http://localhost:3000`.
- Após o Login, o `jwt_token` é guardado automaticamente para os pedidos protegidos.

## Estrutura de Ficheiros

- `config/`: Configuração da base de dados.
- `controllers/`: Lógica de negócio.
- `middleware/`: Autenticação e Autorização.
- `models/`: Definição de modelos Sequelize e associações.
- `routes/`: Definição de endpoints.
- `utils/`: Utilitários (ex: multer para uploads).
- `uploads/`: Ficheiros guardados (fotos, documentos).
