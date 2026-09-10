-- Episodes counterpart to V7: give every non-live episode a real, playable HLS
-- source so items reachable from /watch actually play (issue #19). V7 only covered
-- the `video` table; the home/shows surfaces also link to `episode` rows, which were
-- left with a NULL video_url and therefore fell back to "no stream".
--
-- Only touches non-live episodes that don't already have a source (so a live episode
-- stays a live preview, and anything wired by hand or by V6 is preserved). Round-robins
-- the streamer's prepared (status=ready) files by id. Keep this list in sync with the
-- streamer's ready set (same names as V7).
with ready(name, ord) as (
    values
        ('kish.mp4', 0),
        ('letov1.mp4', 1),
        ('letov2.mp4', 2),
        ('mygirlfriend_was_crushed_by_spacemarine.mp4', 3)
),
targets as (
    select id, (row_number() over (order by id) - 1) as rn
    from episode
    where is_live = false
      and (video_url is null or video_url = '')
)
update episode e
   set video_url = r.name
  from targets t
  join ready r on r.ord = (t.rn % (select count(*) from ready))
 where e.id = t.id;
