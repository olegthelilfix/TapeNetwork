*** Settings ***
Library           Browser

*** Variables ***
${SearchUCMacro}  Macro
${SearchLCMacro}  macro
${SearchIncorrect}  vdjgtrl/

*** Keywords ***
Search For
    [Arguments]     ${SearchTerm}
    Wait for Elements State     input[aria-label="Search"]      visible     timeout=10s
    Click             input[aria-label="Search"]
    Type Text         input[aria-label="Search"]    ${SearchTerm}  delay=10ms
    Press Keys        input[aria-label="Search"]    Enter
    Wait For Elements State    p:has-text('“${SearchTerm}”')    visible    timeout=10s
