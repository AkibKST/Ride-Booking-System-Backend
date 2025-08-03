import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { DriverServices } from "./driver.service";
import { Driver } from "./driver.model";
import { Types } from "mongoose";

//create user
const createDriver = catchAsync(async (req: Request, res: Response) => {
  const driverData = req.body;
  const driver = await DriverServices.createDriver(driverData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Driver created successfully",
    data: driver,
  });
});
//---------------------------

// get all drivers
const getAllDrivers = catchAsync(async (req: Request, res: Response) => {
  const drivers = await DriverServices.getAllDrivers();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Drivers retrieved successfully",
    data: drivers,
  });
});
//---------------------------

//accept ride
const acceptRide = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { userId } = req.user as any;
  const driverId = (await Driver.findOne({
    user_id: userId,
  })) as Types.ObjectId;

  const result = await DriverServices.acceptRide(id, driverId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Driver accept ride successfully",
    data: result,
  });
});

// update driver availability status
const updateDriverAvailability = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const updatedDriver = await DriverServices.updateDriverAvailability(
      id,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Driver availability status updated successfully",
      data: updatedDriver,
    });
  }
);
//---------------------------

export const DriverControllers = {
  createDriver,
  getAllDrivers,
  updateDriverAvailability,
  acceptRide,
};
