import type { FC } from "react";

import { List, useTable } from "@refinedev/antd";
import { useDelete, useNavigation } from "@refinedev/core";

import { type ResourceRecord, ResourceTable } from "@/ui/ResourceTable";

import type { ResourceListFeatureProps } from "./ResourceList.types";

export const ResourceListFeature: FC<ResourceListFeatureProps> = ({ definition }) => {
  const { tableProps, tableQuery } = useTable<ResourceRecord>({ syncWithLocation: true });
  const { create, edit } = useNavigation();
  const { mutate: deleteRecord } = useDelete();

  const handleCreate = (): void => {
    create(definition.name);
  };

  const handleEdit = (id: number): void => {
    edit(definition.name, id);
  };

  const handleDelete = (id: number): void => {
    deleteRecord(
      { resource: definition.name, id },
      { onSuccess: () => { void tableQuery.refetch(); } },
    );
  };

  return (
    <List createButtonProps={{ onClick: handleCreate }}>
      <ResourceTable fields={definition.fields} tableProps={tableProps} onEdit={handleEdit} onDelete={handleDelete} />
    </List>
  );
};
