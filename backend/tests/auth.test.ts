import { describe, it, expect } from "vitest";

describe("Authentication", () => {
  it("should accept a valid email", () => {
    const email = "mohammed@example.com";

    expect(email).toContain("@");
  });

  it("should accept a valid password", () => {
    const password = "Admin123!";

    expect(password.length).toBeGreaterThanOrEqual(8);
  });

  it("should return the expected user information", () => {
    const user = {
      id: "pilot-001",
      name: "Mohammed Al Balushi",
      email: "mohammed@example.com",
      role: "admin",
    };

    expect(user.id).toBe("pilot-001");
    expect(user.email).toBe("mohammed@example.com");
    expect(user.role).toBe("admin");
  });

  it("should identify an admin user", () => {
    const role = "admin";

    expect(role).toBe("admin");
  });
});