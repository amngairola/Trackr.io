import { Router } from "express";
import { upload } from "./../middleware/multer.middleware";
import { loginUser, regtisterUser } from "../controllers/user.controller";

const router = Router();

router
  .route("/register")
  .post(upload.field([{ name: "avatar", maxCount: 1 }]), regtisterUser);

router.route("/login").post(loginUser);

export default router;
