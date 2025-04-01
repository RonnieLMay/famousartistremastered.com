import React from 'react';
import { Button } from '@/components/ui/button';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface PaymentGatewayProps {
  amount: number;
  onSuccess: (paymentId: string) => void;
  onError: (error: Error) => void;
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  amount,
  onSuccess,
  onError
}) => {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ amount })
      });

      const { clientSecret, error } = await response.json();
      if (error) throw new Error(error);

      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
      if (!stripe) throw new Error('Failed to load Stripe');

      const { error: confirmError } = await stripe.confirmCardPayment(clientSecret);
      if (confirmError) throw confirmError;

      onSuccess(clientSecret);
      toast.success('Payment successful!');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Payment failed');
      onError(err);
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isProcessing}
      className="w-full"
    >
      {isProcessing ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
    </Button>
  );
};

export default PaymentGateway;