import { GlobalResponse, InternalServerErrorResponse } from "../../model/response.model";
import { type Request, type Response } from "express";
import { authValidate } from "../../validations";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import db from "../../libs/prisma.lib";

export const login = async (req: Request, res: Response) => {
    try {
        const { value, error } = authValidate.Login.validate(req.body);
        if (error) {
            return GlobalResponse(res, true, 400, error.details[0].message, {});
        }

        const { identifier, password } = value;

        const user = await db.users.findFirst({
            where: {
                OR: [{ email: identifier }, { username: identifier }]
            },
            include: {
                profiles: true
            }
        });

        if (!user) {
            return GlobalResponse(res, true, 401, "Invalid email/username or password", {});
        }

        const passwordMatch = await argon2.verify(user.password as string, password);
        if (!passwordMatch) {
            return GlobalResponse(res, true, 401, "Invalid email/username or password", {});
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, username: user.username },
            process.env.JWT_SECRET as string,
            { expiresIn: "7d" }
        );

        return GlobalResponse(res, false, 200, "Login successful", {
            id: user.id,
            email: user.email,
            username: user.username,
            fullName: user.profiles?.fullname,
            token
        });

    } catch (err) {
        return InternalServerErrorResponse(req, res, err as Error);
    }
};