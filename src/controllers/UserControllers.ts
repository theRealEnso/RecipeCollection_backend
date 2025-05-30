import { Request, Response, NextFunction} from "express";
import dotenv from "dotenv";
import createHttpError from "http-errors";

import { createAndAddUserToDB } from "../services/UserServices";

//import utility functions
import { formatName } from "../utils/FormatName";
import { generateToken } from "../utils/TokenServices";

dotenv.config();

const { SECRET_ACCESS_TOKEN, SECRET_REFRESH_TOKEN } = process.env;

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let accessToken;
        let refreshToken;

        const {firstName, lastName, email, password, confirmPassword } = req.body;
    
        if(
            !firstName ||
            !lastName ||
            !email ||
            !password
        ){
            throw createHttpError.BadRequest("Please fill out all of the required fields!");
        };
    
    
        //create user
        const newUser = await createAndAddUserToDB({
            firstName: formatName(firstName),
            lastName: formatName(lastName),
            email,
            password,
            confirmPassword,
        });
    
        //generate access token
        if(SECRET_ACCESS_TOKEN && SECRET_ACCESS_TOKEN.length > 0){
            accessToken = await generateToken({id: newUser._id}, SECRET_ACCESS_TOKEN, "1d");
        };
    
        //generate refresh token
        if(SECRET_REFRESH_TOKEN && SECRET_REFRESH_TOKEN.length > 0){
            refreshToken = await generateToken({id: newUser._id}, SECRET_REFRESH_TOKEN, "30d");
        };
    
        //store refresh token in a cookie on the server
        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 30 * 24 * 60 * 60 * 1000 // set 30 day expiration date
        });
    
        //respond back with a user object containing user data
        res.json({
            message: "Successfully registered the user!",
            user: {
                id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                access_token: accessToken,
            }
        })
    } catch(error){
        next(error);
    };
};