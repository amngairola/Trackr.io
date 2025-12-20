import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.utils.js";
import ApiError from "../utils/apiErr.utils.js";
import ApiRes from "../utils/ApiRes.utils.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Generate Access and Refresh Token
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.genrateAccessToken();
    const refreshToken = user.genrateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    console.log("Token Generation Error:", error);
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens"
    );
  }
};

// Register New User
export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, adminKey } = req.body;

  if (
    [username, email, password].some(
      (field) => field?.trim() === "" || field === undefined
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const userExists = await User.findOne({ email });

  if (userExists) throw new ApiError(409, "User with email already exists");
  let role = "user";

  if (adminKey && adminKey === process.env.ADMIN_SECRET_KEY) {
    role = "admin";
  }

  // Note: Ensure your route uses upload.fields([{ name: "avatar", maxCount: 1 }])
  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  if (!avatarLocalPath) throw new ApiError(400, "Profile picture is required");

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) throw new ApiError(400, "Avatar upload failed");
  const user = await User.create({
    username,
    avatar: avatar.url,
    email,
    password,
    role,
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser)
    throw new ApiError(500, "Something went wrong while registering the user");

  return res
    .status(200)
    .json(new ApiRes(200, createdUser, "User created successfully"));
});

// Login User
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!password || !email) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });

  if (!user) throw new ApiError(404, "User does not exist");

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) throw new ApiError(401, "Invalid user credentials");

  const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiRes(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});
