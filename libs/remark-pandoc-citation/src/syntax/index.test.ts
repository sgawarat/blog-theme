// SPDX-License-Identifier: MIT
import { micromark } from "micromark";
import type { Options, Token } from "micromark-util-types";
import { expect, test } from "vitest";
import { pandocCitationSyntax } from "./index.ts";

const opts: Options = {
  extensions: [pandocCitationSyntax()],
  htmlExtensions: [
    {
      enter: {
        pandocCitation(token: Token) {
          this.tag(`<citation "${this.sliceSerialize(token)}">`);
        },
        pandocCitationOpen(token: Token) {
          this.tag(`<open "${this.sliceSerialize(token)}">`);
        },
        pandocCitationClose(token: Token) {
          this.tag(`<close "${this.sliceSerialize(token)}">`);
        },
        pandocCitationItem(token: Token) {
          this.tag(`<item "${this.sliceSerialize(token)}">`);
        },
        pandocCitationPrefix(token: Token) {
          this.tag(`<prefix "${this.sliceSerialize(token)}">`);
        },
        pandocCitationIdPrefix(token: Token) {
          this.tag(`<idPrefix "${this.sliceSerialize(token)}">`);
        },
        pandocCitationId(token: Token) {
          this.tag(`<id "${this.sliceSerialize(token)}">`);
        },
        pandocCitationLocator(token: Token) {
          this.tag(`<locator "${this.sliceSerialize(token)}">`);
        },
        pandocCitationSuffix(token: Token) {
          this.tag(`<suffix "${this.sliceSerialize(token)}">`);
        },
        pandocCitationItemDelimiter(token: Token) {
          this.tag(`<itemDelimiter "${this.sliceSerialize(token)}">`);
        },
        pandocCitationSpace(token: Token) {
          this.tag(`<space "${this.sliceSerialize(token)}">`);
        },
        pandocCitationComma(token: Token) {
          this.tag(`<comma "${this.sliceSerialize(token)}">`);
        },
      },
      exit: {
        pandocCitation(_token: Token) {
          this.tag("</citation>");
        },
        pandocCitationOpen(_token: Token) {
          this.tag("</open>");
        },
        pandocCitationClose(_token: Token) {
          this.tag("</close>");
        },
        pandocCitationItem(_token: Token) {
          this.tag("</item>");
        },
        pandocCitationPrefix(_token: Token) {
          this.tag("</prefix>");
        },
        pandocCitationIdPrefix(_token: Token) {
          this.tag("</idPrefix>");
        },
        pandocCitationId(_token: Token) {
          this.tag("</id>");
        },
        pandocCitationLocator(_token: Token) {
          this.tag("</locator>");
        },
        pandocCitationSuffix(_token: Token) {
          this.tag("</suffix>");
        },
        pandocCitationItemDelimiter(_token: Token) {
          this.tag("</itemDelimiter>");
        },
        pandocCitationSpace(_token: Token) {
          this.tag("</space>");
        },
        pandocCitationComma(_token: Token) {
          this.tag("</comma>");
        },
      },
    },
  ],
};

test("ID and single internal punctuation", () => {
  expect(micromark("@a.b", opts)).eq(
    '<p><idPrefix "@"></idPrefix><id "a.b"></id></p>',
  );
});

test("ID and multiple internal punctuations", () => {
  expect(micromark("@a..b", opts)).eq(
    '<p><idPrefix "@"></idPrefix><id "a"></id>..b</p>',
  );
});

test("ID and final punctuation", () => {
  expect(micromark("@a.", opts)).eq(
    '<p><idPrefix "@"></idPrefix><id "a"></id>.</p>',
  );
});

test("ID with braces", () => {
  expect(micromark("@{a..b.}", opts)).eq(
    '<p><idPrefix "@"></idPrefix><open "{"></open><id "a..b."></id><close "}"></close></p>',
  );
});

test("author-in-text citation", () => {
  expect(micromark("@id", opts)).eq(
    '<p><idPrefix "@"></idPrefix><id "id"></id></p>',
  );
});

test("author-in-text citation with locator", () => {
  expect(micromark("@id [locator]", opts)).eq(
    '<p><idPrefix "@"></idPrefix><id "id"></id><space " "></space><open "["></open><locator "locator"></locator><close "]"></close></p>',
  );
});

test("citation with prefix", () => {
  expect(micromark("[prefix @id]", opts)).eq(
    '<p><open "["></open><prefix "prefix "></prefix><idPrefix "@"></idPrefix><id "id"></id><close "]"></close></p>',
  );
});

test("citation with suffix", () => {
  expect(micromark("[@id, suffix]", opts)).eq(
    '<p><open "["></open><idPrefix "@"></idPrefix><id "id"></id><suffix ", suffix"></suffix><close "]"></close></p>',
  );
});

test("citation with prefix and suffix", () => {
  expect(micromark("[prefix @id, suffix]", opts)).eq(
    '<p><open "["></open><prefix "prefix "></prefix><idPrefix "@"></idPrefix><id "id"></id><suffix ", suffix"></suffix><close "]"></close></p>',
  );
});

test("citation with locator", () => {
  expect(micromark("[@id{locator}]", opts)).eq(
    '<p><open "["></open><idPrefix "@"></idPrefix><id "id"></id><open "{"></open><locator "locator"></locator><close "}"></close><close "]"></close></p>',
  );
});

test("citation with locator + whitespace", () => {
  expect(micromark("[@id {locator}]", opts)).eq(
    '<p><open "["></open><idPrefix "@"></idPrefix><id "id"></id><space " "></space><open "{"></open><locator "locator"></locator><close "}"></close><close "]"></close></p>',
  );
});

test("citation with locator + whitespace + comma", () => {
  expect(micromark("[@id, {locator}]", opts)).eq(
    '<p><open "["></open><idPrefix "@"></idPrefix><id "id"></id><comma ","></comma><space " "></space><open "{"></open><locator "locator"></locator><close "}"></close><close "]"></close></p>',
  );
});

test("citation with all options", () => {
  expect(micromark("[prefix @id, {locator} suffix]", opts)).eq(
    '<p><open "["></open><prefix "prefix "></prefix><idPrefix "@"></idPrefix><id "id"></id><comma ","></comma><space " "></space><open "{"></open><locator "locator"></locator><close "}"></close><suffix " suffix"></suffix><close "]"></close></p>',
  );
});

test("citation with typo", () => {
  expect(micromark("[@id , {locator} suffix]", opts)).eq(
    '<p><open "["></open><idPrefix "@"></idPrefix><id "id"></id><suffix " , {locator} suffix"></suffix><close "]"></close></p>',
  );
});

test("citations", () => {
  expect(micromark("[@id;@id2]", opts)).eq(
    '<p><open "["></open><idPrefix "@"></idPrefix><id "id"></id><itemDelimiter ";"></itemDelimiter><idPrefix "@"></idPrefix><id "id2"></id><close "]"></close></p>',
  );
});
