import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);
// global middlewares
app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN === "*"
        ? "*"
        : process.env.CORS_ORIGIN?.split(","), // For multiple cors origin for production. Refer https://github.com/hiteshchoudhary/apihub/blob/a846abd7a0795054f48c7eb3e71f3af36478fa96/.env.sample#L12C1-L12C12
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.json({ limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("welcome back");
});

// Import routes
import userRouter from "./routes/auth/user.routes.js";
import { ApiErrorHandler } from "./utils/ApiErrorHandler.js";
// import aboutRouter from "./routes/about.routes.js";
// import orderCreationRoute from "./routes/order_creation.routes.js"

// * App apis
app.use("/api/v1/users", userRouter);
// app.use("/api/v1", aboutRouter);
// app.use("/api/v1", orderCreationRoute);

// common error handling middleware
app.use(ApiErrorHandler);

export { httpServer };
