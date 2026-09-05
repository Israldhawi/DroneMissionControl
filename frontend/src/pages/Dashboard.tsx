import { useEffect, useState } from "react";

import { getMissionStats } from "../services/stats.service";

import type { MissionStats } from "../types/stats";

function Dashboard() {
  const [stats, setStats] = useState<MissionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
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

    void loadStats();
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-6">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-lg border bg-white p-6">
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Dashboard
        </h2>

        <p className="text-sm text-gray-500">
          Overview of drone mission activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border bg-white p-5"
          >
            <p className="text-sm text-gray-500">
              {card.label}
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Mission Status Summary
        </h3>

        <div className="space-y-4">
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>Planned</span>
              <span>{stats.planned}</span>
            </div>

            <div className="h-2 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-gray-900"
                style={{
                  width:
                    stats.total > 0
                      ? `${(stats.planned / stats.total) * 100}%`
                      : "0%",
                }}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>In Progress</span>
              <span>{stats.inProgress}</span>
            </div>

            <div className="h-2 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-gray-900"
                style={{
                  width:
                    stats.total > 0
                      ? `${(stats.inProgress / stats.total) * 100}%`
                      : "0%",
                }}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>Completed</span>
              <span>{stats.completed}</span>
            </div>

            <div className="h-2 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-gray-900"
                style={{
                  width:
                    stats.total > 0
                      ? `${(stats.completed / stats.total) * 100}%`
                      : "0%",
                }}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>Aborted</span>
              <span>{stats.aborted}</span>
            </div>

            <div className="h-2 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-gray-900"
                style={{
                  width:
                    stats.total > 0
                      ? `${(stats.aborted / stats.total) * 100}%`
                      : "0%",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
