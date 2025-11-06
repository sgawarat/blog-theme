// SPDX-License-Identifier: MIT
import { codes } from "micromark-util-symbol";
import type { Extension } from "micromark-util-types";
import { tokenizeCitation } from "./citation.ts";
import { tokenizeCitationInText } from "./citationInText.ts";

/**
 * micromark syntax extensionを生成する。
 */
export function pandocCitationSyntax(): Extension {
  return {
    text: {
      [codes.dash]: {
        name: "PandocCitationInText+SuppressAuthor",
        tokenize: tokenizeCitationInText,
      },
      [codes.atSign]: {
        name: "PandocCitationInText",
        tokenize: tokenizeCitationInText,
      },
      [codes.leftSquareBracket]: {
        name: "PandocCitation",
        tokenize: tokenizeCitation,
      },
    },
  };
}
