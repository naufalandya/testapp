import path from "path";

import { imagekit } from "../libs/imagekit.lib";

export const UploadProfilePicture = async (fileBase64 : string, filename : string) => {
        const fileBase64WithPrefix = `data:image/png;base64,${fileBase64}`;
    
        const uploadResponse = await imagekit.upload({
            fileName: `${Date.now()}${path.extname(filename)}`,
            file: fileBase64WithPrefix,
        });

        return uploadResponse.url
}

export const deleteOldProfilePicture = async (profilePictureUrl: string) => {
        if (!profilePictureUrl) return;

        const fileName = profilePictureUrl.split("/").pop(); 

        const fileList = await imagekit.listFiles({
            searchQuery: `name="${fileName}"`,
        });

        const file = fileList.find((f) => "fileId" in f) as { fileId: string } | undefined;

        if (file) {
            await imagekit.deleteFile(file.fileId);
            console.log("Old profile picture deleted:", file.fileId);
        } else {
            console.log("Old profile picture not found in ImageKit.");
        }
};
