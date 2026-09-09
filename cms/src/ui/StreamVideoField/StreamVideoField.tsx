import type { FC } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ReloadOutlined, UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { Button, message, Select, Space, Upload } from "antd";

import type { StreamerVideo, StreamVideoFieldProps } from "./StreamVideoField.types";

const STATUS_RANK: Record<StreamerVideo["status"], number> = {
  ready: 0,
  transcoding: 1,
  pending: 2,
  unknown: 3,
  failed: 4,
};

const optionLabel = (v: StreamerVideo): string => `${v.name} — ${v.status}`;

/**
 * Picks the stream for an episode/video: a searchable dropdown of the streamer's
 * prepared videos, plus an upload button that pushes a new source file to the
 * streamer (which then transcodes it) and selects it once accepted.
 */
export const StreamVideoField: FC<StreamVideoFieldProps> = ({ value, onChange, listVideos, uploadVideo }) => {
  const [videos, setVideos] = useState<StreamerVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setVideos(await listVideos());
    } catch {
      message.error("Could not load videos from the streamer");
    } finally {
      setLoading(false);
    }
  }, [listVideos]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const options = useMemo(() => {
    const sorted = [...videos].sort(
      (a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status] || a.name.localeCompare(b.name),
    );
    const opts = sorted.map((v) => ({ value: v.name, label: optionLabel(v) }));
    // Keep the currently-bound value visible even if the streamer doesn't list it
    // (e.g. an absolute URL, or a file removed from the streamer).
    if (value && !sorted.some((v) => v.name === value)) {
      opts.unshift({ value, label: `${value} — (not on streamer)` });
    }
    return opts;
  }, [videos, value]);

  const beforeUpload: UploadProps["beforeUpload"] = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const uploaded = await uploadVideo(file);
        message.success(`Uploaded ${uploaded.name} — ${uploaded.status}. Transcoding will finish shortly.`);
        await refresh();
        onChange?.(uploaded.name);
      } catch (error) {
        message.error(error instanceof Error ? error.message : "Upload failed");
      } finally {
        setUploading(false);
      }
      // Return false so antd doesn't also try to upload the file itself.
      return false;
    },
    [onChange, refresh, uploadVideo],
  );

  return (
    <Space.Compact style={{ display: "flex", width: "100%" }}>
      <Select
        style={{ flex: 1 }}
        showSearch
        allowClear
        loading={loading}
        placeholder="Select a prepared video"
        value={value ?? undefined}
        onChange={(next?: string) => onChange?.(next ?? null)}
        options={options}
        optionFilterProp="label"
      />
      <Button icon={<ReloadOutlined />} loading={loading} onClick={() => void refresh()} title="Refresh list" />
      <Upload beforeUpload={beforeUpload} showUploadList={false} accept="video/*,.mkv,.mov,.avi,.ts">
        <Button icon={<UploadOutlined />} loading={uploading}>Upload</Button>
      </Upload>
    </Space.Compact>
  );
};
