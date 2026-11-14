import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const dbPath = resolve(process.cwd(), "data", "decision-workspace.sqlite");

export function bootstrapDatabase(): { dbPath: string } {
  mkdirSync(dirname(dbPath), { recursive: true });
  return { dbPath };
}

export function runMigrations(): void {
  return;
}
