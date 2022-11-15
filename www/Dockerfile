FROM node:16.18-slim as build

WORKDIR /app

# # Create a nonroot user for final image
# RUN useradd -u 10001 nonroot

COPY package.json ./package.json
COPY yarn.lock ./yarn.lock
COPY .yarn ./.yarn
COPY .yarnrc.yml ./.yarnrc.yml

RUN yarn install --immutable

COPY . ./

RUN yarn run build

# production environment
FROM gcr.io/pluralsh/nginx:1.19.8-alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# # Copy nonroot user and switch to it
# COPY --from=build /etc/passwd /etc/passwd
# USER nonroot

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
