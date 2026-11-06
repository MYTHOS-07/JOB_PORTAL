import { cookies } from "next/headers";
import { ApiError } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface ServerRequestOptions {
  query?: Record<string, string | number | boolean | undefined | null>;
  auth?: boolean;
}

function buildUrl(path: string, query?: ServerRequestOptions["query"]) {
  const url = new URL(`${API_URL}${path}`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

export async function serverApi<T>(path: string, options: ServerRequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.auth) {
    headers.Cookie = (await cookies()).toString();
  }

  const response = await fetch(buildUrl(path, options.query), {
    cache: "no-store",
    headers,
  });

  const json = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    message?: string;
    data?: T;
    details?: unknown;
  };

  if (!response.ok || json.success === false) {
    throw new ApiError(response.status, json.message ?? "Request failed", json.details);
  }

  return json as T;
}

export async function serverApiSafe<T>(path: string, options: ServerRequestOptions = {}): Promise<T | null> {
  try {
    return await serverApi<T>(path, options);
  } catch {
    return null;
  }
}
