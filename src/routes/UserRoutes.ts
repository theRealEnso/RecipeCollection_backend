import express from "express";
import trimRequest from "trim-request";

// import controller functions
import { register, login, refreshUserToken } from "../controllers/UserControllers";

// import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.route("/register").post(trimRequest.all, register);
router.route("/login").post(trimRequest.all, login);
router.route("/refresh-token").post(trimRequest.all, refreshUserToken);

export default router;