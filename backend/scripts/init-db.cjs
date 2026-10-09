// Prisma on this Windows host requires the SQLite file to exist before migrate.
const { existsSync } = require('node:fs');
const { resolve } = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const filename = resolve(__dirname, '../prisma/dev.db');
if (!existsSync(filename)) new DatabaseSync(filename).close();
