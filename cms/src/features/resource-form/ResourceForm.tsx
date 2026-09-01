import type { FC } from "react";

import { Create, Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, message, Select } from "antd";

import { useMediaUpload } from "@/features/media-upload";
import type { ReferenceField, ResourceField } from "@/ui/ResourceForm";
import { type FormValues, ResourceForm as ResourceFormView, ResourceFormField } from "@/ui/ResourceForm";

import type { ResourceFormFeatureProps } from "./ResourceForm.types";

import { serializeDateTimeFields } from "@/utils/date";

const ReferenceFieldItem: FC<{ field: ReferenceField }> = ({ field }) => {
    const { selectProps } = useSelect<{ id: number } & Record<string, string | number | boolean | null>>({
        resource: field.refResource,
        optionLabel: (item) => String(item[field.optionLabel] ?? item.id),
    });

    return (
        <Form.Item label={field.label} name={field.name} rules={field.required ? [{ required: true }] : undefined}>
            <Select {...selectProps} allowClear placeholder={`Select ${field.label.toLowerCase()}`} />
        </Form.Item>
    );
};

export const ResourceFormFeature: FC<ResourceFormFeatureProps> = ({ definition, action, uploadMedia }) => {
    const { formProps, saveButtonProps } = useForm();
    const { isUploading, upload } = useMediaUpload(uploadMedia, () => {
        message.error("Upload failed");
    });
    const dateTimeFieldNames = definition.fields
        .filter((field) => field.type === "datetime")
        .map((field) => field.name);

    const handleFinish = (values: FormValues): void | Promise<void> => {
        const serializedValues = serializeDateTimeFields(values, dateTimeFieldNames);
        return formProps.onFinish?.(serializedValues);
    };

    const renderField = (field: ResourceField) => {
        return field.type === "reference"
            ? <ReferenceFieldItem field={field} />
            : <ResourceFormField field={field} isUploadingMedia={isUploading} onUploadMedia={upload} />;
    };

    const FormWrapper = action === "create" ? Create : Edit;

    return (
        <FormWrapper saveButtonProps={saveButtonProps}>
            <ResourceFormView fields={definition.fields} formProps={formProps} onFinish={handleFinish} renderField={renderField} />
        </FormWrapper>
    );
};
