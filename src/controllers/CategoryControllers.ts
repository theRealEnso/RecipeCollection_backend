import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";

//import types
// import { Category } from "../types/Category";

import { 
    getCategories, 
    addUserCategory,
    updateCuisineCategory, 
    deleteCuisineCategory, 
} from "../services/CategoryServices";

export const getUserCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.user;

        if(!id) throw createHttpError.BadRequest("Missing required id");
    
        const categories = await getCategories(id);

        res.json({
            message: "Successfully retrieved the user's categories!",
            categories,
        })

    } catch(error){
        next(error);
    }
};

export const addCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log("Route hit with body:", req.body);
    try {
        const { id } = req.user; // from auth middleware
        const { name } = req.body; // from front end

        if(!id || ! name) throw createHttpError.BadRequest("Invalid user ID and/or missing required `name` field");

        const newCategory = await addUserCategory(id, name);

        res.json({
            message: `Category successfully added!`,
            newCategory,
        });
    } catch(error){
        next(error);
    };
};

export const editCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.user;
        const { updatedText } = req.body
        const  categoryId  = req.params.category_id;

        const updatedCuisineCategory = await updateCuisineCategory(id, categoryId, updatedText);

        res.json({
            message: "Successfully updated category!",
            updatedCuisineCategory,
        })
    } catch(error){
        next(error);
    };
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.user;
        const categoryId = req.params.category_id;

        const deletedCuisineCategory = await deleteCuisineCategory(id, categoryId);

        res.json({
            message: "Successfully deleted cuisine category!",
            deletedCuisineCategory,
        })

    } catch(error){
        next(error);
    };
}