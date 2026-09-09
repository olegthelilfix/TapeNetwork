*** Settings ***
Documentation     TP-75 — the redundant "Home" nav tab is gone and the logo is the
...               "go home" affordance. Mirrors ../playwright/tests/header-nav.spec.ts.
Library           Browser
Suite Teardown    Close Browser
Resource          ../../resources/navigation.resource

*** Variables ***
# The logo — Brand links to / with this aria-label.
${Logo}           header a[aria-label="Tape Network home"]

*** Test Cases ***
Header Has No Home Tab
    [Documentation]    No nav link points at "/" (the logo is the only route home).
    [Tags]    navigation    tp-75
    Start Test Main Page    /
    # The nav contains no anchor whose href is exactly "/".
    Get Element Count    header nav a[href="/"]    ==    0
    # And there is no nav tab labelled "Home".
    Get Element Count    header nav a >> text="Home"    ==    0

Header Shows Only The Three Expected Tabs
    [Documentation]    Exactly Shows, Articles, On Demand — in that order.
    [Tags]    navigation    tp-75
    Start Test Main Page    /
    Get Element Count    header nav a    ==    3
    # Positional check pins both presence and order (nth is 0-based).
    Get Attribute    header nav a >> nth=0    href    ==    /shows
    Get Text         header nav a >> nth=0    ==    Shows
    Get Attribute    header nav a >> nth=1    href    ==    /articles
    Get Text         header nav a >> nth=1    ==    Articles
    Get Attribute    header nav a >> nth=2    href    ==    /on-demand
    Get Text         header nav a >> nth=2    ==    On Demand

Logo Returns Home From Shows
    [Documentation]    Clicking the logo from /shows lands back on the homepage.
    [Tags]    navigation    tp-75    logo
    Logo Should Return Home From    /shows

Logo Returns Home From Articles
    [Tags]    navigation    tp-75    logo
    Logo Should Return Home From    /articles

Logo Returns Home From On Demand
    [Tags]    navigation    tp-75    logo
    Logo Should Return Home From    /on-demand

*** Keywords ***
Logo Should Return Home From
    [Documentation]    Open ${Path}, click the header logo, assert we are on "/".
    ...                Waits for the home hero H1 before asserting the URL, because
    ...                Get Url does not auto-retry (unlike Playwright's toHaveURL).
    [Arguments]    ${Path}
    Start Test Main Page    ${Path}
    Wait For Elements State    ${Logo}    visible    timeout=10s
    Click    ${Logo}
    # Home page renders a hero H1; wait for it, then confirm the URL is the root.
    Wait For Elements State    header a[aria-label="Tape Network home"]    visible    timeout=10s
    Wait Until Keyword Succeeds    5x    500ms    Url Should Be Home

Url Should Be Home
    ${url}=    Get Url
    Should Match Regexp    ${url}    ^https?://[^/]+/?(\\?.*)?$
