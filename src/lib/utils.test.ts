import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
  it("merges tailwind classes with the last conflicting class winning", () => {
    expect(cn("px-2", "px-4", "text-sm")).toBe("px-4 text-sm");
  });

  it("filters falsey values while preserving valid classes", () => {
    expect(cn("font-bold", undefined, false, "tracking-wide")).toBe("font-bold tracking-wide");
  });
});
