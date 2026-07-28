import { useState } from "react";

import { cn } from "@/lib/utils";

import type { Photo as PhotoData } from "./images";

/**
 * Photos sit on top of a gradient that matches the theme, so a blocked or
 * offline CDN degrades to something deliberate instead of a broken-image icon.
 */
export function Photo({
  photo,
  className,
  imgClassName,
  priority,
}: {
  photo: PhotoData;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-[radial-gradient(ellipse_at_30%_20%,hsl(38_58%_56%/0.22),transparent_60%),linear-gradient(160deg,hsl(30_10%_12%),hsl(30_9%_6%))]",
        className,
      )}
    >
      {failed ? null : (
        <img
          src={photo.src}
          alt={photo.alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
          className={cn("size-full object-cover", imgClassName)}
        />
      )}
    </div>
  );
}
