import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

import {
    getRecipes, 
    getDetailedRecipe, 
    createNewRecipe,
} from "../services/RecipeServices";

import cloudinary from "../configs/cloudinary";

import createHttpError from "http-errors";

// import AI prompt
import recipeGenerationPrompt from "../constants/AI_prompts";

// ai server endpoint
const AI_SERVER_LOCALHOST_ENDPOINT = process.env.PROXY_SERVER_WSL_TO_OLLAMA_ON_WINDOWS;

//define helper functions
// some AI models wrap JSON in ``` fences; this removes those wrappers and trims/removes any white space
const stripCodeFences = (str: string) => {
// remove a single opening fence at the very start and a single closing fence at the very end
  let out = str.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "");
  // remove any remaining stray fences anywhere else
  out = out.replace(/```/g, "");
  return out.trim();
};

type Phase = "processing" | "finalizing" | "completed" | "error";

// define type(s)
type Job = {
    id: string;
    phase: Phase;
    progress: number // sync with the bytes / chunks being streamed in realtime to our node server from Ollama,
    result: any; // store the actual generated recipe
    error?: any; // handle any errors
    createdAt: number; // timestamp of when the job was created, but to be used to help cleanup later
}

const jobs = new Map<string, Job>(); // be updated overtime as the workflow progresses;

const JOB_MAXLIFE_MIN = 60 * 1000 * 10; // 10 minutes
// periodic cleanup function => function that runs every minute and removes jobs that are older than 10 minutes
setInterval(() => {
    const now = Date.now(); // get the current time
    // loop through the jobs map. If any created jobs was created longer than 10 minutes ago, then we delete it
    for (const [id, job] of jobs){
        if((now - job.createdAt) > JOB_MAXLIFE_MIN) jobs.delete(id);
    };
});

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

export const startRecipeGenerationJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { base64Image } = req.body;
        if(!base64Image) throw createHttpError.BadRequest("Invalid base64 image!");

        // generate unique
        const jobId = uuidv4();
        
        // execute code that kicks off the recipe generation workflow

        res.json({
            jobId
        })
    } catch(error){
        next(error);
    }
};

//legacy endpoint
// export const generateRecipeFromImage = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { base64Image } = req.body;
//         // console.log(base64Image);

//         const { data } = await axios.post(`${AI_SERVER_LOCALHOST_ENDPOINT}/api/generate`,
//              {
//                 model: "llava:7b",
//                 prompt: recipeGenerationPrompt,
//                 images: [base64Image],
//                 stream: false,
//              }, {
//             headers: {
//                 "Content-Type": "application/json",
//             }, 
//         });

//         let rawResponse = data.response;
        
//         rawResponse = rawResponse.replace(/```json|```/g, "").trim(); // find all matches of ```json or ``` and replace with empty string, then trim removes empty spaces

//         let recipe;
//         try {
//             recipe = JSON.parse(rawResponse);
//         } catch(error){
//             console.error("Failed to parse JSON:", rawResponse);
//             throw error;
//         };

//         res.json({
//             message: "successfully generated a recipe based on the selected image!",
//             recipe,
//         });
//     } catch(error){
//         next(error);
//     }
// };

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

        console.log("Received base64 length:", base64?.length); // log length
        // console.log("Base64 starts with:", base64?.substring(0, 30)); // sanity check
        // console.log("Base64 ends with:", base64?.slice(-30)); // ensure not truncated
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

`{"model":"llava:7b","created_at":"2025-10-14T02:01:45.0148537Z","response":"7","done":false}\n{"model":"llava:7b","created_at":"2025-10-14T02:01:45.0224356Z","response":"-","done":false}\n`
