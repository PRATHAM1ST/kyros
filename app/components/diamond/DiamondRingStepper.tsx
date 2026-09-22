import React from 'react';
import {useDiamondContext} from '~/context/DiamondFilterContext';
import {DiamondShapeIcon} from './DiamondShapeIcons';
import {RingStyleIcon} from './RingStyleIcons';
import {Badge} from '~/components/ui/badge';
import {Button} from '~/components/ui/button';

export function DiamondRingStepper() {
  const {
    stage,
    flow,
    setStage,
    setFlow,
    selectedDiamond,
    selectedSetting,
    selectedMetal,
    clearDiamond,
    clearSetting,
    totalInvestment,
    isCompleteReady,
  } = useDiamondContext();

  const diamondFirst = flow === 'diamond-first';

  const diamondStepNum = diamondFirst ? 1 : 2;
  const settingStepNum = diamondFirst ? 2 : 1;
  const completeStepNum = 3;

  return (
    <div className="diamond-ring-stepper sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm transition-all py-3 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* STEP A: DIAMOND */}
          <div
            onClick={() => setStage('diamond')}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
              stage === 'diamond'
                ? 'border-stone-900 bg-stone-50/90 shadow-sm ring-1 ring-stone-900'
                : selectedDiamond
                ? 'border-stone-200 bg-white hover:border-stone-300'
                : 'border-dashed border-stone-200 bg-stone-50/50 hover:bg-stone-50'
            }`}
          >
            <div className="flex items-center space-x-3 min-w-0">
              {/* Step indicator circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-serif font-bold transition-all ${
                  selectedDiamond
                    ? 'bg-amber-800 text-amber-100'
                    : stage === 'diamond'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-200 text-stone-600'
                }`}
              >
                {selectedDiamond ? '✓' : diamondStepNum}
              </div>

              {/* Diamond Info */}
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] uppercase tracking-widest text-stone-500 font-serif font-semibold">
                    Step {diamondStepNum}: Center Diamond
                  </span>
                  {selectedDiamond && (
                    <Badge variant="outline" className="text-[9px] py-0 px-1 font-mono bg-amber-50 text-amber-900 border-amber-300">
                      {selectedDiamond.certification.lab}
                    </Badge>
                  )}
                </div>

                {selectedDiamond ? (
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="w-4 h-4 text-amber-800 shrink-0">
                      <DiamondShapeIcon shape={selectedDiamond.shape} size={16} />
                    </span>
                    <p className="text-xs font-serif font-bold text-stone-900 truncate">
                      {selectedDiamond.carat} ct {selectedDiamond.shape} ({selectedDiamond.colorGrade}/{selectedDiamond.clarityGrade})
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-stone-500 font-serif italic mt-0.5">
                    Choose Center Diamond
                  </p>
                )}
              </div>
            </div>

            {/* Price & Change Action */}
            <div className="flex flex-col items-end shrink-0 pl-2">
              {selectedDiamond ? (
                <>
                  <span className="text-xs font-mono font-bold text-stone-900">
                    ${selectedDiamond.pricing.price.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearDiamond();
                      setStage('diamond');
                    }}
                    className="text-[10px] text-stone-400 hover:text-stone-900 underline cursor-pointer mt-0.5"
                  >
                    Change
                  </button>
                </>
              ) : (
                <span className="text-[10px] text-stone-400 font-sans">
                  {stage === 'diamond' ? 'Selecting...' : 'Select'}
                </span>
              )}
            </div>
          </div>

          {/* STEP B: SETTING */}
          <div
            onClick={() => setStage('settings')}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
              stage === 'settings'
                ? 'border-stone-900 bg-stone-50/90 shadow-sm ring-1 ring-stone-900'
                : selectedSetting
                ? 'border-stone-200 bg-white hover:border-stone-300'
                : 'border-dashed border-stone-200 bg-stone-50/50 hover:bg-stone-50'
            }`}
          >
            <div className="flex items-center space-x-3 min-w-0">
              {/* Step indicator circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-serif font-bold transition-all ${
                  selectedSetting
                    ? 'bg-amber-800 text-amber-100'
                    : stage === 'settings'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-200 text-stone-600'
                }`}
              >
                {selectedSetting ? '✓' : settingStepNum}
              </div>

              {/* Setting Info */}
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] uppercase tracking-widest text-stone-500 font-serif font-semibold">
                    Step {settingStepNum}: Ring Setting
                  </span>
                  {selectedSetting && (
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-stone-300 shrink-0 inline-block"
                      style={{backgroundColor: selectedMetal.hexColor}}
                      title={selectedMetal.name}
                    />
                  )}
                </div>

                {selectedSetting ? (
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="w-4 h-4 text-stone-700 shrink-0">
                      <RingStyleIcon style={selectedSetting.styleCategory} size={16} />
                    </span>
                    <p className="text-xs font-serif font-bold text-stone-900 truncate">
                      {selectedSetting.title} ({selectedMetal.shortName})
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-stone-500 font-serif italic mt-0.5">
                    Choose Atelier Setting
                  </p>
                )}
              </div>
            </div>

            {/* Price & Change Action */}
            <div className="flex flex-col items-end shrink-0 pl-2">
              {selectedSetting ? (
                <>
                  <span className="text-xs font-mono font-bold text-stone-900">
                    ${(selectedSetting.basePrice + (selectedMetal.priceAdjustment || 0)).toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearSetting();
                      setStage('settings');
                    }}
                    className="text-[10px] text-stone-400 hover:text-stone-900 underline cursor-pointer mt-0.5"
                  >
                    Change
                  </button>
                </>
              ) : (
                <span className="text-[10px] text-stone-400 font-sans">
                  {stage === 'settings' ? 'Selecting...' : 'Select'}
                </span>
              )}
            </div>
          </div>

          {/* STEP C: COMPLETE THE RING */}
          <div
            onClick={() => {
              if (isCompleteReady) {
                setStage('complete');
              }
            }}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
              stage === 'complete'
                ? 'border-stone-900 bg-stone-900 text-white shadow-md'
                : isCompleteReady
                ? 'border-amber-300 bg-amber-50/40 hover:bg-amber-50 cursor-pointer text-stone-900'
                : 'border-dashed border-stone-200 bg-stone-50/40 text-stone-400 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center space-x-3 min-w-0">
              {/* Step indicator */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-serif font-bold ${
                  stage === 'complete'
                    ? 'bg-amber-400 text-stone-950 font-bold'
                    : isCompleteReady
                    ? 'bg-amber-800 text-amber-100'
                    : 'bg-stone-200 text-stone-400'
                }`}
              >
                {completeStepNum}
              </div>

              <div className="min-w-0">
                <span className={`text-[10px] uppercase tracking-widest font-serif font-semibold block ${stage === 'complete' ? 'text-amber-200' : 'text-stone-500'}`}>
                  Step 3: Complete Custom Ring
                </span>
                <p className={`text-xs font-serif font-bold truncate mt-0.5 ${stage === 'complete' ? 'text-white' : isCompleteReady ? 'text-stone-900' : 'text-stone-400 italic'}`}>
                  {isCompleteReady ? 'Ready for Customization' : 'Select Diamond & Setting'}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0 pl-2">
              {isCompleteReady ? (
                <>
                  <span className={`text-xs font-mono font-bold ${stage === 'complete' ? 'text-amber-300' : 'text-stone-900'}`}>
                    ${totalInvestment.toLocaleString()}
                  </span>
                  <span className={`text-[10px] font-sans ${stage === 'complete' ? 'text-stone-300' : 'text-amber-800 font-semibold'}`}>
                    {stage === 'complete' ? 'Finalizing' : 'Review &rarr;'}
                  </span>
                </>
              ) : (
                <span className="text-[10px] text-stone-400 font-sans">Pending</span>
              )}
            </div>
          </div>
        </div>

        {/* Quick flow reversal switcher if user hasn't finished yet */}
        <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-100 text-[11px] text-stone-500">
          <div className="flex items-center space-x-2">
            <span>Entry Order:</span>
            <button
              type="button"
              onClick={() => setFlow('diamond-first')}
              className={`hover:text-stone-900 cursor-pointer font-serif ${diamondFirst ? 'font-bold text-stone-900 underline' : 'text-stone-400'}`}
            >
              Start with Diamond
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setFlow('setting-first')}
              className={`hover:text-stone-900 cursor-pointer font-serif ${!diamondFirst ? 'font-bold text-stone-900 underline' : 'text-stone-400'}`}
            >
              Start with Setting
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {isCompleteReady && stage !== 'complete' && (
              <Button
                type="button"
                size="xs"
                variant="default"
                onClick={() => setStage('complete')}
                className="bg-stone-900 hover:bg-stone-800 text-white rounded text-[10px] uppercase tracking-wider font-semibold cursor-pointer h-6 px-2.5"
              >
                Proceed to Finalize Ring &rarr;
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
