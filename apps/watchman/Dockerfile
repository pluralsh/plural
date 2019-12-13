# The version of Alpine to use for the final image
# This should match the version of Alpine that the `elixir:1.7.2-alpine` image uses
ARG ALPINE_VERSION=3.8

FROM elixir:1.9-alpine AS builder

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

FROM golang:alpine AS cmd

RUN apk update && apk add --no-cache git

WORKDIR $GOPATH/src/mypackage/myapp/
COPY cmd/ .
RUN ls -al
RUN go build -o /go/bin/chartmart

FROM docker:17.12.0-ce as static-docker-source

# From this line onwards, we're in a new image, which will be the image used in production
FROM erlang:22-alpine

ARG CLOUD_SDK_VERSION=273.0.0
ENV CLOUD_SDK_VERSION=$CLOUD_SDK_VERSION
ENV PATH /google-cloud-sdk/bin:$PATH

COPY --from=static-docker-source /usr/local/bin/docker /usr/local/bin/docker
COPY --from=cmd /go/bin/chartmart /usr/local/bin/chartmart
RUN apk --no-cache add \
        curl \
        python \
        py-crcmod \
        bash \
        libc6-compat \
        openssh-client \
        git \
        gnupg \
    && curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-sdk-${CLOUD_SDK_VERSION}-linux-x86_64.tar.gz && \
    tar xzf google-cloud-sdk-${CLOUD_SDK_VERSION}-linux-x86_64.tar.gz && \
    rm google-cloud-sdk-${CLOUD_SDK_VERSION}-linux-x86_64.tar.gz && \
    gcloud config set core/disable_usage_reporting true && \
    gcloud config set component_manager/disable_update_check true && \
    gcloud config set metrics/environment github_docker_image && \
    gcloud --version

# The name of your application/release (required)
ARG APP_NAME
ADD https://storage.googleapis.com/kubernetes-release/release/v1.6.4/bin/linux/amd64/kubectl /usr/local/bin/kubectl

RUN set -x && \
    apk add --no-cache curl openssl-dev ca-certificates bash && \
    chmod +x /usr/local/bin/kubectl && \
    kubectl version --client


ENV REPLACE_OS_VARS=true \
    APP_NAME=${APP_NAME}

WORKDIR /opt/app

RUN mkdir -p /etc/chartmart/.chartmart
RUN mkdir -p /etc/chartmart/.ssh
RUN echo $HOME

COPY --from=builder /opt/built .

CMD trap 'exit' INT; /opt/app/bin/${APP_NAME} foreground