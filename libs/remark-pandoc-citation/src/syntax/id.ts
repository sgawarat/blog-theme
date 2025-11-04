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
 * IDに含めることができる文字と約物の正規表現。
 */
const ID_CHARACTER_REGEXP = /[\w_:.#$%&\-+?<>~/]/;

/**
 * IDに含めることができる文字の正規表現。
 */
const ID_LETTER_REGEXP = /[\w_]/;

/**
 * IDに含めることができる約物の正規表現。
 */
const ID_PUNCTUATION_REGEXP = /[:.#$%&\-+?<>~/]/;

/**
 * codeがIDに含められる文字または約物か調べる。
 */
function isIdCharacter(code: Code): code is number {
  return (
    code !== null &&
    code > 0 &&
    ID_CHARACTER_REGEXP.test(String.fromCharCode(code))
  );
}

/**
 * codeがIDに含められる文字か調べる。
 */
function isIdLetter(code: Code): code is number {
  return (
    code !== null &&
    code > 0 &&
    ID_LETTER_REGEXP.test(String.fromCharCode(code))
  );
}

/**
 * codeがIDに含められる約物か調べる。
 */
function isIdPunctuation(code: Code): code is number {
  return (
    code !== null &&
    code > 0 &&
    ID_PUNCTUATION_REGEXP.test(String.fromCharCode(code))
  );
}

/**
 * 波括弧に囲まれているIDをトークン化する。
 *
 * `/(?<open>{)(?<id>${idLetter}+)(?<close>})/`
 */
function tokenizeIdBodyWithCurlyBrackets(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  nok: State,
): State {
  return open;

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
    if (code === codes.rightCurlyBrace) return close(code);
    if (!isIdCharacter(code)) return nok(code);
    effects.enter("pandocCitationId");
    effects.consume(code);
    return finish;
  }

  // 終了
  function finish(code: Code): State | undefined {
    if (code === codes.rightCurlyBrace) {
      effects.exit("pandocCitationId");
      return close(code);
    }
    if (!isIdCharacter(code)) return nok(code);
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
 * 括弧に囲われていないIDをトークン化する。
 */
function tokenizeIdBodyWithoutBrackets(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  nok: State,
): State {
  const check = effects.check(
    {
      tokenize(effects, ok, nok) {
        return start;

        function start(code: Code): State | undefined {
          if (isIdLetter(code)) return ok(code);
          if (!isIdPunctuation(code)) return nok(code);
          effects.consume(code);
          return finish;
        }

        function finish(code: Code): State | undefined {
          if (isIdLetter(code)) return ok(code);
          return nok(code);
        }
      },
    },
    consume,
    exit,
  );
  return enter;

  function enter(code: Code): State | undefined {
    if (!isIdLetter(code)) return nok(code);
    effects.enter("pandocCitationId");
    effects.consume(code);
    return check;
  }

  function consume(code: Code): State | undefined {
    effects.consume(code);
    return check;
  }

  function exit(code: Code): State | undefined {
    effects.exit("pandocCitationId");
    return ok(code);
  }
}

/**
 * IDの接頭辞をトークン化する。
 */
export function tokenizeIdPrefix(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  nok: State,
): State {
  return (code) => {
    // -@
    if (code === codes.dash) {
      effects.enter("pandocCitationIdPrefix");
      effects.consume(code);
      return (code) => {
        if (code !== codes.atSign) return nok(code);
        effects.consume(code);
        effects.exit("pandocCitationIdPrefix");
        return ok;
      };
    }
    // @
    if (code === codes.atSign) {
      effects.enter("pandocCitationIdPrefix");
      effects.consume(code);
      effects.exit("pandocCitationIdPrefix");
      return ok;
    }
    return nok(code);
  };
}

/**
 * IDをトークン化する。
 */
export function tokenizeId(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  nok: State,
): State {
  return tokenizeIdPrefix.call(
    this,
    effects,
    effects.attempt(
      [
        { tokenize: tokenizeIdBodyWithCurlyBrackets },
        { tokenize: tokenizeIdBodyWithoutBrackets },
      ],
      ok,
      nok,
    ),
    nok,
  );
}
