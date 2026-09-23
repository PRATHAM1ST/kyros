/**
 * Complete Diamond & Ring Gemological Data Specification for KYROS Haute Joaillerie
 * Covers every aspect of diamonds: The 4Cs, Lab Certification, Precise Proportions,
 * Finish & Symmetry, Millimeter Dimensions, Setting Anatomy, Metals, and Customization.
 */

export type DiamondShape =
  | 'Round'
  | 'Oval'
  | 'Emerald'
  | 'Radiant'
  | 'Cushion'
  | 'Pear'
  | 'Princess'
  | 'Asscher'
  | 'Marquise'
  | 'Heart';

export type CutGrade =
  | 'Super Ideal (Hearts & Arrows)'
  | 'Ideal'
  | 'Excellent'
  | 'Very Good'
  | 'Good';

export type ColorGrade =
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'Fancy Vivid Yellow'
  | 'Fancy Intense Pink';

export type ClarityGrade =
  | 'FL'
  | 'IF'
  | 'VVS1'
  | 'VVS2'
  | 'VS1'
  | 'VS2'
  | 'SI1'
  | 'SI2';

export type PolishGrade = 'Ideal' | 'Excellent' | 'Very Good' | 'Good';
export type SymmetryGrade = 'Ideal' | 'Excellent' | 'Very Good' | 'Good';
export type FluorescenceGrade = 'None' | 'Faint' | 'Medium' | 'Strong';
export type CuletGrade = 'None' | 'Very Small' | 'Small' | 'Medium';

export type DiamondOrigin =
  | 'Natural Mined (Conflict-Free)'
  | 'Lab-Grown (Renewable Type IIa)';

export type LabCertification = 'GIA' | 'IGI' | 'AGS' | 'GCAL';

export type PreciousMetal =
  | 'platinum'
  | '18k-yellow-gold'
  | '18k-rose-gold'
  | '18k-white-gold';

export type PreciousMetalType =
  | 'platinum'
  | 'yellow-gold'
  | 'white-gold'
  | 'rose-gold';

export type MetalKarat = '9k' | '14k' | '18k' | '22k' | '24k' | '950';

export interface MetalOption {
  id: string; // e.g. '18k-yellow-gold'
  metal: PreciousMetalType;
  karat: MetalKarat;
  name: string; // e.g. '18k Yellow Gold'
  shortName: string; // e.g. '18k YG'
  hexColor: string;
  purity: string; // e.g. '75.0% Au'
  priceAdjustment: number; // e.g. +350
}

export type SettingStyle =
  | 'solitaire'
  | 'halo'
  | 'hidden-halo'
  | 'pave'
  | 'three-stone'
  | 'bezel'
  | 'vintage'
  | 'cathedral'
  | 'toi-et-moi';

export interface DiamondProportions {
  tablePercentage: number; // e.g. 57.0 (%)
  depthPercentage: number; // e.g. 61.8 (%)
  crownAngle: number; // e.g. 34.5 (degrees)
  crownHeightPercentage: number; // e.g. 15.0 (%)
  pavilionAngle: number; // e.g. 40.8 (degrees)
  pavilionDepthPercentage: number; // e.g. 43.0 (%)
  girdle: string; // e.g. "Medium to Slightly Thick (Faceted)"
  culet: CuletGrade;
}

export interface DiamondFinish {
  polish: PolishGrade;
  symmetry: SymmetryGrade;
  fluorescence: FluorescenceGrade;
  opticalSymmetry?: string; // e.g. "Certified Hearts & Arrows Pattern"
  sparkleScore?: {
    brilliance: number; // 0 - 100
    fire: number; // 0 - 100
    scintillation: number; // 0 - 100
  };
}

export interface DiamondMeasurements {
  lengthMm: number; // e.g. 8.12 mm
  widthMm: number; // e.g. 5.76 mm
  depthMm: number; // e.g. 3.56 mm
  ratio: number; // length / width ratio (e.g. 1.41)
}

export interface DiamondCertification {
  lab: LabCertification;
  certificateNumber: string; // e.g. "GIA-2489104820"
  issueDate: string;
  laserInscription: string; // e.g. "GIA 2489104820"
  reportUrl?: string;
  verificationBadge: string;
}

export interface AccentStones {
  count: number;
  totalCaratWeight: number; // ctw
  color: string;
  clarity: string;
  shape: DiamondShape;
  description: string;
}

export interface RingSettingSpecs {
  styleName: string;
  styleCategory: SettingStyle;
  prongCount: 4 | 6 | 0; // 0 for bezel
  prongStyle: 'Claw Prongs' | 'Petal Prongs' | 'Round Prongs' | 'Compass Prongs' | 'Full Bezel' | 'Semi-Bezel';
  bandWidthMm: number; // e.g. 1.8 mm
  metalsAvailable: PreciousMetal[];
  defaultMetal: PreciousMetal;
  accentStones?: AccentStones;
  ringSizesAvailable: number[]; // e.g. [4.0, 4.5, 5.0, ..., 10.0]
  profileHeightMm: number; // e.g. 6.2 mm
  galleryType: 'Hidden Halo' | 'Cathedral Arches' | 'Tulip Basket' | 'Open Floating' | 'Vintage Milgrain';
}

