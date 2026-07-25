FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy prisma schema for generation
COPY prisma ./prisma/
RUN npx prisma generate

# Copy app
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
