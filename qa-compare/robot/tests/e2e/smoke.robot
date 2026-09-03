*** Settings ***
Documentation     Same scenario as ../playwright/tests/smoke.spec.ts — compare the tooling, not the test.
Library           Browser
Suite Teardown    Close Browser
Resource          ../../resources/navigation.resource

*** Variables ***
${BASE_URL}       http://localhost:3000

*** Test Cases ***
Home Navigates To Shows
    [Tags]  navigation  shows
    Start Test Main Page
    Click             a[href="/shows"] >> nth=0
    Wait For Elements State    h1:has-text("Shows")    visible    timeout=10s
    Get Url           contains    /shows
    Get Text          h1    ==    Shows

Home Navigates To Articles
    [Tags]  navigation  articles
    Start Test Main Page
    Click             a[href="/articles"] >> nth=0
    Wait For Elements State    h1:has-text("The newsroom")    visible    timeout=10s
    Get Url           contains    /articles
    Get Text          h1    ==    The newsroom

Home Navigates To On Demand
    [Tags]  navigation  on-demand
    Start Test Main Page
    Click             a[href="/on-demand"] >> nth=0
    Wait For Elements State    h1:has-text("Browse the archive")    visible    timeout=10s
    Get Url           contains    /on-demand
    Get Text          h1    ==    Browse the archive
