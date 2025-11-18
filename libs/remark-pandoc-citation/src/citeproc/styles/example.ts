// SPDX-License-Identifier: MIT
import type { ElementContent } from "hast";
import type {
  CslCitationItem,
  CslDataDate,
  CslDataItem,
  CslDataName,
} from "../schema.ts";
import { CitationStyle } from "../style.ts";

const INITIAL_REGEXP = /(\p{Lu})\p{Ll}+/gu;
const LAST_LETTER_REGEXP = /\p{L}$/u;

function makeNameLong(name: CslDataName | undefined): string {
  if (name === undefined) return "";
  if (name.family === undefined) return name.given ?? "";

  let result = "";
  const particle = name["non-dropping-particle"] ?? name["dropping-particle"];
  if (particle !== undefined) {
    const space = LAST_LETTER_REGEXP.test(particle) ? " " : "";
    result = `${particle}${space}${name.family}`;
  } else {
    result = name.family;
  }
  if (name.suffix) {
    const comma = name["comma-suffix"] ? "," : "";
    result += `${comma} ${name.suffix}`;
  }
  if (name.given) {
    result += `, ${name.given.replaceAll(INITIAL_REGEXP, "$1.")}`;
  }
  return result;
}

function makeNameShort(name: CslDataName | undefined): string {
  if (name === undefined) return "";
  if (name.family === undefined) return name.given ?? "";

  let result = "";
  const particle = name["non-dropping-particle"];
  if (particle !== undefined) {
    const space = LAST_LETTER_REGEXP.test(particle) ? " " : "";
    result = `${particle}${space}${name.family}`;
  } else {
    result = name.family;
  }
  if (name.suffix) {
    const comma = name["comma-suffix"] ? "," : "";
    result += `${comma} ${name.suffix}`;
  }
  return result;
}

function makeNamesShort(names: CslDataName[]): string {
  if (names.length <= 0) return "";
  if (names.length === 1) return makeNameShort(names[0]);
  if (names.length === 2) {
    return `${makeNameShort(names[0])} and ${makeNameShort(names[1])}`;
  }
  return `${makeNameShort(names[0])} et al.`;
}

function makeNamesLong(names: CslDataName[]): string {
  if (names.length <= 0) return "";

  let result = makeNameLong(names[0]);
  for (const name of names.slice(1, -1)) {
    result += `, ${makeNameLong(name)}`;
  }
  if (names.length >= 2) {
    result += ` and ${makeNameLong(names.at(-1) ?? {})}`;
  }
  return result;
}

function makeDateShort(date: CslDataDate | undefined): string {
  if (date === undefined) return "";
  if (date["date-parts"] !== undefined) {
    const year = date["date-parts"][0]?.[0] ?? "0000";
    return `${year}`;
  }
  return "0000";
}

function makePlain(item: CslCitationItem): string {
  const prefix = item.prefix ? `${item.prefix} ` : "";
  const id = item["suppress-author"] ? `-@${item.id}` : `@${item.id}`;
  const locator = item.locator ? ` ${item.locator}` : "";
  const suffix = item.suffix ? ` ${item.suffix}` : "";
  const comma = locator || suffix ? "," : "";
  return `${prefix}${id}${comma}${locator}${suffix}`;
}

function makeAuthorShort(item: CslDataItem | undefined): string {
  if (item === undefined) return "";
  if (item.author) return makeNamesShort(item.author);
  return item.publisher ?? item["container-title"] ?? "";
}

function makeAuthorLong(item: CslDataItem | undefined): string {
  if (item === undefined) return "";
  if (item.author) return makeNamesLong(item.author);
  return item.publisher ?? "";
}

const opening: ElementContent = { type: "text", value: "[" };
const closing: ElementContent = { type: "text", value: "]" };
const commaSpace: ElementContent = { type: "text", value: ", " };
const space: ElementContent = { type: "text", value: " " };
const dot: ElementContent = { type: "text", value: "." };

function makeText(value: string): ElementContent {
  return { type: "text", value };
}

function makeCiteTag(value: string): ElementContent {
  return {
    type: "element",
    tagName: "cite",
    properties: {},
    children: [makeText(value)],
  };
}

function makeExternalLink(
  href: string,
  text?: string | undefined,
): ElementContent {
  return {
    type: "element",
    tagName: "a",
    properties: {
      href,
      rel: "noopener noreferrer nofollow external",
      target: "_blank",
    },
    children: [makeText(text ?? href)],
  };
}

