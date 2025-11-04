// SPDX-License-Identifier: MIT
import { codes } from "micromark-util-symbol";
import type {
  Code,
  Effects,
  State,
  TokenizeContext,
} from "micromark-util-types";
import {} from "./common.ts";

/**
 * 括弧に囲まれていないlocatorをトークン化する。
 *
 * @note NOIMPL
 */
export function tokenizeLocatorWithoutBrackets(
  this: TokenizeContext,
  _effects: Effects,
  _ok: State,
  _nok: State,
): State {
  return _nok;
}

/**
 * 波括弧に囲まれているlocatorをトークン化する。
 *
 * `/(?<open>{)(?<locator>[^};\]\n]*)(?<close>})/`
 */
export function tokenizeLocatorWithCurlyBrackets(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  nok: State,
): State {
  return open;

  function isBreak(code: Code): code is null {
    return (
      code === null ||
      code <= 0 ||
      code === codes.semicolon ||
      code === codes.rightSquareBracket
    );
  }

  // 開き括弧
  function open(code: Code): State | undefined {
    if (code !== codes.leftCurlyBrace) return nok(code);
    effects.enter("pandocCitationOpen");
    effects.consume(code);
    effects.exit("pandocCitationOpen");
    return start;
  }

  // 開始
  function start(code: Code): State | undefined {
    if (isBreak(code)) return nok(code);
    if (code === codes.rightCurlyBrace) return close(code);
    effects.enter("pandocCitationLocator");
    effects.consume(code);
    return finish;
  }

  // 終了
  function finish(code: Code): State | undefined {
    if (isBreak(code)) return nok(code);
    if (code === codes.rightCurlyBrace) {
      effects.exit("pandocCitationLocator");
      return close(code);
    }
    effects.consume(code);
    return finish;
  }

  // 閉じ括弧
  function close(code: Code): State | undefined {
    if (code !== codes.rightCurlyBrace) return nok(code);
    effects.enter("pandocCitationClose");
    effects.consume(code);
    effects.exit("pandocCitationClose");
    return ok;
  }
}

/**
 * 角括弧に囲まれているlocatorをトークン化する。
 *
 * `/(?<open>\[)(?<locator>[^\]\n]*)(?<close>\])/`
 */
export function tokenizeLocatorWithSquareBrackets(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  nok: State,
): State {
  return open;

  function isBreak(code: Code): code is null {
    return code === null || code <= 0;
  }

  // 開き括弧
  function open(code: Code): State | undefined {
    if (code !== codes.leftSquareBracket) return nok(code);
    effects.enter("pandocCitationOpen");
    effects.consume(code);
    effects.exit("pandocCitationOpen");
    return start;
  }

  // 開始
  function start(code: Code): State | undefined {
    if (isBreak(code)) return nok(code);
    if (code === codes.rightSquareBracket) {
      return close(code);
    }
    effects.enter("pandocCitationLocator");
    effects.consume(code);
    return finish;
  }

  // 終了
  function finish(code: Code): State | undefined {
    if (isBreak(code)) return nok(code);
    if (code === codes.rightSquareBracket) {
      effects.exit("pandocCitationLocator");
      return close(code);
    }
    effects.consume(code);
    return finish;
  }

  // 閉じ括弧
  function close(code: Code): State | undefined {
    if (code !== codes.rightSquareBracket) return nok(code);
    effects.enter("pandocCitationClose");
    effects.consume(code);
    effects.exit("pandocCitationClose");
    return ok;
  }
}
