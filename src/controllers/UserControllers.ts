import { Request, Response, NextFunction} from "express";
import dotenv from "dotenv";
import createHttpError from "http-errors";
import { Secret } from "jsonwebtoken";

import { createAndAddUserToDB, signInUser, findUser } from "../services/UserServices";

//import utility functions
import { formatName } from "../utils/FormatName";
import { generateToken, verifyToken, } from "../utils/TokenServices";

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
            accessToken = await generateToken({id: newUser._id}, SECRET_ACCESS_TOKEN, "3600000");
        };
    
        //generate refresh token
        if(SECRET_REFRESH_TOKEN && SECRET_REFRESH_TOKEN.length > 0){
            refreshToken = await generateToken({id: newUser._id}, SECRET_REFRESH_TOKEN, "30d");
        };
    
        //respond back with a user object containing user data
        res.json({
            message: "Successfully registered the user!",
            user: {
                id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
            },
            access_token: accessToken,
            refresh_token: refreshToken,
        })
    } catch(error){ 
        next(error);
    };
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const {email, password} = req.body;

    if(!email || !password) throw createHttpError.BadRequest("Missing required fields!");

    try {
        let accessToken;
        let refreshToken;

        const user = await signInUser(email, password);
    
        // generate access token
        if(SECRET_ACCESS_TOKEN && SECRET_ACCESS_TOKEN.length > 0){
            accessToken = await generateToken({id: user._id}, SECRET_ACCESS_TOKEN, "36000000"); // 1 hr expressed in milliseconds
        };
    
        // generate refresh token
        if(SECRET_REFRESH_TOKEN && SECRET_REFRESH_TOKEN.length > 0){
            refreshToken = await generateToken({id: user._id}, SECRET_REFRESH_TOKEN, "30d");
        };
    
        //respond back with user data
        res.json({
            message: "User successfully signed in!",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            },
            access_token: accessToken,
            refresh_token: refreshToken,
        });
    } catch(error){
        next(error);
    }
};

export const refreshUserToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { refresh_token } = req.body;

        if(!refresh_token) throw createHttpError.Unauthorized("Refresh token is missing!");

        const user = await verifyToken(refresh_token, process.env.SECRET_REFRESH_TOKEN as Secret);

        if(user && user.id){
            const userInDB = await findUser(user.id);
            if(userInDB){
                const newAccessToken = await generateToken({id: userInDB._id}, process.env.SECRET_ACCESS_TOKEN as Secret, "1d");
                return res.json({
                    access_token: newAccessToken,
                });
            } else {
                throw createHttpError.Unauthorized("User not found!");
            }
        } else {
            throw createHttpError.Unauthorized("Invalid refresh token payload");
        }
        
    } catch(error){
        next(error);
    }
};
