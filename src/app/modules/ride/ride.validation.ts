import z from "zod";

const createRideValidation = z.object({
  userId: z.string().nonempty("User ID is required"),
  driverId: z.string().optional(),
  pickupLocation: z.object({
    address: z.string().min(2).max(100).nonempty("Pickup address is required"),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  dropLocation: z.object({
    address: z.string().min(2).max(100).nonempty("Drop address is required"),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  status: z.enum([
    "requested",
    "in_transit",
    "completed",
    "cancelled",
    "picked_up",
  ]),
});

const updateRideValidation = z.object({
  status: z
    .enum(["requested", "in_transit", "completed", "cancelled", "picked_up"])
    .optional(),
});

export const RideValidation = {
  createRideValidation,
  updateRideValidation,
};
