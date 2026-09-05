import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  getMission,
  updateMission,
} from "../services/mission.service";

import type {
  Mission,
  MissionStatus,
  Weather,
} from "../types/mission";

function MissionEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [batteryStart, setBatteryStart] = useState("");
  const [batteryEnd, setBatteryEnd] = useState("");
  const [weather, setWeather] =
    useState<Weather>("clear");
  const [status, setStatus] =
    useState<MissionStatus>("planned");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function loadMission() {
      if (!id) {
        setError("Mission ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const data = await getMission(id);

        setMission(data);
        setTitle(data.title);
        setLocation(data.location);
        const localDate = new Date(data.scheduledAt);

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
          String(data.durationMinutes),
        );
        setBatteryStart(
          String(data.batteryStart),
        );
        setBatteryEnd(
          data.batteryEnd !== null
            ? String(data.batteryEnd)
            : "",
        );
        setWeather(data.weather);
        setStatus(data.status);
        setNotes(data.notes ?? "");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load mission",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadMission();
  }, [id]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!id) {
      setError("Mission ID is missing.");
      return;
    }

    setError("");
    setSaving(true);

    try {
      await updateMission(id, {
        title,
        location,
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
        status,
        notes: notes || null,
      });

      navigate(`/missions/${id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update mission",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-6">
        Loading mission...
      </div>
    );
  }

  if (error && !mission) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>

        <Link
          to="/missions"
          className="inline-block rounded-lg bg-gray-900 px-4 py-2 font-medium text-white"
        >
          Back to Missions
        </Link>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="rounded-lg border bg-white p-6">
        Mission not found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <Link
          to={`/missions/${mission.id}`}
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ? Back to Mission
        </Link>

        <h2 className="mt-2 text-2xl font-bold text-gray-900">
          Edit Mission
        </h2>

        <p className="text-sm text-gray-500">
          {mission.title}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-lg border bg-white p-6"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label
              htmlFor="title"
              className="mb-1 block text-sm font-medium text-gray-700"
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
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor="location"
              className="mb-1 block text-sm font-medium text-gray-700"
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
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor="scheduledAt"
              className="mb-1 block text-sm font-medium text-gray-700"
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
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor="duration"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Duration (minutes)
            </label>

            <input
              id="duration"
              type="number"
              min="1"
              value={durationMinutes}
              onChange={(event) =>
                setDurationMinutes(event.target.value)
              }
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor="batteryStart"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Battery Start (%)
            </label>

            <input
              id="batteryStart"
              type="number"
              min="0"
              max="100"
              value={batteryStart}
              onChange={(event) =>
                setBatteryStart(event.target.value)
              }
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor="batteryEnd"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Battery End (%)
            </label>

            <input
              id="batteryEnd"
              type="number"
              min="0"
              max="100"
              value={batteryEnd}
              onChange={(event) =>
                setBatteryEnd(event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor="weather"
              className="mb-1 block text-sm font-medium text-gray-700"
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
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            >
              <option value="clear">Clear</option>
              <option value="cloudy">Cloudy</option>
              <option value="windy">Windy</option>
              <option value="rain">Rain</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Status
            </label>

            <select
              id="status"
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as MissionStatus,
                )
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            >
              <option value="planned">Planned</option>
              <option value="in_progress">
                In Progress
              </option>
              <option value="completed">
                Completed
              </option>
              <option value="aborted">Aborted</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="notes"
              className="mb-1 block text-sm font-medium text-gray-700"
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
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-gray-900"
            />
          </div>
        </div>

        <div className="flex gap-3 border-t pt-5">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-gray-900 px-5 py-2 font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <Link
            to={`/missions/${mission.id}`}
            className="rounded-lg bg-gray-200 px-5 py-2 font-medium text-gray-900 hover:bg-gray-300"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default MissionEdit;
