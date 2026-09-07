import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const schema = readFileSync(new URL("../supabase/schema.sql", import.meta.url), "utf8");

test("Football Hub database objects are isolated from QR Passport", () => {
  const tableNames = [...schema.matchAll(/create table if not exists public\.([a-z_]+)/g)].map(match => match[1]);
  assert.ok(tableNames.length >= 10);
  assert.ok(tableNames.every(name => name.startsWith("fh_")));
  assert.match(schema, /football-avatars/);
  assert.match(schema, /football-team-logos/);
});
