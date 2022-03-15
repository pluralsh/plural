FROM bitwalker/alpine-elixir:1.11.4 AS builder

# The following are build arguments used to change variable parts of the image.
# The name of your application/release (required)
ARG APP_NAME
# The version of the application we are building (required)
ARG APP_VSN
# The environment to build with
ARG MIX_ENV=prod
# Set this to true if this release is not a Phoenix app
ARG SKIP_PHOENIX=true
# If you are using an umbrella project, you can change this
# argument to the directory the Phoenix app is in so that the assets
# can be built
ARG PHOENIX_SUBDIR=.

ENV SKIP_PHOENIX=${SKIP_PHOENIX} \
    APP_NAME=${APP_NAME} \
    APP_VSN=${APP_VSN} \
    MIX_ENV=${MIX_ENV}

# By convention, /opt is typically used for applications
WORKDIR /opt/app

# This step installs all the build tools we'll need
RUN apk update && \
  apk upgrade --no-cache && \
  apk add --no-cache \
    nodejs \
    yarn \
    git \
    build-base && \
  mix local.rebar --force && \
  mix local.hex --force

# This copies our app source code into the build container
COPY . .

RUN mix do deps.get, compile

# This step builds assets for the Phoenix app (if there is one)
# If you aren't building a Phoenix app, pass `--build-arg SKIP_PHOENIX=true`
# This is mostly here for demonstration purposes
RUN if [ ! "$SKIP_PHOENIX" = "true" ]; then \
  cd ${PHOENIX_SUBDIR}/assets && \
  yarn install && \
  yarn deploy && \
  cd - && \
  mix phx.digest; \
fi

RUN \
  mkdir -p /opt/built && \
  mix distillery.release --name ${APP_NAME} && \
  cp _build/${MIX_ENV}/rel/${APP_NAME}/releases/${APP_VSN}/${APP_NAME}.tar.gz /opt/built && \
  cd /opt/built && \
  tar -xzf ${APP_NAME}.tar.gz && \
  rm ${APP_NAME}.tar.gz

FROM dkr.plural.sh/plural/plural-cli:0.1.0 as cmd

FROM erlang:23-alpine as helm

ARG VERSION=3.3.1

# ENV BASE_URL="https://storage.googleapis.com/kubernetes-helm"
ENV BASE_URL="https://get.helm.sh"
ENV TAR_FILE="helm-v${VERSION}-linux-amd64.tar.gz"

RUN apk add --update --no-cache curl ca-certificates unzip wget openssl && \
    curl -L ${BASE_URL}/${TAR_FILE} | tar xvz && \
    mv linux-amd64/helm /usr/local/bin/helm && \
    chmod +x /usr/local/bin/helm && \
    curl -L https://github.com/alco/goon/releases/download/v1.1.1/goon_linux_amd64.tar.gz | tar xvz && \
    mv goon /usr/local/bin/goon && chmod +x /usr/local/bin/goon

FROM erlang:23-alpine

# The name of your application/release (required)
ARG APP_NAME
ARG GIT_COMMIT

RUN apk update && \
    apk add --no-cache \
      bash curl busybox \
      openssl-dev ca-certificates git

RUN curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin v0.16.0
RUN curl -L https://github.com/accurics/terrascan/releases/download/v1.9.0/terrascan_1.9.0_Linux_x86_64.tar.gz > terrascan.tar.gz && \
      tar -xf terrascan.tar.gz terrascan && rm terrascan.tar.gz && \
      chmod +x terrascan && \
      mv terrascan /usr/local/bin/terrascan

ENV REPLACE_OS_VARS=true \
    APP_NAME=${APP_NAME} \
    GIT_COMMIT=${GIT_COMMIT}

WORKDIR /opt/app

COPY --from=helm /usr/local/bin/helm /usr/local/bin/helm
COPY --from=cmd /go/bin/plural /usr/local/bin/plural
COPY --from=helm /usr/local/bin/goon /usr/local/bin/goon
COPY --from=builder /opt/built .

CMD trap 'exit' INT; /opt/app/bin/${APP_NAME} foreground