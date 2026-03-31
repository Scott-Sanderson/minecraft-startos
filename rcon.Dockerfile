FROM itzg/rcon:latest

COPY docker/rcon/apply-patches.js /tmp/apply-patches.js

RUN node /tmp/apply-patches.js && rm /tmp/apply-patches.js
