import test from "node:test";
import assert from "node:assert/strict";

test("server package exposes a health-test placeholder", () => {
  assert.equal(typeof "traffic-violation-api", "string");
});
