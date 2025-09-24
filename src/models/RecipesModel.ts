import mongoose from "mongoose";

const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema.Types;

const recipesSchema = new Schema(
    {   
        cuisineCategory: {
            type: ObjectId,
            ref: "CuisineCategoryModel",
            required: true,
        },

        categoryName: {
            type: String,
        },

        recipeOwner: {
            type: String,
            trim: true,
        },

        nameOfDish: {
            type: String,
            required: true,
            trim: true,
        },

        difficultyLevel: {
            type: String,
            required: true,
            trim: true,
        },

        timeToCook: {
            type: String,
            required: true,
            trim: true,
        },

        numberOfServings: {
            type: String,
            required: true,
            trim: true,
        },

        specialEquipment: {
            type: String,
            trim: true,
        },

        imageUrl: {
            type: String,
        },

        ingredients: {
            type: [],
        },

        subIngredients: {
            type: [],
        },

        cookingInstructions: {
            type: [],
        },

        subInstructions: {
            type: [],
        },

        sublists: {
            type: [],
        }
    },

    {
        collection: "recipes", 
        timestamps: true
    }
);

export const RecipesModel = mongoose.models.RecipesModel || mongoose.model("RecipesModel", recipesSchema);