export interface CaratVariationOption {
  carat: number;
  centerDiamondPrice: number;
  specs: {
    measurements: DiamondMeasurements;
    proportions: DiamondProportions;
    certificateNumber: string;
  };
}

export interface MetalAssetMap {
  [metal: string]: {
    name: string;
    hexColor: string;
    primaryImage: string;
    sideImage: string;
    onHandImage?: string;
  };
}

export interface DiamondProduct {
  id: string;
  handle: string;
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  storyHtml: string;
  isBestseller?: boolean;
  isNew?: boolean;
  featuredOrder: number;

  // Diamond Gemological Core Data
  diamond: {
    shape: DiamondShape;
    carat: number; // default featured carat
    cutGrade: CutGrade;
    colorGrade: ColorGrade;
    clarityGrade: ClarityGrade;
    origin: DiamondOrigin;
    certification: DiamondCertification;
    proportions: DiamondProportions;
    finish: DiamondFinish;
    measurements: DiamondMeasurements;
  };

  // Setting Anatomy
  setting: RingSettingSpecs;

  // Carat variations
  caratOptions: CaratVariationOption[];

  // Pricing Structure
  pricing: {
    settingPrice: number;
    defaultDiamondPrice: number;
    centerDiamondPrice?: number;
    totalPrice: number;
    compareAtPrice?: number;
    currency: string;
  };

  // Visual Imagery
  images: {
    primary: string;
    faceUp: string;
    sideProfile: string;
    angle45: string;
    onHand: string;
    certificatePreview: string;
    macroDiamond?: string;
    secondary?: string;
    certificate?: string;
    gallery?: string[];
  };

  // Metal visual mapping
  metalAssets: MetalAssetMap;

  // Shopify compatibility
  tags: string[];
  shopifyVariantId?: string;
}

export interface LooseDiamond {
  id: string;
  stockNumber: string;
  origin: 'natural' | 'lab-grown';
  shape: DiamondShape;
  carat: number;
  cutGrade: CutGrade;
  colorGrade: ColorGrade;
  clarityGrade: ClarityGrade;
  certification: {
    lab: 'GIA' | 'IGI' | 'AGS';
    certificateNumber: string;
    issueDate: string;
    laserInscription: string;
    reportUrl?: string;
  };
  pricing: {
    price: number;
    compareAtPrice?: number;
  };
  proportions: DiamondProportions;
  finish: DiamondFinish;
  measurements: DiamondMeasurements;
  image: string;
  video360Url?: string;
  isBestseller?: boolean;
  shopifyVariantId?: string;
}

export interface RingSetting {
  id: string;
  handle: string;
  title: string;
  subtitle: string;
  styleCategory: SettingStyle;
  description: string;
  basePrice: number;
  availableMetals: MetalOption[];
  defaultMetal: MetalOption;
  compatibleShapes: DiamondShape[];
  prongCount: number;
  prongStyles: string[];
  defaultProngStyle: string;
  bandWidthsMm: number[];
  defaultBandWidthMm: number;
  ringSizesAvailable: number[];
  images: Record<string, string>; // metalId -> image
  featuredOrder: number;
  shopifyVariantId?: string;
}

export interface CustomRingSelection {
  stage: 'diamond' | 'settings' | 'complete';
  flow: 'diamond-first' | 'setting-first';
  diamond: LooseDiamond | null;
  setting: RingSetting | null;
  metal: MetalOption;
  ringSize: number;
  prongStyle: string;
  bandWidthMm: number;
  engraving: {
    text: string;
    font: 'Script' | 'Serif' | 'Block';
  };
}

export interface DiamondFilterState {
  originTab: 'all' | 'natural' | 'lab-grown';
  shapes: DiamondShape[];
  metals: PreciousMetal[];
  settingStyles: SettingStyle[];
  caratMin: number;
  caratMax: number;
  priceMin: number;
  priceMax: number;
  cutGrades: CutGrade[];
  colorGrades: ColorGrade[];
  clarityGrades: ClarityGrade[];
  origins: DiamondOrigin[];
  searchQuery?: string;

  // Extended Advanced Gemological Filters
  labs: ('GIA' | 'IGI' | 'AGS')[];
  reportNumberQuery?: string;
  tableMin: number;
  tableMax: number;
  depthMin: number;
  depthMax: number;
  ratioMin: number;
  ratioMax: number;
  polishGrades: PolishGrade[];
  symmetryGrades: SymmetryGrade[];
  fluorescenceGrades: FluorescenceGrade[];
}

export interface SettingFilterState {
  styles: SettingStyle[];
  metalTypes: PreciousMetalType[];
  karats: MetalKarat[];
  shapes: DiamondShape[];
  priceMin: number;
  priceMax: number;
  viewMode: 'guided' | 'all';
  guidedStep: number;
}

export type DiamondSortOption =
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'carat-desc'
  | 'carat-asc'
  | 'cut-desc';
