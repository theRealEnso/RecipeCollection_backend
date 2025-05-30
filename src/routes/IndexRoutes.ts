import express from "express";

// import modularized routes
import userAuthRoutes from "./UserRoutes"

const router = express.Router();

router.use("/auth", userAuthRoutes);

export default router;