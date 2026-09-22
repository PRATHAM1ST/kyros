import React, {useState} from 'react';
import {useSearchParams, Link, useNavigate} from 'react-router';
import type {Route} from './+types/checkout';
import {getLooseDiamondById} from '~/data/loose-diamonds';
import {getRingSettingById, getMetalOptionById} from '~/data/ring-settings';
import {DiamondShapeIcon} from '~/components/diamond/DiamondShapeIcons';
import {Button} from '~/components/ui/button';
import {Input} from '~/components/ui/input';
import {Label} from '~/components/ui/label';
import {Card, CardContent} from '~/components/ui/card';
import {Badge} from '~/components/ui/badge';
import {Separator} from '~/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '~/components/ui/dialog';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Atelier Checkout | KYROS Haute Joaillerie'},
    {name: 'description', content: 'Secure checkout for your bespoke handcrafted diamond ring.'},
  ];
};

export default function CheckoutRoute() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const diamondId = searchParams.get('diamondId') || 'dia-nat-001';
  const settingId = searchParams.get('settingId') || 'setting-solitaire-signature';
  const metalId = searchParams.get('metalId') || 'platinum-950';
  const ringSize = searchParams.get('size') || '6.0';
  const prongStyle = searchParams.get('prong') || 'Claw Prongs';
  const bandWidth = searchParams.get('width') || '1.8';
  const engraving = searchParams.get('engraving') || '';
  const engravingFont = searchParams.get('engravingFont') || 'Script';

  const diamond = getLooseDiamondById(diamondId);
  const setting = getRingSettingById(settingId);
  const metal = getMetalOptionById(metalId);

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wire' | 'concierge'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: 'Eleanor',
    lastName: 'Vance',
    email: 'eleanor.vance@atelier-client.com',
    phone: '+1 (555) 234-5678',
    address: '740 Park Avenue, Penthouse B',
    city: 'New York',
    state: 'NY',
    postalCode: '10021',
    country: 'United States',
  });

  const diamondPrice = diamond?.pricing.price || 15400;
  const settingPrice = (setting?.basePrice || 1850) + (metal?.priceAdjustment || 0);
  const totalPrice = diamondPrice + settingPrice;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1200);
  };

  return (
    <div className="kyros-checkout-page bg-stone-100/50 min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-200">
          <div>
            <Link to="/" className="text-xl font-serif font-bold tracking-[0.25em] text-stone-900">
              KYROS
            </Link>
            <span className="text-[10px] tracking-[0.3em] uppercase text-stone-500 font-serif block">
              Haute Joaillerie Atelier Checkout
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs text-stone-500 font-serif">
            <span className="text-amber-800 font-bold">🔒 256-bit SSL Encrypted</span>
            <span>•</span>
            <span>GIA Insured Delivery</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Checkout Forms (7 cols) */}
          <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-6">
            {/* 1. Contact Info */}
            <Card className="bg-white border-stone-200/90 rounded-2xl shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-stone-900">
                    1. Private Client Contact
                  </h3>
                  <span className="text-[11px] text-stone-400">Step 1 of 3</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-stone-600 mb-1 block">Email Address</Label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="h-10 bg-stone-50 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-stone-600 mb-1 block">Phone (Delivery Verification)</Label>
                    <Input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="h-10 bg-stone-50 text-xs"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Insured Shipping Address */}
            <Card className="bg-white border-stone-200/90 rounded-2xl shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-stone-900">
                    2. Discreet Insured Delivery Address
                  </h3>
                  <span className="text-[11px] text-stone-400">Step 2 of 3</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-stone-600 mb-1 block">First Name</Label>
                    <Input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="h-10 bg-stone-50 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-stone-600 mb-1 block">Last Name</Label>
                    <Input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="h-10 bg-stone-50 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-stone-600 mb-1 block">Street Address</Label>
                  <Input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="h-10 bg-stone-50 text-xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-stone-600 mb-1 block">City</Label>
                    <Input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="h-10 bg-stone-50 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-stone-600 mb-1 block">State / Region</Label>
                    <Input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      className="h-10 bg-stone-50 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-stone-600 mb-1 block">Postal Code</Label>
                    <Input
                      type="text"
                      required
                      value={formData.postalCode}
                      onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                      className="h-10 bg-stone-50 text-xs"
                    />
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center space-x-3 text-xs text-stone-600">
                  <span className="text-amber-800 text-lg">🛡️</span>
                  <div>
                    <strong className="text-stone-900 block font-serif">Brinks Armored Discreet Courier</strong>
                    <span className="text-[11px] text-stone-500">
                      Signature and photo ID mandatory upon arrival. Discreet unbranded luxury security box.
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Payment Method */}
            <Card className="bg-white border-stone-200/90 rounded-2xl shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-serif font-bold uppercase tracking-wider text-stone-900">
                    3. Atelier Payment Protocol
                  </h3>
                  <span className="text-[11px] text-stone-400">Step 3 of 3</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-xs font-serif font-medium transition-all cursor-pointer text-center ${
                      paymentMethod === 'card'
                        ? 'border-stone-900 bg-stone-900 text-white shadow'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    Credit / Debit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wire')}
                    className={`p-3 rounded-xl border text-xs font-serif font-medium transition-all cursor-pointer text-center ${
                      paymentMethod === 'wire'
                        ? 'border-stone-900 bg-stone-900 text-white shadow'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    Bank Wire (-1.5%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('concierge')}
                    className={`p-3 rounded-xl border text-xs font-serif font-medium transition-all cursor-pointer text-center ${
                      paymentMethod === 'concierge'
                        ? 'border-stone-900 bg-stone-900 text-white shadow'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    Private Concierge
                  </button>
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <Label className="text-xs text-stone-600 mb-1 block">Card Number</Label>
                      <Input
                        type="text"
                        placeholder="4532 •••• •••• 8920"
                        defaultValue="•••• •••• •••• 4242"
                        className="h-10 bg-stone-50 text-xs font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-stone-600 mb-1 block">Expiration</Label>
                        <Input
                          type="text"
                          placeholder="MM/YY"
                          defaultValue="12/28"
                          className="h-10 bg-stone-50 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-stone-600 mb-1 block">Security CVC</Label>
                        <Input
                          type="text"
                          placeholder="CVC"
                          defaultValue="•••"
                          className="h-10 bg-stone-50 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'wire' && (
                  <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 text-xs space-y-1 text-stone-700">
                    <strong className="text-amber-950 block font-serif">Direct Bank Wire Transfer (Geneva Private Desk)</strong>
                    <p>Wire details will be issued via secure encrypted courier. A 1.5% courtesy credit is applied upon receipt.</p>
                  </div>
                )}

                {paymentMethod === 'concierge' && (
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1 text-stone-700">
                    <strong className="text-stone-900 block font-serif">Private Atelier Concierge Invoice</strong>
                    <p>A senior KYROS advisor will liaise directly with your family office or private banker to finalize procurement.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full py-6 rounded-xl text-xs font-semibold uppercase tracking-widest bg-stone-950 hover:bg-stone-800 text-white shadow-xl cursor-pointer"
            >
              {isSubmitting ? 'Securing Diamond & Authorizing...' : `Place Bespoke Order • $${totalPrice.toLocaleString()}`}
            </Button>
          </form>

          {/* RIGHT: Order Summary Card (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <Card className="bg-white border-stone-200/90 rounded-2xl shadow-sm overflow-hidden sticky top-8">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <span className="text-xs uppercase tracking-widest text-stone-500 font-serif font-semibold">
                    Order Summary
                  </span>
                  <Badge variant="outline" className="font-mono text-[10px] bg-stone-50">
                    1 Bespoke Item
                  </Badge>
                </div>

                {/* Ring Visual & Title */}
                <div className="flex space-x-4 items-center">
                  <div className="w-20 h-20 bg-stone-100 rounded-xl overflow-hidden shrink-0 border border-stone-200">
                    <img
                      src={setting?.images[metal.id] || setting?.images['platinum-950'] || '/images/diamonds/round-solitaire-platinum.jpg'}
                      alt={setting?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-serif font-bold text-stone-900">
                      {setting?.title || 'The Kyros Signature Solitaire'}
                    </h4>
                    <p className="text-xs text-stone-500 font-sans mt-0.5">
                      {diamond?.carat.toFixed(2)} ct {diamond?.shape} • {metal.name}
                    </p>
                    <span className="text-xs font-mono font-bold text-stone-900 block mt-1">
                      ${totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Complete Breakdown of Selected Properties */}
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2 text-xs font-sans">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Center Diamond:</span>
                    <span className="font-semibold text-stone-900">
                      {diamond?.carat} ct {diamond?.shape} ({diamond?.colorGrade}/{diamond?.clarityGrade})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Certification:</span>
                    <span className="font-mono text-amber-900 font-bold">
                      {diamond?.certification.lab} #{diamond?.certification.certificateNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Metal &amp; Karat:</span>
                    <span className="font-semibold text-stone-900">{metal.name} ({metal.purity})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Ring Size:</span>
                    <span className="font-mono font-semibold text-stone-900">Size {ringSize} (US)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Prong Style:</span>
                    <span className="font-semibold text-stone-900">{prongStyle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Band Width:</span>
                    <span className="font-mono text-stone-900">{bandWidth} mm</span>
                  </div>
                  {engraving && (
                    <div className="flex justify-between pt-1 border-t border-stone-200">
                      <span className="text-stone-500">Engraving:</span>
                      <span className="font-mono italic text-amber-900 font-bold">&ldquo;{engraving}&rdquo; ({engravingFont})</span>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 text-xs text-stone-600 pt-2 border-t border-stone-100">
                  <div className="flex justify-between">
                    <span>Center Diamond:</span>
                    <span className="font-mono text-stone-900">${diamondPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ring Setting ({metal.name}):</span>
                    <span className="font-mono text-stone-900">${settingPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Custom Laser Inscription:</span>
                    <span className="text-emerald-700 font-medium">Complimentary ($0)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insured Armored Transit:</span>
                    <span className="text-emerald-700 font-medium">Complimentary ($0)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Swiss VAT &amp; Customs Duty:</span>
                    <span className="text-emerald-700 font-medium">Included ($0)</span>
                  </div>

                  <Separator className="my-2" />

                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-sm font-serif font-bold text-stone-900">
                      Total Investment:
                    </span>
                    <span className="text-2xl font-serif font-bold text-stone-900 font-mono">
                      ${totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-stone-400 space-y-1">
                  <p>✦ 120-Day Complimentary Resizing &amp; Polish</p>
                  <p>✦ Lifetime Atelier Gemological Warranty</p>
                  <p>✦ GIA / IGI Verified Laser Inscription</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* SUCCESS CONFIRMATION DIALOG */}
      {isSuccess && (
        <Dialog open={isSuccess} onOpenChange={setIsSuccess}>
          <DialogContent className="max-w-md bg-white p-8 rounded-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-2xl">
              ✓
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif font-bold text-stone-900">
                Bespoke Order Secured
              </DialogTitle>
              <DialogDescription className="text-xs text-stone-600 mt-2">
                Order confirmation #KYR-{(Math.random() * 89999 + 10000).toFixed(0)} has been generated. Your center diamond has been reserved in the Geneva vault.
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs text-left space-y-1.5 font-mono">
              <div>Client: <strong>{formData.firstName} {formData.lastName}</strong></div>
              <div>Ring: <strong>{diamond?.carat} ct {diamond?.shape} {setting?.title}</strong></div>
              <div>Metal: <strong>{metal.name}</strong> • Size <strong>{ringSize}</strong></div>
              <div>Total: <strong>${totalPrice.toLocaleString()}</strong></div>
            </div>

            <p className="text-xs text-stone-500 font-light">
              A private atelier advisor will contact you at {formData.email} within 2 hours to coordinate the certificate dossier and delivery dispatch.
            </p>

            <div className="pt-2 flex gap-3">
              <Button
                type="button"
                onClick={() => navigate('/')}
                className="w-full bg-stone-950 text-white text-xs uppercase tracking-wider font-semibold cursor-pointer"
              >
                Return to Atelier Home
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
