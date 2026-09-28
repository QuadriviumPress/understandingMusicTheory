# AGENTS.md

## Standard

This book follows the [QuadriviumPress MyST baseline](https://github.com/QuadriviumPress/bindery/blob/main/doc/myst-baseline.md) and the [presentation skill](https://github.com/QuadriviumPress/bindery/blob/main/skills/quadrivium-myst-presentation/SKILL.md).

## Commands

```bash
npm run start
npm run build
npm run verify
npm run check
npm run test
npm run import:cnx
npm run notation:audit
npm run notation:check
npm run notation:render
```

`npm run check` is the production-equivalent verification and HTML build.

## Intentional differences

- `verify` runs `node scripts/verify-book.mjs`.
- `npm test` is an alias of `npm run check`.
- `import:cnx` and `notation:audit`, `notation:render`, and `notation:check` import and render music notation. They are not part of `verify`.
- `devDependencies` also includes `jsdom` and `vexflow`.
- `scripts/setup-pwa.mjs` uses theme color `#7b3f52` so the installed app matches this book's branding.
- `package.json` `license` is `MIT` for the tooling. The textbook content license is `CC-BY-2.0` in `myst.yml`.

## Presentation gap

Chapters do not use `{exercise}` or `{solution}`. Notation is rendered by the `notation:*` scripts. Exercise markup is deferred.
