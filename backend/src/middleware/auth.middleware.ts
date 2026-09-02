import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/auth";
import type { AuthenticatedRequestUser } from "../types/user";

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedRequestUser;
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const authorization = req.headers.authorization;

  if (!authorization) {
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    });

    return;
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid authorization header",
      },
    });

    return;
  }

  try {
    const payload = verifyToken(token);

    req.user = {
      id: payload.userId,
      role: payload.role,
    };

    next();
  } catch {
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid or expired token",
      },
    });
  }
}