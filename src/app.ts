import express, { Request, Response } from "express";
import cors from "cors";
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";
import cookieParser from "cookie-parser";
import passport from "passport";
import expressSession from "express-session";
import "./app/config/passport";
import { envVars } from "./app/config/env";

const app = express();

// Middleware
app.use(
  expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(express.json());
app.set("trust proxy", 1); // trust first proxy
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [envVars.FRONTEND_URL, "http://localhost:3000"],
    credentials: true,
  })
);

// app -> routes -> module route
app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Ride Booking System API",
    status: "success",
  });
});

// Global error handler
app.use(globalErrorHandler);

// Not found route
app.use(notFound);

export default app;
