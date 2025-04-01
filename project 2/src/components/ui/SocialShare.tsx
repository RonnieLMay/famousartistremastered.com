import React from 'react';
import { Button } from "@/components/ui/button";
import { Twitter, Facebook, Link as LinkIcon } from "lucide-react";
import { toast } from 'sonner';

interface SocialShareProps {
  fileUrl: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ fileUrl }) => {
  const shareText = "Check out my mastered track!";
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(fileUrl);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fileUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => window.open(
          `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
          '_blank'
        )}
        className="hover:bg-blue-500/10"
      >
        <Twitter className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
          '_blank'
        )}
        className="hover:bg-blue-500/10"
      >
        <Facebook className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleCopyLink}
        className="hover:bg-blue-500/10"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SocialShare;