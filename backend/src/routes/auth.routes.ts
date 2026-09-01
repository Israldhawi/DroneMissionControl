import { Router } from "express";
import {
  AuthenticationError,
  login,
} from "../services/auth.service";
import type { LoginRequest } from "../types/user";

const router = Router();

router.post("/login", (req, res) => {
  const body = req.body as Partial<LoginRequest>;

  if (
    typeof body.email !== "string" ||
    typeof body.password !== "string" ||
    body.email.trim() === "" ||
    body.password === ""
  ) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Email and password are required",
        fields: {
          email: "Email is required",
          password: "Password is required",
        },
      },
    });

    return;
  }

  try {
    const result = login(
      body.email.trim(),
      body.password,
    );

    res.status(200).json(result);
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        },
      });

      return;
    }

    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
    });
  }
});

export default router;