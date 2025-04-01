import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PaymentGateway = {
  processPayment: async (amount: number): Promise<boolean> => {
    try {
      const stripe = await stripePromise;
      
      if (!stripe) {
        throw new Error('Failed to initialize Stripe');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to cents
          success_url: window.location.href,
          cancel_url: window.location.href,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Payment failed');
      }

      const { sessionId } = await response.json();
      
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  },
};

export default PaymentGateway;