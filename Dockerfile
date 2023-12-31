# First Stage - Building the App
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies & cache them separately
COPY package*.json ./
RUN npm install --legacy-peer-deps && npm cache clean --force

# Copy the rest of the files
COPY . .

# Build the app
RUN npm run build

# Second Stage - Production App
FROM node:18-alpine
WORKDIR /app

# Copy only the built app and package.json
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install production dependencies only
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force

EXPOSE 4000
CMD ["node", "dist/main.js"]