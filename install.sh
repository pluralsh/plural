#!/bin/sh
export CFLAGS="-O2 -g -fno-stack-check"
export KERL_CONFIGURE_OPTIONS="--with-ssl=$(brew --prefix openssl) --without-javac --enable-m64-build"
asdf install