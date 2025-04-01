import React from 'react';
import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

interface SocialShareProps {
  fileUrl: string | null;
}

const SocialShare: React.FC<SocialShareProps> = ({ fileUrl }) => {
  const shareUrl = fileUrl || window.location.href;
  const title = "Check out my mastered track!";

  const handleShare = (platform: string) => {
    let url = '';
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl).then(() => {
          toast.success('Link copied to clipboard!');
        }).catch(() => {
          toast.error('Failed to copy link');
        });
        return;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => handleShare('facebook')}
        variant="outline"
        size="icon"
        className="hover:bg-blue-500/20"
      >
        <Facebook className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => handleShare('twitter')}
        variant="outline"
        size="icon"
        className="hover:bg-blue-500/20"
      >
        <Twitter className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => handleShare('copy')}
        variant="outline"
        size="icon"
        className="hover:bg-blue-500/20"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SocialShare;