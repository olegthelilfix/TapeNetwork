import { List, useTable, EditButton, DeleteButton } from "@refinedev/antd";
import { Table, Space, Tag, Typography } from "antd";
import type { Field, ResourceDef } from "../fields";

function renderCell(field: Field) {
  return (value: unknown) => {
    if (field.type === "boolean") {
      return value ? <Tag color="green">yes</Tag> : <Tag>no</Tag>;
    }
    const text = value == null ? "" : String(value);
    if (text.length > 80) {
      return <Typography.Text ellipsis={{ tooltip: text }} style={{ maxWidth: 320 }}>{text}</Typography.Text>;
    }
    return text;
  };
}

export function GenericList({ def }: { def: ResourceDef }) {
  const { tableProps } = useTable({ syncWithLocation: true });
  const cols = def.fields.filter((f) => f.inList);

  return (
    <List>
      <Table {...tableProps} rowKey="id" scroll={{ x: true }}>
        <Table.Column dataIndex="id" title="ID" width={64} />
        {cols.map((f) => (
          <Table.Column key={f.name} dataIndex={f.name} title={f.label} render={renderCell(f)} />
        ))}
        <Table.Column
          title="Actions"
          fixed="right"
          render={(_, record: { id: number }) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
}
