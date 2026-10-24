// Browser-only helpers for image uploads.

export const IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";

/** Our own uploads are stored as "/images/<id>"; anything else is a pasted link. */
export function isUpload(url: string) {
  return url.startsWith("/images/");
}

/**
 * Scale a photo down to at most `maxSide` pixels and re-encode it, so phone
 * photos fit the 3 MB upload limit. GIFs are left alone to keep animation.
 */
export async function shrinkImage(file: File, maxSide = 1600): Promise<File> {
  if (file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const encode = (type: string) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
    // Browsers that can't write WebP silently hand back a PNG instead.
    let blob = await encode("image/webp");
    if (blob?.type !== "image/webp") blob = await encode("image/jpeg");
    if (!blob || (scale === 1 && blob.size >= file.size)) return file;
    return new File([blob], `image.${blob.type.split("/")[1]}`, { type: blob.type });
  } catch {
    return file; // Not decodable here; let the backend decide.
  }
}
