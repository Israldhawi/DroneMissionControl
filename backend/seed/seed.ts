import bcrypt from "bcryptjs";
import db from "../src/db/database";

interface PilotSeed {
  id: string;
  name: string;
  email: string;
  licenseNumber: string;
  role: "admin" | "pilot";
  isActive: boolean;
  passwordHash: string;
}

interface MissionSeed {
  id: string;
  title: string;
  pilotId: string;
  location: string;
  scheduledAt: string;
  durationMinutes: number;
  batteryStart: number;
  batteryEnd: number | null;
  weather: "clear" | "cloudy" | "windy" | "rain";
  status: "planned" | "in_progress" | "completed" | "aborted";
  notes: string | null;
}

const adminPassword = "Admin123!";
const pilotPassword = "Pilot123!";

const adminPasswordHash = bcrypt.hashSync(adminPassword, 10);
const pilotPasswordHash = bcrypt.hashSync(pilotPassword, 10);

const pilots: PilotSeed[] = [
  {
    id: "pilot-001",
    name: "Mohammed Al Balushi",
    email: "mohammed@example.com",
    licenseNumber: "OM1001",
    role: "admin",
    isActive: true,
    passwordHash: adminPasswordHash,
  },
  {
    id: "pilot-002",
    name: "Ahmed Al Hinai",
    email: "ahmed@example.com",
    licenseNumber: "OM1002",
    role: "pilot",
    isActive: true,
    passwordHash: pilotPasswordHash,
  },
  {
    id: "pilot-003",
    name: "Sara Al Rashdi",
    email: "sara@example.com",
    licenseNumber: "OM1003",
    role: "pilot",
    isActive: true,
    passwordHash: pilotPasswordHash,
  },
  {
    id: "pilot-004",
    name: "Khalid Al Harthy",
    email: "khalid@example.com",
    licenseNumber: "OM1004",
    role: "pilot",
    isActive: true,
    passwordHash: pilotPasswordHash,
  },
];

