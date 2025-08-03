import AppError from "../../errorHelpers/AppError";
import { IsActive, Role } from "../user/user.interface";
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

  if (user.isActive === IsActive.BLOCKED) {
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

  //Driver validation
  const driver = await Driver.findById(driverId);

  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
  }

  if (driver.isApproved === false) {
    throw new AppError(
      httpStatus.EXPECTATION_FAILED,
      "Driver is not approved by admin"
    );
  }

  //Ride validation
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

//driver approved by admin
const driverApproved = async (driverId: string) => {
  const driver = await Driver.findById(new mongoose.Types.ObjectId(driverId));

  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
  }

  if (driver.isApproved === false) {
    driver.isApproved = true;
  } else if (driver.isApproved === true) {
    driver.isApproved = false;
  }

  await driver.save();

  return driver;
};
//---------------------------

//update ride status
const updateRideStatus = async (
  rideId: string,
  driverId: Types.ObjectId,
  newStatus: "in_transit" | "completed" | "picked_up"
) => {
  const validTransition: {
    accepted: string;
    picked_up: string;
    in_transit: string;
  } = {
    accepted: "picked_up",
    picked_up: "in_transit",
    in_transit: "completed",
  };

  const ride = await Ride.findById(rideId);

  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found!");
  }

  if (ride.driverId?.toString() !== driverId.toString()) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "You are not authorized to update this ride!"
    );
  }

  if (
    !(ride.status in validTransition) ||
    validTransition[ride.status as keyof typeof validTransition] !== newStatus
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid ride status transition!"
    );
  }

  //update status and timestamp
  ride.status = newStatus;
  const timestampField = `${newStatus}At`;
  if (ride.timestamps && timestampField in ride.timestamps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ride.timestamps as any)[timestampField] = new Date();
  }

  if (newStatus === "completed") {
    ride.fare = 100.0;
  }

  await ride.save();

  return ride;
};

//---------------------------

//view complete ride
const viewCompleteRide = async (driverId: string) => {
  const completeRide = await Ride.findOne({
    driverId: driverId,
    status: { $in: ["completed"] },
  });

  return completeRide;
};
//---------------------------

export const DriverServices = {
  createDriver,
  getAllDrivers,
  acceptRide,
  updateDriverAvailability,
  driverApproved,
  updateRideStatus,
  viewCompleteRide,
};
