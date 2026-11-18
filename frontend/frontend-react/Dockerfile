FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
ENV GATEWAY_URL=http://gateway
COPY --from=build /app/dist /usr/share/nginx/html
RUN printf 'server {\n\
    listen 5173;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    gzip on;\n\
    gzip_min_length 512;\n\
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;\n\
    location /assets/ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, max-age=31536000, immutable";\n\
    }\n\
    location /api/ {\n\
        proxy_pass ${GATEWAY_URL}/api/;\n\
        proxy_http_version 1.1;\n\
        proxy_set_header Host $host;\n\
    }\n\
    location /graphql {\n\
        proxy_pass ${GATEWAY_URL}/graphql;\n\
        proxy_http_version 1.1;\n\
        proxy_set_header Host $host;\n\
    }\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/templates/default.conf.template
EXPOSE 5173
