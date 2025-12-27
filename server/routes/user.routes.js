import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import {
  createSheet,
  getDailyChallenge,
  getPersonalSheet,
  getSheetDetails,
  getSystemSheets,
  getUser,
  getUserProgress,
  loginUser,
  logOutUser,
  refreshAccessToken,
  registerUser,
  toggleProblemStatus,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use((req, res, next) => {
  console.log("👉 Route accessed:", req.method, req.url);
  next();
});

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),

  registerUser
);

//sign-up sign-in
router.route("/login").post(loginUser);
router.route("/get-user").get(verifyJWT, getUser);
router.route("/logout").get(verifyJWT, logOutUser);

// refresh token
router.route("/refresh-token").post(refreshAccessToken);

// crete - get sheet
router.route("/create-new-sheet").post(verifyJWT, createSheet);

router.route("/get-public-sheet").get(getSystemSheets);
router.route("/get-personal-sheet").get(verifyJWT, getPersonalSheet);
router.route("/getSheet/:sheetId").get(verifyJWT, getSheetDetails);

//mark problem as done

router.route("/toggel-Status").post(verifyJWT, toggleProblemStatus);

//daily challenge
router.route("/daily-challenge").get(verifyJWT, getDailyChallenge);

//get user progress
router.route("/my-progress/:userId").get(verifyJWT, getUserProgress);

export default router;
