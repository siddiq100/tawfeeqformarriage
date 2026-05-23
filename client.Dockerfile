FROM node:18-alpine as builder

WORKDIR /app/client

COPY client/package*.json ./
RUN npm install

COPY client .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/client/build /usr/share/nginx/html

RUN echo 'server { \
  listen 3000; \
  location / { \
    root /usr/share/nginx/html; \
    try_files $uri /index.html; \
  } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
