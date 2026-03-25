# Contributing

## Development Environment

Set up the standard StartOS packaging toolchain first:

- `start-cli`
- Node.js and `npm`
- a configured `~/.startos/config.yaml`
- a StartOS developer key at `~/.startos/developer.key.pem`

If the developer key is missing, `make install` will initialize it automatically.

## Common Commands

```bash
npm run check
npm run build
make
make install
make clean
```

## Typical Workflow

1. Make your code changes.
2. Run `npm run check`.
3. Run `npm run build`.
4. Run `make install` to rebuild the package and sideload it to your local StartOS server.

## Notes

- `make install` depends on `s9pk.mk` and rebuilds the package before sideloading it.
- The package expects your local StartOS host to be configured in `~/.startos/config.yaml`.
- When editing package behavior, keep `README.md` in sync with the actual StartOS-specific behavior.
