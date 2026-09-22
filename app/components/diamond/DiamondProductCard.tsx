import React, {useState} from 'react';
import {Link} from 'react-router';
import type {DiamondProduct, PreciousMetal} from '~/types/diamond';
import {DiamondShapeIcon} from './DiamondShapeIcons';
import {Card} from '~/components/ui/card';
import {Badge} from '~/components/ui/badge';
import {buttonVariants} from '~/components/ui/button';

interface DiamondProductCardProps {
  product: DiamondProduct;
}

export function DiamondProductCard({product}: DiamondProductCardProps) {
  const [selectedMetal, setSelectedMetal] = useState<PreciousMetal>(
    product.setting.defaultMetal,
  );
  const [isHovered, setIsHovered] = useState(false);

  // Active image based on selected metal
  const activeMetalAsset = product.metalAssets[selectedMetal];
  const displayImage = isHovered
    ? activeMetalAsset?.sideImage || product.images.sideProfile
    : activeMetalAsset?.primaryImage || product.images.primary;

  const diamond = product.diamond;

  return (
    <Card
      className="diamond-product-card group relative bg-white border border-stone-200/80 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top badges with shadcn Badge */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <Badge className="bg-stone-900/90 text-amber-200 text-[10px] font-serif uppercase tracking-wider rounded backdrop-blur-sm border-0">
          {diamond.shape}
        </Badge>
        {product.isBestseller && (
          <Badge className="bg-amber-100/95 text-amber-900 text-[10px] font-sans font-semibold uppercase tracking-wider rounded border-0">
            Atelier Icon
          </Badge>
        )}
      </div>

      {/* Image container */}
      <Link
        to={`/products/${product.handle}?metal=${selectedMetal}`}
        className="block aspect-square overflow-hidden bg-stone-50 relative cursor-pointer"
      >
        <img
          src={displayImage}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        {/* Diamond Shape Watermark in bottom corner */}
        <div className="absolute bottom-2 right-2 text-stone-300/60 pointer-events-none">
          <DiamondShapeIcon shape={diamond.shape} size={20} />
        </div>
      </Link>

      {/* Details body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metal Swatch Selector */}
          <div className="flex items-center space-x-1.5 mb-2.5">
            {product.setting.metalsAvailable.map((m) => {
              const asset = product.metalAssets[m];
              const isSelected = selectedMetal === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedMetal(m);
                  }}
                  title={asset?.name || m}
                  className={`w-3.5 h-3.5 rounded-full border transition-all cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-stone-900 ring-offset-1 scale-110'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{backgroundColor: asset?.hexColor || '#ccc'}}
                />
              );
            })}
            <span className="text-[10px] text-stone-400 uppercase tracking-wider ml-1 font-mono">
              {product.metalAssets[selectedMetal]?.name}
            </span>
          </div>

          {/* Title */}
          <Link
            to={`/products/${product.handle}?metal=${selectedMetal}`}
            className="block text-stone-900 font-serif text-base font-medium group-hover:text-amber-800 transition-colors line-clamp-1"
          >
            {product.title}
          </Link>

          {/* Subtitle / Tagline */}
          <p className="text-xs text-stone-500 font-light mt-0.5 line-clamp-1">
            {product.subtitle}
          </p>

          {/* 4Cs Gemological Summary Pills with shadcn Badge */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-stone-100">
            <Badge variant="outline" className="bg-stone-50 border-stone-200 text-stone-700 font-mono font-medium text-[11px] py-0 px-1.5">
              {diamond.carat} ct
            </Badge>
            <Badge variant="outline" className="bg-stone-50 border-stone-200 text-stone-700 font-medium text-[11px] py-0 px-1.5">
              Color {diamond.colorGrade}
            </Badge>
            <Badge variant="outline" className="bg-stone-50 border-stone-200 text-stone-700 font-medium text-[11px] py-0 px-1.5">
              {diamond.clarityGrade}
            </Badge>
            <Badge variant="outline" className="bg-stone-50 border-stone-200 text-stone-700 font-serif text-[11px] py-0 px-1.5">
              {diamond.certification.lab}
            </Badge>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-stone-400 font-serif">
              Total with Diamond
            </div>
            <div className="text-base font-serif font-bold text-stone-900">
              ${product.pricing.totalPrice.toLocaleString()}
            </div>
          </div>

          <Link
            to={`/products/${product.handle}?metal=${selectedMetal}`}
            className={buttonVariants({size: 'sm', variant: 'default'}) + ' text-xs uppercase tracking-wide font-medium bg-stone-900 hover:bg-stone-800 text-white rounded'}
          >
            Customize
          </Link>
        </div>
      </div>
    </Card>
  );
}
