import { Types } from "mongoose";

export interface IDriver {
  user_id: Types.ObjectId;
  licenseNumber: string;
  isBlocked?: boolean;
  vehicleType: string;
  vehicleNumber: string;
  vehicleColor?: string;
  vehicleModel?: string;
  isApproved?: boolean;
  availabilityStatus?: "online" | "offline";
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  rides?: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}
