// SPDX-License-Identifier: MIT
import type {
  Data,
  Heading,
  Paragraph,
  Parent,
  Root,
  RootContent,
} from "mdast";
import type {} from "mdast-util-to-hast";
import type { Plugin } from "unified";
import { CONTINUE, type VisitorResult, visit } from "unist-util-visit";

declare module "mdast" {
  interface PhrasingContentMap {
    obsidianBlockId: ObsidianBlockId;
  }

  interface RootContentMap {
    obsidianBlockId: ObsidianBlockId;
  }
}

interface ObsidianBlockId extends Parent {
  type: "obsidianBlockId";
  children: RootContent[];
  data?: Data | undefined;
}

const BLOCK_ID_REGEXP = /^(?:(?<content>[\s\S]*)\s)?\^(?<id>[\w-]+)$/;

/**
 * 指定のノードにIDを付与する
 */
function applyId(
  nodes: RootContent[],
  index: number,
  id: string,
  intrusive?: boolean | undefined,
) {
  const node = nodes[index];
  if (node === undefined) return;
  if (intrusive && node.data?.hProperties?.["id"] === undefined) {
    node.data ??= {};
    node.data.hProperties ??= {};
    node.data.hProperties["id"] = id;
    return;
  }
  nodes[index] = {
    type: "obsidianBlockId",
    children: [node],
    data: {
      hName: "div",
      hProperties: {
        id,
      },
    },
  };
}

function visitParagraph(
  node: Paragraph,
  index: number,
  parent: Parent,
  intrusive?: boolean | undefined,
): VisitorResult {
  const child = node.children.at(-1);
  if (child?.type === "text") {
    const m = child.value.match(BLOCK_ID_REGEXP);
    if (m !== null) {
      if (m[1] === undefined) {
        // 段落に構文のみがあるなら、その直前の要素にIDを付与する
        if (node.children.length === 1 && index > 0) {
          applyId(parent.children, index - 1, m[2] ?? "", intrusive);
          parent.children.splice(index, 1);
          return [CONTINUE, index];
        }
      } else {
        // 段落の末尾に構文があるなら、その段落自体にIDを付与する
        child.value = m[1];
        applyId(parent.children, index, m[2] ?? "", intrusive);
      }
    }
  }
  return CONTINUE;
}

function visitHeading(
  node: Heading,
  index: number,
  parent: Parent,
  intrusive: boolean | undefined,
): VisitorResult {
  const child = node.children.at(-1);
  if (child?.type === "text") {
    const m = child.value.match(BLOCK_ID_REGEXP);
    if (m !== null && m[1] !== undefined) {
      // 末尾に構文があるなら、その自体にIDを付与する
      child.value = m[1];
      applyId(parent.children, index, m[2] ?? "", intrusive);
    }
  }
  return CONTINUE;
}

export interface RemarkObsidianBlockIdOptions {
  /** 既存のタグにIDを付与するか */
  intrusive?: boolean | undefined;
}

export const remarkObsidianBlockId: Plugin<
  [RemarkObsidianBlockIdOptions],
  Root
> = (opts?) => (tree) => {
  // 構文からIDを取り出して直前の要素に付与する
  visit(tree, (node, index, parent): VisitorResult => {
    if (index === undefined || parent === undefined) return;

    switch (node.type) {
      case "paragraph": {
        return visitParagraph(node, index, parent, opts?.intrusive);
      }
      case "heading": {
        return visitHeading(node, index, parent, opts?.intrusive);
      }
      default: {
        // not supported
        return CONTINUE;
      }
    }
  });
};
