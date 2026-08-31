import type { TableProps } from "antd";
import type { ResourceField } from "@/ui/ResourceForm";

export type ResourceRecord = Record<string, unknown> & {
    id: number;
};

export type ResourceTableProps = {
    fields: readonly ResourceField[];
    tableProps: TableProps<ResourceRecord>;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
};
