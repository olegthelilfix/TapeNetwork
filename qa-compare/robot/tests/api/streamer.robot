*** Settings ***
Documentation     Issue #19 — tape-streamer HTTP API: list + upload.
...               Override the streamer with:  robot -v STREAMER_URL:http://host:8082 streamer.robot
Library           RequestsLibrary
Library           Collections
Library           OperatingSystem
Library           DateTime

*** Variables ***
${STREAMER_URL}     http://localhost:8082

*** Test Cases ***
Health Endpoint Is Up
    [Tags]    streamer    issue-19    api
    GET    ${STREAMER_URL}/health    expected_status=200

Videos Endpoint Returns A List
    [Tags]    streamer    issue-19    api
    ${res}=    GET    ${STREAMER_URL}/videos    expected_status=200
    ${type}=    Evaluate    type($res.json()).__name__
    Should Be Equal    ${type}    list

Upload Accepts A Video And Lists It
    [Documentation]    A valid multipart upload is accepted (202) and then appears
    ...                in the video list.
    [Tags]    streamer    issue-19    api    upload
    ${name}=    Unique Video Name
    ${path}=    Make Fake Video    ${name}
    ${res}=    Upload Video    ${name}    ${path}    202
    Should Be Equal    ${res.json()}[name]    ${name}
    Wait Until Keyword Succeeds    10x    1s    Video Should Be Listed    ${name}

Upload Sanitises The Filename
    [Documentation]    Spaces and unsafe characters are reduced to a URL-safe name.
    [Tags]    streamer    issue-19    api    upload
    ${stamp}=    Get Current Date    result_format=%H%M%S%f
    ${source}=    Set Variable    up load ${stamp}.mp4
    ${path}=    Make Fake Video    ${source}
    ${res}=    Upload Video    ${source}    ${path}    202
    Should Be Equal    ${res.json()}[name]    up_load_${stamp}.mp4

Upload Rejects A Non-Video Extension
    [Tags]    streamer    issue-19    api    upload
    ${path}=    Make Fake Video    not-a-video.txt
    Upload Video    not-a-video.txt    ${path}    400

Upload Rejects A Duplicate Name
    [Tags]    streamer    issue-19    api    upload
    ${name}=    Unique Video Name
    ${path}=    Make Fake Video    ${name}
    Upload Video    ${name}    ${path}    202
    Upload Video    ${name}    ${path}    409

Upload Rejects A Request Without A File
    [Tags]    streamer    issue-19    api    upload
    ${res}=    POST    ${STREAMER_URL}/videos    data=nofile    expected_status=any
    Should Be Equal As Integers    ${res.status_code}    400

*** Keywords ***
Unique Video Name
    ${stamp}=    Get Current Date    result_format=%Y%m%d%H%M%S%f
    RETURN    e2e-${stamp}.mp4

Make Fake Video
    [Documentation]    Create a small stand-in file with the given name; the API only
    ...                validates the extension, so real video bytes aren't needed here.
    [Arguments]    ${name}
    ${path}=    Join Path    ${TEMPDIR}    ${name}
    Create File    ${path}    fake-video-${name}
    RETURN    ${path}

Upload Video
    [Documentation]    POST the file as multipart with ${name} as the client filename,
    ...                so the server sanitises/validates the real name.
    [Arguments]    ${name}    ${path}    ${expected_status}
    ${files}=    Evaluate    {"file": ("${name}", open("${path}", "rb"), "application/octet-stream")}
    ${res}=    POST    ${STREAMER_URL}/videos    files=${files}    expected_status=${expected_status}
    RETURN    ${res}

Video Should Be Listed
    [Arguments]    ${name}
    ${res}=    GET    ${STREAMER_URL}/videos    expected_status=200
    ${names}=    Evaluate    [v['name'] for v in $res.json()]
    List Should Contain Value    ${names}    ${name}
