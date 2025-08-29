import { Request, Response, NextFunction } from "express";

import { 
    getRecipes, 
    getDetailedRecipe, 
    createNewRecipe,
} from "../services/RecipeServices";

import cloudinary from "../configs/cloudinary";

import createHttpError from "http-errors";

export const getAllCategoryRecipes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categoryId = req.params.categoryId;
        
        // console.log("Category ID from params: ", categoryId);
        // console.log(typeof categoryId);
        
        if(!categoryId) throw createHttpError.BadRequest("Missing the required category id!");

        const categoryRecipes = await getRecipes(categoryId);

        res.json({
            message: "Successfully fetched categories!",
            categoryRecipes,
        });
        
    } catch(error){
        next(error);
    };
};

export const getRecipeDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const recipeId = req.params.recipeId;

        if(!recipeId) throw createHttpError.BadRequest("Missing the required recipe id!");

        const recipeDetails = await getDetailedRecipe(recipeId);

        res.json({
            message: "Successfully fetched recipe details!",
            recipeDetails,
        });

    } catch(error){
        next(error);
    };
};

export const createRecipe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            categoryName,
            categoryId,
            recipeOwner,
            nameOfDish,
            difficultyLevel,
            timeToCook,
            numberOfServings,
            specialEquipment,
            imageUrl,
            ingredients,
            subIngredients,
            cookingInstructions,
            subInstructions,
        } = req.body;

        if(
            !categoryName ||
            !categoryId ||
            !nameOfDish || 
            !difficultyLevel ||
            !timeToCook ||
            !numberOfServings ||
            !ingredients || 
            !subIngredients ||
            !cookingInstructions || 
            !subInstructions
        ) {
            throw createHttpError.BadRequest("Missing required fields!");
        };

        const newRecipe = await createNewRecipe({
            categoryName,
            categoryId,
            recipeOwner,
            nameOfDish,
            difficultyLevel,
            timeToCook,
            numberOfServings,
            specialEquipment,
            imageUrl,
            ingredients,
            subIngredients,
            cookingInstructions,
            subInstructions,
        });

        res.json({
            message: "Recipe successfully created!",
            newRecipe,
        });
    } catch(error){
        next(error);
    }
};

//generating signature to upload image to cloudinary using SIGNED preset
export const getCloudinarySignature = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const timestamp = Math.floor(new Date().getTime() / 1000);
        
        const signature = cloudinary.utils.api_sign_request(
            {
                timestamp,
                folder: "recipes",
                upload_preset: process.env.CLOUDINARY_SIGNED_UPLOAD_PRESET,
            },
            process.env.CLOUDINARY_API_SECRET as string,
        );

        res.json({
            timestamp,
            signature,
            apikey: process.env.CLOUDINARY_API_KEY,
            cloudname: process.env.CLOUDINARY_API_NAME,
            uploadPreset: process.env.CLOUDINARY_SIGNED_UPLOAD_PRESET,
            folder: "recipes",
        });
    } catch(error){
        next(error);
    };
};

//uploading image to cloudinary using UNSIGNED preset
export const createCloudinaryImageUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // console.log(process.env.CLOUDINARY_API_SECRET);
        // console.log(process.env.CLOUDINARY_API_NAME);
        // console.log(process.env.CLOUDINARY_UNSIGNED_UPLOAD_PRESET_KEY);

        const { base64 } = req.body;

        console.log("Received base64 length:", base64?.length); // 👈 log length
        // console.log("Base64 starts with:", base64?.substring(0, 30)); // 👈 sanity check
        // console.log("Base64 ends with:", base64?.slice(-30)); // 👈 ensure not truncated
        console.log("Upload preset: ", process.env.CLOUDINARY_UNSIGNED_UPLOAD_PRESET_KEY);
        console.log("API KEY: ", process.env.CLOUDINARY_API_KEY);

        if (!base64) {
            res.status(400).json({ error: "No base64 image provided" });
            return;
        }

        const result = await cloudinary.uploader.upload(base64, {
            upload_preset: process.env.CLOUDINARY_UNSIGNED_UPLOAD_PRESET,
        });

        console.log("Cloudinary result: ", result)

        res.json({
            message: "Successfully uploaded to Cloudinary and retrieved image url!",
            imageUrl: result.secure_url,
        });

    } catch(error: any){
        // next(error);
        console.error("Cloudinary upload error object:", JSON.stringify(error, null, 2));
        console.error("Cloudinary upload error (stack):", error.stack);

        res.status(500).json({
            error: error.message || "Something went wrong",
            cloudinaryError: error,
        });
    };
};
