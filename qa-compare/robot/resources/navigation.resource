*** Settings ***
Library           Browser

*** Variables ***
${BASE_URL}       http://localhost:3000
${Browser}        edge

*** Keywords ***

Start Test Main Page
    [Arguments]       ${Path}
    New Browser       chromium    headless=true
    New Page          ${BASE_URL}${Path}
    Get Title         contains    Tape
