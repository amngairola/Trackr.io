import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
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

import userRouter from "./routes/user.route.js";

app.use("/api/v1/users", userRouter);

export default app;

//URL-> http://localhost:3000/api/v1/users/register
/*
{
  "email": "aman@example.com",
  "password": "securePassword123",
}

*/
