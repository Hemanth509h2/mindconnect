"use client";

import { useState } from "react";
import { uploadImage } from "@/app/actions/uploads";
import { IMAGE_TYPES, isUpload, shrinkImage } from "@/lib/image";
import type { GalleryImage } from "@/lib/types";

/** Upload files one by one; returns the URLs of the ones that made it. */
function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const upload = async (files: File[]) => {
    setUploading(true);
    setError("");
    const urls: string[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", await shrinkImage(file));
      const result = await uploadImage(formData);
      if ("error" in result) setError(result.error);
      else urls.push(result.url);
    }
    setUploading(false);
    return urls;
  };

  return { upload, uploading, error };
}

function FilePicker({ label, multiple, uploading, onFiles }: { label: string; multiple?: boolean; uploading: boolean; onFiles: (files: File[]) => void }) {
  return (
    <label className={`btn-secondary btn-sm cursor-pointer has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-teal/20 ${uploading ? "pointer-events-none opacity-60" : ""}`}>
      <input
        type="file"
        accept={IMAGE_TYPES}
        multiple={multiple}
        disabled={uploading}
        className="sr-only"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = ""; // so picking the same file again still fires
          if (files.length) onFiles(files);
        }}
      />
      {uploading ? "Uploading…" : label}
    </label>
  );
}

/**
 * One image: upload a file or paste a link. `wide` for banners, `round` for
 * speaker photos.
 */
export function ImageField({
  value,
  onChange,
  shape = "wide",
  linkLabel = "Image link",
}: {
  value: string;
  onChange: (url: string) => void;
  shape?: "wide" | "round";
  linkLabel?: string;
}) {
  const { upload, uploading, error } = useImageUpload();
  const onFiles = async (files: File[]) => {
    const [url] = await upload(files);
    if (url) onChange(url);
  };

  const preview =
    shape === "wide" ? (
      value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="h-40 w-full rounded-xl object-cover" />
      ) : (
        <div className="grid h-40 w-full place-items-center rounded-xl border-2 border-dashed border-line text-sm text-muted">No image yet</div>
      )
    ) : value ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={value} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover" />
    ) : (
      <div className="h-14 w-14 shrink-0 rounded-full border-2 border-dashed border-line" />
    );

  return (
    <div className="space-y-3">
      <div className={shape === "wide" ? "space-y-3" : "flex items-center gap-4"}>
        {preview}
        <div className="flex flex-wrap items-center gap-2">
          <FilePicker label={value ? "Replace image" : "Upload image"} uploading={uploading} onFiles={onFiles} />
          {value && (
            <button type="button" onClick={() => onChange("")} className="btn-ghost btn-sm text-rose">
              Remove
            </button>
          )}
        </div>
      </div>
      <input
        type="url"
        value={isUpload(value) ? "" : value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
        placeholder="…or paste an image link (https://…)"
        aria-label={linkLabel}
      />
      {error && <p className="text-sm text-rose">{error}</p>}
    </div>
  );
}

/** A list of images with optional captions, uploaded several at a time. */
export function GalleryField({
  value,
  onChange,
}: {
  value: GalleryImage[];
  onChange: React.Dispatch<React.SetStateAction<GalleryImage[]>>;
}) {
  const { upload, uploading, error } = useImageUpload();
  const onFiles = async (files: File[]) => {
    const urls = await upload(files);
    onChange((list) => [...list, ...urls.map((url) => ({ url, caption: "" }))]);
  };

  return (
    <div className="space-y-4">
      {value.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {value.map((img, i) => (
            <div key={img.url + i} className="space-y-2 rounded-xl border border-line bg-ivory p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="aspect-[4/3] w-full rounded-lg object-cover" />
              <input
                value={img.caption ?? ""}
                onChange={(e) => onChange((list) => list.map((g, j) => (j === i ? { ...g, caption: e.target.value } : g)))}
                className="input"
                placeholder="Caption (optional)"
                aria-label={`Caption for image ${i + 1}`}
              />
              <button type="button" onClick={() => onChange((list) => list.filter((_, j) => j !== i))} className="text-sm text-rose hover:underline">
                Remove image
              </button>
            </div>
          ))}
        </div>
      )}
      <FilePicker label="+ Add photos" multiple uploading={uploading} onFiles={onFiles} />
      {error && <p className="text-sm text-rose">{error}</p>}
    </div>
  );
}
