import { Router } from "express";
import { DriverControllers } from "./driver.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middleware/validateRequest";
import { createDriverSchema } from "./driver.validation";

const router = Router();

router.post(
  "/createDriverProfile",
  checkAuth(Role.USER),
  validateRequest(createDriverSchema),
  DriverControllers.createDriver
);

router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  DriverControllers.getAllDrivers
);

router.patch(
  "/ride/:id/accept",
  checkAuth(Role.DRIVER),
  DriverControllers.acceptRide
);

router.patch(
  "/availability/:id",
  checkAuth(Role.DRIVER),
  DriverControllers.updateDriverAvailability
);

export const DriverRoutes = router;
