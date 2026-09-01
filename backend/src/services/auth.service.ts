import bcrypt from "bcryptjs";
import { findPilotForLogin } from "../repositories/pilot.repository";
import type {
  AuthUser,
  LoginResponse,
} from "../types/user";
import { createToken } from "../utils/auth";

export class AuthenticationError extends Error {
  constructor() {
    super("Invalid email or password");
    this.name = "AuthenticationError";
  }
}

export function login(
  email: string,
  password: string,
): LoginResponse {
  const pilot = findPilotForLogin(email);

  if (!pilot || !pilot.isActive) {
    throw new AuthenticationError();
  }

  const passwordMatches = bcrypt.compareSync(
    password,
    pilot.passwordHash,
  );

  if (!passwordMatches) {
    throw new AuthenticationError();
  }

  const user: AuthUser = {
    id: pilot.id,
    name: pilot.name,
    email: pilot.email,
    role: pilot.role,
  };

  const token = createToken(user.id, user.role);

  return {
    token,
    user,
  };
}