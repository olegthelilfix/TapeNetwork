import type { ResourceProps } from "@refinedev/core";
import { resourceDefs } from "./fields";

// Refine resources are derived from the field config; paths match the Spring admin API.
export const resources: ResourceProps[] = resourceDefs.map((r) => ({
  name: r.name,
  list: `/${r.name}`,
  create: `/${r.name}/create`,
  edit: `/${r.name}/edit/:id`,
  meta: { label: r.label, canDelete: true },
}));
