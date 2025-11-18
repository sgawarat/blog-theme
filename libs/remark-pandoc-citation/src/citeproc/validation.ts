// SPDX-License-Identifier: MIT
import { Ajv, type ValidateFunction } from "ajv";
import ajvErrors from "ajv-errors";
import cslCitationJsonSchema from "./schema/csl-citation.json" with {
  type: "json",
};
import cslDataJsonSchema from "./schema/csl-data.json" with { type: "json" };
import type { CslCitation, CslData } from "./schema.ts";

const ajv = new Ajv({ allErrors: true });
ajvErrors.default(ajv);

const isCslData: ValidateFunction<CslData> =
  ajv.compile<CslData>(cslDataJsonSchema);

const isCslCitation: ValidateFunction<CslCitation> = ajv.compile<CslCitation>(
  cslCitationJsonSchema,
);

export function parseCslData(value: unknown): CslData {
  if (isCslData(value)) return value;
  throw new Error(`${isCslData.errors}`);
}

export function parseCslCitation(value: unknown): CslCitation {
  if (isCslCitation(value)) return value;
  throw new Error(`${isCslCitation.errors}`);
}
