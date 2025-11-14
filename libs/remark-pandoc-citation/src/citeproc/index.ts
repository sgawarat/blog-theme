// SPDX-License-Identifier: MIT
import fs from "node:fs";
import type { ElementContent } from "hast";
import type { CslCitation, CslDataItem } from "./schema.ts";
import type { CitationStyle } from "./style/index.ts";
import { parseCslData } from "./validation.ts";

export class Citeproc {
  private readonly _map = new Map<string, CslDataItem>();
  private readonly _style: CitationStyle;

  constructor(style: CitationStyle) {
    this._style = style;
  }

  addItems(items: CslDataItem[]) {
    items.reduce((acc, item) => {
      return acc.set(`${item.id}`, item);
    }, this._map);
  }

  addItemsFromJson(data: unknown) {
    this.addItems(parseCslData(data));
  }

  addItemsFromFile(path: string) {
    const items = JSON.parse(fs.readFileSync(path, "utf-8"));
    this.addItemsFromJson(items);
  }

  addItemsFromFrontmatter(frontmatter: Record<string, unknown>) {
    const bibliography = frontmatter["bibliography"];
    if (typeof bibliography === "string") {
      this.addItemsFromFile(bibliography);
    }

    const references = frontmatter["references"];
    if (references !== undefined) {
      this.addItemsFromJson(references);
    }
  }

  getCitation(c: CslCitation): ElementContent[] {
    return this._style.getCitation(
      c.citationItems?.map((item) => ({
        ...item,
        itemData: item.itemData ?? this._map.get(`${item.id}`),
      })) ?? [],
    );
  }

  getCitationInText(c: CslCitation): ElementContent[] {
    return this._style.getCitationInText(
      c.citationItems?.map((item) => ({
        ...item,
        itemData: item.itemData ?? this._map.get(`${item.id}`),
      })) ?? [],
    );
  }
}
