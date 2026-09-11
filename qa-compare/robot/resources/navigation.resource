*** Settings ***
Library           Browser

*** Variables ***
${BASE_URL}       http://localhost:3000
${Browser}        edge
${TotalCount}     0

*** Keywords ***

Start Test Main Page
    [Arguments]       ${Path}
    New Browser       chromium    headless=true        #REMEMBER TO CHANGE
    New Page          ${BASE_URL}${Path}
    Get Title         contains    Tape

Click Articles Category and Count Children
    [Arguments]  ${ArticlesCat}  ${ArticlesCatText}
    Click    a[class*="chip"][href="${ArticlesCat}"]
    Get Url           contains    ${ArticlesCat}
    Wait For Elements State    div[class*="articles_cat"]:has-text("${ArticlesCatText}") >> nth=0    visible    timeout=10s     #looking for the name of category in the article card
    ${count}=    Get Element Count   div[class*="grid"] > a
    ${TotalCount}=   Evaluate    ${TotalCount}+${count}
    Set Suite Variable    ${TotalCount}

Count Articles
    [Arguments]  ${ArticlesCat}
    Click    a[class*="chip"][href="${ArticlesCat}"]        #href for articles "all" button
    Get Url           contains    ${ArticlesCat}
    ${count}=    Get Element Count   div[class*="grid"] > a
    Should Be Equal     ${TotalCount}   ${count}

Click on Article
    [Arguments]     ${ArticlesCatText}
    Wait For Elements State    div[class*="articles_cat"]:has-text("${ArticlesCatText}") >> nth=0    visible    timeout=10s
    ${ArticlesCardTitle}=    Get Text    a[class*="articles_card"] >> nth=0 >> h2[class*="articles_title"]
    ${ArticlesCardHref}=    Get Attribute    a[class*="articles_card"] >> nth=0    href
    Click    a[class*="articles_card"] >> nth=0
    Wait For Elements State    h1[class*="article_h1"]    visible    timeout=10s
    Get Text          h1[class*="article_h1"]    ==    ${ArticlesCardTitle}
    Get Url    contains    ${ArticlesCardHref}