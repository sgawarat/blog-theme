// SPDX-License-Identifier: MIT
import type { Data, Node, Parent } from "mdast";
import type { Extension, Token } from "mdast-util-from-markdown";
import type {} from "mdast-util-to-hast";

declare module "mdast" {
  interface RootContentMap {
    pandocCitation: PandocCitation;
    pandocCitationItem: PandocCitationItem;
  }

  interface PhrasingContentMap {
    pandocCitation: PandocCitation;
    pandocCitationItem: PandocCitationItem;
  }
}

interface PandocCitationContentMap {
  pandocCitationItem: PandocCitationItem;
}

export type PandocCitationContent =
  PandocCitationContentMap[keyof PandocCitationContentMap];

export interface PandocCitationData extends Data {
  _pandocCitationInText: boolean;
}

export interface PandocCitation extends Parent {
  type: "pandocCitation";
  children: PandocCitationContent[];
  data: PandocCitationData;
}

export interface PandocCitationItemData extends Data {
  _pandocCitationPrefix?: string | undefined;
  _pandocCitationIdPrefix?: string | undefined;
  _pandocCitationId?: string | undefined;
  _pandocCitationLocator?: string | undefined;
  _pandocCitationSuffix?: string | undefined;
}

export interface PandocCitationItem extends Node {
  type: "pandocCitationItem";
  data: PandocCitationItemData;
}

export function pandocCitationFromMarkdown(): Extension {
  return {
    enter: {
      pandocCitation(token) {
        this.enter(
          {
            type: "pandocCitation",
            children: [],
            data: {
              _pandocCitationInText: token._pandocCitationInText ?? false,
            },
          },
          token,
        );
      },
      pandocCitationItem(token) {
        this.enter(
          {
            type: "pandocCitationItem",
            data: {},
          },
          token,
        );
      },
      pandocCitationPrefix(token) {
        const node = this.stack.at(-1);
        if (node?.type === "pandocCitationItem") {
          node.data._pandocCitationPrefix = this.sliceSerialize(token);
        }
      },
      pandocCitationIdPrefix(token) {
        const node = this.stack.at(-1);
        if (node?.type === "pandocCitationItem") {
          node.data._pandocCitationIdPrefix = this.sliceSerialize(token);
        }
      },
      pandocCitationId(token) {
        const node = this.stack.at(-1);
        if (node?.type === "pandocCitationItem") {
          node.data._pandocCitationId = this.sliceSerialize(token);
        }
      },
      pandocCitationLocatorOuter(_token) {
        const node = this.stack.at(-1);
        if (node?.type === "pandocCitationItem") {
          node.data._pandocCitationLocator = "";
        }
      },
      pandocCitationLocator(token) {
        const node = this.stack.at(-1);
        if (node?.type === "pandocCitationItem") {
          node.data._pandocCitationLocator = this.sliceSerialize(token);
        }
      },
      pandocCitationSuffix(token) {
        const node = this.stack.at(-1);
        if (node?.type === "pandocCitationItem") {
          node.data._pandocCitationSuffix = this.sliceSerialize(token);
        }
      },
    },
    exit: {
      pandocCitation(token: Token) {
        this.exit(token);
      },
      pandocCitationInText(token: Token) {
        this.exit(token);
      },
      pandocCitationItem(token: Token) {
        this.exit(token);
      },
    },
  };
}
