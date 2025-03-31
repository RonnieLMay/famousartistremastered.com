import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ open, onClose }) => {
  const features = [
    'High-quality audio downloads',
    'Unlimited mastering credits',
    'Priority processing',
    'Advanced mastering presets',
    'Email support',
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upgrade to Pro</DialogTitle>
          <DialogDescription>
            Get access to premium features and take your music to the next level
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-900">
            <h3 className="text-2xl font-bold">Pro Plan</h3>
            <div className="mt-2 flex items-baseline">
              <span className="text-3xl font-bold">$19</span>
              <span className="ml-1 text-gray-500">/month</span>
            </div>

            <ul className="mt-6 space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button className="w-full mt-6" onClick={onClose}>
              Start Free Trial
            </Button>
          </div>

          <p className="text-sm text-center text-gray-500">
            No credit card required. Cancel anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;