import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, Upload, Hash } from 'lucide-react';
import { cn } from '../lib/utils';

interface UploadSectionProps {
  onUpload: (file: File, code: string) => void;
  isLoading: boolean;
  code: string;
  setCode: (code: string) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onUpload, isLoading, code, setCode }) => {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    multiple: false,
    disabled: isLoading,
    noClick: !!selectedFile // Disable click if file is already selected so we can use buttons
  } as any);

  const handleProcess = () => {
    if (selectedFile) {
      onUpload(selectedFile, code);
    }
  };

  return (
    <div className="w-full space-y-8">
      <div className="text-[10px] uppercase tracking-[3px] text-text-muted mb-8 font-semibold">Project Initiation</div>
      
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={cn(
            "relative h-[240px] border border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer group bg-gold/[0.02]",
            isDragActive ? "border-gold bg-gold/10 scale-[1.01]" : "border-gold group-hover:bg-gold/[0.05]",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center relative z-10">
            <div className="w-12 h-12 rounded-full border border-gold flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
              <Camera className="text-gold" size={20} />
            </div>
            <p className="text-sm text-zinc-300 font-sans">Upload Original Shot</p>
            <p className="text-[10px] text-text-muted mt-1 uppercase tracking-wider">PNG, JPG up to 50MB</p>
          </div>
        </div>
      ) : (
        <div className="relative h-[240px] border border-white/10 rounded-xl overflow-hidden group">
          <img src={URL.createObjectURL(selectedFile)} className="w-full h-full object-cover grayscale brightness-50" />
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
            <div className="px-4 py-2 bg-black/60 rounded-full border border-white/10 text-[10px] uppercase tracking-widest">
              {selectedFile.name}
            </div>
            {!isLoading && (
              <button 
                onClick={() => setSelectedFile(null)}
                className="text-gold text-[10px] uppercase tracking-[2px] hover:underline"
              >
                Change Photo
              </button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[2px] text-text-muted block font-semibold">
          Product Identity Code
        </label>
        <div className="relative">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. JW-901"
            className="w-full bg-zinc border border-[#333] text-white px-4 py-[14px] rounded-lg focus:border-gold outline-none transition-all placeholder:text-white/20 font-sans text-sm"
          />
        </div>
      </div>

      <button 
        onClick={handleProcess}
        disabled={!selectedFile || !code || isLoading}
        className={cn(
          "w-full bg-gold text-ink font-bold py-[18px] rounded-lg uppercase tracking-[2px] transition-all hover:bg-white hover:text-ink active:scale-[0.98]",
          (!selectedFile || !code || isLoading) && "opacity-50 pointer-events-none"
        )}
      >
        {isLoading ? "Processing..." : "Process 8K Suite"}
      </button>
    </div>
  );
};
