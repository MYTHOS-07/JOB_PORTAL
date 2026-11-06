import { describe, expect, it } from "vitest";
import { buildPaginationMeta, getPagination } from "../../src/utils/pagination";

describe("getPagination", () => {
  it("converts 1-based pages into skip and take", () => {
    expect(getPagination(1, 10)).toEqual({ skip: 0, take: 10 });
    expect(getPagination(2, 10)).toEqual({ skip: 10, take: 10 });
  });

  it("caps the limit at 100", () => {
    expect(getPagination(1, 500).take).toBe(100);
  });
});

describe("buildPaginationMeta", () => {
  it("matches the live job-list math of 21 items with limit 2", () => {
    const meta = buildPaginationMeta(1, 2, 21);
    expect(meta).toMatchObject({
      currentPage: 1,
      limit: 2,
      totalItems: 21,
      totalPages: 11,
      hasNextPage: true,
      hasPreviousPage: false,
    });
  });
});
