import { useEffect } from "react";

function upsertMeta(attribute, value, content) {
    let element = document.head.querySelector(`meta[${attribute}="${value}"]`);

    if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, value);
        document.head.appendChild(element);
    }

    element.setAttribute("content", content);
}

export default function SEO({
    title,
    description,
    canonicalPath,
    noindex = false,
    structuredData,
}) {
    useEffect(() => {
        document.title = title;
        upsertMeta("name", "description", description);
        upsertMeta(
            "name",
            "robots",
            noindex ? "noindex, nofollow" : "index, follow"
        );

        const canonicalUrl = new URL(
            canonicalPath || window.location.pathname,
            window.location.origin
        ).href;
        let canonical = document.head.querySelector('link[rel="canonical"]');

        if (!canonical) {
            canonical = document.createElement("link");
            canonical.setAttribute("rel", "canonical");
            document.head.appendChild(canonical);
        }

        canonical.setAttribute("href", canonicalUrl);

        const existingSchema = document.head.querySelector(
            'script[data-seo-structured-data="true"]'
        );

        if (existingSchema) {
            existingSchema.remove();
        }

        if (structuredData) {
            const schema = document.createElement("script");
            schema.type = "application/ld+json";
            schema.dataset.seoStructuredData = "true";
            schema.textContent = JSON.stringify(structuredData);
            document.head.appendChild(schema);
        }
    }, [title, description, canonicalPath, noindex, structuredData]);

    return null;
}
