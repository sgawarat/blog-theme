// SPDX-License-Identifier: MIT
import type { Data, Literal, Parent, PhrasingContent } from "mdast";
import type {
  CompileContext,
  Extension,
  Token,
} from "mdast-util-from-markdown";
import { toString as stringify } from "mdast-util-to-string";
import { TextScanner } from "./utils/scanText.ts";

declare module "mdast" {
  interface PhrasingContentMap {
    aozoraRuby: AozoraRuby;
    aozoraRubyParen: AozoraRubyParen;
    aozoraRubyText: AozoraRubyText;
  }

  interface RootContentMap {
    aozoraRuby: AozoraRuby;
    aozoraRubyParen: AozoraRubyParen;
    aozoraRubyText: AozoraRubyText;
  }
}

function buildBaseTextFromSiblings(
  siblings: PhrasingContent[],
  children: PhrasingContent[],
) {
  const scanner = new TextScanner();
  while (true) {
    const node = siblings.at(-1);
    if (node === undefined) break;
    switch (node.type) {
      case "text": {
        // 平文からベーステキストを探す
        const result = scanner.exec(node.value);

        // テキストの切れ目が見つかった場合、そこまでをベーステキストする
        if (result[0].length > 0) {
          // その切れ目が文中であれば、ノードから文字列を切り出す
          if (result[1].length > 0) {
            node.value = result[0];
            children.push({ type: "text", value: result[1] });
          }
          return;
        }
        break;
      }
      default: {
        // ノードのテキストからベーステキストを探す
        const result = scanner.exec(
          stringify(node, {
            includeHtml: false,
            includeImageAlt: false,
          }),
        );

        // テキストの切れ目が見つかった場合、そこまでをベーステキストする
        if (result[0].length > 0) {
          // ツリーの再構築を行わないので、ノードの合間をテキストの切れ目とする
          return;
        }
        break;
      }
    }

    // テキストの切れ目が見つからなかった場合、ノード自体を貰い受けて次のノードへ
    siblings.pop();
    children.push(node);
  }
}

function enterAozoraRubyParen(this: CompileContext, token: Token) {
  this.enter(
    {
      type: "aozoraRubyParen",
      value: this.sliceSerialize(token),
      data: { hName: "rp" },
    },
    token,
  );
}

export interface AozoraRubyData extends Data {}

export interface AozoraRuby extends Parent {
  type: "aozoraRuby";
  children: PhrasingContent[];
  data?: AozoraRubyData | undefined;
}

export interface AozoraRubyParen extends Literal {
  type: "aozoraRubyParen";
  value: string;
  data?: AozoraRubyData | undefined;
}

export interface AozoraRubyText extends Parent {
  type: "aozoraRubyText";
  children: PhrasingContent[];
  data?: AozoraRubyData | undefined;
}

export function aozoraRubyFromMarkdown(): Extension {
  return {
    enter: {
      aozoraRuby(token: Token) {
        const children: PhrasingContent[] = [];

        // 開始記号がなければ、直前の文字列からベーステキストを探す
        if (token._aozoraRubySyntaxType === "noPrefix") {
          // TODO: 兄姉ノードがPhrasingContentかどうかちゃんと調べる
          const parent = this.stack.at(-1) as Parent;
          const siblings = parent.children as PhrasingContent[];
          buildBaseTextFromSiblings(siblings, children);
        }

        this.enter(
          {
            type: "aozoraRuby",
            children,
            data: {
              hName: "ruby",
            },
          },
          token,
        );
      },
      aozoraRubyPrefix: enterAozoraRubyParen,
      aozoraRubyOpen: enterAozoraRubyParen,
      aozoraRubyText(token: Token) {
        this.enter(
          {
            type: "aozoraRubyText",
            children: [],
            data: { hName: "rt" },
          },
          token,
        );
      },
      aozoraRubyClose: enterAozoraRubyParen,
    },
    exit: {
      aozoraRuby(token: Token) {
        this.exit(token);
      },
      aozoraRubyPrefix(token: Token) {
        this.exit(token);
      },
      aozoraRubyOpen(token: Token) {
        this.exit(token);
      },
      aozoraRubyText(token: Token) {
        this.exit(token);
      },
      aozoraRubyClose(token: Token) {
        this.exit(token);
      },
    },
  };
}
