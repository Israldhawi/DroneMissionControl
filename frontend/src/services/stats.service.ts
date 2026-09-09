import { apiGet } from "./api";
import type { MissionStats } from "../types/stats";

export async function getMissionStats(): Promise<MissionStats> {
  return apiGet<MissionStats>("/stats");
}
