const CLOUDINARY_UPLOAD_PATH = /\/upload\//;

export function getCloudinaryImageUrl(url, width) {
    if (!url || !width || !url.includes("res.cloudinary.com")) return url;

    return url.replace(CLOUDINARY_UPLOAD_PATH, `/upload/f_auto,q_auto,w_${width}/`);
}

export function getCloudinarySrcSet(url, widths) {
    if (!url || !url.includes("res.cloudinary.com")) return undefined;

    return widths
        .map((width) => `${getCloudinaryImageUrl(url, width)} ${width}w`)
        .join(", ");
}
