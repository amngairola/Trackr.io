import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

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

export default app;
