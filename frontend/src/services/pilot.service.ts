import type {
  CreatePilotRequest,
  Pilot,
  PilotListResult,
  UpdatePilotRequest,
} from "../types/pilot";

const API_BASE_URL = "http://localhost:3000";

function getToken(): string {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    throw new Error("Authentication required");
  }

  return token;
}

interface ApiErrorResponse {
  error?: {
    code?: string;
    message?: string;
    fields?: Record<string, string>;
  };
  message?: string;
}

export class PilotApiError extends Error {
  fields?: Record<string, string>;

  constructor(
    message: string,
    fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "PilotApiError";
    this.fields = fields;
  }
}

async function handleResponse<T>(
  response: Response,
): Promise<T> {
  const text = await response.text();

  const data: ApiErrorResponse | T | null = text
    ? JSON.parse(text)
    : null;

  if (!response.ok) {
    const errorData = data as ApiErrorResponse | null;

    throw new PilotApiError(
      errorData?.error?.message ||
        errorData?.message ||
        "Request failed",
      errorData?.error?.fields,
    );
  }

  return data as T;
}

export async function getPilots(): Promise<Pilot[]> {
  const response = await fetch(
    `${API_BASE_URL}/pilots`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    },
  );

  const data =
    await handleResponse<PilotListResult>(response);

  return data.data;
}

export async function createPilot(
  pilot: CreatePilotRequest,
): Promise<Pilot> {
  const response = await fetch(
    `${API_BASE_URL}/pilots`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(pilot),
    },
  );

  return handleResponse<Pilot>(response);
}

export async function updatePilot(
  id: string,
  pilot: UpdatePilotRequest,
): Promise<Pilot> {
  const response = await fetch(
    `${API_BASE_URL}/pilots/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(pilot),
    },
  );

  return handleResponse<Pilot>(response);
}
