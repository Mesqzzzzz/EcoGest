FROM node:20-alpine

# Definir variável de ambiente para produção
ENV NODE_ENV=production

# Definir diretório de trabalho seguro
WORKDIR /usr/src/app

# Copiar ficheiros de definição de dependências
COPY package*.json ./

# Instalar apenas dependências de produção para manter a imagem leve e segura
RUN npm ci --only=production

# Copiar o resto do código-fonte da aplicação
COPY . .

# Garantir que o utilizador 'node' tem permissões sobre o diretório de trabalho
RUN chown -R node:node /usr/src/app

# Usar utilizador não-root 'node' por motivos de segurança
USER node

# Expor a porta que o servidor Express utiliza
EXPOSE 3000

# Comando para iniciar o servidor em produção
CMD ["node", "app.js"]
