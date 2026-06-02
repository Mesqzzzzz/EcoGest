FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar ficheiros de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o resto do código da aplicação
COPY . .

# Expor a porta que o Vite utiliza por padrão
EXPOSE 5173

# Comando para iniciar em desenvolvimento exposto na rede interna (--host)
CMD ["npm", "run", "dev", "--", "--host"]
