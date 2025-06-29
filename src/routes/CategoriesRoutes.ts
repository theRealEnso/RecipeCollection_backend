import express from "express";
import trimRequest from "trim-request";

// import controller functions
import { 
    getUserCategories, 
    addCategory,
    editCategory,
    deleteCategory 
} from "../controllers/CategoryControllers";

// import authentication middleware
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.route("/get-user-categories").get(trimRequest.all, authMiddleware, getUserCategories);
router.route("/add-category").post(trimRequest.all, authMiddleware, addCategory);
router.route("/edit-category/:category_id").patch(trimRequest.all, authMiddleware, editCategory);
router.route("/delete-category/:category_id").delete(trimRequest.all, authMiddleware, deleteCategory);

export default router;