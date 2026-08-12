import path from "node:path";
import fs from "node:fs";
import { createRequire } from "node:module";

let dbInstance: any = null;

export function getNativeDb() {
  if (dbInstance) return dbInstance;

  const require = createRequire(import.meta.url);
  const Database = require("better-sqlite3");
  const dbDir = path.join(process.cwd(), "db");
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, "checklist.db");
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");

  dbInstance = {
    prepare(sql: string) {
      return {
        _sql: sql,
        _params: [] as any[],
        bind(...args: any[]) {
          const newObj = Object.create(this);
          newObj._params = args;
          return newObj;
        },
        async run() {
          const stmt = sqlite.prepare(this._sql);
          const info = stmt.run(...(this._params || []));
          return { success: true, meta: info };
        },
        async all<T = any>() {
          const stmt = sqlite.prepare(this._sql);
          const rows = stmt.all(...(this._params || [])) as T[];
          return { results: rows };
        },
        async first<T = any>() {
          const stmt = sqlite.prepare(this._sql);
          const row = stmt.get(...(this._params || [])) as T | undefined;
          return row ?? null;
        },
      };
    },
    async batch(statements: any[]) {
      const transaction = sqlite.transaction((stmts: any[]) => {
        for (const stmt of stmts) {
          sqlite.prepare(stmt._sql).run(...(stmt._params || []));
        }
      });
      transaction(statements);
    },
  };

  return dbInstance;
}
