FROM node:20-slim AS build

WORKDIR /app

COPY package.json ./package.json
COPY yarn.lock ./yarn.lock
COPY .yarn ./.yarn
COPY .yarnrc.yml ./.yarnrc.yml
COPY scripts/husky-install.cjs ./scripts/husky-install.cjs

# Skip husky git hooks setup during image builds (no .git in the build context).
ENV HUSKY=0

RUN yarn install --immutable

COPY . ./

RUN yarn run build

# production environment
FROM nginxinc/nginx-unprivileged:1.30.4-alpine3.24

USER root
RUN apk add --no-cache --upgrade 'libexpat>=2.8.5-r0'
USER 101

WORKDIR /usr/share/nginx/html
# Copy static assets from builder stage
COPY --from=build /app/build .

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "cd /usr/share/nginx/html/ && nginx -g 'daemon off;'"]
