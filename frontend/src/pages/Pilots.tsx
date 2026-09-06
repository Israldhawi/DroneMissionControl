import { useEffect, useState } from "react";

import {
  createPilot,
  getPilots,
  PilotApiError,
  updatePilot,
} from "../services/pilot.service";

import { useAuth } from "../context/AuthContext";

import type {
  CreatePilotRequest,
  Pilot,
  UpdatePilotRequest,
  UserRole,
} from "../types/pilot";

interface PilotFormData {
  name: string;
  email: string;
  licenseNumber: string;
  role: UserRole;
  password: string;
  isActive: boolean;
}

const emptyForm: PilotFormData = {
  name: "",
  email: "",
  licenseNumber: "",
  role: "pilot",
  password: "",
  isActive: true,
};

function Pilots() {
  const { user } = useAuth();

  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingPilot, setEditingPilot] =
    useState<Pilot | null>(null);

  const [form, setForm] =
    useState<PilotFormData>(emptyForm);

  const [fieldErrors, setFieldErrors] =
    useState<Record<string, string>>({});

  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role === "admin";

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

  function openAddForm() {
    setEditingPilot(null);
    setForm(emptyForm);
    setFieldErrors({});
    setFormError("");
    setShowForm(true);
  }

  function openEditForm(pilot: Pilot) {
    setEditingPilot(pilot);

    setForm({
      name: pilot.name,
      email: pilot.email,
      licenseNumber: pilot.licenseNumber,
      role: pilot.role,
      password: "",
      isActive: pilot.isActive,
    });

    setFieldErrors({});
    setFormError("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingPilot(null);
    setFieldErrors({});
    setFormError("");
  }

  function updateField<K extends keyof PilotFormData>(
    field: K,
    value: PilotFormData[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setFieldErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });

    setFormError("");
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {};

    if (!form.name.trim()) {
      errors.name = "Name is required";
    } else if (form.name.trim().length > 80) {
      errors.name = "Name must not exceed 80 characters";
    }

    if (!form.email.trim()) {
      errors.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim(),
      )
    ) {
      errors.email = "Enter a valid email address";
    }

    if (!form.licenseNumber.trim()) {
      errors.licenseNumber =
        "License number is required";
    } else if (
      !/^[A-Za-z]{2}\d{4}$/.test(
        form.licenseNumber.trim(),
      )
    ) {
      errors.licenseNumber =
        "Use two letters followed by four digits";
    }

    if (!editingPilot && !form.password) {
      errors.password = "Password is required";
    } else if (
      form.password &&
      form.password.length < 6
    ) {
      errors.password =
        "Password must be at least 6 characters";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      if (editingPilot) {
        const data: UpdatePilotRequest = {
          name: form.name.trim(),
          email: form.email.trim(),
          licenseNumber:
            form.licenseNumber.trim().toUpperCase(),
          role: form.role,
          isActive: form.isActive,
        };

        if (form.password) {
          data.password = form.password;
        }

        const updated = await updatePilot(
          editingPilot.id,
          data,
        );

        setPilots((current) =>
          current.map((pilot) =>
            pilot.id === updated.id
              ? updated
              : pilot,
          ),
        );
      } else {
        const data: CreatePilotRequest = {
          name: form.name.trim(),
          email: form.email.trim(),
          licenseNumber:
            form.licenseNumber.trim().toUpperCase(),
          role: form.role,
          isActive: form.isActive,
          password: form.password,
        };

        const created = await createPilot(data);

        setPilots((current) => [
          ...current,
          created,
        ]);
      }

      closeForm();
    } catch (err) {
      if (err instanceof PilotApiError) {
        setFormError(err.message);

        if (err.fields) {
          setFieldErrors(err.fields);
        }
      } else {
        setFormError(
          err instanceof Error
            ? err.message
            : "Failed to save pilot",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function togglePilotStatus(pilot: Pilot) {
    const action = pilot.isActive
      ? "deactivate"
      : "activate";

    const confirmed = window.confirm(
      `${action === "deactivate" ? "Deactivate" : "Activate"} ${pilot.name}?`,
    );

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      const updated = await updatePilot(
        pilot.id,
        {
          isActive: !pilot.isActive,
        },
      );

      setPilots((current) =>
        current.map((item) =>
          item.id === updated.id
            ? updated
            : item,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${action} pilot`,
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Pilots
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            View registered pilots and their status.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={openAddForm}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Add Pilot
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => void loadPilots()}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {loading && (
        <div className="rounded-lg border bg-white p-6 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          Loading pilots...
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-hidden rounded-lg border bg-white dark:border-gray-700 dark:bg-gray-800">
          {pilots.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No pilots found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                      Name
                    </th>

                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                      Email
                    </th>

                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                      License Number
                    </th>

                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                      Missions
                    </th>

                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                      Role
                    </th>

                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                      Status
                    </th>

                    {isAdmin && (
                      <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y dark:divide-gray-700">
                  {pilots.map((pilot) => (
                    <tr
                      key={pilot.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {pilot.name}
                        </p>

                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {pilot.id}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                        {pilot.email}
                      </td>

                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                        {pilot.licenseNumber}
                      </td>

                      <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">
                        {pilot.missionCount}
                      </td>

                      <td className="px-4 py-3 capitalize text-gray-800 dark:text-gray-200">
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

                      {isAdmin && (
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEditForm(pilot)
                              }
                              className="rounded-md border px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                void togglePilotStatus(
                                  pilot,
                                )
                              }
                              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                                pilot.isActive
                                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                              }`}
                            >
                              {pilot.isActive
                                ? "Deactivate"
                                : "Activate"}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showForm && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingPilot
                    ? "Edit Pilot"
                    : "Add Pilot"}
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {editingPilot
                    ? "Update pilot information."
                    : "Create a new pilot account."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-md px-3 py-1 text-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700"
              >
                ×
              </button>
            </div>

            {formError && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form
              onSubmit={(event) =>
                void handleSubmit(event)
              }
              className="space-y-5"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Name
                </label>

                <input
                  value={form.name}
                  onChange={(event) =>
                    updateField(
                      "name",
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />

                {fieldErrors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Email
                </label>

                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateField(
                      "email",
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />

                {fieldErrors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  License Number
                </label>

                <input
                  value={form.licenseNumber}
                  onChange={(event) =>
                    updateField(
                      "licenseNumber",
                      event.target.value,
                    )
                  }
                  placeholder="OM1005"
                  className="w-full rounded-lg border px-3 py-2 uppercase outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />

                {fieldErrors.licenseNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.licenseNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Role
                </label>

                <select
                  value={form.role}
                  onChange={(event) =>
                    updateField(
                      "role",
                      event.target.value as UserRole,
                    )
                  }
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                >
                  <option value="pilot">
                    Pilot
                  </option>
                  <option value="admin">
                    Admin
                  </option>
                </select>

                {fieldErrors.role && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.role}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Password{" "}
                  {editingPilot && (
                    <span className="font-normal text-gray-500">
                      (leave blank to keep current)
                    </span>
                  )}
                </label>

                <input
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    updateField(
                      "password",
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />

                {fieldErrors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    updateField(
                      "isActive",
                      event.target.checked,
                    )
                  }
                  className="h-4 w-4"
                />

                Active pilot
              </label>

              <div className="flex justify-end gap-3 border-t pt-5 dark:border-gray-700">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingPilot
                      ? "Save Changes"
                      : "Create Pilot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pilots;
