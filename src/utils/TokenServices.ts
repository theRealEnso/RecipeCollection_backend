import jwt, { Secret, } from "jsonwebtoken";
// import StringValue from "jsonwebtoken"

type UserData = {
    id: string;
};

//use json web tokens to generate access and refresh tokens for authenticated user
//payload passed into generating tokens will be on object containing information about the user, like an user ID

// jwt.sign(payload, secretOrPrivateKey, [options, callback])
export const generateToken = async (payload: UserData, secretToken: Secret, expirationTime: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, secretToken, {expiresIn: expirationTime as jwt.SignOptions["expiresIn"]}, (error, encodedToken) => {
            if(error || !encodedToken){
                reject(error || new Error("Failed to generate token"));
            } else {
                resolve(encodedToken);
            }
        });
    });
};

// jwt.verify(token, secretOrPublicKey, [options, callback])
// verifying a token will result in receiving the decoded data (like the user ID)
export const verifyToken = async (token: string, secretToken: Secret) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secretToken, (error, decodedData) => {
            if(error){
                reject(error);
            } else {
                resolve(decodedData);
            }
        });
    });
};