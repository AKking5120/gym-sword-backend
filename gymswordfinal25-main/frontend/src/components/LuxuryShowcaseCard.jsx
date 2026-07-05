import { Link } from "react-router-dom";
import { resolveImage, PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/api";
import { useState } from "react";

export default function LuxuryShowcaseCard({ product }) {
  const [imgSrc, setImgSrc] = useState(
    resolveImage(product?.images?.[0]?.url || product?.image_url) || PRODUCT_IMAGE_PLACEHOLDER
  );

  const slug = product?.slug || product?.id;

  return (
    <Link
      to={`/product/${slug}`}
      className="group block flex-shrink-0 w-[calc(50%-12px)] md:w-[calc(25%-24px)] snap-start"
    >
      <div className="aspect-[3/4] overflow-hidden bg-[#F5F5F7] mb-4">
        <img
          src={imgSrc}
          alt={product?.name || ""}
          loading="lazy"
          onError={() => setImgSrc(PRODUCT_IMAGE_PLACEHOLDER)}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>
      <h3 className="text-xs sm:text-sm font-medium uppercase tracking-[0.15em] text-black/80 group-hover:text-black transition-colors duration-300 line-clamp-1">
        {product?.name}
      </h3>
    </Link>
  );
}

