// SPDX-License-Identifier: MIT
declare module "micromark-util-types" {
  interface TokenTypeMap {
    pandocCitation: "pandocCitation";
    pandocCitationOpen: "pandocCitationOpen";
    pandocCitationClose: "pandocCitationClose";
    pandocCitationItem: "pandocCitationItem";
    pandocCitationPrefix: "pandocCitationPrefix";
    pandocCitationIdPrefix: "pandocCitationIdPrefix";
    pandocCitationId: "pandocCitationId";
    pandocCitationLocator: "pandocCitationLocator";
    pandocCitationSuffix: "pandocCitationSuffix";
    pandocCitationItemDelimiter: "pandocCitationItemDelimiter";
    pandocCitationComma: "pandocCitationComma";
    pandocCitationSpace: "pandocCitationSpace";
  }

  // interface TokenizeContext {}
}

export {};
