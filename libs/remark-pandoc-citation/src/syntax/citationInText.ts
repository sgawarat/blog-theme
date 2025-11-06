// SPDX-License-Identifier: MIT
import type { Effects, State, TokenizeContext } from "micromark-util-types";
import { tokenizeWhitespaces } from "./common.ts";
import { tokenizeId } from "./id.ts";
import { tokenizeLocatorWithSquareBrackets } from "./locator.ts";

function tokenizeLocatorAfterId(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  nok: State,
): State {
  return effects.attempt(
    {
      tokenize(effects, ok, nok) {
        const locator = tokenizeLocatorWithSquareBrackets.call(
          this,
          effects,
          ok,
          nok,
        );
        return tokenizeWhitespaces.call(this, effects, locator, nok);
      },
    },
    ok,
    nok,
  );
}

/**
 * author-in-textスタイルのcitationをトークン化する。
 */
export function tokenizeCitationInText(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  nok: State,
): State {
  return effects.attempt(
    {
      tokenize(effects, ok, nok) {
        const exit: State = (code) => {
          effects.exit("pandocCitationItem");
          effects.exit("pandocCitation");
          return ok(code);
        };
        const optionalLocator = tokenizeLocatorAfterId.call(
          this,
          effects,
          exit,
          exit,
        );
        const id = tokenizeId.call(this, effects, optionalLocator, nok);
        return (code) => {
          effects.enter("pandocCitation", { _pandocCitationInText: true });
          effects.enter("pandocCitationItem");
          return id(code);
        };
      },
    },
    ok,
    nok,
  );
}
