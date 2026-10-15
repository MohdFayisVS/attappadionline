import assert from "node:assert/strict";
import test from "node:test";
import { requiresAdmin } from "../api/middleware/routePolicy";

test("public GET routes remain accessible", () => {
  assert.equal(requiresAdmin("GET", "/news"), false);
  assert.equal(requiresAdmin("GET", "/directory"), false);
});

test("administrative and diagnostic endpoints are restricted", () => {
  assert.equal(requiresAdmin("GET", "/admin/db-diagnostic"), true);
  assert.equal(requiresAdmin("POST", "/admin/translate"), true);
  assert.equal(requiresAdmin("GET", "/debug-route-details"), true);
});

test("content mutations and report resolution require admin", () => {
  for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
    assert.equal(requiresAdmin(method, "/notices"), true);
  }
  assert.equal(requiresAdmin("POST", "/lostfound/resolve/123"), true);
});

test("specific public submissions and view counts are exempt", () => {
  assert.equal(requiresAdmin("POST", "/news/123/view"), false);
  assert.equal(requiresAdmin("POST", "/lostfound"), false);
  assert.equal(requiresAdmin("POST", "/news/123/modify"), true);
});
