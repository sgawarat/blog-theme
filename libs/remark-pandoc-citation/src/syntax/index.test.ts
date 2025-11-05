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
          this.tag(`<cite "${this.sliceSerialize(token)}">`);
        },
        pandocCitationInText(token: Token) {
          this.tag(`<citeInText "${this.sliceSerialize(token)}">`);
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
        pandocCitationLocatorOuter(token: Token) {
          this.tag(`<locatorOuter "${this.sliceSerialize(token)}">`);
        },
        pandocCitationLocator(token: Token) {
          this.tag(`<locator "${this.sliceSerialize(token)}">`);
        },
        pandocCitationSuffix(token: Token) {
          this.tag(`<suffix "${this.sliceSerialize(token)}">`);
        },
        pandocCitationItemDelimiter(token: Token) {
          this.tag(`<delim "${this.sliceSerialize(token)}">`);
        },
        pandocCitationWhitespaces(token: Token) {
          this.tag(`<space "${this.sliceSerialize(token)}">`);
        },
        pandocCitationComma(token: Token) {
          this.tag(`<comma "${this.sliceSerialize(token)}">`);
        },
      },
      exit: {
        pandocCitation(_token: Token) {
          this.tag("</cite>");
        },
        pandocCitationInText(_token: Token) {
          this.tag("</citeInText>");
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
        pandocCitationLocatorOuter(_token: Token) {
          this.tag("</locatorOuter>");
        },
        pandocCitationLocator(_token: Token) {
          this.tag("</locator>");
        },
        pandocCitationSuffix(_token: Token) {
          this.tag("</suffix>");
        },
        pandocCitationItemDelimiter(_token: Token) {
          this.tag("</delim>");
        },
        pandocCitationWhitespaces(_token: Token) {
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
    '<p><citeInText "@a.b"><idPrefix "@"></idPrefix><id "a.b"></id></citeInText></p>',
  );
});

test("ID and multiple internal punctuations", () => {
  expect(micromark("@a..b", opts)).eq(
    '<p><citeInText "@a"><idPrefix "@"></idPrefix><id "a"></id></citeInText>..b</p>',
  );
});

test("ID and final punctuation", () => {
  expect(micromark("@a.", opts)).eq(
    '<p><citeInText "@a"><idPrefix "@"></idPrefix><id "a"></id></citeInText>.</p>',
  );
});

test("ID with braces", () => {
  expect(micromark("@{a..b.}", opts)).eq(
    '<p><citeInText "@{a..b.}"><idPrefix "@"></idPrefix><open "{"></open><id "a..b."></id><close "}"></close></citeInText></p>',
  );
});

test("author-in-text citation", () => {
  expect(micromark("@id", opts)).eq(
    '<p><citeInText "@id"><idPrefix "@"></idPrefix><id "id"></id></citeInText></p>',
  );
});

test("author-in-text citation with locator", () => {
  expect(micromark("@id [locator]", opts)).eq(
    '<p><citeInText "@id [locator]"><idPrefix "@"></idPrefix><id "id"></id><space " "></space><locatorOuter "[locator]"><open "["></open><locator "locator"></locator><close "]"></close></locatorOuter></citeInText></p>',
  );
});

test("citation", () => {
  expect(micromark("[@id]", opts)).eq(
    '<p><cite "[@id]"><open "["></open><item "@id"><idPrefix "@"></idPrefix><id "id"></id></item><close "]"></close></cite></p>',
  );
});

test("citation with prefix", () => {
  expect(micromark("[prefix @id]", opts)).eq(
    '<p><cite "[prefix @id]"><open "["></open><item "prefix @id"><prefix "prefix "></prefix><idPrefix "@"></idPrefix><id "id"></id></item><close "]"></close></cite></p>',
  );
});

test("citation with suffix", () => {
  expect(micromark("[@id, suffix]", opts)).eq(
    '<p><cite "[@id, suffix]"><open "["></open><item "@id, suffix"><idPrefix "@"></idPrefix><id "id"></id><comma ","></comma><space " "></space><suffix "suffix"></suffix></item><close "]"></close></cite></p>',
  );
});

test("citation with prefix and suffix", () => {
  expect(micromark("[prefix @id, suffix]", opts)).eq(
    '<p><cite "[prefix @id, suffix]"><open "["></open><item "prefix @id, suffix"><prefix "prefix "></prefix><idPrefix "@"></idPrefix><id "id"></id><comma ","></comma><space " "></space><suffix "suffix"></suffix></item><close "]"></close></cite></p>',
  );
});

test("citation with locator", () => {
  expect(micromark("[@id{locator}]", opts)).eq(
    '<p><cite "[@id{locator}]"><open "["></open><item "@id{locator}"><idPrefix "@"></idPrefix><id "id"></id><locatorOuter "{locator}"><open "{"></open><locator "locator"></locator><close "}"></close></locatorOuter></item><close "]"></close></cite></p>',
  );
});

test("citation with locator + whitespace", () => {
  expect(micromark("[@id {locator}]", opts)).eq(
    '<p><cite "[@id {locator}]"><open "["></open><item "@id {locator}"><idPrefix "@"></idPrefix><id "id"></id><space " "></space><locatorOuter "{locator}"><open "{"></open><locator "locator"></locator><close "}"></close></locatorOuter></item><close "]"></close></cite></p>',
  );
});

test("citation with locator + whitespace + comma", () => {
  expect(micromark("[@id, {locator}]", opts)).eq(
    '<p><cite "[@id, {locator}]"><open "["></open><item "@id, {locator}"><idPrefix "@"></idPrefix><id "id"></id><comma ","></comma><space " "></space><locatorOuter "{locator}"><open "{"></open><locator "locator"></locator><close "}"></close></locatorOuter></item><close "]"></close></cite></p>',
  );
});

test("citation with all options", () => {
  expect(micromark("[prefix @id, {locator} suffix]", opts)).eq(
    '<p><cite "[prefix @id, {locator} suffix]"><open "["></open><item "prefix @id, {locator} suffix"><prefix "prefix "></prefix><idPrefix "@"></idPrefix><id "id"></id><comma ","></comma><space " "></space><locatorOuter "{locator}"><open "{"></open><locator "locator"></locator><close "}"></close></locatorOuter><suffix " suffix"></suffix></item><close "]"></close></cite></p>',
  );
});

test("citation with typo", () => {
  expect(micromark("[@id , {locator} suffix]", opts)).eq(
    '<p><cite "[@id , {locator} suffix]"><open "["></open><item "@id , {locator} suffix"><idPrefix "@"></idPrefix><id "id"></id><space " "></space><suffix ", {locator} suffix"></suffix></item><close "]"></close></cite></p>',
  );
});

test("citations", () => {
  expect(micromark("[@id;@id2]", opts)).eq(
    '<p><cite "[@id;@id2]"><open "["></open><item "@id"><idPrefix "@"></idPrefix><id "id"></id></item><delim ";"></delim><item "@id2"><idPrefix "@"></idPrefix><id "id2"></id></item><close "]"></close></cite></p>',
  );
});
