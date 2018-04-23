#!/bin/bash

node_modules/.bin/concurrently \
    --kill-others-on-fail \
    "node devserver.js" \
    "npm run delay-api" \
    "npm run ngrok" \
    "docker-compose up mongodb"