const missions: MissionSeed[] = [
  {
    id: "mission-001",
    title: "Qurum Beach Survey",
    pilotId: "pilot-002",
    location: "Qurum Beach",
    scheduledAt: "2026-08-01T08:00:00.000Z",
    durationMinutes: 45,
    batteryStart: 100,
    batteryEnd: 72,
    weather: "clear",
    status: "completed",
    notes: "Routine coastal survey",
  },
  {
    id: "mission-002",
    title: "Muttrah Harbour Inspection",
    pilotId: "pilot-003",
    location: "Muttrah Harbour",
    scheduledAt: "2026-08-02T09:00:00.000Z",
    durationMinutes: 50,
    batteryStart: 95,
    batteryEnd: 65,
    weather: "cloudy",
    status: "completed",
    notes: "Harbour infrastructure inspection",
  },
  {
    id: "mission-003",
    title: "Al Mouj Mapping",
    pilotId: "pilot-004",
    location: "Al Mouj",
    scheduledAt: "2026-08-03T07:30:00.000Z",
    durationMinutes: 40,
    batteryStart: 100,
    batteryEnd: 75,
    weather: "clear",
    status: "completed",
    notes: "Area mapping mission",
  },
  {
    id: "mission-004",
    title: "Seeb Coastal Survey",
    pilotId: "pilot-002",
    location: "Seeb",
    scheduledAt: "2026-08-04T10:00:00.000Z",
    durationMinutes: 35,
    batteryStart: 90,
    batteryEnd: 68,
    weather: "windy",
    status: "completed",
    notes: null,
  },
  {
    id: "mission-005",
    title: "Al Khoud Inspection",
    pilotId: "pilot-003",
    location: "Al Khoud",
    scheduledAt: "2026-08-05T08:30:00.000Z",
    durationMinutes: 55,
    batteryStart: 100,
    batteryEnd: 62,
    weather: "clear",
    status: "completed",
    notes: "Infrastructure inspection",
  },
  {
    id: "mission-006",
    title: "Barka Coast Survey",
    pilotId: "pilot-004",
    location: "Barka",
    scheduledAt: "2026-08-06T06:30:00.000Z",
    durationMinutes: 30,
    batteryStart: 95,
    batteryEnd: 78,
    weather: "cloudy",
    status: "completed",
    notes: null,
  },
  {
    id: "mission-007",
    title: "Muscat Hills Mapping",
    pilotId: "pilot-002",
    location: "Muscat Hills",
    scheduledAt: "2026-08-07T09:30:00.000Z",
    durationMinutes: 60,
    batteryStart: 100,
    batteryEnd: 55,
    weather: "clear",
    status: "completed",
    notes: "Terrain mapping",
  },
  {
    id: "mission-008",
    title: "Ruwi Building Survey",
    pilotId: "pilot-003",
    location: "Ruwi",
    scheduledAt: "2026-08-08T11:00:00.000Z",
    durationMinutes: 40,
    batteryStart: 90,
    batteryEnd: 66,
    weather: "cloudy",
    status: "completed",
    notes: null,
  },
  {
    id: "mission-009",
    title: "Wadi Kabir Inspection",
    pilotId: "pilot-004",
    location: "Wadi Kabir",
    scheduledAt: "2026-08-09T07:00:00.000Z",
    durationMinutes: 45,
    batteryStart: 100,
    batteryEnd: 70,
    weather: "clear",
    status: "completed",
    notes: "Safety inspection",
  },
  {
    id: "mission-010",
    title: "Azaiba Coastal Mapping",
    pilotId: "pilot-002",
    location: "Azaiba",
    scheduledAt: "2026-08-10T08:00:00.000Z",
    durationMinutes: 50,
    batteryStart: 95,
    batteryEnd: 60,
    weather: "windy",
    status: "completed",
    notes: null,
  },
  {
    id: "mission-011",
    title: "Madinat Al Irfan Survey",
    pilotId: "pilot-003",
    location: "Madinat Al Irfan",
    scheduledAt: "2026-08-11T09:00:00.000Z",
    durationMinutes: 35,
    batteryStart: 100,
    batteryEnd: 82,
    weather: "clear",
    status: "completed",
    notes: "Development area survey",
  },
  {
    id: "mission-012",
    title: "Al Amerat Mapping",
    pilotId: "pilot-004",
    location: "Al Amerat",
    scheduledAt: "2026-08-12T07:30:00.000Z",
    durationMinutes: 70,
    batteryStart: 100,
    batteryEnd: 48,
    weather: "cloudy",
    status: "completed",
    notes: "Large area mapping",
  },
  {
    id: "mission-013",
    title: "Qantab Coast Inspection",
    pilotId: "pilot-002",
    location: "Qantab",
    scheduledAt: "2026-08-13T08:30:00.000Z",
    durationMinutes: 45,
    batteryStart: 90,
    batteryEnd: 64,
    weather: "clear",
    status: "completed",
    notes: null,
  },
  {
    id: "mission-014",
    title: "Bandar Khairan Survey",
    pilotId: "pilot-003",
    location: "Bandar Khairan",
    scheduledAt: "2026-08-14T06:00:00.000Z",
    durationMinutes: 80,
    batteryStart: 100,
    batteryEnd: 42,
    weather: "windy",
    status: "completed",
    notes: "Coastal terrain survey",
  },
  {
    id: "mission-015",
    title: "Nakhal Area Inspection",
    pilotId: "pilot-004",
    location: "Nakhal",
    scheduledAt: "2026-08-15T10:00:00.000Z",
    durationMinutes: 50,
    batteryStart: 95,
    batteryEnd: 63,
    weather: "clear",
    status: "completed",
    notes: null,
  },
  {
    id: "mission-016",
    title: "Current Qurum Mission",
    pilotId: "pilot-002",
    location: "Qurum",
    scheduledAt: "2026-09-01T14:00:00.000Z",
    durationMinutes: 45,
    batteryStart: 100,
    batteryEnd: null,
    weather: "clear",
    status: "in_progress",
    notes: "Live monitoring mission",
  },
  {
    id: "mission-017",
    title: "Current Seeb Mission",
    pilotId: "pilot-003",
    location: "Seeb",
    scheduledAt: "2026-09-01T15:00:00.000Z",
    durationMinutes: 40,
    batteryStart: 95,
    batteryEnd: null,
    weather: "cloudy",
    status: "in_progress",
    notes: null,
  },
  {
    id: "mission-018",
    title: "Planned Muttrah Survey",
    pilotId: "pilot-004",
    location: "Muttrah",
    scheduledAt: "2026-09-05T08:00:00.000Z",
    durationMinutes: 45,
    batteryStart: 100,
    batteryEnd: null,
    weather: "clear",
    status: "planned",
    notes: "Upcoming harbour survey",
  },
  {
    id: "mission-019",
    title: "Planned Al Mouj Survey",
    pilotId: "pilot-002",
    location: "Al Mouj",
    scheduledAt: "2026-09-06T09:00:00.000Z",
    durationMinutes: 60,
    batteryStart: 100,
    batteryEnd: null,
    weather: "cloudy",
    status: "planned",
    notes: null,
  },
  {
    id: "mission-020",
    title: "Planned Barka Mapping",
    pilotId: "pilot-003",
    location: "Barka",
    scheduledAt: "2026-09-07T07:00:00.000Z",
    durationMinutes: 50,
    batteryStart: 90,
    batteryEnd: null,
    weather: "clear",
    status: "planned",
    notes: "Coastal mapping",
  },
  {
    id: "mission-021",
    title: "Planned Al Khoud Survey",
    pilotId: "pilot-004",
    location: "Al Khoud",
    scheduledAt: "2026-09-08T10:00:00.000Z",
    durationMinutes: 30,
    batteryStart: 95,
    batteryEnd: null,
    weather: "windy",
    status: "planned",
    notes: null,
  },
  {
    id: "mission-022",
    title: "Aborted Ruwi Inspection",
    pilotId: "pilot-002",
    location: "Ruwi",
    scheduledAt: "2026-08-20T09:00:00.000Z",
    durationMinutes: 35,
    batteryStart: 100,
    batteryEnd: null,
    weather: "rain",
    status: "aborted",
    notes: "Weather conditions made flight unsafe",
  },
  {
    id: "mission-023",
    title: "Aborted Azaiba Survey",
    pilotId: "pilot-003",
    location: "Azaiba",
    scheduledAt: "2026-08-21T08:00:00.000Z",
    durationMinutes: 40,
    batteryStart: 95,
    batteryEnd: null,
    weather: "rain",
    status: "aborted",
    notes: "Heavy rain prevented safe operation",
  },
  {
    id: "mission-024",
    title: "Al Amerat Evening Survey",
    pilotId: "pilot-004",
    location: "Al Amerat",
    scheduledAt: "2026-08-25T16:00:00.000Z",
    durationMinutes: 55,
    batteryStart: 100,
    batteryEnd: 60,
    weather: "cloudy",
    status: "completed",
    notes: "Evening terrain survey",
  },
  {
    id: "mission-025",
    title: "Qurum Final Inspection",
    pilotId: "pilot-002",
    location: "Qurum Beach",
    scheduledAt: "2026-08-28T07:00:00.000Z",
    durationMinutes: 40,
    batteryStart: 100,
    batteryEnd: 74,
    weather: "clear",
    status: "completed",
    notes: "Final inspection",
  },
];

