*** Settings ***
Documentation     Same API scenario as ../playwright/tests/api.spec.ts. Hits the backend API.
...               Override the backend with:  robot -v API_URL:http://host:8080 api.robot
Library           RequestsLibrary
Library           Collections

*** Variables ***
${API_URL}          http://localhost:8080
${ADMIN_EMAIL}      admin@tape.local
${ADMIN_PASSWORD}   password

*** Test Cases ***
New Ticker Appears In Admin And Public API
    # 1. authenticate against the private API
    ${creds}=      Create Dictionary    email=${ADMIN_EMAIL}    password=${ADMIN_PASSWORD}
    ${login}=      POST    ${API_URL}/api/admin/auth/login    json=${creds}
    ${auth}=       Create Dictionary    Authorization=Bearer ${login.json()}[token]

    # 2. create a ticker via the private API
    ${ts}=         Evaluate    int(time.time())    modules=time
    ${symbol}=     Set Variable    E2E-${ts}
    ${body}=       Create Dictionary    symbol=${symbol}    price=100.0    change=+1.0    direction=up    sort=${0}
    ${created}=    POST    ${API_URL}/api/admin/ticker    json=${body}    headers=${auth}
    Should Be Equal    ${created.json()}[symbol]    ${symbol}
    ${id}=         Set Variable    ${created.json()}[id]

    # 3. readable back through the private API
    ${one}=        GET    ${API_URL}/api/admin/ticker/${id}    headers=${auth}
    Should Be Equal    ${one.json()}[symbol]    ${symbol}

    # 4. surfaced in the public API (no auth)
    ${pub}=        GET    ${API_URL}/api/v1/ticker
    ${symbols}=    Evaluate    [t['symbol'] for t in $pub.json()]
    List Should Contain Value    ${symbols}    ${symbol}

    # 5. cleanup
    [Teardown]     DELETE    ${API_URL}/api/admin/ticker/${id}    headers=${auth}
