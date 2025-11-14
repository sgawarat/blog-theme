import { CitationStyle } from "./index.ts";
import type {
  CslDataItem,
  CslDataName,
  CslDataDate,
  CslCitationItem,
} from "../schema.ts";
import type { ElementContent } from "hast";

const INITIAL_REGEXP = /(\p{Lu})\p{Ll}+/u;
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
    const year = date["date-parts"][0]?.[0] ?? "";
    return `${year}`;
  }
  return "";
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

const opening: ElementContent = { type: "text", value: "[" };
const closing: ElementContent = { type: "text", value: "]" };
const comma: ElementContent = { type: "text", value: ", " };
const space: ElementContent = { type: "text", value: " " };

function makeCitationPrefix(item: CslCitationItem): ElementContent[] {
  const nodes: ElementContent[] = [];
  if (item.prefix) {
    nodes.push({ type: "text", value: item.prefix });
  }
  if (!item["suppress-author"]) {
    const author = makeAuthorShort(item.itemData);
    if (author) {
      if (nodes.length > 0) nodes.push(space);
      nodes.push({ type: "text", value: author });
    }
  }
  return nodes;
}

function makeCitationSuffix(item: CslCitationItem): ElementContent[] {
  const nodes: ElementContent[] = [];
  const date = makeDateShort(item.itemData?.issued);
  if (date) {
    nodes.push({ type: "text", value: date });
  }
  if (item.locator || item.suffix) {
    let delim = comma;
    if (item.locator) {
      if (nodes.length > 0) nodes.push(delim);
      nodes.push({ type: "text", value: item.locator });
      delim = space;
    }
    if (item.suffix) {
      if (nodes.length > 0) nodes.push(delim);
      nodes.push({ type: "text", value: item.suffix });
    }
  }
  return nodes;
}

function makeCitation(item: CslCitationItem): ElementContent[] {
  if (item.itemData === undefined) {
    return [
      {
        type: "text",
        value: makePlain(item),
      },
    ];
  }
  const prefix = makeCitationPrefix(item);
  const suffix = makeCitationSuffix(item);
  return [
    {
      type: "element",
      tagName: "span",
      properties: {
        class: "citation-item",
      },
      children: prefix.length === 0 ? suffix : [...prefix, space, ...suffix],
    },
  ];
}

function makeCitationInText(item: CslCitationItem): ElementContent[] {
  if (item.itemData === undefined) {
    return [
      {
        type: "text",
        value: makePlain(item),
      },
    ];
  }
  const prefix = makeCitationPrefix(item);
  const suffix = makeCitationSuffix(item);
  return [
    ...prefix,
    ...(prefix.length === 0 ? [] : [space]),
    opening,
    {
      type: "element",
      tagName: "span",
      properties: {
        class: "citation-item",
      },
      children: suffix,
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
          { type: "text", value: "; " },
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
          { type: "text", value: "; " },
          ...makeCitationInText(item),
        ]),
    ];
  }
}
