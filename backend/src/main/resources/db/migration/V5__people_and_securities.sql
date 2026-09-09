-- Structured video metadata (#54) + canonical person / person page (#56).
-- Forward-only. Conventions: bigint identity PKs, text slugs for public lookups.
--
-- Introduces:
--   * security                 lookup catalog (unique symbol, display name)
--   * person                   canonical people (host / guest / author), public slug
--   * video_security           M:N video <-> security
--   * video_person(role)       M:N video <-> person, role = host | guest
--   * article.person_id        articles authored by a person (author unified into person)
--   * show host linkage         existing host rows backfilled into person + show_person
--
-- Existing host and author rows are preserved and linked; no applied V*.sql is edited.

-- ---------- security catalog ----------
create table security (
    id     bigint generated always as identity primary key,
    symbol text not null unique,            -- e.g. AAPL, EURUSD
    name   text not null,                   -- e.g. "Apple Inc."
    sort   int  not null default 0
);

-- ---------- canonical person ----------
create table person (
    id              bigint generated always as identity primary key,
    slug            text        not null unique,   -- stable public address
    name            text        not null,
    initials        text,
    bio             text,
    avatar_media_id bigint      references media_asset(id) on delete set null,
    sort            int         not null default 0,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

-- ---------- video <-> security ----------
create table video_security (
    video_id    bigint not null references video(id) on delete cascade,
    security_id bigint not null references security(id) on delete cascade,
    primary key (video_id, security_id)
);
create index idx_video_security_security on video_security(security_id);

-- ---------- video <-> person (with role) ----------
create table video_person (
    video_id  bigint not null references video(id) on delete cascade,
    person_id bigint not null references person(id) on delete cascade,
    role      text   not null default 'host',   -- host | guest
    primary key (video_id, person_id, role)
);
create index idx_video_person_person on video_person(person_id);

-- ---------- articles authored by a person (author unified into person) ----------
alter table article add column person_id bigint references person(id) on delete set null;
create index idx_article_person on article(person_id);

-- ---------- link shows to people (show hosting expressed as a person link) ----------
create table show_person (
    show_id   bigint not null references show(id) on delete cascade,
    person_id bigint not null references person(id) on delete cascade,
    role      text   not null default 'host',
    sort      int    not null default 0,
    primary key (show_id, person_id, role)
);
create index idx_show_person_person on show_person(person_id);

-- ---------- backfill: existing hosts -> person + show_person ----------
-- Deterministic slug from name; de-duplicate people who share the same name across shows
-- so one canonical person is reused. host.id is kept intact (host table is not dropped).
insert into person (slug, name, initials, sort)
select distinct on (lower(h.name))
       regexp_replace(regexp_replace(lower(h.name), '[^a-z0-9]+', '-', 'g'), '(^-|-$)', '', 'g') as slug,
       h.name,
       h.initials,
       0
from host h
order by lower(h.name), h.id
on conflict (slug) do nothing;

insert into show_person (show_id, person_id, role, sort)
select h.show_id,
       p.id,
       coalesce(nullif(h.role, ''), 'host'),
       h.sort
from host h
join person p on lower(p.name) = lower(h.name)
on conflict (show_id, person_id, role) do nothing;

-- ---------- backfill: existing authors -> person + article.person_id ----------
insert into person (slug, name, bio, avatar_media_id, sort)
select distinct on (lower(a.name))
       regexp_replace(regexp_replace(lower(a.name), '[^a-z0-9]+', '-', 'g'), '(^-|-$)', '', 'g') as slug,
       a.name,
       a.bio,
       a.avatar_media_id,
       0
from author a
order by lower(a.name), a.id
on conflict (slug) do nothing;

update article art
set person_id = p.id
from author a
join person p on lower(p.name) = lower(a.name)
where art.author_id = a.id
  and art.person_id is null;
