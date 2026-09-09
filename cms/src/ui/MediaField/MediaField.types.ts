import type { EntityId } from "@/domain/shared";

export type MediaUploadHandler = (file: File) => Promise<EntityId>;

export type MediaFieldProps = {
    value?: EntityId | null;
    onChange?: (id: EntityId | null) => void;
    isUploading: boolean;
    onUpload: MediaUploadHandler;
};
