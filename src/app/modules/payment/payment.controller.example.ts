import { Request, Response } from "express";
import { PaymentService } from "./payment.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";

// Initiate payment controller
export const initiatePayment = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PaymentService.initiatePayment(req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Payment initiated successfully",
      data: result,
    });
  }
);

// Example: Add more controllers for other payment actions as needed
// export const validatePayment = catchAsync(async (req: Request, res: Response) => { ... });
