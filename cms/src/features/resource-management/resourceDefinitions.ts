import type { ResourceDefinition } from "./ResourceDefinition";

const published = { name: "published", label: "Published", type: "boolean", inList: true } as const;
const sort = { name: "sort", label: "Sort", type: "number" } as const;

export const resourceDefinitions: readonly ResourceDefinition[] = [
  {
    name: "shows", label: "Shows", fields: [
      { name: "name", label: "Name", type: "text", required: true, inList: true },
      { name: "slug", label: "Slug", type: "text", required: true, inList: true },
      { name: "tagline", label: "Tagline", type: "text" }, { name: "blurb", label: "Blurb", type: "textarea" },
      { name: "description", label: "Description", type: "textarea" }, { name: "scheduleSlot", label: "Schedule slot", type: "text", inList: true },
      { name: "episodesCount", label: "Episodes count", type: "number" }, { name: "hoursPerWeek", label: "Hours / week", type: "text" },
      { name: "monthlyViews", label: "Monthly views", type: "text" }, { name: "coverMediaId", label: "Cover image", type: "media" }, sort, published,
    ],
  },
  {
    name: "episodes", label: "Episodes", fields: [
      { name: "showId", label: "Show", type: "reference", refResource: "shows", optionLabel: "name", required: true },
      { name: "title", label: "Title", type: "text", required: true, inList: true }, { name: "slug", label: "Slug", type: "text", required: true, inList: true },
      { name: "epNo", label: "Episode no.", type: "text", inList: true }, { name: "description", label: "Description", type: "textarea" },
      { name: "publishedAt", label: "Published at", type: "datetime" }, { name: "durationSec", label: "Duration (sec)", type: "number" },
      { name: "views", label: "Views label", type: "text" }, { name: "videoUrl", label: "Video", type: "streamVideo" },
      { name: "thumbMediaId", label: "Thumbnail", type: "media" }, { name: "live", label: "Live", type: "boolean", inList: true },
      { name: "tags", label: "Tags", type: "tags" }, published,
    ],
  },
  {
    name: "hosts", label: "Hosts", fields: [
      { name: "showId", label: "Show", type: "reference", refResource: "shows", optionLabel: "name", required: true },
      { name: "name", label: "Name", type: "text", required: true, inList: true }, { name: "initials", label: "Initials", type: "text", inList: true },
      { name: "role", label: "Role", type: "text" }, sort,
    ],
  },
  {
    name: "categories", label: "Categories", fields: [
      { name: "name", label: "Name", type: "text", required: true, inList: true }, { name: "slug", label: "Slug", type: "text", required: true, inList: true },
      { name: "blurb", label: "Blurb", type: "textarea" }, { name: "coverMediaId", label: "Cover image", type: "media" }, sort, published,
    ],
  },
  {
    name: "subcategories", label: "Subcategories", fields: [
      { name: "categoryId", label: "Category", type: "reference", refResource: "categories", optionLabel: "name", required: true },
      { name: "name", label: "Name", type: "text", required: true, inList: true }, { name: "slug", label: "Slug", type: "text", required: true, inList: true },
      { name: "blurb", label: "Blurb", type: "textarea" }, sort,
    ],
  },
  {
    name: "videos", label: "Videos", fields: [
      { name: "subcategoryId", label: "Subcategory", type: "reference", refResource: "subcategories", optionLabel: "name", required: true },
      { name: "showId", label: "Show", type: "reference", refResource: "shows", optionLabel: "name" },
      { name: "title", label: "Title", type: "text", required: true, inList: true }, { name: "slug", label: "Slug", type: "text", required: true, inList: true },
      { name: "description", label: "Description", type: "textarea" }, { name: "publishedAt", label: "Published at", type: "datetime" },
      { name: "durationSec", label: "Duration (sec)", type: "number" }, { name: "views", label: "Views label", type: "text" },
      { name: "videoUrl", label: "Video", type: "streamVideo" }, { name: "thumbMediaId", label: "Thumbnail", type: "media" },
      { name: "tags", label: "Tags", type: "tags" }, published,
    ],
  },
  {
    name: "authors", label: "Authors", fields: [
      { name: "name", label: "Name", type: "text", required: true, inList: true }, { name: "bio", label: "Bio", type: "textarea" },
      { name: "avatarMediaId", label: "Avatar", type: "media" },
    ],
  },
  {
    name: "articles", label: "Articles", fields: [
      { name: "title", label: "Title", type: "text", required: true, inList: true }, { name: "slug", label: "Slug", type: "text", required: true, inList: true },
      { name: "categoryId", label: "Category", type: "reference", refResource: "categories", optionLabel: "name" },
      { name: "authorId", label: "Author", type: "reference", refResource: "authors", optionLabel: "name" },
      { name: "dek", label: "Dek", type: "textarea" }, { name: "body", label: "Body (paragraphs)", type: "stringArray" },
      { name: "readMinutes", label: "Read minutes", type: "number" }, { name: "heroMediaId", label: "Hero image", type: "media" },
      { name: "publishedAt", label: "Published at", type: "datetime" }, { name: "featured", label: "Featured", type: "boolean", inList: true }, published,
    ],
  },
  {
    name: "schedule", label: "Schedule", fields: [
      { name: "timeEt", label: "Time (ET)", type: "text", required: true, inList: true },
      { name: "showId", label: "Show", type: "reference", refResource: "shows", optionLabel: "name" },
      { name: "hostsLabel", label: "Hosts label", type: "text", inList: true }, { name: "dayOfWeek", label: "Day of week (0-6)", type: "number" },
      { name: "live", label: "Live", type: "boolean", inList: true }, sort,
    ],
  },
  {
    name: "ticker", label: "Ticker", fields: [
      { name: "symbol", label: "Symbol", type: "text", required: true, inList: true }, { name: "price", label: "Price", type: "text", required: true, inList: true },
      { name: "change", label: "Change", type: "text", required: true, inList: true },
      { name: "direction", label: "Direction", type: "select", options: [{ label: "Up", value: "up" }, { label: "Down", value: "down" }] }, sort,
    ],
  },
  {
    name: "home-blocks", label: "Home layout", fields: [
      { name: "type", label: "Block", type: "select", required: true, inList: true, options: [{ label: "Featured", value: "featured" }, { label: "Most watched", value: "most_watched" }, { label: "Up next", value: "up_next" }] },
      { name: "refType", label: "Ref type", type: "select", inList: true, options: [{ label: "Episode", value: "episode" }, { label: "Video", value: "video" }, { label: "Article", value: "article" }] },
      { name: "refId", label: "Ref id", type: "number", inList: true }, { name: "label", label: "Label", type: "text" }, sort,
    ],
  },
  {
    name: "media", label: "Media", fields: [
      { name: "filename", label: "Filename", type: "text", inList: true }, { name: "url", label: "URL", type: "text", required: true, inList: true },
      { name: "kind", label: "Kind", type: "select", inList: true, options: [{ label: "Image", value: "image" }, { label: "Video", value: "video" }] },
      { name: "mime", label: "MIME", type: "text" }, { name: "width", label: "Width", type: "number" }, { name: "height", label: "Height", type: "number" },
    ],
  },
];
