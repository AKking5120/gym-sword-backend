/**
 * Lightweight SEO tag manager - no react-helmet dependency.
 * Mutates document <title>, meta description, OG and Twitter tags.
 */
import { useEffect } from "react";

const DEFAULTS = {
  title: "GymSword — Forge Your Strength | Luxury Athleisure",
  description:
    "GymSword crafts world-class luxury athleisure for athletes who demand more. Engineered in Italian technical knits. Free shipping over $100.",
  image: "https://images.pexels.com/photos/17924381/pexels-photo-17924381.jpeg",
  type: "website",
};

function setTag(selector, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    for (const [k, v] of Object.entries(attrs.create || {})) el.setAttribute(k, v);
    document.head.appendChild(el);
  }
  for (const [k, v] of Object.entries(attrs.update || {})) el.setAttribute(k, v);
}

export default function SEO({ title, description, image, type = "website", url }) {
  useEffect(() => {
    const finalTitle = title ? `${title} — GymSword` : DEFAULTS.title;
    const finalDesc = description || DEFAULTS.description;
    const finalImage = image || DEFAULTS.image;
    const finalUrl = url || (typeof window !== "undefined" ? window.location.href : "");

    document.title = finalTitle;

    setTag('meta[name="description"]', {
      create: { name: "description" },
      update: { content: finalDesc },
    });
    setTag('meta[property="og:title"]', { create: { property: "og:title" }, update: { content: finalTitle } });
    setTag('meta[property="og:description"]', { create: { property: "og:description" }, update: { content: finalDesc } });
    setTag('meta[property="og:image"]', { create: { property: "og:image" }, update: { content: finalImage } });
    setTag('meta[property="og:type"]', { create: { property: "og:type" }, update: { content: type } });
    setTag('meta[property="og:url"]', { create: { property: "og:url" }, update: { content: finalUrl } });
    setTag('meta[name="twitter:card"]', { create: { name: "twitter:card" }, update: { content: "summary_large_image" } });
    setTag('meta[name="twitter:title"]', { create: { name: "twitter:title" }, update: { content: finalTitle } });
    setTag('meta[name="twitter:description"]', { create: { name: "twitter:description" }, update: { content: finalDesc } });
    setTag('meta[name="twitter:image"]', { create: { name: "twitter:image" }, update: { content: finalImage } });
  }, [title, description, image, type, url]);

  return null;
}
