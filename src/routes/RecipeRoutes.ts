import express from "express";
import trimRequest from "trim-request";

// import authentication middleware
import { authMiddleware } from "../middlewares/authMiddleware";

// import controller functions
import { 
    getAllCategoryRecipes, 
    getRecipeDetails, 
    createRecipe, 
    createCloudinaryImageUrl, 
} from "../controllers/RecipeControllers";

const router = express.Router();

router.route("/get-category-recipes/:categoryId").get(trimRequest.all, authMiddleware, getAllCategoryRecipes);
router.route("/get-category-recipes/recipe/:recipeId").get(trimRequest.all, authMiddleware, getRecipeDetails);
router.route("/create-recipe").post(trimRequest.all, authMiddleware, createRecipe);
router.route("/create-cloudinary-image-url").post(trimRequest.all, authMiddleware, createCloudinaryImageUrl);

export default router;