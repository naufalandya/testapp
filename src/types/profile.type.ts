import { Request } from "express";

export type SetupProfileType = {
    fullname: string;
    phone_number?: string | null;
    birth_date?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    gender?: "male" | "female" | "other" | null;
    school?: string | null;
    class?: string | null;
    graduation_year?: number | null;
};

export interface CustomRequest extends Request {
    file?: Express.Multer.File;
  
}
