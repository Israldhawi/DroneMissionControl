export type PilotStatus = "active" | "inactive" | "suspended";

export interface Pilot {
    id: number;
    userId: number;
    licenseNumber: string;
    statuse: PilotStatus;
    createdAt: string;
}