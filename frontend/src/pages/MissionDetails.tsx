import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  deleteMission,
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

  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false);
  const [deleting, setDeleting] = useState(false);

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

  async function handleDelete() {
    if (!id || !mission || user?.role !== "admin") {
      return;
    }

    setError("");
    setDeleting(true);

    try {
      await deleteMission(id);
      navigate("/missions");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete mission",
      );

      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  }

  async function handleComplete() {
    if (!id || !mission) return;

    if (batteryEnd === "") {
      setError(
        "Battery end is required to complete the mission.",
      );
      return;
    }

    const batteryEndValue = Number(batteryEnd);

    if (
      !Number.isInteger(batteryEndValue) ||
      batteryEndValue < 0 ||
      batteryEndValue > 100
    ) {
      setError(
        "Battery end must be a whole number between 0 and 100.",
      );
      return;
    }

    if (batteryEndValue >= mission.batteryStart) {
      setError(
        "Battery end must be lower than battery start.",
      );
      return;
    }

    setError("");
    setActionLoading(true);

    try {
      const updated = await updateMissionStatus(
        id,
        "completed",
        mission.notes ?? null,
        batteryEndValue,
      );

      setMission(updated);
      setBatteryEnd(String(updated.batteryEnd ?? ""));
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
      <div className="rounded-lg border border-gray-300 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        Loading mission...
      </div>
    );
  }

  if (error && !mission) {
    return (
      <div className="space-y-4">
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          {error}
        </div>

        <button
          type="button"
          onClick={() => navigate("/missions")}
          className="rounded-lg bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-700"
        >
          Back to Missions
        </button>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="rounded-lg border border-gray-300 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
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

  const canDelete =
    user?.role === "admin" &&
    mission.status !== "completed" &&
    mission.status !== "aborted";

  const batteryUsed =
    mission.batteryEnd !== null
      ? mission.batteryStart - mission.batteryEnd
      : null;

  const timeline = [
    {
      label: "Mission created",
      date: mission.createdAt,
    },
    {
      label: "Scheduled",
      date: mission.scheduledAt,
    },
    {
      label:
        mission.status === "planned"
          ? "Current status: Planned"
          : mission.status === "in_progress"
            ? "Current status: In Progress"
            : mission.status === "completed"
              ? "Current status: Completed"
              : "Current status: Aborted",
      date: mission.updatedAt,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/missions"
            className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            ← Back to Missions
          </Link>

          <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {mission.title}
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Mission ID: {mission.id}
          </p>
        </div>

        <div className="flex gap-3">
          {canEdit && (
            <Link
              to={`/missions/${mission.id}/edit`}
              className="rounded-lg bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-700 dark:bg-gray-950"
            >
              Edit Mission
            </Link>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting}
              className="rounded-lg border border-red-300 px-4 py-2 font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/30"
            >
              Delete Mission
            </button>
          )}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-gray-300 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Mission Information
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Location
              </p>

              <p className="font-medium text-gray-900 dark:text-white">
                {mission.location}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Scheduled At
              </p>

              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(
                  mission.scheduledAt,
                ).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Duration
              </p>

              <p className="font-medium text-gray-900 dark:text-white">
                {mission.durationMinutes} minutes
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pilot ID
              </p>

              <p className="font-medium text-gray-900 dark:text-white">
                {mission.pilotId}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-300 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Flight Information
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Status
              </p>

              <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm font-medium capitalize text-gray-900 dark:bg-gray-900 dark:text-white">
                {mission.status.replace("_", " ")}
              </span>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Weather
              </p>

              <p className="font-medium capitalize text-gray-900 dark:text-white">
                {mission.weather}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Battery Start
              </p>

              <p className="font-medium text-gray-900 dark:text-white">
                {mission.batteryStart}%
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Battery End
              </p>

              <p className="font-medium text-gray-900 dark:text-white">
                {mission.batteryEnd !== null
                  ? `${mission.batteryEnd}%`
                  : "Not recorded"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Battery Used
              </p>

              <p className="font-medium text-gray-900 dark:text-white">
                {batteryUsed !== null
                  ? `${batteryUsed}%`
                  : "Not available until mission completion"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-300 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-5 text-lg font-semibold text-gray-900 dark:text-white">
          Mission Timeline
        </h3>

        <div className="space-y-5">
          {timeline.map((event, index) => (
            <div
              key={`${event.label}-${event.date}`}
              className="flex gap-4"
            >
              <div className="flex flex-col items-center">
                <div className="h-3 w-3 rounded-full bg-blue-600" />

                {index < timeline.length - 1 && (
                  <div className="mt-1 h-full min-h-8 w-px bg-gray-300 dark:bg-gray-600" />
                )}
              </div>

              <div className="pb-2">
                <p className="font-medium text-gray-900 dark:text-white">
                  {event.label}
                </p>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(
                    event.date,
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-5 text-xs text-gray-500 dark:text-gray-400">
          Timeline events use the mission timestamps provided by
          the API.
        </p>
      </div>

      {canEdit &&
        mission.status !== "completed" &&
        mission.status !== "aborted" && (
          <div className="rounded-lg border border-gray-300 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Mission Actions
            </h3>

            <div className="space-y-5">
              {mission.status === "planned" && (
                <button
                  type="button"
                  onClick={() => void handleStart()}
                  disabled={actionLoading}
                  className="rounded-lg bg-gray-900 px-5 py-2 font-medium text-white hover:bg-gray-700 disabled:opacity-50 dark:bg-gray-950"
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
                      className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
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
                      className="w-full max-w-xs rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleComplete()}
                    disabled={actionLoading}
                    className="rounded-lg bg-gray-900 px-5 py-2 font-medium text-white hover:bg-gray-700 disabled:opacity-50 dark:bg-gray-950"
                  >
                    {actionLoading
                      ? "Updating..."
                      : "Complete Mission"}
                  </button>
                </div>
              )}

              <div className="border-t border-gray-300 pt-5 dark:border-gray-600">
                <label
                  htmlFor="abortReason"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
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
                  className="mb-3 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />

                <button
                  type="button"
                  onClick={() => void handleAbort()}
                  disabled={actionLoading}
                  className="rounded-lg border border-red-300 px-5 py-2 font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/30"
                >
                  {actionLoading
                    ? "Updating..."
                    : "Abort Mission"}
                </button>
              </div>
            </div>
          </div>
        )}

      <div className="rounded-lg border border-gray-300 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
          Notes
        </h3>

        <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
          {mission.notes || "No notes available."}
        </p>
      </div>

      {showDeleteConfirm && canDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-mission-title"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <h2
              id="delete-mission-title"
              className="mb-3 text-xl font-semibold text-gray-900 dark:text-white"
            >
              Delete Mission
            </h2>

            <p className="mb-2 text-gray-700 dark:text-gray-300">
              Are you sure you want to delete this mission?
            </p>

            <p className="mb-6 rounded-lg bg-gray-50 p-3 font-medium text-gray-900 dark:bg-gray-900 dark:text-white">
              "{mission.title}"
            </p>

            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-900 hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting
                  ? "Deleting..."
                  : "Yes, Delete Mission"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MissionDetails;