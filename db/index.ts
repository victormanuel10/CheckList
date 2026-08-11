import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";
import { getNativeDb } from "../lib/db-adapter";

export function getDb() {
  let cfEnv: any = null;
  try {
    // Dynamic import check or global check
    cfEnv = (globalThis as any).env;
  } catch {}

  const dbBinding = cfEnv?.DB || getNativeDb();
  return drizzle(dbBinding, { schema });
}
