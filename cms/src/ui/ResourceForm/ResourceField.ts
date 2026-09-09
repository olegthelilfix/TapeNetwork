type FieldBase = {
    name: string;
    label: string;
    required?: boolean;
    inList?: boolean;
};

type TextField = FieldBase & {
    type: "text" | "textarea" | "number" | "boolean" | "tags" | "stringArray" | "datetime" | "media";
};

type SelectOption = {
    label: string;
    value: string;
};

type SelectField = FieldBase & {
    type: "select";
    options: readonly SelectOption[];
};

export type ReferenceField = FieldBase & {
    type: "reference";
    refResource: string;
    optionLabel: string;
};

export type ResourceField = TextField | SelectField | ReferenceField;
