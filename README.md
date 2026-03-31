# Minecraft Server on StartOS

> **Upstream docs:** <https://docker-minecraft-server.readthedocs.io/>
>
> Everything not listed in this document should behave the same as upstream
> `itzg/minecraft-server` `26.1`. If a feature, setting, or behavior is not
> mentioned here, the upstream documentation is the source of truth.

StartOS package for a vanilla Minecraft Java Edition server with an included
RCON web admin sidecar. The package wraps the upstream `java25` image variant,
pins the Minecraft server version at runtime, and exposes both the game server
and browser-based admin access through StartOS interfaces and actions.

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
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

- Primary server image: `itzg/minecraft-server:java25`
- Admin image: package-built `rcon` image derived from `itzg/rcon:latest`
- Container startup uses the upstream image entrypoints via `sdk.useEntrypoint()`
- The package currently builds through StartOS package tooling rather than a custom Dockerfile

The package runs three containers:

- `minecraft-server`: the actual Java Edition game server
- `rcon-admin`: the browser-based RCON web admin interface
- `rcon-proxy`: an nginx reverse proxy that fronts the web admin UI and websocket endpoint

---

## Volume and Data Layout

The package defines one StartOS volume:

- `main`

That volume is used in multiple places:

- `/data` inside the Minecraft server container
- `/opt/rcon/db` inside the RCON admin container for sidecar state

StartOS-managed files within the volume:

- `start9/store.json`: package-managed state such as generated credentials and settings
- `whitelist.json`: generated from StartOS actions when whitelist entries are managed through the package

The package does not use a separate external database. World data, server files, and StartOS-managed state all live under the `main` volume.

---

## Installation and First-Run Flow

This package differs from upstream first-run behavior in a few important ways:

1. StartOS generates internal credentials for RCON and the web admin sidecar during install.
2. A critical task prompts the user to run `configure-server` before first start.
3. The service is intended to remain stopped until that configuration action is completed.
4. After configuration, the user starts the package and then retrieves connection or credential details through actions.

The upstream interactive setup flow is effectively replaced by StartOS actions and stored package state.

---

## Configuration Management

StartOS-managed settings are written into `start9/store.json` and then translated into environment variables at startup.

| StartOS-Managed | Upstream-Managed |
| --- | --- |
| Game mode | Everything not surfaced by package actions |
| Difficulty | Manual advanced changes inside the upstream data/config files |
| Initial and maximum memory | Any upstream options not represented in `store.json` |
| MOTD | |
| Max players | |
| Whitelist enabled flag | |
| Whitelist entries added or removed through package actions | |
| Generated RCON password | |
| Generated web admin password | |

Current StartOS-managed environment variables include:

- `EULA`
- `TYPE`
- `VERSION`
- `MODE`
- `DIFFICULTY`
- `INIT_MEMORY`
- `MAX_MEMORY`
- `ENABLE_RCON`
- `RCON_PASSWORD`
- `RCON_PORT`
- `ENABLE_WHITELIST`
- `MOTD`
- `MAX_PLAYERS`
- `SERVER_PORT`
- `RWA_USERNAME`
- `RWA_PASSWORD`
- `RWA_ADMIN`
- `RWA_RCON_HOST`
- `RWA_RCON_PORT`
- `RWA_RCON_PASSWORD`

---

## Network Access and Interfaces

The package exposes two StartOS interfaces.

### Web Admin

- Purpose: browser-based RCON administration
- Interface type: `ui`
- Protocol: HTTP
- Internal port: `8080`
- Access methods: StartOS interface links and assigned hostnames

### Minecraft Server

- Purpose: Java Edition client connections
- Interface type: `p2p`
- Protocol: raw TCP service
- Internal port: `25565`
- Access methods: LAN addresses, `.local` hostnames where available, and Tor hostnames exposed by StartOS

RCON itself is not exposed as a separate StartOS interface. The package surfaces it via credentials and the bundled web admin sidecar instead.

---

## Actions (StartOS UI)

### `configure-server`

- Name: Configure Server
- Purpose: complete the required first-run configuration and update core gameplay settings later
- Visibility: enabled
- Availability: any
- Inputs: game mode, difficulty, initial memory, maximum memory, max players, MOTD, whitelist enabled
- Outputs: confirmation only

### `get-server-info`

- Name: Get Server Info
- Purpose: show the current effective package-managed configuration
- Visibility: enabled
- Availability: only running
- Inputs: none
- Outputs: grouped status summary

### `get-connection-info`

- Name: Get Connection Info
- Purpose: show LAN and Tor addresses for joining the server
- Visibility: enabled
- Availability: only running
- Inputs: none
- Outputs: markdown instructions and addresses

