/** Convierte URL de YouTube a embed. */
export function youtubeEmbedUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/,
  );
  if (match) return `https://www.youtube-nocookie.com/embed/${match[1]}`;

  return trimmed.includes("youtube.com/embed/") ||
    trimmed.includes("youtube-nocookie.com/embed/")
    ? trimmed
    : null;
}

/** Convierte URL de Vimeo a embed. */
export function vimeoEmbedUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const match = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (match) return `https://player.vimeo.com/video/${match[1]}`;

  return trimmed.includes("player.vimeo.com/video/") ? trimmed : null;
}

export function resolveVideoEmbedUrl(url: string): string | null {
  return youtubeEmbedUrl(url) || vimeoEmbedUrl(url);
}
