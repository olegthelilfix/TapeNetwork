*** Settings ***
Documentation     Issue #19 — the real /watch video player.
...               Verifies that a video with an available stream actually plays and
...               its controls work, and that a video without a stream shows a clear
...               "can't be played right now" message when the viewer tries to play.
...               Needs the stack running with a reachable tape-streamer (the seeded
...               episode ${StreamSlug} points at one via NEXT_PUBLIC_STREAMER_URL).
Library           Browser
Suite Teardown    Close Browser
Resource          ../../resources/player.resource

*** Test Cases ***
No-Stream Video Shows Unavailable Message On Play
    [Documentation]    An episode with no video_url renders a poster + play button;
    ...                pressing play surfaces the "can't be played" message instead
    ...                of a broken player. No <video> element is mounted.
    [Tags]    player    issue-19    fallback
    Open Watch Page    ${NoStreamSlug}
    Wait For Elements State    ${BigPlay}    visible    timeout=10s
    Get Element Count    ${VideoEl}    ==    0
    # Error is not shown until the viewer actually tries to play.
    Get Element Count    ${PlayerError}    ==    0
    Click    ${BigPlay}
    Wait For Elements State    ${PlayerError}    visible    timeout=10s
    Get Text    ${PlayerError}    *=    can’t be played right now

Streamed Video Renders A Real Player With Controls
    [Documentation]    An episode with a stream mounts a real <video> and the full
    ...                control bar; the no-stream play button is absent.
    [Tags]    player    issue-19    controls
    Open Watch Page    ${StreamSlug}
    Wait For Elements State    ${VideoEl}    attached    timeout=10s
    Wait For Elements State    ${Controls}    visible    timeout=10s
    Get Element Count    ${BigPlay}    ==    0
    Wait For Elements State    ${BtnPlayPause}    visible    timeout=5s
    Wait For Elements State    ${BtnMute}    visible    timeout=5s
    Wait For Elements State    ${Seek}    visible    timeout=5s
    Wait For Elements State    ${BtnFullscreen}    visible    timeout=5s

Play And Pause Buttons Actually Drive Playback
    [Documentation]    Clicking play starts real playback of the stream (the media
    ...                element leaves the paused state and no error surfaces); clicking
    ...                again pauses it. Muted first so headless autoplay rules don't
    ...                block the start — the buttons, not the codec, are under test.
    [Tags]    player    issue-19    playback
    Open Watch Page    ${StreamSlug}
    Wait Until Stream Ready
    Click    ${BtnMute}
    Video Paused Should Be    ${True}
    Click    ${BtnPlayPause}
    Wait Until Keyword Succeeds    10x    1s    Video Paused Should Be    ${False}
    # Real playback: decoded frames advance the clock, and no error surfaced.
    Wait Until Keyword Succeeds    15x    1s    Video Time Greater Than    0
    Player Status Should Be    ready
    Click    ${BtnPlayPause}
    Wait Until Keyword Succeeds    10x    500ms    Video Paused Should Be    ${True}

Mute Button Toggles Audio
    [Documentation]    The mute control flips the media element's muted state both ways.
    [Tags]    player    issue-19    controls
    Open Watch Page    ${StreamSlug}
    Wait Until Stream Ready
    Video Muted Should Be    ${False}
    Click    ${BtnMute}
    Wait Until Keyword Succeeds    10x    500ms    Video Muted Should Be    ${True}
    Click    ${BtnMute}
    Wait Until Keyword Succeeds    10x    500ms    Video Muted Should Be    ${False}

Seek Control Moves Playback Position
    [Documentation]    Nudging the seek slider (while paused) moves the media
    ...                element's currentTime — the control is wired to the video.
    [Tags]    player    issue-19    controls
    Open Watch Page    ${StreamSlug}
    Wait Until Stream Ready
    Video Paused Should Be    ${True}
    ${before}=    Get Property    ${VideoEl}    currentTime
    Should Be True    ${before} == 0
    Focus    ${Seek}
    # PageUp steps the range input by ~10% of its range; onSeek writes that straight
    # to the media element's currentTime (works without decoding any frames).
    Press Keys    ${Seek}    PageUp    PageUp    PageUp
    Wait Until Keyword Succeeds    10x    500ms    Video Time Greater Than    1
    Video Paused Should Be    ${True}
