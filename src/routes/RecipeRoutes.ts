import express from "express";
import trimRequest from "trim-request";

// import authentication middleware
import { authMiddleware } from "../middlewares/authMiddleware";

// import controller functions
import {
    getAllCategoryRecipes,
    getAllPublicRecipes,
    getAllPublicRecipesPaged, 
    getRecipeDetails, 
    createRecipe,
    searchUserRecipes, 
    createCloudinaryImageUrl,
    getCloudinarySignature,
    generateRecipeFromImage,
    startRecipeGenerationJob,
    getRecipeGenerationJobStatus,
    getGeneratedRecipe
} from "../controllers/RecipeControllers";

const router = express.Router();

router.route("/get-category-recipes/:categoryId").get(trimRequest.all, authMiddleware, getAllCategoryRecipes);
router.route("/get-public-recipes/").get(trimRequest.all, authMiddleware, getAllPublicRecipes);
router.route("/public-recipes/paged").get(trimRequest.all, authMiddleware, getAllPublicRecipesPaged);
router.route("/get-category-recipes/recipe/:recipeId").get(trimRequest.all, authMiddleware, getRecipeDetails);
router.route("/get-cloudinary-signature").get(trimRequest.all, authMiddleware, getCloudinarySignature);
router.route("/create-cloudinary-image-url").post(trimRequest.all, authMiddleware, createCloudinaryImageUrl);
router.route("/create-recipe").post(trimRequest.all, authMiddleware, createRecipe);
router.route("/search-user-recipes/search").get(trimRequest.all, authMiddleware, searchUserRecipes);

//          *****   endpoint(s) for AI recipe generation workflow   *****
router.route("/start-recipe-generation").post(trimRequest.all, authMiddleware, startRecipeGenerationJob); // start LLM work

router.route("/get-updated-recipe-generation-status/:jobId").get(trimRequest.all, authMiddleware, getRecipeGenerationJobStatus);

router.route("/get-generated-recipe/:jobId").get(trimRequest.all, authMiddleware, getGeneratedRecipe); // provide job status
////////////////////////////////////////////////////////////////////////////////////////////////////////////


// legacy endpoint(s)
router.route("/generate-recipe-from-image").post(trimRequest.all, authMiddleware, generateRecipeFromImage); // send generated recipe


export default router;