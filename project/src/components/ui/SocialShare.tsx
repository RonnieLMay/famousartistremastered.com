import React from 'react';
import { Button } from './button';
import { Facebook, Twitter, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialShareProps {
  fileUrl: string | null;
}

const SocialShare: React.FC<SocialShareProps> = ({ fileUrl }) => {
  const { toast } = useToast();

  const handleShare = (platform: string) => {
    if (!fileUrl) return;

    const shareUrl = encodeURIComponent(fileUrl);
    const text = encodeURIComponent('Check out my mastered track!');

    let url = '';
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${text}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(fileUrl).then(() => {
          toast({
            title: 'Link copied!',
            description: 'The link has been copied to your clipboard.',
          });
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
        variant="outline"
        size="icon"
        onClick={() => handleShare('facebook')}
        disabled={!fileUrl}
      >
        <Facebook className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleShare('twitter')}
        disabled={!fileUrl}
      >
        <Twitter className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleShare('copy')}
        disabled={!fileUrl}
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SocialShare;