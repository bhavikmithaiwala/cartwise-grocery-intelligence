// Prisma on this Windows host requires the SQLite file to exist before migrate.
const { existsSync } = require('node:fs');
const { resolve } = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const url = process.env.DATABASE_URL ?? 'file:./dev.db';
if (!url.startsWith('file:')) throw new Error('CartWise requires a SQLite file URL.');
const filename = resolve(__dirname, '../prisma', url.slice(5));
if (!existsSync(filename)) new DatabaseSync(filename).close();
