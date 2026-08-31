export type UserRole = "admin" | "dispatcher" | "pilot";

export interface User {
    id: number;
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    createdAt: string;
}