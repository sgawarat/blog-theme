// SPDX-License-Identifier: MIT
import { micromark } from "micromark";
import type { Options, Token } from "micromark-util-types";
import { expect, test } from "vitest";
import { obsidianWikilinkSyntax } from "./syntax.ts";

const opts: Options = {
  extensions: [obsidianWikilinkSyntax()],
  htmlExtensions: [
    {
      enter: {
        obsidianWikilink() {
          this.tag("<wikilink>");
        },
        obsidianWikilinkOpen(token: Token) {
          this.tag(`<open value="${this.sliceSerialize(token)}">`);
        },
        obsidianWikilinkPath(token: Token) {
          this.tag(`<path value="${this.sliceSerialize(token)}">`);
        },
        obsidianWikilinkTextPrefix(token: Token) {
          this.tag(`<text-prefix value="${this.sliceSerialize(token)}">`);
        },
        obsidianWikilinkText() {
          this.tag("<text>");
        },
        obsidianWikilinkClose(token: Token) {
          this.tag(`<close value="${this.sliceSerialize(token)}">`);
        },
      },
      exit: {
        obsidianWikilink() {
          this.tag("</wikilink>");
        },
        obsidianWikilinkOpen() {
          this.tag("</open>");
        },
        obsidianWikilinkPath() {
          this.tag("</path>");
        },
        obsidianWikilinkTextPrefix() {
          this.tag("</text-prefix>");
        },
        obsidianWikilinkText() {
          this.tag("</text>");
        },
        obsidianWikilinkClose() {
          this.tag("</close>");
        },
      },
    },
  ],
};

const opening = '<open value="[["></open>';
const closing = '<close value="]]"></close>';
const textPrefix = '<text-prefix value="|"></text-prefix>';

function path(value: string): string {
  return `<path value="${value}"></path>`;
}

function text(...children: string[]): string {
  return `<text>${children.join("")}</text>`;
}

function pWikilink(...children: string[]): string {
  return `<p><wikilink>${children.join("")}</wikilink></p>`;
}

test("path", () => {
  const input = "[[path]]";
  const output = micromark(input, opts);
  expect(output).eq(pWikilink(opening, path("path"), closing));
});

test("id", () => {
  const input = "[[#id]]";
  const output = micromark(input, opts);
  expect(output).eq(pWikilink(opening, path("#id"), closing));
});

test("text", () => {
  const input = "[[|text]]";
  const output = micromark(input, opts);
  expect(output).eq(pWikilink(opening, textPrefix, text("text"), closing));
});

test("path,id", () => {
  const input = "[[path#id]]";
  const output = micromark(input, opts);
  expect(output).eq(pWikilink(opening, path("path#id"), closing));
});

test("path,text", () => {
  const input = "[[path|text]]";
  const output = micromark(input, opts);
  expect(output).eq(
    pWikilink(opening, path("path"), textPrefix, text("text"), closing),
  );
});

test("id,text", () => {
  const input = "[[#id|text]]";
  const output = micromark(input, opts);
  expect(output).eq(
    pWikilink(opening, path("#id"), textPrefix, text("text"), closing),
  );
});

test("path,id,text", () => {
  const input = "[[path#id|text]]";
  const output = micromark(input, opts);
  expect(output).eq(
    pWikilink(opening, path("path#id"), textPrefix, text("text"), closing),
  );
});

test("text with decoration", () => {
  const input = "[[|**strong**]]";
  const output = micromark(input, opts);
  expect(output).eq(
    pWikilink(opening, textPrefix, text("<strong>strong</strong>"), closing),
  );
});

test("reverts on failure", () => {
  expect(micromark("[[path#id|text]", opts)).eq("<p>[[path#id|text]</p>");
});

test("escaped", () => {
  expect(micromark("\\[[path#id|text]]", opts)).eq("<p>[[path#id|text]]</p>");
});
