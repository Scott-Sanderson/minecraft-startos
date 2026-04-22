# Minecraft Server on StartOS

Minecraft Server on StartOS runs a vanilla Java Edition server with a built-in
web admin experience.

## First-time setup

1. Start the package and run **Configure Server** to set your gameplay options
   (difficulty, mode, memory profile, world settings, and player limits).
2. Run **Get Web Admin Credentials**, then open the **Web Admin** interface and
   sign in.
3. Run **Get Connection Info** and share the server address with players.

## Common management actions

1. Use **Configure Server** whenever you want to change server behavior.
2. Use **List Worlds**, **Create World**, **Select World**, and **Delete World**
   to manage world saves.
3. Use **Add to Whitelist** / **Remove from Whitelist** to control player
   access.
4. Use **Get Live Server Stats** and **Get Server Info** for runtime details.

## Important notes

1. Stopping the service disconnects all players.
2. Uninstalling the package permanently removes world data.
3. Backups include your world data and package settings.

For features not covered here, refer to upstream docs:
<https://docker-minecraft-server.readthedocs.io/>
