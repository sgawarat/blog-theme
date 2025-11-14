// SPDX-License-Identifier: MIT
/** biome-ignore-all lint/style/useNamingConvention: spec */

interface CslDataItemTypeMap {
  article: "article";
  "article-journal": "article-journal";
  "article-magazine": "article-magazine";
  "article-newspaper": "article-newspaper";
  bill: "bill";
  book: "book";
  broadcast: "broadcast";
  chapter: "chapter";
  classic: "classic";
  collection: "collection";
  dataset: "dataset";
  document: "document";
  entry: "entry";
  "entry-dictionary": "entry-dictionary";
  "entry-encyclopedia": "entry-encyclopedia";
  event: "event";
  figure: "figure";
  graphic: "graphic";
  hearing: "hearing";
  interview: "interview";
  legal_case: "legal_case";
  legislation: "legislation";
  manuscript: "manuscript";
  map: "map";
  motion_picture: "motion_picture";
  musical_score: "musical_score";
  pamphlet: "pamphlet";
  "paper-conference": "paper-conference";
  patent: "patent";
  performance: "performance";
  periodical: "periodical";
  personal_communication: "personal_communication";
  post: "post";
  "post-weblog": "post-weblog";
  regulation: "regulation";
  report: "report";
  review: "review";
  "review-book": "review-book";
  software: "software";
  song: "song";
  speech: "speech";
  standard: "standard";
  thesis: "thesis";
  treaty: "treaty";
  webpage: "webpage";
}

interface CslCitationLabelMap {
  act: "act";
  appendix: "appendix";
  "article-locator": "article-locator";
  book: "book";
  canon: "canon";
  chapter: "chapter";
  column: "column";
  elocation: "elocation";
  equation: "equation";
  figure: "figure";
  folio: "folio";
  issue: "issue";
  line: "line";
  note: "note";
  opus: "opus";
  page: "page";
  paragraph: "paragraph";
  part: "part";
  rule: "rule";
  scene: "scene";
  section: "section";
  "sub-verbo": "sub-verbo";
  supplement: "supplement";
  table: "table";
  timestamp: "timestamp";
  "title-locator": "title-locator";
  verse: "verse";
  version: "version";
  volume: "volume";
}

export interface CslDataName {
  family?: string | undefined;
  given?: string | undefined;
  "dropping-particle"?: string | undefined;
  "non-dropping-particle"?: string | undefined;
  suffix?: string | undefined;
  "comma-suffix"?: string | number | boolean | undefined;
  "static-ordering"?: string | number | boolean | undefined;
  literal?: string | undefined;
  "parse-names"?: string | number | boolean | undefined;
}

export interface CslDataDate {
  /* [0:YMD, 1?: hms][0, 1?, 2?] */
  "date-parts"?: (string | number)[][] | undefined;
  season?: string | number | undefined;
  circa?: string | number | boolean | undefined;
  literal?: string | undefined;
  raw?: string | undefined;
}

export type CslDataItemType = CslDataItemTypeMap[keyof CslDataItemTypeMap];

