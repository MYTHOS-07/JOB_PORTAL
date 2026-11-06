import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("joins truthy class names for form controls", () => {
    expect(cn("w-full", false, "rounded-lg", undefined)).toBe("w-full rounded-lg");
  });
});
