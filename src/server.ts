/* eslint-disable no-console */
import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";

let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);

    console.log("Connected to MongoDB!!!");

    server = app.listen(envVars.PORT, () => {
      console.log(
        ` Ride Booking System Server is running on port ${envVars.PORT}`
      );
    });
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
  }
};

(async () => {
  await startServer();
  await seedSuperAdmin();
})();

// unhandled rejection error
process.on("unhandledRejection", (error) => {
  console.log("Unhandled Rejection detected.Server is Shutting Down...", error);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});
// ------------------------------

// uncaught exception error
process.on("uncaughtException", (error) => {
  console.log("Uncaught Exception detected.Server is Shutting Down...", error);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});
// ------------------------------

// signal termination sigterm
process.on("SIGTERM", () => {
  console.log("SIGTERM received.Server is Shutting Down...");

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});
// ------------------------------

// signal termination sigint
process.on("SIGINT", () => {
  console.log("SIGINT received.Server is Shutting Down...");

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});
// ------------------------------

/**
 * unhandled rejection error
 * uncaught rejection error
 * signal termination sigterm
 */
