export interface JewelryDetails {
  metal: string;
  stones: string[];
  cut: string;
  style: string;
  description: string;
}

export interface GeneratedImage {
  id: string;
  type: 'Macro' | 'Catalog' | 'Lifestyle' | 'Model';
  variation: number;
  url: string;
  prompt: string;
}

export interface GenerationState {
  isAnalyzing: boolean;
  isGenerating: boolean;
  analysis: JewelryDetails | null;
  images: GeneratedImage[];
  error: string | null;
}
