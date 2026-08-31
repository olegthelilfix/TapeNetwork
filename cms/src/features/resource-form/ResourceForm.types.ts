import type { ResourceDefinition } from "@/features/resource-management";
import type { UploadMedia } from "@/features/media-upload";

export type ResourceFormAction = "create" | "edit";

export type ResourceFormFeatureProps = {
    definition: ResourceDefinition;
    action: ResourceFormAction;
    uploadMedia: UploadMedia;
};
