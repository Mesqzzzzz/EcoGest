FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar ficheiros de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o resto do código da aplicação
COPY . .

# Expor a porta que o servidor Express utiliza
EXPOSE 3000

# Comando para iniciar em modo de desenvolvimento (com nodemon)
CMD ["npm", "run", "dev"]
