*** Settings ***
Documentation     End-to-end API coverage for issues #54 (structured video metadata:
...               securities + people with host/guest roles) and #56 (public person page).
...               Exercises the admin CRUD + attach/detach endpoints and asserts the public
...               payloads: catalog reuse across videos, roles, id-less DTOs, 404 on unknown
...               slug, and that existing show-hosts survive the host->person backfill.
...               Override the backend with:  robot -v API_URL:http://host:8080 people_securities.robot
Library           RequestsLibrary
Library           Collections
Library           String

*** Variables ***
${API_URL}          http://localhost:8080
${ADMIN_EMAIL}      admin@tape.local
${ADMIN_PASSWORD}   password

*** Test Cases ***
Security Is Reusable Across Videos And Appears On The Public Video Payload
    [Documentation]    #54: a security is a reusable catalog entity, attachable to many
    ...                videos, surfaced (symbol+name) on the public video payload with no id.
    ${auth}=            Admin Auth Header
    ${ts}=              Unique Suffix
    # create one security in the catalog
    ${symbol}=          Set Variable    E2E${ts}
    ${sec_body}=        Create Dictionary    symbol=${symbol}    name=E2E Security ${ts}    sort=${0}
    ${sec}=             POST    ${API_URL}/api/admin/securities    json=${sec_body}    headers=${auth}
    Should Be Equal     ${sec.json()}[symbol]    ${symbol}
    ${sec_id}=          Set Variable    ${sec.json()}[id]

    # find two published on-demand videos to attach it to
    ${slugs}=           Two Published Video Slugs
    ${slug_a}=          Set Variable    ${slugs}[0]
    ${slug_b}=          Set Variable    ${slugs}[1]
    ${id_a}=            Admin Video Id By Slug    ${auth}    ${slug_a}
    ${id_b}=            Admin Video Id By Slug    ${auth}    ${slug_b}

    # attach the SAME security to both videos (reuse)
    ${ids}=             Create List    ${sec_id}
    PUT                 ${API_URL}/api/admin/videos/${id_a}/securities    json=${ids}    headers=${auth}
    PUT                 ${API_URL}/api/admin/videos/${id_b}/securities    json=${ids}    headers=${auth}

    # public payload of video A lists the security with no id
    ${pub_a}=           GET    ${API_URL}/api/v1/on-demand/videos/${slug_a}
    Dictionary Should Not Contain Key    ${pub_a.json()}    id
    ${syms_a}=          Evaluate    [s['symbol'] for s in $pub_a.json()['securities']]
    List Should Contain Value    ${syms_a}    ${symbol}
    # the security ref itself is id-less (symbol/name only)
    ${first_sec}=       Set Variable    ${pub_a.json()}[securities][0]
    Dictionary Should Not Contain Key    ${first_sec}    id

    # public payload of video B lists the SAME reused security
    ${pub_b}=           GET    ${API_URL}/api/v1/on-demand/videos/${slug_b}
    ${syms_b}=          Evaluate    [s['symbol'] for s in $pub_b.json()['securities']]
    List Should Contain Value    ${syms_b}    ${symbol}

    [Teardown]          Run Keywords
    ...                 PUT    ${API_URL}/api/admin/videos/${id_a}/securities    json=@{EMPTY}    headers=${auth}    AND
    ...                 PUT    ${API_URL}/api/admin/videos/${id_b}/securities    json=@{EMPTY}    headers=${auth}    AND
    ...                 DELETE    ${API_URL}/api/admin/securities/${sec_id}    headers=${auth}

