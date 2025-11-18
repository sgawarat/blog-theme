// SPDX-License-Identifier: MIT
import type { Root } from "mdast";
import type { Extension as FromMarkdownExtension } from "mdast-util-from-markdown";
import type { Extension as MicromarkExtension } from "micromark-util-types";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import type {} from "vfile";
import { Citeproc } from "./citeproc/index.ts";
import type { CslCitationItem, CslData } from "./citeproc/schema.ts";
import { MyCitationStyle } from "./citeproc/styles/example.ts";
import { pandocCitationFromMarkdown } from "./fromMarkdown/index.ts";
import { pandocCitationSyntax } from "./syntax/index.ts";

declare module "unified" {
  interface Data {
    micromarkExtensions: MicromarkExtension[];
    fromMarkdownExtensions: FromMarkdownExtension[];
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export interface PandocCitationRemarkOptions {
  bibliography?: string | undefined;
  references?: CslData | undefined;
}

export const remarkPandocCitation: Plugin<[PandocCitationRemarkOptions], Root> =
  function (opts?: PandocCitationRemarkOptions | undefined) {
    const data = this.data();
    data.micromarkExtensions ??= [];
    data.micromarkExtensions.push(pandocCitationSyntax());
    data.fromMarkdownExtensions ??= [];
    data.fromMarkdownExtensions.push(pandocCitationFromMarkdown());

    return (tree, vfile) => {
      const citeproc = new Citeproc(new MyCitationStyle());
      if (opts !== undefined) {
        citeproc.addItemsFromFrontmatter(opts);
      }

      const astro = vfile.data?.["astro"];
      if (isRecord(astro)) {
        const frontmatter = astro["frontmatter"];
        if (isRecord(frontmatter)) {
          citeproc.addItemsFromFrontmatter(frontmatter);
        }
      }

      visit(tree, "pandocCitation", (node) => {
        const items = node.children.flatMap((item): CslCitationItem[] => {
          if (
            item.type !== "pandocCitationItem" ||
            item.data._pandocCitationId === undefined
          )
            return [];
          return [
            {
              id: item.data._pandocCitationId,
              prefix: item.data._pandocCitationPrefix,
              locator: item.data._pandocCitationLocator,
              suffix: item.data._pandocCitationSuffix,
              "suppress-author": item.data._pandocCitationIdPrefix === "-@",
            },
          ];
        });
        node.data.hName = "span";
        node.data.hProperties = {
          class: "citation",
        };
        if (node.data._pandocCitationInText) {
          node.data.hChildren = citeproc.getCitationInText({
            schema:
              "https://resource.citationstyles.org/schema/latest/input/json/csl-citation.json",
            citationID: "citationID",
            citationItems: items,
          });
        } else {
          node.data.hChildren = citeproc.getCitation({
            schema:
              "https://resource.citationstyles.org/schema/latest/input/json/csl-citation.json",
            citationID: "citationID",
            citationItems: items,
          });
        }
      });
    };
  };
