// SPDX-License-Identifier: MIT
import { join } from "node:path";
import { expect, test } from "vitest";
import { findShortestPath } from "./find.ts";

test("shortest path", () => {
  expect(
    findShortestPath(
      "1.md",
      import.meta.dirname,
      join(import.meta.dirname, "samples", "1"),
    ),
  ).eq(join("samples", "1", "1.md"));

  expect(
    findShortestPath(
      "1.md",
      import.meta.dirname,
      join(import.meta.dirname, "samples"),
    ),
  ).eq(join("samples", "1.md"));

  expect(
    findShortestPath(
      "1.md",
      join(import.meta.dirname, "samples"),
      join(import.meta.dirname, "samples", "1"),
    ),
  ).eq(join("1", "1.md"));

  expect(
    findShortestPath(
      "1.md",
      join(import.meta.dirname, "samples", "1"),
      join(import.meta.dirname, "samples", "1"),
    ),
  ).eq(join("1.md"));
});
