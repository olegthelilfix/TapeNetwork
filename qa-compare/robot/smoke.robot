*** Settings ***
Documentation     Same scenario as ../playwright/tests/smoke.spec.ts — compare the tooling, not the test.
Library           Browser
Suite Teardown    Close Browser

*** Variables ***
${BASE_URL}       http://localhost:3000

*** Test Cases ***
Home Navigates To Shows
    New Browser       chromium    headless=True
    New Page          ${BASE_URL}/
    Get Title         contains    Tape
    Click             a[href="/shows"] >> nth=0
    Wait For Elements State    h1:has-text("Shows")    visible    timeout=10s
    Get Url           contains    /shows
    Get Text          h1    ==    Shows
