const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
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

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, query, headers, ...rest } = options;
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;

  const method = (rest.method ?? "GET").toUpperCase();
  const hasJsonBody = body !== undefined && !isForm && method !== "GET" && method !== "HEAD";

  const response = await fetch(buildUrl(path, query), {
    ...rest,
    method,
    credentials: "include",
    headers: {
      ...(hasJsonBody ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body === undefined || method === "GET" || method === "HEAD"
      ? undefined
      : isForm
        ? (body as FormData)
        : JSON.stringify(body),
  });

  const json = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    message?: string;
    data?: T;
    pagination?: unknown;
    details?: unknown;
  };

  if (!response.ok || json.success === false) {
    throw new ApiError(response.status, json.message ?? "Request failed", json.details);
  }

  return json as T;
}
