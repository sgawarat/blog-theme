// SPDX-License-Identifier: MIT
import { codes } from "micromark-util-symbol";
import type {
  Code,
  Effects,
  State,
  TokenizeContext,
} from "micromark-util-types";

declare module "micromark-util-types" {
  interface TokenTypeMap {
    pandocCitation: "pandocCitation";
    pandocCitationOpen: "pandocCitationOpen";
    pandocCitationClose: "pandocCitationClose";
    pandocCitationItem: "pandocCitationItem";
    pandocCitationPrefix: "pandocCitationPrefix";
    pandocCitationIdPrefix: "pandocCitationIdPrefix";
    pandocCitationId: "pandocCitationId";
    pandocCitationLocatorOuter: "pandocCitationLocatorOuter";
    pandocCitationLocator: "pandocCitationLocator";
    pandocCitationSuffix: "pandocCitationSuffix";
    pandocCitationItemDelimiter: "pandocCitationItemDelimiter";
    pandocCitationComma: "pandocCitationComma";
    pandocCitationWhitespaces: "pandocCitationWhitespaces";
  }

  interface Token {
    _pandocCitationInText?: true | undefined;
  }
}

/**
 * 空白をトークン化する。
 */
export function tokenizeWhitespaces(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  _nok: State,
): State {
  return start;

  function start(code: Code): State | undefined {
    if (code !== codes.space) return ok(code);
    effects.enter("pandocCitationWhitespaces");
    effects.consume(code);
    return finish;
  }

  function finish(code: Code): State | undefined {
    if (code !== codes.space) {
      effects.exit("pandocCitationWhitespaces");
      return ok(code);
    }
    effects.consume(code);
    return finish;
  }
}
