import { useEffect } from "react";

const BASE_URL = "https://karangholap.com";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
};

const upsertMetaByName = (name: string, content: string) => {
  let tag = document.head.querySelector(
    `meta[name="${name}"]`,
  ) as HTMLMetaElement | null;

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", content);
};

const upsertMetaByProperty = (property: string, content: string) => {
  let tag = document.head.querySelector(
    `meta[property="${property}"]`,
  ) as HTMLMetaElement | null;

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", content);
};

const upsertCanonical = (href: string) => {
  let canonical = document.head.querySelector(
    'link[rel="canonical"]',
  ) as HTMLLinkElement | null;

  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }

  canonical.setAttribute("href", href);
};

export const usePageMeta = ({
  title,
  description,
  path,
  image,
  noIndex = false,
}: PageMetaInput) => {
  useEffect(() => {
    const url = new URL(path, BASE_URL).toString();
    const imageUrl = image ?? DEFAULT_OG_IMAGE;
    const fullTitle = `${title} | Karan Gholap`;

    document.title = fullTitle;

    upsertMetaByName("title", fullTitle);
    upsertMetaByName("description", description);
    upsertMetaByName("twitter:title", fullTitle);
    upsertMetaByName("twitter:description", description);
    upsertMetaByName("twitter:url", url);
    upsertMetaByName("twitter:image", imageUrl);
    upsertMetaByName(
      "robots",
      noIndex ? "noindex, nofollow" : "index, follow",
    );

    upsertMetaByProperty("og:title", fullTitle);
    upsertMetaByProperty("og:description", description);
    upsertMetaByProperty("og:url", url);
    upsertMetaByProperty("og:image", imageUrl);

    upsertCanonical(url);
  }, [title, description, path, image, noIndex]);
};