import axios from "axios";

import mongoose from "mongoose";

import { RecipesModel } from "../models/RecipesModel";

//import type(s)
import { RecipeData } from "../types/Recipe";

import createHttpError from "http-errors";

import recipeGenerationPrompt from "../constants/AI_prompts";

import { updateJob } from "../controllers/RecipeControllers";

// ai server endpoint
const AI_SERVER_LOCALHOST_ENDPOINT = process.env.PROXY_SERVER_WSL_TO_OLLAMA_ON_WINDOWS;

//define helper functions
// some AI models wrap JSON in ``` fences; this removes those wrappers and trims/removes any white space
const stripCodeFences = (str: string) => {
// remove a single opening fence at the very start and a single closing fence at the very end
  let out = str.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "");
  // remove any remaining stray fences anywhere elsei
  out = out.replace(/```/g, "");
  return out.trim();
};

// define a helper function that calculates the progress percent
const progressFromAccumulatedResponse = (accumulatedTextLength: number) => {
    const safe = Math.max(1, accumulatedTextLength); // just makes sure we don't compute log10(0) bc undefined
    const decades = Math.log10(safe); // convert accumulatedTextLength value 0, 1, 2, 3, 4
    const scaled = Math.floor(decades * 26); // multiply by arbitrary number to give realistic progress bar progress feel 
    return Math.min(95, Math.max(0, scaled)); // clamp the progress completed number between 0 and 95,
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

//ultimately resolves with a completed extracted recipe from the AI model,
//also needs to somehow calculate the progress completed as the recipe is being extracted in realtime
const callOllamaStreaming = async (base64Image: string, updateProgress: (accumulatedText: string) => void) => {
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

            const responseFragment = parsedJsonObj.response ?? ""; // null coalescing operator, if we receive a value from the response fields that are null or undefined, then we just replace them with an empty string;

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
                
                // write code that updates the Job map object as the fullText is being accumulated
                // => sub piece => that involves calculating the percentage completed number to show to the FE progress bar
                // => sub piece => update which "phase" of the work we are in as we go
                updateProgress(fullText);

                // console.log(fullText);
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
};

export const runRecipeGenerationJob = async (jobId: string, base64Image: string) => {
    try {
        // update the job Map object right away to indicate that the job has started => need a helper function to do this
        updateJob(jobId, {phase: "processing", progress: 0});

        //helper function that we need to pass into callOllamaStreaming function
        const updateProgress = (accumulatedText: string) => {
            // pass in the accumulated recipe being built up in `fullText` to this function
            // get the length of the accumulated text
            // use the helper function (progressFromAccumulatedResponse function), plug in the growing length into this function to help us compute the progress number
            //use the updateJob function to update the Job map object

            let lastLength = 0;
            let accumulatedTextLength = accumulatedText.length;
            if(accumulatedTextLength > lastLength){
                lastLength = accumulatedTextLength;
                const progressCompleted = progressFromAccumulatedResponse(accumulatedTextLength);
                updateJob(jobId, {progress: progressCompleted});
            };
        };

        //await the callOllamaStreaming function to fully resolve and return the completed fullText (our generated recipe);
        const fullyGeneratedRecipe = await callOllamaStreaming(base64Image, updateProgress);

        updateJob(jobId, {phase: "finalizing", progress: 97}); // update Job to finalizing, update progress to 97

        updateJob(jobId, {phase: "completed", progress: 100, result: fullyGeneratedRecipe}) // mark job as completed, store the fully generated recipe in the result field, update progress number to 100
    } catch(error: any){
        updateJob(jobId, {phase: error, error: error})
    }
};




