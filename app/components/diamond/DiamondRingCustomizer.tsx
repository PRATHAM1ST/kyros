import React, {useState} from 'react';
import type {DiamondProduct, PreciousMetal} from '~/types/diamond';
import {DiamondSpecsDrawer} from './DiamondSpecsDrawer';
import {CaratVisualizer} from './CaratVisualizer';
import {useAside} from '~/components/Aside';
import {Button} from '~/components/ui/button';
import {Card, CardContent} from '~/components/ui/card';
import {Separator} from '~/components/ui/separator';
import {Badge} from '~/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

interface DiamondRingCustomizerProps {
  product: DiamondProduct;
  initialMetal?: PreciousMetal;
}

export function DiamondRingCustomizer({
  product,
  initialMetal,
}: DiamondRingCustomizerProps) {
  const [selectedMetal, setSelectedMetal] = useState<PreciousMetal>(
    initialMetal || product.setting.defaultMetal,
  );
  const [selectedCarat, setSelectedCarat] = useState<number>(
    product.diamond.carat,
  );
  const [selectedRingSize, setSelectedRingSize] = useState<number>(6.0);
  const [isAdded, setIsAdded] = useState(false);
  const {open} = useAside();

  // Find active carat variation
  const activeCaratOption = product.caratOptions.find(
    (c) => c.carat === selectedCarat,
  );
  const centerDiamondPrice =
    activeCaratOption?.centerDiamondPrice ||
    product.pricing.defaultDiamondPrice;
  const settingPrice = product.pricing.settingPrice;
  const totalPrice = settingPrice + centerDiamondPrice;

  const activeMetalAsset = product.metalAssets[selectedMetal];

  const handleAddToCart = () => {
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      open('cart');
    }, 400);
  };

  return (
    <div className="diamond-ring-customizer flex flex-col space-y-6">
      {/* 1. Metal Selection */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-widest text-stone-500 font-serif font-semibold">
            Precious Metal Band
          </span>
          <span className="text-xs font-medium text-stone-900 font-serif">
            {activeMetalAsset?.name}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {product.setting.metalsAvailable.map((metal) => {
            const asset = product.metalAssets[metal];
            const isSelected = selectedMetal === metal;
            return (
              <Button
                key={metal}
                type="button"
                variant={isSelected ? 'default' : 'outline'}
                onClick={() => setSelectedMetal(metal)}
                className={`h-auto flex items-center space-x-2 p-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-inner flex-shrink-0"
                  style={{backgroundColor: asset?.hexColor}}
                />
                <span className="truncate">{asset?.name}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* 2. Carat Weight Selection */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-widest text-stone-500 font-serif font-semibold">
            Center Diamond Carat Weight
          </span>
          <span className="text-xs font-medium text-stone-900 font-mono">
            {selectedCarat.toFixed(2)} Carats
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {product.caratOptions.map((opt) => {
            const isSelected = selectedCarat === opt.carat;
            return (
              <Button
                key={opt.carat}
                type="button"
                variant={isSelected ? 'default' : 'outline'}
                onClick={() => setSelectedCarat(opt.carat)}
                className={`h-auto flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                }`}
              >
                <span className="font-bold text-sm">{opt.carat} ct</span>
                <span
                  className={`text-[10px] mt-0.5 ${
                    isSelected ? 'text-amber-200' : 'text-stone-500'
                  }`}
                >
                  +${(opt.centerDiamondPrice / 1000).toFixed(1)}k
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* 3. Ring Size Selection with shadcn Select */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="ring-size-trigger" className="text-xs uppercase tracking-widest text-stone-500 font-serif font-semibold">
            Ring Size (US)
          </label>
          <span className="text-xs text-amber-800 underline cursor-pointer">
            Complimentary Custom Resizing Included
          </span>
        </div>

        <Select
          value={selectedRingSize.toString()}
          onValueChange={(val) => {
            if (val) setSelectedRingSize(parseFloat(val));
          }}
        >
          <SelectTrigger id="ring-size-trigger" className="w-full h-10 bg-stone-50 border-stone-200 text-sm">
            <SelectValue placeholder={`Size ${selectedRingSize.toFixed(1)} (US)`} />
          </SelectTrigger>
          <SelectContent>
            {product.setting.ringSizesAvailable.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                Size {size.toFixed(1)} (US)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 4. Carat Visualizer scale */}
      <CaratVisualizer
        carat={selectedCarat}
        shape={product.diamond.shape}
        ringSize={selectedRingSize}
      />

      {/* 5. GIA / IGI Specs Drawer Modal */}
      <DiamondSpecsDrawer
        product={product}
        selectedCarat={selectedCarat}
      />

      {/* 6. Transparent Price Breakdown in shadcn Card */}
      <Card className="bg-stone-50 border-stone-200 rounded-xl shadow-none">
        <CardContent className="p-4 space-y-2.5">
          <div className="text-xs uppercase tracking-wider text-stone-400 font-semibold mb-2">
            Transparent Atelier Pricing Breakdown
          </div>
          <div className="flex justify-between text-xs text-stone-600">
            <span>
              {product.setting.styleName} ({activeMetalAsset?.name}):
            </span>
            <span className="font-mono text-stone-900">
              ${settingPrice.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-xs text-stone-600">
            <span>
              {selectedCarat} ct {product.diamond.shape} ({product.diamond.cutGrade},{' '}
              {product.diamond.colorGrade}/{product.diamond.clarityGrade}):
            </span>
            <span className="font-mono text-stone-900">
              ${centerDiamondPrice.toLocaleString()}
            </span>
          </div>
          <Separator className="bg-stone-200 my-2" />
          <div className="flex justify-between items-baseline pt-1">
            <span className="text-sm font-semibold text-stone-900">
              Total Ring Investment:
            </span>
            <span className="text-2xl font-serif font-bold text-stone-900">
              ${totalPrice.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 7. Action CTA Buttons with shadcn Button */}
      <div className="space-y-3 pt-2">
        <Button
          type="button"
          size="lg"
          onClick={handleAddToCart}
          className={`w-full py-6 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer ${
            isAdded
              ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
              : 'bg-stone-950 hover:bg-stone-800 text-white shadow-lg'
          }`}
        >
          {isAdded ? 'Added to Bag' : `Order Bespoke Ring • $${totalPrice.toLocaleString()}`}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => alert(`KYROS Private Concierge appointment request received for ${product.title} (${selectedCarat} ct ${activeMetalAsset?.name}). An atelier advisor will contact you within 2 business hours.`)}
          className="w-full py-5 rounded-lg text-xs font-semibold uppercase tracking-widest border-stone-900 text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          Book Private Atelier Consultation
        </Button>
      </div>

      {/* Trust Badges with shadcn Badge */}
      <div className="grid grid-cols-2 gap-2 text-xs text-stone-500 pt-4 border-t border-stone-100">
        <Badge variant="outline" className="justify-start gap-1.5 py-1 border-stone-200 font-normal text-stone-600 bg-white">
          <span className="text-amber-600 font-bold">✓</span>
          <span>GIA Inscribed &amp; Certified</span>
        </Badge>
        <Badge variant="outline" className="justify-start gap-1.5 py-1 border-stone-200 font-normal text-stone-600 bg-white">
          <span className="text-amber-600 font-bold">✓</span>
          <span>Lifetime Warranty</span>
        </Badge>
        <Badge variant="outline" className="justify-start gap-1.5 py-1 border-stone-200 font-normal text-stone-600 bg-white">
          <span className="text-amber-600 font-bold">✓</span>
          <span>Complimentary Resizing</span>
        </Badge>
        <Badge variant="outline" className="justify-start gap-1.5 py-1 border-stone-200 font-normal text-stone-600 bg-white">
          <span className="text-amber-600 font-bold">✓</span>
          <span>Discreet Insured Delivery</span>
        </Badge>
      </div>
    </div>
  );
}
