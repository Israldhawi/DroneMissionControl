import type {
  LoginRequest,
  LoginResponse,
} from "../types/auth";

const API_BASE_URL = "http://localhost:3000";

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const request: LoginRequest = {
    email,
    password,
  };

  const response = await fetch(
    `${API_BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
      data?.message ||
      "Login failed",
    );
  }

  return data as LoginResponse;
}
