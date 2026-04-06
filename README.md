# Minecraft Server on StartOS

Build your own little sovereign block world on your StartOS node.

```
  ⛏️  STACK SATS, STACK BLOCKS  ⛏️
```

## What this package gives you

- Vanilla Minecraft Java server on StartOS
- One-click setup through **Configure Server**
- Built-in web admin credentials action
- Live in-game stats action (players, day/time, moon phase)
- Whitelist controls directly in Actions
- Configurable idle pause timer for empty servers
- High-value gameplay and world-generation settings in Configure Server

## Quick Start

1. Install package.
2. Run **Configure Server**.
3. Start service.
4. Run **Get Connection Info** and join from Minecraft Java Edition.

## StartOS-specific differences

- Configuration is managed with StartOS actions instead of editing files by hand.
- Web admin credentials are generated/stored by the package.
- Actions are grouped for UX:
  - `Setup`
  - `Info`
  - `Whitelist`

## Idle pause behavior

By default, vanilla Minecraft now pauses world ticking after the server has been empty for 60 seconds (`pause-when-empty-seconds=60`).

You can change this in **Configure Server → Pause When Empty (seconds)**.
- Use a positive value to keep auto-pause enabled.
- Use `0` or `-1` to disable pause-when-empty entirely.

## Advanced server settings now exposed

`Configure Server` now also surfaces:
- View distance and simulation distance
- Online mode, PvP, allow flight, and hardcore toggles
- Spawn protection radius
- World name and optional world seed

World name/seed are mainly for initial world generation or intentionally switching world saves. Changing seed does not regenerate an existing world.

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).
