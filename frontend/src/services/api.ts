import type {
  LoginRequest,
  LoginResponse,
} from "../types/auth";

const API_BASE_URL = "http://localhost:3000";

export class ApiError extends Error {
  fields?: Record<string, string>;

  constructor(
    message: string,
    fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
    this.fields = fields;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("auth_token");

  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,
      headers,
    },
  );

  const text = await response.text();

  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorData = data as {
      error?: {
        message?: string;
        fields?: Record<string, string>;
      };
      message?: string;
    } | null;

    throw new ApiError(
      errorData?.error?.message ||
        errorData?.message ||
        "Request failed",
      errorData?.error?.fields,
    );
  }

  return data as T;
}

export async function apiGet<T>(
  path: string,
): Promise<T> {
  return request<T>(path, {
    method: "GET",
  });
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: body === undefined
      ? undefined
      : JSON.stringify(body),
  });
}

export async function apiPut<T>(
  path: string,
  body?: unknown,
): Promise<T> {
  return request<T>(path, {
    method: "PUT",
    body: body === undefined
      ? undefined
      : JSON.stringify(body),
  });
}

export async function apiPatch<T>(
  path: string,
  body?: unknown,
): Promise<T> {
  return request<T>(path, {
    method: "PATCH",
    body: body === undefined
      ? undefined
      : JSON.stringify(body),
  });
}

export async function apiDelete<T>(
  path: string,
): Promise<T> {
  return request<T>(path, {
    method: "DELETE",
  });
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const requestBody: LoginRequest = {
    email,
    password,
  };

  return apiPost<LoginResponse>(
    "/auth/login",
    requestBody,
  );
}
