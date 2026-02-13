FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache ca-certificates

# Copy package files
COPY package.json package-lock.json ./

#  Copy prisma folder BEFORE npm install
COPY prisma ./prisma

# Install dependencies
RUN npm install

# Copy rest of project
COPY . .

# Build Next app
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
