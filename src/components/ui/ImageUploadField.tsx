import { useEffect, useId, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { filesApi, type UploadBucket } from "@/shared/api/files.api";
import { mediaUrl } from "@/shared/utils/media";
import { errorMessage } from "@/shared/utils/errors";
import { cn } from "@/lib/utils";

export interface ImageUploadFieldProps {
  bucket: Extract<UploadBucket, "products" | "avatars">;
  value: string | null;
  onChange: (url: string | null, objectKey: string | null) => void;
  label?: string;
  hint?: string;
  shape?: "square" | "circle";
  disabled?: boolean;
  className?: string;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const BUCKET_MAX_SIZE_MB: Record<ImageUploadFieldProps["bucket"], number> = {
  products: 5,
  avatars: 2,
};

export function ImageUploadField({
  bucket,
  value,
  onChange,
  label = "Image",
  hint,
  shape = "square",
  disabled = false,
  className,
}: ImageUploadFieldProps) {
  const maxSizeMb = BUCKET_MAX_SIZE_MB[bucket];
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const objectKeyRef = useRef<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const preview = localPreview ?? mediaUrl(value);

  useEffect(() => {
    if (!localPreview) return;
    return () => URL.revokeObjectURL(localPreview);
  }, [localPreview]);

  const handleFile = async (file: File) => {
    setError(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Format accepté : JPG, PNG ou WebP.");
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`Le fichier dépasse ${maxSizeMb} Mo.`);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setBusy(true);
    try {
      const uploaded = await filesApi.upload(bucket, file);
      objectKeyRef.current = uploaded.objectKey;
      onChange(uploaded.url, uploaded.objectKey);
    } catch (err) {
      setLocalPreview(null);
      setError(errorMessage(err, "Échec de l’envoi du fichier."));
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    const key = objectKeyRef.current;
    objectKeyRef.current = null;
    setLocalPreview(null);
    setError(null);
    onChange(null, null);
    if (key) {
      try {
        await filesApi.remove(bucket, key);
      } catch {
        setError("L’image a été retirée de ce formulaire mais n’a pas pu être supprimée du stockage.");
      }
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <span className="block text-label-md font-semibold text-on-surface">{label}</span>
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden border border-outline-variant bg-surface-container-low",
            shape === "circle" ? "rounded-full" : "rounded-md",
          )}
        >
          {preview ? (
            <img src={preview} alt="Aperçu" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus aria-hidden="true" className="h-7 w-7 text-on-surface-variant" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            className="sr-only"
            disabled={disabled || busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void handleFile(file);
            }}
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || busy}
              className="inline-flex items-center gap-2 rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-label-md font-semibold text-on-surface transition-colors hover:border-secondary hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? (
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
              ) : (
                <Upload aria-hidden="true" className="h-4 w-4" />
              )}
              {busy ? "Envoi…" : preview ? "Remplacer" : "Choisir une image"}
            </button>
            {preview && (
              <button
                type="button"
                onClick={() => void handleRemove()}
                disabled={disabled || busy}
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-label-md font-semibold text-error transition-colors hover:bg-error/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" />
                Retirer
              </button>
            )}
          </div>
          <p className="text-body-sm text-on-surface-variant">
            {error ?? hint ?? `JPG, PNG ou WebP — ${maxSizeMb} Mo maximum.`}
          </p>
        </div>
      </div>
    </div>
  );
}
