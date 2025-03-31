import React from 'react';
import { Twitter, Facebook, Linkedin } from 'lucide-react';
import { Button } from './button';

interface SocialShareProps {
  fileUrl: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ fileUrl }) => {
  const shareText = "Check out my mastered track!";
  const encodedUrl = encodeURIComponent(fileUrl);
  const encodedText = encodeURIComponent(shareText);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleShare('twitter')}
        className="hover:bg-blue-500/20"
      >
        <Twitter className="h-5 w-5 text-blue-400" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleShare('facebook')}
        className="hover:bg-blue-500/20"
      >
        <Facebook className="h-5 w-5 text-blue-400" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleShare('linkedin')}
        className="hover:bg-blue-500/20"
      >
        <Linkedin className="h-5 w-5 text-blue-400" />
      </Button>
    </div>
  );
};

export default SocialShare;