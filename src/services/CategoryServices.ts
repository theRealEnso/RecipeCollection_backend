import { CuisineCategoryModel } from "../models/CuisineCategoryModel";

//import type(s)
import { Category } from "../types/Category";

import createHttpError from "http-errors";

export const getCategories = async (userId: string): Promise<Category[]> => {
    const userCategories = await CuisineCategoryModel.find({user: userId});

    if(!userCategories) throw createHttpError.NotFound("No categories found for the user!");

    return userCategories;
};

export const addUserCategory = async (userId: string, name: string): Promise<Category> => {
    const addedCategory = await CuisineCategoryModel.create({
        user: userId,
        cuisineName: name,
    });

    if(!addedCategory) throw createHttpError[500]("Whoops! Something went wrong!");

    return addedCategory;
};

export const updateCuisineCategory = async (userId: string, categoryId: string, userText: string) => {
    const updatedCategory = await CuisineCategoryModel.findOneAndUpdate(
        {
            user: userId,
            _id: categoryId,
        },
        {
            cuisineName: userText,
        },
    );

    if(!updatedCategory) throw createHttpError[500];

    return updatedCategory;
};

export const deleteCuisineCategory = async (userId: string, categoryId: string): Promise<void> => {
    const deletedCategory = await CuisineCategoryModel.findOneAndDelete({
        user: userId,
        _id: categoryId,
    });

    if(!deletedCategory) throw createHttpError[500];

    return deletedCategory;
};