People Attach To A Video With Host And Guest Roles And Surface Publicly
    [Documentation]    #54: people attach to a video with host/guest roles; the public video
    ...                payload lists them (name + role) with a stable slug and no id.
    ${auth}=            Admin Auth Header
    ${ts}=              Unique Suffix
    # create two people in the catalog
    ${host_id}=         Create Person    ${auth}    Host ${ts}    host-${ts}    HT
    ${guest_id}=        Create Person    ${auth}    Guest ${ts}    guest-${ts}    GT

    ${slug}=            One Published Video Slug
    ${vid}=             Admin Video Id By Slug    ${auth}    ${slug}

    # attach one as host, one as guest
    ${row_host}=        Create Dictionary    personId=${host_id}    role=host
    ${row_guest}=       Create Dictionary    personId=${guest_id}    role=guest
    ${people}=          Create List    ${row_host}    ${row_guest}
    PUT                 ${API_URL}/api/admin/videos/${vid}/people    json=${people}    headers=${auth}

    # public payload lists both with correct roles + slugs, no id
    ${pub}=             GET    ${API_URL}/api/v1/on-demand/videos/${slug}
    ${roles}=           Evaluate    {p['slug']: p['role'] for p in $pub.json()['people']}
    Should Be Equal     ${roles}[host-${ts}]     host
    Should Be Equal     ${roles}[guest-${ts}]    guest
    ${first_person}=    Set Variable    ${pub.json()}[people][0]
    Dictionary Should Not Contain Key    ${first_person}    id

    [Teardown]          Run Keywords
    ...                 PUT    ${API_URL}/api/admin/videos/${vid}/people    json=@{EMPTY}    headers=${auth}    AND
    ...                 DELETE    ${API_URL}/api/admin/people/${host_id}    headers=${auth}    AND
    ...                 DELETE    ${API_URL}/api/admin/people/${guest_id}    headers=${auth}

Public Person Page Lists Info Videos And Articles Without Id
    [Documentation]    #56: GET /api/v1/people/{slug} returns bio + host/guest videos
    ...                (role distinguishable) + authored articles, id-less.
    ${auth}=            Admin Auth Header
    ${ts}=              Unique Suffix
    ${slug}=            Set Variable    person-page-${ts}
    ${person_id}=       Create Person    ${auth}    Page Person ${ts}    ${slug}    PP
    # give them a bio via PATCH
    ${patch}=           Create Dictionary    bio=Covers the open.
    PATCH               ${API_URL}/api/admin/people/${person_id}    json=${patch}    headers=${auth}

    # attach them to a video as guest
    ${video_slug}=      One Published Video Slug
    ${vid}=             Admin Video Id By Slug    ${auth}    ${video_slug}
    ${row}=             Create Dictionary    personId=${person_id}    role=guest
    ${people}=          Create List    ${row}
    PUT                 ${API_URL}/api/admin/videos/${vid}/people    json=${people}    headers=${auth}

    # person page resolves
    ${page}=            GET    ${API_URL}/api/v1/people/${slug}
    Should Be Equal     ${page.json()}[slug]    ${slug}
    Should Be Equal     ${page.json()}[bio]     Covers the open.
    Dictionary Should Not Contain Key    ${page.json()}    id
    # their video appears with the guest role
    ${video_roles}=     Evaluate    {v['slug']: v['role'] for v in $page.json()['videos']}
    Should Be Equal     ${video_roles}[${video_slug}]    guest
    # articles list exists (possibly empty) and is a list
    Should Be True      isinstance($page.json()['articles'], list)

    [Teardown]          Run Keywords
    ...                 PUT    ${API_URL}/api/admin/videos/${vid}/people    json=@{EMPTY}    headers=${auth}    AND
    ...                 DELETE    ${API_URL}/api/admin/people/${person_id}    headers=${auth}

Unknown Person Slug Returns 404
    [Documentation]    #56: unknown slug -> 404 via ApiExceptionHandler.
    ${resp}=            GET    ${API_URL}/api/v1/people/no-such-person-xyz    expected_status=404
    Should Be Equal As Integers    ${resp.json()}[status]    404
    Should Be Equal     ${resp.json()}[error]    Not Found

Existing Show Hosts Still Render After The Person Backfill
    [Documentation]    #54: the host->person backfill must not break shows — a show still
    ...                exposes its hosts on the public API.
    ${shows}=           GET    ${API_URL}/api/v1/shows
    ${count}=           Get Length    ${shows.json()}
    Pass Execution If   ${count} == 0    No shows seeded; nothing to assert.
    ${slug}=            Set Variable    ${shows.json()}[0][slug]
    ${detail}=          GET    ${API_URL}/api/v1/shows/${slug}
    Should Be True      isinstance($detail.json()['hosts'], list)

