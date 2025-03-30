import { type Request, type Response } from "express";
import { GlobalResponse, InternalServerErrorResponse } from "../../model/response.model";
import db from "../../libs/prisma.lib";
import { Prisma } from "@prisma/client";
import { ApiResponse, TopicSummary, TagPerformance } from "../../types/global.type";
import { chapterValidate } from "../../validations";
import { UserRequest } from "../../types/auth.type";
import { CreateQuestionType } from "../../types/global.type";
import { utils } from "../../utils";

export const getListChapters = async (req: Request, res: Response) => {
    try {
        const user_id = (req as any).user?.id;

        if (!user_id) {
            return GlobalResponse(res, true, 401, "Unauthorized", {});
        }

        const chapters = await db.chapter.findMany({
            include: {
                chapter_progress: {
                    where: { user_id },
                    select: { is_completed : true },
                },
                topics: {
                    include: {
                        topic_progress: {
                            where: { user_id },
                            select: { is_completed : true },
                        },
                    },
                },
            },
        });

        const formattedChapters = chapters.map((chapter) => {
            const totalSubTopics = chapter.topics.length;
            const completedSubTopics = chapter.topics.filter((subTopic) =>
                subTopic.topic_progress.some((progress) => progress.is_completed)
            ).length;

            return {
                id: chapter.id,
                nama: chapter.title,
                nama_chapter: chapter.description,
                completion_status: chapter.chapter_progress.length > 0 ? chapter.chapter_progress[0].is_completed : false,
                topics_progress: `${completedSubTopics}/${totalSubTopics}`,
            };
        });

        return GlobalResponse(res, false, 200, "List of chapters retrieved successfully", formattedChapters);
    } catch (error) {
        console.error("Get List Chapter Error:", error);
        return InternalServerErrorResponse(req, res, error as Error);
    }
};

export const getListChaptersV2 = async (req: Request, res: Response) => {
    try {
        const user_id = (req as any).user?.id;
        if (!user_id) {
            return GlobalResponse(res, true, 401, "Unauthorized", {});
        }

        // Ambil query params untuk pagination & sorting
        const { page = "1", limit = "10", sort_by = "id", sort_order = "asc" } = req.query;

        // Konversi page & limit ke angka
        const pageNum = Math.max(parseInt(page as string, 10), 1);
        const limitNum = Math.max(parseInt(limit as string, 10), 1);
        const offset = (pageNum - 1) * limitNum;

        const allowedSortColumns = ["id", "nama", "nama_chapter", "completion_status"];

        // Pastikan sortColumn adalah string
        const sortColumn = allowedSortColumns.includes(String(req.query.sort_by)) 
            ? String(req.query.sort_by) 
            : "id";
        
        // Pastikan sortDirection juga aman
        const sortDirection = req.query.sort_order === "desc" ? "DESC" : "ASC";
        
        const chapters = await db.$queryRaw<{ 
            id: number;
            nama: string;
            nama_chapter: string;
            completion_status: boolean;
            total_topics: number;
            completed_topics: number;
        }[]>(Prisma.sql`
            SELECT 
                c.id,
                c.title AS nama,
                c.description AS nama_chapter,
                COALESCE(cp.is_completed, false) AS completion_status,
                COUNT(DISTINCT st.id) AS total_topics,
                COUNT(DISTINCT CASE WHEN stp.is_completed = true THEN stp.id END) AS completed_topics
            FROM chapter c
            LEFT JOIN chapter_progress cp ON cp.chapter_id = c.id AND cp.user_id = ${user_id}
            LEFT JOIN topics st ON st.chapter_id = c.id
            LEFT JOIN topic_progress stp ON stp.topics_id = st.id AND stp.user_id = ${user_id}
            GROUP BY c.id, c.title, c.description, cp.is_completed
            ORDER BY ${Prisma.raw(`"${sortColumn}"`)} ${Prisma.raw(sortDirection)}
            LIMIT ${limitNum} OFFSET ${offset}
        `);
        

        const totalCountResult = await db.$queryRaw<{ total: number }[]>(Prisma.sql`
            SELECT COUNT(*) as total FROM chapter
        `);
        const totalItems = totalCountResult[0]?.total || 0;
        const totalPages = Math.ceil(totalItems / limitNum);

        return GlobalResponse(res, false, 200, "List of chapters retrieved successfully", {
            chapters: chapters.map(chapter => ({
                id: chapter.id,
                nama: chapter.nama,
                nama_chapter: chapter.nama_chapter,
                completion_status: chapter.completion_status,
                topic_progress: `${chapter.completed_topics}/${chapter.total_topics}`,
            })),
            pagination: {
                page: pageNum,
                limit: limitNum,
                total_items: totalItems,
                total_pages: totalPages,
            }
        });

    } catch (error) {
        console.error("Get List Chapter Error:", error);
        return InternalServerErrorResponse(req, res, error as Error);
    }
};



