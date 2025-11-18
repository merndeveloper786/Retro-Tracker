import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import teamRoutes from "./routes/teams.js";
import retroRoutes from "./routes/retros.js";
import actionItemRoutes from "./routes/actionItems.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });

app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/retros", retroRoutes);
app.use("/api/action-items", actionItemRoutes);

app.get("/", (req, res) => {
  res.send("Backend is working!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
