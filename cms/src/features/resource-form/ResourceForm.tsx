import type { FC } from "react";
import { useEffect, useMemo, useRef } from "react";

import { Create, Edit, useForm, useSelect } from "@refinedev/antd";
import { useApiUrl, useCustom, useCustomMutation, useResource } from "@refinedev/core";
import { Form, message, Select } from "antd";

import { useMediaUpload } from "@/features/media-upload";
import type { MultiReferenceField, PersonRolesField, ReferenceField, ResourceField } from "@/ui/ResourceForm";
import { type FormValues, ResourceForm as ResourceFormView, ResourceFormField } from "@/ui/ResourceForm";

import { MultiReferenceSelect } from "./MultiReferenceSelect";
import { PersonRolesFieldControl } from "./PersonRolesFieldControl";
import type { ResourceFormFeatureProps } from "./ResourceForm.types";

import { serializeDateTimeFields } from "@/utils/date";
import type { PersonRoleRow } from "@/utils/videoMetadata";
import { toPersonRolePayload, toPersonRoleRows, toSecurityIds } from "@/utils/videoMetadata";

const isVideoAttachField = (field: ResourceField): field is MultiReferenceField | PersonRolesField => {
  return field.type === "multiReference" || field.type === "personRoles";
};

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
  const { formProps, saveButtonProps, form } = useForm();
  const { id } = useResource();
  const apiUrl = useApiUrl();
  const { mutateAsync: putMetadata } = useCustomMutation();

  const { isUploading, upload } = useMediaUpload(uploadMedia, () => {
    message.error("Upload failed");
  });

  const attachFields = useMemo(() => definition.fields.filter(isVideoAttachField), [definition.fields]);
  const hasAttachFields = attachFields.length > 0;
  const videoId = action === "edit" ? id : undefined;

  const { data: securitiesData } = useCustom<number[]>({
    url: `${apiUrl}/videos/${videoId}/securities`,
    method: "get",
    queryOptions: { enabled: hasAttachFields && videoId !== undefined },
  });

  const { data: peopleData } = useCustom<{ personId: number; role: string }[]>({
    url: `${apiUrl}/videos/${videoId}/people`,
    method: "get",
    queryOptions: { enabled: hasAttachFields && videoId !== undefined },
  });

  const seededRef = useRef(false);

  useEffect(() => {
    if (!hasAttachFields || videoId === undefined || seededRef.current) {
      return;
    }

    if (securitiesData === undefined || peopleData === undefined) {
      return;
    }

    const seed: Record<string, unknown> = {};

    for (const field of attachFields) {
      if (field.type === "multiReference") {
        seed[field.name] = toSecurityIds(securitiesData.data);
      } else {
        seed[field.name] = toPersonRoleRows(peopleData.data);
      }
    }

    form.setFieldsValue(seed);
    seededRef.current = true;
  }, [attachFields, form, hasAttachFields, peopleData, securitiesData, videoId]);

  const dateTimeFieldNames = definition.fields
    .filter((field) => field.type === "datetime")
    .map((field) => field.name);

  const handleFinish = async (values: FormValues): Promise<void> => {
    const attachValues: Record<string, unknown> = {};
    const recordValues: FormValues = { ...values };

    for (const field of attachFields) {
      attachValues[field.name] = recordValues[field.name];
      delete recordValues[field.name];
    }

    const serializedValues = serializeDateTimeFields(recordValues, dateTimeFieldNames);
    await formProps.onFinish?.(serializedValues);

    if (!hasAttachFields || videoId === undefined) {
      return;
    }

    await Promise.all(attachFields.map((field) => {
      if (field.type === "multiReference") {
        return putMetadata({
          url: `${apiUrl}/videos/${videoId}/${field.endpoint}`,
          method: "put",
          values: toSecurityIds(attachValues[field.name]),
        });
      }

      const rows = attachValues[field.name] as PersonRoleRow[] | undefined;
      return putMetadata({
        url: `${apiUrl}/videos/${videoId}/${field.endpoint}`,
        method: "put",
        values: toPersonRolePayload(toPersonRoleRows(rows)),
      });
    }));
  };

  const renderField = (field: ResourceField) => {
    if (field.type === "reference") {
      return <ReferenceFieldItem field={field} />;
    }

    if (field.type === "multiReference") {
      if (action === "create") {
        return null;
      }

      return (
        <Form.Item label={field.label} name={field.name}>
          <MultiReferenceSelect
            refResource={field.refResource}
            optionLabel={field.optionLabel}
            placeholder={`Select ${field.label.toLowerCase()}`}
          />
        </Form.Item>
      );
    }

    if (field.type === "personRoles") {
      if (action === "create") {
        return null;
      }

      return (
        <Form.Item label={field.label} name={field.name}>
          <PersonRolesFieldControl refResource={field.refResource} optionLabel={field.optionLabel} />
        </Form.Item>
      );
    }

    return <ResourceFormField field={field} isUploadingMedia={isUploading} onUploadMedia={upload} />;
  };

  const FormWrapper = action === "create" ? Create : Edit;

  return (
    <FormWrapper saveButtonProps={saveButtonProps}>
      <ResourceFormView fields={definition.fields} formProps={formProps} onFinish={handleFinish} renderField={renderField} />
    </FormWrapper>
  );
};