export const getListTopicsByChapter = async (req: Request, res: Response) => {
    try {
        const user_id = (req as any).user?.id;
        const { chapter_id } = req.params;
        let { page = "1", limit = "10", sort_by = "topics_name", sort_order = "asc" } = req.query;

        if (!user_id) return GlobalResponse(res, true, 401, "Unauthorized", {});
        if (!chapter_id) return GlobalResponse(res, true, 400, "Chapter ID is required", {});

        const pageNum = Math.max(1, parseInt(page as string, 10));
        const pageSize = Math.max(1, parseInt(limit as string, 10));
        const offset = (pageNum - 1) * pageSize;

        const validSortColumns = ["topics_name", "total_questions", "total_correct_answers", "avg_time_taken"];
        const sortColumn = validSortColumns.includes(sort_by as string) ? (sort_by as string) : "topics_name";
        const sortOrder = sort_order === "desc" ? "DESC" : "ASC";

        const [topics, totalCount] = await Promise.all([
            db.$queryRaw<TopicSummary[]>(Prisma.sql`
                WITH topic_data AS (
                    SELECT 
                        st.id AS topics_id,
                        st.title AS topics_name,
                        COUNT(DISTINCT q.id) AS total_questions,
                        COALESCE(SUM(CASE WHEN msa.is_correct = true THEN 1 ELSE 0 END), 0) AS total_correct_answers,
                        COALESCE(SUM(CASE WHEN msa.is_correct = false THEN 1 ELSE 0 END), 0) AS total_incorrect_answers,
                        COUNT(DISTINCT stp.id) AS user_progress,
                        COUNT(DISTINCT q.id) - COUNT(DISTINCT CASE WHEN msa.is_correct = true THEN msa.id END) AS topics_user_struggles_with,
                        COALESCE(AVG(msa.time_taken), 0) AS avg_time_taken,
                        COUNT(DISTINCT CASE WHEN msa.time_taken <= q.time_limit THEN msa.id END) AS questions_completed_within_time,
                        COUNT(DISTINCT CASE WHEN msa.time_taken > q.time_limit THEN msa.id END) AS questions_exceeded_time_limit
                    FROM topics st
                    LEFT JOIN questions q ON q.subtopic_id = st.id
                    LEFT JOIN multiple_student_answers_abcd msa ON msa.question_id = q.id 
                        AND msa.is_correct IS NOT NULL 
                        AND msa.selected_answer IS NOT NULL
                    LEFT JOIN topics_progress stp ON stp.topics_id = st.id 
                        AND stp.user_id = ${user_id}
                    WHERE st.chapter_id = ${chapter_id}
                    GROUP BY st.id, st.title
                )
                SELECT * FROM topic_data
                ORDER BY ${Prisma.raw(`"${sortColumn}"`)} ${Prisma.raw(sortOrder)}
                LIMIT ${pageSize} OFFSET ${offset};
            `),

            db.$queryRaw<{ total: number }[]>(Prisma.sql`
                SELECT COUNT(*) AS total FROM topics WHERE chapter_id = ${chapter_id};
            `)
        ]);

        const totalItems = totalCount[0]?.total || 0;
        const totalPages = Math.ceil(totalItems / pageSize);

        return GlobalResponse(res, false, 200, "List of topics retrieved successfully", {
            topics,
            pagination: {
                page: pageNum,
                limit: pageSize,
                total_items: totalItems,
                total_pages: totalPages,
            },
        });

    } catch (error) {
        console.error("Get List Topics Error:", error);
        return InternalServerErrorResponse(req, res, error as Error);
    }
};


