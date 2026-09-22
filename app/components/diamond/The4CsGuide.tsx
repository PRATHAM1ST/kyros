import React from 'react';
import {Tabs, TabsList, TabsTrigger, TabsContent} from '~/components/ui/tabs';
import {Card, CardContent} from '~/components/ui/card';
import {Badge} from '~/components/ui/badge';

export function The4CsGuide() {
  return (
    <section className="the-4cs-masterclass py-16 px-4 bg-stone-900 text-stone-100 rounded-2xl my-16 border border-stone-800">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge variant="outline" className="text-amber-400 border-amber-400/40 bg-amber-400/10 font-serif tracking-widest text-xs uppercase font-semibold">
            KYROS Gemological Institute
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-serif text-white tracking-wide mt-3">
            The Masterclass: The 4Cs of Diamonds
          </h2>
          <p className="text-sm text-stone-400 mt-3 font-light leading-relaxed">
            Every diamond in the KYROS atelier is individually hand-selected and verified under GIA standards. Discover how the Four Cs determine the rarity, optical fire, and value of your stone.
          </p>
        </div>

        {/* shadcn Tabs Container */}
        <Tabs defaultValue="cut" className="w-full">
          <div className="flex justify-center mb-8 overflow-x-auto">
            <TabsList className="bg-stone-950/80 border border-stone-800 p-1 rounded-xl">
              <TabsTrigger value="cut" className="text-xs sm:text-sm font-medium tracking-wider uppercase px-4 py-2 text-stone-400 data-[state=active]:text-amber-300 data-[state=active]:bg-stone-900">
                1. Cut (Light Physics)
              </TabsTrigger>
              <TabsTrigger value="color" className="text-xs sm:text-sm font-medium tracking-wider uppercase px-4 py-2 text-stone-400 data-[state=active]:text-amber-300 data-[state=active]:bg-stone-900">
                2. Color (Purity Spectrum)
              </TabsTrigger>
              <TabsTrigger value="clarity" className="text-xs sm:text-sm font-medium tracking-wider uppercase px-4 py-2 text-stone-400 data-[state=active]:text-amber-300 data-[state=active]:bg-stone-900">
                3. Clarity (Internal Purity)
              </TabsTrigger>
              <TabsTrigger value="carat" className="text-xs sm:text-sm font-medium tracking-wider uppercase px-4 py-2 text-stone-400 data-[state=active]:text-amber-300 data-[state=active]:bg-stone-900">
                4. Carat (Weight &amp; Scale)
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Cut Panel */}
          <TabsContent value="cut">
            <Card className="bg-stone-950 border-stone-800 text-stone-100 rounded-xl shadow-none">
              <CardContent className="p-6 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <Badge variant="outline" className="bg-amber-400/20 text-amber-300 border-amber-400/30 text-xs font-medium">
                      The Most Critical Attribute
                    </Badge>
                    <h3 className="text-2xl font-serif text-white mt-3 mb-2">
                      Diamond Cut &amp; Facet Light Physics
                    </h3>
                    <p className="text-sm text-stone-300 leading-relaxed font-light mb-4">
                      While nature dictates diamond color and clarity, cut is the artistry of human craftsmanship. Cut determines how efficiently the diamond gathers light from above, reflects it internally across its pavilion facets, and refracts it back to the observer&apos;s eye as pure brilliance and rainbow fire.
                    </p>
                    <div className="space-y-2 text-xs text-stone-300">
                      <div className="flex items-center space-x-2">
                        <span className="text-amber-400">✦</span>
                        <strong>Super Ideal (Hearts &amp; Arrows):</strong> Top 0.1% optical symmetry with calibrated table (54-57%) and pavilion angle (40.6°-40.9°).
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-amber-400">✦</span>
                        <strong>Ideal / Excellent:</strong> Maximum light return with zero light leakage through the bottom facets.
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-amber-400">✦</span>
                        <strong>KYROS Guarantee:</strong> We exclusively curate Ideal and Super Ideal cuts.
                      </div>
                    </div>
                  </div>

                  <div className="bg-stone-900/60 p-5 rounded-lg border border-stone-800">
                    <div className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-4">
                      Light Return Ray-Tracing Comparison
                    </div>
                    <div className="space-y-4">
                      <div className="p-3 bg-stone-950 rounded border border-emerald-900/40">
                        <div className="flex justify-between text-xs font-semibold text-emerald-400">
                          <span>Ideal Proportion Cut</span>
                          <span>100% Light Return</span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-1">
                          Light enters through the crown, bounces cleanly off both pavilion walls, and exits directly back to the eye as dazzling white brilliance and colored flashes.
                        </p>
                      </div>
                      <div className="p-3 bg-stone-950 rounded border border-red-950/40">
                        <div className="flex justify-between text-xs font-semibold text-red-400">
                          <span>Too Shallow or Deep Cut</span>
                          <span>Light Leakage</span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-1">
                          Light strikes pavilion angles too steep or flat and escapes through the sides or bottom, causing the diamond to appear dull, glassy, or dark in the center.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Color Panel */}
          <TabsContent value="color">
            <Card className="bg-stone-950 border-stone-800 text-stone-100 rounded-xl shadow-none">
              <CardContent className="p-6 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <Badge variant="outline" className="bg-amber-400/20 text-amber-300 border-amber-400/30 text-xs font-medium">
                      GIA Color Alphabetical Scale
                    </Badge>
                    <h3 className="text-2xl font-serif text-white mt-3 mb-2">
                      From Ice-White D to Warm Candlelight
                    </h3>
                    <p className="text-sm text-stone-300 leading-relaxed font-light mb-4">
                      The GIA color grading scale ranges from D (completely colorless and icy white) to Z (noticeable light yellow or brown). Truly colorless diamonds act like pristine glass prisms, showing zero body color and transmitting maximum spectral fire.
                    </p>
                    <div className="space-y-2 text-xs text-stone-300">
                      <div className="flex items-center space-x-2">
                        <span className="text-amber-400">✦</span>
                        <strong>D - F (Colorless):</strong> Ultra-rare icy white. Indistinguishable in appearance to all but gemological masters.
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-amber-400">✦</span>
                        <strong>G - H (Near Colorless):</strong> Exceptional visual value, appearing face-up bright and colorless once mounted in platinum or gold.
                      </div>
                    </div>
                  </div>

                  <div className="bg-stone-900/60 p-5 rounded-lg border border-stone-800">
                    <div className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-4">
                      Visual Color Tier Gradient
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-3 bg-stone-950 rounded border border-amber-400/40">
                        <div className="text-lg font-serif font-bold text-white">D</div>
                        <div className="text-[10px] text-amber-300 mt-1">Absolute Icy</div>
                      </div>
                      <div className="p-3 bg-stone-950 rounded border border-stone-800">
                        <div className="text-lg font-serif font-bold text-white">E - F</div>
                        <div className="text-[10px] text-stone-400 mt-1">Colorless</div>
                      </div>
                      <div className="p-3 bg-stone-950 rounded border border-stone-800">
                        <div className="text-lg font-serif font-bold text-white">G - H</div>
                        <div className="text-[10px] text-stone-400 mt-1">Near Colorless</div>
                      </div>
                      <div className="p-3 bg-stone-950 rounded border border-stone-800">
                        <div className="text-lg font-serif font-bold text-stone-400">I - J</div>
                        <div className="text-[10px] text-stone-500 mt-1">Warm Tint</div>
                      </div>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-4 italic text-center">
                      KYROS settings in platinum feature D-F diamonds to guarantee maximum crisp chromatic contrast.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clarity Panel */}
          <TabsContent value="clarity">
            <Card className="bg-stone-950 border-stone-800 text-stone-100 rounded-xl shadow-none">
              <CardContent className="p-6 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <Badge variant="outline" className="bg-amber-400/20 text-amber-300 border-amber-400/30 text-xs font-medium">
                      Internal Purity &amp; Inclusions
                    </Badge>
                    <h3 className="text-2xl font-serif text-white mt-3 mb-2">
                      Microscopic Crystallization
                    </h3>
                    <p className="text-sm text-stone-300 leading-relaxed font-light mb-4">
                      Natural diamonds were formed over a billion years ago deep in the Earth&apos;s mantle under extreme heat and pressure. Inclusions are microscopic birthmarks trapped inside the carbon crystal lattice.
                    </p>
                    <div className="space-y-2 text-xs text-stone-300">
                      <div className="flex items-center space-x-2">
                        <span className="text-amber-400">✦</span>
                        <strong>FL / IF (Flawless):</strong> Zero inclusions under 10x magnification. Extremely rare (under 0.1% of global gem supply).
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-amber-400">✦</span>
                        <strong>VVS1 - VVS2:</strong> Inclusions are so microscopic that even trained gemologists struggle to locate them under 10x binocular microscopes.
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-amber-400">✦</span>
                        <strong>VS1 - VS2:</strong> Eye-clean to the naked eye. The sweet spot of luxury prestige and optical perfection.
                      </div>
                    </div>
                  </div>

                  <div className="bg-stone-900/60 p-5 rounded-lg border border-stone-800 space-y-3">
                    <div className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-2">
                      Clarity Tiers in KYROS Rings
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-stone-950 rounded border border-stone-800 text-xs">
                      <div>
                        <span className="font-semibold text-white">FL / IF</span>
                        <span className="text-stone-400 ml-2">Flawless</span>
                      </div>
                      <span className="text-amber-400 text-[11px]">Museum Grade</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-stone-950 rounded border border-stone-800 text-xs">
                      <div>
                        <span className="font-semibold text-white">VVS1 - VVS2</span>
                        <span className="text-stone-400 ml-2">Very Very Slightly Included</span>
                      </div>
                      <span className="text-emerald-400 text-[11px]">KYROS Preferred</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-stone-950 rounded border border-stone-800 text-xs">
                      <div>
                        <span className="font-semibold text-white">VS1 - VS2</span>
                        <span className="text-stone-400 ml-2">Very Slightly Included</span>
                      </div>
                      <span className="text-stone-400 text-[11px]">100% Eye-Clean</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Carat Panel */}
          <TabsContent value="carat">
            <Card className="bg-stone-950 border-stone-800 text-stone-100 rounded-xl shadow-none">
              <CardContent className="p-6 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <Badge variant="outline" className="bg-amber-400/20 text-amber-300 border-amber-400/30 text-xs font-medium">
                      Weight &amp; Millimeter Dimension
                    </Badge>
                    <h3 className="text-2xl font-serif text-white mt-3 mb-2">
                      Carat Weight vs. Visual Spread
                    </h3>
                    <p className="text-sm text-stone-300 leading-relaxed font-light mb-4">
                      One carat equals 0.200 grams. However, carat is a measurement of weight, not physical size. A properly cut diamond carries its weight across its face-up diameter rather than being hidden in a deep, heavy belly.
                    </p>
                    <div className="space-y-2 text-xs text-stone-300">
                      <div className="flex items-center space-x-2">
                        <span className="text-amber-400">✦</span>
                        <strong>Visual Spread:</strong> Shapes like Oval, Emerald, and Pear offer larger surface area millimeter spread per carat than round cuts.
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-amber-400">✦</span>
                        <strong>Magic Milestones:</strong> 1.00 ct, 1.50 ct, 2.00 ct, and 3.00 ct are classic milestone weights with exponential value curves.
                      </div>
                    </div>
                  </div>

                  <div className="bg-stone-900/60 p-5 rounded-lg border border-stone-800">
                    <div className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-4">
                      Standard Round Face-Up Diameters
                    </div>
                    <div className="space-y-2.5 text-xs">
                      {[
                        {ct: '1.00 ct', mm: '6.5 mm', coverage: '39% of size 6 finger'},
                        {ct: '1.50 ct', mm: '7.4 mm', coverage: '45% of size 6 finger'},
                        {ct: '2.00 ct', mm: '8.1 mm', coverage: '49% of size 6 finger'},
                        {ct: '2.50 ct', mm: '8.8 mm', coverage: '53% of size 6 finger'},
                        {ct: '3.00 ct', mm: '9.4 mm', coverage: '57% of size 6 finger'},
                      ].map((row) => (
                        <div
                          key={row.ct}
                          className="flex items-center justify-between p-2 bg-stone-950 rounded border border-stone-800"
                        >
                          <span className="font-semibold text-white">{row.ct}</span>
                          <span className="font-mono text-amber-300">{row.mm}</span>
                          <span className="text-stone-400 text-[11px]">{row.coverage}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
