// SPDX-License-Identifier: MIT
import type { ElementContent } from "hast";
import { expect, test } from "vitest";
import { MyCitationStyle } from "./example.ts";

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
const dot: ElementContent = {
  type: "text",
  value: ".",
};
const commaSpace: ElementContent = {
  type: "text",
  value: ", ",
};
const semicolonSpace: ElementContent = {
  type: "text",
  value: "; ",
};

function text(value: string): ElementContent {
  return {
    type: "text",
    value,
  };
}

function citeText(value: string): ElementContent {
  return {
    type: "element",
    tagName: "cite",
    properties: {},
    children: [
      {
        type: "text",
        value,
      },
    ],
  };
}

function anchor(href: string, text?: string | undefined): ElementContent {
  return {
    type: "element",
    tagName: "a",
    properties: {
      href,
      target: "_blank",
      rel: "noopener noreferrer nofollow external",
    },
    children: [
      {
        type: "text",
        value: text ?? href,
      },
    ],
  };
}

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

function bibliography(children: ElementContent[]): ElementContent {
  return {
    type: "element",
    tagName: "span",
    properties: {
      hidden: true,
      class: "bibliography",
    },
    children,
  };
}

test("citation in text", () => {
  expect(
    new MyCitationStyle().getCitationInText([
      {
        id: "id",
        itemData: {
          type: "article",
          id: "id",
          author: [{ given: "Given", family: "Family" }],
          issued: { "date-parts": [[2025, 12, 31]] },
          title: "Title",
          "container-title": "Container Title",
          volume: 1,
          issue: 2,
          page: 3,
          DOI: "10.1234/5678",
          URL: "https://example.com",
        },
      },
    ]),
  ).deep.eq([
    text("Family"),
    space,
    opening,
    citationItem([
      text("2025"),
      bibliography([
        text("Family, G."),
        space,
        text("2025"),
        dot,
        space,
        text("Title"),
        dot,
        space,
        citeText("Container Title"),
        space,
        text("1"),
        commaSpace,
        text("2"),
        commaSpace,
        text("3"),
        dot,
        space,
        anchor("https://doi.org/10.1234/5678", "10.1234/5678"),
        dot,
        space,
        anchor("https://example.com"),
        dot,
      ]),
    ]),
    closing,
  ]);
});

test("citation", () => {
  expect(
    new MyCitationStyle().getCitation([
      {
        id: "id",
        itemData: {
          type: "article",
          id: "id",
          author: [{ given: "Given", family: "Family" }],
          issued: { "date-parts": [[2025, 12, 31]] },
          title: "Title",
          "container-title": "Container Title",
          volume: 1,
          issue: 2,
          page: 3,
          DOI: "10.1234/5678",
          URL: "https://example.com",
        },
      },
    ]),
  ).deep.eq([
    opening,
    citationItem([
      text("Family"),
      space,
      text("2025"),
      bibliography([
        text("Family, G."),
        space,
        text("2025"),
        dot,
        space,
        text("Title"),
        dot,
        space,
        citeText("Container Title"),
        space,
        text("1"),
        commaSpace,
        text("2"),
        commaSpace,
        text("3"),
        dot,
        space,
        anchor("https://doi.org/10.1234/5678", "10.1234/5678"),
        dot,
        space,
        anchor("https://example.com"),
        dot,
      ]),
    ]),
    closing,
  ]);
});

test("multiple citations", () => {
  expect(
    new MyCitationStyle().getCitation([
      {
        id: "id",
        itemData: {
          type: "article",
          id: "id",
          author: [{ given: "Given 1", family: "Family 1" }],
          issued: { "date-parts": [[2024, 12, 1]] },
          title: "Title 1",
        },
      },
      {
        id: "id2",
        itemData: {
          type: "article",
          id: "id2",
          author: [{ given: "Given 2", family: "Family 2" }],
          issued: { "date-parts": [[2025, 12, 2]] },
          title: "Title 2",
        },
      },
    ]),
  ).deep.eq([
    opening,
    citationItem([
      text("Family 1"),
      space,
      text("2024"),
      bibliography([
        text("Family 1, G. 1"),
        space,
        text("2024"),
        dot,
        space,
        text("Title 1"),
        dot,
      ]),
    ]),
    semicolonSpace,
    citationItem([
      text("Family 2"),
      space,
      text("2025"),
      bibliography([
        text("Family 2, G. 2"),
        space,
        text("2025"),
        dot,
        space,
        text("Title 2"),
        dot,
      ]),
    ]),
    closing,
  ]);
});

