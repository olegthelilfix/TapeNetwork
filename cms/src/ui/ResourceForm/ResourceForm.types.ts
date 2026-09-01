import type { ReactNode } from "react";

import type { FormProps } from "antd";

import type { ResourceField } from "./ResourceField";

export type FormValues = Record<string, unknown>;

export type ResourceFormProps = {
    fields: readonly ResourceField[];
    formProps: Omit<FormProps, "onFinish">;
    onFinish: (values: FormValues) => void | Promise<void>;
    renderField: (field: ResourceField) => ReactNode;
};
