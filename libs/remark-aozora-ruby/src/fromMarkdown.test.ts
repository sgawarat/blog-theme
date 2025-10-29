// SPDX-License-Identifier: MIT
import type { PhrasingContent, Root, Strong, Text } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { expect, test } from "vitest";
import { aozoraRubyFromMarkdown } from "./fromMarkdown.ts";
import { aozoraRubySyntax } from "./syntax.ts";

function mdast(str: string) {
  return fromMarkdown(str, {
    extensions: [aozoraRubySyntax()],
    mdastExtensions: [aozoraRubyFromMarkdown()],
  });
}

function strong(...children: PhrasingContent[]): Strong {
  return {
    type: "strong",
    children,
  };
}

function text(value: string): Text {
  return {
    type: "text",
    value,
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

function ruby(...children: PhrasingContent[]): PhrasingContent {
  return {
    type: "aozoraRuby",
    children,
    data: { hName: "ruby" },
  } as unknown as PhrasingContent;
}

function rt(...children: PhrasingContent[]): PhrasingContent {
  return {
    type: "aozoraRubyText",
    children,
    data: { hName: "rt" },
  };
}

const prefix: PhrasingContent = {
  type: "aozoraRubyParen",
  value: "｜",
  data: { hName: "rp" },
};

const open: PhrasingContent = {
  type: "aozoraRubyParen",
  value: "《",
  data: { hName: "rp" },
};

const close: PhrasingContent = {
  type: "aozoraRubyParen",
  value: "》",
  data: { hName: "rp" },
};

test("ruby with prefix", () => {
  expect(mdast("外側｜内側《ルビ》")).to.containSubset(
    rootP(
      text("外側"),
      ruby(prefix, text("内側"), open, rt(text("ルビ")), close),
    ),
  );
});

test("ruby without prefix", () => {
  expect(mdast("内側《ルビ》")).to.containSubset(
    rootP(ruby(text("内側"), open, rt(text("ルビ")), close)),
  );
});

test("ruby with decoration", () => {
  expect(
    mdast("カタカナ**ひらがな**《装飾があっても文字種の境で区切れる》"),
  ).to.containSubset(
    rootP(
      text("カタカナ"),
      ruby(
        strong(text("ひらがな")),
        open,
        rt(text("装飾があっても文字種の境で区切れる")),
        close,
      ),
    ),
  );

  expect(
    mdast(
      "**ひらがな**と**ひらがな**《装飾があっても同一文字種の塊は内側判定》",
    ),
  ).to.containSubset(
    rootP(
      ruby(
        strong(text("ひらがな")),
        text("と"),
        strong(text("ひらがな")),
        open,
        rt(text("装飾があっても同一文字種の塊は内側判定")),
        close,
      ),
    ),
  );
});

test("ruby for Hiragana", () => {
  expect(mdast("外側うちがわ《ルビ》")).to.containSubset(
    rootP(text("外側"), ruby(text("うちがわ"), open, rt(text("ルビ")), close)),
  );
});

test("ruby for Katakana", () => {
  expect(mdast("外側ウチガワ《ルビ》")).to.containSubset(
    rootP(text("外側"), ruby(text("ウチガワ"), open, rt(text("ルビ")), close)),
  );
});

test("ruby for Han", () => {
  expect(mdast("そとがわ内側《ルビ》")).to.containSubset(
    rootP(text("そとがわ"), ruby(text("内側"), open, rt(text("ルビ")), close)),
  );

  expect(mdast("漢字仝々〆〇ヶ《記号の一部は漢字扱い》")).to.containSubset(
    rootP(
      ruby(
        text("漢字仝々〆〇ヶ"),
        open,
        rt(text("記号の一部は漢字扱い")),
        close,
      ),
    ),
  );
});

test("ruby for Latin", () => {
  expect(mdast("外側inside《ルビ》")).to.containSubset(
    rootP(text("外側"), ruby(text("inside"), open, rt(text("ルビ")), close)),
  );
});

test("ruby for Kana", () => {
  expect(mdast("長音ー《は仮名文字扱い》")).to.containSubset(
    rootP(
      text("長音"),
      ruby(text("ー"), open, rt(text("は仮名文字扱い")), close),
    ),
  );
  expect(mdast("ひらがなー《でもあり》")).to.containSubset(
    rootP(ruby(text("ひらがなー"), open, rt(text("でもあり")), close)),
  );
  expect(mdast("カタカナー《でもある》")).to.containSubset(
    rootP(ruby(text("カタカナー"), open, rt(text("でもある")), close)),
  );

  expect(mdast("ひらがな**ー**《の一部にもなり》")).to.containSubset(
    rootP(
      ruby(
        text("ひらがな"),
        strong(text("ー")),
        open,
        rt(text("の一部にもなり")),
        close,
      ),
    ),
  );
  expect(mdast("カタカナ**ー**《の一部にもなる》")).to.containSubset(
    rootP(
      ruby(
        text("カタカナ"),
        strong(text("ー")),
        open,
        rt(text("の一部にもなる")),
        close,
      ),
    ),
  );
});
