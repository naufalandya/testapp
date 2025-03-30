import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import admin from "../../libs/firebase.lib";
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
export const googleLogin = async (req: Request, res: Response) => {
  const { token } = req.body;

  try {
      if (!token || typeof token !== "string" || token.trim().length === 0) {
          return GlobalResponse(res, true, 400, "Invalid token", {});
      }

      const decodedToken = await admin.auth().verifyIdToken(token);
      const { email, name, picture, sub } = decodedToken;

      if (!email) {
          return GlobalResponse(res, true, 401, "Invalid Firebase token: Email not found", {});
      }

      let user = await db.users.findUnique({ where: { email }, include: { profiles: true } });

      if (user && user.provider !== "google") {
          return GlobalResponse(res, true, 403, "This email is already registered with a different provider", {});
      }

      if (!user) {
          const uniqueUsername = await utils.generate.GenerateUniqueUsername(email);

          try {
              user = await db.users.create({
                  data: {
                      email,
                      username: uniqueUsername,
                      provider: "google",
                      is_verified: true,
                      is_active: true,
                      sub,
                      profiles: {
                          create: {
                              fullname: name || "",
                              profile_picture: picture || "",
                          },
                      },
                  },
                  include: { profiles: true },
              });
          } catch (dbError) {
              console.error("Database Error (User Creation):", dbError);
              return GlobalResponse(res, true, 500, "Failed to create user", {});
          }
      }

      const encryptedId = utils.general.encryptData(user.id.toString());

      const payload = {
          sub: encryptedId,
          email: user.email,
          username: user.username,
      };

      try {
          const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
          const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

          const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

          await db.refresh_token.deleteMany({ where: { user_id: user.id } });
          await db.refresh_token.create({ data: { user_id: user.id, token: hashedRefreshToken } });

          return GlobalResponse(res, false, 200, "Login successful", {
              id: encryptedId,
              email: user.email,
              username: user.username,
              fullName: user.profiles?.fullname || "",
              profilePicture: user.profiles?.profile_picture || "",
              isVerified: user.is_verified,
              isActive: user.is_active,
              accessToken,
              refreshToken,
          });
      } catch (tokenError) {
          console.error("Token Generation Error:", tokenError);
          return GlobalResponse(res, true, 400, "Failed to generate authentication tokens", {});
      }

  } catch (error) {
      console.error("Google Login Error:", error);
      return InternalServerErrorResponse(req, res, error as Error);
  }
};