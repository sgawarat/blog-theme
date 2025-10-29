// SPDX-License-Identifier: MIT
import { join } from "node:path";
import type { Link, PhrasingContent, Root, Text } from "mdast";
import { remark } from "remark";
import { VFile } from "vfile";
import { expect, test } from "vitest";
import { remarkObsidianWikilink } from "./index.ts";
import { findShortestPath } from "./utils/find.ts";

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

const processor = remark()
  .use(remarkObsidianWikilink, {
    glob(name, sourceDir) {
      return join(sourceDir, name);
    },
    slugify(input) {
      return `slugify(${input})`;
    },
    baseUrl: "https://base-url.example",
  })
  .freeze();

function parsed(input: string) {
  return processor.runSync(
    processor.parse(input),
    new VFile({ path: "./content/dir/file.md" }),
  );
}

test("url", () => {
  expect(parsed("[[https://vitest.dev/|Vitest]]")).containSubset(
    rootP(wikilink("https://vitest.dev/", text("Vitest"))),
  );
});

test("name", () => {
  expect(parsed("[[name]]")).containSubset(
    rootP(
      wikilink(
        "https://base-url.example/slugify(content)/slugify(dir)/slugify(name)",
        text("name"),
      ),
    ),
  );
});

test("relative path", () => {
  expect(parsed("[[rel/name]]")).containSubset(
    rootP(
      wikilink(
        "https://base-url.example/slugify(content)/slugify(dir)/slugify(rel)/slugify(name)",
        text("rel/name"),
      ),
    ),
  );

  expect(parsed("[[./rel/name]]")).containSubset(
    rootP(
      wikilink(
        "https://base-url.example/slugify(content)/slugify(dir)/slugify(rel)/slugify(name)",
        text("./rel/name"),
      ),
    ),
  );
});

test("absolute path", () => {
  expect(parsed("[[/abs/name]]")).containSubset(
    rootP(
      wikilink(
        "https://base-url.example/slugify(content)/slugify(dir)/slugify(abs)/slugify(name)",
        text("/abs/name"),
      ),
    ),
  );
});

test("shortest path", () => {
  const rootDir = import.meta.dirname;
  const processor = remark()
    .use(remarkObsidianWikilink, {
      glob(name, sourceDir) {
        return findShortestPath(name, rootDir, sourceDir);
      },
      slugify(input) {
        return input;
      },
      baseUrl: "https://base-url.example",
    })
    .freeze();
  expect(
    processor.runSync(
      processor.parse("[[1]]"),
      new VFile({ path: `${import.meta.dirname}/source.md` }),
    ),
  ).containSubset(
    rootP(wikilink("https://base-url.example/utils/samples/1", text("1"))),
  );
});
