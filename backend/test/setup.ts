import { execFileSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
const database = resolve('backend/prisma/test.db');
if (!existsSync(database)) new DatabaseSync(database).close();
execFileSync(process.execPath, [resolve('backend/node_modules/prisma/build/index.js'), 'migrate', 'deploy', '--schema', resolve('backend/prisma/schema.prisma')], { env: { ...process.env, DATABASE_URL: 'file:./test.db' }, stdio: 'pipe' });
