import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  ApiError,
  getMission,
  updateMission,
} from "../services/mission.service";

import { getPilots } from "../services/pilot.service";

import type {
  Mission,
  Weather,
} from "../types/mission";
import type { Pilot } from "../types/pilot";

function MissionEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mission, setMission] = useState<Mission | null>(null);
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);
  const [pilotsLoading, setPilotsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  const [title, setTitle] = useState("");
  const [pilotId, setPilotId] = useState("");
  const [location, setLocation] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [batteryStart, setBatteryStart] = useState("");
  const [batteryEnd, setBatteryEnd] = useState("");
  const [weather, setWeather] =
    useState<Weather>("clear");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!id) {
        setErrors({
          form: "Mission ID is missing.",
        });
        setLoading(false);
        setPilotsLoading(false);
        return;
      }

      try {
        const [missionData, pilotData] =
          await Promise.all([
            getMission(id),
            getPilots(),
          ]);

        setMission(missionData);

        setTitle(missionData.title);
        setPilotId(missionData.pilotId);
        setLocation(missionData.location);

        const localDate = new Date(
          missionData.scheduledAt,
        );

        const year = localDate.getFullYear();
        const month = String(
          localDate.getMonth() + 1,
        ).padStart(2, "0");
        const day = String(
          localDate.getDate(),
        ).padStart(2, "0");
        const hours = String(
          localDate.getHours(),
        ).padStart(2, "0");
        const minutes = String(
          localDate.getMinutes(),
        ).padStart(2, "0");

        setScheduledAt(
          `${year}-${month}-${day}T${hours}:${minutes}`,
        );

        setDurationMinutes(
          String(missionData.durationMinutes),
        );

        setBatteryStart(
          String(missionData.batteryStart),
        );

        setBatteryEnd(
          missionData.batteryEnd !== null
            ? String(missionData.batteryEnd)
            : "",
        );

        setWeather(missionData.weather);
        setNotes(missionData.notes ?? "");

        setPilots(
          pilotData.filter(
            (pilot) => pilot.isActive,
          ),
        );
          } catch (err) {
      if (err instanceof ApiError) {
        setErrors({
          ...err.fields,
          form: err.message,
        });
      } else {
        setErrors({
          form:
            err instanceof Error
              ? err.message
              : "Failed to update mission.",
        });
      }
    } finally {
        setLoading(false);
        setPilotsLoading(false);
      }
    }

    void loadData();
  }, [id]);

  function validateForm(): boolean {
    const nextErrors: Record<string, string> = {};

    if (title.trim().length < 3) {
      nextErrors.title =
        "Title must be at least 3 characters.";
    } else if (title.trim().length > 80) {
      nextErrors.title =
        "Title must not exceed 80 characters.";
    }

    if (!pilotId) {
      nextErrors.pilotId =
        "Please select a pilot.";
    }

    if (!location.trim()) {
      nextErrors.location =
        "Location is required.";
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

    const batteryStartValue =
      Number(batteryStart);

    if (
      batteryStart === "" ||
      !Number.isInteger(batteryStartValue) ||
      batteryStartValue < 0 ||
      batteryStartValue > 100
    ) {
      nextErrors.batteryStart =
        "Battery start must be a whole number between 0 and 100.";
    }

    if (batteryEnd !== "") {
      const batteryEndValue =
        Number(batteryEnd);

      if (
        !Number.isInteger(batteryEndValue) ||
        batteryEndValue < 0 ||
        batteryEndValue > 100
      ) {
        nextErrors.batteryEnd =
          "Battery end must be a whole number between 0 and 100.";
      } else if (
        Number.isInteger(batteryStartValue) &&
        batteryEndValue >= batteryStartValue
      ) {
        nextErrors.batteryEnd =
          "Battery end must be lower than battery start.";
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!id || !mission) {
      setErrors({
        form: "Mission data is unavailable.",
      });
      return;
    }

    if (
      mission.status === "completed" ||
      mission.status === "aborted"
    ) {
      setErrors({
        form:
          "Completed and aborted missions cannot be edited.",
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      await updateMission(id, {
        title: title.trim(),
        pilotId,
        location: location.trim(),
        scheduledAt: new Date(
          scheduledAt,
        ).toISOString(),
        durationMinutes: Number(durationMinutes),
        batteryStart: Number(batteryStart),
        batteryEnd:
          batteryEnd === ""
            ? null
            : Number(batteryEnd),
        weather,
        notes: notes.trim() || null,
      });

      navigate(`/missions/${id}`);
    } catch (err) {
      setErrors({
        form:
          err instanceof Error
            ? err.message
            : "Failed to update mission.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-300 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        Loading mission...
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="space-y-4">
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          {errors.form || "Mission not found."}
        </div>

        <Link
          to="/missions"
          className="inline-block rounded-lg bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-700"
        >
          Back to Missions
        </Link>
      </div>
    );
  }

  const finalMission =
    mission.status === "completed" ||
    mission.status === "aborted";

  if (finalMission) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-300">
          Completed and aborted missions cannot be edited.
        </div>

        <Link
          to={`/missions/${mission.id}`}
          className="inline-block rounded-lg bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-700"
        >
          Back to Mission
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <Link
          to={`/missions/${mission.id}`}
          className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          ← Back to Mission
        </Link>

        <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          Edit Mission
        </h2>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {mission.title}
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
              htmlFor="batteryEnd"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Battery End (%)
            </label>

            <input
              id="batteryEnd"
              type="number"
              min="0"
              max="100"
              step="1"
              value={batteryEnd}
              onChange={(event) =>
                setBatteryEnd(event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />

            {errors.batteryEnd && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.batteryEnd}
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
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <Link
            to={`/missions/${mission.id}`}
            className="rounded-lg bg-gray-200 px-5 py-2.5 font-medium text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default MissionEdit;
