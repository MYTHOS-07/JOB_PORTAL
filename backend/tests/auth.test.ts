import { describe, expect, it } from "vitest";
import { sha256, createRandomToken, safeEqual } from "../src/utils/crypto";
import { buildPaginationMeta, getPagination } from "../src/utils/pagination";

describe("crypto helpers", () => {
  it("creates unique random tokens", () => {
    const first = createRandomToken();
    const second = createRandomToken();
    expect(first).not.toBe(second);
    expect(first).toHaveLength(64);
  });

  it("hashes tokens with sha256", () => {
    expect(sha256("token")).toHaveLength(64);
    expect(sha256("token")).toBe(sha256("token"));
  });

  it("compares strings in constant time", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
  });
});

describe("pagination", () => {
  it("converts page numbers to skip/take", () => {
    expect(getPagination(2, 10)).toEqual({ skip: 10, take: 10 });
  });

  it("builds pagination metadata", () => {
    const meta = buildPaginationMeta(1, 10, 45);
    expect(meta.totalPages).toBe(5);
    expect(meta.hasNextPage).toBe(true);
    expect(meta.hasPreviousPage).toBe(false);
  });
});
