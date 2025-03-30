import { Request, Response } from "express";
import { UserRequest } from "../../types/auth.type";
import { SetupProfileType } from "../../types/profile.type";

import db from "../../libs/prisma.lib";
import { GlobalResponse, InternalServerErrorResponse } from "../../model/response.model";
import Joi from "joi";
import { profileValidate } from "../../validations";
import path from "path";
import { imagekit } from "../../libs/imagekit.lib";
import { utils } from "../../utils";


export const getUserProfileLogin = async (req: Request, res: Response) => {
    try {
        const user_id = (req as UserRequest)?.user?.id;

        if (!user_id) {
            return GlobalResponse(res, true, 400, "User ID is required", {});
        }

        const userProfile = await db.users.findUnique({
            where: { id: user_id },
            select: {
                username: true,
                email: true,
                profiles: {
                    select: {
                        fullname: true,
                        profile_picture: true,
                    }
                }
            }
        });

        if (!userProfile) {
            return GlobalResponse(res, true, 404, "User not found", {});
        }

        return GlobalResponse(res, false, 200, "User profile retrieved successfully", {
            username: userProfile.username,
            email: userProfile.email,
            fullName: userProfile.profiles?.fullname || "",
            profilePicture: userProfile.profiles?.profile_picture || "",
        });

    } catch (error) {
        console.error("Get User Profile Error:", error);
        return InternalServerErrorResponse(req, res, error as Error);
    }
};

export const getUserProfileLoginDetail = async (req: Request, res: Response) => {
    try {
        const user_id = (req as UserRequest)?.user?.id;

        if (!user_id) {
            return GlobalResponse(res, true, 400, "User ID is required", {});
        }

        const userProfile = await db.users.findUnique({
            where: { id: user_id },
            select: {
                username: true,
                email: true,
                profiles: {
                    select: {
                        fullname: true,
                        phone_number: true,
                        birth_date: true,
                        address: true,
                        city: true,
                        country: true,
                        gender: true,
                        profile_picture: true,
                        school: true,
                        class: true,
                        graduation_year: true,
                        created_at: true,
                        updated_at: true,
                        created_by: true,
                        updated_by: true,
                    }
                }
            }
        });

        if (!userProfile) {
            return GlobalResponse(res, true, 404, "User not found", {});
        }

        return GlobalResponse(res, false, 200, "User profile retrieved successfully", {
            username: userProfile.username,
            email: userProfile.email,
            fullName: userProfile.profiles?.fullname || "",
            phoneNumber: userProfile.profiles?.phone_number || "",
            birthDate: userProfile.profiles?.birth_date || null,
            address: userProfile.profiles?.address || "",
            city: userProfile.profiles?.city || "",
            country: userProfile.profiles?.country || "",
            gender: userProfile.profiles?.gender || "",
            profilePicture: userProfile.profiles?.profile_picture || "",
            school: userProfile.profiles?.school || "",
            class: userProfile.profiles?.class || "",
            graduationYear: userProfile.profiles?.graduation_year || null,
            createdAt: userProfile.profiles?.created_at || null,
            updatedAt: userProfile.profiles?.updated_at || null,
        });

    } catch (error) {
        console.error("Get User Profile Detail Error:", error);
        return InternalServerErrorResponse(req, res, error as Error);
    }
};


