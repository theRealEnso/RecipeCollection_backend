import express from "express";

// import modularized routes
import userAuthRoutes from "./UserRoutes"
import categoryRoutes from "./CategoriesRoutes"

const router = express.Router();

router.use("/auth", userAuthRoutes);
router.use("/categories", categoryRoutes);

export default router;