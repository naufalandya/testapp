import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; 
const IV = process.env.IV;

if (!JWT_SECRET || !ENCRYPTION_KEY || !IV) {
    throw new Error("JWT_SECRET, ENCRYPTION_KEY, or IV is not defined");
}

export const encryptData = (data: string): string => {
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY, "hex"), Buffer.from(IV, "hex"));
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
};

export const decryptData = (encryptedData: string): string => {
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY, "hex"), Buffer.from(IV, "hex"));
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
};
