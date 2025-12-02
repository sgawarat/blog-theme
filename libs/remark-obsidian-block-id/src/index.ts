// SPDX-License-Identifier: MIT
import type { Data, Parent, Root, RootContent } from "mdast";
import type {} from "mdast-util-to-hast";
import type { Plugin } from "unified";
import { remove } from "unist-util-remove";

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

export interface RemarkObsidianBlockIdOptions {
  /** 既存のタグにIDを付与するか */
  intrusive?: boolean | undefined;
}

export const remarkObsidianBlockId: Plugin<
  [RemarkObsidianBlockIdOptions],
  Root
> = (opts?) => (tree) => {
  // 構文からIDを取り出して直前の要素に付与する
  remove(tree, (unistNode, index, unistParent) => {
    const node = unistNode as RootContent;
    const parent = unistParent as Parent;
    if (index === undefined || parent === undefined) return;

    let removed = false;
    switch (node.type) {
      case "paragraph": {
        const child = node.children.at(-1);
        if (child?.type === "text") {
          const m = child.value.match(BLOCK_ID_REGEXP);
          if (m !== null) {
            if (m[1] === undefined) {
              // 段落に構文のみがあるなら、その直前の要素にIDを付与する
              if (node.children.length === 1 && index > 0) {
                applyId(
                  parent.children,
                  index - 1,
                  m[2] ?? "",
                  opts?.intrusive,
                );
                removed = true;
              }
            } else {
              // 段落の末尾に構文があるなら、その段落自体にIDを付与する
              child.value = m[1];
              applyId(parent.children, index, m[2] ?? "", opts?.intrusive);
            }
          }
        }
        break;
      }
      case "heading": {
        const child = node.children.at(-1);
        if (child?.type === "text") {
          const m = child.value.match(BLOCK_ID_REGEXP);
          if (m !== null && m[1] !== undefined) {
            // 末尾に構文があるなら、その自体にIDを付与する
            child.value = m[1];
            applyId(parent.children, index, m[2] ?? "", opts?.intrusive);
          }
        }
        break;
      }
      default: {
        // not supported
        break;
      }
    }
    return removed;
  });
};
