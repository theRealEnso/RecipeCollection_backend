import mongoose from "mongoose";

const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema.Types;

const recipeComponentSchema = new Schema ({
    title: {
        type: String,
        required: true,
        trim: true,
    },

    ingredients: {
        type: [String],
        required: true,
    },

    cookingDirections: {
        type: [String],
        required: true,
    }
})

const recipesSchema = new Schema(
    {   
        cuisineCategory: {
            type: ObjectId,
            ref: "CuisineCategoryModel",
            required: true,
        },

        recipeOwner: {
            firstName: {
                type: String,
                trim: true,
            },

            lastName: {
                type: String,
                trim: true,
            }
        },

        dishName: {
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

        timeToPrep: {
            type: String,
            required: true,
            trim: true,
        },

        yield: {
            type: String,
            required: true,
            trim: true,
        },

        specialEquipment: {
            type: String,
            trim: true,
        },

        components: {
            type: [recipeComponentSchema],
            required: true,
        },
    },

    {
        collection: "recipes", 
        timestamps: true
    }
);

export const RecipesModel = mongoose.models.RecipesModel || mongoose.model("RecipesModel", recipesSchema);