// SPDX-License-Identifier: MIT
import { codes } from "micromark-util-symbol";
import type { Code, Effects, Extension, State } from "micromark-util-types";

declare module "micromark-util-types" {
  interface TokenTypeMap {
    obsidianWikilink: "obsidianWikilink";
    obsidianWikilinkOpen: "obsidianWikilinkOpen";
    obsidianWikilinkPath: "obsidianWikilinkPath";
    obsidianWikilinkTextPrefix: "obsidianWikilinkTextPrefix";
    obsidianWikilinkText: "obsidianWikilinkText";
    obsidianWikilinkClose: "obsidianWikilinkClose";
  }
}

function isBreak(code: Code): code is null {
  return code === null || code <= codes.carriageReturnLineFeed;
}

class TokenizerBuilder {
  static readonly ESCAPING = codes.backslash;
  static readonly EMBEDDED = codes.exclamationMark;
  static readonly OPENING = codes.leftSquareBracket;
  static readonly TEXT_PREFIX = codes.verticalBar;
  static readonly CLOSING = codes.rightSquareBracket;

  build(effects: Effects, ok: State, nok: State): State {
    const self = this;
    return prestart;

    function prestart(code: Code): State | undefined {
      return self.start(code, effects, ok, nok);
    }
  }

  private start(
    code: Code,
    effects: Effects,
    ok: State,
    nok: State,
  ): State | undefined {
    const self = this;

    if (code !== TokenizerBuilder.OPENING) return nok(code);
    effects.enter("obsidianWikilink");
    effects.enter("obsidianWikilinkOpen");
    effects.consume(code);
    return open;

    function open(code: Code): State | undefined {
      if (code !== TokenizerBuilder.OPENING) return nok(code);
      effects.consume(code);
      effects.exit("obsidianWikilinkOpen");
      return self.body(effects, ok, nok);
    }
  }

  private body(effects: Effects, ok: State, nok: State): State {
    const self = this;
    return startPath;

    function startPath(code: Code): State | undefined {
      if (isBreak(code)) return nok(code);
      if (code === TokenizerBuilder.TEXT_PREFIX) return prestartText(code);
      if (code === TokenizerBuilder.CLOSING) {
        return self.close(code, effects, ok, nok);
      }
      effects.enter("obsidianWikilinkPath");
      effects.consume(code);
      return finishPath;
    }

    function finishPath(code: Code): State | undefined {
      if (isBreak(code)) return nok(code);
      if (code === TokenizerBuilder.TEXT_PREFIX) {
        effects.exit("obsidianWikilinkPath");
        return prestartText(code);
      }
      if (code === TokenizerBuilder.CLOSING) {
        effects.exit("obsidianWikilinkPath");
        return self.close(code, effects, ok, nok);
      }
      effects.consume(code);
      return finishPath;
    }

    function prestartText(code: Code): State | undefined {
      if (code !== TokenizerBuilder.TEXT_PREFIX) return nok(code);
      effects.enter("obsidianWikilinkTextPrefix");
      effects.consume(code);
      effects.exit("obsidianWikilinkTextPrefix");
      return startText;
    }

    function startText(code: Code): State | undefined {
      if (isBreak(code)) return nok(code);
      if (code === TokenizerBuilder.CLOSING) {
        return self.close(code, effects, ok, nok);
      }
      effects.enter("obsidianWikilinkText");
      effects.enter("chunkText", { contentType: "text" });
      effects.consume(code);
      return finishText;
    }

    function finishText(code: Code): State | undefined {
      if (isBreak(code)) return nok(code);
      if (code === TokenizerBuilder.CLOSING) {
        effects.exit("chunkText");
        effects.exit("obsidianWikilinkText");
        return self.close(code, effects, ok, nok);
      }
      effects.consume(code);
      return finishText;
    }
  }

  private close(
    code: Code,
    effects: Effects,
    ok: State,
    nok: State,
  ): State | undefined {
    if (code !== TokenizerBuilder.CLOSING) return nok(code);
    effects.enter("obsidianWikilinkClose");
    effects.consume(code);
    return finish;

    function finish(code: Code): State | undefined {
      if (code !== TokenizerBuilder.CLOSING) return nok(code);
      effects.consume(code);
      effects.exit("obsidianWikilinkClose");
      effects.exit("obsidianWikilink");
      return ok(code);
    }
  }
}

export function obsidianWikilinkSyntax(): Extension {
  const builder = new TokenizerBuilder();
  return {
    text: {
      [TokenizerBuilder.OPENING]: {
        name: "obsidianWikilink",
        previous(code) {
          return (
            code !== TokenizerBuilder.ESCAPING &&
            code !== TokenizerBuilder.EMBEDDED
          );
        },
        tokenize(effects, ok, nok) {
          // 失敗時に余分なトークンを残さないようにattemptでトークン化する
          return effects.attempt(
            {
              name: "obsidianWikilinkAttempt",
              tokenize(effects, ok, nok) {
                return builder.build(effects, ok, nok);
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
