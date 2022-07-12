FROM node:16.15-slim as build

WORKDIR /app

COPY package.json ./package.json
COPY yarn.lock ./yarn.lock
COPY .yarn ./.yarn
COPY .yarnrc.yml ./.yarnrc.yml

RUN npm config set unsafe-perm true
RUN yarn install --frozen-lockfile

COPY . ./

RUN yarn run build

# production environment
FROM gcr.io/pluralsh/nginx:1.19.8-alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