export interface CslDataItem {
  type: CslDataItemType;
  id: string | number;
  "citation-key"?: string | undefined;
  categories?: string[] | undefined;
  language?: string | undefined;
  journalAbbreviation?: string | undefined;
  shortTitle?: string | undefined;
  author?: CslDataName[] | undefined;
  chair?: CslDataName[] | undefined;
  "collection-editor"?: CslDataName[] | undefined;
  compiler?: CslDataName[] | undefined;
  composer?: CslDataName[] | undefined;
  "container-author"?: CslDataName[] | undefined;
  contributor?: CslDataName[] | undefined;
  curator?: CslDataName[] | undefined;
  director?: CslDataName[] | undefined;
  editor?: CslDataName[] | undefined;
  "editorial-director"?: CslDataName[] | undefined;
  "executive-producer"?: CslDataName[] | undefined;
  guest?: CslDataName[] | undefined;
  host?: CslDataName[] | undefined;
  interviewer?: CslDataName[] | undefined;
  illustrator?: CslDataName[] | undefined;
  narrator?: CslDataName[] | undefined;
  organizer?: CslDataName[] | undefined;
  "original-author"?: CslDataName[] | undefined;
  performer?: CslDataName[] | undefined;
  producer?: CslDataName[] | undefined;
  recipient?: CslDataName[] | undefined;
  "reviewed-author"?: CslDataName[] | undefined;
  "script-writer"?: CslDataName[] | undefined;
  "series-creator"?: CslDataName[] | undefined;
  translator?: CslDataName[] | undefined;
  accessed?: CslDataDate | undefined;
  "available-date"?: CslDataDate | undefined;
  "event-date"?: CslDataDate | undefined;
  issued?: CslDataDate | undefined;
  "original-date"?: CslDataDate | undefined;
  submitted?: CslDataDate | undefined;
  abstract?: string | undefined;
  annote?: string | undefined;
  archive?: string | undefined;
  archive_collection?: string | undefined;
  archive_location?: string | undefined;
  "archive-place"?: string | undefined;
  authority?: string | undefined;
  "call-number"?: string | undefined;
  "chapter-number"?: string | number | undefined;
  "citation-number"?: string | number | undefined;
  "citation-label"?: string | undefined;
  "collection-number"?: string | number | undefined;
  "collection-title"?: string | undefined;
  "container-title"?: string | undefined;
  "container-title-short"?: string | undefined;
  dimensions?: string | undefined;
  division?: string | undefined;
  DOI?: string | undefined;
  edition?: string | number | undefined;
  event?: string | undefined;
  "event-title"?: string | undefined;
  "event-place"?: string | undefined;
  "first-reference-note-number"?: string | number | undefined;
  genre?: string | undefined;
  ISBN?: string | undefined;
  ISSN?: string | undefined;
  issue?: string | number | undefined;
  jurisdiction?: string | undefined;
  keyword?: string | undefined;
  locator?: string | number | undefined;
  medium?: string | undefined;
  note?: string | undefined;
  number?: string | number | undefined;
  "number-of-pages"?: string | number | undefined;
  "number-of-volumes"?: string | number | undefined;
  "original-publisher"?: string | undefined;
  "original-publisher-place"?: string | undefined;
  "original-title"?: string | undefined;
  page?: string | number | undefined;
  "page-first"?: string | number | undefined;
  part?: string | number | undefined;
  "part-title"?: string | undefined;
  PMCID?: string | undefined;
  PMID?: string | undefined;
  printing?: string | number | undefined;
  publisher?: string | undefined;
  "publisher-place"?: string | undefined;
  references?: string | undefined;
  "reviewed-genre"?: string | undefined;
  "reviewed-title"?: string | undefined;
  scale?: string | undefined;
  section?: string | undefined;
  source?: string | undefined;
  status?: string | undefined;
  supplement?: string | number | undefined;
  title?: string | undefined;
  "title-short"?: string | undefined;
  URL?: string | undefined;
  version?: string | undefined;
  volume?: string | number | undefined;
  "volume-title"?: string | undefined;
  "volume-title-short"?: string | undefined;
  "year-suffix"?: string | undefined;
  custom?: unknown;
}

export type CslData = CslDataItem[];

export type CslCitationLabel = CslCitationLabelMap[keyof CslCitationLabelMap];

export interface CslCitationItem {
  id: string | number;
  itemData?: CslDataItem | undefined;
  prefix?: string | undefined;
  suffix?: string | undefined;
  locator?: string | undefined;
  label?: CslCitationLabel | undefined;
  "suppress-author"?: string | number | boolean | undefined;
  "author-only"?: string | number | boolean | undefined;
  uris?: string[] | undefined;
}

export interface CslCitationProperties {
  noteIndex: number | undefined;
}

export interface CslCitation {
  schema: "https://resource.citationstyles.org/schema/latest/input/json/csl-citation.json";
  citationID: string | number;
  citationItems?: CslCitationItem[] | undefined;
  properties?: CslCitationProperties | undefined;
}
