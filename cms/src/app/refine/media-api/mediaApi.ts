import type { EntityId } from "@/domain/shared";
import { apiClient } from "../data-provider";

type UploadMediaResponse = {
    id: EntityId;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === "object" && value !== null;
};

const isUploadMediaResponse = (value: unknown): value is UploadMediaResponse => {
    return isRecord(value) && typeof value.id === "number";
};

export const uploadMedia = async (file: File): Promise<EntityId> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<unknown>("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    if (!isUploadMediaResponse(response.data)) {
        throw new Error("The media upload response does not contain a numeric id.");
    }

    return response.data.id;
};
