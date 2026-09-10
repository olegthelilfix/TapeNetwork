*** Settings ***
Documentation     Keywords + selectors for the /watch video player (issue #19).
Library           Browser
Resource          navigation.resource

*** Variables ***
# Seeded episode wired to a real HLS stream (see V5__seed_demo_video.sql).
${StreamSlug}         semis-earnings-scorecard-guidance-versus-the-multiple
# Seeded episode with no video_url — the graceful "no stream" fallback.
${NoStreamSlug}       retail-margins-and-the-quiet-consumer-downgrade

# Real HLS playback needs a browser that can decode H.264 — Playwright's bundled
# Chromium cannot, so drive the suite through the system Chrome channel. Override
# with -v BROWSER_CHANNEL:msedge, or empty for bundled chromium (playback tests
# then only verify the control surface, not decoded frames).
${BROWSER_CHANNEL}    chrome

# data-testid selectors on the player (VideoPlayer.tsx).
${Player}             [data-testid="video-player"]
${VideoEl}            [data-testid="video-element"]
${Controls}          [data-testid="player-controls"]
${BtnPlayPause}       [data-testid="btn-playpause"]
${BtnMute}            [data-testid="btn-mute"]
${Seek}               [data-testid="seek"]
${BtnFullscreen}      [data-testid="btn-fullscreen"]
${BigPlay}            [data-testid="play-button"]
${PlayerError}        [data-testid="player-error"]

*** Keywords ***
Open Watch Page
    [Documentation]    Open /watch/${Slug} in a fresh browser/page. Uses the
    ...                ${BROWSER_CHANNEL} browser so real HLS/H.264 playback works.
    [Arguments]    ${Slug}
    New Browser    chromium    headless=true    channel=${BROWSER_CHANNEL}
    New Page    ${BASE_URL}/watch/${Slug}
    Wait For Elements State    ${Player}    visible    timeout=10s

Wait Until Stream Ready
    [Documentation]    Wait until the player reports data-status="ready" (manifest
    ...                parsed by hls.js / native HLS) so playback can start.
    Wait Until Keyword Succeeds    20x    1s    Player Status Should Be    ready

Player Status Should Be
    [Arguments]    ${Expected}
    ${status}=    Get Attribute    ${Player}    data-status
    Should Be Equal    ${status}    ${Expected}

Video Paused Should Be
    [Documentation]    Assert the <video> element's paused property.
    [Arguments]    ${Expected}
    ${paused}=    Get Property    ${VideoEl}    paused
    Should Be Equal    ${paused}    ${Expected}

Video Muted Should Be
    [Arguments]    ${Expected}
    ${muted}=    Get Property    ${VideoEl}    muted
    Should Be Equal    ${muted}    ${Expected}

Video Time Greater Than
    [Documentation]    The media element's currentTime is past ${Threshold} seconds.
    ...                Codec-independent: seeking sets currentTime directly, so this
    ...                proves the control is wired even when a headless browser can't
    ...                decode H.264 frames.
    [Arguments]    ${Threshold}
    ${t}=    Get Property    ${VideoEl}    currentTime
    Should Be True    ${t} > ${Threshold}    currentTime is ${t}, expected > ${Threshold}
