import express from "express";
import trimRequest from "trim-request";

// import controller functions
import { 
    register, 
    login, 
    refreshUserToken, 
    getCloudinarySignatureProfilePic,
    addRecipeToFavorites,
    removeRecipeFromFavorites,
    getAllFavoriteRecipes 
} from "../controllers/UserControllers";
import { authMiddleware } from "../middlewares/authMiddleware";

// import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.route("/register").post(trimRequest.all, register);
router.route("/login").post(trimRequest.all, login);
router.route("/refresh-token").post(trimRequest.all, refreshUserToken);
router.route("/get-cloudinary-signature-profile-pic").get(trimRequest.all, getCloudinarySignatureProfilePic);

// routes for adding, removing, and fetching favorite recipes
router.route("/me/favorites/:recipeId").post(trimRequest.all, authMiddleware, addRecipeToFavorites);
router.route("/me/favorites/:recipeId").delete(trimRequest.all, authMiddleware, removeRecipeFromFavorites);
router.route("/me/favorites").get(trimRequest.all, authMiddleware, getAllFavoriteRecipes);

export default router;