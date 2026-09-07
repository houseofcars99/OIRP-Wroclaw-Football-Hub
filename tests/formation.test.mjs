import test from "node:test";
import assert from "node:assert/strict";

const formations = {
  "2–3–1": 7,
  "3–2–1": 7,
  "2–2–2": 7,
  "1–3–2": 7,
};

test("every seven-a-side formation contains exactly seven players", () => {
  for (const count of Object.values(formations)) assert.equal(count, 7);
});
