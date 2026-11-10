import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checkRole } from "./roles.ts";

describe("role checks", () => {
  it("asks visitors who aren't signed in to sign in", () => {
    assert.equal(checkRole(null, "admin"), "sign-in");
  });

  it("keeps students and instructors out of the admin area", () => {
    assert.equal(checkRole({ roles: ["student"] }, "admin"), "not-allowed");
    assert.equal(checkRole({ roles: ["student", "instructor"] }, "admin"), "not-allowed");
    assert.equal(checkRole({ roles: [] }, "admin"), "not-allowed");
  });

  it("lets administrators in", () => {
    assert.equal(checkRole({ roles: ["student", "admin"] }, "admin"), "allowed");
  });

  it("keeps students out of the instructor area", () => {
    assert.equal(checkRole({ roles: ["student"] }, "instructor"), "not-allowed");
    assert.equal(checkRole({ roles: ["instructor"] }, "instructor"), "allowed");
  });
});