function makeCitationPrefix(
  nodes: ElementContent[],
  item: CslCitationItem,
): ElementContent[] {
  if (item.prefix) {
    if (nodes.length > 0) nodes.push(space);
    nodes.push(makeText(item.prefix));
  }
  if (!item["suppress-author"]) {
    const author = makeAuthorShort(item.itemData);
    if (author) {
      if (nodes.length > 0) nodes.push(space);
      nodes.push(makeText(author));
    }
  }
  return nodes;
}

function makeCitationSuffix(
  nodes: ElementContent[],
  item: CslCitationItem,
): ElementContent[] {
  const date = makeDateShort(item.itemData?.issued);
  if (date) {
    if (nodes.length > 0) nodes.push(space);
    nodes.push(makeText(date));
  }
  if (item.locator || item.suffix) {
    let delim = commaSpace;
    if (item.locator) {
      if (nodes.length > 0) nodes.push(delim);
      nodes.push(makeText(item.locator));
      delim = space;
    }
    if (item.suffix) {
      if (nodes.length > 0) nodes.push(delim);
      nodes.push(makeText(item.suffix));
    }
  }
  return nodes;
}

const DOI_REGEXP = /10\.\d+\/.+/;

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: TODO
function makeBibliography(item: CslDataItem): ElementContent {
  const children: ElementContent[] = [];
  let delim: ElementContent | undefined;
  const addDelimiter = (next: ElementContent | undefined) => {
    if (delim !== undefined) children.push(delim);
    delim = next;
  };

  if (item.author) {
    addDelimiter(space);
    children.push(makeText(makeAuthorLong(item)));
  }
  if (item.issued) {
    addDelimiter(space);
    children.push(makeText(makeDateShort(item.issued)), dot);
  }
  if (item.title) {
    addDelimiter(space);
    children.push(makeText(item.title), dot);
  }
  if (item["container-title"]) {
    addDelimiter(space);
    children.push(makeCiteTag(item["container-title"]));
    if (item.volume) {
      addDelimiter(commaSpace);
      children.push(makeText(`${item.volume}`));
    }
    if (item.issue) {
      addDelimiter(commaSpace);
      children.push(makeText(`${item.issue}`));
    }
    if (item.page) {
      addDelimiter(commaSpace);
      children.push(makeText(`${item.page}`));
    }
    delim = dot;
    addDelimiter(space);
  }
  if (item["event-title"]) {
    addDelimiter(space);
    children.push(makeText(item["event-title"]), dot);
  }
  if (item.DOI) {
    addDelimiter(space);
    if (URL.canParse(item.DOI)) {
      children.push(makeExternalLink(item.DOI), dot);
    } else if (DOI_REGEXP.test(item.DOI)) {
      children.push(
        makeExternalLink(`https://doi.org/${item.DOI}`, item.DOI),
        dot,
      );
    } else {
      children.push(makeText(item.DOI), dot);
    }
  }
  if (item.URL) {
    addDelimiter(space);
    if (URL.canParse(item.URL)) {
      children.push(makeExternalLink(item.URL), dot);
    } else {
      children.push(makeText(item.URL), dot);
    }
  }
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

function makeCitation(item: CslCitationItem): ElementContent[] {
  if (item.itemData === undefined) {
    return [makeText(makePlain(item))];
  }
  return [
    {
      type: "element",
      tagName: "span",
      properties: {
        class: "citation-item",
      },
      children: [
        ...makeCitationSuffix(makeCitationPrefix([], item), item),
        makeBibliography(item.itemData),
      ],
    },
  ];
}

function makeCitationInText(item: CslCitationItem): ElementContent[] {
  if (item.itemData === undefined) {
    return [makeText(makePlain(item))];
  }
  const prefix = makeCitationPrefix([], item);
  const suffix = makeCitationSuffix([], item);
  return [
    ...prefix,
    ...(prefix.length > 0 ? [space] : []),
    opening,
    {
      type: "element",
      tagName: "span",
      properties: {
        class: "citation-item",
      },
      children: [...suffix, makeBibliography(item.itemData)],
    },
    closing,
  ];
}

export class MyCitationStyle extends CitationStyle {
  getCitation(items: CslCitationItem[]): ElementContent[] {
    return [
      opening,
      ...(items[0] !== undefined ? makeCitation(items[0]) : []),
      ...items
        .slice(1)
        .flatMap((item): ElementContent[] => [
          makeText("; "),
          ...makeCitation(item),
        ]),
      closing,
    ];
  }

  getCitationInText(items: CslCitationItem[]): ElementContent[] {
    return [
      ...(items[0] !== undefined ? makeCitationInText(items[0]) : []),
      ...items
        .slice(1)
        .flatMap((item): ElementContent[] => [
          makeText("; "),
          ...makeCitationInText(item),
        ]),
    ];
  }
}
