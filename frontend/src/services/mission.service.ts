import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from "./api";
import type {
  CreateMissionRequest,
  Mission,
  MissionFilters,
  MissionListResult,
  UpdateMissionRequest,
} from "../types/mission";

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

  return apiGet<MissionListResult>(
    `/missions?${query}`,
  );
}

export async function getMission(
  id: string,
): Promise<Mission> {
  return apiGet<Mission>(
    `/missions/${id}`,
  );
}

export async function createMission(
  mission: CreateMissionRequest,
): Promise<Mission> {
  return apiPost<Mission>(
    "/missions",
    mission,
  );
}

export async function updateMission(
  id: string,
  mission: UpdateMissionRequest,
): Promise<Mission> {
  return apiPut<Mission>(
    `/missions/${id}`,
    mission,
  );
}

export async function updateMissionStatus(
  id: string,
  status: UpdateMissionRequest["status"],
  notes?: string | null,
  batteryEnd?: number | null,
): Promise<Mission> {
  return apiPatch<Mission>(
    `/missions/${id}/status`,
    {
      status,
      notes,
      batteryEnd,
    },
  );
}

export async function deleteMission(
  id: string,
): Promise<void> {
  await apiDelete<unknown>(
    `/missions/${id}`,
  );
}
