apk update
apk upgrade --no-cache busybox busybox-binsh ssl_client gnutls
apk add openssh-client libgcc libstdc++ ncurses-libs openssl-dev ca-certificates git gnupg bash curl
apk add --no-cache --update --virtual=build gcc musl-dev libffi-dev openssl-dev make
apk del build
addgroup --gid 10001 app
adduser -D -h /home/plural -u 10001 -G app plural
mkdir -p /opt/app/data
chown -R plural:app /opt/app
