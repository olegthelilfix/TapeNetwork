import type { FC } from "react";

import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, DatePicker, Divider, Form, Input, InputNumber, Select, Space, Switch } from "antd";
import dayjs, { type Dayjs } from "dayjs";

import { MediaField } from "@/ui/MediaField";

import type { ResourceFormFieldProps } from "./ResourceFormField.types";

const toDayjsValue = (value: unknown): Dayjs | undefined => {
    if (typeof value === "string" || typeof value === "number" || value instanceof Date || dayjs.isDayjs(value)) {
        return dayjs(value);
    }

    return undefined;
};

export const ResourceFormField: FC<ResourceFormFieldProps> = ({ field, isUploadingMedia, onUploadMedia }) => {
    const rules = field.required ? [{ required: true }] : undefined;

    switch (field.type) {
        case "textarea":
            return <Form.Item label={field.label} name={field.name} rules={rules}><Input.TextArea rows={3} /></Form.Item>;
        case "number":
            return <Form.Item label={field.label} name={field.name} rules={rules}><InputNumber style={{ width: "100%" }} /></Form.Item>;
        case "boolean":
            return <Form.Item label={field.label} name={field.name} valuePropName="checked"><Switch /></Form.Item>;
        case "select":
            return <Form.Item label={field.label} name={field.name} rules={rules}><Select allowClear options={[...field.options]} /></Form.Item>;
        case "tags":
            return <Form.Item label={field.label} name={field.name}><Select mode="tags" tokenSeparators={[","]} placeholder="Add tags" /></Form.Item>;
        case "media":
            return (
                <Form.Item label={field.label} name={field.name}>
                    <MediaField isUploading={isUploadingMedia} onUpload={onUploadMedia} />
                </Form.Item>
            );
        case "datetime":
            return (
                <Form.Item label={field.label} name={field.name} getValueProps={(value: unknown) => ({ value: toDayjsValue(value) })}>
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
                                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>Add paragraph</Button>
                            </>
                        )}
                    </Form.List>
                </>
            );
        default:
            return <Form.Item label={field.label} name={field.name} rules={rules}><Input /></Form.Item>;
    }
};
