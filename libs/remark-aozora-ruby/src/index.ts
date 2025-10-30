// SPDX-License-Identifier: MIT
import type { Root } from "mdast";
import type { Extension as FromMarkdownExtension } from "mdast-util-from-markdown";
import type { Extension as MicromarkExtension } from "micromark-util-types";
import type { Plugin } from "unified";
import { aozoraRubyFromMarkdown } from "./fromMarkdown.ts";
import { type AozoraRubySyntaxOptions, aozoraRubySyntax } from "./syntax.ts";

declare module "unified" {
  interface Data {
    micromarkExtensions: MicromarkExtension[];
    fromMarkdownExtensions: FromMarkdownExtension[];
  }
}

export interface AozoraRubyRemarkOptions extends AozoraRubySyntaxOptions {}

export const remarkAozoraRuby: Plugin<[AozoraRubyRemarkOptions], Root> =
  function (opts?: AozoraRubyRemarkOptions | undefined) {
    const data = this.data();
    data.micromarkExtensions ??= [];
    data.micromarkExtensions.push(aozoraRubySyntax(opts));
    data.fromMarkdownExtensions ??= [];
    data.fromMarkdownExtensions.push(aozoraRubyFromMarkdown());
  };
