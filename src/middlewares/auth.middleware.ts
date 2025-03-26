import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRequest } from "../types/auth.type";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { token: string; id: string; role: string; project_assigned_id: string; username: string; };
        (req as unknown as UserRequest).user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid token" });
    }
};
