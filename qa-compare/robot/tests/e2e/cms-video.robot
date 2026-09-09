*** Settings ***
Documentation     Issue #19 — the CMS "Video" field: a dropdown of the streamer's
...               prepared videos on the episode form. Uploads a video to the streamer,
...               then checks it can be picked in the admin.
...               Needs cms (:5173), backend (:8080) and streamer (:8082) running.
Library           Browser
Library           RequestsLibrary
Library           Collections
Library           DateTime
Library           OperatingSystem
Suite Setup       Seed A Streamer Video
Suite Teardown    Close Browser

*** Variables ***
${CMS_URL}          http://localhost:5173
${STREAMER_URL}     http://localhost:8082
${ADMIN_EMAIL}      admin@tape.local
${ADMIN_PASSWORD}   password
${BROWSER_CHANNEL}  ${EMPTY}
${SeededVideo}      ${EMPTY}

*** Test Cases ***
Episode Form Shows The Streamer Video Dropdown
    [Documentation]    The videoUrl field renders as the stream picker, and the
    ...                seeded video is selectable from it.
    [Tags]    cms    issue-19    player
    Log In To Cms
    Go To    ${CMS_URL}/episodes/edit/1
    Wait For Elements State    [data-testid="stream-video-field"]    visible    timeout=15s
    # Open the dropdown and confirm the uploaded video is offered.
    Click    [data-testid="stream-video-field"] .ant-select-selector
    Wait For Elements State    .ant-select-dropdown    visible    timeout=10s
    Wait For Elements State
    ...    .ant-select-item-option >> text=${SeededVideo}    visible    timeout=10s

Episode Form Exposes The Upload Control
    [Documentation]    The field offers an Upload button to push a new source video.
    [Tags]    cms    issue-19    player
    Log In To Cms
    Go To    ${CMS_URL}/episodes/edit/1
    Wait For Elements State    [data-testid="stream-video-field"]    visible    timeout=15s
    Get Element Count    [data-testid="stream-video-field"] button >> text=Upload    ==    1

*** Keywords ***
Seed A Streamer Video
    [Documentation]    Upload one video to the streamer so the dropdown has an option.
    ${stamp}=    Get Current Date    result_format=%Y%m%d%H%M%S%f
    ${name}=    Set Variable    cms-e2e-${stamp}.mp4
    ${path}=    Join Path    ${TEMPDIR}    ${name}
    Create File    ${path}    fake-video
    ${files}=    Evaluate    {"file": ("${name}", open("${path}", "rb"), "application/octet-stream")}
    POST    ${STREAMER_URL}/videos    files=${files}    expected_status=202
    Set Suite Variable    ${SeededVideo}    ${name}

Log In To Cms
    New Browser    chromium    headless=true    channel=${BROWSER_CHANNEL}
    New Page    ${CMS_URL}
    Fill Text    input[placeholder="${ADMIN_EMAIL}"]    ${ADMIN_EMAIL}
    Fill Text    input[type="password"]    ${ADMIN_PASSWORD}
    Click    button[type="submit"]
    # Authenticated landing renders the resource nav (a link to Episodes).
    Wait For Elements State    a[href="/episodes"]    visible    timeout=15s
