"use client";

import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import { resolveVideoEmbedUrl } from "@/lib/cms/video-embed";

export function PageMediaVideo({
  src,
  poster,
  className,
  title = "Video",
}: {
  src: string;
  poster?: string;
  className?: string;
  title?: string;
}) {
  const resolved = resolveCmsMediaUrl(src) ?? src;
  const embed = resolveVideoEmbedUrl(resolved);

  if (embed) {
    return (
      <iframe
        src={embed}
        title={title}
        className={className}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }

  return (
    <video
      src={resolved}
      poster={poster}
      controls
      playsInline
      preload="metadata"
      className={className}
    />
  );
}
