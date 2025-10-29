// SPDX-License-Identifier: MIT
import { micromark } from "micromark";
import type { Options, Token } from "micromark-util-types";
import { expect, test } from "vitest";
import { aozoraRubySyntax } from "./syntax.ts";

const opts: Options = {
  extensions: [aozoraRubySyntax()],
  htmlExtensions: [
    {
      enter: {
        aozoraRuby(token: Token) {
          this.tag(`<ruby type="${token._aozoraRubySyntaxType ?? "normal"}">`);
        },
        aozoraRubyPrefix(token: Token) {
          this.tag(`<prefix text="${this.sliceSerialize(token)}">`);
        },
        aozoraRubyOpen(token: Token) {
          this.tag(`<open text="${this.sliceSerialize(token)}">`);
        },
        aozoraRubyText() {
          this.tag("<text>");
        },
        aozoraRubyClose(token: Token) {
          this.tag(`<close text="${this.sliceSerialize(token)}">`);
        },
      },
      exit: {
        aozoraRuby() {
          this.tag("</ruby>");
        },
        aozoraRubyPrefix() {
          this.tag("</prefix>");
        },
        aozoraRubyOpen() {
          this.tag("</open>");
        },
        aozoraRubyText() {
          this.tag("</text>");
        },
        aozoraRubyClose() {
          this.tag("</close>");
        },
      },
    },
  ],
};

function rubyWithPrefix(baseText: string, rubyText: string): string {
  return `<p><ruby type="normal"><prefix text="｜"></prefix>${baseText}<open text="《"></open><text>${rubyText}</text><close text="》"></close></ruby></p>`;
}

function rubyWithoutPrefix(text: string, rubyText: string): string {
  return `<p>${text}<ruby type="noPrefix"><open text="《"></open><text>${rubyText}</text><close text="》"></close></ruby></p>`;
}

test("ruby with prefix", () => {
  const input = "｜本文《ルビ》";
  const output = micromark(input, opts);
  expect(output).eq(rubyWithPrefix("本文", "ルビ"));
});

test("ruby without prefix", () => {
  const input = "本文《ルビ》";
  const output = micromark(input, opts);
  expect(output).eq(rubyWithoutPrefix("本文", "ルビ"));
});

test("base text with deco", () => {
  const input = "｜**本文**《ルビ》";
  const output = micromark(input, opts);
  expect(output).eq(rubyWithPrefix("<strong>本文</strong>", "ルビ"));
});

test("ruby text with deco", () => {
  const input = "｜本文《**ルビ**》";
  const output = micromark(input, opts);
  expect(output).eq(rubyWithPrefix("本文", "<strong>ルビ</strong>"));
});

test("reverts on failure", () => {
  expect(micromark("｜本文《ルビ", opts)).eq("<p>｜本文《ルビ</p>");
  expect(micromark("本文《ルビ", opts)).eq("<p>本文《ルビ</p>");
});
