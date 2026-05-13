import { useEffect, useState } from "react";
import { normalizePhotoUrl } from "@/lib/utils";

type PhotoImageProps = {
  src: string | null | undefined;
  alt: string;
  fallbackText: string;
  className: string;
  fallbackClassName?: string;
  errorText?: string;
  onLoad?: () => void;
};

export function PhotoImage({
  src,
  alt,
  fallbackText,
  className,
  fallbackClassName = "",
  errorText = "Image could not load. Check that the Google Drive file is shared with anyone who has the link.",
  onLoad,
}: PhotoImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const resolvedSrc = normalizePhotoUrl(src);

  if (!resolvedSrc || failed) {
    return (
      <div className={`${className} overflow-hidden`}>
        <div
          className={`flex h-full w-full items-center justify-center bg-black/20 text-center ${fallbackClassName}`}
        >
          <div className="px-3">
            <div className="font-display text-2xl sm:text-3xl">{fallbackText}</div>
            <div className="mt-2 text-[11px] sm:text-xs text-muted-foreground max-w-[14rem]">
              {errorText}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      onLoad={onLoad}
      onError={() => setFailed(true)}
    />
  );
}