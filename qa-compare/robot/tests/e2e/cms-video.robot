*** Settings ***
Documentation     Issue #19 — the CMS "Video" field: a dropdown of the streamer's
...               prepared videos on the episode form. Uploads a video to the streamer,
...               then checks it can be picked in the admin.
...               Needs cms (:8081, prod compose maps 8081:80), backend (:8080) and
...               streamer (:8082) running. Override the CMS with
...               -v CMS_URL:http://host:PORT (local dev is http://localhost:5173).
Library           Browser
Library           RequestsLibrary
Library           Collections
Library           DateTime
Library           OperatingSystem
Suite Setup       Seed A Streamer Video
Suite Teardown    Close Browser

*** Variables ***
${CMS_URL}          http://localhost:8081
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
    # Open the dropdown and confirm the uploaded video is offered. The antd Select
    # is search-enabled, so opening focuses an input; retry the open until the
    # options panel is actually rendered (it can lag on a loaded prod stack).
    Wait Until Keyword Succeeds    5x    2s    Open Stream Video Dropdown
    # The option label is "<name> — <status>", so match the seeded name as a substring.
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
    # Authenticated landing renders the resource nav (a link to Episodes). The
    # SPA auth handshake can lag on a loaded stack, so wait generously.
    Wait For Elements State    a[href="/episodes"]    visible    timeout=30s

Open Stream Video Dropdown
    [Documentation]    Click the search-enabled Select and confirm its options panel
    ...                actually renders. Retried by the caller because the panel can
    ...                lag behind the click on a loaded stack.
    Click    [data-testid="stream-video-field"] .ant-select-selector
    Wait For Elements State    .ant-select-dropdown    visible    timeout=3s
    Get Element Count    .ant-select-item-option    >=    1
