import z from "zod";

export const createDriverSchema = z.object({
  user_id: z.string().nonempty("User ID is required"),
  licenseNumber: z
    .string()
    .min(5, "License number must be at least 5 characters"),
  vehicleType: z.string().min(3, "Vehicle type must be at least 3 characters"),
  vehicleNumber: z
    .string()
    .min(2, "Vehicle number must be at least 2 characters"),
  vehicleColor: z
    .string()
    .min(3, "Vehicle color must be at least 3 characters"),
  vehicleModel: z
    .string()
    .min(2, "Vehicle model must be at least 2 characters"),
  currentLocation: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  rides: z.array(z.string()).optional(),
});

export const updateDriverSchema = z.object({
  licenseNumber: z
    .string()
    .min(2, "License number must be at least 2 characters")
    .optional(),
  vehicleType: z
    .string()
    .min(2, "Vehicle type must be at least 2 characters")
    .optional(),
  vehicleNumber: z
    .string()
    .min(2, "Vehicle number must be at least 2 characters")
    .optional(),
  isApproved: z.boolean().optional(),
  availabilityStatus: z.enum(["online", "offline"]).optional(),
  currentLocation: z.object({
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  }),
  rides: z.array(z.string()).optional(),
  isBlocked: z.boolean().optional(),
});
