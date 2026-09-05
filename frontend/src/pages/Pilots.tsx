import { useEffect, useState } from "react";

import { getPilots } from "../services/pilot.service";

import type { Pilot } from "../types/pilot";

function Pilots() {
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadPilots() {
    setLoading(true);
    setError("");

    try {
      const data = await getPilots();
      setPilots(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load pilots",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPilots();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Pilots
        </h2>

        <p className="text-sm text-gray-500">
          View registered pilots and their status.
        </p>
      </div>

      {loading && (
        <div className="rounded-lg border bg-white p-6">
          Loading pilots...
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-hidden rounded-lg border bg-white">
          {pilots.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No pilots found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold">
                      Name
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Email
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      License Number
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Role
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {pilots.map((pilot) => (
                    <tr
                      key={pilot.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">
                          {pilot.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {pilot.id}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        {pilot.email}
                      </td>

                      <td className="px-4 py-3">
                        {pilot.licenseNumber}
                      </td>

                      <td className="px-4 py-3 capitalize">
                        {pilot.role}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            pilot.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {pilot.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
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

export default Pilots;
