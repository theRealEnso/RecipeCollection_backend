import express from "express";
import trimRequest from "trim-request";

// import controller functions
import { register } from "../controllers/UserControllers";

const router = express.Router();

router.route("/register").post(trimRequest.all, register);

export default router;