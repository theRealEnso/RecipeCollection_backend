import { CuisineCategoryModel } from "../models/CuisineCategoryModel";

import createHttpError from "http-errors";

export const getCategories = async (userId: string) => {
    const userCategories = await CuisineCategoryModel.find({user: userId});

    if(!userCategories) throw createHttpError[404]("No categories found for the user!");

    return userCategories;
};

export const addUserCategory = async (userId: string, name: string) => {
    const addedCategory = await CuisineCategoryModel.create({
        user: userId,
        cuisineName: name,
    });

    if(!addedCategory) throw createHttpError[500]("Whoops! Something went wrong!");

    return addedCategory;
};