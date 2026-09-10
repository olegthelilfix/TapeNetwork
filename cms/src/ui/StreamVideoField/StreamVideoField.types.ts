/** A source video known to the streamer, with its HLS preparation status. */
export type StreamerVideo = {
    readonly name: string;
    readonly status: "pending" | "transcoding" | "ready" | "failed" | "unknown";
    readonly tiers?: readonly string[];
    readonly size?: number;
    readonly error?: string;
};

/** Lists the streamer's known source videos. */
export type ListVideos = () => Promise<StreamerVideo[]>;

/** Uploads a new source video to the streamer for preparation. */
export type UploadVideo = (file: File) => Promise<StreamerVideo>;

export type StreamVideoFieldProps = {
    /** Selected stream name (the streamer source filename). Injected by Form.Item. */
    readonly value?: string | null;
    /** Injected by Form.Item. */
    readonly onChange?: (value: string | null) => void;
    /** Streamer access, injected from the composition root (keeps ui/ off app/). */
    readonly listVideos: ListVideos;
    readonly uploadVideo: UploadVideo;
};
