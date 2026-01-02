import axios from "axios";

import mongoose from "mongoose";

// import model(s)
import { RecipesModel } from "../models/RecipesModel";
import { UserModel } from "../models/UserModel";

//import type(s)
import { RecipeData, RecipeDocument } from "../types/Recipe";

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

// helper function that calculates / simulates + smoothens out the progress percent (For AI workload)
const progressFromAccumulatedResponse = (accumulatedTextLength: number) => {
    const safe = Math.max(1, accumulatedTextLength); // just makes sure we don't compute log10(0) bc undefined
    const decades = Math.log10(safe); // convert accumulatedTextLength value to 0, 1, 2, 3, 4...
    const scaled = Math.floor(decades * 26); // multiply by arbitrary number to give realistic progress bar progress feel 
    return Math.min(95, Math.max(0, scaled)); // clamp the progress completed number between 0 and 95,
};

export const getRecipes = async (categoryId: string) => {
    // string needs to be converted to ObjectId because that is the data type of how cuisineCategory is stored in our model/schema and DB
    const categoryObjectId = new mongoose.Types.ObjectId(categoryId);

    // console.log(typeof categoryObjectId);

    const recipes = await RecipesModel.find({
        cuisineCategory: categoryObjectId,
    });

    if(!recipes || recipes.length === 0) throw createHttpError(404, "No recipes found for cuisine category!");

    return recipes;
};

export const getPublicRecipes = async () => {
    const publicRecipes = await RecipesModel.find({isPublic: true});

    if(!publicRecipes) throw createHttpError.NotFound("Public recipes not found!");

    return publicRecipes;
};

export const getDetailedRecipe = async (recipeId: string) => {
    const recipe = await RecipesModel.findById(recipeId).populate({
        path: "reviews.user",
        select: "_id firstName lastName image",
    });

    if(!recipe) throw createHttpError.NotFound("Recipe not found!");

    const {reviews, ...recipeWithoutReviews} = recipe.toObject();

    return recipeWithoutReviews;
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
        sublists,
        isPublic,
        ownerUserId,
        isClaimed,
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
        isPublic,
        ownerUserId,
        isClaimed,
    });

    if(!createdRecipe) throw createHttpError[500]("Something went wrong!");

    return createdRecipe;
};

export const searchForUserRecipes = async (searchQuery: string, userId: string) => {
    try {
        const searchRegex = new RegExp(searchQuery, "i"); //make searchQuery case insensitive
        // ex: if searchQuery is "hello" or "HELLO"... it will match to both of these in the search

        // define our filter for search criteria
        const searchCriterion = {
            ownerUserId: userId, // search for recipes owned by the user
            $or: [
                {nameOfDish: {$regex: searchRegex}}, // user can search for the name of the dish
                {recipeOwner: {$regex: searchRegex}}, // user can search for the name of the recipe owner / creator
                {categoryName: {$regex: searchRegex}}, // user can search for the name of the recipe owner / creator
            ]
        };

        let userRecipes: any[] | null = await RecipesModel.find(searchCriterion)
            .populate('cuisineCategory')
            .sort({createdAt: -1}); // sort recipes by the newest

        console.log(userRecipes);
        console.log(userRecipes.length);

        // userRecipes = userRecipes.length === 0 ? null : userRecipes

        return userRecipes;
    } catch(error){
        throw createHttpError.InternalServerError("Failed to search for recipes...");
    };
};

export const updateRecipe = async (recipeId: string, userId: string) => {
    const updatedRecipe = await RecipesModel.findByIdAndUpdate(
        recipeId, 
        {
            ownerUserId: userId,
            claimedByUserId: userId,
            claimedAt: new Date(),
            isClaimed: true,
        }, 

        {
            new: true, // return the updated document
        }
    );

    if(!updatedRecipe) throw createHttpError[500]("Failed to claim recipe!");

    return updatedRecipe;
};

// *****    service functions for ratings and reviews *****

// helper function to help with computing the average rating
const updateRatings = (recipe: RecipeDocument) => {
    //loop through each item in the array, compute the sum of all ratings, and then divide by array length to get the average
    const reviews = recipe.reviews || [];

    if(reviews.length === 0){
        recipe.averageRating = 0;
        recipe.ratingCount = 0;
        return;
    };

    const totalSum = reviews.reduce((accumulator, currentValue) => accumulator + currentValue.rating, 0);
    
    recipe.averageRating = totalSum / reviews.length;
    recipe.ratingCount = reviews.length
};

