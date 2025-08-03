import { model, Schema } from "mongoose";
import { IRide } from "./ride.interface";

const rideSchema = new Schema<IRide>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  driverId: {
    type: Schema.Types.ObjectId,
    ref: "Driver",
  },
  pickupLocation: {
    address: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  dropLocation: {
    address: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  status: {
    type: String,
    enum: [
      "requested",
      "in_transit",
      "completed",
      "cancelled",
      "picked_up",
      "accepted",
    ],
    default: "requested",
  },
  fare: {
    type: Number,
    default: null,
  },
  timestamps: {
    requestedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date },
    pickedUpAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Ride = model<IRide>("Ride", rideSchema);
