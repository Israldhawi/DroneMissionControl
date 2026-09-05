import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import pilotsRoutes from "./routes/pilots.routes";
import missionsRoutes from "./routes/missions.routes";
import statsRoutes from "./routes/stats.routes";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/pilots", pilotsRoutes);
app.use("/missions", missionsRoutes);
app.use("/", statsRoutes);

export default app;
