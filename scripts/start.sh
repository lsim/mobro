#!/bin/bash

# This script starts the service - will generally be invoked by systemd - but can be invoked manually as well for testing

# sudo yum install nodejs
# sudo npm install -g n
# n latest

pushd src/server
npm install --only=production
popd

node src/server/index.js
