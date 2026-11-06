import { describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { authorize } from "../../src/middleware/authorize";
import { ApiError } from "../../src/utils/ApiError";

function run(role: string | undefined, allowed: Array<"JOB_SEEKER" | "EMPLOYER" | "ADMIN">) {
  const req = { user: role ? { id: 1, role } : undefined } as Request;
  const next = vi.fn() as unknown as NextFunction;
  authorize(...allowed)(req, {} as Response, next);
  return next as unknown as ReturnType<typeof vi.fn>;
}

describe("authorize", () => {
  it("allows an employer onto employer routes", () => {
    const next = run("EMPLOYER", ["EMPLOYER", "ADMIN"]);
    expect(next).toHaveBeenCalledWith();
  });

  it("blocks a job seeker from creating jobs", () => {
    const next = run("JOB_SEEKER", ["EMPLOYER", "ADMIN"]);
    const error = next.mock.calls[0][0] as ApiError;
    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(403);
  });

  it("requires authentication first", () => {
    const next = run(undefined, ["JOB_SEEKER"]);
    const error = next.mock.calls[0][0] as ApiError;
    expect(error.statusCode).toBe(401);
  });
});
