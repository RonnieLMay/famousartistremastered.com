import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { CheckCircle2, Download, Share2, AudioWaveform as WaveformIcon } from "lucide-react";
import { toast } from "sonner";
import AudioControls from "@/components/ui/AudioControls";
import SocialShare from "@/components/ui/SocialShare";
import Waveform from "@/components/ui/Waveform";

interface MasterPageProps {
  processedFile: string | null;
  previewUrl: string | null;
  originalFileName: string;
}

const waveformTypes = [
  { value: "classic", label: "Classic", description: "Traditional waveform display" },
  { value: "bars", label: "Bars", description: "Bar-style visualization" },
  { value: "line", label: "Line", description: "Continuous line visualization" },
  { value: "circle", label: "Circle", description: "Circular waveform display" }
] as const;

const audioFormats = [
  { value: "wav", label: "WAV", description: "Uncompressed audio (best quality)" },
  { value: "mp3", label: "MP3", description: "Compressed audio (smaller size)" },
  { value: "ogg", label: "OGG", description: "Open format compressed audio" },
  { value: "flac", label: "FLAC", description: "Lossless compressed audio" }
] as const;

type WaveformType = typeof waveformTypes[number]["value"];
type AudioFormat = typeof audioFormats[number]["value"];

const MasterPage: React.FC<MasterPageProps> = ({ processedFile, previewUrl, originalFileName }) => {
  const [waveformType, setWaveformType] = useState<WaveformType>("classic");
  const [downloadFormat, setDownloadFormat] = useState<AudioFormat>("wav");

  const handleDownload = async (url: string, filename: string) => {
    try {
      // Add format parameter to the URL
      const downloadUrl = `${url}&format=${downloadFormat}`;
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      
      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = filename.replace(/\.[^/.]+$/, `.${downloadFormat}`); // Replace extension
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(fileUrl);
      toast.success(`Download started in ${downloadFormat.toUpperCase()} format!`);
    } catch (error) {
      toast.error('Failed to download file');
      console.error('Download error:', error);
    }
  };

  return (
    <motion.div
      className="mt-6 space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="glass-panel p-6 rounded-xl space-y-6">
        <div className="flex items-center gap-3 text-green-400">
          <CheckCircle2 className="w-6 h-6" />
          <h3 className="text-xl font-semibold">Mastering Complete!</h3>
        </div>

        <div className="grid w-full items-center gap-4">
          <div>
            <Label htmlFor="waveform" className="text-gray-300">Waveform Style</Label>
            <Select
              value={waveformType}
              onValueChange={(value: WaveformType) => setWaveformType(value)}
            >
              <SelectTrigger className="glass-panel border-none mt-2">
                <SelectValue placeholder="Select waveform style" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border border-blue-500/30 shadow-xl backdrop-blur-xl">
                {waveformTypes.map((type) => (
                  <SelectItem 
                    key={type.value} 
                    value={type.value}
                    className="hover:bg-blue-500/10 focus:bg-blue-500/20 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <WaveformIcon className="w-4 h-4" />
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="format" className="text-gray-300">Download Format</Label>
            <Select
              value={downloadFormat}
              onValueChange={(value: AudioFormat) => setDownloadFormat(value)}
            >
              <SelectTrigger className="glass-panel border-none mt-2">
                <SelectValue placeholder="Select download format" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a2e] border border-blue-500/30 shadow-xl backdrop-blur-xl">
                {audioFormats.map((format) => (
                  <SelectItem 
                    key={format.value} 
                    value={format.value}
                    className="hover:bg-blue-500/10 focus:bg-blue-500/20 cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">{format.label}</span>
                      <span className="text-xs text-gray-400">{format.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {previewUrl && (
            <Waveform 
              audioUrl={previewUrl} 
              type={waveformType}
            />
          )}
          <AudioControls fileUrl={processedFile || ''} />
          
          <Button
            onClick={() => processedFile && handleDownload(
              processedFile, 
              `mastered_${originalFileName}`
            )}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl 
              bg-gradient-to-r from-green-500 to-blue-500 text-white 
              hover:from-green-600 hover:to-blue-600 transition-all duration-300 
              hover-3d neon-border"
          >
            <Download className="w-5 h-5" />
            Download as {downloadFormat.toUpperCase()}
          </Button>
        </div>

        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Share2 className="w-4 h-4" />
            <span className="text-sm">Share your mastered track</span>
          </div>
          <SocialShare fileUrl={processedFile} />
        </div>
      </div>
    </motion.div>
  );
};

export default MasterPage;