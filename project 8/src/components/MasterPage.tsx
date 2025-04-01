import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { CheckCircle2, Download, Share2, AudioWaveform as WaveformIcon, DollarSign } from "lucide-react";
import { toast } from "sonner";
import AudioControls from "@/components/ui/AudioControls";
import SocialShare from "@/components/ui/SocialShare";
import Waveform from "@/components/ui/Waveform";
import { useAuth } from "@/components/ui/AuthSystem";
import { supabase } from "@/lib/supabase";
import { loadStripe } from "@stripe/stripe-js";

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

type WaveformType = typeof waveformTypes[number]["value"];

const MasterPage: React.FC<MasterPageProps> = ({ processedFile, previewUrl, originalFileName }) => {
  const { user } = useAuth();
  const [waveformType, setWaveformType] = useState<WaveformType>("classic");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    if (!user) {
      toast.error("Please sign in to purchase");
      return;
    }

    if (!processedFile) {
      toast.error("No processed file available");
      return;
    }

    setIsProcessing(true);

    try {
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          track_id: processedFile,
          amount: 199,
          status: 'pending'
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          amount: 199,
          success_url: `${window.location.origin}/success?purchase_id=${purchase.id}`,
          cancel_url: window.location.href
        })
      });

      const { sessionId, error } = await response.json();
      if (error) throw new Error(error);

      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
      if (!stripe) throw new Error('Failed to load Stripe');

      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
      if (stripeError) throw stripeError;

    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Failed to process purchase. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (purchaseId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-payment-success`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          purchaseId,
          userId: user?.id
        })
      });

      const { downloadUrl, error } = await response.json();
      if (error) throw new Error(error);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `mastered_${originalFileName}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Your mastered track is ready for download!');
    } catch (error) {
      console.error('Payment success handling error:', error);
      toast.error('Failed to process download. Please contact support.');
    }
  };

  React.useEffect(() => {
    const url = new URL(window.location.href);
    const purchaseId = url.searchParams.get('purchase_id');
    if (purchaseId) {
      handlePaymentSuccess(purchaseId);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

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
        </div>

        <div className="space-y-4">
          {previewUrl && (
            <>
              <Waveform 
                audioUrl={previewUrl}
                type={waveformType}
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
              />
              <AudioControls 
                fileUrl={previewUrl}
                onPlaybackChange={setIsPlaying}
                onTimeUpdate={setCurrentTime}
                onDurationChange={setDuration}
              />
            </>
          )}
          
          <Button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl 
              bg-gradient-to-r from-green-500 to-blue-500 text-white 
              hover:from-green-600 hover:to-blue-600 transition-all duration-300 
              hover-3d neon-border disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Download Mastered Track</span>
                <div className="flex items-center gap-1 ml-2 px-2 py-1 bg-white/10 rounded-full">
                  <DollarSign className="w-4 h-4" />
                  <span>1.99</span>
                </div>
              </>
            )}
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