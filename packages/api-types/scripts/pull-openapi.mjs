#!/usr/bin/env node
// Pulls OpenAPI definitions (one file per springdoc group) from a running backend
// and writes them into ../generated. The backend must already be running, e.g.:
//   docker compose up -d postgres backend
//
// Usage:
//   node pull-openapi.mjs [baseUrl]
// baseUrl defaults to $OPENAPI_BASE_URL or http://localhost:8080

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const baseUrl = (process.argv[2] || process.env.OPENAPI_BASE_URL || "http://localhost:8080").replace(/\/+$/, "");
const outDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "generated");

/**
 * Fetch a URL and return its body as text, throwing on a non-OK response.
 * @param {string} url
 * @returns {Promise<string>}
 */
const fetchText = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`);
  }
  return res.text();
};

/**
 * Pull a single spec and write it to generated/<baseName>.json.
 * @param {string} baseName
 * @param {string} jsonUrl
 * @returns {Promise<void>}
 */
const writeSpec = async (baseName, jsonUrl) => {
  const json = await fetchText(jsonUrl);
  await writeFile(path.join(outDir, `${baseName}.json`), json);
  console.log(`wrote ${baseName}.json`);
};

/**
 * Discover springdoc groups from swagger-config and pull each one, falling back
 * to the single /v3/api-docs schema when no groups are configured.
 * @returns {Promise<void>}
 */
const main = async () => {
  await mkdir(outDir, { recursive: true });

  let groups = [];
  try {
    const config = JSON.parse(await fetchText(`${baseUrl}/v3/api-docs/swagger-config`));
    groups = Array.isArray(config.urls) ? config.urls : [];
  } catch (err) {
    throw new Error(
      `Could not reach ${baseUrl}/v3/api-docs/swagger-config (${err.message}). ` +
        `Is the backend running? Try: docker compose up -d postgres backend`,
    );
  }

  if (groups.length === 0) {
    console.log("No springdoc groups configured, falling back to the single /v3/api-docs schema.");
    await writeSpec("openapi", `${baseUrl}/v3/api-docs`);
    return;
  }

  for (const { name, url } of groups) {
    const absoluteUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;
    await writeSpec(`${name}-openapi`, absoluteUrl);
  }
};

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
