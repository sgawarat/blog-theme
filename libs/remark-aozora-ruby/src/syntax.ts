// SPDX-License-Identifier: MIT
import { codes } from "micromark-util-symbol";
import type { Code, Effects, Extension, State } from "micromark-util-types";

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
}

function isBreak(code: Code): code is null {
  return code === null || code <= codes.carriageReturnLineFeed;
}

class TokenizerBuilder {
  readonly prefix: number;
  readonly opening: number;
  readonly closing: number;

  constructor(
    prefix?: string | undefined,
    opening?: string | undefined,
    closing?: string | undefined,
  ) {
    this.prefix = (prefix ?? "｜").charCodeAt(0);
    this.opening = (opening ?? "《").charCodeAt(0);
    this.closing = (closing ?? "》").charCodeAt(0);
  }

  buildWithPrefix(effects: Effects, ok: State, nok: State): State {
    const self = this;
    return start;

    function start(code: Code): State | undefined {
      if (code !== self.prefix) return nok(code);
      effects.enter("aozoraRuby");
      effects.enter("aozoraRubyPrefix");
      effects.consume(code);
      effects.exit("aozoraRubyPrefix");
      return startBaseText;
    }

    function startBaseText(code: Code): State | undefined {
      if (isBreak(code)) return nok(code);
      if (code === self.opening) return self.open(code, effects, ok, nok);
      effects.enter("chunkText", { contentType: "text" });
      effects.consume(code);
      return finishBaseText;
    }

    function finishBaseText(code: Code): State | undefined {
      if (isBreak(code)) return nok(code);
      if (code === self.opening) {
        effects.exit("chunkText");
        return self.open(code, effects, ok, nok);
      }
      effects.consume(code);
      return finishBaseText;
    }
  }

  buildWithoutPrefix(effects: Effects, ok: State, nok: State): State {
    const self = this;
    return start;

    function start(code: Code): State | undefined {
      effects.enter("aozoraRuby", { _aozoraRubySyntaxType: "noPrefix" });
      return self.open(code, effects, ok, nok);
    }
  }

  private open(
    code: Code,
    effects: Effects,
    ok: State,
    nok: State,
  ): State | undefined {
    const self = this;
    if (code !== self.opening) return nok(code);
    effects.enter("aozoraRubyOpen");
    effects.consume(code);
    effects.exit("aozoraRubyOpen");
    return startRubyText;

    function startRubyText(code: Code): State | undefined {
      if (isBreak(code)) return nok(code);
      if (code === self.closing) return closeAndFinish(code);
      effects.enter("aozoraRubyText");
      effects.enter("chunkText", { contentType: "text" });
      effects.consume(code);
      return finishRubyText;
    }

    function finishRubyText(code: Code): State | undefined {
      if (isBreak(code)) return nok(code);
      if (code === self.closing) {
        effects.exit("chunkText");
        effects.exit("aozoraRubyText");
        return closeAndFinish(code);
      }
      effects.consume(code);
      return finishRubyText;
    }

    function closeAndFinish(code: Code): State | undefined {
      if (code !== self.closing) return nok(code);
      effects.enter("aozoraRubyClose");
      effects.consume(code);
      effects.exit("aozoraRubyClose");
      effects.exit("aozoraRuby");
      return ok(code);
    }
  }
}

export interface AozoraRubySyntaxTypeMap {
  noPrefix: "noPrefix";
}

export type AozoraRubySyntaxType = keyof AozoraRubySyntaxTypeMap;

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
  const builder = new TokenizerBuilder(
    opts?.prefix,
    opts?.opening,
    opts?.closing,
  );
  return {
    text: {
      [builder.prefix]: {
        tokenize(effects, ok, nok) {
          // 失敗したときに余分なトークンを残さないようにattemptでトークン化する
          return effects.attempt(
            {
              name: "aozoraRubyWithPrefix",
              tokenize(effects, ok, nok) {
                return builder.buildWithPrefix(effects, ok, nok);
              },
            },
            ok,
            nok,
          );
        },
      },
      [builder.opening]: {
        tokenize(effects, ok, nok) {
          // 失敗したときに余分なトークンを残さないようにattemptでトークン化する
          return effects.attempt(
            {
              name: "aozoraRubyWithoutPrefix",
              tokenize(effects, ok, nok) {
                return builder.buildWithoutPrefix(effects, ok, nok);
              },
            },
            ok,
            nok,
          );
        },
      },
    },
  };
}
