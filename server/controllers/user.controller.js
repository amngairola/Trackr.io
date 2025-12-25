import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.utils.js";
import ApiError from "../utils/apiErr.utils.js";
import ApiRes from "../utils/ApiRes.utils.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Sheet } from "../models/sheet.model.js";
import { Progress } from "../models/progress.model.js";
import { DailyChallenge } from "../models/dailyChallenge.model.js";

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

//logout user

export const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiError(200, {}, "user logged out successfully"));
});

//refresh refreshToken

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incommingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incommingRefreshToken) throw new ApiError(401, "Unauthorized request");

  try {
    const decodeToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodeToken?._id);

    if (!user) throw new ApiError(401, "Invalid refresh token");

    if (incommingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiRes(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access Token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

//GET USER

export const getUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiRes(200, req.user, "user fetched Successfully"));
});

//create personal sheet

export const createSheet = asyncHandler(async (req, res) => {
  const { title, problems } = req.body;

  if ([title, problems].some((field) => field === undefined || field === "")) {
    throw new ApiError(400, "Title, isSystemSheet, and Problems are required");
  }

  const owner = req.user._id;

  let isSystemSheet;
  if (req.user.role !== "admin") {
    isSystemSheet = false;
  }

  const newSheet = await Sheet.create({
    title,
    isSystemSheet,
    owner,
    problems,
  });

  const createdSheet = await Sheet.findById(newSheet._id);

  if (!createSheet) {
    throw new ApiError(500, "Something went wrong while creating new sheet");
  }

  return res
    .status(201)
    .json(new ApiRes(200, createdSheet, "sheet created successfully"));
});

/* CONTROLLERS 

Controller Name,Purpose,Status
registerUser,Sign up,✅ Done
loginUser,Login,✅ Done
getCurrentUser,"Check ""Who am I?""",✅ Done
createSheet,Add new sheet,✅ Done
logoutUser,Clear cookies, done
refreshAccessToken,Keep user logged in, done

getSheets,List all sheets, done
getSheetById,View specific problems, done
toggleProblemStatus,Check/Uncheck box,done
getUserProgress,Dashboard Graphs, done

*/

//get user progress  - User Progress (streak, solved count, graph data) every time they solve a problem or visit the dashboard.

//get all availeble public sheet list
export const getSystemSheets = asyncHandler(async (req, res) => {
  const systemSheets = await Sheet.find({
    isSystemSheet: true,
  }).select("-problems");

  return res
    .status(200)
    .json(
      new ApiRes(
        200,
        systemSheets,
        systemSheets.length > 0
          ? "Admin sheets fetched successfully"
          : " No public sheet availeble"
      )
    );
});
//get personal sheet list
export const getPersonalSheet = asyncHandler(async (req, res) => {
  const personalSheets = await Sheet.find({
    owner: req.user._id,
    isSystemSheet: false,
  }).select("-problems");

  return res
    .status(200)
    .json(
      new ApiRes(
        200,
        personalSheets,
        personalSheets.length > 0
          ? "Personal sheets fetched"
          : "No personal sheets found"
      )
    );
});

// get sheet details
export const getSheetDetails = asyncHandler(async (req, res) => {
  const { sheetId } = req.params;

  const sheetData = await Sheet.findById(sheetId).select({
    title: 1,
    isSystemSheet: 1,
    owner: 1,
    problems: 1,
  });

  if (!sheetData) {
    throw new ApiError(404, "Sheet not found");
  }
  console.log(sheetData);

  return res
    .status(200)
    .json(new ApiRes(200, sheetData, "sheet data fetched successfully"));
});

//mark as done and pending
export const toggleProblemStatus = asyncHandler(async (req, res) => {
  const { problemUrl } = req.body;

  if (!problemUrl) throw new ApiError(400, "Problem URL is required");

  const problem = await Progress.findOne({
    user: req.user._id,
    problemUrl: problemUrl,
  });

  let updatedStatus;

  if (problem) {
    if (problem.status === "done") {
      problem.status = "pending";
      problem.completedAt = null;
      updatedStatus = "pending";
    } else {
      problem.status = "done";
      problem.completedAt = new Date();
      updatedStatus = "done";
    }

    await problem.save();
  } else {
    Progress.create({
      user: req.user._id,
      problemUrl: problemUrl,
      status: "done",
      completedAt: new Date(),
    });
    updatedStatus = "done";
  }

  return res
    .status(200)
    .json(
      new ApiRes(
        200,
        { status: updatedStatus, problemUrl },
        updatedStatus === "done"
          ? "Problem Solved! 🎉"
          : "Problem marked as pending"
      )
    );
});

//genrate daily 2 question
export const getDailyChallenge = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingChallenge = await DailyChallenge.findOne({
    user: userId,
    date: today,
  });

  if (existingChallenge) {
    return res
      .status(200)
      .json(new ApiRes(200, existingChallenge, "Today's challenge fetched"));
  }

  const randomProblem = await Sheet.aggregate([
    {
      $match: { isSystemSheet: true },
    },
    {
      $unwind: "$problems",
    },
    {
      $sample: { size: 2 },
    },
    {
      $project: {
        title: "$problems.title",
        url: "$problems.url",
        difficulty: "$problems.difficulty",
        sheetName: "$title",
      },
    },
  ]);

  if (!randomProblem || randomProblem.length === 0) {
    throw new ApiError(
      500,
      "Not enough problems in system sheets to generate challenge"
    );
  }

  const newChallenge = await DailyChallenge.create({
    user: userId,
    date: today,
    problems: randomProblem,
  });

  return res
    .status(201)
    .json(new ApiRes(201, newChallenge, "New daily challenge generated"));
});

//GET PROGRESS
export const getUserProgress = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const totalSolved = await Progress.countDocuments({
    user: userId,
    status: "done",
  });

  const recentActivity = await Progress.find({
    user: userId,
    status: "done",
  })
    .sort({ completedAt: -1 })
    .limit(5)
    .select("problemUrl completedAt");

  const heatmapData = await Progress.aggregate([
    { $match: { user: userId, status: "done" } },

    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$completedAt",
          },
        },
        count: {
          $sum: 1,
        },
      },
    },
    {
      $sort: { _id: 1 },
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        count: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiRes(
        200,
        { totalSolved, heatmapData, recentActivity },
        "User progress fetched successfully"
      )
    );
});

//admin only
export const getAllUsers = asyncHandler(async (req, res) => {});
