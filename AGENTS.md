# Published games must remain unchanged

- User requirement: editor updates must never change games already embedded in Genially.
- `players/v-*/` directories are immutable, self-contained releases. Never edit, delete, or overwrite an existing release, including its migration code, CSS, translations, libraries, and manifest.
- `play.html` and `players/legacy.json` are the permanent mapping for previously generated unversioned links. Do not point them to a newer version.
- Change active sources in `src/`. `npm run build` creates a new content-addressed player if runtime files changed, and updates `src/export/player-version.js` for newly generated codes only. Include new release directories in the commit and deployment, retaining every older directory.
- Run unit tests, the published-player history check, and `tests/versioning.mjs` for changes to sharing, builds, exports, or the player.
- Never silently migrate published games to the current player. An author can explicitly create and replace an embed code when they want to update one game.
