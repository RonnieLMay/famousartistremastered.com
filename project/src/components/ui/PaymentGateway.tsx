import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PaymentResult {
  success: boolean;
  error?: string;
}

const PaymentGateway = {
  async processPayment(amount: number): Promise<boolean> {
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ 
          amount: Math.round(amount * 100) // Convert to cents
        }),
      });

      const { clientSecret, error } = await response.json();
      if (error) throw new Error(error);

      const { error: stripeError } = await stripe.confirmCardPayment(clientSecret);
      if (stripeError) throw new Error(stripeError.message);

      return true;
    } catch (err) {
      console.error('Payment failed:', err);
      return false;
    }
  }
};

export default PaymentGateway;