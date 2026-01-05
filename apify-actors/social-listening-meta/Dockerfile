# Usar imagen base de Apify con Puppeteer
FROM apify/actor-node-puppeteer-chrome:20

# Copiar archivos
COPY package*.json ./
RUN npm install --omit=dev --omit=optional

COPY . ./

# Ejecutar actor
CMD npm start
