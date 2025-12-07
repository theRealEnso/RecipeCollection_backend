import mongoose, {Document} from "mongoose";

const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema.Types;

// export type Category = {
//     user: string;
//     category: string;
// };

const cuisineCategorySchema = new Schema({
    user: {
        type: ObjectId,
        ref: "UserModel",
        required: true,
    },

    cuisineName: {
        type: String,
        required: true,
        trim: true,
    },

    cuisineImage: {
        type: String,
        required: true,
    },
    
}, {collection: "cuisine_categories", timestamps: true});

export const CuisineCategoryModel = mongoose.models.CategoriesModel || mongoose.model("CuisineCategoryModel", cuisineCategorySchema);