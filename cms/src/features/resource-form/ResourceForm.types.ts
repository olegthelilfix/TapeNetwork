import type { UploadMedia } from "@/features/media-upload";
import type { ResourceDefinition } from "@/features/resource-management";

export type ResourceFormAction = "create" | "edit";

export type ResourceFormFeatureProps = {
    definition: ResourceDefinition;
    action: ResourceFormAction;
    uploadMedia: UploadMedia;
};
