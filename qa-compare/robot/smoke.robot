*** Settings ***
Documentation     Same scenario as ../playwright/tests/smoke.spec.ts — compare the tooling, not the test.
Library           Browser
Suite Teardown    Close Browser

*** Variables ***
${BASE_URL}       http://localhost:3000

*** Test Cases ***
Home Navigates To Shows
    [Tags]  navigation  shows
    New Browser       chromium    headless=true
    New Page          ${BASE_URL}/
    Get Title         contains    Tape
    Click             a[href="/shows"] >> nth=0
    Wait For Elements State    h1:has-text("Shows")    visible    timeout=10s
    Get Url           contains    /shows
    Get Text          h1    ==    Shows

Home Navigates To Articles
    [Tags]  navigation  articles
    New Browser       chromium    headless=true
    New Page          ${BASE_URL}/
    Get Title         contains    Tape
    Click             a[href="/articles"] >> nth=0
    Wait For Elements State    h1:has-text("The newsroom")    visible    timeout=10s
    Get Url           contains    /articles
    Get Text          h1    ==    The newsroom

Home Navigates To On Demand
    [Tags]  navigation  on-demand
    New Browser       chromium    headless=true
    New Page          ${BASE_URL}/
    Get Title         contains    Tape
    Click             a[href="/on-demand"] >> nth=0
    Wait For Elements State    h1:has-text("Browse the archive")    visible    timeout=10s
    Get Url           contains    /on-demand
    Get Text          h1    ==    Browse the archive
