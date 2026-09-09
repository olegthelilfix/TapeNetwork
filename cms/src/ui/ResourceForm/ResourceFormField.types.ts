import type { MediaUploadHandler } from "@/ui/MediaField";
import type { ListVideos, UploadVideo } from "@/ui/StreamVideoField";

import type { ResourceField } from "./ResourceField";

export type ResourceFormFieldProps = {
    field: Exclude<ResourceField, { type: "reference" }>;
    isUploadingMedia: boolean;
    onUploadMedia: MediaUploadHandler;
    listVideos: ListVideos;
    uploadVideo: UploadVideo;
};
