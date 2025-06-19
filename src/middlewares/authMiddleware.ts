import { Request, Response, NextFunction } from "express";
import { Secret } from "jsonwebtoken";
import createHttpError from "http-errors";
import logger from "../configs/winston-logger";

import dotenv from "dotenv";

// import token utility function
import { verifyToken } from "../utils/TokenServices";

dotenv.config();

const {SECRET_ACCESS_TOKEN} = process.env;

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        
        const authHeader = req.headers.authorization || req.headers.Authorization;

        if(!authHeader || Array.isArray(authHeader)) throw createHttpError.Unauthorized("Authorization headers and/or bearer token is missing. It must be a single string containing a bearer token");

        const authParts = authHeader.split(" ");
        if(authParts.length !== 2 || authParts[0] !== "Bearer"){
            throw createHttpError.Unauthorized("Malformed authorization headers!");
        };

        const accessToken = authParts[1];
        
        const verifiedUser = await verifyToken(accessToken, SECRET_ACCESS_TOKEN as Secret);

        if (
            verifiedUser
        ) {
            req.user = verifiedUser;
            next();
        } else {
            throw createHttpError.Unauthorized("Invalid token payload.");
        }
    } catch(error){
        logger.error(error);
        next(error);
    }
};