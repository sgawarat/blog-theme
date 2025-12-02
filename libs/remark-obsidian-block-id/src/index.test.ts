// SPDX-License-Identifier: MIT
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { expect, test } from "vitest";
import { remarkObsidianBlockId } from "./index.ts";

const processor = unified()
  .use(remarkParse)
  .use(remarkMath, { singleDollarTextMath: true })
  .use(remarkObsidianBlockId, {})
  .use(remarkRehype)
  .use(rehypeKatex, { output: "mathml" })
  .use(rehypeStringify)
  .freeze();

const processorIntrusive = unified()
  .use(remarkParse)
  .use(remarkMath, { singleDollarTextMath: true })
  .use(remarkObsidianBlockId, { intrusive: true })
  .use(remarkRehype)
  .use(rehypeKatex, { output: "mathml" })
  .use(rehypeStringify)
  .freeze();

function parsed(value: string) {
  return processor.processSync(value).value;
}

function parsedIntrusive(value: string) {
  return processorIntrusive.processSync(value).value;
}

test("paragraph", () => {
  expect(parsed("paragraph\n\n^id")).eq('<div id="id"><p>paragraph</p></div>');

  expect(parsed("paragraph ^id")).eq('<div id="id"><p>paragraph</p></div>');
});

test("heading", () => {
  expect(parsed("# heading\n\n^id")).eq('<div id="id"><h1>heading</h1></div>');

  expect(parsed("# heading ^id")).eq('<div id="id"><h1>heading</h1></div>');
});

test("math", () => {
  expect(parsed("$$x$$\n\n^id")).eq(
    '<div id="id"><p><span class="katex"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi></mrow><annotation encoding="application/x-tex">x</annotation></semantics></math></span></p></div>',
  );
});

test("list", () => {
  expect(parsed("- list\n\n^id")).eq(
    '<div id="id"><ul>\n<li>list</li>\n</ul></div>',
  );
});

test("quote", () => {
  expect(parsed("> quote\n\n^id")).eq(
    '<div id="id"><blockquote>\n<p>quote</p>\n</blockquote></div>',
  );

  expect(parsed("> quote ^id")).eq(
    '<blockquote>\n<div id="id"><p>quote</p></div>\n</blockquote>',
  );
});

test("paragraph (intrusive)", () => {
  expect(parsedIntrusive("paragraph\n\n^id")).eq('<p id="id">paragraph</p>');

  expect(parsedIntrusive("paragraph ^id")).eq('<p id="id">paragraph</p>');
});

test("heading (intrusive)", () => {
  expect(parsedIntrusive("# heading\n\n^id")).eq('<h1 id="id">heading</h1>');

  expect(parsedIntrusive("# heading ^id")).eq('<h1 id="id">heading</h1>');
});

test("list (intrusive)", () => {
  expect(parsedIntrusive("- list\n\n^id")).eq(
    '<ul id="id">\n<li>list</li>\n</ul>',
  );
});

test("quote (intrusive)", () => {
  expect(parsedIntrusive("> quote\n\n^id")).eq(
    '<blockquote id="id">\n<p>quote</p>\n</blockquote>',
  );

  expect(parsedIntrusive("> quote ^id")).eq(
    '<blockquote>\n<p id="id">quote</p>\n</blockquote>',
  );
});

test("multiple lines", () => {
  expect(parsed("# heading\n\n^h1\n\nparagraph ^p\n")).eq(
    '<div id="h1"><h1>heading</h1></div>\n<div id="p"><p>paragraph</p></div>',
  );
});

test("example", () => {
  expect(
    parsed("# h1\n\n^h1\n\n## h2\n\n^h2\n\nparagraph ^p\n\n$$x$$\n\n^math\n"),
  ).eq(
    '<div id="h1"><h1>h1</h1></div>\n<div id="h2"><h2>h2</h2></div>\n<div id="p"><p>paragraph</p></div>\n<div id="math"><p><span class="katex"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>x</mi></mrow><annotation encoding="application/x-tex">x</annotation></semantics></math></span></p></div>',
  );
});
