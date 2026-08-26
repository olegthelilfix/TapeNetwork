-- Tape Network initial schema
-- Conventions: bigint identity PKs, text slugs for public lookups, timestamptz for time.

-- ---------- media ----------
create table media_asset (
    id          bigint generated always as identity primary key,
    filename    text        not null,
    url         text        not null,
    mime        text,
    kind        text        not null default 'image',   -- image | video
    width       int,
    height      int,
    created_at  timestamptz not null default now()
);

-- ---------- shows ----------
create table show (
    id             bigint generated always as identity primary key,
    slug           text        not null unique,
    name           text        not null,
    tagline        text,
    blurb          text,
    description    text,
    schedule_slot  text,
    episodes_count int         not null default 0,
    hours_per_week text,
    monthly_views  text,
    cover_media_id bigint      references media_asset(id) on delete set null,
    sort           int         not null default 0,
    published      boolean     not null default true,
    created_at     timestamptz not null default now(),
    updated_at     timestamptz not null default now()
);

create table host (
    id        bigint generated always as identity primary key,
    show_id   bigint      not null references show(id) on delete cascade,
    initials  text,
    name      text        not null,
    role      text,
    sort      int         not null default 0
);
create index idx_host_show on host(show_id);

create table episode (
    id            bigint generated always as identity primary key,
    show_id       bigint      not null references show(id) on delete cascade,
    slug          text        not null unique,
    ep_no         text,
    title         text        not null,
    description   text,
    published_at  timestamptz,
    duration_sec  int,
    views         text,
    video_url     text,
    thumb_media_id bigint     references media_asset(id) on delete set null,
    is_live       boolean     not null default false,
    tags          text[]      not null default '{}',
    published      boolean    not null default true,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);
create index idx_episode_show on episode(show_id);

-- ---------- on-demand catalog ----------
create table category (
    id            bigint generated always as identity primary key,
    slug          text        not null unique,
    name          text        not null,
    blurb         text,
    cover_media_id bigint     references media_asset(id) on delete set null,
    sort          int         not null default 0,
    published     boolean     not null default true
);

create table subcategory (
    id           bigint generated always as identity primary key,
    category_id  bigint       not null references category(id) on delete cascade,
    slug         text         not null unique,
    name         text         not null,
    blurb        text,
    sort         int          not null default 0
);
create index idx_subcategory_category on subcategory(category_id);

create table video (
    id             bigint generated always as identity primary key,
    subcategory_id bigint      not null references subcategory(id) on delete cascade,
    show_id        bigint      references show(id) on delete set null,
    slug           text        not null unique,
    title          text        not null,
    description    text,
    published_at   timestamptz,
    duration_sec   int,
    views          text,
    video_url      text,
    thumb_media_id bigint      references media_asset(id) on delete set null,
    tags           text[]      not null default '{}',
    published      boolean     not null default true,
    created_at     timestamptz not null default now(),
    updated_at     timestamptz not null default now()
);
create index idx_video_subcategory on video(subcategory_id);

-- ---------- articles ----------
create table author (
    id             bigint generated always as identity primary key,
    name           text        not null,
    bio            text,
    avatar_media_id bigint     references media_asset(id) on delete set null
);

create table article (
    id            bigint generated always as identity primary key,
    slug          text        not null unique,
    category_id   bigint      references category(id) on delete set null,
    author_id     bigint      references author(id) on delete set null,
    title         text        not null,
    dek           text,
    body          jsonb       not null default '[]'::jsonb,  -- array of paragraph blocks
    read_minutes  int,
    hero_media_id bigint      references media_asset(id) on delete set null,
    published_at  timestamptz,
    published     boolean     not null default false,
    featured      boolean     not null default false,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);
create index idx_article_category on article(category_id);

-- ---------- schedule / ticker / chat (mock/seed, editable via CMS) ----------
create table schedule_slot (
    id          bigint generated always as identity primary key,
    day_of_week int,                       -- 0=Sun..6=Sat, null = every weekday
    time_et     text        not null,
    show_id     bigint      references show(id) on delete set null,
    hosts_label text,
    is_live     boolean     not null default false,
    sort        int         not null default 0
);

create table ticker_quote (
    id        bigint generated always as identity primary key,
    symbol    text        not null,
    price     text        not null,
    change    text        not null,
    direction text        not null default 'up',   -- up | down
    sort      int         not null default 0
);

create table chat_message (
    id           bigint generated always as identity primary key,
    display_name text        not null,
    text         text        not null,
    kind         text        not null default 'user',  -- user | mod
    sort         int         not null default 0
);

-- ---------- home layout ----------
create table home_block (
    id        bigint generated always as identity primary key,
    type      text        not null,     -- featured | most_watched | up_next
    ref_type  text,                      -- episode | video | article
    ref_id    bigint,
    label     text,
    sort      int         not null default 0
);

-- ---------- admin users (CMS only) ----------
create table admin_user (
    id            bigint generated always as identity primary key,
    email         text        not null unique,
    password_hash text        not null,
    role          text        not null default 'EDITOR',  -- ADMIN | EDITOR | AUTHOR
    active        boolean     not null default true,
    created_at    timestamptz not null default now()
);

-- ---------- Postgres full-text (secondary path alongside Hibernate Search/Lucene) ----------
alter table article add column search_tsv tsvector
    generated always as (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(dek,''))) stored;
create index idx_article_tsv on article using gin(search_tsv);

alter table video add column search_tsv tsvector
    generated always as (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,''))) stored;
create index idx_video_tsv on video using gin(search_tsv);

alter table episode add column search_tsv tsvector
    generated always as (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,''))) stored;
create index idx_episode_tsv on episode using gin(search_tsv);

alter table show add column search_tsv tsvector
    generated always as (to_tsvector('english', coalesce(name,'') || ' ' || coalesce(blurb,''))) stored;
create index idx_show_tsv on show using gin(search_tsv);
