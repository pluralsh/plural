ARG ELIXIR_VERSION=1.19.4
ARG OTP_VERSION=28.5
ARG OS_VARIANT=alpine
ARG OS_VERSION=3.23.4
ARG RUNNER_IMAGE=alpine:3.23.4

FROM hexpm/elixir:${ELIXIR_VERSION}-erlang-${OTP_VERSION}-${OS_VARIANT}-${OS_VERSION} AS builder

ARG APP_NAME
ARG MIX_ENV=prod

ENV APP_NAME=${APP_NAME} \
    MIX_ENV=${MIX_ENV}

WORKDIR /opt/app

RUN apk update && apk upgrade --no-cache && \
  apk add --no-cache git build-base curl ca-certificates && \
  mix local.rebar --force && \
  mix local.hex --force

COPY . .
RUN git config --global --add safe.directory '/opt/app'
RUN mix do deps.get, compile
RUN mix release ${APP_NAME}

FROM alpine:3.21.7 as tools

ARG TARGETARCH

# renovate: datasource=github-releases depName=helm/helm
ENV HELM_VERSION=v3.21.3

# renovate: datasource=github-releases depName=alco/goon
ENV GOON_VERSION=v1.1.1

# renovate: datasource=github-releases depName=pluralsh/plural-cli
ENV CLI_VERSION=v0.12.59

# renovate: datasource=github-releases depName=aquasecurity/trivy
ENV TRIVY_VERSION=v0.72.0

RUN apk add --update --no-cache curl ca-certificates unzip wget openssl && \
    # download helm
    echo "installing helm" && \
    curl -L https://get.helm.sh/helm-${HELM_VERSION}-linux-${TARGETARCH}.tar.gz | tar xz && \
    mv linux-${TARGETARCH}/helm /usr/local/bin/helm && \
    # download goon
    # echo "installing goon" && \
    # curl -L https://github.com/alco/goon/releases/download/${GOON_VERSION}/goon_linux_${TARGETARCH}.tar.gz | tar xvz && \
    # mv goon /usr/local/bin/goon && \
    # download plural cli
    echo "installing plural" && \
    curl -L https://github.com/pluralsh/plural-cli/releases/download/${CLI_VERSION}/plural-cli_${CLI_VERSION#v}_Linux_${TARGETARCH}.tar.gz | tar xvz plural && \
    mv plural /usr/local/bin/plural && \
    # download terrascan
    # if [ "$TARGETARCH" = "amd64" ]; then \
    #   curl -L https://github.com/accurics/terrascan/releases/download/${TERRASCAN_VERSION}/terrascan_${TERRASCAN_VERSION/v/}_Linux_x86_64.tar.gz > terrascan.tar.gz; \
    # else \
    #   curl -L https://github.com/accurics/terrascan/releases/download/${TERRASCAN_VERSION}/terrascan_${TERRASCAN_VERSION/v/}_Linux_${TARGETARCH}.tar.gz > terrascan.tar.gz; \
    # fi && \
    # tar -xf terrascan.tar.gz terrascan && rm terrascan.tar.gz && \
    # mv terrascan /usr/local/bin/terrascan && \
    # download trivy
    echo "installing trivy" && \
    if [ "$TARGETARCH" = "amd64" ]; then \
      curl -L https://github.com/aquasecurity/trivy/releases/download/${TRIVY_VERSION}/trivy_${TRIVY_VERSION/v/}_Linux-64bit.tar.gz > trivy.tar.gz; \
    elif [ "$TARGETARCH" = "arm64" ]; then \
      curl -L https://github.com/aquasecurity/trivy/releases/download/${TRIVY_VERSION}/trivy_${TRIVY_VERSION/v/}_Linux-ARM64.tar.gz > trivy.tar.gz; \
    fi && \
    tar -xf trivy.tar.gz trivy && rm trivy.tar.gz && \
    mv trivy /usr/local/bin/trivy && \
    # make tools executable
    chmod +x /usr/local/bin/helm && \
    # chmod +x /usr/local/bin/goon && \
    chmod +x /usr/local/bin/plural && \
    # chmod +x /usr/local/bin/terrascan && \
    chmod +x /usr/local/bin/trivy

ARG RUNNER_IMAGE=alpine:3.23.4
FROM ${RUNNER_IMAGE}

ARG APP_NAME
ARG GIT_COMMIT
ARG OS_VARIANT=alpine

WORKDIR /opt/app

COPY bin/setup/${OS_VARIANT}.sh /opt/app/bin/setup.sh
RUN /bin/sh /opt/app/bin/setup.sh && rm /opt/app/bin/setup.sh

ENV REPLACE_OS_VARS=true \
    APP_NAME=${APP_NAME} \
    GIT_COMMIT=${GIT_COMMIT} \
    MIX_ENV=prod \
    LANG=en_US.UTF-8 \
    LANGUAGE=en_US:en \
    LC_ALL=en_US.UTF-8

COPY --from=tools /usr/local/bin/plural /usr/local/bin/plural
COPY --from=tools /usr/local/bin/helm /usr/local/bin/helm
COPY --from=tools /usr/local/bin/trivy /usr/local/bin/trivy
COPY --from=builder /opt/app/_build/prod/rel/${APP_NAME} .

USER plural

CMD exec /opt/app/bin/${APP_NAME} start
