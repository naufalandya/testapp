import { type Request, type Response } from "express";
import { UserRequest } from "../types/auth.type";
import { utils } from "../utils";

export const GlobalResponse = (res : Response, error : boolean, code : number, message : string, data : object) => {
    res
    .status(code)
    .json({ 
        error : error || false,
        code : code || 200,
        message : message || "Success",
        data : data || {}
    });
}

export const InternalServerErrorResponse = async (req: Request, res: Response, error: Error) => {
    console.error("Unexpected Error:", error);

    const userId = (req as UserRequest)?.user ? (req as UserRequest).user.id.toString() : undefined;

    utils.error.logErrorToDatabase(req, error, userId);

    const isDevelopment = process.env.ENVIRONMENT === "DEVELOPMENT";

    res.status(500).json({
        error: true,
        code: 500,
        message: isDevelopment ? error.message : "Internal Server Error",
        data: {},
    });
};