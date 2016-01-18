#!/bin/bash

    # - npm config set registry http://23.251.144.68
     # Disable the spinner, it looks bad on Travis
     - npm config set spin false
     # Log HTTP requests
     - npm config set loglevel http
     - npm install -g npm@3.5.2
     # Install npm dependencies and ensure that npm cache is not stale
     - npm install