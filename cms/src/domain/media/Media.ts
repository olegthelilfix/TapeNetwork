import type { EntityId } from "@/domain/shared";
import type { MediaKind } from "./MediaKind";

export type Media = {
    id: EntityId;
    filename: string;
    url: string;
    kind: MediaKind;
    mime: string | null;
    width: number | null;
    height: number | null;
};
