import { useState } from "react";

import type { MediaUploadHandler } from "@/ui/MediaField";

export type UploadMedia = MediaUploadHandler;

export type MediaUploadState = {
    isUploading: boolean;
    upload: UploadMedia;
};

export const useMediaUpload = (
    uploadMedia: UploadMedia,
    onUploadError: () => void,
): MediaUploadState => {
    const [isUploading, setIsUploading] = useState(false);

    const upload: UploadMedia = async (file) => {
        setIsUploading(true);

        try {
            return await uploadMedia(file);
        } catch (error: unknown) {
            onUploadError();
            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    return { isUploading, upload };
};