export const getUserProfileByUsername = async (req: Request, res: Response) => {
    try {

        const { value, error } = Joi.object({
            username: Joi.string()
                .pattern(/^[a-zA-Z0-9_.]{3,20}$/)
                .min(3)
                .max(20)
                .required()
        }).validate(req.params);

        if (error) {
            return GlobalResponse(res, true, 400, error.details[0].message, {});
        }

        const { username } = value;

        if (!username) {
            return GlobalResponse(res, true, 400, "Username is required", {});
        }

        const userProfile = await db.users.findUnique({
            where: { username },
            select: {
                username: true,
                profiles: {
                    select: {
                        fullname: true,
                        profile_picture: true,
                        city: true,
                        country: true,
                        school: true,
                        class: true,
                        graduation_year: true,
                    }
                }
            }
        });

        if (!userProfile) {
            return GlobalResponse(res, true, 404, "User not found", {});
        }

        return GlobalResponse(res, false, 200, "User profile retrieved successfully", {
            username: userProfile.username,
            fullName: userProfile.profiles?.fullname || "",
            profilePicture: userProfile.profiles?.profile_picture || "",
            city: userProfile.profiles?.city || "",
            country: userProfile.profiles?.country || "",
            school: userProfile.profiles?.school || "",
            class: userProfile.profiles?.class || "",
            graduationYear: userProfile.profiles?.graduation_year || null,
        });

    } catch (error) {
        console.error("Get User Profile by Username Error:", error);
        return InternalServerErrorResponse(req, res, error as Error);
    }
};

export const setupProfile = async (req: Request, res: Response) => {
    try {
        const user_id = (req as any).user?.id;

        if (!user_id) {
            return GlobalResponse(res, true, 401, "Unauthorized", {});
        }

        const { error, value } = profileValidate.setupProfileSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return GlobalResponse(res, true, 400, error.details[0].message, {});
        }

        const existingProfile = await db.profiles.findUnique({
            where: { user_id },
        });

        let profilePicture = existingProfile?.profile_picture || null;

        if (req.file) {
            try {
                const fileBase64 = req.file.buffer.toString("base64");
                const originalname = req.file.originalname;

                profilePicture = await utils.file.UploadProfilePicture(fileBase64, originalname);
            } catch (err) {
                return GlobalResponse(res, true, 400, "failed to upload profile picture", {});
            }
        }

        let userProfile;
        if (existingProfile) {
            userProfile = await db.profiles.update({
                where: { user_id },
                data: {
                    ...value as SetupProfileType,
                    profile_picture: profilePicture,
                    updated_by: user_id,
                },
            });
        } else {
            userProfile = await db.profiles.create({
                data: {
                    user_id,
                    ...value as SetupProfileType,
                    profile_picture: profilePicture,
                    created_by: user_id,
                },
            });
        }

        return GlobalResponse(res, false, 200, "Profile setup successfully", userProfile);
    } catch (error) {
        console.error("Setup Profile Error:", error);
        return InternalServerErrorResponse(req, res, error as Error);
    }
};

export const updateProfilePicture = async (req: Request, res: Response) => {
    try {
        const user_id = (req as any).user?.id;

        if (!user_id) {
            return GlobalResponse(res, true, 401, "Unauthorized", {});
        }

        const existingProfile = await db.profiles.findUnique({
            where: { user_id },
        });

        if (!existingProfile) {
            return GlobalResponse(res, true, 404, "Profile not found", {});
        }

        if (!req.file) {
            return GlobalResponse(res, true, 400, "No file uploaded", {});
        }

        if (existingProfile.profile_picture) {

            try {
                await utils.file.deleteOldProfilePicture(existingProfile.profile_picture);
            } catch (err) {
                return GlobalResponse(res, true, 400, "Failed to upload profile picture", {});
            }
        }
        
        
        let profilePicture: string;
        try {
            const fileBase64 = req.file.buffer.toString("base64");
            const originalname = req.file.originalname;

            profilePicture = await utils.file.UploadProfilePicture(fileBase64, originalname);
        } catch (err) {
            console.error("Profile Picture Upload Error:", err);
            return GlobalResponse(res, true, 400, "Failed to upload profile picture", {});
        }

        const updatedProfile = await db.profiles.update({
            where: { user_id },
            data: {
                profile_picture: profilePicture,
                updated_by: user_id,
            },
        });

        return GlobalResponse(res, false, 200, "Profile picture updated successfully", updatedProfile);
    } catch (error) {
        console.error("Update Profile Picture Error:", error);
        return InternalServerErrorResponse(req, res, error as Error);
    }
};