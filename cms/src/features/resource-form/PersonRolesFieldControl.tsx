import type { FC } from "react";

import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useSelect } from "@refinedev/antd";
import { Button, Select, Space } from "antd";

import type { PersonRole, PersonRoleRow } from "@/utils/videoMetadata";
import { toPersonRoleRows } from "@/utils/videoMetadata";

type PersonRolesFieldControlProps = {
  refResource: string;
  optionLabel: string;
  value?: unknown;
  onChange?: (value: PersonRoleRow[]) => void;
};

const roleOptions: { label: string; value: PersonRole }[] = [
  { label: "Host", value: "host" },
  { label: "Guest", value: "guest" },
];

export const PersonRolesFieldControl: FC<PersonRolesFieldControlProps> = ({
  refResource,
  optionLabel,
  value,
  onChange,
}) => {
  const rows = toPersonRoleRows(value);
  const { selectProps } = useSelect<{ id: number } & Record<string, string | number | boolean | null>>({
    resource: refResource,
    optionLabel: (item) => String(item[optionLabel] ?? item.id),
  });

  const { options: personOptions, loading: personLoading } = selectProps;

  const update = (next: PersonRoleRow[]): void => {
    onChange?.(next);
  };

  const setRow = (index: number, patch: Partial<PersonRoleRow>): void => {
    update(rows.map((row, current) => (current === index ? { ...row, ...patch } : row)));
  };

  const addRow = (): void => {
    update([...rows, { personId: null, role: "guest" }]);
  };

  const removeRow = (index: number): void => {
    update(rows.filter((_, current) => current !== index));
  };

  return (
    <>
      {rows.map((row, index) => (
        <Space key={index} align="baseline" style={{ display: "flex", marginBottom: 8 }}>
          <Select<number>
            options={personOptions}
            loading={personLoading}
            allowClear
            showSearch
            style={{ minWidth: 240 }}
            placeholder="Select person"
            filterOption={(input, option) => String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
            value={row.personId ?? undefined}
            onChange={(personId) => setRow(index, { personId: typeof personId === "number" ? personId : null })}
          />
          <Select
            options={roleOptions}
            style={{ minWidth: 120 }}
            value={row.role}
            onChange={(role: PersonRole) => setRow(index, { role })}
          />
          <MinusCircleOutlined onClick={() => removeRow(index)} />
        </Space>
      ))}
      <Button type="dashed" onClick={addRow} icon={<PlusOutlined />} block>Add person</Button>
    </>
  );
};
