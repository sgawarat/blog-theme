// SPDX-License-Identifier: MIT
import type { PhrasingContent, Root } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { expect, test } from "vitest";
import { pandocCitationSyntax } from "../syntax/index.ts";
import {
  type PandocCitation,
  type PandocCitationItem,
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

interface Item {
  prefix?: string | undefined;
  idPrefix?: string | undefined;
  id?: string | undefined;
  locator?: string | undefined;
  suffix?: string | undefined;
}

function citation(inText: boolean, items: Item[]): PandocCitation {
  return {
    type: "pandocCitation",
    children: items.map(
      (item): PandocCitationItem => ({
        type: "pandocCitationItem",
        data: {
          _pandocCitationPrefix: item.prefix,
          _pandocCitationIdPrefix: item.idPrefix,
          _pandocCitationId: item.id,
          _pandocCitationLocator: item.locator,
          _pandocCitationSuffix: item.suffix,
        },
      }),
    ),
    data: {
      _pandocCitationInText: inText,
    },
  };
}

test("author-in-text citation", () => {
  expect(mdast("@id")).to.containSubset(
    rootP(citation(true, [{ idPrefix: "@", id: "id" }])),
  );
});

test("author-in-text citation with options", () => {
  expect(mdast("@id [locator]")).to.containSubset(
    rootP(citation(true, [{ idPrefix: "@", id: "id", locator: "locator" }])),
  );
});

test("citation", () => {
  expect(mdast("[@id]")).to.containSubset(
    rootP(citation(false, [{ idPrefix: "@", id: "id" }])),
  );
});

test("citation with options", () => {
  expect(mdast("[prefix @id, {locator} suffix]")).to.containSubset(
    rootP(
      citation(false, [
        {
          prefix: "prefix",
          idPrefix: "@",
          id: "id",
          locator: "locator",
          suffix: "suffix",
        },
      ]),
    ),
  );
});
