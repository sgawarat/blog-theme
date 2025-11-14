import type { ElementContent } from "hast";
import type { CslCitationItem } from "../schema.ts";

export abstract class CitationStyle {
  abstract getCitation(items: CslCitationItem[]): ElementContent[];
  abstract getCitationInText(items: CslCitationItem[]): ElementContent[];
}
