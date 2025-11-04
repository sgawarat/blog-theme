// SPDX-License-Identifier: MIT
import { codes } from "micromark-util-symbol";
import type {
  Code,
  Effects,
  Extension,
  State,
  TokenizeContext,
} from "micromark-util-types";
import {} from "./common.ts";
import { tokenizeId, tokenizeIdPrefix } from "./id.ts";
import {
  tokenizeLocatorWithCurlyBrackets,
  tokenizeLocatorWithoutBrackets,
  tokenizeLocatorWithSquareBrackets,
} from "./locator.ts";

/**
 * prefixをトークン化する。
 *
 * `/(?<prefix>[^;\]\n]*?)(?<idPrefix>-@|@)/`
 */
function tokenizePrefix(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  nok: State,
): State {
  const finish = effects.check(
    {
      tokenize: tokenizeIdPrefix,
    },
    (code) => {
      effects.exit("pandocCitationPrefix");
      return ok(code);
    },
    (code) => {
      if (isBreak(code)) return nok(code);
      effects.consume(code);
      return finish;
    },
  );
  const start = effects.check(
    {
      tokenize: tokenizeIdPrefix,
    },
    ok,
    (code) => {
      if (isBreak(code)) return nok(code);
      effects.enter("pandocCitationPrefix");
      effects.consume(code);
      return finish;
    },
  );
  return start;

  function isBreak(code: Code): code is null {
    return (
      code === null ||
      code <= 0 ||
      code === codes.semicolon ||
      code === codes.rightSquareBracket
    );
  }
}

/**
 * suffixをトークン化する。
 *
 * `/(?<suffix>[^;\]\n]*)/`
 */
function tokenizeSuffix(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  nok: State,
): State {
  return start;

  function isBreak(code: Code): code is null {
    return code === null || code <= 0;
  }

  function start(code: Code): State | undefined {
    if (isBreak(code)) return nok(code);
    if (code === codes.semicolon || code === codes.rightSquareBracket) {
      return ok(code);
    }
    effects.enter("pandocCitationSuffix");
    effects.consume(code);
    return finish;
  }

  function finish(code: Code): State | undefined {
    if (isBreak(code)) return nok(code);
    if (code === codes.semicolon || code === codes.rightSquareBracket) {
      effects.exit("pandocCitationSuffix");
      return ok(code);
    }
    effects.consume(code);
    return finish;
  }
}

/**
 * 空白をトークン化する。
 */
function tokenizeWhitespaces(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  _nok: State,
): State {
  return start;

  function start(code: Code): State | undefined {
    if (code !== codes.space) return ok(code);
    effects.enter("pandocCitationSpace");
    effects.consume(code);
    return finish;
  }

  function finish(code: Code): State | undefined {
    if (code !== codes.space) {
      effects.exit("pandocCitationSpace");
      return ok(code);
    }
    effects.consume(code);
    return finish;
  }
}

/**
 * citation要素をトークン化する。
 */
function tokenizeCitationItem(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  nok: State,
): State {
  const suffix = tokenizeSuffix.call(
    this,
    effects,
    (code) => {
      effects.exit("pandocCitationItem");
      return ok(code);
    },
    nok,
  );
  const optionalLocator = effects.attempt(
    [
      { tokenize: tokenizeLocatorWithoutBrackets },
      {
        tokenize(effects, ok, nok) {
          const locator = tokenizeLocatorWithCurlyBrackets.call(
            this,
            effects,
            ok,
            nok,
          );
          const whitespaces = tokenizeWhitespaces.call(
            this,
            effects,
            locator,
            nok,
          );
          return (code) => {
            if (code === codes.comma) {
              effects.enter("pandocCitationComma");
              effects.consume(code);
              effects.exit("pandocCitationComma");
              return whitespaces;
            }
            return whitespaces(code);
          };
        },
      },
    ],
    suffix,
    suffix,
  );
  const id = tokenizeId.call(this, effects, optionalLocator, nok);
  const prefix = tokenizePrefix.call(this, effects, id, nok);
  return (code) => {
    effects.enter("pandocCitationItem");
    return prefix(code);
  };
}

/**
 * citationをトークン化する。
 */
function tokenizeCitation(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  nok: State,
): State {
  return effects.attempt(
    {
      tokenize(effects, ok, nok) {
        const self = this;
        return open;

        function open(code: Code): State | undefined {
          if (code !== codes.leftSquareBracket) return nok(code);
          effects.enter("pandocCitation");
          effects.enter("pandocCitationOpen");
          effects.consume(code);
          effects.exit("pandocCitationOpen");
          return tokenizeCitationItem.call(self, effects, next, nok);
        }

        function next(code: Code): State | undefined {
          if (code === codes.rightSquareBracket) return close(code);
          if (code === codes.semicolon) {
            effects.enter("pandocCitationItemDelimiter");
            effects.consume(code);
            effects.exit("pandocCitationItemDelimiter");
            return tokenizeCitationItem.call(self, effects, next, nok);
          }
          return nok(code);
        }

        function close(code: Code): State | undefined {
          if (code !== codes.rightSquareBracket) return nok(code);
          effects.enter("pandocCitationClose");
          effects.consume(code);
          effects.exit("pandocCitationClose");
          effects.exit("pandocCitation");
          return ok;
        }
      },
    },
    ok,
    nok,
  );
}

/**
 * author-in-text citationをトークン化する。
 */
function tokenizeAuthorInTextCitation(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  nok: State,
): State {
  return effects.attempt(
    {
      tokenize(effects, ok, nok) {
        const exit = (code) => {
          effects.exit("pandocCitation");
          return ok(code);
        };
        const optionalLocator = effects.attempt(
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
          exit,
          exit,
        );
        const id = tokenizeId.call(this, effects, optionalLocator, nok);
        return (code) => {
          effects.enter("pandocCitation");
          return id(code);
        };
      },
    },
    ok,
    nok,
  );
}

/**
 * micromark syntax extensionを生成する。
 */
export function pandocCitationSyntax(): Extension {
  return {
    text: {
      [codes.dash]: {
        name: "pandocCitation",
        tokenize: tokenizeAuthorInTextCitation,
      },
      [codes.atSign]: {
        name: "pandocCitation",
        tokenize: tokenizeAuthorInTextCitation,
      },
      [codes.leftSquareBracket]: {
        name: "pandocCitation",
        tokenize: tokenizeCitation,
      },
    },
  };
}
