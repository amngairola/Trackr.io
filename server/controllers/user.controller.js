import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.utils.js";
import ApiError from "../utils/apiErr.utils.js";
import ApiRes from "../utils/ApiRes.utils.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Sheet } from "../models/sheet.model.js";
import { Progress } from "../models/progress.model.js";
import { DailyChallenge } from "../models/dailyChallenge.model.js";

import { Resend } from "resend";

import nodemailer from "nodemailer";

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

// --- Register User ---
export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, adminKey } = req.body;

  // 1. Validation
  if (
    [username, email, password].some(
      (field) => field?.trim() === "" || field === undefined
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // 2. Check Existing User
  const existingUser = await User.findOne({
    $or: [{ email }, { username }], //
  });

  if (existingUser) {
    // Determine which one is the duplicate for a clear error message
    if (existingUser.email === email) {
      // If unverified, we delete to allow re-registration (as per previous logic)
      if (!existingUser.isVerified) {
        await User.findByIdAndDelete(existingUser._id);
      } else {
        throw new ApiError(409, "User with this email already exists");
      }
    } else if (existingUser.username === username) {
      throw new ApiError(
        409,
        "Username is already taken. Please choose another."
      );
    }
  }

  // 3. Role Logic
  let role = "user";
  if (adminKey && adminKey === process.env.ADMIN_SECRET_KEY) {
    role = "admin";
  }

  // 4. Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 Minutes

  // 5. Avatar Handling
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  if (!avatarLocalPath) throw new ApiError(400, "Profile picture is required");

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) throw new ApiError(400, "Avatar upload failed");

  // 6. Create User (Saved to DB)
  const user = await User.create({
    username,
    avatar: avatar.url,
    email,
    password,
    role,
    otp,
    otpExpiry,
    isVerified: false,
  });

  // 7. Send Email (SAFE MODE)
  try {
    await sendEmail(email, otp);
  } catch (error) {
    await User.findByIdAndDelete(user._id);
    throw new ApiError(
      500,
      "Failed to send verification email. Please try again."
    );
  }

  // 8. Success Response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -otp"
  );

  return res
    .status(201)
    .json(
      new ApiRes(200, createdUser, "User registered. Please verify your email.")
    );
});

// --- Verify OTP ---
export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  // 1. Find User
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  // 2. Check if already verified
  if (user.isVerified) {
    return res
      .status(200)
      .json(new ApiRes(200, {}, "User is already verified"));
  }

  // 3. Validate OTP

  if (user.otp !== otp || user.otpExpiry < Date.now()) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  // 4. Update User
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  // 5. Generate Token (Auto-Login)

  const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(
    user._id
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
          user,
          accessToken,
          refreshToken,
        },
        "Email verified successfully"
      )
    );
});
// Login User
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!password || !email) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });

  if (!user) throw new ApiError(404, "User does not exist");

  if (!user.isVerified) {
    throw new ApiError(403, "Please verify your email before logging in.");
  }

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
  const { title, problems, description } = req.body;

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
    description,
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
        _id: "$problems._id",
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

export const getCompletdProblems = asyncHandler(async (req, res) => {
  try {
    const completedProblems = await Progress.find({
      user: req.user._id,
      status: "done",
    }).select("problemUrl");

    const completedUrls = completedProblems.map((e) => e.problemUrl);

    res.status(200).json(completedUrls);
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//admin only
export const getAllUsers = asyncHandler(async (req, res) => {});

// add problems
export const addProblemToSheet = async (req, res) => {
  const { sheetId, problem } = req.body;
  // problem = { title, link, difficulty, platform }

  const sheet = await Sheet.findById(sheetId);
  if (!sheet) throw new Error("Sheet not found");

  // Add to array
  sheet.problems.push(problem);
  await sheet.save();

  res.status(200).json({ message: "Problem added", data: sheet });
};

//add problem in bluk
export const addBulkProblems = async (req, res) => {
  try {
    const { sheetId, problems } = req.body;

    if (!problems || !Array.isArray(problems)) {
      return res.status(400).json({ message: "Invalid data format" });
    }

    const updatedSheet = await Sheet.findByIdAndUpdate(
      sheetId,
      {
        $addToSet: {
          problems: { $each: problems },
        },
      },
      { new: true } // Return the updated document
    );

    if (!updatedSheet) {
      return res.status(404).json({ message: "Sheet not found" });
    }

    res.status(200).json({
      message: `Successfully added ${problems.length} problems`,
      data: updatedSheet,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

//send email
export const sendEmail = asyncHandler(async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your Account - Tracker.io",
      html: `
           <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Email Verification</h2>
            <p>Your One-Time Password (OTP) for verification is:</p>
            <h1 style="color: #238636; letter-spacing: 5px;">${otp}</h1>
            <p>This code expires in 10 minutes.</p>
          </div>
        `,
    };
    await transporter.sendMail(mailOptions);
    console.log("email sent");
  } catch (error) {
    console.error("Email send failed:", error);
  }
});

// send email
// const resend = new Resend(process.env.RESEND_API_KEY);

// export const sendEmail = async (email, otp) => {
//   try {
//     await resend.emails.send({
//       from: "onboarding@resend.dev",
//       to: email,
//       subject: "Verify your Tracker.io Account",
//       html: `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <meta charset="utf-8">
//           <title>Email Verification</title>
//         </head>
//         <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">

//           <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e1e4e8; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">

//             <div style="background-color: #0d1117; padding: 20px; text-align: center;">
//               <h1 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 1px; font-weight: 600;">Tracker.io</h1>
//             </div>

//             <div style="padding: 30px 40px;">
//               <h2 style="color: #1f2937; margin-top: 0; font-size: 18px; text-align: center;">Verify your email address</h2>

//               <p style="color: #4b5563; font-size: 15px; margin-bottom: 25px; text-align: center;">
//                 Thanks for joining Tracker.io! Please enter the following code to complete your registration:
//               </p>

//               <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center; margin: 30px 0; border: 1px dashed #d1d5db;">
//                 <span style="font-size: 32px; font-family: monospace; font-weight: 700; color: #238636; letter-spacing: 6px;">${otp}</span>
//               </div>

//               <p style="color: #6b7280; font-size: 13px; text-align: center; margin-top: 30px;">
//                 This code will expire in 10 minutes.<br>
//                 If you didn't request this, you can safely ignore this email.
//               </p>
//             </div>

//             <div style="background-color: #f9fafb; padding: 15px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
//               &copy; ${new Date().getFullYear()} Tracker.io. All rights reserved.
//             </div>

//           </div>
//         </body>
//         </html>
//       `,
//     });
//   } catch (error) {
//     console.error(error);
//   }
// };
