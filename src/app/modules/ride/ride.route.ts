import { Router } from "express";
import { RideControllers } from "./ride.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { RideValidation } from "./ride.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.post(
  "/request",
  checkAuth(Role.USER, Role.RIDER),
  validateRequest(RideValidation.createRideValidation),
  RideControllers.requestRide
);
//Cancel a ride (within allowed window)

router.patch(
  "/cancelled/:id",
  checkAuth(Role.RIDER),
  validateRequest(RideValidation.updateRideValidation),
  RideControllers.cancelRide
);

router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DRIVER, Role.RIDER),
  RideControllers.getAllRides // Assuming this controller method exists
);

router.get(
  "/singleRide/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DRIVER, Role.RIDER),
  RideControllers.getSingleRide // Assuming this controller method exists
);

export const RideRoutes = router;
// Define your ride-related routes here
// Example
// router.get('/rides', RideControllers.getAllRides);
// router.post('/rides', RideControllers.createRide);
