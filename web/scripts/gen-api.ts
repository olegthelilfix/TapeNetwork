import { generate } from '@devexperts/swagger-codegen-ts';
import { serialize } from '@devexperts/swagger-codegen-ts/dist/language/typescript/3.0';
import { OpenapiObjectCodec } from '@devexperts/swagger-codegen-ts/dist/schema/3.0/openapi-object';
import { rm, writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const devApiSpecUrl = 'http://localhost:8080/v3/api-docs';
const specPath = resolve('..', 'packages', 'api-types', 'generated', 'user-openapi.json');
const tempFilePath = 'api';

const getSpecs = async () => {
  const fileData = await readFile(specPath, 'utf8').then(data => JSON.parse(data)).catch(() => null);
  if (fileData) {
    console.log(`Using local OpenAPI spec from ${specPath}`);
    return fileData;
  }
  console.log(`Fetching OpenAPI spec from ${devApiSpecUrl}`);
  const response = await fetch(devApiSpecUrl);
  if (!response.ok) {
    throw new Error(`Unable to load OpenAPI spec: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

const main = async () => {
  const specsData = await getSpecs();

  try {
    // Write the OpenAPI spec to a temporary file for code generation
    // Yes, the file might already exists in /packages/api-types/generated
    // but we need a new file to avoid issues with the codegen tool.
    // The file will be removed after the code generation is complete.
    await writeFile(tempFilePath, JSON.stringify(specsData), 'utf8');

    const result = await generate({
      out: './src',
      spec: tempFilePath,
      decoder: OpenapiObjectCodec,
      language: serialize,
    })();

    if (result._tag === 'Left') {
      throw result.left;
    }
  } finally {
    await rm(tempFilePath, { force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
