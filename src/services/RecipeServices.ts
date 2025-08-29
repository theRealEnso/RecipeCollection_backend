import axios from "axios";

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

export const getDetailedRecipe = async (recipeId: string) => {
    const recipe = await RecipesModel.findById(recipeId);

    if(!recipe) throw createHttpError[404]("Recipe not found!");

    return recipe;
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
        imageUrl,
        ingredients,
        subIngredients,
        cookingInstructions,
        subInstructions,
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
        imageUrl,
        ingredients: ingredients && ingredients.length > 0 ? ingredients : [],
        subIngredients: subIngredients && subIngredients.length > 0 ? subIngredients : [],
        cookingInstructions: cookingInstructions && cookingInstructions.length > 0 ? cookingInstructions : [],
        subInstructions: subInstructions && subInstructions.length > 0 ? subInstructions : [],
    });

    if(!createdRecipe) throw createHttpError[500]("Something went wrong!");

    return createdRecipe;
};