export const addReview = async (userId: string, recipeId: string, rating: number, comment: string) => {
    const recipe = await RecipesModel.findById(recipeId);

    if(!recipe) throw createHttpError(404, "Recipe not found!");

    // initialize reviews array as empty if non-existent
    if(!recipe.reviews || !recipe.reviews.length){
        recipe.reviews = [];
    };

    // need to check if user already has a review. If so then update existing. Otherwise, create a new review and append the review object to the reviews array
    let existingReviewIndex = recipe.reviews.findIndex((review: any) => review.user.toString() === userId);
    if(existingReviewIndex > -1){
        // existing review is found
        recipe.reviews[existingReviewIndex].rating = rating;
        recipe.reviews[existingReviewIndex].comment = comment;
        recipe.reviews[existingReviewIndex].updatedAt = new Date();
        // recipe.reviews.sort((a: any, b: any) => {
        //     if(b.updatedAt.getTime() !== a.updatedAt.getTime()){
        //         return b.updatedAt.getTime() - a.updatedAt.getTime()
        //     };

        //     return b._id.toString().localeCompare(a._id.toString());
        // })
    } else {
        // no existing review. Create a new review and push to reviews array
        recipe.reviews.push({
            user: new mongoose.Types.ObjectId(userId),
            rating,
            comment,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    };

    recipe.reviews.sort((a: any, b: any) => {
        const dateB = new Date(b.updatedAt);
        const dateA = new Date(a.updatedAt);
        return dateB.getTime() - dateA.getTime();
    });

    updateRatings(recipe);

    const savedRecipe = await recipe.save();

    if(!savedRecipe) throw createHttpError(500, "Failed to save the review for the recipe");

    return savedRecipe;
};

export const deleteRecipeReview = async (userId: string, recipeId: string) => {
    const updatedRecipe = await RecipesModel.findOneAndUpdate(
        {
            _id: recipeId,
            "reviews.user": userId,
        },
        {
            $pull: {reviews: {user: new mongoose.Types.ObjectId(userId)}}
        },
        {new: true},
    )

    if(!updatedRecipe) throw createHttpError(404, "Recipe or review for user not found!");

    updateRatings(updatedRecipe as RecipeDocument);

    const savedRecipe = await updatedRecipe.save();

    if(!savedRecipe) throw createHttpError(500, "Failed to delete review for recipe");

    return savedRecipe;
};

// *****    service functions AI recipe generation *****
//ultimately resolves with a completed extracted recipe from the AI model that matches our schema
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

        // define a helper function to process incoming chunks
        // chunks look like either:
        // 1.) data: {"model":"llava:7b","created_at":"2025-10-14T02:01:45.0148537Z","response":"7","done":false}

        // OR

        // 2.) {"model":"llava:7b","created_at":"2025-10-14T02:01:45.0148537Z","response":"7","done":false}
        // handle both cases
        const processLine = (rawLine: string) => {
            let line = rawLine.trim();
            if(!line) return;

            const jsonStr = line.startsWith("data:") ? line.slice(5) : line;

            const parsedJsonObj = JSON.parse(jsonStr);

            const responseFragment = parsedJsonObj.response ?? ""; // null coalescing operator, if we receive a value from the response fields that are null or undefined, then we just replace them with an empty string. Otherwise, responseFragment will be the data inside of the                        =             response field  

            if(responseFragment){
                fullText += responseFragment;
            };
        };

        stream.on("data", (chunk: string) => {
            buffer += chunk;
            // console.log(chunk);

            let newLineIndex;
            while((newLineIndex = buffer.indexOf("\n")) >= 0){
                let line = buffer.slice(0, newLineIndex); // extract the JSON line;

                buffer = buffer.slice(newLineIndex + 1); //update buffer to remove the processed line

                // process line
                // get the `response` property from each JSON line
                // append to fullText
                // at the end, we should have fullText containing the full recipe that is generated from the AI model
                processLine(line);
                
                // write code that updates the Job map object as the fullText is being accumulated
                // => sub piece of logic that involves calculating the percentage completed number to show to the FE progress bar
                // => sub piece => update which "phase" of the work we are in as we go
                updateProgress(fullText);

                // console.log(fullText);
            }

        });

        stream.on("end", () => {
            // console.log(buffer);
            const tail = buffer.trim();
            if(tail){
                processLine(tail);
                updateProgress(fullText);
            };

            resolve();
        });

        stream.on("error", (error: any) => {
            console.error(error);
            reject(error);
        })
    });

    // console.log("full recipe is: ", fullText);

    console.log("the data type of fullText is: ", typeof(JSON.parse(stripCodeFences(fullText))));

    return JSON.parse((stripCodeFences(fullText)));
};

export const runRecipeGenerationJob = async (jobId: string, base64Image: string) => {
    try {
        // update the job Map object right away to indicate that the job has started => need a helper function to do this
        updateJob(jobId, {id: jobId, phase: "processing", progress: 1});

        let lastLength = 0;
        let baseline = 1;

        //helper function that we need to pass into callOllamaStreaming function to sync accumulated streamed responses with progress
        const updateProgress = (accumulatedText: string) => {
            // pass in the accumulated recipe being built up in `fullText` to this function
            // get the length of the accumulated text
            // use the helper function (progressFromAccumulatedResponse function), plug in the growing length into this function to help us compute the progress number
            //use the updateJob function to update the Job map object

            let accumulatedTextLength = accumulatedText.length;
            if(accumulatedTextLength > lastLength){
                lastLength = accumulatedTextLength;
                const progressCompleted = progressFromAccumulatedResponse(accumulatedTextLength);
                const clampedPercentage = Math.max(baseline, progressCompleted); // ends up being between 1 and 95
                // console.log("progress percent has been updated to: ", clampedPercentage);
                updateJob(jobId, {id: jobId, progress: clampedPercentage});
            };
        };

        //await the callOllamaStreaming function to fully resolve and return the completed fullText (our generated recipe);
        const fullyGeneratedRecipe = await callOllamaStreaming(base64Image, updateProgress);

        updateJob(jobId, {id: jobId, phase: "finalizing", progress: 97}); // update Job to finalizing, update progress to 97

        // mark job as completed, store the fully generated recipe in the result field, update progress number to 100
        updateJob(jobId, {id: jobId, phase: "completed", progress: 100, result: fullyGeneratedRecipe}) 
    } catch(error: any){
        updateJob(jobId, {id: jobId, phase: "error", error: error})
    };
};




