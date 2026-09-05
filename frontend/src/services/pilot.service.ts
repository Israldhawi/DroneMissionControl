import type {
  Pilot,
  PilotListResult,
} from "../types/pilot";

const API_BASE_URL = "http://localhost:3000";

function getToken(): string {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    throw new Error("Authentication required");
  }

  return token;
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

  const text = await response.text();

  const data = text
    ? JSON.parse(text)
    : null;

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
      data?.message ||
      "Failed to load pilots",
    );
  }

  return (data as PilotListResult).data;
}
