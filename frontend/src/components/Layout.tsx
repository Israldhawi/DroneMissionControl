import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Drone Mission Control
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Mission management system
          </p>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="text-right">
              <p className="font-medium text-gray-900 dark:text-white">
                {user.name}
              </p>

              <p className="text-sm capitalize text-gray-500 dark:text-gray-400">
                {user.role}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
          >
            {theme === "light" ? "Dark" : "Light"}
          </button>

          <button
            type="button"
            onClick={logout}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-81px)]">
        <aside className="w-64 border-r bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <nav className="space-y-2">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 ${
                  isActive
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/missions"
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 ${
                  isActive
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`
              }
            >
              Missions
            </NavLink>

            <NavLink
              to="/pilots"
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 ${
                  isActive
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`
              }
            >
              Pilots
            </NavLink>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
