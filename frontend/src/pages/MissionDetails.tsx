import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  getMission,
  updateMissionStatus,
} from "../services/mission.service";

import { useAuth } from "../context/AuthContext";

import type { Mission } from "../types/mission";

function MissionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [batteryEnd, setBatteryEnd] = useState("");
  const [abortReason, setAbortReason] = useState("");

  async function loadMission() {
    if (!id) {
      setError("Mission ID is missing.");
      setLoading(false);
      return;
    }

    try {
      const data = await getMission(id);
      setMission(data);
      setBatteryEnd(
        data.batteryEnd !== null
          ? String(data.batteryEnd)
          : "",
      );
      setAbortReason(data.notes ?? "");
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

  useEffect(() => {
    void loadMission();
  }, [id]);

  async function handleStart() {
    if (!id) return;

    setError("");
    setActionLoading(true);

    try {
      const updated = await updateMissionStatus(
        id,
        "in_progress",
      );

      setMission(updated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to start mission",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleComplete() {
    if (!id) return;

    if (batteryEnd === "") {
      setError("Battery end is required to complete the mission.");
      return;
    }

    setError("");
    setActionLoading(true);

    try {
      const updated = await updateMissionStatus(
        id,
        "completed",
        mission?.notes ?? null,
        Number(batteryEnd),
      );

      setMission(updated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to complete mission",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAbort() {
    if (!id) return;

    if (abortReason.trim().length < 10) {
      setError(
        "Abort reason must be at least 10 characters.",
      );
      return;
    }

    setError("");
    setActionLoading(true);

    try {
      const updated = await updateMissionStatus(
        id,
        "aborted",
        abortReason.trim(),
        mission?.batteryEnd ?? null,
      );

      setMission(updated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to abort mission",
      );
    } finally {
      setActionLoading(false);
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

        <button
          type="button"
          onClick={() => navigate("/missions")}
          className="rounded-lg bg-gray-900 px-4 py-2 font-medium text-white"
        >
          Back to Missions
        </button>
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

  const canEdit =
    user?.role === "admin" ||
    (user?.role === "pilot" &&
      mission.pilotId === user.id &&
      (mission.status === "planned" ||
        mission.status === "in_progress"));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/missions"
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            ? Back to Missions
          </Link>

          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            {mission.title}
          </h2>

          <p className="text-sm text-gray-500">
            Mission ID: {mission.id}
          </p>
        </div>

        {canEdit && (
          <Link
            to={`/missions/${mission.id}/edit`}
            className="rounded-lg bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-700"
          >
            Edit Mission
          </Link>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Mission Information
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">
                Location
              </p>
              <p className="font-medium text-gray-900">
                {mission.location}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Scheduled At
              </p>
              <p className="font-medium text-gray-900">
                {new Date(
                  mission.scheduledAt,
                ).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Duration
              </p>
              <p className="font-medium text-gray-900">
                {mission.durationMinutes} minutes
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Pilot ID
              </p>
              <p className="font-medium text-gray-900">
                {mission.pilotId}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Flight Information
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">
                Status
              </p>

              <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm font-medium capitalize text-gray-900">
                {mission.status.replace("_", " ")}
              </span>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Weather
              </p>
              <p className="font-medium capitalize text-gray-900">
                {mission.weather}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Battery Start
              </p>
              <p className="font-medium text-gray-900">
                {mission.batteryStart}%
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Battery End
              </p>
              <p className="font-medium text-gray-900">
                {mission.batteryEnd !== null
                  ? `${mission.batteryEnd}%`
                  : "Not recorded"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {canEdit &&
        mission.status !== "completed" &&
        mission.status !== "aborted" && (
          <div className="rounded-lg border bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Mission Actions
            </h3>

            <div className="space-y-5">
              {mission.status === "planned" && (
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={actionLoading}
                  className="rounded-lg bg-gray-900 px-5 py-2 font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                >
                  {actionLoading
                    ? "Updating..."
                    : "Start Mission"}
                </button>
              )}

              {mission.status === "in_progress" && (
                <div className="space-y-3">
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
                      className="w-full max-w-xs rounded-lg border border-gray-300 px-4 py-2"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleComplete}
                    disabled={actionLoading}
                    className="rounded-lg bg-gray-900 px-5 py-2 font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                  >
                    {actionLoading
                      ? "Updating..."
                      : "Complete Mission"}
                  </button>
                </div>
              )}

              <div className="border-t pt-5">
                <label
                  htmlFor="abortReason"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Abort Reason
                </label>

                <textarea
                  id="abortReason"
                  value={abortReason}
                  onChange={(event) =>
                    setAbortReason(event.target.value)
                  }
                  maxLength={500}
                  rows={3}
                  placeholder="Enter the reason for aborting this mission..."
                  className="mb-3 w-full rounded-lg border border-gray-300 px-4 py-2"
                />

                <button
                  type="button"
                  onClick={handleAbort}
                  disabled={actionLoading}
                  className="rounded-lg border border-red-300 px-5 py-2 font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  {actionLoading
                    ? "Updating..."
                    : "Abort Mission"}
                </button>
              </div>
            </div>
          </div>
        )}

      <div className="rounded-lg border bg-white p-6">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">
          Notes
        </h3>

        <p className="whitespace-pre-wrap text-gray-700">
          {mission.notes || "No notes available."}
        </p>
      </div>
    </div>
  );
}

export default MissionDetails;
