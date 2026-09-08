import { useEffect, useState } from "react";

import { getMissionStats } from "../services/stats.service";

import type { MissionStats } from "../types/stats";

function formatFlightTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function getStatusLabel(status: string): string {
  if (status === "in_progress") {
    return "In Progress";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function Dashboard() {
  const [stats, setStats] =
    useState<MissionStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadStats() {
    setLoading(true);
    setError("");

    try {
      const data = await getMissionStats();
      setStats(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load dashboard statistics",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStats();
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        <p>{error}</p>

        <button
          type="button"
          onClick={() => void loadStats()}
          className="font-semibold underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        No statistics available.
      </div>
    );
  }

  const cards = [
    {
      label: "Total Missions",
      value: stats.total,
    },
    {
      label: "Total Flight Time",
      value: formatFlightTime(
        stats.totalFlightTimeMinutes,
      ),
    },
    {
      label: "Avg Battery Used",
      value: `${stats.averageBatteryUsed}%`,
    },
    {
      label: "Planned",
      value: stats.planned,
    },
    {
      label: "In Progress",
      value: stats.inProgress,
    },
    {
      label: "Completed",
      value: stats.completed,
    },
    {
      label: "Aborted",
      value: stats.aborted,
    },
  ];

  const maxStatusCount = Math.max(
    ...stats.statusCounts.map(
      (item) => item.count,
    ),
    1,
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h2>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Overview of drone mission activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {card.label}
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-5 text-lg font-semibold text-gray-900 dark:text-white">
            Mission Status
          </h3>

          <div className="space-y-5">
            {stats.statusCounts.map((item) => (
              <div key={item.status}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-200">
                    {getStatusLabel(item.status)}
                  </span>

                  <span className="font-semibold text-gray-900 dark:text-white">
                    {item.count}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-3 rounded-full bg-gray-900 dark:bg-gray-200"
                    style={{
                      width: `${(item.count / maxStatusCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-5 text-lg font-semibold text-gray-900 dark:text-white">
            Top 3 Pilots
          </h3>

          <div className="space-y-3">
            {stats.topPilots.map((pilot, index) => (
              <div
                key={pilot.pilotId}
                className="flex items-center justify-between rounded-lg border p-4 dark:border-gray-700"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                    {index + 1}
                  </div>

                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {pilot.pilotName}
                    </p>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {pilot.missionCount} missions
                    </p>
                  </div>
                </div>

                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {pilot.missionCount}
                </span>
              </div>
            ))}

            {stats.topPilots.length === 0 && (
              <p className="text-sm text-gray-500">
                No pilot statistics available.
              </p>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-5 text-lg font-semibold text-gray-900 dark:text-white">
          Mission Status Chart
        </h3>

        <div className="flex h-64 items-end justify-around gap-4 border-b border-l px-4 pb-0 pt-6 dark:border-gray-600">
          {stats.statusCounts.map((item) => {
            const height =
              (item.count / maxStatusCount) * 100;

            return (
              <div
                key={item.status}
                className="flex h-full flex-1 flex-col items-center justify-end"
              >
                <span className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                  {item.count}
                </span>

                <div
                  className="w-full max-w-20 rounded-t-md bg-gray-900 dark:bg-gray-200"
                  style={{
                    height: `${height}%`,
                    minHeight:
                      item.count > 0 ? "8px" : "0",
                  }}
                  title={`${getStatusLabel(item.status)}: ${item.count}`}
                />

                <span className="mt-3 text-center text-xs text-gray-600 dark:text-gray-300">
                  {getStatusLabel(item.status)}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
