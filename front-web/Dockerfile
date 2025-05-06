FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

RUN npm install -g serve

COPY . .

RUN npm run build

RUN ls -la dist

RUN echo '{ "rewrites": [{ "source": "**", "destination": "/index.html" }] }' > dist/serve.json

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]