export const createChapter = async (req: Request, res: Response) => {
    try {
        const { error, value } = chapterValidate.createChapterSchema.validate(req.body);
        if (error) {
            return GlobalResponse(res, true, 400, error.details[0].message, {});
        }

        const { title, description } = value;
        const userId = (req as UserRequest).user?.id; 

        const newChapter = await db.chapter.create({
            data: {
                title,
                description,
                created_by: userId,
                updated_by: userId,
                user_id: userId,
            },
        });

        return GlobalResponse(res, false, 201, "Chapter successfully created", newChapter);

    } catch (error) {
        return InternalServerErrorResponse(req, res, error as Error);
    }
};


export const createTopic = async (req: Request, res: Response) => {
    try {
        const { error, value } = chapterValidate.createTopicSchema.validate(req.body);
        if (error) {
            return GlobalResponse(res, true, 400, error.details[0].message, {});
        }

        const { title, description, chapter_id } = value;
        const userId = (req as UserRequest).user?.id;

        const chapterExists = await db.chapter.findUnique({ where: { id: chapter_id } });
        if (!chapterExists) {
            return GlobalResponse(res, true, 404, "Chapter not found", {});
        }

        const newTopic = await db.topics.create({
            data: {
                title,
                description,
                chapter_id,
                created_by: userId,
                updated_by: userId,
            },
        });

        return GlobalResponse(res, false, 201, "Topic successfully created", newTopic);

    } catch (error) {
        return InternalServerErrorResponse(req, res, error as Error);
    }
};

export const createQuestion = async (req: Request, res: Response) => {
    try {
        const { error, value } = chapterValidate.createQuestionSchema.validate(req.body);
        if (error) {
            return GlobalResponse(res, true, 400, error.details[0].message, {});
        }
        const { title, description, question, subtopic_id, difficulty_id, explanation, time_limit, type_id, tag_id, is_active } = value as CreateQuestionType;
        const userId = (req as UserRequest).user?.id;

        const subtopicExists = await db.topics.findUnique({ where: { id: subtopic_id } });
        if (!subtopicExists) {
            return GlobalResponse(res, true, 404, "Topic not found", {});
        }

        const difficultyExists = await db.difficulty.findUnique({ where: { id: difficulty_id } });
        if (!difficultyExists) {
            return GlobalResponse(res, true, 404, "Difficulty level not found", {});
        }

        const typeExists = await db.type.findUnique({ where: { id: type_id } });
        if (!typeExists) {
            return GlobalResponse(res, true, 404, "Question type not found", {});
        }

        let explanation_image
        if(req.file){
            try {
                const fileBase64 = req.file.buffer.toString("base64");
                const originalname = req.file.originalname;
    
                explanation_image = await utils.file.UploadProfilePicture(fileBase64, originalname);
            } catch (err) {
                console.error("Profile Picture Upload Error:", err);
                return GlobalResponse(res, true, 400, "Failed to upload profile picture", {});
            }
        }


        const newQuestion = await db.questions.create({
            data: {
                title,
                description,
                question,
                subtopic_id,
                difficulty_id,
                explanation,
                explanation_image,
                time_limit,
                type_id,
                tag_id,
                is_active,
                created_by: userId,
                updated_by: userId,
            },
        });

        return GlobalResponse(res, false, 201, "Question successfully created", newQuestion);

    } catch (error) {
        return InternalServerErrorResponse(req, res, error as Error);
    }
};