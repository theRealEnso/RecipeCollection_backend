import { UserModel } from "../models/UserModel";
import createHttpError from "http-errors";
import validator from "validator";
import bcrypt from "bcrypt";

export type UserData = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
};

export const createAndAddUserToDB = async (userData: UserData) => {
    const {
        firstName, 
        lastName, 
        email, 
        password, 
        confirmPassword
    } = userData;

    // validate user data

    //check if email is already used with an existing user
    const foundExistingUser = await UserModel.findOne({email});
    if(foundExistingUser){
        throw createHttpError.BadRequest("The email provided is already in use. Please try again with a different email address");
    };

    //check if passwords match
    if(password !== confirmPassword){
        throw createHttpError.BadRequest("Passwords do not match!");
    };

    // check if first name matches schema requirements
    if(!validator.isLength(firstName, {min: 2, max: 24})){
        throw createHttpError.BadRequest("Please make sure your password is between 2 and 24 characters");
    };

    // check if last name matches schema requirements
    if(!validator.isLength(lastName, {min: 2, max: 24})){
        throw createHttpError.BadRequest("Please make sure your password is between 2 and 24 characters");
    };

    // check if password matches schema requirements
    if(!validator.isLength(password, {min: 8, max: 32})){
        throw createHttpError.BadRequest("Please make sure your password is between 8 and 32 characters");
    };

    // check if email is valid
    if(!validator.isEmail(email)){
        throw createHttpError.BadRequest("Please enter a valid email address");
    };

    //finally, create user in the database
    const user = await UserModel.create({
        firstName,
        lastName,
        email,
        password,
    });

    return user;
};

export const signInUser = async (email: string, password: string) => {
    const foundUser = await UserModel.findOne({email});

    if(!foundUser) throw createHttpError.NotFound("User not found!");

    const hashedPassword = foundUser.password;

    const verifiedPassword = await bcrypt.compare(password, hashedPassword);

    if(verifiedPassword){
        return foundUser;
    };
};

export const findUser = async (id: string) => {
    const foundUser = await UserModel.findById(id);

    if(!foundUser) throw createHttpError.NotFound("User not found!");

    return foundUser;
};