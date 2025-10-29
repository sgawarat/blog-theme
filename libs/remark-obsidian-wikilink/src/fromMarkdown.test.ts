// SPDX-License-Identifier: MIT
import type { Link, PhrasingContent, Root, Strong, Text } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { expect, test } from "vitest";
import { obsidianWikilinkFromMarkdown } from "./fromMarkdown.ts";
import { obsidianWikilinkSyntax } from "./syntax.ts";

function mdast(str: string) {
  return fromMarkdown(str, {
    extensions: [obsidianWikilinkSyntax()],
    mdastExtensions: [obsidianWikilinkFromMarkdown()],
  });
}

function strong(...children: PhrasingContent[]): Strong {
  return {
    type: "strong",
    children,
  };
}

function text(value: string): Text {
  return {
    type: "text",
    value,
  };
}

function wikilink(url: string, ...children: PhrasingContent[]): Link {
  return {
    type: "link",
    url,
    children,
    data: {
      _isObsidianWikilink: true,
    },
  };
}

function rootP(...children: PhrasingContent[]): Root {
  return {
    type: "root",
    children: [
      {
        type: "paragraph",
        children,
      },
    ],
  };
}

test("path", () => {
  expect(mdast("[[path]]")).to.containSubset(
    rootP(wikilink("path", text("path"))),
  );
});

test("id", () => {
  expect(mdast("[[#id]]")).to.containSubset(
    rootP(wikilink("#id", text("#id"))),
  );
});

test("text", () => {
  expect(mdast("[[|text]]")).to.containSubset(
    rootP(wikilink("", text("text"))),
  );
});

test("path,id", () => {
  expect(mdast("[[path#id]]")).to.containSubset(
    rootP(wikilink("path#id", text("path#id"))),
  );
});

test("path,text", () => {
  expect(mdast("[[path|text]]")).to.containSubset(
    rootP(wikilink("path", text("text"))),
  );
});

test("id,text", () => {
  expect(mdast("[[#id|text]]")).to.containSubset(
    rootP(wikilink("#id", text("text"))),
  );
});

test("path,text", () => {
  expect(mdast("[[path#id|text]]")).to.containSubset(
    rootP(wikilink("path#id", text("text"))),
  );
});

test("text with decoration", () => {
  expect(mdast("[[|**text**]]")).to.containSubset(
    rootP(wikilink("", strong(text("text")))),
  );
});
