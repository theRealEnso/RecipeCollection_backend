import express from "express";

// import modularized routes
import userAuthRoutes from "./UserRoutes"
import categoryRoutes from "./CategoriesRoutes"
import recipeRoutes from "./RecipeRoutes"

const router = express.Router();

router.use("/auth", userAuthRoutes);
router.use("/categories", categoryRoutes);
router.use("/recipes", recipeRoutes);
router.use("/test", (req, res) => {
    res.send("API is working properly!");
});

export default router;