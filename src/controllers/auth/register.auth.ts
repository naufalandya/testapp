import { GlobalResponse, InternalServerErrorResponse } from "../../model/response.model";
import { type Request, type Response } from "express";
import { authValidate } from "../../validations";
import argon2 from "argon2";
import db from "../../libs/prisma.lib";

export const register = async (req: Request, res: Response) => {
    try {
        const { value, error } = authValidate.Register.validate(req.body);
        if (error) {
            return GlobalResponse(res, true, 400, error.details[0].message, {});
        }

        const { email, username, password, fullName } = value;

        const existingUser = await db.users.findFirst({
            where: {
                OR: [{ email }, { username }]
            }
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return GlobalResponse(res, true, 409, "Email already registered", {});
            }
            if (existingUser.username === username) {
                return GlobalResponse(res, true, 409, "Username already taken", {});
            }
        }

        const hashedPassword = await argon2.hash(password, { type: argon2.argon2id });

        const newUser = await db.users.create({
            data: {
                email,
                username,
                password: hashedPassword
            }
        });

        await db.profiles.create({
            data: {
                user_id: newUser.id,
                fullname: fullName
            }
        });

        return GlobalResponse(res, false, 201, "Registration successful", {
            id: newUser.id,
            email: newUser.email,
            username: newUser.username,
            fullName: fullName
        });

    } catch (err) {
        return InternalServerErrorResponse(req, res, err as Error);
    }
};