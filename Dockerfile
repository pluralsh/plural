FROM bitwalker/alpine-elixir:1.13.4 AS builder

# The following are build arguments used to change variable parts of the image.
# The name of your application/release (required)
ARG APP_NAME
# The environment to build with
ARG MIX_ENV=prod

ENV APP_NAME=${APP_NAME} \
    MIX_ENV=${MIX_ENV}

# By convention, /opt is typically used for applications
WORKDIR /opt/app

# This step installs all the build tools we'll need
RUN apk update --allow-untrusted && \
  apk upgrade --no-cache && \
  apk add --no-cache \
    git \
    build-base && \
  mix local.rebar --force && \
  mix local.hex --force

# This copies our app source code into the build container
COPY . .

# needed so that we can get the app version from the git tag
RUN git config --global --add safe.directory '/opt/app'

RUN mix do deps.get, compile

RUN \
  mkdir -p /opt/built && \
  mix distillery.release --name ${APP_NAME} && \
  cp _build/${MIX_ENV}/rel/${APP_NAME}/releases/*/${APP_NAME}.tar.gz /opt/built && \
  cd /opt/built && \
  tar -xzf ${APP_NAME}.tar.gz && \
  rm ${APP_NAME}.tar.gz

FROM alpine:3.21.7 as tools

ARG TARGETARCH

# renovate: datasource=github-releases depName=helm/helm
ENV HELM_VERSION=v3.22.0

# renovate: datasource=github-releases depName=alco/goon
ENV GOON_VERSION=v1.1.1

# renovate: datasource=github-releases depName=pluralsh/plural-cli
ENV CLI_VERSION=v0.12.65

# renovate: datasource=github-releases depName=aquasecurity/trivy
ENV TRIVY_VERSION=v0.74.0

RUN apk add --update --no-cache curl ca-certificates unzip wget openssl && \
    echo "installing helm" && \
    curl -fL --retry 8 --retry-all-errors --retry-delay 5 --retry-max-time 180 \
      -o /tmp/helm.tar.gz \
      "https://get.helm.sh/helm-${HELM_VERSION}-linux-${TARGETARCH}.tar.gz" && \
    test "$(stat -c%s /tmp/helm.tar.gz)" -gt 1000000 && \
    tar -xzf /tmp/helm.tar.gz && \
    mv linux-${TARGETARCH}/helm /usr/local/bin/helm && \
    echo "installing plural" && \
    curl -fL --retry 8 --retry-all-errors --retry-delay 5 --retry-max-time 180 \
      -o /tmp/plural-cli.tar.gz \
      "https://github.com/pluralsh/plural-cli/releases/download/${CLI_VERSION}/plural-cli_${CLI_VERSION#v}_Linux_${TARGETARCH}.tar.gz" && \
    test "$(stat -c%s /tmp/plural-cli.tar.gz)" -gt 1000000 && \
    tar -xzf /tmp/plural-cli.tar.gz plural && \
    mv plural /usr/local/bin/plural && \
    echo "installing trivy" && \
    if [ "$TARGETARCH" = "amd64" ]; then \
      trivy_url="https://github.com/aquasecurity/trivy/releases/download/${TRIVY_VERSION}/trivy_${TRIVY_VERSION#v}_Linux-64bit.tar.gz"; \
    elif [ "$TARGETARCH" = "arm64" ]; then \
      trivy_url="https://github.com/aquasecurity/trivy/releases/download/${TRIVY_VERSION}/trivy_${TRIVY_VERSION#v}_Linux-ARM64.tar.gz"; \
    else \
      echo "unsupported TARGETARCH=${TARGETARCH}"; \
      exit 1; \
    fi && \
    curl -fL --retry 8 --retry-all-errors --retry-delay 5 --retry-max-time 180 \
      -o /tmp/trivy.tar.gz "$trivy_url" && \
    test "$(stat -c%s /tmp/trivy.tar.gz)" -gt 1000000 && \
    tar -xzf /tmp/trivy.tar.gz trivy && \
    mv trivy /usr/local/bin/trivy && \
    chmod +x /usr/local/bin/helm /usr/local/bin/plural /usr/local/bin/trivy && \
    rm -f /tmp/helm.tar.gz /tmp/plural-cli.tar.gz /tmp/trivy.tar.gz

FROM erlang:24.3.4.6-alpine

# The name of your application/release (required)
ARG APP_NAME
ARG GIT_COMMIT

RUN apk update && \
    apk add --no-cache \
      bash \
      curl \
      busybox=1.35.0-r18 \
      ssl_client=1.35.0-r18 \
      openssl-dev \
      ca-certificates \
      git \
      musl=1.2.3-r4 \
      musl-utils=1.2.3-r4 \
      ncurses=6.3_p20220521-r1 \
      ncurses-libs=6.3_p20220521-r1 \
      ncurses-terminfo=6.3_p20220521-r1 \
      ncurses-terminfo-base=6.3_p20220521-r1

ENV REPLACE_OS_VARS=true \
    APP_NAME=${APP_NAME} \
    GIT_COMMIT=${GIT_COMMIT}

WORKDIR /opt/app

COPY --from=tools /usr/local/bin/plural /usr/local/bin/plural
COPY --from=tools /usr/local/bin/helm /usr/local/bin/helm
# COPY --from=tools /usr/local/bin/goon /usr/local/bin/goon
# COPY --from=tools /usr/local/bin/terrascan /usr/local/bin/terrascan
COPY --from=tools /usr/local/bin/trivy /usr/local/bin/trivy
COPY --from=builder /opt/built .

CMD trap 'exit' INT; /opt/app/bin/${APP_NAME} foreground
