-- Give every on-demand video a real, playable HLS source so the whole catalog can
-- actually play out of the box (issue #19). Round-robins the streamer's prepared
-- (status=ready) source files across all video rows by id, so each video points at
-- one of them and the web resolves it to {streamer}/stream/{name}/master.m3u8.
--
-- The file names below MUST exist on the tape-streamer volume in "ready" state; they
-- are the demo videos currently prepared there. Add/adjust names here to match the
-- streamer's ready set. Episodes are left as-is (live previews have no VOD stream);
-- the one seeded playable episode is wired in V6.
with ready(name, ord) as (
    values
        ('kish.mp4', 0),
        ('letov1.mp4', 1),
        ('letov2.mp4', 2),
        ('mygirlfriend_was_crushed_by_spacemarine.mp4', 3)
),
numbered as (
    select id, (row_number() over (order by id) - 1) as rn
    from video
)
update video v
   set video_url = r.name
  from numbered n
  join ready r on r.ord = (n.rn % (select count(*) from ready))
 where v.id = n.id;
