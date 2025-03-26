import { type Response } from "express";

export const GlobalResponse = (res : Response, status : number, error : boolean, code : number, message : string, data : object) => {
    res
    .status(status)
    .json({ 
        error : error || false,
        code : code || 200,
        message : message || "Success",
        data : data || {}
    });
}