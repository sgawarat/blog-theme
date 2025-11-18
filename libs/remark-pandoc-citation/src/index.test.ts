import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { VFile } from "vfile";
import { expect, test } from "vitest";
import { remarkPandocCitation } from "./index.ts";

const processor = unified()
  .use(remarkParse)
  .use(remarkPandocCitation, {
    references: [
      {
        type: "article",
        id: "id",
        author: [
          {
            given: "Given",
            family: "Family",
          },
        ],
        issued: {
          "date-parts": [[2025, 12, 31]],
        },
      },
    ],
  })
  .use(remarkRehype)
  .use(rehypeStringify)
  .freeze();

function parsed(value: string) {
  return processor.processSync(
    new VFile({ value, astro: { frontmatter: undefined } }),
  ).value;
}

test("citation", () => {
  expect(parsed("[prefix @id suffix]")).eq(
    '<p><span class="citation">[<span class="citation-item">prefix Family 2025, suffix<span hidden class="bibliography">Family, G. 2025.</span></span>]</span></p>',
  );
});
