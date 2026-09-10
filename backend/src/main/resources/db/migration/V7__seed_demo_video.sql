-- Wire one seeded episode to a real HLS stream served by tape-streamer, so the
-- public player has something to actually play out of the box (issue #19).
--
-- `video_url` holds the streamer *name* (source file name); the web resolves it
-- to {streamer base URL}/stream/{name}/master.m3u8 (see web streamUrl.ts). Every
-- other episode keeps a NULL video_url and shows the graceful "no stream" fallback.
update episode
   set video_url = 'mygirlfriend_was_crushed_by_spacemarine.mp4'
 where slug = 'semis-earnings-scorecard-guidance-versus-the-multiple';
