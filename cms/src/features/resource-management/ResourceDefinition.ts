import type { ResourceField } from "@/ui/ResourceForm";

export type ResourceName =
    | "shows"
    | "episodes"
    | "hosts"
    | "categories"
    | "subcategories"
    | "videos"
    | "authors"
    | "articles"
    | "schedule"
    | "ticker"
    | "home-blocks"
    | "media";

export type ResourceDefinition = {
    name: ResourceName;
    label: string;
    fields: readonly ResourceField[];
};
