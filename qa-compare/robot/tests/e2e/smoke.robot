*** Settings ***
Documentation     Same scenario as ../playwright/tests/smoke.spec.ts — compare the tooling, not the test.
Library           Browser
Suite Teardown    Close Browser
Resource          ../../resources/navigation.resource
Resource          ../../resources/search.resource

*** Variables ***
${ShowsNav}                shows
${ShowsText}               Shows
${ArticlesNav}             articles
${ArticlesText}            The newsroom
${OnDemandNav}             on-demand
${OnDemandText}            Browse the archive
${ArticlesNavMR}           category=macro-rates
${ArticlesNavOV}           category=options-volatility
${ArticlesNavTF}           category=technicals-flow
${ArticlesNavE}            category=earnings
${ArticlesNavILF}          category=interviews-long-form
${ArticlesCatOVText}       Options & Volatility
${ArticlesCatMRText}       Macro & Rates
${ArticlesCatTFText}       Technicals & Flow
${ArticlesCatEText}        Earnings
${ArticlesCatILFText}      Interviews & Long Form






*** Test Cases ***
Home Navigates To Shows
    [Tags]   e2e     navigation  shows
    Start Test Main Page    /
    Click             a[href="/${ShowsNav}"] >> nth=0
    Wait For Elements State    h1:has-text("${ShowsText}")    visible    timeout=10s
    Get Url           contains    /${ShowsNav}
    Get Text          h1    ==    ${ShowsText}

Home Navigates To Articles
    [Tags]  e2e     navigation  articles
    Start Test Main Page    /
    Click             a[href="/${ArticlesNav}"] >> nth=0
    Wait For Elements State    h1:has-text("${ArticlesText}")    visible    timeout=10s
    Get Url           contains    /${ArticlesNav}
    Get Text          h1    ==    ${ArticlesText}

Home Navigates To On Demand
    [Tags]  e2e     navigation  on-demand
    Start Test Main Page    /
    Click             a[href="/${OnDemandNav}"] >> nth=0
    Wait For Elements State    h1:has-text("${OnDemandText}")    visible    timeout=10s
    Get Url           contains    /${OnDemandNav}
    Get Text          h1    ==    ${OnDemandText}

Search for Shows Upper case
    [Tags]  e2e     shows   search
    Start Test Main Page    /
    Search For  ${SearchUCMacro}
    Wait For Elements State    h3:has-text("${SearchUCMacro}")    visible    timeout=10s

Search for Shows Lower case
    [Tags]     e2e      shows   search
    Start Test Main Page    /
    Search For  ${SearchLCMacro}
    Wait For Elements State    h3:has-text("${SearchLCMacro}")    visible    timeout=10s

Search for Non-existing Term
    [Tags]   e2e    shows   search
    Start Test Main Page    /
    Search For  ${SearchIncorrect}
    Wait For Elements State    p:has-text("Nothing matched. Try different terms.")    visible    timeout=10s

Filtering Articles by Category
    [Tags]  e2e   articles   categories
    Start Test Main Page    /articles
    Wait For Elements State    h1:has-text("${ArticlesText}")    visible    timeout=10s
    Get Url           contains    /${ArticlesNav}
    Click Articles Category and Count Children      /${ArticlesNav}?${ArticlesNavMR}    ${ArticlesCatMRText}
    Click Articles Category and Count Children      /${ArticlesNav}?${ArticlesNavOV}    ${ArticlesCatOVText}
    Click Articles Category and Count Children      /${ArticlesNav}?${ArticlesNavTF}    ${ArticlesCatTFText}
    Click Articles Category and Count Children      /${ArticlesNav}?${ArticlesNavE}     ${ArticlesCatEText}
    Click Articles Category and Count Children      /${ArticlesNav}?${ArticlesNavILF}   ${ArticlesCatILFText}
    Count Articles    /${ArticlesNav}

Navigate to Macro & Rates
    [Tags]  e2e   articles   categories
    Start Test Main Page    /${ArticlesNav}?${ArticlesNavMR}
    Click on Article        ${ArticlesCatMRText}

Navigate to Options & Volatility
    [Tags]  e2e   articles   categories
    Start Test Main Page    /${ArticlesNav}?${ArticlesNavOV}
    Click on Article        ${ArticlesCatOVText}

Navigate to Technicals & Flow
    [Tags]  e2e   articles   categories
    Start Test Main Page    /${ArticlesNav}?${ArticlesNavTF}
    Click on Article        ${ArticlesCatTFText}

Navigate to Earnings
    [Tags]  e2e   articles   categories
    Start Test Main Page    /${ArticlesNav}?${ArticlesNavE}
    Click on Article        ${ArticlesCatEText}

Navigate to Interviews & Long Form
    [Tags]  e2e   articles   categories
    Start Test Main Page    /${ArticlesNav}?${ArticlesNavILF}
    Click on Article        ${ArticlesCatILFText}
