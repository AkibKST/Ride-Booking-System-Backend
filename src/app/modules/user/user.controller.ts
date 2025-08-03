import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { UserServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";

//create user
const createUser = catchAsync(async (req: Request, res: Response) => {
  const user = await UserServices.createUser(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User created successfully",
    data: user,
  });
});
//---------------------------

//update user
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  // const token = req.headers.authorization
  // const verifiedToken = verifyToken(token as string, envVars.JWT_ACCESS_SECRET) as JwtPayload

  const verifiedToken = req.user;

  const payload = req.body;
  const user = await UserServices.updateUser(
    userId,
    payload,
    verifiedToken as JwtPayload
  );

  // res.status(httpStatus.CREATED).json({
  //     message: "User Created Successfully",
  //     user
  // })

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User Updated Successfully",
    data: user,
  });
});
//---------------------------

//get all users
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getAllUsers();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});
//----------------------------

export const UserControllers = {
  createUser,
  updateUser,
  getAllUsers,
};
