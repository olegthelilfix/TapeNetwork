import type { ResourceProps } from "@refinedev/core";
import { resourceDefinitions } from "@/features/resource-management";

export const resources: ResourceProps[] = resourceDefinitions.map((definition) => ({
    name: definition.name,
    list: `/${definition.name}`,
    create: `/${definition.name}/create`,
    edit: `/${definition.name}/edit/:id`,
    meta: { label: definition.label, canDelete: true },
}));
