import { type Request, type Response, Router } from "express";
import { GlobalResponse } from "../model/response.model";

const router = Router();

router.get("/", async function(req: Request, res: Response): Promise<void> {
    let a = 2;

    return GlobalResponse(res, 200, false, 200, "Success", { a });
});


export default router;
