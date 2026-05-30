# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Inlined at build time by CRA — pass your public API URL, e.g.:
# docker build --build-arg REACT_APP_API_URL=https://api.example.com -t inotes-client .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

# Production stage (Serving with Nginx)
FROM nginx:stable-alpine
# Copy the build output to nginx public folder
COPY --from=builder /app/build /usr/share/nginx/html
# Copy custom nginx config if we had one, but default is fine for simple SPA
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
