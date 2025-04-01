import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Twitter, Facebook, Link as LinkIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SocialShareProps {
  fileUrl: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ fileUrl }) => {
  const shareText = 'Check out my newly mastered track!';
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(fileUrl);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fileUrl);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="mt-4">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank')}>
          <Twitter className="h-4 w-4 mr-2" />
          Share on Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank')}>
          <Facebook className="h-4 w-4 mr-2" />
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink}>
          <LinkIcon className="h-4 w-4 mr-2" />
          Copy Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SocialShare;