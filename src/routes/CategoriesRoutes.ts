import express from "express";
import trimRequest from "trim-request";

// import controller functions
import { 
    getUserCategories, 
    addCategory,
    deleteCategory 
} from "../controllers/CategoryControllers";

// import authentication middleware
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.route("/get-user-categories").get(trimRequest.all, authMiddleware, getUserCategories);
router.route("/add-category").post(trimRequest.all, authMiddleware, addCategory);
router.route("/delete-category/:category_id").delete(trimRequest.all, authMiddleware, deleteCategory);

export default router;