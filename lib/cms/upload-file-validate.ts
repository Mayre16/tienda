/** Validación cliente de subidas CMS (espejo del servidor). */

/** Solo WebP — mensaje y accept para inputs de foto. */
export const CMS_IMAGE_ACCEPT = "image/webp,.webp";
export const CMS_PDF_ACCEPT = "application/pdf,.pdf";
export const CMS_VIDEO_ACCEPT = "video/mp4,video/webm,.mp4,.webm";

/** Fotos CMS: WebP y máximo 100 KB. */
export const CMS_UPLOAD_MAX_IMAGE_BYTES = 100 * 1024;
export const CMS_UPLOAD_MAX_PDF_BYTES = 15 * 1024 * 1024;
export const CMS_UPLOAD_MAX_VIDEO_BYTES = 40 * 1024 * 1024;

export const CMS_IMAGE_UPLOAD_HINT =
  "Solo fotos WebP y menos de 100 KB. Comprime la imagen antes de subirla.";

export type CmsUploadKind = "image" | "document" | "video";

type Detected = {
  kind: CmsUploadKind;
  ext: string;
  mime: string;
};

function detectMagic(bytes: Uint8Array): Detected | null {
  if (bytes.length < 4) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { kind: "image", ext: "jpg", mime: "image/jpeg" };
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return { kind: "image", ext: "png", mime: "image/png" };
  }
  if (
    bytes.length >= 12 &&
    String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) === "RIFF" &&
    String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]) === "WEBP"
  ) {
    return { kind: "image", ext: "webp", mime: "image/webp" };
  }
  if (String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) === "%PDF") {
    return { kind: "document", ext: "pdf", mime: "application/pdf" };
  }
  if (
    bytes.length >= 8 &&
    String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]) === "ftyp"
  ) {
    return { kind: "video", ext: "mp4", mime: "video/mp4" };
  }
  if (
    bytes[0] === 0x1a &&
    bytes[1] === 0x45 &&
    bytes[2] === 0xdf &&
    bytes[3] === 0xa3
  ) {
    return { kind: "video", ext: "webm", mime: "video/webm" };
  }
  return null;
}

async function detectFile(file: File): Promise<Detected | null> {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  return detectMagic(bytes);
}

/** Lanza Error si el archivo no es WebP ≤ 100 KB. */
export async function assertCmsImageFile(file: File): Promise<void> {
  if (file.size <= 0 || file.size > CMS_UPLOAD_MAX_IMAGE_BYTES) {
    throw new Error(
      "La foto debe ser WebP y pesar menos de 100 KB. Comprime la imagen e inténtalo de nuevo.",
    );
  }
  const detected = await detectFile(file);
  if (!detected || detected.kind !== "image" || detected.ext !== "webp") {
    throw new Error(
      "Solo se permiten fotos WebP de menos de 100 KB. No se aceptan JPG, PNG, PDF ni otros formatos.",
    );
  }
}

/** Lanza Error si el archivo no es un PDF real. */
export async function assertCmsPdfFile(file: File): Promise<void> {
  if (file.size <= 0 || file.size > CMS_UPLOAD_MAX_PDF_BYTES) {
    throw new Error("El PDF supera el máximo de 15 MB.");
  }
  const name = file.name.toLowerCase();
  if (name && !name.endsWith(".pdf")) {
    throw new Error("Solo se permiten archivos PDF (.pdf).");
  }
  const detected = await detectFile(file);
  if (!detected || detected.kind !== "document") {
    throw new Error("Solo se permiten documentos PDF válidos.");
  }
}

/** Lanza Error si el archivo no es MP4/WebM real. */
export async function assertCmsVideoFile(file: File): Promise<void> {
  if (file.size <= 0 || file.size > CMS_UPLOAD_MAX_VIDEO_BYTES) {
    throw new Error("El video supera el máximo de 40 MB.");
  }
  const detected = await detectFile(file);
  if (!detected || detected.kind !== "video") {
    throw new Error("Solo se permiten videos MP4 o WebM válidos.");
  }
}

export async function assertCmsUploadFile(
  file: File,
  kind: CmsUploadKind,
): Promise<void> {
  if (kind === "document") return assertCmsPdfFile(file);
  if (kind === "video") return assertCmsVideoFile(file);
  return assertCmsImageFile(file);
}
