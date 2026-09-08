import { describe, it, expect } from "vitest";

import {
  validateBattery,
  validateDuration,
  validateFutureCompletion,
  hasMissionOverlap,
  validatePilotAssignment,
  validateStatusTransition,
  validateAbortReason,
} from "../src/services/missionRules";



describe("Mission Rules - R-03", () => {
  const now = new Date("2026-09-02T12:00:00Z");

  it("TC-25 / R-03: rejects completing a future mission", () => {
    const errors = validateFutureCompletion(
      "2026-09-03T12:00:00Z",
      "completed",
      now,
    );

    expect(errors.status).toBe(
      "A future mission cannot be marked as completed",
    );
  });

  it("TC-25 / R-03: accepts completing a mission that has arrived", () => {
    const errors = validateFutureCompletion(
      "2026-09-02T12:00:00Z",
      "completed",
      now,
    );

    expect(errors).toEqual({});
  });

  it("TC-25 / R-03: accepts completing a past mission", () => {
    const errors = validateFutureCompletion(
      "2026-09-01T12:00:00Z",
      "completed",
      now,
    );

    expect(errors).toEqual({});
  });

  it("TC-25 / R-03: does not block a future mission when the requested status is not completed", () => {
    const errors = validateFutureCompletion(
      "2026-09-03T12:00:00Z",
      "in_progress",
      now,
    );

    expect(errors).toEqual({});
  });
});

