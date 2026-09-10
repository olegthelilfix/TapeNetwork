import type { FC } from "react";

import { useSelect } from "@refinedev/antd";
import { Select } from "antd";

import { toSecurityIds } from "@/utils/videoMetadata";

type MultiReferenceSelectProps = {
  refResource: string;
  optionLabel: string;
  placeholder: string;
  value?: unknown;
  onChange?: (value: number[]) => void;
};

export const MultiReferenceSelect: FC<MultiReferenceSelectProps> = ({
  refResource,
  optionLabel,
  placeholder,
  value,
  onChange,
}) => {
  const { selectProps } = useSelect<{ id: number } & Record<string, string | number | boolean | null>>({
    resource: refResource,
    optionLabel: (item) => String(item[optionLabel] ?? item.id),
  });

  const { options, loading } = selectProps;

  return (
    <Select<number[]>
      options={options}
      loading={loading}
      mode="multiple"
      allowClear
      placeholder={placeholder}
      value={toSecurityIds(value)}
      onChange={(next) => onChange?.(toSecurityIds(next))}
      filterOption={(input, option) => String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
    />
  );
};
