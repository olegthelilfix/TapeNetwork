import { describe, expect, it } from "vitest";

import { toPersonRolePayload, toPersonRoleRows, toSecurityIds } from "./personRoles";

describe("toSecurityIds", () => {
  it("keeps only numeric ids", () => {
    expect(toSecurityIds([1, "2", 3, null, undefined])).toEqual([1, 3]);
  });

  it("returns an empty array for non-array input", () => {
    expect(toSecurityIds(undefined)).toEqual([]);
  });
});

describe("toPersonRoleRows", () => {
  it("normalizes rows and defaults an unknown role to guest", () => {
    const rows = toPersonRoleRows([
      { personId: 1, role: "host" },
      { personId: 2, role: "bogus" },
      { personId: 3 },
    ]);

    expect(rows).toEqual([
      { personId: 1, role: "host" },
      { personId: 2, role: "guest" },
      { personId: 3, role: "guest" },
    ]);
  });

  it("returns an empty array for non-array input", () => {
    expect(toPersonRoleRows(null)).toEqual([]);
  });
});

describe("toPersonRolePayload", () => {
  it("drops rows without a selected person", () => {
    const payload = toPersonRolePayload([
      { personId: 1, role: "host" },
      { personId: null, role: "guest" },
    ]);

    expect(payload).toEqual([{ personId: 1, role: "host" }]);
  });
});
