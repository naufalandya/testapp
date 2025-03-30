import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import db from "../../libs/prisma.lib";
import { GlobalResponse, InternalServerErrorResponse } from "../../model/response.model";
import { utils } from "../../utils";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV = process.env.IV;

if (!JWT_SECRET || !ENCRYPTION_KEY || !IV) {
    throw new Error("JWT_SECRET, ENCRYPTION_KEY, or IV is not defined");
}

export const refreshAccessToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    try {
        if (!refreshToken) {
            return GlobalResponse(res, true, 400, "Refresh token is required", {});
        }

        const storedToken = await db.refresh_token.findFirst({
            where: { token: refreshToken },
            include: { user: { include: { profiles: true } } },
        });

        if (!storedToken || !storedToken.user) {
            return GlobalResponse(res, true, 403, "Invalid refresh token", {});
        }

        const isTokenValid = await bcrypt.compare(refreshToken, storedToken.token);
        if (!isTokenValid) {
            return GlobalResponse(res, true, 403, "Invalid refresh token", {});
        }

        const user = storedToken.user;

        const encryptedId = utils.general.encryptData(user.id.toString());

        const payload = {
            sub: encryptedId,
            email: user.email,
            username: user.username,
        };

        const newAccessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
        const newRefreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

        const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);

        await db.refresh_token.deleteMany({ where: { user_id: user.id } });
        await db.refresh_token.create({ data: { user_id: user.id, token: hashedNewRefreshToken } });

        return GlobalResponse(res, false, 200, "Access token refreshed", {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });

    } catch (error) {
        console.error("Refresh Token Error:", error);
        return InternalServerErrorResponse(req, res, error as Error);
    }
};
