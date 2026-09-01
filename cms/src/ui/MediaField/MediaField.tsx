import type { ChangeEvent, FC } from "react";
import { useRef } from "react";

import { UploadOutlined } from "@ant-design/icons";
import { Button, Space, Typography } from "antd";

import type { MediaFieldProps } from "./MediaField.types";

export const MediaField: FC<MediaFieldProps> = ({ value, onChange, isUploading, onUpload }) => {
  const inputReference = useRef<HTMLInputElement>(null);

  const handleChooseFile = (): void => {
    inputReference.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (file === undefined) {
      return;
    }

    try {
      const mediaId = await onUpload(file);
      onChange?.(mediaId);
    } catch {
      // Upload errors are intentionally contained at the presentation boundary.
    }
  };

  const handleClear = (): void => {
    onChange?.(null);
  };

  return (
    <Space>
      <input ref={inputReference} type="file" accept="image/*,video/*" hidden onChange={handleFileChange} />
      <Button icon={<UploadOutlined />} loading={isUploading} onClick={handleChooseFile}>Upload</Button>
      {value !== null && value !== undefined ? (
        <>
          <Typography.Text type="secondary">media #{value}</Typography.Text>
          <Button size="small" type="text" danger onClick={handleClear}>clear</Button>
        </>
      ) : <Typography.Text type="secondary">none</Typography.Text>}
    </Space>
  );
};
