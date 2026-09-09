*** Settings ***
Documentation     Same scenario as ../playwright/tests/smoke.spec.ts — compare the tooling, not the test.
Library           Browser
Suite Teardown    Close Browser
Resource          ../../resources/navigation.resource
Resource          ../../resources/search.resource

*** Variables ***
${ShowsNav}     shows
${ShowsText}    Shows
${ArticlesNav}  articles
${ArticlesText}  The newsroom
${OnDemandNav}  on-demand
${OnDemandText}  Browse the archive

*** Test Cases ***
Home Navigates To Shows
    [Tags]  navigation  shows
    Start Test Main Page    /
    Click             a[href="/${ShowsNav}"] >> nth=0
    Wait For Elements State    h1:has-text("${ShowsText}")    visible    timeout=10s
    Get Url           contains    /${ShowsNav}
    Get Text          h1    ==    ${ShowsText}

Home Navigates To Articles
    [Tags]  navigation  articles
    Start Test Main Page    /
    Click             a[href="/${ArticlesNav}"] >> nth=0
    Wait For Elements State    h1:has-text("${ArticlesText}")    visible    timeout=10s
    Get Url           contains    /${ArticlesNav}
    Get Text          h1    ==    ${ArticlesText}

Home Navigates To On Demand
    [Tags]  navigation  on-demand
    Start Test Main Page    /
    Click             a[href="/${OnDemandNav}"] >> nth=0
    Wait For Elements State    h1:has-text("${OnDemandText}")    visible    timeout=10s
    Get Url           contains    /${OnDemandNav}
    Get Text          h1    ==    ${OnDemandText}

Search for Shows Upper case
    [Tags]  shows   search
    Start Test Main Page    /
    Search For  ${SearchUCMacro}
    Wait For Elements State    h3:has-text("${SearchUCMacro}")    visible    timeout=10s

Search for Shows Lower case
    [Tags]  shows   search
    Start Test Main Page    /
    Search For  ${SearchLCMacro}
    Wait For Elements State    h3:has-text("${SearchLCMacro}")    visible    timeout=10s

Search for Non-existing Term
    [Tags]  shows   search
    Start Test Main Page    /
    Search For  ${SearchIncorrect}
    Wait For Elements State    p:has-text("Nothing matched. Try different terms.")    visible    timeout=10s