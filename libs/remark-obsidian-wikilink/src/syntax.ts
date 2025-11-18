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
    obsidianWikilink: "obsidianWikilink";
    obsidianWikilinkOpen: "obsidianWikilinkOpen";
    obsidianWikilinkPath: "obsidianWikilinkPath";
    obsidianWikilinkTextPrefix: "obsidianWikilinkTextPrefix";
    obsidianWikilinkText: "obsidianWikilinkText";
    obsidianWikilinkClose: "obsidianWikilinkClose";
  }
}

const EMBEDDED_PREFIX = codes.exclamationMark;
const OPENING = codes.leftSquareBracket;
const TEXT_PREFIX = codes.verticalBar;
const CLOSING = codes.rightSquareBracket;

function isBreak(code: Code): code is null {
  return code === null || code <= codes.carriageReturnLineFeed;
}

function tokenizeBody(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  nok: State,
): State {
  return startPath;

  function startPath(code: Code): State | undefined {
    if (isBreak(code)) return nok(code);
    if (code === TEXT_PREFIX) {
      return prestartText(code);
    }
    if (code === CLOSING) {
      return ok(code);
    }
    effects.enter("obsidianWikilinkPath");
    effects.consume(code);
    return finishPath;
  }

  function finishPath(code: Code): State | undefined {
    if (isBreak(code)) return nok(code);
    if (code === TEXT_PREFIX) {
      effects.exit("obsidianWikilinkPath");
      return prestartText(code);
    }
    if (code === CLOSING) {
      effects.exit("obsidianWikilinkPath");
      return ok(code);
    }
    effects.consume(code);
    return finishPath;
  }

  function prestartText(code: Code): State | undefined {
    if (code !== TEXT_PREFIX) return nok(code);
    effects.enter("obsidianWikilinkTextPrefix");
    effects.consume(code);
    effects.exit("obsidianWikilinkTextPrefix");
    return startText;
  }

  function startText(code: Code): State | undefined {
    if (isBreak(code)) return nok(code);
    if (code === CLOSING) {
      return ok(code);
    }
    effects.enter("obsidianWikilinkText");
    effects.enter("chunkText", { contentType: "text" });
    effects.consume(code);
    return finishText;
  }

  function finishText(code: Code): State | undefined {
    if (isBreak(code)) return nok(code);
    if (code === CLOSING) {
      effects.exit("chunkText");
      effects.exit("obsidianWikilinkText");
      return ok(code);
    }
    effects.consume(code);
    return finishText;
  }
}

function tokenizeBodyWithBrackets(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  nok: State,
): State {
  const body = tokenizeBody.call(this, effects, close, nok);
  return open;

  function open(code: Code): State | undefined {
    if (code !== OPENING) return nok(code);
    effects.enter("obsidianWikilinkOpen");
    effects.consume(code);
    return (code: Code): State | undefined => {
      if (code !== OPENING) return nok(code);
      effects.consume(code);
      effects.exit("obsidianWikilinkOpen");
      return body;
    };
  }

  function close(code: Code): State | undefined {
    if (code !== CLOSING) return nok(code);
    effects.enter("obsidianWikilinkClose");
    effects.consume(code);
    return (code: Code): State | undefined => {
      if (code !== CLOSING) return nok(code);
      effects.consume(code);
      effects.exit("obsidianWikilinkClose");
      return ok(code);
    };
  }
}

function tokenizeNormalLink(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
  nok: State,
): State {
  const bodyWithBrackets = tokenizeBodyWithBrackets.call(
    this,
    effects,
    exit,
    nok,
  );
  return enter;

  function enter(code: Code): State | undefined {
    if (code !== OPENING) return nok(code);
    effects.enter("obsidianWikilink");
    return bodyWithBrackets(code);
  }

  function exit(code: Code): State | undefined {
    if (code !== CLOSING) return nok(code);
    effects.exit("obsidianWikilink");
    return ok(code);
  }
}

export function obsidianWikilinkSyntax(): Extension {
  return {
    text: {
      [OPENING]: {
        name: "obsidianWikilink",
        previous(code) {
          return code !== EMBEDDED_PREFIX;
        },
        tokenize(effects, ok, nok) {
          // 失敗時に余分なトークンを残さないようにattemptでトークン化する
          return effects.attempt(
            {
              name: "obsidianWikilinkAttempt",
              tokenize: tokenizeNormalLink,
            },
            ok,
            nok,
          );
        },
      },
    },
  };
}
