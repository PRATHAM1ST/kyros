import React, {useState} from 'react';
import type {DiamondProduct} from '~/types/diamond';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '~/components/ui/dialog';
import {Button} from '~/components/ui/button';
import {Badge} from '~/components/ui/badge';
import {Card, CardContent} from '~/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '~/components/ui/table';

interface DiamondSpecsDrawerProps {
  product: DiamondProduct;
  selectedCarat?: number;
}

export function DiamondSpecsDrawer({
  product,
  selectedCarat,
}: DiamondSpecsDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Use active carat option specs if selected
  const activeCaratOption = product.caratOptions.find(
    (c) => c.carat === selectedCarat,
  );

  const diamond = product.diamond;
  const proportions =
    activeCaratOption?.specs.proportions || diamond.proportions;
  const measurements =
    activeCaratOption?.specs.measurements || diamond.measurements;
  const certNumber =
    activeCaratOption?.specs.certificateNumber ||
    diamond.certification.certificateNumber;
  const displayCarat = selectedCarat || diamond.carat;

  return (
    <div className="diamond-specs-section my-6">
      {/* Trigger Button with shadcn Button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="w-full h-auto flex items-center justify-between p-4 bg-stone-50 border border-stone-200 rounded-lg hover:border-stone-900 transition-all text-left group cursor-pointer"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-stone-900 text-amber-100 flex items-center justify-center font-serif text-sm tracking-wider font-semibold shrink-0">
            {diamond.certification.lab}
          </div>
          <div>
            <div className="text-sm font-medium text-stone-900 flex items-center space-x-2">
              <span>View Gemological Certificate &amp; Diamond Specs</span>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] py-0 px-2">
                Verified
              </Badge>
            </div>
            <p className="text-xs text-stone-500 font-normal mt-0.5">
              {diamond.certification.lab} Report #{certNumber} • Table{' '}
              {proportions.tablePercentage}% • Depth{' '}
              {proportions.depthPercentage}%
            </p>
          </div>
        </div>
        <div className="text-stone-400 group-hover:text-stone-900 transition-colors shrink-0">
          <svg
            className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </Button>

      {/* shadcn Dialog Component */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-stone-200 rounded-2xl bg-white">
          {/* Header */}
          <DialogHeader className="p-6 border-b border-stone-800 bg-stone-950 text-white rounded-t-2xl">
            <div className="flex items-center space-x-3 mb-1">
              <Badge variant="outline" className="border-amber-400/40 text-amber-300 bg-amber-400/10 font-serif font-semibold text-xs">
                {diamond.certification.lab} CERTIFIED
              </Badge>
            </div>
            <DialogTitle className="text-xl font-serif text-white tracking-wide">
              Gemological Report &amp; Optical Anatomy
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-400">
              Official laboratory evaluation for GIA Report #{certNumber}
            </DialogDescription>
          </DialogHeader>

          {/* Body Content */}
          <div className="p-6 space-y-6 text-stone-800">
            {/* Certificate Summary Card */}
            <Card className="bg-stone-50 border-stone-200 rounded-xl shadow-none">
              <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-stone-500 font-medium font-serif">
                    Grading Lab &amp; Report ID
                  </span>
                  <div className="text-base font-semibold text-stone-900 font-mono">
                    {certNumber}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    Inscribed: &ldquo;{diamond.certification.laserInscription}&rdquo; on girdle
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="text-xs uppercase tracking-wider text-stone-500 font-medium font-serif">
                      Diamond Origin
                    </span>
                    <div className="text-sm font-semibold text-stone-900">
                      {diamond.origin}
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg border border-emerald-200">
                    ✓
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* The 4Cs Primary Grid */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-stone-400 font-semibold font-serif mb-3">
                The Four Cs Analysis
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="bg-stone-50 border-stone-200 shadow-none">
                  <CardContent className="p-3">
                    <div className="text-xs text-stone-500">Carat Weight</div>
                    <div className="text-lg font-serif font-bold text-stone-900">
                      {displayCarat} ct
                    </div>
                    <div className="text-[11px] text-stone-400">Exact Weight</div>
                  </CardContent>
                </Card>

                <Card className="bg-stone-50 border-stone-200 shadow-none">
                  <CardContent className="p-3">
                    <div className="text-xs text-stone-500">Cut Grade</div>
                    <div className="text-sm font-bold text-stone-900 mt-0.5">
                      {diamond.cutGrade}
                    </div>
                    <Badge variant="secondary" className="text-[10px] text-emerald-800 bg-emerald-50 border-emerald-200 mt-1">
                      Top 1% Cut Score
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="bg-stone-50 border-stone-200 shadow-none">
                  <CardContent className="p-3">
                    <div className="text-xs text-stone-500">Color Grade</div>
                    <div className="text-lg font-serif font-bold text-stone-900">
                      Grade {diamond.colorGrade}
                    </div>
                    <div className="text-[11px] text-stone-400">Completely Colorless</div>
                  </CardContent>
                </Card>

                <Card className="bg-stone-50 border-stone-200 shadow-none">
                  <CardContent className="p-3">
                    <div className="text-xs text-stone-500">Clarity Grade</div>
                    <div className="text-lg font-serif font-bold text-stone-900">
                      {diamond.clarityGrade}
                    </div>
                    <div className="text-[11px] text-stone-400">Microscopic Purity</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Proportions & Facet Geometry Table using shadcn Table */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-stone-400 font-semibold font-serif mb-3">
                Optical Proportions &amp; Angles
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-stone-200 overflow-hidden shadow-none">
                  <Table>
                    <TableBody>
                      <TableRow className="bg-stone-50/50">
                        <TableCell className="px-3 py-2 text-stone-500 font-medium">Table Percentage</TableCell>
                        <TableCell className="px-3 py-2 text-stone-900 font-semibold text-right">{proportions.tablePercentage}%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="px-3 py-2 text-stone-500 font-medium">Depth Percentage</TableCell>
                        <TableCell className="px-3 py-2 text-stone-900 font-semibold text-right">{proportions.depthPercentage}%</TableCell>
                      </TableRow>
                      <TableRow className="bg-stone-50/50">
                        <TableCell className="px-3 py-2 text-stone-500 font-medium">Crown Angle &amp; Height</TableCell>
                        <TableCell className="px-3 py-2 text-stone-900 font-semibold text-right">{proportions.crownAngle}° / {proportions.crownHeightPercentage}%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="px-3 py-2 text-stone-500 font-medium">Pavilion Angle &amp; Depth</TableCell>
                        <TableCell className="px-3 py-2 text-stone-900 font-semibold text-right">{proportions.pavilionAngle}° / {proportions.pavilionDepthPercentage}%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Card>

                <Card className="border-stone-200 overflow-hidden shadow-none">
                  <Table>
                    <TableBody>
                      <TableRow className="bg-stone-50/50">
                        <TableCell className="px-3 py-2 text-stone-500 font-medium">Girdle Thickness</TableCell>
                        <TableCell className="px-3 py-2 text-stone-900 font-semibold text-right">{proportions.girdle}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="px-3 py-2 text-stone-500 font-medium">Culet</TableCell>
                        <TableCell className="px-3 py-2 text-stone-900 font-semibold text-right">{proportions.culet}</TableCell>
                      </TableRow>
                      <TableRow className="bg-stone-50/50">
                        <TableCell className="px-3 py-2 text-stone-500 font-medium">Millimeter Dimensions</TableCell>
                        <TableCell className="px-3 py-2 text-stone-900 font-semibold text-right">
                          {measurements.lengthMm} × {measurements.widthMm} × {measurements.depthMm} mm
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="px-3 py-2 text-stone-500 font-medium">Length-to-Width Ratio</TableCell>
                        <TableCell className="px-3 py-2 text-stone-900 font-semibold text-right">{measurements.ratio} : 1</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Card>
              </div>
            </div>

            {/* Finish, Polish & Fluorescence */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-stone-400 font-semibold font-serif mb-3">
                Finish, Polish &amp; Fluorescence
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <Card className="bg-stone-50 border-stone-200 text-center shadow-none">
                  <CardContent className="p-3">
                    <div className="text-[11px] text-stone-500">Polish</div>
                    <div className="text-sm font-semibold text-stone-900 mt-0.5">{diamond.finish.polish}</div>
                  </CardContent>
                </Card>
                <Card className="bg-stone-50 border-stone-200 text-center shadow-none">
                  <CardContent className="p-3">
                    <div className="text-[11px] text-stone-500">Symmetry</div>
                    <div className="text-sm font-semibold text-stone-900 mt-0.5">{diamond.finish.symmetry}</div>
                  </CardContent>
                </Card>
                <Card className="bg-stone-50 border-stone-200 text-center shadow-none">
                  <CardContent className="p-3">
                    <div className="text-[11px] text-stone-500">Fluorescence</div>
                    <div className="text-sm font-semibold text-stone-900 mt-0.5">{diamond.finish.fluorescence}</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Ring Setting Anatomy */}
            <Card className="bg-amber-50/60 border-amber-200/60 shadow-none">
              <CardContent className="p-4">
                <h4 className="text-xs uppercase tracking-wider text-amber-900 font-semibold font-serif mb-2">
                  Ring Setting Engineering
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-amber-950">
                  <div>
                    <span className="text-stone-500">Band Width:</span>{' '}
                    <strong>{product.setting.bandWidthMm} mm</strong>
                  </div>
                  <div>
                    <span className="text-stone-500">Prong Style:</span>{' '}
                    <strong>{product.setting.prongStyle}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500">Prongs Count:</span>{' '}
                    <strong>{product.setting.prongCount || 'Bezel'}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500">Profile Height:</span>{' '}
                    <strong>{product.setting.profileHeightMm} mm</strong>
                  </div>
                </div>
                {product.setting.accentStones && (
                  <p className="text-xs text-amber-900/80 mt-2">
                    * Side stones: {product.setting.accentStones.count} diamonds (
                    {product.setting.accentStones.totalCaratWeight} ctw,{' '}
                    {product.setting.accentStones.color} Color,{' '}
                    {product.setting.accentStones.clarity} Clarity)
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between rounded-b-2xl">
            <span className="text-xs text-stone-500">
              Kimberley Process Certified • 100% Conflict-Free Natural Origin
            </span>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              Close Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
