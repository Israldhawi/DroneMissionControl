import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getMissions } from "../services/mission.service";
import { getPilots } from "../services/pilot.service";
import type {
  Mission,
  MissionStatus,
} from "../types/mission";
import type { Pilot } from "../types/pilot";
import { useDebounce } from "../hooks/useDebounce";
import { usePagination } from "../hooks/usePagination";

const PAGE_SIZE = 10;

function Missions() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [missions, setMissions] = useState<Mission[]>([]);
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState(
    searchParams.get("search") ?? "",
  );
  const [status, setStatus] = useState<MissionStatus | "">(
    (searchParams.get("status") as MissionStatus | null) ?? "",
  );
  const [pilotId, setPilotId] = useState(
    searchParams.get("pilotId") ?? "",
  );
  const [dateFrom, setDateFrom] = useState(
    searchParams.get("dateFrom") ?? "",
  );
  const [dateTo, setDateTo] = useState(
    searchParams.get("dateTo") ?? "",
  );
  const [sortBy, setSortBy] = useState<
    "scheduledAt" | "durationMinutes"
  >(
    searchParams.get("sortBy") === "durationMinutes"
      ? "durationMinutes"
      : "scheduledAt",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    searchParams.get("sortOrder") === "asc" ? "asc" : "desc",
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const debouncedSearch = useDebounce(search, 500);

  const {
    page,
    totalPages,
    setPage,
    nextPage,
    previousPage,
  } = usePagination(total, PAGE_SIZE);

  async function loadPilots() {
    try {
      const data = await getPilots();
      setPilots(data);
    } catch {
      setPilots([]);
    }
  }

  async function loadMissions() {
    setLoading(true);
    setError("");

    try {
      const result = await getMissions({
        search: debouncedSearch || undefined,
        status: status || undefined,
        pilotId: pilotId || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        sortBy,
        sortOrder,
        page,
        pageSize: PAGE_SIZE,
      });

      setMissions(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load missions.",
      );
      setMissions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPilots();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    }

    if (status) {
      params.set("status", status);
    }

    if (pilotId) {
      params.set("pilotId", pilotId);
    }

    if (dateFrom) {
      params.set("dateFrom", dateFrom);
    }

    if (dateTo) {
      params.set("dateTo", dateTo);
    }

    if (sortBy !== "scheduledAt") {
      params.set("sortBy", sortBy);
    }

    if (sortOrder !== "desc") {
      params.set("sortOrder", sortOrder);
    }

    if (page > 1) {
      params.set("page", String(page));
    }

    setSearchParams(params, { replace: true });
  }, [
    debouncedSearch,
    status,
    pilotId,
    dateFrom,
    dateTo,
    sortBy,
    sortOrder,
    page,
    setSearchParams,
  ]);

  useEffect(() => {
    void loadMissions();
  }, [
    debouncedSearch,
    status,
    pilotId,
    dateFrom,
    dateTo,
    sortBy,
    sortOrder,
    page,
  ]);

  function handleFilterChange(
    setter: (value: string) => void,
    value: string,
  ) {
    setter(value);
    setPage(1);
  }

  function clearFilters() {
    setSearch("");
    setStatus("");
    setPilotId("");
    setDateFrom("");
    setDateTo("");
    setSortBy("scheduledAt");
    setSortOrder("desc");
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Missions
          </h1>
          <p className="text-gray-500">
            Search, filter and manage drone missions.
          </p>
        </div>

        <Link
          to="/missions/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-center font-medium text-white hover:bg-blue-700"
        >
          Create Mission
        </Link>
      </div>

      <div className="rounded-lg border border-gray-300 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="mission-search"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Search
            </label>
            <input
              id="mission-search"
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Title or location"
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="mission-status"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Status
            </label>
            <select
              id="mission-status"
              value={status}
              onChange={(event) =>
                handleFilterChange(
                  (value) =>
                    setStatus(
                      value as MissionStatus | "",
                    ),
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="">All statuses</option>
              <option value="planned">Planned</option>
              <option value="in_progress">
                In Progress
              </option>
              <option value="completed">Completed</option>
              <option value="aborted">Aborted</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="mission-pilot"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Pilot
            </label>
            <select
              id="mission-pilot"
              value={pilotId}
              onChange={(event) =>
                handleFilterChange(
                  setPilotId,
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="">All pilots</option>
              {pilots.map((pilot) => (
                <option key={pilot.id} value={pilot.id}>
                  {pilot.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="mission-sort"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Sort
            </label>
            <select
              id="mission-sort"
              value={`${sortBy}-${sortOrder}`}
              onChange={(event) => {
                const [newSortBy, newSortOrder] =
                  event.target.value.split("-");

                setSortBy(
                  newSortBy as
                    | "scheduledAt"
                    | "durationMinutes",
                );
                setSortOrder(
                  newSortOrder as "asc" | "desc",
                );
                setPage(1);
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="scheduledAt-desc">
                Date: Newest first
              </option>
              <option value="scheduledAt-asc">
                Date: Oldest first
              </option>
              <option value="durationMinutes-desc">
                Duration: Longest first
              </option>
              <option value="durationMinutes-asc">
                Duration: Shortest first
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="date-from"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Date from
            </label>
            <input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(event) =>
                handleFilterChange(
                  setDateFrom,
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="date-to"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Date to
            </label>
            <input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(event) =>
                handleFilterChange(
                  setDateTo,
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={clearFilters}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-100"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="rounded-lg bg-white p-8 text-center text-gray-500">
          Loading missions...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-6 text-center">
          <p className="mb-4 text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => void loadMissions()}
            className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && missions.length === 0 && (
        <div className="rounded-lg bg-white p-8 text-center text-gray-500">
          No missions found.
        </div>
      )}

      {!loading && !error && missions.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-300 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Pilot
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Scheduled
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {missions.map((mission) => {
                  const pilot = pilots.find(
                    (item) => item.id === mission.pilotId,
                  );

                  return (
                    <tr key={mission.id}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {mission.title}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-700">
                        {mission.location}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-700">
                        {pilot?.name ?? mission.pilotId}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(
                          mission.scheduledAt,
                        ).toLocaleString()}
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-700">
                        {mission.durationMinutes} min
                      </td>

                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            mission.status === "planned"
                              ? "bg-yellow-100 text-yellow-800"
                              : mission.status ===
                                  "in_progress"
                                ? "bg-blue-100 text-blue-800"
                                : mission.status ===
                                    "completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                          }`}
                        >
                          {mission.status.replace(
                            "_",
                            " ",
                          )}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-sm">
                        <Link
                          to={`/missions/${mission.id}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 rounded-lg bg-white p-4 sm:flex-row">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages} · {total} missions
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={previousPage}
                disabled={page === 1}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              <button
                type="button"
                onClick={nextPage}
                disabled={page === totalPages}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Missions;
