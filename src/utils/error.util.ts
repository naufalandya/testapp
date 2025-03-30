import db from "../libs/prisma.lib"; 
import { Request } from "express"; 

export const logErrorToDatabase = async (req: Request, error: Error, userId?: string) => {
    try {
        await db.error_log.create({
            data: {
                feature_name: req.originalUrl,
                process_id: process.pid.toString(),
                user_id: userId || null, 
                error: error.name, 
                error_message: error.message, 
                error_stack: error.stack || null,
            },
        });
    } catch (dbError) {
        console.error("Failed to log error to database:", dbError);
    }
};
