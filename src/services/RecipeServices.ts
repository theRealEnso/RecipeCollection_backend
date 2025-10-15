import axios from "axios";

import mongoose from "mongoose";

import { RecipesModel } from "../models/RecipesModel";

//import type(s)
import { RecipeData } from "../types/Recipe";

import createHttpError from "http-errors";

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
        sublists
    } = recipeData;

    const createdRecipe = await RecipesModel.create({
        cuisineCategory: categoryId,
        categoryName,
        recipeOwner: recipeOwner && recipeOwner.length > 0 ? recipeOwner : "",
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
        sublists: sublists && sublists.length > 0 ? sublists : [],
    });

    if(!createdRecipe) throw createHttpError[500]("Something went wrong!");

    return createdRecipe;
};

const callOllamaStreaming = async (base64Image: string) => {
    // console.log(base64Image);

    const { data } = await axios.post(`${AI_SERVER_LOCALHOST_ENDPOINT}/api/generate`,
            {
            model: "llava:7b",
            prompt: recipeGenerationPrompt,
            images: [base64Image],
            stream: true,
            }, {
        headers: {
            "Content-Type": "application/json",
            "Accept": "text/event-stream",
        },
        responseType: "stream", // tells axios to give us a Node stream => stream in bytes / chunks as data arrives from AI server
        timeout: 0,
        decompress: true, 
    });

    let stream: NodeJS.ReadableStream = data;

    let fullText = "";
    let buffer = "";

    await new Promise<void>((resolve, reject) => {
        stream.setEncoding("utf-8"); // ensures that we are able to read text, not binary data from the node stream

        // define a helper function
        // data: {"model":"llava:7b","created_at":"2025-10-14T02:01:45.0148537Z","response":"7","done":false}
        // {"model":"llava:7b","created_at":"2025-10-14T02:01:45.0148537Z","response":"7","done":false}
        // handle both cases
        const processLine = (rawLine: string) => {
            let line = rawLine.trim();
            if(!line) return;

            const jsonStr = line.startsWith("data:") ? line.slice(5) : line;

            const parsedJsonObj = JSON.parse(jsonStr);

            const responseFragment = parsedJsonObj.response ?? ""; // null coalescing operator

            if(responseFragment){
            fullText += responseFragment;
            }
        }

        stream.on("data", (chunk: string) => {
            buffer += chunk;
            console.log(chunk);

            let newLineIndex;
            while((newLineIndex = buffer.indexOf("\n")) >= 0){
                let line = buffer.slice(0, newLineIndex); // extract the JSON line;

                buffer = buffer.slice(newLineIndex + 1);

                // process line
                // get the `response` property from each JSON line
                // append to fullText
                // at the end, we should have fullText containing the full recipe that is generated from the AI model
                processLine(line);
                
                console.log(fullText);
            }

        });

        stream.on("end", () => {
            console.log(buffer);
            resolve()
        });

        stream.on("error", (error: any) => {
            console.error(error);
            reject(error);
        })
    });

    return stripCodeFences(fullText);
}




