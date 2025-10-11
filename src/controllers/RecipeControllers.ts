import { Request, Response, NextFunction } from "express";
import axios from "axios";

import {
    getRecipes, 
    getDetailedRecipe, 
    createNewRecipe,
} from "../services/RecipeServices";

import cloudinary from "../configs/cloudinary";

import createHttpError from "http-errors";

// ai server endpoint
const AI_SERVER_LOCALHOST_ENDPOINT = process.env.PROXY_SERVER_WSL_TO_OLLAMA_ON_WINDOWS;

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

        const { data } = await axios.post(`${AI_SERVER_LOCALHOST_ENDPOINT}/api/generate`,
             {
                model: "llava:7b",
                prompt: `You are a structured Recipe JSON generator.

INPUT:
{
  "image_base64": "<base64>",
  "hints": "<optional user hints>"
}

GOAL: Return ONE (1) JSON object ONLY, strictly following the schema and rules below. No prose, no markdown, no code fences.

========================
SCHEMA (TOP-LEVEL KEYS)
========================
{
  "_id": { "$oid": "" },
  "cuisineCategory": {},
  "categoryName": "string",
  "recipeOwner": "string",
  "nameOfDish": "string",
  "difficultyLevel": "easy | intermediate | hard",
  "timeToCook": "string",
  "numberOfServings": "string",
  "specialEquipment": "string",
  "imageUrl": "string",
  "ingredients": [
    { "nameOfIngredient": "string", "ingredient_id": "uuid-v4" }
  ],
  "subIngredients": [
    {
      "sublistName": "string",
      "sublistId": "uuid-v4",
      "nameOfIngredient": "string",
      "ingredient_id": "uuid-v4"
    }
  ],
  "cookingInstructions": [
    { "instruction": "string", "instruction_id": "uuid-v4" }
  ],
  "subInstructions": [
    {
      "sublistName": "string",
      "sublistId": "uuid-v4",
      "instruction": "string",
      "instruction_id": "uuid-v4"
    }
  ],
  "sublists": [
    { "name": "string", "id": "uuid-v4" }
  ]
}

========================
ABSOLUTE MODE RULE
========================
Choose EXACTLY ONE mode:
• SIMPLE mode → "ingredients" + "cookingInstructions" are non-empty; "sublists", "subIngredients", "subInstructions" must be [].
• COMPLEX mode → "sublists", "subIngredients", "subInstructions" are non-empty and linked; "ingredients" + "cookingInstructions" must be [].
Never mix modes.

========================
ID & ENUM RULES
========================
• All *_id and sublist "id" values MUST be unique lowercase UUID v4 strings:
  ^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$
• "difficultyLevel" ∈ { "easy", "intermediate", "hard" } exactly.
• "timeToCook" and "numberOfServings" MUST be strings (e.g., "30 min", "4 servings").
• Keep keys present even if unknown (use "" for strings, {} for "cuisineCategory", [] for unused arrays per mode).

========================
COMPLEX MODE LINKING
========================
• "sublists" defines components as { "name", "id" }.
• Every object in "subIngredients" and "subInstructions" MUST contain a "sublistName" that EXACTLY matches a "sublists.name" and a "sublistId" that EXACTLY matches that sublist’s "id".

========================
INGREDIENT QUANTITY GUARANTEE
========================
Every ingredient string MUST begin with a quantity and (usually) a unit, followed by the ingredient name. Never output a bare name.

VALID PATTERNS (must match at least one):
1) Numeric quantity + unit + name:
   - Examples: "8 oz spaghetti noodles", "2 Tbsp olive oil", "1 cup canned crushed tomatoes", "3 cloves garlic", "1 tsp dried basil", "1/2 cup grated parmesan cheese".
   - Allowed units (case-sensitive exactly as shown): tsp, Tbsp, cup, cups, oz, lb, lbs, g, kg, ml, L, clove, cloves, slice, slices, can, cans, package, packages, bunch, bunches, stick, sticks, sheet, sheets, head, heads.
   - Fractions allowed (e.g., 1/2, 3/4). Decimals allowed (e.g., 0.5).
2) Countable item without unit but explicit count:
   - Examples: "2 eggs", "3 tomatoes", "1 lemon".
3) Non-quantifiable seasonings/fats must still use a quantity proxy:
   - Use: "to taste", "as needed" — but still prefix with a quantity proxy when possible:
     - Examples: "1 pinch kosher salt", "1 drizzle olive oil", or "Kosher salt, to taste", "Olive oil, as needed".
   - If using the comma style, it MUST end with ", to taste" or ", as needed".

FORBIDDEN (must never appear):
- Bare names like "Spaghetti Noodles", "Olive Oil", "Garlic Cloves".
- Vague amounts like "some", "a bit", "a handful" (use a numeric proxy or "to taste/as needed").
- Brand names.

SHORT EXAMPLES (DO use these shapes; DO NOT copy content):
OK: "8 oz spaghetti noodles"
OK: "2 Tbsp olive oil"
OK: "3 cloves garlic"
OK: "1 cup canned crushed tomatoes"
OK: "1 tsp dried basil"
OK: "1/2 cup grated parmesan cheese"
OK: "Kosher salt, to taste"
OK: "Olive oil, as needed"
NOT OK: "Spaghetti Noodles"
NOT OK: "Olive Oil"
NOT OK: "Garlic Cloves"

========================
CONTENT & STYLE
========================
• Reasonable defaults are allowed when the exact quantity cannot be read from the image; pick typical cookbook values.
• Use US units primarily; metric may be added in parentheses if helpful.
• "specialEquipment" lists only non-basic tools (e.g., "blender"); "" if none.
• Write imperative, single-action steps for instructions (clear sequence, no duplicates).

========================
MANDATORY SELF-CHECK
========================
Before you output JSON, verify ALL of the following:
[ ] Exactly one mode is populated; the other mode’s arrays are [].
[ ] All *_id values are unique, lowercase UUID v4 and match the regex.
[ ] If COMPLEX mode, every subIngredient/subInstruction has a matching sublistName + sublistId in "sublists".
[ ] Every entry in "ingredients" (SIMPLE mode) or "subIngredients" (COMPLEX mode) matches the QUANTITY rule:
    - It begins with a numeric quantity (integer, fraction, or decimal) optionally followed by an allowed unit, then the ingredient name;
      OR it uses the seasoning style "..., to taste" / "..., as needed".
[ ] There are NO bare ingredient names without any quantity/qualifier.
[ ] "difficultyLevel" is exactly one of the allowed values.
[ ] "timeToCook" and "numberOfServings" are strings.
[ ] Output is a single valid JSON object. No extra text, no markdown.

========================
AUTO-REPAIR RULE (IF ANY CHECK FAILS)
========================
If any ingredient is missing a quantity/qualifier or violates the patterns, DO NOT return the bad output. Instead, silently FIX ONLY the offending items by adding reasonable quantities or "..., to taste"/"..., as needed", re-run the self-check, then return the corrected JSON.

========================
OUTPUT
========================
Return ONE JSON object that satisfies ALL rules above. No additional text.
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

// export const generateRecipeFromImage = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { base64Image } = req.body;
//         // console.log(base64Image);

//         const { data } = await axios.post(`${AI_SERVER_LOCALHOST_ENDPOINT}/api/generate`,
//              {
//                 model: "llava:7b",
//                 prompt: `You are a food recipe generator AI. Analyze this image and return a recipe that includes specific quantities of ingredients. Include the name and quantity of the ingredient together as a string value. For example, if a recipe requires 4 ounces of chicken breast, then its value should be "4 oz chicken breast". Do not put the name of the ingredient and the quantity as separate keys. Please also provide clear preparation and cooking instructions and how to cook the food depicted in the image. Return the result in valid JSON only, without any text before or after, with the following fields:
//                 {
//                     "nameOfDish": "string",
//                     "difficultyLevel": "easy | intermediate | hard",
//                     "timeToCook": "string (e.g. 30 minutes)",
//                     "numberOfServings": "string (e.g. 4)",
//                     "specialEquipment": "string or empty",
//                     "ingredients": [ {"nameOfIngredient": "name and quantity of ingredient 1", "ingredient_id": generateUniqueId}, {"nameOfIngredient": "name and quantity of ingredient 2", "ingredient_id": generateUniqueId}, ... ],
//                     "cookingInstructions": [ {"instruction": "step 1", "instruction_id": generateUniqueId}, {"instruction": "step 2", "instruction_id": generateUniqueId}, ... ],
//                     "sublists": [ {"name": "sublist1 name", "id": generateUniqueId }, {"name": "sublist2 name", "id": generateUniqueId }, ... ],
//                     "subIngredients": [
//                          {"sublistName": "sublist name", "sublistId": "matching string value from sublists", "nameOfIngredient": "name and quantity of ingredient 1", "ingredient_id": generateUniqueId}, {"sublistName": "sublist name", "sublistId": "matching string value from sublists", "nameOfIngredient": "name and quantity of ingredient 2", "ingredient_id": generateUniqueId}, .... 
//                     ],
//                     "subInstructions": [
//                         { "sublistName": "sublist name", "sublistId": "matching string value from sublists", "instruction": "step 1", "instruction_id": generateUniqueId},  { "sublistName": "sublist name", "sublistId": "matching string value from sublists", "instruction": "step 2", "instruction_id": generateUniqueId}... }
//                     ]
//                 }

//                 If the recipe you generate is simple, then leave sublists, subIngredients, and subInstructions empty; only cookingInstructions and ingredients should be populated. Otherwise, if you generate a recipe that is more complex and has multiple sub-recipes, then cookingInstructions and ingredients will be empty, but populate sublists, subIngredients, and subInstructions. Additionally, for complex recipes, each ingredient and cooking instruction you generate must be tied together with its respective sublist.
//                 `,
//                 images: [base64Image],
//                 stream: true,
//              }, {
//             headers: {
//                 "Content-Type": "application/json",
//                 Accept: "text/event-stream",
//                 Connection: "keep-alive"
//             },
            
//             responseType: "stream", // tell axios to give us a nodejs readable stream
//             timeout: 0, // don't auto time out after a long generation
//         });

//         console.log(data);

//         // let rawResponse = data.response;
        
//         // rawResponse = rawResponse.replace(/```json|```/g, "").trim(); // find all matches of ```json or ``` and replace with empty string, then trim removes empty spaces

//         // let recipe;
//         // try {
//         //     recipe = JSON.parse(rawResponse);
//         // } catch(error){
//         //     console.error("Failed to parse JSON:", rawResponse);
//         //     throw error;
//         // };

//         // res.json({
//         //     message: "successfully generated a recipe based on the selected image!",
//         //     recipe,
//         // });
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
