import type { UploadMedia } from "@/features/media-upload";
import type { ListVideos, UploadVideo } from "@/ui/StreamVideoField";

export type AppRoutesProps = {
    uploadMedia: UploadMedia;
    listVideos: ListVideos;
    uploadVideo: UploadVideo;
};
