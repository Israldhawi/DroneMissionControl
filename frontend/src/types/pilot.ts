export type UserRole = "admin" | "pilot";

export interface Pilot {
  id: string;
  name: string;
  email: string;
  licenseNumber: string;
  role: UserRole;
  isActive: boolean;
  missionCount: number;
}

export interface PilotWithPassword extends Pilot {
  passwordHash: string;
}

export interface PilotListResult {
  data: Pilot[];
}

export interface CreatePilotRequest {
  name: string;
  email: string;
  licenseNumber: string;
  role: UserRole;
  isActive: boolean;
  password: string;
}

export interface UpdatePilotRequest {
  name?: string;
  email?: string;
  licenseNumber?: string;
  role?: UserRole;
  isActive?: boolean;
  password?: string;
}
