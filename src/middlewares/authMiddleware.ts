import { Request, Response, NextFunction } from "express";
import { Secret, JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import createHttpError from "http-errors";
import logger from "../configs/winston-logger";

import dotenv from "dotenv";

// import token utility function
import { verifyToken } from "../utils/TokenServices";

dotenv.config();

const { SECRET_ACCESS_TOKEN } = process.env;

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        
        const authHeader = req.headers.authorization || req.headers.Authorization;

        if(!authHeader || Array.isArray(authHeader)) throw createHttpError.Unauthorized("Authorization headers and/or bearer token is missing. It must be a single string containing a bearer token");

        const authParts = authHeader.split(" ");
        if(authParts.length !== 2 || authParts[0] !== "Bearer"){
            throw createHttpError.Unauthorized("Malformed authorization headers!");
        };

        const accessToken = authParts[1];
        
        //verifiedUser === decoded payload === user id
        const verifiedUser = await verifyToken(accessToken, SECRET_ACCESS_TOKEN as Secret);

        if (
            verifiedUser
        ) {
            req.user = verifiedUser;
            next();
        } else {
            throw createHttpError.Unauthorized("Invalid token payload.");
        }
    } catch(error: any){ // error comes in form of an object--can add extra properties onto this object
        if(error instanceof TokenExpiredError){
            (error as any).status = 401; // add `status` property to error object, set to 401
            error.message = "Access token has expired!" // add a message property to error object
        };
        
        if(error instanceof JsonWebTokenError){
            (error as any).status = 401;
            error.message = "Invalid access token!"
            return next(createHttpError[401]("Invalid access token!"));
        };

        logger.error(error);
        next(error); // pass error object with additional status and message properties into global error handling middleware
    }
};