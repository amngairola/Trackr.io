import { Router } from "express";
import { upload } from "./../middleware/multer.middleware.js";
import { loginUser, registerUser } from "../controllers/user.controller.js";

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

router.route("/login").post(loginUser);

export default router;
