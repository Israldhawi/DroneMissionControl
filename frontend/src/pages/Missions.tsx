import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMissions } from "../services/mission.service";
import { useAuth } from "../context/AuthContext";

import type {
  Mission,
  MissionStatus,
} from "../types/mission";

function Missions() {
  const { user } = useAuth();

  const [missions, setMissions] = useState<Mission[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<MissionStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadMissions() {
    setLoading(true);
    setError("");

    try {
      const result = await getMissions({
        search: search || undefined,
        status: status || undefined,
        page: 1,
        pageSize: 20,
        sortBy: "scheduledAt",
        sortOrder: "desc",
      });

      setMissions(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load missions",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMissions();
  }, [status]);

  function handleSearchSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    void loadMissions();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Missions
          </h2>
          <p className="text-sm text-gray-500">
            View and manage drone missions.
          </p>
        </div>

        {user?.role === "admin" && (
          <Link
            to="/missions/new"
            className="rounded-lg bg-gray-900 px-4 py-2 font-medium text-white hover:bg-gray-700"
          >
            Create Mission
          </Link>
        )}
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-wrap gap-3"
      >
        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search title or location..."
          className="min-w-64 rounded-lg border border-gray-300 bg-white px-4 py-2 outline-none focus:border-gray-900"
        />

        <select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value as MissionStatus | "",
            )
          }
          className="rounded-lg border border-gray-300 bg-white px-4 py-2"
        >
          <option value="">All statuses</option>
          <option value="planned">Planned</option>
          <option value="in_progress">
            In Progress
          </option>
          <option value="completed">Completed</option>
          <option value="aborted">Aborted</option>
        </select>

        <button
          type="submit"
          className="rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-900 hover:bg-gray-300"
        >
          Search
        </button>
      </form>

      {loading && (
        <div className="rounded-lg border bg-white p-6">
          Loading missions...
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-hidden rounded-lg border bg-white">
          {missions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No missions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold">
                      Mission
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      Location
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      Scheduled
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      Duration
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      Weather
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      Status
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {missions.map((mission) => (
                    <tr
                      key={mission.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">
                          {mission.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {mission.id}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        {mission.location}
                      </td>

                      <td className="px-4 py-3">
                        {new Date(
                          mission.scheduledAt,
                        ).toLocaleString()}
                      </td>

                      <td className="px-4 py-3">
                        {mission.durationMinutes} min
                      </td>

                      <td className="px-4 py-3 capitalize">
                        {mission.weather}
                      </td>

                      <td className="px-4 py-3">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize">
                          {mission.status.replace(
                            "_",
                            " ",
                          )}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <Link
                          to={`/missions/${mission.id}`}
                          className="font-medium text-gray-900 underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Missions;
