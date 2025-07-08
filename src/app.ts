import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import morgan from "morgan"; // this package logs to the console information about any and all requests that our server receives (i.e. type of requests, where request was sent, status, time for completion, etc)
import helmet from "helmet"; // this package secures express apps by setting various HTTP headers
import mongoSanitize from "express-mongo-sanitize"; // sanitizes user data to prevent MongoDB operator injections / database manipulation
import cookieParser from "cookie-parser"; // parse cookie headers and populate req.cookies with an object keyed by the cookie names
import compression from "compression"; // compresses response bodies for all incoming requests to reduce data size, allowing for faster processing and response times
import cors from "cors"; // this restricts who can access the server
import fileUpload from "express-fileupload"; // this makes uploaded files accessible from req.files
import createHttpError from "http-errors";
import logger from "./configs/winston-logger";

// import routes
import routes from "./routes/IndexRoutes";

//configure dotenv
dotenv.config();

//create express application
const app = express();

// use morgan
if(process.env.NODE_ENV !== "production"){
    app.use(morgan("dev"));
};

// use helmet
app.use(helmet());

//parse JSON request body
app.use(express.json());

//parse JSON request url
app.use(express.urlencoded({
    extended: true,
}));

//use mongo sanitize to sanitize user data requests to prevent malicious users from manipulating the database
// app.use(mongoSanitize());

// use cookie parser
app.use(cookieParser());

//use compression package to compress data from incoming user requests
app.use(compression());

//file upload
app.use(fileUpload({
    useTempFiles: true,
}));

//use cors 
app.use(cors());

// define our API end points for all of our routes
app.use("/api/v1", routes);

// *** error handling middleware *** //
interface CustomError extends Error {
    status?: number;
};

app.use(async (req: Request, res: Response, next: NextFunction) => {
    next(createHttpError.NotFound("This route does not exist!"));
});

app.use(async (error: CustomError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = error.status || 500;

    res.status(statusCode).json({
        error: {
            status: statusCode,
            message: error.message || "Internal server error!"
        },
    });

    // res.send({
    //     error: {
    //         status: error.status || 500,
    //         message: error.message,
    //     }
    // });
});

export default app;