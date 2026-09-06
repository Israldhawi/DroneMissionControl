import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createMission } from "../services/mission.service";
import { getPilots } from "../services/pilot.service";

import type { Weather } from "../types/mission";
import type { Pilot } from "../types/pilot";

function MissionCreate() {
  const navigate = useNavigate();

  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [pilotsLoading, setPilotsLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [pilotId, setPilotId] = useState("");
  const [location, setLocation] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [batteryStart, setBatteryStart] = useState("");
  const [weather, setWeather] = useState<Weather>("clear");
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPilots() {
      try {
        const data = await getPilots();
        setPilots(data.filter((pilot) => pilot.isActive));
      } catch (err) {
        setErrors({
          form:
            err instanceof Error
              ? err.message
              : "Failed to load pilots.",
        });
      } finally {
        setPilotsLoading(false);
      }
    }

    void loadPilots();
  }, []);

  function validateForm(): boolean {
    const nextErrors: Record<string, string> = {};

    if (title.trim().length < 3) {
      nextErrors.title =
        "Title must be at least 3 characters.";
    }

    if (title.trim().length > 80) {
      nextErrors.title =
        "Title must not exceed 80 characters.";
    }

    if (!pilotId) {
      nextErrors.pilotId = "Please select a pilot.";
    }

    if (!location.trim()) {
      nextErrors.location = "Location is required.";
    }

    if (!scheduledAt) {
      nextErrors.scheduledAt =
        "Scheduled date and time are required.";
    }

    const duration = Number(durationMinutes);

    if (
      durationMinutes === "" ||
      !Number.isInteger(duration) ||
      duration < 1 ||
      duration > 120
    ) {
      nextErrors.durationMinutes =
        "Duration must be a whole number between 1 and 120 minutes.";
    }

    const battery = Number(batteryStart);

    if (
      batteryStart === "" ||
      !Number.isInteger(battery) ||
      battery < 0 ||
      battery > 100
    ) {
      nextErrors.batteryStart =
        "Battery start must be a whole number between 0 and 100.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      const mission = await createMission({
        title: title.trim(),
        pilotId,
        location: location.trim(),
        scheduledAt: new Date(
          scheduledAt,
        ).toISOString(),
        durationMinutes: Number(durationMinutes),
        batteryStart: Number(batteryStart),
        batteryEnd: null,
        weather,
        status: "planned",
        notes: notes.trim() || null,
      });

      navigate(`/missions/${mission.id}`);
    } catch (err) {
      setErrors({
        form:
          err instanceof Error
            ? err.message
            : "Failed to create mission.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <Link
          to="/missions"
          className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          ← Back to Missions
        </Link>

        <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          Create Mission
        </h2>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Create a new planned drone mission.
        </p>
      </div>

      {errors.form && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          {errors.form}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label
              htmlFor="title"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Mission Title
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              required
              minLength={3}
              maxLength={80}
              placeholder="e.g. Qurum Beach Survey"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />

            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="pilotId"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Pilot
            </label>

            <select
              id="pilotId"
              value={pilotId}
              onChange={(event) =>
                setPilotId(event.target.value)
              }
              disabled={pilotsLoading}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            >
              <option value="">
                {pilotsLoading
                  ? "Loading pilots..."
                  : "Select a pilot"}
              </option>

              {pilots.map((pilot) => (
                <option
                  key={pilot.id}
                  value={pilot.id}
                >
                  {pilot.name} — {pilot.licenseNumber}
                </option>
              ))}
            </select>

            {errors.pilotId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.pilotId}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="location"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Location
            </label>

            <input
              id="location"
              type="text"
              value={location}
              onChange={(event) =>
                setLocation(event.target.value)
              }
              required
              placeholder="e.g. Qurum Beach"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />

            {errors.location && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.location}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="scheduledAt"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Scheduled At
            </label>

            <input
              id="scheduledAt"
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) =>
                setScheduledAt(event.target.value)
              }
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />

            {errors.scheduledAt && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.scheduledAt}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="duration"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Duration (minutes)
            </label>

            <input
              id="duration"
              type="number"
              min="1"
              max="120"
              step="1"
              value={durationMinutes}
              onChange={(event) =>
                setDurationMinutes(event.target.value)
              }
              required
              placeholder="1–120"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />

            {errors.durationMinutes && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.durationMinutes}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="batteryStart"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Battery Start (%)
            </label>

            <input
              id="batteryStart"
              type="number"
              min="0"
              max="100"
              step="1"
              value={batteryStart}
              onChange={(event) =>
                setBatteryStart(event.target.value)
              }
              required
              placeholder="0–100"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />

            {errors.batteryStart && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.batteryStart}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="weather"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Weather
            </label>

            <select
              id="weather"
              value={weather}
              onChange={(event) =>
                setWeather(
                  event.target.value as Weather,
                )
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            >
              <option value="clear">Clear</option>
              <option value="cloudy">Cloudy</option>
              <option value="windy">Windy</option>
              <option value="rain">Rain</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="notes"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Notes
            </label>

            <textarea
              id="notes"
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              maxLength={500}
              rows={5}
              placeholder="Optional mission notes..."
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
          <button
            type="submit"
            disabled={saving || pilotsLoading}
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Mission"}
          </button>

          <Link
            to="/missions"
            className="rounded-lg bg-gray-200 px-5 py-2.5 font-medium text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default MissionCreate;
