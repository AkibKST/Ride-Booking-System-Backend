import { Types } from "mongoose";

interface Location {
  address: string;
  latitude: number;
  longitude: number;
}

export interface IRide {
  userId: Types.ObjectId;
  driverId?: Types.ObjectId;
  pickupLocation: Location;
  dropLocation: Location;
  status:
    | "requested"
    | "in_transit"
    | "completed"
    | "cancelled"
    | "picked_up"
    | "accepted";
  fare?: number;
  distance: number;
  duration: string;
  timestamps: {
    requestedAt: Date;
    acceptedAt: Date;
    pickedUpAt: Date;
    completedAt: Date;
    cancelledAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