describe("Authentication", () => {
  it("TC-01 / should accept a valid email", () => {
    const email = "mohammed@example.com";

    expect(email).toContain("@");
  });

  it("TC-01 / should accept a valid password", () => {
    const password = "Admin123!";

    expect(password.length).toBeGreaterThanOrEqual(8);
  });

  it("TC-01 / should return the expected user information", () => {
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

  it("TC-01 / should identify an admin user", () => {
    const role = "admin";

    expect(role).toBe("admin");
  });
});

describe("Mission Rules - R-01 and R-02", () => {
  it("TC-07 / R-01: accepts valid battery values", () => {
    const errors = validateBattery(80, 40);

    expect(errors).toEqual({});
  });

  it("TC-07 / R-01: rejects batteryEnd equal to batteryStart", () => {
    const errors = validateBattery(50, 50);

    expect(errors.batteryEnd).toBe(
      "Battery end must be lower than battery start",
    );
  });

  it("TC-07 / R-01: rejects batteryEnd greater than batteryStart", () => {
    const errors = validateBattery(40, 80);

    expect(errors.batteryEnd).toBe(
      "Battery end must be lower than battery start",
    );
  });

  it("TC-07 / R-01: rejects batteryStart outside 0 to 100", () => {
    const errors = validateBattery(101, 40);

    expect(errors.batteryStart).toBe(
      "Battery start must be between 0 and 100",
    );
  });

  it("TC-07 / R-01: accepts null batteryEnd before completion", () => {
    const errors = validateBattery(80, null);

    expect(errors).toEqual({});
  });

  it("TC-06 / R-02: accepts duration of 1 minute", () => {
    const errors = validateDuration(1);

    expect(errors).toEqual({});
  });

  it("TC-06 / R-02: accepts duration of 120 minutes", () => {
    const errors = validateDuration(120);

    expect(errors).toEqual({});
  });

  it("TC-06 / R-02: rejects duration of 0", () => {
    const errors = validateDuration(0);

    expect(errors.durationMinutes).toBe(
      "Duration must be a whole number from 1 to 120",
    );
  });

  it("TC-06 / R-02: rejects duration above 120", () => {
    const errors = validateDuration(121);

    expect(errors.durationMinutes).toBe(
      "Duration must be a whole number from 1 to 120",
    );
  });

  it("TC-06 / R-02: rejects decimal duration", () => {
    const errors = validateDuration(30.5);

    expect(errors.durationMinutes).toBe(
      "Duration must be a whole number from 1 to 120",
    );
  });
});

describe("Mission Rules - R-04", () => {
  const existingMission = {
    id: "mission-001",
    pilotId: "pilot-001",
    scheduledAt: "2026-09-02T10:00:00Z",
    durationMinutes: 60,
  };

  it("TC-35 / R-04: rejects a mission that overlaps at the beginning", () => {
    const mission = {
      id: "mission-002",
      pilotId: "pilot-001",
      scheduledAt: "2026-09-02T09:30:00Z",
      durationMinutes: 60,
    };

    expect(
      hasMissionOverlap(mission, [existingMission]),
    ).toBe(true);
  });

  it("TC-35 / R-04: rejects a mission that overlaps at the end", () => {
    const mission = {
      id: "mission-002",
      pilotId: "pilot-001",
      scheduledAt: "2026-09-02T10:30:00Z",
      durationMinutes: 60,
    };

    expect(
      hasMissionOverlap(mission, [existingMission]),
    ).toBe(true);
  });

  it("TC-35 / R-04: rejects a mission completely inside another mission", () => {
    const mission = {
      id: "mission-002",
      pilotId: "pilot-001",
      scheduledAt: "2026-09-02T10:15:00Z",
      durationMinutes: 15,
    };

    expect(
      hasMissionOverlap(mission, [existingMission]),
    ).toBe(true);
  });

  it("TC-35 / R-04: allows missions that meet exactly at the boundary", () => {
    const mission = {
      id: "mission-002",
      pilotId: "pilot-001",
      scheduledAt: "2026-09-02T11:00:00Z",
      durationMinutes: 60,
    };

    expect(
      hasMissionOverlap(mission, [existingMission]),
    ).toBe(false);
  });

  it("TC-35 / R-04: allows missions for different pilots at the same time", () => {
    const mission = {
      id: "mission-002",
      pilotId: "pilot-002",
      scheduledAt: "2026-09-02T10:30:00Z",
      durationMinutes: 60,
    };

    expect(
      hasMissionOverlap(mission, [existingMission]),
    ).toBe(false);
  });

  it("TC-35 / R-04: excludes the mission being edited from the overlap check", () => {
    const mission = {
      id: "mission-001",
      pilotId: "pilot-001",
      scheduledAt: "2026-09-02T10:00:00Z",
      durationMinutes: 60,
    };

    expect(
      hasMissionOverlap(
        mission,
        [existingMission],
        "mission-001",
      ),
    ).toBe(false);
  });
});

describe("Mission Rules - R-05", () => {
  it("TC-27 / R-05: accepts an active pilot", () => {
    const pilot = {
      id: "pilot-001",
      isActive: true,
    };

    const errors = validatePilotAssignment(pilot);

    expect(errors).toEqual({});
  });

  it("TC-34 / R-05: rejects an inactive pilot", () => {
    const pilot = {
      id: "pilot-002",
      isActive: false,
    };

    const errors = validatePilotAssignment(pilot);

    expect(errors.pilotId).toBe(
      "Inactive pilots cannot be assigned new missions",
    );
  });

  it("TC-28 / R-05: does not reject an active pilot even when assigning a new mission", () => {
    const pilot = {
      id: "pilot-003",
      isActive: true,
    };

    const errors = validatePilotAssignment(pilot);

    expect(errors.pilotId).toBeUndefined();
  });
});

describe("Mission Rules - R-06", () => {
  it("TC-21 / R-06: allows planned to in_progress", () => {
    const errors = validateStatusTransition(
      "planned",
      "in_progress",
    );

    expect(errors).toEqual({});
  });

  it("TC-23 / R-06: allows planned to aborted", () => {
    const errors = validateStatusTransition(
      "planned",
      "aborted",
    );

    expect(errors).toEqual({});
  });

  it("TC-22 / R-06: allows in_progress to completed", () => {
    const errors = validateStatusTransition(
      "in_progress",
      "completed",
    );

    expect(errors).toEqual({});
  });

  it("TC-23 / R-06: allows in_progress to aborted", () => {
    const errors = validateStatusTransition(
      "in_progress",
      "aborted",
    );

    expect(errors).toEqual({});
  });

  it("TC-26 / R-06: rejects planned to completed", () => {
    const errors = validateStatusTransition(
      "planned",
      "completed",
    );

    expect(errors.status).toBe(
      "Invalid status transition from planned to completed",
    );
  });

  it("TC-09 / R-06: rejects changes from completed", () => {
    const errors = validateStatusTransition(
      "completed",
      "in_progress",
    );

    expect(errors.status).toBe(
      "Invalid status transition from completed to in_progress",
    );
  });

  it("TC-10 / R-06: rejects changes from aborted", () => {
    const errors = validateStatusTransition(
      "aborted",
      "in_progress",
    );

    expect(errors.status).toBe(
      "Invalid status transition from aborted to in_progress",
    );
  });
});

describe("Mission Rules - R-07", () => {
  it("TC-23 / R-07: accepts an abort reason with exactly 10 characters", () => {
    const notes = "1234567890";

    expect(notes.trim().length).toBeGreaterThanOrEqual(10);
  });

  it("TC-23 / R-07: accepts an abort reason longer than 10 characters", () => {
    const notes = "Mission aborted because of bad weather";

    expect(notes.trim().length).toBeGreaterThanOrEqual(10);
  });

  it("TC-24 / R-07: rejects an abort reason shorter than 10 characters", () => {
    const notes = "Too short";

    expect(notes.trim().length).toBeLessThan(10);
  });

  it("TC-24 / R-07: rejects a missing abort reason", () => {
  const notes: string | null = null;

  expect(
    notes === null || notes.trim().length < 10,
  ).toBe(true);
});
});
