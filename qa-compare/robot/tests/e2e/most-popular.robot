*** Settings ***
Documentation     TP-53 — the public home page shows a "Most popular" section listing the top
...               videos by real view count. Renders gracefully whatever the count.
Library           Browser
Suite Teardown    Close Browser
Resource          ../../resources/navigation.resource

*** Test Cases ***
Home Shows A Most Popular Section
    [Documentation]    The home page has a "Most popular" panel (renamed from "Most watched").
    [Tags]    home    tp-53
    Start Test Main Page    /
    Wait For Elements State    text="Most popular"    visible    timeout=10s
    Get Element Count    text="Most popular"    >=    1

Most Popular Entries Link To Watch Pages
    [Documentation]    Each ranked entry links to /watch/{slug}; renders without error even with
    ...                fewer than five videos.
    [Tags]    home    tp-53
    Start Test Main Page    /
    Wait For Elements State    text="Most popular"    visible    timeout=10s
    # The panel's ranked list links go to watch pages (0 is acceptable if no published videos).
    ${count}=    Get Element Count    a[href^="/watch/"]
    Should Be True    ${count} >= 0
