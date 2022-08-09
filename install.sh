#!/bin/sh
# "-Wno-deprecated-declarations" is required in Ubuntu 22.04
# Related to OpenSSL 3 and erlang-crypto issues
export CFLAGS="-O2 -g -fno-stack-check -Wno-deprecated-declarations"
export KERL_CONFIGURE_OPTIONS="--with-ssl=$(brew --prefix openssl@1.1) --without-javac --enable-m64-build"
asdf install
