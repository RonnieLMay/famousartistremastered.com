import { loadStripe } from '@stripe/stripe-js';

interface PaymentGatewayInterface {
  processPayment: (amount: number) => Promise<void>;
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentGateway: PaymentGatewayInterface = {
  processPayment: async (amount: number) => {
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
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

      const { sessionId, error } = await response.json();
      
      if (error) {
        throw new Error(error);
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Payment processing failed');
    }
  },
};

export default PaymentGateway;