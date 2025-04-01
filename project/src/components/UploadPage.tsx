import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { toast } from "sonner";
import MasterPage from "./MasterPage";

interface UploadState {
  selectedFile: File | null;
  uploading: boolean;
  progress: number;
  message: string;
  processedFile: string | null;
  previewUrl: string | null;
  preset: string;
}

interface MasteringPreset {
  value: string;
  label: string;
  description: string;
}

const masteringPresets: MasteringPreset[] = [
  { value: "studio-warmth", label: "Studio Warmth", description: "Classic analog warmth with subtle harmonics" },
  { value: "edm-boost", label: "EDM Boost", description: "Punchy bass and crisp highs for electronic music" },
  { value: "vintage-vinyl", label: "Vintage Vinyl", description: "Authentic vinyl character and warmth" },
  { value: "hip-hop-punch", label: "Hip-Hop Punch", description: "Deep bass and tight dynamics for hip-hop" },
  { value: "rock-edge", label: "Rock Edge", description: "Aggressive mids and dynamic presence" },
  { value: "jazz-finesse", label: "Jazz Finesse", description: "Subtle compression and natural dynamics" },
  { value: "classical-clarity", label: "Classical Clarity", description: "Pristine detail and wide dynamics" },
  { value: "pop-polish", label: "Pop Polish", description: "Radio-ready brightness and punch" },
  { value: "ambient-space", label: "Ambient Space", description: "Wide stereo field and subtle enhancement" },
  { value: "metal-crush", label: "Metal Crush", description: "Maximum impact and aggressive limiting" },
  { value: "acoustic-natural", label: "Acoustic Natural", description: "Transparent mastering for acoustic instruments" },
  { value: "lofi-texture", label: "Lo-Fi Texture", description: "Vintage character with subtle imperfections" },
  { value: "cinematic-epic", label: "Cinematic Epic", description: "Wide, dramatic sound for film music" },
  { value: "future-bass", label: "Future Bass", description: "Modern bass enhancement and sidechaining" },
  { value: "reggae-groove", label: "Reggae Groove", description: "Warm bass and smooth midrange" }
];

const UploadPage: React.FC = () => {
  const [state, setState] = useState<UploadState>({
    selectedFile: null,
    uploading: false,
    progress: 0,
    message: "",
    processedFile: null,
    previewUrl: null,
    preset: "studio-warmth"
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setState(prev => ({
        ...prev,
        selectedFile: event.target.files![0],
        message: "",
        progress: 0,
        processedFile: null,
        previewUrl: null
      }));
    }
  };

  const handleUpload = async () => {
    if (!state.selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setState(prev => ({ ...prev, uploading: true }));
    const formData = new FormData();
    formData.append("file", state.selectedFile);
    formData.append("preset", state.preset);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload`, {
        method: "POST",
        body: formData,
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      const result = await response.json();
      if (response.ok) {
        setState(prev => ({
          ...prev,
          message: "File processed successfully!",
          processedFile: result.processed_url,
          previewUrl: result.preview_url
        }));
        toast.success("Track mastered successfully!");
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error processing track");
      setState(prev => ({
        ...prev,
        message: "Error uploading file. Please try again."
      }));
    } finally {
      setState(prev => ({ ...prev, uploading: false }));
    }
  };

  const selectedPreset = masteringPresets.find(preset => preset.value === state.preset);

  return (
    <div className="relative min-h-screen bg-[#050816] cyber-grid overflow-hidden flex flex-col justify-center items-center p-6">
      {/* Background animations */}
      <div className="absolute inset-0 w-full h-full">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            top: "10%",
            left: "20%",
          }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            bottom: "20%",
            right: "15%",
          }}
        />
      </div>

      <motion.div
        className="glass-panel rounded-2xl p-8 max-w-2xl w-full mx-auto relative z-10 transform-3d"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1 
          className="text-4xl font-bold mb-6 text-center neon-text bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Upload Your Track
        </motion.h1>

        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="preset" className="text-gray-300">Mastering Style</Label>
            <Select
              value={state.preset}
              onValueChange={(value) => setState(prev => ({ ...prev, preset: value }))}
            >
              <SelectTrigger className="glass-panel border-none">
                <SelectValue placeholder="Select a preset" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] bg-[#1a1a2e] border border-blue-500/30 shadow-xl backdrop-blur-xl">
                {masteringPresets.map((preset) => (
                  <SelectItem 
                    key={preset.value} 
                    value={preset.value}
                    className="hover:bg-blue-500/10 focus:bg-blue-500/20 cursor-pointer"
                  >
                    <div className="flex flex-col py-2">
                      <span className="font-semibold text-blue-400">{preset.label}</span>
                      <span className="text-xs text-gray-400">{preset.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="audio-upload" className="text-gray-300">Choose audio file</Label>
            <Input
              id="audio-upload"
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              disabled={state.uploading}
              className="glass-panel border-none cursor-pointer file:mr-4 file:py-2 file:px-4 
                file:rounded-full file:border-0 file:text-sm file:font-semibold 
                file:bg-blue-500 file:text-white hover:file:bg-blue-400
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {state.selectedFile && (
            <motion.div
              className="text-sm text-blue-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              Selected file: {state.selectedFile.name}
            </motion.div>
          )}

          <Button
            onClick={handleUpload}
            className="w-full hover-3d bg-gradient-to-r from-blue-500 to-purple-500 
              hover:from-blue-600 hover:to-purple-600 text-white shadow-lg neon-border
              disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!state.selectedFile || state.uploading}
          >
            {state.uploading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing... {state.progress}%
              </div>
            ) : (
              "Start Mastering"
            )}
          </Button>

          {state.processedFile && (
            <MasterPage
              processedFile={state.processedFile}
              previewUrl={state.previewUrl}
              originalFileName={state.selectedFile?.name || 'track'}
            />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UploadPage;