// SPDX-License-Identifier: MIT
const ANY_REGEXP =
  /^([\s\S]*?)((?<han>[\p{sc=Han}仝々〆〇ヶ]*)|(?<kana>[ー]*)|(?<hiragana>[\p{sc=Hiragana}ー]*)|(?<katakana>[\p{sc=Katakana}ー]*)|(?<latin>[\p{sc=Latin}']*))$/u;
const HAN_REGEXP = /^([\s\S]*?)([\p{sc=Han}仝々〆〇ヶ]*)$/u;
const KANA_REGEXP =
  /^([\s\S]*?)((?<kana>[ー]*)|(?<hiragana>[\p{sc=Hiragana}ー]*)|(?<katakana>[\p{sc=Katakana}ー]*))$/u;
const HIRAGANA_REGEXP = /^([\s\S]*?)([\p{sc=Hiragana}ー]*)$/u;
const KATAKANA_REGEXP = /^([\s\S]*?)([\p{sc=Katakana}ー]*)$/u;
const LATIN_REGEXP = /^([\s\S]*?)([\p{sc=Latin}']*)$/u;

export interface TextScannerContext {
  next: (ctx: TextScannerContext, input: string) => [string, string];
}

/**
 * 文末にある同一文字種の列を見つける。
 */
export function scanAnyText(
  ctx: TextScannerContext,
  input: string,
): [string, string] {
  const m = ANY_REGEXP.exec(input);
  if (m === null || m.groups === undefined) return ["", ""];
  if (m.groups["han"] !== undefined) {
    ctx.next = scanHanText;
  } else if (m.groups["kana"] !== undefined) {
    ctx.next = scanKanaText;
  } else if (m.groups["hiragana"] !== undefined) {
    ctx.next = scanHiraganaText;
  } else if (m.groups["katakana"] !== undefined) {
    ctx.next = scanKatakanaText;
  } else if (m.groups["latin"] !== undefined) {
    ctx.next = scanLatinText;
  }
  return [m[1] ?? "", m[2] ?? ""];
}

/**
 * 文末にある漢字の列を見つける。
 */
export function scanHanText(
  _ctx: TextScannerContext,
  input: string,
): [string, string] {
  const m = HAN_REGEXP.exec(input);
  if (m === null) return ["", ""];
  return [m[1] ?? "", m[2] ?? ""];
}

/**
 * 文末にある仮名文字の列を見つける。
 */
export function scanKanaText(
  ctx: TextScannerContext,
  input: string,
): [string, string] {
  const m = KANA_REGEXP.exec(input);
  if (m === null || m.groups === undefined) return ["", ""];
  if (m.groups["hiragana"] !== undefined) {
    ctx.next = scanHiraganaText;
  } else if (m.groups["katakana"] !== undefined) {
    ctx.next = scanKatakanaText;
  }
  return [m[1] ?? "", m[2] ?? ""];
}

/**
 * 文末にあるひらがなの列を見つける。
 */
export function scanHiraganaText(
  _ctx: TextScannerContext,
  input: string,
): [string, string] {
  const m = HIRAGANA_REGEXP.exec(input);
  if (m === null) return ["", ""];
  return [m[1] ?? "", m[2] ?? ""];
}

/**
 * 文末にあるカタカナの列を見つける。
 */
export function scanKatakanaText(
  _ctx: TextScannerContext,
  input: string,
): [string, string] {
  const m = KATAKANA_REGEXP.exec(input);
  if (m === null) return ["", ""];
  return [m[1] ?? "", m[2] ?? ""];
}

/**
 * 文末にあるラテン文字の列を見つける。
 */
export function scanLatinText(
  _ctx: TextScannerContext,
  input: string,
): [string, string] {
  const m = LATIN_REGEXP.exec(input);
  if (m === null) return ["", ""];
  return [m[1] ?? "", m[2] ?? ""];
}

/**
 * 同一文字種の列を複数の文字列から見つけるため型。
 */
export class TextScanner {
  private readonly _ctx: TextScannerContext;

  constructor(start = scanAnyText) {
    this._ctx = { next: start };
  }

  exec(input: string): [string, string] {
    return this._ctx.next(this._ctx, input);
  }
}
