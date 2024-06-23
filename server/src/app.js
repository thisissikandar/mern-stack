import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import morganMiddleware from "./logger/morgan.logger.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();
const httpServer = createServer(app);
// global middlewares
app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN === "*"
        ? "*"
        : process.env.CORS_ORIGIN?.split(","),
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.json({ limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(morganMiddleware);


app.get("/", (req, res) => {
  res.send("welcome back to the server");
});

// Import routes
import userRouter from "./routes/auth/user.routes.js";
app.use("/api/v1/users", userRouter);

// common error handling middleware
app.use(errorHandler);

export { httpServer };
