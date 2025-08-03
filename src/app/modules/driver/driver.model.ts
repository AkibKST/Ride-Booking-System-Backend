import { model, Schema } from "mongoose";
import { IDriver } from "./driver.interface";

const driverSchema = new Schema<IDriver>(
  {
    user_id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    licenseNumber: { type: String, required: true },
    isBlocked: { type: Boolean, default: false },
    vehicleType: { type: String, required: true },
    vehicleNumber: { type: String, required: true },
    vehicleColor: { type: String, required: true },
    vehicleModel: { type: String, required: true },
    isApproved: { type: Boolean, default: false },
    availabilityStatus: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },
    currentLocation: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    rides: [{ type: Schema.Types.ObjectId, ref: "Ride" }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Driver = model<IDriver>("Driver", driverSchema);
