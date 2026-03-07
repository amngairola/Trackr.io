import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// ── Health check — for Render keep-alive ping ──
app.get("/health", (req, res) => res.status(200).json({ status: "OK" }));

app.use(
  cors({
    origin: [process.env.CLIENT_URL, process.env.PRODUCTION_URL],
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());
app.use(express.static("public"));

import userRouter from "./routes/user.routes.js";

app.use("/api/v1/users", userRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
    data: null,
  });
});

export default app;
