import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { GlobalResponse, InternalServerErrorResponse } from "../../model/response.model";
import db from "../../libs/prisma.lib";

export const searchChaptersByTitle = async (req: Request, res: Response) => {
    try {
        const { page = "1", limit = "10", title = "" } = req.query;

        const pageNum = Math.max(1, parseInt(page as string, 10));
        const limitNum = Math.max(1, parseInt(limit as string, 10));
        const offset = (pageNum - 1) * limitNum;

        const chapters = await db.$queryRaw<{ id: number; title: string; description: string | null }[]>(Prisma.sql`
            SELECT id, title, description
            FROM chapter
            WHERE title ILIKE ${"%" + title + "%"}
            ORDER BY title ASC
            LIMIT ${limitNum} OFFSET ${offset};
        `);

        return GlobalResponse(res, false, 200, "Chapters retrieved successfully", {
            pagination: { page: pageNum, limit: limitNum },
            data: chapters,
        });

    } catch (error) {
        console.error("Search Chapters Error:", error);
        return InternalServerErrorResponse(req, res, error as Error);
    }
};

export const searchTopicsByTitle = async (req: Request, res: Response) => {
    try {
        const { page = "1", limit = "10", title = "" } = req.query;

        const pageNum = Math.max(1, parseInt(page as string, 10));
        const limitNum = Math.max(1, parseInt(limit as string, 10));
        const offset = (pageNum - 1) * limitNum;

        const topics = await db.$queryRaw<{ id: number; title: string; description: string | null }[]>(Prisma.sql`
            SELECT id, title, description
            FROM topics
            WHERE title ILIKE ${"%" + title + "%"}
            ORDER BY title ASC
            LIMIT ${limitNum} OFFSET ${offset};
        `);

        return GlobalResponse(res, false, 200, "Topics retrieved successfully", {
            pagination: { page: pageNum, limit: limitNum },
            data: topics,
        });

    } catch (error) {
        console.error("Search Topics Error:", error);
        return InternalServerErrorResponse(req, res, error as Error);
    }
};


export const searchDifficultiesByTitle = async (req: Request, res: Response) => {
    try {
        const { page = "1", limit = "10", title = "" } = req.query;

        const pageNum = Math.max(1, parseInt(page as string, 10));
        const limitNum = Math.max(1, parseInt(limit as string, 10));
        const offset = (pageNum - 1) * limitNum;

        const difficulties = await db.$queryRaw<{ id: number; title: string; description: string | null }[]>(Prisma.sql`
            SELECT id, title, description
            FROM difficulty
            WHERE title ILIKE ${"%" + title + "%"}
            ORDER BY title ASC
            LIMIT ${limitNum} OFFSET ${offset};
        `);

        return GlobalResponse(res, false, 200, "Difficulties retrieved successfully", {
            pagination: { page: pageNum, limit: limitNum },
            data: difficulties,
        });

    } catch (error) {
        console.error("Search Difficulties Error:", error);
        return InternalServerErrorResponse(req, res, error as Error);
    }
};

export const searchTypesByTitle = async (req: Request, res: Response) => {
    try {
        const { page = "1", limit = "10", title = "" } = req.query;

        const pageNum = Math.max(1, parseInt(page as string, 10));
        const limitNum = Math.max(1, parseInt(limit as string, 10));
        const offset = (pageNum - 1) * limitNum;

        const types = await db.$queryRaw<{ id: number; title: string; description: string | null }[]>(Prisma.sql`
            SELECT id, title, description
            FROM type
            WHERE title ILIKE ${"%" + title + "%"}
            ORDER BY title ASC
            LIMIT ${limitNum} OFFSET ${offset};
        `);

        return GlobalResponse(res, false, 200, "Types retrieved successfully", {
            pagination: { page: pageNum, limit: limitNum },
            data: types,
        });

    } catch (error) {
        console.error("Search Types Error:", error);
        return InternalServerErrorResponse(req, res, error as Error);
    }
};

