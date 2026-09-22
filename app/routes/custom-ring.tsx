import React from 'react';
import type {Route} from './+types/custom-ring';
import {useDiamondContext} from '~/context/DiamondFilterContext';
import {DiamondRingStepper} from '~/components/diamond/DiamondRingStepper';
import {DiamondSelectionStage} from '~/components/diamond/DiamondSelectionStage';
import {SettingSelectionStage} from '~/components/diamond/SettingSelectionStage';
import {CompleteRingStage} from '~/components/diamond/CompleteRingStage';
import {Button} from '~/components/ui/button';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Custom Ring Atelier | KYROS Haute Joaillerie'},
    {
      name: 'description',
      content:
        'Design your bespoke diamond engagement ring in 3 systematic stages. Pair certified GIA/IGI loose diamonds with masterfully crafted platinum and multi-karat gold settings.',
    },
  ];
};

export async function loader({request}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const step = url.searchParams.get('step') || 'diamond';
  const diamondId = url.searchParams.get('diamondId') || null;
  const settingId = url.searchParams.get('settingId') || null;

  return {
    initialStep: step,
    initialDiamondId: diamondId,
    initialSettingId: settingId,
  };
}

export default function CustomRingRoute() {
  const {
    stage,
    setStage,
    selectedDiamond,
    selectedSetting,
    totalInvestment,
    isCompleteReady,
  } = useDiamondContext();

  return (
    <div className="custom-ring-builder-page bg-stone-100/40 min-h-screen pb-24">
      {/* 1. Interactive 3-Stage Progress Stepper */}
      <DiamondRingStepper />

      {/* 2. Main Active Stage Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {stage === 'diamond' && <DiamondSelectionStage />}
        {stage === 'settings' && <SettingSelectionStage />}
        {stage === 'complete' && <CompleteRingStage />}
      </div>

      {/* 3. Floating Bottom Navigation Bar (Persistent on scroll) */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-stone-200 py-3 px-4 sm:px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold block">
                Total Custom Ring Investment
              </span>
              <span className="text-lg sm:text-xl font-serif font-bold text-stone-900 font-mono">
                ${totalInvestment > 0 ? totalInvestment.toLocaleString() : '0'}
              </span>
            </div>

            <div className="hidden sm:flex items-center space-x-2 text-xs text-stone-500 border-l border-stone-200 pl-4 font-serif">
              <span>{selectedDiamond ? `✓ ${selectedDiamond.carat}ct ${selectedDiamond.shape}` : '○ No Diamond'}</span>
              <span>•</span>
              <span>{selectedSetting ? `✓ ${selectedSetting.title}` : '○ No Setting'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {stage === 'diamond' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStage('settings')}
                className="text-xs uppercase tracking-wider font-semibold cursor-pointer border-stone-900 text-stone-900"
              >
                Skip to Settings &rarr;
              </Button>
            )}

            {stage === 'settings' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStage('diamond')}
                className="text-xs uppercase tracking-wider font-semibold cursor-pointer border-stone-900 text-stone-900"
              >
                &larr; Back to Diamonds
              </Button>
            )}

            {isCompleteReady && stage !== 'complete' && (
              <Button
                type="button"
                size="sm"
                onClick={() => setStage('complete')}
                className="bg-stone-950 hover:bg-stone-800 text-white text-xs uppercase tracking-widest font-semibold px-4 shadow cursor-pointer"
              >
                Finalize Ring &rarr;
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
