import mongoose from "mongoose";
import AppError from "../../errorHelpers/AppError";
import { IsActive, Role } from "../user/user.interface";
import { User } from "../user/user.model";
import { IRide } from "./ride.interface";
import { Ride } from "./ride.model";
import httpStatus from "http-status-codes";

// Function to handle ride request
const requestRide = async (rideData: IRide) => {
  const user = await User.findById(rideData.userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.isActive === IsActive.BLOCKED) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.role === Role.USER) {
    user.role = Role.RIDER;
    await user.save();
  }

  const newRide = await Ride.create(rideData);

  return newRide;
};
//---------------------------

//cancel a ride request before accept by driver
const cancelRide = async (id: string, updateData: Partial<IRide>) => {
  const ride = await Ride.findById(id);

  if (!ride) {
    throw new AppError(httpStatus.BAD_REQUEST, "Ride not found");
  }

  if (!(ride.status === "requested")) {
    throw new AppError(
      httpStatus.EXPECTATION_FAILED,
      `Ride Request is already change to ${ride.status}`
    );
  }

  const result = await Ride.findByIdAndUpdate(
    id,
    { status: updateData.status },
    { new: true }
  );

  return result;
};
//---------------------------

// Function to get all rides
const getAllRides = async (role: string, userId: string) => {
  if (role === Role.DRIVER) {
    const rides = await Ride.find({ status: "requested" })
      .populate(
        "userId",
        "name email phone picture address role isActive isVerified"
      )
      .populate(
        "driverId",
        "name email phone picture address role isActive isVerified"
      );

    return rides;
  }

  if (role === Role.RIDER) {
    const rides = await Ride.find({
      userId: new mongoose.Types.ObjectId(userId),
    });

    return rides;
  }

  const rides = await Ride.find()
    .populate(
      "userId",
      "name email phone picture address role isActive isVerified"
    )
    .populate(
      "driverId",
      "name email phone picture address role isActive isVerified"
    );

  return rides;
};
//---------------------------

export const RideServices = {
  requestRide,
  getAllRides,
  cancelRide,
};
