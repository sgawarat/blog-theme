// SPDX-License-Identifier: MIT
import { expect, test } from "vitest";
import {
  scanAnyText,
  scanHanText,
  scanHiraganaText,
  scanKanaText,
  scanKatakanaText,
  scanLatinText,
  TextScanner,
} from "./scanText.ts";

test("scanAnyText", () => {
  const ctx = { next: scanAnyText };
  expect(scanAnyText(ctx, "Latin")).toEqual(["", "Latin"]);
  expect(ctx.next).toEqual(scanLatinText);

  expect(scanAnyText(ctx, "ひらがな")).toEqual(["", "ひらがな"]);
  expect(ctx.next).toEqual(scanHiraganaText);

  expect(scanAnyText(ctx, "カタカナ")).toEqual(["", "カタカナ"]);
  expect(ctx.next).toEqual(scanKatakanaText);

  expect(scanAnyText(ctx, "ー")).toEqual(["", "ー"]);
  expect(ctx.next).toEqual(scanKanaText);

  expect(scanAnyText(ctx, "漢字")).toEqual(["", "漢字"]);
  expect(ctx.next).toEqual(scanHanText);

  expect(scanAnyText(ctx, "123")).toEqual(["123", ""]);
});

test("scanHanText", () => {
  const ctx = { next: scanHanText };
  expect(scanHanText(ctx, "漢字")).toEqual(["", "漢字"]);
  expect(ctx.next).toEqual(scanHanText);
  expect(scanHanText(ctx, "ひらがなカタカナ漢字")).toEqual([
    "ひらがなカタカナ",
    "漢字",
  ]);
  expect(ctx.next).toEqual(scanHanText);
  expect(scanHanText(ctx, "仝々〆〇ヶ")).toEqual(["", "仝々〆〇ヶ"]);
  expect(ctx.next).toEqual(scanHanText);
  expect(scanAnyText(ctx, "123")).toEqual(["123", ""]);
});

test("scanKanaText", () => {
  const ctx = { next: scanKanaText };
  expect(scanKanaText(ctx, "ー")).toEqual(["", "ー"]);
  expect(ctx.next).toEqual(scanKanaText);
  expect(scanKanaText(ctx, "ーーー")).toEqual(["", "ーーー"]);
  expect(ctx.next).toEqual(scanKanaText);
  expect(scanKanaText(ctx, "仮名ーーー")).toEqual(["仮名", "ーーー"]);
  expect(ctx.next).toEqual(scanKanaText);

  expect(scanKanaText(ctx, "ひらがな")).toEqual(["", "ひらがな"]);
  expect(ctx.next).toEqual(scanHiraganaText);
  expect(scanKanaText(ctx, "カタカナひらがな")).toEqual([
    "カタカナ",
    "ひらがな",
  ]);
  expect(ctx.next).toEqual(scanHiraganaText);
  expect(scanKanaText(ctx, "ひらがなー")).toEqual(["", "ひらがなー"]);
  expect(ctx.next).toEqual(scanHiraganaText);

  expect(scanKanaText(ctx, "カタカナ")).toEqual(["", "カタカナ"]);
  expect(ctx.next).toEqual(scanKatakanaText);
  expect(scanKanaText(ctx, "ひらがなカタカナ")).toEqual([
    "ひらがな",
    "カタカナ",
  ]);
  expect(ctx.next).toEqual(scanKatakanaText);
  expect(scanKanaText(ctx, "カタカナー")).toEqual(["", "カタカナー"]);
  expect(ctx.next).toEqual(scanKatakanaText);

  expect(scanAnyText(ctx, "123")).toEqual(["123", ""]);
});

test("scanHiraganaText", () => {
  const ctx = { next: scanHiraganaText };
  expect(scanHiraganaText(ctx, "ひらがな")).toEqual(["", "ひらがな"]);
  expect(ctx.next).toEqual(scanHiraganaText);
  expect(scanHiraganaText(ctx, "カタカナひらがな")).toEqual([
    "カタカナ",
    "ひらがな",
  ]);
  expect(ctx.next).toEqual(scanHiraganaText);
  expect(scanHiraganaText(ctx, "ひらがなー")).toEqual(["", "ひらがなー"]);
  expect(ctx.next).toEqual(scanHiraganaText);
  expect(scanAnyText(ctx, "123")).toEqual(["123", ""]);
});

test("scanKatakanaText", () => {
  const ctx = { next: scanKatakanaText };
  expect(scanKatakanaText(ctx, "カタカナ")).toEqual(["", "カタカナ"]);
  expect(ctx.next).toEqual(scanKatakanaText);
  expect(scanKatakanaText(ctx, "ひらがなカタカナ")).toEqual([
    "ひらがな",
    "カタカナ",
  ]);
  expect(ctx.next).toEqual(scanKatakanaText);
  expect(scanKatakanaText(ctx, "カタカナー")).toEqual(["", "カタカナー"]);
  expect(ctx.next).toEqual(scanKatakanaText);
  expect(scanAnyText(ctx, "123")).toEqual(["123", ""]);
});

test("scanLatinText", () => {
  const ctx = { next: scanLatinText };
  expect(scanLatinText(ctx, "foobar")).toEqual(["", "foobar"]);
  expect(ctx.next).toEqual(scanLatinText);
  expect(scanLatinText(ctx, "left right")).toEqual(["left ", "right"]);
  expect(ctx.next).toEqual(scanLatinText);
  expect(scanAnyText(ctx, "123")).toEqual(["123", ""]);
});

test("TextScanner", () => {
  const x = new TextScanner();
  expect(x.exec("漢")).toEqual(["", "漢"]);
  expect(x.exec("字")).toEqual(["", "字"]);
  expect(x.exec("ひらがな")).toEqual(["ひらがな", ""]);
});
