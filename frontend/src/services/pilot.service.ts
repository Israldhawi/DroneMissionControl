import {
  apiGet,
  apiPost,
  apiPut,
} from "./api";
import type {
  CreatePilotRequest,
  Pilot,
  PilotListResult,
  UpdatePilotRequest,
} from "../types/pilot";

export async function getPilots(): Promise<Pilot[]> {
  const data = await apiGet<PilotListResult>("/pilots");

  return data.data;
}

export async function createPilot(
  pilot: CreatePilotRequest,
): Promise<Pilot> {
  return apiPost<Pilot>(
    "/pilots",
    pilot,
  );
}

export async function updatePilot(
  id: string,
  pilot: UpdatePilotRequest,
): Promise<Pilot> {
  return apiPut<Pilot>(
    `/pilots/${id}`,
    pilot,
  );
}
