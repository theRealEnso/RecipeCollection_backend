import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";

import { getRecipes, createNewRecipe } from "../services/RecipeServices";

export const getAllCategoryRecipes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categoryId = req.params.categoryId;
        
        console.log("Category ID from params: ", categoryId);
        console.log(typeof categoryId);
        
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
            ingredients,
            subIngredients,
            cookingDirections,
            subDirections,
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
            !cookingDirections || 
            !subDirections
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
            ingredients,
            subIngredients,
            cookingDirections,
            subDirections,
        });

        res.json({
            message: "Recipe successfully created!",
            newRecipe,
        });
    } catch(error){
        next(error);
    }
};