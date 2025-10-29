// SPDX-License-Identifier: MIT
import { extname, join, parse, sep } from "node:path";

export class PathResolver {
  private readonly glob: (
    name: string,
    sourceDir: string,
  ) => string | undefined;
  private readonly slugify: (path: string) => string;
  private readonly baseUrl: string;

  constructor(
    glob: (name: string, sourceDir: string) => string | undefined,
    slugify: (path: string) => string,
    baseUrl: string,
  ) {
    this.glob = glob;
    this.slugify = slugify;
    this.baseUrl = baseUrl;
  }

  resolve(input: string, sourceDir: string): string {
    const [path, ...headings] = input.split("#");

    let output = "";
    if (path !== undefined) {
      const filePath = this.glob(
        extname(path) === "" ? `${path}.md` : path,
        sourceDir,
      );
      if (filePath !== undefined) {
        const parsedFilePath = parse(filePath);
        const slug = join(parsedFilePath.dir, parsedFilePath.name)
          .split(sep)
          .map((s) => this.slugify(s))
          .join("/");
        output += `${this.baseUrl}/${slug}`;
      }
    }
    const heading = headings.at(-1);
    if (heading !== undefined) {
      output += `#${this.slugify(heading)}`;
    }
    return output;
  }
}
