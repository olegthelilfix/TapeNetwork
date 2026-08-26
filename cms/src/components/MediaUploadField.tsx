import { useState } from "react";
import { Button, Space, Typography, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { axiosInstance, API_URL } from "../dataProvider";

// Controlled field (value = media id). Uploads to /media/upload and stores the returned id.
export function MediaUploadField({
  value,
  onChange,
}: {
  value?: number | null;
  onChange?: (id: number | null) => void;
}) {
  const [busy, setBusy] = useState(false);

  const pick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const form = new FormData();
      form.append("file", file);
      setBusy(true);
      try {
        const { data } = await axiosInstance.post(`${API_URL}/media/upload`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onChange?.(data.id);
        message.success(`Uploaded (media #${data.id})`);
      } catch {
        message.error("Upload failed");
      } finally {
        setBusy(false);
      }
    };
    input.click();
  };

  return (
    <Space>
      <Button icon={<UploadOutlined />} loading={busy} onClick={pick}>
        Upload
      </Button>
      {value ? (
        <>
          <Typography.Text type="secondary">media #{value}</Typography.Text>
          <Button size="small" type="text" danger onClick={() => onChange?.(null)}>
            clear
          </Button>
        </>
      ) : (
        <Typography.Text type="secondary">none</Typography.Text>
      )}
    </Space>
  );
}
