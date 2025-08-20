import mongoose from "mongoose";

import { RecipesModel } from "../models/RecipesModel";

//import type(s)
import { RecipeData } from "../types/Recipe";

import createHttpError from "http-errors";

export const getRecipes = async (categoryId: string) => {
    // string needs to be converted to ObjectId because thats how cuisineCategory is stored in our model/schema and DB
    const categoryObjectId = new mongoose.Types.ObjectId(categoryId);

    console.log(typeof categoryObjectId);

    const recipes = await RecipesModel.find({
        cuisineCategory: categoryObjectId,
    });

    // if(recipes.length === 0) throw createHttpError[500]("Something went wrong!");

    return recipes;
};

export const createNewRecipe = async (recipeData: RecipeData) => {
    const { 
        categoryName,
        categoryId,
        recipeOwner,
        nameOfDish,
        difficultyLevel,
        timeToCook,
        numberOfServings,
        specialEquipment,
        imageUri,
        ingredients,
        subIngredients,
        cookingDirections,
        subDirections,
    } = recipeData;

    const createdRecipe = await RecipesModel.create({
        cuisineCategory: categoryId,
        categoryName,
        recipeOwner: recipeOwner ? recipeOwner : "",
        nameOfDish,
        difficultyLevel,
        timeToCook,
        numberOfServings,
        specialEquipment: specialEquipment && specialEquipment.length > 0 ? specialEquipment : "",
        imageUri,
        ingredients: ingredients && ingredients.length > 0 ? ingredients : [],
        subIngredients: subIngredients && subIngredients.length > 0 ? subIngredients : [],
        cookingDirections: cookingDirections && cookingDirections.length > 0 ? cookingDirections : [],
        subDirections: subDirections && subDirections.length > 0 ? subDirections : [],
    });

    if(!createdRecipe) throw createHttpError[500]("Something went wrong!");

    return createdRecipe;
};
