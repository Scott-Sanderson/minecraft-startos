<p align="center">
  <img src="icon.png" alt="Minecraft Server Logo" width="21%">
</p>

# Minecraft Server on StartOS

> **Upstream docs:** <https://docker-minecraft-server.readthedocs.io/>
>
> Everything not listed in this document should behave the same as upstream
> `itzg/minecraft-server`. If a feature, setting, or behavior is not mentioned
> here, upstream documentation is accurate and applicable.

StartOS package for a vanilla Minecraft Java Edition server with a bundled RCON
Web Admin experience.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions (StartOS UI)](#actions-startos-ui)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

| Property | Value |
| --- | --- |
| Primary image | `itzg/minecraft-server:java25@sha256:847b459c2bc263fe31838eb0b4e3d321d851b9071d94f658439ec53f2db57e6b` |
| Sidecar image | `rcon` (built from `rcon.Dockerfile`) |
| Proxy image | `nginx:1.27-alpine` |
| Architectures | x86_64, aarch64 |
| Entry command | Upstream entrypoint (`sdk.useEntrypoint()`) |
| StartOS-managed upstream version | `VERSION=26.1.2` |

---

## Volume and Data Layout

| Volume | Mount point(s) | Purpose |
| --- | --- | --- |
| `main` | `/data` (minecraft), `/opt/rcon-web-admin-0.14.1/db` (rcon) | World data, server files, managed state, RCON admin DB |

StartOS-managed files inside the `main` volume:
- `start9/store.json` (managed package state and server settings)
- `whitelist.json` (generated from managed whitelist configuration)

---

## Installation and First-Run Flow

On first install, the package:
1. Generates strong random credentials for RCON and Web Admin.
2. Creates onboarding tasks:
   - **critical**: Configure Server
   - **important**: Get Web Admin Credentials
   - **optional**: Get Connection Info

---

## Configuration Management

Server settings are managed through StartOS actions and persisted in
`start9/store.json`. Key managed settings include gameplay mode, difficulty,
memory profile, MOTD, player limits, world selection, and whitelist state.

When settings change, StartOS re-evaluates runtime configuration and applies the
new state on restart/reload behavior managed by the package.

---

## Network Access and Interfaces

| Interface ID | Port | Protocol | Purpose |
| --- | --- | --- | --- |
| `minecraft-server` | 25565 | TCP | Minecraft Java Edition client connections |
| `web-admin` | 8080 | HTTP | RCON Web Admin UI (proxied) |

Internal-only service ports:
- `25575` RCON endpoint (used by sidecars/actions)
- `4326` RCON Web Admin service
- `4327` RCON Web Admin websocket backend

---

## Actions (StartOS UI)

| Action ID | Purpose | Availability |
| --- | --- | --- |
| `configure-server` | Configure gameplay/server settings | any |
| `list-worlds` | Inspect saved worlds and metadata | any |
| `create-world` | Stage a new world name/seed | any |
| `select-world` | Switch active world | any |
| `delete-world` | Permanently delete a world save | only-stopped |
| `get-web-admin-credentials` | Reveal Web Admin login credentials | only-running |
| `get-server-info` | Show active server settings | only-running |
| `get-live-server-stats` | Query live stats via RCON | only-running |
| `get-connection-info` | Show best client connection address | only-running |
| `add-to-whitelist` | Add player and enable whitelist | any |
| `remove-from-whitelist` | Remove player and auto-disable empty whitelist | any |

---

## Backups and Restore

**Included in backup:**
- `main` volume

**Pre-backup behavior:**
- If the server is running, package issues `save-all flush` over RCON before
  snapshot creation.

**Restore behavior:**
- Standard StartOS restore flow is used (`restoreInit`) and package init tasks
  are re-registered where applicable.

---

## Health Checks

| Check | Method | Notes |
| --- | --- | --- |
| `minecraft-server` | Port listening on `25565`, then RCON `25575` | 30s grace period, delayed first check |
| `rcon-admin` | Port listening on `4326` | Sidecar readiness |
| `rcon-proxy` | Port listening on `8080` | User-facing Web Admin path |

---

## Dependencies

None.

---

## Limitations and Differences

1. This package targets vanilla Java Edition behavior via `itzg/minecraft-server`; advanced upstream modes (mod loaders/proxy stacks) are not surfaced as StartOS actions.
2. Configuration is package-managed through actions and store state, rather than direct file editing in the UI.
3. Web admin access is routed through an internal nginx proxy and exposed as a dedicated StartOS interface.

---

## What Is Unchanged from Upstream

- Core Minecraft server runtime and world formats.
- Upstream image startup semantics and environment-variable driven configuration model.
- Standard client connection flow for Java Edition on TCP port 25565.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for local build, install, and release workflow details.

---

## Quick Reference for AI Consumers

```yaml
package_id: minecraft
upstream_version: "26.1.2"
image: "itzg/minecraft-server:java25@sha256:847b459c2bc263fe31838eb0b4e3d321d851b9071d94f658439ec53f2db57e6b"
architectures: [x86_64, aarch64]
volumes:
  main:
    - /data
    - /opt/rcon-web-admin-0.14.1/db
ports:
  minecraft-server: 25565
  web-admin: 8080
dependencies: none
startos_managed_env_vars:
  - EULA
  - TYPE
  - VERSION
  - MODE
  - DIFFICULTY
  - LEVEL
  - SEED
  - INIT_MEMORY
  - MAX_MEMORY
  - VIEW_DISTANCE
  - SIMULATION_DISTANCE
  - ENABLE_RCON
  - RCON_PASSWORD
  - RCON_PORT
  - ONLINE_MODE
  - PVP
  - ALLOW_FLIGHT
  - HARDCORE
  - ENABLE_WHITELIST
  - SPAWN_PROTECTION
  - MOTD
  - MAX_PLAYERS
  - PAUSE_WHEN_EMPTY_SECONDS
  - SERVER_PORT
actions:
  - configure-server
  - list-worlds
  - create-world
  - select-world
  - delete-world
  - get-web-admin-credentials
  - get-server-info
  - get-live-server-stats
  - get-connection-info
  - add-to-whitelist
  - remove-from-whitelist
```
