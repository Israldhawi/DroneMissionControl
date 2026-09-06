import type {
  CreateMissionRequest,
  Mission,
  MissionFilters,
  MissionListResult,
  UpdateMissionRequest,
} from "../types/mission";

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

async function handleResponse<T>(
  response: Response,
): Promise<T> {
  const text = await response.text();

  const data: ApiErrorResponse | null = text
    ? (JSON.parse(text) as ApiErrorResponse)
    : null;

  if (!response.ok) {
    throw new ApiError(
      data?.error?.message ||
        data?.message ||
        "Request failed",
      data?.error?.fields,
    );
  }

  return data as T;
}

function buildQuery(
  filters: MissionFilters = {},
): string {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.pilotId) {
    params.set("pilotId", filters.pilotId);
  }

  if (filters.dateFrom) {
    params.set("dateFrom", filters.dateFrom);
  }

  if (filters.dateTo) {
    params.set("dateTo", filters.dateTo);
  }

  if (filters.sortBy) {
    params.set("sortBy", filters.sortBy);
  }

  if (filters.sortOrder) {
    params.set("sortOrder", filters.sortOrder);
  }

  params.set(
    "page",
    String(filters.page ?? 1),
  );

  params.set(
    "pageSize",
    String(filters.pageSize ?? 10),
  );

  return params.toString();
}

export async function getMissions(
  filters: MissionFilters = {},
): Promise<MissionListResult> {
  const query = buildQuery(filters);

  const response = await fetch(
    `${API_BASE_URL}/missions?${query}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    },
  );

  return handleResponse<MissionListResult>(
    response,
  );
}

export async function getMission(
  id: string,
): Promise<Mission> {
  const response = await fetch(
    `${API_BASE_URL}/missions/${id}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    },
  );

  return handleResponse<Mission>(response);
}

export async function createMission(
  mission: CreateMissionRequest,
): Promise<Mission> {
  const response = await fetch(
    `${API_BASE_URL}/missions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(mission),
    },
  );

  return handleResponse<Mission>(response);
}

export async function updateMission(
  id: string,
  mission: UpdateMissionRequest,
): Promise<Mission> {
  const response = await fetch(
    `${API_BASE_URL}/missions/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(mission),
    },
  );

  return handleResponse<Mission>(response);
}

export async function updateMissionStatus(
  id: string,
  status: UpdateMissionRequest["status"],
  notes?: string | null,
  batteryEnd?: number | null,
): Promise<Mission> {
  const response = await fetch(
    `${API_BASE_URL}/missions/${id}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        status,
        notes,
        batteryEnd,
      }),
    },
  );

  return handleResponse<Mission>(response);
}

export async function deleteMission(
  id: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/missions/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    },
  );

  if (!response.ok) {
    const text = await response.text();
    const data = text
      ? JSON.parse(text)
      : null;

    throw new Error(
      data?.error?.message ||
      data?.message ||
      "Failed to delete mission",
    );
  }
}
