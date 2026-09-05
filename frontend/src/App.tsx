import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Forbidden from "./pages/Forbidden";
import Login from "./pages/Login";
import MissionCreate from "./pages/MissionCreate";
import MissionDetails from "./pages/MissionDetails";
import MissionEdit from "./pages/MissionEdit";
import Missions from "./pages/Missions";
import NotFound from "./pages/NotFound";
import Pilots from "./pages/Pilots";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route
              path="/"
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/missions"
              element={<Missions />}
            />

            <Route
              path="/missions/new"
              element={<MissionCreate />}
            />

            <Route
              path="/missions/:id"
              element={<MissionDetails />}
            />

            <Route
              path="/missions/:id/edit"
              element={<MissionEdit />}
            />

            <Route
              path="/pilots"
              element={<Pilots />}
            />

            <Route
              path="/forbidden"
              element={<Forbidden />}
            />
          </Route>
        </Route>

        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
