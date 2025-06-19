import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";

import { getCategories, addUserCategory } from "../services/CategoryServices";

export const getUserCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const {userId} = req.body;

        if(!userId) throw createHttpError.BadRequest("Missing required userId");
    
        const categories = await getCategories(userId);

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
        const { id } = req.user;
        const {name} = req.body;

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