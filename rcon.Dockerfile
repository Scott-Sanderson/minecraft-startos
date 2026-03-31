#
# Pin the multi-arch base by digest so package rebuilds stay deterministic.
# This digest was the upstream "latest" manifest list on 2024-04-28 and
# corresponds to the current itzg/rcon image line that bundles
# rcon-web-admin 0.14.1.
#
FROM itzg/rcon@sha256:c9521f333bf9eaedf2db0acd750e67be88eaaa9c5e9026385bd875dc18a49110

COPY docker/rcon/apply-patches.js /tmp/apply-patches.js

RUN node /tmp/apply-patches.js && rm /tmp/apply-patches.js
