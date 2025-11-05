// SPDX-License-Identifier: MIT
import type { PhrasingContent, Root, Text } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { expect, test } from "vitest";
import { pandocCitationSyntax } from "../syntax/index.ts";
import {
  type PandocCitation,
  type PandocCitationContent,
  type PandocCitationData,
  type PandocCitationItem,
  type PandocCitationItemContent,
  type PandocCitationItemData,
  pandocCitationFromMarkdown,
} from "./index.ts";

function mdast(str: string) {
  return fromMarkdown(str, {
    extensions: [pandocCitationSyntax()],
    mdastExtensions: [pandocCitationFromMarkdown()],
  });
}

function rootP(...children: PhrasingContent[]) {
  return {
    type: "root",
    children: [
      {
        type: "paragraph",
        children,
      },
    ],
  } satisfies Root;
}

function cite(
  data: PandocCitationData,
  ...children: PandocCitationContent[]
): PandocCitation {
  return {
    type: "pandocCitation",
    children,
    data,
  };
}

function item(
  data: PandocCitationItemData,
  ...children: PandocCitationItemContent[]
): PandocCitationItem {
  return {
    type: "pandocCitationItem",
    children,
    data,
  };
}

function text(value: string): Text {
  return {
    type: "text",
    value,
  };
}

test("id", () => {
  expect(mdast("@id")).to.containSubset(
    rootP(cite({ _pandocCitationInText: true })),
  );
});
