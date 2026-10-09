import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { setupFiles: ['./backend/test/setup.ts'], fileParallelism: false, env: { DATABASE_URL: 'file:./test.db' } } });
