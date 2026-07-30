import OriginalImage from "next-original/image";
import type { ImageProps } from "next/image";
import { assetUrl } from "@/lib/asset-url";

function resolveSrc(src: ImageProps["src"]): ImageProps["src"] {
  if (typeof src === "string") return assetUrl(src);
  return src;
}

export default function Image({ src, ...props }: ImageProps) {
  return <OriginalImage src={resolveSrc(src)} {...props} />;
}
