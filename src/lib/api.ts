const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8080";

export type ApiUser = {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
};

export type AuthPayload = {
  user: ApiUser;
  tokens: TokenPair;
};

type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
};

export class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, string>;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  accessToken?: string | null,
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await res.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiError(res.status, "invalid_response", "Invalid server response");
  }

  if (!res.ok || !body?.success) {
    throw new ApiError(
      res.status,
      body?.error?.code || "request_failed",
      body?.error?.message || "Request failed",
      body?.error?.details,
    );
  }

  return body.data as T;
}

export function register(input: {
  email: string;
  password: string;
  full_name: string;
}) {
  return request<AuthPayload>("/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function login(input: { email: string; password: string }) {
  return request<AuthPayload>("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function refresh(refreshToken: string) {
  return request<TokenPair>("/v1/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export function logout(refreshToken?: string | null) {
  return request<{ status: string }>("/v1/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken || "" }),
  });
}

export function me(accessToken: string) {
  return request<ApiUser>("/v1/auth/me", { method: "GET" }, accessToken);
}
