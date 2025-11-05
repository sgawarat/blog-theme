// SPDX-License-Identifier: MIT
import type { Data, Parent, Text } from "mdast";
import type { Extension, Handle, Token } from "mdast-util-from-markdown";
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

function enterPandocCitation(inText: boolean): Handle {
  return function (this, token) {
    this.enter(
      {
        type: "pandocCitation",
        children: [],
        data: {
          _pandocCitationInText: inText,
        },
      },
      token,
    );
  };
}

interface PandocCitationContentMap {
  pandocCitationItem: PandocCitationItem;
}

interface PandocCitationItemContentMap {
  pandocCitationItemAuthor: Text;
  pandocCitationItemDate: Text;
}

export type PandocCitationContent =
  PandocCitationContentMap[keyof PandocCitationContentMap];

export type PandocCitationItemContent =
  PandocCitationItemContentMap[keyof PandocCitationItemContentMap];

export interface PandocCitationData extends Data {
  _pandocCitationInText: boolean;
}

export interface PandocCitationItemData extends Data {
  _pandocCitationPrefix?: string | undefined;
  _pandocCitationIdPrefix?: string | undefined;
  _pandocCitationId?: string | undefined;
  _pandocCitationLocator?: string | undefined;
  _pandocCitationSuffix?: string | undefined;
}

export interface PandocCitation extends Parent {
  type: "pandocCitation";
  children: PandocCitationContent[];
  data: PandocCitationData;
}

export interface PandocCitationItem extends Parent {
  type: "pandocCitationItem";
  children: PandocCitationItemContent[];
  data: PandocCitationItemData;
}

export function pandocCitationFromMarkdown(): Extension {
  return {
    enter: {
      pandocCitation: enterPandocCitation(false),
      pandocCitationInText: enterPandocCitation(true),
      pandocCitationItem(token) {
        this.enter(
          {
            type: "pandocCitationItem",
            children: [],
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
      pandocCitationLocator(token) {
        const node = this.stack.at(-1);
        if (node?.type === "pandocCitationItem") {
          node.data._pandocCitationLocator = this.sliceSerialize(token);
        }
      },
      pandocCitationSuffix(token) {
        const node = this.stack.at(-1);
        if (node?.type === "pandocCitationItem") {
          node.data._pandocCitationId = this.sliceSerialize(token);
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
