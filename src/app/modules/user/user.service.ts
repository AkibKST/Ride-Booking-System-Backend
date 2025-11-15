/* eslint-disable @typescript-eslint/no-unused-vars */
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IsActive, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

//create user
const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist");
  }

  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: email as string,
  };

  const user = await User.create({
    email,
    password: hashedPassword,
    auths: [authProvider],
    ...rest,
  });

  const { password: _, ...userWithoutPassword } = user.toObject();

  // return user without password
  return userWithoutPassword;
};
//---------------------------

// update user
const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  const ifUserExist = await User.findById(userId);

  // if user does not exist
  if (!ifUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  /**
   * email - can not update
   * name, phone, password address
   * password - re hashing
   *  only admin superadmin - role, isDeleted...
   *
   * promoting to superadmin - superadmin
   */

  if (payload.role) {
    // if user is trying to update role
    if (decodedToken.role === Role.RIDER || decodedToken.role === Role.DRIVER) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }

    // if user is trying to promote to super admin
    if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
  }

  // checking if user is trying to update isActive, isDeleted, isVerified
  if (payload.isActive || payload.isDeleted || payload.isVerified) {
    if (decodedToken.role === Role.RIDER || decodedToken.role === Role.DRIVER) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
  }

  // hashing payload password
  if (payload.password) {
    payload.password = await bcryptjs.hash(
      payload.password,
      envVars.BCRYPT_SALT_ROUND
    );
  }

  const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return newUpdatedUser;
};
//---------------------------

//get all users
const getAllUsers = async () => {
  const users = await User.find({});

  const usersWithoutPassword = users.map((user) => {
    const { password: _, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  });

  const totalUsers = await User.countDocuments();

  return {
    data: usersWithoutPassword,
    meta: {
      total: totalUsers,
    },
  };
};
//----------------------------

//get me
const getMe = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  return {
    data: user,
  };
};
//----------------------------

//admin services for user block toggle
const userBlockToggle = async (userId: string) => {
  const user = await User.findByIdAndUpdate(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "user not found");
  }

  if (user.isActive === IsActive.BLOCKED) {
    user.isActive = IsActive.ACTIVE;
  } else if (user.isActive === IsActive.ACTIVE) {
    user.isActive = IsActive.BLOCKED;
  }

  await user.save();

  return user;
};

//----------------------------

//admin services for create admin
const makeAdmin = async (userId: string) => {
  const user = await User.findByIdAndUpdate(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "user not found");
  }

  if (user.isActive === IsActive.BLOCKED) {
    throw new AppError(httpStatus.NOT_FOUND, "user not found");
  }

  if (user.role === Role.DRIVER || user.role === Role.RIDER) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Driver and Rider  cant be an admin"
    );
  }

  user.role = Role.ADMIN;

  await user.save();

  return user;
};
//---------------------------

export const UserServices = {
  createUser,
  updateUser,
  getAllUsers,
  getMe,
  userBlockToggle,
  makeAdmin,
};
