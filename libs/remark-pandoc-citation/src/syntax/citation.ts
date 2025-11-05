// SPDX-License-Identifier: MIT
import { codes } from "micromark-util-symbol";
import type {
  Code,
  Effects,
  State,
  TokenizeContext,
} from "micromark-util-types";
import { tokenizeWhitespaces } from "./common.ts";
import { tokenizeId, tokenizeIdPrefix } from "./id.ts";
import {
  tokenizeLocatorWithCurlyBrackets,
  tokenizeLocatorWithoutBrackets,
} from "./locator.ts";

/**
 * suffixをトークン化する。
 *
 * `;`か`]`が見つかったとき、okで制御を返す。
 * `\n`かEOFが見つかったとき、nokで制御を返す。
 *
 * `/(?<suffix>[^;\]\n]*?)(?<whitespaces>\s*)/`
 */
function tokenizeSuffix(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  nok: State,
): State {
  const finish = effects.attempt(
    {
      tokenize(effects, ok, nok) {
        effects.exit("pandocCitationSuffix");
        return tokenizeWhitespaces.call(
          this,
          effects,
          (code: Code) => {
            if (code === codes.semicolon || code === codes.rightSquareBracket) {
              return ok(code);
            }
            return nok(code);
          },
          nok,
        );
      },
    },
    ok,
    (code) => {
      if (isBreak(code)) return nok(code);
      effects.consume(code);
      return finish;
    },
  );
  const start = effects.attempt(
    {
      tokenize(effects, ok, nok) {
        return tokenizeWhitespaces.call(
          this,
          effects,
          (code: Code) => {
            if (code === codes.semicolon || code === codes.rightSquareBracket) {
              return ok(code);
            }
            return nok(code);
          },
          nok,
        );
      },
    },
    ok,
    (code) => {
      if (isBreak(code)) return nok(code);
      effects.enter("pandocCitationSuffix");
      effects.consume(code);
      return finish;
    },
  );
  return start;

  function isBreak(code: Code): code is null {
    return code === null || code <= codes.carriageReturnLineFeed;
  }
}

/**
 * IDの後ろにあるlocatorをトークン化する。
 *
 * 処理が正常終了すればokで、異常終了すればnokで制御を返す。
 *
 * `/(?<comma>,)?(?<whitespaces>\s*)(?<locator>.*|{.*})/`
 */
function tokenizeLocatorAfterId(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  nok: State,
): State {
  const locator = effects.attempt(
    [
      { tokenize: tokenizeLocatorWithoutBrackets },
      { tokenize: tokenizeLocatorWithCurlyBrackets },
    ],
    ok,
    nok,
  );
  const whitespaces = tokenizeWhitespaces.call(this, effects, locator, nok);
  return (code) => {
    if (code !== codes.comma) return whitespaces(code);
    effects.enter("pandocCitationComma");
    effects.consume(code);
    effects.exit("pandocCitationComma");
    return whitespaces;
  };
}

/**
 * prefixをトークン化する。
 *
 * `@`か`-@`が見つかったとき、okで制御を返す。
 * `;`、`]`、`\n`、EOFのいずれかが見つかったとき、nokで制御を返す。
 *
 * `/(?<whitespaces>\s*)(?<prefix>[^;\]\n]*?)(?<idPrefix>-@|@)/`
 */
function tokenizePrefix(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  nok: State,
): State {
  const exit = effects.check(
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
      return exit;
    },
  );
  const enter = effects.check(
    {
      tokenize: tokenizeIdPrefix,
    },
    ok,
    (code) => {
      if (isBreak(code)) return nok(code);
      effects.enter("pandocCitationPrefix");
      effects.consume(code);
      return exit;
    },
  );
  return tokenizeWhitespaces.call(this, effects, enter, nok);

  function isBreak(code: Code): code is null {
    return (
      code === null ||
      code <= codes.carriageReturnLineFeed ||
      code === codes.semicolon ||
      code === codes.rightSquareBracket
    );
  }
}

/**
 * citationの項目をトークン化する。
 */
function tokenizeCitationItem(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  nok: State,
): State {
  const exit: State = (code) => {
    effects.exit("pandocCitationItem");
    return ok(code);
  };
  const suffix = tokenizeSuffix.call(this, effects, exit, nok);
  const optionalLocator = tokenizeLocatorAfterId.call(
    this,
    effects,
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
export function tokenizeCitation(
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
