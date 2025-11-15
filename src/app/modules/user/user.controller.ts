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

//get me
const getMe = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  const result = await UserServices.getMe(decodedToken.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile retrieved successfully",
    data: result,
  });
});

//admin services for user block toggle
const userBlockToggle = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserServices.userBlockToggle(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User active status change successfully",
    data: result,
  });
});
//----------------------------

//admin services for user block toggle
const makeAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserServices.makeAdmin(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User role change to admin successfully",
    data: result,
  });
});
//----------------------------

export const UserControllers = {
  createUser,
  updateUser,
  getAllUsers,
  getMe,
  userBlockToggle,
  makeAdmin,
};
