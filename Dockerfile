# Stage 1: Build the React application
FROM node:20-alpine AS build
WORKDIR /app

# Leverage Docker cache by copying package files first
COPY package*.json ./

RUN npm install --legacy-peer-deps

# Copy the rest of the source code
COPY . .
RUN npm run build    

# Stage 2: Serve the static files with Nginx
FROM nginx:alpine

# IMPORTANT: React (Vite) outputs to /dist. 
# If you use Create-React-App, change 'dist' to 'build'
COPY --from=build /app/dist /usr/share/nginx/html

# Copy your local nginx.conf to handle SPA routing (React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]