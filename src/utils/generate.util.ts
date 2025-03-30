import db from "../libs/prisma.lib";

export const GenerateUniqueUsername = async (email: string): Promise<string> => {
    let baseUsername = email.split("@")[0]; 
    let username = baseUsername;
    let counter = 1;

    while (await db.users.findUnique({ where: { username } })) {
        username = `${baseUsername}${counter}`; 
        counter++;
    }

    return username;
};