export function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export function hrefWithQuery(
  pathname: string,
  current: Record<string, string | string[] | undefined>,
  patch: Record<string, string | number | undefined | null> = {},
) {
  const params = new URLSearchParams();
  const merged: Record<string, string> = {};

  for (const [key, value] of Object.entries(current)) {
    const next = firstParam(value);
    if (next) merged[key] = next;
  }

  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined || value === null || value === "") {
      delete merged[key];
    } else {
      merged[key] = String(value);
    }
  }

  for (const [key, value] of Object.entries(merged)) {
    params.set(key, value);
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