Person Or Security Is Findable Via Search After Attach
    [Documentation]    #54: securities/people are indexed on the video, so a video becomes
    ...                findable by an attached security symbol.
    ${auth}=            Admin Auth Header
    ${ts}=              Unique Suffix
    ${symbol}=          Set Variable    FIND${ts}
    ${sec_body}=        Create Dictionary    symbol=${symbol}    name=Findable ${ts}    sort=${0}
    ${sec}=             POST    ${API_URL}/api/admin/securities    json=${sec_body}    headers=${auth}
    ${sec_id}=          Set Variable    ${sec.json()}[id]
    ${slug}=            One Published Video Slug
    ${vid}=             Admin Video Id By Slug    ${auth}    ${slug}
    ${ids}=             Create List    ${sec_id}
    PUT                 ${API_URL}/api/admin/videos/${vid}/securities    json=${ids}    headers=${auth}

    # the search index updates on the write; query by symbol should hit the video
    ${res}=             GET    ${API_URL}/api/v1/search?q=${symbol}&type=video&limit=8
    ${slugs}=           Evaluate    [h.get('slug') for h in $res.json()]
    List Should Contain Value    ${slugs}    ${slug}

    [Teardown]          Run Keywords
    ...                 PUT    ${API_URL}/api/admin/videos/${vid}/securities    json=@{EMPTY}    headers=${auth}    AND
    ...                 DELETE    ${API_URL}/api/admin/securities/${sec_id}    headers=${auth}

*** Keywords ***
Admin Auth Header
    [Documentation]    Authenticate against the admin API and return the bearer header dict.
    ${creds}=           Create Dictionary    email=${ADMIN_EMAIL}    password=${ADMIN_PASSWORD}
    ${login}=           POST    ${API_URL}/api/admin/auth/login    json=${creds}
    ${auth}=            Create Dictionary    Authorization=Bearer ${login.json()}[token]
    RETURN              ${auth}

Unique Suffix
    ${ts}=              Evaluate    int(time.time() * 1000)    modules=time
    RETURN              ${ts}

Create Person
    [Arguments]         ${auth}    ${name}    ${slug}    ${initials}
    ${body}=            Create Dictionary    name=${name}    slug=${slug}    initials=${initials}    sort=${0}
    ${p}=               POST    ${API_URL}/api/admin/people    json=${body}    headers=${auth}
    Should Be Equal     ${p.json()}[slug]    ${slug}
    RETURN              ${p.json()}[id]

Admin Video Id By Slug
    [Documentation]    Resolve a video's numeric admin id from its public slug.
    [Arguments]         ${auth}    ${slug}
    ${resp}=            GET    ${API_URL}/api/admin/videos?_start=0&_end=1000    headers=${auth}
    ${id}=              Evaluate    next(v['id'] for v in $resp.json() if v['slug'] == '${slug}')
    RETURN              ${id}

Two Published Video Slugs
    [Documentation]    Return at least two published on-demand video slugs, or skip.
    ${slugs}=           Published Video Slugs
    ${count}=           Get Length    ${slugs}
    Skip If             ${count} < 2    Need >= 2 published videos for the reuse test.
    RETURN              ${slugs}

One Published Video Slug
    ${slugs}=           Published Video Slugs
    ${count}=           Get Length    ${slugs}
    Skip If             ${count} < 1    Need >= 1 published video.
    RETURN              ${slugs}[0]

Published Video Slugs
    [Documentation]    Collect published on-demand video slugs by walking categories.
    ${cats}=            GET    ${API_URL}/api/v1/on-demand/categories
    ${slugs}=           Create List
    FOR    ${cat}    IN    @{cats.json()}
        ${detail}=      GET    ${API_URL}/api/v1/on-demand/categories/${cat}[slug]
        FOR    ${sub}    IN    @{detail.json()}[subcategories]
            ${subDetail}=    GET    ${API_URL}/api/v1/on-demand/subcategories/${sub}[slug]
            FOR    ${v}    IN    @{subDetail.json()}[videos]
                Append To List    ${slugs}    ${v}[slug]
            END
        END
    END
    RETURN              ${slugs}
