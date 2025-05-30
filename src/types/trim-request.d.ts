declare module "trim-request" {
    import { Request, Response, NextFunction } from "express";

    const Middleware = (req: Request, res: Response, next: NextFunction) => void;

    const trimRequest: {
        all: Middleware,
        body: Middleware,
        query: Middleware,
        params: Middleware,
    }

    export = trimRequest;
};