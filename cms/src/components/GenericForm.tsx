import { Create, Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, InputNumber, Switch, Select, DatePicker, Button, Space, Divider } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Field, ResourceDef } from "../fields";
import { MediaUploadField } from "./MediaUploadField";

function ReferenceItem({ field }: { field: Field }) {
  const { selectProps } = useSelect({
    resource: field.refResource ?? "shows",
    optionLabel: (field.optionLabel ?? "name") as never,
    optionValue: "id" as never,
  });
  return (
    <Form.Item
      label={field.label}
      name={field.name}
      rules={field.required ? [{ required: true }] : undefined}
    >
      <Select {...selectProps} allowClear placeholder={`Select ${field.label.toLowerCase()}`} />
    </Form.Item>
  );
}

function FieldItem({ field }: { field: Field }) {
  const rules = field.required ? [{ required: true }] : undefined;
  switch (field.type) {
    case "reference":
      return <ReferenceItem field={field} />;
    case "textarea":
      return (
        <Form.Item label={field.label} name={field.name} rules={rules}>
          <Input.TextArea rows={3} />
        </Form.Item>
      );
    case "number":
      return (
        <Form.Item label={field.label} name={field.name} rules={rules}>
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
      );
    case "boolean":
      return (
        <Form.Item label={field.label} name={field.name} valuePropName="checked">
          <Switch />
        </Form.Item>
      );
    case "select":
      return (
        <Form.Item label={field.label} name={field.name} rules={rules}>
          <Select allowClear options={field.options} />
        </Form.Item>
      );
    case "tags":
      return (
        <Form.Item label={field.label} name={field.name}>
          <Select mode="tags" tokenSeparators={[","]} placeholder="Add tags" />
        </Form.Item>
      );
    case "media":
      return (
        <Form.Item label={field.label} name={field.name}>
          <MediaUploadField />
        </Form.Item>
      );
    case "datetime":
      return (
        <Form.Item
          label={field.label}
          name={field.name}
          getValueProps={(v) => ({ value: v ? dayjs(v) : undefined })}
        >
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>
      );
    case "stringArray":
      return (
        <>
          <Divider orientation="left">{field.label}</Divider>
          <Form.List name={field.name}>
            {(items, { add, remove }) => (
              <>
                {items.map((item) => (
                  <Space key={item.key} align="baseline" style={{ display: "flex", marginBottom: 8 }}>
                    <Form.Item {...item} style={{ flex: 1, marginBottom: 0, minWidth: 520 }}>
                      <Input.TextArea rows={2} placeholder="Paragraph" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(item.name)} />
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                  Add paragraph
                </Button>
              </>
            )}
          </Form.List>
        </>
      );
    default:
      return (
        <Form.Item label={field.label} name={field.name} rules={rules}>
          <Input />
        </Form.Item>
      );
  }
}

export function GenericForm({ def, action }: { def: ResourceDef; action: "create" | "edit" }) {
  const { formProps, saveButtonProps } = useForm();

  const datetimeFields = def.fields.filter((f) => f.type === "datetime").map((f) => f.name);
  const onFinish = (values: Record<string, unknown>) => {
    const out = { ...values };
    for (const k of datetimeFields) {
      const v = out[k];
      if (v && dayjs.isDayjs(v)) out[k] = (v as dayjs.Dayjs).toISOString();
    }
    return formProps.onFinish?.(out);
  };

  const Wrapper = action === "create" ? Create : Edit;
  return (
    <Wrapper saveButtonProps={saveButtonProps}>
      <Form {...formProps} onFinish={onFinish} layout="vertical">
        {def.fields.map((f) => (
          <FieldItem key={f.name} field={f} />
        ))}
      </Form>
    </Wrapper>
  );
}
