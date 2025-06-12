import express from "express";
import trimRequest from "trim-request";

// import controller functions
import { register, login } from "../controllers/UserControllers";

const router = express.Router();

router.route("/register").post(trimRequest.all, register);
router.route("/login").post(trimRequest.all, login);

export default router;