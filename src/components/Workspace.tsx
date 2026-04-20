import React, { useState, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Fingerprint, 
  Plus, 
  X, 
  ChevronRight,
  Download,
  Maximize2,
  RefreshCcw,
  Zap
} from 'lucide-react';
import { analyzeJewelry, generateJewelryImage } from '../services/gemini';
import { GenerationState, JewelryDetails, GeneratedImage } from '../types';
import { KayaaLogo } from './KayaaLogo';

export function Workspace() {
  const [productCode, setProductCode] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [state, setState] = useState<GenerationState>({
    isAnalyzing: false,
    isGenerating: false,
    analysis: null,
    images: [],
    error: null
  });

  const onDrop = (acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: false
  } as any);

  const startProcessing = async () => {
    if (!preview || !productCode) return;

    setState(prev => ({ 
      ...prev, 
      isAnalyzing: true, 
      error: null,
      images: [],
      analysis: null
    }));

    try {
      // 1. Analysis
      const details = await analyzeJewelry(preview);
      setState(prev => ({ ...prev, isAnalyzing: false, analysis: details, isGenerating: true }));

      // 2. Parallel Generation for 2 variations per Type
      const baseTypes: ('Macro' | 'Catalog' | 'Lifestyle' | 'Model')[] = ['Macro', 'Catalog', 'Lifestyle', 'Model'];
      
      const generationTasks: { type: typeof baseTypes[number]; variation: number }[] = [];
      baseTypes.forEach(type => {
        generationTasks.push({ type, variation: 1 });
        generationTasks.push({ type, variation: 2 });
      });

      const generationPromises = generationTasks.map(async ({ type, variation }) => {
        try {
          const url = await generateJewelryImage(details, type, preview, variation);
          
          const newImg: GeneratedImage = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            url,
            prompt: `${type} - Var ${variation}`
          };
          setState(prev => ({ ...prev, images: [...prev.images, newImg] }));
          return newImg;
        } catch (err: any) {
          console.error(`Failed to generate ${type} variation ${variation}:`, err);
          return null;
        }
      });

      await Promise.all(generationPromises);
      
      setState(prev => ({ ...prev, isGenerating: false }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isAnalyzing: false, 
        isGenerating: false, 
        error: err.message || "An unexpected error occurred in the studio pipeline." 
      }));
    }
  };

  const handleDownload = async (url: string, type: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error("Failed to load image for download"));
    });

    // We assume the generated image is 1024x1024 (1K) or similar based on gemini service
    // Ensure canvas is high resolution
    const size = img.naturalWidth || 1024;
    canvas.width = size;
    canvas.height = size;

    // Wait for fonts to be ready
    try {
      await document.fonts.load('bold 14px "Playfair Display"');
      await document.fonts.load('bold 7px "Inter"');
    } catch (e) {
      console.warn("Fonts not loaded for canvas download, falling back to system fonts");
    }

    // Draw main image
    ctx.drawImage(img, 0, 0, size, size);

    // Padding relative to image size
    const padding = size * 0.05;

    // --- DRAW LOGO (Top Left) ---
    const logoBaseWidth = size * 0.18;
    const logoHeight = logoBaseWidth * 0.6;
    
    // Logo Container (White box)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    // Rounded corners for the logo box
    const radius = 4;
    ctx.roundRect(padding, padding, logoBaseWidth, logoHeight, radius);
    ctx.fill();
    
    // "KAYAA" Text
    ctx.fillStyle = '#050505';
    ctx.textAlign = 'center';
    ctx.font = `bold ${logoBaseWidth * 0.22}px "Playfair Display", serif`;
    ctx.fillText('KAYAA', padding + logoBaseWidth/2, padding + logoHeight * 0.45);
    
    // Separator line
    ctx.strokeStyle = 'rgba(5, 5, 5, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding + logoBaseWidth * 0.15, padding + logoHeight * 0.6);
    ctx.lineTo(padding + logoBaseWidth * 0.85, padding + logoHeight * 0.6);
    ctx.stroke();
    
    // "CLOTHING" Text
    ctx.font = `bold ${logoBaseWidth * 0.08}px "Inter", sans-serif`;
    ctx.letterSpacing = '2px';
    ctx.fillText('CLOTHING', padding + logoBaseWidth/2, padding + logoHeight * 0.82);
    ctx.letterSpacing = '0px';

    // --- DRAW STYLE BADGE (Top Right) ---
    const badgeText = `${type.toUpperCase()} VIEW`;
    ctx.font = `bold ${size * 0.02}px "Inter", sans-serif`;
    const badgeMetrics = ctx.measureText(badgeText);
    const badgeW = badgeMetrics.width + 24;
    const badgeH = size * 0.04;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.beginPath();
    ctx.roundRect(size - badgeW - padding, padding, badgeW, badgeH, badgeH/2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.textAlign = 'center';
    ctx.fillText(badgeText, size - badgeW/2 - padding, padding + badgeH * 0.65);

    // --- DRAW PRODUCT CODE (Bottom Left) ---
    // Background gradient for legibility
    const grad = ctx.createLinearGradient(0, size, 0, size * 0.8);
    grad.addColorStop(0, 'rgba(0,0,0,0.4)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, size * 0.8, size, size * 0.2);

    // 8K Badge
    const badge8kX = padding;
    const badge8kY = size - padding - size * 0.06;
    ctx.fillStyle = '#D4AF37'; // Gold
    ctx.beginPath();
    ctx.roundRect(badge8kX, badge8kY, size * 0.08, size * 0.025, 2);
    ctx.fill();
    ctx.fillStyle = '#1A1A1A';
    ctx.font = `black ${size * 0.015}px "Inter", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('8K UHD', badge8kX + size * 0.04, badge8kY + size * 0.018);

    // Model Number
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.font = `italic ${size * 0.06}px "Playfair Display", serif`;
    ctx.fillText(productCode, padding, size - padding);

    // Trigger download
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png', 1.0);
    link.download = `KAYAA-${productCode}-${type}.png`;
    link.click();
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setProductCode('');
    setState({
      isAnalyzing: false,
      isGenerating: false,
      analysis: null,
      images: [],
      error: null
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[450px,1fr] gap-12 p-12 pt-32 min-h-screen max-w-[1800px] mx-auto">
      {/* Sidebar: Inputs & Analysis */}
      <div className="space-y-10">
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Fingerprint className="w-4 h-4 text-gold" />
            <h2 className="text-[12px] uppercase tracking-[4px] font-bold text-white/80">Asset Identity</h2>
          </div>
          <input 
            type="text" 
            placeholder="ENTER MODEL NUMBER (e.g. KY-882)"
            value={productCode}
            onChange={(e) => setProductCode(e.target.value.toUpperCase())}
            className="w-full bg-zinc border border-white/5 rounded-xl px-6 py-4 font-serif italic text-lg tracking-wide placeholder:text-white/10 focus:border-gold/30 focus:outline-none transition-all"
          />
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-gold" />
              <h2 className="text-[12px] uppercase tracking-[4px] font-bold text-white/80">Source Capture</h2>
            </div>
            {preview && (
              <button onClick={reset} className="text-[10px] uppercase tracking-widest text-white/30 hover:text-red-400 transition-colors flex items-center gap-1">
                Clear Session <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {!preview ? (
            <div 
              {...getRootProps()} 
              className={`
                aspect-square rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-12 transition-all cursor-pointer
                ${isDragActive ? 'border-gold bg-gold/5' : 'border-white/10 bg-white/[0.02] hover:border-white/20'}
              `}
            >
              <input {...getInputProps()} />
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <Upload className="w-8 h-8 text-white/20" />
              </div>
              <p className="text-[11px] uppercase tracking-[3px] text-white/40 font-bold mb-2">Drop Raw Asset</p>
              <p className="text-[10px] text-white/20 font-medium">8K SOURCE RECOMMENDED</p>
            </div>
          ) : (
            <div className="relative group aspect-square rounded-3xl overflow-hidden border border-white/10">
              <img src={preview} alt="Source" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={() => setPreview(null)}
                  className="px-6 py-3 bg-white text-ink uppercase tracking-widest font-black text-[10px] transform translate-y-4 group-hover:translate-y-0 transition-transform"
                >
                  Change Photo
                </button>
              </div>
            </div>
          )}

          <button 
            disabled={!preview || !productCode || state.isAnalyzing || state.isGenerating}
            onClick={startProcessing}
            className={`
              w-full py-5 rounded-2xl flex items-center justify-center gap-4 transition-all overflow-hidden relative
              ${(!preview || !productCode) ? 'bg-white/5 text-white/20 cursor-not-allowed opacity-50' : 'bg-gold text-ink hover:scale-[1.02] active:scale-95'}
            `}
          >
            <AnimatePresence mode="wait">
              {state.isAnalyzing || state.isGenerating ? (
                <motion.div 
                  key="loader"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center gap-3"
                >
                  <RefreshCcw className="w-5 h-5 animate-spin" />
                  <span className="text-[12px] font-black uppercase tracking-[4px]">
                    {state.isAnalyzing ? 'Scanning DNA...' : 'Minting 8K Assets...'}
                  </span>
                </motion.div>
              ) : (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center gap-3"
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="text-[12px] font-black uppercase tracking-[4px]">Process 8K Suite</span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </section>

        {/* Technical Data / Analysis */}
        <AnimatePresence>
          {state.analysis && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 p-8 glass-card border-gold/10"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] uppercase tracking-[4px] font-bold text-gold">Gemini Analysis Report</h3>
                <Zap className="w-3 h-3 text-gold fill-gold" />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[9px] uppercase tracking-wider text-white/30">Metal Basis</p>
                  <p className="font-serif italic text-lg">{state.analysis.metal}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] uppercase tracking-wider text-white/30">Design Style</p>
                  <p className="font-serif italic text-lg">{state.analysis.style}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] uppercase tracking-wider text-white/30">Optical Cut</p>
                  <p className="font-serif italic text-lg">{state.analysis.cut}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] uppercase tracking-wider text-white/30">Primary Stones</p>
                  <p className="font-serif italic text-sm">{state.analysis.stones.join(', ')}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <p className="text-[9px] uppercase tracking-wider text-white/30 mb-2">Artist Notes</p>
                <p className="text-white/60 text-xs leading-relaxed italic">"{state.analysis.description}"</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {state.error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col gap-3"
          >
            <div className="flex items-center gap-2 text-red-400">
              <X className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-[3px] font-bold">Studio Error</span>
            </div>
            <p className="text-xs text-red-300 opacity-80 leading-relaxed">{state.error}</p>
            <button onClick={reset} className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors text-left w-fit underline underline-offset-4">
              Return to Atelier
            </button>
          </motion.div>
        )}
      </div>

      {/* Main Grid: Results */}
      <div className="space-y-10">
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <div>
            <h1 className="text-4xl font-serif mb-2 tracking-tight">Suite Results</h1>
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-[3px] text-white/40 font-bold">Mode: Professional Rendering</span>
              {state.isGenerating && (
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                  <span className="text-[10px] uppercase tracking-[3px] text-gold font-bold">Live Generation</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-4">
             <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Project</p>
                <p className="text-xs font-mono text-white/60">{productCode || 'UNTITLED_992'}</p>
             </div>
          </div>
        </div>

        {!state.isAnalyzing && !state.isGenerating && state.images.length === 0 && !state.error && (
          <div className="h-[60vh] flex flex-col items-center justify-center space-y-4 opacity-10">
            <Sparkles className="w-16 h-16" />
            <p className="text-[12px] uppercase tracking-[6px] font-bold">Awaiting Initialization</p>
          </div>
        )}

        {/* Asset Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
          <AnimatePresence>
            {state.images.map((img) => (
              <motion.div 
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative bg-zinc border border-white/5 rounded-3xl overflow-hidden aspect-square"
              >
                {/* Image Overlay UI */}
                <div className="absolute inset-0 z-10 transition-colors pointer-events-none group-hover:bg-ink/40" />
                
                {/* 1. Kayaa Logo (Top Left) */}
                <div className="absolute top-6 left-6 z-20">
                  <KayaaLogo variant="overlay" className="opacity-90 scale-90" />
                </div>

                {/* 2. Style Badge (Top Right) */}
                <div className="absolute top-6 right-6 z-20 px-3 py-1 bg-black/80 backdrop-blur-md rounded-full border border-white/10">
                  <span className="text-[8px] uppercase tracking-[2px] text-white/60 font-bold">{img.type} View #{img.prompt.split('Var ')[1] || '1'}</span>
                </div>

                {/* 3. Product Code (Bottom Left) */}
                <div className="absolute bottom-6 left-6 z-20 space-y-1">
                  <div className="flex items-center gap-2">
                     <span className="px-1.5 py-0.5 bg-gold text-ink text-[7px] font-black leading-none rounded-[2px] uppercase">Original</span>
                     <div className="w-1 h-1 rounded-full bg-white/20" />
                     <span className="text-[8px] uppercase tracking-[1px] text-white/40 font-bold font-mono">8K UHD</span>
                  </div>
                  <p className="font-serif italic text-2xl text-white tracking-wide">{productCode}</p>
                </div>

                {/* Main Content */}
                <img src={img.url} alt={img.type} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />

                {/* Hover Actions */}
                <div className="absolute inset-0 z-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 bg-ink/60">
                  <button 
                    onClick={() => handleDownload(img.url, img.type)}
                    className="w-12 h-12 rounded-full bg-white text-ink flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                    title="Download Asset"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center border border-white/20 hover:scale-110 active:scale-95 transition-transform">
                    <Maximize2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}

            {(state.isAnalyzing || state.isGenerating) && Array.from({ length: 4 - state.images.length }).map((_, i) => (
              <div key={`loader-${i}`} className="aspect-square bg-white/[0.02] border border-white/5 rounded-3xl animate-pulse flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                <p className="text-[10px] uppercase tracking-[4px] text-white/20 font-bold">Developing Asset...</p>
              </div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
