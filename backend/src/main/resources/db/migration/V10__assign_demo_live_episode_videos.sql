-- Final catch-all for issue #19: make EVERY episode playable, including live ones.
-- V7 filled `video`, V8 filled non-live episodes; this fills any episode that still
-- has no source (the live episodes V8 deliberately skipped), so nothing reachable from
-- /watch is left without a stream. Videos are all covered by V7 already.
--
-- Idempotent by construction: only touches rows where video_url is null/empty, so
-- re-running or later hand-edits are preserved. Round-robins the same ready streamer
-- files (keep in sync with V7/V8).
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
    where video_url is null or video_url = ''
)
update episode e
   set video_url = r.name
  from targets t
  join ready r on r.ord = (t.rn % (select count(*) from ready))
 where e.id = t.id;
