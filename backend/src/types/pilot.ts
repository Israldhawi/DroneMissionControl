export type UserRole = "admin" | "pilot";

export interface Pilot {
  id: string;
  name: string;
  email: string;
  licenseNumber: string;
  role: UserRole;
  isActive: boolean;
}

export interface PilotWithPassword extends Pilot {
  passwordHash: string;
}