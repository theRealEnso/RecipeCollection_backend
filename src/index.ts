import app from "./app";
import dotenv from "dotenv";
import mongoose from "mongoose";
import logger from "./configs/winston-logger";

//dotEnv config
dotenv.config();

// use environment variables
const PORT = Number(process.env.PORT) || 3001;
const { DATABASE_URL, LOCAL_DATABASE_URL } = process.env;

//enable mongoDB debug mode for development
if(process.env.NODE_ENV !== "production"){
    mongoose.set("debug", true);
};

//  ***********     For connecting to MongoDB Atlas cluster     **********
const connectToDB = async () => {
    try {
        if(!process.env.DATABASE_URL || !DATABASE_URL || DATABASE_URL.length === 0){
            logger.error(`DATABASE_URL environment variable is either missing or undefined!`);
        } else {
            await mongoose.connect(DATABASE_URL);
            logger.info(`Successfully connected to MongoDB Atlas cloud database!`);
        }

    } catch(error){
        logger.error(`Error connecting to MongoDB Atlas cluster! : ${error}`);
        process.exit(1);
    }
};

connectToDB();

//  ************    For connecting to local MongoDB server  ************
// const connectToLocalDB = async () => {
//     try {
//         if(!process.env.LOCAL_DATABASE_URL || !LOCAL_DATABASE_URL || LOCAL_DATABASE_URL.length === 0){
//             logger.error(`LOCAL_DATABASE_URL environment variable is either missing or undefined!`);
//         } else {
//             await mongoose.connect(LOCAL_DATABASE_URL);
//             logger.info(`Successfully connected to local MongoDB server!!!`);
//         }

//     } catch(error){
//         logger.error(`Error connecting to local MongoDB server! : ${error}`);
//         process.exit(1);
//     }
// };

// connectToLocalDB();



// ******    set up the server     ******
let server;
server = app.listen(Number(PORT), "0.0.0.0", () => {
    logger.info(`server is listening on port ${PORT}!!!`);
});

//*****     handle server errors    *****

interface ServerError extends Error {
    error: string | number;
};

const closeServer = () => {
    if(server) {
        logger.info('Server closed.');
        process.exit(1)  // kill server. Exiting with "1" means there was some sort of problem. Exiting with 0 means no issues occurred
    } else {
        process.exit(1)
    }
};

const unexpectedErrorHandler = (error: ServerError) => {
    logger.error(error);
    closeServer();
};

//handle uncaughtExceptipn + unhandledRejection errors
process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

//SIGTERM
//SIGTERM (signal 15) is used in Linux to terminate a process gracefully
//.on is an event listener. Here we are just saying if we receive a sigterm and the server is currently running, then just close it
process.on("SIGTERM", () => {
    if(server) {
        logger.info("Server closed.");
        process.exit(1);
    }
});
//***END*** handle server errors  ***END***