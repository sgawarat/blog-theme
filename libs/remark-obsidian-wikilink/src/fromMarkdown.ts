// SPDX-License-Identifier: MIT
import type { Link } from "mdast";
import type { Extension, Token } from "mdast-util-from-markdown";

declare module "mdast" {
  interface LinkData {
    _isObsidianWikilink?: true | undefined;
  }
}

export function obsidianWikilinkFromMarkdown(): Extension {
  return {
    enter: {
      obsidianWikilink(token: Token): undefined {
        this.enter(
          {
            type: "link",
            url: "",
            children: [],
            data: {
              _isObsidianWikilink: true,
            },
          },
          token,
        );
      },
      obsidianWikilinkPath(token: Token): undefined {
        const node = this.stack.at(-1) as Link;
        node.url = this.sliceSerialize(token);
      },
    },
    exit: {
      obsidianWikilink(token: Token): undefined {
        const node = this.stack.at(-1) as Link;
        if (node.children.length === 0) {
          node.children.push({
            type: "text",
            value: node.url,
          });
        }
        this.exit(token);
      },
    },
  };
}
