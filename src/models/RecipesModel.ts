import mongoose from "mongoose";

const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema.Types;


// const recipeComponentSchema = new Schema ({
//     title: {
//         type: String,
//         required: true,
//         trim: true,
//     },

//     ingredients: {
//         type: [String],
//         required: true,
//     },

//     cookingDirections: {
//         type: [String],
//         required: true,
//     }
// });

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

        imageUri: {
            type: String,
        },

        ingredients: {
            type: [],
        },

        subIngredients: {
            type: [],
        },

        cookingDirections: {
            type: [String],
        },

        subDirections: {
            type: [],
        }

        // components: {
        //     type: [recipeComponentSchema],
        //     required: true,
        // },
    },

    {
        collection: "recipes", 
        timestamps: true
    }
);

export const RecipesModel = mongoose.models.RecipesModel || mongoose.model("RecipesModel", recipesSchema);