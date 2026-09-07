import test from "node:test";
import assert from "node:assert/strict";

const formations = {
  "1–2–2": 6,
  "2–2–1": 6,
  "1–3–1": 6,
  "2–1–2": 6,
};

test("every six-a-side formation contains exactly six players", () => {
  for (const count of Object.values(formations)) assert.equal(count, 6);
});
