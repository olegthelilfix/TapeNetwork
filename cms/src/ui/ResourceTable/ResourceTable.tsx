import type { FC, ReactNode } from "react";

import { Button, Popconfirm, Space, Table, Tag, Typography } from "antd";

import type { ResourceField } from "@/ui/ResourceForm";

import type { ResourceRecord, ResourceTableProps } from "./ResourceTable.types";

import css from "./ResourceTable.module.css";

const renderCell = (field: ResourceField, value: unknown): ReactNode => {
  if (field.type === "boolean") {
    return value ? <Tag color="green">yes</Tag> : <Tag>no</Tag>;
  }

  const text = value === null || value === undefined ? "" : String(value);
  return text.length > 80
    ? <Typography.Text className={css["resource-table__truncated-text"]} ellipsis={{ tooltip: text }}>{text}</Typography.Text>
    : text;
};

export const ResourceTable: FC<ResourceTableProps> = ({ fields, tableProps, onEdit, onDelete }) => {
  const listFields = fields.filter((field) => field.inList);

  const handleEdit = (record: ResourceRecord): void => {
    onEdit(record.id);
  };

  const handleDelete = (record: ResourceRecord): void => {
    onDelete(record.id);
  };

  return (
    <Table {...tableProps} rowKey="id" scroll={{ x: true }}>
      <Table.Column<ResourceRecord> dataIndex="id" title="ID" width={64} />
      {listFields.map((field) => (
        <Table.Column<ResourceRecord>
          key={field.name}
          dataIndex={field.name}
          title={field.label}
          render={(value: unknown) => renderCell(field, value)}
        />
      ))}
      <Table.Column<ResourceRecord>
        title="Actions"
        fixed="right"
        render={(_, record) => (
          <Space>
            <Button size="small" onClick={() => handleEdit(record)}>Edit</Button>
            <Popconfirm title="Delete this record?" onConfirm={() => handleDelete(record)}>
              <Button size="small" danger>Delete</Button>
            </Popconfirm>
          </Space>
        )}
      />
    </Table>
  );
};