test("citation not found", () => {
  expect(
    new MyCitationStyle().getCitationInText([
      {
        id: "id",
      },
    ]),
  ).deep.eq([text("@id")]);

  expect(
    new MyCitationStyle().getCitation([
      {
        id: "id",
      },
    ]),
  ).deep.eq([opening, text("@id"), closing]);
});

test("one author", () => {
  expect(
    new MyCitationStyle().getCitation([
      {
        id: "id",
        itemData: {
          type: "article",
          id: "id",
          author: [
            {
              given: "Given",
              "non-dropping-particle": "de",
              family: "Family",
              "comma-suffix": true,
              suffix: "Jr.",
            },
          ],
        },
      },
    ]),
  ).deep.eq([
    opening,
    citationItem([
      text("de Family, Jr."),
      bibliography([text("de Family, Jr., G.")]),
    ]),
    closing,
  ]);
});

test("comma-suffix", () => {
  expect(
    new MyCitationStyle().getCitation([
      {
        id: "id",
        itemData: {
          type: "article",
          id: "id",
          author: [
            {
              given: "Given",
              "non-dropping-particle": "de",
              family: "Family",
              "comma-suffix": false,
              suffix: "Jr.",
            },
          ],
        },
      },
    ]),
  ).deep.eq([
    opening,
    citationItem([
      text("de Family Jr."),
      bibliography([text("de Family Jr., G.")]),
    ]),
    closing,
  ]);
});

test("dropping-particle", () => {
  expect(
    new MyCitationStyle().getCitation([
      {
        id: "id",
        itemData: {
          type: "article",
          id: "id",
          author: [
            {
              given: "Given",
              "dropping-particle": "de",
              family: "Family",
            },
          ],
        },
      },
    ]),
  ).deep.eq([
    opening,
    citationItem([text("Family"), bibliography([text("de Family, G.")])]),
    closing,
  ]);
});

test("two authors", () => {
  expect(
    new MyCitationStyle().getCitation([
      {
        id: "id",
        itemData: {
          type: "article",
          id: "id",
          author: [
            { given: "Given A", family: "Family A" },
            { given: "Given B", family: "Family B" },
          ],
        },
      },
    ]),
  ).deep.eq([
    opening,
    citationItem([
      text("Family A and Family B"),
      bibliography([text("Family A, G. A and Family B, G. B")]),
    ]),
    closing,
  ]);
});

test("three authors", () => {
  expect(
    new MyCitationStyle().getCitation([
      {
        id: "id",
        itemData: {
          type: "article",
          id: "id",
          author: [
            { given: "Given A", family: "Family A" },
            { given: "Given B", family: "Family B" },
            { given: "Given C", family: "Family C" },
          ],
        },
      },
    ]),
  ).deep.eq([
    opening,
    citationItem([
      text("Family A et al."),
      bibliography([text("Family A, G. A, Family B, G. B and Family C, G. C")]),
    ]),
    closing,
  ]);
});

test("citation with options", () => {
  expect(
    new MyCitationStyle().getCitation([
      {
        id: "id",
        itemData: {
          type: "article",
          id: "id",
          author: [{ given: "Given", family: "Family" }],
        },
        prefix: "prefix",
        locator: "locator",
        suffix: "suffix",
      },
    ]),
  ).deep.eq([
    opening,
    citationItem([
      text("prefix"),
      space,
      text("Family"),
      commaSpace,
      text("locator"),
      space,
      text("suffix"),
      bibliography([text("Family, G.")]),
    ]),
    closing,
  ]);
});

test("citation in text with options", () => {
  expect(
    new MyCitationStyle().getCitationInText([
      {
        id: "id",
        itemData: {
          type: "article",
          id: "id",
          author: [{ given: "Given", family: "Family" }],
        },
        prefix: "prefix",
        locator: "locator",
        suffix: "suffix",
      },
    ]),
  ).deep.eq([
    text("prefix"),
    space,
    text("Family"),
    space,
    opening,
    citationItem([
      text("locator"),
      space,
      text("suffix"),
      bibliography([text("Family, G.")]),
    ]),
    closing,
  ]);
});
