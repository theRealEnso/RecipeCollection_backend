import express from "express";
import trimRequest from "trim-request";

// import authentication middleware
import { authMiddleware } from "../middlewares/authMiddleware";

// import controller functions
import { createRecipe, getAllCategoryRecipes } from "../controllers/RecipeControllers";

const router = express.Router();

router.route("/create-recipe").post(trimRequest.all, authMiddleware, createRecipe);
router.route("/get-category-recipes/:categoryId").get(trimRequest.all, authMiddleware, getAllCategoryRecipes);

export default router;