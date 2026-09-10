-- Real view counting (#53). Forward-only.
-- Numeric per-video watch counter; the displayed `views` string becomes a derived
-- format of this count. Incremented in-memory on watch and flushed here periodically.
alter table video add column view_count bigint not null default 0;

-- Rank the "most popular" home section by this counter.
create index idx_video_view_count on video(view_count desc);
