FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN if [ ! -d "/.npm" ]; then mkdir /.npm; fi
RUN if [ ! -d "/app/.angular" ]; then mkdir /app/.angular; fi
RUN chmod -R 777 /app/node_modules

RUN chmod -R 777 /app
RUN mkdir -p /app/node_modules/.vite && chmod -R 777 /app/node_modules/.vite
RUN chown -R node:node /app
USER node

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]