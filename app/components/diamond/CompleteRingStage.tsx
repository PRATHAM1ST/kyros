import React, {useState} from 'react';
import {useNavigate} from 'react-router';
import {useDiamondContext} from '~/context/DiamondFilterContext';
import {useAside} from '~/components/Aside';
import {DiamondShapeIcon} from './DiamondShapeIcons';
import {RingStyleIcon} from './RingStyleIcons';
import {Button} from '~/components/ui/button';
import {Card, CardContent} from '~/components/ui/card';
import {Badge} from '~/components/ui/badge';
import {Separator} from '~/components/ui/separator';
import {Input} from '~/components/ui/input';
import {Label} from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '~/components/ui/dialog';
import {AddToCartButton} from '~/components/AddToCartButton';

const RING_SIZES = [
  3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 10.5, 11.0, 11.5, 12.0,
];

export function CompleteRingStage() {
  const {
    selectedDiamond,
    selectedSetting,
    selectedMetal,
    ringSize,
    setRingSize,
    prongStyle,
    setProngStyle,
    bandWidthMm,
    setBandWidthMm,
    engraving,
    setEngraving,
    totalInvestment,
    setStage,
  } = useDiamondContext();

  const navigate = useNavigate();
  const {open} = useAside();
  const [activeGalleryTab, setActiveGalleryTab] = useState<'primary' | 'hand' | 'cert'>('primary');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  if (!selectedDiamond || !selectedSetting) {
    return (
      <Card className="bg-white border-stone-200 rounded-2xl max-w-lg mx-auto shadow-sm my-12">
        <CardContent className="p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto text-lg font-serif">
            ✦
          </div>
          <h3 className="text-xl font-serif text-stone-900 font-medium">
            Custom Ring Incomplete
          </h3>
          <p className="text-xs text-stone-500 font-light max-w-sm mx-auto">
            Please choose both a certified center diamond and an atelier setting to finalize your bespoke creation.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            {!selectedDiamond && (
              <Button
                type="button"
                size="sm"
                onClick={() => setStage('diamond')}
                className="bg-stone-900 text-white text-xs"
              >
                Choose Diamond &rarr;
              </Button>
            )}
            {!selectedSetting && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setStage('settings')}
                className="text-xs"
              >
                Choose Setting &rarr;
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const diamondPrice = selectedDiamond.pricing.price;
  const settingBasePrice = selectedSetting.basePrice;
  const metalAdjustment = selectedMetal.priceAdjustment || 0;
  const effectiveSettingPrice = settingBasePrice + metalAdjustment;

  const ringImage =
    selectedSetting.images[selectedMetal.id] ||
    selectedSetting.images['platinum-950'] ||
    '/images/diamonds/round-solitaire-platinum.jpg';

  // Construct Line Item Custom Attributes for Shopify Cart
  const cartLineItem = {
    merchandiseId: selectedDiamond.shopifyVariantId || selectedSetting.shopifyVariantId || 'gid://shopify/ProductVariant/64644086628721', // Ensure real Shopify variant ID is used
    quantity: 1,
    attributes: [
      {key: 'Type', value: 'Bespoke Diamond Engagement Ring'},
      {key: 'Diamond Shape', value: selectedDiamond.shape},
      {key: 'Diamond Carat', value: `${selectedDiamond.carat.toFixed(2)} ct`},
      {key: 'Diamond Cut', value: selectedDiamond.cutGrade},
      {key: 'Diamond Color', value: selectedDiamond.colorGrade},
      {key: 'Diamond Clarity', value: selectedDiamond.clarityGrade},
      {key: 'Diamond Lab', value: selectedDiamond.certification.lab},
      {key: 'Certificate Number', value: selectedDiamond.certification.certificateNumber},
      {key: 'Setting Style', value: selectedSetting.title},
      {key: 'Precious Metal', value: `${selectedMetal.name} (${selectedMetal.purity})`},
      {key: 'Ring Size (US)', value: ringSize.toFixed(1)},
      {key: 'Prong Style', value: prongStyle},
      {key: 'Band Width', value: `${bandWidthMm.toFixed(1)} mm`},
      ...(engraving.text.trim()
        ? [
            {key: 'Laser Engraving', value: `"${engraving.text}" (${engraving.font} Font)`},
          ]
        : []),
    ],
  };

  const handleProceedToCheckout = () => {
    // Navigate directly to the custom checkout page
    navigate(
      `/checkout?diamondId=${selectedDiamond.id}&settingId=${selectedSetting.id}&metalId=${selectedMetal.id}&size=${ringSize}&prong=${encodeURIComponent(
        prongStyle,
      )}&width=${bandWidthMm}&engraving=${encodeURIComponent(engraving.text)}&engravingFont=${engraving.font}`,
    );
  };

  return (
    <div className="complete-ring-stage space-y-8">
      {/* 1. Header Banner */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs uppercase tracking-widest text-amber-800 font-serif font-semibold">
          Final Atelier Customization
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif text-stone-900 tracking-tight mt-1 mb-2">
          Your Bespoke Ring Composition
        </h1>
        <p className="text-xs text-stone-500 font-light">
          Review your selected gemological diamond and setting anatomy. Personalize your precise finger size, prong style, and custom laser inscription.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Visual Showcase & Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Visual Display */}
          <div className="relative aspect-square bg-stone-100 rounded-2xl overflow-hidden border border-stone-200/90 shadow-sm group">
            {activeGalleryTab === 'primary' && (
              <img
                src={ringImage}
                alt={selectedSetting.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            {activeGalleryTab === 'hand' && (
              <img
                src="/images/diamonds/diamond-on-hand-lifestyle.jpg"
                alt="On Hand Scale Lifestyle"
                className="w-full h-full object-cover"
              />
            )}
            {activeGalleryTab === 'cert' && (
              <img
                src="/images/diamonds/gia-certificate-preview.jpg"
                alt="Gemological Certificate Preview"
                className="w-full h-full object-cover"
              />
            )}

            {/* Inlaid Diamond Silhouette Badge */}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md py-1.5 px-3 rounded-xl border border-stone-200 flex items-center space-x-2 shadow-sm">
              <span className="w-4 h-4 text-amber-800">
                <DiamondShapeIcon shape={selectedDiamond.shape} size={16} />
              </span>
              <span className="text-[11px] font-serif font-bold text-stone-900">
                {selectedDiamond.carat} ct {selectedDiamond.shape}
              </span>
            </div>

            {/* Metal Swatch Indicator */}
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md py-1.5 px-3 rounded-xl border border-stone-200 flex items-center space-x-2 shadow-sm">
              <span
                className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-inner"
                style={{backgroundColor: selectedMetal.hexColor}}
              />
              <span className="text-[11px] font-serif font-medium text-stone-900">
                {selectedMetal.shortName}
              </span>
            </div>
          </div>

          {/* Gallery View Switcher */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setActiveGalleryTab('primary')}
              className={`py-2 px-2 rounded-xl border text-[11px] font-serif font-medium transition-all cursor-pointer text-center ${
                activeGalleryTab === 'primary'
                  ? 'border-stone-900 bg-stone-900 text-white'
                  : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
              }`}
            >
              Ring View
            </button>
            <button
              type="button"
              onClick={() => setActiveGalleryTab('hand')}
              className={`py-2 px-2 rounded-xl border text-[11px] font-serif font-medium transition-all cursor-pointer text-center ${
                activeGalleryTab === 'hand'
                  ? 'border-stone-900 bg-stone-900 text-white'
                  : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
              }`}
            >
              On-Hand Scale
            </button>
            <button
              type="button"
              onClick={() => setActiveGalleryTab('cert')}
              className={`py-2 px-2 rounded-xl border text-[11px] font-serif font-medium transition-all cursor-pointer text-center ${
                activeGalleryTab === 'cert'
                  ? 'border-stone-900 bg-stone-900 text-white'
                  : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
              }`}
            >
              {selectedDiamond.certification.lab} Cert
            </button>
          </div>

          {/* Live Engraving Band Visualizer */}
          {engraving.text.trim() && (
            <div className="p-4 bg-stone-900 text-amber-200 rounded-2xl border border-stone-800 space-y-1.5 shadow-inner">
              <span className="text-[10px] uppercase tracking-widest text-stone-400 block font-semibold">
                Interior Band Laser Inscription Preview:
              </span>
              <div
                className={`text-center py-2 px-4 rounded bg-stone-950/80 border border-stone-800 text-base tracking-widest font-mono text-amber-300 shadow-sm ${
                  engraving.font === 'Script' ? 'italic font-serif' : engraving.font === 'Serif' ? 'font-serif' : 'font-sans uppercase font-bold'
                }`}
              >
                &ldquo;{engraving.text}&rdquo;
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Review Cards, Customization & Pricing (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* TWO SPECIFICATION CARDS (BOTH FULLY CHANGEABLE!) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: Selected Diamond Specs */}
            <Card className="rounded-2xl border-stone-200 bg-white shadow-sm overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-amber-800 font-serif font-semibold">
                    1. Center Diamond
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => setStage('diamond')}
                    className="text-stone-500 hover:text-stone-900 text-xs p-0 h-auto underline cursor-pointer"
                  >
                    Change Diamond
                  </Button>
                </div>

                <div>
                  <h4 className="text-base font-serif font-bold text-stone-900">
                    {selectedDiamond.carat} ct {selectedDiamond.shape}
                  </h4>
                  <p className="text-xs text-stone-600 font-sans mt-0.5">
                    {selectedDiamond.colorGrade} Color • {selectedDiamond.clarityGrade} Clarity • {selectedDiamond.cutGrade.includes('Super') ? 'Super Ideal' : selectedDiamond.cutGrade}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-stone-50 p-2.5 rounded-lg border border-stone-100 font-mono text-stone-700">
                  <div>Lab: <strong>{selectedDiamond.certification.lab}</strong></div>
                  <div>Report: <strong>{selectedDiamond.certification.certificateNumber}</strong></div>
                  <div>Table: {selectedDiamond.proportions.tablePercentage}%</div>
                  <div>Depth: {selectedDiamond.proportions.depthPercentage}%</div>
                  <div>Polish: {selectedDiamond.finish.polish}</div>
                  <div>Fluor: {selectedDiamond.finish.fluorescence}</div>
                </div>

                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-xs text-stone-400 font-sans">Diamond Investment:</span>
                  <span className="text-sm font-serif font-bold text-stone-900 font-mono">
                    ${diamondPrice.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Selected Setting Specs */}
            <Card className="rounded-2xl border-stone-200 bg-white shadow-sm overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-amber-800 font-serif font-semibold">
                    2. Ring Setting
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => setStage('settings')}
                    className="text-stone-500 hover:text-stone-900 text-xs p-0 h-auto underline cursor-pointer"
                  >
                    Change Setting
                  </Button>
                </div>

                <div>
                  <h4 className="text-base font-serif font-bold text-stone-900">
                    {selectedSetting.title}
                  </h4>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-stone-300 inline-block"
                      style={{backgroundColor: selectedMetal.hexColor}}
                    />
                    <span className="text-xs text-stone-600 font-sans">
                      {selectedMetal.name} ({selectedMetal.purity})
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-stone-50 p-2.5 rounded-lg border border-stone-100 font-mono text-stone-700">
                  <div>Style: <strong>{selectedSetting.styleCategory}</strong></div>
                  <div>Prongs: <strong>{prongStyle}</strong></div>
                  <div>Band: {bandWidthMm} mm</div>
                  <div>Metal: {selectedMetal.shortName}</div>
                </div>

                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-xs text-stone-400 font-sans">Setting Investment:</span>
                  <span className="text-sm font-serif font-bold text-stone-900 font-mono">
                    ${effectiveSettingPrice.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CUSTOMIZATION CONTROLS: Ring Size, Prong Style, Band Width, Engraving */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
            <h3 className="text-xs uppercase tracking-widest text-stone-500 font-serif font-semibold">
              Bespoke Ring Customization Options
            </h3>

            {/* Row 1: Ring Size & Prong Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Ring Size Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="ring-size-select" className="text-xs font-serif font-semibold text-stone-700">
                    Ring Size (US)
                  </Label>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(true)}
                    className="text-[11px] text-amber-800 underline cursor-pointer"
                  >
                    Size Guide
                  </button>
                </div>

                <Select
                  value={ringSize.toString()}
                  onValueChange={(val) => setRingSize(parseFloat(val ?? ''))}
                >
                  <SelectTrigger id="ring-size-select" className="h-10 bg-stone-50 text-xs font-mono">
                    <SelectValue placeholder={`Size ${ringSize.toFixed(1)} (US)`} />
                  </SelectTrigger>
                  <SelectContent>
                    {RING_SIZES.map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        Size {size.toFixed(1)} (US) • {Math.round(44 + size * 2.5)} mm circ.
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-[10px] text-stone-400 font-light mt-1 block">
                  Complimentary custom resizing within 120 days of delivery.
                </span>
              </div>

              {/* Prong Type Dropdown */}
              <div>
                <Label htmlFor="prong-type-select" className="text-xs font-serif font-semibold text-stone-700 block mb-1.5">
                  Prong Style
                </Label>
                <Select
                  value={prongStyle}
                  onValueChange={(val) => setProngStyle(val ?? "")}
                >
                  <SelectTrigger id="prong-type-select" className="h-10 bg-stone-50 text-xs">
                    <SelectValue placeholder={prongStyle} />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedSetting.prongStyles.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style} ({selectedSetting.prongCount > 0 ? `${selectedSetting.prongCount}-Prong Head` : 'Full Rim'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-[10px] text-stone-400 font-light mt-1 block">
                  Precision micro-welded by master goldsmiths in Geneva.
                </span>
              </div>
            </div>

            {/* Row 2: Band Width & Engraving Font */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
              {/* Band Width Dropdown */}
              <div>
                <Label htmlFor="band-width-select" className="text-xs font-serif font-semibold text-stone-700 block mb-1.5">
                  Band Width (Millimeters)
                </Label>
                <Select
                  value={bandWidthMm.toString()}
                  onValueChange={(val) => setBandWidthMm(parseFloat(val ?? ""))}
                >
                  <SelectTrigger id="band-width-select" className="h-10 bg-stone-50 text-xs font-mono">
                    <SelectValue placeholder={`${bandWidthMm.toFixed(1)} mm`} />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedSetting.bandWidthsMm.map((w) => (
                      <SelectItem key={w} value={w.toString()}>
                        {w.toFixed(1)} mm {w <= 1.8 ? '• Dainty Petite' : w <= 2.0 ? '• Classic Comfort' : '• Heritage Statement'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Engraving Font Style */}
              <div>
                <Label className="text-xs font-serif font-semibold text-stone-700 block mb-1.5">
                  Engraving Font Style
                </Label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Script', 'Serif', 'Block'] as const).map((font) => (
                    <button
                      key={font}
                      type="button"
                      onClick={() => setEngraving({...engraving, font})}
                      className={`py-2 px-1 rounded-lg border text-xs text-center transition-all cursor-pointer ${
                        engraving.font === font
                          ? 'border-stone-900 bg-stone-900 text-white font-semibold shadow-sm'
                          : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      <span className={font === 'Script' ? 'italic font-serif' : font === 'Serif' ? 'font-serif' : 'font-mono'}>
                        {font}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 3: Custom Laser Engraving Input Field */}
            <div className="pt-2 border-t border-stone-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="engraving-input" className="text-xs font-serif font-semibold text-stone-700">
                  Custom Laser Inscription (Complimentary)
                </Label>
                <span className="text-[10px] text-stone-400 font-mono">
                  {engraving.text.length} / 25 characters
                </span>
              </div>
              <Input
                id="engraving-input"
                type="text"
                maxLength={25}
                placeholder="e.g. Forever & Always • 10.14.25"
                value={engraving.text}
                onChange={(e) => setEngraving({...engraving, text: e.target.value})}
                className="h-10 bg-stone-50 text-xs font-mono"
              />
              <span className="text-[10px] text-stone-400 font-light block">
                Precision laser inscribed along the inner band curve. Symbols like &hearts; or &bull; supported.
              </span>
            </div>
          </div>

          {/* TRANSPARENT ATELIER PRICING BREAKDOWN */}
          <Card className="bg-stone-50 border-stone-200/90 rounded-2xl shadow-none">
            <CardContent className="p-5 space-y-3">
              <span className="text-xs uppercase tracking-wider text-stone-400 font-semibold block">
                Transparent Atelier Price Breakdown
              </span>

              <div className="flex justify-between text-xs text-stone-600">
                <span>
                  Center Diamond ({selectedDiamond.carat} ct {selectedDiamond.shape}, {selectedDiamond.colorGrade}/{selectedDiamond.clarityGrade}):
                </span>
                <span className="font-mono text-stone-900 font-medium">
                  ${diamondPrice.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-xs text-stone-600">
                <span>
                  {selectedSetting.title} ({selectedMetal.name}):
                </span>
                <span className="font-mono text-stone-900 font-medium">
                  ${effectiveSettingPrice.toLocaleString()}
                </span>
              </div>

              {engraving.text.trim() && (
                <div className="flex justify-between text-xs text-stone-600">
                  <span>Custom Laser Engraving:</span>
                  <span className="text-emerald-700 font-mono font-medium">
                    Complimentary ($0)
                  </span>
                </div>
              )}

              <Separator className="bg-stone-200 my-2" />

              <div className="flex justify-between items-baseline pt-1">
                <div>
                  <span className="text-sm font-serif font-bold text-stone-900 block">
                    Total Ring Investment:
                  </span>
                  <span className="text-[10px] text-stone-400 font-light">
                    Includes duty, GIA/IGI certification, luxury velvet presentation box &amp; insured transit
                  </span>
                </div>
                <span className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 font-mono">
                  ${totalInvestment.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* CTAs: Add to Cart (Shopify) & Instant Checkout */}
          <div className="space-y-3 pt-2">
            <AddToCartButton
              lines={[cartLineItem as any]}
              onClick={() => {
                setIsAdding(true);
                setTimeout(() => {
                  setIsAdding(false);
                  open('cart');
                }, 400);
              }}
              className="w-full h-12 rounded-xl text-xs font-semibold uppercase tracking-widest bg-stone-950 hover:bg-stone-800 text-white shadow-lg cursor-pointer"
            >
              {isAdding ? 'Adding Custom Ring...' : `Add Bespoke Ring to Bag • $${totalInvestment.toLocaleString()}`}
            </AddToCartButton>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleProceedToCheckout}
              className="w-full h-12 rounded-xl text-xs font-semibold uppercase tracking-widest border-stone-900 text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Instant Atelier Checkout &rarr;
            </Button>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-stone-600">
            <Badge variant="outline" className="justify-start gap-1 py-1 bg-white border-stone-200 font-normal text-[11px]">
              <span className="text-amber-600 font-bold">✓</span>
              <span>GIA/IGI Verified</span>
            </Badge>
            <Badge variant="outline" className="justify-start gap-1 py-1 bg-white border-stone-200 font-normal text-[11px]">
              <span className="text-amber-600 font-bold">✓</span>
              <span>Free Resizing</span>
            </Badge>
            <Badge variant="outline" className="justify-start gap-1 py-1 bg-white border-stone-200 font-normal text-[11px]">
              <span className="text-amber-600 font-bold">✓</span>
              <span>Insured Delivery</span>
            </Badge>
            <Badge variant="outline" className="justify-start gap-1 py-1 bg-white border-stone-200 font-normal text-[11px]">
              <span className="text-amber-600 font-bold">✓</span>
              <span>Lifetime Warranty</span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Ring Size Guide Modal */}
      {showSizeGuide && (
        <Dialog open={showSizeGuide} onOpenChange={setShowSizeGuide}>
          <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-serif font-bold text-stone-900">
                KYROS Ring Sizing Guide
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-500">
                Standard US sizes with corresponding millimeter inner diameter and circumference.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 max-h-64 overflow-y-auto text-xs font-mono">
              <table className="w-full text-left">
                <thead className="border-b border-stone-200 text-[10px] uppercase text-stone-400 font-sans">
                  <tr>
                    <th className="pb-1">US Size</th>
                    <th className="pb-1">Diameter (mm)</th>
                    <th className="pb-1">Circumference (mm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {RING_SIZES.map((sz) => (
                    <tr key={sz} className="py-1">
                      <td className="py-1 font-bold">Size {sz.toFixed(1)}</td>
                      <td className="py-1">{(14.0 + sz * 0.8).toFixed(1)} mm</td>
                      <td className="py-1">{(44.0 + sz * 2.5).toFixed(1)} mm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 flex justify-end">
              <Button
                type="button"
                size="xs"
                onClick={() => setShowSizeGuide(false)}
                className="bg-stone-900 text-white text-xs"
              >
                Got It
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
