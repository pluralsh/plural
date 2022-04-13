FROM node:16-slim as build

WORKDIR /app

COPY package*.json ./

RUN npm config set unsafe-perm true
RUN npm install

COPY . ./

RUN npm run build

# production environment
FROM gcr.io/pluralsh/nginx:1.19.8-alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
