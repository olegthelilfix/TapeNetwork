import type { FC } from "react";

import { Form } from "antd";

import type { ResourceFormProps } from "./ResourceForm.types";

export const ResourceForm: FC<ResourceFormProps> = ({ fields, formProps, onFinish, renderField }) => {
  return (
    <Form {...formProps} onFinish={onFinish} layout="vertical">
      {fields.map((field) => <div key={field.name}>{renderField(field)}</div>)}
    </Form>
  );
};
