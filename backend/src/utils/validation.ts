export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isValidEmail(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || value.trim() === "") {
    return false;
  }

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
}

export function isValidWeather(
  value: unknown,
): value is "clear" | "cloudy" | "windy" | "rain" {
  return (
    value === "clear" ||
    value === "cloudy" ||
    value === "windy" ||
    value === "rain"
  );
}

export function isValidMissionStatus(
  value: unknown,
): value is
  | "planned"
  | "in_progress"
  | "completed"
  | "aborted" {
  return (
    value === "planned" ||
    value === "in_progress" ||
    value === "completed" ||
    value === "aborted"
  );
}

export function isValidLicenseNumber(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  return /^[A-Za-z]{2}\d{4}$/.test(value.trim());
}