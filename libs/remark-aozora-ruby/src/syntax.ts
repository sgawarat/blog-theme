// SPDX-License-Identifier: MIT
import { codes } from "micromark-util-symbol";
import type {
  Code,
  Effects,
  Extension,
  State,
  TokenizeContext,
} from "micromark-util-types";

declare module "micromark-util-types" {
  interface TokenTypeMap {
    aozoraRuby: "aozoraRuby";
    aozoraRubyPrefix: "aozoraRubyPrefix";
    aozoraRubyOpen: "aozoraRubyOpen";
    aozoraRubyText: "aozoraRubyText";
    aozoraRubyClose: "aozoraRubyClose";
  }

  interface Token {
    _aozoraRubySyntaxType?: AozoraRubySyntaxType | undefined;
  }

  interface TokenizeContext {
    _aozoraRubyConfig?: AozoraRubySyntaxConfig | undefined;
  }
}

interface AozoraRubySyntaxConfig {
  prefix: number;
  opening: number;
  closing: number;
}

const defaultConfig: AozoraRubySyntaxConfig = {
  prefix: "｜".codePointAt(0) ?? 0,
  opening: "《".codePointAt(0) ?? 0,
  closing: "》".codePointAt(0) ?? 0,
};

function isBreak(code: Code): code is null {
  return code === null || code <= codes.carriageReturnLineFeed;
}

function tokenizeRubyText(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  nok: State,
): State {
  const { opening, closing } = this._aozoraRubyConfig ?? defaultConfig;
  return open;

  function open(code: Code): State | undefined {
    if (code !== opening) return nok(code);
    effects.enter("aozoraRubyOpen");
    effects.consume(code);
    effects.exit("aozoraRubyOpen");
    return startRubyText;
  }

  function startRubyText(code: Code): State | undefined {
    if (isBreak(code)) return nok(code);
    if (code === closing) return close(code);
    effects.enter("aozoraRubyText");
    effects.enter("chunkText", { contentType: "text" });
    effects.consume(code);
    return finishRubyText;
  }

  function finishRubyText(code: Code): State | undefined {
    if (isBreak(code)) return nok(code);
    if (code === closing) {
      effects.exit("chunkText");
      effects.exit("aozoraRubyText");
      return close(code);
    }
    effects.consume(code);
    return finishRubyText;
  }

  function close(code: Code): State | undefined {
    if (code !== closing) return nok(code);
    effects.enter("aozoraRubyClose");
    effects.consume(code);
    effects.exit("aozoraRubyClose");
    return ok(code);
  }
}

function tokenizeWithPrefix(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  nok: State,
): State {
  const { prefix, opening, closing } = this._aozoraRubyConfig ?? defaultConfig;
  const open = tokenizeRubyText.call(this, effects, finish, nok);
  return start;

  function start(code: Code): State | undefined {
    if (code !== prefix) return nok(code);
    effects.enter("aozoraRuby");
    effects.enter("aozoraRubyPrefix");
    effects.consume(code);
    effects.exit("aozoraRubyPrefix");
    return startBaseText;
  }

  function startBaseText(code: Code): State | undefined {
    if (isBreak(code)) return nok(code);
    if (code === opening) return open(code);
    effects.enter("chunkText", { contentType: "text" });
    effects.consume(code);
    return finishBaseText;
  }

  function finishBaseText(code: Code): State | undefined {
    if (isBreak(code)) return nok(code);
    if (code === opening) {
      effects.exit("chunkText");
      return open(code);
    }
    effects.consume(code);
    return finishBaseText;
  }

  function finish(code: Code): State | undefined {
    if (code !== closing) return nok(code);
    effects.exit("aozoraRuby");
    return ok(code);
  }
}

function tokenizeWithoutPrefix(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  nok: State,
): State {
  const { opening, closing } = this._aozoraRubyConfig ?? defaultConfig;
  const open = tokenizeRubyText.call(this, effects, finish, nok);
  return start;

  function start(code: Code): State | undefined {
    if (code !== opening) return nok(code);
    effects.enter("aozoraRuby", { _aozoraRubySyntaxType: "noPrefix" });
    return open(code);
  }

  function finish(code: Code): State | undefined {
    if (code !== closing) return nok(code);
    effects.exit("aozoraRuby");
    return ok(code);
  }
}

export interface AozoraRubySyntaxTypeMap {
  noPrefix: "noPrefix";
}

export type AozoraRubySyntaxType =
  AozoraRubySyntaxTypeMap[keyof AozoraRubySyntaxTypeMap];

export interface AozoraRubySyntaxOptions {
  /** 開始記号｜ */
  prefix: string;

  /** 開き括弧《 */
  opening: string;

  /** 閉じ括弧》 */
  closing: string;
}

/**
 * 青空文庫方式のルビ構文を解析するmicromarkエクステンション
 */
export function aozoraRubySyntax(
  opts?: AozoraRubySyntaxOptions | undefined,
): Extension {
  const config = {
    prefix: opts?.prefix.charCodeAt(0) ?? defaultConfig.prefix,
    opening: opts?.opening.charCodeAt(0) ?? defaultConfig.opening,
    closing: opts?.closing.charCodeAt(0) ?? defaultConfig.closing,
  };
  return {
    text: {
      [config.prefix]: {
        tokenize(effects, ok, nok) {
          this._aozoraRubyConfig = config;
          // 失敗したときに余分なトークンを残さないようにattemptでトークン化する
          return effects.attempt(
            {
              name: "aozoraRubyWithPrefix",
              tokenize: tokenizeWithPrefix,
            },
            ok,
            nok,
          );
        },
      },
      [config.opening]: {
        tokenize(effects, ok, nok) {
          this._aozoraRubyConfig = config;
          // 失敗したときに余分なトークンを残さないようにattemptでトークン化する
          return effects.attempt(
            {
              name: "aozoraRubyWithoutPrefix",
              tokenize: tokenizeWithoutPrefix,
            },
            ok,
            nok,
          );
        },
      },
    },
  };
}
