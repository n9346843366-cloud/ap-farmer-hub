import { describe, expect, it } from "vitest";
import { searchServices } from "./meeseva";

describe("Mini MeeSeva search", () => {
  it("finds ROR-1B when the farmer types 1-B", () => {
    expect(searchServices("1-B").map((s) => s.id)).toContain("ror1b");
  });
  it("finds Adangal by its Telugu name", () => {
    expect(searchServices("అడంగల్").map((s) => s.id)).toContain("adangal");
  });
  it("finds FMB by short code", () => {
    expect(searchServices("fmb").map((s) => s.id)).toEqual(["fmb"]);
  });
});
