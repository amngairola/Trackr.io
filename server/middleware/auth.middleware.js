import { User } from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler.utils";

export const vaifyJWT = asyncHandler(async (req, res, next) => {
  try {
    req.token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized req");
    }

    const decodedToken = await jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) throw new ApiError(401, "Invalid Access Token");

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export const varifyAdmin = (req, res, next) => {
  if (req.user?.role === "admin") {
    next();
  } else {
    throw new ApiError(403, error?.message || "Access denied: Admins only'");
  }
};
