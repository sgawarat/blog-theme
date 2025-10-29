// SPDX-License-Identifier: MIT
import fs from "node:fs";
import { relative, resolve, sep } from "node:path";
import process from "node:process";

/**
 * 基準となるディレクトリから最も近いファイルを探す。
 *
 * @param name ファイル名
 * @param rootDir 最上位ディレクトリのパス
 * @param cwd 基準となるディレクトリのパス
 * @returns 見つかったファイルのパス
 */
export function findShortestPath(
  name: string,
  rootDir: string,
  cwd: string = process.cwd(),
) {
  let minDepth = Number.POSITIVE_INFINITY;
  let shortestPath: string | undefined;
  for (const path of fs.globSync(resolve(rootDir, "**", name), { cwd })) {
    const depth = relative(cwd, path).split(sep).length;
    if (depth < minDepth) {
      minDepth = depth;
      shortestPath = path;
      if (minDepth === 0) break;
    }
  }
  if (shortestPath === undefined) return undefined;
  return relative(rootDir, shortestPath);
}