### `get-rcon-credentials`

- Name: Get RCON Credentials
- Purpose: show the local IP address plus the bundled RCON admin username and password
- Visibility: enabled
- Availability: only running
- Inputs: none
- Outputs: structured copyable credentials

### `get-web-admin-credentials`

- Name: Get Web Admin Credentials
- Purpose: expose the generated web admin login credentials
- Visibility: enabled
- Availability: only running
- Inputs: none
- Outputs: grouped username/password result

### `set-memory-allocation`

- Name: Set Memory Allocation
- Purpose: adjust Java heap sizing
- Visibility: enabled
- Availability: any
- Inputs: initial memory, maximum memory
- Outputs: confirmation plus resulting values

### `add-to-whitelist`

- Name: Add to Whitelist
- Purpose: add a player to whitelist state and automatically enable the whitelist
- Visibility: enabled
- Availability: any
- Inputs: player name, optional UUID
- Outputs: confirmation

### `remove-from-whitelist`

- Name: Remove from Whitelist
- Purpose: remove a player from whitelist state
- Visibility: enabled
- Availability: any
- Inputs: player name
- Outputs: confirmation

---

## Backups and Restore

Backups currently include the entire `main` volume.

That means backups include:

- world data
- upstream server files stored under `/data`
- StartOS-managed `start9/store.json`
- generated whitelist data
- RCON admin sidecar database state under the same volume

Restore behavior currently relies on the normal volume restore path and does not run extra post-restore repair logic beyond the package’s standard backup hooks.

---

## Health Checks

The package defines daemon readiness checks for all three daemons.

### Minecraft Server

- Method: TCP port listening check
- Port: `25565`
- Success message: `Minecraft server is ready`
- Failure message: `Minecraft server is not ready`

### RCON Web Admin

- Method: TCP port listening check
- Port: `4326`
- Success message: `Web admin is ready`
- Failure message: `Web admin is not ready`

### RCON Web Admin Proxy

- Method: TCP port listening check
- Port: `8080`
- Success message: `Web admin proxy is ready`
- Failure message: `Web admin proxy is not ready`

There are currently no standalone health checks beyond daemon readiness.

---

## Limitations and Differences

1. The package builds its `rcon` sidecar from `itzg/rcon:latest` using `rcon.Dockerfile` so the StartOS-specific fixes are versioned in this repo instead of applied at runtime.
2. The package currently writes `whitelist.json` from package state, but more advanced whitelist or ops workflows performed directly through upstream tooling may not be reflected back into StartOS action state.
3. The package does not yet expose every upstream `itzg/minecraft-server` option through StartOS actions.
4. The current multi-daemon startup ordering is intentionally relaxed because older StartOS prereleases rejected the SDK’s intermediate dependency health state.
5. The package declares support for `x86_64` and `aarch64`, but does not currently target `riscv64`.

---

## What Is Unchanged from Upstream

- The core game server is still the upstream `itzg/minecraft-server` image.
- World and gameplay behavior should follow upstream Minecraft server documentation unless explicitly called out above.
- Standard Minecraft Java Edition clients connect the same way once they have the address and port.
- Upstream server tuning, administration, and troubleshooting documentation remains applicable for features not overridden by StartOS package behavior.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for local development, build, and install instructions.

---

## Quick Reference for AI Consumers

```yaml
package_id: minecraft
upstream_version: 26.1
image:
  minecraft_server: itzg/minecraft-server:java25
  rcon_admin: package-built rcon image (base: itzg/rcon:latest)
architectures:
  - x86_64
  - aarch64
volumes:
  main:
    minecraft_server: /data
    rcon_admin: /opt/rcon/db
    startos_files:
      - start9/store.json
      - whitelist.json
ports:
  minecraft_server: 25565
  web_admin: 8080
  web_admin_upstream: 4326
dependencies: none
startos_managed_env_vars:
  - EULA
  - TYPE
  - VERSION
  - MODE
  - DIFFICULTY
  - INIT_MEMORY
  - MAX_MEMORY
  - ENABLE_RCON
  - RCON_PASSWORD
  - RCON_PORT
  - ENABLE_WHITELIST
  - MOTD
  - MAX_PLAYERS
  - SERVER_PORT
  - RWA_USERNAME
  - RWA_PASSWORD
  - RWA_ADMIN
  - RWA_RCON_HOST
  - RWA_RCON_PORT
  - RWA_RCON_PASSWORD
actions:
  - configure-server
  - get-server-info
  - get-connection-info
  - get-rcon-credentials
  - get-web-admin-credentials
  - set-memory-allocation
  - add-to-whitelist
  - remove-from-whitelist
```
