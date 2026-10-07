export type ContentLink = { label: string; href: string };
export type ContentSection = {
  id?: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  links?: ContentLink[];
};
export type RingContent = {
  /** Editorial dates are entered only after an actual publication/review. */
  publishedAt?: string;
  reviewedAt?: string;
  title: string;
  heading: string;
  description: string;
  sections: ContentSection[];
  faq: { question: string; answer: string }[];
  related: ContentLink[];
  sources?: { title: string; url: string }[];
};

export function sectionId(section: ContentSection, index: number) {
  return section.id ?? `seccion-${index + 1}`;
}
