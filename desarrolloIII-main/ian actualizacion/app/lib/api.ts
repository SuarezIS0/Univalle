export type ApiResponse<T = unknown> = {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
};

function authHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...authHeader(),
    ...((init.headers as Record<string, string>) ?? {}),
  };

  let res: Response;
  try {
    res = await fetch(path, { ...init, headers });
  } catch (e) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: e instanceof Error ? `Sin conexión con el servidor: ${e.message}` : "Sin conexión",
    };
  }

  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      // Respuesta no-JSON (HTML de error, "Internal Server Error", etc.)
      const snippet = text.slice(0, 120).replace(/\s+/g, " ").trim();
      return {
        ok: false,
        status: res.status,
        data: null,
        error: `Respuesta no válida del servidor (${res.status}): ${snippet}`,
      };
    }
  }

  // Contrato estándar: { success, data, error }
  if (body && typeof body === "object") {
    const obj = body as Record<string, unknown>;
    if (obj.success === false) {
      return {
        ok: false,
        status: res.status,
        data: null,
        error: typeof obj.error === "string" ? obj.error : `Error ${res.status}`,
      };
    }
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data: null,
        error:
          typeof obj.error === "string"
            ? obj.error
            : `Error ${res.status}`,
      };
    }
    return {
      ok: true,
      status: res.status,
      data: ("data" in obj ? (obj.data as T) : (obj as T)),
      error: null,
    };
  }

  if (!res.ok) {
    return { ok: false, status: res.status, data: null, error: `Error ${res.status}` };
  }
  return { ok: true, status: res.status, data: body as T, error: null };
}
