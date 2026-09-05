import type { MissionStats } from "../types/stats";

const API_BASE_URL = "http://localhost:3000";

function getToken(): string {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    throw new Error("Authentication required");
  }

  return token;
}

export async function getMissionStats(): Promise<MissionStats> {
  const response = await fetch(
    `${API_BASE_URL}/stats`,
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
      "Failed to load mission statistics",
    );
  }

  return data as MissionStats;
}
