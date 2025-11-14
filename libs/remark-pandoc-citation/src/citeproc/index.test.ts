import { expect, test } from "vitest";
import { Citeproc } from "./index.ts";
import { MyCitationStyle } from "./style/square.ts";
import type { ElementContent } from "hast";

const opening: ElementContent = {
  type: "text",
  value: "[",
};
const closing: ElementContent = {
  type: "text",
  value: "]",
};
const space: ElementContent = {
  type: "text",
  value: " ",
};

function citationItem(children: ElementContent[]): ElementContent {
  return {
    type: "element",
    tagName: "span",
    properties: {
      class: "citation-item",
    },
    children,
  };
}

test("citation in text", () => {
  const citeproc = new Citeproc(new MyCitationStyle());
  citeproc.addItems([
    {
      type: "article",
      id: "id",
      author: [{ given: "Given", family: "Family" }],
      issued: { "date-parts": [[2025]] },
    },
  ]);
  expect(
    citeproc.getCitationInText({
      schema:
        "https://resource.citationstyles.org/schema/latest/input/json/csl-citation.json",
      citationID: "ID",
      citationItems: [{ id: "id" }],
    }),
  ).deep.eq([
    {
      type: "text",
      value: "Family",
    },
    space,
    opening,
    citationItem([
      {
        type: "text",
        value: "2025",
      },
    ]),
    closing,
  ]);
});

test("citation", () => {
  const citeproc = new Citeproc(new MyCitationStyle());
  citeproc.addItems([
    {
      type: "article",
      id: "id",
      author: [{ given: "Given", family: "Family" }],
      issued: { "date-parts": [[2025]] },
    },
  ]);
  expect(
    citeproc.getCitation({
      schema:
        "https://resource.citationstyles.org/schema/latest/input/json/csl-citation.json",
      citationID: "ID",
      citationItems: [{ id: "id" }],
    }),
  ).deep.eq([
    opening,
    citationItem([
      {
        type: "text",
        value: "Family",
      },
      space,
      {
        type: "text",
        value: "2025",
      },
    ]),
    closing,
  ]);
});
