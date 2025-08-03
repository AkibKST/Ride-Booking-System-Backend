import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { RideServices } from "./ride.service";

//post ride request
const requestRide = catchAsync(async (req: Request, res: Response) => {
  const rideData = req.body;

  const ride = await RideServices.requestRide(rideData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Ride requested successfully",
    data: ride,
  });
});
//---------------------------

//cancel a ride before accepting by driver
const cancelRide = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await RideServices.cancelRide(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Rides cancel successfully",
    data: result,
  });
});

//get all rides
const getAllRides = catchAsync(async (req: Request, res: Response) => {
  console.log(req.user);
  const { role, email } = req.user as {
    role: string;
    email: string;
  };

  const rides = await RideServices.getAllRides(role, email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Rides retrieved successfully",
    data: rides,
  });
});
//---------------------------

export const RideControllers = {
  requestRide,
  getAllRides,
  cancelRide,
};
