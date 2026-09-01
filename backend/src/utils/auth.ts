import jwt from "jsonwebtoken";
import type { UserRole } from "../types/pilot";

const JWT_SECRET = process.env.JWT_SECRET ?? "development-secret";

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

export function createToken(userId: string, role: UserRole): string {
  const payload: JwtPayload = {
    userId,
    role,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "8h",
  });
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (
    typeof decoded !== "object" ||
    decoded === null ||
    !("userId" in decoded) ||
    !("role" in decoded)
  ) {
    throw new Error("Invalid token payload");
  }

  const userId = decoded.userId;
  const role = decoded.role;

  if (
    typeof userId !== "string" ||
    (role !== "admin" && role !== "pilot")
  ) {
    throw new Error("Invalid token payload");
  }

  return {
    userId,
    role,
  };
}