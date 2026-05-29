import type { Metadata } from "next";

export const SITE_URL = "https://bnimiracles.in";
export const SITE_NAME = "BNI Miracles";
export const SITE_TAGLINE = "Hybrid Business Networking Chapter | Chennai";
export const DEFAULT_DESCRIPTION =
  "BNI Miracles is a hybrid BNI chapter meeting every Thursday in Chennai. Connect with 36+ business categories, pass referrals, and grow your business.";

/** Default social share image (1200×630) */
export const DEFAULT_OG_IMAGE = "/og-image.jpg";
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;

const DEFAULT_KEYWORDS = [
  "BNI Miracles",
  "BNI Chennai",
  "business networking Chennai",
  "BNI chapter Tamil Nadu",
  "referral networking",
  "hybrid BNI meeting",
];

export type PageSeoInput = {
  /** Page title (appended with site name via root title template unless `absoluteTitle` is true) */
  title: string;
  description: string;
  /** Path including leading slash, e.g. `/about` */
  path: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
  ogType?: "website" | "article" | "profile";
  /** Use full title as-is without the `%s | BNI Miracles` template */
  absoluteTitle?: boolean;
};

function resolveImageUrl(image: string): string {
  return image.startsWith("http") ? image : `${SITE_URL}${image}`;
}

export function createPageMetadata(input: PageSeoInput): Metadata {
  const canonical = `${SITE_URL}${input.path}`;
  const image = resolveImageUrl(input.ogImage ?? DEFAULT_OG_IMAGE);
  const keywords = [...DEFAULT_KEYWORDS, ...(input.keywords ?? [])];

  const title = input.absoluteTitle
    ? { absolute: input.title }
    : input.title;

  return {
    title,
    description: input.description,
    keywords,
    alternates: { canonical },
    robots: input.noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "en_IN",
      type: input.ogType ?? "website",
      images: [
        {
          url: image,
          width: DEFAULT_OG_IMAGE_WIDTH,
          height: DEFAULT_OG_IMAGE_HEIGHT,
          alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
    },
  };
}

export function createInitiativeMetadata(init: {
  englishName: string;
  tamilName: string;
  description: string;
  slug: string;
}): Metadata {
  return createPageMetadata({
    title: `${init.englishName} — ${init.tamilName}`,
    description: init.description,
    path: `/initiatives/${init.slug}`,
    keywords: [
      init.englishName,
      init.tamilName,
      "BNI Miracles initiatives",
      "BNI Chennai programs",
    ],
  });
}

/** Root layout defaults — pages inherit and override via `createPageMetadata` */
export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    title: SITE_NAME,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Business Networking Chennai`,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: DEFAULT_OG_IMAGE_WIDTH,
        height: DEFAULT_OG_IMAGE_HEIGHT,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Business Networking Chennai`,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
    description: DEFAULT_DESCRIPTION,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Chennai",
      addressRegion: "Tamil Nadu",
      addressCountry: "IN",
    },
    sameAs: ["https://wa.me/919841767641"],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    inLanguage: "en-IN",
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function personJsonLd(member: {
  name: string;
  business_name: string;
  category: string;
  slug: string;
  profile_picture_url: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  business_location: string | null;
  services: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.name,
    jobTitle: member.category,
    worksFor: {
      "@type": "Organization",
      name: member.business_name,
    },
    url: `${SITE_URL}/members/${member.slug}`,
    image: member.profile_picture_url ?? undefined,
    telephone: member.phone ?? undefined,
    email: member.email ?? undefined,
    description: member.services ?? undefined,
    address: member.business_location
      ? { "@type": "PostalAddress", addressLocality: member.business_location }
      : undefined,
    sameAs: member.website ? [member.website] : undefined,
    memberOf: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function initiativesListJsonLd(
  items: { englishName: string; slug: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE_NAME} Chapter Initiatives`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.englishName,
      url: `${SITE_URL}/initiatives/${item.slug}`,
    })),
  };
}

export function powerTeamsListJsonLd(items: { name: string; slug: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE_NAME} Power Teams`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: `${SITE_URL}/power-team/${item.slug}`,
    })),
  };
}

export function powerTeamMembersListJsonLd(input: {
  teamName: string;
  teamSlug: string;
  members: { name: string; slug: string; category?: string | null }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${input.teamName} Power Team Members`,
    url: `${SITE_URL}/power-team/${input.teamSlug}`,
    itemListElement: input.members.map((m, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: m.category ? `${m.name} (${m.category})` : m.name,
      url: `${SITE_URL}/members/${m.slug}`,
    })),
  };
}

export function eventJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "BNI Miracles Weekly Chapter Meeting",
    description:
      "Hybrid BNI Miracles chapter meeting every Thursday in Chennai. Visitors welcome — attend in person or online.",
    eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
    eventSchedule: {
      "@type": "Schedule",
      repeatFrequency: "P1W",
      byDay: "https://schema.org/Thursday",
      startTime: "07:30",
      endTime: "09:40",
    },
    location: {
      "@type": "Place",
      name: "BNI Miracles — Chennai",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Chennai",
        addressRegion: "Tamil Nadu",
        addressCountry: "IN",
      },
    },
    organizer: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
      description: "Free for first-time visitors (online); nominal breakfast fee for in-person attendance.",
      url: `${SITE_URL}/attend-meeting`,
    },
  };
}
