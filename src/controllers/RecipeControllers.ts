import { Request, Response, NextFunction } from "express";
import axios from "axios";

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
            sublists,
        } = req.body;

        if(
            !categoryName.length ||
            !categoryId.length ||
            !nameOfDish.length || 
            !difficultyLevel.length ||
            !timeToCook.length ||
            !numberOfServings.length
            // !ingredients || 
            // !subIngredients ||
            // !cookingInstructions || 
            // !subInstructions
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
            sublists,
        });

        res.json({
            message: "Recipe successfully created!",
            newRecipe,
        });
    } catch(error){
        next(error);
    }
};

export const generateRecipeFromImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { base64Image } = req.body;
        // console.log(base64Image);

        const { data } = await axios.post(`http://192.168.1.223:11434/api/generate`,
             {
                model: "llava:7b",
                prompt: `You are a food recipe generator AI. Analyze this image and return a recipe that includes specific quantities of ingredients. Include the name and quantity of the ingredient together as a string value. For example, if a recipe requires 4 ounces of chicken breast, then its value should be "4 oz chicken breast". Do not put the name of the ingredient and the quantity as separate keys. Please also provide clear preparation and cooking instructions and how to cook the food depicted in the image. Return the result in valid JSON only, without any text before or after, with the following fields:
                {
                    "nameOfDish": "string",
                    "difficultyLevel": "easy | intermediate | hard",
                    "timeToCook": "string (e.g. 30 minutes)",s
                    "numberOfServings": "string (e.g. 4)",
                    "specialEquipment": "string or empty",
                    "ingredients": [ {"nameOfIngredient": name and quantity of ingredient 1, "ingredient_id": generateUniqueId}, {"nameOfIngredient": name and quantity of ingredient 2, "ingredient_id": generateUniqueId}, ... ],
                    "cookingInstructions": [ {"instruction": step 1, "instruction_id": generateUniqueId}, {"instruction": step 2, "instruction_id": generateUniqueId}, ... ],
                    "sublists": [ {"name": sublist1 name, "id": generateUniqueId }, {"name": sublist2 name, "id": generateUniqueId }, ... ],
                    "subIngredients": [
                         {"sublistName": "sublist name", "sublistId": "matching string value from sublists", "nameOfIngredient": name and quantity of ingredient 1, "ingredient_id": generateUniqueId}, {"sublistName": "sublist name", "sublistId": "matching string value from sublists", "nameOfIngredient": name and quantity of ingredient 2, "ingredient_id": generateUniqueId}, .... 
                    ],
                    "subInstructions": [
                        { "sublistName": "sublist name", "sublistId": "matching string value from sublists", "instruction": step 1, "instruction_id": generateUniqueId},  { "sublistName": "sublist name", "sublistId": "matching string value from sublists", "instruction": step 2, "instruction_id": generateUniqueId}... }
                    ]
                }

                If the recipe you generate is simple, then leave sublists, subIngredients, and subInstructions empty; only cookingInstructions and ingredients should be populated. Otherwise, if you generate a recipe that is more complex and has multiple sub-recipes, then cookingInstructions and ingredients will be empty, but populate sublists, subIngredients, and subInstructions. Additionally, for complex recipes, each ingredient and cooking instruction you generate must be tied together with its respective sublist.
                `,
                images: [base64Image],
                stream: false,
             }, {
            headers: {
                "Content-Type": "application/json",
            }, 
        });

        let rawResponse = data.response;
        
        rawResponse = rawResponse.replace(/```json|```/g, "").trim(); // find all matches of ```json or ``` and replace with empty string, then trim removes empty spaces

        let recipe;
        try {
            recipe = JSON.parse(rawResponse);
        } catch(error){
            console.error("Failed to parse JSON:", rawResponse);
            throw error;
        };

        res.json({
            message: "successfully generated a recipe based on the selected image!",
            recipe,
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
