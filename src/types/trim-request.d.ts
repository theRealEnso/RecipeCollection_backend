declare module "trim-request" {
    import { Request, Response, NextFunction } from "express";

    type Middleware = (req: Request, res: Response, next: NextFunction) => void;

    const trimRequest: {
        all: Middleware,
        body: Middleware,
        query: Middleware,
        params: Middleware,
    }

    export = trimRequest;
};