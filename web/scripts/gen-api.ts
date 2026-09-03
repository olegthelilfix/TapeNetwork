import { generate } from '@devexperts/swagger-codegen-ts';
import { serialize } from '@devexperts/swagger-codegen-ts/dist/language/typescript/3.0';
import { OpenapiObjectCodec } from '@devexperts/swagger-codegen-ts/dist/schema/3.0/openapi-object';
import { rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const apiSpecUrl = process.env.API_SPEC_URL ?? 'http://localhost:8080/v3/api-docs';
const specPath = resolve('api');

const main = async () => {
  const response = await fetch(apiSpecUrl);

  if (!response.ok) {
    throw new Error(`Unable to load OpenAPI spec: ${response.status} ${response.statusText}`);
  }

  try {
    await writeFile(specPath, await response.text(), 'utf8');

    const result = await generate({
      out: './src',
      spec: specPath,
      decoder: OpenapiObjectCodec,
      language: serialize,
    })();

    if (result._tag === 'Left') {
      throw result.left;
    }
  } finally {
    await rm(specPath, { force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
