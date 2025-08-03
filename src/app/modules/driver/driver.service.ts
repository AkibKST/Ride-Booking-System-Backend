import AppError from "../../errorHelpers/AppError";
import { Role } from "../user/user.interface";
import { User } from "../user/user.model";
import { IDriver } from "./driver.interface";
import httpStatus from "http-status-codes";
import { Driver } from "./driver.model";
import mongoose, { Types } from "mongoose";
import { Ride } from "../ride/ride.model";

//create driver
const createDriver = async (driverData: IDriver) => {
  // Logic to create a driver in the database

  const user = await User.findById(driverData.user_id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.role === Role.USER) {
    user.role = Role.DRIVER;
    await user.save();
  }

  const driver = await Driver.create(driverData);

  return driver;
};

//---------------------------

// get all drivers
const getAllDrivers = async () => {
  const drivers = await Driver.find().populate(
    "user_id",
    "name email phone picture address role isActive isVerified"
  );
  return drivers;
};
//---------------------------

//accept ride request
const acceptRide = async (rideId: string, driverId: Types.ObjectId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  //validation-1 : Check if ride exists and is still available for acceptance
  const ride = await Ride.findById(rideId).session(session);

  if (!ride || ride.status !== "requested") {
    throw new AppError(
      httpStatus.EXPECTATION_FAILED,
      "Ride is not available for acceptance"
    );
  }

  //validation-2 : Check if the driver is already on another active ride
  const existingActiveRide = await Ride.findOne({
    driverId: driverId,
    status: { $in: ["accepted", "in_transit", "picked_up"] },
  }).session(session);

  if (existingActiveRide) {
    //if a ride is found, the driver is busy
    throw new AppError(
      httpStatus.CONFLICT,
      "You can not accept a new ride while you are on an active ride!!!"
    );
  }

  //update the ride
  ride.driverId = driverId;
  ride.status = "accepted";
  ride.timestamps.acceptedAt = new Date();

  //save the changes within the transaction
  await ride.save({ session });

  //commit the transaction to make all changes permanent
  await session.commitTransaction();
  session.endSession();

  return ride;
};
//---------------------------

//update driver availability status
const updateDriverAvailability = async (
  _id: string,
  updateData: Partial<IDriver>
) => {
  const driver = await Driver.findByIdAndUpdate(
    _id,
    { availabilityStatus: updateData.availabilityStatus },
    { new: true }
  );

  return driver;
};
//---------------------------

export const DriverServices = {
  createDriver,
  getAllDrivers,
  acceptRide,
  updateDriverAvailability,
};
