import React, { useEffect, useState } from 'react';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { Button } from './button';
import { toast } from 'sonner';

interface PaymentGatewayProps {
  amount: number;
  onSuccess: (paymentId: string) => void;
  onError: (error: Error) => void;
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  amount,
  onSuccess,
  onError,
}) => {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [elements, setElements] = useState<StripeElements | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initStripe = async () => {
      try {
        const stripeInstance = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
        if (!stripeInstance) {
          throw new Error('Failed to load Stripe');
        }
        setStripe(stripeInstance);
      } catch (error) {
        console.error('Error initializing Stripe:', error);
        onError(error instanceof Error ? error : new Error('Failed to initialize payment'));
      }
    };

    initStripe();
  }, [onError]);

  const handlePayment = async () => {
    if (!stripe) {
      toast.error('Payment system not initialized');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      const { clientSecret } = await response.json();

      const result = await stripe.confirmCardPayment(clientSecret);

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.paymentIntent?.status === 'succeeded') {
        onSuccess(result.paymentIntent.id);
      }
    } catch (error) {
      console.error('Payment error:', error);
      onError(error instanceof Error ? error : new Error('Payment failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Button
        onClick={handlePayment}
        disabled={!stripe || loading}
        className="w-full"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          `Pay $${(amount / 100).toFixed(2)}`
        )}
      </Button>
    </div>
  );
};

export default PaymentGateway;