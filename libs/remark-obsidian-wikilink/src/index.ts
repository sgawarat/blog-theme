// SPDX-License-Identifier: MIT
import { dirname } from "node:path";
import type { Root } from "mdast";
import type { Extension as FromMarkdownExtension } from "mdast-util-from-markdown";
import type { Extension as MicromarkExtension } from "micromark-util-types";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { obsidianWikilinkFromMarkdown } from "./fromMarkdown.ts";
import { obsidianWikilinkSyntax } from "./syntax.ts";
import { PathResolver } from "./utils/resolve.ts";

declare module "unified" {
  interface Data {
    micromarkExtensions?: MicromarkExtension[];
    fromMarkdownExtensions?: FromMarkdownExtension[];
  }
}

export interface ObsidianWikilinkRemarkOptions {
  glob: (name: string, sourceDir: string) => string | undefined;
  slugify: (path: string) => string;
  baseUrl: string;
}

export const remarkObsidianWikilink: Plugin<
  [ObsidianWikilinkRemarkOptions],
  Root
> = function (opts: ObsidianWikilinkRemarkOptions) {
  const data = this.data();
  data.micromarkExtensions ??= [];
  data.micromarkExtensions.push(obsidianWikilinkSyntax());
  data.fromMarkdownExtensions ??= [];
  data.fromMarkdownExtensions.push(obsidianWikilinkFromMarkdown());

  const resolver = new PathResolver(opts.glob, opts.slugify, opts.baseUrl);
  return (tree, vfile) => {
    const sourceDir = dirname(vfile.path);
    visit(tree, "link", (node) => {
      if (node.data?._isObsidianWikilink === undefined) return;
      if (node.url.includes("://")) return;
      node.url = resolver.resolve(node.url, sourceDir);
    });
  };
};