const insertPilot = db.prepare(`
  INSERT INTO pilots (
    id,
    name,
    email,
    license_number,
    role,
    is_active,
    password_hash
  )
  VALUES (
    @id,
    @name,
    @email,
    @licenseNumber,
    @role,
    @isActive,
    @passwordHash
  )
`);

const insertMission = db.prepare(`
  INSERT INTO missions (
    id,
    title,
    pilot_id,
    location,
    scheduled_at,
    duration_minutes,
    battery_start,
    battery_end,
    weather,
    status,
    notes
  )
  VALUES (
    @id,
    @title,
    @pilotId,
    @location,
    @scheduledAt,
    @durationMinutes,
    @batteryStart,
    @batteryEnd,
    @weather,
    @status,
    @notes
  )
`);

const seedDatabase = db.transaction(() => {
  db.prepare("DELETE FROM missions").run();
  db.prepare("DELETE FROM pilots").run();

  for (const pilot of pilots) {
    insertPilot.run({
      id: pilot.id,
      name: pilot.name,
      email: pilot.email,
      licenseNumber: pilot.licenseNumber,
      role: pilot.role,
      isActive: pilot.isActive ? 1 : 0,
      passwordHash: pilot.passwordHash,
    });
  }

  for (const mission of missions) {
    insertMission.run({
      id: mission.id,
      title: mission.title,
      pilotId: mission.pilotId,
      location: mission.location,
      scheduledAt: mission.scheduledAt,
      durationMinutes: mission.durationMinutes,
      batteryStart: mission.batteryStart,
      batteryEnd: mission.batteryEnd,
      weather: mission.weather,
      status: mission.status,
      notes: mission.notes,
    });
  }
});

seedDatabase();

console.log(
  `Seeded ${pilots.length} pilots and ${missions.length} missions.`,
);
console.log("Seed login accounts:");
console.log("Admin: mohammed@example.com / Admin123!");
console.log("Pilots: ahmed@example.com / Pilot123!");
console.log("        sara@example.com / Pilot123!");
console.log("        khalid@example.com / Pilot123!");